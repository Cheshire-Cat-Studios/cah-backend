module.exports = class Middleware {
	prepareRequest(req, res, next) {
		this.req = req
		this.res = res
		this.next = next

		return this
	}

	sendJsend(httpCode, status, data) {
		this.res.type('json')
		this.res.status(httpCode)
		this.res.json({
			status: status,
			data: data
		})
		this.res.end()
	}

	//TODO: replace below with setters here and in the RouteServiceProvider.js
	handle(){

	}
}