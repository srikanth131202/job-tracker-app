/**
 * User Model
 * Stores user information and Google OAuth tokens
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },
  googleToken: {
    type: String,
    required: true
  },
  refreshToken: {
    type: String
  },
  preferences: {
    syncEnabled: {
      type: Boolean,
      default: true
    },
    syncInterval: {
      type: Number,
      default: 15 // minutes
    },
    emailFilters: {
      type: [String],
      default: ['job application', 'interview', 'hiring', 'recruiter']
    }
  },
  lastSyncAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
