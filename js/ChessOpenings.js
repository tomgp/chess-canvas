//chess openings to JSON

(function(window){

	function ChessOpenings(openings_file){
		this.initialise(openings_file);
	}
	var p = ChessOpenings.prototype;
	p.openings_by_code = {};
	p.openings_by_move_sequence = {};

	p.initialise = function(file){
		var client = new XMLHttpRequest();
		client.open('GET', file);
		var that = this;
		client.onreadystatechange = function(){
			if(client.readyState == 4){
				var openings_array = client.responseText.split("\n");
				for (var i = 0; i < openings_array.length; i++){
					var elements = openings_array[i].split("\t");
					var record = {
						code:elements[0], 
						name:elements[1],
						sequence:elements[2]};
					if(!that.openings_by_code[elements[0]]){
						that.openings_by_code[elements[0]] = [];
					}
					that.openings_by_code[elements[0]].push(record);
					that.openings_by_move_sequence[elements[2]] = record;
				}
		  	}
		}
		client.send();
	} 

	//TODO, dispatch event when ready

	window.ChessOpenings = ChessOpenings;
}(window))