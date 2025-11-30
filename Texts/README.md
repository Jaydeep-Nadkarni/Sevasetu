# NGO Platform - MERN Stack

A full-stack MERN application for NGO management and operations.

## Project Structure

```
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── context/       # Redux store and context
│   │   ├── utils/         # Utility functions and API calls
│   │   ├── assets/        # Images, fonts, etc.
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   ├── index.html         # HTML template
│   ├── package.json       # Client dependencies
│   ├── vite.config.js     # Vite configuration
│   ├── tailwind.config.js # Tailwind CSS config
│   └── .env.example       # Environment variables template
│
└── server/                 # Node.js + Express backend
    ├── src/
    │   ├── models/        # MongoDB schemas
    │   ├── routes/        # API routes
    │   ├── controllers/   # Route logic
    │   ├── middleware/    # Express middleware
    │   ├── config/        # Configuration files
    │   ├── utils/         # Utility functions
    │   └── index.js       # Server entry point
    ├── package.json       # Server dependencies
    └── .env.example       # Environment variables template
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account or local MongoDB

### Client Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Create `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Update environment variables in `.env` with your API keys

4. Install dependencies:
   ```bash
   npm install
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The client will run on `http://localhost:5173`

### Server Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Create `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Update environment variables in `.env` with your configuration:
   - MongoDB URI
   - JWT Secret
   - API Keys (Cloudinary, Razorpay, Google Maps, Gemini)

4. Install dependencies:
   ```bash
   npm install
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The server will run on `http://localhost:5000`

## Available Scripts

### Client Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier

### Server Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier

## Environment Variables

### Client (.env)

```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_API_KEY=your_key
VITE_RAZORPAY_KEY_ID=your_key
VITE_CLOUDINARY_CLOUD_NAME=your_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset
VITE_GEMINI_API_KEY=your_key
VITE_APP_ENV=development
```

### Server (.env)

```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
GOOGLE_MAPS_API_KEY=your_key
GEMINI_API_KEY=your_key
CORS_ORIGIN=http://localhost:5173
CLIENT_URL=http://localhost:5173
```

## Technologies Used

### Frontend

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Framer Motion** - Animation library
- **Axios** - HTTP client

### Backend

- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **dotenv** - Environment variable management

## Code Style & Linting

### ESLint Rules

- React best practices enforced
- React Hooks rules enabled
- Console warnings for debugging
- Unused variables detection

### Prettier Configuration

- 2-space indentation
- Single quotes for strings
- Trailing commas (ES5 compatible)
- 100-character line width
- Unix line endings (LF)

## API Endpoints

Health check endpoint is available at:
```
GET /api/health
```

Response:
```json
{
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Useful Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Express Documentation](https://expressjs.com)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org)

## Contributing

1. Create a feature branch
2. Make your changes
3. Run `npm run lint:fix` and `npm run format`
4. Commit with meaningful messages
5. Push and create a pull request

## License

MIT License - feel free to use this template for your projects

## Support

For issues or questions, please create an issue in the repository.
