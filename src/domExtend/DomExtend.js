/**
 *	@namespace DomExtend
 */
var DomExtend = (function() {

	var that = {};

	/**
	 *	@method create
	 *	@memberof DomExtend
	 *	@static
	 *	@param {string} tag - the name of the tag to create
	 *	@description Created a HTMLElement of type defined by the tag. It first calls <code>document.createElement(tag)</code> 
	 *	and the extends this element with DomExtend functionality.
	 */
	that.create = function(tag, cssclass) {
		var e = document.createElement(tag);
		if(cssclass) e.classList.add(cssclass);
		that.extend(e);
		return e;
	};

	/**
	 *	The equivalent of <code>document.querySelector</code>. It extends the object
	 *	with DomExtend functionality before returning the result.
	 *
	 *	@method select
	 *	@memberof DomExtend
	 *	@static
	 *	@param {string} sel - the CSS selector to query
	 *	@param {HTMLElement=} element - the HTML element to query on, defaults to document 
	 */
	that.select = function(sel, element) {
		var e = (element || document).querySelector(sel);
		if(e && !e.ext) that.extend(e);
		return e;
	};

	/**
	 *	The equivalent of <code>document.querySelectorAll</code>. It extends the objects
	 *	with DomExtend functionality before returning the result and it returns them as regular Array (yay!)
	 *
	 *	@method select
	 *	@memberof DomExtend
	 *	@static
	 *	@param {string} sel - the CSS selector to query
	 *	@param {HTMLElement=} element - the HTML element to query on, defaults to document 
	 */
	that.selectAll = function(sel, element) {
		var es = (element || document).querySelectorAll(sel);
		var nes = es.length, r = [];
		for(var i = 0; i < nes; i++) {
			var e = es[i]
			if(!e.ext) e = that.extend(e);
			r.push(e);
		}
		return r;
	};

	/**
	 *	@method extend
	 *	@memberof DomExtend
	 *	@static
	 *	@param {HTMLElement} element - the tag to extend
	 *	@description adds the .ext property to the element, with all the DomExtend functionality. This method should be rarely used and if you 
	 *	find yourself using it a lot, you need to rethink the code. All element selected with EXT.select or element.ext.select 
	 *	or created with EXT.create will be already extended.
	 */
	that.extend = function(element) {

		if(element.ext) return element;

		var ext = {};

		/**
		 *	The equivalent of <code>element.querySelector</code>. It extends the object
		 *	with DomExtend functionality before returning the result.
		 *
		 *	@method select
		 *	@memberof DomExtend.prototype
		 *	@param {string} sel - the CSS selector to query
		 */
		ext.select = function(sel) {
			return that.select(sel, element);
		};

		/**
		 *	The equivalent of <code>element.querySelectorAll</code>. It extends the objects
		 *	with DomExtend functionality before returning the result and it returns them as regular Array (yay!)
		 *
		 *	@method select
		 *	@memberof DomExtend.prototype
		 *	@param {string} sel - the CSS selector to query
		 */
		ext.selectAll = function(sel) {
			return that.selectAll(sel, element);
		};

		/**
		 *	@method detach
		 *	@memberof DomExtend.prototype
		 *	@description Safely removes the element from it's parent node. It is the same as saying 
		 *	element.parentNode.removeChild(element) but will not throw an error if parentNode is null.
		 */
		ext.detach = function() {
			var p = element.parentNode;
			if(!p) return;
			p.removeChild(element);
		};

		/**
		 *	@method attachTo
		 *	@memberof DomExtend.prototype
		 *	@description Safely attaches the element to a parent node. It is the same as saying 
		 *	parent.appednChild(element) but will not throw an error if child is already added to parent.
		 */
		ext.attachTo = function(parent) {
			if(element.parentNode == parent) return;
			else parent.appendChild(element);
		}

		// Add State related functions (see State.js for details)
		if(window.ExtState) ExtState(ext, element);

		// Add Transform related functions (see Transform.js for details)
		if(window.ExtTransform) ExtTransform(ext, element);

		// Add Transition related functions (see Transition.js for details)
		if(window.ExtTransition) ExtTransition(ext, element); 

		// Add Animation related functions (see Transition.js for details)
		if(window.ExtAnimation) ExtAnimation(ext, element, that); 

		ext.element = element;
		element.ext = ext;
		return element;
	};

	window.EXT = that;

	return that;

})();