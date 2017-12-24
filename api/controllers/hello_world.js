var getTicketInfo = function(req, res) {
    var reqBody = req.body
    res.status(200).send(reqBody);
}



module.exports.getTicketInfo = getTicketInfo;