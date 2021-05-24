const cacheName = 'terminal-cache'

export const readSourceDir = async (dir) => {
	const site = document.location.origin;
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

class ProcessWorker {
	header = `
		console.log = (...log) => postMessage({ log });
	`.replace(/^		/gm, '').trim()
	
	footer = `
		onmessage = async (e) => {
			let result, error;
			try {
				result = await operation(e.data);
			} catch(e){
				error = e.message;
			}
			postMessage({ result, error });
			self.close()
		}
	`.replace(/^		/gm, '').trim()

	constructor(url){
		this.url = url;
		let moduleResolver;
		this.module = new Promise((resolve) => { moduleResolver = resolve; });
		this.worker = new Promise(async (resolve) => {
			const module = new (await import(url)).default;
			moduleResolver(module);
			const body = `
			const operation = ${module.operation.toString()};
			`.replace(/^			/gm, '');
			const blob = new Blob(
				[ this.header, '\n\n', body, '\n\n',this.footer ],
				{ type: "text/javascript" }
			);
			const worker = new Worker(window.URL.createObjectURL(blob));
			resolve(worker);
		});
	}
	run(args, logger, done){

		const promise = new Promise(async (resolve) => {
			const worker = await this.worker;
			worker.onmessage = (e) => {
				const { result, log, exit } = e.data;
				log && logger(log);
				result && logger(result);
				if(exit){
					worker.onmessage = undefined;
					logger('\n')
					done();
					resolve();
				}
			};
			worker.postMessage(args);
		});
		return promise;
	}
}

async function invoke(args, done){
	const worker = await this.worker;
	const logger = this.term.write;
	await this.process.run(args, logger, done);
}

function exit(){}

class DynamicOp {
	constructor(url, term, comm){
		this.term = term;
		this.comm = comm;
		this.invoke = invoke.bind(this);
		this.exit = exit.bind(this);
		const process = new ProcessWorker(url);
		this.process = process;
		this.worker = process.worker;
		(async () => {
			const module = await process.module;
			this.args = module.args
			this.keyword = module.keyword;
			this.help = () => module.usage;
		})();
	}
}

const GetDynamicOps = async (term, comm) => {
	const bins = await readSourceDir('/terminal/bin');
	const workers = bins?.response?.map(x => {
		const op = new DynamicOp('./bin/'+x.name, term, comm);
		return op;
	});
	return workers;
}
export default GetDynamicOps
