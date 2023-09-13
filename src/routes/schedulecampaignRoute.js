const schedulecampaignRoute = require('express').Router();
const { scheduleCampaign } = require('../controllers/sendscheduleCampaign.js');
schedulecampaignRoute.post('/sendschedule',scheduleCampaign);

module.exports=schedulecampaignRoute;