/* ================================================================
 * 国家安全战略兵棋推演平台 v12.4
 * 功能区协同推演系统 (Functional Zone Cooperative Wargaming System)
 *
 * 核心理念: 功能区不是孤岛，而是推演的"战略纵深"
 *   推演前: 功能区准备 → 提供情报/力量/训练加成
 *   推演中: 功能区支援 → 每轮可呼叫一个功能区提供战场支援
 *   推演后: 推演结果 → 反哺功能区状态，生成训练素材
 *
 * 8大功能区:
 *   1. 全域协同视图 (global)    — 总览所有功能区协同状态
 *   2. 战略情报中心 (intel)      — 情报收集与分析，推演前提供情报包
 *   3. 作战指挥中心 (command)    — 力量部署与战备，推演中提供军事支援
 *   4. 模拟训练中心 (training)   — 历史复盘+技能训练，完成后提供推演加成
 *   5. 后勤保障中心 (logistics)  — 供应链与储备，推演中提供资源支援
 *   6. 国防经济中心 (economy)    — 经济战与金融防御，推演前提供经济条件
 *   7. 科技信息战中心 (tech)     — 网络战与认知战，推演中提供技术支援
 *   8. 推演复盘中心 (aar)        — 推演分析与经验提炼
 * ================================================================ */

/* ===== 1. 功能区配置 ===== */
const ZONE_CONFIG = {
  global: {
    id:'global', name:'全域协同视图', icon:'🎯', short:'全域',
    color:'#00b4d8', desc:'总览所有功能区协同状态，管理联合行动与跨域协调',
    kpis: [],
    actions: [],
  },
  intel: {
    id:'intel', name:'战略情报中心', icon:'📡', short:'情报',
    color:'#a29bfe', desc:'情报收集、威胁评估、溯源分析，为推演提供情报优势',
    kpis: [
      { id:'collection', name:'情报收集率', value:72, unit:'%', max:100, desc:'多源情报收集覆盖度' },
      { id:'analysis', name:'分析研判力', value:68, unit:'分', max:100, desc:'情报分析与研判能力' },
      { id:'warning', name:'预警时效性', value:65, unit:'%', max:100, desc:'威胁预警的提前量' },
    ],
    actions: [
      { id:'i1', name:'启动多源情报搜集', cost:2, desc:'协调图像情报/信号情报/人力情报/开源情报全源搜集', effects:{intel:{collection:12,analysis:5}}, wargameBonus:{type:'intel_cards', value:2, desc:'推演中额外揭示2张情报卡'}, synergy:{command:3} },
      { id:'i2', name:'深度溯源分析', cost:3, desc:'对威胁事件进行全栈溯源，锁定幕后方', effects:{intel:{analysis:15,warning:8}}, wargameBonus:{type:'success_rate', value:5, domain:'cyber', desc:'网络域行动成功率+5%'}, synergy:{tech:4} },
      { id:'i3', name:'战略预警部署', cost:2, desc:'部署早期预警系统，前置发现威胁', effects:{intel:{warning:18,collection:6}}, wargameBonus:{type:'early_warning', value:1, desc:'推演首轮获得先手优势'}, synergy:{command:5,logistics:2} },
      { id:'i4', name:'情报共享协调', cost:1, desc:'与盟友和跨部门共享情报', effects:{intel:{collection:8,analysis:4}}, wargameBonus:{type:'intel_cards', value:1, desc:'额外揭示1张情报卡'}, synergy:{command:3,economy:2} },
      { id:'i5', name:'反情报行动', cost:3, desc:'识别和阻断敌方情报搜集', effects:{intel:{collection:5,analysis:8,warning:10}}, wargameBonus:{type:'defense', value:8, domain:'cyber', desc:'网络防御力+8'}, synergy:{tech:5} },
      { id:'i6', name:'人工智能情报辅助分析', cost:2, desc:'部署人工智能系统辅助大规模情报分析', effects:{intel:{analysis:20,warning:6}}, wargameBonus:{type:'success_rate', value:3, desc:'全域行动成功率+3%'}, synergy:{tech:6,command:2} },
    ],
  },
  command: {
    id:'command', name:'作战指挥中心', icon:'⚔️', short:'指挥',
    color:'#ff4757', desc:'力量部署、战备管理、联合作战规划，为推演提供军事优势',
    kpis: [
      { id:'readiness', name:'战备水平', value:78, unit:'%', max:100, desc:'全军战备状态综合评分' },
      { id:'deployment', name:'部署灵活度', value:70, unit:'分', max:100, desc:'快速部署和调整能力' },
      { id:'coordination', name:'联合作战力', value:75, unit:'分', max:100, desc:'多军种协同作战能力' },
    ],
    actions: [
      { id:'c1', name:'前沿力量部署', cost:3, desc:'将作战力量前推至关键区域', effects:{command:{readiness:10,deployment:8}}, wargameBonus:{type:'force_mod', value:8, domain:'military', desc:'军事域行动修正+8'}, synergy:{logistics:6,intel:3} },
      { id:'c2', name:'提升战备等级', cost:2, desc:'全军进入更高战备状态', effects:{command:{readiness:15,coordination:5}}, wargameBonus:{type:'success_rate', value:5, domain:'military', desc:'军事域成功率+5%'}, synergy:{logistics:4} },
      { id:'c3', name:'联合作战演练', cost:3, desc:'组织多军种联合作战演习', effects:{command:{coordination:18,deployment:6}}, wargameBonus:{type:'joint_unlock', value:1, desc:'解锁联合行动能力'}, synergy:{logistics:5,intel:3,tech:2} },
      { id:'c4', name:'战略威慑部署', cost:2, desc:'展示战略威慑力量', effects:{command:{readiness:8,deployment:5}}, wargameBonus:{type:'deterrence', value:10, desc:'对手人工智能侵略性-10%'}, synergy:{economy:3,intel:2} },
      { id:'c5', name:'快速反应准备', cost:2, desc:'建立快速反应机制', effects:{command:{deployment:15,coordination:8}}, wargameBonus:{type:'extra_ap', value:1, desc:'推演首轮额外1行动点'}, synergy:{logistics:6} },
      { id:'c6', name:'指挥系统加固', cost:1, desc:'加固指挥通信系统抗打击能力', effects:{command:{readiness:5,coordination:6}}, wargameBonus:{type:'defense', value:5, domain:'military', desc:'军事防御+5'}, synergy:{tech:4} },
    ],
  },
  training: {
    id:'training', name:'模拟训练中心', icon:'🎓', short:'训练',
    color:'#2ed573', desc:'历史案例复盘、技能训练、推演前模拟，完成后提供推演加成',
    kpis: [
      { id:'completion', name:'训练完成率', value:30, unit:'%', max:100, desc:'已完成训练模块占比' },
      { id:'proficiency', name:'综合熟练度', value:55, unit:'分', max:100, desc:'各域技能综合评分' },
      { id:'readiness', name:'推演准备度', value:40, unit:'%', max:100, desc:'针对当前场景的训练准备' },
    ],
    actions: [], // 训练模块动态生成
  },
  logistics: {
    id:'logistics', name:'后勤保障中心', icon:'🚚', short:'后勤',
    color:'#ff6348', desc:'供应链管理、战略储备、力量投送，为推演提供持续保障',
    kpis: [
      { id:'supply', name:'供应链韧性', value:72, unit:'%', max:100, desc:'供应链抗打击和恢复能力' },
      { id:'reserve', name:'战备储备率', value:80, unit:'%', max:100, desc:'关键物资储备水平' },
      { id:'projection', name:'力量投送力', value:75, unit:'%', max:100, desc:'远程投送和持续保障能力' },
    ],
    actions: [
      { id:'l1', name:'战略物资前置', cost:2, desc:'在关键方向预置战备物资', effects:{logistics:{reserve:-3,projection:12}}, wargameBonus:{type:'extra_ap', value:1, desc:'推演前2轮各+1行动点'}, synergy:{command:5} },
      { id:'l2', name:'供应链多元化', cost:3, desc:'重构关键供应链降低依赖', effects:{logistics:{supply:15,reserve:5}}, wargameBonus:{type:'economy_def', value:8, desc:'经济防御力+8'}, synergy:{economy:6} },
      { id:'l3', name:'运输通道加固', cost:2, desc:'加固关键运输通道安全', effects:{logistics:{projection:10,supply:8}}, wargameBonus:{type:'force_mod', value:5, domain:'military', desc:'军事力量修正+5'}, synergy:{command:4} },
      { id:'l4', name:'应急储备激活', cost:1, desc:'激活战略储备应对突发', effects:{logistics:{reserve:8,supply:5}}, wargameBonus:{type:'extra_funding', value:500, desc:'推演额外资金+500亿'}, synergy:{economy:3} },
      { id:'l5', name:'民船动员准备', cost:2, desc:'启动民船征用法律程序', effects:{logistics:{projection:15,reserve:-2}}, wargameBonus:{type:'force_mod', value:6, domain:'military', desc:'海军力量修正+6'}, synergy:{command:4,economy:2} },
      { id:'l6', name:'能源安全保障', cost:2, desc:'保障战略能源供应安全', effects:{logistics:{supply:10,reserve:6}}, wargameBonus:{type:'economy_def', value:5, desc:'经济防御力+5'}, synergy:{economy:4,tech:2} },
    ],
  },
  economy: {
    id:'economy', name:'国防经济中心', icon:'💰', short:'经济',
    color:'#ffa502', desc:'经济战工具、金融防御、制裁管理，为推演提供经济杠杆',
    kpis: [
      { id:'resilience', name:'经济韧性', value:70, unit:'%', max:100, desc:'经济体系抗制裁能力' },
      { id:'firepower', name:'经济战火力', value:65, unit:'分', max:100, desc:'经济制裁和反制能力' },
      { id:'independence', name:'金融自主度', value:58, unit:'%', max:100, desc:'金融体系独立自主水平' },
    ],
    actions: [
      { id:'e1', name:'制裁反制工具准备', cost:2, desc:'准备稀土管制、实体清单等反制工具', effects:{economy:{firepower:12,resilience:3}}, wargameBonus:{type:'success_rate', value:5, domain:'economic', desc:'经济域成功率+5%'}, synergy:{command:2,tech:3} },
      { id:'e2', name:'金融防御加固', cost:3, desc:'加固金融系统抗制裁能力', effects:{economy:{independence:15,resilience:10}}, wargameBonus:{type:'economy_def', value:12, desc:'经济防御力+12'}, synergy:{tech:4} },
      { id:'e3', name:'战略物资储备扩充', cost:2, desc:'扩充关键战略物资储备', effects:{economy:{resilience:8,firepower:5}}, wargameBonus:{type:'extra_funding', value:800, desc:'推演额外资金+800亿'}, synergy:{logistics:5} },
      { id:'e4', name:'货币互换网络', cost:3, desc:'扩大本币互换网络降低美元依赖', effects:{economy:{independence:18,resilience:5}}, wargameBonus:{type:'economy_def', value:8, desc:'经济防御力+8'}, synergy:{intel:2} },
      { id:'e5', name:'供应链经济战准备', cost:2, desc:'准备供应链经济战方案', effects:{economy:{firepower:10,independence:4}}, wargameBonus:{type:'success_rate', value:3, domain:'economic', desc:'经济域成功率+3%'}, synergy:{logistics:4,tech:2} },
      { id:'e6', name:'数字经济动员', cost:2, desc:'动员数字经济力量支持国家安全', effects:{economy:{resilience:8,firepower:6,independence:5}}, wargameBonus:{type:'extra_funding', value:400, desc:'推演额外资金+400亿'}, synergy:{tech:5} },
    ],
  },
  tech: {
    id:'tech', name:'科技信息战中心', icon:'🔬', short:'科技',
    color:'#2196f3', desc:'网络攻防、认知战、技术竞争，为推演提供技术优势',
    kpis: [
      { id:'cyber', name:'网络防护力', value:82, unit:'%', max:100, desc:'关键基础设施网络防护' },
      { id:'cognitive', name:'认知战力', value:60, unit:'分', max:100, desc:'认知域攻防能力' },
      { id:'innovation', name:'技术自主率', value:62, unit:'%', max:100, desc:'关键技术自主可控水平' },
    ],
    actions: [
      { id:'t1', name:'网络防御加固', cost:2, desc:'全面加固关键信息基础设施', effects:{tech:{cyber:15,cognitive:3}}, wargameBonus:{type:'defense', value:12, domain:'cyber', desc:'网络域防御+12'}, synergy:{intel:3,command:2} },
      { id:'t2', name:'认知域防御部署', cost:2, desc:'部署认知域防御体系', effects:{tech:{cognitive:18,cyber:4}}, wargameBonus:{type:'success_rate', value:5, domain:'information', desc:'信息域成功率+5%'}, synergy:{intel:4,economy:2} },
      { id:'t3', name:'人工智能攻防演练', cost:3, desc:'人工智能驱动的攻防对抗演习', effects:{tech:{cyber:10,cognitive:8,innovation:6}}, wargameBonus:{type:'success_rate', value:4, domain:'cyber', desc:'网络域成功率+4%'}, synergy:{command:3,intel:3} },
      { id:'t4', name:'技术封锁反制', cost:2, desc:'反制技术封锁，加速自主替代', effects:{tech:{innovation:15,cyber:5}}, wargameBonus:{type:'success_rate', value:3, desc:'全域成功率+3%'}, synergy:{economy:4} },
      { id:'t5', name:'信息战准备', cost:2, desc:'准备舆论战和信息战方案', effects:{tech:{cognitive:12,innovation:3}}, wargameBonus:{type:'success_rate', value:4, domain:'information', desc:'信息域成功率+4%'}, synergy:{intel:3,economy:2} },
      { id:'t6', name:'量子加密部署', cost:3, desc:'量子通信加密节点部署', effects:{tech:{cyber:18,innovation:8}}, wargameBonus:{type:'defense', value:10, domain:'cyber', desc:'网络域防御+10'}, synergy:{command:2,intel:2} },
    ],
  },
  aar: {
    id:'aar', name:'推演复盘中心', icon:'📋', short:'复盘',
    color:'#7c4dff', desc:'推演后分析、经验提炼、跨场景追踪，形成持续改进闭环',
    kpis: [
      { id:'lessons', name:'经验提炼数', value:0, unit:'条', max:100, desc:'已提炼的经验教训' },
      { id:'improvement', name:'改进落实率', value:0, unit:'%', max:100, desc:'经验转化为改进措施的比例' },
      { id:'maturity', name:'推演成熟度', value:35, unit:'分', max:100, desc:'整体推演体系成熟度' },
    ],
    actions: [],
  },
};

