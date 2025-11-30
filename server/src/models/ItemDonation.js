import mongoose from 'mongoose'

const itemDonationSchema = new mongoose.Schema(
  {
    // Donor information
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Donation items
    items: {
      category: {
        type: String,
        enum: ['food', 'clothes', 'essentials', 'medical', 'electronics', 'books', 'other'],
        required: true,
        index: true,
      },
      description: {
        type: String,
        required: true,
        maxlength: 2000,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      unit: {
        type: String,
        enum: ['kg', 'lbs', 'pieces', 'boxes', 'items', 'liters', 'packs', 'count'],
        required: true,
      },
      specificItems: {
        type: [String], // e.g., ["Rice 5kg", "Wheat 10kg", "Pulses 2kg"]
        default: [],
      },
      qualityCondition: {
        type: String,
        enum: ['new', 'like-new', 'good', 'fair', 'used'],
        default: 'good',
      },
      expiryDate: Date, // For food items
    },

    // Location details (geospatial)
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        index: '2dsphere',
      },
      address: {
        type: String,
        required: true,
      },
      city: String,
      state: String,
      zipcode: String,
    },

    // Images
    images: [
      {
        url: String,
        publicId: String, // Cloudinary publicId for deletion
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Donation status
    status: {
      type: String,
      enum: ['pending', 'accepted', 'in-progress', 'completed', 'cancelled', 'rejected'],
      default: 'pending',
      index: true,
    },

    // NGO assignment (auto-assigned by algorithm)
    assignedNGOs: [
      {
        ngo: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'NGO',
        },
        assignedAt: Date,
        distanceKm: Number,
        status: {
          type: String,
          enum: ['pending', 'accepted', 'rejected', 'in-progress', 'completed'],
          default: 'pending',
        },
        acceptedAt: Date,
        completedAt: Date,
        notes: String,
        contactAttempts: {
          type: Number,
          default: 0,
        },
      },
    ],

    // Primary NGO (the one who accepted)
    primaryNGO: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NGO',
      default: null,
    },

    // Schedule
    pickupSchedule: {
      preferredDate: Date,
      preferredTime: String, // "09:00-12:00", "12:00-15:00", etc.
      isFlexible: {
        type: Boolean,
        default: true,
      },
      actualPickupDate: Date,
    },

    // Contact details
    contactPerson: {
      name: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      email: String,
    },

    // Additional information
    specialInstructions: String,
    accessInstructions: String, // How to access the location (buzzer, gate code, etc.)

    // Activity log
    activityLog: [
      {
        action: {
          type: String,
          enum: ['created', 'assigned', 'accepted', 'rejected', 'contacted', 'in-progress', 'completed', 'cancelled'],
        },
        ngo: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'NGO',
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        message: String,
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],

    // Notifications
    notifications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Notification',
      },
    ],

    // Verification
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedBy: mongoose.Schema.Types.ObjectId, // Admin/Moderator
    verifiedAt: Date,

    // Tags for better filtering
    tags: [String],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// Geospatial index for finding nearby NGOs
itemDonationSchema.index({ 'location.coordinates': '2dsphere' })

// Additional indexes
itemDonationSchema.index({ donor: 1, createdAt: -1 })
itemDonationSchema.index({ 'assignedNGOs.ngo': 1 })
itemDonationSchema.index({ status: 1 })
itemDonationSchema.index({ 'items.category': 1 })
itemDonationSchema.index({ createdAt: -1 })

// Virtual for item summary
itemDonationSchema.virtual('itemsSummary').get(function () {
  const { category, quantity, unit, description } = this.items
  return `${quantity} ${unit} of ${category} - ${description}`
})

// Virtual for assigned NGO count
itemDonationSchema.virtual('assignedNGOCount').get(function () {
  return this.assignedNGOs?.length || 0
})

// Method to get assigned NGOs within radius
itemDonationSchema.methods.getAssignedNGOs = function () {
  return this.assignedNGOs.filter(a => a.status !== 'rejected')
}

// Method to mark as completed
itemDonationSchema.methods.markCompleted = async function (ngoId) {
  const ngoEntry = this.assignedNGOs.find(a => a.ngo.toString() === ngoId.toString())
  if (ngoEntry) {
    ngoEntry.status = 'completed'
    ngoEntry.completedAt = new Date()
  }

  // Log activity
  this.activityLog.push({
    action: 'completed',
    ngo: ngoId,
    message: `Donation marked as completed by NGO`,
  })

  if (this.assignedNGOs.every(a => a.status === 'completed' || a.status === 'rejected')) {
    this.status = 'completed'
  }

  return this.save()
}

export default mongoose.model('ItemDonation', itemDonationSchema)
