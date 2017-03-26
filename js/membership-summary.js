var dtoptions = {
    "order": [[1,'asc']],
    dom: '<"clear">lBfrtip',
    buttons: ['csv']
}

datatables_csv("/api/_memberinfo", "membership-table", true, dtoptions);