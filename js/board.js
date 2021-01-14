function pieceIndex(pce, pceNum) {
    return (pce * 10 + pceNum);
}

let gameBoard = {};

gameBoard.pieces = new Array(BRD_SQ_NUM);
gameBoard.side = COLOURS.WHITE;
gameBoard.fiftyMove = 0;
gameBoard.hisPly = 0;
gameBoard.ply = 0;
gameBoard.enPas = 0;

/*Castling

0001 - WKCA
0010 - WQCA
0100 - BKCA
1000 - BQCA

1101 = 13 which means BQCA BKCA and WKCA

if(1101 && WKCA) !=0 {
    white can castle king side
}

*/

gameBoard.castlePerm = 0;
gameBoard.material = new Array(2); // WHITE/BLACK material of pieces
gameBoard.pceNum = new Array(13); //indexed by PIECES; keep how many of a type we have
gameBoard.pList = new Array(14 * 10);
gameBoard.posKey = 0;

gameBoard.moveList = new Array(maxDepth * maxPositionMoves);
gameBoard.moveScores = new Array(maxDepth * maxPositionMoves);
gameBoard.moveListStart = new Array(maxDepth);


/** 
 *  loop (pieces[])
 * if(pieces on sq == side to move)
 * then genmoves() for piece on sq
 * 
 * sqOfPiece = pListArr[index];
 * 
 * index?
 * 
 * wP*10+wPnum -> 0 based index of num of pieces(gameBoard.pceNum)
 * wN*10 + wNnum
 * 
 * say we have 4 white pawns gameBoard.pceNum[wP] = 4 
 * 
 * for(pceNum=0;pceNum<gameBoard.pceNum[wP];++pceNum){
 * sq = pListArr[wP*10 + pieceNum]
 * }
 * 
 * sq1 = pListArr[wP*10+0];
 * sq2 = pListArr[wP*10+1];
 * sq3 = pListArr[wP*10+2];
 * sq4 = pListArr[wP*10+3];
 * 
 * wP 10 -> 19
 * wK 20 -> 29
 */

function printBoard() {
    var sq, file, rank, piece;
    console.log("\nGame Board:\n");

    for (rank = RANKS.RANK_8; rank >= RANKS.RANK_1; rank--) {
        var line = (rankChar[rank] + " ");
        for (file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
            sq = FR2SQ(file, rank);
            piece = gameBoard.pieces[sq];
            line += (" " + pceChar[piece] + " ");
        }
        console.log(line);
    }

    console.log("");
    var line = "  ";
    for (file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
        line += (" " + fileChar[file] + " ");
    }

    console.log(line);
    console.log("side:" + sideChar[gameBoard.side]);
    console.log("enPas:" + gameBoard.enPas);
    line = "";

    if (gameBoard.castlePerm & CASTLEBIT.WKCA) line += "K";
    if (gameBoard.castlePerm & CASTLEBIT.WQCA) line += "Q";
    if (gameBoard.castlePerm & CASTLEBIT.BKCA) line += "k";
    if (gameBoard.castlePerm & CASTLEBIT.BQCA) line += "q";
    console.log("castle:" + line);
    console.log("key:" + gameBoard.posKey.toString(16));

    /**
     * a8 -> h8
     * a7 -> h7
     * ........
     * a1 -> h1
     */
}

/**
 * unique?
 * piece on sq
 * side
 * castle
 * enPas
 * 
 * posKey ^= ranNum for all pcs on sq
 * posKey^=ranNum side .. so on
 */

/*Example 

let piece1 = rand_32();
let piece2 = rand_32();
let piece3 = rand_32();
let piece4 = rand_32();

let key = 0;
key ^= piece1;
key ^= piece2;
key ^= piece3;
key ^= piece4;

console.log("key:" + key.toString(16));
key ^= piece1;
console.log("piece1 out key:" + key.toString(16));
key = 0;
key ^= piece2;
key ^= piece3;
key ^= piece4;
console.log("build no piece1:" + key.toString(16));

*/

