import React, { useState, useEffect, useCallback } from 'react'
import { MapView } from '../../components/Map/MapView'
import api from '../../utils/api'
import { toast } from 'react-toastify'

const NearbyMap = () => {
  const [activeTab, setActiveTab] = useState('ngos') // ngos, events, help-requests
  const [radius, setRadius] = useState(10) // km
  const [userLocation, setUserLocation] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.error('Error getting location:', error)
          toast.error('Could not get your location. Using default.')
          // Default to a central location (e.g., Mumbai) or handle gracefully
          setUserLocation({ lat: 19.0760, lng: 72.8777 })
        }
      )
    } else {
      toast.error('Geolocation is not supported by this browser.')
      setUserLocation({ lat: 19.0760, lng: 72.8777 })
    }
  }, [])

  const fetchData = useCallback(async () => {
    if (!userLocation) return

    setLoading(true)
    try {
      let endpoint = ''
      let params = {
        lat: userLocation.lat,
        lng: userLocation.lng,
        radius: radius,
        limit: 50 // Fetch enough items for the map
      }

      if (activeTab === 'ngos') {
        endpoint = '/ngos'
      } else if (activeTab === 'events') {
        endpoint = '/events'
      } else if (activeTab === 'help-requests') {
        endpoint = '/help-requests'
      }

      const response = await api.get(endpoint, { params })
      
      let data = []
      if (activeTab === 'ngos') {
        data = response.data.ngos
      } else if (activeTab === 'events') {
        data = response.data.events
      } else if (activeTab === 'help-requests') {
        data = response.data.helpRequests
      }

      setItems(data)
    } catch (error) {
      console.error('Error fetching map data:', error)
      toast.error('Failed to load map data')
    } finally {
      setLoading(false)
    }
  }, [activeTab, radius, userLocation])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setItems([]) // Clear items while loading new ones
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Controls Header */}
      <div className="bg-white shadow-md p-4 z-10">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => handleTabChange('ngos')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'ngos'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              NGOs
            </button>
            <button
              onClick={() => handleTabChange('events')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'events'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Events
            </button>
            <button
              onClick={() => handleTabChange('help-requests')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'help-requests'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Help Requests
            </button>
          </div>

          {/* Radius Slider */}
          <div className="flex items-center gap-4 w-full md:w-auto">
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Radius: {radius} km
            </span>
            <input
              type="range"
              min="1"
              max="100"
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value))}
              className="w-full md:w-48 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 z-20 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}
        
        {userLocation && (
          <MapView
            items={items}
            type={activeTab === 'help-requests' ? 'helpRequest' : activeTab === 'ngos' ? 'ngo' : 'event'}
            center={userLocation}
            height="100%"
          />
        )}
      </div>
    </div>
  )
}

export default NearbyMap
