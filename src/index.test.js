import config from 'ezconf'
import DizzydataClient from './index'
import expect from 'must'

function fail(message) {
	return () => { throw new Error(message) }
}

describe('DizzydataClient', function() {

	this.timeout(60000)

	var dizzydata;

	beforeEach(function() {
		dizzydata = DizzydataClient({
			server: config.dizzydata.URL,
			credentials: {
				username: config.dizzydata.USERNAME,
				password: config.dizzydata.PASSWORD
			}
		})
	})

	describe('unauthorizedRequest(options)', function() {

		it('should respond with status code 401', () => {
			return dizzydata.unauthorizedRequest({ method: 'GET', url: 'v1/clients' })
			.then(
				fail('Expected request to fail.'),
				error => expect(error).to.have.property('statusCode', 401)
			)
		})

	})

	describe('request(options)', function() {

		it('should successfully retrieve clients', () => {
			return dizzydata.request({ method: 'GET', url: 'v1/clients' })
		})

	})

})