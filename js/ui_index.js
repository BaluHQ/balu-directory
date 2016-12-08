/************************************************
 * Description: UI functions for the index page *
 ************************************************/

/********
 * Init *
 ********/

/*
 * Logging variables
 */
var gvScriptName_uiIndex = 'ui_index';

/*
 * Global variables
 */
var gvMaxResultsPerPage = 25;
var gvDefaultResultsPerPage = 7;
var gvHeightOfConcatSpiel = 200; // must match .brandSpiel-div.max-height in app.css
var gvDelayBeforePopup = 5000; // miliseconds before popup app ad displays on mobile
var gvIsSearchItemInFocus = {productGroupName: null,
                             productGroupId: null};
/*
 * Initialise the script
 */
(function initialise(){

    var lvFunctionName = 'initialise';
    log(gvScriptName_uiIndex + '.' + lvFunctionName + ': Start','INITS');

})();

/*************
 * Listeners *
 *************/

 /*
  *
  */
 function categoryFilter_click_listener(event){

    var lvFunctionName = 'categoryFilter_click_listener';
    log(gvScriptName_uiIndex + '.' + lvFunctionName + ': Start','LSTNR');

    var lvArgs;

    // We're either adding the filter or removing it

    // Remove filter
    if(event.target.getAttribute('data-selected') === 'true') {
        lvArgs = {productGroupId:   null,
                  productGroupName: null,
                  categoryId:       null,
                  categoryName:     null,
                  brandId:          null,
                  brandName:        null,
                  brandCatId:       null};

        logEvent('WEB_APP-CATEGORY_FILTER_REMOVED',lvArgs,null);
    }

    // Add filter
    else {
        lvArgs = {productGroupId:   null,
                  productGroupName: null,
                  categoryId:       event.target.getAttribute('data-categoryid'),
                  categoryName:     event.target.getAttribute('data-categoryname'),
                  brandId:          event.target.getAttribute('data-brandid'),
                  brandName:        event.target.getAttribute('data-brandname'),
                  brandCatId:       event.target.getAttribute('data-id')};

        logEvent('WEB_APP-CATEGORY_FILTER_APPLIED',lvArgs,null);

        incrementSearchCategoryHitCount(lvArgs.categoryId);
    }

    buildPage(lvArgs);
}

/*
 *
 */
function showAllCategoryFilters_click_listener(event){

    var lvFunctionName = 'showAllCategoryFilters_click_listener';
    log(gvScriptName_uiIndex + '.' + lvFunctionName + ': Start','LSTNR');

    $(".categoryFilter-hidden-div").css('display','inline');
    $("#showAllCategories_a").css('display','none');

    lvArgs = {productGroupId:   null,
              productGroupName: null,
              categoryId:       null,
              categoryName:     null,
              brandId:          null,
              brandName:        null,
              brandCatId:       null};

    logEvent('WEB_APP-CATEGORY_FILTER_SHOW_MORE',lvArgs,null);

}

/*
 *
 */
function showLessCategoryFilters_click_listener(event){

    var lvFunctionName = 'showLessCategoryFilters_click_listener';
    log(gvScriptName_uiIndex + '.' + lvFunctionName + ': Start','LSTNR');

    $(".categoryFilter-hidden-div").css('display','none');
    $("#showAllCategories_a").css('display','inline');

    lvArgs = {productGroupId:   null,
              productGroupName: null,
              categoryId:       null,
              categoryName:     null,
              brandId:          null,
              brandName:        null,
              brandCatId:       null};

    logEvent('WEB_APP-CATEGORY_FILTER_SHOW_LESS',lvArgs,null);

}

/*
 * When the search focuses on an item (which it will always do whenever there
 * is a valid valud to focus on, because autofocus is on), set the global variable.
 * This is so that, when the user submits with the enter key,
 * we can check wether their submitted value is a valid value
 * from the list
 */
function productGroupSearch_focus_listener(event, ui ) {

    var lvFunctionName = 'productGroupSearch_focus_listener';
    log(gvScriptName_uiIndex + '.' + lvFunctionName + ': Start','LSTNR');
    gvIsSearchItemInFocus = {productGroupId:   ui.item.value,
                             productGroupName: ui.item.label};
    return false;

}


/*
 *
 */
