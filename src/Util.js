/**
 *	@namespace Util
 */
var Util = {

	/**
	 *	@method fullbleed
	 *	@memberof Util
	 *	@static
	 *	@param {HTMLElement} element - the node to scale to fullbleed 
	 *	conserving the aspect ratio. It should be either image or video. 
	 *	
	 *	@description <p>This function calculates the size and position of the element
	 *	so that it cover the entire area of it's container (or the whole viewport).
	 *	It does a similar thing to what <code>background-size: cover;</code> does for 
	 *	background images in CSS. Most useful with videos, but can be used with 
	 *	img tags as well.
	 *
	 *	<p>This function does not transform the element, 
	 *	it only returns an array of values to use. 
	 *	To actually resize/reposition the element, use {@link Util.resizeTo}.
	 *
	 *	@param {Number=} w - the width of the container, defaults to window.innerWidth
	 *	@param {Number=} h - the height of the container, defaults to window.innerHeight
	 *
	 *	@returns {Array} values to use to scale fullscreen in that order: 
	 *	left, top, width, height.
	 *
	 *	@example
var video = EXT.create('video'); 
// same as document.createElement('video');

var f = Util.fullbleed(video);
Util.resizeTo(video, f);

// ..or in shorthand form:
Util.resizeTo(video, Util.fullbleed(video));
	 */
	fullbleed: function(element, w, h) {
		var isVideo = element.videoWidth > 0;

		var sw = w || window.innerWidth,
			sh = h || window.innerHeight,
			vw = isVideo ? element.videoWidth : element.naturalWidth,
			vh = isVideo ? element.videoHeight : element.naturalHeight;
		// IE doesnt return correct values for width.height of images but naturalWidth/Height works just fine

		var sa = sw / sh;
		var va = vw / vh;

		var vx, vy, vcw, vch;

		// large aspect = wide screen, small aspect = tall screen
		// element aspect < screen aspect = height needs overflow
		// element apsect > screen aspect = width needs overflow

		if(va < sa) {
			vx = 0;
			vcw = sw;
			vch = vh / vw * sw;
			vy = (vch - sh) * -0.5;
		} else if(va > sa) {
			vy = 0;
			vch = sh;
			vcw = vw / vh * sh;
			vx = (vcw - sw) * -0.5;
		} else {
			vx = vy = 0, vcw = sw, vch = sh;
		}

		return [vx, vy, vcw, vch];
	},

	/**
	 *	@method fullContain
	 *	@memberof Util
	 *	@static
	 *	@param {HTMLElement} element - the node to scale to fullContain 
	 *	conserving the aspect ratio. It should be either image or video. 
	 *	
	 *	@description <p>This function calculates the size and position of the element
	 *	so that it cover the maximum area of it's container (or the whole viewport)
	 *	without cropping the image/video itself. It does a similar thing to what 
	 *	<code>background-size: contain;</code> does for 
	 *	background images in CSS. Most useful with videos, but can be used with 
	 *	img tags as well.
	 *
	 *	<p>This function does not transform the element, 
	 *	it only returns an array of values to use. 
	 *	To actually resize/reposition the element, use {@link Util.resizeTo}.
	 *
	 *	@param {Number=} w - the width of the container, defaults to window.innerWidth
	 *	@param {Number=} h - the height of the container, defaults to window.innerHeight
	 *
	 *	@returns {Array} values to use to scale fullscreen in that order: 
	 *	left, top, width, height.
	 *
	 *	@example
var video = EXT.create('video'); 
// same as document.createElement('video');

var f = Util.fullContain(video);
Util.resizeTo(video, f);

// ..or in shorthand form:
Util.resizeTo(video, Util.fullContain(video));
	 */
	fullContain: function(element, w, h) {
		var isVideo = element.videoWidth > 0;

		var w = window.innerWidth;
		var h = window.innerHeight;
		var iw = isVideo ? element.videoWidth :  element.width;
		var ih = isVideo ? element.videoHeight : element.height;
		var scrRatio = w  / h;
		var imgRatio = iw / ih;
		var sx, sy, sw, sh;

		// contain
		if(scrRatio > imgRatio) {
			sy = 0;
			sh = h;
			sw = (h / ih) * iw;
			sx = (w - sw) * 0.5;
		} else if(scrRatio < imgRatio) {
			sx = 0;
			sw = w;
			sh = (w / iw) * ih;
			sy = (h - sh) * 0.5;
		} else {
			sx = 0, sy = 0, sw = w, sh = h;
		}

		return[sx, sy, sw , sh];
	},

	/**
	 *	@method resizeTo
	 *	@memberof Util
	 *	@static
	 *
	 *	@description resizes and moves the element to a give size and position, 
	 *	by applying values to it's CSS top/left/width and height properties. Assumes
	 *	the element has a block display mode (or any other mode that works). 
	 *	Works best when the element has position absolute.
	 *
	 *	@param {HTMLElement} element - the element to resize
	 *	@param {Array} dimensions - the dimensions to use, typically as returned from
	 *	{@link Util.fullbleed} or {@link Util.fullContain}
	 */
	resizeTo: function(element, dimensions) {
		element.style.left = 	dimensions[0] + 'px';
		element.style.top = 	dimensions[1] + 'px';
		element.style.width = 	dimensions[2] + 'px';
		element.style.height = 	dimensions[3] + 'px';
	},

	/**
	 *	@method hexToRgb
	 *	@memberof Util
	 *	@static
	 *	@param {String} hex - the hex representation of the color (ex. #a2e5d9)
	 *	@returns {Object} and object with values r, g and b in 0-255 range
	 */
	hexToRgb: function(hex) {
		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16)
		} : null;
	},

	handleTap: function(element, callback) {

		var tapHandler = callback.___thProxy || (function() {

			var h = {};
			var minTime = 20000;
			var startTime;
			var minDistSq = 100;
			var sx, sy;
			var el = element;
			var cb = callback;

			h.click = function(e) {
				// e.preventDefault();
			} 

			h.touchStart = function(e) {
				// e.preventDefault();

				startTime = new Date().getTime();
				sx = e.targetTouches[0].pageX;
				sy = e.targetTouches[0].pageY;
			}

			h.touchEnd = function(e) {
				// e.preventDefault();

				var t = new Date().getTime() - startTime;

				var dx = e.changedTouches[0].pageX - sx;
				var dy = e.changedTouches[0].pageY - sy;
				var dsq = (dx*dx + dy*dy);

				if(t < minTime && dsq < minDistSq) cb.call(el, e);
			}

			return h;

		})();

		element.addEventListener("touchstart", tapHandler.touchStart);
		element.addEventListener("touchend", tapHandler.touchEnd);
		element.addEventListener("click", tapHandler.click);

		return tapHandler;
	},

	clearTapHandler: function(element, handler) {
		element.removeEventListener("touchstart", handler.touchStart);
		element.removeEventListener("touchend", handler.touchEnd);
		element.removeEventListener("click", handler.click);
	},

	handleDC: function(element, callback) {

		var dcHandler = callback.___dcProxy || (function() {

			var h = {};
			var el = element;
			var cb = callback;

			var t = Simplrz.touch;
			var minTime = t ? 300 : 200, minDist = t ? 12 : 5;
			var lastTime = 0, lastX = -minDist, lastY = -minDist;
			

			h.click = function(e) {

				var x = e.changedTouches ? e.changedTouches[0].pageX : e.pageX;
				var y = e.changedTouches ? e.changedTouches[0].pageY : e.pageY;

				e.pageX = x;
				e.pageY = y;

				var t = new Date().getTime();
				if(t - lastTime < minTime && x - lastX < minDist && y - lastY < minDist) {
					cb.call(el, e);
					lastTime = 0;
					lastX = -minDist;
					lastY = -minDist;
				} else {
					lastTime = t;
					lastX = x;
					lastY = y;
				}
			} 

			return h;

		})();

		element.addEventListener(Simplrz.touch ? "touchend" : "click", dcHandler.click);
		return dcHandler;
	},

	clearDCHandler: function(element, handler) {
		element.removeEventListener(Simplrz.touch ? "touchend" : "click", handler.click);
	},

	/**
	 *	@readonly
	 *	@enum {String}
	 *	@description A collection of easing curves to be used with 
	 *	CSS transitions or animations
	 *	@example
// Using easing with CSS transitions in EXT
var e = EXT.select('.someElement');
e.ext.transition({ opacity: 0 }, 300, Util.cssEase.easeInQuint);
	 */
	cssEase: {
		'ease': 'ease',
		/** Alias for 'ease' */
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





