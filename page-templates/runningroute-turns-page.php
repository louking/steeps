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
    $configmtime  = filemtime("wp-content/themes/steeps/js/runningroutes/runningroutes-config.js");
    $cssmtime     = filemtime("wp-content/themes/steeps/js/runningroutes/runningroute-turns.css");
    $jsmtime      = filemtime("wp-content/themes/steeps/js/runningroutes/runningroute-turns.js");
    $utilsmtime   = filemtime("wp-content/themes/steeps/js/utils.js");
?>

<link rel="stylesheet" type="text/css" href="https://code.jquery.com/ui/1.12.1/themes/smoothness/jquery-ui.min.css" />
<link rel="stylesheet" type="text/css" href="/wp-content/themes/steeps/js/runningroutes/runningroute-turns.css?v=<?= $cssmtime ?>" />

<div id="turn-title"></div>

<?php
/**
 * icons from https://materialdesignicons.com/
 */
?>
<div class="descr-block">
    <span id="turn-widgets" style="float:left;">
        <svg id=turn-bulleted-widget style="width:24px;height:24px;cursor:pointer;" viewBox="0 0 24 24" onclick="togglebullets()">
            <g>
                <title>toggle bullets</title>
                <path fill="#000000" d="M7,5H21V7H7V5M7,13V11H21V13H7M4,4.5A1.5,1.5 0 0,1 5.5,6A1.5,1.5 0 0,1 4,7.5A1.5,1.5 0 0,1 2.5,6A1.5,1.5 0 0,1 4,4.5M4,10.5A1.5,1.5 0 0,1 5.5,12A1.5,1.5 0 0,1 4,13.5A1.5,1.5 0 0,1 2.5,12A1.5,1.5 0 0,1 4,10.5M7,19V17H21V19H7M4,16.5A1.5,1.5 0 0,1 5.5,18A1.5,1.5 0 0,1 4,19.5A1.5,1.5 0 0,1 2.5,18A1.5,1.5 0 0,1 4,16.5Z" />
            </g>
        </svg>

        <svg id=turn-highlight-widget style="width:24px;height:24px;cursor:pointer;" viewBox="0 0 24 24" onclick="togglehighlighted()">
            <g>
                <title>toggle highlighting</title>
                <path fill="#000000" d="M3,3H21V5H3V3M7,7H17V9H7V7M3,11H21V13H3V11M7,15H17V17H7V15M3,19H21V21H3V19Z" />
            </g>
        </svg>

        <svg id=turn-grid-widget style="width:24px;height:24px;cursor:pointer;" viewBox="0 0 24 24" onclick="togglegrid()">
            <g>
                <title>set grid</title>
                <path fill="#000000" d="M10,4V8H14V4H10M16,4V8H20V4H16M16,10V14H20V10H16M16,16V20H20V16H16M14,20V16H10V20H14M8,20V16H4V20H8M8,14V10H4V14H8M8,8V4H4V8H8M10,14H14V10H10V14M4,2H20A2,2 0 0,1 22,4V20A2,2 0 0,1 20,22H4C2.92,22 2,21.1 2,20V4A2,2 0 0,1 4,2Z" />
            </g>
        </svg>
        
        <div id="grid-dialog"></div>
    </span>
    <span id="route-link" style="float: right;"></span>
</div>
<div style="clear: both;"></div>


<div id="progress-bar"><div class="progress-label">Loading...</div></div>
<div id="turn-table"></div>


<script src="https://code.jquery.com/jquery-3.2.1.min.js" integrity="sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4=" crossorigin="anonymous"></script>
<script src="https://code.jquery.com/ui/1.12.1/jquery-ui.min.js" integrity="sha256-VazP97ZCwtekAsvgPBSUwPFKdrwD3unUfSGVYrahUqU=" crossorigin="anonymous"></script>

<!-- the next script is created locally, must be before import of runningroute-turns.js
     and must include definition of var runningroutesurl = 'full url of google sheets gas app' -->
<script src="/wp-content/themes/steeps/js/runningroutes/runningroutes-config.js?v=<?= $configmtime ?>"></script>
<script src="/wp-content/themes/steeps/js/utils.js?v=<?= $utilsmtime ?>"></script>
<script src="/wp-content/themes/steeps/js/runningroutes/runningroute-turns.js?v=<?= $jsmtime ?>" ></script>
