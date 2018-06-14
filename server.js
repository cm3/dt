// server.js
// see https://scotch.io/tutorials/building-a-real-time-markdown-viewer

var settings = require('./settings.json');
var express = require('express');
var fs = require('fs');
var qs = require('querystring');
var glob = require("glob");
var app = express();

// set the view engine to ejs
app.set('view engine', 'ejs');

// public folder to store assets
// dotfiles are allowed for the top pad of each user
// see: http://expressjs.com/api.html
app.use(express.static(__dirname + '/public',{dotfiles: "allow"}));

// routes for app
/*
app.get('/', function(req, res) {
  res.render('main');
});
*/

var users = [];
function get_users() {
    //see: http://stackoverflow.com/questions/8676979/glob-in-node-js-and-return-only-the-match-no-leading-path
    glob("*", {cwd: 'public/user/'}, function (err, files) {
        if(err) {
            console.log(err);
        }
        console.log(files);
        users = files;
    });
}

get_users();

app.get(/\/user\/[^/]+\//, function(req, res) {
    //console.log("!"+req.baseUrl);
    //console.log(req.path.match(/\/user\/([^/]+)\//)[1]);
    if(users.indexOf(req.path.match(/\/user\/([^/]+)\//)[1]) >= 0){
        res.render('main');
    }else{
        res.redirect(settings.base+'/?error');
    }
});

//see http://stackoverflow.com/questions/25216761/express-js-redirect-to-default-page-instead-of-cannot-get
// index.html is served without explicit get method. No worries.
app.get('*', function(req, res) {
    res.redirect(settings.base+'/?error');
});

// post
// see http://stackoverflow.com/questions/17981677/using-post-data-to-write-to-local-file-with-node-js-and-express
// see http://stackoverflow.com/questions/4295782/how-do-you-extract-post-data-in-node-js
// client must send data like $.post("/save/txt",{id:"test",txt:"test\ntest2"});
var gen_post_func = function(path_func){
	return function(request, respond) {
    	var body_str = '';
    	request.on('data', function(data) {
        	body_str += data;
    	});
    	request.on('end', function (){
			body = qs.parse(body_str);
			//console.log(body);
        	fs.writeFile(path_func(body), body['txt'], function() {
            	respond.end();
        	});
            console.log("saved.");
    	});
	}
}

app.post('/save-txt', gen_post_func(function(_body){
	//return __dirname+'/public/data/txt/'+_body['id']+'.txt';
    return __dirname+'/public/user/'+_body['user']+'/txt/'+_body['id']+'.txt';
}));

app.post('/save-ann', gen_post_func(function(_body){
	//return __dirname+'/public/data/ann/'+_body['id']+'.ann';
    return __dirname+'/public/user/'+_body['user']+'/ann/'+_body['id']+'.ann';
}));

// listen on port 8000 (for localhost) or the port defined for heroku
var port = settings.port || 8000;
app.listen(port);
