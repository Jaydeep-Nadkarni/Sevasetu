# Razorpay Payment Integration Setup Guide

## Overview
This guide explains how to set up Razorpay payment integration for the Sevasetu platform.

## Issue
The payment endpoint is currently returning a **500 Internal Server Error** because Razorpay credentials are not configured in the `.env` file. The backend is initialized with placeholder values:
```
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
```

## Solution

### Step 1: Get Razorpay Credentials

1. **Sign up on Razorpay:**
   - Go to https://razorpay.com
   - Create an account or log in
   - Complete your business verification

2. **Find Your API Keys:**
   - Navigate to Dashboard → Settings → API Keys
   - You'll find:
     - **Key ID** (public key)
     - **Key Secret** (private key - keep this confidential!)

### Step 2: Configure Environment Variables

1. **Edit the `.env` file** in `server/` directory:
   ```bash
   # Before:
   RAZORPAY_KEY_ID=your_razorpay_key_id_here
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here

   # After (replace with your actual keys):
   RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx  # Your actual Key ID
   RAZORPAY_KEY_SECRET=xxxxxxxxxxxxx       # Your actual Key Secret
   ```

2. **For Testing (Development):**
   - Razorpay provides test keys separate from live keys
   - Use test keys during development
   - Switch to live keys for production
   - Test keys work only with test card numbers

3. **Test Card Numbers** (for development):
   ```
   Credit Card: 4111 1111 1111 1111
   Expiry: Any future date (e.g., 12/25)
   CVV: 123
   OTP: 123456 (when prompted)
   ```

### Step 3: Restart the Server

After updating the `.env` file, restart the backend server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd server
npm run dev
```

### Step 4: Test the Payment Flow

1. **Frontend Payment Form:**
   - Navigate to the Donate Money page
   - Select an amount
   - Click "Donate"

2. **Expected Flow:**
   - ✅ Order created successfully (console: "Razorpay order created")
   - ✅ Razorpay payment modal opens
   - ✅ Enter test card details
   - ✅ Complete payment
   - ✅ Redirect to success page

3. **Check Logs:**
   - Backend console shows:
     ```
     📝 Creating Razorpay order with amount: 100 INR
     ✅ Razorpay order created: order_xxxxx
     💾 Transaction created: [mongodb-id]
     ```

### Step 5: Verify in Razorpay Dashboard

1. Go to Razorpay Dashboard → Payments
2. You should see your test transactions
3. Check payment status and details

---

## Troubleshooting

### Error: "Invalid Razorpay credentials"
**Solution:** Double-check that your Key ID and Key Secret are correct in `.env`

### Error: "Failed to create payment order"
**Solution:** 
- Verify credentials are set
- Check that the amount is valid (minimum ₹1)
- Check server logs for specific error details

### Payment Modal Doesn't Open
**Solution:**
- Ensure Razorpay SDK loaded successfully (check browser console)
- Verify Key ID is being passed correctly to frontend
- Check that order was created on backend

### "Invalid amount" Error
**Solution:** Amount must be:
- Greater than or equal to ₹1
- A valid number
- Not zero or negative

---

## Security Best Practices

### ⚠️ IMPORTANT SECURITY NOTES:

1. **Never commit credentials to Git:**
   ```bash
   # Good (in .env):
   RAZORPAY_KEY_SECRET=xxx

   # Bad (in code):
   const secret = "xxx"
   ```

2. **Environment Variable Files:**
   - `.env` file is listed in `.gitignore`
   - Never share `.env` file in public repos
   - Create `.env.example` with placeholder values (already exists)

3. **Key Secret Protection:**
   - Only share Key Secret with trusted backend environment
   - Never expose in frontend code or API responses
   - Key ID (public key) is safe to send to frontend

4. **Production Setup:**
   - Use live keys only in production
   - Enable webhook verification
   - Set up SSL/TLS encryption
   - Monitor failed payments

---

## Architecture

### Payment Flow:

```
1. Frontend (DonateMoney.jsx)
   ↓
   User enters amount, selects NGO
   ↓
2. Backend (POST /api/payment/create-order)
   ↓
   Creates order with Razorpay API
   Creates pending transaction record
   Returns orderId and Key ID to frontend
   ↓
3. Frontend Opens Razorpay Modal
   ↓
   User enters payment details
   ↓
4. Frontend (POST /api/payment/verify)
   ↓
   Verifies signature
   Updates transaction status
   Creates donation record
   Awards points/certificates
   Sends notifications
   ↓
5. Success Page
```

### Database Records:

- **Transaction:**
  - Stores payment metadata
  - Tracks order and payment IDs
  - Status: pending → completed/failed

- **Donation:**
  - Created after verified payment
  - Links user to NGO
  - Records donation amount and date

---

## Configuration Reference

### Current Backend Configuration:

**File:** `server/src/config/config.js`
```javascript
razorpay: {
  keyId: process.env.RAZORPAY_KEY_ID,
  keySecret: process.env.RAZORPAY_KEY_SECRET,
},
```

**Validation:** The system now checks if credentials are set and shows clear error messages if not.

---

## Webhook Setup (Optional)

For production, set up webhooks to handle payment events:

1. **Enable in Razorpay Dashboard:**
   - Settings → Webhooks
   - Add URL: `https://your-domain.com/api/payment/webhook`
   - Subscribe to: `payment.authorized`, `payment.failed`, `payment.captured`

2. **Backend Handler:** Already implemented in `paymentController.js`

---

## Support

If you encounter issues:

1. Check server logs: `server/logs/error.log`
2. Check browser console: DevTools → Console
3. Verify credentials in `.env`
4. Ensure server is restarted after `.env` changes

---

## Next Steps

1. ✅ Get Razorpay API keys
2. ✅ Update `.env` file with real credentials
3. ✅ Restart backend server
4. ✅ Test payment flow
5. ✅ Verify transactions in Razorpay dashboard
6. (Optional) Set up webhooks for production

**Status:** Backend code is ready. Just needs configuration!
