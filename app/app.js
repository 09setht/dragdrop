/**
 * Created by tolles on 3/25/14.
 */
var express = require('express');
var http = require('http');

var app = express();

app.set('port', process.env.PORT || '3000');
app.use('/dist',express.static('dist'));
app.use('/lib',express.static('node_modules'));

app.get('/',function(req,res,next){
	res.sendfile('app/index.html');
});

app.use(app.router);

http.createServer(app).listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});
