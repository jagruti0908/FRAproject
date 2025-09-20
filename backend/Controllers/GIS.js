const { ForestBoundary, SatelliteImagery, LandUse, VillageBoundary, WaterBody } = require('../models/GIS.js');
const mongoose = require('mongoose');

// Forest Boundary Controllers
exports.createForestBoundary = async (req, res) => {
  try {
    const forestBoundary = new ForestBoundary(req.body);
    await forestBoundary.save();
    
    res.status(201).json({
      success: true,
      message: 'Forest boundary created successfully',
      data: forestBoundary
    });
  } catch (error) {
    console.error('Create forest boundary error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create forest boundary'
    });
  }
};

exports.getForestBoundaries = async (req, res) => {
  try {
    const { state, district, type, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (state) filter.state = state;
    if (district) filter.district = district;
    if (type) filter.type = type;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const boundaries = await ForestBoundary.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    const totalBoundaries = await ForestBoundary.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      data: {
        boundaries,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalBoundaries / parseInt(limit)),
          totalBoundaries
        }
      }
    });
  } catch (error) {
    console.error('Get forest boundaries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch forest boundaries'
    });
  }
};

exports.getForestBoundariesInArea = async (req, res) => {
  try {
    const { minLat, maxLat, minLng, maxLng } = req.query;
    
    if (!minLat || !maxLat || !minLng || !maxLng) {
      return res.status(400).json({
        success: false,
        message: 'All boundary coordinates are required'
      });
    }
    
    const boundaries = await ForestBoundary.find({
      geometry: {
        $geoIntersects: {
          $geometry: {
            type: 'Polygon',
            coordinates: [[
              [parseFloat(minLng), parseFloat(minLat)],
              [parseFloat(maxLng), parseFloat(minLat)],
              [parseFloat(maxLng), parseFloat(maxLat)],
              [parseFloat(minLng), parseFloat(maxLat)],
              [parseFloat(minLng), parseFloat(minLat)]
            ]]
          }
        }
      }
    }).lean();
    
    res.status(200).json({
      success: true,
      data: boundaries
    });
  } catch (error) {
    console.error('Get forest boundaries in area error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch forest boundaries in area'
    });
  }
};

// Satellite Imagery Controllers
exports.addSatelliteImagery = async (req, res) => {
  try {
    const imagery = new SatelliteImagery(req.body);
    await imagery.save();
    
    res.status(201).json({
      success: true,
      message: 'Satellite imagery added successfully',
      data: imagery
    });
  } catch (error) {
    console.error('Add satellite imagery error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to add satellite imagery'
    });
  }
};

exports.getSatelliteImagery = async (req, res) => {
  try {
    const { 
      source, 
      startDate, 
      endDate, 
      maxCloudCoverage = 30,
      page = 1, 
      limit = 10 
    } = req.query;
    
    const filter = {};
    if (source) filter.source = source;
    if (maxCloudCoverage) filter.cloudCoverage = { $lte: parseInt(maxCloudCoverage) };
    
    if (startDate || endDate) {
      filter.captureDate = {};
      if (startDate) filter.captureDate.$gte = new Date(startDate);
      if (endDate) filter.captureDate.$lte = new Date(endDate);
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const imagery = await SatelliteImagery.find(filter)
      .sort({ captureDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    const totalImagery = await SatelliteImagery.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      data: {
        imagery,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalImagery / parseInt(limit)),
          totalImagery
        }
      }
    });
  } catch (error) {
    console.error('Get satellite imagery error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch satellite imagery'
    });
  }
};

// Land Use Classification Controllers
exports.createLandUseClassification = async (req, res) => {
  try {
    const landUse = new LandUse(req.body);
    await landUse.save();
    
    res.status(201).json({
      success: true,
      message: 'Land use classification created successfully',
      data: landUse
    });
  } catch (error) {
    console.error('Create land use classification error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create land use classification'
    });
  }
};

