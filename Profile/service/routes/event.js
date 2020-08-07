const express = require("express");
const router = express.Router();
const passport = require("passport");
const util = require("util");
const url = require("url");
const querystring = require("querystring");
const DEBUG = process.env.DEBUG ? console.log : function () {};

/* 
      @TODO: document this end-point in more detail
*/
router.get('/',
  passport.authenticate("auth0", {
    scope: "openid profile email",
    audience: process.env.PROFILE_AUDIENCE
  })
);

/* 
      @TODO: document this end-point in more detail
*/
router.get('/callback',
  (req, res, next) => {
    var LOG_TAG = '[EVENT_CALLBACK]: ';
    passport.authenticate("auth0", (err, user, info) => {
      DEBUG(LOG_TAG, "Info =", info);
      DEBUG(LOG_TAG, "User =", user);
      DEBUG(LOG_TAG, "Err =", err);
      req.logIn(user, function (err) {
        const logoutURL = url.format({
          protocol: 'https',
          hostname: process.env.AUTH0_DOMAIN,
          pathname: '/logout',
          query: {
            client_id: process.env.AUTH0_CLIENT_ID,
            returnTo: process.env.AUTH0_CALLBACK + "/service/event/callout"
          }
        });
        DEBUG(LOG_TAG, "Err = ", err);
        DEBUG(LOG_TAG, "Logout URL = ", logoutURL);
        res.redirect(logoutURL);
      });
    }) (req, res, next);    
  }
);

/* 
      @TODO: document this end-point in more detail
*/
router.get('/callout',
  (req, res) => {
    var calloutURL = new URL(process.env.PROFILE_CLIENT + "/client");
    var LOG_TAG = '[EVENT_CALLOUT]: ';
    DEBUG(LOG_TAG, "User =", req.user);

    if (
      req.user &&
      req.user._json &&
      req.user._json[process.env.PROFILE_AUDIENCE + '/policy']) {
      var policy = JSON.parse(req.user._json[process.env.PROFILE_AUDIENCE + '/policy']);
      DEBUG(LOG_TAG, "policy =", policy);

      calloutURL.searchParams.set('connection', policy.connection);
      calloutURL.searchParams.set('login_hint', policy.login_hint);
      calloutURL.searchParams.set('prompt', policy.prompt);
    }

    DEBUG(LOG_TAG, "Callout URL = ", calloutURL);
    res.redirect(calloutURL);
  }
);


module.exports = router;