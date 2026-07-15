/**
 * 国家安全战略兵棋推演平台 v12.0 — 综合战略推演中心
 * 功能：场景串联引擎、信息串并中心、全域态势融合、战略决策沙盘、综合评估系统
 */

/* ===== 综合推演场景链 ===== */
const STRATEGIC_CHAINS = [
  {
    id: 'chain_taiwan',
    name: '台海全域联动推演',
    icon: '⚔️',
    color: '#ff4757',
    difficulty: 5,
    desc: '以台海军事行动为核心，串联网络战、经济制裁、认知域作战、外交博弈，模拟全域联动战略推演',
    scenarios: [
      { id:'taiwan_strait', role:'核心战场', domain:'military' },
      { id:'cyber_attack',  role:'网络域',   domain:'cyber' },
      { id:'eco_sanctions', role:'经济域',   domain:'economic' },
      { id:'cognitive_war', role:'信息域',   domain:'information' },
      { id:'east_china_sea',role:'侧翼牵制', domain:'military' },
    ],
    connections: [
      { from:'taiwan_strait', to:'cyber_attack',  trigger:'军事升级', effect:'敌方网络报复', delay:'0-6小时',   strength:0.9 },
      { from:'taiwan_strait', to:'eco_sanctions', trigger:'军事升级', effect:'西方经济制裁', delay:'24-72小时', strength:0.8 },
      { from:'taiwan_strait', to:'cognitive_war', trigger:'军事升级', effect:'国际舆论战',  delay:'同步',     strength:0.85 },
      { from:'taiwan_strait', to:'east_china_sea',trigger:'军事升级', effect:'侧翼牵制',    delay:'12-24小时',strength:0.6 },
      { from:'cyber_attack',  to:'eco_sanctions', trigger:'网络攻击', effect:'金融系统受冲击',delay:'6-12小时',strength:0.7 },
      { from:'cognitive_war', to:'eco_sanctions', trigger:'舆论施压', effect:'资本外流加剧',delay:'48小时',  strength:0.5 },
    ],
    globalState: { tension:90, military:92, economic:55, cyber:88, diplomatic:40, information:75, space:60 },
    objective: '在台海军事行动中实现全域协调，确保军事压力有效的同时控制经济和网络风险',
    keyDecisions: [
      '军事威慑强度：有限威慑 / 全面封控 / 直接行动',
      '网络防御优先级：保护关键基础设施 / 主动反制 / 两者兼顾',
      '经济反制力度：对等反制 / 先发制人 / 防御为主',
      '舆论策略：主动塑造叙事 / 防御性澄清 / 沉默管控',
    ],
  },
  {
    id: 'chain_indo_pacific',
    name: '印太战略破围推演',
    icon: '🌊',
    color: '#00b4d8',
    difficulty: 5,
    desc: '突破印太战略围堵的全域推演，串联外交突围、经济合作、军事反制、科技竞争多条战线',
    scenarios: [
      { id:'indo_pacific',  role:'核心博弈', domain:'diplomatic' },
      { id:'finance_war',   role:'金融战场', domain:'economic' },
      { id:'space_domain',  role:'太空博弈', domain:'space' },
      { id:'ai_race',       role:'科技竞争', domain:'information' },
      { id:'rare_earth',    role:'资源武器', domain:'economic' },
    ],
    connections: [
      { from:'indo_pacific', to:'finance_war',  trigger:'联盟施压', effect:'金融脱钩加速', delay:'1-3个月',  strength:0.75 },
      { from:'indo_pacific', to:'space_domain', trigger:'联盟施压', effect:'太空对抗升级', delay:'同步',    strength:0.8 },
      { from:'indo_pacific', to:'ai_race',      trigger:'联盟施压', effect:'技术封锁加码', delay:'1-6个月', strength:0.85 },
      { from:'indo_pacific', to:'rare_earth',   trigger:'联盟施压', effect:'资源博弈激化', delay:'即时',    strength:0.7 },
      { from:'finance_war',  to:'rare_earth',   trigger:'金融脱钩', effect:'资源反制升级', delay:'1-2周',   strength:0.65 },
      { from:'ai_race',      to:'space_domain', trigger:'技术封锁', effect:'太空技术受限', delay:'3-6个月', strength:0.6 },
    ],
    globalState: { tension:75, military:65, economic:60, cyber:55, diplomatic:70, information:65, space:72 },
    objective: '在印太方向实现多线突破，以经济合作和科技自主破围，同时管控军事冲突风险',
    keyDecisions: [
      '外交策略：深化中俄协作 / 团结全球南方 / 分化对方联盟',
      '金融反制：推进本币结算 / 建立替代体系 / 防御性去美元',
      '科技路线：全面自主攻关 / 重点突破瓶颈 / 国际合作借力',
      '资源策略：稀土作为杠杆 / 保障供应链 / 战略储备',
    ],
  },
  {
    id: 'chain_hybrid',
    name: '混合战争全域推演',
    icon: '🎭',
    color: '#a29bfe',
    difficulty: 5,
    desc: '模拟对手发动的混合战争，串联网络攻击、认知域作战、经济胁迫、代理人冲突，进行全域防御与反制',
    scenarios: [
      { id:'hybrid_warfare',  role:'总体框架', domain:'military' },
      { id:'cyber_attack',    role:'网络攻击', domain:'cyber' },
      { id:'cognitive_war',   role:'认知攻击', domain:'information' },
      { id:'eco_sanctions',   role:'经济胁迫', domain:'economic' },
      { id:'supply_chain',    role:'供应链战', domain:'economic' },
      { id:'biosecurity',     role:'生物安全', domain:'information' },
    ],
    connections: [
      { from:'hybrid_warfare', to:'cyber_attack',   trigger:'混合攻击启动', effect:'网络渗透先行', delay:'先发',     strength:0.9 },
      { from:'hybrid_warfare', to:'cognitive_war',  trigger:'混合攻击启动', effect:'舆论操纵配合', delay:'同步',     strength:0.85 },
      { from:'hybrid_warfare', to:'eco_sanctions',  trigger:'混合攻击启动', effect:'经济施压跟进', delay:'1-4周',    strength:0.7 },
      { from:'cyber_attack',   to:'supply_chain',   trigger:'网络攻击',     effect:'供应链中断',  delay:'数天-数周',strength:0.8 },
      { from:'cognitive_war',  to:'biosecurity',    trigger:'舆论操纵',     effect:'生物信息战',  delay:'数周',     strength:0.55 },
      { from:'eco_sanctions',  to:'supply_chain',   trigger:'经济胁迫',     effect:'断链加剧',    delay:'即时',     strength:0.75 },
    ],
    globalState: { tension:85, military:75, economic:50, cyber:90, diplomatic:55, information:88, space:50 },
    objective: '识别混合战争信号，建立全域防御体系，实施反制并保护关键功能',
    keyDecisions: [
      '防御优先级：网络 / 经济 / 认知 / 供应链',
      '反制策略：对称反制 / 非对称反制 / 升级威慑',
      '信息管控：公开归因 / 沉默应对 / 选择性披露',
      '盟友协调：联合防御 / 情报共享 / 分工应对',
    ],
  },
  {
    id: 'chain_middle_east',
    name: '中东能源安全推演',
    icon: '🛢️',
    color: '#ffa502',
    difficulty: 4,
    desc: '中东局势变化对能源安全和全球战略格局的影响推演，串联军事部署、能源通道、外交博弈',
    scenarios: [
      { id:'middle_east',    role:'核心局势', domain:'diplomatic' },
      { id:'hormuz',         role:'能源通道', domain:'military' },
      { id:'nuclear_prolif', role:'核扩散',   domain:'military' },
      { id:'finance_war',    role:'石油美元', domain:'economic' },
    ],
    connections: [
      { from:'middle_east',    to:'hormuz',         trigger:'局势升级', effect:'海峡通行风险', delay:'即时',   strength:0.85 },
      { from:'middle_east',    to:'nuclear_prolif', trigger:'局势升级', effect:'核门槛降低',   delay:'数月',   strength:0.6 },
      { from:'middle_east',    to:'finance_war',    trigger:'局势升级', effect:'石油美元动摇', delay:'数周',   strength:0.7 },
      { from:'hormuz',         to:'finance_war',    trigger:'海峡封锁', effect:'油价飙升',     delay:'即时',   strength:0.9 },
      { from:'nuclear_prolif', to:'hormuz',         trigger:'核突破',   effect:'军事冒险升级', delay:'数月',   strength:0.65 },
    ],
    globalState: { tension:70, military:68, economic:55, cyber:40, diplomatic:72, information:50, space:45 },
    objective: '保障能源通道安全，管控核扩散风险，维护中东战略利益',
    keyDecisions: [
      '军事部署：前沿存在 / 远程力量 / 代理人网络',
      '能源安全：战略储备 / 多元供应 / 替代能源',
      '外交立场：中立调停 / 选边支持 / 多边平衡',
      '核不扩散：制裁施压 / 谈判解决 / 默认容忍',
    ],
  },
  {
    id: 'chain_arctic',
    name: '北极全域博弈推演',
    icon: '❄️',
    color: '#2ed573',
    difficulty: 4,
    desc: '北极冰融引发的新战略空间竞争推演，串联军事部署、航道控制、资源争夺、科技竞争',
    scenarios: [
      { id:'arctic',          role:'核心博弈', domain:'military' },
      { id:'space_domain',    role:'太空支援', domain:'space' },
      { id:'deep_sea',        role:'海底争夺', domain:'military' },
      { id:'climate_security',role:'气候变量', domain:'economic' },
    ],
    connections: [
      { from:'arctic',           to:'space_domain',     trigger:'北极竞争', effect:'卫星监控加强', delay:'同步',   strength:0.8 },
      { from:'arctic',           to:'deep_sea',         trigger:'北极竞争', effect:'海底电缆争夺', delay:'数月',   strength:0.7 },
      { from:'arctic',           to:'climate_security', trigger:'北极竞争', effect:'冰融加速博弈', delay:'持续',   strength:0.65 },
      { from:'climate_security', to:'arctic',           trigger:'气候变暖', effect:'航道开通提速', delay:'数年',   strength:0.85 },
      { from:'space_domain',     to:'deep_sea',         trigger:'太空监控', effect:'海底活动曝光', delay:'即时',   strength:0.6 },
    ],
    globalState: { tension:55, military:60, economic:65, cyber:40, diplomatic:68, information:45, space:70 },
    objective: '在北极新战略空间建立存在，保障航道和资源权益，管控大国竞争风险',
    keyDecisions: [
      '存在方式：破冰船队 / 军事基地 / 科考站网络',
      '航道策略：自主开通 / 国际合作 / 规则塑造',
      '资源开发：优先开发 / 环保优先 / 战略储备',
      '大国协调：双边协商 / 多边治理 / 竞争优先',
    ],
  },
  {
    id: 'chain_tech',
    name: '科技突围全域推演',
    icon: '🔬',
    color: '#ff6348',
    difficulty: 5,
    desc: '以科技竞争为核心的全域推演，串联芯片封锁、人工智能、太空竞争、数字主权、人才争夺',
    scenarios: [
      { id:'ai_race',            role:'核心战场', domain:'information' },
      { id:'supply_chain',       role:'供应链战', domain:'economic' },
      { id:'space_domain',       role:'太空科技', domain:'space' },
      { id:'digital_sovereignty',role:'数字主权', domain:'cyber' },
      { id:'rare_earth',         role:'资源筹码', domain:'economic' },
    ],
    connections: [
      { from:'ai_race',             to:'supply_chain',        trigger:'技术封锁', effect:'芯片断供',     delay:'即时',   strength:0.9 },
      { from:'ai_race',             to:'space_domain',        trigger:'技术封锁', effect:'航天受限',     delay:'数月',   strength:0.7 },
      { from:'ai_race',             to:'digital_sovereignty', trigger:'技术封锁', effect:'数据安全威胁', delay:'同步',   strength:0.8 },
      { from:'supply_chain',        to:'rare_earth',          trigger:'断链危机', effect:'稀土反制窗口', delay:'数周',   strength:0.75 },
      { from:'digital_sovereignty', to:'supply_chain',        trigger:'数据管控', effect:'技术脱钩加速', delay:'数月',   strength:0.65 },
      { from:'rare_earth',          to:'ai_race',             trigger:'稀土反制', effect:'对方技术受限', delay:'1-3个月',strength:0.6 },
    ],
    globalState: { tension:80, military:55, economic:65, cyber:70, diplomatic:60, information:85, space:68 },
    objective: '在科技战中实现自主突破，利用资源筹码反制，保障数字主权和技术安全',
    keyDecisions: [
      '攻关策略：举国体制 / 市场主导 / 国际合作',
      '反制手段：稀土管制 / 市场准入 / 技术标准',
      '人才争夺：海外引才 / 自主培养 / 全球布局',
      '标准制定：自主标准 / 国际协调 / 联合盟友',
    ],
  },
  {
    id: 'chain_malacca',
    name: '马六甲能源通道全域推演',
    icon: '⚓',
    color: '#2ed573',
    difficulty: 4,
    desc: '以马六甲海峡安全为核心，串联能源转型、海上灰色对峙、太空监控和供应链保障，模拟能源生命线全域防护推演',
    scenarios: [
      { id:'strait_of_malacca', role:'核心通道', domain:'military' },
      { id:'energy_transition',  role:'能源转型', domain:'economic' },
      { id:'maritime_militia',   role:'灰色对峙', domain:'military' },
      { id:'space_debris',       role:'太空监控', domain:'space' },
      { id:'supply_chain',       role:'供应链',   domain:'economic' },
    ],
    connections: [
      { from:'strait_of_malacca', to:'energy_transition', trigger:'海峡风险',  effect:'能源安全紧迫', delay:'即时',   strength:0.9 },
      { from:'strait_of_malacca', to:'maritime_militia',  trigger:'海峡风险',  effect:'灰色对峙升级', delay:'同步',   strength:0.75 },
      { from:'strait_of_malacca', to:'space_debris',      trigger:'海峡风险',  effect:'太空监控加强', delay:'数天',   strength:0.6 },
      { from:'strait_of_malacca', to:'supply_chain',      trigger:'海峡封锁',  effect:'断链风险飙升', delay:'即时',   strength:0.85 },
      { from:'energy_transition', to:'strait_of_malacca', trigger:'能源转型',  effect:'通道依赖降低', delay:'3-5年',  strength:0.5 },
      { from:'maritime_militia',  to:'supply_chain',      trigger:'灰色冲突',  effect:'航运保险暴涨', delay:'数天',   strength:0.7 },
    ],
    globalState: { tension:78, military:82, economic:58, cyber:50, diplomatic:62, information:55, space:65 },
    objective: '保障马六甲海峡能源通道安全，推进能源转型降低依赖，管控海上灰色对峙风险',
    keyDecisions: [
      '通道保障：海军护航 / 多元化航线 / 陆上管道替代',
      '海上策略：正面巡航 / 灰色反制 / 外交管控',
      '能源转型：加速可再生能源 / 核电优先 / 煤炭兜底',
      '供应链：战略储备 / 国产替代 / 多源采购',
    ],
  },
  {
    id: 'chain_quantum',
    name: '量子未来战争全域推演',
    icon: '🔬',
    color: '#a29bfe',
    difficulty: 5,
    desc: '以量子科技革命为核心的未来战争推演，串联量子计算、太空碎片、基因数据、人工智能和数字主权，模拟下一代全域竞争',
    scenarios: [
      { id:'quantum_tech',        role:'核心战场', domain:'information' },
      { id:'space_debris',        role:'太空域',   domain:'space' },
      { id:'bio_data',            role:'生物域',   domain:'cyber' },
      { id:'ai_race',             role:'智能域',   domain:'information' },
      { id:'digital_sovereignty', role:'数字域',   domain:'cyber' },
    ],
    connections: [
      { from:'quantum_tech',        to:'ai_race',             trigger:'量子突破', effect:'算力代差扩大', delay:'1-3年',  strength:0.85 },
      { from:'quantum_tech',        to:'digital_sovereignty', trigger:'量子加密', effect:'通信安全重构', delay:'同步',   strength:0.8 },
      { from:'quantum_tech',        to:'bio_data',            trigger:'量子计算', effect:'基因数据风险', delay:'2-5年',  strength:0.65 },
      { from:'space_debris',        to:'quantum_tech',        trigger:'太空碎片', effect:'量子卫星受威胁',delay:'即时',   strength:0.7 },
      { from:'bio_data',            to:'ai_race',             trigger:'基因数据', effect:'生物智能融合', delay:'3-5年',  strength:0.55 },
      { from:'digital_sovereignty', to:'bio_data',            trigger:'数据主权', effect:'基因数据管控', delay:'数月',   strength:0.6 },
    ],
    globalState: { tension:72, military:50, economic:60, cyber:82, diplomatic:55, information:88, space:75 },
    objective: '在量子科技革命中抢占制高点，保护基因数据安全，维护数字主权，构建未来竞争优势',
    keyDecisions: [
      '量子策略：集中攻关 / 产学研融合 / 国际合作借力',
      '数据安全：基因数据管制 / 量子加密部署 / 国产替代',
      '太空防御：卫星规避系统 / 反导反卫 / 空间态势感知',
      '人工智能：算力自主 / 算法突破 / 军事化应用',
    ],
  },
];

