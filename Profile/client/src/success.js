import React, { Component } from 'react';
//import { encode } from 'querystring';         // https://nodejs.org/api/querystring.html
//var AUTH0_DOMAIN = 'auth.cevolution.co.uk';

/* The . */ 
class Success extends Component {
  render() {
/*    
    var href = "https://"+AUTH0_DOMAIN+"/continue?" + encode({
      state: this.props.context.state
    });
*/
    return(
      <div className="stepSuccess">
        <div style={{textAlign: 'center', fontSize: '20px', lineHeight: '1', paddingBottom: '20px'}}>
          <p>You're all done for now.</p>
          <p>Thanks.</p>
        </div>
      </div>                
    );
  }
}

export default Success;
