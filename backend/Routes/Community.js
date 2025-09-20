const express = require('express');
const router = express.Router();
const Claim = require('../models/Claim.js');
const mongoose = require('mongoose');

// Get claim status by claim ID (public endpoint for community)
router.get('/claim-status/:claimId', async (req, res) => {
  try {
    const { claimId } = req.params;
    
    const claim = await Claim.findOne({ claimId })
      .select('claimId status submissionDate reviewDate approvalDate rejectionDate rejectionReason workflow')
      .populate('workflow.actionBy', 'name role')
      .lean();
    
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }
    
    // Filter workflow to show only relevant information to community
    const publicWorkflow = claim.workflow.map(item => ({
      stage: item.stage,
      action: item.action,
      actionDate: item.actionDate,
      actionBy: item.actionBy ? item.actionBy.name : 'System',
      comments: item.comments
    }));
    
    res.status(200).json({
      success: true,
      data: {
        claimId: claim.claimId,
        status: claim.status,
        submissionDate: claim.submissionDate,
        reviewDate: claim.reviewDate,
        approvalDate: claim.approvalDate,
        rejectionDate: claim.rejectionDate,
        rejectionReason: claim.rejectionReason,
        workflow: publicWorkflow
      }
    });
  } catch (error) {
    console.error('Get claim status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch claim status'
    });
  }
});

// Get claims by claimant phone number (for community members)
router.get('/my-claims/:phoneNumber', async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }
    
    const claims = await Claim.find({
      'claimantDetails.phoneNumber': phoneNumber
    })
    .select('claimId claimType status submissionDate approvalDate rejectionDate landDetails.area location')
    .sort({ submissionDate: -1 })
    .lean();
    
    const summary = {
      totalClaims: claims.length,
      approved: claims.filter(c => c.status === 'approved').length,
      rejected: claims.filter(c => c.status === 'rejected').length,
      pending: claims.filter(c => ['submitted', 'under_review', 'pending_documents'].includes(c.status)).length
    };
    
    res.status(200).json({
      success: true,
      data: {
        claims,
        summary
      }
    });
  } catch (error) {
    console.error('Get my claims error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch claims'
    });
  }
});

// Submit feedback on claim processing
router.post('/feedback', async (req, res) => {
  try {
    const { claimId, rating, comments, contactInfo } = req.body;
    
    if (!claimId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Claim ID and rating are required'
      });
    }
    
    // In a real implementation, this would be stored in a feedback collection
    // For hackathon, we'll just return success
    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: {
        claimId,
        rating,
        comments,
        submittedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback'
    });
  }
});

// Get village-level statistics (public)
router.get('/village-stats', async (req, res) => {
  try {
    const { state, district, block, village } = req.query;
    
    if (!village) {
      return res.status(400).json({
        success: false,
        message: 'Village parameter is required'
      });
    }
    
    const filter = {
      'location.state': state,
      'location.district': district,
      'location.block': block,
      'location.village': village
    };
    
    const stats = await Claim.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
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
    
    const claimTypeBreakdown = await Claim.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$claimType',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        village: village,
        statistics: stats[0] || {
          totalClaims: 0,
          approvedClaims: 0,
          rejectedClaims: 0,
          pendingClaims: 0,
          totalArea: 0,
          approvedArea: 0
        },
        claimTypeBreakdown: claimTypeBreakdown.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Get village stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch village statistics'
    });
  }
});

// Get frequently asked questions
router.get('/faq', (req, res) => {
  const faq = [
    {
      question: "What is FRA?",
      answer: "The Forest Rights Act (FRA) 2006 is a legislation that recognizes the rights of forest-dwelling communities over land and forest resources."
    },
    {
      question: "How can I check my claim status?",
      answer: "You can check your claim status by entering your claim ID in the claim status checker or by providing your registered phone number."
    },
    {
      question: "What documents are required for FRA claims?",
      answer: "Required documents include residence proof, cultivation proof, identity proof, and survey settlement records."
    },
    {
      question: "How long does the approval process take?",
      answer: "The approval process typically takes 6-12 months, depending on the complexity of the claim and verification requirements."
    },
    {
      question: "Who can I contact for help with my claim?",
      answer: "You can contact your local forest officer or the designated FRA committee members in your area for assistance."
    }
  ];
  
  res.status(200).json({
    success: true,
    data: faq
  });
});

// Get contact information for support
router.get('/support-contacts', (req, res) => {
  const { state, district } = req.query;
  
  // This would typically come from a database
  const supportContacts = {
    "Madhya Pradesh": {
      stateOffice: {
        phone: "+91-755-2661004",
        email: "fra.mp@gov.in",
        address: "Forest Department, Vallabh Bhawan, Bhopal"
      },
      districtContacts: {
        "Bhopal": {
          phone: "+91-755-2661005",
          email: "fra.bhopal@gov.in"
        }
      }
    },
    "Odisha": {
      stateOffice: {
        phone: "+91-674-2393471",
        email: "fra.odisha@gov.in",
        address: "Forest Department, Aranya Bhawan, Bhubaneswar"
      }
    }
  };
  
  res.status(200).json({
    success: true,
    data: supportContacts[state] || {
      message: "Contact information not available for this state"
    }
  });
});

module.exports = router;