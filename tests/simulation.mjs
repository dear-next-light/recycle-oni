import assert from 'node:assert/strict';
import {Game,pathfind} from '../dist/engine.js';
import {C,upgrades} from '../dist/config.js';
import {runStrategy} from './balance-strategies.mjs';

let seed=42;const rng=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
const g=new Game(rng);g.prepare();assert.equal(g.state,'prep');
const near=pathfind({x:4,y:4},{x:3,y:5},g.facilities).length,far=pathfind({x:4,y:4},{x:20,y:9},g.facilities).length;
assert(far>near);
const f=g.facilities[0],o=g.onis[0],fit=g.rate(f,o),speed=g.speed(o);
assert.equal(fit/g.rate(f,{...o,type:'repair'}),1.25);
g.buffs.speed=1;assert(g.speed(o)>speed);g.buffs={};
g.heat=60;assert(g.heatEffect(o).drain>1);assert(g.heatEffect(o).recovery<1);g.heat=0;
assert(!g.move(f.id,4,6));assert(g.move(f.id,11,6));assert(g.move(f.id,3,6));
assert(g.assign(o.id,g.facilities[1].id));assert(g.assign(o.id,f.id));
assert(g.startWave());assert(g.command());assert(!g.command());
for(let i=0;i<12000&&g.state==='wave';i++)g.tick(.05);
assert.equal(g.state,'upgrade');assert.equal(g.choices.length,3);assert.equal(new Set(g.choices.map(u=>u.id)).size,3);
assert(g.choose(g.choices[0].id));assert(!g.choose(g.choices[0].id));
const run=runStrategy(42,{expand:true});
assert(run.clear);assert.equal(run.waves.length,8);assert(run.profit>0);assert(run.rescued<run.total);
g.reset();assert.equal(g.state,'title');assert.equal(g.wave,0);assert.equal(g.processed,0);

const failure=new Game(()=>.5);failure.prepare();failure.startWave();failure.heat=99.9;failure.burn([{type:'battery'}]);failure.tick(.05);
assert.equal(failure.state,'result');assert.equal(failure.clear,false);
for(const u of upgrades){const a=new Game(()=>.5);a.state='upgrade';a.choices=[u];assert(a.choose(u.id));assert.equal(a.buffs[u.id],1)}

function delivery(y,type='press'){
 const a=new Game(()=>.4);a.facilities=[];a.onis=[];a.land=14;
 const facility=a.addFacility('press',7,y),oni=a.addOni(type,facility.id);oni.trait='careful';
 a.prepare();a.startWave();a.nextSpawn=999;a.trucks=[{id:999,x:7,items:[{id:1000,type:'card',route:['press'],step:0,owner:null}]}];a.total=1;
 let time=0;while(!a.profit&&time<30){a.tick(.025);time+=.025}return{time,profit:a.profit};
}
const closeDelivery=delivery(6),farDelivery=delivery(9),unmatched=delivery(6,'wash');
assert(closeDelivery.profit>0);assert(farDelivery.profit>0);assert(farDelivery.time>closeDelivery.time);assert(unmatched.time>closeDelivery.time);
const hot=new Game(()=>.1),hotOni=hot.onis[0];hot.heat=80;
assert(hot.heatEffect({...hotOni,trait:'cool'}).drain<hot.heatEffect({...hotOni,trait:'fast'}).drain);
const recovery=hot.heatEffect(hotOni).recovery;hot.buffs.shade=1;assert(hot.heatEffect(hotOni).recovery>recovery);
const washRate=hot.rate(hot.facilities[0],hotOni);hot.buffs.wash=1;assert(hot.rate(hot.facilities[0],hotOni)>washRate);
const cap=hot.capacity(hot.facilities[0]);hot.buffs.buffer=1;assert.equal(hot.capacity(hot.facilities[0]),cap+1);
hot.prepare();hot.buffs.water=1;hotOni.stamina=1;hot.startWave();assert.equal(hotOni.stamina,hotOni.max);
hot.buffs.eco=1;hot.heat=0;hot.burn([{type:'battery'}]);assert(Math.abs(hot.heat-4.5*C.heatScale*.85)<.001);
console.log(JSON.stringify({status:'PASS',distance:{near,far},affinity:fit,delivery:{closeDelivery,farDelivery,unmatched},run},null,2));

