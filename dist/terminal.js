/*!
	fiug terminal component
	Version 0.4.6 ( 2021-12-05T08:03:46.052Z )
	https://github.com/fiugd/fiug/terminal
	(c) 2020-2021 Harrison Cross, MIT License
*/
const triggerTop = event => (type, name) => {
    const triggerEvent = {
        type: type,
        detail: {
            operation: name
        }
    };
    window.top.postMessage({
        triggerEvent: triggerEvent
    }, location);
    event.preventDefault();
    return false;
};

const events = [ [ e => e.shiftKey && e.altKey && e.key === "ArrowLeft", "ui", "prevDocument" ], [ e => e.shiftKey && e.altKey && e.key === "ArrowRight", "ui", "nextDocument" ], [ e => (e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "f", "ui", "searchProject" ], [ e => (e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "p", "ui", "commandPalette" ], [ e => (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p", "ui", "searchPalette" ], [ e => (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s", "operations", "update" ], [ 
// this will only work with electron
e => e.ctrlKey && e.which === 9, "nextTab" ] ];

const useCapture = true;

document.addEventListener("keydown", (function(event) {
    const [_, ...found] = events.find((([check]) => check(event))) || [];
    if (found.length) return triggerTop(event)(...found);
    return true;
}), useCapture);

const target = window.top;

const queue$3 = {};

const kvArrayToObject = ([key, value]) => ({
    key: key,
    value: value
});

const list$1 = () => Object.entries(queue$3).map(kvArrayToObject);

window.onmessage = function(e) {
    const {key: key, unregister: unregister} = e.data;
    if (!queue$3[key]) return;
    if (unregister) queue$3[key].listener = undefined;
    if (!queue$3[key].resolve && queue$3[key].listener) {
        queue$3[key].listener(e.data);
        return;
    }
    queue$3[key].resolve(e.data);
    if (queue$3[key].listener) {
        delete queue$3[key].resolve;
    } else {
        delete queue$3[key];
    }
};

const randomKey = () => Array.from({
    length: 32
}, (() => Math.random().toString(36)[2])).join("");

const execute = data => {
    const key = randomKey();
    const handler = resolve => {
        queue$3[key] = {
            resolve: resolve
        };
        target.postMessage({
            ...data,
            key: key
        }, "*");
    };
    return new Promise(handler);
};

const attach = ({name: name, eventName: eventName, listener: listener}) => {
    const key = randomKey();
    const register = "listener";
    const data = {
        register: register,
        name: name,
        eventName: eventName
    };
    const handler = resolve => {
        queue$3[key] = {
            resolve: resolve,
            listener: listener
        };
        target.postMessage({
            ...data,
            key: key
        }, "*");
    };
    return new Promise(handler);
};

const detach = key => {
    const unregister = "listener";
    const data = {
        unregister: unregister,
        key: key
    };
    const handler = resolve => {
        queue$3[key] = {
            resolve: resolve
        };
        target.postMessage({
            ...data,
            key: key
        }, "*");
    };
    return new Promise(handler);
};

/*
const execTrigger = attachTrigger({
	name: "Terminal",
	eventName: "operations",
	type: "raw",
});
	execTrigger({
		detail: {
			operation: op,
			listener: commandQueueId,
			filename,
			newName,
			body,
		},
	});
*/ var comm = {
    attach: attach,
    detach: detach,
    execute: execute,
    list: list$1
};

function defaultSetTimout$2() {
    throw new Error("setTimeout has not been defined");
}

function defaultClearTimeout$2() {
    throw new Error("clearTimeout has not been defined");
}

var cachedSetTimeout$2 = defaultSetTimout$2;

var cachedClearTimeout$2 = defaultClearTimeout$2;

var globalContext$2;

if (typeof window !== "undefined") {
    globalContext$2 = window;
} else if (typeof self !== "undefined") {
    globalContext$2 = self;
} else {
    globalContext$2 = {};
}

if (typeof globalContext$2.setTimeout === "function") {
    cachedSetTimeout$2 = setTimeout;
}

if (typeof globalContext$2.clearTimeout === "function") {
    cachedClearTimeout$2 = clearTimeout;
}

function runTimeout$2(fun) {
    if (cachedSetTimeout$2 === setTimeout) {
        return setTimeout(fun, 0);
    }
    if ((cachedSetTimeout$2 === defaultSetTimout$2 || !cachedSetTimeout$2) && setTimeout) {
        cachedSetTimeout$2 = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        return cachedSetTimeout$2(fun, 0);
    } catch (e) {
        try {
            return cachedSetTimeout$2.call(null, fun, 0);
        } catch (e2) {
            return cachedSetTimeout$2.call(this, fun, 0);
        }
    }
}

function runClearTimeout$2(marker) {
    if (cachedClearTimeout$2 === clearTimeout) {
        return clearTimeout(marker);
    }
    if ((cachedClearTimeout$2 === defaultClearTimeout$2 || !cachedClearTimeout$2) && clearTimeout) {
        cachedClearTimeout$2 = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        return cachedClearTimeout$2(marker);
    } catch (e) {
        try {
            return cachedClearTimeout$2.call(null, marker);
        } catch (e2) {
            return cachedClearTimeout$2.call(this, marker);
        }
    }
}

var queue$2 = [];

var draining$2 = false;

var currentQueue$2;

var queueIndex$2 = -1;

function cleanUpNextTick$2() {
    if (!draining$2 || !currentQueue$2) {
        return;
    }
    draining$2 = false;
    if (currentQueue$2.length) {
        queue$2 = currentQueue$2.concat(queue$2);
    } else {
        queueIndex$2 = -1;
    }
    if (queue$2.length) {
        drainQueue$2();
    }
}

function drainQueue$2() {
    if (draining$2) {
        return;
    }
    var timeout = runTimeout$2(cleanUpNextTick$2);
    draining$2 = true;
    var len = queue$2.length;
    while (len) {
        currentQueue$2 = queue$2;
        queue$2 = [];
        while (++queueIndex$2 < len) {
            if (currentQueue$2) {
                currentQueue$2[queueIndex$2].run();
            }
        }
        queueIndex$2 = -1;
        len = queue$2.length;
    }
    currentQueue$2 = null;
    draining$2 = false;
    runClearTimeout$2(timeout);
}

function nextTick$2(fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue$2.push(new Item$2(fun, args));
    if (queue$2.length === 1 && !draining$2) {
        runTimeout$2(drainQueue$2);
    }
}

function Item$2(fun, array) {
    this.fun = fun;
    this.array = array;
}

Item$2.prototype.run = function() {
    this.fun.apply(null, this.array);
};

var title$2 = "browser";

var platform$2 = "browser";

var browser$3 = true;

var argv$2 = [];

var version$2 = "";

var versions$2 = {};

var release$2 = {};

var config$3 = {};

function noop$2() {}

var on$2 = noop$2;

var addListener$2 = noop$2;

var once$2 = noop$2;

var off$2 = noop$2;

var removeListener$2 = noop$2;

var removeAllListeners$2 = noop$2;

var emit$2 = noop$2;

function binding$2(name) {
    throw new Error("process.binding is not supported");
}

function cwd$2() {
    return "/";
}

function chdir$2(dir) {
    throw new Error("process.chdir is not supported");
}

function umask$2() {
    return 0;
}

var performance$3 = globalContext$2.performance || {};

var performanceNow$2 = performance$3.now || performance$3.mozNow || performance$3.msNow || performance$3.oNow || performance$3.webkitNow || function() {
    return (new Date).getTime();
};

function hrtime$2(previousTimestamp) {
    var clocktime = performanceNow$2.call(performance$3) * .001;
    var seconds = Math.floor(clocktime);
    var nanoseconds = Math.floor(clocktime % 1 * 1e9);
    if (previousTimestamp) {
        seconds = seconds - previousTimestamp[0];
        nanoseconds = nanoseconds - previousTimestamp[1];
        if (nanoseconds < 0) {
            seconds--;
            nanoseconds += 1e9;
        }
    }
    return [ seconds, nanoseconds ];
}

var startTime$2 = new Date;

function uptime$2() {
    var currentTime = new Date;
    var dif = currentTime - startTime$2;
    return dif / 1e3;
}

var process$2 = {
    nextTick: nextTick$2,
    title: title$2,
    browser: browser$3,
    env: {
        NODE_ENV: "production"
    },
    argv: argv$2,
    version: version$2,
    versions: versions$2,
    on: on$2,
    addListener: addListener$2,
    once: once$2,
    off: off$2,
    removeListener: removeListener$2,
    removeAllListeners: removeAllListeners$2,
    emit: emit$2,
    binding: binding$2,
    cwd: cwd$2,
    chdir: chdir$2,
    umask: umask$2,
    hrtime: hrtime$2,
    platform: platform$2,
    release: release$2,
    config: config$3,
    uptime: uptime$2
};

const {hasOwnProperty: hasOwnProperty$1} = Object.prototype;

const eol = typeof process$2 !== "undefined" && process$2.platform === "win32" ? "\r\n" : "\n";

const encode = (obj, opt) => {
    const children = [];
    let out = "";
    if (typeof opt === "string") {
        opt = {
            section: opt,
            whitespace: false
        };
    } else {
        opt = opt || Object.create(null);
        opt.whitespace = opt.whitespace === true;
    }
    const separator = opt.whitespace ? " = " : "=";
    for (const k of Object.keys(obj)) {
        const val = obj[k];
        if (val && Array.isArray(val)) {
            for (const item of val) out += safe(k + "[]") + separator + safe(item) + "\n";
        } else if (val && typeof val === "object") children.push(k); else out += safe(k) + separator + safe(val) + eol;
    }
    if (opt.section && out.length) out = "[" + safe(opt.section) + "]" + eol + out;
    for (const k of children) {
        const nk = dotSplit(k).join("\\.");
        const section = (opt.section ? opt.section + "." : "") + nk;
        const {whitespace: whitespace} = opt;
        const child = encode(obj[k], {
            section: section,
            whitespace: whitespace
        });
        if (out.length && child.length) out += eol;
        out += child;
    }
    return out;
};

const dotSplit = str => str.replace(/\1/g, "LITERAL\\1LITERAL").replace(/\\\./g, "").split(/\./).map((part => part.replace(/\1/g, "\\.").replace(/\2LITERAL\\1LITERAL\2/g, "")));

const decode = str => {
    const out = Object.create(null);
    let p = out;
    let section = null;
    const re = /^\[([^\]]*)\]$|^([^=]+)(=(.*))?$/i;
    const lines = str.split(/[\r\n]+/g);
    for (const line of lines) {
        if (!line || line.match(/^\s*[;#]/)) continue;
        const match = line.match(re);
        if (!match) continue;
        if (match[1] !== void 0) {
            section = unsafe(match[1]);
            if (section === "__proto__") {
                p = Object.create(null);
                continue;
            }
            p = out[section] = out[section] || Object.create(null);
            continue;
        }
        const keyRaw = unsafe(match[2]);
        const isArray = keyRaw.length > 2 && keyRaw.slice(-2) === "[]";
        const key = isArray ? keyRaw.slice(0, -2) : keyRaw;
        if (key === "__proto__") continue;
        const valueRaw = match[3] ? unsafe(match[4]) : true;
        const value = valueRaw === "true" || valueRaw === "false" || valueRaw === "null" ? JSON.parse(valueRaw) : valueRaw;
        if (isArray) {
            if (!hasOwnProperty$1.call(p, key)) p[key] = []; else if (!Array.isArray(p[key])) p[key] = [ p[key] ];
        }
        if (Array.isArray(p[key])) p[key].push(value); else p[key] = value;
    }
    const remove = [];
    for (const k of Object.keys(out)) {
        if (!hasOwnProperty$1.call(out, k) || typeof out[k] !== "object" || Array.isArray(out[k])) continue;
        const parts = dotSplit(k);
        let p2 = out;
        const l = parts.pop();
        const nl = l.replace(/\\\./g, ".");
        for (const part of parts) {
            if (part === "__proto__") continue;
            if (!hasOwnProperty$1.call(p2, part) || typeof p2[part] !== "object") p2[part] = Object.create(null);
            p2 = p2[part];
        }
        if (p2 === out && nl === l) continue;
        p2[nl] = out[k];
        remove.push(k);
    }
    for (const del of remove) delete out[del];
    return out;
};

const isQuoted = val => val.charAt(0) === '"' && val.slice(-1) === '"' || val.charAt(0) === "'" && val.slice(-1) === "'";

const safe = val => typeof val !== "string" || val.match(/[=\r\n]/) || val.match(/^\[/) || val.length > 1 && isQuoted(val) || val !== val.trim() ? JSON.stringify(val) : val.replace(/;/g, "\\;").replace(/#/g, "\\#");

const unsafe = (val, doUnesc) => {
    val = (val || "").trim();
    if (isQuoted(val)) {
        if (val.charAt(0) === "'") val = val.substr(1, val.length - 2);
        try {
            val = JSON.parse(val);
        } catch (_) {}
    } else {
        let esc = false;
        let unesc = "";
        for (let i = 0, l = val.length; i < l; i++) {
            const c = val.charAt(i);
            if (esc) {
                if ("\\;#".indexOf(c) !== -1) unesc += c; else unesc += "\\" + c;
                esc = false;
            } else if (";#".indexOf(c) !== -1) break; else if (c === "\\") esc = true; else unesc += c;
        }
        if (esc) unesc += "\\";
        return unesc.trim();
    }
    return val;
};

var ini = {
    parse: decode,
    decode: decode,
    stringify: encode,
    encode: encode,
    safe: safe,
    unsafe: unsafe
};

var commonjsGlobal$2 = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};

function getDefaultExportFromCjs(x) {
    return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}

function createCommonjsModule$4(fn, basedir, module) {
    return module = {
        path: basedir,
        exports: {},
        require: function(path, base) {
            return commonjsRequire$4(path, base === void 0 || base === null ? module.path : base);
        }
    }, fn(module, module.exports), module.exports;
}

function commonjsRequire$4() {
    throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs");
}

var diff$1 = createCommonjsModule$4((function(module, exports) {
    /*!
  
   diff v3.5.0
  
  Software License Agreement (BSD License)
  
  Copyright (c) 2009-2015, Kevin Decker <kpdecker@gmail.com>
  
  All rights reserved.
  
  Redistribution and use of this software in source and binary forms, with or without modification,
  are permitted provided that the following conditions are met:
  
  * Redistributions of source code must retain the above
    copyright notice, this list of conditions and the
    following disclaimer.
  
  * Redistributions in binary form must reproduce the above
    copyright notice, this list of conditions and the
    following disclaimer in the documentation and/or other
    materials provided with the distribution.
  
  * Neither the name of Kevin Decker nor the names of its
    contributors may be used to endorse or promote products
    derived from this software without specific prior
    written permission.
  
  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR
  IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
  FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
  CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
  DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
  IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT
  OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
  @license
  */
    (function webpackUniversalModuleDefinition(root, factory) {
        module.exports = factory();
    })(commonjsGlobal$2, (function() {
        return function(modules) {
            var installedModules = {};
            function __webpack_require__(moduleId) {
                if (installedModules[moduleId]) return installedModules[moduleId].exports;
                var module2 = installedModules[moduleId] = {
                    exports: {},
                    id: moduleId,
                    loaded: false
                };
                modules[moduleId].call(module2.exports, module2, module2.exports, __webpack_require__);
                module2.loaded = true;
                return module2.exports;
            }
            __webpack_require__.m = modules;
            __webpack_require__.c = installedModules;
            __webpack_require__.p = "";
            return __webpack_require__(0);
        }([ function(module2, exports2, __webpack_require__) {
            exports2.__esModule = true;
            exports2.canonicalize = exports2.convertChangesToXML = exports2.convertChangesToDMP = exports2.merge = exports2.parsePatch = exports2.applyPatches = exports2.applyPatch = exports2.createPatch = exports2.createTwoFilesPatch = exports2.structuredPatch = exports2.diffArrays = exports2.diffJson = exports2.diffCss = exports2.diffSentences = exports2.diffTrimmedLines = exports2.diffLines = exports2.diffWordsWithSpace = exports2.diffWords = exports2.diffChars = exports2.Diff = void 0;
            var _base = __webpack_require__(1);
            var _base2 = _interopRequireDefault(_base);
            var _character = __webpack_require__(2);
            var _word = __webpack_require__(3);
            var _line = __webpack_require__(5);
            var _sentence = __webpack_require__(6);
            var _css = __webpack_require__(7);
            var _json = __webpack_require__(8);
            var _array = __webpack_require__(9);
            var _apply = __webpack_require__(10);
            var _parse = __webpack_require__(11);
            var _merge = __webpack_require__(13);
            var _create = __webpack_require__(14);
            var _dmp = __webpack_require__(16);
            var _xml = __webpack_require__(17);
            function _interopRequireDefault(obj) {
                return obj && obj.__esModule ? obj : {
                    default: obj
                };
            }
            exports2.Diff = _base2["default"];
            exports2.diffChars = _character.diffChars;
            exports2.diffWords = _word.diffWords;
            exports2.diffWordsWithSpace = _word.diffWordsWithSpace;
            exports2.diffLines = _line.diffLines;
            exports2.diffTrimmedLines = _line.diffTrimmedLines;
            exports2.diffSentences = _sentence.diffSentences;
            exports2.diffCss = _css.diffCss;
            exports2.diffJson = _json.diffJson;
            exports2.diffArrays = _array.diffArrays;
            exports2.structuredPatch = _create.structuredPatch;
            exports2.createTwoFilesPatch = _create.createTwoFilesPatch;
            exports2.createPatch = _create.createPatch;
            exports2.applyPatch = _apply.applyPatch;
            exports2.applyPatches = _apply.applyPatches;
            exports2.parsePatch = _parse.parsePatch;
            exports2.merge = _merge.merge;
            exports2.convertChangesToDMP = _dmp.convertChangesToDMP;
            exports2.convertChangesToXML = _xml.convertChangesToXML;
            exports2.canonicalize = _json.canonicalize;
        }, function(module2, exports2) {
            exports2.__esModule = true;
            exports2["default"] = Diff2;
            function Diff2() {}
            Diff2.prototype = {
                diff: function diff2(oldString, newString) {
                    var options = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
                    var callback = options.callback;
                    if (typeof options === "function") {
                        callback = options;
                        options = {};
                    }
                    this.options = options;
                    var self2 = this;
                    function done(value) {
                        if (callback) {
                            setTimeout((function() {
                                callback(void 0, value);
                            }), 0);
                            return true;
                        } else {
                            return value;
                        }
                    }
                    oldString = this.castInput(oldString);
                    newString = this.castInput(newString);
                    oldString = this.removeEmpty(this.tokenize(oldString));
                    newString = this.removeEmpty(this.tokenize(newString));
                    var newLen = newString.length, oldLen = oldString.length;
                    var editLength = 1;
                    var maxEditLength = newLen + oldLen;
                    var bestPath = [ {
                        newPos: -1,
                        components: []
                    } ];
                    var oldPos = this.extractCommon(bestPath[0], newString, oldString, 0);
                    if (bestPath[0].newPos + 1 >= newLen && oldPos + 1 >= oldLen) {
                        return done([ {
                            value: this.join(newString),
                            count: newString.length
                        } ]);
                    }
                    function execEditLength() {
                        for (var diagonalPath = -1 * editLength; diagonalPath <= editLength; diagonalPath += 2) {
                            var basePath = void 0;
                            var addPath = bestPath[diagonalPath - 1], removePath = bestPath[diagonalPath + 1], _oldPos = (removePath ? removePath.newPos : 0) - diagonalPath;
                            if (addPath) {
                                bestPath[diagonalPath - 1] = void 0;
                            }
                            var canAdd = addPath && addPath.newPos + 1 < newLen, canRemove = removePath && 0 <= _oldPos && _oldPos < oldLen;
                            if (!canAdd && !canRemove) {
                                bestPath[diagonalPath] = void 0;
                                continue;
                            }
                            if (!canAdd || canRemove && addPath.newPos < removePath.newPos) {
                                basePath = clonePath(removePath);
                                self2.pushComponent(basePath.components, void 0, true);
                            } else {
                                basePath = addPath;
                                basePath.newPos++;
                                self2.pushComponent(basePath.components, true, void 0);
                            }
                            _oldPos = self2.extractCommon(basePath, newString, oldString, diagonalPath);
                            if (basePath.newPos + 1 >= newLen && _oldPos + 1 >= oldLen) {
                                return done(buildValues(self2, basePath.components, newString, oldString, self2.useLongestToken));
                            } else {
                                bestPath[diagonalPath] = basePath;
                            }
                        }
                        editLength++;
                    }
                    if (callback) {
                        (function exec() {
                            setTimeout((function() {
                                if (editLength > maxEditLength) {
                                    return callback();
                                }
                                if (!execEditLength()) {
                                    exec();
                                }
                            }), 0);
                        })();
                    } else {
                        while (editLength <= maxEditLength) {
                            var ret = execEditLength();
                            if (ret) {
                                return ret;
                            }
                        }
                    }
                },
                pushComponent: function pushComponent(components, added, removed) {
                    var last = components[components.length - 1];
                    if (last && last.added === added && last.removed === removed) {
                        components[components.length - 1] = {
                            count: last.count + 1,
                            added: added,
                            removed: removed
                        };
                    } else {
                        components.push({
                            count: 1,
                            added: added,
                            removed: removed
                        });
                    }
                },
                extractCommon: function extractCommon(basePath, newString, oldString, diagonalPath) {
                    var newLen = newString.length, oldLen = oldString.length, newPos = basePath.newPos, oldPos = newPos - diagonalPath, commonCount = 0;
                    while (newPos + 1 < newLen && oldPos + 1 < oldLen && this.equals(newString[newPos + 1], oldString[oldPos + 1])) {
                        newPos++;
                        oldPos++;
                        commonCount++;
                    }
                    if (commonCount) {
                        basePath.components.push({
                            count: commonCount
                        });
                    }
                    basePath.newPos = newPos;
                    return oldPos;
                },
                equals: function equals(left, right) {
                    if (this.options.comparator) {
                        return this.options.comparator(left, right);
                    } else {
                        return left === right || this.options.ignoreCase && left.toLowerCase() === right.toLowerCase();
                    }
                },
                removeEmpty: function removeEmpty(array) {
                    var ret = [];
                    for (var i = 0; i < array.length; i++) {
                        if (array[i]) {
                            ret.push(array[i]);
                        }
                    }
                    return ret;
                },
                castInput: function castInput(value) {
                    return value;
                },
                tokenize: function tokenize(value) {
                    return value.split("");
                },
                join: function join(chars) {
                    return chars.join("");
                }
            };
            function buildValues(diff2, components, newString, oldString, useLongestToken) {
                var componentPos = 0, componentLen = components.length, newPos = 0, oldPos = 0;
                for (;componentPos < componentLen; componentPos++) {
                    var component = components[componentPos];
                    if (!component.removed) {
                        if (!component.added && useLongestToken) {
                            var value = newString.slice(newPos, newPos + component.count);
                            value = value.map((function(value2, i) {
                                var oldValue = oldString[oldPos + i];
                                return oldValue.length > value2.length ? oldValue : value2;
                            }));
                            component.value = diff2.join(value);
                        } else {
                            component.value = diff2.join(newString.slice(newPos, newPos + component.count));
                        }
                        newPos += component.count;
                        if (!component.added) {
                            oldPos += component.count;
                        }
                    } else {
                        component.value = diff2.join(oldString.slice(oldPos, oldPos + component.count));
                        oldPos += component.count;
                        if (componentPos && components[componentPos - 1].added) {
                            var tmp = components[componentPos - 1];
                            components[componentPos - 1] = components[componentPos];
                            components[componentPos] = tmp;
                        }
                    }
                }
                var lastComponent = components[componentLen - 1];
                if (componentLen > 1 && typeof lastComponent.value === "string" && (lastComponent.added || lastComponent.removed) && diff2.equals("", lastComponent.value)) {
                    components[componentLen - 2].value += lastComponent.value;
                    components.pop();
                }
                return components;
            }
            function clonePath(path) {
                return {
                    newPos: path.newPos,
                    components: path.components.slice(0)
                };
            }
        }, function(module2, exports2, __webpack_require__) {
            exports2.__esModule = true;
            exports2.characterDiff = void 0;
            exports2.diffChars = diffChars2;
            var _base = __webpack_require__(1);
            var _base2 = _interopRequireDefault(_base);
            function _interopRequireDefault(obj) {
                return obj && obj.__esModule ? obj : {
                    default: obj
                };
            }
            var characterDiff2 = exports2.characterDiff = new _base2["default"];
            function diffChars2(oldStr, newStr, options) {
                return characterDiff2.diff(oldStr, newStr, options);
            }
        }, function(module2, exports2, __webpack_require__) {
            exports2.__esModule = true;
            exports2.wordDiff = void 0;
            exports2.diffWords = diffWords2;
            exports2.diffWordsWithSpace = diffWordsWithSpace2;
            var _base = __webpack_require__(1);
            var _base2 = _interopRequireDefault(_base);
            var _params = __webpack_require__(4);
            function _interopRequireDefault(obj) {
                return obj && obj.__esModule ? obj : {
                    default: obj
                };
            }
            var extendedWordChars = /^[A-Za-z\xC0-\u02C6\u02C8-\u02D7\u02DE-\u02FF\u1E00-\u1EFF]+$/;
            var reWhitespace = /\S/;
            var wordDiff2 = exports2.wordDiff = new _base2["default"];
            wordDiff2.equals = function(left, right) {
                if (this.options.ignoreCase) {
                    left = left.toLowerCase();
                    right = right.toLowerCase();
                }
                return left === right || this.options.ignoreWhitespace && !reWhitespace.test(left) && !reWhitespace.test(right);
            };
            wordDiff2.tokenize = function(value) {
                var tokens = value.split(/(\s+|\b)/);
                for (var i = 0; i < tokens.length - 1; i++) {
                    if (!tokens[i + 1] && tokens[i + 2] && extendedWordChars.test(tokens[i]) && extendedWordChars.test(tokens[i + 2])) {
                        tokens[i] += tokens[i + 2];
                        tokens.splice(i + 1, 2);
                        i--;
                    }
                }
                return tokens;
            };
            function diffWords2(oldStr, newStr, options) {
                options = (0, _params.generateOptions)(options, {
                    ignoreWhitespace: true
                });
                return wordDiff2.diff(oldStr, newStr, options);
            }
            function diffWordsWithSpace2(oldStr, newStr, options) {
                return wordDiff2.diff(oldStr, newStr, options);
            }
        }, function(module2, exports2) {
            exports2.__esModule = true;
            exports2.generateOptions = generateOptions2;
            function generateOptions2(options, defaults) {
                if (typeof options === "function") {
                    defaults.callback = options;
                } else if (options) {
                    for (var name in options) {
                        if (options.hasOwnProperty(name)) {
                            defaults[name] = options[name];
                        }
                    }
                }
                return defaults;
            }
        }, function(module2, exports2, __webpack_require__) {
            exports2.__esModule = true;
            exports2.lineDiff = void 0;
            exports2.diffLines = diffLines2;
            exports2.diffTrimmedLines = diffTrimmedLines2;
            var _base = __webpack_require__(1);
            var _base2 = _interopRequireDefault(_base);
            var _params = __webpack_require__(4);
            function _interopRequireDefault(obj) {
                return obj && obj.__esModule ? obj : {
                    default: obj
                };
            }
            var lineDiff2 = exports2.lineDiff = new _base2["default"];
            lineDiff2.tokenize = function(value) {
                var retLines = [], linesAndNewlines = value.split(/(\n|\r\n)/);
                if (!linesAndNewlines[linesAndNewlines.length - 1]) {
                    linesAndNewlines.pop();
                }
                for (var i = 0; i < linesAndNewlines.length; i++) {
                    var line = linesAndNewlines[i];
                    if (i % 2 && !this.options.newlineIsToken) {
                        retLines[retLines.length - 1] += line;
                    } else {
                        if (this.options.ignoreWhitespace) {
                            line = line.trim();
                        }
                        retLines.push(line);
                    }
                }
                return retLines;
            };
            function diffLines2(oldStr, newStr, callback) {
                return lineDiff2.diff(oldStr, newStr, callback);
            }
            function diffTrimmedLines2(oldStr, newStr, callback) {
                var options = (0, _params.generateOptions)(callback, {
                    ignoreWhitespace: true
                });
                return lineDiff2.diff(oldStr, newStr, options);
            }
        }, function(module2, exports2, __webpack_require__) {
            exports2.__esModule = true;
            exports2.sentenceDiff = void 0;
            exports2.diffSentences = diffSentences2;
            var _base = __webpack_require__(1);
            var _base2 = _interopRequireDefault(_base);
            function _interopRequireDefault(obj) {
                return obj && obj.__esModule ? obj : {
                    default: obj
                };
            }
            var sentenceDiff2 = exports2.sentenceDiff = new _base2["default"];
            sentenceDiff2.tokenize = function(value) {
                return value.split(/(\S.+?[.!?])(?=\s+|$)/);
            };
            function diffSentences2(oldStr, newStr, callback) {
                return sentenceDiff2.diff(oldStr, newStr, callback);
            }
        }, function(module2, exports2, __webpack_require__) {
            exports2.__esModule = true;
            exports2.cssDiff = void 0;
            exports2.diffCss = diffCss2;
            var _base = __webpack_require__(1);
            var _base2 = _interopRequireDefault(_base);
            function _interopRequireDefault(obj) {
                return obj && obj.__esModule ? obj : {
                    default: obj
                };
            }
            var cssDiff2 = exports2.cssDiff = new _base2["default"];
            cssDiff2.tokenize = function(value) {
                return value.split(/([{}:;,]|\s+)/);
            };
            function diffCss2(oldStr, newStr, callback) {
                return cssDiff2.diff(oldStr, newStr, callback);
            }
        }, function(module2, exports2, __webpack_require__) {
            exports2.__esModule = true;
            exports2.jsonDiff = void 0;
            var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function(obj) {
                return typeof obj;
            } : function(obj) {
                return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
            };
            exports2.diffJson = diffJson2;
            exports2.canonicalize = canonicalize2;
            var _base = __webpack_require__(1);
            var _base2 = _interopRequireDefault(_base);
            var _line = __webpack_require__(5);
            function _interopRequireDefault(obj) {
                return obj && obj.__esModule ? obj : {
                    default: obj
                };
            }
            var objectPrototypeToString = Object.prototype.toString;
            var jsonDiff2 = exports2.jsonDiff = new _base2["default"];
            jsonDiff2.useLongestToken = true;
            jsonDiff2.tokenize = _line.lineDiff.tokenize;
            jsonDiff2.castInput = function(value) {
                var _options = this.options, undefinedReplacement = _options.undefinedReplacement, _options$stringifyRep = _options.stringifyReplacer, stringifyReplacer = _options$stringifyRep === void 0 ? function(k, v) {
                    return typeof v === "undefined" ? undefinedReplacement : v;
                } : _options$stringifyRep;
                return typeof value === "string" ? value : JSON.stringify(canonicalize2(value, null, null, stringifyReplacer), stringifyReplacer, "  ");
            };
            jsonDiff2.equals = function(left, right) {
                return _base2["default"].prototype.equals.call(jsonDiff2, left.replace(/,([\r\n])/g, "$1"), right.replace(/,([\r\n])/g, "$1"));
            };
            function diffJson2(oldObj, newObj, options) {
                return jsonDiff2.diff(oldObj, newObj, options);
            }
            function canonicalize2(obj, stack, replacementStack, replacer, key) {
                stack = stack || [];
                replacementStack = replacementStack || [];
                if (replacer) {
                    obj = replacer(key, obj);
                }
                var i = void 0;
                for (i = 0; i < stack.length; i += 1) {
                    if (stack[i] === obj) {
                        return replacementStack[i];
                    }
                }
                var canonicalizedObj = void 0;
                if (objectPrototypeToString.call(obj) === "[object Array]") {
                    stack.push(obj);
                    canonicalizedObj = new Array(obj.length);
                    replacementStack.push(canonicalizedObj);
                    for (i = 0; i < obj.length; i += 1) {
                        canonicalizedObj[i] = canonicalize2(obj[i], stack, replacementStack, replacer, key);
                    }
                    stack.pop();
                    replacementStack.pop();
                    return canonicalizedObj;
                }
                if (obj && obj.toJSON) {
                    obj = obj.toJSON();
                }
                if ((typeof obj === "undefined" ? "undefined" : _typeof(obj)) === "object" && obj !== null) {
                    stack.push(obj);
                    canonicalizedObj = {};
                    replacementStack.push(canonicalizedObj);
                    var sortedKeys = [], _key = void 0;
                    for (_key in obj) {
                        if (obj.hasOwnProperty(_key)) {
                            sortedKeys.push(_key);
                        }
                    }
                    sortedKeys.sort();
                    for (i = 0; i < sortedKeys.length; i += 1) {
                        _key = sortedKeys[i];
                        canonicalizedObj[_key] = canonicalize2(obj[_key], stack, replacementStack, replacer, _key);
                    }
                    stack.pop();
                    replacementStack.pop();
                } else {
                    canonicalizedObj = obj;
                }
                return canonicalizedObj;
            }
        }, function(module2, exports2, __webpack_require__) {
            exports2.__esModule = true;
            exports2.arrayDiff = void 0;
            exports2.diffArrays = diffArrays2;
            var _base = __webpack_require__(1);
            var _base2 = _interopRequireDefault(_base);
            function _interopRequireDefault(obj) {
                return obj && obj.__esModule ? obj : {
                    default: obj
                };
            }
            var arrayDiff2 = exports2.arrayDiff = new _base2["default"];
            arrayDiff2.tokenize = function(value) {
                return value.slice();
            };
            arrayDiff2.join = arrayDiff2.removeEmpty = function(value) {
                return value;
            };
            function diffArrays2(oldArr, newArr, callback) {
                return arrayDiff2.diff(oldArr, newArr, callback);
            }
        }, function(module2, exports2, __webpack_require__) {
            exports2.__esModule = true;
            exports2.applyPatch = applyPatch2;
            exports2.applyPatches = applyPatches2;
            var _parse = __webpack_require__(11);
            var _distanceIterator = __webpack_require__(12);
            var _distanceIterator2 = _interopRequireDefault(_distanceIterator);
            function _interopRequireDefault(obj) {
                return obj && obj.__esModule ? obj : {
                    default: obj
                };
            }
            function applyPatch2(source, uniDiff) {
                var options = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
                if (typeof uniDiff === "string") {
                    uniDiff = (0, _parse.parsePatch)(uniDiff);
                }
                if (Array.isArray(uniDiff)) {
                    if (uniDiff.length > 1) {
                        throw new Error("applyPatch only works with a single input.");
                    }
                    uniDiff = uniDiff[0];
                }
                var lines = source.split(/\r\n|[\n\v\f\r\x85]/), delimiters = source.match(/\r\n|[\n\v\f\r\x85]/g) || [], hunks = uniDiff.hunks, compareLine = options.compareLine || function(lineNumber, line2, operation2, patchContent) {
                    return line2 === patchContent;
                }, errorCount = 0, fuzzFactor = options.fuzzFactor || 0, minLine = 0, offset = 0, removeEOFNL = void 0, addEOFNL = void 0;
                function hunkFits(hunk2, toPos2) {
                    for (var j2 = 0; j2 < hunk2.lines.length; j2++) {
                        var line2 = hunk2.lines[j2], operation2 = line2.length > 0 ? line2[0] : " ", content2 = line2.length > 0 ? line2.substr(1) : line2;
                        if (operation2 === " " || operation2 === "-") {
                            if (!compareLine(toPos2 + 1, lines[toPos2], operation2, content2)) {
                                errorCount++;
                                if (errorCount > fuzzFactor) {
                                    return false;
                                }
                            }
                            toPos2++;
                        }
                    }
                    return true;
                }
                for (var i = 0; i < hunks.length; i++) {
                    var hunk = hunks[i], maxLine = lines.length - hunk.oldLines, localOffset = 0, toPos = offset + hunk.oldStart - 1;
                    var iterator = (0, _distanceIterator2["default"])(toPos, minLine, maxLine);
                    for (;localOffset !== void 0; localOffset = iterator()) {
                        if (hunkFits(hunk, toPos + localOffset)) {
                            hunk.offset = offset += localOffset;
                            break;
                        }
                    }
                    if (localOffset === void 0) {
                        return false;
                    }
                    minLine = hunk.offset + hunk.oldStart + hunk.oldLines;
                }
                var diffOffset = 0;
                for (var _i = 0; _i < hunks.length; _i++) {
                    var _hunk = hunks[_i], _toPos = _hunk.oldStart + _hunk.offset + diffOffset - 1;
                    diffOffset += _hunk.newLines - _hunk.oldLines;
                    if (_toPos < 0) {
                        _toPos = 0;
                    }
                    for (var j = 0; j < _hunk.lines.length; j++) {
                        var line = _hunk.lines[j], operation = line.length > 0 ? line[0] : " ", content = line.length > 0 ? line.substr(1) : line, delimiter = _hunk.linedelimiters[j];
                        if (operation === " ") {
                            _toPos++;
                        } else if (operation === "-") {
                            lines.splice(_toPos, 1);
                            delimiters.splice(_toPos, 1);
                        } else if (operation === "+") {
                            lines.splice(_toPos, 0, content);
                            delimiters.splice(_toPos, 0, delimiter);
                            _toPos++;
                        } else if (operation === "\\") {
                            var previousOperation = _hunk.lines[j - 1] ? _hunk.lines[j - 1][0] : null;
                            if (previousOperation === "+") {
                                removeEOFNL = true;
                            } else if (previousOperation === "-") {
                                addEOFNL = true;
                            }
                        }
                    }
                }
                if (removeEOFNL) {
                    while (!lines[lines.length - 1]) {
                        lines.pop();
                        delimiters.pop();
                    }
                } else if (addEOFNL) {
                    lines.push("");
                    delimiters.push("\n");
                }
                for (var _k = 0; _k < lines.length - 1; _k++) {
                    lines[_k] = lines[_k] + delimiters[_k];
                }
                return lines.join("");
            }
            function applyPatches2(uniDiff, options) {
                if (typeof uniDiff === "string") {
                    uniDiff = (0, _parse.parsePatch)(uniDiff);
                }
                var currentIndex = 0;
                function processIndex() {
                    var index = uniDiff[currentIndex++];
                    if (!index) {
                        return options.complete();
                    }
                    options.loadFile(index, (function(err, data) {
                        if (err) {
                            return options.complete(err);
                        }
                        var updatedContent = applyPatch2(data, index, options);
                        options.patched(index, updatedContent, (function(err2) {
                            if (err2) {
                                return options.complete(err2);
                            }
                            processIndex();
                        }));
                    }));
                }
                processIndex();
            }
        }, function(module2, exports2) {
            exports2.__esModule = true;
            exports2.parsePatch = parsePatch2;
            function parsePatch2(uniDiff) {
                var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
                var diffstr = uniDiff.split(/\r\n|[\n\v\f\r\x85]/), delimiters = uniDiff.match(/\r\n|[\n\v\f\r\x85]/g) || [], list = [], i = 0;
                function parseIndex() {
                    var index = {};
                    list.push(index);
                    while (i < diffstr.length) {
                        var line = diffstr[i];
                        if (/^(\-\-\-|\+\+\+|@@)\s/.test(line)) {
                            break;
                        }
                        var header = /^(?:Index:|diff(?: -r \w+)+)\s+(.+?)\s*$/.exec(line);
                        if (header) {
                            index.index = header[1];
                        }
                        i++;
                    }
                    parseFileHeader(index);
                    parseFileHeader(index);
                    index.hunks = [];
                    while (i < diffstr.length) {
                        var _line = diffstr[i];
                        if (/^(Index:|diff|\-\-\-|\+\+\+)\s/.test(_line)) {
                            break;
                        } else if (/^@@/.test(_line)) {
                            index.hunks.push(parseHunk());
                        } else if (_line && options.strict) {
                            throw new Error("Unknown line " + (i + 1) + " " + JSON.stringify(_line));
                        } else {
                            i++;
                        }
                    }
                }
                function parseFileHeader(index) {
                    var fileHeader = /^(---|\+\+\+)\s+(.*)$/.exec(diffstr[i]);
                    if (fileHeader) {
                        var keyPrefix = fileHeader[1] === "---" ? "old" : "new";
                        var data = fileHeader[2].split("\t", 2);
                        var fileName = data[0].replace(/\\\\/g, "\\");
                        if (/^".*"$/.test(fileName)) {
                            fileName = fileName.substr(1, fileName.length - 2);
                        }
                        index[keyPrefix + "FileName"] = fileName;
                        index[keyPrefix + "Header"] = (data[1] || "").trim();
                        i++;
                    }
                }
                function parseHunk() {
                    var chunkHeaderIndex = i, chunkHeaderLine = diffstr[i++], chunkHeader = chunkHeaderLine.split(/@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);
                    var hunk = {
                        oldStart: +chunkHeader[1],
                        oldLines: +chunkHeader[2] || 1,
                        newStart: +chunkHeader[3],
                        newLines: +chunkHeader[4] || 1,
                        lines: [],
                        linedelimiters: []
                    };
                    var addCount = 0, removeCount = 0;
                    for (;i < diffstr.length; i++) {
                        if (diffstr[i].indexOf("--- ") === 0 && i + 2 < diffstr.length && diffstr[i + 1].indexOf("+++ ") === 0 && diffstr[i + 2].indexOf("@@") === 0) {
                            break;
                        }
                        var operation = diffstr[i].length == 0 && i != diffstr.length - 1 ? " " : diffstr[i][0];
                        if (operation === "+" || operation === "-" || operation === " " || operation === "\\") {
                            hunk.lines.push(diffstr[i]);
                            hunk.linedelimiters.push(delimiters[i] || "\n");
                            if (operation === "+") {
                                addCount++;
                            } else if (operation === "-") {
                                removeCount++;
                            } else if (operation === " ") {
                                addCount++;
                                removeCount++;
                            }
                        } else {
                            break;
                        }
                    }
                    if (!addCount && hunk.newLines === 1) {
                        hunk.newLines = 0;
                    }
                    if (!removeCount && hunk.oldLines === 1) {
                        hunk.oldLines = 0;
                    }
                    if (options.strict) {
                        if (addCount !== hunk.newLines) {
                            throw new Error("Added line count did not match for hunk at line " + (chunkHeaderIndex + 1));
                        }
                        if (removeCount !== hunk.oldLines) {
                            throw new Error("Removed line count did not match for hunk at line " + (chunkHeaderIndex + 1));
                        }
                    }
                    return hunk;
                }
                while (i < diffstr.length) {
                    parseIndex();
                }
                return list;
            }
        }, function(module2, exports2) {
            exports2.__esModule = true;
            exports2["default"] = function(start, minLine, maxLine) {
                var wantForward = true, backwardExhausted = false, forwardExhausted = false, localOffset = 1;
                return function iterator() {
                    if (wantForward && !forwardExhausted) {
                        if (backwardExhausted) {
                            localOffset++;
                        } else {
                            wantForward = false;
                        }
                        if (start + localOffset <= maxLine) {
                            return localOffset;
                        }
                        forwardExhausted = true;
                    }
                    if (!backwardExhausted) {
                        if (!forwardExhausted) {
                            wantForward = true;
                        }
                        if (minLine <= start - localOffset) {
                            return -localOffset++;
                        }
                        backwardExhausted = true;
                        return iterator();
                    }
                };
            };
        }, function(module2, exports2, __webpack_require__) {
            exports2.__esModule = true;
            exports2.calcLineCount = calcLineCount2;
            exports2.merge = merge2;
            var _create = __webpack_require__(14);
            var _parse = __webpack_require__(11);
            var _array = __webpack_require__(15);
            function _toConsumableArray(arr) {
                if (Array.isArray(arr)) {
                    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
                        arr2[i] = arr[i];
                    }
                    return arr2;
                } else {
                    return Array.from(arr);
                }
            }
            function calcLineCount2(hunk) {
                var _calcOldNewLineCount = calcOldNewLineCount(hunk.lines), oldLines = _calcOldNewLineCount.oldLines, newLines = _calcOldNewLineCount.newLines;
                if (oldLines !== void 0) {
                    hunk.oldLines = oldLines;
                } else {
                    delete hunk.oldLines;
                }
                if (newLines !== void 0) {
                    hunk.newLines = newLines;
                } else {
                    delete hunk.newLines;
                }
            }
            function merge2(mine, theirs, base) {
                mine = loadPatch(mine, base);
                theirs = loadPatch(theirs, base);
                var ret = {};
                if (mine.index || theirs.index) {
                    ret.index = mine.index || theirs.index;
                }
                if (mine.newFileName || theirs.newFileName) {
                    if (!fileNameChanged(mine)) {
                        ret.oldFileName = theirs.oldFileName || mine.oldFileName;
                        ret.newFileName = theirs.newFileName || mine.newFileName;
                        ret.oldHeader = theirs.oldHeader || mine.oldHeader;
                        ret.newHeader = theirs.newHeader || mine.newHeader;
                    } else if (!fileNameChanged(theirs)) {
                        ret.oldFileName = mine.oldFileName;
                        ret.newFileName = mine.newFileName;
                        ret.oldHeader = mine.oldHeader;
                        ret.newHeader = mine.newHeader;
                    } else {
                        ret.oldFileName = selectField(ret, mine.oldFileName, theirs.oldFileName);
                        ret.newFileName = selectField(ret, mine.newFileName, theirs.newFileName);
                        ret.oldHeader = selectField(ret, mine.oldHeader, theirs.oldHeader);
                        ret.newHeader = selectField(ret, mine.newHeader, theirs.newHeader);
                    }
                }
                ret.hunks = [];
                var mineIndex = 0, theirsIndex = 0, mineOffset = 0, theirsOffset = 0;
                while (mineIndex < mine.hunks.length || theirsIndex < theirs.hunks.length) {
                    var mineCurrent = mine.hunks[mineIndex] || {
                        oldStart: Infinity
                    }, theirsCurrent = theirs.hunks[theirsIndex] || {
                        oldStart: Infinity
                    };
                    if (hunkBefore(mineCurrent, theirsCurrent)) {
                        ret.hunks.push(cloneHunk(mineCurrent, mineOffset));
                        mineIndex++;
                        theirsOffset += mineCurrent.newLines - mineCurrent.oldLines;
                    } else if (hunkBefore(theirsCurrent, mineCurrent)) {
                        ret.hunks.push(cloneHunk(theirsCurrent, theirsOffset));
                        theirsIndex++;
                        mineOffset += theirsCurrent.newLines - theirsCurrent.oldLines;
                    } else {
                        var mergedHunk = {
                            oldStart: Math.min(mineCurrent.oldStart, theirsCurrent.oldStart),
                            oldLines: 0,
                            newStart: Math.min(mineCurrent.newStart + mineOffset, theirsCurrent.oldStart + theirsOffset),
                            newLines: 0,
                            lines: []
                        };
                        mergeLines(mergedHunk, mineCurrent.oldStart, mineCurrent.lines, theirsCurrent.oldStart, theirsCurrent.lines);
                        theirsIndex++;
                        mineIndex++;
                        ret.hunks.push(mergedHunk);
                    }
                }
                return ret;
            }
            function loadPatch(param, base) {
                if (typeof param === "string") {
                    if (/^@@/m.test(param) || /^Index:/m.test(param)) {
                        return (0, _parse.parsePatch)(param)[0];
                    }
                    if (!base) {
                        throw new Error("Must provide a base reference or pass in a patch");
                    }
                    return (0, _create.structuredPatch)(void 0, void 0, base, param);
                }
                return param;
            }
            function fileNameChanged(patch) {
                return patch.newFileName && patch.newFileName !== patch.oldFileName;
            }
            function selectField(index, mine, theirs) {
                if (mine === theirs) {
                    return mine;
                } else {
                    index.conflict = true;
                    return {
                        mine: mine,
                        theirs: theirs
                    };
                }
            }
            function hunkBefore(test, check) {
                return test.oldStart < check.oldStart && test.oldStart + test.oldLines < check.oldStart;
            }
            function cloneHunk(hunk, offset) {
                return {
                    oldStart: hunk.oldStart,
                    oldLines: hunk.oldLines,
                    newStart: hunk.newStart + offset,
                    newLines: hunk.newLines,
                    lines: hunk.lines
                };
            }
            function mergeLines(hunk, mineOffset, mineLines, theirOffset, theirLines) {
                var mine = {
                    offset: mineOffset,
                    lines: mineLines,
                    index: 0
                }, their = {
                    offset: theirOffset,
                    lines: theirLines,
                    index: 0
                };
                insertLeading(hunk, mine, their);
                insertLeading(hunk, their, mine);
                while (mine.index < mine.lines.length && their.index < their.lines.length) {
                    var mineCurrent = mine.lines[mine.index], theirCurrent = their.lines[their.index];
                    if ((mineCurrent[0] === "-" || mineCurrent[0] === "+") && (theirCurrent[0] === "-" || theirCurrent[0] === "+")) {
                        mutualChange(hunk, mine, their);
                    } else if (mineCurrent[0] === "+" && theirCurrent[0] === " ") {
                        var _hunk$lines;
                        (_hunk$lines = hunk.lines).push.apply(_hunk$lines, _toConsumableArray(collectChange(mine)));
                    } else if (theirCurrent[0] === "+" && mineCurrent[0] === " ") {
                        var _hunk$lines2;
                        (_hunk$lines2 = hunk.lines).push.apply(_hunk$lines2, _toConsumableArray(collectChange(their)));
                    } else if (mineCurrent[0] === "-" && theirCurrent[0] === " ") {
                        removal(hunk, mine, their);
                    } else if (theirCurrent[0] === "-" && mineCurrent[0] === " ") {
                        removal(hunk, their, mine, true);
                    } else if (mineCurrent === theirCurrent) {
                        hunk.lines.push(mineCurrent);
                        mine.index++;
                        their.index++;
                    } else {
                        conflict(hunk, collectChange(mine), collectChange(their));
                    }
                }
                insertTrailing(hunk, mine);
                insertTrailing(hunk, their);
                calcLineCount2(hunk);
            }
            function mutualChange(hunk, mine, their) {
                var myChanges = collectChange(mine), theirChanges = collectChange(their);
                if (allRemoves(myChanges) && allRemoves(theirChanges)) {
                    if ((0, _array.arrayStartsWith)(myChanges, theirChanges) && skipRemoveSuperset(their, myChanges, myChanges.length - theirChanges.length)) {
                        var _hunk$lines3;
                        (_hunk$lines3 = hunk.lines).push.apply(_hunk$lines3, _toConsumableArray(myChanges));
                        return;
                    } else if ((0, _array.arrayStartsWith)(theirChanges, myChanges) && skipRemoveSuperset(mine, theirChanges, theirChanges.length - myChanges.length)) {
                        var _hunk$lines4;
                        (_hunk$lines4 = hunk.lines).push.apply(_hunk$lines4, _toConsumableArray(theirChanges));
                        return;
                    }
                } else if ((0, _array.arrayEqual)(myChanges, theirChanges)) {
                    var _hunk$lines5;
                    (_hunk$lines5 = hunk.lines).push.apply(_hunk$lines5, _toConsumableArray(myChanges));
                    return;
                }
                conflict(hunk, myChanges, theirChanges);
            }
            function removal(hunk, mine, their, swap) {
                var myChanges = collectChange(mine), theirChanges = collectContext(their, myChanges);
                if (theirChanges.merged) {
                    var _hunk$lines6;
                    (_hunk$lines6 = hunk.lines).push.apply(_hunk$lines6, _toConsumableArray(theirChanges.merged));
                } else {
                    conflict(hunk, swap ? theirChanges : myChanges, swap ? myChanges : theirChanges);
                }
            }
            function conflict(hunk, mine, their) {
                hunk.conflict = true;
                hunk.lines.push({
                    conflict: true,
                    mine: mine,
                    theirs: their
                });
            }
            function insertLeading(hunk, insert, their) {
                while (insert.offset < their.offset && insert.index < insert.lines.length) {
                    var line = insert.lines[insert.index++];
                    hunk.lines.push(line);
                    insert.offset++;
                }
            }
            function insertTrailing(hunk, insert) {
                while (insert.index < insert.lines.length) {
                    var line = insert.lines[insert.index++];
                    hunk.lines.push(line);
                }
            }
            function collectChange(state) {
                var ret = [], operation = state.lines[state.index][0];
                while (state.index < state.lines.length) {
                    var line = state.lines[state.index];
                    if (operation === "-" && line[0] === "+") {
                        operation = "+";
                    }
                    if (operation === line[0]) {
                        ret.push(line);
                        state.index++;
                    } else {
                        break;
                    }
                }
                return ret;
            }
            function collectContext(state, matchChanges) {
                var changes = [], merged = [], matchIndex = 0, contextChanges = false, conflicted = false;
                while (matchIndex < matchChanges.length && state.index < state.lines.length) {
                    var change = state.lines[state.index], match = matchChanges[matchIndex];
                    if (match[0] === "+") {
                        break;
                    }
                    contextChanges = contextChanges || change[0] !== " ";
                    merged.push(match);
                    matchIndex++;
                    if (change[0] === "+") {
                        conflicted = true;
                        while (change[0] === "+") {
                            changes.push(change);
                            change = state.lines[++state.index];
                        }
                    }
                    if (match.substr(1) === change.substr(1)) {
                        changes.push(change);
                        state.index++;
                    } else {
                        conflicted = true;
                    }
                }
                if ((matchChanges[matchIndex] || "")[0] === "+" && contextChanges) {
                    conflicted = true;
                }
                if (conflicted) {
                    return changes;
                }
                while (matchIndex < matchChanges.length) {
                    merged.push(matchChanges[matchIndex++]);
                }
                return {
                    merged: merged,
                    changes: changes
                };
            }
            function allRemoves(changes) {
                return changes.reduce((function(prev, change) {
                    return prev && change[0] === "-";
                }), true);
            }
            function skipRemoveSuperset(state, removeChanges, delta) {
                for (var i = 0; i < delta; i++) {
                    var changeContent = removeChanges[removeChanges.length - delta + i].substr(1);
                    if (state.lines[state.index + i] !== " " + changeContent) {
                        return false;
                    }
                }
                state.index += delta;
                return true;
            }
            function calcOldNewLineCount(lines) {
                var oldLines = 0;
                var newLines = 0;
                lines.forEach((function(line) {
                    if (typeof line !== "string") {
                        var myCount = calcOldNewLineCount(line.mine);
                        var theirCount = calcOldNewLineCount(line.theirs);
                        if (oldLines !== void 0) {
                            if (myCount.oldLines === theirCount.oldLines) {
                                oldLines += myCount.oldLines;
                            } else {
                                oldLines = void 0;
                            }
                        }
                        if (newLines !== void 0) {
                            if (myCount.newLines === theirCount.newLines) {
                                newLines += myCount.newLines;
                            } else {
                                newLines = void 0;
                            }
                        }
                    } else {
                        if (newLines !== void 0 && (line[0] === "+" || line[0] === " ")) {
                            newLines++;
                        }
                        if (oldLines !== void 0 && (line[0] === "-" || line[0] === " ")) {
                            oldLines++;
                        }
                    }
                }));
                return {
                    oldLines: oldLines,
                    newLines: newLines
                };
            }
        }, function(module2, exports2, __webpack_require__) {
            exports2.__esModule = true;
            exports2.structuredPatch = structuredPatch2;
            exports2.createTwoFilesPatch = createTwoFilesPatch2;
            exports2.createPatch = createPatch2;
            var _line = __webpack_require__(5);
            function _toConsumableArray(arr) {
                if (Array.isArray(arr)) {
                    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
                        arr2[i] = arr[i];
                    }
                    return arr2;
                } else {
                    return Array.from(arr);
                }
            }
            function structuredPatch2(oldFileName, newFileName, oldStr, newStr, oldHeader, newHeader, options) {
                if (!options) {
                    options = {};
                }
                if (typeof options.context === "undefined") {
                    options.context = 4;
                }
                var diff2 = (0, _line.diffLines)(oldStr, newStr, options);
                diff2.push({
                    value: "",
                    lines: []
                });
                function contextLines(lines) {
                    return lines.map((function(entry) {
                        return " " + entry;
                    }));
                }
                var hunks = [];
                var oldRangeStart = 0, newRangeStart = 0, curRange = [], oldLine = 1, newLine = 1;
                var _loop = function _loop2(i2) {
                    var current = diff2[i2], lines = current.lines || current.value.replace(/\n$/, "").split("\n");
                    current.lines = lines;
                    if (current.added || current.removed) {
                        var _curRange;
                        if (!oldRangeStart) {
                            var prev = diff2[i2 - 1];
                            oldRangeStart = oldLine;
                            newRangeStart = newLine;
                            if (prev) {
                                curRange = options.context > 0 ? contextLines(prev.lines.slice(-options.context)) : [];
                                oldRangeStart -= curRange.length;
                                newRangeStart -= curRange.length;
                            }
                        }
                        (_curRange = curRange).push.apply(_curRange, _toConsumableArray(lines.map((function(entry) {
                            return (current.added ? "+" : "-") + entry;
                        }))));
                        if (current.added) {
                            newLine += lines.length;
                        } else {
                            oldLine += lines.length;
                        }
                    } else {
                        if (oldRangeStart) {
                            if (lines.length <= options.context * 2 && i2 < diff2.length - 2) {
                                var _curRange2;
                                (_curRange2 = curRange).push.apply(_curRange2, _toConsumableArray(contextLines(lines)));
                            } else {
                                var _curRange3;
                                var contextSize = Math.min(lines.length, options.context);
                                (_curRange3 = curRange).push.apply(_curRange3, _toConsumableArray(contextLines(lines.slice(0, contextSize))));
                                var hunk = {
                                    oldStart: oldRangeStart,
                                    oldLines: oldLine - oldRangeStart + contextSize,
                                    newStart: newRangeStart,
                                    newLines: newLine - newRangeStart + contextSize,
                                    lines: curRange
                                };
                                if (i2 >= diff2.length - 2 && lines.length <= options.context) {
                                    var oldEOFNewline = /\n$/.test(oldStr);
                                    var newEOFNewline = /\n$/.test(newStr);
                                    if (lines.length == 0 && !oldEOFNewline) {
                                        curRange.splice(hunk.oldLines, 0, "\\ No newline at end of file");
                                    } else if (!oldEOFNewline || !newEOFNewline) {
                                        curRange.push("\\ No newline at end of file");
                                    }
                                }
                                hunks.push(hunk);
                                oldRangeStart = 0;
                                newRangeStart = 0;
                                curRange = [];
                            }
                        }
                        oldLine += lines.length;
                        newLine += lines.length;
                    }
                };
                for (var i = 0; i < diff2.length; i++) {
                    _loop(i);
                }
                return {
                    oldFileName: oldFileName,
                    newFileName: newFileName,
                    oldHeader: oldHeader,
                    newHeader: newHeader,
                    hunks: hunks
                };
            }
            function createTwoFilesPatch2(oldFileName, newFileName, oldStr, newStr, oldHeader, newHeader, options) {
                var diff2 = structuredPatch2(oldFileName, newFileName, oldStr, newStr, oldHeader, newHeader, options);
                var ret = [];
                if (oldFileName == newFileName) {
                    ret.push("Index: " + oldFileName);
                }
                ret.push("===================================================================");
                ret.push("--- " + diff2.oldFileName + (typeof diff2.oldHeader === "undefined" ? "" : "\t" + diff2.oldHeader));
                ret.push("+++ " + diff2.newFileName + (typeof diff2.newHeader === "undefined" ? "" : "\t" + diff2.newHeader));
                for (var i = 0; i < diff2.hunks.length; i++) {
                    var hunk = diff2.hunks[i];
                    ret.push("@@ -" + hunk.oldStart + "," + hunk.oldLines + " +" + hunk.newStart + "," + hunk.newLines + " @@");
                    ret.push.apply(ret, hunk.lines);
                }
                return ret.join("\n") + "\n";
            }
            function createPatch2(fileName, oldStr, newStr, oldHeader, newHeader, options) {
                return createTwoFilesPatch2(fileName, fileName, oldStr, newStr, oldHeader, newHeader, options);
            }
        }, function(module2, exports2) {
            exports2.__esModule = true;
            exports2.arrayEqual = arrayEqual2;
            exports2.arrayStartsWith = arrayStartsWith2;
            function arrayEqual2(a, b) {
                if (a.length !== b.length) {
                    return false;
                }
                return arrayStartsWith2(a, b);
            }
            function arrayStartsWith2(array, start) {
                if (start.length > array.length) {
                    return false;
                }
                for (var i = 0; i < start.length; i++) {
                    if (start[i] !== array[i]) {
                        return false;
                    }
                }
                return true;
            }
        }, function(module2, exports2) {
            exports2.__esModule = true;
            exports2.convertChangesToDMP = convertChangesToDMP2;
            function convertChangesToDMP2(changes) {
                var ret = [], change = void 0, operation = void 0;
                for (var i = 0; i < changes.length; i++) {
                    change = changes[i];
                    if (change.added) {
                        operation = 1;
                    } else if (change.removed) {
                        operation = -1;
                    } else {
                        operation = 0;
                    }
                    ret.push([ operation, change.value ]);
                }
                return ret;
            }
        }, function(module2, exports2) {
            exports2.__esModule = true;
            exports2.convertChangesToXML = convertChangesToXML2;
            function convertChangesToXML2(changes) {
                var ret = [];
                for (var i = 0; i < changes.length; i++) {
                    var change = changes[i];
                    if (change.added) {
                        ret.push("<ins>");
                    } else if (change.removed) {
                        ret.push("<del>");
                    }
                    ret.push(escapeHTML(change.value));
                    if (change.added) {
                        ret.push("</ins>");
                    } else if (change.removed) {
                        ret.push("</del>");
                    }
                }
                return ret.join("");
            }
            function escapeHTML(s) {
                var n = s;
                n = n.replace(/&/g, "&amp;");
                n = n.replace(/</g, "&lt;");
                n = n.replace(/>/g, "&gt;");
                n = n.replace(/"/g, "&quot;");
                return n;
            }
        } ]);
    }));
}));

var __pika_web_default_export_for_treeshaking__ =  getDefaultExportFromCjs(diff$1);

diff$1.Diff;

diff$1.JsDiff;

diff$1.applyPatch;

diff$1.applyPatches;

diff$1.arrayDiff;

diff$1.arrayEqual;

diff$1.arrayStartsWith;

diff$1.calcLineCount;

diff$1.canonicalize;

diff$1.characterDiff;

diff$1.convertChangesToDMP;

diff$1.convertChangesToXML;

diff$1.createPatch;

diff$1.createTwoFilesPatch;

diff$1.cssDiff;

diff$1.diffArrays;

diff$1.diffChars;

diff$1.diffCss;

diff$1.diffJson;

diff$1.diffLines;

diff$1.diffSentences;

diff$1.diffTrimmedLines;

diff$1.diffWords;

diff$1.diffWordsWithSpace;

diff$1.generateOptions;

diff$1.jsonDiff;

diff$1.lineDiff;

diff$1.merge;

diff$1.parsePatch;

diff$1.sentenceDiff;

diff$1.structuredPatch;

diff$1.wordDiff;

var diffLines = function(a, b, opts) {
    opts = opts || {};
    var n_surrounding = opts.n_surrounding >= 0 ? opts.n_surrounding : -1;
    var diffs = __pika_web_default_export_for_treeshaking__.diffLines(a, b, {
        ignoreWhitespace: false
    });
    var out = [];
    var lines_with_change = [];
    diffs.forEach((function(d) {
        var mod = d.removed && d.added ? "!" : d.removed ? "-" : d.added ? "+" : " ";
        var lines = d.value.split("\n");
        if (lines.length > 0 && lines[lines.length - 1] === "") {
            lines = lines.slice(0, lines.length - 1);
        }
        lines.forEach((function(line) {
            if (mod !== " " && n_surrounding >= 0) {
                lines_with_change.push(out.length);
            }
            out.push(mod + line);
        }));
    }));
    if (n_surrounding >= 0) {
        var short_out = {};
        lines_with_change.forEach((function(line_i) {
            var i, j;
            for (i = -n_surrounding; i < n_surrounding + 1; i++) {
                j = line_i + i;
                if (j >= 0 && j < out.length) {
                    short_out[j] = out[j];
                }
            }
        }));
        out = [];
        var last_key;
        var key;
        for (key in short_out) {
            if (short_out.hasOwnProperty(key)) {
                if (last_key !== void 0 && parseInt(key) !== parseInt(last_key) + 1) {
                    out.push("@@");
                }
                out.push(short_out[key]);
                last_key = key;
            }
        }
    }
    return out.join("\n");
};

var matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;

var escapeStringRegexp = function(str) {
    if (typeof str !== "string") {
        throw new TypeError("Expected a string");
    }
    return str.replace(matchOperatorsRe, "\\$&");
};

var colorName = {
    aliceblue: [ 240, 248, 255 ],
    antiquewhite: [ 250, 235, 215 ],
    aqua: [ 0, 255, 255 ],
    aquamarine: [ 127, 255, 212 ],
    azure: [ 240, 255, 255 ],
    beige: [ 245, 245, 220 ],
    bisque: [ 255, 228, 196 ],
    black: [ 0, 0, 0 ],
    blanchedalmond: [ 255, 235, 205 ],
    blue: [ 0, 0, 255 ],
    blueviolet: [ 138, 43, 226 ],
    brown: [ 165, 42, 42 ],
    burlywood: [ 222, 184, 135 ],
    cadetblue: [ 95, 158, 160 ],
    chartreuse: [ 127, 255, 0 ],
    chocolate: [ 210, 105, 30 ],
    coral: [ 255, 127, 80 ],
    cornflowerblue: [ 100, 149, 237 ],
    cornsilk: [ 255, 248, 220 ],
    crimson: [ 220, 20, 60 ],
    cyan: [ 0, 255, 255 ],
    darkblue: [ 0, 0, 139 ],
    darkcyan: [ 0, 139, 139 ],
    darkgoldenrod: [ 184, 134, 11 ],
    darkgray: [ 169, 169, 169 ],
    darkgreen: [ 0, 100, 0 ],
    darkgrey: [ 169, 169, 169 ],
    darkkhaki: [ 189, 183, 107 ],
    darkmagenta: [ 139, 0, 139 ],
    darkolivegreen: [ 85, 107, 47 ],
    darkorange: [ 255, 140, 0 ],
    darkorchid: [ 153, 50, 204 ],
    darkred: [ 139, 0, 0 ],
    darksalmon: [ 233, 150, 122 ],
    darkseagreen: [ 143, 188, 143 ],
    darkslateblue: [ 72, 61, 139 ],
    darkslategray: [ 47, 79, 79 ],
    darkslategrey: [ 47, 79, 79 ],
    darkturquoise: [ 0, 206, 209 ],
    darkviolet: [ 148, 0, 211 ],
    deeppink: [ 255, 20, 147 ],
    deepskyblue: [ 0, 191, 255 ],
    dimgray: [ 105, 105, 105 ],
    dimgrey: [ 105, 105, 105 ],
    dodgerblue: [ 30, 144, 255 ],
    firebrick: [ 178, 34, 34 ],
    floralwhite: [ 255, 250, 240 ],
    forestgreen: [ 34, 139, 34 ],
    fuchsia: [ 255, 0, 255 ],
    gainsboro: [ 220, 220, 220 ],
    ghostwhite: [ 248, 248, 255 ],
    gold: [ 255, 215, 0 ],
    goldenrod: [ 218, 165, 32 ],
    gray: [ 128, 128, 128 ],
    green: [ 0, 128, 0 ],
    greenyellow: [ 173, 255, 47 ],
    grey: [ 128, 128, 128 ],
    honeydew: [ 240, 255, 240 ],
    hotpink: [ 255, 105, 180 ],
    indianred: [ 205, 92, 92 ],
    indigo: [ 75, 0, 130 ],
    ivory: [ 255, 255, 240 ],
    khaki: [ 240, 230, 140 ],
    lavender: [ 230, 230, 250 ],
    lavenderblush: [ 255, 240, 245 ],
    lawngreen: [ 124, 252, 0 ],
    lemonchiffon: [ 255, 250, 205 ],
    lightblue: [ 173, 216, 230 ],
    lightcoral: [ 240, 128, 128 ],
    lightcyan: [ 224, 255, 255 ],
    lightgoldenrodyellow: [ 250, 250, 210 ],
    lightgray: [ 211, 211, 211 ],
    lightgreen: [ 144, 238, 144 ],
    lightgrey: [ 211, 211, 211 ],
    lightpink: [ 255, 182, 193 ],
    lightsalmon: [ 255, 160, 122 ],
    lightseagreen: [ 32, 178, 170 ],
    lightskyblue: [ 135, 206, 250 ],
    lightslategray: [ 119, 136, 153 ],
    lightslategrey: [ 119, 136, 153 ],
    lightsteelblue: [ 176, 196, 222 ],
    lightyellow: [ 255, 255, 224 ],
    lime: [ 0, 255, 0 ],
    limegreen: [ 50, 205, 50 ],
    linen: [ 250, 240, 230 ],
    magenta: [ 255, 0, 255 ],
    maroon: [ 128, 0, 0 ],
    mediumaquamarine: [ 102, 205, 170 ],
    mediumblue: [ 0, 0, 205 ],
    mediumorchid: [ 186, 85, 211 ],
    mediumpurple: [ 147, 112, 219 ],
    mediumseagreen: [ 60, 179, 113 ],
    mediumslateblue: [ 123, 104, 238 ],
    mediumspringgreen: [ 0, 250, 154 ],
    mediumturquoise: [ 72, 209, 204 ],
    mediumvioletred: [ 199, 21, 133 ],
    midnightblue: [ 25, 25, 112 ],
    mintcream: [ 245, 255, 250 ],
    mistyrose: [ 255, 228, 225 ],
    moccasin: [ 255, 228, 181 ],
    navajowhite: [ 255, 222, 173 ],
    navy: [ 0, 0, 128 ],
    oldlace: [ 253, 245, 230 ],
    olive: [ 128, 128, 0 ],
    olivedrab: [ 107, 142, 35 ],
    orange: [ 255, 165, 0 ],
    orangered: [ 255, 69, 0 ],
    orchid: [ 218, 112, 214 ],
    palegoldenrod: [ 238, 232, 170 ],
    palegreen: [ 152, 251, 152 ],
    paleturquoise: [ 175, 238, 238 ],
    palevioletred: [ 219, 112, 147 ],
    papayawhip: [ 255, 239, 213 ],
    peachpuff: [ 255, 218, 185 ],
    peru: [ 205, 133, 63 ],
    pink: [ 255, 192, 203 ],
    plum: [ 221, 160, 221 ],
    powderblue: [ 176, 224, 230 ],
    purple: [ 128, 0, 128 ],
    rebeccapurple: [ 102, 51, 153 ],
    red: [ 255, 0, 0 ],
    rosybrown: [ 188, 143, 143 ],
    royalblue: [ 65, 105, 225 ],
    saddlebrown: [ 139, 69, 19 ],
    salmon: [ 250, 128, 114 ],
    sandybrown: [ 244, 164, 96 ],
    seagreen: [ 46, 139, 87 ],
    seashell: [ 255, 245, 238 ],
    sienna: [ 160, 82, 45 ],
    silver: [ 192, 192, 192 ],
    skyblue: [ 135, 206, 235 ],
    slateblue: [ 106, 90, 205 ],
    slategray: [ 112, 128, 144 ],
    slategrey: [ 112, 128, 144 ],
    snow: [ 255, 250, 250 ],
    springgreen: [ 0, 255, 127 ],
    steelblue: [ 70, 130, 180 ],
    tan: [ 210, 180, 140 ],
    teal: [ 0, 128, 128 ],
    thistle: [ 216, 191, 216 ],
    tomato: [ 255, 99, 71 ],
    turquoise: [ 64, 224, 208 ],
    violet: [ 238, 130, 238 ],
    wheat: [ 245, 222, 179 ],
    white: [ 255, 255, 255 ],
    whitesmoke: [ 245, 245, 245 ],
    yellow: [ 255, 255, 0 ],
    yellowgreen: [ 154, 205, 50 ]
};

function createCommonjsModule$3(fn, basedir, module) {
    return module = {
        path: basedir,
        exports: {},
        require: function(path, base) {
            return commonjsRequire$3(path, base === void 0 || base === null ? module.path : base);
        }
    }, fn(module, module.exports), module.exports;
}

function commonjsRequire$3() {
    throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs");
}

var conversions = createCommonjsModule$3((function(module) {
    var reverseKeywords = {};
    for (var key in colorName) {
        if (colorName.hasOwnProperty(key)) {
            reverseKeywords[colorName[key]] = key;
        }
    }
    var convert2 = module.exports = {
        rgb: {
            channels: 3,
            labels: "rgb"
        },
        hsl: {
            channels: 3,
            labels: "hsl"
        },
        hsv: {
            channels: 3,
            labels: "hsv"
        },
        hwb: {
            channels: 3,
            labels: "hwb"
        },
        cmyk: {
            channels: 4,
            labels: "cmyk"
        },
        xyz: {
            channels: 3,
            labels: "xyz"
        },
        lab: {
            channels: 3,
            labels: "lab"
        },
        lch: {
            channels: 3,
            labels: "lch"
        },
        hex: {
            channels: 1,
            labels: [ "hex" ]
        },
        keyword: {
            channels: 1,
            labels: [ "keyword" ]
        },
        ansi16: {
            channels: 1,
            labels: [ "ansi16" ]
        },
        ansi256: {
            channels: 1,
            labels: [ "ansi256" ]
        },
        hcg: {
            channels: 3,
            labels: [ "h", "c", "g" ]
        },
        apple: {
            channels: 3,
            labels: [ "r16", "g16", "b16" ]
        },
        gray: {
            channels: 1,
            labels: [ "gray" ]
        }
    };
    for (var model in convert2) {
        if (convert2.hasOwnProperty(model)) {
            if (!("channels" in convert2[model])) {
                throw new Error("missing channels property: " + model);
            }
            if (!("labels" in convert2[model])) {
                throw new Error("missing channel labels property: " + model);
            }
            if (convert2[model].labels.length !== convert2[model].channels) {
                throw new Error("channel and label counts mismatch: " + model);
            }
            var channels = convert2[model].channels;
            var labels = convert2[model].labels;
            delete convert2[model].channels;
            delete convert2[model].labels;
            Object.defineProperty(convert2[model], "channels", {
                value: channels
            });
            Object.defineProperty(convert2[model], "labels", {
                value: labels
            });
        }
    }
    convert2.rgb.hsl = function(rgb) {
        var r = rgb[0] / 255;
        var g = rgb[1] / 255;
        var b = rgb[2] / 255;
        var min = Math.min(r, g, b);
        var max = Math.max(r, g, b);
        var delta = max - min;
        var h;
        var s;
        var l;
        if (max === min) {
            h = 0;
        } else if (r === max) {
            h = (g - b) / delta;
        } else if (g === max) {
            h = 2 + (b - r) / delta;
        } else if (b === max) {
            h = 4 + (r - g) / delta;
        }
        h = Math.min(h * 60, 360);
        if (h < 0) {
            h += 360;
        }
        l = (min + max) / 2;
        if (max === min) {
            s = 0;
        } else if (l <= .5) {
            s = delta / (max + min);
        } else {
            s = delta / (2 - max - min);
        }
        return [ h, s * 100, l * 100 ];
    };
    convert2.rgb.hsv = function(rgb) {
        var rdif;
        var gdif;
        var bdif;
        var h;
        var s;
        var r = rgb[0] / 255;
        var g = rgb[1] / 255;
        var b = rgb[2] / 255;
        var v = Math.max(r, g, b);
        var diff = v - Math.min(r, g, b);
        var diffc = function(c) {
            return (v - c) / 6 / diff + 1 / 2;
        };
        if (diff === 0) {
            h = s = 0;
        } else {
            s = diff / v;
            rdif = diffc(r);
            gdif = diffc(g);
            bdif = diffc(b);
            if (r === v) {
                h = bdif - gdif;
            } else if (g === v) {
                h = 1 / 3 + rdif - bdif;
            } else if (b === v) {
                h = 2 / 3 + gdif - rdif;
            }
            if (h < 0) {
                h += 1;
            } else if (h > 1) {
                h -= 1;
            }
        }
        return [ h * 360, s * 100, v * 100 ];
    };
    convert2.rgb.hwb = function(rgb) {
        var r = rgb[0];
        var g = rgb[1];
        var b = rgb[2];
        var h = convert2.rgb.hsl(rgb)[0];
        var w = 1 / 255 * Math.min(r, Math.min(g, b));
        b = 1 - 1 / 255 * Math.max(r, Math.max(g, b));
        return [ h, w * 100, b * 100 ];
    };
    convert2.rgb.cmyk = function(rgb) {
        var r = rgb[0] / 255;
        var g = rgb[1] / 255;
        var b = rgb[2] / 255;
        var c;
        var m;
        var y;
        var k;
        k = Math.min(1 - r, 1 - g, 1 - b);
        c = (1 - r - k) / (1 - k) || 0;
        m = (1 - g - k) / (1 - k) || 0;
        y = (1 - b - k) / (1 - k) || 0;
        return [ c * 100, m * 100, y * 100, k * 100 ];
    };
    function comparativeDistance(x, y) {
        return Math.pow(x[0] - y[0], 2) + Math.pow(x[1] - y[1], 2) + Math.pow(x[2] - y[2], 2);
    }
    convert2.rgb.keyword = function(rgb) {
        var reversed = reverseKeywords[rgb];
        if (reversed) {
            return reversed;
        }
        var currentClosestDistance = Infinity;
        var currentClosestKeyword;
        for (var keyword in colorName) {
            if (colorName.hasOwnProperty(keyword)) {
                var value = colorName[keyword];
                var distance = comparativeDistance(rgb, value);
                if (distance < currentClosestDistance) {
                    currentClosestDistance = distance;
                    currentClosestKeyword = keyword;
                }
            }
        }
        return currentClosestKeyword;
    };
    convert2.keyword.rgb = function(keyword) {
        return colorName[keyword];
    };
    convert2.rgb.xyz = function(rgb) {
        var r = rgb[0] / 255;
        var g = rgb[1] / 255;
        var b = rgb[2] / 255;
        r = r > .04045 ? Math.pow((r + .055) / 1.055, 2.4) : r / 12.92;
        g = g > .04045 ? Math.pow((g + .055) / 1.055, 2.4) : g / 12.92;
        b = b > .04045 ? Math.pow((b + .055) / 1.055, 2.4) : b / 12.92;
        var x = r * .4124 + g * .3576 + b * .1805;
        var y = r * .2126 + g * .7152 + b * .0722;
        var z = r * .0193 + g * .1192 + b * .9505;
        return [ x * 100, y * 100, z * 100 ];
    };
    convert2.rgb.lab = function(rgb) {
        var xyz = convert2.rgb.xyz(rgb);
        var x = xyz[0];
        var y = xyz[1];
        var z = xyz[2];
        var l;
        var a;
        var b;
        x /= 95.047;
        y /= 100;
        z /= 108.883;
        x = x > .008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
        y = y > .008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
        z = z > .008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;
        l = 116 * y - 16;
        a = 500 * (x - y);
        b = 200 * (y - z);
        return [ l, a, b ];
    };
    convert2.hsl.rgb = function(hsl) {
        var h = hsl[0] / 360;
        var s = hsl[1] / 100;
        var l = hsl[2] / 100;
        var t1;
        var t2;
        var t3;
        var rgb;
        var val;
        if (s === 0) {
            val = l * 255;
            return [ val, val, val ];
        }
        if (l < .5) {
            t2 = l * (1 + s);
        } else {
            t2 = l + s - l * s;
        }
        t1 = 2 * l - t2;
        rgb = [ 0, 0, 0 ];
        for (var i = 0; i < 3; i++) {
            t3 = h + 1 / 3 * -(i - 1);
            if (t3 < 0) {
                t3++;
            }
            if (t3 > 1) {
                t3--;
            }
            if (6 * t3 < 1) {
                val = t1 + (t2 - t1) * 6 * t3;
            } else if (2 * t3 < 1) {
                val = t2;
            } else if (3 * t3 < 2) {
                val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
            } else {
                val = t1;
            }
            rgb[i] = val * 255;
        }
        return rgb;
    };
    convert2.hsl.hsv = function(hsl) {
        var h = hsl[0];
        var s = hsl[1] / 100;
        var l = hsl[2] / 100;
        var smin = s;
        var lmin = Math.max(l, .01);
        var sv;
        var v;
        l *= 2;
        s *= l <= 1 ? l : 2 - l;
        smin *= lmin <= 1 ? lmin : 2 - lmin;
        v = (l + s) / 2;
        sv = l === 0 ? 2 * smin / (lmin + smin) : 2 * s / (l + s);
        return [ h, sv * 100, v * 100 ];
    };
    convert2.hsv.rgb = function(hsv) {
        var h = hsv[0] / 60;
        var s = hsv[1] / 100;
        var v = hsv[2] / 100;
        var hi = Math.floor(h) % 6;
        var f = h - Math.floor(h);
        var p = 255 * v * (1 - s);
        var q = 255 * v * (1 - s * f);
        var t = 255 * v * (1 - s * (1 - f));
        v *= 255;
        switch (hi) {
          case 0:
            return [ v, t, p ];

          case 1:
            return [ q, v, p ];

          case 2:
            return [ p, v, t ];

          case 3:
            return [ p, q, v ];

          case 4:
            return [ t, p, v ];

          case 5:
            return [ v, p, q ];
        }
    };
    convert2.hsv.hsl = function(hsv) {
        var h = hsv[0];
        var s = hsv[1] / 100;
        var v = hsv[2] / 100;
        var vmin = Math.max(v, .01);
        var lmin;
        var sl;
        var l;
        l = (2 - s) * v;
        lmin = (2 - s) * vmin;
        sl = s * vmin;
        sl /= lmin <= 1 ? lmin : 2 - lmin;
        sl = sl || 0;
        l /= 2;
        return [ h, sl * 100, l * 100 ];
    };
    convert2.hwb.rgb = function(hwb) {
        var h = hwb[0] / 360;
        var wh = hwb[1] / 100;
        var bl = hwb[2] / 100;
        var ratio = wh + bl;
        var i;
        var v;
        var f;
        var n;
        if (ratio > 1) {
            wh /= ratio;
            bl /= ratio;
        }
        i = Math.floor(6 * h);
        v = 1 - bl;
        f = 6 * h - i;
        if ((i & 1) !== 0) {
            f = 1 - f;
        }
        n = wh + f * (v - wh);
        var r;
        var g;
        var b;
        switch (i) {
          default:
          case 6:
          case 0:
            r = v;
            g = n;
            b = wh;
            break;

          case 1:
            r = n;
            g = v;
            b = wh;
            break;

          case 2:
            r = wh;
            g = v;
            b = n;
            break;

          case 3:
            r = wh;
            g = n;
            b = v;
            break;

          case 4:
            r = n;
            g = wh;
            b = v;
            break;

          case 5:
            r = v;
            g = wh;
            b = n;
            break;
        }
        return [ r * 255, g * 255, b * 255 ];
    };
    convert2.cmyk.rgb = function(cmyk) {
        var c = cmyk[0] / 100;
        var m = cmyk[1] / 100;
        var y = cmyk[2] / 100;
        var k = cmyk[3] / 100;
        var r;
        var g;
        var b;
        r = 1 - Math.min(1, c * (1 - k) + k);
        g = 1 - Math.min(1, m * (1 - k) + k);
        b = 1 - Math.min(1, y * (1 - k) + k);
        return [ r * 255, g * 255, b * 255 ];
    };
    convert2.xyz.rgb = function(xyz) {
        var x = xyz[0] / 100;
        var y = xyz[1] / 100;
        var z = xyz[2] / 100;
        var r;
        var g;
        var b;
        r = x * 3.2406 + y * -1.5372 + z * -.4986;
        g = x * -.9689 + y * 1.8758 + z * .0415;
        b = x * .0557 + y * -.204 + z * 1.057;
        r = r > .0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - .055 : r * 12.92;
        g = g > .0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - .055 : g * 12.92;
        b = b > .0031308 ? 1.055 * Math.pow(b, 1 / 2.4) - .055 : b * 12.92;
        r = Math.min(Math.max(0, r), 1);
        g = Math.min(Math.max(0, g), 1);
        b = Math.min(Math.max(0, b), 1);
        return [ r * 255, g * 255, b * 255 ];
    };
    convert2.xyz.lab = function(xyz) {
        var x = xyz[0];
        var y = xyz[1];
        var z = xyz[2];
        var l;
        var a;
        var b;
        x /= 95.047;
        y /= 100;
        z /= 108.883;
        x = x > .008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
        y = y > .008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
        z = z > .008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;
        l = 116 * y - 16;
        a = 500 * (x - y);
        b = 200 * (y - z);
        return [ l, a, b ];
    };
    convert2.lab.xyz = function(lab) {
        var l = lab[0];
        var a = lab[1];
        var b = lab[2];
        var x;
        var y;
        var z;
        y = (l + 16) / 116;
        x = a / 500 + y;
        z = y - b / 200;
        var y2 = Math.pow(y, 3);
        var x2 = Math.pow(x, 3);
        var z2 = Math.pow(z, 3);
        y = y2 > .008856 ? y2 : (y - 16 / 116) / 7.787;
        x = x2 > .008856 ? x2 : (x - 16 / 116) / 7.787;
        z = z2 > .008856 ? z2 : (z - 16 / 116) / 7.787;
        x *= 95.047;
        y *= 100;
        z *= 108.883;
        return [ x, y, z ];
    };
    convert2.lab.lch = function(lab) {
        var l = lab[0];
        var a = lab[1];
        var b = lab[2];
        var hr;
        var h;
        var c;
        hr = Math.atan2(b, a);
        h = hr * 360 / 2 / Math.PI;
        if (h < 0) {
            h += 360;
        }
        c = Math.sqrt(a * a + b * b);
        return [ l, c, h ];
    };
    convert2.lch.lab = function(lch) {
        var l = lch[0];
        var c = lch[1];
        var h = lch[2];
        var a;
        var b;
        var hr;
        hr = h / 360 * 2 * Math.PI;
        a = c * Math.cos(hr);
        b = c * Math.sin(hr);
        return [ l, a, b ];
    };
    convert2.rgb.ansi16 = function(args) {
        var r = args[0];
        var g = args[1];
        var b = args[2];
        var value = 1 in arguments ? arguments[1] : convert2.rgb.hsv(args)[2];
        value = Math.round(value / 50);
        if (value === 0) {
            return 30;
        }
        var ansi = 30 + (Math.round(b / 255) << 2 | Math.round(g / 255) << 1 | Math.round(r / 255));
        if (value === 2) {
            ansi += 60;
        }
        return ansi;
    };
    convert2.hsv.ansi16 = function(args) {
        return convert2.rgb.ansi16(convert2.hsv.rgb(args), args[2]);
    };
    convert2.rgb.ansi256 = function(args) {
        var r = args[0];
        var g = args[1];
        var b = args[2];
        if (r === g && g === b) {
            if (r < 8) {
                return 16;
            }
            if (r > 248) {
                return 231;
            }
            return Math.round((r - 8) / 247 * 24) + 232;
        }
        var ansi = 16 + 36 * Math.round(r / 255 * 5) + 6 * Math.round(g / 255 * 5) + Math.round(b / 255 * 5);
        return ansi;
    };
    convert2.ansi16.rgb = function(args) {
        var color = args % 10;
        if (color === 0 || color === 7) {
            if (args > 50) {
                color += 3.5;
            }
            color = color / 10.5 * 255;
            return [ color, color, color ];
        }
        var mult = (~~(args > 50) + 1) * .5;
        var r = (color & 1) * mult * 255;
        var g = (color >> 1 & 1) * mult * 255;
        var b = (color >> 2 & 1) * mult * 255;
        return [ r, g, b ];
    };
    convert2.ansi256.rgb = function(args) {
        if (args >= 232) {
            var c = (args - 232) * 10 + 8;
            return [ c, c, c ];
        }
        args -= 16;
        var rem;
        var r = Math.floor(args / 36) / 5 * 255;
        var g = Math.floor((rem = args % 36) / 6) / 5 * 255;
        var b = rem % 6 / 5 * 255;
        return [ r, g, b ];
    };
    convert2.rgb.hex = function(args) {
        var integer = ((Math.round(args[0]) & 255) << 16) + ((Math.round(args[1]) & 255) << 8) + (Math.round(args[2]) & 255);
        var string = integer.toString(16).toUpperCase();
        return "000000".substring(string.length) + string;
    };
    convert2.hex.rgb = function(args) {
        var match = args.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
        if (!match) {
            return [ 0, 0, 0 ];
        }
        var colorString = match[0];
        if (match[0].length === 3) {
            colorString = colorString.split("").map((function(char) {
                return char + char;
            })).join("");
        }
        var integer = parseInt(colorString, 16);
        var r = integer >> 16 & 255;
        var g = integer >> 8 & 255;
        var b = integer & 255;
        return [ r, g, b ];
    };
    convert2.rgb.hcg = function(rgb) {
        var r = rgb[0] / 255;
        var g = rgb[1] / 255;
        var b = rgb[2] / 255;
        var max = Math.max(Math.max(r, g), b);
        var min = Math.min(Math.min(r, g), b);
        var chroma = max - min;
        var grayscale;
        var hue;
        if (chroma < 1) {
            grayscale = min / (1 - chroma);
        } else {
            grayscale = 0;
        }
        if (chroma <= 0) {
            hue = 0;
        } else if (max === r) {
            hue = (g - b) / chroma % 6;
        } else if (max === g) {
            hue = 2 + (b - r) / chroma;
        } else {
            hue = 4 + (r - g) / chroma + 4;
        }
        hue /= 6;
        hue %= 1;
        return [ hue * 360, chroma * 100, grayscale * 100 ];
    };
    convert2.hsl.hcg = function(hsl) {
        var s = hsl[1] / 100;
        var l = hsl[2] / 100;
        var c = 1;
        var f = 0;
        if (l < .5) {
            c = 2 * s * l;
        } else {
            c = 2 * s * (1 - l);
        }
        if (c < 1) {
            f = (l - .5 * c) / (1 - c);
        }
        return [ hsl[0], c * 100, f * 100 ];
    };
    convert2.hsv.hcg = function(hsv) {
        var s = hsv[1] / 100;
        var v = hsv[2] / 100;
        var c = s * v;
        var f = 0;
        if (c < 1) {
            f = (v - c) / (1 - c);
        }
        return [ hsv[0], c * 100, f * 100 ];
    };
    convert2.hcg.rgb = function(hcg) {
        var h = hcg[0] / 360;
        var c = hcg[1] / 100;
        var g = hcg[2] / 100;
        if (c === 0) {
            return [ g * 255, g * 255, g * 255 ];
        }
        var pure = [ 0, 0, 0 ];
        var hi = h % 1 * 6;
        var v = hi % 1;
        var w = 1 - v;
        var mg = 0;
        switch (Math.floor(hi)) {
          case 0:
            pure[0] = 1;
            pure[1] = v;
            pure[2] = 0;
            break;

          case 1:
            pure[0] = w;
            pure[1] = 1;
            pure[2] = 0;
            break;

          case 2:
            pure[0] = 0;
            pure[1] = 1;
            pure[2] = v;
            break;

          case 3:
            pure[0] = 0;
            pure[1] = w;
            pure[2] = 1;
            break;

          case 4:
            pure[0] = v;
            pure[1] = 0;
            pure[2] = 1;
            break;

          default:
            pure[0] = 1;
            pure[1] = 0;
            pure[2] = w;
        }
        mg = (1 - c) * g;
        return [ (c * pure[0] + mg) * 255, (c * pure[1] + mg) * 255, (c * pure[2] + mg) * 255 ];
    };
    convert2.hcg.hsv = function(hcg) {
        var c = hcg[1] / 100;
        var g = hcg[2] / 100;
        var v = c + g * (1 - c);
        var f = 0;
        if (v > 0) {
            f = c / v;
        }
        return [ hcg[0], f * 100, v * 100 ];
    };
    convert2.hcg.hsl = function(hcg) {
        var c = hcg[1] / 100;
        var g = hcg[2] / 100;
        var l = g * (1 - c) + .5 * c;
        var s = 0;
        if (l > 0 && l < .5) {
            s = c / (2 * l);
        } else if (l >= .5 && l < 1) {
            s = c / (2 * (1 - l));
        }
        return [ hcg[0], s * 100, l * 100 ];
    };
    convert2.hcg.hwb = function(hcg) {
        var c = hcg[1] / 100;
        var g = hcg[2] / 100;
        var v = c + g * (1 - c);
        return [ hcg[0], (v - c) * 100, (1 - v) * 100 ];
    };
    convert2.hwb.hcg = function(hwb) {
        var w = hwb[1] / 100;
        var b = hwb[2] / 100;
        var v = 1 - b;
        var c = v - w;
        var g = 0;
        if (c < 1) {
            g = (v - c) / (1 - c);
        }
        return [ hwb[0], c * 100, g * 100 ];
    };
    convert2.apple.rgb = function(apple) {
        return [ apple[0] / 65535 * 255, apple[1] / 65535 * 255, apple[2] / 65535 * 255 ];
    };
    convert2.rgb.apple = function(rgb) {
        return [ rgb[0] / 255 * 65535, rgb[1] / 255 * 65535, rgb[2] / 255 * 65535 ];
    };
    convert2.gray.rgb = function(args) {
        return [ args[0] / 100 * 255, args[0] / 100 * 255, args[0] / 100 * 255 ];
    };
    convert2.gray.hsl = convert2.gray.hsv = function(args) {
        return [ 0, 0, args[0] ];
    };
    convert2.gray.hwb = function(gray) {
        return [ 0, 100, gray[0] ];
    };
    convert2.gray.cmyk = function(gray) {
        return [ 0, 0, 0, gray[0] ];
    };
    convert2.gray.lab = function(gray) {
        return [ gray[0], 0, 0 ];
    };
    convert2.gray.hex = function(gray) {
        var val = Math.round(gray[0] / 100 * 255) & 255;
        var integer = (val << 16) + (val << 8) + val;
        var string = integer.toString(16).toUpperCase();
        return "000000".substring(string.length) + string;
    };
    convert2.rgb.gray = function(rgb) {
        var val = (rgb[0] + rgb[1] + rgb[2]) / 3;
        return [ val / 255 * 100 ];
    };
}));

function buildGraph() {
    var graph = {};
    var models2 = Object.keys(conversions);
    for (var len = models2.length, i = 0; i < len; i++) {
        graph[models2[i]] = {
            distance: -1,
            parent: null
        };
    }
    return graph;
}

function deriveBFS(fromModel) {
    var graph = buildGraph();
    var queue = [ fromModel ];
    graph[fromModel].distance = 0;
    while (queue.length) {
        var current = queue.pop();
        var adjacents = Object.keys(conversions[current]);
        for (var len = adjacents.length, i = 0; i < len; i++) {
            var adjacent = adjacents[i];
            var node = graph[adjacent];
            if (node.distance === -1) {
                node.distance = graph[current].distance + 1;
                node.parent = current;
                queue.unshift(adjacent);
            }
        }
    }
    return graph;
}

function link$4(from, to) {
    return function(args) {
        return to(from(args));
    };
}

function wrapConversion(toModel, graph) {
    var path = [ graph[toModel].parent, toModel ];
    var fn = conversions[graph[toModel].parent][toModel];
    var cur = graph[toModel].parent;
    while (graph[cur].parent) {
        path.unshift(graph[cur].parent);
        fn = link$4(conversions[graph[cur].parent][cur], fn);
        cur = graph[cur].parent;
    }
    fn.conversion = path;
    return fn;
}

var route = function(fromModel) {
    var graph = deriveBFS(fromModel);
    var conversion = {};
    var models2 = Object.keys(graph);
    for (var len = models2.length, i = 0; i < len; i++) {
        var toModel = models2[i];
        var node = graph[toModel];
        if (node.parent === null) {
            continue;
        }
        conversion[toModel] = wrapConversion(toModel, graph);
    }
    return conversion;
};

var convert = {};

var models = Object.keys(conversions);

function wrapRaw(fn) {
    var wrappedFn = function(args) {
        if (args === void 0 || args === null) {
            return args;
        }
        if (arguments.length > 1) {
            args = Array.prototype.slice.call(arguments);
        }
        return fn(args);
    };
    if ("conversion" in fn) {
        wrappedFn.conversion = fn.conversion;
    }
    return wrappedFn;
}

function wrapRounded(fn) {
    var wrappedFn = function(args) {
        if (args === void 0 || args === null) {
            return args;
        }
        if (arguments.length > 1) {
            args = Array.prototype.slice.call(arguments);
        }
        var result = fn(args);
        if (typeof result === "object") {
            for (var len = result.length, i = 0; i < len; i++) {
                result[i] = Math.round(result[i]);
            }
        }
        return result;
    };
    if ("conversion" in fn) {
        wrappedFn.conversion = fn.conversion;
    }
    return wrappedFn;
}

models.forEach((function(fromModel) {
    convert[fromModel] = {};
    Object.defineProperty(convert[fromModel], "channels", {
        value: conversions[fromModel].channels
    });
    Object.defineProperty(convert[fromModel], "labels", {
        value: conversions[fromModel].labels
    });
    var routes = route(fromModel);
    var routeModels = Object.keys(routes);
    routeModels.forEach((function(toModel) {
        var fn = routes[toModel];
        convert[fromModel][toModel] = wrapRounded(fn);
        convert[fromModel][toModel].raw = wrapRaw(fn);
    }));
}));

var colorConvert = convert;

function createCommonjsModule$2(fn, basedir, module) {
    return module = {
        path: basedir,
        exports: {},
        require: function(path, base) {
            return commonjsRequire$2(path, base === void 0 || base === null ? module.path : base);
        }
    }, fn(module, module.exports), module.exports;
}

function commonjsRequire$2() {
    throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs");
}

var ansiStyles = createCommonjsModule$2((function(module) {
    const wrapAnsi16 = (fn, offset) => function() {
        const code = fn.apply(colorConvert, arguments);
        return `[${code + offset}m`;
    };
    const wrapAnsi256 = (fn, offset) => function() {
        const code = fn.apply(colorConvert, arguments);
        return `[${38 + offset};5;${code}m`;
    };
    const wrapAnsi16m = (fn, offset) => function() {
        const rgb = fn.apply(colorConvert, arguments);
        return `[${38 + offset};2;${rgb[0]};${rgb[1]};${rgb[2]}m`;
    };
    function assembleStyles() {
        const codes = new Map;
        const styles = {
            modifier: {
                reset: [ 0, 0 ],
                bold: [ 1, 22 ],
                dim: [ 2, 22 ],
                italic: [ 3, 23 ],
                underline: [ 4, 24 ],
                inverse: [ 7, 27 ],
                hidden: [ 8, 28 ],
                strikethrough: [ 9, 29 ]
            },
            color: {
                black: [ 30, 39 ],
                red: [ 31, 39 ],
                green: [ 32, 39 ],
                yellow: [ 33, 39 ],
                blue: [ 34, 39 ],
                magenta: [ 35, 39 ],
                cyan: [ 36, 39 ],
                white: [ 37, 39 ],
                gray: [ 90, 39 ],
                redBright: [ 91, 39 ],
                greenBright: [ 92, 39 ],
                yellowBright: [ 93, 39 ],
                blueBright: [ 94, 39 ],
                magentaBright: [ 95, 39 ],
                cyanBright: [ 96, 39 ],
                whiteBright: [ 97, 39 ]
            },
            bgColor: {
                bgBlack: [ 40, 49 ],
                bgRed: [ 41, 49 ],
                bgGreen: [ 42, 49 ],
                bgYellow: [ 43, 49 ],
                bgBlue: [ 44, 49 ],
                bgMagenta: [ 45, 49 ],
                bgCyan: [ 46, 49 ],
                bgWhite: [ 47, 49 ],
                bgBlackBright: [ 100, 49 ],
                bgRedBright: [ 101, 49 ],
                bgGreenBright: [ 102, 49 ],
                bgYellowBright: [ 103, 49 ],
                bgBlueBright: [ 104, 49 ],
                bgMagentaBright: [ 105, 49 ],
                bgCyanBright: [ 106, 49 ],
                bgWhiteBright: [ 107, 49 ]
            }
        };
        styles.color.grey = styles.color.gray;
        for (const groupName of Object.keys(styles)) {
            const group = styles[groupName];
            for (const styleName of Object.keys(group)) {
                const style = group[styleName];
                styles[styleName] = {
                    open: `[${style[0]}m`,
                    close: `[${style[1]}m`
                };
                group[styleName] = styles[styleName];
                codes.set(style[0], style[1]);
            }
            Object.defineProperty(styles, groupName, {
                value: group,
                enumerable: false
            });
            Object.defineProperty(styles, "codes", {
                value: codes,
                enumerable: false
            });
        }
        const ansi2ansi = n => n;
        const rgb2rgb = (r, g, b) => [ r, g, b ];
        styles.color.close = "[39m";
        styles.bgColor.close = "[49m";
        styles.color.ansi = {
            ansi: wrapAnsi16(ansi2ansi, 0)
        };
        styles.color.ansi256 = {
            ansi256: wrapAnsi256(ansi2ansi, 0)
        };
        styles.color.ansi16m = {
            rgb: wrapAnsi16m(rgb2rgb, 0)
        };
        styles.bgColor.ansi = {
            ansi: wrapAnsi16(ansi2ansi, 10)
        };
        styles.bgColor.ansi256 = {
            ansi256: wrapAnsi256(ansi2ansi, 10)
        };
        styles.bgColor.ansi16m = {
            rgb: wrapAnsi16m(rgb2rgb, 10)
        };
        for (let key of Object.keys(colorConvert)) {
            if (typeof colorConvert[key] !== "object") {
                continue;
            }
            const suite = colorConvert[key];
            if (key === "ansi16") {
                key = "ansi";
            }
            if ("ansi16" in suite) {
                styles.color.ansi[key] = wrapAnsi16(suite.ansi16, 0);
                styles.bgColor.ansi[key] = wrapAnsi16(suite.ansi16, 10);
            }
            if ("ansi256" in suite) {
                styles.color.ansi256[key] = wrapAnsi256(suite.ansi256, 0);
                styles.bgColor.ansi256[key] = wrapAnsi256(suite.ansi256, 10);
            }
            if ("rgb" in suite) {
                styles.color.ansi16m[key] = wrapAnsi16m(suite.rgb, 0);
                styles.bgColor.ansi16m[key] = wrapAnsi16m(suite.rgb, 10);
            }
        }
        return styles;
    }
    Object.defineProperty(module, "exports", {
        enumerable: true,
        get: assembleStyles
    });
}));

var browser$2 = {
    stdout: false,
    stderr: false
};

function createCommonjsModule$1(fn, basedir, module) {
    return module = {
        path: basedir,
        exports: {},
        require: function(path, base) {
            return commonjsRequire$1(path, base === void 0 || base === null ? module.path : base);
        }
    }, fn(module, module.exports), module.exports;
}

function commonjsRequire$1() {
    throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs");
}

const TEMPLATE_REGEX = /(?:\\(u[a-f\d]{4}|x[a-f\d]{2}|.))|(?:\{(~)?(\w+(?:\([^)]*\))?(?:\.\w+(?:\([^)]*\))?)*)(?:[ \t]|(?=\r?\n)))|(\})|((?:.|[\r\n\f])+?)/gi;

const STYLE_REGEX = /(?:^|\.)(\w+)(?:\(([^)]*)\))?/g;

const STRING_REGEX = /^(['"])((?:\\.|(?!\1)[^\\])*)\1$/;

const ESCAPE_REGEX = /\\(u[a-f\d]{4}|x[a-f\d]{2}|.)|([^\\])/gi;

const ESCAPES = new Map([ [ "n", "\n" ], [ "r", "\r" ], [ "t", "\t" ], [ "b", "\b" ], [ "f", "\f" ], [ "v", "\v" ], [ "0", "\0" ], [ "\\", "\\" ], [ "e", "" ], [ "a", "" ] ]);

function unescape(c) {
    if (c[0] === "u" && c.length === 5 || c[0] === "x" && c.length === 3) {
        return String.fromCharCode(parseInt(c.slice(1), 16));
    }
    return ESCAPES.get(c) || c;
}

function parseArguments(name, args) {
    const results = [];
    const chunks = args.trim().split(/\s*,\s*/g);
    let matches;
    for (const chunk of chunks) {
        if (!isNaN(chunk)) {
            results.push(Number(chunk));
        } else if (matches = chunk.match(STRING_REGEX)) {
            results.push(matches[2].replace(ESCAPE_REGEX, ((m, escape, chr) => escape ? unescape(escape) : chr)));
        } else {
            throw new Error(`Invalid Chalk template style argument: ${chunk} (in style '${name}')`);
        }
    }
    return results;
}

function parseStyle(style) {
    STYLE_REGEX.lastIndex = 0;
    const results = [];
    let matches;
    while ((matches = STYLE_REGEX.exec(style)) !== null) {
        const name = matches[1];
        if (matches[2]) {
            const args = parseArguments(name, matches[2]);
            results.push([ name ].concat(args));
        } else {
            results.push([ name ]);
        }
    }
    return results;
}

function buildStyle(chalk2, styles) {
    const enabled = {};
    for (const layer of styles) {
        for (const style of layer.styles) {
            enabled[style[0]] = layer.inverse ? null : style.slice(1);
        }
    }
    let current = chalk2;
    for (const styleName of Object.keys(enabled)) {
        if (Array.isArray(enabled[styleName])) {
            if (!(styleName in current)) {
                throw new Error(`Unknown Chalk style: ${styleName}`);
            }
            if (enabled[styleName].length > 0) {
                current = current[styleName].apply(current, enabled[styleName]);
            } else {
                current = current[styleName];
            }
        }
    }
    return current;
}

var templates = (chalk2, tmp) => {
    const styles = [];
    const chunks = [];
    let chunk = [];
    tmp.replace(TEMPLATE_REGEX, ((m, escapeChar, inverse, style, close, chr) => {
        if (escapeChar) {
            chunk.push(unescape(escapeChar));
        } else if (style) {
            const str = chunk.join("");
            chunk = [];
            chunks.push(styles.length === 0 ? str : buildStyle(chalk2, styles)(str));
            styles.push({
                inverse: inverse,
                styles: parseStyle(style)
            });
        } else if (close) {
            if (styles.length === 0) {
                throw new Error("Found extraneous } in Chalk template literal");
            }
            chunks.push(buildStyle(chalk2, styles)(chunk.join("")));
            chunk = [];
            styles.pop();
        } else {
            chunk.push(chr);
        }
    }));
    chunks.push(chunk.join(""));
    if (styles.length > 0) {
        const errMsg = `Chalk template literal is missing ${styles.length} closing bracket${styles.length === 1 ? "" : "s"} (\`}\`)`;
        throw new Error(errMsg);
    }
    return chunks.join("");
};

var chalk$1 = createCommonjsModule$1((function(module) {
    const stdoutColor = browser$2.stdout;
    const levelMapping = [ "ansi", "ansi", "ansi256", "ansi16m" ];
    const skipModels = new Set([ "gray" ]);
    const styles = Object.create(null);
    function applyOptions(obj, options) {
        options = options || {};
        const scLevel = 0;
        obj.level = options.level === void 0 ? scLevel : options.level;
        obj.enabled = "enabled" in options ? options.enabled : obj.level > 0;
    }
    function Chalk(options) {
        if (!this || !(this instanceof Chalk) || this.template) {
            const chalk2 = {};
            applyOptions(chalk2, options);
            chalk2.template = function() {
                const args = [].slice.call(arguments);
                return chalkTag.apply(null, [ chalk2.template ].concat(args));
            };
            Object.setPrototypeOf(chalk2, Chalk.prototype);
            Object.setPrototypeOf(chalk2.template, chalk2);
            chalk2.template.constructor = Chalk;
            return chalk2.template;
        }
        applyOptions(this, options);
    }
    for (const key of Object.keys(ansiStyles)) {
        ansiStyles[key].closeRe = new RegExp(escapeStringRegexp(ansiStyles[key].close), "g");
        styles[key] = {
            get() {
                const codes = ansiStyles[key];
                return build.call(this, this._styles ? this._styles.concat(codes) : [ codes ], this._empty, key);
            }
        };
    }
    styles.visible = {
        get() {
            return build.call(this, this._styles || [], true, "visible");
        }
    };
    ansiStyles.color.closeRe = new RegExp(escapeStringRegexp(ansiStyles.color.close), "g");
    for (const model of Object.keys(ansiStyles.color.ansi)) {
        if (skipModels.has(model)) {
            continue;
        }
        styles[model] = {
            get() {
                const level = this.level;
                return function() {
                    const open = ansiStyles.color[levelMapping[level]][model].apply(null, arguments);
                    const codes = {
                        open: open,
                        close: ansiStyles.color.close,
                        closeRe: ansiStyles.color.closeRe
                    };
                    return build.call(this, this._styles ? this._styles.concat(codes) : [ codes ], this._empty, model);
                };
            }
        };
    }
    ansiStyles.bgColor.closeRe = new RegExp(escapeStringRegexp(ansiStyles.bgColor.close), "g");
    for (const model of Object.keys(ansiStyles.bgColor.ansi)) {
        if (skipModels.has(model)) {
            continue;
        }
        const bgModel = "bg" + model[0].toUpperCase() + model.slice(1);
        styles[bgModel] = {
            get() {
                const level = this.level;
                return function() {
                    const open = ansiStyles.bgColor[levelMapping[level]][model].apply(null, arguments);
                    const codes = {
                        open: open,
                        close: ansiStyles.bgColor.close,
                        closeRe: ansiStyles.bgColor.closeRe
                    };
                    return build.call(this, this._styles ? this._styles.concat(codes) : [ codes ], this._empty, model);
                };
            }
        };
    }
    const proto = Object.defineProperties((() => {}), styles);
    function build(_styles, _empty, key) {
        const builder = function() {
            return applyStyle.apply(builder, arguments);
        };
        builder._styles = _styles;
        builder._empty = _empty;
        const self = this;
        Object.defineProperty(builder, "level", {
            enumerable: true,
            get() {
                return self.level;
            },
            set(level) {
                self.level = level;
            }
        });
        Object.defineProperty(builder, "enabled", {
            enumerable: true,
            get() {
                return self.enabled;
            },
            set(enabled) {
                self.enabled = enabled;
            }
        });
        builder.hasGrey = this.hasGrey || key === "gray" || key === "grey";
        builder.__proto__ = proto;
        return builder;
    }
    function applyStyle() {
        const args = arguments;
        const argsLen = args.length;
        let str = String(arguments[0]);
        if (argsLen === 0) {
            return "";
        }
        if (argsLen > 1) {
            for (let a = 1; a < argsLen; a++) {
                str += " " + args[a];
            }
        }
        if (!this.enabled || this.level <= 0 || !str) {
            return this._empty ? "" : str;
        }
        const originalDim = ansiStyles.dim.open;
        for (const code of this._styles.slice().reverse()) {
            str = code.open + str.replace(code.closeRe, code.open) + code.close;
            str = str.replace(/\r?\n/g, `${code.close}$&${code.open}`);
        }
        ansiStyles.dim.open = originalDim;
        return str;
    }
    function chalkTag(chalk2, strings) {
        if (!Array.isArray(strings)) {
            return [].slice.call(arguments, 1).join(" ");
        }
        const args = [].slice.call(arguments, 2);
        const parts = [ strings.raw[0] ];
        for (let i = 1; i < strings.length; i++) {
            parts.push(String(args[i - 1]).replace(/[{}\\]/g, "\\$&"));
            parts.push(String(strings.raw[i]));
        }
        return templates(chalk2, parts.join(""));
    }
    Object.defineProperties(Chalk.prototype, styles);
    module.exports = Chalk();
    module.exports.supportsColor = stdoutColor;
    module.exports.default = module.exports;
}));

chalk$1.supportsColor;

var commonjsGlobal$1 = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};

var FUNC_ERROR_TEXT = "Expected a function";

var HASH_UNDEFINED = "__lodash_hash_undefined__";

var INFINITY$1 = 1 / 0;

var funcTag = "[object Function]", genTag = "[object GeneratorFunction]", symbolTag$1 = "[object Symbol]";

var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, reIsPlainProp = /^\w*$/, reLeadingDot = /^\./, rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

var reEscapeChar = /\\(\\)?/g;

var reIsHostCtor = /^\[object .+?Constructor\]$/;

var freeGlobal$1 = typeof commonjsGlobal$1 == "object" && commonjsGlobal$1 && commonjsGlobal$1.Object === Object && commonjsGlobal$1;

var freeSelf$1 = typeof self == "object" && self && self.Object === Object && self;

var root$2 = freeGlobal$1 || freeSelf$1 || Function("return this")();

function getValue(object, key) {
    return object == null ? void 0 : object[key];
}

function isHostObject(value) {
    var result = false;
    if (value != null && typeof value.toString != "function") {
        try {
            result = !!(value + "");
        } catch (e) {}
    }
    return result;
}

var arrayProto = Array.prototype, funcProto = Function.prototype, objectProto$1 = Object.prototype;

var coreJsData = root$2["__core-js_shared__"];

var maskSrcKey = function() {
    var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
    return uid ? "Symbol(src)_1." + uid : "";
}();

var funcToString = funcProto.toString;

var hasOwnProperty = objectProto$1.hasOwnProperty;

var objectToString$1 = objectProto$1.toString;

var reIsNative = RegExp("^" + funcToString.call(hasOwnProperty).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$");

var Symbol$2 = root$2.Symbol, splice = arrayProto.splice;

var Map$1 = getNative(root$2, "Map"), nativeCreate = getNative(Object, "create");

var symbolProto$1 = Symbol$2 ? Symbol$2.prototype : void 0, symbolToString$1 = symbolProto$1 ? symbolProto$1.toString : void 0;

function Hash(entries) {
    var index = -1, length = entries ? entries.length : 0;
    this.clear();
    while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
    }
}

function hashClear() {
    this.__data__ = nativeCreate ? nativeCreate(null) : {};
}

function hashDelete(key) {
    return this.has(key) && delete this.__data__[key];
}

function hashGet(key) {
    var data = this.__data__;
    if (nativeCreate) {
        var result = data[key];
        return result === HASH_UNDEFINED ? void 0 : result;
    }
    return hasOwnProperty.call(data, key) ? data[key] : void 0;
}

function hashHas(key) {
    var data = this.__data__;
    return nativeCreate ? data[key] !== void 0 : hasOwnProperty.call(data, key);
}

function hashSet(key, value) {
    var data = this.__data__;
    data[key] = nativeCreate && value === void 0 ? HASH_UNDEFINED : value;
    return this;
}

Hash.prototype.clear = hashClear;

Hash.prototype["delete"] = hashDelete;

Hash.prototype.get = hashGet;

Hash.prototype.has = hashHas;

Hash.prototype.set = hashSet;

function ListCache(entries) {
    var index = -1, length = entries ? entries.length : 0;
    this.clear();
    while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
    }
}

function listCacheClear() {
    this.__data__ = [];
}

function listCacheDelete(key) {
    var data = this.__data__, index = assocIndexOf(data, key);
    if (index < 0) {
        return false;
    }
    var lastIndex = data.length - 1;
    if (index == lastIndex) {
        data.pop();
    } else {
        splice.call(data, index, 1);
    }
    return true;
}

function listCacheGet(key) {
    var data = this.__data__, index = assocIndexOf(data, key);
    return index < 0 ? void 0 : data[index][1];
}

function listCacheHas(key) {
    return assocIndexOf(this.__data__, key) > -1;
}

function listCacheSet(key, value) {
    var data = this.__data__, index = assocIndexOf(data, key);
    if (index < 0) {
        data.push([ key, value ]);
    } else {
        data[index][1] = value;
    }
    return this;
}

ListCache.prototype.clear = listCacheClear;

ListCache.prototype["delete"] = listCacheDelete;

ListCache.prototype.get = listCacheGet;

ListCache.prototype.has = listCacheHas;

ListCache.prototype.set = listCacheSet;

function MapCache(entries) {
    var index = -1, length = entries ? entries.length : 0;
    this.clear();
    while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
    }
}

function mapCacheClear() {
    this.__data__ = {
        hash: new Hash,
        map: new (Map$1 || ListCache),
        string: new Hash
    };
}

function mapCacheDelete(key) {
    return getMapData(this, key)["delete"](key);
}

function mapCacheGet(key) {
    return getMapData(this, key).get(key);
}

function mapCacheHas(key) {
    return getMapData(this, key).has(key);
}

function mapCacheSet(key, value) {
    getMapData(this, key).set(key, value);
    return this;
}

MapCache.prototype.clear = mapCacheClear;

MapCache.prototype["delete"] = mapCacheDelete;

MapCache.prototype.get = mapCacheGet;

MapCache.prototype.has = mapCacheHas;

MapCache.prototype.set = mapCacheSet;

function assocIndexOf(array, key) {
    var length = array.length;
    while (length--) {
        if (eq(array[length][0], key)) {
            return length;
        }
    }
    return -1;
}

function baseGet(object, path) {
    path = isKey(path, object) ? [ path ] : castPath(path);
    var index = 0, length = path.length;
    while (object != null && index < length) {
        object = object[toKey(path[index++])];
    }
    return index && index == length ? object : void 0;
}

function baseIsNative(value) {
    if (!isObject$3(value) || isMasked(value)) {
        return false;
    }
    var pattern = isFunction$1(value) || isHostObject(value) ? reIsNative : reIsHostCtor;
    return pattern.test(toSource(value));
}

function baseToString$1(value) {
    if (typeof value == "string") {
        return value;
    }
    if (isSymbol$1(value)) {
        return symbolToString$1 ? symbolToString$1.call(value) : "";
    }
    var result = value + "";
    return result == "0" && 1 / value == -INFINITY$1 ? "-0" : result;
}

function castPath(value) {
    return isArray(value) ? value : stringToPath(value);
}

function getMapData(map, key) {
    var data = map.__data__;
    return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
}

function getNative(object, key) {
    var value = getValue(object, key);
    return baseIsNative(value) ? value : void 0;
}

function isKey(value, object) {
    if (isArray(value)) {
        return false;
    }
    var type = typeof value;
    if (type == "number" || type == "symbol" || type == "boolean" || value == null || isSymbol$1(value)) {
        return true;
    }
    return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object(object);
}

function isKeyable(value) {
    var type = typeof value;
    return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
}

function isMasked(func) {
    return !!maskSrcKey && maskSrcKey in func;
}

var stringToPath = memoize((function(string) {
    string = toString$1(string);
    var result = [];
    if (reLeadingDot.test(string)) {
        result.push("");
    }
    string.replace(rePropName, (function(match, number, quote, string2) {
        result.push(quote ? string2.replace(reEscapeChar, "$1") : number || match);
    }));
    return result;
}));

function toKey(value) {
    if (typeof value == "string" || isSymbol$1(value)) {
        return value;
    }
    var result = value + "";
    return result == "0" && 1 / value == -INFINITY$1 ? "-0" : result;
}

function toSource(func) {
    if (func != null) {
        try {
            return funcToString.call(func);
        } catch (e) {}
        try {
            return func + "";
        } catch (e) {}
    }
    return "";
}

function memoize(func, resolver) {
    if (typeof func != "function" || resolver && typeof resolver != "function") {
        throw new TypeError(FUNC_ERROR_TEXT);
    }
    var memoized = function() {
        var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
        if (cache.has(key)) {
            return cache.get(key);
        }
        var result = func.apply(this, args);
        memoized.cache = cache.set(key, result);
        return result;
    };
    memoized.cache = new (memoize.Cache || MapCache);
    return memoized;
}

memoize.Cache = MapCache;

function eq(value, other) {
    return value === other || value !== value && other !== other;
}

var isArray = Array.isArray;

function isFunction$1(value) {
    var tag = isObject$3(value) ? objectToString$1.call(value) : "";
    return tag == funcTag || tag == genTag;
}

function isObject$3(value) {
    var type = typeof value;
    return !!value && (type == "object" || type == "function");
}

function isObjectLike$1(value) {
    return !!value && typeof value == "object";
}

function isSymbol$1(value) {
    return typeof value == "symbol" || isObjectLike$1(value) && objectToString$1.call(value) == symbolTag$1;
}

function toString$1(value) {
    return value == null ? "" : baseToString$1(value);
}

function get(object, path, defaultValue) {
    var result = object == null ? void 0 : baseGet(object, path);
    return result === void 0 ? defaultValue : result;
}

var lodash_get = get;

const tokenTypes = [ {
    regex: /^\s+/,
    tokenType: "WHITESPACE"
}, {
    regex: /^[{}]/,
    tokenType: "BRACE"
}, {
    regex: /^[[\]]/,
    tokenType: "BRACKET"
}, {
    regex: /^:/,
    tokenType: "COLON"
}, {
    regex: /^,/,
    tokenType: "COMMA"
}, {
    regex: /^-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/i,
    tokenType: "NUMBER_LITERAL"
}, {
    regex: /^"(?:\\.|[^"\\])*"(?=\s*:)/,
    tokenType: "STRING_KEY"
}, {
    regex: /^"(?:\\.|[^"\\])*"/,
    tokenType: "STRING_LITERAL"
}, {
    regex: /^true|^false/,
    tokenType: "BOOLEAN_LITERAL"
}, {
    regex: /^null/,
    tokenType: "NULL_LITERAL"
} ];

