const clickedcampaignsRoute = require('express').Router();
const { clickedCampaigns } = require('../controllers/clickedCampaignsController');
clickedcampaignsRoute.get('/:userAppKey/:email_Id/:redlinkurl',clickedCampaigns);

module.exports=clickedcampaignsRoute;