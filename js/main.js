$(function() {
    init();
    console.log("Main Init Called");
    parseFen(startFen);
    printBoard();

});

function initFilesRanksBrd() {
    let index = 0;
    let file = FILES.FILE_A;
    let rank = RANKS.RANK_1;
    let sq = SQUARES.A1;

    for (index = 0; index < BRD_SQ_NUM; ++index) {
        filesBrd[index] = SQUARES.OFFBOARD;
        ranksBrd[index] = SQUARES.OFFBOARD;
    }

    for (rank = RANKS.RANK_1; rank <= RANKS.RANK_8; ++rank) {
        for (file = FILES.FILE_A; file <= FILES.FILE_H; ++file) {
            sq = FR2SQ(file, rank);
            filesBrd[sq] = file;
            ranksBrd[sq] = rank;

        }
    }

    console.log("FilesBrd[0]:" + filesBrd[0] + " RanksBrd[0]" + ranksBrd[0]);
    console.log("FilesBrd[SQUARES.A1]:" + filesBrd[SQUARES.A1] + " Ranks[SQUARES.A1]:" + ranksBrd[SQUARES.A1]);
    console.log("FilesBrd[SQUARES.E8]:" + filesBrd[SQUARES.E8] + " Ranks[SQUARES.E8]:" + ranksBrd[SQUARES.E8]);

}

function initHashKeys() {
    let index = 0;

    for (index = 0; index < 14 * 120; ++index) {
        pieceKeys[index] = rand_32();
    }

    sideKey = rand_32();

    for (index = 0; index < 16; ++index) {
        castleKeys[index] = rand_32();
    }
}

function initSq120To64() {
    let index = 0;
    let file = FILES.FILE_A;
    let rank = RANKS.RANK_1;
    let sq = SQUARES.A1;
    let sq64 = 0;

    for (index = 0; index < BRD_SQ_NUM; ++index) {
        sq120ToSq64[index] = 65;
    }
    for (index = 0; index < 64; ++index) {
        sq64ToSq120[index] = 120;
    }

    for (rank = RANKS.RANK_1; rank <= RANKS.RANK_8; ++rank) {
        for (file = FILES.FILE_A; file <= FILES.FILE_H; ++file) {
            sq = FR2SQ(file, rank);
            sq64ToSq120[sq64] = sq;
            sq120ToSq64[sq] = sq64;
            sq64++;
        }
    }
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

/*Example */

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

function init() {
    console.log("Init called");
    initFilesRanksBrd();
    initHashKeys();
}