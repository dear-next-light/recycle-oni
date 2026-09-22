import assert from 'node:assert/strict';
import {Game} from '../dist/engine.js';
import {waveDefinitions as W,C} from '../dist/config.js';
import {runningPose} from '../dist/motion.js';
const current=W.map(w=>w.load),old=[5,6,7,8,9,10,11,13];
assert.deepEqual(current.slice(0,4),old.slice(0,4));
function run(seed,loads){
 W.forEach((w,i)=>w.load=loads[i]);
 const rng=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 const g=new Game(rng);g.prepare();const waves=[];
 for(let n=1;n<=8;n++){
  if(n===3)for(const [type,x]of [['compost',11],['repair',15]]){assert(g.build(type,x,6));assert(g.recruit());g.assign(g.onis.at(-1).id,g.facilities.at(-1).id)}
  if(n===4){assert(g.build('break',19,6));assert(g.recruit());g.assign(g.onis.at(-1).id,g.facilities.at(-1).id)}
  if(n>=5&&g.onis.length<10&&g.money>=C.oniPrice){g.recruit();g.assign(g.onis.at(-1).id,g.facilities[(n-5)%g.facilities.length].id)}
  g.startWave();g.command();const rescued=g.rescued,total=g.total;
  for(let i=0;i<12000&&g.state==='wave';i++){g.tick(.05);assert(g.activeItems()<=C.maxItems);assert(g.trucks.length<=C.maxTrucks)}
  waves.push({total:g.total-total,rescued:g.rescued-rescued,heat:g.heat});
  if(g.state==='result')break;
  g.choose(g.choices.find(u=>u.id==='eco')?.id||g.choices[0].id);
 }
 return{clear:g.clear,waves};
}
try{
 const seeds=[7,19,42,73,101,223,377,501,809,1201];
 const summary=loads=>{const results=seeds.map(s=>run(s,loads));return{cleared:results.filter(r=>r.clear).length,runs:results.length,waves:Array.from({length:8},(_,i)=>{const w=results.map(r=>r.waves[i]).filter(Boolean),total=w.reduce((a,b)=>a+b.total,0),rescued=w.reduce((a,b)=>a+b.rescued,0);return{wave:i+1,meanItems:+(total/w.length).toFixed(1),recoveryPercent:+(100*rescued/total).toFixed(1)}})}};
 const before=summary(old),after=summary(current);
 assert.equal(after.cleared,seeds.length);
 for(let i=0;i<4;i++)assert.deepEqual(after.waves[i],before.waves[i]);
 assert(after.waves[6].meanItems>before.waves[6].meanItems);
 assert(after.waves[7].recoveryPercent<before.waves[7].recoveryPercent);
 console.log(JSON.stringify({before,after},null,2));
}finally{W.forEach((w,i)=>w.load=current[i])}
const start={x:1,y:1,facing:1};
assert.equal(runningPose(start,{x:.9,y:1,id:1},1).facing,-1);
assert.equal(runningPose(start,{x:1.1,y:1,id:1},1).facing,1);
assert.equal(runningPose(start,{x:1,y:1,id:1},1).stride,0);
assert.equal(runningPose(start,{x:1.1,y:1,id:1},1,true).stride,0);
assert.equal(runningPose(start,{x:1.1,y:1,id:1,rest:true},1).moving,false);
console.log('PASS: load balance, active caps, running directions, idle/rest and reduced motion');
