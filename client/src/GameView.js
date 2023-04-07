import React, { useEffect, useState } from "react";
import { useLocation } from 'react-router-dom';
import io from "socket.io-client";

import "bootstrap/dist/css/bootstrap.min.css";
import "./css/GameView.css";

const socket = io.connect("http://localhost:3001");

function GameView() {
    const loc = useLocation();
    const playlistId = loc.state.playlistId;
    const gameCode = loc.state.gameCode;

    const [inGame, setInGame] = useState(false);
    const [playerList, setPlayerList] = useState([]);


    useEffect(() => {
        socket.emit("get_players", gameCode);
    })

    useEffect(() => {
        socket.emit("join_game", gameCode);
        socket.emit("get_players", gameCode);

        socket.on("update_players", (players) => {
            
            setPlayerList(players);
        });

    }, [socket]);
    
    return(<>
        <div class="container">
            <h1>Game View</h1>
            <h5>Game Code: {gameCode}</h5>
            <br/>
            {playerList.map((player, id) => {
                return(
                    <p>Player {id+1}: {player}</p>
                );
            })}
            <br/>
            <button>Test</button>

        </div>
        
    </>);
}

export default GameView;