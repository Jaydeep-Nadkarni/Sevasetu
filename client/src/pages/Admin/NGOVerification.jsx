import React, { useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { Sidebar } from '../../components/Sidebar'
import { Card } from '../../components/UI/Card'
import { Button } from '../../components/UI/Button'

export const NGOVerification = () => {
  const { isDark } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedNGO, setSelectedNGO] = useState(null)

  // Mock Data
  const pendingNGOs = [
    {
      id: 1,
      name: 'Helping Hands',
      email: 'contact@helpinghands.org',
      registrationNumber: 'NGO-12345',
      description: 'Dedicated to helping the homeless.',
      documents: ['Registration Cert', 'Tax Doc'],
      status: 'pending'
    },
    {
      id: 2,
      name: 'Green Earth',
      email: 'info@greenearth.org',
      registrationNumber: 'NGO-67890',
      description: 'Planting trees for a better future.',
      documents: ['Registration Cert'],
      status: 'pending'
    }
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
            <h1 className="text-3xl font-bold mb-8">NGO Verification</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* List */}
              <div className="lg:col-span-1 space-y-4">
                {pendingNGOs.map(ngo => (
                  <div 
                    key={ngo.id}
                    onClick={() => setSelectedNGO(ngo)}
                    className={`p-4 rounded-lg cursor-pointer border transition ${
                      selectedNGO?.id === ngo.id 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <h3 className="font-bold">{ngo.name}</h3>
                    <p className="text-sm opacity-70">{ngo.registrationNumber}</p>
                    <span className="inline-block mt-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                      Pending Review
                    </span>
                  </div>
                ))}
              </div>

              {/* Detail View */}
              <div className="lg:col-span-2">
                {selectedNGO ? (
                  <Card>
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-bold mb-2">{selectedNGO.name}</h2>
                        <p className="opacity-70">{selectedNGO.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold opacity-50 uppercase">Registration No.</label>
                          <p>{selectedNGO.registrationNumber}</p>
                        </div>
                        <div>
                          <label className="text-xs font-bold opacity-50 uppercase">Email</label>
                          <p>{selectedNGO.email}</p>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-bold mb-2">Documents</h3>
                        <div className="flex gap-2">
                          {selectedNGO.documents.map((doc, i) => (
                            <div key={i} className="p-3 bg-gray-100 dark:bg-gray-800 rounded flex items-center gap-2">
                              📄 <span>{doc}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-6 border-t border-gray-200 dark:border-gray-700 flex gap-4">
                        <Button variant="primary" className="flex-1 bg-green-600 hover:bg-green-700">
                          Approve NGO
                        </Button>
                        <Button variant="danger" className="flex-1">
                          Reject Application
                        </Button>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <div className="h-full flex items-center justify-center opacity-50">
                    <p>Select an NGO to review details</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default NGOVerification
