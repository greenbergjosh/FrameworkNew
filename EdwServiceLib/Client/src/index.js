const serverAddress = 'http://localhost:21339';

export const RsTypes = {
  Immediate: "Immediate",
  Checked: "Checked",
  CheckedDetail: "CheckedDetail"
};

export const getRs = async (name, sessionId = null) => {
  return await get(url('rs', sessionId, { name }));
};

export const getOrCreateRs = async (rsType, name, data, sessionId = null) => {
  var j = json(sessionId, {
    name,
    data
  });
  j['rsType'] = rsType;
  return await post(url('rs'), j);
};

export const getEvent = async (reportingSession, sessionId = null) => {
  return await get(url('event', sessionId, { reportingSession }));
};

export const addEvent = async (reportingSessions, data, sessionId = null) => {
  return await post(url('event'), json(sessionId, {
    reportingSessions,
    data
  }));
};

export const getOrCreateConfig = async (data, sessionId = null) => {
  return await post(url('config'), json(sessionId, {
    data
  }));
};

export const getCache = async (name, sessionId = null) => {
  return await get(url('cache', sessionId, { name }));
};

export const addCache = async (name, data, sessionId = null) => {
  return await post(url('cache'), json(sessionId, {
    name,
    data
  }));
};

export const getScope = async (sessionId = null) => {
  return await get(url('scope', sessionId));
};

export const setScope = async (scope, sessionId = null) => {
  return await post(url('scope'), json(sessionId, {
    scope
  }));
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

const get = async (url) => {
  const response = await fetch(url, { credentials: 'include' });
  return await response.json();
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