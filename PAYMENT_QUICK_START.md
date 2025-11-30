# Payment Integration - Quick Start & Testing

## What's Been Implemented

### ✅ Frontend (DonateMoney.jsx)
- Amount selection (preset + custom)
- NGO selection (specific or platform)
- Anonymous donation toggle
- Razorpay checkout integration
- **Success modal** with points & level-up info
- Real-time Socket.IO activity emission
- Auto-redirect to dashboard
- Enhanced error handling

### ✅ Utilities (razorpay.js)
- Robust SDK loading with caching
- Error code to message mapping
- Transaction & donation data formatters
- User-friendly error messages

### ✅ Backend (paymentController.js)
- Order creation with transaction record
- Payment signature verification
- Donation record creation
- Points award with level progression
- Activity logging via Socket.IO
- Comprehensive notifications & emails
- Badge assignment on level up
- Certificate generation & email

## Testing Workflow

### Quick Test (5 minutes)
1. Start both servers (client & server)
2. Login as user
3. Navigate to `/donate-money`
4. Enter ₹500, keep platform selected
5. Click "Donate ₹500"
6. Use Razorpay test card: `4111 1111 1111 1111`
7. Verify success modal appears
8. Check DB for transaction & donation records

### Expected Success Flow
```
1. User enters ₹1000 → 100 points earned
2. Success modal shows "Earned 100 points"
3. Toast notification: "Donation successful! +100 points"
4. Navbar level indicator updates (if visible)
5. Activity feed shows donation in real-time
6. User email receives receipt
7. DB has complete transaction record
```

### Full Verification Checklist
- [ ] Transaction created with status "pending"
- [ ] Transaction updated to status "completed" after verify
- [ ] Donation record created
- [ ] User points incremented (amount * 0.1)
- [ ] Activity log entry created
- [ ] Notification sent to user
- [ ] Email receipt sent
- [ ] Socket.IO events emitted
- [ ] No database errors
- [ ] No console errors

## Key Features

### Points System
- Money donation: 0.1 points per rupee
- Automatic level calculation
- Level thresholds: 0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5000
- Badge assignment on each level
- Certificate generation with PDF

### Real-Time Updates
- Navbar level indicator animates on level up
- Activity log updates without refresh
- Progress page syncs in real-time
- Toast notifications for achievements

### Error Handling
- Graceful Razorpay SDK failures
- User-friendly error messages
- Transaction rollback on verify failure
- Silent certificate generation failures (non-blocking)

## Architecture

```
DonateMoney.jsx
  ↓
Create Order (Backend)
  ↓
Razorpay Checkout
  ↓
User Payment
  ↓
Verify Payment (Backend)
  ├→ Update Transaction
  ├→ Create Donation
  ├→ Award Points (emits points:earned)
  ├→ Send Notifications
  └→ Emit Activity Events
  ↓
Success Modal
  ↓
Socket.IO Updates
  ├→ LevelIndicator (navbar)
  ├→ Progress Page (real-time)
  └→ RecentActivity (feed)
```

## Database Schema

### Transaction
```javascript
{
  _id: ObjectId,
  user: userId,
  ngo: ngoId,
  amount: Number,
  currency: "INR",
  status: "pending"|"completed"|"failed",
  paymentMethod: String,
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  donation: donationId,
  notes: String,
  metadata: { isAnonymous: Boolean },
  createdAt: Date
}
```

### Donation
```javascript
{
  _id: ObjectId,
  donor: userId,
  ngo: ngoId,
  amount: Number,
  currency: "INR",
  type: "monetary",
  status: "completed",
  transaction: transactionId,
  paymentMethod: "online",
  razorpayPaymentId: String,
  razorpayOrderId: String,
  isAnonymous: Boolean,
  notes: String,
  createdAt: Date
}
```

## API Endpoints

### POST /payment/create-order
Creates Razorpay order and transaction record
- Auth: Required
- Body: { amount, ngoId, isAnonymous, notes }
- Response: { orderId, key, transactionId }

### POST /payment/verify
Verifies payment and awards points
- Auth: Required
- Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, ngoId, isAnonymous, notes }
- Response: { transaction, donation, pointsEarned, levelUp, newLevel, newCertificate }

### GET /payment/history
Gets user's transaction history
- Auth: Required
- Response: [transactions]

### GET /payment/reports
Gets financial reports (admin/ngo)
- Auth: Required
- Query: { startDate, endDate, ngoId }
- Response: { totalAmount, count, monthlyStats, transactions }

## Configuration

### Razorpay
Ensure config has:
```javascript
razorpay: {
  keyId: process.env.RAZORPAY_KEY_ID,
  keySecret: process.env.RAZORPAY_KEY_SECRET,
  webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET // optional
}
```

### Environment Variables
```
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
```

## Files Modified

### Client
1. `src/pages/User/DonateMoney.jsx` - Enhanced with modal, Socket.IO
2. `src/utils/razorpay.js` - Added utilities

### Server
1. `src/controllers/paymentController.js` - Added activity logging and socket events

### Documentation
1. `PAYMENT_INTEGRATION_GUIDE.md` - Comprehensive guide

## Next Steps

1. Test basic donation flow (see Quick Test above)
2. Verify database records
3. Check email receipts
4. Monitor Socket.IO events in browser DevTools
5. Test level-up scenario (₹1000+ donation)
6. Verify navbar level indicator animation
7. Check real-time activity feed updates

## Support

For issues:
1. Check browser console for errors
2. Check backend server logs
3. Verify Razorpay keys in config
4. Check Socket.IO connection status
5. Verify Redis running for Socket.IO
6. Check database for transaction records
