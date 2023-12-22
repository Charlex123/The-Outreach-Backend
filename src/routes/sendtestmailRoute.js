const sendtestmailRoute = require('express').Router();
const { testMail } = require('../controllers/sendtestMail');
sendtestmailRoute.post('/sendtestemail',testMail);

module.exports=sendtestmailRoute;