'use strict';

// Definitions only: game.js records these IDs in its persistent player state.
const JOURNAL = {choices: [], endings: [], achievements: []};

const JOURNAL_ANSWER_TITLES = {
  F1: {
    '0:d:1': ['核對同班旅客', '憑感覺放過旅客'],
    '1:d:2': ['備份X光影像', '只信自己對眼'],
    '2:d:2': ['保護阿姨攞鎖匙', '放棄追查茶錢'],
    '3:d0:1': ['追問華哥隻新錶', '等證據齊先追問'],
    '3:d:0': ['收埋華哥嗰份錢', '即場通知廉署拘捕', '安排便衣佈控收網']
  },
  F2: {
    '0:d:1': ['保存家長收據相片', '叫家長繼續等'],
    '1:d:1': ['借鎖匙查學位記錄', '拒絕查教務文件'],
    '2:d:1': ['請校工確認目擊時間', '避開校工作證'],
    '3:d:0': ['收取張老師掩口費', '勸張老師自首', '向校方及廉署舉報']
  },
  F3: {
    '0:d:1': ['登記求職苦主個案', '怕麻煩放棄登記'],
    '1:d:1': ['借鎖匙調叫號記錄', '拒查幽靈叫號'],
    '2:d:1': ['依法啟動錄音行動', '未準備好就衝出去'],
    '3:d0:0': ['未蒐證就畀介紹費', '假意周旋先搜證', '提早表明廉署身份'],
    '3:d:0': ['未標記證物就拉人', '拍照留證再拘捕', '等多次犯案先收網']
  },
  E1: {
    '0:d:1': ['登記借監控權限卡', '猜測鏡頭影唔到'],
    '1:d:1': ['保密請同事簽證言', '反過來指控證人'],
    '2:d:1': ['取得正式校時報告', '輕信打卡機快咗'],
    '3:d:0': ['接受代打卡藉口', '出示校時與工作證', '移交廉署查考勤']
  },
  E2: {
    '0:d:1': ['保護護士查存根', '否定字跡線索'],
    '1:d:1': ['影印診所收費單據', '忽略現金收費疑點'],
    '2:d:1': ['保存鄰居相片日期', '當公帑損失係家事'],
    '3:d:0': ['相信醫生開假紙藉口', '比對醫患簽名字跡', '只查關員放過醫生']
  },
  D1: {
    '0:d:1': ['調取整月門禁記錄', '猜測門禁卡壞咗'],
    '1:d:1': ['取得加急電腦報告', '只要IT口頭答覆'],
    '2:d:1': ['借鎖匙取停電報告', '押後收集工程文件'],
    '3:d:0': ['追問加班電腦編號', '用貪心質問代替證據', '用停電記錄拆穿OT']
  },
  C1: {
    '0:d:1': ['請侍應留意訂位線索', '指控侍應官商勾結'],
    '1:d:1': ['付款換取工程批文', '拒付賄款放棄項目', '拖延飯局暗中錄音'],
    '3:d:1': ['取密碼保存審批文件', '放棄查公司保險箱'],
    '4:d:0': ['怕得罪官員保持沉默', '實名向廉署提交證據', '匿名向傳媒寄料']
  },
  C2: {
    '0:d:1': ['依法調取物業登記', '以私隱為由放棄調查'],
    '1:d:1': ['追查完整交易鏈', '只看匯款總數'],
    '2:d:1': ['依程序查冊取年報', '放棄空殼公司查冊'],
    '3:d:0': ['追問黑錢最終去向', '認定賄款追唔返', '指出中介洗錢責任']
  },
  B1: {
    '0:d:0': ['按數據建議即掛八號波', '繼續等上級指示', '再觀察延後預警'],
    '0:d:1': ['借鎖匙封存風速數據', '忽略風速原始數據'],
    '1:d:1': ['保存每通災情來電', '不記錄受困市民'],
    '2:d:1': ['將制度漏洞建檔', '只責罵個人不查制度'],
    '3:d:0': ['隱瞞掛波延誤', '如實承認制度缺陷']
  },
  B2: {
    '0:d:1': ['向記者守口如瓶', '向記者透露調查方向'],
    '1:d:1': ['登記領檔案通行卡', '以自己人為由免登記'],
    '2:d:0': ['只匯報程序進度', '私下向上司透露對象'],
    '3:d:1': ['依法終止並保密封存', '向公眾洩漏調查資料']
  },
  B3: {
    '0:d:1': ['申請最後九十日記錄', '延後追查出入境線索'],
    '1:d:1': ['核對物業與供款記錄', '只問藏身地址'],
    '2:d:1': ['取得正式資金流向報告', '只聽銀行口頭報告'],
    '3:d:0': ['因移交困難放棄追查', '維持通緝更新通報']
  },
  A1: {
    '0:d:2': ['保護舉報人簽誓章', '先質疑舉報人報假案'],
    '1:d:1': ['帶齊資料申請搜查令', '未有搜查令就先搜'],
    '3:d:0': ['畀面子私下約談', '持令搜查封存造冊', '先拉人再補手續']
  },
  A2: {
    '0:d:1': ['保存現場相片日期', '忽略樓宇超高疑點'],
    '1:d:1': ['影印批則時間表', '把繞程序當效率'],
    '2:d:1': ['登記調閱銀行證物', '省略證物調閱登記'],
    '3:d0:0': ['觀察前局長迴避眼神', '留待庭上持證再問'],
    '3:d:0': ['由現場到資金逐層舉證', '只靠證人指控失憶', '先出銀行再出圖則']
  },
  S1: {
    '0:d:1': ['將手寫記錄公證存檔', '否定污點證人記錄'],
    '1:d:1': ['全份影印批文登記冊', '將繞招標當快手'],
    '2:d:1': ['依法請管家交鎖匙', '直接指控管家共犯'],
    '3:d:0': ['在官邸樓下執行行動', '在司長辦公室公開拘捕']
  }
};

