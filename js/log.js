/*************************************************************
 * Description: Logging and error handling functions for app *
 *************************************************************/

/********
 * Init *
 ********/

/*
 * Logging variables
 */
var gvScriptName_log = 'log';

/*
 * Global variables
 */

/*
 * Parse init
 */
var gvAppId = 'mmhyD9DKGeOanjpRLHCR3bX8snue22oOd3NGfWKu';
var gvParseServerURL = 'https://balu-parse-server.herokuapp.com/parse'; // repeated main.js

 /* Logging control */
 var gvLogErrors = true;
 var gvLogProcs  = true;
 var gvLogDebugs = true;
 var gvLogInfos  = true;
 var gvLogInits  = true;
 var gvLogLstnrs = true;
 var gvLogTemps  = true;

/*
 * Initialise the script
 */
(function initialise(){

    var lvFunctionName = 'initialise';
    log(gvScriptName_log + '.' + lvFunctionName + ': Start','INITS');

    Parse.initialize(gvAppId);
    Parse.serverURL = gvParseServerURL;

})();

/*********************
 * Logging Functions *
 *********************/

/*
 * Save an event to the log
 * Note, this is anonymous (no users)
 */
function logEvent(pvEventName,pvArgs,pvMessage) {

    var lvFunctionName = 'logEvent';
    log(gvScriptName_log + '.' + lvFunctionName + ': Start','PROCS');

    var log_event = new (Parse.Object.extend("Log_Event"))();

    var lvACL = new Parse.ACL();
    lvACL.setRoleReadAccess("Analytics",true);

    // For the log events that require no bespoke code...
    if(pvEventName === 'WEB_APP-PAGE_LOAD' ||
       pvEventName === 'WEB_APP-CATEGORY_FILTER_APPLIED' ||
       pvEventName === 'WEB_APP-CATEGORY_FILTER_REMOVED' ||
       pvEventName === 'WEB_APP-CATEGORY_FILTER_SHOW_MORE' ||
       pvEventName === 'WEB_APP-CATEGORY_FILTER_SHOW_LESS' ||
       pvEventName === 'WEB_APP-PRODUCT_GROUP_SEARCH' ||
       pvEventName === 'WEB_APP-PRODUCT_GROUP_SEARCH_EMPTY_ENTER' ||
       pvEventName === 'WEB_APP-PRODUCT_GROUP_SEARCH_NO_MATCH' ||
       pvEventName === 'WEB_APP-BRAND_SPIEL_SHOW_MORE' ||
       pvEventName === 'WEB_APP-BRAND_CLICK_THROUGH' ||
       pvEventName === 'WEB_APP-AD_CLICK_THROUGH' ||
       pvEventName === 'WEB_APP-GET_THE_APP_CLICK_THROUGH') {

        log_event.set('eventName',pvEventName);

        var lvProductGroup_pointer;
        var lvSearchCategory_pointer;
        var lvBrand_pointer;
        if(pvArgs !== null) {
            if(pvArgs.productGroupId !== null && typeof pvArgs.productGroupId !== 'undefined'){
                lvProductGroup_pointer = {__type: "Pointer",className: "ProductGroup",objectId: pvArgs.productGroupId};
            }
            if(pvArgs.categoryId !== null && typeof pvArgs.categoryId !== 'undefined'){
                lvSearchCategory_pointer = {__type: "Pointer",className: "SearchCategory",objectId: pvArgs.categoryId};
            }
            if(pvArgs.brandId !== null && typeof pvArgs.brandId !== 'undefined'){
                lvBrand_pointer = {__type: "Pointer",className: "EthicalBrand",objectId: pvArgs.brandId};
            }

            //log_event.set('productGroupId',lvProductGroup_pointer);
            log_event.set('productGroupName',pvArgs.productGroupName);
            //log_event.set('searchCategoryId',lvSearchCategory_pointer);
            log_event.set('searchCategoryName',pvArgs.categoryName);
            log_event.set('brandId',lvBrand_pointer);
            log_event.set('brandName',pvArgs.brandName);

            if(typeof pvArgs.brandURL !== 'undefined') {
                log_event.set('brandURL',pvArgs.brandURL);
            }
        }

        log_event.set('message',pvMessage);

        log_event.setACL(lvACL);
/*
        log_event.save({
            success: function(){
            },
            error: parseErrorSave
        });
*/
        log_event.save(null,{
            //sessionToken: null, // this is the problem. We're anonymous, so we need to use the master key
            //useMasterKey: true, // but the master key hasn't been provided, and in a client-side-only app, we can't provide it
            success: function(){
            },
            error: parseErrorSave
        });

    } else {

        switch (pvEventName) {
            case(false):

            break;

            default:
                log(gvScriptName_log + '.' + lvFunctionName + ': ERROR, unhandled event name (' + pvEventName + ') passed to logEvent()','ERROR');

        }
    }
}

