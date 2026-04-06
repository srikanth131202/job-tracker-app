/**
 * JobApplication Model
 * Stores parsed job application data from emails
 */

const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Applied', 'Interview', 'Offer', 'Rejected', 'Withdrawn'],
    default: 'Applied',
    index: true
  },
  appliedDate: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  emailSource: {
    messageId: {
      type: String,
      required: true
    },
    threadId: {
      type: String,
      required: true
    },
    from: {
      type: String,
      required: true
    },
    subject: {
      type: String,
      required: true
    },
    snippet: {
      type: String
    },
    receivedAt: {
      type: Date,
      required: true
    }
  },
  interviewDetails: {
    scheduled: {
      type: Boolean,
      default: false
    },
    date: {
      type: Date
    },
    time: {
      type: String
    },
    type: {
      type: String,
      enum: ['Phone', 'Video', 'Onsite', 'Technical', 'HR', 'Other']
    },
    notes: {
      type: String
    }
  },
  location: {
    type: String,
    default: 'Remote'
  },
  salary: {
    min: {
      type: Number
    },
    max: {
      type: Number
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  jobUrl: {
    type: String
  },
  notes: {
    type: String,
    default: ''
  },
  tags: {
    type: [String],
    default: []
  },
  aiParsed: {
    type: Boolean,
    default: false
  },
  rawEmailContent: {
    type: String
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
jobApplicationSchema.index({ userId: 1, status: 1 });
jobApplicationSchema.index({ userId: 1, appliedDate: -1 });
jobApplicationSchema.index({ userId: 1, company: 1 });

// Static method to get dashboard stats for a user
jobApplicationSchema.statics.getStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const result = {
    total: 0,
    applied: 0,
    interview: 0,
    offer: 0,
    rejected: 0,
    withdrawn: 0
  };

  stats.forEach(stat => {
    result.total += stat.count;
    switch (stat._id) {
      case 'Applied':
        result.applied = stat.count;
        break;
      case 'Interview':
        result.interview = stat.count;
        break;
      case 'Offer':
        result.offer = stat.count;
        break;
      case 'Rejected':
        result.rejected = stat.count;
        break;
      case 'Withdrawn':
        result.withdrawn = stat.count;
        break;
    }
  });

  return result;
};

module.exports = mongoose.model('JobApplication', jobApplicationSchema);
