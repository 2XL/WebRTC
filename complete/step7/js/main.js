'use strict';



// codi js del step 3 per lo de intercanvi de missatges mitjançant un canal de dades 


var sendChannel;
var sendButton = document.getElementById("sendButton");
var sendTextarea = document.getElementById("dataChannelSend");
var receiveTextarea = document.getElementById("dataChannelReceive");
sendButton.onclick = sendData;
var isChannelReady;
var isInitiator;
var isStarted;
var localStream;
var pc;
var remoteStream;
var turnReady;

var pc_config = webrtcDetectedBrowser === 'firefox' ?
	{'iceServers': [{'url': 'stun:23.21.150.121'}]} : // number IP
	{'iceServers': [{'url': 'stun:stun.l.google.com:19302'}]};
var pc_constraints = {
    'optional': [
	{'DtlsSrtpKeyAgreement': true},
	{'RtpDataChannels': true}
    ]};
// Set up audio and video regardless of what devices are present.
var sdpConstraints = {'mandatory': {
	'OfferToReceiveAudio': true,
	'OfferToReceiveVideo': true}};

/////////////////////////////////////////////

var room = location.pathname.substring(1);
if (room === '') {
//  room = prompt('Enter room name:');
    room = 'Step7Room'; // default is foo
} else {
    //
}



var socket = io.connect(); // crear un intermediari amb el socket desde la pagina principal que utilitzin la mateixa tecnologia

if (room !== '') {
    // if room is not null... al entrar en index sortira aixo per el log despres de carregar el fitxer js
    console.log('Create or join room', room); // mostrar un log per consola de debugador
    socket.emit('create or join', room); // emetre missatge al websocket i el mateix temps jo mateix també poseixo un socket propi que pot rebre peticions
    // el primer parametre es com una entrada clau valor d'un diccionari
    // potse ho estic entenent malament, socket on es quan es detecta que el socket remot es troba en la condicio que hi 
    // figura en els diferents estats que treactem
    // hi ha un unic socket i tot els intervencions es fan per pas de missatges 

}

// quan el servidor emet una senyal de genrar una cambra nova jo haure de informat el fet per consola
socket.on('created', function(room) {
    console.log('Created room ' + room);
    isInitiator = true; // variable de monitorització a cert 
});


// quan el socket emet una senyal de que la cmabra esta plena jo haure de informar aquest fet per consola de debug
socket.on('full', function(room) {
    console.log('Room ' + room + ' is full');
});
// quan el socket emet una senyal de que la cambra ha rebut un afegiment aleshores jo haure de informar per terminal de debug que jo he rebut un request remot amb la intenfció de afegirse a la meva cambra 
socket.on('join', function(room) {
    console.log('Another peer made a request to join room ' + room);
    console.log('This peer is the initiator of room ' + room + '!');
    isChannelReady = true; // si ja he inicialitzat i he rebut una peticio de participació aleshores podem considerer que el canal esta preparat per reslitzar una peer connection
});


// el creador es el propietari de la cambra
// tenim aqui dos casos pero un usuari només podra rebre un dels casos ja que sempre distingirem el creador de la resta dels usuaris participants
// l'apartat aneterior es que se ha rebut una intencio de participació no que s'hagi completat l'establiment del canal de participació
socket.on('joined', function(room) {
    console.log('This peer has joined room ' + room);
    isChannelReady = true;
});


// socket io how to use : http://socket.io/#how-to-use


// aquesta rutina es especial perque permet que s'escrigui o mostri un array per el terminal de debug
// encanvi els per defecte només mostren un parametre concret
socket.on('log', function(array) {
    console.log.apply(console, array);
});

////////////////////////////////////////////////


