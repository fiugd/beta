/*!
	fiug operations component
	Version 0.4.6 ( 2022-08-22T20:54:07.070Z )
	https://github.com/fiugd/fiug/operations
	(c) 2020-2021 Harrison Cross, MIT License
*/
//https://webbjocke.com/javascript-check-data-types/
// also, OMG should I have to use Typescript instead???
// also, should use array functions and try/catch in case variable is not defined
function isString(x) {
    try {
        const value = isFunction(x) ? x() : x;
        return typeof value === "string" || value instanceof String;
    } catch (e) {}
}

function isFunction(value) {
    return typeof value === "function";
}

const listeners = {};

const triggers = {};

const clients = {};

const clone = x => {
    try {
        return JSON.parse(JSON.stringify(x));
    } catch (e) {}
};

function attach({name: name, listener: listener, eventName: eventName, options: options, key: key}) {
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
    if (listeners[listenerName]) return;
    // TODO: alter this approach, instead use ONE event listener attached to window (?)
    // this approach kinda sucks because a lot of listeners get added to window
    // also there is less control over events as they are handled
        window.addEventListener(eventName, listener, options);
    listeners[listenerName] = listener;
    if (key) {
        listeners[listenerName]._meta = {
            key: key,
            name: name,
            eventName: eventName,
            options: options
        };
    }
}

function remove({name: name, eventName: eventName, options: options, key: key}) {
    let listenerName = `${eventName}__${name}`;
    if (!key) {
        window.removeEventListener(eventName, listeners[listenerName], options);
        delete listeners[listenerName];
    }
    listenerName = Object.keys(listeners).find((x => listeners[x]._meta && listeners[x]._meta.key === key));
    if (!listenerName) return;
    const {_meta: _meta} = listeners[listenerName];
    window.removeEventListener(_meta.eventName, listeners[listenerName], _meta.options);
    delete listeners[listenerName];
}

function list() {
    return Object.keys(listeners);
}

