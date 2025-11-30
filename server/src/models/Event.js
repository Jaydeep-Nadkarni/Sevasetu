import mongoose from 'mongoose'

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    ngo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NGO',
      required: [true, 'NGO is required'],
      index: true,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Organizer is required'],
      index: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      index: true,
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        validator: function (value) {
          return value > this.startDate
        },
        message: 'End date must be after start date',
      },
    },
    location: {
      address: {
        type: String,
        required: [true, 'Address is required'],
      },
      city: {
        type: String,
        required: [true, 'City is required'],
        index: true,
      },
      state: {
        type: String,
        required: [true, 'State is required'],
      },
      zipCode: String,
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: {
          type: [Number],
          index: '2dsphere',
        },
      },
    },
    category: {
      type: String,
      enum: ['volunteering', 'fundraising', 'awareness', 'educational', 'other'],
      required: [true, 'Category is required'],
      index: true,
    },
    capacity: {
      type: Number,
      min: [1, 'Capacity must be at least 1'],
    },
    registrations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    volunteers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    banner: String,
    images: [String],
    targetVolunteerHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    actualVolunteerHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    budget: {
      type: Number,
      min: 0,
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
      index: true,
    },
    attendanceTracking: {
      type: Boolean,
      default: false,
    },
    qrEnabled: {
      type: Boolean,
      default: false,
    },
    certificateTemplate: String,
    tags: [String],
    impact: {
      description: String,
      metrics: [
        {
          name: String,
          value: String,
        },
      ],
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes
eventSchema.index({ ngo: 1, startDate: 1 })
eventSchema.index({ organizer: 1 })
eventSchema.index({ category: 1 })
eventSchema.index({ status: 1 })
eventSchema.index({ 'location.city': 1 })
eventSchema.index({ startDate: 1 })
eventSchema.index({ 'location.coordinates': '2dsphere' })

const Event = mongoose.model('Event', eventSchema)

export default Event
