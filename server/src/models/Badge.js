import mongoose from 'mongoose'

const badgeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Badge name is required'],
      unique: true,
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    icon: {
      type: String,
      required: [true, 'Badge icon URL is required'],
    },
    category: {
      type: String,
      enum: [
        'volunteering',
        'donation',
        'participation',
        'achievement',
        'milestone',
        'special',
      ],
      required: [true, 'Category is required'],
      index: true,
    },
    criteria: {
      type: {
        type: String,
        enum: ['volunteer_hours', 'donation_amount', 'event_count', 'custom'],
        required: [true, 'Criteria type is required'],
      },
      value: {
        type: Number,
        min: 0,
      },
      description: String,
    },
    rarity: {
      type: String,
      enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
      default: 'common',
    },
    holders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    awardedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes
badgeSchema.index({ category: 1 })
badgeSchema.index({ isActive: 1 })

const Badge = mongoose.model('Badge', badgeSchema)

export default Badge
