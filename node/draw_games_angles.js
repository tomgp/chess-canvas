var util = require('util');
var fs = require('fs');
var ch = require('/Users/tompearson/Sites/vendor/chess.js');

// configuration
//max angle
init();
var max_angle = 45; // how wide do we want the cone to be? 45 implies a total cone angle of 90 as the lines will curve right or left randomly
var max_turn = 40;
//load the symetrical FEN probability lookup
var lookup_file = '../generated_data/fen_probability_lookup_working.json';
var lookup_string = fs.readFileSync(lookup_file,'utf8'); 
var frequencies = JSON.parse(lookup_string);

//load the game PGNs we wish to render and split into individual games
var pgn_file = '../pgn/Anand.pgn';
var games_string = fs.readFileSync(pgn_file,'utf8'); 
var game_list = games_string.replace(/\[Event/g, "!NEW GAME![Event").split('!NEW GAME!');

//make the master game line array
var game_lines = [];

var scale = max_angle / frequencies.range.max - frequencies.range.min;
var deg_2_rad = 180/Math.PI;
for (var i = 0 ; i < game_list.length ; i++){//for each game in the PGN list
	if(game_list[i] != ""){
		var meta = new GameMetaData(game_list[i]);
		var game = new ch.Chess();				//create it as a Chess object
		game.load_pgn(game_list[i]);		//load the game data
		var moves = game.history();			//save the history
		game.reset();						//reset the board
		var line = [];						//make a new line array
		line.push({x:0,y:0});				//push the origin coordinate to the line array
		var l = Math.min(moves.length, max_turn);	//for each move in the game history
		for(var j = 0; j<l; j++ ){
			game.move(moves[j]);			//enact the move on the chess object
			var sym_fen = symetrical_fen(game.fen());//get the fen and 'symetricalise' it
			var p = frequencies.lookup[sym_fen]; //look up the fen probability
			var angle = Math.abs(scale * p - max_angle) * deg_2_rad; //work out an angle based on that convert to radians.
			line.push ({				//work out a unit vector based on that angle
				x:Math.cos(angle);
				y:Math.sin(angle);
			})
		}
		game_lines.push(line);
	}
}

//save the game lines data to a file

function symetrical_fen(fen_string){
	//get the string before the first space, lowercase, return
	return fen_string.split(" ")[0].toLowerCase();
}


//////////////////
//HELPER FUNCTIONS
function GameMetaData(pgn_string){
	this.initialise(pgn_string);
}

function init(){
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
}
