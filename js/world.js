'use strict';
const TPL={W:40,H:24,
  rooms:{B:[12,0,16,12],H:[12,11,16,13],A:[0,7,13,17],C:[27,7,13,17],X:[27,0,13,8]},
  doors:[[12,17],[12,18],[27,17],[27,18],[19,11],[20,11],[27,9],[27,10],[19,23],[20,23]],
  exit:[[19,23],[20,23]],secret:[[32,7],[33,7],[32,8],[33,8]],spawn:[20,21.5],
  keep:[[13.5,17.5],[25.5,17.5],[19.5,13.5],[19.5,22],[19.5,10],[25.5,9.5],[28.5,17.5],[28.5,9.5],[33,9.5],[11,17.5],[33,6]]};
const LOBBY={W:62,H:19,rooms:{L:[0,0,62,19],O:[43,0,19,14]},doors:[[50,13],[51,13],[52,13],[53,13]],spawn:[22.5,12],spawnRoom:'L',
  keep:Array.from({length:83},(_,i)=>[2.5+i*.5,3.5]).concat(Array.from({length:107},(_,i)=>[3.5+i*.5,16]),Array.from({length:27},(_,i)=>[22.5,3+i*.5]),Array.from({length:17},(_,i)=>[52,9+i*.5])),
  shapes:{
    L:{kind:'L',voids:[[44,0,18,13]],outline:[[0,0],[44,0],[44,13],[62,13],[62,19],[0,19]],subspaces:[[2,7,13,7],[28,7,13,7]]},
    O:{kind:'rect',subspaces:[[1,2,8,10],[10,2,8,10]]}
  },autoDoors:[{x:50,y:13,w:4}],links:[{floor:0,a:'L',b:'O',cells:[[50,13],[51,13],[52,13],[53,13]],secret:false}]};

