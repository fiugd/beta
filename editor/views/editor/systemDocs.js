import {
	htmlToElement,
} from '../../utils/misc.js';

import {
	getAllServices
} from "../../utils/State.js";

const miscSystemSettings = [
	{
		name: "exit-current-service",
		description: "Close the current project",
		button: "close",
		onclick: `localStorage.setItem('lastService', ''); document.location.reload()`,
	},
];

const SystemDocs = (section, errors) => {
	const style = `
	<style>
		#editor-system-doc {
			font-size: inherit;
			margin: 0;
			display: flex;
			flex-direction: column;
			justify-content: start;
			align-items: center;
			height: 100%;
			overflow: auto;
			width: 100%;
			padding-bottom: 100px;
			padding-right: 1em;
			padding-left: 1em;
			box-sizing: border-box;
		}
		#editor-system-doc::-webkit-scrollbar { width: 5px; height: 5px; }
		#editor-system-doc::-webkit-scrollbar-corner,
		#editor-system-doc::-webkit-scrollbar-track { background: transparent; }
		#editor-system-doc:hover::-webkit-scrollbar-thumb { background: #333; }
		#editor-system-doc::-webkit-scrollbar-thumb { background: transparent; }
		#editor-system-doc ::placeholder { opacity: 0.35; }

		#editor-system-doc h1 {
			font-size: 1.1em;
			font-variant: all-petite-caps;
			border-bottom: 1px solid;
			padding-bottom: .4em;
			opacity: .55;
			margin: 2.2em 0 0.5em 0;
		}
		.thisSystemDoc {
			max-width: 60em;
		}
		.settings-grid-2-col {
			display: grid;
			grid-template-columns: 1fr auto;
			grid-auto-rows: auto;
			align-items: center;
			margin: 1.5em 0;
			grid-gap: 1em;
			background: #8888881f;
			padding: 1.1em;
			border-radius: 2px;
		}
		#editor-system-doc button {
			background: #88888847;
			border: 0;
			padding: 0.5em;
			color: inherit;
			margin: .3em 0;
		}
		#editor-system-doc button:hover {
			background: rgba(var(--main-theme-highlight-color), 0.4);
		}
		#editor-system-doc ul {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
		}
		#editor-system-doc li {
			margin: 1em;
			width: 100%;
			text-align: center;
			background: #88888826;
		}
		#editor-system-doc form.provider-settings {
			padding: 1em;
			display: flex;
			flex-direction: column;
			margin-top: 1em;
		}
		#editor-system-doc input {
			color: inherit;
			margin-bottom: 1.5em;
			background: #88888829;
			margin-top: 0.3em;
			padding: 0 .5em;
			box-sizing: border-box;
		}
		.provider-settings button.error {
			outline: 1px solid red;
			background: red;
			color: red;
		}
		#settings-all-services-list li {
			display: flex;
			justify-content: space-between;
			padding: 1em;
			align-items: center;
		}
		#settings-all-services-list {
			/*min-height: 400px;*/
			justify-content: flex-start;
		}
	</style>
	`;
	if (!section) {
		const view = htmlToElement(
			`
			<div id="editor-system-doc">
				${style}
				<div class="thisSystemDoc"></div>
			</div>
		`.replace(/		/g, "")
		);
		return view;
	}

	const miscSettings = `
		<h1>Misc Settings</h1>

		${miscSystemSettings
			.map((x) => {
				return `
				<div class="settings-grid-2-col">
					<div>${x.description}</div>
					<div>
						<button id="${x.name}" onclick="${x.onclick}">${x.button}</button>
					</div>
				</div>
			`.replace(/				/g, "");
			})
			.join("\n")}
	`.replace(/		/g, "");

	const addServiceFolder = `
		<h1>Add Folder</h1>
		<p>
			TODO: this functionality will take back seat to service provider because it's a one-shot/one-way solution;
			it's useful, but not as useful.
		</p>
	`.replace(/		/g, "");

	const openPreviousService = `
		<h1>Open Previous Service</h1>
		<p>
			Show a list of services each with button that sets lastService and does document reload
		</p>
		<ul id="settings-all-services-list">
			<li></li>
		</ul>
	`.replace(/		/g, "");

	const connectServiceProvider = `
		<h1>Connect a Service Provider</h1>
		<p>
			TODO: show a list of providers and allow setup
			At first, only local file server (electron), aka basic server, will be available
			In the future, this could be a much long list of providers.
			TODO: get list of currently registered providers and show here (remove default value for basic server)
		</p>
		<ul>
			<li>
				<button
					onclick="event.target.parentNode.querySelector('.provider-settings').classList.toggle('hidden')"
				>Github</button>
				<form class="provider-settings" autocomplete="off" onsubmit="return false;">
					<input class="hidden" autocomplete="false" name="hidden" type="text">
					<input name="provider-type" class="hidden" type="text" value="github-provider">

					<label>Personal Access Token</label>
					<input name="provider-access-token" type="text" >

					<button class="provider-test">Test Provider</button>
					<button class="provider-save">Save Provider</button>

					<label style="margin-top: 30px;">Repository</label>
					<input type="text"
						name="provider-repository"
						value="crosshj/fiug-welcome"
						placeholder="{user}/{repository name}"
					>
					<input type="text"
						name="provider-repository-branch"
						value="main"
						placeholder="branch name"
					>
					<button class="provider-add-service">Add Repository</button>
				</form>
			</li>
			<li>
				<button
					onclick="event.target.parentNode.querySelector('.provider-settings').classList.toggle('hidden')"
				>Bartok Basic Server</button>
				<form class="provider-settings" autocomplete="off" onsubmit="return false;">
					<input class="hidden" autocomplete="false" name="hidden" type="text">
					<input name="provider-type" class="hidden" type="text" value="basic-bartok-provider">

					<label>Server URL</label>
					<input name="provider-url" type="text" value="http://localhost:3333/">

					<button class="provider-test">Test Provider</button>
					<button class="provider-save">Save Provider</button>
					<button class="provider-add-service">Add Folder</button>
				</form>
			</li>
			<li>
				<button
					onclick="event.target.parentNode.querySelector('.provider-settings').classList.toggle('hidden')"
				>Bartok Advanced Server</button>
				<form class="provider-settings hidden" autocomplete="off" onsubmit="return false;">
					<input class="hidden" autocomplete="false" name="hidden" type="text">
					<input name="provider-type" class="hidden" type="text" value="basic-advanced-provider">

					<label>Server URL</label>
					<input name="provider-url" type="text" >

					<button class="provider-test">Test Provider</button>
					<button class="provider-save">Save Provider</button>
					<button class="provider-add-service">Add Folder</button>
				</form>
			</li>
		</ul>
	`.replace(/		/g, "");

	const allSettings = `
		${connectServiceProvider}
		${addServiceFolder}
		${openPreviousService}
		${miscSettings}
	`.replace(/		/g, "");

	const sectionText = {
		"add-service-folder": addServiceFolder,
		"connect-service-provider": connectServiceProvider,
		"open-previous-service": openPreviousService,
		"open-settings-view": allSettings,
	}[section];
	return sectionText || "";
};

