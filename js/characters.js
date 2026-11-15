'use strict';

const CHARACTER_PALETTE = Object.freeze({
  black:'#24262a',brown:'#4b342b',chestnut:'#654637',auburn:'#764936',silver:'#bec1c2',grey:'#777b7d',salt:'#55585b',
  navy:'#283c58',emerald:'#286855',forest:'#3c5949',teal:'#4b7b7c',petrol:'#3f6972',sage:'#77927a',olive:'#73775a',
  slate:'#5b7088',steel:'#5d7589',charcoal:'#41434b',plum:'#725467',violet:'#80718a',mauve:'#a27687',rose:'#b88791',
  rust:'#a5664a',terracotta:'#b77054',ochre:'#ae8752',camel:'#b69a76',sand:'#c1ac8a',taupe:'#85755f',
  cream:'#eee3cd',ivory:'#f2eee2',white:'#eeeff0',blue:'#55799b',azure:'#508eb1',indigo:'#4a537c',
  burgundy:'#773e48',gold:'#c4a45b',lavender:'#b6a5c4',pink:'#d4a0ac',greyblue:'#8494a0'
});

// Row-major casting order is also the generated contact-sheet order. Never reorder.
const CHARACTER_CAST = `
LOBBY:main:0|74|m|wide|bald|silver|rust|apron|cream|round|shop
LOBBY:main:1|57|f|angular|bun|brown|charcoal|suit|ivory|rect|brooch
LOBBY:main:2|24|m|oval|part|black|navy|suit|emerald|-|badge
F1:main:0|66|m|square|cap|silver|forest|uniform|gold|-|customs
F1:main:1|29|f|heart|bob|black|teal|coat|ivory|-|pen
F1:main:2|58|f|round|perm|brown|plum|apron|sand|-|cleaner
F1:main:3|46|m|square|cap|black|burgundy|uniform|gold|-|customs
F1:main:4|35|m|long|tousled|chestnut|ochre|polo|cream|-|satchel
F1:main:5|31|f|oval|ponytail|brown|slate|vest|teal|-|lanyard
F1:main:6|26|f|heart|asym|chestnut|sage|cardigan|burgundy|round|lanyard
F1:main:7|43|m|long|part|salt|plum|suit|cream|rect|folder
F1:secret:0|71|m|long|receding|silver|navy|suit|emerald|-|badge
F1:secret:1|48|f|square|braidbun|brown|charcoal|suit|greyblue|rect|scarf
F2:main:0|42|f|round|waves|chestnut|mauve|dress|cream|-|collar
F2:main:1|32|f|long|halfup|black|teal|cardigan|gold|rect|lanyard
F2:main:2|67|m|square|crop|silver|olive|apron|sand|-|caretaker
F2:main:3|47|m|long|part|black|forest|suit|ochre|rect|teacher
F2:main:4|38|f|wide|waves|chestnut|terracotta|cardigan|cream|-|satchel
F2:main:5|28|m|square|crop|black|steel|vest|gold|-|lanyard
F2:main:6|52|f|wide|pixie|salt|greyblue|cardigan|ochre|rect|lanyard
F2:main:7|36|f|diamond|lowbun|black|plum|suit|lavender|rimless|folder
F2:secret:0|62|f|long|bob|salt|rose|cardigan|cream|-|pearl
F2:secret:1|34|m|round|quiff|black|navy|jacket|sage|-|badge
F3:main:0|44|m|square|crop|black|ochre|work|sand|-|panel
F3:main:1|56|m|wide|cap|salt|slate|uniform|gold|-|security
F3:main:2|30|f|oval|highpony|black|navy|suit|emerald|-|badge
F3:main:3|41|m|long|slick|brown|olive|vest|teal|rect|id
F3:main:4|68|m|square|waveshort|silver|sand|cardigan|olive|-|satchel
F3:main:5|27|f|round|blunt|chestnut|teal|vest|rose|-|scarf
F3:main:6|33|m|angular|curly|brown|sage|cardigan|rust|rect|lanyard
F3:main:7|55|m|wide|swept|salt|plum|suit|greyblue|-|folder
F3:secret:0|64|m|long|part|silver|navy|suit|emerald|-|badge
F3:secret:1|59|m|oval|crew|salt|olive|work|sand|-|pockets
E1:main:0|49|m|long|cap|salt|navy|uniform|gold|-|police
E1:main:1|28|f|heart|pixie|black|burgundy|casual|cream|-|id
E1:main:2|37|f|oval|asym|chestnut|teal|coat|white|rect|pen
E1:main:3|36|m|square|cap|black|slate|uniform|gold|-|police
E1:main:4|23|f|round|braid|black|ochre|knit|cream|-|satchel
E1:main:5|45|m|long|swept|chestnut|slate|vest|burgundy|round|lanyard
E1:main:6|29|f|angular|ponytail|auburn|sage|cardigan|blue|-|lanyard
E1:main:7|50|f|square|bob|salt|violet|suit|cream|rect|brooch
E1:secret:0|54|m|long|receding|salt|navy|suit|sage|-|badge
E1:secret:1|48|f|round|cap|black|navy|uniform|gold|-|police
E2:main:0|27|f|oval|bun|black|pink|nurse|white|-|medical
E2:main:1|32|m|diamond|side|black|sage|coat|ivory|-|medical
E2:main:2|63|f|wide|perm|salt|camel|cardigan|gold|-|collar
E2:main:3|58|m|long|part|grey|white|coat|blue|rect|stethoscope
E2:main:4|72|m|round|bald|silver|olive|cardigan|sand|round|satchel
E2:main:5|40|f|square|lowbun|chestnut|steel|vest|pink|rect|scarf
E2:main:6|25|m|heart|tousled|black|sage|cardigan|teal|-|lanyard
E2:main:7|46|m|diamond|receding|brown|plum|suit|gold|rect|folder
E2:secret:0|61|m|wide|swept|grey|white|coat|teal|round|stethoscope
E2:secret:1|39|f|oval|braidbun|black|navy|suit|emerald|-|badgeScarf
D1:main:0|68|m|square|cap|grey|slate|uniform|gold|-|security
D1:main:1|26|m|long|spiky|black|teal|polo|blue|rect|lanyard
D1:main:2|51|m|wide|crew|brown|taupe|vest|cream|-|keys
D1:main:3|39|m|angular|slick|black|charcoal|suit|indigo|-|office
D1:main:4|57|f|long|waves|salt|rust|cardigan|cream|-|satchel
D1:main:5|35|f|round|pixie|brown|navy|vest|gold|-|keys
D1:main:6|44|f|oval|twist|auburn|sage|cardigan|violet|round|lanyard
D1:main:7|31|m|square|waveshort|black|plum|suit|greyblue|-|folder
D1:secret:0|54|f|diamond|bob|salt|navy|suit|ivory|rect|ledger
D1:secret:1|42|m|wide|curly|black|navy|suit|emerald|-|badge
C1:main:0|25|f|round|bun|black|burgundy|vest|burgundy|-|bow
C1:main:1|48|m|long|slick|black|plum|suit|gold|rect|business
C1:main:2|45|m|square|chef|black|white|apron|cream|-|chef
C1:main:3|38|f|angular|asym|chestnut|steel|suit|ivory|rect|brooch
C1:main:4|59|m|square|part|grey|charcoal|suit|forest|-|official
C1:main:5|29|m|oval|quiff|chestnut|camel|casual|ivory|-|satchel
C1:main:6|46|f|diamond|ponytail|black|burgundy|vest|gold|-|scarf
C1:main:7|37|m|wide|crop|brown|sage|cardigan|terracotta|round|lanyard
C1:main:8|58|f|long|pixie|silver|plum|suit|ivory|rect|folder
C1:secret:0|50|m|square|swept|salt|navy|suit|emerald|-|badge
C1:secret:1|63|m|round|bald|salt|charcoal|suit|burgundy|-|business
C2:main:0|33|f|heart|long|chestnut|ochre|suit|ivory|-|keys
C2:main:1|44|m|long|crew|black|navy|suit|azure|rect|id
C2:main:2|49|f|round|braidbun|black|olive|cardigan|ochre|-|lanyard
C2:main:3|52|m|diamond|slick|salt|plum|suit|gold|rimless|business
C2:main:4|66|f|oval|perm|grey|sand|cardigan|rust|-|satchel
C2:main:5|30|m|square|quiff|brown|steel|vest|teal|-|lanyard
C2:main:6|24|f|oval|blunt|black|sage|cardigan|rose|-|lanyard
C2:main:7|41|m|wide|waveshort|brown|plum|suit|lavender|round|folder
C2:secret:0|35|f|angular|bob|black|navy|suit|lavender|cat|badgeScarf
C2:secret:1|56|f|long|twist|salt|charcoal|suit|greyblue|rect|scarf
B1:main:0|34|m|oval|tousled|black|teal|cardigan|blue|rect|lanyard
B1:main:1|29|f|round|bob|chestnut|ochre|casual|teal|-|headset
B1:main:2|38|m|diamond|quiff|black|navy|suit|emerald|-|badge
B1:main:3|62|m|wide|receding|grey|charcoal|suit|blue|rect|official
B1:main:4|45|m|long|curly|brown|terracotta|polo|cream|-|satchel
B1:main:5|32|f|heart|highpony|brown|steel|vest|ochre|-|scarf
B1:main:6|60|f|wide|bob|silver|sage|cardigan|burgundy|round|lanyard
B1:main:7|28|m|long|side|black|plum|suit|greyblue|-|folder
B1:secret:0|53|f|square|bun|salt|charcoal|suit|ivory|rect|brooch
B1:secret:1|73|m|long|receding|silver|teal|cardigan|greyblue|round|pen
B2:main:0|31|f|oval|long|chestnut|olive|work|cream|rect|press
B2:main:1|61|f|round|lowbun|grey|brown|cardigan|sand|round|archive
B2:main:2|57|m|square|slick|salt|charcoal|suit|ochre|-|official
B2:main:3|42|f|oval|waves|chestnut|mauve|cardigan|cream|-|pearl
B2:main:4|22|m|heart|tousled|black|camel|work|ivory|-|satchel
B2:main:5|47|f|wide|curly|brown|steel|vest|plum|rect|scarf
B2:main:6|39|m|angular|ponytail|brown|sage|cardigan|blue|rimless|lanyard
B2:main:7|34|f|diamond|asym|black|plum|suit|ivory|-|brooch
B2:secret:0|60|m|oval|crop|silver|navy|suit|emerald|rect|badge
B2:secret:1|28|f|round|waves|black|sage|cardigan|cream|-|brooch
B3:main:0|43|m|square|cap|black|slate|uniform|gold|-|immigration
B3:main:1|45|f|long|braidbun|chestnut|camel|cardigan|burgundy|rect|lanyard
B3:main:2|36|m|heart|slick|black|petrol|suit|greyblue|-|id
B3:main:3|41|m|square|waveshort|chestnut|olive|suit|blue|-|badge
B3:main:4|54|f|round|braid|salt|ochre|cardigan|cream|-|satchel
B3:main:5|27|m|oval|spiky|black|slate|vest|terracotta|-|lanyard
B3:main:6|36|f|square|pixie|auburn|sage|cardigan|violet|round|lanyard
B3:main:7|49|m|long|receding|salt|plum|suit|gold|-|folder
B3:secret:0|55|m|long|swept|salt|navy|suit|blue|rect|badge
B3:secret:1|47|f|angular|twist|black|navy|suit|emerald|-|badgeScarf
A1:main:0|33|m|long|tousled|black|greyblue|suit|grey|rect|office
A1:main:1|38|f|square|bun|black|forest|suit|greyblue|rect|scarf
A1:main:2|46|m|wide|crop|chestnut|camel|coat|white|round|pen
A1:main:3|65|m|square|receding|grey|charcoal|suit|burgundy|rect|official
A1:main:4|34|f|heart|highpony|chestnut|camel|casual|ivory|-|satchel
A1:main:5|52|m|round|swept|salt|slate|vest|gold|rect|lanyard
A1:main:6|30|f|oval|halfup|black|sage|cardigan|rust|-|lanyard
A1:main:7|55|f|diamond|braidbun|salt|plum|suit|lavender|round|scarf
A1:secret:0|44|m|long|part|black|navy|suit|emerald|-|badge
A1:secret:1|76|m|long|receding|white|charcoal|suit|violet|round|book
A2:main:0|50|m|square|hardhat|black|terracotta|safety|gold|-|safety
A2:main:1|35|f|diamond|long|chestnut|forest|suit|ivory|-|keys
A2:main:2|43|f|oval|braidbun|brown|charcoal|suit|greyblue|rect|scarf
A2:main:3|61|m|long|slick|salt|slate|suit|indigo|rect|official
A2:main:4|64|m|long|curly|salt|camel|cardigan|olive|-|satchel
A2:main:5|28|f|heart|ponytail|black|slate|vest|emerald|-|lanyard
A2:main:6|48|m|wide|receding|brown|sage|cardigan|ochre|rect|lanyard
A2:main:7|35|m|angular|quiff|black|plum|suit|steel|-|folder
A2:secret:0|40|f|oval|asym|chestnut|blue|cardigan|white|rect|blueprint
A2:secret:1|32|f|square|highpony|black|navy|suit|emerald|-|badge
S1:main:0|56|m|wide|swept|salt|charcoal|suit|burgundy|-|business
S1:main:1|45|f|heart|braidbun|black|forest|suit|greyblue|rimless|scarf
S1:main:2|69|m|long|swept|silver|black|vest|black|-|bow
S1:main:3|63|m|round|receding|salt|black|suit|gold|rect|official
S1:main:4|26|f|oval|curlybob|chestnut|terracotta|cardigan|cream|-|satchel
S1:main:5|40|m|square|part|black|slate|vest|burgundy|-|tie
S1:main:6|57|f|long|bun|salt|sage|cardigan|navy|round|lanyard
S1:main:7|42|f|diamond|pixie|black|plum|suit|greyblue|rect|scarf
S1:secret:0|78|m|long|receding|silver|navy|suit|emerald|round|badge
S1:secret:1|60|f|square|bun|salt|plum|cardigan|cream|rect|brooch
`.trim().split('\n');