var getTokens = function getTokens2(json, options = {}) {
    let input;
    if (options.pretty) {
        const inputObj = typeof json === "string" ? JSON.parse(json) : json;
        input = JSON.stringify(inputObj, null, 2);
    } else {
        input = typeof json === "string" ? json : JSON.stringify(json);
    }
    let tokens = [];
    let foundToken;
    do {
        foundToken = false;
        for (let i = 0; i < tokenTypes.length; i++) {
            const match = tokenTypes[i].regex.exec(input);
            if (match) {
                tokens.push({
                    type: tokenTypes[i].tokenType,
                    value: match[0]
                });
                input = input.substring(match[0].length);
                foundToken = true;
                break;
            }
        }
    } while (_allTokensAnalyzed(input, foundToken));
    return tokens;
};

function _allTokensAnalyzed(input, foundToken) {
    const safeInput = input || {};
    const inputLength = safeInput.length;
    return inputLength > 0 && foundToken;
}

var lexer = {
    getTokens: getTokens
};

const defaultColors = {
    BRACE: "gray",
    BRACKET: "gray",
    COLON: "gray",
    COMMA: "gray",
    STRING_KEY: "magenta",
    STRING_LITERAL: "yellow",
    NUMBER_LITERAL: "green",
    BOOLEAN_LITERAL: "cyan",
    NULL_LITERAL: "white"
};

