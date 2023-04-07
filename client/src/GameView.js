import React, { useEffect, useState } from "react";
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import io from "socket.io-client";

import "bootstrap/dist/css/bootstrap.min.css";
import "./css/GameView.css";

const socket = io.connect("http://localhost:3001");

function GameView() {
    const nav = useNavigate();
    const loc = useLocation();

    const [pid, setPID] = useState(loc.state ? loc.state.playlistId : "")
    const [code, setCode] = useState(loc.state ? loc.state.gameCode : "")
    const [name, setName] = useState(loc.state ? loc.state.name : "")

    
    // button - start game
    const [playerList, setPlayerList] = useState([]);

    const data = {
        code: code,
        name: name,
        playlistId: pid,
    }

    const updatePlayers = () => { socket.emit("get_players", code); }

    useEffect(() => { 

        window.addEventListener("popstate", (event) => {
            var ldata = { name: name, code: code }
            socket.emit("leave", ldata);
          });

        updatePlayers();
    })

    useEffect(() => {
        socket.emit("join_game", data);
        updatePlayers();
 
        socket.on("update_players", (players) => {
            console.log(players)
            setPlayerList(players);
        }); 

    }, [socket]);

    if (!loc.state) return <Navigate to="/"/>
    
    return(<>
        <div class="container">
            <h1>Game View</h1>
            <h5>Game Code: {code}</h5>
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