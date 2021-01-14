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
}

function initHashKeys() {
    var index = 0;

    for (index = 0; index < 14 * 120; ++index) {
        pieceKeys[index] = rand_32();
    }

    sideKey = rand_32();

    for (index = 0; index < 16; ++index) {
        castleKeys[index] = rand_32();
    }
}

function initSq120To64() {
    var index = 0;
    var file = FILES.FILE_A;
    var rank = RANKS.RANK_1;
    var sq = SQUARES.A1;
    var sq64 = 0;

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

function init() {
    console.log("Init called");
    initFilesRanksBrd();
    initHashKeys();
    initSq120To64();
}