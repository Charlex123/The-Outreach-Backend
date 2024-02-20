const getautofollowupmessageRoute = require('express').Router();
const { getAutoFollowUpMessage } = require('../controllers/getautofollowupmessageController');
getautofollowupmessageRoute.post('/getautofollowupmessage',getAutoFollowUpMessage);

module.exports=getautofollowupmessageRoute;