function productGroupSearch_select_listener(event, ui ) {

    var lvFunctionName = 'productGroupSearch_select_listener';
    log(gvScriptName_uiIndex + '.' + lvFunctionName + ': Start','LSTNR');
    $("#productGroupSearch_input").val(ui.item.label);
    lvArgs = {productGroupId:   ui.item.value,
              productGroupName: ui.item.label};

    logEvent('WEB_APP-PRODUCT_GROUP_SEARCH',lvArgs,null);

    buildPage(lvArgs);

    return false;
}

/*
 * If the drop down list is active, enter will select and value and the select event
 * listener will take care of everything. There are two cases where this won't happen...
 *
 * 1) for empty input, reset the screen to the default results
 * 2) for non-empty, where there's no values displayed in the dropdown list
 *    In these cases, we need to display an error message.
 *
 *    So on enter, we see whether the current value of the text box matches the most-recently
 *    in-focus value (saved in gvIsSearchItemInFocus by the focus event listener) and, if so, we
 *    ignore it. If it doesn't match, we can assume the user has entered a value that does not
 *    appear in the autocomplete list, and display an error message to this effect
 */
function productGroupSearch_enter_listener(event) {
    if (event.keyCode == 13) {

        var lvFunctionName = 'productGroupSearch_enter_listener';
        log(gvScriptName_uiIndex + '.' + lvFunctionName + ': Start','LSTNR');

        var lvArgs = {productGroupId:   null,
                      productGroupName: null,
                      categoryId:       null,
                      categoryName:     null,
                      brandId:          null,
                      brandName:        null,
                      brandCatId:       null};

        if($("#productGroupSearch_input").val() === ''){


            logEvent('WEB_APP-PRODUCT_GROUP_SEARCH_EMPTY_ENTER',lvArgs,null);

            buildPage(lvArgs);

        } else {
            if($("#productGroupSearch_input").val() !== gvIsSearchItemInFocus.productGroupName) {

                $("#productGroupSearch_feedbackMsg_span").html('No matches for "' + $("#productGroupSearch_input").val() + '". Please select a search term from the dropdown list');
                $("#productGroupSearch_feedbackMsg_small_span").html('No results');

                lvArgs.productGropuName = $("#productGroupSearch_input").val();

                logEvent('WEB_APP-PRODUCT_GROUP_SEARCH_NO_MATCH',lvArgs,null);

            }
        }
    }
}

/*
 *
 */
function openBrand_click_listener(event){

    var lvFunctionName = 'openBrand_click_listener';
    log(gvScriptName_uiIndex + '.' + lvFunctionName + ': Start','LSTNR');

    var lvBrandURL = event.target.getAttribute('data-url');
    var lvArgs = {productGroupId:   null,
                  productGroupName: null,
                  categoryId:       event.target.getAttribute('data-categoryid'),
                  categoryName:     event.target.getAttribute('data-categoryname'),
                  brandId:          event.target.getAttribute('data-brandid'),
                  brandName:        event.target.getAttribute('data-brandname'),
                  brandCatId:       event.target.getAttribute('data-id'),
                  brandURL:         lvBrandURL};

    window.open(lvBrandURL);

    // Log
    logEvent('WEB_APP-BRAND_CLICK_THROUGH',lvArgs,null);

    // prevent jump-down
    return false;
}

/*
 * This does the fairly complicated job of animating a show-all on the hidden spiel text
 */
