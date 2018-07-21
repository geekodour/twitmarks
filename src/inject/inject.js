function generateNavListItem(name, icon){
  var li = document.createElement('li');
  var a = document.createElement('a');
  var s1 = document.createElement('span');
  var s2 = document.createElement('span');
  li.className = "kk"; // and bookmarks spec class here
  li.addEventListener("click", onClick, false);
  a.className = "js-tooltip js-dynamic-tooltip global-bookmark-nav global-dm-nav"; // add a bookmark specific class here
  s1.className = "Icon Icon--heartBadge Icon--large";
  s2.className = "text";
  s2.innerText = "Bookmarks";
  a.appendChild(s1);
  a.appendChild(s2);
  li.appendChild(a);
  return li;
}

function jegehBana(){
  // clearn anything below, 75% make left, bookmarks there
  //var container = document.querySelector(".content-main.light-inline-actions");
  //var div1 = document.createElement('div');
  //div1.className = 'content-header';
  //div1.innerHTML = "<p>Bookmarks</p>";
  //container.
  var container = document.querySelector(".DMDialog.modal-container");
  var container_o = document.querySelector(".modal-overlay");
  setTimeout(function(){
    container.style.display = 'none';
    container_o.style.display = 'none';
  },500);
  console.log(container)
  //console.log(container);

}

function sendToExtension() {
  chrome.runtime.sendMessage({funcName: "getAuth"}, function(response) {
    console.log(response.ack);
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

        var navUl = document.querySelector('ul.nav.js-global-actions');
        var navLi = generateNavListItem("abc","abc");
        navUl.appendChild(navLi);

	}
	}, 10);
});
