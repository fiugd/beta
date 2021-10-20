/*

this should run in the context of the page, not in a worker
because: window.listTriggers & window.listListners are on main page

this kinda does the same thing as service map was imagined to do

*/

import ansiEscapes from 'https://cdn.skypack.dev/ansi-escapes';
import chalk from "chalk";

chalk.enabled = true;
chalk.level = 3; //trueColor;

const {
	clearScreen,
	cursorHide, cursorShow,
	cursorPrevLine, cursorBackward,
	eraseLine, eraseDown,
	cursorSavePosition, cursorRestorePosition
} = ansiEscapes;


const listTriggers = () => ([
	"operations__State",
	"showServiceCode__ActionBar",
	"showSearch__ActionBar",
	"add-service-folder__Explorer",
	"connect-service-provider__Explorer",
	"open-previous-service__Explorer",
	"new-file__Explorer",
	"new-folder__Explorer",
	"fileSelect__Explorer",
	"operations__Explorer",
	"folderSelect__Explorer",
	"operations__Terminal",
	"operations__Hot Keys",
	"ui__Hot Keys",
	"ui__Editor",
	"fileClose__Tab Bar",
	"fileSelect__Tab Bar",
	"operations__Tab Bar",
	"provider-test__Editor",
	"provider-save__Editor",
	"provider-add-service__Editor",
	"contextmenu-select__Context Menu",
	"service-switch-notify__Operations",
	"operationDone__Operations",
	"fileSelect__Operations",
	"fileClose__Operations"
]);

const listListeners = () => ([
	"operationDone__State",
	"operations__State",
	"fileClose__State",
	"fileSelect__State",
	"open-settings-view__State",
	"operationDone__Status Bar",
	"fileSelect__Status Bar",
	"fileClose__Status Bar",
	"fileChange__Status Bar",
	"cursorActivity__Status Bar",
	"ui__ActionBar",
	"noServiceSelected__Explorer",
	"ui__Explorer",
	"showSearch__Explorer",
	"showServiceCode__Explorer",
	"operationDone__Explorer",
	"fileSelect__Explorer",
	"folderSelect__Explorer",
	"fileClose__Explorer",
	"fileChange__Explorer",
	"contextmenu__Explorer",
	"contextmenu-select__Explorer",
	"new-file__Explorer",
	"new-folder__Explorer",
	"operations__Indicators",
	"operationDone__Indicators",
	"message__Indicators",
	"contextmenu__Terminal",
	"contextmenu-select__Terminal",
	"showServicesMap__Service Map",
	"showSearch__Service Map",
	"showServiceCode__Service Map",
	"operationDone__Service Map",
	"ui__Tab Bar",
	"open-settings-view__Tab Bar",
	"add-service-folder__Tab Bar",
	"open-previous-service__Tab Bar",
	"connect-service-provider__Tab Bar",
	"operationDone__Tab Bar",
	"operations__Tab Bar",
	"fileSelect__Tab Bar",
	"fileClose__Tab Bar",
	"fileChange__Tab Bar",
	"click__Tab Bar",
	"contextmenu__Tab Bar",
	"contextmenu-select__Tab Bar",
	"service-switch-notify__Editor",
	"operationDone__Editor",
	"open-settings-view__Editor",
	"add-service-folder__Editor",
	"open-previous-service__Editor",
	"connect-service-provider__Editor",
	"noServiceSelected__Editor",
	"fileSelect__Editor",
	"fileClose__Editor",
	"contextmenu__Editor",
	"contextmenu-select__Editor",
	"context-menu-show__Context Menu",
	"modal-menu-show__Context Menu",
	"ui__Context Menu",
	"showCurrentFolder__Operations",
	"changeCurrentFolder__Operations",
	"addFolder__Operations",
	"readFolder__Operations",
	"deleteFolder__Operations",
	"renameFolder__Operations",
	"moveFolder__Operations",
	"moveFile__Operations",
	"operations__Operations",
	"operationDone__Operations",
	"provider-test__Operations",
	"provider-save__Operations",
	"provider-add-service__Operations",
	"fileChange__Operations"
]);

const reduceEventTarget = (all, one) => {
	const [event, source] = one.split('__');
	all[source] = all[source] || [];
	all[source].push(event);
	return all;
};

const triggers = listTriggers()
	.reduce(reduceEventTarget, {});
const listeners = listListeners()
	.reduce(reduceEventTarget, {});

const show = (o, label) => {
	console.log(chalk.hex('#0da')(label || 'label') + '\n')
	Object.keys(o).forEach(key => {
		console.log(`${key}  \n${chalk.hex('#aaa')(o[key].sort().join(', '))}\n`);
	});

	console.log('');
};

// ----------------------------------------------------

console.log(clearScreen + cursorHide + '\n');

show(triggers, 'TRIGGERS');
show(listeners, 'LISTENERS');
