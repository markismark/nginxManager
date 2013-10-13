/**
 *为了对Nginx配置文件的更改，进行重新reload
 */
//TODO 添加密码权限验证
var express = require('express');
var routes = require('./routes');
var http = require('http');
var https = require('https');
var path = require('path');
var parseCookie = express.cookieParser();
var app = express();
var appConfig = require('./config.js').appConfig;
var reload=require('./routes/reload');
app.configure(function() {
	app.set('port', process.env.PORT || appConfig.port);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.set('json spaces', 0);
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function() {
	app.use(express.errorHandler({
		showStack : true,
		dumpExceptions : true
	}));
});
app.configure('production', function() {
	console.log('production');
});
var auth = express.basicAuth(function(user, pass) {
   return (user == "super" && pass == "secret") ? true : false;
},'Super duper secret area');

app.get("^/reload$",reload.reloadGet);
app.post("^/reload$",reload.reload);
app.get("^/add$",reload.addGet);
app.post("^/add$",reload.add);
app.get("^/delete$",reload.deleteGet);
app.post("^/delete$",reload.delete);

app.get('*', routes.index);

//TODO nodeserver.createServer 下次这么尝试一下
var server = http.createServer(app);
server.listen(app.get('port'), function() {
	console.log("Express server listening on port " + app.get('port'));
});
