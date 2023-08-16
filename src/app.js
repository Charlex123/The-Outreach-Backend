const express = require('express');
const path = require('path');
const dotenv = require('dotenv')
dotenv.config()
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require ('cors');
const Db = require('./config/db');

// ::::::::::::: Database ::::::::::::::::::::

Db.then(
  () => console.log('Db Connected'),
  err => console.log(err)
)


const app = express();


// ::::::::::::: Middlewares ::::::::::::::::::::
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

 // enable cors
// ::::::::::::::End of Middlewares::::::::::::::

// ::::::::::::: Controllers ::::::::::::::::::::
const { googleOathController } = require('./controllers/auth/googleOauth2/googleOuath');
const { Emailtracking } = require('./controllers/Emailtracking/index');
// ::::::::::::::End of Controllers::::::::::::::

// ::::::::::::: Routes ::::::::::::::::::::
const scheduleRoute = require('./routes/sheduleRoute');
const labelRoute= require('./routes/labelRoute')
const authenticateuserRoute= require('./routes/verifyuserRoute')
const checkfirstmailcampaign_Route = require('./routes/checkfirstmailcampaignRoute')
const { cron } = require('./service/email/cron');
const config = require('./config');
// ::::::::::::::End of Routes::::::::::::::


// ::::::::::::::End of Database::::::::::::::

// initailize google oath controller
googleOathController(app)
Emailtracking(app)
app.use('/schedule', scheduleRoute);

app.use('/label',labelRoute );
app.use('/user',authenticateuserRoute );
app.use('/campaigns',checkfirstmailcampaign_Route );
app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});
module.exports = app;
