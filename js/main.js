/***************************************
 * Description: Driving script for app *
 ***************************************/

/********
 * Init *
 ********/

/*
 * Logging variables
 */
var gvScriptName_main = 'main';

    /*
     * Parse init
     */
    var gvAppId = 'mmhyD9DKGeOanjpRLHCR3bX8snue22oOd3NGfWKu';
    var gvParseServerURL = 'https://balu-parse-server.herokuapp.com/parse'; // repeated log.js

/*
 * Global variables
 */
var gvBrandData = [];
var gvCategoriesData = [];
var gvProductGroupsData = [];


/*
 * Initialise the script
 */
(function initialise(){

    var lvFunctionName = 'initialise';
    log(gvScriptName_main + '.' + lvFunctionName + ': Start','INITS');

    Parse.initialize(gvAppId);
    Parse.serverURL = gvParseServerURL;

})();


/*************
 * Functions *
 *************/

/*
 * The callback must be passed the array of brands
 * Always retrieve all brand data, so we don't hit the database on each search.
 * Filter later in the prepData function
 */
function getBrandData(pvArgs,pvCallback){

    var lvFunctionName = 'getBrandData';
    log(gvScriptName_main + '.' + lvFunctionName + ': Start','PROCS');

    if(gvBrandData.length === 0){
        /* Pull all data from Parse DB */

        var lvLimit = 1000;

        // Pull the search product query and, separately, the recs query.
        // Loop through both, combining them where their productGroup matches
        // To do: this should probably be moved to the cloud code.

        var query_SearchProduct = new Parse.Query(Parse.Object.extend('SearchProduct'));
        query_SearchProduct.include('productGroups');
        query_SearchProduct.include('searchCategories');

        query_SearchProduct.limit(lvLimit);

        query_SearchProduct.find({
            success: function(searchProducts){
                if(searchProducts.length === lvLimit) {logError('PARSE_ROW_LIMIT_ERROR',{message: gvScriptName_main + '.' + lvFunctionName + ': searchProduct count has hit query limit (' + lvLimit + ')'});}

                log(gvScriptName_main + '.' + lvFunctionName + ': Found ' + searchProducts.length + ' searchProducts',' INFO');

                var query_Recommendation = new Parse.Query(Parse.Object.extend('Recommendation'));
                query_Recommendation.include('productGroups');
                query_Recommendation.include('ethicalBrand');

                query_Recommendation.ascending('ratingScore, clickCountSum');
                query_Recommendation.limit(lvLimit);

                query_Recommendation.find({
                    success: function(recommendations){
                        if(recommendations.length === lvLimit) {logError('PARSE_ROW_LIMIT_ERROR',{message: gvScriptName_main + '.' + lvFunctionName + ': recommendations count has hit query limit (' + lvLimit + ')'});}

                        log(gvScriptName_main + '.' + lvFunctionName + ': Found ' + recommendations.length + ' recommendations',' INFO');

                        for(var i = 0; i < searchProducts.length; i++){

                            for(var j = 0; j < recommendations.length; j++){

                                if(searchProducts[i].get('productGroups').id === recommendations[j].get('productGroups').id) {

                                    var lvHitCount;
                                    if(typeof searchProducts[i].get('searchCategories').get('hitCount') === 'undefined'){
                                        lvHitCount = 1;
                                    } else {
                                        lvHitCount = searchProducts[i].get('searchCategories').get('hitCount');
                                    }

                                    var lvFavouriteCount;
                                    if(recommendations[j].get('ethicalBrand').get('baluFavourite')){
                                        lvFavouriteCount = 2; // Set this as 2, because we multiply the other scores by it
                                    } else {
                                        lvFavouriteCount = 1;
                                    }

                                    gvBrandData.push({// uniqueness
                                                      id:               recommendations[j].get('ethicalBrand').id + '-' + searchProducts[i].get('searchCategories').id,
                                                      brandId:          recommendations[j].get('ethicalBrand').id,
                                                      categoryId:       searchProducts[i].get('searchCategories').id,
                                                      // Brand
                                                      brandName:        recommendations[j].get('ethicalBrand').get('brandName'),
                                                      brandName_LC:     recommendations[j].get('ethicalBrand').get('brandName_LC'),
                                                      brandSpiel:       recommendations[j].get('ethicalBrand').get('brandSpiel').replace(/(\n\n|\r\r)/g,'</p><p class="brandSpiel-p" data-id="' + recommendations[j].get('ethicalBrand').id + '-' + searchProducts[i].get('searchCategories').id + '">'),
                                                      homepage:         recommendations[j].get('ethicalBrand').get('homepage'),
                                                      baluFavourite:    recommendations[j].get('ethicalBrand').get('baluFavourite'),
                                                      favouriteCount:   lvFavouriteCount,
                                                      twitterHandle:    recommendations[j].get('ethicalBrand').get('twitterHandle').substring(1,1000),
                                                      brandCat_aggScore: 0, // We will populate these later
                                                      brandCat_ClickCountSum: 0,
                                                      brandCat_RatingScore:   0,
                                                      // Lower Grain (recs)
                                                      recGrainSort:     recommendations[j].get('ethicalBrand').id + '-' + searchProducts[i].get('searchCategories').id + '-' + recommendations[j].id, // see below for explanation
                                                      recId:            recommendations[j].id,
                                                      ratingScore:      recommendations[j].get('ratingScore'), // This and the one below it are at rec grain, but will be summed up to brand grain when we remove dupes
                                                      clickCountSum:    recommendations[j].get('clickCountSum'),
                                                      // Search Category
                                                      categoryName:     searchProducts[i].get('searchCategories').get('categoryShortName'),
                                                      categoryHitCount: lvHitCount,
                                                      // Product Group
                                                      productGroupId:   recommendations[j].get('productGroups').id,
                                                      productGroupName: recommendations[j].get('productGroups').get('productGroupName')
                                    });

                                    //log(gvScriptName_main + '.' + lvFunctionName + ': added to gvBrandData: ' + gvBrandData[gvBrandData.length-1].categoryName + ' | ' + gvBrandData[gvBrandData.length-1].brandName + ' | ' + gvBrandData[gvBrandData.length-1].sortOrder,' INFO');

                                } // if searchProduct and recommendation have matching productGroups

                            } // loop through recommendations

                        } // loop through searchProducts

                        /* Before passing data to callback, make it unique */

                        // We need to remove duplicates to get a brand/searchCat grain, but we also need to sum up
                        // ratingScores from the rec grain. So, for efficiency, we really want it ordered by rec (for the sum) AND
                        // by brand/searchCat (for the uniqueness). One rec can only ever have 1 brand, but it CAN have multiple searchCats (if
                        // it has a productGroup with 2+ searchProducts, where 2+ of those searchProducts sit under different searchCats). Unlikely
                        // though this is, we will still work around it by sorting by brand.id + '-' + searchCat.id + '-' + recId

                        // Sum up rec scores to brand/cat grain, start by ordering by brand/cat/rec id
                        gvBrandData.sort(compare_brandData_recGrainSort);

                        lvFirstOfSet = 0;
                        lvAggScores = {};
                        for(var k = 1; k < gvBrandData.length; k++){

                            // For the first in each set of repeating brand/cat combos, start by adding the first row's scores to the cumulative total
                            if(k === lvFirstOfSet+1) {
                                lvAggScores[gvBrandData[lvFirstOfSet].id] = {
                                    brandCat_RatingScore:   gvBrandData[lvFirstOfSet].brandCat_RatingScore   + gvBrandData[k-1].ratingScore,
                                    brandCat_ClickCountSum: gvBrandData[lvFirstOfSet].brandCat_ClickCountSum + gvBrandData[k-1].clickCountSum,
                                    brandCat_aggScore:      0
                                };
                            }

                            // If we're looking at the same brand/cat combo as the previous row, and if
                            // the rec isn't the same (i.e. we don't want to double count repeated recs)
                            // then add the current row to the cumulative total
                            if(gvBrandData[k].id === gvBrandData[k-1].id) {
                                if (gvBrandData[k].recId !== gvBrandData[k-1].recId) {
                                    lvAggScores[gvBrandData[lvFirstOfSet].id].brandCat_RatingScore   += gvBrandData[k].ratingScore;
                                    lvAggScores[gvBrandData[lvFirstOfSet].id].brandCat_ClickCountSum += gvBrandData[k].clickCountSum;
                                }
                            } else {
                                // multiply the extension stats (clickCount and ratings) by 2 if it's a Balu favourite, and add on the filter hit count
                                lvAggScores[gvBrandData[lvFirstOfSet].id].brandCat_aggScore = gvBrandData[lvFirstOfSet].categoryHitCount + ((lvAggScores[gvBrandData[lvFirstOfSet].id].brandCat_ClickCountSum + lvAggScores[gvBrandData[lvFirstOfSet].id].brandCat_RatingScore) * gvBrandData[lvFirstOfSet].favouriteCount);
                                lvFirstOfSet = k;
                            }
                        }

                        for(var l = 0; l < gvBrandData.length; l++){
                            gvBrandData[l].brandCat_aggScore = lvAggScores[gvBrandData[l].id].brandCat_aggScore;
                            gvBrandData[l].brandCat_ClickCountSum = lvAggScores[gvBrandData[l].id].brandCat_ClickCountSum;
                            gvBrandData[l].brandCat_RatingScore = lvAggScores[gvBrandData[l].id].brandCat_RatingScore;
                        }
                        /* Call the prepData function, which will in turn call our callback */

                        log(gvScriptName_main + '.' + lvFunctionName + ': Passing ' + gvBrandData.length + ' scored rows to prepBrandData function',' INFO');
                        prepBrandData(pvArgs,pvCallback);

                    },
                    error: parseErrorFind
                });
            },
            error: parseErrorFind
        });
    } // if gvBrandData.length === 0
    else {
        // If we have already populated gvBrandData, then call the filter function
        // to apply any new filters, before passing back the filtered list to the callback
        log(gvScriptName_main + '.' + lvFunctionName + ': Passing ' + gvBrandData.length + ' scored rows to prepBrandData function',' INFO');
        prepBrandData(pvArgs,pvCallback);
    }
}

