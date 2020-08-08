# Profile Management Client

This section of the repository contains reference implementation for the Profile Management Client functionality to be implemented external to Auth0. You can use this implementation as-is, or incorporate as part of your own/existing functionality in order to support Verfiried Email Address Change in Auth0. Client reference implemetation is built as a [Node.js](https://nodejs.org/en/) application using [React](https://reactjs.org/). For a general overview of Profile Management functionality see the readme in the containing [folder](..) **Note: all implementation provided has been built and tested using Node.js version 12.18**

## Deployment Environment

The reference implementation provided is designed to be deployed within your own infrastructure - or at least within an infrastructure that is external to Auth0; for the latter, [Heroku](https://www.heroku.com) is often used as a Node.js hosting environment, as is Amazon Web Services - utilizing something like [AWS Lambda](https://aws.amazon.com/lambda/). 

### Environment Variables

Whatever environment you choose to utilize, before deploying the reference implementation provided you will need to setup the Node.js environment with the following environment variables. Support is provided for utilizing a [`.env`](https://www.npmjs.com/package/dotenv) file within your host Node environment (if supported) or alernatively using whatever configuration tools your hosting environment provides.

- `REACT_APP_DEBUG` (optional): set to `true` te enable debug logging via the Browser console.

- `REACT_APP_AUTH0_DOMAIN`: set to the **Domain** name of your Auth0 Tenant. If you are using a [Custom Domain](https://auth0.com/docs/custom-domains) for your Auth0 Tenant then it should be set this value. 

- `REACT_APP_AUTH0_CLIENTID`: set to the **Client ID** of the _Profile Management_ Application definition in Auth0 (see [Auth0 Tenant Configuration](../../Tenant) for more detais). 

- `REACT_APP_PROFILE_AUDIENCE`: set to the **API Audience** of the _Profile Management API_ definition in Auth0 (see [Auth0 Tenant Configuration](../../Tenant) for more detais). 

## Issue Reporting

If you have found a bug or if you have a feature request, please report them via the issues section of this repository. Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://auth0.com/whitehat) details the procedure for disclosing security issues.

## License

This project is licensed under an MIT LICENSE. Please see the [LICENSE](../LICENSE) file for more info.
