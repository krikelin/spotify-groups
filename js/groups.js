var sp = getSpotifyApi(1);
var models = sp.require("$api/models");
var views = sp.require("$api/views");
/**
@module groups
**/

/**
@class Group
***/
exports.Group = function (id, access_token) {
	this.access_token = access_token;
	this.id = id;
	this.appendNext = function () {
		this.posts = [];

		var exdata = {
			name : "A",
			message: msg,
			user : {
				name: val.from.name,
				id: val.from.id,
				image: "http://profile.ak.fbcdn.net/hprofile-ak-ash3/574023_1718220971_646609709_n.jpg"
			}
		};
		console.log(val);
	
		if(msg.indexOf("open.spotify.com") !== -1) {
			console.log(msg);
			if(msg.indexOf("open.spotify.com/artist") !== -1) {
				var c = msg.indexOf("open.spotify.com/track");
				var d = msg.length
				var uri = msg.substring(c, d);
			
				uri = uri.replace("http://open.spotify.com/", "spotify:");
				uri = uri.replace("/", ":");
				console.log(uri);
				models.Artist.fromURI(uri, function (artist) {
					console.log("TRACK");
					console.log("artist", artist);
					items.push({item: artist, data: exdata});
				
				});
			}
	
			if(msg.indexOf("open.spotify.com/user") !== -1) {
				var c = msg.indexOf("open.spotify.com/user");
				var d = msg.length;
				var uri = msg.substring(c, d);
				console.log(uri);
				uri = uri.replace(/\//g, ":");
				uri = uri.replace("open.spotify.com:", "spotify:");
			
				var playlist = new models.Playlist();
				models.Playlist.fromURI(uri, function (playlist) {
					try {
						console.log("TRACK");
					
						items.push({item: playlist, data: exdata});
					
				
					} catch (e) {
						console.log(e.stack);
					}
				});
			}
			if(msg.indexOf("open.spotify.com/album") !== -1) {
				var c = msg.indexOf("open.spotify.com/album");
				var d = msg.length;
				var uri = msg.substring(c, d);
				console.log(uri);
			
				uri = uri.replace(/\//g, ":");
				uri = uri.replace("open.spotify.com:", "spotify:");
			
				console.log(uri);                     
				models.Album.fromURI(uri, function (album) {
					try {
						console.log("TRACK");
						console.log("Album", album);
						items.push({item: album, data: exdata});
					
					} catch (e) {
						console.log(e.stack);
					}
				});
			}
		}
	};
};
