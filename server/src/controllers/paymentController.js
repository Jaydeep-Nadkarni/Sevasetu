import crypto from 'crypto'
import razorpay from '../config/razorpay.js'
import config from '../config/config.js'
import Transaction from '../models/Transaction.js'
import Donation from '../models/Donation.js'
import User from '../models/User.js'
import NGO from '../models/NGO.js'
import { asyncHandler, successResponse, errorResponse } from '../utils/helpers.js'
import { addPoints, calculateDonationPoints } from '../utils/pointsSystem.js'
import { sendNotification } from '../services/notificationService.js'

// @desc    Create Razorpay Order
// @route   POST /api/payment/create-order
// @access  Private
export const createOrder = asyncHandler(async (req, res) => {
  const { amount, currency = 'INR', ngoId, isAnonymous = false, notes } = req.body

  // Validate Razorpay configuration
  if (!config.razorpay.keyId || !config.razorpay.keySecret || 
      config.razorpay.keyId === 'your_razorpay_key_id_here' ||
      config.razorpay.keySecret === 'your_razorpay_key_secret_here') {
    console.error('❌ Razorpay credentials not configured!')
    console.error('   Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env file')
    return errorResponse(res, 'Payment gateway not configured. Please contact support.', 500)
  }

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
    console.log('📝 Creating Razorpay order with amount:', amount, currency)
    const order = await razorpay.orders.create(options)
    console.log('✅ Razorpay order created:', order.id)

    // Create Transaction Record
    let targetNgoId = ngoId
    if (!targetNgoId) {
      const systemNgo = await NGO.findOne({ isSystem: true })
      targetNgoId = systemNgo ? systemNgo._id : (await NGO.findOne())?._id
    }

    if (!targetNgoId) {
      console.warn('⚠️  No NGO found for transaction')
      // Don't fail, allow transaction without NGO
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

    console.log('💾 Transaction created:', transaction._id)

    successResponse(res, {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: config.razorpay.keyId,
      transactionId: transaction._id
    }, 'Order created successfully')

  } catch (error) {
    console.error('❌ Razorpay Order Error:', {
      message: error.message,
      statusCode: error.statusCode,
      code: error.code,
      description: error.description,
      fullError: error
    })
    
    // Provide specific error messages
    if (error.statusCode === 401 || error.code === 'INVALID_KEY') {
      return errorResponse(res, 'Invalid Razorpay credentials. Contact support.', 500)
    } else if (error.statusCode === 400) {
      return errorResponse(res, `Invalid payment request: ${error.description || 'Please check amount and try again'}`, 400)
    }
    
    return errorResponse(res, 'Failed to create payment order: ' + (error.description || error.message), 500)
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
    try {
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
      const io = req.app.get('io')
      const points = calculateDonationPoints('money', transaction.amount)
      const pointsResult = await addPoints(req.user._id, points, 'donation', io)

      // 4. Fetch NGO name and user for notifications
      const ngo = await NGO.findById(transaction.ngo)
      const ngoName = ngo ? ngo.name : 'SevaSetu Platform'
      const user = await User.findById(req.user._id)

      // 5. Send Notifications & Emails
      if (io && user) {
        // Main donation success notification
        await sendNotification(io, {
          recipientId: req.user._id,
          type: 'donation_update',
          title: 'Payment Successful',
          message: `Thank you! Your donation of ₹${transaction.amount} to ${ngoName} was successful.`,
          data: {
            transactionId: transaction._id,
            donationId: donation._id,
            pointsEarned: points,
            levelUp: pointsResult.levelUp,
            newLevel: pointsResult.newLevel,
            ngoName,
            amount: transaction.amount
          },
          emailTemplate: 'payment_receipt',
          emailData: {
            amount: transaction.amount,
            currency: transaction.currency,
            transactionId: razorpay_payment_id,
            date: new Date().toLocaleDateString(),
            ngoName: ngoName,
            paymentMethod: 'Online',
            points: points
          }
        })

        // Level up certificate notification
        if (pointsResult.newCertificate) {
          await sendNotification(io, {
            recipientId: req.user._id,
            type: 'certificate_earned',
            title: 'New Certificate Earned!',
            message: `Congratulations! You've earned a new certificate: ${pointsResult.newCertificate.title}`,
            data: {
              certificateId: pointsResult.newCertificate._id,
              certificateUrl: pointsResult.newCertificate.certificateUrl,
              title: pointsResult.newCertificate.title
            },
            emailTemplate: 'certificate_issued',
            emailData: {
              recipientName: user.firstName,
              certificateTitle: pointsResult.newCertificate.title,
              issueDate: new Date().toLocaleDateString(),
              certificateUrl: pointsResult.newCertificate.certificateUrl || '#'
            }
          })
        }

        // Emit real-time socket events for activity log
        io.to(`user:${req.user._id}`).emit('activity:new', {
          type: 'money_donation',
          description: `Donated ₹${transaction.amount} to ${ngoName}`,
          amount: transaction.amount,
          ngoName,
          status: 'completed',
          createdAt: new Date(),
          metadata: {
            transactionId: transaction._id,
            donationId: donation._id,
            ngoId: transaction.ngo,
            anonymous: isAnonymous || false
          }
        })

        // Emit donation event for specific room listeners
        io.to(`donation:${donation._id}`).emit('donation:completed', {
          donationId: donation._id,
          amount: transaction.amount,
          donorName: isAnonymous ? 'Anonymous' : `${user.firstName} ${user.lastName}`,
          ngoId: transaction.ngo,
          ngoName,
          timestamp: new Date()
        })
      }

      // 6. Return comprehensive response
      successResponse(res, {
        transaction: {
          _id: transaction._id,
          amount: transaction.amount,
          currency: transaction.currency,
          status: transaction.status,
          razorpayPaymentId: transaction.razorpayPaymentId,
          createdAt: transaction.createdAt
        },
        donation: {
          _id: donation._id,
          amount: donation.amount,
          ngoName,
          status: donation.status,
          isAnonymous: donation.isAnonymous
        },
        pointsEarned: points,
        newLevel: pointsResult.newLevel,
        levelUp: pointsResult.levelUp,
        newBadges: pointsResult.newBadges,
        newCertificate: pointsResult.newCertificate ? {
          _id: pointsResult.newCertificate._id,
          title: pointsResult.newCertificate.title,
          certificateUrl: pointsResult.newCertificate.certificateUrl
        } : null
      }, 'Payment verified successfully')

    } catch (error) {
      console.error('Payment verification error:', error)
      return errorResponse(res, 'Error processing payment: ' + error.message, 500)
    }

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
