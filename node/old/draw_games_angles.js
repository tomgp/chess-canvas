var util = require('util');
var fs = require('fs');
var ch = require('/Users/tompearson/Sites/vendor/chess.js');

// configuration
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
var deg_2_rad = Math.PI/180;
var limit = Math.min(game_list.length, 5000);
for (var i = 0 ; i < limit ; i++){//for each game in the PGN list
	if(game_list[i] != ""){
		util.puts("_______ " + i + " _______ ");
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
			var angle = scale * p * 0.0174532925; //work out an angle based on that convert to radians.
			//if this starts at the last point i.e. line[j] (we're one out already from having pushed the origin on before the loop began)
			//calculate where the vector will intersect a circle of radius i, center 0,0 (multiplying unit vector by 10 to ensure intersection)
			var coords = circle_line_intersection(0, 0, j+1, line[j].x, line[j].y, 10*Math.cos(angle), 10*Math.sin(angle));
			line.push ({x:coords.x, y:coords.y});
		}
		game_lines.push(line);
	}
}

//save the game lines data to a file

var out_file = fs.openSync('../generated_data/game_lines_anand_angles.json', 'w');
	fs.writeSync(out_file, "var anand_lines = " + JSON.stringify(game_lines));
	fs.closeSync(out_file);

//http://stackoverflow.com/questions/1549909/intersection-on-circle-of-vector-originating-inside-circle
function circle_line_intersection(circleX, circleY, r, rayX, rayY, rayVX, rayVY){
	var xDiff = rayX - circleX;
	var yDiff = rayY - circleY;
	var a = rayVX * rayVX + rayVY * rayVY;
	var b = 2 * (rayVX * (rayX - circleX) + rayVY * (rayY - circleY));
	var c = xDiff * xDiff + yDiff * yDiff - r * r;
	var disc = b * b - 4 * a * c;
	if (disc >= 0) {
	    var t = (-b + Math.sqrt(disc)) / (2 * a);
	    var x_coord = rayX + rayVX * t;
	    var y_coord = rayY + rayVY * t;
	    // Do something with point.
	}
	return {x:x_coord, y:y_coord};
}

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
