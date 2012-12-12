var util = require('util');
var fs = require('fs');

// work out cone coors fro each board state each turn

var file_name = 'generated_data/Anand_fen.json';

var fen_string = fs.readFileSync(file_name,'utf8'); 
var fen_data = JSON.parse(fen_string);

var width_min = 50;
var width_max = 400;
var row_height = 20;

var yPos = 0;

var extended_fen_data = [];
var row_increment = (width_max - width_min) / 19;
util.puts(row_increment);

for (var turn = 0; turn<fen_data.length; turn++){
	var row_width = width_min + (row_increment * turn);
	var current_turn = fen_data[turn];
	var xScale = row_width / Object.keys(current_turn).length; 
	util.puts(turn + " > width: " + row_width + " scale: " +  xScale);

//build an array which we can order so we can assign x and y values
	var fen_array = [];
	util.puts("No. board states: " + Object.keys(current_turn).length);
	for (var board_state in current_turn){
		fen_array.push({
			frequency:current_turn[board_state],
			fen:board_state,
		});
	} 
	fen_array.sort(function(a,b){
		return (b.frequency - a.frequency);
	});

//assign those x and y values and and push back into an object so we can get them via a fen string
	var xPos = Math.floor((width_max/2 - row_width/2));
	var turn_object = {};
	for(var i = 0; i<fen_array.length; i++){ 
		turn_object[fen_array[i].fen] = {
			f:fen_array[i].frequency,
			x:xPos,
			y:yPos
		};
		xPos += xScale;
	}
	extended_fen_data.push(turn_object);
	yPos += row_height;
}

//write out extended fen data array
var out_file = fs.openSync('generated_data/anand_chart_positions_2.json', 'w');
	fs.writeSync(out_file, JSON.stringify(extended_fen_data));
	fs.closeSync(out_file);