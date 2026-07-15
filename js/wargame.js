/* ================================================================
 * NSS-WGS v12.0 兵棋推演引擎
 *
 * 核心系统:
 *   1. 资金系统  — 作战消耗资金, 科技研发等行动产生周期性收益(下轮结算)
 *   2. 声望系统  — 战争消耗声望(即时), 和平行动增长声望(下轮结算)
 *                  声望类型根据玩家阵营动态确定:
 *                  - sovereignty(维护主权): 战争行动声望惩罚×1.5
 *                  - aggressive(侵略行动): 战争行动声望惩罚×0.5
 *                  - tech(科技竞争): 战争行动声望惩罚×1.0
 *                  - none(非国家行为体): 声望系统不生效(恐怖组织/APT等不在乎国际声望)
 *   3. 推演规则  — d100骰子, 力量修正, 声望修正, 升级阶梯
 *   4. 力量融合  — FORCES 战备度影响行动效果
 *   5. 情报融合  — INTEL 情报提供域修正加成
 *   6. 场景行动  — 每个场景有专属战略行动
 * ================================================================ */

/* ===== 推演规则 ===== */
const WG_RULES = {
  baseAP: 5,
  diceType: 'd100',
  /* 大成功: roll <= successRate * 0.25 → 效果 ×1.5 */
  /* 成功:   roll <= successRate       → 效果 ×1.0 */
  /* 失败:   roll >  successRate       → 效果 ×0.3, 可能反噬 */
  greatSuccessMult: 0.25,
  failureMult: 0.3,
  /* 力量修正: (战备度 - 50) × 0.3% */
  forceModRate: 0.3,
  /* 声望修正: (国际声望 - 50) × 0.2% */
  repModRate: 0.2,
  /* 国内支持修正: (国内支持 - 50) × 0.1% */
  domModRate: 0.1,
  /* 升级阶梯 */
  escalationLevels: [
    { lv:1, name:'低烈度',   desc:'常规博弈态势', aiAggression:0.3 },
    { lv:2, name:'中低烈度', desc:'对抗态势升温', aiAggression:0.5 },
    { lv:3, name:'中烈度',   desc:'多域对抗加剧', aiAggression:0.65 },
    { lv:4, name:'中高烈度', desc:'冲突风险显著', aiAggression:0.8 },
    { lv:5, name:'高烈度',   desc:'战争边缘态势', aiAggression:0.95 },
  ],
  /* 声望系统规则 */
  prestige: {
    /* 场景类型 → 战争行动声望惩罚倍率 */
    warPenalty: {
      sovereignty: 1.5,  /* 维护主权场景：战争行动声望损失×1.5 */
      aggressive:  0.5,  /* 侵略行动场景：战争行动声望损失×0.5 */
      tech:        1.0,  /* 科技竞争场景：战争行动声望损失×1.0 */
      none:        0,    /* 犯罪/恐怖组织场景：声望不受影响 */
    },
    /* 和平行动声望增长倍率（所有类型通用，但 none 类型为 0） */
    peaceGrowth: {
      sovereignty: 1.0,
      aggressive:  1.0,
      tech:        1.0,
      none:        0,
    },
    /* 和平行动判定: escalation <= 0 且 repEffect > 0 */
    /* 战争行动判定: escalation >= 2 */
  },
  /* 资金系统规则 */
  funding: {
    /* 科技研发类行动 → 下轮资金收益(亿元) */
    techGrowthMap: {
      eco_tech: 300, eco_rmb: 200, eco_swap: 150, eco_supply: 200,
      eco_trade: 120, ai_chip: 350, ai_talent: 100, fw_cips: 200,
      fw_gold: 150, re_downstream: 250, ds_platform: 150, sp_constellation: 120,
      dom_economy: 150, ac_route: 100,
      /* 新增场景科技行动 */
      af_recon: 150, ha_aid: 100, vz_energy: 200, bs_vaccine: 250,
      ds_explore: 200, ds_monitor: 100, cs_carbon: 300, cs_energy: 250,
      fs_reserve: 100, fs_tech: 200, sc_reshore: 300, sc_diversify: 200,
      sc_stockpile: 150, cw_platform: 150,
      /* 新增场景(31-38)科技行动 */
      sm_bypass: 250, qt_breakthrough: 300, ws_diversion: 200,
      psr_route: 200, psr_research: 150, bd_indigenous: 250,
      et_renewable: 300, et_grid: 150, sd_track: 150,
    },
    /* 经济基础收益: 每轮资金 × 3% (经济域 ≥ 50 时生效) */
    baseGrowthRate: 0.03,
    /* 作战行动资金消耗倍率: 已在 fundingCost 中体现 */
  },
  /* 评分权重 */
  scoring: {
    domains: 0.35,
    reputation: 0.20,
    domestic: 0.20,
    funding: 0.10,
    escalation: 0.15, /* 低升级度 = 高分 */
  },
};

/* ===== 声望系统辅助函数 ===== */
function isPeaceAction(action){
  return action.escalation <= 0 && action.repEffect > 0;
}
function isWarAction(action){
  return action.escalation >= 2;
}
function getFundingGrowth(action){
  return (WG_RULES.funding.techGrowthMap && WG_RULES.funding.techGrowthMap[action.id]) || 0;
}
function getPrestigeType(scenario){
  return scenario.prestigeType || 'sovereignty';
}

/* ===== 六域定义 ===== */
const WG_DOMAINS = [
  { id:'military',    name:'军事',   icon:'⚔️', color:'#ff4757' },
  { id:'economic',    name:'经济',   icon:'📊', color:'#ffa502' },
  { id:'cyber',       name:'网络',   icon:'🌐', color:'#00b4d8' },
  { id:'diplomatic',  name:'外交',   icon:'🤝', color:'#2ed573' },
  { id:'information', name:'信息',   icon:'📡', color:'#ff6348' },
  { id:'domestic',    name:'国内',   icon:'🏠', color:'#a29bfe' },
];

/* ===== 战略行动库 =====
 * 每个行动包含:
 *   id          - 唯一标识
 *   domain      - 所属域
 *   name        - 行动名称
 *   desc        - 行动描述
 *   cost        - 行动点消耗
 *   fundingCost - 资金消耗(亿元)
 *   risk        - 风险系数(0-1)
 *   successBase - 基础成功率(0-100)
 *   escalation  - 升级度变化(-2 ~ +3)
 *   repEffect   - 国际声望变化(-15 ~ +10)
 *   domEffect   - 国内支持变化(-10 ~ +12)
 *   effects     - 六域效果变化
 *   counter     - 触发的AI反制行动ID
 *   scenario    - 专属场景ID(null=通用)
 */