var colorize = function colorize2(tokens, options = {}) {
    const colors = options.colors || {};
    return tokens.reduce(((acc, token) => {
        const colorKey = colors[token.type] || defaultColors[token.type];
        const colorFn = colorKey && colorKey[0] === "#" ? chalk$1.hex(colorKey) : lodash_get(chalk$1, colorKey);
        return acc + (colorFn ? colorFn(token.value) : token.value);
    }), "");
};

var colorizer = {
    colorize: colorize
};

var lib = function colorizeJson(json, options) {
    return colorizer.colorize(lexer.getTokens(json, options), options);
};

function defaultSetTimout$1() {
    throw new Error("setTimeout has not been defined");
}

function defaultClearTimeout$1() {
    throw new Error("clearTimeout has not been defined");
}

var cachedSetTimeout$1 = defaultSetTimout$1;

var cachedClearTimeout$1 = defaultClearTimeout$1;

var globalContext$1;

if (typeof window !== "undefined") {
    globalContext$1 = window;
} else if (typeof self !== "undefined") {
    globalContext$1 = self;
} else {
    globalContext$1 = {};
}

if (typeof globalContext$1.setTimeout === "function") {
    cachedSetTimeout$1 = setTimeout;
}

if (typeof globalContext$1.clearTimeout === "function") {
    cachedClearTimeout$1 = clearTimeout;
}

