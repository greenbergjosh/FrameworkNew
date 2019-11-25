var rsConfig = {
  surveyRs: {
    configId: '1C35091A-8504-4D8D-80F8-59A9C546656B',
    type: 'Checked',
    data: {

    }
  }
};

var surveyStack = {
  session: {
    pageOrder: 'page+'
  },
  grp1: {
    
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
    cf.ss.session.pageCount = '0+';
    cf.ss[id] = {
      pageCount: '0+'
    };
  });
};

var reportSmartPath = function() {
  var config = edw.createConfig({}, {}, []);

  edw.reportToEdw(config, function(cf) {
    cf.ss.session = {
      page: 'smarthPath',
      pageCount: '0+'
    };
    cf.rs.smartPathRs =  {
      configId: 'BE513B78-3F4B-4262-86E8-ADF17C0CBCEE',
      type: 'Immediate',
      data: {
        pageCount: '{pageCount}',
        pageOrder: '{pageOrder}'
      }
    }
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
    cf.ss.session.pageCount = '0+';
    cf.ss[survey] = {};
    cf.ss['question' + id].pageCount = '0+'
    cf.ss['question' + id].id = id;
  });
};