const FURN={
  // Furniture is fitted as usable suites, repeated on a grid with protected access aisles.
  group(items,count=1,at=[.15,.15],alternatives=[],zone){return {items,count,at,alternatives,zone};},
  station(t='pcdesk',o={}){return [[t,0,0,o],['chair',(PROPS[t].w-PROPS.chair.w)/(2*T),1.25]];},
  seating(o={}){return [['sofa',0,0,o],['coffeetable',.25,1.875]];},
  row(t,count,at,o={}){return this.group(t==='sofa'?this.seating(o):[[t,0,0,o]],count,at);},
  repeat(spec){return {...spec,spread:true};},
  racks(count=16,o={}){return {...this.group([['metalshelf',0,0,{seed:7,...o}]],count,[.08,0],[],[0,0,1,1]),role:'rack',spread:true,pitch:[40,56]};},
  reception(at=[.12,.2]){return this.group([['reception',0,0],['chair',.875,-2.125]],1,at,[[['counter',0,0],['chair',.75,-1.875]]]);},
  role(t){return t==='plant'?'corner':t==='metalshelf'?'rack':/^(shelf|cabinet|archcab|medshelf|locker|ftower|cooler|ticket|lamp|bin|cookline|fridge)$/.test(t)?'wall':
    /^(desk|pcdesk|bigdesk|reception)$/.test(t)?'work':'rows';},
  area(spec){if(spec.zone)return spec.zone;
    const role=spec.role||this.role(spec.items[0][0]),[x]=spec.at;
    if(role==='corner'||role==='rack')return [0,0,1,1];
    if(role==='wall')return [x>.7?.5:0,0,x<.3?.75:1,1];
    return [.02,.02,.98,.96];
  },
  theme(d){
    const named={'廉潔大廳':'lobby','通關記錄核對室':'office','家長接待室':'waiting','求職支援室':'counter','報案跟進室':'office',
      '護理諮詢室':'clinic','核數準備室':'office','訂位接待室':'counter','資金核對室':'office','防災協調室':'meeting',
      '訪客登記室':'counter','跨境協查室':'screens','程序核對室':'meeting','圖則覆核室':'drafting','批文覆核室':'office'};
    if(named[d.n])return named[d.n];
    if(d.k==='storage'&&/病歷|教務|資料|證物|檔案|清單/.test(d.n))return 'archive';
    if(!d.k&&/辦公室|書房|密室/.test(d.n))return 'exec';
    return d.k;
  },
  office(w,h,d){return {wall:[['whiteboard',1,-1],['clock',w-2,-1]],groups:[
    this.repeat(this.group(this.station(/教員/.test(d.n)?'desk':'pcdesk'),6)),
    this.row('cabinet',3,[.8,.05]),this.group([['printer',0,0],['cabinet',1.75,0]],1,[.75,.65])]};},
  personalOffice(){return {wall:[],groups:[
    this.group(this.station('desk'),1,[.75,.4],[],[.59,.12,1,.92]),
    this.group(this.seating({c:'#536f68'}),1,[.2,.48],[],[0,.28,.47,.94]),
    this.group([['shelf',0,0]],1,[.3,0],[],[0,0,.47,.4])]};},
  classroom(w,h){return {wall:[['blackboard',w/2-1.75,-1],['clock',w-2,-1]],groups:[
    this.group(this.station('desk'),1,[.12,.08]),this.repeat(this.row('sdesk',18,[.15,.4])),this.row('shelf',2,[.85,.05])]};},
  counter(w,h,d){return {wall:[['sign',1,-1],['clock',w-2,-1]],groups:[
    this.reception(),this.repeat(this.row('seats',3,[.12,.65])),this.row('cabinet',2,[.85,.05]),
    ...(/招生|訂位/.test(d.n)?[]:[this.row('ticket',1,[.9,.75])])]};},
  waiting(w,h){return {wall:[['tv',1,-1],['clock',w-2,-1]],groups:[
    this.repeat(this.row('seats',6,[.12,.45])),this.reception([.7,.12]),this.row('cooler',1,[.9,.8]),this.row('ticket',1,[.85,.1])]};},
  archive(){return {wall:[],groups:[this.racks(),this.row('archcab',2,[.85,.05])]};},
  lounge(w,h){return {wall:[['tv',1,-1],['window',w-3,-1]],groups:[
    this.repeat(this.row('sofa',3,[.15,.3],{c:'#567477'})),this.row('cooler',1,[.85,.1]),this.row('shelf',1,[.85,.75])]};},
  storage(w,h,d){return {wall:[],groups:[
    this.repeat(this.row('cargostack',6,[.12,.4],{material:/器材/.test(d.n)?'metal':'plastic'})),
    this.racks(4,{v:'bins'}),...(/行李/.test(d.n)?[this.row('baggagecart',2,[.7,.65])]:[])]};},
  xray(){return {wall:[['sign',1,-1,{c:'#2a8a4a'}]],groups:[
    this.group([['xray',0,0],['baggagecart',3.75,0]],1,[.15,.25],[[['xray',0,0]]]),
    this.row('baggagecart',2,[.7,.5]),this.row('seats',2,[.15,.8])]};},
  locker(){return {wall:[['clockin',1,-1]],groups:[
    this.repeat(this.group([['locker',0,0],['locker',1,0],['locker',2,0],['bench',.375,2]],3,[.1,.1]))]};},
  screens(w,h,d){return {wall:[['cctv',1,-1,{v:/預報/.test(d.n)?'sat':'',a:'#3aca6a'}]],groups:[
    this.repeat(this.group(this.station('pcdesk',{a:'#3aca6a'}),6)),this.row('cabinet',3,[.85,.05])]};},
  clinic(w,h){return {wall:[['window',w-3,-1]],groups:[
    this.repeat(this.row('carebay',2,[.65,.3])),this.group(this.station('desk',{c:'#c0d4d1',c2:'#80aaa5'}),1),
    this.row('medshelf',2,[.1,.05]),this.row('bin',1,[.9,.85])]};},
  pharmacy(w,h){return {wall:[['clock',w-2,-1]],groups:[this.repeat(this.row('dispensary',2,[.1,.3])),
    this.row('medshelf',4,[.1,.05]),this.row('seats',2,[.1,.75]),this.row('fridge',1,[.9,.05])]};},
  home(w,h){return {wall:[['window',w-3,-1],['tv',1,-1]],groups:[
    this.group([['bed',0,0,{c:'#c87a5a'}],['cabinet',2,0]],1,[.75,.2]),
    this.row('sofa',1,[.12,.55]),this.group([['mahjong',0,0],['chair',.5,-1.875],['chair',.5,1.25]],1,[.6,.65])]};},
  dining(){return {wall:[['window',1,-1,{v:'sea'}]],groups:[
    this.repeat(this.group([['rtable',0,0],['chair',1,-2.125],['chair',1,1.25]],5,[.15,.25],[[['tablepair',0,0,{v:'dining'}]]])),this.row('fscreen',1,[.85,.05])]};},
  kitchen(w,h){return {wall:[['window',w-3,-1]],groups:[this.row('cookline',2,[.1,.05]),
    this.row('fridge',2,[.9,.05]),this.repeat(this.row('prepbench',3,[.1,.5])),this.row('bin',1,[.9,.85])]};},
  exec(w,h){return {wall:[['scroll',1,-1],['window',w-3,-1,{v:'sea'}]],groups:[
    this.group(this.station('bigdesk'),1,[.25,.2],[this.station('desk',{c:'#4a2a16'})]),
    this.row('sofa',1,[.2,.65],{c:'#5a3a2a'}),this.row('shelf',2,[.8,.05])]};},
  hall(w,h){return {wall:[['sign',w/2-1,-1]],groups:[this.reception([.12,.15]),
    this.repeat(this.row('seats',4,[.1,.6])),this.row('ticket',1,[.85,.05])]};},
  drafting(w,h){return {wall:[['blueprint',1,-1],['blueprint',w-4,-1]],groups:[
    this.repeat(this.group(this.station('desk',{c:'#a8a8b4',c2:'#1e4a8a'}),3)),this.row('model',1,[.65,.55]),this.row('cabinet',2,[.85,.05])]};},
  meeting(){const small=[['desk',0,0,{v:'bare',c:'#877058'}],['chair',.625,-1.5],['chair',.625,1.25]],
    long=[['meetingtable',0,0],['chair',.5,-1.875],['chair',2.25,-1.875],['chair',.5,1.25],['chair',2.25,1.25]];
    return {wall:[['whiteboard',1,-1]],groups:[this.group(long,1,[.3,.4],[small,[['tablepair',0,0]]]),this.row('cabinet',2,[.9,.05])]};},
  court(w,h){return {wall:[['emblem',w/2-.75,-1]],groups:[this.row('podium',1,[.4,.05]),
    this.group(this.station('desk',{c:'#4a2a16'}),2,[.1,.2]),this.repeat(this.row('bench',6,[.1,.65]))]};},
  secret(){return {wall:[],groups:[this.racks(8),this.row('archcab',2,[.85,.05])]};},
  lobby(){return {wall:[],groups:[
    {...this.reception([.48,.35]),zone:[.45,.28,.68,.8]},
    this.group([['seats',0,0,{c:'#63847d'}]],4,[.1,.42],[],[.02,.3,.25,.85]),
    this.group([['seats',0,0,{c:'#63847d'}]],3,[.56,.65],[],[.45,.3,.68,.85]),
    this.group([['cooler',0,0]],1,[.65,.35],[],[.45,.28,.68,.85])]};}
};

