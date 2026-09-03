require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Customer = require('./models/Customer');
const Order = require('./models/Order');
const Payment = require('./models/Payment');
const Complaint = require('./models/Complaint');
const Inventory = require('./models/Inventory');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('🔌 Connected to MongoDB');

  // Clear
  await Promise.all([User.deleteMany(), Customer.deleteMany(), Order.deleteMany(), Payment.deleteMany(), Complaint.deleteMany(), Inventory.deleteMany()]);
  console.log('🗑️  Cleared existing data');

  // Admin user
  const admin = await User.create({ name: 'Admin User', email: 'admin@shambhavi.com', password: 'admin123', role: 'admin', phone: '9876543210' });
  const manager = await User.create({ name: 'Ravi Manager', email: 'manager@shambhavi.com', password: 'manager123', role: 'manager', phone: '9876543211' });
  const delivery1 = await User.create({ name: 'Suresh Kumar', email: 'suresh@shambhavi.com', password: 'delivery123', role: 'delivery', phone: '9876543212' });
  const delivery2 = await User.create({ name: 'Ramesh Singh', email: 'ramesh@shambhavi.com', password: 'delivery123', role: 'delivery', phone: '9876543213' });

  // Inventory
  await Inventory.insertMany([
    { product: '20L Can', pricePerUnit: 50, totalStock: 500, availableStock: 320, withCustomers: 150, damaged: 30, lowStockAlert: 50 },
    { product: '10L Can', pricePerUnit: 30, totalStock: 200, availableStock: 140, withCustomers: 50, damaged: 10, lowStockAlert: 30 },
    { product: '5L Bottle', pricePerUnit: 20, totalStock: 300, availableStock: 200, withCustomers: 80, damaged: 20, lowStockAlert: 40 },
    { product: '1L Bottle', pricePerUnit: 10, totalStock: 500, availableStock: 400, withCustomers: 80, damaged: 20, lowStockAlert: 60 },
  ]);

  // Customers
  const customerData = [
    { name: 'Rahul Kumar', phone: '9811111111', email: 'rahul@example.com', address: '12, MG Road, Gomti Nagar', area: 'Gomti Nagar', waterType: '20L Can', defaultQuantity: 2, subscriptionType: 'daily', outstandingAmount: 250 },
    { name: 'Amit Singh', phone: '9822222222', email: 'amit@example.com', address: '45, Hazratganj', area: 'Hazratganj', waterType: '20L Can', defaultQuantity: 3, subscriptionType: 'alternate', outstandingAmount: 500 },
    { name: 'Priya Sharma', phone: '9833333333', email: 'priya@example.com', address: '8, Indira Nagar', area: 'Indira Nagar', waterType: '10L Can', defaultQuantity: 1, subscriptionType: 'daily', outstandingAmount: 0 },
    { name: 'Sunita Devi', phone: '9844444444', email: 'sunita@example.com', address: '22, Alambagh', area: 'Alambagh', waterType: '20L Can', defaultQuantity: 1, subscriptionType: 'weekly', outstandingAmount: 150 },
    { name: 'Mohan Lal', phone: '9855555555', email: 'mohan@example.com', address: '7, Aashiyana', area: 'Aashiyana', waterType: '5L Bottle', defaultQuantity: 5, subscriptionType: 'on-demand', outstandingAmount: 0 },
    { name: 'Kavita Gupta', phone: '9866666666', email: 'kavita@example.com', address: '34, Rajajipuram', area: 'Rajajipuram', waterType: '20L Can', defaultQuantity: 2, subscriptionType: 'daily', outstandingAmount: 300 },
    { name: 'Deepak Verma', phone: '9877777777', email: 'deepak@example.com', address: '56, Vikas Nagar', area: 'Vikas Nagar', waterType: '20L Can', defaultQuantity: 1, subscriptionType: 'alternate', outstandingAmount: 0 },
    { name: 'Anita Mishra', phone: '9888888888', email: 'anita@example.com', address: '90, Chinhat', area: 'Chinhat', waterType: '10L Can', defaultQuantity: 2, subscriptionType: 'daily', outstandingAmount: 120 },
  ];
  const customerDataWithIds = customerData.map((c, idx) => ({
    ...c,
    customerId: `SWS${String(idx + 1).padStart(4, '0')}`
  }));
  const customers = await Customer.insertMany(customerDataWithIds);

  // Orders
  const statuses = ['pending', 'assigned', 'out-for-delivery', 'delivered', 'delivered', 'delivered'];
  const waterTypes = ['20L Can', '10L Can', '5L Bottle'];
  const prices = { '20L Can': 50, '10L Can': 30, '5L Bottle': 20 };

  const orders = [];
  for (let i = 0; i < 20; i++) {
    const cust = customers[i % customers.length];
    const wt = waterTypes[i % 3];
    const qty = Math.floor(Math.random() * 5) + 1;
    const price = prices[wt];
    const total = qty * price + 20;
    orders.push({
      customer: cust._id,
      waterType: wt,
      quantity: qty,
      pricePerUnit: price,
      deliveryCharge: 20,
      totalAmount: total,
      status: statuses[i % statuses.length],
      deliveryStaff: i % 2 === 0 ? delivery1._id : delivery2._id,
      paymentStatus: i % 3 === 0 ? 'paid' : i % 3 === 1 ? 'pending' : 'partial',
      paidAmount: i % 3 === 0 ? total : i % 3 === 2 ? Math.floor(total / 2) : 0,
      address: cust.address,
      area: cust.area,
    });
  }
  const ordersWithIds = orders.map((o, idx) => ({
    ...o,
    orderId: `ORD${String(idx + 1).padStart(5, '0')}`
  }));
  const createdOrders = await Order.insertMany(ordersWithIds);

  // Payments
  for (let i = 0; i < 10; i++) {
    await Payment.create({
      customer: customers[i % customers.length]._id,
      order: createdOrders[i]._id,
      amount: 250 + i * 50,
      method: ['cash', 'upi', 'bank-transfer'][i % 3],
      status: 'success',
      collectedBy: admin._id,
    });
  }

  // Complaints
  const complaintsData = [
    { customer: customers[0]._id, type: 'late-delivery', description: 'Delivery was 2 hours late', priority: 'high', status: 'open' },
    { customer: customers[1]._id, type: 'water-quality', description: 'Water has bad smell', priority: 'urgent', status: 'assigned', assignedTo: manager._id },
    { customer: customers[2]._id, type: 'billing', description: 'Incorrect bill amount', priority: 'medium', status: 'resolved', resolvedAt: new Date(), resolution: 'Bill corrected and re-issued' },
    { customer: customers[3]._id, type: 'damaged-can', description: 'Can was damaged on delivery', priority: 'low', status: 'in-progress', assignedTo: delivery1._id },
  ].map((comp, idx) => ({
    ...comp,
    complaintId: `CMP${String(idx + 1).padStart(4, '0')}`
  }));
  await Complaint.insertMany(complaintsData);

  console.log('✅ Seed data inserted successfully!');
  console.log('\n👤 Login Credentials:');
  console.log('   Admin   : admin@shambhavi.com / admin123');
  console.log('   Manager : manager@shambhavi.com / manager123');
  console.log('   Delivery: suresh@shambhavi.com / delivery123\n');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
