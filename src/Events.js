Events = function (obj) {

	var events = obj || {}; 

	var listeners = {}, contexts = {};
	var lock = false;

	var lateTriggers = [];
	var lateRemovals = [];

	events.on = function (event, callback, context) {
		if(!listeners[event]) listeners[event] = [];
		listeners[event].push(callback);
		if(context) contexts[callback] = context;
	};

	events.off = function (event, callback) {
		if(listeners[event]) {
			var i = listeners[event].indexOf(callback);

			if(i == -1) return;

			if(lock) {
				lateRemovals.push({ event: event, callback: callback });
				return;
			}

			listeners[event].splice(i, 1);
		}
	};

	events.offAll = function(event) {
		if(listeners[event]) listeners[event].length = 0;
	};

	events.trigger = function (event, data) {

		if(listeners[event]) {

			if(lock) {
				lateTriggers.push({ event: event, data: data });
				return;
			}

			lock = true;

			var i = 0, nl = listeners[event].length;
			while(i < nl) {
				var f = listeners[event][i];
				f.call(contexts[f], data);
				i++;
			}
			
			lock = false
		}

		var d;
		while(d = lateTriggers.shift()) events.trigger(d.event, d.data);
		while(d = lateRemovals.shift()) events.off(d.event, d.callback);
	};

	return events;

};