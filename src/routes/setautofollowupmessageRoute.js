const autofollowupcampaignRoute = require('express').Router();
const { setAutoFollowUpMessage } = require('../controllers/setautofollowupMessageController');
autofollowupcampaignRoute.post('/setautofollowupmessage',setAutoFollowUpMessage);

module.exports=autofollowupcampaignRoute;