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

function closeModal(){
  const bookmarkModal = document.querySelector(".bookmark-modal");
  const body = document.querySelector("body");
  bookmarkModal.remove();
  body.classList.remove('modal-enabled');
}

function generateBookmarkItem(a){
  const li = document.createElement('li');
  const d1 = document.createElement('div');
  li.className = "DMInboxItem"
  d1.className = "DMInboxItem-avatar"
  li.innerText = "poop";
  return li
}

function jegehBana(){

  const body = document.querySelector("body");

  // create elements
  const modal_overlay = document.createElement('div'); // delete this modal when works done [imp]
  const modal_container = document.createElement('div');
  const modal = document.createElement('div');

  const modal_head = document.createElement('div');
  const modal_content = document.createElement('div');

  const modal_toolbar = document.createElement('div');
  const close_button = document.createElement('button');

  // generate contents and add behaviours
  modal_head.innerHTML = "<h2 class='DMActivity-title js-ariaTitle'>Bookmarks</h2>";
  close_button.innerHTML = '<span class="Icon Icon--close Icon--medium"></span>\
        <span class="u-hiddenVisually">Close</span>'
  close_button.addEventListener('click',closeModal, false);
  modal_content.innerHTML = '<div class="DMActivity-body js-ariaBody">\
    <div class="DMInbox-content u-scrollY">\
      <div class="DMInbox-primary">\
        <ul class="DMInbox-conversations">\
        </ul>\
      </div>\
    </div>\
  </div>'
  const bookmarkList = modal_content.querySelector('ul.DMInbox-conversations')
  bookmarkList.appendChild(generateBookmarkItem({}))
  bookmarkList.appendChild(generateBookmarkItem({}))
  bookmarkList.appendChild(generateBookmarkItem({}))
  bookmarkList.appendChild(generateBookmarkItem({}))

  // style the elements
  modal_overlay.className = 'DMDialog modal-container bookmark-modal';
  modal_container.className = 'modal is-autoPosition';
  modal.className = 'DMActivity DMInbox js-ariaDocument u-chromeOverflowFix DMActivity--open';

  modal_toolbar.className = 'DMActivity-toolbar'
  close_button.className = 'DMActivity-close js-close u-textUserColorHover'

  modal_head.className = 'DMActivity-header'
  modal_content.className = 'DMActivity-container'

  // apply changes
  modal_toolbar.appendChild(close_button);
  modal_head.appendChild(modal_toolbar);
  modal.appendChild(modal_head);
  modal.appendChild(modal_content);
  modal_container.appendChild(modal);
  modal_overlay.appendChild(modal_container);
  body.appendChild(modal_overlay);

  // hide the DM modal, because we are using DM request to get auth creds
  setTimeout(function(){
    document.elementFromPoint(0, 0).click();
  },5);

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
