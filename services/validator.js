var Validator = require('jsonschema').Validator;
var v = new Validator();

var loginValidator = function(request) {
    var deferred = q.defer();
    var schema1 = {
        "id": "/login",
        "type": "object",
        "properties": {
            "data": {
                "type": "object",
                "required": true,
                "properties": {
                    "userName": {
                        "type": "string",
                        "required": true,
                        "minLength": 1,
                    },
                    "password": {
                        "type": "string",
                        "minLength": 1,
                        "required": true
                    }
                }
            }
        }
    };
    v.addSchema(schema1, '/login');
    var error = _.pluck(v.validate(request, schema1).errors, 'stack');
    var formated_error = [];
    // console.log("ssssssssssssssssssssssssssssss", error)
    _.each(error, function(err) {
        // console.log('VALIDATE: ', err.replace('instance.', '').replace('].', '] ').replace('data.', ''));
        var formatedErr = err.split('.')
        formated_error.push(formatedErr[formatedErr.length - 1]);
    });
    if (formated_error.length > 0) {
        deferred.reject({
            "status": "fail",
            "error": formated_error
        });
    } else {
        deferred.resolve(request);
    }
    return deferred.promise;
}


module.exports.loginValidator = loginValidator;