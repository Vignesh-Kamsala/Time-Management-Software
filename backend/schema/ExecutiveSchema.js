import mongoose from "mongoose";

const ExecutiveSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed
  department: { type: String },
  role: { type: String, default: "executive" }, // optional, for role-based access
  leavePeriods: [
    {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
      reason: { type: String },
    }
  ],
  tasks: [
    {
      title: { type: String, required: true },
      startTime: { type: Date, required: true },
      endTime: { type: Date },
      description: { type: String },
    }
  ],
}, { timestamps: true });

export default mongoose.model("Executive", ExecutiveSchema);
