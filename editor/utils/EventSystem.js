import { flatFromProp } from './misc.js';

const listeners = {};
const triggers = {};

function attach({
	name, listener, eventName, options, key, context
}){
	if(!name || !listener || !eventName){
		console.error('Attempt to improperly attach an event listener');
		console.error({ name, listener, eventName });
		return;
	}
	const listenerName = `${eventName}__${name}`;
	if(listeners[listenerName]) return;

	// TODO: alter this approach, instead use ONE event listener attached to window (?)
	// this approach kinda sucks because a lot of listeners get added to window
	// also there is less control over events as they are handled
	const _listener = (e) => listener(e, context || {});
	window.addEventListener(eventName, _listener, options);
	listeners[listenerName] = listener; 
	if(key){
		listeners[listenerName]._meta = { key, name, eventName, options };
	}
}

function remove({ name, eventName, options, key }){
	let listenerName = `${eventName}__${name}`;
	if(!key){
		window.removeEventListener(eventName, listeners[listenerName], options);
		delete listeners[listenerName];
	}
	listenerName = Object.keys(listeners)
		.find(x => listeners[x]._meta && listeners[x]._meta.key === key);
	if(!listenerName) return;
	const { _meta } = listeners[listenerName]
	window.removeEventListener(_meta.eventName, listeners[listenerName], _meta.options);
	delete listeners[listenerName];
}

function list(){ return Object.keys(listeners); }

/*
future todo:

- when an event is triggered, don't create a custom event if event listeners exist already for that event
- instead, just trigger those

- there should be an uber listener instead of a bunch of click listeners added

*/

// this thing is used too many ways... SIGH
function trigger(args){
	const { e, type, params, source, data, detail, external } = args;
	const _data = typeof data === "function"
		? data(e)
		: data || (detail||{}).data || {};
	//console.log(`triggering event: ${type}`);
	const defaultDetail = {
		..._data,
		...params,
		...{ source },
		data: _data
	};

	const _detail = detail
		? { ...defaultDetail, ...detail, data: _data }
		: defaultDetail;

	const event = new CustomEvent(type, { bubbles: true, detail: _detail });
	window.dispatchEvent(event);

	// from here on, send internal events to external
	if(external) return;
	const blackList = [
		'operationDone'
	];
	const triggerEvent = { type, detail: _detail };
	if(!blackList.includes(type)){
		window.top.postMessage({ triggerEvent }, location);
	}
}

let triggerClickListener;
const attachTrigger = function attachTrigger({
	name, // the module that is attaching the listener
	type='click', // the input event name, eg. "click"
	data, // an object or function to get data to include with fired event
	eventName, // the name of the event(s) that triggers are attached for (can also be a function or an array)
	filter // a function that will filter out input events that are of no concern
}){
	if(type === 'raw'){
		const triggerName = `${eventName}__${name}`;
		const _trigger = (args) => {
			trigger({
				...args,
				e: args,
				data,
				type: eventName,
				source: name
			});
		};
		triggers[triggerName] = {
			eventName, type, trigger: _trigger
		};
		return _trigger;
	}

	if(type !== 'click') {
		console.error(`triggering based on ${type} not currently supported`);
		return;
	}

	const listener = triggerClickListener || ((event) => {
		const foundTrigger = Object.keys(triggers)
			.map(key => ({ key, ...triggers[key] }) )
			.find(t => {
				if(t.type === 'raw'){
					return false;
				}
				//this won't work if only one global listener
				//if(t.key !== triggerName) return false;
				const filterOkay = t.filter && typeof t.filter === "function" && t.filter(event);
				return filterOkay;
			});
		if(!foundTrigger) return true; //true so event will propagate, etc
		event.preventDefault();
		event.stopPropagation();

		const { eventName: type, data } = foundTrigger;
		const params = {};
		const source = {};
		const _data = typeof data === "function"
			? data(event)
			: data || {};
		trigger({ type, params, source, data: _data, detail: (_data||{}).detail });
		return false;
	});

	const options = {};
	if(!triggerClickListener){
		window.addEventListener(type, listener, options);
	}

	const triggerName = `${eventName}__${name}`;
	triggers[triggerName] = {
		eventName, filter, data, type
	};

	triggerClickListener = triggerClickListener || listener;
}

function removeTrigger({
	name, eventName
}){
	const triggerName = `${eventName}__${name}`;
	delete triggers[triggerName];
	// probably should never do this since something will always be listening for a click
	// (and clicks are all that is supported right now)
	// (and there is really only one click listener for triggers)
	//window.removeEventListener(eventName, listeners[listenerName], options);
}
function listTriggers(){
	return Object.keys(triggers);
}

window.listTriggers = listTriggers;
window.listListeners = list;

function attachEvents(events, context) {
	const listenersConfig = flatFromProp(events.listeners, 'handlers');
	for(const handler of listenersConfig){
		attach({ ...handler, context });
	}

	context.triggers = {};
	context.triggerEvent = {};

	const connectTriggers = ([namespace, _triggers]) => {
		const _name = namespace.toLowerCase();
		const triggersConfig = flatFromProp(_triggers, 'handlers');
		const triggers = triggersConfig
			.reduce((acc, { name, eventName, ...item }) => {
				const trigger = attachTrigger({ ...item, name: namespace, eventName });
				if(!trigger) return acc;
				return { ...acc, [name || eventName]: trigger };
			}, {});
		context.triggers[_name] = triggers;
		context.triggerEvent[_name] = (eventName, operation) => {
			context.triggers[_name][eventName]({
				detail: {
					operation,
					done: () => {},
					body: {},
				},
			});
		};
	};

	Object.entries(events.triggers).map(connectTriggers);
}


window.top.postMessage({ subscribe: 'Editor Iframe' }, location);
window.addEventListener('message', function(messageEvent) {
	trigger({ ...messageEvent.data, external: true });
}, false);

/*

see https://felixgerschau.com/how-to-communicate-with-service-workers/

TODO:
	- call to service worker to set up exchange
	- SW events trigger handlers as registered with this file, ie. attach
	- triggers from this file result in message to SW
	
	- SW will have to be configure to fire messages for things that are currently HTTP requests
*/
//const registration = await navigator.serviceWorker.ready;
//console.log(registration)

// navigator.serviceWorker.controller.postMessage({
// 	type: 'TEST_MESSAGE',
// });

export {
	trigger, //deprecate exporting this?
	attach, remove, list,
	attachTrigger, removeTrigger, listTriggers,
	attachEvents
};