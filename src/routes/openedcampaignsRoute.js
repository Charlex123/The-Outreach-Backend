const openedcampaignsRoute = require('express').Router();
const { openedCampaigns } = require('../controllers/openedCampaignsController');
openedcampaignsRoute.get('/:userAppKey/:email_Id',openedCampaigns);

module.exports=openedcampaignsRoute;