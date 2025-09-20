const Claim = require('../models/Claim');
const User = require('../models/User');
const { DashboardAnalytics, PerformanceMetrics, Anomaly } = require('../models/Analytics');
const mongoose = require('mongoose');

// Get dashboard overview statistics
exports.getDashboardOverview = async (req, res) => {
  try {
    const { state, district, startDate, endDate } = req.query;
    
    // Build filter for claims
    const claimFilter = {};
    if (state) claimFilter['location.state'] = state;
    if (district) claimFilter['location.district'] = district;
    
    if (startDate || endDate) {
      claimFilter.submissionDate = {};
      if (startDate) claimFilter.submissionDate.$gte = new Date(startDate);
      if (endDate) claimFilter.submissionDate.$lte = new Date(endDate);
    }
    
    // Get basic claim statistics
    const [
      totalClaims,
      submittedClaims,
      underReviewClaims,
      approvedClaims,
      rejectedClaims,
      pendingDocumentsClaims
    ] = await Promise.all([
      Claim.countDocuments(claimFilter),
      Claim.countDocuments({ ...claimFilter, status: 'submitted' }),
      Claim.countDocuments({ ...claimFilter, status: 'under_review' }),
      Claim.countDocuments({ ...claimFilter, status: 'approved' }),
      Claim.countDocuments({ ...claimFilter, status: 'rejected' }),
      Claim.countDocuments({ ...claimFilter, status: 'pending_documents' })
    ]);
    
    // Get claim type breakdown
    const claimTypeBreakdown = await Claim.aggregate([
      { $match: claimFilter },
      {
        $group: {
          _id: '$claimType',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get area statistics
    const areaStats = await Claim.aggregate([
      { $match: claimFilter },
      {
        $group: {
          _id: null,
          totalArea: { $sum: '$landDetails.area' },
          averageArea: { $avg: '$landDetails.area' },
          approvedArea: {
            $sum: {
              $cond: [
                { $eq: ['$status', 'approved'] },
                '$landDetails.area',
                0
              ]
            }
          }
        }
      }
    ]);
    
    // Get recent activity
    const recentClaims = await Claim.find(claimFilter)
      .sort({ submissionDate: -1 })
      .limit(10)
      .select('claimId claimType status submissionDate location.village location.district')
      .lean();
    
    // Get processing time statistics for approved/rejected claims
    const processingTimeStats = await Claim.aggregate([
      {
        $match: {
          ...claimFilter,
          status: { $in: ['approved', 'rejected'] },
          $expr: {
            $and: [
              { $ne: ['$submissionDate', null] },
              {
                $ne: [
                  { $ifNull: ['$approvalDate', '$rejectionDate'] },
                  null
                ]
              }
            ]
          }
        }
      },
      {
        $project: {
          processingTime: {
            $divide: [
              {
                $subtract: [
                  { $ifNull: ['$approvalDate', '$rejectionDate'] },
                  '$submissionDate'
                ]
              },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          averageProcessingTime: { $avg: '$processingTime' },
          minProcessingTime: { $min: '$processingTime' },
          maxProcessingTime: { $max: '$processingTime' }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalClaims,
          submittedClaims,
          underReviewClaims,
          approvedClaims,
          rejectedClaims,
          pendingDocumentsClaims
        },
        claimTypeBreakdown: claimTypeBreakdown.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        areaStatistics: areaStats[0] || {
          totalArea: 0,
          averageArea: 0,
          approvedArea: 0
        },
        processingTimeStats: processingTimeStats[0] || {
          averageProcessingTime: 0,
          minProcessingTime: 0,
          maxProcessingTime: 0
        },
        recentActivity: recentClaims
      }
    });
  } catch (error) {
    console.error('Get dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard overview'
    });
  }
};

// Get claims analytics by location
exports.getClaimsAnalyticsByLocation = async (req, res) => {
  try {
    const { state } = req.query;
    
    if (!state) {
      return res.status(400).json({
        success: false,
        message: 'State is required'
      });
    }
    
    // District-wise breakdown
    const districtBreakdown = await Claim.aggregate([
      { $match: { 'location.state': state } },
      {
        $group: {
          _id: '$location.district',
          totalClaims: { $sum: 1 },
          approvedClaims: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          rejectedClaims: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          },
          underReviewClaims: {
            $sum: { $cond: [{ $eq: ['$status', 'under_review'] }, 1, 0] }
          },
          totalArea: { $sum: '$landDetails.area' }
        }
      },
      { $sort: { totalClaims: -1 } }
    ]);
    
    // Block-wise breakdown for top districts
    const topDistricts = districtBreakdown.slice(0, 5).map(d => d._id);
    const blockBreakdown = await Claim.aggregate([
      {
        $match: {
          'location.state': state,
          'location.district': { $in: topDistricts }
        }
      },
      {
        $group: {
          _id: {
            district: '$location.district',
            block: '$location.block'
          },
          totalClaims: { $sum: 1 },
          approvedClaims: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.district': 1, totalClaims: -1 } }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        districtBreakdown,
        blockBreakdown
      }
    });
  } catch (error) {
    console.error('Get claims analytics by location error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch claims analytics by location'
    });
  }
};

// Get claims trend data
exports.getClaimsTrend = async (req, res) => {
  try {
    const { period = 'monthly', state, district } = req.query;
    
    const filter = {};
    if (state) filter['location.state'] = state;
    if (district) filter['location.district'] = district;
    
    let groupBy;
    switch (period) {
      case 'daily':
        groupBy = {
          year: { $year: '$submissionDate' },
          month: { $month: '$submissionDate' },
          day: { $dayOfMonth: '$submissionDate' }
        };
        break;
      case 'weekly':
        groupBy = {
          year: { $year: '$submissionDate' },
          week: { $week: '$submissionDate' }
        };
        break;
      case 'monthly':
      default:
        groupBy = {
          year: { $year: '$submissionDate' },
          month: { $month: '$submissionDate' }
        };
        break;
    }
    
    const trendData = await Claim.aggregate([
      { $match: filter },
      {
        $group: {
          _id: groupBy,
          submittedClaims: { $sum: 1 },
          approvedClaims: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          rejectedClaims: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          },
          totalArea: { $sum: '$landDetails.area' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } }
    ]);
    
    res.status(200).json({
      success: true,
      data: trendData
    });
  } catch (error) {
    console.error('Get claims trend error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch claims trend data'
    });
  }
};

// Get performance metrics
exports.getPerformanceMetrics = async (req, res) => {
  try {
    const { type, entityId, startDate, endDate } = req.query;
    
    const filter = {};
    if (type) filter.type = type;
    if (entityId) filter.entityId = entityId;
    
    if (startDate || endDate) {
      filter['period.startDate'] = {};
      if (startDate) filter['period.startDate'].$gte = new Date(startDate);
      if (endDate) filter['period.startDate'].$lte = new Date(endDate);
    }
    
    const metrics = await PerformanceMetrics.find(filter)
      .sort({ 'period.startDate': -1 })
      .lean();
    
    res.status(200).json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Get performance metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch performance metrics'
    });
  }
};

// Get anomalies and alerts
exports.getAnomalies = async (req, res) => {
  try {
    const { 
      severity, 
      type, 
      status = 'open',
      page = 1, 
      limit = 10
    } = req.query;
    
    const filter = { status };
    if (severity) filter.severity = severity;
    if (type) filter.type = type;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const anomalies = await Anomaly.find(filter)
      .populate('claimId', 'claimId claimType location.district location.village')
      .populate('resolvedBy', 'name email')
      .sort({ detectionDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    const totalAnomalies = await Anomaly.countDocuments(filter);
    
    // Get anomaly statistics
    const anomalyStats = await Anomaly.aggregate([
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        anomalies,
        statistics: anomalyStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalAnomalies / parseInt(limit)),
          totalAnomalies
        }
      }
    });
  } catch (error) {
    console.error('Get anomalies error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch anomalies'
    });
  }
};

