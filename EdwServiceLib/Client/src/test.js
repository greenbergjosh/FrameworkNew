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
    surveyId: '{survey}',
    questionId: '{question}',
    answerId: '{answerId}'
  }
};

var clickEvent = {
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
    surveyId: '{survey}',
    questionId: '{question}',
    answerId: '{answerId}'
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
  }, function() {
    edw.es();
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
  answerConfig[id] = edw.createConfig(answerStack, {}, [clickEvent]);

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

var createAnswerConfig = function(survey, questionId, answerId) {
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
  
  var config = edw.createConfig(answerStack, {}, [{
    key: ['event','answerId'],
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
      surveyId: '{survey}',
      questionId: '{question}',
      answerId: '{answerId}'
    }
  }]);
  config.ss.session = {};
  config.ss.grp1 = {};
  config.ss.answer.answerId = answerId;
  config.ss.answer.answerPageCount = '0+';
  return config;
};

var reportAnswersImpression = function() {
  var survey = edw.getUrlParameter('survey');
  if (!survey) {
    survey = 'American';
  }
  edw.reportToEdw(createAnswerConfig(survey, 1, 1), null,
  function() {
    edw.reportToEdw(createAnswerConfig(survey, 1, 2), null,
    function() {
      edw.reportToEdw(createAnswerConfig(survey, 1, 3), null,
      function() {
        edw.reportToEdw(createAnswerConfig(survey, 1, 4));
      });
    });
  });
};

var nextPage = null;

var reportAnswer = function(questionId, answer) {
  edw.reportToEdw(answerConfig[questionId], function(cf) {
    cf.ss.grp1 = {};
    cf.ss.session = {};
    cf.ss.answer.answer = answer;
  }, function() {
    if (nextPage) {
      var survey = edw.getUrlParameter('survey');
      if (!survey) {
        survey = 'American';
      }
      window.location = nextPage + '.html?survey=' + survey;
    } else if (window.location.href.indexOf('full.html') === -1 || questionId === 4) {
      window.location = 'smartPath.html';
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

var reportDomain = function(domain, configId, nextFn) {
  edw.reportToEdw({
    rs: {
      /*full: {
        configId: '46D13674-95C8-4CD0-A21A-2EFA513FB8B4',
        type: 'Immediate',
        data: {
          domain: domain
        }
      },*/
      partial: {
        configId: configId,
        type: 'Immediate',
        data: {
          domain: domain
        }
      }/*,
      paged: {
        configId: '9CC89491-9EB7-4899-BDEC-5213E01AFAFE',
        type: 'Immediate',
        data: {
          domain: domain
        }
      }*/
    }
  }, 
  function() {},
  nextFn);
};

var orderGroupStack = {
  session: {
    pageOrder: 'page+'
  },
  grp1: {

  }
};

var setupOrderGroup = function() {
  window.onload = function() {
    reportOrderGroup();
  };
};

var reportOrderGroup = function() {
  var config = edw.createConfig(orderGroupStack, {}, [impressionEvent, clickEvent]);
  edw.reportToEdw(config, function(cf) {
    cf.ss.session.page = 'OrderGroup';
  });
};

var setupPage = function(page) {
  window.onload = function() {
    reportPage(page);
  };
};

var reportPage = function(page) {
  var config = edw.createConfig(orderGroupStack, {}, [impressionEvent, clickEvent]);
  edw.reportToEdw(config, function(cf) {
    cf.ss.session.page = page;
    cf.ss[page] = {};
  });
};