# Dizzydata API Client

*Warning* This package is still under development and the exposed methods are likely to change. 

## Installation

```bash
npm install --save dizzydata
```

## Testing

You'll need to create a configuration file to run the tests. Some tests might fail for normal user accounts. 

> config/test-config.js

```javascript
module.exports = {
    dizzydata: {
        URL: 'https://api.dizzydata.com/',
        USERNAME: '<YOUR USERNAME>',
        PASSWORD: '<YOUR PASSWORD>'
    },
    test: {
    	CLIENT_ID: '<YOUR CLIENT ID>'
    }
};
```

The tests require the mocha package to be installed globally. 

```bash
npm install -g mocha
```

Then execute mocha with your favorite options or just do:

```bash
clear && NODE_ENV=test npm test
```

## Changelog

### 0.2.2 -> 0.3.1
The request wrapper was split from the lib/client.js to its own file. This caused some properties on the client to be located. 
* The properties `username`, `password`, `baseUrl`, `token` and `responseToJSON` are no longer available on the client objects. 
* The function `_request(options)` is now available through `request(options)`
* The function `_authorizedRequest(options)` is now available through `request.authorized(options)`
* The function `_requestToken()` is now available through `request._token()` but should for normal use not be called by you. 