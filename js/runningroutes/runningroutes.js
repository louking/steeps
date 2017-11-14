// map overlay: https://bl.ocks.org/mbostock/899711
// d3 v3 -> v4: https://amdevblog.wordpress.com/2016/07/20/update-d3-js-scripts-from-v3-to-v4/

var $ = jQuery;
// for metadata within row
var loc2id = {}
    id2loc = {};

// keep tip global
var tip;

// options for datatables
var datatables_options = {
    // "order": [[1,'asc']],
    dom: '<"clear">lBfrtip',
    ajax: {
           url: 'https://script.google.com/a/macros/steeplechasers.org/s/AKfycbw0Nh_VCqs8GghmUImVuyQVzOCCSWUpVJO_B6PgaqnoprtSO_k/exec',
           dataSrc: 'features',
          },
    columns: [
        { name: 'loc',      data: 'loc', defaultContent: '' },  // set in preDraw
        { name: 'name',     data: 'geometry.properties.name' },
        { name: 'distance', data: 'geometry.properties.distance' },
        { name: 'surface',  data: 'geometry.properties.surface' },
        { name: 'gain',     data: 'geometry.properties.gain', defaultContent: '' },
        { name: 'links',    data: 'geometry.properties.links', orderable: false, defaultContent: '' },
        { name: 'lat',      data: 'geometry.properties.lat', visible: false },
        { name: 'lng',      data: 'geometry.properties.lng', visible: false },
        { name: 'id',       data: 'geometry.properties.id', visible: false },
    ],
    rowCallback: function( row, thisd, index ) {
        var thisid = thisd.geometry.properties.id;
        // $('td:eq(0)', row).html(id2loc[thisid]);
        $(row).attr('rowid', thisid);
    },
    buttons: ['csv'],
}

// options for yadcf
var distcol = 2,
    surfacecol = 3,
    latcol = 6,
    lngcol = 7;
var yadcf_options = [
          { column_number: distcol, 
            filter_type: 'range_number',
            filter_container_id: 'external-filter-distance',
          },
          { column_number: surfacecol,
            filter_container_id: 'external-filter-surface',
          },
          { column_number: latcol,
            filter_type: 'range_number',
            filter_container_id: 'external-filter-bounds-lat',
          },
          { column_number: lngcol,
            filter_type: 'range_number',
            filter_container_id: 'external-filter-bounds-lng',
          },
    ];

// configuration for map display
var rcircle = 10,
    rcircleselected = 1.5 * rcircle,
    pi = Math.PI,
    dexpmin = rcircle * 4,    // minimum distance for explosion
    maxroutes = 40,           // maximum number of routes handled for non-overlapping explosion
    separation = 5,           // number of pixels to separate individual routes during explosion
    dexpmax = maxroutes * (rcircle + separation) / (2*pi),
    durt = 500,   // transition duration (msec)
    textdy = 4,   // a bit of a hack, trial and error
    // padding is from center of circle
    padding = rcircleselected + 2, // +2 adjusts for circle stroke width
    t = d3.transition(durt);

