'use strict';

const WALKING_SPRITE=Object.freeze({width:24,height:34,foot:33});

function walkingHair(g,lk,dir,backLayer){
 const hs=lk.hs||'short',hair=lk.hr||'#292a30',light=shade(hair,.2),dark=shade(hair,-.22),side=dir===2,back=dir===1;
 const long=['long','halfup','waves','braid'].includes(hs),bob=['bob','blunt','asym','curlybob'].includes(hs);
 if(backLayer){
  if(long||bob){const length=long?17:11;R(g,4,4,3,length,dark);R(g,17,4,3,length,hair);if(back)R(g,6,4,12,length-2,hair);if(long){R(g,5,7,1,10,light);R(g,18,8,1,8,dark);}}
  if(['ponytail','highpony'].includes(hs)){R(g,17,hs==='highpony'?3:8,4,10,hair);R(g,18,12,2,7,dark);R(g,17,7,3,2,lk.c2||'#b99b68');}
  if(['bun','lowbun','braidbun','twist'].includes(hs)){const y=hs==='lowbun'?9:2;R(g,15,y,6,5,hair);R(g,17,y+1,3,1,light);}
  if(hs==='braid'){R(g,4,13,3,13,hair);for(let y=14;y<25;y+=3)R(g,5,y,2,1,light);}
  return;
 }
 if(['cap','hardhat','chef'].includes(hs)){
  const cap=lk.cap||'#293e56';R(g,4,3,16,5,cap);R(g,6,1,12,3,shade(cap,.12));R(g,3,7,18,2,shade(cap,-.25));
  if(hs==='chef'){R(g,5,0,14,4,'#eee9dc');R(g,7,-1,4,2,'#faf6e9');R(g,13,-1,5,2,'#faf6e9');R(g,11,1,2,4,'#cbc9c0');}
  if(hs==='hardhat'){R(g,6,0,12,3,cap);R(g,11,0,2,5,shade(cap,.28));R(g,2,6,20,2,shade(cap,.12));}
  if(!back&&hs==='cap'){R(g,11,3,3,2,'#d4ba72');R(g,12,3,1,1,'#fff0b0');}
  return;
 }
 if(hs==='bald'){R(g,4,6,2,6,hair);R(g,18,6,2,6,hair);if(back)R(g,6,12,12,4,hair);return;}
 if(hs==='receding'){R(g,5,3,4,3,hair);R(g,15,3,4,3,hair);R(g,4,6,2,7,dark);R(g,18,6,2,7,hair);R(g,9,2,6,2,hair);return;}
 R(g,5,2,14,4,hair);R(g,7,1,10,2,hair);R(g,4,5,2,7,dark);R(g,18,5,2,7,hair);
 if(back){R(g,5,5,14,11,hair);R(g,7,5,5,2,light);return;}
 if(['part','slick','swept','short','side','crop','crew'].includes(hs)){
  R(g,5,5,7,3,hair);R(g,12,5,7,2,hair);R(g,6,7,4,2,hair);R(g,7,3,7,1,light);
  if(hs==='swept')R(g,3,3,5,3,hair);if(hs==='slick')R(g,9,2,7,1,light);
 }else if(['quiff','spiky','tousled','waveshort'].includes(hs)){
  R(g,6,0,5,3,hair);R(g,12,1,5,3,hair);R(g,5,5,5,3,hair);R(g,15,5,4,2,hair);R(g,8,2,4,1,light);
  if(hs==='spiky'){R(g,3,2,3,3,hair);R(g,17,0,3,3,hair);}if(hs==='tousled')R(g,11,6,3,2,hair);
 }else if(['asym','pixie','blunt'].includes(hs)){
  R(g,5,4,12,3,hair);R(g,5,7,hs==='asym'?6:4,3,hair);R(g,16,6,3,3,hair);
  if(hs==='asym'){R(g,4,9,3,6,hair);R(g,5,7,1,5,light);}if(hs==='blunt')R(g,7,7,11,2,hair);
 }else{R(g,5,5,6,3,hair);R(g,16,5,3,4,hair);}
 if(['perm','curly','curlybob','waveshort'].includes(hs))for(const [x,y] of [[4,2],[8,0],[13,1],[17,3],[3,6],[18,7]]){R(g,x,y,4,4,hair);R(g,x+1,y,2,1,light);}
 if(lk.streak){R(g,6,4,2,5,'#c4c5c1');R(g,8,2,2,2,'#a7aaa8');}
 if(lk.hairClip)R(g,17,7,2,3,'#e0c47d');
}

