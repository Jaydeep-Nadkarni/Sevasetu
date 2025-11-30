import { useState } from 'react'
import { useTheme } from '../../../context/ThemeContext'
import { Sidebar } from '../../../components/Sidebar'
import { Card } from '../../../components/UI/Card'
import { Button } from '../../../components/UI/Button'
import { motion } from 'framer-motion'

export const Donations = () => {
  const { isDark } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const donations = [
    { id: 1, ngo: 'Education NGO', amount: '₹500', date: '2025-11-20', status: 'Completed' },
    { id: 2, ngo: 'Healthcare Initiative', amount: '₹1000', date: '2025-11-15', status: 'Completed' },
    { id: 3, ngo: 'Environment First', amount: '₹250', date: '2025-11-10', status: 'Completed' },
  ]

  return (
    <div className={`flex h-screen ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="md:hidden p-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}
          >
            ☰
          </button>
        </div>

        <main className="flex-1 overflow-y-auto">
          <motion.div
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold">My Donations</h1>
              <Button variant="primary">Make a Donation</Button>
            </div>

            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={isDark ? 'border-b border-gray-700' : 'border-b border-gray-200'}>
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold">NGO</th>
                      <th className="text-left py-3 px-4 font-semibold">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold">Date</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donations.map((donation) => (
                      <tr
                        key={donation.id}
                        className={isDark ? 'border-b border-gray-700 hover:bg-gray-800' : 'border-b border-gray-200 hover:bg-gray-100'}
                      >
                        <td className="py-3 px-4">{donation.ngo}</td>
                        <td className="py-3 px-4 font-semibold text-primary">{donation.amount}</td>
                        <td className="py-3 px-4">{donation.date}</td>
                        <td className="py-3 px-4">
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            {donation.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
