/*
 * Functin to remove item from the cart of user.
 * Input cartId from url
 * Output success/error of update query
 */
let RemoveClass = class remove {
  func (input) {
    let deferred = q.defer()
    let query = `update cart set is_removed = 1 where id = ${input.cartId}`
    // console.log("queryyyyyyyyyyyyy", query)
    dbQuery(query)
      .then(function (dbResponse) {
        // console.log("dbbbbbbb", dbResponse)
        if (dbResponse.affectedRows > 0) {
          deferred.resolve({ code: 1001, message: 'Item Successfully Removed From Cart' })
        } else {
          deferred.resolve({ code: 1006, message: 'No Such Item Present In Cart' })
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
    let inputValidator = new validate.RemoveFromCartValidator(request)
    let remove = new RemoveClass()
    inputValidator
      .then(function (validationResponse) {
        // console.log("after validation")
        return remove.func(request)
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
let removeFromCart = function (req, res) {
  let cartId = req.query
  let mainFunction = new MainFunc(cartId)
  mainFunction
    .then(function (mainFuncResponse) {
      res.status(200).send(mainFuncResponse)
    })
    .catch(function (err) {
      res.status(500).send(err)
    })
}

module.exports.removeFromCart = removeFromCart
