<?php
/**
 * Template Name: Running Route Turns
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
 * redirect to routes.loutilities.com turns
 */
?>
<script>
    var args = window.location.href.split('?')[1];
    window.location.replace('https://routes.loutilities.com/turns/0?' + args);
</script>

