const db = firebase.firestore();

// When the Start Tournament button is selected, this populates the popup box with the selectoed gametype
document
  .querySelector("#start-button").addEventListener("click", function () {
    let game_element = document.getElementById("game");
    let type_element = document.getElementById("tournament-type");
    let name_element = document.getElementById("tournament-name");
    document.getElementById("popup-text").innerHTML = `${name_element.value}<br>
      ${game_element.options[game_element.selectedIndex].text}<br>
      ${type_element.options[type_element.selectedIndex].text}`;
  });

document
  .querySelector("#add-player-button")
  .addEventListener("click", function () {
    let playername = document.getElementById("name").value;

    //Only render in a new player if a player with that name is not already queued
    if (!document.getElementById(`${playername}-queued`)) {
      let newContainer = document.createElement("div");
      newContainer.setAttribute("id", `${playername}-queued`);
      newContainer.setAttribute("style", "margin: 15px;");
      newContainer.setAttribute("class", "queued-player");
      newContainer.innerHTML = `<div class="queued-player-label">${playername}</div><br>`;
      newContainer.addEventListener("click", function () {
        newContainer.remove();
      });

      document.getElementById("player-container").appendChild(newContainer);
      document.getElementById("name").value = "";
    }
  });

document
  .getElementById("confirmation-button")
  .addEventListener("click", function () {
    beginGame();
  });

//This will make it so the user cannot alter game settings after the bracket has been generated
function lockGameAttributes(tourneyObj) {

  let game_element = document.getElementById("game");
  document.getElementById("game-selection").innerHTML = `${
    tourneyObj.game
  }`;

  let type_element = document.getElementById("tournament-type");
  document.getElementById("tournament-type-selection").innerHTML = `${
    tourneyObj.bracketType
  }`;

  let name_element = document.getElementById("tournament-name");
  document.getElementById(
    "tournament-name-container"
  ).innerHTML = `<div style="font-size: 40px;">${tourneyObj.tournamentName}</div>`;

  document.getElementById("player-addition-column").remove();
  document
    .getElementById("tournament-column")
    .setAttribute("class", "tourney-page-width-mode");
}

function beginGame() {
  //Get important values of the game
  const playerCount = document.getElementsByClassName("queued-player").length;
  const game = document.getElementById("game").value;
  const bracketType = document.getElementById("tournament-type").value;
  const tournamentName = document.getElementById("tournament-name").value;

  //Ensure there are enough people to actually start the tournament
  if (playerCount < 2) {
    alert("You need to have at least two players in this tournament!");
    return;
  }

  if (tournamentName.length < 3) {
    alert(
      "You must give your tournament a name at least three characters long."
    );
    return;
  }

  //Move players from queue to actual tournament play
  const players = [];
  let playerArray = document.getElementsByClassName("queued-player");
  for (let x = 0; x < playerArray.length; x++) {
    players.push(playerArray[x].outerText.replace("\n\n", ""));
  }

  //Define the tourney object that will be stored on Firebase

  let tourney = {tournamentName, game, bracketType, players}

  //Send tournamnet object to firebase.
  let newRef = firebase.database().ref("/tourneys").push();
  newRef.set(tourney).then(() => {
    document.location.pathname = `/tourney/${newRef.key}`;
  })

}

//Create one level in the tournament bracket
function createNewHeat(players, rowNo, tourneyId, tourneyData) {

  if (players.length == 1) {
    handleWinner(players);
    return;
  }

  players = shuffle(players);

  //Add div for each heat under the bracket object
  element = document.createElement("div");
  element.setAttribute("id", `heat${rowNo}`);

  let label = document.createElement("h1");
  label.innerHTML = `Heat ${rowNo} - ${players.length} players`;
  element.appendChild(label);
  document.getElementById("bracket").appendChild(element);

  let heatCount = 0;

  let heatJSON = {};

  for (let count = 0; count < players.length; count += 2) {
    let player1 = players[count];
    let player2 = null;

    if (count + 1 < players.length) {
      player2 = players[count + 1];
    }

    if(player2) {
      heatJSON[`match${heatCount}`] = {"player1": player1, "player2": player2, "winner": null}
    } else {
      heatJSON[`match${heatCount}`] = {"player1": player1, "player2": player2, "winner": player1}
    }    

    draw_matchup(player1, player2, rowNo, heatCount);

    heatCount++;
  }

  heatJSON["meta"] = {"players": players, "player-count": players.length, "matchups": heatCount}

  if(!tourneyData["heat"]) {
    tourneyData["heat"] = {};
  }

  tourneyData["heat"][rowNo] = heatJSON;

  //Add heatJSON to the database.
  const childRef = firebase.database().ref('/tourneys').child(tourneyId);
  childRef.update(tourneyData)

  document.getElementById("bracket").appendChild(document.createElement("br"));

  let button = document.createElement("button");
  button.setAttribute("class", "advance-button");
  button.setAttribute("id", "advance-button");
  button.innerHTML += "Confirm Results";

  button.addEventListener("click", function () {
    getWinners(rowNo, tourneyId, tourneyData);
  });

  document.getElementById("bracket").appendChild(button);
}

