# MongoDB Schema Quick Reference

## Import Schemas in Controllers/Routes

```javascript
import {
  User,
  NGO,
  Donation,
  Event,
  HelpRequest,
  Certificate,
  Transaction,
  Badge,
  QRAttendance,
  Analytics,
} from '../models/index.js'
```

Or import individually:
```javascript
import User from '../models/User.js'
import NGO from '../models/NGO.js'
// ... etc
```

---

## Common Query Examples

### User Queries
```javascript
// Find user by email
const user = await User.findOne({ email: 'user@example.com' })

// Find user and exclude password
const user = await User.findById(userId).select('-password')

// Check password
const isValid = await user.matchPassword('enteredPassword')

// Find active users in a city
const users = await User.find({ isActive: true, 'location.city': 'Delhi' })

// Get user with populated badges
const user = await User.findById(userId).populate('badges')
```

### NGO Queries
```javascript
// Find NGO by owner
const ngo = await NGO.findOne({ owner: userId })

// Find verified NGOs
const ngos = await NGO.find({ verificationStatus: 'verified', isActive: true })

// Text search NGOs
const results = await NGO.find({ $text: { $search: 'education' } })

// Find NGOs near coordinates
const nearbyNGOs = await NGO.find({
  'location.coordinates': {
    $near: {
      $geometry: { type: 'Point', coordinates: [77.6245, 12.9716] },
      $maxDistance: 5000, // 5km
    },
  },
})

// Get NGO with team members
const ngo = await NGO.findById(ngoId).populate('team').populate('owner')
```

### Donation Queries
```javascript
// Find donations by donor
const donations = await Donation.find({ donor: userId }).populate('ngo')

// Get completed donations
const donations = await Donation.find({ status: 'completed' })

// Find donations by NGO with most recent first
const donations = await Donation.find({ ngo: ngoId })
  .sort({ createdAt: -1 })
  .limit(10)

// Get total donation amount for NGO
const total = await Donation.aggregate([
  { $match: { ngo: ngoId, status: 'completed' } },
  { $group: { _id: null, total: { $sum: '$amount' } } },
])
```

### Event Queries
```javascript
// Find upcoming events
const upcomingDate = new Date()
const events = await Event.find({
  startDate: { $gte: upcomingDate },
  status: 'upcoming',
})

// Find events by NGO
const events = await Event.find({ ngo: ngoId }).sort({ startDate: 1 })

// Find events near location
const nearbyEvents = await Event.find({
  'location.coordinates': {
    $near: {
      $geometry: { type: 'Point', coordinates: [77.2065, 28.6139] },
      $maxDistance: 10000,
    },
  },
})

// Get event with registrations
const event = await Event.findById(eventId).populate('registrations').populate('volunteers')
```

### Help Request Queries
```javascript
// Find open requests
const requests = await HelpRequest.find({ status: 'open' }).sort({ urgency: -1 })

// Find critical requests
const criticalRequests = await HelpRequest.find({ urgency: 'critical' })

// Find requests by category
const medicalRequests = await HelpRequest.find({ category: 'medical' })

// Find verified requests near location
const nearbyRequests = await HelpRequest.find({
  verificationStatus: 'verified',
  'location.coordinates': {
    $near: {
      $geometry: { type: 'Point', coordinates: [73.8355, 18.5204] },
      $maxDistance: 50000,
    },
  },
})
```

### Certificate Queries
```javascript
// Find certificates issued by NGO
const certificates = await Certificate.find({ issuer: ngoId })

// Find user's certificates
const certificates = await Certificate.find({ recipient: userId })

// Get donation certificates
const certificates = await Certificate.find({ type: 'donation' })
  .populate('recipient')
  .populate('issuer')

// Get certificate by number
const cert = await Certificate.findOne({ certificateNumber: 'CERT-xxx' })
```

### Transaction Queries
```javascript
// Find user transactions
const transactions = await Transaction.find({ user: userId }).sort({ createdAt: -1 })

// Find completed transactions
const transactions = await Transaction.find({ status: 'completed' })

// Get transaction by order ID
const transaction = await Transaction.findOne({ razorpayOrderId: 'order_123' })

// Get transactions by payment method
const upiTransactions = await Transaction.find({ paymentMethod: 'upi' })

// Calculate total transaction amount
const stats = await Transaction.aggregate([
  { $match: { status: 'completed' } },
  {
    $group: {
      _id: null,
      totalAmount: { $sum: '$amount' },
      count: { $sum: 1 },
    },
  },
])
```

### Badge Queries
```javascript
// Find all active badges
const badges = await Badge.find({ isActive: true })

// Get badges by category
const donationBadges = await Badge.find({ category: 'donation' })

// Get legendary badges
const legendaryBadges = await Badge.find({ rarity: 'legendary' })

// Find users with badge
const usersWithBadge = await Badge.findById(badgeId).populate('holders')
```

### QR Attendance Queries
```javascript
// Get event attendance
const attendance = await QRAttendance.find({ event: eventId })

// Get checked-in participants
const checkedIn = await QRAttendance.find({
  event: eventId,
  status: 'checked_in',
})

// Get user's event attendance
const userEvents = await QRAttendance.find({ participant: userId })
  .populate('event')
  .sort({ checkInTime: -1 })

// Calculate volunteer hours
const hours = await QRAttendance.aggregate([
  { $match: { event: eventId } },
  { $group: { _id: null, totalHours: { $sum: '$attendanceDuration' } } },
])
```

