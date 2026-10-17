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
assert.equal(game.land,9);
assert.equal(game.canPlace('repair',11,9),false);
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

// Expand a paid-for yard and fill every facility, testing beyond the old cap12.
for(const [type,x]of [['compost',15],['break',19]])assert(game.build(type,x,6));
assert.equal(game.facilityCapacity(),5);
assert(game.canPlace('wash',1,6));
const beforeBlockedBuild=game.money;
assert.equal(game.build('wash',1,6),false);
assert.equal(game.money,beforeBlockedBuild);
assert(game.expand());
assert.equal(game.land,14);
assert.equal(game.facilityCapacity(),10);
for(const [type,x,y]of [['wash',3,9],['press',7,9],['repair',11,9],['compost',15,9],['break',19,9]]){
 assert(game.build(type,x,y));
 while(game.recruit()){}
}
assert.equal(game.facilities.length,C.maxFacilities);
assert.equal(game.oniCapacity(),20);
assert.equal(game.onis.length,20);
assert.equal(game.recruit(),false);
for(const facility of game.facilities)assert.equal(game.assignedCount(facility.id),2);
assert.equal(game.build('wash',1,11),false);

console.log('PASS: two Oni per facility, paid land expansion, recruitment/full-facility guards and all 20 staffing slots');
