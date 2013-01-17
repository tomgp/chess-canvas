//load up the openings tree
var util = require('util');
var fs = require('fs');
var ch = require('/Users/tompearson/Sites/vendor/chess.js');
var crypto = require('crypto');

var players = [
	{name:"Anand",data:'../pgn/Anand.pgn'}/*,
	{name:"Kramnik",data:'../pgn/Kramnik.pgn'},
	{name:"Anand_Kramnik",data:'../pgn/Anand_Kramnik.pgn'}*/
];
var tree_data_file = '../generated_data/d3_openings_tree_extended.json';
var game_num = 0;
//open the tree and parse
var tree_data = JSON.parse(fs.readFileSync(tree_data_file,'utf8'));
tree_data.games = [];
util.puts("got tree data");

//for each player, load up that players games
for(var p in players){		
	util.puts("player " + p)
	var pgn_list = getPGNList(players[p].data);
	var game_data = pgnToGames( pgn_list );
	util.puts("got game data for " + players[p].name);
	var report = "";
	for(var g in game_data){	//for each game
		report += ("\n\tgame " + g + ": ");
		var moves = game_data[g].game.history();
		var meta_data = game_data[g].meta_data;
		report += meta_data.description + " ";
		var recognised_opening = true;
		var move = 0;
		var node_name = "";
		while(recognised_opening){	//while the game is following a recognised opening
			recognised_opening = false;
			node_name = node_name + "_" + moves[move];
			if(tree_data.lookup[node_name]){
				if(!tree_data.lookup[node_name].players){
					tree_data.lookup[node_name].players = {};
				}
				if(!tree_data.lookup[node_name].players[players[p].name]){
					tree_data.lookup[node_name].players[players[p].name] = 0;
				}
				if(!tree_data.lookup[node_name].games){
					tree_data.lookup[node_name].games = [];
				}

				tree_data.lookup[node_name].players[players[p].name] += 1;
				
				recognised_opening = true;
				var last_move = moves[move];
				move++;
				tree_data.lookup[node_name].games.push({
					game_id:game_num,
					next_move:moves[move],
				});
			}
		}
		report += move + " opening moves";
		tree_data.games[game_num] = meta_data;
		game_num ++;
	}
	util.puts(report);
}

//re-save the tree data  
var out_file = fs.openSync('../generated_data/d3_openings_tree_extended.json', 'w');
	fs.writeSync(out_file, JSON.stringify(tree_data));
	fs.closeSync(out_file);

out_file = fs.openSync('../generated_data/d3_openings_tree_extended.live.json', 'w');
	fs.writeSync(out_file, "var openings_tree = " + JSON.stringify(tree_data));
	fs.closeSync(out_file);



//utility funcitons TODO extract to a library!
function getPGNList(file_name){
	var games_string = fs.readFileSync(file_name,'utf8'); 
	var game_list = games_string.replace(/\[Event/g, "!NEW GAME![Event").split('!NEW GAME!');
	return game_list;
}

function pgnToGames(game_list){
	var games = [];
	for (var i =0; i<game_list.length; i++){
		var game = {};
		var c = new ch.Chess();
		c.load_pgn(game_list[i]);
		var meta_data = getMetaData(game_list[i])
		game.game = c;
		game.meta_data = meta_data;
		games.push(game);
	}
	return games;
}

function getMetaData(pgn){
	var data = {};
	var lines = pgn.split(/\n/); 		//go through the lines of the PGN string
	for (var i = 0; i<lines.length ; i++){
		//grab everything that is enclosed by [] on each line
		var meta_regex = /\[(\w+) "(.+)"\]/g;
		var matches = meta_regex.exec(lines[i]);
		if(matches){
			data[matches[1]] = matches[2];
		}
	}
	var return_data = {}
	return_data.players = {'black':{'name':data.White,'elo':data.WhiteElo}, 'white':{'name':data.Black,'elo':data.BlackElo}};
	return_data.event = data.Event + " (round "+data.Round+")";
	return_data.year = String(data.Date).split(".")[0];
	return_data.result = data.Result;

	return return_data;
}

function getResultDescription(r){
	if (r=="1-0"){
		return "White win";
	}if (r=="0-1"){
		return "Black win";
	}
	return "Drawn game";
}