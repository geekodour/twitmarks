window.browser = (function () {
    return window.msBrowser || window.browser || window.chrome;
})();
var BookmarksData = /** @class */ (function () {
    function BookmarksData() {
        //this.modal = { };
        this.tweets = [];
        this.nextCursor = null;
        this.limit = 20;
        this.apiUrl = 'https://api.twitter.com/2/timeline/bookmark.json';
    }
    BookmarksData.prototype.setHeaders = function (headers) {
        this.headers = headers;
    };
    BookmarksData.prototype.fetchBookmarks = function () {
        // check if last page is reached
        // hide load more button if last is reached
        var _this = this;
        var params = [
            "count=" + this.limit,
            "include_profile_interstitial_type=1",
            "include_reply_count=1",
            "tweet_mode=extended",
            "include_can_dm=1",
            "include_can_media_tag=1",
            "cards_platform=Web-12"
        ].join('&');
        if (this.nextCursor) {
            params += "&cursor=" + this.nextCursor;
        }
        var url = this.apiUrl + "?" + params;
        var h = new Headers();
        this.headers.forEach(function (o) { h.append(o.name, o.value); });
        var request = new Request(url, { headers: h });
        fetch(request, { credentials: 'same-origin' })
            .then(function (e) { return e.json(); })
            .then(function (e) {
            var tweets = e.globalObjects.tweets;
            _this.nextCursor = e.timeline.instructions["0"]
                .addEntries.entries[_this.limit + 1]
                .content.operation.cursor.value;
            _this.tweets = Object.keys(tweets).map(function (k) { return tweets[k]; });
            console.log({ tweets: _this.tweets, users: e.globalObjects.users });
            // return these
            // putBookmarks({tweets: this.items, users: e.globalObjects.users}); 
        })["catch"](function (err) { console.log(err); });
    };
    BookmarksData.prototype.bookmarkaTweet = function (tweetid) {
    };
    return BookmarksData;
}());
var BookmarksDOM = /** @class */ (function () {
    function BookmarksDOM() {
        var _this = this;
        this.bd = new BookmarksData();
        this.placeNavButton();
        setTimeout(function () { _this.watchHeaders(); }, 5);
    }
    BookmarksDOM.prototype.generateNavListItem = function (name, icon) {
        var _this = this;
        var li = document.createElement('li');
        var a = document.createElement('a');
        var spans = [0, 1].map(function (s) { return document.createElement('span'); });
        // add classnames
        a.className = 'js-tooltip js-dynamic-tooltip global-bookmark-nav global-dm-nav';
        spans[0].className = "Icon Icon--" + icon + " Icon--large";
        spans[1].className = 'text';
        spans[1].innerText = name;
        // apply changes
        li.addEventListener('click', function () { _this.configureModal(); }, false);
        a.appendChild(spans[0]);
        a.appendChild(spans[1]);
        li.appendChild(a);
        var navUl = document.querySelector('ul.nav');
        navUl.appendChild(li);
    };
    BookmarksDOM.prototype.closeModal = function () {
        var navButton = document.querySelector(".global-bookmark-nav.global-dm-nav");
        if (navButton) {
            navButton.classList.remove('global-dm-nav');
        }
        var bookmarkModal = document.querySelector('.bookmark-modal');
        var body = document.querySelector("body");
        bookmarkModal.remove();
        body.classList.remove('modal-enabled');
    };
    BookmarksDOM.prototype.generateModal = function () {
        // create elements
        var modal_overlay = document.createElement('div');
        var modal_container = document.createElement('div');
        var modal = document.createElement('div');
        var modal_head = document.createElement('div');
        var modal_toolbar = document.createElement('div');
        var modal_content = document.createElement('div');
        var close_button = document.createElement('button');
        // generate contents and add behaviours
        modal_head.innerHTML = "<h2 class='DMActivity-title js-ariaTitle'>Bookmarks</h2>";
        close_button.innerHTML = "<span class=\"Icon Icon--close Icon--medium\"></span>\n          <span class=\"u-hiddenVisually\">Close</span>";
        close_button.addEventListener('click', this.closeModal, false);
        modal_content.innerHTML = "<div class=\"DMActivity-body js-ariaBody\">\n      <div class=\"DMInbox-content u-scrollY\">\n        <div class=\"DMInbox-primary\">\n          <ul class=\"DMInbox-conversations\">\n          </ul>\n        </div>\n      </div>\n    </div>";
        var bookmarkList = modal_content.querySelector('ul.DMInbox-conversations');
        // style
        modal_overlay.className = 'DMDialog modal-container bookmark-modal';
        modal_container.className = 'modal is-autoPosition';
        modal.className = 'DMActivity DMInbox js-ariaDocument u-chromeOverflowFix DMActivity--open';
        modal_head.className = 'DMActivity-header';
        modal_toolbar.className = 'DMActivity-toolbar';
        modal_content.className = 'DMActivity-container';
        close_button.className = 'DMActivity-close js-close u-textUserColorHover';
        // append
        modal_toolbar.appendChild(close_button);
        modal_head.appendChild(modal_toolbar);
        modal.appendChild(modal_head);
        modal.appendChild(modal_content);
        modal_container.appendChild(modal);
        modal_overlay.appendChild(modal_container);
        return { bookmarkList: bookmarkList, modal_overlay: modal_overlay, modal: modal };
    };
    BookmarksDOM.prototype.popModal = function () {
        this.configureModal();
        //displayBookmakrs()
    };
    BookmarksDOM.prototype.configureModal = function () {
        setTimeout(function () {
            var somePoint = document.elementFromPoint(0, 1);
            somePoint.click(); // hide dm modal
        }, 5);
        // put the generated modal into the body
        var body = document.querySelector("body");
        this.bd.modal = this.generateModal();
        body.appendChild(this.bd.modal.modal_overlay);
    };
    BookmarksDOM.prototype.placeNavButton = function () {
        this.generateNavListItem('Bookmarks', 'heartBadge');
    };
    BookmarksDOM.prototype.watchHeaders = function () {
        // get auth details, remove dm class the second time(after getting all header) from out modal.
        window.browser.runtime.sendMessage({ funcName: 'getAuth' }, function (response) {
            console.log(response.headers);
            this.bd.setHeaders(response.headers);
            this.bd.fetchBookmarks(response.headers);
        });
    };
    return BookmarksDOM;
}());
var ext = new BookmarksDOM();
