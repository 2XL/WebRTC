// webrtc script file

navigator.getUserMedia ||
	(navigator.getUserMedia = navigator.mozGetUserMedia ||
		navigator.webkitGetUserMedia || navigator.msGetUserMedia);

/*
 * this api is prefixed in chrome and fifox but not in opera, we will therefore first write a small js shim
 * so that we can reference each browser implemntation using 
 * navigator.getUserMedia.
 * we've included an ms prefix, so taht should microsoft support webrtc and be prefixed in the future, our code
 * would already work...
 */




if (navigator.getUserMedia) { // amb aquesta rutina comrpovem si el navegador soporta getusermedia es a dir webrtc.

    var gumSetting = {
	video: true,
	audio: true
    };
    navigator.getUserMedia(gumSetting, onSuccess, onError);

// getUserMedia(streams, success, error);
    /*
     * where:
     *	stream :    is an object with true / false values for the streams we would like to include
     *	success:    is the function to call if we can get these streams
     *	error  :    is the function to call if we are unable to get these streams
     */


} else {
    alert('getUserMedia is not supported in this browser.');
}

function onSuccess() {
    alert('Successful!');
}

function onError() {
    alert('There has been a problem retreiving the streams - are you running on file:/// or did you disallow access?');
}