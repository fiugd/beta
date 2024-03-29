const extToClass = {
	"erb.html": "ruby",
	"html.erb": "ruby",
	"php.inc": "php",
	"smarty.tpl": "smarty",
	"tf.json": "terraform",
	adb: "ada",
	adoc: "asciidoc",
	ads: "ada",
	ai: "ai",
	apl: "apl",
	as: "assemblyscript",
	asp: "asp",
	avi: "video",
	babelrc: "babel",
	bat: "shell",
	bf: "brainfuck",
	bmp: "image",
	bowerrc: "bower",
	bugs: "platformio",
	c: "c",
	cfc: "coldfusion",
	cfm: "coldfusion",
	cjsx: "react",
	clj: "clojure",
	clj: "clojure",
	cljc: "clojure",
	cljs: "clojure",
	cls: "tex",
	cmd: "shell",
	cmx: "ocaml",
	cmxa: "ocaml",
	coffee: "coffee",
	config: "config",
	cpp: "cpp",
	cr: "crystal",
	cs: "csharp",
	cs: "csharp",
	css: "css",
	csv: "csv",
	ctp: "cake_php",
	d: "d",
	dart: "dart",
	dhtml: "html",
	direnv: "config",
	dtx: "tex",
	editorconfig: "config",
	edn: "clojure",
	ejs: "ejs",
	elm: "elm",
	env: "config",
	eot: "font",
	erl: "erlang",
	es6: "javascript",
	es7: "javascript",
	eslintrc: "eslint",
	ex: "elixir",
	fish: "shell",
	flowconfig: "flow",
	fs: "fsharp",
	fth: "forth",
	gif: "image",
	gitattributes: "git",
	gitconfig: "git",
	gitignore: "git",
	gitkeep: "git",
	gitmodules: "git",
	gltf: "json",
	go: "go",
	gradle: "gradle",
	grails: "grails",
	groovy: "grails",
	gz: "zip",
	h: "c",
	haml: "haml",
	handlebars: "mustache",
	hbs: "mustache",
	hh: "hacklang",
	hjs: "mustache",
	hs: "haskell",
	htaccess: "apache",
	htm: "html",
	html: "html",
	ico: "image",
	ini: "config",
	ink: "ink",
	ins: "tex",
	ipynb: "json",
	iso: "zip",
	jade: "jade",
	java: "java",
	jl: "julia",
	jpeg: "image",
	jpg: "image",
	js: "javascript",
	jshintrc: "jshint",
	json: "json",
	jsx: "react",
	key: "key",
	kt: "kotlin",
	less: "less",
	lhs: "haskell",
	license: "license",
	liquid: "liquid",
	lisp: "lisp",
	lock: "lock",
	ls: "livescript",
	lua: "lua",
	m: "c",
	md: "markdown",
	mjs: "javascript",
	ml: "ocaml",
	mli: "ocaml",
	mov: "video",
	mp3: "audio",
	mp4: "video",
	mpg: "video",
	mustache: "mustache",
	nim: "nim",
	npmignore: "npm",
	ogg: "audio",
	ogv: "video",
	pas: "pascal",
	pdf: "pdf",
	pem: "key",
	php: "php",
	piskel: "image",
	pl: "perl",
	png: "image",
	pony: "pony",
	pp: "puppet",
	ppm: "ppm",
	pro: "prolog",
	profile: "shell",
	psd: "photoshop",
	pug: "pug",
	py: "python",
	r: "r",
	raku: "raku",
	rar: "zip",
	rb: "ruby",
	rs: "rust",
	sass: "sass",
	sbt: "sbt",
	scala: "scala",
	scm: "scheme",
	scratch: "smarty",
	scss: "sass",
	sh: "shell",
	shtml: "html",
	slim: "slim",
	slugignore: "config",
	smarty: "smarty",
	sql: "sql",
	sql: "sql",
	sss: "css",
	stache: "mustache",
	static: "config",
	sty: "tex",
	styl: "stylus",
	svg: "svg",
	swift: "swift",
	tex: "tex",
	tf: "terraform",
	tmp: "clock",
	ts: "typescript",
	tsx: "react",
	ttf: "font",
	twig: "twig",
	txt: "default",
	uml: "uml",
	vala: "vala",
	vim: "vim",
	viminfo: "vim",
	vimrc: "vim",
	vue: "vue",
	wat: "wat",
	wav: "audio",
	webm: "video",
	wmv: "video",
	woff2: "font",
	woff: "font",
	wxml: "wxml",
	wxss: "wxss",
	xcodeproj: "xcode",
	xml: "xml",
	yaml: "yml",
	yml: "yml",
	zig: "zig",
	zip: "zip",
	zsh: "shell",
};

const overrides = {
	".md": "info"
};

export default (file) => {
	const ext = file.split('.').slice(-1);
	let _ext;
	try { _ext = (ext+'').toLowerCase(); }
	catch(e) { console.log(ext); }
	let icon = extToClass[_ext];
	if(!icon) console.log('no icon for: ' + ext);

	const override = Object.entries(overrides).find(([k,v]) => {
		return file?.toLowerCase().endsWith(k)
	});
	if(override) icon = override[1];

	return icon || 'default'
};
