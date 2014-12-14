<?php
/**
 * The main template file.
 *
 * This is the most generic template file in a WordPress theme
 * and one of the two required files for a theme (the other being style.css).
 * It is used to display a page when nothing more specific matches a query.
 * E.g., it puts together the home page when no home.php file exists.
 * Learn more: http://codex.wordpress.org/Template_Hierarchy
 *
 * @package steeps
 */

get_header(); ?>

	<div id="primary" class="content-area">
		<main id="main" class="site-main" role="main">

			<div id="quick-link-buttons" class="quick-link-buttons">
				<span class="quick-link-block">
					<a href="training"><img src="wp-content/uploads/2014/12/silhouette-train.jpg"><span class="qlb-text">Train</span></a>
				</span>
				<span class="quick-link-block">
					<a href="competition"><img src="wp-content/uploads/2014/12/silhouette-race.jpg"><span class="qlb-text">Race</span></a>
				</span>
				<span class="quick-link-block">
					<a href="membership/join"><img src="wp-content/uploads/2014/12/silhouette-join.jpg"><span class="qlb-text">Join</span></a>
				</span>
				<span class="quick-link-block">
					<a href="volunteer"><img src="wp-content/uploads/2014/12/silhouette-volunteer.jpg"><span class="qlb-text">Volunteer</span></a>
				</span>
			</div>
			
			<div class="content-title">
				<h1><a href="index.php?page_id=55">Announcements</a></h1>
			</div><!-- .content-title -->
	
			<?php
			/* Don't display Steeps Factoids (cat=7) under announcements */
			query_posts( 'cat=-7' );	

			if ( have_posts() ) : ?>
	
				<?php /* Start the Loop */ ?>
				<?php while ( have_posts() ) : the_post(); ?>
	
					<?php
						/* Include the Post-Format-specific template for the content.
						 * If you want to override this in a child theme, then include a file
						 * called content-___.php (where ___ is the Post Format name) and that will be used instead.
						 */
						get_template_part( 'content', 'excerpt' );
						//get_template_part( 'content', get_post_format() );
					?>
	
				<?php endwhile; ?>
	
				<?php steeps_paging_nav(); ?>
	
			<?php else : ?>
	
				<?php get_template_part( 'content', 'none' ); ?>
	
			<?php endif; ?>

		</main><!-- #main -->
	</div><!-- #primary -->

<?php get_sidebar('sidebar-1'); ?>
<?php get_footer(); ?>
