import { chalk } from '../terminal.utils.js';

const help = () => {};

const description = 'View and interact with the output of a file as it changes using an HTML view';

const args = [{
	name: 'file', alias: 'f', type: String, defaultOption: true, required: true
}, { 
	name: 'watch', alias: 'w', type: Boolean, required: false, default: true
}];

let previewDom;
let quitButton;
let currentFile;
let matcher;
let matchedFile;

function wildcardToRegExp(s) {
	function regExpEscape (s) {
		return s.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
	}
	return new RegExp('^' + s.split(/\*+/).map(regExpEscape).join('.*') + '$');
}

function getDom() {
	previewDom = previewDom || document.querySelector('#preview-container');
	if(!previewDom){
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
			</style>
			<iframe></iframe>
		`;
		document.body.prepend(previewDom);
		quitButton = document.createElement('div');
		quitButton.innerHTML = 'QUIT';
		quitButton.id = 'quit-preview';
		previewDom.append(quitButton);
	}
	return previewDom;
}

function updatePreview(args, done) {
	const { cwd, file, filename, event={}, serviceUrl } = args;
	const { detail={} } = event;
	const { code='' } = detail;

	const url = new URL(`${cwd}/${file}`, document.location.origin).href;
	const filePath = url.split(document.location.origin)[1];

	const isNew = filePath !== currentFile;
	currentFile = filePath;

	const previewIframe = previewDom.querySelector('iframe');
	const newIframe = document.createElement('iframe');
	newIframe.classList.add('hidden');
	previewDom.prepend(newIframe);

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

	// TODO: preview for non-html files. ${url}/::preview::/

	let useSrcDoc;
	try {
		useSrcDoc = code && url.includes(filePath)
	} catch(e){}

	const previewUrl = (_url) => {
		const filename = _url.split('/').pop().split('?')[0];
		const extension = filename.split('.').pop();
		const rawPreview = ['html', 'htm'];
		if(rawPreview.includes(extension)) return _url;
		return _url + '/::preview::/';
	};

	// NOTE: iframe with srcdoc still doesn't want to respect base href
	// disabled this until working better
	useSrcDoc = false;

	if(useSrcDoc){
		const base = url.split('/').slice(0,-1).join('/')+'/';
		newIframe.srcdoc = code.includes('<head>')
			? code.replace('<head>', `<head>\n<base href="${base}">\n`)
			: `<html><head><base href="${base}">\n</head>${code}</html>`;
		newIframe.classList.remove('hidden');
		setTimeout(() => {
			previewIframe.remove();
		},100);
	} else {
		setTimeout(() => {
			newIframe.src = previewUrl(url);
			newIframe.classList.remove('hidden');
			setTimeout(() => {
				previewIframe.remove();
			},100);
		}, isNew ? 0 : 500);
	}
	
	const dismissPreview = () => {
		currentFile = undefined;
		previewDom.classList.add('hidden');
		previewIframe.remove();
		done('\n');
	};

	// CTRL-C ???
	quitButton.onclick = () => {
		setTimeout(dismissPreview, 1);
	};
	
	return { isNew, url };
}

const handleInit = async (args, done) => {
	const {cwd, file, event } = args;
	const fileIsWildcard = file.includes("*.");

	if(fileIsWildcard){
		matcher = wildcardToRegExp(file);
		return `will preview selected files matching ${file}`;
	}

	const element = getDom();
	element.classList.remove('hidden');

	const { isNew, url } = updatePreview(args, done);

	const link = url => chalk.hex('#569CD6')(url);
	const progress = url => chalk.yellow(url);
	return isNew
		? `\n🔗  ${link(url)}\n🔆  `
		: progress(`|`);
};

const handleFileSelect = async (args, done) => {
	if(!matcher) return;

	/*
		switch preview url if both are true
		 - selected file is different from item being preview
		 - matcher exists and selected file matches

		otherwise, ignore file select
	*/
	const { file, event, serviceUrl } = args;
	const { name, path } = event.detail;
	let filePath = path
		? `${path}/${name}`
		: name;
	if(filePath.startsWith('/')) filePath.slice(1);
	try {
		const absPath = `${serviceUrl}/${filePath}`;
		matchedFile = matcher.test(absPath)
			? chalk.green(file + ": " + filePath)
			: chalk.red(file + ": " + filePath)
		return matchedFile;
	} catch(e){
		return chalk.red(e.message + '\n');
	}
};

const handleFileChange = async (args, done) => {
	/*
		always update preview when any file changes
		in the future, refine the conditions for preview update
	*/
	const { isNew, url } = updatePreview(args, done);

	const link = url => chalk.hex('#569CD6')(url);
	const progress = url => chalk.yellow(url);
	return isNew
		? `\n🔗  ${link(url)}\n🔆  `
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
	type = 'plain';
	listen = ['fileChange', 'fileSelect'];
	listenerKeys = [];
	description = description;
	usage = '[FILE]';
	args = args;

	constructor(){
		this.operation = operation;
		this.help = () => help;
	}
};
