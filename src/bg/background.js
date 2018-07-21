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

chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {

    // color the browser icon
    chrome.pageAction.show(sender.tab.id);

    if(request.funcName === "getAuth"){
      // run the following only when bookmark is clicked
      const reqH = requiredHeaders.map((h)=>h.name);

      chrome.webRequest.onBeforeSendHeaders.addListener(

        function getAllHeaders(details) {
          for (var i = 0; i < details.requestHeaders.length; ++i) {
            if( reqH.indexOf(details.requestHeaders[i].name) > -1 ){
              let pos = reqH.indexOf(details.requestHeaders[i].name);
              requiredHeaders[pos].found = true;
              requiredHeaders[pos].stuff = details.requestHeaders[i];
            }
          }
          // check if we got all required headers, remove listener if we got
          if( requiredHeaders.every((a)=>a.found == true) ){
            chrome.webRequest.onBeforeSendHeaders.removeListener(getAllHeaders);
            // send these creds to inject.js now
            sendResponse({ headers: requiredHeaders.map(h=>h.stuff) });
          }
        },
        {urls: ["https://*.twitter.com/*"]},
        ["requestHeaders"]
      );
      return true;
    }

    
  });