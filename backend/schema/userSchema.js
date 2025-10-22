const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firebaseID: { type: String, required: true, unique: true }, // Firebase Auth ID
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
