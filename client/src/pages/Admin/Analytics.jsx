import React, { useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { Sidebar } from '../../components/Sidebar'
import { Card } from '../../components/UI/Card'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts'

export const PlatformAnalytics = () => {
  const { isDark } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Mock Data
  const donationData = [
    { name: 'Jan', amount: 120000 },
    { name: 'Feb', amount: 150000 },
    { name: 'Mar', amount: 180000 },
    { name: 'Apr', amount: 200000 },
    { name: 'May', amount: 250000 },
    { name: 'Jun', amount: 300000 },
  ]

  const categoryData = [
    { name: 'Education', value: 400 },
    { name: 'Health', value: 300 },
    { name: 'Environment', value: 300 },
    { name: 'Food', value: 200 },
  ]

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

  return (
    <div className={`flex h-screen ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="md:hidden p-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
        </div>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">Platform Analytics</h1>
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Export Report (PDF)
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Donation Growth */}
              <Card header="Total Donation Growth">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={donationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Categories */}
              <Card header="Donations by Category">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* Key Metrics Table */}
            <Card header="Key Performance Indicators">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-gray-500 text-sm uppercase font-bold">Food Rescued</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">12,500 kg</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-gray-500 text-sm uppercase font-bold">Volunteer Hours</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">45,000 hrs</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-gray-500 text-sm uppercase font-bold">Events Hosted</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">850+</p>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

export default PlatformAnalytics
