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

/*
  {
    "question": {
      "text": "what is underspin?"
    },
    "answers": [
      {
        "result_text": "Spin of a ball where the top of the ball rotates away...",
        "chatty_text": "According to wikipedia ‘underspin’ means: Spin of a ball...",
        "source": {
          "name": "wikipedia:Glossary_of_tennis_terms",
          "url": "http:\/\/en.wikipedia.org\/wiki\/Glossary_of_tennis_terms"
        },
        "answer_confidence": 100
      }
    ]
  }
  */


  return callback(false, response);
}

function answerSpecials(interpretation){
  var answer = false;

  // TODO currently just answering with single special, need to cope with multiple
  if(interpretation.result && interpretation.result.specials && interpretation.result.specials.length > 0){
    var special = interpretation.result.specials[0];
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
    console.log("ppn:" + predicatePropertyName + " sid:" + subjectId);

    if(predicatePropertyName && subjectId){
      var players = stats.playersList();
      var playerStats = false;
      if(predicatePropertyName == 'batting average'){
        playerStats = stats.getPlayerStat(players, {player:subjectId}, false, stats.statBattingAverage);
      }
      if(predicatePropertyName == 'balls faced'){
        playerStats = stats.getPlayerStat(players, {player:subjectId}, false, stats.statBallsFaced);
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

  return answer;
}


function answerProperties(interpretation){
  var answer = false;

  console.log('attempting answer via properties');

  // TODO currently just answering with single propertt, need to cope with multiple
  if(interpretation.result && interpretation.result.properties && interpretation.result.properties.length > 0){
    var property = interpretation.result.properties[0];
    var entityPropertyName = false;

    // TODO currently assuming single property entity, need to cope with multiple
    if(property.entities && property.entities.length > 0){
      entityPropertyName = property.entities[0]['property name'];
    }

    // look for the qualifier
    var qualifier = false;
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
          }
        }
      }
    }

    //console.log('qualifier: ' + qualifier);

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
      else if(entityPropertyName === 'batting innings'){
        //playerStats = stats.getPlayerStat(players, false, qualifier, stats.statTotalInnings);
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

  }

  return answer;
}


module.exports = {
  answer: answer
}