function runTimeout$1(fun) {
    if (cachedSetTimeout$1 === setTimeout) {
        return setTimeout(fun, 0);
    }
    if ((cachedSetTimeout$1 === defaultSetTimout$1 || !cachedSetTimeout$1) && setTimeout) {
        cachedSetTimeout$1 = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        return cachedSetTimeout$1(fun, 0);
    } catch (e) {
        try {
            return cachedSetTimeout$1.call(null, fun, 0);
        } catch (e2) {
            return cachedSetTimeout$1.call(this, fun, 0);
        }
    }
}

function runClearTimeout$1(marker) {
    if (cachedClearTimeout$1 === clearTimeout) {
        return clearTimeout(marker);
    }
    if ((cachedClearTimeout$1 === defaultClearTimeout$1 || !cachedClearTimeout$1) && clearTimeout) {
        cachedClearTimeout$1 = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        return cachedClearTimeout$1(marker);
    } catch (e) {
        try {
            return cachedClearTimeout$1.call(null, marker);
        } catch (e2) {
            return cachedClearTimeout$1.call(this, marker);
        }
    }
}

var queue$1 = [];

var draining$1 = false;

var currentQueue$1;

var queueIndex$1 = -1;

function cleanUpNextTick$1() {
    if (!draining$1 || !currentQueue$1) {
        return;
    }
    draining$1 = false;
    if (currentQueue$1.length) {
        queue$1 = currentQueue$1.concat(queue$1);
    } else {
        queueIndex$1 = -1;
    }
    if (queue$1.length) {
        drainQueue$1();
    }
}