function place(room,t,tx,ty,o){
  // Floor hatches are geometry fixtures, not a new character/sprite family.
  const P=PROPS[t]||(t==='trapdoor'?{flat:1}:null);if(!P)return null;o=o||{};
  let spr;
  if(t==='trapdoor'&&!PROPS[t]){
    spr=mk(32,32);const g=spr.getContext('2d');
    R(g,0,0,32,32,'#161e21');R(g,2,2,28,28,'#796443');
    for(let i=0;i<4;i++){R(g,4,4+i*6,24,5,'#9b8054');R(g,4,4+i*6,24,1,'#baa078');}
    R(g,5,3,3,26,'#444d4c');R(g,24,3,3,26,'#444d4c');R(g,17,16,5,3,'#d9c28d');
  }else spr=propSprite(t,o);
  const w=spr.width,h=spr.height,x=Math.round((room.ox+tx)*T);
  const y=P.wall?room.oy*T-2-h:P.flat?Math.round((room.oy+ty)*T):Math.round((room.oy+ty+1)*T)-h;
  const p={t,x,y,w,h,spr,o,wall:!!P.wall,flat:!!P.flat,room:room.k};
  if(P.solid&&!P.flat)p.sb=[x+P.solid[0],y+P.solid[1],P.solid[2],P.solid[3]];
  p.by=p.sb?p.sb[1]+p.sb[3]:y+h;return p;
}

// Shared by layout placement and the live map: all geometry has real tile collision.
// shape/voids/outline/walls/openings use room-local TILE coordinates; floorCells
// on M.rooms use absolute TILE coordinates for fog/minimap clipping.
function mapGeometry(tpl,def){
  const W=tpl.W,H=tpl.H,N=W*H,tiles=new Uint8Array(N),rid=new Array(N).fill(null),links=tpl.links||def.links||[];
  const M={W,H,tiles,rid,tpl,def,rooms:{},props:[],links,link:links};
  for(const k in tpl.rooms){
    if(!def.rooms[k])continue;
    const [rx,ry,rw,rh]=tpl.rooms[k],shape=tpl.shapes?.[k]||{};
    const r=M.rooms[k]={k,x:rx,y:ry,w:rw,h:rh,ox:rx+1,oy:ry+2,ww:rw-2,wh:rh-3,d:def.rooms[k],
      shape:shape.kind||'rect',voids:shape.voids||[],outline:shape.outline||[[0,0],[rw,0],[rw,rh],[0,rh]],
      walls:shape.walls||[],openings:shape.openings||[],subspaces:shape.subspaces||[],floorCells:[]};
    const inside=(x,y)=>x>=0&&y>=0&&x<rw&&y<rh&&!r.voids.some(([a,b,w,h])=>x>=a&&x<a+w&&y>=b&&y<b+h);
    for(let y=0;y<rh;y++)for(let x=0;x<rw;x++){
      if(!inside(x,y))continue;
      const i=(ry+y)*W+rx+x,edge=!inside(x-1,y)||!inside(x+1,y)||!inside(x,y-1)||!inside(x,y+1);
      if(edge){if(!tiles[i])tiles[i]=2;}else{tiles[i]=1;rid[i]=k;}
    }
    for(const [x,y] of r.walls){const i=(ry+y)*W+rx+x;if(tiles[i]===1){tiles[i]=2;rid[i]=k;}}
  }
  const doors=new Map();
  const setDoor=(x,y)=>{
    if(!Number.isInteger(x)||!Number.isInteger(y)||x<0||y<0||x>=W||y>=H)return;
    const i=y*W+x;
    doors.set(i,[x,y]);tiles[i]=1;
    rid[i]=(x>0&&rid[i-1])||(x<W-1&&rid[i+1])||(y>0&&rid[i-W])||(y<H-1&&rid[i+W])||tpl.spawnRoom||Object.keys(M.rooms)[0];
  };
  [...(tpl.doors||[]),...(def.openDoors||[])].forEach(([x,y])=>setDoor(x,y));
  if(tpl.secret&&def.secretOpen&&M.rooms.X)tpl.secret.forEach(([x,y])=>setDoor(x,y));
  M.doors=Array.from(doors.values());
  M.isDoor=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&doors.has(y*W+x);
  M.linkAt=(x,y)=>links.find(l=>l.cells.some(([a,b])=>a===x&&b===y));
  for(let y=1;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x;if(tiles[i]===1&&tiles[i-W]===2&&!M.isDoor(x,y))tiles[i]=3;}
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(tiles[y*W+x]===1&&M.rooms[rid[y*W+x]])M.rooms[rid[y*W+x]].floorCells.push([x,y]);
  return M;
}

