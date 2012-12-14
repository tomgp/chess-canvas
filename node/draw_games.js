var util = require('util');
var fs = require('fs');
var ch = require('/Users/tompearson/Sites/vendor/chess.js');
//create coordinate sets for the first 20 moves of each game based on the output from process_fens


init();
function playersInGame(meta_data, p){
	
	for (var i = 0; i<p.length; i++){
		if(stringInArray(p[i], [meta_data.White, meta_data.Black] )) {

		}else{
			return false;
		}
	}
	util.puts('YES')
	util.puts(meta_data.White + " vs " + meta_data.Black);
	return true;
}

function stringInArray(s, arr){ //is string s in any elemnt of array arr
	for(var i = 0; i<arr.length; i++){
		if(String(arr[i]).indexOf(s) > -1){
			return true;
		}
	}
	return false;
}


//load up the coordinate lookup
var coords_file = '../generated_data/anand_chart_positions_left.json';
var coords_string = fs.readFileSync(coords_file,'utf8'); 
var coords_data = JSON.parse(coords_string);

//load up the pgn data
var pgn_file = '../pgn/Anand.pgn';
var games_string = fs.readFileSync(pgn_file,'utf8'); 
var game_list = games_string.replace(/\[Event/g, "!NEW GAME![Event").split('!NEW GAME!');


var players = ["Anand","Kramnik"]
var filter_by_players = true;

//make the master "game line" array
var game_lines = [];

//for each game in the pgn data
for(var i = 0; i< game_list.length; i++){
	util.puts('processing game ' + i);
	//make a new "game line" i.e. coordinate array
	var line = [];
	if(game_list[i] != ""){
		var meta = new GameMetaData(game_list[i]);

		if(filter_by_players && playersInGame(meta.data, players)){
			var game = new ch.Chess();
			game.load_pgn(game_list[i]);
			var moves = game.history();
			game.reset();
			var l = Math.min(moves.length, 20);
			//for each of the first 20 moves, 
			//line.push({x:400/2, y:0, white:meta.data.White, black:meta.data.Black, eco:meta.data.ECO});
			for( var turn = 0; turn < l; turn++ ){
				game.move(moves[turn]);
				//grab the board state 
				var fen = game.fen();
				var pos_object = coords_data[turn][fen];	//use it to look up x,y coords
				line.push({x:pos_object.x, y:pos_object.y, white:meta.data.White, black:meta.data.Black, eco:meta.data.ECO}); 		//push these onto the line coordinate array
			}
			game_lines.push(line);	//push the game line onto the master game line array
		}
	}
}

//write out the master game line array
var out_file = fs.openSync('../generated_data/game_lines_anand_VS_kramnik_left.json', 'w');
	fs.writeSync(out_file, "var anand_lines = " + JSON.stringify(game_lines));
	fs.closeSync(out_file);



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
