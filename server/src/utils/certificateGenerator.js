import PDFDocument from 'pdfkit'
import QRCode from 'qrcode'
import cloudinary from '../config/cloudinary.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Generate a certificate PDF and upload to Cloudinary
 * @param {Object} certificate - The certificate Mongoose document
 * @param {Object} user - The user Mongoose document
 * @returns {Promise<string>} The URL of the generated PDF
 */
export const generateCertificatePDF = async (certificate, user) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        layout: 'landscape',
        size: 'A4',
        margin: 50
      })

      const buffers = []
      doc.on('data', buffers.push.bind(buffers))
      doc.on('end', async () => {
        const pdfBuffer = Buffer.concat(buffers)
        
        try {
          // Upload to Cloudinary
          // We need to use a stream or write to file first for Cloudinary uploader usually, 
          // but upload_stream is available in the SDK.
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              resource_type: 'raw', // 'raw' for PDF
              folder: 'certificates',
              public_id: `certificate_${certificate.certificateNumber}`,
              format: 'pdf'
            },
            (error, result) => {
              if (error) {
                console.error('Cloudinary upload error:', error)
                reject(error)
              } else {
                resolve(result.secure_url)
              }
            }
          )
          
          uploadStream.end(pdfBuffer)
        } catch (uploadError) {
          reject(uploadError)
        }
      })

      // --- PDF DESIGN ---

      // Background Border
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
         .stroke('#4F46E5') // Indigo-600
         .lineWidth(5)

      doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60)
         .stroke('#E0E7FF') // Indigo-100
         .lineWidth(2)

      // Header
      doc.font('Helvetica-Bold')
         .fontSize(40)
         .fillColor('#1F2937') // Gray-800
         .text('CERTIFICATE OF ACHIEVEMENT', 0, 100, { align: 'center' })

      doc.moveDown()
      doc.fontSize(16)
         .fillColor('#6B7280') // Gray-500
         .text('This certificate is proudly presented to', { align: 'center' })

      doc.moveDown(1.5)

      // Recipient Name
      doc.font('Helvetica-Bold')
         .fontSize(32)
         .fillColor('#4F46E5') // Indigo-600
         .text(`${user.firstName} ${user.lastName}`, { align: 'center' })

      doc.moveDown(0.5)
      
      // Line under name
      const nameWidth = doc.widthOfString(`${user.firstName} ${user.lastName}`)
      const centerX = doc.page.width / 2
      doc.moveTo(centerX - (nameWidth / 2) - 20, doc.y)
         .lineTo(centerX + (nameWidth / 2) + 20, doc.y)
         .stroke('#E5E7EB') // Gray-200

      doc.moveDown(1.5)

      // Description / Title
      doc.font('Helvetica')
         .fontSize(18)
         .fillColor('#374151') // Gray-700
         .text(certificate.title, { align: 'center' })

      doc.moveDown(0.5)
      doc.fontSize(14)
         .fillColor('#6B7280')
         .text(certificate.description, { align: 'center', width: 500, align: 'center' }) // Constrain width

      // Footer Section
      const bottomY = doc.page.height - 150

      // Date
      doc.fontSize(12)
         .text('Date Issued:', 100, bottomY)
         .font('Helvetica-Bold')
         .text(new Date(certificate.issueDate).toLocaleDateString(), 100, bottomY + 20)

      // Certificate ID
      doc.font('Helvetica')
         .text('Certificate ID:', 100, bottomY + 50)
         .font('Helvetica-Bold')
         .text(certificate.certificateNumber, 100, bottomY + 70)

      // Signature (Placeholder)
      doc.moveTo(doc.page.width - 250, bottomY + 40)
         .lineTo(doc.page.width - 100, bottomY + 40)
         .stroke('#000000')
      
      doc.font('Helvetica')
         .fontSize(12)
         .text('Authorized Signature', doc.page.width - 250, bottomY + 50, { width: 150, align: 'center' })
      
      doc.font('Helvetica-Bold')
         .fontSize(14)
         .text('Sevasetu Team', doc.page.width - 250, bottomY + 20, { width: 150, align: 'center' })

      // QR Code
      // Generate QR Data URL
      const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-certificate/${certificate.certificateNumber}`
      const qrDataUrl = await QRCode.toDataURL(verificationUrl)
      
      // Embed QR Code
      doc.image(qrDataUrl, centerX - 40, bottomY, { width: 80, height: 80 })
      
      doc.fontSize(10)
         .fillColor('#9CA3AF')
         .text('Scan to verify', centerX - 40, bottomY + 85, { width: 80, align: 'center' })

      // Finalize PDF
      doc.end()

    } catch (error) {
      reject(error)
    }
  })
}
