/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/*
 * RTCPeerConnection with messaging :D
 * 
 */

/*
 * in this step we build a video chat client, using signaling server we created in step 5 and the rtcpeerConnection code from step 3
 */

/*
 * we will use adapter.js, ...
 * 
 * to ensure that you have node...
 * 
 */

/*
 * haha its so cool but haw did i got work?
 * the key is understanding main.js
 * 
 */


/*
 * this application only suport 1-1 vid chat
 */



/*
 * its hardcoded :D
 * the server is exactly the same the only thing worth is the code :D
 */




/*
 * lets go scripting
 */



'use strict';  // whats this?


var isChannelReady;
var isInitiator = false;
var isStarted = false;
var localStream;
var pc;
var remoteStream;
var turnReady;

var pc_config = {'iceServers': [{'url': 'stun:stun.l.google.com:19302'}]};
// servidor stun de google?

var pc_constraints = {'optional': [{'DtlsSrtpKeyAgreement': true}]};
// tell me what this is expected to be :D


// set up audio and video regardless of what devices are present
var sdpConstraints = {'mandatory': {
	'OfferToReceiveAudio': true,
	'OfferToReceiveVideo': true
    }
};


///

var room = location.pathname.substring(1); // 
if (room === '') {
    // room == promt(""); crap :D
    room = '4PAKINKAT';
} else {
    //
}

var socket = io.connect();

if (room !== '') {
    console.log('Create or join room ', room);
    socket.emit('create or join', room);
}

socket.on('created', function(room) {
    console.log('created room ' + room);
    isInitiator = true;
});

socket.on('full', function(room) {
    console.log('room ' + room + ' is full');
});


socket.on('join', function(room) {
    console.log('another peer made a request to join room ' + room);
    console.log('this peer is the initiator of room ' + room + '!');
    isChannelReady = true;
});

socket.on('joined', function(room) {
    console.log('this peer has joined room ' + room);
    isChannelReady = true;
});


socket.on('log', function(array) {
    console.log.apply(console, array);
});

// ok asta aki todo de step 5
// --------------------------------------
// ahora backward a step 4 


function sendMessage(message) {
    console.log('client sending message: ', message);
    socket.emit('message', message);
}

socket.on('message', function(message) {
    console.log('client received message: ', message);
    if (message === 'got user media') {
	maybeStart();

    } else if (message.type === 'offer') { // inicialitzar una sala i generar un handshake
	if (!isInitiator && !isStarted) {
	    maybeStart();
	}
	pc.setRemoteDescription(new RTCSessionDescription(message));
	doAnswer();
    } else if (message.type === 'answer' && isStarted) { // asignar un handshake remot de resposta
	pc.setRemoteDescription(new RTCSessionDescription(message));
    } else if (message.type === 'candidate' && isStarted) {
	var candidate = new RTCIceCandidate({ // asignar handshake remot de inici
	    sdpMLineIndex: message.label,
	    candidate: message.candidate
	});
	pc.addIceCandidate(candidate);
    } else if (message === 'bye' && isStarted) { // finalització de sessió alliberar recurs ocupat i que s'hi pugui incorporar un nou usuari :D
	handleRemoteHangup();
    }
});


// --------------------------------------------------------


var localVideo = document.querySelector('#localVideo');
var remoteVideo = document.querySelector('#remoteVideo');

function handleUserMedia(stream) {
    console.log('adding local stream. ');
    localVideo.src = window.URL.createObjectURL(stream);
    localStream = stream;
    sendMessage('got user media');
    if (isInitiator) {
	maybeStart();
    }
}

function handleUserMediaError(error) {
    console.log('getUserMedia error: ', error);
}

var constraints = {video: true};

getUserMedia(constraints, handleUserMedia, handleUserMediaError);
console.log('getting user media with constraints', constraints);

if (location.hostname != "localhost") {
    requestTurn('https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913');
}


function maybeStart() {
    if (!isStarted && typeof localStream != 'undefined' && isChannelReady) {
	createPeerConnection();
	pc.addStream(localStream);
	isStarted = true;
	console.log('isInitiator', isInitiator);
	if (isInitiator) {
	    doCall();
	}
    }
}

window.onbeforeundload = function(e) {
    sendMessage('bye');
};

//----------------------------------------------------------------------------- 

function createPeerConnection() {
    try {
	pc = new RTCPeerConnection(null);
	pc.onicecandidate = handleIceCandidate;
	pc.onaddstream = handleRemoteStreamAdded;
	pc.onremovestream = handleRemoteStreamRemoved;
	console.log('created rtcpeerconnection');
    } catch (e) {
	console.log('failed to create peerconnection, exception: ' + e.message);
	alert('cannot create rtcpeerconnection object!');
	return;
    }
}

function handleIceCandidate(event) {
    console.log('handleIceCandidate event: ', event);
    if (event.candidate) {
	sendMessage({
	    type: 'candidate',
	    label: event.candidate.sdpMLineIndex,
	    id: event.candidate.sdpMid,
	    candidate: event.candidate.candidate
	});
    } else {
	console.log('end of candidates');
    }
}

