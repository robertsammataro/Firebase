// When the Start Tournament button is selected, this populates the popup box with the selectoed gametype
document.querySelector("#start-button").addEventListener('click', function() {
  let game_element = document.getElementById("game")
  let type_element = document.getElementById("tournament-type")
  let name_element = document.getElementById("tournament-name")
  document.getElementById("popup-text").innerHTML = 
    `${name_element.value}<br>
     ${game_element.options[game_element.selectedIndex].text}<br>
     ${type_element.options[type_element.selectedIndex].text}`;

  });

  document.querySelector("#add-player-button").addEventListener('click', function() {

    let playername = document.getElementById("name").value;

    //Only render in a new player if a player with that name is not already queued
    if(!document.getElementById(`${playername}-queued`)) {

      let newContainer = document.createElement('div');
      newContainer.setAttribute("id", `${playername}-queued`);
      newContainer.setAttribute("style", "margin: 15px;");
      newContainer.setAttribute("class", "queued-player");
      newContainer.innerHTML = `<div class="queued-player-label">${playername}</div><br>`
      newContainer.addEventListener('click', function() {
        newContainer.remove();
      })

      document.getElementById("player-container").appendChild(newContainer);
      document.getElementById("name").value = "";
    }
    
  });

  document.getElementById("confirmation-button").addEventListener('click', function() { beginGame(); })

  //This will make it so the user cannot alter game settings after the bracket has been generated
  function lockGameAttributes() {

    let game_element = document.getElementById("game")
    document.getElementById("game-selection").innerHTML = `${game_element.options[game_element.selectedIndex].text}`;

    let type_element = document.getElementById("tournament-type")
    document.getElementById("tournament-type-selection").innerHTML = `${type_element.options[type_element.selectedIndex].text}`;

    let name_element = document.getElementById("tournament-name")
    document.getElementById("tournament-name-container").innerHTML = `<div style="font-size: 40px;">${name_element.value}</div>`;

    document.getElementById("player-addition-column").remove();
    document.getElementById("tournament-column").setAttribute("class", "tourney-page-width-mode");

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
    };

    if (tournamentName.length < 3) {
      alert("You must give your tournament a name at least three characters long.");
      return;
    }

    //Move players from queue to actual tournament play
    const players = [];
    let playerArray = document.getElementsByClassName("queued-player");
    for(let x = 0; x < playerArray.length; x++) {
      players.push(playerArray[x].outerText.replace('\n\n', ""));
    }

    lockGameAttributes();
    drawRow(players, 1);

    console.log(players); //Sanity Check

  }

  //Create one level in the tournament bracket
  function drawRow(players, rowNo) {

    if (players.length == 1) {
      handleWinner(players);
      return;
    }

    players = shuffle(players);

    //Add div for each heat under the bracket object
    element = document.createElement('div');
    element.setAttribute('id', `heat${rowNo}`);
    
    let label = document.createElement('h1');
    label.innerHTML = `Heat ${rowNo} - ${players.length} players`;
    element.appendChild(label);
    document.getElementById('bracket').appendChild(element);



    let heatCount = 0;

    for(let count = 0; count < players.length; count += 2) {
      
      let player1 = players[count];
      let player2 = null;

      if(count + 1 < players.length) {
        player2 = players[count + 1]
      }

      draw_matchup(player1, player2, rowNo, heatCount);

      heatCount++;
      
    }

    document.getElementById("bracket").appendChild(document.createElement("br"));

    let button = document.createElement('button');
    button.setAttribute('class', 'advance-button');
    button.setAttribute('id', 'advance-button');
    button.innerHTML += "Confirm Results"

    button.addEventListener('click', function() {
      getWinners(rowNo);
    })

    document.getElementById("bracket").appendChild(button);

  }

  //Create the buttons to indicate which player won their match
  function draw_matchup(player1, player2, heat, match) {

    this.player1 = player1;
    this.player2 = player2;

    element = document.createElement('div');
    element.setAttribute("class", "matchup");

    this.$player1button = document.createElement('div');
    this.$player1button.setAttribute("id", `match-h${heat}-m${match}-1`)
    this.$player1button.setAttribute("class", "matchup-not-selected");

    if(player2 == null) {
      this.$player1button.setAttribute("class", "matchup-selected");
    }
    
    this.$player2button = document.createElement('div');
    this.$player2button.setAttribute("class", "matchup-not-selected");
    this.$player2button.setAttribute("id", `match-h${heat}-m${match}-2`)
    

    this.$player1button.innerHTML = `${player1}`;

    if(player2 == null) {
      this.$player2button.innerHTML = `- No Contest -`;
    } else {
      this.$player2button.innerHTML = `${player2}`;
    }

    //Only add buttonListeners if there are two players in the matchup.
    if(player2 != null) {

      this.$player1button.addEventListener('click', function() {
        console.log("Button Pressed");
        document.getElementById(`match-h${heat}-m${match}-1`).setAttribute("class", "matchup-selected");
        document.getElementById(`match-h${heat}-m${match}-2`).setAttribute("class", "matchup-not-selected");
      })
      
      this.$player2button.addEventListener('click', function() {
  
        console.log("Button Pressed");
        document.getElementById(`match-h${heat}-m${match}-1`).setAttribute("class", "matchup-not-selected");
        document.getElementById(`match-h${heat}-m${match}-2`).setAttribute("class", "matchup-selected");
        
      })

    }
    

    element.appendChild(this.$player1button);
    element.appendChild(this.$player2button);

    document.getElementById(`heat${heat}`).appendChild(element);
    document.getElementById(`heat${heat}`).appendChild(document.createElement("hr"));

  };

  function getWinners(heatNo) {

    console.log(`getWinners for heat ${heatNo}`);
    document.getElementById('advance-button').remove();

    let winners = []

    let collection = document.getElementById(`heat${heatNo}`).getElementsByClassName('matchup-selected');

    for (let i = 0; i < collection.length; i++) {
      console.log(collection[i].textContent);
      winners.push(collection[i].textContent);
    }

    console.log(winners);

    drawRow(winners, heatNo + 1);

  }

  function handleWinner(players) {

    let element = document.createElement('div');
    element.setAttribute('id', 'winner-text');
    
    let text_header = document.createElement('h1');
    text_header.innerHTML = `Congratulations ${players[0]}, you've won the tournament!`;

    document.getElementById("bracket").appendChild(text_header);

  }

  function shuffle (array) { 
    for (let i = array.length - 1; i > 0; i--) { 
      const j = Math.floor(Math.random() * (i + 1)); 
      [array[i], array[j]] = [array[j], array[i]]; 
    } 
    return array; 
  }; 