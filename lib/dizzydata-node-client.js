var request = require('request');
var qs = require('qs');
var Promise = require('es6-promise').Promise;

var DizzydataClient = module.exports = function(options) {
	options = options || {};

	this.username = options.username;
	this.password = options.password;
	this.token = null;
	this.responseToJSON = options.responseToJSON || defaultResponseToJSON;
	this.baseUrl = options.url || 'https://api.dizzydata.com/';

	// attach certificates for api.dizzydata.com
	if (this.baseUrl === 'https://api.dizzydata.com/') {
		this.certificates = require('./certificates');
	}
};

// Return a simpler response object to allow serialization
function defaultResponseToJSON(response) {
	return {
		method: response.request.method,
		href: response.request.uri.href,
		statusCode: response.statusCode,
		body: response.body,
	}
}

DizzydataClient.prototype._request = function(options) {
	var self = this;

	// Add certificates for SSL if they are configured
	if (self.certificates) {
		var agentOptions = options.agentOptions;
		if (!agentOptions) { options.agentOptions = agentOptions = {}; }
		if (!agentOptions.ca) { agentOptions.ca = []; }
		agentOptions.ca = agentOptions.ca.concat(self.certificates);
	}

	// Enable json by default
	if (!('json' in options)) { options.json = true; }

	return new Promise(function(resolve, reject) {
		request(options, function(error, response, body) {
			if (error) { return reject(error); }
			if (response.statusCode !== 200) {
				return reject(self.responseToJSON(response));
			}
			// An issue marked as won't fix
			if (body && 'StatusCode' in body && body.StatusCode !== 200) {
				return reject(self.responseToJSON(response));
			}
			resolve(body);
		});
	});
};

DizzydataClient.prototype._requestToken = function() {
	var self = this;
	return self._request({
		method: 'POST', url: self.baseUrl + 'v1/oauth2/token',
		body: qs.stringify({
			grant_type: 'password',
			scope: 'test',
			username: self.username,
			password: self.password
		}),
		headers: { 'content-type': 'application/x-www-form-urlencoded' }
	}).then(function(response) {
		return response.access_token;
	});
};

DizzydataClient.prototype._authorizedRequest = function(options) {
	var self = this;

	// if we don't have a token
	if (!self.token) {
		// get one
		self.token = self._requestToken();
		return self.token.then(req);
	}
	// if we have a token
	return self.token.then(req).catch(function(error) {
		// catch token expired messages
		if (error && error.statusCode === 401 || error.body.StatusCode === 401) {
			// remove the token
			self.token = null;
			// try again
			return self._authorizedRequest(options);
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
		return self._request(options);
	}
};

DizzydataClient.prototype.clients = function(options) {
	return this._authorizedRequest({
		method: 'GET', url: this.baseUrl + 'v1/clients'
	}).then(function(response) {
		return response.map(function(client) {
			return {
				id: client.OAuthClientID,
				name: client.ClientName
			}
		});
	});
};

DizzydataClient.prototype.updateClient = function(options) {
	return this._authorizedRequest({
		method: 'PUT', url: this.baseUrl + 'v1/clients/' + options.id,
		body: { IsActive: options.active },
	});
};

DizzydataClient.prototype.invoiceCount = function(options) {
	return this._authorizedRequest({
		method: 'GET', url: this.baseUrl + 'v1/statistics',
		qs: {
			resource: 'jobresultfiles',
			startdate: options.startDate,
			enddate: options.endDate,
			clientid: options.clientId
		}
	});
};

DizzydataClient.prototype.administrationCount = function(options) {
	return this._authorizedRequest({
		method: 'GET', url: this.baseUrl + 'v1/statistics',
		qs: {
			resource: 'eoadmins',
			startdate: options.startDate,
			enddate: options.endDate,
			clientid: options.clientId
		}
	});
};
