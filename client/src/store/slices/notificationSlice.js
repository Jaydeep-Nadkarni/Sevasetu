import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  notification: null,
}

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    showNotification: (state, action) => {
      state.notification = {
        message: action.payload.message,
        type: action.payload.type || 'info',
        id: Date.now(),
      }
    },
    clearNotification: (state) => {
      state.notification = null
    },
  },
})

export const { showNotification, clearNotification } = notificationSlice.actions
export default notificationSlice.reducer
