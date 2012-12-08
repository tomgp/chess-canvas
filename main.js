var util = require('util');
var fs = require('fs');
var ch = require('/Users/tompearson/Sites/vendor/chess.js')

var games = {};

var players = [
	/*{
		name:'Anand', data:'pgn/Anand.pgn'
	},
	{
		name:'Carlsen', data:'pgn/Carlsen.pgn' //has errors
	},
	{
		name:'Nakamura', data:'pgn/Nakamura.pgn'
	},*/
	{
		name:'Gelfand', data:'pgn/Gelfand.pgn'
	}
];

for (var p = 0; p<players.length; p++){
	util.puts(" >>> " + players[p].name)
	players[p].frequencies = runGames(players[p]);
	fen_frequencies = JSON.stringify(players[p].frequencies.fens);
	move_frequencies = JSON.stringify(players[p].frequencies.moves);
	var out_file = fs.openSync('generated_data/' + players[p].name + '_fen.json', 'w');
		fs.writeSync(out_file, fen_frequencies);
		fs.closeSync(out_file);
	out_file = fs.openSync('generated_data/' + players[p].name + '_moves.json', 'w');
		fs.writeSync(out_file, move_frequencies);
		fs.closeSync(out_file);
}


function runGames(player){
	var games_list = loadPGN(player.data);
	var total_games = games_list.length; 
	var moves = []
	var fens = {};
	for (var i=0; i<games_list.length; i++ ){
		if(games_list[i] != ""){
			var c = new ch.Chess();
			c.load_pgn(games_list[i]);
			var game_moves = c.history();
			c.reset();
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
	for(var f in fens){
		fen_array.push({
			fen:f,
			frequency:fens[f]
		});
	}
	fen_array.sort(function(a,b){
		return b.frequency - a.frequency;
	});
	return {
		moves: moves,
		fens:fen_array,
	}
	util.puts("run through " + player.name);
}
//--



function loadPGN(file_name){
	var games_string = fs.readFileSync(file_name,'utf8'); 
	var games_list = games_string.replace(/\[Event/g, "!NEW GAME![Event").split('!NEW GAME!');
	return games_list;
}
