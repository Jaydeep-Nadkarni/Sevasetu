import React, { useState, useCallback, useMemo } from 'react'
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api'
import { Link } from 'react-router-dom'
import { MapPin, Calendar, Users, AlertCircle } from 'lucide-react'

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.75rem'
}

const defaultCenter = {
  lat: 20.5937, // India center
  lng: 78.9629
}

const libraries = ['places']

export const MapView = ({ items = [], center = defaultCenter, zoom = 5, height = '500px' }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries
  })

  const [map, setMap] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)

  const onLoad = useCallback(function callback(map) {
    setMap(map)
  }, [])

  const onUnmount = useCallback(function callback(map) {
    setMap(null)
  }, [])

  // Filter items that have valid coordinates
  const validItems = useMemo(() => {
    return items.filter(item => 
      item.location?.coordinates?.coordinates && 
      item.location.coordinates.coordinates.length === 2
    )
  }, [items])

  const getItemIcon = (type) => {
    // Return different marker colors/icons based on type
    // This is a simplified version, you can use custom SVG icons
    return null // Default red marker
  }

  if (!isLoaded) {
    return <div className="w-full h-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center">Loading Map...</div>
  }

  return (
    <div style={{ height }} className="w-full relative rounded-xl overflow-hidden shadow-sm border border-gray-200">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        }}
      >
        {validItems.map((item) => {
          const [lng, lat] = item.location.coordinates.coordinates
          return (
            <Marker
              key={item._id}
              position={{ lat, lng }}
              onClick={() => setSelectedItem(item)}
              title={item.title || item.name}
            />
          )
        })}

        {selectedItem && (
          <InfoWindow
            position={{
              lat: selectedItem.location.coordinates.coordinates[1],
              lng: selectedItem.location.coordinates.coordinates[0]
            }}
            onCloseClick={() => setSelectedItem(null)}
          >
            <div className="p-2 max-w-xs">
              <h3 className="font-bold text-gray-900 mb-1">{selectedItem.title || selectedItem.name}</h3>
              
              {/* Type Badge */}
              <div className="mb-2">
                {selectedItem.urgency ? (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium uppercase ${
                    selectedItem.urgency === 'critical' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    Help Request
                  </span>
                ) : selectedItem.eventDate ? (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-medium uppercase">
                    Event
                  </span>
                ) : (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-medium uppercase">
                    NGO
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                {selectedItem.description || selectedItem.mission}
              </p>

              <div className="text-xs text-gray-500 mb-3 space-y-1">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {selectedItem.location.city}
                </div>
                {selectedItem.eventDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(selectedItem.eventDate).toLocaleDateString()}
                  </div>
                )}
              </div>

              <Link 
                to={
                  selectedItem.urgency ? `/help-requests/${selectedItem._id}` :
                  selectedItem.eventDate ? `/events/${selectedItem._id}` :
                  `/ngo/${selectedItem._id}` // Assuming NGO detail route
                }
                className="block w-full text-center bg-indigo-600 text-white text-xs py-1.5 rounded hover:bg-indigo-700 transition-colors"
              >
                View Details
              </Link>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  )
}
