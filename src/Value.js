/**
 *	@class Value
 *
 *	@description <p>Value is an object that hold a property. 
 *
 *	<p>Properties are great to keep track of the state of on object. 
 *	For example "how many times the spaceship has been hit" or 
 *	"what is the current section on a website" or a lot of other things.
 *
 *	<p>A simple property can do the job well, example: "spaceship.numHits" is a number
 *	that increases each time the spacehip has been hit by enemy lasers. 
 *	
 *	<p>Usually there will be several objects in each application that will need 
 *	to do something whenever this value changes. To make this possible each of those
 *	objects would need to implement some sort of loop or timer and check the value of
 *	this property at regular intervals.
 *
 *	<p>This is where the Value object comes in handy. It keeps the value of the property
 *	in it's own property (called 'value') but, using the object observer pattern, 
 *	each time this value changes, it will send out a notification to every
 *	registered listener.
 *
 *	<p>The Value object works best with primitive values, especially Numbers. 
 *	But it can hold any object as value.
 *
 *	@param {Object} v - the initial value to set
 *
 *	@example

// sets the value to 1
var health = new Value(1);

health.on(function(current, last) {
	console.log('The value of health is', current);
	console.log('The previous value was', last);
	console.log('Current value can also be accessed from', health.value);
});

// value changed, the listener will be invoked
health.value = 2;

// value stays the same, the listener won't be invoked
health.value = 2;

 */

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

	/**
	 *	@method on
	 *	@memberof Value.prototype
	 *
	 *	@param {Function} callback - the callback to invoke whenever the value changes. 
	 *	The callback function will receive up to 3 arguments. First is the current value, 
	 *	second is the last value (if there was any, null otherwise). Third is a custom param (see below).
	 *
	 *	@param {Function} test - a test function to check if value changed. If the value is a Object, 
	 *	some of it's properties might chnage and this function allows to inject the logic that will
	 *	decide whether the entire value should be considered "chnaged" or not. See example below.
	 *
	 *	@param {Object} param - a parameter to pass to the callback on each change. It will be passed as 3rd parameter.
	 *
	 *	@param {Boolean=} noInitCallback - if this is set explicitely to true, the callback will not be invoked immediately
	 *	on registration. Otherwise the callback is always called immediately, so that any state can be adjusted to the current
	 *	value.
	 *
	 *	@description sets the value property of thie Value to whatever is passed as parameter. 
	 *	Same as saying <code>someValue.value = v;</code> but this method can be useful when chaining. 
	 */
	that.on = function(callback, test, param, noInitCallback) {
		var o = callback;
		o.test = test;
		o.param = param;

		// Fire the callback initially so that all values/flags of the subscriber can be adjusted at startup
		if(!noInitCallback && (!o.test || o.test(value, last))) o(value, last, param);

		observers.push(o);
		return o;
	}


	/**
	 *	@method threshold
	 *	@memberof Value.prototype
	 *
	 *	@param {Number} min - the low value of the range of the threshold. It can be null, in this case there won't be a low value to the threshold.
	 *	@param {Number} max - the high value of the range of the threshold. It can be null, in this case there won't be a high value to the threshold.
	 *
	 *	@description Similar to on, but the callback will only be invoked when the value crosses a certain threshold and it's value is within a range.
	 */
	that.threshold = function(callback, min, max, param, noInitCallback) {
	
		var test;

		if(min != null && max != null) {
			test = function(c, l) { return (c >= min && l < min) || (c < max && l >= max); }
			if(_value >= min && _value < max && !noInitCallback) callback(_value);
		} else if(min != null && max == null) {
			test = function(c, l) { return (c >= min && l < min); }
			if(_value >= min && !noInitCallback) callback(_value);
		} else if(min == null && max != null) {
			test = function(c, l) { return (c < max && l >= max); }
			if(_value < max && !noInitCallback) callback(_value);
		}

		

		return that.on(callback, test, param, true);
	}

	/**
	 *	@method off
	 *	@memberof Value.prototype
	 *	@param {Function} callback - the callback that was originally passed to <code>on</code>.
	 *	@description Removes the callback from the list of listeners for this value.
	 */
	that.off = function(callback) {
		var i = observers.indexOf(callback);
		if(i > -1) observers.splice(i, 1);
	}

	/**
	 *	@method range
	 *	@memberof Value.prototype
	 *	@param {Number} _min - minimum value (inclusive)
	 *	@param {Number} _max - minimum value (inclusive)
	 *	@param {Number} _wrap - if true if value goes over max or below min it will be wrapped, otherwise it will clamped to min, max.
	 *
	 *	@description This method allows to add minumim and maximum allowed value to the Value object. Mostly useful for numbers, if
	 *	we need to make sure the value will not go over a certain threshold.
	 */
	that.range = function(_min, _max, _wrap) {
		min = _min;
		max = _max;
		wrap = _wrap;
		return that;
	}

	/**
	 *	@method set
	 *	@memberof Value.prototype
	 *	@param {Object} v
	 *	@description sets the value property of thie Value to whatever is passed as parameter. 
	 *	Same as saying <code>someValue.value = v;</code> but this method can be useful when chaining.
	 */
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

