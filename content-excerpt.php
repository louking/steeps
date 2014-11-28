<?php
/**
 * @package steeps
 */
?>

<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
	<span class="entry-header excerpt-header">
		<a href="<?php echo esc_url( get_permalink() ); ?>" rel="bookmark"><?php the_title( '<span class="entry-title">', '</span>' ); ?></a>
	</span><!-- .entry-header -->

	<span class="entry-meta">
		(<?php steeps_posted_on_excerpt(); ?>).
	</span><!-- .entry-meta -->

	<span class="entry-content excerpt-content">
		<?php echo get_the_excerpt(); ?>
		<?php
		/*
			wp_link_pages( array(
				'before' => '<div class="page-links">' . __( 'Pages:', 'steeps' ),
				'after'  => '</div>',
			) );
		*/
		?>
	</span><!-- .entry-content -->

	<footer class="entry-footer">
		<?php steeps_entry_footer(); ?>
	</footer><!-- .entry-footer -->
</article><!-- #post-## -->
