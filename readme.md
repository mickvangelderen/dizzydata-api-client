# Dizzydata API Client

*Warning* This package is still under development and the exposed methods are likely to change. 

## Installation

```bash
npm install --save dizzydata
```

## Usage

```javascript
var DizzydataClient = require('dizzydata')

var dizzydata = DizzydataClient({
	server: 'https://api.dizzydata.com/',
	credentials: {
		username: '<YOUR USERNAME>',
		password: '<YOUR PASSWORD>',
	}
})

dizzydata.request({ method: 'GET', url: 'v1/jobs' })
.then(response => {
	console.log('Received jobs', response.body)
}, error => {
	console.error('Failed to load jobs')
})
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

Run the tests with:

```bash
NODE_ENV=test npm test
```

## Changelog

### 0.4.0 -. 1.0.0
* The options have changed. `url` became `server`, `username` and `password` are now under the `credentials` property. 
* `clients(options)`, `updateClients(options)`, `invoiceCount(options)` and `administrationCount(options)` have been removed. They were essentially light wrappers. You can do a better job wrapping Dizzydata requests because you know what information you need and how you want it. 
* `The old `request.authorized(options)` is now `request(options)`. 
* `The old `request(options)` is now `unauthorizedRequest(options)`. 
* `request(options)` now uses authorization by default and attempts to re-authorize automatically using the provided credentials. 
* Certificates have been removed. Our new certificates work out of the box. 
* Much simpler implementation. 

### 0.2.2 -> 0.3.1
The request wrapper was split from the lib/client.js to its own file. This caused some properties on the client to be located. 
* The properties `username`, `password`, `baseUrl`, `token` and `responseToJSON` are no longer available on the client objects. 
* The function `_request(options)` is now available through `request(options)`
* The function `_authorizedRequest(options)` is now available through `request.authorized(options)`
* The function `_requestToken()` is now available through `request._token()` but should for normal use not be called by you. 