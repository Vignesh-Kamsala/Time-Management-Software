const mongoose = require("mongoose");

// This sub-schema defines the structure for a participant in an event
const participantSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Declined'],
    default: 'Pending'
  }
}, { _id: false }); // _id: false prevents creating a separate ID for this sub-document

const eventSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  eventType: {
    type: String,
    required: true,
    enum: ['Meeting', 'Task', 'Leave'],
    default: 'Meeting'
  },
  startTime: { 
    type: Date, 
    required: true 
  },
  endTime: { 
    type: Date, 
    required: true 
  },
  venue: { 
    type: String 
  },
  organizer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true
  },
  participants: [participantSchema],
  status: { 
    type: String, 
    default: "Scheduled" // e.g., Scheduled, Cancelled
  },
  project: { 
    type: String 
  },
}, { timestamps: true });

module.exports = mongoose.model("Event", eventSchema);

