/**
 * Load Razorpay Checkout SDK
 * Returns a promise that resolves to true if SDK loads successfully
 */
export const loadRazorpay = () => {
  return new Promise((resolve) => {
    // Check if already loaded
    if (window.Razorpay) {
      resolve(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    
    script.onload = () => {
      resolve(true)
    }
    
    script.onerror = () => {
      console.error('Failed to load Razorpay SDK')
      resolve(false)
    }
    
    document.body.appendChild(script)
  })
}

/**
 * Format transaction data for display
 */
export const formatTransactionData = (data) => {
  return {
    transactionId: data._id,
    amount: data.amount,
    currency: data.currency,
    status: data.status,
    ngoId: data.ngo,
    paymentMethod: data.paymentMethod,
    createdAt: new Date(data.createdAt).toLocaleDateString(),
    razorpayPaymentId: data.razorpayPaymentId
  }
}

/**
 * Format donation data for display
 */
export const formatDonationData = (donation) => {
  return {
    donationId: donation._id,
    amount: donation.amount,
    ngoId: donation.ngo,
    type: donation.type,
    status: donation.status,
    isAnonymous: donation.isAnonymous,
    notes: donation.notes,
    createdAt: new Date(donation.createdAt).toLocaleDateString()
  }
}

/**
 * Handle Razorpay payment errors
 */
export const handlePaymentError = (error) => {
  const errorMessages = {
    'network_error': 'Network error. Please check your connection and try again.',
    'timeout': 'Payment request timed out. Please try again.',
    'invalid_card': 'Invalid card details. Please check and try again.',
    'declined': 'Payment declined by bank. Please try another payment method.',
    'cancelled': 'Payment cancelled by user.',
    'user_cancelled': 'Payment cancelled by user.',
    'gateway_error': 'Payment gateway error. Please try again later.'
  }

  return errorMessages[error.code] || error.description || 'Payment failed. Please try again.'
}