function buildMap(tpl,def){
  const M=mapGeometry(tpl,def),{W,H,tiles,links}=M;
  const keep=(tpl.keep||[]).map(([x,y])=>[x*T,y*T]);
  (def.reserve||[]).forEach(p=>keep.push(p));
  if(tpl.spawn)keep.push([tpl.spawn[0]*T,tpl.spawn[1]*T]);
  // Routed reservations replace the old two-tile cross through every room.
  for(const [x,y] of M.doors.concat(...links.map(l=>l.cells)))keep.push([(x+.5)*T,(y+.5)*T]);
  for(const s of def.stairs||[]){const r=M.rooms[s.r];if(r)keep.push([(r.ox+s.x)*T,(r.oy+s.y)*T]);}
  for(const n of def.npcs||[]){const r=M.rooms[n.r];if(r)keep.push([(r.ox+n.x+.5)*T,(r.oy+n.y+.8)*T]);}
  // Evidence keeps its object identity, spot reference, coordinates and collision footprint.
  // Only swap equal-sized artwork: interaction routes were reserved against these very boxes.
  (def.extra||[]).forEach(p=>{
    const d=M.rooms[p.room]?.d,theme=d&&FURN.theme(d);
    if(p.t==='shelf'&&(theme==='archive'||theme==='secret')&&!p.spot?.secret)
      p.spr=propSprite('metalshelf',{seed:p.o?.seed||7});
    if(p.t==='crate')p.spr=propSprite('crate',{material:/器材/.test(d?.n)?'metal':'plastic',...(/廚房/.test(d?.n)?{c:'#5e8a70'}:{})});
    const box=p.sb||[p.x,p.y,p.w,p.h],r=M.rooms[p.room];
    if(p.spot&&r)keep.push(p.wall?[p.x+p.w/2,r.oy*T+12]:[box[0]+box[2]/2,box[1]+box[3]+10]);
    M.props.push(p);
  });
  const overlap=([x,y,w,h],[a,b,c,d],gap=0)=>a<x+w+gap&&x<a+c+gap&&b<y+h+gap&&y<b+d+gap;
  const fixedProps=M.props.filter(p=>p.sb||p.flat&&p.spot),fixed=fixedProps.map(p=>p.sb||[p.x,p.y,p.w,p.h]),accepted=[];
  const onFloor=(box,room)=>{
    const [x,y,w,h]=box;
    for(let ty=Math.floor(y/T);ty<=Math.floor((y+h-.01)/T);ty++)for(let tx=Math.floor(x/T);tx<=Math.floor((x+w-.01)/T);tx++)
      if(tx<0||ty<0||tx>=W||ty>=H||tiles[ty*W+tx]!==1||M.rid[ty*W+tx]!==room)return false;
    return true;
  };
  const fits=p=>{
    if(p.flat)return onFloor([p.x,p.y,p.w,p.h],p.room);
    if(!p.sb)return true;
    const [x,y,w,h]=p.sb;
    const bounds=q=>[q.x,q.y,q.w,q.h];
    return onFloor(p.sb,p.room)&&!fixed.some(box=>overlap(p.sb,box,10))&&
      !fixedProps.some(q=>!q.wall&&!q.flat&&overlap(bounds(p),bounds(q),2))&&
      !accepted.some(q=>overlap(p.sb,q.sb,7)||overlap(bounds(p),bounds(q),2))&&
      !keep.some(([kx,ky])=>kx>x-7&&kx<x+w+7&&ky>y-6&&ky<y+h+10);
  };
  const bounds=p=>[p.x,p.y,p.w,p.h];
  const envelope=(props,ground=false)=>{
    const x=Math.min(...props.map(p=>p.x)),y=Math.min(...props.map(p=>ground?p.sb[1]:p.y));
    return [x,y,Math.max(...props.map(p=>p.x+p.w))-x,Math.max(...props.map(p=>p.y+p.h))-y];
  };
  const contains=([x,y,w,h],[a,b,c,d])=>a>=x&&b>=y&&a+c<=x+w+.01&&b+d<=y+h+.01;
  const wallAt=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&(tiles[y*W+x]===2||tiles[y*W+x]===3);
  const backed=(p,side)=>{
    const [x,y,w,h]=p.sb,horizontal=side==='n'||side==='s';
    const edge=side==='n'?y:side==='s'?y+h:side==='w'?x:x+w,low=side==='n'||side==='w';
    const line=low?Math.floor(edge/T):Math.ceil(edge/T),gap=low?edge-line*T:line*T-edge;
    if(gap>8)return false;
    const start=horizontal?p.x:y,end=horizontal?p.x+p.w:y+h;
    for(let i=Math.floor(start/T);i<=Math.floor((end-.01)/T);i++)
      if(!wallAt(horizontal?i:line-(low?1:0),horizontal?line-(low?1:0):i))return false;
    return true;
  };
  let groupId=0;
  for(const r of Object.values(M.rooms)){
    const theme=FURN.theme(r.d),plan=theme&&FURN[theme]?FURN[theme](r.ww,r.wh,r.d):{wall:[],groups:[]};
    // Theme suites replace legacy loose benches, crates and file piles. Keep authored wall
    // decoration, rugs and distinctive accents, but only fit accents AFTER working furniture.
    const authored=(r.d.p||[]).filter(([t])=>!theme||PROPS[t]?.wall||PROPS[t]?.flat||/^(sandbag|tank|plant|lamp)$/.test(t));
    const used=new Set(),groups=[...plan.groups],blocks=[];
    let occupied=fixedProps.filter(p=>p.room===r.k).reduce((sum,p)=>sum+(p.sb?p.sb[2]*p.sb[3]:p.w*p.h),0);
    const density=theme==='archive'||theme==='secret'?.48:theme==='storage'?.42:.34;
    const budget=r.floorCells.length*T*T*density;
    authored.forEach((v,i)=>{
      if(used.has(i)||PROPS[v[0]]?.wall||v[0]==='chair'||v[0]==='coffeetable')return;
      const items=[v],alternatives=[];used.add(i);
      const desk=/^(desk|pcdesk|bigdesk)$/.test(v[0]);
      if(desk||/^(rtable|mahjong)$/.test(v[0])){
        authored.forEach((q,j)=>{
          if(!used.has(j)&&q[0]==='chair'&&q[1]>=v[1]-.5&&q[1]<=v[1]+PROPS[v[0]].w/T&&Math.abs(q[2]-v[2])<=2.25){
            items.push(q);used.add(j);
          }
        });
        if(desk){
          const station=FURN.station(v[0],v[3]);station[1][3]=items[1]?.[3];
          if(items.length===1)items.push(['chair',v[1]+station[1][1],v[2]+station[1][2]]);
          else alternatives.push(station);
          if(v[0]==='bigdesk')alternatives.push(FURN.station('desk',v[3]||{c:'#4a2a16'}));
        }
      }
      let relative=items.map(([t,x,y,o])=>[t,x-v[1],y-v[2],o]);
      if(v[0]==='sofa'){
        relative=FURN.seating(v[3]);
        const j=authored.findIndex((q,j)=>!used.has(j)&&q[0]==='coffeetable'&&Math.abs(q[1]-v[1])<2&&q[2]>v[2]&&q[2]-v[2]<3);
        if(j>=0){
          const q=authored[j],dx=q[1]-v[1],dy=q[2]-v[2];
          if(Math.abs(dx-relative[1][1])<.125&&dy>=relative[1][2]&&dy<=relative[1][2]+.5)relative[1]=['coffeetable',dx,dy,q[3]];
          else relative[1][3]=q[3];
          used.add(j);
        }
      }
      groups.push({...FURN.group(relative,1,[Math.max(0,Math.min(1,v[1]/r.ww)),Math.max(0,Math.min(1,v[2]/r.wh))],alternatives),origin:[v[1],v[2]],authored:true});
    });
    for(const v of authored.filter(v=>PROPS[v[0]]?.wall).concat(plan.wall)){
      const p=place(r,...v);if(!p)continue;
      if(M.props.some(q=>q.wall&&q.room===r.k&&q.x<p.x+p.w+3&&p.x<q.x+q.w+3))continue;
      p.auto=1;M.props.push(p);
    }
    // Clip subspaces, rather than using them as soft scoring hints. Coordinates here are pixels.
    const spaces=(r.subspaces.length?r.subspaces:[[1,2,r.ww,r.wh]]).map(([x,y,w,h])=>{
      const left=Math.max(0,x-1),top=Math.max(0,y-2),right=Math.min(r.ww,x+w-1),bottom=Math.min(r.wh,y+h-2);
      return [(r.ox+left)*T,(r.oy+top)*T,(right-left)*T,(bottom-top)*T];
    }).filter(s=>s[2]>0&&s[3]>0);
    // Only real horizontal wall runs can host wall-backed furniture or corner plants.
    const runs=[];
    for(const side of ['n','s']){
      let last=null;
      for(const [x,y] of r.floorCells){
        if(!wallAt(x,y+(side==='n'?-1:1)))continue;
        if(last&&last.y===y*T&&last.x+last.w===x*T)last.w+=T;
        else{last={x:x*T,y:y*T,w:T,side};runs.push(last);}
      }
    }
    for(const spec of groups){
      const role=spec.role||FURN.role(spec.items[0][0]);
      if(role==='corner'&&!spec.authored)continue;
      // Rugs remain exactly authored; they are walkable, not relocatable furniture.
      if(PROPS[spec.items[0][0]]?.flat){
        if(spec.origin){const p=place(r,spec.items[0][0],...spec.origin,spec.items[0][3]);
          if(p&&fits(p)&&!fixed.some(b=>overlap(bounds(p),b))){p.auto=1;p.authored=true;M.props.push(p);}}
        continue;
      }
      const [a,b,c,d]=FURN.area(spec),zone=[(r.ox+a*r.ww)*T,(r.oy+b*r.wh)*T,(c-a)*r.ww*T,(d-b)*r.wh*T];
      const want=[(r.ox+spec.at[0]*r.ww)*T,(r.oy+spec.at[1]*r.wh)*T];
      const areas=spaces.map(([x,y,w,h])=>{
        const left=Math.max(x,zone[0]),top=Math.max(y,zone[1]);
        return [left,top,Math.min(x+w,zone[0]+zone[2])-left,Math.min(y+h,zone[1]+zone[3])-top];
      }).filter(s=>s[2]>=T&&s[3]>=T);
      const distance=([x,y,w,h])=>(Math.max(x,Math.min(want[0],x+w))-want[0])**2+(Math.max(y,Math.min(want[1],y+h))-want[1])**2;
      areas.sort((a,b)=>distance(a)-distance(b)||b[2]*b[3]-a[2]*a[3]);
      let placed=0;
      for(const area of areas){
        const beforeArea=placed;
        for(const items of [spec.items,...spec.alternatives]){
          const base=items.map(v=>place(r,...v));if(base.some(p=>!p||!p.sb))continue;
          const ground=envelope(base,true),visual=envelope(base),candidates=[],wall=role==='wall'||role==='corner';
          const pitchX=spec.pitch?.[0]||Math.ceil((ground[2]+(wall?.5:1.25)*T)/(T/2))*T/2;
          const pitchY=spec.pitch?.[1]||Math.ceil((visual[3]+1.25*T)/(T/2))*T/2;
          const limit=spec.count;
          if(wall){
            for(const run of runs){
              if(role!=='corner'&&run.side!=='n')continue;
              const y=run.side==='n'?run.y+2-base[0].sb[1]:run.y+T-2-base[0].sb[1]-base[0].sb[3];
              const left=Math.max(run.x,area[0]),right=Math.min(run.x+run.w,area[0]+area[2])-ground[2];
              if(role==='corner'){
                for(const x of [run.x,run.x+run.w-ground[2]])candidates.push({x:x-ground[0],y});
              }else if(spec.at[0]>.5){
                for(let x=Math.floor(right/(T/2))*T/2;x>=left;x-=T/2)candidates.push({x:x-ground[0],y});
              }else{
                for(let x=Math.ceil(left/(T/2))*T/2;x<=right;x+=T/2)candidates.push({x:x-ground[0],y});
              }
            }
          }else{
            // Tall racks project north of their feet, just like wall cabinets. Their bases
            // must stay inside the subspace; the upper shelves need not consume floor area.
            const extent=role==='rack'?ground:visual;
            const left=Math.ceil((area[0]-extent[0])/(T/2))*T/2,top=Math.ceil((area[1]-extent[1])/(T/2))*T/2;
            for(let y=top;y+extent[1]+extent[3]<=area[1]+area[3];y+=T/2)
              for(let x=left;x+extent[0]+extent[2]<=area[0]+area[2];x+=T/2)candidates.push({x,y});
          }
          candidates.sort((a,b)=>Math.abs(a.y+ground[1]-want[1])-Math.abs(b.y+ground[1]-want[1])||
            Math.abs(a.x+ground[0]-want[0])-Math.abs(b.x+ground[0]-want[0]));
          if(spec.origin)candidates.unshift({x:Math.round(spec.origin[0]*T),y:Math.round(spec.origin[1]*T)});
          if(role==='rack'){
            // Pick a productive grid phase before committing the first bay. A route crossing
            // one early slot must not reduce a whole archive to a single accidental row.
            const phases=new Map();
            for(const pos of candidates){
              const {x,y}=pos,b=base[0],p={...b,x:b.x+x,y:b.y+y,sb:[b.sb[0]+x,b.sb[1]+y,b.sb[2],b.sb[3]]};
              const box=envelope([p],true),access=[box[0],box[1]+box[3],box[2],T];
              if(!contains(area,box)||!fits(p)||!onFloor(access,r.k)||fixed.some(b=>overlap(access,b,2))||
                blocks.some(q=>overlap(box,q.box,q.role==='rack'?7:T)||overlap(box,q.access)||overlap(access,q.box)))continue;
              const key=(x%pitchX)+':'+(y%pitchY);
              if(!phases.has(key))phases.set(key,{points:[],rows:new Set()});
              const phase=phases.get(key);phase.points.push(pos);phase.rows.add(y);
            }
            const best=Array.from(phases.values()).sort((a,b)=>(b.points.length+b.rows.size)-(a.points.length+a.rows.size)||b.rows.size-a.rows.size)[0];
            if(best)candidates.splice(0,candidates.length,...best.points);
          }
          let lattice=null;
          for(const {x,y} of candidates){
            const dx=Math.round(x),dy=Math.round(y);
            if(lattice&&((dx-lattice[0])%pitchX||(wall?dy!==lattice[1]:(dy-lattice[1])%pitchY)))continue;
            const props=base.map(p=>({...p,x:p.x+dx,y:p.y+dy,by:p.by+dy,
              sb:[p.sb[0]+dx,p.sb[1]+dy,p.sb[2],p.sb[3]]}));
            const box=envelope(props,true),access=[box[0],role==='corner'&&backed(props[0],'s')?box[1]-T:box[1]+box[3],box[2],T];
            if(!contains(area,wall||role==='rack'?box:envelope(props))||!onFloor(box,r.k)||!onFloor(access,r.k)||!props.every(fits))continue;
            if(role==='wall'&&!props.filter(p=>FURN.role(p.t)==='wall').every(p=>backed(p,'n')))continue;
            if(role==='corner'&&!((backed(props[0],'n')||backed(props[0],'s'))&&(backed(props[0],'w')||backed(props[0],'e'))))continue;
            if(props.some((p,i)=>props.slice(i+1).some(q=>overlap(p.sb,q.sb)||overlap(bounds(p),bounds(q)))))continue;
            // Preserve legroom and front access as a whole, so later decor cannot fill the gaps.
            if(fixed.some(b=>overlap(box,b,10)||overlap(access,b,2))||
              blocks.some(q=>overlap(box,q.box,role==='rack'&&q.role==='rack'?7:role==='wall'&&q.role==='wall'?7:T)||overlap(box,q.access)||overlap(access,q.box))||
              keep.some(([kx,ky])=>kx>box[0]-7&&kx<box[0]+box[2]+7&&ky>box[1]-6&&ky<box[1]+box[3]+10)||
              occupied+box[2]*box[3]>budget)continue;
            const id=r.k+':'+(++groupId);
            for(const p of props){p.auto=1;p.furnGroup=id;p.authored=!!spec.authored;M.props.push(p);accepted.push(p);}
            // Choose the grid phase around reserved routes, then keep every repetition aligned.
            lattice=[dx,dy];
            blocks.push({box,access,role});occupied+=box[2]*box[3];placed++;
            if(placed>=limit)break;
          }
          if(placed>beforeArea)break; // One size and one aligned grid within each functional zone.
        }
        if(placed>=spec.count||placed&&!spec.spread)break;
      }
    }
  }
  const fixedWall=M.props.filter(p=>p.wall&&!p.auto);
  for(const p of fixedWall){
    const r=M.rooms[p.room],fy=r.oy-1;
    const fits=x=>x>=(r.x+1)*T&&x+p.w<=(r.x+r.w-1)*T&&
      !links.some(l=>l.cells.some(([dx,dy])=>dy===r.y&&dx*T<x+p.w&&(dx+1)*T>x))&&
      !fixedWall.some(q=>q!==p&&q.room===p.room&&q.x<x+p.w+2&&x<q.x+q.w+2)&&
      Array.from({length:Math.ceil(p.w/T)},(_,i)=>Math.floor(x/T)+i).every(dx=>tiles[fy*W+dx]===3);
    if(fits(p.x))continue;
    for(let offset=1;offset<r.w;offset++){
      const x=[p.x-offset*T,p.x+offset*T].find(fits);
      if(x===undefined)continue;
      if(p.sb)p.sb[0]+=x-p.x;
      p.x=x;break;
    }
  }
  M.props=M.props.filter(p=>{if(!p.wall)return true;const fy=M.rooms[p.room].oy-1;
    if(p.auto&&fixedWall.some(q=>q.room===p.room&&q.x<p.x+p.w+2&&p.x<q.x+q.w+2))return false;
    for(let x=Math.floor(p.x/T);x<=Math.floor((p.x+p.w-1)/T);x++)if(tiles[fy*W+x]!==3)return false;return true;});
  M.props.forEach(p=>{if(p.wall&&p.auto)p.sb=null;});
  drawLayer(M);return M;
}