function brandSpielShowMore_click_listener(event){

    var lvFunctionName = 'brandSpielShowMore_click_listener';
    log(gvScriptName_uiIndex + '.' + lvFunctionName + ': Start','LSTNR');

    var lvArgs = {productGroupId:   event.target.getAttribute('data-productgroupid'),
                  productGroupName: event.target.getAttribute('data-productgroupname'),
                  categoryId:       event.target.getAttribute('data-categoryid'),
                  categoryName:     event.target.getAttribute('data-categoryname'),
                  brandId:          event.target.getAttribute('data-brandid'),
                  brandName:        event.target.getAttribute('data-brandname'),
                  brandCatId:       event.target.getAttribute('data-id')};

    // Get how high the div needs to be by looking at all the spiel <p>s
    var $lvAllParagraphs = $('.brandSpiel-p[data-id="' + lvArgs.brandCatId + '"]');
    var lvNewHeight = 0;
    $lvAllParagraphs.each(function(){
        lvNewHeight += $(this).outerHeight() + 10; // The plus ten is the size of the margin below each paragraph (should be included in outerHeight? not sure why it's not working)
    });

    // Update the CSS of the brandSpiel <div>
    var $lvBrandSpielDiv = $('.brandSpiel-div[data-id="' + lvArgs.brandCatId + '"]');
    $lvBrandSpielDiv
        .css({
             // Set height to prevent instant jumpdown when max height is removed
            'height': $lvBrandSpielDiv.height(),
            'max-height': 9999
        })
        .animate({
            'height': lvNewHeight
        });

    // fade out read-more and transparency
    $('.brandTextShowMoreLess-p[data-id="' + lvArgs.brandCatId + '"]').fadeOut();
    $('.brandSpielFadeOut-p[data-id="' + lvArgs.brandCatId + '"]').css('display','none');

    // Log
    logEvent('WEB_APP-BRAND_SPIEL_SHOW_MORE',lvArgs,null);

    // prevent jump-down
    return false;
}

/*
 * For the popup ad [currently obsolete]
 */
function closePopup_click_listener(event){

    var lvFunctionName = 'closePopup_click_listener';
    log(gvScriptName_uiIndex + '.' + lvFunctionName + ': Start','LSTNR');

    // Close the parent div, that way any resizing etc will not bring it back.
    $('#adPopupContainer_div').css('display','none');
}

/*
 * For anybody clicking on the ad
 */
function ad_click_listener(event){

    var lvFunctionName = 'ad_click_listener';
    log(gvScriptName_uiIndex + '.' + lvFunctionName + ': Start','LSTNR');

    logEvent('WEB_APP-AD_CLICK_THROUGH',null,null);

    window.open('http://getbalu.org/download');

}


/*********************
 * Page Constructors *
 *********************/

/*
 *
 */
function buildPage(pvArgs){

    var lvFunctionName = 'buildPage';
    log(gvScriptName_uiIndex + '.' + lvFunctionName + ': Start','PROCS');

    logEvent('WEB_APP-PAGE_LOAD',pvArgs,null);

    buildCategoryFilter(pvArgs);
    buildProductGroupSearch(pvArgs);
    buildLoadingIcon(pvArgs,buildBrandList,buildAdBarAndPopup);
}

/*
 *
 */
function buildCategoryFilter(pvArgs){

    var lvFunctionName = 'buildCategoryFilter';
    log(gvScriptName_uiIndex + '.' + lvFunctionName + ': Start','PROCS');

    var lvHtmlString = '';
    var lvNumberOfCategoriesToShow;
    // If we have a filter set, show n-1 categories
    if(pvArgs.categoryId !== null && typeof pvArgs.categoryId !== 'undefined' && pvArgs.categoryId !== ''){
        lvNumberOfCategoriesToShow = 4;
    } else {
        lvNumberOfCategoriesToShow = 5;
        pvArgs.categoryName = null;
    }

    // Returns the categories in order of popularity
    getCategories(pvArgs,function(pvCategories){

        // Display the selected category (if any), the next top n-1 categories, and a more button
        lvHtmlString += '<div class="categoryFilter-div">';
        if(pvArgs.categoryName !== null){
            lvHtmlString += '  <a class="categoryTag-a categoryTag-selected-a categoryFilters-a" data-categoryid="' + pvArgs.categoryId + '" data-categoryname="' + pvArgs.categoryName + '" data-selected="true">' + pvArgs.categoryName + '</a>';
        }
        for(var i = 0, lvNumberOfCatsDisplayed = 0; lvNumberOfCatsDisplayed < lvNumberOfCategoriesToShow; i++){
            if(pvArgs.categoryId !== pvCategories[i].id){
                lvHtmlString += '  <a class="categoryTag-a categoryFilters-a" data-categoryid="' + pvCategories[i].id + '" data-categoryname="' + pvCategories[i].categoryName + '">' + pvCategories[i].categoryName + '</a>';
                lvNumberOfCatsDisplayed++;
            }
        }
        lvHtmlString += '  <a id="showAllCategories_a" class="categoryTag-a">more...</a>';
        lvHtmlString += '</div>';

        // Hide the rest of the categories
        lvHtmlString += '<div class="categoryFilter-hidden-div">';
        for(var j = lvNumberOfCategoriesToShow; j < pvCategories.length; j++){
            lvHtmlString += '  <a class="categoryTag-a categoryFilters-a" data-categoryid="' + pvCategories[j].id + '" data-categoryname="' + pvCategories[i].categoryName + '">' + pvCategories[j].categoryName + '</a>';
        }
        lvHtmlString += '  <a id="showLessCategories_a" class="categoryTag-a">less...</a>';
        lvHtmlString += '</div>';

        //'<a id="removeCategoryFilter_a">x</a>'

        /* Attach to page */

        $('#categoryFilterContainer_div').html(lvHtmlString);

        /* Listener */
        $('.categoryFilters-a').each(function(i,pvLink){
            pvLink.addEventListener('click',categoryFilter_click_listener);
        });
        $('#showAllCategories_a').click(showAllCategoryFilters_click_listener);
        $('#showLessCategories_a').click(showLessCategoryFilters_click_listener);
    });
}

