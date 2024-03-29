/*
	NOTE: chalk is locked to v4 until v5 get figured out by skypack
*/

export const importmap = () => {
	return `
{
	imports: {
		ansiEscapes: "https://cdn.skypack.dev/ansi-escapes@4.3.2",
		chalk: "https://cdn.skypack.dev/chalk@4",
		fileSaver: "https://cdn.skypack.dev/file-saver",
		jsZip: "https://cdn.skypack.dev/@progress/jszip-esm",
		lodash: "https://cdn.skypack.dev/lodash",
		papaParse: "https://cdn.skypack.dev/papaparse",
		rollup: "https://unpkg.com/rollup/dist/rollup.browser.js",
		rollupPluginSourceMap: "https://cdn.jsdelivr.net/npm/source-map@0.7.3/dist/source-map.js",
		terser: "https://cdn.jsdelivr.net/npm/terser/dist/bundle.min.js",
	}
}
`.trim()+ '\n';
};
