// routes/prospectiveLeads.js
const express = require('express');
const router = express.Router();

//utils
const verifyClientToken = require('../utils/verifyClientToken');

//controllers
const { submitForm, verifyPhone, getLeadStatus } = require('../controllers/clientController');

//verify-phone
router.post('/verify-phone', verifyPhone);

// Submit form (new lead)
router.post('/form/submit', submitForm);

router.get('/leads/status/:phone', verifyClientToken, getLeadStatus); 

module.exports = router;
