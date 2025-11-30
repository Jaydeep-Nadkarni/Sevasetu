import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Shield, CreditCard, CheckCircle, Zap } from 'lucide-react'
import api from '../../utils/api'
import { loadRazorpay } from '../../utils/razorpay'
import { toast } from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'
import { useSocket } from '../../context/SocketContext'
import { motion } from 'framer-motion'

const DonateMoney = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { socket } = useSocket()
  const [amount, setAmount] = useState('')
  const [selectedNGO, setSelectedNGO] = useState('')
  const [ngos, setNgos] = useState([])
  const [loading, setLoading] = useState(false)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [notes, setNotes] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successData, setSuccessData] = useState(null)
  const [paymentError, setPaymentError] = useState(null)

  useEffect(() => {
    const fetchNGOs = async () => {
      try {
        const { data } = await api.get('/ngos')
        setNgos(Array.isArray(data.data) ? data.data : [])
      } catch (error) {
        console.error('Error fetching NGOs:', error.response?.status, error.response?.data || error.message)
        // Silently fail - show empty NGO list
        setNgos([])
      }
    }
    fetchNGOs()
  }, [])

  const handlePaymentSuccess = async (paymentData) => {
    try {
      // Store success data for modal display
      const ngoName = selectedNGO 
        ? ngos.find(n => n._id === selectedNGO)?.name 
        : 'SevaSetu Platform'
      
      const displayData = {
        amount: Number(amount),
        ngoName,
        pointsEarned: paymentData.pointsEarned,
        levelUp: paymentData.levelUp,
        newLevel: paymentData.newLevel,
        transactionId: paymentData.transaction._id
      }

      setSuccessData(displayData)
      setShowSuccessModal(true)

      // Emit activity event for real-time activity log updates
      if (socket) {
        socket.emit('user:activity', {
          type: 'money_donation',
          description: `Donated ₹${Number(amount)} to ${ngoName}`,
          metadata: {
            amount: Number(amount),
            ngoId: selectedNGO || null,
            ngoName,
            transactionId: paymentData.transaction._id,
            anonymous: isAnonymous
          }
        })
      }

      // Auto-navigate to dashboard after 5 seconds
      setTimeout(() => {
        navigate('/dashboard')
      }, 5000)
    } catch (error) {
      console.error('Error handling payment success:', error)
    }
  }

  const handlePayment = async (e) => {
    e.preventDefault()
    console.log('Payment initiated', { amount, selectedNGO })
    
    if (!amount || amount < 1) {
      toast.error('Please enter a valid amount')
      return
    }

    if (!user) {
      toast.error('Please login to make a donation')
      navigate('/login')
      return
    }

    setLoading(true)
    setPaymentError(null)

    try {
      // 1. Load Razorpay SDK
      console.log('Loading Razorpay SDK...')
      const res = await loadRazorpay()
      if (!res) {
        const errorMsg = 'Razorpay SDK failed to load. Please check your internet connection.'
        console.error(errorMsg)
        toast.error(errorMsg)
        setLoading(false)
        return
      }
      console.log('Razorpay SDK loaded successfully')

      // 2. Create Order
      console.log('Creating payment order...')
      let createOrderResponse
      try {
        createOrderResponse = await api.post('/payment/create-order', {
          amount: Number(amount),
          ngoId: selectedNGO || null,
          isAnonymous,
          notes
        })
        console.log('Order created:', createOrderResponse.data)
      } catch (orderError) {
        console.error('Order creation error:', orderError.response?.data || orderError.message)
        const errorMsg = orderError.response?.data?.message || orderError.response?.statusText || 'Failed to create payment order. Please try again.'
        
        // More detailed error message for debugging
        if (orderError.response?.status === 500) {
          console.error('Backend server error. Check backend logs for details.')
        } else if (orderError.response?.status === 429) {
          console.error('Rate limit exceeded. Please wait a moment and try again.')
        }
        
        toast.error(errorMsg)
        setPaymentError(errorMsg)
        setLoading(false)
        return
      }

      const { orderId, amount: orderAmount, currency, key, transactionId } = createOrderResponse.data.data

      if (!orderId || !key) {
        const errorMsg = 'Invalid payment configuration. Please contact support.'
        console.error(errorMsg, { orderId, key })
        toast.error(errorMsg)
        setPaymentError(errorMsg)
        setLoading(false)
        return
      }

      console.log('Opening Razorpay payment interface...', { orderId, orderAmount, key })

      // 3. Initialize Razorpay with enhanced handlers
      const options = {
        key,
        amount: orderAmount,
        currency: currency || 'INR',
        name: 'SevaSetu',
        description: selectedNGO ? 'Donation to NGO' : 'Donation to Platform',
        image: '/logo.png',
        order_id: orderId,
        handler: async function (response) {
          console.log('Payment handler called with response:', response)
          try {
            // 4. Verify Payment on Backend
            console.log('Verifying payment...')
            let verifyRes
            try {
              verifyRes = await api.post('/payment/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                ngoId: selectedNGO,
                isAnonymous,
                notes,
                transactionId
              })
              console.log('Payment verified:', verifyRes.data)
            } catch (verifyError) {
              console.error('Verification error:', verifyError.response || verifyError.message)
              const errorMsg = verifyError.response?.data?.message || 'Payment verification failed. Please contact support.'
              toast.error(errorMsg)
              setPaymentError(errorMsg)
              setLoading(false)
              return
            }

            if (verifyRes.data.success) {
              // Show success UI with points and level up info
              await handlePaymentSuccess(verifyRes.data.data)
              
              // Show toast with level up info if applicable
              if (verifyRes.data.data.levelUp) {
                toast.success(
                  `Level Up! 🎉 Reached Level ${verifyRes.data.data.newLevel}`,
                  { duration: 5000 }
                )
              } else {
                toast.success(
                  `Donation successful! +${verifyRes.data.data.pointsEarned} points`,
                  { duration: 5000 }
                )
              }
            }
          } catch (error) {
            console.error('Verification Error:', error)
            const errorMsg = error.response?.data?.message || 'Payment verification failed'
            toast.error(errorMsg)
            setPaymentError(errorMsg)
            setLoading(false)
          }
        },
        prefill: {
          name: `${user?.firstName || ''} ${user?.lastName || ''}`,
          email: user?.email || '',
          contact: user?.phone || ''
        },
        notes: {
          address: 'SevaSetu Office',
          userId: user?._id || ''
        },
        theme: {
          color: '#4F46E5'
        },
        retry: {
          enabled: true,
          max_count: 3
        },
        timeout: 900
      }

      console.log('Initializing Razorpay with options:', options)
      const paymentObject = new window.Razorpay(options)
      
      paymentObject.on('payment.failed', function (response) {
        const errorMessage = response.error.description || 'Payment failed'
        console.error('Payment failed:', response.error)
        toast.error(errorMessage)
        setPaymentError(errorMessage)
        setLoading(false)
      })

      console.log('Opening Razorpay modal...')
      paymentObject.open()
      setLoading(false)

    } catch (error) {
      console.error('Payment Error:', error)
      const errorMsg = error.response?.data?.message || 'Something went wrong. Please try again.'
      toast.error(errorMsg)
      setPaymentError(errorMsg)
      setLoading(false)
    }
  }

  return (
    <>
      {/* Success Modal */}
      {showSuccessModal && successData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center mb-4"
            >
              <CheckCircle className="w-16 h-16 text-green-500" />
            </motion.div>

            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Payment Successful!</h2>
            <p className="text-gray-600 text-center mb-6">Thank you for your contribution</p>

            {/* Donation Details */}
            <div className="space-y-4 mb-6 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount:</span>
                <span className="font-bold text-lg">₹{successData.amount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">To:</span>
                <span className="font-semibold">{successData.ngoName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-mono text-xs text-indigo-600">{successData.transactionId.slice(-8)}</span>
              </div>
            </div>

            {/* Points & Level Info */}
            <div className="space-y-3 mb-6">
              <div className="bg-yellow-50 p-3 rounded-lg flex items-center gap-3">
                <Zap className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-semibold text-yellow-900">+{successData.pointsEarned} Points Earned</p>
                  <p className="text-xs text-yellow-700">Added to your profile</p>
                </div>
              </div>

              {successData.levelUp && (
                <div className="bg-indigo-50 p-3 rounded-lg flex items-center gap-3">
                  <Heart className="w-5 h-5 text-indigo-600 fill-current" />
                  <div>
                    <p className="text-sm font-semibold text-indigo-900">Level {successData.newLevel} Unlocked!</p>
                    <p className="text-xs text-indigo-700">Congratulations on reaching a new milestone!</p>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setShowSuccessModal(false)
                navigate('/dashboard')
              }}
              className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Continue to Dashboard
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              Redirecting to dashboard in 5 seconds...
            </p>
          </motion.div>
        </div>
      )}

      {/* Main Form */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Make a Donation</h1>
          <p className="text-gray-600">Your contribution changes lives</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-8">
            {paymentError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                <p className="font-semibold text-sm">Payment Error:</p>
                <p className="text-sm mt-1">{paymentError}</p>
              </div>
            )}
            
            <form onSubmit={handlePayment} className="space-y-6">
              
              {/* Amount Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Donation Amount (₹)</label>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {[500, 1000, 2000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val)}
                      className={`py-2 px-4 rounded-lg border ${
                        amount === val 
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700' 
                          : 'border-gray-200 hover:border-indigo-200'
                      }`}
                    >
                      ₹{val}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="block w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter custom amount"
                    min="1"
                    required
                  />
                </div>
              </div>

              {/* NGO Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select NGO (Optional)</label>
                <select
                  value={selectedNGO}
                  onChange={(e) => setSelectedNGO(e.target.value)}
                  className="block w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">SevaSetu Platform (General Fund)</option>
                  {Array.isArray(ngos) && ngos.map((ngo) => (
                    <option key={ngo._id} value={ngo._id}>
                      {ngo.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Leaving this blank will donate to the platform's general fund to help where needed most.
                </p>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="2"
                  className="block w-full py-2 px-4 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Any special instructions or message..."
                ></textarea>
              </div>

              {/* Anonymous Toggle */}
              <div className="flex items-center">
                <input
                  id="anonymous"
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-900">
                  Make this donation anonymous
                </label>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 p-4 rounded-lg flex gap-3">
                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <p className="text-sm text-blue-800">
                  All donations are secure and tax-deductible. You will receive a receipt and points immediately after payment.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-4 px-6 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Heart className="w-5 h-5 fill-current" />
                    Donate ₹{amount || '0'}
                  </>
                )}
              </button>
            </form>
          </div>
          
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex justify-center gap-6">
            <div className="flex items-center gap-2 text-gray-400">
              <CreditCard className="w-5 h-5" />
              <span className="text-sm">Secure Payment</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Shield className="w-5 h-5" />
              <span className="text-sm">Verified NGOs</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default DonateMoney
