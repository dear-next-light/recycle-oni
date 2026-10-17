import assert from 'node:assert/strict';
import {C,waveDefinitions as W} from '../dist/config.js';
import {runStrategy,summarize,seeds,oldLoads} from './balance-strategies.mjs';

const currentLoads=W.map(w=>w.load);
assert.deepEqual(currentLoads.slice(0,5),oldLoads.slice(0,5));
for(let i=5;i<8;i++)assert(currentLoads[i]>oldLoads[i]);
assert.equal(C.maxOni,C.maxFacilities*C.oniPerFacility);
assert.equal(C.oniPerFacility,2);
assert.equal(C.startLand,9);
assert(C.maxItems<=72);

const current=summarize(seeds.map(seed=>runStrategy(seed,{max:12,items:40,loads:oldLoads})));
const singleOni=summarize(seeds.map(seed=>runStrategy(seed,{expand:true,per:1,max:10,items:40,loads:oldLoads})));
const compactResults=seeds.map(seed=>runStrategy(seed));
const expandedResults=seeds.map(seed=>runStrategy(seed,{expand:true}));
const compact=summarize(compactResults),expanded=summarize(expandedResults);

assert.equal(expanded.clears,seeds.length);
assert.equal(expanded.waves[7].onis,20);
assert.equal(expanded.waves[7].facilities,10);
assert(singleOni.recoveryPercent<current.recoveryPercent-8);
assert(singleOni.waves[1].recoveryPercent<60);
for(let i=0;i<4;i++)assert.deepEqual(compact.waves[i],expanded.waves[i]);
for(const i of [6,7]){
 assert(compact.waves[i].meanItems>current.waves[i].meanItems*1.35);
 assert(expanded.waves[i].recoveryPercent>compact.waves[i].recoveryPercent+8);
}
assert(expanded.recoveryPercent>compact.recoveryPercent+7);
assert(expanded.meanHeat<compact.meanHeat-15);
assert(expanded.finishedPercent>compact.finishedPercent+7);
for(let i=0;i<seeds.length;i++)assert(expandedResults[i].rescued>compactResults[i].rescued);

console.log(JSON.stringify({current,singleOni,compact,expanded},null,2));
console.log('PASS: late loads create pressure, paid land/facility/team expansion improves recovery, 20 Oni remain bounded, one-per-facility harms early balance');
