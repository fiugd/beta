const help = () => {};

const operation = async (args) => {
	const { file, cwd } = args;

	const scriptUrl = `${location.origin}/${cwd}/${file}`;
	const scriptText = await (await fetch(scriptUrl)).text();

	function AsyncHooked(original){
		const replaced = `self.asyncHooks[self.hookCount++] = `;
		return original
			//.replace(/async /gm, replaced + 'async ')
			.replace(/^[\s\t]*await /gm, '' + replaced);
	}

	const runScript = (name, src, logger) => new Promise((resolve, reject) => {
		const workerSrc = `
			console.log = (...args) => postMessage({ log: args });
			console.warn = console.info = console.log;
			console.error = (error) => postMessage({ error });
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
		.replace(/from \'\./gm, `from '${location.origin}/${cwd}`)
		.replace(/from \"\./gm, `from "${location.origin}/${cwd}`)
		.trim()
		.split('\n')
		.map(line => {
			if(!line.includes('self.asyncHooks[self.hookCount++] =')) return line;
			return line+`\nawait self.asyncHooks[self.hookCount-1];`
		})
		.join('\n');

		//console.log(workerSrc)

		const blob = new Blob([ workerSrc ], { type: "text/javascript" });
		const type = 'module';

		//TODO: consider using SW to help add stuff to files loaded as workers
		// for the time being, the above approach works (replace)
		//let url = new URL(scriptUrl+/::WORKER::/, window.location.origin);
		//let worker = new Worker(url.toString());

		const worker = new Worker(URL.createObjectURL(blob), { name, type });
		const exitWorker = () => { worker.terminate(); resolve(); };
		worker.onerror = (error) => {
			console.error(error.message || 'unknown error');
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
