const dotenv = require ("dotenv");
dotenv.config();
module.exports = {
DATABASE_URL:process.env.DATABASE_URL,
redirect_uris:process.env.redirect_uris,
BACKEND_URL:process.env.DEVELOPMENT_URL_BACKEND,
redirect_uris:process.env.redirect_uris,
FRONTEND_URL:process.env.DEVELOPMENT_URL_FRONTEND,
appSecret:process.env.DEVELOPMENT_APP_SECRET,
port:process.env.DEVELOPMENT_PORT,
TRACKING_URL:process.env.DEVELOPMENT_TRACKING_URL,
};
// console.log('local ', FRONTEND_URL)
console.log("running local mode");