/* ===== 动态联动：根据系统实际数据更新功能区 KPI ===== */
(function syncZoneKPIs(){
  /* 情报中心 KPI → 从 INTEL / THREATS 计算 */
  if(typeof INTEL !== 'undefined' && ZONE_CONFIG.intel){
    const sources = new Set(INTEL.map(i => i.source));
    const aGrade = INTEL.filter(i => i.reliability === 'A').length;
    ZONE_CONFIG.intel.kpis[0].value = Math.min(100, 40 + INTEL.length * 5 + sources.size * 3);
    ZONE_CONFIG.intel.kpis[1].value = Math.min(100, 50 + aGrade * 5 + Math.round(sources.size * 2.5));
    const activeThreats = (typeof THREATS !== 'undefined') ? THREATS.filter(t => t.status === 'escalating' || t.status === 'active').length : 0;
    ZONE_CONFIG.intel.kpis[2].value = Math.min(100, 45 + activeThreats * 8);
  }

  /* 作战指挥中心 KPI → 从 FORCES 计算 */
  if(typeof FORCES !== 'undefined' && ZONE_CONFIG.command){
    const avgReady = Math.round(FORCES.reduce((s,f) => s + f.readiness, 0) / FORCES.length);
    const deployedTypes = new Set(FORCES.filter(f => f.status !== 'ready').map(f => f.status));
    const milForces = FORCES.filter(f => f.domain === 'military');
    const jointScore = milForces.length >= 4 ? 75 : 60;
    ZONE_CONFIG.command.kpis[0].value = avgReady;
    ZONE_CONFIG.command.kpis[1].value = Math.min(100, 50 + deployedTypes.size * 8);
    ZONE_CONFIG.command.kpis[2].value = Math.min(100, jointScore + Math.round(FORCES.length * 1.5));
  }

  /* 后勤保障中心 KPI → 从 FORCES 联勤保障部队计算 */
  if(typeof FORCES !== 'undefined' && ZONE_CONFIG.logistics){
    const logForce = FORCES.find(f => f.domain === 'logistics');
    const logReady = logForce ? logForce.readiness : 70;
    ZONE_CONFIG.logistics.kpis[0].value = Math.min(100, logReady - 3);
    ZONE_CONFIG.logistics.kpis[1].value = Math.min(100, logReady + 2);
    ZONE_CONFIG.logistics.kpis[2].value = Math.min(100, logReady - 1);
  }

  /* 国防经济中心 KPI → 从 DOMAINS 经济域计算 */
  if(typeof DOMAINS !== 'undefined' && ZONE_CONFIG.economy){
    const ecoDomain = DOMAINS.find(d => d.id === 'economic');
    if(ecoDomain){
      ZONE_CONFIG.economy.kpis[0].value = ecoDomain.readiness + 5;
      ZONE_CONFIG.economy.kpis[1].value = ecoDomain.readiness;
      ZONE_CONFIG.economy.kpis[2].value = Math.max(30, ecoDomain.readiness - 7);
    }
  }

  /* 科技信息战中心 KPI → 从 DOMAINS 网络/信息域计算 */
  if(typeof DOMAINS !== 'undefined' && ZONE_CONFIG.tech){
    const cyberDomain = DOMAINS.find(d => d.id === 'cyber');
    const infoDomain = DOMAINS.find(d => d.id === 'information');
    if(cyberDomain) ZONE_CONFIG.tech.kpis[0].value = cyberDomain.readiness;
    if(infoDomain) ZONE_CONFIG.tech.kpis[1].value = infoDomain.readiness;
    if(cyberDomain && infoDomain){
      ZONE_CONFIG.tech.kpis[2].value = Math.round((cyberDomain.readiness + infoDomain.readiness) / 2 - 15);
    }
  }

  /* 训练中心 KPI → 从 STATE.games 计算 */
  if(typeof STATE !== 'undefined' && STATE.games && ZONE_CONFIG.training){
    const gamesCount = STATE.games.length;
    ZONE_CONFIG.training.kpis[0].value = Math.min(100, 20 + gamesCount * 10);
    ZONE_CONFIG.training.kpis[1].value = Math.min(100, 40 + gamesCount * 8);
    ZONE_CONFIG.training.kpis[2].value = Math.min(100, 25 + gamesCount * 12);
  }

  /* 推演复盘中心 KPI → 从 STATE.games 计算 */
  if(typeof STATE !== 'undefined' && STATE.games && ZONE_CONFIG.aar){
    const gamesCount = STATE.games.length;
    ZONE_CONFIG.aar.kpis[0].value = gamesCount * 3;
    ZONE_CONFIG.aar.kpis[1].value = Math.min(100, gamesCount * 15);
    ZONE_CONFIG.aar.kpis[2].value = Math.min(100, 25 + gamesCount * 10);
  }
})();

/* ===== 2. 场景-功能区映射 =====
 * 每个场景定义: 激活的功能区列表 + 场景化备注
 * 激活的功能区在推演前准备阶段和推演中支援阶段可用
 */
const SCENARIO_ZONES = {
  taiwan_strait: {
    active: ['intel','command','training','logistics','economy','tech'],
    priority: 'command',
    notes: {
      intel:'台海方向情报态势紧迫，需重点关注美日军事动向和台军部署变化',
      command:'东部战区核心方向，两栖投送和导弹威慑是关键作战能力',
      training:'推荐完成「台海危机决策训练」和「联合作战训练」',
      logistics:'跨海后勤保障是作战关键，两栖投送和民船动员需提前准备',
      economy:'两岸经济合作框架协议杠杆和金融制裁工具是重要非军事手段',
      tech:'电磁压制和网络战是制胜关键，认知域防御不可忽视',
    },
    recommendedTraining: ['crisis_decision','joint_ops','cyber_warfare'],
  },
  south_china_sea: {
    active: ['intel','command','training','logistics','economy','tech'],
    priority: 'command',
    notes: {
      intel:'南海多国博弈，需分清声索国与域外大国的不同威胁层级',
      command:'海空力量是核心，岛礁防御和远海投送是重点',
      training:'推荐完成「联合作战训练」和「危机决策训练」',
      logistics:'远海补给和岛礁保障是南海维权基础',
      economy:'区域全面经济伙伴关系协定经济杠杆和渔业资源管理是重要手段',
      tech:'海域态势感知和岛礁防御技术是重点',
    },
    recommendedTraining: ['joint_ops','crisis_decision','logistics_planning'],
  },
  border_india: {
    active: ['intel','command','training','logistics','tech'],
    priority: 'command',
    notes: {
      intel:'边境情报重点是印军增兵动向和基建进展',
      command:'高原山地作战力量是核心，快速反应能力是关键',
      training:'推荐完成「危机决策训练」和「后勤规划训练」',
      logistics:'高原后勤保障是生命线，过冬物资和空运能力是重点',
      tech:'高原信息化作战和态势感知是技术关键',
    },
    recommendedTraining: ['crisis_decision','logistics_planning'],
  },
  eco_sanctions: {
    active: ['intel','economy','training','tech','logistics'],
    priority: 'economy',
    notes: {
      intel:'重点关注某大国制裁清单和盟友协调动向',
      economy:'经济反制是核心战场，金融韧性和技术自主是关键',
      training:'推荐完成「经济战训练」和「战略评估训练」',
      tech:'技术突破是打破制裁的根本路径',
      logistics:'供应链安全是经济战的物质基础',
    },
    recommendedTraining: ['economic_warfare','strategic_assessment'],
  },
  cyber_attack: {
    active: ['intel','tech','command','training'],
    priority: 'tech',
    notes: {
      intel:'网络攻击溯源是核心任务，需锁定幕后方',
      tech:'网络战是核心战场，攻防能力和溯源体系决定胜负',
      command:'网络战部队全面动员，关键基础设施防护是重点',
      training:'推荐完成「网络攻防训练」和「情报分析训练」',
    },
    recommendedTraining: ['cyber_warfare','intel_analysis'],
  },
  hybrid_warfare: {
    active: ['intel','command','tech','economy','training','logistics'],
    priority: 'tech',
    notes: {
      intel:'多源威胁识别是关键，需区分网络、舆论、经济、军事不同维度',
      command:'多域防御需要快速反应和灵活调配',
      tech:'认知域防御和网络防御是技术核心',
      economy:'经济胁迫反制需要金融韧性和供应链多元化',
      training:'推荐完成「混合战争训练」——这是最复杂的训练模块',
      logistics:'多元威胁下的后勤保障需要高度弹性',
    },
    recommendedTraining: ['hybrid_war','crisis_decision','cyber_warfare'],
  },
  middle_east: {
    active: ['intel','command','logistics','economy','training'],
    priority: 'logistics',
    notes: {
      intel:'中东局势复杂，能源安全和侨民安全是情报重点',
      command:'远洋护航和撤侨准备是军事重点',
      logistics:'远洋投送和撤侨保障是核心任务',
      economy:'能源进口安全是经济命脉',
      training:'推荐完成「后勤规划训练」和「危机决策训练」',
    },
    recommendedTraining: ['logistics_planning','crisis_decision'],
  },
  hormuz: {
    active: ['intel','command','logistics','economy'],
    priority: 'logistics',
    notes: {
      intel:'海峡通航安全和伊朗军事动向是情报重点',
      command:'护航编队是核心力量',
      logistics:'航道安全保障和油轮护航是关键',
      economy:'能源运输安全直接影响经济安全',
    },
    recommendedTraining: ['logistics_planning','crisis_decision'],
  },
  arctic: {
    active: ['intel','tech','economy','command'],
    priority: 'tech',
    notes: {
      intel:'北极军事部署和航道数据是情报重点',
      tech:'极地卫星和冰下探测是技术关键',
      economy:'北极航道和资源开发是经济新前沿',
      command:'极地力量存在是战略宣示',
    },
    recommendedTraining: ['strategic_assessment'],
  },
  space_domain: {
    active: ['intel','tech','command'],
    priority: 'tech',
    notes: {
      intel:'卫星变轨和反卫星武器试验是情报重点',
      tech:'太空攻防和卫星防护是技术核心',
      command:'太空力量指挥和控制是关键',
    },
    recommendedTraining: ['cyber_warfare','strategic_assessment'],
  },
  ai_race: {
    active: ['intel','tech','economy','training'],
    priority: 'tech',
    notes: {
      intel:'人工智能军事化进展、芯片管制和极紫外光刻禁运是情报重点',
      tech:'人工智能攻防、自主系统和芯片自主替代是技术核心',
      economy:'人才争夺、产业投入和供应链重构是经济关键',
      training:'推荐完成「网络攻防训练」和「经济战训练」',
    },
    recommendedTraining: ['cyber_warfare','economic_warfare','strategic_assessment'],
  },
  finance_war: {
    active: ['intel','economy','tech','training'],
    priority: 'economy',
    notes: {
      intel:'环球银行金融电信系统排除威胁和资本外逃是情报重点',
      economy:'金融反制和人民币跨境支付系统是核心战场',
      tech:'金融网络防护是技术关键',
      training:'推荐完成「经济战训练」',
    },
    recommendedTraining: ['economic_warfare','intel_analysis'],
  },
  rare_earth: {
    active: ['intel','economy','logistics','command'],
    priority: 'economy',
    notes: {
      intel:'战略矿产供应和价格操纵是情报重点',
      economy:'稀土管制和储备是经济武器',
      logistics:'资源运输线安全是后勤关键',
      command:'海外矿区安保是军事任务',
    },
    recommendedTraining: ['economic_warfare','logistics_planning'],
  },
  digital_sovereignty: {
    active: ['intel','tech','economy'],
    priority: 'tech',
    notes: {
      intel:'数据跨境流动和数字规则联盟是情报重点',
      tech:'数据安全和数字基础设施是技术核心',
      economy:'数字货币竞争是经济新战场',
    },
    recommendedTraining: ['cyber_warfare','strategic_assessment'],
  },
  diaoyu: {
    active: ['intel','command','tech','logistics'],
    priority: 'command',
    notes: {
      intel:'日海保船动向和自卫队通信是情报重点',
      command:'海空力量巡逻是核心任务',
      tech:'东海监视和电子侦察是技术关键',
      logistics:'东海远海补给是后勤保障',
    },
    recommendedTraining: ['crisis_decision','joint_ops'],
  },
  korean_peninsula: {
    active: ['intel','command','tech','logistics'],
    priority: 'command',
    notes: {
      intel:'核试迹象和导弹发射准备是情报最高优先级',
      command:'边境防御和战略威慑是军事核心',
      tech:'核试监测和导弹预警是技术关键',
      logistics:'东北战区后勤保障需快速响应',
    },
    recommendedTraining: ['crisis_decision','strategic_assessment'],
  },
  myanmar: {
    active: ['intel','command','logistics','training'],
    priority: 'command',
    notes: {
      intel:'缅甸内战扩散和边境难民是情报重点',
      command:'边境封控是军事核心任务',
      logistics:'难民安置和边境管控是后勤关键',
      training:'推荐完成「危机决策训练」',
    },
    recommendedTraining: ['crisis_decision','logistics_planning'],
  },
  afghanistan: {
    active: ['intel','command','logistics'],
    priority: 'command',
    notes: {
      intel:'恐怖组织活动和渗透路线是情报重点',
      command:'边境渗透防御是军事核心',
      logistics:'高原边境后勤保障是关键',
    },
    recommendedTraining: ['crisis_decision','intel_analysis'],
  },
  horn_africa: {
    active: ['intel','command','logistics','economy'],
    priority: 'logistics',
    notes: {
      intel:'红海航运安全和地区冲突是情报重点',
      command:'护航编队和撤侨是军事任务',
      logistics:'吉布提基地和远洋投送是核心',
      economy:'能源通道安全是经济命脉',
    },
    recommendedTraining: ['logistics_planning','crisis_decision'],
  },
  venezuela: {
    active: ['intel','economy','command'],
    priority: 'economy',
    notes: {
      intel:'某大国制裁升级和拉美舆论是情报重点',
      economy:'石油合作和金融反制是经济关键',
      command:'远程投送和使馆安保是军事任务',
    },
    recommendedTraining: ['economic_warfare','strategic_assessment'],
  },
  biosecurity: {
    active: ['intel','command','logistics','tech'],
    priority: 'command',
    notes: {
      intel:'病原体报告和生物实验室活动是情报重点',
      command:'疫区管控和生化防御是军事核心',
      logistics:'防疫物资调配是后勤关键',
      tech:'生物监测和基因数据安全是技术重点',
    },
    recommendedTraining: ['crisis_decision','logistics_planning'],
  },
  nuclear_prolif: {
    active: ['intel','command','tech'],
    priority: 'command',
    notes: {
      intel:'核材料走私和秘密核设施是情报最高优先级',
      command:'战略威慑和边境防护是军事核心',
      tech:'核监测和核设施网络安全是技术关键',
    },
    recommendedTraining: ['crisis_decision','strategic_assessment'],
  },
  deep_sea: {
    active: ['intel','tech','command'],
    priority: 'tech',
    notes: {
      intel:'海底光缆窃听和水下监听是情报重点',
      tech:'深海探测和水下攻防是技术核心',
      command:'深海力量部署是军事新前沿',
    },
    recommendedTraining: ['cyber_warfare','strategic_assessment'],
  },
  climate_security: {
    active: ['intel','logistics','economy','tech'],
    priority: 'logistics',
    notes: {
      intel:'极端气候和海平面上升是情报重点',
      logistics:'灾害救援和基建修复是后勤核心',
      economy:'能源转型是经济关键',
      tech:'气候监测和碳交易安全是技术重点',
    },
    recommendedTraining: ['logistics_planning','strategic_assessment'],
  },
  food_security: {
    active: ['intel','economy','logistics','command'],
    priority: 'economy',
    notes: {
      intel:'全球粮价和产粮国减产是情报重点',
      economy:'粮食储备和种业安全是经济核心',
      logistics:'粮食运输线安全是后勤关键',
      command:'海上粮食通道保护是军事任务',
    },
    recommendedTraining: ['economic_warfare','logistics_planning'],
  },
  supply_chain: {
    active: ['intel','economy','logistics','tech'],
    priority: 'logistics',
    notes: {
      intel:'马六甲海峡风险和友岸外包是情报重点',
      economy:'供应链重构是经济核心',
      logistics:'替代通道和物流安保是关键',
      tech:'供应链监控技术是技术重点',
    },
    recommendedTraining: ['logistics_planning','economic_warfare'],
  },
  cognitive_war: {
    active: ['intel','tech','economy','training'],
    priority: 'tech',
    notes: {
      intel:'认知域攻击溯源和协调账号网络是情报重点',
      tech:'人工智能内容识别和认知域反制是技术核心',
      economy:'自主平台建设是经济关键',
      training:'推荐完成「混合战争训练」',
    },
    recommendedTraining: ['hybrid_war','cyber_warfare','intel_analysis'],
  },
  nato_expansion: {
    active: ['intel','command','tech','economy'],
    priority: 'command',
    notes: {
      intel:'北约兵力前推和反导部署是情报重点',
      command:'西部边境防御和战略威慑是军事核心',
      tech:'欧洲方向侦察和电子战是技术关键',
      economy:'能源管线博弈是经济杠杆',
    },
    recommendedTraining: ['crisis_decision','strategic_assessment'],
  },
  east_china_sea: {
    active: ['intel','command','tech','logistics'],
    priority: 'command',
    notes: {
      intel:'日自卫队空军集结和日美联合作战通信是情报重点',
      command:'东海防空巡逻是军事核心',
      tech:'空海联合监视是技术关键',
      logistics:'东海远海补给是后勤保障',
    },
    recommendedTraining: ['crisis_decision','joint_ops'],
  },
};

