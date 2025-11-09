// backend/schema/EventSchema.js
const mongoose = require('mongoose');

const InvitedSchema = new mongoose.Schema({
  email: { type: String, required: true },
  execId: { type: mongoose.Schema.Types.ObjectId, ref: 'Executive', default: null },
  status: {
    type: String,
    enum: ['invited', 'pending', 'accepted', 'declined', 'scheduled', 'cancelled', 'completed'], // ✅ added accepted + declined
    default: 'invited', // ✅ default matches what your route sends
  }
}, { _id: false });


const MeetingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  venue: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Executive", default: null }, // who scheduled
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Executive" }],
  invited: [InvitedSchema],
  status: { type: String, enum: ['pending','scheduled','cancelled','rescheduled'], default: "pending" },
  project: { type: String },
  notified: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.models?.Meeting || mongoose.model('Meeting', MeetingSchema);
