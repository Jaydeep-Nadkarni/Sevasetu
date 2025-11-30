import React, { useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { Sidebar } from '../../components/Sidebar'
import { Card } from '../../components/UI/Card'
import { Button } from '../../components/UI/Button'
import { Input } from '../../components/UI/Input'

export const NGOProfile = () => {
  const { isDark } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Mock Data
  const [ngoData, setNgoData] = useState({
    name: 'Seva Foundation',
    description: 'Dedicated to providing education and healthcare to underprivileged children.',
    mission: 'To empower every child with education.',
    email: 'contact@sevafoundation.org',
    phone: '9876543210',
    address: '123, NGO Street, Mumbai, Maharashtra',
    verificationStatus: 'verified',
    category: 'Education',
    website: 'https://sevafoundation.org'
  })

  return (
    <div className={`flex h-screen ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="md:hidden p-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
        </div>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold">{ngoData.name}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    ngoData.verificationStatus === 'verified' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {ngoData.verificationStatus.toUpperCase()}
                  </span>
                  <span className="text-sm opacity-70">{ngoData.category}</span>
                </div>
              </div>
              <Button onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left Column - Info */}
              <div className="md:col-span-2 space-y-6">
                <Card header="About Us">
                  {isEditing ? (
                    <textarea 
                      className="w-full p-2 border rounded bg-transparent"
                      rows="4"
                      value={ngoData.description}
                      onChange={(e) => setNgoData({...ngoData, description: e.target.value})}
                    />
                  ) : (
                    <p>{ngoData.description}</p>
                  )}
                </Card>

                <Card header="Mission">
                  {isEditing ? (
                    <textarea 
                      className="w-full p-2 border rounded bg-transparent"
                      rows="3"
                      value={ngoData.mission}
                      onChange={(e) => setNgoData({...ngoData, mission: e.target.value})}
                    />
                  ) : (
                    <p>{ngoData.mission}</p>
                  )}
                </Card>
              </div>

              {/* Right Column - Contact */}
              <div className="space-y-6">
                <Card header="Contact Information">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold opacity-70">Email</label>
                      <p>{ngoData.email}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold opacity-70">Phone</label>
                      <p>{ngoData.phone}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold opacity-70">Website</label>
                      <p className="text-blue-500 truncate">{ngoData.website}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold opacity-70">Address</label>
                      <p>{ngoData.address}</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default NGOProfile
