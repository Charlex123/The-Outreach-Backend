const opencampaigncountRoute = require('express').Router();
const { getOpenCampaignCount } = require('../controllers/campaignopenscountController');
opencampaigncountRoute.post('/openscount',getOpenCampaignCount);

module.exports=opencampaigncountRoute;