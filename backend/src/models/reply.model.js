const mongoose = require('mongoose');
const { paginate, toJSON } = require('./plugins');

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
    timestamps: true,        
  }
);

// Convert Mongoose documents to clean JSON
replySchema.plugin(toJSON);
replySchema.plugin(paginate);
/**
 *  @typedef {import('mongoose').Document & typeof replySchema.obj} Reply
 */
const Reply = mongoose.model('Reply', replySchema);

module.exports = Reply;
