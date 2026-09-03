require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const products = [
  {
    name: '20L Drinking Water Jar',
    description: 'Premium purified drinking water in 20-litre reusable jar. Perfect for home and office daily use.',
    category: 'water-jar',
    size: '20L',
    unit: 'piece',
    price: 40,
    mrp: 50,
    stock: 250,
    lowStockThreshold: 20,
    sku: 'SHAM-20L-001',
    customerTypes: ['home', 'office', 'restaurant', 'hotel'],
    subscriptionAvailable: true,
    subscriptionDiscount: 10,
    tags: ['drinking', '20L', 'jar', 'daily', 'purified', 'bulk'],
    aiDescription: 'Most popular product. 20-litre jar of purified drinking water at ₹40/jar. Available on subscription (save 10%). Best for homes of 3-5 people consuming 1-2 jars/week, or offices of 5-15 people consuming 3-5 jars/week.',
    useCases: ['daily drinking', 'office hydration', 'restaurant', 'home cooking'],
    recommendFor: ['family of 3-5', 'office 5-15 people', 'small restaurant'],
    monthlyUsageEstimate: '4-8 per month for family of 4, 12-20 per month for office of 15',
  },
  {
    name: '10L Drinking Water Jar',
    description: 'Mid-size 10-litre purified water jar. Ideal for small families or quick refills.',
    category: 'water-jar',
    size: '10L',
    unit: 'piece',
    price: 25,
    mrp: 30,
    stock: 150,
    lowStockThreshold: 15,
    sku: 'SHAM-10L-001',
    customerTypes: ['home', 'office'],
    subscriptionAvailable: true,
    subscriptionDiscount: 8,
    tags: ['drinking', '10L', 'jar', 'compact', 'purified'],
    aiDescription: '10-litre jar at ₹25/jar. Good for small families (2-3 people) or supplementary office use. Available on subscription.',
    useCases: ['small family', 'supplementary water', 'light office use'],
    recommendFor: ['family of 2-3', 'small office 2-5 people'],
    monthlyUsageEstimate: '6-10 per month for family of 3',
  },
  {
    name: '5L Water Bottle Pack',
    description: 'Convenient 5-litre water bottle. Great for travel, gym, or personal use.',
    category: 'water-bottle',
    size: '5L',
    unit: 'piece',
    price: 20,
    mrp: 25,
    stock: 200,
    lowStockThreshold: 20,
    sku: 'SHAM-5L-001',
    customerTypes: ['home', 'office', 'institution'],
    subscriptionAvailable: false,
    tags: ['bottle', '5L', 'portable', 'personal'],
    aiDescription: '5-litre bottle at ₹20/bottle. Good for personal use, gym, travel. No subscription available.',
    useCases: ['personal use', 'gym', 'travel', 'school'],
    recommendFor: ['individual', 'student', 'gym-goer'],
    monthlyUsageEstimate: '8-12 per month for individual daily use',
  },
  {
    name: '1L Water Bottle (Pack of 12)',
    description: 'Pack of 12 × 1-litre sealed bottles. Perfect for events, offices, or bulk buying.',
    category: 'water-bottle',
    size: '1L',
    unit: 'pack',
    price: 180,
    mrp: 210,
    stock: 80,
    lowStockThreshold: 10,
    sku: 'SHAM-1L-PACK12',
    customerTypes: ['office', 'restaurant', 'hotel', 'institution'],
    subscriptionAvailable: true,
    subscriptionDiscount: 12,
    tags: ['bottle', '1L', 'pack', 'event', 'bulk', 'sealed'],
    aiDescription: 'Pack of 12 × 1L sealed bottles at ₹180/pack (₹15/bottle). Great for office meetings, hotels, restaurants, or events. Subscription saves 12%.',
    useCases: ['office meetings', 'hotel rooms', 'events', 'restaurant tables'],
    recommendFor: ['hotel 20+ rooms', 'corporate office', 'event organizer'],
    monthlyUsageEstimate: '4-8 packs per month for office of 20',
  },
  {
    name: 'Jar Stand (Steel)',
    description: 'Heavy-duty steel stand for 20L water jars. Ergonomic tap for easy dispensing.',
    category: 'accessory',
    size: null,
    unit: 'piece',
    price: 450,
    mrp: 600,
    stock: 30,
    lowStockThreshold: 5,
    sku: 'SHAM-STAND-001',
    customerTypes: ['home', 'office'],
    subscriptionAvailable: false,
    tags: ['stand', 'steel', 'dispenser', 'accessory', '20L', 'tap'],
    aiDescription: 'Steel stand for 20L jar at ₹450. One-time purchase. Recommended when customer orders 20L jars — makes dispensing easy. No subscription.',
    useCases: ['home kitchen', 'office pantry'],
    recommendFor: ['new 20L jar customer', 'office setup'],
    monthlyUsageEstimate: 'One-time purchase',
  },
  {
    name: 'Water Dispenser (Hot & Cold)',
    description: 'Electric water dispenser with hot, cold, and normal water modes. Works with 20L jars.',
    category: 'accessory',
    size: null,
    unit: 'piece',
    price: 3500,
    mrp: 4500,
    stock: 12,
    lowStockThreshold: 3,
    sku: 'SHAM-DISP-001',
    customerTypes: ['office', 'restaurant', 'hotel'],
    subscriptionAvailable: false,
    tags: ['dispenser', 'hot', 'cold', 'electric', 'office', 'premium'],
    aiDescription: 'Electric water dispenser (hot/cold/normal) at ₹3500. Works with 20L jars. Premium office/hotel solution. One-time purchase.',
    useCases: ['office pantry', 'hotel lobby', 'restaurant kitchen'],
    recommendFor: ['office 15+ people', 'hotel', 'premium home'],
    monthlyUsageEstimate: 'One-time purchase',
  },
  {
    name: 'Home Monthly Plan — 20L',
    description: 'Monthly subscription: 30 × 20L jars delivered daily. Best value for homes.',
    category: 'subscription-plan',
    size: '20L',
    unit: 'month',
    price: 1080,
    mrp: 1200,
    stock: 999,
    lowStockThreshold: 0,
    sku: 'SHAM-SUB-HOME-20L',
    customerTypes: ['home'],
    subscriptionAvailable: true,
    subscriptionDiscount: 10,
    tags: ['subscription', 'monthly', 'home', '20L', 'daily', 'plan'],
    aiDescription: 'Home Monthly Plan: 30 × 20L jars for ₹1080/month (₹36/jar, saves ₹120/month vs buying daily). Delivered daily to your doorstep. Best for families.',
    useCases: ['home daily water', 'family subscription'],
    recommendFor: ['family of 3-5', 'existing 20L jar customer ordering 4+ times/week'],
    monthlyUsageEstimate: '1 plan covers 30 deliveries/month',
  },
  {
    name: 'Office Monthly Plan — 20L (10 jars/week)',
    description: 'Monthly office subscription: 40 × 20L jars delivered 10/week. Ideal for offices of 15-30 people.',
    category: 'subscription-plan',
    size: '20L',
    unit: 'month',
    price: 1440,
    mrp: 1800,
    stock: 999,
    lowStockThreshold: 0,
    sku: 'SHAM-SUB-OFFICE-20L',
    customerTypes: ['office', 'restaurant'],
    subscriptionAvailable: true,
    subscriptionDiscount: 20,
    tags: ['subscription', 'monthly', 'office', '20L', 'bulk', 'plan', 'weekly'],
    aiDescription: 'Office Monthly Plan: 40 × 20L jars for ₹1440/month (₹36/jar, saves ₹360/month). 10 jars delivered every week. Best for offices of 15-30 people.',
    useCases: ['office hydration', 'small business water supply'],
    recommendFor: ['office 15-30 people', 'restaurant', 'frequent office buyer'],
    monthlyUsageEstimate: '1 plan covers office of 15-30 for a full month',
  },
];

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products');

    // Insert all products
    const created = await Product.insertMany(products);

    // Set relatedProducts cross-links
    const jar20L = created.find(p => p.sku === 'SHAM-20L-001');
    const stand = created.find(p => p.sku === 'SHAM-STAND-001');
    const dispenser = created.find(p => p.sku === 'SHAM-DISP-001');
    const homePlan = created.find(p => p.sku === 'SHAM-SUB-HOME-20L');
    const officePlan = created.find(p => p.sku === 'SHAM-SUB-OFFICE-20L');
    const jar10L = created.find(p => p.sku === 'SHAM-10L-001');

    // 20L jar related: stand, dispenser, home plan, office plan
    if (jar20L) {
      await Product.findByIdAndUpdate(jar20L._id, {
        relatedProducts: [stand?._id, dispenser?._id, homePlan?._id, officePlan?._id].filter(Boolean),
      });
    }

    // Stand related: 20L jar
    if (stand) {
      await Product.findByIdAndUpdate(stand._id, { relatedProducts: [jar20L?._id, jar10L?._id].filter(Boolean) });
    }

    console.log(`✅ Seeded ${created.length} products`);
    created.forEach(p => console.log(`   • ${p.name} — ₹${p.price} (${p.sku})`));

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seedProducts();
