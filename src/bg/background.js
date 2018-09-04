window.browser = (function () {
    return window.msBrowser ||
        window.browser ||
        window.chrome;
})();
// TODO: remove Cookie header
var requiredHeaders = [
    {
        found: false,
        name: 'x-csrf-token',
        header: {}
    },
    {
        found: false,
        name: 'Cookie',
        header: {}
    },
    {
        found: false,
        name: 'authorization',
        header: {}
    }
];
// Listener
window.browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    // color the browser icon
    window.browser.pageAction.show(sender.tab.id);
    if (request.funcName === "getAuth") {
        // run the following only when bookmark is clicked
        var headerNames_1 = requiredHeaders.map(function (h) { return h.name; });
        window.browser.webRequest.onBeforeSendHeaders.addListener(function getAllHeaders(details) {
            // check all available headers for required headers
            for (var i = 0; i < details.requestHeaders.length; ++i) {
                console.log(details.requestHeaders[i]);
                if (headerNames_1.indexOf(details.requestHeaders[i].name) > -1) {
                    var pos = headerNames_1.indexOf(details.requestHeaders[i].name);
                    requiredHeaders[pos].found = true;
                    requiredHeaders[pos].header = details.requestHeaders[i];
                }
            }
            // check if we got all required headers,
            // if positive, remove listener and send response
            if (requiredHeaders.every(function (a) { return a.found == true; })) {
                window.browser.webRequest.onBeforeSendHeaders.removeListener(getAllHeaders);
                sendResponse({ headers: requiredHeaders.map(function (h) { return h.header; }) });
            }
        }, { urls: ["https://*.twitter.com/*"] }, ["requestHeaders"]);
        return true;
    }
});
