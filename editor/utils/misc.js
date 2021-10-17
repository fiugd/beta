import ext from "../../shared/icons/seti/ext.json.mjs";
import { codemirrorModeFromFileType } from "../../shared/modules/utilities.mjs";

function htmlToElement(html) {
	var template = document.createElement("template");
	html = html.trim(); // Never return a text node of whitespace as the result
	template.innerHTML = html;
	//also would be cool to remove indentation from all lines
	return template.content.firstChild;
}

let getMime = () => {};
(async () => {
	const source = await (await fetch('/modules/service-worker.utils.js')).text();
	const SWUtils = eval(`
		(function(){
		const module = { exports: {} };
		${source}
		const { exports } = module;
		return exports;
		})()
	`);
	SWUtils.initMimeTypes();
	getMime = SWUtils.getMime;
})();

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
		};
	}
	if (extension === 'hbs'){
		type = {name: "handlebars", base: "text/html"}
	}
	return type;
}

const showFileInEditor = (filename, contents) => {
	const fileType = getFileType(filename);
	return !["image", "font", "audio", "video", "zip"].includes(fileType) &&
		!(typeof fileType === "string" && fileType.includes('image/'));
};

export { htmlToElement, getExtension, getFileType, codemirrorModeFromFileType, showFileInEditor };
