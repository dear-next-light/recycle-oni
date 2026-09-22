import {facilityTypes as F,trashTypes as T} from './config.js';
import {Camera} from './camera.js';
import {facilityEnglish as FE} from './labels.js';
import {Art,background,surface,rounded,icons,palette} from './art.js';
export class Renderer {
 constructor(canvas){
 this.canvas=canvas;this.ctx=canvas.getContext('2d');this.camera=new Camera();this.view={scale:1,x:0,y:0};
 this.scenery=document.createElement('canvas');this.scenery.id='scenery';this.scenery.setAttribute('aria-hidden','true');canvas.before(this.scenery);this.staticCtx=this.scenery.getContext('2d');
 this.art=new Art();this.scene=surface(1536,896);this.sceneKey='';this.screenKey='';this.clock=0;this.lastFrame=0;this.rallyUntil=0;this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 this.art.get('terrain');this.art.get('truck');this.art.get('oni-wash');this.art.get('oni-press');
 }
 point(e){const r=this.canvas.getBoundingClientRect(),v=this.camera.view;return{x:Math.floor((e.clientX-r.left-v.x)/v.scale),y:Math.floor((e.clientY-r.top-v.y)/v.scaleY)}}
 onEvent(e){if(e.kind==='shout'){this.rallyUntil=performance.now()+1800;this.art.get('oni-press')}}
 staticScene(g){
 for(const f of g.facilities)this.art.get(`facility-${f.type}`);
 const key=`${this.camera.aspect}:${g.land}:${this.art.revision}:`+g.facilities.map(f=>`${f.type},${f.x},${f.y},${f.level}`).join(';');
 if(this.sceneKey===key)return;this.sceneKey=key;this.screenKey='';
 if(this.land!==g.land){this.land=g.land;this.terrain=background(g.land)}
 const c=this.scene.getContext('2d');c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,1536,896);const terrain=this.art.get('terrain');c.drawImage(terrain||this.terrain,0,0,1536,896);if(terrain&&g.land===14){c.drawImage(terrain,64,320,1408,250,64,690,1408,206)}c.scale(64,64);
 if(terrain){c.lineWidth=.025;rounded(c,16.5,.8,4.8,.82,.06,'#263f41','#c9c4a0');c.textAlign='center';c.fillStyle='#f6e5b4';c.font='700 .22px system-ui';c.fillText('ごみじゃない。資源だ。',18.9,1.15);c.font='600 .13px system-ui';c.fillText('NOT WASTE. A NEW BEGINNING.',18.9,1.43);if(g.land<14){rounded(c,9,11.6,6,.76,.05,'#294441d9');c.font='600 .2px system-ui';c.fillStyle='#f6e5b4';c.fillText('拡張予定地 / Expandable land',12,12.06)}}
 for(const f of [...g.facilities].sort((a,b)=>a.y-b.y)){
 c.fillStyle='#574e3b30';c.beginPath();c.ellipse(f.x+1.1,f.y+1.87,1.06,.22,0,0,Math.PI*2);c.fill();
 const im=this.art.get(`facility-${f.type}`);
 if(im)c.drawImage(im,f.x-.06,f.y-.72,2.12,2.75);
 else{rounded(c,f.x,f.y,2,1.9,.08,'#e4d4ad','#647477');rounded(c,f.x,f.y,2,.5,.05,palette[f.type]);rounded(c,f.x+.15,f.y+.55,1.7,1.12,.03,'#4b5b59')}
 c.lineWidth=.025;rounded(c,f.x+.17,f.y+.15,1.66,.66,.035,'#fff2d8','#665e49');
 c.fillStyle='#273b41';c.textAlign='center';c.font='800 .29px system-ui';c.fillText(`${icons[f.type]} ${F[f.type].name}`,f.x+1,f.y+.46);
 c.font='600 .20px system-ui';c.fillText(FE[f.type],f.x+1,f.y+.70);
 rounded(c,f.x+.23,f.y+1.94,1.54,.29,.06,'#263c42');c.font='600 .16px system-ui';c.fillStyle='#e8e1c6';c.fillText(`Lv.${f.level}`,f.x+1,f.y+2.14);
 }
 }
 draw(g,selected,mode){
 const now=performance.now(),dt=Math.min(.05,(now-this.lastFrame)/1000||0);this.lastFrame=now;this.clock+=dt;
 const c=this.canvas,r=c.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,1.75);if(r.width<1||r.height<1)return;
 const w=Math.round(r.width*d),h=Math.round(r.height*d);
 if(c.width!==w||c.height!==h){c.width=this.scenery.width=w;c.height=this.scenery.height=h;this.screenKey=''}
 this.camera.resize(r.width,r.height);const v=this.camera.view;this.view=v;this.staticScene(g);
 const k=`${w},${h},${v.x},${v.y},${v.scale},${v.scaleY},${this.sceneKey}`;
 if(k!==this.screenKey){this.screenKey=k;const b=this.staticCtx;b.setTransform(d,0,0,d,0,0);b.fillStyle='#64735b';b.fillRect(0,0,r.width,r.height);b.translate(v.x,v.y);b.scale(v.scale,v.scaleY);b.drawImage(this.scene,0,0,24,14)}
 const ctx=this.ctx;ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,w,h);ctx.setTransform(d,0,0,d,0,0);ctx.translate(v.x,v.y);ctx.scale(v.scale,v.scaleY);
 const text=(t,x,y,size=.25,col='#fff2c3')=>{ctx.font=`700 ${size}px system-ui`;ctx.textAlign='center';ctx.lineWidth=.045;ctx.strokeStyle='#263b40';ctx.strokeText(t,x,y);ctx.fillStyle=col;ctx.fillText(t,x,y)};
 if(mode){ctx.strokeStyle='#526b6b55';ctx.lineWidth=.018;for(let x=1;x<=23;x++){ctx.beginPath();ctx.moveTo(x,6);ctx.lineTo(x,g.land);ctx.stroke()}for(let y=6;y<=g.land;y++){ctx.beginPath();ctx.moveTo(1,y);ctx.lineTo(23,y);ctx.stroke()}}
 for(const o of g.onis){
 if(!o.path.length)continue;if(selected?.kind==='oni'&&selected.id!==o.id)continue;if(selected?.kind==='facility'&&selected.id!==o.facility)continue;
 const f=g.facilities.find(f=>f.id===o.facility);ctx.save();ctx.strokeStyle=palette[f.type];ctx.globalAlpha=selected ? .85:.42;ctx.lineWidth=g.flow>=3?.065:.045;ctx.setLineDash([.18,.12]);ctx.lineDashOffset=this.reduced?0:-this.clock*(g.flow>=3?.7:.35);ctx.beginPath();ctx.moveTo(o.x+.5,o.y+.5);for(const p of o.path)ctx.lineTo(p.x+.5,p.y+.5);ctx.stroke();ctx.setLineDash([]);const p=o.path.at(-1);ctx.beginPath();ctx.moveTo(p.x+.36,p.y+.34);ctx.lineTo(p.x+.5,p.y+.53);ctx.lineTo(p.x+.64,p.y+.34);ctx.stroke();ctx.restore();
 }
 for(const t of g.trucks){const im=this.art.get('truck');if(im)ctx.drawImage(im,t.x-.18,2.25,2.75,1.70);else{rounded(ctx,t.x,2.55,2.4,1.1,.12,'#dde7d3','#394f54')}
 rounded(ctx,t.x+.6,3.7,1.23,.3,.09,'#233c41');text(`♻ ${t.items.length}`,t.x+1.21,3.91,.21,'#f8edc4')}
 for(const f of g.facilities){
 if(f.jobs.length){const p=Math.min(1,f.jobs[0].progress);rounded(ctx,f.x+.3,f.y+1.86,1.4,.09,.04,'#263d40');rounded(ctx,f.x+.3,f.y+1.86,1.4*p,.09,.04,palette[f.type]);if(!this.reduced){const phase=this.clock*3+f.id;ctx.fillStyle='#fff3bb';ctx.globalAlpha=.5+.3*Math.sin(phase);ctx.beginPath();ctx.arc(f.x+1.6,f.y+1.3,.045,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1}}
 if(f.input.length||f.output.length)text(`${f.input.length}/${g.capacity(f)}${f.output.length?' →'+f.output.length:''}`,f.x+1,f.y+2.15,.16);
 if(selected?.kind==='facility'&&selected.id===f.id){ctx.lineWidth=.06;ctx.strokeStyle='#fff1ab';ctx.strokeRect(f.x-.06,f.y-.13,2.12,2.38)}
 }
 for(const o of [...g.onis].sort((a,b)=>a.y-b.y)){
 const x=o.x+.5,y=o.y+.5,moving=o.path.length>0&&!o.rest,phase=this.clock*(moving?10:2.5)+o.id,bob=this.reduced?0:Math.sin(phase)*(moving?.035:.012);
 ctx.fillStyle='#38483b48';ctx.beginPath();ctx.ellipse(x,y+.27,.27,.1,0,0,Math.PI*2);ctx.fill();
 if(selected?.kind==='oni'&&selected.id===o.id){ctx.strokeStyle='#fff1a1';ctx.lineWidth=.05;ctx.beginPath();ctx.ellipse(x,y+.27,.39,.16,0,0,Math.PI*2);ctx.stroke()}
 const im=this.art.get(`oni-${o.type}`);if(im){ctx.save();ctx.translate(x,y+bob);ctx.rotate(this.reduced?0:Math.sin(phase)*(moving?.035:.008));ctx.drawImage(im,-.42,-.88,.84,1.22);ctx.restore()}else{ctx.fillStyle=palette[o.type];ctx.beginPath();ctx.arc(x,y,.22,0,Math.PI*2);ctx.fill();text('鬼',x,y+.08,.25)}
 if(o.carry){rounded(ctx,x+.17,y-.02,.27,.26,.025,T[o.carry.type].color,'#304448');text(T[o.carry.type].mark,x+.31,y+.16,.15,'#fff5d2')}
 if(o.stamina<25)text(o.rest?'休 / Rest':'汗 / Tired',x,y-.66,.16,'#a6e1f7');
 if(g.flow>=2&&!this.reduced&&moving&&o.id%3===0)text('✦',x-.3,y-.28+Math.sin(phase)*.08,.14,'#fff1ad');
 }
 for(const e of g.effects){if(e.text==='救出')continue;ctx.globalAlpha=Math.min(1,e.life);text(e.text,e.x+1,e.y,.29,e.text.startsWith('+')?'#fff7ac':'#ffffff');ctx.globalAlpha=1}
 if(g.shout>0){ctx.strokeStyle='#ffe090aa';ctx.lineWidth=.06;ctx.strokeRect(.08,4.3,23.84,9.62)}
 if(g.state==='wave'&&g.weather==='rain'&&!this.reduced){ctx.strokeStyle='#dcebf480';ctx.lineWidth=.025;for(let i=0;i<18;i++){let x=(i*7.13)%24,y=((i*.87+this.clock*4)%10)+4;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-.11,y+.26);ctx.stroke()}}
 if(g.state==='wave'&&g.heat>=75){ctx.fillStyle='#e78c3020';ctx.fillRect(0,0,24,14)}
 if(now<this.rallyUntil){ctx.setTransform(d,0,0,d,0,0);const bw=Math.min(380,r.width-24),bx=(r.width-bw)/2;ctx.lineWidth=2;rounded(ctx,bx,14,bw,83,12,'#243c46ed','#f3c764');const im=this.art.get('oni-press');if(im)ctx.drawImage(im,bx+4,17,72,76);ctx.textAlign='left';ctx.fillStyle='#ffe49a';ctx.font='800 23px system-ui';ctx.fillText('まだ使える！',bx+82,51);ctx.fillStyle='#e6eadb';ctx.font='13px system-ui';ctx.fillText('STILL USEFUL! · RALLY',bx+82,76)}
 }
}


