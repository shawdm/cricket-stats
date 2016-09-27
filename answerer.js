var stats = require('./stats.js');

var STATS_SOURCE = 'Cricsheet';
var STATS_SOURCE_URL = 'http://cricsheet.org';

function answer(questionText, interpretaion, callback){
  var response = {};
  response.question = {text:questionText};
  response.answers = [];

  var answer = false;
  answer = answerSpecials(interpretaion);

  if(!answer){
    answer = answerProperties(interpretaion);
  }

  if(answer){
    response.answers.push(answer);
  }

  return callback(false, response);
}

function answerSpecials(interpretation){
  var answer = false;

  console.log('start answer specials');

  if(interpretation.result && interpretation.result.specials && interpretation.result.specials.length > 0){
    var special = extractSpecial(interpretation.result.specials)
    console.log('got a special');
    console.dir(special);

    // TODO currently just assuming single predicte
    var predicatePropertyName = false;
    if(special.predicate && special.predicate.entities && special.predicate.entities.length > 0){
      predicatePropertyName = special.predicate.entities[0]['property name'];
    }

    var subjectId = false;
    if(special['subject instances'] && special['subject instances'].length > 0){
      // TODO assuming just single subject instance
      var subjectInstance = special['subject instances'][0];
      // TODO assuming just single entity
      if(subjectInstance.entities && subjectInstance.entities.length > 0){
          subjectId = subjectInstance.entities[0]._id;
      }

    }

    var objectId = false;
    if(special['object instances'] && special['object instances'].length > 0){
      // TODO assuming just single subject object
      var objectInstance = special['object instances'][0];
      // TODO assuming just single entity
      if(objectInstance.entities && objectInstance.entities.length > 0){
          objectId = objectInstance.entities[0]._id;
      }

    }

    console.log("ppn:" + predicatePropertyName + " sid:" + subjectId + " oid:" + objectId);

    if(predicatePropertyName && subjectId && objectId){

      var playerStats = false;
      if(predicatePropertyName === 'scores against'){
        var players = stats.playersList({team:objectId});
        playerStats = stats.getPlayerStat(players, {player:subjectId}, false, stats.statTotalRuns)
      }
      if(predicatePropertyName === 'batting average against'){
        var players = stats.playersList({team:objectId});
        playerStats = stats.getPlayerStat(players, {player:subjectId}, false, stats.statBattingAverage)
      }
      if(predicatePropertyName === 'matches played against'){
        var players = stats.playersList({team:objectId});
        playerStats = stats.getPlayerStat(players, {player:subjectId}, false, stats.statTotalMatches)
      }
      if(predicatePropertyName === 'balls faced against'){
        var players = stats.playersList({team:objectId});
        playerStats = stats.getPlayerStat(players, {player:subjectId}, false, stats.statBallsFaced)
      }
      if(playerStats){
        answer = {
          result_text: playerStats.stat,
          chatty_text: subjectId + '\'s ' + predicatePropertyName + ' '+ objectId + ' is ' + playerStats.stat,
          source: {
            name:STATS_SOURCE,
            url:STATS_SOURCE_URL
          },
          answer_confidence: 100
        };


        console.log(predicatePropertyName + " is " + playerStats.stat);
      }
    }
    else if(predicatePropertyName && subjectId){
      var players = stats.playersList();
      var playerStats = false;
      if(predicatePropertyName == 'career runs'){
        playerStats = stats.getPlayerStat(players, {player:subjectId}, false, stats.statTotalRuns);
      }
      if(predicatePropertyName == 'batting average'){
        playerStats = stats.getPlayerStat(players, {player:subjectId}, false, stats.statBattingAverage);
      }
      if(predicatePropertyName == 'balls faced'){
        playerStats = stats.getPlayerStat(players, {player:subjectId}, false, stats.statBallsFaced);
      }
      if(predicatePropertyName == 'career matches'){
        playerStats = stats.getPlayerStat(players, {player:subjectId}, false, stats.statTotalMatches);
      }
      if(predicatePropertyName == 'innings'){
        playerStats = stats.getPlayerStat(players, {player:subjectId}, false, stats.statTotalInnings);
      }

      if(playerStats){
        answer = {
          result_text: playerStats.stat,
          chatty_text: subjectId + '\'s ' + predicatePropertyName + ' is ' + playerStats.stat,
          source: {
            name:STATS_SOURCE,
            url:STATS_SOURCE_URL
          },
          answer_confidence: 100
        };


        console.log(predicatePropertyName + " is " + playerStats.stat);
      }
    }
  }

  console.log('end answer specials');

  return answer;
}


