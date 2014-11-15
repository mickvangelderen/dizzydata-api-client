# DizzyData API Client

This is an unofficial nodejs client for Dizzydata. The package is still under development and the exposed methods will most likely change before the first release. 

## Installation

```bash
npm install --save dizzydata-api-client
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
    }
};
```

The tests require the mocha package to be installed globally. 

```bash
npm install -g mocha
```

Then execute mocha with your favorite options or just do:

```bash
npm test
```
