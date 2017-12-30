/*
 * Functin to insert new data and update repeated data in db. 
 * Input validation passed json array
 * Output insert/update Response
 */
var insertIntoDb = function(request) {
    let deferred = q.defer();

    return deferred.promise;
}

/*
 * Functin called by exported function 
 * This is the main API core function which processes the request
 * Exported function is just a wrapper on this function,This has been done to re-use this function
   by exporting this function if needed
 * Input req.body
 * Output response of API
 */
var mainFunc = function(request) {
    let deferred = q.defer();
    validate.addProductsValidator(request)
        .then(function(validationResponse) {
            return insertIntoDb(validationResponse)
        })
        .then(function(finalResponse) {
            let toSend = { code: 2001, message: finalResponse.message, userDetails: finalResponse.userDetails, sessionId: finalResponse.sessionID }
            deferred.resolve(toSend)
        })
        .catch(function(err) {
            let toSend = { code: 4001, message: err }
            deferred.reject(toSend)
        })
    return deferred.promise;
}

/*
 * Function exported to app.js which is called on route matc
 * input req
 * output res
 */
var addProducts = function(req, res) {
    let body = req.body;
    mainFunc(body)
        .then(function(mainFuncResponse) {
            res.status(200).send(mainFuncResponse)
        })
        .catch(function(err) {
            res.status(500).send(err)
        })
}

module.exports.addProducts = addProducts;