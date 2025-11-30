# User Dashboard Implementation - Complete Guide

## Overview
A complete user dashboard system with theme support, reusable UI components, animations, and responsive design for the Sevasetu NGO platform.

## Architecture & Structure

### 1. **Theme System** (`client/src/context/ThemeContext.jsx`)
- **Purpose**: Manage dark/light theme globally using Context API
- **Features**:
  - Persists theme preference in localStorage
  - Respects system preference on first visit
  - Updates document class for Tailwind dark mode
  - `useTheme` hook for easy access in components
- **Usage**:
  ```jsx
  import { useTheme } from './context/ThemeContext'
  
  function MyComponent() {
    const { isDark, toggleTheme } = useTheme()
    return <button onClick={toggleTheme}>{isDark ? '☀️' : '🌙'}</button>
  }
  ```

### 2. **Reusable UI Components** (`client/src/components/UI/`)

#### Button Component (`Button.jsx`)
- **Variants**: primary, secondary, danger, outline, ghost
- **Sizes**: sm, md, lg
- **Props**: 
  - `variant` - button style variant
  - `size` - button size
  - `isLoading` - loading state with spinner
  - `disabled` - disabled state
- **Features**: Smooth transitions, ripple effect on click, dark mode support

#### Card Component (`Card.jsx`)
- **Props**:
  - `header` - card header (string or JSX)
  - `footer` - card footer (string or JSX)
  - `hoverable` - hover shadow effect
- **Features**: 
  - Responsive padding
  - Dark mode styling
  - Border support
  - Optional header/footer dividers

#### Input Component (`Input.jsx`)
- **Props**:
  - `label` - input label
  - `error` - error message
  - `type` - input type (text, email, tel, etc.)
  - `disabled` - disabled state
  - `required` - required indicator
- **Features**:
  - Built-in validation display
  - Dark mode support
  - Focus states with ring
  - Placeholder text

#### Modal Component (`Modal.jsx`)
- **Props**:
  - `isOpen` - modal visibility
  - `onClose` - close handler
  - `title` - modal header
  - `size` - modal size (sm, md, lg, xl, 2xl)
  - `footer` - custom footer content
- **Features**:
  - Framer Motion animations
  - Backdrop click to close
  - Smooth scale & fade transitions
  - Responsive sizing

#### Navbar Component (`Navbar.jsx`)
- **Features**:
  - Sticky header with Sevasetu branding
  - Theme toggle button
  - User dropdown menu
  - Mobile hamburger menu
  - Desktop & mobile responsive views
  - Dashboard link based on user role
  - Logout functionality
  - Links to Login/Register when unauthenticated

### 3. **Navigation Components**

#### Sidebar Component (`client/src/components/Sidebar.jsx`)
- **Features**:
  - Collapsible/expandable navigation
  - Icon-based navigation items
  - Active route highlighting
  - Mobile slide-out menu with backdrop
  - Navigation items:
    - Dashboard (📊)
    - Profile (👤)
    - Donations (❤️)
    - Events (🎉)
    - Certificates (🏆)
    - Help Requests (🤝)
    - Settings (⚙️)
  - Animated transitions with Framer Motion
  - Dark mode styling

#### DashboardLayout Component (`client/src/components/DashboardLayout.jsx`)
- Wrapper component for all dashboard pages
- Includes Navbar at the top
- Provides consistent layout structure

### 4. **User Pages**

#### Dashboard (`client/src/pages/User/Dashboard.jsx`)
- **Sections**:
  1. **Welcome Header**: Personalized greeting with user first name
  2. **Stats Grid**: 4 stat cards showing:
     - Total Donations (₹)
     - Volunteer Hours
     - Events Attended
     - Badges Earned
     - Each with percentage change indicator
  3. **Quick Actions**: 3 action buttons
     - Make a Donation
     - Find Opportunities
     - View Applications
  4. **Recent Activity**: Timeline of recent actions with:
     - Activity type icons
     - Description text
     - Relative time display
  5. **Upcoming Events**: List of 3 upcoming events
  6. **Badges Earned**: Grid of 8 earned badges