function drainQueue$1() {
    if (draining$1) {
        return;
    }
    var timeout = runTimeout$1(cleanUpNextTick$1);
    draining$1 = true;
    var len = queue$1.length;
    while (len) {
        currentQueue$1 = queue$1;
        queue$1 = [];
        while (++queueIndex$1 < len) {
            if (currentQueue$1) {
                currentQueue$1[queueIndex$1].run();
            }
        }
        queueIndex$1 = -1;
        len = queue$1.length;
    }
    currentQueue$1 = null;
    draining$1 = false;
    runClearTimeout$1(timeout);
}

function nextTick$1(fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue$1.push(new Item$1(fun, args));
    if (queue$1.length === 1 && !draining$1) {
        runTimeout$1(drainQueue$1);
    }
}

function Item$1(fun, array) {
    this.fun = fun;
    this.array = array;
}

Item$1.prototype.run = function() {
    this.fun.apply(null, this.array);
};

var title$1 = "browser";

var platform$1 = "browser";

var browser$1 = true;

var argv$1 = [];

var version$1 = "";

var versions$1 = {};

var release$1 = {};

var config$2 = {};

function noop$1() {}

var on$1 = noop$1;

var addListener$1 = noop$1;

var once$1 = noop$1;

var off$1 = noop$1;

var removeListener$1 = noop$1;

var removeAllListeners$1 = noop$1;

var emit$1 = noop$1;

function binding$1(name) {
    throw new Error("process.binding is not supported");
}

function cwd$1() {
    return "/";
}

function chdir$1(dir) {
    throw new Error("process.chdir is not supported");
}

function umask$1() {
    return 0;
}

var performance$2 = globalContext$1.performance || {};

var performanceNow$1 = performance$2.now || performance$2.mozNow || performance$2.msNow || performance$2.oNow || performance$2.webkitNow || function() {
    return (new Date).getTime();
};

function hrtime$1(previousTimestamp) {
    var clocktime = performanceNow$1.call(performance$2) * .001;
    var seconds = Math.floor(clocktime);
    var nanoseconds = Math.floor(clocktime % 1 * 1e9);
    if (previousTimestamp) {
        seconds = seconds - previousTimestamp[0];
        nanoseconds = nanoseconds - previousTimestamp[1];
        if (nanoseconds < 0) {
            seconds--;
            nanoseconds += 1e9;
        }
    }
    return [ seconds, nanoseconds ];
}

var startTime$1 = new Date;

function uptime$1() {
    var currentTime = new Date;
    var dif = currentTime - startTime$1;
    return dif / 1e3;
}

var process$1 = {
    nextTick: nextTick$1,
    title: title$1,
    browser: browser$1,
    env: {
        NODE_ENV: "production"
    },
    argv: argv$1,
    version: version$1,
    versions: versions$1,
    on: on$1,
    addListener: addListener$1,
    once: once$1,
    off: off$1,
    removeListener: removeListener$1,
    removeAllListeners: removeAllListeners$1,
    emit: emit$1,
    binding: binding$1,
    cwd: cwd$1,
    chdir: chdir$1,
    umask: umask$1,
    hrtime: hrtime$1,
    platform: platform$1,
    release: release$1,
    config: config$2,
    uptime: uptime$1
};

const ESC = "[";

const OSC = "]";

const BEL = "";

const SEP = ";";

const ansiEscapes = {};

ansiEscapes.cursorTo = (x, y) => {
    if (typeof x !== "number") {
        throw new TypeError("The `x` argument is required");
    }
    if (typeof y !== "number") {
        return ESC + (x + 1) + "G";
    }
    return ESC + (y + 1) + ";" + (x + 1) + "H";
};

ansiEscapes.cursorMove = (x, y) => {
    if (typeof x !== "number") {
        throw new TypeError("The `x` argument is required");
    }
    let returnValue = "";
    if (x < 0) {
        returnValue += ESC + -x + "D";
    } else if (x > 0) {
        returnValue += ESC + x + "C";
    }
    if (y < 0) {
        returnValue += ESC + -y + "A";
    } else if (y > 0) {
        returnValue += ESC + y + "B";
    }
    return returnValue;
};

ansiEscapes.cursorUp = (count = 1) => ESC + count + "A";

ansiEscapes.cursorDown = (count = 1) => ESC + count + "B";

ansiEscapes.cursorForward = (count = 1) => ESC + count + "C";

ansiEscapes.cursorBackward = (count = 1) => ESC + count + "D";

ansiEscapes.cursorLeft = ESC + "G";

ansiEscapes.cursorSavePosition = ESC + "s";

ansiEscapes.cursorRestorePosition = ESC + "u";

ansiEscapes.cursorGetPosition = ESC + "6n";

ansiEscapes.cursorNextLine = ESC + "E";

ansiEscapes.cursorPrevLine = ESC + "F";

ansiEscapes.cursorHide = ESC + "?25l";

ansiEscapes.cursorShow = ESC + "?25h";

ansiEscapes.eraseLines = count => {
    let clear = "";
    for (let i = 0; i < count; i++) {
        clear += ansiEscapes.eraseLine + (i < count - 1 ? ansiEscapes.cursorUp() : "");
    }
    if (count) {
        clear += ansiEscapes.cursorLeft;
    }
    return clear;
};

ansiEscapes.eraseEndLine = ESC + "K";

ansiEscapes.eraseStartLine = ESC + "1K";

ansiEscapes.eraseLine = ESC + "2K";

ansiEscapes.eraseDown = ESC + "J";

ansiEscapes.eraseUp = ESC + "1J";

ansiEscapes.eraseScreen = ESC + "2J";

ansiEscapes.scrollUp = ESC + "S";

ansiEscapes.scrollDown = ESC + "T";

ansiEscapes.clearScreen = "c";

ansiEscapes.clearTerminal = `${ansiEscapes.eraseScreen}${ESC}3J${ESC}H`;

ansiEscapes.beep = BEL;

ansiEscapes.link = (text, url) => [ OSC, "8", SEP, SEP, url, BEL, text, OSC, "8", SEP, SEP, BEL ].join("");

ansiEscapes.image = (buffer, options = {}) => {
    let returnValue = `${OSC}1337;File=inline=1`;
    if (options.width) {
        returnValue += `;width=${options.width}`;
    }
    if (options.height) {
        returnValue += `;height=${options.height}`;
    }
    if (options.preserveAspectRatio === false) {
        returnValue += ";preserveAspectRatio=0";
    }
    return returnValue + ":" + buffer.toString("base64") + BEL;
};

ansiEscapes.iTerm = {
    setCwd: (cwd2 = process$1.cwd()) => `${OSC}50;CurrentDir=${cwd2}${BEL}`,
    annotation: (message, options = {}) => {
        let returnValue = `${OSC}1337;`;
        const hasX = typeof options.x !== "undefined";
        const hasY = typeof options.y !== "undefined";
        if ((hasX || hasY) && !(hasX && hasY && typeof options.length !== "undefined")) {
            throw new Error("`x`, `y` and `length` must be defined when `x` or `y` is defined");
        }
        message = message.replace(/\|/g, "");
        returnValue += options.isHidden ? "AddHiddenAnnotation=" : "AddAnnotation=";
        if (options.length > 0) {
            returnValue += (hasX ? [ message, options.length, options.x, options.y ] : [ options.length, message ]).join("|");
        } else {
            returnValue += message;
        }
        return returnValue + BEL;
    }
};

//NOTE: sucks that I am stuck with this instance of chalk
const {cursorHide: cursorHide, cursorShow: cursorShow, cursorPrevLine: cursorPrevLine, cursorBackward: cursorBackward, eraseLine: eraseLine, eraseDown: eraseDown, cursorSavePosition: cursorSavePosition, cursorRestorePosition: cursorRestorePosition} = ansiEscapes;

// enable browser support for chalk
const levels = {
    disabled: 0,
    basic16: 1,
    more256: 2,
    trueColor: 3
};

chalk$1.enabled = true;

chalk$1.level = levels.trueColor;

// json colors
const colors = {
    BRACE: "#BBBBBB",
    BRACKET: "#BBBBBB",
    COLON: "#BBBBBB",
    COMMA: "#BBBBBB",
    STRING_KEY: "#dcdcaa",
    STRING_LITERAL: "#ce9178",
    NUMBER_LITERAL: "#b5cea8",
    BOOLEAN_LITERAL: "#569cd6",
    NULL_LITERAL: "#569cd6"
};

const jsonColors = json => lib(json, {
    colors: colors,
    pretty: true
})
//const jsonColors = (obj) => JSON.stringify(obj,null,2);
;

const chalk = chalk$1;

const Link = {
    start: "˹",
    end: "˺",
    text: uri => {
        const startEndCharsRegex = new RegExp(Link.start + "|" + Link.end, "g");
        const cleanUri = uri.replace(startEndCharsRegex, "");
        return cleanUri;
    },
    create: (uri, color = "#fff") => chalk.hex(color)(`${Link.start}${uri}${Link.end}`)
};

const getCurrentService = async (prop = "name") => {
    const currentServiceId = localStorage.getItem("lastService");
    if (!currentServiceId || currentServiceId === "0") {
        if (prop === "all") return {
            id: 0,
            name: "~"
        };
        return "~";
    }
    const {result: [service]} = await fetch(`/service/read/${currentServiceId}`, {
        headers: {
            accept: "application/json",
            "content-type": "application/json"
        }
    }).then((x => x.json()));
    if (prop === "all") return service;
    return service[prop];
};

const addFile = async (target, source, service = {}) => {
    const currentService = await getCurrentService("all");
    const serviceName = service.name || currentService.name;
    const serviceId = service.id + "" || currentService.id;
    const body = JSON.stringify({
        name: serviceName,
        id: serviceId,
        operation: {
            name: "addFile",
            source: source,
            target: target
        }
    });
    try {
        return fetch("https://beta.fiug.dev/service/update/" + serviceId, {
            method: "POST",
            headers: {
                accept: "application/json",
                "content-type": "application/json"
            },
            body: body
        }).then((x => x.json()));
    } catch (e) {
        console.log(e);
        return {
            error: "failed to write file: " + target
        };
    }
};

const addFolder = async (target, service = {}) => {
    const currentService = await getCurrentService("all");
    const serviceName = service.name || currentService.name;
    const serviceId = service.id + "" || currentService.id;
    const body = JSON.stringify({
        name: serviceName,
        id: serviceId,
        operation: {
            name: "addFolder",
            target: target
        }
    });
    try {
        return fetch("https://beta.fiug.dev/service/update/" + serviceId, {
            method: "POST",
            headers: {
                accept: "application/json",
                "content-type": "application/json"
            },
            body: body
        }).then((x => x.json()));
    } catch (e) {
        console.log(e);
        return {
            error: "failed to create folder: " + target
        };
    }
};

// thanks @ https://github.com/sindresorhus/cli-spinners/blob/main/spinners.json
const spinners = {
    dots: {
        interval: 80,
        frames: [ "⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏" ]
    },
    aesthetic: {
        interval: 80,
        frames: [ "▰ ▱ ▱ ▱ ▱ ▱ ▱", "▰ ▰ ▱ ▱ ▱ ▱ ▱", "▰ ▰ ▰ ▱ ▱ ▱ ▱", "▰ ▰ ▰ ▰ ▱ ▱ ▱", "▰ ▰ ▰ ▰ ▰ ▱ ▱", "▰ ▰ ▰ ▰ ▰ ▰ ▱", "▰ ▰ ▰ ▰ ▰ ▰ ▰", "▰ ▱ ▱ ▱ ▱ ▱ ▱" ]
    },
    bouncingBall: {
        interval: 80,
        frames: [ "( ●    )", "(  ●   )", "(   ●  )", "(    ● )", "(     ●)", "(    ● )", "(   ●  )", "(  ●   )", "( ●    )", "(●     )" ]
    },
    pong: {
        interval: 80,
        frames: [ "▐⠂       ▌", "▐⠈       ▌", "▐ ⠂      ▌", "▐ ⠠      ▌", "▐  ⡀     ▌", "▐  ⠠     ▌", "▐   ⠂    ▌", "▐   ⠈    ▌", "▐    ⠂   ▌", "▐    ⠠   ▌", "▐     ⡀  ▌", "▐     ⠠  ▌", "▐      ⠂ ▌", "▐      ⠈ ▌", "▐       ⠂▌", "▐       ⠠▌", "▐       ⡀▌", "▐      ⠠ ▌", "▐      ⠂ ▌", "▐     ⠈  ▌", "▐     ⠂  ▌", "▐    ⠠   ▌", "▐    ⡀   ▌", "▐   ⠠    ▌", "▐   ⠂    ▌", "▐  ⠈     ▌", "▐  ⠂     ▌", "▐ ⠠      ▌", "▐ ⡀      ▌", "▐⠠       ▌" ]
    },
    point: {
        interval: 125,
        frames: [ "∙∙∙∙", "●∙∙∙", "∙●∙∙", "∙∙●∙", "∙∙∙●", "∙∙∙∙", "∙∙∙∙", "∙∙∙●", "∙∙●∙", "∙●∙∙", "●∙∙∙", "∙∙∙∙" ]
    }
};

class Spinner {
    constructor(args = {}) {
        const name = args.name || "point";
        const {interval: interval, frames: frames} = spinners[name];
        this.frames = frames;
        this.interval = interval;
        this.color = args.color || "#aff";
        this.doneColor = args.doneColor || "#aff";
        this.message = args.message || "loading";
        this.doneMsg = args.doneMsg || "done";
        this.stdOut = args.stdOut;
    }
    async until(unresolved) {
        const {interval: interval, color: color, frames: frames, message: message, stdOut: stdOut, doneColor: doneColor, doneMsg: doneMsg} = this;
        let done;
        let i = 0;
        stdOut(cursorHide + cursorSavePosition + message + ": " + eraseDown);
        const drawFrame = () => {
            i++;
            if (frames.length === i) i = 0;
            const frame = frames[i];
            stdOut(eraseDown + cursorRestorePosition + message + ": " + chalk.hex(color)(frame));
        };
        drawFrame();
        const timer = setInterval(drawFrame, interval);
        unresolved.then((() => {
            clearInterval(timer);
            stdOut(cursorRestorePosition + eraseLine + message + ": " + chalk.hex(doneColor)(doneMsg) + cursorShow);
            done();
        }));
        return new Promise((resolve => {
            done = resolve;
        }));
    }
}

function pather(cwd, path, opts = {}) {
    const child = path || "";
    let parent = (cwd || "").split("/").filter((x => !!x));
    if ([ "~", "/" ].includes(child[0])) {
        parent = [];
    }
    return child.split("/").filter((x => !!x)).reduce(((all, one) => {
        if (one === "..") return all.slice(0, -1);
        if (one === "~") return all;
        if (one === ".") return all;
        return [ ...all, one ];
    }), parent).join("/").replace("https:/", "https://");
}

const state = {
    cwd: undefined,
    service: undefined
};

const mapFileArg = args => {
    const {cwd: cwd, file: file} = args;
    const target = pather(cwd, file);
    const filename = target.split("/").pop();
    const parent = target.split("/").slice(0, -1).join("/");
    return {
        ...args,
        filename: filename,
        parent: parent
    };
};

const mapSourceDestArg = args => {
    const {cwd: cwd, source: source, dest: dest} = args;
    const src = pather(cwd, source);
    const tgt = pather(cwd, dest);
    return {
        ...args,
        src: src,
        tgt: tgt
    };
};

state.service = await getCurrentService();

state.cwd = state.service + "/";

const switchService = service => {
    state.cwd = service.name;
    state.service = service.name;
};

const commands$1 = [ {
    name: "PrintWorkingDir",
    keyword: "pwd",
    description: "Print current working directory.",
    event: "showCurrentFolder",
    mapResponse: folder => {
        if (folder.length > 2 && folder.startsWith("~/")) {
            state.cwd = folder.slice(2);
            state.service = folder.slice(2);
            return folder.slice(2);
        }
        if (folder.endsWith("/")) return folder.slice(0, -1);
        if (folder.endsWith("/~")) return folder.slice(0, -2);
        if (folder.endsWith("/.")) return folder.slice(0, -2);
        if (folder.endsWith("/..")) return folder.slice(0, -3);
        return folder;
    }
}, {
    name: "ChangeDir",
    keyword: "cd",
    description: "Change current working directory to DIRECTORY (home by default).",
    event: "changeCurrentFolder",
    usage: "[DIRECTORY]",
    args: [ {
        name: "directory",
        type: String,
        defaultOption: true,
        defaultValue: "~"
    } ],
    map: ({directory: directory}) => ({
        folderPath: directory
    }),
    mapResponse: () => ""
}, {
    name: "MakeDir",
    keyword: "md",
    description: "Create a DIRECTORY if not existing (recursively).",
    event: "addFolder",
    usage: "[DIRECTORY]",
    args: [ {
        name: "directory",
        type: String,
        defaultOption: true,
        required: true
    } ],
    map: ({directory: directory, cwd: cwd}) => {
        const folder = pather(cwd, directory);
        return {
            folderName: folder.split("/").pop(),
            parent: folder.split("/").slice(0, -1).join("/")
        };
    },
    mapResponse: () => ""
}, 
// {
// 	name: 'List',
// 	keyword: "ls",
// 	description: "List contents of a DIRECTORY (current by default).",
// 	event: "readFolder",
// 	usage: '[-al] [DIRECTORY]',
// 	args: [
// 		{ name: 'directory', type: String, defaultOption: true, defaultValue: '.' },
// 		{ name: 'all', type: Boolean, alias: 'a' },
// 		{ name: 'long', type: Boolean, alias: 'l' },
// 	],
// 	map: ({ directory, cwd }) => ({ directory: directory || cwd }),
// 	mapResponse: (res) => {
// 		return res
// 			.filter(x => x)
// 			.sort((a,b) => {
// 				const bothFolders = a.includes('/') && b.includes('/');
// 				const bothFiles = !a.includes('/') && !b.includes('/');
// 				if(bothFolders || bothFiles){
// 					return a.toLowerCase().localeCompare(b.toLowerCase());
// 				}
// 				if(a.includes('/') && !b.includes('/')) return -1;
// 				if(!a.includes('/') && b.includes('/')) return 1;
// 			})
// 			.join('\n') + '\n'
// 	}
// },
{
    name: "Remove",
    keyword: "rm",
    description: "Remove FILE, or DIRECTORY with --recursive (-r) option.",
    event: [ "deleteFolder", "deleteFile" ],
    eventMap: (args = {}) => {
        const {src: src} = args;
        if (!src) return "deleteFile";
        if (src.endsWith("/")) return "deleteFolder";
        if (src.includes(".")) return "deleteFile";
        return "deleteFolder";
    },
    usage: "[-rf] [FILE|DIRECTORY]",
    args: [ {
        name: "file",
        type: String,
        defaultOption: true,
        required: true
    }, {
        name: "recursive",
        type: Boolean,
        alias: "r"
    }, {
        name: "force",
        type: Boolean,
        alias: "f"
    } ],
    map: mapFileArg,
    mapResponse: res => ""
}, {
    name: "Move",
    keyword: "mv",
    description: "Move SOURCE to DESTINATION.",
    event: [ "moveFolder", "moveFile" ],
    eventMap: (args = {}) => {
        const {src: src} = args;
        if (!src) return "moveFile";
        if (src.endsWith("/")) return "moveFolder";
        if (src.includes(".")) return "moveFile";
        return "moveFolder";
    },
    usage: "[SOURCE] [DESTINATION]",
    args: [ {
        name: "source",
        type: String,
        required: true
    }, {
        name: "dest",
        type: Boolean,
        required: true
    } ],
    argsGet: ([source, dest]) => ({
        source: source,
        dest: dest
    }),
    map: mapSourceDestArg,
    mapResponse: res => ""
}, {
    name: "Copy",
    keyword: "cp",
    listenerKeys: [],
    description: "Copy from [SOURCE] to [DESTINATION]",
    event: [ "copyFolder", "copyFile" ],
    eventMap: (args = {}) => {
        const {src: src} = args;
        if (!src) return "copyFile";
        if (src.endsWith("/")) return "copyFolder";
        if (src.includes(".")) return "copyFile";
        return "copyFolder";
    },
    usage: "[SOURCE] [DESTINATION]",
    args: [ {
        name: "source",
        type: String,
        required: true
    }, {
        name: "dest",
        type: Boolean,
        required: true
    } ],
    argsGet: ([source, dest]) => ({
        source: source,
        dest: dest
    }),
    map: mapSourceDestArg,
    mapResponse: res => ""
}, {
    name: "Touch",
    keyword: "touch",
    description: `Official usage: updates timestamp of FILE. Used here: creates a FILE; does not affect timestamp of FILE.`,
    event: "addFile",
    usage: "[FILE]",
    args: [ {
        name: "file",
        type: String,
        defaultOption: true,
        required: true
    } ],
    map: mapFileArg,
    mapResponse: res => ""
}, {
    name: "Open",
    keyword: "open",
    description: `Open a file in editor`,
    event: "fileSelect",
    type: "fileSelect",
    usage: "[FILE]",
    args: [ {
        name: "file",
        type: String,
        defaultOption: true,
        required: true
    } ],
    map: ({file: file, cwd: cwd}) => {
        const _cwd = (file || "").startsWith(state.service) ? "/" : cwd;
        const _file = pather(_cwd, file);
        const name = _file.split("/").pop();
        const parent = _file.split("/").slice(0, -1).join("/").replace(state.service + "/", "").replace(state.service, "");
        return {
            name: name,
            parent: parent,
            path: parent,
            src: parent ? `${parent}/${name}` : name,
            service: state.service
        };
    },
    mapResponse: res => ""
} ];

const getStatefulHandlers = (state, {changeFolder: changeFolder}) => ({
    showCurrentFolder: {
        response: () => state.cwd,
        update: (res, service) => {
            state.cwd = res;
            state.service = service;
        }
    },
    changeCurrentFolder: {
        response: ({folderPath: folderPath}) => changeFolder(state, folderPath)
    }
});

const link$3 = url => chalk.hex("#9cdcfe")(url);

const commandHelp$2 = command => `\n\n${chalk.bold("Usage:")} ${command.keyword} ${chalk.hex("#BBB")(command.usage || "")}\n\n${command.description || "MISSING DESCRIPTION: bug someone to add a description."}\n\n  -?, --????   ${chalk.hex("#BBB")("TODO")}        TODO: add args description\n  -h, --help   ${/* SPACER                */ ""}    Prints this guide\n\n${chalk.bold("Examples:")}\n  TODO: add examples\n\n${chalk.italic(`\nOnline help: ${link$3("https://github.com/fiugd/fiug/wiki")}\nReport bugs: ${link$3("https://github.com/fiugd/fiug/issues")}\n`)}\n`;

const readFile = async args => {
    const {file: file, cwd: cwd} = args;
    let response, error;
    try {
        response = await (await fetch(`/${cwd}/${file}`)).text();
    } catch (e) {
        error = JSON.stringify(e, null, 2);
    }
    return {
        response: response,
        error: error
    };
};

const manualCommands = {
    readFile: readFile
};

const changeFolder = (state, folderPath) => {
    if (!state.cwd || !state.service) return;
    let newCwd = state.service.trim() + "/" + pather(state.cwd.replace(state.service.trim(), ""), folderPath);
    state.cwd = newCwd;
    return newCwd;
};

const withState = (() => {
    const stateFnWrapper = func => async args => {
        let handler;
        try {
            const handlers = getStatefulHandlers(state, {
                changeFolder: changeFolder
            });
            handler = handlers[args.triggerEvent.detail.operation];
            const response = handler.response(args.triggerEvent.detail);
            if (response) return {
                response: response
            };
        } catch (e) {}
        const {error: error, response: response, service: service} = await func(args);
        try {
            response.trim() && handler.update(response.trim(), service);
        } catch (e) {}
        return {
            error: error,
            response: response
        };
    };
    return stateFnWrapper;
})();

