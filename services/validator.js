var Validator = require('jsonschema').Validator
var v = new Validator()

var loginValidator = function (request) {
  var deferred = q.defer()
  var schema1 = {
    'id': '/login',
    'type': 'object',
    'properties': {
      'data': {
        'type': 'object',
        'required': true,
        'properties': {
          'userName': {
            'type': 'string',
            'required': true,
            'minLength': 1
          },
          'password': {
            'type': 'string',
            'minLength': 1,
            'required': true
          }
        }
      }
    }
  }
  v.addSchema(schema1, '/login')
  var error = _.pluck(v.validate(request, schema1).errors, 'stack')
  var formatedError = []
  // console.log("ssssssssssssssssssssssssssssss", error)
  _.each(error, function (err) {
    // console.log('VALIDATE: ', err.replace('instance.', '').replace('].', '] ').replace('data.', ''));
    var formatedErr = err.split('.')
    formatedError.push(formatedErr[formatedErr.length - 1])
  })
  if (formatedError.length > 0) {
    deferred.reject({
      'status': 'fail',
      'error': formatedError
    })
  } else {
    deferred.resolve(request)
  }
  return deferred.promise
}

var addProductsValidator = function (request) {
  var deferred = q.defer()
  var schema1 = {
    'id': '/addProducts',
    'type': 'object',
    'properties': {
      'data': {
        'type': 'array',
        'minItems': 1,
        'required': true,
        'items': {
          'type': 'object',
          'required': true,
          'properties': {
            'category': {
              'type': 'integer',
              'required': true,
              'minLength': 1
            },
            'gender': {
              'type': 'integer',
              'minLength': 1,
              'required': true
            },
            'price': {
              'type': 'integer',
              'minLength': 1,
              'required': true
            },
            'discount': {
              'type': 'integer',
              'minLength': 1,
              'required': true
            },
            'brand': {
              'type': 'string',
              'minLength': 1,
              'required': true
            },
            'productName': {
              'type': 'string',
              'minLength': 1,
              'required': true
            },
            'tax': {
              'type': 'integer',
              'minLength': 1,
              'required': true
            },
            'size': {
              'type': 'array',
              'minItems': 1,
              'required': true,
              'items': {
                'type': 'string',
                'minLength': 1,
                'required': true
              }
            },
            'imagePath': {
              'type': 'array',
              'minItems': 1,
              'required': true,
              'items': {
                'type': 'string',
                'minLength': 1,
                'required': true
              }
            },
            'imagePosition': {
              'type': 'array',
              'minItems': 1,
              'required': true,
              'items': {
                'type': 'integer',
                'minLength': 1,
                'required': true
              }
            }
          }
        }
      }
    }
  }
  v.addSchema(schema1, '/login')
  var error = _.pluck(v.validate(request, schema1).errors, 'stack')
  var formatedError = []
  // console.log("ssssssssssssssssssssssssssssss", error)
  _.each(error, function (err) {
    // console.log('VALIDATE: ', err.replace('instance.', '').replace('].', '] ').replace('data.', ''));
    var formatedErr = err.split('.')
    formatedError.push(formatedErr[formatedErr.length - 1])
  })
  if (formatedError.length > 0) {
    deferred.reject({
      'status': 'fail',
      'error': formatedError
    })
  } else {
    deferred.resolve(request)
  }
  return deferred.promise
}

var productListValidator = function (request) {
  var deferred = q.defer()
  var schema1 = {
    'id': '/productList',
    'type': 'object',
    'properties': {
      'gender': {
        'type': 'string',
        'required': true,
        'minLength': 1
      }
    }
  }
  v.addSchema(schema1, '/productList')
  var error = _.pluck(v.validate(request, schema1).errors, 'stack')
  var formatedError = []
  // console.log("ssssssssssssssssssssssssssssss", error)
  _.each(error, function (err) {
    // console.log('VALIDATE: ', err.replace('instance.', '').replace('].', '] ').replace('data.', ''));
    var formatedErr = err.split('.')
    formatedError.push(formatedErr[formatedErr.length - 1])
  })
  if (isNaN(request.gender)) { formatedError.push('Please provide a number in gender') }
  if (formatedError.length > 0) {
    deferred.reject({
      'status': 'fail',
      'error': formatedError
    })
  } else {
    deferred.resolve(request)
  }
  return deferred.promise
}

