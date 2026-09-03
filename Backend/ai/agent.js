/**
 * Shambhavi AI — Commerce & Platform Assistant
 * Powered by Google Gemini with function calling + Deterministic Rule Engine.
 * Supports complete service exploration, page navigation, water calculator,
 * product catalog, order tracking, and conversational checkout.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const tools = require('./tools');

// System prompt — the AI's identity and instructions
const SYSTEM_PROMPT = `You are Shambhavi AI, the intelligent and friendly virtual guide & commerce assistant for Shambhavi Water Services in Lucknow.

Your role:
1. Help new visitors explore all services (Doorstep water delivery, Subscriptions, Live GPS order tracking, Hydration health tracker, 8-Stage RO+UV purity standards, Dispenser stands/accessories, 24/7 Grievance support).
2. Guide users with direct page navigation links (e.g. /products, /order, /track, /tracker, /about, /contact, /feedback, /portal, /portal/orders, /portal/payments, /portal/complaints).
3. Calculate water requirements for households and offices (liters per day, 20L jars per month, subscription savings).
4. Answer water purity, TDS (100-150 ppm), and quality certification questions.
5. Provide delivery areas and turnaround time info in Lucknow (Gomti Nagar, Karbala Bazar, Indira Nagar, Hazratganj, etc.).
6. Recommend products & subscription plans conversationally and assist in placing orders with Razorpay.
7. ACT AS AN UPSELL/CROSS-SELL AGENT: Whenever a user orders an item, proactively suggest related accessories (like a dispenser pump) or a subscription plan to increase the merchant's revenue.

Important rules:
- ALWAYS use tools to get real data — never invent prices, stock, or order details.
- ALWAYS use calculateCart before quoting a final price for orders.
- ALWAYS get customer confirmation before calling createPendingOrder.
- Be warm, concise, and structured. Use bullet points and emojis.
- Use ₹ for Indian Rupee amounts.

Special Response Formats:
When creating a pending order with createPendingOrder:
{
  "type": "PAYMENT_READY",
  "orderId": "<order id>",
  "amount": <amount in rupees>,
  "message": "Your order is ready! Click below to pay securely."
}

For normal conversational responses, respond in clear, helpful markdown.`;

let genAI = null;

function getGemini() {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'REPLACE_ME') {
      return null;
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
}

/**
 * Execute a tool call
 */
async function executeTool(toolName, args) {
  const toolFn = tools[toolName];
  if (!toolFn || typeof toolFn !== 'function') {
    return { error: `Unknown tool: ${toolName}` };
  }
  try {
    return await toolFn(args || {});
  } catch (err) {
    return { error: `Tool ${toolName} failed: ${err.message}` };
  }
}

/**
 * Main agent function — processes a user message and returns a response.
 */
async function processMessage(userMessage, conversationHistory = [], context = {}) {
  const sessionId = context.sessionId || `sess_${Date.now()}`;
  const gemini = getGemini();

  // Use Gemini if API key is provided
  if (gemini) {
    return await processWithGemini(gemini, userMessage, conversationHistory, context, sessionId);
  }

  // Use rich Rule-Based Engine
  return await processWithRuleEngine(userMessage, context, sessionId);
}

/**
 * Gemini-powered agent with function calling
 */
