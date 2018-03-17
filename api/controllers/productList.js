/*
 * Functin called by mainFunc 
 * This is the function which is used to get data from db
 * Input genderId
 * Output toSend (array of data from db)
 */
var getDataFromDb = function(genderId) {
    let deferred = q.defer();
    let query = `select p.id,p.product_name,p.brand,p.price,p.discount,g.name as gender,i.path as  image_path
    from product p 
    left join gender_master g on p.gender = g.id and g.is_active = true
    left join image_path i on p.id = i.prod_id and i.position = 1 and i.is_active = true
    where p.is_active = true and p.gender = ${genderId};`
    dbQuery(query)
        .then(function(dbResponse) {
            if (!_.isEmpty(dbResponse)) {
                _.each(dbResponse, function(singleJson) {
                    let discountedPrice = Math.round((singleJson.price * (100 - singleJson.discount)) / 100);
                    singleJson.discountedPrice = discountedPrice;
                })
                let toSend = { code: 1001, message: "data fetched successfully", data: dbResponse }
                deferred.resolve(toSend)
            } else {
                let toSend = { code: 1003, message: "No data found", data: [] }
                deferred.resolve(toSend)
            }
        })
        .catch(function(err) {
            deferred.reject({ errorCode: 3001, detail: "data client error" })
        })
    return deferred.promise;

}

/*
 * Functin called by exported function 
 * This is the main API core function which processes the request
 * Exported function is just a wrapper on this function,This has been done to re-use this function
   by exporting this function if needed
 * Input req.query
 * Output response of API
 */
var mainFunc = function(request) {
    let deferred = q.defer();
    // console.log(request)
    validate.productListValidator(request)
        .then(function(validationResponse) {
            // console.log("afer validation", request)
            return getDataFromDb(request.gender)
        })
        .then(function(finalResponse) {
            let toSend = { code: finalResponse.code, message: finalResponse.message, data: finalResponse.data }
            deferred.resolve(toSend)
        })
        .catch(function(err) {
            console.log("errr ----->", err)
            let toSend = { code: 4001, errorCode: err.errorCode, message: err.detail }
            deferred.reject(toSend)
        })
    return deferred.promise;
}

/*
 * Function exported to app.js which is called on route match
 * input req
 * output res
 */
var productList = function(req, res) {
    let body = req.query;
    mainFunc(body)
        .then(function(mainFuncResponse) {
            // console.log("done")
            res.status(200).send(mainFuncResponse)
        })
        .catch(function(err) {
            res.status(500).send(err)
        })
}

module.exports.productList = productList;