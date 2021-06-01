/*
TODO:
styles from minimap-attempt2.js (hopefully nothing big)
code folding
tab width
line wrapping
horizontal scroll shadow
horizontal scroll
events hooked up
	- [ ] window resize
	- [ ] code fold open/close
	- [X] select text
	- [X] document load
	- [X] text change
minor: fontlegibility
unsure: seems to be flickering on scroll
sometimes minimap loads blank, not sure when

NOTES:
https://stackoverflow.com/questions/40066166/canvas-text-rendering-blurry

*/

(function(mod) {
	if (typeof exports == "object" && typeof module == "object") // CommonJS
		mod(require("../../lib/codemirror"));
	else if (typeof define == "function" && define.amd) // AMD
		define(["../../lib/codemirror"], mod);
	else // Plain browser env
		mod(CodeMirror);
})(function(CodeMirror) {
	"use strict";
	
	const tokenlist = [
		"#text", "#space", "comment", "string", "string-2", "number", "variable", "variable-2",
		"def", "operator", "keyword", "atom", "meta", "tag", "tag bracket", "attribute", "qualifier",
		"property", "builtin", "variable-3", "type", "string property", "tab"
	];

	const htmlToElement = function htmlToElement(html) {
		const template = document.createElement('template');
		template.innerHTML = (html||'').trim();
		return template.content.firstChild;
	};

	document.body.append(htmlToElement(`
	<style>
		.cm-sidebar { flex:0; position: relative; }
		.cm-sidebar .side {
			width: 100px;
			background: #1e1e1e;
			position: absolute;
			height: 100%;
			right: 7px;
			border-right: 1px solid #333;
			z-index: 9;
		}
		.cm-sidebar .overflow {
			box-shadow: -2px 0px 3px 0px #0000004d;
		}
		.cm-sidebar .side {
			overflow-y: hidden;
			position: relative;
		}
		.cm-sidebar .side canvas {
			position: absolute;
		}
		.cm-sidebar .side .scroll-handle {
			position: absolute;
			top: 0;
			width: 100%;
			background: #fff;
			opacity: 0;
			transition: opacity .2s;
		}
		.cm-sidebar .side:hover .scroll-handle,
		.cm-sidebar .scroll-handle.dragging {
			opacity: 0.07;
		}
	</style>
	`));

	const getLineTokens = (line, i, editor) => {
		const lineTokens = editor.getLineTokens(i, true);
		if(!lineTokens.length){
			return {
				offset: 0,
				token: '#text',
				text: line
			};
		}
		return lineTokens.map((x) => {
			const { start, type, string } = x;
			return {
				offset: start,
				token: type || '#text',
				text: string
			};
		})
	}

	const SyntaxColors = (parent) => {
		const syntaxColorsTokens = {
			'#text': 'rgba(255,255,255,1)',
			'#space': 'transparent',
		};
		for (var i = 0, len = tokenlist.length; i < len; i++) {
				var key = tokenlist[i];
				if(['#text', '#space'].includes(key)) continue;
				const span = document.createElement("span");
				span.className = "cm-" + key.replace(" ", " cm-");
				span.innerText = span;
				parent.appendChild(span);
				syntaxColorsTokens[key] = getComputedStyle(span)["color"];
				span.remove();
		}
		{
			const div = document.createElement('div');
			div.className = 'CodeMirror-selected';
			parent.appendChild(div);
			syntaxColorsTokens.selection = getComputedStyle(div)["background-color"];
			div.remove();
		}
		return syntaxColorsTokens;
	}

	let colors;
	const fontSize = 1.85;
	const fontWidth = fontSize * .55;
	const leftMargin = 10;
	
	let textCanvas;
	let selectCanvas;
	let textCtx;
	let selectCtx;

	const SideBar = ({text, tabWidth=5}, editor) => {
		const ALMOST_ZERO_TRUTHY = 1e-20;
		const { scrollPastEndPadding } = editor.state;
		const scrollEndPad = Number(
			scrollPastEndPadding.replace('px', '')
		);
		const overScroll = Math.floor(scrollEndPad/19.5);
		const lines = text.split('\n');

		const container = document.querySelector('.simulation');
		const codeMirrorDom = document.querySelector('.simulation .CodeMirror');
		colors = colors || SyntaxColors(codeMirrorDom);

		// TODO: this should be used for horizontal overflow: https://www.geeksforgeeks.org/check-whether-html-element-has-scrollbars-using-javascript/

		let sidebarDiv = document.querySelector('.cm-sidebar');
		let firstLoad;
		if(!sidebarDiv){
			sidebarDiv = htmlToElement(`
				<div class="cm-sidebar">
					<div class="side overflow">
						<canvas></canvas>
						<div class="scroll-handle"></div>
					</div>
				</div>
			`);
			container.append(sidebarDiv);
		}

		const canvas = sidebarDiv.querySelector('canvas');
		const ctx = canvas.getContext('2d');
		const side = sidebarDiv.querySelector('.side')
		const scrollHandle = sidebarDiv.querySelector('.scroll-handle');

		canvas.style.imageRendering ='pixelated';
		canvas.style.width ='100%';
		canvas.width  = canvas.offsetWidth+1;
		canvas.height = (lines.length+overScroll) * fontSize;

		textCanvas = textCanvas || new OffscreenCanvas(canvas.width, canvas.height);
		selectCanvas = selectCanvas || new OffscreenCanvas(canvas.width, canvas.height);
		textCtx = textCtx || textCanvas.getContext('2d');
		selectCtx = selectCtx || selectCanvas.getContext('2d');
		selectCtx.globalAlpha = 0.5;
		// canvas.style.height='100%';
		const viewportHeight = sidebarDiv.clientHeight*.1025;

		scrollHandle.style.height = viewportHeight + 'px';

		const scrollPercent = (percent, updateEditor=true) => {
			if(canvas.height > side.clientHeight){
				const maxScroll = side.clientHeight - viewportHeight;
				const mod = 0.01 * maxScroll;
				scrollHandle.style.top = Math.floor(percent*mod) + 'px';
			}
			if(canvas.height <= side.clientHeight){
				const maxScroll = canvas.height > viewportHeight
					? canvas.height - viewportHeight
					: 0;
				const mod = 0.01 * maxScroll;
				scrollHandle.style.top = Math.floor(percent*mod) + 'px';
			}
			if(canvas.height > side.clientHeight){
				const maxScroll = canvas.height-side.clientHeight;
				const mod = -.01 * maxScroll;
				canvas.style.top = Math.floor(percent*mod) + 'px';
			}
			if(updateEditor){
				const maxScroll = editor.doc.height;
				const mod = 0.01 * maxScroll;
				const top = percent*mod;
				editor.scrollTo(0,top>maxScroll ? maxScroll : top)
			}
		};
		let scrolled = ALMOST_ZERO_TRUTHY;
		editor.getScrollerElement().addEventListener('scroll', function(e) {
			const percent = 100*e.target.scrollTop/editor.doc.height;
			scrolled = percent;
			scrollPercent(percent, false);
		});
		scrollHandle.onmousedown = (() => {
			let previous;
			let startScroll;
			scrollHandle.ondragstart = () => false;
			const onMouseMove = (mouseMoveEvent) => {
				if(!previous || !startScroll) return;

				const { pageY } = mouseMoveEvent;
				const percentageMod = 115; //should be 100, but fudging a little for better usability
				const scrollChange = percentageMod*(pageY-previous)/Math.min(side.clientHeight, canvas.height);
				const newScroll = startScroll + scrollChange;
				if(newScroll >= 0 && newScroll <= 100) scrolled = newScroll;
				if(newScroll < 0) scrolled = ALMOST_ZERO_TRUTHY;
				if(newScroll > 100) scrolled = 100;

				scrollPercent(scrolled);
			};
			const onMouseUp = () => {
				scrollHandle.classList.remove('dragging');
				previous = startScroll = undefined;
				document.removeEventListener('mousemove', onMouseMove);
				document.removeEventListener('mouseup', onMouseUp);
			};
			return (mouseDownEvent) => {
				mouseDownEvent.preventDefault();
				scrollHandle.classList.add('dragging');
				startScroll = scrolled;
				previous = mouseDownEvent.pageY;
				document.addEventListener('mousemove', onMouseMove);
				document.addEventListener('mouseup', onMouseUp);
			};
		})();
		side.onwheel = (e) => {
			const speedModifier = 1/-60
			const delta = e.wheelDelta * speedModifier;
			let change = scrolled+delta;
			if(change <= 0) change = ALMOST_ZERO_TRUTHY;
			if(change > 100) change = 100;
			scrolled = change;
			scrollPercent(scrolled);
		};
		scrollPercent(scrolled);
		canvas.onclick = (e) => {
			const rect = e.target.getBoundingClientRect();
			const y = e.clientY - rect.top;
			scrolled = 100*y/canvas.clientHeight;
			scrollPercent(scrolled);
			e.preventDefault();
		};

		textCtx.font = fontSize + 'px system-ui';
		textCtx.clearRect(0,0,canvas.width, canvas.height);
		lines
			.forEach((line, i) => {
			const tokenized = getLineTokens(line, i, editor);
			const tabsAtFront = (
				line.match(/^\t+/g) || []
			)[0]?.length || 0;
			const leadTabWidth = tabsAtFront * fontWidth * tabWidth
			for(const t in tokenized){
				const toke = tokenized[t];
				textCtx.fillStyle = colors[toke.token];
				textCtx.fillText(toke.text, leadTabWidth+leftMargin+(toke.offset*fontWidth), 2+(fontSize*i));
			}
		});

		ctx.clearRect(0,0,canvas.width, canvas.height);
		ctx.drawImage(selectCanvas,0,0);
		ctx.drawImage(textCanvas,0,0);
	}

	const Selections = (editor) => {
		let sidebarDiv = document.querySelector('.cm-sidebar');
		const canvas = sidebarDiv.querySelector('canvas');
		const ctx = canvas.getContext('2d');

		const selections = editor.listSelections();

		selectCtx.clearRect(0,0,canvas.width, canvas.height);
		selections
			.forEach((range) => {
				const { anchor, head } = range;
				//if(head.line === anchor.line) return;
				selectCtx.fillStyle = colors.selection;
				selectCtx.fillRect(0, head.line*fontSize, canvas.width, (anchor.line-head.line+1)*fontSize);
			});

		ctx.clearRect(0,0,canvas.width, canvas.height);
		ctx.drawImage(selectCanvas,0,0);
		ctx.drawImage(textCanvas,0,0);
	};
	
	const listenMap = {
		change: (cm) => SideBar({ text: cm.getValue() }, cm),
		cursor: (cm) => Selections(cm),
		scroll: () => {},
	};

	const listener = (which) => (...args) => {
		const thisListener = listenMap[which] || (() => console.log(`minimap: ${which}`));
		thisListener(...args);
	};

	listener('load')();

	const minimapExt = function(cm, val, old) {
		if (old && old != CodeMirror.Init) return;
		if (old == CodeMirror.Init) old = false;
		if (!old == !val) return;
		if(!val) return;

		listener('init')();

		cm.on("change", listener('change'));
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