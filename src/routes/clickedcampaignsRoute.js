const clickedcampaignsRoute = require('express').Router();
const { clickedCampaigns } = require('../controllers/clickedCampaignsController');
clickedcampaignsRoute.get('/:userAppKey/:campaignId/:messageId/:redlinkurl',clickedCampaigns);

module.exports=clickedcampaignsRoute;