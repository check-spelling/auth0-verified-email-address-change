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
      DEBUG(LOG_TAG, "(redirect-callback); context =", context.clientID);
      callback(null, user, context);
    } break;

    default: {
      DEBUG(LOG_TAG, "PROFILE_SERVICE = ", configuration.PROFILE_SERVICE);
      DEBUG(LOG_TAG, "PROFILE_CLIENT = ", configuration.PROFILE_CLIENT);
      DEBUG(LOG_TAG, "context =", context.clientID);
      switch(context.clientID) {
        case configuration.PROFILE_SERVICE:
        case configuration.PROFILE_CLIENT: {
          LOG_TAG = LOG_TAG + '[PROFILE]: ';
		      user.app_metadata = user.app_metadata || {};
          user.user_metadata = user.user_metadata || {};
          Promise.resolve(new 
          Promise(function (resolve, reject) {
            DEBUG(LOG_TAG, "PROFILE_AUDIENCE = ", configuration.PROFILE_AUDIENCE);
            DEBUG(LOG_TAG, "audience =", context.request.query.audience);
            switch (context.request.query.audience) {
              case configuration.PROFILE_AUDIENCE: {
                LOG_TAG = LOG_TAG + '[PROFILE_AUDIENCE]: ';
                switch (context.connection) {
                  case "email": {
                    DEBUG(LOG_TAG, "Evaluating Email Address Change event for ", 
                      user.email);
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
                            user.app_metadata.policy.email.companion = _user.user_id;

                            user.app_metadata.policy.login_hint = _user.email;
                            
                            user.app_metadata.policy.connection =
                            user.app_metadata.policy.connection || [];
                            user.app_metadata.policy.connection.
                              push(identity.connection);
                              
                            context.idToken[
                              configuration.PROFILE_AUDIENCE + '/policy'] =
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
                    DEBUG(LOG_TAG, "Evaluating Email Address Change for ", 
                      user.email);
                    if (user.user_metadata.emailNew) {
                      user.app_metadata.policy = 
                      user.app_metadata.policy || {};
                      
                      user.app_metadata.policy.email = 
                      user.app_metadata.policy.email || {};
                      user.app_metadata.policy.email.change = true;

                      user.app_metadata.policy.connection = context.connection;
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
                    // Event trigger required?
                    DEBUG(LOG_TAG,"Evaluating Event trigger");
                    managementAPI.getUsers({
                      search_engine: 'v3',
                      fields: "user_id",
                      include_fields: true,  
                      q: "user_metadata.emailNew:" + user.email
                    })
                    .then(function (users) {
                      users.forEach(function (_user) {
                        DEBUG(LOG_TAG,"User = ", _user);
                        DEBUG(LOG_TAG,"Initiating Event trigger");
                        context.redirect = context.redirect || {};
                        context.redirect.url = configuration.PROFILE_REDIRECT +
                          "/service/event";
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