$(document).ready(function() {
    // initialize datatables and yadcf
    var myTable = $("#runningroutes-table").DataTable(datatables_options);
    yadcf.init(myTable, yadcf_options);
  
    // set map div height - see https://stackoverflow.com/questions/1248081/get-the-browser-viewport-dimensions-with-javascript
    // 50% of viewport
    var mapheight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) * .5;
    var mapwidth  = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    $('#runningroutes-map').height( mapheight + 'px' );

    // Create the Google Map…
    var map = new google.maps.Map(d3.select("#runningroutes-map").node(), {
      zoom: 9,
      center: new google.maps.LatLng(39.431206, -77.415428),
      mapTypeId: google.maps.MapTypeId.TERRAIN
    });

    // see https://issuetracker.google.com/issues/35818314#comment21
    var handleboundscheck = false;
    google.maps.event.addListener(map, 'idle', function() {
        // console.log('idle event fired');
        // when do we start doing this? After first draw, I think
        if (handleboundscheck) {
            var bounds = map.getBounds();
            var nebounds = bounds.getNorthEast();
            var swbounds = bounds.getSouthWest();
            var lowlat = Math.min(nebounds.lat(), swbounds.lat());
            var lowlng = Math.min(nebounds.lng(), swbounds.lng());
            var hilat  = Math.max(nebounds.lat(), swbounds.lat());
            var hilng  = Math.max(nebounds.lng(), swbounds.lng());
            console.log ('(lowlat, hilat, lowlng, hilng) = ' + lowlat + ', ' + hilat + ', ' + lowlng + ', ' + hilng );
            // not clear why I need to add third parameter here, but not in https://codepen.io/louking/pen/EbKYJd
            yadcf.exFilterColumn(myTable, [[latcol, {from: lowlat, to: hilat}], [lngcol,  {from: lowlng, to: hilng}]], true);
        };
    });

    // remove tip when map clicked outside of circle
    // google.maps.event.addListener(map, 'click', function() {
    //     console.log('map clicked');
    //     tip.hide();
    // });

    var data;
    var justsorting = false;
    myTable.on( 'preDraw.dt', function() {
        // As preDraw actions happen after the sort in dataTables, a second draw is required.
        // The 'justsorting' draw was invoked at the bottom of the draw.dt function just to sort the table
        if (justsorting) return;

        // get filtered data from datatables
        // datatables data() method extraneous information, just pull out the data
        var dtdata = myTable.rows( { search: 'applied' } ).data();
        data = [];
        for (var i=0; i<dtdata.length; i++) { 
            data.push(dtdata[i]) 
        };

        // set up loc metadata within data
        loc2id = {};
        for (var i=0; i<data.length; i++) {
            var d = data[i];    // get convenient handle
            var thisid = d.geometry.properties.id;
            var dlat = d.geometry.properties.lat.toFixed(4);
            var dlng = d.geometry.properties.lng.toFixed(4);
            var key = dlat + "," + dlng;
            if (loc2id[key] === undefined) {
                loc2id[key] = [];
            };
            // convenient to save data index rather than id
            loc2id[key].push(thisid);
        };

        // TODO: sort locations somehow - by distance from Frederick center? from center of map?
        var locations = Object.keys(loc2id);
        locations.sort().reverse();   // currently north to south because key is lat,lng, northern hemi
        id2loc = {};
        // loop thru locations
        for (var i=0; i<locations.length; i++) {
            var thisloc = i+1;      // locations are 1-based
            // loop thru routes at this location
            var key = locations[i];
            for (var j=0; j<loc2id[key].length; j++) {
                var thisid = loc2id[key][j];
                id2loc[thisid] = thisloc;
                // console.log('preDraw: id2loc['+thisid+'] = ' + thisloc);
            };
        };

        // update loc cell in the table
        myTable.rows( { search: 'applied' } ).every ( function (i, tblloop, rowloop) {
            var thisid = this.data().geometry.properties.id;
            // loc is 0th column in the row
            var dloc = id2loc[thisid];
            myTable.cell({row: i, column: 0}).data(dloc);

        });

        // also update the data array
        for (var i=0; i<data.length; i++) {
            var thisid = data[i].geometry.properties.id;
            var dloc = id2loc[thisid];
            data[i].loc = dloc;
        };


    });

    myTable.on( 'draw.dt', function() {

        // As preDraw actions happen after the sort in dataTables, a second draw is required.
        // The 'justsorting' draw was invoked at the bottom of this function just to sort the table
        if (justsorting) {
            console.log('draw event, just sorting');
            justsorting = false;
            return;
        }

        console.log('draw event');

        // handle mouseover events for table rows
        $("tr").not(':first').mouseenter(function(){
            // highlight table
            $( this ).css("background-color", "yellow");

            // find all interesting elements
            var thisid = $( this ).attr('rowid');
            var circle = $("#route-circle-" + thisid);
            var group = circle.parent();
            var svg = group.parent();
            var routes = svg.parent();

            // highlight the circle
            circle.attr("r", rcircleselected);

            // bring containing group to top - see https://stackoverflow.com/questions/14120232/svg-elements-overlapping-issue
            svg.append(group);
        });

        // handle mouseover events for table rows
        $("tr").not(':first').mouseleave(function(){
            // unhighlight table
            $( this ).css("background-color", "");
            
            // find interesting elements
            var thisid = $( this ).attr('rowid');
            var circle = $("#route-circle-" + thisid);

            // unhighlight the circle
            circle.attr("r", rcircle);
        });

        // adapted from https://bl.ocks.org/mbostock/899711
        // also see https://developers.google.com/maps/documentation/javascript/customoverlays
        var overlay = new google.maps.OverlayView();

        // Add the container when the overlay is added to the map.
        overlay.onAdd = function() {

            // remove layer if it already exists from last table draw
            $('.runningroutes').remove();

            // (re)create runningroutes div
            var mappane = this.getPanes().overlayMouseTarget;
            var layer = d3.select(mappane).append("div")
                .attr("id", "runningroutes-layer")
                .attr("class", "runningroutes");
            var vis = d3.select("#runningroutes-layer");

            // Draw each route as a separate SVG element.
            // We could use a single SVG, but what size would it have?
            overlay.draw = function() {
                // add svg to map
                // see https://stackoverflow.com/questions/28586618/add-custom-svg-layer-on-google-map-api-v3
                // or maybe https://stackoverflow.com/questions/22075374/d3-overlay-on-google-maps-in-a-meteor-application
                // see https://developers.google.com/maps/documentation/javascript/examples/overlay-simple (not followed)

                // configuration for d3-tip
                // since d3-tip depends on svg which is recreated, need to initialize after svg is created
                if (tip) {
                    tip.destroy();
                }
                tip = d3.tip()
                        .direction('e')
                        .offset([0,rcircle+1])
                        .attr("class", "d3-tip")
                        // .attr("class", function(d) { "tip-" + d.loc })
                        .html(function(d) { 
                            var dd = d.value.geometry.properties;
                            var thistip = dd.name;
                            thistip += "<br/>" + dd.distance + " miles (" + dd.surface + ")";
                            if (dd.gain)
                                thistip += "<br/>" + dd.gain + " ft elev gain";
                            thistip += "<br/>" + dd.links;
                            return thistip;
                        });

                var svg = layer.append("svg")
                    .attr("id", "mapsvg")
                    .attr("height", mapheight)
                    .attr("width", mapwidth)
                    .attr("viewBox","0 0 " + mapwidth + " " + mapheight)
                    .on("click", function() {
                        console.log('map clicked');
                        tip.hide();
                    });
                svg.call(tip);

                var projection = this.getProjection();
      
                // select all starting points
                // Add group containers to hold circle and text
                var routes = svg.selectAll("g")
                  .data(d3.entries(data))
                    .enter().append("g")
                      .each(entering)
                      .each(transform)  // adds cx, cy attributes
                      .classed("route", true)
                      .attr("class", function(d) { return "g-loc-" + d.value.loc; })
                      .attr("transform", "translate(0,0)")
                      .style("cursor", "pointer")
                      .on("click", explodeData);

                // Add a circle.
                routes.append("circle")
                    .attr("r", rcircle)
                    .attr("cx", function(d) { return d3.select(this.parentNode).attr("cx") })
                    .attr("cy", function(d) { return d3.select(this.parentNode).attr("cy") })
                    .attr("id", function(d) { return 'route-circle-' + id(d) })
                    .attr("class", function(d) { return "c-loc-" + d.value.loc; });

                routes.append("text")
                  .attr("x", function(d) { return d3.select(this.parentNode).attr("cx") })
                  .attr("y", function(d) { return d3.select(this.parentNode).attr("cy") })
                  .attr("text-anchor", "middle")
                  .attr("dy", function(d) { return textdy })
                  .attr("class", function(d) { return "t-loc-" + d.value.loc; })
                  .text(function(d) { return d.value.loc; });

                function transform(d) {
                    d = new google.maps.LatLng(d.value.geometry.properties.lat, d.value.geometry.properties.lng);
                    d = projection.fromLatLngToDivPixel(d);
                    return d3.select(this)
                        .attr("cx", d.x)
                        .attr("cy", d.y);
                        // .style("left", (d.x - padding))
                        // .style("top", (d.y - padding));
                }
            };
        };
    
        // Bind our overlay to the map…
        overlay.setMap(map);

        // handle map bounds check after first draw
        handleboundscheck = true;

        // if not justsorting, draw again to sort
        justsorting = true;
        myTable.draw();
    });
});

