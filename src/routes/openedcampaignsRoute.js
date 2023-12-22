const openedcampaignsRoute = require('express').Router();
const { openedCampaigns } = require('../controllers/openedCampaignsController');
openedcampaignsRoute.get('/:userAppKey/:campaignId',openedCampaigns);

module.exports=openedcampaignsRoute;