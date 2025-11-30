import React, { useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { Card } from '../../components/UI/Card'
import { motion } from 'framer-motion'
import CalendarHeatmap from 'react-calendar-heatmap'
import 'react-calendar-heatmap/dist/styles.css'
import { Tooltip } from 'react-tooltip'

const StatCard = ({ icon, label, value, change, isDark }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <Card hoverable className="h-full">
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {label}
          </p>
          <p className="text-3xl font-bold mt-2 text-primary">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {change >= 0 ? '+' : ''}{change}% from last month
            </p>
          )}
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </Card>
  </motion.div>
)

export const AdminDashboard = () => {
  const { isDark } = useTheme()

  // Mock Data
  const stats = [
    { icon: '💰', label: 'Total Donations', value: '₹12,50,000', change: 15 },
    { icon: '🏢', label: 'Registered NGOs', value: '120', change: 5 },
    { icon: '👥', label: 'Total Users', value: '5,430', change: 12 },
    { icon: '🆘', label: 'Help Requests', value: '850', change: 8 },
  ]

  // Heatmap Data (Mock)
  const today = new Date()
  const heatmapData = Array.from({ length: 365 }, (_, i) => {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    return {
      date: date.toISOString().split('T')[0],
      count: Math.floor(Math.random() * 10),
    }
  }).reverse()

  return (
    <div className={`w-full ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <main className="overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} isDark={isDark} />
            ))}
          </div>

          {/* Activity Heatmap */}
          <Card header="Platform Activity (Last 365 Days)" className="mb-8">
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                <CalendarHeatmap
                  startDate={new Date(today.getFullYear(), today.getMonth() - 11, 1)}
                  endDate={today}
                  values={heatmapData}
                  classForValue={(value) => {
                    if (!value) {
                      return 'color-empty'
                      }
                      return `color-scale-${Math.min(value.count, 4)}`
                    }}
                    tooltipDataAttrs={(value) => {
                      return {
                        'data-tooltip-id': 'heatmap-tooltip',
                        'data-tooltip-content': `${value.date}: ${value.count || 0} activities`,
                      }
                    }}
                    showWeekdayLabels
                  />
                  <Tooltip id="heatmap-tooltip" />
                </div>
              </div>
              <style>{`
                .react-calendar-heatmap text {
                  font-size: 10px;
                  fill: ${isDark ? '#aaa' : '#333'};
                }
                .react-calendar-heatmap .color-empty {
                  fill: ${isDark ? '#374151' : '#ebedf0'};
                }
                .react-calendar-heatmap .color-scale-1 { fill: #d6e685; }
                .react-calendar-heatmap .color-scale-2 { fill: #8cc665; }
                .react-calendar-heatmap .color-scale-3 { fill: #44a340; }
                .react-calendar-heatmap .color-scale-4 { fill: #1e6823; }
              `}</style>
            </Card>

            {/* Recent Pending Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card header="Pending NGO Approvals">
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                      <div>
                        <p className="font-medium">Hope Foundation {i}</p>
                        <p className="text-xs opacity-70">Applied 2 days ago</p>
                      </div>
                      <button className="text-blue-500 text-sm font-medium hover:underline">Review</button>
                    </div>
                  ))}
                </div>
              </Card>

              <Card header="Pending Event Approvals">
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                      <div>
                        <p className="font-medium">Community Clean-up {i}</p>
                        <p className="text-xs opacity-70">By John Doe • 1 day ago</p>
                      </div>
                      <button className="text-blue-500 text-sm font-medium hover:underline">Review</button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </main>
    </div>
  )
}

export default AdminDashboard
