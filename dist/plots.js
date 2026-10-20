// Construction is restricted to these visible 2x2 foundations. Gaps are paths.
const columns=[3,7,11,15,19];
export const buildingPlots=Object.freeze([6,9].flatMap(y=>columns.map(x=>Object.freeze({x,y}))));
export function constructionPlots(land,includeLocked=false){
 return buildingPlots.map(p=>({...p,locked:p.y+1>=land})).filter(p=>includeLocked||!p.locked);
}
export function plotAt(point,land,includeLocked=false){
 return constructionPlots(land,includeLocked).find(p=>point.x>=p.x&&point.x<p.x+2&&point.y>=p.y&&point.y<p.y+2)||null;
}
