var dtoptions = {
    "order": [[1,'asc']],
    dom: '<"clear">lfrtip',
}

datatables_csv("/api/_memberinfo", "membership-table", true, dtoptions);