/* ===== 信息串并规则 ===== */
const INTEL_FUSION_RULES = [
  {
    id:'fusion_1',
    name:'军事调动+网络异常→联合攻击预警',
    sources:['图像情报','信号情报'],
    domains:['军事安全','网络空间'],
    pattern:'敌方军事力量集结的同时，检测到针对我方关键基础设施的网络渗透活动',
    confidence:85,
    desc:'当两个信号同时出现时，联合攻击（军事+网络）的概率为85%。建议立即提升战备等级并启动网络防御预案。',
    recommendation:'提升至德尔塔级战备，启动关键基础设施网络防御，前沿部署反制力量',
  },
  {
    id:'fusion_2',
    name:'外交照会+经济异动→制裁预判',
    sources:['开源情报','人力情报'],
    domains:['外交战线','经济安全'],
    pattern:'对方密集发表强硬声明的同时，监测到资本异常流动和评级机构下调信号',
    confidence:78,
    desc:'外交言辞升级配合资本异动，预示即将出台大规模经济制裁。窗口期约7-14天。',
    recommendation:'启动金融防御预案，加速外汇储备多元化，准备反制清单',
  },
  {
    id:'fusion_3',
    name:'舆论操控+社会事件→认知域攻击',
    sources:['开源情报','信号情报'],
    domains:['信息舆论','军事安全'],
    pattern:'社交媒体出现协调性叙事操作，同时配合线下社会事件制造舆论热点',
    confidence:82,
    desc:'检测到有组织的认知域攻击行动，叙事模板与已知行为体特征高度匹配。',
    recommendation:'启动舆论反制，溯源披露操作网络，加强社会面信息管控',
  },
  {
    id:'fusion_4',
    name:'太空异常+军事调动→战略打击准备',
    sources:['图像情报','信号情报','开源情报'],
    domains:['太空安全','军事安全'],
    pattern:'对方侦察卫星轨道调整密集覆盖我方纵深，同时探测到战略力量调动',
    confidence:90,
    desc:'多源情报交叉印证，对方可能正在进行战略打击前的情报准备和力量部署。',
    recommendation:'立即提升至查理级战备，启动战略威慑力量待命，向对方发出明确信号',
  },
  {
    id:'fusion_5',
    name:'供应链中断+网络渗透→供应链攻击',
    sources:['开源情报','信号情报','人力情报'],
    domains:['经济安全','网络空间'],
    pattern:'关键供应链节点出现不明中断，同时检测到针对供应商系统的网络渗透痕迹',
    confidence:76,
    desc:'供应链中断与网络渗透的时空关联表明，这可能是一次协调性的供应链攻击行动。',
    recommendation:'启动供应链应急方案，排查所有关键供应商网络安全，储备替代方案',
  },
  {
    id:'fusion_6',
    name:'核活动+外交孤立→核突破信号',
    sources:['图像情报','信号情报','开源情报'],
    domains:['军事安全','外交战线'],
    pattern:'监测到核设施活动异常增加，同时相关国家外交活动骤减',
    confidence:88,
    desc:'核设施活动叠加外交孤立信号，表明某国可能在为核试验或核突破做最终准备。',
    recommendation:'启动紧急外交磋商，准备制裁方案，协调国际监测机制',
  },
  {
    id:'fusion_7',
    name:'金融异动+网络侦察→金融攻击准备',
    sources:['开源情报','信号情报'],
    domains:['经济安全','网络空间'],
    pattern:'检测到针对银行系统的网络侦察活动，同时国际资本出现异常流动',
    confidence:80,
    desc:'网络侦察与金融异动的组合表明，对方可能正在准备针对金融基础设施的攻击。',
    recommendation:'加强金融系统网络防御，准备资本管制预案，与盟友协调金融稳定措施',
  },
  {
    id:'fusion_8',
    name:'极地活动+太空部署→北极战略布局',
    sources:['图像情报','开源情报'],
    domains:['太空安全','军事安全'],
    pattern:'对方在北极地区密集部署军事设施的同时，调整卫星覆盖范围加强北极监控',
    confidence:72,
    desc:'极地地面活动与太空部署的协调表明，对方正在系统性地构建北极战略存在。',
    recommendation:'加快自身北极存在建设，加强极地监测能力，推进北极多边治理',
  },
  {
    id:'fusion_9',
    name:'基因数据窃取+量子计算→生物安全威胁',
    sources:['信号情报','开源情报','人力情报'],
    domains:['网络空间','信息舆论'],
    pattern:'检测到针对基因数据库的网络渗透，同时对方量子计算能力快速提升，可能破解现有基因加密',
    confidence:84,
    desc:'基因数据窃取配合量子计算能力，对方可能构建针对中国人群的生物特征数据库和精准识别系统，构成新型生物安全威胁。',
    recommendation:'启动基因数据安全专项行动，加快量子加密部署，建立基因数据出境审查机制',
  },
  {
    id:'fusion_10',
    name:'海峡风险+灰色对峙→能源通道危机',
    sources:['图像情报','信号情报','开源情报'],
    domains:['军事安全','经济安全'],
    pattern:'马六甲海峡军事活动增加的同时，南海灰色地带对峙升级，能源运输保险费率飙升',
    confidence:86,
    desc:'海峡军事风险叠加灰色对峙，能源通道安全面临双重压力。若同时爆发，中国80%能源进口将受影响。',
    recommendation:'提升护航等级，启动能源战略储备释放，加速中缅管道和陆上替代通道建设',
  },
];

/* ===== 跨域效果矩阵 ===== */
const DOMAIN_EFFECTS_MATRIX = {
  military:    { military:1.0,  economic:-0.7, cyber:0.8,  diplomatic:-0.6, information:0.5, space:0.7 },
  economic:    { military:-0.3, economic:1.0,  cyber:0.4,  diplomatic:0.6,  information:0.3, space:0.2 },
  cyber:       { military:0.5,  economic:-0.6, cyber:1.0,  diplomatic:-0.4, information:0.7, space:0.5 },
  diplomatic:  { military:-0.5, economic:0.5,  cyber:-0.2, diplomatic:1.0,  information:0.4, space:0.3 },
  information: { military:0.3,  economic:-0.4, cyber:0.6,  diplomatic:-0.3, information:1.0, space:0.2 },
  space:       { military:0.6,  economic:-0.2, cyber:0.5,  diplomatic:-0.3, information:0.4, space:1.0 },
};

const DOMAIN_NAMES = {
  military:'军事安全', economic:'经济安全', cyber:'网络空间',
  diplomatic:'外交战线', information:'信息舆论', space:'太空安全'
};

const DOMAIN_COLORS = {
  military:'#ff4757', economic:'#ffa502', cyber:'#00b4d8',
  diplomatic:'#2ed573', information:'#ff6348', space:'#a29bfe'
};

/* ===== 战略决策沙盘 ===== */
const STRATEGIC_DECISIONS = [
  {
    id:'sd_1',
    chainId:'chain_taiwan',
    name:'台海军事威慑升级',
    desc:'提升台海方向军事存在强度，增加海空巡逻频次',
    impacts: { military:15, economic:-20, cyber:10, diplomatic:-15, information:8, space:5 },
    risk:'高',
    riskDesc:'可能触发对方网络报复和经济制裁连锁反应',
    cascade:'→ 网络攻击(0-6h) → 经济制裁(24-72h) → 舆论战(同步)',
  },
  {
    id:'sd_2',
    chainId:'chain_taiwan',
    name:'启动金融防御预案',
    desc:'提前部署资本管制、外汇干预和金融系统防护',
    impacts: { military:0, economic:15, cyber:5, diplomatic:-5, information:0, space:0 },
    risk:'中',
    riskDesc:'可能引发市场恐慌，但能有效防范金融攻击',
    cascade:'→ 市场波动(即时) → 信心恢复(1-2周)',
  },
  {
    id:'sd_3',
    chainId:'chain_taiwan',
    name:'认知域主动塑造',
    desc:'主动发布叙事内容，塑造有利于我方的国际舆论环境',
    impacts: { military:0, economic:0, cyber:0, diplomatic:5, information:15, space:0 },
    risk:'低',
    riskDesc:'需注意信息可信度，避免过度宣传适得其反',
    cascade:'→ 国际认知调整(数周) → 外交空间扩大(1-3月)',
  },
  {
    id:'sd_4',
    chainId:'chain_indo_pacific',
    name:'深化全球南方合作',
    desc:'加强与全球南方国家的经济合作与战略协调',
    impacts: { military:3, economic:12, cyber:0, diplomatic:18, information:8, space:2 },
    risk:'低',
    riskDesc:'长期战略，短期效果有限',
    cascade:'→ 多边机制强化(数月) → 战略空间扩大(1-3年)',
  },
  {
    id:'sd_5',
    chainId:'chain_indo_pacific',
    name:'稀土出口管制',
    desc:'对关键稀土资源实施出口管制，作为反制筹码',
    impacts: { military:5, economic:-8, cyber:0, diplomatic:-10, information:5, space:3 },
    risk:'高',
    riskDesc:'可能加速对方寻找替代供应，短期筹码长期失效',
    cascade:'→ 对方供应链冲击(1-3月) → 替代方案推进(6-12月) → 筹码效力递减(1-2年)',
  },
  {
    id:'sd_6',
    chainId:'chain_indo_pacific',
    name:'推进本币结算体系',
    desc:'扩大人民币跨境支付系统覆盖，减少对环球银行金融电信系统依赖',
    impacts: { military:0, economic:18, cyber:3, diplomatic:8, information:0, space:0 },
    risk:'中',
    riskDesc:'需要多国配合，推进周期长但战略价值大',
    cascade:'→ 双边结算扩大(3-6月) → 多边框架建立(1-2年) → 去美元化加速(3-5年)',
  },
  {
    id:'sd_7',
    chainId:'chain_hybrid',
    name:'全域防御启动',
    desc:'同时启动网络防御、经济防护、信息管控和供应链保障',
    impacts: { military:5, economic:8, cyber:15, diplomatic:-5, information:10, space:3 },
    risk:'中',
    riskDesc:'资源消耗大，需精准识别威胁方向避免过度反应',
    cascade:'→ 防御部署(即时) → 威胁遏制(数天) → 反制准备(1-2周)',
  },
  {
    id:'sd_8',
    chainId:'chain_hybrid',
    name:'公开归因与反制',
    desc:'公开指控对方混合攻击行为，实施对称反制',
    impacts: { military:5, economic:-5, cyber:5, diplomatic:-8, information:12, space:0 },
    risk:'高',
    riskDesc:'可能导致冲突升级，但能争取国际支持',
    cascade:'→ 国际舆论反应(1-3天) → 外交交锋(1-2周) → 局势升级或缓和(1-3月)',
  },
  {
    id:'sd_9',
    chainId:'chain_tech',
    name:'芯片全面自主攻关',
    desc:'集中资源攻克芯片全产业链瓶颈，从材料到设计到制造',
    impacts: { military:5, economic:15, cyber:5, diplomatic:3, information:10, space:5 },
    risk:'中',
    riskDesc:'投入巨大，技术突破需要时间，短期仍有依赖',
    cascade:'→ 人才聚集(3-6月) → 技术突破(1-3年) → 自主可控(3-5年)',
  },
  {
    id:'sd_10',
    chainId:'chain_tech',
    name:'稀土战略管制',
    desc:'将稀土作为科技战反制筹码，对特定国家实施出口限制',
    impacts: { military:3, economic:-5, cyber:0, diplomatic:-8, information:5, space:3 },
    risk:'高',
    riskDesc:'短期有效但加速对方脱钩，需把握时机',
    cascade:'→ 对方芯片产业冲击(1-3月) → 替代供应推进(6-18月) → 筹码递减(2-3年)',
  },
  {
    id:'sd_11',
    chainId:'chain_middle_east',
    name:'能源通道多元化',
    desc:'推进中缅油气管道、中亚管道等多通道建设，降低马六甲依赖',
    impacts: { military:5, economic:12, cyber:0, diplomatic:8, information:0, space:2 },
    risk:'低',
    riskDesc:'长期工程，短期效果有限但战略意义重大',
    cascade:'→ 通道建设(1-3年) → 依赖降低(3-5年) → 能源安全提升(5-10年)',
  },
  {
    id:'sd_12',
    chainId:'chain_arctic',
    name:'北极科考站网络建设',
    desc:'在北极建设多个科考站，奠定实质存在基础',
    impacts: { military:5, economic:5, cyber:0, diplomatic:8, information:3, space:5 },
    risk:'低',
    riskDesc:'投资大见效慢，但合法合规且不可逆',
    cascade:'→ 选址建设(1-2年) → 科考常态化(2-3年) → 战略存在(3-5年)',
  },
  {
    id:'sd_13',
    chainId:'chain_malacca',
    name:'中缅油气管道扩能',
    desc:'扩建中缅油气管道运力，降低对马六甲海峡的能源运输依赖',
    impacts: { military:8, economic:15, cyber:0, diplomatic:5, information:0, space:2 },
    risk:'低',
    riskDesc:'长期工程投资大，但战略意义重大且不可逆',
    cascade:'→ 管道扩建(1-2年) → 运力提升(2-3年) → 马六甲依赖降低30%(3-5年)',
  },
  {
    id:'sd_14',
    chainId:'chain_malacca',
    name:'印度洋护航编队常态化',
    desc:'在印度洋部署常态化护航编队，保障海上能源通道安全',
    impacts: { military:15, economic:8, cyber:0, diplomatic:-5, information:3, space:3 },
    risk:'中',
    riskDesc:'可能被视为海上扩张，引发地区国家警惕',
    cascade:'→ 编队部署(即时) → 威慑效果(数月) → 通道安全提升(持续)',
  },
  {
    id:'sd_15',
    chainId:'chain_malacca',
    name:'海上灰色反制行动',
    desc:'以海警和执法力量对等反制对方灰色地带施压',
    impacts: { military:10, economic:-5, cyber:0, diplomatic:-8, information:8, space:0 },
    risk:'高',
    riskDesc:'灰色对峙可能意外升级为军事冲突',
    cascade:'→ 对峙升级(即时) → 国际关注(1-3天) → 外交斡旋(1-2周)',
  },
  {
    id:'sd_16',
    chainId:'chain_quantum',
    name:'量子通信全国网部署',
    desc:'加快建设覆盖全国的量子保密通信网络，保障关键通信安全',
    impacts: { military:5, economic:8, cyber:18, diplomatic:3, information:8, space:5 },
    risk:'中',
    riskDesc:'技术成熟度和成本是主要挑战，但战略价值极高',
    cascade:'→ 骨干网建成(1-2年) → 全国覆盖(3-5年) → 通信安全不可窃听(5-8年)',
  },
  {
    id:'sd_17',
    chainId:'chain_quantum',
    name:'基因数据出境管制',
    desc:'实施严格的基因数据出境管制，建立国家级基因数据库',
    impacts: { military:3, economic:-5, cyber:12, diplomatic:-5, information:10, space:0 },
    risk:'中',
    riskDesc:'可能影响国际合作，但生物安全至关重要',
    cascade:'→ 法规出台(3-6月) → 数据库建设(1-2年) → 基因安全屏障(2-3年)',
  },
  {
    id:'sd_18',
    chainId:'chain_quantum',
    name:'量子计算举国攻关',
    desc:'集中全国资源攻克量子计算关键瓶颈，争取实现量子霸权',
    impacts: { military:8, economic:10, cyber:10, diplomatic:5, information:15, space:8 },
    risk:'高',
    riskDesc:'投入巨大且技术路线不确定，失败风险存在',
    cascade:'→ 人才聚集(6-12月) → 技术突破(2-5年) → 量子优势(5-10年)',
  },
];

