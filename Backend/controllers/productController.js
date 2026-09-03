const Product = require('../models/Product');

// @GET /api/products
exports.getProducts = async (req, res) => {
  try {
    const { search, category, customerType, active = true, page = 1, limit = 20 } = req.query;
    const query = {};
    if (active !== 'all') query.active = active === 'true';
    if (category) query.category = category;
    if (customerType) query.customerTypes = customerType;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
        { size: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('relatedProducts', 'name price size category')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({ success: true, data: products, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @GET /api/products/:id
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('relatedProducts', 'name price size category stock');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @POST /api/products (admin)
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

// @PUT /api/products/:id (admin)
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

// @DELETE /api/products/:id (admin) — soft delete
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product deactivated' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @POST /api/products/:id/stock — update stock (admin/delivery)
exports.updateStock = async (req, res) => {
  try {
    const { adjustment, reason } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    product.stock = Math.max(0, product.stock + Number(adjustment));
    await product.save();
    res.json({ success: true, data: product, newStock: product.stock });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @GET /api/products/catalog — AI-readable catalog (no auth needed)
exports.getAICatalog = async (req, res) => {
  try {
    const products = await Product.find({ active: true })
      .select('name description category size price mrp stock subscriptionAvailable subscriptionDiscount customerTypes tags aiDescription useCases recommendFor monthlyUsageEstimate relatedProducts')
      .populate('relatedProducts', 'name price size');
    res.json({ success: true, data: products, total: products.length });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
