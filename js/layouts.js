'use strict';

function configureLevels(){
  const plans={
    F1:{paths:[['H','A'],['B','C','E']],turns:['R','DR'],dark:[1,'C','L'],secret:[0,'A','U']},
    F2:{paths:[['H','B','E'],['A','C']],turns:['RD','R'],dark:[1,'C','D'],secret:[0,'B','U']},
    F3:{paths:[['H','C'],['E','A','B']],turns:['D','RU'],dark:[0,'C','R'],secret:[1,'B','R']},
    E1:{paths:[['H','A'],['B','E'],['C']],turns:['L','D',''],dark:[2,'C','R'],secret:[1,'E','R']},
    E2:{paths:[['H','C','E'],['A','B']],turns:['UR','D'],dark:[1,'B','L'],secret:[0,'E','U']},
    D1:{paths:[['H','B'],['E'],['A','C']],turns:['R','','L'],dark:[2,'A','U'],secret:[0,'B','D']},
    C1:{paths:[['H','A','E'],['B','C']],turns:['LD','U'],dark:[1,'C','R'],secret:[0,'E','L']},
    C2:{paths:[['H','E'],['C','A','B']],turns:['U','LD'],dark:[1,'B','R'],secret:[0,'E','L']},
    B1:{paths:[['H','A'],['C'],['B','E']],turns:['D','','R'],dark:[2,'E','D'],secret:[1,'C','U']},
    B2:{paths:[['H','B','E'],['A','C']],turns:['DL','R'],dark:[1,'C','U'],secret:[0,'E','L']},
    B3:{paths:[['H','C'],['A','E','B']],turns:['L','DR'],dark:[1,'B','D'],secret:[0,'C','U']},
    A1:{paths:[['H','A'],['B'],['C','E']],turns:['U','','D'],dark:[2,'E','R'],secret:[0,'A','L']},
    A2:{paths:[['H','E','B'],['C','A']],turns:['RU','L'],dark:[1,'A','U'],secret:[0,'B','R']},
    S1:{paths:[['H','E'],['A','C'],['B']],turns:['D','R',''],dark:[2,'B','U'],secret:[1,'C','D']}
  };
  const extras={
    F1:['證物覆核室','通關記錄核對室','值班登記員'],
    F2:['停電教務庫','家長接待室','校務助理'],
    F3:['封存調查庫','求職支援室','服務處接待員'],
    E1:['備用監控庫','報案跟進室','分站文員'],
    E2:['停用病歷室','護理諮詢室','診所接待員'],
    D1:['停電工程檔案室','核數準備室','大樓值班員'],
    C1:['停用項目資料室','訂位接待室','酒樓樓面主任'],
    C2:['封存公司資料庫','資金核對室','調查科文員'],
    B1:['停電觀測庫','防災協調室','氣象局行政員'],
    B2:['封存清單覆核室','訪客登記室','接待處文員'],
    B3:['停用通訊資料庫','跨境協查室','偵查組助理'],
    A1:['封存證物室','程序核對室','檢察院接待員'],
    A2:['停用證物資料庫','圖則覆核室','工務局文員'],
    S1:['封存官邸證物室','批文覆核室','司署接待員']
  };
  const annexes={
    C1:[1,'C','U'],C2:[1,'C','U'],B1:[2,'B','U'],B2:[1,'A','D'],
    B3:[1,'A','U'],A1:[2,'C','U'],A2:[1,'C','R'],S1:[2,'B','R']
  };
  const exerciseNote='【遊戲設計的虛構程序練習；非真實案件證據或歷史事件】\n';
  const exercises={
    C1:[{
      name:'訂位流程核對',type:'code',
      clue:'試用訂位單：甲的標籤是4，週一收件；乙是2，週二收件；丙是8，週三收件；丁是7，只作補登。驗證台只收正式收件單，按週一至週三排列，連讀標籤數字。',
      answer:'428',hint:'補登不算正式收件；先按收件先後排好，再讀標籤。'
    }],
    C2:[{
      name:'名義交易分類',type:'choice',
      clue:'練習帳簿：甲付出25單位；乙註明收到甲的25，分成10及15送往丙；丙註明收到乙的兩筆合共25；丁也有25，但沒有來源或轉出記錄。選出來源及每次交接均能核對的完整路徑，不能只憑總額相同連線。',
      answer:'甲 → 乙 → 丙',options:['甲 → 丁 → 丙','乙 → 甲 → 丙','甲 → 乙 → 丙','甲 → 丙 → 乙'],
      hint:'沿收款來源和轉出對象核對；同額但沒有交接記錄的一站不能接上。'
    }],
    B1:[{
      name:'感測紀錄校時',type:'code',
      clue:'模擬感測卡：甲標籤9，讀數時間08:12，時鐘快2分鐘；乙標籤3，08:11，時鐘準確；丙標籤6，08:10，時鐘快1分鐘。先扣除快出的分鐘，再按實際時間由早到遲連讀標籤。這些不是天鴿實測數據。',
      answer:'693',hint:'先校正每張卡的時間；不要直接按儀器顯示時間排序。'
    },{
      name:'預警覆核流程',type:'order',
      clue:'練習台規則：門檻比對必須使用已核對的感測來源；獨立覆核必須查看比對結果；發出演習通知必須等覆核完成。按依賴關係排列四個操作，不涉及真實風球標準。',
      answer:['核對感測來源','比對練習門檻','交獨立覆核','發出演習通知'],
      options:['交獨立覆核','發出演習通知','核對感測來源','比對練習門檻'],
      hint:'找出哪個操作不需要其他結果，再逐個接上需要它的操作。'
    }],
    B2:[{
      name:'公開資訊分流',type:'choice',
      clue:'練習資料分級規則：只有已核准且不含可識別個人資料的服務資訊可公開。四張模擬便條分別是：已核准接待時間、未核准調查方向、可識別對象的代號對照表、職員私人電話。選出唯一符合公開條件的一張。',
      answer:'已核准接待時間',options:['未核准調查方向','職員私人電話','已核准接待時間','對象代號對照表'],
      hint:'核准與不識別個人兩個條件都要成立；代號若能對回身份也不是匿名。'
    },{
      name:'保密封存流程',type:'order',
      clue:'練習封存規則：清點覆核要引用已編的文件號；封條只能貼在已清點覆核的袋上；入庫登記必須記下封條號。將四個操作按先後排列，所有袋內文件均為模擬材料。',
      answer:['為練習文件編號','清點並覆核','貼上編號封條','登記入庫位置'],
      options:['貼上編號封條','登記入庫位置','清點並覆核','為練習文件編號'],
      hint:'從不依賴封條或清點結果的操作開始；入庫時需要甚麼號碼？'
    }],
    B3:[{
      name:'協查收件排序',type:'code',
      clue:'虛構協查卡：甲標籤5，優先級2，收件日02；乙標籤8，優先級1，收件日03；丙標籤2，優先級1，收件日01；丁標籤7，優先級0，但已撤銷。剔除撤銷卡，優先級數字小的先處理，同級按收件日早的先，連讀標籤。',
      answer:'285',hint:'先看卡是否有效；排序要先比優先級，再比同級日期。'
    },{
      name:'通報最少必要資料',type:'choice',
      clue:'模擬接收端只獲授權接收練習代號、有效狀態及官方回覆渠道；三項都必須提供，其他資料不能附上。選出符合最少必要原則的資料包。沒有真實通緝對象或地址。',
      answer:'練習代號、有效狀態、官方回覆渠道',
      options:['練習代號、家庭住址、官方回覆渠道','練習代號、有效狀態','練習代號、有效狀態、官方回覆渠道','有效狀態、官方回覆渠道、私人電話'],
      hint:'逐項對照授權清單；少了必需項或多了未授權項都不合規。'
    }],
    A1:[{
      name:'權限審查流程',type:'order',
      clue:'模擬操作規則：確認准許範圍須先核對練習授權；操作記錄須限於已確認的範圍；封存副本須等操作記錄完成。排列四步；本台不簽發真實搜查令，也不要求案件證據。',
      answer:['核對練習授權','確認准許範圍','記錄模擬操作','封存練習副本'],
      options:['記錄模擬操作','封存練習副本','核對練習授權','確認准許範圍'],
      hint:'先確定可以做甚麼，再記錄操作；不能用事後封存代替事前授權。'
    },{
      name:'模擬封套校驗',type:'code',
      clue:'練習封套甲標籤6，在第3層；乙標籤4，在第1層；丙標籤8，在第4層；丁標籤2，在第2層。貨架第1層最底，第4層最高。按由底至頂連讀標籤，不按甲乙名稱排序。',
      answer:'4268',hint:'把層位和標籤分開看；層位決定順序，標籤才是輸入數字。'
    },{
      name:'移交範圍覆核',type:'choice',
      clue:'虛構移交授權只列「練習收據」及「練習清單」，要求兩份完整副本；醫療便條及私人通訊不在範圍。選出完整且沒有越權的移交包。本授權不能用於案件證物。',
      answer:'練習收據及練習清單的完整副本',
      options:['所有材料連醫療便條','只有練習收據副本','練習收據及練習清單的完整副本','練習清單及私人通訊'],
      hint:'核對包內是否剛好齊備授權的兩類，不要把無關私隱一併移交。'
    }],
    A2:[{
      name:'圖則版本校核',type:'code',
      clue:'模擬圖則卡：甲標籤7，版本3已核准；乙標籤4，版本1已核准；丙標籤9，版本2草稿；丁標籤2，版本2已核准。只收已核准版本，按版本數由小到大連讀標籤。不是任何真實項目圖則。',
      answer:'427',hint:'先剔除草稿，再排版本；標籤號不是版本號。'
    },{
      name:'比對練習流程',type:'order',
      clue:'模擬比對規則：統一比例尺要先固定核准基準；記錄尺寸差異須使用同一比例尺；交叉覆核須查看已記錄的差異及方法。依規則排列操作。',
      answer:['固定核准基準','統一比例尺','記錄尺寸差異','交叉覆核方法'],
      options:['記錄尺寸差異','固定核准基準','交叉覆核方法','統一比例尺'],
      hint:'差異可靠之前必須先有共同基準和尺度；覆核要有可查看的記錄。'
    },{
      name:'差異資料分流',type:'choice',
      clue:'虛構模型：核准卡高度12格，模型測量14格；比例尺和落款日期已核對。練習規則要求差異可追溯、由另一人覆核，不准只憑差異指控犯罪。哪個處理同時符合三項規則？',
      answer:'保留原始測量與方法，交獨立覆核',
      options:['把核准卡改成14格','保留原始測量與方法，交獨立覆核','只報高兩格並刪除原始測量','立即宣告模型設計者受賄'],
      hint:'差異需要可重做的測量記錄及獨立核對，不能自行改基準或推定犯罪。'
    }],
    S1:[{
      name:'印章申請練習',type:'order',
      clue:'模擬印章台：獨立覆核須先收到用途申請；核對用印須等覆核通過，且只蓋在相符的練習副本上；登記歸還須等用印完成。排列四步，不操作真實官印。',
      answer:['登記練習用途申請','交獨立覆核','核對副本後模擬用印','登記印章歸還'],
      options:['核對副本後模擬用印','登記印章歸還','交獨立覆核','登記練習用途申請'],
      hint:'印章不能先用後批；從覆核需要收到的材料開始排列。'
    },{
      name:'模擬批件分級',type:'code',
      clue:'虛構批件卡：甲標籤6，級別2，登記序03；乙標籤3，級別1，序02；丙標籤8，級別1，序01；丁標籤5，級別3，序00；戊標籤9，級別0，已取消。剔除取消件，級別數小的先，同級登記序小的先，連讀標籤。',
      answer:'8365',hint:'有效性優先於級別；同級才比較登記序，不要按標籤大小排序。'
    },{
      name:'利益衝突分流',type:'choice',
      clue:'虛構覆核員發現練習申請由自己的模擬關聯公司提交。練習規則要求留存利益申報、本人不參與判斷、並有獨立覆核接手。選出同時滿足三項的處理。此情境不是歷史事件。',
      answer:'記錄利益申報、本人迴避、交獨立覆核',
      options:['口頭告知同事後自行批准','本人直接否決並不留記錄','記錄利益申報、本人迴避、交獨立覆核','刪除關聯資料後交熟人批准'],
      hint:'只退出或只申報都不完整；還須有可追溯記錄和獨立接手者。'
    },{
      name:'雙人移交練習',type:'order',
      clue:'模擬移交規則：雙人核對編號須使用清點結果；貼封條並聯簽須等編號一致；登記接收去向須引用已聯簽的封條。排列四步，文件與簽名均為遊戲練習材料。',
      answer:['清點模擬文件','雙人核對編號','貼封條並聯簽','登記接收去向'],
      options:['登記接收去向','貼封條並聯簽','清點模擬文件','雙人核對編號'],
      hint:'接收記錄要引用甚麼？沿封條、編號和清點結果的依賴關係倒推。'
    }]
  };
  const vectors={R:[1,0],D:[0,1],L:[-1,0],U:[0,-1]};
  const attach=(rect,dir,w,h)=>{
    const [x,y,rw,rh]=rect;
    if(dir==='R')return [x+rw-1,y,w,h];
    if(dir==='L')return [x-w+1,y,w,h];
    if(dir==='D')return [x,y+rh-1,w,h];
    return [x,y-h+1,w,h];
  };
  const touches=(a,b)=>Math.max(a[0],b[0])<=Math.min(a[0]+a[2]-1,b[0]+b[2]-1)&&
    Math.max(a[1],b[1])<=Math.min(a[1]+a[3]-1,b[1]+b[3]-1);
  const dimensions=(index,r)=>{
    if(r==='X')return [[16,12],[18,13],[15,15]][index%3];
    if(r==='H')return [[24,17],[20,23],[26,16],[18,24]][index%4];
    const sizes=[[16,19],[23,15],[15,24],[24,18],[19,21],[21,16],[17,22]];
    return sizes[(index*3+r.charCodeAt(0)+(Number(r.slice(1))||0))%sizes.length];
  };
  const addRoom=(rooms,r,parent,preferred,size)=>{
    for(const dir of [preferred,...Object.keys(vectors).filter(d=>d!==preferred)]){
      const base=attach(rooms[parent],dir,...size),axis=dir==='U'||dir==='D'?0:1;
      for(const offset of [0,-2,2,-4,4,-6,6]){
        const rect=base.slice();rect[axis]+=offset;
        const p=rooms[parent],span=axis===0?2:3;
        if(Math.min(rect[axis]+rect[span],p[axis]+p[span])-Math.max(rect[axis],p[axis])<9)continue;
        if(Object.entries(rooms).some(([key,other])=>key!==parent&&touches(rect,other)))continue;
        rooms[r]=rect;return;
      }
    }
    throw new Error('No safe attachment for '+r+' at '+parent);
  };
  const shared=(a,b)=>{
    const [x,y,w,h]=a,[u,v,s,t]=b;
    if(x+w-1===u||u+s-1===x){
      const wall=x+w-1===u?u:x,lo=Math.max(y,v)+2,hi=Math.min(y+h-2,v+t-2);
      const mid=Math.floor((lo+hi-1)/2);
      return [[wall,mid],[wall,mid+1]];
    }
    if(y+h-1===v||v+t-1===y){
      const wall=y+h-1===v?v:y,lo=Math.max(x,u)+1,hi=Math.min(x+w-2,u+s-2);
      const mid=Math.floor((lo+hi-1)/2);
      return [[mid,wall],[mid+1,wall]];
    }
    throw new Error('Rooms do not share a wall');
  };
  const shapeRoom=(tpl,k,seed)=>{
    const [rx,ry,w,h]=tpl.rooms[k],shape={kind:'rect',voids:[],walls:[],openings:[],subspaces:[]};
    tpl.shapes[k]=shape;
    if(k==='X')return; // Keep the legacy file wall and pass pedestal in a clear landing.
    const portals=(tpl.links||[]).filter(l=>l.a===k||l.b===k).flatMap(l=>l.cells).map(([x,y])=>[x-rx,y-ry]);
    const notch=seed%3===0?[w-5,h-6,5,6]:seed%3===1?[0,h-5,4,5]:null;
    if(notch&&!portals.some(([x,y])=>x>=notch[0]-2&&x<notch[0]+notch[2]+2&&y>=notch[1]-2&&y<notch[1]+notch[3]+2)){
      shape.kind='L';shape.voids=[notch];
      shape.outline=notch[0]?[[0,0],[w,0],[w,h-6],[w-5,h-6],[w-5,h],[0,h]]:[[0,0],[w,0],[w,h],[4,h],[4,h-5],[0,h-5]];
    }else if(seed%3===2&&w>=h&&!portals.some(([x,y])=>x>w-6&&y>=5&&y<=12)){
      shape.kind='alcove';shape.voids=[[w-3,6,3,4]];
      shape.outline=[[0,0],[w,0],[w,6],[w-3,6],[w-3,10],[w,10],[w,h],[0,h]];
    }
    const wall=(x,y)=>{
      if(shape.voids.some(([a,b,c,d])=>x>=a-1&&x<a+c+1&&y>=b-1&&y<b+d+1))return;
      if(portals.some(([a,b])=>Math.abs(x-a)<=3&&Math.abs(y-b)<=3))return;
      shape.walls.push([x,y]);
    };
    // Two/three domestic-sized spaces, joined by generous, real door openings.
    if(w>=h){
      const x=Math.floor(w*.52),door=Math.floor(h*.55);
      for(let y=2;y<h-1;y++)if(y<door||y>door+2)wall(x,y);
      shape.openings.push([x,door,1,3]);
      shape.subspaces.push([1,1,x-2,h-5],[x+1,1,w-x-4,h-5]);
      if(w>=22){const y=6;for(let a=x+1;a<w-1;a++)if(a<x+3||a>x+5)wall(a,y);shape.openings.push([x+3,y,3,2]);}
    }else{
      const y=Math.floor(h*.5),door=Math.floor(w*.45);
      for(let x=1;x<w-1;x++)if(x<door||x>door+2)wall(x,y);
      shape.openings.push([door,y,3,2]);
      shape.subspaces.push([1,1,w-4,y-3],[1,y+1,w-4,h-y-5]);
      if(h>=22){const x=Math.floor(w*.6);for(let b=2;b<y;b++)if(b<4||b>6)wall(x,b);shape.openings.push([x,4,1,3]);}
    }
  };
  const overlap=(a,b,gap=0)=>a[0]<b[0]+b[2]+gap&&b[0]<a[0]+a[2]+gap&&a[1]<b[1]+b[3]+gap&&b[1]<a[1]+a[3]+gap;
  const furnishPlan=(lv,tpl,floor)=>{
    const map=mapGeometry(tpl,{rooms:lv.rooms,openDoors:tpl.links.flatMap(l=>l.cells),secretOpen:true});
    const occupied=[],wallProps=[],targets=[],feet=[];
    const floorBox=([x,y,w,h])=>{
      for(let b=Math.floor(y/T);b<=Math.floor((y+h-.01)/T);b++)for(let a=Math.floor(x/T);a<=Math.floor((x+w-.01)/T);a++)
        if(a<0||b<0||a>=map.W||b>=map.H||map.tiles[b*map.W+a]!==1)return false;
      return true;
    };
    const fit=(s,npc=false,normalized=true)=>{
      const r=map.rooms[s.r],oldW=s.r==='X'?14:18,oldH=s.r==='X'?10:21;
      const wantX=normalized?s.x*(r.w-4)/(oldW-4):s.x,wantY=s.y<0?-1:normalized?s.y*(r.h-5)/(oldH-5):s.y;
      let best=null,score=Infinity;
      for(let y=s.y<0?-1:0;y<(s.y<0?0:r.wh-1);y+=.5)for(let x=0;x<r.ww-1;x+=.5){
        const cost=(x-wantX)**2+(y-wantY)**2;if(cost>=score)continue;
        const p=npc?null:place(r,s.t,x,y,s.o);
        if(!npc&&!p)throw new Error('Unknown fixture '+s.t);
        const foot=npc?[(r.ox+x+.5)*T,(r.oy+y+.8)*T]:null;
        const box=npc?[foot[0]-9,foot[1]-6,18,12]:p.sb||[p.x,p.y,p.w,p.h];
        let approach;
        if(p?.wall){
          if(x+p.w/T>r.ww||wallProps.some(q=>q.room===s.r&&overlap(box,q.box,4)))continue;
          let valid=true;for(let a=Math.floor(p.x/T);a<=Math.floor((p.x+p.w-1)/T);a++)if(map.tiles[(r.oy-1)*map.W+a]!==3)valid=false;
          if(!valid)continue;
          approach=[p.x+p.w/2,r.oy*T+12];
        }else{
          if(!floorBox(box)||occupied.some(q=>overlap(box,q,10)))continue;
          approach=npc?[foot[0],foot[1]+16]:[box[0]+box[2]/2,box[1]+box[3]+10];
        }
        const approachBox=[approach[0]-5,approach[1]-5,10,6];
        if(!floorBox(approachBox)||occupied.some(q=>overlap(approachBox,q,3)))continue;
        best={x,y,p,foot,box,approach};score=cost;
      }
      if(!best)throw new Error('No usable position: '+lv.id+'/'+s.r+'/'+(s.n||s.nm||s.t));
      s.x=best.x;s.y=best.y;
      if(npc){feet.push(best.foot);occupied.push(best.box);}
      else if(best.p.wall)wallProps.push({room:s.r,box:best.box});
      else{occupied.push(best.box);if(best.p.sb)map.props.push(best.p);}
      targets.push(best.approach);
      if(best.p?.flat)targets.push([best.p.x+best.p.w/2,best.p.y+best.p.h/2]);
      return best;
    };
    // Arrival points, stair footprints and interaction fronts are never furnished over.
    const stairs=lv.stairs.filter(s=>s.floor===floor);
    for(const s of stairs){fit(Object.assign(s,{t:'stairs'}));s.arrival=[map.rooms[s.r].ox+s.x+1,map.rooms[s.r].oy+s.y+1];targets.push(s.arrival.map(v=>v*T));}
    if(tpl.rooms.X){
      fit({r:'X',t:'mapboard',x:3.5,y:-1},false,false);
      fit({r:'X',t:'pedestal',x:5,y:2.2},false,false);
    }
    if(floor===0)fit({r:tpl.spawnRoom,t:'exitdoor',x:8,y:-1},false,false);
    for(const s of lv.spots)if(map.rooms[s.r])fit(s);
    if(map.rooms[lv.secretEntrance.r])fit(lv.secretEntrance,false,false);
    for(const n of lv.npcs.concat(lv.secret.npcs||[]))if(map.rooms[n.r])fit(n,true);
    const r=map.rooms[tpl.spawnRoom];
    const desired=[(r.x+r.w/2)*T,(r.y+r.h-3)*T];
    const free=(x,y)=>![[ -4,0],[4,0],[-4,-4],[4,-4]].some(([dx,dy])=>solidAt(map,x+dx,y+dy))&&!feet.some(([a,b])=>Math.abs(x-a)<9&&Math.abs(y-b)<6);
    // Match game.js's half-tile pathfinder and player feet, with actual props/NPCs.
    const w=map.W*2,h=map.H*2,valid=new Uint8Array(w*h),nodes=[];
    for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(free(x*8+4,y*8+4)){valid[y*w+x]=1;nodes.push(y*w+x);}
    const point=i=>[(i%w)*8+4,Math.floor(i/w)*8+4];
    const nearest=p=>nodes.reduce((a,b)=>{const q=point(b),d=(q[0]-p[0])**2+(q[1]-p[1])**2;return d<a.d?{i:b,d}:a;},{i:-1,d:Infinity}).i;
    const start=nearest(desired),queue=[start],parent=new Int32Array(w*h).fill(-1);parent[start]=start;
    for(let i=0;i<queue.length;i++){
      const a=queue[i],x=a%w,y=Math.floor(a/w);
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,b=ny*w+nx;if(nx<0||ny<0||nx>=w||ny>=h||!valid[b]||parent[b]!==-1)continue;parent[b]=a;queue.push(b);}
    }
    tpl.spawn=point(start).map(v=>v/T);
    // Reserve room circulation, not a dense grid that leaves no space for a desk group.
    for(const room of Object.values(map.rooms)){
      for(const [x,y,w,h] of room.subspaces.length?room.subspaces:[[1,2,room.ww,room.wh]])
        targets.push([(room.x+x+w/2)*T,(room.y+y+h/2)*T]);
    }
    for(const link of tpl.links)for(const [x,y] of link.cells)targets.push([(x+.5)*T,(y+.5)*T]);
    const used=new Set();
    for(const target of targets){
      let at=nearest(target);
      if(parent[at]===-1)throw new Error('Disconnected interior: '+lv.id+'/'+floor+' at '+target);
      while(!used.has(at)){used.add(at);if(parent[at]===at)break;at=parent[at];}
    }
    tpl.keep=Array.from(used,i=>point(i).map(v=>v/T));
    tpl.reservedFeet=feet.map(p=>p.map(v=>v/T));
  };
  LEVELS.forEach((lv,index)=>{
    const plan=plans[lv.id];
    if(!plan)throw new Error('Missing layout: '+lv.id);
    delete lv.dark;
    for(const r of Object.values(lv.rooms))delete r.dark;
    const [darkName,extraName,supplier]=extras[lv.id],access=index%2?'調查區通行卡':'調查區鎖匙';
    lv.rooms.D={n:darkName,k:'storage',fl:'concrete:#30333c',wc:'#363b48',dark:true};
    lv.rooms.E={n:extraName,k:['meeting','waiting','office'][index%3],fl:lv.rooms.H.fl,wc:lv.rooms.H.wc};
    lv.items=lv.items||{};
    lv.items[access]=supplier+'提供的普通調查區憑證，只用來開啟'+darkName+'。';
    const annex=annexes[lv.id];
    if(annex){
      lv.puzzle={access,steps:exercises[lv.id].map((step,i)=>({room:'P'+i,...step,clue:exerciseNote+step.clue}))};
      lv.puzzle.steps.forEach((step,i)=>{
        lv.rooms[step.room]={n:step.name+'程序練習室',k:'meeting',fl:lv.rooms.H.fl,wc:lv.rooms.H.wc};
        lv.spots.push(
          {r:step.room,t:'files',x:4,y:4,puzzleClue:i,nm:step.name+'提示文件',say:step.clue},
          {r:step.room,t:'board',x:8,y:-1,puzzleStep:i,nm:step.name+'驗證台',say:exerciseNote+'先閱讀本室提示文件，再依次完成各室驗證；錯誤可重試，不是案件結局。'}
        );
      });
      lv.items[access]='完成全部'+lv.puzzle.steps.length+'站遊戲設計程序練習後取得的普通房門憑證，只用來開啟'+darkName+'；不是案件證據或證物權限。';
    }
    const clue=lv.spots.find(s=>!s.egg&&lv.evs.includes(s.got)&&s.y>=0);
    if(!clue)throw new Error('Missing movable evidence: '+lv.id);
    const clueRoom=clue.r;
    clue.r='D';clue.x=4;clue.y=4;
    const names=lv.rooms[clueRoom].n,clueName=clue.nm||clue.got;
    lv.npcs.push({r:'E',x:2,y:12,n:'等候中的訪客',lk:{sk:'#e0b890',hr:'#40362f',hs:'short',cl:'#8a7055',ty:'casual'},d:['我只係嚟交份表格，呢宗案我唔清楚。','等咗一陣，想出去買杯奶茶。']});
    lv.npcs.push(
      {r:'H',x:7,y:15,n:supplier,lk:{sk:'#e8c098',hr:'#40302a',hs:'short',cl:'#4a647a',ty:'vest'},d:[
        names+'轉交的「'+clueName+'」已封存到'+darkName+'。該室電力暫停，入內請用電筒搜查。',
        {q:'「可以依程序領取調查區憑證嗎？」',o:[{t:'登記領取'+access,s:'登記完成。'+access+'交給你；這是普通房門憑證，請按房門標示使用。',give:access}]}]},
      {r:'A',x:13,y:10,n:'資料核對助理',lk:{sk:'#f0c8a0',hr:'#35251b',hs:'bob',cl:'#557a68',ty:'cardigan',c2:'#e8e0cc'},d:[
        '調查「'+lv.name+'」要將記錄逐項核對；「'+lv.evs[0]+'」同「'+lv.evs[1]+'」可以先作比對。',
        '原有證人仍在各自工作室。搵齊文件同證詞，再同負責人對質，唔好只靠猜測。']},
      {r:'E',x:12,y:10,n:'證物覆核員',lk:{sk:'#e0b890',hr:'#514033',hs:'part',cl:'#6a5a7a',ty:'suit',tie:'#d4c8b4'},d:[
        '「'+clue.got+'」要親手搜查'+darkName+'入面嘅「'+clueName+'」。先到大堂向'+supplier+'領取'+access+'。',
        clue.need?'證物本身仍需要「'+clue.need+'」。房門憑證同證物權限不同，兩樣都要準備。':'進房後靠近證物搜查，再將內容同其他記錄核對。電筒只照到面前一小段路。']}
    );
    if(annex){
      const first=lv.puzzle.steps[0],last=lv.puzzle.steps[lv.puzzle.steps.length-1];
      const route='到'+(annex[0]+1)+'樓「'+lv.rooms[first.room].n+'」，先讀「'+first.name+'提示文件」，再到驗證台；沿公開連房依次完成'+lv.puzzle.steps.length+'站，最後「'+last.name+'驗證台」通過後取得'+access+'。';
      const supplierNpc=lv.npcs[lv.npcs.length-3],option=supplierNpc.d[1].o[0];
      supplierNpc.d[0]+='\n這些驗證是遊戲設計的程序練習，不是真實案件證據或歷史事件，不需先收集原案證據。'+route;
      option.t='查詢附室驗證程序';
      option.s='我不直接發出'+access+'；請完成「'+first.name+'」起至「'+last.name+'」的附室驗證。'+route;
      delete option.give;
      lv.npcs[lv.npcs.length-1].d[0]='「'+clue.got+'」仍要親手搜查'+darkName+'入面嘅「'+clueName+'」。'+route;
    }
    lv.floors=plan.paths.map((path,floor)=>{
      const rooms={};
      path.forEach((r,i)=>{
        if(i)addRoom(rooms,r,path[i-1],plan.turns[floor][i-1],dimensions(index,r));
        else rooms[r]=[0,0,...dimensions(index,r)];
      });
      if(plan.dark[0]===floor)addRoom(rooms,'D',plan.dark[1],plan.dark[2],dimensions(index,'D'));
      if(plan.secret[0]===floor)addRoom(rooms,'X',plan.secret[1],plan.secret[2],dimensions(index,'X'));
      if(annex&&annex[0]===floor)lv.puzzle.steps.forEach((s,i)=>addRoom(rooms,s.room,i?'P'+(i-1):annex[1],annex[2],dimensions(index,s.room)));
      const minX=Math.min(...Object.values(rooms).map(r=>r[0])),minY=Math.min(...Object.values(rooms).map(r=>r[1]));
      for(const rect of Object.values(rooms)){rect[0]-=minX;rect[1]-=minY;}
      return {W:Math.max(...Object.values(rooms).map(r=>r[0]+r[2])),H:Math.max(...Object.values(rooms).map(r=>r[1]+r[3])),rooms,doors:[],spawnRoom:path[0],keep:[],shapes:{},label:(floor+1)+' 樓',elevation:floor};
    });
    lv.links=[];
    const link=(floor,a,b,secret,need)=>{
      const tpl=lv.floors[floor],cells=shared(tpl.rooms[a],tpl.rooms[b]),entry={floor,a,b,cells,secret:!!secret};
      if(need)entry.need=need;
      lv.links.push(entry);
      if(!secret&&!need)tpl.doors.push(...cells);
      return entry;
    };
    plan.paths.forEach((path,floor)=>{for(let i=1;i<path.length;i++)link(floor,path[i-1],path[i],false);});
    link(plan.dark[0],plan.dark[1],'D',false,access);
    if(annex)lv.puzzle.steps.forEach((step,i)=>link(annex[0],i?'P'+(i-1):annex[1],step.room,false));
    const secret=link(plan.secret[0],plan.secret[1],'X',true);
    const tpl=lv.floors[secret.floor],[rx,ry,rw,rh]=tpl.rooms[secret.a];
    const cx=(secret.cells[0][0]+secret.cells[1][0]+1)/2,cy=(secret.cells[0][1]+secret.cells[1][1]+1)/2;
    const model=['shelf','safe','trapdoor','stairs'][index%4],entryNames={shelf:'移動書櫃',safe:'嵌牆保險箱機關',trapdoor:'地板暗門',stairs:'封閉後樓梯'};
    lv.secretEntrance={r:secret.a,t:model,nm:entryNames[model],o:{seed:42},x:Math.max(1.5,Math.min(rw-4,cx-rx-2)),y:Math.max(1,Math.min(rh-5,cy-ry-3)),extra:{model,kind:'wall',unlock:'secret-pass',landing:'X',floor:secret.floor}};
    lv.stairs=[];
    const stairPair=(aFloor,a,bFloor,b)=>{
      const pair='stair:'+lv.stairs.length;
      lv.stairs.push({floor:aFloor,r:a,x:12.5,y:15.5,to:bFloor,pair},{floor:bFloor,r:b,x:3.5,y:15.5,to:aFloor,pair});
    };
    for(let floor=0;floor<lv.floors.length-1;floor++)stairPair(floor,plan.paths[floor].at(-1),floor+1,plan.paths[floor+1][0]);
    // Appended indices keep every public floor / annex index stable. The only
    // route to B1 is a stair in the pass-locked X landing; no game.js gate bypass.
    if(model==='trapdoor'||model==='stairs'){
      const floor=lv.floors.length,[w,h]=[20+index%3,17+index%2];
      lv.rooms.XB={n:'地下封存檔案室',k:'archive',fl:'concrete:#414744',wc:'#4b5552'};
      lv.floors.push({W:w,H:h,rooms:{XB:[0,0,w,h]},doors:[],spawnRoom:'XB',keep:[],shapes:{},hidden:true,secretRoot:'X',label:'B1 地下檔案層',elevation:-1});
      stairPair(secret.floor,'X',floor,'XB');
      if(lv.secret.npcs?.[1])lv.secret.npcs[1].r='XB';
      Object.assign(lv.secretEntrance.extra,{kind:'basement',basementFloor:floor,basementRoom:'XB'});
    }
    lv.floors.forEach((floor,f)=>{
      floor.links=lv.links.filter(l=>l.floor===f);
      Object.keys(floor.rooms).forEach((r,i)=>shapeRoom(floor,r,index*7+i*3+r.charCodeAt(0)));
      furnishPlan(lv,floor,f);
    });
    for(const stair of lv.stairs){const other=lv.stairs.find(s=>s!==stair&&s.pair===stair.pair);stair.spawn=other.arrival.slice();stair.nm='樓梯 → '+lv.floors[stair.to].label;}
    if(lv.secretEntrance.extra.kind==='basement'){
      const stair=lv.stairs.find(s=>s.r==='X');
      lv.secretEntrance.extra.destination={to:stair.to,spawn:stair.spawn.slice()};
    }
  });
}
