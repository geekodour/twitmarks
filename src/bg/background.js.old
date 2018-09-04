window.browser = (function () {
  return window.msBrowser ||
    window.browser ||
    window.chrome;
})();

// TODO: remove Cookie header
const requiredHeaders = [
  {
    found: false,
    name: 'x-csrf-token',
    stuff: {}
  },
  {
    found: false,
    name: 'Cookie',
    stuff: {}
  },
  {
    found: false,
    name: 'authorization',
    stuff: {}
  }
]

// Listener

browser.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

    // color the browser icon
    browser.pageAction.show(sender.tab.id);

    if(request.funcName === "getAuth"){
      // run the following only when bookmark is clicked
      const reqH = requiredHeaders.map((h)=>h.name);

      browser.webRequest.onBeforeSendHeaders.addListener(

        function getAllHeaders(details) {

          // check all headers for required headers
          for (var i = 0; i < details.requestHeaders.length; ++i) {
            if( reqH.indexOf(details.requestHeaders[i].name) > -1 ){
              let pos = reqH.indexOf(details.requestHeaders[i].name);
              requiredHeaders[pos].found = true;
              requiredHeaders[pos].stuff = details.requestHeaders[i];
            }
          }

          // check if we got all required headers,
          // if positive, remove listener and send response
          if( requiredHeaders.every((a)=>a.found == true) ){
            browser.webRequest.onBeforeSendHeaders.removeListener(getAllHeaders);
            sendResponse({ headers: requiredHeaders.map(h=>h.stuff) });
          }

        },
        {urls: ["https://*.twitter.com/*"]},
        ["requestHeaders"]
      );
      return true;
    }

    
  });