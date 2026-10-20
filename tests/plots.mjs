import assert from 'node:assert/strict';
import {Game,pathfind} from '../dist/engine.js';
import {buildingPlots,constructionPlots,plotAt} from '../dist/plots.js';

assert.equal(buildingPlots.length,10);
assert.equal(constructionPlots(9).length,5);
assert.equal(constructionPlots(14).length,10);
const g=new Game(()=>.2);g.prepare();g.money=100000;
for(const p of g.constructionPlots())for(const dx of [.1,1.9])for(const dy of [.1,1.9])assert.deepEqual(g.placementAt({x:p.x+dx,y:p.y+dy}),p);
assert.equal(plotAt({x:6,y:6},14),null);
assert.equal(g.placementAt({x:3,y:9}),null);
assert.equal(g.placementAt({x:3,y:9},true).locked,true);
for(let y=4;y<14;y++)for(let x=0;x<24;x++){
 const p=g.freePlots().find(p=>p.x===x&&p.y===y);
 assert.equal(g.canPlace('wash',x,y),!!p);
}
for(const p of g.freePlots())assert(g.build('repair',p.x,p.y));
assert.equal(g.freePlots().length,0);
const money=g.money;assert.equal(g.build('repair',5,6),false);assert.equal(g.money,money);
assert(g.expand());for(const p of g.freePlots())assert(g.build('press',p.x,p.y));
assert.equal(g.facilities.length,10);assert.equal(g.freePlots().length,0);
// A full yard remains rearrangeable. Swapping keeps facility contents and staff.
const first=g.facilities[0],last=g.facilities.at(-1),start={x:first.x,y:first.y},end={x:last.x,y:last.y},cost=g.money;
first.input.push({item:{id:999,type:'pet'},oni:g.onis[0].id});
assert(g.move(first.id,end.x,end.y));assert.deepEqual({x:last.x,y:last.y},start);
assert.deepEqual({x:first.x,y:first.y},end);assert.equal(first.input[0].item.id,999);assert.equal(g.money,cost);
for(const o of g.onis){const home=g.facilities.find(f=>f.id===o.facility);assert.equal(o.x,home.x);assert.equal(o.y,home.y-1)}
for(const f of g.facilities)assert(pathfind({x:0,y:4},g.entry(f),g.facilities,g.land));
assert.equal(g.move(first.id,4,6),false);
g.startWave();assert.equal(g.move(first.id,start.x,start.y),false);
console.log('PASS: visible plots exactly match valid foundations, locked expansion, empty-space rejection and full-yard facility swaps');