function loadExistingHeat(rowNo, tourneyData, tourneyId) {

  //Get Players from tourneyData object:
  let players = tourneyData["heat"][rowNo]["meta"]["players"];

  //Add div for each heat under the bracket object
  element = document.createElement("div");
  element.setAttribute("id", `heat${rowNo}`);

  let label = document.createElement("h1");
  label.innerHTML = `Heat ${rowNo} - ${players.length} players`;
  element.appendChild(label);
  document.getElementById("bracket").appendChild(element);

  let heatCount = 0;

  for (let count = 0; count < players.length; count += 2) {
    let player1 = players[count];
    let player2 = null;

    if (count + 1 < players.length) {
      player2 = players[count + 1];
    }

    draw_matchup(player1, player2, rowNo, heatCount);

    winnerId = tourneyData["heat"][rowNo][`match${heatCount}`]["winner"]

    if(winnerId == 1) {
      document.getElementById(`match-h${rowNo}-m${heatCount}-1`).setAttribute("class", "matchup-selected")
    }
    
    else if(winnerId == 2) {
      document.getElementById(`match-h${rowNo}-m${heatCount}-2`).setAttribute("class", "matchup-selected")

    }

    heatCount++;
  }

  document.getElementById("bracket").appendChild(document.createElement("br"));

  if(!tourneyData["heat"] || rowNo == Object.keys(tourneyData["heat"]).length - 1) {

      let button = document.createElement("button");
      button.setAttribute("class", "advance-button");
      button.setAttribute("id", "advance-button");
      button.innerHTML += "Confirm Results";
    
      button.addEventListener("click", function () {
        getWinners(rowNo, tourneyId, tourneyData);
      });
    
      document.getElementById("bracket").appendChild(button);

  }  

}

//Create the buttons to indicate which player won their match
function draw_matchup(player1, player2, heat, match) {
  this.player1 = player1;
  this.player2 = player2;

  element = document.createElement("div");
  element.setAttribute("class", "matchup");

  this.$player1button = document.createElement("div");
  this.$player1button.setAttribute("id", `match-h${heat}-m${match}-1`);
  this.$player1button.setAttribute("class", "matchup-not-selected");

  if (player2 == null) {
    this.$player1button.setAttribute("class", "matchup-selected");
  }

  this.$player2button = document.createElement("div");
  this.$player2button.setAttribute("class", "matchup-not-selected");
  this.$player2button.setAttribute("id", `match-h${heat}-m${match}-2`);

  this.$player1button.innerHTML = `${player1}`;

  if (player2 == null) {
    this.$player2button.innerHTML = `- No Contest -`;
  } else {
    this.$player2button.innerHTML = `${player2}`;
  }

  //Only add buttonListeners if there are two players in the matchup.
  if (player2 != null) {
    this.$player1button.addEventListener("click", function () {
      document
        .getElementById(`match-h${heat}-m${match}-1`)
        .setAttribute("class", "matchup-selected");
      document
        .getElementById(`match-h${heat}-m${match}-2`)
        .setAttribute("class", "matchup-not-selected");
    });

    this.$player2button.addEventListener("click", function () {
      document
        .getElementById(`match-h${heat}-m${match}-1`)
        .setAttribute("class", "matchup-not-selected");
      document
        .getElementById(`match-h${heat}-m${match}-2`)
        .setAttribute("class", "matchup-selected");
    });

  }

  element.appendChild(this.$player1button);
  element.appendChild(this.$player2button);

  document.getElementById(`heat${heat}`).appendChild(element);
  document
    .getElementById(`heat${heat}`)
    .appendChild(document.createElement("hr"));
}

function getWinners(heatNo, tourneyId, tourneyData) {

  if(document.getElementById("advance-button")) {
    document.getElementById("advance-button").remove();
  }

  let winners = [];

  let collection = document
    .getElementById(`heat${heatNo}`)
    .getElementsByClassName("matchup-selected");

  for (let i = 0; i < collection.length; i++) {
    winners.push(collection[i].textContent);

    if(collection[i].id.endsWith("1")){
      tourneyData["heat"][heatNo][`match${i}`]["winner"] = 1
    } else {
      tourneyData["heat"][heatNo][`match${i}`]["winner"] = 2
    }

    const childRef = firebase.database().ref('/tourneys').child(tourneyId);
    childRef.update(tourneyData)

  }

  createNewHeat(winners, heatNo + 1, tourneyId, tourneyData);
}

function handleWinner(players) {
  let element = document.createElement("div");
  element.setAttribute("id", "winner-text");

  let text_header = document.createElement("h1");
  text_header.innerHTML = `Congratulations ${players[0]}, you've won the tournament!`;

  document.getElementById("bracket").appendChild(text_header);
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

document.addEventListener('DOMContentLoaded', function() {
  let pn = document.location.pathname;
  let parts = pn.split("/");

  if(parts.length == 3) {
    renderPage(parts[2]);
  }
  

})

async function renderPage(tourneyId) {

  //Make call to the Firebase Database to get the data to render.
  const childRef = firebase.database().ref('/tourneys').child(tourneyId);
  const tourneyData = await childRef.get().then(function(snapshot) {
    return snapshot.val();
  })

  lockGameAttributes(tourneyData);

  let count = 1;

  //Check to see how many heats have already been completed:
  if(tourneyData["heat"]) {

    for (count = 1; count <= Object.keys(tourneyData["heat"]).length; count++){

      loadExistingHeat(count, tourneyData, tourneyId)

    }

    //Get the players that are still in the 
    getWinners(count - 1, tourneyId, tourneyData);



  } else {
    createNewHeat(tourneyData.players, 1, tourneyId, tourneyData);
  }

}