import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // Additional fields for user roles or permissions can be added here
  role: { type: String, default: "customer" }, // Example: 'customer', 'admin'
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
