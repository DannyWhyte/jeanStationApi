'use strict'
global.config = require('./config/config.json')
global.q = require('q')
global._ = require('underscore')
global.moment = require('moment')
global.validate = require('./services/validator')
global.dbQuery = require('./services/mySqlDbConnect').query

var SwaggerExpress = require('swagger-express-mw')
var bodyParser = require('body-parser')
var cors = require('cors')
var helmet = require('helmet')
/* Session */
var sessionmanager = require('./services/sessionManager.js')
var session = require('express-session')
var MemoryStore = require('express-session').MemoryStore
var sessionStore = new MemoryStore()
var maxAge = 600000
// Session part ends

var app = require('express')()
app.use(helmet())
app.set('etag', false)
app.use(function (req, res, next) {
  // console.log(res)
  res.removeHeader('Transfer-Encoding')
  res.removeHeader('X-Powered-By')
  next()
})
module.exports = app // for testing
var config1 = {
  appRoot: __dirname // required config
}
const BASE_URL = config.BASE_URL

var sessionMiddleware = session({
  store: sessionStore,
  secret: 'keyboard_secret_key',
  resave: false,
  rolling: true,
  saveUninitialized: true,
  cookie: {
    maxAge: maxAge,
    secure: true,
    sameSite: true
  }
})

function sessionHandler (req, res, next) {
  sessionMiddleware(req, res, next)
}

function IsAuthenticated (req, res, next) {
  // console.log("in IsAuthenticated", req.headers.sessionid);

  var sessionID = req.headers.sessionid

  sessionmanager.reloadSession(sessionID, maxAge)
  sessionmanager.getAllSession()

  if (sessionStore.sessions[sessionID]) {
    // if (true) {
    var sesss = sessionmanager.getSession(req.headers.sessionid)
    req.session2 = JSON.parse(sesss)
    next()
  } else {
    res.send('auth fail redirect to login')
  }
}

app.use(cors())

app.use(bodyParser.raw({
  limit: '50mb'
}))
app.use(bodyParser.json({
  limit: '50mb'
}))
app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true
}))

SwaggerExpress.create(config1, function (err, swaggerExpress) {
  if (err) { throw err }

  // install middleware
  swaggerExpress.register(app)

  /* ============ SERVING APIs ============ */
  app.get(BASE_URL + '/ping', function (req, res) {
    res.status(200).send('Pong')
  })

  app.post(BASE_URL + '/loginUser', sessionHandler, require('./api/controllers/login').login)
  app.post(BASE_URL + '/test', IsAuthenticated, require('./api/controllers/hello_world').getTicketInfo)
  app.post(BASE_URL + '/addProducts', IsAuthenticated, require('./api/controllers/addProducts').addProducts)
  app.post(BASE_URL + '/addToCart', IsAuthenticated, require('./api/controllers/addToCart').addToCart)
  app.get(BASE_URL + '/cartCounter', IsAuthenticated, require('./api/controllers/cartCounter').cartCounter)
  app.get(BASE_URL + '/getItemInCart', IsAuthenticated, require('./api/controllers/getItemInCart').getItemInCart)
  app.get(BASE_URL + '/removeFromCart', IsAuthenticated, require('./api/controllers/removeFromCart').removeFromCart)
  app.post(BASE_URL + '/createOrder', IsAuthenticated, require('./api/controllers/createOrder').createOrder)
  // unauthenticated api's start ---------------------------------------------------------------------
  app.get(BASE_URL + '/productInfo', require('./api/controllers/productInfo').productInfo)
  app.get(BASE_URL + '/productList', require('./api/controllers/productList').productList)
  // unauthenticated api's end ---------------------------------------------------------------------

  var port = process.env.PORT || 8011
  var server = app.listen(port)
  server.timeout = 3600000

  // ======================== PROCESS.ON START ===================================
  process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at:', p, 'reason:', reason)
    // application specific logging, throwing an error, or other logic here
  })

  process.on('uncaughtException', (reason, p) => {
    console.log('Uncaught Exception at:', p, 'reason:', reason)
  })

  // two ways of callback while handling error
  // process.on('uncaughtException', (err) => {
  //   console.log('whoops! there was an error', err.stack)
  // })

  // ======================== PROCESS.ON END =====================================

  module.exports = exports
  exports.sessionStore = sessionStore
  console.log('try this:\ncurl http://localhost:' + port + BASE_URL + '/ping')
})
