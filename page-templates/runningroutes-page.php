<?php
/**
 * Template Name: Running Routes
 *
 * Please note that this is the WordPress construct of pages
 * and that other 'pages' on your WordPress site will use a
 * different template.
 *
 * @package steeps
 */

get_header(); ?>

    <div id="primary" class="content-area">
        <main id="main" class="site-main runningroutes-main" role="main">

                <?php
                    /* Include the Post-Format-specific template for the content.
                     * If you want to override this in a child theme, then include a file
                     * called content-___.php (where ___ is the Post Format name) and that will be used instead.
                     */
                    get_template_part( 'content', get_post_format() );
                ?>

            <!-- assumes jquery and dataTables are included by one plugin or another
                 somehow if these are included page loses slide show
            -->
            <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/yadcf/0.9.1/jquery.dataTables.yadcf.css"/>
            <link rel="stylesheet" type="text/css" href="/wp-content/themes/steeps/js/runningroutes/runningroutes.css?v=4"/>

            <div class='external-filter filter-container'>
                <div class='filter-item'>
                    <span class='label'>Distance (miles)</span>
                    <span id='external-filter-distance' class='filter'></span>
                </div>

                <div class='filter-item'>
                    <span class='label'>Surface</span>
                    <span id='external-filter-surface' class='filter'></span>
                </div>
            </div>
            <div class='external-filter' style='display: none;'>
                <span id='external-filter-bounds-lat' class='filter'></span>
                <span id='external-filter-bounds-lng' class='filter'></span>
            </div>

            <div id='runningroutes-map'></div>

            <table id="runningroutes-table">
                <thead>
                    <tr>
                        <th>loc</th>
                        <th>name</th>
                        <th>miles</th>
                        <th>surf</th>
                        <th>elev gain</th>
                        <th></th>
                        <th>lat</th>
                        <th>lng</th>
                        <th>id</th>
                    </tr>
                </thead>
            </table>

            <script src="https://d3js.org/d3.v4.min.js"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/d3-tip/0.8.0-alpha.1/d3-tip.min.js"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/yadcf/0.9.1/jquery.dataTables.yadcf.min.js"></script>
            <script src="//maps.google.com/maps/api/js"></script>

            <!-- the next script is created locally, must be before import of runningroutes.js
                 and must include definition of var runningroutesurl = 'full url of google sheets gas app' -->
            <script src="/wp-content/themes/steeps/js/runningroutes/runningroutes-config.js?v=4"></script>

            <script src="/wp-content/themes/steeps/js/runningroutes/runningroutes.js?v=4"></script>

        </main><!-- #main -->
    </div><!-- #primary -->

<?php get_sidebar('sidebar-3');  ?>
<?php get_footer(); ?>
