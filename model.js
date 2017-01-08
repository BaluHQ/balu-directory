/*****************************************************
 * Description: Interface with the balu-parse-server *
 *****************************************************/

/*
 * Load modules
 */
var Promise = require('bluebird');
var Parse = require('parse/node');

/*
 * Load JS files
 */
var log = require('./log.js');

/*
 * Global variables
 */

var gvDataLastRefreshedDate = null;
var gvRefreshInterval = 1 * 24 * 60 * 60 * 1000; // miliseconds. Change the first number for days.

var gvBrands = [];
var gvSearchProducts = [];
var gvRecommendations = [];

/* Logging control */
var gvScriptName = 'model';

/* Parse SDK Config */
var gvParseServerURL = process.env.PARSE_SERVER_PRD || 'http://localhost:1337/parse'; // default to localhost
var gvAppId = 'mmhyD9DKGeOanjpRLHCR3bX8snue22oOd3NGfWKu';

/*
 * Initialise the script
 */
(function initialise(){

    var lvFunctionName = 'initialise';
    log.log(gvScriptName,lvFunctionName,'Start','INITS');

    /*
     * Initialize Parse Server
     */
    Parse.initialize(gvAppId);
    Parse.serverURL = gvParseServerURL;

    log.log(gvScriptName,lvFunctionName,'Initialised Balu Parse Server to ' + gvParseServerURL,' INFO');

})();

module.exports = {

    getBaluParseServerURL: function(){
        return gvParseServerURL;
    },

    addDirectoryLog: function(pvArgs,pvCallback){
        Parse.Cloud.run('addDirectoryLog',pvArgs,{
            success: function(pvResponse){
                console.log(pvResponse.log.substring(1,pvResponse.log.length)); // output the parse-server logs to the console immediately, to help with debugging
                pvCallback(null,lvData);
            },
            error: function(pvError_rec){
                var lvError_rec = JSON.parse(pvError_rec.message);
                log.log(lvError_rec.log); // print the error from the balu-parse-server to the console
                pvCallback(lvError_rec.message,pvArgs); // send the user-friendly message back to the front end
            }
        });
    },

    /*********************************
     * RETRIEVING DATA FROM DATABASE *
     *********************************/

    // Don't collect the logs for these functions. Output them to console only.

    getData: function(pvArgs, pvCallback){

        var lvLog = pvArgs.log;
        var lvFunctionName = 'getData';
        lvLog += log.log(gvScriptName,lvFunctionName,'Start','PROCS');

        var lvRefreshNeeded;
        var lvCurrentDate = new Date();

        if(gvDataLastRefreshedDate === null) {
            lvLog += log.log(gvScriptName,lvFunctionName,'Data needs loading for the first time','DEBUG');
            lvRefreshNeeded = true;
        } else {
            var lvDiff = Math.abs(lvCurrentDate - gvDataLastRefreshedDate);
            if(lvDiff > gvRefreshInterval) {
                lvLog += log.log(gvScriptName,lvFunctionName,'Data needs refreshing','DEBUG');
                lvRefreshNeeded = true;
            } else {
                lvLog += log.log(gvScriptName,lvFunctionName,'Data does not need refreshing','DEBUG');
                lvRefreshNeeded = false;
            }
        }

        // Assuming we're ready for a refresh of the data, we're going to call the balu-parse-server for
        // brands, searchProducts, and recommendations.
        // To do: run these in parallel and wait for all to be returned ?
        var lvData = {brands: gvBrands,
                      searchProducts: gvSearchProducts,
                      recommendations: gvRecommendations,
                      log: lvLog};

        if(lvRefreshNeeded) {
            Parse.Cloud.run('getEthicalBrands',{},{
                success: function(pvResponse_eb){
                    console.log(pvResponse_eb.log.substring(1,pvResponse_eb.log.length)); // output the parse-server logs to the console immediately, to help with debugging
                    gvBrands = pvResponse_eb.data;
                    lvData.brands = gvBrands;
                    lvData.log += pvResponse_eb.log;

                    Parse.Cloud.run('getSearchProducts',{},{
                        success: function(pvResponse_search){
                            console.log(pvResponse_search.log.substring(1,pvResponse_search.log.length)); // output the parse-server logs to the console immediately, to help with debugging
                            gvSearchProducts = pvResponse_search.data;
                            lvData.searchProducts = gvSearchProducts;
                            lvData.log += pvResponse_search.log;

                            Parse.Cloud.run('getRecommendations',{},{
                                success: function(pvResponse_rec){
                                    console.log(pvResponse_rec.log.substring(1,pvResponse_rec.log.length)); // output the parse-server logs to the console immediately, to help with debugging
                                    gvRecommendations = pvResponse_rec.data;
                                    lvData.recommendations = gvRecommendations;
                                    lvData.log += pvResponse_rec.log;

                                    // We've finished the last data request...
                                    gvDataLastRefreshedDate = new Date();
                                    pvCallback(null,lvData);
                                },
                                error: function(pvError_rec){
                                    var lvError_rec = JSON.parse(pvError_rec.message);
                                    log.log(lvError_rec.log); // print the error from the balu-parse-server to the console
                                    pvCallback(lvError_rec.message,pvArgs); // send the user-friendly message back to the front end
                                }
                            });
                        },
                        error: function(pvError_search){
                            var lvError_eb = JSON.parse(pvError_search.message);
                            log.log(pvError_search.log); // print the error from the balu-parse-server to the console
                            pvCallback(pvError_search.message,pvArgs); // send the user-friendly message back to the front end
                        }
                    });
                },
                error: function(pvError_eb){
                    var lvError_eb = JSON.parse(pvError_eb.message);
                    log.log(lvError_eb.log); // print the error from the balu-parse-server to the console
                    pvCallback(lvError_eb.message,pvArgs); // send the user-friendly message back to the front end
                }
            });
        } else {
            pvCallback(null,lvData);
        }
    }
};
