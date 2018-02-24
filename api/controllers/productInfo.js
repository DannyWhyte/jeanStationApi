/*
 * Functin called by mainFunc 
 * This is the function which formats data in required form
 * Input data(DB data)
 * Output data (with formated json)
 */
var formatData = function(data) {
    let deferred = q.defer();
    if (data.code == 1003) {
        deferred.resolve(data)
    } else {
        // console.log("lets format", data)
        let json = {}
        let path = _.uniq(_.pluck(data.data, 'path'));
        let position = _.uniq(_.pluck(data.data, 'position'));

        json.brand = _.uniq(_.pluck(data.data, 'brand'))[0];
        json.productName = _.uniq(_.pluck(data.data, 'product_name'))[0];
        json.price = _.uniq(_.pluck(data.data, 'price'))[0];
        json.discount = _.uniq(_.pluck(data.data, 'discount'))[0];
        json.discountedPrice = Math.round((json.price * (100 - json.discount)) / 100);
        json.tax = _.uniq(_.pluck(data.data, 'tax'))[0];
        json.gender = _.uniq(_.pluck(data.data, 'gender'))[0];
        json.category = _.uniq(_.pluck(data.data, 'category'))[0];
        json.size = _.uniq(_.pluck(data.data, 'size'));

        json.imageArray = []
        for (i = 0; i < path.length; i++) {
            json.imageArray.push({ path: path[i], position: position[i] })
        }

        data.data = json
        deferred.resolve(data);
        // console.log("brannnnnnd", brand, productName, price, discount, discountedPrice, tax, gender, category, size)
        // console.log("brannnnnnd", path, position)
    }
    return deferred.promise;
}

/*
 * Functin called by mainFunc 
 * This is the function which is used to get data from db
 * Input prodId
 * Output toSend (array of data from db) 
 */
var getDataFromDb = function(prodId) {
    let deferred = q.defer();
    let query = `select p.brand,p.product_name,p.price,p.discount,p.tax,gm.name as gender
    ,cm.name as category,ps.size,ip.path,ip.position
    from product p 
    left join category_master cm on p.category = cm.id and cm.is_active = true
    left join gender_master gm on p.gender = gm.id and gm.is_active = true
    left join product_size ps on p.id = ps.prod_id and ps.is_active = true
    left join image_path ip on p.id = ip.prod_id and ip.is_active = true
    where p.is_active = true and p.id = ${prodId};`
        // console.log(query)
    dbQuery(query)
        .then(function(dbResponse) {
            // console.log("received data")
            if (!_.isEmpty(dbResponse)) {
                let toSend = { code: 1001, message: "data fetched successfully", data: dbResponse }
                deferred.resolve(toSend)
            } else {
                let toSend = { code: 1003, message: "No data found", data: [] }
                deferred.resolve(toSend)
            }
        })
        .catch(function(err) {
            console.log("db error -------->", err)
            deferred.reject(err)
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
    validate.productInfoValidator(request)
        .then(function(validationResponse) {
            // console.log("afer validation", request)
            return getDataFromDb(request.prodId)
        })
        .then(function(dbResponse) {
            // console.log("afer validation", request)
            return formatData(dbResponse)
        })
        .then(function(finalResponse) {
            let toSend = { code: finalResponse.code, message: finalResponse.message, data: finalResponse.data }
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
 * Function exported to app.js which is called on route match
 * input req
 * output res
 */
var productInfo = function(req, res) {
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

module.exports.productInfo = productInfo;