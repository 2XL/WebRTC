
/*
 * segur que son amigas perque sino aixo no m'ho explico :D
 *  capturing images:
 *	although we've produced a live feed of our webcam,
 *	we have not provided a way to capture any of the images being produced.
 *	to capture images, we would need somewhere to draw them to:
 *	the html5 canvas element is the right element for the task
 * 
 */


// webrtc script file
var webrtc = (function() {

    var getVideo = true,
	    getAudio = true,
	    video = document.getElementById('webcam');

    navigator.getUserMedia ||
	    (navigator.getUserMedia = navigator.mozGetUserMedia ||
		    navigator.webkitGetUserMedia || navigator.msGetUserMedia);

    window.audioContext ||
	    (window.audioContext = window.webkitAudioContext);


    function requestStreams() {
	if (navigator.getUserMedia) {
	    navigator.getUserMedia({
		video: getVideo,
		audio: getAudio
	    }, onSuccess, onError);
	} else {
	    alert('getUserMedia is not supported in this browser.');
	}
    }

    function onSuccess(stream) {
	var videoSource,
		audioContext,
		mediaStreamSource;

	if (getVideo) { // asignar video al video element
	    if (window.webkitURL) {
		videoSource = window.webkitURL.createObjectURL(stream);
	    } else {
		videoSource = stream;
	    }
	    video.autoplay = true;
	    video.src = videoSource;
	}

	if (getAudio && window.audioContext) { // asignar audio al audio context element
	    audioContext = new window.audioContext();
	    mediaStreamSource = audioContext.createMediaStreamSource(stream);
	    mediaStreamSource.connect(audioContext.destination);
	}
    }

    function onError() {
	alert('There has been a problem retreiving the streams - are you running on file:/// or did you disallow access?');
    }



    /**
     * action listener for the button to take an photo :D
     * @returns {undefined}
     */
    function takePhoto() {
	
	
	/*
	 * here we have assigned two variables
	 *  photo is our canvas element
	 *  context is our artists toolkit for our canvas 
	 *  - imagine the context as our pens and paint brushes and so on
	 */
	var photo = document.getElementById('photo');
	var context = photo.getContext('2d');


	/*
	 * we need to retrieve our video elemnt, wich is accessible form the video variable.
	 * from this, we can grab the height and width of the video.
	 * we can also use the context to draw an image our source video using 
	 * context.drawImage(src, ofx, ofy, f.width, f.height);
	 *  source
	 *  startx
	 *  starty
	 *  width
	 *  height
	 */
	photo.width = video.clientWidth;
	photo.height = video.clientHeight;

	context.drawImage(video, 0, 0, photo.width, photo.height);

    }

    /**
     * linking actionlistener from js to the button :D
     * @returns {undefined}
     */
    function initEvents() {
	
	/*
	 * once our take foto button is completed, now lets add a button to our page to trigger the photo.
	 * in our html, we add
	 * an input type button with id as takePhoto and value whatever :D
	 */

	// one event
	var photoButton = document.getElementById('takePhoto');
	photoButton.addEventListener('click', takePhoto, false);

	// another event ... to infinite event handler...


    }

    (function init() {
	requestStreams();
	initEvents();
    }());
})();



