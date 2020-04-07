var static = require('node-static');
var http = require('http');
var file = new(static.Server);


var app = http.createServer(function (req, res){
    file.serve(req, res);
}).listen(2013);


var io = require('socket.io').listen(app);
io.sockets.on('connection', function(socket){
    
    function log(){
	var array = ['>>> Message from server: '];
	for(var i = 0; i<arguments.length; i++){
	    array.push(arguments[i]);
	}
	socket.emit('log', array);
    }
    
    socket.on('message', function(message){
	log('Got message: ', message);
	socket.broadcast.emit('message', message);
    });
    
    socket.on('create or join', function(room){
	var numClients = io.sockets.clients(room).length;
	
	log('Room' + room + ' has ' + numClients + ' client(s)');
	log('Request to create or join room', room);
	
	if(numClients === 0){
	    socket.join(room);
	    socket.emit('create', room);
	}else if(numClients === 1){
	    socket.join(room);
	    socket.emit('joined', room);
	}else {
	    socket.emit('full', room);
	}
    }); 
});
