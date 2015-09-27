// assumes empty table in DOM before call
function datatables_csv(fileuri, tableid, dtoptions) {
  if (typeof dtoptions === 'undefined') { dtoptions = {}; }

  d3.text(fileuri, function (datasetText) {

    var rows = d3.csv.parseRows(datasetText);

    var tbl = d3.select("#" + tableid);

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