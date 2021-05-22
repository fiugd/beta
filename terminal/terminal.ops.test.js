//show-preview
import { readSourceDir } from './terminal.ops.js';
/*
there are two kinds of events from workers:
	- events that happen before worker closes (like console.log)
	- events that terminate the worker process
*/


class ProcessWorker {

	constructor(url){
		this.url = url;
		this.run = this.run.bind(this);
		
		this.header = `console.log = (...log) => postMessage({ log });`;
		this.footer = `
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
		`.replace(/^			/gm, '');
		this.updateSource();
	}
	
	updateSource(){
		this.blob = new Promise(async (resolve, reject) => {
			const body = await (await fetch(this.url)).text()
			resolve(new Blob(
				[ this.header, body, this.footer ],
				{ type: "text/javascript" }
			));
		});
	}

	run(args, logger){
		return new Promise(async (resolve, reject) => {
			const worker = new Worker(
				window.URL.createObjectURL(await this.blob)
			);
			worker.onmessage = function(e) {
				const {result, log, error} = e.data;
				log && logger(log);
				(result||error) && resolve({ result, error })
			};
			worker.postMessage(args);
		});
	}

	watch(){}

	close(){}
}


(async() => {
	// get all ops from bin folder and make them workers
	// should also save these to cache
	const bins = await readSourceDir('/terminal/bin');
	const workers = bins?.response?.map(x => 
		new ProcessWorker(x.download_url)
	);
	//const result = await workers[0].run(['foo args'], console.log)
	//console.log({ result });
	
	const arbRes = await (new ProcessWorker('./bin/cat.js'))
		.run({
			cwd: document.location.origin + '/crosshj/fiug-beta',
			file: 'README.md'
		}, console.log);
	console.log(arbRes);
})();