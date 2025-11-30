import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../utils/api.js'
import { setTokens, removeTokens } from '../utils/auth.js'

// Async Thunks
export const loginUser = createAsyncThunk('auth/loginUser', async (credentials, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/login', credentials)
    const { user, accessToken, refreshToken } = response.data.data
    setTokens(accessToken, refreshToken)
    return { user, accessToken, refreshToken }
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Login failed')
  }
})

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register/user', userData)
      const { user, accessToken, refreshToken } = response.data.data
      setTokens(accessToken, refreshToken)
      return { user, accessToken, refreshToken }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed')
    }
  }
)

export const registerNGO = createAsyncThunk('auth/registerNGO', async (ngoData, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/register/ngo', ngoData)
    const { user, ngo, accessToken, refreshToken } = response.data.data
    setTokens(accessToken, refreshToken)
    return { user, ngo, accessToken, refreshToken }
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'NGO registration failed')
  }
})

export const verifyToken = createAsyncThunk('auth/verifyToken', async (_, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/verify-token', {})
    return response.data.data.user
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Token verification failed')
  }
})

export const refreshAccessToken = createAsyncThunk(
  'auth/refreshAccessToken',
  async (refreshToken, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/refresh-token', { refreshToken })
      const newAccessToken = response.data.data.accessToken
      localStorage.setItem('token', newAccessToken)
      return newAccessToken
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Token refresh failed')
    }
  }
)

export const logoutUser = createAsyncThunk('auth/logoutUser', async (_, { rejectWithValue }) => {
  try {
    await api.post('/auth/logout', {})
    removeTokens()
    return null
  } catch (error) {
    // Remove tokens even if logout request fails
    removeTokens()
    return rejectWithValue(error.response?.data?.message || 'Logout failed')
  }
})

export const getCurrentUser = createAsyncThunk('auth/getCurrentUser', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/auth/me')
    return response.data.data.user
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch user')
  }
})

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,
}

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setUser: (state, action) => {
      state.user = action.payload
      state.isAuthenticated = true
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.accessToken
        state.refreshToken = action.payload.refreshToken
        state.isAuthenticated = true
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.isAuthenticated = false
      })

    // Register User
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.accessToken
        state.refreshToken = action.payload.refreshToken
        state.isAuthenticated = true
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.isAuthenticated = false
      })

    // Register NGO
    builder
      .addCase(registerNGO.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(registerNGO.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.accessToken
        state.refreshToken = action.payload.refreshToken
        state.isAuthenticated = true
      })
      .addCase(registerNGO.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.isAuthenticated = false
      })

    // Verify Token
    builder
      .addCase(verifyToken.pending, (state) => {
        state.isLoading = true
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.isAuthenticated = true
      })
      .addCase(verifyToken.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.isAuthenticated = false
        removeTokens()
      })

    // Refresh Token
    builder
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.token = action.payload
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        state.isAuthenticated = false
        removeTokens()
      })

    // Logout
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.refreshToken = null
        state.isAuthenticated = false
        state.error = null
      })

    // Get Current User
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.isAuthenticated = true
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.isLoading = false
        state.isAuthenticated = false
        removeTokens()
      })
  },
})

export const { clearError, setUser } = authSlice.actions
export default authSlice.reducer
