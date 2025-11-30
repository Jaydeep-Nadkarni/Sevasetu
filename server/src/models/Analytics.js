import mongoose from 'mongoose'

const analyticsSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: [true, 'Date is required'],
      index: true,
    },
    ngo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NGO',
      index: true,
    },
    metrics: {
      totalUsers: {
        type: Number,
        default: 0,
        min: 0,
      },
      activeUsers: {
        type: Number,
        default: 0,
        min: 0,
      },
      newUsers: {
        type: Number,
        default: 0,
        min: 0,
      },
      totalNGOs: {
        type: Number,
        default: 0,
        min: 0,
      },
      activeNGOs: {
        type: Number,
        default: 0,
        min: 0,
      },
      totalDonations: {
        count: {
          type: Number,
          default: 0,
          min: 0,
        },
        amount: {
          type: Number,
          default: 0,
          min: 0,
        },
        currency: {
          type: String,
          default: 'INR',
        },
      },
      totalEvents: {
        count: {
          type: Number,
          default: 0,
          min: 0,
        },
        participants: {
          type: Number,
          default: 0,
          min: 0,
        },
        volunteerHours: {
          type: Number,
          default: 0,
          min: 0,
        },
      },
      helpRequests: {
        count: {
          type: Number,
          default: 0,
          min: 0,
        },
        fulfilled: {
          type: Number,
          default: 0,
          min: 0,
        },
      },
      certificates: {
        issued: {
          type: Number,
          default: 0,
          min: 0,
        },
      },
      badges: {
        awarded: {
          type: Number,
          default: 0,
          min: 0,
        },
      },
      transactions: {
        count: {
          type: Number,
          default: 0,
          min: 0,
        },
        successRate: {
          type: Number,
          default: 0,
          min: 0,
          max: 100,
        },
      },
    },
    pageViews: {
      home: { type: Number, default: 0 },
      ngos: { type: Number, default: 0 },
      events: { type: Number, default: 0 },
      donations: { type: Number, default: 0 },
      helpRequests: { type: Number, default: 0 },
      profile: { type: Number, default: 0 },
    },
    engagement: {
      avgSessionDuration: {
        type: Number,
        default: 0,
        min: 0,
      },
      bounceRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      returnUsers: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    performance: {
      apiResponseTime: {
        type: Number,
        default: 0,
        min: 0,
      },
      errorRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      uptime: {
        type: Number,
        default: 100,
        min: 0,
        max: 100,
      },
    },
    topDonators: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        amount: Number,
      },
    ],
    topNGOs: [
      {
        ngo: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'NGO',
        },
        donations: Number,
        volunteers: Number,
      },
    ],
    notes: String,
  },
  {
    timestamps: true,
  }
)

// Indexes
analyticsSchema.index({ date: -1 })
analyticsSchema.index({ ngo: 1, date: -1 })

const Analytics = mongoose.model('Analytics', analyticsSchema)

export default Analytics
