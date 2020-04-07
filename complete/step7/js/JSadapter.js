/*
 * Seguiment de trajectes
 */
function trace(text) {
    // this function is used for loggin
    if (text[text.length - 1] === '\n') {
	text = text.substring(0, text.length - 1);
    }
    console.log((performance.now() / 1000).toFixed(3) + ": " + text);
}

/*
 * Identificador de navegadors
 */

// funciones con arrays is objetos js
// http://chuwiki.chuidiang.org/index.php?title=Arrays_y_Objetos_en_JavaScript

browser = {
    clave: "valor",
    mozilla: navigator.mozGetUserMedia,
    chrome: navigator.webkitGetUserMedia,
    opera: navigator.getUserMedia,
    explorer: navigator.msGetUserMedia,
    safari: "valorSafari"
};

// miscrosoft alternative for webrtc - 24 july - 13
// http://html5labs.interoperabilitybridges.com/cu-rtc-web/cu-rtc-web.htm 

// webrtc editor draft
// http://www.w3.org/TR/webrtc/				// 10 september - 13
// http://www.w3.org/TR/2012/WD-webrtc-20120209/	// 09 february - 12
// http://dev.w3.org/2011/webrtc/editor/webrtc.html     // 10 april - 14

// build it as a library 

navigator.getMedia = (
	navigator.getUserMedia ||
	navigator.webkitGetUserMedia ||
	navigator.mozGetUserMedia ||
	navigator.msGetUserMedia);

/*
 * Variable de estat de monitorització
 */

var RTCPeerConnection = null;
var getUserMedia = null;
var attachMediaStream = null;
var reattachMediaStream = null;
var webrtcDetectedBrowser = null;
var webrtcDetectedVersion = null;

/** NAVIGATOR DETECTION **/
switch (navigator.getMedia) {
    case navigator.msGetUserMedia:
	console.log("microsoft internet explorer");
	//  none suported 
	setupExplorer();
	break;
    case navigator.mozGetUserMedia:
	console.log("mozilla firefox");
	webrtcDetectedBrowser = "firefox";
	webrtcDetectedVersion = parseInt(navigator.userAgent.match(/Firefox\/([0-9]+)\./)[1]);
	setupFirefox();
	break;
    case navigator.webkitGetUserMedia:
	console.log("google chrome");
	webrtcDetectedBrowser = "chrome";
	webrtcDetectedVersion = parseInt(navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)[2]);
	setupChrome();
	break;
    case navigator.getUserMedia:
	console.log("opera");
	setupOpera();
	break;
    default:
	console.log("browser does not appear to be compatible with webrtc");
	// en aquest cas quan no ho soport mostra per log el primer que troba ;D
	break;
}

/** SETUP **/
function setupChrome() {
    console.log("this appears to be chrome");
    /*
     * tasks
     *  0 create iceserver from the url for chrome
     *  1 create iceserver with stun url
     *  for pre-m28 chrome versions use old turn format
     *  else use new turn format.
     *  http://en.wikipedia.org/wiki/STUN
     *	session traversal utilities for NAT
     *  http://en.wikipedia.org/wiki/Traversal_Using_Relay_NAT
     *	traversal using realays around NAT
     */

    // adaptar una funció existent
    createIceServer = function(url, username, password) {
	var iceServer = null;
	var url_parts = url.split(':');
	if (url_parts[0].indexOf('stun') === 0) {
	    // create ice server with stun url 
	    // perque no s'ha trobat cap candidat
	    iceServer = {'url': url};
	} else
	if (url_parts[0].indexOf('turn') === 0) {
	    if (webrtcDetectedVersion < 28) {
		var url_turn_parts = url.split("turn:");
		iceServer = {
		    'url': 'turn:' + username + '@' + url_turn_parts[1],
		    'credential': password};
	    } else {
		iceServer = {
		    'url': url,
		    'credential': password,
		    'username': username
		};
	    }
	}
	return iceServer;
	// i interactive
	// c conectivity
	// e establishment
    };

    // the RTC peer connection object
    RTCPeerConnection = webkitRTCPeerConnection;

    // get usermedia only difference is the prefix
    // https://coderwall.com/p/o9zrva
    getUserMedia = navigator.webkitGetUserMedia.bind(navigator);

    // atach a media stream to an element 
    attackMediaSrteam = function(element, stream) {
	if (typeof element.srcObject !== 'undefined') {
	    element.srcObject = stream;
	} else
	if (typeof element.mozSrcObject !== 'undefined') {
	    element.mozSrcObject = stream;
	} else if (typeof element.src !== 'undefined') {
	    element.src = URL.createObjectURL(stream);
	} else {
	    console.log('Error attaching stream to element.');
	}
    };

    reattachMediaStream = function(to, from) {
	to.src = from.src;
    };

    // the representation of tracks in a stream is changed in m26
    // unify them for earlier chrome versions in the coexisting period
    // optional ?

    if (!webkitMediaStream.prototype.getVideoTracks) {
	webkitMediaStream.prototype.getVideoTracks = function() {
	    return this.videoTracks;
	};
	webkitMediaStream.prototype.getAudioTracks = function() {
	    return this.audioTracks;
	};
    }

    // New syntax of getXXXStreams method in M26.
    if (!webkitRTCPeerConnection.prototype.getLocalStreams) {
	webkitRTCPeerConnection.prototype.getLocalStreams = function() {
	    return this.localStreams;
	};
	webkitRTCPeerConnection.prototype.getRemoteStreams = function() {
	    return this.remoteStreams;
	};
    }
}

function setupFirefox() {
    console.log("this appears to be firefox");

    // The RTCPeerConnection object.
    RTCPeerConnection = mozRTCPeerConnection;

    // The RTCSessionDescription object.
    RTCSessionDescription = mozRTCSessionDescription;

    // The RTCIceCandidate object.
    RTCIceCandidate = mozRTCIceCandidate;

    // Get UserMedia (only difference is the prefix).
    // Code from Adam Barth.
    getUserMedia = navigator.mozGetUserMedia.bind(navigator);

    // Creates iceServer from the url for FF.
    createIceServer = function(url, username, password) {
	var iceServer = null;
	var url_parts = url.split(':');
	if (url_parts[0].indexOf('stun') === 0) {
	    // Create iceServer with stun url.
	    iceServer = {'url': url};
	} else if (url_parts[0].indexOf('turn') === 0 &&
		(url.indexOf('transport=udp') !== -1 ||
			url.indexOf('?transport') === -1)) {
	    // Create iceServer with turn url.
	    // Ignore the transport parameter from TURN url.
	    var turn_url_parts = url.split("?");
	    iceServer = {'url': turn_url_parts[0],
		'credential': password,
		'username': username};
	}
	return iceServer;
    };

    // Attach a media stream to an element.
    attachMediaStream = function(element, stream) {
	console.log("Attaching media stream");
	element.mozSrcObject = stream;
	element.play();
    };

    reattachMediaStream = function(to, from) {
	console.log("Reattaching media stream");
	to.mozSrcObject = from.mozSrcObject;
	to.play();
    };

    // Fake get{Video,Audio}Tracks
    MediaStream.prototype.getVideoTracks = function() {
	return [];
    };

    MediaStream.prototype.getAudioTracks = function() {
	return [];
    };
}

function setupOpera() {
  // no setup needed, runs as defualt...
}


function setupExplorer(){
    
}



/** INIT **/
function initFunction() {

}
;

function initEventListeners() {

}
;










