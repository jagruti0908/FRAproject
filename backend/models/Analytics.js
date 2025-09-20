const mongoose = require("mongoose");

// Dashboard Analytics Model
const dashboardAnalyticsSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    state: {
      type: String,
      required: true,
      enum: ["Madhya Pradesh", "Tripura", "Odisha", "Telangana"],
    },
    district: {
      type: String,
      required: true,
    },

    // Claim Statistics
    claimStats: {
      totalClaims: {
        type: Number,
        default: 0,
      },
      submittedClaims: {
        type: Number,
        default: 0,
      },
      underReviewClaims: {
        type: Number,
        default: 0,
      },
      approvedClaims: {
        type: Number,
        default: 0,
      },
      rejectedClaims: {
        type: Number,
        default: 0,
      },
      pendingDocumentsClaims: {
        type: Number,
        default: 0,
      },
    },

    // Claim Type Breakdown
    claimTypeBreakdown: {
      ifrClaims: {
        type: Number,
        default: 0,
      },
      crClaims: {
        type: Number,
        default: 0,
      },
      cfrClaims: {
        type: Number,
        default: 0,
      },
    },

    // Area Statistics (in acres)
    areaStats: {
      totalAreaClaimed: {
        type: Number,
        default: 0,
      },
      totalAreaApproved: {
        type: Number,
        default: 0,
      },
      averageClaimArea: {
        type: Number,
        default: 0,
      },
    },

    // Processing Time Statistics (in days)
    processingTimeStats: {
      averageProcessingTime: {
        type: Number,
        default: 0,
      },
      medianProcessingTime: {
        type: Number,
        default: 0,
      },
      fastestProcessingTime: {
        type: Number,
        default: 0,
      },
      slowestProcessingTime: {
        type: Number,
        default: 0,
      },
    },

    // Demographics
    demographics: {
      stClaimants: {
        type: Number,
        default: 0,
      },
      scClaimants: {
        type: Number,
        default: 0,
      },
      obcClaimants: {
        type: Number,
        default: 0,
      },
      generalClaimants: {
        type: Number,
        default: 0,
      },
      maleClaimants: {
        type: Number,
        default: 0,
      },
      femaleClaimants: {
        type: Number,
        default: 0,
      },
      otherGenderClaimants: {
        type: Number,
        default: 0,
      },
    },

    // AI Analysis Statistics
    aiAnalysisStats: {
      totalAnalyzed: {
        type: Number,
        default: 0,
      },
      flaggedClaims: {
        type: Number,
        default: 0,
      },
      averageRiskScore: {
        type: Number,
        default: 0,
      },
      highRiskClaims: {
        type: Number,
        default: 0,
      },
      mediumRiskClaims: {
        type: Number,
        default: 0,
      },
      lowRiskClaims: {
        type: Number,
        default: 0,
      },
    },

    // Committee Progress
    committeeProgress: {
      gramSabhaCompleted: {
        type: Number,
        default: 0,
      },
      subDivisionalCompleted: {
        type: Number,
        default: 0,
      },
      districtLevelCompleted: {
        type: Number,
        default: 0,
      },
    },

    // Monthly Trends
    monthlyTrends: {
      newClaims: {
        type: Number,
        default: 0,
      },
      approvedClaims: {
        type: Number,
        default: 0,
      },
      rejectedClaims: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Performance Metrics Model
const performanceMetricsSchema = new mongoose.Schema(
  {
    metricId: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ["district", "block", "officer", "state"],
      required: true,
    },
    entityId: {
      type: String,
      required: true,
    },
    entityName: {
      type: String,
      required: true,
    },
    period: {
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: true,
      },
    },
    metrics: {
      totalClaimsProcessed: {
        type: Number,
        default: 0,
      },
      approvalRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      rejectionRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      averageProcessingTime: {
        type: Number,
        default: 0,
      },
      backlogClaims: {
        type: Number,
        default: 0,
      },
      efficiencyScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      qualityScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
    },
    location: {
      state: {
        type: String,
        required: true,
        enum: ["Madhya Pradesh", "Tripura", "Odisha", "Telangana"],
      },
      district: String,
      block: String,
    },
  },
  {
    timestamps: true,
  }
);

// Anomaly Detection Model
const anomalySchema = new mongoose.Schema(
  {
    anomalyId: {
      type: String,
      required: true,
      unique: true,
    },
    claimId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Claim",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "duplicate_claim",
        "overlapping_boundaries",
        "inconsistent_documents",
        "suspicious_coordinates",
        "rapid_land_use_change",
        "invalid_boundaries",
        "document_mismatch",
        "other",
      ],
      required: true,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    detectionMethod: {
      type: String,
      enum: ["manual", "rule_based", "machine_learning", "geospatial_analysis"],
      required: true,
    },
    detectionDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["open", "investigating", "resolved", "false_positive"],
      default: "open",
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    resolvedDate: Date,
    resolution: String,
    evidence: [
      {
        type: String,
        description: String,
        filePath: String,
        uploadDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

// Report Model
const reportSchema = new mongoose.Schema(
  {
    reportId: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        "monthly_summary",
        "quarterly_analysis",
        "annual_report",
        "performance_review",
        "anomaly_report",
        "compliance_report",
        "custom",
      ],
      required: true,
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    generationDate: {
      type: Date,
      default: Date.now,
    },
    period: {
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: true,
      },
    },
    scope: {
      state: {
        type: String,
        enum: ["Madhya Pradesh", "Tripura", "Odisha", "Telangana", "All"],
      },
      district: String,
      block: String,
    },
    data: {
      summary: mongoose.Schema.Types.Mixed,
      charts: [
        {
          chartType: String,
          data: mongoose.Schema.Types.Mixed,
          config: mongoose.Schema.Types.Mixed,
        },
      ],
      tables: [
        {
          title: String,
          headers: [String],
          rows: [[mongoose.Schema.Types.Mixed]],
        },
      ],
      insights: [String],
      recommendations: [String],
    },
    format: {
      type: String,
      enum: ["pdf", "excel", "json", "html"],
      default: "pdf",
    },
    filePath: String,
    fileSize: Number,
    isScheduled: {
      type: Boolean,
      default: false,
    },
    scheduleFrequency: {
      type: String,
      enum: ["daily", "weekly", "monthly", "quarterly", "yearly"],
    },
    nextScheduledRun: Date,
    status: {
      type: String,
      enum: ["generating", "completed", "failed"],
      default: "generating",
    },
    error: String,
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
dashboardAnalyticsSchema.index({ date: -1, state: 1, district: 1 });
performanceMetricsSchema.index({
  type: 1,
  entityId: 1,
  "period.startDate": -1,
});
anomalySchema.index({ claimId: 1, status: 1, severity: 1 });
anomalySchema.index({ detectionDate: -1, type: 1 });
reportSchema.index({ generatedBy: 1, generationDate: -1 });
reportSchema.index({ type: 1, "scope.state": 1 });

module.exports = {
  DashboardAnalytics: mongoose.model(
    "DashboardAnalytics",
    dashboardAnalyticsSchema
  ),
  PerformanceMetrics: mongoose.model(
    "PerformanceMetrics",
    performanceMetricsSchema
  ),
  Anomaly: mongoose.model("Anomaly", anomalySchema),
  Report: mongoose.model("Report", reportSchema),
};
