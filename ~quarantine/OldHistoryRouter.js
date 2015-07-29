import Trigger from "./Trigger";
import Simplrz from "./Simplrz";
import Util from "./Util";

export default function (app) {

	var rootUrl = document.location.protocol + '//' + (document.location.hostname || document.location.host);
	if(document.location.port) rootUrl += ":" + document.location.port;
	app.navigate = new Trigger();
	app.hijackLinks = new Trigger();

	var routeHistory = [];
	app.historyBack = new Trigger();

	var hijackLinks = function (element) {
		if (!Simplrz.history) return;

		var base = document.querySelector('base');
		base = (base && base.getAttribute('href')) ? base.getAttribute('href') : '/';

		window.TMR_BASE_URL = base;

		if(base == '/') base = '';
		if(base[base.length-1] == '/') base = base.substring(0, base.length - 1);

		app.baseUrl = base;

		var allLinksSelector = 'a[href]';
		var allLinks = (element || document).querySelectorAll(allLinksSelector);
		// Why, oh why do we need to do this :)
		allLinks = Array.prototype.slice.call(allLinks);

		for (var i = 0; i < allLinks.length; i++) {
			var link = allLinks[i];

			var url = link.getAttribute('href');
			var target = link.getAttribute('target');
			var hj = link.getAttribute('data-hj');

			if(url.indexOf(':') > -1 || target == '_blank' || hj == "no") {
				// Skip absolute URLs, those that have a _blank target 
				// and those that are explicitely set to not be hijacked
				// (this is done by adding an attribute like this: data-hj='no')

				// console.log('HistoryRouter.hijackLinks: skipping', url);
				continue;
			}
			
			if (!link.hijacked) {
				link.hijacked = true;
				// link.href = base + link.href;

				link.hijackedHref = base + link.getAttribute('href');

				var cb = function (e) {
					if(e) e.preventDefault();
					pushState(this.hijackedHref);
				}

				if(Simplrz.touch) {
					Util.handleTap(link, cb);
				} else {
					link.addEventListener('click', cb);
				}
			}
		}
	};

	var notify = function() {
		var qs = document.location.href.indexOf('?');
		var route = document.location.href;
		if(qs > -1) route = route.substring(0, qs);

		var r = {};

		r.route = route.substring(rootUrl.length + 1 + app.baseUrl.length);
		r.parts = r.route.split('/');

		// Get rid of all trailing stuff
		while(r.parts[0] == '') r.parts.shift();
		while(r.parts[r.parts.length - 1] == '') r.parts.pop();

		r.parts.forEach((p, i) => {
			r.parts[i] = Util.dealias(p);
		});

		if(r.parts.length == 0) r.parts.push('home');

		r.lastPart = r.parts[r.parts.length - 1];
		r.route = r.parts.join('/');


		routeHistory.push(r);
		app.route.value = r;
	}

	var pushState = function (href) {
		if (Simplrz.history) history.pushState(null, null, href);
		notify();
	};

	window.addEventListener('popstate', function(e) {
		notify();
	});

	app.hijackLinks.on(hijackLinks);
	app.navigate.on(pushState);
	app.historyBack.on(function(defaultHref) {
		var h = defaultHref;

		var rl = routeHistory.length;
		if(rl >= 2) {
			var p = routeHistory[routeHistory.length - 2];
			if(p.route.indexOf('explore') > -1) pushState(p.route);
			else pushState(h);
		} else {
			pushState(h);
		}
	})

	return {

		init: function () {
			hijackLinks();
			notify();
		}
	}
};