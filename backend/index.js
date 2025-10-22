// server.js
const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());
const cors = require("cors");
const userSchema = require("./schema/userSchema");
app.use(cors());

// ✅ Step 1: Define your MongoDB connection URL
const mongoURI = "mongodb://127.0.0.1:27017/mydatabase"; 
// You can see this URI in MongoDB Compass "Connect" option too

// ✅ Step 2: Connect to MongoDB
mongoose.connect(mongoURI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));



const User = mongoose.model("User", userSchema);

// ✅ Step 4: Example route to add a user
// Add this route in your server.js

app.post("/api/auth/saveUser", async (req, res) => {
  try {
    const { email, name ,firebaseId} = req.body;

    if (!email || !name) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ email, name,firebaseId });
      await user.save();
      console.log("🆕 New user added to database:", email);
    } else {
      console.log("✅ User already exists:", email);
    }

    // ✅ Always return JSON
    res.status(200).json({ success: true, user }); 
  } catch (error) {
    console.error("❌ Error saving user:", error);
    res.status(500).json({ message: "Internal Server Error" }); 
  }
});



// ✅ Step 5: Example route to get all users
app.get("/users", async (req, res) => {
  const users = await User.find();
  res.send(users);
});

// ✅ Step 6: Start the server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
