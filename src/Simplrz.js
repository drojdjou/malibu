/**
 *	@namespace Simplrz
 *
 *	@description Feature detection utility.
 *
 *	<p><h2>Using Simplrz</h2>
 *
 *	<p>Simplr is initialized at startup and all test are done immediately. 
 *	The results of the tests are stored in boolean variables listed below. 
 *	Overtime new features are added and some old ones can be discarded, 
 *	so be sure to check the docs from time to time.
 *
 *	<blockquote>
 *	<h5>Note on detecting some CSS features</h5>
 *
 *	<p>After reading this (https://github.com/zamiang/detect-css3-3d-transform)
 *	I realized detecting css3d transforms is unreliable. But also - we don't really need it
 *	because typically the only browser we need to support that doesn't do css 3d transforms
 *	is IE9 and IE8 so why not do some good old browser sniffing?
 *
 *	<p>As a reminder: IE9 - only 2d transforms, no transitions, no animations, IE8 - not even 2d.
 *	</blockquote>
 *
 *	<p>Using Simplrz is very simple in JS, please refer to the first example below. 
 *	Simplrz also sets the names of the properties as classes to the <html> element of the document.
 *	Each class follows the same naming pattern:
 *
 *	<p><code>webgl</code> - if feature is supported the class name is simply the name of the feature.
 *	<p><code>no-webgl</code> - if feature is not supported the class name is  the name of the feature with a <code>no-</code> prefix.
 *
 *	<p>CSS stylesheets can use those classes to use conditiojnal logic. 
 *	Especially handy for example to define hover effects for non-touch only (see example below).
 *
 *	<p>Example that runs the cod in your browser and prints out all the results <a href='http://work.bartekdrozdz.com/malibu/test/simplrz.html'>is here</a>.
 *
 *	@example
if(Simplrz.touch) {
	document.addEventListener('touchstart', onDown);
} else {
	document.addEventListener('mousedown', onDown);
}
 *
 *	@example
// Assuming we use LESS

// This will only work on non-touch screens
.no-touch a:hover {
  text-decoration: underline;
}

#app {
  .webgl-warning {
    display: none;
  }

  // If webgl is not supported, show the warning
  .no-webgl & .webgl-warning {
    display: block;
  } 
}
 */
