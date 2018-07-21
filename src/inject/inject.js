// Utility Functions
function generateNavListItem(name, icon){
  var li = document.createElement('li');
  var a = document.createElement('a');
  var s1 = document.createElement('span');
  var s2 = document.createElement('span');
  li.className = "kk"; // and bookmarks spec class here
  li.addEventListener("click", onClick, false);
  a.className = "js-tooltip js-dynamic-tooltip global-bookmark-nav global-dm-nav"; // add a bookmark specific class here
  s1.className = "Icon Icon--" + icon + " Icon--large";
  s2.className = "text";
  s2.innerText = name;
  a.appendChild(s1);
  a.appendChild(s2);
  li.appendChild(a);
  return li;
}

function jegehBana(){

  const globalContainer = document.getElementById("page-container");
  const container = document.createElement('div');
  const dashboard = document.createElement('div');
  let bookCard = document.createElement('div');
  container.innerText = "Poopking"

  // style the elements
  container.style.cssText = 'background: white; padding: 2em;';
  container.className = 'content-main top-timeline-tweetbox';
  dashboard.className = 'dashboard.dashboard-left';

  // apply changes
  globalContainer.appendChild(container);


  //div1.className = 'content-header';
  //div1.innerHTML = "<p>Bookmarks</p>";

  // hide the DM modal, because we are using DM request to get auth creds
  var modal = document.querySelector(".DMDialog.modal-container");
  var modal_o = document.querySelector(".modal-overlay");
  setTimeout(function(){
    //modal.style.display = 'none';
    modal.style.display = 'none';
    modal_o.style.display = 'none';
  },500);

}

function fetchBookmarks(headers) {
  const url = "https://api.twitter.com/2/timeline/bookmark.json";
  const h = new Headers();
  headers.forEach((o)=>{ h.append(o.name, o.value); })
  const request = new Request(url, { headers: h });
  fetch(request,{credentials: "same-origin"})
    .then(function(e) { console.log(e.json()) })
    .catch(function(err){console.log(err)})
}

function fetchMoreBookmarks(){}

function sendToExtension() {
  chrome.runtime.sendMessage({funcName: "getAuth"}, function(response) {
    let headers = response.headers;
    fetchBookmarks(headers);
  });
}

function onClick(){
  jegehBana();
  sendToExtension();
}


chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);

        const navUl = document.querySelector('ul.nav.js-global-actions');
        const navLi = generateNavListItem("Bookmarks","heartBadge");
        navUl.appendChild(navLi);

	}
	}, 10);
});
