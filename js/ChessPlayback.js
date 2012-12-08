//playback
(function (window){
	function ChessPlayback(chess_object){
		this.initialize(chess_object);
	}

	var p = ChessPlayback.prototype;
	p.game = {};
	p.move = 0;
	p.history = [];
	p.nalimovPoint = 0;
	p.nalimovFEN = "";
	p.last_move = false;

	p.initialize = function(chess_object) {
		this.game = chess_object;
		this.history = this.game.history();
		this.game.reset();
		//run the game through for analysis
		for(var i = 0; i < this.history.length; i++){
			this.getNextBoardState();
			var pieces = this.numberOfPieces();
			if(pieces <= 6){
				this.nalimovPoint = this.move;
				this.nalimovFEN = this.game.fen();
			}
		}
	}

	p.getCurrentGame = function(){
		return this.game;
	}

	p.getNextBoardState = function(){
		//apply the next move
		this.game.move(this.history[this.move]);
		this.move ++;
		if(this.move == this.history.length){
			this.last_move = true;
		}
		return this.game.ascii();
	}

	p.getPreviousBoardState = function(){
		this.move --;
		this.game.undo();
		this.last_move = false;
		return this.game.ascii();
	}

	p.printBoardState = function(){
		console.log(this.game.ascii());
	}

	p.getNumberOfMoves = function(){ //technically, the number of half-moves
		return this.history.length();
	}

	p.numberOfPieces = function(){
		var fragments = this.game.fen().split(" ")[0].split('');
		var letter = /[rnbqkpRNBQKP]/;
		var num_pieces = 0;
		for(var i = 0; i<fragments.length; i++){
			if(letter.test(fragments[i])){
				num_pieces ++;
			}
		}
		return num_pieces;
	}

	window.ChessPlayback = ChessPlayback;

}(window))