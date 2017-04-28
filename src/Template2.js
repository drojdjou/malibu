var Template2 = function(content, isLive, defaultValues) {

	var selectorCache;
	var that = {};
	var TEXT = "#text";

	var reactiveNodes;
	var __dirty = false;
	var vars;
	that.vars;

	that.set = function(content, isLive) {
		if(content instanceof HTMLElement) {
			that.content = EXT.extend(isLive ? content : content.cloneNode(true));
		} else {
			var df = document.createElement('div');
			df.innerHTML = content ? content.trim() : "";
			that.content = EXT.extend(df.firstChild);
		}

		reactiveNodes = [];
		vars = {};
		that.vars = {};

		var walker = document.createTreeWalker(that.content);
		while(walker.nextNode()) {
			var n = walker.currentNode;
			var v = n.nodeValue;
			if(n.nodeName == TEXT && v.trim() != "" && v.indexOf("{{") > -1) {
				reactiveNodes.push({
					node: n, text: v, vars: {}
				});
			}
		}

		reactiveNodes.forEach(function(r) {

			var re = /{{(.*?)}}/g;
			var m = r.text.match(re);
			m.forEach(function(p) {
				p = p.replace(/{|}/g, "").trim();

				r.vars.p = "";

				if(vars[p]) {
					vars[p].push(r);
				} else {
					vars[p] = [r];
					(function() {
						var _v = "", _p = p;
						Object.defineProperty(that.vars, p, {
							get: function() {
								return _v;
							},
							set: function(v) {
								_v = v;
								update(_p, _v);
							}
						});
					})();
				}

				var d = defaultValues[p];
				if(d !== undefined) that.vars[p] = d;

			});
		});


		selectorCache = {}; 

		return that;
	}

	that.render = function() {
		console.log(vars);
		for(var k in vars) {
			update(k, vars[k]);
		}
	}

	var update = function(key, value) {
		if(vars[key]) {
			vars[key].forEach(function(r) {
				if(value !== undefined && value !== null) r.vars[key] = value;
				if(!r._text) r._text = r.text;
				for(var k in r.vars) r._text = r._text.replace("{{" + k + "}}", r.vars[k]);
			});
			if(!__dirty) window.requestAnimationFrame(redraw);
			__dirty = true;
		} else {
			throw "key: " + key + " not found on template";
		}
	}

	var redraw = function() {
		reactiveNodes.forEach(function(r) {
			if(r._text) {
				r.node.textContent = r._text;
				r._text = null;
			}
		});
		__dirty = false;
	}

	that.select = function(sel) {
		if(selectorCache[sel]) {
			return selectorCache[sel];
		} else {
			var e = that.content.ext.select(sel);
			if(!e) throw "Selector not found: " + sel;
			selectorCache[sel] = e;
			return e;
		}
	}

	that.clearCache = function() {
		selectorCache = {}; 
	}

	that.attachTo = function(parent, onAdded) {

		if(!that.content) return;

		that.content.ext.attachTo(parent);
		if(onAdded) {
			// http://jsfiddle.net/CAewW/2/
			requestAnimationFrame(function() {
				requestAnimationFrame(onAdded);
			});
		}
	}

	that.detach = function(onBeforeRemove) {

		if(!that.content) return;

		if(onBeforeRemove) {
			onBeforeRemove(function() {
				that.content.ext.detach();
			});
		} else {
			that.content.ext.detach();
		}
	}

	if(content) that.set(content, isLive)

	return that;
}








