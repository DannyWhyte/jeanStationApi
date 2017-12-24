var bcrypt = require('bcrypt');
const saltRounds = 10;

var login = function(req, res) {
        // console.log("login ------------->>>>>>>", req.sessionID)
        req.session.regenerate(function(err) {
            // console.log("login ------------->>>>>>>", req.sessionID)
            // will have a new session here
        })
        var findjson = {
            "loginId": req.body.data.loginId,
            "password": req.body.data.password
        };
        console.log("finddddddddddddddd", findjson)

        if (_.keys(req.body.data).length < 1) {
            return res.status(200).send({
                code: 400,
                error: 'Invalid request.'
            });
        }
        if (findjson.loginId == '' || findjson.loginId == undefined) {
            return res.status(400).send({
                code: 400,
                error: 'Please enter loginId.'
            });

        }
        if (findjson.password == '' || findjson.password == undefined) {
            return res.status(400).send({
                code: 400,
                error: 'Please enter password.'
            });
        }

        var passwordFromUser = ""
        bcrypt.hash(findjson.password, saltRounds, function(err, hash) {
            console.log("true..........", findjson.userName)
            console.log("---------------->", hash)
            passwordFromUser = hash;


            var check = bcrypt.compareSync('pass@123', passwordFromUser);
            console.log("chkchk", check)
            if (req.body.data.loginId == 'admin' && check == true) {
                var userDetails = {
                        fullName: "Admin",
                    }
                    // console.log(tablesFromDb, userDetails)
                var currentUser = {
                    userDetails: userDetails,
                    message: "Welcome : Admin",
                    sessionID: req.sessionID
                }
                req.session.currentUser = currentUser;
                return res.status(200).send({
                    currentUser: currentUser,
                    message: "User Logged in Successfully",
                    flag: "Success"
                });
            } else {
                return res.status(200).send({
                    currentUser: "",
                    message: "Login/Password is Wrong",
                    flag: "Failed"
                });
            }
        });
    }
    // Return router
module.exports.login = login;