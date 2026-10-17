import assert from 'node:assert/strict';
import {Game} from '../dist/engine.js';
import {C,waveDefinitions as W} from '../dist/config.js';

export const seeds=[7,19,42,73,101,223,377,501,809,1201];
export const oldLoads=[5,6,7,8,12,13,15,20];

// Every purchase is paid for from starting funds and earned sales. The compact
// and expanded strategies make identical choices through Wave 4.
export function runStrategy(seed,{expand=false,per=2,max=C.maxOni,items=C.maxItems,loads=W.map(w=>w.load)}={}){
 const saved={...C},savedLoads=W.map(w=>w.load);
 try{
  Object.assign(C,{oniPerFacility:per,maxOni:max,maxItems:items});
  W.forEach((w,i)=>w.load=loads[i]);
  const rng=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
  const game=new Game(rng);game.prepare();
  if(per===1){
   // Give this candidate a generous free third facility, preserving all three
   // starting Oni without placing two in the same facility.
   const third=game.addFacility('wash',11,6);
   game.onis[2].facility=third.id;Object.assign(game.onis[2],game.entry(third));
  }
  const sites=per===1
   ?[['compost',15,6],['repair',19,6],['break',3,9],['press',7,9],['repair',11,9],['compost',15,9],['break',19,9]]
   :[['compost',11,6],['repair',15,6],['break',19,6],['press',3,9],['wash',7,9],['repair',11,9],['compost',15,9],['break',19,9]];
  const waves=[];
  for(let n=1;n<=8;n++){
   const target=per===1
    ?(n<3?3:n===3?5:n===4?6:expand?Math.min(10,6+(n-4)*2):6)
    :(n<3?2:n===3?4:n===4?5:expand?Math.min(10,5+(n-4)*2):5);
   while(game.facilities.length<target&&sites.length){
    const [type,x,y]=sites.shift();
    if(y>=9&&game.land<14)assert(game.expand());
    assert(game.build(type,x,y));
   }
   while(game.recruit()){}
   for(let level=2;level<=(n<5?2:4);level++)for(const facility of game.facilities)if(facility.level<level)game.level(facility.id);
   assert(game.money>=0);
   for(const facility of game.facilities)assert(game.assignedCount(facility.id)<=per);
   const start={total:game.total,rescued:game.rescued,processed:game.processed,profit:game.profit};
   assert(game.startWave());assert(game.command());
   let ticks=0;
   while(game.state==='wave'&&ticks++<12000){
    game.tick(.05);
    assert(game.activeItems()<=C.maxItems);
    assert(game.trucks.length<=C.maxTrucks);
   }
   assert(ticks<12000);
   waves.push({wave:n,onis:game.onis.length,facilities:game.facilities.length,total:game.total-start.total,rescued:game.rescued-start.rescued,processed:game.processed-start.processed,profit:game.profit-start.profit,heat:game.heat});
   if(game.state==='result')break;
   assert(game.choose(game.choices.find(upgrade=>upgrade.id==='eco')?.id||game.choices[0].id));
  }
  assert.equal(game.total,game.burned+game.processed+game.activeItems());
  return {clear:game.clear,rank:game.rank,profit:game.profit,heat:game.heat,rescued:game.rescued,total:game.total,processed:game.processed,capacity:game.oniCapacity(),waves};
 }finally{Object.assign(C,saved);W.forEach((w,i)=>w.load=savedLoads[i])}
}

export function summarize(results){
 const total=results.reduce((n,r)=>n+r.total,0);
 return {
  clears:results.filter(r=>r.clear).length,
  runs:results.length,
  ranks:results.reduce((counts,r)=>(counts[r.rank]=(counts[r.rank]||0)+1,counts),{}),
  recoveryPercent:+(100*results.reduce((n,r)=>n+r.rescued,0)/total).toFixed(1),
  finishedPercent:+(100*results.reduce((n,r)=>n+r.processed,0)/total).toFixed(1),
  meanHeat:+(results.reduce((n,r)=>n+r.heat,0)/results.length).toFixed(1),
  profitRange:[Math.min(...results.map(r=>r.profit)),Math.max(...results.map(r=>r.profit))],
  waves:Array.from({length:8},(_,index)=>{
   const waves=results.map(r=>r.waves[index]).filter(Boolean),items=waves.reduce((n,w)=>n+w.total,0);
   return {wave:index+1,onis:waves[0]?.onis,facilities:waves[0]?.facilities,meanItems:+(items/waves.length).toFixed(1),recoveryPercent:+(100*waves.reduce((n,w)=>n+w.rescued,0)/items).toFixed(1)};
  })
 };
}
