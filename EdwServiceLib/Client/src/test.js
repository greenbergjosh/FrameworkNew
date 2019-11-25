var rsConfig = {
  r1: {
    configId: '1C35091A-8504-4D8D-80F8-59A9C546656B',
    type: 'Immediate',
    data: {

    }
  }
};

var surveyStack = {
  session: {
    pageOrder: 'page+'
  },
  grp1: {
    pageCount: "0+"
  }
};

var splashAndImpressionEvents = [
  {
    key: ['event'],
    data: {
      event: '294C1DE8-03A7-4DC9-B7C2-74DB8480D803',
      page: '{page}'
    }
  }
];

var reportSurvey = function(page, id) {
  var surveyConfig = edw.createConfig(surveyStack, rsConfig, splashAndImpressionEvents);

  edw.reportToEdw(surveyConfig, function(cf) {
    cf.ss.session.page = page;
    cf.ss[id] = {
      pageCount: "0+"
    };
  });
};

var answerConfig = null;

var reportQuestion = function(page, id) {
  var survey = edw.getUrlParameter('survey');
  surveyStack[survey] = {};

  var qObj = {};
  qObj['question' + id] = {
    keyPrefix: survey,
    pageCount: "0+"
  };
  
  var questionStack = edw.stackBasedOn(surveyStack, qObj);
  
  var answerStack = edw.stackBasedOn(questionStack, {
    answer: {
      keyPrefix: 'question' + id
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
    cf.ss.session.page = page;
    cf.ss[survey] = {};
    cf.ss['question' + id].id = id;
  });
};