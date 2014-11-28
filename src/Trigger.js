var Trigger = function() {

	var t = {};

	var listeners = [];
	var lock = false;

	var lateTriggers = [];
	var lateRemovals = [];

	t.on = function (callback) {
		listeners.push(callback);
	};

	t.off = function (callback) {
		var i = listeners.indexOf(callback);

		if(i == -1) return;

		if(lock) {
			lateRemovals.push({ callback: callback });
			return;
		}

		listeners.splice(i, 1);
	};

	t.trigger = function (data) {

		if(lock) {
			lateTriggers.push({ data: data });
			return;
		}

		lock = true;

		var i = 0, nl = listeners.length;
		while(i < nl) {
			var f = listeners[i];
			f(data);
			i++;
		}
		
		lock = false;

		var d;
		while(d = lateTriggers.shift()) t.trigger(d.data);
		while(d = lateRemovals.shift()) t.off(d.callback);
	};

	return t;

};