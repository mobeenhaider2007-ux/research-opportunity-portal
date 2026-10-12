const express = require('express');
const router = express.Router();
const opportunityController = require('../controllers/opportunityController');

// Retrieve all opportunities / search
router.get('/', opportunityController.getAllOpportunities);

// Retrieve a single opportunity by ID
router.get('/:id', opportunityController.getOpportunityById);

// Create a new opportunity
router.post('/', opportunityController.createOpportunity);

// Update an existing opportunity / toggle status
router.put('/:id', opportunityController.updateOpportunity);

// Delete an opportunity by ID
router.delete('/:id', opportunityController.deleteOpportunity);

module.exports = router;
