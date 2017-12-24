var mysql = require('mysql2');
var config = require('../config/db.json');


var query = function(query) {
    var deferred = q.defer();
    if (query == null) {
        deferred.reject("No query found")
    } else {
        var connection = mysql.createConnection(config.mysql);
        connection.connect();
        try {
            connection.query(query, function(error, results, fields) {
                if (error) {
                    deferred.reject(error)
                }
                deferred.resolve(results)
                    // console.log('The solution is: ', results);
            });
        } catch (err) {
            deferred.reject(err)
        } finally {
            connection.end();
        }
    }
    return deferred.promise;
}
var query2 = function(query) {
    var deferred = q.defer();
    if (query == null) {
        deferred.reject("No query found")
    } else {
        var connection = mysql.createConnection(config.mysql);
        connection.connect();

        connection.query(query, function(error, results, fields) {
            if (error) {
                deferred.reject(error)
                connection.end();
            }
            connection.end();
            deferred.resolve(results)
                // console.log('The solution is: ', results);
        });

    }
    return deferred.promise;
}



module.exports.query = query;
module.exports.query2 = query2;