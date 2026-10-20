import {facilityTypes} from './config.js';

// Counts describe the team/site before the purchase. The fourth Oni keeps the
// affordable opening price; later additions compete with facilities and levels.
export function hirePrice(count){
 const step=Math.max(0,Math.floor(count)-3);
 return 180+15*step+5*step*step;
}

export function facilityPrice(type,count){
 const base=facilityTypes[type]?.price;
 if(base===undefined)return Infinity;
 const step=Math.max(0,Math.floor(count)-2);
 return base+45*step+15*step*step;
}

export function levelPrice(level){
 return {1:180,2:650,3:2200}[Math.floor(level)]??Infinity;
}
