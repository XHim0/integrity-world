'use strict';

function portraitHair(g,lk,backLayer){
 const hs=lk.hs||'short',hair=lk.hr||'#292a30',light=shade(hair,.22),dark=shade(hair,-.24);
 const long=['long','halfup','waves','braid'].includes(hs),bob=['bob','blunt','asym','curlybob'].includes(hs);
 if(backLayer){
  if(long||bob){const length=long?70:48;R(g,35,31,12,length,dark);R(g,81,31,12,length,hair);R(g,43,28,42,34,hair);if(long){R(g,38,42,4,47,light);R(g,85,42,4,50,dark);}}
  if(['ponytail','highpony'].includes(hs)){R(g,81,hs==='highpony'?24:43,17,47,hair);R(g,88,57,10,34,dark);R(g,82,40,12,5,lk.c2||'#c5a66d');}
  if(['bun','lowbun','braidbun','twist'].includes(hs)){const y=hs==='lowbun'?43:17;R(g,75,y,23,17,hair);R(g,81,y+3,12,4,light);R(g,86,y+9,8,4,dark);}
  if(hs==='braid'){R(g,35,58,12,65,hair);for(let y=63;y<119;y+=9){R(g,37,y,8,4,light);R(g,39,y+4,6,4,dark);}}
  return;
 }
 if(['cap','hardhat','chef'].includes(hs)){
  const cap=lk.cap||'#293e56';R(g,40,22,49,17,cap);R(g,47,15,35,10,shade(cap,.13));R(g,36,35,58,7,shade(cap,-.25));R(g,43,39,6,16,hair);R(g,80,39,6,15,hair);
  if(hs==='chef'){R(g,43,11,43,16,'#eee9dc');R(g,47,6,12,9,'#faf6e9');R(g,61,4,14,11,'#faf6e9');R(g,75,7,10,9,'#faf6e9');R(g,62,12,5,17,'#cbc9c0');}
  if(hs==='hardhat'){R(g,46,9,37,16,cap);R(g,61,7,7,23,shade(cap,.28));R(g,34,31,62,7,shade(cap,.12));}
  if(hs==='cap'){R(g,60,23,10,8,'#d4ba72');R(g,63,24,4,4,'#fff0b0');}
  return;
 }
 if(hs==='bald'){R(g,40,39,6,19,hair);R(g,82,39,6,19,hair);R(g,45,30,5,6,light);return;}
 if(hs==='receding'){R(g,43,24,13,12,hair);R(g,74,24,12,12,hair);R(g,39,35,8,25,dark);R(g,82,35,8,25,hair);R(g,55,20,19,5,hair);R(g,47,28,4,3,light);return;}
 R(g,42,23,44,17,hair);R(g,48,18,31,8,hair);R(g,39,34,8,26,dark);R(g,81,34,8,26,hair);R(g,48,23,22,4,light);
 if(['part','slick','swept','short','side','crop','crew'].includes(hs)){
  R(g,43,34,23,12,hair);R(g,63,32,22,9,hair);R(g,45,43,13,8,hair);R(g,51,26,23,4,light);
  if(hs==='swept')R(g,36,25,16,13,hair);if(hs==='slick')R(g,54,20,24,4,light);
 }else if(['quiff','spiky','tousled','waveshort'].includes(hs)){
  R(g,46,12,18,15,hair);R(g,65,16,18,13,hair);R(g,42,35,18,14,hair);R(g,72,34,13,10,hair);R(g,52,18,14,5,light);
  if(hs==='spiky'){R(g,38,18,10,14,hair);R(g,76,10,10,17,hair);R(g,62,8,8,13,hair);}if(hs==='tousled')R(g,59,39,12,9,hair);
 }else if(['asym','pixie','blunt'].includes(hs)){
  R(g,42,30,38,13,hair);R(g,42,40,hs==='asym'?24:16,15,hair);R(g,72,37,13,17,hair);
  if(hs==='asym'){R(g,38,48,12,29,hair);R(g,42,43,4,24,light);}if(hs==='blunt')R(g,48,44,32,8,hair);
 }else{R(g,43,34,20,13,hair);R(g,73,34,12,19,hair);}
 if(['perm','curly','curlybob','waveshort'].includes(hs))for(const [x,y] of [[39,24],[48,15],[61,13],[74,18],[83,29],[36,39],[82,44]]){R(g,x,y,13,13,hair);R(g,x+3,y+1,6,3,light);}
 if(lk.streak){R(g,45,31,6,20,'#c7c8c4');R(g,51,23,6,8,'#aaafad');}
 if(lk.hairClip)R(g,77,41,6,11,'#e0c47d');
}