function walkingFace(g,lk,dir){
 const skin=lk.sk||'#e8bb98',light=shade(skin,.13),shadow=shade(skin,-.17),side=dir===2,back=dir===1;
 R(g,9,15,6,5,shadow);R(g,side?7:6,4,side?11:12,11,skin);R(g,side?8:5,7,side?10:14,7,skin);R(g,side?8:7,5,side?8:10,3,light);
 R(g,side?9:7,14,side?7:10,2,skin);R(g,side?10:9,16,side?5:6,1,shadow);R(g,4,9,2,4,shadow);R(g,18,9,2,4,skin);
 if(back)return;
 const ink='#242a32',eye=lk.sex==='f'?'#293c45':'#26313a',mouth=shade(skin,-.4),variant=lk.variant||0,browY=[6,5,6,6,4,5,7,6][variant],mouthWidth=[2,3,4,5,2,3,4,5][variant],mouthY=variant>=4?15:14;
 if(side){
  R(g,17,9,3,3,skin);R(g,14,9,2,2,'#f5eee1');R(g,15,9,1,2,eye);R(g,13,browY,4,1,shade(lk.hr||'#333',-.1));R(g,18,11,2,2,shadow);R(g,15,mouthY,Math.max(2,mouthWidth-1),1,mouth);
 }else{
  for(const x of [8,14]){R(g,x,9,2,2,'#f3ecdf');R(g,x+1,9,1,2,eye);R(g,x,9,1,1,'#ffffff');}
  R(g,7,browY,4,1,shade(lk.hr||'#333',-.08));R(g,13,browY,4,1,shade(lk.hr||'#333',-.08));R(g,variant===2?12:11,11,variant===2?1:2,2,shadow);R(g,12-Math.floor(mouthWidth/2),mouthY,mouthWidth,1,mouth);
  if(lk.sex==='f'&&(lk.age||35)<55){R(g,6,12,2,1,shade(skin,-.07));R(g,16,12,2,1,shade(skin,-.07));}
 }
 const age=lk.age||35;if(age>=50){R(g,6,12,2,1,shadow);R(g,16,12,2,1,shadow);}if(age>=62){R(g,8,5,3,1,shadow);R(g,13,5,3,1,shadow);R(g,9,15,1,1,shadow);R(g,14,15,1,1,shadow);}
 if(lk.gl){const frame=lk.glassesColor||'#3b4145';if(side){R(g,12,7,6,1,frame);R(g,13,8,1,4,frame);R(g,17,8,1,4,frame);R(g,13,11,5,1,frame);}else{for(const x of [6,13]){R(g,x,7,5,1,frame);R(g,x,11,5,1,frame);R(g,x,8,1,3,frame);R(g,x+4,8,1,3,frame);}R(g,11,8,2,1,frame);}}
 if(lk.bd){R(g,side?14:9,13,side?4:6,1,lk.hr||'#333');if(lk.bd!=='moustache')R(g,9,15,6,2,lk.hr||'#333');}
}

