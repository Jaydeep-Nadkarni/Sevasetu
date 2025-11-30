// Common validation utilities
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password) => {
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters long' }
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' }
  }
  if (!/[a-zA-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one letter' }
  }
  return { valid: true, message: '' }
}

export const validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/
  return phoneRegex.test(phone.replace(/\D/g, ''))
}

export const validateUrl = (url) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export const validateRequired = (value) => {
  return value && value.trim().length > 0
}

export const validatePasswordMatch = (password, confirmPassword) => {
  return password === confirmPassword
}

export const validateNGORegistration = (ngoData) => {
  const errors = {}

  if (!ngoData.name || !ngoData.name.trim()) {
    errors.name = 'NGO name is required'
  } else if (ngoData.name.length > 100) {
    errors.name = 'NGO name must not exceed 100 characters'
  }

  if (!ngoData.description || !ngoData.description.trim()) {
    errors.description = 'Description is required'
  } else if (ngoData.description.length > 2000) {
    errors.description = 'Description must not exceed 2000 characters'
  }

  if (!ngoData.mission || !ngoData.mission.trim()) {
    errors.mission = 'Mission is required'
  } else if (ngoData.mission.length > 1000) {
    errors.mission = 'Mission must not exceed 1000 characters'
  }

  if (!ngoData.category) {
    errors.category = 'Category is required'
  }

  if (!ngoData.location.address || !ngoData.location.address.trim()) {
    errors['location.address'] = 'Address is required'
  }

  if (!ngoData.location.city || !ngoData.location.city.trim()) {
    errors['location.city'] = 'City is required'
  }

  if (!ngoData.location.state || !ngoData.location.state.trim()) {
    errors['location.state'] = 'State is required'
  }

  if (!ngoData.contact.email || !validateEmail(ngoData.contact.email)) {
    errors['contact.email'] = 'Valid contact email is required'
  }

  if (!ngoData.contact.phone || !validatePhone(ngoData.contact.phone)) {
    errors['contact.phone'] = 'Valid 10-digit phone number is required'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

