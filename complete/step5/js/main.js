

var isInitiator;
// room = prompt("Enter room name:");
 room = "10";

var socket = io.connect();

if (room !== "") {
  console.log('Joining room ' + room);
  socket.emit('create or join', room);
}

socket.on('full', function (room){
  console.log('Room ' + room + ' is full');
});

socket.on('created', function(room){
    console.log('Server Callback room '+room+' succesfully created!');
});

socket.on('joined', function(room){
    console.log('Server Callback client successfully joined room: '+ room);
});

socket.on('empty', function (room){
  isInitiator = true;
  console.log('Room ' + room + ' is empty');
});

socket.on('join', function (room){
  console.log('Making request to join room ' + room);
  console.log('You are the initiator!');
});

socket.on('log', function (array){
  console.log.apply(console, array);
});
