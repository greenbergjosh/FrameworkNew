const serverAddress = 'http://localhost:21339';

export const RsTypes = {
  Immediate: "Immediate",
  Checked: "Checked",
  CheckedDetail: "CheckedDetail"
};

let stack = [];
let isLogging = false;

var logStackFrame = function(response) {
  if (isLogging) {
    console.log('Scope: ' + JSON.stringify(response));
  }
};

var logRs = function(response) {
  if (isLogging) {
    console.log('Rs: ' + JSON.stringify(response));
  }
};

var logEvent = function(response) {
  if (isLogging) {
    console.log('Event: ' + JSON.stringify(response));
  }
};

export const enableLogging = (enable) => {
  isLogging = enable;
};

export const stackFrameAllow = (names) => {
  stack = names;
};

export const getOrCreateRs = async (rsType, name, data, sessionId = null) => {
  const j = json(sessionId, {
    stack,
    name,
    data
  });
  j['rsType'] = rsType;
  const result = await post(url('rs'), j);
  logRs(result);
  return result;
};

export const addEvent = async (reportingSessions, data, sessionId = null) => {
  const result = await post(url('event'), json(sessionId, {
    stack,
    reportingSessions,
    data
  }));
  logEvent(result);
  return result;
};

export const getOrCreateConfig = async (data, sessionId = null) => {
  return await post(url('config'), json(sessionId, {
    data
  }));
};

export const setStackFrame = async (name, data, sessionId = null) => {
  const result = await post(url('ss'), json(sessionId, {
    name,
    data
  }));
  logStackFrame(result);
  return result;
};

export const getOrCreateStackFrame = async (name, data, sessionId = null) => {
  const result = await post(url('sf'), json(sessionId, {
    name,
    data
  }));
  logStackFrame(result);
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

const json = (sessionId, json) => {
  if (sessionId) {
    json.sessionId = sessionId;
  }
  return json;
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