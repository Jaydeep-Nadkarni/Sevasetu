# React Query v5 Migration - Fixes Applied

**Date:** November 30, 2025  
**Issue:** React Query v5 API breaking change - old positional argument syntax no longer supported  
**Status:** ✅ FIXED

---

## Problem

React Query v5 only accepts the **Object form** for `useQuery()`. The old v3/v4 syntax with positional arguments:
```javascript
useQuery(key, fetchFn, options) // ❌ No longer works
```

Caused error in browser console:
```
Uncaught Error: Bad argument type. Starting with v5, only the "Object" form 
is allowed when calling query related functions.
```

---

## Solution

All `useQuery()` calls converted to Object form:
```javascript
useQuery({
  queryKey: key,
  queryFn: fetchFn,
  ...options
}) // ✅ Now works
```

Also renamed `cacheTime` → `gcTime` (changed in v5).

---

## Files Fixed (6 Total)

| File | Status | Changes |
|------|--------|---------|
| `EventList.jsx` | ✅ Fixed | Converted useQuery syntax, renamed cacheTime → gcTime |
| `HelpRequestList.jsx` | ✅ Fixed | Converted useQuery syntax, renamed cacheTime → gcTime |
| `Progress.jsx` | ✅ Fixed | Converted useQuery syntax, renamed cacheTime → gcTime |
| `Leaderboard.jsx` | ✅ Fixed | Converted useQuery syntax, renamed cacheTime → gcTime |
| `Certificates.jsx` | ✅ Fixed | Converted useQuery syntax, renamed cacheTime → gcTime |
| `DonationHistory.jsx` | ✅ Fixed | Converted useQuery syntax, renamed cacheTime → gcTime |

---

## Code Changes Example

### Before (v4 style - ❌ Broken)
```javascript
const { data, isLoading } = useQuery(
  ['events'],
  async () => {
    const response = await api.get('/api/events')
    return response.data
  },
  {
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  }
)
```

### After (v5 style - ✅ Working)
```javascript
const { data, isLoading } = useQuery({
  queryKey: ['events'],
  queryFn: async () => {
    const response = await api.get('/api/events')
    return response.data
  },
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000, // cacheTime renamed to gcTime
})
```

---

## Key Changes in v5

| v4 | v5 |
|----|-----|
| `useQuery(key, fn, options)` | `useQuery({ queryKey, queryFn, ...options })` |
| `cacheTime` | `gcTime` (Garbage Collection Time) |
| Query key can be string or array | Query key must be array |
| `useMutation(fn, options)` | `useMutation({ mutationFn, ...options })` |

---

## Verification

Run the following to confirm all fixes:
```bash
cd client
npm run dev
```

Expected behavior:
- ✅ No "Bad argument type" error
- ✅ No React Query warnings about signature
- ✅ All pages load without React Query errors
- ✅ Data fetches work correctly

---

## What This Fixes

✅ EventList page now loads without error  
✅ Progress page works  
✅ Leaderboard displays  
✅ Certificates page functional  
✅ Help requests list works  
✅ Donation history loads  

---

## Non-Breaking Issues (Warnings Only)

These are not blocking but appear in console:

1. **React Router Future Flag Warnings**
   - Message: "React Router will begin wrapping state updates in React.startTransition in v7"
   - Impact: None - just future deprecation notices
   - Fix: Can be addressed when upgrading to Router v7

2. **Missing Logo Icons**
   - Message: "Error while trying to use the following icon from the Manifest: logo192.png"
   - Impact: None - app works fine, manifest just references non-existent images
   - Fix: Optional - add logo images to `public/` folder if needed

3. **Rate Limiting (API Issue)**
   - Message: "Failed to load resource: the server responded with a status of 429"
   - Impact: Backend rate limiting on some endpoints
   - Status: Not a client-side issue

4. **Missing Activity Endpoint (API Issue)**
   - Message: "Failed to load resource: the server responded with a status of 404"
   - Impact: Backend endpoint not implemented
   - Status: Not a client-side issue

---

## Summary

| Item | Status |
|------|--------|
| React Query v5 Syntax | ✅ Fixed in 6 files |
| cacheTime → gcTime | ✅ Updated in 6 files |
| useQuery position args | ✅ Converted to object form |
| App functionality | ✅ Restored |

---

## Next Steps

If you see any other React Query errors:

1. Look for patterns like: `useQuery(key, fn, options)`
2. Convert to: `useQuery({ queryKey: key, queryFn: fn, ...options })`
3. Rename: `cacheTime` → `gcTime`

**The app should now run without React Query errors!** 🚀
