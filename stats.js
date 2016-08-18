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
    "totalWickets" : totalWickets,
    "totalInnings" : totalInnings,
    "totalMatches" : totalMatches,
    "battingAverage" : totalRuns / totalWickets
  }
}

module.exports = {
  init: init,
  batsmanAverage: batsmanAverage
}
