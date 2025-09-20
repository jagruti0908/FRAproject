const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: ["admin", "officer", "community_representative", "viewer"],
      default: "viewer",
    },
    department: {
      type: String,
      required: function () {
        return this.role === "admin" || this.role === "officer";
      },
      trim: true,
    },
    state: {
      type: String,
      required: true,
      enum: ["Madhya Pradesh", "Tripura", "Odisha", "Telangana"],
      trim: true,
    },
    district: {
      type: String,
      required: true,
      trim: true,
    },
    block: {
      type: String,
      trim: true,
    },
    village: {
      type: String,
      trim: true,
    },
    phoneNumber: {
      type: String,
      validate: {
        validator: function (v) {
          return /^\+?[1-9]\d{1,14}$/.test(v);
        },
        message: "Please provide a valid phone number",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    permissions: [
      {
        type: String,
        enum: ["read", "write", "approve", "reject", "admin"],
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
// userSchema.index({ email: 1 });
// userSchema.index({ state: 1, district: 1 });
// userSchema.index({ role: 1 });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model("User", userSchema);
