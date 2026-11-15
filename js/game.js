'use strict';
const ORDER=['F1','F2','F3','E1','E2','D1','C1','C2','B1','B2','B3','A1','A2','S1'];
LEVELS.sort((a,b)=>ORDER.indexOf(a.id)-ORDER.indexOf(b.id));
configureLevels();configureJournal();
const LV_TH=[0,300,700,1200,1800,2500,3300];
const ITEMS={
 mag:{n:'調查放大鏡',d:'消耗一個，協助判斷一次對話選項。'},badge:{n:'廉潔徽章',d:'獲得的誠信值增加 10%，永久有效。'},gavel:{n:'反思之槌',d:'每次持有可阻止一次誘惑失敗，使用後消失。'},
 boots:{n:'輕便調查鞋',d:'步行速度增加 25%，永久有效。'},notebook:{n:'調查筆記簿',d:'可在主線欄展開全部證據及來源，永久有效。'},compass:{n:'方向羅盤',d:'顯示下一個主線目標的方向，不揭示彩蛋。'},seal:{n:'程序護盾',d:'自動抵消一次錯誤回答的誠信值扣減。'},tea:{n:'提神茶',d:'背包中飲用，恢復 80 誠信值；不增加經驗。'},flashlight:{n:'標準手電筒',d:'移動滑鼠即可瞄準，不用按鍵；L 開關。漸變光束距離約 5 格。'}
};
const SHOP=[{id:'mag',p:100,rep:1},{id:'gavel',p:250,rep:1},{id:'badge',p:300},{id:'boots',p:180},{id:'notebook',p:120},{id:'compass',p:160},{id:'seal',p:90,rep:1},{id:'tea',p:50,rep:1}];
const SPOTN={cabinet:'文件櫃',desk:'辦公桌',pcdesk:'電腦',shelf:'書櫃',locker:'儲物櫃',crate:'貨運箱',luggage:'行李',plant:'盆栽',bin:'垃圾桶',safe:'保險箱',shredder:'碎紙機',files:'文件堆',ftower:'案卷塔',archcab:'檔案櫃',sofa:'梳化',board:'告示板',mapboard:'紀錄牆',pedestal:'展示台',model:'沙盤',phone:'電話',stairs:'樓梯',keycard:'通行物品'};
const $=id=>document.getElementById(id),cv=$('cv'),dlg=$('dlg'),ui=$('ui');
const MAP_FOG_OUTLINE=getComputedStyle(document.documentElement).getPropertyValue('--line').trim();
const ROUTE_COLOR=getComputedStyle(document.documentElement).getPropertyValue('--route-color').trim();
const REDUCED_MOTION=matchMedia('(prefers-reduced-motion: reduce)');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clean=s=>String(s??'').replace(/[\p{Extended_Pictographic}\uFE0F]/gu,'').trim();
const blank=()=>({int:0,xp:0,cleared:[],items:{mag:1,badge:0,gavel:0,boots:0,notebook:0,compass:0,seal:0,tea:0,flashlight:0},flashlightCollected:false,avatar:'male',achv:[],choices:[],endings:[],leaks:0,passes:[],opened:[],secrets:[],files:[],eggs:[],explored:{},tutorial:false});
function loadState(old){const state={...blank(),...old,items:{...blank().items,...old?.items}};state.items.flashlight=state.flashlightCollected?1:0;state.avatar=state.avatar==='female'?'female':'male';if(old&&old.xp===undefined)state.xp=Math.max(old.int||0,(old.cleared||[]).reduce((n,id)=>n+(byId(id)?.reward||0),0));return state;}
function guestState(){try{return loadState(JSON.parse(localStorage.getItem('integrity-rpg2-guest')||localStorage.getItem('integrity-rpg2')||'null'));}catch(e){return blank();}}
let S=guestState(),saveMode='guest',saveAccountId=null;
const save=()=>{if(saveMode==='account'){if(ACCOUNT.user?.id===saveAccountId)return ACCOUNT.saveProgress(S);return;}try{localStorage.setItem('integrity-rpg2-guest',JSON.stringify(S));}catch(e){}};
function byId(id){return LEVELS.find(l=>l.id===id);}
const nextId=id=>id==='LOBBY'?'F1':ORDER[ORDER.indexOf(id)+1];
const lvOf=()=>{for(let i=LV_TH.length-1;i>=0;i--)if(S.xp>=LV_TH[i])return i+1;return 1;};
const lvProg=()=>{const l=lvOf();return l===7?'MAX':Math.floor((S.xp-LV_TH[l-1])/(LV_TH[l]-LV_TH[l-1])*100)+'%';};
function gain(n){const amount=Math.round(n*(S.items.badge?1.1:1));S.int+=amount;S.xp+=n;}
function addAchv(id){if(!S.achv.includes(id)){S.achv.push(id);toast('成就解鎖：'+clean(JOURNAL.achievements.find(a=>a.id===id)?.title||id));save();}}
const LOBBY_L={id:'LOBBY',name:'廉潔大廳',rooms:{L:{n:'廉潔大廳',k:'',fl:'marble:#343f3a',wc:'#2a4039',p:[['bench',5,10],['bench',10,10],['bench',29,10],['bench',34,10]]},O:{n:'你的調查辦公室',k:'personalOffice',fl:'wood:#674b32',wc:'#546253',p:[['window',10,-1]]}}, 
 npcs:[{r:'L',x:2,y:9,n:'陳伯',lk:{sk:'#e8c098',hr:'#d8d8d8',hs:'bald',cl:'#8a5a3a',ty:'apron',c2:'#e8e0d0',gl:1},shop:1},
 {r:'L',x:40,y:9,n:'檔案館館長',lk:SEC_CLERK,d:['歡迎嚟到廉潔世界。呢度係廉潔大廳，上面十四道門通往十四宗改編案件。','先去 F1〈綠色通道的紅酒〉，關叔會教你逐步調查。右邊係你嘅辦公室，可查閱回答、結局同成就圖鑑。','每關按主線搜證。買嘢或扣誠信值都唔會降低已獲得嘅等級。']},
 {r:'L',x:24,y:8,n:'新任調查員',lk:SEC_ICAC,d:['我都係新入職。資料唔齊，先問證人，再依法調閱文件。','未探索嘅房間，右上角地圖會保持黑色。']}],
 spots:[{r:'L',t:'plant',x:0,y:5,egg:1,nm:'盆栽'},{r:'L',t:'counter',x:1,y:10.6,nm:'陳伯小賣部',shop:1},{r:'O',t:'archcab',x:0,y:1.5,nm:'結局與成就圖鑑',codex:1},{r:'O',t:'board',x:6,y:-1,nm:'調查進度板',progress:1},{r:'O',t:'flashlight',x:14,y:1.5,nm:'領取手電筒',flashlight:1}]};
