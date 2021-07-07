const cacheName = `v0.4.9`;
const root = `https://beta.fiug.dev`;
const cache = await caches.open(cacheName);

const updates = [[
	`/crosshj/fiug-beta/shared/vendor/codemirror/addon.bundle.js`,
	`/shared/vendor/codemirror/addon.bundle.js`
],[
	`/crosshj/fiug-beta/modules/Editor.mjs`,
	`/_/modules/Editor.mjs`
],[
	`/crosshj/fiug-beta/modules/editorEvents.mjs`,
	`/_/modules/editorEvents.mjs`
],[
	`/crosshj/fiug-beta/modules/operationsEvents.mjs`,
	`/_/modules/operationsEvents.mjs`
],[
	`/crosshj/fiug-beta/modules/state.mjs`,
	`/_/modules/state.mjs`
]];


const updateCache = async (source, target) => {
	const bundleText = await fetch(root+source).then(x => x.text());
	const opts = {
		headers: {
			'Content-Type': 'application/javascript; charset=utf-8'
		}
	};
	await cache.put(root+target, new Response(bundleText, opts));
};

for(var i=0, len=updates.length; i<len; i++){
	await updateCache(...updates[i]);
}

console.log(`\nupdated:\n ${updates.map(([,x]) => x).join('\n')}`);