# Server Development Guide

This document provides guidelines for developing the NGO Platform server application.

## Project Structure Best Practices

### Controllers
Controllers handle the business logic for routes. Keep them clean and focused.

```javascript
export const getResource = asyncHandler(async (req, res) => {
  // Business logic
  successResponse(res, data, 'Success message')
})
```

### Models
Define Mongoose schemas with proper validation:

```javascript
const schema = new mongoose.Schema({
  field: {
    type: String,
    required: [true, 'Custom error message'],
  },
})
```

### Routes
Keep routes organized and use proper HTTP methods:

```javascript
router.get('/', getAll)
router.post('/', create)
router.put('/:id', update)
router.delete('/:id', delete)
```

### Middleware
Use middleware for authentication, validation, and error handling:

```javascript
router.post('/', authenticate, validateRequest(schema), create)
```

## Naming Conventions

- **Files**: camelCase (e.g., `userController.js`)
- **Routes**: kebab-case URLs (e.g., `/api/user-profile`)
- **Database Fields**: camelCase (e.g., `firstName`)
- **Environment Variables**: UPPER_SNAKE_CASE

## Error Handling

Always use the `errorResponse` utility:

```javascript
if (!resource) {
  return errorResponse(res, 'Resource not found', 404)
}
```

## Authentication

Use JWT tokens with the `authenticate` middleware:

```javascript
router.get('/profile', authenticate, getUserProfile)
```

Use `authorize` middleware for role-based access:

```javascript
router.delete('/:id', authenticate, authorize('admin'), deleteUser)
```

## Database Operations

- Always use async/await
- Handle errors with try-catch or asyncHandler
- Validate input before database operations
- Use Mongoose validation

## Testing

Run linting:
```bash
npm run lint
npm run lint:fix
```

Format code:
```bash
npm run format
```

Check if server is running:
```bash
curl http://localhost:5000/api/health
```

## Deployment

Before deployment:
1. Set environment variables
2. Connect to production MongoDB
3. Update CORS settings
4. Review security configurations
5. Test all endpoints

## Security Best Practices

1. Always validate and sanitize input
2. Use environment variables for secrets
3. Implement rate limiting
4. Use HTTPS in production
5. Validate JWT tokens
6. Hash passwords with bcrypt
7. Use CORS appropriately
8. Implement request logging
