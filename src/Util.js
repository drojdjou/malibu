Util = {

	fullbleed: function(element) {
		var isVideo = element.videoWidth > 0;



		var sw = window.innerWidth,
			sh = window.innerHeight,
			vw = isVideo ? element.videoWidth : element.width,
			vh = isVideo ? element.videoHeight : element.height;

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

	fullContain: function(img) {
		var isVideo = img.videoWidth > 0;

		var w = window.innerWidth;
		var h = window.innerHeight;
		var iw = isVideo ? img.videoWidth : img.width;
		var ih = isVideo ? img.videoHeight : img.height;
		var scrRatio = w / h;
		var imgRatio = iw / ih;
		var sx, sy, sw, sh;

		// contain
		if(scrRatio > imgRatio){
			sy = 0;
			sh = h;
			sw = (h / ih ) * iw;
			sx = (w - sw) * 0.5;
		}else if(scrRatio < imgRatio){
			sx = 0;
			sw = w;
			sh = (w / iw ) * ih;
			sy = (h - sh) * 0.5;
		}else{
			sx = 0, sy = 0, sw = w , sh = h;
		}

		return[sx, sy, sw , sh];
	},

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

				if(t < minTime && dsq < minDistSq) cb.call(el, e);
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





