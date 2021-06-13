const cacheName = 'terminal-cache'

export const readSourceDir = async (dir) => {
	const site = location.origin;
	const root = site.includes('beta')
		? `https://api.github.com/repos/crosshj/fiug-beta`
		: `https://api.github.com/repos/crosshj/fiug`;
	const githubContentsUrl = `${root}/contents${dir||''}?ref=gh-pages`;
	let response, error;
	try {
		const cache = await caches.open(cacheName);
		const match = await cache.match(githubContentsUrl)
			|| await cache.add(githubContentsUrl)
			|| await cache.match(githubContentsUrl);
		response = await match.json();
	} catch(e) {
		error = e.message;
	}
	return { response, error };
};

const updateSWCache = (bins) => {
	console.warn(`
		TODO: add files to SW cache under /_/modules/terminal/bin
		this avoids having to add these to service.manifest.json
	`.replace(/^\t+/gm, '').trim());
};

const debounce = (func, wait, immediate) => {
		var timeout;
		return async function() {
			var context = this, args = arguments;
			var later = function() {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
	};

class ProcessWorker {
	header = `
		console.log = (...log) => postMessage({
			log: log.join('')+'\\n'
		});
	`.replace(/^		/gm, '').trim()
	
	footer = `
		let script;
		onmessage = async (e) => {
			let result, error;

			// TODO: maybe in future be more fancy with events
			if(e.data?.type === "events"){}
			try {
				script = script || e.data;
				result = await operation(script || e.data);
			} catch(e){
				error = e.message;
			}
			const exit = !(script || e.data).watch;
			postMessage({ result, error, exit });
		}
	`.replace(/^		/gm, '').trim()

	constructor(url, {comm, setListenerKey}){
		this.comm = comm;
		this.setListenerKey = setListenerKey;
		this.url = url;

		let moduleResolver;
		this.module = new Promise((resolve) => { moduleResolver = resolve; });
		let blobResolver;
		this.blob = new Promise((resolve) => { blobResolver = resolve; });
		const baseUrl = (new URL('./', location)).href.split('terminal')[0] + 'terminal';
		(async (resolve) => {
			const module = new (await import(url)).default;
			moduleResolver(module);
			const body = `
				const baseUrl = "${baseUrl}";
				const operation = ${module.operation.toString()};
			`.replace(/^				/gm, '');
			const blob = new Blob(
				[ this.header, '\n\n', body, '\n\n',this.footer ],
				{ type: "text/javascript" }
			);
			blobResolver(blob);
		})();
	}
	run(args, logger, done){
		const { comm, setListenerKey } = this;
		const { attach } = comm;

		const promise = new Promise(async (resolve) => {
			const blob = await this.blob;
			const worker = new Worker(
				URL.createObjectURL(blob),
				{ name: this.url.split('/').pop() }
			);
			const exitWorker = () => {
				worker.onmessage = undefined;
				logger('\n')
				done();
				worker.terminate();
				resolve();
			};
			worker.onmessage = (e) => {
				const { result, log, exit, error } = e.data;
				log && logger(log);
				result && logger(result);
				error && logger('ERROR: ' + error);//should be red?
				if(exit || error) exitWorker();
			};
			worker.postMessage(args);

			//NOTE: this is a very rough version of watch mode
			// eventName 'Operations' is hard coded and maybe should change
			if(args.watch){
				const messagePost = (args) => {
					worker.postMessage({ type: "events", ...args });
				};
				const listener = debounce(messagePost, 1000, false);
				const response = await attach({
					name: 'node',
					listener,
					eventName: 'fileChange',
				});
				setListenerKey(response.key);
				//worker.postMessage({ type: "events", ...response });
			}
		});
		return promise;
	} 
}

async function invoke(args, done){
	const cwd = await this.getCwd();
	const logger = (msg) => {
		this.term.write(msg);
	};
	logger('\n');
	await this.process.run({ cwd, ...args }, logger, done);
}

function exit(){
	if(this.listenerKey){
		const { detach } = this.comm;
		detach(this.listenerKey);
	}
}

class DynamicOp {
	constructor(url, term, comm, getCwd){
		this.term = term;
		this.comm = comm;
		this.invoke = invoke.bind(this);
		this.exit = exit.bind(this);
		this.getCwd = getCwd;
		this.setListenerKey = (key) => this.listenerKey = key;

		const process = new ProcessWorker(url, this);
		this.process = process;
		this.worker = process.worker;
		const thisOp = this;

		return new Promise(async (resolve) => {
			const module = await process.module;
			thisOp.args = module.args
			thisOp.keyword = module.keyword;
			thisOp.help = () => module.usage;
			resolve(thisOp);
		});
	}
}

const GetDynamicOps = async (term, comm, getCwd) => {
	const bins = await readSourceDir('/terminal/bin');
	updateSWCache(bins);
	const ops = [];
	for(let i=0, len=bins.response.length; i<len; i++){
		const {name} = bins.response[i];
		const op = await new DynamicOp(
			`./bin/${name}`,
			term, comm, getCwd
		);
		ops.push(op);
	}
	//TODO: should attach a listener which watches for file changes
	//when invoke is called with watch arg, should register with this listener
	//then when file changes, will refresh
	return ops;
}
export default GetDynamicOps
