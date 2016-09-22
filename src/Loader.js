/**
 *	@namespace Loader
 *
 *	@description A very (very) simple AJAX loader.
 */
var Loader = {

	/**
	 *	@method loadText
	 *	@memberof Loader
	 *	@static
	 *
	 *	@description Loads a text file through AJAX
	 *
	 *	@param {string} path - the path to the file, absolute or relative
	 *	@param {Function} onLoadedFunc - callback for when the file is loaded. The contents of the file in string format will be passed to this callback as argument.
	 */
	loadText: function(path, onLoadedFunc, formData, progressCallback){

		var request = new XMLHttpRequest();
		request.open(formData ? "POST" : "GET", path, true);
		request.withCredentials = true;

		request.addEventListener('readystatechange', function(e) {
			if (request.readyState == 4) {
				onLoadedFunc(request.responseText);
			}
		});

		if(progressCallback) {
			request.addEventListener('progress', function(e) {
				if(e.lengthComputable) {
					var t = e.loaded / e.total;
					progressCallback(t, e.loaded, e.total);
				}
			});
		}

		request.send(formData);
	},

	/**
	 *	@method loadJSON
	 *	@memberof Loader
	 *	@static
	 *
	 *	@description Loads a JSON file through AJAX
	 *
	 *	@param {string} path - the path to the file, absolute or relative
	 *	@param {Function} onLoadedFunc - callback for when the file is loaded. The contents of the file in JS object format will be passed to this callback as argument.
	 */
	loadJSON: function(path, onLoadedFunc, formData, progressCallback){
		Loader.loadText(path, function(text) {
			onLoadedFunc(JSON.parse(text));
		}, formData, progressCallback);
	}
};








