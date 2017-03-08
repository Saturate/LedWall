//var express = require('express');
//var app = express();
const express = require('express');
const http = require('http');
const https = require('https');
const chalk = require('chalk');
const fs = require('fs');
var bodyParser = require('body-parser');


var options = {
    key  : fs.readFileSync('cert.private.pem'),
    cert : fs.readFileSync('cert.public.pem')
};

const app = express();
const server = https.createServer(options, app);
const io = require('socket.io').listen(server);

const imagePath = './sources/64x64';

let currentImageSrc = null;

io.on('connection', function(socket){
	console.log('a user connected');

	io.emit('changeImageSrc', currentImageSrc);

	socket.on('disconnect', function(){
		console.log('user disconnected');
	});

	socket.on('changeImageSrc', function(src){
		console.log('changeImageSrc: ' + src);
		currentImageSrc = src;
		io.emit('changeImageSrc', src);
	});
});

app.use(express.static(imagePath));
app.use(express.static('./public/'));

app.use(bodyParser.urlencoded({ extended: false }));

app.get('/get-images', function (req, res) {
	var files = fs.readdirSync(imagePath);
	res.send(files);
});

app.post('/api/nearby', function(req, res) {
    console.log(req.body);
    res.json({ message: 'Stern er en stjerne', recived: req.body });
});

server.listen(9999, function () {
	console.log('LED Wall app listening on port 9999!');
});