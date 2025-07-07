const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const replySchema = mongoose.Schema(
  {
    post: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Post',          // foreign‑key reference to the parent post
      required: true,
      index: true,
    },
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,        // createdAt / updatedAt automatically handled
  }
);

// Convert Mongoose documents to clean JSON
replySchema.plugin(toJSON);

/**
 * @typedef Reply
 */
const Reply = mongoose.model('Reply', replySchema);

module.exports = Reply;