/*
 *
 */
function buildProductGroupSearch(pvArgs){

    var lvFunctionName = 'buildProductGroupSearch';
    log(gvScriptName_uiIndex + '.' + lvFunctionName + ': Start','PROCS');

    /* Put the search box up immediatley for aesthetics */

    var lvHtmlString = '';

    lvHtmlString += '<div class="medium-4 medium-offset-4 small-12 columns productGroupSearch_div">';
    lvHtmlString += '  <input type="text" id="productGroupSearch_input" class="ui-autocomplete-input" autocomplete="on" placeholder="Search..." />';
    lvHtmlString += '  <span class="productGroupSearch-feedbackMsg-span show-for-small-only" id="productGroupSearch_feedbackMsg_small_span"></span>';
    lvHtmlString += '</div>';
    lvHtmlString += '<div class="medium-4 columns show-for-medium-up">';
    lvHtmlString += '  <span class="productGroupSearch-feedbackMsg-span" id="productGroupSearch_feedbackMsg_span"></span>';
    lvHtmlString += '</div>';

    /* Attach to page */

    $('#productGroupSearchContainer_div').html(lvHtmlString);

    /* Get the data, and populate the autocomplete */

    getProductGroups(pvArgs,function(pvProductGroups){

        /* Activate Autocomplete */

        $("#productGroupSearch_input").autocomplete({
            source:    pvProductGroups,
            autoFocus: true,
            focus:     productGroupSearch_focus_listener,
            select:    productGroupSearch_select_listener
        }).val(pvArgs.productGroupName);

        $("#productGroupSearch_input").keydown(productGroupSearch_enter_listener);
    });
}

/*
 * Adds the loading icon to the screen, then calls the buildBrandList function, which calls the buildAdBarAndPopup function
 */
function buildLoadingIcon(pvArgs, pvFirstCallback, pvSecondCallback){

    var lvFunctionName = 'buildLoadingIcon';
    log(gvScriptName_uiIndex + '.' + lvFunctionName + ': Start','PROCS');

    var lvHtmlString = '';

    lvHtmlString += '<div class="row">';
    lvHtmlString += '  <div class="small-3 small-centered end columns">';
    lvHtmlString += '  <img id="loadingLogo_img" src="img/logo.png" />';
    lvHtmlString += '  </div>';
    lvHtmlString += '<div>';

    $('#loadingLogoContainer_div').html(lvHtmlString);

    pvFirstCallback(pvArgs, pvSecondCallback);
}

/*
 * Builds the brand list, then calls the buildAdBarAndPopup function
 */