const CHARACTER_PROFILES = Object.create(null);
const PORTRAIT_IMAGES = new Map();
const PORTRAIT_FAILED = new Set();
const CHARACTER_SKIN = ['#e7bc99','#eac3a3','#edc9ab','#d7aa83','#f0ccb0','#ddb08b'];
const CHARACTER_MOUSTACHES = new Set(['F1:main:3','F3:secret:0','D1:main:2','C1:main:2','C1:secret:1','B1:main:4','B3:main:7','A1:secret:0']);
const CHARACTER_SURNAMES = ['梁','陳','何','黃','林','鄭','吳','羅','李','馮','葉','郭'];
const CHARACTER_GIVEN = ['文安','芷晴','志謙','嘉寧','以誠','思敏','紹康','穎珊','偉衡','雅琪','家朗','慧儀'];

CHARACTER_CAST.forEach((row, portraitIndex) => {
  const [key, ageText, sex, face, hs, hair, cloth, ty, accent, glasses, accessory] = row.split('|');
  const age = Number(ageText), color = name => CHARACTER_PALETTE[name];
  const role = {customs:'customs',police:'police',security:'security',immigration:'immigration',chef:'chef',safety:'construction',
    stethoscope:'doctor',medical:ty==='nurse'?'nurse':'pharmacist',headset:'hotline',press:'journalist',
    shop:'shopkeeper',cleaner:'cleaner',caretaker:'caretaker',teacher:'teacher',ledger:'auditor',blueprint:'planner',
    archive:'archivist',badge:'investigator',badgeScarf:'investigator',book:'scholar',folder:'reviewer'}[accessory] ||
    (ty==='vest'?'clerk':accessory==='lanyard'?'data-clerk':ty==='suit'?'professional':'civilian');
  const lk = {
    key, age, sex, face, hs, hr:color(hair), cl:color(cloth), ty, c2:color(accent), tie:color(accent),
    sk:CHARACTER_SKIN[portraitIndex % CHARACTER_SKIN.length], pn:color(ty==='safety'?'taupe':'navy'), sh:'#252b31',
    shirt:color('ivory'), gl:glasses==='-'?false:glasses, accessory, role,
    brows:age>=60?'soft':sex==='f'?(face==='square'?'straight':'arched'):(face==='square'?'heavy':'straight'),
    bd:CHARACTER_MOUSTACHES.has(key)?'moustache':false, streak:hair==='salt'||(age>=55&&hair==='brown'),
    cap:color(accessory==='customs'?(key==='F1:main:3'?'burgundy':'forest'):accessory==='security'?'charcoal':hs==='hardhat'?'gold':hs==='chef'?'white':'navy'),
    glassesColor:glasses==='rimless'?'#bfa477':glasses==='round'?'#74624b':'#34383d'
  };
  if(accessory==='scarf'||accessory==='badgeScarf')lk.neck='scarf';
  if(accessory==='bow')lk.neck='bow';
  if(accessory==='satchel'&&ty==='cardigan')lk.shirt=color(accent);
  if(ty==='coat')lk.shirt=color(accent);
  if(ty==='safety')lk.shirt=color('sand');
  if(key==='F2:main:5'||key==='D1:main:5'||key==='B3:main:5'||key==='A1:main:5')lk.shirt='#d9e4eb';
  if(key==='F1:main:3'||key==='F2:main:2'||key==='D1:main:0'||key==='A2:main:0')lk.sk='#d6a47d';
  if(key==='A1:main:0')lk.gl='rect';
  CHARACTER_PROFILES[key] = Object.freeze({
    key, identity:CHARACTER_SURNAMES[Math.floor(portraitIndex/12)]+CHARACTER_GIVEN[portraitIndex%12],
    portraitIndex, sheet:Math.floor(portraitIndex/16)+1, cell:portraitIndex%16,
    portrait:'assets/portraits-'+key.replaceAll(':','-')+'.jpg', lk:Object.freeze(lk)
  });
});

