var express = require('express');
var app = express();
var bodyParser = require('body-parser')
var mongoose = require('mongoose');


var dbURI = 'mongodb://root:123c56789@ds013414.mlab.com:13414/heroku_61dvgpt1';
mongoose.connect(dbURI);

var db = mongoose.connection;
var schema = {};

db.on('connected', function () {
    console.log('Mongoose default connection open to ' + dbURI);

    schema.test = require('./mongoschema/test.js');
    
});

// If the connection throws an error
db.on('error', function (err) {
    console.log('Mongoose default connection error: ' + err);
});

// When the connection is disconnected
db.on('disconnected', function () {
    console.log('Mongoose default connection disconnected');
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', function () {
    db.close(function () {
        console.log('Mongoose default connection disconnected through app termination');
        process.exit(0);
    });
});




app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
    response.render('pages/index');
});

app.get('/services/:servicename', function(request, response) {
    response.render('services/' + request.params.servicename);
})

app.post('/process/:servicename/:action', function(request, response) {

    try {
        var obj = require('./process/' + request.params.servicename + "/" + request.params.action);
        obj.doProcess(request, response);
    } catch (error) {
        response.json();
    }

})

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});


