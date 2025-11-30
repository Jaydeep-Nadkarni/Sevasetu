import React, { useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { Sidebar } from '../../components/Sidebar'
import { Card } from '../../components/UI/Card'
import { Button } from '../../components/UI/Button'

export const NGOSettings = () => {
  const { isDark } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className={`flex h-screen ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="md:hidden p-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
        </div>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Settings</h1>

            <div className="space-y-6">
              <Card header="Account Settings">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm opacity-70">Receive updates about donations and events</p>
                    </div>
                    <input type="checkbox" defaultChecked className="toggle" />
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm opacity-70">Add an extra layer of security</p>
                    </div>
                    <Button variant="outline" size="sm">Enable</Button>
                  </div>
                </div>
              </Card>

              <Card header="Organization Settings">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Public Profile Visibility</p>
                      <p className="text-sm opacity-70">Allow users to find your NGO</p>
                    </div>
                    <input type="checkbox" defaultChecked className="toggle" />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default NGOSettings
