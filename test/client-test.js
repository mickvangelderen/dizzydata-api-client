var expect = require('./expect');
var config = require('ezconf');
var DizzydataApiClient = require('../lib/client');

describe('lib/client.js', function() {

	this.timeout(60000);

	var dizzydata;

	beforeEach(function() {
		dizzydata = new DizzydataApiClient({
			url: config.dizzydata.URL,
			username: config.dizzydata.USERNAME,
			password: config.dizzydata.PASSWORD
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
				startDate: new Date('2015-01-01'),
				endDate: new Date('2015-05-01')
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