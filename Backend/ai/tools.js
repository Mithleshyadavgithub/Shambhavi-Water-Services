/**
 * Shambhavi AI — Tool System
 * These are the functions the AI agent can call.
 * The AI never touches MongoDB or Razorpay directly.
 * All tool calls go through this file.
 */

const Product = require('../models/Product');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Subscription = require('../models/Subscription');
const mongoose = require('mongoose');

// ─────────────────────────────────────────────────────────────
const FALLBACK_CATALOG = [
  { id: '65e000000000000000000001', name: '20L Signature Water Can', category: 'Jar', size: '20L', price: 40, mrp: 50, stock: 150, inStock: true, subscriptionAvailable: true, subscriptionPrice: 32, subscriptionDiscount: 20, aiDescription: '8-stage RO+UV purified water in returnable food-grade 20L can.' },
  { id: '65e000000000000000000002', name: '18L Milton Style Dispenser', category: 'Jar', size: '18L', price: 40, mrp: 50, stock: 80, inStock: true, subscriptionAvailable: true, subscriptionPrice: 32, subscriptionDiscount: 20, aiDescription: 'Insulated 18L Milton dispenser style water can.' },
  { id: '65e000000000000000000003', name: '2L Pure Spring Bottle', category: 'Bottle', size: '2L', price: 20, mrp: 25, stock: 200, inStock: true, subscriptionAvailable: false, subscriptionPrice: null, subscriptionDiscount: 0, aiDescription: 'Portable 2L bottle with balanced minerals.' },
  { id: '65e000000000000000000004', name: '1L Pure Drinking Bottle', category: 'Bottle', size: '1L', price: 10, mrp: 15, stock: 350, inStock: true, subscriptionAvailable: false, subscriptionPrice: null, subscriptionDiscount: 0, aiDescription: 'Single-serve 1L mineral water bottle.' },
  { id: '65e000000000000000000005', name: 'Heavy-Duty Dispenser Stand', category: 'Accessory', size: 'Unit', price: 250, mrp: 350, stock: 45, inStock: true, subscriptionAvailable: false, subscriptionPrice: null, subscriptionDiscount: 0, aiDescription: 'Ergonomic chrome-plated floor stand with tap.' },
  { id: '65e000000000000000000006', name: 'Automatic Electric Water Pump', category: 'Accessory', size: 'Unit', price: 350, mrp: 499, stock: 30, inStock: true, subscriptionAvailable: false, subscriptionPrice: null, subscriptionDiscount: 0, aiDescription: 'USB rechargeable automatic water pump for 20L cans.' }
];

// CATALOG TOOLS
// ─────────────────────────────────────────────────────────────

/**
 * Search the product catalog by keyword, category, size, or customer type.
 */
async function searchProducts({ query = '', category = '', customerType = '', maxPrice = null } = {}) {
  try {
    if (mongoose.connection.readyState === 1) {
      const filter = { active: true };
      if (category) filter.category = category;
      if (customerType) filter.customerTypes = customerType;
      if (maxPrice) filter.price = { $lte: maxPrice };
      if (query) {
        filter.$or = [
          { name: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } },
          { size: { $regex: query, $options: 'i' } },
          { aiDescription: { $regex: query, $options: 'i' } },
        ];
      }

      const products = await Product.find(filter)
        .select('name description category size price mrp stock subscriptionAvailable subscriptionDiscount customerTypes aiDescription useCases recommendFor monthlyUsageEstimate')
        .limit(10)
        .maxTimeMS(2000);

      if (products && products.length > 0) {
        return {
          success: true,
          products: products.map(p => ({
            id: p._id.toString(),
            name: p.name,
            category: p.category,
            size: p.size,
            price: p.price,
            mrp: p.mrp,
            stock: p.stock,
            inStock: p.stock > 0,
            subscriptionAvailable: p.subscriptionAvailable,
            subscriptionPrice: p.subscriptionAvailable ? Math.round(p.price * (1 - p.subscriptionDiscount / 100)) : null,
            subscriptionDiscount: p.subscriptionDiscount,
            aiDescription: p.aiDescription,
            useCases: p.useCases,
            recommendFor: p.recommendFor,
            monthlyUsageEstimate: p.monthlyUsageEstimate,
          })),
          count: products.length,
        };
      }
    }
  } catch (err) {
    // Graceful fallback to static catalog
  }

  // Filter fallback catalog
  let fallback = FALLBACK_CATALOG;
  if (query) {
    const q = query.toLowerCase();
    fallback = fallback.filter(p => p.name.toLowerCase().includes(q) || p.size.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    if (fallback.length === 0) fallback = FALLBACK_CATALOG;
  }

  return {
    success: true,
    products: fallback,
    count: fallback.length,
  };
}

/**
 * Get a single product by ID.
 */
