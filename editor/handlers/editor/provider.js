const test = {
	data: (event) => {
		return Array.from(
			event.target.parentNode.querySelectorAll('input:not([name="hidden"])')
		).map(({ name, value }) => ({ name, value }));
	},
	filter: (e) =>
		document.querySelector("#editor").contains(e.target) &&
		e.target.classList.contains("provider-test"),
};

const save = {
	data: (event) => {
		return Array.from(
			event.target.parentNode.querySelectorAll('input:not([name="hidden"])')
		).map(({ name, value }) => ({ name, value }));
	},
	filter: (e) =>
		document.querySelector("#editor").contains(e.target) &&
		e.target.classList.contains("provider-save"),
};

const addService = {
	data: (event) => {
		return Array.from(
			event.target.parentNode.querySelectorAll('input:not([name="hidden"])')
		).map(({ name, value }) => ({ name, value }));
	},
	filter: (e) =>
		document.querySelector("#editor").contains(e.target) &&
		e.target.classList.contains("provider-add-service"),
};

export default { test, save, addService }