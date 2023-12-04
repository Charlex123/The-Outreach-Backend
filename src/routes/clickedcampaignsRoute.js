const clickedcampaignsRoute = require('express').Router();
const { clickedCampaigns } = require('../controllers/clickedCampaignsController');
clickedcampaignsRoute.get('/:userAppKey/:campaignId/:redlinkurl',clickedCampaigns);

module.exports=clickedcampaignsRoute;