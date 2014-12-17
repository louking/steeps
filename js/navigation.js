/**
 * navigation.js
 *
 * Handles toggling the navigation menu for small screens.
 */
( function() {
	var container, button, menu;

	container = document.getElementById( 'site-navigation' );
	if ( ! container ) {
		return;
	}

	button = container.getElementsByTagName( 'button' )[0];
	if ( 'undefined' === typeof button ) {
		return;
	}

	menu = container.getElementsByTagName( 'ul' )[0];

	// Hide menu toggle button if menu is empty and return early.
	if ( 'undefined' === typeof menu ) {
		button.style.display = 'none';
		return;
	}

	menu.setAttribute( 'aria-expanded', 'false' );

	if ( -1 === menu.className.indexOf( 'nav-menu' ) ) {
		menu.className += ' nav-menu';
	}

	button.onclick = function() {
		if ( -1 !== container.className.indexOf( 'toggled' ) ) {
			container.className = container.className.replace( ' toggled', '' );
			button.setAttribute( 'aria-expanded', 'false' );
			menu.setAttribute( 'aria-expanded', 'false' );
		} else {
			container.className += ' toggled';
			button.setAttribute( 'aria-expanded', 'true' );
			menu.setAttribute( 'aria-expanded', 'true' );
		}
	};
	
	// Fix child menus for touch devices.
	function fixMenuTouchTaps( container ) {
		var touchStartFn,
		    parentLink = container.querySelectorAll( '.menu-item-has-children > a, .page_item_has_children > a' );

		if ( 'ontouchstart' in window ) {
			touchStartFn = function( e ) {
				var menuItem = this.parentNode;

				if ( ! menuItem.classList.contains( 'focus' ) ) {
					e.preventDefault();
					for( var i = 0; i < menuItem.parentNode.children.length; ++i ) {
						if ( menuItem === menuItem.parentNode.children[i] ) {
							continue;
						}
						menuItem.parentNode.children[i].classList.remove( 'focus' );
					}
					menuItem.classList.add( 'focus' );
				} else {
					menuItem.classList.remove( 'focus' );
				}
			};

			for ( var i = 0; i < parentLink.length; ++i ) {
				parentLink[i].addEventListener( 'touchstart', touchStartFn, false )
			}
		}
	}

	fixMenuTouchTaps( container );
} )();

jQuery(document).ready(function($){

// commented to remove menu stickiness -- this looks bad on a smartphone currently
//	// from http://stackoverflow.com/questions/14499024/fix-menu-bar-at-top-of-page-once-header-has-been-scrolled-past
//    // Check the initial Position of the Sticky Header
//    var stickyHeaderTop = $('.navigation-area').offset().top;
//    var adminheight = 0;
//	
//	// check if wordpress admin bar is present, if so add its height
//	if ( $( "#wpadminbar" ).length ) {
//		adminheight = $( "#wpadminbar" ).height()
//		stickyHeaderTop += adminheight;
//	}
//
//    $(window).scroll(function(){
//    scrollAt = $(window).scrollTop()
//    // for some reason this doesn't work unless scrollTop is called twice
//    if( $(window).scrollTop() > stickyHeaderTop ) {
//            $('.navigation-area').css({position: 'fixed', top: adminheight});
//    } else {
//            $('.navigation-area').css({position: 'static', top: adminheight});
//    }
//    });
    
    // *** this block of code supports navigation to an anchor, with sticky menu
    //// The function actually applying the offset
    //function offsetAnchor(delta) {
    //    if(location.hash.length !== 0) {
    //        //console.log('found hash ' + window.scrollX + ',' + window.scrollY);
    //        adminheight = 0;
    //        if ( jQuery('#wpadminbar').length ) {
    //            adminheight = jQuery('#wpadminbar').height();
    //        }
    //        addlscroll = jQuery('#site-navigation').height() + jQuery('.breadcrumbs').height() + adminheight + 30 + delta;
    //        //console.log('addlscroll = ' + addlscroll);
    //        var thisScrollY = jQuery(window).scrollTop() - addlscroll;
    //        //var thisScrollY = jQuery(window).scrollTop() - 100 + delta;
    //
    //        jQuery(window).scrollTop(thisScrollY);
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
    //    offsetAnchor(50);
    //}, 30); // The delay of 1 is arbitrary and may not always work right (although it did in my testing).
});

