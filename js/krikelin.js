var sp = getSpotifyApi(1);
var models = sp.require("$api/models");
var views = sp.require("$api/views");
/***
@module krikelin

@class Krikelin

**/
exports.Krikelin = function (options) {
	var self = this;
	var current_page = 0;
	this.albums = [];
	this.observers = [];
	this.observe = function(evt, callback) {
		this.observers.push({event: evt, callback: callback});
	}
	this.notify = function(event, data) {
		for(var i = 0; i < this.observers.length; i++) {
			var observer = this.observers[i];
			if(observer.event == event) {
				observer.callback(data);
			}
		}
	};
	this.appendNext = function () {
		current_page++;	
		var xmlHttp = new XMLHttpRequest();
		xmlHttp.onreadystatechange = function () {
			if(xmlHttp.readyState == 4) {
				if(xmlHttp.status == 200) {
					self.albums = [];
					var albums = xmlHttp.responseXML.getElementsByTagName("release");
					for(var i = 0; i < albums.length; i++) {
						var _album = albums[i];
						var album = {
							id: _album.getAttribute("id"),
							artist: {
								name:_album.getElementsByTagName("artist")[0].getElementsByTagName("name")[0].firstChild.nodeValue,
								href:_album.getElementsByTagName("artist")[0].getAttribute("href")
							},
							comments: _album.getElementsByTagName("comments")[0].firstChild.nodeValue,
							name: _album.getElementsByTagName("name")[0].firstChild.nodeValue,
							href: _album.getAttribute("href")
						};
						self.albums.push(album);
							
					}
					
					// Notify event
					self.notify(models.EVENT.CHANGE, null);
				}
			}
		};
		var url = "http://cobresia.webfactional.com/krikelin?mode=" + options.mode + "&page=" + current_page;
		console.log(url);
		xmlHttp.open("GET", url, true);
		xmlHttp.send(null);
		
	};
};
/***
@function shorten
@desc Shorten a string
***/
String.prototype.shorten = function (len) {
	if(this.length > len) {
		return this.substr(0, len) + "..";
	}
	return this;
};
exports.Artist = function (artist) {
	this.node = document.createElement("table");
	var tr = document.createElement("tr");
	this.node.appendChild(tr);
	var td = document.createElement("td");
	var td2 = document.createElement("td");
	tr.appendChild(td);
	tr.appendChild(td2);
	var image = new Image(artist.data.portrait, artist.data.uri, artist.data.name);
	image.style.width = "128px";
	image.style.height = "128px";
	
	td.appendChild(image);
	td2.innerHTML = "<a href=\"" + artist.data.uri + "\">" + artist.data.name + "</a>";
	
	
};
exports.Group = function(group) {
	var picture = new Image("img/header.png", "spotify:app:group:" + group.id, group.name);
	picture.setAttribute("src", "img/fb_user.gif");
	console.log(picture);
	picture.style.width = "128px";
	picture.style.height = "128px";
	picture.classList.add("sp-image");
	this.node = document.createElement("li");
	this.node.style.width = "142px";
	var a = document.createElement("a");
	a.setAttribute("href", "spotify:app:group:" + group.id);
	var name = group.name.decodeForText();
	name = name.shorten(20);
	a.appendChild(document.createTextNode(name));
	this.node.appendChild(picture);
	this.node.appendChild(document.createElement("br"));
	this.node.appendChild(a);
};
exports.Post = function(post, data) {
	try {
		this.node = document.createElement("div");
		this.node.classList.add("entry");
		
		var div2 = document.createElement("div");
		div2.style.marginLeft = "10px";
		div2.style.paddingBottom = "13px";
		var image = new Image(data.user.image, "", data.user.name);
		image.style.backgroundColor = "#FFFFFF";
		console.log(image);
		image.style.marginRight = "15px";
		div2.appendChild(image);
		image.style.cssFloat = "left";
		image.classList.add("sp-image");
		var span = document.createElement("span");
		span.innerHTML = "<b style=\"color: #FFFFFF\">" + data.user.name + "</b><p>" + data.message.substring(0, data.message.indexOf("http://open.spotify.com")) + "</p>" ;
		div2.appendChild(span);
		image.style.width = "32px";
		image.style.height = "32px";
		this.node.appendChild(div2);
		post.node.style.paddingLeft = "48px";
	
		this.node.appendChild(post.node);
		this.node.appendChild(document.createElement("hr"));
	} catch (e) {
		console.log(e.stack);
	}
};
/**
@class Entry
@implements View
**/
exports.Entry = function (album, _album, light, mode) {
	if(typeof(mode) === "undefined") {
		mode = 0;
	}
	if(typeof(light) == "undefined") {
		light = false;
	}
	var div = document.createElement("tr");
	var table = document.createElement("table");
	
	table.setAttribute("cellspacing", 0);
	table.style.width = "100%";
	
	var player = new views.Player(album);
	player.context = album;
	player.data = album.get(0);
	
	var cdiv = document.createElement("td");

	cdiv.setAttribute("valign", "top");
		cdiv.setAttribute("width", "138");
	cdiv.appendChild(player.node);
	div.appendChild(cdiv);
//	cdiv.innerHTML += "<br /><button class=\"add-playlist icon button icon\"><span class=\"plus\"></span>Add as playlist</button>";
	//cdiv.innerHTML += "<br /><button class=\"add-playlist icon button icon\"><span class=\"share\"></span>Share me</button>";
	
	var list = new views.List(album, function(track) {
		return new views.Track(track, views.Track.FIELD.STAR | views.Track.FIELD.NAME | views.Track.FIELD.ARTIST |  views.Track.FIELD.DURATION | views.Track.FIELD.ALBUM |   views.Track.FIELD.SHARE);
	});
	list.node.style.width = "100%";
	if(light)
		list.node.classList.add("sp-light");
	table.setAttribute("class", "post");
	var div2 = document.createElement("td");
	console.log("DTDTF", album);
	var userfield = (typeof(album.data.owner) !== "undefined") ? " <span class=\"by\">by <a href=\"" + album.data.owner.uri + "\">" + album.data.owner.name + "</a>" : "</span>";

	var subscribeHTML = "";
	if(album instanceof models.Playlist) {
		subscribeHTML += "<span> {{0}} subscribers </span>".replace("{{0}}", album.data.subscriberCount);
		if(!album.data.subscribed)
			subscribeHTML += "<button class=\"button\"> + Subscribe</button>";	
	}

	div2.innerHTML = "<h3 style=\"width: 100%\"><a href=\"" + album.data.uri + "\">" + album.name.decodeForText().substring(0, 35) + "</a> " +  userfield + " <span style=\"float: right\">" + subscribeHTML + "</span></h3>";

	
	div.appendChild(div2);
	var tr2 = document.createElement("tr");
	var td2 = document.createElement("td");
	div2.appendChild(document.createElement("br"));
	if(mode == 0) {
		div2.appendChild(list.node);
	} else {
		td2.appendChild(list.node);
	}
	div2.setAttribute("valign", "top");
	tr2.appendChild(td2);
	td2.setAttribute("colspan", 2);
	td2.setAttribute("valign", "top");
	table.appendChild(div);
	table.appendChild(tr2);
	this.node = table;
};
