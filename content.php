<?php
/**
 * @package steeps
 */
?>

<article id="post-<?php the_ID(); ?>" <?php post_class( steeps_archive_single_class() ); ?>>
	<header class="entry-header">
		<h2 class="entry-title">
		<?php the_title( sprintf( '<a href="%s" rel="bookmark">', esc_url( get_permalink() ) ), '</a>' ); ?>

		<?php if ( 'post' == get_post_type() ) : ?>
			<?php steeps_posted_on(); ?>
		<?php endif; ?>
		</h2>
	</header><!-- .entry-header -->

	<div class="panel-wrap">
		<?php if ( has_post_thumbnail() ) : ?>
			<div class="panel-image">
				<?php the_post_thumbnail( steeps_image_size() ) ?>
			</div><!-- .panel-image -->
		<?php endif; ?>

		<div class="panel-content">
			<div class="entry-content">
				<?php
					/* translators: %s: Name of current post */
					the_content( sprintf(
						__( 'Continue reading %s <span class="meta-nav">&rarr;</span>', 'steeps' ), 
						the_title( '<span class="screen-reader-text">"', '"</span>', false )
					) );
				?>

				<?php
					wp_link_pages( array(
						'before' => '<div class="page-links">' . __( 'Pages:', 'steeps' ),
						'after'  => '</div>',
					) );
				?>
			</div><!-- .entry-content -->

			<footer class="entry-footer">
				<?php steeps_entry_footer(); ?>
			</footer><!-- .entry-footer -->

		</div><!-- .panel-content -->
	</div><!-- .panel-wrap -->
</article><!-- #post-## -->
