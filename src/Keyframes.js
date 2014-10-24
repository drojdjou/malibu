var Keyframes = (function() {

	var r = {}, style;

	var lazyInit = function() {
		style = document.createElement("style");
		document.head.appendChild(style);
	}

	r.add = function(name, selectors) {

		if(!style) lazyInit();

		var r = '';

		for(var s in selectors) {
			r += s + '% { ' + selectors[s] + ' } ';
		}

		var r = '@-' + Simplrz.prefix.lowercase + '-keyframes ' + name + ' {' + r + '}';;
		style.appendChild(document.createTextNode(r));

		return name;
	}

	return r;

})();