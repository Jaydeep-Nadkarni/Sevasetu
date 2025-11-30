import mongoose from 'mongoose'

const qrAttendanceSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event is required'],
      index: true,
    },
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Participant is required'],
      index: true,
    },
    qrCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    checkInTime: {
      type: Date,
      index: true,
    },
    checkOutTime: Date,
    attendanceDuration: {
      type: Number,
      min: 0,
    },
    status: {
      type: String,
      enum: ['registered', 'checked_in', 'checked_out', 'absent'],
      default: 'registered',
      index: true,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        index: '2dsphere',
      },
    },
    notes: String,
  },
  {
    timestamps: true,
  }
)

// Indexes
qrAttendanceSchema.index({ event: 1, participant: 1 })
qrAttendanceSchema.index({ event: 1, checkInTime: -1 })
qrAttendanceSchema.index({ status: 1 })
qrAttendanceSchema.index({ qrCode: 1 })

const QRAttendance = mongoose.model('QRAttendance', qrAttendanceSchema)

export default QRAttendance
