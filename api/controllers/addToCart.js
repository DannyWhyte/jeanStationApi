/*
 * Functin to insert data into db.
 * Input json
 * Output success/error message
 */
let InsertDataClass = class insertData {
  func (input) {
    let deferred = q.defer()
    let query = ` insert into cart (prod_id,user_id,selected_size,quantity) values (${input.prodId},${input.userId},lower('${input.size}'),${input.quantity})`
    // console.log("queryyyyyyyyyyyyy", query)
    dbQuery(query)
      .then(function (dbResponse) {
        // console.log("dbbbbbbb", dbResponse)
        deferred.resolve({ code: 1001, message: 'Item has been added to cart.' })
      })
      .catch(function (err) {
        console.log('errr while getting id----->', err)
        deferred.reject({ errorCode: 3001, detail: 'data client error' })
      })
    return deferred.promise
  }
}

/*
 * Functin to check if order already placed.
 * Input json
 * Output order already done/input if no result found
 */
let CheckDuplicateClass = class checkDuplicate {
  func (input) {
    let deferred = q.defer()
    let query = `select id from cart where is_active = true and prod_id = ${input.prodId} and user_id = ${input.userId} 
        and lower(selected_size) = lower('${input.size}') and is_processed = false and is_removed = false`
    // console.log("queryyyyyyyyyyyyy", query)
    dbQuery(query)
      .then(function (dbResponse) {
        // console.log("dbbbbbbb", dbResponse)
        if (!_.isEmpty(dbResponse)) {
          deferred.resolve({ code: 1004, message: 'Item already present in cart.' })
        } else {
          deferred.resolve(input)
        }
      })
      .catch(function (err) {
        console.log('errr while getting id----->', err)
        deferred.reject({ errorCode: 3001, detail: 'data client error' })
      })
    return deferred.promise
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
let MainFunc = class mainFuncclass {
  constructor (request) {
    // console.log("it works", request)
    let deferred = q.defer()
    let inputValidator = new validate.AddToCartValidator(request)
    let checkDuplicate = new CheckDuplicateClass()
    let insertData = new InsertDataClass()
    inputValidator
      .then(function (validationResponse) {
        return checkDuplicate.func(validationResponse.data)
      })
      .then(function (checkDuplicateResponse) {
        if (checkDuplicateResponse.code === 1004) {
          return checkDuplicateResponse
        } else {
          console.log('time to insert into cart')
          return insertData.func(checkDuplicateResponse)
        }
      })
      .then(function (finalResponse) {
        let toSend = { code: finalResponse.code, message: finalResponse.message }
        deferred.resolve(toSend)
      })
      .catch(function (err) {
        console.log('errr ----->', err)
        let toSend = { code: 4001, errorCode: err.errorCode, message: err.detail }
        deferred.reject(toSend)
      })
    return deferred.promise
  }
}

/*
 * Function exported to app.js which is called on route matc
 * input req
 * output res
 */
let addToCart = function (req, res) {
  let body = req.body
  body.data.userId = req.session2.currentUser.userDetails.userId
  let mainFunction = new MainFunc(body)
  // body.data.userId = 4;
  mainFunction
    .then(function (mainFuncResponse) {
      // console.log("done")
      res.status(200).send(mainFuncResponse)
    })
    .catch(function (err) {
      res.status(500).send(err)
    })
}

module.exports.addToCart = addToCart
