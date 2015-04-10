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
			}, function(error) {
				expect(error).to.be.an('object');

				// expect url to be prepended
				expect(error.request).to.be.an('object')
					.that.has.property('uri').that.is.an('object')
						.that.has.property('host').that.is.a('string');

				expect(error.body).to.be.an('object');
			}).then(done, done);
		});

	});

	describe('request._token()', function() {
		it('should return an access token', function(done) {
			request._token().then(function(token) {
				expect(token).to.be.a('string');
			}, function(error) {
				expect(error).to.be.null;
			}).then(done, done);
		});
	});

	describe('request.authorized(options)', function() {
		it('should get an access token and complete the request', function(done) {
			request.authorized({
				method: 'GET', url: 'v1/clients'
			}).then(function(response) {
				expect(response).to.be.an('array').with.length.above(0);
				return request._currentToken;
			}).then(function(token) {
				expect(token).to.be.a('string');
			}, function(error) {
				expect(error).to.be.null;
			}).then(done, done);
		});

		it('should reuse access tokens', function(done) {
			// check that there is no token
			expect(request._currentToken).to.be.null;
			// issue some request
			request.authorized({
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
			}).catch(function(error) {
				expect(error).to.be.null;
			}).then(done, done);
		});

		it('should fail if the username or password is invalid', function(done) {
			request._username = 'I do not exist';
			request._password = 'I am not a valid password';
			request.authorized({
				method: 'GET', url: 'v1/clients'
			}).then(function() {
				expect(true).to.be.false;
			}, function(error) {
				expect(error).to.be.an('object').that.has.property('body')
					.that.is.an('object').that.has.property('StatusCode')
						.that.equals(401);
			}).then(done, done);
		});

		it('should request a new token if the old one became invalid', function(done) {
			var firstToken;
			var secondToken;
			request.authorized({
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
			}, function(error) {
				expect(error).to.be.null;
			}).then(done, done);
		});
	});

});