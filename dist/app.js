import {icons,palette} from './art.js';
import {Game} from './engine.js';
import {Renderer} from './render.js';
import {Sound} from './audio.js';
import {bindGestures} from './camera.js';
import {Tutorial} from './tutorial.js';
import {rankRules} from './results.js';
import {C,facilityTypes as F,traits,upgrades,waveDefinitions as W,weatherEffects} from './config.js';
import {bi,facilityEnglish as FE,traitEnglish as TE,upgradeEnglish as UE,waveEnglish as WE,weatherEnglish,speechEnglish} from './labels.js';
const $=s=>document.querySelector(s),game=new Game(),renderer=new Renderer($('#game'));
const KEY='recycle-oni-v01';let saved={profit:0,avoid:0,flow:0,rank:'C',muted:true};
const PORTAL_LABEL='他にもおもしろいゲームあるよ！ポータルサイトDearNextLightへ';
try{Object.assign(saved,JSON.parse(localStorage.getItem(KEY)||'{}'))}catch{}
if(saved.rankRules!==2)saved.rank='C';saved.rankRules=2;
const tutorial=new Tutorial();
const yardStatus=document.createElement('section');yardStatus.id='yard-status';yardStatus.hidden=true;yardStatus.setAttribute('aria-label','建設区画と土地拡張 / Building plots and land expansion');$('#field').before(yardStatus);
const sound=new Sound(saved.muted);let lastState='',selected=null,mode=null,last=0,hudTimer=0,savedResult=false;
function persist(){try{localStorage.setItem(KEY,JSON.stringify(saved))}catch{}}
function btn(ja,en,fn,cls='',disabled=false){const b=document.createElement('button');b.innerHTML=bi(ja,en);b.className=cls;b.disabled=disabled;b.onclick=fn;return b}
function say(ja,en=speechEnglish[ja]||''){$('#caption').hidden=!ja;$('#caption').innerHTML=bi(`鬼 「${ja}」`,en)}
function refresh(){lastState='';hudTimer=1;ui()}
function closeDetail(){selected=null;$('#detail').replaceChildren()}
function setMode(next){mode=next;closeDetail();say(next.move?'区画をタップ。使用中なら施設を入れ替え。':`「＋」の区画をタップ：${F[next.type].name} ¥${game.buildPrice(next.type)}`,next.move?'Tap a plot. Occupied plots swap facilities.':'Tap an outlined + plot to build. Drag to pan.');renderTools()}
function expandYard(type=null){if(!game.expand())return;refresh();if(type&&game.money>=game.buildPrice(type))setMode({type});else say('5つの建設区画を開放。','Five more building plots unlocked.')}
function renderYardStatus(){
 yardStatus.replaceChildren();yardStatus.hidden=game.state!=='prep';if(yardStatus.hidden)return;
 const used=game.facilities.length,total=game.facilityCapacity(),free=game.freePlots().length,locked=game.constructionPlots(true).some(p=>p.locked);
 yardStatus.className=free?'':'plots-full';
 const info=document.createElement('div');info.innerHTML=`<b>${bi(`建設区画 ${used}/${total}${free?'':' 使用中'}`,`Building plots ${used}/${total}${free?'':' · Full'}`)}</b><span class="plot-note">${bi(free?`残り${free}区画 · 「＋」に配置`:locked?'土地拡張で5区画を追加':'施設をタップ → 強化・入れ替え',free?'Build on the marked + foundations.':locked?'Expand to unlock five more plots.':'Tap a facility to upgrade or swap.')}</span>`;yardStatus.append(info);
 if(locked){const cost=C.landPrice,lack=Math.max(0,cost-game.money),b=btn(`土地拡張 ¥${cost}`,lack?`Need ¥${lack} more`:'+5区画 / +5 plots',()=>expandYard(),free?'':'primary',lack>0);b.dataset.guide='expand';yardStatus.append(b)}
}
function showBuildLimit(type=null){
 mode=null;closeDetail();renderTools();const d=$('#detail'),locked=game.constructionPlots(true).some(p=>p.locked),total=game.facilityCapacity();
 d.innerHTML=`<h3>${bi(`建設区画 ${total}/${total} 使用中`,`All ${total} building plots are occupied`)}</h3><p>${bi(locked?'土地を拡張すると、鍵の付いた5区画に建てられます。':'すべての建設区画を使用中。施設の強化・入れ替えで効率を上げましょう。',locked?'Expand the land to unlock the five marked foundations.':'All plots are occupied. Upgrade or swap facilities to improve your routes.')}</p>`;
 if(locked){const lack=Math.max(0,C.landPrice-game.money);d.append(btn(`土地拡張 ¥${C.landPrice}`,lack?`Need ¥${lack} more`:'Unlock 5 plots',()=>expandYard(type),'primary',lack>0));if(lack){const p=document.createElement('p');p.innerHTML=bi(`土地拡張にはあと¥${lack}必要です。`,`Expansion needs ¥${lack} more.`);d.append(p)}}
 d.append(btn('閉じる','Close',closeDetail));
}
function requestBuild(type){if(!game.freePlots().length){showBuildLimit(type);return}if(game.money>=game.buildPrice(type))setMode({type})}
function renderTools(){const t=$('#view-tools');t.replaceChildren();t.hidden=!['prep','wave'].includes(game.state);if(t.hidden)return;
t.append(btn('−','Zoom out',()=>{renderer.camera.zoomAt(1/1.25);updateZoom()},'zoom-button'));
const z=document.createElement('output');z.id='zoom-value';z.setAttribute('aria-live','polite');t.append(z);
t.append(btn('＋','Zoom in',()=>{renderer.camera.zoomAt(1.25);updateZoom()},'zoom-button'));
t.append(btn('全体','Fit',()=>{renderer.camera.fit();updateZoom()}));
t.append(btn('小鬼一覧','Oni roster',()=>roster(game.onis)));
t.append(tutorial.helpButton);
if(mode)t.append(btn('配置を取消','Cancel placement',()=>{mode=null;renderTools();say('まだ使える。')}));updateZoom()}
function updateZoom(){if($('#zoom-value'))$('#zoom-value').textContent=`${Math.round(renderer.camera.zoom*100)}%`}
function roster(onis,title='小鬼を選択',subtitle='Choose an Oni'){
const d=$('#detail');d.replaceChildren();selected=null;const h=document.createElement('h3');h.innerHTML=bi(title,subtitle);d.append(h);
const list=document.createElement('div');list.className='oni-list';
for(const o of onis){const f=game.facilities.find(f=>f.id===o.facility);const b=btn(`小鬼 #${o.id} · ${F[o.type].name} ★`,`Oni #${o.id} · ${FE[o.type]} specialist`,()=>{selected={kind:'oni',id:o.id};renderer.camera.focus(o.x+.5,o.y+.5);detail()},'oni-choice');b.insertAdjacentHTML('afterbegin',`<img src="assets/oni-${o.type}-v014.webp" alt="">`);b.dataset.oniId=o.id;b.style.borderLeft=`5px solid ${F[o.type].color}`;const info=document.createElement('span');info.className='roster-info';info.innerHTML=bi(`${traits[o.trait].name} ／ ${F[f.type].name} #${f.id}`,`${TE[o.trait][0]} / ${FE[f.type]} #${f.id}`);b.append(info);list.append(b)}
if(!onis.length)list.innerHTML=`<p>${bi('担当なし','No assigned Oni')}</p>`;d.append(list,btn('閉じる','Close',closeDetail))}
function ui(){const state=game.state;if(lastState===state)return;lastState=state;const ov=$('#overlay'),ctl=$('#controls');ov.replaceChildren();ctl.replaceChildren();closeDetail();mode=null;renderTools();renderYardStatus();
if(state==='title'){
ov.innerHTML=`<div class="panel opening-panel"><button class="opening-art" id="opening-art" aria-label="ブラウザで今すぐプレイ / Play Now in Your Browser"><img src="assets/opening-v014.webp" alt="リサイクルの鬼 / RECYCLE ONI — まだ使える。小鬼と親方のリサイクル拠点"></button><div class="opening-footer"><div><b>RECYCLE ONI / v0.1.8</b><p>小鬼と施設を配置して8回の回収日へ。<br>Arrange your yard. Survive 8 collection days.</p></div><a class="portal-button" href="https://dear-next-light.pages.dev/" target="_blank" rel="noopener noreferrer">${bi(PORTAL_LABEL,'More games! Visit DearNextLight')}</a></div></div>`;
$('#opening-art').onclick=()=>{sound.init();game.prepare();refresh()};
ov.querySelector('.opening-footer').insertAdjacentHTML('beforeend',`<small>BEST ¥${saved.profit.toLocaleString()}<br>回避 / Diversion ${Math.round(saved.avoid*100)}% · FLOW ${saved.flow} · ${saved.rank}</small>`);
say('まだ使える。');return}
if(state==='upgrade'){
ov.innerHTML=`<div class="panel"><div class="eyebrow">WAVE ${game.wave} COMPLETE</div><h2>${bi('無料強化を1つ選ぶ','Choose one free upgrade')}</h2><p>${bi(`利益 +¥${game.summary.profit} ／ 焼却回避 ${Math.round(game.summary.avoid*100)}%`,'Profit / Waste diverted from burning')}</p><div class="cards"></div><p>${bi(`次：${W[game.wave].name} — ${W[game.wave].hint}`,`Next: ${WE[game.wave][0]} — ${WE[game.wave][1]}`)}</p></div>`;
for(const u of game.choices){const b=btn('','',()=>{game.choose(u.id);refresh()});b.innerHTML=`<strong>${bi(u.name,UE[u.id][0])}</strong><span>${bi(u.desc,UE[u.id][1])}</span>`;$('.cards').append(b)}return}
if(state==='result'){
if(!savedResult){savedResult=true;saved.profit=Math.max(saved.profit,game.profit);saved.avoid=Math.max(saved.avoid,game.rescued/Math.max(1,game.total));saved.flow=Math.max(saved.flow,game.maxFlow);saved.rank=['S','A','B','C'][Math.min(['S','A','B','C'].indexOf(saved.rank),['S','A','B','C'].indexOf(game.rank))];persist()}
const praise=game.clear?({S:['資源を、未来へ。','Resources saved for tomorrow.'],A:['……よし。次は、もっと。','Good. Aim even higher.'],B:['まだ、救える。','More can be saved.'],C:['回収計画を、もう一度。','Rethink the collection plan.']}[game.rank]):['小鬼たちは、ひと休み。','The Oni need a rest.'];
ov.innerHTML=`<div class="panel result-panel"><span class="rank">${game.rank}</span><div class="eyebrow">${game.clear?'ALL 8 WAVES CLEAR':'RUN FINISHED'}</div><h2>${bi(...praise)}</h2><div class="stats"><div>${bi('総利益','TOTAL PROFIT')}<b>¥${game.profit.toLocaleString()}</b></div><div>${bi('焼却回避率','Waste diverted')}<b>${Math.floor(game.judgement.avoid*100)}%</b></div><div>${bi('処理完了率','Fully recycled')}<b>${Math.floor(game.judgement.completion*100)}%</b></div><div>${bi('最終 地球の熱','Final planet heat')}<b>${game.heat.toFixed(1)} / 100</b></div><div>${bi('最大 ONI FLOW','Best combo')}<b>×${game.maxFlow}</b></div><div>${bi('救出したゴミ','Items rescued')}<b>${game.rescued}</b></div></div>${resultCriteria()}<div id="replay" class="result-actions"></div><p id="share-status" role="status" aria-live="polite"></p><div id="share-fallback"></div><div id="creator-link"></div></div>`;
$('#replay').append(btn('もう一度遊ぶ','Play again',()=>{game.reset();savedResult=false;renderer.camera.fit();refresh()},'primary'));setupResultSharing();return}
if(state==='prep'){
const hint=document.createElement('span');hint.className='hint';hint.innerHTML=bi(`次：${W[game.wave].name} ｜ ${W[game.wave].hint}`,`Next: ${WE[game.wave][0]} · ${WE[game.wave][1]}`);ctl.append(hint);
const build=document.createElement('div');build.className='build-strip';
for(const [type,f]of Object.entries(F)){const full=!game.freePlots().length,cost=game.buildPrice(type),b=btn(`${f.name} ¥${cost}`,`${FE[type]}${full?' · Full':''}`,()=>requestBuild(type),full?'needs-plot':'',!full&&game.money<cost);b.dataset.guide='build-'+type;b.style.setProperty('--facility-color',palette[type]);b.insertAdjacentHTML('afterbegin',`<span class="facility-icon" aria-hidden="true">${icons[type]}</span>`);build.append(b)}
const oniCap=game.oniCapacity(),teamFull=game.onis.length>=oniCap,cost=game.hirePrice();build.append(btn(`小鬼 + ¥${cost}（${game.onis.length}/${oniCap}）`,`Hire Oni · ${game.onis.length}/${oniCap}`,()=>{if(game.recruit())refresh();else say('施設の小鬼枠が満員。','Oni slots are full. Build another facility.')},'',game.money<cost||game.onis.length>=C.maxOni||teamFull));
build.lastElementChild.dataset.guide='hire';
ctl.append(build);
ctl.append(btn(`Wave ${game.wave+1} 開始 →`,'Start Wave',()=>{sound.init();game.startWave();refresh()},'primary start-wave'));ctl.lastElementChild.dataset.guide='start';say('')}
if(state==='wave'){
ctl.append(btn('👹 まだ使える！','Rally! · 6 seconds',()=>{if(game.command())refresh()},'primary rally',game.shoutUsed));ctl.lastElementChild.dataset.guide='rally';const h=document.createElement('span');h.className='hint';h.innerHTML=bi('号令は1Waveに1回。配置変更はWave間。','Rally once per Wave. Reassign between Waves.');ctl.append(h);say('まだ使える。')}
if(Object.keys(game.buffs).length){const chips=document.createElement('div');chips.className='chips';for(const [id,n]of Object.entries(game.buffs)){const s=document.createElement('span');s.innerHTML=bi(upgrades.find(u=>u.id===id).name+(n>1?` ×${n}`:''),UE[id][0]);chips.append(s)}ctl.append(chips)}}
function detail(){const d=$('#detail');d.replaceChildren();if(!selected)return;
if(selected.kind==='facility'){
const f=game.facilities.find(f=>f.id===selected.id),assigned=game.onis.filter(o=>o.facility===f.id);
d.innerHTML=`<span class="selection-icon" aria-hidden="true">${icons[f.type]}</span><h3>${bi(`${F[f.type].name} #${f.id} · Lv.${f.level}`,FE[f.type])}</h3><p>${bi(`入力 ${f.input.length}/${game.capacity(f)} ／ 処理中 ${f.jobs.length} ／ 待ち ${f.output.length}`,'Input / Processing / Output queue')}</p><p>${bi(game.synergy(f)>1?'隣接連携：処理 +10%':'近い施設ほど運搬が速い',game.synergy(f)>1?'Nearby synergy: processing +10%':'Shorter routes mean faster deliveries.')}</p>`;
d.append(btn(`担当小鬼 ${assigned.length}/${C.oniPerFacility}体`,`Assigned Oni ${assigned.length}/${C.oniPerFacility}`,()=>roster(assigned,`${F[f.type].name}の小鬼`,`${FE[f.type]} team`),'team-button'));
if(game.state==='prep'){d.append(btn('移動・入れ替え','Move / swap',()=>setMode({move:f.id})));if(f.level<4)d.append(btn(`Lv.UP ¥${game.levelPrice(f.id)}`,'Upgrade facility',()=>{game.level(f.id);refresh()},'',game.money<game.levelPrice(f.id)));else{const p=document.createElement('p');p.innerHTML=bi('設備強化は最大です。','Facility fully upgraded.');d.append(p)}}
}else{
const o=game.onis.find(o=>o.id===selected.id),f=game.facilities.find(f=>f.id===o.facility);
d.innerHTML=`<img class="detail-portrait" src="assets/oni-${o.type}-v014.webp" alt=""><h3>${bi(`小鬼 #${o.id}`,`Oni #${o.id}`)}</h3><p>${bi(`得意：${F[o.type].name}（作業 +25%）`,`Specialty: ${FE[o.type]} · Work +25%`)}</p><p>${bi(`${traits[o.trait].name}：${traits[o.trait].desc}`,`${TE[o.trait][0]}: ${TE[o.trait][1]}`)}</p><p>${bi(`体力 ${Math.round(o.stamina)}/${o.max}`,`Stamina ${Math.round(o.stamina)}/${o.max}`)}</p><p>${bi(`担当：${F[f.type].name} #${f.id}`,`Assigned: ${FE[f.type]} #${f.id}`)}</p>`;
if(game.state==='prep'){const label=document.createElement('label');label.innerHTML=bi('担当変更','Reassign');const select=document.createElement('select');select.setAttribute('aria-label','小鬼の担当施設 / Assigned facility');
for(const f of game.facilities){const option=document.createElement('option'),count=game.assignedCount(f.id,o.id),full=count>=C.oniPerFacility&&f.id!==o.facility;option.value=f.id;option.textContent=`${F[f.type].name} / ${FE[f.type]} #${f.id}（${count+(f.id===o.facility?1:0)}/${C.oniPerFacility}）${f.type===o.type?' ★':''}${full?' 満員 / Full':''}`;option.selected=f.id===o.facility;option.disabled=full;select.append(option)}select.onchange=()=>{game.assign(o.id,+select.value);detail()};label.append(select);d.append(label)}else{const p=document.createElement('p');p.innerHTML=bi('担当変更はWave終了後','Reassign after this Wave.');d.append(p)}
d.append(btn('他の小鬼を選ぶ','Back to roster',()=>roster(game.onis)))}
d.append(btn('閉じる','Close',closeDetail))}
function tap(e){if(!['prep','wave'].includes(game.state))return;const p=renderer.point(e);
if(mode&&game.state==='prep'){const plot=game.placementAt(p,true);if(plot?.locked){showBuildLimit(mode.type);return}const ok=plot&&(mode.move?game.move(mode.move,plot.x,plot.y):game.build(mode.type,plot.x,plot.y));if(ok){refresh();say('……よし。')}else say('「＋」の建設区画を選んでください。','Choose an outlined + building plot.');return}
const r=$('#game').getBoundingClientRect(),v=renderer.camera.view,x=e.clientX-r.left,y=e.clientY-r.top;
const hits=game.onis.filter(o=>Math.hypot(v.x+(o.x+.5)*v.scale-x,v.y+(o.y+.5)*v.scaleY-y)<=Math.max(22,v.scale*.42));
const f=game.facilities.find(f=>p.x>=f.x&&p.x<f.x+2&&p.y>=f.y&&p.y<f.y+2);
if(f){selected={kind:'facility',id:f.id};detail()}else if(hits.length>1){roster(hits,'ここにいる小鬼','Oni at this spot')}else if(hits.length){selected={kind:'oni',id:hits[0].id};detail()}else if(game.state==='prep'&&game.placementAt(p,true)?.locked)showBuildLimit();else closeDetail()}
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
const status=game.state==='wave'?bi(weatherEffects[game.weather].name+' · '+Math.max(0,Math.ceil(C.duration-game.time))+'秒',weatherEnglish[game.weather]+' · seconds'):bi('準備で最適化','Plan your routes');if(hud.status.innerHTML!==status)hud.status.innerHTML=status;updateZoom();tutorial.update(game,renderer,mode)}
let lastDraw=0;
function frame(now){const dt=Math.min(.05,(now-last)/1000||0);last=now;if(!document.hidden){game.tick(dt);sound.tick(dt,game.state==='wave');while(game.events.length){const e=game.events.shift();sound.effect(e.kind);renderer.onEvent(e);if(['shout','flow','reuse','burn'].includes(e.kind))say(e.kind==='burn'?'……。':e.text)}ui();
// Active gameplay targets 60fps. Idle screens draw at 30fps; static layer is cached.
if(game.state==='wave'||now-lastDraw>=32){renderer.draw(game,selected,mode);lastDraw=now}hudTimer+=dt;if(hudTimer>.2){hudTimer=0;updateHud()}}
requestAnimationFrame(frame)}
ui();updateHud();requestAnimationFrame(frame);

