// render upload filename upon upload complete
// return anonymous function as this gets eval'd at initialization
function rendergpxfile() {
    return function(fileid) {
        var renderfile = fileid ? _dt_table.file('data', fileid).filename : 'please select file';
        console.log('renderfile = ' + renderfile);
        return renderfile;
    }
}

// this must be done after datatables() is called in datatables.js
function afterdatatables(){
    // $( editor.field( 'gpxfile' ).input() ).on( 'upload.editor', function (e, val) {
    //   console.log( 'gpxfile field has changed value', this, val, e );
    // } );
    editor.on( 'uploadXhrSuccess', function ( e, fieldName, json ) {
        console.log ('elev = ' + json.elev + ' distance = ' + json.distance);
        editor.field('elev').set(json.elev);
        editor.field('distance').set(json.distance);
    } );
};