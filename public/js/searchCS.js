/**********************************************
 * Description:  Client side search functions *
 **********************************************/

/*
* Global variables
*/

/* Data */
var gvBrands = [];
var gvSearchProducts = [];
var gvRecommendations = [];
var gvIndex = lunr(function(){
    this.field('searchCategory');
    this.field('productGroup');
    this.field('sex');
    this.field('positiveSearchTerms',{boost:10});
    //this.field('negativeSearchTerms');
    this.ref('id');
});


/* Logging control */
var gvScriptName_search = 'searchCS';

/*
 * Initialise the script
 */
(function initialise(){

    var lvFunctionName = 'initialise';
    //log(gvScriptName_search,lvFunctionName,'Start','INITS');

})();

/*************
 * Functions *
 *************/

function getData(pvArgs,pvCallback){

    var lvLog = pvArgs.log;
    var lvFunctionName = 'getData';
    lvLog += log(gvScriptName_search,lvFunctionName,'Start','PROCS');

    var lvArgs = {log: lvLog};

    $.post('/getdata',lvArgs,function(pvResponse){
        gvBrands = pvResponse.brands;
        gvSearchProducts = pvResponse.searchProducts;
        gvRecommendations = pvResponse.recommendations;

        // Build our search index

        gvSearchProducts.forEach(function(pvSearchProduct){
            gvIndex.add({

                // The index ref
                id: 'searchProducts' + ' - ' + pvSearchProduct.searchProductId + ' - ' + pvSearchProduct.productGroupId, // this makes it much easier to pull the productGroup from the search results

                // The index search content
                searchCategory: pvSearchProduct.searchCategoryName,
                productGroup: pvSearchProduct.productGroupName,
                sex: pvSearchProduct.sex,
                positiveSearchTerms: pvSearchProduct.searchTerm1 + ' ' + pvSearchProduct.searchTerm2 + ' ' + pvSearchProduct.searchTerm3 + ' ' + pvSearchProduct.searchTerm4 + ' ' + pvSearchProduct.searchTerm5 + ' ' + pvSearchProduct.searchTerm6 + ' ' + pvSearchProduct.searchTerm7
                //negativeSearchTerms: pvSearchProduct.negativeSearchTerm1 + ' ' + pvSearchProduct.negativeSearchTerm2 + ' ' + pvSearchProduct.negativeSearchTerm3 + ' ' + pvSearchProduct.negativeSearchTerm4
            });
            //store[entry.href] = {title: entry.title, abstract: entry.abstract};
        });

        gvRecommendations.forEach(function(pvRecommendation){
            gvIndex.add({

                // The index ref
                id: 'recommendation' + ' - ' + pvRecommendation.recommendationId + ' - ' + pvRecommendation.productGroupId, // this makes it much easier to pull the productGroup from the search results

                // The index search content
                searchCategory: pvRecommendation.searchCategoryName,
                productGroup: pvRecommendation.productGroupName,
                sex: '',
                positiveSearchTerms: pvRecommendation.productName + ' ' + pvRecommendation.brandName
                //negativeSearchTerms: pvSearchProduct.negativeSearchTerm1 + ' ' + pvSearchProduct.negativeSearchTerm2 + ' ' + pvSearchProduct.negativeSearchTerm3 + ' ' + pvSearchProduct.negativeSearchTerm4
            });
            //store[entry.href] = {title: entry.title, abstract: entry.abstract};
        });

        pvResponse.log += log(gvScriptName_search,lvFunctionName,'Client-side data refreshed (brands: ' + gvBrands.length + ', searchProducts: ' + gvSearchProducts.length + ', recs: ' + gvRecommendations.length + ')','DEBUG');
        pvCallback(pvResponse.log);
    });
}

function waitForDataThenSearch(pvArgs,pvCallback,pvCounter){

    var lvFunctionName = 'waitForDataThenSearch';

    // Every 50 miliseconds, recheck to see whether we have retrieved data
    var lvMiliSecDelay = 50;
    var lvHasDataLoaded = false;

    if(gvBrands.length > 0 && gvSearchProducts.length > 0 && gvRecommendations.length > 0){
        pvArgs.log += log(gvScriptName_search,lvFunctionName,'Data loaded after ' + pvCounter + ' x ' + lvMiliSecDelay + 'ms','DEBUG');
        search(pvArgs,pvCallback);
        lvHasDataLoaded = true;
    }

    if(!lvHasDataLoaded) {
        if (pvCounter > 400) { // time out after twenty seconds
            pvArgs.log += log(gvScriptName_search,lvFunctionName,'Timed out waiting for data to load','ERROR');
            alert('Sorry, there has been a problem loading the Balu database. Can you try refreshing the page?');
            return;
        }

        // The first time, log to the front-end output. After that, just log to the console
        if(pvCounter === 1) {
            pvArgs.log += log(gvScriptName_search,lvFunctionName,'Data not yet loaded, waiting...','DEBUG');
        } else {
            log(gvScriptName_search,lvFunctionName,'Data not yet loaded, waiting...','DEBUG');
        }

        pvCounter++;
        window.setTimeout(function(){return waitForDataThenSearch(pvArgs,pvCallback,pvCounter);},lvMiliSecDelay);
    }
}

