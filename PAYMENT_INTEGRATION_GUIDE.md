# Complete Payment Integration Guide

## Overview
This document describes the complete payment integration flow including Razorpay checkout, transaction verification, points award, level progression, and real-time Socket.IO updates.

## System Architecture

```
User Initiates Donation
    ↓
DonateMoney.jsx loads Razorpay SDK
    ↓
Frontend calls POST /payment/create-order
    ↓
Backend creates Transaction (pending status)
    ↓
Razorpay Checkout modal opens
    ↓
User completes payment → Razorpay returns response
    ↓
Frontend calls POST /payment/verify with payment details
    ↓
Backend verifies signature & updates Transaction
    ↓
Backend creates Donation record
    ↓
Backend awards Points via addPoints()
    ↓
Backend checks for level up & badge
    ↓
Backend emits Socket.IO events
    ↓
Frontend receives real-time updates
    ↓
Success modal displayed with points/level info
    ↓
Activity log updated in real-time
    ↓
Navbar level indicator animates
```

## Frontend Flow

### DonateMoney.jsx
**File:** `client/src/pages/User/DonateMoney.jsx`

**Key Features:**
- Amount selection (preset or custom)
- NGO selection (specific NGO or platform general fund)
- Anonymous donation option
- Optional donation message
- Success modal with points and level-up info
- Real-time Socket.IO integration

**Success Flow:**
1. User enters amount and selects NGO
2. Clicks "Donate" button
3. Frontend loads Razorpay SDK
4. Creates order on backend
5. Opens Razorpay checkout modal
6. User completes payment
7. Razorpay returns payment response
8. Frontend calls verify endpoint
9. Backend validates and awards points
10. Frontend emits Socket.IO activity event
11. Success modal shows points earned
12. Auto-redirect to dashboard after 5 seconds

**State Management:**
- `amount`: Donation amount
- `selectedNGO`: Target NGO ID
- `isAnonymous`: Anonymous flag
- `notes`: Optional message
- `showSuccessModal`: Success modal visibility
- `successData`: Points, level, transaction details

**Socket.IO Integration:**
```javascript
socket.emit('user:activity', {
  type: 'money_donation',
  description: `Donated ₹${amount} to ${ngoName}`,
  metadata: {
    amount,
    ngoId,
    ngoName,
    transactionId,
    anonymous: isAnonymous
  }
})
```

### razorpay.js
**File:** `client/src/utils/razorpay.js`

**Exported Functions:**
- `loadRazorpay()`: Load Razorpay SDK asynchronously
- `formatTransactionData(data)`: Format transaction for display
- `formatDonationData(donation)`: Format donation for display
- `handlePaymentError(error)`: User-friendly error messages

**Error Handling:**
Maps Razorpay error codes to user-friendly messages:
- Network errors
- Timeout errors
- Invalid card errors
- Payment declined
- User cancelled

## Backend Flow

### Payment Controller
**File:** `server/src/controllers/paymentController.js`

#### 1. Create Order
**Endpoint:** `POST /payment/create-order`
**Auth:** Required
**Request Body:**
```json
{
  "amount": 1000,
  "ngoId": "ngo_id_or_null",
  "isAnonymous": false,
  "notes": "optional message"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "razorpay_order_id",
    "amount": 100000,
    "currency": "INR",
    "key": "razorpay_key_id",
    "transactionId": "transaction_db_id"
  }
}
```

**Process:**
1. Validate amount >= 1
2. Determine target NGO (specific or system)
3. Create Transaction record with status: "pending"
4. Return Razorpay order details

#### 2. Verify Payment
**Endpoint:** `POST /payment/verify`
**Auth:** Required
**Request Body:**
```json
{
  "razorpay_order_id": "order_id",
  "razorpay_payment_id": "payment_id",
  "razorpay_signature": "signature",
  "ngoId": "ngo_id",
  "isAnonymous": false,
  "notes": "message"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transaction": {
      "_id": "transaction_id",
      "amount": 1000,
      "currency": "INR",
      "status": "completed",
      "razorpayPaymentId": "payment_id",
      "createdAt": "2025-11-30T..."
    },
    "donation": {
      "_id": "donation_id",
      "amount": 1000,
      "ngoName": "NGO Name",
      "status": "completed",
      "isAnonymous": false
    },
    "pointsEarned": 100,
    "newLevel": 2,
    "levelUp": true,
    "newBadges": [],
    "newCertificate": {
      "_id": "cert_id",
      "title": "Level 2: Intermediate",
      "certificateUrl": "pdf_url"
    }
  }
}
```

**Process:**
1. Verify HMAC signature with Razorpay secret
2. Update Transaction with payment details
3. Create Donation record
4. Award points via `addPoints()` (emits Socket.IO event)
5. Send notifications & emails
6. Emit Socket.IO activity event
7. Return comprehensive response with points/level info

