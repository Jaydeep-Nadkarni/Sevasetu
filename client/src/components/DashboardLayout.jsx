import { useState } from 'react'
import { Navbar } from './UI/Navbar'
import { Sidebar } from './Sidebar'
import { useAuth } from '../hooks/useAuth'

export const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()

  // Only show sidebar for authenticated users with appropriate roles
  const showSidebar = user && ['user', 'ngo_admin', 'admin'].includes(user.role)

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      {showSidebar && (
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
           {children}
        </main>
      </div>
    </div>
  )
}
