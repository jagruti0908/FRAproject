const express = require('express');
const router = express.Router();
const claimController = require('../Controllers/Claim.js');

// Create new claim
router.post('/', claimController.createClaim);

// Get all claims with filtering and pagination
router.get('/', claimController.getAllClaims);

// Get claim by ID
router.get('/:id', claimController.getClaimById);

// Update claim status
router.patch('/:id/status', claimController.updateClaimStatus);

// Assign officer to claim
router.patch('/:id/assign', claimController.assignOfficer);

// Get claims by location
router.get('/location/filter', claimController.getClaimsByLocation);

// Get claims within geographic bounds
router.get('/location/bounds', claimController.getClaimsInBounds);

// Bulk update claims
router.patch('/bulk-update', claimController.bulkUpdateClaims);

// Delete claim
router.delete('/:id', claimController.deleteClaim);

module.exports = router;