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
    })

    console.log(`MongoDB connected: ${conn.connection.host}`)
    return conn
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`)
    console.warn('Server will continue running without database connection')
    return null
  }
}

export default connectDB
