import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice.js'

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/loginUser/fulfilled', 'auth/registerUser/fulfilled', 'auth/registerNGO/fulfilled'],
        ignoredPaths: ['auth.user'],
      },
    }),
  devTools: true,
})

export default store