- **Features**:
  - Framer Motion staggered animations
  - Responsive grid layout (1 col mobile, 2 col tablet, 4 col desktop)
  - Mobile-first design
  - Dark mode support
  - Sidebar toggle on mobile

#### Profile (`client/src/pages/User/Profile.jsx`)
- **Layout**: 3-column on desktop, 1-column on mobile
- **Left Column**:
  - Profile picture (initials avatar)
  - User name and email
  - Profile picture upload (edit mode)
  - User stats (Badges, Hours)
- **Right Column**:
  - Personal information form (editable)
    - First/Last name
    - Email & Phone
    - City & State
    - Bio (textarea)
  - Form validation with error display
  - Save/Cancel buttons in edit mode
- **Bottom Sections**:
  - Preferences card with toggles
  - Danger zone with account actions
- **Features**:
  - Edit mode toggle
  - Form validation
  - Loading state during save
  - Framer Motion animations
  - Responsive layout
  - Dark mode support

#### Donations (`client/src/pages/User/Donations/Donations.jsx`)
- List of all donations in a responsive table
- Shows NGO name, amount, date, status
- Action button to make new donation
- Responsive table with horizontal scroll on mobile

### 5. **Animations & Transitions**

All pages use Framer Motion for:
- **Page Load**: Staggered animation of elements
- **Card Hover**: Subtle shadow and scale effects
- **Button Click**: Visual feedback with scale transform
- **Modal**: Scale + fade in overlay
- **Navigation**: Smooth slide transitions for sidebar
- **Tab Switches**: Cross-fade transitions

Example animation pattern:
```jsx
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
  {/* Content */}
</motion.div>
```

### 6. **Responsive Design**

All components follow mobile-first approach:

#### Breakpoints:
- **Mobile**: < 768px (md breakpoint)
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px (lg breakpoint)

#### Responsive Features:
- Sidebar: Fixed on desktop, slide-out on mobile
- Navbar: Full on desktop, collapsed menu on mobile
- Grid layouts: 1 column mobile → 2 columns tablet → 4 columns desktop
- Font sizes: Smaller on mobile, larger on desktop
- Spacing: Reduced on mobile, normal on desktop

#### Mobile Optimizations:
- Touch-friendly button sizes (min 44px)
- Hamburger menu instead of full navbar
- Stack layouts vertically on small screens
- Horizontal scroll tables instead of wrapping
- Reduced animation performance on low-end devices

### 7. **Dark Mode Implementation**

Tailwind CSS dark mode is enabled via class strategy:

**Configuration** (`tailwind.config.js`):
```javascript
darkMode: 'class'
```

**Usage**:
- `dark:bg-gray-900` - applies on dark mode
- `dark:text-gray-100` - text color in dark mode
- `dark:border-gray-700` - borders in dark mode
- `dark:hover:bg-gray-800` - hover states in dark mode

**Context Integration**:
```jsx
const { isDark } = useTheme()

<div className={isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}>
```

## File Structure

```
client/src/
├── components/
│   ├── UI/
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx
│   │   ├── Navbar.jsx
│   │   └── index.js
│   ├── Sidebar.jsx
│   ├── DashboardLayout.jsx
│   ├── ProtectedRoute.jsx
│   └── index.js
├── context/
│   └── ThemeContext.jsx
├── pages/
│   ├── Auth/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── Unauthorized.jsx
│   └── User/
│       ├── Dashboard.jsx
│       ├── Profile.jsx
│       └── Donations/
│           └── Donations.jsx
├── hooks/
│   └── useAuth.js
├── store/
│   ├── store.js
│   └── slices/
│       └── authSlice.js
├── utils/
│   ├── api.js
│   ├── auth.js
│   └── validators.js
├── context/
│   └── ThemeContext.jsx
├── App.jsx
└── main.jsx
```

