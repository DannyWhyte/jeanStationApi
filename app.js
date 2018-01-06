'use strict';
global.config = require('./config/config.json');
global.q = require('q');
global._ = require('underscore');
global.moment = require('moment');
global.validate = require('./services/validator')
global.dbQuery = require('./services/mySqlDbConnect').query;

var SwaggerExpress = require('swagger-express-mw');
var SwaggerUi = require('swagger-tools/middleware/swagger-ui');
var bodyParser = require('body-parser');
var cors = require('cors');
var helmet = require('helmet')
    /* Session */
var sessionmanager = require('./services/sessionManager.js');
var session = require('express-session');
var MemoryStore = require('express-session').MemoryStore;
var sessionStore = new MemoryStore();
var maxAge = 600000;
//Session part ends

var app = require('express')();
app.use(helmet())
app.set('etag', false);
app.use(function(req, res, next) {
    // console.log(res)
    res.removeHeader('Transfer-Encoding');
    res.removeHeader('X-Powered-By')
    next();
})
module.exports = app; // for testing
var config1 = {
    appRoot: __dirname // required config
};
const BASE_URL = config.BASE_URL;


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
});

function sessionHandler(req, res, next) {
    sessionMiddleware(req, res, next);
}

function IsAuthenticated(req, res, next) {
    // console.log("in IsAuthenticated", req.headers.sessionid);

    var sessionID = req.headers.sessionid;

    sessionmanager.reloadSession(sessionID, maxAge);
    sessionmanager.getAllSession();

    if (sessionStore.sessions[sessionID]) {
        // if (true) {
        var sesss = sessionmanager.getSession(req.headers.sessionid);
        req.session2 = JSON.parse(sesss);
        next();
    } else {
        res.send('auth fail redirect to login');
    }
}


app.use(cors());

app.use(bodyParser.raw({
    limit: '50mb'
}));
app.use(bodyParser.json({
    limit: '50mb'
}));
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
}));


SwaggerExpress.create(config1, function(err, swaggerExpress) {
    if (err) { throw err; }

    // install middleware
    swaggerExpress.register(app);


    /* ============ SERVING APIs ============ */
    app.get(BASE_URL + '/ping', function(req, res) {
        res.status(200).send('Pong');
    });

    app.post(BASE_URL + '/loginUser', sessionHandler, require('./api/controllers/login').login);
    app.post(BASE_URL + '/test', IsAuthenticated, require('./api/controllers/hello_world').getTicketInfo);
    app.post(BASE_URL + '/addProducts', require('./api/controllers/addProducts').addProducts);
    // app.post(BASE_URL + '/addProducts', IsAuthenticated, require('./api/controllers/addProducts').addProducts);

    var port = process.env.PORT || 8011;
    var server = app.listen(port);
    server.timeout = 3600000;
    module.exports = exports;
    exports.sessionStore = sessionStore;
    console.log('try this:\ncurl http://localhost:' + port + BASE_URL + '/ping');
});