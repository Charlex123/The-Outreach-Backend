
const { Router } = require("express");
const scheduleRoute = Router()
const { create} = require("../controllers/shedule/index");
const isAuth = require('../middlewares/isAuth')

scheduleRoute.post('/create',isAuth,create)
module.exports = scheduleRoute;

