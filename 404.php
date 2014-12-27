<?php
/**
 * The template for displaying 404 pages (not found).
 *
 * @package steeps
 */

get_header(); ?>

	<div id="primary" class="content-area">
		<main id="main" class="site-main" role="main">

			<section class="error-404 not-found">
				<header class="page-header">
					<h1 class="page-title"><?php _e( 'Oops! That page can&rsquo;t be found.', 'steeps' ); ?></h1>
				</header><!-- .page-header -->

				<div class="page-content">
					
					<?php if ($_SERVER["REQUEST_URI"] === '/racecalendar.html') { ?>
						<p>Race calendar is now called Events, please click on <a href="<?php echo get_site_url(); ?>/events/"><?php echo get_site_url(); ?>/events/</a> and bookmark the new page.
					
					<?php } elseif ($_SERVER["REQUEST_URI"] === '/competition.html') { ?>
						<p>Competition has moved, please click on <a href="<?php echo get_site_url(); ?>/competition/"><?php echo get_site_url(); ?>/competition/</a> and bookmark the new page.
					
					<?php } elseif ($_SERVER["REQUEST_URI"] === '/current_results.html') { ?>
						<p>Current Results has moved, please click on <a href="<?php echo get_site_url(); ?>/competition/current-results/"><?php echo get_site_url(); ?>/competition/current-results/</a> and bookmark the new page.
					
					<?php } elseif ($_SERVER["REQUEST_URI"] === '/membership.html') { ?>
						<p>Membership has moved, please click on <a href="<?php echo get_site_url(); ?>/membership/"><?php echo get_site_url(); ?>/membership/</a> and bookmark the new page.
					
					<?php } else  { ?>
						<p><?php _e( 'It looks like nothing was found at this location. Maybe try one of the links below or a search?', 'steeps' ); ?></p>
					
					<?php } ?>

					<?php get_search_form(); ?>

					<?php the_widget( 'WP_Widget_Recent_Posts' ); ?>

					<?php if ( steeps_categorized_blog() ) : // Only show the widget if site has multiple categories. ?>
					<div class="widget widget_categories">
						<h2 class="widget-title"><?php _e( 'Most Used Categories', 'steeps' ); ?></h2>
						<ul>
						<?php
							wp_list_categories( array(
								'orderby'    => 'count',
								'order'      => 'DESC',
								'show_count' => 1,
								'title_li'   => '',
								'number'     => 10,
							) );
						?>
						</ul>
					</div><!-- .widget -->
					<?php endif; ?>

					<?php
						/* translators: %1$s: smiley */
						$archive_content = '<p>' . sprintf( __( 'Try looking in the monthly archives. %1$s', 'steeps' ), convert_smilies( ':)' ) ) . '</p>';
						the_widget( 'WP_Widget_Archives', 'dropdown=1', "after_title=</h2>$archive_content" );
					?>

					<?php the_widget( 'WP_Widget_Tag_Cloud' ); ?>

				</div><!-- .page-content -->
			</section><!-- .error-404 -->

		</main><!-- #main -->
	</div><!-- #primary -->

<?php get_footer(); ?>
