import { chalk } from '../terminal.utils.js';

let quitButton;
let currentFile;
let matcher;
let matchedFile;
let currentFrame;

function wildcardToRegExp(s) {
	function regExpEscape (s) {
		return s.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
	}
	return new RegExp('^' + s.split(/\*+/).map(regExpEscape).join('.*') + '$');
}

const getDom = (() => {
	let previewDom;

	return () => {
		previewDom = previewDom || document.querySelector('#preview-container');
		if(previewDom) return previewDom;

		previewDom = document.createElement('div');
		previewDom.id = 'preview-container';
		previewDom.innerHTML = `
			<style>
				#preview-container {
					position: absolute; left:0; right:0; top:0; bottom:0;
					z-index: 999;
					background-color: var(--main-theme-color);
				}
				#preview-container iframe {
					position: absolute; left:0; top:0; width: 100%; height: 100%;
					border: 0;
				}
				.hidden { display: none; }
				#quit-preview {
					position: absolute;
					bottom: 10px;
					right: 17px;
					background: #222;
					padding: 0.5em 1em;
					border: 1px solid;
					color: #aaa;
					user-select: none;
					font-family: sans-serif;
				}
				#quit-preview { visibility: hidden; }
				.show-controls #quit-preview { visibility: visible; }
			</style>
			<iframe></iframe>
		`;
		document.body.prepend(previewDom);
		quitButton = document.createElement('div');
		quitButton.innerHTML = 'QUIT';
		quitButton.id = 'quit-preview';
		previewDom.append(quitButton);

		return previewDom;
	};
})();

function renderPreview(url, isNew, done){
	const previewDom = getDom();
	previewDom.classList.remove('hidden');

	const previewIframe = previewDom.querySelector('iframe');
	if(currentFrame === url){
		setTimeout(() => { previewIframe.src += '' }, 300);
		//previewIframe.contentWindow.location.reload();
		return;
	}
	const newIframe = document.createElement('iframe');
	newIframe.classList.add('hidden');
	newIframe.sandbox = 'allow-same-origin allow-scripts allow-popups allow-modals allow-downloads allow-forms allow-top-navigation allow-popups-to-escape-sandbox';
	newIframe.onload=function(){
		//newIframe.onload=undefined;
		newIframe.classList.remove('hidden');
		try {
			previewDom.removeChild(previewIframe);
		} catch(e){}
		this.contentWindow.document.addEventListener('keydown', function(event) {
			if(event.ctrlKey) previewDom.classList.add('show-controls');
		});
		this.contentWindow.document.addEventListener('keyup', function(event) {
			if(!event.ctrlKey) previewDom.classList.remove('show-controls');
		});
	};
	// TODO: should check to see if a page refresh is required
	// file that changed may not relate to file previewed
	
	// TODO: this is where cool things like HMR could take place
	// see https://itnext.io/hot-reloading-native-es2015-modules-dc54cd8cca01
	// that is, a full reload may not be required

	// TODO: DOM diffing: https://gomakethings.com/dom-diffing-with-vanilla-js/
	// TODO: here also, could be compiling/transpiling code or setting up a worker

	// TODO: reload iframe if it's the same doc => iframe.contentWindow.location.reload();
	// or message frame with new content - each template should listen for update
	// similarly: let page decide when it wants to refresh (and how) just tell it something changed
	// THIS: https://github.com/GoogleChromeLabs/comlink/tree/main/docs/examples/99-nonworker-examples/iframes
	// OR (maybe more worker focused): https://github.com/developit/workerize
	// OR (maybe more worker focused): https://github.com/developit/greenlet

	const previewUrl = (_url) => {
		const filename = _url.split('/').pop().split('?')[0];
		const extension = filename.split('.').pop();
		const rawPreview = ['html', 'htm'];
		//if(rawPreview.includes(extension)) return _url;
		return _url + '/::preview::/';
	};

	let useSrcDoc = false;
	//try {
	//	useSrcDoc = code && url.includes(filePath)
	//} catch(e){}
	// NOTE: iframe with srcdoc still doesn't want to respect base href
	// disabled this until working better

	if(useSrcDoc){
		// const base = url.split('/').slice(0,-1).join('/')+'/';
		// newIframe.srcdoc = code.includes('<head>')
		// 	? code.replace('<head>', `<head>\n<base href="${base}">\n`)
		// 	: `<html><head><base href="${base}">\n</head>${code}</html>`;
		// newIframe.classList.remove('hidden');
		// setTimeout(() => {
		// 	previewIframe.remove();
		// },100);
	} else {
		previewIframe.src ='about:blank';
		newIframe.src = previewUrl(url);
		previewDom.prepend(newIframe);
		currentFrame=url;
	}
	
	const dismissPreview = () => {
		currentFile = undefined;
		matchedFile = undefined;
		matcher = undefined;
		previewDom.classList.add('hidden');
		previewDom.classList.remove('show-controls');

		newIframe.remove();
		newIframe.src = 'about:blank';
		previewDom.append(newIframe);

		currentFrame=undefined;
		done('\n\n');
	};

	// CTRL-C ???
	quitButton.onclick = () => {
		setTimeout(dismissPreview, 1);
	};
}