// funció per enviar un missatge mitjançant el web socket de intermediari
function sendMessage(message) {
    console.log('Sending message: ', message);
    socket.emit('message', message);
}
// jo mateix també rebre el missatge emes per el chatroom
socket.on('message', function(message) {
    console.log('Received message:', message);

    // from -->

    /*
     if (message === 'got user media') {
     maybeStart();
     } else
     if (message.type === 'offer') {
     if (!isInitiator && !isStarted) {
     maybeStart();
     }
     pc.setRemoteDescription(new RTCSessionDescription(message));
     doAnswer();
     } else
     if (message.type === 'answer' && isStarted) {
     pc.setRemoteDescription(new RTCSessionDescription(message));
     } else
     if (message.type === 'candidate' && isStarted) {
     var candidate = new RTCIceCandidate({sdpMLineIndex: message.label,
     candidate: message.candidate});
     pc.addIceCandidate(candidate);
     } else
     if (message === 'bye' && isStarted) {
     handleRemoteHangup();
     }
     */
    // to -->

    switch (message) {
	case 'got user media' :
	    maybeStart();
	    break;
	case 'offer':
	    if (!isInitiator && !isStarted) {
		maybeStart();
	    }
	    pc.setRemoteDescription(new RTCSessionDescription(message));
	    doAnswer();
	    break;
	case 'answer':
	    pc.setRemoteDescription(new RTCSessionDescription(message));
	    break;
	case 'candidate':
	    var rtcIceConfig = {sdpMLineIndex: message.label, candidate: message.candidate};
	    var candidate = new RTCIceCandidate(rtcIceConfig);
	    pc.addIceCandidate(candidate);
	    break;
	case 'bye':
	    handleRemoteHangup();
	    break;
	default:
	    // there should be something wrong here
	    break;
    }
});


/////////////////////////////////////////////////////
// codi js del apartat step6 -- 25/04/2014 gogogog //
/////////////////////////////////////////////////////

// pimpam pim pam estem en el video streaming i jo pensant que eran passos de missatges :D
// seleccionar els elements de video especifics amb els id especificats del DOM
var localVideo = document.querySelector('#localVideo');
var remoteVideo = document.querySelector('#remoteVideo');


var dataChannelSend; // jo diria que es el text area per no estic del tot convençut



