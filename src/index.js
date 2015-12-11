import originalRequest from 'request-promise'

export default function DizzydataClient(options) {

	const { server = 'https://api.dizzydata.com', credentials = {} } = options

	let token = null

	const unauthorizedRequest = originalRequest.defaults({
		baseUrl: server,
		json: true,
		resolveWithFullResponse: true,
	})

	const authorizedRequest = unauthorizedRequest.defaults({
		auth: {
			sendImmediately: true,
			bearer: () => token,
		}
	})

	function refreshToken() {
		return unauthorizedRequest({
			method: 'POST', url: 'v1/oauth2/token',
			form: {
				grant_type: 'password',
				scope: 'test',
				username: credentials.username,
				password: credentials.password,
			},
		}).then(response => {
			token = response.body.access_token
			return token
		})
	}

	return {
		request(options) {
			return authorizedRequest(options).catch(response => {
				if (!(response && response.statusCode === 401)) throw response 
				return refreshToken().then(
					() => authorizedRequest(options),
					() => { throw response })
			})
		},
		unauthorizedRequest(options) {
			return unauthorizedRequest(options)
		}
	}

}