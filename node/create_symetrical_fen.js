//this should take a list of fens and their frequencies and create a lookup object for 'symetrical fens' i.e. we don't care whether the pieces are black or white, we don't care what moves ledto them or what turn they occured on.
//context free FENS, purely the likely hood of a given configuration agnostic of anything else in the game
var util = require('util');
var fs = require('fs');
var ch = require('/Users/tompearson/Sites/vendor/chess.js');



//get the fen frequency file
var fen_file = '../generated_data/Anand_fen.json';
var fen_string = fs.readFileSync(fen_file,'utf8'); 
var fen_data = JSON.parse(fen_string);

//create the fen lookup object//
var FEN_symetrical_totals_lookup = {};
var FEN_probability_look_up = {};

//for each turn inthe FEN frequency file
var num_turns = fen_data.length
for(var turn = 0; turn<num_turns; turn++){
	//get each board state and add it's frequency to the fen_lookup object
	for(var state in fen_data[turn]){
		var sym_state = symetrical_fen(state);
		if( !FEN_symetrical_totals_lookup[sym_state] ){
			FEN_symetrical_totals_lookup[sym_state] = 0;
		}
		FEN_symetrical_totals_lookup[sym_state] += fen_data[turn][state];	//get each board state "symetrize" it and add it's frequency to the fen_lookup object
	}
}
//declare the total number of board states, start it at zero
var unique_states = Object.keys(FEN_symetrical_totals_lookup).length;
var total_states = 0;
for(state in FEN_symetrical_totals_lookup){
	total_states += FEN_symetrical_totals_lookup[state];
}
util.puts("unique states: " + unique_states);
util.puts("total  states: " + total_states);

for(state in FEN_symetrical_totals_lookup){ 
	//work out the proportion of the time a given symetrical state occurs
	var frequency = FEN_symetrical_totals_lookup[state]/total_states;
	FEN_probability_look_up[state] = frequency;
}

//go through the lookup and determine the likelyhood of each fen in the grand sceme of things i.e. frequency/ total board states
//record the min and the max so we have a range of values (with which we will scale the angle for each line drawn in the final vis)

function symetrical_fen(fen_string){
	//get the string before the first space, lowercase, return
	return fen_string.split(" ")[0].toLowerCase();
}