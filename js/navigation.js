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