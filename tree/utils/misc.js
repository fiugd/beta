import ext from "../../shared/icons/seti/ext.json.mjs";
import { codemirrorModeFromFileType } from "../../shared/utilities.mjs";

// TODO: need a better list than any of these... probably have to make one
import mimeTypes from "https://cdn.jsdelivr.net/gh/jshttp/mime-db@master/src/nginx-types.json" assert { type: "json" };
//import mimeTypes from 'https://raw.githubusercontent.com/jshttp/mime-db/master/src/apache-types.json' assert { type: "json" };
//import mimeTypes from "https://cdn.jsdelivr.net/npm/mime-db@1.50.0/db.json" assert { type: "json" };

// TODO: maybe use insertAdjacentHTML for this instead
// this works like jquery append ^^^
function htmlToElement(html) {
	var template = document.createElement("template");
	html = html.trim(); // Never return a text node of whitespace as the result
	template.innerHTML = html;
	//also would be cool to remove indentation from all lines
	return template.content.firstChild;
}

const xfrmMimes = (m) => Object.entries(m || {})
	.map(([contentType, rest]) => ({
		contentType,
		extensions: [],
		...rest,
	}));

const getMime = (file) => xfrmMimes(mimeTypes)
	.find(({ extensions: ext }) =>
		ext.includes(file.split(".").pop())
	);

const getExtension = (fileName) =>
	((fileName.match(/\.[0-9a-z]+$/i) || [])[0] || "").replace(/^\./, "");

function getFileType(fileName = "") {
	const mime = getMime(fileName) || {};

	let type = "default";
	const extension = getExtension(fileName);
	if(mime?.contentType ){
		type = mime.contentType;
	}

	//TODO: most of this should be able to go away with addition of getExtension above...
	if (fileName.toLowerCase() === ".git/config") {
		type = "config";
	}
	if (fileName.toLowerCase() === "license") {
		type = "license";
	}
	if (ext[extension]) {
		type = ext[extension];
	}
	if (extension === "bat") {
		type = "bat";
	}
	if (extension === "scratch") {
		type = "markdown";
	}
	if (extension === "piskel") {
		type = "application/json";
	}
	if (extension === "bugs") {
		type = "markdown";
	}
	if (extension === "wat") {
		type = "text/webassembly";
	}
	if (extension === "htm" || extension === "html") {
		type = {
			name: "htmlmixed",
			mimeType: "application/x-ejs",
			icon: 'html'
		};
	}
	if (extension === 'hbs'){
		type = {name: "handlebars", base: "text/html"}
	}
	if(type === "markdown"){
		type = {
			name:"markdown",
			icon: "info"
		}
	}
	return type;
}

function friendlyModeName(type, mode){
	if(type.includes && type.includes('sharp')) return type.replace('sharp', '#');
	if('cpp' === type) return 'C++';
	if('ocaml' === type) return { name: 'OCaml' };
	if(['bat', 'cpp', 'lisp', 'raku', 'zig'].includes(type)) return type;
	if(mode.includes && mode.includes('text/x-')) return type;
	return mode;
}

const extensionMapper = (extension) => {
	const override = {
		md: "info",
	};
	const _ext = extension.toLowerCase();
	return "icon-" + (override[_ext] || ext[_ext] || "default");
};

// from tabs
// function getFileType(fileName = "") {
// 	let type = "default";
// 	const extension = ((fileName.match(/\.[0-9a-z]+$/i) || [])[0] || "").replace(
// 		/^\./,
// 		""
// 	);

// 	//console.log(extension)
// 	if (ext[extension]) {
// 		type = ext[extension];
// 	}
// 	if (extension === "md") {
// 		type = "info";
// 	}
// 	return type;
// }

const showFileInEditor = (filename, contents) => {
	const fileType = getFileType(filename);
	return !["image", "font", "audio", "video", "zip"].includes(fileType) &&
		!(typeof fileType === "string" && fileType.includes('image/'));
};

const noFrontSlash = (path) => {
	try {
		if(!path) return path;
		if(!path.includes('/')) return path;
		if(path[0] === '/') return path.slice(1);
		return path;
	} catch(e){ debugger}
};

const pathNoServiceName = (service, path) => {
	if(!path.includes('/')) return path;
	if(!path.includes(service.name)) return noFrontSlash(path);
	return noFrontSlash(
		noFrontSlash(path).replace(service.name, '')
	);
};

const getFilePath = (getCurrentService) => ({ name="", parent="", path="", next="", nextPath="" }) => {
	const nameWithPathIfPresent = (_path, _name) => _path
		? _path.endsWith(_name)
			? noFrontSlash(_path)
			: noFrontSlash(`${_path}/${_name}`)
		: noFrontSlash(_name);
	const fileNameWithPath = next
		? nameWithPathIfPresent(nextPath, next)
		: nameWithPathIfPresent(parent || path, name);
	const service = getCurrentService({ pure: true });
	return pathNoServiceName(service, fileNameWithPath);
};

/*
	Example usage of flatFromProp:

	const input = [{
		one: '1',
		two: [
			{ three: 'a' },
			{ three: 'b'}
		]
	}];
	const output = flatFromProp(input, "two")
	assert(output === [
		{ one: '1', three: 'a'},
		{ one: '1', three: 'b'},
	])

*/
const flatFromProp = (arr, prop) => arr.flatMap(
	({ [prop]: p, ...x }) => typeof p !== 'undefined' && p.length
		? p.map(y => ({ ...x, ...y }))
		: x
);

const formatHandlers = (namespace, x) => Object.entries(x)
	.reduce((all, [key, value]) => {
		return {
			...all,
			[key]: {
				listener: value,
				name: namespace
			}
		};
	}, {});

const utils = (() => {
	const unique = (arr) => Array.from(new Set(arr));
	const htmlEscape = (html) =>
		[
			[/&/g, "&amp;"], //must be first
			[/</g, "&lt;"],
			[/>/g, "&gt;"],
			[/"/g, "&quot;"],
			[/'/g, "&#039;"],
		].reduce((a, o) => a.replace(...o), html);
	const highlight = (term = "", str = "", limit) => {
		const caseMap = str
			.split("")
			.map((x) => (x.toLowerCase() === x ? "lower" : "upper"));

		const splitstring = str.toLowerCase().split(term.toLowerCase());
		let html =
			"<span>" +
			(limit === 1
				? splitstring[0] +
					`</span><span class="highlight">${term.toLowerCase()}</span><span>` +
					splitstring.slice(1).join(term.toLowerCase())
				: splitstring.join(
						`</span><span class="highlight">${term.toLowerCase()}</span><span>`
					)) +
			"</span>";
		if ((limit = 1)) {
		}
		html = html.split("");

		let intag = false;
		for (let char = 0, i = 0; i < html.length; i++) {
			const thisChar = html[i];
			if (thisChar === "<") {
				intag = true;
				continue;
			}
			if (thisChar === ">") {
				intag = false;
				continue;
			}
			if (intag) continue;
			if (caseMap[char] === "upper") {
				html[i] = html[i].toUpperCase();
			}
			char++;
		}
		return html.join("");
	};
	const debounce = (func, wait, immediate) => {
		var timeout;
		return async function () {
			var context = this,
				args = arguments;
			var later = function () {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
	};

	return {
		unique,
		htmlEscape,
		highlight,
		debounce,
	};
})();


export {
	utils,
	flatFromProp,
	formatHandlers,
	htmlToElement,
	getExtension, getFileType, codemirrorModeFromFileType, friendlyModeName,
	extensionMapper,
	noFrontSlash, pathNoServiceName, getFilePath,
	showFileInEditor
};
