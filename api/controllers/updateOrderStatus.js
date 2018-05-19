/*
 * Functin to update status of order.
 * Input order no and new status
 * Output success/error of update query
 */
let UpdateClass = class update {
  func (input) {
    let deferred = q.defer()
    let query
    if (input.newStatus === 7) {
      query = `update order_table set status = ${input.newStatus} , status_chng_time = now(),delivered_on = now() 
               where  order_no = '${input.orderNo}'`
    } else {
      query = `update order_table set status = ${input.newStatus} , status_chng_time = now()
               where  order_no = '${input.orderNo}'`
    }
    // console.log("queryyyyyyyyyyyyy", query)
    dbQuery(query)
      .then(dbResponse => {
        // console.log("dbbbbbbb", dbResponse)
        if (dbResponse.affectedRows > 0) {
          deferred.resolve({ code: 1001, message: 'Order successfully updated' })
        } else {
          deferred.resolve({ code: 1012, message: 'Order not updated' })
        }
      })
      .catch(err => {
        console.log('errr while getting id----->', err)
        deferred.reject({ errorCode: 3001, detail: 'data client error' })
      })
    return deferred.promise
  }
}

/*
 * Functin to validate if order no present and new status is not same as old status
 * Input order no and new status
 * Output success/error
 */
let ValidateOrderClass = class ValidateOrder {
  func (input) {
    let deferred = q.defer()
    let query = `select status from order_table where order_no = '${input.orderNo}' and is_active = 1`
    // console.log("queryyyyyyyyyyyyy", query)
    dbQuery(query)
      .then(dbResponse => {
        // console.log('dbbbbbbb', dbResponse)
        if (!_.isEmpty(dbResponse)) {
          let toSend
          if (dbResponse[0].status === input.newStatus) {
            toSend = { code: 1011, message: 'Order Status cannot be updated to same status' }
          } else {
            toSend = { code: 1001, message: 'validation success' }
          }
          deferred.resolve(toSend)
        } else {
          let toSend = { code: 1010, message: 'Order does not exist' }
          deferred.resolve(toSend)
        }
      })
      .catch(err => {
        console.log('errr while getting item----->', err)
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
    let inputValidator = new validate.UpdateOrderStatusValidator(request)
    let validateOrder = new ValidateOrderClass()
    let update = new UpdateClass()
    inputValidator
      .then(validationresponse => validateOrder.func(request.data))
      .then(orderValidateResponse => {
        if (orderValidateResponse.code === 1010) return orderValidateResponse
        if (orderValidateResponse.code === 1011) return orderValidateResponse
        return update.func(request.data)
      })
      .then(finalResponse => {
        let toSend = { code: finalResponse.code, message: finalResponse.message }
        deferred.resolve(toSend)
      })
      .catch(err => {
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
let updateOrderStatus = function (req, res) {
  let body = req.body
  let mainFunction = new MainFunc(body)
  mainFunction
    .then(mainFuncResponse => res.status(200).send(mainFuncResponse))
    .catch(err => res.status(500).send(err))
}

module.exports.updateOrderStatus = updateOrderStatus
