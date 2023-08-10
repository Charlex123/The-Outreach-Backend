const labelRoute = require('express').Router();
const { create} = require('../controllers/label-controller');
const isAuth = require('../middlewares/isAuth');
labelRoute.post('/create',isAuth, create);

module.exports=labelRoute;