/* ===== 3. 训练模块库 ===== */
const TRAINING_MODULES = [
  {
    id:'crisis_decision', name:'危机决策训练', icon:'⚡', difficulty:3,
    domains:['military','diplomatic'], duration:'30分钟',
    desc:'模拟高压危机环境下的战略决策，训练快速判断和风险权衡能力',
    bonus:{ type:'success_rate', value:5, desc:'全域行动成功率+5%' },
    appliesTo:'all',
    content:[
      { type:'scenario', title:'情境：突发军事挑衅', text:'某国军舰突然进入我领海，你有15分钟决策窗口。选项：A.警告驱离 B.包围拦截 C.外交抗议 D.军事打击。请评估每个选项的风险与收益。' },
      { type:'lesson', title:'决策原则', text:'危机决策遵循OODA循环：观察→判断→决策→行动。关键是在有限信息下做出"足够好"的决策，而非追求完美。' },
      { type:'scenario', title:'情境：情报矛盾', text:'两份情报对同一事件给出相反判断。A来源可靠但内容模糊，B来源一般但内容具体。如何取舍？' },
      { type:'lesson', title:'情报权重', text:'情报评估应综合考虑来源可靠度(A>B>C)和信息具体度。通常A类来源的方向性判断更可信，B/C类来源的细节需交叉验证。' },
    ],
  },
  {
    id:'intel_analysis', name:'情报分析训练', icon:'🔍', difficulty:3,
    domains:['cyber','information'], duration:'25分钟',
    desc:'训练多源情报融合分析和威胁研判能力，提升情报利用效率',
    bonus:{ type:'intel_cards', value:2, desc:'推演中额外揭示2张情报卡' },
    appliesTo:'all',
    content:[
      { type:'lesson', title:'情报循环', text:'情报工作遵循：收集→处理→分析→分发→反馈。每个环节的质量影响最终判断。' },
      { type:'scenario', title:'情境：信号异常', text:'截获异常军事通信，但加密等级提升。是军事调动还是例行演习？需要哪些佐证？' },
      { type:'lesson', title:'分析陷阱', text:'常见认知偏差：确认偏差(只找支持性证据)、锚定效应(过度依赖首条信息)、群体思维(随大流)。需主动克服。' },
    ],
  },
  {
    id:'strategic_comm', name:'战略沟通训练', icon:'🤝', difficulty:2,
    domains:['diplomatic'], duration:'20分钟',
    desc:'训练外交谈判和战略沟通技巧，提升外交域行动效果',
    bonus:{ type:'success_rate', value:8, domain:'diplomatic', desc:'外交域成功率+8%' },
    appliesTo:'all',
    content:[
      { type:'lesson', title:'沟通层次', text:'战略沟通分三层：信号传递(表态)、议题塑造(议程设置)、叙事构建(话语权)。层次越高效果越持久。' },
      { type:'scenario', title:'情境：外交斡旋', text:'双方陷入僵局，你需要设计一个"面子-里子"交换方案。如何让双方都声称胜利？' },
    ],
  },
  {
    id:'cyber_warfare', name:'网络攻防训练', icon:'🌐', difficulty:4,
    domains:['cyber'], duration:'35分钟',
    desc:'训练网络攻防操作和网络安全态势感知能力',
    bonus:{ type:'success_rate', value:10, domain:'cyber', desc:'网络域成功率+10%' },
    appliesTo:'cyber',
    content:[
      { type:'lesson', title:'网络战杀伤链', text:'网络攻击遵循：侦察→武器化→投递→利用→安装→指挥控制→行动。防御需在每个环节设阻。' },
      { type:'scenario', title:'情境：高级持续性威胁攻击', text:'检测到高级持续性威胁组织渗透关键系统。是立即清除(可能打草惊蛇)还是监控收集情报？' },
      { type:'lesson', title:'溯源困难', text:'网络溯源需融合技术证据(代码特征/指挥控制服务器IP)和情报证据(动机/能力/历史)。公开溯源需足够证据链。' },
    ],
  },
  {
    id:'logistics_planning', name:'后勤规划训练', icon:'📦', difficulty:3,
    domains:['military','economic'], duration:'30分钟',
    desc:'训练战略后勤规划和供应链管理能力',
    bonus:{ type:'extra_ap', value:1, desc:'推演首轮额外1行动点' },
    appliesTo:'all',
    content:[
      { type:'lesson', title:'后勤原则', text:'后勤遵循：适时、适地、适量。不是越多越好，而是精准投送。过剩的物资消耗运力，不足的物资导致失败。' },
      { type:'scenario', title:'情境：远海补给', text:'航母编队在1000海里外执行任务，补给船需7天到达。如何规划补给节奏和应急方案？' },
    ],
  },
  {
    id:'economic_warfare', name:'经济战训练', icon:'💹', difficulty:3,
    domains:['economic'], duration:'30分钟',
    desc:'训练经济制裁、金融反制和贸易战策略运用能力',
    bonus:{ type:'success_rate', value:8, domain:'economic', desc:'经济域成功率+8%' },
    appliesTo:'economic',
    content:[
      { type:'lesson', title:'经济战层次', text:'贸易战→技术战→金融战→货币战。层次越高杀伤越大，但反噬也越强。需精准设计打击梯度。' },
      { type:'scenario', title:'情境：稀土反制', text:'某大国制裁中国芯片产业，你考虑稀土出口管制反制。评估对全球供应链和中国自身的影响。' },
      { type:'lesson', title:'制裁悖论', text:'过度制裁会推动对手自主替代，长期反而削弱杠杆。需保留"升级空间"和"退让台阶"。' },
    ],
  },
  {
    id:'hybrid_war', name:'混合战争训练', icon:'🌀', difficulty:5,
    domains:['military','economic','cyber','diplomatic','information'], duration:'45分钟',
    desc:'应对多域同时威胁的综合训练，这是最高难度的训练模块',
    bonus:{ type:'success_rate', value:5, desc:'全域行动成功率+5%' },
    appliesTo:'all',
    content:[
      { type:'lesson', title:'混合战争特征', text:'混合战争同时运用常规军事、非常规手段、经济胁迫、网络攻击、信息战、代理人。难点在于识别统一指挥下的多线行动。' },
      { type:'scenario', title:'情境：多域同时爆发', text:'同时遭遇：网络攻击+舆论抹黑+贸易制裁+边境骚扰。如何判断这是协调行动还是巧合？如何分配有限资源？' },
      { type:'lesson', title:'重心分析', text:'混合战争的关键是找到对手的"重心"——指挥协调中枢。打击重心可瓦解多线行动。反之，被动应对每条战线必败。' },
      { type:'scenario', title:'情境：认知域防御', text:'发现大规模深度伪造视频传播。是立即删除(可能引发"压制言论"指责)还是溯源曝光？' },
    ],
  },
  {
    id:'joint_ops', name:'联合作战训练', icon:'🎖️', difficulty:4,
    domains:['military'], duration:'35分钟',
    desc:'训练多军种联合作战规划和执行能力',
    bonus:{ type:'joint_unlock', value:1, desc:'解锁联合行动能力，全域修正+5%' },
    appliesTo:'military',
    content:[
      { type:'lesson', title:'联合作战原则', text:'联合作战核心：统一指挥、统一意图、分散执行。各军种在统一框架下发挥专长，避免各自为战。' },
      { type:'scenario', title:'情境：海空联合作战', text:'需要协调航母编队、空军战斗机、火箭军导弹和电子战部队。如何设计攻击序列？' },
      { type:'lesson', title:'电磁先导', text:'现代联合作战遵循：电磁先导→网络压制→精确打击→效果评估。电磁权是制空制海的前提。' },
    ],
  },
  {
    id:'strategic_assessment', name:'战略评估训练', icon:'📊', difficulty:3,
    domains:['diplomatic','economic','information'], duration:'25分钟',
    desc:'训练战略态势评估和长期趋势分析能力',
    bonus:{ type:'intel_cards', value:1, desc:'额外揭示1张情报卡', extra:{type:'success_rate', value:3, desc:'全域成功率+3%'} },
    appliesTo:'all',
    content:[
      { type:'lesson', title:'评估框架', text:'战略评估使用PMESII框架：政治、军事、经济、社会、信息、基础设施。六维交叉分析避免盲区。' },
      { type:'scenario', title:'情境：趋势判断', text:'某大国在印太地区持续增加军事存在。这是短期示威还是长期战略转变？需要哪些指标来判断？' },
    ],
  },
  {
    id:'historical_replay', name:'历史案例复盘', icon:'📖', difficulty:2,
    domains:['military','diplomatic','economic','cyber','information','domestic'], duration:'40分钟',
    desc:'复盘古巴导弹危机、海湾战争等经典案例，提炼战略经验',
    bonus:{ type:'success_rate', value:3, desc:'全域行动成功率+3%' },
    appliesTo:'all',
    content:[
      { type:'lesson', title:'古巴导弹危机', text:'1962年美苏核对抗。关键经验：保留对手退路(不逼迫至绝境)、秘密渠道沟通、时间换空间。' },
      { type:'lesson', title:'海湾战争', text:'1991年多国部队对伊拉克。关键经验：联盟构建、信息优势、空中先导、精确打击。' },
      { type:'lesson', title:'克里米亚事件', text:'2014年俄罗斯控制克里米亚。关键经验：混合战争、快速既成事实、认知域先行。' },
    ],
  },
];

