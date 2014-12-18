/**
 * 	Possible options are:
 *
 *	maxTime - how long before swipe is not considered a swipe (default 300ms)
 *	minDistance - how much must the user move to consider this a swipe (default 30px)
 *	tolerance - in radians, how far off vertical or horizontal axis is considered as swipe 
 *				(default: 0.1, don't make it larger than (Math.PI/4) i.e. 45deg)
 */
var Gesture = function(options) {

	options = options || {};

	var that = this;
	var cl;

	var isTouch = 'ontouchstart' in document;
	var downEvent = isTouch ? 'touchstart' : 'mousedown';
	var moveEvent = isTouch ? 'touchmove' : 'mousemove';
	var upEvent =   isTouch ? 'touchend' : 'mouseup';

	this.swipeUp = new Trigger();
	this.swipeDown = new Trigger();
	this.swipeLeft = new Trigger();
	this.swipeRight = new Trigger();

	tolerance = options.tolerance || 0.1;

	var start = { x:0, y:0 }, 
		delta = { x: 0, y: 0 },
		startTime = 0,
		maxTime = options.maxTime || 300, minDistance = options.minDistance || 30; 
		minDistance = minDistance * minDistance; // square it for faster math

	var onStart = function(e) {
		e = isTouch ? e.targetTouches[0] : e;
		start.x = e.pageX;
		start.y = e.pageY;
		delta.x = 0;
		delta.y = 0;
		startTime = new Date().getTime();
	}

	var onMove = function(e) {
		e = isTouch ? e.targetTouches[0] : e;
		delta.x = e.pageX - start.x;
		delta.y = e.pageY - start.y;
	}

	var onStop = function(e) {
		var ds = delta.x * delta.x + delta.y * delta.y;
		var dt = new Date().getTime() - startTime;
		var t = tolerance;

		if(dt > maxTime) return;
		if(ds < minDistance) return;

		var a = Math.atan2(delta.y, delta.x) / Math.PI;
		// up = -0.5, down = 0.5, left = 1, right = 0
		if(a > -0.5 - t && a < -0.5 + t) that.swipeUp.trigger();
		if(a >  0.5 - t && a <  0.5 + t) that.swipeDown.trigger();
		if(a >  0.0 - t && a <  0.0 + t) that.swipeRight.trigger();
		if(a < -1.0 + t || a >  1.0 - t) that.swipeLeft.trigger();
	}

	var onKeyDown = function(e) {
		// 37 left arrow, 38 up arrow, 39 right arrow, 40 down arrow
		event.deltaX = event.deltaY = 0;
		switch(e.keyCode) {
			case 39:
				that.swipeLeft.trigger();
				break;
			case 37:
				that.swipeRight.trigger();
				break;
			case 40:
				that.swipeUp.trigger();
				break;
			case 38:
				that.swipeDown.trigger();
				break;
		}
	}

	this.create = function() {
		document.addEventListener(downEvent, onStart);
		document.addEventListener(moveEvent, onMove);
		document.addEventListener(upEvent, onStop);
		document.addEventListener("keydown", onKeyDown);
	}

	this.destroy = function() {
		document.removeEventListener(downEvent, onStart);
		document.removeEventListener(moveEvent, onMove);
		document.removeEventListener(upEvent, onStop);
		document.removeEventListener("keydown", onKeyDown);
	}

	this.create();
}