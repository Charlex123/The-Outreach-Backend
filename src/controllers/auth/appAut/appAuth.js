const appAuth = (app) => {

    app.get('/auth/app', (req, res) => {
        // const authUrl = getAuthUrl();
        // res.redirect(authUrl);
        res.status(200).json({
            code:"200",
            message: "Auth successful"
        })
    })
   
}

module.exports = { appAuth }