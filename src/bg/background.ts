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
chrome.runtime.onMessage.addListener(
  function(request: any, sender: any, sendResponse: any) {

    // color the browser icon
    chrome.pageAction.show(sender.tab.id);

    if(request.funcName === "getAuth"){
      // run the following only when bookmark is clicked
      const headerNames = requiredHeaders.map((h)=>h.name);

      chrome.webRequest.onBeforeSendHeaders.addListener(

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
            chrome.webRequest.onBeforeSendHeaders.removeListener(getAllHeaders);
            sendResponse({ headers: requiredHeaders.map(h=>h.header) });
          }

        },
        {urls: ["https://*.twitter.com/*"]},
        ["requestHeaders"]
      );

      return true;
    }

  });


chrome.runtime.onConnect.addListener(function(port: chrome.runtime.Port) {
  console.assert(port.name == "checkTabUpdate");
  chrome.tabs.onUpdated.addListener(
    (tabId: any, changeInfo: any, tab: any) => {
      let url: string = tab.url;
      const rePattern: RegExp = /https:\/\/twitter\.com\/.+\/status\/\d+/gm;
      port.postMessage({addBookmark: rePattern.test(url) });
    }
  );
});