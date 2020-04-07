
// add the javascript from  step4 in index.html

// test it locally :D


// explanation :D


// this code uses 
/*
 * RTCPeerConnection
 * RTCDataChannel
 *  enable exchange of text messages.
 */
// step 4 js
var sendChannel;
var receiveChannel;


var startButton = document.getElementById("startButton");
var sendButton = document.getElementById("sendButton");
var closeButton = document.getElementById("closeButton");

startButton.disibled = false;
sendButton.disibled = true;
closeButton.disibled = true;

startButton.onclick = createConnection;
sendButton.onclick = sendData;
closeButton.onclick = closeDataChannels;


/**
 * funció que crea la connexió o estableix la connexió
 * obre un canal local i l'offereix al remot
 * @returns {undefined}
 */
function createConnection() {
    var servers = null;
    window.localPeerConnection = new RTCPeerConnection(servers,
	    {optional: [{RtpDataChannels: true}]});
    writeToChatLog("Created local peer connection object localPeerConnection", "local");
    try {
	sendChannel = localPeerConnection.createDataChannel("sendDataChannel",
		{reliable: false});
	writeToChatLog("Created send data Channel", "local");
    } catch (e) {
	writeToChatLog("Failed to create data Channel", "text-warning");
	writeToChatLog("createDataChannel() failed with exception: " + e.message);
    }
    localPeerConnection.onicecandidate = gotLocalCandidate; // es un action listener cap a una funció
    sendChannel.onopen = handleSendChannelStateChange;	// action listener cuan s'obre el canal
    sendChannel.onclose = handleSendChannelStateChange; // action listener per cuan se tanca el canal

    window.remotePeerConnection = new RTCPeerConnection(servers,
	    {optional: [{RtpDataChannels: true}]});
    // intentar obrir una connexió remota després d'haver establic la connecxió local 
    // en aquest exemple consisteixen en el mateix :D

    remotePeerConnection.onicecandidate = gotRemoteIceCandidate;
    remotePeerConnection.ondatachannel = gotReceiveChannel;

    localPeerConnection.createOffer(gotLocalDescription, handleError); // crear una offerta :D?

    // actualitzar els estats dels botons
    startButton.disibled = true;
    closeButton.disibled = false;
}




function sendData() {
    var data = document.getElementById("dataChannelSend").value;
    sendChannel.send(data);
    writeToChatLog("Send data: " + data, "local");
}

function closeDataChannels() {
    writeToChatLog("Closing data Channels", "text-error");
    sendChannel.close;
    writeToChatLog("Closed data Channel with label: " + sendChannel.label,"local");
    receiveChannel.close;
    writeToChatLog("Closed data Channel with label: " + receiveChannel.label,"remote");

    localPeerConnection.close();
    remotePeerConnection.close();

    localPeerConnection = null;
    remotePeerConnection = null;

    writeToChatLog("Closed peer connections","muted");

    startButton.disibled = false;
    sendButton.disibled = true;
    closeButton.disibled = true;

    dataChannelSend.value = "";
    dataChannelReceive.value = "";

    dataChannelSend.disibled = true;
    dataChannelSend.placeholder = "Press Start, enter some text, then press Send!";

}


function gotLocalDescription(desc) {
    localPeerConnection.setLocalDescription(desc);
    writeToChatLog("Offer from localPeerConnection \n" + desc.sdp,"local");
    remotePeerConnection.setRemoteDescription(desc);
    remotePeerConnection.createAnswer(gotRemoteDescription, handleError);
}

function gotRemoteDescription(desc) {
    remotePeerConnection.setLocalDescription(desc); // se li asgina lo mateix :D
    writeToChatLog("Answer from remtoePeerConnection \n" + desc.sdp,"remote");
    localPeerConnection.setRemoteDescription(desc);
}

function gotLocalCandidate(event) {
    writeToChatLog("local ICE callback","local");
    if (event.candidate) {
	remotePeerConnection.addIceCandidate(event.candidate);
	writeToChatLog("Local ICE candidate: \n" + event.candidate.candidate,"local");
    }
}


function gotRemoteIceCandidate(event) {
    writeToChatLog("Remote ICE callback","remote");
    if (event.candidate) {
	localPeerConnection.addIceCandidate(event.candidate);
	writeToChatLog("Remote ICE candidate: \n" + event.candidate.candidate,"remote");
    }
}

function gotReceiveChannel(event) {
    writeToChatLog("Receive Channel Callback","remote");
    receiveChannel = event.channel;
    receiveChannel.onmessage = handleMessage;
    receiveChannel.onopen = handleReceiveChannelStateChange;
    receiveChannel.onclose = handleReceiveChannelStateChange;
}

function handleMessage(event) {
    writeToChatLog("Receive message: " + event.data,"remote");
    document.getElementById("dataChannelReceive").value = event.data;
}

function handleSendChannelStateChange() {
    var readyState = sendChannel.readyState;
    writeToChatLog("Send channel state is: " + readyState,"local");
    if (readyState === "open") {
	dataChannelSend.disibled = false;
	dataChannelSend.focus();
	dataChannelSend.placeholder = "";
	sendButton.disibled = false;
	closeButton.disibled = false;
    } else {
	dataChannelSend.disibled = true;
	sendButton.disibled = true;
	closeButton.disibled = true;
    }
}

function handleReceiveChannelStateChange() {
    var readyState = receiveChannel.readyState;
    writeToChatLog("Receive channel state is: " + readyState,"remote");
}
























// error handlers:

function handleError(error) {
    var text = "hangleError: " + error;
    writeToChatLog(getPerformanceNow(text));
}



// debugger tools :D
function getPerformanceNow(text) {
    return (performance.now() / 1000).toFixed(3) + ': ' + text;
}


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

//text-success : message_type
function writeToChatLog(message, message_type) {
 // http://getbootstrap.com/2.3.2/base-css.html
    /*
     * muted
     * text-warning
     * text-error
     * text-info
     * text-success
     */
    message = getPerformanceNow(message);
    if (typeof message_type === "undefined" || message_type === null) {
	message_type = "text-success";
    } else
    if (message_type === "local") {
	message_type = "text-warning";
    } else
    if (message_type === "remote") {
	message_type = "text-info";
    }


    document.getElementById('chatlog').innerHTML += '<p class=\"' + message_type + '\">' + "[" + getTimestamp() + "] " + message + '</p>';

}




function trace(text) {
    console.log((performance.now() / 1000).toFixed(3) + ": " + text);
}


// add placeholder to textarea
$("#dataChannelReceive").attr('placeholder',"Here goes the Received data");
    