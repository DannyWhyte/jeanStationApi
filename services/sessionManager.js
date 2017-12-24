var sizee = function() {
    var sessionStore = require("../app.js").sessionStore;
    var LoggedUsers = sessionStore.sessions;
};

var createSession = function(data) {
    var sessionStore = require("../app.js").sessionStore;
    var LoggedUsers = sessionStore.sessions;
    var sessionID = data.sessionID;
    LoggedUsers[sessionID] = data;
};

var getAllSession = function(data) {
    var sessionStore = require("../app.js").sessionStore;
    _.each(sessionStore.sessions, function(v, k) {
        v = JSON.parse(v);
        if (moment().isAfter(v["cookie"].expires)) {
            delete sessionStore.sessions[k];
        }
    });
    return sessionStore.sessions;
};

var getSession = function(idd) {
    var sessionStore = require("../app.js").sessionStore;
    return sessionStore.sessions[idd];
};

var changeSession = function(idd, newsession) {
    var sessionStore = require("../app.js").sessionStore;
    sessionStore.set(idd, newsession, function(err, data) {});
};

var removeSession = function(sessionId) {
    var sessionStore = require("../app.js").sessionStore;
    _.each(sessionStore.sessions, function(v, k) {
        if (sessionId === k) {
            delete sessionStore.sessions[k];
        }
    });
    return sessionStore.sessions;
};

function reloadSession(id, maxAge) {
    var sessionStore = require("../app.js").sessionStore;
    // console.log("aaaaaaaaaaaaaaaaa", sessionStore.sessions)
    _.each(sessionStore.sessions, function(v, k) {
        if (k === id) {
            v = JSON.parse(v);
            var now = moment(v["cookie"].expires); //todays date
            var end = moment(new Date()); // another date
            var duration = moment.duration(now.diff(end));
            var asSeconds = duration.asSeconds();

            timeToadd = maxAge / 1000 - asSeconds;
            timeToadd = asSeconds > 0 ? Math.ceil(timeToadd) : 0;
            v["cookie"].expires = (moment(v["cookie"].expires).add(timeToadd, 'seconds')).toJSON();
            sessionStore.sessions[k] = JSON.stringify(v);
        }
    });
};

exports.sizee = sizee;
exports.createSession = createSession;
exports.getAllSession = getAllSession;
exports.changeSession = changeSession;
exports.getSession = getSession;
exports.removeSession = removeSession;
exports.reloadSession = reloadSession;