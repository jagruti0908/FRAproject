const express = require('express');
const router = express.Router();
const dashboardController = require('../Controllers/Dashboard.js');

// Dashboard overview statistics
router.get('/overview', dashboardController.getDashboardOverview);

// Claims analytics by location
router.get('/analytics/location', dashboardController.getClaimsAnalyticsByLocation);

// Claims trend data
router.get('/analytics/trends', dashboardController.getClaimsTrend);

// Performance metrics
router.get('/performance', dashboardController.getPerformanceMetrics);

// Anomalies and alerts
router.get('/anomalies', dashboardController.getAnomalies);

// Geographic distribution
router.get('/analytics/geographic', dashboardController.getGeographicDistribution);

// Processing efficiency
router.get('/analytics/efficiency', dashboardController.getProcessingEfficiency);

// Demographic analysis
router.get('/analytics/demographics', dashboardController.getDemographicAnalysis);

// Real-time statistics
router.get('/realtime', dashboardController.getRealTimeStats);

module.exports = router;