import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Shield, CreditCard, AlertCircle } from 'lucide-react'
import api from '../../utils/api'
import { loadRazorpay } from '../../utils/razorpay'
import { toast } from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'

const DonateMoney = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [amount, setAmount] = useState('')
  const [selectedNGO, setSelectedNGO] = useState('')
  const [ngos, setNgos] = useState([])
  const [loading, setLoading] = useState(false)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    const fetchNGOs = async () => {
      try {
        const { data } = await api.get('/ngos')
        setNgos(data.data)
      } catch (error) {
        console.error('Error fetching NGOs:', error)
      }
    }
    fetchNGOs()
  }, [])

  const handlePayment = async (e) => {
    e.preventDefault()
    
    if (!amount || amount < 1) {
      toast.error('Please enter a valid amount')
      return
    }

    setLoading(true)

    try {
      // 1. Load Razorpay SDK
      const res = await loadRazorpay()
      if (!res) {
        toast.error('Razorpay SDK failed to load')
        setLoading(false)
        return
      }

      // 2. Create Order
      const { data } = await api.post('/payment/create-order', {
        amount: Number(amount),
        ngoId: selectedNGO || null, // Null means platform donation
        isAnonymous,
        notes
      })

      const { orderId, amount: orderAmount, currency, key, transactionId } = data.data

      // 3. Initialize Razorpay
      const options = {
        key,
        amount: orderAmount,
        currency,
        name: 'SevaSetu',
        description: selectedNGO ? 'Donation to NGO' : 'Donation to Platform',
        image: '/logo.png', // Add your logo path
        order_id: orderId,
        handler: async function (response) {
          try {
            // 4. Verify Payment
            const verifyRes = await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              ngoId: selectedNGO,
              isAnonymous,
              notes
            })

            if (verifyRes.data.success) {
              toast.success(`Donation successful! You earned ${verifyRes.data.data.pointsEarned} points.`)
              navigate('/user/donations')
            }
          } catch (error) {
            console.error('Verification Error:', error)
            toast.error('Payment verification failed')
          }
        },
        prefill: {
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          contact: user.phone || ''
        },
        notes: {
          address: 'SevaSetu Office'
        },
        theme: {
          color: '#4F46E5'
        }
      }

      const paymentObject = new window.Razorpay(options)
      paymentObject.open()
      
      paymentObject.on('payment.failed', function (response) {
        toast.error(response.error.description)
        console.error(response.error)
      })

    } catch (error) {
      console.error('Payment Error:', error)
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Make a Donation</h1>
        <p className="text-gray-600">Your contribution changes lives</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="p-8">
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
                {ngos.map((ngo) => (
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
  )
}

export default DonateMoney
