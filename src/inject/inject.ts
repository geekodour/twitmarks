interface Window {
  browser?: any;
  msBrowser?: any;
}

window.browser = (function () {
  return window.msBrowser || window.browser || window.chrome;
})()

class BookmarksData {
  modal: {
    bookmarkList: Element,
    modal_overlay: HTMLDivElement,
    modal: HTMLDivElement
  };
  tweets: object[];
  nextCursor: string;
  limit: number;
  apiUrl: string;
  headers: {name: string, value: string}[];

  constructor(){
    //this.modal = { };
    this.tweets = [];
    this.nextCursor = null;
    this.limit = 20;
    this.apiUrl = 'https://api.twitter.com/2/timeline/bookmark.json';
  }

  setHeaders(headers: {name: string, value: string}[]){
    this.headers = headers;
  }

  fetchBookmarks(){ 
    // check if last page is reached
    // hide load more button if last is reached

    let params: string = [
      `count=${this.limit}`,
      `include_profile_interstitial_type=1`,
      `include_reply_count=1`,
      `tweet_mode=extended`,
      `include_can_dm=1`,
      `include_can_media_tag=1`,
      `cards_platform=Web-12`
    ].join('&');

    if(this.nextCursor){
      params += `&cursor=${this.nextCursor}`;
    }

    const url: string = `${this.apiUrl}?${params}`
    const h: Headers = new Headers()
    this.headers.forEach((o)=>{ h.append(o.name, o.value) })
    const request: Request = new Request(url, { headers: h })

    fetch(request,{credentials: 'same-origin'})
      .then((e) => { return e.json() })
      .then((e) => {
        let tweets = e.globalObjects.tweets;
        this.nextCursor = e.timeline.instructions["0"]
                                .addEntries.entries[this.limit+1]
                                .content.operation.cursor.value;
        this.tweets = Object.keys(tweets).map((k)=>tweets[k]);
        console.log({tweets: this.tweets, users: e.globalObjects.users}); 
        // return these
        // putBookmarks({tweets: this.items, users: e.globalObjects.users}); 
      })
      .catch(function(err){console.log(err)})
  }

  bookmarkaTweet(tweetid: string){ 

  }
}

class BookmarksDOM {

  bd: BookmarksData;

  constructor(){
    this.bd = new BookmarksData();
    this.placeNavButton();
    setTimeout(()=>{ this.watchHeaders() },5);
  }

  generateNavListItem(name: string, icon: string) : void{
    const li: HTMLElement = document.createElement('li');
    const a: HTMLElement = document.createElement('a');
    const spans: HTMLElement[] = [0,1].map((s)=>document.createElement('span'))

    // add classnames
    a.className = 'js-tooltip js-dynamic-tooltip global-bookmark-nav global-dm-nav'
    spans[0].className = `Icon Icon--${icon} Icon--large`
    spans[1].className = 'text'
    spans[1].innerText = name
  
    // apply changes
    li.addEventListener('click', ()=>{this.configureModal();}, false)
    a.appendChild(spans[0])
    a.appendChild(spans[1])
    li.appendChild(a)
  
    const navUl: HTMLElement = document.querySelector('ul.nav');
    navUl.appendChild(li)
  }

  closeModal(){
    const navButton = document.querySelector(`.global-bookmark-nav.global-dm-nav`);
    if(navButton){ navButton.classList.remove('global-dm-nav'); }

    const bookmarkModal = document.querySelector('.bookmark-modal')
    const body = document.querySelector("body")
    bookmarkModal.remove()
    body.classList.remove('modal-enabled')
  }

  generateModal(){

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
    close_button.addEventListener('click',this.closeModal, false)
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

  popModal(){
    this.configureModal();
    //displayBookmakrs()
  }

  configureModal(){

    setTimeout(function(){
      let somePoint : HTMLElement = document.elementFromPoint(0, 1) as HTMLElement;
      somePoint.click(); // hide dm modal
    },5);

    // put the generated modal into the body
    const body = document.querySelector("body");
    this.bd.modal = this.generateModal();
    body.appendChild(this.bd.modal.modal_overlay);
  }

  placeNavButton(){ 
    this.generateNavListItem('Bookmarks','heartBadge');
  }

  watchHeaders(){
    // get auth details, remove dm class the second time(after getting all header) from out modal.

    window.browser.runtime.sendMessage({funcName: 'getAuth'}, function(response: any) {
      console.log(response.headers);
      this.bd.setHeaders(response.headers); 
      this.bd.fetchBookmarks(response.headers);
    })

  }
}

const ext = new BookmarksDOM();