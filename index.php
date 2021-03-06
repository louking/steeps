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
					<a href="<?php echo get_site_url(); ?>/training-programs/"><img src="<?php echo get_site_url(); ?>/wp-content/uploads/2014/12/FRSC_training.png"><span class="qlb-text">Train</span></a>
				</span>
				<span class="quick-link-block">
					<a href="<?php echo get_site_url(); ?>/competition"><img src="<?php echo get_site_url(); ?>/wp-content/uploads/2014/12/FRSC_runners.png"><span class="qlb-text">Race</span></a>
				</span>
				<span class="quick-link-block">
					<a href="<?php echo get_site_url(); ?>/membership/join"><img src="<?php echo get_site_url(); ?>/wp-content/uploads/2014/12/FRSC_Join.png"><span class="qlb-text">Join</span></a>
				</span>
				<span class="quick-link-block">
					<a href="<?php echo get_site_url(); ?>/volunteer"><img src="<?php echo get_site_url(); ?>/wp-content/uploads/2014/12/FRSC_volunteer.png"><span class="qlb-text">Volunteer</span></a>
				</span>
			</div>
			
			<div class="content-title">
				<h1><a href="category/announcement">Announcements</a></h1>
			</div><!-- .content-title -->
	
			<?php
			/* Only display announcement category, allow paging */
			$paged = (get_query_var('paged')) ? get_query_var('paged') : 1;
			$args = array(
				'paged' => $paged,
				/* make this match templates/full-text-page.php */
		        'category_name' => 'Announcement'
			);
			query_posts( $args );

			if ( have_posts() ) : ?>
	
				<?php /* Start the Loop */ ?>
				<?php while ( have_posts() ) : the_post(); ?>
	
					<?php
						/* Include the Post-Format-specific template for the content.
						 * If you want to override this in a child theme, then include a file
						 * called content-___.php (where ___ is the Post Format name) and that will be used instead.
						 */
						//get_template_part( 'content', 'excerpt' );
						get_template_part( 'content', get_post_format() );
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