function search(pvArgs,pvCallback){

    var lvLog = pvArgs.log;
    var lvFunctionName = 'search';
    lvLog += log(gvScriptName_search,lvFunctionName,'Start','PROCS');

    var lvSearchTerm = pvArgs.searchTerm.trim().toLowerCase();

    var lvData = {};
    lvData.searchTerm = lvSearchTerm;
    lvData.log = lvLog;
    lvData.isBrand = false;
    lvData.brands = [];
    lvData.recommendations = [];

    /* First, let's see if this is a brand */

    for(var i = 0; i < gvBrands.length; i++){
        if(lvSearchTerm !== '' && gvBrands[i].brandName.toLowerCase() === lvSearchTerm) {
            lvData.log += log(gvScriptName_search,lvFunctionName,'Matched on brand search',' INFO');
            lvData.isBrand = true;
            lvData.brands.push(gvBrands[i]);
        }
    }

    /* If we matched a brand, just get all the brands' products) */

    if(lvData.isBrand){
        for(var j = 0; j < lvData.brands.length; j++){
            for(var k = 0; k < gvRecommendations.length; k++){
                if(lvData.brands[j].brandId === gvRecommendations[k].brandId) {
                    lvData.recommendations.push(gvRecommendations[k]);
                }
            }
        }
        lvData.log += log(gvScriptName_search,lvFunctionName,'Picked up ' + lvData.recommendations.length + ' recommendations for ' + lvData.brands.length + ' brand',' INFO');

    } else {

        /* Otherwise, let's search the Balu product database (searchProduct), find the matching productGroups, and filter the recommendations accordingly */

        var lvSearchResults = gvIndex.search(lvSearchTerm);

        // lvSearchResults is an array of objects {ref: x, score: y}, where x is a unique ID of the form [searchProducts | recommendation] - [<searchProductId> | <recommendationId>] - <productGroupId>
        // The first third is always 13 characters, the IDs are always 10 characters
        // If it's a website-level recommendation, there won't be a productGroupId (it will be "null")

        // For searchProducts, we need to go back to gvSearchProducts and create a list of productGroupIds, and use that to
        // create a list of recommendations
        // For recommendations we simply look them up from gvRecommendations

        // We're going to hold our lvProductGroups and lvRecs in associative arrays, for ease of access later
        var lvProductGroups = {};
        var lvRecs = {};

        for(var l = 0; l < lvSearchResults.length; l++) {

            // Let's pull out our productGroupIds (which might be null) and the rec/searchProduct IDs
            var lvSearchProductOrRec = lvSearchResults[l].ref.substring(0,14);
            var lvProductGroupId = lvSearchResults[l].ref.substring(lvSearchResults[l].ref.indexOf(' - ',17)+3,100);
            var lvRecOrSearchProductId = lvSearchResults[l].ref.substring(lvSearchResults[l].ref.indexOf(' - ')+3,27);

            // First, searchProducts
            if(lvSearchProductOrRec === 'searchProducts' && lvProductGroups[lvProductGroupId]) {
                // We might have already added this productGroup, in which case make sure we keep the highest scoring match
                lvProductGroups[lvProductGroupId] = Math.max(lvSearchResults[l].score,lvProductGroups[lvProductGroupId]);
            } else if(lvSearchProductOrRec === 'searchProducts') {
                // If we haven't added it yet, let's add it now
                lvProductGroups[lvProductGroupId] = lvSearchResults[l].score;
            }

            // Second, recommendations (mutually exclusive with previous two conditionals)
            if(lvSearchProductOrRec === 'recommendation') {
                // We might already have this rec, by virtue of having its productGroup already, but we sort that out
                // below
                lvRecs[lvRecOrSearchProductId] = lvSearchResults[l].score;
            }
        }

        var lvRecommendations = [];

        for(var m = 0; m < gvRecommendations.length; m++) {
            // We prioritise results that come to us via the searchProduct and productGroupLink. I.e.
            // so if we have a rec via that method, as well as the rec via a direct match, we will take the
            // score from the productGroup match. Arbitary choice, need to do something to avoid dupes.
            if(lvProductGroups[gvRecommendations[m].productGroupId]) {
                lvRecommendations.push(gvRecommendations[m]);
                lvRecommendations[lvRecommendations.length-1].score = lvProductGroups[gvRecommendations[m].productGroupId];
            } else if (lvRecs[gvRecommendations[m].recommendationId]) {
                lvRecommendations.push(gvRecommendations[m]);
                lvRecommendations[lvRecommendations.length-1].score = lvRecs[gvRecommendations[m].recommendationId];
            }
        }

        lvRecommendations = lvRecommendations.sort(
            function(a,b){
                return b.score-a.score;
            }
        );

        if(lvRecommendations.length > 0) {
            lvData.log += log(gvScriptName_search,lvFunctionName,'Matched ' + lvRecommendations.length + ' recommendations on product search',' INFO');
        }
        lvData.recommendations = lvRecommendations;
    }

    lvData.log += log(gvScriptName_search,lvFunctionName,'Search complete','PROCS');

    pvCallback(lvData);
}
