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
const { takeWhile, filter, tap, repeat } = operators;

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

const dom = htmlToElement(`
	<div>
		<canvas style="width:100%"></canvas>
	</div>
`);
document.body.append(dom);
const canvas = dom.querySelector('canvas');
canvas.width = state.field.width;
canvas.height = state.field.height;
const ctx = canvas.getContext('2d');

const render = () => {
	ctx.fillStyle = '#111';
	ctx.fillRect(0, 0, state.field.width, state.field.height);
	
	const renderCharacter = ({ x, color }) => {
		ctx.fillStyle = color;
		ctx.fillRect(x, state.field.height-25, 30, 30);
	};
	state.towers.forEach(tower => {
		const isAttack = tower.type === "attacker";
		const flipX = (x) => isAttack
			? x
			: state.field.width - x;
		ctx.fillStyle = tower.color;
		ctx.fillRect(
			flipX( tower.x)-(tower.dims[0]/2),
			state.field.height-tower.dims[1],
			tower.dims[0], tower.dims[1]
		);
		tower.deployed.forEach(char => {
			const charWidth = 30;
			renderCharacter({
				x: flipX(char.x) - (charWidth/2),
				color: tower.color
			});
		});
		
	});
};

// towers spawn characters (use spawn timer)
// characters move or attack

const gameLoop = (...args) => {
	state.tick++;
};

const moveDeployed = ({ tick, towers }) => {
	towers.forEach(tower => {
		tower.deployed.forEach(char => char.x += char.move)
	});
};

const gameOn = () => {
	moveDeployed(state);
	//TODO: game as long as all towers have health
	return state.tick < 50;
};

const throttle = (MIN_TIME) => () => {
	const curr = performance.now();
	if(state.time && (curr - state.time) < MIN_TIME)
		return false;
	state.time = curr;
	return true;
};

const gameSteps = [
	repeat(),
	filter(throttle(150)),
	takeWhile(gameOn),
	tap(gameLoop),
];

of(null, animationFrameScheduler)
	.pipe(...gameSteps)
	.subscribe(render);