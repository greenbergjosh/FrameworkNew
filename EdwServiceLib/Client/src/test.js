var surveyStack = {
  session: {
    pageOrder: 'page+'
  },
  grp1: {

  }
};

var impressionEvent = {
  key: ['event'],
  duplicate: {
    duplicate: true
  },
  data: {
    event: 'impression',
    page: '{page}',
    pageOrder: '{pageOrder}',
    pageCount: '{pageCount}',
    groupPageCount: '{groupPageCount}',
    surveyPageCount: '{surveyPageCount}',
    questionPageCount: '{questionPageCount}',
    answerPageCount: '{answerPageCount}',
    survey: '{survey}',
    question: '{question}'
  }
};

var reportSurvey = function(page, id, nextFn) {
  var surveyConfig = edw.createConfig(surveyStack, {}, [impressionEvent]);

  edw.reportToEdw(surveyConfig, function(cf) {
    cf.ss.session.page = page;
    cf.ss.session.pageCount = '0+';
    cf.ss.grp1.groupPageCount = '0+';
    cf.ss[id] = {
      surveyPageCount: '0+',
      survey: id
    };
  },
  nextFn);
};

var reportSmartPath = function() {
  var surveyConfig = edw.createConfig({
    session: {
      pageOrder: 'page+'
    }
  }, {}, [impressionEvent]);

  edw.reportToEdw(surveyConfig, function(cf) {
    cf.ss.session.page = 'smartPath';
  });
};

var answerConfig = {};

var reportQuestion = function(page, id, nextFn) {
  var survey = edw.getUrlParameter('survey');
  if (!survey) {
    survey = 'American';
  }
  surveyStack[survey] = {};

  var qObj = {};
  qObj['question' + id] = {
    keyPrefix: survey
  };
  
  var questionStack = edw.stackBasedOn(surveyStack, qObj);
  
  var answerStack = edw.stackBasedOn(questionStack, {
    answer: {
      keyPrefix: 'question' + id
    }
  });
  
  var questionConfig = edw.createConfig(questionStack, {}, [impressionEvent]);
  answerConfig[id] = edw.createConfig(answerStack, {}, [{
    key: ['event'],
    duplicate: {
      duplicate: true
    },
    data: {
      event: 'click',
      page: '{page}',
      pageOrder: '{pageOrder}',
      pageCount: '{pageCount}',
      groupPageCount: '{groupPageCount}',
      surveyPageCount: '{surveyPageCount}',
      questionPageCount: '{questionPageCount}',
      answerPageCount: '{answerPageCount}',
      survey: '{survey}',
      question: '{question}',
      answer: '{answer}'
    }
  }]);

  edw.reportToEdw(questionConfig, function(cf) {
    if (page) {
      cf.ss.session.page = page;
      cf.ss.session.pageCount = '0+';
      cf.ss.grp1.groupPageCount = '0+';
    } else {
      cf.ss.session = {};
      cf.ss.grp1 = {};
    }
    
    cf.ss[survey] = {};
    cf.ss['question' + id].questionPageCount = '0+'
    cf.ss['question' + id].question = id;
  },
  nextFn);
};

var createAnswerConfig = function(survey, questionId) {
  var qObj = {};
  qObj['question' + questionId] = {
    keyPrefix: survey
  };
  
  var questionStack = edw.stackBasedOn(surveyStack, qObj);
  
  var answerStack = edw.stackBasedOn(questionStack, {
    answer: {
      keyPrefix: 'question' + questionId
    }
  });
  
  var config = edw.createConfig(answerStack, {}, [impressionEvent]);
  config.ss.session = {};
  config.ss.grp1 = {};
  config.ss.answer.answerPageCount = '0+';
  return config;
};

var reportAnswersImpression = function(survey) {
  var config = createAnswerConfig(survey, 1);
  edw.reportToEdw(config, null,
  function() {
    config = createAnswerConfig(survey, 2);
    edw.reportToEdw(config, null,
    function() {
      config = createAnswerConfig(survey, 3);
      edw.reportToEdw(config, null,
      function() {
        config = createAnswerConfig(survey, 4);
        edw.reportToEdw(config);
      });
    });
  });
};

var nextPage = null;

var reportAnswer = function(questionId, answer) {
  edw.reportToEdw(answerConfig[questionId], function(cf) {
    if (!nextPage) {
      cf.ss.grp1 = {};
      cf.ss.session = {};
    }
    cf.ss.answer.answer = answer;
  }, function() {
    if (nextPage) {
      var survey = edw.getUrlParameter('survey');
      window.location = nextPage + '.html?survey=' + survey;
    } else {
      if (window.location.href.indexOf('full.html') === -1 || questionId === 4) {
        window.location = 'smartPath.html';
      }
    }
  });
};

var setupQuestion = function(page, id, next) {
  nextPage = next;
  window.onload = function() {
    reportQuestion(page, id);
  };
};

var setupSmartPath = function() {
  window.onload = function() {
    reportSmartPath();
  };
};

var reportDomain = function(domain) {
  edw.reportToEdw({
    rs: {
      domain: {
        configId: '1C35091A-8504-4D8D-80F8-59A9C546656B',
        type: 'Immediate',
        data: {
          domain: domain
        }
      }
    }
  }, function() {
    
  }, function() {
    window.location = 'survey.html';
  });
};