// Include every final-question answer here, but only end/fatal flags make endings.
const JOURNAL_ENDING_TITLES = {
  F1: {'3:d:0': ['茶錢換來失守', '櫃檯前依法收網', '便衣截斷走私線']},
  F2: {'3:d:0': ['掩口費令你成共犯', '勸告自首的一步', '十七家長的舉報']},
  F3: {
    '3:d0:0': ['未備證據反陷行賄', '暫退部署蒐證', '過早亮證線索中斷'],
    '3:d:0': ['倉促拘捕破壞程序', '鏡頭下人贓並獲', '延後收網的代價']
  },
  E1: {'3:d:0': ['放過考勤謊言', '校時拆穿代打卡', '交廉署追查虛假更份']},
  E2: {'3:d:0': ['輕信假紙藉口', '同一字跡揭開合謀', '漏查醫生留下破網']},
  D1: {'3:d:0': ['電腦編號揭穿OT', '情緒質問失去焦點', '停電之夜拆穿加班']},
  C1: {
    '1:d:1': ['一紙批文賠上清白', '放棄項目保住底線', '飯局錄音留下關鍵'],
    '4:d:0': ['沉默縱容利益鏈', '實名舉報斬斷勾結', '匿名爆料留下斷鏈']
  },
  C2: {'3:d:0': ['沿資金追到境外物業', '放棄追款留下黑錢', '持證追問中介責任']},
  B1: {'3:d:0': ['部門面子掩蓋延誤', '如實報告推動檢討']},
  B2: {'3:d:1': ['封存守住無罪推定', '爆料傷害無法自辯者']},
  B3: {'3:d:0': ['知難而退停止追查', '未拘捕仍維持通緝']},
  A1: {'3:d:0': ['私下約談打草驚蛇', '持令造冊守住正義', '補辦手續救不回證據']},
  A2: {'3:d:0': ['完整證據喚醒失憶', '孤立證詞難以支撐', '舉證次序打亂鏈條']},
  S1: {'3:d:0': ['官邸外依法執行', '辦公室內公開收網']}
};

