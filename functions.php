<?php
/**
 * steeps functions and definitions
 *
 * @package steeps
 */

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
function steeps_scripts() {
	wp_enqueue_style( 'steeps-style', get_stylesheet_uri() );

	wp_enqueue_script( 'steeps-navigation', get_template_directory_uri() . '/js/navigation.js', array(), '20120206', true );

	wp_enqueue_script( 'steeps-factoid-fader', get_template_directory_uri() . '/js/factoid.js', array(), '20141209', true );

	wp_enqueue_script( 'steeps-skip-link-focus-fix', get_template_directory_uri() . '/js/skip-link-focus-fix.js', array(), '20130115', true );

	if ( is_singular() && comments_open() && get_option( 'thread_comments' ) ) {
		wp_enqueue_script( 'comment-reply' );
	}
	
	/* uses php-browser-detection plugin, if available */
	if ( is_callable('get_browser_version') && is_ie() && get_browser_version() < 9) {
		wp_enqueue_script ( 'selectivizr', get_template_directory_uri() . '/js/selectivizr-min.js', array(), '1.0.2', false);
		wp_enqueue_script ( 'html5shiv', get_template_directory_uri() . '/js/html5shiv-printshiv.js', array(), '3.7.2', false);
	}
}
add_action( 'wp_enqueue_scripts', 'steeps_scripts' );

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