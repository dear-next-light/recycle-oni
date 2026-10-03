import assert from 'node:assert/strict';
import {Game} from '../dist/engine.js';
import {C} from '../dist/config.js';

const game=new Game(()=>.2);
game.prepare();
game.money=5000;

assert.equal(C.oniPerFacility,2);
assert.equal(game.facilities.length,2);
assert.equal(game.onis.length,3);
assert.equal(game.oniCapacity(),4);
assert(game.recruit());
assert.equal(game.onis.length,4);
assert.equal(game.openFacility(),null);

const moneyAtFullTeam=game.money;
assert.equal(game.recruit(),false);
assert.equal(game.money,moneyAtFullTeam);

assert(game.build('repair',11,6));
const repair=game.facilities.at(-1);
assert.equal(game.oniCapacity(),6);
assert(game.recruit());
assert(game.recruit());
assert.equal(game.recruit(),false);
assert.equal(game.assignedCount(repair.id),2);

const moving=game.onis.find(o=>o.facility!==repair.id);
const originalFacility=moving.facility;
assert.equal(game.assign(moving.id,repair.id),false);
assert.equal(moving.facility,originalFacility);
assert.equal(game.assign(moving.id,originalFacility),true);

for(const facility of game.facilities){
 assert(game.assignedCount(facility.id)<=C.oniPerFacility);
}

console.log('PASS: two Oni per facility, recruitment lock, expansion unlock and full-facility reassignment guard');
