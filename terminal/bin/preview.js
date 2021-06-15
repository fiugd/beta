const description = 'View and interact with the output of a file as it changes using an HTML view';

const args = [{
	name: 'file', alias: 'f', type: String, defaultOption: true, required: true
}, { 
	name: 'watch', alias: 'w', type: Boolean, required: false, default: true
}];

let previewDom;
let quitButton;
let currentFile;

const operation = async (args, done) => {
	const {cwd, file, event} = args;

	previewDom = previewDom || document.querySelector('#preview-container');
	if(!previewDom){
		previewDom = document.createElement('div');
		previewDom.id = 'preview-container';
		previewDom.innerHTML = `
			<style>
				#preview-container {
					position: absolute; left:0; right:0; top:0; bottom:0;
					z-index: 999;
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
	previewDom.classList.remove('hidden');
	const previewIframe = previewDom.querySelector('iframe');
	const url = new URL(`${cwd}/${file}`, document.location.origin).href;
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

	let useSrcDoc;
	try {
		useSrcDoc = event?.detail?.code && url.includes(event.detail.filePath)
	} catch(e){}

	// NOTE: iframe with srcdoc still doesn't want to respect base href
	// disabled this until working better
	useSrcDoc = false;
	if(useSrcDoc){
		const base = url.split('/').slice(0,-1).join('/')+'/';
		newIframe.srcdoc = event.detail.code.includes('<head>')
			? event.detail.code.replace('<head>', `<head>\n<base href="${base}">\n`)
			: `<html><head><base href="${base}">\n</head>${event.detail.code}</html>`;
		newIframe.classList.remove('hidden');
		setTimeout(() => {
			previewIframe.remove();
		},100);
	} else {
		setTimeout(() => {
			newIframe.src = url;
			newIframe.classList.remove('hidden');
			setTimeout(() => {
				previewIframe.remove();
			},100);
		}, 500); 
	}

	const dismissPreview = () => {
		currentFile = undefined;
		previewDom.classList.add('hidden');
		previewIframe.remove();
		done('preview end!!!');
	};

	// CTRL-C ???
	quitButton.onclick = () => {
		setTimeout(dismissPreview, 1);
	};

	const filePath = url.split(document.location.origin)[1];
	const isNew = filePath !== currentFile;
	currentFile = filePath;

	return isNew
		? `refresh: ${url}\n`
		: `preview: ${url}\n`;
};

export default class Preview {
	name = 'Terminal Preview';
	keyword = 'preview';
	type = 'plain';
	listenerKeys = [];
	description = description;
	usage = '[FILE]';
	args = args;

	constructor(){
		this.operation = operation;
		this.help = () => usage;
	}
};
