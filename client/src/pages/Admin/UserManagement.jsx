import React, { useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { Sidebar } from '../../components/Sidebar'
import { Card } from '../../components/UI/Card'
import { Button } from '../../components/UI/Button'

export const UserManagement = () => {
  const { isDark } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Mock Data
  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'ngo_admin', status: 'active' },
    { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'user', status: 'suspended' },
  ]

  return (
    <div className={`flex h-screen ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="md:hidden p-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
        </div>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">User Management</h1>

            <Card className="mb-8">
              <div className="flex gap-4">
                <input 
                  type="text" 
                  placeholder="Search users..." 
                  className={`flex-1 p-2 rounded border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="primary">Search</Button>
              </div>
            </Card>

            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="p-4">Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="p-4 font-medium">{user.name}</td>
                        <td className="p-4 opacity-70">{user.email}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            user.role === 'ngo_admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button className="text-blue-500 hover:underline text-sm">Edit</button>
                            <button className="text-red-500 hover:underline text-sm">Suspend</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

export default UserManagement
