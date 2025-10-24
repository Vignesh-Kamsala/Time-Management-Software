import mongoose from "mongoose";

const SecretarySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed
  role: { type: String, default: "secretary" }, // role-based access
  assignedExecutives: [{ type: mongoose.Schema.Types.ObjectId, ref: "Executive" }],
}, { timestamps: true });

export default mongoose.model("Secretary", SecretarySchema);
