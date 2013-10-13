var fs = require('fs');
var appData = null;

var getAPPData = function(json) {
	if(appData !== null) {
        return false;
	}
	try {
		var data=fs.readFileSync("./data.json");
        try {
            appData = eval(data.toString());
            return ;
        } catch(e) {
            console.log("data.json error");
        }
	} catch(e) {
		console.log("read data.json error");
	}
}
var addData=exports.addData = function(json) {
    if(appData === null) {
        getAPPData();
    }
	for(var i in json) {
		var app = json[i].app;
		var url = json[i].url;
		var flage = false;
		for(var j in appData) {
			if(appData[j].app === app) {
				appData[j].url = url;
				flage = true;
				break;
			}
		}
		if(!flage) {
			appData.push(json[i]);

		}
	}
    saveData(appData);
    return appData;
}

var removeData=exports.removeData=function(json){
    if(appData === null) {
        getAPPData();
    }
	for(var i=json.length-1;i>-1;--i) {
		var app = json[i].app;
		var url = json[i].url;
		var flage = false;
		for(var j=appData.length-1;j>-1;--j) {
			if(appData[j].app === app) {
				appData.splice(j,1);
				break;
			}
		}
	}
    saveData(appData);
    return appData;
}

var saveData=exports.save = function(json) {
	try {
        fs.writeFileSync("./data.json", JSON.stringify(json));

	} catch (e) {
		result.code = 500;
		result.messgae = ["write file error"];
	}
}


