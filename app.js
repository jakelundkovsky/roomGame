const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost:27017/test', {useNewUrlParser: true});

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

let players = {
  0: new Player("Rossy", "Wall Street", null, false),
  1: new Player("Tommy", "Wall Street", "Section 80", false),
  2: new Player("Jake", "Section 80", null, false),
  3: new Player("Tanner", "Section 80", null, false),
  4: new Player("Pledge", null, null, false)
}; // convert to DB after testing

let rooms = {
  "Wall Street": new Room(2, []),
  "Section 80": new Room(2, [1, 4])
}; // convert to DB after testing

let resultingRooms = [];

let roundsRemaining = 5;





//Game Logic Functions







//Sets up a turn for a player
function getTurn(id) {
  let availRooms = roomsOnTheBoard(id);
  let options = ["Pass"];

  if (availRooms.length !== 0) {
    options.push("Change Rooms");
  }

  if (players[id].prevRoom !== null) {
    options.push("Ink");
  }

  return {
    id: id,
    name: players[id].name,
    availRooms: availRooms,
    options: options
  };
}


//GET METHODS
app.get('/', function(req, res) {
    res.render("home", getTurn(0));
});

app.get('/about', function(req, res) {
    res.render("about", {});
});

app.get('/contact', function(req, res) {
    res.render("contact", {});
});



app.listen(3000, function() {
  console.log("Running on port 3000.");
});






//========================= METHODS =============================

//////////// Constructors //////////
function Player(name, prevRoom, currRoom, inked) {
  //this.seniority = seniority; // Number: 0 is best, 50 is worst -- also functions as an id
  this.name = name; // String
  this.prevRoom = prevRoom; // String
  this.currRoom = currRoom; // String
  this.inked = inked;
  //maybe go back and add roomsOnTheBoard, switchToRoom, ink, getTurn as methods for player object
}

function Room(capacity, occupants) {
  //this.name = name; //String
  this.capacity = capacity; //number
  this.occupants = occupants; // array of player ids/seniorities (Numbers)
}



//Gets available rooms that players CAN switch to
//input: id: (Number)
//output: array of available rooms ([Strings])
function roomsOnTheBoard(id) {
  let availableRooms = [];

  //check for inks
  Object.entries(rooms).forEach(function(room) {
    if (room[1].occupants.length < room[1].capacity) {
      //open spot in room
      availableRooms.push(room[0]);
    } else {
      //check if player to enter has better seniority than an inhabitant
      // let worstSeniorityInRoom = Math.max.apply(Math, room[1].occupants);
      // if (player < worstSeniorityInRoom) {
      //   availableRooms.push(room[0]);
      // }
      let isAvailable = false;
      for (var i = 0; i < room[1].occupants.length; i++) {
        if (id < room[1].occupants[i] && !room[1].occupants[i].inked) {
          isAvailable = true;
        }
      }

      if (isAvailable) {
        availableRooms.push(room[0]);
      }
    }
  });

  return availableRooms; //returns array of room names (Strings)
}



//inputs:
//id: Number (seniority)
//room: String (room name)
//return: void

//future: handle kicking someone out (last round?)
function switchToRoom(id, room, isInking) {
  let player = players[id];
  let oldRoom = null;
  if (player.currRoom !== null) {
    oldRoom = rooms[player.currRoom];
  }
  let destRoom = rooms[room]; //destination Room Object

  //already in room
  if (player.currRoom === room) {
    return;
  }
  //open space in room
  if (destRoom.occupants.length < destRoom.capacity) {
    destRoom.occupants.push(id);
    player.currRoom = room;
  } else { //check if can kick out lower seniority noob

    //find lowest seniority that is not inked
    let worstSeniorityInRoom = 0;
    for (var i = 0; i < destRoom.occupants.length; i++) {
      if (destRoom.occupants[i] > worstSeniorityInRoom && !destRoom.occupants[i].inked) {
        worstSeniorityInRoom = destRoom.occupants[i];
      }
    }
    if (!isInking) {
      //kick out the noob if we can
      for (var i = 0; i < destRoom.occupants.length; i++) {
        if (destRoom.occupants[i] === worstSeniorityInRoom && worstSeniorityInRoom > id) {
          players[worstSeniorityInRoom].currRoom = null;
          player.currRoom = room;
          destRoom.occupants[i] = id;
        }
      }
    } else { //is Inking
      //kick the noob out regardless
      for (var i = 0; i < destRoom.occupants.length; i++) {
        if (destRoom.occupants[i] === worstSeniorityInRoom) {
          players[worstSeniorityInRoom].currRoom = null;
          player.currRoom = room;
          destRoom.occupants[i] = id;
        }
      }
    }
  }

  if (oldRoom !== destRoom && oldRoom !== null) {
    let indexToRemove = 0;
    for (var i = 0; i < oldRoom.occupants.length; i++) {
      if (oldRoom.occupants[i] === id) {
        indexToRemove = i;
      }
    }
    oldRoom.occupants.splice(indexToRemove, 1);
  }
}


//Inks  a player
//input: id (Number)
//output: void
function ink(id) {
  let player = players[id];

  if (player.prevRoom === null) return; //cannot ink if first time playing
  let room = rooms[player.prevRoom];

  switchToRoom(id, player.prevRoom, true);
  player.inked = true;

  return;
}
