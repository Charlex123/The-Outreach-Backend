const { verifyAppAccessToken } = require('../utils');
const dotenv = require('dotenv').config()
const User = require('../model/user');

const isAuth =  async (req, res, next) => {
  try {
   
    const IcomUserAppKey = req.headers.authorization?.split(`Bearer `)[1];
    let user = await User.findOne({ userAppKey: IcomUserAppKey });
    console.log(user)
    if(!user)return res.status(401).json({ code: 401, message: 'Unauthorized' });
    const verifyStatus = verifyAppAccessToken(IcomUserAppKey,user.userAppKey);
    if(!verifyStatus)return  res.status(401).json({ code: 401, message: 'Unauthorized' });
    req.user = user
   next()
  } catch (error) {
    res.status(401).json({ code: 401, message: 'Unauthorized' });
    // next(error)
  }
 
};

module.exports = isAuth;
