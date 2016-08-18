var express = require('express');
var bodyParser = require('body-parser');
var stats = require('./stats.js');
var app = express();



app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.get('/load', function (req, res) {
  stats.init();
  res.send('initialized')
})

app.post('/', function (req, res) {
  var player;

  if (req.body.instances) {
    var keys = Object.keys(req.body.instances)
    for (var i = 0; i < keys.length; i++) {
      var keyConcepts = req.body.instances[keys[i]].instance["_concept"];
      for (var j = 0; j < keyConcepts.length; j++) {
        if(keyConcepts[j] === "person") {
            player = stats.batsmanAverage(req.body.instances[keys[i]].name)
          
          var propertyAttributes = Object.keys(req.body.properties);

          for (var k = 0; k < propertyAttributes.length; k++) {
            var prop = req.body.properties[propertyAttributes[k]];

            if(req.body.properties && prop.name === "batsman:batting average:value") {
              res.send('the batting average is ' + player.battingAverage)
            }

            if (req.body.properties && prop.name === "batsman:career runs:value") {
              res.send('the total runs is ' + player.totalRuns)
            }

            if (req.body.properties && prop.name === "batsman:balls faced:value") {
              res.send('the total balls faced is ' + player.totalBalls)
            }

            if (req.body.properties && prop.name === "batsman:total outs:value") {
              res.send('the total outs ' + player.totalGotOut)
            }

            if (req.body.properties && prop.name === "batsman:batting innings:value") {
              res.send('the total innings is ' + player.totalInnings)
            }

            if (req.body.properties && prop.name === "batsman:career matches:value") {
              res.send('the total matches is ' + player.totalMatches)
            }
          }
          
          
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
