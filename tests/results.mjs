import assert from 'node:assert/strict';
import {judgeResult,rankRules} from '../dist/results.js';
import {Game} from '../dist/engine.js';
const base={clear:true,total:100,profit:25000,rescued:90,processed:85,heat:15};
assert.equal(judgeResult(base).rank,'S');
for(const [field,value]of [['rescued',89],['processed',84],['heat',15.01],['profit',24999]])assert.equal(judgeResult({...base,[field]:value}).rank,'A');
assert.equal(judgeResult({...base,profit:1000000,rescued:40}).rank,'C');
assert.equal(judgeResult({...base,profit:1000000,heat:61}).rank,'C');
assert.equal(judgeResult({...base,clear:false}).rank,'C');
for(const rule of rankRules){
 const result=judgeResult({clear:true,total:100,profit:rule.profit,rescued:rule.avoid*100,processed:rule.processed*100,heat:rule.heat});
 assert.equal(result.rank,rule.rank);
}
assert.equal(judgeResult({...base,total:0,rescued:0,processed:0}).rank,'C');
assert.equal(judgeResult({...base,rescued:50,processed:50}).target.rank,'B');
const g=new Game(()=>.2);g.total=2;g.rescued=2;g.sale({type:'card'},g.facilities[1],g.onis[1]);assert.equal(g.processed,1);g.finish(true);assert.equal(g.judgement.completion,.5);assert.equal(g.rank,'C');g.reset();assert.equal(g.processed,0);
console.log('PASS: strict rank boundaries, all-four-target gates, incomplete recycling, failed-run cap and reset');
