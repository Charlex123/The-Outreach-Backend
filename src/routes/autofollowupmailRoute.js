const autofollowupcampaignRoute = require('express').Router();
const { autofollowUpCampaign } = require('../controllers/sendautofollowupEmail.js');
autofollowupcampaignRoute.post('/sendautofollowup',autofollowUpCampaign);

module.exports=autofollowupcampaignRoute;