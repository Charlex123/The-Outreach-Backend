const labelRoute = require('express').Router();
const { create} = require('../controllers/label-conrtoller');
const isAuth = require('../middlewares/isAuth');
labelRoute.post('/create',isAuth, create);

module.exports=labelRoute;