// damn omg --> one smoke to 2 smokeless
function handleUserMedia(stream) {
    localStream = stream; // atack localstream variable the stream invoked
    attachMediaStream(localVideo, stream); // atack the stream to the diplay in the local video stream element frame
    console.log('Adding local stream.');
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
// aquesta funció és el que es crida al principi al inicialitzar la pagina amb el navegador que ens 
// realitza una petició per permetre dixar fer ús dels dispositius de camara i micro 


console.log('Getting user media with constraints', constraints);

requestTurn('https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913');

/**
 * que fa aquesta funció?
 * si esta inicialitzat y hiha stream local y també el canal esta preparat aleshores 
 * cridem una funció que crea un peer connection
 * a posteriori fem un append del local stream al pc
 * despres fiquem el is started true pertant maybe start serveix per fer
 * que hi hagi un unic propietari de cada trucada
 * i final ment si soc el iniciador procedeixo a realitzar la trucada doCall();
 * @returns {undefined}
 */
function maybeStart() {
    if (!isStarted && localStream && isChannelReady) {
	createPeerConnection();
	pc.addStream(localStream);
	isStarted = true;
	if (isInitiator) {
	    doCall();
	}
    }
}


// aquest bye pero com sap el socket qui es el que realiza el adeu?
window.onbeforeunload = function(e) {
    sendMessage('bye');
    // vale com que ha un broadcast i sabem que només hiha un unic usuari
    // interlocutor podem determinar que sempre  penjarem el correcte usuari remot
};

/////////////////////////////////////////////////////////



/**
 * crear una nova peer connection :D
 * es crida dins de la funció maybe start
 * @returns {undefined}
 */
function createPeerConnection() {


    try {
	pc = new RTCPeerConnection(pc_config, pc_constraints);
	pc.onicecandidate = handleIceCandidate;
	console.log('Created RTCPeerConnnection with:\n' +
		'  config: \'' + JSON.stringify(pc_config) + '\';\n' +
		'  constraints: \'' + JSON.stringify(pc_constraints) + '\'.');
    } catch (e) {
	// hi ha un error al realitzar un peerconeection object aleshores procedim a aboratar el procediment
	// enviant un missatge de log al terminal de debug i el terminal del navegador amb una alerta :D
	// js
	console.log('Failed to create PeerConnection, exception: ' + e.message);
	alert('Cannot create RTCPeerConnection object.');
	return;
    }


    // la variable peer connection : pc
    // afegim actionlisteners al peer conection les funcions x & y que saltaran en casos x & y
    pc.onaddstream = handleRemoteStreamAdded;
    pc.onremovestream = handleRemoteStreamRemoved;

    // onaddstream quan s'afegeixen noves conexions al peerconnection -> cridem la funció: handleRemoteStreamAdded
    // onremovestream quan s'elimina una conexió existent del peerconection  -> realitzarem el tractament de l'esdeveniment amb la funció
    // handleRemoteStreamRemoved


    // si soc el inicialitzador... blblabalbla
    if (isInitiator) {
	try {
	    // Reliable Data Channels not yet supported in Chrome

	    var dcSetting = {reliable: false};

	    sendChannel = pc.createDataChannel("sendDataChannel", dcSetting);
	    // inicialitzar el datachanel a posteriori asignar funcions i metodes de actionlistener
	    // canal del missatge :D
	    sendChannel.onmessage = handleMessage;
	    trace('Created send data channel'); // missatge de debug :D per el terminald e debugació
	} catch (e) {
	    // another alert and trace for the win
	    alert('Failed to create data channel. ' +
		    'You need Chrome M25 or later with RtpDataChannel enabled');
	    trace('createDataChannel() failed with exception: ' + e.message);
	}

	// canal de apertura :D la vergonya que ha pasat per passar per aki :D ja no la vol passar mes :D
	sendChannel.onopen = handleSendChannelStateChange;
	// datachannel al obrirse i al tancarse se li aplica un controlador per cada cas que es diu handleSendChannelStateChange
	sendChannel.onclose = handleSendChannelStateChange;
    } else {
	pc.ondatachannel = gotReceiveChannel;
/* el contingut del metode gotReceiveChannel()
	trace('Receive Channel Callback');
	//// missatge de log del receptor que salta quan el datachannel receptor activa l'estat de haver rebut algun missatge
	// configuració del canal receptor del datachannel per part del receptor o no propietari o participant del canal afegit 
	sendChannel = event.channel;
	sendChannel.onmessage = handleMessage;
	sendChannel.onopen = handleReceiveChannelStateChange;
	sendChannel.onclose = handleReceiveChannelStateChange;
*/



	// si no soc el inicialitzador de aleshores realitzadre només un lectura del canal en el controlador on datachannel que no se sap lo que preten ser
    }
}



/**
 * enviament de dades :D
 * @returns {undefined}
 */
function sendData() {

    // llegir el valor que hi ha en el text area per pasar posteriorkment el tractamen de dles dades 
    // mitjançant l'estat send del datachannel que li pasem per parametre el missatge que volem enviar 
    // també mostrarrem per el terminal de debug el missatge enviat
    var data = sendTextarea.value;
    sendChannel.send(data); // enviar dades :D
    trace('Sent data: ' + data);
}

// function closeDataChannels() {
//   trace('Closing data channels');
//   sendChannel.close();
//   trace('Closed data channel with label: ' + sendChannel.label);
//   receiveChannel.close();
//   trace('Closed data channel with label: ' + receiveChannel.label);
//   localPeerConnection.close();
//   remotePeerConnection.close();
//   localPeerConnection = null;
//   remotePeerConnection = null;
//   trace('Closed peer connections');
//   startButton.disabled = false;
//   sendButton.disabled = true;
//   closeButton.disabled = true;
//   dataChannelSend.value = "";
//   dataChannelReceive.value = "";
//   dataChannelSend.disabled = true;
//   dataChannelSend.placeholder = "Press Start, enter some text, then press Send.";
// }


/**
 * rutina que crida el receptor dels missatges :D
 * @param {type} event
 * @returns {undefined}
 */
function gotReceiveChannel(event) {
    trace('Receive Channel Callback');
    //// missatge de log del receptor que salta quan el datachannel receptor activa l'estat de haver rebut algun missatge
    // configuració del canal receptor del datachannel per part del receptor o no propietari o participant del canal afegit 
    sendChannel = event.channel;
    sendChannel.onmessage = handleMessage;
    sendChannel.onopen = handleReceiveChannelStateChange;
    sendChannel.onclose = handleReceiveChannelStateChange;
}

/**
 * handle message vol dirtradctemnt del missatge :D
 * @param {type} event
 * @returns {undefined}
 */
function handleMessage(event) {
    
    // mostrar per el terminal de debug el missatge que s'ha transmet, event.data :D???? 
    // actualitzar l'element del text area receptor amb el contingut del missatge rebut 
    trace('Received message: ' + event.data);
    receiveTextarea.value = event.data;
}


/**
 * handler per controlar el canvis d'estat amb el datachannel primary :D??
 * @returns {undefined}
 */
function handleSendChannelStateChange() {
    var readyState = sendChannel.readyState; // variable readistate ? implica el stat actual del datachannel
    trace('Send channel state is: ' + readyState);
    enableMessageInterface(readyState === "open");
    // par emisor del datachannel per poder procedir a enviar missatges cal que el dc estigui en 
    // estat de open ... o enamble meessage interface es la interficie per procedir a escriure missatges
    // només podrem procedir a variar el seu contingut una vegada el dc o el datachannel estigui preparat 
    // per la seva funció
    
}

// imaginem que el datachannel te dues bandes... la part del emisor y la part del receptor i procedirem a enviar el missatge del costat que envia primer i no
// podrem enviar missatges dels dos costats al mateix temps perque només tenim un canal amb un unic flux... o aixo es lo que vull imaginar entendre del tema :D
/**
 * 
 * @returns {undefined}
 */
function handleReceiveChannelStateChange() {
    var readyState = sendChannel.readyState;
    trace('Receive channel state is: ' + readyState);
    enableMessageInterface(readyState === "open");
    // aixo es lo mateix per per part del receptor o sigui el no propietari del datachannel
    // sempre tindrem un primary i un slave
}


/**
 * 
 * @param {type} shouldEnable
 * @returns {undefined}
 */
function enableMessageInterface(shouldEnable) {
    if (shouldEnable) {
	dataChannelSend.disabled = false;
	dataChannelSend.focus();
	dataChannelSend.placeholder = "";
	sendButton.disabled = false;
    } else {
	dataChannelSend.disabled = true;
	sendButton.disabled = true;
    }
}


/**
 * handle ice candidate ... aquesta funció es cridat per createPeerConnection :D 
 * @param {type} event
 * @returns {undefined}
 */
function handleIceCandidate(event) {
    console.log('handleIceCandidate event: ', event);
    if (event.candidate) {
	sendMessage({
	    type: 'candidate',
	    label: event.candidate.sdpMLineIndex,
	    id: event.candidate.sdpMid,
	    candidate: event.candidate.candidate});
    } else {
	console.log('End of candidates.');
    }
}


/**
 * 
 * @param {type} event
 * @returns {undefined}
 */
function handleRemoteStreamAdded(event) {
    console.log('Remote stream added.');
//  reattachMediaStream(miniVideo, localVideo);
    attachMediaStream(remoteVideo, event.stream);
    remoteStream = event.stream;
//  waitForRemoteVideo();
}


/**
 * realitzar un trucada :D
 * @returns {undefined}
 */
function doCall() {
    var constraints = {'optional': [], 'mandatory': {'MozDontOfferDataChannel': true}};
    // temporary measure to remove Moz* constraints in Chrome
    if (webrtcDetectedBrowser === 'chrome') {  // si soc chrome aleshores esborrar totes les entrades de fifox
	for (var prop in constraints.mandatory) {
	    if (prop.indexOf('Moz') !== -1) { // si el navegador es fifox aleshores caldra eliminar una variable de configuració
		delete constraints.mandatory[prop];
	    }
	}
    }
    constraints = mergeConstraints(constraints, sdpConstraints); // append defualt sdp with self set constraints
    console.log('Sending offer to peer, with constraints: \n' +
	    '  \'' + JSON.stringify(constraints) + '\'.');
    pc.createOffer(setLocalAndSendMessage, null, constraints);
}





/**
 * 
 * @returns {undefined}
 */
function doAnswer() {
    console.log('Sending answer to peer.');
    pc.createAnswer(setLocalAndSendMessage, null, sdpConstraints);
    /*
     * set local and send message es una funció
     * i el segon parametre es null suposu perque no s'ha implemntat cap funció de error handler
     * el tercer parametrer son les restriccions de configuració que s'han implantat
     */
    
    
}



/**
 * 
 * @param {type} cons1
 * @param {type} cons2
 * @returns {mergeConstraints.merged}
 */
function mergeConstraints(cons1, cons2) {
    var merged = cons1;
    for (var name in cons2.mandatory) {
	merged.mandatory[name] = cons2.mandatory[name];
    }
    merged.optional.concat(cons2.optional);
    return merged;
}




/**
 * 
 * @param {type} sessionDescription
 * @returns {undefined}
 */
function setLocalAndSendMessage(sessionDescription) {
    // Set Opus as the preferred codec in SDP if Opus is present.
    sessionDescription.sdp = preferOpus(sessionDescription.sdp);
    pc.setLocalDescription(sessionDescription);
    sendMessage(sessionDescription);
}


/**
 * 
 * @param {type} turn_url
 * @returns {undefined}
 */
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

/**
 * @param {type} event
 * @returns {undefined}
 */
function handleRemoteStreamAdded(event) {
    console.log('Remote stream added.');
    // reattachMediaStream(miniVideo, localVideo);
    attachMediaStream(remoteVideo, event.stream);
    remoteStream = event.stream;
//  waitForRemoteVideo();
}

/**
 * 
 * @param {type} event
 * @returns {undefined}
 */
function handleRemoteStreamRemoved(event) {
    console.log('Remote stream removed. Event: ', event);
}


/**
 * jo penjo lo meu i crido la funció stop que es comu en tots el casos
 * per inhabilitar la interficie del datachannel i finalment envio un missatge de bye al socket que 
 * aquest remet tots els participants de la sala perque tots cridin el seu handler de handle remote hangup
 * que al mateix temps invoquen el methode per inhabilitar els seus elements de datachannel local i també 
 * fica un status var de is initiator false:
 * @returns {undefined}
 */
function hangup() {
    console.log('Hanging up.');
    stop();
    sendMessage('bye');
}


/**
 * 
 * @returns {undefined}
 */
function handleRemoteHangup() {
    console.log('Session terminated.');
    stop();
    isInitiator = false;
}



/**
 * 
 * @returns {undefined}
 */
function stop() {
    isStarted = false;
    // isAudioMuted = false;
    // isVideoMuted = false;
    pc.close();
    pc = null;
}

///////////////////////////////////////////

// Set Opus as the default audio codec if it's present.


//-----------------------------------------------------------------------------
/**
 * 
 * @param {type} sdp
 * @returns {unresolved}
 */
function preferOpus(sdp) { // session descripton protocol :D per parametre el haurem de actualitzar per adaptar lo als nostres parametres de configuració desitjat
    var sdpLines = sdp.split('\r\n');
    var mLineIndex;
    // Search for m line.
    for (var i = 0; i < sdpLines.length; i++) {
	if (sdpLines[i].search('m=audio') !== -1) {
	    mLineIndex = i; // determinar en quina linia estan els parametres de configuració audio per set opus
	    break;
	}
    }
    if (mLineIndex === null) {
	return sdp;
    }

    // If Opus is available, set it as the default in m line.
    for (i = 0; i < sdpLines.length; i++) { // aqui ho busca
	
	// si troba que opus esta disponible aleshores carregar la linea de configuració del opus
	if (sdpLines[i].search('opus/48000') !== -1) {
	    var opusPayload = extractSdp(sdpLines[i], /:(\d+) opus\/48000/i); // aqui ho carrega
	    if (opusPayload) {
		sdpLines[mLineIndex] = setDefaultCodec(sdpLines[mLineIndex], opusPayload); // aqui ho aplica
	    }
	    break;
	}
    }

    
    // Remove CN in m line and sdp.
    sdpLines = removeCN(sdpLines, mLineIndex);

    sdp = sdpLines.join('\r\n'); // join serveix per convertir un array en un string amb uns (paremetre de separador)
    // sintaxis :  array.join separator
    return sdp;
}


/**
 * extract session descriptin protocol how can u learn a language without speaking it...
 * @param {type} sdpLine
 * @param {type} pattern
 * @returns {extractSdp.result}
 */
function extractSdp(sdpLine, pattern) {
    var result = sdpLine.match(pattern);
    return result && result.length === 2 ? result[1] : null;
}





// Set the selected codec to the first in m line.

/**
 * set defualt codec... whot are u talking about?
 * 
 * @param {type} mLine
 * @param {type} payload
 * @returns {String}
 * 
 * 
 */
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

/**
 * 
 * @param {type} sdpLines
 * @param {type} mLineIndex
 * @returns {unresolved}
 */
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

