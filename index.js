var express = require('express');
var bodyParser = require('body-parser');
var stats = require('./stats.js');
var app = express();

app.use(bodyParser.json() );       // to support JSON-encoded bodies
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

    var containsPerson = false;
    var containsQualifier = false;
    var containsTeam = false;
    var mapsTo = false;
    var teamName = false;

    for (var l = 0; l < keys.length; l++) {
      var keyInstanceConcepts = req.body.instances[keys[l]].instance["_concept"];

      if(keyInstanceConcepts.indexOf("person") > -1) {
        containsPerson = true;
      }

      if(keyInstanceConcepts.indexOf("qualifier") > -1) {
        containsQualifier = true;
        mapsTo = req.body.instances[keys[l]].instance["maps to"];
      }

      if(keyInstanceConcepts.indexOf("team") > -1) {
        containsTeam = true;
        teamName = req.body.instances[keys[l]].name;
      }
    }

    if(containsPerson) {
        for (var i = 0; i < keys.length; i++) {

          var keyConcepts = req.body.instances[keys[i]].instance["_concept"];
          for (var j = 0; j < keyConcepts.length; j++) {
            if(keyConcepts[j] === "person") {
                player = stats.batsmanAverage(req.body.instances[keys[i]].name)

              var propertyAttributes = Object.keys(req.body.properties);

              for (var k = 0; k < propertyAttributes.length; k++) {
                var prop = req.body.properties[propertyAttributes[k]];

                if(req.body.properties && prop.name === "batsman:batting average:value") {
                  return res.send('the batting average is ' + player.battingAverage)
                }

                if (req.body.properties && prop.name === "batsman:career runs:value") {
                  return res.send('the total runs is ' + player.totalRuns)
                }

                if (req.body.properties && prop.name === "batsman:balls faced:value") {
                  return res.send('the total balls faced is ' + player.totalBalls)
                }

                if (req.body.properties && prop.name === "batsman:total outs:value") {
                  return res.send('the total outs ' + player.totalGotOut)
                }

                if (req.body.properties && prop.name === "batsman:batting innings:value") {
                  return res.send('the total innings is ' + player.totalInnings)
                }

                if (req.body.properties && prop.name === "batsman:career matches:value") {
                  return res.send('the total matches is ' + player.totalMatches)
                }
              }


            }
          }
        }
      } else if (containsQualifier && mapsTo != false) {

        var playersList = stats.playersList();
        var propertyAttributes = Object.keys(req.body.properties);

        var filter = {};
        if(teamName){
          filter.team = teamName;
        }

        console.log(filter);

        for (var k = 0; k < propertyAttributes.length; k++) {
          var prop = req.body.properties[propertyAttributes[k]];

          if(req.body.properties && prop.name === "batsman:batting average:value") {
            player = stats.getPlayerStat(playersList, filter, mapsTo, function(player){
              var outs = player.totalGotOut;
              if(outs < 1){
                outs = 1;
              }
              return player.totalRuns/outs;
            });
            return res.send(player.name + " (batting average: " + player.stat +')');
          }
          if(req.body.properties && prop.name === "batsman:career runs:value") {
            player = stats.getPlayerStat(playersList, filter, mapsTo, function(player){
              return player.totalRuns;
            })
            return res.send(player.name + ' (runs:' + player.stat+')');
          }
          if(req.body.properties && prop.name === "batsman:balls faced:value") {
            player = stats.getPlayerStat(playersList, filter, mapsTo, function(player){
              return player.ballsFaced;
            })
            return res.send(player.name + ' (balls faced:' + player.stat+')');
          }
          if(req.body.properties && prop.name === "batsman:total outs:value") {
            player = stats.getPlayerStat(playersList, filter, mapsTo, function(player){
              return player.totalGotOut;
            })
            return res.send(player.name + ' (lost wickets:' + player.stat+')');
          }

        }

      }

  }
  res.send("I don't know.");

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

// see if port is sent in env
var port = normalizePort(process.env.PORT || '3000');

// initialise stats to load data
stats.init();

app.listen(port, function () {
  console.log('Example app listening on port '+port+'!');
});
