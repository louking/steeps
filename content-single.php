<?php
/**
 * @package steeps
 */
?>

<article id="post-<?php the_ID(); ?>" <?php post_class( steeps_archive_single_class() ); ?>>
	<?php if ( has_post_thumbnail() ) : ?>
		<div class="panel-image">
			<?php the_post_thumbnail( steeps_image_size() ) ?>
		</div><!-- .panel-image -->
	<?php endif; ?>

	<header class="entry-header">
		<?php the_title( '<h1 class="entry-title">', '</h1>' ); ?>

		<div class="entry-meta">
			<?php steeps_posted_on(); ?>
		</div><!-- .entry-meta -->
	</header><!-- .entry-header -->

	<div class="entry-content">
		<?php the_content(); ?>
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
</article><!-- #post-## -->
