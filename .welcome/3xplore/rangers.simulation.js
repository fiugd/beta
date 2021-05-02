//show-preview

/*

use rxJS

events in game are a series of observables

models

- tower
- character
- skill effects
- attack / damage ?

*/

import { consoleHelper, htmlToElement, importCSS } from '../.tools/misc.mjs';
import '../shared.styl';

import * as rxjs from 'https://cdn.skypack.dev/rxjs';
import * as operators from 'https://cdn.skypack.dev/rxjs/operators';
const { animationFrameScheduler, of, Subject } = rxjs;;
const { catchError, takeWhile, filter, tap, repeat } = operators;

consoleHelper();

const basicChar = {
	respawn: 200,
	range: 100,
	attack: 30,
	x: 60,
	move: 4
};
const state = {
	field: {
		height: 200,
		width: 1000
	},
	towers: [{
		type: 'attacker',
		dims: [30, 90],
		x: 25,
		color: '#67b',
		hp: 2000,
		deployed: [ basicChar ]
	}, {
		type: 'defender',
		dims: [30, 90],
		x: 25,
		color: '#b76',
		hp: 2000,
		deployed: [ basicChar ]
	}],
	tick: 0,
};

const initDom = (state) => {
	const dom = htmlToElement(`
		<div>
			<style>
				body {
					height: 100vh;
					box-sizing: border-box;
					margin-top: 0;
					margin-bottom: 0;
					padding-bottom: 5em;
					overflow: hidden;
				}
			</style>
			<canvas style="width:100%"></canvas>
		</div>
	`);
	document.body.append(dom);
	const canvas = dom.querySelector('canvas');
	canvas.width = state.field.width;
	canvas.height = state.field.height;
	const ctx = canvas.getContext('2d');
	return ctx;
};
const ctx = initDom(state);

const clone = x => JSON.parse(JSON.stringify(x))
const toggleCoords = (state, coordMode) => {
	const stateClone = clone(state);
	stateClone.towers
		.forEach(tower => {
			const isAttack = tower.type === "attacker";
			const flipX = (x) => isAttack
				? x
				: coordMode === 'global'
					? state.field.width - x
					: Math.abs(x - state.field.width);
			tower.x = flipX(tower.x);
			tower.coordMode = coordMode;
			tower.deployed.forEach(char => {
				char.x = flipX(char.x)
			});
		});
	return stateClone;
};
const cleanError = (e) => {
	e.stack = e.stack
		.split('\n')
		.filter(x => !x.includes('rxjs'))
		.join('\n');
	return e;
}

const render = () => {
	const { width: fieldWidth, height: fieldHeight} = state.field;
	ctx.fillStyle = '#111';
	ctx.fillRect(0, 0, fieldWidth, fieldHeight);
	
	const bottom = (height) => fieldHeight-height;
	const center = (x, width) => x - (width/2);
	
	const renderTower = ({ x, color, dims }) => {
		const [width, height] = dims;
		ctx.fillStyle = color;
		ctx.fillRect(
			center(x, width), bottom(height),
			width, height
		);
	};

	const renderCharacter = ({ x }) => {
		const width = 30;
		ctx.fillRect(
			center(x, width), bottom(width),
			width, width
		);
	};

	const globalModeState = toggleCoords(state, 'global');
	globalModeState.towers.forEach(tower => {
		renderTower({ ...tower });
		tower.deployed.forEach(renderCharacter);
	});
};
const tryRender = () => {
	try {
		render();
		return true;
	} catch(e) {
		console.error(cleanError(e));
		return false;
	}
};

const moveDeployed = ({ tick, towers }) => {
	towers.forEach(tower => {
		tower.deployed.forEach(char => char.x += char.move)
	});
};

// towers spawn characters (use spawn timer)
// characters move or attack
const gameLoop = () => {
	try {
		moveDeployed(state);
		//TODO: game as long as all towers have health
		const continueGame = state.tick < 50;
		state.tick++;
		return continueGame;
	} catch(e) {
		console.error(e);
		return false;
	}
};

const throttle = (MIN_TIME) => () => {
	const curr = performance.now();
	if(state.time && (curr - state.time) < MIN_TIME)
		return false;
	state.time = curr;
	return true;
};
const highPriority = () => {}; //animation events?

const gameSteps = [
	repeat(),
	tap(highPriority),
	filter(throttle(150)),
	takeWhile(gameLoop),
	takeWhile(tryRender)
];

setTimeout(() => {
	of(null, animationFrameScheduler)
		.pipe(...gameSteps)
		.subscribe();
}, 50);
