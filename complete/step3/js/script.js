/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


// elememts

var videoLocal = "#localVideo";
var videoRemote = "#remoteVideo";

var buttonStart = "#startButton";
var buttonCall = "#callButton";
var buttonHangUp = "#hangupButton";


// variables

var localStream;
var localPeerConnection;
var remotePeerConnection;


// javascript

var localVideo = document.getElementById("localVideo");
var remoteVideo = document.getElementById("remoteVideo");

var startButton = document.getElementById("startButton");
var callButton = document.getElementById("callButton");
var hangUpButton = document.getElementById("hangupButton");

// set defualt avaulability secuence 

startButton.disabled = false;
callButton.disabled = true;

// set defualt actionlistener controller fnctions
startButton.onclick = start;
callButton.onclick = call;
hangUpButton.onclick = hangup;

function gotStream(stream) {
    // aquesta funció se li pasa per parametre al get user media que facilitara un stream or not i l'executara o no 
    var text = 'gotStream ' + stream + ' received local stream';
    writeToChatLog(getPerformanceNow() + text);
    localVideo.src = URL.createObjectURL(stream); // asignar ruta del contingut video
    localStream = stream;   //
    callButton.disabled = false;
}

function gotRemoteStream(event) {
    var text = 'gotRemoteStream ' + event + ' received remote stream';
    remoteVideo.src = URL.createObjectURL(event.stream);
    writeToChatLog(getPerformanceNow(text));
}


function gotStreamError(error) {
    var text = 'gotStream failed: ' + error;
    writeToChatLog(getPerformanceNow(text));
}

var constraints = {
    audio: true,
    video: true
};


function start() {
 
    var text = 'start: requesting local stream'; 
    startButton.disabled = true; 
    writeToChatLog(getPerformanceNow(text));
    getUserMedia(constraints, gotStream, gotStreamError);
            
}

/*
function start() {
    trace("Requesting local stream");
    startButton.disabled = true;
    getUserMedia({audio: true, video: true}, gotStream,
            function(error) {
                trace("getUserMedia error: ", error);
            });
}
*/
function call() {
    callButton.disabled = true;
    hangUpButton.disibled = false;
    var text = "call: starting call";
    writeToChatLog(getPerformanceNow(text));

    if (localStream.getVideoTracks().length > 0) {
        writeToChatLog(getPerformanceNow('Using video device: ' + localStream.getVideoTracks()[0].label));
    }
    if (localStream.getAudioTracks().lenght > 0) {
        writeToChatLog(getPerformanceNow('Using audio device: ' + localStream.getAudioTracks()[0].label));
    }

    var server = null; // declarar un servidor
    // no fai servir cap servidor :D

    localPeerConnection = new RTCPeerConnection(server);
    writeToChatLog(getPerformanceNow("create local connection object localPeerConnection"));
    localPeerConnection.onicecandidate = gotLocalIceCandidate;

    remotePeerConnection = new RTCPeerConnection(server); // estroben en la mateixa plana :D haha me truco a mi mateix :D servi
    writeToChatLog(getPerformanceNow("created remote connection object remotePeerConnction"));
    remotePeerConnection.onicecandidate = gotRemoteIceCandidate;
    remotePeerConnection.onaddstream = gotRemoteStream;

    localPeerConnection.addStream(localStream);
    writeToChatLog(getPerformanceNow("added localStream to localPeerConnection"));
    localPeerConnection.createOffer(gotLocalDescription, handleError);

}


// handlers when ok

function gotLocalDescription(description) {
    localPeerConnection.setLocalDescription(description);
    writeToChatLog(getPerformanceNow("offer from localPeerConnection: \n" + description.sdp));
    remotePeerConnection.setRemoteDescription(description);
    remotePeerConnection.createAnswer(gotRemoteDescription, handleError);
}

function gotRemoteDescription(description) {
    remotePeerConnection.setLocalDescription(description);
    writeToChatLog(getPerformanceNow("answer form remotePeerConnection: \n" + description.sdp));
    localPeerConnection.setRemoteDescription(description);
}


function hangup() {
    writeToChatLog(getPerformanceNow("ending call:... "));
    localPeerConnection.close(); // closing local data channel :D
    remotePeerConnection.close(); // close remote data channel
    localPeerConnection = null;
    remtoePeerConnection = null;
    hangUpButton.disibled = true;
    callButton.disabled = false;
}

// manage ice candidates:


function gotLocalIceCandidate(event) {
    if (event.candidate) {
        remotePeerConnection.addIceCandidate(new RTCIceCandidate(event.candidate));
        writeToChatLog("local ICE candidate: \n" + event.candidate.candidate);
    }
}


function gotRemoteIceCandidate(event) {
    if (event.candidate) {
        localPeerConnection.addIceCandidate(new RTCIceCandidate(event.candidate));
        writeToChatLog("remote ICE candidate: \n" + event.candidate.candidate);
    }
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

    if (typeof message_type === "undefined" || message_type === null) {
        message_type = "text-success";
    }
    document.getElementById('chatlog').innerHTML += '<p class=\"' + message_type + '\">' + "[" + getTimestamp() + "] " + message + '</p>';

}


function trace(text) {
    console.log((performance.now() / 1000).toFixed(3) + ": " + text);
}
