/**
 * 	@class Gesture
 *
 *	@param {Object=} options - object holding settings (see above)
 *
 *	@description 
 *
 *	<p>A simple touch (or click/drag) gesture recognition class.</p>
 *
 *	<p>Works with touch gesture, mouse clik/drag gestures and key press (cursor keys), detects swipes in 4 directions.</p>
 *
 *	<p>For advanced scenarios <a href='http://hammerjs.github.io/'>Hammer.js</a> can be used instead.</p>
 *
 *	<p>Options include:
 *	<ul>
 *		<li>maxTime - how long before swipe is not considered a swipe (default 300ms)</li>
 *		<li>minDistance - how much must the user move to consider this a swipe (default 30px)</li>
 *		<li>tolerance - how far off vertical or horizontal axis is considered as swipe 
 *				default: 0.1, don't make it larger than 0.25 (i.e. 45deg)</li>
 *		<li>noKeyboard - if set tu true, key listeners will not be activated 
 *				(use if cursor keys are used for something else and there's a conflict)</li>
 *	</ul>
 *	</p>
 *
 *	@example
var g = new Gesture();
g.swipeUp.on(function() {
  console.log("User swiped up!");
});
 */
var Gesture = function(options) {

	options = options || {};

	var that = this;
	var cl;

	var isTouch = 'ontouchstart' in document;
	var downEvent = isTouch ? 'touchstart' : 'mousedown';
	var moveEvent = isTouch ? 'touchmove' : 'mousemove';
	var upEvent =   isTouch ? 'touchend' : 'mouseup';

	/**
	 *	@member {Trigger} swipeUp
	 *	@memberof Gesture.prototype
	 *
	 *	@description Triggered when a "swipe up" gesture is detected
	 */	
	this.swipeUp = new Trigger();

	/**
	 *	@member {Trigger} swipeDown
	 *	@memberof Gesture.prototype
	 *
	 *	@description Triggered when a "swipe down" gesture is detected
	 */	
	this.swipeDown = new Trigger();

	/**
	 *	@member {Trigger} swipeLeft
	 *	@memberof Gesture.prototype
	 *
	 *	@description Triggered when a "swipe left" gesture is detected
	 */	
	this.swipeLeft = new Trigger();

	/**
	 *	@member {Trigger} swipeRight
	 *	@memberof Gesture.prototype
	 *
	 *	@description Triggered when a "swipe right" gesture is detected
	 */	
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

	/**
	 *	@method create
	 *	@memberof Gesture.prototype
	 *
	 *	@description registers all necessary listeners. 
	 *	This is done automatically in the constructor, 
	 *	so it doesn't need to be called, unless destroy()
	 *	was called before and we want to reuse the object.
	 */	
	this.create = function() {
		document.addEventListener(downEvent, onStart);
		document.addEventListener(moveEvent, onMove);
		document.addEventListener(upEvent, onStop);
		if(!options.noKeyboard) document.addEventListener("keydown", onKeyDown);
	}

	/**
	 *	@method destroy
	 *	@memberof Gesture.prototype
	 *
	 *	@description deregisters all listeners
	 */	
	this.destroy = function() {
		document.removeEventListener(downEvent, onStart);
		document.removeEventListener(moveEvent, onMove);
		document.removeEventListener(upEvent, onStop);
		if(!options.noKeyboard) document.removeEventListener("keydown", onKeyDown);
	}

	this.create();
}