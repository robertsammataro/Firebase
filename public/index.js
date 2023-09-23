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

      //Click handler to assign action to the remove button next to a queued player.
     // document.getElementById(`remove-${playername}-button`).addEventListener('click', function() {
      //  document.getElementById("game").remove();
      //})


      document.getElementById("name").value = "";
    }
    
  });

  document.getElementById("confirmation-button").addEventListener('click', function() { beginGame(); })

  function beginGame() {

    const playerCount = document.getElementsByClassName("queued-player").length;

    //Ensure there are enough people to actually start the tournament
    if (playerCount < 2) {
      alert("You need to have at least two players in this tournament!");
      return;
    };


    //Move players from queue to actual tournament play
    const players = [];

    let playerArray = document.getElementsByClassName("queued-player");
    for(let x = 0; x < playerArray.length; x++) {
      players.push(playerArray[x].outerText.replace('\n\n', ""));
    }

    console.log(players);

  }