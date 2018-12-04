async function visitorId(url, opaque, future) {
    var success = 0;
    opaque = { ...(opaque || {}), qs: encodeURIComponent(window.location.href), i: 0, sd: '', succ: 0 };
    while (true) {   
        var res = await window.genericFetch(url + '?m=VisitorId&op=' + btoa(JSON.stringify(opaque)),
            { method: 'GET', mode: 'cors', credentials: 'include', cache: 'no-cache', redirect: 'follow', referrer: 'no-referrer' },
            'json', '');
        if (!(res.url || res.scriptUrl) || res.done) break;

        var sres = {};
        if (res.scriptUrl) {
            await load(res.scriptUrl, 'Segment'+res.idx);
            for (var x in res.strategy) {
                var f = res.strategy[x].f;
                var a = res.strategy[x].a;
                var exf = getDescendantProp(window[res.globalObject], f);
                exf(...a);
            }
            success = 1;
        }
        else {
            sres = await window.handleService(res);
            success = (res.md5 || res.email) ? 1 : 0;
        }

        opaque = {
            ...opaque, i: res.idx, sd: res.sesid, succ: success, md5: sres.md5,
            e: btoa(sres.email), vieps: res.vieps
        }; 
        
        if (res.saveSession == 'true') {
            var res = await window.genericFetch(url + '?m=SaveSession&op=' + btoa(JSON.stringify(opaque)),
                { method: 'GET', mode: 'cors', credentials: 'include', cache: 'no-cache', redirect: 'follow', referrer: 'no-referrer' },
                'json', '');  
        }
    }
}
window[window.VisitorIdObject].visitorId = visitorId;

async function handleService(service) {
    var response = await window.genericFetch(service.url, service.fetchParms, service.fetchType, service.imgFlag);
    return (service.transform && response) ?
        {
            email: getDescendantProp(response, service.transform.email) || '',
            md5: getDescendantProp(response, service.transform.md5) || '',
            saveSession: service.saveSession,
            name: service.name
        } :
        { email: '', md5: '', name: service.name, saveSession: 'false' };
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

//https://dev.to/timber/wait-for-a-script-to-load-in-javascript-579k
async function loadScript(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.type = 'text/javascript'
        script.async = true
        script.src = url

        const el = document.getElementsByTagName('script')[0]
        el.parentNode.insertBefore(script, el)

        script.addEventListener('load', () => {
            this.isLoaded = true
            resolve(script)
        })

        script.addEventListener('error', () => {
            reject(new Error('Failed to load.'))
        })
    })
}

async function load(script, global) {
    return new Promise(async (resolve, reject) => {
        if (!this.isLoaded) {
            try {
                await this.loadScript(script)
                resolve(window[global])
            } catch (e) {
                reject(e)
            }
        } else {
            resolve(window[global])
        }
    })
}