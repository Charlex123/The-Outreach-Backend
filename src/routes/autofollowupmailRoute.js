const autofollowupcampaignRoute = require('express').Router();
const { autofollowUpCampaign } = require('../controllers/sendautofollowupEmail');
autofollowupcampaignRoute.get('/:sendautofollowup',autofollowUpCampaign);

module.exports=autofollowupcampaignRoute;