async function invokeRaw$1(args = {}, thisCommand) {
    thisCommand = thisCommand || this;
    const {event: event, type: type, eventMap: eventMap, invokeRaw: invokeRaw, map: argMapper, comm: comm, mapResponse: mapResponse} = thisCommand;
    const {response: cwd} = event[0] !== "showCurrentFolder" ? await invokeRaw.bind({
        event: [ "showCurrentFolder" ],
        map: argMapper,
        comm: comm
    })() : {};
    const argsPlusExtra = {
        ...args,
        cwd: cwd
    };
    const mappedArgs = argMapper ? argMapper(argsPlusExtra) : argsPlusExtra;
    if (Object.keys(manualCommands).includes(event[0])) {
        let {error: error, response: response} = await manualCommands[event[0]](mappedArgs);
        return {
            error: error,
            response: response
        };
    }
    let {error: error, response: response} = await withState(comm.execute)({
        triggerEvent: {
            type: type || "operations",
            detail: {
                source: "TerminalWIP",
                operation: eventMap ? eventMap(mappedArgs) : event[0] || event,
                ...mappedArgs
            }
        }
    });
    if (response && response.trim) {
        response = response.trim();
    }
    if (response && mapResponse) {
        response = mapResponse(response);
    }
    try {
        error = response.detail.result.error;
        error.stack = error.stack.split("\n").map((x => x.trim()));
    } catch (e) {}
    return {
        error: error,
        response: response
    };
}

async function invoke$3(args, done) {
    this.term.write("\n");
    const {error: error, response: response} = await this.invokeRaw(args, this);
    if (error) {
        this.term.write(jsonColors({
            error: error
        }) + "\n");
        return done();
    }
    if (response) {
        this.term.write(response + "\n");
    }
    //this.term.write(notImplemented(this));
        done();
}

async function exit$3() {}

const Operation = (config, term, comm) => ({
    ...config,
    term: term,
    comm: comm,
    invoke: invoke$3,
    invokeRaw: invokeRaw$1,
    exit: exit$3,
    listenerKeys: [],
    args: config.args || [],
    event: Array.isArray(config.event) ? config.event : [ config.event ],
    required: (config.args || []).filter((x => x.required)).map((x => x.name)),
    help: () => commandHelp$2(config)
});

const GetOps = (term, comm) => {
    const opmap = config => Operation(config, term, comm);
    return commands$1.map(opmap);
};

/*

https://medium.com/@mehulgala77/github-fundamentals-clone-fetch-push-pull-fork-16d79bb16b79
https://wyag.thb.lt/ - write yourself a git
https://medium.com/@urna.hybesis/git-from-scratch-5-steps-guide-8943f19c62b

https://googlechrome.github.io/samples/service-worker/post-message/

*/ const getStored = varName => {
    const stored = sessionStorage.getItem(varName);
    if (stored) return stored;
    const prompted = prompt(varName);
    prompted && sessionStorage.setItem(varName, prompted);
    return prompted;
};

const fetchJSON$1 = (url, opts) => fetch(url, opts).then((x => x.json()));

const postJSON = (url, opts = {}, body) => fetchJSON$1(url, {
    method: "POST",
    body: JSON.stringify(body),
    ...opts
});

const link$2 = url => chalk.hex("#9cdcfe")(url);

const [bold, hex, italic] = [ chalk.bold.bind(chalk), chalk.hex.bind(chalk), chalk.italic.bind(chalk) ];

const commandHelp$1 = command => `\n\n${bold("Usage:")} ${command.keyword} ${hex("#BBB")(command.usage || "")}\n\nThese are common Git COMMANDs which are supported in some form here:\n\n${hex("#BBB")("start a working area")}\n   ${bold("clone")}      Copy a remote repository to local\n   ${bold("init")}       Create an empty repository\n\n${hex("#BBB")("work on the current change")}\n   ${bold("add")}        Add files to commit\n   ${bold("rm")}         Remove files from commit\n\n${hex("#BBB")("examine the history and state")}\n   ${bold("diff")}       Show local changes per file\n   ${bold("status")}     List all files changed locally\n   ${bold("log")}        Show commit logs\n\n${hex("#BBB")("grow, mark, and tweak your common history")}\n   ${bold("branch")}     List, create, or delete branches\n   ${bold("commit")}     Record changes to the repository\n\n${hex("#BBB")("collaborate")}\n   ${bold("pull")}       Fetch recent changes from remote\n   ${bold("push")}       Update remote with local commits\n\n${hex("#BBB")("other")}\n   ${bold("config")}     Get and set repository or global options\n\n${hex("#BBB")("totally non-standard utils")}\n   ${bold("list")}       List all cloned repositories\n   ${bold("open")}       Load a repository for editing\n   ${bold("close")}      Unload a repository\n\n${italic(`\nOnline help: ${link$2("https://github.com/fiugd/fiug/wiki")}\nReport bugs: ${link$2("https://github.com/fiugd/fiug/issues")}\n`)}\n`;

/*
start a working area (see also: git help tutorial)
   clone      Clone a repository into a new directory
   init       Create an empty Git repository or reinitialize an existing one

work on the current change (see also: git help everyday)
   add        Add file contents to the index
   mv         Move or rename a file, a directory, or a symlink
   reset      Reset current HEAD to the specified state
   rm         Remove files from the working tree and from the index

examine the history and state (see also: git help revisions)
   bisect     Use binary search to find the commit that introduced a bug
   grep       Print lines matching a pattern
   log        Show commit logs
   show       Show various types of objects
   status     Show the working tree status

grow, mark and tweak your common history
   branch     List, create, or delete branches
   checkout   Switch branches or restore working tree files
   commit     Record changes to the repository
   diff       Show changes between commits, commit and working tree, etc
   merge      Join two or more development histories together
   rebase     Reapply commits on top of another base tip
   tag        Create, list, delete or verify a tag object signed with GPG

collaborate (see also: git help workflows)
   fetch      Download objects and refs from another repository
   pull       Fetch from and integrate with another repository or a local branch
   push       Update remote refs along with associated objects

*/ const unknownArgsHelper = args => {
    const keyed = {};
    const anon = [];
    for (var i = 0, len = args.length; i < len; i++) {
        const thisArg = args[i];
        const nextArg = args[i + 1];
        if (thisArg.startsWith("--")) {
            keyed[thisArg.replace(/^--/, "")] = nextArg || null;
            i++;
            continue;
        }
        if (thisArg.startsWith("-")) {
            keyed[thisArg.replace(/^-/, "")] = nextArg || null;
            i++;
            continue;
        }
        anon.push(thisArg);
    }
    return {
        keyed: keyed,
        anon: anon
    };
};

const diffPretty = diff => {
    const colors = {
        invisible: "#555",
        deleted: "#c96d71",
        added: "#b1e26d",
        special: "#38b8bf",
        normal: "#ddd"
    };
    return (diff || "").split("\n").map(((x, i, all) => {
        const invisibles = str => str.replace(/ /g, chalk.hex(colors.invisible)("·")).replace(/\t/g, chalk.hex(colors.invisible)(" → "));
        const fmtLine = str => `${str[0]}  ${invisibles(str).slice(1)}`;
        if (x[0] === "-") return chalk.hex(colors.deleted)(fmtLine(x).trim() + "\n");
        if (x[0] === "+") return chalk.hex(colors.added)(fmtLine(x).trim() + "\n");
        if (x.slice(0, 2) === "@@") return chalk.hex(colors.special)("...\n");
        return `${chalk.hex(colors.normal)(x)}\n`;
    })).join("");
};

const opConfig = {
    keyword: "git",
    description: "git is version control.",
    event: "",
    usage: "[COMMAND] [args]",
    args: [ {
        name: "command",
        type: String,
        defaultOption: true
    } ],
    map: ({}) => ({})
};

const _getChanges = async ({ops: ops}) => {
    const pwdCommand = ops.find((x => x.keyword === "pwd"));
    const {response: cwd = ""} = await pwdCommand.invokeRaw();
    const changesUrl = "/service/change";
    const changesResponse = await fetchJSON$1(changesUrl + "?cwd=" + cwd);
    return changesResponse;
};

const notImplemented = command => chalk.hex("#ccc")(`\ngit ${command}: not implemented\n`);

const unrecognizedCommand = command => `\n${command}: command not found\n`;

class GitConfig {
    constructor(service, current, comm) {
        this.root = location.origin;
        this.service = service;
        this.current = current;
        this.comm = comm;
        this.path = ".git/config";
        this.url = `${this.root}/${this.service.name}/${this.path}`;
    }
    async update(prop, value) {
        const {service: service, current: current, comm: comm} = this;
        await this.read();
        const propSplit = (prop || "").split(".");
        let cursor = this.config;
        for (var i = 0, len = propSplit.length; i < len; i++) {
            cursor[propSplit[i]] = i === len - 1 ? value : cursor[propSplit[i]] || {};
            cursor = cursor[propSplit[i]];
        }
        const {message: message, result: result} = await this.save();
        if (current.id === service.id) {
            const triggerEvent = {
                type: "operationDone",
                detail: {
                    op: "update",
                    id: this.service.id + "",
                    result: result,
                    source: "Terminal"
                }
            };
            comm.execute({
                triggerEvent: triggerEvent
            });
        }
        return message;
    }
    async read() {
        let configText = await fetch(this.url).then((x => x.ok ? x.text() : undefined));
        configText = (configText || "").split("\n").map((x => x.trim())).filter((x => x)).join("\n");
        this.config = ini.parse(configText);
    }
    async readProp(prop) {
        if (!this.config) await this.read();
        let cursor = this.config;
        const propSplit = (prop || "").split(".");
        if (!propSplit[0].trim()) return cursor;
        for (var i = 0, len = propSplit.length; i < len; i++) {
            if (!cursor) break;
            cursor = cursor[propSplit[i]];
        }
        return cursor;
    }
    async save() {
        const {config: config, path: path} = this;
        const source = ini.encode(config, {
            whitespace: true
        });
        const service = this.service;
        let message = `saved config to ${this.url}`;
        let result;
        try {
            const {error: addFolderError} = await addFolder(`.git`, service);
            if (addFolderError) {
                message = addFolderError;
                return;
            }
            const {error: addFileError, result: addFileResult} = await addFile(path, source, service);
            if (addFileError) message = addFileError;
            if (addFileResult) result = addFileResult;
        } catch (e) {
            console.log(e);
            message = "error: " + e.message;
        }
        return {
            message: message,
            result: result
        };
    }
}

const getConfig = async prop => {
    const current = await getCurrentService("all");
    const localConfig = new GitConfig(current);
    const globalConfig = new GitConfig({
        id: 0,
        name: "~"
    });
    return {
        local: await localConfig.readProp(prop),
        global: await globalConfig.readProp(prop)
    };
};

const config$1 = async ({term: term, comm: comm}, args) => {
    const {_unknown: _unknown = []} = args;
    const {keyed: keyed, anon: anon} = unknownArgsHelper(_unknown);
    const {local: local, global: global} = keyed;
    if (local === undefined && global === undefined) {
        return chalk.hex("#ccc")(`\nUsage:\n  git config [--local or --global] <optional value-pattern>\n\nExamples:\n  git config --global user.name "Jimmy Fiug"\n  git config --local\n\n`);
    }
    const prop = local || global;
    const value = anon.join(" ").replace(/['"]/g, "").trim();
    const current = await getCurrentService("all");
    const service = local ? current : {
        name: "~",
        id: 0
    };
    const config = new GitConfig(service, current, comm);
    if (!value) {
        const propVal = await config.readProp(prop);
        const out = typeof propVal === "object" ? ini.encode(propVal, {
            whitespace: true
        }).trim() : propVal;
        return `${out}\n`;
    }
    const message = await config.update(prop, value);
    return message + "\n";
};

const diff = async ({ops: ops}, args) => {
    const {_unknown: files} = args;
    let {changes: changes} = await _getChanges({
        ops: ops
    });
    changes = changes.filter((x => !x.fileName.includes("/.git/")));
    let filesToShow = changes;
    if (files && Array.isArray(files)) {
        filesToShow = [];
        for (let i = 0, len = files.length; i < len; i++) {
            const file = files[i];
            const foundChange = changes.find((x => x.fileName.includes(file)));
            const alreadyAdded = foundChange && filesToShow.find((x => x.fileName === foundChange.fileName));
            if (alreadyAdded) continue;
            filesToShow.push(foundChange);
        }
    }
    const getDiff = (t1, t2) => diffLines(t1 || "", t2 || "", {
        n_surrounding: 0
    });
    return filesToShow.filter((x => x && getDiff(x.original, x.value).trim())).map((x => {
        if (x.deleteFile) return `\n${x.fileName}\n\n${chalk.red("DELETED")}\n`;
        return `\n${Link.create(x.fileName)}\n\n${getDiff(x.original, x.value)}\n`;
    })).join("\n");
};

const status = async ({ops: ops}) => {
    const changesResponse = await _getChanges({
        ops: ops
    });
    let {changes: changes} = changesResponse;
    changes = changes.filter((x => !x.fileName.includes("/.git/")));
    if (!changes.length) {
        return "\n   no changes\n";
    }
    const changeRender = c => {
        const {deleteFile: deleteFile, fileName: fileName} = c;
        const changeType = deleteFile ? "deleted" : "modified";
        return "   " + chalk.bold(`${changeType}: `) + fileName;
    };
    return "\n" + changes.map(changeRender).join("\n") + "\n";
};

const commitUsage = chalk.hex("#ccc")(`\nUsage:\n  git commit -m <commit message>\n\nExample:\n  git commit -m "made some changes to service"\n\n`);

const commit = async ({ops: ops, term: term}, args) => {
    const {_unknown: _unknown} = args;
    const message = (_unknown || []).join(" ").match(/(?:"[^"]*"|^[^"]*$)/)[0].replace(/"/g, "");
    if (!message.trim()) return commitUsage;
    const pwdCommand = ops.find((x => x.keyword === "pwd"));
    const {response: cwd = ""} = await pwdCommand.invokeRaw();
    const commitUrl = "/service/commit";
    const authConfig = await getConfig("user.token");
    const token = authConfig.local || authConfig.global;
    const auth = token || getStored("Github Personal Access Token");
    const spin = new Spinner({
        stdOut: term.write.bind(term),
        message: chalk.hex("#ccc")(`Pushing commit`),
        color: "#0FF",
        doneColor: "#0FF",
        doneMsg: "DONE"
    });
    const commitRequest = postJSON(commitUrl, null, {
        cwd: cwd,
        message: message,
        auth: auth
    });
    spin.until(commitRequest);
    const shortenShaUrl = url => {
        const newHashLength = 6;
        try {
            return [ ...url.split("/").slice(0, -1), url.split("/").pop().slice(0, newHashLength) ].join("/");
        } catch (e) {
            console.log(e);
            return url;
        }
    };
    const {commitResponse: commitResponse} = await commitRequest;
    if (commitResponse && commitResponse.error) {
        return `ERROR: ${commitResponse.error}`;
    }
    return "\n" + chalk.hex("#ccc")("Commit Info: ") + chalk.hex("#9cdcfe")(shortenShaUrl(commitResponse)) + "\n";
};

const cloneUsage = chalk.hex("#ccc")(`\nUsage:\n  git clone [-b or --branch] <branch> <repository>\n\nExample:\n  git clone -b main fiugd/welcome\n\n`);

const clone = async ({term: term}, args) => {
    //git clone --branch <branchname> <remote-repo-url>
    //git clone -b <branchname> <remote-repo-url>
    const {_unknown: _unknown = []} = args;
    const {keyed: keyed, anon: anon} = unknownArgsHelper(_unknown);
    const branch = keyed.b || keyed.branch;
    const [repo] = anon;
    const cloneUrl = "/service/create/provider";
    if (!repo) return cloneUsage;
    const authConfig = await getConfig("user.token");
    const token = authConfig.local || authConfig.global;
    const auth = token || getStored("Github Personal Access Token");
    const bodyObj = {
        providerType: "github-provider",
        operation: "provider-add-service",
        auth: auth,
        repo: repo,
        branch: branch
    };
    const body = JSON.stringify(bodyObj);
    const method = "POST";
    const cloneMessage = chalk.hex("#ccc")(`Cloning ${bodyObj.repo}${bodyObj.branch ? `, ${bodyObj.branch} branch` : ""}`);
    const spin = new Spinner({
        stdOut: term.write.bind(term),
        message: cloneMessage,
        color: "#0FF",
        doneColor: "#0FF",
        doneMsg: "DONE"
    });
    const cloneRequest = fetch(cloneUrl, {
        body: body,
        method: method
    }).then((x => x.json()));
    spin.until(cloneRequest);
    const {result: result} = await cloneRequest;
    if (result && result.error) {
        return `ERROR: ${result.error}\n`;
    }
    return `\n`;
};

const list = async ({term: term}, args) => {
    const {result: allServices} = await fetchJSON$1("/service/read");
    return "\n" + allServices.map((x => x.name + ` (${x.id})`)).filter((x => x !== "~ (0)")).join("\n") + "\n";
};

const open = async ({term: term, comm: comm}, args) => {
    const {_unknown: _unknown = []} = args;
    const {keyed: keyed, anon: anon} = unknownArgsHelper(_unknown);
    const param = anon.join("");
    const {result: allServices} = await fetchJSON$1("/service/read");
    const found = allServices.find((x => x.id + "" === param || x.name === param));
    if (!found) return `could not find repo; unable to open\n`;
    localStorage.setItem("lastService", found.id);
    const {result: result} = await fetchJSON$1("/service/read/" + found.id);
    const triggerEvent = {
        type: "operationDone",
        detail: {
            op: "update",
            id: found.id + "",
            result: result,
            source: "Terminal"
        }
    };
    comm.execute({
        triggerEvent: triggerEvent
    });
    switchService(found);
    return "\n";
};

const close = async ({term: term, comm: comm, ops: ops}, args) => {
    localStorage.setItem("lastService", "0");
    const {result: result} = await fetchJSON$1("/service/read/0");
    const triggerEvent = {
        type: "operationDone",
        detail: {
            op: "update",
            id: "0",
            result: result,
            source: "Terminal"
        }
    };
    comm.execute({
        triggerEvent: triggerEvent
    });
    switchService({
        id: 0,
        name: "~"
    });
    return "\n";
};

const branch$1 = async ({term: term}) => notImplemented("branch");

const push = async ({term: term}) => notImplemented("push");

const pull = async ({term: term}) => notImplemented("pull");

const init = async ({term: term}) => notImplemented("init");

const add = async ({term: term}) => notImplemented("add");

const rm = async ({term: term}) => notImplemented("rm");

const log = async ({term: term}) => notImplemented("log");

const commands = {
    diff: diff,
    status: status,
    commit: commit,
    clone: clone,
    config: config$1,
    list: list,
    open: open,
    close: close,
    branch: branch$1,
    push: push,
    pull: pull,
    init: init,
    add: add,
    rm: rm,
    log: log
};

async function invokeRaw(_this, args) {
    const {command: command} = args;
    const thisCommand = commands[command];
    if (!thisCommand) {
        return {
            error: unrecognizedCommand(`git ${command}`)
        };
    }
    return await thisCommand(_this, args);
}

async function invoke$2(args, done) {
    const {term: term, invokeRaw: invokeRaw} = this;
    const {command: command} = args;
    if (!command) {
        term.write(this.help());
        done();
        return;
    }
    term.write("\n");
    const response = await invokeRaw(this, args);
    if (response?.error) {
        term.write(response.error);
        return done();
    }
    if (command === "diff" && response) {
        term.write(diffPretty(response));
        return done();
    }
    if (response) {
        term.write(response);
    }
    done();
}

async function exit$2() {}

const Git = (term, comm) => ({
    ...opConfig,
    ops: GetOps(term, comm),
    term: term,
    comm: comm,
    invoke: invoke$2,
    invokeRaw: invokeRaw,
    exit: exit$2,
    listenerKeys: [],
    args: opConfig.args || [],
    event: Array.isArray(opConfig.event) ? opConfig.event : [ opConfig.event ],
    required: (opConfig.args || []).filter((x => x.required)).map((x => x.name)),
    help: () => commandHelp$1(opConfig)
});

const alotOfEvents = [ "ui", "fileClose", "fileSelect", "operations", "operationDone", "contextmenu", "contextmenu-select" ];

const history = [ "watch -e fileSelect", `watch -e ${alotOfEvents.join(" ")}`, `watch`, `git branch`, `git pull`, `git push`, `git clone`, `git status`, `git diff terminal.git.mjs`, `git commit -m "commit me"`, `git config --global user.email johndoe@example.com`, `git config --local user.name "John Doe"`, `cat terminal/terminal.comm.js`, `node --watch terminal/.example.js`, `node --watch test/service-worker.services.test.js`, `node service-worker/_build.js`, `node shared/vendor/codemirror/update.js`, `git commit -m "editor in its own iframe"`, "preview editor/editor.html", "node build/terminal.js", "node build/editor.js", "preview --watch=false dist/editor.html" ];

const usage$1 = chalk => {
    const link = url => chalk.hex("#9cdcfe")(url);
    return `\n\n${chalk.bold("Usage:")} history ${chalk.hex("#BBB")("")}\n\nPrints history of entered commands.\n\n  -h, --help   ${/* SPACER                */ ""}    Prints this guide\n\n${chalk.italic(`\nOnline help: ${link("https://github.com/fiugd/fiug/wiki")}\nReport bugs: ${link("https://github.com/fiugd/fiug/issues")}\n`)}\n\t`;
};

class History {
    keyword="history";
    current=-1;
    history=history;
    args=[];
    setLine=undefined;
    writeLine=undefined;
    constructor({chalk: chalk, getBuffer: getBuffer, setBuffer: setBuffer}) {
        this.chalk = chalk;
        this.getBuffer = getBuffer;
        this.setBuffer = setBuffer;
        this.help = () => usage$1(chalk);
        this.next = this.next.bind(this);
        this.prev = this.prev.bind(this);
        this.invoke = this.invoke.bind(this);
        this.push = this.push.bind(this);
        this.updateBuffer = this.updateBuffer.bind(this);
        this.updateLine = this.updateLine.bind(this);
    }
    get currentItem() {
        return [ ...this.history ].reverse()[this.current];
    }
    next() {
        if (this.current < 0) return;
        this.current--;
        this.updateLine();
    }
    prev() {
        if (this.current === this.history.length - 1) return;
        this.current++;
        this.updateLine();
    }
    invoke(args, done) {
        const {chalk: chalk, history: history, writeLine: writeLine} = this;
        writeLine("\n");
        const EXTRA_PADDING = 3;
        const padding = Math.floor(history.length / 10) + EXTRA_PADDING;
        history.slice(0, -1).forEach(((h, i) => {
            writeLine(`${chalk.dim((i + 1 + "").padStart(padding, " "))}  ${h}\n`);
        }));
        done();
    }
    push(command) {
        this.history.push(command);
        this.current = -1;
    }
    updateBuffer() {
        const {currentItem: currentItem, setBuffer: setBuffer} = this;
        if (!currentItem) return;
        setBuffer(currentItem);
        this.current = -1;
    }
    updateLine() {
        const {current: current, history: history, setLine: setLine, getBuffer: getBuffer} = this;
        if (current === -1) return setLine(getBuffer());
        setLine([ ...history ].reverse()[current]);
    }
}

/*
there may be an easier way to handle copy/paste

https://github.com/xtermjs/xtermjs.org/pull/128/files#diff-668881c29904cdf1945728abb06b4933d7829e6aec6c66e6f651acc93cf4dd71R23-R37

*/ const getKeysToBubbleUp = () => {
    const F5 = 116;
    const F11 = 122;
    return [ F5, F11 ];
};

const getKeys = lib => ({
    ArrowUp: lib.history.prev,
    ArrowDown: lib.history.next,
    Enter: lib.enterCommand,
    Backspace: lib.backspaceCommand,
    controlc: lib.copyKillCommand,
    controlv: lib.pasteCommand,
    controla: lib.selectAll
});

var Keys = ({lib: lib, getBuffer: getBuffer, setBuffer: setBuffer}) => {
    const {writeLine: writeLine, history: history} = lib;
    const keys = getKeys(lib);
    const keysToBubbleUp = getKeysToBubbleUp();
    const bubbleHandler = ({which: which, keyCode: keyCode}) => {
        const key = which || keyCode;
        return !keysToBubbleUp.includes(key);
    };
    const keyHandler = e => {
        const modBitmask = [ e.domEvent.altKey || 0, e.domEvent.altGraphKey || 0, e.domEvent.metaKey || 0, e.domEvent.ctrlKey || 0 ].map(Number).join("");
        const mods = {
            control: modBitmask === "0001",
            printable: modBitmask === "0000"
        };
        const key = `${mods.control ? "control" : ""}${e.domEvent.key}`;
        const termKey = e.key;
        if (keys[key]) return keys[key](e);
        if (!mods.printable) return;
        if (termKey.length !== 1) return;
        history.updateBuffer();
        setBuffer(getBuffer() + termKey);
        writeLine(termKey);
    };
    return {
        bubbleHandler: bubbleHandler,
        keyHandler: keyHandler
    };
};

/*!
	from https://beta.fiug.dev/package.json
*/ var packageJson = {
    name: "fiug",
    version: "0.4.6",
    description: "cloud IDE without the cloud",
    main: "index.js",
    scripts: {
        watch: "browser-sync start --config .browsersync.js",
        test: "jest --watch"
    },
    author: "",
    license: "ISC",
    devDependencies: {
        "browser-sync": "^2.26.14",
        jest: "^26.6.3"
    },
    dependencies: {}
};

var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};

var INFINITY = 1 / 0;

var symbolTag = "[object Symbol]";

var reAsciiWord = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g;

var reLatin = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g;

var rsAstralRange = "\\ud800-\\udfff", rsComboMarksRange = "\\u0300-\\u036f\\ufe20-\\ufe23", rsComboSymbolsRange = "\\u20d0-\\u20f0", rsDingbatRange = "\\u2700-\\u27bf", rsLowerRange = "a-z\\xdf-\\xf6\\xf8-\\xff", rsMathOpRange = "\\xac\\xb1\\xd7\\xf7", rsNonCharRange = "\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf", rsPunctuationRange = "\\u2000-\\u206f", rsSpaceRange = " \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000", rsUpperRange = "A-Z\\xc0-\\xd6\\xd8-\\xde", rsVarRange = "\\ufe0e\\ufe0f", rsBreakRange = rsMathOpRange + rsNonCharRange + rsPunctuationRange + rsSpaceRange;

var rsApos = "['’]", rsAstral = "[" + rsAstralRange + "]", rsBreak = "[" + rsBreakRange + "]", rsCombo = "[" + rsComboMarksRange + rsComboSymbolsRange + "]", rsDigits = "\\d+", rsDingbat = "[" + rsDingbatRange + "]", rsLower = "[" + rsLowerRange + "]", rsMisc = "[^" + rsAstralRange + rsBreakRange + rsDigits + rsDingbatRange + rsLowerRange + rsUpperRange + "]", rsFitz = "\\ud83c[\\udffb-\\udfff]", rsModifier = "(?:" + rsCombo + "|" + rsFitz + ")", rsNonAstral = "[^" + rsAstralRange + "]", rsRegional = "(?:\\ud83c[\\udde6-\\uddff]){2}", rsSurrPair = "[\\ud800-\\udbff][\\udc00-\\udfff]", rsUpper = "[" + rsUpperRange + "]", rsZWJ = "\\u200d";

var rsLowerMisc = "(?:" + rsLower + "|" + rsMisc + ")", rsUpperMisc = "(?:" + rsUpper + "|" + rsMisc + ")", rsOptLowerContr = "(?:" + rsApos + "(?:d|ll|m|re|s|t|ve))?", rsOptUpperContr = "(?:" + rsApos + "(?:D|LL|M|RE|S|T|VE))?", reOptMod = rsModifier + "?", rsOptVar = "[" + rsVarRange + "]?", rsOptJoin = "(?:" + rsZWJ + "(?:" + [ rsNonAstral, rsRegional, rsSurrPair ].join("|") + ")" + rsOptVar + reOptMod + ")*", rsSeq = rsOptVar + reOptMod + rsOptJoin, rsEmoji = "(?:" + [ rsDingbat, rsRegional, rsSurrPair ].join("|") + ")" + rsSeq, rsSymbol = "(?:" + [ rsNonAstral + rsCombo + "?", rsCombo, rsRegional, rsSurrPair, rsAstral ].join("|") + ")";

var reApos = RegExp(rsApos, "g");

var reComboMark = RegExp(rsCombo, "g");

var reUnicode = RegExp(rsFitz + "(?=" + rsFitz + ")|" + rsSymbol + rsSeq, "g");

var reUnicodeWord = RegExp([ rsUpper + "?" + rsLower + "+" + rsOptLowerContr + "(?=" + [ rsBreak, rsUpper, "$" ].join("|") + ")", rsUpperMisc + "+" + rsOptUpperContr + "(?=" + [ rsBreak, rsUpper + rsLowerMisc, "$" ].join("|") + ")", rsUpper + "?" + rsLowerMisc + "+" + rsOptLowerContr, rsUpper + "+" + rsOptUpperContr, rsDigits, rsEmoji ].join("|"), "g");

var reHasUnicode = RegExp("[" + rsZWJ + rsAstralRange + rsComboMarksRange + rsComboSymbolsRange + rsVarRange + "]");

var reHasUnicodeWord = /[a-z][A-Z]|[A-Z]{2,}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/;

