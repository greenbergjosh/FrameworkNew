const serverAddress = 'http://localhost:21339';

export const rsTypes = {
  Immediate: "Immediate",
  Checked: "Checked",
  CheckedDetail: "CheckedDetail"
};

let stack = [];
let isLogging = true;

export const enableLogging = (enable) => {
  isLogging = enable;
};

export const sfAllow = async (names, sessionId = null) => {
  stack = names;
  for (const name of names) {
    await getOrCreateStackFrame(name, {}, sessionId);
  }
};

export const cf = async (data, sessionId = null) => {
  if (data.enableLogging === true || data.enableLogging === false) {
    enableLogging(data.enableLogging);
  }
  stack = [];

  const result = await post(url('cf'), {
    sessionId,
    data
  });

  if (result.ss) {
    for (const stackFrame in result.ss) {
      stack.push(stackFrame);
    }
  }

  if (isLogging) {
    console.log(JSON.stringify(result, undefined, 2));
  }
  return result;
};

export const sf = async (name, data, sessionId = null) => {
  const result = await post(url('sf'), {
    sessionId,
    name,
    data,
    stack
  });
  //TODO: Get sf name from result and push on stack
  if (isLogging) {
    console.log('StackFrame: ' + JSON.stringify(result, undefined, 2));
  }
  return result;
};

export const ss = async (name, data, sessionId = null) => {
  const result = await post(url('ss'), {
    sessionId,
    name,
    data
  });
  if (isLogging) {
    console.log('StackFrame: ' + JSON.stringify(result, undefined, 2));
  }
  return result;
};

export const rs = async (type, name, configId, data, sessionId = null) => {
  const result = await post(url('rs'), {
    sessionId,
    stack,
    name,
    configId,
    data,
    type
  });
  if (isLogging) {
    console.log('Rs: ' + JSON.stringify(result, undefined, 2));
  }
  return result;
};

export const ev = async (data, nextFn = null, sessionId = null) => {
  const result = await post(url('ev'), {
    sessionId,
    data
  });
  if (isLogging) {
    console.log('Event: ' + JSON.stringify(result, undefined, 2));
  }
  if (nextFn) {
    nextFn();
  }
  return result;
};

export const es = async (sessionId = null) => {
  const result = await post(url('es'), {
    sessionId
  });
  if (isLogging) {
    console.log('onPop: ' + JSON.stringify(result, undefined, 2));
  }
  return result;
};

const url = (path, sessionId, params) => {
  const url = new URL(serverAddress + '/' + path);
  if (sessionId) {
    url.searchParams.append('sessionId', sessionId);
  }
  if (params) {
    for (const param in params) {
      url.searchParams.append(param, params[param]);
    }
  }
  return url;
};

const post = async (url, json) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(json)
  });
  return await response.json();
};

export const createConfig = (st, rs, ev = []) => {
  return {
    enableLogging: isLogging,
    rs: rs,
    st: ss,
    ev: ev
  };
};

export const reportToEdw = (config, customizeConfig = () => {}, postConfig = () => {}, sessionId = null) => {
  if (customizeConfig) {
    customizeConfig(config);
  }
  return edw.cf(config, sessionId)
    .then(r => {
      if (postConfig) {
        postConfig(r);
      }
    })
    .catch(reason => console.log('Error! Reason: ' + reason));
};

export const getUrlParameter = (name) => {
  var url = new URL(window.location.href);
  return url.searchParams.get(name);
};

export const stackBasedOn = (base, values) => {
  return Object.assign({}, JSON.parse(JSON.stringify(base)), values);
};

export const forwardUrlParams = (element) => {
  var newSearch = window.location.search;
  var url = new URL(element.href);
  if (url.search.length > 0 && url.search[0] == '?' && newSearch.length > 0)
    newSearch = '&' + newSearch.substr(1);

  element.href = element.href + newSearch;
};