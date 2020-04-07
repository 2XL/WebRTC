'use strict';

writeToChatLog('log start', 'text-success');

/**
 *  EXTRA VARS : 
 */


var isInitiator = false;
var isStarted = false;
var room;

var pc;
var turnReady;

var cfg = {"iceServers": [{"url": "stun:23.21.150.121"}]};
var pc_config = {'iceServers': [{'url': 'stun:stun.l.google.com:19302'}]};
var pc_constraints = {'optional': [{'DtlsSrtpKeyAgreement': true}, {'RtpDataChannels': true}]};

var thispc = new RTCPeerConnection(cfg, {optional: [{RtpDataChannels: true}]});



if (location.hostname !== "localhost") {
    requestTurn('https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913');
}
function requestTurn(turn_url) {
    var turnExists = false;
    for (var i in pc_config.iceServers) {
	if (pc_config.iceServers[i].url.substr(0, 5) === 'turn:') {
	    turnExists = true;
	    turnReady = true;
	    break;
	}
    }
    if (!turnExists) {
	console.log('Getting TURN server from ', turn_url);
	// No TURN server. Get one from computeengineondemand.appspot.com:
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
	    if (xhr.readyState === 4 && xhr.status === 200) {
		var turnServer = JSON.parse(xhr.responseText);
		console.log('Got TURN server: ', turnServer);
		pc_config.iceServers.push({
		    'url': 'turn:' + turnServer.username + '@' + turnServer.turn,
		    'credential': turnServer.password
		});
		turnReady = true;
	    }
	};
	xhr.open('GET', turn_url, true);
	xhr.send();
    }
}


/** * **/

var socket = io.connect();

function trace(text) {
    console.log((performance.now() / 1000).toFixed(3) + ": " + text);
}

// ALL RESPONSES
function startSocketXatRoom(){
    var isInitiator = false;
// room = prompt("Enter room name:");
    room = "Step7XatRoom";

    var socket = io.connect();

    if (room !== "") {
	console.log('Joining xat room ' + room);
	socket.emit('create or join', room); // aki per defecte ho fa
    }

    socket.on('full', function(room) {
	console.log('Room ' + room + ' is full');
	writeToChatLog("the room is full", "text-success");

    });

    socket.on('created', function(room) {
	console.log('Server Callback room ' + room + ' succesfully created!');
	writeToChatLog("room succesfully created", "text-success");

    });

    socket.on('joined', function(room) {
	console.log('Server Callback client successfully joined room: ' + room);
	writeToChatLog("succesfully joined the room", "text-success");

    });

    socket.on('empty', function(room) {
	isInitiator = true;
	console.log('Room ' + room + ' is empty');
	writeToChatLog("room is empty", "text-success");
    });

    socket.on('join', function(room) { // when some one join room this event shows
	console.log('Making request to join room ' + room);
	console.log('You are the initiator!');
	writeToChatLog("your the room initiator", "text-success");
    });

    // more socket events

    socket.on('sdp offer request', function(idsocket) {
	writeToChatLog("socket: [" + idsocket + "], requesting my sdp offer", "text-warning");
	var sdpOffer = "sdp offer";

	getUserMedia({'audio': true, fake: true}, function(stream) {
	    console.log("Got local audio", stream);
	    pcCaller.addStream(stream);
	    pcCaller.createOffer(function(offerDesc) {
		console.log("Created local offer", offerDesc);
		writeToChatLog("local offer "+offerDesc);
		pcCaller.setLocalDescription(offerDesc);
		sdpOffer = JSON.stringify(offerDesc);
	    }, function() {
		console.warn("Couldn't create offer");
	    });
	}, function() {
	    console.warn("No audio");
	});

	socket.emit('remote sdp', room, sdpOffer);
	writeToChatLog("offer sdp is: "+sdpOffer);
    });

 

    socket.on('sdp to join', function(sdp) {
	writeToChatLog("have to join this sdp: " + sdp, "text-info");
	
	if (isInitiator){
	    var answerDesc = new RTCSessionDescription(JSON.parse(sdp));
	    console.log("Received remote answer: ", answerDesc);
	    writeToChatLog("Received remote answer ", "text-success");
	    pcCaller.setRemoteDescription(answerDesc);
	    
	} else { 
	    var offerDesc = new RTCSessionDescription(JSON.parse(sdp));
	    var answersdp;
	    console.log("Received remote offer", offerDesc);
	    writeToChatLog("Received remote offer", "text-success");

	    pcCallee.setRemoteDescription(offerDesc);
	    pcCallee.createAnswer(function(answerDesc) {
		writeToChatLog("Created local answer", "text-success");
		console.log("Created local answer: ", answerDesc);
		pcCallee.setLocalDescription(answerDesc); 
		answersdp = JSON.stringify(answerDesc);
	    }, function() {
		console.warn("No create answer");
	    });
	    
	    socket.emit('remote sdp', answersdp); 

	}

	socket.emit('wait to start', room);
    });

    socket.on('chat ready', function() {
	writeToChatLog("chat is enabled!", "text-success");
    });

    socket.on('log', function(array) {
	console.log.apply(console, array);
    });

    socket.on('message', function(message) {

	console.log('Client received message:', message);
	writeToChatLog(message, "text-warning");
	if (message === 'got user media') {
	    //   maybeStart(); // arrancar el vid del remot
	} else {
	    switch (message.type) {
		case 'offer': // 

		    break;
		case 'answer':

		    break;
		case 'candidate':

		    break;
		case 'bye':

		    break;
		default:
		    console.log('Client message option unknown or mistaken', message);
		    break;
	    }
	}


    });


}


