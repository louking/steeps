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

// randomly choose picture for banner
titlePic = new Array("http://www.steeplechasers.org/images/HomePage1/img001.jpg","http://www.steeplechasers.org/images/HomePage1/img002.jpg","http://www.steeplechasers.org/images/HomePage1/img003.jpg","http://www.steeplechasers.org/images/HomePage1/img004.jpg","http://www.steeplechasers.org/images/HomePage1/img005.jpg","http://www.steeplechasers.org/images/HomePage1/img006.jpg")
titlePic2 = new Array("http://www.steeplechasers.org/images/HomePage1/img007.jpg","http://www.steeplechasers.org/images/HomePage1/img008.jpg","http://www.steeplechasers.org/images/HomePage1/img009.jpg","http://www.steeplechasers.org/images/HomePage1/img010.jpg","http://www.steeplechasers.org/images/HomePage1/img011.jpg","http://www.steeplechasers.org/images/HomePage1/img012.jpg")
titlePic3 = new Array("http://www.steeplechasers.org/images/HomePage1/img013.jpg","http://www.steeplechasers.org/images/HomePage1/img014.jpg","http://www.steeplechasers.org/images/HomePage1/img015.jpg","http://www.steeplechasers.org/images/HomePage1/img016.jpg","http://www.steeplechasers.org/images/HomePage1/img017.jpg","http://www.steeplechasers.org/images/HomePage1/img018.jpg")

imgCt = titlePic.length
imgCt2 = titlePic2.length
imgCt3 = titlePic3.length

function choosePic(PicNo) {
      switch(PicNo){
        case 0:
          randomNum = Math.floor((Math.random() * imgCt));
          document.getElementById("titleImage").src = titlePic[randomNum];
          randomNum = Math.floor((Math.random() * imgCt2));
          document.getElementById("titleImage2").src = titlePic2[randomNum];
          randomNum = Math.floor((Math.random() * imgCt3));
          document.getElementById("titleImage3").src = titlePic3[randomNum];
          break;
        case 1:
          randomNum = Math.floor((Math.random() * imgCt));
          document.getElementById("titleImage").src = titlePic[randomNum];
          break;
        case 2:
          randomNum = Math.floor((Math.random() * imgCt2));
          document.getElementById("titleImage2").src = titlePic2[randomNum];
          break;
        case 3:
          randomNum = Math.floor((Math.random() * imgCt3));
          document.getElementById("titleImage3").src = titlePic3[randomNum];
          break;
        default:break;
      }
  }

setInterval('choosePic(0)',5000);

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
    
    // initialize choosePic
    choosePic(0);

    // The function actually applying the offset
    function offsetAnchor(delta) {
        if(location.hash.length !== 0) {
            //console.log('found hash ' + window.scrollX + ',' + window.scrollY);
            adminheight = 0;
            if ( jQuery('#wpadminbar').length ) {
                adminheight = jQuery('#wpadminbar').height();
            }
            addlscroll = jQuery('#site-navigation').height() + jQuery('.breadcrumbs').height() + adminheight + 10 + delta;
            //console.log('addlscroll = ' + addlscroll);
            var thisScrollY = jQuery(window).scrollTop() - addlscroll;
            //var thisScrollY = jQuery(window).scrollTop() - 100 + delta;
    
            jQuery(window).scrollTop(thisScrollY);
        }
    }
    
    // This will capture hash changes while on the page
    jQuery(window).on("hashchange", function () {
        //console.log('hashchange');
        offsetAnchor(0);
    });
    
    // This is here so that when you enter the page with a hash,
    // it can provide the offset in that case too. Having a timeout
    // seems necessary to allow the browser to jump to the anchor first.
    window.setTimeout(function() {
        //console.log('timeout')
        offsetAnchor(50);
    }, 30); // The delay of 1 is arbitrary and may not always work right (although it did in my testing).
});

