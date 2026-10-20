import assert from 'node:assert/strict';
import {Game} from '../dist/engine.js';
import {C} from '../dist/config.js';
import {hirePrice,facilityPrice,levelPrice} from '../dist/economy.js';

assert.equal(hirePrice(3),180);
assert.equal(facilityPrice('compost',2),130);
assert.equal(levelPrice(1),180);
assert.equal(levelPrice(2),650);
assert.equal(levelPrice(3),2200);
for(let count=3;count<19;count++)assert(hirePrice(count+1)>hirePrice(count));
for(let count=2;count<9;count++)assert(facilityPrice('wash',count+1)>facilityPrice('wash',count));
assert.equal(facilityPrice('unknown',2),Infinity);
assert.equal(levelPrice(4),Infinity);
assert.equal(levelPrice(0),Infinity);
assert.equal(C.heatScale,.55);

// Check the engine debits the same quoted prices, including a rejected hire.
const g=new Game(()=>.5);g.prepare();
let money=g.money;
assert(g.recruit());assert.equal(g.money,money-hirePrice(3));
assert.equal(g.recruit(),false);assert.equal(g.money,money-hirePrice(3));
g.money=5000;money=g.money;
assert(g.build('compost',11,6));assert.equal(g.money,money-facilityPrice('compost',2));
money=g.money;assert(g.recruit());assert.equal(g.money,money-hirePrice(4));
for(let level=1;level<=3;level++){
 money=g.money;assert(g.level(g.facilities[0].id));assert.equal(g.money,money-levelPrice(level));
}
money=g.money;assert.equal(g.level(g.facilities[0].id),false);assert.equal(g.money,money);
g.money=hirePrice(g.onis.length)-1;
const staff=g.onis.length;
money=g.money;assert.equal(g.recruit(),false);assert.equal(g.onis.length,staff);assert.equal(g.money,money);
g.money=facilityPrice('repair',g.facilities.length)-1;
const facilities=g.facilities.length;
money=g.money;assert.equal(g.build('repair',15,6),false);assert.equal(g.facilities.length,facilities);assert.equal(g.money,money);
console.log('PASS: progressive prices retain an affordable opening and engine purchases match their quotes');
