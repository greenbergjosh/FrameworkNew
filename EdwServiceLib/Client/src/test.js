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
    event: '294C1DE8-03A7-4DC9-B7C2-74DB8480D803',
    page: '{page}'
  }
};

var reportSurvey = function(page, id) {
  var surveyConfig = edw.createConfig(surveyStack, {}, [impressionEvent]);

  edw.reportToEdw(surveyConfig, function(cf) {
    cf.ss.session.page = page;
    cf.ss.session.pageCount = '0+';
    cf.ss.grp1.pageCount = '0+';
    cf.ss[id] = {
      pageCount: '0+'
    };
  });
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

var answerConfig = null;

var reportQuestion = function(page, id) {
  var survey = edw.getUrlParameter('survey');
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
  answerConfig = edw.createConfig(answerStack, {}, [{
    key: ['event'],
    duplicate: {
      duplicate: true
    },
    data: {
      event: '4F28AF59-CAEE-4A50-827B-2125DBE163AF',
    }
  }]);

  edw.reportToEdw(questionConfig, function(cf) {
    cf.ss.session.page = page;
    cf.ss.session.pageCount = '0+';
    cf.ss.grp1.pageCount = '0+';
    cf.ss[survey] = {};
    cf.ss['question' + id].pageCount = '0+'
    cf.ss['question' + id].id = id;
  });
};

var nextPage = null;

var reportAnswer = function(answer) {
  edw.reportToEdw(answerConfig, function(cf) {
    cf.ss.answer.answer = answer;
  }, function() {
    if (nextPage) {
      var survey = edw.getUrlParameter('survey');
      window.location = nextPage + '.html?survey=' + survey;
    } else {
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