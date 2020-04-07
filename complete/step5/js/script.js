/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */



// RTCPeerConnection instances need to exchange metadata in order to set up and mantain a WebRTC call:
    // candidate information
    // offer and answer messages providing information about media such as resolution and codecs


// SIGNALING -> exchange of metadata :D
/*
 * en els exemples que hem analitzzar fins ara 
 * el calleri el callee s'intercanvien objectes RTCPeerConnection en la mateixa pagina
 * i lo unic que es fa es pasar objectes entre metodes... 
 * 
 * ara -> emisor i receptor no estroben en la mateixa pagina
 *  necesitem una manera de intercambiar la metadata
 *  
 *  -- signaling server: a server that can exchange messages between a webrtc app runing in one browser and a client in another browser
 *  the actual messages are stringified js objects -D
 *  json -> stringified js object :D 
 *  ok aleshores node.js es lo mateix que lo motor de chrome?
 * 
 *  signalig server is : REQUIRED for P2P
 *	RTCPeerConnection
 *	    audio
 *	    video
 *	    data
 * 
 * 
 * 
 */
    
    









































