/*
 * Functin to orders for a user.
 * Input userID from session
 * Output total orders
 */
let GetOrderClass = class getItem {
  func (input) {
    let deferred = q.defer()
    let query = `select  ot.order_no,s.name as status ,ot.status as status_id, ot.address,ot.payment_option,ot.order_no,ot.delivered_on,ot.status_chng_time,ot.order_total,ot.tax,ot.cart_data 
                 from order_table ot 
                 join order_status_master s on ot.status = s.status_id and s.is_active = 1
                 where ot.user_id = ${input} and ot.is_active = true`
    // console.log("queryyyyyyyyyyyyy", query)
    dbQuery(query)
      .then(dbResponse => {
        // console.log("dbbbbbbb", dbResponse)
        if (!_.isEmpty(dbResponse)) {
          let onGoing = []
          let closed = []
          _.each(dbResponse, function (singleRow) {
            singleRow.cart_data = JSON.parse(singleRow.cart_data)
            if (singleRow.status_id > 0 && singleRow.status_id <= 4) onGoing.push(singleRow)
            else if (singleRow.status_id > 4 && singleRow.status_id <= 7) closed.push(singleRow)
            delete singleRow.status_id
          })
          //   console.log('on going ->', onGoing, '\n', 'closed ->', closed)
          let toSend = { code: 1001, message: 'data fetched successfully', data: {onGoing, closed} }
          deferred.resolve(toSend)
        } else {
          let toSend = { code: 1009, message: 'No Order Placed', data: [] }
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
   * Input session id from headers
   * Output response of API
   */
let MainFunc = class mainFuncclass {
  constructor (request) {
    // console.log("it works", request)
    let deferred = q.defer()
    let getOrders = new GetOrderClass()
    getOrders.func(request)
      .then(finalResponse => deferred.resolve(finalResponse))
      .catch(err => {
        console.log('errr ----->', err)
        let toSend = { code: 4001, errorCode: err.errorCode, message: err.detail }
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
let getOrders = function (req, res) {
//   let userId = req.session2.currentUser.userDetails.userId
  let userId = 4
  let mainFunction = new MainFunc(userId)
  mainFunction
    .then(mainFuncResponse => res.status(200).send(mainFuncResponse))
    .catch(err => res.status(500).send(err))
}

module.exports.getOrders = getOrders
