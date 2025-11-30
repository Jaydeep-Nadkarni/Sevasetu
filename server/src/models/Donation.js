import mongoose from 'mongoose'

const donationSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Donor is required'],
      index: true,
    },
    ngo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NGO',
      required: [true, 'NGO is required'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [1, 'Amount must be greater than 0'],
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD', 'EUR'],
    },
    type: {
      type: String,
      enum: ['monetary', 'supplies', 'service', 'skill'],
      required: [true, 'Donation type is required'],
      index: true,
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'debit_card', 'upi', 'bank_transfer', 'wallet', 'other'],
    },
    razorpayPaymentId: String,
    razorpayOrderId: String,
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    certificateGenerated: {
      type: Boolean,
      default: false,
    },
    certificate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Certificate',
    },
    notes: String,
    receipt: String,
    taxDeductible: {
      type: Boolean,
      default: true,
    },
    panNumber: String,
  },
  {
    timestamps: true,
  }
)

// Indexes for frequently queried fields
donationSchema.index({ donor: 1, createdAt: -1 })
donationSchema.index({ ngo: 1, createdAt: -1 })
donationSchema.index({ status: 1 })
donationSchema.index({ type: 1 })
donationSchema.index({ createdAt: -1 })

const Donation = mongoose.model('Donation', donationSchema)

export default Donation
