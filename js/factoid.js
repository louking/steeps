/**
 * factoid.js
 *
 * Updates random factoid in home page
 */

jQuery(document).ready(function($){
    function factoid_crossfade() {
        var $oldtext = $("#steeps-factoid-fact").text();
        $("#steeps-factoid-temp").load("/steepsv2/random-factoid/?cachebuster=" + Math.floor(Math.random()*10001))
        var $newtext = $("#steeps-factoid-temp").text();
        if ( $oldtext != $newtext ) {
            $("#steeps-factoid-fact").fadeOut(function() {
                $(this).text($newtext).fadeIn();
            });
        }
    }
    
    if ( $("#steeps-factoid-fact").length ) {
        $("#steeps-factoid-fact").load("/steepsv2/random-factoid/?cachebuster=" + Math.floor(Math.random()*10001))
        $("#steeps-factoid-temp").load("/steepsv2/random-factoid/?cachebuster=" + Math.floor(Math.random()*10001))
        setInterval(factoid_crossfade,6000);
    }
});

