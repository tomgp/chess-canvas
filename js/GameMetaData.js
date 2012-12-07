//Game meta data
(function(window){
	function GameMetaData(pgn_string){
		this.initialise(pgn_string);
	}
	var p = GameMetaData.prototype;
	p.data;

	p.initialise = function(pgn){
		this.data = {};
		var lines = pgn.split(/\n/); 		//go through the lines of the PGN string
		for (var i = 0; i<lines.length ; i++){
			//grab everything that is enclosed by [] on each line
			var meta_regex = /\[(\w+) "(.+)"\]/g;
			var matches = meta_regex.exec(lines[i]);
			if(matches){
				this.data[matches[1]] = matches[2];
			}
		}
	}

	p.addNalimovPoint = function(move_num, fen){
		this.data.nalimovPoint = move_num;
		this.data.nalimovFEN = fen;
	}

	p.getData = function(){
		return this.data;
	}
	window.GameMetaData = GameMetaData;

}(window))