# Quick Reference: Socket.IO Integration Pattern

## One-Minute Implementation Guide

### Step 1: Import in Controller
```javascript
import { getIO, emitEventCreated } from '../utils/socketEmitter.js'
```

### Step 2: Add After Database Operation
```javascript
// After creating/updating/deleting in database
const io = getIO(req)
emitEventCreated(io, event)  // or appropriate emit function
```

### Step 3: Done!
The client will automatically receive the update and refresh data.

---

## Socket Event Emitters Reference

### Events
- `emitEventCreated(io, event)` - broadcast event creation
- `emitEventUpdated(io, event)` - broadcast event update
- `emitEventDeleted(io, eventId)` - broadcast event deletion
- `emitEventJoined(io, userId, eventId, eventData)` - user joined
- `emitEventAttended(io, userId, eventId)` - user attended

### Donations
- `emitDonationCreated(io, donation)` - new donation
- `emitDonationUpdated(io, donation)` - donation update
- `emitDonationAccepted(io, donation, ngoId)` - NGO accepted
- `emitDonationCancelled(io, donationId, reason)` - cancelled

### Help Requests
- `emitHelpRequestCreated(io, helpRequest)` - new request
- `emitHelpRequestUpdated(io, helpRequest)` - update
- `emitHelpRequestDeleted(io, helpRequestId)` - deleted

### Certificates & Points
- `emitCertificateEarned(io, userId, certificate)` - certificate earned
- `emitPointsEarned(io, userId, {...data})` - points awarded
- `emitBadgeEarned(io, userId, badge)` - badge earned

### Notifications
- `emitNotification(io, userId, notification)` - send notification
- `emitActivityRecorded(io, activity)` - record activity

---

## Frontend: Automatic Updates

### What's Already Done ✅
- EventList.jsx
- HelpRequestList.jsx
- DonationHistory.jsx
- Certificates.jsx
- Progress.jsx
- Leaderboard.jsx

All these components automatically listen for socket events and refresh their data cache.

### How It Works
```
Controller emits socket event
    ↓
SocketContext receives event
    ↓
Calls invalidateQueries()
    ↓
React Query refetches data
    ↓
Component updates automatically
```

---

## Backend: Controllers to Update

Add socket emitter to each controller's create/update/delete/accept/cancel operations.

```javascript
// Pattern
export const controllerAction = async (req, res) => {
  // ... do database operation ...
  const result = await Model.create/findByIdAndUpdate/findByIdAndDelete(...)
  
  // Add these 2 lines:
  const io = getIO(req)
  emitFunctionName(io, result)
  
  // ... send response ...
  res.json({ success: true, result })
}
```

---

## Recommended Update Order

1. **Event Controller** - Most impactful
   - `createEvent` → emit `emitEventCreated`
   - `updateEvent` → emit `emitEventUpdated`
   - `deleteEvent` → emit `emitEventDeleted`
   - `joinEvent` → emit `emitEventJoined`
   - `attendEvent` → emit `emitEventAttended`

2. **Donation Controller** - High priority
   - `createItemDonation` → emit `emitDonationCreated`
   - `updateDonation` → emit `emitDonationUpdated`
   - `acceptDonation` → emit `emitDonationAccepted`
   - `cancelDonation` → emit `emitDonationCancelled`

3. **Help Request Controller**
   - `createHelpRequest` → emit `emitHelpRequestCreated`
   - `updateHelpRequest` → emit `emitHelpRequestUpdated`
   - `deleteHelpRequest` → emit `emitHelpRequestDeleted`

4. **Points & Gamification** (User Controller)
   - Points earning → emit `emitPointsEarned`
   - Badge earning → emit `emitBadgeEarned`

5. **Certificates** (Certificate Controller)
   - `issueCertificate` → emit `emitCertificateEarned`

6. **Notifications** (Notification Controller)
   - Any notification → emit `emitNotification`

---

## Testing Your Integration

```bash
# 1. Open DevTools Console - Look for:
# "📱 New client connected: [socket-id]"
# "✅ User [userId] joined their notification room"

# 2. Check for socket events:
# Open 2 browser windows (same app)
# Create event in window 1
# Should see update in window 2 instantly (within 1-2 seconds)

# 3. Check React Query DevTools:
# Go to DevTools → React Query
# Create event
# Watch ['events'] query get invalidated and refetch automatically
```

---

## Example: Complete Event Controller Update

```javascript
// At top of eventController.js
import { getIO, emitEventCreated, emitEventUpdated, emitEventDeleted } from '../utils/socketEmitter.js'

// Create event
export const createEvent = async (req, res) => {
  try {
    // ... existing validation code ...
    
    const event = await Event.create(eventData)
    
    // ADDED: Emit socket event
    const io = getIO(req)
    emitEventCreated(io, event)
    
    res.status(201).json({ success: true, event })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// Update event
export const updateEvent = async (req, res) => {
  try {
    // ... existing validation code ...
    
    const event = await Event.findByIdAndUpdate(eventId, updateData, { new: true })
    
    // ADDED: Emit socket event
    const io = getIO(req)
    emitEventUpdated(io, event)
    
    res.json({ success: true, event })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// Delete event
export const deleteEvent = async (req, res) => {
  try {
    // ... existing validation code ...
    
    await Event.findByIdAndDelete(eventId)
    
    // ADDED: Emit socket event
    const io = getIO(req)
    emitEventDeleted(io, eventId)
    
    res.json({ success: true, message: 'Event deleted' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
```

That's it! Just 3 lines per action and you have real-time updates.

---

## Common Issues & Solutions

### Issue: "getIO is not a function"
**Solution**: Check import statement
```javascript
// ✅ Correct
import { getIO, emitEventCreated } from '../utils/socketEmitter.js'

// ❌ Wrong
import socketEmitter from '../utils/socketEmitter.js'
const { getIO } = socketEmitter
```

### Issue: "socket event not received on frontend"
**Solution**: Check:
1. Is controller calling emit function?
2. Is SocketContext listening for that event?
3. Check browser console for socket connection

### Issue: "Data not updating in UI"
**Solution**: Verify:
1. Socket emitter is called AFTER database update
2. React Query cache key matches invalidation key
3. Component has proper useEffect dependencies

---

## Questions?

Refer to full documentation:
- **Integration Guide**: `server/src/utils/SOCKET_INTEGRATION_GUIDE.js`
- **Socket Emitters**: `server/src/utils/socketEmitter.js`
- **Summary**: `SOCKET_INTEGRATION_SUMMARY.md`
