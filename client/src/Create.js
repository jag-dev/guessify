import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";

import "bootstrap/dist/css/bootstrap.min.css";
import "./css/Create.css";



function Create({name, pid, token}) {
    const [maxRounds, setMaxRounds] = useState('');
    const [maxPlayers, setMaxPlayers] = useState('');
    const [winScore, setWinScore] = useState('');
    const [gameCode, setGameCode] = useState('');

    const nav = useNavigate();
    
  
    const handleSubmit = (event) => {
      event.preventDefault();
      
      const socket = io.connect("http://localhost:3001");

      socket.emit("create_game", {name: name, 
                                  code: gameCode, 
                                  rounds: maxRounds,
                                  players: maxPlayers,
                                  score: winScore}, 
                                  (resp) => {
                                    if (resp) {
                                      nav("/game", {
                                        state: {
                                           playlistId: pid,
                                           token: token,
                                           name: name,
                                           gameCode: gameCode
                                        }
                                      });
                                    } else { alert("Game code already in use"); }
                                  });

      console.log(maxRounds, maxPlayers, winScore, gameCode);
    }
  
    return (
      <div className="container c-container">
        <h1>Create a Game</h1>
        <hr/>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="maxRounds">Max Rounds <span className="sub-label">(1-10)</span></label>
            <br/>
            <p htmlFor="maxPlayers">Most amount of rounds played</p>
            <input
              type="number"
              className="form-control"
              id="maxRounds"
              min="1"
              max="10"
              placeholder="0"
              value={maxRounds}
              onChange={(event) => setMaxRounds(event.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="maxPlayers">Max Players <span className="sub-label">[1-10]</span></label>
            <br/>
            <p htmlFor="maxPlayers">Most players allowed in game</p>
            <input
              type="number"
              className="form-control"
              id="maxPlayers"
              min="1"
              max="10"
              placeholder="0"
              value={maxPlayers}
              onChange={(event) => setMaxPlayers(event.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="winScore">Winning Score <span className="sub-label">[1-10]</span></label>
            <br/>
            <p htmlFor="maxPlayers">Winning player score count</p>
            <input
              type="number"
              className="form-control"
              id="winScore"
              min="1"
              max="10"
              placeholder="0"
              value={winScore}
              onChange={(event) => setWinScore(event.target.value)}
              required
            />
          </div>
          <div id="gc" className="form-group">
            <label htmlFor="game_code">Game Code</label>
            <br/>
            <p htmlFor="maxPlayers">Unique code to join game with</p>
            <input
              type="text"
              className="form-control"
              id="game_code"
              value={gameCode}
              onChange={(event) => setGameCode(event.target.value)}
              required
            />
          </div>
          <button type="submit" className="c-btn btn-primary">Submit</button>
        </form>
      </div>
    );
}

export default Create;