/* ===== 4. 功能区运行时系统 ===== */
const ZoneSystem = {
  _state: {},
  _eventLog: [],
  _synergyMap: {}, // 跨功能区协同关系
  _wargameBonuses: null, // 当前推演的加成缓存
  _supportUsed: {}, // 推演中已使用的支援

  /* ===== 初始化 ===== */
  _init(){
    const zoneIds = ['intel','command','training','logistics','economy','tech','aar'];
    zoneIds.forEach(id => {
      if(!this._state[id]){
        const cfg = ZONE_CONFIG[id];
        if(!cfg) return;
        this._state[id] = {
          executing: null,
          actions: {},
          completions: 0,
          readiness: cfg.kpis.length ? Math.round(cfg.kpis.reduce((s,k)=>s+k.value,0)/cfg.kpis.length) : 50,
        };
        if(cfg.actions.length){
          cfg.actions.forEach(a => {
            this._state[id].actions[a.id] = { status:'idle', progress:0 };
          });
        }
      }
    });
  },

  /* ===== 获取功能区配置 ===== */
  getZone(id){ return ZONE_CONFIG[id] || null; },
  getState(id){ this._init(); return this._state[id]; },

  /* ===== 获取场景激活的功能区 ===== */
  getActiveZones(scenarioId){
    const sz = SCENARIO_ZONES[scenarioId];
    if(!sz) return ['intel','command','logistics','economy','tech'];
    return sz.active;
  },

  /* ===== 获取场景化备注 ===== */
  getScenarioNotes(scenarioId){
    const sz = SCENARIO_ZONES[scenarioId];
    return sz ? sz.notes : {};
  },

  /* ===== 获取推荐训练 ===== */
  getRecommendedTraining(scenarioId){
    const sz = SCENARIO_ZONES[scenarioId];
    return sz ? sz.recommendedTraining || [] : [];
  },

  /* ===== 全域协同评分 ===== */
  getSynergyScore(){
    this._init();
    const ids = ['intel','command','logistics','economy','tech'];
    let total = 0;
    ids.forEach(id => {
      const cfg = ZONE_CONFIG[id];
      const st = this._state[id];
      if(!cfg || !st) return;
      const kpiAvg = cfg.kpis.length ? cfg.kpis.reduce((s,k)=>s+k.value,0)/cfg.kpis.length : 50;
      const actionRate = st.completions / Math.max(1, cfg.actions.length);
      total += kpiAvg * 0.6 + actionRate * 40;
    });
    const score = Math.round(total / ids.length);
    const label = score>=80?'高度协同':score>=60?'有效协作':score>=40?'初级协调':'各自为战';
    const color = score>=80?'#2ed573':score>=60?'#00b4d8':score>=40?'#ffa502':'#ff4757';
    return { score, label, color };
  },

  /* ===== 执行功能区行动 ===== */
  executeAction(zoneId, actionId){
    this._init();
    const zone = ZONE_CONFIG[zoneId];
    if(!zone) return { ok:false, msg:'功能区不存在' };
    const action = zone.actions.find(a => a.id === actionId);
    if(!action) return { ok:false, msg:'行动不存在' };
    const st = this._state[zoneId].actions[actionId];
    if(!st || st.status !== 'idle') return { ok:false, msg:'该行动不可执行' };

    st.status = 'executing';
    st.progress = 0;
    this._state[zoneId].executing = actionId;
    this._addEvent(zoneId, `${zone.icon} ${zone.short}中心启动「${action.name}」`);
    this._tickProgress(zoneId, actionId);
    return { ok:true, msg:`已启动: ${action.name}` };
  },

  /* ===== 完成行动 ===== */
  _completeAction(zoneId, actionId){
    const zone = ZONE_CONFIG[zoneId];
    const action = zone.actions.find(a => a.id === actionId);
    if(!action) return;
    const st = this._state[zoneId].actions[actionId];
    st.status = 'completed';
    st.progress = 100;
    this._state[zoneId].executing = null;
    this._state[zoneId].completions++;

    this._addEvent(zoneId, `✅ ${zone.short}中心完成「${action.name}」`);

    // 应用KPI效应
    if(action.effects){
      Object.keys(action.effects).forEach(tid => {
        const tcfg = ZONE_CONFIG[tid];
        if(!tcfg) return;
        const fx = action.effects[tid];
        let parts = [];
        Object.keys(fx).forEach(kpiId => {
          const kpi = tcfg.kpis.find(k => k.id === kpiId);
          if(!kpi) return;
          kpi.value = Math.max(5, Math.min(100, kpi.value + fx[kpiId]));
          kpi.trend = fx[kpiId];
          parts.push(`${kpi.name}${fx[kpiId]>0?'+':''}${fx[kpiId]}`);
        });
        if(parts.length){
          this._addEvent(tid, `↪ ${tcfg.short}中心联动：${parts.join('、')}`);
        }
        this._updateReadiness(tid);
      });
    }

    // 应用协同效应
    if(action.synergy){
      Object.keys(action.synergy).forEach(tid => {
        if(!this._synergyMap[tid]) this._synergyMap[tid] = 0;
        this._synergyMap[tid] += action.synergy[tid];
      });
    }

    /* === 生态系统同步：功能区操作传播到全局状态 === */
    if(typeof GlobalStateSync !== 'undefined'){
      GlobalStateSync.syncZoneOperation(zoneId, action.name, {
        improvement: Math.round(
          (Object.values(action.effects || {}).reduce((s, fx) => {
            return s + Object.values(fx).reduce((a, v) => a + v, 0);
          }, 0) / Math.max(1, Object.keys(action.effects || {}).length)) || 2
        ),
      });
    }
  },

  /* ===== 更新战备度 ===== */
  _updateReadiness(zoneId){
    const cfg = ZONE_CONFIG[zoneId];
    if(!cfg || !cfg.kpis.length) return;
    this._state[zoneId].readiness = Math.round(cfg.kpis.reduce((s,k)=>s+k.value,0)/cfg.kpis.length);
  },

  /* ===== 进度模拟 ===== */
  _tickProgress(zoneId, actionId){
    const st = this._state[zoneId].actions[actionId];
    const action = ZONE_CONFIG[zoneId].actions.find(a => a.id === actionId);
    const interval = setInterval(() => {
      if(st.status !== 'executing'){ clearInterval(interval); return; }
      st.progress = Math.min(100, st.progress + (10 + Math.random()*6));
      if(st.progress >= 100){
        clearInterval(interval);
        this._completeAction(zoneId, actionId);
      }
      if(typeof ZoneUI !== 'undefined') ZoneUI._notifyUpdate(zoneId);
    }, 300 + (action.cost * 100));
  },

  /* ===== 事件日志 ===== */
  _addEvent(zoneId, text){
    this._eventLog.unshift({
      time: Date.now(), zoneId, text,
      timeStr: new Date().toLocaleTimeString(),
    });
    if(this._eventLog.length > 30) this._eventLog.length = 30;
    if(typeof ZoneUI !== 'undefined') ZoneUI._notifyEvent();
  },

  /* ===== 获取推演加成（进入推演时调用） ===== */
  getWargameBonuses(scenarioId){
    this._init();
    this._supportUsed = {};
    const bonuses = {
      intelCards: 0,
      successRate: {},
      forceMods: {},
      extraAP: 0,
      extraFunding: 0,
      economyDef: 0,
      defense: {},
      earlyWarning: 0,
      jointUnlock: false,
      deterrence: 0,
      sources: [],
    };

    // 收集已完成行动的加成
    const activeZones = this.getActiveZones(scenarioId);
    activeZones.forEach(zid => {
      const cfg = ZONE_CONFIG[zid];
      const st = this._state[zid];
      if(!cfg || !st) return;
      cfg.actions.forEach(a => {
        const actSt = st.actions[a.id];
        if(!actSt || actSt.status !== 'completed') return;
        if(!a.wargameBonus) return;

        const wb = a.wargameBonus;
        switch(wb.type){
          case 'intel_cards': bonuses.intelCards += wb.value; break;
          case 'success_rate':
            if(wb.domain){
              bonuses.successRate[wb.domain] = (bonuses.successRate[wb.domain]||0) + wb.value;
            } else {
              // 全域加成
              ['military','economic','cyber','diplomatic','information','domestic'].forEach(d => {
                bonuses.successRate[d] = (bonuses.successRate[d]||0) + wb.value;
              });
            }
            break;
          case 'force_mod':
            if(wb.domain){
              bonuses.forceMods[wb.domain] = (bonuses.forceMods[wb.domain]||0) + wb.value;
            }
            break;
          case 'extra_ap': bonuses.extraAP += wb.value; break;
          case 'extra_funding': bonuses.extraFunding += wb.value; break;
          case 'economy_def': bonuses.economyDef += wb.value; break;
          case 'defense':
            if(wb.domain){
              bonuses.defense[wb.domain] = (bonuses.defense[wb.domain]||0) + wb.value;
            }
            break;
          case 'early_warning': bonuses.earlyWarning += wb.value; break;
          case 'joint_unlock': bonuses.jointUnlock = true; break;
          case 'deterrence': bonuses.deterrence += wb.value; break;
        }
        bonuses.sources.push({ zone:zid, action:a.name, bonus:wb.desc });
      });
    });

    // 收集训练加成
    if(typeof TrainingSystem !== 'undefined'){
      const trainBonus = TrainingSystem.getBonusFor(scenarioId);
      if(trainBonus){
        trainBonus.forEach(tb => {
          if(tb.type === 'success_rate'){
            if(tb.domain){
              bonuses.successRate[tb.domain] = (bonuses.successRate[tb.domain]||0) + tb.value;
            } else {
              ['military','economic','cyber','diplomatic','information','domestic'].forEach(d => {
                bonuses.successRate[d] = (bonuses.successRate[d]||0) + tb.value;
              });
            }
          } else if(tb.type === 'intel_cards'){
            bonuses.intelCards += tb.value;
          } else if(tb.type === 'extra_ap'){
            bonuses.extraAP += tb.value;
          } else if(tb.type === 'joint_unlock'){
            bonuses.jointUnlock = true;
          }
          bonuses.sources.push({ zone:'training', action:tb.moduleName || '训练加成', bonus:tb.desc });
        });
      }
    }

    this._wargameBonuses = bonuses;
    return bonuses;
  },

  /* ===== 推演中呼叫功能区支援 ===== */
  callZoneSupport(zoneId){
    if(!this._wargameBonuses) return { ok:false, msg:'未在推演中' };
    if(this._supportUsed[zoneId]) return { ok:false, msg:'该功能区本轮已提供支援' };

    const cfg = ZONE_CONFIG[zoneId];
    const st = this._state[zoneId];
    if(!cfg || !st) return { ok:false, msg:'功能区不存在' };
    if(st.readiness < 40) return { ok:false, msg:`${cfg.name}战备度不足(需≥40%)` };

    this._supportUsed[zoneId] = true;
    // 消耗战备度
    st.readiness = Math.max(20, st.readiness - 8);

    const supports = {
      intel: { type:'reveal_intel', value:1, desc:'立即揭示1张隐藏情报卡' },
      command: { type:'success_boost', value:8, domain:'military', desc:'本轮军事域行动成功率+8%' },
      logistics: { type:'extra_ap', value:1, desc:'本轮额外1行动点' },
      economy: { type:'extra_funding', value:500, desc:'额外资金+500亿' },
      tech: { type:'defense_boost', value:10, domain:'cyber', desc:'本轮网络域防御+10' },
      training: { type:'success_boost', value:5, desc:'本轮全域成功率+5%' },
    };

    const support = supports[zoneId];
    if(!support) return { ok:false, msg:'该功能区不支持战场支援' };

    this._addEvent(zoneId, `🎖️ ${cfg.short}中心提供战场支援：${support.desc}`);
    return { ok:true, support, msg:`${cfg.name}支援：${support.desc}` };
  },

  /* ===== 检查功能区是否可支援 ===== */
  canSupport(zoneId){
    if(!this._wargameBonuses) return false;
    if(this._supportUsed[zoneId]) return false;
    const st = this._state[zoneId];
    return st && st.readiness >= 40;
  },

  /* ===== 推演结果反哺功能区 ===== */
  applyWargameResults(scenarioId, results){
    this._init();
    const activeZones = this.getActiveZones(scenarioId);
    const victory = results.victory;
    const domainScores = results.domainScores || {};

    activeZones.forEach(zid => {
      const st = this._state[zid];
      const cfg = ZONE_CONFIG[zid];
      if(!st || !cfg) return;

      // 胜负影响战备度
      if(victory){
        st.readiness = Math.min(100, st.readiness + 5);
      } else {
        st.readiness = Math.max(20, st.readiness - 3);
      }

      // 域分数影响对应功能区KPI
      const domainToZone = {
        military: 'command', economic: 'economy', cyber: 'tech',
        diplomatic: 'intel', information: 'tech', domestic: 'economy',
      };
      Object.keys(domainScores).forEach(dom => {
        const targetZone = domainToZone[dom];
        if(targetZone === zid){
          const cfg2 = ZONE_CONFIG[zid];
          const firstKpi = cfg2.kpis[0];
          if(firstKpi){
            const delta = Math.round((domainScores[dom] - 50) * 0.1);
            firstKpi.value = Math.max(5, Math.min(100, firstKpi.value + delta));
            firstKpi.trend = delta;
          }
        }
      });

      this._updateReadiness(zid);
    });

    // AAR中心记录经验
    if(this._state.aar){
      this._state.aar.completions++;
      const lessonsKpi = ZONE_CONFIG.aar.kpis[0];
      if(lessonsKpi){
        lessonsKpi.value += 1;
      }
    }

    this._addEvent('aar', `📋 推演复盘：${results.scenarioName || scenarioId} - ${victory?'胜利':'失败'}，经验已入库`);
    this._wargameBonuses = null;
    this._supportUsed = {};
  },

  /* ===== 重置 ===== */
  reset(zoneId){
    this._init();
    if(zoneId){
      const st = this._state[zoneId];
      if(!st) return;
      st.actions = {}; st.executing = null; st.completions = 0;
      const cfg = ZONE_CONFIG[zoneId];
      if(cfg && cfg.actions.length){
        cfg.actions.forEach(a => { st.actions[a.id] = { status:'idle', progress:0 }; });
      }
      if(cfg && cfg.kpis.length){
        cfg.kpis.forEach(k => { k.value = Math.floor(50+Math.random()*35); k.trend = 0; });
        this._updateReadiness(zoneId);
      }
    } else {
      Object.keys(this._state).forEach(id => this.reset(id));
      this._eventLog = [];
      this._synergyMap = {};
    }
  },
};

