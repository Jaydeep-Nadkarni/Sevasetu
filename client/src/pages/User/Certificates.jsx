import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from 'react-query'
import { Award, Download, ExternalLink, Calendar, CheckCircle } from 'lucide-react'
import { useSocket } from '../../context/SocketContext'
import api from '../../utils/api'
import { toast } from 'react-hot-toast'

const Certificates = () => {
  const { socket, invalidateQueries } = useSocket()

  // Fetch certificates with React Query
  const { data: certificates = [], isLoading, refetch } = useQuery(
    ['my-certificates'],
    async () => {
      const { data } = await api.get('/certificates/my-certificates')
      return data.data
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      onError: (error) => {
        console.error('Error fetching certificates:', error)
        toast.error('Failed to load certificates')
      }
    }
  )

  // Socket.IO listeners for real-time updates
  useEffect(() => {
    if (!socket) return

    const handleCertificateEarned = () => {
      invalidateQueries('my-certificates')
      refetch()
    }

    socket.on('certificate:earned', handleCertificateEarned)

    return () => {
      socket.off('certificate:earned', handleCertificateEarned)
    }
  }, [socket, invalidateQueries, refetch])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Certificates</h1>
        <p className="text-gray-600">View and download your earned certificates</p>
      </div>

      {certificates.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No certificates yet</h3>
          <p className="text-gray-500 mt-2">Participate in events and reach new levels to earn certificates!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert, index) => (
            <motion.div
              key={cert._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-indigo-50 p-3 rounded-lg">
                    <Award className="w-8 h-8 text-indigo-600" />
                  </div>
                  {cert.isVerified && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{cert.title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{cert.description}</p>

                <div className="flex items-center text-sm text-gray-500 mb-6">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(cert.issueDate).toLocaleDateString()}
                </div>

                <div className="flex gap-3">
                  {cert.certificateUrl ? (
                    <a
                      href={cert.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </a>
                  ) : (
                    <button disabled className="flex-1 px-4 py-2 bg-gray-100 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed">
                      Generating...
                    </button>
                  )}
                  
                  <a
                    href={`/verify-certificate/${cert.certificateNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Verify Certificate"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 font-mono">ID: {cert.certificateNumber}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Certificates
