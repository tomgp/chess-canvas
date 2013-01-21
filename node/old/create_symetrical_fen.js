//this should take a list of fens and their frequencies and create a lookup object for 'symetrical fens' i.e. we don't care whether the pieces are black or white, we don't care what moves ledto them or what turn they occured on.
//context free FENS, purely the likely hood of a given configuration agnostic of anything else in the game
var util = require('util');
var fs = require('fs');
var ch = require('/Users/tompearson/Sites/vendor/chess.js');

function symetrical_fen(fen_string){
	//get the string before the first space, lowercase, return
	return fen_string.split(" ")[0].toLowerCase();
}


var fen_files = [
	'../generated_data/Anand_fen.json'
	//,'../generated_data/Adams_fen.json'
	//,'../generated_data/Capablanca_fen.json'
	,'../generated_data/Kramnik_fen.json'
	//,'../generated_data/Nimzowitsch_fen.json'
];

//get the fen frequency file
var fen_data = [];
for (var f = 0; f<fen_files.length; f++){
	var fen_file = fen_files [f];
	var fen_string = fs.readFileSync(fen_file,'utf8'); 
	var arr = JSON.parse(fen_string);
	fen_data = fen_data.concat( arr );
}



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



//go through the lookup and determine the likelyhood of each fen in the grand sceme of things i.e. frequency/ total board states
//record the min and the max so we have a range of values (with which we will scale the angle for each line drawn in the final vis)
var frequency_range = {max:0, min:1};
for(state in FEN_symetrical_totals_lookup){ 
	//work out the proportion of the time a given symetrical state occurs
	var frequency = FEN_symetrical_totals_lookup[state]/total_states;
	FEN_probability_look_up[state] = frequency ; //*10 
	frequency_range.max = Math.max(frequency_range.max, frequency);
	frequency_range.min = Math.min(frequency_range.min, frequency);
}

var out_object = {
	lookup:FEN_probability_look_up,
	range:frequency_range,
	distribution:object_to_sorted_array(FEN_probability_look_up)
};


function object_to_sorted_array(o){
	var arr = [];
	for(var key in o){
		arr.push(o[key]);
	}
	arr.sort();
	return arr;
}

util.puts("frequency range " + frequency_range.max + " -> " + frequency_range.min);

//write out the out_object

//write out the master game line array
var out_file_live = fs.openSync('../generated_data/fen_probability_lookup_live.json', 'w');
	fs.writeSync(out_file_live, "var fen_probability_lookup = " + JSON.stringify(out_object));
	fs.closeSync(out_file_live);

var out_file_working = fs.openSync('../generated_data/fen_probability_lookup_working.json', 'w');
	fs.writeSync(out_file_working, JSON.stringify(out_object));
	fs.closeSync(out_file_working);

var out_file_working = fs.openSync('../generated_data/fen_distribution.csv', 'w');
	fs.writeSync(out_file_working, out_object.distribution.join("\n"));
	fs.closeSync(out_file_working);