### Points System Integration
**File:** `server/src/utils/pointsSystem.js`

**Points Calculation:**
```javascript
const points = calculateDonationPoints('money', amount)
// Formula: Math.floor(amount * 0.1)
// Example: ₹1000 = 100 points
```

**Level Progression:**
- Automatic level up when points threshold reached
- Badge assignment on level up
- Certificate generation with PDF
- Socket.IO event emission: `points:earned`

**Socket Events Emitted:**
```javascript
// Main points event
io.to(`user:${userId}`).emit('points:earned', {
  userId,
  pointsAdded,
  totalPoints,
  levelUp: true/false,
  newLevel,
  source: 'donation',
  newBadges: [],
  newCertificate: {}
})

// Activity log event
io.to(`user:${userId}`).emit('activity:new', {
  type: 'money_donation',
  description: 'Donated ₹X to NGO',
  amount,
  ngoName,
  status: 'completed',
  createdAt,
  metadata: {}
})

// Donation completed event
io.to(`donation:${donationId}`).emit('donation:completed', {
  donationId,
  amount,
  donorName,
  ngoId,
  ngoName,
  timestamp
})
```

### Notifications & Emails
**Services:** `server/src/services/notificationService.js`

**Notifications Sent:**

1. **Payment Success** (In-app notification)
   - Type: `donation_update`
   - Message: "Thank you! Your donation of ₹X to NGO was successful."
   - Data includes: transactionId, donationId, pointsEarned, levelUp

2. **Payment Receipt** (Email)
   - Template: `payment_receipt`
   - Includes: Amount, NGO name, transaction ID, date, points

3. **Certificate Earned** (In-app + Email)
   - Type: `certificate_earned`
   - Message: "Congratulations! You've earned a certificate: [Title]"
   - Includes: Certificate PDF URL

## Real-Time Updates Flow

### Socket.IO Events
**Client Listeners:**

1. **points:earned**
   - Triggers progress update
   - Shows level-up animation
   - Updates navbar level indicator
   - Re-fetches user progress if level up

2. **activity:new**
   - Updates activity feed
   - Shows in real-time activity log
   - Displays points earned

3. **donation:completed**
   - Updates donation list
   - Shows donor info (or "Anonymous")
   - Updates NGO dashboard

### Frontend Components Listening

1. **LevelIndicator** (`components/LevelIndicator.jsx`)
   - Listens to: `points:earned`
   - Updates: Points display, level badge
   - Animation: Scale and rotate on level up

2. **Progress** (`pages/User/Progress.jsx`)
   - Listens to: `points:earned`
   - Updates: Points, level, progress bar
   - Re-fetches: On level up for badges/certificates

3. **RecentActivity** (`components/RecentActivity.jsx`)
   - Listens to: Activity events
   - Updates: Activity feed in real-time

4. **SocketContext** (`context/SocketContext.jsx`)
   - Central listener for all Socket.IO events
   - Toast notifications on points/level updates
   - Cleanup on unmount

## Testing Checklist

### Prerequisites
- [ ] Razorpay account and API keys configured
- [ ] Redis running for Socket.IO
- [ ] Frontend and backend servers running
- [ ] User authenticated and logged in

### Test Scenarios

#### 1. Basic Donation Flow
**Steps:**
1. Navigate to `/donate-money`
2. Enter amount: ₹500
3. Select "SevaSetu Platform (General Fund)"
4. Click "Donate ₹500"
5. Razorpay modal opens
6. Complete test payment
7. Verify success modal appears

**Expected Results:**
- [ ] Success modal displays with amount
- [ ] Points earned displayed (50 points for ₹500)
- [ ] No level up message (unless already progressed)
- [ ] Toast notification shows success
- [ ] Transaction record created in DB
- [ ] Donation record created in DB
- [ ] User points incremented in DB
- [ ] Activity log shows donation

#### 2. NGO-Specific Donation
**Steps:**
1. Navigate to `/donate-money`
2. Enter amount: ₹1000
3. Select specific NGO from dropdown
4. Click "Donate ₹1000"
5. Complete payment

**Expected Results:**
- [ ] Donation created with specific ngoId
- [ ] NGO receives notification of donation
- [ ] Success modal shows NGO name
- [ ] Activity shows "Donated ₹1000 to [NGO Name]"

#### 3. Anonymous Donation
**Steps:**
1. Navigate to `/donate-money`
2. Enter amount: ₹2000
3. Check "Make this donation anonymous"
4. Complete payment

**Expected Results:**
- [ ] Donation record has `isAnonymous: true`
- [ ] Activity log shows "Anonymous donated ₹2000"
- [ ] NGO doesn't see donor name

#### 4. Level Up Scenario
**Steps:**
1. User with 50 points donates ₹1000 (100 points)
2. Total: 150 points (Level 2 threshold: 100)

