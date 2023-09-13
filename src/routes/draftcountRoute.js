const draftscountRoute = require('express').Router();
const { getDraftCount } = require('../controllers/draftscountController');
draftscountRoute.post('/draftscount',getDraftCount);

module.exports=draftscountRoute;