//load up the openings tree
var util = require('util');
var fs = require('fs');
var ch = require('/Users/tompearson/Sites/vendor/chess.js');

var players = [
	{name:"Anand",data:'../pgn/Anand.pgn'},
	{name:"Kramnik",data:'../pgn/Kramnik.pgn'},
	{name:"Anand_Kramnik",data:'../pgn/Anand_Kramnik.pgn'}];
var tree_data_file = '../generated_data/d3_openings_tree_extended.json';

//open the tree and parse
var tree_data = JSON.parse(fs.readFileSync(tree_data_file,'utf8'));
util.puts("got tree data");

//for each player, load up that players games
for(p in players){		
	var game_data = pgnToGames( getPGNList(players[p].data) );
	util.puts("got game data for " + players[p].name);
	var report = "";
	for(g in game_data){	//for each game
		report += ("\n\tgame " + g + ": ");
		var moves = game_data[g].history();
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
				tree_data.lookup[node_name].players[players[p].name] += 1;
				recognised_opening = true;
				move++;
			}
		}
		report += move + " opening moves";
		util.puts(report);
	}
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
		var c = new ch.Chess();
		c.load_pgn(game_list[i]);
		games.push(c);
	}
	return games;
}