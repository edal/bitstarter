#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var http = require('http');
var url = require('url');
var request = require('request');

var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var assertURLisValid = function(urele) {
	request(urele, function(err, resp, body){
		if (err) {
			console.log("%s is a invalid URL. Exiting.", urele);
        	process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
		}
		

	});

	return urele;
}




var checkHtmlFile = function(htmlFile, validator) {
	fs.readFile(htmlFile, function(err, data) {
		if (err) throw err;
		validator(data);	
	});
}

var checkHtmlUrl = function(urele, validator) {
	request(urele, function(err, resp, body){
		if (err) throw err;
		validator(body);	

	});
}


var validateHtml = function(body, checksfile, callback) {
	$ = cheerio.load(body);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    callback(out);
	
}
var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var processOutput = function(data) {
	var outJson = JSON.stringify(data, null, 4);
    console.log(outJson);
}

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-u, --url <url>', 'URL to index.html', clone(assertURLisValid), null)
        .parse(process.argv);

        var checkJson = null;
        
        if (null != program.url) {
		    checkHtmlUrl(program.url, function(body) { validateHtml(body, program.checks, processOutput); });
        } else {
		    checkHtmlFile(program.file, function(body) { validateHtml(body, program.checks, processOutput); }); 
        } 

} else {
    exports.checkHtmlFile = checkHtmlFile;
}