// Get geographic distribution of claims
exports.getGeographicDistribution = async (req, res) => {
  try {
    const { state, level = 'district' } = req.query;
    
    const matchStage = {};
    if (state) matchStage['location.state'] = state;
    
    let groupField;
    switch (level) {
      case 'state':
        groupField = '$location.state';
        break;
      case 'district':
        groupField = '$location.district';
        break;
      case 'block':
        groupField = '$location.block';
        break;
      case 'village':
        groupField = '$location.village';
        break;
      default:
        groupField = '$location.district';
    }
    
    const distribution = await Claim.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: groupField,
          totalClaims: { $sum: 1 },
          approvedClaims: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          rejectedClaims: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          },
          pendingClaims: {
            $sum: { 
              $cond: [
                { $in: ['$status', ['submitted', 'under_review', 'pending_documents']] }, 
                1, 
                0
              ] 
            }
          },
          totalArea: { $sum: '$landDetails.area' },
          averageArea: { $avg: '$landDetails.area' }
        }
      },
      { $sort: { totalClaims: -1 } }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        level,
        distribution
      }
    });
  } catch (error) {
    console.error('Get geographic distribution error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch geographic distribution'
    });
  }
};

// Get claims processing efficiency
exports.getProcessingEfficiency = async (req, res) => {
  try {
    const { state, district, startDate, endDate } = req.query;
    
    const matchStage = {
      status: { $in: ['approved', 'rejected'] }
    };
    
    if (state) matchStage['location.state'] = state;
    if (district) matchStage['location.district'] = district;
    
    if (startDate || endDate) {
      matchStage.submissionDate = {};
      if (startDate) matchStage.submissionDate.$gte = new Date(startDate);
      if (endDate) matchStage.submissionDate.$lte = new Date(endDate);
    }
    
    const efficiency = await Claim.aggregate([
      { $match: matchStage },
      {
        $project: {
          claimId: 1,
          status: 1,
          'location.district': 1,
          processingTime: {
            $divide: [
              {
                $subtract: [
                  { $ifNull: ['$approvalDate', '$rejectionDate'] },
                  '$submissionDate'
                ]
              },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          }
        }
      },
      {
        $group: {
          _id: '$location.district',
          totalProcessed: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          },
          avgProcessingTime: { $avg: '$processingTime' },
          minProcessingTime: { $min: '$processingTime' },
          maxProcessingTime: { $max: '$processingTime' }
        }
      },
      {
        $project: {
          district: '$_id',
          totalProcessed: 1,
          approved: 1,
          rejected: 1,
          approvalRate: {
            $multiply: [
              { $divide: ['$approved', '$totalProcessed'] },
              100
            ]
          },
          avgProcessingTime: { $round: ['$avgProcessingTime', 2] },
          minProcessingTime: { $round: ['$minProcessingTime', 2] },
          maxProcessingTime: { $round: ['$maxProcessingTime', 2] }
        }
      },
      { $sort: { approvalRate: -1 } }
    ]);
    
    res.status(200).json({
      success: true,
      data: efficiency
    });
  } catch (error) {
    console.error('Get processing efficiency error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch processing efficiency data'
    });
  }
};