async function processWithGemini(gemini, userMessage, conversationHistory, context, sessionId) {
  const model = gemini.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: SYSTEM_PROMPT,
    tools: [{ functionDeclarations: tools.TOOL_DEFINITIONS }],
  });

  let messages = [...conversationHistory];
  if (context.customerId && messages.length === 0) {
    messages.push({
      role: 'user',
      parts: [{ text: `[SYSTEM: Customer ID is ${context.customerId}, name is ${context.customerName || 'Customer'}]` }],
    });
    messages.push({
      role: 'model',
      parts: [{ text: `Hello ${context.customerName || 'there'}! Welcome to Shambhavi Water Services. How can I help you explore our services today? 💧` }],
    });
  }

  messages.push({ role: 'user', parts: [{ text: userMessage }] });

  const toolCallsLog = [];
  let finalText = '';
  let maxIterations = 6;
  let responseData = null;
  let responseType = 'text';

  const chat = model.startChat({ history: messages.slice(0, -1) });
  let result = await chat.sendMessage(userMessage);

  while (maxIterations-- > 0) {
    const response = result.response;
    const candidate = response.candidates?.[0];
    if (!candidate) break;

    const functionCalls = candidate.content?.parts?.filter(p => p.functionCall);
    if (!functionCalls || functionCalls.length === 0) {
      finalText = response.text();
      break;
    }

    const functionResponses = [];
    for (const part of functionCalls) {
      const { name, args } = part.functionCall;
      if (name === 'createPendingOrder') args.agentSessionId = sessionId;
      if (name === 'getCustomerProfile' && context.customerId && !args.customerId) {
        args.customerId = context.customerId;
      }

      const toolResult = await executeTool(name, args);
      toolCallsLog.push({ tool: name, args, result: toolResult });

      if (name === 'exploreServices') {
        responseType = 'SERVICE_EXPLORER';
        responseData = toolResult;
      } else if (name === 'calculateWaterRequirement') {
        responseType = 'WATER_CALCULATOR_RESULT';
        responseData = toolResult;
      } else if (name === 'trackOrderStatus' && toolResult.success) {
        responseType = 'TRACK_ORDER_RESULT';
        responseData = toolResult;
      }

      functionResponses.push({
        functionResponse: { name, response: toolResult },
      });
    }

    result = await chat.sendMessage(functionResponses);
  }

  let orderId = null;
  let amount = null;

  try {
    if (finalText.includes('"type": "PAYMENT_READY"') || finalText.includes('"PAYMENT_READY"')) {
      const jsonMatch = finalText.match(/\{[\s\S]*?"PAYMENT_READY"[\s\S]*?\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        responseType = 'PAYMENT_READY';
        orderId = parsed.orderId;
        amount = parsed.amount;
        finalText = parsed.message || 'Your order is ready! Click below to pay.';
      }
    }
  } catch (_) {}

  const pendingOrderTool = toolCallsLog.find(t => t.tool === 'createPendingOrder' && t.result?.success);
  if (pendingOrderTool && responseType !== 'PAYMENT_READY') {
    responseType = 'PAYMENT_READY';
    orderId = pendingOrderTool.result.orderId;
    amount = pendingOrderTool.result.totalAmount;
  }

  return {
    response: finalText,
    type: responseType,
    orderId,
    amount,
    data: responseData,
    toolCalls: toolCallsLog,
    sessionId,
    engine: 'gemini',
  };
}

/**
 * High-performance Rule-Based Engine
 * Full coverage for service exploration, page navigation, water calculation,
 * order tracking, water purity, delivery areas, catalog, checkout, complaints,
 * payments, invoices, subscriptions, hydration tracker, and 24/7 support.
 */
