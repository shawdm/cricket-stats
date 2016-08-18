var express = require('express');
var bodyParser = require('body-parser');
var stats = require('./stats.js');
var app = express();

// {
//   "concept": "player",
//   "named_instance": "JE Root",
//   "property": "batting average"
// }

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.post('/', function (req, res) {
  var player;

  if(req.body.property && req.body.property === "batting average" &&
    req.body.named_instance && req.body.concept === "player") {

    console.log('player name: ', req.body.named_instance)
    player = stats.batsmanAverage(req.body.named_instance)
    console.log('player obj: ', player)
  }
  res.send('the batting average is ' + player.battingAverage)
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
