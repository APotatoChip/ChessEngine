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

gameBoard.posKey = 0;

function generatePosKey() {

    let sq = 0;
    let finalKey = 0;
    let piece = PIECES.EMPTY;

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