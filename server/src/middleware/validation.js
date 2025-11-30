export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body)

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details.map((d) => d.message),
      })
    }

    req.validatedData = value
    next()
  }
}
