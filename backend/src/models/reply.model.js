const mongoose = require('mongoose');
const { paginate, toJSON } = require('./plugins');

const replySchema = mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post', // FK to parent post
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

// Plugins
replySchema.plugin(toJSON);
replySchema.plugin(paginate);

/**
 * @typedef {import('mongoose').Document & {
 *   post: mongoose.Types.ObjectId,
 *   user: mongoose.Types.ObjectId,
 *   title: string,
 *   description: string,
 *   createdAt: Date,
 *   updatedAt: Date,
 * }} Reply
 */
const Reply = mongoose.model('Reply', replySchema);

module.exports = Reply;
