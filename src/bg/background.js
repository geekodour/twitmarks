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

let headers = []

chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
    chrome.pageAction.show(sender.tab.id);


    if(request.funcName === "getAuth"){
      // run the following only when bookmark is clicked
      //let count = 0;
      const reqH = requiredHeaders.map((h)=>h.name);
      //const reqF = requiredHeaders.map((h)=>h.found);

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
          }

          console.log(JSON.stringify(requiredHeaders));
        },
        {urls: ["https://*.twitter.com/*"]},
        ["requestHeaders"]);
    }
    
    sendResponse({ack:"poop"});
  });