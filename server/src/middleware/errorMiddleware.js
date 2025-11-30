import config from '../config/config.js'
import logger from '../utils/logger.js'

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`
  return { message, statusCode: 400 }
}

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0]
  const message = `Duplicate field value: ${value}. Please use another value!`
  return { message, statusCode: 400 }
}

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message)
  const message = `Invalid input data. ${errors.join('. ')}`
  return { message, statusCode: 400 }
}

const handleJWTError = () => ({
  message: 'Invalid token. Please log in again!',
  statusCode: 401,
})

const handleJWTExpiredError = () => ({
  message: 'Your token has expired! Please log in again.',
  statusCode: 401,
})

const sendErrorDev = (err, res) => {
  logger.error(err)
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  })
}

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    })
  } else {
    // Programming or other unknown error: don't leak error details
    logger.error('ERROR 💥', err)
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    })
  }
}

export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500
  err.status = err.status || 'error'

  if (config.nodeEnv === 'development') {
    sendErrorDev(err, res)
  } else {
    let error = { ...err }
    error.message = err.message

    if (err.name === 'CastError') {
      const { message, statusCode } = handleCastErrorDB(error)
      error.message = message
      error.statusCode = statusCode
      error.isOperational = true
    }
    if (err.code === 11000) {
      const { message, statusCode } = handleDuplicateFieldsDB(error)
      error.message = message
      error.statusCode = statusCode
      error.isOperational = true
    }
    if (err.name === 'ValidationError') {
      const { message, statusCode } = handleValidationErrorDB(error)
      error.message = message
      error.statusCode = statusCode
      error.isOperational = true
    }
    if (err.name === 'JsonWebTokenError') {
      const { message, statusCode } = handleJWTError()
      error.message = message
      error.statusCode = statusCode
      error.isOperational = true
    }
    if (err.name === 'TokenExpiredError') {
      const { message, statusCode } = handleJWTExpiredError()
      error.message = message
      error.statusCode = statusCode
      error.isOperational = true
    }

    sendErrorProd(error, res)
  }
}