const WALL_COLOR='#bdc5b8',WALL_EDGE='#384c45';
function drawLayer(M){
  const {W,H,tiles,rid}=M,c=M.layer||mk(W*T,H*T),g=c.getContext('2d');M.layer=c;
  R(g,0,0,W*T,H*T,'#05050a');
  let seed=3;
  for(const k in M.rooms){const r=M.rooms[k];floorFill(g,r.d.fl,(r.x+1)*T,(r.y+1)*T,(r.w-2)*T,(r.h-2)*T,seed+=17);}
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x;
    if(!tiles[i])R(g,x*T,y*T,T,T,'#05050a');
    if(tiles[i]===1&&M.isDoor(x,y)){const r=M.rooms[rid[i]];floorFill(g,r?r.d.fl:'tile:#555',x*T,y*T,T,T,i);R(g,x*T,y*T,T,T,'rgba(0,0,0,.12)');}}
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x,t=tiles[i],X=x*T,Y=y*T;
    if(t===2){const b=y<H-1?tiles[i+W]:0,c0=WALL_COLOR;
      if(b===3||b===1&&!M.isDoor(x,y+1)){R(g,X,Y,T,T,shade(c0,.06));R(g,X,Y,T,2,shade(c0,-.25));R(g,X,Y+2,T,1,shade(c0,.3));R(g,X,Y+9,T,1,shade(c0,-.08));R(g,X+15,Y+3,1,13,shade(c0,-.1));}
      else{R(g,X,Y,T,T,shade(c0,-.12));R(g,X,Y,T,1,shade(c0,.18));if(y<H-1&&tiles[i+W]===1)R(g,X,Y+14,T,2,shade(c0,-.25));}}
    else if(t===3){const c0=WALL_COLOR;R(g,X,Y,T,T,c0);R(g,X,Y+4,T,1,shade(c0,.22));R(g,X,Y+5,T,1,shade(c0,-.18));R(g,X+15,Y,1,12,shade(c0,-.08));R(g,X,Y+12,T,4,shade(c0,-.25));R(g,X,Y+12,T,1,shade(c0,-.15));}
    else if(t===1){if(y>0&&tiles[i-W]===3){R(g,X,Y,T,2,WALL_EDGE);R(g,X,Y+2,T,3,'rgba(0,0,0,.22)');}if(x>0&&tiles[i-1]===2){R(g,X,Y,2,T,WALL_EDGE);R(g,X+2,Y,2,T,'rgba(0,0,0,.16)');}if(x<W-1&&tiles[i+1]===2)R(g,X+14,Y,2,T,WALL_EDGE);if(y<H-1&&tiles[i+W]===2)R(g,X,Y+14,T,2,WALL_EDGE);}
  }
  M.props.filter(p=>p.flat&&!(p.room==='X'&&!M.def.secretOpen)).forEach(p=>g.drawImage(p.spr,p.x,p.y));
  M.props.filter(p=>p.wall&&!(p.room==='X'&&!M.def.secretOpen)).forEach(p=>{g.drawImage(p.spr,p.x,p.y);R(g,p.x+1,p.y+p.h,p.w-2,1,'rgba(0,0,0,.3)');});
  const X=M.rooms.X;
  if(X&&!M.def.secretOpen){R(g,(X.x+1)*T,(X.y+1)*T,(X.w-2)*T,(X.h-2)*T,'#05050a');}
}

