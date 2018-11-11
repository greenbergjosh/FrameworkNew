async function visitorId(url, sessionid, opaque) {
    var fres = [];
    var i = 0;
    while (true) {
        var res = await window.genericFetch(url + '?m=VisitorId&i=' + i + '&sd=' + sessionId + '&op=' + encodeURIComponent(opaque)
            + '&qs=' + encodeURIComponent(window.location.href),
            { method: 'GET', mode: 'cors', credentials: 'include', cache: 'no-cache', redirect: 'follow', referrer: 'no-referrer' },
            'json', '');
        if (!res.url || res.done) break;

        res = await window.handleService(res);
        if (res.saveSession == 'true') {
            var res = await window.genericFetch(url + '?m=SaveSession&md5=' + res.md5 + '&email=' + res.email +
                '&sd=' + sessionId + '&op=' + encodeURIComponent(opaque) + '&qs=' + encodeURIComponent(window.location.href) +
                '&sn=' + res.name,
                { method: 'GET', mode: 'cors', credentials: 'include', cache: 'no-cache', redirect: 'follow', referrer: 'no-referrer' },
                'json', '');
        }
        fres.push(res);
        if (res.done) break;

        i++;
    }
    return fres;
}
window[window.VisitorIdObject].visitorId = visitorId;

async function handleService(service) {
    var response = await window.genericFetch(service.url, service.fetchParms, service.fetchType, service.imgFlag);
    return service.transform && response ?
        { email: getDescendantProp(x, p.email) || '', md5: getDescendantProp(x, p.md5) || ''} :
        { email: '', md5: '' };
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
//document.querySelector('img').src = 'data:image/gif;base64' 
// var docArticle = doc.querySelector('article').innerHTML;

function arrayBufferToBase64(buffer) {
    var binary = '';
    var bytes = [].slice.call(new Uint8Array(buffer));

    bytes.forEach((b) => binary += String.fromCharCode(b));

    return window.btoa(binary);
};

function getDescendantProp(obj, desc) {
    var arr = desc.split('.');
    while (arr.length) {
        obj = obj[arr.shift()];
    }
    return obj;
}