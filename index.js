var express = require('express');
var bodyParser = require('body-parser');
var stats = require('./stats.js');
var app = express();



app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.post('/', function (req, res) {
  var player;

  if (req.body.instances) {
    var keys = Object.keys(req.body.instances)
    for (var i = 0; i < keys.length; i++) {
      var keyConcepts = req.body.instances[keys[i]].instance["_concept"];
      for (var j = 0; j < keyConcepts.length; j++) {
        if(keyConcepts[j] === "person") {
          
          if(req.body.properties && req.body.properties.batting && req.body.properties.batting.name === "batsman:batting average:value") {
            player = stats.batsmanAverage(req.body.instances[keys[i]].name)
          }
          res.send('the batting average is ' + player.battingAverage)
        }
      }
    }

  }
});


function normalizePort(val) {
  var port = parseInt(val, 10);
  if (isNaN(port)) {
    // named pipe
    return val;
  }
  if (port >= 0) {
    // port number
    return port;
  }
  return false;
}

var port = normalizePort(process.env.PORT || '3000');

app.listen(port, function () {
  console.log('Example app listening on port '+port+'!');
});
