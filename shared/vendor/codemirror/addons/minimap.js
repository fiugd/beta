(function(mod) {
	if (typeof exports == "object" && typeof module == "object") // CommonJS
		mod(require("../../lib/codemirror"));
	else if (typeof define == "function" && define.amd) // AMD
		define(["../../lib/codemirror"], mod);
	else // Plain browser env
		mod(CodeMirror);
})(function(CodeMirror) {
	"use strict";

	const listener = (which) => (cm, change, e) => {
		console.log(`minimap: ${which}`);
	};

	listener('load')();

	const minimapExt = function(cm, val, old) {
		if (old && old != CodeMirror.Init) return;
		if (old === CodeMirror.Init) old = false;
		if (!old === !val) return;
		if(!val) return;

		listener('init')();

		cm.on("change", listener('change'));
		cm.on("select", listener('select'));
		cm.on("inputRead", listener('inputRead'));
		cm.on("cursorActivity", listener('cursor'));
		cm.on("scroll", listener('scroll'));
		cm.on("fold", listener('fold'));
		cm.on("unfold", listener('unfold'));
		window.onresize = listener('resize');
	};

	CodeMirror.defineOption("miniMapWidth", 64);
	CodeMirror.defineOption("miniMapSide", "left");
	CodeMirror.defineOption("miniMap", false, minimapExt);

});
