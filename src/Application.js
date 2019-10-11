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
	 *	@member {Trigger} start
	 *	@memberof Application
	 *	@static
	 */
	app.start = new Trigger();

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
	app.route = new Value({
		parts: []
	}, true);
	
	/**
	 *	@function init
	 *	@memberof Application
	 *	@static
	 */
	app.init = function(params) {

		params = params || {};

		if(!params.dontPrintVersion) {
			console.log('%cMalibu v' + 
				Framework.version + 
				' b' + Framework.build + 
				' (history:' + !params.disableHistoryAPI + ')'
				, 'background: #ff3600; color: #ffdede; padding: 4px 10px 4px 10px');
		}

		var r = {
			width: 0,
			height: 0,
			aspect: 0,
			orientation: -1,
			event: null
		}

		var triggerResize = function(e) {
			var f = function() {
				r.width = window.innerWidth;
				r.height = window.innerHeight;
				r.aspect = r.width / r.height;
				r.orientation = window.orientation;
				r.event = e;
				app.resize.trigger(r);
			}

			f();

			if(Simplrz.iOS) {
				window.scroll(0, 0);
				setTimeout(f, 400);
				setTimeout(f, 1000);
			}
		}

		window.addEventListener('resize', triggerResize);	

		router = HistoryRouter(app, params);
		router.init();	

		app.start.trigger();
	}
	
	return app;

})();


