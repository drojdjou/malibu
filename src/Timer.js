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
