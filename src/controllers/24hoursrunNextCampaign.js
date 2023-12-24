require("express");
const asyncHandler = require("express-async-handler");
const campaignSchema = require('../model/campaignSchema');
const DraftSchema = require("../model/DraftSchema");
const autofollowSchema = require("../model/autofollowSchema");
const scheduleSchema = require("../model/scheduleSchema");
const sendscheduleCamp = require("./sendscheduleCampaign");
const firstreportsentSchema = require("../model/firstreportsentSchema");
const User = require("../model/user");
const { google } = require('googleapis');
const moment = require('moment');
const dotenv = require('dotenv');
const config = require('../config');
const nodemailer = require("nodemailer");
const cron = require("node-cron");
const v4 = require("uuid");