function setupResultSharing(){
 const creator=document.createElement('a');creator.href='https://dear-next-light.pages.dev/';creator.target='_blank';creator.rel='noopener noreferrer';creator.className='creator-link';creator.innerHTML=bi(PORTAL_LABEL,'More games! Visit DearNextLight');$('#creator-link').append(creator);
 const text=`リサイクルの鬼 / RECYCLE ONI\n${game.clear?'8Waveクリア！ / All 8 waves clear!':'Wave '+game.wave+' / Run finished'} · Rank ${game.rank}\n利益 / Profit ¥${game.profit.toLocaleString()} · 焼却回避 / Waste diverted ${Math.floor(game.judgement.avoid*100)}% · 処理完了 / Fully recycled ${Math.floor(game.judgement.completion*100)}% · ONI FLOW ×${game.maxFlow}`;
 const url='https://recycle-oni.pages.dev/';
 const share=btn('結果をシェア','Share results',async()=>{
  const status=$('#share-status');share.disabled=true;
  try{
   if(navigator.share){try{await navigator.share({title:'リサイクルの鬼 / RECYCLE ONI',text,url});status.textContent='共有しました / Shared';return}catch(error){if(error.name==='AbortError'){status.textContent='';return}}}
   try{await navigator.clipboard.writeText(text+'\n'+url);status.textContent='結果とURLをコピーしました / Results and link copied'}catch{
    const area=document.createElement('textarea');area.readOnly=true;area.value=text+'\n'+url;area.setAttribute('aria-label','共有用テキスト / Text to share');$('#share-fallback').replaceChildren(area);area.focus();area.select();status.textContent='このテキストをコピーして共有できます / Copy this text to share';
   }
  }finally{share.disabled=false}
 });$('#replay').append(share);
}