/* ===== 5. 训练系统 ===== */
const TrainingSystem = {
  _completed: {}, // { moduleId: { completedAt, score } }
  _currentModule: null,
  _currentStep: 0,

  /* ===== 获取所有训练模块 ===== */
  getModules(){ return TRAINING_MODULES; },
  getModule(id){ return TRAINING_MODULES.find(m => m.id === id); },

  /* ===== 是否已完成 ===== */
  isCompleted(id){ return !!this._completed[id]; },

  /* ===== 完成训练 ===== */
  completeModule(id){
    const mod = this.getModule(id);
    if(!mod) return false;
    this._completed[id] = {
      completedAt: Date.now(),
      score: Math.floor(70 + Math.random() * 30),
    };

    // 更新训练中心KPI
    ZoneSystem._init();
    const st = ZoneSystem._state.training;
    if(st){
      const total = TRAINING_MODULES.length;
      const done = Object.keys(this._completed).length;
      const cfg = ZONE_CONFIG.training;
      cfg.kpis[0].value = Math.round(done / total * 100);
      cfg.kpis[1].value = Math.min(100, cfg.kpis[1].value + 8);
      cfg.kpis[2].value = Math.min(100, cfg.kpis[2].value + 10);
      st.readiness = Math.round(cfg.kpis.reduce((s,k)=>s+k.value,0)/cfg.kpis.length);
    }

    ZoneSystem._addEvent('training', `🎓 完成训练「${mod.name}」，获得推演加成：${mod.bonus.desc}`);

    /* === 生态系统同步：训练完成传播到全局状态 === */
    if(typeof GlobalStateSync !== 'undefined'){
      GlobalStateSync.syncTrainingComplete(id, mod.name);
    }

    return true;
  },

  /* ===== 获取指定场景的训练加成 ===== */
  getBonusFor(scenarioId){
    const bonuses = [];
    const scenario = (typeof SCENARIOS !== 'undefined') ? SCENARIOS.find(s => s.id === scenarioId) : null;
    const scenarioDomain = scenario ? scenario.domain : null;

    Object.keys(this._completed).forEach(mid => {
      const mod = this.getModule(mid);
      if(!mod) return;

      // 检查是否适用
      let applies = false;
      if(mod.appliesTo === 'all') applies = true;
      else if(mod.appliesTo === scenarioDomain) applies = true;
      else if(scenario && scenario.response && scenario.response.includes(mod.appliesTo)) applies = true;

      if(applies){
        bonuses.push({ ...mod.bonus, moduleName: mod.name });
      }
    });

    return bonuses.length ? bonuses : null;
  },

  /* ===== 获取完成统计 ===== */
  getStats(){
    const total = TRAINING_MODULES.length;
    const done = Object.keys(this._completed).length;
    return { total, done, rate: Math.round(done/total*100) };
  },

  /* ===== 获取推荐训练模块 ===== */
  getRecommendedFor(scenarioId){
    const recommended = ZoneSystem.getRecommendedTraining(scenarioId);
    return recommended.map(id => this.getModule(id)).filter(Boolean);
  },
};

