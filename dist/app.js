import {icons,palette} from './art.js';
import {Game} from './engine.js';
import {Renderer} from './render.js';
import {Sound} from './audio.js';
import {bindGestures} from './camera.js';
import {C,facilityTypes as F,traits,upgrades,waveDefinitions as W,weatherEffects} from './config.js';
import {bi,facilityEnglish as FE,traitEnglish as TE,upgradeEnglish as UE,waveEnglish as WE,weatherEnglish,speechEnglish} from './labels.js';
const $=s=>document.querySelector(s),game=new Game(),renderer=new Renderer($('#game'));
const KEY='recycle-oni-v01';let saved={profit:0,avoid:0,flow:0,rank:'C',muted:true};
try{Object.assign(saved,JSON.parse(localStorage.getItem(KEY)||'{}'))}catch{}
const sound=new Sound(saved.muted);let lastState='',selected=null,mode=null,last=0,hudTimer=0,savedResult=false;
function persist(){try{localStorage.setItem(KEY,JSON.stringify(saved))}catch{}}
function btn(ja,en,fn,cls='',disabled=false){const b=document.createElement('button');b.innerHTML=bi(ja,en);b.className=cls;b.disabled=disabled;b.onclick=fn;return b}
function say(ja,en=speechEnglish[ja]||''){$('#caption').innerHTML=bi(`鬼 「${ja}」`,en)}
function refresh(){lastState='';hudTimer=1;ui()}
function closeDetail(){selected=null;$('#detail').replaceChildren()}
function setMode(next){mode=next;closeDetail();say('空きマスをタップ。ドラッグで移動。','Tap an empty cell. Drag to pan.');renderTools()}
function renderTools(){const t=$('#view-tools');t.replaceChildren();t.hidden=!['prep','wave'].includes(game.state);if(t.hidden)return;
t.append(btn('−','Zoom out',()=>{renderer.camera.zoomAt(1/1.25);updateZoom()},'zoom-button'));
const z=document.createElement('output');z.id='zoom-value';z.setAttribute('aria-live','polite');t.append(z);
t.append(btn('＋','Zoom in',()=>{renderer.camera.zoomAt(1.25);updateZoom()},'zoom-button'));
t.append(btn('全体','Fit',()=>{renderer.camera.fit();updateZoom()}));
t.append(btn('小鬼一覧','Oni roster',()=>roster(game.onis)));
if(mode)t.append(btn('配置を取消','Cancel placement',()=>{mode=null;renderTools();say('まだ使える。')}));updateZoom()}
function updateZoom(){if($('#zoom-value'))$('#zoom-value').textContent=`${Math.round(renderer.camera.zoom*100)}%`}
function roster(onis,title='小鬼を選択',subtitle='Choose an Oni'){
const d=$('#detail');d.replaceChildren();selected=null;const h=document.createElement('h3');h.innerHTML=bi(title,subtitle);d.append(h);
const list=document.createElement('div');list.className='oni-list';
for(const o of onis){const f=game.facilities.find(f=>f.id===o.facility);const b=btn(`小鬼 #${o.id} · ${F[o.type].name} ★`,`Oni #${o.id} · ${FE[o.type]} specialist`,()=>{selected={kind:'oni',id:o.id};renderer.camera.focus(o.x+.5,o.y+.5);detail()},'oni-choice');b.insertAdjacentHTML('afterbegin',`<img src="assets/oni-${o.type}-v012.webp" alt="">`);b.dataset.oniId=o.id;b.style.borderLeft=`5px solid ${F[o.type].color}`;const info=document.createElement('span');info.className='roster-info';info.innerHTML=bi(`${traits[o.trait].name} ／ ${F[f.type].name} #${f.id}`,`${TE[o.trait][0]} / ${FE[f.type]} #${f.id}`);b.append(info);list.append(b)}
if(!onis.length)list.innerHTML=`<p>${bi('担当なし','No assigned Oni')}</p>`;d.append(list,btn('閉じる','Close',closeDetail))}
function ui(){const state=game.state;if(lastState===state)return;lastState=state;const ov=$('#overlay'),ctl=$('#controls');ov.replaceChildren();ctl.replaceChildren();closeDetail();mode=null;renderTools();
if(state==='title'){
ov.innerHTML=`<div class="panel"><div class="eyebrow">RECYCLE ONI / v0.1.2</div><img class="title-hero" src="assets/oni-wash-v012.webp" alt="青い小鬼 / Blue Oni"><h1>リサイクルの鬼</h1><p>${bi('「まだ使える。」','Still useful.')}${bi('小鬼と施設を配置して、8回の回収日を乗り切れ。','Arrange your Oni and facilities. Survive 8 collection days.')}</p><div class="steps"><span>${bi('01 救出','Rescue')}</span><span>${bi('02 運んで処理','Carry & recycle')}</span><span>${bi('03 現場を強化','Upgrade')}</span></div><p>${bi('縦でも横でも。ピンチで拡大、ドラッグで移動。','Portrait or landscape. Pinch to zoom, drag to pan.')}</p><div id="start-slot"></div><p>BEST ¥${saved.profit.toLocaleString()} · ${bi(`回避 ${Math.round(saved.avoid*100)}%`,'Diversion')} · FLOW ${saved.flow} · ${saved.rank}</p></div>`;
$('#start-slot').append(btn('現場に入る →','Enter the yard',()=>{sound.init();game.prepare();refresh()},'primary'));say('まだ使える。');return}
if(state==='upgrade'){
ov.innerHTML=`<div class="panel"><div class="eyebrow">WAVE ${game.wave} COMPLETE</div><h2>${bi('無料強化を1つ選ぶ','Choose one free upgrade')}</h2><p>${bi(`利益 +¥${game.summary.profit} ／ 焼却回避 ${Math.round(game.summary.avoid*100)}%`,'Profit / Waste diverted from burning')}</p><div class="cards"></div><p>${bi(`次：${W[game.wave].name} — ${W[game.wave].hint}`,`Next: ${WE[game.wave][0]} — ${WE[game.wave][1]}`)}</p></div>`;
for(const u of game.choices){const b=btn('','',()=>{game.choose(u.id);refresh()});b.innerHTML=`<strong>${bi(u.name,UE[u.id][0])}</strong><span>${bi(u.desc,UE[u.id][1])}</span>`;$('.cards').append(b)}return}
if(state==='result'){
if(!savedResult){savedResult=true;saved.profit=Math.max(saved.profit,game.profit);saved.avoid=Math.max(saved.avoid,game.rescued/Math.max(1,game.total));saved.flow=Math.max(saved.flow,game.maxFlow);saved.rank=['S','A','B','C'][Math.min(['S','A','B','C'].indexOf(saved.rank),['S','A','B','C'].indexOf(game.rank))];persist()}
ov.innerHTML=`<div class="panel"><span class="rank">${game.rank}</span><div class="eyebrow">${game.clear?'ALL 8 WAVES CLEAR':'RUN FINISHED'}</div><h2>${bi(game.clear?'……よし。':'小鬼たちは、ひと休み。',game.clear?'…Good.':'The Oni need a rest.')}</h2><div class="stats"><div>${bi('総利益','TOTAL PROFIT')}<b>¥${game.profit.toLocaleString()}</b></div><div>${bi('焼却回避率','Waste diverted')}<b>${Math.round(game.rescued/Math.max(1,game.total)*100)}%</b></div><div>${bi('最終 地球の熱','Final planet heat')}<b>${game.heat.toFixed(1)} / 100</b></div><div>${bi('最大 ONI FLOW','Best combo')}<b>×${game.maxFlow}</b></div><div>${bi('救出したゴミ','Items rescued')}<b>${game.rescued}</b></div></div><div id="replay"></div></div>`;
$('#replay').append(btn('もう一度遊ぶ','Play again',()=>{game.reset();savedResult=false;renderer.camera.fit();refresh()},'primary'));return}
if(state==='prep'){
const hint=document.createElement('span');hint.className='hint';hint.innerHTML=bi(`次：${W[game.wave].name} ｜ ${W[game.wave].hint}`,`Next: ${WE[game.wave][0]} · ${WE[game.wave][1]}`);ctl.append(hint);
const build=document.createElement('div');build.className='build-strip';
for(const [type,f]of Object.entries(F)){const b=btn(`${f.name} ¥${f.price}`,FE[type],()=>setMode({type}),'',game.money<f.price||game.facilities.length>=C.maxFacilities);b.style.setProperty('--facility-color',palette[type]);b.insertAdjacentHTML('afterbegin',`<span class="facility-icon" aria-hidden="true">${icons[type]}</span>`);build.append(b)}
build.append(btn(`小鬼 + ¥${C.oniPrice}`,'Hire Oni',()=>{game.recruit();refresh()},'',game.money<C.oniPrice||game.onis.length>=C.maxOni));
build.append(btn(`土地 ¥${C.landPrice}`,'Expand land',()=>{game.expand();refresh()},'',game.land===14||game.money<C.landPrice));ctl.append(build);
ctl.append(btn(`Wave ${game.wave+1} 開始 →`,'Start Wave',()=>{sound.init();game.startWave();refresh()},'primary start-wave'));say('小鬼一覧から、重なった小鬼も選べる。','Use the roster to select overlapping Oni.')}
if(state==='wave'){
ctl.append(btn('👹 まだ使える！','Rally! · 6 seconds',()=>{if(game.command())refresh()},'primary rally',game.shoutUsed));const h=document.createElement('span');h.className='hint';h.innerHTML=bi('号令は1Waveに1回。配置変更はWave間。','Rally once per Wave. Reassign between Waves.');ctl.append(h);say('まだ使える。')}
if(Object.keys(game.buffs).length){const chips=document.createElement('div');chips.className='chips';for(const [id,n]of Object.entries(game.buffs)){const s=document.createElement('span');s.innerHTML=bi(upgrades.find(u=>u.id===id).name+(n>1?` ×${n}`:''),UE[id][0]);chips.append(s)}ctl.append(chips)}}
function detail(){const d=$('#detail');d.replaceChildren();if(!selected)return;
if(selected.kind==='facility'){
const f=game.facilities.find(f=>f.id===selected.id),assigned=game.onis.filter(o=>o.facility===f.id);
d.innerHTML=`<span class="selection-icon" aria-hidden="true">${icons[f.type]}</span><h3>${bi(`${F[f.type].name} #${f.id} · Lv.${f.level}`,FE[f.type])}</h3><p>${bi(`入力 ${f.input.length}/${game.capacity(f)} ／ 処理中 ${f.jobs.length} ／ 待ち ${f.output.length}`,'Input / Processing / Output queue')}</p><p>${bi(game.synergy(f)>1?'隣接連携：処理 +10%':'近い施設ほど運搬が速い',game.synergy(f)>1?'Nearby synergy: processing +10%':'Shorter routes mean faster deliveries.')}</p>`;
d.append(btn(`担当小鬼 ${assigned.length}体`,'Select assigned Oni',()=>roster(assigned,`${F[f.type].name}の小鬼`,`${FE[f.type]} team`),'team-button'));
if(game.state==='prep'){d.append(btn('施設を移動','Move facility',()=>setMode({move:f.id})));d.append(btn(`Lv.UP ¥${C.levelPrice*f.level}`,'Upgrade facility',()=>{game.level(f.id);refresh()},'',game.money<C.levelPrice*f.level||f.level>=4))}
}else{
const o=game.onis.find(o=>o.id===selected.id),f=game.facilities.find(f=>f.id===o.facility);
d.innerHTML=`<img class="detail-portrait" src="assets/oni-${o.type}-v012.webp" alt=""><h3>${bi(`小鬼 #${o.id}`,`Oni #${o.id}`)}</h3><p>${bi(`得意：${F[o.type].name}（作業 +25%）`,`Specialty: ${FE[o.type]} · Work +25%`)}</p><p>${bi(`${traits[o.trait].name}：${traits[o.trait].desc}`,`${TE[o.trait][0]}: ${TE[o.trait][1]}`)}</p><p>${bi(`体力 ${Math.round(o.stamina)}/${o.max}`,`Stamina ${Math.round(o.stamina)}/${o.max}`)}</p><p>${bi(`担当：${F[f.type].name} #${f.id}`,`Assigned: ${FE[f.type]} #${f.id}`)}</p>`;
if(game.state==='prep'){const label=document.createElement('label');label.innerHTML=bi('担当変更','Reassign');const select=document.createElement('select');select.setAttribute('aria-label','小鬼の担当施設 / Assigned facility');
for(const f of game.facilities){const option=document.createElement('option');option.value=f.id;option.textContent=`${F[f.type].name} / ${FE[f.type]} #${f.id}${f.type===o.type?' ★':''}`;option.selected=f.id===o.facility;select.append(option)}select.onchange=()=>{game.assign(o.id,+select.value);detail()};label.append(select);d.append(label)}else{const p=document.createElement('p');p.innerHTML=bi('担当変更はWave終了後','Reassign after this Wave.');d.append(p)}
d.append(btn('他の小鬼を選ぶ','Back to roster',()=>roster(game.onis)))}
d.append(btn('閉じる','Close',closeDetail))}
function tap(e){if(!['prep','wave'].includes(game.state))return;const p=renderer.point(e);
if(mode&&game.state==='prep'){const ok=mode.move?game.move(mode.move,p.x,p.y):game.build(mode.type,p.x,p.y);if(ok){refresh();say('……よし。')}else say('資金・空き地・入口を確認。','Check funds, free space and entrances.');return}
const r=$('#game').getBoundingClientRect(),v=renderer.camera.view,x=e.clientX-r.left,y=e.clientY-r.top;
const hits=game.onis.filter(o=>Math.hypot(v.x+(o.x+.5)*v.scale-x,v.y+(o.y+.5)*v.scaleY-y)<=Math.max(22,v.scale*.42));
const f=game.facilities.find(f=>p.x>=f.x&&p.x<f.x+2&&p.y>=f.y&&p.y<f.y+2);
if(f){selected={kind:'facility',id:f.id};detail()}else if(hits.length>1){roster(hits,'ここにいる小鬼','Oni at this spot')}else if(hits.length){selected={kind:'oni',id:hits[0].id};detail()}else closeDetail()}
bindGestures($('#game'),renderer.camera,tap,updateZoom);
function muteLabel(){$('#mute').innerHTML=bi(sound.muted?'音 OFF':'音 ON',sound.muted?'Muted':'Sound on')}
$('#mute').onclick=()=>{sound.init();sound.muted=!sound.muted;saved.muted=sound.muted;persist();muteLabel()};muteLabel();
document.addEventListener('visibilitychange',()=>{last=performance.now()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){mode=null;closeDetail();renderTools()}});
// HUD nodes are allocated once; only changed values update during play.
$('#hud').innerHTML='<div>'+bi('波','WAVE')+'<b id="hud-wave"></b></div><div>'+bi('資金','Funds')+'<b id="hud-money"></b></div><div class="heat-cell">'+bi('地球の熱','Planet heat')+'<b id="hud-heat"></b><span class="heat-track" role="meter" aria-label="地球の熱 / Planet heat" aria-valuemin="0" aria-valuemax="100"><i class="heat-fill"></i></span></div><div class="flow-cell">'+bi('連続処理','ONI FLOW')+'<b id="hud-flow"></b></div><div class="weather" id="hud-status"></div>';
const hud={wave:$('#hud-wave'),money:$('#hud-money'),heat:$('#hud-heat'),flow:$('#hud-flow'),status:$('#hud-status'),meter:$('.heat-track')};
function changed(el,value){if(el.textContent!==value)el.textContent=value}
function updateHud(){changed(hud.wave,Math.max(1,game.wave)+'/8');changed(hud.money,'¥'+game.money.toLocaleString());changed(hud.heat,String(Math.floor(game.heat)));changed(hud.flow,'×'+Math.floor(game.flow));
const color=game.heat>=75?'#f07867':game.heat>=50?'#f7ac61':game.heat>=25?'#ead27a':'#84d5b2';hud.meter.style.setProperty('--heat',game.heat+'%');hud.meter.style.setProperty('--heat-color',color);hud.heat.style.color=color;hud.meter.setAttribute('aria-valuenow',String(Math.floor(game.heat)));hud.flow.parentElement.classList.toggle('active',game.flow>=2);
const status=game.state==='wave'?bi(weatherEffects[game.weather].name+' · '+Math.max(0,Math.ceil(C.duration-game.time))+'秒',weatherEnglish[game.weather]+' · seconds'):bi('準備で最適化','Plan your routes');if(hud.status.innerHTML!==status)hud.status.innerHTML=status;updateZoom()}
let lastDraw=0;
function frame(now){const dt=Math.min(.05,(now-last)/1000||0);last=now;if(!document.hidden){game.tick(dt);sound.tick(dt,game.state==='wave');while(game.events.length){const e=game.events.shift();sound.effect(e.kind);renderer.onEvent(e);if(['shout','flow','reuse','burn'].includes(e.kind))say(e.kind==='burn'?'……。':e.text)}ui();
// Active gameplay targets 60fps. Idle screens draw at 30fps; static layer is cached.
if(game.state==='wave'||now-lastDraw>=32){renderer.draw(game,selected,mode);lastDraw=now}hudTimer+=dt;if(hudTimer>.2){hudTimer=0;updateHud()}}
requestAnimationFrame(frame)}
ui();updateHud();requestAnimationFrame(frame);
