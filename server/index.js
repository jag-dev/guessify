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
    rounds: 5,
    isStarted: false,
};

games.set("test", metadata);

function getByValue(map, searchValue) {
    for (let [key, value] of map.entries()) {
      if (value === searchValue)
        return key;
    }
  }

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

            } else { games.get(data.code).ids.set(data.name, socket.id); }
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

        io.to(data.code).emit("update_players", Array.from(games.get(data.code).scores.keys()));
    });

    // Get current players in a game 
    socket.on("get_players", (gameCode) => { 
        socket.to(gameCode).emit("update_players", Array.from(games.get(gameCode).scores.keys()));
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
            console.log(`Started ${games.get(data.code).isStarted}`)
        }
    });

    // Player leaves game
    socket.on("leave", (data) => {
        if (games.get(data.code).scores.has(data.name)) {
            games.get(data.code).ids.delete(data.name);
            games.get(data.code).scores.delete(data.name);
            console.log(`Left: ${data.name}`);

            socket.to(data.code).emit("update_players", Array.from(games.get(data.code).scores.keys()));

            // if game has no players in it
            if (games.get(data.code).ids.size <= 0) {
                games.get(data.code).scores.clear();
                games.get(data.code).ids.clear();
                games.get(data.code).ready.clear();
            }
        }

        
    });

    // User disconnects
    socket.on("disconnect", () => {    
        [...games.keys()].map(code => [...games.get(code).ids.keys()].map(player => {
            // removes player from ids map
            // keeps them in score
            if (games.get(code).ids.get(player) == socket.id) games.get(code).ids.delete(player);
            
            // if game has no players in it
            if (games.get(code).ids.size <= 0) {
                games.get(code).scores.clear();
                games.get(code).ids.clear();
                games.get(code).ready.clear();
            }
        
        }));
        console.log(`Disconnected: ${socket.id}`);
    });
});

server.listen(3001, () => {
    console.log("[Guessify] Server starting up...");
});