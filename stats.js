var fs = require('fs');
var YAML = require('yamljs');

var INPUT_DIR = './cricsheet';
var CACHED_DIR = './cached';
var SOURCE_DOCS = [];
var MAX_DOCS = 10000;


function init(){
  var cacheFile = CACHED_DIR + '/cached.json';
  var cacheFileStats = fs.lstat(cacheFile, function(err, stats){
    if(err){
      console.log('No cached data file, creating a new one. This will take several minutes.');
      var filenames = fs.readdirSync(INPUT_DIR);
      if(filenames){
        for(var i=0; i < filenames.length && i < MAX_DOCS; i++){
          if(filenames[i].endsWith('yaml')){
            var statsObject = YAML.load(INPUT_DIR + '/' + filenames[i]);
            SOURCE_DOCS.push(statsObject);
          }
        }
      }

      fs.writeFile(cacheFile, JSON.stringify(SOURCE_DOCS), 'utf8', function(){
        console.log('Created cache file, ' + SOURCE_DOCS.length + " matches.");
      });
    }
    else{
      console.log('Using cached data file.');
      fs.readFile(cacheFile, function(err, data){
        if(err){
          console.log('Error');
          console.log(err);
        }
        else{
            SOURCE_DOCS = JSON.parse(data);
            console.log('Read all cached data, ' + SOURCE_DOCS.length + " matches.");
        }
      });
    }
  });
}


function getPlayerStat(playersList, filter, qualifier, statFunction){
  var playerNames = Object.keys(playersList);
  var sortedPlayers = [];

  for (var i = 0; i < playerNames.length; i++) {
    var player = playersList[playerNames[i]];

    player.stat = statFunction(player);

    // if no filter is set add the player
    if(!filter || Object.keys(filter).length == 0){
      sortedPlayers.push(player)
    }
    else{
      if(filter.team && filter.team == player.team){
        sortedPlayers.push(player);
      }
      else if(filter.player && filter.player === player.name){
        sortedPlayers.push(player);
      }
    }
  }

  if(!sortedPlayers || sortedPlayers.length < 1){
    return false;
  }

  sortedPlayers.sort(function(a, b){
    return b.stat - a.stat;
  })

  if (qualifier && qualifier === "a:max") {
    return sortedPlayers[0];
  }
  else {
    return sortedPlayers[sortedPlayers.length -1];
  }

}


function playersList() {
  var playersList = {};
  for (var k = 0; k < SOURCE_DOCS.length; k++) {
    var matchPlayers = [];
    // stats object for each match
    var statsObject = SOURCE_DOCS[k];
    for (var i = 0; i < statsObject.innings.length; i++) {
      // innings object for each innings
      var inningsPlayers = [];
      var innings = Object.keys(statsObject.innings[i])
      var team = statsObject.innings[i][innings].team;
      var innings_deliveries = statsObject.innings[i][innings]['deliveries'];

      for (var j = 0; j < innings_deliveries.length; j++) {
        var ball = Object.keys(innings_deliveries[j])
        var batsman = innings_deliveries[j][ball]['batsman']
        if(!playersList[batsman]) {
          playersList[batsman] = {
            name: batsman,
            team: team,
            ballsFaced: 0,
            totalRuns: 0,
            totalGotOut: 0,
            totalMatchs: 0,
            totalInnings: 0,
            totalBattingInnings:0,
            totalBowlingInnings:0
          };
        }

        // increment count of matches if not already done so for this player
        if(matchPlayers.indexOf(batsman) < 0){
          playersList[batsman].totalInnings++;
          playersList[batsman].totalBattingInnings++;
        }

        // increment count of innings if not already done so for this player

        playersList[batsman].ballsFaced++;

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


function batsmanStats(queryBatsman, filter){
 /*
  * example filter
  * {
  *  oppositionTeam:'Australia'
  * }
  */

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

        if(queryBatsman === batsman && matchFilter(filter, statsObject.info, statsObject.innings[i][innings], ball)) {
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

function matchFilter(filter, match, innings, delivery){

  if(filter){
    if(filter.oppositionTeam){
      if(match && match.teams && match.teams.length > 1){
        if(match.teams[0] != filter.oppositionTeam && match.teams[1] != filter.oppositionTeam){
          return false;
        }
      }
    }
  }

  return true;
}

/*
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
*/

function statBattingAverage(player){
  var outs = player.totalGotOut;
  if(outs < 1){
    outs = 1;
  }
  return player.totalRuns/outs;
}

function statWicketsLost(player){
   return player.totalGotOut;
}

function statTotalRuns(player){
   return player.totalRuns;
}

function statBallsFaced(player){
   return player.ballsFaced;
}


function statTotalInnings(player){
   return player.totalInnings;
}

function statTotalMatches(player){
   return player.totalMatches;
}


/*
has the value BI as ~ batting innings ~ and
has the value BA as ~ career matches
*/

module.exports = {
  init: init,
  batsmanStats: batsmanStats,
  playersList: playersList,
  getPlayerStat: getPlayerStat,
  statTotalRuns: statTotalRuns,
  statBattingAverage: statBattingAverage,
  statBallsFaced: statBallsFaced,
  statWicketsLost: statWicketsLost,
  statTotalInnings:statTotalInnings,
  statTotalMatches:statTotalMatches
}
