<?php
/**
 * Template Name: Running Route
 *
 * Please note that this is the WordPress construct of pages
 * and that other 'pages' on your WordPress site will use a
 * different template.
 *
 * @package steeps
 */

?>

<?php
/**
 * redirect to routes.loutilities.com route
 */
?>
<script>
    var args = window.location.href.split('?')[1];
    window.location.replace('https://routes.loutilities.com/route/0?' + args);
</script>