exports.getLandUseByLocation = async (req, res) => {
  try {
    const { state, district, block, village, landUseType } = req.query;
    
    const filter = {};
    if (state) filter['location.state'] = state;
    if (district) filter['location.district'] = district;
    if (block) filter['location.block'] = block;
    if (village) filter['location.village'] = village;
    if (landUseType) filter.landUseType = landUseType;
    
    const landUseData = await LandUse.find(filter)
      .populate('relatedClaims', 'claimId status')
      .sort({ classificationDate: -1 })
      .lean();
    
    // Calculate area statistics
    const areaStats = landUseData.reduce((acc, item) => {
      const type = item.landUseType;
      acc[type] = (acc[type] || 0) + item.area;
      return acc;
    }, {});
    
    res.status(200).json({
      success: true,
      data: {
        landUseData,
        areaStatistics: areaStats,
        totalArea: Object.values(areaStats).reduce((sum, area) => sum + area, 0)
      }
    });
  } catch (error) {
    console.error('Get land use by location error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch land use data'
    });
  }
};

exports.getLandUseInArea = async (req, res) => {
  try {
    const { lat, lng, radius = 1000 } = req.query; // radius in meters
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }
    
    const landUseData = await LandUse.find({
      geometry: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius)
        }
      }
    }).lean();
    
    res.status(200).json({
      success: true,
      data: landUseData
    });
  } catch (error) {
    console.error('Get land use in area error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch land use data in area'
    });
  }
};

// Village Boundary Controllers
exports.createVillageBoundary = async (req, res) => {
  try {
    const villageBoundary = new VillageBoundary(req.body);
    await villageBoundary.save();
    
    res.status(201).json({
      success: true,
      message: 'Village boundary created successfully',
      data: villageBoundary
    });
  } catch (error) {
    console.error('Create village boundary error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create village boundary'
    });
  }
};

exports.getVillageBoundaries = async (req, res) => {
  try {
    const { state, district, block, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (state) filter.state = state;
    if (district) filter.district = district;
    if (block) filter.block = block;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const villages = await VillageBoundary.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    const totalVillages = await VillageBoundary.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      data: {
        villages,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalVillages / parseInt(limit)),
          totalVillages
        }
      }
    });
  } catch (error) {
    console.error('Get village boundaries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch village boundaries'
    });
  }
};

// Water Body Controllers
exports.createWaterBody = async (req, res) => {
  try {
    const waterBody = new WaterBody(req.body);
    await waterBody.save();
    
    res.status(201).json({
      success: true,
      message: 'Water body created successfully',
      data: waterBody
    });
  } catch (error) {
    console.error('Create water body error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create water body'
    });
  }
};

exports.getWaterBodies = async (req, res) => {
  try {
    const { state, district, type, perennial } = req.query;
    
    const filter = {};
    if (state) filter['location.state'] = state;
    if (district) filter['location.district'] = district;
    if (type) filter.type = type;
    if (perennial !== undefined) filter.perennial = perennial === 'true';
    
    const waterBodies = await WaterBody.find(filter).lean();
    
    res.status(200).json({
      success: true,
      data: waterBodies
    });
  } catch (error) {
    console.error('Get water bodies error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch water bodies'
    });
  }
};

// Spatial Analysis Controllers
exports.getOverlappingClaims = async (req, res) => {
  try {
    const { claimId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(claimId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid claim ID'
      });
    }
    
    // This would typically involve complex geospatial analysis
    // For now, returning a placeholder response
    res.status(200).json({
      success: true,
      message: 'Overlapping claims analysis completed',
      data: {
        overlappingClaims: [],
        totalOverlaps: 0,
        analysis: 'Geospatial overlap analysis would be implemented here'
      }
    });
  } catch (error) {
    console.error('Get overlapping claims error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze overlapping claims'
    });
  }
};

exports.getClaimsInForestArea = async (req, res) => {
  try {
    const { forestBoundaryId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(forestBoundaryId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid forest boundary ID'
      });
    }
    
    const forestBoundary = await ForestBoundary.findById(forestBoundaryId);
    
    if (!forestBoundary) {
      return res.status(404).json({
        success: false,
        message: 'Forest boundary not found'
      });
    }
    
    // This would involve spatial intersection queries with claim polygons
    // Placeholder response for hackathon
    res.status(200).json({
      success: true,
      message: 'Claims in forest area analysis completed',
      data: {
        forestBoundary: forestBoundary.name,
        claimsInArea: [],
        totalClaims: 0,
        analysis: 'Spatial intersection analysis would be implemented here'
      }
    });
  } catch (error) {
    console.error('Get claims in forest area error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze claims in forest area'
    });
  }
};