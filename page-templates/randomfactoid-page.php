<?php
/*
Template Name: Random Factoid
*/
?>

<?php
    query_posts('cat=' . get_cat_id ('Steeps Factoid') . '&showposts=1&orderby=rand');
    if ( have_posts() ) {
        the_post();
        the_title();    
    }
    else {
        echo 'ERROR: no posts found in "Steeps Factoid" category';
    }
?>