function resultCriteria(){
 const {target,met}=game.judgement;
 const items=[['avoid','♻',`回避 ≥${target.avoid*100}%`,`Divert ≥${target.avoid*100}%`],['processed','✓',`完了 ≥${target.processed*100}%`,`Recycle ≥${target.processed*100}%`],['heat','♨',`熱 ≤${target.heat}`,`Heat ≤${target.heat}`],['profit','¥',`利益 ≥¥${target.profit.toLocaleString()}`,`Profit ≥¥${target.profit.toLocaleString()}`]];
 return`<section class="rank-target"><b>${bi(game.clear?`${target.rank}判定への目標`:'まずは8Wave完走',game.clear?`Targets for rank ${target.rank}`:'First, survive all 8 Waves')}</b><div class="rank-checks">${items.map(([key,icon,ja,en])=>`<span class="${met[key]?'met':'unmet'}">${met[key]?'✓':'○'} ${icon} ${bi(ja,en)}</span>`).join('')}</div></section><details class="rank-rules"><summary>${bi('判定基準：4条件すべてを達成','Rank rules: meet all four targets')}</summary><table><thead><tr><th>Rank</th><th>♻<br>${bi('回避','Divert')}</th><th>✓<br>${bi('完了','Recycle')}</th><th>♨<br>${bi('熱','Heat')}</th><th>¥<br>${bi('利益','Profit')}</th></tr></thead><tbody>${rankRules.map(r=>`<tr><th>${r.rank}</th><td>≥${r.avoid*100}%</td><td>≥${r.processed*100}%</td><td>≤${r.heat}</td><td>≥${r.profit.toLocaleString()}</td></tr>`).join('')}</tbody></table><p>${bi('8Wave完走が必須。未処理の救出品は処理完了に含みません。','All 8 Waves required. Unfinished rescued items do not count as recycled.')}</p></details>`;
}
