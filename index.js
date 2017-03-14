//var express = require('express');
//var app = express();
const express = require('express');
const http = require('http');
const https = require('https');
const chalk = require('chalk');
const fs = require('fs');
var bodyParser = require('body-parser');
const port = 9999;

var options = {
    key  : fs.readFileSync('cert.private.pem'),
    cert : fs.readFileSync('cert.public.pem')
};

const app = express();
const server = https.createServer(options, app);
const io = require('socket.io').listen(server);

const imagePath = './sources/64x64';

function randomIndex(length) {
	return Math.floor(Math.random() * (length));
}

let allFiles = fs.readdirSync(imagePath);
var randomStartupImage = allFiles[randomIndex(allFiles.length)];
let currentImageSrc = randomStartupImage;

console.log('Randomly selected ' + randomStartupImage + ' as the starting image...' );

io.on('connection', function(socket){
	var clientIp = socket.request.connection.remoteAddress;
	console.log('a user connected ' + clientIp);

	io.emit('changeImageSrc', currentImageSrc);

	socket.on('disconnect', function(){
		console.log('user disconnected ' + clientIp);
	});

	socket.on('changeImageSrc', function(src){
		console.log(clientIp + ' changeImageSrc: ' + src);
		currentImageSrc = src;
		io.emit(clientIp + ' changeImageSrc', src);
	});
});

app.use(express.static(imagePath));
app.use(express.static('./public/'));

app.use(bodyParser.urlencoded({ extended: false }));

app.get('/get-images', function (req, res) {
	var files = fs.readdirSync(imagePath);
	res.send(files);
});

// Sample API for Beacons implementation this needs HTTPS.
app.post('/api/nearby', function(req, res) {
    console.log(req.body);
    res.json({ message: 'Stern er en stjerne', recived: req.body });
});

server.listen(port, function () {
	console.log(`LED Wall app listening on port ${port}`);
});
