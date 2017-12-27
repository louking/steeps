// see https://github.com/louking/steeps/gs/runningroutes for the source for this code
// embed this code in google spreadsheet using Tools > Script editor...
//
// the google spreadsheet must include the following headings
//
//    name - arbitrary name of route
//    distance - distance in miles
//    surface - asphalt, trail, grass, mixed
//    start location - either address or lat, lon
//    map - link to map of route, e.g., through mapmyrun
//    description - optional description of route

// see https://developers.google.com/maps/documentation/javascript/libraries
// see https://developers.google.com/maps/documentation/javascript/adding-a-google-map
// see https://developers.google.com/maps/documentation/javascript/importing_data#data
// see https://tools.ietf.org/html/rfc7946 [GeoJson]

// main get function
function doGet(event) {
  var parameters = event.parameters;
  var config = getConfig('config');

  // check for error
  if (!parameters.op) {
    return ContentService
      .createTextOutput(JSON.stringify({status: "fail", message:"Error Encountered"}));

  // return list of routes
  } else if (parameters.op == 'routes') {
    // return GeoJson
    var geo = getGeoJson();
    geo.status = "success";
    return ContentService
      .createTextOutput(JSON.stringify(geo))
      .setMimeType(ContentService.MimeType.JSON);

  // return turn by turn for a route id
  } else if (parameters.op == 'turns') {
    // open routefile and gather turn by turn
    var thisfid = parameters.fileid;
    var routefile = SpreadsheetApp.openById(thisfid);
    var routesheet = routefile.getSheetByName("turns");
    var turndata = getRowsData(routesheet, routesheet.getDataRange(), 1);
    var justturns = [];
    // skip header row
    for (var i=1; i<turndata.length; i++) {
      justturns.push( turndata[i].turn);
    }

    return ContentService
      .createTextOutput(JSON.stringify({status: "success", turns: justturns}))
      .setMimeType(ContentService.MimeType.JSON);

  // return path for a route id
  } else if (parameters.op == 'path') {
    // open routefile and gather path points
    var thisfid = parameters.fileid;
    var routefile = SpreadsheetApp.openById(thisfid);
    var routesheet = routefile.getSheetByName("path");
    var pathdata = getRowsData(routesheet, routesheet.getDataRange(), 1);
    var justpath = [];
    var ftpermeter = 3.280839895;

    // skip header row
    for (var i=1; i<pathdata.length; i++) {
      var row = pathdata[i];

      // row.ele is in meters -- use feet by default
      var ele;
      if ( parameters.metric ) {
        ele = +row.ele;
      } else {
        ele = +row.ele * ftpermeter;
      }

      justpath.push( [ +row.lat, +row.lng, +ele.toFixed(1) ] );
    }

    return ContentService
      .createTextOutput(JSON.stringify({status: "success", path: justpath}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// retrieve GeoJson from database
function getGeoJson() {
  // hardcoded file id
  var geo = 
      { type : 'FeatureCollection',
       features : [],
      };
  
  // retrieve the data in this spreadsheet and add to features list
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var db = ss.getSheetByName('routes');
  var dbrange = db.getRange(2, 1, db.getMaxRows() - 1, db.getMaxColumns());
  var objects = getRowsData(db, dbrange);

  // add points from database
  for (var i = 0; i < objects.length; ++i) {
    // Get a row object
    var point = objects[i];

    // skip inactive points
    if (!point.active) continue
    
    var lat = point.latlng.split(',')[0];
    var lng = point.latlng.split(',')[1];
    
    var thisgeo = {
      type : 'Feature',
      geometry : {
        type : 'Point',
        coordinates : [lat, lng],
        properties: {
          id          : point.id,
          name        : point.name,
          distance    : point.distance,
          surface     : point.surface,
          gain        : point.elevationGain,
          links       : '',   // placeholder - built on the client
          description : point.description,
          lat         : lat,
          lng         : lng,
          start       : point.startLocation,
          latlng      : point.latlng,
          map         : point.map,
          fileid      : point.fileid,
        }
      }
    }
    geo.features.push( thisgeo );
  }
  
  // case insensitive string sort by name field
  // see http://stackoverflow.com/questions/979256/sorting-an-array-of-javascript-objects
  geo.features.sort(function(a, b) {
    if (!a.geometry.properties.name) a.geometry.properties.name = '';
    if (!b.geometry.properties.name) b.geometry.properties.name = '';
    return a.geometry.properties.name.localeCompare(b.geometry.properties.name);
  });
  
  return geo;
}

// get config from configuration sheet
function getConfig(sheetname) {
  var wb = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = wb.getSheetByName(sheetname); 
  var configdata = getRowsData(sheet, sheet.getDataRange(), 1);

  config = {};
  for (i=1; i<configdata.length; i++) {
    var param = configdata[i];
    var thisparam = normalizeHeader(param.parameter)
    config[thisparam] = param.value;
  };

  Logger.log( 'config = ' + Utilities.jsonStringify(config) );
  return config;
};


//////////////////////////////////////////////////////////////////////////////////////////
//
// The code below is reused from https://developers.google.com/apps-script/articles/mail_merge
//
//////////////////////////////////////////////////////////////////////////////////////////

// getRowsData iterates row by row in the input range and returns an array of objects.
// Each object contains all the data for a given row, indexed by its normalized column name.
// Arguments:
//   - sheet: the sheet object that contains the data to be processed
//   - range: the exact range of cells where the data is stored
//   - columnHeadersRowIndex: specifies the row number where the column names are stored.
//       This argument is optional and it defaults to the row immediately above range; 
// Returns an Array of objects.
function getRowsData(sheet, range, columnHeadersRowIndex) {
  columnHeadersRowIndex = columnHeadersRowIndex || range.getRowIndex() - 1;
  var numColumns = range.getEndColumn() - range.getColumn() + 1;
  var headersRange = sheet.getRange(columnHeadersRowIndex, range.getColumn(), 1, numColumns);
  var headers = headersRange.getValues()[0];
  return getObjects(range.getValues(), normalizeHeaders(headers));
}

// For every row of data in data, generates an object that contains the data. Names of
// object fields are defined in keys.
// Arguments:
//   - data: JavaScript 2d array
//   - keys: Array of Strings that define the property names for the objects to create
function getObjects(data, keys) {
  var objects = [];
  for (var i = 0; i < data.length; ++i) {
    var object = {};
    var hasData = false;
    for (var j = 0; j < data[i].length; ++j) {
      var cellData = data[i][j];
      if (isCellEmpty(cellData)) {
        continue;
      }
      object[keys[j]] = cellData;
      hasData = true;
    }
    if (hasData) {
      objects.push(object);
    }
  }
  return objects;
}

// Returns an Array of normalized Strings.
// Arguments:
//   - headers: Array of Strings to normalize
function normalizeHeaders(headers) {
  var keys = [];
  for (var i = 0; i < headers.length; ++i) {
    var key = normalizeHeader(headers[i]);
    if (key.length > 0) {
      keys.push(key);
    }
  }
  return keys;
}

// Normalizes a string, by removing all alphanumeric characters and using mixed case
// to separate words. The output will always start with a lower case letter.
// This function is designed to produce JavaScript object property names.
// Arguments:
//   - header: string to normalize
// Examples:
//   "First Name" -> "firstName"
//   "Market Cap (millions) -> "marketCapMillions
//   "1 number at the beginning is ignored" -> "numberAtTheBeginningIsIgnored"
function normalizeHeader(header) {
  var key = "";
  var upperCase = false;
  for (var i = 0; i < header.length; ++i) {
    var letter = header[i];
    if (letter == " " && key.length > 0) {
      upperCase = true;
      continue;
    }
    if (!isAlnum(letter)) {
      continue;
    }
    if (key.length == 0 && isDigit(letter)) {
      continue; // first character must be a letter
    }
    if (upperCase) {
      upperCase = false;
      key += letter.toUpperCase();
    } else {
      key += letter.toLowerCase();
    }
  }
  return key;
}

// Returns true if the cell where cellData was read from is empty.
// Arguments:
//   - cellData: string
function isCellEmpty(cellData) {
  return typeof(cellData) == "string" && cellData == "";
}

// Returns true if the character char is alphabetical, false otherwise.
function isAlnum(char) {
  return char >= 'A' && char <= 'Z' ||
    char >= 'a' && char <= 'z' ||
    isDigit(char);
}

// Returns true if the character char is a digit, false otherwise.
function isDigit(char) {
  return char >= '0' && char <= '9';
}
