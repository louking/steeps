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
<link rel="profile" href="https://gmpg.org/xfn/11">
<link rel="pingback" href="<?php bloginfo( 'pingback_url' ); ?>">
<link rel="shortcut icon" href="/favicon.ico?" type="image/x-icon">
<link rel="icon" href="/favicon.ico?" type="image/x-icon">
    
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
  ga('require', 'displayfeatures');
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

        <div class="header-images">
            <a href="<?php echo get_site_url(); ?>/"><img class="banner-logo" src="<?php echo get_site_url(); ?>/wp-content/uploads/2015/03/FSRC3-2015-03-18-small.png" alt="Banner"/></a>
            <?php /* this doesn't work with version 1.5.3 as it includes multiple (all?) galleries
            slideshow(true, null, false, array('layout' => 'responsive',
                                            'auto' => 'true',
                                            'gallery_id' => '1',
                                            'showthumbs' => 'false',
                                            'autospeed' => '6',
                                            'orderby' => 'random',
                                            'fadespeed' => '10',
                                            'showinfo' => 'false')); */
            echo do_shortcode('[tribulant_slideshow gallery_id="1" layout="responsive" auto="true" showthumbs="false" autospeed="6" orderby="random" fadespeed="10" showinfo="false"]');
            ?>
        </div><!-- .header-images -->

        <div class="navigation-area">
            <nav id="site-navigation" class="main-navigation" role="navigation">
                <button class="menu-toggle" aria-controls="primary-menu" aria-expanded="false"><?php _e( 'Menu', 'steeps' ); ?></button>
                <?php wp_nav_menu( array( 'theme_location' => 'primary', 'menu_id' => 'primary-menu' ) ); ?>
            </nav><!-- #site-navigation -->
        </div><!-- #navigation-area -->

    	<div id="steeps-factoid">
            <span id="steeps-factoid-base">The Steeps </span><span id="steeps-factoid-fact">thank you for visiting our website!</span>
        </div>

        <?php if (!is_home()) { ?>
            <div class="breadcrumbs">
                <?php if(function_exists('bcn_display'))
                {
                    bcn_display();
                }?>
            </div><!-- #breadcrumbs -->
        <?php } ?>
    
    </header><!-- #masthead -->

    <div id="content" class="site-content">

	
