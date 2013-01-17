___Chess data investigation & visualisation prototyping___

__Aim:__ 
To investigate ways to display large amounts of chess data. 

__Process:__ 
Read a set of PGN files, parse and analyse the data therein. Create a set of json files to power various visualisations.

The important scripts are:
_ node/generate_d3_tree_extended.js _
which takes a list of ECO openings and steps through each move by move building up a move tree in the standard d3 format
	{
		"name":"_e4_c5_Bc4",	//the node name is a string of moves joined by underscores
		"move":"Bc4",			//the 'move' property is a convenience navigate the tree
		"children":[
			{...},
			{...},
			{...}
		]
	}

a lookup containing meta_data is created where meta data for agiven position is stored using the same move string as the tree node's name 

over the 2500~ openings this takes between 5s and 10s to run

_ node/add_player_data_to_tree.js _

This script takes the tree created by the previous script and adds real game data from lists of PGNs, this data includes infomation such as which players have played which moves at each point in the tree, whether those games were won and lost etc.

to save space and normalise things the game meta data is stored in a secondary look up table

this script takes about 50 seconds to add 3000 games

__Results:__ 

current visualisation at: http://chess.pointlineplane.co.uk/pages/openings_vis_d3_players_filtered.html


___Data sources___
pgn files are originally from
http://www.pgnmentor.com/files.html
some of them have been tweaked to fix formatting problems

___Dependencies___
jhlya's chess-js is used extensively
https://github.com/jhlywa/chess.js

d3 is used for processing CSV's in node and for laying out SVG's in the browser
https://github.com/mbostock/d3

easel js is used for some of the earlier board state visualisations
https://github.com/CreateJS/EaselJS/