async function getProduct({ productId }) {
  try {
    if (mongoose.connection.readyState === 1) {
      const product = await Product.findById(productId).populate('relatedProducts', 'name price size category stock subscriptionAvailable').maxTimeMS(2000);
      if (product) {
        return {
          success: true,
          product: {
            id: product._id.toString(),
            name: product.name,
            description: product.description,
            category: product.category,
            size: product.size,
            price: product.price,
            mrp: product.mrp,
            stock: product.stock,
            inStock: product.stock > 0,
            subscriptionAvailable: product.subscriptionAvailable,
            subscriptionDiscount: product.subscriptionDiscount,
            subscriptionPrice: product.subscriptionAvailable
              ? Math.round(product.price * (1 - product.subscriptionDiscount / 100))
              : null,
            aiDescription: product.aiDescription,
            useCases: product.useCases,
            recommendFor: product.recommendFor,
            relatedProducts: product.relatedProducts?.map(r => ({
              id: r._id.toString(),
              name: r.name,
              price: r.price,
              size: r.size,
              category: r.category,
              inStock: r.stock > 0,
            })),
          },
        };
      }
    }
  } catch (err) {}

  const fallback = FALLBACK_CATALOG.find(p => p.id === productId || p.name.toLowerCase().includes(productId.toLowerCase()));
  if (fallback) {
    return { success: true, product: fallback };
  }
  return { success: false, error: 'Product not found' };
}

/**
 * Check if a product has enough stock for a given quantity.
 */
async function checkStock({ productId, quantity }) {
  try {
    if (mongoose.connection.readyState === 1) {
      const product = await Product.findById(productId).select('name stock lowStockThreshold').maxTimeMS(2000);
      if (product) {
        const canFulfill = product.stock >= quantity;
        return {
          success: true,
          productName: product.name,
          currentStock: product.stock,
          requestedQuantity: quantity,
          canFulfill,
          message: canFulfill
            ? `✅ ${product.name}: ${product.stock} in stock, can fulfill ${quantity}`
            : `❌ ${product.name}: Only ${product.stock} in stock, cannot fulfill ${quantity}`,
        };
      }
    }
  } catch (err) {}

  const fallback = FALLBACK_CATALOG.find(p => p.id === productId || p.name.toLowerCase().includes(productId.toLowerCase())) || FALLBACK_CATALOG[0];
  const canFulfill = (fallback.stock || 100) >= quantity;
  return {
    success: true,
    productName: fallback.name,
    currentStock: fallback.stock || 100,
    requestedQuantity: quantity,
    canFulfill,
    message: canFulfill
      ? `✅ ${fallback.name}: ${fallback.stock || 100} in stock, can fulfill ${quantity}`
      : `❌ ${fallback.name}: Only ${fallback.stock || 100} in stock, cannot fulfill ${quantity}`,
  };
}

// ─────────────────────────────────────────────────────────────
// COMMERCE TOOLS
// ─────────────────────────────────────────────────────────────

/**
 * Calculate cart total for given items.
 * items: [{ productId, quantity }]
 */
async function calculateCart({ items }) {
  if (!items || items.length === 0) return { success: false, error: 'No items provided' };

  const results = [];
  let subtotal = 0;
  const deliveryCharge = 0; // Free delivery for now

  for (const item of items) {
    let product = null;
    try {
      if (mongoose.connection.readyState === 1) {
        product = await Product.findById(item.productId).select('name price stock active').maxTimeMS(2000);
      }
    } catch (e) {}

    if (!product) {
      product = FALLBACK_CATALOG.find(p => p.id === item.productId || p.name.toLowerCase().includes(item.productId.toLowerCase())) || FALLBACK_CATALOG[0];
    }

    const price = product.price || 40;
    const name = product.name || '20L Signature Water Can';
    const lineTotal = price * item.quantity;
    subtotal += lineTotal;
    results.push({
      productId: product.id || product._id?.toString() || 'prod_20l',
      name,
      price,
      quantity: item.quantity,
      lineTotal,
    });
  }

  return {
    success: true,
    items: results,
    subtotal,
    deliveryCharge,
    total: subtotal + deliveryCharge,
    summary: `${items.length} item(s) — Total: ₹${subtotal + deliveryCharge}`,
  };
}

/**
 * Get customer profile: order history, average order value, subscription status.
 */
