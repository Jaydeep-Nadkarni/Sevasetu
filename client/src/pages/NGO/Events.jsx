import React, { useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { Sidebar } from '../../components/Sidebar'
import { Card } from '../../components/UI/Card'
import { Button } from '../../components/UI/Button'
import { Link } from 'react-router-dom'

export const NGOEvents = () => {
  const { isDark } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Mock Data
  const events = [
    {
      id: 1,
      title: 'Community Clean-up Drive',
      date: '2025-12-10',
      location: 'Central Park',
      attendees: 45,
      status: 'upcoming'
    },
    {
      id: 2,
      title: 'Education Workshop',
      date: '2025-11-25',
      location: 'Community Center',
      attendees: 30,
      status: 'completed'
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
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">Event Management</h1>
              <Link to="/ngo/events/create">
                <Button variant="primary">Create New Event</Button>
              </Link>
            </div>

            <div className="grid gap-6">
              {events.map(event => (
                <Card key={event.id}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold">{event.title}</h3>
                      <p className="text-sm opacity-70">
                        {event.date} • {event.location}
                      </p>
                      <div className="mt-2 flex gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {event.status.toUpperCase()}
                        </span>
                        <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">
                          {event.attendees} Attendees
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">Attendance</Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default NGOEvents
