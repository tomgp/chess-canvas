//for a given pgn file filter it so that it only contains games where specified players are involved

var util = require('util');
var fs = require('fs');

var player = "Anand";
init();
//open a pgn file //split it into games
var list = loadPGN('../pgn/Kramnik.pgn');

//go through each game if it has the required players stick it into an output array
var output_array = [];
for (var i = 0; i<list.length; i++){
	var meta_data = new GameMetaData(list[i]).getData();
	if(String(meta_data.White).indexOf(player) > -1 || String(meta_data.Black).indexOf(player) > -1){
		util.puts('include');
		output_array.push(list[i]);
	}else{
		util.puts('n')		
	}
}
//join the output array into a string
pgn_data = output_array.join("\n\n\n");

//save the resulting string as pgn file
var out_file = fs.openSync('../pgn/Anand_Kramnik.pgn', 'w');
	fs.writeSync(out_file, pgn_data);
	fs.closeSync(out_file);

//util function TODO when time permits - extract!

function loadPGN(file_name){
	var games_string = fs.readFileSync(file_name,'utf8'); 
	var games_list = games_string.replace(/\[Event/g, "!NEW GAME![Event").split('!NEW GAME!');
	return games_list;
}

function GameMetaData(pgn_string){
	this.initialise(pgn_string);
}

function init(){
	var p = GameMetaData.prototype;
	p.data;

	p.initialise = function(pgn){
		this.data = {};
		var lines = pgn.split(/\n/); 		//go through the lines of the PGN string
		for (var i = 0; i<lines.length ; i++){
			//grab everything that is enclosed by [] on each line
			var meta_regex = /\[(\w+) "(.+)"\]/g;
			var matches = meta_regex.exec(lines[i]);
			if(matches){
				this.data[matches[1]] = matches[2];
			}
		}
	}

	p.getData = function(){
		return this.data;
	}
}