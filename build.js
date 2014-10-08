var fs = require('fs');
var UglifyJS = require("uglify-js");

var version = require("./version.json");

var frameworkOut = "malibu.js";
var frameworkOutMin = "malibu.min.js";

var baseUrl = "src/";

var frameworkFiles = {
	include: [
		"Version",
		"Simplrz",
		"Events",
		"Application",

		"domExtend/DomExtend",
		"domExtend/State",
		"domExtend/Transform",
		"domExtend/Transition",

		"FrameImpulse",
		"HistoryRouter",
		"Loader",
		"MSG",
		"VirtualScroll",
		"Pointer",
		"Util"
	]
};

var updateVersion = function() {
	version.build++;
	version.date = new Date();

	var jsHeader = "/** DO NOT EDIT. Updated from version.json **/\nvar Framework = ";

	fs.writeFileSync("./version.json", JSON.stringify(version));
	fs.writeFileSync(baseUrl  + "Version.js", jsHeader + JSON.stringify(version));
}

var minify = function(set) {
	var includes = [];

	for(var i = 0; i < set.include.length; i++) {
		includes.push(baseUrl + set.include[i] + ".js");
	}

	var result = UglifyJS.minify(includes);

	return result.code;
}

var concat = function(set) {
	var concatFile = "";

	for(var i = 0; i < set.include.length; i++) {
		var f = baseUrl + set.include[i] + ".js";

		concatFile += "/* --- --- [" + set.include[i] + "] --- --- */\n\n";
		concatFile += fs.readFileSync(f);
		concatFile += "\n\n";
	}

	return concatFile;
}

updateVersion();

console.log("Compressing javascript. Framework " + version.version + " build " + version.build);

var minifiedFramework = minify(frameworkFiles, false);
var concatenatedFramework = concat(frameworkFiles, false);

fs.writeFileSync(frameworkOut, concatenatedFramework);
fs.writeFileSync(frameworkOutMin, minifiedFramework);

console.log("...done!");







