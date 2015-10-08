var config = require('ezconf');
var expect = require('./expect');
var requestProvider = require('../lib/request-provider');

describe('lib/request-provider.js', function() {

	this.timeout(60000);

	var request;

	beforeEach(function() {
		request = requestProvider({
			url: config.dizzydata.URL,
			username: config.dizzydata.USERNAME,
			password: config.dizzydata.PASSWORD
		});
	});

	describe('request(options)', function() {

		it('should prepend the base url, attach certificates for SSL requests, default to JSON and return a promise', function(done) {
			expect(request).to.be.a('function');
			var value = request({
				method: 'GET', url: 'v1/clients'
			});
			expect(value).to.be.an('object').that.has.property('then').that.is.a('function');
			value.then(function(result) {
				expect(true).to.be.false;
			}, function(response) {

				expect(response).to.be.an('object');

				var request = response.request

				expect(request).to.be.an('object')
				expect(request).to.have.ownProperty('method')
				expect(request).to.have.ownProperty('href')
				expect(request).to.have.ownProperty('headers')
				expect(request).to.have.ownProperty('body')

				var body = response.body

				expect(body).to.be.an('object');
			}).then(done, done);
		});

	});

	describe('request._token()', function() {
		it('should return an access token', function() {
			return request._token().then(function(token) {
				expect(token).to.be.a('string');
			});
		});
	});

	describe('request.authorized(options)', function() {
		it('should get an access token and complete the request', function() {
			return request.authorized({
				method: 'GET', url: 'v1/clients'
			}).then(function(response) {
				expect(response.body).to.be.an('array').with.length.above(0);
				return request._currentToken;
			}).then(function(token) {
				expect(token).to.be.a('string');
			});
		});

		it('should reuse access tokens', function() {
			// check that there is no token
			expect(request._currentToken).to.be.null;
			// issue some request
			return request.authorized({
				method: 'GET', url: 'v1/clients'
			}).then(function(response) {
				// request successful
				return request._currentToken.then(function(lastToken) {
					// check that the token is a string
					expect(lastToken).to.be.a.string;
					// issue another request
					return request.authorized({
						method: 'GET', url: 'v1/clients'
					}).then(function(response) {
						// request successful
						return request._currentToken.then(function(currentToken) {
							// check that the current token is equal to the last token
							expect(lastToken).to.equal(currentToken);
						});
					});
				});
			});
		});

		it('should fail if the username or password is invalid', function() {
			request._username = 'I do not exist';
			request._password = 'I am not a valid password';
			return request.authorized({
				method: 'GET', url: 'v1/clients'
			}).then(function() {
				expect(true).to.be.false;
			}, function(error) {
				expect(error).to.be.an('object').that.has.property('body')
					.that.is.an('object').that.has.property('StatusCode')
						.that.equals(401);
			});
		});

		it('should request a new token if the old one became invalid', function() {
			var firstToken;
			var secondToken;
			return request.authorized({
				method: 'GET', url: 'v1/clients'
			}).then(function() {
				firstToken = request._currentToken;
				expect(firstToken).to.be.a.string;
				// invalidate token by requesting a new one and not saving it
				return request._token()
			}).then(function(token) {
				secondToken = token;
				expect(secondToken).to.be.a.string;
				expect(secondToken).to.not.equal(firstToken);
				// do another request with the old token
				return request.authorized({
					method: 'GET', url: 'v1/clients'
				});
			}).then(function() {
				var thirdToken = request._currentToken;
				expect(thirdToken).to.be.a.string;
				expect(thirdToken).to.not.equal(secondToken);
			});
		});
	});

});