process.env.JWKSCACHE_MAX_ENTRIES = process.env.JWKSCACHE_MAX_ENTRIES || 5; // Max entries in JWKS cache
process.env.JWKSCACHE_MAX_AGE = process.env.JWKSCACHE_MAX_AGE || 36000000; 	// 10 Hours in miliseconds
process.env.PROFILE_TOLERANCE = process.env.PROFILE_TOLERANCE || 5; 		// Default 5 second POLICY tolerance (for clock skew)
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var express = require('express');
var logger = require('morgan');
var cors = require('cors');
var app = express();
var jwt = require('express-jwt'); 						/* https://github.com/auth0/express-jwt */
var passport = require("passport");
const DEBUG = process.env.DEBUG ? console.log : function () {};
const Auth0Strategy = require("passport-auth0");
const expressSession = require("express-session");
const jwksRsa = require('jwks-rsa');
const router = express.Router();

app.use(logger('dev'));
app.use(cookieParser());
app.use(expressSession({
  secret: process.env.AUTH0_CLIENT_SECRET,
  saveUninitialized: false,
  resave: true
}));

/* By default, prefer to ensure all routes are implicitly secure and that specific routes 
   must be explicitly excluded from security checks
*/
app.use(jwt({
	requestProperty: 'auth',
	clockTolerance: process.env.PROFILE_TOLERANCE,
	/* Dynamically provide signing key based on the key-id (kid) in the header and the signing 
	 keys provided by the JSON Web Key Set (JWKS) end-point. For details regarding 
	 JWKS see https://auth0.com/docs/jwks; for details on using jwksRsa see:
	 https://github.com/auth0/node-jwks-rsa/tree/master/examples/express-demo
	*/
	secret: jwksRsa.expressJwtSecret({
		strictSsl: true, 				// Default value
		rateLimit: true,
		cache: true,
		cacheMaxAge: process.env.JWKSCACHE_MAX_AGE,
		cacheMaxEntries: process.env.JWKSCACHE_MAX_ENTRIES,
		jwksUri: 'https://' + process.env.AUTH0_DOMAIN + '/.well-known/jwks.json',
		handleSigningKeyError: (err, cb) => {
			console.error("Invalid signature for ", process.env.AUTH0_DOMAIN);
			return cb(err);
		}
	}),
	audience: process.env.PROFILE_AUDIENCE,
	issuer: 'https://' + process.env.AUTH0_DOMAIN + '/'
}).unless({
	// Explicitly exclude the following routes from security checking
	path: [
		'/Profile/service/event/callback',
		'/Profile/service/event/callout',
		'/Profile/service/event',
	]
}));

passport.use(new Auth0Strategy({
	domain: process.env.AUTH0_DOMAIN,
	clientID: process.env.AUTH0_CLIENT_ID,
	clientSecret: process.env.AUTH0_CLIENT_SECRET,
	callbackURL: process.env.AUTH0_CALLBACK + "/service/event/callback"},
	function(accessToken, refreshToken, extraParams, profile, done) {
    var LOG_TAG = '[AUTH]: ';

		/**
		 * accessToken is the token to call the Auth0 API or a secured third-party API
		 * extraParams.id_token has the JSON Web Token
		 * profile has all the information from the user
		 */
		DEBUG(LOG_TAG, "extraParams =", extraParams);
		DEBUG(LOG_TAG, "Profile =", profile);

		return done(null, profile);
	}
));

passport.serializeUser((user, done) => {
  var LOG_TAG = '[AUTH]: ';
	DEBUG(LOG_TAG, "Serializing User");

  done(null, user);
});

passport.deserializeUser((user, done) => {
  var LOG_TAG = '[AUTH]: ';
	DEBUG(LOG_TAG, "Deserializing User");

	done(null, user);
});

app.use(passport.initialize());
app.use(passport.session());

app.use('/', router);
app.use('/Profile/service/event', require('./routes/event'));
app.use('/Profile/service/email', require('./routes/email'));

//catch 404 and forward to error handler
//app.use(function(req, res, next) {
//  next(createError(404));
//});

module.exports = app;