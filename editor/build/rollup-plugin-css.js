
/*
see json plugin and following url for info on writing this plugin
https://github.com/calebdwilliams/rollup-plugin-import-assert/blob/main/src/import-assert.ts


more resources for plugins:
https://unpkg.com/browse/@rollup/pluginutils@4.1.1/dist/es/index.js


todo enable stylus parsing for css
*/

const assertMatcher = new RegExp(' assert { type: "css" }', 'g');

const newWay = (source, id) => {
	return `
const sheet = new CSSStyleSheet();
sheet.replaceSync(\`${source}\`);

// usage:
// document.adoptedStyleSheets = [
// 	sheet, ...document.adoptedStyleSheets
// ];

export default sheet;
`.trim() + '\n';
};

const oldWay = (source, id) => {
	return `
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.id = "${id.split('/').pop()}";
styleSheet.innerHTML = \`${source}\`;

// usage:
// document.head.appendChild(styleSheet);

export default styleSheet;
`.trim() + '\n';
};

function css(options={}) {

	return {
		name: 'css',

		transform(source, id) {
			if(source.includes(' assert { type: "css" }')){
				const stripAsserts = source.replace(assertMatcher,'');
				return stripAsserts;
			}
			if (id.slice(-4) !== '.css'){ return null; }
			return newWay(source, id);
		}
	}
}

export default css;
