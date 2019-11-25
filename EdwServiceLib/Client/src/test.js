var createConfig = function(ss, rs, ev = []) {
  return {
    enableLogging: enableLogging,
    rs: rs,
    ss: ss,
    ev: ev
  };
};

var reportToEdw = function(config, customizeConfig = function(){}, postConfig = function(){}) {
  customizeConfig(config);
  edw.cf(config)
    .then(r => postConfig(r))
    .catch(reason => console.log('Error! Reason: ' + reason));
};

var getUrlParameter = function(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  var results = regex.exec(location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

var stackBasedOn = function(base, values) {
  return Object.assign({}, JSON.parse(JSON.stringify(base)), values);
};

var enableLogging = true;

var rsconfig = {
  r1: {
    configId: 'EDA8BF65-C8CF-4B86-8BB1-81EE66F80ED2',
    type: 'Immediate',
    data: {

    }
  }
};

var surveyStack = {
  grp1: {
    pageOrder: 'page+'
  }
};

var splashAndImpressionEvents = [
  {
    event: 'splash'
  }/*,
  {
    event: 'impression'
  }*/
];

var reportSurvey = function(page, id) {
  surveyStack[id] = {};
  var surveyConfig = createConfig(surveyStack, rsconfig, splashAndImpressionEvents);

  reportToEdw(surveyConfig, function(cf) {
    cf.ss.grp1.page = page;
    cf.ss[id].surveyId = id;
  });
};

var answerConfig = null;

var reportQuestion = function(page, id) {
  var survey = getUrlParameter('survey');
  surveyStack[survey] = {};
  
  var questionStack = stackBasedOn(surveyStack, {
    question: {
      keyPrefix: survey
    }
  });
  
  var answerStack = stackBasedOn(questionStack, {
    answer: {
      keyPrefix: 'question'
    }
  });
  
  var questionConfig = createConfig(questionStack, rsconfig, splashAndImpressionEvents);
  answerConfig = createConfig(answerStack, rsconfig, [{event: 'click'}]);

  reportToEdw(questionConfig, function(cf) {
    cf.ss.grp1.page = page;
    cf.ss.question.questionId = id;
  });
};