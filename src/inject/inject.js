var BookmarksData = /** @class */ (function () {
    function BookmarksData() {
        this.modal = {};
        this.items = [];
        this.nextCursor = null;
        this.limit = 20;
        this.apiUrl = 'https://api.twitter.com/2/timeline/bookmark.json';
    }
    BookmarksData.prototype.fetchBookmarks = function (headers) {
        var _this = this;
        // check if last page is reached
        // hide load more button if last is reached
        var params = [
            "count=" + this.limit,
            "cursor=" + this.nextCursor
        ].join('&');
        var url = this.apiUrl + "?" + params;
        var h = new Headers();
        headers.forEach(function (o) { h.append(o.name, o.value); });
        var request = new Request(url, { headers: h });
        fetch(request, { credentials: 'same-origin' })
            .then(function (e) { return e.json(); })
            .then(function (e) {
            var tweets = e.globalObjects.tweets;
            _this.nextCursor = e.timeline.instructions["0"]
                .addEntries.entries[bookmarks.limit + 1]
                .content.operation.cursor.value;
            _this.items = Object.keys(tweets).map(function (k) { return tweets[k]; });
            // return these
            //putBookmarks({tweets: this.items, users: e.globalObjects.users}); 
        })["catch"](function (err) { console.log(err); });
    };
    BookmarksData.prototype.bookmarkaTweet = function (tweetid) {
    };
    return BookmarksData;
}());
var BookmarksDOM = /** @class */ (function () {
    function BookmarksDOM() {
        this.placeNavButton();
    }
    BookmarksDOM.prototype.generateNavListItem = function (name, icon) {
        var li = document.createElement('li');
        var a = document.createElement('a');
        var spans = [0, 1].map(function (s) { return document.createElement('span'); });
        // add classnames
        a.className = 'js-tooltip js-dynamic-tooltip global-bookmark-nav global-dm-nav';
        spans[0].className = "Icon Icon--" + icon + " Icon--large";
        spans[1].className = 'text';
        spans[1].innerText = name;
        // apply changes
        li.addEventListener('click', this.bookmarksCTA, false);
        a.appendChild(spans[0]);
        a.appendChild(spans[1]);
        li.appendChild(a);
        var navUl = document.querySelector('ul.nav');
        navUl.appendChild(li);
    };
    // configure modal to show bookmarks
    BookmarksDOM.prototype.configureModal = function () {
        // hide dm modal
        setTimeout(function () {
            //document.elementFromPoint(0, 1).click();
        }, 1);
        // put the generated modal into the body
        var body = document.querySelector("body");
        bookmarks.modal = generateModal();
        body.appendChild(bookmarks.modal.modal_overlay);
    };
    BookmarksDOM.prototype.bookmarksCTA = function () {
        this.configureModal();
        //displayBookmakrs()
    };
    BookmarksDOM.prototype.placeNavButton = function () {
        this.generateNavListItem('Bookmarks', 'heartBadge');
    };
    return BookmarksDOM;
}());
var ext = new BookmarksDOM();
