//opening tree
//format:
/*	
{
	"name": "id",
	"children": [
		{...},{...},{...}
	]
}
//TODO, split out extended data into parallel lookup table
id:{
	"opening_groups":["A","B","C"],	//custom additions...
	"opening_ending":"E01",
	"fen":"",
	"weight":1 //how many times in the creation process the node has been visited
}
*/
var util = require('util');
var fs = require('fs');
var chess_utils = require('chess_utils');

var start_time = new Date().valueOf()/1000;

var game_list = chess_utils.load_PGN('../pgn/Anand_Kramnik.pgn');
//generate the tree
var tree_data = JSON.stringify( chess_utils.build_move_tree(game_list) );
//write out the move tree
var out_file = fs.openSync('../generated_data/d3_move_tree.json', 'w');
	fs.writeSync(out_file, tree_data);
	fs.closeSync(out_file);

out_file = fs.openSync('../generated_data/d3_move_tree.live.json', 'w');
	fs.writeSync(out_file, "var openings_tree = " + tree_data);
	fs.closeSync(out_file);

util.puts("done in " + (( new Date().valueOf()/1000 ) - start_time ) + " s");