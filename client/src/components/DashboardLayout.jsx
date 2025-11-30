import { useState } from 'react'
import { Navbar } from './UI/Navbar'

export const DashboardLayout = ({ children }) => {
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      {children}
    </div>
  )
}
