import assert from 'node:assert/strict';
import {C,waveDefinitions as W} from '../dist/config.js';
import {runStrategy,summarize,seeds,oldLoads} from './balance-strategies.mjs';

const currentLoads=W.map(w=>w.load);
assert.deepEqual(currentLoads.slice(0,5),oldLoads.slice(0,5));
for(let i=5;i<8;i++)assert(currentLoads[i]>oldLoads[i]);
assert.equal(C.maxOni,20);
assert.equal(C.oniPerFacility,2);
assert.equal(C.startLand,9);
assert(C.maxItems<=72);

const naiveResults=seeds.map(seed=>runStrategy(seed,{invest:false}));
const compactResults=seeds.map(seed=>runStrategy(seed));
const expandedResults=seeds.map(seed=>runStrategy(seed,{expand:true}));
const naive=summarize(naiveResults),compact=summarize(compactResults),expanded=summarize(expandedResults);

assert.equal(expanded.clears,seeds.length);
assert(naive.clears<seeds.length/2);
for(let i=0;i<3;i++)assert.deepEqual(compact.waves[i],expanded.waves[i]);
for(const result of expandedResults){
 assert.equal(result.waves.length,8);
 assert(result.waves[5].onis<C.maxOni,'recruitment must still matter after Wave 6');
 assert(result.waves[6].spending>0&&result.waves[7].spending>0,'late preparation must retain useful purchases');
 assert(result.waves[7].levelTotal<result.waves[7].facilities*4,'a natural run should not max every facility');
 assert.equal(result.waves[7].onis,C.maxOni);
 assert.equal(result.waves[7].facilities,10);
 for(const wave of result.waves){assert(wave.spending>=0);assert(wave.money>=0)}
}
assert(expanded.recoveryPercent>compact.recoveryPercent+3);
assert(expanded.meanHeat<compact.meanHeat-7);
assert(expanded.meanHeat>25,'burning must exert meaningful heat pressure');
assert(expanded.finishedPercent>compact.finishedPercent+3);

console.log(JSON.stringify({naive,compact,expanded},null,2));
console.log('PASS: natural expansion clears ten seeds, late purchases continue through Wave 8, heat punishes missed recycling, bounded teams remain useful');
