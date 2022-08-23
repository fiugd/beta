/*!
	fiug search component
	Version 0.4.6 ( 2022-08-23T15:40:26.418Z )
	https://github.com/fiugd/fiug/search
	(c) 2020-2021 Harrison Cross, MIT License
*/
const sheet = new CSSStyleSheet;

sheet.replaceSync(`:root {\n\t--main-theme-color: #e8e8e8;\n\t--main-theme-highlight-color: 3, 155, 229;\n\t--main-theme-background-color: white;\n\t--main-theme-background-dark-color: #eee;\n\t--main-theme-text-color-dark: green;\n\t--main-theme-text-color: black;\n\t--main-theme-text-invert-color: white;\n\t--theme-subdued-color: #f5f5f5;\n\t--theme-text-color: #fff;\n\t--theme-text-selected: orange;\n\t--tree-selected: #dadada;\n\t--tree-hover: orange;\n\t--code-line-selected: orange;\n}\n\n:root.dark-enabled {\n\t/* --main-theme-color: #47414a; */\n\t--main-theme-color: #1e1e1e;\n\n\t/* --main-theme-highlight-color: #40f7ac; */\n\t/* --main-theme-highlight-color: #026292; */\n\t/* --main-theme-highlight-color: #2b5046; */\n\t/* --main-theme-highlight-color: 20, 160, 210; */\n\t--main-theme-highlight-color: 60, 180, 190;\n\n\t/* --main-theme-highlight-color: 20, 201, 210; */\n\t/* --main-theme-highlight-color: 64, 210, 20; */\n\t--main-theme-highlight-color-FOR-PICKER: rgb(60, 180, 190);\n\t/* --main-theme-background-color: #363238; */\n\t/* --main-theme-background-color: #3b3b3b; */\n\t--main-theme-background-color: #363636; /* #2d2d2d */\n\t--main-theme-background-dark-color: #29252b;\n\t--main-theme-text-color-dark: green;\n\t/* --main-theme-text-color: #d8d8d8; */\n\t--main-theme-text-color: #c2c2c2;\n\t/* --main-theme-text-invert-color: #d0c0d8; */\n\t--main-theme-text-invert-color: #818181;\n\t/* --theme-subdued-color: #483f48; */\n\t--theme-subdued-color: #262626;\n\t--theme-text-color: black;\n\t--theme-text-selected: #82e3ae;\n\t--tree-selected: #094771;\n\t--tree-hover: #333;\n\t--code-line-selected: orange;\n}\n\nbody {\n\twidth: 100vw;\n\theight: 100vh;\n\tmargin: 0;\n\tdisplay: flex;\n\tbackground: #2a2a2a;\n}\n\nhtml,\nbody {\n\t/* disable mac navigating forward or back */\n\toverscroll-behavior-x: none;\n\n\toverflow: hidden;\n\n\t/* font-family: Consolas, 'Courier New', monospace; */\n\tfont-family: -apple-system, BlinkMacSystemFont, sans-serif;\n\tfont-size: 13px;\n\t/* otherwise browser causes pane resizing to fail */\n\ttouch-action: none;\n}\n\nbody,\nlabel {\n\tcolor: var(--main-theme-text-color);\n}\n\nbody {\n\tdisplay: flex;\n\tflex-direction: column;\n}\n\n::-webkit-scrollbar { width: 8px; height: 5px; }\n::-webkit-scrollbar-corner,\n::-webkit-scrollbar-track { background: transparent; }\n::-webkit-scrollbar-thumb { background-color: #2a2a2a; }\n::-webkit-scrollbar-thumb:hover { background: #2a2a2a; }\n\nul {\n\tmargin: 0;\n\tpadding-left: 0;\n}\nul > li {\n\tlist-style-type: none;\n}\n\n.tree-search {\n\tdisplay: flex;\n\tflex-direction: column;\n\tmargin-right: 0;\n\tuser-select: none;\n}\n.tree-search p {\n\twhite-space: normal;\n}\n.tree-search input {\n\tbackground: var(--main-theme-background-color) !important;\n\tmargin: 0 !important;\n\tborder: 0 !important;\n\tcolor: var(--main-theme-text-color);\n\tpadding-left: .5em !important;\n\tpadding-right: .5em !important;\n\tfont-size: 1.1em !important;\n\tbox-sizing: border-box !important;\n\tpadding-top: .25em !important;\n\tpadding-bottom: .25em !important;\n\theight: unset !important;\n\ttransition: unset !important;\n\tborder: 1px solid !important;\n\tborder-color: transparent !important;\n\twidth: 100%;\n}\n.tree-search input:focus {\n\tbox-shadow: none !important;\n\tborder-color: rgb(var(--main-theme-highlight-color)) !important;\n}\n.tree-search ::placeholder,\n.project-search-results {\n\tcolor: var(--main-theme-text-invert-color);\n}\n.tree-search > div {\n\tpadding: 2px 0px;\n\tbox-sizing: content-box;\n}\n.tree-search .field-container {\n\tmargin-left: 17px;\n\tmargin-right: 10px;\n}\n.tree-search .highlight {\n\tbackground: rgba(var(--main-theme-highlight-color), 0.25);\n\tpadding-top: 4px;\n\tpadding-bottom: 4px;\n\tfilter: contrast(1.5);\n\tborder-radius: 3px;\n}\n.form-container {\n\tposition: absolute;\n\ttop: 0;\n\tleft: 0;\n\tright: 0;\n\tbottom: 0;\n\toverflow: hidden;\n\tpadding-top: 1em;\n}\n.search-results::-webkit-scrollbar {\n\tdisplay: none;\n}\n.search-results:hover::-webkit-scrollbar {\n\tdisplay: block !important;\n}\n.search-results::-webkit-scrollbar {\n\twidth:0.5em !important;\n\theight:0.5em !important;\n}\n.search-results::-webkit-scrollbar-thumb{\n\tbackground: #ffffff10;\n}\n.search-results::-webkit-scrollbar-track{\n\tbackground:none !important;\n}\n.search-results {\n\tpadding-bottom: 15em;\n\tposition: absolute;\n\tbottom: 0;\n\ttop: 155px;\n\toverflow-y: auto;\n\toverflow-x: hidden;\n\tbox-sizing: border-box;\n\tmargin: 0;\n\tleft: 0;\n\tright: 0;\n\tfont-size: 0.9em;\n\tpadding-right: 0;\n}\n.search-results > li { list-style: none; }\n\n.search-results > li > div {\n\tpadding-left: 1em;\n\tpadding-bottom: 0.2em;\n\tpadding-top: 0.2em;\n}\n.search-results > li ul > li {\n\twhite-space: nowrap;\n\tpadding-left: 3em;\n\tpadding-top: .2em;\n\tpadding-bottom: .2em;\n\tline-height: 1.6em;\n}\n\n.search-results > li > div,\n.search-results > li ul > li,\n.search-results > li > div span,\n.search-results > li ul > li span {\n\tposition: relative;\n\twhite-space: nowrap;\n}\n.search-results ul.line-results > li > span,\n.search-results ul.line-results > li > div {\n\tuser-select: none;\n\tpointer-events: none;\n}\n.search-results > li > div .hover-highlight,\n.search-results > li ul > li .hover-highlight {\n\tposition: absolute;\n\tleft: 0;\n\tright: 0;\n\ttop: 0;\n\tbottom: 0;\n\tvisibility: hidden;\n\tpointer-events: none;\n\tuser-select: none;\n\tbackground: rgba(var(--main-theme-highlight-color), 0.15);\n}\n.search-results > li > div:hover .hover-highlight,\n.search-results > li ul > li:hover .hover-highlight {\n\tvisibility: visible;\n}\n\n.search-summary {\n\tfont-size: .85em;\n\topacity: 0.7;\n}\n.search-results .foldable {\n\tcursor: pointer;\n}\n.search-results span.doc-path {\n\topacity: .5;\n}\n.search-results .foldable ul { display: none; }\n.search-results .foldable > div span {\n\tpointer-events: none;\n\tuser-select: none;\n}\n.search-results .foldable > div:before {\n\tmargin-left: 4px;\n\tmargin-right: 3px;\n\tcontent: '>';\n\tfont-family: consolas, monospace;\n\tdisplay: inline-block;\n}\n.search-results .foldable.open ul { display: block; }\n.search-results .foldable.open > div:before {\n\tmargin-left: 2px;\n\tmargin-right: 5px;\n\tcontent: '>';\n\ttransform-origin: 5px 8.5px;\n\ttransform: rotateZ(90deg);\n}\n.field-container label {\n\tfont-size: .75em;\n\tdisplay: flex;\n\tflex-direction: column;\n}\n/* SEARCH END */\n\n#status-bar {\n\tposition: relative;\n\tbottom: 0;\n\tleft: 0;\n\tright: 0;\n\theight: 22px;\n\tfont-size: 12px;\n\tpadding: 2px 10px;\n\tz-index: 10;\n\tuser-select: none;\n\ttext-align: start;\n}\n`);