/* ===== 综合评估指标 ===== */
const ASSESSMENT_DIMENSIONS = [
  { key:'military',     name:'军事安全', weight:0.2, desc:'军事实力、战备水平、威慑能力' },
  { key:'economic',     name:'经济安全', weight:0.2, desc:'经济韧性、金融稳定、资源保障' },
  { key:'cyber',        name:'网络安全', weight:0.15,desc:'网络防御、攻击能力、数字基础设施' },
  { key:'diplomatic',   name:'外交安全', weight:0.15,desc:'国际影响力、盟友网络、多边参与' },
  { key:'information',  name:'信息安全', weight:0.15,desc:'舆论掌控、认知防御、叙事能力' },
  { key:'space',        name:'太空安全', weight:0.15,desc:'太空资产、轨道控制、卫星能力' },
];


/* ===== 综合推演状态（四阶段状态机） ===== */
/* 阶段: selection(选择推演链) → planning(战略规划) → execution(逐场景执行) → analysis(综合分析) */
const STRATEGIC_STATE = {
  phase: 'selection',
  activeChain: null,

  /* 规划阶段 */
  selectedDecisions: [],
  decisionImpacts: { military:0, economic:0, cyber:0, diplomatic:0, information:0, space:0 },

  /* 执行阶段 */
  currentScenarioIndex: 0,
  scenarioResults: [],
  globalState: {},
  conductionEffects: [],
  fusionAlerts: [],
  eventLog: [],
  executionMode: 'auto',
  isExecuting: false,

  /* 分析阶段 */
  finalAssessment: null,
};

