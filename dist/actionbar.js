/*!
	fiug actionbar component
	Version 0.4.6 ( 2022-08-19T20:19:40.460Z )
	https://github.com/fiugd/fiug/actionbar
	(c) 2020-2021 Harrison Cross, MIT License
*/
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

let actionBar;

function ActionBar() {
    if (actionBar) {
        return;
    }
    actionBar = document.getElementById("actionbar");
    // actionBar.style = "flex: 1; display: flex; flex-direction: column;"
        actionBar.innerHTML = `\n\t${
    /*
		queue_music, play_arrow, device_hub, headset, speaker, cloud, play_arrow
	*/
    ""}\n\t<div class="action-bar-top">\n\t\t<ul role="toolbar" class="">\n\t\t\t\t<li class="explorer checked" role="button" title="Code">\n\t\t\t\t\t<i class="material-icons">code</i>\n\t\t\t\t</li>\n\t\t\t\t<li class="search" role="button" title="Search">\n\t\t\t\t\t<i class="material-icons">search</i>\n\t\t\t\t</li>\n\t\t\t\t\x3c!-- <li class="services" role="button" title="Services">\n\t\t\t\t\t<i class="material-icons">device_hub</i>\n\t\t\t\t</li> --\x3e\n\t\t\t\t\x3c!-- li class="services" role="button" title="">\n\t\t\t\t\t<i class="material-icons">queue_music</i>\n\t\t\t\t</li --\x3e\n\t\t</ul>\n\t</div>\n\n\t<div class="action-bar-bottom">\n\t\t<ul role="toolbar" class="">\n\t\t\t\t<li class="full-screen-exit hidden" role="button">\n\t\t\t\t\t<a></a>\n\t\t\t\t</li>\n\t\t\t\t<li class="full-screen" role="button">\n\t\t\t\t\t<a></a>\n\t\t\t\t</li>\n\t\t\t\t\x3c!--\n\t\t\t\t<li id="open-settings-view" class="settings" role="button">\n\t\t\t\t\t<i class="material-icons">settings</i>\n\t\t\t\t</li>\n\t\t\t\t--\x3e\n\t\t\t</ul>\n\t</div>\n\t`;
    actionBar.querySelector(".full-screen").addEventListener("click", (() => {
        actionBar.querySelector(".full-screen").classList.add("hidden");
        actionBar.querySelector(".full-screen-exit").classList.remove("hidden");
        document.documentElement.requestFullscreen();
    }));
    actionBar.querySelector(".full-screen-exit").addEventListener("click", (() => {
        actionBar.querySelector(".full-screen").classList.remove("hidden");
        actionBar.querySelector(".full-screen-exit").classList.add("hidden");
        document.exitFullscreen();
    }));
    const triggers = [ {
        query: "li.explorer",
        action: "showServiceCode"
    }, {
        query: "li.search",
        action: "showSearch"
    } ];
    triggers.forEach((trigger => {
        attachTrigger({
            name: "ActionBar",
            eventName: trigger.action,
            data: e => {
                const target = e.target.tagName === "I" ? e.target.parentNode : e.target;
                actionBar.querySelector(".checked").classList.remove("checked");
                target.classList.add("checked");
                return;
            },
            filter: e => actionBar.contains(e.target) && [ "LI", "I" ].includes(e.target.tagName) && (e.target.parentNode.className.includes(trigger.query.replace("li.", "")) || e.target.className.includes(trigger.query.replace("li.", "")))
        });
    }));
    /*
	connectTrigger({
		name: "ActionBar",
		eventName: "open-settings-view",
		filter: (e) =>
			actionBar.contains(e.target) &&
			["LI", "I"].includes(e.target.tagName) &&
			(e.target.parentNode.id === "open-settings-view" ||
				e.target.id === "open-settings-view"),
	});
	*/    attach({
        name: "ActionBar",
        eventName: "ui",
        listener: event => {
            const {detail: detail = {}} = event;
            const {operation: operation} = detail;
            if (operation !== "searchProject") {
                return;
            }
            actionBar.querySelector(".checked").classList.remove("checked");
            actionBar.querySelector("li.search").classList.add("checked");
        }
    });
}

ActionBar();