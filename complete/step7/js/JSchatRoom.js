'use strict';

writeToChatLog('log start', 'text-success');

/**
 *  EXTRA VARS : 
 */


var isInitiator = false;
var isStarted = false;
var isJoiner = false;
var room;

var pc;
var turnReady;

var cfg = {"iceServers": [{"url": "stun:23.21.150.121"}]};
var pc_config = cfg; // = {'iceServers': [{'url': 'stun:stun.l.google.com:19302'}]};
var pc_constraints = {'optional': [{'DtlsSrtpKeyAgreement': true}, {'RtpDataChannels': true}]};

/*
 * 
 * DATACHANNELS :D?
 */
var dataChannel;
var sendDC;
var recvDC;



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
function startSocketXatRoom() {

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
	isJoiner = true;

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
	    setupDCCaller();
	    pcCaller.createOffer(function(offerDesc) {
		console.log("Created local offer", offerDesc);
		pcCaller.setLocalDescription(offerDesc);
		sdpOffer = JSON.stringify(offerDesc);

		socket.emit('remote sdp', room, sdpOffer);
		writeToChatLog("offer sdp is: " + sdpOffer, "text-info");

	    }, function() {
		console.warn("Couldn't create offer");
	    });
	}, function() {
	    console.warn("No audio");
	});


    });



    socket.on('sdp to join', function(sdp) {
	writeToChatLog("have to join this sdp: " + sdp, "text-info");

	if (isInitiator === true) {
	    var answerDesc = new RTCSessionDescription(JSON.parse(sdp));
	    console.log("Received remote answer: ", answerDesc);
	    writeToChatLog("Received remote answer ", "text-success");
	    pcCaller.setRemoteDescription(answerDesc);

	} else {
	    var offerDesc = new RTCSessionDescription(JSON.parse(sdp));
	    var answersdp;
	    console.log("Received remote offer", offerDesc);
	    writeToChatLog("Received remote offer "+offerDesc, "text-success");

	    pcCallee.setRemoteDescription(offerDesc);
	    pcCallee.createAnswer(function(answerDesc) {

		console.log("Created local answer: ", answerDesc);
		pcCallee.setLocalDescription(answerDesc);
		answersdp = JSON.stringify(answerDesc);
		writeToChatLog("Created local answer: " + answersdp, "text-success");
		socket.emit('remote sdp', room, answersdp);


	    }, function() {
		console.warn("No create answer");
	    });



	}
	writeToChatLog("w8ting for chat ready", "text-warning");
	socket.emit('wait to start', room);
    });


    socket.on('chat ready', function() {
	writeToChatLog("chat is enabled!", "text-success");

	$(xatInputTA).focus();
	$(xatBtnStart).click(function() {
	    // create a room with the current room name and request an sdp 
	    writeToChatLog("aloha start", "text-warning");
	});
	$(xatBtnSend).click(function() {
	    // send msg to datacahnnel
	    writeToChatLog("aloha send", "text-info");
	    sendMessageTest();
	});
	$(xatBtnClose).click(function() {
	    writeToChatLog("aloha close", "text-danger");
	});
    });




// chat room

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



function sendMessageTest() {
    var whoAmI = (isJoiner === true) ? "joiner" : "owner";

    writeToChatLog(whoAmI + ", send: " + $(xatInputTA).val(), "text-success");
    $(xatInputTA).val(""); // reset input field;
    $(xatLogBoard).scrollTop($(xatLogBoard)[0].scrollHeight);
}


function setupDCCaller() {
    try {

	dcCaller = pcCaller.createDataChannel('test', {reliable: true});
	writeToChatLog("Data Channel pccaller" + JSON.stringify(dcCaller), "text-danger");
	activedc = dcCaller;
	console.log("Created datachannel (pcCaller)");
	dcCaller.onmessage = function(msg) {
	    writeToChatLog("msg to caller: " + msg, "text-info");
	    console.log("Got message (pcCaller)", msg.data);
	    if (msg.data.size) {

	    }
	    else {
		var data = JSON.parse(msg.data);
		if (data.type === 'file') {

		}
		else {
		    writeToChatLog(data.message, "text-info");
		    // Scroll chat text area to the bottom on new input.
		    $(xatLogBoard).scrollTop($(xatLogBoard)[0].scrollHeight);
		}
	    }
	};
    } catch (e) {
	writeToChatLog("No data Channel pccaller", "text-danger");
	console.warn("No data channel (pcCaller)", e);
    }
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
 * danger
 * success
 */

var pcCaller = new RTCPeerConnection(pc_config, pc_constraints);
pcCaller.onicecandidate = function(e) {
    console.log("ICE candidate (pcCaller)", e);
    if (e.candiate) {
	if (!pcCallericedone) {
	    document.localICECandidateForm.localICECandidate.value = JSON.stringify(e.candidate);
	    pcCallericedone = true;
	}
    }
};

pcCaller.onconnection = function(e){
    console.log("pcCaller Datachannel connected");
    writeToChatLog("pcCaller Datachannel connected", "text-success");
};







var dcCaller = null;
var tnCaller = null;


var pcCallee = new RTCPeerConnection(pc_config, pc_constraints);
pcCallee.ondatachannel = function(e){
    var datachannel = e.channel || e;
    console.log("pcCallee Received datachannel (pcCallee)", arguments);
    dcCallee = datachannel;
    activedc = dcCallee;
    dcCallee.onmessage = function(e){
	console.log("got message (pcCallee)", e.data);
	if(e.data.size){
	    
	}else{
	    var data = JSON.parse(e.data);
	    if(data.type === 'file'){
		
	    }else{
		writeToChatLog(data.message, "text-info");
	    }
	}
    };
};

pcCallee.onaddstream = function(e){
    console.log("pcCallee got remote stream", e);
    
};

pcCallee.onconnection = function(){
    console.log("pcCallee Datachannel connected");
    writeToChatLog("pcCallee Datachannel connected", "text-success");
};

var dcCallee = null;


// activeDataChannelTracker since we have 2 dc
var activedc;
var pcCallericedone = false;
var pcCalleeicedone = false;


var cfg = {"iceServers": [{"url": "stun:23.21.150.121"}]},
con = {'optional': [{'DtlsSrtpKeyAgreement': true}, {'RtpDataChannels': true}]};


// enviar un missatge create or join al socket





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