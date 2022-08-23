/*
:root {
	--main-theme-color: #e8e8e8;
	--main-theme-highlight-color: 3, 155, 229;
	--main-theme-background-color: white;
	--main-theme-background-dark-color: #eee;
	--main-theme-text-color-dark: green;
	--main-theme-text-color: black;
	--main-theme-text-invert-color: white;
	--theme-subdued-color: #f5f5f5;
	--theme-text-color: #fff;
	--theme-text-selected: orange;
	--tree-selected: #dadada;
	--tree-hover: orange;
	--code-line-selected: orange;
}
:root.dark-enabled {
	--main-theme-color: #1e1e1e;
	--main-theme-highlight-color: 60, 180, 190;
	--main-theme-highlight-color-FOR-PICKER: rgb(60, 180, 190);
	--main-theme-background-color: #363636;
	--main-theme-background-dark-color: #29252b;
	--main-theme-text-color-dark: green;
	--main-theme-text-color: #c2c2c2;
	--main-theme-text-invert-color: #818181;
	--theme-subdued-color: #262626;
	--theme-text-color: black;
	--theme-text-selected: #82e3ae;
	--tree-selected: #094771;
	--tree-hover: #333;
	--code-line-selected: orange;
}

*/

function getVariable(key) {
	const r = document.querySelector(':root');
	const rs = getComputedStyle(r);
	const value = rs.getPropertyValue(key);
	return value;
}

function setVariable(key, value) {
	const r = document.querySelector(':root');
	r.style.setProperty(key, value);
}

/*

- set multiple variables (theme)
- pick theme: :root.monokai, :root.darkplus

- xterm
	term.setOption('theme', {
		background: '#fdf6e3'
	});
	https://xtermjs.org/docs/api/terminal/interfaces/itheme/
- codemirror
	const theme = "zenburn"
	editor.setOption('theme', theme);
	- https://github.com/winitop/Theme-VSCode-Dark/blob/master/vscode-dark.css
	https://github.com/FarhadG/code-mirror-themes/tree/master/themes
	https://rodydavis.com/posts/codemirror-dynamic-theme/
*/

