import ansiEscapes from 'https://cdn.skypack.dev/ansi-escapes';
import chalk from "https://cdn.skypack.dev/-/chalk@v2.4.2-3J9R9FJJA7NuvPxkCfFq/dist=es2020,mode=imports/optimized/chalk.js";

const levels = {
	disabled: 0,
	basic16: 1,
	more256: 2,
	trueColor: 3
}
chalk.enabled = true;
chalk.level = levels.trueColor;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// thanks @ https://github.com/sindresorhus/cli-spinners/blob/main/spinners.json
const spinners = {
	"dots": {
		"interval": 80,
		"frames": [
			"⠋",
			"⠙",
			"⠹",
			"⠸",
			"⠼",
			"⠴",
			"⠦",
			"⠧",
			"⠇",
			"⠏"
		]
	},
	"aesthetic": {
		"interval": 80,
		"frames": [
			"▰ ▱ ▱ ▱ ▱ ▱ ▱",
			"▰ ▰ ▱ ▱ ▱ ▱ ▱",
			"▰ ▰ ▰ ▱ ▱ ▱ ▱",
			"▰ ▰ ▰ ▰ ▱ ▱ ▱",
			"▰ ▰ ▰ ▰ ▰ ▱ ▱",
			"▰ ▰ ▰ ▰ ▰ ▰ ▱",
			"▰ ▰ ▰ ▰ ▰ ▰ ▰",
			"▰ ▱ ▱ ▱ ▱ ▱ ▱"
		]
	},
	"bouncingBall": {
		"interval": 80,
		"frames": [
			"( ●    )",
			"(  ●   )",
			"(   ●  )",
			"(    ● )",
			"(     ●)",
			"(    ● )",
			"(   ●  )",
			"(  ●   )",
			"( ●    )",
			"(●     )"
		]
	},
	"pong": {
		"interval": 80,
		"frames": [
			"▐⠂       ▌",
			"▐⠈       ▌",
			"▐ ⠂      ▌",
			"▐ ⠠      ▌",
			"▐  ⡀     ▌",
			"▐  ⠠     ▌",
			"▐   ⠂    ▌",
			"▐   ⠈    ▌",
			"▐    ⠂   ▌",
			"▐    ⠠   ▌",
			"▐     ⡀  ▌",
			"▐     ⠠  ▌",
			"▐      ⠂ ▌",
			"▐      ⠈ ▌",
			"▐       ⠂▌",
			"▐       ⠠▌",
			"▐       ⡀▌",
			"▐      ⠠ ▌",
			"▐      ⠂ ▌",
			"▐     ⠈  ▌",
			"▐     ⠂  ▌",
			"▐    ⠠   ▌",
			"▐    ⡀   ▌",
			"▐   ⠠    ▌",
			"▐   ⠂    ▌",
			"▐  ⠈     ▌",
			"▐  ⠂     ▌",
			"▐ ⠠      ▌",
			"▐ ⡀      ▌",
			"▐⠠       ▌"
		]
	},
	"point": {
		"interval": 125,
		"frames": [
			"∙∙∙∙",
			"●∙∙∙",
			"∙●∙∙",
			"∙∙●∙",
			"∙∙∙●",
			"∙∙∙∙",
			"∙∙∙∙",
			"∙∙∙●",
			"∙∙●∙",
			"∙●∙∙",
			"●∙∙∙",
			"∙∙∙∙",
		]
	},
};

class Spinner {
	constructor({ name = 'point' } = {}){
		const { interval, frames } = spinners[name];
		this.frames = frames;
		this.interval = interval;
	}
}

/*
	all of the animation below needs to be built into class
	prefer usage:

	const spin = new Spinner({ stdOut: console.log });
	// next line simulates long-running process
	setTimeout(spin.finish, 3000);
	await spin.done;

*/

const spin = new Spinner();

const {
	cursorHide, cursorShow,
	cursorPrevLine, cursorBackward,
	eraseLine, eraseDown,
	cursorSavePosition, cursorRestorePosition
} = ansiEscapes;

console.log(cursorHide + 'loading: ' + cursorSavePosition + eraseDown);

for(var j=0; j < 10; j++){
	for(var i=0, len=spin.frames.length; i < len; i++){
		const frame = spin.frames[i];
		console.log(
			eraseDown +
			cursorRestorePosition +
			chalk.hex('#f0f')(frame)
		);
		await sleep(spin.interval);
	}
}

console.log(cursorRestorePosition + chalk.hex('#aff')('done') + eraseDown + cursorShow);
