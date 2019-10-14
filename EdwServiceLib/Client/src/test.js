var baseStack = {
  session: {
    pageOrder: 'page+'
  },
  grp1: {

  }
};

var createEventData = function(event) {
  return {
    event: event,
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
  };
};

var createEventConfig = function(event) {
  return {
    key: ['event'],
    duplicate: {
      duplicate: true
    },
    data: createEventData(event)
  };
};

var impressionEvent = createEventConfig('impression');
var clickEvent = createEventConfig('click');

var reportSurvey = function(page, id, nextFn) {
  var surveyConfig = edw.createConfig(baseStack, {}, [impressionEvent, clickEvent]);

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
  }, {}, [impressionEvent, clickEvent]);

  edw.reportToEdw(surveyConfig, function(cf) {
    cf.ss.session.page = 'smartPath';
  }, function() {
    edw.es(); // End session
  });
};

var answerConfig = {};

var reportQuestion = function(page, id, nextFn) {
  var survey = edw.getUrlParameter('survey');
  if (!survey) {
    survey = 'American';
  }
  baseStack[survey] = {};

  var qObj = {};
  qObj['question' + id] = {
    keyPrefix: survey
  };
  
  var questionStack = edw.stackBasedOn(baseStack, qObj);
  
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
  
  var questionStack = edw.stackBasedOn(baseStack, qObj);
  
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
    data: createEventData('impression')
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

var reportDomain = function(domain, nextFn) {
  edw.reportToEdw({
    rs: {
      partial: {
        configId: 'A0465746-CC44-4F66-B9FB-66EDE6619B47',
        type: 'Immediate',
        data: {
          domain: domain
        }
      }
    }
  }, 
  function() {},
  nextFn);
};

var setupOrderGroup = function() {
  window.onload = function() {
    var config = edw.createConfig(baseStack, {}, [impressionEvent, clickEvent]);
    edw.reportToEdw(config, function(cf) {
      cf.ss.session.page = 'OrderGroup';
    });
  };
};

var setupPage = function(page) {
  window.onload = function() {
    var config = edw.createConfig(baseStack, {}, [impressionEvent, clickEvent]);
    edw.reportToEdw(config, function(cf) {
      cf.ss.session.page = page;
      cf.ss[page] = {};
    });
  };
};