let systemDocsDOM;
const showSystemDocsView = ({ filename='', op='' }, context) => {
	const { systemDocsErrors : errors } = context
	try{
		document.getElementById('file-search').style.visibility = "";
	}catch(e){}

	if (!systemDocsDOM) {
		const editorContainer = document.getElementById("editor-container");
		systemDocsDOM = SystemDocs();
		editorContainer.appendChild(systemDocsDOM);
	}
	if (filename) {
		systemDocsDOM.querySelector(".thisSystemDoc").innerHTML = SystemDocs(filename);
	}
	const allServicesList = document.getElementById("settings-all-services-list");

	const updateServicesListDom = async () => {
		if(!allServicesList) return;
		allServicesList.innerHTML = "<li>loading...</li>";
		const services = (await getAllServices()) || [];
		const ServiceRowOnClick = (s) => [
			`localStorage.setItem('lastService','${s.id}');`,
			`document.location.reload();`
		].join(' ');
		const ServiceRow = (s) => `
			<li>
				<span>[ ${s.id} ] ${s.name}</span>
				<button onclick="${ServiceRowOnClick(s)}">LOAD</button>
			</li>
		`.trim().replace(/^			/g, '');
		allServicesList.innerHTML = services.map(ServiceRow).join("\n");
	};
	updateServicesListDom();

	// TODO: this could be improved to match the button which error'ed
	if (errors.length) {
		errors.forEach((error) => {
			const domForError = systemDocsDOM.querySelector(
				"." + error.op.replace("-done", "")
			);
			if (domForError) {
				domForError.classList.add("error");
				return;
			}
			console.error(error);
		});
	}

	return systemDocsDOM;
};

export default showSystemDocsView;
