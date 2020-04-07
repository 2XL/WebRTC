/* See also:
 http://www.html5rocks.com/en/tutorials/webrtc/basics/
 https://code.google.com/p/webrtc-samples/source/browse/trunk/apprtc/index.html
 
 https://webrtc-demos.appspot.com/html/pc1.html
 */

/*
 * define div ids :D
 */
var modalShowLocalOffer = '#showLocalOffer';
var modalShowLocalAnswer = '#showLocalAnswer';
var modalGetRemoteAnswer = '#getRemoteAnswer';
var modalGetRemoteOffer = '#getRemoteOffer';
var modalWaitForConnection = '#waitForConnection';
var modalCreateOrJoin = '#createOrJoin';

var buttonCreate = '#createBtn';
var buttonJoin = '#joinBtn';
var buttonOfferSent = '#offerSentBtn';
var buttonOfferRcvd = '#offerRecdBtn';
var buttonAnswerSent = '#answerSentBtn';
var buttonAnswerRcvd = '#answerRecdBtn';
var buttonFileTransfer = '#fileBtn';

var taLocalOffer = '#localOffer';
var taLocalAnswer = '#localAnswer';
var taRemoteOffer = '#remoteOffer';
var taRemoteAnswer = '#remoteAnswer';
var taMessageBox = '#messageTextBox';

var taChatLog = '#chatlog';
var idChatLog = 'chatlog';
/* */

var cfg = {"iceServers": [{"url": "stun:23.21.150.121"}]},
con = {'optional': [{'DtlsSrtpKeyAgreement': true}, {'RtpDataChannels': true}]};

/* THIS IS ALICE, THE CALLER/SENDER */

var pcCaller = new RTCPeerConnection(cfg, con),
	dcCaller = null, tnCaller = null;


// Since the same JS file contains code for both sides of the connection,
// activedc tracks which of the two possible datachannel variables we're using.
var activedc;

var pcCallericedone = false;

$(modalShowLocalOffer).modal('hide');
$(modalGetRemoteAnswer).modal('hide');
$(modalWaitForConnection).modal('hide');
$(modalCreateOrJoin).modal('show');





$(buttonCreate).click(function() {
    $(modalShowLocalOffer).modal('show');
});

$(buttonJoin).click(function() {
    $(modalGetRemoteOffer).modal('show');
});

$(buttonOfferSent).click(function() {
    $(modalGetRemoteAnswer).modal('show');
});

$(buttonOfferRcvd).click(function() {
    var offer = $(taRemoteOffer).val();
    var offerDesc = new RTCSessionDescription(JSON.parse(offer));
    console.log("Received remote offer", offerDesc);
    writeToChatLog("Received remote offer", "text-success");
    handleOfferFromPCCaller(offerDesc);
    $(modalShowLocalAnswer).modal('show');
});

$(buttonAnswerSent).click(function() {
    $(modalWaitForConnection).modal('show');
});

$(buttonAnswerRcvd).click(function() {
    var answer = $(taRemoteAnswer).val();
    var answerDesc = new RTCSessionDescription(JSON.parse(answer));
    handleAnswerFromPCCallee(answerDesc);
    $(modalWaitForConnection).modal('show');
});

$(buttonFileTransfer).change(function() {
    var file = this.files[0];
    console.log(file);

    sendFile(file);
});

function fileSent(file) {
    console.log(file + " sent");
}

function fileProgress(file) {
    console.log(file + " progress");
}

function sendFile(data) {
    if (data.size) {
	FileSender.send({
	    file: data,
	    onFileSent: fileSent,
	    onFileProgress: fileProgress
	});
    }
}
























function sendMessage() {
    if ($(taMessageBox).val()) {
	var channel = new RTCMultiSession();
	writeToChatLog($(taMessageBox).val(), "text-success");
	channel.send({message: $(taMessageBox).val()});
	$(taMessageBox).val("");

	// Scroll chat text area to the bottom on new input.
	$(taChatLog).scrollTop($(taChatLog)[0].scrollHeight);
    }

    return false;
}
;


















function setupDCCaller() {
    try {
	var fileReceiverCaller = new FileReceiver();
	dcCaller = pcCaller.createDataChannel('test', {reliable: true});
	activedc = dcCaller;
	console.log("Created datachannel (pcCaller)");
	dcCaller.onmessage = function(e) {
	    console.log("Got message (pcCaller)", e.data);
	    if (e.data.size) {
		fileReceiverCaller.receive(e.data, {});
	    }
	    else {
		var data = JSON.parse(e.data);
		if (data.type === 'file') {
		    fileReceiverCaller.receive(e.data, {});
		}
		else {
		    writeToChatLog(data.message, "text-info");
		    // Scroll chat text area to the bottom on new input.
		    $(taChatLog).scrollTop($(taChatLog)[0].scrollHeight);
		}
	    }
	};
    } catch (e) {
	console.warn("No data channel (pcCaller)", e);
    }
}

