const mongoose = require('mongoose');

const interviewScheduleSchema = new mongoose.Schema(
  {
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    candidateName: {
      type: String,
      required: true
    },
    candidateEmail: String,
    date: {
      type: String,
      required: true
    },
    time: {
      type: String,
      required: true
    },
    platform: {
      type: String,
      enum: ['Google Meet', 'Zoom', 'Microsoft Teams'],
      default: 'Google Meet'
    },
    meetingUrl: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled'],
      default: 'Scheduled'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('InterviewSchedule', interviewScheduleSchema);
