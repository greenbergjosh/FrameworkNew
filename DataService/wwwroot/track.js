function callService(url) {
    var ret = {};
    fetch(url, {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
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
        ret = json;
    }).catch(error => {
        ret = {};
    });

return ret;
}
window.callService = callService;