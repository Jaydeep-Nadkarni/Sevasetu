import React, { useState, useEffect } from 'react'
import QrScanner from 'react-qr-scanner'
import { useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import { QrCode, CheckCircle, XCircle, History, Award, User } from 'lucide-react'
import api from '../../utils/api'

const QRScanner = () => {
  const [activeTab, setActiveTab] = useState('scan')
  const [scanResult, setScanResult] = useState(null)
  const [scanning, setScanning] = useState(true)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  const [lastScanned, setLastScanned] = useState(null)
  const [error, setError] = useState(null)

  const { user } = useSelector(state => state.auth)

  // Fetch history when tab changes
  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory()
    }
  }, [activeTab])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/attendance/history?type=organizer')
      setHistory(data.history)
    } catch (err) {
      console.error('Error fetching history:', err)
      toast.error('Failed to load attendance history')
    } finally {
      setLoading(false)
    }
  }

  const handleScan = async (data) => {
    if (data && scanning) {
      setScanning(false) // Stop scanning immediately
      
      try {
        // Parse QR data to get event ID if possible, or just send the whole string
        // Format: event_{id}_user_{id}_{timestamp}
        const qrText = data.text
        
        // Extract event ID from QR string if it matches format
        let eventId = null
        if (qrText.startsWith('event_')) {
          const parts = qrText.split('_')
          if (parts.length >= 2) {
            eventId = parts[1]
          }
        }

        if (!eventId) {
          setError('Invalid QR Code Format')
          setScanning(false)
          return
        }

        setLoading(true)
        const response = await api.post('/attendance/mark', {
          qrData: qrText,
          eventId
        })

        setLastScanned(response.data)
        
        if (response.data.alreadyScanned) {
          toast('Already checked in!', { icon: '⚠️' })
        } else {
          toast.success('Attendance Marked!')
          if (response.data.levelUp) {
            toast.success(`User Leveled Up to Level ${response.data.newLevel}! 🌟`)
          }
        }
        
        // Play success sound (optional)
        const audio = new Audio('/success.mp3') // You'd need this file
        audio.play().catch(e => {}) // Ignore error if file missing

      } catch (err) {
        console.error('Scan error:', err)
        setError(err.response?.data?.message || 'Failed to mark attendance')
        toast.error(err.response?.data?.message || 'Scan failed')
      } finally {
        setLoading(false)
        // Delay before allowing next scan to prevent double triggers
        setTimeout(() => {
          // Don't auto-restart scanning, let user click "Scan Next"
        }, 1000)
      }
    }
  }

  const handleError = (err) => {
    console.error(err)
    // toast.error('Camera error')
  }

  const resetScan = () => {
    setScanResult(null)
    setLastScanned(null)
    setError(null)
    setScanning(true)
  }

  const previewStyle = {
    height: 300,
    width: '100%',
    objectFit: 'cover',
    borderRadius: '0.5rem',
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden min-h-[600px]">
        {/* Header */}
        <div className="bg-indigo-600 p-6 text-white">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <QrCode className="w-8 h-8" />
            Event Attendance Scanner
          </h1>
          <p className="text-indigo-100 mt-2">
            Scan attendee QR codes to mark attendance and award points.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('scan')}
            className={`flex-1 py-4 text-center font-medium transition-colors ${
              activeTab === 'scan'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Scanner
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-4 text-center font-medium transition-colors ${
              activeTab === 'history'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            History
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'scan' ? (
            <div className="flex flex-col items-center max-w-md mx-auto">
              
              {/* Scanner View */}
              {scanning && !lastScanned && !error ? (
                <div className="w-full bg-black rounded-lg overflow-hidden relative">
                  <QrScanner
                    delay={300}
                    style={previewStyle}
                    onError={handleError}
                    onScan={handleScan}
                    constraints={{
                      video: { facingMode: 'environment' }
                    }}
                  />
                  <div className="absolute inset-0 border-2 border-indigo-500 opacity-50 pointer-events-none animate-pulse"></div>
                  <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm bg-black/50 py-2">
                    Point camera at QR code
                  </div>
                </div>
              ) : (
                <div className="w-full bg-gray-100 rounded-lg h-[300px] flex flex-col items-center justify-center p-6 text-center">
                  {lastScanned ? (
                    <div className="animate-in fade-in zoom-in duration-300">
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-900">
                        {lastScanned.alreadyScanned ? 'Already Checked In' : 'Attendance Marked!'}
                      </h3>
                      <div className="mt-4 bg-white p-4 rounded-lg shadow-sm w-full">
                        <div className="flex items-center gap-3 mb-3">
                          <img 
                            src={lastScanned.participant?.profilePicture || `https://ui-avatars.com/api/?name=${lastScanned.participant?.name}`} 
                            alt="User" 
                            className="w-12 h-12 rounded-full"
                          />
                          <div className="text-left">
                            <p className="font-bold text-gray-900">{lastScanned.participant?.name}</p>
                            <p className="text-sm text-gray-500">{lastScanned.participant?.email}</p>
                          </div>
                        </div>
                        
                        {!lastScanned.alreadyScanned && (
                          <div className="flex items-center justify-between text-sm bg-indigo-50 p-2 rounded text-indigo-700">
                            <span className="flex items-center gap-1">
                              <Award className="w-4 h-4" />
                              +{lastScanned.pointsEarned} Points
                            </span>
                            {lastScanned.levelUp && (
                              <span className="font-bold text-orange-600">
                                LEVEL UP! ⬆️ {lastScanned.newLevel}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : error ? (
                    <div className="text-center">
                      <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-900">Scan Failed</h3>
                      <p className="text-red-600 mt-2">{error}</p>
                    </div>
                  ) : (
                    <p>Camera inactive</p>
                  )}
                  
                  <button
                    onClick={resetScan}
                    className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                  >
                    <QrCode className="w-4 h-4" />
                    Scan Next
                  </button>
                </div>
              )}

              <div className="mt-8 text-center text-gray-500 text-sm">
                <p>Ensure good lighting and hold the code steady.</p>
              </div>

            </div>
          ) : (
            // History Tab
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-10">Loading history...</div>
              ) : history.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No attendance records found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b text-gray-500 text-sm">
                        <th className="py-3 px-2">Participant</th>
                        <th className="py-3 px-2">Event</th>
                        <th className="py-3 px-2">Time</th>
                        <th className="py-3 px-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((record) => (
                        <tr key={record._id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                                {record.participant?.avatar ? (
                                  <img src={record.participant.avatar} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <User className="w-full h-full p-1 text-gray-400" />
                                )}
                              </div>
                              <span className="font-medium text-sm">{record.participant?.name || 'Unknown'}</span>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-sm">
                            {record.event?.title || 'Unknown Event'}
                          </td>
                          <td className="py-3 px-2 text-sm text-gray-500">
                            {new Date(record.checkInTime).toLocaleString()}
                          </td>
                          <td className="py-3 px-2">
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              Verified
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default QRScanner
