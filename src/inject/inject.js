const bookmarks = {
  modal: {},
  items: []
}

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

function generateBookmarkItem(tweet){
  console.log(tweet.tweet)
  console.log(tweet.user)
  console.log("**")
  const li = document.createElement('li');
  const d1 = document.createElement('div');
  const d2 = document.createElement('div');
  const d3 = document.createElement('div');
  const d4 = document.createElement('div');
  const dx = document.createElement('div');

  li.className = "DMInboxItem"
  d1.className = "DMInboxItem-avatar"
  d2.className = "DMInboxItem-title account-group"
  d3.className = "u-posRelative"
  d4.className = "DMInboxItem-header"
  dx.className = "bookmark-links"

  // change content
  d1.innerHTML = "<a href='' class='js-action-profile js-user-profile-link'>\
  <div class='DMAvatar DMAvatar--1 u-chromeOverflowFix'>\
  <span class='DMAvatar-container'>\
    <img class='DMAvatar-image'></div>\
  </span>\
  </div>\
  </a>";

  d2.innerHTML = "<b class='fullname'></b>\
  <span class='UserBadges'></span><span class='UserNameBreak'>&nbsp;</span>\
  <span class='username u-dir u-textTruncate'>@<b></b></span>";

  d3.innerHTML = "<p class='DMInboxItem-snippet' style='max-height: 100%'></p>"
  d4.innerHTML = "<a href='#'>Open Tweet</a>"

  // apply
  const avatar = d1.querySelector('img');
  const name = d2.querySelector('b');
  const username = d2.querySelector('span b');
  const tweetText = d3.querySelector('p');
  avatar.src = tweet.user.profile_image_url_https;
  name.innerText = tweet.user.name
  username.innerText = tweet.user.screen_name
  tweetText.innerText = tweet.tweet.text;

  li.appendChild(d1);
  li.appendChild(d2);
  li.appendChild(d4);
  li.appendChild(d3);
  return li
}

function generateModal(){

  // create elements
  const modal_overlay = document.createElement('div');
  const modal_container = document.createElement('div');
  const modal = document.createElement('div');
  const modal_head = document.createElement('div');
  const modal_toolbar = document.createElement('div');
  const modal_content = document.createElement('div');
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
  </div>';
  const bookmarkList = modal_content.querySelector('ul.DMInbox-conversations')

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

  return {bookmarkList, modal_overlay, modal}

}

function jegehBana(){

  // hide the DM modal, because we are using DM request to get auth creds
  setTimeout(function(){
    document.elementFromPoint(0, 0).click();
  },5);

  const body = document.querySelector("body");
  bookmarks.modal = generateModal();


  body.appendChild(bookmarks.modal.modal_overlay);


}

function putBookmarks(list){
  // stuff
  list.tweets.forEach(function(tweet){
    bookmarks.modal.bookmarkList.appendChild(
      generateBookmarkItem({tweet: tweet, user: list.users[tweet.user_id_str] })
    )
  })
}

function fetchBookmarks(headers) {
  const url = "https://api.twitter.com/2/timeline/bookmark.json";
  const h = new Headers();
  headers.forEach((o)=>{ h.append(o.name, o.value); })
  const request = new Request(url, { headers: h });
  fetch(request,{credentials: "same-origin"})
    .then(function(e) { 
      return e.json();
    })
    .then(function(e) {
      let tweets = Object.values(e.globalObjects.tweets)
      putBookmarks({tweets: tweets, users: e.globalObjects.users}); 
    })
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
