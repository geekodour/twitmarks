window.browser = (function () {
    return window.msBrowser || window.browser || window.chrome;
})();
class BookmarksData {
    constructor() {
        this.tweets = [];
        this.users = {};
        this.nextCursor = null;
        this.limit = 20;
        this.page = 0;
        this.apiUrl = 'https://api.twitter.com/2/timeline/bookmark.json';
    }
    setHeaders(headers) {
        this.headers = headers;
    }
    fetchBookmarks() {
        let params = [
            `count=${this.limit}`,
            `include_profile_interstitial_type=1`,
            `include_reply_count=1`,
            `include_blocking=1`,
            `include_blocked_by=1`,
            `tweet_mode=extended`,
            `include_can_dm=1`,
            `include_followed_by=1`,
            `include_want_retweets=1`,
            `include_can_media_tag=1`,
            `cards_platform=Web-12`
        ].join('&');
        if (this.nextCursor) {
            params += `&cursor=${encodeURIComponent(this.nextCursor)}`;
        }
        const url = `${this.apiUrl}?${params}`;
        const h = new Headers();
        this.headers.forEach((o) => { h.append(o.name, o.value); });
        const request = new Request(url, { headers: h });
        return fetch(request, { credentials: 'same-origin' })
            .then((e) => { return e.json(); })
            .then((e) => {
            let tweets = e.globalObjects.tweets;
            let entries = e.timeline.instructions["0"].addEntries.entries;
            let nextCursor = entries[entries.length - 1].content.operation.cursor.value;
            if (nextCursor === this.nextCursor) {
                document.querySelector('.twitter-bookmarks-lm-btn').classList.add('hide-lm-btn');
            }
            else {
                this.nextCursor = nextCursor;
            }
            this.tweets = [...this.tweets, ...Object.keys(tweets).map((k) => tweets[k])];
            this.users = Object.assign({}, this.users, e.globalObjects.users);
            this.page += 1;
        })
            .catch(function (err) { console.log(err); });
    }
    bookmarkATweet(tweetid) {
    }
    unBookmarkATweet(tweetid) {
        const removeUrl = 'https://api.twitter.com/1.1/bookmark/entries/remove.json';
        const data = [`tweetid=${tweetid}`, `tweet_mode=extended`];
        const h = new Headers();
        this.headers.forEach((o) => { h.append(o.name, o.value); });
        h.append("content-type", "application/x-www-form-urlencoded");
        const request = new Request(removeUrl, { headers: h });
        fetch(request, {
            method: "POST",
            credentials: "same-origin",
            body: data.join('&')
        })
            .then(response => response.json())
            .then((e) => {
            console.log(e);
        });
        //redirect: "follow",
        //referrer: "no-referrer",
    }
}
class BookmarksDOM {
    constructor() {
        this.bd = new BookmarksData();
        this.dataRecieved = new Promise((resolve, reject) => { });
        this.placeNavButton();
        this.watchHeaders();
    }
    generateNavListItem(name, icon) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        const spans = [0, 1].map((s) => document.createElement('span'));
        // add classnames
        a.className = 'js-tooltip js-dynamic-tooltip global-bookmark-nav global-dm-nav';
        spans[0].className = `Icon Icon--${icon} Icon--large`;
        spans[1].className = 'text';
        spans[1].innerText = name;
        // apply changes
        li.addEventListener('click', () => {
            this.configureModal();
            this.displayBookmarks();
        }, false);
        a.appendChild(spans[0]);
        a.appendChild(spans[1]);
        li.appendChild(a);
        const navUl = document.querySelector('ul.nav');
        navUl.appendChild(li);
    }
    closeModal() {
        const navButton = document.querySelector(`.global-bookmark-nav.global-dm-nav`);
        if (navButton) {
            navButton.classList.remove('global-dm-nav');
        }
        const bookmarkModal = document.querySelector('.bookmark-modal');
        const body = document.querySelector("body");
        bookmarkModal.remove();
        body.classList.remove('modal-enabled');
    }
    generateModal() {
        // create elements
        const modal_overlay = document.createElement('div');
        const modal_container = document.createElement('div');
        const modal = document.createElement('div');
        const modal_head = document.createElement('div');
        const modal_toolbar = document.createElement('div');
        const modal_content = document.createElement('div');
        const load_more_button = document.createElement('button');
        const close_button = document.createElement('button');
        // generate contents and add behaviours
        modal_head.innerHTML = `<h2 class='DMActivity-title js-ariaTitle'>Bookmarks</h2>`;
        close_button.innerHTML = `<span class="Icon Icon--close Icon--medium"></span>
          <span class="u-hiddenVisually">Close</span>`;
        close_button.addEventListener('click', this.closeModal, false);
        modal_content.innerHTML = `<div class="DMActivity-body js-ariaBody">
      <div class="DMInbox-content u-scrollY">
        <div class="DMInbox-primary">
          <ul class="DMInbox-conversations">
          </ul>
        </div>
      </div>
    </div>`;
        load_more_button.innerText = `Load More`;
        load_more_button.addEventListener('click', () => {
            let offset = this.bd.page * this.bd.limit;
            this.bd.fetchBookmarks()
                .then((e) => {
                this.putBookmarks(this.bd.tweets.slice(offset), this.bd.users);
            });
        }, false);
        const bookmarkList = modal_content.querySelector('ul.DMInbox-conversations');
        // style
        modal_overlay.className = 'DMDialog modal-container bookmark-modal';
        modal_container.className = 'modal is-autoPosition';
        modal.className = 'DMActivity DMInbox js-ariaDocument u-chromeOverflowFix DMActivity--open';
        modal_head.className = 'DMActivity-header';
        modal_toolbar.className = 'DMActivity-toolbar';
        modal_content.className = 'DMActivity-container';
        close_button.className = 'DMActivity-close js-close u-textUserColorHover';
        load_more_button.className = 'twitter-bookmarks-lm-btn';
        // append
        modal_toolbar.appendChild(close_button);
        modal_head.appendChild(modal_toolbar);
        modal.appendChild(modal_head);
        modal.appendChild(modal_content);
        modal.appendChild(load_more_button);
        modal_container.appendChild(modal);
        modal_overlay.appendChild(modal_container);
        return { bookmarkList, modal_overlay, modal };
    }
    displayBookmarks() {
        this.dataRecieved.then((e) => {
            let tweets = this.bd.tweets;
            let users = this.bd.users;
            this.putBookmarks(tweets, users);
        });
    }
    putBookmarks(tweets, users) {
        tweets.forEach((tweet) => {
            this.bd.modal.bookmarkList.appendChild(this.generateBookmarkItem({ tweet: tweet, user: users[tweet.user_id_str] }));
        });
    }
    generateBookmarkItem(tweet) {
        const li = document.createElement('li');
        const divs = [0, 1, 2, 3, 4].map((d) => document.createElement('div'));
        li.className = 'DMInboxItem';
        divs[0].className = 'DMInboxItem-avatar';
        divs[1].className = 'DMInboxItem-title account-group';
        divs[2].className = 'u-posRelative';
        divs[3].className = 'DMInboxItem-header';
        divs[4].className = 'bookmark-links';
        // change content
        divs[0].innerHTML = `<a href='' class='js-action-profile js-user-profile-link'>
    <div class='DMAvatar DMAvatar--1 u-chromeOverflowFix'>
    <span class='DMAvatar-container'> <img class='DMAvatar-image'></div> </span>
    </div>
    </a>`;
        divs[1].innerHTML = `<b class='fullname'></b>
    <span class='UserBadges'></span><span class='UserNameBreak'></span>
    <span class='username u-dir u-textTruncate'>@<b></b></span>`;
        divs[2].innerHTML = `<p 
      class='DMInboxItem-snippet' 
      style='max-height: 100%; cursor: default;color: #14171a;'
      ></p>`;
        divs[3].innerHTML = `<a href='#' target='__blank' class='bookmarks-shw-thd'>Show thread</a>&nbsp;
    <button class='unbookmark-btn'>Unbookmark</button>`;
        divs[4].innerHTML = `<b>Links:</b><br/><ul></ul>`;
        // assign
        const avatar = divs[0].querySelector('img');
        const name = divs[1].querySelector('b');
        const username = divs[1].querySelector('span b');
        const tweetText = divs[2].querySelector('p');
        const linkList = divs[4].querySelector('ul');
        const threadAnchor = divs[3].querySelector('a');
        // apply
        let tweetFullText = tweet.tweet.full_text;
        avatar.src = tweet.user.profile_image_url_https;
        name.innerText = tweet.user.name;
        username.innerText = tweet.user.screen_name;
        tweetText.innerText = tweet.tweet.full_text;
        threadAnchor.href = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.tweet.id_str}`;
        // append
        li.appendChild(divs[0]);
        li.appendChild(divs[1]);
        li.appendChild(divs[3]);
        li.appendChild(divs[2]);
        // add links if any
        const entities = Object.keys(tweet.tweet.entities).map((k) => k);
        entities.forEach((entityName) => {
            tweet.tweet.entities[entityName].forEach((e) => {
                if (entityName === "urls") {
                    const extractedText = tweetFullText.substring(e.indices[0], e.indices[1]);
                    tweetText.innerHTML = tweetText.innerHTML.replace(extractedText, `
            <a href="${e.expanded_url}">${extractedText}</a>
          `);
                }
                if (entityName === "media") {
                    const extractedText = tweetFullText.substring(e.indices[0], e.indices[1]);
                    tweetText.innerHTML = tweetText.innerHTML.replace(extractedText, `
            <img src="${e.media_url_https}" style="width:50%;display:block;"></img>
          `);
                }
                if (entityName === "user_mentions") {
                    const extractedText = tweetFullText.substring(e.indices[0], e.indices[1]);
                    tweetText.innerHTML = tweetText.innerHTML.replace(extractedText, `
            <a href="https://twitter.com/${e.screen_name}">${extractedText}</a>
          `);
                }
                // TODO: Hashtags and Symbols
            });
        });
        return li;
    }
    configureModal() {
        setTimeout(function () {
            let somePoint = document.elementFromPoint(0, 1);
            somePoint.click(); // hide dm modal
        }, 5);
        this.dataRecieved.then((e) => {
            // put the generated modal into the body
            const body = document.querySelector("body");
            this.bd.modal = this.generateModal();
            body.appendChild(this.bd.modal.modal_overlay);
        });
    }
    placeNavButton() {
        this.generateNavListItem('Bookmarks', 'heartBadge');
    }
    watchHeaders() {
        window.browser.runtime.sendMessage({ funcName: 'getAuth' }, (response) => {
            this.bd.setHeaders(response.headers);
            this.bd.fetchBookmarks()
                .then((e) => {
                this.dataRecieved = Promise.resolve();
            });
        });
    }
}
const ext = new BookmarksDOM();
