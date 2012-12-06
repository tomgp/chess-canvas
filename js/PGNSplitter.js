//decompressed game
(function(window) {
	function PGNSplitter(pgn_file, id) {
		this.initialize(pgn_file, id);
	}

	var p = PGNSplitter.prototype;
	p.games = {};
		// constructor:
	p.initialize = function(pgn_file, id) {
		if(pgn_file){
			if(!id){
				id = 'anon';
			}
			this.loadPGN(pgn_file, id);
		}
	}

	p.loadPGN = function(file_name, identifier){
		var client = new XMLHttpRequest();
		client.open('GET', file_name);
		var that = this;
		client.onreadystatechange = function(){
			if(client.readyState == 4){
				that.games[identifier] = p.createGameObject(client.responseText.replace(/\[Event/g, "!NEW GAME![Event").split('!NEW GAME!'));
		  	}
		}
		client.send();
	}

	p.createGameObject = function(pgn){
		return{
/*			
			nalimov_point: // when 6 or fewer pieces are on the board nalimov tables will tell us who should win under perfect play, what turn is this reached on 0 = never
			event:
			site:
			date:
			white_player:{
				name:
				ELO:
			}
			black_player:{
				name:
				ELO:
			}
			ECO: */
			PGN:pgn
		}
	} 

	window.PGNSplitter = PGNSplitter;
}(window));