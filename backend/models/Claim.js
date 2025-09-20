const mongoose = require("mongoose");

const claimSchema = new mongoose.Schema(
  {
    claimId: {
      type: String,
      unique: true,
      trim: true,
    },
    claimType: {
      type: String,
      required: true,
      enum: ["IFR", "CR", "CFR"], // Individual Forest Rights, Community Rights, Community Forest Resource Rights
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: [
        "submitted",
        "under_review",
        "approved",
        "rejected",
        "pending_documents",
      ],
      default: "submitted",
    },

    // Claimant Information
    claimantDetails: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      fatherName: {
        type: String,
        trim: true,
      },
      gender: {
        type: String,
        enum: ["male", "female", "other"],
        required: true,
      },
      age: {
        type: Number,
        min: 0,
        max: 150,
      },
      caste: {
        type: String,
        enum: ["ST", "SC", "OBC", "General"],
        required: true,
      },
      aadharNumber: {
        type: String,
        validate: {
          validator: function (v) {
            return /^\d{12}$/.test(v);
          },
          message: "Aadhar number must be 12 digits",
        },
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
    },

    // Location Information
    location: {
      state: {
        type: String,
        required: true,
        enum: ["Madhya Pradesh", "Tripura", "Odisha", "Telangana"],
      },
      district: {
        type: String,
        required: true,
        trim: true,
      },
      block: {
        type: String,
        required: true,
        trim: true,
      },
      village: {
        type: String,
        required: true,
        trim: true,
      },
      gramPanchayat: {
        type: String,
        trim: true,
      },
    },

    // Land Details
    landDetails: {
      surveyNumber: {
        type: String,
        trim: true,
      },
      area: {
        type: Number,
        required: true,
        min: 0,
      },
      areaUnit: {
        type: String,
        enum: ["acres", "hectares", "bigha"],
        default: "acres",
      },
      landType: {
        type: String,
        enum: ["agricultural", "residential", "forest", "grazing", "other"],
        required: true,
      },
      boundaries: {
        north: String,
        south: String,
        east: String,
        west: String,
      },
    },

    // GIS Coordinates
    coordinates: {
      latitude: {
        type: Number,
        min: -90,
        max: 90,
      },
      longitude: {
        type: Number,
        min: -180,
        max: 180,
      },
      polygon: [
        {
          lat: Number,
          lng: Number,
        },
      ],
    },

    // Documents
    documents: [
      {
        documentType: {
          type: String,
          enum: [
            "residence_proof",
            "cultivation_proof",
            "identity_proof",
            "survey_settlement",
            "other",
          ],
          required: true,
        },
        fileName: String,
        filePath: String,
        uploadDate: {
          type: Date,
          default: Date.now,
        },
        verified: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // Processing Information
    submissionDate: {
      type: Date,
      default: Date.now,
    },
    reviewDate: Date,
    approvalDate: Date,
    rejectionDate: Date,
    rejectionReason: String,

    // Committee Information
    gramSabhaDate: Date,
    subDivisionalCommitteeDate: Date,
    districtLevelCommitteeDate: Date,

    // AI Analysis Results
    aiAnalysis: {
      riskScore: {
        type: Number,
        min: 0,
        max: 100,
      },
      anomalies: [String],
      verificationStatus: {
        type: String,
        enum: ["pending", "verified", "flagged"],
        default: "pending",
      },
      satelliteImagery: {
        beforeUrl: String,
        afterUrl: String,
        analysisDate: Date,
      },
    },

    // Officer Assignment
    assignedOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Workflow History
    workflow: [
      {
        stage: String,
        action: String,
        actionBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        actionDate: {
          type: Date,
          default: Date.now,
        },
        comments: String,
      },
    ],

    // Title Information (if approved)
    titleDetails: {
      titleNumber: String,
      issueDate: Date,
      validityPeriod: Number, // in years
      conditions: [String],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
claimSchema.index({ claimId: 1 });
claimSchema.index({ status: 1 });
claimSchema.index({ "location.state": 1, "location.district": 1 });
claimSchema.index({ claimType: 1 });
claimSchema.index({ submissionDate: -1 });
claimSchema.index({ "coordinates.latitude": 1, "coordinates.longitude": 1 });

// Generate claim ID before saving
claimSchema.pre("save", async function (next) {
  if (!this.claimId) {
    const count = await mongoose.model("Claim").countDocuments();
    const stateCode = {
      "Madhya Pradesh": "MP",
      Tripura: "TR",
      Odisha: "OD",
      Telangana: "TG",
    }[this.location.state];

    this.claimId = `FRA${stateCode}${Date.now()}${String(count + 1).padStart(
      4,
      "0"
    )}`;
  }
  next();
});

module.exports = mongoose.model("Claim", claimSchema);
