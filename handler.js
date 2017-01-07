/*******************************************************
 * Description:  Handling functions for the web server *
 *******************************************************/

/*
 * Load modules
 */

// Other Tools
var promise = require('bluebird');

/*
 * Load JS files
 */
var log = require('./log.js');
var model = promise.promisifyAll(require('./model.js'));

/*
 * Global variables
 */

/* Logging control */
var gvScriptName = 'handler';

/* Parse SDK config variables */
log.setLoggingMode({parseServerURL: model.getBaluParseServerURL()}); // e.g. on the test server all logging is turned on

/*
 * Initialise the script
 */
(function initialise(){

    var lvLog = '';
    var lvFunctionName = 'initialise';
    lvLog += log.log(gvScriptName,lvFunctionName,'Start','INITS');

    // Fire this off now to make sure the data is refreshed when the app is first spun up
    model.getDataAsync({log: lvLog})
    .then(function(pvArgs){
    });

})();

module.exports = {

    /**************
     * Middleware *
     **************/

    /*
     * Set up our log string in req, so all other middleware can do a += on it.
     */
    setUpLogString: function(req,res,next){
        req.log = '';
        req.log += log.log(gvScriptName,'expressMiddleware','[' + req.method + '] ' + req.originalUrl,'ROUTE');
        next();
    },

    /**********************
     * GET Route Handlers *
     **********************/

    searchGET: function(req,res,next){

        var lvLog = req.log;
        var lvFunctionName = 'searchGET';
        lvLog += log.log(gvScriptName,lvFunctionName,'Start','PROCS');
        lvLog += log.log(gvScriptName,lvFunctionName,'req.query => ' + JSON.stringify(req.query),'PROCS');

        // Load the search page
        var lvPageElements = {isSearchTerm: false,
                              searchTerm: ''};

        // Check whether we've got a search term in the URL, and pass it through to the front end JS so it knows to
        // fire off the search AJAX onload
        if(req.query.s){
            lvPageElements.searchTerm = req.query.s;
            lvPageElements.isSearchTerm = true;
        }

        lvLog += log.log(gvScriptName,lvFunctionName,'Rendering to search.ejs','PROCS');

        lvPageElements.log = lvLog;
        res.render('search.ejs',lvPageElements);
    },

    rootGET: function(req,res,next){

        var lvLog = req.log;
        var lvFunctionName = 'rootGET';
        lvLog += log.log(gvScriptName,lvFunctionName,'Start','PROCS');
        res.redirect('/search');
    },

    /***********************
     * POST Route Handlers *
     ***********************/

    getDataPOST: function(req,res,next){

        var lvLog = req.body.log;
        var lvFunctionName = 'getDataPOST';
        lvLog += log.log(gvScriptName,lvFunctionName,'Start','PROCS');

        lvArgs = {log: lvLog};

        model.getDataAsync(lvArgs)
        .then(function(pvData){
            pvData.log += log.log(gvScriptName,lvFunctionName,'Back end complete, returning data to client','DEBUG');
            res.send(pvData);
        });
    },

    searchPOST: function(req,res,next){

        var lvLog = req.body.log;
        var lvFunctionName = 'searchPOST';
        lvLog += log.log(gvScriptName,lvFunctionName,'Start','PROCS');

        lvLog += log.log(gvScriptName,lvFunctionName,'req.body.searchTerm == ' + req.body.searchTerm,'DEBUG');

        lvArgs = {searchTerm: req.body.searchTerm,
                 log:         lvLog};

        model.filterData(lvArgs, function(pvData){
            pvData.log += log.log(gvScriptName,lvFunctionName,'Back end complete, returning data to client','DEBUG');
            res.send(pvData);
        });
    },

    logPOST: function(req,res,next){

        var lvLog = req.body.log;
        var lvFunctionName = 'logPOST';
        lvLog += log.log(gvScriptName,lvFunctionName,'Start','PROCS');
        lvArgs = {eventName: req.body.eventName,
                  searchTerm: req.body.searchTerm,
                  recommendationId:  req.body.recommendationId,
                  brandId:  req.body.brandId,
                  message: req.body.message,
                  url:     req.body.url};
        model.addDirectoryLog(lvArgs);
    }
};