const STRATEGIC_ACTIONS = [
  /* === 军事域 通用 === */
  { id:'mil_deter',    domain:'military', name:'前沿军事威慑部署', desc:'在争议区域前沿部署兵力，形成强大军事威慑',
    cost:3, fundingCost:800, risk:0.3, successBase:62, escalation:2, repEffect:-6, domEffect:5,
    effects:{ military:12, diplomatic:-8, economic:-3, cyber:0, information:2, domestic:5 }, counter:'mil_escalate', scenario:null },
  { id:'mil_exercise', domain:'military', name:'联合军事演习', desc:'与盟友举行联合军演，展示协同作战能力',
    cost:2, fundingCost:400, risk:0.15, successBase:72, escalation:1, repEffect:-3, domEffect:3,
    effects:{ military:8, diplomatic:-3, economic:-2, cyber:0, information:3, domestic:3 }, counter:'dip_protest', scenario:null },
  { id:'mil_standby',  domain:'military', name:'提升战备等级', desc:'提升全军战备等级，做好应急响应准备',
    cost:2, fundingCost:200, risk:0.1, successBase:80, escalation:1, repEffect:-2, domEffect:4,
    effects:{ military:6, diplomatic:-2, economic:-1, cyber:2, information:1, domestic:4 }, counter:'mil_match', scenario:null },
  { id:'mil_retaliate',domain:'military', name:'精确军事打击', desc:'对关键目标实施精确打击，展现决心与能力',
    cost:5, fundingCost:1500, risk:0.6, successBase:45, escalation:3, repEffect:-15, domEffect:-8,
    effects:{ military:15, diplomatic:-15, economic:-5, cyber:0, information:-5, domestic:-8 }, counter:'mil_escalate', scenario:null },
  { id:'mil_defense',  domain:'military', name:'防御态势调整', desc:'调整防御部署，强化关键节点防护',
    cost:2, fundingCost:300, risk:0.05, successBase:85, escalation:0, repEffect:2, domEffect:2,
    effects:{ military:5, diplomatic:2, economic:1, cyber:3, information:0, domestic:2 }, counter:'cyb_recon', scenario:null },

  /* === 经济域 通用 === */
  { id:'eco_sanction', domain:'economic', name:'经济制裁反制', desc:'对相关方实施对等经济制裁',
    cost:3, fundingCost:500, risk:0.25, successBase:65, escalation:1, repEffect:-5, domEffect:3,
    effects:{ military:0, diplomatic:-5, economic:-6, cyber:0, information:2, domestic:3 }, counter:'eco_retaliate', scenario:null },
  { id:'eco_trade',    domain:'economic', name:'贸易谈判与协议', desc:'通过贸易谈判化解经济争端',
    cost:2, fundingCost:100, risk:0.15, successBase:75, escalation:-1, repEffect:5, domEffect:2,
    effects:{ military:0, diplomatic:5, economic:8, cyber:0, information:1, domestic:2 }, counter:'dip_delay', scenario:null },
  { id:'eco_supply',   domain:'economic', name:'供应链重构', desc:'加速关键供应链自主化与多元化',
    cost:3, fundingCost:1000, risk:0.1, successBase:78, escalation:0, repEffect:-2, domEffect:5,
    effects:{ military:2, diplomatic:-2, economic:10, cyber:1, information:0, domestic:5 }, counter:'eco_blockade', scenario:null },
  { id:'eco_finance',  domain:'economic', name:'金融反制措施', desc:'启动金融反制，货币互换与结算体系调整',
    cost:2, fundingCost:300, risk:0.2, successBase:70, escalation:0, repEffect:-3, domEffect:3,
    effects:{ military:0, diplomatic:-3, economic:6, cyber:0, information:2, domestic:3 }, counter:'eco_retaliate', scenario:null },
  { id:'eco_aid',      domain:'economic', name:'经济援助与合作', desc:'向相关方提供经济援助，拉拢分化',
    cost:2, fundingCost:600, risk:0.1, successBase:76, escalation:-1, repEffect:8, domEffect:1,
    effects:{ military:0, diplomatic:8, economic:-3, cyber:0, information:3, domestic:1 }, counter:'dip_counter', scenario:null },

  /* === 网络域 通用 === */
  { id:'cyb_defend',   domain:'cyber', name:'网络防御加固', desc:'全面加固关键信息基础设施网络安全',
    cost:2, fundingCost:150, risk:0.05, successBase:88, escalation:0, repEffect:1, domEffect:3,
    effects:{ military:2, diplomatic:1, economic:2, cyber:12, information:1, domestic:3 }, counter:'cyb_attack', scenario:null },
  { id:'cyb_attack',   domain:'cyber', name:'网络反制攻击', desc:'对敌方网络目标实施精确反制攻击',
    cost:3, fundingCost:250, risk:0.4, successBase:55, escalation:2, repEffect:-5, domEffect:0,
    effects:{ military:3, diplomatic:-5, economic:-2, cyber:8, information:-3, domestic:0 }, counter:'cyb_defend', scenario:null },
  { id:'cyb_intel',    domain:'cyber', name:'网络情报搜集', desc:'加强网络情报搜集，掌握敌方动态',
    cost:2, fundingCost:100, risk:0.1, successBase:82, escalation:0, repEffect:0, domEffect:0,
    effects:{ military:3, diplomatic:0, economic:1, cyber:6, information:4, domestic:0 }, counter:'cyb_recon', scenario:null },
  { id:'cyb_attrib',   domain:'cyber', name:'攻击溯源与披露', desc:'公开网络攻击溯源结果，争取国际支持',
    cost:1, fundingCost:50, risk:0.15, successBase:74, escalation:0, repEffect:5, domEffect:4,
    effects:{ military:0, diplomatic:5, economic:1, cyber:3, information:8, domestic:4 }, counter:'inf_denial', scenario:null },

  /* === 外交域 通用 === */
  { id:'dip_negotiate',  domain:'diplomatic', name:'外交斡旋谈判', desc:'通过外交渠道与相关方直接谈判',
    cost:2, fundingCost:50, risk:0.1, successBase:78, escalation:-1, repEffect:8, domEffect:1,
    effects:{ military:0, diplomatic:12, economic:3, cyber:0, information:2, domestic:1 }, counter:'dip_delay', scenario:null },
  { id:'dip_multilateral',domain:'diplomatic', name:'多边外交协调', desc:'推动多边外交平台协商解决争端',
    cost:2, fundingCost:80, risk:0.15, successBase:72, escalation:-1, repEffect:7, domEffect:2,
    effects:{ military:0, diplomatic:10, economic:2, cyber:0, information:3, domestic:2 }, counter:'dip_divide', scenario:null },
  { id:'dip_alliance',   domain:'diplomatic', name:'联盟构建巩固', desc:'加强与战略伙伴的联盟关系',
    cost:3, fundingCost:200, risk:0.1, successBase:75, escalation:0, repEffect:6, domEffect:3,
    effects:{ military:5, diplomatic:8, economic:3, cyber:2, information:2, domestic:3 }, counter:'dip_counter', scenario:null },
  { id:'dip_statement',  domain:'diplomatic', name:'强硬外交表态', desc:'发表强硬外交声明，划定红线',
    cost:1, fundingCost:10, risk:0.2, successBase:68, escalation:1, repEffect:-3, domEffect:6,
    effects:{ military:3, diplomatic:-3, economic:-1, cyber:0, information:5, domestic:6 }, counter:'dip_protest', scenario:null },
  { id:'dip_summit',     domain:'diplomatic', name:'高级别峰会', desc:'推动元首/外长级会晤，寻求政治解决',
    cost:3, fundingCost:100, risk:0.2, successBase:65, escalation:-2, repEffect:10, domEffect:4,
    effects:{ military:0, diplomatic:15, economic:4, cyber:0, information:3, domestic:4 }, counter:'dip_delay', scenario:null },

  /* === 信息域 通用 === */
  { id:'inf_counter',  domain:'information', name:'舆论反击', desc:'对敌方虚假信息进行系统性反击',
    cost:2, fundingCost:80, risk:0.1, successBase:76, escalation:0, repEffect:3, domEffect:4,
    effects:{ military:0, diplomatic:3, economic:1, cyber:1, information:10, domestic:4 }, counter:'inf_escalate', scenario:null },
  { id:'inf_release',  domain:'information', name:'权威信息发布', desc:'发布权威信息，引导国内外舆论',
    cost:1, fundingCost:30, risk:0.05, successBase:84, escalation:0, repEffect:3, domEffect:5,
    effects:{ military:0, diplomatic:3, economic:1, cyber:0, information:7, domestic:5 }, counter:'inf_counter', scenario:null },
  { id:'inf_cognitive',domain:'information', name:'认知域作战', desc:'开展认知域作战行动，影响敌方决策',
    cost:3, fundingCost:200, risk:0.3, successBase:58, escalation:1, repEffect:-3, domEffect:-2,
    effects:{ military:3, diplomatic:-3, economic:0, cyber:2, information:8, domestic:-2 }, counter:'inf_defense', scenario:null },

  /* === 国内域 通用 === */
  { id:'dom_mobilize', domain:'domestic', name:'国防动员', desc:'启动局部国防动员，提升全民国防意识',
    cost:3, fundingCost:300, risk:0.15, successBase:78, escalation:1, repEffect:-2, domEffect:8,
    effects:{ military:8, diplomatic:-2, economic:-3, cyber:1, information:3, domestic:10 }, counter:'inf_fear', scenario:null },
  { id:'dom_economy',  domain:'domestic', name:'经济调控措施', desc:'实施经济调控，保障民生与市场稳定',
    cost:2, fundingCost:500, risk:0.05, successBase:85, escalation:0, repEffect:1, domEffect:7,
    effects:{ military:0, diplomatic:1, economic:8, cyber:0, information:2, domestic:7 }, counter:'eco_pressure', scenario:null },
  { id:'dom_unity',    domain:'domestic', name:'民意引导团结', desc:'加强民意引导，凝聚社会共识',
    cost:1, fundingCost:20, risk:0.05, successBase:88, escalation:0, repEffect:2, domEffect:8,
    effects:{ military:1, diplomatic:2, economic:1, cyber:0, information:5, domestic:8 }, counter:'inf_divide', scenario:null },

  /* ================================================================
   * 场景专属行动
   * ================================================================ */

  /* --- 台海场景专属 --- */
  { id:'ts_blockade',   domain:'military', name:'封锁台湾海峡', desc:'海空力量对台海实施封锁，切断外部军事援助通道',
    cost:5, fundingCost:1200, risk:0.5, successBase:50, escalation:3, repEffect:-12, domEffect:8,
    effects:{ military:18, diplomatic:-12, economic:-8, cyber:0, information:5, domestic:10 }, counter:'mil_escalate', scenario:'taiwan_strait' },
  { id:'ts_amphibious', domain:'military', name:'两栖威慑演习', desc:'在东南沿海举行大规模两栖登陆演习',
    cost:3, fundingCost:600, risk:0.25, successBase:68, escalation:2, repEffect:-5, domEffect:6,
    effects:{ military:12, diplomatic:-6, economic:-3, cyber:0, information:4, domestic:6 }, counter:'mil_match', scenario:'taiwan_strait' },
  { id:'ts_missile_deter',domain:'military', name:'导弹威慑部署', desc:'火箭军前推部署，东风系列导弹进入战备',
    cost:3, fundingCost:400, risk:0.2, successBase:72, escalation:2, repEffect:-7, domEffect:7,
    effects:{ military:14, diplomatic:-8, economic:-2, cyber:0, information:3, domestic:7 }, counter:'mil_escalate', scenario:'taiwan_strait' },

  /* --- 南海场景专属 --- */
  { id:'scs_island',  domain:'military', name:'岛礁建设加固', desc:'加速南海岛礁防御设施建设，提升前沿支撑能力',
    cost:3, fundingCost:700, risk:0.15, successBase:75, escalation:1, repEffect:-4, domEffect:5,
    effects:{ military:10, diplomatic:-4, economic:2, cyber:0, information:2, domestic:5 }, counter:'dip_protest', scenario:'south_china_sea' },
  { id:'scs_patrol',  domain:'military', name:'海上巡航执法', desc:'海警海军联合巡航，维护争议海域主权',
    cost:2, fundingCost:300, risk:0.2, successBase:70, escalation:1, repEffect:-3, domEffect:4,
    effects:{ military:7, diplomatic:-3, economic:1, cyber:0, information:3, domestic:4 }, counter:'mil_match', scenario:'south_china_sea' },
  { id:'scs_drill',   domain:'military', name:'海上联合演训', desc:'在南海举行海空联合实弹演训',
    cost:3, fundingCost:500, risk:0.2, successBase:68, escalation:2, repEffect:-4, domEffect:5,
    effects:{ military:10, diplomatic:-5, economic:-2, cyber:0, information:4, domestic:5 }, counter:'mil_escalate', scenario:'south_china_sea' },

  /* --- 中印边境专属 --- */
  { id:'bd_reinforce',domain:'military', name:'边境增兵对峙', desc:'向边境争议地区增派兵力，形成对峙优势',
    cost:3, fundingCost:400, risk:0.25, successBase:65, escalation:2, repEffect:-4, domEffect:5,
    effects:{ military:10, diplomatic:-4, economic:-2, cyber:0, information:2, domestic:5 }, counter:'mil_match', scenario:'border_india' },
  { id:'bd_disengage',domain:'diplomatic', name:'脱离接触谈判', desc:'通过军长级会谈推动双方脱离接触',
    cost:2, fundingCost:30, risk:0.15, successBase:72, escalation:-1, repEffect:6, domEffect:3,
    effects:{ military:-2, diplomatic:8, economic:2, cyber:0, information:2, domestic:3 }, counter:'dip_delay', scenario:'border_india' },
  { id:'bd_infra',    domain:'domestic', name:'边境基建加速', desc:'加速边境地区交通和军事基础设施建设',
    cost:3, fundingCost:600, risk:0.1, successBase:80, escalation:0, repEffect:-2, domEffect:6,
    effects:{ military:6, diplomatic:-2, economic:3, cyber:0, information:2, domestic:6 }, counter:'eco_pressure', scenario:'border_india' },

  /* --- 经济制裁专属 --- */
  { id:'eco_tech',    domain:'economic', name:'科技自立攻关', desc:'启动关键核心技术攻关计划，突破封锁',
    cost:4, fundingCost:2000, risk:0.1, successBase:75, escalation:0, repEffect:3, domEffect:8,
    effects:{ military:2, diplomatic:2, economic:12, cyber:2, information:3, domestic:8 }, counter:'eco_blockade', scenario:'eco_sanctions' },
  { id:'eco_rmb',     domain:'economic', name:'人民币国际化推进', desc:'加速人民币跨境结算与国际储备货币建设',
    cost:3, fundingCost:800, risk:0.15, successBase:70, escalation:0, repEffect:5, domEffect:4,
    effects:{ military:0, diplomatic:6, economic:10, cyber:0, information:2, domestic:4 }, counter:'eco_retaliate', scenario:'eco_sanctions' },
  { id:'eco_swap',    domain:'economic', name:'货币互换网络', desc:'与多国签署本币互换协议，绕开美元体系',
    cost:2, fundingCost:300, risk:0.1, successBase:76, escalation:0, repEffect:6, domEffect:3,
    effects:{ military:0, diplomatic:7, economic:8, cyber:0, information:2, domestic:3 }, counter:'dip_counter', scenario:'eco_sanctions' },

  /* --- 网络攻防专属 --- */
  { id:'cyb_strikeback',domain:'cyber', name:'网络反击预案', desc:'启动国家级网络反击预案，对敌实施对等反制',
    cost:4, fundingCost:200, risk:0.45, successBase:52, escalation:2, repEffect:-4, domEffect:2,
    effects:{ military:4, diplomatic:-4, economic:-2, cyber:14, information:-2, domestic:2 }, counter:'cyb_attack', scenario:'cyber_attack' },
  { id:'cyb_mobilize', domain:'cyber', name:'网络空间动员', desc:'动员民间网络安全力量参与防御',
    cost:2, fundingCost:100, risk:0.1, successBase:80, escalation:0, repEffect:2, domEffect:5,
    effects:{ military:1, diplomatic:1, economic:1, cyber:8, information:2, domestic:5 }, counter:'cyb_recon', scenario:'cyber_attack' },
  { id:'cyb_decoy',    domain:'cyber', name:'蜜罐诱捕部署', desc:'部署诱饵系统诱捕攻击者，获取攻击指纹',
    cost:2, fundingCost:80, risk:0.05, successBase:86, escalation:0, repEffect:3, domEffect:2,
    effects:{ military:1, diplomatic:2, economic:1, cyber:7, information:5, domestic:2 }, counter:'cyb_recon', scenario:'cyber_attack' },

  /* --- 混合战争专属 --- */
  { id:'hw_counterintel',domain:'cyber', name:'反间谍专项行动', desc:'对敌方情报网络实施反渗透打击',
    cost:3, fundingCost:150, risk:0.2, successBase:68, escalation:1, repEffect:2, domEffect:4,
    effects:{ military:3, diplomatic:2, economic:1, cyber:8, information:5, domestic:4 }, counter:'cyb_attack', scenario:'hybrid_warfare' },
  { id:'hw_resilience', domain:'domestic', name:'社会韧性建设', desc:'加强关键基础设施和社会抗冲击能力',
    cost:3, fundingCost:500, risk:0.05, successBase:82, escalation:0, repEffect:3, domEffect:8,
    effects:{ military:2, diplomatic:2, economic:3, cyber:3, information:3, domestic:9 }, counter:'inf_divide', scenario:'hybrid_warfare' },
  { id:'hw_attribution',domain:'information', name:'混合威胁归因', desc:'综合多源情报对混合威胁进行公开归因',
    cost:2, fundingCost:60, risk:0.15, successBase:74, escalation:0, repEffect:6, domEffect:3,
    effects:{ military:1, diplomatic:6, economic:1, cyber:3, information:8, domestic:3 }, counter:'inf_denial', scenario:'hybrid_warfare' },

  /* --- 中东专属 --- */
  { id:'me_evacuate', domain:'military', name:'侨民撤离行动', desc:'组织在中东中国侨民安全撤离',
    cost:3, fundingCost:300, risk:0.2, successBase:72, escalation:0, repEffect:4, domEffect:6,
    effects:{ military:5, diplomatic:4, economic:-2, cyber:0, information:3, domestic:6 }, counter:'dip_protest', scenario:'middle_east' },
  { id:'me_energy',   domain:'economic', name:'能源储备补充', desc:'动用战略石油储备，保障能源供应稳定',
    cost:2, fundingCost:800, risk:0.1, successBase:80, escalation:0, repEffect:2, domEffect:5,
    effects:{ military:1, diplomatic:2, economic:8, cyber:0, information:1, domestic:5 }, counter:'eco_pressure', scenario:'middle_east' },
  { id:'me_mediate',  domain:'diplomatic', name:'中东斡旋调停', desc:'发挥建设性作用，推动冲突各方停火谈判',
    cost:3, fundingCost:100, risk:0.2, successBase:68, escalation:-1, repEffect:10, domEffect:3,
    effects:{ military:0, diplomatic:12, economic:3, cyber:0, information:4, domestic:3 }, counter:'dip_delay', scenario:'middle_east' },

  /* --- 霍尔木兹专属 --- */
  { id:'hz_convoy',    domain:'military', name:'护航编队部署', desc:'海军编队赴霍尔木兹海峡执行护航任务',
    cost:4, fundingCost:600, risk:0.25, successBase:62, escalation:1, repEffect:-3, domEffect:4,
    effects:{ military:10, diplomatic:-3, economic:5, cyber:0, information:2, domestic:4 }, counter:'mil_match', scenario:'hormuz' },
  { id:'hz_alternative',domain:'economic', name:'替代能源通道', desc:'建设中亚陆上能源管道，降低海峡依赖',
    cost:4, fundingCost:1500, risk:0.1, successBase:75, escalation:0, repEffect:3, domEffect:6,
    effects:{ military:2, diplomatic:3, economic:10, cyber:1, information:1, domestic:6 }, counter:'eco_blockade', scenario:'hormuz' },
  { id:'hz_naval',     domain:'diplomatic', name:'多国海军协调', desc:'与海湾国家协调海上安全合作机制',
    cost:2, fundingCost:80, risk:0.15, successBase:72, escalation:-1, repEffect:7, domEffect:3,
    effects:{ military:4, diplomatic:8, economic:3, cyber:0, information:2, domestic:3 }, counter:'dip_counter', scenario:'hormuz' },

  /* --- 印太专属 --- */
  { id:'ip_breakthrough',domain:'diplomatic', name:'战略突围外交', desc:'突破印太包围圈，拓展南太岛国外交',
    cost:3, fundingCost:200, risk:0.15, successBase:70, escalation:0, repEffect:8, domEffect:4,
    effects:{ military:2, diplomatic:10, economic:3, cyber:0, information:3, domestic:4 }, counter:'dip_divide', scenario:'indo_pacific' },
  { id:'ip_rcep',       domain:'economic', name:'RCEP深化利用', desc:'充分利用RCEP框架深化区域经济一体化',
    cost:2, fundingCost:100, risk:0.1, successBase:78, escalation:-1, repEffect:5, domEffect:3,
    effects:{ military:0, diplomatic:5, economic:10, cyber:0, information:2, domestic:3 }, counter:'eco_retaliate', scenario:'indo_pacific' },
  { id:'ip_split',      domain:'diplomatic', name:'分化对方联盟', desc:'利用利益差异分化奥库斯联盟/四方安全对话内部',
    cost:3, fundingCost:150, risk:0.25, successBase:60, escalation:0, repEffect:-2, domEffect:3,
    effects:{ military:0, diplomatic:6, economic:2, cyber:1, information:5, domestic:3 }, counter:'dip_counter', scenario:'indo_pacific' },

  /* --- 稀土专属 --- */
  { id:'re_stockpile',  domain:'economic', name:'稀土战略储备', desc:'建立稀土战略储备体系，增强定价权',
    cost:3, fundingCost:600, risk:0.1, successBase:80, escalation:0, repEffect:2, domEffect:4,
    effects:{ military:1, diplomatic:2, economic:10, cyber:0, information:1, domestic:4 }, counter:'eco_pressure', scenario:'rare_earth' },
  { id:'re_downstream',  domain:'economic', name:'下游产业升级', desc:'推动稀土深加工产业链升级',
    cost:4, fundingCost:1000, risk:0.1, successBase:76, escalation:0, repEffect:3, domEffect:5,
    effects:{ military:1, diplomatic:3, economic:12, cyber:1, information:2, domestic:5 }, counter:'eco_blockade', scenario:'rare_earth' },
  { id:'re_partner',    domain:'diplomatic', name:'资源外交合作', desc:'与资源国建立长期稳定供应合作关系',
    cost:2, fundingCost:200, risk:0.1, successBase:78, escalation:-1, repEffect:7, domEffect:2,
    effects:{ military:0, diplomatic:8, economic:5, cyber:0, information:2, domestic:2 }, counter:'dip_counter', scenario:'rare_earth' },

  /* --- 太空专属 --- */
  { id:'sp_asat',        domain:'military', name:'反卫星威慑', desc:'展示反卫星能力，形成太空威慑',
    cost:4, fundingCost:500, risk:0.35, successBase:55, escalation:2, repEffect:-8, domEffect:3,
    effects:{ military:8, diplomatic:-8, economic:-2, cyber:3, information:2, domestic:3 }, counter:'mil_escalate', scenario:'space_domain' },
  { id:'sp_constellation',domain:'cyber', name:'星座加速组网', desc:'加速自主卫星星座建设，提升太空能力',
    cost:4, fundingCost:800, risk:0.1, successBase:78, escalation:0, repEffect:3, domEffect:5,
    effects:{ military:4, diplomatic:3, economic:3, cyber:5, information:3, domestic:5 }, counter:'eco_blockade', scenario:'space_domain' },
  { id:'sp_debris',      domain:'cyber', name:'空间碎片管控', desc:'推动空间碎片减缓与太空交通管理国际规则',
    cost:2, fundingCost:100, risk:0.1, successBase:76, escalation:-1, repEffect:7, domEffect:2,
    effects:{ military:1, diplomatic:8, economic:2, cyber:3, information:3, domestic:2 }, counter:'dip_delay', scenario:'space_domain' },

  /* --- AI竞赛专属 --- */
  { id:'ai_chip',     domain:'economic', name:'芯片国产替代', desc:'加速国产半导体产业链建设，突破芯片封锁',
    cost:4, fundingCost:2500, risk:0.15, successBase:70, escalation:0, repEffect:4, domEffect:8,
    effects:{ military:3, diplomatic:3, economic:12, cyber:3, information:2, domestic:8 }, counter:'eco_blockade', scenario:'ai_race' },
  { id:'ai_talent',   domain:'domestic', name:'人才引进计划', desc:'全球引进AI顶尖人才，建设科研高地',
    cost:2, fundingCost:500, risk:0.05, successBase:82, escalation:0, repEffect:3, domEffect:6,
    effects:{ military:1, diplomatic:3, economic:5, cyber:3, information:2, domestic:6 }, counter:'inf_divide', scenario:'ai_race' },
  { id:'ai_military', domain:'cyber', name:'AI军事化应用', desc:'加速AI在军事领域的应用部署',
    cost:4, fundingCost:600, risk:0.2, successBase:65, escalation:1, repEffect:-4, domEffect:4,
    effects:{ military:8, diplomatic:-4, economic:2, cyber:5, information:2, domestic:4 }, counter:'cyb_attack', scenario:'ai_race' },

  /* --- 金融战专属 --- */
  { id:'fw_cips',     domain:'economic', name:'人民币跨境支付系统扩容', desc:'跨境支付系统扩容推广，替代环球银行金融电信系统依赖',
    cost:3, fundingCost:1000, risk:0.1, successBase:78, escalation:0, repEffect:6, domEffect:5,
    effects:{ military:0, diplomatic:7, economic:12, cyber:2, information:2, domestic:5 }, counter:'eco_retaliate', scenario:'finance_war' },
  { id:'fw_gold',     domain:'economic', name:'黄金储备增持', desc:'大幅增持黄金储备，增强货币信用底气',
    cost:3, fundingCost:2000, risk:0.05, successBase:85, escalation:0, repEffect:2, domEffect:4,
    effects:{ military:0, diplomatic:2, economic:10, cyber:0, information:1, domestic:4 }, counter:'eco_pressure', scenario:'finance_war' },
  { id:'fw_bilateral',domain:'diplomatic', name:'双边本币结算', desc:'与贸易伙伴推动双边本币直接结算',
    cost:2, fundingCost:200, risk:0.1, successBase:76, escalation:0, repEffect:7, domEffect:3,
    effects:{ military:0, diplomatic:8, economic:8, cyber:0, information:2, domestic:3 }, counter:'dip_counter', scenario:'finance_war' },

  /* --- 北极专属 --- */
  { id:'ac_research',  domain:'diplomatic', name:'极地科考部署', desc:'加强北极科考站建设，提升极地存在',
    cost:3, fundingCost:400, risk:0.1, successBase:78, escalation:0, repEffect:5, domEffect:3,
    effects:{ military:2, diplomatic:6, economic:3, cyber:1, information:2, domestic:3 }, counter:'dip_protest', scenario:'arctic' },
  { id:'ac_route',     domain:'economic', name:'北方航道开发', desc:'开发北方海航道，建设沿线港口设施',
    cost:4, fundingCost:800, risk:0.15, successBase:72, escalation:0, repEffect:4, domEffect:4,
    effects:{ military:2, diplomatic:4, economic:10, cyber:1, information:2, domestic:4 }, counter:'eco_blockade', scenario:'arctic' },
  { id:'ac_icebreaker',domain:'military', name:'破冰船队建设', desc:'建造核动力破冰船，保障极地航行能力',
    cost:3, fundingCost:600, risk:0.1, successBase:80, escalation:0, repEffect:3, domEffect:4,
    effects:{ military:6, diplomatic:3, economic:4, cyber:1, information:2, domestic:4 }, counter:'mil_match', scenario:'arctic' },

  /* --- 数字主权专属 --- */
  { id:'ds_data',     domain:'cyber', name:'数据主权立法', desc:'完善数据跨境流动法律法规体系',
    cost:2, fundingCost:50, risk:0.05, successBase:85, escalation:0, repEffect:4, domEffect:5,
    effects:{ military:0, diplomatic:4, economic:3, cyber:8, information:3, domestic:5 }, counter:'dip_protest', scenario:'digital_sovereignty' },
  { id:'ds_platform', domain:'cyber', name:'自主平台建设', desc:'建设自主可控的数字基础设施平台',
    cost:3, fundingCost:800, risk:0.1, successBase:76, escalation:0, repEffect:3, domEffect:6,
    effects:{ military:1, diplomatic:3, economic:6, cyber:8, information:2, domestic:6 }, counter:'eco_blockade', scenario:'digital_sovereignty' },
  { id:'ds_standard', domain:'diplomatic', name:'数字规则制定', desc:'推动国际数字治理规则制定参与',
    cost:2, fundingCost:80, risk:0.15, successBase:72, escalation:-1, repEffect:8, domEffect:3,
    effects:{ military:0, diplomatic:9, economic:3, cyber:3, information:3, domestic:3 }, counter:'dip_divide', scenario:'digital_sovereignty' },

  /* ================================================================
   * 新增场景专属行动 (16-30)
   * ================================================================ */

  /* --- 钓鱼岛专属 --- */
  { id:'dy_patrol', domain:'military', name:'海空联合巡航', desc:'海警海军空军联合赴钓鱼岛海域巡航维权',
    cost:3, fundingCost:500, risk:0.2, successBase:68, escalation:1, repEffect:-4, domEffect:6,
    effects:{ military:10, diplomatic:-4, economic:-1, cyber:0, information:4, domestic:6 }, counter:'mil_match', scenario:'diaoyu' },
  { id:'dy_law', domain:'diplomatic', name:'执法维权行动', desc:'依法在钓鱼岛海域开展执法维权，宣示主权',
    cost:2, fundingCost:150, risk:0.15, successBase:75, escalation:0, repEffect:3, domEffect:5,
    effects:{ military:4, diplomatic:6, economic:1, cyber:0, information:5, domestic:5 }, counter:'dip_protest', scenario:'diaoyu' },
  { id:'dy_drill', domain:'military', name:'东海联合军演', desc:'在东海方向举行大规模海空联合演习',
    cost:3, fundingCost:600, risk:0.2, successBase:70, escalation:2, repEffect:-5, domEffect:5,
    effects:{ military:11, diplomatic:-5, economic:-2, cyber:0, information:4, domestic:5 }, counter:'mil_escalate', scenario:'diaoyu' },

  /* --- 朝鲜半岛专属 --- */
  { id:'kp_mediate', domain:'diplomatic', name:'六方会谈斡旋', desc:'推动重启六方会谈，外交解决核问题',
    cost:3, fundingCost:100, risk:0.2, successBase:65, escalation:-2, repEffect:10, domEffect:3,
    effects:{ military:0, diplomatic:13, economic:2, cyber:0, information:3, domestic:3 }, counter:'dip_delay', scenario:'korean_peninsula' },
  { id:'kp_sanction', domain:'economic', name:'安理会制裁决议', desc:'推动安理会通过制裁决议约束朝核发展',
    cost:2, fundingCost:200, risk:0.25, successBase:62, escalation:1, repEffect:4, domEffect:2,
    effects:{ military:2, diplomatic:6, economic:-2, cyber:0, information:2, domestic:2 }, counter:'eco_retaliate', scenario:'korean_peninsula' },
  { id:'kp_prepare', domain:'military', name:'边境战备加固', desc:'加强中朝边境军事部署和应急准备',
    cost:3, fundingCost:400, risk:0.1, successBase:80, escalation:1, repEffect:-2, domEffect:6,
    effects:{ military:8, diplomatic:-2, economic:-1, cyber:1, information:2, domestic:6 }, counter:'mil_match', scenario:'korean_peninsula' },

  /* --- 缅甸专属 --- */
  { id:'mm_border', domain:'military', name:'边境安全管控', desc:'强化中缅边境安全管控，防止冲突外溢',
    cost:2, fundingCost:200, risk:0.1, successBase:82, escalation:0, repEffect:2, domEffect:5,
    effects:{ military:7, diplomatic:2, economic:1, cyber:1, information:2, domestic:5 }, counter:'mil_match', scenario:'myanmar' },
  { id:'mm_mediate', domain:'diplomatic', name:'东盟框架斡旋', desc:'通过东盟框架推动缅甸和平对话',
    cost:3, fundingCost:80, risk:0.2, successBase:68, escalation:-1, repEffect:8, domEffect:3,
    effects:{ military:0, diplomatic:11, economic:2, cyber:0, information:3, domestic:3 }, counter:'dip_delay', scenario:'myanmar' },
  { id:'mm_humanitarian', domain:'domestic', name:'人道主义援助', desc:'向缅甸边境提供人道主义援助',
    cost:2, fundingCost:300, risk:0.05, successBase:84, escalation:-1, repEffect:7, domEffect:4,
    effects:{ military:1, diplomatic:8, economic:-2, cyber:0, information:4, domestic:4 }, counter:'dip_counter', scenario:'myanmar' },

  /* --- 阿富汗专属 --- */
  { id:'af_recon', domain:'economic', name:'阿富汗重建参与', desc:'参与阿富汗经济重建，稳定局势',
    cost:3, fundingCost:500, risk:0.15, successBase:72, escalation:-1, repEffect:8, domEffect:3,
    effects:{ military:1, diplomatic:9, economic:5, cyber:0, information:3, domestic:3 }, counter:'eco_pressure', scenario:'afghanistan' },
  { id:'af_terror', domain:'military', name:'反恐安全合作', desc:'与上合组织开展反恐情报合作和联合行动',
    cost:3, fundingCost:200, risk:0.2, successBase:70, escalation:1, repEffect:3, domEffect:5,
    effects:{ military:8, diplomatic:5, economic:1, cyber:3, information:2, domestic:5 }, counter:'mil_match', scenario:'afghanistan' },
  { id:'af_neighbor', domain:'diplomatic', name:'周边外交协调', desc:'与巴基斯坦和中亚国家协调阿富汗政策',
    cost:2, fundingCost:60, risk:0.1, successBase:78, escalation:-1, repEffect:6, domEffect:3,
    effects:{ military:2, diplomatic:9, economic:3, cyber:0, information:2, domestic:3 }, counter:'dip_counter', scenario:'afghanistan' },

  /* --- 非洲之角专属 --- */
  { id:'ha_base', domain:'military', name:'保障基地扩建', desc:'扩建吉布提保障基地设施，提升远洋保障能力',
    cost:3, fundingCost:600, risk:0.1, successBase:78, escalation:0, repEffect:2, domEffect:4,
    effects:{ military:8, diplomatic:3, economic:3, cyber:1, information:2, domestic:4 }, counter:'dip_protest', scenario:'horn_africa' },
  { id:'ha_mediate', domain:'diplomatic', name:'地区冲突调停', desc:'调停非洲之角地区国家间冲突',
    cost:3, fundingCost:100, risk:0.2, successBase:68, escalation:-1, repEffect:9, domEffect:3,
    effects:{ military:0, diplomatic:12, economic:2, cyber:0, information:3, domestic:3 }, counter:'dip_delay', scenario:'horn_africa' },
  { id:'ha_aid', domain:'economic', name:'发展援助计划', desc:'向非洲之角国家提供发展援助和基础设施投资',
    cost:3, fundingCost:800, risk:0.1, successBase:76, escalation:-1, repEffect:8, domEffect:4,
    effects:{ military:1, diplomatic:10, economic:5, cyber:0, information:3, domestic:4 }, counter:'dip_counter', scenario:'horn_africa' },

  /* --- 委内瑞拉专属 --- */
  { id:'vz_diplomatic', domain:'diplomatic', name:'外交声援支持', desc:'在国际舞台声援委内瑞拉合法政府',
    cost:2, fundingCost:50, risk:0.15, successBase:74, escalation:0, repEffect:5, domEffect:3,
    effects:{ military:0, diplomatic:8, economic:1, cyber:0, information:3, domestic:3 }, counter:'dip_protest', scenario:'venezuela' },
  { id:'vz_energy', domain:'economic', name:'能源合作深化', desc:'深化与委内瑞拉能源合作，保障原油供应',
    cost:3, fundingCost:500, risk:0.15, successBase:72, escalation:0, repEffect:3, domEffect:4,
    effects:{ military:1, diplomatic:5, economic:9, cyber:0, information:2, domestic:4 }, counter:'eco_pressure', scenario:'venezuela' },
  { id:'vz_cooperation', domain:'diplomatic', name:'拉美多边合作', desc:'推动与拉美国家多边合作机制建设',
    cost:2, fundingCost:200, risk:0.1, successBase:76, escalation:-1, repEffect:7, domEffect:3,
    effects:{ military:0, diplomatic:9, economic:4, cyber:0, information:2, domestic:3 }, counter:'dip_divide', scenario:'venezuela' },

  /* --- 生物安全专属 --- */
  { id:'bs_response', domain:'domestic', name:'应急响应启动', desc:'启动国家级生物安全应急响应机制',
    cost:4, fundingCost:1000, risk:0.15, successBase:72, escalation:1, repEffect:3, domEffect:8,
    effects:{ military:3, diplomatic:3, economic:5, cyber:2, information:5, domestic:10 }, counter:'inf_fear', scenario:'biosecurity' },
  { id:'bs_trace', domain:'cyber', name:'溯源调查行动', desc:'对生物安全事件进行国际溯源调查',
    cost:3, fundingCost:300, risk:0.25, successBase:60, escalation:1, repEffect:5, domEffect:4,
    effects:{ military:1, diplomatic:6, economic:1, cyber:8, information:7, domestic:4 }, counter:'inf_denial', scenario:'biosecurity' },
  { id:'bs_vaccine', domain:'economic', name:'疫苗药物研发', desc:'加速疫苗和治疗药物研发生产',
    cost:4, fundingCost:1500, risk:0.1, successBase:75, escalation:0, repEffect:8, domEffect:7,
    effects:{ military:1, diplomatic:8, economic:8, cyber:2, information:4, domestic:7 }, counter:'eco_blockade', scenario:'biosecurity' },

  /* --- 核扩散专属 --- */
  { id:'np_nonpro', domain:'diplomatic', name:'不扩散外交推进', desc:'推动核不扩散条约审议和国际核裁军进程',
    cost:3, fundingCost:100, risk:0.15, successBase:72, escalation:-1, repEffect:9, domEffect:4,
    effects:{ military:0, diplomatic:12, economic:2, cyber:0, information:3, domestic:4 }, counter:'dip_delay', scenario:'nuclear_prolif' },
  { id:'np_deter', domain:'military', name:'核威慑力量升级', desc:'升级核威慑力量，确保第二次打击能力',
    cost:4, fundingCost:800, risk:0.2, successBase:70, escalation:2, repEffect:-6, domEffect:5,
    effects:{ military:12, diplomatic:-6, economic:-3, cyber:1, information:2, domestic:5 }, counter:'mil_escalate', scenario:'nuclear_prolif' },
  { id:'np_arms', domain:'diplomatic', name:'军控谈判参与', desc:'参与大国军控谈判，维护战略稳定',
    cost:3, fundingCost:80, risk:0.2, successBase:65, escalation:-1, repEffect:7, domEffect:3,
    effects:{ military:2, diplomatic:10, economic:2, cyber:0, information:3, domestic:3 }, counter:'dip_counter', scenario:'nuclear_prolif' },

  /* --- 深海专属 --- */
  { id:'ds_explore', domain:'economic', name:'深海资源勘探', desc:'加强深海矿产资源勘探和开采技术',
    cost:4, fundingCost:1000, risk:0.1, successBase:75, escalation:0, repEffect:3, domEffect:4,
    effects:{ military:2, diplomatic:3, economic:10, cyber:2, information:2, domestic:4 }, counter:'eco_blockade', scenario:'deep_sea' },
  { id:'ds_monitor', domain:'cyber', name:'海底监测网络', desc:'建设深海监测网络，监控海底军事活动',
    cost:3, fundingCost:600, risk:0.15, successBase:72, escalation:0, repEffect:2, domEffect:4,
    effects:{ military:5, diplomatic:2, economic:2, cyber:10, information:3, domestic:4 }, counter:'cyb_recon', scenario:'deep_sea' },
  { id:'ds_protect', domain:'military', name:'海底电缆保护', desc:'加强海底电缆和管道安全保护',
    cost:3, fundingCost:400, risk:0.1, successBase:80, escalation:0, repEffect:4, domEffect:5,
    effects:{ military:6, diplomatic:3, economic:4, cyber:3, information:2, domestic:5 }, counter:'cyb_attack', scenario:'deep_sea' },

  /* --- 气候安全专属 --- */
  { id:'cs_carbon', domain:'economic', name:'双碳目标推进', desc:'加速推进碳达峰碳中和目标实现',
    cost:4, fundingCost:2000, risk:0.1, successBase:76, escalation:0, repEffect:6, domEffect:5,
    effects:{ military:0, diplomatic:6, economic:10, cyber:1, information:3, domestic:5 }, counter:'eco_pressure', scenario:'climate_security' },
  { id:'cs_energy', domain:'economic', name:'新能源体系构建', desc:'构建新能源体系，降低化石能源依赖',
    cost:4, fundingCost:1500, risk:0.1, successBase:78, escalation:0, repEffect:5, domEffect:6,
    effects:{ military:1, diplomatic:4, economic:12, cyber:2, information:2, domestic:6 }, counter:'eco_blockade', scenario:'climate_security' },
  { id:'cs_cooperation', domain:'diplomatic', name:'气候外交合作', desc:'推动国际气候合作，维护发展权',
    cost:2, fundingCost:100, risk:0.1, successBase:76, escalation:-1, repEffect:8, domEffect:3,
    effects:{ military:0, diplomatic:10, economic:3, cyber:0, information:3, domestic:3 }, counter:'dip_divide', scenario:'climate_security' },

  /* --- 粮食安全专属 --- */
  { id:'fs_reserve', domain:'economic', name:'战略粮食储备', desc:'充实国家战略粮食储备体系',
    cost:3, fundingCost:600, risk:0.05, successBase:85, escalation:0, repEffect:3, domEffect:6,
    effects:{ military:0, diplomatic:2, economic:9, cyber:0, information:1, domestic:6 }, counter:'eco_pressure', scenario:'food_security' },
  { id:'fs_tech', domain:'economic', name:'种业科技攻关', desc:'突破种业核心技术，实现种业自主可控',
    cost:4, fundingCost:1000, risk:0.1, successBase:72, escalation:0, repEffect:4, domEffect:7,
    effects:{ military:1, diplomatic:3, economic:11, cyber:2, information:2, domestic:7 }, counter:'eco_blockade', scenario:'food_security' },
  { id:'fs_diversify', domain:'diplomatic', name:'进口渠道多元化', desc:'拓展粮食进口来源，降低单一依赖',
    cost:2, fundingCost:300, risk:0.1, successBase:78, escalation:0, repEffect:5, domEffect:4,
    effects:{ military:0, diplomatic:7, economic:7, cyber:0, information:2, domestic:4 }, counter:'dip_counter', scenario:'food_security' },

  /* --- 供应链专属 --- */
  { id:'sc_reshore', domain:'economic', name:'关键产业回流', desc:'推动关键产业链本土化和内迁',
    cost:4, fundingCost:1500, risk:0.1, successBase:74, escalation:0, repEffect:2, domEffect:7,
    effects:{ military:2, diplomatic:2, economic:12, cyber:1, information:2, domestic:7 }, counter:'eco_blockade', scenario:'supply_chain' },
  { id:'sc_diversify', domain:'economic', name:'供应渠道多元化', desc:'拓展多元化供应渠道，降低单一来源风险',
    cost:3, fundingCost:800, risk:0.1, successBase:78, escalation:0, repEffect:3, domEffect:5,
    effects:{ military:1, diplomatic:4, economic:10, cyber:1, information:2, domestic:5 }, counter:'eco_pressure', scenario:'supply_chain' },
  { id:'sc_stockpile', domain:'domestic', name:'关键物资储备', desc:'建立关键零部件和原材料战略储备',
    cost:3, fundingCost:600, risk:0.05, successBase:82, escalation:0, repEffect:2, domEffect:6,
    effects:{ military:2, diplomatic:2, economic:8, cyber:1, information:2, domestic:6 }, counter:'eco_pressure', scenario:'supply_chain' },

  /* --- 认知域作战专属 --- */
  { id:'cw_counter', domain:'information', name:'认知防御反击', desc:'对敌方认知域攻击进行系统性防御反击',
    cost:3, fundingCost:200, risk:0.2, successBase:68, escalation:1, repEffect:4, domEffect:5,
    effects:{ military:2, diplomatic:4, economic:1, cyber:3, information:12, domestic:5 }, counter:'inf_escalate', scenario:'cognitive_war' },
  { id:'cw_narrative', domain:'information', name:'国际叙事构建', desc:'构建和传播中国正面国际叙事',
    cost:3, fundingCost:150, risk:0.15, successBase:72, escalation:0, repEffect:7, domEffect:4,
    effects:{ military:0, diplomatic:7, economic:2, cyber:1, information:10, domestic:4 }, counter:'inf_counter', scenario:'cognitive_war' },
  { id:'cw_platform', domain:'cyber', name:'自主平台建设', desc:'建设自主可控的国际传播平台',
    cost:4, fundingCost:800, risk:0.1, successBase:74, escalation:0, repEffect:5, domEffect:6,
    effects:{ military:1, diplomatic:5, economic:5, cyber:8, information:8, domestic:6 }, counter:'eco_blockade', scenario:'cognitive_war' },

  /* --- 北约东扩专属 --- */
  { id:'ne_counter', domain:'diplomatic', name:'战略反制外交', desc:'通过外交手段反制北约东扩和亚太介入',
    cost:3, fundingCost:150, risk:0.2, successBase:68, escalation:0, repEffect:6, domEffect:4,
    effects:{ military:2, diplomatic:10, economic:2, cyber:1, information:3, domestic:4 }, counter:'dip_counter', scenario:'nato_expansion' },
  { id:'ne_partner', domain:'diplomatic', name:'伙伴关系网络', desc:'深化全球伙伴关系网络建设',
    cost:3, fundingCost:200, risk:0.1, successBase:76, escalation:-1, repEffect:8, domEffect:3,
    effects:{ military:1, diplomatic:11, economic:3, cyber:0, information:2, domestic:3 }, counter:'dip_divide', scenario:'nato_expansion' },
  { id:'ne_shanghai', domain:'diplomatic', name:'上合组织强化', desc:'强化上合组织安全合作和扩员进程',
    cost:3, fundingCost:150, risk:0.15, successBase:74, escalation:0, repEffect:7, domEffect:4,
    effects:{ military:3, diplomatic:9, economic:3, cyber:2, information:3, domestic:4 }, counter:'dip_counter', scenario:'nato_expansion' },

  /* --- 东海专属 --- */
  { id:'ecs_adiz', domain:'military', name:'防空识别区执法', desc:'严格执行东海防空识别区管控规则',
    cost:2, fundingCost:200, risk:0.15, successBase:76, escalation:1, repEffect:-3, domEffect:5,
    effects:{ military:8, diplomatic:-3, economic:-1, cyber:1, information:3, domestic:5 }, counter:'mil_match', scenario:'east_china_sea' },
  { id:'ecs_intercept', domain:'military', name:'空中拦截管控', desc:'对侵入识别区的外军机实施拦截伴飞',
    cost:3, fundingCost:300, risk:0.25, successBase:65, escalation:2, repEffect:-5, domEffect:6,
    effects:{ military:10, diplomatic:-5, economic:-1, cyber:1, information:4, domestic:6 }, counter:'mil_escalate', scenario:'east_china_sea' },
  { id:'ecs_exercise', domain:'military', name:'东海防空演习', desc:'在东海方向举行防空联合演习',
    cost:3, fundingCost:500, risk:0.15, successBase:72, escalation:1, repEffect:-4, domEffect:5,
    effects:{ military:9, diplomatic:-4, economic:-2, cyber:0, information:3, domestic:5 }, counter:'mil_match', scenario:'east_china_sea' },

  /* ================================================================
   * 新增场景专属行动 (31-38)
   * ================================================================ */

  /* --- 马六甲海峡专属 --- */
  { id:'sm_escort', domain:'military', name:'海上护航编队部署', desc:'海军编队赴马六甲海峡执行常态化护航任务',
    cost:4, fundingCost:600, risk:0.25, successBase:62, escalation:1, repEffect:-3, domEffect:4,
    effects:{ military:10, diplomatic:-3, economic:5, cyber:0, information:2, domestic:4 }, counter:'mil_match', scenario:'strait_of_malacca' },
  { id:'sm_bypass', domain:'economic', name:'替代通道建设', desc:'建设中缅油气管道和克拉地峡替代运输方案',
    cost:4, fundingCost:1500, risk:0.1, successBase:75, escalation:0, repEffect:3, domEffect:6,
    effects:{ military:2, diplomatic:3, economic:10, cyber:1, information:1, domestic:6 }, counter:'eco_blockade', scenario:'strait_of_malacca' },
  { id:'sm_diplomatic', domain:'diplomatic', name:'海峡沿岸国外交', desc:'与印尼、马来西亚等沿岸国建立安全合作机制',
    cost:2, fundingCost:100, risk:0.15, successBase:72, escalation:-1, repEffect:7, domEffect:3,
    effects:{ military:0, diplomatic:8, economic:3, cyber:0, information:2, domestic:3 }, counter:'dip_counter', scenario:'strait_of_malacca' },

  /* --- 量子科技专属 --- */
  { id:'qt_breakthrough', domain:'economic', name:'量子计算攻关', desc:'集中力量突破量子计算纠错和规模化瓶颈',
    cost:4, fundingCost:2000, risk:0.15, successBase:70, escalation:0, repEffect:4, domEffect:8,
    effects:{ military:2, diplomatic:3, economic:12, cyber:3, information:3, domestic:8 }, counter:'eco_blockade', scenario:'quantum_tech' },
  { id:'qt_talent', domain:'domestic', name:'量子人才引育', desc:'建立量子科技人才特殊引育机制，防范人才流失',
    cost:2, fundingCost:500, risk:0.05, successBase:82, escalation:0, repEffect:3, domEffect:6,
    effects:{ military:1, diplomatic:3, economic:5, cyber:3, information:2, domestic:6 }, counter:'inf_divide', scenario:'quantum_tech' },
  { id:'qt_standard', domain:'diplomatic', name:'量子技术标准制定', desc:'主导量子通信和量子加密国际标准制定',
    cost:3, fundingCost:150, risk:0.15, successBase:70, escalation:0, repEffect:7, domEffect:4,
    effects:{ military:0, diplomatic:9, economic:4, cyber:3, information:3, domestic:4 }, counter:'dip_divide', scenario:'quantum_tech' },

  /* --- 跨境水资源专属 --- */
  { id:'ws_dam', domain:'domestic', name:'上游水利调控', desc:'加强雅鲁藏布江、澜沧江等上游水利设施调控能力，统筹水资源开发利用',
    cost:3, fundingCost:600, risk:0.1, successBase:80, escalation:0, repEffect:2, domEffect:6,
    effects:{ military:3, diplomatic:2, economic:4, cyber:1, information:2, domestic:7 }, counter:'eco_pressure', scenario:'water_security' },
  { id:'ws_treaty', domain:'diplomatic', name:'跨境水权合作', desc:'与下游国家推动跨境水资源利用合作机制和数据共享',
    cost:3, fundingCost:80, risk:0.15, successBase:68, escalation:-1, repEffect:8, domEffect:3,
    effects:{ military:0, diplomatic:11, economic:3, cyber:0, information:2, domestic:3 }, counter:'dip_delay', scenario:'water_security' },
  { id:'ws_diversion', domain:'economic', name:'跨流域调水工程', desc:'推进跨流域调水工程降低对单一水源依赖',
    cost:4, fundingCost:1200, risk:0.1, successBase:74, escalation:0, repEffect:3, domEffect:5,
    effects:{ military:1, diplomatic:3, economic:10, cyber:1, information:2, domestic:5 }, counter:'eco_pressure', scenario:'water_security' },

  /* --- 冰上丝绸之路专属 --- */
  { id:'psr_route', domain:'economic', name:'北极航道商业开发', desc:'开发北方海航道商业化运营，建设沿线补给体系',
    cost:4, fundingCost:1000, risk:0.15, successBase:72, escalation:0, repEffect:4, domEffect:5,
    effects:{ military:2, diplomatic:4, economic:10, cyber:1, information:2, domestic:5 }, counter:'eco_blockade', scenario:'polar_silk_road' },
  { id:'psr_port', domain:'diplomatic', name:'极地港口合作建设', desc:'与俄罗斯合作建设北极港口和物流中转设施',
    cost:3, fundingCost:800, risk:0.1, successBase:76, escalation:0, repEffect:5, domEffect:4,
    effects:{ military:2, diplomatic:8, economic:6, cyber:1, information:2, domestic:4 }, counter:'dip_counter', scenario:'polar_silk_road' },
  { id:'psr_research', domain:'diplomatic', name:'极地科研合作', desc:'开展北极科考和极地环境监测国际合作',
    cost:3, fundingCost:400, risk:0.1, successBase:78, escalation:-1, repEffect:6, domEffect:3,
    effects:{ military:1, diplomatic:7, economic:3, cyber:5, information:3, domestic:3 }, counter:'dip_protest', scenario:'polar_silk_road' },

  /* --- 海上灰色地带专属 --- */
  { id:'mm_coastguard', domain:'military', name:'海警执法前出', desc:'海警船前出争议海域进行常态化执法巡航',
    cost:3, fundingCost:400, risk:0.2, successBase:70, escalation:1, repEffect:-3, domEffect:5,
    effects:{ military:8, diplomatic:-3, economic:1, cyber:0, information:3, domestic:5 }, counter:'mil_match', scenario:'maritime_militia' },
  { id:'mm_fishery', domain:'economic', name:'渔业资源保护行动', desc:'组织渔船编队在传统渔场进行渔业生产维权',
    cost:2, fundingCost:200, risk:0.1, successBase:78, escalation:0, repEffect:2, domEffect:4,
    effects:{ military:2, diplomatic:4, economic:7, cyber:0, information:3, domestic:4 }, counter:'eco_pressure', scenario:'maritime_militia' },
  { id:'mm_press', domain:'information', name:'舆论反制行动', desc:'针对敌方灰色地带行动进行国际舆论反制',
    cost:2, fundingCost:100, risk:0.15, successBase:74, escalation:0, repEffect:4, domEffect:5,
    effects:{ military:0, diplomatic:5, economic:1, cyber:1, information:9, domestic:5 }, counter:'inf_escalate', scenario:'maritime_militia' },

  /* --- 太空碎片专属 --- */
  { id:'sd_track', domain:'cyber', name:'空间碎片精密追踪', desc:'启动空间碎片精密追踪系统保障在轨资产安全',
    cost:3, fundingCost:500, risk:0.1, successBase:80, escalation:0, repEffect:3, domEffect:4,
    effects:{ military:3, diplomatic:2, economic:2, cyber:10, information:3, domestic:4 }, counter:'cyb_recon', scenario:'space_debris' },
  { id:'sd_maneuver', domain:'military', name:'在轨卫星规避机动', desc:'指令在轨卫星执行规避机动规避碎片碰撞',
    cost:3, fundingCost:300, risk:0.15, successBase:75, escalation:1, repEffect:2, domEffect:5,
    effects:{ military:8, diplomatic:2, economic:-1, cyber:3, information:2, domestic:5 }, counter:'mil_match', scenario:'space_debris' },
  { id:'sd_debris', domain:'diplomatic', name:'空间交通管理规则推进', desc:'推动联合国框架下空间交通管理国际规则制定',
    cost:3, fundingCost:100, risk:0.15, successBase:70, escalation:-1, repEffect:8, domEffect:3,
    effects:{ military:1, diplomatic:10, economic:2, cyber:2, information:3, domestic:3 }, counter:'dip_delay', scenario:'space_debris' },

  /* --- 基因数据专属 --- */
  { id:'bd_regulate', domain:'cyber', name:'基因数据出境管制', desc:'建立基因数据出境安全审查和分级管制制度',
    cost:3, fundingCost:300, risk:0.1, successBase:78, escalation:0, repEffect:4, domEffect:6,
    effects:{ military:0, diplomatic:4, economic:3, cyber:10, information:3, domestic:6 }, counter:'dip_protest', scenario:'bio_data' },
  { id:'bd_indigenous', domain:'economic', name:'自主基因测序平台', desc:'建设国产高通量基因测序仪和数据分析平台',
    cost:4, fundingCost:1500, risk:0.1, successBase:74, escalation:0, repEffect:3, domEffect:7,
    effects:{ military:1, diplomatic:3, economic:11, cyber:3, information:2, domestic:7 }, counter:'eco_blockade', scenario:'bio_data' },
  { id:'bd_counter', domain:'information', name:'数据窃取反制曝光', desc:'公开曝光境外基因数据窃取行为争取国际支持',
    cost:2, fundingCost:100, risk:0.2, successBase:70, escalation:1, repEffect:5, domEffect:4,
    effects:{ military:1, diplomatic:6, economic:1, cyber:3, information:9, domestic:4 }, counter:'inf_denial', scenario:'bio_data' },

  /* --- 能源转型专属 --- */
  { id:'et_renewable', domain:'economic', name:'新能源产能扩张', desc:'大规模扩张光伏风电储能等新能源产能',
    cost:4, fundingCost:2000, risk:0.1, successBase:76, escalation:0, repEffect:4, domEffect:7,
    effects:{ military:1, diplomatic:4, economic:12, cyber:2, information:2, domestic:7 }, counter:'eco_blockade', scenario:'energy_transition' },
  { id:'et_nuclear', domain:'domestic', name:'核电安全扩建', desc:'安全有序推进核电建设保障基荷电力供应',
    cost:4, fundingCost:1500, risk:0.15, successBase:72, escalation:0, repEffect:3, domEffect:6,
    effects:{ military:2, diplomatic:3, economic:8, cyber:2, information:2, domestic:7 }, counter:'inf_fear', scenario:'energy_transition' },
  { id:'et_grid', domain:'cyber', name:'智能电网安全防护', desc:'加强智能电网网络安全防护抵御外部渗透',
    cost:3, fundingCost:600, risk:0.1, successBase:80, escalation:0, repEffect:2, domEffect:5,
    effects:{ military:2, diplomatic:2, economic:4, cyber:10, information:2, domestic:5 }, counter:'cyb_attack', scenario:'energy_transition' },

  /* ================================================================
   * 蓝方(对手方)专属行动 — 基于场景不同，对弈双方角色、实力等要素不同
   * 每个场景3个蓝方行动，反映对手方在地缘政治中的真实能力和战略选择
   * ================================================================ */

  /* --- 台海场景 蓝方(美台联盟) --- */
  { id:'ts_b_arms', domain:'military', name:'对台军售升级', desc:'向台湾出售先进武器系统，提升其所谓自卫能力',
    cost:3, fundingCost:800, risk:0.2, successBase:68, escalation:2, repEffect:-5, domEffect:5,
    effects:{ military:12, diplomatic:-8, economic:-4, cyber:0, information:3, domestic:5 }, counter:'dip_protest', scenario:'taiwan_strait', side:'blue' },
  { id:'ts_b_fonops', domain:'military', name:'航行自由行动', desc:'军舰穿越台湾海峡执行所谓航行自由行动',
    cost:3, fundingCost:500, risk:0.3, successBase:62, escalation:2, repEffect:-6, domEffect:4,
    effects:{ military:10, diplomatic:-6, economic:-2, cyber:0, information:4, domestic:4 }, counter:'mil_match', scenario:'taiwan_strait', side:'blue' },
  { id:'ts_b_def', domain:'military', name:'强化岛链防御', desc:'加强第一岛链军事部署和同盟协调，构建联合防御体系',
    cost:4, fundingCost:1000, risk:0.15, successBase:72, escalation:1, repEffect:-3, domEffect:6,
    effects:{ military:14, diplomatic:-4, economic:-3, cyber:2, information:2, domestic:6 }, counter:'mil_escalate', scenario:'taiwan_strait', side:'blue' },

  /* --- 南海场景 蓝方(域外大国+声索国) --- */
  { id:'scs_b_fonops', domain:'military', name:'航行自由巡航', desc:'定期执行南海航行自由巡航任务，挑战中国海洋主张',
    cost:3, fundingCost:600, risk:0.25, successBase:65, escalation:2, repEffect:-4, domEffect:5,
    effects:{ military:10, diplomatic:-5, economic:-2, cyber:0, information:4, domestic:5 }, counter:'mil_match', scenario:'south_china_sea', side:'blue' },
  { id:'scs_b_arb', domain:'diplomatic', name:'国际仲裁施压', desc:'推动国际仲裁案和舆论施压中国南海主张',
    cost:2, fundingCost:100, risk:0.2, successBase:68, escalation:1, repEffect:-3, domEffect:4,
    effects:{ military:0, diplomatic:-8, economic:-1, cyber:0, information:8, domestic:4 }, counter:'dip_protest', scenario:'south_china_sea', side:'blue' },
  { id:'scs_b_drill', domain:'military', name:'联合海上演习', desc:'与盟友和声索国举行联合海上军事演习',
    cost:3, fundingCost:500, risk:0.2, successBase:70, escalation:1, repEffect:-4, domEffect:5,
    effects:{ military:11, diplomatic:-5, economic:-2, cyber:0, information:3, domestic:5 }, counter:'mil_escalate', scenario:'south_china_sea', side:'blue' },

  /* --- 中印边境 蓝方(印度) --- */
  { id:'bd_b_forward', domain:'military', name:'前沿兵力推进', desc:'向边境争议区增派兵力，加强实际控制',
    cost:3, fundingCost:400, risk:0.25, successBase:65, escalation:2, repEffect:-4, domEffect:5,
    effects:{ military:10, diplomatic:-4, economic:-2, cyber:0, information:2, domestic:5 }, counter:'mil_match', scenario:'border_india', side:'blue' },
  { id:'bd_b_quad', domain:'diplomatic', name:'四方机制联动', desc:'通过四方安全对话机制对中国施压',
    cost:2, fundingCost:80, risk:0.15, successBase:72, escalation:1, repEffect:-3, domEffect:4,
    effects:{ military:4, diplomatic:-6, economic:-1, cyber:1, information:4, domestic:4 }, counter:'dip_counter', scenario:'border_india', side:'blue' },
  { id:'bd_b_infra', domain:'domestic', name:'边境基建加速', desc:'加速边境地区公路机场等基础设施建设',
    cost:3, fundingCost:600, risk:0.1, successBase:78, escalation:0, repEffect:-2, domEffect:6,
    effects:{ military:6, diplomatic:-2, economic:3, cyber:0, information:2, domestic:6 }, counter:'eco_pressure', scenario:'border_india', side:'blue' },

  /* --- 经济制裁 蓝方(美西方联盟) --- */
  { id:'eco_b_tech', domain:'economic', name:'技术出口管制升级', desc:'扩大对华技术出口管制清单范围',
    cost:3, fundingCost:300, risk:0.2, successBase:70, escalation:1, repEffect:-4, domEffect:4,
    effects:{ military:2, diplomatic:-5, economic:10, cyber:1, information:3, domestic:4 }, counter:'eco_retaliate', scenario:'eco_sanctions', side:'blue' },
  { id:'eco_b_entity', domain:'economic', name:'实体清单扩展', desc:'增加中国企业和机构至制裁实体清单',
    cost:2, fundingCost:200, risk:0.15, successBase:74, escalation:1, repEffect:-3, domEffect:3,
    effects:{ military:0, diplomatic:-4, economic:8, cyber:0, information:2, domestic:3 }, counter:'eco_retaliate', scenario:'eco_sanctions', side:'blue' },
  { id:'eco_b_ally', domain:'diplomatic', name:'盟友协调制裁', desc:'协调盟友实施联合对华经济制裁',
    cost:3, fundingCost:150, risk:0.2, successBase:68, escalation:1, repEffect:-5, domEffect:4,
    effects:{ military:0, diplomatic:-7, economic:6, cyber:0, information:3, domestic:4 }, counter:'dip_counter', scenario:'eco_sanctions', side:'blue' },

  /* --- 网络攻防 蓝方(APT组织·非国家行为体) --- */
  { id:'cyb_b_apt', domain:'cyber', name:'持续渗透攻击', desc:'对目标关键基础设施实施持续高级网络渗透',
    cost:4, fundingCost:100, risk:0.35, successBase:58, escalation:2, repEffect:0, domEffect:0,
    effects:{ military:3, diplomatic:-4, economic:-2, cyber:14, information:-2, domestic:0 }, counter:'cyb_attack', scenario:'cyber_attack', side:'blue' },
  { id:'cyb_b_supply', domain:'cyber', name:'供应链植入攻击', desc:'通过供应链渠道实施恶意软件植入',
    cost:3, fundingCost:80, risk:0.3, successBase:62, escalation:1, repEffect:0, domEffect:0,
    effects:{ military:2, diplomatic:-3, economic:-1, cyber:10, information:2, domestic:0 }, counter:'cyb_recon', scenario:'cyber_attack', side:'blue' },
  { id:'cyb_b_info', domain:'information', name:'配套信息操纵', desc:'配合网络攻击散布虚假信息制造混乱',
    cost:2, fundingCost:40, risk:0.2, successBase:70, escalation:1, repEffect:0, domEffect:0,
    effects:{ military:0, diplomatic:-3, economic:-1, cyber:2, information:9, domestic:0 }, counter:'inf_counter', scenario:'cyber_attack', side:'blue' },

  /* --- 混合战争 蓝方(混合战争发起方·非国家行为体) --- */
  { id:'hw_b_proxy', domain:'military', name:'代理人骚扰行动', desc:'通过代理人制造边境摩擦和低烈度冲突',
    cost:3, fundingCost:150, risk:0.25, successBase:68, escalation:2, repEffect:0, domEffect:2,
    effects:{ military:9, diplomatic:-5, economic:-2, cyber:1, information:2, domestic:2 }, counter:'mil_match', scenario:'hybrid_warfare', side:'blue' },
  { id:'hw_b_economic', domain:'economic', name:'经济混合施压', desc:'综合运用经济手段进行混合施压',
    cost:2, fundingCost:100, risk:0.15, successBase:74, escalation:1, repEffect:0, domEffect:2,
    effects:{ military:0, diplomatic:-4, economic:8, cyber:1, information:2, domestic:2 }, counter:'eco_pressure', scenario:'hybrid_warfare', side:'blue' },
  { id:'hw_b_info', domain:'information', name:'多渠道信息操纵', desc:'利用多渠道进行信息操纵和认知攻击',
    cost:3, fundingCost:80, risk:0.2, successBase:70, escalation:1, repEffect:0, domEffect:0,
    effects:{ military:1, diplomatic:-4, economic:-1, cyber:2, information:11, domestic:0 }, counter:'inf_escalate', scenario:'hybrid_warfare', side:'blue' },

  /* --- 中东 蓝方(地区冲突方) --- */
  { id:'me_b_choke', domain:'military', name:'航道封锁威胁', desc:'威胁封锁关键航道制造能源危机',
    cost:4, fundingCost:400, risk:0.3, successBase:58, escalation:3, repEffect:-8, domEffect:4,
    effects:{ military:10, diplomatic:-10, economic:-5, cyber:0, information:3, domestic:4 }, counter:'mil_escalate', scenario:'middle_east', side:'blue' },
  { id:'me_b_proxy', domain:'military', name:'代理人武装扩张', desc:'通过代理人武装扩大地区冲突范围',
    cost:3, fundingCost:300, risk:0.25, successBase:65, escalation:2, repEffect:-5, domEffect:3,
    effects:{ military:8, diplomatic:-6, economic:-2, cyber:0, information:2, domestic:3 }, counter:'mil_match', scenario:'middle_east', side:'blue' },
  { id:'me_b_oil', domain:'economic', name:'能源武器化', desc:'将能源供应作为武器进行政治施压',
    cost:3, fundingCost:500, risk:0.2, successBase:68, escalation:2, repEffect:-6, domEffect:4,
    effects:{ military:2, diplomatic:-7, economic:8, cyber:0, information:2, domestic:4 }, counter:'eco_pressure', scenario:'middle_east', side:'blue' },

  /* --- 霍尔木兹 蓝方(伊朗及其代理人) --- */
  { id:'hz_b_mine', domain:'military', name:'水雷封锁威胁', desc:'在霍尔木兹海峡布雷实施封锁威胁',
    cost:4, fundingCost:500, risk:0.3, successBase:60, escalation:3, repEffect:-8, domEffect:5,
    effects:{ military:12, diplomatic:-10, economic:-4, cyber:0, information:3, domestic:5 }, counter:'mil_escalate', scenario:'hormuz', side:'blue' },
  { id:'hz_b_intercept', domain:'military', name:'商船拦截扣押', desc:'拦截扣押过往商船施压国际社会',
    cost:3, fundingCost:300, risk:0.25, successBase:65, escalation:2, repEffect:-6, domEffect:4,
    effects:{ military:8, diplomatic:-7, economic:-3, cyber:0, information:3, domestic:4 }, counter:'mil_match', scenario:'hormuz', side:'blue' },
  { id:'hz_b_leverage', domain:'diplomatic', name:'地缘杠杆运用', desc:'利用海峡地缘价值进行多边博弈',
    cost:2, fundingCost:80, risk:0.15, successBase:72, escalation:1, repEffect:-4, domEffect:3,
    effects:{ military:2, diplomatic:-6, economic:3, cyber:0, information:3, domestic:3 }, counter:'dip_counter', scenario:'hormuz', side:'blue' },

  /* --- 印太 蓝方(Quad联盟) --- */
  { id:'ip_b_drill', domain:'military', name:'四方联合军演', desc:'举行四方安全对话成员国联合军事演习',
    cost:3, fundingCost:600, risk:0.2, successBase:70, escalation:2, repEffect:-4, domEffect:5,
    effects:{ military:11, diplomatic:-5, economic:-2, cyber:1, information:3, domestic:5 }, counter:'mil_match', scenario:'indo_pacific', side:'blue' },
  { id:'ip_b_tech', domain:'economic', name:'技术联盟构建', desc:'构建排除中国的技术供应链联盟',
    cost:3, fundingCost:500, risk:0.15, successBase:72, escalation:1, repEffect:-3, domEffect:4,
    effects:{ military:2, diplomatic:-5, economic:9, cyber:2, information:2, domestic:4 }, counter:'eco_retaliate', scenario:'indo_pacific', side:'blue' },
  { id:'ip_b_siege', domain:'diplomatic', name:'外交围堵强化', desc:'加强对华外交围堵和战略包围',
    cost:3, fundingCost:150, risk:0.2, successBase:68, escalation:1, repEffect:-4, domEffect:4,
    effects:{ military:3, diplomatic:-8, economic:-1, cyber:1, information:4, domestic:4 }, counter:'dip_divide', scenario:'indo_pacific', side:'blue' },

  /* --- 稀土 蓝方(替代供应联盟) --- */
  { id:'re_b_sub', domain:'economic', name:'替代供应开发', desc:'投资开发替代稀土供应来源',
    cost:4, fundingCost:1500, risk:0.15, successBase:72, escalation:0, repEffect:3, domEffect:5,
    effects:{ military:1, diplomatic:3, economic:12, cyber:1, information:2, domestic:5 }, counter:'eco_blockade', scenario:'rare_earth', side:'blue' },
  { id:'re_b_recycle', domain:'economic', name:'回收替代技术', desc:'研发稀土回收和替代材料技术',
    cost:3, fundingCost:1000, risk:0.1, successBase:76, escalation:0, repEffect:4, domEffect:4,
    effects:{ military:1, diplomatic:4, economic:10, cyber:2, information:2, domestic:4 }, counter:'eco_pressure', scenario:'rare_earth', side:'blue' },
  { id:'re_b_market', domain:'diplomatic', name:'国际定价施压', desc:'施压国际市场重塑稀土定价机制',
    cost:2, fundingCost:200, risk:0.2, successBase:70, escalation:0, repEffect:-2, domEffect:3,
    effects:{ military:0, diplomatic:-4, economic:7, cyber:0, information:3, domestic:3 }, counter:'dip_counter', scenario:'rare_earth', side:'blue' },

  /* --- 太空 蓝方(某大国太空军) --- */
  { id:'sp_b_mil', domain:'military', name:'太空军事部署', desc:'部署太空军事资产强化轨道优势',
    cost:4, fundingCost:800, risk:0.2, successBase:68, escalation:2, repEffect:-6, domEffect:4,
    effects:{ military:10, diplomatic:-6, economic:-2, cyber:3, information:2, domestic:4 }, counter:'mil_escalate', scenario:'space_domain', side:'blue' },
  { id:'sp_b_ssa', domain:'cyber', name:'太空监视网络', desc:'建设太空态势感知监控网络',
    cost:3, fundingCost:600, risk:0.1, successBase:78, escalation:0, repEffect:2, domEffect:4,
    effects:{ military:4, diplomatic:2, economic:2, cyber:10, information:3, domestic:4 }, counter:'cyb_recon', scenario:'space_domain', side:'blue' },
  { id:'sp_b_rules', domain:'diplomatic', name:'太空规则主导', desc:'主导太空交通管理国际规则制定',
    cost:2, fundingCost:100, risk:0.15, successBase:72, escalation:0, repEffect:6, domEffect:3,
    effects:{ military:1, diplomatic:8, economic:2, cyber:2, information:3, domestic:3 }, counter:'dip_divide', scenario:'space_domain', side:'blue' },

  /* --- AI竞赛 蓝方(美西方科技联盟) --- */
  { id:'ai_b_chip', domain:'economic', name:'芯片禁令升级', desc:'进一步升级对华先进芯片出口禁令',
    cost:3, fundingCost:500, risk:0.2, successBase:72, escalation:1, repEffect:-4, domEffect:5,
    effects:{ military:2, diplomatic:-5, economic:10, cyber:2, information:2, domestic:5 }, counter:'eco_blockade', scenario:'ai_race', side:'blue' },
  { id:'ai_b_talent', domain:'domestic', name:'人才交流阻断', desc:'限制AI领域人才交流和学术合作',
    cost:2, fundingCost:100, risk:0.15, successBase:74, escalation:0, repEffect:-3, domEffect:4,
    effects:{ military:1, diplomatic:-4, economic:5, cyber:2, information:2, domestic:4 }, counter:'inf_divide', scenario:'ai_race', side:'blue' },
  { id:'ai_b_ally', domain:'diplomatic', name:'科技联盟排华', desc:'组建科技联盟系统性排除中国',
    cost:3, fundingCost:200, risk:0.2, successBase:68, escalation:1, repEffect:-5, domEffect:4,
    effects:{ military:2, diplomatic:-7, economic:4, cyber:2, information:3, domestic:4 }, counter:'dip_counter', scenario:'ai_race', side:'blue' },

  /* --- 金融战 蓝方(某大国金融体系) --- */
  { id:'fw_b_swift', domain:'economic', name:'结算系统制裁', desc:'威胁切断目标国环球银行金融电信协会结算系统访问',
    cost:4, fundingCost:500, risk:0.25, successBase:65, escalation:2, repEffect:-6, domEffect:5,
    effects:{ military:1, diplomatic:-7, economic:12, cyber:1, information:2, domestic:5 }, counter:'eco_retaliate', scenario:'finance_war', side:'blue' },
  { id:'fw_b_asset', domain:'economic', name:'海外资产冻结', desc:'冻结目标国海外资产和外汇储备',
    cost:3, fundingCost:300, risk:0.2, successBase:70, escalation:2, repEffect:-5, domEffect:4,
    effects:{ military:0, diplomatic:-6, economic:10, cyber:0, information:2, domestic:4 }, counter:'eco_pressure', scenario:'finance_war', side:'blue' },
  { id:'fw_b_rating', domain:'economic', name:'信用评级打压', desc:'通过信用评级机构打压目标国信用',
    cost:2, fundingCost:100, risk:0.15, successBase:74, escalation:1, repEffect:-3, domEffect:3,
    effects:{ military:0, diplomatic:-4, economic:8, cyber:0, information:2, domestic:3 }, counter:'dip_counter', scenario:'finance_war', side:'blue' },

  /* --- 北极 蓝方(北极国家联盟) --- */
  { id:'ac_b_exclude', domain:'diplomatic', name:'排他性治理框架', desc:'推动排他性北极治理框架排除非北极国家',
    cost:3, fundingCost:100, risk:0.15, successBase:72, escalation:0, repEffect:-4, domEffect:4,
    effects:{ military:1, diplomatic:-7, economic:2, cyber:1, information:3, domestic:4 }, counter:'dip_protest', scenario:'arctic', side:'blue' },
  { id:'ac_b_mil', domain:'military', name:'北极军事存在', desc:'加强北极地区军事部署和巡逻',
    cost:3, fundingCost:600, risk:0.15, successBase:74, escalation:1, repEffect:-3, domEffect:4,
    effects:{ military:10, diplomatic:-4, economic:-2, cyber:1, information:2, domestic:4 }, counter:'mil_match', scenario:'arctic', side:'blue' },
  { id:'ac_b_resource', domain:'economic', name:'资源垄断开发', desc:'垄断北极油气和矿产资源开发',
    cost:4, fundingCost:1000, risk:0.1, successBase:76, escalation:0, repEffect:-2, domEffect:5,
    effects:{ military:2, diplomatic:-3, economic:12, cyber:1, information:2, domestic:5 }, counter:'eco_blockade', scenario:'arctic', side:'blue' },

  /* --- 数字主权 蓝方(某大国数字霸权) --- */
  { id:'ds_b_monopoly', domain:'cyber', name:'平台垄断强化', desc:'强化数字平台全球垄断地位',
    cost:3, fundingCost:800, risk:0.1, successBase:78, escalation:0, repEffect:2, domEffect:5,
    effects:{ military:1, diplomatic:3, economic:6, cyber:10, information:2, domestic:5 }, counter:'eco_blockade', scenario:'digital_sovereignty', side:'blue' },
  { id:'ds_b_standard', domain:'diplomatic', name:'数字标准主导', desc:'主导国际数字治理标准排除中国',
    cost:3, fundingCost:150, risk:0.15, successBase:72, escalation:0, repEffect:-3, domEffect:4,
    effects:{ military:0, diplomatic:-6, economic:3, cyber:3, information:3, domestic:4 }, counter:'dip_divide', scenario:'digital_sovereignty', side:'blue' },
  { id:'ds_b_data', domain:'cyber', name:'数据跨境攫取', desc:'推动数据跨境自由流动攫取他国数据',
    cost:2, fundingCost:200, risk:0.2, successBase:70, escalation:0, repEffect:-4, domEffect:3,
    effects:{ military:0, diplomatic:-5, economic:5, cyber:8, information:2, domestic:3 }, counter:'cyb_attack', scenario:'digital_sovereignty', side:'blue' },

  /* --- 钓鱼岛 蓝方(日美同盟) --- */
  { id:'dy_b_patrol', domain:'military', name:'联合巡航挑衅', desc:'日美联合在钓鱼岛海域进行巡航挑衅',
    cost:3, fundingCost:500, risk:0.25, successBase:66, escalation:2, repEffect:-5, domEffect:5,
    effects:{ military:10, diplomatic:-5, economic:-2, cyber:0, information:3, domestic:5 }, counter:'mil_match', scenario:'diaoyu', side:'blue' },
  { id:'dy_b_control', domain:'military', name:'实际控制强化', desc:'加强钓鱼岛周边实际控制和设施建设',
    cost:3, fundingCost:400, risk:0.2, successBase:70, escalation:1, repEffect:-4, domEffect:5,
    effects:{ military:8, diplomatic:-4, economic:-1, cyber:0, information:2, domestic:5 }, counter:'mil_escalate', scenario:'diaoyu', side:'blue' },
  { id:'dy_b_dip', domain:'diplomatic', name:'国际舆论施压', desc:'在国际舞台渲染中国威胁论施压',
    cost:2, fundingCost:80, risk:0.15, successBase:72, escalation:1, repEffect:-3, domEffect:4,
    effects:{ military:0, diplomatic:-6, economic:0, cyber:0, information:8, domestic:4 }, counter:'dip_protest', scenario:'diaoyu', side:'blue' },

  /* --- 朝鲜半岛 蓝方(美韩联盟) --- */
  { id:'kp_b_drill', domain:'military', name:'联合军演升级', desc:'升级美韩联合军演规模和烈度',
    cost:3, fundingCost:600, risk:0.2, successBase:70, escalation:2, repEffect:-4, domEffect:5,
    effects:{ military:11, diplomatic:-5, economic:-2, cyber:1, information:3, domestic:5 }, counter:'mil_escalate', scenario:'korean_peninsula', side:'blue' },
  { id:'kp_b_deploy', domain:'military', name:'战略武器部署', desc:'在半岛部署战略武器系统',
    cost:4, fundingCost:800, risk:0.25, successBase:65, escalation:3, repEffect:-6, domEffect:5,
    effects:{ military:13, diplomatic:-7, economic:-3, cyber:1, information:2, domestic:5 }, counter:'mil_match', scenario:'korean_peninsula', side:'blue' },
  { id:'kp_b_pressure', domain:'diplomatic', name:'极限制裁施压', desc:'推动对朝极限制裁施压中国',
    cost:2, fundingCost:150, risk:0.2, successBase:70, escalation:1, repEffect:-3, domEffect:4,
    effects:{ military:1, diplomatic:-6, economic:3, cyber:0, information:3, domestic:4 }, counter:'dip_counter', scenario:'korean_peninsula', side:'blue' },

  /* --- 缅甸 蓝方(边境武装冲突方) --- */
  { id:'mm_b_expand', domain:'military', name:'冲突范围扩大', desc:'扩大内战规模制造边境难民危机',
    cost:3, fundingCost:200, risk:0.3, successBase:62, escalation:2, repEffect:-5, domEffect:3,
    effects:{ military:8, diplomatic:-5, economic:-3, cyber:0, information:2, domestic:3 }, counter:'mil_match', scenario:'myanmar', side:'blue' },
  { id:'mm_b_proxy', domain:'military', name:'代理人渗透', desc:'通过代理人武装渗透边境地区',
    cost:2, fundingCost:150, risk:0.25, successBase:68, escalation:1, repEffect:-4, domEffect:3,
    effects:{ military:7, diplomatic:-4, economic:-1, cyber:1, information:2, domestic:3 }, counter:'mil_escalate', scenario:'myanmar', side:'blue' },
  { id:'mm_b_info', domain:'information', name:'舆论抹黑行动', desc:'在国际舆论上抹黑中国缅甸政策',
    cost:2, fundingCost:80, risk:0.15, successBase:74, escalation:0, repEffect:-3, domEffect:3,
    effects:{ military:0, diplomatic:-5, economic:0, cyber:1, information:9, domestic:3 }, counter:'inf_counter', scenario:'myanmar', side:'blue' },

  /* --- 阿富汗 蓝方(恐怖组织·非国家行为体) --- */
  { id:'af_b_terror', domain:'military', name:'恐怖袭击策划', desc:'策划针对中国边境的恐怖袭击',
    cost:3, fundingCost:50, risk:0.4, successBase:55, escalation:3, repEffect:0, domEffect:1,
    effects:{ military:8, diplomatic:-6, economic:-3, cyber:1, information:1, domestic:1 }, counter:'mil_escalate', scenario:'afghanistan', side:'blue' },
  { id:'af_b_infiltrate', domain:'cyber', name:'网络渗透招募', desc:'利用网络渠道渗透招募极端分子',
    cost:2, fundingCost:30, risk:0.25, successBase:70, escalation:1, repEffect:0, domEffect:2,
    effects:{ military:2, diplomatic:-3, economic:-1, cyber:8, information:5, domestic:2 }, counter:'cyb_attack', scenario:'afghanistan', side:'blue' },
  { id:'af_b_destabilize', domain:'information', name:'煽动动荡叙事', desc:'散布虚假信息煽动地区动荡',
    cost:2, fundingCost:30, risk:0.2, successBase:72, escalation:1, repEffect:0, domEffect:1,
    effects:{ military:1, diplomatic:-4, economic:-1, cyber:1, information:8, domestic:1 }, counter:'inf_escalate', scenario:'afghanistan', side:'blue' },

  /* --- 非洲之角 蓝方(某大国+地区方) --- */
  { id:'ha_b_base', domain:'military', name:'军事基地扩建', desc:'扩建军事基地争夺地区控制权',
    cost:3, fundingCost:600, risk:0.15, successBase:74, escalation:1, repEffect:-3, domEffect:4,
    effects:{ military:9, diplomatic:-4, economic:2, cyber:1, information:2, domestic:4 }, counter:'dip_protest', scenario:'horn_africa', side:'blue' },
  { id:'ha_b_proxy', domain:'military', name:'代理人战争', desc:'通过代理人武装制造地区冲突',
    cost:3, fundingCost:400, risk:0.25, successBase:66, escalation:2, repEffect:-5, domEffect:3,
    effects:{ military:8, diplomatic:-6, economic:-2, cyber:0, information:2, domestic:3 }, counter:'mil_match', scenario:'horn_africa', side:'blue' },
  { id:'ha_b_leverage', domain:'diplomatic', name:'外交拉拢竞争', desc:'拉拢地区国家选边站队',
    cost:2, fundingCost:200, risk:0.15, successBase:72, escalation:0, repEffect:-3, domEffect:3,
    effects:{ military:1, diplomatic:-6, economic:3, cyber:0, information:3, domestic:3 }, counter:'dip_counter', scenario:'horn_africa', side:'blue' },

  /* --- 委内瑞拉 蓝方(某大国+反对派) --- */
  { id:'vz_b_intervene', domain:'military', name:'军事干预威胁', desc:'以武力干预相威胁施压委内瑞拉',
    cost:4, fundingCost:600, risk:0.3, successBase:60, escalation:3, repEffect:-7, domEffect:4,
    effects:{ military:10, diplomatic:-8, economic:-3, cyber:1, information:2, domestic:4 }, counter:'mil_escalate', scenario:'venezuela', side:'blue' },
  { id:'vz_b_opposition', domain:'domestic', name:'反对派扶持', desc:'扶持反对派势力制造政治动荡',
    cost:3, fundingCost:300, risk:0.2, successBase:68, escalation:1, repEffect:-4, domEffect:3,
    effects:{ military:2, diplomatic:-5, economic:-1, cyber:2, information:5, domestic:3 }, counter:'inf_divide', scenario:'venezuela', side:'blue' },
  { id:'vz_b_sanction', domain:'economic', name:'极限制裁加码', desc:'升级对委内瑞拉经济制裁',
    cost:3, fundingCost:200, risk:0.15, successBase:72, escalation:1, repEffect:-4, domEffect:4,
    effects:{ military:1, diplomatic:-5, economic:9, cyber:0, information:2, domestic:4 }, counter:'eco_retaliate', scenario:'venezuela', side:'blue' },

  /* --- 生物安全 蓝方(生物威胁源·非国家行为体) --- */
  { id:'bs_b_leak', domain:'cyber', name:'生物信息操控', desc:'操控生物信息实施认知战',
    cost:3, fundingCost:100, risk:0.25, successBase:62, escalation:1, repEffect:0, domEffect:1,
    effects:{ military:1, diplomatic:-4, economic:-1, cyber:8, information:7, domestic:1 }, counter:'inf_denial', scenario:'biosecurity', side:'blue' },
  { id:'bs_b_spread', domain:'domestic', name:'病原扩散威胁', desc:'制造病原体扩散威胁公共安全',
    cost:4, fundingCost:200, risk:0.35, successBase:55, escalation:2, repEffect:0, domEffect:1,
    effects:{ military:3, diplomatic:-8, economic:-4, cyber:1, information:2, domestic:1 }, counter:'inf_fear', scenario:'biosecurity', side:'blue' },
  { id:'bs_b_attrib', domain:'information', name:'恶意归因甩锅', desc:'恶意归因甩锅嫁祸他国',
    cost:2, fundingCost:50, risk:0.2, successBase:70, escalation:1, repEffect:0, domEffect:2,
    effects:{ military:0, diplomatic:-5, economic:0, cyber:1, information:9, domestic:2 }, counter:'inf_counter', scenario:'biosecurity', side:'blue' },

  /* --- 核扩散 蓝方(核扩散方) --- */
  { id:'np_b_test', domain:'military', name:'核试验推进', desc:'推进核武器试验提升核能力',
    cost:5, fundingCost:1000, risk:0.4, successBase:48, escalation:3, repEffect:-10, domEffect:5,
    effects:{ military:14, diplomatic:-12, economic:-5, cyber:1, information:2, domestic:5 }, counter:'mil_escalate', scenario:'nuclear_prolif', side:'blue' },
  { id:'np_b_delivery', domain:'military', name:'投送系统发展', desc:'发展核武器投送系统',
    cost:4, fundingCost:800, risk:0.3, successBase:55, escalation:2, repEffect:-6, domEffect:4,
    effects:{ military:12, diplomatic:-7, economic:-4, cyber:1, information:2, domestic:4 }, counter:'mil_match', scenario:'nuclear_prolif', side:'blue' },
  { id:'np_b_breakout', domain:'diplomatic', name:'退出条约', desc:'退出不扩散条约寻求核突破',
    cost:3, fundingCost:50, risk:0.3, successBase:60, escalation:3, repEffect:-8, domEffect:4,
    effects:{ military:5, diplomatic:-10, economic:-2, cyber:0, information:3, domestic:4 }, counter:'dip_protest', scenario:'nuclear_prolif', side:'blue' },

  /* --- 深海 蓝方(某大国深海力量) --- */
  { id:'ds_b_deploy', domain:'military', name:'深海军事部署', desc:'部署深海军事监视和作战系统',
    cost:4, fundingCost:800, risk:0.2, successBase:68, escalation:1, repEffect:-4, domEffect:4,
    effects:{ military:10, diplomatic:-4, economic:-2, cyber:3, information:2, domestic:4 }, counter:'mil_match', scenario:'deep_sea', side:'blue' },
  { id:'ds_b_tap', domain:'cyber', name:'海底电缆窃听', desc:'对海底通信电缆实施窃听监控',
    cost:3, fundingCost:400, risk:0.25, successBase:65, escalation:1, repEffect:-5, domEffect:3,
    effects:{ military:3, diplomatic:-5, economic:-1, cyber:10, information:3, domestic:3 }, counter:'cyb_attack', scenario:'deep_sea', side:'blue' },
  { id:'ds_b_mining', domain:'economic', name:'深海资源抢占', desc:'抢占深海矿产资源和勘探权',
    cost:4, fundingCost:1000, risk:0.15, successBase:72, escalation:0, repEffect:-3, domEffect:4,
    effects:{ military:2, diplomatic:-4, economic:11, cyber:2, information:2, domestic:4 }, counter:'eco_blockade', scenario:'deep_sea', side:'blue' },

  /* --- 气候安全 蓝方(某大国气候联盟) --- */
  { id:'cs_b_tariff', domain:'economic', name:'碳关税壁垒', desc:'实施碳关税壁垒打压中国制造业',
    cost:3, fundingCost:300, risk:0.15, successBase:74, escalation:1, repEffect:-4, domEffect:4,
    effects:{ military:0, diplomatic:-5, economic:10, cyber:1, information:2, domestic:4 }, counter:'eco_retaliate', scenario:'climate_security', side:'blue' },
  { id:'cs_b_standard', domain:'diplomatic', name:'气候标准主导', desc:'主导气候标准排斥中国话语权',
    cost:2, fundingCost:100, risk:0.15, successBase:72, escalation:0, repEffect:-3, domEffect:3,
    effects:{ military:0, diplomatic:-6, economic:3, cyber:1, information:3, domestic:3 }, counter:'dip_divide', scenario:'climate_security', side:'blue' },
  { id:'cs_b_pressure', domain:'information', name:'气候责任甩锅', desc:'甩锅气候责任施压中国发展',
    cost:2, fundingCost:80, risk:0.15, successBase:74, escalation:0, repEffect:-3, domEffect:3,
    effects:{ military:0, diplomatic:-4, economic:0, cyber:1, information:8, domestic:3 }, counter:'inf_counter', scenario:'climate_security', side:'blue' },

  /* --- 粮食安全 蓝方(粮食垄断方) --- */
  { id:'fs_b_monopoly', domain:'economic', name:'粮食供应垄断', desc:'利用垄断地位操控粮食供应',
    cost:3, fundingCost:500, risk:0.15, successBase:74, escalation:1, repEffect:-4, domEffect:4,
    effects:{ military:1, diplomatic:-5, economic:10, cyber:0, information:2, domestic:4 }, counter:'eco_pressure', scenario:'food_security', side:'blue' },
  { id:'fs_b_price', domain:'economic', name:'粮价操控施压', desc:'操控国际粮价进行政治施压',
    cost:3, fundingCost:400, risk:0.2, successBase:70, escalation:1, repEffect:-5, domEffect:4,
    effects:{ military:0, diplomatic:-6, economic:9, cyber:0, information:2, domestic:4 }, counter:'eco_retaliate', scenario:'food_security', side:'blue' },
  { id:'fs_b_seed', domain:'cyber', name:'种业专利壁垒', desc:'利用种业专利构建技术壁垒',
    cost:3, fundingCost:600, risk:0.1, successBase:76, escalation:0, repEffect:-2, domEffect:4,
    effects:{ military:0, diplomatic:-3, economic:8, cyber:8, information:2, domestic:4 }, counter:'eco_blockade', scenario:'food_security', side:'blue' },

  /* --- 供应链 蓝方(断链联盟) --- */
  { id:'sc_b_decouple', domain:'economic', name:'供应链脱钩', desc:'推动供应链系统性脱钩去中国化',
    cost:4, fundingCost:1000, risk:0.15, successBase:72, escalation:1, repEffect:-4, domEffect:5,
    effects:{ military:2, diplomatic:-5, economic:11, cyber:1, information:2, domestic:5 }, counter:'eco_blockade', scenario:'supply_chain', side:'blue' },
  { id:'sc_b_nearshore', domain:'economic', name:'近岸外包转移', desc:'推动产业链向近岸友岸转移',
    cost:3, fundingCost:800, risk:0.1, successBase:76, escalation:0, repEffect:-2, domEffect:4,
    effects:{ military:1, diplomatic:-4, economic:10, cyber:1, information:2, domestic:4 }, counter:'eco_pressure', scenario:'supply_chain', side:'blue' },
  { id:'sc_b_pressure', domain:'diplomatic', name:'盟友断链施压', desc:'施压盟友联合推动供应链断链',
    cost:2, fundingCost:150, risk:0.2, successBase:70, escalation:0, repEffect:-3, domEffect:3,
    effects:{ military:0, diplomatic:-6, economic:5, cyber:0, information:3, domestic:3 }, counter:'dip_counter', scenario:'supply_chain', side:'blue' },

  /* --- 认知域作战 蓝方(认知作战方·非国家行为体) --- */
  { id:'cw_b_infiltrate', domain:'information', name:'认知渗透行动', desc:'对目标国实施系统性认知渗透',
    cost:3, fundingCost:100, risk:0.2, successBase:68, escalation:1, repEffect:0, domEffect:2,
    effects:{ military:2, diplomatic:-4, economic:0, cyber:2, information:11, domestic:2 }, counter:'inf_escalate', scenario:'cognitive_war', side:'blue' },
  { id:'cw_b_narrative', domain:'information', name:'虚假叙事构建', desc:'构建虚假国际叙事抹黑中国',
    cost:3, fundingCost:80, risk:0.15, successBase:72, escalation:0, repEffect:0, domEffect:2,
    effects:{ military:0, diplomatic:-5, economic:0, cyber:1, information:10, domestic:2 }, counter:'inf_counter', scenario:'cognitive_war', side:'blue' },
  { id:'cw_b_amplify', domain:'cyber', name:'舆论放大操控', desc:'利用技术手段放大操控舆论',
    cost:3, fundingCost:150, risk:0.2, successBase:70, escalation:0, repEffect:0, domEffect:2,
    effects:{ military:1, diplomatic:-4, economic:-1, cyber:8, information:8, domestic:2 }, counter:'cyb_attack', scenario:'cognitive_war', side:'blue' },

  /* --- 北约东扩 蓝方(北约联盟) --- */
  { id:'ne_b_expand', domain:'diplomatic', name:'北约持续东扩', desc:'推动北约持续东扩吸纳新成员国',
    cost:3, fundingCost:200, risk:0.15, successBase:74, escalation:1, repEffect:-4, domEffect:4,
    effects:{ military:3, diplomatic:-7, economic:2, cyber:1, information:3, domestic:4 }, counter:'dip_counter', scenario:'nato_expansion', side:'blue' },
  { id:'ne_b_pacific', domain:'military', name:'亚太军事介入', desc:'北约力量介入亚太地区军事活动',
    cost:4, fundingCost:600, risk:0.2, successBase:68, escalation:2, repEffect:-5, domEffect:5,
    effects:{ military:10, diplomatic:-6, economic:-2, cyber:1, information:3, domestic:5 }, counter:'mil_match', scenario:'nato_expansion', side:'blue' },
  { id:'ne_b_pressure', domain:'economic', name:'盟友联合施压', desc:'协调北约盟友对华联合施压',
    cost:3, fundingCost:300, risk:0.15, successBase:72, escalation:1, repEffect:-4, domEffect:4,
    effects:{ military:1, diplomatic:-6, economic:8, cyber:0, information:2, domestic:4 }, counter:'eco_retaliate', scenario:'nato_expansion', side:'blue' },

  /* --- 东海 蓝方(日美空中力量) --- */
  { id:'ecs_b_recon', domain:'military', name:'抵近侦察挑衅', desc:'加强对中国抵近侦察飞行频次',
    cost:3, fundingCost:400, risk:0.25, successBase:66, escalation:2, repEffect:-5, domEffect:5,
    effects:{ military:9, diplomatic:-5, economic:-1, cyber:1, information:3, domestic:5 }, counter:'mil_match', scenario:'east_china_sea', side:'blue' },
  { id:'ecs_b_intercept', domain:'military', name:'空中拦截挑衅', desc:'在东海空域进行挑衅性拦截',
    cost:3, fundingCost:300, risk:0.3, successBase:62, escalation:2, repEffect:-6, domEffect:5,
    effects:{ military:10, diplomatic:-6, economic:-1, cyber:1, information:4, domestic:5 }, counter:'mil_escalate', scenario:'east_china_sea', side:'blue' },
  { id:'ecs_b_adiz', domain:'diplomatic', name:'防空识别区挑衅', desc:'不承认中国东海防空识别区并派机挑衅',
    cost:2, fundingCost:100, risk:0.2, successBase:72, escalation:1, repEffect:-4, domEffect:4,
    effects:{ military:2, diplomatic:-6, economic:0, cyber:0, information:5, domestic:4 }, counter:'dip_protest', scenario:'east_china_sea', side:'blue' },

  /* --- 马六甲海峡 蓝方(某大国海军联盟) --- */
  { id:'sm_b_blockade', domain:'military', name:'海峡封锁威慑', desc:'以海军力量威慑封锁马六甲海峡',
    cost:4, fundingCost:800, risk:0.25, successBase:62, escalation:2, repEffect:-6, domEffect:5,
    effects:{ military:12, diplomatic:-7, economic:-3, cyber:1, information:2, domestic:5 }, counter:'mil_escalate', scenario:'strait_of_malacca', side:'blue' },
  { id:'sm_b_surveil', domain:'cyber', name:'海上监控部署', desc:'部署海上监控体系掌控海峡动态',
    cost:3, fundingCost:500, risk:0.1, successBase:78, escalation:0, repEffect:-2, domEffect:4,
    effects:{ military:4, diplomatic:-3, economic:2, cyber:10, information:3, domestic:4 }, counter:'cyb_recon', scenario:'strait_of_malacca', side:'blue' },
  { id:'sm_b_leverage', domain:'diplomatic', name:'海峡沿岸拉拢', desc:'拉拢海峡沿岸国建立排他性安全机制',
    cost:3, fundingCost:200, risk:0.15, successBase:72, escalation:0, repEffect:-4, domEffect:4,
    effects:{ military:2, diplomatic:-7, economic:3, cyber:0, information:3, domestic:4 }, counter:'dip_counter', scenario:'strait_of_malacca', side:'blue' },

  /* --- 量子科技 蓝方(某大国量子联盟) --- */
  { id:'qt_b_block', domain:'economic', name:'量子技术封锁', desc:'对华实施量子技术全面封锁',
    cost:3, fundingCost:500, risk:0.15, successBase:74, escalation:1, repEffect:-4, domEffect:5,
    effects:{ military:2, diplomatic:-5, economic:10, cyber:2, information:2, domestic:5 }, counter:'eco_blockade', scenario:'quantum_tech', side:'blue' },
  { id:'qt_b_patent', domain:'diplomatic', name:'专利壁垒构建', desc:'构建量子技术专利壁垒',
    cost:3, fundingCost:200, risk:0.15, successBase:72, escalation:0, repEffect:-3, domEffect:4,
    effects:{ military:1, diplomatic:-6, economic:5, cyber:3, information:3, domestic:4 }, counter:'dip_divide', scenario:'quantum_tech', side:'blue' },
  { id:'qt_b_talent', domain:'domestic', name:'人才争夺挖角', desc:'高薪挖角中国量子科技人才',
    cost:2, fundingCost:400, risk:0.1, successBase:78, escalation:0, repEffect:-2, domEffect:4,
    effects:{ military:1, diplomatic:-3, economic:6, cyber:3, information:2, domestic:4 }, counter:'inf_divide', scenario:'quantum_tech', side:'blue' },

  /* --- 跨境水资源 蓝方(下游国家联盟) --- */
  { id:'ws_b_dam', domain:'diplomatic', name:'国际河流维权诉讼', desc:'向国际法庭和国际机构投诉中国上游水利影响下游生态',
    cost:3, fundingCost:200, risk:0.15, successBase:72, escalation:1, repEffect:-5, domEffect:4,
    effects:{ military:0, diplomatic:-7, economic:2, cyber:1, information:5, domestic:4 }, counter:'dip_protest', scenario:'water_security', side:'blue' },
  { id:'ws_b_leverage', domain:'information', name:'国际舆论施压', desc:'炒作中国上游水利威胁论，联合国际环保组织施压',
    cost:2, fundingCost:100, risk:0.2, successBase:70, escalation:1, repEffect:-4, domEffect:3,
    effects:{ military:0, diplomatic:-5, economic:1, cyber:1, information:9, domestic:3 }, counter:'inf_counter', scenario:'water_security', side:'blue' },
  { id:'ws_b_alliance', domain:'diplomatic', name:'下游联盟构建', desc:'联合印度、越南等下游国家构建水资源利益共同体',
    cost:3, fundingCost:150, risk:0.15, successBase:72, escalation:0, repEffect:-3, domEffect:4,
    effects:{ military:1, diplomatic:-6, economic:3, cyber:0, information:3, domestic:4 }, counter:'dip_divide', scenario:'water_security', side:'blue' },

  /* --- 冰上丝绸之路 蓝方(西方北极联盟) --- */
  { id:'psr_b_exclude', domain:'diplomatic', name:'航道排他管控', desc:'对北方海航道实施排他性管控',
    cost:3, fundingCost:200, risk:0.15, successBase:72, escalation:0, repEffect:-4, domEffect:4,
    effects:{ military:2, diplomatic:-7, economic:3, cyber:1, information:3, domestic:4 }, counter:'dip_protest', scenario:'polar_silk_road', side:'blue' },
  { id:'psr_b_military', domain:'military', name:'极地军事巡逻', desc:'加强北极军事巡逻排他性存在',
    cost:3, fundingCost:500, risk:0.2, successBase:70, escalation:1, repEffect:-4, domEffect:5,
    effects:{ military:10, diplomatic:-5, economic:-2, cyber:1, information:2, domestic:5 }, counter:'mil_match', scenario:'polar_silk_road', side:'blue' },
  { id:'psr_b_resource', domain:'economic', name:'极地资源垄断', desc:'垄断北极油气和矿产资源开发',
    cost:4, fundingCost:1000, risk:0.1, successBase:76, escalation:0, repEffect:-3, domEffect:5,
    effects:{ military:2, diplomatic:-4, economic:12, cyber:1, information:2, domestic:5 }, counter:'eco_blockade', scenario:'polar_silk_road', side:'blue' },

  /* --- 海上灰色地带 蓝方(灰色地带施压方) --- */
  { id:'mm_b_grayzone', domain:'military', name:'灰色地带行动', desc:'以非军事力量进行灰色地带施压',
    cost:2, fundingCost:300, risk:0.15, successBase:76, escalation:1, repEffect:-3, domEffect:4,
    effects:{ military:8, diplomatic:-4, economic:1, cyber:0, information:3, domestic:4 }, counter:'mil_match', scenario:'maritime_militia', side:'blue' },
  { id:'mm_b_fonops', domain:'military', name:'航行自由挑衅', desc:'以航行自由为名进行海上挑衅',
    cost:3, fundingCost:500, risk:0.2, successBase:70, escalation:2, repEffect:-4, domEffect:5,
    effects:{ military:10, diplomatic:-5, economic:-2, cyber:0, information:4, domestic:5 }, counter:'mil_escalate', scenario:'maritime_militia', side:'blue' },
  { id:'mm_b_legal', domain:'diplomatic', name:'法律战施压', desc:'通过国际法律战挑战中国海洋主张',
    cost:2, fundingCost:100, risk:0.15, successBase:74, escalation:0, repEffect:-3, domEffect:4,
    effects:{ military:0, diplomatic:-6, economic:1, cyber:0, information:5, domestic:4 }, counter:'dip_protest', scenario:'maritime_militia', side:'blue' },

  /* --- 太空碎片 蓝方(某大国太空力量) --- */
  { id:'sd_b_asat', domain:'military', name:'反卫星试验', desc:'实施反卫星试验制造太空碎片',
    cost:4, fundingCost:600, risk:0.35, successBase:55, escalation:2, repEffect:-8, domEffect:3,
    effects:{ military:10, diplomatic:-8, economic:-2, cyber:3, information:2, domestic:3 }, counter:'mil_escalate', scenario:'space_debris', side:'blue' },
  { id:'sd_b_orbit', domain:'military', name:'轨道资源抢占', desc:'抢占关键轨道资源位置',
    cost:3, fundingCost:500, risk:0.2, successBase:68, escalation:1, repEffect:-4, domEffect:4,
    effects:{ military:8, diplomatic:-4, economic:-1, cyber:2, information:2, domestic:4 }, counter:'mil_match', scenario:'space_debris', side:'blue' },
  { id:'sd_b_track', domain:'cyber', name:'太空监控垄断', desc:'垄断太空态势感知数据拒绝共享',
    cost:3, fundingCost:400, risk:0.1, successBase:78, escalation:0, repEffect:-3, domEffect:4,
    effects:{ military:3, diplomatic:-4, economic:2, cyber:10, information:2, domestic:4 }, counter:'cyb_recon', scenario:'space_debris', side:'blue' },

  /* --- 基因数据 蓝方(境外情报与生物公司·非国家行为体) --- */
  { id:'bd_b_collect', domain:'cyber', name:'基因数据窃取', desc:'以科研合作为掩护窃取中国基因数据',
    cost:3, fundingCost:100, risk:0.25, successBase:62, escalation:1, repEffect:0, domEffect:2,
    effects:{ military:1, diplomatic:-5, economic:3, cyber:10, information:3, domestic:2 }, counter:'cyb_attack', scenario:'bio_data', side:'blue' },
  { id:'bd_b_analyze', domain:'information', name:'数据分析操控', desc:'利用基因数据进行分析和认知操控',
    cost:3, fundingCost:150, risk:0.2, successBase:68, escalation:0, repEffect:0, domEffect:2,
    effects:{ military:0, diplomatic:-4, economic:2, cyber:3, information:9, domestic:2 }, counter:'inf_counter', scenario:'bio_data', side:'blue' },
  { id:'bd_b_leverage', domain:'diplomatic', name:'生物安全甩锅', desc:'甩锅生物安全责任嫁祸中国',
    cost:2, fundingCost:50, risk:0.2, successBase:72, escalation:1, repEffect:0, domEffect:2,
    effects:{ military:0, diplomatic:-5, economic:0, cyber:1, information:8, domestic:2 }, counter:'inf_denial', scenario:'bio_data', side:'blue' },

  /* --- 能源转型 蓝方(某大国绿色联盟) --- */
  { id:'et_b_tariff', domain:'economic', name:'绿色贸易壁垒', desc:'实施绿色贸易壁垒打压中国新能源',
    cost:3, fundingCost:400, risk:0.15, successBase:74, escalation:1, repEffect:-4, domEffect:4,
    effects:{ military:0, diplomatic:-5, economic:10, cyber:1, information:2, domestic:4 }, counter:'eco_retaliate', scenario:'energy_transition', side:'blue' },
  { id:'et_b_standard', domain:'diplomatic', name:'绿色标准垄断', desc:'垄断绿色技术标准排斥中国',
    cost:3, fundingCost:200, risk:0.15, successBase:72, escalation:0, repEffect:-3, domEffect:4,
    effects:{ military:0, diplomatic:-6, economic:4, cyber:2, information:3, domestic:4 }, counter:'dip_divide', scenario:'energy_transition', side:'blue' },
  { id:'et_b_supply', domain:'economic', name:'关键矿物控制', desc:'控制新能源关键矿物供应链',
    cost:4, fundingCost:800, risk:0.15, successBase:72, escalation:1, repEffect:-4, domEffect:5,
    effects:{ military:2, diplomatic:-5, economic:11, cyber:1, information:2, domestic:5 }, counter:'eco_blockade', scenario:'energy_transition', side:'blue' },
];

