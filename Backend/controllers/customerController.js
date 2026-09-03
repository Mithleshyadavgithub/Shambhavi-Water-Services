const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Payment = require('../models/Payment');

// @GET /api/customers
exports.getCustomers = async (req, res) => {
  try {
    const { search, area, status, page = 1, limit = 10 } = req.query;
    const query = {};
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { customerId: { $regex: search, $options: 'i' } },
    ];
    if (area) query.area = area;
    if (status) query.status = status;

    const total = await Customer.countDocuments(query);
    const customers = await Customer.find(query)
      .skip((page - 1) * limit).limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({ success: true, data: customers, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @GET /api/customers/:id
exports.getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    const orders = await Order.find({ customer: customer._id }).sort({ createdAt: -1 }).limit(10);
    const payments = await Payment.find({ customer: customer._id }).sort({ createdAt: -1 }).limit(10);
    res.json({ success: true, data: { customer, orders, payments } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @POST /api/customers
exports.createCustomer = async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json({ success: true, data: customer });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @PUT /api/customers/:id
exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.json({ success: true, data: customer });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @DELETE /api/customers/:id
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, { status: 'inactive' }, { new: true });
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.json({ success: true, message: 'Customer deactivated' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
