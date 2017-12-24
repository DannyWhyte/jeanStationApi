var bcrypt = require('bcrypt');

var getUserFromDb = function(request) {
    let deferred = q.defer();
    let query = `select id,password,f_name,m_name,l_name,email from user 
                 where lower(user_name) = lower('${request.data.userName}');`
    dbQuery(query)
        .then(function(dbResponse) {
            // console.log("from dbb ---->", dbResponse[0].password, request.data.password)
            if (!_.isEmpty(dbResponse)) {
                let check = bcrypt.compareSync(request.data.password, dbResponse[0].password);
                // console.log("chkchk", check)
                if (check == true) {
                    let userDetails = {
                            userId: dbResponse[0].id,
                            // userName: dbResponse[0].user_name,
                            firstName: dbResponse[0].f_name,
                            middleName: dbResponse[0].m_name == null ? '' : dbResponse[0].m_name,
                            lastName: dbResponse[0].l_name,
                            email: dbResponse[0].email
                        }
                        // console.log(tablesFromDb, userDetails)
                    let currentUser = {
                        userDetails: userDetails,
                        message: "Welcome : " + userDetails.firstName + ' ' + userDetails.lastName + '.'
                    }
                    deferred.resolve(currentUser)
                } else {
                    let toSend = { code: 1002, message: "Incorrect username or password" }
                    deferred.resolve(toSend)
                }
            } else {
                let toSend = { code: 1002, message: "Incorrect username or password" }
                deferred.resolve(toSend)
            }
        })
        .catch(function(err) {
            console.log("error ---->", err)
            deferred.reject(err)
        })
    return deferred.promise;
}

var login = function(req, res) {
    let body = req.body;
    validate.loginValidator(body)
        .then(function(validationResponse) {
            return getUserFromDb(validationResponse)
        })
        .then(function(finalResponse) {
            finalResponse.sessionID = req.sessionID
            req.session.currentUser = finalResponse;
            let toSend = { code: 200, message: finalResponse.message, userDetails: finalResponse.userDetails, sessionId: finalResponse.sessionID }
            res.status(200).send(toSend)
        })
        .catch(function(err) {
            let toSend = { code: 1111, message: err }
            res.status(500).send(toSend)
        })
}

module.exports.login = login;