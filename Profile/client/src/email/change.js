import React, { Component } from 'react';
import LoadingOverlay from 'react-loading-overlay';
//import { Auth0Provider } from "./react-auth0-spa";
// import { useAuth0 } from "./react-auth0-spa";
//import Cookies from 'universal-cookie';
//import Login from "./components/Login";
//import Success from '../success';
//import auth0 from 'auth0-js';
//import $ from 'jquery';
import '../App.css';
const DEBUG = process.env.REACT_APP_DEBUG ? console.log : function () {};

/* The . */ 
class EmailChange extends Component {
  constructor(props) {
// Removed in production build (https://create-react-app.dev/docs/adding-custom-environment-variables/)    
//if (process.env.NODE_ENV !== 'production') {
//  props.context.policy = props.context.policy || {};
//  props.context.policy.email = props.context.policy.email || {};
//  props.context.policy.email.change = props.context.policy.email.change || true;
//}
    //
    props.context.appState = props.context.appState || {};
    props.context.appState.email = props.context.appState.email || {};
    props.context.appState.email.change = props.context.appState.email.change || {};
    super(props);

    this.state = {
      executing: props.context.appState.email.change.executing,
      executed: props.context.appState.email.change.executed,
      error: props.context.appState.email.change.error
    };

    // This binding is necessary to make `this` work in the callback
    this.handleClick = this.handleClick.bind(this);
  }

  
  /* Use dynamic loading as descrinbed in https://www.robinwieruch.de/react-fetching-data/
  */
  componentDidUpdate() {
    if (
      this.props.context.policy &&
      this.props.context.policy.email &&
      this.props.context.policy.email.change &&
      this.state.executing) {
      var that=this;

      that.props.context.auth0Client
        .getTokenSilently({
          audience: process.env.REACT_APP_PROFILE_AUDIENCE,
          scope: 'update:email'
        })
        .then(accessToken =>
          fetch('/Profile/service/email', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + accessToken
            }
          })
          .then(result => {
            DEBUG(result.json()); 
            if (result.ok) { 
              that.setState({
                executing: false,
                executed: true,
                error: null
              });
            } else {
              that.setState({
                executing: false,
                executed: true,
                error: result
              });
            }
          })
          .catch(error => {
            DEBUG(error);
            that.setState({
              executing: false,
              executed: true,
              error: error
            });
          })
        )
        .catch(error => {
          DEBUG(error);
          switch(error.error){
            case 'login_required':
            case 'consent_required':
            default:
              that.props.context.appState.email.change = that.state;
              that.props.context.auth0Client.loginWithRedirect({
                audience: process.env.REACT_APP_PROFILE_AUDIENCE,
                appState: that.props.context.appState,
                scope: 'update:email'
              })
              .catch(error => {
                DEBUG(error);
                that.setState({
                  executing: false,
                  executed: false,
                  error: error
                });
              });
              break;
          }
        });    
    }
  }

  handleClick() {
    this.setState({
      executing: true,
      executed: false,
      error: null
    });
  }

  render() {
    /* In the rendering returned (below), use is made of the Next button which forms part of Stepzilla; see 'render()'
       in App.js for further details.
    */
    if (
      this.props.context.policy &&
      this.props.context.policy.email &&
      this.props.context.policy.email.change &&
      this.state.executing) {
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
    if (
      this.props.context.policy &&
      this.props.context.policy.email &&
      this.props.context.policy.email.change &&
      this.state.executed) {
      if (this.state.error) {
        return(
          <div className="stepEmail">
            <div style={{textAlign: 'center', fontSize: '20px', lineHeight: '1', paddingBottom: '20px'}}>
              <p>An error occured whilst attempting to perform Email Address change. </p>
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
              <p>Email Address change sucessfully executed.</p>
              <p>Click Next to continue.</p>
            </div>
          </div>               
        );
      }
    } 
    else 
    if (
      this.props.context.policy &&
      this.props.context.policy.email &&
      this.props.context.policy.email.change) {
      return(
        <div className="stepEmail">
          <div style={{textAlign: 'center', fontSize: '20px', lineHeight: '1', paddingBottom: '20px'}}>
            <p>A request has been made to change your Email Address.</p>
            <p>Please click the 'Change Email' button below to action the change, </p>
            <p>alternatively click 'Next' if you wish to skip the change for now.</p>
            <button style={{backgroundColor: "greenyellow", paddingTop: 9, paddingBottom: 9}} onClick={this.handleClick}>
              Change Email
            </button>            
          </div>
        </div>               
      );
    } else {
      return null;
    }
  }

  isValidated() {
    this.props.context.appState.email.change = this.state;
    return(
      this.props.context.policy &&
      this.props.context.policy.email &&
      this.props.context.policy.email.change &&
      this.state.executing?
        false:
        true);
  }
}

export default EmailChange;
