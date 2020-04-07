// webrtc script file

navigator.getUserMedia ||
	(navigator.getUserMedia = navigator.mozGetUserMedia ||
		navigator.webkitGetUserMedia || navigator.msGetUserMedia);

window.audioContext ||
	(window.audioContext = window.webkitAudioContext);

if (navigator.getUserMedia) {
    navigator.getUserMedia({
	video: true,
	audio: true
    }, onSuccess, onError);
} else {
    alert('getUserMedia is not supported in this browser.');
}

/**
 * 
 * @param {type} stream
 * @returns {undefined}
 */
function onSuccess(stream) {

    /*
     * unless you're fan of silent movies, you're probably going to want to add some sound to your video feed at some point.
     * although we are capturing sound with getusermedia, we've not yet provided a way to play this nack to the page ... lets do this now :D
     */

    /*
     * to hear the sound being played we are going to use the webaudio api
     */

    var video = document.getElementById('webcam');
    var videoSource;
//  var audioContext;
//  var mediaStreamSource;

    if (window.webkitURL) {
	videoSource = window.webkitURL.createObjectURL(stream);
    } else {
	videoSource = stream;
    }

    video.autoplay = true;
    video.src = videoSource;


    /*
     * everything above is from sample-3
     * next we are going to perform the webrtc audio
     */

    var audioContext;
    var mediaStreamSource;
    
    
    window.audioContext || (window.audioContext = window.webkitAudioContext);
    
    
    /*
     * to hear the audio we need to do 3 things
     * 
     *	   1 create an audio context
     *	   2 create our media stream source
     *	   3 connect our media stream source to our audio context
     *	   // same as video.source -> video.element.context -> autoplay
     *	   
     */



    if (window.audioContext) { // check if the browser is audio enabled:
	audioContext = new window.audioContext();			    // 1
	mediaStreamSource = audioContext.createMediaStreamSource(stream);   // 2
	mediaStreamSource.connect(audioContext.destination);		    // 3
    } else {
	alert('there is no audio context enable');
	/*
	 * currently its only available in google chrome canary - 03/jan/2013
	 * hidden behind a flag
	 * to enable it we need to type in to our chrome canary address
	 */
    }



}


function onError() {
    alert('There has been a problem retreiving the streams - are you running on file:/// or did you disallow access?');
}