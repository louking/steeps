<?php
/**
 * The template for displaying the footer.
 *
 * Contains the closing of the #content div and all content after
 *
 * @package steeps
 */
?>

<?php 
	$home =  get_home_path();
	$homesplit = explode( '/', $home );
	// configuration is in parent of $home directory
	$configsplit = array_slice ( $homesplit, 0, sizeof($homesplit)-2 );
	$configpath = join ( '/', $configsplit );

	// get configuration for gravityscan trust id
	$config = parse_ini_file( $configpath . '/' . 'site.cfg', true );
	$gs_site = $config['gravityscan']['site'];
	$gs_trustid = $config['gravityscan']['trustid'];
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
					<td><a href="https://www.rrca.org/" target="_blank"><img src="<?php echo get_site_url(); ?>/wp-content/uploads/2014/12/RRCA_Website_Icon.jpg"></a></td>
					<td><a onclick="window.open('https://www.gravityscan.com/verify/<?php echo $gs_trustid ?>','gravityscan-verified-secure-site','width=760,height=470,left=160,top=170');return false;" href="https://www.gravityscan.com/verify/<?php echo $gs_trustid ?>" target="_blank" rel="noopener noreferrer"><img class="gs-trustbadge" src="https://badges.gravityscan.com/badges/<?php echo $gs_site ?>-<?php echo $gs_trustid ?>" alt="Website Malware Scan" width="117" height="67"></a></td>
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
