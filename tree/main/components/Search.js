import { htmlToElement, utils } from '../../utils/misc.js';

const SearchBoxHTML = () => {
	const style = `
	<style>
		.tree-search {
			display: flex;
			flex-direction: column;
			margin-right: 0;
			user-select: none;
		}
		.tree-search p {
			white-space: normal;
		}
		.tree-search input {
			background: var(--main-theme-background-color) !important;
			margin: 0 !important;
			border: 0 !important;
			color: var(--main-theme-text-color);
			padding-left: .5em !important;
			padding-right: .5em !important;
			font-size: 1.1em !important;
			box-sizing: border-box !important;
			padding-top: .25em !important;
			padding-bottom: .25em !important;
			height: unset !important;
			transition: unset !important;
			border: 1px solid !important;
			border-color: transparent !important;
		}
		.tree-search input:focus {
			box-shadow: none !important;
			border-color: rgb(var(--main-theme-highlight-color)) !important;
		}
		.tree-search ::placeholder,
		.project-search-results {
			color: var(--main-theme-text-invert-color);
		}
		.tree-search > div {
			padding: 2px 0px;
			box-sizing: content-box;
		}
		.tree-search .field-container {
			margin-left: 17px;
			margin-right: 10px;
		}
		.tree-search .highlight {
			background: rgba(var(--main-theme-highlight-color), 0.25);
			padding-top: 4px;
			padding-bottom: 4px;
			filter: contrast(1.5);
			border-radius: 3px;
		}
		.form-container {
			position: absolute;
			top: 40px;
			left: 0;
			right: 0;
			bottom: 0;
			overflow: hidden;
		}
		.search-results::-webkit-scrollbar {
			display: none;
		}
		.search-results:hover::-webkit-scrollbar {
			display: block !important;
		}
		.search-results::-webkit-scrollbar {
			width:0.5em !important;
			height:0.5em !important;
		}
		.search-results::-webkit-scrollbar-thumb{
			background: #ffffff10;
		}
		.search-results::-webkit-scrollbar-track{
			background:none !important;
		}
		.search-results {
			padding-bottom: 15em;
			position: absolute;
			bottom: 0;
			top: 155px;
			overflow-y: auto;
			overflow-x: hidden;
			box-sizing: border-box;
			margin: 0;
			left: 0;
			right: 0;
			font-size: 0.9em;
			padding-right: 0;
		}
		.search-results > li { list-style: none; }

		.search-results > li > div {
			padding-left: 1em;
			padding-bottom: 0.2em;
			padding-top: 0.2em;
		}
		.search-results > li ul > li {
			white-space: nowrap;
			padding-left: 3em;
			padding-top: .2em;
			padding-bottom: .2em;
		}

		.search-results > li > div,
		.search-results > li ul > li,
		.search-results > li > div span,
		.search-results > li ul > li span {
			position: relative;
			white-space: nowrap;
		}
		.search-results ul.line-results > li > span,
		.search-results ul.line-results > li > div {
			user-select: none;
			pointer-events: none;
		}
		.search-results > li > div .hover-highlight,
		.search-results > li ul > li .hover-highlight {
			position: absolute;
			left: 0;
			right: 0;
			top: 0;
			bottom: 0;
			visibility: hidden;
			pointer-events: none;
			user-select: none;
			background: rgba(var(--main-theme-highlight-color), 0.15);
		}
		.search-results > li > div:hover .hover-highlight,
		.search-results > li ul > li:hover .hover-highlight {
			visibility: visible;
		}

		.search-summary {
			font-size: .85em;
			opacity: 0.7;
		}
		.search-results .foldable {
			cursor: pointer;
		}
		.search-results span.doc-path {
			opacity: .5;
		}
		.search-results .foldable ul { display: none; }
		.search-results .foldable > div span {
			pointer-events: none;
			user-select: none;
		}
		.search-results .foldable > div:before {
			margin-left: 4px;
			margin-right: 3px;
			content: '>';
			font-family: consolas, monospace;
			display: inline-block;
		}
		.search-results .foldable.open ul { display: block; }
		.search-results .foldable.open > div:before {
			margin-left: 2px;
			margin-right: 5px;
			content: '>';
			transform-origin: 5px 8.5px;
			transform: rotateZ(90deg);
		}
		.field-container label { font-size: .75em; }

	</style>
	`;

	const html = `
	<div class="form-container tree-search">
		${style}

		<div class="field-container">
			<input type="text" placeholder="Search" class="search-term project-search-input" spellcheck="false"/>
		</div>

		<div class="field-container">
			<label>include</label>
			<input type="text" class="search-include"/>
		</div>

		<div class="field-container">
			<label>exclude</label>
			<input type="text" class="search-exclude"/>
		</div>

		<div class="field-container">
			<span class="search-summary"></span>
		</div>

		<ul class="search-results"></ul>
	</div>
	`;

	return html;
};

class SearchBox {
	dom;

	constructor(parent, include) {
		const main = htmlToElement(SearchBoxHTML());
		this.dom = {
			main,
			term: main.querySelector(".search-term"),
			include: main.querySelector(".search-include"),
			exclude: main.querySelector(".search-exclude"),
			summary: main.querySelector(".search-summary"),
			results: main.querySelector(".search-results"),
		};
		this.dom.include.value = include || "./";
		this.attachListeners();
		(parent || document.body).appendChild(main);
	}

