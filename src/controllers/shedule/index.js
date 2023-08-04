const Campaign = require('../../model/campaignSchema');
const moment = require('moment');
const JobValidator = require('../../utils/validation');
const { convertToTimezone } = require('../../utils');
const { lte } = require('lodash');

const create = async (req, res) => {
  try {

    const{
        nextRun,
        days,
        start,
        end,
        tracking,
        emailList,
        action,
        autofollowup,
        schedule,
        
    }=req.body

    const campaign = {
        userId:req.user._id,
        lastRun:null,
        nextRun,
        days,
        start,
        end,
        tracking,
        emailList,
        action,
        autofollowup,
        schedule
    }
    const newSchedule = await Campaign.create(campaign);
    res.status(201).json(newSchedule);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { create };
