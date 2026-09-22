// Static scene is painted once per land expansion, then composited as one layer.
// All decorative coordinates are visual only: no pathfinding or gameplay changes.
export const icons={wash:'💧',break:'⚙',repair:'🔧',press:'◆',compost:'🌿'};
export const palette={wash:'#59b9ea',break:'#ab80d8',repair:'#f4bc4a',press:'#ec7564',compost:'#8bb85d'};
export class Art {
  constructor(onLoad=()=>{}){this.images=new Map();this.onLoad=onLoad;this.revision=0}
  get(name){if(!this.images.has(name)){const im=new Image();this.images.set(name,im);im.onload=()=>{this.revision++;this.onLoad()};im.onerror=()=>{im.failed=true;this.revision++;this.onLoad()};im.src=`assets/${name}-${name==='truck-empty'?'v013':'v012'}.webp`}const im=this.images.get(name);return im.complete&&im.naturalWidth?im:null}
}
export function surface(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c}
export function rounded(c,x,y,w,h,r,fill,stroke){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.stroke()}}
export function background(land){
 const canvas=surface(1536,896),c=canvas.getContext('2d');c.scale(64,64);
 let seed=431;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 const box=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h)};
 const line=(x,y,a,b,col,width=.025)=>{c.strokeStyle=col;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(a,b);c.stroke()};
 const ellipse=(x,y,rx,ry,col)=>{c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill()};
 const text=(s,x,y,size,col)=>{c.font=`700 ${size}px system-ui`;c.fillStyle=col;c.textAlign='center';c.fillText(s,x,y)};
 const gradient=c.createLinearGradient(0,3,0,14);gradient.addColorStop(0,'#d8c7a3');gradient.addColorStop(1,'#bba785');box(0,0,24,14,gradient);
 // Fine aggregate is deterministic and baked into the terrain, not particles.
 for(let i=0;i<3200;i++){const x=rand()*24,y=4+rand()*10;box(x,y,.018+rand()*.04,.015,rand()>.5?'#eadbbb80':'#8d785332')}
 const tree=(x,y,size=.65)=>{ellipse(x+.18,y+.24,size*.85,size*.4,'#514e4242');box(x-.035,y-.22,.09,.65,'#75644c');for(let i=0;i<15;i++){const a=rand()*Math.PI*2,r=rand()*size*.65;ellipse(x+Math.cos(a)*r,y-.4+Math.sin(a)*r*.6,size*(.2+rand()*.24),size*.28,['#4c6b42','#618346','#7c9a4a','#93aa53'][i%4])}ellipse(x-.16,y-.64,size*.27,size*.15,'#b2c56780')};
 const crate=(x,y,w=.4)=>{box(x+.04,y+.05,w,.28,'#574b3a50');box(x,y,w,.27,'#99794c');box(x+.03,y+.02,w-.06,.22,'#bb965c');line(x+.03,y+.02,x+w-.03,y+.24,'#7a603e');line(x+.03,y+.24,x+w-.03,y+.02,'#7a603e')};
 const barrel=(x,y,col='#537d8b')=>{box(x-.13,y-.16,.26,.35,col);ellipse(x,y-.16,.13,.06,'#8bafaa');line(x-.13,y-.02,x+.13,y-.02,'#324e57');ellipse(x,y+.18,.13,.04,'#365259')};
 const fence=(y)=>{for(let x=.15;x<24;x+=.36){line(x,y,x+.36,y+.4,'#6c807d90',.012);line(x+.36,y,x,y+.4,'#6c807d90',.012)}for(let x=.2;x<24;x+=1.2){box(x,y-.06,.055,.62,'#546970');box(x,y-.06,.023,.62,'#b6c0ae')}line(0,y,24,y,'#607777',.06);line(0,y+.4,24,y+.4,'#80958b',.04)};
 // Japanese neighbourhood: shallow roofs, shopfronts, shutters and balconies.
 box(0,0,24,2.28,'#8a987a');
 for(let i=0;i<8;i++){const x=i*3+.24,col=['#ddd9bb','#b7c9c7','#d5c4ac','#ddd2b0'][i%4];box(x+.1,.1,2.6,1.72,'#52625b');box(x,.02,2.5,1.65,col);box(x,.05,2.5,.22,'#607e7b');for(let k=0;k<8;k++)line(x+k*.31,.05,x+k*.31,.27,'#9bab91',.02);for(let j=0;j<3;j++){box(x+.18+j*.72,.46,.5,.7,'#516978');box(x+.21+j*.72,.48,.18,.26,'#96c0c4');line(x+.18+j*.72,.79,x+.68+j*.72,.79,'#c1c3ae',.035)}box(x+.17,1.25,2.16,.15,'#adac93');box(x+1.94,1.41,.37,.53,'#a76452');box(x+1.97,1.44,.31,.23,'#dce0cb');box(x+2.07,1.75,.13,.09,'#344853')}
 box(0,1.94,24,.37,'#c3c4b4');for(let x=0;x<24;x+=.45)line(x,1.96,x,2.28,'#9eaa9a',.014);line(0,2.28,24,2.28,'#e6e6cb',.07);
 for(let x=.6;x<24;x+=3){tree(x,1.43,.57);box(x+1.65,1.3,.035,.86,'#394e53');line(x+1.65,1.31,x+1.86,1.31,'#394e53',.045);ellipse(x+1.85,1.33,.12,.04,'#f3d388')}
 const road=c.createLinearGradient(0,2.3,0,4.05);road.addColorStop(0,'#647073');road.addColorStop(1,'#4d5a60');box(0,2.32,24,1.72,road);
 for(let i=0;i<700;i++)box(rand()*24,2.35+rand()*1.65,.025,.012,'#c6d0c119');
 line(0,2.43,24,2.43,'#d7d9c3',.035);line(0,3.94,24,3.94,'#dedbbf',.04);
 for(let x=0;x<24;x+=1.5){box(x,3.13,.64,.09,'#dddcc6');if(x%3===0){c.fillStyle='#d9d9c269';c.beginPath();c.moveTo(x+.92,3.05);c.lineTo(x+1.13,3.18);c.lineTo(x+.92,3.31);c.fill()}}
 box(0,4.04,24,.22,'#d9d3b6');line(0,4.25,24,4.25,'#a79778',.04);
 for(let x=2;x<21;x+=.55){box(x,4.26,.32,.07,x%1>.5?'#e4b748':'#f4e6bd')}
 // Yard boundaries sit outside the buildable cells.
 for(let y=5.1;y<13.5;y+=1.5){tree(.32,y,.55);tree(23.6,y,.64)}
 for(let y=4.5;y<14;y+=.6){box(.74,y,.055,.6,'#607774');box(23.22,y,.055,.6,'#607774')}
 line(.77,4.4,.77,14,'#8d9e87',.025);line(23.2,4.4,23.2,14,'#8d9e87',.025);
 if(land<14){box(1,11,22,3,'#87966d');for(let i=0;i<250;i++){const x=1+rand()*22,y=11+rand()*3;line(x,y,x+.06,y-.1,'#5f804c',.025)}fence(11.12);for(let x=1.6;x<23;x+=3.1){tree(x,13.2,.75);crate(x+.6,12.9)}
 rounded(c,8.7,11.57,6.6,.88,.08,'#334b49','#b5b590');text('拡張予定地',12,11.94,.24,'#efdfb1');text('FUTURE RECYCLING YARD',12,12.22,.16,'#becab1')
 }else fence(13.55);
 for(const x of [1.1,22.2]){barrel(x,9.7);barrel(x+.26,10.05,'#879464');crate(x,8.7,.45)}
 // Environmental message is a physical sign; no UI baked into a raster scene.
 box(16.5,.52,.065,1.42,'#655b44');box(20.5,.52,.065,1.42,'#655b44');rounded(c,16.25,.4,4.55,.87,.07,'#334f4b','#c6d0ad');text('ごみじゃない。資源だ。',18.5,.77,.23,'#f9e7b3');text('NOT WASTE. A NEW BEGINNING.',18.5,1.03,.12,'#c7dbbe');
 text('荷下ろし / COLLECTION',11.8,4.68,.19,'#807152');
 return canvas;
}