// called with group containing circle, text
// if there are other groups in same location, explode
// else special handling for lone group
function explodeData(d, i) {
  // Use D3 to select element and also all at same location
  var loc = d.value.loc;
  var thisg = d3.select(this);
  var theselocs = d3.selectAll(".g-loc-" + loc)
  var numlocs = theselocs.size();
  var svg = d3.select(this.parentNode);

  // shouldn't happen
  if (numlocs == 0) {
    throw 'noLocationsFound';

  // if only one at location, maybe there is some special processing
  } else if (numlocs == 1) {
    // handle single selection click
    // don't let this through to svg click event
    // http://bl.ocks.org/jasondavies/3186840
    d3.event.stopPropagation();
    tip.show(d);

  // multiple at location, explode
  } else {
    // if not selected yet, explode all in same loc
    if (!thisg.attr("exploded")) {
      // d3.select(this).raise();
      theselocs.attr("exploded", true);
      var cx = Number(thisg.attr("cx"));
      var cy = Number(thisg.attr("cy"));
      
      // create lines now so they're underneath
      // p1 = p3 because we'll be transitioning
      theselocs.each(function (d,i) {
        svg.append('line')
            .attr("class", "l-loc-" + loc)
            .attr("x1", cx)
            .attr("y1", cy)
            .attr("x2", cx)
            .attr("y2", cy)
            .attr("stroke-width", 1.5)
            .attr("stroke", "black")
          .transition(durt)
            .attr("x2", cx + dexp(numlocs) * Math.cos((2*pi/numlocs)*i))
            .attr("y2", cy + dexp(numlocs) * Math.sin((2*pi/numlocs)*i))
      });
      
      // create handle for original location
      svg.append("circle")
        .attr("id", "exploded-" + loc)
        .attr("class", "handle")
        .attr("loc", d.value.loc)
        .attr("r", rcircle)
        .attr("cx", cx)
        .attr("cy", cy)
        .style("cursor", "pointer")
        .on("click", unexplodeData);

      // explode
      theselocs
        .each(function(d, i){
          var thisg = d3.select(this);

          // transition to new location
          thisg.raise().transition(t)
            .attr("transform", "translate(" 
                  + dexp(numlocs) * Math.cos((2*pi/numlocs)*i) + "," 
                  + dexp(numlocs) * Math.sin((2*pi/numlocs)*i) + ")"
                  );
        });
        
      // if exploded and individual selected, maybe there is some special processing
    } else {
      // handle single selection click
      // don't let this through to svg click event
      // http://bl.ocks.org/jasondavies/3186840
      d3.event.stopPropagation();
      tip.show(d);
    }
    
  } // multiple at location
};

