# Profile Management

This section of the repository contains reference implementation for the Profile Management functionality implemented external to Auth0, and you can use it as-is or incorporate as part of your own/existing functionality in order to support Verfiried Email Address Change in Auth0. The diagram below illustrates the architecture associated with the implementation provided. As can be seen, there is a Profile Management Client and an associated Profile Management Service, which are used in conjunction with the corresponding Auth0 [Tenant assests](../Tenant). **Note: all implementation provided has been built and tested using [Node.js](https://nodejs.org/en/) version 12.18**

<p align="center">
<img src="./Architecture.png">
</p>

## Client

The [Client](Profile/client) folder contains reference [Node.js](https://nodejs.org/en/) implementation for the interactive Profile Client application which provides the User Interface Experience (UI/UX) as part of Verified Email Address Change [Redirect](https://docs.google.com/document/d/1DtjpHFTwK6wN0B6BlaaXpbIFbU0BlUagDlymP0RGZgw/edit#bookmark=id.v0omkqzfjvqw) processing. For further details please refer to the [readme](Client) contained in the folder.

## Service

The [Client](Profile/client) folder contains reference [Node.js](https://nodejs.org/en/) implementation for the Profile Service which provides backend processing as part of Verified Email Address Change [Redirect](https://docs.google.com/document/d/1DtjpHFTwK6wN0B6BlaaXpbIFbU0BlUagDlymP0RGZgw/edit#bookmark=id.v0omkqzfjvqw) processing. For further details please refer to the [readme](service) contained in the folder.


 and the [Express](https://expressjs.com/) framework

## Issue Reporting

If you have found a bug or if you have a feature request, please report them via the issues section of this repository. Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://auth0.com/whitehat) details the procedure for disclosing security issues.

## License

This project is licensed under an MIT LICENSE. Please see the [LICENSE](../LICENSE) file for more info.