configureCharacters(LEVELS,LOBBY_L);
const P={x:0,y:0,dir:0,mv:false},keys={},mouse={x:innerWidth/2,y:innerHeight/2};
let M=null,L=null,mode='title',run={},npcs=[],tick=0,DIA=null,curRoom=null,goal=null,hover=null,lightOn=false,objectiveY=null,objectiveDrag=null,objectiveDragged=false;
const evCnt=()=>L?.evs?L.evs.filter(e=>run.bag[e]).length:0;
const allEv=()=>!!L?.evs&&L.evs.every(e=>run.bag[e]);
const tplOf=()=>L.id==='LOBBY'?LOBBY:L.floors[run.floor];
const floorOf=r=>L.id==='LOBBY'?0:L.floors.findIndex(t=>t.rooms[r]);
const floorLabel=(f=run.floor)=>L.id==='LOBBY'?'1 樓':L.floors[f]?.label||'樓層';
const visible=o=>!!M.rooms[o.room]&&!(['X','XB'].includes(o.room)&&!M.def.secretOpen);
function nextStair(destination){const queue=[{floor:run.floor,first:null}],seen=new Set([run.floor]);for(const node of queue){if(node.floor===destination)return node.first;for(const stair of L.stairs||[]){if(stair.floor!==node.floor||seen.has(stair.to)||L.floors[stair.to].hidden&&!S.opened.includes(L.id))continue;seen.add(stair.to);queue.push({floor:stair.to,first:node.first||stair});}}return null;}
function npcFoot(rect,n){const [x,y]=rect;return[(x+1+n.x+.5)*T,(y+2+n.y+.8)*T];}
function roomRect(tpl,key){const [x,y]=tpl.rooms[key];return{k:key,ox:x+1,oy:y+2};}
function doorId(link){return link.floor+':'+link.a+':'+link.b;}
function build(Lv){
 const tpl=tplOf(),open=S.opened.includes(Lv.id),def={rooms:Lv.rooms,secretOpen:open,extra:[],reserve:[],openDoors:[]};
 for(const link of Lv.links||[])if(link.floor===run.floor&&(link.secret?open:!link.need||run.doors[doorId(link)]))def.openDoors.push(...link.cells);
 const spots=[...(Lv.spots||[])];
 if(Lv.secret){spots.push({r:'X',t:'mapboard',x:3.5,y:-1,file:1,nm:'案件全紀錄牆'},{r:'X',t:'pedestal',x:5,y:2.2,pass:1,nm:'秘密通行證展示台'});const entry=Lv.secretEntrance;spots.push({t:'shelf',nm:'秘密入口',o:{seed:42},...entry,secret:1});}
 if(Lv.id!=='LOBBY'){
  (Lv.stairs||[]).filter(s=>s.floor===run.floor).forEach(s=>spots.push({...s,t:'stairs',o:{w:32,h:32},stair:1,nm:'樓梯 → '+floorLabel(s.to)}));
  if(run.floor===0)spots.push({r:tpl.spawnRoom||'H',t:'exitdoor',x:8,y:-1,exit:1,nm:'返回廉潔大廳'});
 }
 spots.forEach((s,i)=>{if(!tpl.rooms[s.r]||s.flashlight&&S.flashlightCollected)return;const p=place(roomRect(tpl,s.r),s.t,s.x,s.y,s.o);if(p){p.spot=s;p.si=i;def.extra.push(p);if(s.stair)def.reserve.push([p.x+16,p.y+16]);}});
 const all=[...(Lv.npcs||[]),...(Lv.secret?.npcs||[])];
 all.filter(n=>tpl.rooms[n.r]).forEach(n=>def.reserve.push(npcFoot(tpl.rooms[n.r],n)));
 for(const link of Lv.links||[])if(link.floor===run.floor)for(const [x,y] of link.cells)for(let dx=-2;dx<=2;dx++)for(let dy=-2;dy<=2;dy++)def.reserve.push([(x+dx+.5)*T,(y+dy+.5)*T]);
 def.reserve.push([tpl.spawn[0]*T,tpl.spawn[1]*T]);
 if(M?.tpl===tpl)def.reserve.push([P.x,P.y]);
 labelFades.clear();hover=null;
 const map=buildMap(tpl,def),mentor=npcs.find(n=>n.mentor);
 map.autoDoors=(tpl.autoDoors||[]).map(d=>({...d,x:d.x*T,y:d.y*T,w:d.w*T,progress:0,holdUntil:0,updatedAt:performance.now()}));
 npcs=all.filter(n=>tpl.rooms[n.r]).map(n=>{const [x,y]=npcFoot(tpl.rooms[n.r],n);return{d:n,x,y,dir:n.dir||0,room:n.r,mentor:Lv.id==='F1'&&n===Lv.npcs[0]};});
 if(Lv.id==='F1'&&run.bag['旅客記錄']){
  if(!npcs.some(n=>n.mentor))npcs.push({d:Lv.npcs[0],x:tpl.spawn[0]*T-20,y:tpl.spawn[1]*T,dir:0,room:tpl.spawnRoom,mentor:true});
  if(mentor&&map.rooms[mentor.room]&&!map.rooms[mentor.room].d.dark){const n=npcs.find(n=>n.mentor);n.x=mentor.x;n.y=mentor.y;n.room=mentor.room;}
 }
 return map;
}
function discovered(){return S.explored[L.id]||(S.explored[L.id]=[]);}
function discover(room){if(!room)return;const id=run.floor+':'+room;if(!discovered().includes(id)){discovered().push(id);save();}if(!run.floorVisits.includes(run.floor))run.floorVisits.push(run.floor);if(M.rooms[room]?.d.dark)addAchv('首次探索暗室');if(L.id!=='LOBBY'&&L.floors.every((f,i)=>f.hidden||run.floorVisits.includes(i)))addAchv('全樓層調查');}
function toast(text){const t=$('toast');t.textContent=clean(text);t.style.display='block';clearTimeout(t._h);t._h=setTimeout(()=>t.style.display='none',2800);}
function banner(text){const b=$('banner');b.textContent=clean(text);b.classList.add('on');clearTimeout(b._h);b._h=setTimeout(()=>b.classList.remove('on'),1900);}
function hud(){
 $('h-int').textContent=S.int;$('h-lv').textContent=lvOf()+' ('+lvProg()+')';$('h-items').textContent='經驗 '+S.xp+(S.items.flashlight?' · 手電筒 '+(lightOn?'開':'關'):'');
 $('h-clear').textContent='調查完成 '+S.cleared.length+'/14';$('b-light').classList.toggle('hide',!S.items.flashlight);$('b-light').textContent='手電筒 '+(lightOn?'開':'關')+' (L)';objUI();
}
function itemQuest(item,seen=new Set()){
 if(seen.has(item))return null;seen.add(item);
 if(L.puzzle&&item===L.puzzle.access&&run.puzzleStep<L.puzzle.steps.length){const index=run.puzzleStep,step=L.puzzle.steps[index],clue=!run.puzzleClues[index],spot=L.spots.find(s=>clue?s.puzzleClue===index:s.puzzleStep===index);return{kind:'spot',r:step.room,spot,item,title:clue?'搜查「'+spot.nm+'」，取得驗證線索。':'解開「'+spot.nm+'」的機關，完成第 '+(index+1)+' / '+L.puzzle.steps.length+' 項驗證。'};}
 const spot=L.spots.find(s=>s.got===item);
 if(spot){const lock=(L.links||[]).find(a=>a.need&&a.b===spot.r);if(lock&&!run.doors[doorId(lock)]){if(!run.bag[lock.need])return itemQuest(lock.need,seen);return{kind:'door',link:lock,r:lock.a==='D'?lock.b:lock.a,item:lock.need,title:'使用「'+lock.need+'」解鎖 '+L.rooms.D.n};}if(spot.need&&!run.bag[spot.need])return itemQuest(spot.need,seen);return{kind:'spot',r:spot.r,spot,item,title:'搜查「'+(spot.nm||SPOTN[spot.t]||spot.t)+'」，取得 '+item};}
 for(const n of L.npcs)for(const field of ['d','d0','dn'])for(const node of n[field]||[])if(typeof node==='object'&&node.o?.some(o=>o.ev===item||o.give===item))return{kind:'npc',r:n.r,npc:n,item,title:'與「'+n.n+'」交談，取得 '+item};
 return null;
}
function currentQuest(){
 if(!S.items.flashlight)return L.id==='LOBBY'?{kind:'spot',spot:LOBBY_L.spots.find(s=>s.flashlight),r:'O',item:'手電筒',title:'先到你的調查辦公室，按 E 領取手電筒。',lobby:true}:{kind:'exit',r:L.floors[0].spawnRoom,item:'手電筒',title:'先返回廉潔大廳，到辦公室按 E 領取手電筒。'};
 if(L.id==='LOBBY'){const id=ORDER.find(id=>!S.cleared.includes(id));return{title:id?'前往 '+byId(id).tier+' 級〈'+byId(id).name+'〉調查':'十四宗調查完成；可重玩解鎖不同分支。',r:'L',lobby:true};}
 if(allEv()){const n=L.npcs.find(n=>n.cul);return{kind:'npc',npc:n,r:n.r,item:'結案',title:'證據齊全；與「'+n.n+'」對質，完成調查。'};}
 const order=L.id==='F1'?['旅客記錄','X光影像','夾層紅酒','茶錢信封']:L.evs;
 return itemQuest(order.find(e=>!run.bag[e]))||{title:'在已開放房間調查，補齊案件證據。',r:curRoom};
}
const COACH={
 '手電筒':'關叔：暗室要靠手電筒。先返大廳右邊嘅辦公室，行近裝備架按 E 領取，再用 L 或開關掣控制照明。',
 '旅客記錄':'第一步：用 WASD 或方向鍵行到關叔身邊，按 E。對話先聽清楚，再揀能記錄事實嘅回答。',
 'X光影像':'關叔：先去 X光檢查區問 May。保存影像，唔好只相信肉眼。對話取得嘅證據會放入背包。',
 '調查區鎖匙':'關叔：證物室係鎖住嘅。先按主線指引領取普通鎖匙，再返去門邊按 E 開門。',
 '調查區通行卡':'關叔：先領取調查區通行卡。去標示嘅房門旁邊按 E，讀卡器會核對你嘅權限。',
 '夾層紅酒':'關叔：進入無人嘅暗室，L 開手電筒，鼠標控制方向。光線漸變，範圍約 5 格；行近行李，再按 E 親手搜查。',
 '儲物櫃後備鎖匙':'關叔：再問清潔阿姨。承諾保護證人身份，先攞到儲物櫃鎖匙。',
 '茶錢信封':'關叔：返去休息室搜查角落儲物櫃。鎖匙喺背包會自動使用；四項證據要互相印證。',
 '結案':'關叔：四項證據齊晒，先同華哥對質。面對誘惑，記住依法處理，唔好用證據換私人利益。'
};
function roomPath(destination){const queue=[[curRoom]],seen=new Set([curRoom]);for(let i=0;i<queue.length;i++){const path=queue[i],r=path[path.length-1];if(r===destination)return path;for(const link of L.links||LOBBY.links){if(link.floor!==run.floor||link.secret)continue;const next=link.a===r?link.b:link.b===r?link.a:null;if(next&&!seen.has(next)){seen.add(next);queue.push([...path,next]);}}}return [];}
function navigation(q=currentQuest()){
 const f=floorOf(q.r);let destination=q.r,point=null,action='行近目標按 E';
 if(f!==run.floor){const stair=nextStair(f);if(stair){destination=stair.r;const p=M.props.find(p=>p.spot?.stair&&p.spot.to===stair.to);if(p)point=[p.x+p.w/2,p.y+p.h];action='到樓梯按 E，前往 '+floorLabel(stair.to);}}
 else if(q.kind==='npc'){const n=npcs.find(n=>n.d===q.npc);if(n)point=[n.x,n.y+12];action='與「'+q.npc.n+'」交談（E）';}
 else if(q.kind==='door'){point=[(q.link.cells[0][0]+.5)*T,(q.link.cells[0][1]+.5)*T];action='在鎖門旁按 E 使用「'+q.item+'」';}
 else if(q.spot||q.kind==='exit'){const p=M.props.find(p=>q.kind==='exit'?p.spot?.exit:p.spot===q.spot);if(p)point=[p.x+p.w/2,p.sb?p.sb[1]+p.sb[3]+8:p.y+p.h+10];action=q.kind==='exit'?'走到出口按 E 返回大廳':'搜查「'+(q.spot.nm||SPOTN[q.spot.t]||'調查物件')+'」（E）';}
 else if(L.id==='LOBBY'){const id=ORDER.find(id=>!S.cleared.includes(id));if(id){point=[(3+ORDER.indexOf(id)*3)*T,3.4*T];action='走到 '+id+' 門前按 E';}}
 const path=roomPath(destination);
 if(path.length>1){const link=(L.links||LOBBY.links).find(l=>l.floor===run.floor&&!l.secret&&[l.a,l.b].includes(path[0])&&[l.a,l.b].includes(path[1]));if(link){point=[(link.cells[0][0]+.5)*T,(link.cells[0][1]+.5)*T];const dx=point[0]-P.x,dy=point[1]-P.y,direction=Math.abs(dx)>Math.abs(dy)?dx>0?'右邊':'左邊':dy>0?'下方':'上方';action='走向'+direction+'的門 →「'+L.rooms[path[1]].n+'」';}}
 return{point,path,action,destination,floor:f};
}
function routeHint(q){return '下一步：'+navigation(q).action;}
function routeMarkup(text){
 const names=[...new Set(Object.values(L.rooms).map(r=>r.n))].sort((a,b)=>b.length-a.length);let html='',i=0;
 while(i<text.length){const name=names.find(n=>text.startsWith(n,i));if(name){html+='<span class="place-name">'+esc(name)+'</span>';i+=name.length;}else{html+=/[→←↑↓]/.test(text[i])?'<span class="route-arrow">'+esc(text[i])+'</span>':esc(text[i]);i++;}}
 return html;
}

