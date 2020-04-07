var static = require('node-static');
var http = require('http');
var file = new (static.Server)();
var app = http.createServer(function(req, res) {
    file.serve(req, res);
}).listen(2013); // por on hi ha el servidor

var io = require('socket.io').listen(app);

// var usernames = {};
var clients = {};
var owner;
var joiner;

var chatReady = 0; // 1 , 2 -> ok start

/*
 * 
 http://stackoverflow.com/questions/10342681/whats-the-difference-between-io-sockets-emit-and-broadcast
 * io.sockets.emit	    -> send to all the clients
 * socket.broadcast.emit    -> all but the newly created /all but the one that it is being called on
 http://stackoverflow.com/questions/6873607/socket-io-rooms-difference-between-broadcast-to-and-sockets-in
 * socket.join		    -> join current socket to the target room
 * socket.broadcast.to	    -> all socket in the given room /but the on that it is being called
 * io.sockets.in	    -> all socket in the given room 
 https://groups.google.com/forum/#!topic/socket_io/bjckmgTOQeE
 * socket.emit		    -> only to the one that is being called
 * io.sockets.emit	    -> to all everymember conencted to the socket
 *
 * function				      t.id     t.on    t.rest	t.room	
 * 
 * socket.emit(event,@)				x       1	0	 x		
 * socket.broadcast.emit(event,@)		x	0	1	 x		
 * io.sockets.emit(event,@)			1	1	1	 x		   
 * 
 * socket.join(@room)			    
 * io.sockets.in(@room).emit(event,@)		x	x	x	 1		 
 * socket.broadcast.to(@room).emit(event,@)	x	0	x	 1		
 * io.sockets.socket(@idSocket).emit(event,@)	1	x	x	 x		
 */
 

io.sockets.on('connection', function(socket) {
    function log() {
	var array = [">>> Message from server: "];
	for (var i = 0; i < arguments.length; i++) {
	    array.push(arguments[i]);
	}
	socket.emit('log', array);
    }

// 1
    socket.on('message', function(message) {
	log('Got message: ', message);
	// For a real app, should be room only (not broadcast)
	socket.broadcast.emit('message', message);
    });


// 2
    socket.on('create or join', function(room) {
	var numClients = io.sockets.clients(room).length;
	log('Room ' + room + ' has ' + numClients + ' client(s)');
	log('Request to create or join room', room);
	switch (numClients) {
	    case 0:
		socket.join(room); // on identificador per defecte es socket.id el index de usuari actual
		socket.emit('created', room);
		owner = socket.id;
		log('owner is: ', owner);
		
		break;
	    case 1:
		io.sockets.in(room).emit('join', room); // aqui fa un emit join room perque el owner sapigui que ha hagut un join
		socket.join(room); // 
		socket.emit('joined', room);
		joiner = socket.id;
		log('joiner is: ', joiner);
		log('request sdp to both: ');
		log('owner: ',owner);
		chatReady=0;
		    socket.broadcast.to(room).emit('sdp offer request', joiner);
		log('joiner: ', joiner); 
		    
		break;
	    default:
		socket.emit('full', room);
		break;
	}
	socket.emit('emit(): client ' + socket.id + ' joined room ' + room);
	socket.broadcast.emit('broadcast(): client ' + socket.id + ' joined room ' + room);
    });


    /*
     * 
     io.sockets.emit will send to all the clients
     socket.broadcast.emit will send the message to all the other clients except the newly created connection
     */
// 3
    socket.on('remote sdp', function(room, sdp){
	socket.broadcast.to(room).emit('sdp to join', sdp);
	log('owner request sdp to joiner with owner sdpoffer', +JSON.parse(sdp)); 
    });

// 4 
    socket.on('wait to start', function(room){
	chatReady++; // para version futura usar room length
	if(chatReady===2)
	{    
	    io.sockets.in(room).emit('chat ready');
	    
	} 
    });
  

// * 



});