const INVESTIGATOR_PROFILES = Object.freeze({
  male:Object.freeze({key:'PLAYER:male',age:28,sex:'m',face:'angular',brows:'heavy',sk:'#e8bb98',hr:'#222831',hs:'quiff',
    cl:'#286855',c2:'#263c56',shirt:'#eeeadd',pn:'#27384d',sh:'#202730',ty:'investigator',role:'investigator',accessory:'badge',gl:false}),
  female:Object.freeze({key:'PLAYER:female',age:27,sex:'f',face:'heart',brows:'arched',sk:'#efc8ab',hr:'#252833',hs:'asym',
    cl:'#2b405e',c2:'#37806a',shirt:'#eeeadd',pn:'#27384d',sh:'#202730',ty:'investigator',role:'investigator',accessory:'badge',hairClip:true,gl:false})
});

function investigatorLook(avatar) {
  return {...INVESTIGATOR_PROFILES[avatar==='female'?'female':'male']};
}

function characterPortraitImage(src, title) {
  if(!PORTRAIT_IMAGES.has(src)) {
    const image = new Image();
    image.decoding = 'async';
    image.alt = title || '角色肖像';
    image.onerror = () => { PORTRAIT_FAILED.add(src); console.warn('Character portrait unavailable:', src); };
    image.src = src;
    PORTRAIT_IMAGES.set(src,image);
  }
  return PORTRAIT_IMAGES.get(src);
}

