<?php
/**
 * Template Name: Running Route
 *
 * Please note that this is the WordPress construct of pages
 * and that other 'pages' on your WordPress site will use a
 * different template.
 *
 * @package steeps
 */

get_header(); ?>
<?php 
    $configmtime  = filemtime("wp-content/themes/steeps/js/runningroutes/runningroutes-config.js");
    $cssmtime     = filemtime("wp-content/themes/steeps/js/runningroutes/runningroute-route.css");
    $jsmtime      = filemtime("wp-content/themes/steeps/js/runningroutes/runningroute-route.js");
    $utilsmtime   = filemtime("wp-content/themes/steeps/js/utils.js");
?>

    <div id="primary" class="content-area">
        <main id="main" class="site-main runningroutes-main" role="main">

                <?php
                    /* Include the Post-Format-specific template for the content.
                     * If you want to override this in a child theme, then include a file
                     * called content-___.php (where ___ is the Post Format name) and that will be used instead.
                     */
                    get_template_part( 'content', get_post_format() );
                ?>

            <link rel="stylesheet" type="text/css" href="https://code.jquery.com/ui/1.12.1/themes/smoothness/jquery-ui.min.css" />
            <link rel="stylesheet" type="text/css" href="/wp-content/themes/steeps/js/runningroutes/runningroute-route.css?v=<?= $cssmtime ?>"/>

            <div id="path-title"></div>
            <div class="descr-block">
                <span id="path-descr" style="float: left;"></span>
                <span id="turns-link" style="float: right;"></span>
            </div>
            <div style="clear: both;"></div>
            
            <div id="progress-bar"><div class="progress-label">Loading...</div></div>
            <div id='runningroutes-route-map'></div>
            <div id='runningroutes-route-elev'></div>

            <script src="https://d3js.org/d3.v4.js"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/d3-tip/0.8.0-alpha.1/d3-tip.min.js"></script>
            <script src="//maps.google.com/maps/api/js"></script>
            
            <?php 
            // assumes jquery and dataTables are included by one plugin or another
            // somehow if these are included page loses slide show
            // jQuery is loaded elsewhere, but need jQuery UI
            ?>
            <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.min.js" integrity="sha256-VazP97ZCwtekAsvgPBSUwPFKdrwD3unUfSGVYrahUqU=" crossorigin="anonymous"></script>

            <?php 
            // the next script is created locally, must be before import of runningroutes-route.js
            // and must include definition of var runningroutesurl = 'full url of google sheets gas app' 
            ?>
            <script src="/wp-content/themes/steeps/js/runningroutes/runningroutes-config.js?v=<?= $configmtime ?>"></script>

            <script src="/wp-content/themes/steeps/js/utils.js?v=<?= $utilsmtime ?>"></script>
            <script src="/wp-content/themes/steeps/js/runningroutes/runningroute-route.js?v=<?= $jsmtime ?>"></script>

        </main><!-- #main -->
    </div><!-- #primary -->

<?php get_sidebar('sidebar-3');  ?>
<?php get_footer(); ?>
