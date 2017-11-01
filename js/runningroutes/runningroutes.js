// map overlay: https://bl.ocks.org/mbostock/899711
// d3 v3 -> v4: https://amdevblog.wordpress.com/2016/07/20/update-d3-js-scripts-from-v3-to-v4/

var $ = jQuery;

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
    
        // handle mouseover events for table rows
        $("tr").mouseenter(function(){
            $( this ).css("background-color", "yellow");
        });

        // handle mouseover events for table rows
        $("tr").mouseleave(function(){
            $( this ).css("background-color", "");
        });

        // Add the container when the overlay is added to the map.
        overlay.onAdd = function() {
            var layer = d3.select(this.getPanes().overlayLayer).append("div")
                .attr("class", "runningroutes");
    
            // Draw each marker as a separate SVG element.
            // We could use a single SVG, but what size would it have?
            overlay.draw = function() {
                var projection = this.getProjection(),
                    padding = 10;
      
                // delete all the points
                var deleted = layer.selectAll("svg").remove();
                 
                // select all starting points
                var marker = layer.selectAll("svg")
                  .data(d3.entries(data), id)
                    .each(updating)
                    .each(transform) // update existing markers
                  // .exit()
                  //   .each(removing)
                  //   .remove()
                  .enter().append("svg")
                    .each(entering)
                    .each(transform)
                    .attr("class", "marker");
      
                // Add a circle.
                marker.append("circle")
                    .attr("r", 4.5)
                    .attr("cx", padding)
                    .attr("cy", padding);

                function transform(d) {
                 d = new google.maps.LatLng(d.value.geometry.properties.lat, d.value.geometry.properties.lng);
                 d = projection.fromLatLngToDivPixel(d);
                 return d3.select(this)
                     .style("left", (d.x - padding) + "px")
                     .style("top", (d.y - padding) + "px");
                }

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
            };
        };
    
        // Bind our overlay to the map…
        overlay.setMap(map);

    });
});