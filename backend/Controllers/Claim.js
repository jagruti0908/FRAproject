const Claim = require('../models/Claim.js');
const { Anomaly } = require('../models/Analytics.js');
const mongoose = require('mongoose');

// Create new claim
exports.createClaim = async (req, res) => {
  try {
    const claimData = req.body;
    
    // Validate coordinates if provided
    if (claimData.coordinates && claimData.coordinates.latitude && claimData.coordinates.longitude) {
      const { latitude, longitude } = claimData.coordinates;
      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        return res.status(400).json({
          success: false,
          message: 'Invalid coordinates provided'
        });
      }
    }
    
    const claim = new Claim(claimData);
    await claim.save();
    
    res.status(201).json({
      success: true,
      message: 'Claim created successfully',
      data: claim
    });
  } catch (error) {
    console.error('Create claim error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create claim'
    });
  }
};

// Get all claims with filtering and pagination
exports.getAllClaims = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      claimType,
      state,
      district,
      block,
      village,
      sortBy = 'submissionDate',
      sortOrder = 'desc',
      search
    } = req.query;
    
    // Build filter query
    const filter = {};
    
    if (status) filter.status = status;
    if (claimType) filter.claimType = claimType;
    if (state) filter['location.state'] = state;
    if (district) filter['location.district'] = district;
    if (block) filter['location.block'] = block;
    if (village) filter['location.village'] = village;
    
    // Search functionality
    if (search) {
      filter.$or = [
        { claimId: { $regex: search, $options: 'i' } },
        { 'claimantDetails.name': { $regex: search, $options: 'i' } },
        { 'location.village': { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    
    const claims = await Claim.find(filter)
      .populate('assignedOfficer', 'name email role')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    const totalClaims = await Claim.countDocuments(filter);
    const totalPages = Math.ceil(totalClaims / parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: {
        claims,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalClaims,
          hasNextPage: parseInt(page) < totalPages,
          hasPreviousPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get claims error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch claims'
    });
  }
};

// Get claim by ID
exports.getClaimById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid claim ID'
      });
    }
    
    const claim = await Claim.findById(id)
      .populate('assignedOfficer', 'name email role department')
      .populate('workflow.actionBy', 'name email role');
    
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: claim
    });
  } catch (error) {
    console.error('Get claim by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch claim'
    });
  }
};

// Update claim status
exports.updateClaimStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comments, actionBy } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid claim ID'
      });
    }
    
    const validStatuses = ['submitted', 'under_review', 'approved', 'rejected', 'pending_documents'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    const claim = await Claim.findById(id);
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }
    
    // Update status and add to workflow
    claim.status = status;
    
    // Set appropriate dates
    if (status === 'under_review') {
      claim.reviewDate = new Date();
    } else if (status === 'approved') {
      claim.approvalDate = new Date();
    } else if (status === 'rejected') {
      claim.rejectionDate = new Date();
      if (req.body.rejectionReason) {
        claim.rejectionReason = req.body.rejectionReason;
      }
    }
    
    // Add to workflow history
    claim.workflow.push({
      stage: status,
      action: `Status changed to ${status}`,
      actionBy: actionBy,
      actionDate: new Date(),
      comments: comments || ''
    });
    
    await claim.save();
    
    res.status(200).json({
      success: true,
      message: 'Claim status updated successfully',
      data: claim
    });
  } catch (error) {
    console.error('Update claim status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update claim status'
    });
  }
};

// Assign officer to claim
exports.assignOfficer = async (req, res) => {
  try {
    const { id } = req.params;
    const { officerId, assignedBy } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(officerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID provided'
      });
    }
    
    const claim = await Claim.findByIdAndUpdate(
      id,
      {
        assignedOfficer: officerId,
        $push: {
          workflow: {
            stage: 'assignment',
            action: 'Officer assigned',
            actionBy: assignedBy,
            actionDate: new Date(),
            comments: `Assigned to officer ID: ${officerId}`
          }
        }
      },
      { new: true }
    ).populate('assignedOfficer', 'name email role');
    
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Officer assigned successfully',
      data: claim
    });
  } catch (error) {
    console.error('Assign officer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign officer'
    });
  }
};

// Get claims by location
exports.getClaimsByLocation = async (req, res) => {
  try {
    const { state, district, block, village } = req.query;
    
    if (!state) {
      return res.status(400).json({
        success: false,
        message: 'State is required'
      });
    }
    
    const filter = { 'location.state': state };
    if (district) filter['location.district'] = district;
    if (block) filter['location.block'] = block;
    if (village) filter['location.village'] = village;
    
    const claims = await Claim.find(filter)
      .populate('assignedOfficer', 'name email')
      .sort({ submissionDate: -1 })
      .lean();
    
    // Group claims by status for summary
    const statusSummary = claims.reduce((acc, claim) => {
      acc[claim.status] = (acc[claim.status] || 0) + 1;
      return acc;
    }, {});
    
    res.status(200).json({
      success: true,
      data: {
        claims,
        summary: {
          totalClaims: claims.length,
          statusBreakdown: statusSummary
        }
      }
    });
  } catch (error) {
    console.error('Get claims by location error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch claims by location'
    });
  }
};

// Get claims within geographic bounds
exports.getClaimsInBounds = async (req, res) => {
  try {
    const { minLat, maxLat, minLng, maxLng } = req.query;
    
    if (!minLat || !maxLat || !minLng || !maxLng) {
      return res.status(400).json({
        success: false,
        message: 'All boundary coordinates are required'
      });
    }
    
    const claims = await Claim.find({
      'coordinates.latitude': {
        $gte: parseFloat(minLat),
        $lte: parseFloat(maxLat)
      },
      'coordinates.longitude': {
        $gte: parseFloat(minLng),
        $lte: parseFloat(maxLng)
      }
    })
    .select('claimId claimType status coordinates location.village landDetails.area submissionDate')
    .lean();
    
    res.status(200).json({
      success: true,
      data: claims
    });
  } catch (error) {
    console.error('Get claims in bounds error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch claims in bounds'
    });
  }
};

// Bulk update claims
exports.bulkUpdateClaims = async (req, res) => {
  try {
    const { claimIds, updates, actionBy } = req.body;
    
    if (!claimIds || !Array.isArray(claimIds) || claimIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Claim IDs array is required'
      });
    }
    
    // Validate all IDs
    const invalidIds = claimIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid claim IDs: ${invalidIds.join(', ')}`
      });
    }
    
    const updateDoc = { ...updates };
    
    // Add workflow entry if status is being updated
    if (updates.status) {
      updateDoc.$push = {
        workflow: {
          stage: updates.status,
          action: `Bulk update - Status changed to ${updates.status}`,
          actionBy: actionBy,
          actionDate: new Date(),
          comments: 'Bulk operation'
        }
      };
    }
    
    const result = await Claim.updateMany(
      { _id: { $in: claimIds } },
      updateDoc
    );
    
    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} claims updated successfully`,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    console.error('Bulk update claims error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk update claims'
    });
  }
};

// Delete claim
exports.deleteClaim = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid claim ID'
      });
    }
    
    const claim = await Claim.findByIdAndDelete(id);
    
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Claim deleted successfully'
    });
  } catch (error) {
    console.error('Delete claim error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete claim'
    });
  }
};