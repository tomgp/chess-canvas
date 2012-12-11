var util = require('util');
var fs = require('fs');
var ch = require('/Users/tompearson/Sites/vendor/chess.js');


process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
});

var games = {};

init();

var players = [
	{
		name:'Anand', data:'pgn/Anand.pgn'
	}/*,
	{
		name:'Carlsen', data:'pgn/Carlsen.pgn' //has errors
	},
	{
		name:'Nakamura', data:'pgn/Nakamura.pgn'
	},
	{
		name:'Gelfand', data:'pgn/Gelfand.pgn'
	}*/
];

for (var p = 0; p<players.length; p++){
	util.puts(" >>> " + players[p].name)
	players[p].frequencies = runGames(players[p]);
	fen_frequencies = JSON.stringify(players[p].frequencies.fens);
	move_frequencies = JSON.stringify(players[p].frequencies.moves);

	//maybe trim FEN data, remove anything configuration that occurs only once
	var out_file = fs.openSync('generated_data/' + players[p].name + '_fen.json', 'w');
		fs.writeSync(out_file, fen_frequencies);
		fs.closeSync(out_file);
	out_file = fs.openSync('generated_data/' + players[p].name + '_moves.json', 'w');
		fs.writeSync(out_file, players[p].name + '_moves =' + move_frequencies);
		fs.closeSync(out_file);
}


function runGames(player){
	var games_list = loadPGN(player.data);
	var total_games = games_list.length; 
	var moves = []
	var fens = {};
	for (var i=0; i<games_list.length; i++ ){
		var meta_data = new GameMetaData(games_list[i]);

		//is the player black or white?		
		//did the player win, lose or draw?
		if(String(meta_data.getData().White).indexOf(player.name) > -1){
			var white = true;
			if(meta_data.getData().Result == "0-1"){
				var win = -1;
			}else if(meta_data.getData().Result == "1-0"){
				win = 1;
			}else{
				win = 0;
			}
		}else{
			white = false;
			if(meta_data.getData().Result == "0-1"){
				var win = 1;
			}else if(meta_data.getData().Result == "1-0"){
				win = -1;
			}else{
				win = 0;
			}
		}

		var win = 1; //1,0,-1
		if(games_list[i] != ""){
			var c = new ch.Chess();
			c.load_pgn(games_list[i]);
			util.puts("loaded");
			var game_moves = c.history();
			util.puts("got history");
			c.reset();
			util.puts("reset");
			for(var m=0; m<game_moves.length; m++){
				if(!moves[m]){
					moves[m] = {};
				}
				if(!moves[m][game_moves[m]]){
					moves[m][game_moves[m]] = 0;
				}
				moves[m][game_moves[m]] ++;
				c.move(game_moves[m]);
				var fen = c.fen();
				if(!fens[fen]){
					fens[fen] = 0;
				}
				fens[fen] ++;
			}
		}
		util.puts(player.name + " " + i +" / " + total_games + " games");
	}
	//add the totals to each move list
	for(var m = 0; m< moves.length;m++){
		moves[m].total = Object.keys(moves[m]).length;
	}
	var fen_array = [];
	var cutoff_frequency = 0;
	for(var f in fens){
		if(fens[f] > cutoff_frequency){
			fen_array.push({
				fen:f,
				frequency:fens[f]
			});
		}
	}
	fen_array.sort(function(a,b){
		return b.frequency - a.frequency;
	});


	return {
		moves: moves,
		fens:fen_array,
		player_positions:{
			white:{
				game_won:{},
				game_lost:{}
			},
			black:{
				game_won:{},
				game_lost:{}
			}
		},
		career_results:{
			wins:{
				white:0,
				black:0
			},
			draw:{
				white:0,
				black:0
			},
			loss:{
				white:0,
				black:0
			}
		}
	}
	util.puts("run through " + player.name);
}
//--



function loadPGN(file_name){
	var games_string = fs.readFileSync(file_name,'utf8'); 
	var games_list = games_string.replace(/\[Event/g, "!NEW GAME![Event").split('!NEW GAME!');
	return games_list;
}

//-- 

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
