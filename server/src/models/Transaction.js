import mongoose from 'mongoose'

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    ngo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NGO',
      required: [true, 'NGO is required'],
      index: true,
    },
    donation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD', 'EUR'],
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'debit_card', 'upi', 'bank_transfer', 'wallet', 'netbanking'],
      required: [true, 'Payment method is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
      default: 'pending',
      index: true,
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    razorpayPaymentId: String,
    razorpayOrderId: {
      type: String,
      index: true,
    },
    razorpaySignature: String,
    paymentGateway: {
      type: String,
      enum: ['razorpay', 'stripe', 'paypal', 'manual'],
      default: 'razorpay',
    },
    receipt: {
      number: String,
      url: String,
    },
    errorMessage: String,
    failureReason: String,
    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    refundDate: Date,
    refundReason: String,
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
    notes: String,
    ipAddress: String,
    userAgent: String,
  },
  {
    timestamps: true,
  }
)

// Indexes for frequently queried fields
transactionSchema.index({ user: 1, createdAt: -1 })
transactionSchema.index({ ngo: 1, createdAt: -1 })
transactionSchema.index({ status: 1 })
transactionSchema.index({ transactionId: 1 })
transactionSchema.index({ razorpayOrderId: 1 })
transactionSchema.index({ paymentMethod: 1 })

const Transaction = mongoose.model('Transaction', transactionSchema)

export default Transaction
