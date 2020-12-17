var socket;

//User data is stored in array
//[i][0] is socket ID
//[i][1] is player X value
//[i][2] is player Y value
//[i][3] is player color R value
//[i][4] is player color G value
//[i][5] is player color B value
var arrayOfAllCurrentUsersOnline = [];

var arrayOfRecentMessages = [];
var currentMessageBeingTyped = ""

function setup() {
    createCanvas(400, 400);
    background(0);
    
    //Makes input thingy
    currentMessageBeingTyped = createInput();
    currentMessageBeingTyped.position(20, height-25);
    button = createButton('submit');
    button.position(currentMessageBeingTyped.x + currentMessageBeingTyped.width, height-25);
    button.mousePressed(newText);
    
    //Sets up socket stuff for drawing other users
    socket = io.connect('http://localhost:3000')
    socket.on('userData', drawOtherUsers);
    socket.on('messageSent', messageRecieved);
    socket.on('userLeft', removeDisconnectedUser);
    
    //Sets values for user in array
    arrayOfAllCurrentUsersOnline[0] = [];
    arrayOfAllCurrentUsersOnline[0][0] = socket.id; //Socket ID
    arrayOfAllCurrentUsersOnline[0][1] = width/2; //Player X
    arrayOfAllCurrentUsersOnline[0][2] = height/2; //Player Y
    arrayOfAllCurrentUsersOnline[0][3] = random(50, 255); //R value
    arrayOfAllCurrentUsersOnline[0][4] = random(50, 255); //G value
    arrayOfAllCurrentUsersOnline[0][5] = random(50, 255); //B value
}

function draw() {
    drawMusicRoom();
}

//Sets values for other users
function drawOtherUsers(data){
    let didThePacketRecievedAlreadyHaveDataRecordedInClientArrayOfConnectedUsers = false;
    for (let i = 0; i < arrayOfAllCurrentUsersOnline.length; i++){
        if (arrayOfAllCurrentUsersOnline[i][0] == data.userID){
            arrayOfAllCurrentUsersOnline[i][1] = data.playerX; //Player X
            arrayOfAllCurrentUsersOnline[i][2] = data.playerY; //Player Y
            arrayOfAllCurrentUsersOnline[i][3] = data.randomRValue; //R value
            arrayOfAllCurrentUsersOnline[i][4] = data.randomGValue; //G value
            arrayOfAllCurrentUsersOnline[i][5] = data.randomBValue; //B value
            didThePacketRecievedAlreadyHaveDataRecordedInClientArrayOfConnectedUsers = true;
        }
    }
    
    if (didThePacketRecievedAlreadyHaveDataRecordedInClientArrayOfConnectedUsers == false){
        arrayOfAllCurrentUsersOnline.push([])
        arrayOfAllCurrentUsersOnline[arrayOfAllCurrentUsersOnline.length-1][0] = data.userID; //Socket ID
        arrayOfAllCurrentUsersOnline[arrayOfAllCurrentUsersOnline.length-1][1] = data.playerX; //Player X
        arrayOfAllCurrentUsersOnline[arrayOfAllCurrentUsersOnline.length-1][2] = data.playerY; //Player Y
        arrayOfAllCurrentUsersOnline[arrayOfAllCurrentUsersOnline.length-1][3] = data.randomRValue; //R value
        arrayOfAllCurrentUsersOnline[arrayOfAllCurrentUsersOnline.length-1][4] = data.randomGValue; //G value
        arrayOfAllCurrentUsersOnline[arrayOfAllCurrentUsersOnline.length-1][5] = data.randomBValue; //B value
    }
}

function drawMusicRoom(){
    background(0, 10);
    
    //Calculates user movement
    if (keyIsDown(LEFT_ARROW) && arrayOfAllCurrentUsersOnline[0][1] >= 3) {
        arrayOfAllCurrentUsersOnline[0][1] -= 2;
    }

    if (keyIsDown(RIGHT_ARROW) && arrayOfAllCurrentUsersOnline[0][1] <= width-3) {
        arrayOfAllCurrentUsersOnline[0][1] += 2;
    }

    if (keyIsDown(UP_ARROW) && arrayOfAllCurrentUsersOnline[0][2] >= 3) {
        arrayOfAllCurrentUsersOnline[0][2] -= 2;
    }

    if (keyIsDown(DOWN_ARROW) && arrayOfAllCurrentUsersOnline[0][2] <= height-3) {
        arrayOfAllCurrentUsersOnline[0][2] += 2;
    }
    
    //Packages the lines endpoints to be communicated to everyone else
    var data = {
        userID: socket.id,
        playerX: arrayOfAllCurrentUsersOnline[0][1],
        playerY: arrayOfAllCurrentUsersOnline[0][2],
        randomRValue: arrayOfAllCurrentUsersOnline[0][3],
        randomGValue: arrayOfAllCurrentUsersOnline[0][4],
        randomBValue: arrayOfAllCurrentUsersOnline[0][5]
    }
    
    socket.emit('userData', data);
    
    //Draws all users
    for (let i = 0; i < arrayOfAllCurrentUsersOnline.length; i++){
        noStroke();
        fill(arrayOfAllCurrentUsersOnline[i][3], arrayOfAllCurrentUsersOnline[i][4], arrayOfAllCurrentUsersOnline[i][5]);
        ellipse(arrayOfAllCurrentUsersOnline[i][1], arrayOfAllCurrentUsersOnline[i][2], 10);
    }
    
    //CHAT STUFF
    //Makes sure only 7 messages are shown at a time
    while(arrayOfRecentMessages.length >= 8){
        arrayOfRecentMessages.pop();
    }
    
    //Shows all messages
    for (let i = 0; i < arrayOfRecentMessages.length; i++){
        fill(arrayOfRecentMessages[i].randomRValue, arrayOfRecentMessages[i].randomGValue, arrayOfRecentMessages[i].randomBValue);
        text(arrayOfRecentMessages[i].newLineOfText, 20, height-25-((i+1)*15));
    }
}

function newText(){
    //Packages Messages
    var messageData = {
        newLineOfText: currentMessageBeingTyped.value(),
        randomRValue: arrayOfAllCurrentUsersOnline[0][3],
        randomGValue: arrayOfAllCurrentUsersOnline[0][4],
        randomBValue: arrayOfAllCurrentUsersOnline[0][5]
    }
    
    //Adds message data to current client's array
    arrayOfRecentMessages.unshift(messageData);
    
    //Sends out messages to other users to be stored in other client's message arrays
    socket.emit('messageSent', messageData)
    
    //Clears current message in text bar
    currentMessageBeingTyped.value('');
}

function messageRecieved(newLineOfText){
    arrayOfRecentMessages.unshift(newLineOfText);
}

function removeDisconnectedUser(socketID){
    for (let i = 0; i < arrayOfAllCurrentUsersOnline.length; i++){
        if (socketID == arrayOfAllCurrentUsersOnline[i][0]){
            arrayOfAllCurrentUsersOnline.splice(i, 1);
        }
    }
}