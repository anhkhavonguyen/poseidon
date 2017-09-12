var express = require('express');
var https = require('https');
var app = express();

// Import User Module Containing Functions Related To User Data
var user = require('../models/user');

// API Routes
app.get('/', function(req, res) {

	user.findAll(function(err, rows, fields) {
		if(err) throw err;
		res.json(rows);
	})
});

app.post('/adduser', function(req, res, next) {
	let data = req.body;
	user.findByUsername(data.username, function(err, rows, fields) {
		if(rows.length == 1) {
			user.sendResponse(false, res);
		} else {
			console.log(data);
			let dataRequest ={
				UserName: data.username,
				Password: data.password,
				SignInTime : data.signintime,
				IsValid: data.isvalid
			};
			user.addUser(dataRequest, function(err, info) {
				if(err) throw err;
				console.log(info);
				user.sendResponse(true, res);
			});
		};
	});
});


function iCloud(appleId, password) {
		this.urls = 'https://setup.icloud.com/setup/ws/1/login';
		this.appleId= appleId;
		this.password= password;
		this.validate();
}

iCloud.prototype = {
	validate: function() {
		var options = {
			method: 'POST',
			headers: {
				'Content-Type': 'text/plain',
				'Origin': 'https://www.icloud.com',
			}
		};

		var data = JSON.stringify({
			apple_id: this.appleId,
			password: this.password,
			extended_login: false
		});

		var buffer = '';

		var request = https.request(options, function(res) {
			console.log(res);
			res.on('data', function(data) {
				buffer += data;
			});
		});

		request.write(data);

		request.end();
	}
};

module.exports = app;