/*
 * filter, remove duplicates and re-sort
 */
function prepBrandData(pvArgs,pvCallback){

    var lvFunctionName = 'prepBrandData';
    log(gvScriptName_main + '.' + lvFunctionName + ': Start','PROCS');

    /* Filter (if we have a search value) */

    var lvFilteredBrandData = [];
    if(typeof pvArgs.productGroupId !== 'undefined' && pvArgs.productGroupId !== '' && pvArgs.productGroupId !== null){
        for(var i = 0; i < gvBrandData.length; i++){
            if(gvBrandData[i].productGroupId === pvArgs.productGroupId) {
                lvFilteredBrandData.push(gvBrandData[i]);
            }
        }
    } else if(typeof pvArgs.categoryId !== 'undefined' && pvArgs.categoryId !== '' && pvArgs.categoryId !== null){
        for(var j = 0; j < gvBrandData.length; j++){
            if(gvBrandData[j].categoryId === pvArgs.categoryId) {
                lvFilteredBrandData.push(gvBrandData[j]);
            }
        }
    } else {
        for(var m = 0; m < gvBrandData.length; m++){
            lvFilteredBrandData.push(gvBrandData[m]);
        }
    }

    log(gvScriptName_main + '.' + lvFunctionName + ': After filtering, we\'re left with ' + lvFilteredBrandData.length + ' rows',' INFO');

    // Then remove duplicates. This leaves the first of each set of brand/cat combos behind
    for(var x = 1; x < lvFilteredBrandData.length;){
        if(lvFilteredBrandData[x-1].id === lvFilteredBrandData[x].id){
            lvFilteredBrandData.splice(x, 1);
        } else {
            x++;
        }
    }

    log(gvScriptName_main + '.' + lvFunctionName + ': After deduping, we\'re left with ' + lvFilteredBrandData.length + ' unique rows',' INFO');

    // Finally, re-sort by the aggScore
    lvFilteredBrandData.sort(compare_brandData_brandCat_aggScore);

    pvCallback(lvFilteredBrandData);


}


