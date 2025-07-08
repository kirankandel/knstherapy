const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const ratingSchema = mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      trim: true,
    },
    therapistId: {
      type: String,
      required: true,
      trim: true,
    },
    clientId: {
      type: String,
      required: true,
      trim: true,
    },
    sessionType: {
      type: String,
      enum: ['text', 'audio', 'video'],
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: function(v) {
          return Number.isInteger(v) && v >= 1 && v <= 5;
        },
        message: 'Rating must be an integer between 1 and 5'
      }
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    isAnonymous: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add text indexes for search
ratingSchema.index({ therapistId: 1, createdAt: -1 });
ratingSchema.index({ sessionId: 1 });
ratingSchema.index({ rating: 1 });

// Add plugin that converts mongoose to json
ratingSchema.plugin(toJSON);
ratingSchema.plugin(paginate);

/**
 * Check if a rating already exists for this session
 * @param {string} sessionId
 * @returns {Promise<boolean>}
 */
ratingSchema.statics.isRatingExists = async function (sessionId) {
  const rating = await this.findOne({ sessionId });
  return !!rating;
};

/**
 * Get average rating for a therapist
 * @param {string} therapistId
 * @returns {Promise<Object>}
 */
ratingSchema.statics.getTherapistStats = async function (therapistId) {
  const stats = await this.aggregate([
    { $match: { therapistId } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalRatings: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);

  if (stats.length === 0) {
    return {
      averageRating: 0,
      totalRatings: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }

  const result = stats[0];
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  result.ratingDistribution.forEach(rating => {
    distribution[rating] = (distribution[rating] || 0) + 1;
  });

  return {
    averageRating: Math.round(result.averageRating * 10) / 10, // Round to 1 decimal
    totalRatings: result.totalRatings,
    ratingDistribution: distribution
  };
};

/**
 * @typedef Rating
 */
const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating;
