const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// Game instance mapping
const games = new Map();

io.on("connection", (socket) => {
    console.log(`[${(new Date()).toLocaleString()}][INFO] Connection with socket ID ${socket.id}`);

    // Create a new game
    socket.on("create_game", (data, callback) => {
        if (games.has(data.code)) { callback(false); }
        else {
            const metadata = {
                ids: new Map(),
                scores: new Map(), 
                ready: new Map(), 
                isStarted: false,
                currentRound: 1,
                currentPick: "",
                roundVotes: 0,
    
                maxRounds: data.rounds,
                maxPlayers: data.players,
                winningScore: data.score,
            }

            console.log(`[${(new Date()).toLocaleString()}][INFO] ${data.name} created new game "${data.code}" as [maxRounds=${data.rounds}, maxPlayers=${data.players}, winningScore=${data.score}]`);
            games.set(data.code, metadata);

            callback(true);
        }
        

        
    });

    // Join a created game
    socket.on("join_game", (data, callback) => {
        if (games.has(data.code) && ((!games.get(data.code).isStarted) && (games.get(data.code).ids.size < games.get(data.code).maxPlayers))) {
            socket.join(data.code);

            games.get(data.code).ids.set(data.name, socket.id);
            games.get(data.code).scores.set(data.name, 0); 
            games.get(data.code).ready.set(data.name, false); 

            console.log(`[${(new Date()).toLocaleString()}][GAME][${data.code}] ${data.name} joined the game`);

            const gdata = { scores: Array.from(games.get(data.code).scores), round: games.get(data.code).currentRound }
            io.to(data.code).emit("update_info", gdata);

            callback({joined: true, reason: ""});
        } else { 
            if (games.has(data.code)) { 
                if (games.get(data.code).isStarted) { callback({joined: false, reason: "Game has started"}); } 
                callback({joined: false, reason: "Too many players"});
            } else { 
                callback({joined: false, reason: "Invalid game code"});
            }
             
        }
    });

    // Get current players in a game 
    socket.on("get_players", (gameCode) => { 
        const gdata = { scores: Array.from(games.get(gameCode).scores), round: games.get(gameCode).currentRound }
        socket.to(gameCode).emit("update_info", gdata);
    }); 

    // Player is ready
    socket.on("is_ready", (data) => {
        games.get(data.code).ready.set(data.name, true);

        var readyCount = Array.from(games.get(data.code).ready.values()).reduce((count, v) => {
            return count + (v ? 1 : 0);
        }, 0);
        
        console.log(`[${(new Date()).toLocaleString()}][GAME][${data.code}] ${data.name} has readied up (${readyCount}/${(games.get(data.code).ids.size)})`);

        if (readyCount == games.get(data.code).ids.size) {
            
            games.get(data.code).isStarted = true;
            io.to(data.code).emit("start_game");

            var list = games.get(data.code).ids;
            var randomName = Array.from(list.keys())[Math.floor(Math.random() * list.size)];


            io.to(games.get(data.code).ids.get(randomName)).emit("picked");
            games.get(data.code).currentPick = randomName;

            console.log(`[${(new Date()).toLocaleString()}][GAME][${data.code}] All players ready, starting game`);
        }
    });

    socket.on("give_track", (data) => {
        io.to(data.code).emit("play_round", data.track);
    });

    socket.on("submit_vote", (data) => {
        games.get(data.code).roundVotes = games.get(data.code).roundVotes+1; 
        if (data.vote == games.get(data.code).currentPick) {
            // guessed right
            games.get(data.code).scores.set(data.name, (games.get(data.code).scores.get(data.name)+1));
        }

        if (games.get(data.code).roundVotes == games.get(data.code).ids.size) {
            // all have voted

            for (let [key, value] of games.get(data.code).scores) {
                if (value === games.get(data.code).winningScore) {
                    // reached end game (winning score)
                    console.log(`[${(new Date()).toLocaleString()}][GAME][${data.code}] ${key} has won the game with a winning score`);
                    io.to(data.code).emit("end_game", Array.from(games.get(data.code).scores));
                    return;
                }
            }

            if ((games.get(data.code).currentRound == games.get(data.code).maxRounds)) {
                // reached end game (max rounds)
                console.log(`[${(new Date()).toLocaleString()}][GAME][${data.code}] Game has ended hitting maximum rounds`);
                io.to(data.code).emit("end_game", Array.from(games.get(data.code).scores));
                return;
            }

            var list = games.get(data.code).ids;
            var randomName = Array.from(list.keys())[Math.floor(Math.random() * list.size)];

            io.to(games.get(data.code).ids.get(randomName)).emit("picked");
            io.to(data.code).emit("new_round");
            games.get(data.code).currentPick = randomName;
            games.get(data.code).currentRound = games.get(data.code).currentRound+1; 
            games.get(data.code).roundVotes = 0;
        }

    });

    // Player leaves game
    socket.on("leave", (data) => {
        if (games.get(data.code).scores.has(data.name)) {
            games.get(data.code).ids.delete(data.name);
            games.get(data.code).scores.delete(data.name);
            console.log(`[${(new Date()).toLocaleString()}][GAME][${data.code}] ${data.name} left the game`);

            const gdata = { scores: Array.from(games.get(data.code).scores), round: games.get(data.code).currentRound }
            socket.to(data.code).emit("update_players", gdata);

            // if game has no players in it (DELETE GAME)
            if (games.get(data.code).ids.size <= 0) { 
                games.delete(data.code);
                console.log(`[${(new Date()).toLocaleString()}][INFO] Game instance "${data.code}" deleted (No players)`);
            }
        }

        
    });

    // User disconnects
    socket.on("disconnect", () => {   
        console.log(`[${(new Date()).toLocaleString()}][INFO] Disconnection with socket ID ${socket.id}`);

        [...games.keys()].map(code => [...games.get(code).ids.keys()].map(player => {
            if (games.get(code).ids.get(player) == socket.id) { 
                games.get(code).ids.delete(player);
                games.get(code).scores.delete(player);

            }
            
            // if game has no players in it (DELETE GAME)
            if (games.get(code).ids.size <= 0) {
                games.delete(code);
                console.log(`[${(new Date()).toLocaleString()}][INFO] Game instance "${code}" deleted (No players)`);
            }
        
        }));
    });
});

server.listen(3001, () => {
    
    console.log(" ");

    console.log("     _____                 _ ___    ");
    console.log("    / ___/_ _____ ___ ___ (_) _/_ __");
    console.log("   / (_ / // / -_|_-<(_-</ / _/ // /");
    console.log("   \\___/\\_,_/\\__/___/___/_/_/ \\_, / ");
    console.log("                             /___/  ");
   
    console.log(" ");
    console.log("[ Authors: James Guiden, Alec Montesano, Owen Conlon ]");
    // console.log(" ");
    console.log(`[${(new Date()).toLocaleString()}][INFO] Server starting up...`);

    // Hardcoded testing game instance data
    const testdata = {
        ids: new Map(), // name, socket id
        scores: new Map(), // name, score
        ready: new Map(), // name, boolean
        currentPick: "", // player name
        isStarted: false,
        currentRound: 1,
        roundVotes: 0,
        
        maxRounds: 5,
        maxPlayers: 2,
        winningScore: 3,
        
    };

    // Setting testing game instance
    games.set("test", testdata);
 
    console.log(`[${(new Date()).toLocaleString()}][INFO] Server online`);
});