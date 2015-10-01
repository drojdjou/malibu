/**
 *	@namespace Application
 */
var Application = (function() {

	var app = {};
	var router;

	/**
	 *	@member {Object} flags
	 *	@memberof Application
	 *	@static
	 */	
	app.flags = {};

	var fs = document.location.search.substring(1).split('&');
	fs.forEach(function(f) {
		var ff = f.split('=');
		app.flags[ff[0]] = parseFloat(ff[1]);
	});

	/**
	 *	@member {Trigger} resize
	 *	@memberof Application
	 *	@static
	 */
	app.resize = new Trigger();

	/**
	 *	@member {Value} route
	 *	@memberof Application
	 *	@static
	 */
	app.route = new Value();
	
	/**
	 *	@function init
	 *	@memberof Application
	 *	@static
	 */
	app.init = function(params) {

		params = params || {};

		router = HistoryRouter(app, params);
		router.init();

		window.addEventListener('resize', function(e) {
			app.resize.trigger(e);
		});

		window.addEventListener('orientationchange', function(e) {
			app.resize.trigger(e);
		});

		console.log('Malibu v' + 
			Framework.version + 
			' b' + Framework.build + 
			' (history:' + !params.disableHistoryAPI + ')');
	}
	
	return app;

})();


