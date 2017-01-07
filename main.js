/**************************************************
 * Description:  Main script for node application *
 **************************************************/

/*
 * Load modules
 */

// Express Web Server
var express = require('express');
var bodyParser = require('body-parser');
/*
 * Create Server
 */
var app = express();

/*
 * Load JS files
 */
var log = require('./log.js');
var handler = require('./handler.js');

/*
 * Global variables
 */

// Logging control
var gvScriptName = 'main';

/*
 * Configure server middleware
 */

/* Body Parsing */

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

/* Application-spectific Middleware */

app.use('/search', handler.setUpLogString);

/* Serve static files */

app.use(express.static(__dirname + '/public'));

/*
 * Server routes
 */

/* GET */

app.get('/search', handler.searchGET);

// No path specified
app.get('/', handler.rootGET);

/* POST */

app.post('/getdata', handler.getDataPOST);
app.post('/search', handler.searchPOST);
app.post('/log', handler.logPOST);


/*
 * Fire it up!
 */
var lvPortNumber = process.env.PORT || 8080;
app.listen(lvPortNumber, function() {
    log.log(gvScriptName,'initialise','Express web server listening on port ' + lvPortNumber,'INITS');
});
