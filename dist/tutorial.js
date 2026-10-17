import {C,facilityTypes as F} from './config.js';

// A visual hint layer. It never pauses play, changes the game, or captures yard taps.
const KEY='recycle-oni-guide-v1';
const $=selector=>document.querySelector(selector);
const svg=body=>`<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">${body}</svg>`;
const icons={
 truck:svg('<path d="M5 15h25v19H5zM30 22h8l6 7v5H30z"/><path class="guide-icon-fill" d="m8 14 4-7 7 3 6-4 4 8z"/><circle cx="13" cy="36" r="5"/><circle cx="36" cy="36" r="5"/>'),
 wash:svg('<path class="guide-icon-fill" d="M24 5C20 13 10 23 10 31a14 14 0 0 0 28 0C38 23 28 13 24 5Z"/><path d="M17 30a7 7 0 0 0 7 8"/>'),
 press:svg('<path d="M7 7h34v7H7zM10 38h28v5H10zM24 14v9M15 23h18"/><path class="guide-icon-fill" d="m11 28 13-5 13 5-2 10H13z"/>'),
 money:svg('<circle class="guide-icon-fill" cx="24" cy="24" r="19"/><path d="m15 12 9 13 9-13M24 25v13M15 26h18M15 32h18"/>'),
 facility:svg('<path d="M5 21 24 7l19 14v22H5z"/><path class="guide-icon-fill" d="M14 26h20v17H14z"/><path d="M11 20h26"/>'),
 rally:svg('<path class="guide-icon-fill" d="m12 17 21-8v30l-21-8z"/><path d="M6 18h6v12H6zM16 32l4 10h8l-4-7M39 17l6-3M40 24h6M39 31l6 3"/>'),
 upgrade:svg('<rect x="3" y="12" width="12" height="28" rx="3"/><rect class="guide-icon-fill" x="18" y="5" width="12" height="35" rx="3"/><rect x="33" y="12" width="12" height="28" rx="3"/><path d="m21 23 3 3 4-7"/>'),
 oni:'<img src="assets/oni-wash-v014.webp" alt="">',
};
const labels={
 start:['準備できたら →','Ready? Start Wave 1'],
 truck:['回収車が到着','The truck arrives'],
 carry:['小鬼が運ぶ','Oni carry the waste'],
 wash:['まず、洗浄','First, wash'],
 press:['次の施設へ','Next, compress'],
 money:['資源が利益に','Resources → profit'],
 rally:['号令で加速！','Rally speeds up the team'],
 upgrade:['3つから1つ','Choose one free upgrade'],
 capacity:['空き枠に小鬼を','Fill an open Oni slot'],
 build:['施設を増やす → 小鬼も増やせる','More facilities → more Oni'],
 place:['空き地に配置','Place on an empty space'],
 done:['次の回収へ！','Ready for the next collection!'],
};
const flowSteps=['truck','carry','wash','press','money'];
const flowIcon={truck:'truck',carry:'oni',wash:'wash',press:'press',money:'money'};

