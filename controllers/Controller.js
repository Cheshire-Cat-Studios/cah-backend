module.exports = class Controller {
    //
    // addValidationGetters(){
    //     Object.keys(this.validation)
    //         .forEach( method => {
    //             Object.defineProperty(
    //                 this,
    //                 method,
    //                 {
    //                     get() {
    //                         this.validation[internalKey]
    //                     },
    //                 }
    //             )
    //         })
    // }

    sendJsend(res, httpCode, status, data) {
        res.type('json')
        res.status(httpCode)
        res.json({
            status: status,
            data: data
        })
        res.end()
    };
}