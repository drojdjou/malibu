Application = (function() {

	var app = {};
	var router, broadcast;

	app.resize = new Trigger();
	app.route = new Value();
	
	app.init = function(params) {

		params = params || {};

		if(!params.disableHistory) {
			router = HistoryRouter(app, params.disableHistory);
			router.init();
		}

		window.addEventListener('resize', function(e) {
			app.resize.trigger(e);
		});

		window.addEventListener('orientationchange', function(e) {
			app.resize.trigger(e);
		});

		console.log('Malibu v' + 
			Framework.version + 
			' b' + Framework.build + 
			' (history:' + !params.disableHistory + ')');
	}
	
	return app;

})();


