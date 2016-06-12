var express = require('express');
var app = express();
var bodyParser = require('body-parser')

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