const JOURNAL_GLOBAL_ACHIEVEMENTS = [
  {id: '🏆 Say No', title: '拒絕官商勾結', condition: '在〈行賄者的午餐〉向廉署實名提交錄音及文件。', level: 'C1'},
  {id: '🏆 當機立斷', title: '按數據即時預警', condition: '在〈天鴿的風球〉建議按專業數據即時掛八號風球。', level: 'B1'},
  {id: '🏆 當眾收網', title: '辦公室公開收網', condition: '在〈司長的印章〉選擇於辦公室公開執行拘捕。', level: 'S1'},
  {id: '🏆 秘密檔案全收集', title: '秘密檔案全收集', condition: '進入全部十四宗案件的秘密檔案室。', level: null},
  {id: '🏆 檔案守護者', title: '最後字條的守護者', condition: '查看〈司長的印章〉秘密檔案室展示台上的最後字條。', level: 'S1'},
  {id: '🏆 守口如瓶', title: '保密到底', condition: '在未有洩漏調查資料的紀錄下，完成〈沒有審判的被告〉。', level: 'B2'},
  {id: '🏆 未落網(灰色徽章)', title: '未落網的開放紀錄', condition: '完成〈通緝令〉的調查；此成就不代表在逃者已被拘捕。', level: 'B3'},
  {id: '完成師傅教學', title: '完成師傅教學', condition: '依師傅指引收齊首關四項證據，依法處理案件並完成調查。', level: null},
  {id: '首次探索暗室', title: '首次探索暗室', condition: '首次進入任一案件中沒有NPC的停電證物房間。', level: null},
  {id: '全樓層調查', title: '全樓層調查', condition: '在同一次案件探索中，走訪該案件全部公開樓層，不包括暗室。', level: null},
  {id: '十四宗調查完成', title: '十四宗調查完成', condition: '十四宗案件各完成至少一次調查。', level: null},
  {id: '拒絕每一個誘惑', title: '拒絕每一個誘惑', condition: '在華哥、張老師、櫃位職員（未齊證據）及中間人的金錢試探中，各記錄至少一個不付款、不收錢的答案。', level: null}
];

