const triggerTop = (event) => (type, name) => {
	const triggerEvent = {
		type,
		detail: {
			operation: name,
		},
	};
	window.top.postMessage({ triggerEvent }, location);
	event.preventDefault();
	return false;
};

const events = [[
	e => e.shiftKey && e.altKey && e.key === "ArrowLeft",
	"ui",
	"prevDocument"
],[
	e => e.shiftKey && e.altKey && e.key === "ArrowRight",
	"ui",
	"nextDocument"
],[
	e => (e.ctrlKey || e.metaKey) &&
			e.shiftKey &&
			e.key.toLowerCase() === "f",
	"ui",
	"searchProject"
],[
	e => (e.ctrlKey || e.metaKey) &&
			e.shiftKey &&
			e.key.toLowerCase() === "p",
	"ui",
	"commandPalette"
],[
	e => (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p",
	"ui",
	"searchPalette"
],[
	e => (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s",
	"operations",
	"update"
],[
	// this will only work with electron
	e => e.ctrlKey && e.which === 9,
	"nextTab"
]];

const useCapture = true;
document.addEventListener(
	"keydown",
	function (event) {
		const [_, ...found] = events.find(([check]) => check(event)) || [];
		if(found) return triggerTop(event)(...found);
	},
	useCapture
);
