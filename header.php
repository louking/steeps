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

<div id="background" class="background">
<div id="page" class="hfeed site">
	<a class="skip-link screen-reader-text" href="#content"><?php _e( 'Skip to content', 'steeps' ); ?></a>

	<header id="masthead" class="site-header" role="banner">
		<div class="site-branding">
			<h1 class="site-title"><a href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home"><?php bloginfo( 'name' ); ?></a></h1>
			<h2 class="site-description"><?php bloginfo( 'description' ); ?></h2>
		</div>

		<table border="0" cellspacing="0" cellpadding="0">
		  <tr class="banner-image">
			<th colspan="1" scope="col" style="border:0px; padding: 2px"><img src="<?php echo get_site_url(); ?>/wp-content/uploads/2014/12/fsrc-logo-2014.jpg" alt="Banner" height="120"/></th>
			<th colspan="1" scope="col"><img src="http://www.steeplechasers.org/images/HomePage1/Steeps1.jpg" alt="Click to change" name="titleImage" height="120" id="titleImage" style="cursor:hand; border:0" onclick="choosePic(1)"/></th>
			<th colspan="1" scope="col"><img src="http://www.steeplechasers.org/images/HomePage1/Steeps2.jpg" alt="Click to change" name="titleImage2" height="120" id="titleImage2" style="cursor:hand; border:0" onclick="choosePic(2)"/></th>
			<th colspan="1" scope="col"><img src="http://www.steeplechasers.org/images/HomePage1/Steeps3.jpg" alt="Click to change" name="titleImage3" height="120" id="titleImage3" style="cursor:hand; border:0" onclick="choosePic(3)"/></th>
		  </tr>
		</table>

		<div class="navigation-area">
			<div class="navigation-button-area">
				<div class="navigation-buttons">
						<a href="https://www.facebook.com/groups/fredericksteeplechasers/" target="_blank"><img src="<?php echo get_site_url(); ?>/wp-content/uploads/2014/11/FB_FindUsOnFacebook-114-e1417379795693.jpg"></a>
						<?php echo do_shortcode('[maxbutton name="join"]'); ?>
				</div>
				<div class="breadcrumbs-buttons">
					<?php echo do_shortcode('[maxbutton name="race results"]'); ?>
				</div>
			</div><!-- .navigation-buttons -->

			<nav id="site-navigation" class="main-navigation" role="navigation">
				<button class="menu-toggle"><?php _e( 'Primary Menu', 'steeps' ); ?></button>
				<?php wp_nav_menu( array( 'theme_location' => 'primary' ) ); ?>
			</nav><!-- #site-navigation -->
			
			<div class="breadcrumbs">
				<?php if(function_exists('bcn_display'))
				{
				    bcn_display();
				}?>
			</div><!-- #breadcrumbs -->

		</div><!-- #navigation-area -->
	</header><!-- #masthead -->

	<div id="content" class="site-content">
