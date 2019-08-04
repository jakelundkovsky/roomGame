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
  0: new Player("Nithin", "Bayou", null, false),
  1: new Player("Felly", "Bayou", null, false),
  2: new Player("Jaws", "The Cove", null, false),
  3: new Player("Conrad", "The Cove", null, false),
  4: new Player("Rossy", "Wall Street", null, false),
  5: new Player("Tommy", "Wall Street", null, false),
  6: new Player("Jake", "Section 80", null, false),
  7: new Player("Tanner", "Section 80", null, false)
}; // convert to DB after testing

let numPlayers = Object.keys(players).length;

let rooms = {
  "Wall Street": new Room(2, []),
  "Section 80": new Room(2, []),
  "The Cove": new Room(2, []),
  "Bayou": new Room(2, [])
}; // convert to DB after testing

let roundsRemaining = 10;

let i = 0; //iteration

// let gameStarted = false;

//GET METHODS
app.get('/', function(req, res) {
    res.render("settings", {});
});

app.get('/roomGame', function(req, res) {
    res.render("home", getTurn(i % numPlayers));
});

app.get('/about', function(req, res) {
    res.render("about", {});
});

app.get('/contact', function(req, res) {
    res.render("contact", {});
});

app.get('/finalResults', function(req, res) {
    res.render('finalResults', {
      rooms: rooms,
      players: players
    });
});


//POST METHODS
app.post('/', function(req, res) {
    roundsRemaining = parseInt(req.body.rounds) - 1;
    res.redirect('/roomGame');
});

app.post('/roomGame', function(req, res) {
    let choice = req.body.choice;
    let playerId = i % numPlayers;
    if (choice === "Ink") {
      //ink the player
      ink(playerId);
    } else if (choice !== "Pass") {
      //move the player to given room
      switchToRoom(playerId, choice);
    }


    //need to have a check if all players inked to redirect to results
    do {
      i++;
      if ((i % numPlayers) === 0) {
        roundsRemaining--;
      }

      let gameOver = true;
      Object.entries(players).forEach(function(player) {
        if (!player[1].inked) {
          gameOver = false;
        }
      });

      //if out of rounds or everyone's inked
      if (roundsRemaining === -1 || gameOver) {
        res.redirect('/finalResults');
      }

    } while (players[i % numPlayers].inked);

    res.redirect('/roomGame');
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
    //make sure player is not currently in that room
    if (!(players[id].currRoom === room[0])) {
      if (room[1].occupants.length < room[1].capacity) {
        //open spot in room
        availableRooms.push(room[0]);
      } else {
        //finds if player in room w/ lower seniority & !inked
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
    }
  });

  return availableRooms; //returns array of room names (Strings)
}


//switches given player to given room
function switchToRoom(id, room) {
  let player = players[id];
  let destRoom = rooms[room]; //destination Room Object

  //remove player from his room before moving him to new room
  if (player.currRoom !== null) {
    let oldRoom = rooms[player.currRoom];
    let indexToSplice = 0;
    for (var i = 0; i < oldRoom.occupants.length; i++) {
      if (oldRoom.occupants[i] === id) {
        indexToSplice = i;
      }
    }
    oldRoom.occupants.splice(indexToSplice, 1);
  }

  //open space in rooms
  if (destRoom.occupants.length < destRoom.capacity) {
    destRoom.occupants.push(id);
    player.currRoom = room;
  } else { //find & kick out lowest seniority without the inkies

    //get the worst seniority/index that isn't inked
    let worstSeniorityInRoom = 0;
    let indexToReplace = 0;
    for (var i = 0; i < destRoom.occupants.length; i++) {
      if (destRoom.occupants[i] > worstSeniorityInRoom && !destRoom.occupants[i].inked) {
        worstSeniorityInRoom = destRoom.occupants[i];
        indexToReplace = i;
      }
    }

    destRoom.occupants[indexToReplace] = id; // replace kicked out noob in room array
    players[worstSeniorityInRoom].currRoom = null; //kicked out player to the VOID
    players[id].currRoom = room; // players currRoom = room

  }

}


//Inks  a player
//input: id (Number)
//output: void
function ink(id) {
  let player = players[id];

  //already in correct room, just ink and return
  if (player.prevRoom === player.currRoom) {
    player.inked = true;
    return;
  }

  let destRoom = rooms[player.prevRoom];

  //remove player from his room before moving him to new room
  if (player.currRoom !== null) {
    let oldRoom = rooms[player.currRoom];
    let indexToSplice = 0;
    for (var i = 0; i < oldRoom.occupants.length; i++) {
      if (oldRoom.occupants[i] === id) {
        indexToSplice = i;
      }
    }
    oldRoom.occupants.splice(indexToSplice, 1);
  }

  if (destRoom.occupants.length < destRoom.capacity) {
    destRoom.occupants.push(id);
    player.currRoom = player.prevRoom;
  } else { //find & kick out lowest seniority without the inkies

    //get the worst seniority/index that isn't inked
    let worstSeniorityInRoom = 0;
    let indexToReplace = 0;
    for (var i = 0; i < destRoom.occupants.length; i++) {
      if (destRoom.occupants[i] > worstSeniorityInRoom && !destRoom.occupants[i].inked) {
        worstSeniorityInRoom = destRoom.occupants[i];
        indexToReplace = i;
      }
    }

    destRoom.occupants[indexToReplace] = id; // replace kicked out noob in room array
    players[worstSeniorityInRoom].currRoom = null; //kicked out player to the VOID
    players[id].currRoom = players[id].prevRoom; // players currRoom = room

  }

  player.inked = true;
}


//Sets up a turn for a player
function getTurn(id) {
  let availRooms = roomsOnTheBoard(id);
  let options = [];

  if (players[id].currRoom !== null) {
    options.push("Pass");
  }

  if (availRooms.length !== 0) {
    options.push("Change Rooms");
  }

  if (players[id].prevRoom !== null) {
    options.push("Ink");
  }

  //["Pass", "Change Rooms", "Ink"]

  return {
    id: id,
    name: players[id].name,
    currRoom: players[id].currRoom,
    availRooms: availRooms,
    options: options,
    roundsRemaining: roundsRemaining,
    rooms: rooms,
    players: players
  };
}


function resetGame() {
  i = 0;
  roundsRemaining = 5;

  //reset players
  Object.entries(players).forEach(function(player) {
    player[1].inked = false;
    player[1].currRoom = null;
  });

  //reset rooms
  Object.entries(rooms).forEach(function(room) {
    rooms[1].occupants = [];
  });

  res.redirect('/');
}
