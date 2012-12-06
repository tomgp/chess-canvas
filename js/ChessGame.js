//decompressed game
(function(window) {
	function pgnSplitter(pgn_file) {
		this.initialize(pgn);
	}
	var p = ChessGame.prototype;

		// constructor:
	p.initialize = function(pgn) {
		console.log(pgn);
		p.metadata = buildMetaData(pgn);
		p.turns = buildBoardStates(pgn);
	}

	function buildMetaData(pgn){
		return {};
	}

	function buildBoardStates(pgn){
		var boards = [];
		//build board 0, the default state
		//split moves
		//for each move, 
		//	duplicate the previous board state, 
		//	apply the change
		//	stash the board in the boards array
		return boards;
	}
	if(!window.chessvis){
		window.chessvis = {};
	}
	window.chessvis.ChessGame = ChessGame;
}(window));