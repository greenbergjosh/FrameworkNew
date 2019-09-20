var rsConfig = {
  r1: {
    configId: '1C35091A-8504-4D8D-80F8-59A9C546656B',
    type: 'Immediate',
    data: {

    }
  }
};

var surveyStack = {
  grp1: {}
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
    cf.ss.grp1.pageOrder = 'page+2dl';
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
  answerConfig = edw.createConfig(answerStack, rsConfig, [{
    key: ['event'],
    addToWhep: true,
    includeWhep: true,
    duplicate: {
      duplicate: true
    },
    data: {
      event: '4F28AF59-CAEE-4A50-827B-2125DBE163AF',
    }
  }]);

  edw.reportToEdw(questionConfig, function(cf) {
    cf.ss.grp1.pageOrder = 'page+2dl';
    cf.ss.grp1.page = page;
    cf.ss[survey] = {};
    cf.ss.question.questionId = id;
  });
};