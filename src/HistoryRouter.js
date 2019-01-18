/**
 *	@class HistoryRouter
 *
 *	@description <p>A router that handles browser/app history. 
 *	Works with either the History API or just internally within the app.</p>
 *	<p>In most cases - NOT TO BE used directly, it is used internally by {@link Application} instead.</p>
 */
var HistoryRouter = function (app, params) {

	var disableHistoryAPI = (params && params.disableHistoryAPI) || !Simplrz.history;

	var rootUrl = document.location.protocol + '//' + (document.location.hostname || document.location.host);
	if(document.location.port) rootUrl += ":" + document.location.port;
	app.navigate = new Trigger();
	app.hijackLinks = new Trigger();

	Application.history = [];

	var setBase = function() {
		var base = document.querySelector('base');
		base = (base && base.getAttribute('href')) ? base.getAttribute('href') : '/';

		// In case base href is a full URL with protocol & domain
		// - this gets just the part we need
		var prs = document.createElement('a');
		prs.href = base;
		base = prs.pathname;

		if(base == '/') base = '';
		if(base[base.length-1] == '/') base = base.substring(0, base.length - 1);
		app.baseUrl = base;
	}

	var hijackLinks = function (element) {
		var allLinksSelector = 'a[href]';
		var allLinks = (element || document).querySelectorAll(allLinksSelector);
		
		allLinks = Array.prototype.slice.call(allLinks);

		if(element && element.nodeName.toLowerCase() == "a") {
			allLinks.unshift(element);	
		}

		for (var i = 0; i < allLinks.length; i++) {
			var link = allLinks[i];

			var url = link.getAttribute('href');
			var target = link.getAttribute('target');
			var hj = link.getAttribute('data-hj');

			if(url == null || url.indexOf(':') > -1 || target == '_blank' || hj == "no") {
				// Skip absolute URLs, those that have no URL, a _blank target 
				// and those that are explicitely set to not be hijacked
				// (this is done by adding an attribute like this: data-hj='no')
				continue;
			}
			
			if (!link.hijacked) {
				link.hijacked = true;

				link.originalHref = link.getAttribute('href') || "";
				link.hijackedHref = app.baseUrl + "/" + link.originalHref;

				if(link.hijackedHref.indexOf('//') == 0) link.hijackedHref = link.hijackedHref.substring(1); 
				// normalize the URL, so it doesn't start with double slashes

				var cb = function (e) {
					if(e) e.preventDefault();
					app.navigate.trigger(this.hijackedHref);
				}

				link.removeHijack = (function() {
					var l = link;
					return function() {
						l.removeEventListener('click', cb);
						l.hijacked = false;
					}
				})();

				link.hijackCallback = cb;
				link.addEventListener('click', cb);
			}
		}
	};

	var notify = function(href) {

		var r = {};

		if(disableHistoryAPI)  {

			r.route = href || '';
			
		} else {

			var qs = document.location.href.indexOf('?');
			var hs = document.location.href.indexOf('#');

			var route = document.location.href;

			if(qs > -1) route = route.substring(0, qs);
			if(hs > -1) route = route.substring(0, hs);
			r.route = route.substring(rootUrl.length + 1 + app.baseUrl.length);			

		}

		r.parts = r.route.split('/');

		// Get rid of all trailing stuff
		while(r.parts[0] == '') r.parts.shift();
		while(r.parts[r.parts.length - 1] == '') r.parts.pop();

		r.lastPart = r.parts[r.parts.length - 1];

		if(r.route == app.route.value.route) return;
		Application.history.push(r);
		app.route.value = r;
	}

	if(!disableHistoryAPI) {
		window.addEventListener('popstate', function(e) {
			notify();
		});
	}

	app.hijackLinks.on(hijackLinks);

	var navCond;

	// https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onbeforeunload
	var bu = function(e) {
		var m = navCond();
		e.returnValue = m;
		return m;
	}

	app.setNavigateCondition = function(c) {
		navCond = c;
		window.addEventListener('beforeunload', bu);
	}

	app.clearNavigateCondition = function() {
		window.removeEventListener('beforeunload', bu);
		navCond = null;
	}

	window.addEventListener('popstate', function(e) {
		if(navCond) {
			window.removeEventListener('beforeunload', bu);
			navCond = null;
		}
	}, false);

	app.navigate.on(function(href) {

		var n = function() {
			history.pushState(null, null, href);
			notify();
		}

		if(navCond) navCond(n, href);
		else n();
	});

	return {

		init: function () {
			setBase();
			if (!disableHistoryAPI) {
				notify();
			} else {
				var home, qs = document.location.search;

				if(params && params.home) home = params.home;

				if(qs.indexOf('=') > -1) {
					var aq = qs.substring(1).split('&');
					aq.forEach(function(q) {
						if(q.indexOf('id=') > -1) {
							home = q.split('=')[1];
						}
					});
				} else if(qs) {
					home = qs.substring(1);
				}

				// console.log('home', qs, home);

				notify(home || '');
			}
		}
	}
};