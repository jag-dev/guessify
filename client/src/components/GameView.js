import React, { useEffect, useState } from "react";
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import io from "socket.io-client";
import axios from "axios";
import { Spotify }  from "react-spotify-embed";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faCrown } from '@fortawesome/free-solid-svg-icons';

import spotifyLogo from '../img/Spotify.jpeg';

import "bootstrap/dist/css/bootstrap.min.css"; 
import "../css/GameView.css";

const socket = io.connect("http://localhost:3001");

function GameView() {
    const nav = useNavigate();
    const loc = useLocation();
    
    // User states
    const pid = loc.state ? loc.state.playlistId : ""
    const token = loc.state ? loc.state.token : ""
    const name = loc.state ? loc.state.name : ""
    const [code, setCode] = useState(loc.state ? loc.state.gameCode : "")

    
    // Game states
    const [gameStarted, setGameStarted] = useState(false);
    const [inGame, setInGame] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [playerList, setPlayerList] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [currentTrack, setCurrentTrack] = useState("");
    const [hasVoted, setHasVoted] = useState(false);
    const [votedFor, setVotedFor] = useState("");
    const [round, setRound] = useState(0);

    // Leave the game
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

    // Update player information
    const updatePlayers = () => { if (inGame) { socket.emit("get_players", code); } }

    // Ready up
    const readyUp = () => {
        var rdata = {
            code: code,
            name: name,
        }
        socket.emit("is_ready", rdata);
    }

    // Vote for a player
    const voteUser = (user) => {
        if (!hasVoted) {
            setVotedFor(user);
            setHasVoted(true);
            const vdata = {code: code, name: name, vote: user}
            socket.emit("submit_vote", vdata);
        }
    }

    // Hit play again button
    const playAgain = () => {
        socket.emit("leave", {name: name, code: code});
        nav("/");
    }

    // Copy game code to clipboard
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

        window.addEventListener("beforeunload", (event) => {
            var ldata = { name: name, code: code }
            socket.emit("leave", ldata);
        });

        updatePlayers();

        socket.on("new_round", () => {
            setCurrentTrack("");
            setVotedFor("");
            setHasVoted(false);
        });
    })

    useEffect(() => {
        socket.emit("join_game", {code: code, name: name, playlistId: pid}, (resp) => {
            if (resp.joined) { setInGame(true);} 
            else {
                setInGame(false);
                alert(`Unable to join game (${resp.reason})`)
                nav("/");
            }
        });

        updatePlayers();

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

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket]);

    if (!loc.state) return <Navigate to="/"/>
    
    return(<>
        <div className="container-fluid g-container" id="view">
            <div className="row">
                <div className="col-md-4 l-section">
                { isFinished ? 
                            <div className="lboard">
                                <h1>Leaderboard</h1>
                                <hr/>
                                { leaderboard.map(([player, score], idx) => (
                                    <div key={idx} className="p-wrapper">
                                        <p>
                                            { idx === 0 ? <FontAwesomeIcon icon={faCrown} /> : null }
                                            {player}{player.endsWith('s') ? "'" : "'s"} Score: <span>{score}</span>
                                        </p>
                                    </div>
                                )) }
    
    
                                
                            </div>
                        :
                            <>
                                <h2>Current Players</h2>
                                {playerList.map(([player, score]) => {
                                    if (isFinished) { return(<></>); } 
                                    if (playerList.length === 1) { return(<p key={player} className="wait">Waiting for players...</p>)}

                                    return(
                                        <div key={player} className="p-wrapper"> 
                                            <p className="p-player">{player}</p>
                                            
                                            { gameStarted ? 
                                            <>
                                                <p className="p-score">Score <span>{score}</span> </p>
                                                <button onClick={() => voteUser(player)} className="v-btn">
                                                    { votedFor === player ? "Voted" : "Vote" }
                                                </button> 
                                                
                                            </>
                                            
                                            : null }
                                        
                                        </div>
                                    );
                                })}
                            </>
                    }

                </div>
                <div className="col-md-4 m-section">
                    { gameStarted ? 
                        <>
                            <Spotify link={"https://open.spotify.com/track/" + currentTrack +  ""} />
                            <h5>Round {round}</h5>
                        </>
                        
                    :
                        <>
                            { isFinished ? 
                                <button onClick={playAgain} className="p-btn pa-btn">Play Again</button>
                             : 
                             <>
                                <button onClick={readyUp} className="p-btn r-btn">Ready</button>
                                <h1>Game Code</h1>
                                <p onClick={copyGameCode}>{code}<FontAwesomeIcon icon={faCopy} /></p>
                             </>
                                
                            }
                            
                        </>
                        
                    }
                </div>
                <div className="col-md-4 r-section">
                    <h1>Guessify</h1>
                    {gameStarted ? <h3>Vote for who the currently queued song belongs to</h3> 
                        : 
                        <>
                            { isFinished ? <h3>Game is over, thank you for playing</h3> : <h3>Wait for everyone to join and ready up</h3>}
                        </>
                        
                    }
                        
                        
                    <img src={spotifyLogo} alt="Spotify Logo" />
                    
                    <br/>

                    <button onClick={leaveGame} className="l-btn">Leave Game</button>
                    
                </div>
            </div>

        </div>
        
    </>);
}

export default GameView;