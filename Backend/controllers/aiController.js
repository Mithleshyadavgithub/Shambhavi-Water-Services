const { processMessage } = require('../ai/agent');
const AuditLog = require('../models/AuditLog');
const Customer = require('../models/Customer');

// In-memory session storage (in production, use Redis)
const sessions = new Map();

// @POST /api/ai/chat
exports.chat = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // Get or create session
    const sid = sessionId || `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    let session = sessions.get(sid) || {
      history: [],
      customerId: null,
      pendingCart: null,
    };

    // Resolve customer from logged-in user
    let customerId = session.customerId;
    let customerName = 'Customer';
    if (req.user && !customerId) {
      const customer = await Customer.findOne({ _id: req.user.customerId }).select('_id name');
      if (customer) {
        customerId = customer._id.toString();
        customerName = customer.name;
        session.customerId = customerId;
      }
    }

    const context = {
      customerId,
      customerName,
      sessionId: sid,
      pendingCart: session.pendingCart,
    };

    // Process message through AI agent
    const result = await processMessage(message, session.history, context);

    // Update session history
    session.history.push({ role: 'user', parts: [{ text: message }] });
    session.history.push({ role: 'model', parts: [{ text: result.response }] });

    // Keep history manageable
    if (session.history.length > 20) session.history = session.history.slice(-20);

    // Update pending cart if present
    if (result.pendingCart) session.pendingCart = result.pendingCart;
    sessions.set(sid, session);

    // Log AI recommendation to audit trail
    if (result.type === 'PAYMENT_READY' && result.orderId && customerId) {
      await AuditLog.create({
        action: 'AI_RECOMMENDATION',
        actor: 'AI_AGENT',
        customerId,
        orderId: result.orderId,
        amount: result.amount,
        reason: `AI agent created pending order via conversational checkout. Session: ${sid}`,
        approval: 'CUSTOMER_CONFIRMED',
        status: 'PENDING',
        metadata: { sessionId: sid, engine: result.engine, toolCalls: result.toolCalls?.length },
      }).catch(() => {}); // non-blocking
    }

    res.json({
      success: true,
      sessionId: sid,
      response: result.response,
      type: result.type || 'text',
      orderId: result.orderId || null,
      amount: result.amount || null,
      data: result.data || null,
      suggestions: result.suggestions || [],
      actions: result.actions || [],
      toolCalls: result.toolCalls?.map(t => ({ tool: t.tool, success: !t.result?.error })) || [],
      engine: result.engine,
    });
  } catch (err) {
    console.error('AI Chat error:', err);
    res.status(500).json({
      success: false,
      message: 'AI service error',
      response: "I'm having trouble processing that right now. Please try again or contact our team directly.",
    });
  }
};

// @GET /api/ai/health
exports.health = async (req, res) => {
  const hasGemini = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'REPLACE_ME';
  res.json({
    success: true,
    engine: hasGemini ? 'gemini-1.5-flash' : 'rule-based',
    status: 'operational',
    tools: [
      'searchProducts',
      'getProduct',
      'checkStock',
      'calculateCart',
      'getCustomerProfile',
      'createPendingOrder',
      'getUpsellRecommendations',
      'getCrossSellRecommendations',
      'exploreServices',
      'getSiteNavigation',
      'calculateWaterRequirement',
      'trackOrderStatus',
      'getWaterQualitySpecs',
      'getServiceAreas',
      'getSubscriptionPlans',
    ],
  });
};
