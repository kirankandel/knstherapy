const Category = require('../models/category.model');

// GET /api/categories
exports.getAll = async (req, res) => {
  const categories = await Category.find().sort({ createdAt: -1 });
  res.json(categories);
};

// POST /api/categories
exports.create = async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json(category);
};
