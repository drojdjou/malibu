Template = function() {

	var that = this;

	this.content;

	var selectorCache;

	this.set = function(content) {
		if(content instanceof HTMLElement) {
			that.content = EXT.extend(content.cloneNode(true));
		} else {
			var df = document.createElement('div');
			df.innerHTML = content.trim();
			that.content = EXT.extend(df.firstChild);
		}

		selectorCache = {}; 
		
		return that;
	}

	this.select = function(sel) {
		if(selectorCache[sel]) {
			return selectorCache[sel];
		} else {
			var e = that.content.ext.select(sel);
			if(!e) throw "Selector not found: " + sel;
			selectorCache[sel] = e;
			return e;
		}
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