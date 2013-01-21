//opening tree
//format:
/*	
{
 "name": "a3",
 "children": [
  {...},{...},{...}
  ]
 }
*/

var util = require('util');
var fs = require('fs');
var ch = require('/Users/tompearson/Sites/vendor/chess.js');
var d3 = require('d3');

var openings_spreadsheet = '../pgn/chess_openings_adjusted.csv';
var openings_text = fs.readFileSync(openings_spreadsheet,'utf8');
var openings = d3.csv.parse(openings_text);

var move_tree = {
	name:"move 0", 
	children:[]
};

var x_values = [];
var width_at_move = [];

for(var i = 0; i<openings.length;i++){
	var game = new ch.Chess();
	util.puts(openings[i].name)
	game.load_pgn(openings[i].moves);
	var history = game.history();
	var current_node = move_tree;
	for(var m = 0; m<history.length; m++){
		var move = history[m];
		var next_index = -1;
		//get the index of the node with this move as its name
		for(var c = 0; c < current_node.children.length; c++){
			if(current_node.children[c].name == move){
				next_index = c;
			}
		}
		//if it doesn't exist create it
		if(next_index < 0){
			current_node.children.push({
				name:move,
				children:[]
			});
			next_index = current_node.children.length - 1; 
		}
		//set it as the current node
		current_node = current_node.children[next_index];
		if(next_index < 0){
			util.puts("ERROR!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
		}
	}
}

var output_struct = move_tree;

//write out the move tree
var out_file = fs.openSync('../generated_data/d3_openings_tree.json', 'w');
	fs.writeSync(out_file, JSON.stringify(output_struct));
	fs.closeSync(out_file);

out_file = fs.openSync('../generated_data/d3_openings_tree.live.json', 'w');
	fs.writeSync(out_file, "var openings_tree = " + JSON.stringify(output_struct));
	fs.closeSync(out_file);