/*
 * The callback must be passed the array of searchCategories
 */
function getCategories(pvArgs,pvCallback){

    var lvFunctionName = 'getCategories';
    log(gvScriptName_main + '.' + lvFunctionName + ': Start','PROCS');

    if(gvCategoriesData.length === 0) {
        /* Pull all data from Parse DB */

        var lvLimit = 1000;

        var query_searchCategory = new Parse.Query(Parse.Object.extend('SearchCategory'));

        query_searchCategory.descending('hitCount, objectId'); // objectId to give an element of randomness - will do for now (To do)
        query_searchCategory.limit(lvLimit);

        query_searchCategory.find({
            success: function(searchCategories){
                if(searchCategories.length === lvLimit) {logError('PARSE_ROW_LIMIT_ERROR',{message: gvScriptName_main + '.' + lvFunctionName + ': searchCategories count has hit query limit (' + lvLimit + ')'});}

                log(gvScriptName_main + '.' + lvFunctionName + ': Found ' + searchCategories.length + ' searchCategories',' INFO');

                for(var i = 0; i < searchCategories.length; i++){

                    gvCategoriesData.push({id:            searchCategories[i].id,
                                           categoryName:  searchCategories[i].get('categoryShortName')
                    });
                }

                /* Pass to callback */

                log(gvScriptName_main + '.' + lvFunctionName + ': Passing ' + gvCategoriesData.length + ' unique rows to callback function',' INFO');
                pvCallback(gvCategoriesData);

            },
            error: parseErrorFind
        });
    } // if gvCategoriesData.length === 0
    else {
        // If we have already populated gvCategoriesData, then pass it straight back to UI
        log(gvScriptName_main + '.' + lvFunctionName + ': Passing ' + gvCategoriesData.length + ' unique rows to callback function',' INFO');
        pvCallback(gvCategoriesData);
    }
}

