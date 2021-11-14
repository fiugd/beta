import { htmlToElement, utils } from '../../utils/misc.js';

const SearchBoxHTML = () => {
	const html = `
	<div class="form-container tree-search">

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
		const clickHandlers = {
				"DIV foldable": (e) => e.target.parentNode.classList.add("open"),
				"DIV foldable open": (e) => e.target.parentNode.classList.remove("open"),
				"LI line-results": (e) => {
					try {
						const { triggers: { tree: { fileSelect } } } = this.context;
						fileSelect({
							detail: e.target.dataset
						});
					} catch(error){
						console.error('unable to trigger file select from search results');
						console.error(error);
					}
				},
		};
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
			const handler = clickHandlers[
				`${e.target.tagName} ${e.target.parentNode.className.trim()}`
			];
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
	
	attachContext(context){
		this.context = context;
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
