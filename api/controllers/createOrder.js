let getItemInCart = require('./getItemInCart')
let ObjectID = require('mongodb').ObjectID
/*
 * Functin to insert item in order table.
 * Input cart data
 * Output success/error of insert query
 */
let InsertOrdrInTableClass = class insertOrdrInTable {
  func (input) {
    let deferred = q.defer()
    // let query = `update cart set is_removed = 1 where id = ${input.cartId}`
    let orderId = ObjectID().toString()
    let cartData = JSON.stringify(input)
    console.log('queryyyyyyyyyyyyy', orderId, cartData)
    // dbQuery(query)
    //   .then(function (dbResponse) {
    //     // console.log("dbbbbbbb", dbResponse)
    //     if (dbResponse.affectedRows > 0) {
    //       deferred.resolve({ code: 1001, message: 'Item Successfully Removed From Cart' })
    //     } else {
    //       deferred.resolve({ code: 1006, message: 'No Such Item Present In Cart' })
    //     }
    //   })
    //   .catch(function (err) {
    //     console.log('errr while getting id----->', err)
    //     deferred.reject({ errorCode: 3001, detail: 'data client error' })
    //   })
    return deferred.promise
  }
}

/*
   * Functin called by exported function
   * This is the main API core function which processes the request
   * Exported function is just a wrapper on this function,This has been done to re-use this function
     by exporting this function if needed
   * Input user id from session
   * Output response of API
   */
let MainFunc = class mainFuncclass {
  constructor (request, userId) {
    console.log('it works', userId)
    let deferred = q.defer()
    let getItemInCartFunc = new getItemInCart.GetItemInCartFunc()
    let insertOrdrInTable = new InsertOrdrInTableClass()
    let inputValidator = new validate.CreateOrderValidator(request)
    inputValidator
      .then(function (cartData) {
        return getItemInCartFunc.func(userId)
      })
      .then(function (cartData) {
        if (cartData.code === 1005) return cartData
        // console.log('data found in cart')
        return insertOrdrInTable.func(cartData.data)
      })
      .then(function (finalResponse) {
        let toSend = { code: finalResponse.code, message: finalResponse.message }
        deferred.resolve(toSend)
      })
      .catch(function (err) {
        console.log('errr ----->', err)
        let toSend = { code: 4001, message: err }
        deferred.reject(toSend)
      })
    return deferred.promise
  }
}

/*
   * Function exported to app.js which is called on route match
   * input req
   * output res
   */
let createOrder = function (req, res) {
//   let userId = req.session2.currentUser.userDetails.userId
  let userId = 4
  let body = req.body
  let mainFunction = new MainFunc(body, userId)
  mainFunction
    .then(function (mainFuncResponse) {
      res.status(200).send(mainFuncResponse)
    })
    .catch(function (err) {
      res.status(500).send(err)
    })
}

module.exports.createOrder = createOrder