/* ===== 行动→军种映射 =====
 * 每个行动绑定的主要军种代码，用于:
 *   1. 行动卡片显示力量依赖
 *   2. 行动执行时消耗对应军种战备
 *   3. 低战备时锁定行动
 */
const ACTION_FORCE_MAP = {
  /* 通用军事 */
  mil_deter:'海军', mil_exercise:'陆军', mil_retaliate:'空军',
  mil_defense:'陆军', mil_standby:null,
  /* 通用网络 */
  cyb_defend:'网络空间', cyb_attack:'网络空间', cyb_intel:'网络空间', cyb_attrib:'网络空间',
  /* 通用信息 */
  inf_counter:'信息支援', inf_release:'信息支援', inf_cognitive:'信息支援',
  /* 通用国内 */
  dom_mobilize:'民兵预备役', dom_economy:null, dom_unity:'武警',
  /* 台海专属 */
  ts_blockade:'海军', ts_amphibious:'陆军', ts_missile_deter:'火箭军',
  /* 南海专属 */
  scs_island:'海军', scs_patrol:'海警局', scs_drill:'空军',
  /* 中印边境 */
  bd_reinforce:'陆军', bd_disengage:null, bd_infra:'联勤保障',
  /* 中东 */
  me_evacuate:'海军', me_energy:null, me_mediate:null,
  /* 霍尔木兹 */
  hz_convoy:'海军', hz_alternative:null, hz_naval:null,
  /* 太空 */
  sp_asat:'火箭军', sp_constellation:'军事航天', sp_debris:null,
  /* 北极 */
  ac_research:null, ac_route:null, ac_icebreaker:'海军',
  /* 钓鱼岛 */
  dy_patrol:'海军', dy_law:'海警局', dy_drill:'空军',
  /* 朝鲜半岛 */
  kp_mediate:null, kp_sanction:null, kp_prepare:'陆军',
  /* 缅甸 */
  mm_border:'武警', mm_mediate:null, mm_humanitarian:'武警',
  /* 阿富汗 */
  af_recon:null, af_terror:'信息支援', af_neighbor:null,
  /* 非洲之角 */
  ha_base:'海军', ha_mediate:null, ha_aid:'联勤保障',
  /* 委内瑞拉 */
  vz_diplomatic:null, vz_energy:null, vz_cooperation:null,
  /* 生物安全 */
  bs_response:'武警', bs_trace:'信息支援', bs_vaccine:null,
  /* 核扩散 */
  np_nonpro:null, np_deter:'火箭军', np_arms:null,
  /* 深海 */
  ds_explore:null, ds_monitor:'军事航天', ds_protect:'海军',
  /* 气候安全 */
  cs_carbon:null, cs_energy:null, cs_cooperation:null,
  /* 粮食安全 */
  fs_reserve:null, fs_tech:null, fs_diversify:null,
  /* 供应链 */
  sc_reshore:null, sc_diversify:null, sc_stockpile:'联勤保障',
  /* 认知域作战 */
  cw_counter:'信息支援', cw_narrative:'信息支援', cw_platform:null,
  /* 北约东扩 */
  ne_counter:null, ne_partner:null, ne_shanghai:null,
  /* 东海 */
  ecs_adiz:'空军', ecs_intercept:'空军', ecs_exercise:'空军',
  /* 马六甲海峡 */
  sm_escort:'海军', sm_bypass:null, sm_diplomatic:null,
  /* 量子科技 */
  qt_breakthrough:null, qt_talent:null, qt_standard:null,
  /* 跨境水资源 */
  ws_dam:'陆军', ws_treaty:null, ws_diversion:'联勤保障',
  /* 冰上丝绸之路 */
  psr_route:null, psr_port:null, psr_research:null,
  /* 海上灰色地带 */
  mm_coastguard:'海警局', mm_fishery:'民兵预备役', mm_press:'信息支援',
  /* 太空碎片 */
  sd_track:'军事航天', sd_maneuver:'军事航天', sd_debris:null,
  /* 基因数据 */
  bd_regulate:'网络空间', bd_indigenous:null, bd_counter:'网络空间',
  /* 能源转型 */
  et_renewable:null, et_nuclear:null, et_grid:'网络空间',
};

