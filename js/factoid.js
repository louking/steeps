/**
 * factoid.js
 *
 * Updates random factoid in home page
 */

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

jQuery(document).ready(function($){
    var factoids = [];

    // crossfade in some new text unless there's only one factoid
    function factoid_crossfade() {
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
                $(this).html($newtext).fadeIn();
            });
        }
    }
    
    // start with no factoid
    $("#steeps-factoid-fact").text('');

    // load categories to determine 'steeps-factoid' category number
    // then load posts from steeps-factoids and store title renderings in factoids array
    $.getJSON( '/wp-json/wp/v2/categories', function( data ) {
        // data contains array of category objects
        var category = undefined;

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
            $.getJSON( '/wp-json/wp/v2/posts?per_page=100&categories=' + category, function( data ) {
                // collect title renderings from steeps-factoid posts
                for (var i=0; i<data.length; i++) {
                    thisfactoid = data[i];
                    factoids.push( thisfactoid.title.rendered );
                };

                // if we found some steeps-factoids, start rendering them
                if ( factoids.length>0 ) {
                    factoid_crossfade();
                    setInterval( factoid_crossfade, 6000 );

                // didn't find any posts in steeps-factoid categories
                } else {
                    $("#steeps-factoid-fact").text('sorry, no posts found in steeps-factoid category');
                }
            });

        // didn't find steeps-factoid category
        } else {
            $("#steeps-factoid-fact").text('sorry, no steeps-factoid category found');
        }
    });
});

