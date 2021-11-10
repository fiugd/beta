/*!
	fiug tree component
	Version 0.4.6 ( 2021-11-10T06:59:19.838Z )
	https://github.com/fiugd/fiug/terminal
	(c) 2020-2021 Harrison Cross, MIT License
*/
const sheet = new CSSStyleSheet;

sheet.replaceSync(`body { height: 100vh; width: 100vw; }\n\n::-webkit-scrollbar { width: 8px; height: 5px; }\n::-webkit-scrollbar-corner,\n::-webkit-scrollbar-track { background: transparent; }\n::-webkit-scrollbar-thumb { background-color: #2a2a2a; }\n::-webkit-scrollbar-thumb:hover { background: #2a2a2a; }\n`);

let currentService;

let clientId;

const state = {};

const getState = key => {
    if (key) return state[key];
    return state;
};

const setState = (key, value) => state[key] = value;

const setCurrentFile = ({filePath: filePath}) => {
    const found = currentService.code.find((x => x.name === filePath || x.path === "/" + filePath || x.path === "/" + currentService.name + "/" + filePath));
    if (found) {
        currentService.state.selected = found;
        currentService.state.selected.filename = found.name;
        return;
    }
    console.error(`could not find ${filePath}`);
};

const getCurrentService = () => currentService;

const initState = (all, current) => {
    currentService = current;
    // TODO: this is UGLY - service worker should be consistent with how it returns files...
        currentService.code.forEach((x => {
        if (x.path.startsWith("/")) return;
        x.path = "/" + x.path;
    }));
    if (typeof currentService.state.selected === "string" && currentService.state.selected) {
        setCurrentFile({
            filePath: `${currentService.name}/${currentService.state.selected}`
        });
    }
};

const createClientId = () => Math.random().toString(36).slice(2).toUpperCase().split(/(.{4})/).filter((x => x)).join("_");

const getClientId = () => {
    if (clientId) return clientId;
    clientId = createClientId();
    return clientId;
};

var ext = {
    mp3: "audio",
    wav: "audio",
    ogg: "audio",
    adb: "ada",
    ads: "ada",
    adoc: "asciidoc",
    apl: "apl",
    bowerrc: "bower",
    bf: "brainfuck",
    cs: "csharp",
    c: "c",
    h: "c",
    m: "c",
    ctp: "cake_php",
    clj: "clojure",
    cljc: "clojure",
    cljs: "clojure",
    cjsx: "react",
    jsx: "react",
    tmp: "clock",
    coffee: "coffee",
    cfc: "coldfusion",
    cfm: "coldfusion",
    config: "config",
    cpp: "cpp",
    cr: "crystal",
    cs: "csharp",
    css: "css",
    dart: "dart",
    sss: "css",
    csv: "csv",
    edn: "clojure",
    editorconfig: "config",
    ejs: "ejs",
    elm: "elm",
    ttf: "font",
    woff: "font",
    woff2: "font",
    eot: "font",
    gitkeep: "git",
    gitconfig: "git",
    gitattributes: "git",
    gitmodules: "git",
    gitignore: "git",
    go: "go",
    gradle: "gradle",
    grails: "grails",
    groovy: "grails",
    hh: "hacklang",
    haml: "haml",
    hs: "haskell",
    lhs: "haskell",
    lisp: "lisp",
    htm: "html",
    html: "html",
    shtml: "html",
    dhtml: "html",
    ai: "ai",
    png: "image",
    ico: "image",
    jpg: "image",
    bmp: "image",
    jpeg: "image",
    gif: "image",
    jade: "jade",
    java: "java",
    mjs: "javascript",
    js: "javascript",
    es6: "javascript",
    es7: "javascript",
    erl: "erlang",
    ex: "elixir",
    gltf: "json",
    ipynb: "json",
    json: "json",
    jl: "julia",
    less: "less",
    license: "license",
    liquid: "liquid",
    ls: "livescript",
    lua: "lua",
    md: "markdown",
    mustache: "mustache",
    handlebars: "mustache",
    hbs: "mustache",
    hjs: "mustache",
    stache: "mustache",
    npmignore: "npm",
    ml: "ocaml",
    mli: "ocaml",
    cmx: "ocaml",
    cmxa: "ocaml",
    pdf: "pdf",
    pl: "perl",
    pro: "prolog",
    psd: "photoshop",
    php: "php",
    "php.inc": "php",
    pug: "pug",
    pp: "puppet",
    py: "python",
    rb: "ruby",
    "erb.html": "ruby",
    "html.erb": "ruby",
    rs: "rust",
    sass: "sass",
    scss: "sass",
    scm: "scheme",
    sbt: "sbt",
    scala: "scala",
    sql: "sql",
    sh: "shell",
    cmd: "shell",
    zsh: "shell",
    fish: "shell",
    profile: "shell",
    slim: "slim",
    smarty: "smarty",
    "smarty.tpl": "smarty",
    styl: "stylus",
    svg: "svg",
    swift: "swift",
    tf: "terraform",
    "tf.json": "terraform",
    tex: "tex",
    sty: "tex",
    cls: "tex",
    dtx: "tex",
    ins: "tex",
    txt: "default",
    twig: "twig",
    as: "assemblyscript",
    ts: "typescript",
    tsx: "react",
    direnv: "config",
    env: "config",
    static: "config",
    slugignore: "config",
    vala: "vala",
    wmv: "video",
    mov: "video",
    ogv: "video",
    webm: "video",
    avi: "video",
    mpg: "video",
    mp4: "video",
    xml: "xml",
    yml: "yml",
    yaml: "yml",
    vue: "vue",
    babelrc: "babel",
    eslintrc: "eslint",
    jshintrc: "jshint",
    xcodeproj: "xcode",
    zip: "zip",
    rar: "zip",
    gz: "zip",
    iso: "zip",
    key: "key",
    pem: "key",
    fs: "fsharp",
    vimrc: "vim",
    vim: "vim",
    viminfo: "vim",
    sql: "sql",
    bat: "shell",
    htaccess: "apache",
    wxml: "wxml",
    wxss: "wxss",
    ini: "config",
    clj: "clojure",
    r: "r",
    lock: "lock",
    asp: "asp",
    flowconfig: "flow",
    nim: "nim",
    kt: "kotlin",
    ink: "ink",
    zig: "zig",
    pas: "pascal",
    raku: "raku",
    fth: "forth",
    d: "d",
    pony: "pony",
    ppm: "ppm",
    wat: "wat",
    piskel: "image",
    scratch: "smarty",
    bugs: "platformio"
};

//import mimeTypes from 'https://raw.githubusercontent.com/jshttp/mime-db/master/src/apache-types.json';
//import mimeTypes from "https://cdn.jsdelivr.net/npm/mime-db@1.50.0/db.json";
// TODO: maybe use insertAdjacentHTML for this instead
// this works like jquery append ^^^
function htmlToElement$2(html) {
    var template = document.createElement("template");
    html = html.trim();
 // Never return a text node of whitespace as the result
        template.innerHTML = html;
    //also would be cool to remove indentation from all lines
        return template.content.firstChild;
}

const extensionMapper = extension => {
    const override = {
        md: "info"
    };
    const _ext = extension.toLowerCase();
    return "icon-" + (override[_ext] || ext[_ext] || "default");
};

const noFrontSlash = path => {
    try {
        if (!path) return path;
        if (!path.includes("/")) return path;
        if (path[0] === "/") return path.slice(1);
        return path;
    } catch (e) {
        debugger;
    }
};

const pathNoServiceName = (service, path) => {
    if (!path.includes("/")) return path;
    if (!path.includes(service.name)) return noFrontSlash(path);
    return noFrontSlash(noFrontSlash(path).replace(service.name, ""));
};

const getFilePath$1 = getCurrentService => ({name: name = "", parent: parent = "", path: path = "", next: next = "", nextPath: nextPath = ""}) => {
    const nameWithPathIfPresent = (_path, _name) => _path ? _path.endsWith(_name) ? noFrontSlash(_path) : noFrontSlash(`${_path}/${_name}`) : noFrontSlash(_name);
    const fileNameWithPath = next ? nameWithPathIfPresent(nextPath, next) : nameWithPathIfPresent(parent || path, name);
    const service = getCurrentService({
        pure: true
    });
    return pathNoServiceName(service, fileNameWithPath);
}
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

*/;

const flatFromProp = (arr, prop) => arr.flatMap((({[prop]: p, ...x}) => typeof p !== "undefined" && p.length ? p.map((y => ({
    ...x,
    ...y
}))) : x));

const formatHandlers = (namespace, x) => Object.entries(x).reduce(((all, [key, value]) => ({
    ...all,
    [key]: {
        listener: value,
        name: namespace
    }
})), {});