/* ===== 战略推演引擎 ===== */
const StrategicEngine = {

  /* ---- 获取场景可用行动（与 Wargame 引擎同逻辑） ---- */
  _getAvailableActions(scenario, sideColor){
    if(typeof STRATEGIC_ACTIONS === 'undefined') return [];
    const sc = sideColor || 'red';
    const responseDomains = scenario.response || ['military','diplomatic','economic'];
    const allowed = [...new Set([...responseDomains, 'domestic'])];
    const general = STRATEGIC_ACTIONS.filter(a => a.scenario === null && allowed.includes(a.domain));
    const special = STRATEGIC_ACTIONS.filter(a => {
      if(a.scenario !== scenario.id) return false;
      if(a.side) return a.side === sc;
      return sc === 'red';
    });
    return [...general, ...special];
  },

  /* ---- 计算行动成功率（融合支援行动加成） ---- */
  _calcSuccessRate(action, state, supportRateBonus){
    let rate = action.successBase || 60;
    const domainVal = state.domains[action.domain] || 50;
    rate += (domainVal - 50) * 0.2;
    rate += (state.reputation - 50) * 0.1;
    rate += (state.domesticSupport - 50) * 0.05;
    if(action.domain === 'diplomatic' && state.escalation >= 3) rate -= 8;
    if(state.funding > (action.fundingCost || 0) * 3) rate += 3;
    /* 支援行动成功率加成 */
    if(supportRateBonus){
      if(supportRateBonus[action.domain]) rate += supportRateBonus[action.domain];
      if(supportRateBonus.all) rate += supportRateBonus.all;
    }
    return Math.max(20, Math.min(95, Math.round(rate)));
  },

  /* ---- AI 智能选择行动 ---- */
  _selectActions(actions, state, maxAP){
    const weakDomains = Object.entries(state.domains)
      .sort(([,a],[,b]) => a - b).slice(0, 3).map(([k]) => k);

    const scored = actions.map(a => {
      let score = 0;
      Object.entries(a.effects || {}).forEach(([k, v]) => {
        if(v > 0 && weakDomains.includes(k)) score += v * 2.5;
        else if(v > 0) score += v;
        if(v < 0) score += v * 0.3;
      });
      score -= (a.cost || 1) * 0.5;
      score += (a.successBase || 50) * 0.08;
      if(a.escalation >= 2 && state.escalation >= 3) score -= 8;
      score += Math.random() * 6;
      return { action: a, score, cost: a.cost || 1 };
    }).sort((a, b) => b.score - a.score);

    const selected = [];
    let ap = maxAP;
    for(const s of scored){
      if(ap >= s.cost && selected.length < 4){
        selected.push(s.action);
        ap -= s.cost;
      }
    }
    return selected;
  },

  /* ---- AI 选择支援行动（一体化融合） ---- */
  _selectSupportActions(state, maxAP){
    if(typeof SUPPORT_ACTIONS === 'undefined') return [];
    const weakDomains = Object.entries(state.domains)
      .sort(([,a],[,b]) => a - b).slice(0, 3).map(([k]) => k);

    const available = SUPPORT_ACTIONS.map(sa => {
      let score = 0;
      /* 支援最弱领域获得高分 */
      if(sa.supportEffects && sa.supportEffects.successRateBonus){
        Object.keys(sa.supportEffects.successRateBonus).forEach(d => {
          if(weakDomains.includes(d)) score += 15;
          else score += 5;
        });
      }
      /* 军事弱势时优先力量战备提升 */
      if(sa.supportEffects && sa.supportEffects.forceReadyBoost && state.domains.military < 60) score += 12;
      /* 资金不足时优先资金获取 */
      if(sa.supportEffects && sa.supportEffects.extraFunding && state.funding < 300) score += 13;
      /* 升级度过高时优先降级 */
      if(sa.supportEffects && sa.supportEffects.escalationChange < 0 && state.escalation >= 4) score += 10;
      /* 侦察价值 */
      if(sa.supportEffects && sa.supportEffects.revealEnemy) score += 7;
      /* 敌方削弱在高对抗场景有价值 */
      if(sa.supportEffects && sa.supportEffects.enemyDebuff && state.escalation >= 2) score += 6;
      /* 风险惩罚 */
      score -= (sa.risk || 0) * 8;
      /* 随机因子 */
      score += Math.random() * 5;
      return { action: sa, score, cost: sa.cost || 1 };
    }).sort((a, b) => b.score - a.score);

    const selected = [];
    let ap = maxAP;
    for(const s of available){
      if(ap >= s.cost && selected.length < 3){
        selected.push(s.action);
        ap -= s.cost;
      }
    }
    return selected;
  },

  /* ---- 计算支援行动成功率 ---- */
  _calcSupportSuccessRate(action, state){
    let rate = action.successBase || 80;
    const domainVal = state.domains.information || 50;
    rate += (domainVal - 50) * 0.15;
    rate += (state.reputation - 50) * 0.08;
    if(state.escalation >= 3) rate -= 5;
    if(state.funding > (action.fundingCost || 0) * 3) rate += 3;
    return Math.max(25, Math.min(95, Math.round(rate)));
  },

  /* ---- 执行支援行动并返回效果集合 ---- */
  _executeSupportActions(selectedActions, state){
    const effects = {
      domainChanges: {},
      successRateBonus: {},
      forceReadyBoost: {},
      fundCostReduce: 0,
      escalationChange: 0,
      extraFunding: 0,
      revealEnemy: false,
      enemyDebuff: {},
      log: [],
      totalCost: 0,
    };

    selectedActions.forEach(act => {
      const successRate = this._calcSupportSuccessRate(act, state);
      const roll = Math.floor(Math.random() * 100) + 1;
      const isGreat = roll <= successRate * 0.25;
      const isSuccess = roll <= successRate;
      const mult = isGreat ? 1.5 : isSuccess ? 1.0 : 0.3;

      /* 应用域效果 */
      if(act.effects){
        Object.entries(act.effects).forEach(([k, v]) => {
          effects.domainChanges[k] = (effects.domainChanges[k] || 0) + Math.round(v * mult);
        });
      }

      /* 应用支援效果 */
      if(act.supportEffects){
        const se = act.supportEffects;

        /* 行动成功率加成 */
        if(se.successRateBonus){
          Object.entries(se.successRateBonus).forEach(([k, v]) => {
            effects.successRateBonus[k] = Math.round((effects.successRateBonus[k] || 0) + v * mult);
          });
        }

        /* 力量战备提升 */
        if(se.forceReadyBoost){
          Object.entries(se.forceReadyBoost).forEach(([k, v]) => {
            effects.forceReadyBoost[k] = (effects.forceReadyBoost[k] || 0) + Math.round(v * mult);
          });
        }

        /* 资金消耗降低 */
        if(se.fundCostReduce){
          effects.fundCostReduce += Math.round(se.fundCostReduce * mult);
        }

        /* 升级度变化 */
        if(se.escalationChange){
          effects.escalationChange += Math.round(se.escalationChange * mult);
        }

        /* 额外资金获取 */
        if(se.extraFunding){
          effects.extraFunding += Math.round(se.extraFunding * mult);
        }

        /* 侦察暴露 */
        if(se.revealEnemy) effects.revealEnemy = true;

        /* 敌方削弱 */
        if(se.enemyDebuff){
          Object.entries(se.enemyDebuff).forEach(([k, v]) => {
            effects.enemyDebuff[k] = (effects.enemyDebuff[k] || 0) + Math.round(v * mult);
          });
        }
      }

      /* 资金消耗 */
      effects.totalCost += (act.fundingCost || 0);

      /* 高风险行动失败反噬 */
      if(!isSuccess && (act.risk || 0) >= 0.2){
        const actDomainMap = { intel:'information', logistics:'military', economy:'economic', diplomatic:'diplomatic', tech:'information' };
        const actDomain = actDomainMap[act.category] || 'information';
        effects.domainChanges[actDomain] = (effects.domainChanges[actDomain] || 0) - 3;
      }

      effects.log.push({
        action: act.name,
        category: act.category,
        roll, successRate,
        result: isGreat ? '大成功' : isSuccess ? '成功' : '失败',
        mult,
        cost: act.cost || 1,
        fundingCost: act.fundingCost || 0,
      });
    });

    return effects;
  },

  /* ---- AI 选择反制行动 ---- */
  _selectAICounter(scenario, state, playerActions){
    if(playerActions.length === 0) return null;
    const lastAction = playerActions[playerActions.length - 1];
    if(lastAction.counter){
      const counter = STRATEGIC_ACTIONS.find(a => a.id === lastAction.counter);
      if(counter) return counter;
    }
    const blueActions = STRATEGIC_ACTIONS.filter(a => a.scenario === scenario.id && a.side === 'blue');
    if(blueActions.length > 0) return blueActions[Math.floor(Math.random() * blueActions.length)];
    const generic = STRATEGIC_ACTIONS.filter(a => a.scenario === null && a.domain === 'military' && !a.side);
    if(generic.length > 0) return generic[Math.floor(Math.random() * generic.length)];
    return null;
  },

  /* ---- 核心：自动推演一个场景 ---- */
  autoResolve(scenario, initialDomains, decisionModifiers, conductionModifiers, forceBonuses){
    const sides = (typeof getScenarioSides === 'function') ? getScenarioSides(scenario.id) : null;
    const actions = this._getAvailableActions(scenario, 'red');

    /* 合并初始域值：基线 + 决策修正 + 传导修正 + 军力加成 */
    const startDomains = {};
    const allKeys = ['military','economic','cyber','diplomatic','information','domestic'];
    allKeys.forEach(k => {
      let v = initialDomains[k] || initialDomains[k.replace('domestic','information')] || 50;
      v += (decisionModifiers[k] || 0);
      v += (conductionModifiers[k] || 0);
      v += (forceBonuses && forceBonuses[k] || 0);
      startDomains[k] = Math.max(10, Math.min(95, Math.round(v)));
    });
    /* 映射 space → information 用于内部计算（wargame 六域不含 space） */
    if(initialDomains.space !== undefined && startDomains.information !== undefined){
      startDomains.information += (initialDomains.space - 50) * 0.2;
    }

    const forces = (typeof getScenarioForces === 'function')
      ? getScenarioForces(scenario.id).map(f => ({ ...f, readiness: Math.max(20, Math.min(100, (f.readiness||70) + (forceBonuses && forceBonuses.military || 0) * 0.3)) }))
      : (typeof FORCES !== 'undefined' ? FORCES.map(f => ({ ...f })) : []);

    let state = {
      round: 1,
      maxRounds: scenario.duration || 4,
      domains: { ...startDomains },
      escalation: 1,
      reputation: 60,
      domesticSupport: 60,
      funding: (typeof scenario.budget === 'number' ? scenario.budget : 500),
      forces,
      log: [],
      roundByRound: [],
    };

    /* 逐轮推演（一体化融合：支援→战略→反制） */
    while(state.round <= state.maxRounds){

      /* === 阶段一：选择并执行支援行动 === */
      const supportActions = this._selectSupportActions(state, 2);
      let supportResults = null;
      let supportRateBonus = {};

      if(supportActions.length > 0){
        supportResults = this._executeSupportActions(supportActions, state);

        /* 应用支援域效果 */
        Object.entries(supportResults.domainChanges).forEach(([k, v]) => {
          state.domains[k] = Math.max(0, Math.min(100, (state.domains[k] || 50) + v));
        });

        /* 应用力量战备提升 */
        if(supportResults.forceReadyBoost){
          state.forces.forEach(f => {
            const key = f.name || f.branch || '';
            const boost = supportResults.forceReadyBoost[key] || supportResults.forceReadyBoost.all || 0;
            f.readiness = Math.min(100, (f.readiness || 70) + boost);
          });
        }

        /* 应用资金变化 */
        state.funding += supportResults.extraFunding;
        state.funding -= supportResults.totalCost;

        /* 应用升级度变化 */
        state.escalation = Math.max(1, Math.min(5, state.escalation + supportResults.escalationChange));

        /* 记录支援成功率加成供后续战略行动使用 */
        supportRateBonus = supportResults.successRateBonus;
      }

      /* === 阶段二：选择并执行战略行动 === */
      const supportAP = supportActions.length > 0 ? supportResults.log.reduce((s, l) => s + l.cost, 0) : 0;
      const remainingAP = Math.max(1, 5 - supportAP);
      const playerActions = this._selectActions(actions, state, remainingAP);
      const playerEffects = {};
      const diceResults = [];

      playerActions.forEach(act => {
        const successRate = this._calcSuccessRate(act, state, supportRateBonus);
        const roll = Math.floor(Math.random() * 100) + 1;
        const isGreat = roll <= successRate * 0.25;
        const isSuccess = roll <= successRate;
        const mult = isGreat ? 1.5 : isSuccess ? 1.0 : 0.3;

        Object.entries(act.effects || {}).forEach(([k, v]) => {
          playerEffects[k] = (playerEffects[k] || 0) + v * mult;
        });
        if(!isSuccess){
          playerEffects[act.domain] = (playerEffects[act.domain] || 0) - 3;
        }
        diceResults.push({
          action: act.name, roll, successRate,
          result: isGreat ? '大成功' : isSuccess ? '成功' : '失败',
          mult,
        });
        /* 支援效果：资金消耗降低 */
        const fc = (act.fundingCost || 0);
        const reducedFc = supportResults && supportResults.fundCostReduce > 0
          ? Math.max(0, fc - Math.round(fc * supportResults.fundCostReduce / 100))
          : fc;
        state.funding -= reducedFc;
      });

      /* === 阶段三：AI 反制（受支援行动敌方削弱影响） === */
      const aiAction = this._selectAICounter(scenario, state, playerActions);
      const aiEffects = {};
      if(aiAction){
        let aiSuccessRate = 0.65;
        /* 侦察暴露降低AI成功率 */
        if(supportResults && supportResults.revealEnemy) aiSuccessRate -= 0.12;
        /* 敌方削弱进一步降低 */
        if(supportResults && supportResults.enemyDebuff){
          const debuffSum = Object.values(supportResults.enemyDebuff).reduce((s, v) => s + Math.abs(v), 0);
          aiSuccessRate -= Math.min(0.15, debuffSum * 0.01);
        }
        const aiSuccess = Math.random() < Math.max(0.3, aiSuccessRate);
        const aiMult = aiSuccess ? 0.8 : 0.3;
        Object.entries(aiAction.effects || {}).forEach(([k, v]) => {
          aiEffects[k] = (aiEffects[k] || 0) - Math.abs(v) * aiMult;
        });
        state.log.push({
          round: state.round,
          type: 'ai',
          action: aiAction.name,
          success: aiSuccess,
        });
      }

      /* === 阶段四：合并效果 === */
      const merged = {};
      const allDomains = Object.keys({...playerEffects, ...aiEffects});
      allDomains.forEach(k => {
        const p = playerEffects[k] || 0;
        const a = aiEffects[k] || 0;
        merged[k] = Math.max(-30, Math.min(30, p + a));
        state.domains[k] = Math.max(0, Math.min(100, (state.domains[k] || 50) + merged[k]));
      });

      /* 升级度（含支援行动介入） */
      const escPush = playerActions.reduce((s, a) => s + (a.escalation || 0), 0);
      state.escalation = Math.max(1, Math.min(5, state.escalation + Math.round(escPush / 2)));

      /* 声望 */
      playerActions.forEach(a => {
        if(a.escalation >= 2 && a.repEffect) state.reputation += a.repEffect * 0.5;
        else if(a.escalation <= 0 && a.repEffect > 0) state.reputation += a.repEffect * 0.3;
      });
      state.reputation = Math.max(0, Math.min(100, state.reputation));

      /* 国内支持 */
      playerActions.forEach(a => {
        if(a.domEffect) state.domesticSupport += a.domEffect * 0.4;
      });
      state.domesticSupport = Math.max(0, Math.min(100, state.domesticSupport));

      /* 力量消耗 */
      state.forces.forEach(f => {
        const militaryActs = playerActions.filter(a => a.domain === 'military');
        const maxRisk = militaryActs.length > 0
          ? Math.max(...militaryActs.map(a => a.risk || 0.1))
          : 0;
        if(maxRisk >= 0.3) f.readiness = Math.max(20, (f.readiness || 70) - 4);
        else if(maxRisk >= 0.15) f.readiness = Math.max(20, (f.readiness || 70) - 2);
        else if(militaryActs.length > 0) f.readiness = Math.max(20, (f.readiness || 70) - 1);
        const greats = diceResults.filter(d => d.result === '大成功').length;
        f.readiness = Math.min(100, f.readiness + greats * 2);
      });

      /* 记录轮次（含支援行动） */
      state.roundByRound.push({
        round: state.round,
        domains: { ...state.domains },
        escalation: state.escalation,
        reputation: Math.round(state.reputation),
        domesticSupport: Math.round(state.domesticSupport),
        supportActions: supportResults ? supportResults.log : [],
        playerActions: playerActions.map(a => a.name),
        aiAction: aiAction ? aiAction.name : '观察观望',
        diceResults,
        effects: merged,
      });

      /* 下一轮恢复 */
      state.forces.forEach(f => { f.readiness = Math.min(100, (f.readiness||70) + 2); });
      if(state.domains.economic >= 50) state.funding += state.funding * 0.03;

      state.round++;
    }

    /* 计算最终得分 */
    const avgDomain = Object.values(state.domains).reduce((a, v) => a + v, 0) / allKeys.length;
    const repScore = state.reputation;
    const domScore = state.domesticSupport;
    const escScore = (6 - state.escalation) * 20;
    const fundingRatio = Math.max(0, state.funding / ((typeof scenario.budget === 'number' ? scenario.budget : 500)));
    const fundingScore = Math.round(20 + fundingRatio * 80);
    const finalScore = Math.round(avgDomain * 0.35 + repScore * 0.20 + domScore * 0.20 + fundingScore * 0.10 + escScore * 0.15);

    /* 域变化 */
    const domainChanges = {};
    allKeys.forEach(k => {
      domainChanges[k] = Math.round(state.domains[k] - (startDomains[k] || 50));
    });

    return {
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      score: finalScore,
      grade: finalScore >= 85 ? 'S' : finalScore >= 75 ? 'A' : finalScore >= 60 ? 'B' : finalScore >= 45 ? 'C' : 'D',
      gradeColor: finalScore >= 75 ? 'var(--green)' : finalScore >= 60 ? 'var(--cyan)' : finalScore >= 45 ? 'var(--amber)' : 'var(--red)',
      domains: { ...state.domains },
      initialDomains: { ...startDomains },
      domainChanges,
      escalation: state.escalation,
      reputation: Math.round(state.reputation),
      domesticSupport: Math.round(state.domesticSupport),
      funding: Math.round(state.funding),
      forces: state.forces.map(f => ({ name: f.name || f.branch, readiness: Math.round(f.readiness || 70) })),
      roundByRound: state.roundByRound,
      roundsPlayed: state.maxRounds,
      playerSide: sides ? sides.red : null,
      opponentSide: sides ? sides.blue : null,
    };
  },

  /* ---- 计算跨域传导效果 ---- */
  computeConduction(chain, fromResult, toScenarioId){
    const effects = { military:0, economic:0, cyber:0, diplomatic:0, information:0, space:0 };
    let connections = [];

    chain.connections.forEach(conn => {
      if(conn.from === fromResult.scenarioId && conn.to === toScenarioId){
        connections.push(conn);
        /* 直接传导：域变化 × 连接强度 × 0.5 */
        Object.entries(fromResult.domainChanges).forEach(([domain, change]) => {
          /* wargame 用 domestic，传导用 information 映射 */
          const condDomain = domain === 'domestic' ? 'information' : domain;
          effects[condDomain] = (effects[condDomain] || 0) + change * conn.strength * 0.4;
        });

        /* 跨域矩阵传播 */
        Object.entries(fromResult.domainChanges).forEach(([domain, change]) => {
          const condDomain = domain === 'domestic' ? 'information' : domain;
          const matrix = DOMAIN_EFFECTS_MATRIX[condDomain];
          if(matrix){
            Object.entries(matrix).forEach(([targetDomain, mult]) => {
              if(targetDomain !== condDomain && Math.abs(mult) > 0.1){
                effects[targetDomain] = (effects[targetDomain] || 0) + change * conn.strength * mult * 0.2;
              }
            });
          }
        });
      }
    });

    /* 钳制 */
    Object.keys(effects).forEach(k => {
      effects[k] = Math.max(-20, Math.min(20, Math.round(effects[k])));
    });

    return { effects, connections };
  },

  /* ---- 检查情报串并规则 ---- */
  checkFusionRules(globalState, scenarioResult){
    const triggered = [];
    INTEL_FUSION_RULES.forEach(rule => {
      const domainKeys = rule.domains.map(d => {
        return Object.keys(DOMAIN_NAMES).find(k => DOMAIN_NAMES[k] === d) || d;
      });
      const domainValues = domainKeys.map(k => globalState[k] || 50);
      const highCount = domainValues.filter(v => v >= 70).length;
      const crisisCount = domainValues.filter(v => v >= 85).length;

      if(highCount >= 2 || crisisCount >= 1){
        triggered.push({
          ruleId: rule.id,
          ruleName: rule.name,
          confidence: rule.confidence,
          recommendation: rule.recommendation,
          triggeredAt: scenarioResult.scenarioName,
          domainStates: domainKeys.map((k, i) => ({ domain: k, name: DOMAIN_NAMES[k] || k, value: domainValues[i] })),
        });
      }
    });
    return triggered;
  },

  /* ---- 计算最终综合评估 ---- */
  computeFinalAssessment(chain, scenarioResults, globalState, decisions, fusionAlerts){
    const avgScore = Math.round(scenarioResults.reduce((s, r) => s + r.score, 0) / scenarioResults.length);
    const bestScenario = [...scenarioResults].sort((a, b) => b.score - a.score)[0];
    const worstScenario = [...scenarioResults].sort((a, b) => a.score - b.score)[0];

    /* 域演化轨迹 */
    const domainEvolution = {};
    Object.keys(DOMAIN_NAMES).forEach(d => {
      domainEvolution[d] = scenarioResults.map(r => {
        /* 映射 domestic → information, space 独立 */
        if(d === 'space') return r.domains.information || 50;
        return r.domains[d] || r.domains[d === 'information' ? 'information' : 'military'] || 50;
      });
    });

    /* 战略姿态分析 */
    const posture = { offensive:0, defensive:0, deterrence:0 };
    decisions.forEach(did => {
      const d = STRATEGIC_DECISIONS.find(x => x.id === did);
      if(d){
        if(d.impacts.military > 10) posture.offensive++;
        if(d.impacts.economic > 10 || d.impacts.cyber > 10) posture.defensive++;
        if(d.impacts.diplomatic > 5) posture.deterrence++;
      }
    });

    /* 全域变化总量 */
    const totalDomainShift = scenarioResults.reduce((sum, r) => {
      return sum + Object.values(r.domainChanges).reduce((s, v) => s + Math.abs(v), 0);
    }, 0);

    /* 评级 */
    const grade = avgScore >= 85 ? 'S' : avgScore >= 75 ? 'A' : avgScore >= 60 ? 'B' : avgScore >= 45 ? 'C' : 'D';
    const gradeDesc = avgScore >= 85 ? '战略大师级表现' : avgScore >= 75 ? '优秀的战略指挥' : avgScore >= 60 ? '合格的应对策略' : avgScore >= 45 ? '勉强维持态势' : '战略态势严重恶化';

    /* 建议 */
    const recommendations = this._genRecommendations(avgScore, domainEvolution, posture, fusionAlerts, totalDomainShift);

    return {
      avgScore, grade, gradeDesc, gradeColor: avgScore >= 75 ? 'var(--green)' : avgScore >= 60 ? 'var(--cyan)' : avgScore >= 45 ? 'var(--amber)' : 'var(--red)',
      domainEvolution, posture, totalDomainShift,
      bestScenario, worstScenario,
      fusionAlerts,
      scenarioCount: scenarioResults.length,
      decisionCount: decisions.length,
      recommendations,
    };
  },

  _genRecommendations(score, domainEvolution, posture, fusionAlerts, totalShift){
    const recs = [];
    if(score >= 80) recs.push('综合战略表现优异，建议总结成功经验形成战例库');
    else if(score >= 60) recs.push('综合战略表现合格，部分领域有待优化');
    else recs.push('综合战略态势不理想，建议重新审视战略方向和资源配置');

    const finalDomains = Object.entries(domainEvolution).map(([k, v]) => ({
      domain: k, name: DOMAIN_NAMES[k], value: v[v.length - 1]
    })).sort((a, b) => a.value - b.value);

    if(finalDomains[0] && finalDomains[0].value < 40){
      recs.push(`${finalDomains[0].name}领域严重不足（${finalDomains[0].value}），建议在后续推演中优先加强`);
    }
    if(finalDomains[1] && finalDomains[1].value < 50){
      recs.push(`${finalDomains[1].name}领域承压（${finalDomains[1].value}），需要补充战略资源`);
    }

    if(posture.offensive > posture.defensive + 1){
      recs.push('战略姿态偏进攻性，建议增加防御性和经济韧性措施以平衡风险');
    } else if(posture.defensive > posture.offensive + 2){
      recs.push('战略姿态偏防御性，可考虑增加主动威慑和外交出击手段');
    }

    if(fusionAlerts.length >= 3){
      recs.push(`情报串并触发${fusionAlerts.length}次预警，建议加强多源情报融合和预警响应机制`);
    }
    if(totalShift > 150){
      recs.push('全域态势波动剧烈，建议加强战略稳定性和危机管控能力');
    }

    return recs;
  },
};

