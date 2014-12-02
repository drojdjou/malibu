/* --- --- [Version] --- --- */

/** DO NOT EDIT. Updated from version.json **/
var Framework = {"version":"3","build":4,"date":"2014-12-02T01:51:32.035Z"}

/* --- --- [Simplrz] --- --- */

window.Simplrz = (function() {

	var s = {}, classes = ['js']; // Add 'js' class by default (bc if this code runs, JS is enabled, right?)

	var check = function(feature, test) {
		var result = test();
		s[feature] = (result) ? true : false;
		classes.push( (result) ? feature : "no-" + feature );

		document.documentElement.setAttribute("class", classes.join(" "));
	}

	s.pixelRatio = window.devicePixelRatio || 1;

	var prefix = (function () {

		var styles = "", pre = "", dom = "";

		if(window.getComputedStyle) {
			styles = window.getComputedStyle(document.documentElement, '');
			pre = (Array.prototype.slice.call(styles).join('').match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o']))[1];
			dom = ('WebKit|Moz|MS|O').match(new RegExp('(' + pre + ')', 'i'))[1];
		}

		return {
			dom: dom,
			lowercase: pre,
			css: '-' + pre + '-',
			js: (pre == "") ? "" : pre[0].toUpperCase() + pre.substr(1)
		};
	})();

	s["prefix"] = prefix;
	classes.push(prefix.lowercase);

	s.prefixedProp = function(prop) {
		switch(prefix.lowercase) {
			case "webkit": return "webkit" + prop.charAt(0).toUpperCase() + prop.slice(1);
			case "ms": return "-ms-" + prop;
			case "moz": return "Moz" + prop.charAt(0).toUpperCase() + prop.slice(1);
			default: return prefix.css + prop;
		}
	} 

	/**
	 *	Note on detecting some CSS features:
	 *
	 *	After reading this (https://github.com/zamiang/detect-css3-3d-transform)
	 *	I realized detecting css3d transforms is unreliable. But also - we don't really need it
	 *	because typically the only browser we need to support that doesn't do css 3d transforms
	 *	is IE9 and IE8 so why not do some good old browser sniffing?
	 *
	 *	(as a reminder: IE9 - only 2d transforms, no transrion, no animarions, IE8 - not even 2d)
	 */

	var ie = (function(){
	    var v = 3, div = document.createElement('div'), all = div.getElementsByTagName('i');
	    while (
	        div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
	        all[0]
	    ) {
	    	// console.log(div.innerHTML);
	    }
	    return v > 4 ? v : null;
	})();

	// IE 10 doesn't use conditional comments anymore
	if(ie == null) {
		var p = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
		var ua = navigator.userAgent;
		var m = ua.match(p);
		ie = (m && m.length > 1) ? parseInt(m[1]) : null;
	}


	// These properties are for browser specific hack (yes, they are sometimes necessary)
	s.ie = ie || false;
	classes.push((ie) ? "ie-" + ie : "no-ie");

	s.firefox = prefix.lowercase == "moz";
	classes.push(s.firefox ? "firefox" : "no-firefox");

	s.safariDesktop = navigator.userAgent.match(/Safari/) && !navigator.userAgent.match(/Chrome/) && !('ontouchstart' in document);
	classes.push(s.safariDesktop ? "safari-desktop" : "no-safari-desktop");

	s.ipad7 = navigator.userAgent.match(/iPad;.*CPU.*OS 7_\d/i) || false;
	classes.push(s.ipad7 ? "ipad7" : "no-ipad7");

	check("css3d", function() {

		if(prefix.lowercase == 'webkit' || prefix.lowercase == 'moz') return true;

		if(prefix.lowercase == 'ms') {
			var div = document.createElement("div");
			div.style[prefix.css + "transform"] = 'translateZ(0px)';
			var cs = getComputedStyle(div);
			var a = cs.getPropertyValue(prefix.css + "transform");
			return a && a != '' && a != 'none';
		}

		return false;
	});

	check("csstransitions", function() { return !ie || ie >= 10; });

	check("cssanimations", function() { return !ie || ie >= 10; });

	check("css2d", function() { return !ie || ie >= 9; });

	check("touch", function() {
		return 'ontouchstart' in document;
	});

	check("pointer", function() {
		return (navigator.msMaxTouchPoints && navigator.msMaxTouchPoints > 1);
	});

	check("canvas", function() {
		try { 
			var canvas = document.createElement('canvas'); 
			return canvas.getContext('2d');
		} catch(e) { 
			return false; 
		}
	});

	check("history", function() {
		return !!(window.history && history.pushState);
	});


	check("webrtc", function() {
		return ('getUserMedia' in navigator || 'webkitGetUserMedia' in navigator);
	});

	check("webgl", function() {
		try { 
			var canvas = document.createElement('canvas'); 
			return !!window.WebGLRenderingContext && 
				(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
		} catch(e) { 
			return false; 
		} 
	});

	// Flash is dead anyway!
	// check("flash", function() {
	// 	return !!(
	// 		navigator.mimeTypes["application/x-shockwave-flash"] || 
	// 		window.ActiveXObject && new ActiveXObject('ShockwaveFlash.ShockwaveFlash')
	// 	);
	// });

	s.classes = classes;

	return s;

})();

/* --- --- [Trigger] --- --- */

var Trigger = function() {

	var t = {};

	var listeners = [];
	var lock = false;

	var lateTriggers = [];
	var lateRemovals = [];

	t.on = function (callback, context) {
		callback.context = context;
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
			f.call(f.context, data);
			i++;
		}
		
		lock = false;

		var d;
		while(d = lateTriggers.shift()) t.trigger(d.data);
		while(d = lateRemovals.shift()) t.off(d.callback);
	};

	return t;

};

/* --- --- [Timer] --- --- */

var Timer = function(autostart, autoupdate) {

	var that = this;
	// If frame is longer than 250ms (4 FPS) it will skip it.
	var MAX_FRAME_TIME = 250;

	var paused = false;

	this.time = 0;
	this.frame = 0;
	this.deltatime = 0;

	var startTime, elapsedTime = 0;

	var tasks = [];

	var trackTask = function(e, i) {
		if(e._time < that.time) {
			if(e._repeat != 0) {
				e.callback(e._time);

				var it = e._interval;
				if(it instanceof Array) e._time += it[0] + Math.random() * (it[1] - it[0]);
				else e._time += it;

				e._repeat--;
			} else {
				setTimeout(that.off, 0, e); // <- is it good enough?
			}
		}
	};

	var run = function() {
		requestAnimationFrame(run);
		that.update();
	}

	this.pause = function(p) {
		paused = p;
	}

	this.paused = function() {
		return paused;
	}

	/**
	 *	Start the timer manually.
	 *
	 *	If autostart was set to false or omitted in the constructor, this function needs to be invoked.	
	 */
	this.start = function() {
		startTime = new Date().getTime(), 
		elapsedTime = 0, 
		that.frame = 0;
		that.time = 0;

		if(autoupdate) run();

		return that;
	}

	/**
	 *	Update the timer.
	 *
	 *	If autoupdate was set to false or omitted in the constructor, 
	 *	this function need to be invoked in a requestAnimationFrame loop or a similar interval.
	 */
	this.update = function() {
		var t = new Date().getTime() - startTime;
		var d = t - elapsedTime;
		elapsedTime = t;

		if(d < MAX_FRAME_TIME && !paused) {
			that.time += d;
			that.frame++;
			that.deltatime = d;
		}

		tasks.forEach(trackTask);
		return that.time;
	}

	/**
	 *	Executes callback after a delay. All time values in ms.
	 *
	 *	_time - when to start (i.e. delay counted from 'now' i.e from when this method is called)
	 *	callback - the callback to be invoked
	 *
	 *	returns - an object that can be used to remove the task.
	 */
	this.onAt = function(_time, callback) {
		var so = {
			callback: callback,
			_time: that.time + _time,
			_repeat: 1
		};

		tasks.push(so);
		return so;
	}

	/**
	 *	Invokes the callback repeatedly overtime. All time values in ms.
	 * 	
	 *	_interval - how often to invoked the function. It can be an array of two elements specyfing a min/max range
	 *	_time - when to start (i.e. delay, counted from 'now' i.e from when this method is called)
	 *	callback - the callback to be invoked
	 *	_repeat - how many times to repeat. If ommited or -1 will repeat infinitely
	 *				0 will never invoke the function (in fact it won't even be added)
	 *
	 *	returns - an object that can be used to remove the task.
	 */
	this.onEvery = function(_interval, _time, callback, _repeat) {

		if(_repeat === 0) return;
		
		var so = {
			callback: callback,
			_time: that.time + _time,
			_interval: _interval,
			_repeat: _repeat || -1

		};

		tasks.push(so);
		return so;
	}

	/**
	 *	Remove a scheduled task.
	 *
	 *	DO NOT PASS the original callback to this function (you'll get a warning if you do).
	 *	Instead you need to pass the object returned from onAt or onEvery. 
	 */
	this.off = function(so) {

		if(so instanceof Function) {
			var m = 'You are probably using the callback directly to remove it.\n';
			m += 'You should use the object returned from onAt or onEvery instead.';
			console.warn(m);
			console.warn(so);
			return;
		}

		if(so == null) {
			return;
		}

		var i = tasks.indexOf(so);
		if(i > -1) {
			tasks.splice(i, 1);
			return true;
		} else {
			return false;
		}
	}

	/**
	 *	Remove all tasks scheduled using onAt or onEvery
	 */
	this.clearTasks = function() {
		tasks.length = 0;
	}

	

	if(autostart) {
		that.start();
	}
}


/* --- --- [Value] --- --- */

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



/* --- --- [Application] --- --- */

Application = (function() {

	var app = {};
	var router, broadcast;

	app.resize = new Trigger();
	app.route = new Value();
	
	app.init = function(params) {

		params = params || {};

		if(!params.disableHistory) {
			router = HistoryRouter(app);
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




/* --- --- [domExtend/DomExtend] --- --- */

var DomExtend = (function() {

	var that = {};

	that.create = function(tag) {
		var e = document.createElement(tag);
		that.extend(e);
		return e;
	};

	that.select = function(sel, element) {
		var e = (element || document).querySelector(sel);
		if(e && !e.ext) that.extend(e);
		return e;
	};

	that.selectAll = function(sel, element) {
		var es = (element || document).querySelectorAll(sel);
		var nes = es.length, r = [];
		for(var i = 0; i < nes; i++) {
			var e = es[i]
			if(!e.ext) e = that.extend(e);
			r.push(e);
		}
		return r;
	};

	that.extend = function(element) {

		if(element.ext) return;

		var ext = {};

		ext.create = function(tag) {
			return that.create(tag);
		};

		ext.select = function(sel) {
			return that.select(sel, element);
		};

		ext.selectAll = function(sel) {
			return that.selectAll(sel, element);
		};

		// Add State related functions (see State.js for details)
		if(window.State) State(ext, element);

		// Add Transform related functions (see Transform.js for details)
		if(window.Transform) Transform(ext, element);

		// Add Transition related functions (see Transition.js for details)
		if(window.Transition) Transition(ext, element); 

		// Add Animation related functions (see Transition.js for details)
		if(window.Animation) Animation(ext, element); 

		ext.element = element;
		element.ext = ext;
		return element;
	};

	that.extend(document);
	window.EXT = that;

	return that;

})();

/* --- --- [domExtend/State] --- --- */

var State = function(ext, element) {

	var cc = function(p) {
		return p.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
	}

	ext.data = {};

	ext.show = function(display) {
		element.style.display = display || "block";
	};

	ext.hide = function() {
		element.style.display = "none";
	};

	ext.visible = function() {
		return ext.readCss('display') != "none";
	};

	ext.on = function(event, callback, useCapture) {
		return element.addEventListener(event, callback, useCapture);
	};

	ext.off = function(event, callback, useCapture) {
		return element.removeEventListener(event, callback, useCapture);
	};

	ext.css = function(property, value) {
		if(typeof property == "string") {
			element.style[cc(property)] = value;
		} else {
		// assume property arg is object
			for(var p in property){
				element.style[cc(property)] = property[p];
			}
		}
	};

	ext.readCss = function(property, notCalculated) {
		return (notCalculated) ? element.style[property] : getComputedStyle(element).getPropertyValue(property);
	}

	ext.attr = function(name, value) {
		if(value != undefined) {
			element.setAttribute(name, value);
		}
		return element.getAttribute(name);
	}
};

/* --- --- [domExtend/Transform] --- --- */

var Transform = function(ext, element) {

	var force2d = false;

	var zeroRect = { width: 0, height: 0, top: 0, left: 0 };

	/**
	 *	IE10 tends to throw and "unspecified error" here, so handle
	 *	the exception and just return a zero rect to avoid further damage
	 */
	ext.rect = function() {
		try {
			return element.getBoundingClientRect();
		} catch(e) {
			console.log(e.stack);
			return zeroRect;
		}
	};

	/**
	 *	The 'else' below is because IE somehow throws an error 
	 *	when the value is set and then rect() is called immediately after
	 */
	ext.width = function(v) {
		if(v) {
			element.style.width = v + "px";
			return v;
		} else {
			return ext.rect().width;
		}
	};

	ext.height = function(v) {
		if(v) {
			element.style.height = v + "px";
			return v;
		} else {
			return ext.rect().height;
		}
	};

	ext.x = 0;
	ext.y = 0;
	ext.z = 0;

	ext.rotX = 0;
	ext.rotY = 0;
	ext.rotZ = 0;

	ext.scaleX = 1;
	ext.scaleY = 1;
	ext.scaleZ = 1;

	ext.transformToString = function(values) {
		values = values || ext;

		var t = "";

		if(values.x) t += "translateX(" + values.x + "px) ";
		if(values.y) t += "translateY(" + values.y + "px) ";
		if(Simplrz.css3d && !force2d) t += "translateZ(" + values.z + "px) ";
		
		if(values.rotX && Simplrz.css3d) t += "rotateX(" + values.rotX + "deg)  ";
		if(values.rotY && Simplrz.css3d) t += "rotateY(" + values.rotY + "deg)";
		if(values.rotZ && Simplrz.css3d) t += "rotateZ(" + values.rotZ + "deg) ";
		else if(values.rotZ) t += "rotate(" + values.rotZ + "deg) ";
		
		if(values.scaleX != 1) t += "scaleX(" + values.scaleX + ") ";
		if(values.scaleY != 1) t += "scaleY(" + values.scaleY + ") ";
		if(values.scaleZ != 1 && Simplrz.css3d) t += "scaleZ(" + values.scaleZ + ")";
	
		return t;
	};

	ext.transform = function(values) {
		if(values) {
			for(var i in values) {
				ext[i] = values[i];
			}
		}

		var t = ext.transformToString(ext, force2d);
		element.style[Simplrz.prefixedProp('transform')] = t;
		element.style["transform"] = t;
	};
};










/* --- --- [domExtend/Transition] --- --- */

var Transition = function(ext, element) {

	var events = {
		'transition': 'transitionEnd',
		'Moz': 'transitionend',
		'O': 'oTransitionEnd',
		'Webkit': 'webkitTransitionEnd',
		'Ms': 'MSTransitionEnd'
	};

	var trEvent = events[Simplrz.prefix.js];
	var TR = "transform";

	var now = function() {
		return new Date().getTime();
	}

	ext.createTransition = function() {

		var transition = {};
		var tr = [], ts = [];
		var cb, numTrans;
		var startTime, maxTime = 0, finalized;

		var onEnded = function(e) {
			numTrans--;
			if(numTrans <= 0) {
				var t = now() - startTime;
				if(t >= maxTime) {
					finalize();
				} else if(!finalized) {
					// console.log("Transition early end > ", t, maxTime);
					setTimeout(finalize, t);
					finalized = true;
				}
			}
		};

		var finalize = function() {
			transition.clear();
			if(cb) cb();
		}

		var setValues = function(vals) {
			var nv = vals.length;

			for(var i = 0; i < nv; i++) {
				var p = vals[i][0], v = vals[i][1];
				if(p == TR) ext.transform(v);
				else element.style[p] = v;
			}

			return transition;
		};

		function propToCss(str) {
			return str.replace(/([A-Z])/g, function(letter) { return '-' + letter.toLowerCase(); });
		}

		transition.add = function(property, to, time, ease, delay) {
			maxTime = Math.max(maxTime, time);
			ease = ease || Util.cssEase.ease;
			delay = delay || 0;
			tr.push([propToCss(property), time+'ms', ease, delay+'ms'].join(' '));
			ts.push([property, to]);

			return transition;
		}

		transition.trs = function(values, time, ease, delay) {
			maxTime = Math.max(maxTime, time);
			ease = ease || Util.cssEase.ease;
			delay = delay || 0;
			tr.push([Simplrz.prefix.css + "transform", time+'ms', ease, delay+'ms'].join(' '));
			ts.push([TR, values]);

			return transition;
		}

		transition.clear = function() {
			element.removeEventListener(trEvent, onEnded);
			tr = [];
			ts = [];
			element.style[Simplrz.prefix.js + "Transition"] = "";
			element.style["transition"] = "";
		}

		transition.start = function(callback) {
			cb = callback;
			numTrans = ts.length;

			element.addEventListener(trEvent, onEnded);

			// have to wait for properties to settle before applying the transition
			setTimeout(function() {
				startTime = now();
				finalized = false;
				element.style[Simplrz.prefix.js + "Transition"] = tr;
				element.style["transition"] = tr;
				setValues(ts);
			}, 0);

			return transition;
		};

		transition.then = function(callback) {
			var t = ext.createTransition();

			var c = function() {
				callback();
				t.start();
			}

			transition.start(c);

			return t;
		}

		return transition;

	};

	ext.transition = function(properties, time, ease, delay, callback) {
		var t = ext.createTransition();

		for(var p in properties) {
			var v = properties[p];
			if(p == TR) t.trs(v, time, ease, delay);
			else t.add(p, v, time, ease, delay);
		}

		t.start(callback);
		return t;
	}
};




/* --- --- [domExtend/Animation] --- --- */

var Animation = function(ext, element) {

	var events = {
		'animation': 'animationend',
		'Moz': 'animationend',
		'O': 'oanimationend',
		'Webkit': 'webkitAnimationEnd',
		'Ms': 'MSAnimationEnd'
	};

	var animStrigify = function(anim) {
		return [
			anim.name, 
			anim.duration + 's', 
			anim.ease, 
			anim.delay + 's', 
			anim.count, 
			anim.direction, 
			anim.fillMode, 
			anim.playState
		].join(' ');
	}

	// animation: name duration timing-function delay iteration-count direction fill-mode play-state;
	ext.createAnimation = function(name, duration, ease, delay) {
		return {
			name: name,
			duration: duration || 1,
			ease: ease || 'ease',
			delay: delay || 0,
			count: 1,
			direction: 'normal',
			fillMode: 'backwards',
			playState: 'running'
		}
	}

	ext.animate = function(anim, callback, dontClear) {

		var a;

		if(anim instanceof Array) {
			var aa = [];
			anim.forEach(function(e) { aa.push(animStrigify(e)); });
			a = aa.join(', ');
		} else {
			a = animStrigify(anim);
		}

		if(callback) {

			var eventName = events[Simplrz.prefix.js];

			var onEnded = function() {
				element.removeEventListener(eventName, onEnded);

				if(dontClear == null) {
					element.style[Simplrz.prefix.js + "Animation"] = '';
					element.style["animation"] = '';
				}

				callback();
			}

			element.addEventListener(eventName, onEnded);
		}

		element.style[Simplrz.prefix.js + "Animation"] = a;
		element.style["animation"] = a;
	}
};

/* --- --- [FrameImpulse] --- --- */

FrameImpulse = (function() {

    var vendors = ['webkit', 'moz'];

    var r = {};
	var listeners = [], numListeners = 0, toRemove = [], numToRemove;

    for(var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
        window.requestAnimationFrame = window[vendors[i] + 'RequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { 
            	callback(currTime + timeToCall); 
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }

	var run = function(deltaTime) {
		requestAnimationFrame(run);

		if(numListeners == 0) return;
		
		for(var i = 0; i < numListeners; i++) {
			listeners[i].call(deltaTime);
		}

		if(numToRemove > 0) {
			var indexToRemove = [];
			for (var i = listeners.length - 1; i >= 0; i--) {
				for (var j = 0; j < toRemove.length; j++) {
					if (listeners[i] === toRemove[j])
						indexToRemove.push(i);
				};
			};

			for (var i = 0; i < indexToRemove.length; i++) {
				listeners.splice(indexToRemove[i], 1);
			};

			numListeners = listeners.length;
			toRemove = [];
			numToRemove = 0;
		}		
	}

	r.on = function(f) {
		if(listeners.indexOf(f) > -1) { return; }
		listeners.push(f);
		numListeners = listeners.length;
		// console.log("FrameImpulse > new listener > total :", numListeners);
	}

	r.off = function(f) {
		toRemove.push(f);
		numToRemove = toRemove.length;
		// console.log("FrameImpulse > scheduled removal > total :", numListeners);
	}

	r.getListeners = function() {
		return listeners;
	}
	
	run();
	return r;

})();


/* --- --- [HistoryRouter] --- --- */

HistoryRouter = function (app) {

	var rootUrl = document.location.protocol + '//' + (document.location.hostname || document.location.host);
	if(document.location.port) rootUrl += ":" + document.location.port;

	app.navigate = new Trigger();
	app.hijackLinks = new Trigger();

	var hijackLinks = function () {
		if (!Simplrz.history) return;

		var allLinksSelector = 'a[href]';
		var allLinks = EXT.selectAll(allLinksSelector);

		for (var i = 0; i < allLinks.length; i++) {
			var link = allLinks[i];

			var url = link.ext.attr('href');
			var target = link.ext.attr('target');
			var hj = link.ext.attr('data-hj');

			if(url.indexOf(':') > -1 || target == '_blank' || hj == "no") {
				// Skip absolute URLs, those that have a _blank target 
				// and those that are explicitely set to not be hijacked
				// (this is done by adding an attribute like this: data-hj='no')

				// console.log('HistoryRouter.hijackLinks: skipping', url);
				continue;
			}
			
			if (!link.hijacked) {
				link.hijacked = true;

				var cb = function (e) {
					if(e) e.preventDefault();
					pushState(this.href);
				}

				if(Simplrz.touch) {
					Util.handleTap(link, cb);
				} else {
					link.addEventListener('click', cb);
				}
			}
		}
	};

	// Some browser fire the popstate event on start others don't.
	// Those who don't need help, and this is what the setTimeout below is for.
	// but it can't be called twice, so we also need this flag./
	// It's mostly for Chrome <33, so in the future this can be removed (maybe).
	var historyAPIInitiated = false;

	var notify = function(r) {
		app.route.value = r.substring(rootUrl.length + 1);
	}

	var pushState = function (href) {
		if (Simplrz.history) history.pushState(null, null, href);
		notify(document.location.href);
	};

	window.addEventListener('popstate', function(e) {
		historyAPIInitiated = true;
		notify(document.location.href);
	});

	app.hijackLinks.on(hijackLinks);
	app.navigate.on(pushState);

	setTimeout(function() {
		if(!historyAPIInitiated) pushState();
		else console.log("History initiated, no manual push.")
	}, 20, document.location.href);

	return {
		init: function () {
			hijackLinks();
		}
	}
};

/* --- --- [Loader] --- --- */

window.Loader = {

	loadText: function(path, onLoadedFunc){

		var request = new XMLHttpRequest();
		request.open("GET", path);

		request.onreadystatechange = function(){
			if (request.readyState == 4) {
				onLoadedFunc.call(null, request.responseText);
			}
		};

		request.send();
	},

	loadJSON: function(path, onLoadedFunc){
		Loader.loadText(path, function(text) {
			onLoadedFunc(JSON.parse(text));
		});
	}
};

/* --- --- [VirtualScroll] --- --- */

var VirtualScroll = (function(document) {

	var vs = {};

	var numListeners, listeners = [], initialized = false;

	var touchStartX, touchStartY;

	// [ These settings can be customized with the options() function below ]
	// Mutiply the touch action by two making the scroll a bit faster than finger movement
	var touchMult = 2;
	// Firefox on Windows needs a boost, since scrolling is very slow
	var firefoxMult = 15;
	// How many pixels to move with each key press
	var keyStep = 120;
	// General multiplier for all mousehweel including FF
	var mouseMult = 1;

	var bodyTouchAction;

	var hasWheelEvent = 'onwheel' in document;
	var hasMouseWheelEvent = 'onmousewheel' in document;
	var hasTouch = 'ontouchstart' in document;
	var hasKeyDown = 'onkeydown' in document;

	var hasTouchWin = navigator.msMaxTouchPoints && navigator.msMaxTouchPoints > 1;
	var hasPointer = !!window.navigator.msPointerEnabled;

	var isFirefox = navigator.userAgent.indexOf('Firefox') > -1;

	var event = {
		y: 0,
		x: 0,
		deltaX: 0,
		deltaY: 0,
		originalEvent: null
	};

	vs.on = function(f) {
		if(!initialized) initListeners(); 

		var i = listeners.indexOf(f);
		if(i != -1) return;

		listeners.push(f);
		numListeners = listeners.length;
	}

	vs.options = function(opt) {
		keyStep = opt.keyStep || 120;
		firefoxMult = opt.firefoxMult || 15;
		touchMult = opt.touchMult || 2;
		mouseMult = opt.mouseMult || 1;
	}

	vs.off = function(f) {
		var i = listeners.indexOf(f);
		if(i == -1) return;

		listeners.splice(i, 1);
		numListeners = listeners.length;
		if(numListeners <= 0) destroyListeners();
	}

	var notify = function(e) {
		event.x += event.deltaX;
		event.y += event.deltaY;
		event.originalEvent = e;

		for(var i = 0; i < numListeners; i++) {
			listeners[i](event);
		}
	}

	var onWheel = function(e) {
		// In Chrome and in Firefox (at least the new one)
		event.deltaX = e.wheelDeltaX || e.deltaX * -1;
		event.deltaY = e.wheelDeltaY || e.deltaY * -1;

		// for our purpose deltamode = 1 means user is on a wheel mouse, not touch pad 
		// real meaning: https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent#Delta_modes
		if(isFirefox && e.deltaMode == 1) {
			event.deltaX *= firefoxMult;
			event.deltaY *= firefoxMult;
		} 

		event.deltaX *= mouseMult;
		event.deltaY *= mouseMult;

		notify(e);
	}

	var onMouseWheel = function(e) {
		// In Safari, IE and in Chrome if 'wheel' isn't defined
		event.deltaX = (e.wheelDeltaX) ? e.wheelDeltaX : 0;
		event.deltaY = (e.wheelDeltaY) ? e.wheelDeltaY : e.wheelDelta;

		notify(e);	
	}

	var onTouchStart = function(e) {
		var t = (e.targetTouches) ? e.targetTouches[0] : e;
		touchStartX = t.pageX;	
		touchStartY = t.pageY;
	}

	var onTouchMove = function(e) {
		// e.preventDefault(); // < This needs to be managed externally
		var t = (e.targetTouches) ? e.targetTouches[0] : e;

		event.deltaX = (t.pageX - touchStartX) * touchMult;
		event.deltaY = (t.pageY - touchStartY) * touchMult;
		
		touchStartX = t.pageX;
		touchStartY = t.pageY;

		notify(e);
	}

	var onKeyDown = function(e) {
		// 37 left arrow, 38 up arrow, 39 right arrow, 40 down arrow
		event.deltaX = event.deltaY = 0;
		switch(e.keyCode) {
			case 37:
				event.deltaX = -keyStep;
				break;
			case 39:
				event.deltaX = keyStep;
				break;
			case 38:
				event.deltaY = keyStep;
				break;
			case 40:
				event.deltaY = -keyStep;
				break;
		}

		notify(e);
	}

	var initListeners = function() {
		if(hasWheelEvent) document.addEventListener("wheel", onWheel);
		if(hasMouseWheelEvent) document.addEventListener("mousewheel", onMouseWheel);

		if(hasTouch) {
			document.addEventListener("touchstart", onTouchStart);
			document.addEventListener("touchmove", onTouchMove);
		}
		
		if(hasPointer && hasTouchWin) {
			bodyTouchAction = document.body.style.msTouchAction;
			document.body.style.msTouchAction = "none";
			document.addEventListener("MSPointerDown", onTouchStart, true);
			document.addEventListener("MSPointerMove", onTouchMove, true);
		}

		if(hasKeyDown) document.addEventListener("keydown", onKeyDown);

		initialized = true;
	}

	var destroyListeners = function() {
		if(hasWheelEvent) document.removeEventListener("wheel", onWheel);
		if(hasMouseWheelEvent) document.removeEventListener("mousewheel", onMouseWheel);

		if(hasTouch) {
			document.removeEventListener("touchstart", onTouchStart);
			document.removeEventListener("touchmove", onTouchMove);
		}
		
		if(hasPointer && hasTouchWin) {
			document.body.style.msTouchAction = bodyTouchAction;
			document.removeEventListener("MSPointerDown", onTouchStart, true);
			document.removeEventListener("MSPointerMove", onTouchMove, true);
		}

		if(hasKeyDown) document.removeEventListener("keydown", onKeyDown);

		initialized = false;
	}

	return vs;
})(document);







/* --- --- [Timer] --- --- */

var Timer = function(autostart, autoupdate) {

	var that = this;
	// If frame is longer than 250ms (4 FPS) it will skip it.
	var MAX_FRAME_TIME = 250;

	var paused = false;

	this.time = 0;
	this.frame = 0;
	this.deltatime = 0;

	var startTime, elapsedTime = 0;

	var tasks = [];

	var trackTask = function(e, i) {
		if(e._time < that.time) {
			if(e._repeat != 0) {
				e.callback(e._time);

				var it = e._interval;
				if(it instanceof Array) e._time += it[0] + Math.random() * (it[1] - it[0]);
				else e._time += it;

				e._repeat--;
			} else {
				setTimeout(that.off, 0, e); // <- is it good enough?
			}
		}
	};

	var run = function() {
		requestAnimationFrame(run);
		that.update();
	}

	this.pause = function(p) {
		paused = p;
	}

	this.paused = function() {
		return paused;
	}

	/**
	 *	Start the timer manually.
	 *
	 *	If autostart was set to false or omitted in the constructor, this function needs to be invoked.	
	 */
	this.start = function() {
		startTime = new Date().getTime(), 
		elapsedTime = 0, 
		that.frame = 0;
		that.time = 0;

		if(autoupdate) run();

		return that;
	}

	/**
	 *	Update the timer.
	 *
	 *	If autoupdate was set to false or omitted in the constructor, 
	 *	this function need to be invoked in a requestAnimationFrame loop or a similar interval.
	 */
	this.update = function() {
		var t = new Date().getTime() - startTime;
		var d = t - elapsedTime;
		elapsedTime = t;

		if(d < MAX_FRAME_TIME && !paused) {
			that.time += d;
			that.frame++;
			that.deltatime = d;
		}

		tasks.forEach(trackTask);
		return that.time;
	}

	/**
	 *	Executes callback after a delay. All time values in ms.
	 *
	 *	_time - when to start (i.e. delay counted from 'now' i.e from when this method is called)
	 *	callback - the callback to be invoked
	 *
	 *	returns - an object that can be used to remove the task.
	 */
	this.onAt = function(_time, callback) {
		var so = {
			callback: callback,
			_time: that.time + _time,
			_repeat: 1
		};

		tasks.push(so);
		return so;
	}

	/**
	 *	Invokes the callback repeatedly overtime. All time values in ms.
	 * 	
	 *	_interval - how often to invoked the function. It can be an array of two elements specyfing a min/max range
	 *	_time - when to start (i.e. delay, counted from 'now' i.e from when this method is called)
	 *	callback - the callback to be invoked
	 *	_repeat - how many times to repeat. If ommited or -1 will repeat infinitely
	 *				0 will never invoke the function (in fact it won't even be added)
	 *
	 *	returns - an object that can be used to remove the task.
	 */
	this.onEvery = function(_interval, _time, callback, _repeat) {

		if(_repeat === 0) return;
		
		var so = {
			callback: callback,
			_time: that.time + _time,
			_interval: _interval,
			_repeat: _repeat || -1

		};

		tasks.push(so);
		return so;
	}

	/**
	 *	Remove a scheduled task.
	 *
	 *	DO NOT PASS the original callback to this function (you'll get a warning if you do).
	 *	Instead you need to pass the object returned from onAt or onEvery. 
	 */
	this.off = function(so) {

		if(so instanceof Function) {
			var m = 'You are probably using the callback directly to remove it.\n';
			m += 'You should use the object returned from onAt or onEvery instead.';
			console.warn(m);
			console.warn(so);
			return;
		}

		if(so == null) {
			return;
		}

		var i = tasks.indexOf(so);
		if(i > -1) {
			tasks.splice(i, 1);
			return true;
		} else {
			return false;
		}
	}

	/**
	 *	Remove all tasks scheduled using onAt or onEvery
	 */
	this.clearTasks = function() {
		tasks.length = 0;
	}

	

	if(autostart) {
		that.start();
	}
}


/* --- --- [Util] --- --- */

// Limits a value between start and end values.
Math.clamp = function(value, start, end) {
	if(value < start) return start;
	else if(value > end) return end;
	else return value;
};

// Limits a value between 0 and 1 .
Math.clamp01 = function(value) {
	if(value < 0) return 0;
	else if(value > 1) return 1;
	else return value;
};

// Rect = top/left/right/bottom - can be the object returned by element.getBoundingClientRect()
// Point = needs to have x/y property
Math.pointInRect = function(p, r) {
	return (p.x >= r.left && p.x <= r.right) && (p.y >= r.top && p.y <= r.bottom);
};

// Normalizes a number from another range into a value between 0 and 1. 
Math.norm = function(value , min, max){
	return (value - min) / (max - min);
};

// Re-maps a number from one range to another.
Math.map = function(value, min1, max1, min2, max2) {
	return Math.lerp(min2, max2, Math.norm(value, min1, max1));
};

// Calculates a number between two numbers at a specific increment.
Math.lerp = function(min, max, amt){
	return min + (max - min) * amt;
};

Math.hexToRgb = function(hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
	} : null;
};

Util = {

	handleTap: function(element, callback) {

		var tapHandler = (function() {

			var th = {};
			var minTime = 20000;
			var startTime;
			var minDistSq = 100;
			var sx, sy;
			var el = element;
			var cb = callback;

			th.click = function(e) {
				e.preventDefault();
			} 

			th.touchStart = function(e) {
				e.preventDefault();

				startTime = new Date().getTime();
				sx = e.targetTouches[0].pageX;
				sy = e.targetTouches[0].pageY;
			}

			th.touchEnd = function(e) {
				e.preventDefault();

				var t = new Date().getTime() - startTime;

				var dx = e.changedTouches[0].pageX - sx;
				var dy = e.changedTouches[0].pageY - sy;
				var dsq = (dx*dx + dy*dy);

				if(t < minTime && dsq < minDistSq) cb.apply(el);
			}

			return th;

		})();

		element.addEventListener("touchstart", tapHandler.touchStart);
		element.addEventListener("touchend", tapHandler.touchEnd);
		element.addEventListener("click", tapHandler.click);

		return tapHandler;
	},

	clearTapHandler: function(element, tapHandler) {
		element.removeEventListener("touchstart", tapHandler.touchStart);
		element.removeEventListener("touchend", tapHandler.touchEnd);
		element.removeEventListener("click", tapHandler.click);
	},

	cssEase: {
		'ease': 'ease',
		'smoothstep': 'ease',
		'in': 'ease-in',
		'out': 'ease-out',
		'in-out': 'ease-in-out',
		'snap': 'cubic-bezier(0,1,.5,1)',
		'easeOutCubic': 'cubic-bezier(.215,.61,.355,1)',
		'easeInOutCubic': 'cubic-bezier(.645,.045,.355,1)',
		'easeInCirc': 'cubic-bezier(.6,.04,.98,.335)',
		'easeOutCirc': 'cubic-bezier(.075,.82,.165,1)',
		'easeInOutCirc': 'cubic-bezier(.785,.135,.15,.86)',
		'easeInExpo': 'cubic-bezier(.95,.05,.795,.035)',
		'easeOutExpo': 'cubic-bezier(.19,1,.22,1)',
		'easeInOutExpo': 'cubic-bezier(1,0,0,1)',
		'easeInQuad': 'cubic-bezier(.55,.085,.68,.53)',
		'easeOutQuad': 'cubic-bezier(.25,.46,.45,.94)',
		'easeInOutQuad': 'cubic-bezier(.455,.03,.515,.955)',
		'easeInQuart': 'cubic-bezier(.895,.03,.685,.22)',
		'easeOutQuart': 'cubic-bezier(.165,.84,.44,1)',
		'easeInOutQuart': 'cubic-bezier(.77,0,.175,1)',
		'easeInQuint': 'cubic-bezier(.755,.05,.855,.06)',
		'easeOutQuint': 'cubic-bezier(.23,1,.32,1)',
		'easeInOutQuint': 'cubic-bezier(.86,0,.07,1)',
		'easeInSine': 'cubic-bezier(.47,0,.745,.715)',
		'easeOutSine': 'cubic-bezier(.39,.575,.565,1)',
		'easeInOutSine': 'cubic-bezier(.445,.05,.55,.95)',
		'easeInBack': 'cubic-bezier(.6,-.28,.735,.045)',
		'easeOutBack': 'cubic-bezier(.175, .885,.32,1.275)',
		'easeInOutBack': 'cubic-bezier(.68,-.55,.265,1.55)'
	}

};







