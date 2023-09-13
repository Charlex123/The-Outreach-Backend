const campaigndetailsRoute = require('express').Router();
const { getCampaignDetails } = require('../controllers/campaigndetailsController');
campaigndetailsRoute.post('/campaignsdetails',getCampaignDetails);

module.exports=campaigndetailsRoute;