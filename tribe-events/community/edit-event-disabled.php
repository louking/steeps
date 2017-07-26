<?php
/**
 * Event Submission Form
 * The wrapper template for the event submission form.
 *
 * Override this template in your own theme by creating a file at
 * [your-theme]/tribe-events/community/edit-event.php
 *
 * @since    3.1
 * @version  4.5
 *
 * @var int|string $tribe_event_id
 */

if ( ! defined( 'ABSPATH' ) ) {
    die( '-1' );
}

if ( ! isset( $tribe_event_id ) ) {
    $tribe_event_id = null;
}

?>

<?php tribe_get_template_part( 'community/modules/header-links' ); ?>

<?php do_action( 'tribe_events_community_form_before_template', $tribe_event_id ); ?>

<b>Add Event is currently disabled due to website maintenance. Please check back later.</b>

<?php do_action( 'tribe_events_community_form_after_template', $tribe_event_id ); ?>
