/**
 * factoid.js
 *
 * Updates random factoid in home page
 *
 * NOTE: per https://wordpress.org/support/topic/wordfence-ajaxwatcher-problem/#post-9313251
 * in wordfence > firewall must disable two checkboxes under “Monitor Background Requests for False Positives”
 */

// factoids are saved globally, jQuery is $, start page is 1, load 10 at a time
var factoids = [];          // save factoids here
var $ = jQuery;             // need to access jQuery
var page = 1;               // start with page 1, updated inside get_factoids()
var PER_PAGE = 100;         // number to retrieve per page (max allowed = 100)
var category = undefined;   // category number for steeps-factoid category

/** 
 * getRandomInt returns a random integer between the specified values. 
 * The value is no lower than min (or the next integer greater than min if min isn't an integer), 
 * and is less than (but not equal to) max.
 * from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
 */
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

// crossfade in some new text unless there's only one factoid
function factoid_crossfade() {
    // console.log( 'choosing among ' + factoids.length + ' factoids' );

    // make sure page has loaded sufficiently 
    // i.e., #steeps-factoid-fact exists and some factoids have been loaded
    if ( $("#steeps-factoid-fact").length && factoids.length > 0 ) {
        // what do we have now?
        var $oldtext = $("#steeps-factoid-fact").text();

        // pick potential next factoid
        var $newtext = factoids[getRandomInt( 0, factoids.length )];

        // force new factoid unless only one available
        while ( $oldtext == $newtext ) {
            // well if only one factoid, this isn't too much of a surprise
            if ( factoids.length == 1 ) break;

            // pick potential next factoid
            var $newtext = factoids[getRandomInt( 0, factoids.length )];
        }; 

        // crossfade in new factoid if changed
        if ( $oldtext != $newtext ) {
            $("#steeps-factoid-fact").fadeOut(function() {
                // use .html rather than .text so quoted characters get unquoted
                $(this).html($newtext).fadeIn();
            });
        }

        // do again in 6 seconds
        setTimeout( factoid_crossfade, 6000 );

    // if page not sufficiently loaded, try again in a second
    } else {
        setTimeout( factoid_crossfade, 1000 );
    }
}

// get this page of factoids
function get_factoids() {
    $.getJSON( '/wp-json/wp/v2/posts?page=' + page + '&per_page=' + PER_PAGE +'&categories=' + category )
    .done( function( data ) {
        // let author know what's happening
        // console.log('retrieved page ' + page + ' with ' + data.length + ' factoids');

        // collect title renderings from steeps-factoid posts
        for (var i=0; i<data.length; i++) {
            thisfactoid = data[i];
            factoids.push( thisfactoid.title.rendered );
        };

        // if we found some steeps-factoids, try to retrieve the next page
        // NOTE: can't loop now because of https://wordpress.org/support/topic/wordfence-ajaxwatcher-problem/#post-9313251
        // only need to ask for more if the last request was full
        if ( data.length == PER_PAGE) {
            page += 1;
            get_factoids();            
        } 
    })
    .fail(function( jqxhr, textStatus, error ) { 
        // we reached the end of the list
        // console.log('end of list detected');
    });
};

// load categories to determine 'steeps-factoid' category number
// then load posts from steeps-factoids and store title renderings in factoids array
$.getJSON( '/wp-json/wp/v2/categories', function( data ) {
    // data contains array of category objects
    // loop through categories to find 'steeps-factoid' id
    for (var i=0; i<data.length; i++) {
        thiscategory = data[i];
        if (thiscategory.slug == 'steeps-factoid') {
            category = thiscategory.id;
            break;
        }
    };

    // found the steeps-factoid category, get the posts for this category
    if ( typeof category != undefined ) {
        // per_page = 100 to get all the posts rather than looping
        // although looping might be better user experience
        get_factoids();

    // didn't find steeps-factoid category
    } else {
        // just leave default
        // $("#steeps-factoid-fact").html('sorry, no steeps-factoid category found');
    }
});

// start crossfading in new factoids as soon as possible
factoid_crossfade();