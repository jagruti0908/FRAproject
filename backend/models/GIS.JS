const mongoose = require('mongoose');

// Forest Boundary Model
const forestBoundarySchema = new mongoose.Schema({
  boundaryId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['reserve_forest', 'protected_forest', 'village_forest', 'other'],
    required: true
  },
  state: {
    type: String,
    required: true,
    enum: ['Madhya Pradesh', 'Tripura', 'Odisha', 'Telangana']
  },
  district: {
    type: String,
    required: true,
    trim: true
  },
  area: {
    type: Number,
    required: true,
    min: 0
  },
  geometry: {
    type: {
      type: String,
      enum: ['Polygon', 'MultiPolygon'],
      required: true
    },
    coordinates: {
      type: [[[Number]]], // Array of LinearRing coordinate arrays
      required: true
    }
  },
  properties: {
    forestDivision: String,
    forestRange: String,
    forestBlock: String,
    legalStatus: String,
    notificationNumber: String,
    notificationDate: Date
  }
}, {
  timestamps: true
});

// Satellite Imagery Model
const satelliteImagerySchema = new mongoose.Schema({
  imageId: {
    type: String,
    required: true,
    unique: true
  },
  source: {
    type: String,
    enum: ['landsat', 'sentinel', 'modis', 'other'],
    required: true
  },
  captureDate: {
    type: Date,
    required: true
  },
  resolution: {
    type: Number, // in meters
    required: true
  },
  cloudCoverage: {
    type: Number,
    min: 0,
    max: 100
  },
  bbox: {
    type: {
      type: String,
      enum: ['Polygon'],
      required: true
    },
    coordinates: {
      type: [[[Number]]],
      required: true
    }
  },
  imageUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: String,
  metadata: {
    bands: [String],
    processingLevel: String,
    satellite: String,
    sensor: String
  }
}, {
  timestamps: true
});

// Land Use Classification Model
const landUseSchema = new mongoose.Schema({
  classificationId: {
    type: String,
    required: true,
    unique: true
  },
  area: {
    type: Number,
    required: true,
    min: 0
  },
  landUseType: {
    type: String,
    enum: [
      'dense_forest',
      'moderate_forest',
      'open_forest',
      'scrubland',
      'grassland',
      'agricultural',
      'settlement',
      'water_body',
      'barren_land',
      'other'
    ],
    required: true
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100
  },
  classificationDate: {
    type: Date,
    default: Date.now
  },
  method: {
    type: String,
    enum: ['manual', 'supervised', 'unsupervised', 'deep_learning'],
    default: 'manual'
  },
  geometry: {
    type: {
      type: String,
      enum: ['Polygon', 'MultiPolygon'],
      required: true
    },
    coordinates: {
      type: [[[Number]]],
      required: true
    }
  },
  location: {
    state: {
      type: String,
      required: true,
      enum: ['Madhya Pradesh', 'Tripura', 'Odisha', 'Telangana']
    },
    district: {
      type: String,
      required: true
    },
    block: String,
    village: String
  },
  relatedClaims: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Claim'
  }]
}, {
  timestamps: true
});

// Village Boundary Model
const villageBoundarySchema = new mongoose.Schema({
  villageId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    enum: ['Madhya Pradesh', 'Tripura', 'Odisha', 'Telangana']
  },
  district: {
    type: String,
    required: true,
    trim: true
  },
  block: {
    type: String,
    required: true,
    trim: true
  },
  gramPanchayat: {
    type: String,
    trim: true
  },
  population: {
    type: Number,
    min: 0
  },
  households: {
    type: Number,
    min: 0
  },
  area: {
    type: Number,
    min: 0
  },
  geometry: {
    type: {
      type: String,
      enum: ['Polygon', 'MultiPolygon'],
      required: true
    },
    coordinates: {
      type: [[[Number]]],
      required: true
    }
  },
  demographics: {
    stPopulation: Number,
    scPopulation: Number,
    obcPopulation: Number,
    generalPopulation: Number,
    literacyRate: Number,
    mainWorkers: Number,
    marginalWorkers: Number
  }
}, {
  timestamps: true
});

// Water Bodies Model
const waterBodySchema = new mongoose.Schema({
  waterBodyId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['river', 'stream', 'lake', 'pond', 'reservoir', 'well', 'other'],
    required: true
  },
  area: {
    type: Number,
    min: 0
  },
  perennial: {
    type: Boolean,
    default: true
  },
  geometry: {
    type: {
      type: String,
      enum: ['Point', 'LineString', 'Polygon'],
      required: true
    },
    coordinates: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    }
  },
  location: {
    state: {
      type: String,
      required: true,
      enum: ['Madhya Pradesh', 'Tripura', 'Odisha', 'Telangana']
    },
    district: {
      type: String,
      required: true
    },
    block: String,
    village: String
  },
  properties: {
    depth: Number,
    waterQuality: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor', 'unknown']
    },
    usage: [String] // irrigation, drinking, fishing, etc.
  }
}, {
  timestamps: true
});

// Create indexes for geospatial queries
forestBoundarySchema.index({ geometry: '2dsphere' });
satelliteImagerySchema.index({ bbox: '2dsphere' });
landUseSchema.index({ geometry: '2dsphere' });
villageBoundarySchema.index({ geometry: '2dsphere' });
waterBodySchema.index({ geometry: '2dsphere' });

// Location-based indexes
forestBoundarySchema.index({ state: 1, district: 1 });
landUseSchema.index({ 'location.state': 1, 'location.district': 1 });
villageBoundarySchema.index({ state: 1, district: 1, block: 1 });
waterBodySchema.index({ 'location.state': 1, 'location.district': 1 });

module.exports = {
  ForestBoundary: mongoose.model('ForestBoundary', forestBoundarySchema),
  SatelliteImagery: mongoose.model('SatelliteImagery', satelliteImagerySchema),
  LandUse: mongoose.model('LandUse', landUseSchema),
  VillageBoundary: mongoose.model('VillageBoundary', villageBoundarySchema),
  WaterBody: mongoose.model('WaterBody', waterBodySchema)
};