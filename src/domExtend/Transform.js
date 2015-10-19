var ExtTransform = function(ext, element) {

	var force2d = false;

	var zeroRect = { width: 0, height: 0, top: 0, left: 0 };

	/**
	 *	@method rect
	 *	@memberof DomExtend.prototype
	 *	@description Returns the screen position and dimensions of the element. 
	 *
	 *	@returns {Object} An object with 4 properties:
	 *	left, top, width, height.
	 */	
	ext.rect = function() {
		// IE10 tends to throw and "unspecified error" here, so handle
		// the exception and just return a zero rect to avoid further damage
		try {
			return element.getBoundingClientRect();
		} catch(e) {
			console.log(e.stack);
			return zeroRect;
		}
	};

	/**
	 *	@method width
	 *	@memberof DomExtend.prototype
	 *	@description Shorthand for element.ext.rect().width 
	 */
	ext.width = function(v) {
		if(v) {
			element.style.width = v + "px";
			return v;
		} else {
			return ext.rect().width;
		}
	};

	/**
	 *	@method height
	 *	@memberof DomExtend.prototype
	 *	@description Shorthand for element.ext.rect().height 
	 */
	ext.height = function(v) {
		if(v) {
			element.style.height = v + "px";
			return v;
		} else {
			return ext.rect().height;
		}
	};

	/**
	 *	@member x
	 *	@memberof DomExtend.prototype
	 *	@description The x position of the element. It is not the absolute position of the element on the screen.
	 *	It always starts with 0 and only relates to the offset by which this element has been programatically moved
	 *	using the element.ext.transform function.
	 */
	ext.x = 0;

	/**
	 *	@member y
	 *	@memberof DomExtend.prototype
	 *	@description The y position of the element. It is not the absolute position of the element on the screen.
	 *	It always starts with 0 and only relates to the offset by which this element has been programatically moved
	 *	using the element.ext.transform function.
	 */
	ext.y = 0;

	/**
	 *	@member z
	 *	@memberof DomExtend.prototype
	 *	@description The z position of the element. It is not the absolute position of the element on the screen.
	 *	It always starts with 0 and only relates to the offset by which this element has been programatically moved
	 *	using the element.ext.transform function.
	 */
	ext.z = 0;

	/**
	 *	@member rotX
	 *	@memberof DomExtend.prototype
	 *	@description The x rotation of the element in DEGREES. It is not the absolute rotation of the element on the screen.
	 *	It always starts with 0 and only relates to the offset by which this element has been programatically rotated
	 *	using the element.ext.transform function.
	 */
	ext.rotX = 0;

	/**
	 *	@member rotY
	 *	@memberof DomExtend.prototype
	 *	@description The y rotation of the element in DEGREES. It is not the absolute rotation of the element on the screen.
	 *	It always starts with 0 and only relates to the offset by which this element has been programatically rotated
	 *	using the element.ext.transform function.
	 */
	ext.rotY = 0;

	/**
	 *	@member rotZ
	 *	@memberof DomExtend.prototype
	 *	@description The z rotation of the element in DEGREES. It is not the absolute rotation of the element on the screen.
	 *	It always starts with 0 and only relates to the offset by which this element has been programatically rotated
	 *	using the element.ext.transform function.
	 */
	ext.rotZ = 0;

	/**
	 *	@member scaleX
	 *	@memberof DomExtend.prototype
	 *	@description The x scale of the element. It is not the absolute scale of the element on the screen.
	 *	It always starts with 1 and only relates to the offset by which this element has been programatically scaled
	 *	using the element.ext.transform function.
	 */
	ext.scaleX = 1;

	/**
	 *	@member scaleY
	 *	@memberof DomExtend.prototype
	 *	@description The y scale of the element. It is not the absolute scale of the element on the screen.
	 *	It always starts with 1 and only relates to the offset by which this element has been programatically scaled
	 *	using the element.ext.transform function.
	 */
	ext.scaleY = 1;

	/**
	 *	@member scaleZ
	 *	@memberof DomExtend.prototype
	 *	@description The z scale of the element. It is not the absolute scale of the element on the screen.
	 *	It always starts with 1 and only relates to the offset by which this element has been programatically scaled
	 *	using the element.ext.transform function.
	 */
	ext.scaleZ = 1;

	ext.setX = function(v) { ext.x = v; return ext; };
	ext.setY = function(v) { ext.y = v; return ext; };
	ext.setZ = function(v) { ext.z = v; return ext; };

	ext.transformToString = function(values) {
		values = values || ext;

		var t = "";

		if(values.x) t += "translateX(" + values.x + "px) ";
		if(values.y) t += "translateY(" + values.y + "px) ";
		if(Simplrz.css3d && !force2d) t += "translateZ(" + values.z + "px) ";
		
		if(values.rotX && Simplrz.css3d) t += "rotateX(" + values.rotX + "deg)  ";
		if(values.rotY && Simplrz.css3d) t += "rotateY(" + values.rotY + "deg)";
		if(values.rotZ && Simplrz.css3d) t += "rotateZ(" + values.rotZ + "deg) ";
		else if(values.rotZ) t += "rotate(" + values.rotZ + "deg) ";
		
		if(values.scaleX != 1) t += "scaleX(" + values.scaleX + ") ";
		if(values.scaleY != 1) t += "scaleY(" + values.scaleY + ") ";
		if(values.scaleZ != 1 && Simplrz.css3d) t += "scaleZ(" + values.scaleZ + ")";
	
		return t;
	};


	/**
	 *	@method transform
	 *	@memberof DomExtend.prototype
	 *	@description Applies the transformation values to the elements CSS transform property. The values can either be set via
	 *	the member variables: x, y, z, rotX, rotY, rotZ, scaleX, scaleY, scalez or passed as argument to this function. The argument needs to be a object literal
	 *	containing the properties that needs to be affectd names in the same way, i.e. x, y, z, rotX...
	 *
	 * @example
// First select the object
var e = EXT.select('#someElement');

// Move the element 10px to the right
e.ext.x = 10;
e.ext.transform();

// Move the element 10px down
e.ext.transform({ y: 10 });

// Rotate the element in 3d around the y axis by 45deg
// (note that for this to work ok, you need to setup the persepctive on the parent element in CSS)
e.ext.transform({ rotY: 45 });

	 */
	ext.transform = function(values) {
		if(values) {
			for(var i in values) {
				ext[i] = values[i];
			}
		}

		var t = ext.transformToString(ext, force2d);
		element.style[Simplrz.prefixedProp('transform')] = t;
		element.style["transform"] = t;
	};
};








