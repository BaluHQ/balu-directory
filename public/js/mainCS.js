/***************************************
 * Description:  Client side javscript *
 ***************************************/

/*
* Global variables
*/

/* Logging control */
var gvScriptName = 'mainCS';

/*
 * Initialise the script
 */
(function initialise(){

    var lvFunctionName = 'initialise';
    log(gvScriptName + '.' + lvFunctionName + ': Start','INITS');

    // Do everything when the DOM is ready
    $(document).ready(function(){
        var lvArgs = {eventName: 'WEB_APP-PAGE_LOAD',
                      url: window.location.href,
                      message: ''};
        $.post('/log',lvArgs,function(pvResponse){
        });

        /*
         * Listeners
         */

        $('#buttonSearch').click(searchButtonClick_listener);
        $('#fieldSearch').keypress(searchButtonEnter_listener);

    },false);

})();

/*************
 * Listeners *
 *************/

/*
 *
 */
function searchButtonEnter_listener(pvEvent){
    if(pvEvent.which == 13) searchButtonClick_listener(pvEvent);
}
function searchButtonClick_listener(pvEvent){

    var lvFunctionName = 'searchButtonClick_listener';
    log(gvScriptName + '.' + lvFunctionName + ': Sending','LSTNR');

    var lvArgs = {eventName: 'WEB_APP-SEARCH',
                  searchTerm: $('#fieldSearch').val(),
                  message: ''};

    $.post('/log',lvArgs,function(pvResponse){
    });

    search($('#fieldSearch').val());
}

/*
 *
 */
function brandHomepage_listener(pvEvent){
    var lvFunctionName = 'brandHomepage_listener';
    log(gvScriptName + '.' + lvFunctionName + ': Sending','LSTNR');

    var lvArgs = {eventName: 'WEB_APP-BRAND_CLICK_THROUGH',
                  brandId: $(this).data('brandilnd'),
                  searchTerm: $('#fieldSearch').val(),
                  message: ''};

    $.post('/log',lvArgs,function(pvResponse){
    });

    window.open($(this).data('link'));
}

/*
 *
 */
function recLink_listener(pvEvent){
    var lvFunctionName = 'recLink_listener';
    log(gvScriptName + '.' + lvFunctionName + ': Sending','LSTNR');

    // To do: tracked tabs
    var lvArgs = {eventName: 'WEB_APP-REC_CLICK_THROUGH',
                  recommendationId: $(this).data('recid'),
                  brandId: $(this).data('brandid'),
                  searchTerm: $('#fieldSearch').val(),
                  message: ''};

    $.post('/log',lvArgs,function(pvResponse){
    });

    window.open($(this).data('link'));
}

/*
 *
 */
function brandDetailLink_listener(pvEvent){
    var lvFunctionName = 'brandDetailLink_listener';
    log(gvScriptName + '.' + lvFunctionName + ': Sending','LSTNR');

    // To do: tracked tabs
    var lvArgs = {eventName: 'WEB_APP-BRAND_DETAIL_CLICK',
                  brandId: $(this).data('brandid'),
                  searchTerm: $('#fieldSearch').val(),
                  message: ''};

    $.post('/log',lvArgs,function(pvResponse){
    });

    window.location.assign('/search?s=' + $(this).data('brandname'));
}

/*************
 * Functions *
 *************/

function search(pvSearchTerm){

    var lvFunctionName = 'search';
    log(gvScriptName + '.' + lvFunctionName + ': Start' ,'PROCS');

    var lvArgs = {searchTerm: pvSearchTerm};

    // Update the URL before sending the AJAX
    window.history.pushState('', '', '?s=' + pvSearchTerm);

    $.post('/search',lvArgs,displayRecommendations);
}

