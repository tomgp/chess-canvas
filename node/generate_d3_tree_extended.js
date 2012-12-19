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
var ch = require('/Users/tompearson/Sites/vendor/chess.js');
var d3 = require('d3');

var openings_spreadsheet = '../pgn/chess_openings_adjusted.csv';
var openings_text = fs.readFileSync(openings_spreadsheet,'utf8');
var openings = d3.csv.parse(openings_text);

var move_tree = {
	name:"move 0", 
	children:[]
};

var node_lookup = {

}

var x_values = [];
var width_at_move = [];

for(var i = 0; i<openings.length;i++){
	var game = new ch.Chess();
	util.puts(openings[i].name)
	game.load_pgn(openings[i].moves);
	var history = game.history();
	var current_node = move_tree;
	game.reset();
	var node_name = "";
	for(var m = 0; m<history.length; m++){
		var move = history[m];
		game.move(move);
		var next_index = -1;
		//get the index of the node with this move as its name
		node_name = node_name + "_" + move;	 // TODO! SHOULD give us a unique and repeatable id
		util.puts(node_name);
		for(var c = 0; c < current_node.children.length; c++){
			if(current_node.children[c].move == move){
				next_index = c;
			}
		}
		//if it doesn't exist create it
		if(next_index < 0){	
			current_node.children.push({
				name:node_name,
				move:move,
				children:[]
			});
			next_index = current_node.children.length - 1; 
		}
		if(!node_lookup[node_name]){
			node_lookup[node_name] = {
				weight:0,
				fen:game.fen(),
				opening_groups:[],
				opening_ending:""
			};
		}	
		//set it as the current node
		current_node = current_node.children[next_index];
		//update counts
		node_lookup[node_name].weight ++;
		console.log(node_lookup[node_name].weight);
		node_lookup[node_name].opening_groups.push(openings[i].ECO[0]);
		if(m == history.length-1){
			node_lookup[node_name].opening_ending = openings[i].name + "(" +  openings[i].ECO + ")";
		}
		if(next_index < 0){
			util.puts("ERROR! current_node = " + current_node);
		}
	}
}

var output_struct = {
	tree:move_tree,
	lookup:node_lookup
};

//write out the move tree
var out_file = fs.openSync('../generated_data/d3_openings_tree_extended.json', 'w');
	fs.writeSync(out_file, JSON.stringify(output_struct));
	fs.closeSync(out_file);

out_file = fs.openSync('../generated_data/d3_openings_tree_extended.live.json', 'w');
	fs.writeSync(out_file, "var openings_tree = " + JSON.stringify(output_struct));
	fs.closeSync(out_file);

function addUnique(arr, value){ //add a value to an array if it doesn't exist in there already
	if(arr.indexOf(value) < 0){
		arr.push(value);
	}
	return arr;
}