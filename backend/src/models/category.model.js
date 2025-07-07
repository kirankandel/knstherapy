const mongoose = require('mongoose');
const { toJSON } = require('../models/plugins');          // keep your existing plugin

const categorySchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, required: true },
    color:       { type: String, required: true, trim: true }, // e.g. “blue”
  },
  { timestamps: true }
);

categorySchema.plugin(toJSON);

module.exports = mongoose.model('Category', categorySchema);
