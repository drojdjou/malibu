/**
 *	@namespace FrameImpulse
 *
 *	@description <p>A utility to handle <code>requestAnimationFrame</code> loops. It really only exists to eliminate a  common but hard debug problem: 
 *	since RaF is sort of a recurent function, sometimes the code can accidentally start the loop twice (or even more times). This has diastrous 
 *	conseuences for perofrmance, but it is not easy to spot at all.</p>
 *
 	<p>With <code>FrameImpulse</code> you will not get into this kind of trouble easily.</p>
 *
 *	@example
var render = function() {
  // Do some rendering logic in here
}

// When the loop needs to be activated
FrameImpulse.on(render);

// ...and when it needs to stop
FrameImpulse.off(render);
 */
var FrameImpulse = (function() {

    var vendors = ['webkit', 'moz'];

	var listeners = [], numListeners = 0, toRemove = [], numToRemove;
	var lastTime = 0;

	var provider = window;

	var r = {};

    // for(var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
    //     window.requestAnimationFrame = window[vendors[i] + 'RequestAnimationFrame'];
    // }

    // if (!window.requestAnimationFrame) {
    //     window.requestAnimationFrame = function(callback) {
    //         var currTime = new Date().getTime();
    //         var timeToCall = Math.max(0, 16 - (currTime - lastTime));
    //         var id = window.setTimeout(function() { 
    //         	callback(currTime + timeToCall); 
    //         }, timeToCall);
    //         lastTime = currTime + timeToCall;
    //         return id;
    //     };
    // }

	var run = function(time, frame) {
		provider.requestAnimationFrame(run);

		if(numListeners == 0) return;

		for(var i = 0; i < numListeners; i++) {
			listeners[i].apply(null, arguments);
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

	/**
	 *	@method on
	 *	@memberof FrameImpulse
	 *	@static
	 *
	 *	@param {Function} callback - the function used as callback for the listener
	 *	@description Adds a listener to be called on every frame. The cool thing about this function, 
	 *	is that the same function is added twice, it will not be called twice later on. However, this 
	 *	does not work with anonymous functions, so we suggest to never use anonnymous functions with this.
	 */
	r.on = function(f) {
		if(listeners.indexOf(f) > -1) { return; }
		listeners.push(f);
		numListeners = listeners.length;
		// console.log("FrameImpulse > new listener > total :", numListeners);
	}

	/**
	 *	@method off
	 *	@memberof FrameImpulse
	 *	@static
	 *
	 *	@param {Function} callback - the function used as callback for the listener. 
	 *	Needs to be the same function as passed to the <code>on()</code> when it was being registered.
	 *	@description Removes a listener to be called on every frame
	 */
	r.off = function(f) {
		

		// At this point we think the "late" removal patttern was more harmful than helpful, so it's gone.

		// if(listeners.indexOf(f) == -1) { return; }
		// toRemove.push(f);
		// numToRemove = toRemove.length;

		var i = listeners.indexOf(f);
		if(i == -1) return;
		listeners.splice(i, 1);
		numListeners = listeners.length;
	}

	/**
	 *	@method getListeners
	 *	@memberof FrameImpulse
	 *	@static
	 *
	 *	@description Returns a list of all currently registered functions. Useful for debugging.
	 */
	r.getListeners = function() {
		return listeners;
	}

	r.setProvider = function(p) {
		var newprov = p && p != provider;
		provider = p || window;
		if(newprov) provider.requestAnimationFrame(run);
	}

	run();
	return r;

})();