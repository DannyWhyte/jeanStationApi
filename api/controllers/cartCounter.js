/*
 * Functin to get count of total items in cart of a user. 
 * Input userID from session 
 * Output count of total items
 */
let getCountClass = class getCount {
    func(input) {
        let deferred = q.defer();
        let query = ` select count(1) as total_items from cart where is_active = true and user_id = ${input}
        and is_processed = false and is_removed = false`
            // console.log("queryyyyyyyyyyyyy", query)
        dbQuery(query)
            .then(function(dbResponse) {
                // console.log("dbbbbbbb", dbResponse)
                deferred.resolve({ code: 1001, count: dbResponse[0].total_items })
            })
            .catch(function(err) {
                console.log("errr while getting id----->", err)
                deferred.reject({ errorCode: 3001, detail: "data client error" })
            })
        return deferred.promise;
    }
}

/*
 * Functin called by exported function 
 * This is the main API core function which processes the request
 * Exported function is just a wrapper on this function,This has been done to re-use this function
   by exporting this function if needed
 * Input req.body
 * Output response of API
 */
let mainFunc = class mainFuncclass {
    constructor(request) {
        // console.log("it works", request)
        let deferred = q.defer();
        let getCount = new getCountClass;
        getCount.func(request)
            .then(function(finalResponse) {
                let toSend = { code: finalResponse.code, count: finalResponse.count }
                deferred.resolve(toSend)
            })
            .catch(function(err) {
                console.log("errr ----->", err)
                let toSend = { code: 4001, errorCode: err.errorCode, message: err.detail }
                deferred.reject(toSend)
            })
        return deferred.promise;
    }
}

/*
 * Function exported to app.js which is called on route matc
 * input req
 * output res
 */
let cartCounter = function(req, res) {
    let userId = req.session2.currentUser.userDetails.userId;
    // let userId = 4;
    let mainFunction = new mainFunc(userId)
    mainFunction
        .then(function(mainFuncResponse) {
            // console.log("done")
            res.status(200).send(mainFuncResponse)
        })
        .catch(function(err) {
            res.status(500).send(err)
        })
}

module.exports.cartCounter = cartCounter;