// webrtc script file

navigator.getUserMedia ||
	(navigator.getUserMedia = navigator.mozGetUserMedia ||
		navigator.webkitGetUserMedia || navigator.msGetUserMedia);




if (navigator.getUserMedia) {
    navigator.getUserMedia({
	video: true,
	audio: true
    }, onSuccess, onError);
} else {
    alert('getUserMedia is not supported in this browser.');
}



/**
 * gogogogo 
 * @param {type} stream
 * @returns {undefined} 
 */
function onSuccess(stream) {
    /*
     * on success by getting user media 
     * well control the video element's feed an playback from our js
     *	now this function will carry out three tasks in order to show our video.
     */


    var video = document.getElementById('webcam'); 
				// 1 get our video element from the dom


    var videoSource; 

    // how we retrieves the stream varies depending on the browser...
    if (window.webkitURL) {
	videoSource = window.webkitURL.createObjectURL(stream); // if its chrome
    } else {
	videoSource = stream; // otherwise
    }

    video.autoplay = true;	// 2 set video to autoplay
    video.src = videoSource;	// 3 set the video source to our stream (webcam)
}


















function onError() {
    alert('There has been a problem retreiving the streams - are you running on file:/// or did you disallow access?');
}