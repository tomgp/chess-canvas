//utils.js

var utils = {};

utils.ECOcolours = {
		A:{r:255,g:96,b:96}, 	//E16060
		B:{r:0,g:174,b:239},	//00AEEF
		C:{r:95,g:188,b:87},	//5FBC57
		D:{r:145,g:102,b:171},	//9166AB
		E:{r:219,g:143,b:64}	//DB8F40
	};


utils.getECOColour = function(groups){
		if(!groups){
			return "#666666"
		}
		//blend the colours
		//average r, g and b
		var r, g, b;
		r=g=b=0;
		var i;
		for (i = 0; i < groups.length; i++){
			var c = utils.ECOcolours[groups[i]]
			r+=c.r;
			g+=c.g;
			b+=c.b;
		}
		r=r/i;
		g=g/i;
		b=b/i;
		return utils.RGB2Hex(r,g,b);
	}

utils.RGB2Hex = function(r,g,b){
		return '#' + utils.byte2Hex(r) + utils.byte2Hex(g) + utils.byte2Hex(b);
	}

utils.byte2Hex = function (n){
		var nybHexString = "0123456789ABCDEF";
		return String(nybHexString.substr((n >> 4) & 0x0F,1)) + nybHexString.substr(n & 0x0F,1);
	}