function solidAt(M,x,y){
  const tx=Math.floor(x/T),ty=Math.floor(y/T);
  if(tx<0||ty<0||tx>=M.W||ty>=M.H)return true;
  if(M.tiles[ty*M.W+tx]!==1)return true;
  for(const p of M.props)if(p.sb){const [a,b,w,h]=p.sb;if(x>=a&&x<a+w&&y>=b&&y<b+h)return true;}
  return false;
}
function roomAt(M,x,y){const tx=Math.floor(x/T),ty=Math.floor(y/T);return M.rid[ty*M.W+tx];}

// View: world drawn to low-res buffer, text drawn crisp on the full-res canvas.
const VIEW={scale:3,vw:480,vh:270,dpr:1,camx:0,camy:0};
const BUF=mk(480,270),BG=BUF.getContext('2d');
const DARK_MASK=mk(480,270),DARK_BG=DARK_MASK.getContext('2d');
function resizeView(cv){
  const W=innerWidth,H=innerHeight,dpr=Math.min(2,devicePixelRatio||1);
  const s=Math.max(1,Math.round(Math.min(W/440,H/250)));
  VIEW.scale=s;VIEW.dpr=dpr;VIEW.vw=Math.ceil(W/s);VIEW.vh=Math.ceil(H/s);
  BUF.width=VIEW.vw;BUF.height=VIEW.vh;cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);
}
function setCamera(fx,fy){
  VIEW.camx=Math.round(fx-VIEW.vw/2);
  VIEW.camy=Math.round(fy-VIEW.vh/2);
}
const LIGHT_RADIUS=5*T;
const LIGHT_BEAM=(()=>{const size=LIGHT_RADIUS*2,c=mk(size,size),g=c.getContext('2d'),im=g.createImageData(size,size);const smooth=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);};for(let y=0;y<size;y++)for(let x=0;x<size;x++){const dx=x-LIGHT_RADIUS,dy=y-LIGHT_RADIUS,d=Math.hypot(dx,dy)/LIGHT_RADIUS,a=Math.abs(Math.atan2(dy,dx))/(Math.PI/6),i=(y*size+x)*4;im.data[i]=255;im.data[i+1]=245;im.data[i+2]=211;im.data[i+3]=Math.round(255*(1-smooth(.4,1,d))*(1-smooth(.55,1,a)));}g.putImageData(im,0,0);return c;})();
function beamDistance(M,x,y,angle,max=LIGHT_RADIUS){for(let d=0;d<=max;d+=3){const tx=Math.floor((x+Math.cos(angle)*d)/T),ty=Math.floor((y+Math.sin(angle)*d)/T);if(tx<0||ty<0||tx>=M.W||ty>=M.H||M.tiles[ty*M.W+tx]!==1)return d;}return max;}
function beamClip(g,M,light,cx,cy){g.beginPath();g.moveTo(light.x-cx,light.y-cy);for(let i=0;i<=40;i++){const a=light.angle-Math.PI/6+i*Math.PI/120,d=beamDistance(M,light.x,light.y,a);g.lineTo(light.x+Math.cos(a)*d-cx,light.y+Math.sin(a)*d-cy);}g.closePath();g.clip();}
function stampBeam(g,M,light,cx,cy){g.save();beamClip(g,M,light,cx,cy);g.translate(light.x-cx,light.y-cy);g.rotate(light.angle);g.drawImage(LIGHT_BEAM,-LIGHT_RADIUS,-LIGHT_RADIUS);g.restore();}
function renderWorld(M,dyn,light){
  const g=BG,{camx,camy,vw,vh}=VIEW;
  g.imageSmoothingEnabled=false;R(g,0,0,vw,vh,'#000');
  g.drawImage(M.layer,-camx,-camy);
  const list=M.props.filter(p=>!p.wall&&!p.flat&&!(p.room==='X'&&!M.def.secretOpen)&&p.x+p.w>camx&&p.x<camx+vw&&p.y+p.h>camy&&p.y<camy+vh).concat(dyn);
  list.sort((a,b)=>a.by-b.by);
  for(const p of list){
    if(p.draw){p.draw(g,camx,camy);continue;}
    if(p.sb)R(g,p.sb[0]-camx+1,p.sb[1]+p.sb[3]-camy-1,p.sb[2]-2,2,'rgba(0,0,0,.25)');
    g.drawImage(p.spr,p.x-camx,p.y-camy);
    if(p.glow)p.glow(g,camx,camy);
  }
  const darkRooms=Object.values(M.rooms).filter(r=>r.d.dark);
  if(darkRooms.length){
    if(DARK_MASK.width!==vw||DARK_MASK.height!==vh){DARK_MASK.width=vw;DARK_MASK.height=vh;}
    const mask=DARK_BG;
    mask.clearRect(0,0,vw,vh);mask.globalCompositeOperation='source-over';mask.fillStyle='#040410';
    mask.beginPath();
    for(const r of darkRooms)mask.rect((r.x+1)*T-camx,(r.y+1)*T-camy,(r.w-2)*T,(r.h-2)*T);
    mask.fill();
    if(light?.on){mask.save();mask.globalCompositeOperation='destination-out';stampBeam(mask,M,light,camx,camy);mask.restore();}
    g.drawImage(DARK_MASK,0,0);
  }
  if(light?.on){g.save();g.globalCompositeOperation='screen';g.globalAlpha=M.rooms[roomAt(M,light.x,light.y)]?.d.dark ? .3 : .14;stampBeam(g,M,light,camx,camy);g.restore();}
}
function blit(cv){
  const c=cv.getContext('2d');c.imageSmoothingEnabled=false;
  c.setTransform(1,0,0,1,0,0);c.drawImage(BUF,0,0,BUF.width*VIEW.scale*VIEW.dpr,BUF.height*VIEW.scale*VIEW.dpr);
  const v=c.createRadialGradient(cv.width/2,cv.height/2,cv.height*.45,cv.width/2,cv.height/2,cv.height*.95);
  v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.45)');c.fillStyle=v;c.fillRect(0,0,cv.width,cv.height);
  return c;
}
// crisp label in world coords
function label(c,t,wx,wy,col,size,bg){
  const k=VIEW.scale*VIEW.dpr,x=(wx-VIEW.camx)*k,y=(wy-VIEW.camy)*k,fs=Math.round((size||12)*1.5*VIEW.dpr*Math.max(1,VIEW.scale/2.2));
  c.font=fs+'px "Fusion Pixel 12px Proportional TC","PingFang TC",monospace';c.textAlign='center';c.textBaseline='bottom';
  if(bg){const w=c.measureText(t).width+fs*.8;c.fillStyle=bg;c.fillRect(x-w/2,y-fs*1.25,w,fs*1.35);}
  c.fillStyle='#000';c.fillText(t,x+Math.max(1,fs/12),y+Math.max(1,fs/12));c.fillStyle=col||'#fff';c.fillText(t,x,y);
}

const LEVELS=[];function LV(o){LEVELS.push(o);}
const TIER_C={S:'#ffd76a',A:'#ff7a7a',B:'#ffbe5c',C:'#c98aff',D:'#7aa8ff',E:'#5cd9d9',F:'#8be38b'};