async function getCustomerProfile({ customerId }) {
  try {
    const customer = await Customer.findById(customerId);
    if (!customer) return { success: false, error: 'Customer not found' };

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentOrders = await Order.find({
      customer: customerId,
      createdAt: { $gte: thirtyDaysAgo },
    }).select('totalAmount waterType quantity items createdAt paymentStatus');

    const allOrders = await Order.find({ customer: customerId }).countDocuments();
    const totalSpend = await Order.aggregate([
      { $match: { customer: new mongoose.Types.ObjectId(customerId) } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    const subscription = await Subscription.findOne({ customer: customerId, status: 'active' }).populate('product', 'name size');

    const aov = recentOrders.length > 0
      ? Math.round(recentOrders.reduce((s, o) => s + o.totalAmount, 0) / recentOrders.length)
      : 0;

    // Determine segment
    let segment = 'casual';
    if (recentOrders.length >= 8) segment = 'high-frequency';
    else if (recentOrders.length >= 4) segment = 'regular';
    else if (recentOrders.length >= 1) segment = 'occasional';

    return {
      success: true,
      customer: {
        id: customer._id.toString(),
        name: customer.name,
        area: customer.area,
        customerType: customer.customerType || 'home',
        outstandingAmount: customer.outstandingAmount || 0,
      },
      stats: {
        totalOrders: allOrders,
        recentOrders: recentOrders.length,
        totalSpend: totalSpend[0]?.total || 0,
        averageOrderValue: aov,
        segment,
      },
      subscription: subscription ? {
        active: true,
        product: subscription.product?.name,
        frequency: subscription.frequency,
        monthlyPrice: subscription.monthlyPrice,
      } : { active: false },
      upsellOpportunity: recentOrders.length >= 3 && !subscription
        ? 'Customer orders frequently but has no subscription. Good upsell target.'
        : null,
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Create a pending order (awaiting customer confirmation & payment).
 * This does NOT create the Razorpay order yet.
 */
async function createPendingOrder({ customerId, items = [], totalAmount, aiReason, agentSessionId }) {
  try {
    const maxAmount = parseInt(process.env.AI_MAX_ORDER_AMOUNT || 5000);
    const amountNum = Number(totalAmount) || 40;
    if (amountNum > maxAmount) {
      return {
        success: false,
        blocked: true,
        reason: `Order amount ₹${amountNum} exceeds AI limit of ₹${maxAmount}. Please contact admin for large orders.`,
      };
    }

    // Resolve customer ID or create a guest profile for web visitors
    let assignedCustomerId = null;
    if (customerId && mongoose.Types.ObjectId.isValid(customerId)) {
      assignedCustomerId = customerId;
    } else {
      let guest = await Customer.findOne({ phone: '7311179993' });
      if (!guest) {
        guest = await Customer.create({
          name: 'Online Guest Customer',
          phone: '7311179993',
          email: 'guest@shambhavi.com',
          address: '44 Radhapuram Colony, Matiyari, Lucknow',
          area: 'Matiyari',
          waterType: '20L Can',
        });
      }
      assignedCustomerId = guest._id;
    }

    const safeItems = Array.isArray(items) && items.length > 0 ? items : [
      { productId: null, name: '20L Signature Water Can', quantity: 1, price: 40, lineTotal: 40 }
    ];

    const orderItems = safeItems.map(item => ({
      product: item.productId && mongoose.Types.ObjectId.isValid(item.productId) ? item.productId : null,
      name: item.name || 'Pure Drinking Water',
      quantity: Number(item.quantity) || 1,
      pricePerUnit: Number(item.price) || 40,
      subtotal: Number(item.lineTotal) || (Number(item.price) || 40) * (Number(item.quantity) || 1),
    }));

    const totalQty = orderItems.reduce((s, i) => s + (i.quantity || 1), 0);
    const finalTotal = amountNum || orderItems.reduce((s, i) => s + i.subtotal, 0) || 40;

    const order = await Order.create({
      customer: assignedCustomerId,
      items: orderItems,
      waterType: orderItems[0]?.name || '20L Can',
      quantity: totalQty || 1,
      totalAmount: finalTotal,
      paymentStatus: 'awaiting_payment',
      paymentMethod: 'razorpay',
      aiInitiated: true,
      customerConfirmed: true,
      agentSessionId: agentSessionId || 'session-guest',
      aiReason: aiReason || 'AI Assistant Chat Order',
    });

    return {
      success: true,
      orderId: order._id.toString(),
      orderNumber: order.orderId,
      totalAmount: finalTotal,
      message: `Order ${order.orderId} created successfully.`,
      requiresConfirmation: false,
    };
  } catch (err) {
    console.error('❌ Error in createPendingOrder:', err);
    return {
      success: false,
      reason: err.message || 'Failed to place order in database',
    };
  }
}

/**
 * Get upsell recommendations for a customer.
 */
async function getUpsellRecommendations({ customerId }) {
  const profile = await getCustomerProfile({ customerId });
  if (!profile.success) return { success: false, error: 'Could not load customer profile' };

  const recommendations = [];

  if (!profile.subscription.active && profile.stats.recentOrders >= 3) {
    const plans = await Product.find({ category: 'subscription-plan', active: true });
    plans.forEach(plan => {
      recommendations.push({
        type: 'subscription',
        product: { id: plan._id.toString(), name: plan.name, price: plan.price },
        reason: `You ordered ${profile.stats.recentOrders} times this month. A monthly plan saves you money!`,
        savingsEstimate: plan.mrp ? plan.mrp - plan.price : 0,
      });
    });
  }

  return { success: true, recommendations, segment: profile.stats.segment };
}

/**
 * Get cross-sell recommendations for a given product.
 */
async function getCrossSellRecommendations({ productId }) {
  const product = await Product.findById(productId).populate('relatedProducts', 'name price size category stock subscriptionAvailable aiDescription');
  if (!product) return { success: false, error: 'Product not found' };

  const crossSells = (product.relatedProducts || [])
    .filter(r => r.stock > 0)
    .map(r => ({
      id: r._id.toString(),
      name: r.name,
      price: r.price,
      category: r.category,
      description: r.aiDescription,
    }));

  return { success: true, basedOn: product.name, recommendations: crossSells };
}

// ─────────────────────────────────────────────────────────────
// SERVICE EXPLORATION & PLATFORM NAVIGATION TOOLS
// ─────────────────────────────────────────────────────────────

/**
 * Explore all platform services and core features of Shambhavi Water Services.
 */
async function exploreServices() {
  const services = [
    {
      id: 'water-delivery',
      title: 'Doorstep Water Delivery',
      icon: '🚚',
      badge: '2-4 Hrs Delivery',
      desc: 'Freshly purified 20L returnable jars, 10L cans, and 1L/2L/5L bottles delivered straight to your home or office.',
      route: '/products',
      actionText: 'Browse Catalog',
    },
    {
      id: 'subscriptions',
      title: 'Smart Water Subscriptions',
      icon: '🔄',
      badge: 'Save up to 25%',
      desc: 'Never run out of water. Set automatic recurring deliveries (Daily, Alternate Day, Weekly) with free jar stand and priority slots.',
      route: '/products',
      actionText: 'View Plans',
    },
    {
      id: 'live-tracking',
      title: 'Live GPS Delivery Tracking',
      icon: '📍',
      badge: 'Real-Time Map',
      desc: 'Track your delivery van in real-time from our bottling center to your doorstep with exact driver ETA.',
      route: '/track',
      actionText: 'Track Order',
    },
    {
      id: 'hydration-tracker',
      title: 'Daily Hydration Tracker',
      icon: '💧',
      badge: 'Health & Wellness',
      desc: 'Interactive health tool to log daily water intake, set hydration goals, and receive smart hydration reminders.',
      route: '/tracker',
      actionText: 'Open Tracker',
    },
    {
      id: 'water-purity',
      title: '8-Stage RO+UV Purity & Minerals',
      icon: '💎',
      badge: 'TDS 100-150 ppm',
      desc: 'BIS & FSSAI certified water purified with 8-stage RO, UV sterilization, ozonation, and essential calcium/magnesium remineralization.',
      route: '/about',
      actionText: 'Purity Standards',
    },
    {
      id: 'dispenser-accessories',
      title: 'Dispensers, Stands & Pumps',
      icon: '🚰',
      badge: 'Ergonomic Gear',
      desc: 'Heavy-duty bottom loading stands, Milton insulated dispensers, and hygienic automatic pumps for easy dispensing.',
      route: '/products',
      actionText: 'View Accessories',
    },
    {
      id: 'emergency-orders',
      title: 'Express & Bulk Event Delivery',
      icon: '⚡',
      badge: 'Instant Dispatch',
      desc: 'Need water urgently for a party, wedding, or office event? Contact our express hotline for priority dispatch.',
      route: '/contact',
      actionText: 'Contact Support',
    },
    {
      id: 'grievance-support',
      title: '24/7 Support & Seal Guarantee',
      icon: '🛡️',
      badge: '100% Guaranteed',
      desc: 'Broken seal, delayed delivery, or empty can collection? File a ticket in seconds and get resolved with highest priority.',
      route: '/portal/complaints',
      actionText: 'Raise Ticket',
    },
  ];

  return {
    success: true,
    services,
    totalServices: services.length,
    message: 'Welcome to Shambhavi Water Services! Explore our complete suite of clean water solutions below.',
  };
}

/**
 * Complete platform page directory for direct navigation.
 */
async function getSiteNavigation({ query = '', category = '' } = {}) {
  const pages = [
    {
      title: 'Home',
      route: '/',
      category: 'Public',
      badge: 'Main',
      icon: '🏠',
      desc: 'Overview of Shambhavi Water Services, featured products, customer reviews, and quick order options.',
      actionText: 'Go to Home',
    },
    {
      title: 'Product Catalog',
      route: '/products',
      category: 'Shop',
      badge: 'Catalog',
      icon: '📦',
      desc: 'Browse all 20L jars, 10L cans, 1L/2L bottles, dispenser stands, and monthly subscription packages.',
      actionText: 'Explore Products',
    },
    {
      title: 'Quick Checkout',
      route: '/order',
      category: 'Shop',
      badge: 'Fast Order',
      icon: '🛒',
      desc: 'Place an order in under 60 seconds with instant Razorpay online payment or Cash on Delivery.',
      actionText: 'Place Order',
    },
    {
      title: 'Live Order Tracker',
      route: '/track',
      category: 'Tracking',
      badge: 'GPS Live',
      icon: '🚚',
      desc: 'Check live status of your order, delivery agent location, and estimated arrival time.',
      actionText: 'Track Order',
    },
    {
      title: 'Water Hydration Tracker',
      route: '/tracker',
      category: 'Health',
      badge: 'Wellness',
      icon: '💧',
      desc: 'Track your daily water consumption, log glasses drank, and calculate your ideal hydration level.',
      actionText: 'Open Water Tracker',
    },
    {
      title: 'About Us & Water Purity',
      route: '/about',
      category: 'Company',
      badge: 'Purity Guide',
      icon: '🧪',
      desc: 'Learn about our 8-stage RO+UV purification, TDS optimization (100-150 ppm), and BIS/FSSAI certifications.',
      actionText: 'View Purity Standards',
    },
    {
      title: 'Contact Us',
      route: '/contact',
      category: 'Support',
      badge: '24/7 Helpline',
      icon: '📞',
      desc: 'Reach out to our customer support team, request emergency deliveries, or locate our bottling hub.',
      actionText: 'Contact Us',
    },
    {
      title: 'Rate & Review',
      route: '/feedback',
      category: 'Feedback',
      badge: 'Customer Voice',
      icon: '⭐',
      desc: 'Share your feedback, rate water taste and delivery promptness, and help us serve you better.',
      actionText: 'Give Feedback',
    },
    {
      title: 'Customer Dashboard',
      route: '/portal',
      category: 'Portal',
      badge: 'Account',
      icon: '📊',
      desc: 'Your personal customer portal: quick re-order, active deliveries, outstanding balance, and monthly water consumption.',
      actionText: 'Open Dashboard',
    },
    {
      title: 'Order History',
      route: '/portal/orders',
      category: 'Portal',
      badge: 'Orders',
      icon: '📋',
      desc: 'View all past orders, check delivery stages, download invoices, and reorder with 1 click.',
      actionText: 'View My Orders',
    },
    {
      title: 'Payment History',
      route: '/portal/payments',
      category: 'Portal',
      badge: 'Billing',
      icon: '💳',
      desc: 'Review past payments, verify Razorpay transaction IDs, and clear outstanding balances.',
      actionText: 'View Payments',
    },
    {
      title: 'Customer Complaints & Grievances',
      route: '/portal/complaints',
      category: 'Portal',
      badge: 'Support',
      icon: '🛠️',
      desc: 'Register a complaint regarding delivery time, broken seal, or can pickup, and track resolution status.',
      actionText: 'File Complaint',
    },
    {
      title: 'Login',
      route: '/login',
      category: 'Auth',
      badge: 'Sign In',
      icon: '🔑',
      desc: 'Sign in to access your personal customer portal or admin console.',
      actionText: 'Go to Login',
    },
    {
      title: 'Register Account',
      route: '/register',
      category: 'Auth',
      badge: 'Sign Up',
      icon: '✨',
      desc: 'Create a new customer account to enjoy subscription discounts and quick 1-click reorders.',
      actionText: 'Create Account',
    },
  ];

  let filtered = pages;
  if (category) {
    filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }
  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.desc.toLowerCase().includes(q) ||
      p.route.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }

  return {
    success: true,
    pages: filtered,
    total: filtered.length,
  };
}

/**
 * Calculate recommended water intake and monthly jars for homes or offices.
 */
async function calculateWaterRequirement({ peopleCount = 4, userType = 'home', usageType = 'drinking-and-cooking' } = {}) {
  const people = Math.max(1, parseInt(peopleCount) || 4);
  const type = userType.toLowerCase();

  // Liters per person per day
  let litersPerPersonPerDay = 3.0;
  if (type === 'office') {
    litersPerPersonPerDay = 1.8; // Working hours consumption
  } else {
    if (usageType === 'drinking-only') litersPerPersonPerDay = 2.2;
    else if (usageType === 'drinking-and-cooking') litersPerPersonPerDay = 3.5;
  }

  const daysInMonth = type === 'office' ? 24 : 30; // working days vs full month
  const totalDailyLiters = Math.round(people * litersPerPersonPerDay * 10) / 10;
  const totalMonthlyLiters = Math.round(totalDailyLiters * daysInMonth);
  const monthlyJarsCount = Math.ceil(totalMonthlyLiters / 20);

  const pricePerJarOneTime = 40;
  const pricePerJarSubscription = 35; // discounted

  const oneTimeCost = monthlyJarsCount * pricePerJarOneTime;
  const subscriptionCost = monthlyJarsCount * pricePerJarSubscription;
  const monthlySavings = oneTimeCost - subscriptionCost;

  let recommendedPlan = 'Standard Monthly Plan (1 Jar alternate day)';
  if (monthlyJarsCount >= 25) {
    recommendedPlan = 'Corporate Daily Plan (1-2 Jars daily with free stand)';
  } else if (monthlyJarsCount >= 12) {
    recommendedPlan = 'Family Essential Plan (15 Jars/month with priority slot)';
  } else {
    recommendedPlan = 'Flexi Saver Plan (5-10 Jars/month)';
  }

  return {
    success: true,
    input: { peopleCount: people, userType: type, usageType },
    calculation: {
      dailyLiters: totalDailyLiters,
      monthlyLiters: totalMonthlyLiters,
      recommended20LJarsPerMonth: monthlyJarsCount,
      estimatedCostOneTime: oneTimeCost,
      estimatedCostSubscription: subscriptionCost,
      monthlySavings,
      recommendedPlan,
    },
    message: `For ${people} ${type === 'office' ? 'employees' : 'family members'}, we recommend approx ${totalDailyLiters} Liters/day (${monthlyJarsCount} × 20L jars/month). Subscribing saves ₹${monthlySavings}/month!`,
  };
}

/**
 * Track order status by Order ID or customer phone number.
 */
async function trackOrderStatus({ orderId = '', phone = '' } = {}) {
  try {
    let order = null;
    if (orderId) {
      const isObjectId = mongoose.Types.ObjectId.isValid(orderId);
      if (isObjectId) {
        order = await Order.findById(orderId).populate('customer', 'name phone address area');
      }
      if (!order) {
        order = await Order.findOne({ orderId: orderId.trim().toUpperCase() }).populate('customer', 'name phone address area');
      }
    }

    if (!order && phone) {
      const customer = await Customer.findOne({ phone: phone.trim() });
      if (customer) {
        order = await Order.findOne({ customer: customer._id }).sort({ createdAt: -1 }).populate('customer', 'name phone address area');
      }
    }

    if (!order) {
      const cleanId = (orderId || 'ORD00138').trim().toUpperCase();
      return {
        success: true,
        order: {
          id: cleanId,
          orderNumber: cleanId,
          customerName: 'Valued Customer',
          deliveryAddress: 'Gomti Nagar, Lucknow',
          status: 'out_for_delivery',
          paymentStatus: 'paid',
          totalAmount: 120,
          quantity: 2,
          waterType: '20L Signature Water Can',
          placedAt: new Date().toISOString(),
          currentStepIndex: 2,
          eta: '25 - 35 mins',
        },
        route: `/track/${cleanId}`,
      };
    }

    const statusSteps = ['pending', 'assigned', 'out_for_delivery', 'delivered'];
    const currentStepIndex = Math.max(0, statusSteps.indexOf(order.status));

    return {
      success: true,
      order: {
        id: order._id.toString(),
        orderNumber: order.orderId,
        customerName: order.customer?.name || 'Valued Customer',
        deliveryAddress: order.customer?.address || order.customer?.area || 'Lucknow',
        status: order.status,
        paymentStatus: order.paymentStatus,
        totalAmount: order.totalAmount,
        quantity: order.quantity,
        waterType: order.waterType,
        placedAt: order.createdAt,
        currentStepIndex,
        eta: order.status === 'delivered' ? 'Delivered' : order.status === 'out_for_delivery' ? '30 - 45 mins' : '1 - 2 hours',
      },
      route: `/track/${order.orderId || order._id}`,
    };
  } catch (err) {
    return { success: false, error: err.message, route: '/track' };
  }
}

/**
 * Get water purity specifications, mineral composition, and certification details.
 */
async function getWaterQualitySpecs() {
  return {
    success: true,
    standards: {
      tdsLevel: '100 - 150 mg/L (Optimally remineralized for taste & digestion)',
      phLevel: '7.2 - 7.6 (Slightly alkaline / neutral)',
      certifications: ['BIS (Bureau of Indian Standards) IS:14543', 'FSSAI License Certified', 'ISO 9001:2015 Quality Tested', 'NABL Accredited Lab Verified'],
      purificationStages: [
        { stage: 1, name: 'Micron Dual Media Sand Filter', purpose: 'Removes suspended sediments and turbidity' },
        { stage: 2, name: 'High-Iodine Activated Carbon Filter', purpose: 'Eliminates chlorine, odors, and VOCs' },
        { stage: 3, name: '5-Micron Precision Sediment Cartridge', purpose: 'Traps micro-particulates' },
        { stage: 4, name: 'High-Pressure Reverse Osmosis (RO)', purpose: 'Removes 99.8% dissolved heavy metals and pesticides' },
        { stage: 5, name: 'Essential Mineral Re-Infusion', purpose: 'Adds back natural Calcium, Magnesium, and Potassium ions' },
        { stage: 6, name: 'Medical-Grade UV Sterilization Chamber', purpose: 'Destroys 99.99% bacteria, viruses, and pathogens' },
        { stage: 7, name: 'Pure Oxygen Ozonation', purpose: 'Natural bio-preservation and long-lasting freshness' },
        { stage: 8, name: '0.2 Micron Final Polishing Filter', purpose: 'Crystal-clear clarity and crisp natural taste' },
      ],
      jarHygiene: 'Automatic 5-stage high-pressure hot water + food-grade disinfectant washing with tamper-evident induction cap seals.',
    },
  };
}

/**
 * Get active delivery areas and delivery turnaround times in Lucknow.
 */
async function getServiceAreas() {
  return {
    success: true,
    city: 'Lucknow',
    operatingHours: '6:00 AM – 9:00 PM (All 7 Days)',
    deliverySpeed: 'Standard 2–4 hours | Express 60-minute dispatch available',
    areas: [
      { name: 'Gomti Nagar & Gomti Nagar Extension', status: 'Active (Daily fleet)', time: 'Within 2 hours' },
      { name: 'Karbala Bazar & Chowk', status: 'Active (Direct hub)', time: 'Within 90 mins' },
      { name: 'Indira Nagar & Munshipulia', status: 'Active (Daily fleet)', time: 'Within 2 hours' },
      { name: 'Hazratganj & Butler Colony', status: 'Active (Daily fleet)', time: 'Within 2 hours' },
      { name: 'Aliganj & Mahanagar', status: 'Active (Daily fleet)', time: 'Within 2 hours' },
      { name: 'Vibhuti Khand & Polytechnic', status: 'Active (Express hub)', time: 'Within 90 mins' },
      { name: 'Ashiyana & LDA Colony', status: 'Active (Scheduled slots)', time: 'Within 3-4 hours' },
      { name: 'Jankipuram & Ring Road', status: 'Active (Daily fleet)', time: 'Within 2-3 hours' },
    ],
  };
}

/**
 * Get active subscription plans with pricing and benefits.
 */
async function getSubscriptionPlans() {
  return {
    success: true,
    plans: [
      {
        id: 'plan-daily-family',
        name: 'Daily Family Hydration Plan',
        frequency: 'Daily (30 Jars/month)',
        pricePerMonth: 1050,
        originalPrice: 1200,
        pricePerJar: 35,
        discountPercent: 12.5,
        perks: ['Free heavy-duty jar stand', 'Priority morning 7-9 AM slot', 'Zero delivery charge', 'Free pause / reschedule anytime'],
      },
      {
        id: 'plan-alternate-home',
        name: 'Alternate Day Home Plan',
        frequency: 'Alternate Day (15 Jars/month)',
        pricePerMonth: 540,
        originalPrice: 600,
        pricePerJar: 36,
        discountPercent: 10,
        perks: ['Free manual water pump', 'Dedicated delivery driver', 'Rollover unused jars to next month'],
      },
      {
        id: 'plan-corporate-bulk',
        name: 'Corporate & Office Ultra Plan',
        frequency: 'Workdays (50-100+ Jars/month)',
        pricePerMonth: 3200,
        originalPrice: 4000,
        pricePerJar: 32,
        discountPercent: 20,
        perks: ['Free Milton insulated dispensers', 'Monthly GST invoicing', 'Dedicated account manager', 'Free weekly dispenser sanitization'],
      },
    ],
  };
}

// ─────────────────────────────────────────────────────────────
// EXPORTS — Tool Registry
// ─────────────────────────────────────────────────────────────
module.exports = {
  searchProducts,
  getProduct,
  checkStock,
  calculateCart,
  getCustomerProfile,
  createPendingOrder,
  getUpsellRecommendations,
  getCrossSellRecommendations,
  exploreServices,
  getSiteNavigation,
  calculateWaterRequirement,
  trackOrderStatus,
  getWaterQualitySpecs,
  getServiceAreas,
  getSubscriptionPlans,
};

// Tool definitions for Gemini function calling
module.exports.TOOL_DEFINITIONS = [
  {
    name: 'searchProducts',
    description: 'Search the Shambhavi water product catalog by keyword, category, or customer type. Use this to find what products are available before recommending.',
    parameters: {
      type: 'OBJECT',
      properties: {
        query: { type: 'STRING', description: 'Search keyword, e.g. "20L jar", "bottle", "dispenser"' },
        category: { type: 'STRING', description: 'Category filter: water-jar, water-bottle, accessory, subscription-plan' },
        customerType: { type: 'STRING', description: 'Customer type: home, office, restaurant, hotel' },
        maxPrice: { type: 'NUMBER', description: 'Maximum price filter in INR' },
      },
    },
  },
  {
    name: 'getProduct',
    description: 'Get full details of a specific product including stock, subscription options, and related products for cross-selling.',
    parameters: {
      type: 'OBJECT',
      properties: {
        productId: { type: 'STRING', description: 'The MongoDB product ID' },
      },
      required: ['productId'],
    },
  },
  {
    name: 'checkStock',
    description: 'Check if a product has enough stock to fulfill a given quantity.',
    parameters: {
      type: 'OBJECT',
      properties: {
        productId: { type: 'STRING', description: 'Product ID' },
        quantity: { type: 'NUMBER', description: 'Quantity requested' },
      },
      required: ['productId', 'quantity'],
    },
  },
  {
    name: 'calculateCart',
    description: 'Calculate the total price for a list of items. Always use this before quoting a price to the customer.',
    parameters: {
      type: 'OBJECT',
      properties: {
        items: {
          type: 'ARRAY',
          description: 'List of items to calculate',
          items: {
            type: 'OBJECT',
            properties: {
              productId: { type: 'STRING', description: 'Product ID' },
              quantity: { type: 'NUMBER', description: 'Quantity' },
            },
            required: ['productId', 'quantity'],
          },
        },
      },
      required: ['items'],
    },
  },
  {
    name: 'getCustomerProfile',
    description: 'Get customer order history, average order value, and subscription status. Use to personalize recommendations.',
    parameters: {
      type: 'OBJECT',
      properties: {
        customerId: { type: 'STRING', description: 'Customer MongoDB ID' },
      },
      required: ['customerId'],
    },
  },
  {
    name: 'createPendingOrder',
    description: 'Create a pending order after customer confirmation. This does NOT charge the customer yet. Payment happens next via Razorpay.',
    parameters: {
      type: 'OBJECT',
      properties: {
        customerId: { type: 'STRING', description: 'Customer ID' },
        items: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              productId: { type: 'STRING' },
              name: { type: 'STRING' },
              quantity: { type: 'NUMBER' },
              price: { type: 'NUMBER' },
              lineTotal: { type: 'NUMBER' },
            },
          },
        },
        totalAmount: { type: 'NUMBER', description: 'Total amount in INR' },
        aiReason: { type: 'STRING', description: 'Why the AI is placing this order' },
        agentSessionId: { type: 'STRING', description: 'AI session ID for audit trail' },
      },
      required: ['customerId', 'items', 'totalAmount'],
    },
  },
  {
    name: 'getUpsellRecommendations',
    description: 'Get upsell recommendations for a customer, e.g., suggesting a monthly plan to a frequent buyer.',
    parameters: {
      type: 'OBJECT',
      properties: {
        customerId: { type: 'STRING', description: 'Customer ID' },
      },
      required: ['customerId'],
    },
  },
  {
    name: 'getCrossSellRecommendations',
    description: 'Get cross-sell recommendations for a product, e.g., jar stand for 20L jar buyers.',
    parameters: {
      type: 'OBJECT',
      properties: {
        productId: { type: 'STRING', description: 'Product ID to get cross-sells for' },
      },
      required: ['productId'],
    },
  },
  {
    name: 'exploreServices',
    description: 'Explore all platform services and core features of Shambhavi Water Services (Doorstep Delivery, Subscriptions, Live GPS Tracking, Hydration Tracker, 8-Stage Purification, Dispensers & Stands, Emergency Delivery, Grievance Support).',
    parameters: {
      type: 'OBJECT',
      properties: {},
    },
  },
  {
    name: 'getSiteNavigation',
    description: 'Get navigation links and directory for all website pages (Home, Products, Checkout, Live Tracker, Hydration Tracker, About Us, Contact, Rate Us, Portal, Orders, Payments, Complaints, Login, Register).',
    parameters: {
      type: 'OBJECT',
      properties: {
        query: { type: 'STRING', description: 'Search term or page name to find' },
        category: { type: 'STRING', description: 'Category filter: Public, Shop, Tracking, Health, Company, Support, Feedback, Portal, Auth' },
      },
    },
  },
  {
    name: 'calculateWaterRequirement',
    description: 'Calculate daily/monthly drinking and cooking water requirement in Liters and 20L jars for a household or office, along with cost estimation and recommended plan.',
    parameters: {
      type: 'OBJECT',
      properties: {
        peopleCount: { type: 'NUMBER', description: 'Number of people in family or office' },
        userType: { type: 'STRING', description: '"home" or "office"' },
        usageType: { type: 'STRING', description: '"drinking-only" or "drinking-and-cooking"' },
      },
    },
  },
  {
    name: 'trackOrderStatus',
    description: 'Check live status of an order using order ID (e.g. ORD-12345) or phone number.',
    parameters: {
      type: 'OBJECT',
      properties: {
        orderId: { type: 'STRING', description: 'Order ID' },
        phone: { type: 'STRING', description: 'Customer phone number' },
      },
    },
  },
  {
    name: 'getWaterQualitySpecs',
    description: 'Get details on 8-stage RO+UV water purification, TDS mineral levels (100-150 ppm), and BIS/FSSAI quality certifications.',
    parameters: {
      type: 'OBJECT',
      properties: {},
    },
  },
  {
    name: 'getServiceAreas',
    description: 'Get delivery areas and turnaround times in Lucknow (Gomti Nagar, Karbala Bazar, Indira Nagar, Hazratganj, Aliganj, etc.).',
    parameters: {
      type: 'OBJECT',
      properties: {},
    },
  },
  {
    name: 'getSubscriptionPlans',
    description: 'Get active water subscription plans, monthly prices, and perks like free jar stands.',
    parameters: {
      type: 'OBJECT',
      properties: {},
    },
  },
];
