import mongoose from 'mongoose'

const helpRequestSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Requester is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      enum: [
        'education',
        'medical',
        'food',
        'shelter',
        'disaster_relief',
        'clothing',
        'mental_health',
        'other',
      ],
      required: [true, 'Category is required'],
      index: true,
    },
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
      index: true,
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
    beneficiaries: {
      type: Number,
      min: [1, 'At least 1 beneficiary'],
      required: [true, 'Number of beneficiaries is required'],
    },
    targetAmount: {
      type: Number,
      min: [0, 'Target amount cannot be negative'],
    },
    amountRaised: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'completed', 'closed', 'cancelled'],
      default: 'open',
      index: true,
    },
    deadline: Date,
    assignedNGO: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NGO',
    },
    supportingNGOs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'NGO',
      },
    ],
    images: [String],
    documents: [
      {
        name: String,
        url: String,
        uploadedAt: Date,
      },
    ],
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
      index: true,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verificationDate: Date,
    impact: {
      description: String,
      completionDate: Date,
    },
    tags: [String],
  },
  {
    timestamps: true,
  }
)

// Indexes
helpRequestSchema.index({ requester: 1 })
helpRequestSchema.index({ category: 1 })
helpRequestSchema.index({ urgency: 1 })
helpRequestSchema.index({ status: 1 })
helpRequestSchema.index({ 'location.city': 1 })
helpRequestSchema.index({ 'location.coordinates': '2dsphere' })
helpRequestSchema.index({ createdAt: -1 })

const HelpRequest = mongoose.model('HelpRequest', helpRequestSchema)

export default HelpRequest