function buildBrandList(pvArgs, pvCallback){

    var lvFunctionName = 'buildBrandList';
    log(gvScriptName_uiIndex + '.' + lvFunctionName + ': Start','PROCS');

    // If we've searched or filtered, then display up to the gvMaxResultsPerPage.
    // Otherwise display the gvDefaultResultsPerPage
    var lvNumberOfResults = gvDefaultResultsPerPage;
    if((typeof pvArgs.productGroupId !== 'undefined' && pvArgs.productGroupId !== '' && pvArgs.productGroupId !== null) ||
       (typeof pvArgs.categoryId     !== 'undefined' && pvArgs.categoryId     !== '' && pvArgs.categoryId     !== null)){
        lvNumberOfResults = gvMaxResultsPerPage;
    }

    getBrandData(pvArgs,function(pvBrandData){

        var lvHtmlStringX = '';

        lvHtmlStringX += '<div class="row">';
        lvHtmlStringX += '  <div class="small-12 columns">';

        if(pvBrandData.length > 0){
            lvHtmlStringX += '    <ul class="small-block-grid-1 medium-block-grid-2 large-block-grid-3">';
            for(var i = 0; i < pvBrandData.length && i < lvNumberOfResults; i++){

                lvHtmlStringX += '      <li>';
                lvHtmlStringX += '        <div class="row brandContainer-div">';

                // Image
                lvHtmlStringX += '          <div class="brandImg-div small-4 columns">';
                if(pvBrandData[i].twitterHandle !== null && pvBrandData[i].twitterHandle !== '' && typeof pvBrandData[i].twitterHandle !== 'undefined'){
                    lvHtmlStringX += '            <img src="https://twitter.com/'  + pvBrandData[i].twitterHandle + '/profile_image?size=bigger" class="brandLogo-img" />';
                } else {
                    lvHtmlStringX += '            <img src="https://twitter.com/baluHQ/profile_image?size=bigger" class="brandLogo-img" />';
                }
                // Search Category tag, underneath the image
                lvHtmlStringX += '            <a class="categoryTag-a categoryFilters-secondary-a" data-id="' + pvBrandData[i].id + '" data-categoryid="' + pvBrandData[i].categoryId + '" data-categoryname="' + pvBrandData[i].categoryName + '" data-brandid="' + pvBrandData[i].brandId + '" data-brandname="' + pvBrandData[i].brandName + '">' + pvBrandData[i].categoryName + '</a>';
                lvHtmlStringX += '          </div>';

                lvHtmlStringX += '          <div class="brandText-div small-8 columns">';

                // Brand name
                lvHtmlStringX += '            <span class="brandTitle-span"><a class="brandTitle-a" data-url="' + pvBrandData[i].homepage + '" data-brandname="' + pvBrandData[i].brandName + '" data-categoryid="' + pvBrandData[i].categoryId + '" data-categoryname="' + pvBrandData[i].categoryName + '" data-brandid="' + pvBrandData[i].brandId + '" class="brandTitle-link">' + pvBrandData[i].brandName + '</a></span><br />';

                // Brand spiel
                lvHtmlStringX += '            <div class="brandSpiel-div" data-id="' + pvBrandData[i].id + '">';
                lvHtmlStringX += '              <p class="brandSpiel-p" data-id="' + pvBrandData[i].id + '">' + pvBrandData[i].brandSpiel + '</p>';
                lvHtmlStringX += '              <p class="brandSpielFadeOut-p" data-id="' + pvBrandData[i].id + '"></p>';
                lvHtmlStringX += '            </div>';

                lvHtmlStringX += '            <div style="position: relative;"><p class="brandTextShowMoreLess-p" data-id="' + pvBrandData[i].id + '">';
                lvHtmlStringX += '              <span class="brandTextShowMore-span" data-id="' + pvBrandData[i].id + '" data-brandid="' + pvBrandData[i].brandId + '" data-categoryid="' + pvBrandData[i].categoryId + '"><a class="brandTextShowMore-a tiny secondary radius button" data-id="' + pvBrandData[i].id + '" data-brandid="' + pvBrandData[i].brandId + '" data-categoryid="' + pvBrandData[i].categoryId + '" data-categoryname="' + pvBrandData[i].categoryName + '" data-brandname="' + pvBrandData[i].brandName + '">more</a></span>';
                lvHtmlStringX += '            </p></div>'; // the div forces the same mobile screen padding as the text above

                lvHtmlStringX += '          </div>'; // End brandText-div

                lvHtmlStringX += '        </div>'; // End brandContainer-div

                lvHtmlStringX += '      </li>';
            }
            lvHtmlStringX += '    </ul>';
        } // Did we have any rows in pvBrandData
        else {
            lvHtmlStringX += '<p>Sorry, we didn\'t find anything</p>'; //To do: make a recommendation!
        }

        // If we're showing the default number of results (i.e. no search done) then display a user prompt
        if(lvNumberOfResults === gvDefaultResultsPerPage) {
            lvHtmlStringX += '<div class="row">';
            lvHtmlStringX += '  <div class="small-10 medium-4 small-centered end columns">';
            lvHtmlStringX += '    <p class="searchForMore-span">Select a category or search for a product to see more results<p>';
            lvHtmlStringX += '  </div>';
            lvHtmlStringX += '</div>';
        }
        lvHtmlStringX += '  </div>';
        lvHtmlStringX += '</div>';

        /* Attach to page */

        // This hides the loading icon, and replaces the previous results list
        $('#loadingLogoContainer_div').css('display','none');
        $('#brandListContainer_div').html(lvHtmlStringX);

        /* Detect any which are smaller than the max-height of the brandSpiel-div, and remove the fade and more button */

        var $lvAllBrandDivs = $('.brandSpiel-div');
        $lvAllBrandDivs.each(function(){
            var lvBrandId = $(this).attr('data-id');
            var $lvAllParagraphs = $('.brandSpiel-p[data-id="' + lvBrandId + '"]');
            var lvTotalHeight = 0;
            $lvAllParagraphs.each(function(){
                lvTotalHeight += $(this).outerHeight() + 10; // The plus ten is the size of the margin below each paragraph (should be included in outerHeight? not sure why it's not working)
            });
            if(lvTotalHeight <= gvHeightOfConcatSpiel) {
                // Remove fade out and more text
                $('.brandTextShowMoreLess-p[data-id="' + lvBrandId + '"]').remove();
                $('.brandSpielFadeOut-p[data-id="' + lvBrandId + '"]').remove();
            }
        });

        /* Add Listeners */

        $('.brandTextShowMore-a').each(function(i,pvSpan){
            pvSpan.addEventListener('click',brandSpielShowMore_click_listener);
        });
        $('.categoryFilters-secondary-a').each(function(i,pvLink){
            pvLink.addEventListener('click',categoryFilter_click_listener);
        });
        $('.brandTitle-a').each(function(i,pvLink){
            pvLink.addEventListener('click',openBrand_click_listener);
        });

        /* Display the ad bar / popup */
        pvCallback(pvArgs);

/*
        var tempString = '';
        var lvTotalClickCount = 0;
        for(var q = 0; q < pvBrandData.length; q++){
            tempString += '<p class="tempDebug">' + pvBrandData[q].recGrainSort + ' | ' + pvBrandData[q].brandRatingScore + ' | ' + pvBrandData[q].brandClickCountSum + ' (' + pvBrandData[q].brandName + ' - ' + pvBrandData[q].categoryName + ')</p>';
            lvTotalClickCount += pvBrandData[q].brandClickCountSum;
        }
        tempString = '<p>' + lvTotalClickCount + '</p>' + tempString;
        $('#debugDiv').html(tempString);
*/
    });
}