// Get demographic analysis
exports.getDemographicAnalysis = async (req, res) => {
  try {
    const { state, district } = req.query;
    
    const filter = {};
    if (state) filter['location.state'] = state;
    if (district) filter['location.district'] = district;
    
    // Caste-wise breakdown
    const casteBreakdown = await Claim.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$claimantDetails.caste',
          count: { $sum: 1 },
          approvedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          totalArea: { $sum: '$landDetails.area' }
        }
      }
    ]);
    
    // Gender-wise breakdown
    const genderBreakdown = await Claim.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$claimantDetails.gender',
          count: { $sum: 1 },
          approvedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          totalArea: { $sum: '$landDetails.area' }
        }
      }
    ]);
    
    // Age group analysis
    const ageGroupBreakdown = await Claim.aggregate([
      { $match: filter },
      {
        $project: {
          status: 1,
          'landDetails.area': 1,
          ageGroup: {
            $switch: {
              branches: [
                { case: { $lt: ['$claimantDetails.age', 30] }, then: '18-29' },
                { case: { $lt: ['$claimantDetails.age', 40] }, then: '30-39' },
                { case: { $lt: ['$claimantDetails.age', 50] }, then: '40-49' },
                { case: { $lt: ['$claimantDetails.age', 60] }, then: '50-59' }
              ],
              default: '60+'
            }
          }
        }
      },
      {
        $group: {
          _id: '$ageGroup',
          count: { $sum: 1 },
          approvedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          totalArea: { $sum: '$landDetails.area' }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        casteBreakdown,
        genderBreakdown,
        ageGroupBreakdown
      }
    });
  } catch (error) {
    console.error('Get demographic analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch demographic analysis'
    });
  }
};

// Get real-time statistics
exports.getRealTimeStats = async (req, res) => {
  try {
    const { state } = req.query;
    
    const filter = {};
    if (state) filter['location.state'] = state;
    
    // Get today's statistics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayFilter = {
      ...filter,
      submissionDate: { $gte: today, $lt: tomorrow }
    };
    
    const [
      totalClaims,
      todaysSubmissions,
      pendingReview,
      criticalAnomalies,
      activeUsers
    ] = await Promise.all([
      Claim.countDocuments(filter),
      Claim.countDocuments(todayFilter),
      Claim.countDocuments({ ...filter, status: 'under_review' }),
      Anomaly.countDocuments({ severity: 'critical', status: 'open' }),
      User.countDocuments({ isActive: true, lastLogin: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } })
    ]);
    
    // Get processing queue statistics
    const queueStats = await Claim.aggregate([
      { $match: { ...filter, status: { $ne: 'approved' } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          oldestSubmission: { $min: '$submissionDate' }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalClaims,
          todaysSubmissions,
          pendingReview,
          criticalAnomalies,
          activeUsers
        },
        queueStatistics: queueStats,
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    console.error('Get real-time stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch real-time statistics'
    });
  }
};