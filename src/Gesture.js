var Gesture = function(tolerance) {

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

	tolerance = tolerance || 0.1;

	var start = { x:0, y:0 }, 
		delta = { x: 0, y: 0 },
		startTime = 0,
		maxTime = 300;

	var onStart = function(e) {
		e = isTouch ? e.targetTouches[0] : e;
		start.x = e.pageX;
		start.y = e.pageY;
		startTime = new Date().getTime();
	}

	var onMove = function(e) {
		e = isTouch ? e.targetTouches[0] : e;
		delta.x = e.pageX - start.x;
		delta.y = e.pageY - start.y;
	}

	var onStop = function(e) {
		var dt = new Date().getTime() - startTime;
		var t = tolerance;

		if(dt > maxTime) return;

		var a = Math.atan2(delta.y, delta.x) / Math.PI;
		// up = -0.5, down = 0.5, left = 1, right = 0
		if(a > -0.5 - t && a < -0.5 + t) that.swipeUp.trigger();
		if(a >  0.5 - t && a <  0.5 + t) that.swipeDown.trigger();
		if(a >  0.0 - t && a <  0.0 + t) that.swipeRight.trigger();
		if(a < -1.0 + t || a >  1.0 - t) that.swipeLeft.trigger();
	}

	this.create = function() {
		document.addEventListener(downEvent, onStart);
		document.addEventListener(moveEvent, onMove);
		document.addEventListener(upEvent, onStop);
	}

	this.destroy = function() {
		document.removeEventListener(downEvent, onStart);
		document.removeEventListener(moveEvent, onMove);
		document.removeEventListener(upEvent, onStop);
	}

	this.create();
}