function portraitFace(g,lk){
 const skin=lk.sk||'#e8bb98',light=shade(skin,.13),shadow=shade(skin,-.17),deep=shade(skin,-.32),age=lk.age||35,variant=lk.variant||0,browY=[42,40,42,42,39,40,44,42][variant],mouthWidth=[4,5,6,7,4,5,6,7][variant],mouthY=variant>=4?65:62;
 R(g,57,67,15,17,shadow);R(g,46,30,36,34,skin);R(g,43,40,42,23,skin);R(g,48,63,32,9,skin);R(g,53,70,22,4,shadow);R(g,40,45,6,12,shadow);R(g,83,45,6,12,skin);
 R(g,49,34,28,7,light);R(g,45,45,3,11,light);R(g,79,46,3,13,shadow);R(g,51,65,25,2,shade(skin,-.08));
 for(const x of [53,74]){R(g,x,48,5,4,'#f3ecdf');R(g,x+2,48,2,4,'#263943');R(g,x+2,48,1,1,'#ffffff');R(g,x,52,5,1,shadow);}
 R(g,52,browY,9,2,shade(lk.hr||'#333',-.08));R(g,72,browY,9,2,shade(lk.hr||'#333',-.08));R(g,variant===2?66:65,53,2,4,shadow);R(g,67,56,2,1,light);R(g,65-Math.floor(mouthWidth/2),mouthY,mouthWidth,1,deep);R(g,63,mouthY+2,4,1,shade(skin,.2));
 if(lk.sex==='f'&&age<55){R(g,48,57,5,2,shade(skin,-.06));R(g,77,57,5,2,shade(skin,-.06));R(g,52,47,2,1,lk.hr||'#333');R(g,79,47,2,1,lk.hr||'#333');}
 if(lk.face==='square'){R(g,44,60,4,5,shadow);R(g,80,60,4,5,shadow);}if(lk.face==='round'){R(g,46,56,3,4,light);R(g,79,56,3,4,light);}
 if(age>=48){R(g,50,54,3,1,shadow);R(g,78,54,3,1,shadow);R(g,49,58,3,1,deep);R(g,78,58,3,1,deep);}
 if(age>=60){R(g,54,37,7,1,shadow);R(g,67,37,8,1,shadow);R(g,50,67,4,1,deep);R(g,75,67,4,1,deep);R(g,46,53,2,1,shadow);}
 if(age>=70){R(g,55,34,18,1,shadow);R(g,49,61,2,2,deep);R(g,78,61,2,2,deep);R(g,58,70,13,1,deep);}
 if(lk.gl){const frame=lk.glassesColor||'#3b4145';for(const x of [50,71]){R(g,x,45,12,2,frame);R(g,x,53,12,2,frame);R(g,x,47,2,6,frame);R(g,x+10,47,2,6,frame);}R(g,62,47,9,2,frame);R(g,44,46,6,2,frame);R(g,83,46,5,2,frame);}
 if(lk.bd){R(g,59,59,13,3,lk.hr||'#333');if(lk.bd!=='moustache'){R(g,54,64,23,6,lk.hr||'#333');R(g,59,69,13,4,lk.hr||'#333');}}
}

