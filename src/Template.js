var Template = function() {

	var that = this;
	var selectorCache;

	this.set = function(content) {
		if(content instanceof HTMLElement) {
			that.content = EXT.extend(content.cloneNode(true));
		} else {
			var df = document.createElement('div');
			df.innerHTML = content ? content.trim() : "";
			that.content = EXT.extend(df.firstChild);
		}

		selectorCache = {}; 
		
		return that;
	}

	this.wrap = function(element) {
		that.content = EXT.extend(element);
		selectorCache = {}; 
		return that;
	} 

	this.select = function(sel) {
		if(!selectorCache) selectorCache = {};

		if(selectorCache[sel]) {
			return selectorCache[sel];
		} else if(that.content) {
			var e = that.content.ext.select(sel);
			if(!e) console.warn("Template: selector not found: " + sel);
			else selectorCache[sel] = e;
			return e;
		}
	}

	this.selectAll = function(sel) {
		return this.content ? this.content.ext.selectAll(sel) : null;
	}

	this.clearCache = function() {
		selectorCache = {}; 
	}

	this.hide = function(sel) {
		that.select(sel).style.display = 'none';
	}

	this.attachTo = function(parent, onAdded) {

		if(!that.content) return;

		that.content.ext.attachTo(parent);
		if(onAdded) {
			// http://jsfiddle.net/CAewW/2/
			requestAnimationFrame(function() {
				requestAnimationFrame(onAdded);
			});
		}
	}

	this.detach = function(onBeforeRemove) {

		if(!that.content) return;

		if(onBeforeRemove) {
			onBeforeRemove(function() {
				that.content.ext.detach();
			});
		} else {
			that.content.ext.detach();
		}
	}

	this.updateText = function(sel, text) {
		console.warn('Template.updateText is deprecated, use Template.text instead');
		that.select(sel).innerHTML = text;
	}

	this.text = function(sel, text) {
		that.select(sel).innerHTML = text;
	}

	this.appendText = function(sel, text) {
		that.select(sel).innerHTML += text;
	}

	this.append = function(sel, elem) {
		that.select(sel).appendChild(elem);
	}

	this.clone = function() {

	}

	this.insertList = function(sel, list, template) {
		list.forEach(function(e) {

			if(template) {
				var t = template.content.cloneNode(true);
				t.innerHTML = e;
				that.append(sel, t);
			} else {
				that.appendText(sel, e);
			}
			
		});
	}
}