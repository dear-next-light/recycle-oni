import assert from 'node:assert/strict';
import {Game} from '../dist/engine.js';
import {C} from '../dist/config.js';
import {facilityPrice,hirePrice,levelPrice} from '../dist/economy.js';

// Reproducible advanced play: every purchase uses earned money, every staff
// change uses assign(), and every layout change uses the public move/swap API.
let seed=19;
const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
const game=new Game(random);
game.prepare();
let spent=0;
function purchase(action,cost){
 const before=game.money,success=action();
 assert.equal(game.money,before-(success?cost:0));
 assert(game.money>=0);
 if(success)spent+=cost;
 return success;
}

function matchSpecialties(){
 const slots=new Map(game.facilities.map(f=>[f.id,C.oniPerFacility])),target=new Map();
 for(const oni of game.onis){
  const f=game.facilities.find(f=>f.type===oni.type&&slots.get(f.id)>0);
  if(f){target.set(oni.id,f.id);slots.set(f.id,slots.get(f.id)-1)}
 }
 for(const oni of game.onis)if(!target.has(oni.id)){
  const f=game.facilities.find(f=>f.id===oni.facility&&slots.get(f.id)>0)||game.facilities.find(f=>slots.get(f.id)>0);
  target.set(oni.id,f.id);slots.set(f.id,slots.get(f.id)-1);
 }
 // A vacant slot permits legal rotations. Once all 20 slots are occupied,
 // retain the current assignments rather than bypassing the assignment guard.
 for(let attempt=0;attempt<100;attempt++){
  const wrong=game.onis.filter(o=>target.get(o.id)!==o.facility);
  if(!wrong.length)return;
  let changed=false;
  for(const oni of wrong)if(game.assignedCount(target.get(oni.id))<C.oniPerFacility){assert(game.assign(oni.id,target.get(oni.id)));changed=true}
  if(changed)continue;
  const vacant=game.facilities.find(f=>game.assignedCount(f.id)<C.oniPerFacility);
  if(!vacant)return;
  const oni=wrong.find(o=>o.facility!==vacant.id);
  if(!oni)return;
  assert(game.assign(oni.id,vacant.id));
 }
 assert.fail('staff rotation did not converge');
}

const sites=[['compost',11,6],['repair',15,6],['break',19,6],['press',3,9],['wash',7,9],['repair',11,9],['compost',15,9],['break',19,9]];
// Keep eight well-placed facilities and invest the remaining earnings in levels.
const targets=[2,2,4,5,7,8,8,8];
const priority=['speed','water','magnet','eco','wash','buffer','repair','shade'];
const layout=['compost','repair','break','wash','press','compost','repair','break','wash','press'];
const report=[];
for(let wave=1;wave<=8;wave++){
 while(game.facilities.length<targets[wave-1]&&sites.length){
  const[type,x,y]=sites[0];
  if(y>=9&&game.land<14&&!purchase(()=>game.expand(),C.landPrice))break;
  if(!purchase(()=>game.build(type,x,y),game.buildPrice(type)))break;
  sites.shift();
 }
 matchSpecialties();
 while(purchase(()=>game.recruit(),game.hirePrice()))matchSpecialties();
 let savings=0;
 const nextTarget=targets[wave]||targets.at(-1);
 if(game.facilities.length<nextTarget&&wave<8){
  const count=game.facilities.length;
  for(let i=0;i<nextTarget-count&&i<sites.length;i++)savings+=facilityPrice(sites[i][0],count+i);
  if(game.land<14&&nextTarget>5)savings+=C.landPrice;
  for(let count=game.onis.length;count<Math.min(C.maxOni,nextTarget*2);count++)savings+=hirePrice(count);
 }
 for(let level=2;level<=(wave<5?2:4);level++)for(const f of game.facilities)if(f.level<level&&game.money-levelPrice(f.level)>=savings)assert(purchase(()=>game.level(f.id),game.levelPrice(f.id)));
 if(wave>=5){
  const used=new Set();
  for(let index=0;index<layout.length;index++){
   const f=game.facilities.find(f=>f.type===layout[index]&&!used.has(f.id));
   if(!f)continue;
   used.add(f.id);
   assert(game.move(f.id,[3,7,11,15,19][index%5],index<5?6:9));
  }
 }
 assert.equal(game.money,C.startMoney+game.profit-spent);
 for(const f of game.facilities)assert(game.assignedCount(f.id)<=C.oniPerFacility);
 assert(game.startWave());
 let ticks=0;
 while(game.state==='wave'&&ticks++<12000){
  if(!game.shoutUsed&&game.time>=8)assert(game.command());
  game.tick(.05);
  assert(game.activeItems()<=C.maxItems);
 }
 assert(ticks<12000);
 assert.equal(game.money,C.startMoney+game.profit-spent);
 report.push({wave,onis:game.onis.length,facilities:game.facilities.length,heat:+game.heat.toFixed(1)});
 if(wave<8){
  assert.equal(game.state,'upgrade');
  const choice=priority.find(id=>game.choices.some(u=>u.id===id))||game.choices[0].id;
  assert(game.choose(choice));
 }
}
assert.equal(game.clear,true);
assert.equal(game.rank,'S');
assert.equal(game.total,game.burned+game.processed+game.activeItems());
assert(game.money>=0);
console.log(JSON.stringify({seed:19,rank:game.rank,rescuedPercent:+(100*game.rescued/game.total).toFixed(1),processedPercent:+(100*game.processed/game.total).toFixed(1),heat:+game.heat.toFixed(1),profit:game.profit,spent,buffs:game.buffs,waves:report},null,2));
console.log('PASS: legal paid expert play can still attain S with the unchanged result rules');
