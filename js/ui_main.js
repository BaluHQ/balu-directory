/*****************************************************************
 * Description: Generic UI functions required on all/many pages  *
 *****************************************************************/

/********
 * Init *
 ********/

/*
 * Logging variables
 */
var gvScriptName_uiMain = 'ui_main';

/*
 * Global variables
 */
// --

/*
 * Initialise the script
 */
(function initialise(){

    var lvFunctionName = 'initialise';
    log(gvScriptName_uiMain + '.' + lvFunctionName + ': Start','INITS');

    window.addEventListener('DOMContentLoaded', DOMContentLoaded_listener);

})();

/*************
 * Listeners *
 *************/

/*
 *
 */
function DOMContentLoaded_listener(){

    var lvFunctionName = 'DOMContentLoaded_listener';
    log(gvScriptName_uiMain + '.' + lvFunctionName + ': Start','LSTNR');

    // Get the name of the page that's just loaded
    var lvURL = window.location.pathname;
    var lvPageName = lvURL.substring(lvURL.lastIndexOf('/')+1);
    var lvArgs = {};

    buildMenu(lvPageName);
    buildPage(lvArgs); // This will call the buildPage function from the active page's UI script (i.e. ui_<page name>.js)
}

/*
 * For anybody clicking on the "Get the App" link in the menu
 */
function getTheApp_click_listener(event){

    var lvFunctionName = 'getTheApp_click_listener';
    log(gvScriptName_uiIndex + '.' + lvFunctionName + ': Start','LSTNR');

    logEvent('WEB_APP-GET_THE_APP_CLICK_THROUGH',null,null);

    window.open('http://getbalu.org/download');

}

/*************
 * Functions *
 *************/

/*
 *
 */
function buildMenu(pvPageName){

    var lvFunctionName = 'buildMenu';
    log(gvScriptName_uiMain + '.' + lvFunctionName + ': Start','PROCS');


    var lvHtmlString = '';

    // If the page is active, set the relevant page's class to active using these vars
    var lvIndexActiveClassHTML = '';

    switch (pvPageName) {
        case 'index.html':
            lvIndexActiveClassHTML = 'class="active"';
        break;
    }

    lvHtmlString += '<nav class="top-bar" data-topbar role="navigation">';

    // Title Area
    lvHtmlString += '    <ul class="title-area">';
    lvHtmlString += '      <li class="name show-for-small-only">';
    lvHtmlString += '        <h1><a class="getTheApp-a">Get the App</a></h1>';
    lvHtmlString += '      </li>';
    lvHtmlString += '        <li class="toggle-topbar menu-icon"><a><span></span></a></li>';
    lvHtmlString += '    </ul>';

    // Menu //
    lvHtmlString += '    <section class="top-bar-section">';

    // Left Section
    lvHtmlString += '        <ul class="left">';
    lvHtmlString += '            <li><a style="background-color: black; font-weight: bold;" href="http://getbalu.org">BALU</a></li>';
    lvHtmlString += '            <li><a style="background-color: black; font-weight: bold;" class="getTheApp-a">Get the App</a></li>';
    lvHtmlString += '            <li><a style="background-color: black; font-weight: bold;" href="http://getbalu.org/about">About</a></li>';
    lvHtmlString += '        </ul>';

    // Right Section
    lvHtmlString += '        <ul class="right">';
    lvHtmlString += '        </ul>';

    lvHtmlString += '    </section>';
    lvHtmlString += '</nav>';

    $('#menu_div').html(lvHtmlString);

    $('.getTheApp-a').each(function(i,pvLink){
        pvLink.addEventListener('click',getTheApp_click_listener);
    });

    $(document).foundation('topbar');
}
