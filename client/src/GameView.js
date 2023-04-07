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
    const [gameStarted, setGameStarted] = useState(false);
    const [playerList, setPlayerList] = useState([]);

    const data = {
        code: code,
        name: name,
        playlistId: pid,
    }

    const updatePlayers = () => { socket.emit("get_players", code); }

    const readyUp = () => {
        var rdata = {
            code: code,
            name: name,
        }
        socket.emit("is_ready", rdata)
    }

    useEffect(() => { 
        window.addEventListener("popstate", (event) => {
            var ldata = { name: name, code: code }
            socket.emit("leave", ldata);
          });

        window.addEventListener("beforeunload", (event) => {
            var ldata = { name: name, code: code }
            socket.emit("leave", ldata);
        });

        updatePlayers();
    })

    useEffect(() => {
        socket.emit("join_game", data);
        updatePlayers();
 
        socket.on("failed_join", () => {
            nav("/");
        });

        socket.on("update_players", (players) => {
            setPlayerList(players);
        }); 

        socket.on("start_game", () => {
            setGameStarted(true);
        });

    }, [socket]);

    if (!loc.state) return <Navigate to="/"/>
    
    return(<>
        <div class="container">
            <h1>Game View</h1>
            <h5>Game Code: {code}</h5>
            <br/>
            {playerList.map((player, id) => {
                return(<p>Player {id+1}: {player}</p>);
            })}
            <br/>

            {gameStarted ? <h1>Game on</h1> : <button onClick={readyUp} class="p-btn r-btn">Ready</button> }

        </div>
        
    </>);
}

export default GameView;