/*
 * The callback must be passed the array of productGroups
 */
function getProductGroups(pvArgs,pvCallback){

    var lvFunctionName = 'getProductGroups';
    log(gvScriptName_main + '.' + lvFunctionName + ': Start','PROCS');

    if(gvProductGroupsData.length === 0){

        /* Pull all data from Parse DB */

        var lvLimit = 1000;

        var query_productGroup = new Parse.Query(Parse.Object.extend('ProductGroup'));

        query_productGroup.ascending('productGroupName');
        query_productGroup.limit(lvLimit);

        query_productGroup.find({
            success: function(productGroups){
                if(productGroups.length === lvLimit) {logError('PARSE_ROW_LIMIT_ERROR',{message: gvScriptName_main + '.' + lvFunctionName + ': productGroups count has hit query limit (' + lvLimit + ')'});}

                log(gvScriptName_main + '.' + lvFunctionName + ': Found ' + productGroups.length + ' productGroups',' INFO');

                for(var i = 0; i < productGroups.length; i++){

                    // Array formatted to work with autocomplete search field
                    gvProductGroupsData.push({value:       productGroups[i].id,
                                              label:       productGroups[i].get('productGroupName'),
                                              description: productGroups[i].get('productGroupName')
                    });

                }

                /* Pass to callback */

                log(gvScriptName_main + '.' + lvFunctionName + ': Passing ' + gvProductGroupsData.length + ' unique rows to callback function',' INFO');
                pvCallback(gvProductGroupsData);

            },
            error: parseErrorFind
        });
    } // if gvProductGroupsData.length === 0
    else {
        // If we have already populated gvProductGroupsData, then pass it straight back to UI
        log(gvScriptName_main + '.' + lvFunctionName + ': Passing ' + gvProductGroupsData.length + ' unique rows to callback function',' INFO');
        pvCallback(gvProductGroupsData);
    }
}

/*
 * Whenever a user filters the results by a category, increase the count on the
 * searchCategory object by 1. Note, this is the only place this is done. The
 * ChromeExtension is unable to do this due to the way the data model separates
 * recs from searchProducts
 *
 * To do: this relies on SearchCategory being public-update
 */
function incrementSearchCategoryHitCount(pvSearchCategoryId){

    var lvFunctionName = 'incrementSearchCategoryHitCount';
    log(gvScriptName_main + '.' + lvFunctionName + ': Start','PROCS');

    var query_SearchCategory = new Parse.Query(Parse.Object.extend('SearchCategory'));
    query_SearchCategory.equalTo('objectId',pvSearchCategoryId);
    query_SearchCategory.first({
        success: function(searchCategory){
            if(typeof searchCategory.get('hitCount') === 'number'){
                searchCategory.set('hitCount',searchCategory.get('hitCount')+1);
            } else {
                searchCategory.set('hitCount',1);
            }
            searchCategory.save();
        },
        error: parseErrorGet
    });
}

/*********************
 * Utility Functions *
 *********************/


function compare_brandData_recGrainSort(a,b) {
    if (a.recGrainSort < b.recGrainSort) return -1;
    else if (a.recGrainSort > b.recGrainSort) return 1;
    else return 0;
}

function compare_brandData_brandCat_aggScore(a,b) {
    if (a.brandCat_aggScore > b.brandCat_aggScore) return -1;
    else if (a.brandCat_aggScore < b.brandCat_aggScore) return 1;
    else return 0;
}
