import React, { useEffect, useState } from "react";
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import io from "socket.io-client";
import axios from "axios";
import { Spotify }  from "react-spotify-embed";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';

import spotifyLogo from './img/Spotify.jpeg';

import "bootstrap/dist/css/bootstrap.min.css";
import "./css/GameView.css";

const socket = io.connect("http://localhost:3001");

function GameView() {
    const nav = useNavigate();
    const loc = useLocation();

    const [pid, setPID] = useState(loc.state ? loc.state.playlistId : "")
    const [token, setToken] = useState(loc.state ? loc.state.token : "")
    const [code, setCode] = useState(loc.state ? loc.state.gameCode : "")
    const [name, setName] = useState(loc.state ? loc.state.name : "")

    
    // button - start game
    const [gameStarted, setGameStarted] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [playerList, setPlayerList] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [currentTrack, setCurrentTrack] = useState("");
    const [hasVoted, setHasVoted] = useState(false);
    const [votedFor, setVotedFor] = useState("");
    const [round, setRound] = useState(0);

    const data = {
        code: code,
        name: name,
        playlistId: pid,
    }

    const leaveGame = () => {
        socket.emit("leave", {name: name, code: code});
        setGameStarted(false);
        setIsFinished(false);
        setPlayerList([]);
        setLeaderboard([]);
        setCurrentTrack("");
        setHasVoted(false);
        setVotedFor("")
        setRound(0);
        setCode("");
        nav("/");
    }

    const updatePlayers = () => { socket.emit("get_players", code); }

    const readyUp = () => {
        var rdata = {
            code: code,
            name: name,
        }
        socket.emit("is_ready", rdata);
    }

    const voteUser = (user) => {
        if (!hasVoted) {
            setVotedFor(user);
            setHasVoted(true);
            const vdata = {code: code, name: name, vote: user}
            socket.emit("submit_vote", vdata);
        }
    }

    const playAgain = () => {
        socket.emit("leave", {name: name, code: code});
        nav("/");
    }

    const copyGameCode = async () => {
        try {
          await navigator.clipboard.writeText(code);
        } catch (err) { console.error('Failed to copy game code ', err); }
      };

    useEffect(() => { 
        window.addEventListener("popstate", (event) => {
            var ldata = { name: name, code: code }
            socket.emit("leave", ldata);
          });

        // window.addEventListener("beforeunload", (event) => {
        //     var ldata = { name: name, code: code }
        //     socket.emit("leave", ldata);
        // });

        updatePlayers();

        socket.on("new_round", () => {
            setCurrentTrack("");
            setVotedFor("");
            setHasVoted(false);
        });
    })

    useEffect(() => {
        socket.emit("join_game", data);
        updatePlayers();
 
        socket.on("failed_join", () => {
            nav("/");
        });

        socket.on("update_info", (data) => {
            setRound(data.round);
            setPlayerList(data.scores);
        }); 

        socket.on("start_game", () => {
            setGameStarted(true);
            setIsFinished(false);

            var rdata = { name: name, code: code }
            socket.emit("req_round", rdata);
        });

        socket.on("picked", () => {
            axios.get(`https://api.spotify.com/v1/playlists/${pid}/tracks`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }).then(response => {
                const tracks = response.data.items;
                const randomTrackIndex = Math.floor(Math.random() * tracks.length);
                const randomTrackId = tracks[randomTrackIndex].track.id;
                console.log(`Random track ID: ${randomTrackId}`);

                const pdata = {code: code, name: name, track: randomTrackId}
                socket.emit("give_track", pdata);
            }).catch(error => {
                console.log(error);
            });
        });

        socket.on("play_round", (track) => {
            setCurrentTrack(track);
        });

        socket.on("new_round", () => {
            setCurrentTrack("");
            setVotedFor("");
            setHasVoted(false);
        });

        socket.on("end_game", (scores) => {
            const board = scores.sort((a, b) => b[1] - a[1]);
            
            setLeaderboard(board);
            setGameStarted(false);
            setIsFinished(true);
        });

    }, [socket]);

    if (!loc.state) return <Navigate to="/"/>
    
    return(<>
        <div class="container-fluid g-container" id="view">
            <div class="row">
                <div class="col-md-4 l-section">
                { isFinished ? 
                            <>
                                <h1>Leaderboard</h1>
                                <hr/>
                                { leaderboard.map(([player, score]) => (
                                    <div class="p-wrapper">
                                        <p>{player}{player.endsWith('s') ? "'" : "'s"} Score: {score}</p>
                                    </div>
                                )) }
    
    
                                <button onClick={playAgain} class="p-btn">Play Again</button>
                            </>
                        :
                            <>
                                <h2>Current Players</h2>
                                {playerList.map(([player, score]) => {
                                    if (isFinished) { return(<></>); }
                                    if (playerList.length == 1) { return(<p class="wait">Waiting for players...</p>)}

                                    return(
                                        <div class="p-wrapper">
                                        <p class="p-player">{player}</p>
                                            
                                        
                                            { gameStarted ? 
                                            <>
                                                <p class="p-score">Score <span>{score}</span> </p>
                                                <button onClick={() => voteUser(player)} class="v-btn">
                                                    { votedFor === player ? "Voted For" : "Vote" }
                                                </button> 
                                                
                                            </>
                                            
                                            : null }
                                        
                                        </div>
                                    );
                                })}
                            </>
                    }

                </div>
                <div class="col-md-4 m-section">
                    { gameStarted ? 
                        <>
                            <Spotify link={"https://open.spotify.com/track/" + currentTrack +  ""} />
                            <h5>Round {round}</h5>
                        </>
                        
                    :
                        <>
                            { isFinished ? null : <button onClick={readyUp} class="p-btn r-btn">Ready</button> }
                            <h1>Game Code</h1>
                            <p onClick={copyGameCode}>{code}<FontAwesomeIcon icon={faCopy} /></p>
                        </>
                        
                    }
                </div>
                <div class="col-md-4 r-section">
                    <h1>Guessify</h1>
                    <h3>
                        {gameStarted ? "Vote for who the currently queued song belongs to" : "Wait for everyone to join and ready up" }
                        
                        
                    </h3>
                    <img src={spotifyLogo} alt="Spotify Logo" />
                    
                    { gameStarted ? 
                    <>
                        { isFinished ? 
                            <>
                                <h1>Leaderboard</h1>
                                <hr/>
                                { leaderboard.map(([player, score]) => (
                                    <div class="p-wrapper">
                                        <p>{player}{player.endsWith('s') ? "'" : "'s"} Score: {score}</p>
                                    </div>
                                )) }
    
    
                                <button onClick={playAgain} class="p-btn">Play Again</button>
                            </>
                        :
                            <>
                            
                                
                            </>
                        }
                    </>
                        
                    : null }

                    <button onClick={leaveGame} class="l-btn">Leave Game</button>
                    
                </div>
            </div>
            {/* <h1>Game View</h1> */}
            

            <br/>

                

            <br/>

        </div>
        
    </>);
}

export default GameView;