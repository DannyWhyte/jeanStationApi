/*
 * Functin for inserting data in db . 
 * Input unique json array with previous id
 * Output insert and update response
 */
var insertInDb = function(withUniqId) {
    let deferred = q.defer();
    console.log("inside insert script", withUniqId)
        // deferred.resolve(uniqueRequest)
    let insertQuery = "";
    _.each(withUniqId, function(singleJson) {
        if (singleJson.productTableId) {
            let updateTableQuery = `update product set is_active = false where id = ${singleJson.productTableId};
                                    update image_path set is_active = false where prod_id  = ${singleJson.productTableId};
                                    update product_size set is_active = false where prod_id  = ${singleJson.productTableId};`;
            insertQuery = insertQuery + updateTableQuery;
        }
        let prodInsert = `insert into  product (category,gender,price,discount,brand,product_name,tax)
                          values (${singleJson.category},${singleJson.gender},${singleJson.price},${singleJson.discount},lower('${singleJson.brand}'),
                          LOWER('${singleJson.productName}'),${singleJson.tax});`
        insertQuery = insertQuery + prodInsert;
        _.each(singleJson.size, function(singleSize) {
            let sizeInsert = `insert into product_size (prod_id,size) values ((SELECT max(id) FROM product),lower('${singleSize}'));`
            insertQuery = insertQuery + sizeInsert;
        })
        let n = 0;
        _.each(singleJson.imagePath, function(singlepath) {
            let pathInsert = `insert into image_path (prod_id,path,position) values ((SELECT max(id) FROM product),'${singlepath}',${singleJson.imagePosition[n]});`
            insertQuery = insertQuery + pathInsert;
            n++
        })
    })
    console.log("insertttttttttttt", insertQuery)
    dbQuery(insertQuery)
        .then(function(response) {
            // console.log("recieved", response)
            deferred.resolve("Data Inserted Succesfully")
        })
        .catch(function(err) {
            console.log("errr while inserting----->", err)
            deferred.reject(err)
        })

    return deferred.promise;
}

/*
 * Functin to get previous id to set is_active false record for old record to avoid duplicate. 
 * Input unique json array
 * Output unique json array with previous id
 */
var getPreviousId = function(uniqAray) {
    let deferred = q.defer();
    let query = ""
    _.each(uniqAray, function(singleJson) {
        // console.log("sssssssssssss", singleJson)
        query = query + `select id from product where lower(brand) = lower('${singleJson.brand}') and lower(product_name) = lower('${singleJson.productName}') and category = ${singleJson.category} and gender = ${singleJson.gender} and is_active = true;`
    })
    console.log("queryyyyyyyyyyyyy", query)
    dbQuery(query)
        .then(function(dbResponse) {
            // console.log("dbbbbbbb", dbResponse, !(dbResponse[0].constructor === Array));
            if (!(dbResponse[0].constructor === Array)) {
                // console.log("its not an array");
                dbResponse = [dbResponse];
            }
            let withIdArray = [];
            let n = 0;
            _.each(uniqAray, function(singleJson) {
                // console.log("aaaaaaaaaaaaaaaaaaaa", singleJson, dbResponse[n])
                if (!_.isEmpty(dbResponse[n])) {
                    // console.log("need to add id")
                    singleJson.productTableId = dbResponse[n][0].id;
                }
                withIdArray.push(singleJson)
                n++;
            })
            deferred.resolve(withIdArray);
        })
        .catch(function(err) {
            console.log("errr while getting id----->", err)
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