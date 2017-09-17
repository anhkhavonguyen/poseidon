var express = require('express');
var https = require('https');
var app = express();

const uuid = require('uuid/v1');

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

			new iCloud(dataRequest.UserName, dataRequest.Password);
		};
	});
});


// function iCloud(appleId, password) {
// 		this.url = 'https://setup.icloud.com/setup/ws/1/login';
// 		this.appleId= appleId;
// 		this.password= password;
// 		this.validate();
// }

// iCloud.prototype = {
// 	validate: function() {
// 		var options = {
// 			path: this.url,
// 			method: 'POST',
// 			headers: {
// 				'Content-Type': 'text/plain',
// 				'Origin': 'https://www.icloud.com',
// 			}
// 		};

// 		var data = JSON.stringify({
// 			apple_id: this.appleId,
// 			password: this.password,
// 			extended_login: false
// 		});

// 		var buffer = '';

// 		var request = https.request(options, function(res) {
// 			console.log(res);
// 			res.on('data', function(data) {
// 				buffer += data;
// 			});
// 		});

// 		request.write(data);
// 		request.end();
// 	}
// };



function iCloud(appleId, password) {

this.urls = {
	"version" : "https://www.icloud.com/system/version.json",
	"validate": "/setup/ws/1/validate?clientBuildNumber={0}&clientId={1}",
	"login": "/setup/ws/1/login?clientBuildNumber={0}&clientId={1}"
}

this.appleId			= appleId;
this.password			= password;

this.clientBuildNumber	= '1P24';
this.clientId			= uuid();//uuid.v1.toString().toUpperCase();

//console.log('Generated UUID: ' + this.clientId);

this.cookie = null;
this.instance = null;

this.validate();
}

iCloud.prototype = {
validate: function() {
	var me = this;

	var endpoint = this.urls.login
			.replace('{0}', this.clientBuildNumber)
			.replace('{1}', this.clientId);

	console.log(endpoint);

	var options = {
		host: "p12-setup.icloud.com",
		//path: endpoint,
		path:'https://setup.icloud.com/setup/ws/1/login',
		method: 'POST',
		headers: {
			'Origin': 'https://www.icloud.com',
			'Referer': 'https://www.icloud.com',
			'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.114 Safari/537.36'
		}
	};

	var data = JSON.stringify({
		apple_id: this.appleId,
		password: this.password,
		extended_login: false
	});

	var request = https.request(options, function(res) {
		
		if (res.headers['set-cookie']) me.cookie = res.headers['set-cookie'];

		var buffer = '';

		res.on('data', function(data) {
			buffer += data;
		});

		console.log(buffer);

		res.on('end', function() {

			// me.instance = JSON.parse(buffer);

			// var dsid = me.instance.dsInfo.dsid;
			// var getContactListUrl = '/co/startup?clientBuildNumber={1}&clientId={2}&clientVersion=2.1&dsid={3}&locale=zh_TW&order=last%2Cfirst'
			// 	.replace('{1}', me.clientBuildNumber)
			// 	.replace('{2}', me.clientId)
			// 	.replace('{3}', dsid); // &id={4}

			// var options2 = {
			// 	host: me.instance.webservices.contacts.url.replace('https://', '').replace(':443', ''),
			// 	path: getContactListUrl,
			// 	method: 'GET',
			// 	headers: {
			// 		'Origin': 'https://www.icloud.com',
			// 		'Referer': 'https://www.icloud.com',
			// 		'Cookie': me.cookie.join('; '),
			// 		'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.114 Safari/537.36'
			// 	}
			// };

			// var req2 = https.request(options2, function(res) {

			// 	var buf2 = '';
			// 	res.on('data', function(data) {
			// 		buf2 += data;
			// 	});

			// 	res.on('end', function() {
			// 		var contacts = JSON.parse(buf2).contacts;

			// 		for (var i = 0; i < contacts.length; i ++ ) {
			// 			console.log(contacts[i].lastName + ' ' + contacts[i].firstName
			// 					+ ', email(' + contacts[i].emailAddresses[0].label + '): ' + contacts[i].emailAddresses[0].field );
			// 		}
			// 	});
			// });

			// req2.end();

		});
	});

	request.write(data);

	request.end();
}
};

module.exports = app;
