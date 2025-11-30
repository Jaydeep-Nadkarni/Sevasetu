# Client Development Guide

This document provides guidelines for developing the NGO Platform client application.

## Component Structure

Components should follow this structure:

```jsx
import PropTypes from 'prop-types'
import './ComponentName.css'

const ComponentName = ({ prop1, prop2 }) => {
  return (
    <div className="component">
      {/* Component JSX */}
    </div>
  )
}

ComponentName.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number,
}

ComponentName.defaultProps = {
  prop2: 0,
}

export default ComponentName
```

## Naming Conventions

- **Components**: PascalCase (e.g., `Header`, `UserCard`)
- **Hooks**: camelCase starting with `use` (e.g., `useFetch`, `useAuth`)
- **Files**: Match component name or use camelCase for utilities
- **CSS Classes**: kebab-case (e.g., `user-card`, `primary-button`)

## State Management

Use Redux Toolkit for global state:

```javascript
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  data: [],
  loading: false,
  error: null,
}

const slice = createSlice({
  name: 'feature',
  initialState,
  reducers: {
    // Define reducers
  },
})

export default slice.reducer
```

## API Integration

Use the `api` utility from `src/utils/api.js`:

```javascript
import api from '../utils/api'

const fetchUsers = async () => {
  try {
    const response = await api.get('/users')
    return response.data
  } catch (error) {
    console.error('Error fetching users:', error)
  }
}
```

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

## Deployment

Build for production:
```bash
npm run build
npm run preview
```

## Best Practices

1. Keep components small and focused
2. Use custom hooks for reusable logic
3. Memoize expensive computations
4. Handle loading and error states
5. Write semantic HTML
6. Use Tailwind CSS utilities
7. Add TypeScript types when possible