function configureCharacters(levels, lobby) {
  const scenes = [lobby,...(Array.isArray(levels)?levels:Object.values(levels))].filter(Boolean);
  const assignments = [];
  for(const scene of scenes) {
    for(const [group, actors] of [['main',scene.npcs||[]],['secret',scene.secret?.npcs||[]]]) {
      actors.forEach((npc,index) => {
        const key = scene.id+':'+group+':'+index, profile = CHARACTER_PROFILES[key];
        if(!profile)throw new Error('Missing character profile: '+key+' ('+npc.n+')');
        if(/退休|叔|伯/.test(npc.n)&&profile.lk.age<60)throw new Error('Elder character needs explicit age: '+key);
        assignments.push({npc,key,profile});
      });
    }
  }
  for(const {npc,key,profile} of assignments) {
    npc.characterKey = key;
    npc.characterIdentity = profile.identity;
    npc.portrait = profile.portrait;
    npc.lk = {...profile.lk};
    characterPortraitImage(profile.portrait,npc.n+' · '+profile.lk.age+'歲');
  }
  return assignments.length;
}

function animePortrait(npc) {
  const actor = npc?.d && !Array.isArray(npc.d) && typeof npc.d==='object' ? npc.d : npc;
  const key = typeof actor==='string' ? actor : actor?.characterKey || actor?.lk?.key || actor?.key;
  if(key==='PLAYER:male'||key==='PLAYER:female') {
    return characterPortraitImage('assets/portraits-investigator-'+key.split(':')[1]+'.jpg','廉署調查員');
  }
  const profile = CHARACTER_PROFILES[key];
  return profile ? characterPortraitImage(profile.portrait,actor?.n) : null;
}