/* 获取行动的军种依赖 */
function getActionForce(action){
  /* 蓝方行动不依赖中国军种力量体系 */
  if(action.side === 'blue') return null;
  if(ACTION_FORCE_MAP[action.id] !== undefined) return ACTION_FORCE_MAP[action.id];
  /* 按域默认 */
  if(action.domain === 'cyber') return '网络空间';
  if(action.domain === 'information') return '信息支援';
  if(action.domain === 'space') return '军事航天';
  if(action.domain === 'logistics') return '联勤保障';
  if(action.domain === 'domestic') return '武警';
  return null;
}

/* ===== AI对手行动库 ===== */
const AI_ACTIONS = {
  mil_escalate:  { name:'军事升级对抗', desc:'敌方加强军事部署，提升对抗烈度', effects:{ military:-8, diplomatic:-3, economic:-2, cyber:0, information:-2, domestic:-3 } },
  mil_match:     { name:'对等军事响应', desc:'敌方采取对等军事措施回应',       effects:{ military:-4, diplomatic:-2, economic:-1, cyber:0, information:0, domestic:-1 } },
  dip_protest:   { name:'外交抗议',     desc:'敌方提出强烈外交抗议',           effects:{ military:0, diplomatic:-4, economic:0, cyber:0, information:2, domestic:-1 } },
  dip_delay:     { name:'拖延谈判',     desc:'敌方采取拖延战术消耗耐心',       effects:{ military:0, diplomatic:-5, economic:-2, cyber:0, information:-1, domestic:-2 } },
  dip_divide:    { name:'分化瓦解',     desc:'敌方试图分化我方联盟',           effects:{ military:-2, diplomatic:-6, economic:-1, cyber:0, information:-2, domestic:-1 } },
  dip_counter:   { name:'外交反制',     desc:'敌方实施外交反制措施',           effects:{ military:0, diplomatic:-5, economic:-2, cyber:0, information:0, domestic:-1 } },
  eco_retaliate: { name:'经济报复',     desc:'敌方实施对等经济报复',           effects:{ military:0, diplomatic:-2, economic:-8, cyber:0, information:0, domestic:-3 } },
  eco_blockade:  { name:'技术封锁',     desc:'敌方加大技术封锁力度',           effects:{ military:-1, diplomatic:-1, economic:-6, cyber:-2, information:0, domestic:-2 } },
  eco_pressure:  { name:'经济施压',     desc:'敌方通过经济手段施压',           effects:{ military:0, diplomatic:-2, economic:-5, cyber:0, information:0, domestic:-2 } },
  cyb_attack:    { name:'网络攻击升级', desc:'敌方加大网络攻击力度',           effects:{ military:-1, diplomatic:-1, economic:-3, cyber:-8, information:-1, domestic:-2 } },
  cyb_defend:    { name:'网络防御加固', desc:'敌方加强网络防御',               effects:{ military:0, diplomatic:0, economic:0, cyber:-3, information:0, domestic:0 } },
  cyb_recon:     { name:'网络侦察',     desc:'敌方加强对我方网络侦察',         effects:{ military:-1, diplomatic:0, economic:0, cyber:-4, information:0, domestic:0 } },
  inf_denial:    { name:'否认与反咬',   desc:'敌方否认指控并反咬一口',         effects:{ military:0, diplomatic:-2, economic:0, cyber:0, information:-5, domestic:-2 } },
  inf_escalate:  { name:'舆论战升级',   desc:'敌方加大舆论攻击力度',           effects:{ military:0, diplomatic:-1, economic:0, cyber:0, information:-7, domestic:-3 } },
  inf_counter:   { name:'信息反制',     desc:'敌方实施信息反制行动',           effects:{ military:0, diplomatic:-1, economic:0, cyber:0, information:-4, domestic:-1 } },
  inf_defense:   { name:'认知防御',     desc:'敌方加强认知域防御',             effects:{ military:0, diplomatic:0, economic:0, cyber:0, information:-3, domestic:0 } },
  inf_fear:      { name:'散布恐慌',     desc:'敌方散布恐慌情绪',               effects:{ military:0, diplomatic:-1, economic:-1, cyber:0, information:-4, domestic:-5 } },
  inf_divide:    { name:'挑拨离间',     desc:'敌方试图挑拨社会矛盾',           effects:{ military:0, diplomatic:-1, economic:0, cyber:0, information:-3, domestic:-4 } },
};

