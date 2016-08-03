
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    "loglevel": Number,
    "action": String,
    "by": String,
    "byid": mongoose.Schema.Types.ObjectId,
    "timestamp": Date
});

module.exports = mongoose.model('test', schema);