# Image Upload System - Quick Reference

## 🚀 Quick Start

### Server (Backend)
```bash
cd server
npm install cloudinary multer  # If not installed
npm run dev                     # Starts on port 5000
```

### Client (Frontend)
```bash
cd client
npm run dev                     # Starts on port 5174
```

### Test Upload
1. Go to http://localhost:5174
2. Login with your credentials
3. Go to Profile page
4. Click "Edit Profile"
5. Drag image to upload area or click to browse
6. Click "Upload"
7. Image should upload to Cloudinary and display

---

## 📝 API Endpoints

### Upload Single Image
```
POST /api/upload
Headers: Authorization: Bearer {token}
Body: form-data { file: File }
Response: { publicId, url, thumbnail, width, height, size, format }
```

### Upload Multiple Images
```
POST /api/upload/multiple
Headers: Authorization: Bearer {token}
Body: form-data { files: File[] }
Response: { uploaded: [], failed: [], count: number }
```

### Delete Image
```
DELETE /api/upload
Headers: Authorization: Bearer {token}
Body: JSON { "publicId": "sevasetu/xyz123" }
Response: { success: true, message: "Image deleted successfully" }
```

### Get Image URL
```
GET /api/upload/url/:publicId?quality=80&width=300&height=300
Response: { url: "https://res.cloudinary.com/..." }
```

### Resize Image
```
POST /api/upload/resize
Headers: Authorization: Bearer {token}
Body: JSON { "publicId": "...", "width": 300, "height": 300, "quality": 85 }
Response: { url: "https://res.cloudinary.com/..." }
```

---

## 🎨 Component Usage

### Basic Usage
```jsx
import { ImageUpload } from '@/components/ImageUpload'

export function MyComponent() {
  const handleUpload = (uploadData) => {
    console.log('Image URL:', uploadData.url)
    console.log('Public ID:', uploadData.publicId)
  }

  const handleDelete = () => {
    console.log('Image deleted')
  }

  return (
    <ImageUpload
      onUpload={handleUpload}
      onDelete={handleDelete}
      currentImageUrl={existingImageUrl}
      maxSize={5242880}
    />
  )
}
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onUpload` | Function | - | Called with `{ url, publicId, thumbnail, size }` |
| `onDelete` | Function | - | Called when image is deleted |
| `currentImageUrl` | String | null | URL of existing image |
| `accept` | String | 'image/*' | File type filter |
| `maxSize` | Number | 5242880 | Max file size in bytes (5MB) |
| `disabled` | Boolean | false | Disable upload |

### Features
- ✅ Drag and drop support
- ✅ Click to browse
- ✅ Image preview
- ✅ Progress bar
- ✅ Error messages
- ✅ Success notification
- ✅ Delete button
- ✅ Dark mode
- ✅ Mobile responsive
- ✅ Animations

---

## 🔑 Key Files

### Backend
```
server/src/
├── config/cloudinary.js         (Cloudinary setup)
├── middleware/upload.js         (File validation)
├── controllers/uploadController.js  (Request handlers)
└── routes/uploadRoutes.js       (API endpoints)
```

### Frontend
```
client/src/
├── components/
│   ├── ImageUpload.jsx          (Upload component)
│   └── UI/index.js              (Component exports)
└── pages/User/Profile.jsx       (Integration)
```

---

## 🎯 State Management

### ImageUpload Component State
```javascript
file              // Selected File object
preview           // Data URL for preview
isLoading         // Upload in progress
progress          // 0-100 percentage
error             // Error message (if any)
isDragging        // Drag-over state
publicId          // Cloudinary public ID
```

### Profile Component State
```javascript
profileImage      // Current image URL
isEditing         // Edit mode toggle
formData          // Form field values
errors            // Form validation errors
isSaving          // Save in progress
```

---

## 🎨 Styling

### Dark Mode
All elements automatically adapt to dark mode:
```javascript
const { isDark } = useTheme()

// Example
className={`
  ${isDark ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}
`}
```

### Colors
- **Primary**: #1f2937 (for upload success, active states)
- **Danger**: #ef4444 (for delete actions)
- **Success**: #10b981 (for success messages)
- **Error**: #f87171 (for error messages)

### Responsive Breakpoints
- Mobile: < 768px (md breakpoint)
- Tablet: 768px - 1024px
- Desktop: > 1024px (lg breakpoint)

---

## 🐛 Debugging

### Check Server Connection
```javascript
// In browser console
fetch('http://localhost:5000/api/health')
  .then(r => r.json())
  .then(d => console.log(d))
```

