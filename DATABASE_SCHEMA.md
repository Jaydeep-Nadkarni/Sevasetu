# MongoDB Schema Documentation

This document provides a comprehensive overview of all MongoDB schemas used in the Sevasetu NGO Platform.

## Database Connection

The MongoDB connection is configured in `server/src/config/db.js` with:
- Connection pooling (max 10, min 5 connections)
- Automatic retry on failure
- Connection event handlers
- Graceful error handling

### Connection String
Use your MongoDB Atlas URI in the `.env` file:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ngo_db
```

---

## Schema Overview

### 1. User Schema
**File:** `server/src/models/User.js`

Stores user information with support for multiple roles (user, ngo_admin, admin, moderator).

**Key Fields:**
- `firstName`, `lastName` - User's name
- `email` - Unique, indexed for quick lookup
- `password` - Hashed with bcrypt (10 rounds)
- `phone` - Validated 10-digit format
- `role` - User's role in the platform
- `ngoOwned` - Reference to NGO owned by user
- `location` - City, state, country
- `socialProfiles` - Links to social media
- `volunteerHours` - Tracked volunteer hours
- `donationAmount` - Total donations given
- `badges` - Array of earned badges
- `preferences` - Email, push, newsletter notifications

**Indexes:**
- `email` (unique)
- `role`
- `isActive`
- `location.city`
- `createdAt`

**Methods:**
- `matchPassword(password)` - Compare input password with hashed password

---

### 2. NGO Schema
**File:** `server/src/models/NGO.js`

Stores NGO information with location, category, and team management.

**Key Fields:**
- `name` - NGO name (indexed)
- `description` - Long description of NGO
- `mission` - Mission statement
- `vision` - Vision statement
- `owner` - Reference to User (NGO admin)
- `registrationNumber` - Unique registration number
- `category` - Type of NGO (Education, Healthcare, etc.)
- `location` - Address with geospatial coordinates
- `contact` - Email, phone, website
- `team` - Array of User references
- `volunteers` - Array of volunteer User references
- `totalDonations` - Sum of all donations
- `rating` - Platform rating (0-5)
- `verificationStatus` - pending/verified/rejected
- `documents` - Array of uploaded documents

**Indexes:**
- Text search on name, description, mission
- `owner`
- `category`
- `location.city`
- `verificationStatus`
- `isActive`
- Geospatial on coordinates

**Geospatial Support:** 2dsphere index for location-based queries

---

### 3. Donation Schema
**File:** `server/src/models/Donation.js`

Tracks all donations (monetary and non-monetary).

**Key Fields:**
- `donor` - Reference to User
- `ngo` - Reference to NGO
- `amount` - Donation amount
- `type` - monetary/supplies/service/skill
- `status` - pending/completed/failed/refunded
- `paymentMethod` - How payment was made
- `razorpayPaymentId`, `razorpayOrderId` - Payment gateway IDs
- `certificate` - Reference to Certificate
- `taxDeductible` - Whether donation qualifies for tax deduction
- `panNumber` - PAN for tax deduction

**Indexes:**
- `donor`, `createdAt`
- `ngo`, `createdAt`
- `status`
- `type`
- `createdAt`

---

### 4. Event Schema
**File:** `server/src/models/Event.js`

Stores event information for volunteering and fundraising activities.

**Key Fields:**
- `title` - Event name (indexed)
- `description` - Event details
- `ngo` - Organizing NGO
- `organizer` - User organizing the event
- `startDate`, `endDate` - Event duration (indexed)
- `location` - Address with geospatial support
- `category` - volunteering/fundraising/awareness/educational
- `capacity` - Maximum participants
- `registrations` - Array of registered Users
- `volunteers` - Array of actual volunteers
- `targetVolunteerHours`, `actualVolunteerHours` - Hour tracking
- `status` - upcoming/ongoing/completed/cancelled
- `attendanceTracking` - Enable QR attendance
- `qrEnabled` - QR code for check-in

**Indexes:**
- `ngo`, `startDate`
- `organizer`
- `category`
- `status`
- `location.city`
- Geospatial on coordinates

---

### 5. HelpRequest Schema
**File:** `server/src/models/HelpRequest.js`

Handles requests for help from community members.

**Key Fields:**
- `requester` - User requesting help
- `title` - Request title
- `description` - Detailed description
- `category` - Type of help needed
- `urgency` - low/medium/high/critical (indexed)
- `location` - Location with geospatial support
- `beneficiaries` - Number of people to help
- `targetAmount` - Fundraising target
- `amountRaised` - Current amount collected
- `status` - open/in_progress/completed/closed
- `assignedNGO` - NGO handling the request
- `verificationStatus` - Verified/unverified
- `impact` - Completion details and metrics

**Indexes:**
- `requester`
- `category`
- `urgency`
- `status`
- `location.city`
- Geospatial on coordinates

---

### 6. Certificate Schema
**File:** `server/src/models/Certificate.js`

Generates and tracks certificates for donors and volunteers.

**Key Fields:**
- `recipient` - User receiving certificate
- `issuer` - NGO issuing certificate
- `type` - volunteering/donation/event/achievement
- `certificateNumber` - Unique identifier (auto-generated)
- `issueDate` - When certificate was issued
- `volunteerHours`, `amount` - Details about contribution
- `certificateUrl` - URL to certificate PDF/image
- `qrCode` - QR code for verification

**Indexes:**
- `recipient`
- `issuer`
- `issueDate`
- `type`
- `certificateNumber`

---

### 7. Transaction Schema
**File:** `server/src/models/Transaction.js`

Tracks all financial transactions with payment gateway integration.

**Key Fields:**
- `user` - User making transaction
- `ngo` - Receiving NGO
- `donation` - Related donation
- `amount` - Transaction amount
- `paymentMethod` - Payment type
- `status` - pending/completed/failed/refunded
- `transactionId` - Unique transaction ID
- `razorpayPaymentId`, `razorpayOrderId` - Razorpay IDs
- `paymentGateway` - razorpay/stripe/paypal
- `refundAmount`, `refundDate` - Refund tracking
- `ipAddress`, `userAgent` - Security tracking

**Indexes:**
- `user`, `createdAt`
- `ngo`, `createdAt`
- `status`
- `transactionId`
- `razorpayOrderId`
- `paymentMethod`

---

### 8. Badge Schema
**File:** `server/src/models/Badge.js`

Gamification badges for user achievements.

**Key Fields:**
- `name` - Badge name (unique)
- `description` - What badge represents
- `icon` - URL to badge icon
- `category` - Type of achievement
- `criteria` - Conditions to earn badge
- `rarity` - common/uncommon/rare/epic/legendary
- `holders` - Array of Users who have badge
- `awardedCount` - Total badges awarded

**Indexes:**
- `category`
- `isActive`

---

### 9. QRAttendance Schema
**File:** `server/src/models/QRAttendance.js`

Tracks attendance at events using QR codes.

**Key Fields:**
- `event` - Event being attended
- `participant` - User attending
- `qrCode` - Unique QR code
- `checkInTime`, `checkOutTime` - Check-in/out timestamps
- `attendanceDuration` - Minutes attended
- `status` - registered/checked_in/checked_out/absent
- `location` - Geospatial location at check-in
- `verifiedBy` - User who verified attendance

**Indexes:**
- `event`, `participant`
- `event`, `checkInTime`
- `status`
- `qrCode`

---

### 10. Analytics Schema
**File:** `server/src/models/Analytics.js`

Platform-wide analytics and statistics.

**Key Fields:**
- `date` - Analytics date
- `ngo` - Optional NGO-specific analytics
- `metrics` - Comprehensive metrics:
  - User counts (total, active, new)
  - NGO counts
  - Donation statistics
  - Event statistics
  - Help request fulfillment
  - Certificate issuance
  - Transaction success rate
- `pageViews` - Traffic by page
- `engagement` - Session duration, bounce rate
- `performance` - API response time, error rate, uptime
- `topDonators` - Top donors
- `topNGOs` - Top performing NGOs

**Indexes:**
- `date`
- `ngo`, `date`

---

## Relationships Map

```
User
├── owns NGO (1:1) → NGO.owner
├── receives Donations (1:N) ← Donation.donor
├── creates Events (1:N) ← Event.organizer
├── requests Help (1:N) ← HelpRequest.requester
├── earns Badges (N:N) ← Badge.holders
├── receives Certificates (1:N) ← Certificate.recipient
└── makes Transactions (1:N) ← Transaction.user

