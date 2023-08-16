
const dotenv = require ("dotenv");
module.exports = {
DATABASE_URL:process.env.PRODUCTION_DATABASE_URL,
redirect_uris:process.env.PRODUCTION_REDIRECT_URIS,
BACKEND_URL:process.env.PRODUCTION_URL_BACKEND,
FRONTEND_URL:process.env.PRODUCTION_URL_FRONTEND,
redirect_uris:process.env.PRODUCTION_REDIRECT_URIS,
appSecret:process.env.PRODUCTION_APP_SECRET,
port:process.env.PRODUCTION_PORT,
TRACKING_URL:process.env.PRODUCTION_TRACKING_URL,
};
// console.log('prod ',FRONTEND_URL)
console.log("running production mode");