function positionObjective(){const o=$('obj'),scale=parseFloat(getComputedStyle(o).getPropertyValue('--quest-scale')),min=Math.round($('hud').getBoundingClientRect().bottom+8);o.style.maxHeight=Math.max(48,(innerHeight-min-8)/scale)+'px';const max=Math.max(min,innerHeight-o.getBoundingClientRect().height-8);o.style.top=Math.max(min,Math.min(max,objectiveY??min))+'px';}
function objUI(){
 const o=$('obj');if(!L||mode==='title'){o.classList.add('hide');return;}o.classList.remove('hide');
 const q=currentQuest(),n=navigation(q);$('objective-title').textContent=L.name;
 let h='<div class="r">目前位置 · '+routeMarkup(M.rooms[curRoom]?.d.n||'走廊')+' <span class="place-name">'+esc(floorLabel())+'</span></div><div class="objective-action">'+routeMarkup(q.title)+'</div><div class="objective-route">'+routeMarkup(routeHint(q))+'</div><div class="route-destination">目標 · '+routeMarkup(L.rooms[q.r]?.n||'廉潔大廳')+' <span class="place-name">'+esc(floorLabel(n.floor))+'</span></div><div class="route-step"><span class="route-arrow">→</span> '+(L.id===S.firstCase&&!S.cleared.includes(L.id)||S.items.compass?'跟隨地面紅箭嘴；':'依右上地圖前往目標；')+'到達後按 E。</div>';
 if(L.evs){h+='<div class="evidence-count">證據 '+evCnt()+'/'+L.evs.length+'</div>';if(S.items.notebook)h+=L.evs.map(e=>'<div class="'+(run.bag[e]?'ok':'no')+'">'+(run.bag[e]?'已得 ':'未得 ')+esc(e)+'</div>').join('');if(L.id==='F1'&&!S.tutorial)h+='<div class="coach">'+esc(COACH[q.item]||'關叔：跟住主線逐步查證，留意房門同樓梯。')+'</div>';}
 $('objective-content').innerHTML=h;positionObjective();
}
function resetRun(){
 run={floor:0,bag:{},searched:{},doors:{},revive:!!S.items.gavel,hints:3,choices:[],leaks:0,follow:[],floorVisits:[],lightLesson:false,puzzleStep:0,puzzleClues:{}};
 const loadout=saveMode==='account'&&ACCOUNT.user?.id===saveAccountId?ACCOUNT.loadouts?.[L.id]:null;
 if(loadout)Object.assign(run,structuredClone(loadout));
}
function goLobby(gateId){L=LOBBY_L;resetRun();npcs=[];M=build(L);const gi=ORDER.indexOf(gateId);P.x=gi>=0?(3+gi*3)*T:LOBBY.spawn[0]*T;P.y=gi>=0?3.4*T:LOBBY.spawn[1]*T;P.dir=0;mode='play';curRoom='L';goal=null;closeUI();discover('L');hud();banner('廉潔大廳');}
function gateArt(id){const i=ORDER.indexOf(id);return'<span class="gate-art" role="img" aria-label="'+esc(byId(id).loc)+'門牌" style="background-position:'+(i%4)*100/3+'% '+Math.floor(i/4)*100/3+'%"></span>';}
function enterLevel(lv){mode='ui';panel('<div class="panel-heading">'+gateArt(lv.id)+'<div><div class="tag">'+lv.tier+' 級 · 需要等級 '+lv.reqLv+' · '+lv.floors.filter(f=>!f.hidden).length+' 層</div><div class="ptitle">'+esc(lv.name)+'</div></div></div><div class="narr">'+esc(clean(lv.intro))+'</div><div class="tag">依右側地圖與左側主線調查；普通鎖匙只用於本案。</div><div class="btnrow"><button class="pxbtn gold" id="go">進入場景</button><button class="pxbtn" id="bk">返回</button></div>');$('go').onclick=()=>startScene(lv);$('bk').onclick=resume;}
function startScene(lv){if(!S.firstCase){S.firstCase=S.cleared[0]||lv.id;save();}L=lv;resetRun();npcs=[];curRoom=lv.floors[0].spawnRoom||'H';M=build(lv);P.x=tplOf().spawn[0]*T;P.y=tplOf().spawn[1]*T;P.dir=1;goal=null;mode='play';closeUI();discover(curRoom);banner(L.rooms[curRoom].n);hud();if(lv.id==='F1'&&!S.tutorial){const mentor=npcs.find(n=>n.mentor);if(mentor)openDialog(mentor);}}
function exitScene(){const id=L.id;goLobby(id);toast('返回大廳；本案物品重置，經驗、圖鑑及探索紀錄保留。');}
function changeFloor(stair){run.floor=stair.to;curRoom=null;npcs=[];run.follow=[];M=build(L);P.x=stair.spawn[0]*T;P.y=stair.spawn[1]*T;curRoom=roomAt(M,P.x,P.y-2)||tplOf().spawnRoom;const mentor=npcs.find(n=>n.mentor);if(mentor&&!M.rooms[curRoom].d.dark){mentor.x=P.x-20;mentor.y=P.y;mentor.room=curRoom;}goal=null;discover(curRoom);banner(floorLabel()+' · '+L.rooms[curRoom].n);hud();}
function automaticDoorBlocks(x,y){return (M.autoDoors||[]).some(d=>{const p=d.progress*d.progress*(3-2*d.progress),leaf=d.w/2*(1-p);return y>=d.y&&y<d.y+T&&x>=d.x&&x<d.x+d.w&&(x<d.x+leaf||x>=d.x+d.w-leaf);});}
function updateAutomaticDoors(now=performance.now()){
 for(const d of M.autoDoors||[]){
  const dt=Math.min(100,Math.max(0,now-d.updatedAt));d.updatedAt=now;
  const near=Math.abs(P.x-(d.x+d.w/2))<d.w/2+28&&Math.abs(P.y-(d.y+T/2))<64;
  if(near)d.holdUntil=now+650;
  const opening=near||now<d.holdUntil;
  d.progress=Math.max(0,Math.min(1,d.progress+(opening?dt/550:-dt/800)));
 }
}
function worldFree(x,y,planning=false){return ![[-4,0],[4,0],[-4,-4],[4,-4]].some(([dx,dy])=>solidAt(M,x+dx,y+dy)||!planning&&automaticDoorBlocks(x+dx,y+dy));}
function free(x,y,planning=false){return worldFree(x,y,planning)&&!npcs.some(n=>!n.mentor&&visible(n)&&Math.abs(n.x-x)<9&&Math.abs(n.y-y)<6);}
function pathTo(x,y){
 const step=8,w=M.W*2,h=M.H*2,key=(x,y)=>y*w+x,sx=Math.floor(P.x/step),sy=Math.floor(P.y/step),queue=[[sx,sy]],parent=new Map([[key(sx,sy),null]]);let found=null,best=Infinity;
 for(let i=0;i<queue.length&&i<30000;i++){const [a,b]=queue[i],wx=(a+.5)*step,wy=(b+.5)*step,d=Math.hypot(wx-x,wy-y);if(d<best){best=d;found=[a,b];}if(d<7)break;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=a+dx,ny=b+dy,k=key(nx,ny);if(nx<0||ny<0||nx>=w||ny>=h||parent.has(k)||!free((nx+.5)*step,(ny+.5)*step,true))continue;parent.set(k,[a,b]);queue.push([nx,ny]);}}
 const path=[];while(found&&parent.get(key(...found))!==null){path.push({x:(found[0]+.5)*step,y:(found[1]+.5)*step});found=parent.get(key(...found));}return path.reverse();
}
function aimAngle(){return Math.atan2(mouse.y/VIEW.scale+VIEW.camy-(P.y-8),mouse.x/VIEW.scale+VIEW.camx-P.x);}
function playerFacing(){if(!S.items.flashlight)return P.dir;const a=aimAngle();return Math.abs(Math.cos(a))>Math.abs(Math.sin(a))?(Math.cos(a)>0?2:3):(Math.sin(a)>0?0:1);}
function heldLightPose(){
 const a=aimAngle(),dir=playerFacing(),side=Math.abs(Math.cos(a))>.15?(Math.cos(a)>0?1:-1):(Math.sin(a)>0?1:-1);
 const shoulder={x:P.x+side*(dir<2?5:1),y:P.y-12},elbow={x:P.x+side*6,y:P.y-8};
 const x=P.x+side*7+Math.cos(a)*3,y=P.y-10+Math.sin(a)*4;
 const angle=Math.atan2(mouse.y/VIEW.scale+VIEW.camy-y,mouse.x/VIEW.scale+VIEW.camx-x);
 return{x,y,angle,shoulder,elbow};
}
function lightOrigin(){const grip=heldLightPose(),reach=HELD_LIGHT.width-HELD_LIGHT.grip;return{x:grip.x+Math.cos(grip.angle)*reach,y:grip.y+Math.sin(grip.angle)*reach,angle:grip.angle,on:!!S.items.flashlight&&lightOn};}
function illuminated(x,y){if(!M.rooms[roomAt(M,x,y)]?.d.dark)return true;const light=lightOrigin(),dx=x-light.x,dy=y-light.y,d=Math.hypot(dx,dy),angle=Math.atan2(dy,dx),a=angle-light.angle;return light.on&&d<=LIGHT_RADIUS&&Math.abs(Math.atan2(Math.sin(a),Math.cos(a)))<=Math.PI/6&&beamDistance(M,light.x,light.y,angle,d)+3>=d;}
function spotVisible(p){if(!visible(p))return false;return illuminated(p.x+p.w/2,p.sb?p.sb[1]+p.sb[3]/2:p.y+p.h-4);}
function update(){
 tick++;if(mode!=='play')return;updateAutomaticDoors();
 let ix=(keys.right?1:0)-(keys.left?1:0),iy=(keys.down?1:0)-(keys.up?1:0);if(ix||iy)goal=null;else if(goal?.path?.length){const node=goal.path[0],dx=node.x-P.x,dy=node.y-P.y,d=Math.hypot(dx,dy);if(d<2&&free(node.x,node.y)){P.x=node.x;P.y=node.y;goal.path.shift();}else if(d){ix=dx/d;iy=dy/d;}}else if(goal){goal=null;}
 P.mv=!!(ix||iy);if(P.mv){const m=Math.hypot(ix,iy),sp=S.items.boots?2:1.6,vx=ix/m*sp,vy=iy/m*sp;P.dir=Math.abs(ix)>Math.abs(iy)?ix>0?2:3:iy>0?0:1;let moved=false;if(vx&&free(P.x+vx,P.y)){P.x+=vx;moved=true;}if(vy&&free(P.x,P.y+vy)){P.y+=vy;moved=true;}if(goal&&!moved&&!(M.autoDoors||[]).some(d=>d.progress<1&&Math.abs(P.x-d.x-d.w/2)<d.w/2+28&&Math.abs(P.y-d.y-T/2)<64)&&++goal.stuck>12)goal=null;run.follow.push({x:P.x,y:P.y,room:curRoom});if(run.follow.length>35)run.follow.shift();}
 const rk=roomAt(M,P.x,P.y-2);if(rk&&rk!==curRoom){curRoom=rk;discover(rk);banner(L.rooms[rk].n);if(rk==='X'&&!S.secrets.includes(L.id)){S.secrets.push(L.id);gain(80);save();if(S.secrets.length===14)addAchv('🏆 秘密檔案全收集');}hud();}
 const mentor=npcs.find(n=>n.mentor);if(mentor&&run.bag['旅客記錄']&&run.follow.length>20){const p=run.follow[0],room=roomAt(M,p.x,p.y-2);if(M.rooms[room]&&!M.rooms[room].d.dark&&worldFree(p.x,p.y)){mentor.x=p.x;mentor.y=p.y;mentor.room=room;mentor.dir=P.dir;}}
 hover=findTarget();if(goal?.obj&&hover?.o===goal.obj){goal=null;interact(hover);}if(tick%30===0){const route=ui.classList.contains('hide')&&$('objective-content').querySelector('.objective-route');if(route)route.innerHTML=routeMarkup(routeHint(currentQuest()));}
}
function spotName(p){return p.spot.nm||SPOTN[p.t]||'調查物件';}
function spotContact(p){const [x,y,w,h]=p.sb||(p.flat?[p.x,p.y,p.w,p.h]:[p.x,p.y+p.h-4,p.w,8]);return{x:Math.max(x,Math.min(P.x,x+w)),y:Math.max(y,Math.min(P.y-2,y+h))};}
function contactClear(x,y){const d=Math.hypot(x-P.x,y-(P.y-2));for(let s=4;s<d-6;s+=4){const tx=Math.floor((P.x+(x-P.x)*s/d)/T),ty=Math.floor((P.y-2+(y-P.y+2)*s/d)/T);if(M.tiles[ty*M.W+tx]!==1)return false;}return true;}
function findTarget(){
 let best=null,bd=Infinity;
 const consider=(candidate,d,limit)=>{if(d>limit)return;const score=d-(hover?.o===candidate.o?4:0)-(candidate.k==='door'?36:0);if(score<bd){bd=score;best=candidate;}};
 for(const n of npcs){if(!visible(n)||!illuminated(n.x,n.y-2)||!contactClear(n.x,n.y-2))continue;consider({k:'npc',o:n},Math.max(0,Math.hypot(n.x-P.x,n.y-P.y)-7),25);}
 for(const p of M.props){if(!p.spot||!visible(p))continue;const a=spotContact(p),d=Math.hypot(a.x-P.x,a.y-P.y+2);if(!contactClear(a.x,a.y)||!spotVisible(p)&&!(d<20&&lightOn&&S.items.flashlight))continue;consider({k:'spot',o:p},d,p.wall?29:23);}
 for(const link of L.links||[]){if(link.floor!==run.floor||!link.need||run.doors[doorId(link)]||link.secret)continue;const d=Math.min(...link.cells.map(([x,y])=>Math.hypot((x+.5)*T-P.x,(y+.5)*T-P.y)));consider({k:'door',o:link},d,34);}
 if(L.id==='LOBBY'&&P.y<3.8*T)LEVELS.forEach((lv,i)=>{const gx=(3+i*3)*T;consider({k:'gate',o:lv,gx},Math.abs(gx-P.x),18);});
 return best;
}
function interact(t){if(!t)return;if(t.k==='npc'){if(t.o.d.shop)return openShop();openDialog(t.o);}else if(t.k==='spot')search(t.o);else if(t.k==='gate'){if(lvOf()<t.o.reqLv)toast('需要等級 '+t.o.reqLv+'；先完成較低級調查。');else enterLevel(t.o);}else if(t.k==='door'){const link=t.o;if(!run.bag[link.need])return toast('此門需要「'+link.need+'」，按主線尋找。');run.doors[doorId(link)]=true;M=build(L);goal=null;hud();toast('已將「'+link.need+'」插入門旁'+(/卡/.test(link.need)?'讀卡槽':'鎖匙孔')+'，鐵門已開啟。');}}
function addItem(item){if(run.bag[item])return;run.bag[item]=1;toast((L.evs?.includes(item)?'取得證據：':'取得物品：')+item);hud();}
function givePass(from){const id=nextId(from);if(!id){addAchv('🏆 檔案守護者');return'最後的字條：「防貪，比抓貪更重要。多謝你走完十四宗案件。」';}if(S.passes.includes(id))return'通行證已收入背包。';S.passes.push(id);save();hud();return'取得〈'+byId(id).name+'〉秘密檔案室通行證。這並不是普通房間鎖匙。';}
function openPuzzle(p){
 const index=p.spot.puzzleStep,step=L.puzzle.steps[index];
 if(index<run.puzzleStep)return message(p,step.name,'此項驗證已完成。');
 if(index>run.puzzleStep)return message(p,step.name,'先完成前一間房的驗證台。');
 if(!run.puzzleClues[index])return message(p,step.name,'先搜查本房的提示文件，再操作驗證台。');
 mode='ui';let selected=[];
 const controls=step.type==='code'?'<form id="puzzle-form"><label for="puzzle-answer">輸入文件推算出的 '+String(step.answer).length+' 位數字</label><input id="puzzle-answer" class="puzzle-input" inputmode="numeric" autocomplete="off" maxlength="'+String(step.answer).length+'" required><button class="pxbtn gold" type="submit">驗證密碼</button></form>':'<div class="btnrow">'+step.options.map((value,i)=>'<button class="pxbtn puzzle-option" data-index="'+i+'">'+esc(value)+'</button>').join('')+'</div>'+(step.type==='order'?'<p id="puzzle-sequence" class="narr">依提示按順序選擇。</p><div class="btnrow"><button class="pxbtn" id="puzzle-reset">重新排列</button><button class="pxbtn gold" id="puzzle-check">驗證順序</button></div>':'');
 panel('<div class="tag">遊戲設計的驗證機關 · '+(index+1)+' / '+L.puzzle.steps.length+'</div><div class="ptitle">'+esc(step.name)+'</div><div class="file">'+esc(step.clue)+'</div>'+controls+'<p id="puzzle-status" class="narr" role="status"></p><div class="btnrow"><button class="pxbtn" id="bk">稍後再解</button></div>');
 const verify=answer=>{if(JSON.stringify(answer)!==JSON.stringify(step.answer)){$('puzzle-status').textContent='驗證不一致。'+step.hint;return;}run.puzzleStep++;addAchv('puzzle:'+L.id+':'+index);const done=run.puzzleStep===L.puzzle.steps.length;if(done)addItem(L.puzzle.access);hud();panel('<div class="tag">機關驗證通過</div><div class="ptitle">'+esc(step.name)+'</div><div class="narr">'+esc(done?'已取得「'+L.puzzle.access+'」，可前往證物室開門。':'下一間驗證室已可操作，按主線繼續查找提示文件。')+'</div><div class="btnrow"><button class="pxbtn gold" id="bk">繼續調查</button></div>');$('bk').onclick=resume;};
 $('bk').onclick=resume;
 if(step.type==='code'){$('puzzle-form').onsubmit=e=>{e.preventDefault();verify($('puzzle-answer').value.trim());};$('puzzle-answer').focus();}
 else{ui.querySelectorAll('.puzzle-option').forEach(b=>b.onclick=()=>{const value=step.options[Number(b.dataset.index)];if(step.type==='choice')return verify(value);selected.push(value);b.disabled=true;$('puzzle-sequence').textContent=selected.join(' → ');});if(step.type==='order'){$('puzzle-reset').onclick=()=>{selected=[];$('puzzle-sequence').textContent='依提示按順序選擇。';ui.querySelectorAll('.puzzle-option').forEach(b=>b.disabled=false);};$('puzzle-check').onclick=()=>verify(selected);}}
}
function search(p){
 const s=p.spot,name=s.nm||SPOTN[p.t]||'物件';
 if(Number.isInteger(s.puzzleClue)){run.puzzleClues[s.puzzleClue]=true;hud();return message(p,name,L.puzzle.steps[s.puzzleClue].clue);}
 if(Number.isInteger(s.puzzleStep))return openPuzzle(p);
if(s.flashlight){if(S.flashlightCollected)return message(p,name,'手電筒已領取。');S.flashlightCollected=true;S.items.flashlight=1;lightOn=false;save();M.props=M.props.filter(q=>q!==p);drawLayer(M);hud();return message(p,name,'已領取手電筒。按 L 或畫面上的手電筒按鈕開關；移動滑鼠即可轉動光束，不用按住左鍵。照明距離約 5 格，光線漸變。');}if(s.shop)return openShop();if(s.codex)return openCodex();if(s.progress)return openFiles();if(s.exit)return exitScene();if(s.stair)return changeFloor(s);
 if(s.secret){if(S.opened.includes(L.id))return message(p,name,'暗門已開。');if(!S.passes.includes(L.id))return message(p,name,'讀卡槽需要本場景的秘密通行證。');S.opened.push(L.id);save();M=build(L);hud();return message(p,name,'通行證驗證成功，秘密入口已開啟。沿通道探索；若有向下樓梯，可前往地下檔案層。');}
 if(s.file){if(!S.files.includes(L.id)){S.files.push(L.id);gain(50);save();hud();}return showFile(L);}
 if(s.pass)return message(p,name,givePass(L.id));
 if(s.need&&!run.bag[s.need])return message(p,name,s.lock||'需要「'+s.need+'」。');
 if(s.egg){if(!S.tutorial)return message(p,name,s.say&&!s.say.includes('卡片')?s.say:'只見日常雜物，先專心完成調查。');if(S.eggs.includes(L.id))return message(p,name,'已經搜過，沒有其他發現。');S.eggs.push(L.id);gain(30);save();return message(p,name,'你自行發現了隱藏物品。\n'+givePass(L.id));}
 if(s.got){if(run.bag[s.got])return message(p,name,'已經搜過。');addItem(s.got);return message(p,name,(s.say||'完成搜查。')+'\n取得「'+s.got+'」。');}
 message(p,name,s.say||'沒有與案件相關的發現。');
}
let portraitRequest=0;
async function drawPortrait(src,isChar){
 const canvas=$('portrait'),g=canvas.getContext('2d'),request=++portraitRequest;
 const background=getComputedStyle(document.documentElement).getPropertyValue('--panel2').trim();
 canvas.classList.toggle('item-portrait',!isChar);canvas.setAttribute('aria-label',(DIA?.name||'調查物件')+(isChar?'的人像':'的圖像'));
 R(g,0,0,canvas.width,canvas.height,background);
 try{
  const image=await src;if(!image)return;
  if(image instanceof HTMLImageElement)await image.decode();
  if(request!==portraitRequest)return;
  g.imageSmoothingEnabled=isChar;g.imageSmoothingQuality='high';
  const inset=isChar?0:32,k=Math.min((canvas.width-inset*2)/image.width,(canvas.height-inset*2)/image.height);
  g.drawImage(image,(canvas.width-image.width*k)/2,(canvas.height-image.height*k)/2,image.width*k,image.height*k);
 }catch{
  if(request!==portraitRequest)return;
  canvas.setAttribute('aria-label','人像未能載入');g.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--dim').trim();g.font='24px sans-serif';g.textAlign='center';g.fillText('人像未能載入',canvas.width/2,canvas.height/2);
 }
}
function openDialog(n){
 mode='dialog';goal=null;const d=n.d;let nodes=d.d||['……'];if(d.cul&&!allEv())nodes=d.d0||['證據未齊，先繼續調查。'];else if(d.need&&!run.bag[d.need])nodes=d.dn||['……'];
 if(n.mentor&&!S.tutorial){if(run.bag['旅客記錄'])nodes=[COACH[currentQuest().item]||'關叔：按主線查證，我會陪住你。'];else nodes=['關叔：我係你嘅老師傅。移動用 WASD，行近人或物件按 E；再按 E 讀下一句。','關叔：查案唔係估。先記錄證人所見，再收集文件，最後親手搜查證物。左上角會講清下一步；右上角會標出目前位置；未探索房間只有黑色外框。',...nodes];}
 DIA={npc:n,name:d.n,nodes,i:0};drawPortrait(animePortrait(d),true);dlg.classList.remove('hide');showNode();
}
function message(p,name,text){mode='dialog';goal=null;DIA={name,nodes:[clean(text)],i:0};drawPortrait(p.spr,false);dlg.classList.remove('hide');showNode();}
function closeDialog(){if(DIA?.t)clearInterval(DIA.t);dlg.classList.add('hide');DIA=null;if(mode==='dialog')mode='play';hud();}
function showNode(){const node=DIA.nodes[DIA.i];if(node===undefined)return closeDialog();$('dname').textContent=clean(DIA.name);if(typeof node==='string')say(clean(node),advNext);else ask(node);}
function dialogueMarkup(text){const words=[...new Set([...(L.evs||[]),...Object.keys(L.items||{}),...Object.values(L.rooms).map(r=>r.n),'手電筒','鎖匙','通行卡','搜查令','密碼','提示文件','驗證台','保護證人','封存'])].filter(Boolean).sort((a,b)=>b.length-a.length);let result='',i=0;while(i<text.length){const word=words.find(w=>text.startsWith(w,i));if(word){result+='<strong class="clue-word">'+esc(word)+'</strong>';i+=word.length;}else result+=esc(text[i++]);}return result;}
function say(text,after){text=clean(text);$('dopts').innerHTML='';$('dmore').textContent='E / 空白鍵 繼續';$('dmore').classList.remove('choosing');const el=$('dtext');let i=0;el.textContent='';DIA.adv=after;DIA.typing=true;clearInterval(DIA.t);const current=DIA;DIA.t=setInterval(()=>{if(DIA!==current)return clearInterval(current.t);i+=3;el.innerHTML=dialogueMarkup(text.slice(0,i));if(i>=text.length){clearInterval(DIA.t);DIA.typing=false;}},18);DIA.fin=()=>{clearInterval(DIA.t);el.innerHTML=dialogueMarkup(text);DIA.typing=false;};}
function ask(node){const box=$('dopts');box.innerHTML='';$('dmore').textContent='請選擇回答';$('dmore').classList.add('choosing');DIA.typing=false;DIA.adv=null;$('dtext').innerHTML=dialogueMarkup(clean(typeof node.q==='function'?node.q():node.q));const opts=node.o.filter(o=>!o.need||run.bag[o.need]);for(const option of opts){const b=document.createElement('button');b.className='pxbtn';b.textContent=clean(option.t);b.onclick=e=>{e.stopPropagation();pick(option);};box.appendChild(b);}if(S.items.mag&&run.hints){const b=document.createElement('button');b.className='pxbtn gold';b.textContent='放大鏡：輔助判斷（消耗 1）';b.onclick=e=>{e.stopPropagation();S.items.mag--;run.hints--;const good=opts.find(o=>(o.ev||o.give)&&!run.bag[o.ev||o.give])||opts.find(o=>o.end&&o.int>0)||opts.find(o=>o.end)||opts.find(o=>!o.fatal&&!o.leak&&!(o.int<0));[...box.children].forEach((el,i)=>{if(opts[i]===good)el.classList.add('sel');});b.disabled=true;save();hud();};box.appendChild(b);}}
function advNext(){DIA.i++;showNode();}
function dlgAct(){if(!DIA)return;if(DIA.typing)DIA.fin();else if(DIA.adv)DIA.adv();}
function pick(option){
 $('dopts').innerHTML='';if(option.choiceId&&!S.choices.includes(option.choiceId))S.choices.push(option.choiceId);if(option.choiceAchievement)addAchv(option.choiceAchievement);if(option.achv)addAchv(option.achv);
 const repeated=option.choiceId&&run.choices.includes(option.choiceId);if(option.choiceId)run.choices.push(option.choiceId);
 if(option.ev)addItem(option.ev);if(option.give)addItem(option.give);
 if(option.int&&!repeated){if(option.int>0)gain(option.int);else if(S.items.seal){S.items.seal--;toast('程序護盾已抵消扣減。');}else{S.int=Math.max(0,S.int+option.int);toast(option.int+' 誠信值；等級不變。');}}
 if(option.leak){S.leaks++;run.leaks++;}
 const temptations=[['F1',3,'d'],['F2',3,'d'],['F3',3,'d0'],['C1',1,'d']];
 if(temptations.every(([id,index,field])=>byId(id).npcs[index][field].some(node=>typeof node==='object'&&node.o?.some(o=>!o.fatal&&S.choices.includes(o.choiceId)))))addAchv('拒絕每一個誘惑');
 save();hud();
 if(option.fatal){if(run.revive){run.revive=false;S.items.gavel=Math.max(0,S.items.gavel-1);save();hud();return say('反思之槌發動，你懸崖勒馬，撤回了錯誤選擇。',advNext);}recordEnding(option);closeDialog();return gameOver(option);}
 const after=()=>{if(option.end){recordEnding(option);closeDialog();showEnd(option);}else advNext();};if(option.s)say(option.s,after);else after();
}
function recordEnding(o){if(o.endingId&&!S.endings.includes(o.endingId))S.endings.push(o.endingId);save();}
function panel(html,cls=''){ui.classList.remove('hide');ui.innerHTML='<section class="panel '+cls+'">'+html+'</section>';const button=ui.querySelector('button');if(button)button.focus();}
function closeUI(){ui.classList.add('hide');ui.innerHTML='';}
function resume(){closeUI();mode='play';}
function showEnd(o){mode='ui';panel('<div class="tag">遊戲分支 · '+esc(o.endingTitle||clean(o.t))+'</div><div class="ptitle">'+esc(L.name)+' · 調查結果</div><div class="narr">'+esc(clean(o.s||''))+'</div><div class="tag">以下為真實案件紀錄，與你的遊戲選擇分開呈現。</div><div class="file">'+esc(clean(L.end))+'</div><div class="btnrow"><button class="pxbtn gold" id="loot">完成調查及領取獎勵</button></div>');$('loot').onclick=finish;}
function finish(){const first=!S.cleared.includes(L.id);if(first){S.cleared.push(L.id);gain(L.reward);}if(L.id==='B2'&&run.leaks===0)addAchv('🏆 守口如瓶');if(L.id==='B3')addAchv('🏆 未落網(灰色徽章)');const teaching=L.id==='F1'&&!S.tutorial;if(teaching){S.tutorial=true;addAchv('完成師傅教學');}if(S.cleared.length===14)addAchv('十四宗調查完成');save();hud();panel('<div class="tag">調查完成</div><div class="ptitle">'+esc(L.name)+'</div><div class="narr">'+(first?'誠信值 +'+L.reward+' · 經驗 +'+L.reward:'重玩可解鎖其他回答與結局；不重複發放結案獎勵。')+'</div>'+(teaching?'<div class="file">關叔：你完成第一宗調查，已經學識基本功。\n仲有一件事：世界入面有隱藏彩蛋，同秘密檔案室通行證。呢部分留畀你自己探索，我唔會帶你去攞，亦唔會畀任何位置線索。\n你嘅回答同成就已收入辦公室圖鑑，未解鎖內容會顯示 ???。</div>':'')+'<div class="btnrow"><button class="pxbtn gold" id="bk">返回大廳</button></div>');$('bk').onclick=()=>goLobby(L.id);}
function gameOver(o){mode='ui';panel('<div class="tag">遊戲失敗分支 · 已收入圖鑑</div><div class="ptitle">'+esc(o.endingTitle||'誘惑的代價')+'</div><div class="narr">'+esc(clean(o.s))+'</div><div class="btnrow"><button class="pxbtn gold" id="rt">重新挑戰</button><button class="pxbtn" id="bk">返回大廳</button></div>','gameover');$('rt').onclick=()=>startScene(L);$('bk').onclick=()=>goLobby(L.id);}
function iconFor(item){return'<span class="art-icon art-'+(/秘密|通行證/.test(item)?'pass':/卡|權限/.test(item)?'card':'key')+'" role="img" aria-label="'+esc(item)+'"></span>';}
function shopIcon(id){return id==='flashlight'?'<span class="art-icon art-light" role="img" aria-label="手電筒"></span>':'<img class="shop-icon" src="assets/shop-'+id+'.png" alt="'+esc(ITEMS[id].n)+'" width="56" height="56">';}
function openShop(){mode='ui';let h='<div class="tag">陳伯小賣部</div><div class="ptitle">調查裝備</div><div class="narr">可用誠信值 '+S.int+' · 等級 '+lvOf()+'\n兌換只消耗誠信值，經驗與等級不會減少。</div>';for(const item of SHOP){const own=!item.rep&&S.items[item.id];h+='<div class="row">'+shopIcon(item.id)+'<span><b>'+ITEMS[item.id].n+'</b><br><span class="d">'+ITEMS[item.id].d+'</span></span>'+(own?'<span>已擁有</span>':'<button class="pxbtn gold buy" data-id="'+item.id+'" '+(S.int<item.p?'disabled':'')+'>兌換 '+item.p+'</button>')+'</div>';}panel(h+'<div class="btnrow"><button class="pxbtn" id="bk">返回</button></div>');ui.querySelectorAll('.buy').forEach(b=>b.onclick=()=>{const it=SHOP.find(i=>i.id===b.dataset.id);if(S.int<it.p)return;S.int-=it.p;S.items[it.id]++;save();hud();openShop();});$('bk').onclick=resume;}
function openBag(){if(mode!=='play')return;mode='ui';let h='<div class="ptitle">調查背包</div>';if(L.evs){h+='<div class="tag">本案物品（離開場景後重置）</div>';for(const item of Object.keys(run.bag))h+='<div class="row">'+(/鎖匙|卡|密碼/.test(item)?iconFor(item):'')+'<span>'+esc(item)+'</span><span class="d">'+esc(L.items?.[item]||'案件證據或調查物品')+'</span></div>';if(!Object.keys(run.bag).length)h+='<p class="tag">尚未取得物品，請按主線調查。</p>';}
 h+='<div class="tag">裝備</div>';for(const [id,count] of Object.entries(S.items))if(count)h+='<div class="row">'+shopIcon(id)+'<span>'+ITEMS[id].n+' ×'+count+'</span><span class="d">'+ITEMS[id].d+'</span>'+(id==='tea'?'<button class="pxbtn" id="drink">飲用</button>':'')+'</div>';
 if(S.tutorial){h+='<div class="tag">秘密通行證（永久保留）</div>';for(const id of S.passes)h+='<div class="row">'+iconFor('秘密通行證')+'<span>'+esc(byId(id).name)+'</span><span class="d">'+(S.opened.includes(id)?'已開啟':'尚未使用')+'</span></div>';}
 panel(h+'<div class="btnrow"><button class="pxbtn" id="bk">關閉</button></div>');$('bk').onclick=resume;if($('drink'))$('drink').onclick=()=>{S.items.tea--;S.int+=80;save();hud();resume();toast('提神茶恢復 80 誠信值。');};}
