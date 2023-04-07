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

function getByValue(map, searchValue) {
    for (let [key, value] of map.entries()) {
      if (value === searchValue)
        return key;
    }
  }

const games = new Map();
const metadata = {
    ids: new Map(), // name, id
    scores: new Map(), // name, score
    rounds: 5,
};

games.set("test", metadata);

io.on("connection", (socket) => {
    console.log(`Connected: ${socket.id}`);

    // Join a created game
    socket.on("join_game", (data) => {
        socket.join(data.code);

        if (games.get(data.code).scores.has(data.name)) {
            // rejoining
            games.get(data.code).ids.set(data.name, socket.id);
        } else {
            // first join
            games.get(data.code).ids.set(data.name, socket.id);
            games.get(data.code).scores.set(data.name, 0); 
        }
         
        

        console.log(`Joined Game: ${data.name} with id ${socket.id} score of ${games.get(data.code).scores.get(data.name)}`)

        socket.to(data.code).emit("update_players", Array.from(games.get(data.code).scores.keys()));
    });

    // Get current players in a game 
    socket.on("get_players", (gameCode) => { 
        socket.to(gameCode).emit("update_players", Array.from(games.get(gameCode).scores.keys()));
    }) 

    // Player leaves game
    socket.on("leave", (data) => {
        if (games.get(data.code).scores.has(data.name)) {
            games.get(data.code).ids.delete(data.name);
            games.get(data.code).scores.delete(data.name);
            console.log(`Left: ${data.name}`);

            socket.to(data.code).emit("update_players", Array.from(games.get(data.code).scores.keys()));
        }
        
    });

    // User disconnects
    socket.on("disconnect", () => {    
        [...games.keys()].map(code => [...games.get(code).ids.keys()].map(player => {
            // removes player from ids map
            // keeps them in score
            games.get(code).ids.delete(player);

            // if game has no players in it
            if (games.get(code).ids.size <= 0) {

                games.get(code).scores.clear();
                games.get(code).ids.clear();
            }
        
        }));
        console.log(`Disconnected: ${socket.id}`);
    });
});

server.listen(3001, () => {
    console.log("[Guessify] Server starting up...");
});