export class Tutorial{
 constructor(){
  this.completed=false;try{this.completed=localStorage.getItem(KEY)==='done'}catch{}
  this.pending=!this.completed;this.active=false;this.stage='';this.lastState='';this.manual=false;
  this.helpButton=document.createElement('button');this.helpButton.className='guide-help';this.helpButton.type='button';this.helpButton.innerHTML='<span aria-hidden="true">?</span><span>ガイド<span class="en">Guide</span></span>';this.helpButton.setAttribute('aria-label','グラフィカルガイドを再表示 / Replay visual guide');this.helpButton.onclick=()=>this.replay();
  this.layer=document.createElement('div');this.layer.className='guide-layer';this.layer.hidden=true;
  this.layer.innerHTML='<div class="guide-focus" aria-hidden="true"><span class="guide-pointer">↓</span></div><section class="guide-card" aria-label="遊び方ガイド / Visual guide"><div class="guide-top"><span class="guide-step-count"></span><button class="guide-skip" type="button" aria-label="ガイドをスキップ / Skip guide">×</button></div><div class="guide-graphic" aria-hidden="true"></div><div class="guide-label" role="status" aria-live="polite"></div></section>';
  document.body.append(this.layer);this.focus=this.layer.querySelector('.guide-focus');this.card=this.layer.querySelector('.guide-card');this.graphic=this.layer.querySelector('.guide-graphic');this.label=this.layer.querySelector('.guide-label');this.count=this.layer.querySelector('.guide-step-count');this.layer.querySelector('.guide-skip').onclick=()=>this.finish();
  this.lastLayout='';this.lastCapacity='';
 }
 replay(){this.manual=true;this.active=true;this.pending=false;this.stage='';this.lastState='';this.prepBaseline=null;if(this.game)this.update(this.game,this.renderer,this.mode)}
 finish(){this.active=false;this.pending=false;this.completed=true;try{localStorage.setItem(KEY,'done')}catch{}this.hide()}
 hide(){this.layer.hidden=true}
 step(stage,g){
  if(this.stage===stage)return;
  this.stage=stage;this.stageTime=g.time||0;this.stageClock=performance.now();this.lastLayout='';this.lastCapacity='';
  const [ja,en]=labels[stage]||labels.start;this.label.innerHTML=`<b>${ja}</b><span>${en}</span>`;
  let graphic='';
  if(flowSteps.includes(stage)||stage==='start'){
   graphic=flowSteps.map((s,i)=>`${i?'<i class="guide-arrow">→</i>':''}<span class="guide-node${s===stage?' is-current':''}${flowSteps.indexOf(s)<flowSteps.indexOf(stage)?' is-past':''}">${icons[flowIcon[s]]}</span>`).join('');
  }else if(stage==='rally')graphic=`<span class="guide-node is-current guide-rally-icon">${icons.rally}</span><i class="guide-arrow">→</i><span class="guide-node">${icons.oni}</span><span class="guide-speed" aria-hidden="true">» »</span>`;
  else if(stage==='upgrade')graphic=`<span class="guide-upgrade-icon">${icons.upgrade}</span><i class="guide-arrow">→</i><span class="guide-one">1</span>`;
  else if(stage==='done')graphic='<span class="guide-complete">✓</span><i class="guide-arrow">→</i>'+icons.truck;
  else graphic=`<span class="guide-node">${icons.facility}</span><span class="guide-slots"></span><i class="guide-arrow">→</i><span class="guide-node">${icons.oni}</span><span class="guide-capacity"></span>`;
  this.graphic.innerHTML=graphic;
  const n=stage==='start'?1:flowSteps.includes(stage)?2:['rally','upgrade'].includes(stage)?3:4;this.count.textContent=`${n} / 4`;
  this.layer.dataset.step=stage;
 }
 update(g,renderer,mode=null){
  this.game=g;this.renderer=renderer;this.mode=mode;
  if(g.state==='title'){this.hide();return}
  if(g.state==='result'){if(this.active)this.finish();else this.hide();return}
  if(this.pending&&g.state==='prep'&&g.wave===0){this.pending=false;this.active=true;this.manual=false;this.lastState='';this.stage=''}
  if(!this.active){this.hide();return}
  // The first two collections are enough. A replay can be opened at any later time.
  if(!this.manual&&g.wave>=2){this.finish();return}
  if(g.state==='upgrade'){this.step('upgrade',g);this.prepBaseline=null}
  else if(g.state==='prep'){
   if(g.wave===0&&!this.manual)this.step('start',g);
   else{
    if(this.lastState!=='prep'||this.prepBaseline===null||this.prepBaseline===undefined){this.prepBaseline=g.facilities.length;this.prepOnis=g.onis.length;this.prepClock=performance.now();this.step(g.onis.length>=g.oniCapacity()?'build':'capacity',g)}
    if(g.facilities.length>this.prepBaseline){this.step('done',g);if(performance.now()-this.stageClock>3000){this.finish();return}}
    else if(mode?.type)this.step('place',g);
    else if(this.stage==='place')this.step('build',g);
    else if(g.onis.length>this.prepOnis||g.onis.length>=g.oniCapacity()||performance.now()-this.prepClock>12000)this.step('build',g);
   }
  }else if(g.state==='wave'){
   if(this.lastState!=='wave'){
    if(this.lastState==='prep'&&g.wave>=2){this.finish();return}
    this.waveProfit=g.profit;this.step('truck',g);
   }
   const age=(g.time||0)-this.stageTime,wash=g.facilities.find(f=>f.type==='wash'),press=g.facilities.find(f=>f.type==='press');
   if(this.stage==='truck'&&age>=3&&(g.onis.some(o=>o.carry)||age>=8))this.step('carry',g);
   else if(this.stage==='carry'&&age>=3&&((wash&&(wash.input.length||wash.jobs.length))||age>=7))this.step('wash',g);
   else if(this.stage==='wash'&&age>=4&&((wash?.output.length)||(press&&(press.input.length||press.jobs.length))||age>=7))this.step('press',g);
   else if(this.stage==='press'&&age>=4&&(g.profit>this.waveProfit||age>=7))this.step('money',g);
   else if(this.stage==='money'&&age>=4)this.step('rally',g);
   else if(this.stage==='rally'&&(g.shoutUsed||g.time>=46))this.step('wait',g);
   if(this.stage==='wait'){this.hide();this.lastState=g.state;return}
  }
  this.lastState=g.state;this.layer.hidden=false;this.card.hidden=this.stage==='upgrade';
  this.updateCapacity(g);this.layout(g,renderer,mode);
 }
 updateCapacity(g){
  if(!['capacity','build','place'].includes(this.stage))return;
  const value=`${g.onis.length}/${g.oniCapacity()}`,key=`${value}:${C.oniPerFacility}`;if(this.lastCapacity===key)return;this.lastCapacity=key;
  const slots=this.graphic.querySelector('.guide-slots');slots.replaceChildren();
  for(let i=0;i<C.oniPerFacility;i++){const dot=document.createElement('i');dot.className='guide-slot';slots.append(dot)}
  this.graphic.querySelector('.guide-capacity').textContent=value;
 }
 target(g,renderer,mode){
  const element=selector=>{const el=$(selector);return el&&!el.hidden?el.getBoundingClientRect():null};
  const world=(x,y,w=1,h=1)=>{
   const r=renderer.canvas.getBoundingClientRect(),v=renderer.camera.view;return{left:r.left+v.x+x*v.scale,top:r.top+v.y+y*v.scaleY,width:w*v.scale,height:h*v.scaleY,world:true};
  };
  if(this.stage==='start')return element('[data-guide="start"],.start-wave');
  if(this.stage==='rally')return element('[data-guide="rally"],.rally');
  if(this.stage==='upgrade')return element('.cards');
  if(this.stage==='money')return element('#hud-money');
  if(this.stage==='capacity')return element('[data-guide="hire"]')||element('.build-strip button:nth-last-child(2)');
  if(this.stage==='build'){
   const needed=!g.facilities.some(f=>f.type==='compost')?'compost':!g.facilities.some(f=>f.type==='repair')?'repair':'wash';
   return element(`[data-guide="build-${needed}"]`)||element(`.build-strip button:nth-child(${Object.keys(F).indexOf(needed)+1})`);
  }
  if(this.stage==='place'){
   for(let y=6;y<g.land-1;y++)for(let x=2;x<=20;x++)if(g.canPlace(mode.type,x,y))return world(x,y,2,2);
  }
  if(this.stage==='truck'){const t=g.trucks.find(t=>t.x>=0&&t.x<=21)||g.trucks[0];return t?world(t.x,2.3,2.6,1.6):world(0,2.3,2.6,1.6)}
  if(this.stage==='carry'){const o=g.onis.find(o=>o.carry)||g.onis.find(o=>o.path.length)||g.onis[0];return o?world(o.x,o.y-.5,1,1.4):null}
  const f=g.facilities.find(f=>f.type===this.stage);return f?world(f.x,f.y-.5,2,2.8):null;
 }
 layout(g,renderer,mode){
  const field=$('#field').getBoundingClientRect(),viewportWidth=document.documentElement.clientWidth,viewportHeight=document.documentElement.clientHeight;
  this.card.style.left=`${Math.max(8,field.left+8)}px`;this.card.style.top=`${Math.max(8,field.top+8)}px`;this.card.style.maxWidth=`${Math.max(180,Math.min(326,field.width-16))}px`;
  const target=this.target(g,renderer,mode);
  const cardHeight=this.card.getBoundingClientRect().height,cardWidth=this.card.getBoundingClientRect().width;
  const portrait=viewportWidth<=700&&viewportHeight>viewportWidth;
  const overlaps=target&&target.top<field.top+8+cardHeight&&target.top+target.height>field.top+8&&target.left<field.left+8+cardWidth&&target.left+target.width>field.left+8;
  if(portrait||overlaps)this.card.style.top=`${Math.max(field.top+8,field.bottom-cardHeight-12)}px`;
  if(!target||target.width<=0||target.height<=0){this.focus.hidden=true;return}
  this.focus.hidden=false;let left=target.left-5,top=target.top-5,width=target.width+10,height=target.height+10;
  const minX=target.world?field.left+5:4,maxX=target.world?field.right-5:viewportWidth-4,minY=target.world?field.top+5:4,maxY=target.world?field.bottom-5:viewportHeight-4;
  width=Math.min(width,maxX-minX);height=Math.min(height,maxY-minY);const originalX=left,originalY=top;
  left=Math.max(minX,Math.min(maxX-width,left));top=Math.max(minY,Math.min(maxY-height,top));
  this.focus.classList.toggle('is-offscreen',target.world&&(Math.abs(left-originalX)>10||Math.abs(top-originalY)>10));
  this.focus.querySelector('.guide-pointer').textContent=this.stage==='upgrade'?'1 / 3':originalX<left-10?'←':originalX>left+10?'→':originalY<top-10?'↑':'↓';
  const layout=`${Math.round(left)},${Math.round(top)},${Math.round(width)},${Math.round(height)}`;
  if(layout!==this.lastLayout){this.lastLayout=layout;this.focus.style.left=`${left}px`;this.focus.style.top=`${top}px`;this.focus.style.width=`${width}px`;this.focus.style.height=`${height}px`}
  // The choices already explain the upgrade; an outline avoids covering their text.
  this.card.classList.toggle('is-upgrade',this.stage==='upgrade');
 }
}
