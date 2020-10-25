function VEAChange(user, context, callback) {
  /*
   * This rule (https://auth0.com/docs/rules) is intended to perform conditional 
   * processing in order to provide Verified Email Address Change. 
   * 
   * The rule utilises a corresponding Auth0 Profile Management Client: an interactive 
   * client which is used to perform specific profile management actions. The Profile 
   * Management Client definition in Auth0 describes security artefacts - e.g. 
   * grant types, secret, etc - which can be tightly controlled, reducing any 
   * potential for security compromise.
   * 
   * The concept of Policy is also employed. Policy provides context (in this 
   * implementation initially obtained from user `metadata`) and is 
   * encapsulated in a JWT for security. 
   */
  var ManagementClient = require('auth0@2.9.1').ManagementClient;
  var Promise = require('native-or-bluebird@1.2.0');
  var LOG_TAG = '[VERIFIED_EMAIL_ADDRESS_CHANGE]: ';
  var DEBUG = configuration.DEBUG ? console.log : function () {};
  var managementAPI = new ManagementClient({
    token: auth0.accessToken,
    domain: auth0.domain
  });

  // State Machine
  switch (context.protocol) {
    case 'redirect-callback': {
      LOG_TAG = LOG_TAG + '[REDIRECT_CALLBACK]: ';
      DEBUG(LOG_TAG, "context =", context.clientID);
      DEBUG(LOG_TAG, "Evaluating Email Change using ", user.user_id);
      if (
        context.request &&
        context.request.body &&
        context.request.body.companion) {
        Promise.resolve(global.verifyJWT(context.request.body.companion))
        .then(function (decoded) {
          LOG_TAG = LOG_TAG + '[EMAIL_CHANGE]: ';
          var policy = decoded[configuration.PROFILE_AUDIENCE + '/policy'];
          DEBUG(LOG_TAG, "Changing Email; policy = ", policy);
          policy = (policy) ? JSON.parse(policy) : {};

          /* Link accounts? */
          if (
            policy &&
            policy.email &&
            policy.email.change &&
            policy.email.change.email === user.email) {
            managementAPI.users.update({
              id: decoded.sub
            }, {
              'email': user.email,
              'email_verified': user.email_verified,
              'connection': policy.email.change.connection,
              'user_metadata': {
                'emailNew': null
              }
            })
            .then(function () {
              callback(null, user, context);
            })
            .catch(function (error) {
              console.error(LOG_TAG, "Error changing email = ", error);
              callback(new UnauthorizedError(0, error), user, context);
            });
          } else {
            DEBUG(LOG_TAG, "Incorrect companion; ignore");
	          callback(null, user, context);
          }
        })
        .catch(function (error) {
          console.error(LOG_TAG, error);
          callback(new UnauthorizedError(0, error), user, context);
      	});
      } else {
        DEBUG(LOG_TAG,"Skipped");
        callback(null, user, context);
      }
    } break;

    default: {
      DEBUG(LOG_TAG, "PROFILE_CLIENT = ", configuration.PROFILE_CLIENT);
      DEBUG(LOG_TAG, "EMAIL_CLIENT = ", configuration.EMAIL_CLIENT);
      DEBUG(LOG_TAG, "context =", context.clientID);
      switch(context.clientID) {
        case configuration.PROFILE_CLIENT:
        case configuration.EMAIL_CLIENT: {
          LOG_TAG = LOG_TAG + '[PROFILE]: ';
		      user.app_metadata = user.app_metadata || {};
          user.user_metadata = user.user_metadata || {};
          Promise.resolve(new 
          Promise(function (resolve, reject) {
            context.request.query = context.request.query || {}; 
            DEBUG(LOG_TAG, "PROFILE_AUDIENCE = ", configuration.PROFILE_AUDIENCE);
            DEBUG(LOG_TAG, "audience =", context.request.query.audience);
            switch (context.request.query.audience) {
              case configuration.PROFILE_AUDIENCE: {
                LOG_TAG = LOG_TAG + '[PROFILE_AUDIENCE]: ';
                DEBUG(LOG_TAG, "Evaluating for ", user.email);
                switch (context.connection) {
                  case "email": {
                    LOG_TAG = LOG_TAG + '[EMAIL]: ';
                    managementAPI.getUsers({
                      search_engine: 'v3',
                      fields: "user_id,email,identities",
                      include_fields: true,  
                      q: "user_metadata.emailNew:" + user.email
                    })
                    .then(function (users) {
                      users.forEach(function (_user) {
                        DEBUG(LOG_TAG,"User = ", _user);
                        DEBUG(LOG_TAG,"Processing identities");
                        _user.identities.forEach(function (identity) {
                          DEBUG(LOG_TAG,"Identity=",identity);
                          if (identity.provider === 'auth0') {
                            user.app_metadata.policy = 
                            user.app_metadata.policy || {};

                            user.app_metadata.policy.email = 
                            user.app_metadata.policy.email || {};
                            user.app_metadata.policy.email.change = true;
                            user.app_metadata.policy.email.companion = _user.user_id;

                            user.app_metadata.policy.login_hint = _user.email;
                            
                            user.app_metadata.policy.connection =
                            user.app_metadata.policy.connection || [];
                            user.app_metadata.policy.connection.
                              push(identity.connection);
                              
                            context.idToken[configuration.PROFILE_AUDIENCE + '/policy'] =
                              	JSON.stringify(user.app_metadata.policy);
                          } 
                        });
                      });
                      resolve();
                    })
                    .catch(function (error) {
                      reject(error);
                    });
                  } break;

                  default:{
                    if (user.user_metadata.emailNew) {
                      user.app_metadata.policy = 
                      user.app_metadata.policy || {};
                      
                      user.app_metadata.policy.email = 
                      user.app_metadata.policy.email || {};
                      user.app_metadata.policy.email.change = 
                      user.app_metadata.policy.email.change || {};
                      user.app_metadata.policy.email.change.email = user.user_metadata.emailNew;
                      user.app_metadata.policy.email.change.connection = context.connection;

                      context.idToken[configuration.PROFILE_AUDIENCE + '/policy'] = 
                      context.accessToken[configuration.PROFILE_AUDIENCE + '/policy'] = 
                        JSON.stringify(user.app_metadata.policy);
                    } 
                    resolve();
                  } break;
                }
              } break;

              default: {
                switch (context.connection) {
                  case "email": {
                    // Email Change Event detected?
                    DEBUG(LOG_TAG,"Evaluating for Email Address Change");
                    managementAPI.getUsers({
                      search_engine: 'v3',
                      fields: "user_id",
                      include_fields: true,  
                      q: "user_metadata.emailNew:" + user.email
                    })
                    .then(function (users) {
                      users.forEach(function (_user) {
                        DEBUG(LOG_TAG,"User = ", _user);
                        DEBUG(LOG_TAG,"Initiating Email Change trigger");
                        context.redirect = context.redirect || {};
                        context.redirect.url = configuration.PROFILE_REDIRECT + '/client';
                      });
                      resolve();
                    })
                    .catch(function (error) {
                      reject(error);
                    });
                  } break;

                  default:{
                    DEBUG(LOG_TAG, "Processing Email Companion");
                    resolve();
                  } break;
                }
              } break;
            }
          }))
          .then(function () {
            DEBUG(LOG_TAG,"Computed Policy = ", user.app_metadata.policy);
            callback(null, user, context);
          })
          .catch(function (error) {
            console.error(LOG_TAG, error);
            callback(new UnauthorizedError(0, error), user, context);
          });
        } break;
          
        default: {
          callback(null, user, context);
        } break;
      }
    } break;
  }
}