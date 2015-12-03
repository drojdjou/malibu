var ScrollStep = function(minForce, threshold) {

	threshold = threshold || 0.9;

	var easeDown = 0.92;
	var easeUp = 0.20;
	var touchMult = 64;
	
	if(Simplrz.touch) minForce /= touchMult;

	var forceMult = 1 / minForce;

	var locked = false;
	var overDown = false;

	var st = {
		threshold: threshold,
		jump: new Trigger(),
	}

	var targetLevel = 0;
	st.level = 0;

	FrameImpulse.on(function() {
		st.level += (targetLevel - st.level) * easeUp;
		if(!locked) targetLevel *= easeDown;
	});

	VirtualScroll.on(function(e) {
		var d = -e.deltaY;
		var f = Math.abs(e.deltaY);

		if(d > 0) targetLevel = Math.max(d * forceMult, targetLevel);
		if(d < 0) targetLevel = Math.min(d * forceMult, targetLevel);

		targetLevel = Math.min(1, targetLevel);
		targetLevel = Math.max(-1, targetLevel);

		if(f > minForce && !locked && Math.abs(st.level) >= threshold) {
			locked = true;
			st.jump.trigger(d > 0);
		}
	});

	st.reset = function() {
		locked = false;
	}

	return st;
}