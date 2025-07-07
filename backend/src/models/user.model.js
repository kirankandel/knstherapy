const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');
const { roles } = require('../config/roles');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      validate(value) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error('Password must contain at least one letter and one number');
        }
      },
      private: true, // used by the toJSON plugin
    },
    role: {
      type: String,
      enum: roles,
      default: 'user',
    },
    userType: {
      type: String,
      enum: ['community_user', 'therapist', 'admin'],
      default: 'community_user',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    profile: {
      avatar: {
        type: String, // URL to profile image
      },
      bio: {
        type: String,
        maxlength: 500,
      },
      location: {
        type: String,
        trim: true,
      },
      timezone: {
        type: String,
        default: 'UTC',
      },
    },
    // Community user specific fields
    communityProfile: {
      username: {
        type: String,
        unique: true,
        sparse: true, // allows null values and uniqueness
        trim: true,
        minlength: 3,
        maxlength: 20,
        validate: {
          validator: function(v) {
            return !v || /^[a-zA-Z0-9_]+$/.test(v);
          },
          message: 'Username can only contain letters, numbers, and underscores'
        }
      },
      joinedAt: {
        type: Date,
        default: Date.now,
      },
      karma: {
        type: Number,
        default: 0,
      },
      badges: [{
        name: String,
        description: String,
        earnedAt: {
          type: Date,
          default: Date.now,
        }
      }],
    },
    // Therapist specific fields
    therapistProfile: {
      licenseNumber: {
        type: String,
        unique: true,
        sparse: true,
      },
      specialties: [{
        type: String,
        enum: [
          'anxiety',
          'depression',
          'trauma',
          'relationships',
          'addiction',
          'grief',
          'eating_disorders',
          'family_therapy',
          'couples_therapy',
          'child_therapy',
          'cognitive_behavioral',
          'mindfulness',
          'other'
        ],
      }],
      credentials: [{
        type: {
          type: String,
          enum: ['degree', 'certification', 'license'],
        },
        name: String,
        institution: String,
        year: Number,
        verificationStatus: {
          type: String,
          enum: ['pending', 'verified', 'rejected'],
          default: 'pending',
        }
      }],
      experience: {
        yearsOfPractice: {
          type: Number,
          min: 0,
        },
        totalCases: {
          type: Number,
          default: 0,
        },
        completedSessions: {
          type: Number,
          default: 0,
        },
      },
      rating: {
        average: {
          type: Number,
          default: 0,
          min: 0,
          max: 5,
        },
        totalReviews: {
          type: Number,
          default: 0,
        }
      },
      availability: {
        isAvailable: {
          type: Boolean,
          default: false,
        },
        workingHours: [{
          day: {
            type: String,
            enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
          },
          startTime: String, // Format: "09:00"
          endTime: String,   // Format: "17:00"
        }],
        maxConcurrentSessions: {
          type: Number,
          default: 5,
        },
        sessionTypes: [{
          type: String,
          enum: ['text', 'voice', 'video'],
        }],
      },
      contact: {
        phone: {
          type: String,
          validate: {
            validator: function(v) {
              return !v || validator.isMobilePhone(v);
            },
            message: 'Please provide a valid phone number'
          }
        },
        professionalEmail: {
          type: String,
          validate: {
            validator: function(v) {
              return !v || validator.isEmail(v);
            },
            message: 'Please provide a valid email'
          }
        },
        website: {
          type: String,
          validate: {
            validator: function(v) {
              return !v || validator.isURL(v);
            },
            message: 'Please provide a valid URL'
          }
        },
      },
      verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected', 'suspended'],
        default: 'pending',
      },
      verifiedAt: Date,
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    preferences: {
      notifications: {
        email: {
          type: Boolean,
          default: true,
        },
        push: {
          type: Boolean,
          default: true,
        },
        newMessages: {
          type: Boolean,
          default: true,
        },
        sessionReminders: {
          type: Boolean,
          default: true,
        },
      },
      privacy: {
        showOnlineStatus: {
          type: Boolean,
          default: false, // Privacy first
        },
        allowDirectMessages: {
          type: Boolean,
          default: false,
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);
userSchema.plugin(paginate);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Check if username is taken (for community users)
 * @param {string} username - The username
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isUsernameTaken = async function (username, excludeUserId) {
  const user = await this.findOne({ 
    'communityProfile.username': username, 
    _id: { $ne: excludeUserId } 
  });
  return !!user;
};

/**
 * Check if license number is taken (for therapists)
 * @param {string} licenseNumber - The license number
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isLicenseNumberTaken = async function (licenseNumber, excludeUserId) {
  const user = await this.findOne({ 
    'therapistProfile.licenseNumber': licenseNumber, 
    _id: { $ne: excludeUserId } 
  });
  return !!user;
};

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

/**
 * Check if user is a verified therapist
 * @returns {boolean}
 */
userSchema.methods.isVerifiedTherapist = function () {
  return this.userType === 'therapist' && 
         this.therapistProfile && 
         this.therapistProfile.verificationStatus === 'verified';
};

/**
 * Check if therapist is currently available
 * @returns {boolean}
 */
userSchema.methods.isAvailable = function () {
  if (this.userType !== 'therapist') return false;
  return this.therapistProfile && 
         this.therapistProfile.availability && 
         this.therapistProfile.availability.isAvailable &&
         this.isActive;
};

/**
 * Update therapist rating
 * @param {number} newRating - Rating from 1-5
 */
userSchema.methods.updateRating = async function (newRating) {
  if (this.userType !== 'therapist') return;
  
  const currentAverage = this.therapistProfile.rating.average || 0;
  const currentTotal = this.therapistProfile.rating.totalReviews || 0;
  
  const newTotal = currentTotal + 1;
  const newAverage = ((currentAverage * currentTotal) + newRating) / newTotal;
  
  this.therapistProfile.rating.average = Math.round(newAverage * 100) / 100; // Round to 2 decimal places
  this.therapistProfile.rating.totalReviews = newTotal;
  
  await this.save();
};

/**
 * Increment completed sessions for therapist
 */
userSchema.methods.incrementCompletedSessions = async function () {
  if (this.userType !== 'therapist') return;
  
  this.therapistProfile.experience.completedSessions += 1;
  this.lastActive = new Date();
  await this.save();
};

userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

/**
 * @typedef User
 */
const User = mongoose.model('User', userSchema);

module.exports = User;
