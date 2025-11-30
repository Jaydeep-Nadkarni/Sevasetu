import React, { useState, useCallback, useRef, useEffect } from 'react'
import { GoogleMap, useJsApiLoader, Marker, StandaloneSearchBox } from '@react-google-maps/api'
import { MapPin, Search, Navigation } from 'lucide-react'
import { toast } from 'react-hot-toast'

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.5rem'
}

const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629
}

const libraries = ['places']

export const LocationPicker = ({ onLocationSelect, height = '300px' }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries
  })

  const [map, setMap] = useState(null)
  const [marker, setMarker] = useState(null)
  const [searchBox, setSearchBox] = useState(null)
  const [center, setCenter] = useState(defaultCenter)

  // Initialize marker from value prop
  useEffect(() => {
    if (value && value.lat && value.lng) {
      const pos = { lat: parseFloat(value.lat), lng: parseFloat(value.lng) }
      setMarker(pos)
      setCenter(pos)
    }
  }, [value])

  const onLoad = useCallback(function callback(map) {
    setMap(map)
  }, [])

  const onUnmount = useCallback(function callback(map) {
    setMap(null)
  }, [])

  const onMapClick = useCallback((e) => {
    const lat = e.latLng.lat()
    const lng = e.latLng.lng()
    const pos = { lat, lng }
    setMarker(pos)
    
    // Reverse geocode
    const geocoder = new window.google.maps.Geocoder()
    geocoder.geocode({ location: pos }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const addressComponents = results[0].address_components
        const getComponent = (type) => addressComponents.find(c => c.types.includes(type))?.long_name || ''
        
        const locationData = {
          lat,
          lng,
          address: results[0].formatted_address,
          city: getComponent('locality') || getComponent('administrative_area_level_2'),
          state: getComponent('administrative_area_level_1'),
          country: getComponent('country'),
          zipcode: getComponent('postal_code')
        }
        onLocationSelect(locationData)
      } else {
        // Fallback if geocoding fails
        onLocationSelect({ lat, lng, address: '', city: '', state: '' })
      }
    })
  }, [onLocationSelect])

  const onSearchLoad = (ref) => {
    setSearchBox(ref)
  }

  const onPlacesChanged = () => {
    const places = searchBox.getPlaces()
    if (places.length === 0) return

    const place = places[0]
    if (!place.geometry || !place.geometry.location) return

    const lat = place.geometry.location.lat()
    const lng = place.geometry.location.lng()
    const pos = { lat, lng }

    setCenter(pos)
    setMarker(pos)
    
    // Extract address components from place result directly if available
    const addressComponents = place.address_components
    if (addressComponents) {
        const getComponent = (type) => addressComponents.find(c => c.types.includes(type))?.long_name || ''
        
        const locationData = {
          lat,
          lng,
          address: place.formatted_address,
          city: getComponent('locality') || getComponent('administrative_area_level_2'),
          state: getComponent('administrative_area_level_1'),
          country: getComponent('country'),
          zipcode: getComponent('postal_code')
        }
        onLocationSelect(locationData)
    } else {
        // Fallback to geocoding if components missing (rare for Places API)
        onMapClick({ latLng: { lat: () => lat, lng: () => lng } })
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setCenter(pos)
          setMarker(pos)
          
          // Trigger geocode for current location
          const geocoder = new window.google.maps.Geocoder()
          geocoder.geocode({ location: pos }, (results, status) => {
            if (status === 'OK' && results[0]) {
                const addressComponents = results[0].address_components
                const getComponent = (type) => addressComponents.find(c => c.types.includes(type))?.long_name || ''
                
                const locationData = {
                  lat: pos.lat,
                  lng: pos.lng,
                  address: results[0].formatted_address,
                  city: getComponent('locality') || getComponent('administrative_area_level_2'),
                  state: getComponent('administrative_area_level_1'),
                  country: getComponent('country'),
                  zipcode: getComponent('postal_code')
                }
                onLocationSelect(locationData)
                toast.success('Location found')
            }
          })
        },
        () => {
          toast.error('Error getting location')
        }
      )
    } else {
      toast.error('Geolocation not supported')
    }
  }

  if (!isLoaded) {
    return <div className="w-full h-full bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">Loading Map...</div>
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <StandaloneSearchBox
          onLoad={onSearchLoad}
          onPlacesChanged={onPlacesChanged}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
            <input
              type="text"
              placeholder="Search for a location..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </StandaloneSearchBox>
        <button
          type="button"
          onClick={getCurrentLocation}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-indigo-600 hover:text-indigo-800 p-1"
          title="Use current location"
        >
          <Navigation className="w-5 h-5" />
        </button>
      </div>

      <div style={{ height }} className="w-full relative rounded-lg overflow-hidden border border-gray-300">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={12}
          onLoad={onLoad}
          onUnmount={onUnmount}
          onClick={onMapClick}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
          }}
        >
          {marker && (
            <Marker
              position={marker}
              draggable={true}
              onDragEnd={onMapClick}
            />
          )}
        </GoogleMap>
        
        {!marker && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-white/90 px-3 py-1 rounded-full text-xs font-medium shadow-sm pointer-events-none">
            Click map to set location
          </div>
        )}
      </div>
      
      {marker && (
        <div className="text-xs text-gray-500 flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          Selected: {marker.lat.toFixed(6)}, {marker.lng.toFixed(6)}
        </div>
      )}
    </div>
  )
}
