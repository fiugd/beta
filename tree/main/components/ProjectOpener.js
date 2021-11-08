import { htmlToElement } from '../../utils/misc.js';

const ProjectOpener = () => {
	let _opener = htmlToElement(`
		<div class="service-opener">
			<style>
				.service-opener > div {
					display: flex;
					flex-direction: column;
					padding: 0px 20px;
					margin-right: 17px;
				}
				.service-opener button {
					color: inherit;
					background: rgba(var(--main-theme-highlight-color), 0.4);
					font-size: 1.1em;
					border: 0;
					padding: 10px;
					margin-top: 3em;
					cursor: pointer;
				}
				.service-opener  p {
					white-space: normal;
					margin-bottom: 0;
				}
				.service-opener .opener-note {
					font-style: italic;
					opacity: 0.8;
				}
				.service-opener .opener-note:before {
					content: 'NOTE: '
				}
			</style>
			<div class="service-opener-actions">
				<p>You have nothing to edit. Pick an option below to get started.</p>
				<p class="opener-note">Your work will stay in this browser unless you arrange otherwise.</p>

				<button id="add-service-folder">Open Folder</button>
				<p>Upload from your computer into local browser memory.</p>

				<button id="connect-service-provider">Connect to a Provider</button>
				<p>Specify a service to read from and write to.</p>

				<button id="open-previous-service">Load Service</button>
				<p>Select a previously-loaded service.</p>
			</div>
		</div>
	`);
	const openerActions = _opener.querySelector(".service-opener-actions");
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

export default ProjectOpener;
