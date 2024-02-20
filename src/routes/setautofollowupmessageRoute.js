const setautofollowupmessageRoute = require('express').Router();
const { setAutoFollowUpMessage } = require('../controllers/setautofollowupMessageController');
setautofollowupmessageRoute.post('/setautofollowupmessage',setAutoFollowUpMessage);

module.exports=setautofollowupmessageRoute;