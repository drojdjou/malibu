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

		var rp = '@-' + Simplrz.prefix.lowercase + '-keyframes ' + name + ' {' + r + '}';;
		style.appendChild(document.createTextNode(rp));

		var rn = '@keyframes ' + name + ' {' + r + '}';;
		style.appendChild(document.createTextNode(rn));

		return name;
	}

	return r;

})();