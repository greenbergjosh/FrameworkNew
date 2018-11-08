async function visitorId(url, sessionid, opaque) {
  var res = {};
  var i = 0;
  while (true)
  {
     var res = await window.genericFetch(url + '?m=VisitorId&i=' + i + '&sd=' + sessionId + '&op=' + encodeURIComponent(opaque)
	 + '&qs=' + encodeURIComponent(window.location.href),
         { method: "GET", mode: "cors", credentials: "include", cache: "no-cache", redirect: "follow", referrer: "no-referrer"},
         "json", "");
     if (!res.url) break;

	// test
	if (res.name == "TestService0" || res.name == "TestService1") { i++; continue; }
	// end test

     res = await window.handleService(res);
     if (res.saveSession == "true")
     {
       var res = await window.genericFetch(url + '?m=SaveSession&md5=' + res.md5 + '&email=' + res.email +
           '&sd=' + sessionId + '&op=' + encodeURIComponent(opaque) + '&qs=' + encodeURIComponent(window.location.href) + 
           '&sn=' + res.name,
           { method: "GET", mode: "cors", credentials: "include", cache: "no-cache", redirect: "follow", referrer: "no-referrer"},
           "json", "");
     }
     if (res.md5) break;

     i++;
  }
  return res;
}
window.visitorId = visitorId;

async function handleService(service) {
  var response = await window.genericFetch(service.url, service.fetchParms, service.fetchType, service.imgFlag);
  if (service.name == "TestService0") {
    return { "name":service.name, "saveSession":"true", "email":response.t0email, "md5":response.t0md5 };
    // var docArticle = response.querySelector('article').innerHTML;
  }
  else if (service.name == "TestService1") {
    return { "name":service.name, "saveSession":"true", "email":response.t1email, "md5":response.t1md5 };
    //document.querySelector('img').src = response;
  }
  else if (service.name == "Tower") {
    return { "name":service.name, "saveSession":"false", "email":response.email, "md5":response.md5 };
    // switch to the line above in production
    //return { "name":service.name, "saveSession":"false", "email":"testtower@tower.com", "md5":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" };
  }
  else {
    return { "email":"", "md5":"" };
  }
}

async function genericFetch(url, fetchParms, fetchType, imgFlag) {
    return await fetch(url, fetchParms)
    .then(response => {
      if (response.ok) {
        return (fetchType == "base64") ? response.arrayBuffer() : response.text();
      }
      throw new Error('Network response was not ok.');
    })
    .then(data => {
        if (fetchType == "json") return JSON.parse(data);
	else if (fetchType == "base64") return imgFlag + arrayBufferToBase64(data);
        else if (fetchType == "html") {
          var parser = new DOMParser();
          return parser.parseFromString(data, "text/html");
        }  
        else return data;
    }).catch(error => {
        return "";
    });
}
window.genericFetch = genericFetch;
//document.querySelector('img').src = 'data:image/gif;base64' 
// var docArticle = doc.querySelector('article').innerHTML;

function arrayBufferToBase64(buffer) {
  var binary = '';
  var bytes = [].slice.call(new Uint8Array(buffer));

  bytes.forEach((b) => binary += String.fromCharCode(b));

  return window.btoa(binary);
};


async function callService(url) {
    return await fetch(url, {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        //credentials: "include",
        //headers: {
            //"Content-Type": "application/json",
            //"Accept": "application/json"
        //},
        redirect: "follow",
        referrer: "no-referrer"
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Network response was not ok.');
    })
    .then(json => {
	return json;
    }).catch(error => {
        return {};
    });
}
window.callService = callService;

function transformResponse(service, response)
{
  if (service.name == "service0") {
    return { "email":response.t0email, "md5":response.t0md5 };
  }
  else if (service.name == "service1") {
    return { "email":response.t1email, "md5":response.t1md5 };
  }
  else {
    return { "email":"", "md5":"" };
  }
}
window.transformResponse = transformResponse;