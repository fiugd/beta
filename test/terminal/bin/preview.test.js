import {operation} from '/crosshj/fiug-beta/terminal/bin/preview.js';

const createElement = () => ({
	classList: {
		add: () => {},
		remove: () => {}
	},
	prepend: () => {}
});

self.document = {
	location: self.location,
	querySelector: createElement,
	createElement
};

const args = {
	eventName: 'init',
	cwd: "crosshj/fiug-beta",
	file: "*.js",
	//file: "index.html",
	watch: true,
	event: {
		cwd: "crosshj/fiug-beta",
		file: "index.html",
		watch: true
	}
};

let done;
const previewDone = new Promise((resolve, reject) => {
	done = (response) => {
		console.log(response || 'preview done');
		resolve();
	};
})

const response = await operation(args, done);
console.log(response);

await previewDone;
