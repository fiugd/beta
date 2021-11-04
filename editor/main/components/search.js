const Search = () => {
	const searchDiv = document.createElement("div");
	searchDiv.id = "file-search";
	searchDiv.innerHTML = `
		<style>
			#file-search {
				visibility: hidden;
				position: absolute;
				background: var(--main-theme-color);
				height: 34px;
				box-shadow: inset 0px -2px 0px 0px var(--theme-subdued-color);
				/* border: 3px solid var(--main-theme-color); */
				display: flex;
				justify-content: space-between;
				align-items: center;
				cursor: default;
				border-bottom: 6px solid var(--main-theme-color);
				box-sizing: content-box;
				right: 8px;
				left: 0;
				width: auto;
				padding: 0.45em;
				z-index: 10;
			}
			.collapse-handle {
				width: 1.5em;
				text-align: center;
				font-stretch: expanded;
				font-family: system-ui, monospace;
				font-size: 1.2em;
			}
			.search-field {
				margin-left: 0;
				flex: 1;
				height: 75%;
			}
			.search-field input {
				height: 100% !important;
				background: var(--main-theme-background-color) !important;
				margin: 0 !important;
				border: 0 !important;
				color: var(--main-theme-text-color);
				padding-left: .5em !important;
				padding-right: .5em !important;
				font-size: 1.1em !important;
				box-sizing: border-box !important;
				transition: unset !important;
			}
			.search-field input:focus {
				border: 1px solid !important;
				box-shadow: none !important;
				border-color: rgb(var(--main-theme-highlight-color)) !important;
			}
			.search-count,
			.search-no-results {
				margin-left: 1.2em;
				margin-right: auto;
				min-width: 5em;
			}
			.search-controls {
				margin-right: 0.5em;
				margin-left: 1em;
				font-family: system-ui, monospace;
				font-size: 1.1em;
				user-select: none;
			}
			.search-controls span {
				min-width: 1.4em;
				display: inline-block;
				cursor: pointer;
				text-align: center;
			}
			#file-search ::placeholder {
				color: var(--main-theme-text-invert-color);
			}
		</style>
		<div class="collapse-handle">></div>
		<div class="search-field">
			<input
				type="text"
				autocomplete="off"
				autocorrect="off"
				autocapitalize="off"
				spellcheck="false"
				placeholder="Find"
			/>
		</div>
		<div class="search-count hidden">
			<span class="search-count-current">X</span>
			<span>of</span>
			<span class="search-count-total">Y</span>
		</div>
		<span class="search-no-results">No results</span>
		<div class="search-controls">
			<span class="search-up">↑</span>
			<span class="search-down">↓</span>
			<span class="search-close">X</span>
		</div>
	`;
	return searchDiv;
};

export default Search;