/*
future todo:

- when an event is triggered, don't create a custom event if event listeners exist already for that event
- instead, just trigger those

- there should be an uber listener instead of a bunch of click listeners added

*/
// this thing is used too many ways... SIGH
function trigger({e: e, type: type, params: params, source: source, data: data, detail: detail}) {
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
    for (const [clientid, {source: source, origin: origin}] of Object.entries(clients)) {
        //console.log(`client: ${clientid}, event: ${type}`);
        let {callback: callback, ...safeDetail} = _detail;
        source.postMessage({
            type: type,
            detail: clone(safeDetail)
        }, origin);
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
        const _trigger = args => trigger({
            ...args,
            e: args,
            data: data,
            type: eventName,
            source: name
        });
        triggers[triggerName] = {
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
        const foundTrigger = Object.keys(triggers).map((key => ({
            key: key,
            ...triggers[key]
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
    triggers[triggerName] = {
        eventName: eventName,
        filter: filter,
        data: data,
        type: type
    };
    triggerClickListener = triggerClickListener || listener;
};

function listTriggers() {
    return Object.keys(triggers);
}

window.listTriggers = listTriggers;

window.listListeners = list;

const addFrameOffsets = (event, triggerEvent) => {
    if (triggerEvent.type !== "contextMenuShow") return;
    const terminal = document.querySelector("#terminal");
    const editor = document.querySelector("#editor");
    const isEventParent = el => {
        try {
            return el.contains(event.source);
        } catch (_) {}
        try {
            return el.contains(event.source.frameElement);
        } catch (_) {}
        try {
            return el.querySelector("iframe").contentDocument.contains(event.source.frameElement);
        } catch (_) {}
    };
    const parent = [ terminal, editor ].find(isEventParent);
    if (!parent) return;
    const {offsetLeft: offsetLeft, offsetTop: offsetTop} = parent;
    triggerEvent.detail.x += offsetLeft;
    triggerEvent.detail.y += offsetTop;
};

window.addEventListener("message", (function(messageEvent) {
    const {data: data} = messageEvent;
    const source = messageEvent.source;
    const origin = messageEvent.source;
    if (data?.subscribe) {
        clients[data.subscribe] = {
            source: source,
            origin: origin
        };
        return;
    }
    const {register: register = "", unregister: unregister, triggerEvent: triggerEvent, name: name, eventName: eventName, key: key} = data;
    if (triggerEvent) {
        triggerEvent.detail = triggerEvent.detail || {};
        addFrameOffsets(messageEvent, triggerEvent);
        const callback = (error, response, service) => {
            source.postMessage({
                error: error,
                response: response,
                error: error,
                service: service,
                key: key
            }, messageEvent.origin);
        };
        triggerEvent.detail.callback = callback;
        trigger(triggerEvent);
        const autoRespond = [ "fileSelect" ];
        if (autoRespond.includes(triggerEvent.type)) {
            return callback();
        }
        return;
    }
    source.postMessage({
        msg: "ACK",
        ...data
    }, messageEvent.origin);
    if (unregister === "listener") return remove({
        key: key
    });
    if (register !== "listener" || !name || !eventName) return;
    const listener = listenerEvent => {
        const {detail: detail} = listenerEvent;
        const safeObject = obj => JSON.parse(JSON.stringify(obj));
        source.postMessage(safeObject({
            key: key,
            detail: detail
        }), origin);
    };
    attach({
        name: name,
        listener: listener,
        eventName: eventName,
        key: key
    });
}), false);

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

//2021-06-19 01:54
attachTrigger({
    name: "State",
    eventName: "operations",
    type: "raw"
});

let listenerQueue = [];

let currentService$1;

let currentFile;

let currentFilePath;

let currentFolder;

const state = {
    changedFiles: {},
    openedFiles: {}
};

// TODO: fix the following fails for extensionless files
const isFolder = filename => filename.split("/").pop().split(".").length === 1;

/*
steps to opened/closed/selected files state sanity:
- [x] when a file is loaded from service worker (selected)
	- [x] it is considered selected
	- [x] it is pushed to opened array
	- [x] if a file was selected previously
		- and was changed: keep it in opened array
		- and was not changed: pop it from opened array
- [x] when a previously selected file is selected again
	- it is considered selected
	- it gets order:0 and other files get order:+1
- [x] when a file is deleted
	- if selected: next file in order is selected & file is removed from opened array
	- if opened: it is removed from opened, following files get bumped up in order
- [ ] when a file is moved or renamed
	- it stays in order and selected state, it's details are updated
- [x] what if file is loaded from service worker, but not used by editor?
	- handle this by doing tracking in app state module versus in SW

Currently, storage writes for this state are here:
modules/TreeView#L23
- https://github.com/fiugd/beta/blob/main/modules/TreeView.mjs#L23
*/ const debugIfMalformed = opened => {
    const malformed = opened.find((x => {
        const split = x.name.split("/");
        const length = split.length;
        return split[length - 1] === split[length - 2];
    }));
    if (malformed) debugger;
};

class StateTracker {
    constructor() {
        const driver = [ localforage.INDEXEDDB, localforage.WEBSQL, localforage.LOCALSTORAGE ];
        this.store = localforage.createInstance({
            driver: driver,
            name: "service-worker",
            version: 1,
            storeName: "changes",
            description: "keep track of changes not pushed to provider"
        });
        this.getState = this.getState.bind(this);
        this.setState = this.setState.bind(this);
        this.withState = this.withState.bind(this);
        this.closeFile = this.withState([ "opened" ], this.closeFile);
        this.openFile = this.withState([ "changed", "opened" ], this.openFile);
    }
    async setState({opened: opened = [], selected: selected = {}} = {}) {
        const {store: store} = this;
        debugIfMalformed(opened);
        opened && await store.setItem(`state-${currentService$1.name}-opened`, opened);
        selected && await store.setItem(`tree-${currentService$1.name}-selected`, selected.name);
    }
    async getState(which = []) {
        const {store: store} = this;
        const state = {
            opened: () => store.getItem(`state-${currentService$1.name}-opened`),
            changed: async () => (await store.keys()).filter((key => key.startsWith(currentService$1.name))).map((key => key.replace(currentService$1.name + "/", "")))
        };
        const results = {};
        for (let i = 0, len = which.length; i < len; i++) {
            const whichProp = which[i];
            results[whichProp] = await state[whichProp]() || undefined;
        }
        return results;
    }
    withState(depends, fn) {
        return async arg => {
            if (!currentService$1) return;
            const {setState: setState, getState: getState} = this;
            const current = await getState(depends);
            const result = await fn(current, arg);
            setState(result);
        };
    }
    // close a file (or folder)
    closeFile({opened: opened = []}, filename) {
        if (!filename) return {};
        if (filename.startsWith("/")) filename = filename.slice(1);
        filename = filename.replace(currentService$1.name + "/", "");
        const filterOpened = isFolder(filename) ? x => !x.name.startsWith(filename) : x => x.name !== filename;
        opened = opened.filter(filterOpened);
        [ ...opened ].sort(((a, b) => a.order - b.order)).forEach(((x, i) => x.order = i));
        const selected = opened.find((x => x.order === 0));
        return {
            opened: opened,
            selected: selected
        };
    }
    openFile({changed: changed = [], opened: opened = []}, filename) {
        if (!filename) return {};
        if (filename.startsWith("/")) filename = filename.slice(1);
        filename = filename.replace(currentService$1.name + "/", "");
        const lastFile = opened[opened.length - 1];
        const lastFileIsChanged = lastFile ? changed.includes(lastFile.name) : true;
        let selected = opened.find((x => x.name === filename));
        opened.forEach((x => x.order += 1));
        if (!selected && !lastFileIsChanged) {
            opened = opened.filter((x => x.name !== lastFile.name));
        }
        if (!selected) {
            selected = {
                name: filename
            };
            opened.push(selected);
        }
        selected.order = -Number.MAX_VALUE;
        [ ...opened ].sort(((a, b) => a.order - b.order)).forEach(((x, i) => x.order = i));
        return {
            opened: opened,
            selected: selected
        };
    }
}

const stateTracker = new StateTracker;

class ServiceSwitcher {
    shouldSwitch(event) {
        try {
            const {source: source, op: op, result: result} = event.detail;
            if (op === "update" && source === "Terminal" && result.length === 1) {
                this.newService = result[0];
                return true;
            }
        } catch (e) {}
        return false;
    }
    switch() {
        const {newService: newService} = this;
        currentService$1 = newService;
        // TODO: other things that could be set here (maybe should not)
        // currentFile;
        // currentFilePath;
        // currentFolder;
        }
}

const serviceSwitcher = new ServiceSwitcher;

const flattenTree$2 = (tree, folderPaths) => {
    const results = [];
    const recurse = (branch, parent = "/") => {
        const leaves = Object.keys(branch);
        leaves.map((key => {
            const children = Object.keys(branch[key]);
            if (!children || !children.length) {
                results.push({
                    name: key,
                    code: parent + key,
                    path: parent + key
                });
            } else {
                if (folderPaths) {
                    results.push({
                        name: key,
                        path: parent + key
                    });
                }
                recurse(branch[key], `${parent}${key}/`);
            }
        }));
    };
    recurse(tree);
    return results;
};

function getDefaultFile(service) {
    let defaultFile;
    try {
        const manifestJson = JSON.parse(service.code.find((x => x.name === "service.manifest.json")).code);
        defaultFile = manifestJson.main;
    } catch (e) {}
    try {
        const packageJson = JSON.parse(service.code.find((x => x.name === "package.json")).code);
        defaultFile = packageJson.main;
    } catch (e) {}
    return defaultFile || "index.js";
}

// has side effects of setting current code
const getCurrentService = ({pure: pure} = {}) => {
    if (pure) {
        //if (!currentService?.code) debugger;
        return currentService$1;
    }
    const changedArray = Object.keys(state.changedFiles).map((k => state.changedFiles[k]));
    const mostRecent = changedArray.map((x => x[x.length - 1]));
    //error here because currentService is wrong sometimes
    // SIDE EFFECTS!!!
        mostRecent.forEach((m => {
        const found = currentService$1.code.find((x => {
            x.path === `/${currentService$1.name}/${m.filename}` || x.name === m.filename;
        }));
        if (!found) {
            console.error({
                changedArray: changedArray,
                mostRecent: mostRecent,
                filename: m.filename,
                found: found || "notfound"
            });
            return;
        }
        found.code = m.code;
    }));
    return currentService$1;
};

// has side-effects of setting currentService and currentFile
// this should really be broken out into:
//    setCurrentFile, setCurrentService
//    getCurrentFile, getCurrentService
function setCurrentFile({filePath: filePath, fileName: fileName}) {
    if (filePath) {
        currentFile = filePath.split("/").pop();
        //currentFilePath = `/${currentService.name}/${filePath}`;
                currentFilePath = filePath;
        return;
    }
    currentFile = fileName;
    currentFilePath = undefined;
}

function getCurrentFile() {
    return currentFilePath || currentFile;
}

function setCurrentService(service) {
    return getCodeFromService(service);
}

function getCodeFromService(service, file) {
    const serviceAction = !!service ? "set" : "get";
    const fileAction = !!file ? "set" : "get";
    if (serviceAction === "set" && currentService$1 && Number(currentService$1.id) !== Number(service.id)) {
        resetState();
    }
    if (serviceAction === "set") {
        currentService$1 = service;
    }
    if (serviceAction === "get") {
        //this caues service files based on changedArray
        getCurrentService();
    }
    if (fileAction === "set") {
        currentFile = file;
    }
    if (fileAction === "get") {
        currentFile = currentFile || getDefaultFile(currentService$1);
    }
    const code = Array.isArray(currentService$1.code) ? (currentService$1.code.find((x => x.name === currentFile)) || {}).code || "" : isString((() => currentService$1.code)) ? currentService$1.code : "";
    return {
        name: currentService$1.name,
        id: currentService$1.id,
        // may be able to make next two lines go away (and also other code and file related stuff
        code: code,
        filename: currentFile
    };
}

function getState({folderPaths: folderPaths, serviceRelative: serviceRelative} = {}) {
    //TODO: should probably pull only latest state change
    let paths;
    try {
        const tree = serviceRelative ? currentService$1.tree[currentService$1.name] : currentService$1.tree;
        paths = flattenTree$2(tree, folderPaths);
    } catch (e) {}
    return JSON.parse(JSON.stringify({
        ...state,
        paths: paths
    }));
}

const getCurrentFolder = () => currentFolder;

const setCurrentFolder = path => {
    currentFolder = path;
};

const resetState = () => {
    //console.log(`Current Service reset!`);
    currentFile = currentService$1 = null;
    state.changedFiles = {};
};

function openFile({name: name, parent: parent, path: path, ...other}) {
    const fullName = ((p, n) => {
        if (!p) return n;
        if (n && p.endsWith(n)) return p;
        return `${p}/${n}`;
    })((path || parent || "").trim(), (name || "").trim());
    if (!state.openedFiles[fullName] || !state.openedFiles[fullName].selected) {
        //purposefully not awaiting this, should listen not block
        stateTracker.openFile(fullName);
    }
    const SOME_BIG_NUMBER = Math.floor(Number.MAX_SAFE_INTEGER / 1.1);
    Object.entries(state.openedFiles).forEach((([k, v]) => {
        v.selected = false;
    }));
    state.openedFiles[fullName] = {
        name: fullName,
        ...other,
        selected: true,
        order: SOME_BIG_NUMBER
    };
    //NOTE: well-intentioned, but not currently working right
    //currentFile = fullName;
        Object.entries(state.openedFiles).sort((([ka, a], [kb, b]) => a.order - b.order)).forEach((([k, v], i) => {
        v.order = i;
    }));
}

function closeFile({name: name, filename: filename, parent: parent, path: path, next: next, nextPath: nextPath}) {
    path = path || parent;
    name = name || filename;
    const fullName = path ? `${path}/${name}` : name;
    const nextFullName = nextPath ? `${nextPath}/${next}` : next;
    //purposefully not awaiting this, should listen not block
        stateTracker.closeFile(fullName);
    const objEntries = Object.entries(state.openedFiles).map((([key, value]) => value)).filter((x => x.name !== fullName)).sort(((a, b) => a.order - b.order)).map(((x, i) => {
        const selected = x.name === nextFullName;
        return {
            ...x,
            order: i,
            selected: selected
        };
    })).map((x => {
        const fullName = x.parent ? `${x.parent}/${x.name}` : x.name;
        return [ fullName, x ];
    }));
    state.openedFiles = Object.fromEntries(objEntries);
}

function getOpenedFiles() {
    return Object.entries(state.openedFiles).map((([key, value]) => value)).sort(((a, b) => a.order - b.order)).map(((x, i) => ({
        ...x,
        ...{
            order: i
        }
    })));
}

const operationDoneHandler$1 = event => {
    if (serviceSwitcher.shouldSwitch(event)) serviceSwitcher.switch();
    if (listenerQueue.length === 0) {
        //console.warn('nothing listening!');
        return;
    }
    const {detail: detail} = event;
    const {op: op, id: id, result: result, operation: operation, listener: listener} = detail;
    const foundQueueItem = listener && listenerQueue.find((x => x.id === listener));
    if (!foundQueueItem) {
        //console.warn(`nothing listening for ${listener}`);
        return false;
    }
    listenerQueue = listenerQueue.filter((x => x.id !== listener));
    foundQueueItem.after && foundQueueItem.after({
        result: {
            result: result
        }
    });
    return true;
};

const operationsHandler$1 = event => {
    const {operation: operation} = event.detail || {};
    if (!operation || ![ "deleteFile" ].includes(operation)) return;
    if (operation === "deleteFile") {
        closeFile(event.detail);
        return;
    }
};

const events = [ {
    eventName: "operationDone",
    listener: operationDoneHandler$1
}, {
    eventName: "operations",
    listener: operationsHandler$1
}, {
    eventName: "fileClose",
    listener: event => closeFile(event.detail)
}, {
    eventName: "fileSelect",
    listener: event => openFile(event.detail)
}, {
    eventName: "open-settings-view",
    listener: event => openFile({
        name: "system::open-settings-view"
    })
} ];

events.map((args => attach({
    name: "State",
    ...args
})));

// https://davidwalsh.name/javascript-debounce-function
/*
function debounce(func, wait, immediate) {
	var timeout;
	return function() {
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
*/ const debounce = (func, wait) => {
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

/*
2021-02-26 15:21

there are two different ways of handling a Management Operation

1) trigger event.type=operation event with detail.operation = {some management op}
	- tree does this

2) trigger event.type={some management op} event
	- terminal does this

THIS IS CONFUSING - going to kill #2

*/ const pathNoServiceName = (service, path) => {
    if (!path.includes("/")) return path;
    if (!path.includes(service.name)) return stripLeadSlash(path);
    return stripLeadSlash(stripLeadSlash(path).replace(service.name, ""));
};

const tryFn = (fn, _default) => {
    try {
        return fn();
    } catch (e) {
        return _default;
    }
};

const stripLeadSlash = (path = "") => path[0] === "/" ? path.slice(1) : path;

const flattenTree$1 = tree => {
    const results = [];
    const recurse = (branch, parent = "/") => {
        const leaves = Object.keys(branch);
        leaves.map((x => {
            results.push({
                name: x,
                parent: parent
            });
            recurse(branch[x], x);
        }));
    };
    recurse(tree);
    return results;
};

const guessCurrentFolder = (currentFile, currentService) => {
    if ((currentFile || "").includes("/")) {
        const parent = currentFile.split("/").slice(0, -1).join("/");
        return parent.includes(currentService.name) ? parent.replace(`${currentService.name}/`, "") : parent;
    }
    if (!currentService) return "/";
    //return currentService.name;
        let parent;
    try {
        const flat = flattenTree$1(currentService.tree[Object.keys(currentService.tree)[0]]);
        // TODO: should follow parents up tree and build path from that
                let done;
        let path = [];
        let file = currentFile;
        while (!done) {
            file = flat.find((x => x.name === file)).parent;
            if (file === "/") {
                done = true;
            } else {
                path.push(file);
            }
        }
        parent = "/" + path.reverse().join("/");
    } catch (e) {}
    return parent;
};

async function performOp(currentService, operations, performOperation, externalStateRequest, callback) {
    const files = JSON.parse(JSON.stringify(currentService.code));
    const body = {
        id: currentService.id,
        name: currentService.name,
        code: JSON.stringify({
            tree: currentService.tree,
            files: files
        })
    };
    const foundOp = operations.find((x => x.name === "update"));
    const foundOpClone = JSON.parse(JSON.stringify(foundOp));
    foundOpClone.config = foundOpClone.config || {};
    foundOpClone.config.body = JSON.stringify(body);
    foundOpClone.eventToBody = foundOp.eventToBody;
    foundOpClone.eventToParams = foundOp.eventToParams;
    foundOpClone.after = (...args) => {
        foundOp.after(...args);
        callback && callback(null, "DONE");
    };
    await performOperation(foundOpClone, {
        body: body
    }, externalStateRequest);
}

// -----------------------------------------------------
const showCurrentFolderHandler = ({managementOp: managementOp, performOperation: performOperation, externalStateRequest: externalStateRequest, getCurrentFile: getCurrentFile, getCurrentService: getCurrentService, getCurrentFolder: getCurrentFolder}) => event => {
    // this should move to management.mjs
    const {detail: detail} = event;
    const {callback: callback} = detail;
    const currentFile = getCurrentFile();
    const currentService = getCurrentService({
        pure: true
    });
    const currentFolder = getCurrentFolder();
    if (!currentService) {
        callback && callback("unable to read current service");
        return;
    }
    const parent = currentFolder ? currentFolder : guessCurrentFolder(currentFile, currentService);
    const currentFolderResponse = parent === "/" ? currentService.name + "/" : `${currentService.name}/${stripLeadSlash(parent)}`;
    callback && callback(!parent ? "trouble finding current path" : false, currentFolderResponse, currentService?.name);
};

const changeCurrentFolderHandler = ({managementOp: managementOp, performOperation: performOperation, externalStateRequest: externalStateRequest, getCurrentFile: getCurrentFile, getCurrentService: getCurrentService, getCurrentFolder: getCurrentFolder, setCurrentFolder: setCurrentFolder}) => event => {
    console.log("OPERATIONS: changeCurrentFolder");
    const {detail: detail} = event;
    const {callback: callback, folderPath: folderPath} = detail;
    const currentService = getCurrentService({
        pure: true
    });
    const currentFile = getCurrentFile();
    const currentFolder = getCurrentFolder() || guessCurrentFolder(currentFile, currentService);
    const firsChar = folderPath[0];
    let currentPath = (firsChar === "/" ? folderPath : (currentFolder || "") + "/" + folderPath).replace(/\/\//g, "/");
    if (folderPath.includes("..")) {
        currentPath = (currentFolder || "").split("/").slice(0, -1).join("/") || "/";
        const restOfPath = folderPath.replace("..", "");
        if (restOfPath) {
            currentPath += restOfPath;
        }
    }
    setCurrentFolder(currentPath);
    const folderSelectEvent = new CustomEvent("folderSelect", {
        bubbles: true,
        detail: {
            name: currentPath
        }
    });
    document.body.dispatchEvent(folderSelectEvent);
    callback && callback(null, " ");
};

const addFolderHandler = ({managementOp: managementOp, performOperation: performOperation, externalStateRequest: externalStateRequest, getCurrentFile: getCurrentFile, getCurrentService: getCurrentService, operations: operations, getOperations: getOperations}) => async event => {
    const {detail: detail} = event;
    const {callback: callback} = detail;
    const currentService = getCurrentService({
        pure: true
    });
    const currentFile = getCurrentFile();
    operations = operations || getOperations((() => {}), (() => {}));
    event.detail.operation = event.detail.operation || event.type;
    const op = managementOp(event);
    op(event, currentService, currentFile);
    await performOp(currentService, operations, performOperation, externalStateRequest, callback);
};

const renameFolderHandler = ({managementOp: managementOp, performOperation: performOperation, externalStateRequest: externalStateRequest, getCurrentFile: getCurrentFile, getCurrentService: getCurrentService, operations: operations}) => async event => {
    // console.log('OPERATIONS: renameFolder');
    const {detail: detail} = event;
    const {callback: callback} = detail;
    const currentService = getCurrentService({
        pure: true
    });
    const currentFile = getCurrentFile();
    event.detail.operation = event.detail.operation || event.type;
    managementOp(event, currentService, currentFile);
    //currentService, operations, performOperation, externalStateRequest
        await performOp(currentService, operations, performOperation, externalStateRequest, callback);
};

const deleteFolderHandler = ({managementOp: managementOp, performOperation: performOperation, externalStateRequest: externalStateRequest, getCurrentFile: getCurrentFile, getCurrentService: getCurrentService, operations: operations}) => async event => {
    const {detail: detail} = event;
    const {callback: callback} = detail;
    const currentService = getCurrentService({
        pure: true
    });
    const currentFile = getCurrentFile();
    event.detail.operation = event.detail.operation || event.type;
    managementOp(event, currentService, currentFile);
    await performOp(currentService, operations, performOperation, externalStateRequest, callback);
};

const moveFolderHandler = ({managementOp: managementOp, performOperation: performOperation, externalStateRequest: externalStateRequest, getCurrentFile: getCurrentFile, getCurrentService: getCurrentService, operations: operations}) => async event => {
    //console.log('OPERATIONS: move');
    const {detail: detail} = event;
    const {callback: callback} = detail;
    const currentService = getCurrentService({
        pure: true
    });
    const currentFile = getCurrentFile();
    event.detail.operation = event.detail.operation || event.type;
    managementOp(event, currentService, currentFile);
    await performOp(currentService, operations, performOperation, externalStateRequest, callback);
};

const moveFileHandler = ({managementOp: managementOp, performOperation: performOperation, externalStateRequest: externalStateRequest, getCurrentFile: getCurrentFile, getCurrentService: getCurrentService, operations: operations}) => async event => {
    //console.log('OPERATIONS: move');
    const {detail: detail} = event;
    const {callback: callback} = detail;
    const currentService = getCurrentService({
        pure: true
    });
    const currentFile = getCurrentFile();
    event.detail.operation = event.detail.operation || event.type;
    managementOp(event, currentService, currentFile);
    await performOp(currentService, operations, performOperation, externalStateRequest, callback);
};

const readFolderHandler = ({managementOp: managementOp, performOperation: performOperation, externalStateRequest: externalStateRequest, getCurrentFile: getCurrentFile, getCurrentService: getCurrentService, getCurrentFolder: getCurrentFolder}) => event => {
    // this should move to management.mjs
    const {detail: detail} = event;
    const {callback: callback} = detail;
    const currentFile = getCurrentFile();
    const currentService = getCurrentService({
        pure: true
    });
    const currentFolder = getCurrentFolder();
    const parent = currentFolder ? currentFolder : guessCurrentFolder(currentFile, currentService);
    event.detail.operation = "readFolder";
    const op = managementOp(event, currentService, currentFile, currentFolder);
    const children = op(event, currentService, currentFile, parent);
    callback && callback(!parent || !children ? "trouble finding current path or children" : false, children && children.length ? children.join("\n") : "<empty>");
};

const fileChangeHandler = (...args) => debounce((event => {
    const {getState: getState, getOperations: getOperations, performOperation: performOperation, triggerOperationDone: triggerOperationDone, getCurrentService: getCurrentService} = args[0];
    getState();
    const service = getCurrentService({
        pure: true
    }).name;
    const operations = getOperations();
    const changeOp = (operations || []).find((x => x.name === "change"));
    const {filePath: filePath, code: code} = event.detail;
    const path = `./${service}/${filePath}`;
    (async () => {
        const results = await performOperation(changeOp, {
            path: path,
            code: code,
            service: service
        });
        triggerOperationDone(results);
    })();
}), 300)
// ----------------------------------------------------------------------------------------------------------
;

const updateServiceHandler = async ({getCurrentService: getCurrentService, getState: getState, performOperation: performOperation, foundOp: foundOp, manOp: manOp}) => {
    try {
        const service = getCurrentService();
        const state = getState();
        //TODO: maybe some day get fancy and only send changes
        // for now, just update all service files that have changed and send whole service
                Object.keys(state.changedFiles).forEach((chKey => {
            const [serviceId, serviceName, filename] = chKey.split("|");
            const changes = state.changedFiles[chKey];
            const foundFile = service.code.find((x => x.name === filename));
            foundFile.code = changes[changes.length - 1];
        }));
        const body = service;
        const eventData = {
            body: body
        };
        if (manOp && manOp.listener) {
            eventData.listener = manOp.listener;
        }
        const results = await performOperation(foundOp, eventData);
        return results;
    } catch (e) {
        console.error("error updating service");
        console.error(e);
    }
};

const serviceOperation = async ({service: {name: service}, operation: command, filename: filename, folderName: folderName, parent: parent = ""}) => {
    const base = parent.includes(service) ? parent : `${service}/${parent}`;
    const path = `/${base}/${filename || folderName}`;
    const options = {
        method: "POST",
        body: JSON.stringify({
            path: path,
            command: command,
            service: service
        })
    };
    const result = await fetch("service/change", options).then((x => x.json()));
    return result;
};

const operationsHandler = ({managementOp: managementOp, externalStateRequest: externalStateRequest, getCurrentFile: getCurrentFile, getCurrentService: getCurrentService, setCurrentService: setCurrentService, getCurrentFolder: getCurrentFolder, setCurrentFolder: setCurrentFolder, getState: getState, resetState: resetState, getOperations: getOperations, getReadAfter: getReadAfter, getUpdateAfter: getUpdateAfter, performOperation: performOperation, operationsListener: operationsListener, triggerOperationDone: triggerOperationDone, getChainedTrigger: getChainedTrigger}) => async event => {
    try {
        // deprecate from dummyFunc -> updateAfter -> readAfter;
        const dummyFunc = () => {};
        const updateAfter = getUpdateAfter(dummyFunc, dummyFunc, dummyFunc);
        const readAfter = getReadAfter(dummyFunc);
        const allOperations = getOperations(updateAfter, readAfter);
        const {detail: detail} = event;
        const {callback: callback} = detail;
        // NOTE: simple operations handling - tell service worker to do everything
                const stripLeadingSlash = (s = "") => s.startsWith("/") ? s.slice(1) : s;
        const swOps = {
            addFile: (detail, op, service) => {
                const {parent: parent, filename: filename} = detail;
                op.target = stripLeadingSlash(`${parent}/${filename}`.replace(service + "/", ""));
                op.source = "\n";
            },
            addFolder: (detail, op, service) => {
                const {folderName: folderName, parent: parent} = detail;
                op.target = stripLeadingSlash(`${parent}/${folderName}`.replace(service + "/", ""));
                delete op.source;
            },
            moveFile: (detail, op, service) => {
                debugger;
            },
            moveFolder: (detail, op, service) => {
                const {folderName: folderName} = detail;
                if (op.target === op.source) return {
                    error: "invalid move operation"
                };
                op.target = op.target.replace(new RegExp(`${folderName}$`), "");
            },
            copyFile: (detail, op, service) => {
                debugger;
            },
            copyFolder: (detail, op, service) => {
                debugger;
            },
            renameFile: (detail, op, service) => {
                debugger;
            },
            renameFolder: (detail, op, service) => {
                debugger;
            },
            deleteFile: (detail, op, service) => {
                const {parent: parent, filename: filename} = detail;
                op.source = stripLeadingSlash(`${parent}/${filename}`.replace(service + "/", ""));
                delete op.target;
            },
            deleteFolder: (detail, op, service) => {
                const {parent: parent, filename: filename} = detail;
                op.source = stripLeadingSlash(`${parent}/${filename}`.replace(service + "/", ""));
                delete op.target;
            }
        };
        if (Object.keys(swOps).includes(detail?.operation)) {
            console.log("%c using service worker for: %c" + detail.operation, "color: blue;", "color: yellow;");
            const updateOp = allOperations.find((x => x.name === "update"));
            const currentService = getCurrentService() || {};
            currentService.name = currentService.name || "service-not-found";
            const body = {
                name: currentService.name,
                id: currentService.id,
                operation: {
                    name: event.detail.operation
                }
            };
            try {
                body.operation.source = event.detail.src.replace(currentService.name + "/", "");
            } catch (e) {}
            try {
                body.operation.target = event.detail.tgt.replace(currentService.name + "/", "");
            } catch (e) {}
            const {error: error} = swOps[detail.operation](event.detail, body.operation, currentService.name) || {};
            if (error) {
                console.error("time to reconsider your life..");
                debugger;
                return;
            }
            const result = await performOperation(updateOp, {
                body: body
            });
            const updatedService = result?.detail?.result[0];
            setCurrentService(updatedService);
            triggerOperationDone(result);
            callback && callback(undefined, result);
            return;
        }
        if (detail && detail.operation === "showCurrentFolder") {
            return showCurrentFolderHandler({
                getCurrentFile: getCurrentFile,
                getCurrentService: getCurrentService,
                getCurrentFolder: getCurrentFolder
            })(event);
        }
        if (detail && detail.operation === "changeCurrentFolder") {
            return changeCurrentFolderHandler({
                getCurrentFile: getCurrentFile,
                getCurrentService: getCurrentService,
                getCurrentFolder: getCurrentFolder,
                setCurrentFolder: setCurrentFolder
            })(event);
        }
        const manageOp = managementOp(event);
        if (manageOp) {
            const currentService = getCurrentService();
            const currentFile = getCurrentFile();
            const currentFolder = getCurrentFolder() || guessCurrentFolder(currentFile, currentService);
            const manageOpResult = manageOp(event, currentService, currentFile, currentFolder);
            if (!manageOpResult || manageOpResult.operation !== "updateProject") {
                if (!callback) {
                    debugger;
                    return;
                }
                //some management ops do not require state update!?
                                callback(null, manageOpResult);
                //might be cool to do this another way (but needs work)
                //triggerOperationDone(manageOpResult);
                                return;
            }
            // deleteFolder, addFolder, moveFile, moveFolder(?) needs to handle non-callback flow (operationDone)
                        const foundOp = allOperations.find((x => x.name === "update"));
            const result = await updateServiceHandler({
                getCurrentService: getCurrentService,
                getState: getState,
                performOperation: performOperation,
                foundOp: foundOp,
                manOp: manageOpResult
            });
            //if this is a deleteFile or deleteFolder, provider needs to know (and shouldn't have to guess)
            //this probably is the only thing that needs to be done (and not what is above!)
                        let deleteResult;
            if ([ "deleteFile", "deleteFolder" ].includes(event.detail.operation)) {
                deleteResult = await serviceOperation({
                    service: currentService,
                    ...event.detail
                });
                console.log(JSON.stringify(deleteResult, null, 2));
            }
            triggerOperationDone(result);
            const chainedTrigger = getChainedTrigger(event);
            if (chainedTrigger) {
                await chainedTrigger();
            }
            callback && callback(undefined, deleteResult || result);
            return;
        }
        const foundOp = allOperations.find((x => x.name === event.detail.operation));
        if (!foundOp) {
            return;
        }
        if (foundOp.name === "update") {
            const result = await updateServiceHandler({
                getCurrentService: getCurrentService,
                getState: getState,
                performOperation: performOperation,
                foundOp: foundOp
            });
            triggerOperationDone(result);
            return;
        }
        const result = await performOperation(foundOp, event.detail);
        triggerOperationDone(result);
        //wrangle context(state?)?
        //execute operation with context
        //debugger;
        } catch (e) {
        console.error(e);
    }
};

const providerHandler = ({managementOp: managementOp, externalStateRequest: externalStateRequest, getCurrentFile: getCurrentFile, getCurrentService: getCurrentService, setCurrentService: setCurrentService, getCurrentFolder: getCurrentFolder, setCurrentFolder: setCurrentFolder, getState: getState, resetState: resetState, getOperations: getOperations, getReadAfter: getReadAfter, getUpdateAfter: getUpdateAfter, performOperation: performOperation, operationsListener: operationsListener, triggerOperationDone: triggerOperationDone}) => event => {
    const {detail: detail, type: type} = event;
    if (![ "provider-test", "provider-save", "provider-add-service" ].includes(type)) {
        return;
    }
    let {data: data} = detail;
    data = data.reduce(((all, one) => {
        // this is just an extra step, probably should remove it
        const mappedName = {
            "provider-url": "providerUrl",
            "provider-type": "providerType",
            "provider-access-token": "auth",
            "provider-repository": "repo",
            "provider-repository-branch": "branch"
        }[one.name];
        if (!mappedName) {
            console.error("could not find data mapping!");
            return;
        }
        all[mappedName] = one.value;
        return all;
    }), {});
    //TODO: provider-add-service should just be service/create with provider passed as argument
        const handler = operationsHandler({
        managementOp: managementOp,
        externalStateRequest: externalStateRequest,
        getCurrentFile: getCurrentFile,
        getCurrentService: getCurrentService,
        setCurrentService: setCurrentService,
        getCurrentFolder: getCurrentFolder,
        setCurrentFolder: setCurrentFolder,
        getState: getState,
        resetState: resetState,
        getOperations: getOperations,
        getReadAfter: getReadAfter,
        getUpdateAfter: getUpdateAfter,
        performOperation: performOperation,
        operationsListener: operationsListener,
        triggerOperationDone: triggerOperationDone
    });
    return handler({
        detail: {
            ...data,
            operation: type
        }
    });
};

const operationDoneHandler = ({getCurrentService: getCurrentService, setCurrentService: setCurrentService, triggerServiceSwitchNotify: triggerServiceSwitchNotify}) => event => {
    const result = tryFn((() => event.detail.result), []);
    const op = tryFn((() => event.detail.op), "");
    const inboundService = tryFn((() => event.detail.result[0]), {});
    const wasAllServicesRead = !event.detail.id && event.detail.id !== 0;
    const readOneServiceDone = result?.length === 1 && op === "read" && (inboundService?.id || inboundService?.id === 0) && inboundService?.id !== "*" && !wasAllServicesRead;
    if (!readOneServiceDone) return;
    // TODO: this should be handled in state event handler..
        if (readOneServiceDone) {
        const currentService = getCurrentService({
            pure: true
        });
        const isNewService = !currentService || Number(inboundService.id) !== Number(currentService.id);
        if (!isNewService) return;
        setCurrentService(inboundService);
        triggerServiceSwitchNotify();
        return;
    }
};

const handlers = {
    showCurrentFolderHandler: showCurrentFolderHandler,
    changeCurrentFolderHandler: changeCurrentFolderHandler,
    addFolderHandler: addFolderHandler,
    readFolderHandler: readFolderHandler,
    deleteFolderHandler: deleteFolderHandler,
    renameFolderHandler: renameFolderHandler,
    moveFolderHandler: moveFolderHandler,
    moveFileHandler: moveFileHandler,
    operationsHandler: operationsHandler,
    operationDoneHandler: operationDoneHandler,
    "provider-test": providerHandler,
    "provider-save": providerHandler,
    "provider-add-service": providerHandler,
    fileChangeHandler: fileChangeHandler
};

const getChainedTrigger = ({triggers: triggers}) => event => {
    const handler = {
        addFile: async () => {
            const service = getCurrentService({
                pure: true
            });
            const name = event.detail.parent ? `${event.detail.parent}/${event.detail.name}` : event.detail.name;
            triggers.triggerFileSelect({
                detail: {
                    name: pathNoServiceName(service, name)
                }
            });
        },
        deleteFile: async () => {
            const name = event.detail.parent ? `${event.detail.parent}/${event.detail.name}` : event.detail.name;
            const allOpen = getOpenedFiles() || [];
            const opened = allOpen.filter((x => x.name !== name));
            if (allOpen?.length === opened?.length) return;
            let next;
            if (opened.length) {
                next = opened[opened.length - 1].name;
            }
            const alreadySelected = allOpen.find((x => x.selected));
            if (alreadySelected) {
                next = alreadySelected.name;
            }
            triggers.triggerFileClose({
                detail: {
                    name: name,
                    next: next
                }
            });
        }
    }[event.detail.operation];
    return handler;
};

function attachListeners(args) {
    const triggers = {
        triggerServiceSwitchNotify: attachTrigger({
            name: "Operations",
            eventName: "service-switch-notify",
            type: "raw"
        }),
        triggerOperationDone: attachTrigger({
            name: "Operations",
            eventName: "operationDone",
            type: "raw"
        }),
        triggerFileSelect: attachTrigger({
            name: "Operations",
            eventName: "fileSelect",
            type: "raw"
        }),
        triggerFileClose: attachTrigger({
            name: "Operations",
            eventName: "fileClose",
            type: "raw"
        })
    };
    const mapListeners = handlerName => {
        const eventName = handlerName.replace("Handler", "");
        attach({
            name: "Operations",
            eventName: eventName,
            listener: handlers[handlerName]({
                ...triggers,
                getChainedTrigger: getChainedTrigger({
                    triggers: triggers
                }),
                ...args
            })
        });
    };
    Object.keys(handlers).map(mapListeners);
    return triggers;
}

const manageOp = {
    operation: "updateProject"
};

const flattenTree = tree => {
    const results = [];
    const recurse = (branch, parent = "/") => {
        const leaves = Object.keys(branch);
        leaves.map((x => {
            results.push({
                name: x,
                parent: parent
            });
            recurse(branch[x], x);
        }));
    };
    recurse(tree);
    return results;
};

function getContextFromPath(root, folderPath) {
    const split = folderPath.split("/").filter((x => !!x));
    const folderName = split.pop();
    const parentObject = split.reduce(((all, one) => {
        all[one] = all[one] || {};
        return all[one];
    }), root);
    return {
        folderName: folderName,
        parentObject: parentObject
    };
}

function uberManageOp({currentFolder: currentFolder = "/", currentService: currentService, oldName: oldName, newName: newName, createNewTree: createNewTree, deleteOldTree: deleteOldTree, createNewFile: createNewFile, deleteOldFile: deleteOldFile}) {
    let operationComplete;
    try {
        //TODO: guard against empty/improper filename
        //TODO: if path not included or relative to current
        //      add currentFolder to oldName/newName
        const rootFolderName = Object.keys(currentService.tree)[0];
        const root = currentService.tree[rootFolderName];
        let {folderName: folderName, parentObject: parentObject} = getContextFromPath(root, oldName);
        const oldFolderParent = parentObject;
        const oldFolderName = folderName;
        if (createNewTree) {
            // this clone causes problems with JSX and HTML files
            // TODO: fix probably deals with < being escaped properly
            const clonedOldFolderContents = JSON.parse(JSON.stringify(oldFolderParent[oldFolderName]));
            ({folderName: folderName, parentObject: parentObject} = getContextFromPath(root, newName));
            const newFolderParent = parentObject;
            const newFolderName = folderName;
            newFolderParent[newFolderName] = clonedOldFolderContents;
        }
        if (deleteOldTree) {
            delete oldFolderParent[oldFolderName];
        }
        if (createNewFile) {
            const oldContents = (currentService.code.find((x => x.name === oldFolderName)) || {}).code;
            currentService.code.push({
                name: folderName,
                code: oldContents
            });
        }
        if (deleteOldFile) {
            currentService.code = currentService.code.filter((x => x.name !== oldFolderName));
        }
        operationComplete = true;
    } catch (e) {}
    return operationComplete;
}

function addFile(e, currentService, currentFile) {
    let {filename: filename, parent: parent, listener: listener, untracked: untracked} = e.detail;
    let manageOp, currentServiceCode, treeEntryAdded;
    if (parent) {
        filename = parent + "/" + filename;
    }
    if (untracked) {
        currentServiceCode = JSON.parse(JSON.stringify(currentService.code));
        const currentlyUsedNumbers = currentServiceCode.filter((x => x.name.includes("Untitled-"))).map((x => Number(x.name.replace("Untitled-", ""))));
        let foundNumber;
        let potentialNumber = 1;
        while (!foundNumber) {
            if (currentlyUsedNumbers.includes(potentialNumber)) {
                potentialNumber++;
                continue;
            }
            foundNumber = potentialNumber;
        }
        const untitledName = `Untitled-${foundNumber}`;
        e.detail.filename = untitledName;
        currentServiceCode.push({
            name: untitledName,
            untracked: true,
            code: ""
        });
        manageOp = {
            operation: "updateProject",
            listener: listener
        };
        currentService.code = currentServiceCode;
        return manageOp;
    }
    try {
        //TODO: guard against empty/improper filename
        const split = filename.split("/").filter((x => !!x));
        const file = split.length > 1 ? split[split.length - 1] : undefined;
        const codePath = filename.includes(currentService.name) ? `/${filename}` : `/${currentService.name}/${filename}`;
        currentServiceCode = JSON.parse(JSON.stringify(currentService.code));
        currentServiceCode.push({
            name: file || filename,
            code: codePath,
            path: codePath
        });
        if (e.detail.untracked) {}
        let alreadyPlaced;
        if (file) {
            let parentPath = split.filter((x => x !== file)).join("/");
            const rootFolderName = Object.keys(currentService.tree)[0];
            parentPath = parentPath.replace(new RegExp(`^${rootFolderName}/`), "");
            const root = currentService.tree[rootFolderName];
            const {parentObject: parentObject} = getContextFromPath(root, parentPath);
            const context = parentObject[parentPath.split("/").pop()] || parentObject;
            context[file] = {};
            alreadyPlaced = true;
        }
        !alreadyPlaced && (currentService.tree[Object.keys(currentService.tree)[0]][filename] = {});
        treeEntryAdded = true;
        manageOp = {
            operation: "updateProject",
            listener: listener
        };
    } catch (e) {
        console.log("could not add file");
        console.log(e);
        return;
    }
    if (manageOp && currentServiceCode && treeEntryAdded) {
        currentService.code = currentServiceCode;
    }
    return manageOp;
}

function renameFile(e, currentService, currentFile) {
    const {filename: filename, newName: newName} = e.detail;
    let manageOp, currentServiceCode, treeEntryRenamed;
    try {
        //TODO: guard against empty/improper filename, newName
        currentServiceCode = JSON.parse(JSON.stringify(currentService.code));
        const fileToRename = currentServiceCode.find((x => x.name === filename));
        fileToRename.name = newName;
        //TODO: only handles root level files!!!
                const rootLevel = currentService.tree[Object.keys(currentService.tree)[0]];
        delete rootLevel[filename];
        rootLevel[newName] = {};
        treeEntryRenamed = true;
        manageOp = {
            operation: "updateProject"
        };
    } catch (e) {
        console.log("could not rename file");
        console.log(e);
    }
    if (manageOp && currentServiceCode && treeEntryRenamed) {
        currentService.code = currentServiceCode;
    }
    // console.log(JSON.stringify({ currentService }, null, 2 ));
    // return;
        return manageOp;
}

function deleteFile(e, currentService, currentFile) {
    //console.log('deleteFile');
    let {filename: filename, parent: parent, listener: listener} = e.detail;
    let manageOp, currentServiceCode, treeEntryDeleted;
    if (parent) {
        filename = parent + "/" + filename;
    }
    try {
        const split = filename.split("/").filter((x => !!x));
        const file = split[split.length - 1];
        let alreadyDeleted;
        if (file) {
            let parentPath = split.filter((x => x !== file)).join("/");
            const rootFolderName = Object.keys(currentService.tree)[0];
            parentPath = parentPath.replace(new RegExp(`^${rootFolderName}/`), "");
            const root = currentService.tree[rootFolderName];
            const {parentObject: parentObject} = getContextFromPath(root, parentPath);
            const context = parentObject[parentPath.split("/").pop()] || parentObject;
            delete context[file];
            alreadyDeleted = true;
        }
        !alreadyDeleted && delete currentService.tree[Object.keys(currentService.tree)[0]][filename];
        treeEntryDeleted = true;
        //TODO: guard against empty/improper filename
                currentServiceCode = currentService.code.filter((x => x.name !== (file || filename)));
        manageOp = {
            operation: "updateProject",
            listener: listener
        };
    } catch (e) {
        console.log("could not delete file");
        console.log(e);
        return;
    }
    if (manageOp && currentServiceCode && treeEntryDeleted) {
        currentService.code = currentServiceCode;
    }
    return manageOp;
}

function moveFile(e, currentService, currentFile) {
    //console.log('moveFile');
    const {target: target, destination: destination} = e.detail;
    //TODO: is either current selected folder or parent of currentFile
        const currentFolder = "/";
    //TODO: may want to keep same target name but move to diff folder
        const fileRenamed = uberManageOp({
        currentFolder: currentFolder,
        currentService: currentService,
        oldName: target,
        newName: destination,
        createNewTree: true,
        deleteOldTree: true,
        createNewFile: true,
        deleteOldFile: true
    });
    return fileRenamed ? manageOp : undefined;
}

function renameProject(e, currentService, currentFile) {
    console.log("renameProject");
    return;
}

function addFolder(e, currentService, currentFile) {
    //console.log('addFolder');
    let {folderName: folderName, parent: parent, listener: listener} = e.detail;
    let manageOp, folderAdded;
    if (parent) {
        folderName = parent + "/" + folderName;
    }
    try {
        //TODO: guard against empty/improper folder name
        const rootFolderName = Object.keys(currentService.tree)[0];
        folderName = folderName.replace(new RegExp(`^/${rootFolderName}`), "");
        let parentObject = currentService.tree[rootFolderName];
        if (folderName.includes("/")) {
            ({folderName: folderName, parentObject: parentObject} = getContextFromPath(parentObject, folderName));
        }
        // adding child of .keep make sure this is a folder
        // TODO: remove .keep if adding a child folder or file
        // TODO: add .keep if deleting last child folder or file
                parentObject[folderName] = {
            ".keep": {}
        };
        folderAdded = true;
        manageOp = {
            operation: "updateProject",
            listener: listener
        };
    } catch (e) {
        console.log("could not add folder");
        console.log(e);
        return;
    }
    return manageOp;
}

function renameFolder(e, currentService, currentFile) {
    const {oldName: oldName, newName: newName} = e.detail;
    //TODO: is either current selected folder or parent of currentFile
        const currentFolder = "/";
    const folderRenamed = uberManageOp({
        currentFolder: currentFolder,
        currentService: currentService,
        oldName: oldName,
        newName: newName,
        createNewTree: true,
        deleteOldTree: true,
        createNewFile: false,
        deleteOldFile: false
    });
    return folderRenamed ? manageOp : undefined;
}

function deleteFolder(e, currentService) {
    // console.log('deleteFolder');
    let {folderName: folderName, parent: parent, listener: listener} = e.detail;
    if (parent) {
        folderName = parent + "/" + folderName;
    }
    //TODO: is either current selected folder or parent of currentFile
        const currentFolder = "/";
    // delete all child files
        const rootFolderName = Object.keys(currentService.tree)[0];
    folderName = folderName.replace(new RegExp(`^/${rootFolderName}`), "");
    const root = currentService.tree[rootFolderName];
    const {folderName: folder, parentObject: parentObject} = getContextFromPath(root, folderName);
    const children = flattenTree(parentObject[folder]).map((x => x.name));
    const currentServiceCode = currentService.code.filter((c => !children.includes(c.name)));
    currentService.code = currentServiceCode;
    const folderdeleted = uberManageOp({
        deleteOldTree: true,
        oldName: folderName,
        currentFolder: currentFolder,
        currentService: currentService,
        newName: "",
        createNewTree: false,
        createNewFile: false,
        deleteOldFile: false
    });
    if (manageOp) {
        manageOp.listener = listener;
    }
    return folderdeleted ? manageOp : undefined;
}

function moveFolder(e, currentService, currentFile) {
    //console.log('moveFolder');
    const {target: target, destination: destination} = e.detail;
    //TODO: is either current selected folder or parent of currentFile
        const currentFolder = "/";
    //TODO: may want to keep same target name but move to diff folder
        const folderRenamed = uberManageOp({
        currentFolder: currentFolder,
        currentService: currentService,
        oldName: target,
        newName: destination,
        createNewTree: true,
        deleteOldTree: true,
        createNewFile: false,
        deleteOldFile: false
    });
    return folderRenamed ? manageOp : undefined;
}

function readFolder(e, currentService, currentFile, currentFolder) {
    const rootFolderName = Object.keys(currentService.tree)[0];
    const root = currentService.tree[rootFolderName];
    const {folderName: folderName, parentObject: parentObject} = getContextFromPath(root, currentFolder);
    const context = parentObject[folderName] || parentObject;
    const children = Object.keys(context).map((c => {
        const isFolder = !currentService.code.find((x => x.name === c));
        return isFolder ? `...${c}/` : c;
    })).sort().map((x => x.replace("...", "")));
    return children;
}

const ops = {
    addFile: addFile,
    renameFile: renameFile,
    deleteFile: deleteFile,
    moveFile: moveFile,
    addFolder: addFolder,
    renameFolder: renameFolder,
    deleteFolder: deleteFolder,
    moveFolder: moveFolder,
    renameProject: renameProject,
    readFolder: readFolder
};

function managementOp(e, currentService, currentFile, currentFolder) {
    const thisOps = Object.keys(ops);
    const {operation: operation = ""} = e && e.detail || {};
    //console.log({ operation, e });
        if (!thisOps.includes(operation)) {
        return;
    }
    return ops[operation];
}

const defaultCode = _name => [ {
    name: "index.js",
    code: `const serviceName = '${_name}';\n\nconst send = (message) => {\n\tconst serviceMessage = \`\${serviceName}: \${message}\`;\n\t(process.send || console.log)\n\t\t.call(null, \`\${serviceName}: \${message}\`);\n};\n\nprocess.on('message', parentMsg => {\n\tconst _message = parentMsg + ' PONG.';\n\tsend(_message);\n});\n`
}, {
    name: "package.json",
    code: JSON.stringify({
        name: _name,
        main: "react-example.jsx",
        description: "",
        template: "",
        port: ""
    }, null, "\t")
}, {
    name: "react-example.jsx",
    code: exampleReact()
} ];

const defaultTree = _name => ({
    [_name]: {
        "index.js": {},
        "package.json": {},
        "react-example.jsx": {}
    }
});

const defaultServices = [ {
    id: 1,
    name: "API Server",
    tree: defaultTree("API Server"),
    code: defaultCode("API Server")
}, {
    id: 10,
    name: "UI Service",
    tree: defaultTree("UI Service"),
    code: defaultCode("UI Service")
}, {
    id: 777,
    name: "welcome",
    tree: [ {
        welcome: {
            "service.json": {}
        }
    } ],
    code: [ {
        name: "service.json",
        code: JSON.stringify({
            id: 777,
            type: "frontend",
            persist: "filesystem",
            path: ".welcome",
            version: .4,
            tree: null,
            code: null
        }, null, 2)
    } ]
} ];

const dummyService = (_id, _name) => ({
    id: _id + "",
    name: _name,
    code: defaultCode(_name),
    tree: defaultTree(_name)
});

const getServicesFromLS = () => {
    try {
        return JSON.parse(localStorage.getItem("localServices"));
    } catch (e) {
        return;
    }
};

const saveServiceToLS = (currentServices = [], service) => {
    try {
        const serviceToUpdate = currentServices.find((x => Number(x.id) === Number(service.id)));
        if (!serviceToUpdate) {
            currentServices.push(service);
        } else {
            serviceToUpdate.name = service.name;
            serviceToUpdate.id = service.id;
            serviceToUpdate.code = JSON.parse(service.code).files;
            serviceToUpdate.tree = JSON.parse(service.code).tree;
        }
        localStorage.setItem("localServices", JSON.stringify(currentServices));
    } catch (e) {
        return;
    }
};

let lsServices = [];

//TODO: this is intense, but save a more granular approach for future
async function fileSystemTricks({result: result}) {
    if (!result.result[0].code.find) {
        const parsed = JSON.parse(result.result[0].code);
        result.result[0].code = parsed.files;
        result.result[0].tree = parsed.tree;
        console.log("will weird things ever stop happening?");
        return;
    }
    const serviceJSONFile = result.result[0].code.find((item => item.name === "service.json"));
    if (serviceJSONFile && !serviceJSONFile.code) {
        const fetched = await fetch(`./.${result.result[0].name}/service.json`);
        serviceJSONFile.code = await fetched.text();
    }
    if (serviceJSONFile) {
        let serviceJSON = JSON.parse(serviceJSONFile.code);
        if (!serviceJSON.tree) {
            const fetched = await fetch(`./${serviceJSON.path}/service.json`);
            serviceJSONFile.code = await fetched.text();
            serviceJSON = JSON.parse(serviceJSONFile.code);
        }
        result.result[0].code = serviceJSON.files;
        result.result[0].tree = {
            [result.result[0].name]: serviceJSON.tree
        };
    }
    const len = result.result[0].code.length;
    for (var i = 0; i < len; i++) {
        const item = result.result[0].code[i];
        if (!item.code && item.path) {
            const fetched = await fetch("./" + item.path);
            item.code = await fetched.text();
        }
    }
}

async function externalStateRequest(op) {
    //debugger
    //console.log(op.name);
    let result;
    let readId, updateId;
    try {
        readId = op.name === "read" && op.url.split("read/")[1];
        if (readId) {
            localStorage.setItem("lastService", readId);
            //console.log(`should set: ${readId}`);
                }
        updateId = op.name === "update" && (o => {
            try {
                return JSON.parse(o.config.body).id;
            } catch (e) {
                return;
            }
        })(op);
        if (document.location.href.includes("apps.crosshj.com")) {
            throw new Error("Server not implemented for apps.crosshj.com");
        }
        op.config.headers = op.config.headers || {};
        if (localStorage.getItem("reloadServices") === "true") {
            op.config.headers["x-cache"] = "reload";
        } else {
            op.config.headers["x-cache"] = "force-cache";
        }
        const response = await fetch(op.url, op.config);
        result = await response.json();
        if (result.message === "read" && readId) {
            await fileSystemTricks({
                result: result
            });
        }
    } catch (e) {
        console.log(e);
        lsServices = getServicesFromLS() || defaultServices;
        if (op.name === "update") {
            if (!op.config || !op.config.body) {
                console.error("when updating, should have an operation body");
                return;
            }
            let serviceToUpdate;
            try {
                serviceToUpdate = JSON.parse(op.config.body);
            } catch (e) {}
            if (!serviceToUpdate) {
                console.error("when updating, operation body should be service to update");
                return;
            }
            if (!serviceToUpdate.name || !serviceToUpdate.id) {
                console.error("service to update is malformed!");
                return;
            }
            const untrickCode = JSON.parse(serviceToUpdate.code);
            //TODO: this is where diff between filesytem backed files would be useful
                        untrickCode.files.forEach((f => {
                if (f.path && f.name === "service.json") {
                    f.code = "";
                }
            }));
            serviceToUpdate.code = JSON.stringify(untrickCode);
            //debugger
                        if (window.DEBUG) {
                const c = JSON.parse(serviceToUpdate.code);
                debugger;
                serviceToUpdate.code = JSON.stringify(c);
            }
            saveServiceToLS(lsServices, serviceToUpdate);
            lsServices = getServicesFromLS() || [];
            //console.log(JSON.stringify(op, null, 2));
                }
        if (op.name === "create") {
            const {id: id, name: name, code: code} = JSON.parse(op.config.body);
            saveServiceToLS(lsServices, dummyService(id, name));
            lsServices = getServicesFromLS() || [];
            //debugger
                }
        if (op.name === "delete") {
            const {id: id} = JSON.parse(op.config.body);
            lsServices = getServicesFromLS() || [];
            lsServices = lsServices.filter((x => Number(x.id) !== Number(id)));
            localStorage.setItem("localServices", JSON.stringify(lsServices));
        }
        if (readId) {
            const result = {
                result: lsServices.filter((x => Number(x.id) === Number(readId)))
            };
            await fileSystemTricks({
                result: result
            });
            return result;
        }
        if (updateId) {
            return {
                result: lsServices.filter((x => Number(x.id) === Number(updateId)))
            };
        }
        result = {
            result: lsServices
        };
    }
    return result;
}

function exampleReact() {
    return `\n// (p)react hooks\nfunction useStore() {\n  let [value, setValue] = useState(1);\n\n  const add = useCallback(\n    () => setValue(value+2),\n    [value]\n  );\n\n  return { value, add };\n}\n\nconst Style = () => (\n<style dangerouslySetInnerHTML={{__html: \`\n  body { display: flex; font-size: 3em; }\n  body > * { margin: auto; }\n  #clicker {\n    cursor: pointer;\n    background: url("data:image/svg+xml,%3Csvg width='100%' height='100%' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg' xmlns:svg='http://www.w3.org/2000/svg'%3E%3Cpath d='m11.61724,2.39725c0,0.78044 -0.39092,1.94771 -0.92661,2.95967c0.00514,0.00382 0.01027,0.00764 0.01538,0.01151c0.73296,-0.83424 0.95997,-2.34561 2.82973,-2.46949c1.86977,-0.12388 4.76668,5.72251 1.72228,6.863c-0.72347,0.27102 -0.16185,0.31797 -1.28384,0.14343c0.99502,0.4928 0.39169,0.19741 0.83213,0.81656c1.90904,2.68368 -4.33675,7.09457 -6.24582,4.41089c-0.44902,-0.63121 -0.30316,-0.19483 -0.45163,-1.33693l-0.00042,0.00003l-0.00624,0c-0.1,1 0.1,0.65 -0.4,1.3c-1.9,2.7 -7.9,-2.6 -6,-5.3c0.4,-0.6 0.9,-0.2 1.9,-0.7c-1.1,0.2 -1.4,-0.1 -2,-0.3c-3,-1.1 -0.3,-6.7 2.7,-5.6c0.7,0.3 0.8,0 1.5,1l0,0c-0.5,-1 -0.6,-0.9 -0.6,-1.7c0,-3.3 6.5,-3.2 6.5,0z' fill='%238f0047' stroke-miterlimit='23' stroke-width='0' transform='rotate(118.8 8.3,8)'/%3E%3C/svg%3E") 50% no-repeat;\n    text-align: center;\n    padding: 45px;\n    padding-top: 150px;\n    user-select: none;\n    height: 200px;\n    width: 280px;\n    background-color: #002e00;\n  }\n  #clicker p { margin-top: 2px; margin-left: -50px }\n  #clicker * { filter: drop-shadow(3px 13px 4px #006600); }\n\`}} />);\n\n\n//(p)react\nconst App = () => {\n  const { value, add } = useStore();\n\n  return (\n    <div onClick={add} id="clicker" title="just click the flower already...">\n      <Style />\n      <span>kiliki aʻu</span>\n      <p>{value}</p>\n    </div>\n  );\n};`;
}

function getReadAfter(List, inlineEditor, getCodeFromService) {
    return ({result: result = {}} = {}) => {};
}

function getUpdateAfter(setCurrentService) {
    return ({result: result = {}}) => {
        //TODO: why is this even needed?
        //console.warn('Update After');
        const services = result?.result;
        if (!services || !services.length) {
            return console.error("updateAfter: error setting current service");
        }
        setCurrentService(services[0], null, "set");
    };
}

function getOperations(updateAfter, readAfter) {
    const operations = [ {
        name: "",
        url: "",
        config: {}
    }, {
        name: "create",
        url: "service/create/{id}",
        config: {
            method: "POST"
        },
        eventToParams: ({body: body = {}}) => {
            const {id: id} = body;
            if (!id) throw new Error("id is required when creating service");
            return {
                id: id
            };
        },
        eventToBody: ({body: body = {}}) => {
            const {name: name, id: id} = body;
            if (!name) throw new Error("name is required when creating service");
            if (!id) throw new Error("id is required when creating service");
            return JSON.stringify({
                name: name,
                id: id
            }, null, 2);
        },
        after: updateAfter
    }, {
        name: "read",
        url: "service/read/{id}",
        after: readAfter,
        eventToParams: ({body: body = {}}) => {
            const {id: id = ""} = body;
            return {
                id: id
            };
        }
    }, {
        name: "update",
        url: "service/update/{id}",
        config: {
            method: "POST"
        },
        after: updateAfter,
        eventToParams: ({body: body = {}}) => {
            const {id: id = ""} = body;
            return {
                id: id
            };
        },
        eventToBody: ({body: body = {}}) => {
            const {name: name, id: id} = body;
            if (!name) throw new Error("name is required when updating service");
            if (!id && typeof id !== "number") throw new Error("id is required when updating service");
            return JSON.stringify(body, null, 2);
        }
    }, {
        name: "change",
        url: "service/change",
        config: {
            method: "POST"
        },
        eventToBody: ({path: path, code: code, service: service} = {}) => {
            if (!path) throw new Error("path is required when changing service files");
            return JSON.stringify({
                path: path,
                code: code || "",
                service: service
            }, null, 2);
        }
    }, {
        name: "delete",
        url: "service/delete/{id}",
        config: {
            method: "POST"
        },
        eventToParams: ({body: body = {}}) => {
            const {id: id = ""} = body;
            return {
                id: id
            };
        }
    }, {
        name: "manage",
        url: "manage"
    }, {
        name: "monitor",
        url: "monitor"
    }, {
        name: "persist",
        url: "persist"
    }, {
        name: "provider-test",
        url: "service/provider/test",
        config: {
            method: "POST"
        },
        eventToBody: eventData => JSON.stringify(eventData, null, 2)
    }, {
        name: "provider-save",
        url: "service/provider/create",
        config: {
            method: "POST"
        },
        eventToBody: eventData => JSON.stringify(eventData, null, 2)
    }, {
        name: "provider-add-service",
        url: "service/create/provider",
        config: {
            method: "POST"
        },
        eventToBody: eventData => JSON.stringify(eventData, null, 2)
    } ];
    operations.forEach((x => {
        //x.url = `./${x.url}`;
        // if (x.config && x.config.body) {
        // 	x.config.body = JSON.stringify(x.config.body);
        // }
        x.config = x.config || {};
        x.config.headers = {
            Accept: "application/json",
            "Content-Type": "application/json"
        };
    }));
    return operations;
}

async function performOperation(operation, eventData = {}) {
    const {body: body = {}, after: after} = eventData;
    if (operation.name !== "read") {
        try {
            body.id = body.id === 0 ? body.id : body.id || (currentService || {}).id;
        } catch (e) {}
    }
    let {id: id} = body;
    const op = JSON.parse(JSON.stringify(operation));
    op.after = operation.after;
    if (after && op.name !== "read") {
        op.after = (...args) => {
            after(...args);
            op.after(...args);
        };
    } else {
        op.after = after || op.after;
    }
    if (id === "*") {
        id = "";
    }
    if (id !== "" && Number(id) === 0) {
        id = "0";
    }
    // op.config = op.config || {};
    // op.config.headers = {
    // 	...{
    // 		'Accept': 'application/json',
    // 		'Content-Type': 'application/json'
    // 	}, ...((op.config || {}).headers || {})
    // };
    // if (op.config.method !== "POST") {
    // 	delete op.config.body;
    // }
        op.url = op.url.replace("bartok/", "");
    //, externalStateRequest
    //const result = await externalStateRequest(op);
        if (operation.eventToBody) {
        op.config.body = operation.eventToBody(eventData);
    }
    if (operation.eventToParams) {
        const params = operation.eventToParams(eventData);
        Object.keys(params).forEach((key => {
            op.url = op.url.replace(`{${key}}`, !!params[key] || params[key] === 0 || params[key] === "0" ? params[key] : "");
        }));
    }
    const response = await fetch(op.url, op.config);
    const result = await response.json();
    if (op.after) {
        op.after({
            result: result
        });
    }
    const currentServiceId = localStorage.getItem("lastService");
    if (operation.name === "read" && id && id !== "*" && Number(id) !== Number(currentServiceId)) {
        localStorage.setItem("lastService", id);
        sessionStorage.removeItem("tree");
        sessionStorage.removeItem("editorFile");
        sessionStorage.removeItem("tabs");
        sessionStorage.removeItem("statusbar");
    }
    return {
        detail: {
            op: operation.name,
            id: id,
            result: result ? result.result || result : {},
            listener: eventData.listener
        }
    };
}

const operationsListener = async (e, {operations: operations, managementOp: managementOp, performOperation: performOperation, externalStateRequest: externalStateRequest, getCurrentFile: getCurrentFile, getCurrentService: getCurrentService, resetState: resetState}) => {
    if (e.detail.body.id === "undefined") {
        e.detail.body.id = undefined;
    }
    if (e.detail.body.name === "undefined") {
        e.detail.body.name = undefined;
    }
    const currentFile = getCurrentFile();
    const currentService = getCurrentService();
    // console.log(e.detail);
        const manageOp = managementOp(e, currentService, currentFile);
    let eventOp = (manageOp || {}).operation || e.detail.operation;
    if (eventOp === "cancel") {
        const foundOp = operations.find((x => x.name === "read"));
        performOperation(foundOp, {
            body: {
                id: ""
            }
        }, externalStateRequest);
        return;
    }
    // this updates project with current editor window's code
        if (eventOp === "update") {
        // console.log(JSON.stringify({ currentService}, null, 2));
        const files = JSON.parse(JSON.stringify(currentService.code));
        // NEXT: this is not needed because getCurrentService has sideffects of
        // adding  current changes to service (safe to assume???)
        // (files.find(x => x.name === currentFile) || {})
        // 	.code = e.detail.body.code;
                e.detail.body.code = JSON.stringify({
            tree: currentService.tree,
            files: files
        });
    }
    if (eventOp === "updateProject") {
        // console.log(JSON.stringify({ currentService}, null, 2));
        const files = JSON.parse(JSON.stringify(currentService.code));
        e.detail.body.code = JSON.stringify({
            tree: currentService.tree,
            files: files
        });
        e.detail.body.id = currentService.id;
        e.detail.body.name = currentService.name;
        eventOp = "update";
    }
    const foundOp = operations.find((x => x.name === eventOp));
    if (!foundOp) {
        console.error("Could not find operation!");
        console.error({
            eventOp: eventOp,
            manageOp: manageOp
        });
        e.detail.done && e.detail.done("ERROR\n");
        return;
    }
    foundOp.config = foundOp.config || {};
    //foundOp.config.body = foundOp.config.body ? JSON.parse(foundOp.config.body) : undefined;
        if (foundOp.name !== "read") {
        e.detail.body.id = e.detail.body.id === 0 ? e.detail.body.id : e.detail.body.id || (currentService || {}).id;
    }
    try {
        e.detail.body.id = e.detail.body.id || currentService.id;
        e.detail.body.name = e.detail.body.name || currentService.name;
    } catch (e) {}
    if (foundOp.name === "create") {
        e.detail.body.code = "";
    }
    foundOp.config.body = JSON.stringify(e.detail.body);
    const opsWhichResetState = [ "read" ];
    if (e.type === "operations" && opsWhichResetState.includes(e.detail.operation) && e.detail.body.id !== "*") {
        //console.log("id: " + e.detail.body.id);
        resetState();
    }
    await performOperation(foundOp, e.detail, externalStateRequest);
    e.detail.done && e.detail.done("DONE\n");
};

async function Operations() {
    const {triggerOperationDone: triggerOperationDone} = attachListeners({
        managementOp: managementOp,
        externalStateRequest: externalStateRequest,
        getCurrentFile: getCurrentFile,
        getCurrentService: getCurrentService,
        setCurrentService: setCurrentService,
        getCurrentFolder: getCurrentFolder,
        setCurrentFolder: setCurrentFolder,
        getState: getState,
        resetState: resetState,
        getOperations: getOperations,
        getReadAfter: getReadAfter,
        getUpdateAfter: getUpdateAfter,
        performOperation: performOperation,
        operationsListener: operationsListener
    });
    const lastService = localStorage.getItem("lastService") || 0;
    if (!lastService && ![ 0, "0" ].includes(lastService)) {
        const event = new CustomEvent("noServiceSelected", {
            bubbles: true,
            detail: {}
        });
        document.body.dispatchEvent(event);
        return;
    }
    // APPLICATION STATE BOOTSTRAP
        const operations = getOperations((() => {}), (
    // occurs after call to init?
    // TODO: would be nice to do away with this
    (...args) => {
        const service = args[0]?.result?.result[0];
        if (!service) return console.error("no service!");
        setCurrentService(service);
        const selected = service.treeState?.select;
        if (!selected) console.error("no tree state!");
        setCurrentFile({
            filePath: selected || ""
        });
        const name = selected.includes("/") ? selected.split("/").pop() : selected;
        const parent = selected.includes("/") ? selected.replace(`/${name}`, "") : "";
        const event = new CustomEvent("fileSelect", {
            bubbles: true,
            detail: {
                name: name,
                parent: parent
            }
        });
        document.body.dispatchEvent(event);
    }));
    //const operations = getOperations(()=>{}, ()=>{});
    // TODO: this should go away at some point!!!
    // request a list of services from server (and determine if server is accessible)
        const foundOp = operations.find((x => x.name === "read"));
    const result = await performOperation(foundOp, {
        body: {
            id: lastService
        }
    });
    triggerOperationDone(result);
}

export { Operations as default };