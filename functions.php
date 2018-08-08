<?php
/**
 * steeps functions and definitions
 *
 * @package steeps
 */

/**
 * Detect plugin. For use on Front End only. See https://codex.wordpress.org/Function_Reference/is_plugin_active
 */
include_once( ABSPATH . 'wp-admin/includes/plugin.php' );

/**
 * Set the content width based on the theme's design and stylesheet.
 */
if ( ! isset( $content_width ) ) {
	$content_width = 640; /* pixels */
}

if ( ! function_exists( 'steeps_setup' ) ) :
/**
 * Sets up theme defaults and registers support for various WordPress features.
 *
 * Note that this function is hooked into the after_setup_theme hook, which
 * runs before the init hook. The init hook is too late for some features, such
 * as indicating support for post thumbnails.
 */
function steeps_setup() {

	/*
	 * Make theme available for translation.
	 * Translations can be filed in the /languages/ directory.
	 * If you're building a theme based on steeps, use a find and replace
	 * to change 'steeps' to the name of your theme in all the template files
	 */
	load_theme_textdomain( 'steeps', get_template_directory() . '/languages' );

	// Add default posts and comments RSS feed links to head.
	add_theme_support( 'automatic-feed-links' );

	/*
	 * Enable support for Post Thumbnails on posts and pages.
	 *
	 * @link http://codex.wordpress.org/Function_Reference/add_theme_support#Post_Thumbnails
	 */
	//add_theme_support( 'post-thumbnails' );

	// This theme uses wp_nav_menu() in one location.
	register_nav_menus( array(
		'primary' => __( 'Primary Menu', 'steeps' ),
	) );

	/*
	 * Switch default core markup for search form, comment form, and comments
	 * to output valid HTML5.
	 */
	add_theme_support( 'html5', array(
		'search-form', 'comment-form', 'comment-list', 'gallery', 'caption',
	) );

	/*
	 * Enable support for Post Formats.
	 * See http://codex.wordpress.org/Post_Formats
	 */
	add_theme_support( 'post-formats', array(
		'aside', 'image', 'video', 'quote', 'link',
	) );

	// Set up the WordPress core custom background feature.
	add_theme_support( 'custom-background', apply_filters( 'steeps_custom_background_args', array(
		'default-color' => 'ffffff',
		'default-image' => '',
	) ) );
	
	// Added to extend allowed files types in Media upload 
	add_filter('upload_mimes', 'custom_upload_mimes'); 
	function custom_upload_mimes ( $existing_mimes=array() ) {
	    
		// Add *.EPS files to Media upload 
		$existing_mimes['eps'] = 'application/postscript'; 
		
		// Add *.AI files to Media upload 
		$existing_mimes['ai'] = 'application/postscript'; 
		
		return $existing_mimes; 
	}

}
endif; // steeps_setup
add_action( 'after_setup_theme', 'steeps_setup' );

/**
 * Register widget area.
 *
 * @link http://codex.wordpress.org/Function_Reference/register_sidebar
 */
function steeps_widgets_init() {
	register_sidebar( array(
		'name'          => __( 'Sidebar', 'steeps' ),
		'id'            => 'sidebar-1',
		'description'   => 'Sidebar for home page',
		'before_widget' => '<aside id="%1$s" class="widget %2$s">',
		'after_widget'  => '</aside>',
		'before_title'  => '<h1 class="widget-title">',
		'after_title'   => '</h1>',
	) );
	register_sidebar( array(
		'name'          => __( 'Newsletters Sidebar', 'steeps' ),
		'id'            => 'sidebar-2',
		'description'   => 'Sidebar for newsletters page',
		'before_widget' => '<aside id="%1$s" class="widget %2$s">',
		'after_widget'  => '</aside>',
		'before_title'  => '<h1 class="widget-title">',
		'after_title'   => '</h1>',
	) );
	register_sidebar( array(
		'name'          => __( 'Subpage Buttons Sidebar', 'steeps' ),
		'id'            => 'sidebar-3',
		'description'   => 'Sidebar for pages other than home and newsletters pages',
		'before_widget' => '<aside id="%1$s" class="widget %2$s">',
		'after_widget'  => '</aside>',
		'before_title'  => '<h1 class="widget-title">',
		'after_title'   => '</h1>',
	) );
}
add_action( 'widgets_init', 'steeps_widgets_init' );

/**
 * Enqueue scripts and styles.
 */
function steeps_enqueue_script ( $handle, $src, $deps=array(), $in_footer=false ) {
	// use file modified time as version to bust cache
	wp_enqueue_script( $handle, get_template_directory_uri() . $src, $deps, filemtime(get_template_directory() . $src), $in_footer );
}

