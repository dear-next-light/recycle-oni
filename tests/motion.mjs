import assert from 'node:assert/strict';import {runningPose} from '../dist/motion.js';
const prev={x:5,y:5,facing:1,direction:'down'};
for(const [x,y,direction,frame]of [[6,5,'right',0],[4,5,'left',0],[5,4,'up',2],[5,6,'down',3]]){const p=runningPose(prev,{x,y,id:1},0);assert.equal(p.direction,direction);assert.equal(p.frame,frame);assert(p.moving)}
assert.equal(runningPose(prev,{x:6,y:5,id:1},.13).frame,1);
assert.equal(runningPose(prev,{x:6,y:5,id:1},.13,true).frame,0);
assert.equal(runningPose(prev,{x:5,y:5,id:1},.13).moving,false);
assert.equal(runningPose(prev,{x:6,y:5,id:1,rest:true},.13).moving,false);
console.log('PASS: four travel directions, true side-profile frame choice, run frame alternation and reduced motion');
