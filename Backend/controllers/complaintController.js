const Complaint = require('../models/Complaint');

exports.getComplaints = async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 10 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .populate('customer', 'name phone customerId')
      .populate('assignedTo', 'name')
      .skip((page - 1) * limit).limit(Number(limit))
      .sort({ createdAt: -1 });
    res.json({ success: true, data: complaints, total, pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.create(req.body);
    res.status(201).json({ success: true, data: complaint });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateComplaint = async (req, res) => {
  try {
    if (req.body.status === 'resolved') req.body.resolvedAt = new Date();
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('customer', 'name phone');
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    res.json({ success: true, data: complaint });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
