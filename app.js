const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

let rooms = []; // will convert to DB after testing
let players = []; // will convert to DB after testing

let roundsRemaining = 10;

// Constructor for Players
function Player(name, previousRoom, currentRoom, seniority, inked) {
  this.name = name;
  this.previousRoom = previousRoom;
  this.currentRoom = currentRoom;
  this.seniority = seniority; // 0 is best, 50 is worst
  this.inked = inked;
}

// Constructor for Rooms
function Room(name, capacity, occupants, seniority) {
  this.name = name;
  this.capacity = capacity;
  this.occupants = occupants; // array of Players
}

//Game Logic Functions

//Gets available rooms that input player could switch to
function roomsOnTheBoard(player) {
  let availableRooms = [];
  rooms.forEach(function(room) {
    if (room.occupants.length < room.capacity) {
      //check for open space
      availableRooms.push(room);
    } else {
      //check for higher seniority
      room.occupants.forEach(function(occupant) {
        if (player.seniority < occupant.seniority) {
          availableRooms.push(room);
        }
      });
    }
  });
  return availableRooms;
}

//Switches input player to input room
//NEEDS VALIDITY CHECKS - currently outputs nothing
  // shouldn't switch to invalid rooms due to "rooms on the board" method
//Potentially kicks out lower seniority player
  //NEED TO HANDLE THIS
function switchToRoom(player, room) {
  if (room.occupants.length < room.capacity) {
    room.occupants.push(player);
    player.currentRoom = room;
    return;
  }

  let worstSeniority = 0; //find worst player in room
  let worstIndex = 0;
  for (var i = 0; i < room.occupants.length; i++) {
    if (room.occupants[i].seniority > worstSeniority) {
      worstSeniority = room.occupants[i].seniority;
      worstIndex = i;
    }
  }

  if (player.seniority < worstSeniority) {
    //update kicked out players room - IF LAST ROUND WE'VE GOTTA GIVEN HIM CHANCE TO CHANGE ROOM
    room.occupants[worstIndex].currentRoom = null;

    room.occupants[worstIndex] = player;
    player.currentRoom = room;
    return;
  }

}


//GET METHODS
app.get('/', function(req, res) {
    res.render("home", {rooms: rooms});
});

app.get('/about', function(req, res) {
    res.render("about", {});
});

app.get('/contact', function(req, res) {
    res.render("contact", {});
});



app.listen(3000, function() {
  console.log("Running on port 3000.")
});
