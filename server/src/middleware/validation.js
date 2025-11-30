import { body, validationResult } from 'express-validator'

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

export const validateUserRegistration = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .trim()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/[0-9]/, 'g')
    .withMessage('Password must contain at least one number')
    .matches(/[a-zA-Z]/, 'g')
    .withMessage('Password must contain at least one letter'),
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 50 })
    .withMessage('First name must not exceed 50 characters'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 50 })
    .withMessage('Last name must not exceed 50 characters'),
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone number must be 10 digits'),
  body('role')
    .trim()
    .isIn(['user', 'admin'])
    .withMessage('Role must be either user or admin'),
]

export const validateNGORegistration = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .trim()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/[0-9]/, 'g')
    .withMessage('Password must contain at least one number')
    .matches(/[a-zA-Z]/, 'g')
    .withMessage('Password must contain at least one letter'),
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 50 })
    .withMessage('First name must not exceed 50 characters'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 50 })
    .withMessage('Last name must not exceed 50 characters'),
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone number must be 10 digits'),
  body('ngo.name')
    .trim()
    .notEmpty()
    .withMessage('NGO name is required')
    .isLength({ max: 100 })
    .withMessage('NGO name must not exceed 100 characters'),
  body('ngo.description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),
  body('ngo.mission')
    .trim()
    .notEmpty()
    .withMessage('Mission is required')
    .isLength({ max: 1000 })
    .withMessage('Mission must not exceed 1000 characters'),
  body('ngo.category')
    .trim()
    .isIn(['Education', 'Healthcare', 'Environment', 'Animal Welfare', 'Disaster Relief', 'Poverty Alleviation', 'Women Empowerment', 'Other'])
    .withMessage('Invalid category'),
  body('ngo.location.address')
    .trim()
    .notEmpty()
    .withMessage('Address is required'),
  body('ngo.location.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('ngo.location.state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  body('ngo.contact.email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('ngo.contact.phone')
    .trim()
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone number must be 10 digits'),
  body('ngo.registrationNumber')
    .optional({ checkFalsy: true })
    .trim(),
]

export const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required'),
]

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
      })),
    })
  }
  next()
}
