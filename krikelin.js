var sp = getSpotifyApi(1);
var models = sp.require("sp://import/scripts/api/models");
var views = sp.require("sp://import/scripts/api/views");
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
/**
@class Entry
@implements View
**/
exports.Entry = function (album, _album, light, mode) {
	if(mode == "undefined") {
		mode = 0;
	}
	if(typeof(light) == "undefined") {
		light = false;
	}
	var div = document.createElement("tr");
	var table = document.createElement("table");
	table.setAttribute("cellspacing", 15);
	table.style.width = "90%";
	var player = new views.Player(album);
	player.context = album;
	player.data = album.get(0);
	
	var cdiv = document.createElement("td");

	cdiv.setAttribute("valign", "top");
		cdiv.setAttribute("width", "128");
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

	div2.innerHTML = "<h3><a href=\"" + album.data.uri + "\">" + album.name.decodeForText() + "</a> by <a href=\"" + album.data.artist.uri + "\">" + album.data.artist.name + "</a></h3><p><p>" + _album.comments + "</p>";
	
	
	div.appendChild(div2);
	var tr2 = document.createElement("tr");
	var td2 = document.createElement("td");
	div2.appendChild(document.createElement("br"));
	if(mode == 1) {
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