function steeps_scripts() {
	$stylesheet = get_stylesheet_directory() . '/style.css';
	wp_enqueue_style( 'steeps-style', get_stylesheet_uri(), array(), filemtime($stylesheet) );

	steeps_enqueue_script( 'steeps-navigation', '/js/navigation.js', array(), true );

	steeps_enqueue_script( 'steeps-factoid-fader', '/js/factoid.js', array(), true );

	steeps_enqueue_script( 'steeps-skip-link-focus-fix', '/js/skip-link-focus-fix.js', array(), true );

	if ( is_singular() && comments_open() && get_option( 'thread_comments' ) ) {
		wp_enqueue_script( 'comment-reply' );
	}
	
	/* uses php-browser-detection plugin, if available */
	if ( is_callable('get_browser_version') && is_ie() && get_browser_version() < 9) {
		steeps_enqueue_script ( 'selectivizr', '/js/selectivizr-min.js', array(), false);
		steeps_enqueue_script ( 'html5shiv', '/js/html5shiv-printshiv.js', array(), false);
	}
}
add_action( 'wp_enqueue_scripts', 'steeps_scripts' );

/* 
** enable Feature Images and Post Thumbnails 
** see https://developer.wordpress.org/themes/functionality/featured-images-post-thumbnails/
*/
add_theme_support( 'post-thumbnails' );
add_image_size( 'steeps-featured-image', 1000, 600, false );			/* don't crop */
add_image_size( 'steeps-featured-image-thumbnail', 200, 200, true );	/* crop */

/* custom functions related to thumbnails */
function steeps_archive_single_class() {
	if ( is_archive() ) {
		return 'steeps-archive';
	} else {
		return 'steeps-single';
	}
}

function steeps_image_size() {
	if ( is_archive() ) {
		return 'steeps-featured-image-thumbnail';
	} else {
		return 'steeps-featured-image';
	}
}

/**
 * Implement the Custom Header feature.
 */
require get_template_directory() . '/inc/custom-header.php';

/**
 * Custom template tags for this theme.
 */
require get_template_directory() . '/inc/template-tags.php';

/**
 * Custom functions that act independently of the theme templates.
 */
require get_template_directory() . '/inc/extras.php';

/**
 * Customizer additions.
 */
require get_template_directory() . '/inc/customizer.php';

/**
 * Load Jetpack compatibility file.
 */
require get_template_directory() . '/inc/jetpack.php';

/**
* shortcodes
*/

function steepscomment_shortcode($atts) {
	return '';
}
add_shortcode('steepscomment', 'steepscomment_shortcode');

/**
 * woocommerce support
**/

/* tell woocommerce how we wrap content for steeps theme pages */
remove_action( 'woocommerce_before_main_content', 'woocommerce_output_content_wrapper', 10);
remove_action( 'woocommerce_after_main_content', 'woocommerce_output_content_wrapper_end', 10);
add_action('woocommerce_before_main_content', 'steeps_wc_wrapper_start', 10);
add_action('woocommerce_after_main_content', 'steeps_wc_wrapper_end', 10);
function steeps_wc_wrapper_start() {
  echo '	<div id="primary" class="content-area">';
  echo '		<main id="main" class="site-main woocommerce-wrapper" role="main">';
}
function steeps_wc_wrapper_end() {
  echo '		</main><!-- #main -->';
  echo '	</div><!-- #primary -->';
}

/* remove steeps sidebar from woocommerce pages */
remove_action ( 'woocommerce_sidebar', 'woocommerce_get_sidebar', 10 );
add_action ('woocommerce_sidebar', 'steeps_woocommerce_sidebar', 10 );
function steeps_woocommerce_sidebar() {
	/* nothing to see here -- i.e., kill the standard sidebar */
	echo '';
};

/* remove woocommerce breadcrumb */
add_action( 'init', 'steeps_remove_wc_breadcrumbs' );
function steeps_remove_wc_breadcrumbs() {
    remove_action( 'woocommerce_before_main_content', 'woocommerce_breadcrumb', 20, 0 );
}

/* tell woocommerce it is supported, so there are no complaints */
add_action( 'after_setup_theme', 'woocommerce_support' );
function woocommerce_support() {
    add_theme_support( 'woocommerce' );
}

/**
 * Special processing to avoid conflicts between Toggle wpautop and The Events Calendar Community Events.
 * An alternate solution would be to make this occur first and update_post_meta( $post_id, '_lp_disable_wpautop', 1 ) 
 * but that is a bit less direct. However this assumes understanding of Toggle wpautop internals.
 */
