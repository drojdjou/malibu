/*
 *	Also read this http://www.html5rocks.com/en/tutorials/es7/observe/
 */
var Value = function(_value) {

	var that = this, 
		value = _value, 
		last = null;
	
	var min = null, max = null, wrap = false;

	var observers = [];

	that.observers = function() {
		return observers;
	}


	that.on = function(callback, test, param) {
		callback.test = test;
		callback.param = param;
		observers.push(callback);
		return callback;
	}

	that.off = function(callback) {
		var i = observers.indexOf(callback);
		if(i > -1) observers.splice(i, 1);
	}

	that.range = function(_min, _max, _wrap) {
		min = _min;
		max = _max;
		wrap = _wrap;
		return that;
	}

	// For chaining
	that.set = function(v) {
		that.value = v;
		return that;
	}

	var changed = function() {
		var o;
		for(var i = 0, n = observers.length; i < n; i++) {
			o = observers[i];
			if(!o.test || o.test(value, last)) {
				o(value, last, o.param);
			}
		}
	}

	Object.defineProperty(this, 'value', {

		get: function() { 
			return value; 
		},

		set: function(n) { 
			if(min != null && max != null) {
				if(n < min) {
					wrap ? n = n % (max+1) : n = min;
					if(wrap) while(n < min) n += (max+1);
				}

				if(n > max) {
					wrap ? n = n % (max+1) : n = max;
					if(wrap) while(n < min) n += (max+1);
				}
			}

			if(n == value) return;

			last = value;
			value = n; 
			changed();
			// setTimeout(changed, 0);
		}

	});

	Object.defineProperty(this, 'last', {
		get: function() { 
			return last; 
		},
	});

}