var deburredLetters = {
    "À": "A",
    "Á": "A",
    "Â": "A",
    "Ã": "A",
    "Ä": "A",
    "Å": "A",
    "à": "a",
    "á": "a",
    "â": "a",
    "ã": "a",
    "ä": "a",
    "å": "a",
    "Ç": "C",
    "ç": "c",
    "Ð": "D",
    "ð": "d",
    "È": "E",
    "É": "E",
    "Ê": "E",
    "Ë": "E",
    "è": "e",
    "é": "e",
    "ê": "e",
    "ë": "e",
    "Ì": "I",
    "Í": "I",
    "Î": "I",
    "Ï": "I",
    "ì": "i",
    "í": "i",
    "î": "i",
    "ï": "i",
    "Ñ": "N",
    "ñ": "n",
    "Ò": "O",
    "Ó": "O",
    "Ô": "O",
    "Õ": "O",
    "Ö": "O",
    "Ø": "O",
    "ò": "o",
    "ó": "o",
    "ô": "o",
    "õ": "o",
    "ö": "o",
    "ø": "o",
    "Ù": "U",
    "Ú": "U",
    "Û": "U",
    "Ü": "U",
    "ù": "u",
    "ú": "u",
    "û": "u",
    "ü": "u",
    "Ý": "Y",
    "ý": "y",
    "ÿ": "y",
    "Æ": "Ae",
    "æ": "ae",
    "Þ": "Th",
    "þ": "th",
    "ß": "ss",
    "Ā": "A",
    "Ă": "A",
    "Ą": "A",
    "ā": "a",
    "ă": "a",
    "ą": "a",
    "Ć": "C",
    "Ĉ": "C",
    "Ċ": "C",
    "Č": "C",
    "ć": "c",
    "ĉ": "c",
    "ċ": "c",
    "č": "c",
    "Ď": "D",
    "Đ": "D",
    "ď": "d",
    "đ": "d",
    "Ē": "E",
    "Ĕ": "E",
    "Ė": "E",
    "Ę": "E",
    "Ě": "E",
    "ē": "e",
    "ĕ": "e",
    "ė": "e",
    "ę": "e",
    "ě": "e",
    "Ĝ": "G",
    "Ğ": "G",
    "Ġ": "G",
    "Ģ": "G",
    "ĝ": "g",
    "ğ": "g",
    "ġ": "g",
    "ģ": "g",
    "Ĥ": "H",
    "Ħ": "H",
    "ĥ": "h",
    "ħ": "h",
    "Ĩ": "I",
    "Ī": "I",
    "Ĭ": "I",
    "Į": "I",
    "İ": "I",
    "ĩ": "i",
    "ī": "i",
    "ĭ": "i",
    "į": "i",
    "ı": "i",
    "Ĵ": "J",
    "ĵ": "j",
    "Ķ": "K",
    "ķ": "k",
    "ĸ": "k",
    "Ĺ": "L",
    "Ļ": "L",
    "Ľ": "L",
    "Ŀ": "L",
    "Ł": "L",
    "ĺ": "l",
    "ļ": "l",
    "ľ": "l",
    "ŀ": "l",
    "ł": "l",
    "Ń": "N",
    "Ņ": "N",
    "Ň": "N",
    "Ŋ": "N",
    "ń": "n",
    "ņ": "n",
    "ň": "n",
    "ŋ": "n",
    "Ō": "O",
    "Ŏ": "O",
    "Ő": "O",
    "ō": "o",
    "ŏ": "o",
    "ő": "o",
    "Ŕ": "R",
    "Ŗ": "R",
    "Ř": "R",
    "ŕ": "r",
    "ŗ": "r",
    "ř": "r",
    "Ś": "S",
    "Ŝ": "S",
    "Ş": "S",
    "Š": "S",
    "ś": "s",
    "ŝ": "s",
    "ş": "s",
    "š": "s",
    "Ţ": "T",
    "Ť": "T",
    "Ŧ": "T",
    "ţ": "t",
    "ť": "t",
    "ŧ": "t",
    "Ũ": "U",
    "Ū": "U",
    "Ŭ": "U",
    "Ů": "U",
    "Ű": "U",
    "Ų": "U",
    "ũ": "u",
    "ū": "u",
    "ŭ": "u",
    "ů": "u",
    "ű": "u",
    "ų": "u",
    "Ŵ": "W",
    "ŵ": "w",
    "Ŷ": "Y",
    "ŷ": "y",
    "Ÿ": "Y",
    "Ź": "Z",
    "Ż": "Z",
    "Ž": "Z",
    "ź": "z",
    "ż": "z",
    "ž": "z",
    "Ĳ": "IJ",
    "ĳ": "ij",
    "Œ": "Oe",
    "œ": "oe",
    "ŉ": "'n",
    "ſ": "ss"
};

var freeGlobal = typeof commonjsGlobal == "object" && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

var freeSelf = typeof self == "object" && self && self.Object === Object && self;

var root$1 = freeGlobal || freeSelf || Function("return this")();

function arrayReduce(array, iteratee, accumulator, initAccum) {
    var index = -1, length = array ? array.length : 0;
    if (initAccum && length) {
        accumulator = array[++index];
    }
    while (++index < length) {
        accumulator = iteratee(accumulator, array[index], index, array);
    }
    return accumulator;
}

function asciiToArray(string) {
    return string.split("");
}

function asciiWords(string) {
    return string.match(reAsciiWord) || [];
}

function basePropertyOf(object) {
    return function(key) {
        return object == null ? void 0 : object[key];
    };
}

var deburrLetter = basePropertyOf(deburredLetters);

function hasUnicode(string) {
    return reHasUnicode.test(string);
}

function hasUnicodeWord(string) {
    return reHasUnicodeWord.test(string);
}

function stringToArray(string) {
    return hasUnicode(string) ? unicodeToArray(string) : asciiToArray(string);
}

function unicodeToArray(string) {
    return string.match(reUnicode) || [];
}

function unicodeWords(string) {
    return string.match(reUnicodeWord) || [];
}

var objectProto = Object.prototype;

var objectToString = objectProto.toString;

var Symbol$1 = root$1.Symbol;

var symbolProto = Symbol$1 ? Symbol$1.prototype : void 0, symbolToString = symbolProto ? symbolProto.toString : void 0;

function baseSlice(array, start, end) {
    var index = -1, length = array.length;
    if (start < 0) {
        start = -start > length ? 0 : length + start;
    }
    end = end > length ? length : end;
    if (end < 0) {
        end += length;
    }
    length = start > end ? 0 : end - start >>> 0;
    start >>>= 0;
    var result = Array(length);
    while (++index < length) {
        result[index] = array[index + start];
    }
    return result;
}

function baseToString(value) {
    if (typeof value == "string") {
        return value;
    }
    if (isSymbol(value)) {
        return symbolToString ? symbolToString.call(value) : "";
    }
    var result = value + "";
    return result == "0" && 1 / value == -INFINITY ? "-0" : result;
}

function castSlice(array, start, end) {
    var length = array.length;
    end = end === void 0 ? length : end;
    return !start && end >= length ? array : baseSlice(array, start, end);
}

function createCaseFirst(methodName) {
    return function(string) {
        string = toString(string);
        var strSymbols = hasUnicode(string) ? stringToArray(string) : void 0;
        var chr = strSymbols ? strSymbols[0] : string.charAt(0);
        var trailing = strSymbols ? castSlice(strSymbols, 1).join("") : string.slice(1);
        return chr[methodName]() + trailing;
    };
}

function createCompounder(callback) {
    return function(string) {
        return arrayReduce(words(deburr(string).replace(reApos, "")), callback, "");
    };
}

function isObjectLike(value) {
    return !!value && typeof value == "object";
}

function isSymbol(value) {
    return typeof value == "symbol" || isObjectLike(value) && objectToString.call(value) == symbolTag;
}

function toString(value) {
    return value == null ? "" : baseToString(value);
}

var camelCase$1 = createCompounder((function(result, word, index) {
    word = word.toLowerCase();
    return result + (index ? capitalize(word) : word);
}));

function capitalize(string) {
    return upperFirst(toString(string).toLowerCase());
}

function deburr(string) {
    string = toString(string);
    return string && string.replace(reLatin, deburrLetter).replace(reComboMark, "");
}

var upperFirst = createCaseFirst("toUpperCase");

function words(string, pattern, guard) {
    string = toString(string);
    pattern = guard ? void 0 : pattern;
    if (pattern === void 0) {
        return hasUnicodeWord(string) ? unicodeWords(string) : asciiWords(string);
    }
    return string.match(pattern) || [];
}

var lodash_camelcase = camelCase$1;

function defaultSetTimout() {
    throw new Error("setTimeout has not been defined");
}

function defaultClearTimeout() {
    throw new Error("clearTimeout has not been defined");
}

var cachedSetTimeout = defaultSetTimout;

var cachedClearTimeout = defaultClearTimeout;

var globalContext;

if (typeof window !== "undefined") {
    globalContext = window;
} else if (typeof self !== "undefined") {
    globalContext = self;
} else {
    globalContext = {};
}

if (typeof globalContext.setTimeout === "function") {
    cachedSetTimeout = setTimeout;
}

if (typeof globalContext.clearTimeout === "function") {
    cachedClearTimeout = clearTimeout;
}

function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        return setTimeout(fun, 0);
    }
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        return cachedSetTimeout(fun, 0);
    } catch (e) {
        try {
            return cachedSetTimeout.call(null, fun, 0);
        } catch (e2) {
            return cachedSetTimeout.call(this, fun, 0);
        }
    }
}

function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        return clearTimeout(marker);
    }
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        return cachedClearTimeout(marker);
    } catch (e) {
        try {
            return cachedClearTimeout.call(null, marker);
        } catch (e2) {
            return cachedClearTimeout.call(this, marker);
        }
    }
}

var queue = [];

var draining = false;

var currentQueue;

var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;
    var len = queue.length;
    while (len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

function nextTick(fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
}

function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}

Item.prototype.run = function() {
    this.fun.apply(null, this.array);
};

var title = "browser";

var platform = "browser";

var browser = true;

var argv = [];

var version = "";

var versions = {};

var release = {};

var config = {};

function noop() {}

var on = noop;

var addListener = noop;

var once = noop;

var off = noop;

var removeListener = noop;

var removeAllListeners = noop;

var emit = noop;

function binding(name) {
    throw new Error("process.binding is not supported");
}

function cwd() {
    return "/";
}

function chdir(dir) {
    throw new Error("process.chdir is not supported");
}

function umask() {
    return 0;
}

var performance$1 = globalContext.performance || {};

var performanceNow = performance$1.now || performance$1.mozNow || performance$1.msNow || performance$1.oNow || performance$1.webkitNow || function() {
    return (new Date).getTime();
};

function hrtime(previousTimestamp) {
    var clocktime = performanceNow.call(performance$1) * .001;
    var seconds = Math.floor(clocktime);
    var nanoseconds = Math.floor(clocktime % 1 * 1e9);
    if (previousTimestamp) {
        seconds = seconds - previousTimestamp[0];
        nanoseconds = nanoseconds - previousTimestamp[1];
        if (nanoseconds < 0) {
            seconds--;
            nanoseconds += 1e9;
        }
    }
    return [ seconds, nanoseconds ];
}

var startTime = new Date;

function uptime() {
    var currentTime = new Date;
    var dif = currentTime - startTime;
    return dif / 1e3;
}

var process = {
    nextTick: nextTick,
    title: title,
    browser: browser,
    env: {
        NODE_ENV: "production"
    },
    argv: argv,
    version: version,
    versions: versions,
    on: on,
    addListener: addListener,
    once: once,
    off: off,
    removeListener: removeListener,
    removeAllListeners: removeAllListeners,
    emit: emit,
    binding: binding,
    cwd: cwd,
    chdir: chdir,
    umask: umask,
    hrtime: hrtime,
    platform: platform,
    release: release,
    config: config,
    uptime: uptime
};

function _interopDefault(ex) {
    return ex && typeof ex === "object" && "default" in ex ? ex["default"] : ex;
}

var camelCase = _interopDefault(lodash_camelcase);

function isObject(input) {
    return typeof input === "object" && input !== null;
}

function isArrayLike(input) {
    return isObject(input) && typeof input.length === "number";
}

function arrayify(input) {
    if (Array.isArray(input)) {
        return input;
    }
    if (input === void 0) {
        return [];
    }
    if (isArrayLike(input) || input instanceof Set) {
        return Array.from(input);
    }
    return [ input ];
}

function isObject$1(input) {
    return typeof input === "object" && input !== null;
}

function isArrayLike$1(input) {
    return isObject$1(input) && typeof input.length === "number";
}

function arrayify$1(input) {
    if (Array.isArray(input)) {
        return input;
    } else {
        if (input === void 0) {
            return [];
        } else if (isArrayLike$1(input)) {
            return Array.prototype.slice.call(input);
        } else {
            return [ input ];
        }
    }
}

function findReplace(array, testFn) {
    const found = [];
    const replaceWiths = arrayify$1(arguments);
    replaceWiths.splice(0, 2);
    arrayify$1(array).forEach(((value, index) => {
        let expanded = [];
        replaceWiths.forEach((replaceWith => {
            if (typeof replaceWith === "function") {
                expanded = expanded.concat(replaceWith(value));
            } else {
                expanded.push(replaceWith);
            }
        }));
        if (testFn(value)) {
            found.push({
                index: index,
                replaceWithValue: expanded
            });
        }
    }));
    found.reverse().forEach((item => {
        const spliceArgs = [ item.index, 1 ].concat(item.replaceWithValue);
        array.splice.apply(array, spliceArgs);
    }));
    return array;
}

const re = {
    short: /^-([^\d-])$/,
    long: /^--(\S+)/,
    combinedShort: /^-[^\d-]{2,}$/,
    optEquals: /^(--\S+?)=(.*)/
};

class ArgvArray extends Array {
    load(argv2) {
        this.clear();
        if (argv2 && argv2 !== process.argv) {
            argv2 = arrayify(argv2);
        } else {
            argv2 = process.argv.slice(0);
            const deleteCount = process.execArgv.some(isExecArg) ? 1 : 2;
            argv2.splice(0, deleteCount);
        }
        argv2.forEach((arg => this.push(String(arg))));
    }
    clear() {
        this.length = 0;
    }
    expandOptionEqualsNotation() {
        if (this.some((arg => re.optEquals.test(arg)))) {
            const expandedArgs = [];
            this.forEach((arg => {
                const matches = arg.match(re.optEquals);
                if (matches) {
                    expandedArgs.push(matches[1], matches[2]);
                } else {
                    expandedArgs.push(arg);
                }
            }));
            this.clear();
            this.load(expandedArgs);
        }
    }
    expandGetoptNotation() {
        if (this.hasCombinedShortOptions()) {
            findReplace(this, re.combinedShort, expandCombinedShortArg);
        }
    }
    hasCombinedShortOptions() {
        return this.some((arg => re.combinedShort.test(arg)));
    }
    static from(argv2) {
        const result = new this;
        result.load(argv2);
        return result;
    }
}

function expandCombinedShortArg(arg) {
    arg = arg.slice(1);
    return arg.split("").map((letter => "-" + letter));
}

function isOptionEqualsNotation(arg) {
    return re.optEquals.test(arg);
}

function isOption(arg) {
    return (re.short.test(arg) || re.long.test(arg)) && !re.optEquals.test(arg);
}

function isLongOption(arg) {
    return re.long.test(arg) && !isOptionEqualsNotation(arg);
}

function getOptionName(arg) {
    if (re.short.test(arg)) {
        return arg.match(re.short)[1];
    } else if (isLongOption(arg)) {
        return arg.match(re.long)[1];
    } else if (isOptionEqualsNotation(arg)) {
        return arg.match(re.optEquals)[1].replace(/^--/, "");
    } else {
        return null;
    }
}

function isValue(arg) {
    return !(isOption(arg) || re.combinedShort.test(arg) || re.optEquals.test(arg));
}

function isExecArg(arg) {
    return [ "--eval", "-e" ].indexOf(arg) > -1 || arg.startsWith("--eval=");
}

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function isPlainObject(input) {
    return input !== null && typeof input === "object" && input.constructor === Object;
}

function isArrayLike$2(input) {
    return isObject$2(input) && typeof input.length === "number";
}

function isObject$2(input) {
    return typeof input === "object" && input !== null;
}

function isDefined(input) {
    return typeof input !== "undefined";
}

function isString(input) {
    return typeof input === "string";
}

function isBoolean(input) {
    return typeof input === "boolean";
}

function isFunction(input) {
    return typeof input === "function";
}

function isClass(input) {
    if (isFunction(input)) {
        return /^class /.test(Function.prototype.toString.call(input));
    } else {
        return false;
    }
}

function isPrimitive(input) {
    if (input === null) return true;
    switch (typeof input) {
      case "string":
      case "number":
      case "symbol":
      case "undefined":
      case "boolean":
        return true;

      default:
        return false;
    }
}

function isPromise(input) {
    if (input) {
        const isPromise2 = isDefined(Promise) && input instanceof Promise;
        const isThenable = input.then && typeof input.then === "function";
        return !!(isPromise2 || isThenable);
    } else {
        return false;
    }
}

function isIterable(input) {
    if (input === null || !isDefined(input)) {
        return false;
    } else {
        return typeof input[Symbol.iterator] === "function" || typeof input[Symbol.asyncIterator] === "function";
    }
}

var t = {
    isNumber: isNumber,
    isString: isString,
    isBoolean: isBoolean,
    isPlainObject: isPlainObject,
    isArrayLike: isArrayLike$2,
    isObject: isObject$2,
    isDefined: isDefined,
    isFunction: isFunction,
    isClass: isClass,
    isPrimitive: isPrimitive,
    isPromise: isPromise,
    isIterable: isIterable
};

class OptionDefinition {
    constructor(definition) {
        this.name = definition.name;
        this.type = definition.type || String;
        this.alias = definition.alias;
        this.multiple = definition.multiple;
        this.lazyMultiple = definition.lazyMultiple;
        this.defaultOption = definition.defaultOption;
        this.defaultValue = definition.defaultValue;
        this.group = definition.group;
        for (const prop in definition) {
            if (!this[prop]) this[prop] = definition[prop];
        }
    }
    isBoolean() {
        return this.type === Boolean || t.isFunction(this.type) && this.type.name === "Boolean";
    }
    isMultiple() {
        return this.multiple || this.lazyMultiple;
    }
    static create(def) {
        const result = new this(def);
        return result;
    }
}

class Definitions extends Array {
    validate(caseInsensitive) {
        const someHaveNoName = this.some((def => !def.name));
        if (someHaveNoName) {
            halt("INVALID_DEFINITIONS", "Invalid option definitions: the `name` property is required on each definition");
        }
        const someDontHaveFunctionType = this.some((def => def.type && typeof def.type !== "function"));
        if (someDontHaveFunctionType) {
            halt("INVALID_DEFINITIONS", "Invalid option definitions: the `type` property must be a setter fuction (default: `Boolean`)");
        }
        let invalidOption;
        const numericAlias = this.some((def => {
            invalidOption = def;
            return t.isDefined(def.alias) && t.isNumber(def.alias);
        }));
        if (numericAlias) {
            halt("INVALID_DEFINITIONS", "Invalid option definition: to avoid ambiguity an alias cannot be numeric [--" + invalidOption.name + " alias is -" + invalidOption.alias + "]");
        }
        const multiCharacterAlias = this.some((def => {
            invalidOption = def;
            return t.isDefined(def.alias) && def.alias.length !== 1;
        }));
        if (multiCharacterAlias) {
            halt("INVALID_DEFINITIONS", "Invalid option definition: an alias must be a single character");
        }
        const hypenAlias = this.some((def => {
            invalidOption = def;
            return def.alias === "-";
        }));
        if (hypenAlias) {
            halt("INVALID_DEFINITIONS", 'Invalid option definition: an alias cannot be "-"');
        }
        const duplicateName = hasDuplicates(this.map((def => caseInsensitive ? def.name.toLowerCase() : def.name)));
        if (duplicateName) {
            halt("INVALID_DEFINITIONS", "Two or more option definitions have the same name");
        }
        const duplicateAlias = hasDuplicates(this.map((def => caseInsensitive && t.isDefined(def.alias) ? def.alias.toLowerCase() : def.alias)));
        if (duplicateAlias) {
            halt("INVALID_DEFINITIONS", "Two or more option definitions have the same alias");
        }
        const duplicateDefaultOption = hasDuplicates(this.map((def => def.defaultOption)));
        if (duplicateDefaultOption) {
            halt("INVALID_DEFINITIONS", "Only one option definition can be the defaultOption");
        }
        const defaultBoolean = this.some((def => {
            invalidOption = def;
            return def.isBoolean() && def.defaultOption;
        }));
        if (defaultBoolean) {
            halt("INVALID_DEFINITIONS", `A boolean option ["${invalidOption.name}"] can not also be the defaultOption.`);
        }
    }
    get(arg, caseInsensitive) {
        if (isOption(arg)) {
            if (re.short.test(arg)) {
                const shortOptionName = getOptionName(arg);
                if (caseInsensitive) {
                    const lowercaseShortOptionName = shortOptionName.toLowerCase();
                    return this.find((def => t.isDefined(def.alias) && def.alias.toLowerCase() === lowercaseShortOptionName));
                } else {
                    return this.find((def => def.alias === shortOptionName));
                }
            } else {
                const optionName = getOptionName(arg);
                if (caseInsensitive) {
                    const lowercaseOptionName = optionName.toLowerCase();
                    return this.find((def => def.name.toLowerCase() === lowercaseOptionName));
                } else {
                    return this.find((def => def.name === optionName));
                }
            }
        } else {
            return this.find((def => def.name === arg));
        }
    }
    getDefault() {
        return this.find((def => def.defaultOption === true));
    }
    isGrouped() {
        return this.some((def => def.group));
    }
    whereGrouped() {
        return this.filter(containsValidGroup);
    }
    whereNotGrouped() {
        return this.filter((def => !containsValidGroup(def)));
    }
    whereDefaultValueSet() {
        return this.filter((def => t.isDefined(def.defaultValue)));
    }
    static from(definitions, caseInsensitive) {
        if (definitions instanceof this) return definitions;
        const result = super.from(arrayify(definitions), (def => OptionDefinition.create(def)));
        result.validate(caseInsensitive);
        return result;
    }
}

function halt(name, message) {
    const err = new Error(message);
    err.name = name;
    throw err;
}

function containsValidGroup(def) {
    return arrayify(def.group).some((group => group));
}

function hasDuplicates(array) {
    const items = {};
    for (let i = 0; i < array.length; i++) {
        const value = array[i];
        if (items[value]) {
            return true;
        } else {
            if (t.isDefined(value)) items[value] = true;
        }
    }
}

class ArgvParser {
    constructor(definitions, options) {
        this.options = Object.assign({}, options);
        this.definitions = Definitions.from(definitions, this.options.caseInsensitive);
        this.argv = ArgvArray.from(this.options.argv);
        if (this.argv.hasCombinedShortOptions()) {
            findReplace(this.argv, re.combinedShort.test.bind(re.combinedShort), (arg => {
                arg = arg.slice(1);
                return arg.split("").map((letter => ({
                    origArg: `-${arg}`,
                    arg: "-" + letter
                })));
            }));
        }
    }
    * [Symbol.iterator]() {
        const definitions = this.definitions;
        let def;
        let value;
        let name;
        let event;
        let singularDefaultSet = false;
        let unknownFound = false;
        let origArg;
        for (let arg of this.argv) {
            if (t.isPlainObject(arg)) {
                origArg = arg.origArg;
                arg = arg.arg;
            }
            if (unknownFound && this.options.stopAtFirstUnknown) {
                yield {
                    event: "unknown_value",
                    arg: arg,
                    name: "_unknown",
                    value: void 0
                };
                continue;
            }
            if (isOption(arg)) {
                def = definitions.get(arg, this.options.caseInsensitive);
                value = void 0;
                if (def) {
                    value = def.isBoolean() ? true : null;
                    event = "set";
                } else {
                    event = "unknown_option";
                }
            } else if (isOptionEqualsNotation(arg)) {
                const matches = arg.match(re.optEquals);
                def = definitions.get(matches[1], this.options.caseInsensitive);
                if (def) {
                    if (def.isBoolean()) {
                        yield {
                            event: "unknown_value",
                            arg: arg,
                            name: "_unknown",
                            value: value,
                            def: def
                        };
                        event = "set";
                        value = true;
                    } else {
                        event = "set";
                        value = matches[2];
                    }
                } else {
                    event = "unknown_option";
                }
            } else if (isValue(arg)) {
                if (def) {
                    value = arg;
                    event = "set";
                } else {
                    def = this.definitions.getDefault();
                    if (def && !singularDefaultSet) {
                        value = arg;
                        event = "set";
                    } else {
                        event = "unknown_value";
                        def = void 0;
                    }
                }
            }
            name = def ? def.name : "_unknown";
            const argInfo = {
                event: event,
                arg: arg,
                name: name,
                value: value,
                def: def
            };
            if (origArg) {
                argInfo.subArg = arg;
                argInfo.arg = origArg;
            }
            yield argInfo;
            if (name === "_unknown") unknownFound = true;
            if (def && def.defaultOption && !def.isMultiple() && event === "set") singularDefaultSet = true;
            if (def && def.isBoolean()) def = void 0;
            if (def && !def.multiple && t.isDefined(value) && value !== null) {
                def = void 0;
            }
            value = void 0;
            event = void 0;
            name = void 0;
            origArg = void 0;
        }
    }
}

const _value = new WeakMap;

class Option {
    constructor(definition) {
        this.definition = new OptionDefinition(definition);
        this.state = null;
        this.resetToDefault();
    }
    get() {
        return _value.get(this);
    }
    set(val) {
        this._set(val, "set");
    }
    _set(val, state) {
        const def = this.definition;
        if (def.isMultiple()) {
            if (val !== null && val !== void 0) {
                const arr = this.get();
                if (this.state === "default") arr.length = 0;
                arr.push(def.type(val));
                this.state = state;
            }
        } else {
            if (!def.isMultiple() && this.state === "set") {
                const err = new Error(`Singular option already set [${this.definition.name}=${this.get()}]`);
                err.name = "ALREADY_SET";
                err.value = val;
                err.optionName = def.name;
                throw err;
            } else if (val === null || val === void 0) {
                _value.set(this, val);
            } else {
                _value.set(this, def.type(val));
                this.state = state;
            }
        }
    }
    resetToDefault() {
        if (t.isDefined(this.definition.defaultValue)) {
            if (this.definition.isMultiple()) {
                _value.set(this, arrayify(this.definition.defaultValue).slice());
            } else {
                _value.set(this, this.definition.defaultValue);
            }
        } else {
            if (this.definition.isMultiple()) {
                _value.set(this, []);
            } else {
                _value.set(this, null);
            }
        }
        this.state = "default";
    }
    static create(definition) {
        definition = new OptionDefinition(definition);
        if (definition.isBoolean()) {
            return FlagOption.create(definition);
        } else {
            return new this(definition);
        }
    }
}

class FlagOption extends Option {
    set(val) {
        super.set(true);
    }
    static create(def) {
        return new this(def);
    }
}

class Output extends Map {
    constructor(definitions) {
        super();
        this.definitions = Definitions.from(definitions);
        this.set("_unknown", Option.create({
            name: "_unknown",
            multiple: true
        }));
        for (const def of this.definitions.whereDefaultValueSet()) {
            this.set(def.name, Option.create(def));
        }
    }
    toObject(options) {
        options = options || {};
        const output = {};
        for (const item of this) {
            const name = options.camelCase && item[0] !== "_unknown" ? camelCase(item[0]) : item[0];
            const option = item[1];
            if (name === "_unknown" && !option.get().length) continue;
            output[name] = option.get();
        }
        if (options.skipUnknown) delete output._unknown;
        return output;
    }
}

class GroupedOutput extends Output {
    toObject(options) {
        const superOutputNoCamel = super.toObject({
            skipUnknown: options.skipUnknown
        });
        const superOutput = super.toObject(options);
        const unknown = superOutput._unknown;
        delete superOutput._unknown;
        const grouped = {
            _all: superOutput
        };
        if (unknown && unknown.length) grouped._unknown = unknown;
        this.definitions.whereGrouped().forEach((def => {
            const name = options.camelCase ? camelCase(def.name) : def.name;
            const outputValue = superOutputNoCamel[def.name];
            for (const groupName of arrayify(def.group)) {
                grouped[groupName] = grouped[groupName] || {};
                if (t.isDefined(outputValue)) {
                    grouped[groupName][name] = outputValue;
                }
            }
        }));
        this.definitions.whereNotGrouped().forEach((def => {
            const name = options.camelCase ? camelCase(def.name) : def.name;
            const outputValue = superOutputNoCamel[def.name];
            if (t.isDefined(outputValue)) {
                if (!grouped._none) grouped._none = {};
                grouped._none[name] = outputValue;
            }
        }));
        return grouped;
    }
}

function commandLineArgs(optionDefinitions, options) {
    options = options || {};
    if (options.stopAtFirstUnknown) options.partial = true;
    optionDefinitions = Definitions.from(optionDefinitions, options.caseInsensitive);
    const parser = new ArgvParser(optionDefinitions, {
        argv: options.argv,
        stopAtFirstUnknown: options.stopAtFirstUnknown,
        caseInsensitive: options.caseInsensitive
    });
    const OutputClass = optionDefinitions.isGrouped() ? GroupedOutput : Output;
    const output = new OutputClass(optionDefinitions);
    for (const argInfo of parser) {
        const arg = argInfo.subArg || argInfo.arg;
        if (!options.partial) {
            if (argInfo.event === "unknown_value") {
                const err = new Error(`Unknown value: ${arg}`);
                err.name = "UNKNOWN_VALUE";
                err.value = arg;
                throw err;
            } else if (argInfo.event === "unknown_option") {
                const err = new Error(`Unknown option: ${arg}`);
                err.name = "UNKNOWN_OPTION";
                err.optionName = arg;
                throw err;
            }
        }
        let option;
        if (output.has(argInfo.name)) {
            option = output.get(argInfo.name);
        } else {
            option = Option.create(argInfo.def);
            output.set(argInfo.name, option);
        }
        if (argInfo.name === "_unknown") {
            option.set(arg);
        } else {
            option.set(argInfo.value);
        }
    }
    return output.toObject({
        skipUnknown: !options.partial,
        camelCase: options.camelCase
    });
}

var dist = commandLineArgs;

// also consider: https://www.npmjs.com/package/minimist
// https://www.sitepoint.com/javascript-command-line-interface-cli-node-js/
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Shells
const getSupportedCommands = commands => {
    const supported = {
        help: commands.help,
        cls: commands.clearTerminal,
        clear: commands.clearTerminal
    };
    commands.ops.forEach((op => {
        supported[op.keyword] = op;
    }));
    return supported;
};

const SYSTEM_NAME = `${packageJson.name} v${packageJson.version}`;

