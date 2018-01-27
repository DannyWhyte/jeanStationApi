/*
 * Functin to create script for inserting data in db . 
 * Input unique json array with previous id
 * Output insert and update script
 */
var createInsertScript = function(withUniqId) {
    let deferred = q.defer();
    console.log("inside insert script", withUniqId)
        // deferred.resolve(uniqueRequest)
    return deferred.promise;
}

/*
 * Functin to get previous id to set is_active false record for old record to avoid duplicate. 
 * Input unique json array
 * Output unique json array with previous id
 */
var getPreviousId = function(uniqAray) {
    let deferred = q.defer();
    let query = `select id,brand,product_name,category,gender from product where (lower(brand),lower(product_name),category,gender) in (`
    _.each(uniqAray, function(singleJson) {
        // console.log("sssssssssssss", singleJson)
        query = query + `(lower('${singleJson.brand}'),lower('${singleJson.productName}'),${singleJson.category},${singleJson.gender}),`
    })
    query = query.substr(0, query.length - 1) + `);`
        // console.log("queryyyyyyyyyyyyy", query)
    dbQuery(query)
        .then(function(result) {
            console.log(result)
            if (!_.isEmpty(result)) {
                return result;
            } else {
                return false;
            }
        })
        .then(function(dbResponse) {
            if (!dbResponse) {
                deferred.resolve(uniqAray)
                console.log("no need to add id")
            } else {
                let withIdArray = [];
                _.each(dbResponse, function(singleJson) {
                    console.log("aaaaaaaaaaaaaaaaaaaa", singleJson)
                    let findJson = {
                        brand: singleJson.brand.toLowerCase(),
                        productName: singleJson.product_name.toLowerCase(),
                        category: singleJson.category,
                        gender: singleJson.gender
                    }
                    let found = _.findWhere(uniqAray, findJson)
                    if (found) {
                        // found
                    }
                    console.log("foundddddddddd", found)
                })
                console.log("need to add id")
            }
        })
        .catch(function(err) {
            console.log("errr ----->", err)
            deferred.reject(err)
        })
    return deferred.promise;
}

/*
 * Functin to filter unique json . 
 * Input validation passed json array
 * Output unique json array
 */
var getUniqueRequestBody = function(request) {
    let deferred = q.defer();
    // console.log("input req --->", request)
    let uniqueRequestString = _.uniq(_.map(request, function(json) { return JSON.stringify(json); }));
    // console.log("uniq but str --->", uniqueRequestString)
    let uniqueRequest = _.map(uniqueRequestString, function(string) { return JSON.parse(string); })
        // console.log("uniq req --->", uniqueRequest)
    deferred.resolve(uniqueRequest)
    return deferred.promise;
}

/*
 * Functin to insert new data and update repeated data in db. 
 * Input validation passed json array
 * Output insert/update Response
 */
var insertIntoDb = function(request) {
    let deferred = q.defer();
    getUniqueRequestBody(request)
        .then(function(uniqueReq) {
            return getPreviousId(uniqueReq)
        })
        .then(function(uniqueReqWithPrevId) {
            return createInsertScript(uniqueReqWithPrevId)
        })
        .then(function(insertScriptResponse) {
            return insertInDb(insertScriptResponse)
        })
        .then(function(insertResponse) {
            deferred.resolve(insertResponse)
        })
        .catch(function(err) {
            console.log("errr ----->", err)
            deferred.reject(err)
        })
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
            return insertIntoDb(validationResponse.data)
        })
        .then(function(finalResponse) {
            let toSend = { code: 2001, message: finalResponse.message, data: finalResponse }
            deferred.resolve(toSend)
        })
        .catch(function(err) {
            console.log("errr ----->", err)
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
            console.log("done")
            res.status(200).send(mainFuncResponse)
        })
        .catch(function(err) {
            res.status(500).send(err)
        })
}

module.exports.addProducts = addProducts;