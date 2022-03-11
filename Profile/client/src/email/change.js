import React, { Component } from 'react';
import LoadingOverlay from 'react-loading-overlay';
import '../App.css';
const DEBUG = process.env.REACT_APP_DEBUG ? console.log : function () {};

/* The . */ 
class EmailChange extends Component {
  constructor(props) {
// Removed in production build (https://create-react-app.dev/docs/adding-custom-environment-variables/)    
//if (process.env.NODE_ENV !== 'production') {
//}
    //
    props.appState.email = props.appState.email || {};
    props.appState.email.change = props.appState.email.change || {};
    super(props);
    
    this.state = {
      executing: props.appState.email.change.executing,
      executed: props.appState.email.change.executed,
      error: props.appState.email.change.error
    };

    // This binding is necessary to make `this` work in the callback
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    var that=this;
    if (
      that.props.policy &&
      that.props.policy.email &&
      that.props.policy.email.change && typeof that.props.policy.email.change === 'object') {
      that.props.auth0Client
        .getTokenSilently({
          audience: process.env.REACT_APP_PROFILE_AUDIENCE,
          appState: that.props.appState,
          scope: 'update:email'
        })
        .then(accessToken => {
          this.props.appState.continue = {
            companion: accessToken          
          }
          that.setState({
            executing: false,
            executed: true,
            error: null
          });
        })
        .catch(error => {
          DEBUG(error);
          switch(error.error) {
            case 'login_required':
            case 'consent_required':
            default:
              that.props.auth0Client.loginWithRedirect({
                audience: process.env.REACT_APP_PROFILE_AUDIENCE,
                appState: that.props.appState,
                scope: 'update:email'
              })
              .catch(error => {
                DEBUG(error);
                that.setState({
                  executing: false,
                  executed: true,
                  error: error
                });
              });
              break;
          }
        });    
    }   
  }  

  handleClick() {
    var that=this;
    that.setState({
      executing: true,
      executed: false,
      error: null
    });

    // Get logged in user profile
    that.props.auth0Client.getUser().then(user => {
      that.props.appState.email.change = this.state;
      var policy = user[process.env.REACT_APP_PROFILE_AUDIENCE+"/policy"];
      var options = { 
        appState: that.props.appState,
        prompt: 'login' 
      }; 

      policy = (policy) ? JSON.parse(policy) : {};

      if (policy.connection) {
        options.connection = policy.connection;
      }
      if (policy.login_hint) {
        options.login_hint = policy.login_hint;
      }
      that.props.auth0Client.loginWithRedirect(options).catch(error => {
        DEBUG(error);
        that.setState({
          executing: false,
          executed: true,
          error: error
        });
      });
    }).catch((error) => {
      DEBUG(error);
      that.setState({
        executing: false,
        executed: true,
        error: error
      });
    });
  }

  render() {
    /* In the rendering returned (below), use is made of the Next button which forms part of Stepzilla; see 'render()'
       in App.js for further details.
    */
    if (this.state.executing) {
      return(
        <div className="stepEmail" style={{textAlign: 'center'}}>
          <LoadingOverlay active={true} spinner>
            <div style={{
              textAlign: 'center', 
              fontSize: '20px', 
              paddingTop: '20px',
              paddingBottom: '20px'}}>
              <p>Email Address change in progress.</p>
            </div>
          </LoadingOverlay>        
        </div>               
      );
    }
    else
    if (this.state.executed) {
      if (this.state.error) {
        return(
          <div className="stepEmail">
            <div style={{textAlign: 'center', fontSize: '20px', lineHeight: '1', paddingBottom: '20px'}}>
              <p>An error occurred whilst attempting to perform Email Address change. </p>
              <p>Please click the 'Change Email' button below to try the change again, </p>
              <p>alternatively click 'Next' if you wish to skip the change for now.</p>
              <button style={{backgroundColor: "greenyellow", paddingTop: 9, paddingBottom: 9}} onClick={this.handleClick}>
                Change Email
              </button>            
            </div>
          </div>               
        );
      } else {
        return(
          <div className="stepEmail">
            <div style={{textAlign: 'center', fontSize: '20px', lineHeight: '1', paddingBottom: '20px'}}>
              <p>Email Address change has been sucessfully queued.</p>
              <p>Click Next to continue.</p>
            </div>
          </div>               
        );
      }
    } else {
      return(
        <div className="stepEmail">
          <div style={{textAlign: 'center', fontSize: '20px', lineHeight: '1', paddingBottom: '20px'}}>
            <p>A request has been made to change your Email Address.</p>
            <p>To do that you'll need to authenticate with your existing credentials.</p>
            <p>Please click the 'Change Email' button below to action the change, </p>
            <p>alternatively click 'Next' if you wish to skip the change for now.</p>
            <button style={{backgroundColor: "greenyellow", paddingTop: 9, paddingBottom: 9}} onClick={this.handleClick}>
              Change Email
            </button>            
          </div>
        </div>               
      );
    }
  }

  isValidated() {
    this.props.appState.email.change = this.state;
    return(this.state.executing?
      false:
      true);
  }
}

export default EmailChange;
