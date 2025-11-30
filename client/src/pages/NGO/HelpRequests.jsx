import React, { useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { Sidebar } from '../../components/Sidebar'
import HelpRequestManagement from './HelpRequestManagement'

export const NGOHelpRequests = () => {
  const { isDark } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className={`flex h-screen ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="md:hidden p-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
        </div>

        <main className="flex-1 overflow-y-auto">
          <HelpRequestManagement />
        </main>
      </div>
    </div>
  )
}

export default NGOHelpRequests