function updatePreview(args, done) {
	if(matcher && !matchedFile) return {};

	if(matcher && matchedFile) {
		const isNew = currentFile !== matchedFile;
		currentFile = matchedFile;
		const url = matchedFile;
		renderPreview(url, isNew, done);
		return { isNew, url };
	}

	const { cwd, file } = args;
	const url = new URL(`${cwd}/${file}`, document.location.origin).href;
	const isNew = url !== currentFile;
	currentFile = url;
	renderPreview(url, isNew, done);
	return { isNew, url };
}

const handleInit = async (args, done) => {
	const {cwd, event } = args;
	let { file } = args
	file = file || '*.*';

	const fileIsWildcard = file.includes("*.");

	if(fileIsWildcard){
		matcher = wildcardToRegExp(file);
		return chalk.hex('#ccc')(`\nselect a file matching ${file}\n`);
	}

	return handleFileChange(args, done);
};

const handleFileSelect = async (args, done) => {
	if(!matcher) return;

	const { event, serviceUrl } = args;
	let { name, path, parent } = event.detail;
	if(!path && parent) path = parent;
	let filePath = path
		? `${path}/${name}`
		: name;
	if(filePath.startsWith('/')) filePath = filePath.slice(1);

	const absPath = `${serviceUrl}/${filePath}`;
	const isMatch = matcher.test(absPath);
	if(!isMatch || matchedFile === absPath) return;
	matchedFile = absPath;

	return handleFileChange(args, done);
};

const handleFileChange = async (args, done) => {
	const isFirst = !currentFile;
	const { isNew, url } = updatePreview(args, done);
	if(!url) return;

	const link = url => chalk.hex('#569CD6')(url);
	const progress = url => chalk.yellow(url);
	const lineBreaks = isFirst
		? '\n'
		: '\n\n';

	return isNew
		? `${lineBreaks}🔗  ${link(url)}\n🔆  `
		: progress(`|`);
};

const handlers = {
	init: handleInit,
	fileSelect: handleFileSelect,
	fileChange: handleFileChange,
};

const operation = async (args, done) => {
	const { eventName } = args;
	if(handlers[eventName]){
		return await handlers[eventName](args, done)
	}
	done(`unable to handle preview event: ${eventName}\n`);
	return;
};

export default class Preview {
	name = 'Terminal Preview';
	keyword = 'preview';
	description = 'View and interact with the output of a file as it changes using an HTML view';

	type = 'plain';
	listen = ['fileChange', 'fileSelect'];
	listenerKeys = [];

	usage = '[FILE|WILDCARD]';

	args =  [{
		name: 'file', alias: 'f', type: String, defaultOption: true, required: true
	}, { 
		name: 'watch', alias: 'w', type: Boolean, required: false, default: true
	}];

	constructor(){
		this.operation = operation;
	}
};