// called with handle for an exploded group
function unexplodeData(d, i) {
  // Use D3 to select element
  var handle = d3.select(this);
  var loc = handle.attr("loc");
  var x = handle.attr("cx");
  var y = handle.attr("cy");
  var theselocs = d3.selectAll(".g-loc-" + loc);
  
  // set exploded circles to original state
  theselocs.transition(t)
      .attr("selected", null)
      .attr("transform", "translate(0,0)")
      .attr("exploded", null);
  
  // shrink lines
  d3.selectAll(".l-loc-" + loc)
    .transition(t)
      .attr("x2", x)
      .attr("y2", y)
      .remove()
  
  // remove handle
  d3.select("#exploded-" + loc).remove();

};

// some other ancillary functions
function id(d) {
    // console.log('looking at id=' + d.value.geometry.properties.id)
    return d.value.geometry.properties.id;
};

function dexp(numlocs) {
    var thisdexp = numlocs * (rcircle + separation) / (2*pi);
    if (thisdexp < dexpmin) {
        thisdexp = dexpmin;
    } else if (thisdexp > dexpmax) {
        thisdexp = dexpmax;
    }
    return thisdexp;
};

function exiting(d) {
    // console.log('exiting id=' + d.value.geometry.properties.id)
};
function entering(d) {
    // console.log('entering id=' + d.value.geometry.properties.id)
};
function updating(d) {
    // console.log('updating id=' + d.value.geometry.properties.id)
};
