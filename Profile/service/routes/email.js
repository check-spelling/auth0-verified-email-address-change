// https://github.com/auth0/node-auth0#management-api-client; documentation here: http://auth0.github.io/node-auth0/
var UnauthorizedError = require('express-jwt').UnauthorizedError;
var ManagementClient = require('auth0').ManagementClient;
var express = require('express');
var router = express.Router();
const jwksRsa = require('jwks-rsa');
const DEBUG = process.env.DEBUG ? console.log : function () {};
var guard = require('express-jwt-permissions')({ // Verify Scope default
  permissionsProperty: 'scope',
  requestProperty: 'auth'
});
var managementAPI = new ManagementClient({ // Auth0 Management library API
  'clientSecret': process.env.AUTH0_CLIENT_SECRET,
  'clientId': process.env.AUTH0_CLIENT_ID,
  domain: process.env.AUTH0_API,
  scope: "update:users delete:users"
});

/* OPTIONS */
router.options('/', function (_req, res) {
  res.writeHead(204, {
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    'Access-Control-Allow-Methods': 'PATCH',
    /* Uncomment to allow access from any origin; usefull for debugging */
    //    'Access-Control-Allow-Origin': '*'
  });
  res.end();
});

/*  PATCH: execute email update operations as described in the Policy document supplied. A Policy document is provided in 
    the Header by way of an Authorization Bearer JWT; this end-point will typically take the policy document supplied and 
    execute email update based on the logic implemented. 
*/
router.patch('/',
  guard.check(['update:email']), // Verify Scope
  function (req, res) {
    var LOG_TAG = '[EMAIL_PATCH]: ';
    DEBUG(LOG_TAG, "Auth =", req.auth);
    DEBUG(LOG_TAG, "User =", req.user);
    Promise.resolve(new 
    Promise(function (resolve, reject) {
      /* Execute on policy for Email Update

              @TODO: document this in more detail
      */
      var policy = JSON.parse(req.auth[process.env.PROFILE_AUDIENCE + '/policy']);
      DEBUG(LOG_TAG,"Auth Policy = ",policy);
      if (req.user &&
          policy.email &&
          policy.email.change) {
        var connection = policy.connection;
        var policy = JSON.parse(req.user._json[process.env.PROFILE_AUDIENCE + '/policy']);
        DEBUG(LOG_TAG,"User Policy = ",policy);
        if (
          policy.email &&
          policy.email.companion &&
          policy.email.companion == req.auth.sub) {
          DEBUG(LOG_TAG, "Executing Email Update for ", req.auth.sub);
          managementAPI.users.update({
            id: req.auth.sub
          }, {
            'email': req.user._json.email,
            'email_verified': req.user._json.email_verified,
            'connection': connection,
            'user_metadata': {
              'emailNew': null
            }
          })
          .then(function () {
            // Delete the companion as it's no longer required.
            DEBUG(LOG_TAG, "Deleting companion ", req.user.id);
            managementAPI.users.delete({
              "id": req.user.id
            })
            .then(function () {
              res.json({error: 0});
              resolve();
            })
            .catch(function (){
              // Ignore error deleting companion
              res.json({error: 0});
              resolve();
            });              
          })
          .catch(function (error) {
            reject(new UnauthorizedError(0, error));
          });
        } else {
          reject(new UnauthorizedError(0, {message: "Invalid request"}));
        }
      } else {
        reject(new UnauthorizedError(0, {message: "Invalid request"}));
      }
    }))
    .catch(function (error) {
      console.error(error);
      res.status(error.status || 401).send(error);
    });
  });

module.exports = router;