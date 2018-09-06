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
]

// Listener
window.browser.runtime.onMessage.addListener(
  function(request: any, sender: any, sendResponse: any) {

    // color the browser icon
    window.browser.pageAction.show(sender.tab.id);

    if(request.funcName === "checkTabUpdate"){
      window.browser.tabs.onUpdated.addListener(
        (tabId: any, changeInfo: any, tab: any) => {
          console.log(tab.url);
          // if tab.url match our regex, send a true response to content script
        }
      );
    }

    if(request.funcName === "getAuth"){
      // run the following only when bookmark is clicked
      const headerNames = requiredHeaders.map((h)=>h.name);

      window.browser.webRequest.onBeforeSendHeaders.addListener(

        function getAllHeaders(details: any) {

          // check all available headers for required headers
          for (var i = 0; i < details.requestHeaders.length; ++i) {
            if( headerNames.indexOf(details.requestHeaders[i].name) > -1 ){
              let pos = headerNames.indexOf(details.requestHeaders[i].name);
              requiredHeaders[pos].found = true;
              requiredHeaders[pos].header = details.requestHeaders[i];
            }
          }

          // remove listener and send response if found all required headers
          if( requiredHeaders.every((a)=>a.found == true) ){
            window.browser.webRequest.onBeforeSendHeaders.removeListener(getAllHeaders);
            sendResponse({ headers: requiredHeaders.map(h=>h.header) });
          }

        },
        {urls: ["https://*.twitter.com/*"]},
        ["requestHeaders"]
      );

      return true;
    }

  });