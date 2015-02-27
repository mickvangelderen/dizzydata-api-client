var chai = require('chai');
chai.config.includeStack = true;
var expect = chai.expect;
var config = require('ezconf');
var DizzydataApiClient = require('../lib/client');

describe('Dizzydata', function() {

	this.timeout(60000);

	var dizzydata;

	beforeEach(function() {
		dizzydata = new DizzydataApiClient({
			url: config.dizzydata.URL,
			username: config.dizzydata.USERNAME,
			password: config.dizzydata.PASSWORD
		});
	});


	describe('_requestToken', function() {
		it('should return an access token', function(done) {
			dizzydata._requestToken().then(function(token) {
				expect(token).to.be.a('string');
			}, function(error) {
				expect(error).to.be.null;
			}).then(done, done);
		});
	});

	describe('_authorizedRequest', function() {
		it('should get an access token and complete the request', function(done) {
			dizzydata._authorizedRequest({
				method: 'GET', url: dizzydata.baseUrl + 'v1/clients'
			}).then(function(response) {
				expect(response).to.be.an('array').with.length.above(0);
				return dizzydata.token;
			}).then(function(token) {
				expect(token).to.be.a('string');
			}, function(error) {
				expect(error).to.be.null;
			}).then(done,done);
		});

		it('should reuse access tokens', function(done) {
			// check that there is no token
			expect(dizzydata.token).to.be.null;
			// issue some request
			dizzydata._authorizedRequest({
				method: 'GET', url: dizzydata.baseUrl + 'v1/clients'
			}).then(function(response) {
				// request successful
				return dizzydata.token.then(function(lastToken) {
					// check that the token is a string
					expect(lastToken).to.be.a.string;
					// issue another request
					return dizzydata._authorizedRequest({
						method: 'GET', url: dizzydata.baseUrl + 'v1/clients'
					}).then(function(response) {
						// request successful
						return dizzydata.token.then(function(currentToken) {
							// check that the current token is equal to the last token
							expect(lastToken).to.equal(currentToken);
						});
					});
				});
			}).catch(function(error) {
				expect(error).to.be.null;
			}).then(done,done);
		});

		it('should fail if the username or password is invalid', function(done) {
			dizzydata.username = 'I do not exist';
			dizzydata.password = 'I am not a valid password';
			dizzydata._authorizedRequest({
				method: 'GET', url: dizzydata.baseUrl + 'v1/clients'
			}).then(function() {
				expect(true).to.be.false;
			}, function(error) {
				expect(error).to.be.an('object').that.has.property('body')
					.that.is.an('object').that.has.property('StatusCode')
						.that.equals(401);
			}).then(done, done);
		});

		it('should request a new token if the old one became invalid', function(done) {
			var previousToken;
			dizzydata._authorizedRequest({
				method: 'GET', url: dizzydata.baseUrl + 'v1/clients'
			}).then(function() {
				// invalidate token by requesting a new one and not saving it
				return dizzydata._requestToken()
			}).then(function(token) {
				expect(token).to.be.a.string;
				previousToken = token;
				// do another request
				return dizzydata._authorizedRequest({
					method: 'GET', url: dizzydata.baseUrl + 'v1/clients'
				});
			}).then(function() {
				// obtain the new token
				return dizzydata.token;
			}).then(function(token) {
				expect(token).to.be.a.string;
				expect(token).to.not.equal(previousToken);
			}, function(error) {
				expect(error).to.be.null;
			}).then(done, done);
		});
	});

	describe('clients', function() {
		it('should return all clients', function(done) {
			dizzydata.clients().then(function(response) {
				expect(response).to.be.an('array').with.length.above(0);
				response.forEach(function(client) {
					expect(client).to.have.property('id').that.is.a('number');
					expect(client).to.have.property('name').that.is.a('string');
				});
			}, function(error) {
				expect(error).to.be.null;
			}).then(done, done);
		});

		it('should update a client', function(done) {
			dizzydata.updateClient({
				id: config.test.CLIENT_ID,
				active: true
			}).then(function(response) {
				expect(response).to.be.an('object')
					.that.has.property('StatusCode').that.equals(200);
			}, function(error) {
				expect(error).to.be.null;
			}).then(done, done);
		});
	});

	describe('invoiceCount', function() {
		it('should return the number of invoices processed', function(done) {
			dizzydata.invoiceCount({
				startDate: new Date('2014-01-01'),
				endDate: new Date('2015-01-01')
			}).then(function(response) {
				expect(response).to.be.an('array').with.length.above(0);
				response.forEach(function(statistic) {
					expect(statistic).to.have.property('clientId').that.is.a('number');
					expect(statistic).to.have.property('perDays').that.is.an('array');
					var dailyMaximum = 0, dailyTotal = 0;
					statistic.perDays.forEach(function(perDay) {
						expect(perDay).to.be.an('object')
							.that.has.property('date').that.is.a('date');
						expect(perDay).to.be.an('object')
							.that.has.property('count').that.is.a('number');
						dailyTotal += perDay.count;
						if (dailyMaximum < perDay.count) { dailyMaximum = perDay.count; }
					});
					expect(statistic).to.have.property('dailyMaximum').that.equals(dailyMaximum);

					expect(statistic).to.have.property('perWorkflows').that.is.an('array');
					var workflowMaximum = 0, workflowTotal = 0;
					statistic.perWorkflows.forEach(function(perWorkflow) {
						expect(perWorkflow).to.have.property('workflowId').that.is.a('number');
						expect(perWorkflow).to.have.property('count').that.is.a('number');
						workflowTotal += perWorkflow.count;
						if (workflowMaximum < perWorkflow.count) { workflowMaximum = perWorkflow.count; }
					});
					expect(statistic).to.have.property('workflowMaximum').that.equals(workflowMaximum);

					expect(dailyTotal, 'expect totals to match').to.equal(workflowTotal);
					expect(statistic).to.have.property('total').that.equals(dailyTotal);
				});
			}, function(error) {
				expect(error).to.be.null;
			}).then(done, done);
		});

		it('should return the number of invoices processed for a single client', function(done) {
			dizzydata.invoiceCount({
				clientId: config.test.CLIENT_ID,
				startDate: new Date('2014-01-01'),
				endDate: new Date('2015-01-01')
			}).then(function(response) {
				expect(response).to.be.an('array').with.length(1);
			}, function(error) {
				expect(error).to.be.null;
			}).then(done, done);
		});
	});

	describe('administrationCount', function() {
		it('should return the number of administrations processed', function(done) {
			dizzydata.administrationCount({
				startDate: new Date('2014-01-01'),
				endDate: new Date('2015-01-01')
			}).then(function(response) {
				expect(response).to.be.an('array').with.length.above(0);
				response.forEach(function(statistic) {
					expect(statistic).to.have.property('clientId').that.is.a('number');

					expect(statistic).to.have.property('perDays').that.is.an('array');
					var dailyMaximum = 0, dailyTotal = 0;
					statistic.perDays.forEach(function(perDay) {
						expect(perDay).to.be.an('object')
							.that.has.property('date').that.is.a('date');
						expect(perDay).to.be.an('object')
							.that.has.property('count').that.is.a('number');
						dailyTotal += perDay.count;
						if (dailyMaximum < perDay.count) { dailyMaximum = perDay.count; }
					});
					expect(statistic).to.have.property('dailyMaximum').that.equals(dailyMaximum);

					expect(statistic).to.have.property('perWorkflows').that.is.an('array').with.length(0);
					// perWorkflows is an empty array for eoadmins statistic...

					expect(statistic).to.have.property('total').that.equals(dailyTotal);
				});
			}, function(error) {
				expect(error).to.be.null;
			}).then(done, done);
		});

		it('should return the number of administrations processed for a single client', function(done) {
			dizzydata.administrationCount({
				clientId: config.test.CLIENT_ID,
				startDate: new Date('2014-01-01'),
				endDate: new Date('2015-01-01')
			}).then(function(response) {
				expect(response).to.be.an('array').with.length(1);
			}, function(error) {
				expect(error).to.be.null;
			}).then(done, done);
		});
	});
});