function answerProperties(interpretation){
  console.log('start answer properties');

  var answer = false;

  if(interpretation.result && interpretation.result.properties && interpretation.result.properties.length > 0){
    var property = extractProperty(interpretation.result.properties);
    var entityPropertyName = false;

    // TODO currently assuming single property entity, need to cope with multiple
    if(property.entities && property.entities.length > 0){
      entityPropertyName = property.entities[0]['property name'];
    }

    // look for the qualifier and people
    var qualifier = false;
    var person = false;
    if(interpretation.result.instances && interpretation.result.instances.length > 0){
      for(var i=0; i < interpretation.result.instances.length; i++){
        var instance = interpretation.result.instances[i];
        // todo assume single entity in each instance
        if(instance && instance.entities && instance.entities.length > 0){
          var instanceEntity = instance.entities[0];
          if(instanceEntity && instanceEntity._concept){
            if(instanceEntity._concept.indexOf('qualifier') >= 0 && instanceEntity["maps to"]){
              qualifier = instanceEntity["maps to"];
            }
            if(instanceEntity._concept.indexOf('person') >= 0 && instanceEntity["_id"]){
              person = instanceEntity["_id"];
            }
          }
        }
      }
    }

    if(entityPropertyName && qualifier){
      console.log('looking for '+  entityPropertyName + " " + qualifier);

      var players = stats.playersList();
      var playerStats = false;

      if(entityPropertyName === 'career runs'){
          playerStats = stats.getPlayerStat(players, false, qualifier, stats.statTotalRuns);
      }
      else if(entityPropertyName === 'batting average'){
          playerStats = stats.getPlayerStat(players, false, qualifier, stats.statBattingAverage);
      }
      else if(entityPropertyName === 'total outs'){
        playerStats = stats.getPlayerStat(players, false, qualifier, stats.statWicketsLost);
      }
      else if(entityPropertyName === 'career matches'){
        playerStats = stats.getPlayerStat(players, false, qualifier, stats.statTotalMatches);
      }
      else if(entityPropertyName === 'innings'){
        playerStats = stats.getPlayerStat(players, false, qualifier, stats.statTotalInnings);
      }
      else if(entityPropertyName === 'balls faced'){
        playerStats = stats.getPlayerStat(players, false, qualifier, stats.statBallsFaced);
      }


      if(playerStats){
        answer = {
          result_text: playerStats.name,
          chatty_text: playerStats.name + ' has ' + playerStats.stat + ' ' + entityPropertyName + '.',
          source: {
            name:STATS_SOURCE,
            url:STATS_SOURCE_URL
          },
          answer_confidence: 90
        };
      }

    }
    else if(entityPropertyName && person){
      console.log('looking for '+  entityPropertyName + " " + person);

      var players = stats.playersList();
      var playerStats = false;

      if(entityPropertyName === 'innings'){
          playerStats = stats.getPlayerStat(players, {player:person}, false, stats.statTotalInnings);
      }

      if(playerStats){
        answer = {
          result_text: playerStats.stat,
          chatty_text: person + ' has ' + playerStats.stat + ' ' + entityPropertyName + '.',
          source: {
            name:STATS_SOURCE,
            url:STATS_SOURCE_URL
          },
          answer_confidence: 80
        };
      }
    }

  }

  console.log('end answer properties');

  return answer;
}

// return the property that spans the most number of words, the idea being that
// is the most specific one
function extractProperty(properties, order){
  var property = false;

  if(properties && properties.length > 0){
    for(var i=0; i < properties.length; i++){
      var testProperty = properties[i];
      if(!property){
        property = testProperty;
      }
      else if(testProperty['start position'] && testProperty['end position']){
        if((testProperty['end position'] - testProperty['start position']) > (property['end position'] - property['start position'])){
          property = testProperty;
        }
      }
    }
  }

  return property;
}


function extractSpecialTeam(specials, order){
  var special = false;

  if(specials && specials.length > 0){
    for(var i=0; i < specials.length; i++){
      var testSpecial = specials[i];
      if(testSpecial && testSpecial.type && testSpecial.type == 'linked-instance'){
        // TODO now see if it is a team one


        if(!special){
          special = testSpecial;
        }
        else if(testSpecial['start position'] && testSpecial['end position']){
          if((testSpecial['end position'] - testSpecial['start position']) > (special['end position'] - special['start position'])){
            special = testSpecial;
          }
        }
      }
    }
  }

  return special;
}


// return the special that spans the most number of words, the idea being that
// is the most specific one
function extractSpecial(specials, order){
  var special = false;

  if(specials && specials.length > 0){
    for(var i=0; i < specials.length; i++){
      var testSpecial = specials[i];
      if(!special){
        special = testSpecial;
      }
      else if(testSpecial['start position'] && testSpecial['end position']){
        if((testSpecial['end position'] - testSpecial['start position']) > (special['end position'] - special['start position'])){
          special = testSpecial;
        }
      }
    }
  }

  return special;
}


module.exports = {
  answer: answer
}
