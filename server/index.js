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

const games = new Map();
const metadata = {
    ids: new Map(), // name, id
    scores: new Map(), // name, score
    ready: new Map(), // name, boolean
    isStarted: false,
    currentRound: 1,
    currentPick: "", // player name
    roundVotes: 0,
    
    maxRounds: 5,
    maxPlayers: 2,
    winningScore: 3,
    
};

games.set("test", metadata);

io.on("connection", (socket) => {
    console.log(`Connected: ${socket.id}`);

    // Join a created game
    socket.on("join_game", (data) => {
        socket.join(data.code);

        if (games.get(data.code).scores.has(data.name)) {
            // rejoining
            if (games.get(data.code).isStarted) { 
                io.to(socket.id).emit("failed_join");

                games.get(data.code).ids.delete(data.name);
                games.get(data.code).scores.delete(data.name);
                games.get(data.code).ready.delete(data.name);

            } else { 
                games.get(data.code).ids.set(data.name, socket.id);
                games.get(data.code).scores.set(data.name, 0);
             }
        } else {
            // first join
            if (games.get(data.code).isStarted) { 
                io.to(socket.id).emit("failed_join");
            } else {
                games.get(data.code).ids.set(data.name, socket.id);
                games.get(data.code).scores.set(data.name, 0); 
                games.get(data.code).ready.set(data.name, false); 
            }

            
        }

        console.log(`Joined Game: ${data.name} with id ${socket.id} score of ${games.get(data.code).scores.get(data.name)}`)

        const gdata = { scores: Array.from(games.get(data.code).scores), round: games.get(data.code).currentRound }
        io.to(data.code).emit("update_info", gdata);
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
        
        console.log(`Ready: ${data.name} r${readyCount} - s${games.get(data.code).ids.size}`);

        if (readyCount == games.get(data.code).ids.size) {
            
            games.get(data.code).isStarted = true;
            io.to(data.code).emit("start_game");

            // play it, allow them to vote

            // start of game []
            // pick player
            // asks for song
            // song comes back
            // use song to send out round to all players
            // collect votes (like readys)
            // when final vote cast handle win, pick new player

            var list = games.get(data.code).ids;
            var randomName = Array.from(list.keys())[Math.floor(Math.random() * list.size)];


            io.to(games.get(data.code).ids.get(randomName)).emit("picked");
            games.get(data.code).currentPick = randomName;

            console.log(`Started ${games.get(data.code).isStarted}`);
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
                    io.to(data.code).emit("end_game", Array.from(games.get(data.code).scores));
                    return;
                }
            }

            if ((games.get(data.code).currentRound == games.get(data.code).maxRounds)) {
                // reached end game (max rounds)
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
            console.log(`Left: ${data.name}`);

            const gdata = { scores: Array.from(games.get(data.code).scores), round: games.get(data.code).currentRound }
            socket.to(data.code).emit("update_players", gdata);

            // if game has no players in it
            if (games.get(data.code).ids.size <= 0) {
                games.get(data.code).scores.clear();
                games.get(data.code).ids.clear();
                games.get(data.code).ready.clear();
                games.get(data.code).isStarted = false;
                games.get(data.code).currentRound = 1;
                games.get(data.code).currentPick = "";
                games.get(data.code).roundVotes = 0;
            }
        }

        
    });

    // User disconnects
    socket.on("disconnect", () => {    
        [...games.keys()].map(code => [...games.get(code).ids.keys()].map(player => {
            // removes player from ids map
            // keeps them in score
            if (games.get(code).ids.get(player) == socket.id) { 
                games.get(code).ids.delete(player);
                games.get(code).scores.delete(player);

            }
            
            // if game has no players in it
            if (games.get(code).ids.size <= 0) {
                games.get(data.code).scores.clear();
                games.get(data.code).ids.clear();
                games.get(data.code).ready.clear();
                games.get(data.code).isStarted = false;
                games.get(data.code).currentRound = 1;
                games.get(data.code).currentPick = "";
                games.get(data.code).roundVotes = 0;
            }
        
        }));
        console.log(`Disconnected: ${socket.id}`);
    });
});

server.listen(3001, () => {
    console.log("[Guessify] Server starting up...");
});