//show-preview
var theBase = document.getElementsByTagName("base"); 
theBase[0].href = '/';

import { importCSS, htmlToElement } from '/crosshj/fiug-beta/.welcome/.tools/misc.mjs';
import EditorModule from "/shared/modules/editor.mjs";
const fetchTEXT = (url, opts) => fetch(url, opts).then(x => x.text());

/*
TODO:

"viewport" overlay
scrolling
selections
current line
code folding
tab width

events hooked up; not just page load
horizontal scroll shadow
horizontal scroll

minor: fontlegibility
unsure: seems to be flickering on scroll

turn into plugin

NOTES:
https://stackoverflow.com/questions/40066166/canvas-text-rendering-blurry

*/

// MINI-MAP

const tokenlist = [
	"#text", "#space", "comment", "string", "string-2", "number", "variable", "variable-2",
	"def", "operator", "keyword", "atom", "meta", "tag", "tag bracket", "attribute", "qualifier",
	"property", "builtin", "variable-3", "type", "string property", "tab"
];

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
		return syntaxColorsTokens;
}

const SideBar = ({text, tabWidth=5}, editor) => {
	const lines = text.split('\n');

	const container = document.querySelector('.simulation');
	const codeMirrorDom = document.querySelector('.simulation .CodeMirror');
	const colors = SyntaxColors(codeMirrorDom);

	const sidebarDiv = htmlToElement(`
		<div class="cm-sidebar">
			<div class="side overflow">
				<canvas></canvas>
				<div class="scroll-handle"></div>
			</div>
		</div>
	`);
	container.append(sidebarDiv);

	const canvas = sidebarDiv.querySelector('canvas');
	const ctx = canvas.getContext('2d');
	const side = sidebarDiv.querySelector('.side')
	const scrollHandle = sidebarDiv.querySelector('.scroll-handle');

	canvas.style.imageRendering ='pixelated';
	const fontSize = 1.85;
	const fontWidth = fontSize * .55;
	const leftMargin = 10;
	canvas.style.width ='100%';
	// canvas.style.height='100%';
	canvas.width  = canvas.offsetWidth+1;
	//canvas.height = canvas.offsetHeight+1;
	canvas.height = (lines.length+50) * fontSize;
	const viewportHeight = sidebarDiv.clientHeight*.103;

	scrollHandle.style.height = viewportHeight + 'px';

	const scrollPercent = (percent) => {
		{
			const maxScroll = sidebarDiv.clientHeight - viewportHeight;
			const mod = 0.01 * maxScroll;
			scrollHandle.style.top = Math.floor(percent*mod) + 'px';
		}
		{
			const maxScroll = canvas.height-side.clientHeight;
			const mod = -.01 * maxScroll;
			canvas.style.top = Math.floor(percent*mod) + 'px';
		}
	};
	let scrolled = 0;
	side.onwheel = (e) => {
		const speedModifier = 1/-60
		let delta = e.wheelDelta * speedModifier;
		if(scrolled >= 100 && delta > 0) return;
		if(scrolled === 0 && delta <= 0) return;

		let change = scrolled+delta;
		if(change <= 0) change = 0;
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
	};

	ctx.font = fontSize + 'px system-ui';

	lines
		.forEach((line, i) => {
		const tokenized = getLineTokens(line, i, editor);
		const tabsAtFront = (
			line.match(/^\t+/g) || []
		)[0]?.length || 0;
		const leadTabWidth = tabsAtFront * fontWidth * tabWidth
		for(const t in tokenized){
			const toke = tokenized[t];
			ctx.fillStyle = colors[toke.token];
			ctx.fillText(toke.text, leadTabWidth+leftMargin+(toke.offset*fontWidth), 2+(fontSize*i));
		}
	})
}

// TEST

const Editor = (opts) => new Promise((resolve, reject) => {
	EditorModule(opts, (err, data) => {
		SideBar(opts, window.Editor)
		if(err) return reject(err);
		resolve(data);
	})
});

const text = JSON.stringify(JSON.parse(localStorage.getItem('react-todo')||''), null, 2)
	|| (new Array(100)).fill().map(x => 'console.log("hello world")').join('\n');

const opts = {
	text,
	mode: 'javascript',
	lineWrapping: false
};

const baseDom = () => {
	return `
<style>
	body .simulation {
		height: auto; position: absolute; left: 0; right: 0; top: 2.2em; bottom: 0em;
		overflow: scroll; display: flex; flex-direction: row;
	}
	body .simulation:hover .CodeMirror .CodeMirror-vscrollbar {
		overflow: auto !important;
	}
	body .CodeMirror-scrollbar-filler,
	body .CodeMirror .CodeMirror-vscrollbar {
		background:#1e1e1e !important;
		width:7px
	}
	body .CodeMirror .CodeMirror-vscrollbar > div::-webkit-scrollbar-thumb {
		width: 20px !important;
	}
	.functionInput{ visibility: hidden; }
	.CodeMirror { height: 100%;  flex: 1; }
	.CodeMirror-sizer { margin-right: 110px; }
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
	.side {
		overflow-y: hidden;
		position: relative;
	}
	.side canvas {
		position: absolute;
	}
	.side .scroll-handle {
		position: absolute;
		top: 0;
		width: 100%;
		background: #fff;
		opacity: 0;
		transition: opacity .2s;
	}
	.side:hover .scroll-handle {
		opacity: 0.07;
	}
</style>

<div class="simulation">
	<textarea class="functionInput">
	</textarea>
</div>

`.trim();
};

(async () => {
	await importCSS('/crosshj/fiug-beta/.welcome/shared.styl')
	await importCSS('/index.css')
	document.documentElement.className = 'dark-enabled';
	document.body.innerHTML += baseDom();
	const sampleText = await fetchTEXT('/crosshj/fiug-beta/.welcome/.tools/misc.mjs');
	opts.text=''
	opts.text+=sampleText
	opts.text+=sampleText;
	opts.text+=`
\n\n\n\n\n//======================================================\n\n\n\n\n
`;
	opts.text+=sampleText;
	opts.text+=sampleText;
	const editor = await Editor(opts);
})()
