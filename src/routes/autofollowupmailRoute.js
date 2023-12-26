const autofollowupcampaignRoute = require('express').Router();
const { autofollowUpCampaign } = require('../controllers/sendautofollowupEmail.js');
autofollowupcampaignRoute.get('/:sendautofollowup',autofollowUpCampaign);

module.exports=autofollowupcampaignRoute;