var appConfig = require('./../config.js').appConfig;
var fs = require("fs");
var os=	require("os");
var Log = require('log')
  , fs = require('fs')
  , stream = fs.createWriteStream('./log.txt', { flags: 'a' })
  , log = new Log('debug', stream);
var dataManager=require('./data.js');
exports.reloadGet = function(req, res) {
	if(os.type()=="Linux"){
		var path = process.cwd() + "/public/reload.html";
	}else{
		var path = process.cwd() + "\\public\\reload.html";
	}
	fs.readFile(path, function(err, data) {
		if(!err) {
			res.send(data.toString());
		} else {
			res.send(err);
		}
	})
}
exports.addGet = function(req, res) {
    if(os.type()=="Linux"){
        var path = process.cwd() + "/public/add.html";
    }else{
        var path = process.cwd() + "\\public\\add.html";
    }
    fs.readFile(path, function(err, data) {
        if(!err) {
            res.send(data.toString());
        } else {
            res.send(err);
        }
    })
}
exports.deleteGet = function(req, res) {
    if(os.type()=="Linux"){
        var path = process.cwd() + "/public/delete.html";
    }else{
        var path = process.cwd() + "\\public\\delete.html";
    }
    fs.readFile(path, function(err, data) {
        if(!err) {
            res.send(data.toString());
        } else {
            res.send(err);
        }
    })
}

var addData=exports.add=function(req, res){
    var result = {};
    try {
        log.info("request json:"+req.body.sites);
        var sites = JSON.parse(req.body.sites);
        sites=dataManager.addData(sites);

    } catch (e) {
        result.code = 500;
        result.messages = ["input error!"];
        res.json(result);
        return ;
    }
    if(auth(req.body.name,req.body.password,result)===false){
        res.json(result);
        return ;
    }
    var content = readFile(result);
    if(content !== false) {
        var splitContent = getSplitContent(content,result);
        var conf = getConf(sites,result);
        if(conf !== false) {
            var confData = splitContent.join(conf);
            console.log(confData);
            var write = writeFile(confData,result);
            if(write !== false) {
                reload(result);
            }
        }
    }
    log.info(JSON.stringify(result));
    res.json(result);
};

var removeData=exports.delete=function(req, res){
    var result = {};
    try {
        log.info("request json:"+req.body.sites);
        var sites = JSON.parse(req.body.sites);
        sites=dataManager.removeData(sites);

    } catch (e) {
        result.code = 500;
        result.messages = ["input error!"];
        res.json(result);
        return ;
    }
    if(auth(req.body.name,req.body.password,result)===false){
        res.json(result);
        return ;
    }
    var content = readFile(result);
    if(content !== false) {
        var splitContent = getSplitContent(content,result);
        var conf = getConf(sites,result);
        if(conf !== false) {
            var confData = splitContent.join(conf);
            console.log(confData);
            var write = writeFile(confData,result);
            if(write !== false) {
                reload(result);
            }
        }
    }
    log.info(JSON.stringify(result));
    res.json(result);
};

var reConf = exports.reload = function(req, res) {
	var result = {};
	try {
		log.info("request json:"+req.body.sites);
		var sites = JSON.parse(req.body.sites);
	} catch (e) {
		result.code = 500;
		result.messages = ["input error!"];
		res.json(result);
		return ;
	}
	if(auth(req.body.name,req.body.password,result)===false){
		res.json(result);
		return ;
	}
	var content = readFile(result);
	if(content !== false) {
		var splitContent = getSplitContent(content,result);
		var conf = getConf(sites,result);
		if(conf !== false) {
			var confData = splitContent.join(conf);
			var write = writeFile(confData,result);
			if(write !== false) {
				reload(result);
			}
		}
	}
	log.info(JSON.stringify(result));
	res.json(result);
}
var auth = function(name, pwd,result) {
	if( typeof (appConfig.userName) != "undefined" && typeof (appConfig.userPwd) != "undefined") {
		if(appConfig.userName==name&&appConfig.userPwd==pwd) {
			return true;
		}else {
			result.code = 304;
			result.messages = ["Passsword not correct!"];
			return false;
		}
	} else {
		result.code = 500;
		result.messages = ["appConfig error"];
		return false;
	}
}
var readFile = function() {
	var path = appConfig.templatePath;
	if(appConfig.templatePathIsRalative === true) {
		if(os.type()=="Linux"){
			path = process.cwd() + "/" + path;
		}else{
			path = process.cwd() + "\\" + path;
		}
		
	}
	try {
		var data = fs.readFileSync(path);
		return data.toString();
	} catch (e) {
		result.code = 500;
		result.messages = ["Read template conf file error"];
		return false;
	}
}
var getSplitContent = function(content,result) {
	if( typeof (appConfig.templateFileReplaceFlag) == "undefined") {
		result.code = 500;
		result.messgae = ["config Error:not exsit templateFileReplaceFlag"];
		return false;
	} else {
		var splitContent = content.split(appConfig.templateFileReplaceFlag);
		if(splitContent.length == 1) {
			result.code = 500;
			result.messgaes = ["template error:can not find template replace flag"];
			return false;
		} else if(splitContent.length > 2) {
			result.code = 500;
			result.messgaes = ["template error:template replace flag more than one time"];
			return false;
		} else {
			return splitContent;
		}
	}
}
var getConf = function(sites,result) {
	var conf = "";
	if(Object.prototype.toString.call(sites) != "[object Array]") {
		result.code = 500;
		result.messgae = ["appConfig Error,site list error"];
		return false;
	}
	for(var i in sites) {
		var site = sites[i]
		if(site.app && site.url) {
			conf += "\t\tlocation /" + site.app + " {\n";
			conf += "\t\t\tproxy_set_header Host $host:$server_port;\n";
			conf += "\t\t\tproxy_set_header X-Real-IP $remote_addr;\n";
			conf += "\t\t\tproxy_set_header REMOTE-HOST $remote_addr;\n";
			conf += "\t\t\tproxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n";
			conf += "\t\t\tproxy_pass " + site.url + ";\n";
			conf += "\t\t\tproxy_redirect default;\n";
			conf += "\t\t\}\n";
		}
		continue;
	}
	log.info("nginx conf :"+JSON.stringify(conf));
	return conf;
}
var writeFile = function(data,result) {
	if( typeof (appConfig.nginxConfPath) == "undefined") {
		result.code = 500;
		result.messgae = ["nginx conf path not exsit"];
		return false;
	}
	try {
		if(os.type()=="Linux"){
			console.log(appConfig.nginxConfPath + "/nginx.conf");
			fs.writeFileSync(appConfig.nginxConfPath + "/nginx.conf", data);
		}else{
			fs.writeFileSync(appConfig.nginxConfPath + "\\nginx.conf", data);
		}
		
	} catch (e) {
		result.code = 500;
		result.messgae = ["write file error"];
	}
}
var reload = function(result) {
	var exec = require('child_process').exec;
	if(typeof(appConfig.nginxPath)=="undefined"){
		result.code = 500;
		result.messgae = ["config Error:not exsit nginxPath"];
		return false;
	}
	if(os.type()=="Linux"){
		var cmd="cd "+appConfig.nginxPath+";./nginx -s reload";
	}else{
		var cmd="cd "+appConfig.nginxPath+";nginx -s reload";
	}
	result.code = 200;
	result.status = "success";
	exec(cmd, function(error, stdout, stderr) {
		if(!error) {
		} else {
			result.code = 500;
			result.status = "error";
		}
	})
}

