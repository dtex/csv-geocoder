var geo = require("node-geocoder")
  , csv = require("csv")
  , fs = require("fs")
  , es = require("event-stream")
  , temporal = require("temporal")
;

var geocoder = require('node-geocoder').getGeocoder('google', 'http')
  , inFile = fs.createReadStream(process.argv[2])
  , outFile = fs.createWriteStream(process.argv[3])
  , locators = process.argv[4].split(',')
  , count = 0
;

locators.forEach(function (v, i, a) {
  a[i] = Number(v);
});

var handleGeocode = function(row, cb) {
  row = row.split(",");
  count++;
  console.log(count);
  temporal.queue([{
    delay: count * 1000,
    task: function() {
      geocoder.geocode(row[row.length-1], function(err, res) {
        if (err) {
          console.log(row[row.length-1], err);
        } else {
          var geodata = res;
          if (geodata.length > 1) {
            // Todo: Add in prompt to choose correct lat/long
            console.log("Multiple matches for " + row[row.length-1] + ". Using first match. Please check.");
          }
          row.push(geodata[0].latitude);
          row.push(geodata[0].longitude);
        }

        cb(null, row.join());
      });
    }
  }]);
};


inFile
  .pipe( csv().transform( function(row){

    var address = "";
    locators.forEach( function (v) {
      address += row[v] + " ";
    });

    row.push(address);
    return row;

  }))
  .pipe(es.map(handleGeocode, function(err, row) {
    console.log(1, row);
    return row;
  }))
  .pipe(outFile);
/*

els.forEach( function (el, i) {

  // Find all the Placemarks (note: I am doing it this way because
  // libxmljs' node.find() is not working for me)


            geocoder.geocode(String(ch.text()), function(err, res) {
              completed++;

              if (err) {
                console.log(err);
              } else {
                var geodata = res;
                if (geodata.length > 1) {
                  // Todo: Add in prompt to choose correct lat/long
                  console.log("Multiple matches for " + ch.text() + ". Using first match. Please check.");
                }
                var lat = geodata[0].latitude;
                var long = geodata[0].longitude;
                var nPoint = el.node("Point");
                var nCoord = nPoint.node("coordinates", long + "," + lat);

                if (completed == count) {
                  fs.writeFile(process.argv[3], kml.toString());
                }
              }
            });
          }, count * 1000);

      };
      });
    }
  }
});
*/