## Key Routes

```javascript
// Public routes
/              - Landing page with Navbar
/login         - Login page
/register      - Register page
/unauthorized  - 403 Forbidden page

// Protected routes (user role)
/dashboard     - User dashboard with sidebar
/profile       - User profile page with edit
/donations     - Donations history
/events        - Events listing
/certificates  - Certificates
/help-requests - Help requests
/settings      - Settings

// Protected routes (ngo_admin role)
/ngo/dashboard - NGO dashboard

// Protected routes (admin role)
/admin/dashboard - Admin dashboard
```

## Styling System

### Tailwind Configuration
- **Primary Color**: #1f2937 (gray-800)
- **Secondary Color**: #10b981 (emerald-500)
- **Dark Background**: #111827 (gray-950)
- **Light Background**: #f9fafb (gray-50)
- **Accent Color**: #f59e0b (amber-500)

### Dark Mode Colors
- **Background**: gray-900 for main, gray-800 for cards
- **Text**: gray-100 for primary, gray-400 for secondary
- **Borders**: gray-700
- **Hover**: gray-800 or gray-700 (one shade darker)

## Performance Optimizations

1. **Component Splitting**: Separate components for reusability
2. **Code Splitting**: Pages loaded on-demand via React Router
3. **Lazy Loading**: useEffect for data fetching
4. **Memoization**: useMemo for expensive calculations
5. **Animation**: Hardware-accelerated transitions
6. **Dark Mode**: Single class toggle, no layout shift

## Best Practices Implemented

1. **Accessibility**:
   - Semantic HTML elements
   - ARIA labels for interactive elements
   - Keyboard navigation support
   - Focus indicators

2. **Performance**:
   - Optimized re-renders
   - Efficient DOM updates
   - Minimal dependencies
   - Lazy component loading

3. **Maintainability**:
   - Reusable components
   - Clear file structure
   - Consistent naming conventions
   - Comprehensive comments

4. **User Experience**:
   - Smooth animations
   - Loading states
   - Error messages
   - Dark mode support
   - Mobile responsiveness

## Usage Examples

### Using Theme in Components
```jsx
import { useTheme } from '../context/ThemeContext'

function MyComponent() {
  const { isDark, toggleTheme } = useTheme()
  
  return (
    <div className={isDark ? 'bg-gray-900' : 'bg-white'}>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  )
}
```

### Using UI Components
```jsx
import { Button, Card, Input, Modal } from '../components/UI'

function MyPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  return (
    <Card header="My Card">
      <Input label="Name" type="text" />
      <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Modal Title">
        <p>Modal content here</p>
      </Modal>
    </Card>
  )
}
```

### Using Sidebar Navigation
```jsx
import { Sidebar } from '../components/Sidebar'

function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  return (
    <div className="flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1">{/* Page content */}</main>
    </div>
  )
}
```

## Next Steps

1. **Implement remaining pages** (Events, Certificates, Help Requests, Settings)
2. **Add API integration** for data fetching
3. **Implement image upload** for profile pictures
4. **Add form submission** for profile updates
5. **Create NGO dashboard** with admin features
6. **Implement admin dashboard** with moderation tools
7. **Add notifications** system
8. **Add search and filtering** functionality
9. **Implement analytics** charts and reports
10. **Add testing** (unit, integration, E2E)

## Technology Stack

- **React 18**: UI library
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **React Router**: Client-side routing
- **Redux Toolkit**: State management
- **Axios**: HTTP client
- **Context API**: Theme management

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Testing Checklist

- [ ] Dark mode toggle works on all pages
- [ ] Sidebar navigation collapses on mobile
- [ ] Forms validate input correctly
- [ ] Profile edit mode works
- [ ] Animations are smooth
- [ ] Responsive layout on all breakpoints
- [ ] Mobile hamburger menu opens/closes
- [ ] User dropdown menu works
- [ ] Protected routes redirect correctly
- [ ] Theme persists on page refresh