function generatePosKey() {

    var sq = 0;
    var finalKey = 0;
    var piece = PIECES.EMPTY;

    for (sq = 0; sq < BRD_SQ_NUM; ++sq) {
        piece = gameBoard.pieces[sq];
        if (piece != PIECES.EMPTY && piece != SQUARES.OFFBOARD) {
            finalKey ^= pieceKeys[(piece * 120) + sq];
        }
    }

    if (gameBoard.side == COLOURS.WHITE) {
        finalKey ^= sideKey;
    }

    if (gameBoard.enPas != SQUARES.NO_SQ) {
        finalKey ^= pieceKeys[gameBoard.enPas];
    }

    finalKey ^= castleKeys[gameBoard.castlePerm];

    return finalKey;
}



function resetBoard() {
    var index = 0;

    for (index = 0; index < BRD_SQ_NUM; ++index) {
        gameBoard.pieces[index] = SQUARES.OFFBOARD;
    }

    for (index = 0; index < 64; ++index) {
        gameBoard.pieces[SQ120(index)] = PIECES.EMPTY;
    }

    for (index = 0; index < 14 * 120; ++index) {
        gameBoard.pList[index] = PIECES.EMPTY;
    }

    for (index = 0; index < 2; ++index) {
        gameBoard.material[index] = 0;
    }

    for (index - 0; index < 13; ++index) {
        gameBoard.pceNum[index] = 0;
    }

    gameBoard.side = COLOURS.BOTH;
    gameBoard.enPas = SQUARES.NO_SQ;
    gameBoard.fiftyMove = 0;
    gameBoard.ply = 0;
    gameBoard.hisPly = 0;
    gameBoard.castlePerm = 0;
    gameBoard.posKey = 0;
    gameBoard.moveListStart[gameBoard.ply] = 0;
}

//rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1

function parseFen(fen) {

    resetBoard();

    let rank = RANKS.RANK_8;
    let file = FILES.FILE_A;
    let piece = 0;
    let count = 0;
    let i = 0;
    let sq120 = 0;
    let fenCnt = 0; // fen[fenCnt] the current piece; fen the curren file/rank

    while ((rank >= RANKS.RANK_1) && fenCnt < fen.length) {
        count = 1;
        switch (fen[fenCnt]) {
            case 'p':
                piece = PIECES.bP;
                break;
            case 'n':
                piece = PIECES.bN;
                break;
            case 'b':
                piece = PIECES.bB;
                break;
            case 'r':
                piece = PIECES.bR;
                break;
            case 'q':
                piece = PIECES.bQ;
                break;
            case 'k':
                piece = PIECES.bK;
                break;
            case 'P':
                piece = PIECES.wP;
                break;
            case 'N':
                piece = PIECES.wN;
                break;
            case 'B':
                piece = PIECES.wB;
                break;
            case 'R':
                piece = PIECES.wR;
                break;
            case 'Q':
                piece = PIECES.wQ;
                break;
            case 'K':
                piece = PIECES.wK;
                break;

            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
                piece = PIECES.EMPTY;
                count = fen[fenCnt].charCodeAt() - '0'.charCodeAt();
                break;

            case '/':
            case ' ':
                rank--;
                file = FILES.FILE_A;
                fenCnt++;
                continue;
            default:
                console.log("FEN error!");
                return;
        }

        for (i = 0; i < count; i++) {
            sq120 = FR2SQ(file, rank);
            gameBoard.pieces[sq120] = piece;
            file++;
        }
        fenCnt++;
    } //while loop ends

    //rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1
    gameBoard.side = (fen[fenCnt] === "w") ? COLOURS.WHITE : COLOURS.BLACK;
    fenCnt += 2;
    for (i = 0; i < 4; i++) {
        if (fen[fenCnt] === " ") {
            break;
        }
        switch (fen[fenCnt]) {
            case 'K':
                gameBoard.castlePerm |= CASTLEBIT.WKCA;
                break;
            case 'Q':
                gameBoard.castlePerm |= CASTLEBIT.WQCA;
                break;
            case 'k':
                gameBoard.castlePerm |= CASTLEBIT.BKCA;
                break;
            case 'q':
                gameBoard.castlePerm |= CASTLEBIT.BQCA;
                break;
        }
        fenCnt++;
    }
    fenCnt++;
    if (fen[fenCnt] === "-") {
        file = fen[fenCnt].charCodeAt() - 'a'.charCodeAt();
        rank = fen[fenCnt + 1].charCodeAt() - "1".charCodeAt();
        console.log('fen[fenCnt]:' + fen[fenCnt] + ' file:' + file + ' rank:' + rank);
        gameBoard.enPas = FR2SQ(file, rank);
    }
    gameBoard.posKey = generatePosKey();
}