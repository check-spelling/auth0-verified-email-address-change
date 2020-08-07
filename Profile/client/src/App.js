import React, { Component } from 'react';
import StepZilla from 'react-stepzilla';        // https://www.npmjs.com/package/react-stepzilla
import EmailChange from './email/change';
import Success from './success';
import Failure from './failure';
import './App.css';
const DEBUG = process.env.REACT_APP_DEBUG ? console.log : function () {};

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      update: true
    };
  }

  /* Use dynamic loading as descrinbed in https://www.robinwieruch.de/react-fetching-data/
  */
  componentDidMount() {
    var that=this;
    that.props.auth0Client.handleRedirectCallback().then(({appState}) => {
      DEBUG("appState=", appState);
      that.props.context.appState = appState;
      that.props.context.auth0Client = that.props.auth0Client;
      that.props.context.steps = [{
        name: "Finish", 
        component: <Success context={that.props.context}/>}];

      // Get logged in user profile
      that.props.context.auth0Client.getUser().then(user => {
        var policy = user[process.env.REACT_APP_PROFILE_AUDIENCE+"/policy"];

        // Policy defined?
        if (policy) {
          that.props.context.policy = JSON.parse(policy);

          /*  Email Change?
          */
          if (
            that.props.context.policy &&
            that.props.context.policy.email) {
            that.props.context.steps.unshift({
              name: 'Email Change', 
              component: <EmailChange context={that.props.context} />});
          }
        }
        that.setState({
          update: true
        });                      
      }).catch((error) => {
        DEBUG(error);
        that.props.context.steps = [{
          name: "Finish", 
          component: <Failure context={that.props.context} error={error}/>}];
        that.setState({
          update: true
        });                      
      });
    }).catch((error) => {
      DEBUG(error);
      switch(error.error){
        case 'access_denied':
          that.props.context.steps = [{
            name: "Finish", 
            component: <Failure context={that.props.context} error={error}/>}];
          that.setState({
            update: true
          });                      
          break;

        case 'login_required':
        case 'consent_required':
        default:
          that.props.auth0Client.loginWithRedirect({
            appState: that.props.context.appState
          })
          .catch(error => {
            DEBUG(error);
            that.props.context.steps = [{
              name: "Finish", 
              component: <Failure context={that.props.context} error={error}/>}];
          });
          break;
      }
    });
  }  

  render() {
    /* Render using Stepzilla (https://www.npmjs.com/package/react-stepzilla). Navigation for all pages is shown, however
       CSS is used (see App.css) to remove and/or align buttons for the various pages. For more information regarding this
       technique, see: https://github.com/newbreedofgeek/react-stepzilla/issues/28
     */
    if (this.props.context.steps) {
      return(
        <div>
          <div className='step-progress'>
            <StepZilla steps={this.props.context.steps} showNavigation={true} showSteps={true}/>
          </div>        
        </div>                
      );
    } else {
      return null;
    }
  }
}

export default App;

