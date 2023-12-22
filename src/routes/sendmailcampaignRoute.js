const sendmailcampaignRoute = require('express').Router();
const { mailCampaign } = require('../controllers/sendmailCampaign');
sendmailcampaignRoute.post('/sendemailcampaign',mailCampaign);

module.exports=sendmailcampaignRoute;