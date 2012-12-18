//dummy advantage data
//chess advantage is on a scale between +6 and -6

var util = require('util');
var fs = require('fs');
var ch = require('/Users/tompearson/Sites/vendor/chess.js');

init();

//load up chess games (filtered by a player name (or ECO or whatever...))
var player_name = 'Anand';
var game_strings = loadPGN('../pgn/Anand.pgn', 'Carlsen');
//create an advantage lines array
var all_lines = [];

var white_lines = [];	//lines where anand is white
var black_lines = [];

var winning_lines = [];	//lines where anand wins
var losing_lines = [];
var tie_lines = [];
var longest_game = 0;

//for each chess games
for(var i = 0; i<game_strings.length;i++){
	util.puts(i +"/"+ game_strings.length);
	//create an array to represent the advantage line 
	var line = [0];
	var game = new ch.Chess();
	game.load_pgn(game_strings[i]);
	var history = game.history();
	longest_game = Math.max(history.length, longest_game);
	game.reset();
	//go through each board state
	for(var j=0; j<history.length; j++){
		game.move(history[j]);
		line.push(calculateAdvantage(game.fen()));		//add that advantage to the  line
	}
	
	var line = smoothArray(line, 3);

	//add the lines
	all_lines.push(line);
	var meta = new GameMetaData(game_strings[i]);
	if(meta.data.White.indexOf(player_name) > -1){ //if anand's white
		white_lines.push(line);
		if(meta.data.Result = "1-0"){
			winning_lines.push(line);
		}else if(meta.data.Result = "0-1"){
			losing_lines.push(line);
		}else{
			tie_lines.push(line);
		}
	}else{
		black_lines.push(line);
		if(meta.data.Result = "1-0"){
			losing_lines.push(line);			
		}else if(meta.data.Result = "0-1"){
			winning_lines.push(line);

		}else{
			tie_lines.push(line);
		}
	}
}

var output = {
	longest_game:longest_game,
	winning_lines:winning_lines,
	losing_lines:losing_lines,
	white_lines:white_lines,
	black_lines:black_lines,
	all_lines:all_lines
}

//save the advantage lines
var out_file = fs.openSync('../generated_data/dummy_advantage_anand_carlsen.live.json', 'w');
	fs.writeSync(out_file, "var advantage_lines = " + JSON.stringify(output));
	fs.closeSync(out_file);

out_file = fs.openSync('../generated_data/dummy_advantage_anand_carlsen.json', 'w');
	fs.writeSync(out_file, JSON.stringify(output));
	fs.closeSync(out_file);


//-------

function smoothArray(arr, filter_width){ //blunt low pass filter for smoothing data
	var filtered = []
	for(var i=0; i<arr.length; i++){
		if(i<filter_width || i >= arr.length - filter_width){
			filtered[i] = arr[i];
		}else{
			var total = 0;
			var count = 0;
			for(var j = -filter_width; j<=filter_width; j++){
				total += arr[i+j];
				count++;
			}
			filtered[i] = total/count;
		}
	}
	return filtered;
}
function calculateAdvantage(fen){ //extremely dumb (but quick) way of estimating advantage
	var values = {p: 1,n: 3,b: 3,r: 5,q: 9,k: 0,P: 1,N: 3,B: 3,R: 5,Q: 9,K: 0};
	var board_string = fen.split(" ")[0];
	var white_regexp = /[RNBQKBNRP]/g;	//get the uppercase pieces white
	var white_pieces = board_string.match(white_regexp);
	
	var black_regexp = /[rnbqkbnrp]/g;	//get the lowercase pieces black
	var black_pieces = board_string.match(black_regexp);
	
	var advantage = materialValue(white_pieces, values) - materialValue(black_pieces, values);
	//util.puts(advantage + "  (" + black_pieces +" vs " + white_pieces + ")");
	return advantage;
}

function materialValue(pieces, values){
	var val = 0;
	for(var i = 0; i<pieces.length; i++){
		val += values[pieces[i]]; 
	}
	//max material value = 39, scale to 6...
	val = val / 10 * 6;
	//add some noise
	val += (Math.random() - 0.5)/10;
	return val;
}

function loadPGN(file_name, filter){
	var games_string = fs.readFileSync(file_name,'utf8'); 
	var games_list = games_string.replace(/\[Event/g, "!NEW GAME![Event").split('!NEW GAME!');
	if(filter){
	var filtered_list = [];
		for(var i = 0; i<games_list.length; i++){
			if(games_list[i].indexOf(filter) > -1){
				filtered_list.push(games_list[i]);
			}
		}
	}
	return filtered_list;
}

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
