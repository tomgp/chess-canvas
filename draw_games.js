var util = require('util');
var fs = require('fs');
var ch = require('/Users/tompearson/Sites/vendor/chess.js');
//create coordinate sets for the first 20 moves of each game based on the output from process_fens

//load up the coordinate lookup
var coords_file = 'generated_data/anand_chart_positions.json';
var coords_string = fs.readFileSync(coords_file,'utf8'); 
var coords_data = JSON.parse(coords_string);

//load up the pgn data
var pgn_file = 'pgn/Anand.pgn';
var games_string = fs.readFileSync(pgn_file,'utf8'); 
var game_list = games_string.replace(/\[Event/g, "!NEW GAME![Event").split('!NEW GAME!');


//make the master "game line" array
var game_lines = [];

//for each game in the pgn data
for(var i = 0; i< game_list.length; i++){
	util.puts('processing game ' + i);
	//make a new "game line" i.e. coordinate array
	var line = [];
	var game = new ch.Chess();
	game.load_pgn(game_list[i]);
	var moves = game.history();
	game.reset();
	var l = Math.min(moves.length, 20);
	//for each of the first 20 moves, 
	for( var turn = 0; turn < l; turn++ ){
		game.move(moves[turn]);
		//grab the board state 
		var fen = game.fen();
		var pos_object = coords_data[turn][fen];	//use it to look up x,y coords
		line.push({x:pos_object.x, y:pos_object.y}); 		//push these onto the line coordinate array
	}
	game_lines.push(line);	//push the game line onto the master game line array
}

//write out the master game line array
var out_file = fs.openSync('generated_data/anand_game_lines.json', 'w');
	fs.writeSync(out_file, JSON.stringify(game_lines));
	fs.closeSync(out_file);