NGO
├── has Owner (1:1) → User
├── has Team Members (N:N) → User
├── has Volunteers (N:N) → User
├── receives Donations (1:N) ← Donation.ngo
├── organizes Events (1:N) ← Event.ngo
├── issues Certificates (1:N) ← Certificate.issuer
├── handles Help Requests (1:N) ← HelpRequest.assignedNGO
└── receives Transactions (1:N) ← Transaction.ngo

Event
├── belongs to NGO (N:1) → NGO
├── organized by User (N:1) → User
├── has Participants (N:N) → User
├── has Volunteers (N:N) → User
└── has QR Attendance (1:N) ← QRAttendance.event

Donation
├── from User (N:1) → User
├── to NGO (N:1) → NGO
├── generates Certificate (1:1) ← Certificate.donation
└── tracked by Transaction (1:1) ← Transaction.donation
```

---

## Indexing Strategy

### Performance Indexes
- **Email lookups**: `User.email`
- **Status queries**: All schemas have status indexes
- **Date range queries**: `createdAt`, `startDate`, `issueDate`
- **User queries**: User references indexed across all schemas
- **Category filtering**: `category` indexes for filtering

### Geospatial Indexes
- `NGO.location.coordinates` - Find NGOs near location
- `Event.location.coordinates` - Find events near location
- `HelpRequest.location.coordinates` - Find requests near location
- `QRAttendance.location` - Track check-in locations

### Text Search Indexes
- `NGO` - Full text search on name, description, mission
- `Event` - Search on title and description
- `HelpRequest` - Search on title and description

---

## Seeding the Database

### Run the seed script:
```bash
npm run seed
```

This will:
1. Clear all existing data
2. Create 5 sample users
3. Create 3 sample NGOs
4. Create 4 sample badges
5. Create 2 sample events
6. Create 3 sample donations
7. Create 3 sample transactions
8. Create 2 sample help requests
9. Create 2 sample certificates
10. Create analytics data

### Seed Data Includes:
- **Users**: Admin, NGO admins, regular users with different locations
- **NGOs**: Education, Healthcare, Environment categories
- **Donations**: Various amounts and payment methods
- **Events**: Upcoming events with locations
- **Help Requests**: Open requests needing support

---

## Schema Validation

All schemas include:
- **Required fields**: Validation at schema level
- **Type validation**: Mongoose type checking
- **Enum validation**: Restricted values for status, category, etc.
- **Min/Max validation**: Number ranges
- **Pattern validation**: Email, phone regex
- **Unique constraints**: Email, registration numbers
- **Custom validators**: Date ranges, amount comparisons

---

## Best Practices

1. **Always use refs** for relationships instead of embedding
2. **Index frequently queried fields** to improve performance
3. **Use sparse indexes** for optional unique fields
4. **Validate input** at schema and application level
5. **Hash sensitive data** (passwords using bcrypt)
6. **Use geospatial queries** for location-based features
7. **Archive old data** regularly to maintain performance
8. **Monitor query performance** with MongoDB Atlas

---

## Migration Notes

If modifying schemas:
1. Create a backup before changes
2. Test changes in development first
3. Use MongoDB's migration tools for production
4. Update indexes after schema changes
5. Test query performance after migrations

---

## Support

For database-related questions or issues:
- Check MongoDB documentation: https://docs.mongodb.com
- Review Mongoose documentation: https://mongoosejs.com
- Check schema validation errors in application logs
