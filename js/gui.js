$("#setFen").click(function() {
    var fenStr = $("#fenIn").val();
    parseFen(fenStr);
    printBoard();

});