	attachListeners() {
		const debouncedInputListener = utils.debounce(
			(event) => {
				const term = this.dom.term.value;
				const include = this.dom.include.value;
				const exclude = this.dom.exclude.value;
				this.updateResults([], "");
				this.updateSummary({});
				this.searchStream({ term, include, exclude });
			},
			250,
			false
		);
		this.dom.term.addEventListener("input", (e) => {
			const term = this.dom.term.value;
			if (!term) {
				this.term = "";
				this.updateSummary({});
				this.dom.results.innerHTML = "";
				this.updateResults([], "");
				return;
			}
			this.updateSummary({ loading: true });
			this.updateResults({ loading: true });
			debouncedInputListener(e);
		});
		this.dom.include.addEventListener("input", (e) => {
			this.updateSummary({ loading: true });
			this.updateResults({ loading: true });
			debouncedInputListener(e);
		});
		this.dom.exclude.addEventListener("input", (e) => {
			this.updateSummary({ loading: true });
			this.updateResults({ loading: true });
			debouncedInputListener(e);
		});
		this.dom.results.addEventListener("click", (e) => {
			const handler = {
				"DIV foldable": () => e.target.parentNode.classList.add("open"),
				"DIV foldable open": () => e.target.parentNode.classList.remove("open"),
				"LI line-results": (e) => triggers.fileSelect(e.target.dataset),
			}[`${e.target.tagName} ${e.target.parentNode.className.trim()}`];

			if (handler) return handler(e);
		});
	}

	async searchStream({ term, include, exclude }) {
		this.dom.results.innerHTML = "";
		this.updateSummary({});

		const base = new URL("../../service/search", location.href).href;
		const res = await fetch(
			`${base}/?term=${term}&include=${include || ""}&exclude=${exclude || ""}`
		);
		const reader = res.body.getReader();
		const decoder = new TextDecoder("utf-8");
		const timer = { t1: performance.now() };
		let allMatches = [];
		let malformed;
		this.resultsInDom = false;
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			let results = decoder.decode(value, { stream: true });
			if (malformed) {
				results = malformed.trim() + results.trim();
				malformed = "";
			}
			if (results.trim()[results.trim().length - 1] !== "}") {
				results = results.split("\n");
				malformed = results.pop();
				results = results.join("\n");
			}
			results = results.split("\n").filter((x) => !!x);
			this.updateResults(results, allMatches, term);
			this.updateSummary({
				allMatches,
				time: performance.now() - timer.t1,
				searchTerm: term,
			});
		}
	}

	updateTerm(term) {
		this.dom.term.value = term;
	}

	updateInclude(path) {
		this.dom.include.value = path;
	}

	hide() {
		this.dom.main.style.visibility = "hidden";
	}

	show() {
		this.dom.main.style.visibility = "visible";
	}

	async updateResults(results, allMatches, term) {
		const addFileResultsLineEl = (result) => {
			const limit = 1; //only highlight one occurence
			const listItemEl = (Array.isArray(result) ? result : [result]).map(
				(r, i) => `
					<li data-source="${r.file}" data-line="${r.line}" data-column="${r.column}">
						<div class="hover-highlight"></div>
						${utils.highlight(term, utils.htmlEscape(r.text.trim()), limit)}
					</li>
				`
			);
			return listItemEl;
		};
		const createFileResultsEl = (result, index) => {
			const items = ["html", "json", "info"];
			const iconClass =
				"icon-" + items[Math.floor(Math.random() * items.length)];
			const open = term.length > 1 || !this.resultsInDom ? "open" : "";
			const fileResultsEl = htmlToElement(`
				<li class="foldable ${open}" data-path="${result.file}">
					<div>
						<div class="hover-highlight"></div>
						<span class="${iconClass}">${result.docName}</span>
						<span class="doc-path">${result.path}</span>
					</div>
					<ul class="line-results">
						${addFileResultsLineEl(result).join("\n")}
					</ul>
				</li>
			`);
			return fileResultsEl;
		};
		for (var rindex = 0; rindex < results.length; rindex++) {
			const x = results[rindex];
			try {
				const parsed = JSON.parse(x);
				parsed.docName = parsed.file.split("/").pop();
				parsed.path = parsed.file
					.replace("/" + parsed.docName, "")
					.replace(/^\.\//, "");
				allMatches.push(parsed);

				window.requestAnimationFrame(() => {
					const existingFileResultsEl = this.dom.results.querySelector(
						`li[data-path="${parsed.file}"] ul`
					);
					let newLineItems;
					if (existingFileResultsEl) {
						newLineItems = addFileResultsLineEl(parsed);
					}
					if (newLineItems) {
						const elementItems = newLineItems.map(htmlToElement);
						existingFileResultsEl.append(...elementItems);
						return;
					}
					const fileResultsEl = createFileResultsEl(parsed, rindex);
					this.dom.results.appendChild(fileResultsEl);
					this.resultsInDom = true;
				});
			} catch (e) {
				console.warn(`trouble parsing: ${x}, ${e}`);
			}
		}
	}

	updateSummary({ allMatches, time, searchTerm, loading }) {
		if (loading) {
			this.dom.summary.innerHTML = "";
			return;
		}
		if (!allMatches || !allMatches.length) {
			this.dom.summary.innerHTML = "No results";
			return;
		}
		const totalFiles = utils
			.unique(allMatches.map((x) => x.docName))
			.map((x) => ({
				filename: x,
				results: [],
			}));
		const pluralRes = allMatches.length > 1 ? "s" : "";
		const pluralFile = totalFiles.length > 1 ? "s" : "";
		this.dom.summary.innerHTML = `${allMatches.length} result${pluralRes} in ${
			totalFiles.length
		} file${pluralFile}, ${time.toFixed(2)} ms`;
	}
}


let searchBox;
const Search = (parent) => {
	searchBox = searchBox || new SearchBox(parent);
	searchBox.hide();
	/*
	searchBox.updateTerm(searchTerm);
	searchBox.updateInclude(path)
	searchBox.searchStream({ term: searchTerm, include: path })
*/

	return searchBox;
};

export default Search;
