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
const labelRoute = require('./routes/labelRoute')
const sendmailcampaignRoute = require('./routes/sendmailcampaignRoute')
const sendtestmailRoute = require('./routes/sendtestmailRoute')
const autofollowupcampaignRoute = require('./routes/autofollowupmailRoute')
const schedulecampaignRoute = require('./routes/schedulecampaignRoute')
const authenticateuserRoute = require('./routes/verifyuserRoute') 
const openedcampaignsRoute = require('./routes/openedcampaignsRoute')
const clickedcampaignsRoute = require('./routes/clickedcampaignsRoute')
const checkfirstmailcampaign_Route = require('./routes/checkfirstmailcampaignRoute')
const campaigndetailsRoute = require('./routes/campaigncountRoute')
const opencampaigncountRoute = require('./routes/opencampaigncountRoute')
const draftcountRoute = require('./routes/draftcountRoute')
const { cron } = require('./service/email/cron');
const config = require('./config');
// ::::::::::::::End of Routes::::::::::::::


// ::::::::::::::End of Database::::::::::::::

// initailize google oath controller

googleOathController(app)
Emailtracking(app);
app.use('/label',labelRoute );
app.use('/testmails',sendtestmailRoute );
app.use('/campaigns',sendmailcampaignRoute );
app.use('/campaigns',autofollowupcampaignRoute );
app.use('/campaigns',schedulecampaignRoute );
app.use('/user',authenticateuserRoute );
app.use('/campaignopens',openedcampaignsRoute );
app.use('/campaignclicks',clickedcampaignsRoute );
app.use('/campaigns',campaigndetailsRoute );
app.use('/campaigns',opencampaigncountRoute );
app.use('/campaigns',draftcountRoute );
app.use('/campaigns',checkfirstmailcampaign_Route );
app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});
module.exports = app;
