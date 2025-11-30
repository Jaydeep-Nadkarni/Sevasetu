import { useDispatch, useSelector } from 'react-redux'
import {
  loginUser,
  registerUser,
  registerNGO,
  logoutUser,
  clearError,
} from '../store/slices/authSlice.js'

export const useAuth = () => {
  const dispatch = useDispatch()
  const { user, token, refreshToken, isAuthenticated, isLoading, error } = useSelector(
    (state) => state.auth
  )

  return {
    // State
    user,
    token,
    refreshToken,
    isAuthenticated,
    isLoading,
    error,

    // Actions
    login: (credentials) => dispatch(loginUser(credentials)),
    register: (userData) => dispatch(registerUser(userData)),
    registerNGO: (ngoData) => dispatch(registerNGO(ngoData)),
    logout: () => dispatch(logoutUser()),
    clearError: () => dispatch(clearError()),
  }
}
