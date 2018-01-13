<?php
/**
 * Template Name: Membership Statistics
 *
 * Please note that this is the WordPress construct of pages
 * and that other 'pages' on your WordPress site will use a
 * different template.
 *
 * @package steeps
 */

get_header(); ?>
<?php 
    $cssmtime     = filemtime("wp-content/themes/steeps/js/membership-stats.css");
    $jsmtime      = filemtime("wp-content/themes/steeps/js/membership-stats.js");
?>

    <div id="primary" class="content-area">
        <main id="main" class="site-main membership-members-main" role="main">

            <?php
                // Include the Post-Format-specific template for the content.
                // If you want to override this in a child theme, then include a file
                // called content-___.php (where ___ is the Post Format name) and that will be used instead.
                get_template_part( 'content', get_post_format() );
            ?>

            <?php  
             // assumes jquery and dataTables are included by one plugin or another
             // somehow if these are included page loses slide show            
            ?>
            <div id="membership-stats">
            </div>

            <?php 
            // assumes jquery and dataTables are included by one plugin or another
            // somehow if these are included here page loses slide show
            ?>
            <script src="https://d3js.org/d3.v4.min.js"></script>
            <script src="/wp-content/themes/steeps/js/membership-stats.js?v=<?= $jsmtime ?>"></script>
            <link rel=stylesheet type=text/css href="/wp-content/themes/steeps/js/membership-stats.css?v=<?= $cssmtime ?>">

        </main><!-- #main -->
    </div><!-- #primary -->

<?php get_sidebar('sidebar-3');  ?>
<?php get_footer(); ?>
