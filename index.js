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

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});