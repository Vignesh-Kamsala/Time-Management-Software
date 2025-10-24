import mongoose from "mongoose";

const MeetingSchema = new mongoose.Schema({
  title: { type: String, required: true }, // purpose or project
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  venue: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Executive" }, // who scheduled
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Executive" }],
  status: { type: String, default: "scheduled" }, // scheduled, cancelled, rescheduled
  project: { type: String },
  notified: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("Meeting", MeetingSchema);