async function processWithRuleEngine(userMessage, context, sessionId) {
  const msg = userMessage.toLowerCase().trim();
  const toolCalls = [];

  // 1. GREETING
  if (/^(hi|hello|hey|namaste|hii|helo|greetings|hola|kya hal hai|shuru karo)\b/i.test(msg) && msg.length < 25) {
    return {
      response: `Hey ${context.customerName || 'there'}! 🌟 Welcome to **Shambhavi Water Services** — Lucknow's fastest and freshest water delivery! 💧\n\nI'm your **Friendly AI Guide**, here to help you order our pure drinking water:\n\n• 📦 **Our Products & Pricing**:\n  - **1L Bottle**: ₹10 per unit\n  - **2L Bottle**: ₹20 per unit\n  - **18L Can**: ₹40 per unit\n  - **20L Can**: ₹40 per unit\n• 🧮 **Water Calculator**: Tell me how many people you have to calculate your daily jars!\n• 🚚 **Fast Delivery**: 2–4 hour delivery right to your doorstep in Lucknow.\n• 💎 **8-Stage RO+UV Purity**: 100% safe, mineral-balanced water.\n\nWhich product can I deliver to you today? 😊`,
      type: 'text',
      toolCalls: [],
      sessionId,
      engine: 'rule-based',
    };
  }

  // 2. ORDER CONFIRMATION
  if (/\b(yes|confirm|go ahead|place|proceed|ok|okay|sure|kardo|haa|haan)\b/.test(msg) && context.pendingCart) {
    const { product, qty, cart } = context.pendingCart;
    const order = await executeTool('createPendingOrder', {
      customerId: context.customerId,
      items: [{ productId: product.id, name: product.name, quantity: qty, price: product.price, lineTotal: cart.total }],
      totalAmount: cart.total,
      aiReason: `Customer confirmed ${qty} × ${product.name} via AI chat`,
      agentSessionId: sessionId,
    });
    toolCalls.push({ tool: 'createPendingOrder', args: {}, result: order });

    if (!order.success) {
      return { response: order.reason || 'Could not create order. Please try again.', type: 'error', toolCalls, sessionId, engine: 'rule-based' };
    }

    return {
      response: `Your order **${order.orderNumber || ''}** is ready! Click the button below to complete payment of ₹${cart.total} securely via Razorpay or choose Cash on Delivery. 💧`,
      type: 'PAYMENT_READY',
      orderId: order.orderId,
      orderNumber: order.orderNumber,
      amount: cart.total,
      toolCalls,
      sessionId,
      engine: 'rule-based',
    };
  }

  // 3. SPECIFIC QUANTITY ORDER
  const quantityMatch = msg.match(/(\d+)\s*(?:.*?)(jar|can|bottle|dispenser|stand|pump|jars|cans|bottles|canes|dispensers|stands|pumps)/i);
  if (quantityMatch && (/\b(order|need|want|buy|send|deliver|mangwana|chahiye|do|bhejo|book)\b/i.test(msg) || quantityMatch[0] === msg)) {
    const qty = parseInt(quantityMatch[1]);
    const sizeMatch = msg.match(/(\d+)\s*l/i);
    let searchQuery = '20L';
    if (sizeMatch) {
      searchQuery = `${sizeMatch[1]}L`;
    } else if (/stand/i.test(msg)) {
      searchQuery = 'stand';
    } else if (/pump/i.test(msg)) {
      searchQuery = 'pump';
    } else if (/dispenser/i.test(msg)) {
      searchQuery = 'dispenser';
    }
    const search = await executeTool('searchProducts', { query: searchQuery });
    toolCalls.push({ tool: 'searchProducts', args: { query: searchQuery }, result: search });
    const product = search.products?.[0];

    if (product) {
      const stockCheck = await executeTool('checkStock', { productId: product.id, quantity: qty });
      toolCalls.push({ tool: 'checkStock', args: { productId: product.id, quantity: qty }, result: stockCheck });

      if (!stockCheck.canFulfill) {
        return { response: `Sorry, we only have ${stockCheck.currentStock} in stock right now. Would you like to order ${stockCheck.currentStock} instead?`, type: 'text', toolCalls, sessionId, engine: 'rule-based' };
      }

      const cart = await executeTool('calculateCart', { items: [{ productId: product.id, quantity: qty }] });
      toolCalls.push({ tool: 'calculateCart', args: { items: [{ productId: product.id, quantity: qty }] }, result: cart });

      let upsellMessage = '';
      if (product.size === '20L' || product.name.includes('20L') || product.name.includes('18L')) {
        upsellMessage = `\n\n💡 **AI Smart Upsell**: Need portable water for travel or quick use? Add a 1L Bottle for just ₹10 or a 2L Bottle for ₹20!`;
      } else if (product.name.toLowerCase().includes('bottle') || product.size === '1L' || product.size === '2L') {
        upsellMessage = `\n\n💡 **AI Smart Upsell**: Need more water for home or office? Add an 18L Can or 20L Can for just ₹40!`;
      }

      return {
        response: `Great! Here is your order summary:\n\n• ${qty} × **${product.name}** @ ₹${product.price}\n• **Total: ₹${cart.total}**\n• Delivery: **Free** (2–4 hours in Lucknow 🚀)${upsellMessage}\n\nShall I place this order for you? Reply *"Yes"* to confirm or click below to open checkout.`,
        type: 'ORDER_CONFIRMATION',
        pendingCart: { product, qty, cart },
        toolCalls,
        sessionId,
        engine: 'rule-based',
      };
    }
  }

  // 4. WATER REQUIREMENT CALCULATOR INTENTS
  const calcMatch = msg.match(/(?:family|office|home|team|group|house|ghar|parivar)?\s*(?:of\s*)?(\d+)\s*(?:people|person|persons|members|staff|employees|users|log)/i);
  const isCalcQuery = /\b(calculator|calculate|how much water|water calculation|requirement|how many jars should i drink|kitna pani piye|family requirement|office requirement|intake calculation)\b/i.test(msg);

  if (isCalcQuery || (calcMatch && /\b(water|calculate|calculator|intake|requirement|kitna pani)\b/i.test(msg))) {
    const peopleCount = calcMatch ? parseInt(calcMatch[1]) : 4;
    const isOffice = /\b(office|staff|employee|employees|workplace|company|corporate|dukaan)\b/i.test(msg);
    const userType = isOffice ? 'office' : 'home';
    const usageType = /\b(cooking|cook|food|khana)\b/i.test(msg) ? 'drinking-and-cooking' : 'drinking-and-cooking';

    const calcResult = await executeTool('calculateWaterRequirement', { peopleCount, userType, usageType });
    toolCalls.push({ tool: 'calculateWaterRequirement', args: { peopleCount, userType, usageType }, result: calcResult });

    const c = calcResult.calculation;
    return {
      response: `🧮 **Water Requirement Calculation for ${peopleCount} ${isOffice ? 'Staff' : 'Family Members'}**\n\n• **Daily Consumption**: ~${c.dailyLiters} Liters/day\n• **Monthly Total**: ~${c.monthlyLiters} Liters (${c.recommended20LJarsPerMonth} × 20L Jars/month)\n• **Estimated Monthly Cost (One-time)**: ₹${c.estimatedCostOneTime}\n• **Subscription Cost**: **₹${c.estimatedCostSubscription}** *(Save ₹${c.monthlySavings}/month!)*\n• **Recommended Plan**: **${c.recommendedPlan}**\n\nWould you like me to set up an order or subscription for this package?`,
      type: 'WATER_CALCULATOR_RESULT',
      data: calcResult,
      toolCalls,
      sessionId,
      engine: 'rule-based',
    };
  }

  // 5. EXPLORE ALL SERVICES & PLATFORM TOUR
  if (/\b(explore|services|what services|how does it work|how it works|tour|features|overview|all services|what do you offer|guide|platform|functions|kya kya hai|kya offer karte ho|sab batao|all features)\b/i.test(msg)) {
    const explorer = await executeTool('exploreServices');
    toolCalls.push({ tool: 'exploreServices', args: {}, result: explorer });

    return {
      response: `🌟 **Shambhavi Water Platform Services & Features**\n\nWe provide reliable, hygienic, and certified drinking water solutions across Lucknow:\n\n• 🚚 **Doorstep Water Delivery**: 20L returnable jars, 10L cans & bottles delivered in 2–4 hours.\n• 🔄 **Smart Subscriptions**: Daily, alternate day, or weekly deliveries with up to **25% savings**.\n• 📍 **Live GPS Tracking**: Track your delivery van in real-time on our interactive map.\n• 💧 **Daily Hydration Tracker**: Log your water intake and meet your wellness goals.\n• 💎 **8-Stage RO+UV Purity**: TDS balanced at 100–150 ppm with essential calcium & magnesium.\n• 🚰 **Dispensers & Stands**: Heavy-duty stands, Milton dispensers, and automatic pumps.\n• ⚡ **Emergency & Event Bulk Supply**: Express dispatch for parties and office functions.\n• 🛡️ **24/7 Grievance Support**: Instant resolution with our 100% seal integrity guarantee.\n\nTap any card below to navigate directly to that service!`,
      type: 'SERVICE_EXPLORER',
      data: explorer,
      toolCalls,
      sessionId,
      engine: 'rule-based',
    };
  }

  // 6. ORDER HISTORY & INVOICES
  if (/\b(order history|my orders|past orders|past deliveries|invoices|purane orders|receipts|bills|bill|download invoice)\b/i.test(msg)) {
    return {
      response: `📋 **Order History & Invoices**\n\nReview all your previous orders, check delivery receipts, download PDF invoices, and reorder favourite items.`,
      type: 'PAGE_NAVIGATION',
      data: {
        title: 'My Order History',
        route: '/portal/orders',
        badge: 'Orders',
        icon: '📋',
        desc: 'View past orders, track dispatch progress, and download receipts',
        actionText: 'View My Orders',
      },
      toolCalls: [],
      sessionId,
      engine: 'rule-based',
    };
  }

  // 7. PAYMENTS & DUES
  if (/\b(payment history|my payments|billing|clear dues|outstanding|due payment|paise dene hai|payment karna hai|pay now|my dues)\b/i.test(msg)) {
    return {
      response: `💳 **Payment History & Billing**\n\nView online transaction records, download Razorpay receipts, and clear any outstanding bottle balances securely.`,
      type: 'PAGE_NAVIGATION',
      data: {
        title: 'Payment History & Billing',
        route: '/portal/payments',
        badge: 'Billing',
        icon: '💳',
        desc: 'Check payment transaction logs, verify Razorpay IDs, and clear dues',
        actionText: 'View Payments',
      },
      toolCalls: [],
      sessionId,
      engine: 'rule-based',
    };
  }

  // 8. COMPLAINTS & GRIEVANCES
  if (/\b(complaint|grievance|damaged seal|broken jar|leakage|issue|problem|ticket|shikayat|seal kharab|ganda pani|pani late)\b/i.test(msg)) {
    return {
      response: `🛠️ **Customer Grievance & Support Tickets**\n\nEncountered an issue with jar seal, water taste, or delivery timing? File a ticket for instant resolution or bottle replacement.`,
      type: 'PAGE_NAVIGATION',
      data: {
        title: 'File a Complaint / Grievance',
        route: '/portal/complaints',
        badge: 'Support',
        icon: '🛠️',
        desc: 'Register a complaint ticket with instant priority dispatch guarantee',
        actionText: 'Raise Ticket',
      },
      toolCalls: [],
      sessionId,
      engine: 'rule-based',
    };
  }

  // 9. LIVE ORDER TRACKING
  const orderIdMatch = msg.match(/\b(ord-[a-z0-9]+|[0-9a-f]{24}|ord\d+)\b/i);
  if (orderIdMatch) {
    const trackResult = await executeTool('trackOrderStatus', { orderId: orderIdMatch[1] });
    toolCalls.push({ tool: 'trackOrderStatus', args: { orderId: orderIdMatch[1] }, result: trackResult });

    if (trackResult.success) {
      const o = trackResult.order;
      return {
        response: `🚚 **Live Order Status: ${o.orderNumber}**\n\n• **Status**: ${o.status.toUpperCase().replace('_', ' ')}\n• **Items**: ${o.quantity} × ${o.waterType}\n• **Total Amount**: ₹${o.totalAmount} (${o.paymentStatus})\n• **Delivery Address**: ${o.deliveryAddress}\n• **Estimated ETA**: **${o.eta}**\n\nClick below to view the real-time GPS delivery map!`,
        type: 'TRACK_ORDER_RESULT',
        data: trackResult,
        toolCalls,
        sessionId,
        engine: 'rule-based',
      };
    }
  }

  if (/\b(track order|track delivery|live tracking|gps tracker|where is my order|where is my van|delivery status|kaha hai mera order|delivery kab aayegi|van status|track karna hai|kab milega|mera order)\b/i.test(msg)) {
    return {
      response: `🚚 **Live Order Tracking**\n\nTrack your delivery van in real-time on our interactive map. Enter your Order ID (e.g. ORD-12345 or ORD00138) to see the driver's live GPS location and arrival time.`,
      type: 'PAGE_NAVIGATION',
      data: {
        title: 'Live Order Tracker',
        route: '/track',
        badge: 'GPS Live',
        icon: '🚚',
        desc: 'Track your water delivery van in real-time on live map with driver ETA',
        actionText: 'Open Live Tracker',
      },
      toolCalls: [],
      sessionId,
      engine: 'rule-based',
    };
  }

  // 10. PRODUCT CATALOG & PRICING
  if (/\b(show products|go to products|open catalog|browse items|shop products|view products|product page|price list|rates|rate list|price batao|kitne ka hai|rate kya hai|water bottle|bottles|dispenser|can|jar|pani|price)\b/i.test(msg)) {
    const result = await executeTool('searchProducts', {});
    toolCalls.push({ tool: 'searchProducts', args: {}, result });
    const productList = (result.products || []).slice(0, 4).map(p =>
      `• **${p.name}** (${p.size || 'Unit'}) — **₹${p.price}**`
    ).join('\n');

    return {
      response: `📦 **Shambhavi Pure Water Products & Pricing**\n\n${productList}\n\nTap below to explore our products or reply with what you need!`,
      type: 'PAGE_NAVIGATION',
      data: {
        title: 'Pure Water Products',
        route: '/products',
        badge: 'Products',
        icon: '💧',
        desc: '1L Bottle (₹10), 2L Bottle (₹20), 18L Can (₹40), 20L Can (₹40)',
        actionText: 'View Products',
      },
      toolCalls,
      sessionId,
      engine: 'rule-based',
    };
  }

  // 11. QUICK ORDER / CHECKOUT PAGE
  if (/\b(order online|checkout|place order page|buy now|quick checkout|order karna hai|pani mangwana hai|mujhe pani chahiye|paani chahiye|order now)\b/i.test(msg)) {
    return {
      response: `🛒 **Instant Order Checkout**\n\nPlace an order in under 60 seconds with instant Razorpay online payment or Cash on Delivery with free delivery in 2–4 hours.`,
      type: 'PAGE_NAVIGATION',
      data: {
        title: 'Quick Checkout',
        route: '/order',
        badge: 'Fast Order',
        icon: '🛒',
        desc: 'Place your order in under 60 seconds with instant online payment',
        actionText: 'Place Order Now',
      },
      toolCalls: [],
      sessionId,
      engine: 'rule-based',
    };
  }

  // 12. WATER PURITY & TDS QUESTIONS
  if (/\b(tds|purity|purification|ro|uv|minerals|is it clean|is it safe|safe to drink|certification|fssai|bis|stages|mineral|kya pani saaf hai|tds kitna hai)\b/i.test(msg)) {
    const quality = await executeTool('getWaterQualitySpecs');
    toolCalls.push({ tool: 'getWaterQualitySpecs', args: {}, result: quality });
    const q = quality.standards;

    return {
      response: `💎 **8-Stage RO + UV Water Purity & Mineral Standards**\n\n• **TDS Level**: **${q.tdsLevel}**\n• **pH Balance**: **${q.phLevel}**\n• **Certifications**: ${q.certifications.join(' • ')}\n• **Purification Process**:\n  1. Sand & Turbidity Filtration\n  2. High-Iodine Activated Carbon\n  3. 5-Micron Sediment Cartridge\n  4. High-Pressure Reverse Osmosis (RO)\n  5. Essential Mineral Re-Infusion (Calcium & Magnesium)\n  6. Medical-Grade UV Sterilization\n  7. Oxygen Ozonation\n  8. 0.2 Micron Polishing Filter\n• **Jar Hygiene**: ${q.jarHygiene}`,
      type: 'text',
      toolCalls,
      sessionId,
      engine: 'rule-based',
    };
  }

  // 13. DELIVERY AREAS & COVERAGE
  if (/\b(delivery area|where do you deliver|service area|coverage|lucknow|gomti nagar|karbala|indira nagar|aliganj|hazratganj|timing|hours|operating hours|kaha deliver karte ho|area batao)\b/i.test(msg)) {
    const areas = await executeTool('getServiceAreas');
    toolCalls.push({ tool: 'getServiceAreas', args: {}, result: areas });

    const areaList = areas.areas.map(a => `• **${a.name}** — ${a.status} *(${a.time})*`).join('\n');
    return {
      response: `📍 **Delivery Coverage in Lucknow**\n\n• **Operating Hours**: ${areas.operatingHours}\n• **Turnaround**: ${areas.deliverySpeed}\n\n**Active Service Hubs**:\n${areaList}\n\nNeed water delivered today? Place an order now!`,
      type: 'text',
      toolCalls,
      sessionId,
      engine: 'rule-based',
    };
  }

  // 14. WATER HYDRATION TRACKER
  if (/\b(water tracker|hydration tracker|daily water tracker|log water|hydration goal|glasses of water|wellness|hydration habits|paani tracker|pani ka record)\b/i.test(msg)) {
    return {
      response: `💧 **Daily Hydration Tracker**\n\nStay healthy and energized! Use our interactive water tracker to log your daily glasses of water, set hydration targets, and monitor your wellness progress.`,
      type: 'PAGE_NAVIGATION',
      data: {
        title: 'Water Hydration Tracker',
        route: '/tracker',
        badge: 'Health & Wellness',
        icon: '💧',
        desc: 'Log your daily water intake, set hydration goals, and monitor wellness habits',
        actionText: 'Open Water Tracker',
      },
      toolCalls: [],
      sessionId,
      engine: 'rule-based',
    };
  }

  // 15. SUBSCRIPTIONS & PLANS
  if (/\b(subscription|subscribe|monthly|plan|save|plans|regular delivery|roz delivery)\b/i.test(msg)) {
    const result = await executeTool('getSubscriptionPlans');
    toolCalls.push({ tool: 'getSubscriptionPlans', args: {}, result });

    const plansText = result.plans.map(p =>
      `• **${p.name}** (${p.frequency})\n  💰 **₹${p.pricePerMonth}/mo** *(₹${p.pricePerJar}/jar vs ₹40, save ${p.discountPercent}%)*\n  ✨ ${p.perks.join(' • ')}`
    ).join('\n\n');

    return {
      response: `📋 **Shambhavi Water Subscription Plans**\n\n${plansText}\n\nWould you like to subscribe to one of these plans, or calculate your custom family requirement?`,
      type: 'text',
      toolCalls,
      sessionId,
      engine: 'rule-based',
    };
  }

  // 16. CUSTOMER PORTAL & DASHBOARD
  if (/\b(dashboard|portal|my account|profile|account summary|mera dashboard)\b/i.test(msg)) {
    return {
      response: `📊 **Customer Portal Dashboard**\n\nAccess your personalized dashboard to manage active orders, check monthly consumption trends, and reorder with 1 click.`,
      type: 'PAGE_NAVIGATION',
      data: {
        title: 'Customer Dashboard',
        route: '/portal',
        badge: 'Portal',
        icon: '📊',
        desc: 'View active deliveries, quick reorder buttons, and consumption stats',
        actionText: 'Open Dashboard',
      },
      toolCalls: [],
      sessionId,
      engine: 'rule-based',
    };
  }

  // 17. ABOUT US & PURITY FACILITY
  if (/\b(about us|about company|who are you|company story|factory|purification plant|shambhavi ke bare me)\b/i.test(msg)) {
    return {
      response: `🧪 **About Shambhavi Water Services**\n\nLearn about our mission to provide purest mineral-rich drinking water across Lucknow, our state-of-the-art 8-stage RO+UV filtration facility, and our BIS & FSSAI certified standards.`,
      type: 'PAGE_NAVIGATION',
      data: {
        title: 'About Us & Purity Standards',
        route: '/about',
        badge: 'Purity Guide',
        icon: '🧪',
        desc: 'Explore our 8-stage RO+UV purification facility, mineral balance & certifications',
        actionText: 'Learn About Us',
      },
      toolCalls: [],
      sessionId,
      engine: 'rule-based',
    };
  }

  // 18. CONTACT & SUPPORT
  if (/\b(contact|phone|helpline|support number|address|location|office|emergency|call|whatsapp|number chahiye|customer care|helpline number)\b/i.test(msg)) {
    return {
      response: `📞 **Contact Shambhavi Water Support**\n\n• **24/7 Helpline**: +91 98765 43210\n• **WhatsApp Support**: +91 98765 43210\n• **Email**: support@shambhaviwater.com\n• **Hub Address**: Karbala Bazar / Gomti Nagar, Lucknow, UP\n• **Delivery Hours**: 6:00 AM – 9:00 PM (All 7 Days)`,
      type: 'PAGE_NAVIGATION',
      data: {
        title: 'Contact Us & 24/7 Support',
        route: '/contact',
        badge: 'Support',
        icon: '📞',
        desc: 'Reach our helpline, request emergency bulk deliveries, or find our center',
        actionText: 'Open Contact Page',
      },
      toolCalls: [],
      sessionId,
      engine: 'rule-based',
    };
  }

  // 19. FEEDBACK & REVIEWS
  if (/\b(feedback|review|rate us|rating|customer review|rating dena hai|review dena hai)\b/i.test(msg)) {
    return {
      response: `⭐ **Customer Feedback & Reviews**\n\nYour feedback helps us maintain the highest water quality and fastest delivery times across Lucknow. Share your experience with us!`,
      type: 'PAGE_NAVIGATION',
      data: {
        title: 'Rate Our Service',
        route: '/feedback',
        badge: 'Feedback',
        icon: '⭐',
        desc: 'Rate water purity, delivery speed, and driver courtesy',
        actionText: 'Give Feedback',
      },
      toolCalls: [],
      sessionId,
      engine: 'rule-based',
    };
  }

  // 20. AUTH: REGISTER / LOGIN
  if (/\b(register|sign up|create account|new account|account banana hai)\b/i.test(msg)) {
    return {
      response: `✨ **Create Shambhavi Customer Account**\n\nJoin thousands of happy customers in Lucknow! Enjoy subscription discounts, 1-click reorders, and live delivery tracking.`,
      type: 'PAGE_NAVIGATION',
      data: {
        title: 'Create Account',
        route: '/register',
        badge: 'Sign Up',
        icon: '✨',
        desc: 'Create an account to unlock subscription perks and easy reorders',
        actionText: 'Create Account',
      },
      toolCalls: [],
      sessionId,
      engine: 'rule-based',
    };
  }

  if (/\b(login|sign in|log in|login karna hai)\b/i.test(msg)) {
    return {
      response: `🔑 **Sign In to Shambhavi Water**\n\nAccess your customer portal or admin console.`,
      type: 'PAGE_NAVIGATION',
      data: {
        title: 'Account Login',
        route: '/login',
        badge: 'Sign In',
        icon: '🔑',
        desc: 'Sign in to access your customer dashboard and orders',
        actionText: 'Go to Login',
      },
      toolCalls: [],
      sessionId,
      engine: 'rule-based',
    };
  }

  // 20L Jar Inquiry
  if (/\b(20l|20 l|20 liter|20 litre|big jar|large jar|water can)\b/i.test(msg)) {
    const result = await executeTool('searchProducts', { query: '20L' });
    toolCalls.push({ tool: 'searchProducts', args: { query: '20L' }, result });
    const jar = result.products?.[0];
    if (jar) {
      return {
        response: `Our **${jar.name}** is **₹${jar.price}/jar** (${jar.stock} in stock).\n\n${jar.aiDescription}\n\n💡 **Subscribe & Save**: ₹${jar.subscriptionPrice}/jar (${jar.subscriptionDiscount}% off)\n\nHow many jars do you need? (e.g. reply *"I need 2 jars"* or *"Calculate for 4 people"*).`,
        type: 'text',
        toolCalls,
        sessionId,
        engine: 'rule-based',
      };
    }
  }

  // General Products
  if (/\b(product|products|catalog|what do you have|water bottle|bottles|dispenser|can|jar)\b/i.test(msg)) {
    const result = await executeTool('searchProducts', {});
    toolCalls.push({ tool: 'searchProducts', args: {}, result });
    const productList = (result.products || []).slice(0, 4).map(p =>
      `• **${p.name}** (${p.size || 'Unit'}) — **₹${p.price}**`
    ).join('\n');

    return {
      response: `Here are our 4 pure water products:\n\n${productList}\n\nWhich product would you like to order? (e.g. *"I want 1 jar of 20L"* or *"Order 2 bottles of 1L"*).`,
      type: 'text',
      toolCalls,
      sessionId,
      engine: 'rule-based',
    };
  }

  // DEFAULT HELPFUL GUIDE
  return {
    response: `I'm your **Friendly AI Guide** and I'm super excited to help you explore everything at **Shambhavi Water Services**! 💧✨\n\nYou can chat with me naturally! Try asking things like:\n• ✨ *"Show me around!"* — Get a quick tour of everything we do.\n• 🧮 *"Calculate water for my family of 4"* — I'll find your perfect hydration plan & savings!\n• 📦 *"What products do you have?"* — Browse our fresh 20L jars, bottles & cool dispensers.\n• 🚚 *"Track my order"* — I'll pull up the live GPS map & van ETA instantly!\n• 💎 *"Is the water safe?"* — I'd love to tell you about our amazing 8-Stage RO+UV purity!\n• 📍 *"Do you deliver to Gomti Nagar?"* — Let's check our active delivery zones.\n• 📋 *"Show my past orders"* — Need a quick invoice or reorder? I've got you covered!\n• 🛠️ *"File a complaint"* — Oh no! Let me log a priority ticket for you right away.`,
    type: 'text',
    toolCalls: [],
    sessionId,
    engine: 'rule-based',
  };
}

module.exports = { processMessage };
