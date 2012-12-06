//decompressed game
(function(window) {
	function PGNSplitter(pgn_file, id) {
		this.initialize(pgn_file, id);
	}
	var p = ChessGame.prototype;

		// constructor:
	p.initialize = function(pgn_file, id) {
		if(pgn_file){
			loadPGN(pgn_file, id);
		}
	}

	p.loadPGN = function(file_name, identifier){
		var client = new XMLHttpRequest();
		client.open('GET', '/file_name');
		client.onreadystatechange = function() {
		  console.log(client.responseText);
		}
		client.send();
	}

	if(!window.chessvis){
		window.chessvis = {};
	}
	window.PGNSplitter = PGNSplitter;
}(window));