/*!
    localForage -- Offline Storage, Improved
    Version 1.10.0
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
                        var b = f.result;
                        b.onversionchange = function(a) {
                            a.target.close();
                        }, c(b), p(a);
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
                            d.onerror = function() {
                                var a = d.result;
                                a && a.close(), c(d.error);
                            }, d.onblocked = function() {
                                console.warn('dropInstance blocked for database "' + a.name + '" until all open connections are closed');
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
            "undefined" == typeof Promise && a("lie/polyfill");
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
            undefined: void 0
        } ]
    }, {}, [ 1 ])(1);
}));

localforage.createInstance({
    name: "service-worker",
    version: 1,
    storeName: "changes",
    description: "keep track of changes not pushed to provider"
});

let currentService;

let clientId;

const setCurrentFile = ({filePath: filePath}) => {
    const found = currentService.code.find((x => x.name === filePath || x.path === "/" + filePath || x.path === "/" + currentService.name + "/" + filePath));
    if (found) {
        currentService.state.selected = found;
        currentService.state.selected.filename = found.name;
        return;
    }
    console.error(`could not find ${filePath}`);
};

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

//import mimeTypes from 'https://raw.githubusercontent.com/jshttp/mime-db/master/src/apache-types.json';
//import mimeTypes from "https://cdn.jsdelivr.net/npm/mime-db@1.50.0/db.json";
// TODO: maybe use insertAdjacentHTML for this instead
// this works like jquery append ^^^
function htmlToElement(html) {
    var template = document.createElement("template");
    html = html.trim();
 // Never return a text node of whitespace as the result
        template.innerHTML = html;
    //also would be cool to remove indentation from all lines
        return template.content.firstChild;
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

*/ const flatFromProp = (arr, prop) => arr.flatMap((({[prop]: p, ...x}) => typeof p !== "undefined" && p.length ? p.map((y => ({
    ...x,
    ...y
}))) : x));

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

