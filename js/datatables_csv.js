// assumes empty table in DOM before call
function datatables_csv(fileuri, tableid, api, dtoptions) {
  if (typeof dtoptions === 'undefined') { dtoptions = {}; }
  if (typeof api === 'undefined') { api = false; }

  // show progress -- need jqueryui to be loaded
  // jQuery("#" + tableid).after('<div id="progressbar"><div class="progress-label">&nbsp;&nbsp;&nbsploading...</div></div>');
  // progressbar = jQuery("#progressbar");
  // progressbar.progressbar({
  //     value: false,
  // });


  d3.text(fileuri, function (contents) {

    // if not api, then must be just a file, use its contents
    if (!api) {
      data = contents;

    // if api, assumes '{"success":<successval>, "data":<dataset>}' string sent, should be valid json
    } else {
      contents = JSON.parse(contents);
      if (!contents.success) throw "error response from api";
      data = contents.data;
    }

    var rows = d3.csv.parseRows(data);

    var tbl = d3.select("#" + tableid);

    // stop showing progress -- need jqueryui to be loaded
    // progressbar.progressbar("destroy");

    // headers
    tbl.append("thead").append("tr")
      .selectAll("th")
        .data(rows[0])
      .enter().append("th")
        .text(function(d) { return d; });

    // data
    tbl.append("tbody")
      .selectAll("tr")
          .data(rows.slice(1))
      .enter().append("tr")
        .selectAll("td")
          .data(function(d){ return d; })
        .enter().append("td")
          .text(function(d){ return d; });

    jQuery(document).ready(function() {
      jQuery("#" + tableid).DataTable(dtoptions);
    });

  });
}