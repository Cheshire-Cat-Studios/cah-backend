const get = require('lodash.get'),
    routes = require('../../config/routes')

module.exports = (path_name, parameters) => {
    let url_path = get(routes, path_name)

    if (!url_path) {
        throw new Error(`route ${name} does not exist`)
    }

    if(!parameters){
        return process.env.VUE_APP_BACKEND_URL + url_path
    }

    if(typeof parameters === 'string'){
        url_path = url_path.replace('?', parameters)
    }else{
        parameters.length
            ? parameters.forEach(parameter => {
                url_path = url_path.replace(new RegExp('(:)\\w+'), parameter)
            })
            : Object.keys(parameters).forEach(parameter => {
                url_path = url_path.replace(':'+parameter, parameters[parameter])
            })
    }

    return process.env.VUE_APP_BACKEND_URL + url_path
}