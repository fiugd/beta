//import { dragStart, dragEnd } from "https://unpkg.com/@fiug/layout@0.0.1";
import { getClientId, getCurrentService } from '../../utils/State.js';

const clientId = getClientId();
let file, dragging;

const dragStart = (ev, draggedEv) => {
	const message = JSON.stringify({
		pointerId: ev.pointerId,
		dragStart: draggedEv.target.textContent,
		file: draggedEv.target.textContent,
		service: draggedEv.service,
		source: location.href.split('/').pop()
	});
	window.parent.postMessage(message, '*');
	ev.preventDefault();
};

const pointermove = (ev) => {
	ev.preventDefault();
	if(file && !dragging){
		dragging = ev;
		dragStart(dragging, file);
	}
};

const pointerleave = (ev) => {
	ev.preventDefault();
	dragging = undefined;
	file = undefined;
	document.body.removeEventListener('pointerup', pointerup);
	document.body.removeEventListener('pointerleave', pointerleave);
	document.body.removeEventListener('pointermove', pointermove);
};

const pointerup = (ev) => {
	//dragEnd();
	pointerleave(ev);
};

const drag = (ev) => {
	ev.preventDefault();
	document.body.addEventListener('pointerup', pointerup);
	document.body.addEventListener('pointerleave', pointerleave);
	document.body.addEventListener('pointermove', pointermove);
};

const cursorActivity = () => {
	// used by @fiug/layout to determine active pane
	window.top.postMessage({
		triggerEvent: {
			type: 'cursorActivity',
		},
		detail: {
			source: 'Tree ' + clientId
		}
	}, location);
};

const pointerDownListener = (e, context) => {
	let { target } = e;
	cursorActivity();

	const isALeaf = target.classList.contains('tree-leaf');
	if(!isALeaf) target = target.closest('.tree-leaf');

	const isAFile = target && target.classList.contains('file');
	if(!isAFile) return;

	const treeLeafContent = target.querySelector('.tree-leaf-content');
	const item = JSON.parse(treeLeafContent?.dataset?.item || "");
	const service = getCurrentService();

	file = {
		target: {
			textContent: item.id
		},
		service: service.name
	};
	drag(e);
};

export default pointerDownListener;