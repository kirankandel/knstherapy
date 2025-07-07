const mongoose = require('mongoose');

const messageSchema = mongoose.Schema(
  {
    messageId: {
      type: String,
      required: true,
      unique: true,
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    senderType: {
      type: String,
      enum: ['user', 'therapist', 'system'],
      required: true,
    },
    senderId: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    messageType: {
      type: String,
      enum: ['text', 'system', 'media'],
      default: 'text',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    isEncrypted: {
      type: Boolean,
      default: true,
    },
    metadata: {
      type: Map,
      of: String,
    },
  },
  {
    timestamps: true,
    // Auto-delete messages after 24 hours for privacy
    expireAfterSeconds: 86400,
  }
);

const sessionSchema = mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      default: 'anonymous',
    },
    therapistId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['waiting', 'active', 'ended'],
      default: 'waiting',
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    sessionType: {
      type: String,
      enum: ['text', 'voice'],
      default: 'text',
    },
    participants: [
      {
        participantId: String,
        participantType: {
          type: String,
          enum: ['user', 'therapist'],
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        leftAt: Date,
      },
    ],
    metadata: {
      userPreferences: {
        type: Map,
        of: String,
      },
      therapistSpecialties: [String],
      sessionNotes: String,
    },
  },
  {
    timestamps: true,
    // Auto-delete sessions after 24 hours for privacy
    expireAfterSeconds: 86400,
  }
);

// Indexes for better query performance
messageSchema.index({ sessionId: 1, timestamp: 1 });
sessionSchema.index({ status: 1, createdAt: 1 });
sessionSchema.index({ therapistId: 1, status: 1 });

const Message = mongoose.model('Message', messageSchema);
const Session = mongoose.model('Session', sessionSchema);

module.exports = {
  Message,
  Session,
};