/*
 * Save an error message to the error log
 */
function logError(pvEventName,pvData){

    var lvFunctionName = 'logError';
    log(gvScriptName_log + '.' + lvFunctionName + ': Start','PROCS');

    var lvACL = new Parse.ACL();
    acl.setRoleReadAccess("Analytics",true);

    var log_Error = new Parse.Object.extend("Log_Error")();

    log_Error.set('eventName',pvEventName);
    log_Error.set('message',pvData.message);

    log_Error.setACL(lvACL);

    log_Error.save({
        success: function(){

        },
        error: parseErrorSave
    });
}


/*
 * Outputs messages to the console
 */
function log(pvMessage, pvLevel) {
    var lvLevel = pvLevel || 'LOG NOTHING'; // if pvLevel is not populated, set lvLevel to a value that will switch to default

    switch(lvLevel) {

        case 'ERROR':
            if (gvLogErrors) console.log(lvLevel + ': ' + pvMessage);
        break;

        case 'PROCS':
            // Short for "process", these are the ubiquitous logs that
            // track (at the least) the start of every function, as well
            // as other key points
            // On by default
            if (gvLogProcs)  console.log(lvLevel + ': ' + pvMessage);
        break;

        case ' INFO':
            // Additional to PROCS, these don't just track process, they
            // record information as well. Similar to DEBUG.
            // Off by default
            if (gvLogInfos) console.log(lvLevel + ': ' + pvMessage);
        break;

        case 'DEBUG':
            // Useful log points for debugging
            // Off by default
            if (gvLogDebugs) console.log(lvLevel + ': ' + pvMessage);
        break;

        case 'INITS':
            // Rather than putting PROCS in init functions (which always fire
            // and, once the app is working reliably, aren't particularly interesting)
            // Off by default
            if (gvLogInits) console.log(lvLevel + ': ' + pvMessage);
        break;

        case 'LSTNR':
            // Rather than putting PROCS in listeners (which can fire
            // continually in some scenarios), use LSTNR and keep them ...
            // Off by default
            if (gvLogLstnrs) console.log(lvLevel + ': ' + pvMessage);
        break;

        case ' TEMP':
            // What it says on the tin. These should not stay in the code for long
            // On by default
            if (gvLogTemps) console.log(lvLevel + ': ' + pvMessage);
        break;

        default:
            console.log('UNKWN' + ': ' + pvMessage);
    }
}

/******************
 * Error handling *
 ******************/

function parseErrorSave(pvObject,pvError) {
    var lvErrorMsg = "Parse error on .save() request: " + pvError.code + " " + pvError.message;
    log(gvScriptName_log + '.' + 'parseErrorSave' + ': ' + lvErrorMsg,'ERROR');

}

function parseErrorFind(pvError) {
    var lvErrorMsg = "Parse error on .find() request: " + pvError.code + " " + pvError.message;
    log(gvScriptName_log + '.' + 'parseErrorFind' + ': ' + lvErrorMsg,'ERROR');
}

function parseErrorUser(pvUser,pvError) {
    var lvErrorMsg = "Parse error on authentication request: " + pvError.code + " " + pvError.message;
    log(gvScriptName_log + '.' + 'parseErrorUser' + ': ' + lvErrorMsg,'ERROR');
}

function parseErrorGet(pvUser,pvError) {
    var lvErrorMsg = "Parse error on .get() request: " + pvError.code + " " + pvError.message;
    log(gvScriptName_log + '.' + 'parseErrorGet' + ': ' + lvErrorMsg,'ERROR');
}

function parseErrorUserSimple(pvError) {
    var lvErrorMsg = "Parse error on user request: " + pvError.code + " " + pvError.message;
    log(gvScriptName_log + '.' + 'parseErrorUserSimple' + ': ' + lvErrorMsg,'ERROR');
}
