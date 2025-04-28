// routes/prospectiveLeads.js
const express = require('express');
const router = express.Router();

//utils
const verifyClientToken = require('../utils/verifyClientToken');

//controllers
const { submitForm, verifyPhone, getLeadStatus, checkStatus, refreshToken } = require('../controllers/clientController');

//verify-phone
router.post('/verify-phone', verifyPhone);

// Submit form (new lead)
router.post('/form/submit', submitForm);

//check status value of phone
router.get('/leads/check-status/:phone', checkStatus);

//check lead status with signing of info as token 
router.get('/leads/status/:phone', verifyClientToken, getLeadStatus); 

//refresh token if status do not match
router.post('/refresh-token/:phone', refreshToken);

module.exports = router;
