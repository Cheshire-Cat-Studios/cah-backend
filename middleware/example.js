module.exports = (req, res, next) => {
    console.log('Request at: ', Date.now())
    next()
}