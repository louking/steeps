<?php
/**
 * Template Name: Browser Version Template
 *
 * Please note that this is the WordPress construct of pages
 * and that other 'pages' on your WordPress site will use a
 * different template.
 *
 * @package steeps
 */

get_header(); ?>

	<?php
        $browser = get_browser_name();
        $version = get_browser_version();
	?>

	<div id="primary" class="content-area">
		<main id="main" class="site-main" role="main">

            <?php echo ($browser . ' ' . $version); ?>
            
		</main><!-- #main -->
	</div><!-- #primary -->

<?php get_footer(); ?>