### Analytics Queries
```javascript
// Get today's analytics
const today = new Date()
today.setHours(0, 0, 0, 0)
const analytics = await Analytics.findOne({ date: today })

// Get NGO-specific analytics
const ngoAnalytics = await Analytics.find({ ngo: ngoId }).sort({ date: -1 })

// Get performance metrics
const performance = await Analytics.findOne({ date: today })
// Access performance.metrics, performance.pageViews, performance.performance
```

---

## Aggregation Pipeline Examples

### Top Donors
```javascript
const topDonors = await Donation.aggregate([
  { $match: { status: 'completed' } },
  { $group: { _id: '$donor', totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } },
  { $sort: { totalAmount: -1 } },
  { $limit: 10 },
  { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'donor' } },
  { $unwind: '$donor' },
])
```

### NGO Performance
```javascript
const ngoStats = await Donation.aggregate([
  { $match: { status: 'completed' } },
  { $group: {
      _id: '$ngo',
      totalDonations: { $sum: '$amount' },
      donorCount: { $sum: 1 },
      avgDonation: { $avg: '$amount' }
    }
  },
  { $sort: { totalDonations: -1 } },
  { $lookup: { from: 'ngos', localField: '_id', foreignField: '_id', as: 'ngo' } },
])
```

### Donation Trends by Date
```javascript
const trends = await Donation.aggregate([
  { $match: { status: 'completed' } },
  {
    $group: {
      _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
      amount: { $sum: '$amount' },
      count: { $sum: 1 },
    },
  },
  { $sort: { _id: 1 } },
])
```

---

## Validation Examples

### User Validation
```javascript
// Email validation (automatic)
// Password validation (min 6 chars, hashed before save)
// Phone validation (10 digits)

// Usage
try {
  await user.save()
} catch (error) {
  if (error.name === 'ValidationError') {
    console.log(error.errors) // Access specific field errors
  }
}
```

### NGO Validation
```javascript
// Required fields: name, description, mission, owner, category, location
// Category must be one of enum values
// Coordinates must be valid GeoJSON

// Usage
const ngo = new NGO({
  name: 'Test NGO',
  description: 'Description',
  mission: 'Mission',
  owner: userId,
  category: 'Education', // Must match enum
  location: {
    address: 'Address',
    city: 'City',
    state: 'State',
    coordinates: {
      type: 'Point',
      coordinates: [77.2065, 28.6139], // [longitude, latitude]
    },
  },
  contact: {
    email: 'email@example.com',
    phone: '1234567890',
  },
})
```

---

## Relationships and Population

### Populate Examples
```javascript
// Single level populate
const user = await User.findById(userId).populate('ngoOwned')

// Multiple populates
const donation = await Donation.findById(donationId)
  .populate('donor')
  .populate('ngo')
  .populate('certificate')

// Nested populate
const event = await Event.findById(eventId)
  .populate({
    path: 'ngo',
    populate: { path: 'owner' }
  })

// Select specific fields
const user = await User.findById(userId).populate({
  path: 'badges',
  select: 'name icon rarity'
})
```

---

## Bulk Operations

### Insert Many
```javascript
const users = await User.insertMany([
  { firstName: 'John', ... },
  { firstName: 'Jane', ... },
])
```

### Update Many
```javascript
// Update all pending donations to a specific status
await Donation.updateMany(
  { status: 'pending' },
  { status: 'completed' }
)
```

### Delete Many
```javascript
// Delete inactive users
await User.deleteMany({ isActive: false })
```

---

## Transactions (Database Transactions)

For operations that need to be atomic:
```javascript
import mongoose from 'mongoose'

const session = await mongoose.startSession()
session.startTransaction()

try {
  // Multiple operations
  const user = await User.findByIdAndUpdate(
    userId,
    { donationAmount: amount },
    { session }
  )
  const donation = await Donation.create([{ ... }], { session })
  const transaction = await Transaction.create([{ ... }], { session })

  await session.commitTransaction()
} catch (error) {
  await session.abortTransaction()
  throw error
} finally {
  await session.endSession()
}
```

---

## Performance Tips

1. **Use lean()** for read-only queries to reduce memory:
   ```javascript
   const donations = await Donation.find({ status: 'completed' }).lean()
   ```

2. **Limit fields** with select:
   ```javascript
   const users = await User.find().select('firstName lastName email')
   ```

3. **Use indexes** for filtered queries:
   ```javascript
   // These queries will use indexes
   const users = await User.find({ email: 'test@example.com' })
   const events = await Event.find({ status: 'upcoming' })
   ```

4. **Paginate large result sets**:
   ```javascript
   const page = 1
   const limit = 10
   const donations = await Donation.find()
     .skip((page - 1) * limit)
     .limit(limit)
   ```

5. **Use compound indexes** for common filter combinations

---

## Testing Queries

Test queries easily with:
```bash
# Using MongoDB Compass
# Using MongoDB Shell in Atlas
# Using Mongoose in Node REPL
node
> const mongoose = require('mongoose')
> await mongoose.connect(uri)
> const User = require('./models/User')
> await User.find()
```