/*
 *
 */
function buildAdBarAndPopup(pvArgs){

    var lvFunctionName = 'buildAdBarAndPopup';
    log(gvScriptName_uiIndex + '.' + lvFunctionName + ': Start','PROCS');

    // Ad bar
    var lvHtmlString_adBar = '';
    lvHtmlString_adBar += '<div class="adBar-div">';
    lvHtmlString_adBar += '  <a class="ad-a"><img class="ad-img" src="img/sidebarAd_enlarged.png" /></a>';
    lvHtmlString_adBar += '</div>';
    $('#adBarContainer_div').html(lvHtmlString_adBar);

    $('.ad-a').click(ad_click_listener);

    // Popup bar
    var lvHtmlString_adPopup = '';

    lvHtmlString_adPopup += '<div class="adPopup-div">';
    lvHtmlString_adPopup += '  <p><a id="closePopup_a">Close</a></p>';
    lvHtmlString_adPopup += '  <p>Popup: Get recommendations like these while you shop - directly in your browser!</p>';
    lvHtmlString_adPopup += '  <a href="http://www.getbalu.org/">Download the app here</a>';
    lvHtmlString_adPopup += '</div>';
    setTimeout( function(){
        //$('#adPopupContainer_div').html(lvHtmlString_adPopup);
        //$('#closePopup_a').click(closePopup_click_listener);
    }, gvDelayBeforePopup);
}

/*******************
 * Other Functions *
 *******************/

 // ...
