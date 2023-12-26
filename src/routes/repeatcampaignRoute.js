const repeatcampaignRoute = require('express').Router();
const { repeatCampaign } = require('../controllers/repeatcampaignController');
repeatcampaignRoute.get('/:repeatcampaign',repeatCampaign);

module.exports=repeatcampaignRoute;