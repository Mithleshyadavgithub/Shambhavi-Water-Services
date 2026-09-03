require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Connect Database
connectDB();

const app = express();

// Middleware: Dynamic CORS supporting Vercel deployments, Render, and Localhost
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.includes('vercel.app') ||
      origin.includes('onrender.com') ||
      process.env.NODE_ENV !== 'production'
    ) {
      return callback(null, true);
    }
    // Allow all in production to avoid deployment blockers
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Raw body for Razorpay webhook signature verification
app.use('/api/webhooks/razorpay', express.raw({ type: 'application/json' }));

// JSON body for all other routes
app.use(express.json());
app.use(morgan('dev'));

// ─── Razorpay Payment Routes (Public & Optional Protected) ──
app.use('/api/payments',   require('./routes/razorpay')); // /api/payments/create-order, /api/payments/verify
app.use('/api/webhooks',   require('./routes/razorpay')); // /api/webhooks/razorpay (webhook handler)

// ─── Core Routes ────────────────────────────────────────────
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/customers',  require('./routes/customers'));
app.use('/api/orders',     require('./routes/orders'));
app.use('/api/payments',   require('./routes/payments'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/dashboard',  require('./routes/dashboard'));

// ─── AI Agentic Commerce Routes ─────────────────────────────
app.use('/api/products',   require('./routes/products'));
app.use('/api/ai',         require('./routes/ai'));

// ─── AI Growth & Campaign Routes ────────────────────────────
app.use('/api/growth',     require('./routes/growth'));
app.use('/api/campaigns',  require('./routes/campaigns'));

// Health check
app.get('/api/health', (req, res) => res.json({
  status: 'OK',
  message: 'Shambhavi AI — Agentic Commerce Platform 🤖💧',
  version: '2.0',
  features: ['AI Commerce Agent', 'Razorpay Checkout', 'Growth Engine', 'Campaign Orchestrator'],
}));

// ─── Agent-to-Agent Commerce Protocols ──────────────────────
// Fulfills "Agent-readable catalog" for the internship
app.get('/catalog.json', (req, res) => {
  res.json({
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "merchant": "Shambhavi Water Services",
    "currency": "INR",
    "products": [
      { "id": "1", "name": "Shambhavi Pure 1L", "price": 10, "unit": "bottle", "min_qty": 12 },
      { "id": "2", "name": "Shambhavi Pure 2L", "price": 20, "unit": "bottle", "min_qty": 6 },
      { "id": "3", "name": "Elite 18L Dispenser", "price": 40, "unit": "can", "min_qty": 3 },
      { "id": "4", "name": "Signature 20L Spring", "price": 40, "unit": "can", "min_qty": 1, "popular": true }
    ],
    "policies": {
      "ai_buyer_approved": true,
      "max_order_amount": 5000,
      "payment_methods": ["razorpay", "upi"]
    }
  });
});

app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Shambhavi Water Services API is running',
    version: '1.0.0',
    endpoints: {
      products: '/api/products',
      orders: '/api/orders',
      customers: '/api/customers',
      aiChat: '/api/ai/chat'
    }
  });
});

app.get('/.well-known/ai-plugin.json', (req, res) => {
  res.json({
    "schema_version": "v1",
    "name_for_model": "shambhavi_water",
    "name_for_human": "Shambhavi Water Delivery",
    "description_for_model": "Plugin for AI buyers to order water cans, manage subscriptions, and read the product catalog.",
    "api": { "type": "openapi", "url": "/catalog.json" },
    "auth": { "type": "none" }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Server Error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n💧 Shambhavi AI — Agentic Commerce Platform`);
  console.log(`🤖 AI Engine: ${process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'REPLACE_ME' ? 'Gemini 1.5 Flash' : 'Rule-based (add GEMINI_API_KEY to enable Gemini)'}`);
  console.log(`💳 Razorpay: ${process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID !== 'rzp_test_REPLACE_ME' ? 'Test Mode Active' : 'Demo Mode (add RAZORPAY keys to enable)'}`);
  console.log(`🚀 Server: http://localhost:${PORT}`);
  console.log(`📊 API: http://localhost:${PORT}/api\n`);
});
