var certificates = require('./certificates');
var originalRequest = require('request');
var Promise = require('es6-promises');
var qs = require('qs');
var url = require('url');

module.exports = requestProvider;

function requestProvider(options) {
	options || ( options = {} );
	request._url = options.url;
	request._username = options.username;
	request._password = options.password;
	request._currentToken = null;

	function request(options) {
		// Prepend base url if no host can be determined
		if (!url.parse(options.url).host) {
			options.url = request._url + options.url;
		}

		// Add certificates for SSL if the protocol is https
		if (url.parse(options.url).protocol === 'https:') {
			var agentOptions = options.agentOptions;
			if (!agentOptions) { options.agentOptions = agentOptions = {}; }
			if (!agentOptions.ca) { agentOptions.ca = []; }
			agentOptions.ca = certificates.concat(agentOptions.ca);
		}

		// Enable json by default
		if (!('json' in options)) options.json = true;

		return new Promise(function(resolve, reject) {
			originalRequest(options, function(error, response, body) {
				if (error) return reject(error);
				if (response.statusCode !== 200) return reject(response);
				// An issue marked as won't fix
				if (body && 'StatusCode' in body && body.StatusCode !== 200) {
					return reject(response);
				}
				resolve(body);
			});
		});
	};

	function requestToken() {
		return request({
			method: 'POST', url: 'v1/oauth2/token',
			body: qs.stringify({
				grant_type: 'password',
				scope: 'test',
				username: request._username,
				password: request._password
			}),
			headers: { 'content-type': 'application/x-www-form-urlencoded' }
		}).then(function(response) {
			return response.access_token;
		});
	};

	function authorizedRequest(options) {

		// if we don't have a token
		if (!request._currentToken) {
			// get one
			request._currentToken = requestToken();
			// attach it and perform the request
			return request._currentToken.then(req);
		}

		// if we have a token
		return request._currentToken.then(req)
		.catch(function(error) {
			// catch token expired messages
			var code = error && ( error.body && error.body.StatusCode || error.statusCode );
			if (code === 401) {
				// remove the token
				request._currentToken = null;
				// try again
				return authorizedRequest(options);
			}
			// rethrow other errors
			throw error;
		});

		// attach token and perform request
		function req(token) {
			// attach the token to the query string
			if (!options.qs) { options.qs = {}; }
			options.qs.accesstoken = token;
			// perform the request
			return request(options);
		}
	};

	request._token = requestToken;
	request.authorized = authorizedRequest;
	return request;

}
