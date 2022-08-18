import { attach, attachTrigger as connectTrigger } from "../modules/Listeners.mjs";

let actionBar;
function ActionBar() {
	if (actionBar) {
		return;
	}
	actionBar = document.getElementById("actionbar");
	// actionBar.style = "flex: 1; display: flex; flex-direction: column;"
	actionBar.innerHTML = `
	${
		/*
		queue_music, play_arrow, device_hub, headset, speaker, cloud, play_arrow
	*/ ""
	}
	<div class="action-bar-top">
		<ul role="toolbar" class="">
				<li class="explorer checked" role="button" title="Code">
					<i class="material-icons">code</i>
				</li>
				<li class="search" role="button" title="Search">
					<i class="material-icons">search</i>
				</li>
				<!-- <li class="services" role="button" title="Services">
					<i class="material-icons">device_hub</i>
				</li> -->
				<!-- li class="services" role="button" title="">
					<i class="material-icons">queue_music</i>
				</li -->
		</ul>
	</div>

	<div class="action-bar-bottom">
		<ul role="toolbar" class="">
				<li class="full-screen-exit hidden" role="button">
					<a></a>
				</li>
				<li class="full-screen" role="button">
					<a></a>
				</li>
				<!--
				<li id="open-settings-view" class="settings" role="button">
					<i class="material-icons">settings</i>
				</li>
				-->
			</ul>
	</div>
	`;
	actionBar.querySelector(".full-screen").addEventListener("click", () => {
		actionBar.querySelector(".full-screen").classList.add("hidden");
		actionBar.querySelector(".full-screen-exit").classList.remove("hidden");
		document.documentElement.requestFullscreen();
	});

	actionBar.querySelector(".full-screen-exit").addEventListener("click", () => {
		actionBar.querySelector(".full-screen").classList.remove("hidden");
		actionBar.querySelector(".full-screen-exit").classList.add("hidden");
		document.exitFullscreen();
	});

	const triggers = [
		{
			query: "li.explorer",
			action: "showServiceCode",
		},
		{
			query: "li.search",
			action: "showSearch",
		},
		/*
		{
			query: "li.services",
			action: "showServicesMap",
		},
		*/
	];

	triggers.forEach((trigger) => {
		connectTrigger({
			name: "ActionBar",
			eventName: trigger.action,
			data: (e) => {
				const target =
					e.target.tagName === "I" ? e.target.parentNode : e.target;
				actionBar.querySelector(".checked").classList.remove("checked");
				target.classList.add("checked");
				return;
			},
			filter: (e) =>
				actionBar.contains(e.target) &&
				["LI", "I"].includes(e.target.tagName) &&
				(e.target.parentNode.className.includes(
					trigger.query.replace("li.", "")
				) ||
					e.target.className.includes(trigger.query.replace("li.", ""))),
		});
	});

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
	*/

	attach({
		name: "ActionBar",
		eventName: "ui",
		listener: (event) => {
			const { detail = {} } = event;
			const { operation } = detail;
			if (operation !== "searchProject") {
				return;
			}
			actionBar.querySelector(".checked").classList.remove("checked");
			actionBar.querySelector("li.search").classList.add("checked");
		},
	});

}
ActionBar();
