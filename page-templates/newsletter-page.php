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

        <?php get_template_part( 'content', 'page' ); ?>

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
