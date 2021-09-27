module.exports = (res, httpCode, status, data) => {
    res.type('json')
    res.status(httpCode)
    res.json({
        status: status,
        data: data
    })
    res.end()

}