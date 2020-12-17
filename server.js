var express = require('express');

var app = express();
var port = process.env.PORT || 3000;
var server = app.listen(port);

app.use(express.static('public'));

console.log("My server is running.");

var socket = require('socket.io');

var io = socket(server);

io.sockets.on('connection', newConnection);

function newConnection(socket){
    console.log('New connection: ' + socket.id);
    
    socket.on('userData', newMovementDataRecieved);
    function newMovementDataRecieved(data){
        //Use one of the two following lines
        //---
        socket.broadcast.emit('userData', data);
        //io.sockets.emit('movementMade', data);
        //---
    }
    
    socket.on('messageSent', newMessageToManage);
    function newMessageToManage(newLineOfText){
        socket.broadcast.emit('messageSent', newLineOfText);
    }
    
    socket.on('disconnect', lostConnection)
    function lostConnection(){
        console.log('Oof: ' + socket.id);
        socket.broadcast.emit('userLeft', socket.id);
    }
}