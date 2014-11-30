<?php
/**
 * The header for our theme.
 *
 * Displays all of the <head> section and everything up till <div id="content">
 *
 * @package steeps
 */
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?php wp_title( '|', true, 'right' ); ?></title>
<link rel="profile" href="http://gmpg.org/xfn/11">
<link rel="pingback" href="<?php bloginfo( 'pingback_url' ); ?>">

<?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>

<?php /* google analytics */ ?>
<script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-22407293-1', 'auto');
  ga('send', 'pageview');

</script>

<div id="page" class="hfeed site">
	<a class="skip-link screen-reader-text" href="#content"><?php _e( 'Skip to content', 'steeps' ); ?></a>

	<header id="masthead" class="site-header" role="banner">
		<div class="site-branding">
			<h1 class="site-title"><a href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home"><?php bloginfo( 'name' ); ?></a></h1>
			<h2 class="site-description"><?php bloginfo( 'description' ); ?></h2>
		</div>

		<?php if ( get_header_image() ) : ?>
		<a href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home">
			<img src="<?php header_image(); ?>" width="<?php echo esc_attr( get_custom_header()->width ); ?>" height="<?php echo esc_attr( get_custom_header()->height ); ?>" alt="">
		</a>
		<?php endif; // End header image check. ?>

		<div class="navigation-area">
			<div class="navigation-buttons">
				<a href="https://www.facebook.com/groups/fredericksteeplechasers/" target="_blank"><img src="<?php echo get_site_url(); ?>/wp-content/uploads/2014/11/FB_FindUsOnFacebook-114-e1417379795693.jpg"></a>
				<?php echo do_shortcode('[maxbutton name="join"]'); ?>
			</div>

			<nav id="site-navigation" class="main-navigation" role="navigation">
				<button class="menu-toggle"><?php _e( 'Primary Menu', 'steeps' ); ?></button>
				<?php wp_nav_menu( array( 'theme_location' => 'primary' ) ); ?>
			</nav><!-- #site-navigation -->
			
			<div class="navigation-breadcrumbs-separator">
			</div><!-- #navigation-breadcrumbs-separator -->
			
			<div class="breadcrumbs">
				<?php if(function_exists('bcn_display'))
				{
				    bcn_display();
				}?>
			</div><!-- #breadcrumbs -->
		</div><!-- #navigation-area -->
	</header><!-- #masthead -->

	<div id="content" class="site-content">