/* ===== 渲染：综合战略推演中心（主入口） ===== */
function renderStrategicOps(){
  switch(STRATEGIC_STATE.phase){
    case 'planning':   return _renderPlanning();
    case 'execution':  return _renderExecution();
    case 'analysis':   return _renderAnalysis();
    default:           return _renderSelection();
  }
}

/* ===== 渲染：阶段一 — 推演链选择 ===== */
function _renderSelection(){
  const chain = STRATEGIC_STATE.activeChain ? STRATEGIC_CHAINS.find(c => c.id === STRATEGIC_STATE.activeChain) : null;
  return `
    <div class="strategic-ops">
      <div class="so-header fade-in">
        <div class="so-title-block">
          <div class="so-icon">🌐</div>
          <div>
            <div class="so-title">综合战略推演中心</div>
            <div class="so-subtitle">四阶段全链路推演 · 跨域传导 · 情报串并 · 实战裁决 · 综合评估</div>
          </div>
        </div>
        <div class="so-status-bar">
          <div class="so-stat"><span class="so-stat-val">${STRATEGIC_CHAINS.length}</span><span class="so-stat-label">推演链</span></div>
          <div class="so-stat"><span class="so-stat-val">${INTEL_FUSION_RULES.length}</span><span class="so-stat-label">串并规则</span></div>
          <div class="so-stat"><span class="so-stat-val">${STRATEGIC_DECISIONS.length}</span><span class="so-stat-label">决策选项</span></div>
          <div class="so-stat"><span class="so-stat-val" style="color:var(--cyan)">实战引擎</span><span class="so-stat-label">推演模式</span></div>
        </div>
      </div>

      <!-- 四阶段流程指示器 -->
      <div class="so-phase-bar panel fade-in">
        <div class="so-phase-item active"><span class="so-phase-num">1</span><span class="so-phase-name">选择推演链</span></div>
        <div class="so-phase-line"></div>
        <div class="so-phase-item"><span class="so-phase-num">2</span><span class="so-phase-name">战略规划</span></div>
        <div class="so-phase-line"></div>
        <div class="so-phase-item"><span class="so-phase-num">3</span><span class="so-phase-name">逐场景推演</span></div>
        <div class="so-phase-line"></div>
        <div class="so-phase-item"><span class="so-phase-num">4</span><span class="so-phase-name">综合分析</span></div>
      </div>

      <!-- 推演链选择器 -->
      <div class="so-chain-selector panel fade-in">
        <div class="panel-title">🔗 选择综合推演场景链</div>
        <div class="so-chain-desc-text">每条推演链将多个关联场景串联，通过跨域传导引擎实现真实的级联效应。选择后进入战略规划阶段。</div>
        <div class="so-chain-grid">
          ${STRATEGIC_CHAINS.map(c => `
            <div class="so-chain-card ${STRATEGIC_STATE.activeChain === c.id ? 'active' : ''}" data-chain="${c.id}" style="--chain-color:${c.color}">
              <div class="so-chain-icon">${c.icon}</div>
              <div class="so-chain-info">
                <div class="so-chain-name">${c.name}</div>
                <div class="so-chain-meta">
                  <span style="color:${c.color}">${'★'.repeat(c.difficulty)}${'☆'.repeat(5-c.difficulty)}</span>
                  <span>${c.scenarios.length}个场景</span>
                  <span>${c.connections.length}条关联</span>
                </div>
                <div class="so-chain-desc-line">${c.desc}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      ${chain ? `
        <div class="panel fade-in so-chain-detail">
          <div class="panel-header">
            <div class="panel-title">${chain.icon} ${chain.name}</div>
            <button class="btn btn-sm btn-amber" onclick="StrategicOps.enterPlanning()">进入战略规划 →</button>
          </div>
          <div class="so-chain-objective">
            <span class="so-obj-label">推演目标</span>
            <span class="so-obj-text">${chain.objective}</span>
          </div>
          <div class="so-chain-svg-wrap">
            ${renderChainSVG(chain)}
          </div>
          <div class="so-chain-key-decisions">
            <div class="so-kd-title">关键决策点</div>
            <div class="so-kd-grid">
              ${chain.keyDecisions.map((kd, i) => `
                <div class="so-kd-item"><div class="so-kd-num">${i+1}</div><div class="so-kd-text">${kd}</div></div>
              `).join('')}
            </div>
          </div>
        </div>
      ` : `
        <div class="so-empty-state panel fade-in">
          <div class="so-empty-icon">🌐</div>
          <div class="so-empty-title">选择一条推演链开始</div>
          <div class="so-empty-desc">每条推演链串联多个关联场景，通过跨域传导引擎实现真实的级联效应，提供情报串并分析和战略决策沙盘</div>
        </div>
      `}
    </div>
  `;
}

/* ===== 渲染：阶段二 — 战略规划 ===== */
function _renderPlanning(){
  const chain = STRATEGIC_CHAINS.find(c => c.id === STRATEGIC_STATE.activeChain);
  if(!chain) return _renderSelection();
  const chainDecisions = STRATEGIC_DECISIONS.filter(d => d.chainId === chain.id);
  const globalState = chain.globalState;

  /* 计算决策影响预览 */
  const adjustedState = {};
  Object.keys(DOMAIN_NAMES).forEach(d => {
    let v = globalState[d] || 50;
    STRATEGIC_STATE.selectedDecisions.forEach(did => {
      const dec = STRATEGIC_DECISIONS.find(x => x.id === did);
      if(dec) v += (dec.impacts[d] || 0);
    });
    adjustedState[d] = Math.max(0, Math.min(100, Math.round(v)));
  });

  /* 获取相关情报串并规则 */
  const chainDomainIds = [...new Set(chain.scenarios.map(s => s.domain))];
  const relevantFusion = INTEL_FUSION_RULES.filter(r => {
    return r.domains.some(d => {
      const key = Object.keys(DOMAIN_NAMES).find(k => DOMAIN_NAMES[k] === d);
      return chainDomainIds.includes(key);
    });
  });

  /* 获取军力数据 */
  const forcesData = (typeof FORCES !== 'undefined') ? FORCES : [];
  /* 获取威胁数据 */
  const threatsData = (typeof THREATS !== 'undefined') ? THREATS.filter(t => chainDomainIds.includes(t.type)) : [];
  /* 获取全域态势 */
  const domainsData = (typeof DOMAINS !== 'undefined') ? DOMAINS : [];

  return `
    <div class="strategic-ops">
      ${_renderPhaseBar(2)}
      <div class="so-header fade-in">
        <div class="so-title-block">
          <div class="so-icon">${chain.icon}</div>
          <div>
            <div class="so-title">${chain.name} — 战略规划</div>
            <div class="so-subtitle">选择战略决策 · 预览全域影响 · 审查情报预警 · 部署军力资源</div>
          </div>
        </div>
        <div class="so-status-bar">
          <div class="so-stat"><span class="so-stat-val">${STRATEGIC_STATE.selectedDecisions.length}</span><span class="so-stat-label">已选决策</span></div>
          <div class="so-stat"><span class="so-stat-val">${chain.scenarios.length}</span><span class="so-stat-label">待推演场景</span></div>
          <div class="so-stat"><span class="so-stat-val">${relevantFusion.length}</span><span class="so-stat-label">相关情报规则</span></div>
        </div>
      </div>

      <div class="so-planning-grid">
        <!-- 左列：战略决策 + 军力部署 -->
        <div class="so-planning-left">
          <!-- 战略决策沙盘 -->
          <div class="panel fade-in">
            <div class="panel-header">
              <div class="panel-title">♟️ 战略决策沙盘</div>
              <span style="font-size:12px;color:var(--txt-2)">已选 ${STRATEGIC_STATE.selectedDecisions.length} 项 · 影响全域初始态势</span>
            </div>
            <div class="so-decision-list">
              ${chainDecisions.map(d => {
                const isSelected = STRATEGIC_STATE.selectedDecisions.includes(d.id);
                return `
                <div class="so-decision-card ${isSelected ? 'selected' : ''}" data-decision="${d.id}">
                  <div class="so-dec-head">
                    <div class="so-dec-name">${d.name}</div>
                    <div class="so-dec-risk risk-${d.risk === '高' ? 'high' : d.risk === '中' ? 'mid' : 'low'}">风险${d.risk}</div>
                  </div>
                  <div class="so-dec-desc">${d.desc}</div>
                  <div class="so-dec-impacts">
                    ${Object.entries(d.impacts).map(([k,v]) => {
                      const color = v > 0 ? 'var(--green)' : v < 0 ? 'var(--red)' : 'var(--txt-2)';
                      const sign = v > 0 ? '+' : '';
                      return `<span class="so-dec-impact" style="color:${color}">${DOMAIN_NAMES[k] || k} ${sign}${v}</span>`;
                    }).join('')}
                  </div>
                  <div class="so-dec-cascade">
                    <span class="so-cascade-label">级联效应</span>
                    <span class="so-cascade-text">${d.cascade}</span>
                  </div>
                  <div class="so-dec-actions">
                    <button class="btn btn-sm ${isSelected ? 'btn-amber' : ''}" onclick="StrategicOps.toggleDecision('${d.id}')">${isSelected ? '✓ 已选' : '选择决策'}</button>
                    <button class="btn btn-sm" onclick="StrategicOps.showDecisionDetail('${d.id}')">详情</button>
                  </div>
                </div>`;
              }).join('')}
            </div>
          </div>

          <!-- 军力资源部署 -->
          <div class="panel fade-in">
            <div class="panel-header">
              <div class="panel-title">⚔️ 军力资源态势</div>
              <span style="font-size:12px;color:var(--txt-2)">实时链接 FORCES 数据 · 影响推演初始战备</span>
            </div>
            <div class="so-force-list">
              ${forcesData.map(f => `
                <div class="so-force-row">
                  <div class="so-force-name">${f.icon || '⚔️'} ${f.name || f.branch}</div>
                  <div class="so-force-bar">
                    <div class="so-force-bar-fill" style="width:${f.readiness || 70}%;background:${(f.readiness||70) >= 70 ? 'var(--green)' : (f.readiness||70) >= 50 ? 'var(--cyan)' : 'var(--amber)'}"></div>
                  </div>
                  <div class="so-force-val">${f.readiness || 70}</div>
                </div>
              `).join('')}
            </div>
            ${threatsData.length > 0 ? `
              <div class="so-threat-list">
                <div class="so-threat-title">⚠️ 活跃威胁 (${threatsData.length})</div>
                ${threatsData.slice(0, 4).map(t => `
                  <div class="so-threat-item">
                    <span class="so-threat-sev sev-${t.severity >= 5 ? 'high' : t.severity >= 3 ? 'mid' : 'low'}">${t.severity}</span>
                    <span class="so-threat-text">${t.title}</span>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        </div>

        <!-- 右列：全域态势 + 情报串并 -->
        <div class="so-planning-right">
          <!-- 全域态势预览 -->
          <div class="panel fade-in">
            <div class="panel-header">
              <div class="panel-title">📊 全域态势预览</div>
              <span style="font-size:12px;color:var(--txt-2)">基线 + 决策修正</span>
            </div>
            <div class="so-fusion-dashboard">
              <div class="so-domain-radar">
                ${renderDomainRadar({ name: chain.name, globalState: adjustedState })}
              </div>
              <div class="so-domain-matrix">
                ${renderDomainMatrix(chain)}
              </div>
            </div>
            <div class="so-domain-delta-list">
              ${Object.keys(DOMAIN_NAMES).map(d => {
                const base = globalState[d] || 50;
                const adj = adjustedState[d];
                const diff = adj - base;
                if(diff === 0) return '';
                const color = diff > 0 ? 'var(--green)' : 'var(--red)';
                return `<div class="so-delta-item"><span style="color:${DOMAIN_COLORS[d]}">${DOMAIN_NAMES[d]}</span><span style="color:${color}">${diff > 0 ? '+' : ''}${diff}</span></div>`;
              }).join('')}
            </div>
          </div>

          <!-- 情报串并预警 -->
          <div class="panel fade-in">
            <div class="panel-header">
              <div class="panel-title">🔍 情报串并预警</div>
              <span style="font-size:12px;color:var(--txt-2)">${relevantFusion.length}条相关规则</span>
            </div>
            <div class="so-fusion-list">
              ${relevantFusion.map(r => `
                <div class="so-fusion-card-mini" data-fusion="${r.id}">
                  <div class="so-fusion-head">
                    <div class="so-fusion-name">${r.name}</div>
                    <div class="so-fusion-conf" style="background:${r.confidence >= 85 ? 'rgba(255,71,87,.15)' : r.confidence >= 75 ? 'rgba(255,165,2,.15)' : 'rgba(0,180,216,.20)'};color:${r.confidence >= 85 ? 'var(--red)' : r.confidence >= 75 ? 'var(--amber)' : 'var(--cyan)'}">${r.confidence}%</div>
                  </div>
                  <div class="so-fusion-pattern">${r.pattern}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- 底部操作栏 -->
      <div class="so-action-bar panel fade-in">
        <button class="btn" onclick="StrategicOps.backToSelection()">← 返回选择</button>
        <div class="so-action-info">
          <span>已选 <strong>${STRATEGIC_STATE.selectedDecisions.length}</strong> 项决策 ·
                ${chain.scenarios.length} 个场景待推演 ·
                决策将影响所有场景的初始态势</span>
        </div>
        <button class="btn btn-amber" onclick="StrategicOps.startExecution()">开始推演 →</button>
      </div>
    </div>
  `;
}

/* ===== 渲染：阶段三 — 逐场景执行 ===== */
function _renderExecution(){
  const chain = STRATEGIC_CHAINS.find(c => c.id === STRATEGIC_STATE.activeChain);
  if(!chain) return _renderSelection();
  const idx = STRATEGIC_STATE.currentScenarioIndex; /* points to NEXT scenario to execute */
  const total = chain.scenarios.length;
  const results = STRATEGIC_STATE.scenarioResults;
  const completedCount = results.filter(r => r).length;
  const currentResult = idx > 0 ? results[idx - 1] : null; /* last completed result */
  const allDone = idx >= total;

  /* 获取当前（上一个完成的）场景信息 */
  const lastScenarioEntry = idx > 0 ? chain.scenarios[idx - 1] : null;
  const lastScenarioObj = lastScenarioEntry ? ((typeof SCENARIOS !== 'undefined') ? SCENARIOS.find(s => s.id === lastScenarioEntry.id) : null) : null;

  /* 传导效果：作用于上一个完成的场景 */
  const conduction = idx > 0 ? STRATEGIC_STATE.conductionEffects.find(c => c.toScenarioIndex === idx - 1) : null;

  /* 下一个场景信息 */
  const nextScenarioEntry = !allDone ? chain.scenarios[idx] : null;
  const nextScenarioObj = nextScenarioEntry ? ((typeof SCENARIOS !== 'undefined') ? SCENARIOS.find(s => s.id === nextScenarioEntry.id) : null) : null;

  return `
    <div class="strategic-ops">
      ${_renderPhaseBar(3)}
      <div class="so-header fade-in">
        <div class="so-title-block">
          <div class="so-icon">${chain.icon}</div>
          <div>
            <div class="so-title">${chain.name} — 逐场景推演</div>
            <div class="so-subtitle">${allDone ? '全部场景推演完成' : (currentResult ? `下一个: ${nextScenarioObj ? nextScenarioObj.name : nextScenarioEntry.id} · ${nextScenarioEntry.role}` : `首场景: ${nextScenarioObj ? nextScenarioObj.name : nextScenarioEntry.id} · ${nextScenarioEntry.role}`)}</div>
          </div>
        </div>
        <div class="so-status-bar">
          <div class="so-stat"><span class="so-stat-val">${completedCount}</span><span class="so-stat-label">已完成</span></div>
          <div class="so-stat"><span class="so-stat-val">${total - completedCount}</span><span class="so-stat-label">待推演</span></div>
          <div class="so-stat"><span class="so-stat-val">${STRATEGIC_STATE.fusionAlerts.length}</span><span class="so-stat-label">情报预警</span></div>
        </div>
      </div>

      <!-- 推演进度条 -->
      <div class="so-exec-progress panel fade-in">
        ${chain.scenarios.map((s, i) => {
          const r = results[i];
          const status = r ? 'done' : i === idx ? 'current' : 'pending';
          const scObj = SCENARIOS ? SCENARIOS.find(x => x.id === s.id) : null;
          return `
            <div class="so-exec-node ${status}">
              <div class="so-exec-node-circle" style="${status === 'done' ? 'background:var(--green)' : status === 'current' ? 'background:var(--cyan)' : ''}">
                ${status === 'done' ? '✓' : i + 1}
              </div>
              <div class="so-exec-node-label">${scObj ? scObj.name : s.id}</div>
              ${r ? `<div class="so-exec-node-score" style="color:${r.gradeColor}">${r.score}</div>` : ''}
            </div>
            ${i < chain.scenarios.length - 1 ? '<div class="so-exec-link"></div>' : ''}
          `;
        }).join('')}
      </div>

      ${conduction ? `
        <!-- 跨域传导效果 -->
        <div class="panel fade-in so-conduction-panel">
          <div class="panel-title">🔗 跨域传导效果（来自前一场景）</div>
          <div class="so-conduction-effects">
            ${conduction.connections.map(c => `
              <div class="so-conduction-item">
                <span class="so-cond-trigger">${c.trigger}</span>
                <span class="so-cond-arrow">→</span>
                <span class="so-cond-effect">${c.effect}</span>
                <span class="so-cond-strength" style="color:${c.strength >= 0.8 ? 'var(--red)' : c.strength >= 0.65 ? 'var(--amber)' : 'var(--cyan)'}">强度 ${(c.strength * 100).toFixed(0)}%</span>
              </div>
            `).join('')}
            <div class="so-conduction-deltas">
              ${Object.entries(conduction.effects).filter(([,v]) => v !== 0).map(([k, v]) => {
                const color = v > 0 ? 'var(--green)' : 'var(--red)';
                return `<span class="so-cond-delta" style="color:${color}">${DOMAIN_NAMES[k]} ${v > 0 ? '+' : ''}${v}</span>`;
              }).join('')}
            </div>
          </div>
        </div>
      ` : ''}

      ${currentResult ? `
        <!-- 场景推演结果 -->
        <div class="panel fade-in so-result-panel">
          <div class="panel-header">
            <div class="panel-title">📋 ${currentResult.scenarioName} — 推演结果</div>
            <div class="so-result-grade" style="color:${currentResult.gradeColor};border-color:${currentResult.gradeColor}44">
              评级 ${currentResult.grade} · 得分 ${currentResult.score}
            </div>
          </div>

          <div class="so-result-grid">
            <!-- 左：域态势变化 -->
            <div class="so-result-left">
              <div class="so-result-section">
                <div class="so-res-sec-title">全域态势变化</div>
                <div class="so-res-domains">
                  ${Object.entries(currentResult.domainChanges).map(([k, v]) => {
                    const initial = currentResult.initialDomains[k] || 50;
                    const final = currentResult.domains[k] || 50;
                    const color = v > 0 ? 'var(--green)' : v < 0 ? 'var(--red)' : 'var(--txt-2)';
                    const barColor = v > 0 ? 'var(--green)' : v < 0 ? 'var(--red)' : 'var(--cyan)';
                    const dn = k === 'domestic' ? '国内支持' : (DOMAIN_NAMES[k] || k);
                    return `
                      <div class="so-res-domain">
                        <div class="so-res-dom-head">
                          <span style="color:${DOMAIN_COLORS[k] || 'var(--txt-1)'}">${dn}</span>
                          <span style="color:${color};font-weight:700">${final} ${v !== 0 ? `(${v > 0 ? '+' : ''}${v})` : ''}</span>
                        </div>
                        <div class="so-res-dom-bar">
                          <div class="so-res-dom-fill" style="width:${final}%;background:${barColor}"></div>
                          <div class="so-res-dom-base" style="left:${initial}%"></div>
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>

              <div class="so-result-section">
                <div class="so-res-sec-title">战略资源</div>
                <div class="so-res-resources">
                  <div class="so-res-res-item"><span>📈 国际声望</span><span style="color:${currentResult.reputation >= 50 ? 'var(--green)' : 'var(--red)'}">${currentResult.reputation}</span></div>
                  <div class="so-res-res-item"><span>🏛️ 国内支持</span><span style="color:${currentResult.domesticSupport >= 50 ? 'var(--green)' : 'var(--red)'}">${currentResult.domesticSupport}</span></div>
                  <div class="so-res-res-item"><span>⚡ 升级度</span><span style="color:${currentResult.escalation <= 2 ? 'var(--green)' : 'var(--red)'}">${currentResult.escalation}/5</span></div>
                  <div class="so-res-res-item"><span>💰 资金剩余</span><span style="color:var(--cyan)">${currentResult.funding}</span></div>
                </div>
              </div>

              ${currentResult.forces && currentResult.forces.length > 0 ? `
                <div class="so-result-section">
                  <div class="so-res-sec-title">军种战备</div>
                  <div class="so-res-forces">
                    ${currentResult.forces.map(f => `
                      <div class="so-res-force">
                        <span>${f.name}</span>
                        <div class="so-res-force-bar"><div class="so-res-force-fill" style="width:${f.readiness}%;background:${f.readiness >= 70 ? 'var(--green)' : f.readiness >= 50 ? 'var(--cyan)' : 'var(--amber)'}"></div></div>
                        <span>${f.readiness}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
            </div>

            <!-- 右：逐轮日志 -->
            <div class="so-result-right">
              <div class="so-result-section">
                <div class="so-res-sec-title">逐轮推演日志 (${currentResult.roundsPlayed}轮)</div>
                <div class="so-round-log">
                  ${currentResult.roundByRound.map(r => `
                    <div class="so-round-entry">
                      <div class="so-round-head">
                        <span class="so-round-num">第${r.round}轮</span>
                        <span class="so-round-stats">升级${r.escalation} · 声望${r.reputation} · 国内${r.domesticSupport}</span>
                      </div>
                      ${r.supportActions && r.supportActions.length > 0 ? `
                        <div class="so-round-support">
                          <span class="so-round-label" style="color:var(--amber)">🔗 支援</span>
                          ${r.supportActions.map(s => {
                            const color = s.result === '大成功' ? 'var(--green)' : s.result === '成功' ? 'var(--cyan)' : 'var(--red)';
                            const catIcon = s.category === 'intel' ? '🔍' : s.category === 'logistics' ? '📦' : s.category === 'economy' ? '💰' : s.category === 'diplomatic' ? '🤝' : '🌐';
                            return `<span class="so-round-action so-round-action-support" style="border-color:${color}">${catIcon} ${s.action} [${s.roll}/${s.successRate} ${s.result}]</span>`;
                          }).join('')}
                        </div>
                      ` : ''}
                      <div class="so-round-actions">
                        <div class="so-round-side">
                          <span class="so-round-label" style="color:var(--red)">我方</span>
                          ${r.playerActions.map((a, i) => {
                            const d = r.diceResults[i];
                            const color = d.result === '大成功' ? 'var(--green)' : d.result === '成功' ? 'var(--cyan)' : 'var(--red)';
                            return `<span class="so-round-action" style="border-color:${color}">${a} [${d.roll}/${d.successRate} ${d.result}]</span>`;
                          }).join('')}
                        </div>
                        <div class="so-round-side">
                          <span class="so-round-label" style="color:var(--cyan)">对手</span>
                          <span class="so-round-action" style="border-color:var(--amber)">${r.aiAction}</span>
                        </div>
                      </div>
                      <div class="so-round-effects">
                        ${Object.entries(r.effects).filter(([,v]) => v !== 0).map(([k, v]) => {
                          const color = v > 0 ? 'var(--green)' : 'var(--red)';
                          const dn = k === 'domestic' ? '国内' : (DOMAIN_NAMES[k] || k);
                          return `<span style="color:${color}">${dn} ${v > 0 ? '+' : ''}${v}</span>`;
                        }).join(' ')}
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 情报预警 -->
        ${STRATEGIC_STATE.fusionAlerts.filter(a => a.triggeredAt === currentResult.scenarioName).length > 0 ? `
          <div class="panel fade-in">
            <div class="panel-title">🔍 触发的情报串并预警</div>
            <div class="so-fusion-alerts">
              ${STRATEGIC_STATE.fusionAlerts.filter(a => a.triggeredAt === currentResult.scenarioName).map(a => `
                <div class="so-fusion-alert">
                  <div class="so-fa-head">
                    <span class="so-fa-name">⚠️ ${a.ruleName}</span>
                    <span class="so-fa-conf" style="color:${a.confidence >= 85 ? 'var(--red)' : 'var(--amber)'}">置信度 ${a.confidence}%</span>
                  </div>
                  <div class="so-fa-rec">${a.recommendation}</div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- 底部操作栏 -->
        <div class="so-action-bar panel fade-in">
          <button class="btn" onclick="StrategicOps.backToPlanning()">← 返回规划</button>
          <div class="so-action-info">
            已完成 ${completedCount}/${total} · 上一个得分 ${currentResult.score} · 评级 ${currentResult.grade}
          </div>
          ${allDone
            ? '<button class="btn btn-amber" onclick="StrategicOps.finishExecution()">查看综合分析 →</button>'
            : '<button class="btn btn-amber" onclick="StrategicOps.executeNext()">推演下一场景 →</button>'
          }
        </div>
      ` : STRATEGIC_STATE.isExecuting ? `
        <div class="so-executing panel fade-in">
          <div class="so-exec-spinner"></div>
          <div class="so-exec-text">正在推演 ${nextScenarioObj ? nextScenarioObj.name : (nextScenarioEntry ? nextScenarioEntry.id : '...')}...</div>
          <div class="so-exec-subtext">AI 引擎正在进行多轮裁决</div>
        </div>
      ` : `
        <div class="so-empty-state panel fade-in">
          <div class="so-empty-icon">▶️</div>
          <div class="so-empty-title">准备开始推演</div>
          <div class="so-empty-desc">点击下方按钮开始第一个场景的自动推演</div>
          <button class="btn btn-amber" onclick="StrategicOps.executeNext()">开始推演 →</button>
        </div>
      `}
    </div>
  `;
}

/* ===== 渲染：阶段四 — 综合分析 ===== */
function _renderAnalysis(){
  const chain = STRATEGIC_CHAINS.find(c => c.id === STRATEGIC_STATE.activeChain);
  if(!chain) return _renderSelection();
  const assessment = STRATEGIC_STATE.finalAssessment;
  if(!assessment) return _renderSelection();

  return `
    <div class="strategic-ops">
      ${_renderPhaseBar(4)}
      <div class="so-header fade-in">
        <div class="so-title-block">
          <div class="so-icon">${chain.icon}</div>
          <div>
            <div class="so-title">${chain.name} — 综合分析报告</div>
            <div class="so-subtitle">${assessment.scenarioCount}个场景 · ${assessment.decisionCount}项决策 · ${assessment.fusionAlerts.length}条情报预警</div>
          </div>
        </div>
        <div class="so-status-bar">
          <div class="so-stat"><span class="so-stat-val" style="color:${assessment.gradeColor}">${assessment.avgScore}</span><span class="so-stat-label">综合得分</span></div>
          <div class="so-stat"><span class="so-stat-val" style="color:${assessment.gradeColor}">${assessment.grade}</span><span class="so-stat-label">战略评级</span></div>
          <div class="so-stat"><span class="so-stat-val">${assessment.totalDomainShift}</span><span class="so-stat-label">全域变化总量</span></div>
        </div>
      </div>

      <!-- 总评 -->
      <div class="panel fade-in so-assessment-overall-panel">
        <div class="so-assess-main">
          <div class="so-assess-score-big" style="color:${assessment.gradeColor}">${assessment.avgScore}</div>
          <div class="so-assess-grade-big" style="color:${assessment.gradeColor}">${assessment.grade}级</div>
          <div class="so-assess-desc">${assessment.gradeDesc}</div>
        </div>
        <div class="so-assess-posture">
          <div class="so-posture-title">战略姿态</div>
          <div class="so-posture-bars">
            <div class="so-posture-bar"><span>进攻性</span><div class="so-posture-fill" style="width:${assessment.posture.offensive * 33}%;background:var(--red)"></div><span>${assessment.posture.offensive}</span></div>
            <div class="so-posture-bar"><span>防御性</span><div class="so-posture-fill" style="width:${assessment.posture.defensive * 33}%;background:var(--cyan)"></div><span>${assessment.posture.defensive}</span></div>
            <div class="so-posture-bar"><span>威慑性</span><div class="so-posture-fill" style="width:${assessment.posture.deterrence * 33}%;background:var(--green)"></div><span>${assessment.posture.deterrence}</span></div>
          </div>
        </div>
      </div>

      <!-- 域演化轨迹 -->
      <div class="panel fade-in">
        <div class="panel-title">📈 全域态势演化轨迹</div>
        <div class="so-evolution-chart">
          ${_renderEvolutionChart(assessment.domainEvolution, chain.scenarios)}
        </div>
      </div>

      <!-- 场景成绩对比 -->
      <div class="panel fade-in">
        <div class="panel-title">📊 各场景推演成绩</div>
        <div class="so-scenario-scores">
          ${STRATEGIC_STATE.scenarioResults.map((r, i) => {
            const scObj = SCENARIOS ? SCENARIOS.find(s => s.id === r.scenarioId) : null;
            return `
              <div class="so-sc-score-item">
                <div class="so-sc-score-head">
                  <span style="color:${DOMAIN_COLORS[chain.scenarios[i].domain] || 'var(--txt-1)'}">${scObj ? scObj.name : r.scenarioName}</span>
                  <span style="color:${r.gradeColor};font-weight:700">${r.score} (${r.grade})</span>
                </div>
                <div class="so-sc-score-bar">
                  <div class="so-sc-score-fill" style="width:${r.score}%;background:${r.gradeColor}"></div>
                </div>
                <div class="so-sc-score-meta">
                  升级${r.escalation}/5 · 声望${r.reputation} · ${r.roundsPlayed}轮
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 传导效应分析 -->
      <div class="panel fade-in">
        <div class="panel-title">🔗 跨域传导效应分析</div>
        <div class="so-cond-analysis">
          ${STRATEGIC_STATE.conductionEffects.map((c, i) => `
            <div class="so-cond-analysis-item">
              <div class="so-cond-analysis-head">
                场景${i+1} → 场景${i+2}
              </div>
              <div class="so-cond-analysis-effects">
                ${Object.entries(c.effects).filter(([,v]) => v !== 0).map(([k, v]) => {
                  const color = v > 0 ? 'var(--green)' : 'var(--red)';
                  return `<span style="color:${color}">${DOMAIN_NAMES[k]} ${v > 0 ? '+' : ''}${v}</span>`;
                }).join(' ')}
              </div>
              <div class="so-cond-analysis-connections">
                ${c.connections.map(conn => `<span class="so-cond-tag">${conn.trigger} → ${conn.effect} (${(conn.strength * 100).toFixed(0)}%)</span>`).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- 情报串并汇总 -->
      ${assessment.fusionAlerts.length > 0 ? `
        <div class="panel fade-in">
          <div class="panel-title">🔍 情报串并预警汇总</div>
          <div class="so-fusion-summary">
            ${assessment.fusionAlerts.map(a => `
              <div class="so-fusion-alert">
                <div class="so-fa-head">
                  <span class="so-fa-name">⚠️ ${a.ruleName}</span>
                  <span class="so-fa-conf" style="color:${a.confidence >= 85 ? 'var(--red)' : 'var(--amber)'}">置信度 ${a.confidence}%</span>
                  <span class="so-fa-trigger">触发于: ${a.triggeredAt}</span>
                </div>
                <div class="so-fa-rec">${a.recommendation}</div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- 最佳/最差场景 -->
      <div class="so-best-worst panel fade-in">
        <div class="so-bw-item so-bw-best">
          <div class="so-bw-label">最佳表现</div>
          <div class="so-bw-name">${assessment.bestScenario.scenarioName}</div>
          <div class="so-bw-score" style="color:${assessment.bestScenario.gradeColor}">${assessment.bestScenario.score} (${assessment.bestScenario.grade})</div>
        </div>
        <div class="so-bw-item so-bw-worst">
          <div class="so-bw-label">最需改进</div>
          <div class="so-bw-name">${assessment.worstScenario.scenarioName}</div>
          <div class="so-bw-score" style="color:${assessment.worstScenario.gradeColor}">${assessment.worstScenario.score} (${assessment.worstScenario.grade})</div>
        </div>
      </div>

      <!-- 战略建议 -->
      <div class="panel fade-in">
        <div class="panel-title">💡 战略建议</div>
        <div class="so-recommendations">
          ${assessment.recommendations.map(r => `<div class="so-rec-item">${r}</div>`).join('')}
        </div>
      </div>

      <!-- 底部操作栏 -->
      <div class="so-action-bar panel fade-in">
        <button class="btn" onclick="StrategicOps.reset()">← 返回推演链选择</button>
        <button class="btn btn-amber" onclick="StrategicOps.restart()">重新推演此链</button>
      </div>
    </div>
  `;
}

/* ===== 渲染：阶段流程指示器 ===== */
function _renderPhaseBar(activePhase){
  const phases = [
    { num: 1, name: '选择推演链' },
    { num: 2, name: '战略规划' },
    { num: 3, name: '逐场景推演' },
    { num: 4, name: '综合分析' },
  ];
  return `
    <div class="so-phase-bar panel fade-in">
      ${phases.map((p, i) => `
        <div class="so-phase-item ${p.num <= activePhase ? 'active' : ''} ${p.num === activePhase ? 'current' : ''}">
          <span class="so-phase-num">${p.num <= activePhase ? '✓' : p.num}</span>
          <span class="so-phase-name">${p.name}</span>
        </div>
        ${i < phases.length - 1 ? '<div class="so-phase-line"></div>' : ''}
      `).join('')}
    </div>
  `;
}

/* ===== 渲染：域演化折线图 ===== */
function _renderEvolutionChart(domainEvolution, scenarios){
  const w = 680, h = 320, padL = 40, padR = 20, padT = 30, padB = 50;
  const plotW = w - padL - padR, plotH = h - padT - padB;
  const xCount = scenarios.length;
  const domains = Object.keys(DOMAIN_NAMES);

  /* 每个域一条线 */
  const lines = domains.map(dk => {
    const values = domainEvolution[dk];
    if(!values || values.length === 0) return null;
    const points = values.map((v, i) => {
      const x = padL + (xCount > 1 ? (i / (xCount - 1)) * plotW : plotW / 2);
      const y = padT + plotH - (v / 100) * plotH;
      return { x, y, v };
    });
    return { domain: dk, color: DOMAIN_COLORS[dk], points };
  }).filter(l => l);

  return `
    <svg viewBox="0 0 ${w} ${h}" style="width:100%;max-width:${w}px;margin:0 auto;display:block">
      <!-- 网格 -->
      ${[0, 25, 50, 75, 100].map(g => {
        const y = padT + plotH - (g / 100) * plotH;
        return `<line x1="${padL}" y1="${y}" x2="${w - padR}" y2="${y}" stroke="var(--border)" stroke-width="1" opacity="0.4"/>
                <text x="${padL - 6}" y="${y + 4}" text-anchor="end" fill="var(--txt-2)" font-size="10">${g}</text>`;
      }).join('')}

      <!-- X轴标签 -->
      ${scenarios.map((s, i) => {
        const x = padL + (xCount > 1 ? (i / (xCount - 1)) * plotW : plotW / 2);
        const scObj = SCENARIOS ? SCENARIOS.find(x => x.id === s.id) : null;
        const name = scObj ? scObj.name : s.id;
        return `<text x="${x}" y="${h - padB + 18}" text-anchor="middle" fill="var(--txt-2)" font-size="9">${name.length > 8 ? name.slice(0, 7) + '…' : name}</text>
                <text x="${x}" y="${h - padB + 32}" text-anchor="middle" fill="${DOMAIN_COLORS[s.domain] || 'var(--txt-2)'}" font-size="8">${s.role}</text>`;
      }).join('')}

      <!-- 折线 -->
      ${lines.map(line => `
        <polyline points="${line.points.map(p => `${p.x},${p.y}`).join(' ')}"
                  fill="none" stroke="${line.color}" stroke-width="2" opacity="0.85"/>
        ${line.points.map(p => `
          <circle cx="${p.x}" cy="${p.y}" r="4" fill="${line.color}" stroke="var(--bg-1)" stroke-width="1.5"/>
          <text x="${p.x}" y="${p.y - 8}" text-anchor="middle" fill="${line.color}" font-size="9" font-weight="600">${p.v}</text>
        `).join('')}
      `).join('')}

      <!-- 图例 -->
      ${domains.map((dk, i) => {
        const lx = padL + i * 95;
        return `<rect x="${lx}" y="${padT - 22}" width="12" height="3" fill="${DOMAIN_COLORS[dk]}" rx="1"/>
                <text x="${lx + 16}" y="${padT - 17}" fill="${DOMAIN_COLORS[dk]}" font-size="9">${DOMAIN_NAMES[dk]}</text>`;
      }).join('')}
    </svg>
  `;
}

/* ===== 渲染：场景串联SVG图（增强版） ===== */
function renderChainSVG(chain){
  const results = STRATEGIC_STATE.scenarioResults || [];
  const nodes = chain.scenarios.map((s, i) => {
    const angle = (i / chain.scenarios.length) * 2 * Math.PI - Math.PI / 2;
    const r = 180;
    const cx = 340, cy = 230;
    return {
      ...s,
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      idx: i,
      result: results[i],
    };
  });

  const nodeMap = {};
  nodes.forEach(n => { nodeMap[n.id] = n; });

  const links = chain.connections.map((c, i) => {
    const from = nodeMap[c.from];
    const to = nodeMap[c.to];
    if(!from || !to) return null;
    const mx = (from.x + to.x) / 2;
    const my = (from.y + to.y) / 2;
    const offset = 20 * (i % 2 === 0 ? 1 : -1);
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.sqrt(dx*dx + dy*dy);
    const nx = -dy / len * offset;
    const ny = dx / len * offset;
    return {
      ...c,
      from, to,
      mx: mx + nx, my: my + ny,
      color: c.strength >= 0.8 ? '#ff4757' : c.strength >= 0.65 ? '#ffa502' : '#00b4d8',
    };
  }).filter(l => l);

  return `
    <svg viewBox="0 0 680 460" style="width:100%;max-width:680px;margin:0 auto;display:block">
      <!-- 连接线 -->
      ${links.map(l => `
        <path d="M ${l.from.x} ${l.from.y} Q ${l.mx} ${l.my} ${l.to.x} ${l.to.y}"
              fill="none" stroke="${l.color}" stroke-width="${1 + l.strength * 2}"
              stroke-dasharray="${l.delay.includes('同步') || l.delay.includes('即时') ? '0' : '6,4'}"
              opacity="0.6" marker-end="url(#arrow-${l.color.replace('#','')})"/>
        <circle cx="${l.mx}" cy="${l.my}" r="3" fill="${l.color}" opacity="0.8"/>
        <text x="${l.mx}" y="${l.my - 8}" text-anchor="middle" fill="${l.color}" font-size="9" opacity="0.9">${l.effect}</text>
        <text x="${l.mx}" y="${l.my + 12}" text-anchor="middle" fill="var(--txt-2)" font-size="8">${l.delay}</text>
      `).join('')}

      <!-- 节点 -->
      ${nodes.map(n => {
        const scenario = (typeof SCENARIOS !== 'undefined') ? SCENARIOS.find(s => s.id === n.id) : null;
        const name = scenario ? scenario.name : n.id;
        const color = DOMAIN_COLORS[n.domain] || '#7a8aa8';
        const r = n.result;
        const status = r ? 'done' : n.idx === STRATEGIC_STATE.currentScenarioIndex && STRATEGIC_STATE.phase === 'execution' ? 'current' : 'pending';
        const ringColor = status === 'done' ? 'var(--green)' : status === 'current' ? 'var(--cyan)' : color;
        return `
          <g class="so-chain-node" data-scenario="${n.id}" style="cursor:pointer">
            <circle cx="${n.x}" cy="${n.y}" r="${r ? 40 : 36}" fill="${color}15" stroke="${ringColor}" stroke-width="${r ? 3 : 2}"/>
            <circle cx="${n.x}" cy="${n.y}" r="30" fill="${color}08"/>
            <text x="${n.x}" y="${n.y - 3}" text-anchor="middle" fill="${color}" font-size="11" font-weight="700">${n.role.slice(0,4)}</text>
            <text x="${n.x}" y="${n.y + 11}" text-anchor="middle" fill="var(--txt-2)" font-size="8">${DOMAIN_NAMES[n.domain] || ''}</text>
            ${r ? `<text x="${n.x}" y="${n.y + 48}" text-anchor="middle" fill="${r.gradeColor}" font-size="11" font-weight="700">${r.score}(${r.grade})</text>` : ''}
            <text x="${n.x}" y="${n.y + (r ? 62 : 50)}" text-anchor="middle" fill="var(--txt-1)" font-size="10" font-weight="600">${name.length > 8 ? name.slice(0,7)+'…' : name}</text>
          </g>
        `;
      }).join('')}

      <defs>
        ${['#ff4757','#ffa502','#00b4d8'].map(c => `
          <marker id="arrow-${c.replace('#','')}" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="${c}" opacity="0.7"/>
          </marker>
        `).join('')}
      </defs>
    </svg>
  `;
}

/* ===== 渲染：全域态势雷达 ===== */
function renderDomainRadar(chain){
  const domains = Object.keys(DOMAIN_NAMES);
  const values = domains.map(d => (chain.globalState[d] || 50));
  const cx = 130, cy = 130, maxR = 100;
  const points = domains.map((d, i) => {
    const angle = (i / domains.length) * 2 * Math.PI - Math.PI / 2;
    const r = (values[i] / 100) * maxR;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle), d, v: values[i] };
  });
  const polygon = points.map(p => `${p.x},${p.y}`).join(' ');
  const gridLevels = [25, 50, 75, 100];

  return `
    <div class="so-radar-wrap">
      <svg viewBox="0 0 260 280" style="width:100%;max-width:260px;margin:0 auto;display:block">
        ${gridLevels.map(g => {
          const pts = domains.map((d, i) => {
            const angle = (i / domains.length) * 2 * Math.PI - Math.PI / 2;
            const r = (g / 100) * maxR;
            return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
          }).join(' ');
          return `<polygon points="${pts}" fill="none" stroke="var(--border)" stroke-width="1" opacity="0.5"/>`;
        }).join('')}
        ${domains.map((d, i) => {
          const angle = (i / domains.length) * 2 * Math.PI - Math.PI / 2;
          return `<line x1="${cx}" y1="${cy}" x2="${cx + maxR * Math.cos(angle)}" y2="${cy + maxR * Math.sin(angle)}" stroke="var(--border)" stroke-width="1" opacity="0.4"/>`;
        }).join('')}
        <polygon points="${polygon}" fill="rgba(0,180,216,.18)" stroke="var(--cyan)" stroke-width="2"/>
        ${points.map(p => `<circle cx="${p.x}" cy="${p.y}" r="4" fill="${DOMAIN_COLORS[p.d]}" stroke="var(--bg-1)" stroke-width="2"/>`).join('')}
        ${points.map(p => {
          const angle = (domains.indexOf(p.d) / domains.length) * 2 * Math.PI - Math.PI / 2;
          const lr = maxR + 22;
          const lx = cx + lr * Math.cos(angle);
          const ly = cy + lr * Math.sin(angle);
          return `<text x="${lx}" y="${ly}" text-anchor="middle" fill="${DOMAIN_COLORS[p.d]}" font-size="9" font-weight="600">${DOMAIN_NAMES[p.d]}</text>
                  <text x="${lx}" y="${ly+11}" text-anchor="middle" fill="var(--txt-2)" font-size="9">${p.v}</text>`;
        }).join('')}
      </svg>
      <div class="so-radar-label">${chain.name} · 全域态势</div>
    </div>
  `;
}

/* ===== 渲染：跨域效果矩阵 ===== */
function renderDomainMatrix(chain){
  const domains = Object.keys(DOMAIN_NAMES);
  return `
    <div class="so-matrix-wrap">
      <div class="so-matrix-title">跨域效果矩阵</div>
      <div class="so-matrix-table">
        <div class="so-matrix-row so-matrix-header">
          <div class="so-matrix-cell"></div>
          ${domains.map(d => `<div class="so-matrix-cell" style="color:${DOMAIN_COLORS[d]};font-size:9px;text-align:center">${DOMAIN_NAMES[d].slice(0,2)}</div>`).join('')}
        </div>
        ${domains.map(row => `
          <div class="so-matrix-row">
            <div class="so-matrix-cell so-matrix-label" style="color:${DOMAIN_COLORS[row]}">${DOMAIN_NAMES[row].slice(0,2)}</div>
            ${domains.map(col => {
              const v = DOMAIN_EFFECTS_MATRIX[row][col];
              const bg = v > 0.5 ? 'rgba(255,71,87,.2)' : v > 0 ? 'rgba(255,71,87,.08)' : v < -0.5 ? 'rgba(46,213,115,.2)' : v < 0 ? 'rgba(46,213,115,.08)' : 'transparent';
              const txt = v > 0 ? '+' + v.toFixed(1) : v.toFixed(1);
              const color = v > 0 ? 'var(--red)' : v < 0 ? 'var(--green)' : 'var(--txt-2)';
              return `<div class="so-matrix-cell" style="background:${bg};color:${color};font-size:10px;text-align:center;font-family:Consolas,monospace">${row === col ? '—' : txt}</div>`;
            }).join('')}
          </div>
        `).join('')}
      </div>
      <div class="so-matrix-legend">
        <span style="color:var(--red)">正值=增强</span>
        <span style="color:var(--green)">负值=抑制</span>
        <span style="color:var(--txt-2)">数值=效果强度</span>
      </div>
    </div>
  `;
}

/* ===== 交互逻辑 ===== */
const StrategicOps = {
  init(){
    /* 推演链选择 */
    document.querySelectorAll('.so-chain-card').forEach(el => {
      el.addEventListener('click', () => {
        STRATEGIC_STATE.activeChain = el.getAttribute('data-chain');
        App.switchTab('zone_strategic');
      });
    });

    /* 场景节点点击 */
    document.querySelectorAll('.so-chain-node').forEach(el => {
      el.addEventListener('click', () => {
        const sid = el.getAttribute('data-scenario');
        const scenario = (typeof SCENARIOS !== 'undefined') ? SCENARIOS.find(s => s.id === sid) : null;
        if(scenario){
          App.showInfoModal('场景详情', scenario.name, `
            <div style="margin-bottom:12px;color:var(--txt-1);line-height:1.6">${scenario.background || ''}</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">
              <span style="padding:3px 8px;border-radius:4px;background:var(--bg-2);font-size:12px">编号: ${scenario.code || '—'}</span>
              <span style="padding:3px 8px;border-radius:4px;background:var(--bg-2);font-size:12px">威胁等级: ${scenario.threatLevel || '—'}</span>
              <span style="padding:3px 8px;border-radius:4px;background:var(--bg-2);font-size:12px">预算: ${scenario.budget || '—'}</span>
            </div>
          `);
        }
      });
    });

    /* 情报串并卡片点击 */
    document.querySelectorAll('.so-fusion-card-mini, .so-fusion-card').forEach(el => {
      el.addEventListener('click', () => {
        const fid = el.getAttribute('data-fusion');
        const rule = INTEL_FUSION_RULES.find(r => r.id === fid);
        if(rule){
          App.showInfoModal('情报串并分析', rule.name, `
            <div style="margin-bottom:12px">
              <div style="font-size:12px;color:var(--txt-2);margin-bottom:4px">情报来源</div>
              <div style="display:flex;gap:6px;flex-wrap:wrap">${rule.sources.map(s => `<span style="padding:3px 8px;border-radius:4px;background:var(--bg-2);font-size:12px">${s}</span>`).join('')}</div>
            </div>
            <div style="margin-bottom:12px">
              <div style="font-size:12px;color:var(--txt-2);margin-bottom:4px">检测模式</div>
              <div style="color:var(--txt-1);line-height:1.6">${rule.pattern}</div>
            </div>
            <div style="margin-bottom:12px">
              <div style="font-size:12px;color:var(--txt-2);margin-bottom:4px">分析结论 (置信度 ${rule.confidence}%)</div>
              <div style="color:var(--txt-1);line-height:1.6">${rule.desc}</div>
            </div>
            <div style="padding:12px;background:rgba(0,180,216,.12);border:1px solid rgba(0,180,216,.3);border-radius:6px">
              <div style="font-size:12px;color:var(--cyan);margin-bottom:4px">建议行动</div>
              <div style="color:var(--txt-1);line-height:1.6">${rule.recommendation}</div>
            </div>
          `);
        }
      });
    });
  },

  /* ---- 进入规划阶段 ---- */
  enterPlanning(){
    const chain = STRATEGIC_CHAINS.find(c => c.id === STRATEGIC_STATE.activeChain);
    if(!chain) return;
    STRATEGIC_STATE.phase = 'planning';
    STRATEGIC_STATE.selectedDecisions = [];
    STRATEGIC_STATE.globalState = { ...chain.globalState };
    App.switchTab('zone_strategic');
  },

  /* ---- 返回选择阶段 ---- */
  backToSelection(){
    STRATEGIC_STATE.phase = 'selection';
    STRATEGIC_STATE.activeChain = null;
    STRATEGIC_STATE.selectedDecisions = [];
    STRATEGIC_STATE.scenarioResults = [];
    STRATEGIC_STATE.conductionEffects = [];
    STRATEGIC_STATE.fusionAlerts = [];
    STRATEGIC_STATE.currentScenarioIndex = 0;
    STRATEGIC_STATE.finalAssessment = null;
    App.switchTab('zone_strategic');
  },

  /* ---- 返回规划阶段 ---- */
  backToPlanning(){
    STRATEGIC_STATE.phase = 'planning';
    STRATEGIC_STATE.scenarioResults = [];
    STRATEGIC_STATE.conductionEffects = [];
    STRATEGIC_STATE.fusionAlerts = [];
    STRATEGIC_STATE.currentScenarioIndex = 0;
    App.switchTab('zone_strategic');
  },

  /* ---- 选择/取消决策 ---- */
  toggleDecision(did){
    const idx = STRATEGIC_STATE.selectedDecisions.indexOf(did);
    if(idx >= 0) STRATEGIC_STATE.selectedDecisions.splice(idx, 1);
    else STRATEGIC_STATE.selectedDecisions.push(did);
    App.switchTab('zone_strategic');
  },

  /* ---- 决策详情 ---- */
  showDecisionDetail(did){
    const d = STRATEGIC_DECISIONS.find(x => x.id === did);
    if(!d) return;
    App.showInfoModal('决策详情', d.name, `
      <div style="margin-bottom:12px;color:var(--txt-1);line-height:1.6">${d.desc}</div>
      <div style="margin-bottom:12px">
        <div style="font-size:12px;color:var(--txt-2);margin-bottom:6px">全域影响</div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
          ${Object.entries(d.impacts).map(([k,v]) => {
            const color = v > 0 ? 'var(--green)' : v < 0 ? 'var(--red)' : 'var(--txt-2)';
            return `<div style="padding:8px;background:var(--bg-2);border-radius:6px;text-align:center">
              <div style="font-size:11px;color:var(--txt-2)">${DOMAIN_NAMES[k] || k}</div>
              <div style="font-size:16px;font-weight:700;color:${color}">${v > 0 ? '+' : ''}${v}</div>
            </div>`;
          }).join('')}
        </div>
      </div>
      <div style="margin-bottom:12px;padding:10px;background:rgba(255,165,2,.08);border:1px solid rgba(255,165,2,.2);border-radius:6px">
        <div style="font-size:12px;color:var(--amber);margin-bottom:4px">风险分析 (${d.risk})</div>
        <div style="color:var(--txt-1);line-height:1.6;font-size:13px">${d.riskDesc}</div>
      </div>
      <div style="padding:10px;background:rgba(162,155,254,.08);border:1px solid rgba(162,155,254,.2);border-radius:6px">
        <div style="font-size:12px;color:#a29bfe;margin-bottom:4px">级联效应预判</div>
        <div style="color:var(--txt-1);line-height:1.6;font-size:13px;font-family:Consolas,monospace">${d.cascade}</div>
      </div>
    `);
  },

  /* ---- 开始执行 ---- */
  startExecution(){
    STRATEGIC_STATE.phase = 'execution';
    STRATEGIC_STATE.currentScenarioIndex = 0;
    STRATEGIC_STATE.scenarioResults = [];
    STRATEGIC_STATE.conductionEffects = [];
    STRATEGIC_STATE.fusionAlerts = [];
    STRATEGIC_STATE.isExecuting = false;
    App.switchTab('zone_strategic');
  },

  /* ---- 执行下一个场景 ---- */
  executeNext(){
    const chain = STRATEGIC_CHAINS.find(c => c.id === STRATEGIC_STATE.activeChain);
    if(!chain) return;
    const idx = STRATEGIC_STATE.currentScenarioIndex;

    /* 显示执行中状态 */
    STRATEGIC_STATE.isExecuting = true;
    App.switchTab('zone_strategic');

    /* 异步执行推演 */
    setTimeout(() => {
      const scenarioEntry = chain.scenarios[idx];
      const scenario = (typeof SCENARIOS !== 'undefined') ? SCENARIOS.find(s => s.id === scenarioEntry.id) : null;
      if(!scenario){
        console.error('场景未找到:', scenarioEntry.id);
        STRATEGIC_STATE.isExecuting = false;
        return;
      }

      /* 计算决策修正 */
      const decisionModifiers = {};
      STRATEGIC_STATE.selectedDecisions.forEach(did => {
        const d = STRATEGIC_DECISIONS.find(x => x.id === did);
        if(d) Object.entries(d.impacts).forEach(([k, v]) => {
          decisionModifiers[k] = (decisionModifiers[k] || 0) + v;
        });
      });

      /* 计算传导修正 */
      let conductionModifiers = {};
      let conductionConnections = [];
      if(idx > 0){
        const prevResult = STRATEGIC_STATE.scenarioResults[idx - 1];
        const cond = StrategicEngine.computeConduction(chain, prevResult, scenarioEntry.id);
        conductionModifiers = cond.effects;
        conductionConnections = cond.connections;
        STRATEGIC_STATE.conductionEffects.push({
          fromScenarioIndex: idx - 1,
          toScenarioIndex: idx,
          effects: { ...conductionModifiers },
          connections: conductionConnections,
        });
      }

      /* 获取军力加成 */
      const forceBonuses = {};
      if(typeof FORCES !== 'undefined'){
        const avgReadiness = FORCES.reduce((s, f) => s + (f.readiness || 70), 0) / FORCES.length;
        forceBonuses.military = Math.round((avgReadiness - 60) * 0.3);
      }

      /* 获取全域态势加成 */
      if(typeof DOMAINS !== 'undefined'){
        DOMAINS.forEach(d => {
          if(forceBonuses[d.id] === undefined) forceBonuses[d.id] = 0;
          forceBonuses[d.id] += Math.round((d.readiness - 60) * 0.2);
        });
      }

      /* 执行推演 */
      const initialDomains = { ...chain.globalState };
      /* 将 space 映射到 information（wargame 六域不含 space） */
      if(initialDomains.space !== undefined){
        initialDomains.information = (initialDomains.information || 50) + (initialDomains.space - 50) * 0.3;
      }

      const result = StrategicEngine.autoResolve(
        scenario, initialDomains, decisionModifiers, conductionModifiers, forceBonuses
      );

      STRATEGIC_STATE.scenarioResults[idx] = result;

      /* 更新全局状态 */
      STRATEGIC_STATE.globalState = { ...STRATEGIC_STATE.globalState, ...result.domains };

      /* 检查情报串并 */
      const newAlerts = StrategicEngine.checkFusionRules(STRATEGIC_STATE.globalState, result);
      STRATEGIC_STATE.fusionAlerts.push(...newAlerts);

      /* 记录事件日志 */
      STRATEGIC_STATE.eventLog.push({
        type: 'scenario_complete',
        scenario: result.scenarioName,
        score: result.score,
        grade: result.grade,
        timestamp: Date.now(),
      });

      STRATEGIC_STATE.isExecuting = false;
      STRATEGIC_STATE.currentScenarioIndex++;
      App.switchTab('zone_strategic');
    }, 800);
  },

  /* ---- 完成执行，进入分析 ---- */
  finishExecution(){
    const chain = STRATEGIC_CHAINS.find(c => c.id === STRATEGIC_STATE.activeChain);
    if(!chain) return;

    /* 计算最终评估 */
    STRATEGIC_STATE.finalAssessment = StrategicEngine.computeFinalAssessment(
      chain, STRATEGIC_STATE.scenarioResults, STRATEGIC_STATE.globalState,
      STRATEGIC_STATE.selectedDecisions, STRATEGIC_STATE.fusionAlerts
    );

    /* 记录推演结果到 STATE */
    if(typeof STATE !== 'undefined' && STATE.games){
      STRATEGIC_STATE.scenarioResults.forEach(r => {
        STATE.games.push({
          scenario: r.scenarioId,
          scenarioName: r.scenarioName,
          score: r.score,
          date: new Date().toISOString().slice(0, 10),
          result: r.score >= 60 ? '胜利' : '失败',
          rounds: r.roundsPlayed,
          victory: r.score >= 60,
          source: 'strategic_chain',
        });
      });
    }

    /* 反哺功能区 */
    if(typeof ZoneSystem !== 'undefined' && ZoneSystem.applyWargameResults){
      STRATEGIC_STATE.scenarioResults.forEach(r => {
        ZoneSystem.applyWargameResults(r.scenarioId, {
          victory: r.score >= 60,
          domainScores: { ...r.domains },
          scenarioName: r.scenarioName,
          score: r.score,
        });
      });
    }

    STRATEGIC_STATE.phase = 'analysis';
    App.switchTab('zone_strategic');
  },

  /* ---- 重置（返回选择） ---- */
  reset(){
    this.backToSelection();
  },

  /* ---- 重新推演当前链 ---- */
  restart(){
    const chain = STRATEGIC_CHAINS.find(c => c.id === STRATEGIC_STATE.activeChain);
    if(!chain) return;
    STRATEGIC_STATE.phase = 'planning';
    STRATEGIC_STATE.selectedDecisions = [];
    STRATEGIC_STATE.scenarioResults = [];
    STRATEGIC_STATE.conductionEffects = [];
    STRATEGIC_STATE.fusionAlerts = [];
    STRATEGIC_STATE.currentScenarioIndex = 0;
    STRATEGIC_STATE.finalAssessment = null;
    STRATEGIC_STATE.globalState = { ...chain.globalState };
    App.switchTab('zone_strategic');
  },
};

/* ===== 导出 ===== */
if(typeof window !== 'undefined'){
  window.STRATEGIC_CHAINS = STRATEGIC_CHAINS;
  window.INTEL_FUSION_RULES = INTEL_FUSION_RULES;
  window.DOMAIN_EFFECTS_MATRIX = DOMAIN_EFFECTS_MATRIX;
  window.STRATEGIC_DECISIONS = STRATEGIC_DECISIONS;
  window.STRATEGIC_STATE = STRATEGIC_STATE;
  window.StrategicEngine = StrategicEngine;
  window.renderStrategicOps = renderStrategicOps;
  window.StrategicOps = StrategicOps;
}
