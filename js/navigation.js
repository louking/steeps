/**
 * navigation.js
 *
 * Handles toggling the navigation menu for small screens.
 */
( function() {
	var container, button, menu;

	container = document.getElementById( 'site-navigation' );
	if ( ! container )
		return;

	button = container.getElementsByTagName( 'button' )[0];
	if ( 'undefined' === typeof button )
		return;

	menu = container.getElementsByTagName( 'ul' )[0];

	// Hide menu toggle button if menu is empty and return early.
	if ( 'undefined' === typeof menu ) {
		button.style.display = 'none';
		return;
	}

	if ( -1 === menu.className.indexOf( 'nav-menu' ) )
		menu.className += ' nav-menu';

	button.onclick = function() {
        if ( -1 !== container.className.indexOf( 'toggled' ) )
            container.className = container.className.replace( ' toggled', '' );
        else
            container.className += ' toggled';
    };
} )();

jQuery(document).ready(function($){
	// from http://stackoverflow.com/questions/14499024/fix-menu-bar-at-top-of-page-once-header-has-been-scrolled-past
        // Check the initial Position of the Sticky Header
        var stickyHeaderTop = $('.navigation-area').offset().top;
	var adminheight = 0;
	
	// check if wordpress admin bar is present, if so add its height
	if ( $( "#wpadminbar" ).length ) {
		adminheight = $( "#wpadminbar" ).height()
		stickyHeaderTop += adminheight;
	}

    $(window).scroll(function(){
    scrollAt = $(window).scrollTop()
    // for some reason this doesn't work unless scrollTop is called twice
    if( $(window).scrollTop() > stickyHeaderTop ) {
            $('.navigation-area').css({position: 'fixed', top: adminheight});
    } else {
            $('.navigation-area').css({position: 'static', top: adminheight});
    }
    });
});

//// The function actually applying the offset
//function offsetAnchor(delta) {
//    if(location.hash.length !== 0) {
//		//console.log('found hash ' + window.scrollX + ',' + window.scrollY);
//        var thisScrollY = window.scrollY - 100 + delta;
//
//        window.scrollTo(window.scrollX, thisScrollY);
//    }
//}
//
//// This will capture hash changes while on the page
//jQuery(window).on("hashchange", function () {
//    //console.log('hashchange');
//    offsetAnchor(0);
//});
//
//// This is here so that when you enter the page with a hash,
//// it can provide the offset in that case too. Having a timeout
//// seems necessary to allow the browser to jump to the anchor first.
//window.setTimeout(function() {
//    //console.log('timeout')
//    offsetAnchor(-36);
//}, 30); // The delay of 1 is arbitrary and may not always work right (although it did in my testing).