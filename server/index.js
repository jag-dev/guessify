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
    scores: new Map(),
    rounds: 5,
};

games.set("test", metadata);

io.on("connection", (socket) => {
    console.log(`Connected: ${socket.id}`);

    // Join a created game
    socket.on("join_game", (joinCode) => {
        socket.join(joinCode);
        
        games.get(joinCode).scores.set(socket.id, 0);
        socket.to(joinCode).emit("update_players", Array.from(games.get(joinCode).scores.keys()));
    });

    // Get current players in a game
    socket.on("get_players", (gameCode) => {
        socket.to(gameCode).emit("update_players", Array.from(games.get(gameCode).scores.keys()));
    })

    // User disconnects
    socket.on("disconnect", () => {    
        [...games.keys()].map(code => [...games.get(code).scores.keys()].map(player => (games.get(code).scores.delete(socket.id))));
        console.log(`Disconnected: ${socket.id}`);
    });
});

server.listen(3001, () => {
    console.log("[Guessify] Server starting up...");
});