function configureJournal(levels = LEVELS) {
  JOURNAL.choices.length = 0;
  JOURNAL.endings.length = 0;
  JOURNAL.achievements.length = 0;
  const achievements = new Map();
  const achievementConditions = new Map();
  const titles = {choices: new Set(), endings: new Set()};
  JOURNAL_GLOBAL_ACHIEVEMENTS.forEach(entry => {
    const definition = {...entry};
    achievements.set(entry.id, definition);
    JOURNAL.achievements.push(definition);
  });

  function uniqueTitle(kind, title, npc, field, nodeIndex, optionIndex) {
    let result = title;
    if (titles[kind].has(result)) result += ' · ' + npc.n;
    if (titles[kind].has(result)) result += '（' + field + '對話' + (nodeIndex + 1) + '・答案' + (optionIndex + 1) + '）';
    const base = result;
    let duplicate = 2;
    while (titles[kind].has(result)) result = base + '・分支' + duplicate++;
    titles[kind].add(result);
    return result;
  }

  levels.forEach(Lv => {
    const scene = Lv.name || Lv.id;
    if (Lv.puzzle) Lv.puzzle.steps.forEach((step, stepIndex) => {
      const id = 'puzzle:' + Lv.id + ':' + stepIndex;
      if (achievements.has(id)) return;
      const definition = {
        id, title: Lv.name + ' · ' + step.name + '驗證',
        condition: '在〈' + scene + '〉完成「' + step.name + '」驗證（遊戲設計的虛構程序練習，非真實案件證據或歷史事件）。',
        level: Lv.id
      };
      achievements.set(id, definition);
      JOURNAL.achievements.push(definition);
    });
    const groups = [
      {scope: 'npc', npcs: Lv.npcs || []},
      {scope: 'secret', npcs: (Lv.secret && Lv.secret.npcs) || []}
    ];
    groups.forEach(group => group.npcs.forEach((npc, npcIndex) => {
      ['d', 'd0', 'dn'].forEach(field => {
        if (!Array.isArray(npc[field])) return;
        npc[field].forEach((node, nodeIndex) => {
          if (!node || !Array.isArray(node.o)) return;
          const key = npcIndex + ':' + field + ':' + nodeIndex;
          const namedAnswers = group.scope === 'npc' && (JOURNAL_ANSWER_TITLES[Lv.id] || {})[key];
          const namedEndings = group.scope === 'npc' && (JOURNAL_ENDING_TITLES[Lv.id] || {})[key];
          node.o.forEach((option, optionIndex) => {
            if(npc.cul&&field==='d'&&!option.fatal)option.end=1;
            const suffix = [Lv.id, group.scope, npcIndex, field, nodeIndex, optionIndex].join(':');
            const answer = String(option.t || '繼續對話');
            const action = namedAnswers && namedAnswers[optionIndex] || answer.replace(/\s+/g, ' ').trim();
            const condition = '在〈' + scene + '〉與' + npc.n + '對話時選擇「' + answer + '」';
            const title = uniqueTitle('choices', scene + ' · ' + action, npc, field, nodeIndex, optionIndex);
            option.choiceId = 'choice:' + suffix;
            option.choiceTitle = title;
            option.choiceCondition = condition;
            option.choiceAchievement = 'decision:' + suffix;
            JOURNAL.choices.push({id: option.choiceId, title, condition, level: Lv.id});
            const decision = {id: option.choiceAchievement, title, condition, level: Lv.id};
            achievements.set(decision.id, decision);
            JOURNAL.achievements.push(decision);

            if (option.end || option.fatal) {
              const outcome = namedEndings && namedEndings[optionIndex] || (option.fatal ? '失敗分支：' : '調查分支：') + action;
              option.endingId = 'ending:' + suffix;
              option.endingTitle = uniqueTitle('endings', scene + ' · ' + outcome, npc, field, nodeIndex, optionIndex);
              option.endingCondition = condition;
              option.endingText = '遊戲分支紀錄，並非真實案件的另一判決。\n'
                + '在〈' + scene + '〉的虛構遊戲分支，你選擇「' + answer + '」。\n'
                + (option.s ? '\n【遊戲對話回應】\n' + String(option.s) + '\n' : '')
                + '\n真實案件的判決及狀態請另閱原有結案報告與秘密檔案；本分支不改寫歷史紀錄。';
              JOURNAL.endings.push({id: option.endingId, title: option.endingTitle, condition, level: Lv.id, text: option.endingText});
            } else {
              // Reconfiguration must not leave a now-nonterminal answer ending a case.
              delete option.endingId;
              delete option.endingTitle;
              delete option.endingText;
              delete option.endingCondition;
            }

            if (typeof option.achv === 'string' && option.achv) {
              let definition = achievements.get(option.achv);
              if (!definition) {
                definition = {id: option.achv, title: option.achv.replace(/^🏆\s*/, ''), condition, level: Lv.id};
                achievements.set(option.achv, definition);
                JOURNAL.achievements.push(definition);
              }
              const conditions = achievementConditions.get(option.achv) || new Set();
              conditions.add(condition);
              achievementConditions.set(option.achv, conditions);
              definition.condition = Array.from(conditions).join('；或');
              if (definition.level !== Lv.id) definition.level = null;
            }
          });
        });
      });
    }));
  });
  return JOURNAL;
}

// Render this projection, not raw definitions. Locked IDs are internal keys only.
// No condition, level or undiscovered name is returned for a locked achievement.
function journalAchievementEntries(unlocked = []) {
  const ids = unlocked instanceof Set ? unlocked : new Set(unlocked);
  return JOURNAL.achievements.map(entry => ids.has(entry.id)
    ? {...entry}
    : {id: entry.id, title: '???'});
}
