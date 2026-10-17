// Every target must be met. Profit cannot compensate for burning resources.
export const rankRules=[
 {rank:'S',avoid:.90,processed:.85,heat:15,profit:25000},
 {rank:'A',avoid:.80,processed:.75,heat:35,profit:18000},
 {rank:'B',avoid:.65,processed:.60,heat:60,profit:10000}
];
export function judgeResult({clear,profit,rescued,processed,total,heat}){
 const avoid=total>0?rescued/total:0,completion=total>0?processed/total:0;
 const met=rule=>({avoid:avoid>=rule.avoid,processed:completion>=rule.processed,heat:heat<=rule.heat,profit:profit>=rule.profit});
 const rank=clear?(rankRules.find(rule=>Object.values(met(rule)).every(Boolean))?.rank||'C'):'C';
 const index=rankRules.findIndex(rule=>rule.rank===rank);
 const target=index<0?rankRules.at(-1):rankRules[Math.max(0,index-1)];
 return{rank,avoid,completion,target,met:met(target)};
}