**Expected Results:**
- [ ] Level up toast appears: "Level Up! 🎉 Reached Level 2"
- [ ] Success modal shows: "Level 2 Unlocked!"
- [ ] Navbar level indicator animates
- [ ] New badge assigned to user
- [ ] Certificate generated
- [ ] Certificate email sent
- [ ] Progress page updates in real-time

#### 5. Real-Time Activity Updates
**Setup:**
- Open app in 2 browser tabs
- User logged in both tabs
- Activity log visible in both

**Steps:**
1. Complete donation in Tab 1
2. Watch Tab 2 activity log

**Expected Results:**
- [ ] Tab 2 activity log updates automatically
- [ ] No page refresh required
- [ ] Points and level update in real-time
- [ ] Navbar level indicator updates

#### 6. Payment Failure Handling
**Steps:**
1. Start donation flow
2. Decline payment in Razorpay modal

**Expected Results:**
- [ ] Error toast appears: "Payment failed"
- [ ] No success modal shown
- [ ] Transaction status remains "pending"
- [ ] Donation record not created
- [ ] No points awarded

#### 7. Transaction Verification
**Database Checks:**
```javascript
// After successful payment, verify:
db.transactions.findOne({ status: 'completed' })
// Should have:
// - razorpayOrderId
// - razorpayPaymentId
// - razorpaySignature
// - status: 'completed'
// - donation ObjectId reference
// - user ObjectId reference
// - ngo ObjectId reference

db.donations.findOne({ type: 'monetary' })
// Should have:
// - donor: user_id
// - ngo: ngo_id
// - amount
// - transaction: transaction_id
// - status: 'completed'
// - isAnonymous flag
// - createdAt timestamp
```

### Browser DevTools Testing

#### Console Checks
```javascript
// Verify Razorpay SDK loaded
console.log(window.Razorpay) // Should be function

// Check Socket.IO connection
console.log(socket.connected) // Should be true

// Verify activity event sent
// Watch Network tab for Socket.IO emit
```

#### Network Tab
1. Verify requests:
   - `POST /payment/create-order` → 200 OK
   - `POST /payment/verify` → 200 OK
2. Check response payloads for correct data
3. Monitor WebSocket for Socket.IO events

#### Application Tab (Storage)
- Check localStorage for auth token
- Verify session data

### Database Verification Commands

```javascript
// List recent transactions
db.transactions.find().sort({ createdAt: -1 }).limit(5)

// Find donations by user
db.donations.find({ donor: ObjectId("user_id") })

// Check user points and level
db.users.findOne({ _id: ObjectId("user_id") }, { points: 1, level: 1 })

// Verify activity log
db.activities.find({ userId: ObjectId("user_id") }).sort({ createdAt: -1 })

// Check notifications sent
db.notifications.find({ recipientId: ObjectId("user_id") }).sort({ createdAt: -1 })
```

## Troubleshooting

### Common Issues

**Issue: Razorpay modal doesn't open**
- Solution: Check browser console for SDK load errors
- Verify Razorpay API key in config
- Check CORS settings if API key invalid

**Issue: Payment succeeds but no points awarded**
- Solution: Check backend logs for addPoints errors
- Verify User document exists in DB
- Check if points calculation formula works

**Issue: Success modal doesn't appear**
- Solution: Check if verifyPayment returns successful response
- Check browser console for JS errors
- Verify Socket.IO connection in DevTools

**Issue: Real-time updates don't show**
- Solution: Verify Socket.IO is running
- Check Socket.IO connection in SocketContext
- Verify socket events emitted in backend logs

**Issue: Level up doesn't trigger**
- Solution: Verify user total points exceed threshold
- Check LEVELS config in gamification.js
- Verify certificate generation (may fail silently)

## Performance Considerations

1. **Razorpay SDK Caching**: SDK loaded once and cached in window object
2. **Transaction Queries**: Indexed on razorpayOrderId for fast lookup
3. **User Updates**: Atomic operations on user points/level
4. **Socket.IO Rooms**: User-specific rooms prevent broadcast spam
5. **Email Async**: Notification service sends emails asynchronously

## Security Notes

1. **Signature Verification**: HMAC-SHA256 verified with Razorpay secret
2. **User Context**: Only authenticated users can create/verify orders
3. **Amount Validation**: Minimum amount checked (₹1)
4. **Transaction Lookup**: Each transaction tied to specific user
5. **Anonymous Donations**: Flag stored but doesn't hide user from backend

## Future Enhancements

1. **Recurring Donations**: Add subscription model
2. **Donation Goals**: Set targets for NGOs
3. **Milestone Rewards**: Special badges for donation amounts
4. **Donation Tracking**: Show donation impact stories
5. **Tax Certificate**: Auto-generate tax receipt as PDF
6. **Refund Handling**: Process refunds with point reversal
7. **Payment Methods**: Support UPI, wallet, bank transfer
8. **Donation Statistics**: Analytics dashboard for donors
