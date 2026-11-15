'use strict';
const T=16;
function R(g,x,y,w,h,c){g.fillStyle=c;g.fillRect(x,y,w,h);}
function shade(hex,f){
  const n=parseInt(hex.slice(1),16);let r=n>>16&255,gg=n>>8&255,b=n&255;
  if(f<0){r*=1+f;gg*=1+f;b*=1+f;}else{r+=(255-r)*f;gg+=(255-gg)*f;b+=(255-b)*f;}
  return'#'+[r,gg,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
}
function rng(s){s=Math.abs(s|0)%2147483647||7;return()=>(s=s*16807%2147483647)/2147483647;}
function mk(w,h){const c=document.createElement('canvas');c.width=Math.max(1,w);c.height=Math.max(1,h);return c;}
const BOOKC=['#a83a3a','#3a6aa8','#3a8a5a','#c8a03a','#7a4aa0','#d06a2a','#2a7a8a','#8a8a8a','#e0d0b0','#5a3a2a'];
const MURAL=new Image();MURAL.src='assets/macau-waterfront.png';
const GAME_ART=new Image(),GEAR_ART=new Image(),ART_CACHE={};
GAME_ART.src='assets/gates-v3.png';GEAR_ART.src='assets/equipment.png';
const FLASHLIGHT_ART=new Image();FLASHLIGHT_ART.src='assets/flashlight-pixel.svg';
function flashlightSprite(){
  return FLASHLIGHT_ART.complete&&FLASHLIGHT_ART.naturalWidth?FLASHLIGHT_ART:null;
}
const HELD_LIGHT={width:12,grip:2};
function drawHeldFlashlight(g,x,y,angle,on){
  const s=flashlightSprite();if(!s)return;
  const w=HELD_LIGHT.width,h=w*s.naturalHeight/s.naturalWidth;
  g.save();g.translate(x,y);g.rotate(angle);g.imageSmoothingEnabled=false;
  g.drawImage(s,-HELD_LIGHT.grip,-h/2,w,h);
  if(on)R(g,w-HELD_LIGHT.grip-2,-2,1,4,'#fff5c4');
  R(g,-1,0,2,2,'#f0c8a0');
  g.restore();
}
function artSprite(type,index){
  const image=type==='gate'?GAME_ART:GEAR_ART,cols=type==='gate'?4:2,key=type+index;
  if(!image.complete||!image.naturalWidth)return null;
  if(ART_CACHE[key])return ART_CACHE[key];
  const c=mk(48,48),g=c.getContext('2d'),s=image.naturalWidth/cols;
  g.imageSmoothingEnabled=false;g.drawImage(image,(index%cols)*s,Math.floor(index/cols)*s,s,s,0,0,48,48);
  const pixels=g.getImageData(0,0,48,48);
  for(let i=0;i<pixels.data.length;i+=4)if(Math.max(pixels.data[i],pixels.data[i+1],pixels.data[i+2])<18)pixels.data[i+3]=0;
  g.putImageData(pixels,0,0);return ART_CACHE[key]=c;
}

function floorFill(g,spec,x0,y0,w,h,seed){
  const [type,c0]=(spec||'tile:#5a5a6a').split(':'),c=c0||'#5a5a6a',r=rng(seed||11);
  if(type==='wood'){
    for(let y=y0,row=0;y<y0+h;y+=6,row++){
      const off=(row%2)*12;
      for(let x=x0-off;x<x0+w;x+=24){R(g,x,y,24,6,shade(c,(r()-.5)*.14));R(g,x,y,1,6,shade(c,-.28));if(r()<.5)R(g,x+4+((r()*14)|0),y+2,3,1,shade(c,-.12));}
      R(g,x0,y+5,w,1,shade(c,-.3));
    }
  }else if(type==='marble'){
    for(let y=y0;y<y0+h;y+=32)for(let x=x0;x<x0+w;x+=32){
      const alt=((x-x0)/32+(y-y0)/32)%2;R(g,x,y,32,32,alt?shade(c,.07):c);
      let vx=x+((r()*28)|0),vy=y;for(let k=0;k<14;k++){R(g,vx,vy,1,2,shade(c,.22));vx+=r()<.5?1:-1;vy+=2;if(vx<x)vx=x;if(vx>x+31)vx=x+31;}
      R(g,x,y,32,1,shade(c,-.2));R(g,x,y,1,32,shade(c,-.2));
    }
  }else if(type==='carpet'){
    R(g,x0,y0,w,h,c);
    for(let y=y0+4;y<y0+h;y+=8)for(let x=x0+((y/8)%2?4:0);x<x0+w;x+=8){R(g,x,y,1,1,shade(c,.14));R(g,x+1,y+1,1,1,shade(c,-.1));}
  }else if(type==='lino'){
    R(g,x0,y0,w,h,c);
    for(let i=0;i<w*h/22;i++)R(g,x0+((r()*w)|0),y0+((r()*h)|0),1,1,shade(c,(r()-.5)*.35));
    for(let y=y0;y<y0+h;y+=32)R(g,x0,y,w,1,shade(c,-.12));
    for(let x=x0;x<x0+w;x+=32)R(g,x,y0,1,h,shade(c,-.12));
  }else if(type==='check'){
    for(let y=y0;y<y0+h;y+=16)for(let x=x0;x<x0+w;x+=16){const alt=((x-x0)/16+(y-y0)/16)%2;R(g,x,y,16,16,alt?shade(c,.55):c);}
  }else if(type==='concrete'){
    R(g,x0,y0,w,h,c);
    for(let i=0;i<w*h/40;i++)R(g,x0+((r()*w)|0),y0+((r()*h)|0),2,1,shade(c,(r()-.5)*.25));
    for(let y=y0;y<y0+h;y+=48)R(g,x0,y,w,1,shade(c,-.18));
  }else{
    for(let y=y0;y<y0+h;y+=16)for(let x=x0;x<x0+w;x+=16){
      const alt=((x-x0)/16+(y-y0)/16)%2;R(g,x,y,16,16,alt?shade(c,.06):c);
      R(g,x,y,16,1,shade(c,-.18));R(g,x,y,1,16,shade(c,-.18));R(g,x+1,y+1,1,1,shade(c,.15));
    }
  }
}

const PROPS={
coffeetable:{w:28,h:14,solid:[0,6,28,8],draw(g){R(g,2,5,24,9,'#302e2a');R(g,0,3,28,7,'#8a6543');R(g,1,3,26,1,'#c3a57b');R(g,2,10,2,4,'#41372c');R(g,24,10,2,4,'#41372c');R(g,10,4,7,3,'#cbd4ce');R(g,18,4,3,3,'#e4d8b5');}},
desk:{w:32,h:22,solid:[0,8,32,14],draw(g,o){const c=o.c||'#8b5a2b',d=shade(c,-.32),l=shade(c,.22);
  R(g,0,6,32,7,c);R(g,0,6,32,1,l);R(g,0,12,32,1,d);R(g,1,13,30,8,d);R(g,2,14,13,6,shade(c,-.15));
  R(g,18,14,12,3,shade(c,-.08));R(g,18,18,12,2,shade(c,-.08));R(g,23,15,3,1,'#e0c880');R(g,23,18,3,1,'#e0c880');
  R(g,1,21,2,1,'#1a1010');R(g,29,21,2,1,'#1a1010');
  if(o.v!=='bare'){R(g,3,7,9,4,'#f4f0e4');R(g,4,8,6,1,'#9a9a9a');R(g,4,9,4,1,'#9a9a9a');R(g,15,7,3,3,'#c84a3a');R(g,15,7,3,1,'#ee7a6a');R(g,21,7,8,4,o.c2||'#3a5a8a');R(g,21,7,8,1,shade(o.c2||'#3a5a8a',.3));}}},
pcdesk:{w:32,h:26,solid:[0,12,32,14],draw(g,o){const c=o.c||'#a8a8b4',d=shade(c,-.35),l=shade(c,.2),a=o.a||'#3f8fd0';
  R(g,9,0,14,10,'#1c1c26');R(g,10,1,12,7,a);R(g,11,2,5,1,shade(a,.55));R(g,11,4,9,1,shade(a,.25));R(g,11,6,6,1,shade(a,.25));R(g,15,10,2,1,'#333');
  R(g,0,10,32,7,c);R(g,0,10,32,1,l);R(g,0,16,32,1,d);R(g,7,11,13,2,'#d8d8e0');R(g,7,12,13,1,'#9a9aa8');R(g,23,11,3,2,'#eee');
  R(g,1,17,30,8,d);R(g,19,18,11,3,shade(c,-.15));R(g,19,22,11,2,shade(c,-.15));R(g,23,19,3,1,'#ddd');R(g,1,25,2,1,'#111');R(g,29,25,2,1,'#111');}},
chair:{w:12,h:16,solid:[1,9,10,6],draw(g,o){const c=o.c||'#3a3a4a',l=shade(c,.2);
  R(g,2,0,8,8,c);R(g,2,0,8,1,l);R(g,3,1,6,5,shade(c,.08));R(g,1,8,10,4,shade(c,.1));R(g,1,8,10,1,l);R(g,5,12,2,2,'#333');R(g,2,14,8,2,'#2a2a2a');}},
shelf:{w:32,h:36,solid:[0,26,32,10],draw(g,o){const c=o.c||'#6b4423',d=shade(c,-.45),r=rng(o.seed||5);
  R(g,0,0,32,36,shade(c,-.2));R(g,0,0,32,2,shade(c,.2));R(g,2,2,28,32,d);
  for(const y0 of [2,13,24]){R(g,1,y0+9,30,2,c);let x=3;
    while(x<29){
      if(o.v==='arch'){R(g,x,y0+2,6,7,'#c9b58a');R(g,x,y0+2,6,1,'#e2d2a8');R(g,x+2,y0+5,2,2,'#a02424');x+=7;continue;}
      if(o.v==='wine'){R(g,x+1,y0+2,2,2,'#2a4a2a');R(g,x,y0+4,4,5,['#5a1a2a','#2a4a2a','#7a5a1a'][(x/5|0)%3]);R(g,x,y0+6,4,1,'#e8e0c0');x+=5;continue;}
      const bw=2+((r()*2)|0),bh=6+((r()*3)|0),col=BOOKC[(r()*BOOKC.length)|0];
      R(g,x,y0+9-bh,bw,bh,col);R(g,x,y0+9-bh,bw,1,shade(col,.3));x+=bw+(r()<.12?1:0);}
  }R(g,0,34,32,2,shade(c,-.5));}},
cabinet:{w:16,h:30,solid:[0,20,16,10],draw(g,o){const c=o.c||'#8a92a0',d=shade(c,-.3);
  R(g,0,0,16,30,d);R(g,1,0,14,29,c);R(g,1,0,14,1,shade(c,.3));
  for(const y of [2,11,20]){R(g,2,y,12,8,shade(c,.1));R(g,2,y+7,12,1,d);R(g,5,y+2,6,2,'#f0f0e8');R(g,6,y+5,4,1,'#3a3a3a');}}},
locker:{w:16,h:32,solid:[0,22,16,10],draw(g,o){const c=o.c||'#46628a',d=shade(c,-.3);
  R(g,0,0,16,32,d);R(g,1,0,14,31,c);R(g,1,0,14,1,shade(c,.3));R(g,8,1,1,30,d);
  for(let y=3;y<10;y+=2){R(g,2,y,5,1,d);R(g,10,y,5,1,d);}
  R(g,6,15,1,4,'#dcdcdc');R(g,10,15,1,4,'#dcdcdc');R(g,3,22,3,2,'#f0f0e0');R(g,11,22,3,2,'#f0f0e0');}},
plant:{w:14,h:24,solid:[3,17,8,7],draw(g,o){
  R(g,3,16,8,8,'#a0522d');R(g,2,15,10,2,'#c06a3a');R(g,4,22,6,2,'#7a3a1a');
  const L=['#2a7a3a','#3a9a4a','#1f5f2f'];[[6,1],[2,4],[9,3],[4,8],[8,7],[1,10],[10,10],[6,11]].forEach(([x,y],i)=>{R(g,x,y,4,5,L[i%3]);R(g,x+1,y,2,1,'#5aba5a');});R(g,6,12,2,4,'#3a5a2a');}},
board:{w:32,h:20,wall:1,draw(g,o){R(g,0,0,32,20,'#5a3a1a');R(g,1,1,30,18,'#c8a26a');
  [[3,3,8,6,'#fff6a0'],[13,2,7,8,'#f0f0f0'],[22,4,7,6,'#a0d0ff'],[5,11,9,6,'#ffc0c0'],[18,12,10,5,'#f0f0f0']].forEach(([x,y,w,h,c])=>{R(g,x,y,w,h,c);R(g,x+1,y+2,w-2,1,'#9a9a9a');R(g,x+w/2|0,y,1,1,'#d02020');});}},
whiteboard:{w:36,h:22,wall:1,draw(g,o){R(g,0,0,36,22,'#9aa0a8');R(g,1,1,34,18,'#f6f8fa');R(g,0,20,36,2,'#7a8088');
  R(g,3,4,14,1,'#3a5ad0');R(g,3,7,10,1,'#3a5ad0');R(g,20,4,12,8,'#d03a3a');R(g,21,5,10,6,'#f6f8fa');R(g,22,8,3,2,'#d03a3a');R(g,26,6,4,4,'#d03a3a');R(g,3,11,12,1,'#2a2a2a');R(g,3,14,8,1,'#2a2a2a');}},
blackboard:{w:56,h:28,wall:1,draw(g,o){R(g,0,0,56,26,'#6b4423');R(g,2,2,52,21,'#1f4a34');R(g,2,24,52,2,'#8b5a2b');
  R(g,5,5,18,1,'#e8f0e8');R(g,5,8,13,1,'#e8f0e8');R(g,5,11,20,1,'#e8f0e8');R(g,30,6,6,6,'#e8f0e8');R(g,31,7,4,4,'#1f4a34');R(g,38,8,12,1,'#ffe080');R(g,38,12,9,1,'#e8f0e8');R(g,6,17,30,1,'#a0c8a8');R(g,10,25,4,1,'#fff');}},
window:{w:32,h:22,wall:1,draw(g,o){const v=o.v||'day';
  const sky=v==='storm'?['#3a4250','#2a303c']:v==='night'?['#14183a','#0c0e24']:v==='sea'?['#7ec8e8','#3a9ac0']:['#9ad4f4','#c8ecff'];
  R(g,0,0,32,22,'#e4e0d8');R(g,2,2,28,17,sky[0]);R(g,2,11,28,8,sky[1]);
  if(v==='storm'){for(let i=0;i<8;i++)R(g,4+i*3,3+(i%3)*4,1,4,'#9ab0c8');}
  else if(v==='night'){R(g,6,5,1,1,'#fff');R(g,20,4,1,1,'#fff');R(g,24,8,2,2,'#ffe8a0');}
  else if(v==='sea'){R(g,2,13,28,6,'#2a7aa8');R(g,5,15,6,1,'#bfe8f8');R(g,18,16,7,1,'#bfe8f8');R(g,10,9,12,4,'#e8e0c8');}
  else{R(g,6,5,7,3,'#fff');R(g,19,7,6,2,'#fff');}
  R(g,15,2,2,17,'#e4e0d8');R(g,2,10,28,1,'#e4e0d8');R(g,0,19,32,3,'#bab4a8');}},
poster:{w:16,h:22,wall:1,draw(g,o){const a=o.c||'#d04a3a';R(g,0,0,16,22,'#f4f0e6');R(g,1,1,14,9,a);R(g,4,3,8,5,shade(a,.4));R(g,2,12,12,1,'#5a5a5a');R(g,2,14,9,1,'#5a5a5a');R(g,2,16,11,1,'#5a5a5a');R(g,2,19,6,2,a);}},
clock:{w:12,h:12,wall:1,draw(g,o){R(g,3,0,6,12,'#2a2a2a');R(g,0,3,12,6,'#2a2a2a');R(g,1,1,10,10,'#2a2a2a');R(g,2,2,8,8,'#f4f4f4');R(g,1,4,10,4,'#f4f4f4');R(g,4,1,4,10,'#f4f4f4');R(g,6,3,1,3,'#222');R(g,6,6,3,1,'#c02020');}},
counter:{w:48,h:26,solid:[0,10,48,16],draw(g,o){const c=o.c||'#6a7a8a',l=shade(c,.25);
  R(g,1,0,46,9,'rgba(190,225,245,0.35)');R(g,1,0,46,1,'#dfe8ee');R(g,1,0,1,9,'#dfe8ee');R(g,46,0,1,9,'#dfe8ee');R(g,23,0,1,9,'#dfe8ee');R(g,18,7,12,2,'#14141c');
  R(g,0,9,48,4,l);R(g,0,9,48,1,shade(c,.45));R(g,0,13,48,12,c);R(g,0,13,48,1,shade(c,-.3));
  for(let x=4;x<46;x+=11)R(g,x,15,7,8,shade(c,-.12));R(g,0,25,48,1,'#14141c');}},
xray:{w:52,h:30,solid:[0,12,52,18],draw(g,o){const a=o.a||'#8a6aff';
  R(g,31,0,16,11,'#1c1c26');R(g,32,1,14,8,'#0e0e2a');R(g,34,3,5,4,a);R(g,40,2,4,6,shade(a,.3));R(g,36,4,2,1,'#fff');R(g,38,11,2,2,'#333');
  R(g,0,8,30,22,'#c4c8d2');R(g,0,8,30,2,'#e2e6ee');R(g,3,12,24,13,'#1a1a22');for(let x=4;x<27;x+=3)R(g,x,12,2,9,'#3a3a4a');R(g,0,26,30,4,'#9aa0ae');R(g,22,9,5,2,'#d03030');
  R(g,30,18,22,7,'#3a3a44');for(let x=31;x<52;x+=3)R(g,x,19,2,5,'#5a5a66');R(g,30,25,22,3,'#22222a');R(g,36,14,10,5,'#7a4a2a');R(g,36,14,10,1,'#9a6a3a');}},
luggage:{w:14,h:16,solid:[0,9,14,7],draw(g,o){const c=o.c||'#7a3a3a',d=shade(c,-.3);R(g,4,0,6,4,'#222');R(g,5,1,4,2,'#000000');R(g,0,3,14,13,c);R(g,0,3,14,1,shade(c,.3));R(g,3,3,1,13,d);R(g,10,3,1,13,d);R(g,0,15,14,1,d);R(g,6,8,2,2,'#e0c060');}},
crate:{w:16,h:16,solid:[0,5,16,11],draw(g,o){const c=o.c||(o.material==='metal'?'#8799a4':'#386b79'),d=shade(c,-.35);
  // Two sealed transit totes on a moulded pallet; the original evidence footprint stays unchanged.
  for(const y of [0,7]){R(g,0,y,16,7,d);R(g,1,y+1,14,5,c);R(g,0,y,16,1,shade(c,.4));R(g,2,y+2,1,3,shade(c,.2));R(g,12,y+2,1,3,shade(c,.2));R(g,5,y+2,5,2,'#e9e8d9');R(g,6,y+3,3,1,'#52636a');}
  R(g,0,14,16,2,'#384c56');R(g,3,15,3,1,'#16272d');R(g,10,15,3,1,'#16272d');}},
metalshelf:{w:32,h:36,solid:[0,26,32,10],draw(g,o){const steel=o.c||'#84959b',r=rng(o.seed||7);
  R(g,1,1,30,33,'#354349');R(g,0,0,32,2,'#c0cbcd');
  for(const y of [3,13,23]){for(let x=3;x<29;){const w=3+(r()>.7?1:0),c=o.v==='bins'?['#617e8a','#8a9caa','#4b7980'][x%3]:['#d8d6bc','#8eaaa5','#acb8c4','#c5b68e'][Math.floor(r()*4)];
    R(g,x,y,w,8,c);R(g,x,y,w,1,shade(c,.25));R(g,x+1,y+3,1,3,'#f6f1dc');R(g,x+1,y+6,1,1,'#435963');x+=w+1;}
    R(g,0,y+8,32,2,steel);R(g,1,y+8,30,1,'#b7c4c7');}
  for(const x of [0,30]){R(g,x,0,2,36,steel);for(let y=4;y<33;y+=5)R(g,x,y,1,1,'#344a53');}R(g,0,34,32,2,'#465b63');}},
cargostack:{w:44,h:36,solid:[0,22,44,14],draw(g,o){const colors=o.material==='metal'?['#8e9ea7','#687d8c']:['#3f7c8b','#64828b'];
  // Cases are painted within ONE pallet sprite, not overlapping collision objects.
  for(const [x,y,w,h,i] of [[1,16,20,16,0],[23,16,20,16,1],[3,2,18,14,1],[23,2,18,14,0]]){const c=colors[i];
    R(g,x,y,w,h,shade(c,-.35));R(g,x+1,y+2,w-2,h-3,c);R(g,x,y,w,2,shade(c,.35));R(g,x+2,y+3,2,h-5,shade(c,.16));R(g,x+w-4,y+3,2,h-5,shade(c,.16));
    R(g,x+5,y+5,w-10,4,'#e2e6db');R(g,x+7,y+6,w-14,1,'#3f535e');R(g,x+7,y+10,w-14,2,'#293f48');}
  R(g,0,32,44,4,'#455d66');for(const x of [5,19,33])R(g,x,34,6,2,'#1d3038');R(g,8,0,2,32,'#a6b9b7');R(g,33,0,2,32,'#a6b9b7');}},
baggagecart:{w:36,h:28,solid:[0,18,36,10],draw(g){R(g,1,0,2,24,'#c2ced0');R(g,1,0,10,2,'#c2ced0');
  for(const [x,y,c] of [[5,8,'#506c85'],[19,4,'#9a5c4d']]){R(g,x+4,y-3,5,3,'#26373b');R(g,x,y,13,16,c);R(g,x+2,y+2,1,12,shade(c,.3));R(g,x+9,y+2,1,12,shade(c,-.3));R(g,x+5,y+6,3,2,'#ddd9bd');}
  R(g,0,23,36,3,'#a3b4bc');R(g,4,26,5,2,'#26373b');R(g,27,26,5,2,'#26373b');}},
reception:{w:64,h:30,solid:[0,12,64,18],draw(g,o){const c=o.c||'#567b78';
  R(g,9,0,16,10,'#233a40');R(g,10,1,14,7,'#78a6a8');R(g,12,3,9,1,'#d5e8de');R(g,15,10,3,3,'#354a50');
  R(g,0,12,64,5,'#dbddd0');R(g,0,12,64,1,'#f1eee0');R(g,1,17,62,12,c);R(g,1,17,62,1,shade(c,-.25));R(g,4,20,56,1,shade(c,.18));R(g,26,20,12,6,'#d5c58e');R(g,31,21,2,4,c);R(g,1,29,62,1,'#29413e');
  R(g,40,10,12,3,'#f4eee0');R(g,43,11,6,1,'#809c99');R(g,55,7,5,6,'#395b60');}},
dispensary:{w:48,h:40,solid:[0,22,48,18],draw(g){R(g,0,0,48,27,'#beced0');R(g,2,2,44,24,'#eef3ec');
  for(const y of [4,13]){for(let x=4;x<44;x+=5){R(g,x,y,4,7,'#f9f7e9');R(g,x,y+2,4,2,['#6da4a0','#b4787b','#779bb1'][x%3]);R(g,x+1,y+5,2,1,'#657b80');}R(g,1,y+8,46,2,'#91a8ab');}
  R(g,34,20,11,8,'#314d56');R(g,35,21,9,5,'#8fc7bb');R(g,0,27,48,4,'#edf1eb');R(g,1,31,46,9,'#9bb5b6');R(g,1,31,46,1,'#6f8e93');
  for(const x of [3,18,33]){R(g,x,33,12,5,'#c5d8d6');R(g,x+4,34,4,1,'#59797c');}R(g,7,25,13,2,'#e6d9b6');R(g,22,24,7,3,'#fbfbef');}},
carebay:{w:48,h:42,solid:[0,8,48,34],draw(g,o){g.save();g.translate(2,4);PROPS.bed.draw(g,{c:o.c||'#7eb3ad'});g.restore();
  R(g,29,0,18,2,'#c0d2d1');for(const x of [29,46]){R(g,x,0,1,39,'#8ba8ad');R(g,x-1,39,3,2,'#425e68');}
  for(let x=30;x<46;x+=4){R(g,x,3,4,31,'#c6dfd8');R(g,x,3,1,31,'#8cafad');}R(g,27,34,2,6,'#93acae');R(g,30,35,14,3,'#6e8a90');}},
cookline:{w:56,h:32,solid:[0,12,56,20],draw(g){R(g,0,0,28,5,'#9aaeb3');R(g,0,0,28,1,'#dce4e3');R(g,3,5,22,2,'#576d76');
  R(g,0,11,56,7,'#c8d4d3');R(g,0,11,56,1,'#edf1e8');R(g,1,18,54,13,'#8ca2a8');
  for(const x of [4,16]){R(g,x,12,9,5,'#30484f');R(g,x+2,13,5,3,'#70868a');}R(g,6,10,8,3,'#c1c7c0');R(g,8,8,5,2,'#576b73');
  R(g,30,12,23,5,'#6f8b94');R(g,32,13,19,3,'#a5bdc0');R(g,42,6,2,8,'#e6ece5');R(g,38,6,6,2,'#e6ece5');
  R(g,3,21,22,8,'#415a66');R(g,5,22,18,5,'#607a84');R(g,8,20,12,1,'#e3e9e4');R(g,28,19,1,11,'#637f88');R(g,39,21,3,1,'#e3e9e4');R(g,0,31,56,1,'#405c65');}},
prepbench:{w:32,h:24,solid:[0,10,32,14],draw(g){R(g,0,6,32,6,'#b8c9cb');R(g,0,6,32,1,'#edf2e9');R(g,3,12,2,12,'#758f9a');R(g,27,12,2,12,'#758f9a');R(g,3,20,26,2,'#91a9af');
  R(g,4,4,14,4,'#eadfc0');R(g,6,3,8,2,'#69926b');R(g,21,3,7,5,'#dee6e1');R(g,22,1,5,2,'#c0cbca');R(g,8,15,13,5,'#4e8490');R(g,9,15,11,1,'#9fbab9');}},
fridge:{w:20,h:36,solid:[0,24,20,12],draw(g){R(g,0,0,20,36,'#6e8792');R(g,1,1,18,34,'#bdcdcf');R(g,1,1,18,1,'#ecf0e9');R(g,2,3,16,10,'#cdd9d9');R(g,1,14,18,1,'#64818c');R(g,3,5,2,6,'#486672');R(g,3,18,2,8,'#486672');R(g,1,33,18,2,'#526f7a');}},
meetingtable:{w:56,h:26,solid:[0,8,56,18],draw(g,o){const c=o.c||'#877058';R(g,2,3,52,15,c);R(g,0,6,56,9,c);R(g,2,3,52,1,shade(c,.35));R(g,2,17,52,3,shade(c,-.3));R(g,6,20,3,6,'#43515a');R(g,47,20,3,6,'#43515a');
  for(const x of [8,33]){R(g,x,7,11,5,'#eee9da');R(g,x+2,8,6,1,'#8b9a9c');R(g,x+13,9,3,4,'#abc2c5');}R(g,24,10,6,3,'#425963');}},
tablepair:{w:44,h:44,solid:[0,10,44,34],draw(g,o){const dining=o.v==='dining',c=dining?'#e0d5b8':'#877058';
  // Compact two-person table: tucked chairs and table share one honest suite footprint.
  g.save();g.translate(16,0);PROPS.chair.draw(g,{c:dining?'#8d5550':'#4e6e76'});g.restore();
  R(g,1,12,42,15,c);R(g,1,12,42,1,shade(c,.25));R(g,1,27,42,3,shade(c,-.3));R(g,5,30,2,7,'#425258');R(g,37,30,2,7,'#425258');
  if(dining){for(const x of [7,28]){R(g,x,17,9,6,'#f3f1e6');R(g,x+2,18,5,3,'#b4c5c5');}R(g,20,19,4,5,'#a66046');}
  else{R(g,7,17,12,6,'#ece9d9');R(g,9,18,7,1,'#829699');R(g,28,17,5,5,'#9bb9ba');}
  g.save();g.translate(16,28);PROPS.chair.draw(g,{c:dining?'#8d5550':'#4e6e76'});g.restore();}},
sofa:{w:36,h:22,solid:[0,8,36,14],draw(g,o){const c=o.c||'#7a3a4a',l=shade(c,.2),d=shade(c,-.3);
  R(g,2,0,32,10,c);R(g,2,0,32,1,l);R(g,17,1,1,8,d);R(g,0,5,5,15,d);R(g,31,5,5,15,d);R(g,0,5,5,1,l);R(g,31,5,5,1,l);R(g,5,10,26,9,l);R(g,17,10,1,9,c);R(g,2,19,32,3,d);}},
rtable:{w:44,h:32,solid:[2,10,40,20],draw(g,o){const c=o.c||'#f4f0e6',r=o.r||'#a02828';
  R(g,8,2,28,2,c);R(g,4,4,36,2,c);R(g,2,6,40,14,c);R(g,4,20,36,2,c);R(g,8,22,28,2,c);
  R(g,2,18,40,6,r);R(g,6,24,32,3,shade(r,-.25));R(g,14,7,16,9,'#b88a3a');R(g,15,8,14,7,'#d8aa4a');
  [[6,8],[34,8],[8,15],[32,15],[20,4]].forEach(([x,y])=>{R(g,x,y,5,4,'#ffffff');R(g,x+1,y+1,3,2,'#e0e8f0');});
  R(g,18,9,8,4,'#c06030');R(g,19,10,2,1,'#f0c040');R(g,23,10,2,1,'#4a8a3a');R(g,10,27,2,4,'#3a2a1a');R(g,32,27,2,4,'#3a2a1a');}},
lamp:{w:12,h:30,solid:[3,26,6,4],draw(g,o){R(g,1,0,10,7,'#f4d88a');R(g,0,6,12,2,'#c8a050');R(g,3,1,6,1,'#fff4c8');R(g,5,8,2,19,'#3a3020');R(g,2,27,8,3,'#2a2010');}},
safe:{w:22,h:24,solid:[0,12,22,12],draw(g,o){R(g,0,0,22,24,'#2a2e36');R(g,1,1,20,21,'#4a525e');R(g,1,1,20,1,'#7a8290');R(g,3,3,16,17,'#3a414c');R(g,7,7,7,7,'#9aa2b0');R(g,8,8,5,5,'#5a626e');R(g,10,8,1,2,'#e0e0e0');R(g,15,9,3,4,'#b8a060');R(g,1,22,4,2,'#1a1a1a');R(g,17,22,4,2,'#1a1a1a');}},
shredder:{w:14,h:20,solid:[0,10,14,10],draw(g,o){R(g,0,0,14,6,'#3a3a44');R(g,2,2,10,1,'#111');R(g,10,3,2,1,'#40e040');R(g,0,6,14,14,'#5a5a66');R(g,1,7,12,12,'#4a4a56');for(let i=0;i<5;i++)R(g,2+i*2,8+(i%3),1,6,'#f0f0e8');}},
printer:{w:20,h:18,solid:[0,8,20,10],draw(g,o){R(g,4,0,12,4,'#f4f4f4');R(g,0,4,20,9,'#d8d8de');R(g,0,4,20,1,'#f0f0f4');R(g,2,9,16,2,'#2a2a2a');R(g,15,6,3,1,'#40c040');R(g,2,13,16,5,'#8a8a94');}},
cooler:{w:10,h:28,solid:[0,20,10,8],draw(g,o){R(g,1,0,8,9,'#7ac8f0');R(g,2,1,3,7,'#b0e4ff');R(g,3,9,4,1,'#5a8aaa');R(g,0,10,10,18,'#e8e8ec');R(g,0,10,10,1,'#fff');R(g,2,13,2,2,'#d03030');R(g,6,13,2,2,'#3060d0');R(g,1,26,8,2,'#9a9aa4');}},
cctv:{w:56,h:28,wall:1,draw(g,o){const a=o.a||'#3aca6a';R(g,0,0,56,28,'#1a1c24');
  for(let j=0;j<2;j++)for(let i=0;i<3;i++){const x=2+i*18,y=2+j*13;R(g,x,y,16,11,'#0a140e');R(g,x+1,y+1,14,9,shade(a,-.6));
    if(o.v==='sat'){R(g,x+4,y+2,7,6,'#e8eef4');R(g,x+6,y+4,3,2,shade(a,-.6));R(g,x+3,y+5,2,2,'#c8d4e0');}
    else{R(g,x+2,y+6,4,3,shade(a,-.2));R(g,x+9,y+3,2,5,shade(a,-.1));R(g,x+1,y+2,14,1,shade(a,-.35));R(g,x+10,y+1,4,1,a);}}}},
clockin:{w:14,h:20,wall:1,draw(g,o){R(g,0,0,14,13,'#6a6058');R(g,1,1,12,4,'#1a1a1a');R(g,2,2,8,2,'#ff4040');R(g,4,6,6,3,'#222');R(g,0,13,14,7,'#8a7a6a');for(let x=1;x<13;x+=3)R(g,x,14,2,6,'#f0e8d0');}},
bed:{w:22,h:38,solid:[0,4,22,34],draw(g,o){R(g,0,0,22,6,'#c8ccd4');R(g,0,0,22,1,'#e8ecf0');R(g,1,4,20,30,'#f4f6f8');R(g,3,6,16,7,'#ffffff');R(g,3,12,16,1,'#d8dce0');R(g,1,16,20,18,o.c||'#7aa0c8');R(g,1,16,20,1,shade(o.c||'#7aa0c8',.3));R(g,0,34,22,4,'#9aa0aa');}},
medshelf:{w:32,h:34,solid:[0,24,32,10],draw(g,o){R(g,0,0,32,34,'#d8dce2');R(g,1,1,30,22,'#eef2f6');R(g,1,1,30,1,'#fff');
  const C=['#d04a4a','#4a8ad0','#e0b040','#5ab05a','#f0f0f0'];for(const y of [2,9,16]){R(g,1,y+6,30,1,'#b8bcc4');for(let x=3,i=0;x<29;x+=4,i++){R(g,x,y+2,3,4,C[(i+y)%5]);R(g,x,y+1,3,1,'#fff');}}
  R(g,1,24,30,9,'#c8ccd4');R(g,15,24,1,9,'#a8acb4');R(g,12,28,2,2,'#888');R(g,18,28,2,2,'#888');R(g,13,2,6,1,'#d02020');R(g,15,0,2,3,'#d02020');}},
partition:{w:28,h:30,solid:[0,26,28,4],draw(g,o){const c=o.c||'#e8a8b8';R(g,0,0,28,2,'#b8b8c0');R(g,0,0,1,30,'#b8b8c0');R(g,27,0,1,30,'#b8b8c0');
  for(let x=1;x<27;x+=4){R(g,x,2,4,25,c);R(g,x,2,1,25,shade(c,-.15));}R(g,0,27,28,3,'#8a8a94');}},
mapboard:{w:64,h:32,wall:1,draw(g,o){R(g,0,0,64,32,'#5a3a1a');R(g,2,2,60,28,'#e8dcb8');
  [[6,6,12,8],[8,14,6,10],[22,5,10,8],[24,13,7,10],[34,5,22,10],[46,15,8,6],[54,20,6,5]].forEach(([x,y,w,h])=>R(g,x,y,w,h,'#b8c890'));
  const pins=[[12,10],[28,9],[44,9],[50,18],[57,22]];for(let i=0;i<pins.length-1;i++){const [a,b]=pins[i],[c,d]=pins[i+1];const n=Math.max(Math.abs(c-a),Math.abs(d-b));for(let k=0;k<=n;k++)R(g,Math.round(a+(c-a)*k/n),Math.round(b+(d-b)*k/n),1,1,'#c82020');}
  pins.forEach(([x,y])=>{R(g,x-1,y-1,3,3,'#e02020');R(g,x,y-1,1,1,'#ff9090');});}},
sigboard:{w:52,h:20,wall:1,draw(g,o){R(g,0,0,52,20,'#1a1a22');R(g,1,1,50,18,'#2a2a36');
  ['1','3','8','9','10'].forEach((s,i)=>{const x=3+i*10;const on=o.on===s;R(g,x,3,8,13,on?'#f4c020':'#3a3a48');
    if(s==='1'){R(g,x+3,6,2,7,on?'#2a1a00':'#5a5a6a');}else if(s==='3'){R(g,x+2,6,4,2,on?'#2a1a00':'#5a5a6a');R(g,x+3,8,2,5,on?'#2a1a00':'#5a5a6a');}
    else if(s==='8'){R(g,x+2,5,4,3,on?'#2a1a00':'#5a5a6a');R(g,x+2,10,4,3,on?'#2a1a00':'#5a5a6a');}
    else if(s==='9'){R(g,x+2,5,4,4,on?'#2a1a00':'#5a5a6a');R(g,x+2,10,4,4,on?'#2a1a00':'#5a5a6a');}
    else{R(g,x+2,5,4,4,on?'#2a1a00':'#5a5a6a');R(g,x+3,10,2,4,on?'#2a1a00':'#5a5a6a');}});}},
model:{w:46,h:32,solid:[0,8,46,24],draw(g,o){R(g,0,10,46,20,'#8b5a2b');R(g,0,28,46,4,'#5a3a1a');R(g,2,12,42,15,'#c8b890');
  R(g,6,14,18,12,'#5a8a4a');R(g,9,12,12,4,'#6a9a5a');R(g,12,10,6,3,'#7aaa6a');
  [[10,2,4,12],[15,0,4,14],[20,4,3,10],[28,8,5,10],[34,10,4,8],[39,12,4,6]].forEach(([x,y,w,h])=>{R(g,x,y,w,h,'#e8e8f0');R(g,x,y,1,h,'#ffffff');for(let yy=y+2;yy<y+h;yy+=2)R(g,x+1,yy,w-2,1,'#7a9ac8');});
  R(g,14,0,6,1,'#e03030');}},
blueprint:{w:36,h:24,wall:1,draw(g,o){R(g,0,0,36,24,'#c8d0dc');R(g,1,1,34,22,'#1e4a8a');for(let x=2;x<35;x+=4)R(g,x,1,1,22,'#2a5a9a');
  R(g,5,5,10,13,'#e8f0ff');R(g,6,6,8,11,'#1e4a8a');R(g,18,9,14,1,'#e8f0ff');R(g,18,13,10,1,'#e8f0ff');R(g,18,17,12,1,'#e8f0ff');R(g,8,3,1,2,'#ffd040');R(g,4,19,12,1,'#e8f0ff');}},
scroll:{w:16,h:36,wall:1,draw(g,o){R(g,0,0,16,3,'#5a3a1a');R(g,2,3,12,30,'#f4ecd8');R(g,2,3,12,1,'#d8c8a0');
  [[6,6,4,4],[5,12,6,4],[6,18,4,5],[5,25,6,4]].forEach(([x,y,w,h])=>{R(g,x,y,w,1,'#1a1a1a');R(g,x+1,y,1,h,'#1a1a1a');R(g,x,y+h-1,w,1,'#1a1a1a');R(g,x+w-1,y+1,1,h-2,'#1a1a1a');});R(g,10,30,3,2,'#c82020');R(g,0,33,16,3,'#5a3a1a');}},
bigdesk:{w:58,h:30,solid:[0,10,58,20],draw(g,o){const c='#4a2a16';
  R(g,0,8,58,9,c);R(g,0,8,58,1,'#7a4a26');R(g,6,9,30,6,'#2a4a2a');R(g,6,9,30,1,'#3a6a3a');
  R(g,10,10,10,4,'#f4f0e4');R(g,11,11,7,1,'#9a9a9a');R(g,24,10,8,4,'#f4f0e4');R(g,40,8,6,5,'#d8b040');R(g,41,8,4,2,'#f8d860');R(g,42,13,2,1,'#c03030');R(g,48,10,7,4,'#2a2a2a');R(g,49,11,5,1,'#d8b040');
  R(g,0,16,58,13,'#3a200e');R(g,2,17,16,10,'#4a2a16');R(g,40,17,16,10,'#4a2a16');R(g,20,18,18,6,'#3a200e');R(g,9,21,3,1,'#d8b040');R(g,47,21,3,1,'#d8b040');R(g,0,29,58,1,'#1a0e06');}},
emblem:{w:24,h:24,wall:1,draw(g,o){R(g,6,0,12,24,'#1e6a4a');R(g,0,6,24,12,'#1e6a4a');R(g,2,2,20,20,'#1e6a4a');R(g,4,4,16,16,'#2a8a5a');R(g,10,6,4,10,'#f4f0e0');R(g,6,9,4,7,'#f4f0e0');R(g,14,9,4,7,'#f4f0e0');R(g,6,17,12,2,'#7ac8f0');}},
ticket:{w:12,h:26,solid:[0,18,12,8],draw(g,o){R(g,0,0,12,26,'#c8ccd4');R(g,1,1,10,8,'#1a1a1a');R(g,2,3,8,4,'#ff3a3a');R(g,3,4,1,2,'#1a1a1a');R(g,6,4,1,2,'#1a1a1a');R(g,3,11,6,2,'#4a4a4a');R(g,4,13,4,4,'#f4f4f4');R(g,0,24,12,2,'#8a8a94');}},
bench:{w:34,h:14,solid:[0,4,34,10],draw(g,o){const c=o.c||'#8b5a2b';R(g,0,2,34,3,c);R(g,0,2,34,1,shade(c,.25));R(g,0,6,34,3,c);R(g,0,6,34,1,shade(c,.25));R(g,2,9,2,5,'#3a3a3a');R(g,30,9,2,5,'#3a3a3a');}},
seats:{w:48,h:18,solid:[0,6,48,12],draw(g,o){const c=o.c||'#3a6aa8';for(let i=0;i<4;i++){const x=i*12;R(g,x+1,0,10,8,c);R(g,x+1,0,10,1,shade(c,.3));R(g,x,8,12,5,shade(c,.12));}R(g,0,13,48,2,'#7a7a84');R(g,4,15,2,3,'#5a5a64');R(g,42,15,2,3,'#5a5a64');}},
bin:{w:10,h:12,solid:[0,4,10,8],draw(g,o){R(g,0,0,10,2,'#5a6a5a');R(g,1,2,8,10,'#4a5a4a');R(g,3,3,1,8,'#3a4a3a');R(g,6,3,1,8,'#3a4a3a');R(g,2,0,3,1,'#f0f0e8');}},
rug:{flat:1,draw(g,o){const w=o.w||48,h=o.h||32,c=o.c||'#7a2a3a';R(g,0,0,w,h,shade(c,-.25));R(g,2,2,w-4,h-4,c);R(g,4,4,w-8,h-8,shade(c,-.12));R(g,6,6,w-12,h-12,c);for(let x=8;x<w-8;x+=6)R(g,x,h/2|0,2,1,shade(c,.3));}},
sdesk:{w:16,h:20,solid:[1,6,14,10],draw(g,o){const c=o.c||'#c89a5a';R(g,0,4,16,4,c);R(g,0,4,16,1,shade(c,.3));R(g,1,8,14,5,shade(c,-.3));R(g,3,5,6,2,'#f4f4f4');R(g,1,13,1,3,'#3a3a3a');R(g,14,13,1,3,'#3a3a3a');R(g,3,14,10,3,'#5a6a8a');R(g,3,17,1,3,'#3a3a3a');R(g,12,17,1,3,'#3a3a3a');}},
podium:{w:20,h:20,solid:[0,8,20,12],draw(g,o){R(g,0,4,20,4,'#a8784a');R(g,0,4,20,1,'#c8986a');R(g,2,8,16,12,'#8b5a2b');R(g,5,11,10,5,'#6b3a1b');R(g,6,5,8,2,'#f4f4f4');}},
mahjong:{w:30,h:28,solid:[0,6,30,20],draw(g,o){R(g,0,4,30,18,'#2a6a3a');R(g,0,4,30,1,'#3a8a4a');R(g,0,22,30,3,'#5a3a1a');
  for(let i=0;i<6;i++){R(g,4+i*4,6,3,4,'#f4f0e0');R(g,4+i*4,18,3,3,'#f4f0e0');}for(let i=0;i<3;i++){R(g,2,9+i*3,3,2,'#f4f0e0');R(g,25,9+i*3,3,2,'#f4f0e0');}R(g,12,12,6,3,'#e8c040');R(g,2,25,2,3,'#3a2a1a');R(g,26,25,2,3,'#3a2a1a');}},
photo:{w:14,h:12,wall:1,draw(g,o){R(g,0,0,14,12,'#c8a040');R(g,1,1,12,10,'#7ac0e8');R(g,1,7,12,4,'#3a8a5a');R(g,4,3,3,4,'#f0c8a0');R(g,8,4,3,3,'#f0c8a0');}},
pillar:{w:16,h:46,solid:[0,36,16,10],draw(g,o){const c=o.c||'#e0dcd2';R(g,0,0,16,5,shade(c,-.1));R(g,0,0,16,1,'#fff');R(g,2,5,12,34,c);R(g,4,5,1,34,shade(c,-.12));R(g,8,5,1,34,shade(c,-.12));R(g,11,5,1,34,shade(c,-.12));R(g,3,5,1,34,'#ffffff');R(g,0,39,16,7,shade(c,-.15));R(g,0,39,16,1,'#fff');}},
sign:{w:30,h:14,wall:1,draw(g,o){const c=o.c||'#2a8a4a';R(g,0,0,30,14,shade(c,-.4));R(g,1,1,28,12,c);R(g,4,4,8,6,'#f4f4f4');R(g,5,5,6,4,c);R(g,15,5,11,1,'#f4f4f4');R(g,15,8,8,1,'#f4f4f4');R(g,13,3,1,8,shade(c,.3));}},
files:{w:16,h:14,solid:[0,6,16,8],draw(g,o){const C=['#c9b58a','#e8e0c8','#a8c0d8'];for(let i=0;i<4;i++){R(g,i%2,10-i*3,15,3,C[i%3]);R(g,i%2,10-i*3,15,1,'#fff');}R(g,0,13,16,1,'#5a4a3a');}},
ftower:{w:16,h:30,solid:[0,22,16,8],draw(g,o){const C=['#c9b58a','#e8e0c8','#d8c090','#b8a070'];for(let i=0;i<9;i++){const x=(i*3)%3;R(g,x,27-i*3,14,3,C[i%4]);R(g,x,27-i*3,14,1,'#f8f0d8');R(g,x+5,28-i*3,3,1,'#a02020');}}},
tv:{w:28,h:20,wall:1,draw(g,o){R(g,0,0,28,18,'#1a1a1e');R(g,2,2,24,13,'#2a3a6a');R(g,3,3,10,6,'#c8d8f0');R(g,15,4,9,2,'#f0c040');R(g,15,8,7,1,'#e0e0e0');R(g,3,11,22,3,'#c02020');R(g,12,18,4,2,'#333');}},
mural:{w:112,h:48,wall:1,draw(g,o){R(g,0,0,112,48,'#8a6a2a');R(g,1,1,110,46,'#c8a050');R(g,3,3,106,42,'#3a2a10');
  if(MURAL.complete&&MURAL.naturalWidth){g.imageSmoothingEnabled=false;g.drawImage(MURAL,0,140,1792,768,4,4,104,40);}else R(g,4,4,104,40,'#5aa0c8');}},
pedestal:{w:18,h:24,solid:[1,14,16,10],draw(g,o){R(g,1,12,16,12,'#4a3a6a');R(g,1,12,16,1,'#8a7ab0');R(g,3,14,12,8,'#3a2a5a');R(g,0,22,18,2,'#2a1a3a');const card=artSprite('gear',2);if(card)g.drawImage(card,1,0,16,14);}},
keycard:{w:16,h:12,solid:[0,6,16,6],draw(g,o){const s=artSprite('gear',o.key?0:1);if(s)g.drawImage(s,0,0,16,12);}},
flashlight:{w:24,h:20,solid:[1,12,22,8],draw(g){R(g,1,12,22,8,'#29483b');R(g,1,12,22,1,'#b5a164');const s=flashlightSprite();if(s){const h=18*s.naturalHeight/s.naturalWidth;g.save();g.imageSmoothingEnabled=false;g.drawImage(s,3,12-h,18,h);g.restore();}}},
stairs:{w:32,h:32,flat:1,draw(g,o){for(let i=0;i<6;i++){R(g,0,i*5,32,5,shade('#61726c',i*.06));R(g,0,i*5,32,1,'#d7caa2');}R(g,0,0,2,30,'#c1a35a');R(g,30,0,2,30,'#c1a35a');}},
exitdoor:{w:24,h:34,wall:1,draw(g,o){R(g,0,0,24,34,'#bea064');R(g,2,2,20,32,'#203e37');R(g,12,2,1,32,'#111e19');R(g,9,21,2,3,'#f0d175');R(g,15,21,2,3,'#f0d175');}},
archcab:{w:32,h:34,solid:[0,24,32,10],draw(g,o){const c=o.c||'#83959b';R(g,0,0,32,34,'#3d525c');R(g,1,1,30,32,c);R(g,1,1,30,1,'#ced6d3');
  for(let j=0;j<4;j++)for(let i=0;i<3;i++){const x=2+i*10,y=3+j*7;R(g,x,y,9,6,shade(c,.12));R(g,x,y+5,9,1,'#536c77');R(g,x+2,y+1,5,2,'#e6e5d4');R(g,x+3,y+3,3,1,'#334d59');}R(g,13,31,6,2,'#2b444f');R(g,17,31,1,1,'#a3d1bf');}}, 
tank:{w:34,h:26,solid:[0,14,34,12],draw(g,o){R(g,0,0,34,18,'#1a2a3a');R(g,1,1,32,16,'#2a7aa8');R(g,1,1,32,2,'#5ab0d8');R(g,1,13,32,4,'#c8b080');R(g,6,7,5,3,'#f08030');R(g,11,8,1,1,'#f08030');R(g,20,5,4,2,'#f0d040');R(g,26,10,4,3,'#e04040');R(g,4,10,1,3,'#3aa04a');R(g,28,8,1,5,'#3aa04a');R(g,0,18,34,8,'#3a200e');R(g,0,18,34,1,'#6a4020');}},
fscreen:{w:40,h:30,solid:[0,24,40,6],draw(g,o){for(let i=0;i<4;i++){const x=i*10;R(g,x,0,10,28,'#6a1a1a');R(g,x+1,1,8,26,'#a02a2a');R(g,x+2,3,6,8,'#d8a040');R(g,x+3,14,4,10,'#c88a30');R(g,x+4,5,2,2,'#a02a2a');}R(g,0,27,40,3,'#3a1010');}},
stamp:{w:12,h:10,solid:[0,4,12,6],draw(g,o){R(g,0,4,12,6,'#4a2a16');R(g,3,0,6,5,'#d8b040');R(g,4,0,4,1,'#f8d860');R(g,2,9,8,1,'#c03030');}},
phone:{w:14,h:12,wall:1,draw(g,o){R(g,1,2,12,9,'#2a2a2e');R(g,0,0,14,3,'#1a1a1e');R(g,3,4,8,5,'#4a4a52');for(let i=0;i<3;i++)R(g,4+i*2,5,1,1,'#ddd');R(g,4,7,6,1,'#ddd');}},
sandbag:{w:32,h:12,solid:[0,2,32,10],draw(g,o){for(let i=0;i<4;i++){R(g,i*8,4,8,7,'#b8a070');R(g,i*8,4,8,1,'#d8c090');R(g,i*8+7,4,1,7,'#8a7050');}for(let i=0;i<3;i++){R(g,4+i*8,0,8,5,'#c8b080');R(g,4+i*8,0,8,1,'#e0d0a0');}}},
};

const PCACHE={};
function propSprite(t,o){
  const P=PROPS[t];if(!P)return mk(1,1);
  const key=t+JSON.stringify(o||{});
  if(PCACHE[key])return PCACHE[key];
  const w=P.flat?(o.w||48):P.w,h=P.flat?(o.h||32):P.h;
  const c=mk(w,h);P.draw(c.getContext('2d'),o||{});
  if((t!=='mural'||(MURAL.complete&&MURAL.naturalWidth))&&(t!=='flashlight'||flashlightSprite()))PCACHE[key]=c;
  return c;
}

const CHC={};
function characterHair(g,lk,dir,backLayer){
  const hs=lk.hs||'short',hr=lk.hr||'#292a30',hi=shade(hr,.23),lo=shade(hr,-.2),side=dir===2,back=dir===1;
  const long=['long','halfup','waves','braid'].includes(hs),bob=['bob','blunt','asym','curlybob'].includes(hs);
  const pony=['ponytail','highpony'].includes(hs),bun=['bun','lowbun','braidbun','twist'].includes(hs);
  const curly=['perm','curly','curlybob','waveshort'].includes(hs);
  if(backLayer){
    if(long||bob){
      const h=long?10:7;
      R(g,side?3:2,3,3,h,lo);if(!side)R(g,12,3,2,h-1,lo);
      if(back)R(g,4,3,8,h,hr);
      if(long){R(g,side?3:2,5,1,h-2,hi);if(back)R(g,8,6,1,6,lo);}
      if(hs==='waves'||hs==='curlybob'){R(g,1,6,2,3,hr);if(!side)R(g,13,7,2,3,hr);}
      if(hs==='braid'){R(g,3,8,2,7,hr);for(let y=9;y<15;y+=2)R(g,3+(y%3===0?1:0),y,1,1,hi);}
    }
    if(pony){const x=side?3:11,y=hs==='highpony'?2:6;R(g,x,y,3,6,hr);R(g,x+1,y+5,2,4,lo);R(g,x,y,2,1,lk.c2||'#958265');}
    if(bun){const x=side?2:hs==='lowbun'?10:6,y=hs==='lowbun'?5:hs==='twist'?2:0;R(g,x,y,4,3,hr);R(g,x+1,y,2,1,hi);}
    if(hs==='halfup'){R(g,side?3:11,4,2,4,hr);R(g,side?3:11,5,2,1,lk.c2||'#a99476');}
    return;
  }
  if(hs==='bald'){
    R(g,side?4:3,5,2,3,hr);if(!side)R(g,12,5,1,3,hr);
    if(back){R(g,4,7,8,2,hr);R(g,5,7,6,1,hi);}return;
  }
  if(hs==='cap'||hs==='hardhat'||hs==='chef'){
    const cp=lk.cap||'#293e56';
    R(g,side?4:3,2,side?8:10,3,cp);R(g,5,1,6,1,shade(cp,.15));
    R(g,side?9:3,5,side?5:10,1,shade(cp,-.3));
    R(g,4,5,1,3,hr);if(!side)R(g,12,5,1,2,hr);
    if(hs==='chef'){R(g,4,0,8,3,'#f0eee5');R(g,5,-1,2,2,'#f7f5ed');R(g,8,-1,3,2,'#f7f5ed');R(g,7,0,1,3,'#d7d5cd');}
    else if(hs==='hardhat'){R(g,5,0,6,2,cp);R(g,7,0,1,4,shade(cp,.3));R(g,side?3:2,4,side?10:12,1,shade(cp,.1));}
    else if(!back){R(g,side?9:7,2,2,2,'#c5ad72');R(g,side?10:8,2,1,1,'#f1d58a');}
    if(back)R(g,5,6,6,2,hr);return;
  }
  if(hs==='receding'){
    R(g,4,2,2,2,hr);R(g,10,2,2,3,hr);R(g,6,1,4,1,hr);R(g,3,4,2,3,hr);R(g,12,4,1,3,hr);
    if(back){R(g,4,3,8,6,hr);R(g,6,2,4,2,lk.sk||'#e8bf9f');}
    R(g,4,3,1,2,hi);return;
  }
  R(g,4,2,8,2,hr);R(g,5,1,6,1,hr);R(g,3,3,1,4,lo);R(g,12,3,1,4,lo);
  if(side){R(g,4,3,3,5,hr);R(g,7,2,4,1,hi);}
  else R(g,5,2,3,1,hi);
  if(back){R(g,4,3,8,6,hr);R(g,5,3,3,1,hi);R(g,5,8,6,1,lo);}
  else{
    if(['part','slick','swept','short','side'].includes(hs)){
      R(g,4,4,3,1,hr);R(g,5,3,3,1,hr);R(g,10,3,2,2,hr);
      if(hs==='slick'){R(g,5,2,5,1,hi);R(g,8,3,1,1,lo);}
      if(hs==='swept')R(g,3,2,3,2,hr);
      if(hs==='side'){R(g,4,4,4,1,hr);R(g,5,5,1,1,hr);}
    }else if(['quiff','spiky','tousled'].includes(hs)){
      R(g,5,0,4,2,hr);R(g,4,1,1,2,hr);R(g,10,1,2,2,hr);R(g,4,4,2,1,hr);R(g,10,4,2,1,hr);
      R(g,6,1,2,1,hi);
      if(hs==='spiky'){R(g,3,1,1,2,hr);R(g,10,0,1,2,hr);R(g,8,4,1,1,hr);}
      if(hs==='tousled'){R(g,7,4,2,1,hr);R(g,8,5,1,1,hr);R(g,11,0,1,2,hr);}
    }else if(hs==='asym'||hs==='pixie'){
      R(g,4,3,6,1,hr);R(g,4,4,4,1,hr);R(g,4,5,2,1,hr);R(g,4,6,1,1,hr);R(g,10,3,2,1,hr);
      if(hs==='asym'){R(g,3,7,2,3,hr);R(g,3,5,1,3,hi);}
      else{R(g,3,2,2,2,hr);R(g,11,2,2,2,hr);}
    }else if(hs==='blunt'){
      R(g,4,4,8,1,hr);R(g,4,5,2,1,hr);R(g,9,5,2,1,hr);
    }else if(['crop','crew'].includes(hs)){
      R(g,4,3,8,1,hr);if(hs==='crew')R(g,5,2,6,1,hi);
    }else if(bob||long){
      R(g,4,3,4,1,hr);R(g,4,4,2,1,hr);R(g,10,3,2,2,hr);
    }else if(bun||pony){R(g,4,3,3,1,hr);R(g,10,3,2,2,hr);R(g,4,4,1,2,hr);}
  }
  if(curly){
    [[3,1],[6,0],[9,1],[12,2],[2,4],[12,5]].forEach(([x,y],i)=>{R(g,x,y,2,2,hr);R(g,x,y,1,1,i%2?hi:lo);});
    if(hs==='perm'){R(g,2,6,2,3,hr);R(g,12,7,2,2,hr);}
  }
  if(back&&bun){const x=hs==='lowbun'?9:6,y=hs==='lowbun'?6:2;R(g,x,y,4,3,lo);R(g,x+1,y,2,1,hi);if(hs==='braidbun')R(g,x+2,y+2,1,1,hi);}
  if(lk.streak){R(g,side?5:4,3,1,3,'#a9aaac');if(back)R(g,10,3,1,3,'#9b9fa2');}
  if(lk.hairClip&&!back)R(g,side?5:11,5,1,2,'#d6b875');
}

function characterFace(g,lk,dir){
  const sk=lk.sk||'#edc2a0',shadow=shade(sk,-.16),light=shade(sk,.12),hr=lk.hr||'#2b2929';
  const age=lk.age||35,face=lk.face||'oval',side=dir===2,back=dir===1;
  const wide=['square','round','wide'].includes(face),angular=['angular','diamond','heart'].includes(face);
  if(lk.hs==='bald'||lk.hs==='receding'){R(g,5,2,6,2,sk);R(g,6,1,4,1,light);}
  R(g,side?5:4,3,side?7:8,6,sk);
  R(g,side?6:wide?4:5,9,side?5:wide?8:6,1,sk);
  R(g,side?7:angular?6:5,10,side?3:angular?4:6,1,shadow);
  if(face==='square'&&!side){R(g,4,9,2,1,shadow);R(g,10,9,2,1,shadow);}
  R(g,6,4,side?4:5,2,light);
  if(!side){R(g,3,6,1,2,shadow);R(g,12,6,1,2,shadow);}
  if(back)return;
  const ink='#32353c',brow=lk.brows==='soft'?shade(hr,.1):shade(hr,-.1),mouth=shade(sk,-.34);
  if(side){
    R(g,12,6,1,2,sk);R(g,7,6,1,2,shadow);R(g,10,6,1,1,ink);R(g,9,5,2,1,brow);
    R(g,11,8,1,1,shadow);R(g,10,9,2,1,mouth);
    if(lk.sex==='f')R(g,9,6,1,1,shade(sk,-.28));
  }else{
    const ex=wide?5:6;
    R(g,ex,6,1,1,ink);R(g,10,6,1,1,ink);
    if(lk.brows==='heavy'){R(g,ex-1,5,2,1,brow);R(g,9,5,2,1,brow);}
    else if(lk.brows==='arched'){R(g,ex,4,1,1,brow);R(g,10,4,1,1,brow);}
    else{R(g,ex,5,1,1,brow);R(g,10,5,1,1,brow);}
    R(g,8,7,1,1,shadow);R(g,7,9,2,1,mouth);
    if(lk.sex==='f'&&age<50){R(g,ex-1,7,1,1,shade(sk,-.08));R(g,11,7,1,1,shade(sk,-.08));}
    if(face==='diamond'||face==='long'){R(g,4,8,1,1,shadow);R(g,11,8,1,1,shadow);}
    if(face==='round'){R(g,4,8,1,1,light);R(g,11,8,1,1,light);}
  }
  if(age>=50){R(g,side?9:4,7,1,1,shadow);if(!side)R(g,11,7,1,1,shadow);}
  if(age>=60){
    R(g,side?9:5,8,1,1,shade(sk,-.25));R(g,10,8,1,1,shade(sk,-.22));
    R(g,side?8:6,4,3,1,shade(sk,-.12));
    if(age>=70){R(g,side?6:4,9,1,1,shadow);R(g,9,10,1,1,shade(sk,-.24));}
  }
  if(lk.gl){
    const gc=lk.glassesColor||'#494747',round=lk.gl==='round',rimless=lk.gl==='rimless';
    if(side){R(g,8,6,4,1,gc);R(g,9,7,1,1,gc);R(g,11,7,1,1,gc);if(!rimless)R(g,9,8,3,1,gc);R(g,10,6,1,1,ink);}
    else{
      const y=round?5:6;
      R(g,4,y,3,1,gc);R(g,9,y,3,1,gc);R(g,7,6,2,1,gc);
      R(g,4,7,1,1,gc);R(g,11,7,1,1,gc);
      if(!rimless){R(g,5,8,2,1,gc);R(g,9,8,2,1,gc);}
      R(g,6,6,1,1,ink);R(g,10,6,1,1,ink);
      if(lk.gl==='cat'){R(g,3,5,1,1,gc);R(g,12,5,1,1,gc);}
    }
  }
  if(lk.bd){R(g,side?9:6,8,side?3:4,1,hr);if(lk.bd!=='moustache')R(g,side?8:6,10,4,1,hr);}
  if(lk.accessory==='pearl'&&!side){R(g,3,8,1,1,'#efead8');R(g,12,8,1,1,'#efead8');}
}

function characterClothes(g,lk,dir){
  const cl=lk.cl||'#4e7485',dark=shade(cl,-.24),light=shade(cl,.16),shirt=lk.shirt||'#efeadc';
  const accent=lk.c2||'#d7d1bf',gold='#d1b876',ty=lk.ty||'casual',side=dir===2,back=dir===1;
  const x=side?5:4,w=side?6:8;
  R(g,x,11,w,7,cl);R(g,x,11,w,1,light);R(g,x+w-1,12,1,6,dark);R(g,x,17,w,1,dark);
  if(back){
    R(g,7,12,1,5,shade(cl,-.08));
    if(ty==='apron'){R(g,4,14,8,1,accent);R(g,7,13,2,3,accent);}
    if(ty==='investigator'){R(g,4,11,8,2,accent);R(g,6,14,4,1,gold);}
    if(ty==='uniform')R(g,4,11,8,1,gold);
    if(ty==='safety'){R(g,5,11,1,7,'#e1d764');R(g,10,11,1,7,'#e1d764');R(g,4,15,8,1,'#e1d764');}
    return;
  }
  if(side){
    if(['suit','vest','jacket','investigator','coat','cardigan'].includes(ty))R(g,10,11,1,6,shirt);
    if(ty==='suit'){R(g,10,12,1,4,lk.tie||accent);R(g,9,11,1,2,light);}
    if(ty==='uniform'){R(g,6,11,3,1,gold);R(g,10,13,1,1,gold);R(g,10,16,1,1,gold);}
    if(ty==='apron')R(g,9,12,2,6,accent);
    if(ty==='safety'){R(g,6,11,1,7,'#e1d764');R(g,5,15,6,1,'#e1d764');}
    if(ty==='investigator'){R(g,5,11,4,2,accent);R(g,9,13,2,2,gold);}
  }else{
    if(['suit','vest','jacket','investigator','coat','cardigan'].includes(ty)){
      R(g,6,11,4,2,shirt);R(g,7,13,2,5,shirt);
      R(g,5,12,1,2,dark);R(g,10,12,1,2,light);
    }
    if(ty==='suit'){
      if(lk.sex!=='f'||lk.accessory==='badge'){R(g,7,12,2,1,lk.tie||accent);R(g,8,13,1,4,lk.tie||accent);}
      R(g,6,13,1,2,dark);R(g,9,13,1,2,light);R(g,6,16,1,1,'#b5a78d');
    }else if(ty==='vest'){
      R(g,4,11,1,6,shirt);R(g,11,11,1,6,shirt);R(g,7,15,1,1,gold);
    }else if(ty==='cardigan'){R(g,6,14,1,1,gold);R(g,6,16,1,1,gold);}
    else if(ty==='coat'){R(g,5,14,2,2,shade(cl,-.12));R(g,10,14,1,2,shade(cl,-.14));}
    else if(ty==='uniform'){
      R(g,6,11,4,1,shirt);R(g,7,12,2,2,dark);R(g,4,11,2,1,gold);R(g,10,11,2,1,gold);
      R(g,5,14,2,1,dark);R(g,9,13,2,2,gold);R(g,8,15,1,1,gold);R(g,8,17,1,1,gold);
    }else if(ty==='apron'){
      R(g,5,11,1,3,accent);R(g,10,11,1,3,accent);R(g,5,13,6,5,accent);R(g,6,15,4,2,shade(accent,-.15));R(g,9,14,1,2,'#766653');
    }else if(ty==='nurse'){R(g,5,11,6,1,shirt);R(g,7,12,2,1,shirt);R(g,8,14,1,1,'#e8e5dc');R(g,8,16,1,1,'#e8e5dc');}
    else if(ty==='safety'){
      R(g,7,11,2,7,shirt);R(g,5,11,1,7,'#e1d764');R(g,10,11,1,7,'#e1d764');R(g,4,15,8,1,'#e1d764');
    }else if(ty==='investigator'){
      R(g,4,11,2,2,accent);R(g,10,11,2,2,accent);R(g,5,15,2,1,dark);R(g,9,15,2,1,dark);
      R(g,8,14,1,4,'#a2a9a1');R(g,9,13,2,2,gold);R(g,10,13,1,1,'#f4dfa1');
    }else if(ty==='polo'||ty==='work'||ty==='casual'){
      R(g,6,11,1,1,light);R(g,9,11,1,1,light);R(g,7,12,2,1,dark);R(g,8,13,1,2,light);
      if(ty==='work'){R(g,5,14,2,2,dark);R(g,9,14,2,2,dark);}
    }else if(ty==='knit'){R(g,6,11,4,1,dark);R(g,4,16,8,1,light);}
    else if(ty==='dress'){R(g,6,11,4,1,accent);R(g,8,13,1,1,gold);}
  }
  const a=lk.accessory;
  if(a==='lanyard'){
    if(side){R(g,9,12,1,4,accent);R(g,9,16,2,2,shirt);}
    else{R(g,6,12,1,3,accent);R(g,9,12,1,3,accent);R(g,7,15,2,1,accent);R(g,7,16,3,2,shirt);R(g,8,16,1,1,'#62818e');}
  }
  if(a==='badge'||a==='badgeScarf'||a==='brooch'){R(g,side?9:10,13,2,2,a==='brooch'?'#578c77':gold);R(g,side?10:11,13,1,1,'#e3d49b');}
  if(['pen','teacher','caretaker','shop'].includes(a)){R(g,side?9:10,13,1,2,'#3c6383');R(g,side?10:11,13,1,2,gold);}
  if(['id','folder','ledger','archive','office'].includes(a)){R(g,side?9:10,14,2,2,shirt);R(g,side?9:10,14,2,1,'#7b94a3');}
  if(lk.neck==='scarf'||a==='scarf'){R(g,side?10:6,11,side?1:4,1,accent);R(g,side?10:9,12,1,3,accent);}
  if(lk.neck==='bow'||a==='bow'){R(g,side?10:6,12,side?1:4,1,accent);R(g,side?10:7,13,1,1,accent);}
  if(a==='tie')R(g,side?10:8,12,1,5,accent);
  if(a==='medical'){R(g,side?9:10,13,2,2,shirt);R(g,side?9:10,13,1,2,'#bd7d81');}
  if(a==='stethoscope'){
    R(g,6,12,1,3,'#364e59');R(g,9,12,1,3,'#364e59');R(g,7,15,2,1,'#364e59');R(g,9,16,2,1,'#8b9698');
  }
  if(a==='satchel'||a==='press'){
    for(let y=11;y<18;y++)R(g,side?6:4+Math.floor((y-11)/2),y,1,1,'#655747');
    if(a==='press'){R(g,7,16,4,2,'#3c464c');R(g,8,16,2,2,'#81969a');}
  }
  if(a==='keys'){R(g,side?9:10,14,1,3,gold);R(g,side?9:10,16,2,1,gold);}
  if(a==='blueprint'){R(g,side?9:10,15,2,3,'#d9e2df');R(g,side?9:10,15,1,3,'#829d9f');}
  if(a==='panel')R(g,5,14,side?5:6,2,accent);
  if(a==='chef'){R(g,side?10:6,11,side?1:4,1,'#974c45');R(g,8,12,1,2,'#974c45');}
}

function charSprite(lk={},dir=0,fr=0){
  const key=JSON.stringify(lk)+'|'+dir+'|'+fr;
  if(CHC[key])return CHC[key];
  if(dir===3){const c=mk(18,26),g=c.getContext('2d');g.translate(18,0);g.scale(-1,1);g.drawImage(charSprite(lk,2,fr),0,0);return CHC[key]=c;}
  const base=mk(18,26),g=base.getContext('2d');g.translate(1,1);
  const sk=lk.sk||'#edc2a0',cl=lk.cl||'#4e7485',pn=lk.pn||'#2d3c4d',sh=lk.sh||'#252a32';
  const side=dir===2,skirt=lk.ty==='dress',lh=fr===1?3:4,rh=fr===2?3:4;
  if(side){
    if(fr===0){R(g,6,18,4,4,pn);R(g,6,22,5,1,sh);}
    else{const a=fr===1?[4,9]:[5,8];R(g,a[0],18,3,4,shade(pn,-.22));R(g,a[0],22,4,1,sh);R(g,a[1],18,3,4,pn);R(g,a[1],22,4,1,sh);}
    if(skirt)R(g,4,16,8,4,cl);
  }else if(skirt){
    R(g,3,16,10,4,cl);R(g,3,19,10,1,shade(cl,-.22));
    R(g,5,20,2,lh-2,sk);R(g,9,20,2,rh-2,sk);R(g,5,18+lh,2,1,sh);R(g,9,18+rh,2,1,sh);
  }else{
    R(g,4,18,3,lh,pn);R(g,9,18,3,rh,pn);R(g,7,18,2,1,pn);
    R(g,4,18+lh,3,1,sh);R(g,9,18+rh,3,1,sh);R(g,4,19,1,Math.max(1,lh-1),shade(pn,.12));
  }
  characterClothes(g,lk,dir);
  const sleeve=lk.ty==='vest'?lk.shirt||'#efeadc':cl;
  if(side){
    if(!lk.holding){const ax=fr===1?8:fr===2?6:7;R(g,ax,12,2,5,shade(sleeve,-.15));R(g,ax,17,2,1,sk);}
  }else{
    const la=fr===1?1:0,ra=fr===2?1:0;
    // Signed holding suppresses only the arm replaced by the game's flashlight pose.
    if(!lk.holding||lk.holding>0){R(g,2,12-la,2,5,shade(sleeve,-.12));R(g,2,17-la,2,1,sk);}
    if(!lk.holding||lk.holding<0){R(g,12,12-ra,2,5,shade(sleeve,-.2));R(g,12,17-ra,2,1,sk);}
  }
  characterHair(g,lk,dir,true);
  characterFace(g,lk,dir);
  characterHair(g,lk,dir,false);
  if(lk.accessory==='headset'&&dir!==1){R(g,side?6:3,5,1,4,'#394b50');R(g,side?6:3,8,side?5:3,1,'#394b50');R(g,side?10:6,8,1,1,'#9daaad');}
  const sil=mk(18,26),s=sil.getContext('2d');s.drawImage(base,0,0);s.globalCompositeOperation='source-in';R(s,0,0,18,26,'#25313a');
  const out=mk(18,26),o=out.getContext('2d');
  [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>o.drawImage(sil,dx,dy));
  o.drawImage(base,0,0);return CHC[key]=out;
}