var Simplrz = (function() {

	var s = {}, classes = ['js']; // Add 'js' class by default (bc if this code runs, JS is enabled, right?)

	var isLocal = location.host.indexOf('local') > -1 || location.host.indexOf('192.168') > -1 || location.host.indexOf('10.0') > -1;

	var check = function(feature, test) {
		var result = test();
		s[feature] = (result) ? true : false;
		classes.push( (result) ? feature : "no-" + feature );

		document.documentElement.setAttribute("class", classes.join(" "));
	}

	/**
	 *	@member pixelRatio
	 *	@memberof Simplrz
	 *	@description Same vallue as <code>window.devicePixelRatio</code>
	 */
	s.pixelRatio = window.devicePixelRatio || 1;

	var prefix = (function () {

		var styles = "", pre = "", dom = "";

		if(window.getComputedStyle) {
			styles = window.getComputedStyle(document.documentElement, '');
			if(styles) { // Bug in Firefox - this will be null if in iframe and it's set to display:none
				var m = Array.prototype.slice.call(styles).join('');
				if(m) {
					pre = (m.match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o']))[1];
					dom = ('WebKit|Moz|MS|O').match(new RegExp('(' + pre + ')', 'i'))[1];
				}
			}
		}

		return {
			dom: dom,
			lowercase: pre,
			css: '-' + pre + '-',
			js: (pre == "") ? "" : pre[0].toUpperCase() + pre.substr(1)
		};
	})();

	/**
	 *	@member prefix
	 *	@memberof Simplrz
	 *	@description whar is the browser vendor prefix (-ms, -webkit, -moz...)
	 *
	 *	@returns {Object} contins several versions of the prefix, see example below.
	 *
	 *	@example
{
	dom: "Webkit",
	lowercase: "webkit,
	css: "-webkit-",
	js: "Webkit"
}
	 */
	s["prefix"] = prefix;
	classes.push(prefix.lowercase);

	s.prefixedProp = function(prop) {
		switch(prefix.lowercase) {
			case "webkit": return "webkit" + prop.charAt(0).toUpperCase() + prop.slice(1);
			case "ms": return "-ms-" + prop;
			case "moz": return "Moz" + prop.charAt(0).toUpperCase() + prop.slice(1);
			default: return prefix.css + prop;
		}
	} 

	// -- BROWSER HACKS BEGIN -- 

	/**
	 *	@member {Boolean} ie
	 *	@memberof Simplrz
	 *	@description false if browser is not IE, true it is is. No version detection.
	 */
	s.ie = navigator.userAgent.match(/MSIE/) || navigator.userAgent.match(/Trident/);
	classes.push(s.ie ? "ie" : "no-ie");

	/**
	 *	@member {Boolean} firefox
	 *	@memberof Simplrz
	 *	@description True if the device is an iPad.
	 */
	s.firefox = navigator.userAgent.match(/Firefox/); // prefix.lowercase == "moz";
	classes.push(s.firefox ? "firefox" : "no-firefox");

	/**
	 *	@member {Boolean} safariDesktop
	 *	@memberof Simplrz
	 *	@description True if the the browser is a Safari on desktop Mac.
	 */
	s.safariDesktop = navigator.userAgent.match(/Safari/) && !navigator.userAgent.match(/Chrome/) && !('ontouchstart' in document);
	classes.push(s.safariDesktop ? "safari-desktop" : "no-safari-desktop");

	// s.ipad7 = navigator.userAgent.match(/iPad;.*CPU.*OS 7_\d/i) || false;
	// classes.push(s.ipad7 ? "ipad7" : "no-ipad7");

	/**
	 *	@member {Boolean} iOS
	 *	@memberof Simplrz
	 *	@description True if the device runs on iOS (as of iOS 13 we need to outsmart Apple a bit)
	 */
	s.iOS = /(iPad|iPhone|iPod)/g.test(navigator.platform) || (navigator.platform == "MacIntel" && 'ontouchstart' in document);
	classes.push(s.iOS ? "ios" : "no-ios");

	/**
	 *	@member {Boolean} iPad
	 *	@memberof Simplrz
	 *	@description True if the device is an iPad (as of iOS 13 we need to outsmart Apple a bit)
	 */
	s.iPad = (navigator.platform == 'iPad') || (navigator.platform == "MacIntel" && 'ontouchstart' in document);
	classes.push(s.iPad ? "ipad" : "no-ipad");

	/**
	 *	@member {Boolean} win
	 *	@memberof Simplrz
	 *	@description True if the device is running Windows.
	 */
	s.win = (navigator.platform == 'Win32' || navigator.platform == 'Win64');
	classes.push(s.win ? "win" : "no-win");

	/**
	 *	@member {Boolean} osx
	 *	@memberof Simplrz
	 *	@description True if the device is a Mac running OSX.
	 */
	s.osx = navigator.platform.toLowerCase().indexOf('mac') >= 0;
	classes.push(s.osx ? "osx" : "no-osx");

	/**
	 *	@member {Boolean} android
	 *	@memberof Simplrz
	 *	@description True if the device is running Windows.
	 */
	s.android = ( navigator.userAgent.toLowerCase().indexOf("android") > -1);
	classes.push(s.android ? "android" : "no-android");

	s.vrbrowser = /(OculusBrowser|Mobile\sVR)/g.test(navigator.userAgent);
	classes.push(s.vrbrowser ? "vrbrowser" : "no-vrbrowser");

	// -- BROWSER HACKS END -- 



	/**
	 *	@member {Boolean} css3d
	 *	@memberof Simplrz
	 *	@description True if CSS 3d transforms are supported.
	 */
	check("css3d", function() {

		if(prefix.lowercase == 'webkit' || prefix.lowercase == 'moz') return true;

		if(prefix.lowercase == 'ms') {
			var div = document.createElement("div");
			div.style[prefix.css + "transform"] = 'translateZ(0px)';
			var cs = window.getComputedStyle(div);
			if(cs) { // Bug in Firefox - this will be null if in iframe and it's set to display:none
				var a = cs.getPropertyValue(prefix.css + "transform");
				return a && a != '' && a != 'none';
			}
		}

		return false;
	});

	/**
	*	@member {Boolean} csstransitions
	*	@memberof Simplrz
	*	@description True if CSS Transitions are supported - as of b197 (Jan 2019) always true.
	*/
	check("csstransitions", function() { return true; });

	/**
	*	@member {Boolean} cssanimations
	*	@memberof Simplrz
	*	@description True if CSS Animations are supported - as of b197 (Jan 2019) always true.
	*/
	check("cssanimations", function() { return true; });

	/**
	*	@member {Boolean} css2d
	*	@memberof Simplrz
	*	@description True if CSS 2d transforms are supported - as of b197 (Jan 2019) always true
	*/
	check("css2d", function() { return true; });

	/**
	 *	@member {Boolean} touch
	 *	@memberof Simplrz
	 *	@description True if touch events are supported.
	 */
	check("touch", function() {
		return 'ontouchstart' in document && (navigator.platform.indexOf("Win") == -1 || isLocal);
	});

	/**
	 *	@member {Boolean} pointer
	 *	@memberof Simplrz
	 *	@description True if pointer API (sort of like touch but different spec, used mostly by MS) is supported.
	 */
	check("pointer", function() {
		return !!window.navigator.pointerEnabled || !!window.navigator.msPointerEnabled;
	});

	/**
	 *	@member {Boolean} canvas
	 *	@memberof Simplrz
	 *	@description True if canvas 2d API is supported.
	 */
	check("canvas", function() {
		try { 
			var canvas = document.createElement('canvas'); 
			return canvas.getContext('2d');
		} catch(e) { 
			return false; 
		}
	});

	/**
	 *	@member {Boolean} history
	 *	@memberof Simplrz
	 *	@description True if the history API is supported.
	 */
	check("history", function() {
		return !!(window.history && history.pushState);
	});

	/**
	 *	@member {Boolean} webrtc
	 *	@memberof Simplrz
	 *	@description True if webrtc is supported.
	 */
	check("webrtc", function() {
		return ('getUserMedia' in navigator || 'webkitGetUserMedia' in navigator);
	});

	/**
	 *	@member {Boolean} webgl
	 *	@memberof Simplrz
	 *	@description True if webgl is supported.
	 */
	check("webgl", function() {
		try { 
			var canvas = document.createElement('canvas'); 
			return !!window.WebGLRenderingContext && 
				(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
		} catch(e) { 
			return false; 
		} 
	});

	// Flash is dead anyway!
	// check("flash", function() {
	// 	return !!(
	// 		navigator.mimeTypes["application/x-shockwave-flash"] || 
	// 		window.ActiveXObject && new ActiveXObject('ShockwaveFlash.ShockwaveFlash')
	// 	);
	// });

	/**
	 *	@member {Array} classes
	 *	@memberof Simplrz
	 *	@description An array containing all the classes that have been added to the <html> element.
	 */
	s.classes = classes;

	return s;

})();