function handleRemoteStreamAdded(event) {
    console.log('remote stream added');
    remoteVideo.src = window.URL.createObjectURL(event.stream);
    remoteStream = event.stream;
}

function handleCreateOfferError(event) {
    console.log('createOffer() error', e);
}

function doCall() {
    console.log('sending offer to peer');
    pc.createOffer(setLocalAndSendMessage, handleCreateOfferError);
}

function doAnswer() {
    console.log('sending answer to peer');
    pc.createAnswer(setLocalAndSendMessage, null, sdpConstraints);
}


function setLocalAndSendMessage(sessionDescription) {
    // set opus as the prefered codec in sdp if opus is present
    sessionDescription.sdp = preferOpus(sessionDescription.sdp);
    pc.setLocalDescription(sessionDescription);
    console.log('setLocalAndSendMessage sending message', sessionDescription);
    sendMessage(sessionDescription);
}

function requestTurn(turn_url) {
    var turnExists = false;
    for (var i in pc_config.iceServers) {
	if (pc_config.iceServers[i].url.substr(0, 5) === 'turn:') {
	    turnExists = true;
	    turnReady = true;
	    beak;
	}
    }






    if (!turnExists) {
	console.log('getting turn server from ', turn_url);
	var xhr = new XMLhttpRequest();
	xhr.onreadystatechange = function() {
	    if (xhr.readyState === 4 && xhr.status === 200) {
		var turnServer = JSON.parse(xhr.responseText);
		console.log('got turn server: ', turnServer);
		pc_config.iceServers.push({
		    'url': 'turn:' + turnServer.username + '@' + turnServer.turn,
		    'credential': turnServer.password
		});
		turnReady = true;
	    }
	};
	xhr.open('GET', turn_url, true);
	xhr.send();
    } // no turn server get one form conputeengineondemand.appspot.com
}


function handleRemoteStreamAdded(event) {
    console.log('Remote stream added.');
    remoteVideo.src = window.URL.createObjectURL(event.stream);
    remoteStream = event.stream;
}

function handleRemoteStreamRemoved(event) {
    console.log('remote stream removed. event: ', event);
}


function hangup() {
    console.log('hangup. ');
    stop();
    sendMessage('bye');
}

function handleRemoteHangup() {

}


// pc es peer connection = 

function stop() {
    isStarted = false;
    pc.close();
    pc = null;

}


// codecs


// set opus as default audio code if its persent

function preferOpus(sdp) {
    var sdpLines = sdp.split('\r\n');
    var mLineIndex;
    // search for m line

    for (var i = 0; i < sdpLines.length; i++) {
	if (sdpLines[i].search('m=audio') !== -1) {
	    mLineIndex = i;
	    break;
	}
    }
    if (mLineIndex === null) {
	return sdp;
    }

    // if opus is available , set it as deafutl in m line
    for (i = 0; i < sdpLines.length; i++) {
	if (sdpLines[i].search('opus/48000') !== -1)
	{
	    var opusPayload = extractSdp(sdpLines[i], /:(\d+) opus\/48000/i);
	    if (opusPayload) {
		sdpLines[mLineIndex] = setDefaultCodec(sdpLines[mLineIndex], opusPayload);
	    }
	    break;
	}
    }


    // remove canonical name :D
    sdpLines = removeCN(sdpLines, mLineIndex);
    sdp = sdpLines.join('\r\n');

    return sdp;
}
function extractSdp(sdpLine, pattern) {
    var result = sdpLine.match(pattern);
    return result && result.length === 2 ? result[1] : null;
}




// Set the selected codec to the first in m line.
function setDefaultCodec(mLine, payload) {
    var elements = mLine.split(' ');
    var newLine = [];
    var index = 0;
    for (var i = 0; i < elements.length; i++) {
	if (index === 3) { // Format of media starts from the fourth.
	    newLine[index++] = payload; // Put target payload to the first.
	}
	if (elements[i] !== payload) {
	    newLine[index++] = elements[i];
	}
    }
    return newLine.join(' ');
}

// Strip CN from sdp before CN constraints is ready.
function removeCN(sdpLines, mLineIndex) {
    var mLineElements = sdpLines[mLineIndex].split(' ');
    // Scan from end for the convenience of removing an item.
    for (var i = sdpLines.length - 1; i >= 0; i--) {
	var payload = extractSdp(sdpLines[i], /a=rtpmap:(\d+) CN\/\d+/i);
	if (payload) {
	    var cnPos = mLineElements.indexOf(payload);
	    if (cnPos !== -1) {
		// Remove CN payload from m line.
		mLineElements.splice(cnPos, 1);
	    }
	    // Remove CN line in sdp
	    sdpLines.splice(i, 1);
	}
    }

    sdpLines[mLineIndex] = mLineElements.join(' ');
    return sdpLines;
}





























