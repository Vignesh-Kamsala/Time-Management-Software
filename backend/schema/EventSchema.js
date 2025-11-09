// // schema/MeetingSchema.js (CommonJS)
// const mongoose = require('mongoose');

// const MeetingSchema = new mongoose.Schema({
//   title: { type: String, required: true }, // purpose or project
//   startTime: { type: Date, required: true },
//   endTime: { type: Date, required: true },
//   venue: { type: String },
//   createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Executive" }, // who scheduled
//   participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Executive" }],
//   status: { type: String, default: "scheduled" }, // scheduled, cancelled, rescheduled
//   project: { type: String },
//   notified: { type: Boolean, default: false },
// }, { timestamps: true });

// // ✅ Export correctly for CommonJS
// module.exports = mongoose.models?.Meeting || mongoose.model("Meeting", MeetingSchema);
// schema/MeetingSchema.js
const mongoose = require('mongoose');

const MeetingSchema = new mongoose.Schema({
  title: { type: String, required: true }, // purpose or project
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  venue: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Executive", default: null },

  // ✅ List of executives who have accepted
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Executive" }],

  // ✅ List of invited people (stored directly here)
  invited: [
    {
      email: { type: String, default: null }, // invited by email
      execId: { type: mongoose.Schema.Types.ObjectId, ref: "Executive", default: null },
      status: {
        type: String,
        enum: ["invited", "accepted", "declined"],
        default: "invited",
      },
    },
  ],

  // ✅ Meeting state
  status: {
    type: String,
    enum: ["pending", "scheduled", "cancelled", "rescheduled"],
    default: "pending",
  },

  project: { type: String },
  notified: { type: Boolean, default: false },
}, { timestamps: true });

// ✅ Export model (avoid OverwriteModelError)
module.exports = mongoose.models?.Meeting || mongoose.model("Meeting", MeetingSchema);
