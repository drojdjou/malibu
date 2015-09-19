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
		element.style.display = display || "block";
	};

	/**
	 *	@method hide
	 *	@memberof DomExtend.prototype
	 *	@description Sets the display CSS property of the object to "none".
	 */
	ext.hide = function() {
		element.style.display = "none";
	};

	/**
	 *	@method visible
	 *	@memberof DomExtend.prototype
	 *	@description Returns true if the CSS display property is set to none on this element.
	 */	
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
};