# Profile Management Service

This section of the repository contains reference implementation for the Profile Management Service functionality to be implemented external to Auth0. You can use this implementation as-is, or incorporate as part of your own/existing functionality in order to support Verfiried Email Address Change in Auth0. Service reference implemetation is built as a [Node.js](https://nodejs.org/en/) application using [Express](https://expressjs.com/) and [Passport](http://www.passportjs.org/). For a general overview of Profile Management functionality see the readme in the containing [folder](..). **Note: all implementation provided has been built and tested using Node.js version 12.18**

## Deployment Environment

The reference implementation provided is designed to be deployed within your own infrastructure - or at least within an infrastructure that is external to Auth0. For the latter, [Heroku](https://www.heroku.com) is often used as a Node.js hosting environment, as is Amazon Web Services - utilizing something like [AWS Lambda](https://aws.amazon.com/lambda/). 

### Environment Variables

Whatever environment you choose to utilize, before deploying the reference implementation provided you will need to setup the Node.js environment with the following environment variables. Support is provided for utilizing a [`.env`](https://www.npmjs.com/package/dotenv) file within your host Node environment (if supported) or alernatively using whatever configuration tools your hosting environment provides. Sample `.env` content has been provided for convenience:

```
PORT=3030
DEBUG=true
AUTH0_API=mytenant.eu.auth0.com
AUTH0_DOMAIN=mytenant.eu.auth0.com
AUTH0_CALLBACK=http://myorg.com/Profile
AUTH0_CLIENT_ID=KrdW64EEOvSdejL8wk72pIqc1kba1ksO
AUTH0_CLIENT_SECRET=****************************************************************    
PROFILE_CLIENT=http://myorg.com/Profile
PROFILE_AUDIENCE=https://myorg.com/profile 
```

- `PORT` (optional): port number on which the service will run.

- `DEBUG` (optional): set to `true` te enable debug logging via the Node.js console.

- `AUTH0_API`: set to the **Domain** name associated with the Auth0 Management API definition in Auth0 for your Auth0 Tenant. Note: the identifier for an API is in URI format; this is not the URL to the Management API. 

- `AUTH0_DOMAIN`: set to the **Domain** name of your Auth0 Tenant. If you are using a [Custom Domain](https://auth0.com/docs/custom-domains) for your Auth0 Tenant then it should be set this value. 

- `AUTH0_CALLBACK`: set to the base URL of [Profile Management](..) deployment. 

- `AUTH0_CLIENT_ID`: set to the **Client ID** of the _Profile Management Service_ Application definition in Auth0 (see [Auth0 Tenant Configuration](../../Tenant) for more detais).  

- `AUTH0_CLIENT_SECRET`: set to the **Client Secret** of the _Profile Management Service_ Application definition in Auth0 (see [Auth0 Tenant Configuration](../../Tenant) for more detais).  
 
- `PROFILE_CLIENT`: set to the base URL of [Profile Management](..) deployment. This value wil typically be the same as the `AUTH0_CALLBACK` value 

- `PROFILE_AUDIENCE`: set to the **API Audience** of the _Profile Management API_ definition in Auth0 (see [Auth0 Tenant Configuration](../../Tenant) for more detais). 

## Issue Reporting

If you have found a bug or if you have a feature request, please report them via the issues section of this repository. Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://auth0.com/whitehat) details the procedure for disclosing security issues.

## License

This project is licensed under an MIT LICENSE. Please see the [LICENSE](../LICENSE) file for more info.