function walkingClothes(g,lk,dir,fr){
 const cloth=lk.cl||'#4e7485',dark=shade(cloth,-.24),light=shade(cloth,.16),pants=lk.pn||'#2d3c4d',skin=lk.sk||'#e8bb98',shirt=lk.shirt||'#efeadc',accent=lk.c2||'#d7d1bf',side=dir===2,back=dir===1;
 const step=fr===1?-1:fr===2?1:0;
 if(lk.ty==='dress'){R(g,5,24,14,5,cloth);R(g,7,29,3,3,skin);R(g,14,29,3,3,skin);}else{R(g,6+step,26,5,6,pants);R(g,13-step,26,5,6,shade(pants,-.08));}
 R(g,5+step,31,6,2,lk.sh||'#252a32');R(g,13-step,31,6,2,lk.sh||'#252a32');R(g,side?7:5,18,side?10:14,9,cloth);R(g,6,18,12,1,light);R(g,side?15:17,19,2,7,dark);
 if(!back){if(['suit','vest','jacket','investigator','coat','cardigan'].includes(lk.ty)){R(g,9,18,6,7,shirt);R(g,8,19,2,5,dark);R(g,15,19,2,5,light);}if(lk.ty==='suit'){R(g,11,19,2,6,lk.tie||accent);R(g,10,18,4,2,shirt);}if(lk.ty==='uniform'){R(g,6,19,4,1,'#d7bd73');R(g,14,19,4,1,'#d7bd73');R(g,11,20,2,2,dark);R(g,12,22,1,1,'#e3ca7d');R(g,12,25,1,1,'#e3ca7d');}if(lk.ty==='apron'){R(g,8,18,2,4,accent);R(g,14,18,2,4,accent);R(g,8,21,8,6,accent);R(g,10,23,4,2,shade(accent,-.14));}if(lk.ty==='nurse'){R(g,9,18,6,2,shirt);R(g,11,22,2,1,'#f5f1e8');R(g,11,25,2,1,'#f5f1e8');}if(lk.ty==='safety'){R(g,7,18,2,9,'#e3d55e');R(g,15,18,2,9,'#e3d55e');R(g,5,24,14,2,'#e3d55e');}if(lk.ty==='investigator'){R(g,6,18,3,2,accent);R(g,15,18,3,2,accent);R(g,14,21,2,2,'#d8bd70');}}
 const sleeve=lk.ty==='vest'?shirt:cloth;
 if(side){if(!lk.holding){R(g,13,19,4,7,shade(sleeve,-.12));R(g,14,25,3,2,skin);}}else{if(!lk.holding||lk.holding>0){R(g,2,19-step,4,7,shade(sleeve,-.1));R(g,3,25-step,3,2,skin);}if(!lk.holding||lk.holding<0){R(g,18,19+step,4,7,shade(sleeve,-.17));R(g,18,25+step,3,2,skin);}}
 if(!back){const a=lk.accessory;if(a==='lanyard'){R(g,9,19,1,4,accent);R(g,14,19,1,4,accent);R(g,10,23,4,3,shirt);}if(['badge','badgeScarf','brooch'].includes(a))R(g,15,20,2,2,'#e0c379');if(['folder','ledger','archive','office','blueprint'].includes(a)){R(g,15,22,4,5,a==='blueprint'?'#b9d5dc':'#e8dfc9');R(g,16,23,2,1,'#748b94');}if(a==='stethoscope'){R(g,9,19,1,5,'#334b55');R(g,14,19,1,5,'#334b55');R(g,10,23,4,1,'#334b55');R(g,14,24,2,2,'#a7b3b2');}if(a==='medical'){R(g,15,20,2,2,'#f4eee2');R(g,15,20,1,2,'#b86f78');}if(a==='headset'){R(g,4,7,1,7,'#35464d');R(g,5,13,6,1,'#35464d');R(g,10,12,2,2,'#9aabad');}if(a==='chef'){R(g,9,18,6,1,'#a5534d');R(g,11,19,2,2,'#a5534d');}}
}

function walkingPixelPerson(lk={},dir=0,fr=0){
 if(dir===3){const out=mk(24,34),g=out.getContext('2d');g.translate(24,0);g.scale(-1,1);g.drawImage(walkingPixelPerson(lk,2,fr),0,0);return out;}
 const base=mk(24,34),g=base.getContext('2d');walkingClothes(g,lk,dir,fr);walkingHair(g,lk,dir,true);walkingFace(g,lk,dir);walkingHair(g,lk,dir,false);
 const silhouette=mk(24,34),s=silhouette.getContext('2d');s.drawImage(base,0,0);s.globalCompositeOperation='source-in';R(s,0,0,24,34,'#202b33');
 const out=mk(24,34),o=out.getContext('2d');for(const [x,y] of [[1,0],[-1,0],[0,1],[0,-1]])o.drawImage(silhouette,x,y);o.drawImage(base,0,0);return out;
}
