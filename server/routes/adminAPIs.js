const express = require('express');
const router = express.Router();

//utils
const verify = require('../utils/verify');

//controllers
const { getAllLeads, approveLead, rejectLead } = require('../controllers/leadController');
const { getAllProspectiveLeads, addProspectiveLead, updateLeadStatus } = require('../controllers/prospectiveLeadController');

// Routes for managing leads
router.get('/', verify, getAllLeads);
router.patch('/:id/approve', verify, approveLead);
router.patch('/:id/reject', verify, rejectLead);


// Routes for managing prospective leads
router.get('/prospective-leads', getAllProspectiveLeads);
router.post('/add', addProspectiveLead);
router.patch('/prospective-leads/:id/status', updateLeadStatus);

module.exports = router;
