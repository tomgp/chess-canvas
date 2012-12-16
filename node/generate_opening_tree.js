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

d3 format
{
	name:$move
	children:[
		{},{},{}
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

var move_tree = {};

for(var i = 0; i<openings.length;i++){
	var game = new ch.Chess();
	util.puts(openings[i].name)
	game.load_pgn(openings[i].moves);
	var history = game.history();
	var current_node = move_tree;
	var current_d3_node = d3_move_tree;
	for(var m = 0; m<history.length; m++){
		var move = history[m];
		if(!current_node[move]){
			current_node[move] = {properties:{
					visited:0,
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

//write out the move tree
var out_file = fs.openSync('../generated_data/openings_tree.json', 'w');
	fs.writeSync(out_file, JSON.stringify(move_tree));
	fs.closeSync(out_file);