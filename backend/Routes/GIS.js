const express = require('express');
const router = express.Router();
const gisController = require('../Controllers/GIS.js');

// Forest Boundary Routes
router.post('/forest-boundaries', gisController.createForestBoundary);
router.get('/forest-boundaries', gisController.getForestBoundaries);
router.get('/forest-boundaries/area', gisController.getForestBoundariesInArea);

// Satellite Imagery Routes
router.post('/satellite-imagery', gisController.addSatelliteImagery);
router.get('/satellite-imagery', gisController.getSatelliteImagery);

// Land Use Classification Routes
router.post('/land-use', gisController.createLandUseClassification);
router.get('/land-use/location', gisController.getLandUseByLocation);
router.get('/land-use/area', gisController.getLandUseInArea);

// Village Boundary Routes
router.post('/village-boundaries', gisController.createVillageBoundary);
router.get('/village-boundaries', gisController.getVillageBoundaries);

// Water Body Routes
router.post('/water-bodies', gisController.createWaterBody);
router.get('/water-bodies', gisController.getWaterBodies);

// Spatial Analysis Routes
router.get('/analysis/overlapping-claims/:claimId', gisController.getOverlappingClaims);
router.get('/analysis/forest-claims/:forestBoundaryId', gisController.getClaimsInForestArea);

module.exports = router;