const clone = x => {
    try {
        return JSON.parse(JSON.stringify(x));
    } catch (e) {}
};

const listeners$1 = {};

const triggers$1 = {};

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
function trigger(args) {
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
    const triggerEvent = clone({
        type: type,
        detail: _detail
    });
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
            trigger({
                ...args,
                e: args,
                data: data,
                type: eventName,
                source: name
            });
        };
        triggers$1[triggerName] = {
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
        const foundTrigger = Object.keys(triggers$1).map((key => ({
            key: key,
            ...triggers$1[key]
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
        trigger({
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
    triggers$1[triggerName] = {
        eventName: eventName,
        filter: filter,
        data: data,
        type: type
    };
    triggerClickListener = triggerClickListener || listener;
};

function listTriggers() {
    return Object.keys(triggers$1);
}

window.listTriggers = listTriggers;

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
    subscribe: "Search " + getClientId()
}, location);

const useCapture = false;

window.addEventListener("message", (function(messageEvent) {
    trigger({
        ...messageEvent.data,
        external: true
    });
}), useCapture);

/*

this code is useful when testing and developing, but less so otherwise

*/ const module$1 = async () => {
    const isRunningAsModule = document.location.href.includes("_/modules");
    if (isRunningAsModule) return;
    const ROOT_SERVICE_ID = 0;
    const currentServiceId = localStorage.getItem("lastService") || ROOT_SERVICE_ID;
    const serviceUrl = `/service/read/${currentServiceId}`;
    const {result: [service]} = await fetch(serviceUrl).then((x => x.json()));
    initState([ service ], service);
    trigger({
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
};

var devHelper = {
    module: module$1
};

const SearchBoxHTML = () => {
    const html = `\n\t<div class="form-container tree-search">\n\n\t\t<div class="field-container">\n\t\t\t<input type="text" placeholder="Search" class="search-term project-search-input" spellcheck="false"/>\n\t\t</div>\n\n\t\t<div class="field-container">\n\t\t\t<label>include</label>\n\t\t\t<input type="text" class="search-include"/>\n\t\t</div>\n\n\t\t<div class="field-container">\n\t\t\t<label>exclude</label>\n\t\t\t<input type="text" class="search-exclude"/>\n\t\t</div>\n\n\t\t<div class="field-container">\n\t\t\t<span class="search-summary"></span>\n\t\t</div>\n\n\t\t<ul class="search-results"></ul>\n\t</div>\n\t`;
    return html;
};

class SearchBox {
    dom;
    constructor(parent, include) {
        const main = htmlToElement(SearchBoxHTML());
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
        const clickHandlers = {
            "DIV foldable": e => e.target.parentNode.classList.add("open"),
            "DIV foldable open": e => e.target.parentNode.classList.remove("open"),
            "LI line-results": e => {
                try {
                    const {triggers: {tree: {fileSelect: fileSelect}}} = this.context;
                    const {source: source, ...detail} = e.target.dataset;
                    detail.name = source;
                    fileSelect({
                        detail: detail
                    });
                } catch (error) {
                    console.error("unable to trigger file select from search results");
                    console.error(error);
                }
            }
        };
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
            const handler = clickHandlers[`${e.target.tagName} ${e.target.parentNode.className.trim()}`];
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
    attachContext(context) {
        this.context = context;
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
            const fileResultsEl = htmlToElement(`\n\t\t\t\t<li class="foldable ${open}" data-path="${result.file}">\n\t\t\t\t\t<div>\n\t\t\t\t\t\t<div class="hover-highlight"></div>\n\t\t\t\t\t\t<span class="${iconClass}">${result.docName}</span>\n\t\t\t\t\t\t<span class="doc-path">${result.path}</span>\n\t\t\t\t\t</div>\n\t\t\t\t\t<ul class="line-results">\n\t\t\t\t\t\t${addFileResultsLineEl(result).join("\n")}\n\t\t\t\t\t</ul>\n\t\t\t\t</li>\n\t\t\t`);
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
                        const elementItems = newLineItems.map(htmlToElement);
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
    /*
	searchBox.hide();
	searchBox.updateTerm(searchTerm);
	searchBox.updateInclude(path)
	searchBox.searchStream({ term: searchTerm, include: path })
*/    return searchBox;
};

const search = Search(document.querySelector("#search"));

const listeners = [];

const triggers = {};

var events = {
    listeners: listeners,
    triggers: triggers
};

//import indexCSS from '../index.css';
document.adoptedStyleSheets = [ ...document.adoptedStyleSheets, sheet ];

attachEvents(events, {
    search: search
});

devHelper.module();