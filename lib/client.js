var dizzydataDate = require('./dizzydata-date');
var requestProvider = require('./request-provider');

var DizzydataApiClient = module.exports = function(options) {
	options || ( options = {} );
	options.url || ( options.url = 'https://api.dizzydata.com/' );
	this.request = requestProvider(options);
};

DizzydataApiClient.prototype.clients = function(options) {
	return this.request.authorized({
		method: 'GET',
		url: 'v1/clients'
	}).then(function(response) {
		return response.map(function(client) {
			return {
				id: client.OAuthClientID,
				name: client.ClientName
			}
		});
	});
};

DizzydataApiClient.prototype.updateClient = function(options) {
	return this.request.authorized({
		method: 'PUT',
		url: 'v1/clients/' + options.id,
		body: { IsActive: options.active },
	});
};

DizzydataApiClient.prototype.invoiceCount = function(options) {
	return this.request.authorized({
		method: 'GET',
		url: 'v1/statistics',
		qs: {
			resource: 'jobresultfiles',
			startdate: dizzydataDate.to(options.startDate),
			enddate: dizzydataDate.to(options.endDate),
			clientid: options.clientId
		}
	}).then(function(response) {
		return response.map(function(statistic) {
			return {
				clientId: statistic.OAuthClientID,
				total: statistic.Total || 0,
				dailyMaximum: statistic.DailyMaximum || 0,
				workflowMaximum: statistic.WorkflowMaximum || 0,
				perDays: statistic.PerDays
					.filter(function(x) { return x && typeof x.Count !== 'undefined'; })
					.map(function(x) { return { date: new Date(x.Date), count: x.Count }; })
				,
				perWorkflows: statistic.PerWorkflows
					.filter(function(x) { return x && typeof x.Count !== 'undefined'; })
					.map(function(x) { return { workflowId: x.WorkflowId, count: x.Count }; })
			};
		});
	});
};

DizzydataApiClient.prototype.administrationCount = function(options) {
	return this.request.authorized({
		method: 'GET',
		url: 'v1/statistics',
		qs: {
			resource: 'eoadmins',
			startdate: dizzydataDate.to(options.startDate),
			enddate: dizzydataDate.to(options.endDate),
			clientid: options.clientId
		}
	}).then(function(response) {
		return response.map(function(statistic) {
			return {
				clientId: statistic.OAuthClientID,
				total: statistic.Total || 0,
				dailyMaximum: statistic.DailyMaximum || 0,
				workflowMaximum: statistic.WorkflowMaximum || 0,
				perDays: statistic.PerDays
					.filter(function(x) { return x && typeof x.Count !== 'undefined'; })
					.map(function(x) { return { date: new Date(x.Date), count: x.Count }; })
				,
				perWorkflows: statistic.PerWorkflows
					.filter(function(x) { return x && typeof x.Count !== 'undefined'; })
					.map(function(x) { return { workflowId: x.WorkflowId, count: x.Count }; })
			};
		});
	});
};