/* ===== 6. 功能区UI ===== */
const ZoneUI = {
  _viewMode: 'global',
  _detailZone: null,
  _detailTimer: null,

  /* ===== 主入口 ===== */
  render(zoneId){
    ZoneSystem._init();
    if(zoneId === 'global' || !zoneId){
      this._viewMode = 'global';
      return this._renderGlobal();
    }
    if(zoneId === 'training'){
      return this._renderTraining();
    }
    if(zoneId === 'aar'){
      return this._renderAAR();
    }
    return this._renderZone(zoneId);
  },

  /* ===== 全域协同视图 ===== */
  _renderGlobal(){
    const synergy = ZoneSystem.getSynergyScore();
    const zoneIds = ['intel','command','logistics','economy','tech'];
    const wgActive = (typeof Wargame !== 'undefined' && Wargame.state);
    const scenarioId = wgActive ? Wargame.state.scenario.id : null;
    const activeZones = scenarioId ? ZoneSystem.getActiveZones(scenarioId) : null;

    let cardsHtml = zoneIds.map(id => {
      const cfg = ZONE_CONFIG[id];
      const st = ZoneSystem.getState(id);
      if(!cfg || !st) return '';
      const isActive = activeZones ? activeZones.includes(id) : true;
      const dim = activeZones && !isActive ? 'opacity:.4;' : '';
      const hasAction = st.executing !== null;
      const execAction = hasAction ? cfg.actions.find(a => a.id === st.executing) : null;

      return `
      <div class="z-card" style="border-color:${cfg.color}33;${dim}cursor:pointer"
        onclick="ZoneUI.showDetail('${id}')"
        onmouseover="this.style.borderColor='${cfg.color}88';this.style.transform='translateY(-2px)';"
        onmouseout="this.style.borderColor='${cfg.color}33';this.style.transform=''">
        <div class="z-card-head">
          <div class="z-card-icon" style="background:${cfg.color}18;border:2px solid ${cfg.color}44">${cfg.icon}</div>
          <div class="z-card-title">
            <div style="font-weight:700;font-size:15px;color:${cfg.color}">${cfg.name}</div>
            <div style="font-size:11px;color:var(--txt-2)">${st.completions}/${cfg.actions.length}行动 | 战备${st.readiness}%</div>
          </div>
          <div class="z-card-status" style="border:1px solid ${cfg.color}33;background:${cfg.color}08">
            <div style="font-size:10px;color:var(--txt-2)">战备</div>
            <div style="font-size:24px;font-weight:800;color:${cfg.color};font-family:Consolas,monospace">${st.readiness}%</div>
          </div>
        </div>
        <div style="display:flex;gap:8px;margin-top:12px">
          ${cfg.kpis.map(k => {
            const tColor = (k.trend||0)>0?'var(--green)':(k.trend||0)<0?'var(--red)':'var(--txt-2)';
            const tIcon = (k.trend||0)>0?'↑':(k.trend||0)<0?'↓':'—';
            return `
            <div style="flex:1;padding:8px;background:rgba(8,20,40,.5);border-radius:6px;text-align:center">
              <div style="font-size:10px;color:var(--txt-2);margin-bottom:3px">${k.name}</div>
              <div style="font-size:15px;font-weight:700;color:${cfg.color};font-family:Consolas,monospace">${k.value}${k.unit}</div>
              <div style="font-size:10px;color:${tColor};margin-top:2px">${tIcon}</div>
            </div>`;
          }).join('')}
        </div>
        ${hasAction ? `
          <div style="margin-top:10px;padding:8px 10px;background:${cfg.color}0d;border:1px solid ${cfg.color}22;border-radius:6px;display:flex;align-items:center;gap:8px">
            <div style="width:6px;height:6px;border-radius:50%;background:${cfg.color};animation:pulse 1.5s infinite"></div>
            <div style="font-size:12px;color:var(--txt-0);flex:1">${execAction.name} ${Math.round(st.actions[execAction.id]?.progress||0)}%</div>
          </div>` : ''}
        ${isActive && wgActive ? `
          <div style="margin-top:8px;padding:6px 10px;background:rgba(46,213,115,.08);border:1px solid rgba(46,213,115,.2);border-radius:4px;font-size:11px;color:var(--green);text-align:center">
            ⚡ 可提供战场支援 ${ZoneSystem.canSupport(id) ? '(点击呼叫)' : '(战备不足或已使用)'}
          </div>` : ''}
        <div style="margin-top:10px;text-align:center;font-size:11px;color:var(--cyan)">点击进入详情 →</div>
      </div>`;
    }).join('');

    // 训练中心卡片
    const trainStats = TrainingSystem.getStats();
    cardsHtml += `
    <div class="z-card" style="border-color:${ZONE_CONFIG.training.color}33;cursor:pointer"
      onclick="ZoneUI.showDetail('training')"
      onmouseover="this.style.borderColor='${ZONE_CONFIG.training.color}88';this.style.transform='translateY(-2px)';"
      onmouseout="this.style.borderColor='${ZONE_CONFIG.training.color}33';this.style.transform=''">
      <div class="z-card-head">
        <div class="z-card-icon" style="background:${ZONE_CONFIG.training.color}18;border:2px solid ${ZONE_CONFIG.training.color}44">${ZONE_CONFIG.training.icon}</div>
        <div class="z-card-title">
          <div style="font-weight:700;font-size:15px;color:${ZONE_CONFIG.training.color}">${ZONE_CONFIG.training.name}</div>
          <div style="font-size:11px;color:var(--txt-2)">${trainStats.done}/${trainStats.total}模块已完成</div>
        </div>
        <div class="z-card-status" style="border:1px solid ${ZONE_CONFIG.training.color}33;background:${ZONE_CONFIG.training.color}08">
          <div style="font-size:10px;color:var(--txt-2)">完成率</div>
          <div style="font-size:24px;font-weight:800;color:${ZONE_CONFIG.training.color};font-family:Consolas,monospace">${trainStats.rate}%</div>
        </div>
      </div>
      <div style="display:flex;gap:8px;margin-top:12px">
        ${ZONE_CONFIG.training.kpis.map(k => `
          <div style="flex:1;padding:8px;background:rgba(8,20,40,.5);border-radius:6px;text-align:center">
            <div style="font-size:10px;color:var(--txt-2);margin-bottom:3px">${k.name}</div>
            <div style="font-size:15px;font-weight:700;color:${ZONE_CONFIG.training.color};font-family:Consolas,monospace">${k.value}${k.unit}</div>
          </div>`).join('')}
      </div>
      <div style="margin-top:10px;text-align:center;font-size:11px;color:var(--cyan)">点击进入训练 →</div>
    </div>`;

    // 事件日志
    let eventHtml = ZoneSystem._eventLog.slice(0,8).map(ev => {
      const cfg = ZONE_CONFIG[ev.zoneId];
      const color = cfg ? cfg.color : 'var(--txt-1)';
      return `
      <div class="z-event-item" style="color:${color}">
        <span style="font-size:10px;color:var(--txt-2);flex-shrink:0">${ev.timeStr}</span>
        <span>${ev.text}</span>
      </div>`;
    }).join('') || '<div style="color:var(--txt-2);font-size:12px;text-align:center;padding:10px">暂无事件，执行行动后此处将实时显示联动效果</div>';

    // 推演加成预览
    let bonusHtml = '';
    if(wgActive && ZoneSystem._wargameBonuses){
      const wb = ZoneSystem._wargameBonuses;
      const parts = [];
      if(wb.intelCards > 0) parts.push(`情报卡+${wb.intelCards}`);
      if(wb.extraAP > 0) parts.push(`行动点+${wb.extraAP}`);
      if(wb.extraFunding > 0) parts.push(`资金+${wb.extraFunding}亿`);
      if(wb.economyDef > 0) parts.push(`经济防御+${wb.economyDef}`);
      if(wb.jointUnlock) parts.push(`联合行动已解锁`);
      if(wb.deterrence > 0) parts.push(`威慑力+${wb.deterrence}`);
      Object.keys(wb.successRate).forEach(d => {
        parts.push(`${d}+${wb.successRate[d]}%`);
      });
      bonusHtml = `
      <div class="panel" style="padding:14px 18px;margin-top:16px;border-color:var(--green)33">
        <div style="font-size:13px;font-weight:700;color:var(--green);margin-bottom:10px">⚡ 当前推演加成（来自功能区准备）</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          ${parts.map(p => `<span style="font-size:11px;padding:4px 10px;background:rgba(46,213,115,.08);border:1px solid rgba(46,213,115,.2);border-radius:3px;color:var(--green)">${p}</span>`).join('')}
        </div>
        <div style="margin-top:8px;font-size:11px;color:var(--txt-2)">来源：${wb.sources.length}项功能区行动/训练</div>
      </div>`;
    }

    // 场景激活提示
    let scenarioNote = '';
    if(scenarioId){
      const notes = ZoneSystem.getScenarioNotes(scenarioId);
      const activeList = ZoneSystem.getActiveZones(scenarioId);
      scenarioNote = `
      <div class="panel" style="padding:14px 18px;margin-bottom:16px;border-color:var(--cyan)33">
        <div style="font-size:13px;font-weight:700;color:var(--cyan);margin-bottom:8px">🎯 当前场景激活的功能区</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">
          ${activeList.map(zid => {
            const cfg = ZONE_CONFIG[zid];
            return cfg ? `<span style="font-size:11px;padding:4px 10px;background:${cfg.color}10;border:1px solid ${cfg.color}33;border-radius:3px;color:${cfg.color}">${cfg.icon} ${cfg.short}</span>` : '';
          }).join('')}
        </div>
        <div style="font-size:11px;color:var(--txt-1);line-height:1.7">
          ${activeList.map(zid => {
            const cfg = ZONE_CONFIG[zid];
            const note = notes[zid];
            return note ? `<div><strong style="color:${cfg?cfg.color:'var(--cyan)'}">${cfg?cfg.name:''}：</strong>${note}</div>` : '';
          }).join('')}
        </div>
      </div>`;
    }

    return `
    <div class="fade-in" id="zone-global">
      <div class="z-topbar">
        <div class="z-synergy" style="border-color:${synergy.color}33;background:${synergy.color}08">
          <div style="font-size:12px;color:var(--txt-2)">全域协同评分</div>
          <div style="font-size:36px;font-weight:800;color:${synergy.color};font-family:Consolas,monospace;line-height:1.1">${synergy.score}</div>
          <div style="font-size:12px;color:${synergy.color}">${synergy.label}</div>
        </div>
        <div style="flex:1;padding:12px 18px;background:rgba(0,180,216,.06);border:1px solid var(--border);border-radius:8px">
          <div style="font-size:12px;color:var(--txt-2);margin-bottom:6px">📋 功能区协同推演机制</div>
          <div style="font-size:11px;color:var(--txt-1);line-height:1.7">
            • <strong style="color:var(--cyan)">推演前</strong>：在各功能区执行准备行动，获得的加成将带入推演<br>
            • <strong style="color:var(--green)">推演中</strong>：每轮可呼叫一个功能区提供战场支援<br>
            • <strong style="color:var(--amber)">推演后</strong>：推演结果反哺功能区状态，形成持续改进闭环<br>
            • <strong style="color:var(--purple)">训练中心</strong>：完成训练模块可获得永久推演加成
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;flex-shrink:0">
          <button onclick="ZoneUI.resetAll()" style="padding:8px 16px;font-size:12px;color:var(--txt-1);background:rgba(255,71,87,.06);border:1px solid rgba(255,71,87,.15);border-radius:5px;cursor:pointer;transition:all .2s"
            onmouseover="this.style.background='rgba(255,71,87,.12)'"
            onmouseout="this.style.background='rgba(255,71,87,.06)'">🔄 重置全部</button>
        </div>
      </div>

    ${scenarioNote}

    ${typeof ThreatContext !== 'undefined' ? ThreatContext._renderGlobalThreatOverview() : ''}

    <div class="z-cards-grid">${cardsHtml}</div>
      ${bonusHtml}

      <div style="display:grid;grid-template-columns:1fr;gap:16px;margin-top:16px">
        <div class="panel" style="padding:16px 20px">
          <div style="font-size:14px;font-weight:700;color:var(--cyan);margin-bottom:14px;display:flex;align-items:center;gap:8px">
            📡 实时事件日志 <span style="font-size:10px;color:var(--green);animation:pulse 1.5s infinite">●</span>
          </div>
          <div id="z-event-log" style="display:flex;flex-direction:column;gap:6px;max-height:200px;overflow-y:auto;font-size:12px">${eventHtml}</div>
        </div>
      </div>
    </div>
    <div id="zone-detail-target"></div>`;
  },

  /* ===== 进入功能区详情 ===== */
  showDetail(zoneId){
    this._viewMode = 'detail';
    this._detailZone = zoneId;
    const html = zoneId === 'training' ? this._renderTraining() : this._renderZone(zoneId);
    const target = document.getElementById('zone-detail-target');
    if(target){
      target.innerHTML = html;
      target.style.display = 'block';
    }
    const global = document.getElementById('zone-global');
    if(global) global.style.display = 'none';

    if(this._detailTimer) clearInterval(this._detailTimer);
    this._detailTimer = setInterval(() => {
      const t = document.getElementById('zone-detail-target');
      if(!t || t.style.display === 'none'){ clearInterval(this._detailTimer); return; }
      this._refreshDetail(zoneId);
    }, 1500);
  },

  /* ===== 返回全域视图 ===== */
  backToGlobal(){
    this._viewMode = 'global';
    if(this._detailTimer){ clearInterval(this._detailTimer); this._detailTimer = null; }
    const target = document.getElementById('zone-detail-target');
    if(target) target.style.display = 'none';
    const global = document.getElementById('zone-global');
    if(global) global.style.display = 'block';
    this._refreshGlobal();
  },

  /* ===== 刷新全域视图 ===== */
  _refreshGlobal(){
    const container = document.getElementById('zone-global');
    if(!container) return;
    const newHtml = this._renderGlobal();
    const temp = document.createElement('div');
    temp.innerHTML = newHtml;
    const newEl = temp.firstElementChild;
    if(newEl) container.parentNode.replaceChild(newEl, container);
  },

  /* ===== 渲染单个功能区详情 ===== */
  _renderZone(zoneId){
    const cfg = ZONE_CONFIG[zoneId];
    const st = ZoneSystem.getState(zoneId);
    if(!cfg || !st) return '<div>功能区不存在</div>';

    const wgActive = (typeof Wargame !== 'undefined' && Wargame.state);
    const scenarioId = wgActive ? Wargame.state.scenario.id : null;
    const notes = scenarioId ? ZoneSystem.getScenarioNotes(scenarioId) : {};
    const note = notes[zoneId];

    const hasExec = st.executing !== null;
    const execAction = hasExec ? cfg.actions.find(a => a.id === st.executing) : null;

    let actionHtml = cfg.actions.map(a => {
      const actSt = st.actions[a.id];
      const status = actSt?.status || 'idle';
      const statusLabel = status==='idle'?'待执行':status==='executing'?'执行中':'已完成';
      const statusColor = status==='idle'?'var(--txt-2)':status==='executing'?cfg.color:'var(--green)';
      const bg = status==='executing'?`${cfg.color}10`:status==='completed'?'rgba(46,213,115,.08)':'rgba(0,180,216,.04)';
      const border = status==='executing'?`${cfg.color}33`:'var(--border)';
      const canClick = status==='idle' && !hasExec;

      // 推演加成预览
      let bonusTip = '';
      if(a.wargameBonus && status==='idle'){
        bonusTip = `<div style="font-size:10px;color:var(--green);margin-top:3px">🎁 推演加成: ${a.wargameBonus.desc}</div>`;
      }

      // 联动效果预览
      let rippleTip = '';
      if(a.effects && status==='idle'){
        const parts = [];
        Object.keys(a.effects).forEach(tid => {
          const tcfg = ZONE_CONFIG[tid];
          if(!tcfg) return;
          Object.keys(a.effects[tid]).forEach(kid => {
            const delta = a.effects[tid][kid];
            const tkpi = tcfg.kpis.find(k => k.id === kid);
            if(tkpi) parts.push(`${tcfg.icon}${tkpi.name}${delta>0?'+':''}${delta}`);
          });
        });
        if(parts.length) rippleTip = `<div style="font-size:10px;color:${cfg.color}88;margin-top:3px">→ 联动: ${parts.join(' ')}</div>`;
      }

      // 协同预览
      let synergyTip = '';
      if(a.synergy && status==='idle'){
        const parts = Object.keys(a.synergy).map(tid => {
          const tcfg = ZONE_CONFIG[tid];
          return tcfg ? `${tcfg.icon}${tcfg.short}+${a.synergy[tid]}` : '';
        }).filter(Boolean);
        if(parts.length) synergyTip = `<div style="font-size:10px;color:var(--amber);margin-top:3px">⭐ 协同: ${parts.join(' ')}</div>`;
      }

      return `
      <div class="z-action-row" style="background:${bg};border-color:${border}">
        <div class="z-action-icon" style="background:${cfg.color}15">${cfg.icon}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:14px;font-weight:600;color:var(--txt-0)">${a.name}</div>
          <div style="font-size:12px;color:var(--txt-1);margin-top:2px">${a.desc}</div>
          ${bonusTip}${rippleTip}${synergyTip}
          ${status==='executing'?`
            <div style="margin-top:6px;height:4px;background:rgba(0,180,216,.10);border-radius:2px;overflow:hidden">
              <div style="height:100%;width:${actSt?.progress||0}%;background:${cfg.color};border-radius:2px;transition:width .3s"></div>
            </div>`:''}
        </div>
        <div style="text-align:right;flex-shrink:0">
          <div style="font-size:11px;padding:3px 8px;border-radius:3px;color:${statusColor};background:${status==='executing'?cfg.color+'15':'rgba(0,180,216,.04)'}">${statusLabel}</div>
          <div style="font-size:10px;color:var(--txt-2);margin-top:3px">消耗${a.cost}AP</div>
        </div>
        ${canClick?`
          <button onclick="ZoneUI.doAction('${zoneId}','${a.id}')" class="z-action-btn" style="background:${cfg.color};color:#fff"
            onmouseover="this.style.boxShadow='0 0 14px ${cfg.color}66'"
            onmouseout="this.style.boxShadow='none'">执行</button>`:''}
      </div>`;
    }).join('');

    // 战场支援按钮（推演中）
    let supportHtml = '';
    if(wgActive && ZoneSystem._wargameBonuses){
      const canSupport = ZoneSystem.canSupport(zoneId);
      const used = ZoneSystem._supportUsed[zoneId];
      const supports = {
        intel: '揭示1张情报卡', command: '军事域+8%', logistics: '+1行动点',
        economy: '+500亿资金', tech: '网络防御+10',
      };
      supportHtml = `
      <div class="panel" style="padding:14px 18px;margin-bottom:14px;border-color:var(--green)33">
        <div style="font-size:13px;font-weight:700;color:var(--green);margin-bottom:8px">🎖️ 战场支援</div>
        <div style="font-size:12px;color:var(--txt-1);margin-bottom:10px">支援效果：${supports[zoneId]||'未知'} · 消耗8%战备度</div>
        <button onclick="ZoneUI.callSupport('${zoneId}')" ${!canSupport||used?'disabled':''}
          style="padding:10px 20px;font-size:13px;font-weight:600;border-radius:5px;cursor:${canSupport&&!used?'pointer':'not-allowed'};
            background:${canSupport&&!used?'var(--green)':'rgba(0,180,216,.08)'};
            color:${canSupport&&!used?'#fff':'var(--txt-2)'};
            border:1px solid ${canSupport&&!used?'var(--green)':'var(--border)'}">
          ${used?'✓ 本轮已使用支援':canSupport?'呼叫战场支援':'战备度不足(需≥40%)'}
        </button>
      </div>`;
    }

    // 场景备注
    let noteHtml = '';
    if(note){
      noteHtml = `<div style="margin-top:8px;padding:8px 12px;background:${cfg.color}08;border-left:3px solid ${cfg.color};border-radius:0 4px 4px 0;font-size:12px;color:var(--txt-1);line-height:1.6">🎯 ${note}</div>`;
    }

    return `
    <div class="fade-in">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
        <button onclick="ZoneUI.backToGlobal()" style="padding:8px 14px;font-size:12px;background:rgba(0,180,216,.12);color:var(--cyan);border:1px solid rgba(0,180,216,.3);border-radius:5px;cursor:pointer;transition:all .2s"
          onmouseover="this.style.background='rgba(0,180,216,.20)'"
          onmouseout="this.style.background='rgba(0,180,216,.12)'">← 返回全域协同</button>
        <div style="display:flex;gap:6px">
          ${['intel','command','training','logistics','economy','tech','aar'].map(id => {
            const dc = ZONE_CONFIG[id];
            const active = id === zoneId;
            return `<button onclick="ZoneUI.showDetail('${id}')" style="padding:6px 12px;font-size:12px;background:${active?dc.color+'18':'rgba(0,180,216,.06)'};color:${active?dc.color:'var(--txt-2)'};border:1px solid ${active?dc.color+'33':'var(--border)'};border-radius:5px;cursor:pointer">${dc.icon} ${dc.short}</button>`;
          }).join('')}
        </div>
      </div>

      <div class="panel" style="padding:18px 22px;margin-bottom:14px;border-color:${cfg.color}33">
        <div style="display:flex;align-items:center;gap:14px">
          <div style="width:56px;height:56px;border-radius:12px;background:${cfg.color}15;display:flex;align-items:center;justify-content:center;font-size:28px;border:2px solid ${cfg.color}33;flex-shrink:0">${cfg.icon}</div>
          <div style="flex:1">
            <div style="font-size:20px;font-weight:800;color:${cfg.color}">${cfg.name}</div>
            <div style="font-size:13px;color:var(--txt-2)">${cfg.desc}</div>
            ${noteHtml}
          </div>
          <div style="text-align:center;padding:12px 18px;background:rgba(8,20,40,.5);border-radius:8px;border:1px solid ${cfg.color}22">
            <div style="font-size:10px;color:var(--txt-2)">战备度</div>
            <div style="font-size:34px;font-weight:800;color:${cfg.color};font-family:Consolas,monospace;line-height:1.1">${st.readiness}%</div>
            <div style="font-size:12px;color:var(--txt-2)">完成${st.completions}/${cfg.actions.length}</div>
          </div>
        </div>
      </div>

      <div class="panel" style="padding:16px 20px;margin-bottom:14px">
        <div style="font-size:13px;font-weight:700;color:var(--cyan);margin-bottom:12px">📊 关键指标</div>
        <div style="display:grid;grid-template-columns:repeat(${cfg.kpis.length},1fr);gap:12px">
          ${cfg.kpis.map(k => {
            const pct = Math.round(k.value/k.max*100);
            const tColor = (k.trend||0)>0?'var(--green)':(k.trend||0)<0?'var(--red)':'var(--txt-2)';
            return `
            <div style="padding:12px;background:rgba(0,180,216,.06);border:1px solid var(--border);border-radius:8px;text-align:center">
              <div style="font-size:10px;color:var(--txt-2);margin-bottom:5px">${k.name}</div>
              <div style="font-size:22px;font-weight:800;color:${cfg.color};font-family:Consolas,monospace">${k.value}<span style="font-size:12px">${k.unit}</span></div>
              <div style="font-size:11px;color:${tColor};margin-top:3px">${(k.trend||0)>0?'↑':(k.trend||0)<0?'↓':'—'}</div>
              <div style="height:4px;background:rgba(0,180,216,.10);border-radius:2px;overflow:hidden;margin-top:6px">
                <div style="height:100%;width:${pct}%;background:${cfg.color};border-radius:2px;opacity:.5"></div>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>

      ${supportHtml}

      ${typeof ThreatContext !== 'undefined' ? ThreatContext.renderThreatResponseSection(zoneId) : ''}

      ${(zoneId === 'intel' && typeof INTEL !== 'undefined') ? ZoneUI._renderIntelFeed() : ''}

      <div class="panel" style="padding:16px 20px">
        <div style="font-size:13px;font-weight:700;color:var(--cyan);margin-bottom:12px">
          ⚡ 常规行动执行 ${hasExec?`<span style="font-size:11px;color:${cfg.color};font-weight:400">· 执行中: ${execAction?.name}</span>`:''}
        </div>
        <div style="display:flex;flex-direction:column;gap:6px">${actionHtml}</div>
      </div>
    </div>`;
  },

  /* ===== 渲染情报中心已收情报通报 ===== */
  _renderIntelFeed(){
    const intelItems = INTEL.slice(0, 6);
    if(!intelItems.length) return '';

    const html = intelItems.map(item => {
      const relColor = item.reliability === 'A' ? '#2ed573' : item.reliability === 'B' ? '#ffa502' : '#ff4757';
      const domainInfo = (typeof DOMAIN_MAP !== 'undefined' && DOMAIN_MAP[item.type]) ? DOMAIN_MAP[item.type] : null;
      const domainColor = domainInfo ? domainInfo.color : 'var(--cyan)';
      const domainIcon = domainInfo ? domainInfo.icon : '📡';
      return `
      <div style="padding:10px 14px;background:rgba(0,180,216,.04);border:1px solid var(--border);border-radius:6px;margin-bottom:6px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;flex-wrap:wrap">
          <span style="padding:1px 6px;background:${relColor}15;color:${relColor};border-radius:2px;font-size:9px;font-weight:700">${item.reliability}</span>
          <span style="font-size:11px;color:${domainColor};font-weight:600">${domainIcon} ${item.source}</span>
          <span style="font-size:10px;color:var(--txt-2);margin-left:auto">${item.time}</span>
        </div>
        <div style="font-size:13px;font-weight:600;color:var(--txt-0);margin-bottom:3px">${item.title}</div>
        <div style="font-size:11px;color:var(--txt-1);line-height:1.5">${item.summary}</div>
        ${item.modifier ? `<div style="font-size:10px;color:var(--green);margin-top:4px">→ 推演修正: ${item.modifier.domain}域 +${item.modifier.bonus}</div>` : ''}
      </div>`;
    }).join('');

    return `
    <div class="panel" style="padding:16px 20px;margin-bottom:14px;border-color:#a29bfe33">
      <div style="font-size:13px;font-weight:700;color:#a29bfe;margin-bottom:12px;display:flex;align-items:center;gap:6px">
        📡 已收情报通报 <span style="font-size:10px;color:var(--txt-2);font-weight:400">${intelItems.length}条 · 来源${new Set(intelItems.map(i => i.source)).size}个</span>
      </div>
      ${html}
    </div>`;
  },

  /* ===== 渲染训练中心 ===== */
  _renderTraining(){
    const modules = TrainingSystem.getModules();
    const stats = TrainingSystem.getStats();
    const cfg = ZONE_CONFIG.training;

    // 推荐训练
    const wgActive = (typeof Wargame !== 'undefined' && Wargame.state);
    const scenarioId = wgActive ? Wargame.state.scenario.id : null;
    const recommended = scenarioId ? TrainingSystem.getRecommendedFor(scenarioId) : [];

    let recommendedHtml = '';
    if(recommended.length){
      recommendedHtml = `
      <div class="panel" style="padding:14px 18px;margin-bottom:14px;border-color:var(--green)33">
        <div style="font-size:13px;font-weight:700;color:var(--green);margin-bottom:10px">🎯 当前场景推荐训练</div>
        <div style="display:flex;flex-wrap:wrap;gap:8px">
          ${recommended.map(m => {
            const done = TrainingSystem.isCompleted(m.id);
            return `
            <div onclick="ZoneUI.startTraining('${m.id}')" style="cursor:pointer;padding:10px 16px;background:${done?'rgba(46,213,115,.08)':'rgba(46,213,115,.04)'};border:1px solid ${done?'rgba(46,213,115,.3)':'rgba(46,213,115,.15)'};border-radius:6px;transition:all .2s"
              onmouseover="this.style.background='rgba(46,213,115,.1)'"
              onmouseout="this.style.background='${done?'rgba(46,213,115,.08)':'rgba(46,213,115,.04)'}'">
              <div style="font-size:14px;color:var(--green)">${m.icon} ${m.name} ${done?'✓':''}</div>
              <div style="font-size:11px;color:var(--txt-2);margin-top:2px">难度${'★'.repeat(m.difficulty)} · ${m.duration}</div>
              <div style="font-size:11px;color:var(--green);margin-top:2px">🎁 ${m.bonus.desc}</div>
            </div>`;
          }).join('')}
        </div>
      </div>`;
    }

    let moduleHtml = modules.map(m => {
      const done = TrainingSystem.isCompleted(m.id);
      const diff = '★'.repeat(m.difficulty) + '☆'.repeat(5-m.difficulty);
      const domains = m.domains.map(d => {
        const dm = {military:'军事',economic:'经济',cyber:'网络',diplomatic:'外交',information:'信息',domestic:'国内'};
        return dm[d]||d;
      }).join('/');

      return `
      <div class="z-action-row" style="background:${done?'rgba(46,213,115,.06)':'rgba(0,180,216,.04)'};border-color:${done?'rgba(46,213,115,.2)':'var(--border)'}">
        <div class="z-action-icon" style="background:${cfg.color}15;font-size:24px">${m.icon}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:14px;font-weight:600;color:var(--txt-0)">${m.name} ${done?'<span style="color:var(--green);font-size:12px">✓ 已完成</span>':''}</div>
          <div style="font-size:12px;color:var(--txt-1);margin-top:2px">${m.desc}</div>
          <div style="font-size:11px;color:var(--txt-2);margin-top:4px">难度${diff} · ${m.duration} · 适用：${domains}</div>
          <div style="font-size:11px;color:var(--green);margin-top:3px">🎁 完成奖励：${m.bonus.desc}</div>
        </div>
        <button onclick="ZoneUI.startTraining('${m.id}')" class="z-action-btn" style="background:${done?'var(--border)':'var(--green)'};color:${done?'var(--txt-2)':'#fff'};cursor:${done?'default':'pointer'}">
          ${done?'复习':'开始训练'}
        </button>
      </div>`;
    }).join('');

    return `
    <div class="fade-in">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
        <button onclick="ZoneUI.backToGlobal()" style="padding:8px 14px;font-size:12px;background:rgba(0,180,216,.12);color:var(--cyan);border:1px solid rgba(0,180,216,.3);border-radius:5px;cursor:pointer">← 返回全域协同</button>
      </div>

      <div class="panel" style="padding:18px 22px;margin-bottom:14px;border-color:${cfg.color}33">
        <div style="display:flex;align-items:center;gap:14px">
          <div style="width:56px;height:56px;border-radius:12px;background:${cfg.color}15;display:flex;align-items:center;justify-content:center;font-size:28px;border:2px solid ${cfg.color}33;flex-shrink:0">${cfg.icon}</div>
          <div style="flex:1">
            <div style="font-size:20px;font-weight:800;color:${cfg.color}">${cfg.name}</div>
            <div style="font-size:13px;color:var(--txt-2)">${cfg.desc}</div>
          </div>
          <div style="text-align:center;padding:12px 18px;background:rgba(8,20,40,.5);border-radius:8px;border:1px solid ${cfg.color}22">
            <div style="font-size:10px;color:var(--txt-2)">完成率</div>
            <div style="font-size:34px;font-weight:800;color:${cfg.color};font-family:Consolas,monospace;line-height:1.1">${stats.rate}%</div>
            <div style="font-size:12px;color:var(--txt-2)">${stats.done}/${stats.total}模块</div>
          </div>
        </div>
      </div>

      <div class="panel" style="padding:16px 20px;margin-bottom:14px;border-color:var(--amber)33">
        <div style="font-size:13px;font-weight:700;color:var(--amber);margin-bottom:8px">💡 训练系统说明</div>
        <div style="font-size:12px;color:var(--txt-1);line-height:1.7">
          • 完成训练模块可获得<strong style="color:var(--green)">永久推演加成</strong>，在进入任何推演场景时自动生效<br>
          • 推荐训练模块针对当前场景类型优化，优先完成可获得最大收益<br>
          • 训练内容包括情境模拟、理论学习和案例分析，完成后可随时复习<br>
          • 训练完成率影响全域协同评分和推演准备度
        </div>
      </div>

      ${recommendedHtml}

      <div class="panel" style="padding:16px 20px">
        <div style="font-size:13px;font-weight:700;color:var(--cyan);margin-bottom:12px">📚 训练模块列表</div>
        <div style="display:flex;flex-direction:column;gap:6px">${moduleHtml}</div>
      </div>
    </div>`;
  },

  /* ===== 渲染AAR中心 ===== */
  _renderAAR(){
    const cfg = ZONE_CONFIG.aar;
    const st = ZoneSystem.getState('aar');
    const games = (typeof STATE !== 'undefined' && STATE.games) ? STATE.games : [];

    let gamesHtml = '';
    if(games.length){
      gamesHtml = games.slice(-5).reverse().map(g => {
        const sc = (typeof SCENARIOS !== 'undefined') ? SCENARIOS.find(s => s.id === g.scenario) : null;
        const scenarioName = g.scenarioName || (sc ? sc.name : g.scenario) || '未知场景';
        const isVictory = g.victory !== undefined ? g.victory : (g.result === '胜利');
        return `
        <div style="padding:10px 14px;background:rgba(0,180,216,.06);border:1px solid var(--border);border-radius:6px;margin-bottom:6px">
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:16px">${isVictory?'🏆':(g.result==='平局'?'🤝':'📉')}</span>
            <div style="flex:1">
              <div style="font-size:13px;color:var(--txt-0)">${scenarioName}</div>
              <div style="font-size:11px;color:var(--txt-2)">${g.date||'未知日期'} · 回合${g.rounds||'?'} · 评分${g.score||'?'}</div>
            </div>
          </div>
        </div>`;
      }).join('');
    } else {
      gamesHtml = '<div style="color:var(--txt-2);font-size:12px;text-align:center;padding:20px">暂无推演记录，完成推演后将自动记录于此</div>';
    }

    return `
    <div class="fade-in">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
        <button onclick="ZoneUI.backToGlobal()" style="padding:8px 14px;font-size:12px;background:rgba(0,180,216,.12);color:var(--cyan);border:1px solid rgba(0,180,216,.3);border-radius:5px;cursor:pointer">← 返回全域协同</button>
      </div>

      <div class="panel" style="padding:18px 22px;margin-bottom:14px;border-color:${cfg.color}33">
        <div style="display:flex;align-items:center;gap:14px">
          <div style="width:56px;height:56px;border-radius:12px;background:${cfg.color}15;display:flex;align-items:center;justify-content:center;font-size:28px;border:2px solid ${cfg.color}33;flex-shrink:0">${cfg.icon}</div>
          <div style="flex:1">
            <div style="font-size:20px;font-weight:800;color:${cfg.color}">${cfg.name}</div>
            <div style="font-size:13px;color:var(--txt-2)">${cfg.desc}</div>
          </div>
          <div style="text-align:center;padding:12px 18px;background:rgba(8,20,40,.5);border-radius:8px;border:1px solid ${cfg.color}22">
            <div style="font-size:10px;color:var(--txt-2)">推演次数</div>
            <div style="font-size:34px;font-weight:800;color:${cfg.color};font-family:Consolas,monospace;line-height:1.1">${st?st.completions:0}</div>
          </div>
        </div>
      </div>

      <div class="panel" style="padding:16px 20px;margin-bottom:14px">
        <div style="font-size:13px;font-weight:700;color:var(--cyan);margin-bottom:12px">📊 体系指标</div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">
          ${cfg.kpis.map(k => `
          <div style="padding:12px;background:rgba(0,180,216,.06);border:1px solid var(--border);border-radius:8px;text-align:center">
            <div style="font-size:10px;color:var(--txt-2);margin-bottom:5px">${k.name}</div>
            <div style="font-size:22px;font-weight:800;color:${cfg.color};font-family:Consolas,monospace">${k.value}<span style="font-size:12px">${k.unit}</span></div>
          </div>`).join('')}
        </div>
      </div>

      <div class="panel" style="padding:16px 20px">
        <div style="font-size:13px;font-weight:700;color:var(--cyan);margin-bottom:12px">📋 最近推演记录</div>
        ${gamesHtml}
      </div>
    </div>`;
  },

  /* ===== 启动训练模块 ===== */
  startTraining(moduleId){
    const mod = TrainingSystem.getModule(moduleId);
    if(!mod) return;

    // 构建训练弹窗
    const overlay = document.createElement('div');
    overlay.id = 'training-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.85);z-index:10000;display:flex;align-items:center;justify-content:center;animation:fadeIn .3s';

    TrainingSystem._currentModule = moduleId;
    TrainingSystem._currentStep = 0;
    const trainColor = ZONE_CONFIG.training.color;

    const renderStep = () => {
      const step = mod.content[TrainingSystem._currentStep];
      const isLast = TrainingSystem._currentStep >= mod.content.length - 1;
      const progress = Math.round((TrainingSystem._currentStep + 1) / mod.content.length * 100);

      overlay.innerHTML = `
      <div style="width:600px;max-width:90vw;max-height:85vh;background:linear-gradient(135deg,rgba(13,20,36,.98),rgba(20,28,48,.98));border:1px solid ${trainColor};border-radius:12px;overflow:hidden;display:flex;flex-direction:column">
        <div style="padding:16px 24px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:12px">
          <span style="font-size:28px">${mod.icon}</span>
          <div style="flex:1">
            <div style="font-size:16px;font-weight:700;color:${trainColor}">${mod.name}</div>
            <div style="font-size:11px;color:var(--txt-2)">步骤 ${TrainingSystem._currentStep+1}/${mod.content.length}</div>
          </div>
          <button onclick="document.getElementById('training-overlay').remove()" style="padding:6px 12px;font-size:14px;color:var(--txt-2);background:rgba(0,180,216,.08);border:1px solid var(--border);border-radius:4px;cursor:pointer">✕</button>
        </div>
        <div style="height:3px;background:rgba(0,180,216,.10)">
          <div style="height:100%;width:${progress}%;background:${trainColor};transition:width .3s"></div>
        </div>
        <div style="padding:24px;overflow-y:auto;flex:1">
          ${step.type === 'scenario' ? `
            <div style="padding:14px 18px;background:rgba(255,165,2,.06);border:1px solid rgba(255,165,2,.2);border-radius:8px;margin-bottom:14px">
              <div style="font-size:12px;color:var(--amber);margin-bottom:6px">⚠️ ${step.title}</div>
              <div style="font-size:13px;color:var(--txt-0);line-height:1.8">${step.text}</div>
            </div>
            <div style="font-size:12px;color:var(--txt-2);text-align:center;padding:10px">请思考后继续下一步</div>
          ` : `
            <div style="padding:14px 18px;background:rgba(0,180,216,.08);border:1px solid rgba(0,180,216,.3);border-radius:8px">
              <div style="font-size:12px;color:var(--cyan);margin-bottom:6px">📖 ${step.title}</div>
              <div style="font-size:13px;color:var(--txt-0);line-height:1.8">${step.text}</div>
            </div>
          `}
        </div>
        <div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
          <button onclick="ZoneUI._trainingPrev()" ${TrainingSystem._currentStep===0?'disabled':''}
            style="padding:8px 16px;font-size:12px;background:rgba(0,180,216,.08);color:${TrainingSystem._currentStep===0?'var(--txt-2)':'var(--cyan)'};border:1px solid ${TrainingSystem._currentStep===0?'var(--border)':'rgba(0,180,216,.3)'};border-radius:5px;cursor:${TrainingSystem._currentStep===0?'default':'pointer'}">← 上一步</button>
          <div style="font-size:11px;color:var(--txt-2)">奖励：${mod.bonus.desc}</div>
          ${isLast ? `
            <button onclick="ZoneUI._trainingComplete('${moduleId}')"
              style="padding:8px 20px;font-size:12px;font-weight:600;background:var(--green);color:#fff;border:1px solid var(--green);border-radius:5px;cursor:pointer">完成训练 ✓</button>
          ` : `
            <button onclick="ZoneUI._trainingNext()"
              style="padding:8px 16px;font-size:12px;background:var(--cyan);color:#fff;border:1px solid var(--cyan);border-radius:5px;cursor:pointer">下一步 →</button>
          `}
        </div>
      </div>`;
    };

    renderStep();
    document.body.appendChild(overlay);

    // 存储渲染函数供导航使用
    ZoneUI._renderTrainingStep = renderStep;
  },

  _trainingNext(){
    const mod = TrainingSystem.getModule(TrainingSystem._currentModule);
    if(!mod) return;
    if(TrainingSystem._currentStep < mod.content.length - 1){
      TrainingSystem._currentStep++;
      ZoneUI._renderTrainingStep();
    }
  },

  _trainingPrev(){
    if(TrainingSystem._currentStep > 0){
      TrainingSystem._currentStep--;
      ZoneUI._renderTrainingStep();
    }
  },

  _trainingComplete(moduleId){
    TrainingSystem.completeModule(moduleId);
    const overlay = document.getElementById('training-overlay');
    if(overlay){
      const mod = TrainingSystem.getModule(moduleId);
      overlay.innerHTML = `
      <div style="width:400px;max-width:90vw;background:linear-gradient(135deg,rgba(13,20,36,.98),rgba(20,28,48,.98));border:1px solid var(--green);border-radius:12px;padding:32px;text-align:center">
        <div style="font-size:48px;margin-bottom:12px">🎓</div>
        <div style="font-size:18px;font-weight:700;color:var(--green);margin-bottom:8px">训练完成！</div>
        <div style="font-size:14px;color:var(--txt-1);margin-bottom:16px">${mod.name}</div>
        <div style="padding:12px 18px;background:rgba(46,213,115,.08);border:1px solid rgba(46,213,115,.2);border-radius:8px;margin-bottom:20px">
          <div style="font-size:12px;color:var(--green)">🎁 已获得推演加成</div>
          <div style="font-size:14px;color:var(--txt-0);margin-top:4px">${mod.bonus.desc}</div>
        </div>
        <button onclick="document.getElementById('training-overlay').remove();ZoneUI.showDetail('training')"
          style="padding:10px 24px;font-size:13px;background:var(--cyan);color:#fff;border:1px solid var(--cyan);border-radius:5px;cursor:pointer">返回训练中心</button>
      </div>`;
    }
  },

  /* ===== 执行行动 ===== */
  doAction(zoneId, actionId){
    const result = ZoneSystem.executeAction(zoneId, actionId);
    if(!result.ok){
      this._flashMsg(result.msg, 'error');
      return;
    }
    this._flashMsg(result.msg, 'success');
    this._refreshDetail(zoneId);
  },

  /* ===== 呼叫战场支援 ===== */
  callSupport(zoneId){
    const result = ZoneSystem.callZoneSupport(zoneId);
    if(!result.ok){
      this._flashMsg(result.msg, 'error');
      return;
    }
    this._flashMsg(result.msg, 'success');
    // 应用支援效果到推演
    if(typeof Wargame !== 'undefined' && Wargame.state){
      const s = result.support;
      if(s.type === 'extra_ap'){
        Wargame.state.actionPoints += s.value;
        Wargame.state.maxAP = Math.max(Wargame.state.maxAP, Wargame.state.actionPoints);
      } else if(s.type === 'extra_funding'){
        Wargame.state.funding += s.value;
      }
      Wargame.state.log.push({ type:'support', text:`🎖️ 功能区支援：${result.msg}`, round: Wargame.state.round });
      Wargame.renderWargameView();
    }
    this._refreshDetail(zoneId);
  },

  /* ===== 重置 ===== */
  resetAll(){
    ZoneSystem.reset();
    if(typeof ThreatContext !== 'undefined') ThreatContext.reset();
    if(this._viewMode === 'detail') this.backToGlobal();
    else this._refreshGlobal();
    this._flashMsg('已重置所有功能区（含威胁响应）', 'info');
  },

  /* ===== 内部回调 ===== */
  _notifyUpdate(zoneId){
    if(this._viewMode === 'detail' && this._detailZone === zoneId){
      this._refreshDetail(zoneId);
    }
    this._refreshEventLog();
  },
  _notifyEvent(){
    this._refreshEventLog();
  },

  _refreshDetail(zoneId){
    const target = document.getElementById('zone-detail-target');
    if(!target || target.style.display === 'none') return;
    const html = zoneId === 'training' ? this._renderTraining() :
                 zoneId === 'aar' ? this._renderAAR() :
                 this._renderZone(zoneId);
    target.innerHTML = html;
  },

  _refreshEventLog(){
    const logEl = document.getElementById('z-event-log');
    if(!logEl) return;
    const events = ZoneSystem._eventLog.slice(0,8);
    if(!events.length){
      logEl.innerHTML = '<div style="color:var(--txt-2);font-size:12px;text-align:center;padding:10px">暂无事件</div>';
      return;
    }
    logEl.innerHTML = events.map(ev => {
      const cfg = ZONE_CONFIG[ev.zoneId];
      const color = cfg ? cfg.color : 'var(--txt-1)';
      return `<div class="z-event-item" style="color:${color}">
        <span style="font-size:10px;color:var(--txt-2);flex-shrink:0">${ev.timeStr}</span>
        <span>${ev.text}</span>
      </div>`;
    }).join('');
  },

  _flashMsg(msg, type){
    const color = type==='error'?'var(--red)':type==='info'?'var(--cyan)':'var(--green)';
    const div = document.createElement('div');
    div.style.cssText = `position:fixed;top:80px;right:40px;padding:10px 20px;background:rgba(13,20,36,.95);border:1px solid ${color};border-radius:6px;color:${color};font-size:13px;z-index:9999;animation:fadeIn .3s`;
    div.textContent = msg;
    document.body.appendChild(div);
    setTimeout(() => { div.style.opacity='0'; div.style.transition='opacity .3s'; }, 1500);
    setTimeout(() => div.remove(), 2000);
  },

  destroy(){
    if(this._detailTimer) clearInterval(this._detailTimer);
  },
};

/* ===== 7. 入口函数 ===== */
function renderZone(zoneId){
  ZoneSystem._init();
  return ZoneUI.render(zoneId);
}

/* ===== 8. 兼容层：让旧代码的 renderCenter 调用新系统 ===== */
function renderCenter(centerId){
  // 旧ID映射到新功能区
  const mapping = {
    diplomatic: 'command',
    economic: 'economy',
    tech: 'tech',
    logistics: 'logistics',
  };
  const zoneId = mapping[centerId] || centerId;
  ZoneSystem._init();
  return ZoneUI.render(zoneId);
}

/* ===== 9. 全局暴露 ===== */
if(typeof window !== 'undefined'){
  window.ZONE_CONFIG = ZONE_CONFIG;
  window.SCENARIO_ZONES = SCENARIO_ZONES;
  window.TRAINING_MODULES = TRAINING_MODULES;
  window.ZoneSystem = ZoneSystem;
  window.TrainingSystem = TrainingSystem;
  window.ZoneUI = ZoneUI;
  window.renderZone = renderZone;
  window.renderCenter = renderCenter;
}
