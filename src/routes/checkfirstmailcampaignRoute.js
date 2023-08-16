const checkfirstmailcampaignRoute = require('express').Router();
const { checkfirstmailCampaign } = require('../controllers/checkfirstmailcampaignController');
checkfirstmailcampaignRoute.post('/checkfirstmailcampaign',checkfirstmailCampaign);

module.exports=checkfirstmailcampaignRoute;