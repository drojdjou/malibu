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
