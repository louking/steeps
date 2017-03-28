<?php
/**
 * The template for displaying the footer.
 *
 * Contains the closing of the #content div and all content after
 *
 * @package steeps
 */
?>

	</div><!-- #content -->

	<footer id="colophon" class="site-footer" role="contentinfo">
		<div class="site-info">
			<table>
				<tr>
					<td>Frederick Steeplechasers Running Club<br />
					P.O. Box 681<br />
					Frederick, MD 21705-0681
					</td>
					<td style="text-align: center">FSRC is a 501(c)3 non-profit member<br>
					club of the Road Runner Clubs of America,<br>
					supporting the running community<br>
					of Frederick, Maryland since 1975.</td>
					<td><a href="<?php echo get_site_url(); ?>/about/contact-us/">Contact Us</a></td>
					<td><a href="about/terms-of-use">Terms of Use</a></td>
					<td><a href="about/site-map">Site Map</a></td>
					<td><a href="http://www.rrca.org/" target="_blank"><img src="<?php echo get_site_url(); ?>/wp-content/uploads/2014/12/RRCA_Website_Icon.jpg"></a></td>
				</tr>
			</table>
		</div><!-- .site-info -->
	</footer><!-- #colophon -->
</div><!-- #page -->
</div><!-- #background -->

<?php if (parse_url(get_site_url(), PHP_URL_HOST) != "steeplechasers.org") { ?>
    <style>
        .site {background: gold;}
    </style>
<?php } ?>

<?php wp_footer(); ?>

</body>
</html>
