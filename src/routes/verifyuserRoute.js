const verifyuserRoute = require('express').Router();
const { verifyUser, verifyUserData} = require('../controllers/verifyuserController');
verifyuserRoute.post('/verifyuser',verifyUser);
verifyuserRoute.post('/verifyuserdata',verifyUserData);

module.exports=verifyuserRoute;