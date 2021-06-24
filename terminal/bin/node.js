const help = () => {};

// NOTE: this is not a function that is ran in this context
// instead it's source is dumped into a worker
// be mindful of this!!!
const operation = async (args) => {
	const { file, cwd } = args;
	let filePath='';
	if(file.includes('/')){
		filePath = '/' + file.split('/').slice(0,-1).join('/');
	}

	const scriptUrl = `${location.origin}/${cwd}/${file}`;
	const scriptText = await (await fetch(scriptUrl)).text();

	function AsyncHooked(original){
		const replaced = `self.asyncHooks[self.hookCount++] = `;
		return original
			//.replace(/async /gm, replaced + 'async ')
			.replace(/^[\s\t]*await /gm, '' + replaced);
	}

	const runScript = (name, src, logger) => new Promise((resolve, reject) => {
		const upParent = (root, base) => {
			const oneUp = `${root}/${base}`.split('/').slice(0,-1).join('/');
			return oneUp;
		};
		const workerSrc = `
			const cwd = '${location.origin}/${cwd}';
			console.log = (...args) => postMessage({ log: args });
			console.warn = console.info = console.log;
			console.error = (error) => {
				const cleanerError = error?.message
					? { message: error.message, stack: error.stack }
					: error;
				postMessage({ error: cleanerError });
			self.asyncHooks = [];
			self.hookCount = 0;

			${AsyncHooked(src)}

			//queueMicrotask(() => {
			//	postMessage({ exit: true });
			//});
			setTimeout(async () => {
				//console.log(self.asyncHooks.length);
				await Promise.allSettled(self.asyncHooks);
				//console.log(self.asyncHooks.length);
				queueMicrotask(() => {
					postMessage({ exit: true });
				});
			}, 1);
		`.replace(/^			/gm, '')
		.replace(/from \'\.\./gm, `from '${upParent(location.origin, cwd+filePath)}`)
		.replace(/from \"\.\./gm, `from "${upParent(location.origin, cwd+filePath)}`)
		.replace(/from \'\./gm, `from '${location.origin}/${cwd+filePath}`)
		.replace(/from \"\./gm, `from "${location.origin}/${cwd+filePath}`)
		.trim()
		.split('\n')
		.map(line => {
			if(!line.includes('self.asyncHooks[self.hookCount++] =')) return line;
			return line+`\nawait self.asyncHooks[self.hookCount-1];`
		})
		.join('\n') + `
//# sourceURL=https://beta.fiug.dev/node-${file}
`;

		//console.log(workerSrc)

		const blob = new Blob([ workerSrc ], { type: "text/javascript" });
		const type = 'module';
		//TODO: give option in node to choose type
		//TODO: give option in node to run script outside worker

		//TODO: consider using SW to help add stuff to files loaded as workers
		// for the time being, the above approach works (replace)
		//let url = new URL(scriptUrl+/::WORKER::/, window.location.origin);
		//let worker = new Worker(url.toString());
		
		// NOTE/TODO: local storage and session storage not available in worker scope!!!
		// let previousUrl = sessionStorage.getItem('previousUrl');
		// if(previousUrl) URL.revokeObjectURL(previousUrl);
		const url = URL.createObjectURL(blob);
		//sessionStorage.setItem('previousUrl', url);

		const worker = new Worker(url, { name, type });
		const exitWorker = () => { worker.terminate(); resolve(); };
		worker.onerror = (error) => {
			console.error(error?.message
				? error.message
				: error || 'unknown error'
			);
			exitWorker();
		};
		worker.onmessage = (e) => {
			const { log, error, exit } = e.data;
			log && console.log(...log);
			if(exit) exitWorker();
		};
	});
	return await runScript(`node-${file}`, scriptText, postMessage);
};

export default class Node {
	keyword = 'node';
	listenerKeys = [];

	previousUrl;

	args = [{
		name: 'file', alias: 'f', type: String, defaultOption: true, required: true
	}, { 
		name: 'watch', alias: 'w', type: Boolean, required: false 
	}]

	constructor(){
		this.operation = operation;
		this.help = () => help;
	}
}
