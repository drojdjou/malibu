/**
 *	@namespace Loader
 *
 *	@description A very (very) simple AJAX loader.
 */
var Loader = {

	error: new Trigger(),

	/**
	 *	@method loadText
	 *	@memberof Loader
	 *	@static
	 *
	 *	@description Loads a text file through AJAX
	 *
	 *	@param {string} path - the path to the file, absolute or relative
	 *	@param {Function} onLoadedFunc - callback for when the file is loaded. The contents of the file in JS object format will be passed to this callback as argument.
	 *	@param {FormData} formData - data to be sent via POST
	 *	@param {Function} progressCallback - callback for loading progress
	 *	@param {boolean} withCredentials - defaults to true
	 */
	loadText: function(path, onLoadedFunc, formData, progressCallback, withCredentials){

		var request = new XMLHttpRequest();
		request.open(formData ? "POST" : "GET", path, true);
		request.withCredentials = withCredentials === null ? true : false;

		request.addEventListener('readystatechange', function(e) {
			if (this.readyState == 4) {

				if(!this.responseText) {
					console.error("Empty response from " + path);
					return;
				}

				if(this.status >= 400) {
					// console.error("Loader error " + this.status);
					Loader.error.trigger({ path: path, error: e });
					return;
				}
				
				onLoadedFunc(request.responseText);
			}
		});

		request.addEventListener("error", function(e) {
			Loader.error.trigger({ path: path, error: e });
		})

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
	 *	@param {FormData} formData - data to be sent via POST
	 *	@param {Function} progressCallback - callback for loading progress
	 *	@param {boolean} withCredentials - defaults to true
	 */
	loadJSON: function(path, onLoadedFunc, formData, progressCallback, withCredentials){
		Loader.loadText(path, function(text) {
			// try {
			onLoadedFunc(JSON.parse(text));
			// } catch(e) {
			// 	if(Loader.onError) Loader.onError(e);
			// 	else console.error(e);
			// }
		}, formData, progressCallback, withCredentials);
	}
};








