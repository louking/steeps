<?php
/**
 * Template Name: Newsletter Template
 *
 * Please note that this is the WordPress construct of pages
 * and that other 'pages' on your WordPress site will use a
 * different template.
 *
 * @package steeps
 */

get_header(); ?>

        <?php 
            $paged = (get_query_var('paged')) ? get_query_var('paged') : 1;
            $args = array(
              'posts_per_page' => 10,
              'paged' => $paged,
              'category_name' => 'Newsletter'
            );
            
            query_posts($args);
        ?>

    <div id="primary" class="content-area">
        <main id="main" class="site-main newsletter-main" role="main">
            <h1><i>Intervals</i> Blog</h1>
            <p>Intervals Blog content comes from FSRC members. Share your club news or running-related experiences, expertise, or interests in the next edition of Intervals.</p>
            <p>Submission guidelines:</p>
            <ul>
                <li>500-word maximum</li>
                <li>Up to 2 pictures (2 MB size-limit, per image), including photo credit</li>
                <li>Send submissions to <a href="mailto:intervalsblog@steeplechasers.org" target="_blank">intervalsblog@steeplechasers.org</a></li>
                <li>Intervals is produced quarterly with deadlines for submission: March 1st, June 1st, September 1st, and December 1st.</li>
            </ul>

        <?php if ( have_posts() ) : ?>

            <?php /* Start the Loop */ ?>
            <?php while ( have_posts() ) : the_post(); ?>

                <?php
                    /* Include the Post-Format-specific template for the content.
                     * If you want to override this in a child theme, then include a file
                     * called content-___.php (where ___ is the Post Format name) and that will be used instead.
                     */
                    get_template_part( 'content', get_post_format() );
                ?>

            <?php endwhile; ?>

            <?php steeps_paging_nav(); ?>

        <?php else : ?>

            <?php get_template_part( 'content', 'none' ); ?>

        <?php endif; ?>

        </main><!-- #main -->
    </div><!-- #primary -->

<?php get_sidebar('sidebar-2'); ?>
<?php get_footer(); ?>
