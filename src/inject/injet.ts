class BookmarksData {
  modal: object;
  items: object[];
  nextCursor: string;
  limit: number;
  apiUrl: string;

  constructor(){
    this.modal = {};
    this.items = [];
    this.nextCursor = null;
    this.limit = 20;
    this.apiUrl = 'https://api.twitter.com/2/timeline/bookmark.json'
  }

  fetchBookmarks(headers: {name: string, value: string}[]){ 
    // check if last page is reached
    // hide load more button if last is reached
    const params: string = [
      `count=${this.limit}`,
      `cursor=${this.nextCursor}`
    ].join('&');
    const url: string = `${this.apiUrl}?${params}`
    const h: Headers = new Headers()
    headers.forEach((o)=>{ h.append(o.name, o.value) })
    const request: Request = new Request(url, { headers: h })

    fetch(request,{credentials: 'same-origin'})
      .then((e) => { return e.json() })
      .then((e) => {
        this.nextCursor = e.timeline.instructions["0"]
                                .addEntries.entries[bookmarks.limit+1]
                                .content.operation.cursor.value;
        let tweets = Object.values(e.globalObjects.tweets)
        putBookmarks({tweets: tweets, users: e.globalObjects.users}); 
      })
      .catch(function(err){console.log(err)})
  }

  bookmarkTweet(tweetid: string){

  }
}

class BookmarksDOM {

  constructor(){
    this.placeNavButton();
  }

  generateNavListItem(name: string, icon: string) : HTMLElement{
    const li: HTMLElement = document.createElement('li');
    const a: HTMLElement = document.createElement('a');
    const spans: HTMLElement[] = [0,1].map((s)=>document.createElement('span'))

    // add classnames
    a.className = 'js-tooltip js-dynamic-tooltip global-bookmark-nav global-dm-nav'
    spans[0].className = `Icon Icon--${icon} Icon--large`
    spans[1].className = 'text'
    spans[1].innerText = name
  
    // apply changes
    li.addEventListener('click', this.bookmarksCTA, false)
    a.appendChild(spans[0])
    a.appendChild(spans[1])
    li.appendChild(a);
  
    return li;
  }

  // configure modal to show bookmarks
  configureModal(){

    // hide dm modal
    setTimeout(function(){
      document.elementFromPoint(0, 1).click();
    },1);

    // put the generated modal into the body
    const body = document.querySelector("body");
    bookmarks.modal = generateModal();
    body.appendChild(bookmarks.modal.modal_overlay);
  }

  bookmarksCTA(){
    this.configureModal()
    //displayBookmakrs()
  }

  placeNavButton(){ 
    const navUl: HTMLElement = document.querySelector('ul.nav');
    const navLi = this.generateNavListItem('Bookmarks','heartBadge');
    navUl.appendChild(navLi);
  }
}

const ext = new BookmarksDOM();