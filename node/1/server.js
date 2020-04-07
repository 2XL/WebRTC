/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


            var io = require('socket.io').listen(80);
                io.socket.on('connection', function(socket){
                socket.emit('news',{hello: 'world'});
                socket.on('my other event', function (data){
                    console.log(data);
                });
            });