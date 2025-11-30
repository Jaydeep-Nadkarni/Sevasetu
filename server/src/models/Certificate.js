import mongoose from 'mongoose'

const certificateSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient is required'],
      index: true,
    },
    issuer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NGO',
      required: [true, 'Issuer NGO is required'],
      index: true,
    },
    type: {
      type: String,
      enum: ['volunteering', 'donation', 'event_participation', 'achievement', 'custom'],
      required: [true, 'Certificate type is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
    },
    donation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
    },
    volunteerHours: {
      type: Number,
      min: 0,
    },
    amount: {
      type: Number,
      min: 0,
    },
    issueDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    expiryDate: Date,
    certificateNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    certificateUrl: String,
    qrCode: String,
    isVerified: {
      type: Boolean,
      default: true,
    },
    template: {
      name: String,
      customContent: String,
    },
    tags: [String],
  },
  {
    timestamps: true,
  }
)

// Generate certificate number before saving
certificateSchema.pre('save', async function (next) {
  if (!this.certificateNumber) {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 10000)
    this.certificateNumber = `CERT-${timestamp}-${random}`
  }
  next()
})

// Indexes
certificateSchema.index({ recipient: 1 })
certificateSchema.index({ issuer: 1 })
certificateSchema.index({ issueDate: -1 })
certificateSchema.index({ type: 1 })
certificateSchema.index({ certificateNumber: 1 })

const Certificate = mongoose.model('Certificate', certificateSchema)

export default Certificate
