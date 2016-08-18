var fs = require('fs');
var YAML = require('yamljs');

var INPUT_DIR = './cricsheet';
var SOURCE_DOCS = [];
var MAX_DOCS = 1000;

function init(){
  var filenames = fs.readdirSync(INPUT_DIR);
  if(filenames){
    for(var i=0; i < filenames.length && i < MAX_DOCS; i++){
      if(filenames[i].endsWith('yaml')){
        var statsObject = YAML.load(INPUT_DIR + '/' + filenames[i]);
        SOURCE_DOCS.push(statsObject);
      }
    }
  }
}

function getBattingAverageExtremes(playerList, qualifier, teamName) {
  var playerNames = Object.keys(playerList);
  var maxPlayer = false;
  var minPlayer = false;
  var sortedPlayers = []
  for (var i = 0; i < playerNames.length; i++) {
    var player = playerList[playerNames[i]];
    if (player.totalGotOut === 0) {
      player.totalGotOut = 1
    }
    var battingAverage = player.totalRuns / player.totalGotOut;

    player.battingAverage = battingAverage;

    if (teamName === false) {
      sortedPlayers.push(player)
    } else {
      if (teamName === player.team) {
        sortedPlayers.push(player) 
      }
    }
  }

  sortedPlayers.sort(function(a, b){
    return b.battingAverage - a.battingAverage;
  })

  // for (var i = 0; i < 5; i++) {
  //   console.log(sortedPlayers[i])
  // }

  if (qualifier === "a:max") {
    return sortedPlayers[0];
  } else {
    return sortedPlayers[sortedPlayers.length -1];
  }
}

function playersList() {
  var playersList = {};
  for (var k = 0; k < SOURCE_DOCS.length; k++) {
    var statsObject = SOURCE_DOCS[k];
    for (var i = 0; i < statsObject.innings.length; i++) {
    var innings = Object.keys(statsObject.innings[i])
    var team = statsObject.innings[i][innings].team;
    var innings_deliveries = statsObject.innings[i][innings]['deliveries']

      for (var j = 0; j < innings_deliveries.length; j++) {
        var ball = Object.keys(innings_deliveries[j])
        var batsman = innings_deliveries[j][ball]['batsman']
        if(!playersList[batsman]) {
          playersList[batsman] = {
            name: batsman,
            team: team,
            totalRuns: 0,
            totalGotOut: 0
          }; 
        }

        var run = innings_deliveries[j][ball]['runs']['batsman'];
        playersList[batsman].totalRuns = playersList[batsman].totalRuns + run;
        if(innings_deliveries[j][ball]['wicket']) {
          playersList[batsman].totalGotOut++;
        }
      }
    }
  }

  return playersList;
}

function batsmanAverage(queryBatsman){
  var totalRuns = 0;
  var totalBalls = 0;
  var totalWickets = 0;
  var totalInnings = 0;
  var totalMatches = 0;
  var firstMatch = false;
  var lastMatch = false;

  for (var k = 0; k < SOURCE_DOCS.length; k++) {
    var statsObject = SOURCE_DOCS[k];
    var matchStartDay = new Date(statsObject.info.dates[0]).getTime();
    if(firstMatch === false || firstMatch > matchStartDay) {
      firstMatch = matchStartDay;
    }

    if(lastMatch === false || lastMatch < matchStartDay) {
      lastMatch = matchStartDay;
    }

    var batsmanInMatch = false;
    for (var i = 0; i < statsObject.innings.length; i++) {
      var innings = Object.keys(statsObject.innings[i])
      var innings_deliveries = statsObject.innings[i][innings]['deliveries']

      var queryBatsmanBatted = false;
      for (var j = 0; j < innings_deliveries.length; j++) {
        var ball = Object.keys(innings_deliveries[j])
        var batsman = innings_deliveries[j][ball]['batsman']
        if(queryBatsman === batsman) {
          if (!batsmanInMatch) {
            totalMatches++;
            batsmanInMatch = true;
          }

          if(!queryBatsmanBatted){
            totalInnings++;
            queryBatsmanBatted = true;
          }
          var run = innings_deliveries[j][ball]['runs']['batsman'];
          totalRuns = totalRuns + run;
          totalBalls++;

          if(innings_deliveries[j][ball]['wicket']) {
            totalWickets++;
          }
        }

      }
    }
  }

  if (totalWickets === 0) {
    totalWickets = 1;
  }

  return {
    "totalRuns" : totalRuns,
    "totalBalls" : totalBalls,
    "totalGotOut" : totalWickets,
    "totalInnings" : totalInnings,
    "totalMatches" : totalMatches,
    "battingAverage" : (totalRuns / totalWickets).toFixed(2)
  }
}

module.exports = {
  init: init,
  batsmanAverage: batsmanAverage,
  playersList: playersList,
  getBattingAverageExtremes: getBattingAverageExtremes
}
