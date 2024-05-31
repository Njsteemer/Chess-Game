//From the same domain (initialisation)
const socket = io();
const chess = new Chess();

const boardElement = document.querySelector(".chessboard");

//decalre variables
let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

//declaring Functions
const renderBoard = () => {
    const board = chess.board();

    //this make sure that the board is empty from the beginning of the game
    boardElement.innerHTML = "";

    // Looping on board (2D array)
    board.forEach((row, rowIndex) => {
        row.forEach((square, squareIndex) => {
            const squareElement = document.createElement("div");

            // Seperating divs based on color
            squareElement.classList.add(
                "square",
                (rowIndex + squareIndex) % 2 === 0 ? "light" : "dark"
            );

            //initiating squares with its data value for smooth access
            squareElement.dataset.row = rowIndex;
            squareElement.dataset.col = squareIndex;

            if (square) {
                const pieceElement = document.createElement("div");
                // All the square that contains any chess piece  
                pieceElement.classList.add(
                    "piece",
                    square.color === "w" ? "white" : "black"
                );

                // Things about the pieceElement / 
                pieceElement.innerText = getPieceUnicode(square);  //using unicode
                pieceElement.draggable = playerRole === square.color;

                // setting things for drag-element
                pieceElement.addEventListener("dragstart", (e) => {
                    if (pieceElement.draggable) {
                        draggedPiece = pieceElement;
                        sourceSquare = { row: rowIndex, col: squareIndex };

                        // a necessity condition for smooth working while handling "event (e)"
                        e.dataTransfer.setData("text/plain", "");
                    }
                });

                pieceElement.addEventListener("dragend", (e) => {
                    draggedPiece = null;
                    sourceSquare = null;
                });

                squareElement.appendChild(pieceElement);

            };


            // stop unusual square, to be dragover
            squareElement.addEventListener("dragover", function (e) {
                e.preventDefault();
            });

            squareElement.addEventListener("drop", function (e) {
                // preventing to behave the nature of elemnent
                e.preventDefault();
                if (draggedPiece) {
                    const targetSource = {
                        col: parseInt(squareElement.dataset.col), //this will return values in the form of string, so parse it 
                        row: parseInt(squareElement.dataset.row), //this will return values in the form of string, so parse it 
                    };

                    handleMove(sourceSquare, targetSource);
                }
            });

            boardElement.appendChild(squareElement);
        });
    });

    //Flipping the borad, for playerRole as Black
    if (playerRole === "b") {
        boardElement.classList.add("flipped");
    } else {
        boardElement.classList.remove("flipped");
    }
};

const handleMove = (source, target) => {
    const move = {
        from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
        promotion: "q",
    }

    socket.emit("move", move);
};

const getPieceUnicode = (piece) => {
    const unicodePieces = {
        p: "♙",
        r: "♖",
        n: "♘",
        b: "♗",
        q: "♕",
        k: "♔",
        P: "♙",
        R: "♖",
        N: "♘",
        B: "♗",
        Q: "♕",
        K: "♔",
    };

    return unicodePieces[piece.type] || "";
};


// sending responce to frontend via socket
socket.on("playerRole", function (role) {
    playerRole = role;
    renderBoard();
});

socket.on("spectatorRole", function () {
    playerRole = null;
    renderBoard();
});

socket.on("boardState", function (fen) {
    chess.load(fen);
    renderBoard();
});

socket.on("move", function (fen) {
    chess.load(move);
    renderBoard();
});

renderBoard();