// webrtc script file


// wraping up js code into a namespace... errrgggerr

// http://stackoverflow.com/questions/2421911/what-is-the-purpose-of-wrapping-whole-javascript-files-in-anonymous-functions-li

/*
 * to be imported 
 *  suposicio evitar variables de dependencies :D
 *  the major advantatge of this is that you can have private mehtods/functions and properties
 *  // haha potser sere un geek i tindre perfeccionat l'anglés pero ningu sabra que he hagut de fer 3 vegades l'examen de b1
 *  
 */





var webrtc = (function() {

    var getVideo = true,
	    getAudio = true,
	    video = document.getElementById('webcam');

    navigator.getUserMedia ||
	    (navigator.getUserMedia = navigator.mozGetUserMedia ||
		    navigator.webkitGetUserMedia || navigator.msGetUserMedia);

    window.audioContext ||
	    (window.audioContext = window.webkitAudioContext);

    function onSuccess(stream) {
	var videoSource,
		audioContext,
		mediaStreamSource;

	    // inicialitzar el video
	if (getVideo) {
	    if (window.webkitURL) {
		videoSource = window.webkitURL.createObjectURL(stream);
	    } else {
		videoSource = stream;
	    }

	    video.autoplay = true;
	    video.src = videoSource;
	}

	// incialitzar el audio
	if (getAudio && window.audioContext) {
	    audioContext = new window.audioContext();
	    mediaStreamSource = audioContext.createMediaStreamSource(stream);
	    mediaStreamSource.connect(audioContext.destination);
	}
    }

    function onError() {
	alert('There has been a problem retreiving the streams - are you running on file:/// or did you disallow access?');
    }

    function requestStreams() { // cridar i implementar el get user media :D
	if (navigator.getUserMedia) {
	    var gumConfig = { video: getVideo, audio: getAudio }; 
	    navigator.getUserMedia(gumConfig, onSuccess, onError);
	} else {
	    alert('getUserMedia is not supported in this browser.');
	}
    }

   // (function init() { requestStreams(); }()); 
    
    // una funció self ini tialitzation :D
    
    // un altra funció dins de la mateixa funció es adir podrem cridar 
    // webrtc.init();
    // ja que la resta de les rutines son parts de altres rutines de la mateixa llibreria
    
    /*
     * 
     * to be able to retrieve our video stream for capturing images, we have movesd the variables referencing the html5 
     * video elemnt webcam outside of our onSuccess() function so it will be viisble as a library variable
     * 
     */
    
    
})();



