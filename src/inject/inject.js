const bookmarks = {
  modal: {},
  items: [],
  nextCursor: '',
  limit: 20
}

window.browser = (function () {
  return window.msBrowser ||
    window.browser ||
    window.chrome;
})()

// utility Functions
function generateNavListItem(name, icon){
  const li = document.createElement('li');
  const a = document.createElement('a');
  const spans = [0,1].map((s)=>document.createElement('span'))
  a.className = 'js-tooltip js-dynamic-tooltip global-bookmark-nav global-dm-nav'
  spans[0].className = `Icon Icon--${icon} Icon--large`
  spans[1].className = 'text'
  spans[2].innerText = name

  li.addEventListener('click', bookmarksCTA, false)

  a.appendChild(spans[0])
  a.appendChild(spans[1])
  li.appendChild(a);

  return li;
}

function closeModal(){
  const bookmarkModal = document.querySelector('.bookmark-modal')
  const body = document.querySelector("body")
  bookmarkModal.remove()
  body.classList.remove('modal-enabled')
}

function generateBookmarkItem(tweet){
  const li = document.createElement('li')
  const divs = [0,1,2,3,4].map((d)=>document.createElement('div'))

  li.className = 'DMInboxItem'
  divs[0].className = 'DMInboxItem-avatar'
  divs[1].className = 'DMInboxItem-title account-group'
  divs[2].className = 'u-posRelative'
  divs[3].className = 'DMInboxItem-header'
  divs[4].className = 'bookmark-links'

  // change content
  divs[0].innerHTML = `<a href='' class='js-action-profile js-user-profile-link'>
  <div class='DMAvatar DMAvatar--1 u-chromeOverflowFix'>
  <span class='DMAvatar-container'> <img class='DMAvatar-image'></div> </span>
  </div>
  </a>`
  divs[1].innerHTML = `<b class='fullname'></b>
  <span class='UserBadges'></span><span class='UserNameBreak'>&nbsp;</span>
  <span class='username u-dir u-textTruncate'>@<b></b></span>`
  divs[2].innerHTML = `<p class='DMInboxItem-snippet' style='max-height: 100%'></p>`
  divs[3].innerHTML = `<a href='#' target='__blank'>Show thread</a>`
  divs[4].innerHTML = `<b>Links:</b><br/><ul></ul>`

  // assign
  const avatar = divs[0].querySelector('img');
  const name = divs[1].querySelector('b');
  const username = divs[1].querySelector('span b');
  const tweetText = divs[2].querySelector('p');
  const linkList = divs[4].querySelector('ul');
  const threadAnchor = divs[3].querySelector('a');

  // apply
  avatar.src = tweet.user.profile_image_url_https;
  name.innerText = tweet.user.name
  username.innerText = tweet.user.screen_name
  tweetText.innerText = tweet.tweet.text;
  threadAnchor.href = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.tweet.id_str}`

  // append
  li.appendChild(divs[0])
  li.appendChild(divs[1])
  li.appendChild(divs[3])
  li.appendChild(divs[2])

  // add links if any
  if(tweet.tweet.entities.urls.length > 0){
    tweet.tweet.entities.urls.forEach(function(url){
      let li = document.createElement('li')
      let a = document.createElement('a')
      a.href = url.expanded_url
      a.innerText = url.display_url
      li.appendChild(a)
      linkList.appendChild(li)
    })
    li.appendChild(divs[4])
  }

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
  modal_head.innerHTML = `<h2 class='DMActivity-title js-ariaTitle'>Bookmarks</h2>`
  close_button.innerHTML = `<span class="Icon Icon--close Icon--medium"></span>
        <span class="u-hiddenVisually">Close</span>`
  close_button.addEventListener('click',closeModal, false)
  modal_content.innerHTML = `<div class="DMActivity-body js-ariaBody">
    <div class="DMInbox-content u-scrollY">
      <div class="DMInbox-primary">
        <ul class="DMInbox-conversations">
        </ul>
      </div>
    </div>
  </div>`
  const bookmarkList = modal_content.querySelector('ul.DMInbox-conversations')

  // style
  modal_overlay.className = 'DMDialog modal-container bookmark-modal';
  modal_container.className = 'modal is-autoPosition';
  modal.className = 'DMActivity DMInbox js-ariaDocument u-chromeOverflowFix DMActivity--open';
  modal_head.className = 'DMActivity-header'
  modal_toolbar.className = 'DMActivity-toolbar'
  modal_content.className = 'DMActivity-container'
  close_button.className = 'DMActivity-close js-close u-textUserColorHover'

  // append
  modal_toolbar.appendChild(close_button);
  modal_head.appendChild(modal_toolbar);
  modal.appendChild(modal_head);
  modal.appendChild(modal_content);
  modal_container.appendChild(modal);
  modal_overlay.appendChild(modal_container);

  return {bookmarkList, modal_overlay, modal}

}


function fetchBookmarks(headers) {
  const url = "https://api.twitter.com/2/timeline/bookmark.json?count="+bookmarks.limit;
  const h = new Headers();
  headers.forEach((o)=>{ h.append(o.name, o.value); })
  const request = new Request(url, { headers: h });
  fetch(request,{credentials: "same-origin"})
    .then(function(e) { 
      return e.json();
    })
    .then(function(e) {
      bookmarks.nextCursor = e.timeline.instructions["0"]
                              .addEntries.entries[bookmarks.limit+1]
                              .content.operation.cursor.value;
      let tweets = Object.values(e.globalObjects.tweets)
      putBookmarks({tweets: tweets, users: e.globalObjects.users}); 
    })
    .catch(function(err){console.log(err)})
}

// modifies dom by adding tweets
function putBookmarks(list){
  list.tweets.forEach(function(tweet){
    bookmarks.modal.bookmarkList.appendChild(
      generateBookmarkItem({tweet: tweet, user: list.users[tweet.user_id_str] })
    )
  })
}

// configure modal to show bookmarks
function configureModal(){
  // hide DM modal right after it is opened
  setTimeout(function(){
    document.elementFromPoint(0, 0).click();
  },5);

  // put the generated modal into the body
  const body = document.querySelector("body");
  bookmarks.modal = generateModal();
  body.appendChild(bookmarks.modal.modal_overlay);
}

// function to display bookmarks
function displayBookmakrs() {
  browser.runtime.sendMessage({funcName: 'getAuth'}, function(response) {
    fetchBookmarks(response.headers);
  })
}

// function called when bookmarks button is clicked
function bookmarksCTA(){
  configureModal()
  displayBookmakrs()
}

// init
browser.runtime.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);
        const navUl = document.querySelector('ul.nav');
        const navLi = generateNavListItem('Bookmarks','heartBadge')
        navUl.appendChild(navLi)
	}
	}, 10)
})