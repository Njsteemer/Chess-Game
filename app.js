const express = require("express");
const socket = require("socket.io");
const http = require("http");
const { Chess } = require("chess.js");
const path = require("path");
const { title } = require("process");

const app = express();


//creating a server connected to express
const server = http.createServer(app);
// Connecting this server with Socket to use 
const io = socket(server);

const chess = new Chess();  //Creating chess object instance

let players = {};
let curretPlayer = "W";

app.set("view engine", "ejs"); //setting the view engine to EJS
app.use(express.static(path.join(__dirname, "public")));


app.get("/", (req, res) => {
    res.render("index", { title: "Chess Game" });
})

//to connect the socket form the backend to its frontend
io.on("connection", function (uniquesocket) {
    console.log("connected 100%");
    
    // Assigning the Role of the player
    if (!players.white) {
        players.white = uniquesocket.id;
        uniquesocket.emit("playerRole", "w");
    } else if (!players.black) {
        players.black = uniquesocket.id;
        uniquesocket.emit("playerRole", "b");
    } else {
        uniquesocket.emit("SpectatorRole");
    }

    // Checking for the Disconnection of the User/Player
    uniquesocket.on("disconnect", function () {
        if (uniquesocket.id === players.white) {
            delete players.white;
        } else if (uniquesocket.id === players.black) {
            delete players.black;
        }
    });

    // Checking the valid move on a valid turn of the player
    uniquesocket.on("move", (move) => {
        try {
            //if it's white's turn & the player is not white then don't move
            if (chess.turn() === "w" && uniquesocket.id !== players.white) return;
            //if it's black's turn & the player is not black then don't move
            if (chess.turn() === "b" && uniquesocket.id !== players.black) return;

            //updating the game state as per valid move
            const result = chess.move(move);

            if (result) {
                //chess player's turn
                currentPlayer = chess.turn();
                //sending to all about the update of game
                io.emit("move", move);
                // here FEN will give us the current state of the board
                io.emit("boardState", chess.fen());
            } else {
                //showing the wrong move
                console.log("Invalid move :", move);
                // player who made that move, only showing to him
                uniquesocket.emit("InvalidMove", move);
            }
        }
        catch (err) {
            console.log(err);
            uniquesocket.emit("Invalid Move", move);
        }
    });
});


//running the "server" not the "app"
server.listen(3000, function () {
    console.log("listening on port 3000");
});