function showFile(lv){mode='ui';panel('<div class="tag">公開案件歷史資料</div><div class="ptitle">'+esc(lv.secret.title)+'</div><div class="file">'+esc(clean(lv.secret.file))+'</div><div class="btnrow"><button class="pxbtn" id="bk">關閉</button></div>');$('bk').onclick=resume;}
function openFiles(){if(mode!=='play')return;mode='ui';let h='<div class="ptitle">案件資料</div><div class="tag">真實案件結果，與遊戲分支圖鑑分開記錄。</div>';for(const lv of LEVELS){const done=S.cleared.includes(lv.id),file=S.files.includes(lv.id);h+='<div class="file"><h4>'+lv.tier+' · '+(done||file?esc(lv.name):'???')+'</h4>'+(done?esc(clean(lv.end)):'未完成調查')+(file?'\n\n'+esc(clean(lv.secret.file)):'')+'</div>';}panel(h+'<div class="btnrow"><button class="pxbtn" id="bk">關閉</button></div>');$('bk').onclick=resume;}
function openCodex(tab='endings',filter='all'){
 if(mode==='title'||mode==='dialog')return;mode='ui';const entries=tab==='achievements'?JOURNAL.achievements:tab==='choices'?JOURNAL.choices:JOURNAL.endings,unlocked=tab==='achievements'?S.achv:tab==='choices'?S.choices:S.endings;
 let h='<div class="tag">你的調查辦公室 · 永久圖鑑</div><div class="ptitle">結局與成就</div><p class="tag">未解鎖內容只顯示 ???，不透露名稱或取得方法。回答紀錄是你的選擇，不代表真實判決。</p><div class="tabs">'+[['endings','結局'],['choices','回答分支'],['achievements','成就']].map(([id,label])=>'<button class="pxbtn '+(id===tab?'gold':'')+' tab" data-tab="'+id+'">'+label+'</button>').join('')+'<button class="pxbtn" id="filter">'+(filter==='all'?'只看已解鎖':'顯示全部')+'</button></div><div class="tag">已解鎖 '+entries.filter(e=>unlocked.includes(e.id)).length+' / '+entries.length+'</div><div class="encyclopedia">';
 for(const entry of entries){const has=unlocked.includes(entry.id);if(filter==='unlocked'&&!has)continue;h+=has?'<article class="entry"><h3>'+esc(clean(entry.title))+'</h3><p>'+esc(clean(entry.text||''))+'</p><p>取得條件：'+esc(clean(entry.condition))+'</p></article>':'<article class="entry locked"><h3>???</h3><p>尚未解鎖</p></article>';}
 panel(h+'</div><div class="btnrow"><button class="pxbtn" id="bk">返回</button></div>','codex-panel');ui.querySelectorAll('.tab').forEach(b=>b.onclick=()=>openCodex(b.dataset.tab,filter));$('filter').onclick=()=>openCodex(tab,filter==='all'?'unlocked':'all');$('bk').onclick=resume;
}
function avatarLook(avatar){return investigatorLook(avatar);}
function playerSprite(){return charSprite({...avatarLook(S.avatar),holding:S.items.flashlight?Math.sign(heldLightPose().x-P.x):0},playerFacing(),P.mv?[1,0,2,0][(tick>>3)%4]:0);}
function drawPlayer(g,cx,cy){
 const grip=heldLightPose(),carried=!!S.items.flashlight,behind=playerFacing()===1;
 const hold=()=>{
  g.save();g.lineJoin='round';g.lineCap='round';g.beginPath();
  g.moveTo(Math.round(grip.shoulder.x-cx),Math.round(grip.shoulder.y-cy));
  g.lineTo(Math.round(grip.elbow.x-cx),Math.round(grip.elbow.y-cy));g.lineTo(Math.round(grip.x-cx),Math.round(grip.y-cy));
  g.strokeStyle='#142a26';g.lineWidth=4;g.stroke();g.strokeStyle=avatarLook(S.avatar).cl;g.lineWidth=2;g.stroke();g.restore();
  drawHeldFlashlight(g,grip.x-cx,grip.y-cy,grip.angle,lightOn);
 };
 if(carried&&behind)hold();
 g.drawImage(playerSprite(),Math.round(P.x-9-cx),Math.round(P.y-25-cy));
 if(carried&&!behind)hold();
}
function shadow(g,x,y){R(g,x-6,y-2,12,3,'rgba(0,0,0,.3)');}
function gateChains(g,x,y){
 g.save();g.lineJoin='round';g.lineCap='round';
 for(const [ax,ay,bx,by] of [[-2,1,34,32],[34,1,-2,32]]){
  const angle=Math.atan2(by-ay,bx-ax),length=Math.hypot(bx-ax,by-ay);
  for(let n=0;n<=length;n+=5){g.save();g.translate(x+ax+Math.cos(angle)*n,y+ay+Math.sin(angle)*n);g.rotate(angle);g.beginPath();g.roundRect(-3,-1.5,6,3,1);g.strokeStyle='#161e22';g.lineWidth=3;g.stroke();g.strokeStyle=n%10?'#89989f':'#d7e0e3';g.lineWidth=1;g.stroke();g.restore();}
 }
 R(g,x+10,y+17,12,13,'#142026');R(g,x+11,y+18,10,11,'#929ea5');R(g,x+12,y+18,8,2,'#e0e6e7');R(g,x+12,y+26,8,2,'#697980');
 g.beginPath();g.moveTo(x+12,y+18);g.lineTo(x+12,y+14);g.arc(x+16,y+14,4,Math.PI,0);g.lineTo(x+20,y+18);g.strokeStyle='#26343b';g.lineWidth=4;g.stroke();g.strokeStyle='#bdc9ce';g.lineWidth=2;g.stroke();
 R(g,x+15,y+22,3,2,'#25333b');R(g,x+16,y+24,1,2,'#25333b');g.restore();
}
function gateDraw(lv,i){const x=(2+i*3)*T,locked=lvOf()<lv.reqLv,c=locked?'#5b625e':TIER_C[lv.tier];return{by:0,draw(g,cx,cy){const X=x-cx,Y=-cy;R(g,X,Y,32,40,'#101915');R(g,X,Y+2,32,38,c);R(g,X+3,Y+5,26,34,'#1c3028');R(g,X+15,Y+6,2,31,'#b3a06a');const art=artSprite('gate',i);if(art)g.drawImage(art,X-3,Y-3,38,38);if(locked)gateChains(g,X,Y);}};}
function automaticDoorDraw(d){return{by:d.y+2*T,draw(g,cx,cy){
 const x=d.x-cx,y=d.y-cy,p=d.progress*d.progress*(3-2*d.progress),slide=d.w/2*p;
 R(g,x-4,y-4,d.w+8,4,'#a6bbb8');R(g,x-3,y,3,32,'#49615e');R(g,x+d.w,y,3,32,'#49615e');
 R(g,x,y+30,d.w,2,'#243d39');
 g.save();g.beginPath();g.rect(x,y,d.w,30);g.clip();
 for(const [left,right] of [[x-slide,false],[x+d.w/2+slide,true]]){
  R(g,left,y,d.w/2,30,'#789994');R(g,left+2,y+2,d.w/2-4,25,'#244d50');
  R(g,left+3,y+3,d.w/2-6,1,'#a7e3db');R(g,left+3,y+18,d.w/2-6,3,'#aac9ba');
  R(g,left+(right?2:d.w/2-3),y+5,1,21,'#d4e0ce');
 }
 g.restore();R(g,x+d.w/2-5,y-3,10,2,'#203834');R(g,x+d.w/2-2,y-3,4,1,d.progress>0?'#8de9b4':'#d9c384');
}};}
function lockedDoor(link){
 const xs=link.cells.map(p=>p[0]),ys=link.cells.map(p=>p[1]),left=Math.min(...xs),top=Math.min(...ys),right=Math.max(...xs),bottom=Math.max(...ys),x=left*T,y=top*T,w=(right-left+1)*T,h=(bottom-top+1)*T;
 const candidates=h>w?[[left,top-1],[left,bottom+1]]:[[right+1,top],[left-1,top]];
 const mount=candidates.find(([tx,ty])=>tx>=0&&ty>=0&&tx<M.W&&ty<M.H&&[2,3].includes(M.tiles[ty*M.W+tx]));
 return{by:y+h,mount,draw(g,cx,cy){
  const X=x-cx,Y=y-cy;R(g,X,Y,w,h,'#192a30');R(g,X+2,Y+2,w-4,h-4,'#617078');
  for(let i=5;i<h-3;i+=6)R(g,X+3,Y+i,w-6,1,'#819398');
  R(g,X+w/2-1,Y+2,2,h-4,'#202d33');
  if(mount){const sx=mount[0]*T+5-cx,sy=mount[1]*T+3-cy;R(g,sx,sy,6,10,'#18282d');R(g,sx+1,sy+1,4,1,'#efb959');if(/卡/.test(link.need))R(g,sx+1,sy+5,4,1,'#84e5d7');else{R(g,sx+2,sy+4,2,2,'#d6dcba');R(g,sx+2,sy+6,1,2,'#d6dcba');}}
 }};
}
function drawMinimap(){
 const c=$('minimap').getContext('2d'),w=170,h=130,explored=discovered();
 const rooms=Object.entries(M.rooms).filter(([key])=>!['X','XB'].includes(key)||M.def.secretOpen&&explored.includes(run.floor+':'+key));
 if(!rooms.length)return;
 const minX=Math.min(...rooms.map(([,r])=>r.x)),minY=Math.min(...rooms.map(([,r])=>r.y)),width=Math.max(...rooms.map(([,r])=>r.x+r.w))-minX,height=Math.max(...rooms.map(([,r])=>r.y+r.h))-minY;
 const s=Math.min((w-8)/width,(h-8)/height),ox=(w-width*s)/2-minX*s,oy=(h-height*s)/2-minY*s;
 c.imageSmoothingEnabled=false;R(c,0,0,w,h,'#000');
 for(const [key,r] of rooms){
  const seen=explored.includes(run.floor+':'+key);c.save();c.beginPath();r.outline.forEach(([x,y],i)=>c[i?'lineTo':'moveTo'](ox+(r.x+x)*s,oy+(r.y+y)*s));c.closePath();c.clip();
  if(seen){c.drawImage(M.layer,ox,oy,M.W*s,M.H*s);for(const p of M.props)if(p.room===key&&!p.wall)c.drawImage(p.spr,ox+p.x/T*s,oy+p.y/T*s,p.w/T*s,p.h/T*s);}else R(c,ox+r.x*s,oy+r.y*s,r.w*s,r.h*s,'#000');c.restore();
  c.strokeStyle=seen?(key===curRoom?'#edc76f':'#477b68'):MAP_FOG_OUTLINE;c.lineWidth=1;c.stroke();
 }
 for(const p of M.props)if(p.spot?.stair&&rooms.some(([k])=>k===p.room)&&explored.includes(run.floor+':'+p.room))R(c,ox+p.x/T*s,oy+p.y/T*s,3,3,'#dfba67');
 const point=navigation().point;if(point){c.strokeStyle='#7bf3e1';c.lineWidth=1.5;c.strokeRect(ox+point[0]/T*s-2,oy+point[1]/T*s-2,4,4);}
 R(c,ox+P.x/T*s-2,oy+P.y/T*s-2,4,4,'#ffe4a3');$('maptitle').textContent=floorLabel()+' · '+(M.rooms[curRoom]?.d.n||L.name);
}
let routeCache=null;
function guidePath(point){if(!point)return[];const id=point.join(':');if(!routeCache||routeCache.map!==M||routeCache.id!==id||tick-routeCache.tick>35)routeCache={map:M,id,tick,path:pathTo(...point)};return routeCache.path;}
function drawRoute(){
 if(!(L.id===S.firstCase&&!S.cleared.includes(L.id))&&!S.items.compass)return;
 const point=navigation().point;if(!point)return;const path=guidePath(point);if(path.length<2)return;
 const phase=REDUCED_MOTION.matches?0:tick*.45;
 BG.save();BG.strokeStyle=ROUTE_COLOR;BG.lineWidth=1.5;BG.setLineDash([5,5]);BG.lineDashOffset=-phase;BG.beginPath();
 let started=false;
 for(const node of path){if(!illuminated(node.x,node.y)){started=false;continue;}BG[started?'lineTo':'moveTo'](node.x-VIEW.camx,node.y-VIEW.camy);started=true;}
 BG.stroke();BG.setLineDash([]);let distance=0,next=12+phase%32;
 for(let i=1;i<path.length;i++){
  const a=path[i-1],b=path[i],length=Math.hypot(b.x-a.x,b.y-a.y);if(!length)continue;
  while(next<=distance+length){const t=(next-distance)/length,x=a.x+(b.x-a.x)*t,y=a.y+(b.y-a.y)*t;
   if(illuminated(x,y)){BG.save();BG.translate(x-VIEW.camx,y-VIEW.camy);BG.rotate(Math.atan2(b.y-a.y,b.x-a.x));BG.beginPath();BG.moveTo(-3,-3);BG.lineTo(0,0);BG.lineTo(-3,3);BG.stroke();BG.restore();}next+=32;
  }distance+=length;
 }
 BG.restore();
}
const labelFades=new Map();
function fadingLabel(key,c,text,x,y,color,size,show,bg){let value=labelFades.get(key)||0;value=Math.max(0,Math.min(1,value+(show ? .12 : -.1)));if(value)labelFades.set(key,value);else labelFades.delete(key);if(!value)return;c.save();c.globalAlpha=value;label(c,text,x,y,color,size,bg);c.restore();}
function draw(){
 if(!M||mode==='title')return;setCamera(P.x,P.y-10);const dyn=[];if(L.id==='LOBBY')LEVELS.forEach((lv,i)=>dyn.push(gateDraw(lv,i)));
 for(const n of npcs)if(visible(n))dyn.push({by:n.y,draw(g,cx,cy){shadow(g,n.x-cx,n.y-cy);g.drawImage(charSprite(n.d.lk||{},n.dir,0),Math.round(n.x-9-cx),Math.round(n.y-25-cy));}});
 for(const link of L.links||[])if(link.floor===run.floor&&link.need&&!run.doors[doorId(link)])dyn.push(lockedDoor(link));
 for(const door of M.autoDoors||[])dyn.push(automaticDoorDraw(door));
 dyn.push({by:P.y,draw(g,cx,cy){shadow(g,P.x-cx,P.y-cy);drawPlayer(g,cx,cy);}});
 renderWorld(M,dyn,lightOrigin());drawRoute();
 if(M.rooms[curRoom]?.d.dark)drawPlayer(BG,VIEW.camx,VIEW.camy);
 const c=blit(cv),playing=mode==='play',nav=navigation();
 if(L.id==='LOBBY')LEVELS.forEach((lv,i)=>{const x=(3+i*3)*T,near=Math.hypot(x-P.x,48-P.y)<85;fadingLabel('gate:'+i,c,lv.tier+' · Lv'+lv.reqLv,x,48,lvOf()<lv.reqLv?'#b4bdb8':TIER_C[lv.tier],8,near);fadingLabel('gate-action:'+i,c,'E 〈'+lv.name+'〉',x,66,'#fff',10,playing&&hover?.o===lv,'rgba(0,0,0,.8)');});
 for(const p of M.props){if(!p.spot||!visible(p))continue;const contact=spotContact(p),near=Math.hypot(contact.x-P.x,contact.y-P.y)<60,active=playing&&hover?.o===p,show=near&&(spotVisible(p)||active);fadingLabel(p,c,(active?'E ':'')+spotName(p),p.x+p.w/2,p.y-6,active?'#fff':'#e7d9b1',active?10:8,show,'rgba(8,20,17,.88)');}
 for(const n of npcs){if(!visible(n))continue;const active=playing&&hover?.o===n,near=Math.hypot(n.x-P.x,n.y-P.y)<65&&illuminated(n.x,n.y);fadingLabel(n,c,n.d.n,n.x,n.y-43,n.mentor?'#a6e2bc':'#eee6ce',active?6:5.4,near,'rgba(0,0,0,.8)');fadingLabel('talk:'+n.room+':'+n.d.n,c,'E 交談',n.x,n.y-29,'#fff',6,near&&active,'rgba(0,0,0,.8)');}
 for(const link of L.links||[]){if(link.floor!==run.floor||!link.need||run.doors[doorId(link)])continue;const [x,y]=link.cells[0],active=playing&&hover?.o===link,near=Math.hypot((x+.5)*T-P.x,(y+.5)*T-P.y)<68;fadingLabel(link,c,(active?'E 插入 ':'插槽 · ')+link.need,(x+.5)*T,y*T-7,'#e9dfba',9,near,'rgba(0,0,0,.85)');}
 if(nav.point&&playing){const path=guidePath(nav.point),next=path[Math.min(path.length-1,5)];if(next&&illuminated(next.x,next.y))label(c,'◇',next.x,next.y-4,'#7bf3e1',10);if(nav.path.length>1)fadingLabel('nav',c,'前往 '+L.rooms[nav.path[1]].n,nav.point[0],nav.point[1]+22,'#a0f0dc',9,Math.hypot(nav.point[0]-P.x,nav.point[1]-P.y)<100,'rgba(8,20,17,.9)');}
 drawMinimap();
}
const KM={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',a:'left',d:'right',w:'up',s:'down',A:'left',D:'right',W:'up',S:'down'};
function fs(){try{const promise=document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen();promise?.catch(()=>{});}catch(e){}}
function toggleLight(){if(!S.items.flashlight)return toast('先到你的調查辦公室，按 E 領取手電筒。');lightOn=!lightOn;hud();}
addEventListener('keydown',e=>{if(mode==='title'||e.target.matches('input,textarea,select'))return;if(e.target===$('b-objective')&&['Enter',' '].includes(e.key))return;const k=KM[e.key];if(k){keys[k]=1;e.preventDefault();}if(e.repeat)return;if(['e','E',' '].includes(e.key)){e.preventDefault();if(mode==='dialog')dlgAct();else if(mode==='play')interact(hover);}if(['i','I'].includes(e.key))mode==='ui'&&$('bk')?$('bk').click():openBag();if(['j','J'].includes(e.key))mode==='ui'&&$('bk')?$('bk').click():openFiles();if(['k','K'].includes(e.key))mode==='ui'&&$('bk')?$('bk').click():openCodex();if(['l','L'].includes(e.key))toggleLight();if(['f','F'].includes(e.key))fs();if(e.key==='Escape'){if(mode==='dialog'&&!$('dopts').children.length)closeDialog();else if(mode==='ui'&&$('bk'))$('bk').click();}});
addEventListener('keyup',e=>{if(KM[e.key])keys[KM[e.key]]=0;});
function clearInput(){
 Object.keys(keys).forEach(k=>keys[k]=0);
 if(objectiveDrag){const id=objectiveDrag.id;objectiveDrag=null;objectiveDragged=true;const button=$('b-objective');if(button.hasPointerCapture(id))button.releasePointerCapture(id);}
}
function trackAim(e){if(e.pointerType==='touch')return;mouse.x=e.clientX;mouse.y=e.clientY;}
addEventListener('blur',clearInput);
document.addEventListener('visibilitychange',()=>{if(document.hidden)clearInput();});
// Overlays can intercept canvas events; track hover before their handlers run.
for(const type of ['pointermove','mousemove','pointerover'])addEventListener(type,trackAim,{capture:true,passive:true});
cv.addEventListener('click',e=>{if(mode!=='play')return;mouse.x=e.clientX;mouse.y=e.clientY;const x=e.clientX/VIEW.scale+VIEW.camx,y=e.clientY/VIEW.scale+VIEW.camy;let obj=npcs.find(n=>visible(n)&&Math.abs(x-n.x)<10&&y>n.y-26&&y<n.y+2)||M.props.find(p=>p.spot&&spotVisible(p)&&x>p.x&&x<p.x+p.w&&y>p.y&&y<p.y+p.h);if(obj&&hover?.o===obj)return interact(hover);const ty=obj?(obj.sb?obj.sb[1]+obj.sb[3]+8:obj.y+(obj.h||0)+8):y;goal={path:pathTo(x,ty),obj,stuck:0};});
dlg.addEventListener('click',dlgAct);
ui.addEventListener('click',e=>{if(e.button===0&&e.target===ui){const cancel=$('bk')||$('loot');if(cancel)cancel.click();else resume();}});
document.addEventListener('click',e=>{if(e.button===0&&mode==='dialog'&&!dlg.contains(e.target)&&!e.target.closest('#hud,#act')){closeDialog();e.stopPropagation();}},true);
document.querySelectorAll('.db').forEach(b=>{const k=b.dataset.k,on=e=>{e.preventDefault();keys[k]=1;},off=e=>{e.preventDefault();keys[k]=0;};b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointercancel',off);b.addEventListener('pointerleave',off);});
$('b-objective').onclick=()=>{if(objectiveDragged){objectiveDragged=false;return;}const collapsed=$('obj').classList.toggle('collapsed');$('objective-content').hidden=collapsed;const b=$('b-objective');b.setAttribute('aria-expanded',String(!collapsed));b.textContent=collapsed?'主線指引 ＋':'−';b.setAttribute('aria-label',collapsed?'展開主線指引':'收起主線指引');b.title=collapsed?'點擊展開；上下拖動調整位置':'收起主線與師傅指引';positionObjective();};
$('b-objective').addEventListener('pointerdown',e=>{if(e.button!==0||!$('obj').classList.contains('collapsed'))return;objectiveDragged=false;objectiveDrag={id:e.pointerId,x:e.clientX,y:e.clientY,top:$('obj').getBoundingClientRect().top};e.currentTarget.setPointerCapture(e.pointerId);});
$('b-objective').addEventListener('pointermove',e=>{if(!objectiveDrag||e.pointerId!==objectiveDrag.id)return;const dx=e.clientX-objectiveDrag.x,dy=e.clientY-objectiveDrag.y;if(Math.hypot(dx,dy)>5)objectiveDragged=true;if(objectiveDragged){objectiveY=objectiveDrag.top+dy;positionObjective();}});
$('b-objective').addEventListener('pointerup',e=>{if(!objectiveDrag||e.pointerId!==objectiveDrag.id)return;objectiveDrag=null;e.currentTarget.releasePointerCapture(e.pointerId);});
$('b-objective').addEventListener('pointercancel',()=>{objectiveDrag=null;objectiveDragged=true;});
$('b-objective').addEventListener('lostpointercapture',()=>{objectiveDrag=null;});
$('act').onclick=()=>{if(mode==='dialog')dlgAct();else if(mode==='play')interact(hover);};$('b-bag').onclick=openBag;$('b-files').onclick=openFiles;$('b-codex').onclick=()=>openCodex();$('b-fs').onclick=fs;$('b-light').onclick=toggleLight;
$('b-reset').onclick=async()=>{
 if(!confirm('確定清除全部進度？'))return;
 if(saveMode==='account'){
  if(ACCOUNT.user?.id!==saveAccountId)return toast('帳號已變更，請重新登入。');
  const result=await ACCOUNT.saveProgress(null);
  if(!result?.user||result.user.id!==saveAccountId)return toast('未能重設存檔，原有進度已保留。');
  S=loadState(result.save);
 }else{S=blank();save();}
 goLobby();
};
function start(){if(mode!=='title')return;$('title').classList.add('hide');goLobby();}
function refreshView(){resizeView(cv);hud();}
addEventListener('resize',refreshView);addEventListener('focus',refreshView);document.addEventListener('fullscreenchange',refreshView);
refreshView();setInterval(()=>{update();draw();},16);