getUserMedia({'audio': true, fake: true}, function(stream) {
    console.log("Got local audio", stream);
    pcCaller.addStream(stream);
    setupDCCaller();
    pcCaller.createOffer(function(offerDesc) {
	console.log("Created local offer", offerDesc);
	pcCaller.setLocalDescription(offerDesc);
	$(taLocalOffer).html(JSON.stringify(offerDesc));
    }, function() {
	console.warn("Couldn't create offer");
    });
}, function() {
    console.warn("No audio");
});

pcCaller.onicecandidate = function(e) {
    console.log("ICE candidate (pcCaller)", e);
    if (e.candidate) {
	//handleCandidateFromPC1(e.candidate)
	if (!pcCallericedone) {
	    if (navigator.webkitGetUserMedia) {
		var  localICECandidate;
			localICECandidate =  JSON.stringify(e.candidate);
		document.localICECandidateForm.localICECandidate = localICECandidate;
	    } else if (navigator.mozGetUserMedia) {
		document.localICECandidateForm.localICECandidate.value = JSON.stringify(e.candidate);
	    }


	    pcCallericedone = true;
	}
    }
};

function handleOnconnection() {
    console.log("Datachannel connected");
    writeToChatLog("Datachannel connected", "text-success");
    $(modalWaitForConnection).modal('hide');
    // If we didn't call remove() here, there would be a race on pc2:
    //   - first onconnection() hides the dialog, then someone clicks
    //     on answerSentBtn which shows it, and it stays shown forever.
    $(modalWaitForConnection).remove();
    $(modalShowLocalAnswer).modal('hide');
    $(taMessageBox).focus();
}

pcCaller.onconnection = handleOnconnection;

function handleAnswerFromPCCallee(answerDesc) {
    console.log("Received remote answer: ", answerDesc);
    writeToChatLog("Received remote answer", "text-success");
    pcCaller.setRemoteDescription(answerDesc);
}

function handleCandidateFromPCCallee(iceCandidate) {
    pcCaller.addIceCandidate(iceCandidate);
}


/* THIS IS BOB, THE ANSWERER/RECEIVER */

var pcCallee = new RTCPeerConnection(cfg, con),
	dcCallee = null;

var pcCalleeicedone = false;

pcCallee.ondatachannel = function(e) {
    var fileReceiverCallee = new FileReceiver();
    var datachannel = e.channel || e; // Chrome sends event, FF sends raw channel
    console.log("Received datachannel (pcCallee)", arguments);
    dcCallee = datachannel;
    activedc = dcCallee;
    dcCallee.onmessage = function(e) {
	console.log("Got message (pcCallee)", e.data);
	if (e.data.size) {
	    fileReceiverCallee.receive(e.data, {});
	}
	else {
	    var data = JSON.parse(e.data);
	    if (data.type === 'file') {
		fileReceiverCallee.receive(e.data, {});
	    }
	    else {
		writeToChatLog(data.message, "text-info");
		// Scroll chat text area to the bottom on new input.
		$(taChatLog).scrollTop($(taChatLog)[0].scrollHeight);
	    }
	}
    };
};

function handleOfferFromPCCaller(offerDesc) {
    pcCallee.setRemoteDescription(offerDesc);
    pcCallee.createAnswer(function(answerDesc) {
	writeToChatLog("Created local answer", "text-success");
	console.log("Created local answer: ", answerDesc);
	pcCallee.setLocalDescription(answerDesc);
	$(taLocalAnswer).html(JSON.stringify(answerDesc));
    }, function() {
	console.warn("No create answer");
    });
}

pcCallee.onicecandidate = function(e) {
    console.log("ICE candidate (pcCallee)", e);
    if (e.candidate)
	handleCandidateFromPCCallee(e.candidate);
};

function handleCandidateFromPCCaller(iceCandidate) {
    pcCallee.addIceCandidate(iceCandidate);
}

pcCallee.onaddstream = function(e) {
    console.log("Got remote stream", e);
    var el = new Audio();
    el.autoplay = true;
    attachMediaStream(el, e.stream);
};

pcCallee.onconnection = handleOnconnection;

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
