/*
 * Functin to get items in cart of a user.
 * Input userID from session
 * Output total items
 */
let GetItemClass = class getItem {
  func (input) {
    let deferred = q.defer()
    let query = `select c.id,c.user_id,c.selected_size,c.quantity,p.product_name,p.brand,p.price,p.discount,i.path as  image_path
        from cart c
        join product p on p.is_active = true and p.id = c.prod_id
        left join image_path i on p.id = i.prod_id and i.position = 1 and i.is_active = true
        where c.is_active = true and c.user_id = ${input} and c.is_processed = 0 and c.is_removed = 0`
    // console.log("queryyyyyyyyyyyyy", query)
    dbQuery(query)
      .then(function (dbResponse) {
        // console.log("dbbbbbbb", dbResponse)
        if (!_.isEmpty(dbResponse)) {
          let formatedArray = []
          _.each(dbResponse, function (singleRecord) {
            // console.log("aaaaaa", singleRecord)
            let outJson = {
              'id': singleRecord.id,
              // 'userId': singleRecord.user_id,
              'selectedSize': singleRecord.selected_size,
              'quantity': singleRecord.quantity,
              'productName': singleRecord.product_name,
              'brand': singleRecord.brand,
              'price': singleRecord.price,
              'discountedPrice': Math.round((singleRecord.price * (100 - singleRecord.discount)) / 100),
              'discount': singleRecord.discount,
              'imagePath': singleRecord.image_path
            }
            formatedArray.push(outJson)
          })
          let toSend = { code: 1001, message: 'data fetched successfully', data: formatedArray }
          deferred.resolve(toSend)
        } else {
          let toSend = { code: 1005, message: 'No Items In Cart', data: [] }
          deferred.resolve(toSend)
        }
      })
      .catch(function (err) {
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
    let getItem = new GetItemClass()
    getItem.func(request)
      .then(function (finalResponse) {
        deferred.resolve(finalResponse)
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
let getItemInCart = function (req, res) {
  let userId = req.session2.currentUser.userDetails.userId
  // let userId = 4;
  let mainFunction = new MainFunc(userId)
  mainFunction
    .then(function (mainFuncResponse) {
      // console.log("done")
      res.status(200).send(mainFuncResponse)
    })
    .catch(function (err) {
      res.status(500).send(err)
    })
}

module.exports.getItemInCart = getItemInCart
module.exports.GetItemInCartFunc = GetItemClass
