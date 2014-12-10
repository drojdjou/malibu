var Animation = function(ext, element, globalExt) {

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
			anim.fillMode//, 
			// anim.playState // doesn't work on Safari 8.0, but it's not very useful anyway
		].join(' ');
	}

	// animation: name duration timing-function delay iteration-count direction fill-mode (play-state - not-inplemented);
	var createAnimation = function(name, duration, ease, delay) {
		var a = {
			name: name,
			duration: duration || 1,
			ease: ease || 'ease',
			delay: delay || 0,
			count: 1,
			direction: 'normal',
			fillMode: 'backwards'//,
			// playState: 'running'
		};

		a.setTime = function(t) {
			a.time = t;
			return a;
		}

		a.setDelay = function(t) {
			a.delay = t;
			return a;
		}

		return a;
	}

	globalExt.createAnimation = createAnimation;
	ext.createAnimation = createAnimation;

	ext.animate = function(anim, callback, dontClear) {

		if(ext.show) ext.show();

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