// Visual state only. Never changes simulation position or speed.
export function runningPose(previous, oni, time, reduced=false){
 const dx=previous?oni.x-previous.x:0,dy=previous?oni.y-previous.y:0;
 const moving=!!previous&&!oni.rest&&Math.hypot(dx,dy)>.0001;
 const horizontal=Math.abs(dx)>=Math.abs(dy),direction=moving?(horizontal?(dx<0?'left':'right'):(dy<0?'up':'down')):(previous?.direction||'down');
 const facing=direction==='left'?-1:direction==='right'?1:(previous?.facing||1);
 const stride=moving&&!reduced?Math.sin(time*18+oni.id):0;
 const frame=direction==='up'?2:direction==='down'?3:(moving&&!reduced?Math.floor(time*8)%2:0);
 return{x:oni.x,y:oni.y,facing,moving,stride,direction,frame};
}

// Distinct silhouettes at sprite scale: no font/emoji dependency.
export function drawCargo(c,type,x,y){
 c.save();c.translate(x,y);c.scale(.7,.7);c.lineWidth=.045;c.strokeStyle='#263843';
 c.shadowColor='#10252c88';c.shadowBlur=2;
 const box=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h);c.strokeRect(x,y,w,h)};
 if(type==='pet'){
  box(-.10,-.49,.20,.12,'#3182c1');c.beginPath();c.moveTo(-.12,-.37);c.lineTo(-.22,-.22);c.lineTo(-.22,.35);c.quadraticCurveTo(0,.46,.22,.35);c.lineTo(.22,-.22);c.lineTo(.12,-.37);c.closePath();c.fillStyle='#a2edfa';c.fill();c.stroke();box(-.21,-.04,.42,.19,'#2586c4');
 }else if(type==='can'){
  box(-.25,-.32,.5,.68,'#d4e7ee');c.beginPath();c.ellipse(0,-.32,.25,.10,0,0,Math.PI*2);c.fillStyle='#91aab4';c.fill();c.stroke();box(-.25,-.04,.5,.23,'#ed9451');
 }else if(type==='card'){
  box(-.38,-.28,.76,.63,'#dca868');box(-.065,-.28,.13,.63,'#f8d594');c.beginPath();c.moveTo(-.38,-.28);c.lineTo(-.2,-.45);c.lineTo(.29,-.45);c.lineTo(.38,-.28);c.fillStyle='#f0c68b';c.fill();c.stroke();
 }else if(type==='phone'){
  box(-.25,-.43,.5,.86,'#303749');box(-.19,-.33,.38,.58,'#70d8e5');c.fillStyle='#e5f9ff';c.fillRect(-.06,.32,.12,.035);
 }else if(type==='battery'){
  box(-.11,-.46,.22,.09,'#d3dde2');box(-.25,-.37,.5,.78,'#edca52');box(-.25,-.37,.5,.22,'#424b57');c.fillStyle='#263843';c.font='bold .3px sans-serif';c.textAlign='center';c.fillText('+',0,.22);
 }else if(type==='cloth'){
  c.beginPath();for(const [i,p]of [[-.17,-.35],[-.42,-.2],[-.28,.02],[-.2,-.02],[-.22,.38],[.22,.38],[.2,-.02],[.28,.02],[.42,-.2],[.17,-.35],[.08,-.23],[-.08,-.23]].entries())i?c.lineTo(...p):c.moveTo(...p);c.closePath();c.fillStyle='#e998c6';c.fill();c.stroke();
 }else{
  c.beginPath();c.ellipse(0,.15,.36,.28,0,0,Math.PI*2);c.fillStyle='#b87e49';c.fill();c.stroke();for(const [a,b]of [[-.15,-.12],[.1,-.25],[.21,-.07]]){c.beginPath();c.ellipse(a,b,.13,.23,.6,0,Math.PI*2);c.fillStyle='#a5d660';c.fill();c.stroke()}
 }
 c.restore();
}
