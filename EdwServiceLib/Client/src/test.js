var rsConfig = {
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
    key: ['event'],
    data: {
      event: '294C1DE8-03A7-4DC9-B7C2-74DB8480D803',
      page: '{page}'
    }
  }/*,
  {
    key: ['event'],
    data: {
      event: 'impression'
    }
  }*/
];

var reportSurvey = function(page, id) {
  var surveyConfig = edw.createConfig(surveyStack, rsConfig, splashAndImpressionEvents);

  edw.reportToEdw(surveyConfig, function(cf) {
    cf.ss.grp1.page = page;
    cf.ss[id] = {};
  });
};

var answerConfig = null;

var reportQuestion = function(page, id) {
  var survey = edw.getUrlParameter('survey');
  surveyStack[survey] = {};
  
  var questionStack = edw.stackBasedOn(surveyStack, {
    question: {
      keyPrefix: survey
    }
  });
  
  var answerStack = edw.stackBasedOn(questionStack, {
    answer: {
      keyPrefix: 'question'
    }
  });
  
  var questionConfig = edw.createConfig(questionStack, rsConfig, splashAndImpressionEvents);
  answerConfig = edw.createConfig(answerStack, rsConfig, [{event: '4F28AF59-CAEE-4A50-827B-2125DBE163AF'}]);

  edw.reportToEdw(questionConfig, function(cf) {
    cf.ss.grp1.page = page;
    cf.ss[survey] = {};
    cf.ss.question.questionId = id;
  });
};