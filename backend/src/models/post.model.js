const mongoose = require('mongoose');
const { paginate, toJSON } = require('./plugins');

const postSchema = mongoose.Schema(
  {
    time: {
      type: Date,
      default: Date.now,  
      required: true,
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
    category: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,       
  }
);

// Convert Mongoose documents to clean JSON
postSchema.plugin(toJSON);
postSchema.plugin(paginate);
/**
 * @typedef Post
 */
const Post = mongoose.model('Post', postSchema);

module.exports = Post;