### Check Upload Endpoint
```javascript
// Make a test request
const formData = new FormData()
formData.append('file', fileInput.files[0])

fetch('http://localhost:5000/api/upload', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  },
  body: formData
})
.then(r => r.json())
.then(d => console.log(d))
```

### Check Cloudinary Config
```javascript
// In server console, test manually
import { uploadImage } from './src/config/cloudinary.js'

const buffer = /* file buffer */
const result = await uploadImage(buffer)
console.log(result)
```

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | No/invalid JWT token | Login and try again |
| 400 File validation failed | Wrong file type/size | Select valid image (< 5MB) |
| 500 Upload failed | Cloudinary error | Check API credentials |
| No file provided | Form data issue | Ensure file is in 'file' field |
| CORS error | Port mismatch | Update CORS_ORIGIN in .env |

---

## 📊 Performance Tips

### Optimize Upload
```javascript
// Use smaller images
// 1920x1080 or smaller is ideal
// JPEG quality 80 is good default

// Compress before upload
// Use image compression library
// Or let Cloudinary handle it
```

### Optimize Display
```javascript
// Use thumbnail URLs for lists
// Use full-size URLs for detail pages

// Example
thumbnail={result.eager?.[0]?.secure_url}  // 200x200
url={result.secure_url}                     // Full size

// In HTML
<img src={thumbnail} loading="lazy" alt="..." />
```

---

## 🔒 Security Checklist

- ✅ Validate file size on client AND server
- ✅ Validate file type on client AND server
- ✅ Require authentication for upload/delete
- ✅ Use JWT tokens for security
- ✅ Keep Cloudinary credentials in .env
- ✅ Don't expose API keys in frontend
- ✅ Use HTTPS in production
- ✅ Set proper CORS headers
- ✅ Limit upload frequency if needed
- ✅ Log all upload/delete actions

---

## 📈 Monitoring

### What to Track
```javascript
// Upload success rate
// Average upload time
// File sizes (min/max/avg)
// Error frequency
// User engagement (upload count)

// Example logging
console.log({
  event: 'image_upload',
  size: file.size,
  type: file.type,
  duration: endTime - startTime,
  success: true/false
})
```

---

## 🚀 Next Steps

### Immediate (Already Done)
- ✅ Cloudinary integration
- ✅ Multer middleware
- ✅ Upload endpoints
- ✅ ImageUpload component
- ✅ Profile integration

### Short Term (1-2 hours)
- [ ] Persist profilePicture to User model
- [ ] Add delete confirmation modal
- [ ] Test with real images
- [ ] Add loading skeleton states

### Medium Term (half day)
- [ ] Image gallery for events
- [ ] Batch upload UI
- [ ] Image cropping tool
- [ ] Filter/edit UI

### Long Term (1+ day)
- [ ] OCR for certificates
- [ ] Face detection profiles
- [ ] Progressive image loading
- [ ] CDN integration

---

## 📞 Quick Fixes

### Upload not working?
1. Check server is running: `npm run dev` in server folder
2. Check auth token is valid: Login again
3. Check Cloudinary credentials in .env
4. Check CORS_ORIGIN in .env matches client port (5174)
5. Check browser console for specific error

### Image not showing?
1. Check image URL in Network tab
2. Check Cloudinary account has image
3. Check public_id is correct
4. Try alternate URL format

### Dark mode not working?
1. Check ThemeProvider wraps App in main.jsx
2. Check useTheme hook is called
3. Check tailwind config has darkMode: 'class'
4. Clear browser cache and refresh

---

## 💾 Environment Variables

Required in `.env` file:
```bash
# Cloudinary
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

# Server
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5174

# Database
MONGO_URI=your_mongo_uri

# JWT
JWT_SECRET=your_secret
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| IMAGE_UPLOAD_IMPLEMENTATION.md | Detailed implementation guide |
| IMAGE_UPLOAD_TESTING.md | Comprehensive testing checklist |
| IMAGE_UPLOAD_QUICK_REFERENCE.md | This file - quick lookup |

---

## 🎓 Learn More

### Cloudinary Docs
- https://cloudinary.com/documentation/image_upload_api_reference
- https://cloudinary.com/documentation/transformation_reference

### Multer Docs
- https://github.com/expressjs/multer

### React Patterns
- https://react.dev/learn

### Framer Motion
- https://www.framer.com/motion/

---

## ✨ Success Indicators

When everything is working:
- ✅ Can drag image to upload area
- ✅ Preview shows immediately
- ✅ Progress bar fills to 100%
- ✅ Image displays in profile
- ✅ Can delete and upload new image
- ✅ Dark mode works correctly
- ✅ Mobile layout is responsive
- ✅ No console errors

If you see all these, you're good to go! 🎉

