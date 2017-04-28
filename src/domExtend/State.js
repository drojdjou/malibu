var ExtState = function(ext, element) {

	var cc = function(p) {
		return p.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
	}

	ext.data = {};

	/**
	 *	@method show
	 *	@memberof DomExtend.prototype
	 *	@param {string} [display=block] the CSS property value to use.
	 *	@description Sets the display CSS property of the object to the display type specified in the argument. Defaults to "block".
	 */
	ext.show = function(display) {
		element.style.display = display || element.ext.__defaultDisplay || "block";
	};

	/**
	 *	@method hide
	 *	@memberof DomExtend.prototype
	 *	@description Sets the display CSS property of the object to "none".
	 */
	ext.hide = function() {
		var d = ext.readCss('display');
		element.ext.__defaultDisplay = d == 'none' ? 'block' : d;
		element.style.display = "none";
	};

	/**
	 *	@method toggle
	 *	@memberof DomExtend.prototype
	 *	@description Toggle the display CSS between "none" and "block".
	 */
	ext.toggle = function(show, display) {
		if(show) ext.show(display);
		else ext.hide();
	};

	/**
	 *	@method visible
	 *	@memberof DomExtend.prototype
	 *	@description Returns true if the CSS display property is set to none on this element.
	 */	
	ext.visible = function() {
		return ext.readCss('display') != "none";
	};

	/**
	 *	@method on
	 *	@memberof DomExtend.prototype
	 *	@description Equivalent of element.addEventListener but shorter and has a special touch handler for 'click' events.
	 */	
	ext.on = function(event, callback, useCapture) {
		// if(Simplrz.touch && event == 'click') {
		// 	callback.___thProxy = Util.handleTap(element, callback);
		// 	return callback.___thProxy;
		// } else 
		if(event == 'doubleclick') {
			callback.___dcProxy = Util.handleDC(element, callback);
			return callback.___dcProxy;
		} else {
			return element.addEventListener(event, callback, useCapture);
		}
	}

	/**
	 *	@method off
	 *	@memberof DomExtend.prototype
	 *	@description Equivalent of element.removeEventListener but shorter and works witht the special touch handler for 'click' events.
	 */	
	ext.off = function(event, callback, useCapture) {
		// if(callback.___thProxy) {
		// 	Util.clearTapHandler(element, callback.___thProxy);
		// 	callback.___thProxy = null;
		// } else 
		if(callback.___dcProxy) {
			// callback.___dcProxy.clear = null;
			Util.clearDCHandler(element, callback.___dcProxy);
		} else {
			return element.removeEventListener(event, callback, useCapture);	
		}
		
	};

	/**
	 *	@method readCss
	 *	@memberof DomExtend.prototype
	 *
	 *	@param {string} property - the name of the CSS property
	 *	@param {Boolean} notCalculated - if true, grabs the value directly from the style property of the object.
	 *
	 *	@description <p>Returns true if the value of a CSS property, fetched using computed styles.
	 *	<p>The CSS values of the object can be defined in multiple stylesheets, so it's not straightforward
	 *	to read them - i.e. in most cases just saying ex. <code>var d = element.style.display</code> will not return 
	 *	expected results. 
	 *	<p>This method uses computed styles to fetch the actual CSS value of a property.
	 */	
	ext.readCss = function(property, notCalculated) {
		return (notCalculated) ? element.style[property] : getComputedStyle(element).getPropertyValue(property);
	}

	/**
	 *	@method bg
	 *	@memberof DomExtend.prototype
	 *	@description Loads and sets a backgroung image for the element. Passing the onLoad function allows to make 
	 *	animated transitions (ex. fade in) when the background images are loaded. 
	 *
	 *	@param {string} path - the path to the image
	 *	@param {Function} onLoad - the load callback to be exectued. It is called after the image was loaded but before
	 *	it has been set as background image.
	 */
	ext.bg = function(path, onLoad) {

		if(onLoad) {
			var i = new Image();
			i.addEventListener('load', function() {
				onLoad(element, i);
				element.style.backgroundImage = 'url(' + path + ')';
			});
			i.src = path;
		} else {
			element.style.backgroundImage = 'url(' + path + ')';
		}
	}
};










