# Auth0 Tenant Configuration

This section of the repository contains files for [Auth0 Tenant](https://auth0.com/docs/getting-started/the-basics#account-and-tenants) configuration and asset definition. The files are organized to be used with the [Auth0 Deploy CLI tooling](https://auth0.com/docs/extensions/deploy-cli) using Directory format specification. Configuration can utilized as-is, however review - e.g. of asset naming and/or associated asset description, for example - is recommended before deploying. 

## [`clients`](./clients)

This folder contains the [Auth0 Application](https://auth0.com/docs/applications) (a.k.a. Client) definitions, for both the Profile Managemnt application and the Profile Management Service implemented as part of Verified Email Address Change, and as described in the [design document](https://drive.google.com/open?id=1DtjpHFTwK6wN0B6BlaaXpbIFbU0BlUagDlymP0RGZgw).

## [`resource-servers`](./resource-servers)

This folder contains the [Auth0 API](https://auth0.com/docs/apis) definition for the Profile Managemnt API route(s) that typically forms part of the Profile Management Service for Verified Email Address Change as described in the [design document](https://drive.google.com/open?id=1DtjpHFTwK6wN0B6BlaaXpbIFbU0BlUagDlymP0RGZgw).

## [`rules`](./rules)

This folder contains the [Auth0 Rule](https://auth0.com/docs/rules) that essentially drives Verified Email Address Change, as described in the [design document](https://drive.google.com/open?id=1DtjpHFTwK6wN0B6BlaaXpbIFbU0BlUagDlymP0RGZgw).

## About Auth0

Auth0 is the flagship Platform-as-a-Service (PaaS) Identity and Access Management service from the company of the same same. Auth0 helps you to easily:

- authenticate using multiple identity providers, including social (e.g. Google, Facebook, Microsoft, LinkedIn, GitHub, Twitter, etc), or enterprise (e.g. Windows Azure AD, Google Apps, Active Directory, ADFS, SAML, etc),
- authenticate users via username/password, or passwordless mechanisms,
- implement multi-factor authentication,
- link multiple user identities to a single user account, 
- generate signed JSON Web Tokens to authorize API calls and flow user identity securely,
- access demographics and analytics, detailing how, when, and where users are logging in
- enrich user profiles from other data sources using customizable JavaScript Rules,
- and much, much more.
 
Go to [Auth0](https://auth0.com) and click Sign Up to create a free account.

## Issue Reporting

If you have found a bug or if you have a feature request, please report them via the issues section of this repository. Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://auth0.com/whitehat) details the procedure for disclosing security issues.

## License

This project is licensed under an MIT LICENSE. Please see the [LICENSE](../LICENSE) file for more info.

