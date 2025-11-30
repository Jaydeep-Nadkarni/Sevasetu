import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle, XCircle, Award, Calendar, User, Shield } from 'lucide-react'
import api from '../utils/api'

const CertificateVerify = () => {
  const { code } = useParams()
  const [certificate, setCertificate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const verifyCertificate = async () => {
      try {
        const { data } = await api.get(`/certificates/verify/${code}`)
        setCertificate(data.data)
      } catch (err) {
        console.error('Verification error:', err)
        setError('Certificate not found or invalid')
      } finally {
        setLoading(false)
      }
    }
    if (code) {
      verifyCertificate()
    }
  }, [code])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold text-indigo-600">Sevasetu</Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {error ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-100 mb-6">
                <XCircle className="h-12 w-12 text-red-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Verification Failed</h2>
              <p className="text-gray-500 text-lg mb-8">{error}</p>
              <p className="text-sm text-gray-400">Certificate ID: {code}</p>
            </div>
          ) : (
            <div>
              <div className="bg-green-600 px-6 py-4 flex items-center justify-center gap-2">
                <CheckCircle className="text-white w-6 h-6" />
                <span className="text-white font-bold text-lg">Certificate Verified</span>
              </div>

              <div className="p-8 md:p-12">
                <div className="text-center mb-10">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">{certificate.title}</h1>
                  <p className="text-gray-600 text-lg">{certificate.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <User className="w-5 h-5 text-indigo-600" />
                      <h3 className="font-semibold text-gray-900">Recipient</h3>
                    </div>
                    <div className="flex items-center gap-4">
                      {certificate.recipient.avatar ? (
                        <img 
                          src={certificate.recipient.avatar} 
                          alt="Avatar" 
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                          {certificate.recipient.firstName?.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-gray-900 text-lg">
                          {certificate.recipient.firstName} {certificate.recipient.lastName}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <Shield className="w-5 h-5 text-indigo-600" />
                      <h3 className="font-semibold text-gray-900">Issuer</h3>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                        <Award className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-lg">
                          {certificate.issuer?.name || 'Sevasetu Platform'}
                        </p>
                        <p className="text-sm text-gray-500">Official NGO Partner</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-8">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 mb-1">Issue Date</p>
                      <p className="font-semibold text-gray-900 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(certificate.issueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500 mb-1">Certificate ID</p>
                      <p className="font-mono font-semibold text-gray-900">{certificate.certificateNumber}</p>
                    </div>
                  </div>
                </div>

                {certificate.certificateUrl && (
                  <div className="mt-10 text-center">
                    <a 
                      href={certificate.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Download Original PDF
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CertificateVerify