/* ===== 轮次事件模板 ===== */
const ROUND_EVENTS = [
  { title:'危机爆发',   desc:'局势骤然升温，敌方突然采取挑衅行动。指挥部需要立即做出战略响应，各域力量进入临战状态。' },
  { title:'对抗升级',   desc:'双方博弈加剧，多域威胁同时显现。情报显示敌方正在调整部署，关键决策窗口正在收窄。' },
  { title:'博弈深化',   desc:'对抗进入深水区，双方都在试探对方底线。国际社会高度关注，外交与军事并行推进。' },
  { title:'关键转折',   desc:'出现战略转折机遇，敌方内部出现分歧。此时精准施策可能改变整个态势走向。' },
  { title:'决战时刻',   desc:'进入关键决战阶段，前期积累的战略资源将发挥决定性作用。一步不慎，满盘皆输。' },
  { title:'终局博弈',   desc:'最后一轮战略博弈，所有力量倾囊而出。最终结果将决定整个推演的胜负。' },
];

/* ===== 支援行动库 (一体化战略融合) =====
 * 支援行动代表功能区在推演中的实时介入,消耗AP
 * 与战略行动竞争同一AP预算池,模拟真实一体化决策
 *
 * supportEffects 特殊效果:
 *   successRateBonus  - 后续战略行动成功率加成 {域名: 加成}
 *   forceReadyBoost   - 部队战备度即时提升 {军种code: 提升值}
 *   fundCostReduce    - 后续行动资金消耗降低比例(0-1)
 *   escalationChange  - 升级度变化
 *   revealEnemy       - 揭示敌方下轮行动意图
 *   enemyDebuff       - 削弱敌方域值 {域名: 削减值}
 *   extraFunding      - 即时获得资金
 *   domainBoost       - 即时域值提升 {域名: 提升值}
 */
const SUPPORT_ACTIONS = [
  /* === 情报支援 === */
  { id:'sup_intel_recon', category:'intel', name:'战略侦察启动', desc:'部署多源侦察体系,获取敌方部署情报,提升后续军事行动精度',
    cost:1, fundingCost:80, risk:0.1, successBase:82,
    effects:{ cyber:2, information:2 },
    supportEffects:{ successRateBonus:{ military:8 }, revealEnemy:true } },
  { id:'sup_intel_sigint', category:'intel', name:'信号情报搜集', desc:'截获敌方通信信号,解析指挥意图,为网络与信息作战提供支撑',
    cost:1, fundingCost:60, risk:0.15, successBase:78,
    effects:{ cyber:3, information:1 },
    supportEffects:{ successRateBonus:{ cyber:10, information:6 } } },
  { id:'sup_intel_humint', category:'intel', name:'人力情报渗透', desc:'启动深层人力情报网络,获取敌方决策内幕',
    cost:2, fundingCost:120, risk:0.3, successBase:60,
    effects:{ diplomatic:1, information:2 },
    supportEffects:{ revealEnemy:true, successRateBonus:{ all:5 } } },
  { id:'sup_intel_ew', category:'intel', name:'电子战压制', desc:'对敌方指挥通信实施电子压制,降低敌方行动效率',
    cost:2, fundingCost:200, risk:0.2, successBase:68,
    effects:{ cyber:4, military:2 },
    supportEffects:{ enemyDebuff:{ military:-5, cyber:-3 } } },

  /* === 后勤保障 === */
  { id:'sup_log_supply', category:'logistics', name:'前沿补给线建立', desc:'紧急建立战区补给链,提升前沿部队战备状态',
    cost:1, fundingCost:150, risk:0.05, successBase:85,
    effects:{ military:3, domestic:2 },
    supportEffects:{ forceReadyBoost:{ army:5, navy:3, air_force:4 } } },
  { id:'sup_log_mobilize', category:'logistics', name:'战略投送动员', desc:'动员战略运输力量,实施快速兵力投送',
    cost:2, fundingCost:300, risk:0.1, successBase:75,
    effects:{ military:5, economic:-2 },
    supportEffects:{ forceReadyBoost:{ army:8, navy:5, air_force:6, rocket:4 } } },
  { id:'sup_log_reserve', category:'logistics', name:'战略储备启用', desc:'启用国家战略物资储备,释放作战资源',
    cost:1, fundingCost:0, risk:0.05, successBase:88,
    effects:{ economic:3, domestic:3 },
    supportEffects:{ extraFunding:300, fundCostReduce:0.1 } },
  { id:'sup_log_medical', category:'logistics', name:'战区医疗救援', desc:'部署战区医疗力量,保障部队持续作战能力',
    cost:1, fundingCost:50, risk:0.05, successBase:90,
    effects:{ domestic:4, military:1 },
    supportEffects:{ forceReadyBoost:{ army:2, navy:2, air_force:2 } } },

  /* === 经济调控 === */
  { id:'sup_eco_sanction', category:'economy', name:'定向经济制裁', desc:'对敌方关键经济领域实施精准制裁,削弱其战争潜力',
    cost:2, fundingCost:100, risk:0.2, successBase:70,
    effects:{ economic:4, diplomatic:-2 },
    supportEffects:{ enemyDebuff:{ economic:-8 } } },
  { id:'sup_eco_finance', category:'economy', name:'战时金融管制', desc:'实施金融管制措施,稳定经济基本盘,降低作战资金消耗',
    cost:1, fundingCost:50, risk:0.1, successBase:80,
    effects:{ economic:3, domestic:2 },
    supportEffects:{ fundCostReduce:0.15, extraFunding:200 } },
  { id:'sup_eco_trade', category:'economy', name:'贸易通道保障', desc:'保障关键贸易通道安全,维持经济运转',
    cost:1, fundingCost:100, risk:0.1, successBase:78,
    effects:{ economic:4, diplomatic:2 },
    supportEffects:{ successRateBonus:{ economic:8 } } },
  { id:'sup_eco_resource', category:'economy', name:'战略资源调配', desc:'统筹调配国家战略资源,全域小幅增强',
    cost:2, fundingCost:200, risk:0.05, successBase:82,
    effects:{ military:2, economic:3, cyber:1, diplomatic:1, information:1, domestic:2 },
    supportEffects:{ successRateBonus:{ all:3 }, extraFunding:150 } },

  /* === 外交协调 === */
  { id:'sup_dip_lobby', category:'diplomatic', name:'国际外交斡旋', desc:'通过外交渠道开展国际斡旋,降低冲突升级风险',
    cost:1, fundingCost:30, risk:0.1, successBase:80,
    effects:{ diplomatic:4, information:1 },
    supportEffects:{ escalationChange:-1 } },
  { id:'sup_dip_alliance', category:'diplomatic', name:'盟友协调行动', desc:'协调盟友开展联合行动,形成多边合力',
    cost:2, fundingCost:100, risk:0.15, successBase:72,
    effects:{ diplomatic:5, military:2, economic:1 },
    supportEffects:{ successRateBonus:{ military:5, diplomatic:8 }, forceReadyBoost:{ army:3, navy:3 } } },
  { id:'sup_dip_pressure', category:'diplomatic', name:'国际舆论施压', desc:'动员国际舆论对敌方施加压力',
    cost:1, fundingCost:40, risk:0.15, successBase:75,
    effects:{ information:4, diplomatic:2 },
    supportEffects:{ enemyDebuff:{ information:-5, diplomatic:-3 } } },
  { id:'sup_dip_coalition', category:'diplomatic', name:'多边联盟构建', desc:'构建多边安全联盟,提升国际声望与战略纵深',
    cost:2, fundingCost:150, risk:0.1, successBase:70,
    effects:{ diplomatic:6, domestic:3, information:2 },
    supportEffects:{ successRateBonus:{ all:4 }, escalationChange:-1 } },

  /* === 科技信息战 === */
  { id:'sup_tech_cyber', category:'tech', name:'网络攻防部署', desc:'部署网络攻防力量,夺取网络空间优势',
    cost:2, fundingCost:150, risk:0.2, successBase:72,
    effects:{ cyber:6, information:2 },
    supportEffects:{ enemyDebuff:{ cyber:-6, information:-3 } } },
  { id:'sup_tech_rnd', category:'tech', name:'紧急技术动员', desc:'动员科研力量进行技术攻关,为后续行动提供技术支撑',
    cost:1, fundingCost:100, risk:0.1, successBase:78,
    effects:{ cyber:3, economic:2, information:2 },
    supportEffects:{ successRateBonus:{ cyber:6, economic:4 }, extraFunding:100 } },
  { id:'sup_tech_info', category:'tech', name:'信息舆论引导', desc:'启动信息舆论引导机制,塑造有利舆论环境',
    cost:1, fundingCost:60, risk:0.1, successBase:80,
    effects:{ information:5, domestic:2 },
    supportEffects:{ successRateBonus:{ information:8, domestic:5 } } },
  { id:'sup_tech_satellite', category:'tech', name:'天基信息支援', desc:'调动卫星侦察与通信资源,提供太空信息支援',
    cost:2, fundingCost:250, risk:0.1, successBase:76,
    effects:{ cyber:4, information:3, military:2 },
    supportEffects:{ successRateBonus:{ military:4, cyber:5, information:5 }, revealEnemy:true } },
];

const SUPPORT_CATEGORIES = [
  { id:'intel',     name:'情报支援',   icon:'🔍', color:'#00b4d8', desc:'侦察/信号/渗透/电子战' },
  { id:'logistics', name:'后勤保障',   icon:'📦', color:'#ffa502', desc:'补给/投送/储备/医疗' },
  { id:'economy',   name:'经济调控',   icon:'💰', color:'#2ed573', desc:'制裁/金融/贸易/资源' },
  { id:'diplomatic',name:'外交协调',   icon:'🤝', color:'#a29bfe', desc:'斡旋/盟友/施压/联盟' },
  { id:'tech',      name:'科技信息战', icon:'🌐', color:'#ff6348', desc:'网络/技术/舆论/天基' },
];

