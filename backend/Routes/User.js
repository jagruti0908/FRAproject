const express = require('express');
const router = express.Router();
const userController = require('../Controllers/user.js');

// Create new user (registration)
router.post('/register', userController.createUser);

// Login user
router.post('/login', userController.loginUser);

// Get all users with filtering
router.get('/', userController.getAllUsers);

// Get user by ID
router.get('/:id', userController.getUserById);

// Update user
router.put('/:id', userController.updateUser);

// Change user password
router.patch('/:id/change-password', userController.changePassword);

// Toggle user active status
router.patch('/:id/toggle-status', userController.toggleUserStatus);

// Get users by role
router.get('/role/:role', userController.getUsersByRole);

// Get user statistics
router.get('/analytics/statistics', userController.getUserStatistics);

// Delete user
router.delete('/:id', userController.deleteUser);

module.exports = router;