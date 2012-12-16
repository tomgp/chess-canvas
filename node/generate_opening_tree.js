//opening tree
//format:
/*	
{
	$move:{
		properties:{
			value:0, 			//the number of times a move is used 0 in the initial tree generation
		}
		children:{			//the children
				$move:{},
				$move:{},
				$move:{}	//etc.
		},
	}
}
*/

var util = require('util');
var fs = require('fs');
var ch = require('/Users/tompearson/Sites/vendor/chess.js');
var d3 = require('d3');

var openings_spreadsheet = '../pgn/chess_openings_adjusted.csv';
var openings_text = fs.readFileSync(openings_spreadsheet,'utf8');
var openings = d3.csv.parse(openings_text);

var move_tree = {children:{}, properties:{x:0,y:0,visited:0}};
var x_values = [];
var width_at_move = [];

for(var i = 0; i<openings.length;i++){
	var game = new ch.Chess();
	util.puts(openings[i].name)
	game.load_pgn(openings[i].moves);
	var history = game.history();
	var current_node = move_tree.children;
	for(var m = 0; m<history.length; m++){
		var move = history[m];
		if(!current_node[move]){
			if(!x_values[m]){
				x_values[m] = 0;
			}
			if(!width_at_move[m]){
				width_at_move[m] = 0;
			}
			width_at_move[m]++;
			x_values[m]++;
			current_node[move] = {properties:{
					visited:0,
					x:x_values[m],
					y:m+1,
					part_of:[],
					end_of:[]
				},
				children:{}
			};
		}
		if(current_node[move].properties.part_of.indexOf(openings[i].ECO) < 0){
			current_node[move].properties.part_of.push(openings[i].ECO);
		}
		if(history.length-1 == m){
			current_node[move].properties.end_of.push(openings[i].name);
		}
		current_node = current_node[move].children;
	}
}

var output_struct = {
	width_at_move:width_at_move,
	tree:move_tree
};

//write out the move tree
var out_file = fs.openSync('../generated_data/openings_tree.json', 'w');
	fs.writeSync(out_file, JSON.stringify(output_struct));
	fs.closeSync(out_file);

out_file = fs.openSync('../generated_data/openings_tree.live.json', 'w');
	fs.writeSync(out_file, "var openings_tree = " + JSON.stringify(output_struct));
	fs.closeSync(out_file);