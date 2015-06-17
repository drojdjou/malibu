var ExtState = function(ext, element) {

	var cc = function(p) {
		return p.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
	}

	ext.data = {};

	ext.show = function(display) {
		element.style.display = display || "block";
	};

	ext.hide = function() {
		element.style.display = "none";
	};

	ext.visible = function() {
		return ext.readCss('display') != "none";
	};

	ext.on = function(event, callback, useCapture) {
		if(Simplrz.touch && event == 'click') {
			callback.___thProxy = Util.handleTap(element, callback);
			return callback.___thProxy;
		} else {
			return element.addEventListener(event, callback, useCapture);
		}
	};

	ext.off = function(event, callback, useCapture) {
		if(callback.___thProxy) {
			Util.clearTapHandler(element, callback.___thProxy);
			callback.___thProxy = null;
		} else {
			return element.removeEventListener(event, callback, useCapture);	
		}
		
	};

	ext.readCss = function(property, notCalculated) {
		return (notCalculated) ? element.style[property] : getComputedStyle(element).getPropertyValue(property);
	}
};