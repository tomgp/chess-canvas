___Chess data investigation & visualisation prototyping___

Aim: To investigate ways to display large amounts of chess data. 

Process: Read a set of PGN files, parse and analyse the data therein. Create a set of json files to power variosu visualisations


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