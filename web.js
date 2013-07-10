var express = require('express');

var app = express.createServer(express.logger());

app.get('/', function(request, response) {
	writeFile('index.html', response);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});

/*
 * Function to output the file 
 */
function writeFile(fileName, response) {
	var fs = require('fs');
	
	
	fs.readFile(fileName, function (err, data) {
		if (err) throw err;
		response.send(data.toString("utf-8"));
	});
}