/* ===== 推演引擎 ===== */
const Wargame = {
  state: null,

  /* ===== 进入推演 ===== */
  enter(scenario, directorState){
    /* 场景化力量：优先使用导调阶段调配的力量，否则使用场景化配置 */
    const forcesSource = (directorState && directorState.forces) || (typeof getScenarioForces === 'function' ? getScenarioForces(scenario.id) : FORCES);
    const forcesSnapshot = forcesSource.map(f => ({...f}));
    /* 场景化情报：使用与场景匹配的情报包 */
    const intelSource = (typeof getScenarioIntel === 'function' ? getScenarioIntel(scenario.id) : INTEL);
    const intelSnapshot = intelSource.map(i => ({...i}));

    this.state = {
      scenario,
      round: 1,
      maxRounds: scenario.duration,
      phase: 'acting',
      actionPoints: WG_RULES.baseAP,
      maxAP: WG_RULES.baseAP,
      selectedActions: [],
      /* 资金系统（使用导调阶段调配后的资金） */
      /* 非国家行为体预算调整: maxFunding也使用调整后的值 */
      funding: (directorState && directorState.budget != null) ? directorState.budget : scenario.budget,
      maxFunding: (() => {
        const sc = (directorState && directorState.sideColor) || 'red';
        if(sc === 'blue'){
          const sides = (typeof getScenarioSides === 'function') ? getScenarioSides(scenario.id) : null;
          const blueSide = sides ? sides.blue : null;
          const playerSideObj = (directorState && directorState.playerSide) || null;
          if((blueSide && blueSide.nonStateActor) || (playerSideObj && playerSideObj.nonStateActor)){
            return Math.round(scenario.budget * 0.15);
          }
        }
        return scenario.budget;
      })(),
      /* 声望系统: 根据玩家阵营动态确定
       * - 红方(中国等主权国家): 使用场景原始prestigeType(sovereignty/tech/aggressive)
       * - 蓝方非国家行为体(恐怖组织/APT组织等): 使用'none'(不在乎国际声望)
       * - 蓝方主权国家: 使用场景原始prestigeType
       */
      reputation: (() => {
        const sc = (directorState && directorState.sideColor) || 'red';
        if(sc === 'blue'){
          const sides = (typeof getScenarioSides === 'function') ? getScenarioSides(scenario.id) : null;
          const blueSide = sides ? sides.blue : null;
          const playerSideObj = (directorState && directorState.playerSide) || null;
          if((blueSide && blueSide.nonStateActor) || (playerSideObj && playerSideObj.nonStateActor)){
            return 50; /* 非国家行为体声望中性(不影响成功率计算) */
          }
        }
        return scenario.reputation;
      })(),
      domesticSupport: (() => {
        const sc = (directorState && directorState.sideColor) || 'red';
        if(sc === 'blue'){
          const sides = (typeof getScenarioSides === 'function') ? getScenarioSides(scenario.id) : null;
          const blueSide = sides ? sides.blue : null;
          const playerSideObj = (directorState && directorState.playerSide) || null;
          if((blueSide && blueSide.nonStateActor) || (playerSideObj && playerSideObj.nonStateActor)){
            return 45; /* 非国家行为体组织凝聚力较低(替代国内支持度) */
          }
        }
        return scenario.domesticSupport;
      })(),
      prestigeType: (() => {
        const baseType = getPrestigeType(scenario);
        const sc = (directorState && directorState.sideColor) || 'red';
        if(sc === 'blue'){
          /* 检查蓝方是否为非国家行为体 */
          const sides = (typeof getScenarioSides === 'function') ? getScenarioSides(scenario.id) : null;
          const blueSide = sides ? sides.blue : null;
          const playerSideObj = (directorState && directorState.playerSide) || null;
          if((blueSide && blueSide.nonStateActor) || (playerSideObj && playerSideObj.nonStateActor)){
            return 'none'; /* 非国家行为体不在乎国际声望 */
          }
        }
        return baseType;
      })(),
      /* 周期性收益（下轮结算） */
      pendingRepGain: 0,
      pendingFundGain: 0,
      /* 升级度 */
      escalation: 1,
      /* 六域 */
      domains: {
        military: 50, economic: 50, cyber: 50,
        diplomatic: 50, information: 50, domestic: 50,
      },
      /* 力量战备快照 */
      forces: forcesSnapshot,
      /* 情报快照 */
      intel: intelSnapshot,
      activeIntelMods: {},
      /* 功能模块快照（场景化） */
      modules: (typeof getScenarioModules === 'function') ? getScenarioModules(scenario.id) : ((typeof MODULES !== 'undefined') ? MODULES.map(m => ({...m})) : []),
      /* 日志 */
      log: [],
      lastAIAction: null,
      lastPlayerActions: [],
      lastChanges: null,
      lastDiceResults: null,
      /* 导调阶段数据（供复盘报告使用） */
      objectives: (directorState && directorState.objectives) || [],
      directorBoosts: (directorState && directorState.directorBoosts) || {},
      directorBudgetSpent: (directorState && directorState.directorBudgetSpent) || 0,
      /* 阵营信息 */
      playerSide: (directorState && directorState.playerSide) || null,
      opponentSide: (directorState && directorState.opponentSide) || null,
      gameMode: (directorState && directorState.gameMode) || 'single',
      sideColor: (directorState && directorState.sideColor) || 'red',
      /* 力量/情报历史（供复盘报告使用） */
      forceHistory: [forcesSnapshot.map(f => ({...f}))],
      intelHistory: [],
      /* 支援行动系统 (一体化融合) */
      selectedSupportActions: [],
      activeSupportMods: {
        successRateBonus: {},
        forceReadyBoost: {},
        fundCostReduce: 0,
        escalationChange: 0,
        revealEnemy: false,
        enemyDebuff: {},
        extraFunding: 0,
      },
      supportLog: [],
    };

    /* 应用初始情报修正 */
    this.applyIntelModifiers();
    this.state.intelHistory.push({...this.state.activeIntelMods});

    /* 应用功能区加成（来自推演前准备） */
    if(typeof ZoneSystem !== 'undefined'){
      const zb = ZoneSystem.getWargameBonuses(scenario.id);
      if(zb){
        /* 额外行动点 */
        if(zb.extraAP > 0){
          this.state.actionPoints += zb.extraAP;
          this.state.maxAP += zb.extraAP;
        }
        /* 额外资金 */
        if(zb.extraFunding > 0){
          this.state.funding += zb.extraFunding;
        }
        /* 额外情报卡 */
        if(zb.intelCards > 0){
          for(let i = 0; i < zb.intelCards && this.state.intel.length < 10; i++){
            this.state.intel.push({
              source:'ZONE_BONUS', type:'cyber', reliability:'A',
              title:'功能区情报支援', summary:'由战略情报中心提供的额外情报支援',
              modifier:{ domain:'cyber', bonus:5 },
            });
          }
        }
        /* 存储加成信息 */
        this.state.zoneBonuses = zb;
        this.state.log.push({ type:'system', text:`🎖️ 功能区加成已激活：${zb.sources.length}项准备行动/训练`, round:0 });
      }
    }

    /* 生成首轮导调报告 */
    this.state.directorReport = this._genDirectorReport();
    this.renderWargameView();
  },

  /* ===== 退出推演 ===== */
  exit(){
    this.state = null;
    const main = document.querySelector('.main');
    const tabBar = main.querySelector('.tab-bar');
    if(tabBar) tabBar.style.display = '';
    const content = document.getElementById('tabContent');
    if(content){
      content.innerHTML = '';
      App.switchTab('scenarios');
    }
  },

  /* ===== 应用情报修正 ===== */
  applyIntelModifiers(){
    if(!this.state) return;
    this.state.activeIntelMods = {};
    const roundIntel = this.state.intel.filter((_, i) => i < 3 + this.state.round);
    for(const intel of roundIntel){
      if(intel.modifier){
        /* 'space' 域情报映射到 'cyber'（太空行动均使用cyber域） */
        const d = intel.modifier.domain === 'space' ? 'cyber' : intel.modifier.domain;
        const b = intel.modifier.bonus;
        const mult = intel.reliability === 'A' ? 1.0 : intel.reliability === 'B' ? 0.7 : 0.4;
        this.state.activeIntelMods[d] = (this.state.activeIntelMods[d] || 0) + b * mult;
      }
    }
  },

  /* ===== 获取本轮可用行动 ===== */
  getAvailableActions(){
    const sc = this.state.scenario;
    const playerColor = this.state.sideColor || 'red'; /* 'red' 或 'blue' */
    /* 通用行动: 按 response 域过滤 + domestic，双方均可使用 */
    const responseDomains = sc.response || ['military','diplomatic','economic'];
    const allowed = [...new Set([...responseDomains, 'domestic'])];
    const general = STRATEGIC_ACTIONS.filter(a => a.scenario === null && allowed.includes(a.domain));
    /* 场景专属行动: 按阵营过滤
     * - 有明确 side 字段的: 仅匹配玩家阵营
     * - 无 side 字段的(既有行动): 默认为红方专属
     */
    const special = STRATEGIC_ACTIONS.filter(a => {
      if(a.scenario !== sc.id) return false;
      if(a.side) return a.side === playerColor;
      return playerColor === 'red'; /* 既有场景行动默认红方 */
    });
    return [...general, ...special];
  },

  /* ===== 获取可用支援行动 ===== */
  getAvailableSupportActions(){
    if(!this.state) return [];
    const sc = this.state.scenario;
    const responseDomains = sc.response || ['military','diplomatic','economic'];
    /* 所有支援行动均可用,但根据场景响应域过滤最相关的 */
    const allowed = [...new Set([...responseDomains, 'domestic','cyber','information'])];
    return SUPPORT_ACTIONS.filter(a => {
      /* 根据类别映射到域,过滤不相关类别 */
      const catToDomains = {
        intel:['cyber','information','military'],
        logistics:['military','domestic','economic'],
        economy:['economic','diplomatic'],
        diplomatic:['diplomatic','information'],
        tech:['cyber','information'],
      };
      const catDoms = catToDomains[a.category] || [];
      return catDoms.some(d => allowed.includes(d));
    });
  },

  /* ===== 选择/取消支援行动 ===== */
  toggleSupportAction(actionId){
    if(this.state.phase !== 'acting') return;
    const action = SUPPORT_ACTIONS.find(a => a.id === actionId);
    if(!action) return;
    const idx = this.state.selectedSupportActions.findIndex(a => a.id === actionId);
    if(idx >= 0){
      this.state.selectedSupportActions.splice(idx, 1);
      this.state.actionPoints += action.cost;
      this.state.funding += action.fundingCost;
    } else {
      if(this.state.actionPoints < action.cost) return;
      if(this.state.funding < action.fundingCost) return;
      this.state.selectedSupportActions.push(action);
      this.state.actionPoints -= action.cost;
      this.state.funding -= action.fundingCost;
    }
    this._recalcSupportMods();
    this.updateActionPanel();
  },

  /* ===== 重新计算支援行动修正 ===== */
  _recalcSupportMods(){
    if(!this.state) return;
    const mods = {
      successRateBonus: {},
      forceReadyBoost: {},
      fundCostReduce: 0,
      escalationChange: 0,
      revealEnemy: false,
      enemyDebuff: {},
      extraFunding: 0,
    };
    for(const a of this.state.selectedSupportActions){
      const se = a.supportEffects || {};
      if(se.successRateBonus){
        for(const [dom, val] of Object.entries(se.successRateBonus)){
          mods.successRateBonus[dom] = (mods.successRateBonus[dom] || 0) + val;
        }
      }
      if(se.forceReadyBoost){
        for(const [code, val] of Object.entries(se.forceReadyBoost)){
          mods.forceReadyBoost[code] = (mods.forceReadyBoost[code] || 0) + val;
        }
      }
      if(se.fundCostReduce) mods.fundCostReduce = Math.min(0.4, mods.fundCostReduce + se.fundCostReduce);
      if(se.escalationChange) mods.escalationChange += se.escalationChange;
      if(se.revealEnemy) mods.revealEnemy = true;
      if(se.enemyDebuff){
        for(const [dom, val] of Object.entries(se.enemyDebuff)){
          mods.enemyDebuff[dom] = (mods.enemyDebuff[dom] || 0) + val;
        }
      }
      if(se.extraFunding) mods.extraFunding += se.extraFunding;
    }
    this.state.activeSupportMods = mods;
  },

  /* ===== 执行支援行动 (在confirmActions中调用) ===== */
  _executeSupportActions(){
    const s = this.state;
    if(s.selectedSupportActions.length === 0) return [];

    const results = [];
    for(const action of s.selectedSupportActions){
      const roll = Math.floor(Math.random() * 100) + 1;
      const rate = this.calcSupportSuccessRate(action);
      let outcome;
      if(roll <= rate * 0.25){
        outcome = 'great'; /* 大成功 */
      } else if(roll <= rate){
        outcome = 'success';
      } else {
        outcome = 'failure';
      }

      const mult = outcome === 'great' ? 1.5 : outcome === 'success' ? 1.0 : 0.3;
      const se = action.supportEffects || {};
      const appliedEffects = {};

      /* 应用域效果 */
      if(action.effects){
        for(const [dom, val] of Object.entries(action.effects)){
          if(val !== 0 && s.domains[dom] !== undefined){
            s.domains[dom] = Math.max(0, Math.min(100, s.domains[dom] + Math.round(val * mult)));
            appliedEffects[dom] = Math.round(val * mult);
          }
        }
      }

      /* 应用即时资金 */
      if(se.extraFunding && outcome !== 'failure'){
        const fundGain = Math.round(se.extraFunding * mult);
        s.funding += fundGain;
        appliedEffects.extraFunding = fundGain;
      }

      /* 应用战备提升 */
      if(se.forceReadyBoost && outcome !== 'failure'){
        for(const [code, val] of Object.entries(se.forceReadyBoost)){
          const force = s.forces.find(f => f.code === code);
          if(force){
            const boost = Math.round(val * mult);
            force.readiness = Math.min(100, force.readiness + boost);
            appliedEffects['force_' + code] = boost;
          }
        }
      }

      /* 应用升级度变化 */
      if(se.escalationChange && outcome !== 'failure'){
        const escChange = Math.round(se.escalationChange * mult);
        s.escalation = Math.max(1, Math.min(5, s.escalation + escChange));
        appliedEffects.escalation = escChange;
      }

      /* 应用敌方削弱 */
      if(se.enemyDebuff && outcome !== 'failure'){
        appliedEffects.enemyDebuff = {};
        for(const [dom, val] of Object.entries(se.enemyDebuff)){
          appliedEffects.enemyDebuff[dom] = Math.round(val * mult);
        }
      }

      /* 记录日志 */
      const logEntry = {
        type: 'support',
        action: action.name,
        category: action.category,
        outcome,
        roll,
        rate,
        effects: appliedEffects,
        round: s.round,
      };
      results.push(logEntry);
      s.supportLog.push(logEntry);

      s.log.push({
        type: 'support',
        text: `${SUPPORT_CATEGORIES.find(c => c.id === action.category).icon} [支援] ${action.name} — ${outcome === 'great' ? '大成功!' : outcome === 'success' ? '成功' : '失败'} (骰:${roll}/${rate}%)`,
        round: s.round,
      });

      /* 失败风险: 有概率暴露/反噬 */
      if(outcome === 'failure' && action.risk >= 0.2){
        const backlash = Math.round(action.risk * 10);
        s.domains[action.domain || 'information'] = Math.max(0, (s.domains[action.domain || 'information'] || 50) - backlash);
        s.log.push({
          type: 'support',
          text: `⚠️ ${action.name}失败反噬: ${action.category}域 -${backlash}`,
          round: s.round,
        });
      }
    }

    return results;
  },

  /* ===== 计算支援行动成功率 ===== */
  calcSupportSuccessRate(action){
    let rate = action.successBase;
    const s = this.state;
    /* 升级度影响: 高升级度下情报行动成功率降低 */
    if(action.category === 'intel' && s.escalation >= 3) rate -= 5;
    /* 经济域加成 */
    if(action.category === 'economy' && s.domains.economic >= 60) rate += 5;
    /* 外交域加成 */
    if(action.category === 'diplomatic' && s.domains.diplomatic >= 60) rate += 5;
    return Math.max(20, Math.min(95, Math.round(rate)));
  },

  /* ===== 计算行动成功率 ===== */
  calcSuccessRate(action){
    let rate = action.successBase;
    const s = this.state;

    /* 力量战备修正 — 使用行动绑定的具体军种 */
    const forceCode = getActionForce(action);
    if(forceCode){
      const relevantForce = s.forces.find(f => f.code === forceCode);
      if(relevantForce){
        rate += (relevantForce.readiness - 50) * WG_RULES.forceModRate;
      }
    }

    /* 军事行动额外受所有传统军种平均战备影响 */
    if(action.domain === 'military'){
      const milForces = s.forces.filter(f => f.domain === 'military');
      if(milForces.length > 0){
        const milAvg = milForces.reduce((sum, f) => sum + f.readiness, 0) / milForces.length;
        rate += (milAvg - 50) * 0.1;
      }
    }

    /* 声望修正 */
    rate += (s.reputation - 50) * WG_RULES.repModRate;

    /* 国内支持修正 */
    rate += (s.domesticSupport - 50) * WG_RULES.domModRate;

    /* 情报修正 */
    if(s.activeIntelMods[action.domain]){
      rate += s.activeIntelMods[action.domain];
    }

    /* 功能模块修正 */
    if(s.modules && s.modules.length){
      for(const mod of s.modules){
        if(mod.modDomain === action.domain){
          rate += (mod.readiness - 50) * (mod.modRate || 0.3) * 0.5;
        }
      }
    }

    /* 功能区加成修正（来自推演前准备和训练） */
    if(s.zoneBonuses){
      if(s.zoneBonuses.successRate && s.zoneBonuses.successRate[action.domain]){
        rate += s.zoneBonuses.successRate[action.domain];
      }
      if(s.zoneBonuses.successRate && s.zoneBonuses.successRate.all){
        rate += s.zoneBonuses.successRate.all;
      }
    }

    /* 联合行动加成 */
    if(s.zoneBonuses && s.zoneBonuses.jointUnlock){
      rate += 2; /* 联合行动解锁提供小幅全域加成 */
    }

    /* 支援行动修正 (一体化融合核心) */
    if(s.activeSupportMods){
      const sm = s.activeSupportMods;
      /* 域专属成功率加成 */
      if(sm.successRateBonus[action.domain]){
        rate += sm.successRateBonus[action.domain];
      }
      /* 全域成功率加成 */
      if(sm.successRateBonus.all){
        rate += sm.successRateBonus.all;
      }
    }

    /* 资金充足修正 */
    if(s.funding > action.fundingCost * 3) rate += 5;

    /* 升级度修正: 高升级度下外交行动成功率降低 */
    if(action.domain === 'diplomatic' && s.escalation >= 3) rate -= 8;

    return Math.max(20, Math.min(95, Math.round(rate)));
  },

  /* ===== 选择/取消行动 ===== */
  toggleAction(actionId){
    if(this.state.phase !== 'acting') return;
    const action = STRATEGIC_ACTIONS.find(a => a.id === actionId);
    if(!action) return;
    const idx = this.state.selectedActions.findIndex(a => a.id === actionId);
    if(idx >= 0){
      this.state.selectedActions.splice(idx, 1);
      this.state.actionPoints += action.cost;
      this.state.funding += action.fundingCost;
    } else {
      if(this.state.actionPoints < action.cost) return;
      if(this.state.funding < action.fundingCost) return;
      /* 力量战备门槛 */
      const forceCode = getActionForce(action);
      if(forceCode){
        const force = this.state.forces.find(f => f.code === forceCode);
        if(force && force.readiness < 30) return;
      }
      this.state.selectedActions.push(action);
      this.state.actionPoints -= action.cost;
      this.state.funding -= action.fundingCost;
    }
    this.updateActionPanel();
  },

  /* ===== 确认行动 → 骰子裁决 → AI响应 ===== */
  confirmActions(){
    if(this.state.selectedActions.length === 0 && this.state.selectedSupportActions.length === 0) return;
    this.state.phase = 'resolution';
    const s = this.state;

    /* 0. 先执行支援行动 (影响后续战略行动) */
    const supportResults = this._executeSupportActions();

    /* 1. 逐个行动掷骰 */
    const diceResults = [];
    const playerEffects = { military:0, economic:0, cyber:0, diplomatic:0, information:0, domestic:0 };
    let totalEscalation = 0;
    let totalDomChange = 0;
    const playerActionNames = [];
    /* 声望系统: 区分即时变化(战争)和延迟增长(和平) */
    let immediateRepChange = 0;
    let deferredRepGain = 0;
    let deferredFundGain = 0;
    const prestigeType = s.prestigeType || 'sovereignty';
    const warPenaltyMult = WG_RULES.prestige.warPenalty[prestigeType] || 0;
    const peaceGrowthMult = WG_RULES.prestige.peaceGrowth[prestigeType] || 0;

    for(const act of s.selectedActions){
      const successRate = this.calcSuccessRate(act);
      const roll = Math.floor(Math.random() * 100) + 1;
      let outcome, mult;

      if(roll <= successRate * WG_RULES.greatSuccessMult){
        outcome = 'great'; mult = 1.5;
      } else if(roll <= successRate){
        outcome = 'success'; mult = 1.0;
      } else {
        outcome = 'fail'; mult = WG_RULES.failureMult;
      }

      /* 计算效果 */
      const actualEffects = {};
      for(const d in act.effects){
        actualEffects[d] = Math.round(act.effects[d] * mult);
        playerEffects[d] = (playerEffects[d] || 0) + actualEffects[d];
      }

      /* 失败时的负面效果 */
      if(outcome === 'fail'){
        actualEffects[act.domain] = (actualEffects[act.domain] || 0) - 3;
        playerEffects[act.domain] = (playerEffects[act.domain] || 0) - 3;
      }

      totalEscalation += act.escalation || 0;
      totalDomChange += act.domEffect || 0;

      /* === 声望系统: 区分战争/和平行动 === */
      const repEff = act.repEffect || 0;
      if(isWarAction(act)){
        /* 战争行动: 声望消耗即时结算，按场景类型乘以惩罚倍率 */
        immediateRepChange += Math.round(repEff * warPenaltyMult);
      } else if(isPeaceAction(act)){
        /* 和平行动: 声望增长延迟到下轮，按场景类型乘以增长倍率 */
        deferredRepGain += Math.round(repEff * peaceGrowthMult);
      } else {
        /* 中性行动: 声望变化即时结算，无倍率 */
        if(prestigeType !== 'none'){
          immediateRepChange += repEff;
        }
      }

      /* === 资金系统: 科技研发类行动产生延迟收益 === */
      const fundGrowth = getFundingGrowth(act);
      if(fundGrowth > 0 && outcome !== 'fail'){
        deferredFundGain += Math.round(fundGrowth * (outcome === 'great' ? 1.5 : 1.0));
      }

      playerActionNames.push(act.name);

      diceResults.push({
        action: act,
        roll,
        successRate,
        outcome,
        mult,
        effects: actualEffects,
        isPeace: isPeaceAction(act),
        isWar: isWarAction(act),
        fundGrowth: fundGrowth,
      });
    }

    /* 2. 人工智能选择反制 */
    const primaryCounter = s.selectedActions[s.selectedActions.length - 1].counter;
    const escLevel = WG_RULES.escalationLevels[Math.min(s.escalation - 1, 4)];
    let aiActionId = primaryCounter;
    if(Math.random() < escLevel.aiAggression){
      const allCounters = Object.keys(AI_ACTIONS);
      aiActionId = allCounters[Math.floor(Math.random() * allCounters.length)];
    }
    const aiAction = AI_ACTIONS[aiActionId] || AI_ACTIONS.dip_protest;

    /* 3. 合并AI效果 */
    const aiEffects = { ...aiAction.effects };
    const changes = {};
    for(const d in s.domains){
      const playerDelta = playerEffects[d] || 0;
      const aiDelta = aiEffects[d] || 0;
      let net = playerDelta + aiDelta;
      net = Math.max(-30, Math.min(30, net));
      changes[d] = net;
      s.domains[d] = Math.max(0, Math.min(100, s.domains[d] + net));
    }

    /* 4. 更新升级度 */
    s.escalation = Math.max(1, Math.min(5, s.escalation + totalEscalation));

    /* 5. 更新声望 — 战争行动即时消耗，和平行动延迟增长 */
    s.reputation = Math.max(0, Math.min(100, s.reputation + immediateRepChange));
    s.domesticSupport = Math.max(0, Math.min(100, s.domesticSupport + totalDomChange));
    /* 累积延迟收益（下轮结算） */
    s.pendingRepGain += deferredRepGain;
    s.pendingFundGain += deferredFundGain;

    /* 6. 力量战备变化: 行动消耗 + 成功经验提升 */
    for(const dr of diceResults){
      const forceCode = getActionForce(dr.action);
      if(!forceCode) continue;
      const force = s.forces.find(f => f.code === forceCode);
      if(!force) continue;
      /* 消耗: 高风险-5, 中风险-3, 低风险-1 */
      const consumption = dr.action.risk >= 0.3 ? 5 : dr.action.risk >= 0.15 ? 3 : 1;
      /* 成功有经验提升: 大成功+3, 成功+1 */
      const expBoost = dr.outcome === 'great' ? 3 : dr.outcome === 'success' ? 1 : 0;
      const netChange = expBoost - consumption;
      force.readiness = Math.max(10, Math.min(100, force.readiness + netChange));
    }

    /* 7. 计算双方本轮分值与裁决理由 */
    const playerScore = this._calcPlayerRoundScore(diceResults, playerEffects);
    const aiScore = this._calcAIRoundScore(aiAction, aiEffects, totalEscalation);
    const adjudicationReasoning = this._genAdjudicationReasoning(diceResults, playerEffects, aiEffects, changes, totalEscalation, aiAction);

    /* 8. 记录日志 */
    const logEntry = {
      round: s.round,
      playerActions: playerActionNames,
      aiAction: aiAction.name,
      aiActionDesc: aiAction.desc,
      changes,
      diceResults,
      escalationChange: totalEscalation,
      repChange: immediateRepChange,
      deferredRepGain: deferredRepGain,
      deferredFundGain: deferredFundGain,
      domChange: totalDomChange,
      escalationAfter: s.escalation,
      prestigeType: prestigeType,
      playerEffects: { ...playerEffects },
      aiEffects: { ...aiEffects },
      playerScore,
      aiScore,
      adjudicationReasoning,
    };
    s.log.push(logEntry);
    s.lastAIAction = aiAction;
    s.lastPlayerActions = [...s.selectedActions];
    s.lastChanges = changes;
    s.lastDiceResults = diceResults;

    /* 9. 渲染裁决 */
    this.renderResolution(logEntry);
  },

  /* ===== 下一轮 ===== */
  nextRound(){
    if(this.state.round >= this.state.maxRounds){
      this.endGame();
      return;
    }
    this.state.round++;
    this.state.phase = 'acting';
    this.state.actionPoints = this.state.maxAP;
    this.state.selectedActions = [];
    this.state.selectedSupportActions = [];
    this.state.activeSupportMods = {
      successRateBonus: {},
      forceReadyBoost: {},
      fundCostReduce: 0,
      escalationChange: 0,
      revealEnemy: false,
      enemyDebuff: {},
      extraFunding: 0,
    };
    this.state.lastAIAction = null;
    this.state.lastChanges = null;
    this.state.lastDiceResults = null;

    /* === 周期性结算: 应用上轮延迟收益 === */
    let appliedRepGain = 0;
    let appliedFundGain = 0;

    /* 声望延迟增长 */
    if(this.state.pendingRepGain > 0){
      appliedRepGain = this.state.pendingRepGain;
      this.state.reputation = Math.min(100, this.state.reputation + appliedRepGain);
      this.state.pendingRepGain = 0;
    }
    /* 资金延迟增长（科技研发收益） */
    if(this.state.pendingFundGain > 0){
      appliedFundGain = this.state.pendingFundGain;
      this.state.funding += appliedFundGain;
      this.state.pendingFundGain = 0;
    }
    /* 经济基础收益: 经济域≥50时，资金×3% */
    if(this.state.domains.economic >= 50){
      const baseIncome = Math.round(this.state.funding * WG_RULES.funding.baseGrowthRate);
      this.state.funding += baseIncome;
      appliedFundGain += baseIncome;
    }

    /* 存储本轮结算信息（供UI显示） */
    this.state.lastRoundGains = {
      repGain: appliedRepGain,
      fundGain: appliedFundGain,
    };

    /* 力量战备轮间恢复: +2%/轮 */
    for(const f of this.state.forces){
      f.readiness = Math.min(100, f.readiness + 2);
    }
    /* 情报更新 */
    this.applyIntelModifiers();
    /* 记录力量/情报历史（供复盘报告使用） */
    this.state.forceHistory.push(this.state.forces.map(f => ({...f})));
    this.state.intelHistory.push({...this.state.activeIntelMods});
    /* 生成新一轮导调报告 */
    this.state.directorReport = this._genDirectorReport();
    this.renderWargameView();
  },

  /* ===== 结束推演 ===== */
  endGame(){
    this.state.phase = 'ended';
    const s = this.state;
    const domains = s.domains;
    const avg = Object.values(domains).reduce((a,v) => a + v, 0) / 6;

    /* 各项得分 */
    const domainScore = avg;
    const repScore = s.reputation;
    const domScore = s.domesticSupport;
    const fundingRatio = s.funding / s.maxFunding;
    /* 资金分基准20分 + 实际比率×80，避免全力投入行动时资金分归零 */
    const fundingScore = Math.max(0, Math.min(100, Math.round(20 + Math.max(0, fundingRatio) * 80)));
    const escScore = (6 - s.escalation) * 20; /* 升级度越低分越高 */

    /* 加权总分 */
    const finalScore = Math.round(
      domainScore * WG_RULES.scoring.domains +
      repScore * WG_RULES.scoring.reputation +
      domScore * WG_RULES.scoring.domestic +
      fundingScore * WG_RULES.scoring.funding +
      escScore * WG_RULES.scoring.escalation
    );

    /* 评级 */
    let grade, gradeColor, gradeDesc;
    if(finalScore >= 85){ grade='S'; gradeColor='var(--gold)'; gradeDesc='战略大师级表现'; }
    else if(finalScore >= 75){ grade='A'; gradeColor='var(--green)'; gradeDesc='优秀的战略指挥'; }
    else if(finalScore >= 60){ grade='B'; gradeColor='var(--cyan)'; gradeDesc='合格的应对策略'; }
    else if(finalScore >= 45){ grade='C'; gradeColor='var(--amber)'; gradeDesc='勉强维持态势'; }
    else { grade='D'; gradeColor='var(--red)'; gradeDesc='战略态势严重恶化'; }

    s.finalScore = Math.max(0, Math.min(100, finalScore));
    s.grade = grade;
    s.gradeColor = gradeColor;
    s.gradeDesc = gradeDesc;
    s.scoreBreakdown = { domainScore, repScore, domScore, fundingScore, escScore };

    STATE.games.push({
      scenario: s.scenario.id,
      scenarioName: s.scenario.name,
      score: finalScore,
      date: new Date().toISOString().slice(0,10),
      result: finalScore >= 60 ? '胜利' : '失败',
      rounds: s.round,
      victory: finalScore >= 60,
    });

    /* 推演结果反哺功能区 */
    if(typeof ZoneSystem !== 'undefined'){
      ZoneSystem.applyWargameResults(s.scenario.id, {
        victory: finalScore >= 60,
        domainScores: { ...s.domains },
        scenarioName: s.scenario.name,
        score: finalScore,
      });
    }

    /* === 生态系统同步：推演结果传播到全局状态 === */
    if(typeof GlobalStateSync !== 'undefined'){
      GlobalStateSync.syncWargameResult({
        scenarioId: s.scenario.id,
        scenarioName: s.scenario.name,
        score: finalScore,
        grade: grade,
        domains: { ...s.domains },
        forces: (s.forces || []).map(f => ({
          branch: f.branch, name: f.name, code: f.code,
          readiness: f.readiness,
        })),
        escalation: s.escalation,
        reputation: s.reputation,
        domesticSupport: s.domesticSupport,
        funding: s.funding,
      }, 'wargame');
    }

    this.renderFinalResult();
  },

  restart(){
    this.enter(this.state.scenario);
  },

  /* ================================================================
   * UI 渲染
   * ================================================================ */

  /* ===== 推演主视图 ===== */
  renderWargameView(){
    const main = document.querySelector('.main');
    const tabBar = main.querySelector('.tab-bar');
    if(tabBar) tabBar.style.display = 'none';

    this.state.phase = 'acting';
    const s = this.state;
    const sc = s.scenario;
    const evt = ROUND_EVENTS[Math.min(s.round - 1, ROUND_EVENTS.length - 1)];
    const esc = WG_RULES.escalationLevels[s.escalation - 1];

    const content = document.getElementById('tabContent');
    content.innerHTML = `
      <div class="wg-view fade-in">
        <!-- 推演控制栏 -->
        <div class="wg-topbar">
          <div class="wg-topbar-left">
            <button class="wg-exit" id="wgExit">← 退出</button>
            <div class="wg-scene-name">${esc2(sc.name)}</div>
            <span class="wg-scene-code">${esc2(sc.code)}</span>
            ${s.playerSide ? `
              <div style="display:flex;align-items:center;gap:6px;margin-left:12px">
                <span style="font-size:12px;padding:3px 8px;border-radius:3px;background:${s.playerSide.color}22;color:${s.playerSide.color};border:1px solid ${s.playerSide.color}44">${s.playerSide.icon} ${esc2(s.playerSide.shortName || s.playerSide.name)}</span>
                <span style="font-size:11px;color:var(--txt-2)">对战</span>
                <span style="font-size:12px;padding:3px 8px;border-radius:3px;background:${s.opponentSide ? s.opponentSide.color : '#00b4d8'}22;color:${s.opponentSide ? s.opponentSide.color : '#00b4d8'};border:1px solid ${s.opponentSide ? s.opponentSide.color : '#00b4d8'}44">${s.opponentSide ? s.opponentSide.icon : '⚔️'} ${esc2(s.opponentSide ? (s.opponentSide.shortName || s.opponentSide.name) : '对手方')}</span>
                ${s.gameMode === 'multi' ? '<span style="font-size:12px;padding:3px 8px;border-radius:3px;background:rgba(255,165,2,.08);color:var(--amber);border:1px solid rgba(255,165,2,.2)">🌐 联机</span>' : ''}
              </div>
            ` : ''}
          </div>
          <div class="wg-topbar-center">
            <div class="wg-round-info">
              <span class="wg-round-label">轮次</span>
              <span class="wg-round-num">${s.round}<span class="wg-round-total">/${s.maxRounds}</span></span>
            </div>
            <div class="wg-progress">
              ${Array.from({length:s.maxRounds}, (_,i) =>
                `<div class="wg-pstep ${i < s.round ? 'done' : ''} ${i === s.round - 1 ? 'current' : ''}"></div>`
              ).join('')}
            </div>
          </div>
          <div class="wg-topbar-right">
            <div class="wg-ap-display">
              <span class="wg-ap-label">行动点</span>
              <span class="wg-ap-value">${s.actionPoints}<span class="wg-ap-max">/${s.maxAP}</span></span>
            </div>
            <div class="wg-fund-display">
              <span class="wg-fund-label">💰 资金</span>
              <span class="wg-fund-value">${s.funding}<span class="wg-fund-unit">亿</span></span>
            </div>
          </div>
        </div>

        <!-- 资源条 -->
        <div class="wg-resource-bar">
          <div class="wg-res-item">
            <span class="wg-res-icon">🌍</span>
            <div class="wg-res-info">
              <span class="wg-res-label">国际声望 ${s.prestigeType === 'none' ? '<span style="color:var(--txt-3);font-size:11px">(非国家行为体不适用)</span>' : s.prestigeType === 'sovereignty' ? '<span style="color:var(--cyan);font-size:11px">[维护主权]</span>' : s.prestigeType === 'tech' ? '<span style="color:var(--cyan);font-size:11px">[科技竞争]</span>' : '<span style="color:var(--amber);font-size:11px">[侵略行动]</span>'}</span>
              <div class="wg-res-bar-wrap">
                <div class="wg-res-bar-fill" style="width:${s.reputation}%;background:linear-gradient(90deg,var(--green-dim),var(--green))"></div>
              </div>
            </div>
            <span class="wg-res-val" style="color:var(--green)">${s.reputation}</span>
            ${s.pendingRepGain > 0 ? `<span class="wg-res-pending" style="color:var(--green)">+${s.pendingRepGain}(下轮)</span>` : ''}
          </div>
          <div class="wg-res-item">
            <span class="wg-res-icon">🏠</span>
            <div class="wg-res-info">
              <span class="wg-res-label">${s.prestigeType === 'none' ? '组织凝聚力' : '国内支持'}</span>
              <div class="wg-res-bar-wrap">
                <div class="wg-res-bar-fill" style="width:${s.domesticSupport}%;background:linear-gradient(90deg,var(--purple-dim),var(--purple))"></div>
              </div>
            </div>
            <span class="wg-res-val" style="color:var(--purple)">${s.domesticSupport}</span>
          </div>
          <div class="wg-res-item">
            <span class="wg-res-icon">💰</span>
            <div class="wg-res-info">
              <span class="wg-res-label">资金</span>
              <div class="wg-res-bar-wrap">
                <div class="wg-res-bar-fill" style="width:${Math.min(100, s.funding / s.maxFunding * 100)}%;background:linear-gradient(90deg,var(--amber-dim),var(--amber))"></div>
              </div>
            </div>
            <span class="wg-res-val" style="color:var(--amber)">${s.funding}亿</span>
            ${s.pendingFundGain > 0 ? `<span class="wg-res-pending" style="color:var(--amber)">+${s.pendingFundGain}(下轮)</span>` : ''}
          </div>
          <div class="wg-res-item">
            <span class="wg-res-icon">⚠️</span>
            <div class="wg-res-info">
              <span class="wg-res-label">升级度</span>
              <div class="wg-res-bar-wrap">
                ${Array.from({length:5}, (_,i) =>
                  `<div class="wg-esc-bar ${i < s.escalation ? 'active' : ''}" style="background:${i < s.escalation ? (s.escalation >= 4 ? 'var(--red)' : s.escalation >= 3 ? 'var(--amber)' : 'var(--cyan)') : ''}"></div>`
                ).join('')}
              </div>
            </div>
            <span class="wg-res-val" style="color:${s.escalation >= 4 ? 'var(--red)' : s.escalation >= 3 ? 'var(--amber)' : 'var(--cyan)'}">${esc.name}</span>
          </div>
        </div>

        <!-- 推演主体 -->
        <div class="wg-body">
          <!-- 导调员态势评估报告 -->
          ${this._renderDirectorReport()}

          <!-- 左栏 -->
          <div class="wg-left">
            <!-- 轮次简报 -->
            <div class="wg-briefing">
              <div class="wg-briefing-head">
                <span class="wg-evt-icon">📡</span>
                <span class="wg-evt-title">第${s.round}轮 · ${evt.title}</span>
              </div>
              <div class="wg-briefing-text">${evt.desc}</div>
              ${s.lastRoundGains && (s.lastRoundGains.repGain > 0 || s.lastRoundGains.fundGain > 0) ? `
                <div class="wg-round-gains">
                  <span class="wg-rg-label">📊 周期性结算：</span>
                  ${s.lastRoundGains.repGain > 0 ? `<span class="wg-rg-item pos">声望 +${s.lastRoundGains.repGain}</span>` : ''}
                  ${s.lastRoundGains.fundGain > 0 ? `<span class="wg-rg-item pos">资金 +${s.lastRoundGains.fundGain}亿</span>` : ''}
                </div>
              ` : ''}
              ${s.lastAIAction ? `
                <div class="wg-last-ai">
                  <span class="wg-last-ai-label">${s.opponentSide ? esc2(s.opponentSide.shortName || s.opponentSide.name) : '敌方'}上轮行动：</span>
                  <span class="wg-last-ai-name">${esc2(s.lastAIAction.name)}</span>
                  <span class="wg-last-ai-desc">${esc2(s.lastAIAction.desc)}</span>
                </div>
              ` : ''}
            </div>

            <!-- 支援行动选择 (一体化融合) -->
            <div class="wg-support-section">
              <div class="wg-section-head wg-support-head">
                <span>🎖️ 功能区支援行动</span>
                <span class="wg-hint">消耗AP · 提升后续战略行动效果 · 与战略行动竞争同一AP池</span>
              </div>
              <div class="wg-support-grid" id="wgSupportGrid">
                ${this.renderSupportActionCards()}
              </div>
              ${this.state.activeSupportMods && (Object.keys(this.state.activeSupportMods.successRateBonus).length > 0 || this.state.activeSupportMods.revealEnemy || this.state.activeSupportMods.fundCostReduce > 0) ? `
                <div class="wg-sup-active-mods">
                  <span class="wg-sam-label">当前支援效果:</span>
                  ${Object.entries(this.state.activeSupportMods.successRateBonus).map(([d,v]) => {
                    const dm = WG_DOMAINS.find(w => w.id === d);
                    return `<span class="wg-sam-mod pos">${dm ? dm.icon : '🌐'} +${v}%</span>`;
                  }).join('')}
                  ${this.state.activeSupportMods.revealEnemy ? '<span class="wg-sam-mod pos">👁️ 已揭示敌方</span>' : ''}
                  ${this.state.activeSupportMods.fundCostReduce > 0 ? `<span class="wg-sam-mod pos">💰 消耗-${Math.round(this.state.activeSupportMods.fundCostReduce*100)}%</span>` : ''}
                  ${this.state.activeSupportMods.escalationChange < 0 ? `<span class="wg-sam-mod pos">⚠️ 升级${this.state.activeSupportMods.escalationChange}</span>` : ''}
                </div>
              ` : ''}
            </div>

            <!-- 行动选择 -->
            <div class="wg-actions-section">
              <div class="wg-section-head">
                <span>${s.playerSide ? esc2(s.playerSide.shortName || s.playerSide.name) + ' · ' : ''}战略行动选择</span>
                <span class="wg-hint">消耗行动点+资金 · 可多选</span>
              </div>
              <div class="wg-actions-grid" id="wgActionsGrid">
                ${this.renderActionCards()}
              </div>
            </div>

            <!-- 确认 -->
            <div class="wg-confirm-bar">
              <span class="wg-selected-count">已选 ${s.selectedActions.length} 项</span>
              <button class="btn wg-confirm-btn" id="wgConfirm" ${s.selectedActions.length === 0 ? 'disabled' : ''}>
                ▶ 确认行动 · 进入裁决
              </button>
            </div>
          </div>

          <!-- 右栏 -->
          <div class="wg-right">
            <!-- 六域态势 -->
            <div class="wg-panel">
              <div class="wg-panel-head">
                <span class="wg-panel-title">六域态势</span>
                <span class="wg-panel-sub">实时</span>
              </div>
              <div class="wg-domains">
                ${WG_DOMAINS.map(d => this.renderDomainBar(d)).join('')}
              </div>
            </div>

            <!-- 力量战备 -->
            <div class="wg-panel">
              <div class="wg-panel-head">
                <span class="wg-panel-title">⚔️ 力量战备</span>
                <span class="wg-panel-sub">${s.forces.length}军种</span>
              </div>
              <div class="wg-forces-list">
                ${s.forces.map(f => this.renderForceRow(f)).join('')}
              </div>
            </div>

            <!-- 情报修正 -->
            <div class="wg-panel wg-intel-panel">
              <div class="wg-panel-head">
                <span class="wg-panel-title">🔍 情报修正</span>
                <span class="wg-panel-sub">${Object.keys(s.activeIntelMods).length}项</span>
              </div>
              <div class="wg-intel-list">
                ${Object.keys(s.activeIntelMods).length === 0
                  ? '<div class="wg-log-empty">暂无情报修正</div>'
                  : Object.entries(s.activeIntelMods).map(([d, b]) => {
                    const dm = WG_DOMAINS.find(w => w.id === d) || DOMAIN_MAP[d];
                    return `<div class="wg-intel-mod">
                      <span style="color:${dm.color}">${dm.icon} ${dm.name}</span>
                      <span class="wg-intel-bonus ${b > 0 ? 'pos' : 'neg'}">${b > 0 ? '+' : ''}${b}%</span>
                    </div>`;
                  }).join('')
                }
              </div>
            </div>

            <!-- 功能区战场支援 -->
            <div class="wg-panel wg-zone-support-panel">
              <div class="wg-panel-head">
                <span class="wg-panel-title">🎖️ 功能区支援</span>
                <span class="wg-panel-sub">${this._getZoneSupportSummary()}</span>
              </div>
              ${this._renderZoneSupportPanel()}
            </div>

            <!-- 推演日志 -->
            <div class="wg-panel wg-log-panel">
              <div class="wg-panel-head">
                <span class="wg-panel-title">推演日志</span>
                <span class="wg-panel-sub">${s.log.length}条</span>
              </div>
              <div class="wg-log-list" id="wgLogList">
                ${s.log.length === 0
                  ? '<div class="wg-log-empty">暂无推演记录</div>'
                  : s.log.map(l => this.renderLogEntry(l)).join('')
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('wgExit').addEventListener('click', () => this.exit());
    document.getElementById('wgConfirm').addEventListener('click', () => this.confirmActions());
    /* 导调报告折叠/展开 */
    const drHead = document.getElementById('wgDrHead');
    if(drHead){
      drHead.addEventListener('click', () => {
        const body = document.getElementById('wgDrBody');
        const toggle = document.getElementById('wgDrToggle');
        if(body.style.display === 'none'){
          body.style.display = '';
          toggle.textContent = '收起 ▲';
        } else {
          body.style.display = 'none';
          toggle.textContent = '展开 ▼';
        }
      });
    }
    document.querySelectorAll('[data-action]').forEach(el => {
      el.addEventListener('click', () => this.toggleAction(el.getAttribute('data-action')));
    });
    document.querySelectorAll('[data-support-action]').forEach(el => {
      el.addEventListener('click', () => this.toggleSupportAction(el.getAttribute('data-support-action')));
    });
    document.querySelectorAll('[data-zone-support]').forEach(el => {
      el.addEventListener('click', () => this._callZoneSupport(el.getAttribute('data-zone-support')));
    });
  },

  /* ===== 功能区支援面板辅助方法 ===== */
  _getZoneSupportSummary(){
    if(typeof ZoneSystem === 'undefined' || !ZoneSystem._supportUsed) return '';
    const used = Object.keys(ZoneSystem._supportUsed).length;
    const total = 6; /* intel/command/logistics/economy/tech/training */
    return `${total - used}/${total}可用`;
  },

  _renderZoneSupportPanel(){
    const s = this.state;
    if(typeof ZoneSystem === 'undefined'){
      return '<div class="wg-log-empty">功能区系统未加载</div>';
    }

    const supportZones = ['intel','command','logistics','economy','tech','training'];
    let html = '';

    /* 1. 已激活的推演前加成 */
    if(s.zoneBonuses && s.zoneBonuses.sources && s.zoneBonuses.sources.length > 0){
      html += '<div class="wg-zs-bonuses">';
      html += '<div class="wg-zs-bonus-head">📋 已激活加成（推演前准备）</div>';
      html += '<div class="wg-zs-bonus-list">';
      s.zoneBonuses.sources.slice(0, 6).forEach(src => {
        const cfg = ZONE_CONFIG[src.zone];
        const color = cfg ? cfg.color : 'var(--cyan)';
        const icon = cfg ? cfg.icon : '🎖️';
        html += `<div class="wg-zs-bonus-item" title="${esc2(src.bonus)}">
          <span style="color:${color}">${icon}</span>
          <span class="wg-zs-bonus-text">${esc2(src.action)}</span>
        </div>`;
      });
      if(s.zoneBonuses.sources.length > 6){
        html += `<div class="wg-zs-bonus-more">+${s.zoneBonuses.sources.length - 6}项</div>`;
      }
      html += '</div></div>';
    }

    /* 2. 功能区支援按钮 */
    html += '<div class="wg-zs-support-grid">';
    supportZones.forEach(zid => {
      const cfg = ZONE_CONFIG[zid];
      const st = ZoneSystem._state ? ZoneSystem._state[zid] : null;
      if(!cfg || !st) return;

      const used = ZoneSystem._supportUsed && ZoneSystem._supportUsed[zid];
      const readiness = st.readiness || 0;
      const canSupport = !used && readiness >= 40;

      const supportDescs = {
        intel: '揭示情报卡',
        command: '军事+8%',
        logistics: '+1行动点',
        economy: '+500亿',
        tech: '网络防御+10',
        training: '全域+5%',
      };

      const cls = used ? 'used' : canSupport ? 'available' : 'locked';
      const label = used ? '已使用' : canSupport ? '呼叫' : `战备${readiness}`;
      html += `<div class="wg-zs-card ${cls}" ${canSupport ? `data-zone-support="${zid}"` : ''}>
        <div class="wg-zs-card-top">
          <span class="wg-zs-icon">${cfg.icon}</span>
          <span class="wg-zs-name">${cfg.short}</span>
        </div>
        <div class="wg-zs-desc">${supportDescs[zid] || '支援'}</div>
        <div class="wg-zs-status">
          <span class="wg-zs-ready-bar">
            <span class="wg-zs-ready-fill" style="width:${readiness}%;background:${readiness >= 40 ? cfg.color : 'var(--red)'}"></span>
          </span>
          <span class="wg-zs-btn ${cls}">${label}</span>
        </div>
      </div>`;
    });
    html += '</div>';

    /* 3. 使用提示 */
    html += '<div class="wg-zs-hint">💡 每个功能区整场推演可提供一次战场支援，需战备度≥40%</div>';

    return html;
  },

  _callZoneSupport(zoneId){
    if(typeof ZoneSystem === 'undefined') return;
    const result = ZoneSystem.callZoneSupport(zoneId);
    if(!result.ok){
      this._flashSupportMsg(result.msg, 'error');
      return;
    }

    /* 应用支援效果到推演状态 */
    const s = result.support;
    if(s.type === 'extra_ap'){
      this.state.actionPoints += s.value;
      this.state.maxAP = Math.max(this.state.maxAP, this.state.actionPoints);
    } else if(s.type === 'extra_funding'){
      this.state.funding += s.value;
    } else if(s.type === 'success_boost'){
      if(!this.state.zoneBonuses) this.state.zoneBonuses = {};
      if(!this.state.zoneBonuses.successRate) this.state.zoneBonuses.successRate = {};
      if(s.domain){
        this.state.zoneBonuses.successRate[s.domain] = (this.state.zoneBonuses.successRate[s.domain]||0) + s.value;
      } else {
        /* 全域加成 */
        ['military','economic','cyber','diplomatic','information','domestic'].forEach(d => {
          this.state.zoneBonuses.successRate[d] = (this.state.zoneBonuses.successRate[d]||0) + s.value;
        });
      }
    } else if(s.type === 'defense_boost'){
      if(!this.state.zoneBonuses) this.state.zoneBonuses = {};
      if(!this.state.zoneBonuses.defense) this.state.zoneBonuses.defense = {};
      this.state.zoneBonuses.defense[s.domain] = (this.state.zoneBonuses.defense[s.domain]||0) + s.value;
    } else if(s.type === 'reveal_intel'){
      /* 揭示一张情报卡 */
      this.state.intel.push({
        source:'ZONE_SUPPORT', type:'cyber', reliability:'A',
        title:'战场情报支援', summary:'由功能区实时支援提供的情报',
        modifier:{ domain:'cyber', bonus:3 },
      });
      this.applyIntelModifiers();
    }

    this.state.log.push({
      type:'support',
      text:`🎖️ ${ZONE_CONFIG[zoneId].name}支援：${result.msg}`,
      round: this.state.round,
    });

    this._flashSupportMsg(result.msg, 'success');
    this.renderWargameView();
  },

  _flashSupportMsg(msg, type){
    const color = type==='error' ? 'var(--red)' : 'var(--green)';
    const div = document.createElement('div');
    div.style.cssText = `position:fixed;top:80px;right:40px;padding:10px 20px;background:rgba(13,20,36,.95);border:1px solid ${color};border-radius:6px;color:${color};font-size:13px;z-index:9999;animation:fadeIn .3s`;
    div.textContent = msg;
    document.body.appendChild(div);
    setTimeout(() => { div.style.opacity='0'; div.style.transition='opacity .3s'; }, 1500);
    setTimeout(() => div.remove(), 2000);
  },

  /* ===== 行动卡片 ===== */
  renderActionCards(){
    const actions = this.getAvailableActions();
    const grouped = {};
    for(const a of actions){
      if(!grouped[a.domain]) grouped[a.domain] = [];
      grouped[a.domain].push(a);
    }

    let html = '';
    /* 先渲染场景专属行动 */
    const specialActions = actions.filter(a => a.scenario !== null);
    if(specialActions.length > 0){
      html += `<div class="wg-domain-group">
        <div class="wg-dg-head" style="color:var(--gold)">⭐ 场景专属行动</div>
        <div class="wg-dg-actions">
          ${specialActions.map(a => this.renderActionCard(a)).join('')}
        </div>
      </div>`;
    }

    /* 通用行动按域分组 */
    for(const d of WG_DOMAINS){
      const general = (grouped[d.id] || []).filter(a => a.scenario === null);
      if(general.length === 0) continue;
      html += `<div class="wg-domain-group">
        <div class="wg-dg-head" style="color:${d.color}">${d.icon} ${d.name}域</div>
        <div class="wg-dg-actions">
          ${general.map(a => this.renderActionCard(a)).join('')}
        </div>
      </div>`;
    }
    return html;
  },

  /* ===== 支援行动卡片渲染 ===== */
  renderSupportActionCards(){
    const actions = this.getAvailableSupportActions();
    if(actions.length === 0) return '<div class="wg-log-empty">本场景无可用支援行动</div>';
    const grouped = {};
    for(const a of actions){
      if(!grouped[a.category]) grouped[a.category] = [];
      grouped[a.category].push(a);
    }
    let html = '';
    for(const cat of SUPPORT_CATEGORIES){
      const catActions = grouped[cat.id] || [];
      if(catActions.length === 0) continue;
      html += `<div class="wg-sup-group">
        <div class="wg-sg-head" style="color:${cat.color}">${cat.icon} ${cat.name}<span class="wg-sg-desc">${cat.desc}</span></div>
        <div class="wg-sg-actions">
          ${catActions.map(a => this.renderSupportCard(a, cat)).join('')}
        </div>
      </div>`;
    }
    return html;
  },

  renderSupportCard(a, cat){
    const selected = this.state.selectedSupportActions.find(s => s.id === a.id);
    const canAffordAP = this.state.actionPoints >= a.cost || selected;
    const canAffordFund = this.state.funding >= a.fundingCost || selected;
    const canAfford = canAffordAP && canAffordFund;
    const successRate = this.calcSupportSuccessRate(a);
    const riskLabel = a.risk >= 0.3 ? '高风险' : a.risk >= 0.15 ? '中风险' : '低风险';
    const riskColor = a.risk >= 0.3 ? 'var(--red)' : a.risk >= 0.15 ? 'var(--amber)' : 'var(--green)';
    const se = a.supportEffects || {};
    let effectBadges = '';
    if(se.successRateBonus){
      for(const [dom, val] of Object.entries(se.successRateBonus)){
        const dm = WG_DOMAINS.find(d => d.id === dom);
        effectBadges += `<span class="wg-sup-eff pos">${dm ? dm.icon : '🌐'} 成功率+${val}%</span>`;
      }
    }
    if(se.forceReadyBoost){
      const codes = Object.keys(se.forceReadyBoost);
      const total = codes.reduce((s,c) => s + se.forceReadyBoost[c], 0);
      effectBadges += `<span class="wg-sup-eff pos">⚔️ 战备+${total}</span>`;
    }
    if(se.fundCostReduce) effectBadges += `<span class="wg-sup-eff pos">💰 消耗-${Math.round(se.fundCostReduce*100)}%</span>`;
    if(se.extraFunding) effectBadges += `<span class="wg-sup-eff pos">💰 +${se.extraFunding}亿</span>`;
    if(se.escalationChange) effectBadges += `<span class="wg-sup-eff ${se.escalationChange < 0 ? 'pos' : 'neg'}">⚠️ ${se.escalationChange > 0 ? '+' : ''}${se.escalationChange}</span>`;
    if(se.revealEnemy) effectBadges += `<span class="wg-sup-eff pos">👁️ 揭示敌方</span>`;
    if(se.enemyDebuff){
      for(const [dom, val] of Object.entries(se.enemyDebuff)){
        const dm = WG_DOMAINS.find(d => d.id === dom);
        effectBadges += `<span class="wg-sup-eff neg">${dm ? dm.icon : '🌐'} 敌${val}</span>`;
      }
    }

    return `
      <div class="wg-sup-card ${selected ? 'selected' : ''} ${!canAfford ? 'disabled' : ''}" data-support-action="${a.id}">
        <div class="wg-sup-head">
          <span class="wg-sup-name">${esc2(a.name)}</span>
          <div class="wg-sup-costs">
            <span class="wg-ac-cost">${a.cost}AP</span>
            ${a.fundingCost > 0 ? `<span class="wg-ac-fund">💰${a.fundingCost}</span>` : ''}
          </div>
        </div>
        <div class="wg-ac-desc">${esc2(a.desc)}</div>
        <div class="wg-sup-footer">
          <span class="wg-ac-risk" style="color:${riskColor}">${riskLabel}</span>
          <span class="wg-ac-success">成功率 ${successRate}%</span>
        </div>
        <div class="wg-sup-effects">${effectBadges}</div>
      </div>
    `;
  },

  renderActionCard(a){
    const selected = this.state.selectedActions.find(s => s.id === a.id);
    const canAffordAP = this.state.actionPoints >= a.cost || selected;
    const canAffordFund = this.state.funding >= a.fundingCost || selected;
    /* 力量战备门槛检查 */
    const forceCode = getActionForce(a);
    const force = forceCode ? this.state.forces.find(f => f.code === forceCode) : null;
    const forceLow = force && force.readiness < 30;
    const canAfford = canAffordAP && canAffordFund && !forceLow;
    const successRate = this.calcSuccessRate(a);
    const riskLabel = a.risk >= 0.4 ? '高风险' : a.risk >= 0.2 ? '中风险' : '低风险';
    const riskColor = a.risk >= 0.4 ? 'var(--red)' : a.risk >= 0.2 ? 'var(--amber)' : 'var(--green)';
    const escLabel = a.escalation > 0 ? `+${a.escalation}⚠` : a.escalation < 0 ? `${a.escalation}⚠` : '';

    /* 行动类型标记: 战争/和平/科技 */
    const actTypeBadge = isWarAction(a)
      ? '<span class="wg-ac-type war">战争</span>'
      : isPeaceAction(a)
      ? '<span class="wg-ac-type peace">和平</span>'
      : '<span class="wg-ac-type normal">常规</span>';

    /* 资金收益标记 */
    const fundGrowth = getFundingGrowth(a);
    const fundGrowthBadge = fundGrowth > 0
      ? `<span class="wg-ac-type growth">💰+${fundGrowth}(下轮)</span>`
      : '';

    /* 声望效果标记（根据声望类型显示不同提示） */
    let repEffectLabel = '';
    if(a.repEffect !== 0){
      const pType = this.state.prestigeType || 'sovereignty';
      if(pType === 'none'){
        repEffectLabel = '<span class="wg-ac-eff" style="color:var(--txt-3)">🌍 声望(不适用)</span>';
      } else if(isWarAction(a)){
        const penalty = WG_RULES.prestige.warPenalty[pType] || 1;
        const actualRep = Math.round(a.repEffect * penalty);
        repEffectLabel = `<span class="wg-ac-eff ${actualRep > 0 ? 'pos' : 'neg'}">🌍 ${actualRep > 0 ? '+' : ''}${actualRep}${penalty !== 1 ? `×${penalty}` : ''}</span>`;
      } else if(isPeaceAction(a)){
        const mult = WG_RULES.prestige.peaceGrowth[pType] || 1;
        const actualRep = Math.round(a.repEffect * mult);
        repEffectLabel = `<span class="wg-ac-eff ${actualRep > 0 ? 'pos' : 'neg'}">🌍 +${actualRep}(下轮)</span>`;
      } else {
        repEffectLabel = `<span class="wg-ac-eff ${a.repEffect > 0 ? 'pos' : 'neg'}">🌍 ${a.repEffect > 0 ? '+' : ''}${a.repEffect}</span>`;
      }
    }

    /* 力量依赖信息 */
    let forceInfo = '';
    if(force){
      const fColor = force.readiness >= 70 ? 'var(--green)' : force.readiness >= 50 ? 'var(--cyan)' : force.readiness >= 30 ? 'var(--amber)' : 'var(--red)';
      const fMod = Math.round((force.readiness - 50) * WG_RULES.forceModRate);
      const fModStr = fMod > 0 ? `+${fMod}` : `${fMod}`;
      forceInfo = `<span class="wg-ac-force" style="color:${fColor}">${force.icon}${force.code} ${force.readiness}%<span class="wg-ac-fmod ${fMod > 0 ? 'pos' : 'neg'}">${fModStr}</span></span>`;
    }

    return `
      <div class="wg-action-card ${selected ? 'selected' : ''} ${!canAfford ? 'disabled' : ''}"
           data-action="${a.id}">
        <div class="wg-ac-head">
          <span class="wg-ac-name">${esc2(a.name)}</span>
          <div class="wg-ac-costs">
            <span class="wg-ac-cost">${a.cost}AP</span>
            <span class="wg-ac-fund">💰${a.fundingCost}</span>
          </div>
        </div>
        <div class="wg-ac-desc">${esc2(a.desc)}</div>
        <div class="wg-ac-badges">${actTypeBadge} ${fundGrowthBadge}</div>
        <div class="wg-ac-footer">
          <span class="wg-ac-risk" style="color:${riskColor}">${riskLabel}</span>
          ${forceInfo}
          <span class="wg-ac-success">成功率 ${successRate}%</span>
          ${escLabel ? `<span class="wg-ac-esc">${escLabel}</span>` : ''}
        </div>
        ${forceLow ? '<div class="wg-ac-force-warn">⚠ 战备不足，无法执行</div>' : ''}
        <div class="wg-ac-effects">
          ${Object.entries(a.effects).filter(([k,v]) => v !== 0).map(([k,v]) => {
            const dm = WG_DOMAINS.find(d => d.id === k);
            const sign = v > 0 ? '+' : '';
            const cls = v > 0 ? 'pos' : 'neg';
            return `<span class="wg-ac-eff ${cls}">${dm ? dm.icon : ''} ${sign}${v}</span>`;
          }).join('')}
          ${repEffectLabel}
          ${a.domEffect !== 0 ? `<span class="wg-ac-eff ${a.domEffect > 0 ? 'pos' : 'neg'}">🏠 ${a.domEffect > 0 ? '+' : ''}${a.domEffect}</span>` : ''}
        </div>
      </div>
    `;
  },

  /* ===== 域状态条 ===== */
  renderDomainBar(d){
    const val = this.state.domains[d.id];
    const pct = Math.max(0, Math.min(100, val));
    let status, statusColor;
    if(val >= 70){ status='优势'; statusColor='var(--green)'; }
    else if(val >= 50){ status='稳定'; statusColor='var(--cyan)'; }
    else if(val >= 30){ status='承压'; statusColor='var(--amber)'; }
    else { status='危机'; statusColor='var(--red)'; }
    const gradient = val >= 70 ? 'linear-gradient(90deg,var(--green-dim),var(--green))'
                   : val >= 50 ? 'linear-gradient(90deg,var(--cyan-dim),var(--cyan))'
                   : val >= 30 ? 'linear-gradient(90deg,var(--amber-dim),var(--amber))'
                   : 'linear-gradient(90deg,var(--red-dim),var(--red))';
    const change = this.state.lastChanges ? this.state.lastChanges[d.id] : 0;
    const changeStr = change !== 0
      ? `<span class="wg-dm-change ${change > 0 ? 'pos' : 'neg'}">${change > 0 ? '+' : ''}${change}</span>`
      : '';
    return `
      <div class="wg-domain-row">
        <div class="wg-dm-head">
          <span class="wg-dm-name" style="color:${d.color}">${d.icon} ${d.name}</span>
          <span class="wg-dm-val" style="color:${statusColor}">${val} <span class="wg-dm-status">${status}</span></span>
        </div>
        <div class="wg-dm-bar"><div class="wg-dm-fill" style="width:${pct}%;background:${gradient}"></div></div>
        <div class="wg-dm-info">
          <span class="wg-dm-pct">${pct}%</span>
          ${changeStr}
        </div>
      </div>
    `;
  },

  /* ===== 力量战备行 ===== */
  renderForceRow(f){
    const pct = Math.max(0, Math.min(100, f.readiness));
    const color = f.readiness >= 85 ? 'var(--green)' : f.readiness >= 70 ? 'var(--cyan)' : f.readiness >= 55 ? 'var(--amber)' : 'var(--red)';
    const gradient = f.readiness >= 85 ? 'linear-gradient(90deg,var(--green-dim),var(--green))'
                   : f.readiness >= 70 ? 'linear-gradient(90deg,var(--cyan-dim),var(--cyan))'
                   : f.readiness >= 55 ? 'linear-gradient(90deg,var(--amber-dim),var(--amber))'
                   : 'linear-gradient(90deg,var(--red-dim),var(--red))';
    return `
      <div class="wg-force-row">
        <span class="wg-fr-icon">${f.icon}</span>
        <span class="wg-fr-name">${esc2(f.branch)}</span>
        <div class="wg-fr-bar"><div class="wg-fr-fill" style="width:${pct}%;background:${gradient}"></div></div>
        <span class="wg-fr-val" style="color:${color}">${f.readiness}</span>
      </div>
    `;
  },

  /* ===== 日志条目 ===== */
  renderLogEntry(l){
    const s = this.state;
    const pName = (s && s.playerSide) ? esc2(s.playerSide.shortName || s.playerSide.name) : '我方';
    const oName = (s && s.opponentSide) ? esc2(s.opponentSide.shortName || s.opponentSide.name) : '对手方';
    /* 系统/支援类日志 — 简洁文本渲染 */
    if(l.type === 'system' || l.type === 'support'){
      const icon = l.type === 'support' ? '🎖️' : '📋';
      return `
        <div class="wg-log-item wg-log-system">
          <div class="wg-log-round">${l.round != null ? '第'+l.round+'轮' : ''}</div>
          <div class="wg-log-body">
            <div class="wg-log-sys-text" style="color:var(--cyan);font-size:12px">${icon} ${esc2(l.text)}</div>
          </div>
        </div>
      `;
    }
    /* 行动类日志 — 完整详情渲染 */
    return `
      <div class="wg-log-item">
        <div class="wg-log-round">第${l.round}轮</div>
        <div class="wg-log-body">
          <div class="wg-log-player">
            <span class="wg-log-label">${pName}：</span>
            ${(l.playerActions || []).map(a => `<span class="wg-log-tag pos">${esc2(a)}</span>`).join('')}
          </div>
          <div class="wg-log-ai">
            <span class="wg-log-label">${oName}：</span>
            <span class="wg-log-tag neg">${esc2(l.aiAction || '—')}</span>
          </div>
          ${l.diceResults ? `
            <div class="wg-log-dice">
              ${l.diceResults.map(dr => {
                const cls = dr.outcome === 'great' ? 'great' : dr.outcome === 'success' ? 'pos' : 'neg';
                const label = dr.outcome === 'great' ? '大成功' : dr.outcome === 'success' ? '成功' : '失败';
                return `<span class="wg-dice-tag ${cls}">${esc2(dr.action.name)}: 🎲${dr.roll}/${dr.successRate} ${label}</span>`;
              }).join('')}
            </div>
          ` : ''}
          <div class="wg-log-changes">
            ${l.changes ? Object.entries(l.changes).filter(([k,v]) => v !== 0).map(([k,v]) => {
              const dm = WG_DOMAINS.find(d => d.id === k);
              const sign = v > 0 ? '+' : '';
              const cls = v > 0 ? 'pos' : 'neg';
              return `<span class="wg-log-chg ${cls}">${dm ? dm.icon : ''} ${sign}${v}</span>`;
            }).join('') : ''}
            ${l.repChange ? `<span class="wg-log-chg ${l.repChange > 0 ? 'pos' : 'neg'}">🌍 ${l.repChange > 0 ? '+' : ''}${l.repChange}(即时)</span>` : ''}
            ${l.deferredRepGain ? `<span class="wg-log-chg pos">🌍 +${l.deferredRepGain}(下轮)</span>` : ''}
            ${l.deferredFundGain ? `<span class="wg-log-chg pos">💰 +${l.deferredFundGain}(下轮)</span>` : ''}
            ${l.domChange ? `<span class="wg-log-chg ${l.domChange > 0 ? 'pos' : 'neg'}">🏠 ${l.domChange > 0 ? '+' : ''}${l.domChange}</span>` : ''}
          </div>
          ${l.playerScore != null ? `
            <div class="wg-log-scores">
              <span class="wg-log-score player">${pName} ${l.playerScore}</span>
              <span class="wg-log-score-sep">:</span>
              <span class="wg-log-score enemy">${oName} ${l.aiScore}</span>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  },

  /* ===== 更新行动面板 ===== */
  updateActionPanel(){
    const apEl = document.querySelector('.wg-ap-value');
    if(apEl) apEl.innerHTML = `${this.state.actionPoints}<span class="wg-ap-max">/${this.state.maxAP}</span>`;
    const fundEl = document.querySelector('.wg-fund-value');
    if(fundEl) fundEl.innerHTML = `${this.state.funding}<span class="wg-fund-unit">亿</span>`;
    const cntEl = document.querySelector('.wg-selected-count');
    if(cntEl) cntEl.textContent = `已选 ${this.state.selectedActions.length + this.state.selectedSupportActions.length} 项`;
    const confirmBtn = document.getElementById('wgConfirm');
    if(confirmBtn) confirmBtn.disabled = this.state.selectedActions.length === 0 && this.state.selectedSupportActions.length === 0;

    /* 更新战略行动卡片 */
    document.querySelectorAll('[data-action]').forEach(el => {
      const actionId = el.getAttribute('data-action');
      const action = STRATEGIC_ACTIONS.find(a => a.id === actionId);
      if(!action) return;
      const isSelected = this.state.selectedActions.find(s => s.id === actionId);
      const canAffordAP = this.state.actionPoints >= action.cost || isSelected;
      const canAffordFund = this.state.funding >= action.fundingCost || isSelected;
      const forceCode = getActionForce(action);
      const force = forceCode ? this.state.forces.find(f => f.code === forceCode) : null;
      const forceOk = !force || force.readiness >= 30;
      el.classList.toggle('selected', !!isSelected);
      el.classList.toggle('disabled', !(canAffordAP && canAffordFund && forceOk));
      /* 更新成功率显示 (受支援行动影响) */
      const successEl = el.querySelector('.wg-ac-success');
      if(successEl){
        const newRate = this.calcSuccessRate(action);
        successEl.textContent = `成功率 ${newRate}%`;
      }
    });

    /* 更新支援行动卡片 */
    document.querySelectorAll('[data-support-action]').forEach(el => {
      const actionId = el.getAttribute('data-support-action');
      const action = SUPPORT_ACTIONS.find(a => a.id === actionId);
      if(!action) return;
      const isSelected = this.state.selectedSupportActions.find(s => s.id === actionId);
      const canAffordAP = this.state.actionPoints >= action.cost || isSelected;
      const canAffordFund = this.state.funding >= action.fundingCost || isSelected;
      el.classList.toggle('selected', !!isSelected);
      el.classList.toggle('disabled', !(canAffordAP && canAffordFund));
    });

    /* 更新支援效果面板 */
    const samEl = document.querySelector('.wg-sup-active-mods');
    if(samEl){
      const sm = this.state.activeSupportMods;
      const hasMods = Object.keys(sm.successRateBonus).length > 0 || sm.revealEnemy || sm.fundCostReduce > 0 || sm.escalationChange < 0;
      if(hasMods){
        let modsHtml = '<span class="wg-sam-label">当前支援效果:</span>';
        for(const [d, v] of Object.entries(sm.successRateBonus)){
          const dm = WG_DOMAINS.find(w => w.id === d);
          modsHtml += `<span class="wg-sam-mod pos">${dm ? dm.icon : '🌐'} +${v}%</span>`;
        }
        if(sm.revealEnemy) modsHtml += '<span class="wg-sam-mod pos">👁️ 已揭示敌方</span>';
        if(sm.fundCostReduce > 0) modsHtml += `<span class="wg-sam-mod pos">💰 消耗-${Math.round(sm.fundCostReduce*100)}%</span>`;
        if(sm.escalationChange < 0) modsHtml += `<span class="wg-sam-mod pos">⚠️ 升级${sm.escalationChange}</span>`;
        samEl.innerHTML = modsHtml;
        samEl.style.display = '';
      } else {
        samEl.style.display = 'none';
      }
    }
  },

  /* ===== 计算我方本轮分值 ===== */
  _calcPlayerRoundScore(diceResults, playerEffects){
    const total = diceResults.length;
    if(total === 0) return 50;
    const successes = diceResults.filter(d => d.outcome !== 'fail').length;
    const greats = diceResults.filter(d => d.outcome === 'great').length;
    const successRate = (successes / total) * 100;
    const greatBonus = greats * 5;
    const domainGain = Object.values(playerEffects).reduce((a, v) => a + Math.max(0, v), 0);
    const domainScore = Math.min(100, 40 + domainGain * 3);
    const repScore = this.state.reputation;
    const domScore = this.state.domesticSupport;
    const escPenalty = (this.state.escalation - 1) * 4;
    const score = Math.round(successRate * 0.35 + domainScore * 0.25 + repScore * 0.2 + domScore * 0.2) + greatBonus - escPenalty;
    return Math.max(0, Math.min(100, score));
  },

  /* ===== 计算对手方本轮分值 ===== */
  _calcAIRoundScore(aiAction, aiEffects, escalationPush){
    const disruption = Object.values(aiEffects).reduce((a, v) => a + Math.abs(Math.min(0, v)), 0);
    const disruptionScore = Math.min(100, 30 + disruption * 4);
    const escPushScore = Math.min(100, escalationPush * 25);
    const escBonus = (this.state.escalation - 1) * 8;
    const score = Math.round(disruptionScore * 0.5 + escPushScore * 0.3 + 20) + escBonus;
    return Math.max(0, Math.min(100, score));
  },

  /* ===== 生成裁决理由 ===== */
  _genAdjudicationReasoning(diceResults, playerEffects, aiEffects, changes, escalationPush, aiAction){
    const pName = (this.state.playerSide) ? (this.state.playerSide.shortName || this.state.playerSide.name) : '我方';
    const oName = (this.state.opponentSide) ? (this.state.opponentSide.shortName || this.state.opponentSide.name) : '对手方';
    const total = diceResults.length;
    const successes = diceResults.filter(d => d.outcome === 'success' || d.outcome === 'great').length;
    const fails = diceResults.filter(d => d.outcome === 'fail').length;
    const greats = diceResults.filter(d => d.outcome === 'great').length;

    let parts = [];

    /* 我方行动评估 */
    if(greats > 0){
      parts.push(`${pName}${greats}项行动取得大成功，战略效果显著`);
    } else if(successes > fails){
      parts.push(`${pName}行动整体奏效，${successes}项成功、${fails}项失败，有效推进了战略目标`);
    } else if(fails > successes){
      parts.push(`${pName}行动效果不佳，${fails}项失败，态势面临压力`);
    } else if(total > 0){
      parts.push(`${pName}行动有得有失，${successes}项成功、${fails}项失败，态势总体维持`);
    }

    /* 对手方反制评估 */
    const aiDisruption = Object.values(aiEffects).reduce((a, v) => a + Math.abs(Math.min(0, v)), 0);
    if(aiDisruption >= 15){
      parts.push(`${oName}"${aiAction.name}"反制力度大，对${pName}多域造成严重冲击`);
    } else if(aiDisruption >= 8){
      parts.push(`${oName}"${aiAction.name}"反制有效，对${pName}部分域造成影响`);
    } else {
      parts.push(`${oName}"${aiAction.name}"反制力度有限，影响可控`);
    }

    /* 域态势变化 */
    const posDomains = Object.entries(changes).filter(([k,v]) => v > 0).map(([k]) => {
      const dm = WG_DOMAINS.find(d => d.id === k);
      return dm ? dm.name : k;
    });
    const negDomains = Object.entries(changes).filter(([k,v]) => v < 0).map(([k]) => {
      const dm = WG_DOMAINS.find(d => d.id === k);
      return dm ? dm.name : k;
    });
    if(posDomains.length > 0) parts.push(`${posDomains.join('、')}域获得优势拓展`);
    if(negDomains.length > 0) parts.push(`${negDomains.join('、')}域遭受冲击`);

    /* 升级度评估 */
    if(escalationPush > 0){
      parts.push(`局势升级度上升${escalationPush}级，需警惕冲突扩大风险`);
    } else {
      parts.push(`局势升级度维持不变，对抗保持在可控范围`);
    }

    return parts.join('；') + '。';
  },

  /* ===== 生成导调员态势评估报告 ===== */
  _genDirectorReport(){
    const s = this.state;
    const sc = s.scenario;
    const dm = DOMAIN_MAP[sc.domain] || DOMAIN_MAP.military;
    const esc = WG_RULES.escalationLevels[s.escalation - 1];
    const oName = (s.opponentSide) ? (s.opponentSide.shortName || s.opponentSide.name) : '对手方';
    const pName = (s.playerSide) ? (s.playerSide.shortName || s.playerSide.name) : '我方';

    /* 域态势评估 */
    const domainStatus = WG_DOMAINS.map(d => {
      const val = s.domains[d.id];
      let status, color;
      if(val >= 70){ status = '优势'; color = 'var(--green)'; }
      else if(val >= 50){ status = '稳定'; color = 'var(--cyan)'; }
      else if(val >= 30){ status = '承压'; color = 'var(--amber)'; }
      else { status = '危机'; color = 'var(--red)'; }
      return { ...d, val, status, color };
    });

    /* 威胁动态 */
    const threats = [];
    if(s.escalation >= 4) threats.push('冲突升级风险极高');
    else if(s.escalation >= 3) threats.push('多域对抗加剧');
    if(s.reputation < 40 && s.prestigeType !== 'none') threats.push('国际声望严重不足');
    if(s.domesticSupport < 40) threats.push(s.prestigeType === 'none' ? '组织凝聚力下降' : '国内支持度下滑');
    const crisisDomains = domainStatus.filter(d => d.val < 30);
    if(crisisDomains.length > 0) threats.push(`${crisisDomains.map(d => d.name).join('、')}域陷入危机`);
    if(s.funding < s.maxFunding * 0.2) threats.push('资金储备告急');

    /* 导调建议 */
    const recommendations = [];
    const weakDomains = domainStatus.filter(d => d.val < 50);
    if(weakDomains.length > 0) recommendations.push(`重点加强${weakDomains.map(d => d.name).join('、')}域行动`);
    if(s.escalation >= 3) recommendations.push('控制升级度，避免冲突扩大');
    if(s.reputation < 50 && s.prestigeType !== 'none') recommendations.push('增加和平行动，恢复国际声望');
    if(s.funding < s.maxFunding * 0.3) recommendations.push(s.prestigeType === 'none' ? '注意资金消耗，优先低成本行动' : '注意资金消耗，优先低成本高收益行动');
    if(s.lastAIAction) recommendations.push(`防范${oName}"${s.lastAIAction.name}"再次出现`);
    if(recommendations.length === 0) recommendations.push('保持当前战略节奏，稳步推进各域目标');

    /* 综合态势判断 */
    const avgDomain = domainStatus.reduce((a, d) => a + d.val, 0) / domainStatus.length;
    let overallStatus, overallColor;
    if(avgDomain >= 70 && s.escalation <= 2){ overallStatus = '战略主动'; overallColor = 'var(--green)'; }
    else if(avgDomain >= 50 && s.escalation <= 3){ overallStatus = '均势对抗'; overallColor = 'var(--cyan)'; }
    else if(avgDomain >= 30){ overallStatus = '战略承压'; overallColor = 'var(--amber)'; }
    else { overallStatus = '战略被动'; overallColor = 'var(--red)'; }

    /* 情报更新 */
    let intelUpdate = '';
    if(s.lastAIAction){
      intelUpdate = `${oName}上轮采取"${s.lastAIAction.name}"行动，${s.lastAIAction.desc}。当前升级度${esc.name}，需持续关注${oName}动向。`;
    } else {
      intelUpdate = `推演初始态势：${sc.background.split('。')[0]}。${oName}意图尚不明确，建议加强情报搜集。`;
    }

    return {
      round: s.round,
      domainStatus,
      threats,
      recommendations,
      overallStatus,
      overallColor,
      avgDomain: Math.round(avgDomain),
      escalation: s.escalation,
      escName: esc.name,
      reputation: s.reputation,
      domesticSupport: s.domesticSupport,
      funding: s.funding,
      lastAIAction: s.lastAIAction,
      intelUpdate,
    };
  },

  /* ===== 渲染导调员报告 ===== */
  _renderDirectorReport(){
    const r = this.state.directorReport;
    if(!r) return '';
    return `
      <div class="wg-director-report" id="wgDirectorReport">
        <div class="wg-dr-head" id="wgDrHead">
          <span class="wg-dr-icon">📋</span>
          <span class="wg-dr-title">导调员态势评估报告 · 第${r.round}轮</span>
          <span class="wg-dr-overall" style="color:${r.overallColor};border-color:${r.overallColor}44">综合态势：${r.overallStatus}</span>
          <span class="wg-dr-toggle" id="wgDrToggle">收起 ▲</span>
        </div>
        <div class="wg-dr-body" id="wgDrBody">
          <div class="wg-dr-grid">
            <div class="wg-dr-section">
              <div class="wg-dr-sec-title">域态势评估</div>
              <div class="wg-dr-domains">
                ${r.domainStatus.map(d => `
                  <div class="wg-dr-domain">
                    <span style="color:${d.color}">${d.icon} ${d.name}</span>
                    <span class="wg-dr-d-val">${d.val}</span>
                    <span class="wg-dr-d-status" style="color:${d.color}">${d.status}</span>
                  </div>
                `).join('')}
              </div>
            </div>
            <div class="wg-dr-section">
              <div class="wg-dr-sec-title">威胁动态</div>
              <div class="wg-dr-threats">
                ${r.threats.length === 0 ? '<span class="wg-dr-no-threat">暂无重大威胁</span>' :
                  r.threats.map(t => `<div class="wg-dr-threat">⚠ ${esc2(t)}</div>`).join('')}
              </div>
            </div>
            <div class="wg-dr-section">
              <div class="wg-dr-sec-title">导调建议</div>
              <div class="wg-dr-recs">
                ${r.recommendations.map(rec => `<div class="wg-dr-rec">→ ${esc2(rec)}</div>`).join('')}
              </div>
            </div>
          </div>
          <div class="wg-dr-intel">
            <span class="wg-dr-intel-label">情报更新：</span>
            <span class="wg-dr-intel-text">${esc2(r.intelUpdate)}</span>
          </div>
        </div>
      </div>
    `;
  },

  /* ===== 裁决结果 ===== */
  renderResolution(logEntry){
    const content = document.getElementById('tabContent');
    const s = this.state;
    const changes = logEntry.changes;
    const esc = WG_RULES.escalationLevels[s.escalation - 1];

    content.innerHTML = `
      <div class="wg-view fade-in">
        <div class="wg-topbar">
          <div class="wg-topbar-left">
            <button class="wg-exit" id="wgExit">← 退出</button>
            <div class="wg-scene-name">${esc2(s.scenario.name)}</div>
          </div>
          <div class="wg-topbar-center">
            <span class="wg-round-label">第${s.round}轮 · 裁决结果</span>
          </div>
          <div class="wg-topbar-right"></div>
        </div>

        <!-- 资源条(更新后) -->
        <div class="wg-resource-bar">
          <div class="wg-res-item">
            <span class="wg-res-icon">💰</span>
            <span class="wg-res-label">资金</span>
            <span class="wg-res-val" style="color:var(--amber)">${s.funding}亿</span>
            ${s.pendingFundGain > 0 ? `<span class="wg-res-pending" style="color:var(--amber)">+${s.pendingFundGain}(下轮)</span>` : ''}
          </div>
          <div class="wg-res-item">
            <span class="wg-res-icon">🌍</span>
            <span class="wg-res-label">声望 ${s.prestigeType === 'none' ? '(不适用)' : ''}</span>
            <span class="wg-res-val" style="color:var(--green)">${s.reputation}</span>
            ${logEntry.repChange ? `<span class="wg-res-delta ${logEntry.repChange > 0 ? 'pos' : 'neg'}">${logEntry.repChange > 0 ? '+' : ''}${logEntry.repChange}</span>` : ''}
            ${s.pendingRepGain > 0 ? `<span class="wg-res-pending" style="color:var(--green)">+${s.pendingRepGain}(下轮)</span>` : ''}
          </div>
          <div class="wg-res-item">
            <span class="wg-res-icon">🏠</span>
            <span class="wg-res-label">国内</span>
            <span class="wg-res-val" style="color:var(--purple)">${s.domesticSupport}</span>
            ${logEntry.domChange ? `<span class="wg-res-delta ${logEntry.domChange > 0 ? 'pos' : 'neg'}">${logEntry.domChange > 0 ? '+' : ''}${logEntry.domChange}</span>` : ''}
          </div>
          <div class="wg-res-item">
            <span class="wg-res-icon">⚠️</span>
            <span class="wg-res-label">升级度</span>
            <span class="wg-res-val" style="color:${s.escalation >= 4 ? 'var(--red)' : 'var(--amber)'}">${esc.name}</span>
          </div>
        </div>

        <!-- 骰子结果 -->
        <div class="wg-dice-section">
          <div class="wg-res-section-title">🎲 行动裁决</div>
          <div class="wg-dice-grid">
            ${logEntry.diceResults.map(dr => {
              const cls = dr.outcome === 'great' ? 'great' : dr.outcome === 'success' ? 'success' : 'fail';
              const label = dr.outcome === 'great' ? '大成功 ✦' : dr.outcome === 'success' ? '成功 ✓' : '失败 ✗';
              const labelColor = dr.outcome === 'great' ? 'var(--gold)' : dr.outcome === 'success' ? 'var(--green)' : 'var(--red)';
              const actType = dr.isWar ? '<span class="wg-dc-badge" style="color:var(--red);border-color:var(--red)">战争</span>' : dr.isPeace ? '<span class="wg-dc-badge" style="color:var(--green);border-color:var(--green)">和平</span>' : '<span class="wg-dc-badge" style="color:var(--cyan);border-color:var(--cyan)">常规</span>';
              const fundGrowthTag = dr.fundGrowth > 0 ? `<span class="wg-dc-badge" style="color:var(--amber);border-color:var(--amber)">💰+${dr.fundGrowth}(下轮)</span>` : '';
              return `
                <div class="wg-dice-card ${cls}">
                  <div class="wg-dc-name">${esc2(dr.action.name)} ${actType} ${fundGrowthTag}</div>
                  <div class="wg-dc-roll">
                    <span class="wg-dc-die">🎲 ${dr.roll}</span>
                    <span class="wg-dc-target">/ ${dr.successRate}</span>
                  </div>
                  <div class="wg-dc-result" style="color:${labelColor}">${label}</div>
                  <div class="wg-dc-effects">
                    ${Object.entries(dr.effects).filter(([k,v]) => v !== 0).map(([k,v]) => {
                      const dm = WG_DOMAINS.find(d => d.id === k);
                      const sign = v > 0 ? '+' : '';
                      const ecls = v > 0 ? 'pos' : 'neg';
                      return `<span class="wg-dc-eff ${ecls}">${dm ? dm.icon : ''} ${sign}${v}</span>`;
                    }).join('')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- 我方 vs 对手方 -->
        <div class="wg-resolution">
          <div class="wg-res-panel">
            <div class="wg-res-head">
              <span class="wg-res-icon">${s.playerSide ? s.playerSide.icon : '🇨🇳'}</span>
              <span class="wg-res-title">${s.playerSide ? esc2(s.playerSide.shortName || s.playerSide.name) : '我方'}行动</span>
            </div>
            <div class="wg-res-actions">
              ${s.lastPlayerActions.map(a => `
                <div class="wg-res-action">
                  <span class="wg-res-action-name">${esc2(a.name)}</span>
                  <span class="wg-res-action-cost">${a.cost}AP · 💰${a.fundingCost}</span>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="wg-res-vs">⚔ 对战 ⚔</div>
          <div class="wg-res-panel enemy">
            <div class="wg-res-head">
              <span class="wg-res-icon">${s.opponentSide ? s.opponentSide.icon : '⚔️'}</span>
              <span class="wg-res-title">${s.opponentSide ? esc2(s.opponentSide.shortName || s.opponentSide.name) : '对手方'}反制</span>
            </div>
            <div class="wg-res-actions">
              <div class="wg-res-action">
                <span class="wg-res-action-name">${esc2(s.lastAIAction.name)}</span>
              </div>
              <div class="wg-res-action-desc">${esc2(s.lastAIAction.desc)}</div>
            </div>
          </div>
        </div>

        <!-- 双方分值评估 -->
        <div class="wg-res-scores">
          <div class="wg-res-section-title">📊 双方分值评估</div>
          <div class="wg-score-compare">
            <div class="wg-sc-side player">
              <div class="wg-sc-header">
                <span class="wg-sc-icon">${s.playerSide ? s.playerSide.icon : '🇨🇳'}</span>
                <span class="wg-sc-name">${s.playerSide ? esc2(s.playerSide.shortName || s.playerSide.name) : '我方'}</span>
              </div>
              <div class="wg-sc-score-val" style="color:var(--green)">${logEntry.playerScore}</div>
              <div class="wg-sc-bar-wrap">
                <div class="wg-sc-bar" style="width:${logEntry.playerScore}%;background:linear-gradient(90deg,var(--green-dim),var(--green))"></div>
              </div>
              <div class="wg-sc-label">本轮表现</div>
            </div>
            <div class="wg-sc-vs">VS</div>
            <div class="wg-sc-side enemy">
              <div class="wg-sc-header">
                <span class="wg-sc-icon">⚔️</span>
                <span class="wg-sc-name">${s.opponentSide ? esc2(s.opponentSide.shortName || s.opponentSide.name) : '敌方'}</span>
              </div>
              <div class="wg-sc-score-val" style="color:var(--red)">${logEntry.aiScore}</div>
              <div class="wg-sc-bar-wrap">
                <div class="wg-sc-bar" style="width:${logEntry.aiScore}%;background:linear-gradient(90deg,var(--red-dim),var(--red))"></div>
              </div>
              <div class="wg-sc-label">本轮表现</div>
            </div>
          </div>
          <div class="wg-sc-result">
            ${logEntry.playerScore > logEntry.aiScore
              ? `<span style="color:var(--green)">✦ ${s.playerSide ? esc2(s.playerSide.shortName || s.playerSide.name) : '我方'}本轮占优</span>`
              : logEntry.playerScore < logEntry.aiScore
                ? `<span style="color:var(--red)">⚠ ${s.opponentSide ? esc2(s.opponentSide.shortName || s.opponentSide.name) : '对手方'}本轮占优</span>`
                : `<span style="color:var(--amber)">═ 双方势均力敌</span>`
            }
          </div>
          <div class="wg-sc-reasoning">
            <span class="wg-sc-r-label">裁决理由：</span>
            <span class="wg-sc-r-text">${esc2(logEntry.adjudicationReasoning)}</span>
          </div>
        </div>

        <!-- 域分变化 -->
        <div class="wg-res-changes">
          <div class="wg-res-section-title">六域态势变化</div>
          <div class="wg-res-changes-grid">
            ${WG_DOMAINS.map(d => {
              const val = s.domains[d.id];
              const chg = changes[d.id] || 0;
              const pct = Math.max(0, Math.min(100, val));
              const gradient = val >= 70 ? 'linear-gradient(90deg,var(--green-dim),var(--green))'
                             : val >= 50 ? 'linear-gradient(90deg,var(--cyan-dim),var(--cyan))'
                             : val >= 30 ? 'linear-gradient(90deg,var(--amber-dim),var(--amber))'
                             : 'linear-gradient(90deg,var(--red-dim),var(--red))';
              return `
                <div class="wg-res-domain">
                  <div class="wg-rd-head">
                    <span style="color:${d.color}">${d.icon} ${d.name}</span>
                    <span class="wg-rd-val">${val}</span>
                  </div>
                  <div class="wg-rd-bar"><div class="wg-rd-fill" style="width:${pct}%;background:${gradient}"></div></div>
                  <div class="wg-rd-change ${chg > 0 ? 'pos' : chg < 0 ? 'neg' : ''}">
                    ${chg > 0 ? '▲' : chg < 0 ? '▼' : '─'} ${chg > 0 ? '+' : ''}${chg}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <div class="wg-res-next">
          ${s.round >= s.maxRounds
            ? '<button class="btn btn-amber wg-next-btn" id="wgNext">查看推演结果 →</button>'
            : `<button class="btn wg-next-btn" id="wgNext">进入第${s.round + 1}轮 →</button>`
          }
        </div>
      </div>
    `;

    document.getElementById('wgExit').addEventListener('click', () => this.exit());
    document.getElementById('wgNext').addEventListener('click', () => this.nextRound());
  },

  /* ===== 最终结果 ===== */
  renderFinalResult(){
    const content = document.getElementById('tabContent');
    const s = this.state;
    const sb = s.scoreBreakdown;

    content.innerHTML = `
      <div class="wg-view fade-in">
        <div class="wg-topbar">
          <div class="wg-topbar-left">
            <button class="wg-exit" id="wgExit">← 退出</button>
            <div class="wg-scene-name">${esc2(s.scenario.name)}</div>
          </div>
          <div class="wg-topbar-center">
            <span class="wg-round-label">推演结束 · 最终评估</span>
          </div>
          <div class="wg-topbar-right"></div>
        </div>

        <div class="wg-final">
          <!-- 评级 -->
          <div class="wg-final-grade">
            <div class="wg-grade-circle" style="border-color:${s.gradeColor};color:${s.gradeColor};box-shadow:0 0 40px ${s.gradeColor}40">
              <span class="wg-grade-letter">${s.grade}</span>
            </div>
            <div class="wg-grade-info">
              <div class="wg-grade-score" style="color:${s.gradeColor}">${s.finalScore}<span class="wg-grade-max">/100</span></div>
              <div class="wg-grade-desc">${s.gradeDesc}</div>
              <div class="wg-grade-scene">${esc2(s.scenario.name)} · ${s.maxRounds}轮推演 · ${s.playerSide ? s.playerSide.icon + ' ' + esc2(s.playerSide.shortName || s.playerSide.name) : '我方'}视角</div>
            </div>
          </div>

          <!-- 评分明细 -->
          <div class="wg-final-score-breakdown">
            <div class="wg-res-section-title">评分明细</div>
            <div class="wg-score-grid">
              <div class="wg-score-item">
                <div class="wg-si-label">六域均分</div>
                <div class="wg-si-bar"><div class="wg-si-fill" style="width:${sb.domainScore}%;background:var(--cyan)"></div></div>
                <div class="wg-si-val" style="color:var(--cyan)">${Math.round(sb.domainScore)}</div>
                <div class="wg-si-weight">权重 ${WG_RULES.scoring.domains * 100}%</div>
              </div>
              <div class="wg-score-item">
                <div class="wg-si-label">🌍 ${s.prestigeType === 'none' ? '国际声望(不适用)' : '国际声望'}</div>
                <div class="wg-si-bar"><div class="wg-si-fill" style="width:${sb.repScore}%;background:var(--green)"></div></div>
                <div class="wg-si-val" style="color:var(--green)">${Math.round(sb.repScore)}</div>
                <div class="wg-si-weight">权重 ${WG_RULES.scoring.reputation * 100}%</div>
              </div>
              <div class="wg-score-item">
                <div class="wg-si-label">🏠 ${s.prestigeType === 'none' ? '组织凝聚力' : '国内支持'}</div>
                <div class="wg-si-bar"><div class="wg-si-fill" style="width:${sb.domScore}%;background:var(--purple)"></div></div>
                <div class="wg-si-val" style="color:var(--purple)">${Math.round(sb.domScore)}</div>
                <div class="wg-si-weight">权重 ${WG_RULES.scoring.domestic * 100}%</div>
              </div>
              <div class="wg-score-item">
                <div class="wg-si-label">💰 资金保有</div>
                <div class="wg-si-bar"><div class="wg-si-fill" style="width:${sb.fundingScore}%;background:var(--amber)"></div></div>
                <div class="wg-si-val" style="color:var(--amber)">${Math.round(sb.fundingScore)}</div>
                <div class="wg-si-weight">权重 ${WG_RULES.scoring.funding * 100}%</div>
              </div>
              <div class="wg-score-item">
                <div class="wg-si-label">⚠️ 局势管控</div>
                <div class="wg-si-bar"><div class="wg-si-fill" style="width:${sb.escScore}%;background:var(--red)"></div></div>
                <div class="wg-si-val" style="color:var(--red)">${Math.round(sb.escScore)}</div>
                <div class="wg-si-weight">权重 ${WG_RULES.scoring.escalation * 100}%</div>
              </div>
            </div>
          </div>

          <!-- 六域最终 -->
          <div class="wg-final-domains">
            <div class="wg-res-section-title">六域最终态势</div>
            <div class="wg-res-changes-grid">
              ${WG_DOMAINS.map(d => {
                const val = s.domains[d.id];
                const pct = Math.max(0, Math.min(100, val));
                const gradient = val >= 70 ? 'linear-gradient(90deg,var(--green-dim),var(--green))'
                               : val >= 50 ? 'linear-gradient(90deg,var(--cyan-dim),var(--cyan))'
                               : val >= 30 ? 'linear-gradient(90deg,var(--amber-dim),var(--amber))'
                               : 'linear-gradient(90deg,var(--red-dim),var(--red))';
                let status = val >= 70 ? '优势' : val >= 50 ? '稳定' : val >= 30 ? '承压' : '危机';
                let statusColor = val >= 70 ? 'var(--green)' : val >= 50 ? 'var(--cyan)' : val >= 30 ? 'var(--amber)' : 'var(--red)';
                return `
                  <div class="wg-res-domain">
                    <div class="wg-rd-head">
                      <span style="color:${d.color}">${d.icon} ${d.name}</span>
                      <span class="wg-rd-val">${val}</span>
                    </div>
                    <div class="wg-rd-bar"><div class="wg-rd-fill" style="width:${pct}%;background:${gradient}"></div></div>
                    <div class="wg-rd-status" style="color:${statusColor}">${status}</div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- 完整日志 -->
          <div class="wg-final-log">
            <div class="wg-res-section-title">完整推演日志</div>
            <div class="wg-log-list">
              ${s.log.map(l => this.renderLogEntry(l)).join('')}
            </div>
          </div>

          <div class="wg-final-actions">
            <button class="btn" id="wgAAR">📋 查看复盘报告</button>
            <button class="btn" id="wgRestart">↻ 重新推演</button>
            <button class="btn btn-amber" id="wgBack">返回场景库</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('wgExit').addEventListener('click', () => this.exit());
    document.getElementById('wgAAR').addEventListener('click', () => AAR.generate(this.state));
    document.getElementById('wgRestart').addEventListener('click', () => this.restart());
    document.getElementById('wgBack').addEventListener('click', () => this.exit());
  },
};

/* 内部转义函数（避免与 ui.js 的 esc 冲突） */
function esc2(s){
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