function displayRecommendations(pvArgs){

    var lvFunctionName = 'displayRecommendations';
    log(gvScriptName + '.' + lvFunctionName + ': Start' ,'PROCS');

    $('#preLog').html(pvArgs.log);
    var lvHtml_brand = '';
    var lvHtml_recs = '';
    var lvRecommendations = pvArgs.recommendations;
    var lvBrands = pvArgs.brands;

    // The back-end will determine whether the searches matches a brand or not. If it does, we
    // display a brand detail page rather than simply a list of matching recs. For brand matches,
    // the pvArgs.brands dataset will contain the matching brand(s) (can be plural, e.g. Birdsong?),
    // and the recs spreadsheet will contain the brands' products.
    if(pvArgs.isBrand) {
        var lvHomepage = pvArgs.brands[0].homepage.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/im)[1]; // strip out the gumph around the domain
        lvHtml_brand += '<div class="row">';
        lvHtml_brand += '  <div class="medium-1 column">';
        lvHtml_brand += '    <img src="https://twitter.com/' + pvArgs.brands[0].twitterHandle + '/profile_image?size=bigger" />';
        lvHtml_brand += '  </div>';
        lvHtml_brand += '  <div class="medium-11 columns">';
        lvHtml_brand += '    <h1><a id="linkBrandTitle" data-link="' + pvArgs.brands[0].homepage + '" data-brandid="' + pvArgs.brands[0].brandId + '" class="brandTitle" target="_blank">' + pvArgs.brands[0].brandName + '</a></h1>';
        lvHtml_brand += '  </div>';
        lvHtml_brand += '</div>';
        lvHtml_brand += '<p class="brandSpiel">' + pvArgs.brands[0].brandSpiel + '</p>';
        lvHtml_brand += '<a id="linkBrandUrl" data-link="' + pvArgs.brands[0].homepage + '" data-brandid="' + pvArgs.brands[0].brandId + '" class="brandHomepage" target="_blank">' + lvHomepage + '</a>';
    }

    if(lvRecommendations.length === 0){
        lvHtml_recs += '<p>We didn\'t find any products</p>';
    }
    // These are laid out in a grid, left to right, top to bottom. Some vars to help us through the loop...
    var lvNumberOfColumns = 3; // must divide into 12
    var lvGridColWidth = 12/lvNumberOfColumns;
    var lvMaxResults = 17;
    var lvLastIndex = Math.min(lvMaxResults,lvRecommendations.length)-1;
    var lvColCounter = 1;
    for(var i = 0; i < lvRecommendations.length && i < lvMaxResults; i++, lvColCounter++){

        if(lvColCounter === lvNumberOfColumns+1) {
            lvColCounter = 1;
        }
        if(lvColCounter === 1) {
            lvHtml_recs += '<div class="row">';
        }
        if(i === lvLastIndex) {
            lvHtml_recs += '<div class="large-' + lvGridColWidth + ' columns end">';
        } else {
            lvHtml_recs += '<div class="large-' + lvGridColWidth + ' columns">';
        }
        lvHtml_recs += getRecommendationTile(lvRecommendations[i],pvArgs.isBrand);
        lvHtml_recs += '</div>';
        if(lvColCounter === lvNumberOfColumns) {
            lvHtml_recs += '</div>';
        }
    }
    if(lvColCounter !== lvNumberOfColumns) {
        lvHtml_recs += '</div>';
    }
    $('#brandContainer').html(lvHtml_brand);
    $('#recsContainer').html(lvHtml_recs);

    // now add listeners to all the links

    $('#linkBrandTitle').click(brandHomepage_listener);
    $('#linkBrandUrl').click(brandHomepage_listener);
    $('.recTile_clickThru').click(recLink_listener);
    $('a.recTile_brandName').click(brandDetailLink_listener);
}

function getRecommendationTile(pvRecommendation,pvIsBrandSearch){

    var lvFunctionName = 'getRecommendationTile';
    log(gvScriptName + '.' + lvFunctionName + ': Start' ,'PROCS');

    var lvHtml = '';
    var lvBrandIdHtml = '';
    if(pvIsBrandSearch) {
        lvBrandIdHtml = 'data-brandid="' + pvRecommendation.brandId + '" ';
    }
    lvHtml += '  <div class="row recTile">';
    lvHtml += '    <div class="recTile_imageArea">';
    lvHtml += '      <img class="recTile_image" src="' + pvRecommendation.imageURL + '" />';
    lvHtml += '    </div>'; // columns recTile_imageAread
    lvHtml += '    <div class="recTile_textArea">';
    if(pvRecommendation.baluFavourite){
        lvHtml += '    <i class="fi-star" title="Balu Favourite"></i>';
    }
    lvHtml += '      <p class="recTile_brandName" title="See all products from ' + pvRecommendation.brandName + '"><a class="recTile_brandName" data-brandname="' + encodeURIComponent(pvRecommendation.brandName.toLowerCase()) + '" data-brandid="' + pvRecommendation.brandId + '">' + pvRecommendation.brandName + '</a></p>';
    lvHtml += '      <p class="recTile_productName">' + pvRecommendation.productName + '</p>';
    lvHtml += '    </div>'; // columns recTile_textArea
    lvHtml += '    <a data-recid="' + pvRecommendation.recommendationId + '" ' + lvBrandIdHtml + 'data-link="' + pvRecommendation.productURL + '" class="recTile_clickThru">Find Out More</a>';
    lvHtml += '  </div>'; // row recTile

    return lvHtml;
}
