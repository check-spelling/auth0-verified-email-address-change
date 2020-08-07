/* Configure environment using '.env' file as described here:
    https://medium.com/the-node-js-collection/making-your-node-js-work-everywhere-with-environment-variables-2da8cdf6e786 

   See also the following for using '.env' file  with React 
    https://create-react-app.dev/docs/adding-custom-environment-variables/
*/
import React from "react";
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import EmailChange from './email/change';
import { Auth0Provider } from "./react-auth0-spa";
import createAuth0Client from '@auth0/auth0-spa-js';
                                            // https://www.npmjs.com/package/@auth0/auth0-spa-js
import { parse } from 'querystring';        // https://nodejs.org/api/querystring.html
import registerServiceWorker from './registerServiceWorker';
import { Route, BrowserRouter as Router } from 'react-router-dom';
var query=parse(require('url').parse(window.location.href).query);

createAuth0Client({
  domain: process.env.REACT_APP_AUTH0_DOMAIN,
  audience: process.env.REACT_APP_PROFILE_AUDIENCE,
  redirect_uri: window.location.href,
  connection: query.connection,
  login_hint: query.login_hint,
  prompt: (
    query.prompt)?(
    query.prompt==='signup')?
    null:
    query.prompt:
    query.prompt,
  client_id: (
    query.prompt)?(
    query.prompt==='signup')?
    process.env.REACT_APP_AUTH0_SIGNUP_CLIENTID:
    process.env.REACT_APP_AUTH0_CLIENTID:
    process.env.REACT_APP_AUTH0_CLIENTID
}).then(auth0Client => {
  var context = {
    appState: {
      state: query.state
    }
  }

  /* Use React Router property passing as described here:
        https://tylermcginnis.com/react-router-pass-props-to-components/
  */
  ReactDOM.render(
    <Auth0Provider auth0ClientEx={auth0Client}>        
      <Router>
        <div>
          <Route path="/" render={(props) => <App {...props} auth0Client={auth0Client} context={context}/>}/>
          <Route path="/email/change" render={(props) => <EmailChange {...props} auth0Client={auth0Client} context={context}/>}/>
        </div>
      </Router>
    </Auth0Provider>,
    document.getElementById('root'));
});

registerServiceWorker();
