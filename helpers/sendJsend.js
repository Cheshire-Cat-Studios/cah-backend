//TODO: add this to the global response object/class or classify controllers and make a trait, big code smell having to parse in the res
module.exports = (res, httpCode, status, data) => {
    res.type('json')
    res.status(httpCode)
    res.json({
        status: status,
        data: data
    })
    res.end()

}