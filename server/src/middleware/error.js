export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500
  const message = err.message || 'Internal Server Error'

  console.error(`[${new Date().toISOString()}] ${status} - ${message}`)

  res.status(status).json({
    success: false,
    message,
    status,
    ...(process.env.NODE_ENV === 'development' && { error: err.stack }),
  })
}

export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    status: 404,
  })
}
