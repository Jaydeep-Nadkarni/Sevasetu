import mongoose from 'mongoose'
import config from './config.js'

export const connectDB = async () => {
  try {
    if (!config.mongoUri) {
      console.warn('MONGODB_URI is not defined in environment variables')
      return null
    }

    const conn = await mongoose.connect(config.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      minPoolSize: 5,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
      retryWrites: true,
    })

    console.log(`✅ MongoDB connected: ${conn.connection.host}`)
    console.log(`📊 Database: ${conn.connection.name}`)

    return conn
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`)
    console.warn('⚠️ Server will continue running without database connection')
    return null
  }
}

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected to MongoDB')
})

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected from MongoDB')
})

mongoose.connection.on('error', (error) => {
  console.error('❌ Mongoose connection error:', error.message)
})

export default connectDB
