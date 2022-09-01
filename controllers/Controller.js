module.exports = class Controller {
    constructor(req, res) {
        this.req = req
        this.res = res
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
}