function portraitClothes(g,lk){
 const cloth=lk.cl||'#4e7485',dark=shade(cloth,-.25),light=shade(cloth,.17),shirt=lk.shirt||'#efeadc',accent=lk.c2||'#d7d1bf',pants=lk.pn||'#2d3c4d',skin=lk.sk||'#e8bb98',ty=lk.ty||'casual',a=lk.accessory;
 R(g,45,128,16,37,pants);R(g,68,128,16,37,shade(pants,-.08));R(g,59,132,10,28,shade(pants,-.25));R(g,42,161,21,9,lk.sh||'#252a32');R(g,67,161,22,9,lk.sh||'#252a32');R(g,44,161,17,3,shade(lk.sh||'#252a32',.16));R(g,69,161,18,3,shade(lk.sh||'#252a32',.13));
 R(g,29,86,15,43,shade(cloth,-.12));R(g,85,86,15,40,shade(cloth,-.18));R(g,30,124,13,12,skin);R(g,88,120,12,12,skin);R(g,31,124,10,3,shade(skin,.12));R(g,89,120,9,3,shade(skin,.1));
 if(ty==='dress'){R(g,39,116,51,36,cloth);R(g,43,145,45,8,dark);}else{R(g,39,80,50,55,cloth);R(g,41,80,46,5,light);R(g,83,86,6,46,dark);R(g,42,128,44,7,dark);}
 if(['coat','investigator'].includes(ty)){R(g,37,111,21,38,cloth);R(g,69,111,22,38,shade(cloth,-.08));R(g,58,119,11,27,shirt);R(g,41,143,15,5,dark);R(g,73,143,15,5,dark);}
 if(['suit','vest','jacket','investigator','coat','cardigan'].includes(ty)){
  R(g,54,80,22,32,shirt);R(g,47,82,10,27,dark);R(g,74,82,10,27,light);R(g,52,82,7,17,shade(cloth,.07));R(g,71,82,7,17,cloth);
  if(ty==='suit'){R(g,60,82,10,7,lk.tie||accent);R(g,62,89,6,27,lk.tie||accent);R(g,54,80,8,7,shirt);R(g,68,80,8,7,shirt);}
  if(ty==='cardigan'){R(g,62,95,3,3,accent);R(g,62,105,3,3,accent);R(g,62,115,3,3,accent);}
  if(ty==='vest'){R(g,30,88,11,34,shirt);R(g,88,88,11,31,shirt);R(g,63,107,3,3,'#c9ac67');}
 }
 if(ty==='uniform'){R(g,53,80,23,7,shirt);R(g,60,86,10,9,dark);R(g,41,82,14,4,'#d7bd73');R(g,75,82,13,4,'#d7bd73');R(g,43,104,12,8,dark);R(g,75,104,11,8,dark);for(const y of [96,109,122])R(g,64,y,3,3,'#e3ca7d');}
 if(ty==='apron'){R(g,47,81,7,19,accent);R(g,76,81,7,19,accent);R(g,48,96,34,39,accent);R(g,55,111,21,13,shade(accent,-.13));R(g,58,114,15,3,shade(accent,.15));}
 if(ty==='nurse'){R(g,53,80,23,7,shirt);R(g,60,86,10,5,shirt);R(g,63,99,4,4,'#faf7ef');R(g,63,116,4,4,'#faf7ef');}
 if(ty==='safety'){R(g,53,80,23,45,shirt);R(g,45,81,7,49,'#e3d55e');R(g,78,81,7,49,'#e3d55e');R(g,39,113,50,7,'#e3d55e');R(g,47,115,4,3,'#fff4a3');R(g,80,115,4,3,'#fff4a3');}
 if(ty==='investigator'){R(g,40,81,12,6,accent);R(g,78,81,11,6,accent);R(g,75,93,8,8,'#d8bd70');R(g,77,95,4,4,'#fff0ad');}
 if(['polo','work','casual','knit'].includes(ty)){R(g,54,80,9,5,light);R(g,68,80,9,5,light);R(g,61,86,7,4,dark);if(ty==='work'){R(g,44,108,12,11,dark);R(g,75,108,11,11,dark);}}
 if(a==='lanyard'){R(g,53,84,3,22,accent);R(g,74,84,3,22,accent);R(g,56,103,18,4,accent);R(g,58,106,14,15,shirt);R(g,61,109,8,3,'#77919a');}
 if(['badge','badgeScarf','brooch'].includes(a)){R(g,75,91,9,9,a==='brooch'?'#5f9a80':'#d8bd70');R(g,78,93,4,4,'#fff0ad');}
 if(a==='stethoscope'){R(g,52,85,4,25,'#334b55');R(g,75,85,4,25,'#334b55');R(g,55,107,21,4,'#334b55');R(g,74,109,8,8,'#a7b3b2');R(g,76,111,4,4,'#526a73');}
 if(a==='medical'){R(g,75,91,9,9,'#f4eee2');R(g,78,92,3,7,'#b86f78');R(g,76,94,7,3,'#b86f78');}
 if(a==='headset'){R(g,38,42,5,23,'#35464d');R(g,42,59,22,4,'#35464d');R(g,60,56,8,8,'#9aabad');}
 if(a==='chef'){R(g,53,80,23,4,'#a5534d');R(g,61,84,8,9,'#a5534d');}
 if(lk.neck==='scarf'||a==='scarf'){R(g,52,77,27,7,accent);R(g,71,83,8,25,accent);}
 if(lk.neck==='bow'||a==='bow'){R(g,54,82,9,7,accent);R(g,68,82,9,7,accent);R(g,63,83,5,5,shade(accent,-.2));}
 if(['folder','ledger','archive','office','blueprint','book'].includes(a)){const paper=a==='blueprint'?'#a8ccd6':a==='book'?'#81594a':'#e6dcc3';R(g,82,108,23,31,'#26353c');R(g,84,109,20,28,paper);R(g,87,113,13,3,'#7b929b');R(g,87,119,11,2,'#9aa7a7');R(g,88,130,12,9,skin);}
 if(a==='press'){R(g,79,111,24,17,'#35434b');R(g,84,114,13,8,'#8aa0a5');R(g,85,115,7,5,'#1e3038');}
}

function pixelCharacterPortrait(lk={}){
 const base=mk(128,192),g=base.getContext('2d');portraitHair(g,lk,true);portraitClothes(g,lk);portraitFace(g,lk);portraitHair(g,lk,false);
 const silhouette=mk(128,192),s=silhouette.getContext('2d');s.drawImage(base,0,0);s.globalCompositeOperation='source-in';R(s,0,0,128,192,'#202a32');
 const out=mk(128,192),o=out.getContext('2d');o.fillStyle='rgba(5,14,17,.32)';o.fillRect(32,173,70,5);o.fillRect(40,178,54,3);
 for(const [x,y] of [[2,0],[-2,0],[0,2],[0,-2],[1,1],[-1,1],[1,-1],[-1,-1]])o.drawImage(silhouette,x,y);o.drawImage(base,0,0);return out;
}
