//chess openings to JSON

(function(window){

	var client = new XMLHttpRequest();
	client.open('GET', file_name);
	var that = this;
	client.onreadystatechange = function(){
		if(client.readyState == 4){
			that.games[identifier] = p.createGameObject(client.responseText.replace(/\[Event/g, "!NEW GAME![Event").split('!NEW GAME!'));
	  	}
	}
	client.send();

}(window))