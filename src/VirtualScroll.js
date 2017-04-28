/**
 *	@namespace VirtualScroll
 *
 *	@description World Famous VirtualScroll &copy;
 *
 *	<p>
 *	<a href='http://www.everyday3d.com/blog/index.php/2014/08/18/smooth-scrolling-with-virtualscroll/'>How to use</a><br>
 *	<a href='http://work.bartekdrozdz.com/malibu/test/wheel-simple.html'>Simple example</a><br>
 *	<a href='http://work.bartekdrozdz.com/malibu/test/wheel-multi.html'>Paralax example</a>
 *	</p>
 *
 *	<p>Within the context of the DomExtend functionality, VirtualScroll works best with the element.ext.transform() function.</p>
 *
 *	@example
var onSroll = function(e) {
  // Do some scrolling action logic in here
}

// When the loop needs to be activated
VirtualScroll.on(onScroll);

// ...and when it needs to stop
VirtualScroll.off(onScroll);
 *
 *	@example
// Using VS with DomExtend

var scroll = 0, targetScroll = 0;

// typically the limit of scrolling will be defined by the height of the object minus the height of the window
var MAX_SCROLL = element.ext.height() - window.innerHeight;

var onScroll = function(e) {
	targetScroll += e.deltaY;

	// Clamp the scroll to limit values
	targetScroll = Math.max(0, targetScroll);
	targetScroll = Math.min(MAX_SCROLL, targetScroll);
}

var onFrame = function() {
	// Add some easing
	scroll += (targetScroll - scrol) * 0.1; 

	// Apply the scroll value
	element.ext.transform({ y: -scroll });
}

VirtualScroll.on(onScroll);
FrameImpulse.on(onFrame);
 */
