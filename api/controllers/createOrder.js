let getItemInCart = require('./getItemInCart')
let ObjectID = require('mongodb').ObjectID

/*
 * Functin to mark item as processed in cart table.
 * Input userID
 * Output success/error of update query
 */
let MarkProcessedClass = class markProcessed {
  func (userId) {
    let deferred = q.defer()
    let query = `update cart set is_processed = 1 where user_id = ${userId} and is_processed = 0 and is_removed = 0`
    // console.log("queryyyyyyyyyyyyy", query)
    dbQuery(query)
      .then(function (dbResponse) {
        // console.log("dbbbbbbb", dbResponse)
        if (dbResponse.affectedRows > 0) {
          deferred.resolve({ code: 1001, message: 'Order placed successfully' })
        } else {
          deferred.resolve({ code: 1008, message: 'Error while processing Cart' })
        }
      })
      .catch(function (err) {
        console.log('errr while processing cart----->', err)
        deferred.reject({ errorCode: 3001, detail: 'data client error' })
      })
    return deferred.promise
  }
}

/*
 * Functin to insert item in order table.
 * Input cart data
 * Output success/error of insert query
 */
let InsertOrdrInTableClass = class insertOrdrInTable {
  func (input, dbCartData) {
    let deferred = q.defer()
    // let query = `update cart set is_removed = 1 where id = ${input.cartId}`
    let status = 'pending'
    let orderId = ObjectID().toString()
    let address = input.address.split("'").join("''")
    let paymentOption = input.paymentOption
    let orderTotal = 0
    let tax = input.tax
    let cartData = JSON.stringify(dbCartData).split("'").join("''")
    _.each(dbCartData, function (singleData) { /* console.log(orderTotal, '<--order total | data -->', singleData.price) */; orderTotal += singleData.price })
    // console.log('queryyyyyyyyyyyyy', orderTotal)
    let query = `insert into order_table (status,order_no,address,payment_option,order_total,tax,cart_data) values 
                 ('${status}','${orderId}','${address}','${paymentOption}',${orderTotal},${tax},'${cartData}')`
    dbQuery(query)
      .then(function (dbResponse) {
        // console.log('dbbbbbbb', dbResponse)
        if (dbResponse.insertId > 0) {
          deferred.resolve({ code: 1001, message: 'Order inserted successfully' })
        } else {
          deferred.resolve({ code: 1007, message: 'order not created' })
        }
      })
      .catch(function (err) {
        console.log('errr while inserting in order table ----->', err)
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
   * Input user id from session
   * Output response of API
   */
let MainFunc = class mainFuncclass {
  constructor (request, userId) {
    console.log('it works', userId)
    let deferred = q.defer()
    let inputValidator = new validate.CreateOrderValidator(request)
    let getItemInCartFunc = new getItemInCart.GetItemInCartFunc()
    let insertOrdrInTable = new InsertOrdrInTableClass()
    let markProcessed = new MarkProcessedClass()
    inputValidator
      .then(function (cartData) {
        return getItemInCartFunc.func(userId)
      })
      .then(function (cartData) {
        if (cartData.code === 1005) return cartData
        // console.log('data found in cart')
        return insertOrdrInTable.func(request.data, cartData.data)
      })
      .then(function (insertResponse) {
        if (insertResponse.code === 1005) return insertResponse
        if (insertResponse.code === 1007) return insertResponse
        // console.log('data found in cart and order inserted in order table')
        return markProcessed.func(userId)
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
