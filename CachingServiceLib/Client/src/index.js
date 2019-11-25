const serverAddress = 'http://localhost:21339';

export const getRs = async (name, sessionId) => {
  return await get(url('rs', sessionId, { name }));
};

export const addRs = async (name, data, sessionId) => {
  return await post(url('rs'), json(sessionId, {
    name,
    data
  }));
};

export const getEvent = async (reportingSession, sessionId) => {
  return await get(url('event', sessionId, { reportingSession }));
};

export const addEvent = async (reportingSessions, data, sessionId) => {
  return await post(url('event'), json(sessionId, {
    reportingSessions,
    data
  }));
};

export const getCache = async (name, sessionId) => {
  return await get(url('cache', sessionId, { name }));
};

export const addCache = async (name, data, sessionId) => {
  return await post(url('cache'), json(sessionId, {
    name,
    data
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

addRs('test', {test: 'test'})
  .then(t => getRs('test'))
  .then(t => console.log('Response: ' + t))
  .catch(reason => console.log('Error! Reason: ' + reason));