var VirtualScroll = (function() {

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

	// var hasTouchWin = navigator.msMaxTouchPoints && navigator.msMaxTouchPoints > 1;
	var hasPointer =   !!window.navigator.pointerEnabled;
	var hasPointerMS = !!window.navigator.msPointerEnabled;

	var isFirefox = navigator.userAgent.indexOf('Firefox') > -1;

	var isTouchDown = false;

	// console.log('hasTouch', hasTouch);
	// console.log('hasPointer', hasPointer);
	// console.log('hasPointerMS', hasPointerMS);

	var event = {
		y: 0,
		x: 0,
		deltaX: 0,
		deltaY: 0,
		originalEvent: null,
		source: null
	};

	vs.on = function(f) {
		if(!initialized) {
			initListeners(document); 
			initialized = true;
		}

		var i = listeners.indexOf(f);
		if(i != -1) return;

		listeners.push(f);
		numListeners = listeners.length;
	}

	/**
	 *	@method options
	 *	@memberof VirtualScroll
	 *	@static
	 *
	 *	@param {Object} opt - object literal containing one or more options from the list above, specified as properties.
	 *
	 *	@description Sets custom parameters to the VirtualScroll (globally). The following options are supported:
	 *
	 *	<ul>
	 *	<li>touchMult (default: 2) - mutiply the touch action to make the scroll a faster/slower than finger movement</li>
	 *	<li>firefoxMult (defailt: 15)- Firefox on Windows needs a boost, since scrolling is very slow</li>
	 *	<li>keyStep (default: 120) - specified how many pixels to move with each key press</li>
	 *	<li>mouseMult (default: 1) - general multiplier for all mousehweel events including FF</li>
	 *	</ul>
	 */
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
		if(numListeners <= 0) {
			destroyListeners(document);
			initialized = false;
		}
	}

	var touchLock = function(e) { e.preventDefault(); };

	/**
	 *	@method lockTouch
	 *	@memberof VirtualScroll
	 *	@static
	 *
	 *	@description For VirtualScroll to work on mobile, the default swipe-to-scroll behavior needs to be turned off. 
	 *	This function will take care of that, however it's a failt simple mechanism - see in the source code, linked below.
	 */
	vs.lockTouch = function() {
		document.addEventListener('touchmove', touchLock, { passive: false });
	}

	/**
	 *	@method unlockTouch
	 *	@memberof VirtualScroll
	 *	@static
	 *
	 *	@description Restores all touch events to default. Useful for hybrid pages that have some VS and some regular scrolling content.
	 */
	vs.unlockTouch = function() {
		document.removeEventListener('touchmove', touchLock, { passive: false });
	}

	var notify = function(e, s) {
		event.x += event.deltaX;
		event.y += event.deltaY;
		event.originalEvent = e;
		event.source = s;

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

		notify(e, "wheel");
	}

	var onMouseWheel = function(e) {
		// In Safari, IE and in Chrome if 'wheel' isn't defined
		event.deltaX = (e.wheelDeltaX) ? e.wheelDeltaX : 0;
		event.deltaY = (e.wheelDeltaY) ? e.wheelDeltaY : e.wheelDelta;

		notify(e, "wheel");	
	}

	var onTouchStart = function(e) {
		var t = (e.targetTouches) ? e.targetTouches[0] : e;
		touchStartX = t.pageX;	
		touchStartY = t.pageY;
		isTouchDown = true;
	}

	var onTouchEnd = function() {
		isTouchDown = false;
	}

	var onTouchMove = function(e) {
		if(!isTouchDown) return;
		// e.preventDefault(); // < This needs to be managed externally
		var t = (e.targetTouches) ? e.targetTouches[0] : e;

		if(!touchStartX) touchStartX = t.pageX;
		if(!touchStartY) touchStartY = t.pageY;

		event.deltaX = (t.pageX - touchStartX) * touchMult;
		event.deltaY = (t.pageY - touchStartY) * touchMult;
		
		touchStartX = t.pageX;
		touchStartY = t.pageY;

		notify(e, "touch");
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

		notify(e, "key");
	}

	var wheelOpts = { passive: true };

	var initListeners = function(element) {

		if(hasWheelEvent) element.addEventListener("wheel", onWheel, wheelOpts);
		if(hasMouseWheelEvent) element.addEventListener("mousewheel", onMouseWheel, wheelOpts);

		if(hasTouch) {
			element.addEventListener("touchstart", onTouchStart);
			element.addEventListener("touchmove", onTouchMove);
			element.addEventListener("touchend", onTouchEnd);
		}
		
		if(hasPointer || hasPointerMS) {
			bodyTouchAction = element.body.style.touchAction;
			element.body.style.touchAction = "none";
			element.addEventListener(hasPointerMS ? "MSPointerDown" : "PointerDown", onTouchStart, true);
			element.addEventListener(hasPointerMS ? "MSPointerMove" : "PointerMove", onTouchMove, true);
			element.addEventListener(hasPointerMS ? "MSPointerUp" : "PointerUp", onTouchEnd, true);
		}

		if(hasKeyDown) element.addEventListener("keydown", onKeyDown);
	}

	var destroyListeners = function(element) {
		if(hasWheelEvent) element.removeEventListener("wheel", onWheel, wheelOpts);
		if(hasMouseWheelEvent) element.removeEventListener("mousewheel", onMouseWheel, wheelOpts);

		if(hasTouch) {
			element.removeEventListener("touchstart", onTouchStart);
			element.removeEventListener("touchmove", onTouchMove);
			element.removeEventListener("touchend", onTouchEnd);
		}
		
		if(hasPointer || hasPointerMS) {
			element.body.style.touchAction = bodyTouchAction;
			element.removeEventListener(hasPointerMS ? "MSPointerDown" : "PointerDown", onTouchStart, true);
			element.removeEventListener(hasPointerMS ? "MSPointerMove" : "PointerMove", onTouchMove, true);
			element.removeEventListener(hasPointerMS ? "MSPointerUp" : "PointerUp", onTouchEnd, true);
		}

		if(hasKeyDown) element.removeEventListener("keydown", onKeyDown);
	}

	vs.trackFrame = function(frame) {
		initListeners(frame);
	}

	vs.untrackFrame = function(frame) {
		destroyListeners(frame);
	}

	return vs;
	
})();





