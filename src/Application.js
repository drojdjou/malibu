Application = (function(window) {

	var app = Events({}, true);
	var router, broadcast;

	app.init = function(params) {

		params = params || {};

		if(params.disableHistory) {
			router = HistoryRouter(app);
			router.init();
		}

		window.addEventListener('resize', function(e) {
			app.trigger(MSG.RESIZE, e);
		});

		window.addEventListener('orientationchange', function(e) {
			app.trigger(MSG.RESIZE, e);
		});

		console.log('Malibu v' + 
			Framework.version + 
			' b' + Framework.build + 
			' (history:' + !params.disableHistory + ')');
	}
	
	return app;

})(window);


