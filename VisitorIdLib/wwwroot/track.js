let lastUrlUsed = null;
let lastOpaqueUsed = null;

async function visitorId(url, opaque, future) {
    lastUrlUsed = url;
    
    opaque = { ...(opaque || {}), qs: encodeURIComponent(window.location.href), slot: '0', page: '0', sd: '', succ: '0' };
    lastOpaqueUsed = opaque;

    await window.genericFetch(url + '?m=Initialize&op=' + base64UrlSafe(JSON.stringify(opaque)),
        { method: 'GET', mode: 'cors', credentials: 'include', cache: 'no-cache', redirect: 'follow', referrer: 'no-referrer' },
        'json', '');
    let bootstrap = 1;
    while (true) {
        let res = await window.genericFetch(url + '?m=VisitorId&bootstrap=' + bootstrap + '&op=' + base64UrlSafe(JSON.stringify(opaque)),
            { method: 'GET', mode: 'cors', credentials: 'include', cache: 'no-cache', redirect: 'follow', referrer: 'no-referrer' },
            'json', '');
        bootstrap = 0;

        if (res.done || !(res.config && (res.config.SaveSession === "false" || res.config.Url || res.config.ScriptUrl))) break;
        let sres = {};

        let providerFailed = false;
        try {
            if (res.config.ScriptUrl) {
                await load(res.config.ScriptUrl, 'Segment' + res.config.slot);
                for (let x in res.config.Strategy) {
                    let f = res.config.Strategy[x].f;
                    let a = res.config.Strategy[x].a;
                    if (f === undefined) continue;
                    let exf = getDescendantProp(window[res.config.GlobalObject], f);
                    exf(...a);
                }
            }
            else if (res.config.Url) {
                sres = await window.handleService(res);
            } else {
                sres = res;
            }
        } catch(e) {
            providerFailed = true;
        }

        opaque = {
            ...opaque, slot: res.slot, page: res.page, sd: res.sid, eml: sres.email,
            md5: sres.md5, e: base64UrlSafe(sres.email || ''), isAsync: res.isAsync, vieps: res.vieps, md5pid: res.md5pid, tjsv: "3", pfail: providerFailed, pfailSlot: res.slot, pfailPage: res.page
        };

        lastOpaqueUsed = opaque;

        if (res.config.SaveSession === 'true') {
            res = await window.genericFetch(url + '?m=SaveSession&op=' + base64UrlSafe(JSON.stringify(opaque)),
                { method: 'GET', mode: 'cors', credentials: 'include', cache: 'no-cache', redirect: 'follow', referrer: 'no-referrer' },
                'json', '');
            opaque.eml = res.email;
            opaque.md5 = res.md5;
        }

        opaque.slot++;
        opaque.page++;

        lastOpaqueUsed = opaque;
    }
}

window[window.visitorIdObject].visitorId = visitorId;
window[window.visitorIdObject].emailSubmitted = emailSubmitted;

async function emailSubmitted(email) {
    res = await window.genericFetch(url + '?m=emailSubmitted&email=' + base64UrlSafe(email) + '&op=' + base64UrlSafe(JSON.stringify(opaque)),
        { method: 'GET', mode: 'cors', credentials: 'include', cache: 'no-cache', redirect: 'follow', referrer: 'no-referrer' },
        'json', '');
}

async function handleService(res) {
    let response = await window.genericFetch(res.config.Url, res.config.FetchParms, res.config.FetchType, res.config.ImgFlag);

    if (response) {
        if (res.config.Transform) {
            return {
                email: getDescendantProp(response, res.config.Transform.email) || '',
                md5: getDescendantProp(response, res.config.Transform.md5) || '',
                saveSession: res.config.SaveSession
            };
        } else return { ...response, saveSession: res.config.SaveSession };
    } else return { email: '', md5: '', saveSession: 'false' };
}

async function genericFetch(url, fetchParms, fetchType, imgFlag) {
    return await fetch(url, fetchParms)
        .then(response => {
            if (response.ok) {
                return (fetchType === "base64") ? response.arrayBuffer() : response.text();
            }
            throw new Error('Network response was not ok.');
        })
        .then(data => {
            if (fetchType === "json") return JSON.parse(data);
            else if (fetchType === "base64") return imgFlag + arrayBufferToBase64(data);
            else if (fetchType === "html") {
                let parser = new DOMParser();

                return parser.parseFromString(data, "text/html");
            }
            else return data;
        }).catch(error => {
            return "";
        });
}

function base64UrlSafe(s) {
    s = btoa(s);
    return s.replace("+", '-').replace("/", '_').replace("=", '~');
}

function arrayBufferToBase64(buffer) {
    let binary = '';
    let bytes = [].slice.call(new Uint8Array(buffer));

    bytes.forEach((b) => binary += String.fromCharCode(b));

    return window.btoa(binary);
}

function getDescendantProp(obj, desc) {
    let arr = desc.split('.');

    while (arr.length) {
        obj = obj[arr.shift()];
    }
    return obj;
}

//https://dev.to/timber/wait-for-a-script-to-load-in-javascript-579k
async function loadScript(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.src = url;

        const el = document.getElementsByTagName('script')[0];
        el.parentNode.insertBefore(script, el);

        script.addEventListener('load',
            () => {
                this.isLoaded = true;
                resolve(script);
            });

        script.addEventListener('error',
            () => {
                reject(new Error('Failed to load.'));
            });
    });
}

async function load(script, global) {
    return new Promise(async (resolve, reject) => {
        if (!this.isLoaded) {
            try {
                await this.loadScript(script);
                resolve(window[global]);
            } catch (e) {
                reject(e);
            }
        } else {
            resolve(window[global]);
        }
    });
}