/* manual emit and set event listeners to the server */

function sendMessage(message) {
    console.log('Client sending message: ', message);
    socket.emit('message', message);
}




/** inicialitzar els elements dom **/
var sendChannel;
var receiveChannel;


var xatLogBoard = document.getElementById("chatLog");
var xatChatLog = document.getElementById("chatlog");

var xatInputTA = document.getElementById("localChatBox");

var xatBtnStart = document.getElementById("startBtn");
var xatBtnSend = document.getElementById("sendBtn");
var xatBtnClose = document.getElementById("closeBtn");

/** incialitzar onclick listeners **/

xatBtnStart.disabled = false;
xatBtnSend.disabled = true;
xatBtnClose.disabled = true;














/****************************/
/** START CODING FROM HERE **/
/****************************/
/*
 * info
 * warning
 * error
 * success
 */

var pcCaller = new RTCPeerConnection(pc_config, pc_constraints);
var dcCaller = null;
var tnCaller = null;


var pcCallee = new RTCPeerConnection(pc_config, pc_constraints);
var dcCallee = null;


// activeDataChannelTracker since we have 2 dc
var activedc;
var pcCallericedone = false;
var pcCalleeicedone = false;


var cfg = {"iceServers": [{"url": "stun:23.21.150.121"}]},
con = {'optional': [{'DtlsSrtpKeyAgreement': true}, {'RtpDataChannels': true}]};


var pcCaller = new RTCPeerConnection(cfg, con),
	dcCaller = null, tnCaller = null;

writeToChatLog(JSON.stringify(pcCaller), "text-error");

var activedc;
var pcCallericedone = false;


// modal create or join -> ja sabem quin es el create i quin es el join
// ab el is initiator var
/*
if (isInitiator) {
    alert("im the initiator - createBtn - modalShowLocalOffer");
} else {
    alert("im the joiner - joinBtn - modalGetRemoteOffer");
}
*/










// enviar un missatge create or join al socket


$(xatBtnStart).click(function() {
    // create a room with the current room name and request an sdp 
    writeToChatLog("show my sdp", "text-warning");
});

$(xatBtnSend).click(function() {
    // send msg to datacahnnel
});




































































// connection utility


function getTimestamp() {
    var totalSec = new Date().getTime() / 1000;
    var hours = parseInt(totalSec / 3600) % 24;
    var minutes = parseInt(totalSec / 60) % 60;
    var seconds = parseInt(totalSec % 60);

    var result = (hours < 10 ? "0" + hours : hours) + ":" +
	    (minutes < 10 ? "0" + minutes : minutes) + ":" +
	    (seconds < 10 ? "0" + seconds : seconds);

    return result;
}



function writeToChatLog(message, message_type) {
    document.getElementById('chatlog').innerHTML += '<p class=\"' + message_type + '\">' + "[" + getTimestamp() + "] " + message + '</p>';
}