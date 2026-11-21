import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["student", "teacher"], required: true },

    // Student only (the only academic detail a student enters)
    rollNumber: {
      type: String,
      trim: true,
      required: function () { return this.role === "student"; },
    },

    // Teacher only (optional)
    department: { type: String, trim: true },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);