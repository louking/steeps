// map overlay: https://bl.ocks.org/mbostock/899711
// d3 v3 -> v4: https://amdevblog.wordpress.com/2016/07/20/update-d3-js-scripts-from-v3-to-v4/

var $ = jQuery;

var NORMALCIRCLESIZE = 4.5;
var HIGHLIGHTEDCIRCLESIZE = 8;

// set map div height - see https://stackoverflow.com/questions/1248081/get-the-browser-viewport-dimensions-with-javascript
// 50% of viewport
var mapheight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) * .5;
$('#runningroutes-map').height( mapheight + 'px' );

// Create the Google Map…
var map = new google.maps.Map(d3.select("#runningroutes-map").node(), {
  zoom: 9,
  center: new google.maps.LatLng(39.431206, -77.415428),
  mapTypeId: google.maps.MapTypeId.TERRAIN
});

var dtoptions = {
    // "order": [[1,'asc']],
    dom: '<"clear">lBfrtip',
    //https://script.google.com/macros/u/1/s/AKfycbw0Nh_VCqs8GghmUImVuyQVzOCCSWUpVJO_B6PgaqnoprtSO_k/exec
    ajax: {
           url: 'https://script.google.com/a/macros/steeplechasers.org/s/AKfycbw0Nh_VCqs8GghmUImVuyQVzOCCSWUpVJO_B6PgaqnoprtSO_k/exec',
           //url: 'https://script.google.com/a/macros/steeplechasers.org/s/AKfycbzGwC-QNVpj0RalO_WCSyYXsj5LHTos_xDyDUAW62Y/dev',
           dataSrc: 'features',
          },
    columns: [
        { data: 'geometry.properties.name' },
        { data: 'geometry.properties.distance' },
        { data: 'geometry.properties.surface' },
        { data: 'geometry.properties.gain', defaultContent: '' },
        { data: 'geometry.properties.links', orderable: false, defaultContent: '' },
        { data: 'geometry.properties.lat', visible: false },
        { data: 'geometry.properties.lng', visible: false },
    ],
    buttons: ['csv'],
}

$(document).ready(function() {
    var myTable = $("#runningroutes-table").DataTable(dtoptions);
  
    yadcf.init(myTable, [
          { column_number: 1, 
            filter_type: 'range_number',
            filter_container_id: 'external-filter-distance',
          },
          { column_number: 2,
            filter_container_id: 'external-filter-surface',
          },
    ]);
  
    myTable.on( 'draw.dt', function() {
        // get filtered data from datatables
        // datatables data() method extraneous information, just pull out the data
        var dtdata = myTable.rows( { search: 'applied' } ).data();
        for (var i=0, data=[]; i<dtdata.length; i++) { 
            data.push(dtdata[i]) 
        };

        // adapted from https://bl.ocks.org/mbostock/899711
        var overlay = new google.maps.OverlayView();
        
        // update row ids
        myTable.rows().every ( function (i, tblloop, rowloop) {
            var d = this.data();
            this.nodes().toJQuery().attr('rowid', d.geometry.properties.id)
        });

        // handle mouseover events for table rows
        $("tr").not(':first').mouseenter(function(){
            // highlight table
            $( this ).css("background-color", "yellow");

            // find all interesting elements
            var thisid = $( this ).attr('rowid');
            var circle = $("#route-circle-" + thisid);
            var svg = circle.parent();
            var routes = svg.parent();

            // highlight the circle
            circle.attr("r", HIGHLIGHTEDCIRCLESIZE);

            // bring containing svg to top - see https://stackoverflow.com/questions/14120232/svg-elements-overlapping-issue
            routes.append(svg);

        });

        // handle mouseover events for table rows
        $("tr").not(':first').mouseleave(function(){
            // unhighlight table
            $( this ).css("background-color", "");
            
            // find interesting elements
            var thisid = $( this ).attr('rowid');
            var circle = $("#route-circle-" + thisid);

            // unhighlight the circle
            circle.attr("r", NORMALCIRCLESIZE);
        });

        // Add the container when the overlay is added to the map.
        overlay.onAdd = function() {
            // remove layer if it already exists
            $('.runningroutes').remove();

            // (re)create runningroutes div
            var layer = d3.select(this.getPanes().overlayLayer).append("div")
                .attr("class", "runningroutes");
    
            // Draw each route as a separate SVG element.
            // We could use a single SVG, but what size would it have?
            overlay.draw = function() {
                var projection = this.getProjection(),
                    padding = 10;
      
                // delete all the points
                var deleted = layer.selectAll("svg").remove();

                // select all starting points
                var routes = layer.selectAll("svg")
                  .data(d3.entries(data), id)
                    .each(updating)
                    .each(transform) // update existing routes
                  // .exit()
                  //   .each(removing)
                  //   .remove()
                  .enter().append("svg")
                    .each(entering)
                    .each(transform)
                    .attr("class", "route");
      
                // Add a circle.
                routes.append("circle")
                    .attr("r", NORMALCIRCLESIZE)
                    .attr("cx", padding)
                    .attr("cy", padding)
                    .attr("id", function(d) { return 'route-circle-' + id(d) });

                function transform(d) {
                 d = new google.maps.LatLng(d.value.geometry.properties.lat, d.value.geometry.properties.lng);
                 d = projection.fromLatLngToDivPixel(d);
                 return d3.select(this)
                     .style("left", (d.x - padding) + "px")
                     .style("top", (d.y - padding) + "px");
                }
            };
        };
    
        // Bind our overlay to the map…
        overlay.setMap(map);

    });
});

function id(d) {
    // console.log('looking at id=' + d.value.geometry.properties.id)
    return d.value.geometry.properties.id;
};

function exiting(d) {
    console.log('exiting id=' + d.value.geometry.properties.id)
};
function entering(d) {
    console.log('entering id=' + d.value.geometry.properties.id)
};
function updating(d) {
    console.log('updating id=' + d.value.geometry.properties.id)
};