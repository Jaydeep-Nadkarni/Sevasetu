import crypto from 'crypto'
import razorpay from '../config/razorpay.js'
import config from '../config/config.js'
import Transaction from '../models/Transaction.js'
import Donation from '../models/Donation.js'
import User from '../models/User.js'
import NGO from '../models/NGO.js'
import { asyncHandler, successResponse, errorResponse } from '../utils/helpers.js'
import { addPoints, calculateDonationPoints } from '../utils/pointsSystem.js'
import { sendEmail } from '../utils/email.js'
import { sendNotification } from '../services/notificationService.js'

// @desc    Create Razorpay Order
// @route   POST /api/payment/create-order
// @access  Private
export const createOrder = asyncHandler(async (req, res) => {
  const { amount, currency = 'INR', ngoId, isAnonymous = false, notes } = req.body

  if (!amount || amount < 1) {
    return errorResponse(res, 'Invalid amount', 400)
  }

  // Create Razorpay Order
  const options = {
    amount: Math.round(amount * 100), // Amount in smallest currency unit (paise)
    currency,
    receipt: `receipt_${Date.now()}`,
    notes: {
      userId: req.user._id.toString(),
      ngoId: ngoId || 'platform',
      type: 'donation'
    }
  }

  try {
    const order = await razorpay.orders.create(options)

    // Create Transaction Record
    let targetNgoId = ngoId
    if (!targetNgoId) {
      const systemNgo = await NGO.findOne({ isSystem: true })
      targetNgoId = systemNgo ? systemNgo._id : (await NGO.findOne())?._id
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      ngo: targetNgoId, // Fallback to system NGO if platform donation
      amount,
      currency,
      paymentMethod: 'netbanking', // Default, will update on success
      status: 'pending',
      razorpayOrderId: order.id,
      notes,
      metadata: {
        isAnonymous
      }
    })

    successResponse(res, {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: config.razorpay.keyId,
      transactionId: transaction._id
    }, 'Order created successfully')

  } catch (error) {
    console.error('Razorpay Order Error:', error)
    return errorResponse(res, 'Failed to create payment order', 500)
  }
})

// @desc    Verify Payment
// @route   POST /api/payment/verify
// @access  Private
export const verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    ngoId,
    isAnonymous,
    notes
  } = req.body

  const body = razorpay_order_id + '|' + razorpay_payment_id

  const expectedSignature = crypto
    .createHmac('sha256', config.razorpay.keySecret)
    .update(body.toString())
    .digest('hex')

  const isAuthentic = expectedSignature === razorpay_signature

  if (isAuthentic) {
    // 1. Update Transaction
    const transaction = await Transaction.findOne({ razorpayOrderId: razorpay_order_id })
    
    if (!transaction) {
      return errorResponse(res, 'Transaction not found', 404)
    }

    transaction.status = 'completed'
    transaction.razorpayPaymentId = razorpay_payment_id
    transaction.razorpaySignature = razorpay_signature
    transaction.paymentMethod = 'upi' // Ideally fetch from Razorpay payment details
    await transaction.save()

    // 2. Create Donation Record
    const donation = await Donation.create({
      donor: req.user._id,
      ngo: transaction.ngo,
      amount: transaction.amount,
      currency: transaction.currency,
      type: 'monetary',
      status: 'completed',
      transaction: transaction._id,
      paymentMethod: 'online',
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      isAnonymous: isAnonymous || false,
      notes: notes || transaction.notes
    })

    // Update transaction with donation ref
    transaction.donation = donation._id
    await transaction.save()

    // 3. Award Points
    const points = calculateDonationPoints('money', transaction.amount)
    const pointsResult = await addPoints(req.user._id, points, 'donation')

    // 4. Send Receipt Email
    const user = await User.findById(req.user._id)
    const ngo = await NGO.findById(transaction.ngo)
    
    const emailSubject = `Donation Receipt - ${donation._id}`
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Thank You for Your Donation!</h2>
        <p>Hi ${user.firstName},</p>
        <p>We have successfully received your donation of <strong>${transaction.currency} ${transaction.amount}</strong>.</p>
        
        <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Transaction ID:</strong> ${razorpay_payment_id}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Beneficiary:</strong> ${ngo ? ngo.name : 'SevaSetu Platform'}</p>
        </div>

        <p>You earned <strong>${points} points</strong> for this contribution!</p>
        
        <p>Your support helps us make a real difference.</p>
        <p>Best regards,<br>The SevaSetu Team</p>
      </div>
    `
    
    // Don't await email to speed up response
    sendEmail(user.email, emailSubject, emailBody).catch(console.error)

    // 5. Send Notification
    const io = req.app.get('io')
    if (io) {
        await sendNotification(io, {
            recipientId: req.user._id,
            type: 'donation_update',
            title: 'Payment Successful',
            message: `Thank you! Your donation of ${transaction.currency} ${transaction.amount} was successful.`,
            data: {
                transactionId: transaction._id,
                donationId: donation._id,
                pointsEarned: points
            }
        })
    }

    successResponse(res, {
      transaction,
      donation,
      pointsEarned: points,
      newLevel: pointsResult.newLevel,
      levelUp: pointsResult.levelUp
    }, 'Payment verified successfully')

  } else {
    // Update transaction as failed
    await Transaction.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { status: 'failed', failureReason: 'Signature verification failed' }
    )
    
    return errorResponse(res, 'Payment verification failed', 400)
  }
})

// @desc    Get Transaction History
// @route   GET /api/payment/history
// @access  Private
export const getTransactionHistory = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate('ngo', 'name logo')
    .populate('donation', 'isAnonymous')

  successResponse(res, transactions, 'Transaction history fetched')
})

// @desc    Get Financial Report (Admin/NGO)
// @route   GET /api/payment/reports
// @access  Private (Admin/NGO)
export const getFinancialReport = asyncHandler(async (req, res) => {
  const { startDate, endDate, ngoId } = req.query
  
  // Build query
  let query = { status: 'completed' }
  
  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  }

  // If NGO Admin, restrict to their NGO
  if (req.user.role === 'ngo_admin') {
    query.ngo = req.user.ngoOwned
  } else if (req.user.role === 'admin' && ngoId) {
    // Admin can filter by NGO
    query.ngo = ngoId
  }

  const transactions = await Transaction.find(query)
    .populate('user', 'firstName lastName email')
    .populate('ngo', 'name')
    .sort({ createdAt: -1 })

  // Calculate totals
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0)
  const count = transactions.length

  // Group by month
  const monthlyStats = transactions.reduce((acc, t) => {
    const month = new Date(t.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' })
    if (!acc[month]) acc[month] = 0
    acc[month] += t.amount
    return acc
  }, {})

  successResponse(res, {
    totalAmount,
    count,
    monthlyStats,
    transactions
  }, 'Financial report generated')
})

// @desc    Razorpay Webhook
// @route   POST /api/payment/webhook
// @access  Public
export const handleWebhook = asyncHandler(async (req, res) => {
  const secret = config.razorpay.webhookSecret // Add this to config if needed
  
  // Verify signature logic here if secret is set
  // For now, just log
  console.log('Webhook received:', req.body)
  
  res.json({ status: 'ok' })
})
