import mongoose from 'mongoose'

const ngoSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'NGO name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    mission: {
      type: String,
      required: [true, 'Mission statement is required'],
      maxlength: [1000, 'Mission cannot exceed 1000 characters'],
    },
    vision: {
      type: String,
      maxlength: [1000, 'Vision cannot exceed 1000 characters'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'NGO must have an owner'],
      index: true,
    },
    registrationNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    logo: String,
    coverImage: String,
    category: {
      type: String,
      enum: [
        'Education',
        'Healthcare',
        'Environment',
        'Social Welfare',
        'Disaster Relief',
        'Food & Nutrition',
        'Women Empowerment',
        'Child Welfare',
        'Community Development',
        'Other',
      ],
      required: [true, 'Category is required'],
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
        index: true,
      },
      zipCode: String,
      country: {
        type: String,
        default: 'India',
      },
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          index: '2dsphere',
        },
      },
    },
    contact: {
      email: {
        type: String,
        required: [true, 'Contact email is required'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email'],
      },
      phone: {
        type: String,
        required: [true, 'Contact phone is required'],
        match: [/^[0-9]{10}$/, 'Phone must be 10 digits'],
      },
      website: String,
    },
    socialMedia: {
      facebook: String,
      twitter: String,
      linkedin: String,
      instagram: String,
    },
    team: [
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
    totalDonations: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalVolunteerHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    images: [String],
    documents: [
      {
        name: String,
        url: String,
        uploadedAt: Date,
      },
    ],
  },
  {
    timestamps: true,
  }
)

// Indexes for frequently queried fields
ngoSchema.index({ name: 'text', description: 'text', mission: 'text' })
ngoSchema.index({ owner: 1 })
ngoSchema.index({ category: 1 })
ngoSchema.index({ 'location.city': 1 })
ngoSchema.index({ verificationStatus: 1 })
ngoSchema.index({ isActive: 1 })
ngoSchema.index({ createdAt: -1 })
ngoSchema.index({ 'location.coordinates': '2dsphere' })

const NGO = mongoose.model('NGO', ngoSchema)

export default NGO
