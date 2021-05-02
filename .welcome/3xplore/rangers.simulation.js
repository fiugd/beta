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
	hp: 2000,
	respawn: 200,
	range: 150,
	attack: 30,
	x: 60,
	move: 10
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
		hp: 500,
		deployed: [ basicChar ]
	}, {
		type: 'defender',
		dims: [30, 90],
		x: 25,
		color: '#b76',
		hp: 500,
		// attack: <=68(blue), 69-71.4(tie), >=71.5 (red)
		deployed: [{
			...basicChar,
			hp:100, range: 400, attack: 68
		}]
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
				char.x = flipX(char.x);
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
const assignId = (x) => x.id = Math.random().toString().slice(2);
const getById = (id) => [
	...state.towers,
	...state.towers[0].deployed,
	...state.towers[1].deployed
]
	.find(x => x.id === id);
const render = () => {
	const { width: fieldWidth, height: fieldHeight} = state.field;
	ctx.fillStyle = '#111';
	ctx.fillRect(0, 0, fieldWidth, fieldHeight);
	
	const bottom = (height) => fieldHeight-height;
	const center = (x, width) => x - (width/2);
	
	const renderTower = ({ x, color, dims, status }) => {
		const [width, height] = dims;
		ctx.fillStyle = status === 'dead' ? '#333' : color;
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
	
	if(state.towers[0].status === 'dead'){
		console.log('Red wins!');
	}
	if(state.towers[1].status === 'dead'){
		console.log('Blue wins!');
	}
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
	towers.forEach((tower, i) => {
		tower.deployed.forEach(char => {
			if(char.target) return;
			char.x += char.move;
		})
	});
};
const targetOpponents = (state) => {
	const { towers } = toggleCoords(state, 'global');
	towers.forEach((tower, i) => {
		const isAttack = tower.type === "attacker";
		const opponent = towers[isAttack ? 1 : 0];
		const withinRange = (char, opp) => isAttack
			? (char.x + char.range) >= opp.x
			: (char.x - char.range) <= opp.x;
		tower.deployed.forEach((char, j) => {
			if(char.target) return;
			const nearby = [opponent, ...opponent.deployed]
				.filter((opp) => withinRange(char, opp));
			if(!nearby.length) return;
			state.towers[i].deployed[j].target = isAttack
				? nearby.sort((a, b) => b -a)[0].id
				: nearby.sort((a, b) => a - b)[0].id;
		})
	});
};
const attackOpponents = ({ towers }) => {
	const attacking = [...towers[0].deployed, ...towers[1].deployed]
		.filter(x => x.target);
	attacking.forEach(attacker => {
		const target = getById(attacker.target);
		target.hp -= attacker.attack;
		if(target.hp < 0){
			target.status = 'dead';
			attacker.target = undefined;
		}
	});
	towers.forEach(tower => {
		if(tower.hp <= 0) tower.status = 'dead';
		tower.deployed = tower.deployed
			.filter(x => x.status !== 'dead')
	});
};

// towers spawn characters (use spawn timer)
// characters move or attack
const gameLoop = () => {
	try {
		targetOpponents(state);
		attackOpponents(state);
		moveDeployed(state);
		const gameOver = !(state.towers[0].hp > 0 &&
			state.towers[1].hp > 0);
		const continueGame = !state.gameOver
		state.gameOver = gameOver;
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
	filter(throttle(50)),
	takeWhile(gameLoop),
	takeWhile(tryRender),
];

setTimeout(() => {
	[...state.towers, ...state.towers[0].deployed, ...state.towers[1].deployed]
		.forEach(assignId)
	of(null, animationFrameScheduler)
		.pipe(...gameSteps)
		.subscribe();
}, 50);
