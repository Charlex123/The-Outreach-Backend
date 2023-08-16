const verifyuserRoute = require('express').Router();
const { verifyUser} = require('../controllers/verifyuserController');
verifyuserRoute.post('/verifyuser',verifyUser);

module.exports=verifyuserRoute;