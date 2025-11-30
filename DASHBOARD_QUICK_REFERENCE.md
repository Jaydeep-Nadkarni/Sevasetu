# Dashboard Components - Quick Reference

## UI Components

### Button
```jsx
import { Button } from '@/components/UI'

<Button variant="primary" size="md" onClick={handleClick}>
  Click me
</Button>

// Variants: primary, secondary, danger, outline, ghost
// Sizes: sm, md, lg
// Props: isLoading, disabled, type
```

### Card
```jsx
import { Card } from '@/components/UI'

<Card header="Card Title" hoverable>
  <p>Card content goes here</p>
</Card>

// Props: header (string|JSX), footer (string|JSX), hoverable, className
```

### Input
```jsx
import { Input } from '@/components/UI'

<Input
  label="Email"
  type="email"
  value={value}
  onChange={handleChange}
  error={error}
  required
/>

// Props: label, error, type, placeholder, disabled, required
```

### Modal
```jsx
import { Modal } from '@/components/UI'

<Modal 
  isOpen={isOpen} 
  onClose={handleClose} 
  title="Modal Title"
  size="md"
  footer={<Button>Save</Button>}
>
  <p>Modal content</p>
</Modal>

// Sizes: sm, md, lg, xl, 2xl
// Props: closeButton, footer
```

### Navbar
```jsx
import { Navbar } from '@/components/UI'

<Navbar />

// No props needed, uses useAuth and useTheme hooks
```

## Hooks

### useTheme
```jsx
import { useTheme } from '@/context/ThemeContext'

function MyComponent() {
  const { isDark, toggleTheme } = useTheme()
  return (
    <div className={isDark ? 'bg-gray-900' : 'bg-white'}>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  )
}
```

### useAuth
```jsx
import { useAuth } from '@/hooks/useAuth'

function MyComponent() {
  const { user, login, logout, isAuthenticated, isLoading, error } = useAuth()
  return <div>{user?.firstName}</div>
}
```

## Layout Components

### Sidebar
```jsx
import { Sidebar } from '@/components/Sidebar'

function Page() {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex">
      <Sidebar isOpen={open} onClose={() => setOpen(false)} />
      <main>{/* content */}</main>
    </div>
  )
}
```

### DashboardLayout
```jsx
import { DashboardLayout } from '@/components/DashboardLayout'

<DashboardLayout>
  <Dashboard />
</DashboardLayout>
```

## Tailwind Dark Mode Classes

```jsx
// Text colors
<div className="text-gray-900 dark:text-gray-100">Text</div>

// Background colors
<div className="bg-white dark:bg-gray-900">Background</div>

// Borders
<div className="border border-gray-200 dark:border-gray-700">Border</div>

// Hover states
<button className="hover:bg-gray-100 dark:hover:bg-gray-800">Hover</button>
```

## Animation Patterns

### Framer Motion Stagger
```jsx
import { motion } from 'framer-motion'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

<motion.div variants={containerVariants} initial="hidden" animate="visible">
  {/* children will animate in sequence */}
</motion.div>
```

### Framer Motion Item
```jsx
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

<motion.div variants={itemVariants}>Item</motion.div>
```

### Hover Animation
```jsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Click me
</motion.button>
```

## Form Patterns

### Controlled Input
```jsx
const [formData, setFormData] = useState({ name: '' })
const [errors, setErrors] = useState({})

const handleChange = (e) => {
  const { name, value } = e.target
  setFormData(prev => ({ ...prev, [name]: value }))
  if (errors[name]) {
    setErrors(prev => ({ ...prev, [name]: '' }))
  }
}

const handleSubmit = async (e) => {
  e.preventDefault()
  const newErrors = {}
  if (!formData.name) newErrors.name = 'Required'
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors)
    return
  }
  // Submit
}

<Input 
  name="name" 
  value={formData.name} 
  onChange={handleChange}
  error={errors.name}
/>
```

## Responsive Grid
```jsx
// 1 col on mobile, 2 on tablet, 3 on desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card>Content 1</Card>
  <Card>Content 2</Card>
  <Card>Content 3</Card>
</div>

// Breakpoints:
// sm: 640px
// md: 768px
// lg: 1024px
// xl: 1280px
// 2xl: 1536px
```

## Common Patterns

### Editable Section
```jsx
const [isEditing, setIsEditing] = useState(false)

<div>
  <button onClick={() => setIsEditing(!isEditing)}>
    {isEditing ? 'Cancel' : 'Edit'}
  </button>
  {isEditing ? (
    <form>
      <Input />
      <Button onClick={handleSave}>Save</Button>
    </form>
  ) : (
    <p>Display content</p>
  )}
</div>
```

### Modal Management
```jsx
const [isOpen, setIsOpen] = useState(false)

<>
  <Button onClick={() => setIsOpen(true)}>Open</Button>
  <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Title">
    Content
  </Modal>
</>
```

### Loading State
```jsx
const [isLoading, setIsLoading] = useState(false)

const handleSubmit = async () => {
  setIsLoading(true)
  try {
    await api.post('/endpoint', data)
  } finally {
    setIsLoading(false)
  }
}

<Button isLoading={isLoading}>
  {isLoading ? 'Saving...' : 'Save'}
</Button>
```

## Color Palette

| Name | Light | Dark |
|------|-------|------|
| Primary | #1f2937 | #3b82f6 |
| Secondary | #10b981 | #34d399 |
| Danger | #ef4444 | #f87171 |
| Success | #10b981 | #34d399 |
| Warning | #f59e0b | #fbbf24 |
| Info | #3b82f6 | #60a5fa |
| Background | #f9fafb | #111827 |
| Card Bg | #ffffff | #1f2937 |
| Text | #111827 | #f3f4f6 |
| Secondary Text | #6b7280 | #9ca3af |
| Border | #e5e7eb | #374151 |

## File Naming Conventions

- **Components**: PascalCase (`Button.jsx`, `Modal.jsx`)
- **Pages**: PascalCase (`Dashboard.jsx`, `Profile.jsx`)
- **Hooks**: camelCase with 'use' prefix (`useAuth.js`, `useTheme.js`)
- **Context**: PascalCase (`ThemeContext.jsx`)
- **Utils**: camelCase (`validators.js`, `auth.js`)
- **Directories**: lowercase (`components/`, `pages/`, `hooks/`)

## Import Paths

```jsx
// From UI components
import { Button, Card } from '@/components/UI'

// From context
import { useTheme } from '@/context/ThemeContext'

// From hooks
import { useAuth } from '@/hooks/useAuth'

// From pages
import { Dashboard } from '@/pages/User/Dashboard'
```

## Debugging Tips

1. **Theme Issues**: Check localStorage for 'theme-mode' key
2. **Dark Mode Classes**: Verify Tailwind config has `darkMode: 'class'`
3. **Animation Issues**: Check if Framer Motion is imported
4. **Routing Issues**: Verify routes are in correct order in App.jsx
5. **Style Issues**: Use browser DevTools to inspect classes
6. **Component Props**: Check PropTypes or TypeScript definitions

## Performance Tips

1. Use `memo()` for expensive components
2. Use `useMemo()` for expensive calculations
3. Lazy load pages with `React.lazy()` and `Suspense`
4. Optimize animations with `reduceMotion` query
5. Use CSS variables for theme colors instead of inline styles
