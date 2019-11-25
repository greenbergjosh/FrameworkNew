const serverAddress = 'http://localhost:21339';

export const rsTypes = {
  Immediate: "Immediate",
  Checked: "Checked",
  CheckedDetail: "CheckedDetail"
};

let stack = [];
let isLogging = false;

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
  enableLogging(data.enableLogging);
  
  if (data.ss) {
    stack = [];
    for(const stackFrame in ss) {
      stack.push(stackFrame);
    }
  }

  const result = await post(url('cf'), {
    sessionId,
    data
  });
  if (isLogging) {
    console.log('Config: ' + JSON.stringify(result));
  }
  return result;
};

export const sf = async (name, data, sessionId = null) => {
  const result = await post(url('sf'), {
    sessionId,
    name,
    data
  });
  if (isLogging) {
    console.log('StackFrame: ' + JSON.stringify(result));
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
    console.log('StackFrame: ' + JSON.stringify(result));
  }
  return result;
};

export const rs = async (type, name, configId, data, sessionId = null) => {
  const result = await post(url('rs'), {
    sessionId,
    name,
    configId,
    data,
    type
  });
  if (isLogging) {
    console.log('Rs: ' + JSON.stringify(result));
  }
  return result;
};

export const ev = async (data, sessionId = null) => {
  const result = await post(url('ev'), {
    sessionId,
    stack,
    data
  });
  if (isLogging) {
    console.log('Event: ' + JSON.stringify(response));
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