const missingArg = (op, missing) => `\n${op}: missing argument${missing.length ? "s" : ""}: ${missing.join(", ")}\nTry '${op} --help' for more information.\n`;

const parseArgs = (model, argString) => {
    if (!model?.args) return argString;
    if (argString.includes("-h") || argString.includes("-h")) return {
        help: true
    };
    const options = {
        argv: argString.trim().split(" "),
        partial: true
    };
    const result = typeof model.argsGet === "function" ? model.argsGet(options.argv) : dist(model.args, options);
    const {_unknown: _unknown = []} = result;
    for (const unknownArg of _unknown) {
        if (unknownArg.match(/-(-watch|w)\s*=\s*false/i)) {
            result.watch = false;
        }
    }
    if (model.args && typeof model.argsGet !== "function") {
        model.args.filter((x => x.default)).forEach((x => {
            result[x.name] = typeof result[x.name] !== "undefined" ? result[x.name] : x.default;
        }));
    }
    const resultProps = Object.keys(result).sort();
    (model?.args || []).forEach((x => {
        if (!x.defaultValue || result[x.name]) return;
        result[x.name] = x.defaultValue;
    }));
    if (!model?.required?.length) return result;
    resultProps.join("") === model.required.sort().join("");
    const missing = model.required.filter((x => !resultProps.includes(x) || !result[x]));
    if (missing.length) return {
        missing: missing
    };
    return result;
};

//const writePromptIndicator = () => term.write(chalk.white.bold('∑ '));
const writePromptIndicator = term => term.write(chalk.white.bold("$ "));

const writeSysName = async (term, ops) => term.write(chalk.rgb(60, 180, 190)(SYSTEM_NAME));

const writeCurrentFolder = async (term, ops) => {
    const pwd = ops.find((x => x.keyword === "pwd"));
    const {response: cwd} = await pwd.invokeRaw();
    return term.write(chalk.hex("#00FF00")(cwd));
};

const prompt$1 = async (term, ops) => {
    await writeSysName(term);
    term.write(" ");
    await writeCurrentFolder(term, ops);
    term.write(" \r\n");
    writePromptIndicator(term);
};

var Lib = ({term: term, ops: ops, setBuffer: setBuffer, getBuffer: getBuffer, setRunning: setRunning, getRunning: getRunning, comm: comm}) => {
    const showPrompt = async () => await prompt$1(term, ops);
    const writeLine = term.write.bind(term);
    const eraseLine = () => {
        //TODO: delete backwards (and up for overflowed lines) until reaching prompt
        term.write("[2K\r");
    };
    const eraseToPrompt = () => eraseLine() & writePromptIndicator(term);
    const setLine = replace => eraseToPrompt() & term.write(replace);
    const history = ops.find((x => x.keyword === "history"));
    history.writeLine = writeLine;
 //NOTE: hate to do this..
        history.setLine = setLine;
 //NOTE: hate to do this..
        const clearTerminal = e => term.clear() & eraseLine();
    const help = e => term.write("\n" + Object.keys(supportedCommands).filter((x => ![ "help", "cls", "clear" ].includes(x))).sort().join("\n") + "\n")
    // TODO: ask if the user meant some other command & provide link to run it
    ;
    const unrecognizedCommand = keyword => e => term.write(`\n${keyword}: command not found\n`);
    const supportedCommands = getSupportedCommands({
        help: help,
        clearTerminal: clearTerminal,
        ops: ops
    });
    const enterCommand = async e => {
        if (getRunning()) return term.write("\n");
        history.updateBuffer();
        const buffer = getBuffer();
        if (!buffer) return await showPrompt();
        const [, keyword, args] = new RegExp(`^(.+?)(?:\\s|$)(.*)$`).exec(buffer) || [];
        const command = supportedCommands[keyword] || unrecognizedCommand(keyword);
        const done = async () => {
            setRunning(undefined);
            term.write("\n");
            await showPrompt();
        };
        const standardHandler = e => {
            setRunning(command);
            const parsedArgs = parseArgs(command, args);
            if (parsedArgs.help) {
                const helpCommand = command.help ? command.help : () => {};
                term.write(helpCommand() || "\nHelp unavailable.\n");
                done();
                return;
            }
            if (parsedArgs.missing) {
                term.write(missingArg(command.keyword, parsedArgs.missing));
                done();
                return;
            }
            command.invoke(parseArgs(command, args), done);
        };
        const handler = command.invoke ? standardHandler : command;
        history.push(buffer);
        setBuffer("");
        handler && handler();
        if (command.invoke) return;
        done();
    };
    const backspaceCommand = e => {
        history.updateBuffer();
        // Do not delete the prompt
                if (term._core.buffer.x <= 2) return;
        setBuffer(getBuffer().slice(0, -1));
        term.write("\b \b");
    };
    const copyKillCommand = async e => {
        try {
            const clip = term.getSelection();
            const running = getRunning();
            if (running && !clip) {
                await running.exit();
                setRunning(undefined);
                term.write("\n");
                await showPrompt();
                return;
            }
            await navigator.clipboard.writeText((clip + "").trim());
        } catch (e) {}
    };
    const pasteCommand = async e => {
        try {
            history.updateBuffer();
            const clip = (await navigator.clipboard.readText()).split("\n")[0].trim();
            setBuffer(`${getBuffer()}${clip}`);
            eraseToPrompt();
            term.write(getBuffer());
        } catch (e) {}
    };
    const selectAll = async e => {
        setTimeout(term.selectAll.bind(term), 1);
    };
    return {
        clearTerminal: clearTerminal,
        showPrompt: showPrompt,
        eraseToPrompt: eraseToPrompt,
        writeLine: writeLine,
        selectAll: selectAll,
        enterCommand: enterCommand,
        backspaceCommand: backspaceCommand,
        copyKillCommand: copyKillCommand,
        pasteCommand: pasteCommand,
        history: history
    };
};

/*

"dynamic" basically just means that this command is not cached with sw
instead this module loads "dynamic" op from github / uses terminalCache

it may be tempting to think that "dynamic" means that fiugd/beta/terminal/bin
files are ran autommatically, but this is not the case

basically, this file just shortcuts the need for sw and service.manifest.json entry

*/ const showCursor = ansiEscapes.cursorShow;

const cacheName = "terminal-cache";

const fetchJSON = url => fetch(url).then((x => x.json()));

const root = location.origin.includes("beta") ? "fiugd/beta" : "fiugd/fiug";

const branch = "main";

const readDir = async (serviceName, dir) => {
    try {
        const {result: allServices} = await fetchJSON("/service/read");
        const {id: serviceId} = allServices.find((x => x.name === serviceName));
        const {result: [service]} = await fetchJSON(`/service/read/${serviceId}`);
        const tree = service.tree[serviceName];
        const response = Object.keys(dir.split("/").filter((x => x)).reduce(((all, one) => all[one]), tree)).map((name => ({
            name: name
        })));
        return {
            response: response
        };
    } catch ({message: error}) {
        return {
            error: error
        };
    }
};

const readSourceDir = async dir => {
    if (location.href.includes("/::preview::/")) {
        return readDir(root, dir);
    }
    const githubContentsUrl = `https://api.github.com/repos/${root}/contents${dir || ""}?ref=${branch}`;
    let response, error;
    try {
        const cache = await caches.open(cacheName);
        const match = await cache.match(githubContentsUrl) || await cache.add(githubContentsUrl) || await cache.match(githubContentsUrl);
        response = await match.json();
    } catch (e) {
        error = e.message;
    }
    return {
        response: response,
        error: error
    };
};

const updateSWCache = bins => {
    console.warn(`\n\t\tTODO: add files to SW cache under /_/modules/terminal/bin\n\t\tthis avoids having to add these to service.manifest.json\n\t`.replace(/^\t+/gm, "").trim());
};

const debounce = (func, wait) => {
    let timeout;
    let throttleTime;
    let args;
    let context;
    return function() {
        context = this;
        args = arguments;
        const later = function() {
            func.apply(context, args);
            timeout = null;
        };
        if (!timeout) throttleTime = performance.now();
        if (timeout && performance.now() - throttleTime > wait) {
            func.apply(context, args);
            throttleTime = performance.now();
        }
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

class ProcessWorker {
    header=`\n\t\tconsole.log = (...log) => postMessage({\n\t\t\tlog: log.join('')+'\\n'\n\t\t});\n\t`.replace(/^		/gm, "").trim();
    footer=url => `\n\t\tlet script;\n\t\tlet state = {};\n\t\tonmessage = async (e) => {\n\t\t\tlet result, error, exit;\n\n\t\t\t// TODO: maybe in future be more fancy with events\n\t\t\tif(e.data?.type === "events"){}\n\n\t\t\ttry {\n\t\t\t\tscript = script || e.data;\n\t\t\t\tresult = await operation(script || e.data, state, e);\n\t\t\t} catch(e){\n\t\t\t\terror = e.message;\n\t\t\t}\n\t\t\texit = !(script || e.data).watch;\n\t\t\tpostMessage({ result, error, exit });\n\t\t}\n\n\t\t//# sourceURL=${url}\n\t`.replace(/^		/gm, "").trim();
    constructor(url, {comm: comm, exit: exit, setListenerKey: setListenerKey}) {
        this.comm = comm;
        this.exit = exit;
        this.setListenerKey = setListenerKey;
        this.url = url;
        let moduleResolver;
        this.module = new Promise((resolve => {
            moduleResolver = resolve;
        }));
        let blobResolver;
        this.blob = new Promise((resolve => {
            blobResolver = resolve;
        }));
        const baseUrl = new URL("./", location).href.split("terminal")[0] + "terminal";
        (async resolve => {
            const module = new ((await import(url)).default);
            moduleResolver(module);
            if (module.type === "plain") return blobResolver();
            const body = `\n\t\t\t\tconst baseUrl = "${baseUrl}";\n\t\t\t\tconst operation = ${module.operation.toString()};\n\t\t\t`.replace(/^				/gm, "");
            const blob = new Blob([ this.header, "\n\n", body, "\n\n", this.footer(url) ], {
                type: "text/javascript"
            });
            blobResolver(blob);
        })();
    }
    run(args, logger, done) {
        const {comm: comm, setListenerKey: setListenerKey} = this;
        const {attach: attach} = comm;
        const finish = resolve => {
            logger("\n");
            done();
            resolve();
            this.exit();
        };
        const debounceTime = 300;
        const promise = new Promise((async resolve => {
            const module = await this.module;
            if (module.type === "plain") {
                const runOperation = eventName => async event => {
                    let serviceUrl;
                    try {
                        serviceUrl = new URL(`/${event.detail.service}`, location).href;
                    } catch (e) {}
                    const result = await module.operation({
                        ...args,
                        event: event,
                        eventName: eventName,
                        serviceUrl: serviceUrl
                    }, (msg => {
                        msg && logger(msg);
                        finish(resolve);
                    }));
                    result && logger(result);
                    if (!args.watch) {
                        return finish(resolve);
                    }
                };
                const listener = eventName => debounce(runOperation(eventName), debounceTime);
                await listener("init")(args);
                if (!args.watch) return;
                const listenTo = module.listen || [ "fileChange" ];
                for (const eventName of listenTo) {
                    const response = await attach({
                        name: module.name,
                        listener: listener(eventName),
                        eventName: eventName
                    });
                    setListenerKey(response.key);
                }
                return;
            }
            const blob = await this.blob;
            const worker = new Worker(URL.createObjectURL(blob), {
                name: this.url.split("/").pop()
            });
            const exitWorker = () => {
                worker.onmessage = undefined;
                worker.terminate();
                finish(resolve);
            };
            this.kill = () => {
                worker.terminate();
            };
            worker.onmessage = e => {
                const {result: result, log: log, exit: exit, error: error} = e.data;
                log && logger(log);
                result && logger(result);
                error && logger("ERROR: " + error);
 //should be red?
                                if (exit || error && !args.watch) exitWorker();
            };
            worker.postMessage(args);
            //NOTE: this is a very rough version of watch mode
            // eventName 'Operations' is hard coded and maybe should change
                        if (args.watch) {
                const messagePost = eventName => args => {
                    worker.postMessage({
                        type: "events",
                        eventName: eventName,
                        ...args
                    });
                };
                const listener = eventName => debounce(messagePost(eventName), debounceTime);
                const listenTo = [ "fileChange", "fileSelect" ];
                for (const eventName of listenTo) {
                    const response = await attach({
                        name: module.name,
                        listener: listener(eventName),
                        eventName: eventName
                    });
                    setListenerKey(response.key);
                }
                //worker.postMessage({ type: "events", ...response });
                        }
        }));
        return promise;
    }
}

async function invoke$1(args, done) {
    const cwd = await this.getCwd();
    const logger = msg => {
        this.term.write(msg);
    };
    logger("\n");
    await this.process.run({
        cwd: cwd,
        ...args
    }, logger, done);
}

function exit$1() {
    if (this.listenerKey) {
        const {detach: detach} = this.comm;
        this.listenerKey.forEach(detach);
        this.listenerKey = undefined;
    }
    try {
        this.process.kill();
    } catch (e) {}
    this.term.write(showCursor);
}

const link$1 = url => chalk.hex("#9cdcfe")(url);

const commandHelp = command => `\n\n${chalk.bold("Usage:")} ${command.keyword} ${chalk.hex("#BBB")(command.usage || "")}\n\n${command.description || "MISSING DESCRIPTION: bug someone to add a description."}\n\n  -?, --????   ${chalk.hex("#BBB")("TODO")}        TODO: add args description\n  -h, --help   ${/* SPACER                */ ""}    Prints this guide\n\n${chalk.bold("Examples:")}\n  TODO: add examples\n\n${chalk.italic(`\nOnline help: ${link$1(`https://github.com/${root}/wiki`)}\nReport bugs: ${link$1(`https://github.com/${root}/issues`)}\n`)}\n`;

class DynamicOp {
    constructor(url, term, comm, getCwd) {
        this.term = term;
        this.comm = comm;
        this.invoke = invoke$1.bind(this);
        this.exit = exit$1.bind(this);
        this.getCwd = getCwd;
        this.setListenerKey = key => {
            if (this.listenerKey) {
                this.listenerKey = [ ...this.listenerKey, key ];
                return;
            }
            this.listenerKey = [ key ];
        };
        const process = new ProcessWorker(url, this);
        this.process = process;
        this.worker = process.worker;
        const thisOp = this;
        return new Promise((async resolve => {
            const module = await process.module;
            thisOp.args = module.args;
            thisOp.keyword = module.keyword;
            thisOp.help = () => commandHelp(module);
            resolve(thisOp);
        }));
    }
}

const GetDynamicOps = async (term, comm, getCwd) => {
    const bins = await readSourceDir("/terminal/bin");
    updateSWCache();
    const ops = [];
    for (let i = 0, len = bins.response.length; i < len; i++) {
        const {name: name} = bins.response[i];
        const op = await new DynamicOp(`./bin/${name}`, term, comm, getCwd);
        ops.push(op);
    }
    //TODO: should attach a listener which watches for file changes
    //when invoke is called with watch arg, should register with this listener
    //then when file changes, will refresh
        return ops;
};

const link = url => chalk.hex("#9cdcfe")(url)
// TODO: would be nice if this were auto-generated
;

const usage = `\n\n${chalk.bold("Usage:")} watch -e ${chalk.hex("#BBB")("[EVENT(S)]...")}\n\nPrints EVENT(S) as they occur in the system.\n\n  -e, --event  ${chalk.hex("#BBB")("EVENT(S)")}    Events to watch\n  -h, --help   ${/* SPACER        */ "        "}    Prints this guide\n\n${chalk.bold("Examples:")}\n  watch -e fileSelect\n  watch -e ui fileClose fileSelect operations operationDone\n\n${chalk.italic(`\nOnline help: ${link("https://github.com/fiugd/fiug/wiki")}\nReport bugs: ${link("https://github.com/fiugd/fiug/issues")}\n`)}\n`;

async function invoke(args, done) {
    const {attach: attach} = this.comm;
    if (!args?.events?.length) {
        this.term.write(usage);
        done();
        return;
    }
    const {events: events} = args;
    const listener = args => {
        const {detail: detail} = args;
        this.term.write(jsonColors(detail));
        this.term.write("\n");
    };
    for (var i = 0, len = events.length; i < len; i++) {
        const response = await attach({
            name: this.keyword,
            listener: listener,
            eventName: events[i]
        });
        this.listenerKeys.push(response?.key);
    }
    this.term.write("\n");
}

async function exit() {
    const {detach: detach} = this.comm;
    try {
        for (var i = 0, len = this.listenerKeys.length; i < len; i++) {
            await detach(this.listenerKeys[i]);
        }
    } catch (e) {}
    return;
}

// this could mean not having to attach term, comm for each plugin
// export class Watch extends Plugin { maybe ???
class Watch {
    keyword="watch";
    listenerKeys=[];
    term=undefined;
    args=[ {
        name: "events",
        alias: "e",
        type: String,
        multiple: true,
        required: true
    } ];
    constructor(term, Communicate) {
        this.term = term;
        this.comm = Communicate;
        this.help = () => usage;
        this.invoke = invoke.bind(this);
        this.exit = exit.bind(this);
    }
}

function createCommonjsModule(fn, basedir, module) {
    return module = {
        path: basedir,
        exports: {},
        require: function(path, base) {
            return commonjsRequire(path, base === void 0 || base === null ? module.path : base);
        }
    }, fn(module, module.exports), module.exports;
}

function commonjsRequire() {
    throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs");
}

var xtermAddonWebLinks = createCommonjsModule((function(module, exports) {
    !function(e, t) {
        module.exports = t();
    }(window, (function() {
        return function(e) {
            var t = {};
            function n(r) {
                if (t[r]) return t[r].exports;
                var i = t[r] = {
                    i: r,
                    l: false,
                    exports: {}
                };
                return e[r].call(i.exports, i, i.exports, n), i.l = true, i.exports;
            }
            return n.m = e, n.c = t, n.d = function(e2, t2, r) {
                n.o(e2, t2) || Object.defineProperty(e2, t2, {
                    enumerable: true,
                    get: r
                });
            }, n.r = function(e2) {
                typeof Symbol != "undefined" && Symbol.toStringTag && Object.defineProperty(e2, Symbol.toStringTag, {
                    value: "Module"
                }), Object.defineProperty(e2, "__esModule", {
                    value: true
                });
            }, n.t = function(e2, t2) {
                if (1 & t2 && (e2 = n(e2)), 8 & t2) return e2;
                if (4 & t2 && typeof e2 == "object" && e2 && e2.__esModule) return e2;
                var r = Object.create(null);
                if (n.r(r), Object.defineProperty(r, "default", {
                    enumerable: true,
                    value: e2
                }), 2 & t2 && typeof e2 != "string") for (var i in e2) n.d(r, i, function(t3) {
                    return e2[t3];
                }.bind(null, i));
                return r;
            }, n.n = function(e2) {
                var t2 = e2 && e2.__esModule ? function() {
                    return e2.default;
                } : function() {
                    return e2;
                };
                return n.d(t2, "a", t2), t2;
            }, n.o = function(e2, t2) {
                return Object.prototype.hasOwnProperty.call(e2, t2);
            }, n.p = "", n(n.s = 0);
        }([ function(e, t, n) {
            Object.defineProperty(t, "__esModule", {
                value: true
            }), t.WebLinksAddon = void 0;
            var r = n(1), i = new RegExp(`(?:^|[^\\da-z\\.-]+)((https?:\\/\\/)((([\\da-z\\.-]+)\\.([a-z\\.]{2,6}))|((\\d{1,3}\\.){3}\\d{1,3})|(localhost))(:\\d{1,5})?((\\/[\\/\\w\\.\\-%~:+@]*)*([^:"'\\s]))?(\\?[0-9\\w\\[\\]\\(\\)\\/\\?\\!#@$%&'*+,:;~\\=\\.\\-]*)?(#[0-9\\w\\[\\]\\(\\)\\/\\?\\!#@$%&'*+,:;~\\=\\.\\-]*)?)($|[^\\/\\w\\.\\-%]+)`);
            function o(e2, t2) {
                var n2 = window.open();
                n2 ? (n2.opener = null, n2.location.href = t2) : console.warn("Opening link blocked as opener could not be cleared");
            }
            var a = function() {
                function e2(e3, t2, n2) {
                    e3 === void 0 && (e3 = o), t2 === void 0 && (t2 = {}), n2 === void 0 && (n2 = false), 
                    this._handler = e3, this._options = t2, this._useLinkProvider = n2, this._options.matchIndex = 1;
                }
                return e2.prototype.activate = function(e3) {
                    this._terminal = e3, this._useLinkProvider && "registerLinkProvider" in this._terminal ? this._linkProvider = this._terminal.registerLinkProvider(new r.WebLinkProvider(this._terminal, i, this._handler)) : this._linkMatcherId = this._terminal.registerLinkMatcher(i, this._handler, this._options);
                }, e2.prototype.dispose = function() {
                    var e3;
                    this._linkMatcherId !== void 0 && this._terminal !== void 0 && this._terminal.deregisterLinkMatcher(this._linkMatcherId), 
                    (e3 = this._linkProvider) === null || e3 === void 0 || e3.dispose();
                }, e2;
            }();
            t.WebLinksAddon = a;
        }, function(e, t, n) {
            Object.defineProperty(t, "__esModule", {
                value: true
            }), t.LinkComputer = t.WebLinkProvider = void 0;
            var r = function() {
                function e2(e3, t2, n2) {
                    this._terminal = e3, this._regex = t2, this._handler = n2;
                }
                return e2.prototype.provideLinks = function(e3, t2) {
                    t2(i.computeLink(e3, this._regex, this._terminal, this._handler));
                }, e2;
            }();
            t.WebLinkProvider = r;
            var i = function() {
                function e2() {}
                return e2.computeLink = function(t2, n2, r2, i2) {
                    for (var o, a = new RegExp(n2.source, (n2.flags || "") + "g"), s = e2._translateBufferLineToStringWithWrap(t2 - 1, false, r2), u = s[0], d = s[1], l = -1, c = []; (o = a.exec(u)) !== null; ) {
                        var f = o[1];
                        if (!f) {
                            console.log("match found without corresponding matchIndex");
                            break;
                        }
                        if (l = u.indexOf(f, l + 1), a.lastIndex = l + f.length, l < 0) break;
                        for (var p = l + f.length, h = d + 1; p > r2.cols; ) p -= r2.cols, h++;
                        var v = {
                            start: {
                                x: l + 1,
                                y: d + 1
                            },
                            end: {
                                x: p,
                                y: h
                            }
                        };
                        c.push({
                            range: v,
                            text: f,
                            activate: i2
                        });
                    }
                    return c;
                }, e2._translateBufferLineToStringWithWrap = function(e3, t2, n2) {
                    var r2, i2, o = "";
                    do {
                        if (!(s = n2.buffer.active.getLine(e3))) break;
                        s.isWrapped && e3--, i2 = s.isWrapped;
                    } while (i2);
                    var a = e3;
                    do {
                        var s, u = n2.buffer.active.getLine(e3 + 1);
                        if (r2 = !!u && u.isWrapped, !(s = n2.buffer.active.getLine(e3))) break;
                        o += s.translateToString(!r2 && t2).substring(0, n2.cols), e3++;
                    } while (r2);
                    return [ o, a ];
                }, e2;
            }();
            t.LinkComputer = i;
        } ]);
    }));
}));

var WebLinksAddon = xtermAddonWebLinks.WebLinksAddon;

var Xterm = () => {
    const options = {
        theme: {
            background: "rgba(255, 255, 255, 0.0)"
        },
        allowTransparency: true,
        fontSize: 13,
        //fontFamily: 'Ubuntu Mono, courier-new, courier, monospace',
        //fontWeight: 100,
        convertEol: true
    };
    const term = new Terminal(options);
    term.open(document.querySelector("#terminal .term-contain"));
    const fitAddon = new FitAddon.FitAddon;
    term.loadAddon(fitAddon);
    const fit = fitAddon.fit.bind(fitAddon);
    //term.onResize(fit);
        window.addEventListener("resize", fit);
    fit();
    const linkstart = Link.start;
    const linkend = Link.end;
    const linkHandler = (e, uri) => {
        const cleanUri = Link.text(uri);
        if (cleanUri !== uri) return term.onInternalLink(cleanUri);
        window.open(uri);
    };
    const linkMatcherOpts = {};
    const useLinkProvider = false;
    //https://xtermjs.org/docs/api/terminal/interfaces/ilinkmatcheroptions/
    /*

	https://github.com/xtermjs/xterm.js/pull/538
	https://npmdoc.github.io/node-npmdoc-xterm/build/apidoc.html#apidoc.module.xterm.Linkifier
	https://github.com/xtermjs/xterm-addon-web-links

	https://github.com/xtermjs/xterm-addon-web-links/blob/master/src/WebLinksAddon.ts
	would love for links back to the main part of app:
		- git diff could use this, esp.
		- could be useful for ls command, etc

	import ansiEscapes from 'https://cdn.skypack.dev/ansi-escapes';
	ansiEscapes.link(text, url)
	- not sure xterm.js supports this yet, though

	CLOSED ISSUE: https://github.com/xtermjs/xterm.js/issues/583
	*/    const originalActivate = WebLinksAddon.prototype.activate;
    WebLinksAddon.prototype.activate = function(term) {
        this._terminal = term;
        if (this._useLinkProvider) {
            return originalActivate.bind(this)(term);
        }
        const protocolClause = "(https?:\\/\\/)";
        const domainCharacterSet = "[\\da-z\\.-]+";
        const negatedDomainCharacterSet = "[^\\da-z\\.-]+";
        const domainBodyClause = "(" + domainCharacterSet + ")";
        const tldClause = "([a-z\\.]{2,6})";
        const ipClause = "((\\d{1,3}\\.){3}\\d{1,3})";
        const localHostClause = "(localhost)";
        const portClause = "(:\\d{1,5})";
        const hostClause = "((" + domainBodyClause + "\\." + tldClause + ")|" + ipClause + "|" + localHostClause + ")" + portClause + "?";
        const pathCharacterSet = "(\\/[\\/\\w\\.\\-%~:+@]*)*([^:\"'\\s])";
        const pathClause = "(" + pathCharacterSet + ")?";
        const queryStringHashFragmentCharacterSet = "[0-9\\w\\[\\]\\(\\)\\/\\?\\!#@$%&'*+,:;~\\=\\.\\-]*";
        const queryStringClause = "(\\?" + queryStringHashFragmentCharacterSet + ")?";
        const hashFragmentClause = "(#" + queryStringHashFragmentCharacterSet + ")?";
        const negatedPathCharacterSet = "[^\\/\\w\\.\\-%]+";
        const bodyClause = hostClause + pathClause + queryStringClause + hashFragmentClause;
        const start = "(?:^|" + negatedDomainCharacterSet + ")(";
        const end = ")($|" + negatedPathCharacterSet + ")";
        const strictUrlRegex = protocolClause + bodyClause;
        const matchFiug = `${linkstart}` + `(.*)` + pathClause + linkend;
        const originalRegex = new RegExp(start + `(${strictUrlRegex}|${matchFiug})` + end);
        const handler = {};
        const i = originalRegex || new Proxy(originalRegex, handler);
        this._linkMatcherId = this._terminal.registerLinkMatcher(i, this._handler, this._options);
    };
    const linksAddon = new WebLinksAddon(linkHandler, linkMatcherOpts, useLinkProvider);
    term.loadAddon(linksAddon);
    term._attachHandlers = ({bubbleHandler: bubbleHandler, keyHandler: keyHandler, internalLinkHandler: internalLinkHandler}) => {
        term.attachCustomKeyEventHandler(bubbleHandler);
        term.onKey(keyHandler);
        term.onBinary(((...args) => {
            console.log({
                args: args
            });
        }));
        term.onInternalLink = internalLinkHandler;
    };
    return term;
};

let ops;

const term = Xterm();

//TODO: state
let running = undefined;

let charBuffer = [];

const setBuffer = str => {
    charBuffer = str.split("");
};

const getBuffer = () => charBuffer.join("");

const getRunning = () => running;

const setRunning = target => running = target;

window.term = term;

window.sendKeys = setBuffer;

const delay = time => new Promise((resolve => setTimeout(resolve, time)));

const callWithRetry = async (fn, depth = 0, max) => {
    try {
        return await fn();
    } catch (e) {
        if (depth > 7) throw e;
        await delay(1.3 ** depth * 1e3);
        return callWithRetry(fn, depth + 1);
    }
};

setTimeout((async () => {
    try {
        const history = new History({
            chalk: chalk,
            setBuffer: setBuffer,
            getBuffer: getBuffer
        });
        const coreOps = GetOps(term, comm);
        const pwdCommand = coreOps.find((x => x.keyword === "pwd")) || {};
        const openCommand = coreOps.find((x => x.keyword === "open")) || {};
        const getCwd = async () => {
            const {response: cwd} = await pwdCommand.invokeRaw();
            if (!cwd) throw new Error("cwd not found");
            return cwd;
        };
        const dynamic = await GetDynamicOps(term, comm, getCwd);
        ops = [ ...coreOps, history, new Watch(term, comm), Git(term, comm), ...dynamic ];
        const lib = Lib({
            term: term,
            ops: ops,
            setBuffer: setBuffer,
            getBuffer: getBuffer,
            setRunning: setRunning,
            getRunning: getRunning,
            comm: comm
        });
        const {bubbleHandler: bubbleHandler, keyHandler: keyHandler} = Keys({
            lib: lib,
            getBuffer: getBuffer,
            setBuffer: setBuffer
        });
        const internalLinkHandler = uri => {
            openCommand.invokeRaw({
                file: uri
            });
            //console.log(coreOps.map(x=>x.keyword))
            //alert(`TODO: INTERNAL LINK => ${uri}`);
                };
        term._attachHandlers({
            bubbleHandler: bubbleHandler,
            keyHandler: keyHandler,
            internalLinkHandler: internalLinkHandler
        });
        await callWithRetry(getCwd);
        term.write("\n");
        //term.focus();
                lib.showPrompt();
    } catch (e) {
        term.write("\n$ ");
    }
}), 1);