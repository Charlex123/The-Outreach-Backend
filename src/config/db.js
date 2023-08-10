const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()
const config = require ("./index");
// console.log(config)
const Db = mongoose.connect(config.DATABASE_URL,{
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
 );
 module.exports = Db