if ( is_plugin_active('toggle-wpautop/toggle-wpautop.php') 
		&& is_plugin_active('the-events-calendar-community-events/tribe-community-events.php') ) {
	if ( ! function_exists( 'steeps_the_post' ) ) :
	function steeps_the_post( $post ) {
		// remove wpautop for tribe community events
		// without this extra <p> tags are generated in these pages by Toggle wpautop plugin, causing javascript errors
		if ( tribe_is_community_edit_event_page() || tribe_is_community_my_events_page() ) {
			remove_filter( 'the_content', 'wpautop' );
			remove_filter( 'the_excerpt', 'wpautop' );
		}
	}
	endif; // steeps_the_post
	add_action( 'the_post', 'steeps_the_post', 11 );	// needs to be higher priority than the_post in LP_Toggle_wpautop.__construct
}

/**
 * Unregisters the Google Maps API script on Events Calendar PRO.
 */
if ( is_plugin_active('events-calendar-pro/events-calendar-pro.php') ) {
	add_action( 'wp_print_scripts', 'ecp_remove_google_maps_api', 100 );

	function ecp_remove_google_maps_api() {
		wp_deregister_script( 'tribe-gmaps' );
	}
}

/**
 * For The Events Calendar: Community Events, on the event page, check for some special conditions. This is
 * being done to control display of "before html" content
 */
if ( is_plugin_active('the-events-calendar-community-events/tribe-community-events.php') ) {
	$ce_event_class = 'steeps-ce-class-unknown';

	// adapted from Tribe__Events__Community__Main.get_submitted_event (Main.php)
	function steeps_get_submitted_event() {
		if ( empty( $_POST[ 'community-event' ] ) ) {
			return array();
		}

		if ( ! check_admin_referer( 'ecp_event_submission' ) ) {
			return array();
		}
		$submission = $_POST;

		return $submission;
	}

	// adapted from Tribe__Events__Community__Main.doEventForm (Main.php)
	// this action is invoked before community/edit processing
	function steeps_ce_determine_class_edit ( $id ) {
		global $ce_event_class;

		if ( $id ) {
			$tribe_event_id = $id = intval( $id );
		} else {
			$tribe_event_id = null;
		}
		if ( $tribe_event_id ) {
			$event = get_post( intval( $tribe_event_id ) );
		}
		// special class if logged out
		// NOTE: assumes allow anonymous submissions configured as false
		if ( ! is_user_logged_in() ) {
			$ce_event_class = 'steeps-ce-class-logged-out';
		
		// logged in
		} else {
			$submission = steeps_get_submitted_event();
			if (! empty( $submission )) {
				$ce_event_class = 'steeps-ce-class-submitted';
			} else {
				$ce_event_class = 'steeps-ce-class-empty-form';
			}
		}
	}
	add_action( 'tribe_community_before_event_page', 'steeps_ce_determine_class_edit', 11 );

	// adapted from Tribe__Events__Community__Main.doMyEvents (Main.php)
	// this action is invoked before community/list processing
	function steeps_ce_determine_class_list ( ) {
		global $ce_event_class;

		// special class if logged out
		if ( ! is_user_logged_in() ) {
			$ce_event_class = 'steeps-ce-class-logged-out';
		
		// logged in
		} else {
			$ce_event_class = 'steeps-ce-class-list';			
		}
	}
	add_action( 'tribe_ce_before_event_list_page', 'steeps_ce_determine_class_list', 11 );

	function steeps_before_html ( $html ) {
		global $ce_event_class;
		return '<div class="steeps-events ' . $ce_event_class . '">' . $html;
	}
	add_filter( 'tribe_events_before_html', 'steeps_before_html' );

	// after html is noop for now
	function steeps_after_html( $html ) {
		return $html . '</div><!-- .steeps-events -->';
	}
	add_filter( 'tribe_events_after_html', 'steeps_after_html' );

    // allow all users to be in post author dropdown. This is specifically for
    // events to assign events to specific users with subscriber role
    // see https://wordpress.stackexchange.com/questions/50827/select-subscriber-as-author-of-post-in-admin-panel
    // and https://developer.wordpress.org/reference/hooks/wp_dropdown_users_args/#user-contributed-notes
    function add_subscribers_to_dropdown( $query_args, $r ) {
     
        $query_args['who'] = '';
        return $query_args;
     
    }
    add_filter( 'wp_dropdown_users_args', 'add_subscribers_to_dropdown', 10, 2 );
}

add_action('tribe_community_after_login_form', 'steeps_tribe_register_button', 10, 2 );

function steeps_tribe_register_button() {
   wp_register( '<div class="button button-primary steeps-tribe-button">', '</div>', true );  
} 