const utils = (() => {
    const unique = arr => Array.from(new Set(arr));
    const htmlEscape = html => [ [ /&/g, "&amp;" ], //must be first
    [ /</g, "&lt;" ], [ />/g, "&gt;" ], [ /"/g, "&quot;" ], [ /'/g, "&#039;" ] ].reduce(((a, o) => a.replace(...o)), html);
    const highlight = (term = "", str = "", limit) => {
        const caseMap = str.split("").map((x => x.toLowerCase() === x ? "lower" : "upper"));
        const splitstring = str.toLowerCase().split(term.toLowerCase());
        let html = "<span>" + (limit === 1 ? splitstring[0] + `</span><span class="highlight">${term.toLowerCase()}</span><span>` + splitstring.slice(1).join(term.toLowerCase()) : splitstring.join(`</span><span class="highlight">${term.toLowerCase()}</span><span>`)) + "</span>";
        if (limit = 1) ;
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
        return async function() {
            var context = this, args = arguments;
            var later = function() {
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
        unique: unique,
        htmlEscape: htmlEscape,
        highlight: highlight,
        debounce: debounce
    };
})();

const listeners$1 = {};

const triggers$3 = {};

function attach({name: name, listener: listener, eventName: eventName, options: options, key: key, context: context}) {
    if (!name || !listener || !eventName) {
        console.error("Attempt to improperly attach an event listener");
        console.error({
            name: name,
            listener: listener,
            eventName: eventName
        });
        return;
    }
    const listenerName = `${eventName}__${name}`;
    if (listeners$1[listenerName]) return;
    // TODO: alter this approach, instead use ONE event listener attached to window (?)
    // this approach kinda sucks because a lot of listeners get added to window
    // also there is less control over events as they are handled
        const _listener = e => listener(e, context || {});
    window.addEventListener(eventName, _listener, options);
    listeners$1[listenerName] = listener;
    if (key) {
        listeners$1[listenerName]._meta = {
            key: key,
            name: name,
            eventName: eventName,
            options: options
        };
    }
}

function list() {
    return Object.keys(listeners$1);
}

/*
future todo:

- when an event is triggered, don't create a custom event if event listeners exist already for that event
- instead, just trigger those

- there should be an uber listener instead of a bunch of click listeners added

*/
// this thing is used too many ways... SIGH
function trigger$1(args) {
    const {e: e, type: type, params: params, source: source, data: data, detail: detail, external: external} = args;
    const _data = typeof data === "function" ? data(e) : data || (detail || {}).data || {};
    //console.log(`triggering event: ${type}`);
        const defaultDetail = {
        ..._data,
        ...params,
        ...{
            source: source
        },
        data: _data
    };
    const _detail = detail ? {
        ...defaultDetail,
        ...detail,
        data: _data
    } : defaultDetail;
    const event = new CustomEvent(type, {
        bubbles: true,
        detail: _detail
    });
    window.dispatchEvent(event);
    // SEND INTERNAL EVENTS TO EXTERNAL
        if (external) return;
    const blackList = [ "operationDone" ];
    const triggerEvent = {
        type: type,
        detail: _detail
    };
    if (!blackList.includes(type)) {
        window.top.postMessage({
            triggerEvent: triggerEvent
        }, location);
    }
}

let triggerClickListener;

const attachTrigger = function attachTrigger({name: name, type: // the module that is attaching the listener
type = "click", data: // the input event name, eg. "click"
data, eventName: // an object or function to get data to include with fired event
eventName, filter: // the name of the event(s) that triggers are attached for (can also be a function or an array)
filter}) {
    if (type === "raw") {
        const triggerName = `${eventName}__${name}`;
        const _trigger = args => {
            trigger$1({
                ...args,
                e: args,
                data: data,
                type: eventName,
                source: name
            });
        };
        triggers$3[triggerName] = {
            eventName: eventName,
            type: type,
            trigger: _trigger
        };
        return _trigger;
    }
    if (type !== "click") {
        console.error(`triggering based on ${type} not currently supported`);
        return;
    }
    const listener = triggerClickListener || (event => {
        const foundTrigger = Object.keys(triggers$3).map((key => ({
            key: key,
            ...triggers$3[key]
        }))).find((t => {
            if (t.type === "raw") {
                return false;
            }
            //this won't work if only one global listener
            //if(t.key !== triggerName) return false;
                        const filterOkay = t.filter && typeof t.filter === "function" && t.filter(event);
            return filterOkay;
        }));
        if (!foundTrigger) return true;
 //true so event will propagate, etc
                event.preventDefault();
        event.stopPropagation();
        const {eventName: type, data: data} = foundTrigger;
        const params = {};
        const source = {};
        const _data = typeof data === "function" ? data(event) : data || {};
        trigger$1({
            type: type,
            params: params,
            source: source,
            data: _data,
            detail: (_data || {}).detail
        });
        return false;
    });
    const options = {};
    if (!triggerClickListener) {
        window.addEventListener(type, listener, options);
    }
    const triggerName = `${eventName}__${name}`;
    triggers$3[triggerName] = {
        eventName: eventName,
        filter: filter,
        data: data,
        type: type
    };
    triggerClickListener = triggerClickListener || listener;
};

function listTriggers$1() {
    return Object.keys(triggers$3);
}

window.listTriggers = listTriggers$1;

window.listListeners = list;

function attachEvents(events, context) {
    const listenersConfig = flatFromProp(events.listeners, "handlers");
    for (const handler of listenersConfig) {
        attach({
            ...handler,
            context: context
        });
    }
    context.triggers = {};
    context.triggerEvent = {};
    const connectTriggers = ([namespace, _triggers]) => {
        const _name = namespace.toLowerCase();
        const triggersConfig = flatFromProp(_triggers, "handlers");
        const triggers = triggersConfig.reduce(((acc, {name: name, eventName: eventName, ...item}) => {
            const trigger = attachTrigger({
                ...item,
                name: namespace,
                eventName: eventName
            });
            if (!trigger) return acc;
            return {
                ...acc,
                [name || eventName]: trigger
            };
        }), {});
        context.triggers[_name] = triggers;
        context.triggerEvent[_name] = (eventName, operation) => {
            context.triggers[_name][eventName]({
                detail: {
                    operation: operation,
                    done: () => {},
                    body: {}
                }
            });
        };
    };
    Object.entries(events.triggers).map(connectTriggers);
}

// LISTEN TO EXTERNAL EVENTS
// TRIGGER INTERNAL EVENTS
window.top.postMessage({
    subscribe: "Editor " + getClientId()
}, location);

const useCapture = false;

window.addEventListener("message", (function(messageEvent) {
    trigger$1({
        ...messageEvent.data,
        external: true
    });
}), useCapture);

/*

this code is useful when testing and developing, but less so otherwise

*/ const module$1 = async () => {
    const isRunningAsModule = document.location.href.includes("_/modules");
    if (!isRunningAsModule) {
        const ROOT_SERVICE_ID = 0;
        const currentServiceId = localStorage.getItem("lastService") || ROOT_SERVICE_ID;
        const serviceUrl = `/service/read/${currentServiceId}`;
        const {result: [service]} = await fetch(serviceUrl).then((x => x.json()));
        console.log(service);
        initState([ service ], service);
        trigger$1({
            e: {},
            type: "operationDone",
            params: {},
            source: {},
            data: {},
            detail: {
                op: "read",
                id: service.id,
                result: [ service ]
            }
        });
        console.log("Listeners:\n" + list().map((x => x.split("__").reverse().join(": "))).sort().join("\n"));
        console.log("Triggers:\n" + listTriggers().map((x => x.split("__").reverse().join(": "))).sort().join("\n"));
    }
};

var devHelper = {
    module: module$1
};

const ProjectOpener = () => {
    let _opener = htmlToElement$2(`\n\t\t<div class="service-opener">\n\t\t\t<style>\n\t\t\t\t.service-opener > div {\n\t\t\t\t\tdisplay: flex;\n\t\t\t\t\tflex-direction: column;\n\t\t\t\t\tpadding: 0px 20px;\n\t\t\t\t\tmargin-right: 17px;\n\t\t\t\t}\n\t\t\t\t.service-opener button {\n\t\t\t\t\tcolor: inherit;\n\t\t\t\t\tbackground: rgba(var(--main-theme-highlight-color), 0.4);\n\t\t\t\t\tfont-size: 1.1em;\n\t\t\t\t\tborder: 0;\n\t\t\t\t\tpadding: 10px;\n\t\t\t\t\tmargin-top: 3em;\n\t\t\t\t\tcursor: pointer;\n\t\t\t\t}\n\t\t\t\t.service-opener  p {\n\t\t\t\t\twhite-space: normal;\n\t\t\t\t\tmargin-bottom: 0;\n\t\t\t\t}\n\t\t\t\t.service-opener .opener-note {\n\t\t\t\t\tfont-style: italic;\n\t\t\t\t\topacity: 0.8;\n\t\t\t\t}\n\t\t\t\t.service-opener .opener-note:before {\n\t\t\t\t\tcontent: 'NOTE: '\n\t\t\t\t}\n\t\t\t</style>\n\t\t\t<div class="service-opener-actions">\n\t\t\t\t<p>You have nothing to edit. Pick an option below to get started.</p>\n\t\t\t\t<p class="opener-note">Your work will stay in this browser unless you arrange otherwise.</p>\n\n\t\t\t\t<button id="add-service-folder">Open Folder</button>\n\t\t\t\t<p>Upload from your computer into local browser memory.</p>\n\n\t\t\t\t<button id="connect-service-provider">Connect to a Provider</button>\n\t\t\t\t<p>Specify a service to read from and write to.</p>\n\n\t\t\t\t<button id="open-previous-service">Load Service</button>\n\t\t\t\t<p>Select a previously-loaded service.</p>\n\t\t\t</div>\n\t\t</div>\n\t`);
    _opener.querySelector(".service-opener-actions");
    // connectTrigger({
    // 	eventName: "add-service-folder",
    // 	filter: (e) =>
    // 		openerActions.contains(e.target) &&
    // 		e.target.tagName === "BUTTON" &&
    // 		e.target.id === "add-service-folder",
    // });
    // connectTrigger({
    // 	eventName: "connect-service-provider",
    // 	filter: (e) =>
    // 		openerActions.contains(e.target) &&
    // 		e.target.tagName === "BUTTON" &&
    // 		e.target.id === "connect-service-provider",
    // });
    // connectTrigger({
    // 	eventName: "open-previous-service",
    // 	filter: (e) =>
    // 		openerActions.contains(e.target) &&
    // 		e.target.tagName === "BUTTON" &&
    // 		e.target.id === "open-previous-service",
    // });
        return _opener;
};

let projectName;

const updateTreeMenu = ({title: title, project: project}) => {
    const treeMenu = document.querySelector("#explorer #tree-menu");
    const titleEl = treeMenu.querySelector(".title-label h2");
    const explorerActions = document.querySelector("#explorer .actions-container");
    if (title && title.toLowerCase() === "search") {
        explorerActions.style.display = "none";
    } else {
        explorerActions.style.display = "";
    }
    if (title) {
        titleEl.setAttribute("title", title);
        titleEl.innerText = title;
        return;
    }
    titleEl.setAttribute("title", project || projectName || "");
    titleEl.innerText = project || projectName || "";
    if (project) {
        projectName = project;
    }
};

const TreeMenu = () => {
    const _treeMenu = document.createElement("div");
    _treeMenu.id = "tree-menu";
    _treeMenu.classList.add("row", "no-margin");
    const menuInnerHTML = `\n\t\t<style>\n\t\t\t#tree-menu .title-actions .action-item a {\n\t\t\t\tcolor: inherit;\n\t\t\t\toutline: none;\n\t\t\t}\n\t\t</style>\n\t\t<div class="title-label">\n\t\t\t<h2 title=""></h2>\n\t\t</div>\n\t\t<div class="title-actions">\n\t\t\t<div class="monaco-toolbar">\n\t\t\t\t\t<div class="monaco-action-bar animated">\n\t\t\t\t\t\t<ul class="actions-container">\n\t\t\t\t\t\t\t\t<li class="action-item">\n\t\t\t\t\t\t\t\t\t<a class="action-label codicon explorer-action codicon-new-file" role="button" title="New File">\n\t\t\t\t\t\t\t\t\t</a>\n\t\t\t\t\t\t\t\t</li>\n\t\t\t\t\t\t\t\t<li class="action-item">\n\t\t\t\t\t\t\t\t\t<a class="action-label codicon explorer-action codicon-new-folder" role="button" title="New Folder">\n\t\t\t\t\t\t\t\t\t</a>\n\t\t\t\t\t\t\t\t</li>\n\t\t\t\t\t\t\t\t<li class="action-item hidden">\n\t\t\t\t\t\t\t\t\t<a class="action-label icon explorer-action refresh-explorer" role="button" title="Refresh Explorer">\n\t\t\t\t\t\t\t\t\t</a>\n\t\t\t\t\t\t\t\t</li>\n\t\t\t\t\t\t\t\t<li class="action-item hidden">\n\t\t\t\t\t\t\t\t\t<a class="action-label icon explorer-action collapse-explorer" role="button" title="Collapse Folders in Explorer">\n\t\t\t\t\t\t\t\t\t</a>\n\t\t\t\t\t\t\t\t</li>\n\t\t\t\t\t\t\t\t<li class="action-item hidden">\n\t\t\t\t\t\t\t\t\t<div class="monaco-dropdown">\n\t\t\t\t\t\t\t\t\t\t<div class="dropdown-label">\n\t\t\t\t\t\t\t\t\t\t\t<a class="action-label codicon codicon-toolbar-more" tabindex="0" role="button" aria-haspopup="true" aria-expanded="false" title="Views and More Actions..."></a>\n\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t</li>\n\t\t\t\t\t\t</ul>\n\t\t\t\t\t</div>\n\t\t\t</div>\n\t\t</div>\n\t`;
    _treeMenu.addEventListener("click", (e => {
        if (!_treeMenu.contains(e.target)) return;
        if (e.target.tagName === "A" && e.target.className.includes("codicon-toolbar-more")) {
            console.warn("toolbar-more: not implemented");
            e.preventDefault();
            return false;
        }
    }), {
        passive: false
    });
    // connectTrigger({
    // 	eventName: "new-file",
    // 	filter: (e) =>
    // 		_treeMenu.contains(e.target) &&
    // 		e.target.tagName === "A" &&
    // 		e.target.title === "New File",
    // });
    // connectTrigger({
    // 	eventName: "new-folder",
    // 	filter: (e) =>
    // 		_treeMenu.contains(e.target) &&
    // 		e.target.tagName === "A" &&
    // 		e.target.title === "New Folder",
    // });
        _treeMenu.innerHTML = menuInnerHTML;
    _treeMenu.update = updateTreeMenu;
    return _treeMenu;
};

const SearchBoxHTML = () => {
    const style = `\n\t<style>\n\t\t.tree-search {\n\t\t\tdisplay: flex;\n\t\t\tflex-direction: column;\n\t\t\tmargin-right: 0;\n\t\t\tuser-select: none;\n\t\t}\n\t\t.tree-search p {\n\t\t\twhite-space: normal;\n\t\t}\n\t\t.tree-search input {\n\t\t\tbackground: var(--main-theme-background-color) !important;\n\t\t\tmargin: 0 !important;\n\t\t\tborder: 0 !important;\n\t\t\tcolor: var(--main-theme-text-color);\n\t\t\tpadding-left: .5em !important;\n\t\t\tpadding-right: .5em !important;\n\t\t\tfont-size: 1.1em !important;\n\t\t\tbox-sizing: border-box !important;\n\t\t\tpadding-top: .25em !important;\n\t\t\tpadding-bottom: .25em !important;\n\t\t\theight: unset !important;\n\t\t\ttransition: unset !important;\n\t\t\tborder: 1px solid !important;\n\t\t\tborder-color: transparent !important;\n\t\t}\n\t\t.tree-search input:focus {\n\t\t\tbox-shadow: none !important;\n\t\t\tborder-color: rgb(var(--main-theme-highlight-color)) !important;\n\t\t}\n\t\t.tree-search ::placeholder,\n\t\t.project-search-results {\n\t\t\tcolor: var(--main-theme-text-invert-color);\n\t\t}\n\t\t.tree-search > div {\n\t\t\tpadding: 2px 0px;\n\t\t\tbox-sizing: content-box;\n\t\t}\n\t\t.tree-search .field-container {\n\t\t\tmargin-left: 17px;\n\t\t\tmargin-right: 10px;\n\t\t}\n\t\t.tree-search .highlight {\n\t\t\tbackground: rgba(var(--main-theme-highlight-color), 0.25);\n\t\t\tpadding-top: 4px;\n\t\t\tpadding-bottom: 4px;\n\t\t\tfilter: contrast(1.5);\n\t\t\tborder-radius: 3px;\n\t\t}\n\t\t.form-container {\n\t\t\tposition: absolute;\n\t\t\ttop: 40px;\n\t\t\tleft: 0;\n\t\t\tright: 0;\n\t\t\tbottom: 0;\n\t\t\toverflow: hidden;\n\t\t}\n\t\t.search-results::-webkit-scrollbar {\n\t\t\tdisplay: none;\n\t\t}\n\t\t.search-results:hover::-webkit-scrollbar {\n\t\t\tdisplay: block !important;\n\t\t}\n\t\t.search-results::-webkit-scrollbar {\n\t\t\twidth:0.5em !important;\n\t\t\theight:0.5em !important;\n\t\t}\n\t\t.search-results::-webkit-scrollbar-thumb{\n\t\t\tbackground: #ffffff10;\n\t\t}\n\t\t.search-results::-webkit-scrollbar-track{\n\t\t\tbackground:none !important;\n\t\t}\n\t\t.search-results {\n\t\t\tpadding-bottom: 15em;\n\t\t\tposition: absolute;\n\t\t\tbottom: 0;\n\t\t\ttop: 155px;\n\t\t\toverflow-y: auto;\n\t\t\toverflow-x: hidden;\n\t\t\tbox-sizing: border-box;\n\t\t\tmargin: 0;\n\t\t\tleft: 0;\n\t\t\tright: 0;\n\t\t\tfont-size: 0.9em;\n\t\t\tpadding-right: 0;\n\t\t}\n\t\t.search-results > li { list-style: none; }\n\n\t\t.search-results > li > div {\n\t\t\tpadding-left: 1em;\n\t\t\tpadding-bottom: 0.2em;\n\t\t\tpadding-top: 0.2em;\n\t\t}\n\t\t.search-results > li ul > li {\n\t\t\twhite-space: nowrap;\n\t\t\tpadding-left: 3em;\n\t\t\tpadding-top: .2em;\n\t\t\tpadding-bottom: .2em;\n\t\t}\n\n\t\t.search-results > li > div,\n\t\t.search-results > li ul > li,\n\t\t.search-results > li > div span,\n\t\t.search-results > li ul > li span {\n\t\t\tposition: relative;\n\t\t\twhite-space: nowrap;\n\t\t}\n\t\t.search-results ul.line-results > li > span,\n\t\t.search-results ul.line-results > li > div {\n\t\t\tuser-select: none;\n\t\t\tpointer-events: none;\n\t\t}\n\t\t.search-results > li > div .hover-highlight,\n\t\t.search-results > li ul > li .hover-highlight {\n\t\t\tposition: absolute;\n\t\t\tleft: 0;\n\t\t\tright: 0;\n\t\t\ttop: 0;\n\t\t\tbottom: 0;\n\t\t\tvisibility: hidden;\n\t\t\tpointer-events: none;\n\t\t\tuser-select: none;\n\t\t\tbackground: rgba(var(--main-theme-highlight-color), 0.15);\n\t\t}\n\t\t.search-results > li > div:hover .hover-highlight,\n\t\t.search-results > li ul > li:hover .hover-highlight {\n\t\t\tvisibility: visible;\n\t\t}\n\n\t\t.search-summary {\n\t\t\tfont-size: .85em;\n\t\t\topacity: 0.7;\n\t\t}\n\t\t.search-results .foldable {\n\t\t\tcursor: pointer;\n\t\t}\n\t\t.search-results span.doc-path {\n\t\t\topacity: .5;\n\t\t}\n\t\t.search-results .foldable ul { display: none; }\n\t\t.search-results .foldable > div span {\n\t\t\tpointer-events: none;\n\t\t\tuser-select: none;\n\t\t}\n\t\t.search-results .foldable > div:before {\n\t\t\tmargin-left: 4px;\n\t\t\tmargin-right: 3px;\n\t\t\tcontent: '>';\n\t\t\tfont-family: consolas, monospace;\n\t\t\tdisplay: inline-block;\n\t\t}\n\t\t.search-results .foldable.open ul { display: block; }\n\t\t.search-results .foldable.open > div:before {\n\t\t\tmargin-left: 2px;\n\t\t\tmargin-right: 5px;\n\t\t\tcontent: '>';\n\t\t\ttransform-origin: 5px 8.5px;\n\t\t\ttransform: rotateZ(90deg);\n\t\t}\n\t\t.field-container label { font-size: .75em; }\n\n\t</style>\n\t`;
    const html = `\n\t<div class="form-container tree-search">\n\t\t${style}\n\n\t\t<div class="field-container">\n\t\t\t<input type="text" placeholder="Search" class="search-term project-search-input" spellcheck="false"/>\n\t\t</div>\n\n\t\t<div class="field-container">\n\t\t\t<label>include</label>\n\t\t\t<input type="text" class="search-include"/>\n\t\t</div>\n\n\t\t<div class="field-container">\n\t\t\t<label>exclude</label>\n\t\t\t<input type="text" class="search-exclude"/>\n\t\t</div>\n\n\t\t<div class="field-container">\n\t\t\t<span class="search-summary"></span>\n\t\t</div>\n\n\t\t<ul class="search-results"></ul>\n\t</div>\n\t`;
    return html;
};

class SearchBox {
    dom;
    constructor(parent, include) {
        const main = htmlToElement$2(SearchBoxHTML());
        this.dom = {
            main: main,
            term: main.querySelector(".search-term"),
            include: main.querySelector(".search-include"),
            exclude: main.querySelector(".search-exclude"),
            summary: main.querySelector(".search-summary"),
            results: main.querySelector(".search-results")
        };
        this.dom.include.value = include || "./";
        this.attachListeners();
        (parent || document.body).appendChild(main);
    }
    attachListeners() {
        const debouncedInputListener = utils.debounce((event => {
            const term = this.dom.term.value;
            const include = this.dom.include.value;
            const exclude = this.dom.exclude.value;
            this.updateResults([], "");
            this.updateSummary({});
            this.searchStream({
                term: term,
                include: include,
                exclude: exclude
            });
        }), 250, false);
        this.dom.term.addEventListener("input", (e => {
            const term = this.dom.term.value;
            if (!term) {
                this.term = "";
                this.updateSummary({});
                this.dom.results.innerHTML = "";
                this.updateResults([], "");
                return;
            }
            this.updateSummary({
                loading: true
            });
            this.updateResults({
                loading: true
            });
            debouncedInputListener(e);
        }));
        this.dom.include.addEventListener("input", (e => {
            this.updateSummary({
                loading: true
            });
            this.updateResults({
                loading: true
            });
            debouncedInputListener(e);
        }));
        this.dom.exclude.addEventListener("input", (e => {
            this.updateSummary({
                loading: true
            });
            this.updateResults({
                loading: true
            });
            debouncedInputListener(e);
        }));
        this.dom.results.addEventListener("click", (e => {
            const handler = {
                "DIV foldable": () => e.target.parentNode.classList.add("open"),
                "DIV foldable open": () => e.target.parentNode.classList.remove("open"),
                "LI line-results": e => triggers.fileSelect(e.target.dataset)
            }[`${e.target.tagName} ${e.target.parentNode.className.trim()}`];
            if (handler) return handler(e);
        }));
    }
    async searchStream({term: term, include: include, exclude: exclude}) {
        this.dom.results.innerHTML = "";
        this.updateSummary({});
        const base = new URL("../../service/search", location.href).href;
        const res = await fetch(`${base}/?term=${term}&include=${include || ""}&exclude=${exclude || ""}`);
        const reader = res.body.getReader();
        const decoder = new TextDecoder("utf-8");
        const timer = {
            t1: performance.now()
        };
        let allMatches = [];
        let malformed;
        this.resultsInDom = false;
        while (true) {
            const {done: done, value: value} = await reader.read();
            if (done) break;
            let results = decoder.decode(value, {
                stream: true
            });
            if (malformed) {
                results = malformed.trim() + results.trim();
                malformed = "";
            }
            if (results.trim()[results.trim().length - 1] !== "}") {
                results = results.split("\n");
                malformed = results.pop();
                results = results.join("\n");
            }
            results = results.split("\n").filter((x => !!x));
            this.updateResults(results, allMatches, term);
            this.updateSummary({
                allMatches: allMatches,
                time: performance.now() - timer.t1,
                searchTerm: term
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
        const addFileResultsLineEl = result => {
            const limit = 1;
 //only highlight one occurence
                        const listItemEl = (Array.isArray(result) ? result : [ result ]).map(((r, i) => `\n\t\t\t\t\t<li data-source="${r.file}" data-line="${r.line}" data-column="${r.column}">\n\t\t\t\t\t\t<div class="hover-highlight"></div>\n\t\t\t\t\t\t${utils.highlight(term, utils.htmlEscape(r.text.trim()), limit)}\n\t\t\t\t\t</li>\n\t\t\t\t`));
            return listItemEl;
        };
        const createFileResultsEl = (result, index) => {
            const items = [ "html", "json", "info" ];
            const iconClass = "icon-" + items[Math.floor(Math.random() * items.length)];
            const open = term.length > 1 || !this.resultsInDom ? "open" : "";
            const fileResultsEl = htmlToElement$2(`\n\t\t\t\t<li class="foldable ${open}" data-path="${result.file}">\n\t\t\t\t\t<div>\n\t\t\t\t\t\t<div class="hover-highlight"></div>\n\t\t\t\t\t\t<span class="${iconClass}">${result.docName}</span>\n\t\t\t\t\t\t<span class="doc-path">${result.path}</span>\n\t\t\t\t\t</div>\n\t\t\t\t\t<ul class="line-results">\n\t\t\t\t\t\t${addFileResultsLineEl(result).join("\n")}\n\t\t\t\t\t</ul>\n\t\t\t\t</li>\n\t\t\t`);
            return fileResultsEl;
        };
        for (var rindex = 0; rindex < results.length; rindex++) {
            const x = results[rindex];
            try {
                const parsed = JSON.parse(x);
                parsed.docName = parsed.file.split("/").pop();
                parsed.path = parsed.file.replace("/" + parsed.docName, "").replace(/^\.\//, "");
                allMatches.push(parsed);
                window.requestAnimationFrame((() => {
                    const existingFileResultsEl = this.dom.results.querySelector(`li[data-path="${parsed.file}"] ul`);
                    let newLineItems;
                    if (existingFileResultsEl) {
                        newLineItems = addFileResultsLineEl(parsed);
                    }
                    if (newLineItems) {
                        const elementItems = newLineItems.map(htmlToElement$2);
                        existingFileResultsEl.append(...elementItems);
                        return;
                    }
                    const fileResultsEl = createFileResultsEl(parsed, rindex);
                    this.dom.results.appendChild(fileResultsEl);
                    this.resultsInDom = true;
                }));
            } catch (e) {
                console.warn(`trouble parsing: ${x}, ${e}`);
            }
        }
    }
    updateSummary({allMatches: allMatches, time: time, searchTerm: searchTerm, loading: loading}) {
        if (loading) {
            this.dom.summary.innerHTML = "";
            return;
        }
        if (!allMatches || !allMatches.length) {
            this.dom.summary.innerHTML = "No results";
            return;
        }
        const totalFiles = utils.unique(allMatches.map((x => x.docName))).map((x => ({
            filename: x,
            results: []
        })));
        const pluralRes = allMatches.length > 1 ? "s" : "";
        const pluralFile = totalFiles.length > 1 ? "s" : "";
        this.dom.summary.innerHTML = `${allMatches.length} result${pluralRes} in ${totalFiles.length} file${pluralFile}, ${time.toFixed(2)} ms`;
    }
}

let searchBox;

const Search = parent => {
    searchBox = searchBox || new SearchBox(parent);
    searchBox.hide();
    /*
	searchBox.updateTerm(searchTerm);
	searchBox.updateInclude(path)
	searchBox.searchStream({ term: searchTerm, include: path })
*/    return searchBox;
};

let treeView, opener;

const ScrollShadow = () => {
    let scrollShadow = htmlToElement$2(`\n\t\t<div class="scroll-shadow">\n\t\t\t<style>\n\t\t\t\t.scroll-shadow {\n\t\t\t\t\tbox-shadow: #000000 0 6px 6px -6px inset;\n\t\t\t\t\theight: 6px;\n\t\t\t\t\tposition: absolute;\n\t\t\t\t\ttop: 35px;\n\t\t\t\t\tleft: 0;\n\t\t\t\t\tright: 0;\n\t\t\t\t\tdisplay: none;\n\t\t\t\t}\n\t\t\t</style>\n\t\t</div>\n\t`);
    treeView.addEventListener("scroll", (event => {
        try {
            event.target.scrollTop > 0 ? scrollShadow.style.display = "block" : scrollShadow.style.display = "none";
        } catch (e) {
            scrollShadow.style.display = "none";
        }
    }));
    return scrollShadow;
};

const getTreeViewDOM = ({showOpenService: showOpenService} = {}) => {
    if (opener && showOpenService) {
        opener.classList.remove("hidden");
        const treeMenuLabel = document.querySelector("#tree-menu .title-label h2");
        treeMenuLabel.innerText = "NO FOLDER OPENED";
        treeView && treeView.classList.add("nothing-open");
    } else if (opener) {
        opener.classList.add("hidden");
        treeView && treeView.classList.remove("nothing-open");
    }
    if (treeView) {
        return treeView;
    }
    treeView = document.createElement("div");
    treeView.id = "tree-view";
    opener = ProjectOpener();
    if (showOpenService) {
        const treeMenuLabel = document.querySelector("#tree-menu .title-label h2");
        treeMenuLabel.innerText = "NO FOLDER OPENED";
        treeView.classList.add("nothing-open");
    } else {
        treeView.classList.remove("nothing-open");
        opener.classList.add("hidden");
    }
    treeView.appendChild(opener);
    const explorerPane = document.body.querySelector("#explorer");
    const menu = TreeMenu();
    explorerPane.appendChild(menu);
    Search(explorerPane);
    explorerPane.appendChild(ScrollShadow());
    explorerPane.appendChild(treeView);
    explorerPane.classList.remove("pane-loading");
    treeView.menu = menu;
    return treeView;
};

function _TreeView(op) {
    if (op === "hide") {
        const prevTreeView = document.querySelector("#tree-view");
        if (prevTreeView) {
            prevTreeView.style.display = "none";
        }
        return;
    }
    //OH WELL?: feels kinda dirty in some senses, very reasonable in others
    //TODO: do this with stylus??
        const treeDepthStyles = (rootId, depth, ems) => new Array(depth).fill().reduce(((all, one, i) => [ all, `/* NESTING LEVEL ${i + 1} */\n`, `#${rootId}>.tree-leaf>.tree-child-leaves`, ...new Array(i).fill(">.tree-leaf>.tree-child-leaves"), ">.tree-leaf>.tree-leaf-content\n", `{ padding-left:${(i + 2) * ems}em; }\n\n` ].join("")), `\n\t\t\t#${rootId}>.tree-leaf>.tree-leaf-content { padding-left:${ems}em; }\n\t\t`);
    treeView = getTreeViewDOM();
    treeView.style.display = "";
    const treeViewStyle = htmlToElement$2(`\n\t\t<style>\n\t\t\t#tree-view {\n\t\t\t\tpadding-top: 0.1em;\n\t\t\t}\n\n\t\t\t/* tree view dimming*/\n\t\t\t/*\n\t\t\t#tree-view {\n\t\t\t\topacity: .7;\n\t\t\t\ttransition: opacity 25s;\n\t\t\t\tpadding-top: 0.1em;\n\t\t\t}\n\t\t\t#tree-view:hover, #tree-view.nothing-open {\n\t\t\t\topacity: 1;\n\t\t\t\ttransition: opacity 0.3s;\n\t\t\t}\n\t\t\t*/\n\n\t\t\t#tree-view .tree-expando:not(.hidden) + .tree-leaf-text:before {\n\t\t\t\tfont-family: codicon;\n\t\t\t\tcontent: "\\eab4";\n\t\t\t\tfont-size: 1.1em;\n\t\t\t\tmargin-right: 0.4em;\n\t\t\t\tmargin-left: 0;\n\t\t\t\ttransform: rotate(0deg);\n\t\t\t}\n\t\t\t#tree-view .tree-expando:not(.expanded, .hidden) + .tree-leaf-text:before {\n\t\t\t\ttransform: rotate(-90deg);\n\t\t\t}\n\t\t\t#tree-view .tree-leaf.file div[class*='icon-'] {\n\t\t\t\tmargin-left: -0.3em;\n\t\t\t}\n\t\t\t#tree-view.dragover .tree-leaf,\n\t\t\t.tree-leaf.folder.dragover {\n\t\t\t\tbackground: #4d5254;\n\t\t\t}\n\t\t\t.tree-leaf {\n\t\t\t\tuser-select: none;\n\t\t\t}\n\t\t\t.tree-leaf.hidden-leaf {\n\t\t\t\tdisplay: none;\n\t\t\t}\n\t\t\t${treeDepthStyles("tree-view", 20, .9)}\n\t\t</style>\n\t`);
    treeView.parentNode.append(treeViewStyle);
    return treeView;
}

var TreeView$1 = _TreeView();

let TREE_ROOT_ID;

const loop = (MAX, fn) => {
    let it = 0;
    while (fn() && it++ < MAX) {}
};

function htmlToElement$1(html) {
    const template = document.createElement("template");
    template.innerHTML = html.trim();
    return template.content.firstChild;
}

// wrap a pre-existing node in a helper
//input: tree-leaf-text, tree-leaf-content, tree-child-leaves
//output: LeafNode helper which is bound to tree-leaf
class LeafNode {
    node;
    constructor(element) {
        this.node = element.classList.contains("tree-leaf") || element.id === TREE_ROOT_ID ? element : element.closest(".tree-leaf");
        const Getter = (name, fn) => Object.defineProperty(this, name, {
            get: fn
        });
        this.getPath = this.getPath.bind(this);
        this.getParentLeaves = this.getParentLeaves.bind(this);
        Getter("name", (() => this.getName(this.node)));
        Getter("parent", (() => this.getParent(this.node)));
        Getter("parentLeaves", (() => this.getParentLeaves()));
        Getter("path", (() => this.getPath(this.node)));
        Getter("type", (() => this.getType(this.node)));
        Getter("selected", (() => this.getSelected(this.node)));
        this.getItem = () => ({
            name: this.getName(this.node),
            id: this.getPath(this.node),
            path: this.getPath(this.node),
            type: this.getType(this.node),
            selected: this.getSelected(this.node)
        });
    }
    getName(node) {
        const treeLeafText = node.querySelector(":scope > .tree-leaf-content > .tree-leaf-text");
        return treeLeafText && treeLeafText.textContent;
    }
    getParent(node) {
        if (node.id === TREE_ROOT_ID) return;
        const parentChildLeaves = node.closest(".tree-child-leaves");
        return (parentChildLeaves || node).parentNode;
    }
    getParentLeaves() {
        const parentLeaves = !this.path.includes("/") ? this.node.closest("#" + TREE_ROOT_ID) : this.node.closest(".tree-child-leaves");
        return parentLeaves;
    }
    getPath(node) {
        if (node.id === TREE_ROOT_ID) return "";
        let currentNode = node;
        const path = [];
        const MAX_ITERATIONS = 50;
        loop(MAX_ITERATIONS, (() => {
            path.push(this.getName(currentNode));
            currentNode = this.getParent(currentNode);
            return currentNode.id !== TREE_ROOT_ID;
        }));
        return path.reverse().join("/");
    }
    getType(node) {
        if (node.id === TREE_ROOT_ID) return "folder";
        return node.querySelector(":scope > .tree-child-leaves") ? "folder" : "file";
    }
    getSelected(node) {
        const treeLeafContent = node.querySelector(":scope > .tree-leaf-content");
        return treeLeafContent && treeLeafContent.classList.contains("selected");
    }
}

// js-treeview 1.1.5
const TreeView = function() {
    var events = [ "expand", "expandAll", "collapse", "collapseAll", "select" ];
    function isDOMElement(obj) {
        try {
            return obj instanceof HTMLElement;
        } catch (e) {
            return typeof obj === "object" && obj.nodeType === 1 && typeof obj.style === "object" && typeof obj.ownerDocument === "object";
        }
    }
    function forEach(arr, callback, scope) {
        var i, len = arr.length;
        for (i = 0; i < len; i += 1) {
            callback.call(scope, arr[i], i);
        }
    }
    function emit(instance, name) {
        var args = [].slice.call(arguments, 2);
        if (events.indexOf(name) > -1) {
            if (instance.handlers[name] && instance.handlers[name] instanceof Array) {
                forEach(instance.handlers[name], (function(handle) {
                    window.setTimeout((function() {
                        handle.callback.apply(handle.context, args);
                    }), 0);
                }));
            }
        } else {
            throw new Error(name + " event cannot be found on TreeView.");
        }
    }
    function render(self) {
        var container = isDOMElement(self.node) ? self.node : document.getElementById(self.node);
        var leaves = [], click;
        var renderLeaf = function(item) {
            var leaf = document.createElement("div");
            var content = document.createElement("div");
            var text = document.createElement("div");
            var expando = document.createElement("div");
            leaf.setAttribute("class", "tree-leaf");
            if (item.name === ".keep") {
                leaf.classList && leaf.classList.add("hidden-leaf");
            }
            content.setAttribute("class", "tree-leaf-content");
            content.setAttribute("data-item", JSON.stringify(item));
            text.setAttribute("class", "tree-leaf-text");
            text.textContent = item.name;
            expando.setAttribute("class", "tree-expando " + (item.expanded ? "expanded open" : "closed"));
            expando.textContent = item.expanded ? "-" : "+";
            content.appendChild(expando);
            content.appendChild(text);
            leaf.appendChild(content);
            if (item.children && item.children.length > 0) {
                var children = document.createElement("div");
                children.setAttribute("class", "tree-child-leaves");
                forEach(item.children, (function(child) {
                    var childLeaf = renderLeaf(child);
                    children.appendChild(childLeaf);
                }));
                if (!item.expanded) {
                    children.classList && children.classList.add("hidden");
                }
                leaf.appendChild(children);
            } else {
                expando.classList && expando.classList.add("hidden");
            }
            return leaf;
        };
        forEach(self.data, (function(item) {
            leaves.push(renderLeaf.call(self, item));
        }));
        container.innerHTML = leaves.map((function(leaf) {
            return leaf.outerHTML;
        })).join("");
        click = function(e) {
            var parent = (e.target || e.currentTarget).parentNode;
            var leaves = parent.parentNode.querySelector(".tree-child-leaves");
            if (!leaves) {
                emit(self, "select", {
                    target: e.target
                });
                return;
            }
            if (leaves.classList && leaves.classList.contains("hidden")) {
                self.expand(parent, leaves);
            } else {
                self.collapse(parent, leaves);
            }
        };
        forEach(container.querySelectorAll(".tree-leaf-text"), (function(node) {
            node.onclick = click;
        }));
        forEach(container.querySelectorAll(".tree-expando"), (function(node) {
            node.onclick = click;
        }));
    }
    function TreeView(data, node) {
        (this || _global).handlers = {};
        (this || _global).node = node;
        (this || _global).data = data;
        render(this || _global);
    }
    TreeView.prototype.expand = function(node, leaves, skipEmit) {
        var expando = node.querySelector(".tree-expando");
        expando.classList && expando.classList.add("expanded", "open");
        expando.classList && expando.classList.remove("closed");
        expando.textContent = "-";
        leaves.classList && leaves.classList.remove("hidden");
        if (skipEmit) {
            return;
        }
        emit(this || _global, "expand", {
            target: node,
            leaves: leaves
        });
    };
    TreeView.prototype.expandAll = function() {
        var self = this || _global;
        var nodes = document.getElementById(self.node).querySelectorAll(".tree-expando");
        forEach(nodes, (function(node) {
            var parent = node.parentNode;
            var leaves = parent.parentNode.querySelector(".tree-child-leaves");
            if (parent && leaves && parent.hasAttribute("data-item")) {
                self.expand(parent, leaves, true);
            }
        }));
        emit(this || _global, "expandAll", {});
    };
    TreeView.prototype.collapse = function(node, leaves, skipEmit) {
        var expando = node.querySelector(".tree-expando");
        expando.classList && expando.classList.remove("expanded", "open");
        expando.classList && expando.classList.add("closed");
        expando.textContent = "+";
        leaves.classList && leaves.classList.add("hidden");
        if (skipEmit) {
            return;
        }
        emit(this || _global, "collapse", {
            target: node,
            leaves: leaves
        });
    };
    TreeView.prototype.collapseAll = function() {
        var self = this || _global;
        var nodes = document.getElementById(self.node).querySelectorAll(".tree-expando");
        forEach(nodes, (function(node) {
            var parent = node.parentNode;
            var leaves = parent.parentNode.querySelector(".tree-child-leaves");
            if (parent && leaves && parent.hasAttribute("data-item")) {
                self.collapse(parent, leaves, true);
            }
        }));
        emit(this || _global, "collapseAll", {});
    };
    TreeView.prototype.on = function(name, callback, scope) {
        if (events.indexOf(name) > -1) {
            if (!(this || _global).handlers[name]) {
                (this || _global).handlers[name] = [];
            }
            (this || _global).handlers[name].push({
                callback: callback,
                context: scope
            });
        } else {
            throw new Error(name + " is not supported by TreeView.");
        }
    };
    TreeView.prototype.off = function(name, callback) {
        var index, found = false;
        if ((this || _global).handlers[name] instanceof Array) {
            (this || _global).handlers[name].forEach((function(handle, i) {
                index = i;
                if (handle.callback === callback && !found) {
                    found = true;
                }
            }));
            if (found) {
                (this || _global).handlers[name].splice(index, 1);
            }
        }
    };
    return TreeView;
}();

class DragAndDrop {
    rootNode;
    dragged;
    draggedOver;
    constructor({rootNode: rootNode, move: move}) {
        this.rootNode = rootNode;
        this.attach = this.attach.bind(this);
        this.handleDragEnter = this.handleDragEnter.bind(this);
        this.handleDragStart = this.handleDragStart.bind(this);
        this.handleDrop = this.handleDrop.bind(this);
        this.drop = (dragged, draggedOver) => {
            if (!dragged || !draggedOver) return;
            move(dragged.path, draggedOver.path);
        };
        this.attach(this.rootNode);
        this.update = () => this.attach(this.rootNode);
    }
    handleDragStart(e) {
        e.stopPropagation();
        e.dataTransfer.setData("text/plain", "some_dummy_data");
        /*
		e.dataTransfer.effectAllowed = 'move';

		var dragImage = document.createElement('div');
		dragImage.setAttribute('style', `
			position: absolute; left: 0px; top: 0px; width: 40px; height: 40px; background: red; z-index: -1
		`);
		document.body.appendChild(dragImage);
		evt.dataTransfer.setDragImage(dragImage, 20, 20);
		*/        this.dragged = new LeafNode(e.target);
        this.draggedParent = new LeafNode(this.dragged.parent);
        // attach all drag listeners here instead?
        }
    handleDragEnter(e) {
        let target = new LeafNode(e.target);
        if (target.type === "file") {
            target = new LeafNode(target.parent);
        }
        if (this.draggedOver && target.node === this.draggedOver.node) return;
        if (this.draggedOver) {
            this.draggedOver.node && this.draggedOver.node.classList.remove("dragover");
        }
        if (target.node === this.draggedParent.node) {
            this.draggedOver = undefined;
            return;
        }
        if (this.dragged.node === target.node) {
            this.draggedOver = undefined;
            return;
        }
        if (this.dragged.node.contains(target.node)) {
            this.draggedOver = undefined;
            return;
        }
        this.draggedOver = target;
        target.node.classList.add("dragover");
    }
    handleDrop(e) {
        const draggedOverNodes = Array.from(document.querySelectorAll(".dragover"));
        draggedOverNodes.forEach((item => item.classList.remove("dragover")));
        this.drop(this.dragged, this.draggedOver);
        this.dragged = this.draggedOver = undefined;
        e.stopPropagation();
        return false;
    }
    preventDefault(e) {
        e.preventDefault && e.preventDefault();
        return false;
    }
    attach(rootNode) {
        // do event listeners need to be cleaned up before re-attach?
        // NO, not as long as they are exact equals
        const allLeaves = Array.from(rootNode.querySelectorAll(".tree-leaf:not([draggable])"));
        allLeaves.forEach((leaf => {
            leaf.draggable = true;
            const leafNode = new LeafNode(leaf);
            //TODO: do this elsewhere???
                        leaf.classList.add(leafNode.type);
            //if(leafNode.type === 'file') {
            //leaf.addEventListener('dragstart', this.handleDragStart, false);
            //return;
            //}
            //leaf.addEventListener('dragstart', this.handleDragStart, false);
            //leaf.addEventListener('dragenter', this.handleDragEnter, false);
            //leaf.addEventListener('drop', this.handleDrop, false);
            //leaf.addEventListener('dragover', this.preventDefault, false);
                }));
        rootNode.addEventListener("dragstart", this.handleDragStart, false);
        rootNode.addEventListener("dragenter", this.handleDragEnter, false);
        rootNode.addEventListener("drop", this.handleDrop, false);
        rootNode.addEventListener("dragover", this.preventDefault, false);
    }
}

// add node with name
class TreeNode {
    constructor(item) {
        const {name: name, type: type, id: id} = item;
        const expandoClass = [ "tree-expando", "closed", type === "folder" ? "" : "hidden" ].join(" ");
        const container = htmlToElement$1(`\n\t\t\t<div class="tree-leaf">\n\t\t\t\t<div class="tree-leaf-content" data-item='${JSON.stringify(item)}'>\n\t\t\t\t\t<div class="${expandoClass}">+</div>\n\t\t\t\t\t<div class="tree-leaf-text">${name}</div>\n\t\t\t\t</div>\n\t\t\t\t${type === "folder" ? `<div class="tree-child-leaves hidden"></div>` : ""}\n\t\t\t</div>\n\t\t`);
        // TODO: remove this when rewriting underlying js-treeview (use listener at top level)
                Array.from(container.querySelectorAll(".tree-leaf-text, .tree-expando")).forEach((function(node) {
            const hijacked = document.querySelector(".tree-leaf-text").onclick;
            node.onclick = hijacked;
        }));
        return container;
    }
}

// add node without name, get from user
class NewTreeNode {
    container;
    //the created dom
    focus;
    // a function to call after dom appended
    callback;
    // a function from outer context called after user finished naming
    constructor(item) {
        this.finishedHandler = this.finishedHandler.bind(this);
        this.container = this.createContainer(item);
        const input = this.getBoundInput.bind(this)();
        //maybe should call this something diff than "focus", like "start"?
                this.focus = (siblings = [], callback) => {
            //TODO: pass sibling names so input can warn
            this.callback = callback;
            input.focus();
        };
        this.updateDataItem = name => {};
    }
    createContainer(item) {
        const {type: type} = item;
        const expandoClass = [ "tree-expando", "closed", type === "folder" ? "" : "hidden" ].join(" ");
        const textClass = [ "tree-leaf-text", type === "file" ? "icon-default" : "" ].join(" ");
        return htmlToElement$1(`\n\t\t\t<div class="tree-leaf ${type} new">\n\t\t\t\t<div class="tree-leaf-content" data-item='${JSON.stringify(item)}'>\n\t\t\t\t\t<div class="${expandoClass}">+</div>\n\t\t\t\t\t<div class="${textClass}">\n\t\t\t\t\t\t<input type="text"\n\t\t\t\t\t\t\tautocomplete="off"\n\t\t\t\t\t\t\tautocorrect="off"\n\t\t\t\t\t\t\tautocapitalize="off"\n\t\t\t\t\t\t\tspellcheck="false"\n\t\t\t\t\t\t>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t\t${type === "folder" ? `<div class="tree-child-leaves hidden"></div>` : ""}\n\t\t\t</div>\n\t\t`);
    }
    getBoundInput() {
        const input = this.container.querySelector("input");
        const thisFinish = finish.bind(this);
        const keydownListener = e => {
            const ENTER_KEY_CODE = 13;
            const ESCAPE_KEY_CODE = 27;
            if (e.keyCode == ENTER_KEY_CODE) thisFinish();
            if (e.keyCode == ESCAPE_KEY_CODE) thisFinish("cancel");
            //TODO: keep track of name and if folder already contains this name then popup error message
                };
        const focusListener = e => {
            input.removeEventListener("focus", focusListener, false);
            input.addEventListener("blur", thisFinish, false);
        };
        function finish(cancel) {
            input.removeEventListener("keydown", keydownListener, false);
            input.removeEventListener("blur", thisFinish, false);
            this.finishedHandler(cancel ? "" : input.value);
        }
        input.addEventListener("keydown", keydownListener, false);
        input.addEventListener("focus", focusListener, false);
        return input;
    }
    finishedHandler(name) {
        if (!name) {
            this.callback("no name provided");
            return;
        }
        this.container.querySelector(".tree-leaf-text").innerHTML = name;
        this.container.querySelector(".tree-leaf-text").classList.remove("icon-default");
        this.container.classList.remove("new");
        this.updateDataItem(name);
        // TODO: remove this when rewriting underlying js-treeview (use listener at top level)
                Array.from(this.container.querySelectorAll(".tree-leaf-text, .tree-expando")).forEach((function(node) {
            const hijacked = document.querySelector(".tree-leaf-text").onclick;
            node.onclick = hijacked;
        }));
        this.callback();
    }
}

// change a prev-existing node
class RenameUI {
    container;
    constructor(context) {
        this.container = context.domNode;
        this.treeLeafContent = context.treeLeafContent;
        this.treeLeafText = context.treeLeafText;
        this.siblings = context.siblings;
        this.done = this.done.bind(this);
        this.getInput = this.getInput.bind(this);
        this.keydownListener = this.keydownListener.bind(this);
        return new Promise(this.getInput);
    }
    done(cancel) {
        const {callback: callback, currentName: currentName, done: done, input: input, keydownListener: keydownListener, treeLeafText: treeLeafText} = this;
        input.removeEventListener("keydown", keydownListener, false);
        input.removeEventListener("blur", done, false);
        const name = cancel ? "" : input.value;
        treeLeafText.innerHTML = name || currentName;
        callback(name);
    }
    getInput(callback) {
        const {container: container, done: done, keydownListener: keydownListener, treeLeafText: treeLeafText} = this;
        this.currentName = treeLeafText.textContent;
        const newInput = `\n\t\t<input type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">\n\t\t`;
        treeLeafText.innerHTML = newInput;
        const input = container.querySelector("input");
        input.value = this.currentName;
        input.addEventListener("keydown", keydownListener, false);
        input.addEventListener("blur", done, false);
        this.input = input;
        this.callback = callback;
        input.focus();
    }
    keydownListener(e) {
        const {done: done, siblings: siblings} = this;
        const ENTER_KEY_CODE = 13;
        const ESCAPE_KEY_CODE = 27;
        if (e.keyCode == ENTER_KEY_CODE) return done();
        if (e.keyCode == ESCAPE_KEY_CODE) return done("cancel");
        //TODO: keep track of name and if folder already contains this name then popup error message
        //see this.siblings
        }
}

// this is cool, but only necessary with js-treeview seen as untouchable and external, move away from using this
class TreeMapper {
    constructor(service, state) {
        this.state = state;
        this.service = service;
        this.get = this.get.bind(this);
        return new Proxy(service.tree[service.name], this);
    }
    mapEntry=target => ([k, v]) => {
        const child = {
            name: k,
            id: target.path ? `${target.path}/${k}` : k,
            //TODO: maybe should figure out better way to determine folder vs file
            type: Object.keys(v).length === 0 ? "file" : "folder"
        };
        if (child.type === "folder") {
            const dummyArray = [];
            dummyArray.path = target.path ? `${target.path}/${k}` : k;
            child.expanded = this.state.expand.includes(dummyArray.path);
            child.children = new Proxy(dummyArray, this);
        } else {
            child.selected = this.state.select === child.id;
        }
        return child;
    };
    sort=(a, b) => {
        if (a.type > b.type) return -1;
        if (a.type < b.type) return 1;
        return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
    };
    get(target, prop, receiver) {
        //console.log(prop)
        const realTarget = (target.path || "").split("/").reduce(((all, one) => all[one] || all), this.service.tree[this.service.name]);
        const isNumericProp = !isNaN(prop) && "number";
        const propertyMapper = {
            length: children => children.length,
            forEach: children => fn => children.forEach(fn),
            children: children => children,
            number: children => children[prop],
            toJSON: children => fn => undefined
        }[isNumericProp || prop];
        if (!propertyMapper) {
            debugger;
            //console.error(`Mapper proxy unable to handle prop: ${prop}`);
                        return undefined;
        }
        try {
            const children = Object.entries(realTarget).map(this.mapEntry(target)).sort(this.sort);
            return propertyMapper(children);
        } catch (error) {
            console.error(error);
        }
    }
}

const updateTreeTextClass = mapper => {
    const fileNodes = Array.from(document.querySelectorAll(".tree-leaf.file > .tree-leaf-content > .tree-leaf-text"));
    fileNodes.forEach((x => {
        x.textContent;
        const ext = x.textContent.split(".").pop();
        const mapped = mapper(ext);
        x.classList.add(mapped);
    }));
};

class ServiceTree {
    jstreeview;
    rootNode;
    constructor(service, domRoot, treeState, extensionMapper) {
        TREE_ROOT_ID = domRoot;
        const mappedTree = new TreeMapper(service, treeState);
        this.jstreeview = new TreeView(mappedTree, domRoot);
        this.emit = this.emit.bind(this.jstreeview);
        const exposedAPI = [ "on", "off", "collapse", "collapseAll", "expand", "expandAll" ];
        for (var i = 0, len = exposedAPI.length; i < len; i++) {
            const key = exposedAPI[i];
            this[key] = this.jstreeview[key].bind(this.jstreeview);
        }
        const jsTreeViewEvents = [ "expand", "expandAll", "collapse", "collapseAll", "select" ];
        this.jstreeviewOn = this.on;
        this.on = (name, callback, scope) => {
            if (jsTreeViewEvents.includes(name)) {
                return this.jstreeviewOn(name, callback, scope);
            }
            this.jstreeview.handlers[name] = this.jstreeview.handlers[name] || [];
            this.jstreeview.handlers[name].push({
                callback: callback,
                context: scope
            });
        };
        this.add = this.add.bind(this);
        this.select = this.select.bind(this);
        this.delete = this.delete.bind(this);
        this.move = this.move.bind(this);
        this.change = this.change.bind(this);
        this.clearChanged = this.clearChanged.bind(this);
        this.rootNode = document.getElementById(domRoot);
        this.dragAndDrop = new DragAndDrop(this);
        this.updateIcons = () => updateTreeTextClass(extensionMapper);
        this.updateIcons();
        if (treeState.select) {
            this.select(treeState.select);
            this.currentFile = treeState.select;
            this.currentFolder = treeState.select.split("/").slice(0, -1).join("/");
        }
        if (treeState.changed?.length) {
            treeState.changed.forEach(this.change);
        }
        // LISTENING to jstreeview to update ServiceTree
                this.on("select", (({target: target}) => {
            const leaf = new LeafNode(target);
            this.currentFile = leaf.path;
            this.currentFolder = leaf.path.split("/").slice(0, -1).join("/");
            Array.from(this.rootNode.querySelectorAll(".selected")).forEach((s => s.classList.remove("selected")));
            leaf.node.querySelector(":scope > .tree-leaf-content").classList.add("selected");
            this.emit("fileSelect", {
                source: leaf.path
            });
        }));
        // on expand, currentFolder is expanded folder
        // on collapse, currentFolder is currentFile's parent
        }
    // this mimics/exposes js-treeview event trigger handled by this.on
    emit(name) {
        // FYI "this" is ServiceTree.jstreeview
        if (!this.handlers[name] || !this.handlers[name] instanceof Array) return;
        const args = [].slice.call(arguments, 1);
        this.handlers[name].forEach((handle => {
            window.setTimeout((() => {
                handle.callback.apply(handle.context, args);
            }), 0);
        }));
    }
    /*
		this is for programmatically selecting a file/folder
	*/    select(path, skipDomUpdate, noEmit) {
        const splitPath = path.split("/");
        let currentNode = this.rootNode;
        //TODO: dom traversal sucks, would be better to traverse an internal model?
                for (var i = 0, len = splitPath.length; i < len; i++) {
            const nodeName = splitPath[i];
            const immediateChildren = currentNode.querySelectorAll(":scope > .tree-leaf");
            const found = Array.from(immediateChildren).find((child => new LeafNode(child).name === nodeName));
            if (!found) break;
            const node = found.querySelector(":scope > .tree-leaf-content");
            const leaves = found.querySelector(":scope > .tree-child-leaves");
            if (!skipDomUpdate) {
                if (leaves) {
                    this.expand(node, leaves);
                } else {
                    Array.from(this.rootNode.querySelectorAll(".selected")).forEach((s => s.classList.remove("selected")));
                    node.classList.add("selected");
                }
            }
            currentNode = leaves || found;
        }
        const isFolder = currentNode.classList.contains("tree-child-leaves");
        if (isFolder) return currentNode.closest(".tree-leaf");
        if (skipDomUpdate) return currentNode;
        !noEmit && this.emit("select", {
            target: currentNode
        });
        return currentNode;
    }
    insertDomNode(leavesNode, domNode) {
        const nodeToInsert = new LeafNode(domNode);
        const children = Array.from(leavesNode.children);
        if (!children.length) {
            domNode.remove();
            leavesNode.append(domNode);
            return;
        }
        let containsFolders;
        let firstFile;
        const rightPlace = children.find((leaf => {
            const child = new LeafNode(leaf);
            containsFolders = containsFolders || child.type === "folder";
            firstFile = firstFile ? firstFile : child.type === "file" ? leaf : undefined;
            return child.type === nodeToInsert.type && child.name > nodeToInsert.name;
        }));
        domNode.remove();
        // is folder AND this is last in alpha, files exist
                if (nodeToInsert.type === "folder" && !rightPlace && containsFolders && firstFile) {
            leavesNode.insertBefore(domNode, firstFile);
            return;
        }
        // is folder AND only files
                if (nodeToInsert.type === "folder" && !rightPlace && !containsFolders && firstFile) {
            leavesNode.insertBefore(domNode, children[0]);
            return;
        }
        // is folder AND this is last in alpha, no files
        // is folder AND no folders,no file
        // all other cases
                if (nodeToInsert.type === "folder" && !rightPlace) {
            leavesNode.append(domNode);
            return;
        }
        // is file AND last in alpha
        // is file AND no files
        // is file AND no files, no folders
                if (nodeToInsert.type === "file" && !rightPlace) {
            leavesNode.append(domNode);
            return;
        }
        // golden path case
                leavesNode.insertBefore(domNode, rightPlace);
    }
    add(type, name, target) {
        let newTreeNode;
        if (!name) {
            newTreeNode = new NewTreeNode({
                type: type,
                name: ".newItem",
                id: target + "/.newItem"
            });
        }
        const id = target ? target + "/" + name : name;
        const domNode = newTreeNode ? newTreeNode.container : new TreeNode({
            name: name,
            type: type,
            id: id
        });
        const targetNode = this.select(target, "skipDomUpdate");
        const targetChildLeaves = targetNode.querySelector(":scope > .tree-child-leaves");
        this.insertDomNode(targetChildLeaves || targetNode, domNode);
        const nodeAddDone = () => {
            this.dragAndDrop.update();
            this.updateIcons();
            const leaf = new LeafNode(domNode);
            this.emit(type + "Add", {
                source: leaf.path
            });
        };
        if (!newTreeNode) return nodeAddDone();
        const doneCreating = (err, data) => {
            if (err) {
                domNode.remove();
                return;
            }
            this.insertDomNode(domNode.parentNode, domNode);
            nodeAddDone();
        };
        const siblings = [ "TODOErrorPopup" ];
        this.select(target, null, "noEmit");
        newTreeNode.focus(siblings, doneCreating);
    }
    move(path, target) {
        // change the dom
        const domNode = this.select(path, "skipDomUpdate");
        const targetNode = this.select(target, "skipDomUpdate");
        const targetChildLeaves = targetNode.querySelector(":scope > .tree-child-leaves");
        this.insertDomNode(targetChildLeaves || targetNode, domNode);
        const leaf = new LeafNode(domNode);
        //open parent folder after move
                const parentPath = leaf.path.split("/").slice(0, -1).join("/");
        parentPath && this.select(parentPath);
        const selectedChild = domNode.querySelector(":scope .selected");
        const selected = selectedChild ? selectedChild && new LeafNode(selectedChild) : leaf.type === "file" && leaf.selected && leaf;
        this.emit(leaf.type + "Move", {
            source: path,
            target: leaf.path
        });
        selected && this.select(selected.path);
    }
    async rename(path, _newName) {
        const domNode = this.select(path, "skipDomUpdate");
        const treeLeafContent = domNode.querySelector(".tree-leaf-content");
        const treeLeafText = domNode.querySelector(".tree-leaf-text");
        const children = domNode.querySelector(":scope > .tree-child-leaves");
        const newName = _newName || await new RenameUI({
            domNode: domNode,
            treeLeafContent: treeLeafContent,
            treeLeafText: treeLeafText,
            children: children
        });
        if (!newName) return;
        const leaf = new LeafNode(domNode);
        treeLeafText.textContent = newName;
        treeLeafText.className = "tree-leaf-text";
        //insertDomNode handles sort
                this.insertDomNode(leaf.parentLeaves, domNode);
        const selectedChild = domNode.querySelector(":scope .selected");
        const selected = selectedChild ? selectedChild && new LeafNode(selectedChild) : leaf.type === "file" && leaf.selected && leaf;
        if (leaf.type === "file") this.updateIcons();
        this.emit(leaf.type + "Rename", {
            source: path,
            target: leaf.path
        });
        selected && this.select(selected.path);
    }
    delete(path) {
        const domNode = this.select(path, "skipDomUpdate");
        const leaf = new LeafNode(domNode);
        const selectedChild = domNode.querySelector(":scope .selected");
        const selected = selectedChild ? selectedChild && new LeafNode(selectedChild) : leaf.type === "file" && leaf.selected && leaf;
        if (selected) {
            this.currentFile = undefined;
            this.currentFolder = undefined;
        }
        const {path: source, type: type} = leaf;
        domNode.remove();
        this.emit(type + "Delete", {
            source: source
        });
    }
    context(domNode) {
        const leaf = new LeafNode(domNode);
        const path = leaf.path;
        return {
            name: leaf.name,
            type: leaf.type,
            node: leaf.node,
            selected: leaf.selected,
            path: path,
            parent: {
                path: path.split("/").slice(0, -1).join("//"),
                node: leaf.parent
            }
        };
    }
    change(path) {
        this.changed = this.changed || [];
        this.changed.push(path);
        const domNode = this.select(path, "skipDomUpdate");
        const treeLeafContent = domNode.querySelector(":scope > .tree-leaf-content");
        treeLeafContent && treeLeafContent.classList && treeLeafContent.classList.add("changed");
    }
    clearChanged() {
        this.changed.forEach((path => {
            const domNode = this.select(path, "skipDomUpdate");
            const treeLeafContent = domNode.querySelector(":scope > .tree-leaf-content");
            treeLeafContent && treeLeafContent.classList && treeLeafContent.classList.remove("changed");
        }));
    }
}

/*!
    localForage -- Offline Storage, Improved
    Version 1.7.4
    https://localforage.github.io/localForage
    (c) 2013-2017 Mozilla, Apache License 2.0
*/ !function(a) {
    if ("object" == typeof exports && "undefined" != typeof module) module.exports = a(); else if ("function" == typeof define && define.amd) define([], a); else {
        var b;
        b = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this, 
        b.localforage = a();
    }
}((function() {
    return function a(b, c, d) {
        function e(g, h) {
            if (!c[g]) {
                if (!b[g]) {
                    var i = "function" == typeof require && require;
                    if (!h && i) return i(g, !0);
                    if (f) return f(g, !0);
                    var j = new Error("Cannot find module '" + g + "'");
                    throw j.code = "MODULE_NOT_FOUND", j;
                }
                var k = c[g] = {
                    exports: {}
                };
                b[g][0].call(k.exports, (function(a) {
                    var c = b[g][1][a];
                    return e(c || a);
                }), k, k.exports, a, b, c, d);
            }
            return c[g].exports;
        }
        for (var f = "function" == typeof require && require, g = 0; g < d.length; g++) e(d[g]);
        return e;
    }({
        1: [ function(a, b, c) {
            (function(a) {
                function c() {
                    k = !0;
                    for (var a, b, c = l.length; c; ) {
                        for (b = l, l = [], a = -1; ++a < c; ) b[a]();
                        c = l.length;
                    }
                    k = !1;
                }
                function d(a) {
                    1 !== l.push(a) || k || e();
                }
                var e, f = a.MutationObserver || a.WebKitMutationObserver;
                if (f) {
                    var g = 0, h = new f(c), i = a.document.createTextNode("");
                    h.observe(i, {
                        characterData: !0
                    }), e = function() {
                        i.data = g = ++g % 2;
                    };
                } else if (a.setImmediate || void 0 === a.MessageChannel) e = "document" in a && "onreadystatechange" in a.document.createElement("script") ? function() {
                    var b = a.document.createElement("script");
                    b.onreadystatechange = function() {
                        c(), b.onreadystatechange = null, b.parentNode.removeChild(b), b = null;
                    }, a.document.documentElement.appendChild(b);
                } : function() {
                    setTimeout(c, 0);
                }; else {
                    var j = new a.MessageChannel;
                    j.port1.onmessage = c, e = function() {
                        j.port2.postMessage(0);
                    };
                }
                var k, l = [];
                b.exports = d;
            }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
        }, {} ],
        2: [ function(a, b, c) {
            function d() {}
            function e(a) {
                if ("function" != typeof a) throw new TypeError("resolver must be a function");
                this.state = s, this.queue = [], this.outcome = void 0, a !== d && i(this, a);
            }
            function f(a, b, c) {
                this.promise = a, "function" == typeof b && (this.onFulfilled = b, this.callFulfilled = this.otherCallFulfilled), 
                "function" == typeof c && (this.onRejected = c, this.callRejected = this.otherCallRejected);
            }
            function g(a, b, c) {
                o((function() {
                    var d;
                    try {
                        d = b(c);
                    } catch (b) {
                        return p.reject(a, b);
                    }
                    d === a ? p.reject(a, new TypeError("Cannot resolve promise with itself")) : p.resolve(a, d);
                }));
            }
            function h(a) {
                var b = a && a.then;
                if (a && ("object" == typeof a || "function" == typeof a) && "function" == typeof b) return function() {
                    b.apply(a, arguments);
                };
            }
            function i(a, b) {
                function c(b) {
                    f || (f = !0, p.reject(a, b));
                }
                function d(b) {
                    f || (f = !0, p.resolve(a, b));
                }
                function e() {
                    b(d, c);
                }
                var f = !1, g = j(e);
                "error" === g.status && c(g.value);
            }
            function j(a, b) {
                var c = {};
                try {
                    c.value = a(b), c.status = "success";
                } catch (a) {
                    c.status = "error", c.value = a;
                }
                return c;
            }
            function k(a) {
                return a instanceof this ? a : p.resolve(new this(d), a);
            }
            function l(a) {
                var b = new this(d);
                return p.reject(b, a);
            }
            function m(a) {
                function b(a, b) {
                    function d(a) {
                        g[b] = a, ++h !== e || f || (f = !0, p.resolve(j, g));
                    }
                    c.resolve(a).then(d, (function(a) {
                        f || (f = !0, p.reject(j, a));
                    }));
                }
                var c = this;
                if ("[object Array]" !== Object.prototype.toString.call(a)) return this.reject(new TypeError("must be an array"));
                var e = a.length, f = !1;
                if (!e) return this.resolve([]);
                for (var g = new Array(e), h = 0, i = -1, j = new this(d); ++i < e; ) b(a[i], i);
                return j;
            }
            function n(a) {
                function b(a) {
                    c.resolve(a).then((function(a) {
                        f || (f = !0, p.resolve(h, a));
                    }), (function(a) {
                        f || (f = !0, p.reject(h, a));
                    }));
                }
                var c = this;
                if ("[object Array]" !== Object.prototype.toString.call(a)) return this.reject(new TypeError("must be an array"));
                var e = a.length, f = !1;
                if (!e) return this.resolve([]);
                for (var g = -1, h = new this(d); ++g < e; ) b(a[g]);
                return h;
            }
            var o = a(1), p = {}, q = [ "REJECTED" ], r = [ "FULFILLED" ], s = [ "PENDING" ];
            b.exports = e, e.prototype.catch = function(a) {
                return this.then(null, a);
            }, e.prototype.then = function(a, b) {
                if ("function" != typeof a && this.state === r || "function" != typeof b && this.state === q) return this;
                var c = new this.constructor(d);
                if (this.state !== s) {
                    g(c, this.state === r ? a : b, this.outcome);
                } else this.queue.push(new f(c, a, b));
                return c;
            }, f.prototype.callFulfilled = function(a) {
                p.resolve(this.promise, a);
            }, f.prototype.otherCallFulfilled = function(a) {
                g(this.promise, this.onFulfilled, a);
            }, f.prototype.callRejected = function(a) {
                p.reject(this.promise, a);
            }, f.prototype.otherCallRejected = function(a) {
                g(this.promise, this.onRejected, a);
            }, p.resolve = function(a, b) {
                var c = j(h, b);
                if ("error" === c.status) return p.reject(a, c.value);
                var d = c.value;
                if (d) i(a, d); else {
                    a.state = r, a.outcome = b;
                    for (var e = -1, f = a.queue.length; ++e < f; ) a.queue[e].callFulfilled(b);
                }
                return a;
            }, p.reject = function(a, b) {
                a.state = q, a.outcome = b;
                for (var c = -1, d = a.queue.length; ++c < d; ) a.queue[c].callRejected(b);
                return a;
            }, e.resolve = k, e.reject = l, e.all = m, e.race = n;
        }, {
            1: 1
        } ],
        3: [ function(a, b, c) {
            (function(b) {
                "function" != typeof b.Promise && (b.Promise = a(2));
            }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
        }, {
            2: 2
        } ],
        4: [ function(a, b, c) {
            function d(a, b) {
                if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
            }
            function e() {
                try {
                    if ("undefined" != typeof indexedDB) return indexedDB;
                    if ("undefined" != typeof webkitIndexedDB) return webkitIndexedDB;
                    if ("undefined" != typeof mozIndexedDB) return mozIndexedDB;
                    if ("undefined" != typeof OIndexedDB) return OIndexedDB;
                    if ("undefined" != typeof msIndexedDB) return msIndexedDB;
                } catch (a) {
                    return;
                }
            }
            function f() {
                try {
                    if (!ua || !ua.open) return !1;
                    var a = "undefined" != typeof openDatabase && /(Safari|iPhone|iPad|iPod)/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent) && !/BlackBerry/.test(navigator.platform), b = "function" == typeof fetch && -1 !== fetch.toString().indexOf("[native code");
                    return (!a || b) && "undefined" != typeof indexedDB && "undefined" != typeof IDBKeyRange;
                } catch (a) {
                    return !1;
                }
            }
            function g(a, b) {
                a = a || [], b = b || {};
                try {
                    return new Blob(a, b);
                } catch (f) {
                    if ("TypeError" !== f.name) throw f;
                    for (var c = "undefined" != typeof BlobBuilder ? BlobBuilder : "undefined" != typeof MSBlobBuilder ? MSBlobBuilder : "undefined" != typeof MozBlobBuilder ? MozBlobBuilder : WebKitBlobBuilder, d = new c, e = 0; e < a.length; e += 1) d.append(a[e]);
                    return d.getBlob(b.type);
                }
            }
            function h(a, b) {
                b && a.then((function(a) {
                    b(null, a);
                }), (function(a) {
                    b(a);
                }));
            }
            function i(a, b, c) {
                "function" == typeof b && a.then(b), "function" == typeof c && a.catch(c);
            }
            function j(a) {
                return "string" != typeof a && (console.warn(a + " used as a key, but it is not a string."), 
                a = String(a)), a;
            }
            function k() {
                if (arguments.length && "function" == typeof arguments[arguments.length - 1]) return arguments[arguments.length - 1];
            }
            function l(a) {
                for (var b = a.length, c = new ArrayBuffer(b), d = new Uint8Array(c), e = 0; e < b; e++) d[e] = a.charCodeAt(e);
                return c;
            }
            function m(a) {
                return new va((function(b) {
                    var c = a.transaction(wa, Ba), d = g([ "" ]);
                    c.objectStore(wa).put(d, "key"), c.onabort = function(a) {
                        a.preventDefault(), a.stopPropagation(), b(!1);
                    }, c.oncomplete = function() {
                        var a = navigator.userAgent.match(/Chrome\/(\d+)/), c = navigator.userAgent.match(/Edge\//);
                        b(c || !a || parseInt(a[1], 10) >= 43);
                    };
                })).catch((function() {
                    return !1;
                }));
            }
            function n(a) {
                return "boolean" == typeof xa ? va.resolve(xa) : m(a).then((function(a) {
                    return xa = a;
                }));
            }
            function o(a) {
                var b = ya[a.name], c = {};
                c.promise = new va((function(a, b) {
                    c.resolve = a, c.reject = b;
                })), b.deferredOperations.push(c), b.dbReady ? b.dbReady = b.dbReady.then((function() {
                    return c.promise;
                })) : b.dbReady = c.promise;
            }
            function p(a) {
                var b = ya[a.name], c = b.deferredOperations.pop();
                if (c) return c.resolve(), c.promise;
            }
            function q(a, b) {
                var c = ya[a.name], d = c.deferredOperations.pop();
                if (d) return d.reject(b), d.promise;
            }
            function r(a, b) {
                return new va((function(c, d) {
                    if (ya[a.name] = ya[a.name] || B(), a.db) {
                        if (!b) return c(a.db);
                        o(a), a.db.close();
                    }
                    var e = [ a.name ];
                    b && e.push(a.version);
                    var f = ua.open.apply(ua, e);
                    b && (f.onupgradeneeded = function(b) {
                        var c = f.result;
                        try {
                            c.createObjectStore(a.storeName), b.oldVersion <= 1 && c.createObjectStore(wa);
                        } catch (c) {
                            if ("ConstraintError" !== c.name) throw c;
                            console.warn('The database "' + a.name + '" has been upgraded from version ' + b.oldVersion + " to version " + b.newVersion + ', but the storage "' + a.storeName + '" already exists.');
                        }
                    }), f.onerror = function(a) {
                        a.preventDefault(), d(f.error);
                    }, f.onsuccess = function() {
                        c(f.result), p(a);
                    };
                }));
            }
            function s(a) {
                return r(a, !1);
            }
            function t(a) {
                return r(a, !0);
            }
            function u(a, b) {
                if (!a.db) return !0;
                var c = !a.db.objectStoreNames.contains(a.storeName), d = a.version < a.db.version, e = a.version > a.db.version;
                if (d && (a.version !== b && console.warn('The database "' + a.name + "\" can't be downgraded from version " + a.db.version + " to version " + a.version + "."), 
                a.version = a.db.version), e || c) {
                    if (c) {
                        var f = a.db.version + 1;
                        f > a.version && (a.version = f);
                    }
                    return !0;
                }
                return !1;
            }
            function v(a) {
                return new va((function(b, c) {
                    var d = new FileReader;
                    d.onerror = c, d.onloadend = function(c) {
                        var d = btoa(c.target.result || "");
                        b({
                            __local_forage_encoded_blob: !0,
                            data: d,
                            type: a.type
                        });
                    }, d.readAsBinaryString(a);
                }));
            }
            function w(a) {
                return g([ l(atob(a.data)) ], {
                    type: a.type
                });
            }
            function x(a) {
                return a && a.__local_forage_encoded_blob;
            }
            function y(a) {
                var b = this, c = b._initReady().then((function() {
                    var a = ya[b._dbInfo.name];
                    if (a && a.dbReady) return a.dbReady;
                }));
                return i(c, a, a), c;
            }
            function z(a) {
                o(a);
                for (var b = ya[a.name], c = b.forages, d = 0; d < c.length; d++) {
                    var e = c[d];
                    e._dbInfo.db && (e._dbInfo.db.close(), e._dbInfo.db = null);
                }
                return a.db = null, s(a).then((function(b) {
                    return a.db = b, u(a) ? t(a) : b;
                })).then((function(d) {
                    a.db = b.db = d;
                    for (var e = 0; e < c.length; e++) c[e]._dbInfo.db = d;
                })).catch((function(b) {
                    throw q(a, b), b;
                }));
            }
            function A(a, b, c, d) {
                void 0 === d && (d = 1);
                try {
                    var e = a.db.transaction(a.storeName, b);
                    c(null, e);
                } catch (e) {
                    if (d > 0 && (!a.db || "InvalidStateError" === e.name || "NotFoundError" === e.name)) return va.resolve().then((function() {
                        if (!a.db || "NotFoundError" === e.name && !a.db.objectStoreNames.contains(a.storeName) && a.version <= a.db.version) return a.db && (a.version = a.db.version + 1), 
                        t(a);
                    })).then((function() {
                        return z(a).then((function() {
                            A(a, b, c, d - 1);
                        }));
                    })).catch(c);
                    c(e);
                }
            }
            function B() {
                return {
                    forages: [],
                    db: null,
                    dbReady: null,
                    deferredOperations: []
                };
            }
            function C(a) {
                function b() {
                    return va.resolve();
                }
                var c = this, d = {
                    db: null
                };
                if (a) for (var e in a) d[e] = a[e];
                var f = ya[d.name];
                f || (f = B(), ya[d.name] = f), f.forages.push(c), c._initReady || (c._initReady = c.ready, 
                c.ready = y);
                for (var g = [], h = 0; h < f.forages.length; h++) {
                    var i = f.forages[h];
                    i !== c && g.push(i._initReady().catch(b));
                }
                var j = f.forages.slice(0);
                return va.all(g).then((function() {
                    return d.db = f.db, s(d);
                })).then((function(a) {
                    return d.db = a, u(d, c._defaultConfig.version) ? t(d) : a;
                })).then((function(a) {
                    d.db = f.db = a, c._dbInfo = d;
                    for (var b = 0; b < j.length; b++) {
                        var e = j[b];
                        e !== c && (e._dbInfo.db = d.db, e._dbInfo.version = d.version);
                    }
                }));
            }
            function D(a, b) {
                var c = this;
                a = j(a);
                var d = new va((function(b, d) {
                    c.ready().then((function() {
                        A(c._dbInfo, Aa, (function(e, f) {
                            if (e) return d(e);
                            try {
                                var g = f.objectStore(c._dbInfo.storeName), h = g.get(a);
                                h.onsuccess = function() {
                                    var a = h.result;
                                    void 0 === a && (a = null), x(a) && (a = w(a)), b(a);
                                }, h.onerror = function() {
                                    d(h.error);
                                };
                            } catch (a) {
                                d(a);
                            }
                        }));
                    })).catch(d);
                }));
                return h(d, b), d;
            }
            function E(a, b) {
                var c = this, d = new va((function(b, d) {
                    c.ready().then((function() {
                        A(c._dbInfo, Aa, (function(e, f) {
                            if (e) return d(e);
                            try {
                                var g = f.objectStore(c._dbInfo.storeName), h = g.openCursor(), i = 1;
                                h.onsuccess = function() {
                                    var c = h.result;
                                    if (c) {
                                        var d = c.value;
                                        x(d) && (d = w(d));
                                        var e = a(d, c.key, i++);
                                        void 0 !== e ? b(e) : c.continue();
                                    } else b();
                                }, h.onerror = function() {
                                    d(h.error);
                                };
                            } catch (a) {
                                d(a);
                            }
                        }));
                    })).catch(d);
                }));
                return h(d, b), d;
            }
            function F(a, b, c) {
                var d = this;
                a = j(a);
                var e = new va((function(c, e) {
                    var f;
                    d.ready().then((function() {
                        return f = d._dbInfo, "[object Blob]" === za.call(b) ? n(f.db).then((function(a) {
                            return a ? b : v(b);
                        })) : b;
                    })).then((function(b) {
                        A(d._dbInfo, Ba, (function(f, g) {
                            if (f) return e(f);
                            try {
                                var h = g.objectStore(d._dbInfo.storeName);
                                null === b && (b = void 0);
                                var i = h.put(b, a);
                                g.oncomplete = function() {
                                    void 0 === b && (b = null), c(b);
                                }, g.onabort = g.onerror = function() {
                                    var a = i.error ? i.error : i.transaction.error;
                                    e(a);
                                };
                            } catch (a) {
                                e(a);
                            }
                        }));
                    })).catch(e);
                }));
                return h(e, c), e;
            }
            function G(a, b) {
                var c = this;
                a = j(a);
                var d = new va((function(b, d) {
                    c.ready().then((function() {
                        A(c._dbInfo, Ba, (function(e, f) {
                            if (e) return d(e);
                            try {
                                var g = f.objectStore(c._dbInfo.storeName), h = g.delete(a);
                                f.oncomplete = function() {
                                    b();
                                }, f.onerror = function() {
                                    d(h.error);
                                }, f.onabort = function() {
                                    var a = h.error ? h.error : h.transaction.error;
                                    d(a);
                                };
                            } catch (a) {
                                d(a);
                            }
                        }));
                    })).catch(d);
                }));
                return h(d, b), d;
            }
            function H(a) {
                var b = this, c = new va((function(a, c) {
                    b.ready().then((function() {
                        A(b._dbInfo, Ba, (function(d, e) {
                            if (d) return c(d);
                            try {
                                var f = e.objectStore(b._dbInfo.storeName), g = f.clear();
                                e.oncomplete = function() {
                                    a();
                                }, e.onabort = e.onerror = function() {
                                    var a = g.error ? g.error : g.transaction.error;
                                    c(a);
                                };
                            } catch (a) {
                                c(a);
                            }
                        }));
                    })).catch(c);
                }));
                return h(c, a), c;
            }
            function I(a) {
                var b = this, c = new va((function(a, c) {
                    b.ready().then((function() {
                        A(b._dbInfo, Aa, (function(d, e) {
                            if (d) return c(d);
                            try {
                                var f = e.objectStore(b._dbInfo.storeName), g = f.count();
                                g.onsuccess = function() {
                                    a(g.result);
                                }, g.onerror = function() {
                                    c(g.error);
                                };
                            } catch (a) {
                                c(a);
                            }
                        }));
                    })).catch(c);
                }));
                return h(c, a), c;
            }
            function J(a, b) {
                var c = this, d = new va((function(b, d) {
                    if (a < 0) return void b(null);
                    c.ready().then((function() {
                        A(c._dbInfo, Aa, (function(e, f) {
                            if (e) return d(e);
                            try {
                                var g = f.objectStore(c._dbInfo.storeName), h = !1, i = g.openKeyCursor();
                                i.onsuccess = function() {
                                    var c = i.result;
                                    if (!c) return void b(null);
                                    0 === a ? b(c.key) : h ? b(c.key) : (h = !0, c.advance(a));
                                }, i.onerror = function() {
                                    d(i.error);
                                };
                            } catch (a) {
                                d(a);
                            }
                        }));
                    })).catch(d);
                }));
                return h(d, b), d;
            }
            function K(a) {
                var b = this, c = new va((function(a, c) {
                    b.ready().then((function() {
                        A(b._dbInfo, Aa, (function(d, e) {
                            if (d) return c(d);
                            try {
                                var f = e.objectStore(b._dbInfo.storeName), g = f.openKeyCursor(), h = [];
                                g.onsuccess = function() {
                                    var b = g.result;
                                    if (!b) return void a(h);
                                    h.push(b.key), b.continue();
                                }, g.onerror = function() {
                                    c(g.error);
                                };
                            } catch (a) {
                                c(a);
                            }
                        }));
                    })).catch(c);
                }));
                return h(c, a), c;
            }
            function L(a, b) {
                b = k.apply(this, arguments);
                var c = this.config();
                a = "function" != typeof a && a || {}, a.name || (a.name = a.name || c.name, a.storeName = a.storeName || c.storeName);
                var d, e = this;
                if (a.name) {
                    var f = a.name === c.name && e._dbInfo.db, g = f ? va.resolve(e._dbInfo.db) : s(a).then((function(b) {
                        var c = ya[a.name], d = c.forages;
                        c.db = b;
                        for (var e = 0; e < d.length; e++) d[e]._dbInfo.db = b;
                        return b;
                    }));
                    d = a.storeName ? g.then((function(b) {
                        if (b.objectStoreNames.contains(a.storeName)) {
                            var c = b.version + 1;
                            o(a);
                            var d = ya[a.name], e = d.forages;
                            b.close();
                            for (var f = 0; f < e.length; f++) {
                                var g = e[f];
                                g._dbInfo.db = null, g._dbInfo.version = c;
                            }
                            return new va((function(b, d) {
                                var e = ua.open(a.name, c);
                                e.onerror = function(a) {
                                    e.result.close(), d(a);
                                }, e.onupgradeneeded = function() {
                                    e.result.deleteObjectStore(a.storeName);
                                }, e.onsuccess = function() {
                                    var a = e.result;
                                    a.close(), b(a);
                                };
                            })).then((function(a) {
                                d.db = a;
                                for (var b = 0; b < e.length; b++) {
                                    var c = e[b];
                                    c._dbInfo.db = a, p(c._dbInfo);
                                }
                            })).catch((function(b) {
                                throw (q(a, b) || va.resolve()).catch((function() {})), b;
                            }));
                        }
                    })) : g.then((function(b) {
                        o(a);
                        var c = ya[a.name], d = c.forages;
                        b.close();
                        for (var e = 0; e < d.length; e++) {
                            d[e]._dbInfo.db = null;
                        }
                        return new va((function(b, c) {
                            var d = ua.deleteDatabase(a.name);
                            d.onerror = d.onblocked = function(a) {
                                var b = d.result;
                                b && b.close(), c(a);
                            }, d.onsuccess = function() {
                                var a = d.result;
                                a && a.close(), b(a);
                            };
                        })).then((function(a) {
                            c.db = a;
                            for (var b = 0; b < d.length; b++) p(d[b]._dbInfo);
                        })).catch((function(b) {
                            throw (q(a, b) || va.resolve()).catch((function() {})), b;
                        }));
                    }));
                } else d = va.reject("Invalid arguments");
                return h(d, b), d;
            }
            function M() {
                return "function" == typeof openDatabase;
            }
            function N(a) {
                var b, c, d, e, f, g = .75 * a.length, h = a.length, i = 0;
                "=" === a[a.length - 1] && (g--, "=" === a[a.length - 2] && g--);
                var j = new ArrayBuffer(g), k = new Uint8Array(j);
                for (b = 0; b < h; b += 4) c = Da.indexOf(a[b]), d = Da.indexOf(a[b + 1]), e = Da.indexOf(a[b + 2]), 
                f = Da.indexOf(a[b + 3]), k[i++] = c << 2 | d >> 4, k[i++] = (15 & d) << 4 | e >> 2, 
                k[i++] = (3 & e) << 6 | 63 & f;
                return j;
            }
            function O(a) {
                var b, c = new Uint8Array(a), d = "";
                for (b = 0; b < c.length; b += 3) d += Da[c[b] >> 2], d += Da[(3 & c[b]) << 4 | c[b + 1] >> 4], 
                d += Da[(15 & c[b + 1]) << 2 | c[b + 2] >> 6], d += Da[63 & c[b + 2]];
                return c.length % 3 == 2 ? d = d.substring(0, d.length - 1) + "=" : c.length % 3 == 1 && (d = d.substring(0, d.length - 2) + "=="), 
                d;
            }
            function P(a, b) {
                var c = "";
                if (a && (c = Ua.call(a)), a && ("[object ArrayBuffer]" === c || a.buffer && "[object ArrayBuffer]" === Ua.call(a.buffer))) {
                    var d, e = Ga;
                    a instanceof ArrayBuffer ? (d = a, e += Ia) : (d = a.buffer, "[object Int8Array]" === c ? e += Ka : "[object Uint8Array]" === c ? e += La : "[object Uint8ClampedArray]" === c ? e += Ma : "[object Int16Array]" === c ? e += Na : "[object Uint16Array]" === c ? e += Pa : "[object Int32Array]" === c ? e += Oa : "[object Uint32Array]" === c ? e += Qa : "[object Float32Array]" === c ? e += Ra : "[object Float64Array]" === c ? e += Sa : b(new Error("Failed to get type for BinaryArray"))), 
                    b(e + O(d));
                } else if ("[object Blob]" === c) {
                    var f = new FileReader;
                    f.onload = function() {
                        var c = Ea + a.type + "~" + O(this.result);
                        b(Ga + Ja + c);
                    }, f.readAsArrayBuffer(a);
                } else try {
                    b(JSON.stringify(a));
                } catch (c) {
                    console.error("Couldn't convert value into a JSON string: ", a), b(null, c);
                }
            }
            function Q(a) {
                if (a.substring(0, Ha) !== Ga) return JSON.parse(a);
                var b, c = a.substring(Ta), d = a.substring(Ha, Ta);
                if (d === Ja && Fa.test(c)) {
                    var e = c.match(Fa);
                    b = e[1], c = c.substring(e[0].length);
                }
                var f = N(c);
                switch (d) {
                  case Ia:
                    return f;

                  case Ja:
                    return g([ f ], {
                        type: b
                    });

                  case Ka:
                    return new Int8Array(f);

                  case La:
                    return new Uint8Array(f);

                  case Ma:
                    return new Uint8ClampedArray(f);

                  case Na:
                    return new Int16Array(f);

                  case Pa:
                    return new Uint16Array(f);

                  case Oa:
                    return new Int32Array(f);

                  case Qa:
                    return new Uint32Array(f);

                  case Ra:
                    return new Float32Array(f);

                  case Sa:
                    return new Float64Array(f);

                  default:
                    throw new Error("Unkown type: " + d);
                }
            }
            function R(a, b, c, d) {
                a.executeSql("CREATE TABLE IF NOT EXISTS " + b.storeName + " (id INTEGER PRIMARY KEY, key unique, value)", [], c, d);
            }
            function S(a) {
                var b = this, c = {
                    db: null
                };
                if (a) for (var d in a) c[d] = "string" != typeof a[d] ? a[d].toString() : a[d];
                var e = new va((function(a, d) {
                    try {
                        c.db = openDatabase(c.name, String(c.version), c.description, c.size);
                    } catch (a) {
                        return d(a);
                    }
                    c.db.transaction((function(e) {
                        R(e, c, (function() {
                            b._dbInfo = c, a();
                        }), (function(a, b) {
                            d(b);
                        }));
                    }), d);
                }));
                return c.serializer = Va, e;
            }
            function T(a, b, c, d, e, f) {
                a.executeSql(c, d, e, (function(a, g) {
                    g.code === g.SYNTAX_ERR ? a.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name = ?", [ b.storeName ], (function(a, h) {
                        h.rows.length ? f(a, g) : R(a, b, (function() {
                            a.executeSql(c, d, e, f);
                        }), f);
                    }), f) : f(a, g);
                }), f);
            }
            function U(a, b) {
                var c = this;
                a = j(a);
                var d = new va((function(b, d) {
                    c.ready().then((function() {
                        var e = c._dbInfo;
                        e.db.transaction((function(c) {
                            T(c, e, "SELECT * FROM " + e.storeName + " WHERE key = ? LIMIT 1", [ a ], (function(a, c) {
                                var d = c.rows.length ? c.rows.item(0).value : null;
                                d && (d = e.serializer.deserialize(d)), b(d);
                            }), (function(a, b) {
                                d(b);
                            }));
                        }));
                    })).catch(d);
                }));
                return h(d, b), d;
            }
            function V(a, b) {
                var c = this, d = new va((function(b, d) {
                    c.ready().then((function() {
                        var e = c._dbInfo;
                        e.db.transaction((function(c) {
                            T(c, e, "SELECT * FROM " + e.storeName, [], (function(c, d) {
                                for (var f = d.rows, g = f.length, h = 0; h < g; h++) {
                                    var i = f.item(h), j = i.value;
                                    if (j && (j = e.serializer.deserialize(j)), void 0 !== (j = a(j, i.key, h + 1))) return void b(j);
                                }
                                b();
                            }), (function(a, b) {
                                d(b);
                            }));
                        }));
                    })).catch(d);
                }));
                return h(d, b), d;
            }
            function W(a, b, c, d) {
                var e = this;
                a = j(a);
                var f = new va((function(f, g) {
                    e.ready().then((function() {
                        void 0 === b && (b = null);
                        var h = b, i = e._dbInfo;
                        i.serializer.serialize(b, (function(b, j) {
                            j ? g(j) : i.db.transaction((function(c) {
                                T(c, i, "INSERT OR REPLACE INTO " + i.storeName + " (key, value) VALUES (?, ?)", [ a, b ], (function() {
                                    f(h);
                                }), (function(a, b) {
                                    g(b);
                                }));
                            }), (function(b) {
                                if (b.code === b.QUOTA_ERR) {
                                    if (d > 0) return void f(W.apply(e, [ a, h, c, d - 1 ]));
                                    g(b);
                                }
                            }));
                        }));
                    })).catch(g);
                }));
                return h(f, c), f;
            }
            function X(a, b, c) {
                return W.apply(this, [ a, b, c, 1 ]);
            }
            function Y(a, b) {
                var c = this;
                a = j(a);
                var d = new va((function(b, d) {
                    c.ready().then((function() {
                        var e = c._dbInfo;
                        e.db.transaction((function(c) {
                            T(c, e, "DELETE FROM " + e.storeName + " WHERE key = ?", [ a ], (function() {
                                b();
                            }), (function(a, b) {
                                d(b);
                            }));
                        }));
                    })).catch(d);
                }));
                return h(d, b), d;
            }
            function Z(a) {
                var b = this, c = new va((function(a, c) {
                    b.ready().then((function() {
                        var d = b._dbInfo;
                        d.db.transaction((function(b) {
                            T(b, d, "DELETE FROM " + d.storeName, [], (function() {
                                a();
                            }), (function(a, b) {
                                c(b);
                            }));
                        }));
                    })).catch(c);
                }));
                return h(c, a), c;
            }
            function $(a) {
                var b = this, c = new va((function(a, c) {
                    b.ready().then((function() {
                        var d = b._dbInfo;
                        d.db.transaction((function(b) {
                            T(b, d, "SELECT COUNT(key) as c FROM " + d.storeName, [], (function(b, c) {
                                var d = c.rows.item(0).c;
                                a(d);
                            }), (function(a, b) {
                                c(b);
                            }));
                        }));
                    })).catch(c);
                }));
                return h(c, a), c;
            }
            function _(a, b) {
                var c = this, d = new va((function(b, d) {
                    c.ready().then((function() {
                        var e = c._dbInfo;
                        e.db.transaction((function(c) {
                            T(c, e, "SELECT key FROM " + e.storeName + " WHERE id = ? LIMIT 1", [ a + 1 ], (function(a, c) {
                                var d = c.rows.length ? c.rows.item(0).key : null;
                                b(d);
                            }), (function(a, b) {
                                d(b);
                            }));
                        }));
                    })).catch(d);
                }));
                return h(d, b), d;
            }
            function aa(a) {
                var b = this, c = new va((function(a, c) {
                    b.ready().then((function() {
                        var d = b._dbInfo;
                        d.db.transaction((function(b) {
                            T(b, d, "SELECT key FROM " + d.storeName, [], (function(b, c) {
                                for (var d = [], e = 0; e < c.rows.length; e++) d.push(c.rows.item(e).key);
                                a(d);
                            }), (function(a, b) {
                                c(b);
                            }));
                        }));
                    })).catch(c);
                }));
                return h(c, a), c;
            }
            function ba(a) {
                return new va((function(b, c) {
                    a.transaction((function(d) {
                        d.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name <> '__WebKitDatabaseInfoTable__'", [], (function(c, d) {
                            for (var e = [], f = 0; f < d.rows.length; f++) e.push(d.rows.item(f).name);
                            b({
                                db: a,
                                storeNames: e
                            });
                        }), (function(a, b) {
                            c(b);
                        }));
                    }), (function(a) {
                        c(a);
                    }));
                }));
            }
            function ca(a, b) {
                b = k.apply(this, arguments);
                var c = this.config();
                a = "function" != typeof a && a || {}, a.name || (a.name = a.name || c.name, a.storeName = a.storeName || c.storeName);
                var d, e = this;
                return d = a.name ? new va((function(b) {
                    var d;
                    d = a.name === c.name ? e._dbInfo.db : openDatabase(a.name, "", "", 0), b(a.storeName ? {
                        db: d,
                        storeNames: [ a.storeName ]
                    } : ba(d));
                })).then((function(a) {
                    return new va((function(b, c) {
                        a.db.transaction((function(d) {
                            function e(a) {
                                return new va((function(b, c) {
                                    d.executeSql("DROP TABLE IF EXISTS " + a, [], (function() {
                                        b();
                                    }), (function(a, b) {
                                        c(b);
                                    }));
                                }));
                            }
                            for (var f = [], g = 0, h = a.storeNames.length; g < h; g++) f.push(e(a.storeNames[g]));
                            va.all(f).then((function() {
                                b();
                            })).catch((function(a) {
                                c(a);
                            }));
                        }), (function(a) {
                            c(a);
                        }));
                    }));
                })) : va.reject("Invalid arguments"), h(d, b), d;
            }
            function da() {
                try {
                    return "undefined" != typeof localStorage && "setItem" in localStorage && !!localStorage.setItem;
                } catch (a) {
                    return !1;
                }
            }
            function ea(a, b) {
                var c = a.name + "/";
                return a.storeName !== b.storeName && (c += a.storeName + "/"), c;
            }
            function fa() {
                var a = "_localforage_support_test";
                try {
                    return localStorage.setItem(a, !0), localStorage.removeItem(a), !1;
                } catch (a) {
                    return !0;
                }
            }
            function ga() {
                return !fa() || localStorage.length > 0;
            }
            function ha(a) {
                var b = this, c = {};
                if (a) for (var d in a) c[d] = a[d];
                return c.keyPrefix = ea(a, b._defaultConfig), ga() ? (b._dbInfo = c, c.serializer = Va, 
                va.resolve()) : va.reject();
            }
            function ia(a) {
                var b = this, c = b.ready().then((function() {
                    for (var a = b._dbInfo.keyPrefix, c = localStorage.length - 1; c >= 0; c--) {
                        var d = localStorage.key(c);
                        0 === d.indexOf(a) && localStorage.removeItem(d);
                    }
                }));
                return h(c, a), c;
            }
            function ja(a, b) {
                var c = this;
                a = j(a);
                var d = c.ready().then((function() {
                    var b = c._dbInfo, d = localStorage.getItem(b.keyPrefix + a);
                    return d && (d = b.serializer.deserialize(d)), d;
                }));
                return h(d, b), d;
            }
            function ka(a, b) {
                var c = this, d = c.ready().then((function() {
                    for (var b = c._dbInfo, d = b.keyPrefix, e = d.length, f = localStorage.length, g = 1, h = 0; h < f; h++) {
                        var i = localStorage.key(h);
                        if (0 === i.indexOf(d)) {
                            var j = localStorage.getItem(i);
                            if (j && (j = b.serializer.deserialize(j)), void 0 !== (j = a(j, i.substring(e), g++))) return j;
                        }
                    }
                }));
                return h(d, b), d;
            }
            function la(a, b) {
                var c = this, d = c.ready().then((function() {
                    var b, d = c._dbInfo;
                    try {
                        b = localStorage.key(a);
                    } catch (a) {
                        b = null;
                    }
                    return b && (b = b.substring(d.keyPrefix.length)), b;
                }));
                return h(d, b), d;
            }
            function ma(a) {
                var b = this, c = b.ready().then((function() {
                    for (var a = b._dbInfo, c = localStorage.length, d = [], e = 0; e < c; e++) {
                        var f = localStorage.key(e);
                        0 === f.indexOf(a.keyPrefix) && d.push(f.substring(a.keyPrefix.length));
                    }
                    return d;
                }));
                return h(c, a), c;
            }
            function na(a) {
                var b = this, c = b.keys().then((function(a) {
                    return a.length;
                }));
                return h(c, a), c;
            }
            function oa(a, b) {
                var c = this;
                a = j(a);
                var d = c.ready().then((function() {
                    var b = c._dbInfo;
                    localStorage.removeItem(b.keyPrefix + a);
                }));
                return h(d, b), d;
            }
            function pa(a, b, c) {
                var d = this;
                a = j(a);
                var e = d.ready().then((function() {
                    void 0 === b && (b = null);
                    var c = b;
                    return new va((function(e, f) {
                        var g = d._dbInfo;
                        g.serializer.serialize(b, (function(b, d) {
                            if (d) f(d); else try {
                                localStorage.setItem(g.keyPrefix + a, b), e(c);
                            } catch (a) {
                                "QuotaExceededError" !== a.name && "NS_ERROR_DOM_QUOTA_REACHED" !== a.name || f(a), 
                                f(a);
                            }
                        }));
                    }));
                }));
                return h(e, c), e;
            }
            function qa(a, b) {
                if (b = k.apply(this, arguments), a = "function" != typeof a && a || {}, !a.name) {
                    var c = this.config();
                    a.name = a.name || c.name, a.storeName = a.storeName || c.storeName;
                }
                var d, e = this;
                return d = a.name ? new va((function(b) {
                    b(a.storeName ? ea(a, e._defaultConfig) : a.name + "/");
                })).then((function(a) {
                    for (var b = localStorage.length - 1; b >= 0; b--) {
                        var c = localStorage.key(b);
                        0 === c.indexOf(a) && localStorage.removeItem(c);
                    }
                })) : va.reject("Invalid arguments"), h(d, b), d;
            }
            function ra(a, b) {
                a[b] = function() {
                    var c = arguments;
                    return a.ready().then((function() {
                        return a[b].apply(a, c);
                    }));
                };
            }
            function sa() {
                for (var a = 1; a < arguments.length; a++) {
                    var b = arguments[a];
                    if (b) for (var c in b) b.hasOwnProperty(c) && ($a(b[c]) ? arguments[0][c] = b[c].slice() : arguments[0][c] = b[c]);
                }
                return arguments[0];
            }
            var ta = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(a) {
                return typeof a;
            } : function(a) {
                return a && "function" == typeof Symbol && a.constructor === Symbol && a !== Symbol.prototype ? "symbol" : typeof a;
            }, ua = e();
            "undefined" == typeof Promise && a(3);
            var va = Promise, wa = "local-forage-detect-blob-support", xa = void 0, ya = {}, za = Object.prototype.toString, Aa = "readonly", Ba = "readwrite", Ca = {
                _driver: "asyncStorage",
                _initStorage: C,
                _support: f(),
                iterate: E,
                getItem: D,
                setItem: F,
                removeItem: G,
                clear: H,
                length: I,
                key: J,
                keys: K,
                dropInstance: L
            }, Da = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", Ea = "~~local_forage_type~", Fa = /^~~local_forage_type~([^~]+)~/, Ga = "__lfsc__:", Ha = Ga.length, Ia = "arbf", Ja = "blob", Ka = "si08", La = "ui08", Ma = "uic8", Na = "si16", Oa = "si32", Pa = "ur16", Qa = "ui32", Ra = "fl32", Sa = "fl64", Ta = Ha + Ia.length, Ua = Object.prototype.toString, Va = {
                serialize: P,
                deserialize: Q,
                stringToBuffer: N,
                bufferToString: O
            }, Wa = {
                _driver: "webSQLStorage",
                _initStorage: S,
                _support: M(),
                iterate: V,
                getItem: U,
                setItem: X,
                removeItem: Y,
                clear: Z,
                length: $,
                key: _,
                keys: aa,
                dropInstance: ca
            }, Xa = {
                _driver: "localStorageWrapper",
                _initStorage: ha,
                _support: da(),
                iterate: ka,
                getItem: ja,
                setItem: pa,
                removeItem: oa,
                clear: ia,
                length: na,
                key: la,
                keys: ma,
                dropInstance: qa
            }, Ya = function(a, b) {
                return a === b || "number" == typeof a && "number" == typeof b && isNaN(a) && isNaN(b);
            }, Za = function(a, b) {
                for (var c = a.length, d = 0; d < c; ) {
                    if (Ya(a[d], b)) return !0;
                    d++;
                }
                return !1;
            }, $a = Array.isArray || function(a) {
                return "[object Array]" === Object.prototype.toString.call(a);
            }, _a = {}, ab = {}, bb = {
                INDEXEDDB: Ca,
                WEBSQL: Wa,
                LOCALSTORAGE: Xa
            }, cb = [ bb.INDEXEDDB._driver, bb.WEBSQL._driver, bb.LOCALSTORAGE._driver ], db = [ "dropInstance" ], eb = [ "clear", "getItem", "iterate", "key", "keys", "length", "removeItem", "setItem" ].concat(db), fb = {
                description: "",
                driver: cb.slice(),
                name: "localforage",
                size: 4980736,
                storeName: "keyvaluepairs",
                version: 1
            }, gb = function() {
                function a(b) {
                    d(this, a);
                    for (var c in bb) if (bb.hasOwnProperty(c)) {
                        var e = bb[c], f = e._driver;
                        this[c] = f, _a[f] || this.defineDriver(e);
                    }
                    this._defaultConfig = sa({}, fb), this._config = sa({}, this._defaultConfig, b), 
                    this._driverSet = null, this._initDriver = null, this._ready = !1, this._dbInfo = null, 
                    this._wrapLibraryMethodsWithReady(), this.setDriver(this._config.driver).catch((function() {}));
                }
                return a.prototype.config = function(a) {
                    if ("object" === (void 0 === a ? "undefined" : ta(a))) {
                        if (this._ready) return new Error("Can't call config() after localforage has been used.");
                        for (var b in a) {
                            if ("storeName" === b && (a[b] = a[b].replace(/\W/g, "_")), "version" === b && "number" != typeof a[b]) return new Error("Database version must be a number.");
                            this._config[b] = a[b];
                        }
                        return !("driver" in a && a.driver) || this.setDriver(this._config.driver);
                    }
                    return "string" == typeof a ? this._config[a] : this._config;
                }, a.prototype.defineDriver = function(a, b, c) {
                    var d = new va((function(b, c) {
                        try {
                            var d = a._driver, e = new Error("Custom driver not compliant; see https://mozilla.github.io/localForage/#definedriver");
                            if (!a._driver) return void c(e);
                            for (var f = eb.concat("_initStorage"), g = 0, i = f.length; g < i; g++) {
                                var j = f[g];
                                if ((!Za(db, j) || a[j]) && "function" != typeof a[j]) return void c(e);
                            }
                            (function() {
                                for (var b = function(a) {
                                    return function() {
                                        var b = new Error("Method " + a + " is not implemented by the current driver"), c = va.reject(b);
                                        return h(c, arguments[arguments.length - 1]), c;
                                    };
                                }, c = 0, d = db.length; c < d; c++) {
                                    var e = db[c];
                                    a[e] || (a[e] = b(e));
                                }
                            })();
                            var k = function(c) {
                                _a[d] && console.info("Redefining LocalForage driver: " + d), _a[d] = a, ab[d] = c, 
                                b();
                            };
                            "_support" in a ? a._support && "function" == typeof a._support ? a._support().then(k, c) : k(!!a._support) : k(!0);
                        } catch (a) {
                            c(a);
                        }
                    }));
                    return i(d, b, c), d;
                }, a.prototype.driver = function() {
                    return this._driver || null;
                }, a.prototype.getDriver = function(a, b, c) {
                    var d = _a[a] ? va.resolve(_a[a]) : va.reject(new Error("Driver not found."));
                    return i(d, b, c), d;
                }, a.prototype.getSerializer = function(a) {
                    var b = va.resolve(Va);
                    return i(b, a), b;
                }, a.prototype.ready = function(a) {
                    var b = this, c = b._driverSet.then((function() {
                        return null === b._ready && (b._ready = b._initDriver()), b._ready;
                    }));
                    return i(c, a, a), c;
                }, a.prototype.setDriver = function(a, b, c) {
                    function d() {
                        g._config.driver = g.driver();
                    }
                    function e(a) {
                        return g._extend(a), d(), g._ready = g._initStorage(g._config), g._ready;
                    }
                    function f(a) {
                        return function() {
                            function b() {
                                for (;c < a.length; ) {
                                    var f = a[c];
                                    return c++, g._dbInfo = null, g._ready = null, g.getDriver(f).then(e).catch(b);
                                }
                                d();
                                var h = new Error("No available storage method found.");
                                return g._driverSet = va.reject(h), g._driverSet;
                            }
                            var c = 0;
                            return b();
                        };
                    }
                    var g = this;
                    $a(a) || (a = [ a ]);
                    var h = this._getSupportedDrivers(a), j = null !== this._driverSet ? this._driverSet.catch((function() {
                        return va.resolve();
                    })) : va.resolve();
                    return this._driverSet = j.then((function() {
                        var a = h[0];
                        return g._dbInfo = null, g._ready = null, g.getDriver(a).then((function(a) {
                            g._driver = a._driver, d(), g._wrapLibraryMethodsWithReady(), g._initDriver = f(h);
                        }));
                    })).catch((function() {
                        d();
                        var a = new Error("No available storage method found.");
                        return g._driverSet = va.reject(a), g._driverSet;
                    })), i(this._driverSet, b, c), this._driverSet;
                }, a.prototype.supports = function(a) {
                    return !!ab[a];
                }, a.prototype._extend = function(a) {
                    sa(this, a);
                }, a.prototype._getSupportedDrivers = function(a) {
                    for (var b = [], c = 0, d = a.length; c < d; c++) {
                        var e = a[c];
                        this.supports(e) && b.push(e);
                    }
                    return b;
                }, a.prototype._wrapLibraryMethodsWithReady = function() {
                    for (var a = 0, b = eb.length; a < b; a++) ra(this, eb[a]);
                }, a.prototype.createInstance = function(b) {
                    return new a(b);
                }, a;
            }(), hb = new gb;
            b.exports = hb;
        }, {
            3: 3
        } ]
    }, {}, [ 4 ])(4);
}));

const driver = [ localforage.INDEXEDDB, localforage.WEBSQL, localforage.LOCALSTORAGE ];

const changesStore = localforage.createInstance({
    driver: driver,
    name: "service-worker",
    version: 1,
    storeName: "changes",
    description: "keep track of changes not pushed to provider"
});

const treeMemory = (service, tree, action) => (...args) => {
    const handlers = {
        expand: async args => {
            const expanded = tree.context(args[0].target).path;
            const oldExpanded = await changesStore.getItem(`tree-${service.name}-expanded`) || [];
            oldExpanded.includes(expanded) ? oldExpanded : [ ...oldExpanded, expanded ];
            //await changesStore.setItem(`tree-${service.name}-expanded`, newExpanded);
                },
        collapse: async args => {
            const collapsed = tree.context(args[0].target).path;
            const oldExpanded = await changesStore.getItem(`tree-${service.name}-expanded`) || [];
            oldExpanded.filter((x => x !== collapsed));
            //await changesStore.setItem(`tree-${service.name}-expanded`, newExpanded);
                },
        select: async args => {
            tree.context(args[0].target).path;
            //await changesStore.setItem(`tree-${service.name}-selected`, selected);
                }
    };
    if (!handlers[action]) return;
    handlers[action](args);
};

const newTree = ({service: service, treeState: treeState}, context) => {
    const {events: triggers} = context.tree;
    //_service = service ? service.name : '';
        const treeRootId = "tree-view";
    // TODO: clear old tree if exists?
        const tree = new ServiceTree(service, treeRootId, treeState, extensionMapper);
    setState("tree", tree);
    const methods = [ "Add", "Delete", "Select", "Move", "Rename", "Context", "Change", "ClearChanged" ].reduce(((all, one) => {
        all["tree" + one] = (...args) => {
            try {
                if (!tree) return;
 //should keep track of this instead of blindly returning
                                if (one === "Add" && typeof args[2] === "undefined") {
                    return tree.add(args[0], null, tree.currentFolder || "");
                }
                if (one === "ClearChanged") {
                    return tree.clearChanged();
                }
                return tree[one.toLowerCase()](...args);
            } catch (e) {
                console.warn(e);
            }
        };
        return all;
    }), {});
    context.tree.api = methods;
    const memoryHandler = action => treeMemory(service, tree, action);
    tree.on("expand", memoryHandler("expand"));
    tree.on("collapse", memoryHandler("collapse"));
    tree.on("select", memoryHandler("select"));
    Object.entries(triggers).forEach((([event, handler]) => tree.on(event, handler(context))));
    TreeView$1.menu.update({
        project: service.name
    });
};

TreeView$1.newTree = newTree;

function treeDomNodeFromPath(path) {
    if (!path) {
        return document.querySelector("#tree-view");
    }
    const leaves = Array.from(document.querySelectorAll("#tree-view .tree-leaf-content"));
    const name = path.split("/").pop();
    const found = leaves.find((x => JSON.parse(x.dataset.item).name === name));
    return found;
}

function newFile({parent: parent, onDone: onDone}) {
    if (!onDone) {
        return console.error("newFile requires an onDone event handler");
    }
    const parentDOM = treeDomNodeFromPath(parent);
    let nearbySibling;
    if (parent) {
        const expando = parentDOM.querySelector(".tree-expando");
        expando.classList.remove("closed");
        expando.classList.add("expanded", "open");
        const childLeaves = parentDOM.parentNode.querySelector(".tree-child-leaves");
        childLeaves.classList.remove("hidden");
        nearbySibling = childLeaves.querySelector(".tree-leaf");
    } else {
        try {
            nearbySibling = Array.from(parentDOM.children).find((x => JSON.parse(x.querySelector(".tree-leaf-content").dataset.item).children.length === 0));
        } catch (e) {}
    }
    if (!nearbySibling) {
        console.error("unable to add new file; error parsing DOM");
        return;
    }
    const paddingLeft = nearbySibling.querySelector(".tree-leaf-content").style.paddingLeft;
    const newFileNode = htmlToElement(`\n\t\t<div class="tree-leaf new">\n\t\t\t<div class="tree-leaf-content" style="padding-left: ${paddingLeft};">\n\t\t\t\t<div class="tree-leaf-text icon-default">\n\t\t\t\t\t<input type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t</div>\n\t\t`);
    const fileNameInput = newFileNode.querySelector("input");
    const finishInput = event => {
        if (event.key && event.key !== "Enter") {
            return;
        }
        const filename = fileNameInput.value;
        fileNameInput.removeEventListener("blur", finishInput);
        fileNameInput.removeEventListener("keyup", finishInput);
        if (!filename) {
            return;
        }
        newFileNode.classList.add("creating");
        fileNameInput.disabled = true;
        onDone(filename, parent);
    };
    fileNameInput.addEventListener("blur", finishInput);
    fileNameInput.addEventListener("keyup", finishInput);
    //TODO: focus input, when input loses focus create real file
    //TODO: when ENTER is pressed, create real file (or add a cool error box)
        nearbySibling.parentNode.insertBefore(newFileNode, nearbySibling);
    fileNameInput.focus();
}

TreeView$1.newFile = newFile;

function newFolder({parent: parent, onDone: onDone}) {
    if (!onDone) {
        return console.error("newFolder requires an onDone event handler");
    }
    const parentDOM = treeDomNodeFromPath(parent);
    const expando = parentDOM.querySelector(".tree-expando");
    expando.classList.remove("closed");
    expando.classList.add("expanded", "open");
    const childLeaves = parentDOM.parentNode.querySelector(".tree-child-leaves");
    childLeaves.classList.remove("hidden");
    const nearbySibling = childLeaves.querySelector(".tree-leaf");
    const paddingLeft = nearbySibling.querySelector(".tree-leaf-content").style.paddingLeft;
    const newFolderNode = htmlToElement(`\n\t\t<div class="tree-leaf new">\n\t\t\t<div class="tree-leaf-content" style="padding-left: ${paddingLeft};">\n\t\t\t\t<div class="tree-leaf-text icon-default">\n\t\t\t\t\t<input type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t</div>\n\t`);
    const folderNameInput = newFolderNode.querySelector("input");
    const finishInput = event => {
        if (event.key && event.key !== "Enter") {
            return;
        }
        const foldername = folderNameInput.value;
        folderNameInput.removeEventListener("blur", finishInput);
        folderNameInput.removeEventListener("keyup", finishInput);
        newFolderNode.parentNode.removeChild(newFolderNode);
        if (!foldername) {
            return;
        }
        onDone(foldername, parent);
    };
    folderNameInput.addEventListener("blur", finishInput);
    folderNameInput.addEventListener("keyup", finishInput);
    //TODO: focus input, when input loses focus create real folder
    //TODO: when ENTER is pressed, create real folder (or add a cool error box)
        nearbySibling.parentNode.insertBefore(newFolderNode, nearbySibling);
    folderNameInput.focus();
}

TreeView$1.newFolder = newFolder;

const connectTrigger = args => {
    const {eventName: eventName} = args;
    return (body, context) => {
        const thisTrigger = context.triggers.tree[eventName];
        if (!thisTrigger) {
            console.log(`trigger not registered for ${eventName}`);
            return;
        }
        thisTrigger(body);
        //console.log({eventName, body});
        };
};

// attachListener(Update, {
// 	...treeMethods,
// 	newFile: ({ parent }) => tree.add('file', null, parent),
// 	newFolder: ({ parent }) => tree.add('folder', null, parent),
// 	//showSearch: showSearch(treeView),
// 	//updateTreeMenu,
// 	//showServiceChooser: showServiceChooser(treeView),
// });
// these get attached each newly created tree module
const treeEvents = [ "fileSelect", "fileAdd", "fileRename", "fileMove", "fileDelete", "folderSelect", "folderAdd", "folderRename", "folderMove", "folderDelete" ];

const triggers$2 = treeEvents.reduce(((all, operation) => {
    const handler = connectTrigger({
        eventName: operation.includes("Select") ? operation : "operations",
        type: "raw"
    });
    const operationAdapt = {
        fileAdd: "addFile",
        fileDelete: "deleteFile",
        fileRename: "renameFile",
        fileMove: "moveFile",
        folderAdd: "addFolder",
        folderDelete: "deleteFolder",
        folderRename: "renameFolder",
        folderMove: "moveFolder"
    };
    const treeEventHandler = context => args => {
        console.log({
            context: context,
            args: args
        });
        const {source: source, target: target, line: line, column: column} = args;
        const name = (target || source).split("/").pop();
        const parent = (target || source).split("/").slice(0, -1).join("/");
        const _service = "TODO";
        const handlerMessage = {
            detail: {
                name: name,
                oldName: source,
                newName: target,
                src: source,
                tgt: target,
                parent: parent,
                operation: operationAdapt[operation] || operation,
                filename: name,
                folderName: name,
                line: line,
                column: column,
                body: {},
                service: _service
            }
        };
        return handler(handlerMessage, context);
    };
    all[operation] = treeEventHandler;
    return all;
}), {});

TreeView$1.events = triggers$2;

const contextMenuHandler = (e, listenerContext) => {
    const {treeView: treeView, treeContext: treeContext, showMenu: showMenu} = listenerContext.tree;
    /*
		TreeView module should have a right click listener
		it should call handler with info about the thing that was clicked
		
		this should be wired up in UI, each menu item should contain trigger
	*/    if (!treeView.contains(e.target)) {
        return true;
    }
    e.preventDefault();
    const context = treeContext(e.target);
    const listItems = [ {
        name: "New File"
    }, {
        name: "New Folder"
    }, context.type === "file" ? "seperator" : "", {
        name: "Open in Preview",
        hidden: context.type === "folder"
    }, {
        name: "Open in New Window",
        hidden: context.type === "folder"
    }, {
        name: "Open in Terminal",
        hidden: true
    }, "seperator", {
        name: "Cut"
    }, {
        name: "Copy"
    }, {
        name: "Paste",
        hidden: !clipboard || context.type === "file"
    }, "seperator", {
        name: "Copy Path"
    }, {
        name: "Copy Relative Path"
    }, "seperator", {
        name: "Rename"
    }, {
        name: "Delete"
    } ].filter((x => !!x && !x.hidden));
    showMenu()({
        x: e.clientX,
        y: e.clientY,
        list: listItems,
        parent: "TreeView",
        data: context
    });
    return false;
};

const listener$8 = (e, context) => {
    const {treeAdd: treeAdd, treeRename: treeRename, treeDelete: treeDelete, treeMove: treeMove} = context;
    const {which: which, parent: parent, data: data} = e.detail || {};
    if (parent !== "TreeView") {
        //console.log('TreeView ignored a context-select event');
        return;
    }
    // this should in a listener for 'addFile'
        if ([ "New File", "New Folder" ].includes(which)) {
        const parent = data.type === "file" ? data.parent.path : data.path;
        const typeToAdd = which === "New File" ? "file" : "folder";
        return treeAdd(typeToAdd, null, parent);
    }
    if (which === "Delete") return treeDelete(data.path);
    if (which === "Rename") return treeRename(data.path);
    if (which === "Cut") {
        clipboard = {
            operation: "cut",
            data: data
        };
    }
    if (which === "Copy") {
        clipboard = {
            operation: "copy",
            data: data
        };
    }
    if (which === "Paste") {
        const isMove = clipboard.operation === "cut";
        const target = data;
        const source = clipboard.data;
        clipboard = undefined;
        isMove ? console.log(`paste should be a move`) : console.log(`paste should be an add`);
        console.log({
            clipboard: clipboard,
            data: data
        });
        // TODO: should update tree, but...
        // really should trigger file and folder copy/move
                if (isMove) {
            treeMove(clipboard.data.type, source, target);
        } else {
            treeAdd(clipboard.data.type, source, target);
        }
    }
    if ([ "Copy Path", "Copy Relative Path" ].includes(which)) {
        const path = which.includes("Relative") ? data.path : new URL(`${currentServiceName}/${data.path}`, document.baseURI).href;
        navigator.clipboard.writeText(path).then((x => console.log(`Wrote path to clipboard: ${path}`))).catch((e => {
            console.error(`Error writing path to clipboard: ${path}`);
            console.error(e);
        }));
    }
    if (which === "Open in New Window") {
        const path = new URL(`${currentServiceName}/${data.path}`, document.baseURI).href;
        const shouldNotPreview = [ ".svg", ".less", ".scss", ".css", ".json", ".txt", ".mjs" ].find((x => path.includes(x)));
        // overrides shouldNotPreview
                const shouldPreview = [ ".jsx" ].find((x => path.includes(x)));
        const query = shouldNotPreview && !shouldPreview ? "" : "/::preview::/";
        window.open(path + query);
    }
    if (which === "Open in Preview") {
        const event = new CustomEvent("previewSelect", {
            bubbles: true,
            detail: data
        });
        document.body.dispatchEvent(event);
    }
};

const listener$7 = treeChange => event => {
    const {filePath: filePath} = event.detail;
    treeChange(filePath);
};

const getFilePath = getFilePath$1(getCurrentService);

const listener$6 = (e, context) => {
    const {type: type = ""} = e;
    const {treeSelect: treeSelect} = context.tree.api;
    if (e?.detail?.source === "Tree") return;
    const {name: name, parent: parent, path: path, next: next, nextPath: nextPath} = e.detail;
    if (type === "close" && !next) {
        return;
    }
    // const nameWithPathIfPresent = (_path, _name) => _path
    // 	? noFrontSlash(`${_path}/${_name}`)
    // 	: noFrontSlash(_name);
    // const fileNameWithPath = next
    // 	? nameWithPathIfPresent(nextPath, next)
    // 	: nameWithPathIfPresent(path, name);
        const fileNameWithPath = getFilePath({
        name: name,
        parent: parent,
        path: path,
        next: next,
        nextPath: nextPath
    });
    const filePath = fileNameWithPath;
    treeSelect(filePath, null, "noSelect");
    /* TODO: add this to TreeView module
	if (found.scrollIntoViewIfNeeded) {
		const opt_center = true;
		found.scrollIntoViewIfNeeded(opt_center);
	} else {
		found.scrollIntoView({
			behavior: "smooth",
			block: "center",
		});
	}
	*/};

const listener$5 = (e, context) => {
    listener$6({
        type: "close",
        ...e
    }, context);
};

const listener$4 = (e, context) => {
    let {name: name, next: next, collapse: collapse} = e.detail;
    if (collapse) {
        return;
    }
    let split;
    if ((name || next).includes("/")) {
        console.log(`tree path: ${name || next}`);
        console.error("should be opening all parent folders");
        split = (name || next).split("/").filter((x => !!x));
        //name = split[split.length-1];
        } else {
        split = [ name || next ];
    }
    // Array.from(
    // 	document.querySelectorAll('#tree-view .selected')||[]
    // )
    // 	.forEach(x => x.classList.remove('selected'));
        const leaves = Array.from(document.querySelectorAll("#tree-view .tree-leaf-content") || []);
    split.forEach(((spl, i) => {
        const found = leaves.find((x => x.innerText.includes(spl)));
        if (!found) {
            return;
        }
        if (i === split.length - 1) {
            tree.selected = spl;
            //found.classList.add('selected');
                }
        const expando = found.querySelector(".tree-expando");
        expando && expando.classList.remove("closed");
        expando && expando.classList.add("expanded", "open");
        const childLeaves = found.parentNode.querySelector(".tree-child-leaves");
        childLeaves && childLeaves.classList.remove("hidden");
    }));
};

var noServiceSelected = (event, context) => {
    const {tree: {showServiceChooser: showServiceChooser}} = context;
    showServiceChooser();
};

const listener$3 = (e, context) => {
    const {newTree: newTree} = context.tree;
    const {id: id, result: result, op: op} = e.detail;
    const {selected: selected, expanded: expanded = [], tree: tree} = getState();
    if (!id) {
        //console.log(`No ID for: ${e.type} - ${op}`);
        return;
    }
    //console.log(e.detail);
        if (e.type === "operationDone" && op === "update") {
        //TODO: maybe pay attention to what branches are expanded/selected?
        setState("selected", tree ? tree.selected : undefined);
        setState("expanded", (tree ? tree.expanded : undefined) || expanded);
        tree && tree.off();
        setState("tree", undefined);
    }
    if (result.length > 1) {
        return;
 // TODO: this is right???
        }
    /*
		when operationDone, probably means service has been loaded

		get newTree method from UpdateTree to create tree
			- requires tree state and service
			- those are safe to get here
	*/    setState("currentService", result[0]);
    newTree({
        service: result[0],
        treeState: result[0].treeState
    }, context);
};

const listener$2 = (event, context) => {
    const {searchProject: searchProject} = context.tree;
    searchProject({
        hideSearch: false
    }, context);
};

const listener$1 = (event, context) => {
    const {searchProject: searchProject} = context.tree;
    searchProject({
        hideSearch: true
    }, context);
};

const listener = (event, context) => {
    const {searchProject: searchProject} = context.tree;
    const {detail: detail = {}} = event;
    const {operation: operation} = detail;
    if (operation !== "searchProject") {
        return;
    }
    searchProject({
        showSearch: showSearch
    });
};

var mainListeners = formatHandlers("Tree", {
    contextMenu: contextMenuHandler,
    contextSelect: listener$8,
    fileChange: listener$7,
    fileClose: listener$5,
    fileSelect: listener$6,
    folderSelect: listener$4,
    noServiceSelected: noServiceSelected,
    operationDone: listener$3,
    showSearch: listener$2,
    showServiceCode: listener$1,
    ui: listener
});

/*

also see event handling in:
	tree/main/components/ProjectOpener.js
	tree/main/components/TreeMenu.js

*/ const trigger = {
    data: (event, context) => {
        console.log(event);
        return event;
    }
};

var mainTriggers = {
    operations: trigger
};

// import tabsListeners from './tabs/listeners/index.js';
// import tabsTriggers from './tabs/triggers/index.js';
// import statusListeners from './status/listeners/index.js';
// //import statusTriggers from './status/triggers/index.js';
const listeners = [ {
    // 	eventName: "service-switch-notify",
    // 	handlers: [ mainListeners.serviceSwitch ]
    // }, {
    // 	eventName: "cursorActivity",
    // 	handlers: [ statusListeners.cursorActivity ]
    // }, {
    eventName: "operationDone",
    handlers: [ mainListeners.operationDone ]
}, {
    // 	eventName: "operations",
    // 	handlers: [ tabsListeners.operationDone ]
    // }, {
    // 	eventName: "open-settings-view",
    // 	handlers: [ mainListeners.systemDocs, tabsListeners.fileSelect ]
    // }, {
    // 	eventName: "add-service-folder",
    // 	handlers: [ mainListeners.systemDocs, tabsListeners.fileSelect ]
    // }, {
    // 	eventName: "open-previous-service",
    // 	handlers: [ mainListeners.systemDocs, tabsListeners.fileSelect ]
    // }, {
    // 	eventName: "connect-service-provider",
    // 	handlers: [ mainListeners.systemDocs, tabsListeners.fileSelect ]
    // }, {
    // 	eventName: "noServiceSelected",
    // 	handlers: [ mainListeners.nothingOpen ]
    // }, {
    eventName: "fileSelect",
    handlers: [ mainListeners.fileSelect ]
} ];

// const triggers = {
// 	Editor: [{
// 			eventName: "ui",
// 			type: "raw",
// 		}, {
// 			eventName: "fileClose",
// 			type: 'raw',
// 		}, {
// 			eventName: "fileSelect",
// 			type: 'raw',
// 		}, {
// 			eventName: "contextMenuShow",
// 			type: 'raw',
// 		}, {
// 			eventName: "fileChange",
// 			type: 'raw',
// 			handlers: [ mainTriggers.fileChange ]
// 		}, {
// 			eventName: "cursorActivity",
// 			type: 'raw',
// 			handlers: [ mainTriggers.cursorActivity ]
// 		}, {
// 			eventName: "provider-test",
// 			type: 'click',
// 			handlers: [ mainTriggers.provider.test ]
// 		}, {
// 			eventName: "provider-save",
// 			type: 'click',
// 			handlers: [ mainTriggers.provider.save ]
// 		}, {
// 			eventName: "provider-add-service",
// 			type: 'click',
// 			handlers: [ mainTriggers.provider.addService ]
// 		}], 
// 	Tabs: [{
// 			eventName: "ui",
// 			type: "raw",
// 		}, {
// 			eventName: "fileClose",
// 			type: 'raw',
// 		}, {
// 			name: "closeOthers",
// 			eventName: "fileClose",
// 			type: 'raw',
// 			handlers: [ tabsTriggers.closeMultiple.others ]
// 		}, {
// 			name: "closeAll",
// 			eventName: "fileClose",
// 			type: 'raw',
// 			handlers: [ tabsTriggers.closeMultiple.all ]
// 		}, {
// 			eventName: "fileSelect",
// 			type: 'raw',
// 		}, {
// 			eventName: "contextMenuShow",
// 			type: 'raw',
// 		}, {
// 			name: "addFileUntracked",
// 			eventName: "operations",
// 			type: 'raw',
// 			data: {
// 				operation: "addFile",
// 				untracked: true,
// 			},
// 		}],
// 	Status: [{
// 			eventName: "ui",
// 			type: "raw",
// 		}, {
// 			eventName: "fileClose",
// 			type: 'raw',
// 		}, {
// 			eventName: "fileSelect",
// 			type: 'raw',
// 		}],
// };
// export default { listeners, triggers };
const triggers$1 = {
    Tree: [ {
        eventName: "operations",
        type: "raw",
        handlers: [ mainTriggers.operations ]
    }, {
        eventName: "fileSelect",
        type: "raw"
    } ]
};

var events = {
    listeners: listeners,
    triggers: triggers$1
};

//import indexCSS from '../index.css';
document.adoptedStyleSheets = [ ...document.adoptedStyleSheets, sheet ];

attachEvents(events, {
    tree: TreeView$1
});

devHelper.module();