var productInfoValidator = function (request) {
  var deferred = q.defer()
  var schema1 = {
    'id': '/productInfo',
    'type': 'object',
    'properties': {
      'prodId': {
        'type': 'string',
        'required': true,
        'minLength': 1
      }
    }
  }
  v.addSchema(schema1, '/productInfo')
  var error = _.pluck(v.validate(request, schema1).errors, 'stack')
  var formatedError = []
  // console.log("ssssssssssssssssssssssssssssss", error)
  _.each(error, function (err) {
    // console.log('VALIDATE: ', err.replace('instance.', '').replace('].', '] ').replace('data.', ''));
    var formatedErr = err.split('.')
    formatedError.push(formatedErr[formatedErr.length - 1])
  })
  if (isNaN(request.prodId)) { formatedError.push('Please provide a number in prodId') }
  if (formatedError.length > 0) {
    deferred.reject({
      'status': 'fail',
      'error': formatedError
    })
  } else {
    deferred.resolve(request)
  }
  return deferred.promise
}

let addToCartValidator = class validator {
  constructor (request) {
    let deferred = q.defer()
    let schema1 = {
      'id': '/addToCart',
      'type': 'object',
      'properties': {
        'data': {
          'type': 'object',
          'required': true,
          'properties': {
            'prodId': {
              'type': 'integer',
              'required': true,
              'minLength': 1
            },
            'quantity': {
              'type': 'integer',
              'minLength': 1,
              'required': true
            },
            'size': {
              'type': 'string',
              'minLength': 1,
              'required': true
            }
          }
        }
      }
    }
    v.addSchema(schema1, '/addToCart')
    let error = _.pluck(v.validate(request, schema1).errors, 'stack')
    let formatedError = []
    // console.log("ssssssssssssssssssssssssssssss", error)
    _.each(error, function (err) {
      // console.log('VALIDATE: ', err.replace('instance.', '').replace('].', '] ').replace('data.', ''));
      let formatedErr = err.split('.')
      formatedError.push(formatedErr[formatedErr.length - 1])
    })
    if (formatedError.length > 0) {
      deferred.reject({
        'status': 'fail',
        'error': formatedError
      })
    } else {
      deferred.resolve(request)
    }
    return deferred.promise
  }
}

let removeFromCartValidator = class validator {
  constructor (request) {
    var deferred = q.defer()
    var schema1 = {
      'id': '/removeFromCart',
      'type': 'object',
      'properties': {
        'cartId': {
          'type': 'string',
          'required': true,
          'minLength': 1
        }
      }
    }
    v.addSchema(schema1, '/removeFromCart')
    var error = _.pluck(v.validate(request, schema1).errors, 'stack')
    var formatedError = []
    // console.log("ssssssssssssssssssssssssssssss", error)
    _.each(error, function (err) {
      // console.log('VALIDATE: ', err.replace('instance.', '').replace('].', '] ').replace('data.', ''));
      var formatedErr = err.split('.')
      formatedError.push(formatedErr[formatedErr.length - 1])
    })
    if (isNaN(request.cartId)) { formatedError.push('Please provide a number in cartId') }
    if (formatedError.length > 0) {
      deferred.reject({
        'status': 'fail',
        'error': formatedError
      })
    } else {
      deferred.resolve(request)
    }
    return deferred.promise
  }
}

let createOrderValidator = class validator {
  constructor (request) {
    var deferred = q.defer()
    var schema1 = {
      'id': '/removeFromCart',
      'type': 'object',
      'properties': {
        'data': {
          'type': 'object',
          'required': true,
          'properties': {
            'address': {
              'type': 'string',
              'required': true,
              'minLength': 1
            },
            'tax': {
              'type': 'integer',
              'minLength': 1,
              'required': true
            },
            'paymentOption': {
              'type': 'string',
              'minLength': 1,
              'required': true
            }
          }
        }
      }
    }
    v.addSchema(schema1, '/createOrder')
    var error = _.pluck(v.validate(request, schema1).errors, 'stack')
    var formatedError = []
    // console.log("ssssssssssssssssssssssssssssss", error)
    _.each(error, function (err) {
      // console.log('VALIDATE: ', err.replace('instance.', '').replace('].', '] ').replace('data.', ''));
      var formatedErr = err.split('.')
      formatedError.push(formatedErr[formatedErr.length - 1])
    })
    if (formatedError.length > 0) {
      deferred.reject({
        'status': 'fail',
        'error': formatedError
      })
    } else {
      deferred.resolve(request)
    }
    return deferred.promise
  }
}

module.exports.loginValidator = loginValidator
module.exports.addProductsValidator = addProductsValidator
module.exports.productListValidator = productListValidator
module.exports.productInfoValidator = productInfoValidator
module.exports.AddToCartValidator = addToCartValidator
module.exports.RemoveFromCartValidator = removeFromCartValidator
module.exports.CreateOrderValidator = createOrderValidator
