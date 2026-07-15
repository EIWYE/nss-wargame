/**
 * NSS-WGS v12.4 — 威胁上下文感知引擎 (Threat Context-Aware Engine)
 *
 * 核心理念: 当威胁存在时，功能区必须"看到"威胁、"响应"威胁
 *   威胁 → 功能区感知 → 下达专属任务/指令 → 跨域传导 → 威胁态势变化
 *
 * 设计:
 *   1. 每个威胁定义各功能区的专属响应内容（情报/指令/任务/反制）
 *   2. 功能区详情页顶部显示"威胁响应"区域
 *   3. 执行威胁专属行动 → 消耗AP → 更新KPI → 跨域传导 → 威胁态势变化
 *   4. 情报中心的搜集任务结果 → 传导到指挥中心（情报共享）
 *   5. 指挥中心的作战指令 → 传导到后勤中心（保障需求）
 */

/* ===== 威胁响应模板 =====
 * 每个威胁定义各功能区应显示的专属内容:
 *   intel:      情报通报（已有情报） + 搜集任务（可下达）
 *   command:    作战指令（可下达的专属军事命令）
 *   logistics:  保障行动（后勤响应）
 *   economy:    经济反制（经济域行动）
 *   tech:       技术应对（科技/网络/信息域行动）
 */
const THREAT_RESPONSES = {

  /* ---- T-001: 台海方向兵力集结 ---- */
  'T-001': {
    title: '台海方向兵力集结',
    severity: 5,
    type: 'military',
    relatedScenario: 'taiwan_strait',
    zones: {
      intel: {
        intelligence: [
          { source:'信号情报', reliability:'A', time:'12分钟前', content:'截获航母编队加密通信，分析指向台岛以东海域集结' },
          { source:'图像情报', reliability:'A', time:'20分钟前', content:'卫星图像确认双航母编队进入预设海域，舰载机活动频繁' },
          { source:'开源情报', reliability:'B', time:'1小时前', content:'外媒报道某大国海军在西太平洋举行"自由航行"行动' },
          { source:'信号情报', reliability:'B', time:'2小时前', content:'截获台军加密通信，分析指向提升戒备等级' },
        ],
        collectionTasks: [
          { id:'ct001-1', name:'加强信号情报监听', desc:'增调电子侦察机对航母编队通信进行全频段监听', cost:2,
            effects:{intel:{collection:12,analysis:5}}, propagation:{command:'信号情报确认蓝方航母编队意图前出封控'}, synergy:{command:4,tech:3} },
          { id:'ct001-2', name:'部署水下监听阵列', desc:'在关键水道部署水下声呐阵列监控潜艇活动', cost:3,
            effects:{intel:{collection:15,warning:10}}, propagation:{command:'水下态势感知提升，确认无潜艇偷渡'}, synergy:{command:5} },
          { id:'ct001-3', name:'启动卫星过顶侦察', desc:'调轨侦察卫星对台海区域加密过顶拍摄', cost:2,
            effects:{intel:{collection:10,analysis:8}}, propagation:{command:'图像情报确认敌方两栖力量未出动'}, synergy:{command:3,tech:2} },
          { id:'ct001-4', name:'人力情报激活', desc:'激活台岛内情报网络获取内部动态', cost:3,
            effects:{intel:{analysis:15,warning:8}}, propagation:{command:'人力情报确认台军未进入战备状态'}, synergy:{command:4} },
        ],
      },
      command: {
        orders: [
          { id:'ord001-1', name:'东部战区提升战备等级', desc:'将东部战区战备等级提升至德尔塔级，全军进入高度戒备', cost:2,
            effects:{command:{readiness:12,coordination:5}}, propagation:{logistics:'战备等级提升触发物资前置需求'}, synergy:{logistics:5,intel:3} },
          { id:'ord001-2', name:'海空力量前出部署', desc:'命令海军前出至预设阵位，空军加强巡逻', cost:3,
            effects:{command:{deployment:10,readiness:5}}, propagation:{logistics:'海空力量前出需要远海补给保障'}, synergy:{logistics:6,intel:2} },
          { id:'ord001-3', name:'导弹威慑待命', desc:'火箭军东风系列导弹进入待命状态，展示战略威慑', cost:2,
            effects:{command:{readiness:8}}, propagation:{}, synergy:{economy:2,intel:2} },
          { id:'ord001-4', name:'联合封控演练启动', desc:'启动海空联合封控台海演练，展示封锁能力', cost:3,
            effects:{command:{coordination:15,deployment:8}}, propagation:{logistics:'联合封控需要弹药油料前置',economy:'封控演练影响航运保险费率'}, synergy:{logistics:5,tech:3,economy:3} },
        ],
      },
      logistics: {
        actions: [
          { id:'lg001-1', name:'战备物资前置', desc:'将弹药油料等战备物资前推至福建沿海仓库', cost:2,
            effects:{logistics:{projection:12,reserve:-3}}, propagation:{command:'物资前置完成，前沿力量可持续作战72小时'}, synergy:{command:5} },
          { id:'lg001-2', name:'民船动员准备', desc:'启动民船征用程序，准备两栖投送力量', cost:2,
            effects:{logistics:{projection:15}}, propagation:{command:'民船动员就绪，两栖投送能力可用'}, synergy:{command:4,economy:2} },
          { id:'lg001-3', name:'医疗后送体系建立', desc:'建立战区三级医疗后送通道', cost:1,
            effects:{logistics:{supply:5,reserve:3}}, propagation:{}, synergy:{command:2} },
        ],
      },
      economy: {
        actions: [
          { id:'ec001-1', name:'金融制裁预案激活', desc:'准备对台金融制裁方案，冻结相关账户', cost:2,
            effects:{economy:{firepower:10,independence:3}}, propagation:{}, synergy:{tech:2} },
          { id:'ec001-2', name:'贸易管制清单准备', desc:'拟定对台贸易管制清单，涵盖关键物资', cost:1,
            effects:{economy:{firepower:8}}, propagation:{logistics:'贸易管制需配合海关查验'}, synergy:{logistics:3} },
        ],
      },
      tech: {
        actions: [
          { id:'tc001-1', name:'电磁压制准备', desc:'部署电子战力量准备对台海区域电磁压制', cost:2,
            effects:{tech:{cyber:12,innovation:3}}, propagation:{command:'电磁压制准备就绪，可随时干扰敌方通信'}, synergy:{command:4,intel:3} },
          { id:'tc001-2', name:'认知域防御部署', desc:'防范境外舆论操纵干扰军事行动', cost:2,
            effects:{tech:{cognitive:15}}, propagation:{}, synergy:{intel:3} },
          { id:'tc001-3', name:'网络战待命', desc:'网络战部队进入待命状态，准备网络攻防', cost:2,
            effects:{tech:{cyber:10,innovation:5}}, propagation:{command:'网络战待命，可随时瘫痪敌方指挥系统'}, synergy:{command:3,intel:2} },
        ],
      },
    },
  },

  /* ---- T-002: 南海争议海域钻探 ---- */
  'T-002': {
    title: '南海争议海域钻探',
    severity: 4,
    type: 'military',
    relatedScenario: 'south_china_sea',
    zones: {
      intel: {
        intelligence: [
          { source:'图像情报', reliability:'A', time:'47分钟前', content:'卫星确认某声索国钻井平台已在万安滩就位' },
          { source:'信号情报', reliability:'B', time:'1小时前', content:'截获护卫舰编队通信，分析为护航编队' },
          { source:'开源情报', reliability:'B', time:'2小时前', content:'域外大国宣布在南海举行"自由航行"行动' },
        ],
        collectionTasks: [
          { id:'ct002-1', name:'海域态势感知加强', desc:'调集海警船和巡逻机加强万安滩区域监视', cost:2,
            effects:{intel:{collection:10,warning:8}}, propagation:{command:'海域态势感知提升，确认护卫舰编队规模和航线'}, synergy:{command:4,tech:2} },
          { id:'ct002-2', name:'声索国意图分析', desc:'对声索国国内政治和外交动向进行深度分析', cost:2,
            effects:{intel:{analysis:12}}, propagation:{command:'分析确认声索国受域外大国怂恿，并非独立决策'}, synergy:{command:3} },
          { id:'ct002-3', name:'岛礁防御态势评估', desc:'评估我方岛礁防御能力对当前威胁的应对', cost:1,
            effects:{intel:{analysis:8,warning:5}}, propagation:{command:'岛礁防御评估完成，需加强防空反舰能力'}, synergy:{command:4,logistics:2} },
        ],
      },
      command: {
        orders: [
          { id:'ord002-1', name:'海警执法力量前推', desc:'命令海警船前推至万安滩进行执法驱离', cost:2,
            effects:{command:{deployment:10,readiness:5}}, propagation:{logistics:'海警船前推需要后勤补给支援'}, synergy:{logistics:4,intel:2} },
          { id:'ord002-2', name:'海军护航编队待命', desc:'命令海军护航编队在附近海域待命支援', cost:3,
            effects:{command:{readiness:8,coordination:5}}, propagation:{logistics:'海军编队待命需要油料保障'}, synergy:{logistics:5} },
          { id:'ord002-3', name:'岛礁防御加强', desc:'加强南沙岛礁防空反舰防御部署', cost:2,
            effects:{command:{readiness:6,deployment:8}}, propagation:{tech:'岛礁防御需要电子战支援'}, synergy:{tech:3,logistics:3} },
        ],
      },
      logistics: {
        actions: [
          { id:'lg002-1', name:'岛礁补给链优化', desc:'优化南沙岛礁补给路线和频次', cost:2,
            effects:{logistics:{supply:12,projection:8}}, propagation:{command:'岛礁补给优化完成，可持续作战30天'}, synergy:{command:4} },
          { id:'lg002-2', name:'海警船补给支援', desc:'为前推海警船提供海上补给', cost:1,
            effects:{logistics:{projection:8,supply:5}}, propagation:{}, synergy:{command:3} },
        ],
      },
      economy: {
        actions: [
          { id:'ec002-1', name:'渔业资源维权', desc:'组织渔船编队在争议海域进行渔业维权', cost:1,
            effects:{economy:{firepower:5,resilience:3}}, propagation:{logistics:'渔船编队需要后勤保障'}, synergy:{logistics:3,command:2} },
          { id:'ec002-2', name:'区域全面经济伙伴关系协定杠杆', desc:'利用区域经济合作框架施加经济压力', cost:2,
            effects:{economy:{firepower:10,independence:4}}, propagation:{}, synergy:{intel:2} },
        ],
      },
      tech: {
        actions: [
          { id:'tc002-1', name:'海域监控技术部署', desc:'部署无人艇和水下滑翔机加强海域监控', cost:2,
            effects:{tech:{innovation:8,cyber:5}}, propagation:{intel:'无人监控设备数据回传，提升情报收集率'}, synergy:{intel:4,command:2} },
          { id:'tc002-2', name:'岛礁电子战部署', desc:'在岛礁部署电子战系统防空反舰', cost:3,
            effects:{tech:{cyber:15,innovation:5}}, propagation:{command:'岛礁电子战部署完成，可干扰敌方雷达通信'}, synergy:{command:4} },
        ],
      },
    },
  },

  /* ---- T-003: 大规模高级持续性威胁攻击 ---- */
  'T-003': {
    title: '大规模高级持续性威胁攻击探测',
    severity: 4,
    type: 'cyber',
    relatedScenario: 'cyber_attack',
    zones: {
      intel: {
        intelligence: [
          { source:'信号情报', reliability:'A', time:'1小时前', content:'检测到针对能源系统的高级持续性威胁攻击，攻击手法与某大国情报机构关联' },
          { source:'开源情报', reliability:'B', time:'1.5小时前', content:'多个安全厂商发布联合预警，确认新型恶意软件扩散' },
          { source:'人力情报', reliability:'C', time:'2小时前', content:'线人报告某国网络战部队近期活动异常频繁' },
        ],
        collectionTasks: [
          { id:'ct003-1', name:'全栈溯源分析', desc:'对攻击进行全栈溯源，锁定幕后方技术特征', cost:3,
            effects:{intel:{analysis:15,warning:8}}, propagation:{tech:'溯源结果已传递给科技中心，可用于精准防御',command:'溯源确认某大国情报机构支持'}, synergy:{tech:5,command:3} },
          { id:'ct003-2', name:'攻击模式研判', desc:'分析攻击模式预测下一步攻击目标', cost:2,
            effects:{intel:{analysis:10,warning:12}}, propagation:{tech:'攻击模式研判完成，预测下一目标是金融系统'}, synergy:{tech:4} },
          { id:'ct003-3', name:'暗网情报搜集', desc:'监控暗网中针对中国的攻击工具交易', cost:2,
            effects:{intel:{collection:10,analysis:5}}, propagation:{}, synergy:{tech:3} },
        ],
      },
      command: {
        orders: [
          { id:'ord003-1', name:'网络空间部队动员', desc:'命令网络空间部队全面动员进入防御状态', cost:2,
            effects:{command:{readiness:10,coordination:5}}, propagation:{tech:'网络部队动员完成，可配合科技中心进行防御'}, synergy:{tech:5} },
          { id:'ord003-2', name:'关键基础设施防护', desc:'加强能源/金融/通信等关键基础设施物理防护', cost:3,
            effects:{command:{readiness:8,deployment:6}}, propagation:{logistics:'关键基础设施防护需要安保力量增援'}, synergy:{logistics:3,tech:3} },
        ],
      },
      logistics: {
        actions: [
          { id:'lg003-1', name:'应急通信保障', desc:'建立备用通信链路防止网络攻击切断通信', cost:2,
            effects:{logistics:{supply:8,projection:5}}, propagation:{tech:'应急通信保障就绪，网络攻击无法切断指挥链'}, synergy:{tech:4,command:3} },
          { id:'lg003-2', name:'数据中心备份启动', desc:'启动异地灾备数据中心', cost:2,
            effects:{logistics:{supply:10,reserve:5}}, propagation:{}, synergy:{tech:3} },
        ],
      },
      economy: {
        actions: [
          { id:'ec003-1', name:'金融系统网络防护', desc:'加固银行和证券交易系统网络防御', cost:2,
            effects:{economy:{resilience:10,independence:5}}, propagation:{tech:'金融系统防护加固完成'}, synergy:{tech:4} },
          { id:'ec003-2', name:'数字经济应急预案', desc:'启动数字经济应急预案保障线上经济运行', cost:1,
            effects:{economy:{resilience:8}}, propagation:{}, synergy:{tech:3} },
        ],
      },
      tech: {
        actions: [
          { id:'tc003-1', name:'全网防御升级', desc:'全面升级关键信息基础设施网络防护等级', cost:3,
            effects:{tech:{cyber:18,innovation:5}}, propagation:{command:'网络防御升级完成，防护成功率提升至99%'}, synergy:{command:3,intel:3} },
          { id:'tc003-2', name:'攻击溯源与反制', desc:'基于情报溯源结果实施精准网络反制', cost:3,
            effects:{tech:{cyber:12,innovation:8}}, propagation:{intel:'网络反制成功，瘫痪敌方部分攻击基础设施',command:'反制成功，敌方网络战能力下降'}, synergy:{intel:4,command:3} },
          { id:'tc003-3', name:'蜜罐网络部署', desc:'部署大规模蜜罐网络诱捕攻击者', cost:2,
            effects:{tech:{cyber:10,innovation:6}}, propagation:{intel:'蜜罐捕获大量攻击样本，可用于进一步溯源'}, synergy:{intel:5} },
        ],
      },
    },
  },

  /* ---- T-004: 边境兵力异常调动 ---- */
  'T-004': {
    title: '边境兵力异常调动',
    severity: 3,
    type: 'military',
    relatedScenario: 'border_india',
    zones: {
      intel: {
        intelligence: [
          { source:'图像情报', reliability:'A', time:'2小时前', content:'侦察卫星确认印方在争议地区增兵约3,000人' },
          { source:'信号情报', reliability:'B', time:'3小时前', content:'截获印方边境通信，工程活动加速' },
          { source:'人力情报', reliability:'B', time:'4小时前', content:'边境牧民报告印方修筑新公路和前沿阵地' },
        ],
        collectionTasks: [
          { id:'ct004-1', name:'高原侦察加强', desc:'增调无人机对争议地区进行持续侦察', cost:2,
            effects:{intel:{collection:10,warning:8}}, propagation:{command:'无人机侦察确认印方增兵为防御性部署'}, synergy:{command:4,tech:2} },
          { id:'ct004-2', name:'印方意图研判', desc:'综合分析印方增兵的政治和军事意图', cost:2,
            effects:{intel:{analysis:12}}, propagation:{command:'研判确认印方增兵为防御性，非进攻准备'}, synergy:{command:3} },
        ],
      },
      command: {
        orders: [
          { id:'ord004-1', name:'西部战区加强戒备', desc:'命令西部战区提升边境戒备等级', cost:2,
            effects:{command:{readiness:10,coordination:5}}, propagation:{logistics:'戒备提升需要高原补给保障'}, synergy:{logistics:4} },
          { id:'ord004-2', name:'对等增兵应对', desc:'在争议地区对等增兵，防止印方蚕食', cost:3,
            effects:{command:{deployment:10,readiness:5}}, propagation:{logistics:'增兵需要高原物资和过冬装备'}, synergy:{logistics:5,tech:2} },
          { id:'ord004-3', name:'外交沟通渠道维持', desc:'维持军事外交沟通渠道防止误判', cost:1,
            effects:{command:{coordination:8}}, propagation:{}, synergy:{intel:2} },
        ],
      },
      logistics: {
        actions: [
          { id:'lg004-1', name:'高原过冬物资储备', desc:'储备高原过冬物资保障边境力量', cost:2,
            effects:{logistics:{reserve:12,supply:8}}, propagation:{command:'过冬物资储备完成，边境力量可持续过冬'}, synergy:{command:4} },
          { id:'lg004-2', name:'空运能力待命', desc:'运输机群待命保障快速投送', cost:2,
            effects:{logistics:{projection:15}}, propagation:{command:'空运能力待命，可在4小时内投送1个旅'}, synergy:{command:4} },
        ],
      },
      economy: {
        actions: [
          { id:'ec004-1', name:'边境贸易调整', desc:'调整边境贸易政策作为杠杆', cost:1,
            effects:{economy:{firepower:5}}, propagation:{}, synergy:{intel:2} },
        ],
      },
      tech: {
        actions: [
          { id:'tc004-1', name:'高原信息化部署', desc:'部署高原信息化作战系统和态势感知', cost:2,
            effects:{tech:{cyber:8,innovation:8}}, propagation:{command:'高原信息化部署完成，态势感知能力提升'}, synergy:{command:3,intel:3} },
          { id:'tc004-2', name:'电子侦察加强', desc:'加强边境电子侦察监控印方通信', cost:2,
            effects:{tech:{cyber:10,innovation:3}}, propagation:{intel:'电子侦察加强，截获更多印方通信'}, synergy:{intel:4} },
        ],
      },
    },
  },

  /* ---- T-005: 芯片出口管制升级 ---- */
  'T-005': {
    title: '芯片出口管制升级',
    severity: 3,
    type: 'economic',
    relatedScenario: 'eco_sanctions',
    zones: {
      intel: {
        intelligence: [
          { source:'人力情报', reliability:'A', time:'3小时前', content:'确认某大国将14nm以下制程设备纳入管制清单' },
          { source:'开源情报', reliability:'B', time:'4小时前', content:'12家中国企业被列入实体清单' },
          { source:'信号情报', reliability:'B', time:'5小时前', content:'截获某大国与盟友协调出口管制通信' },
        ],
        collectionTasks: [
          { id:'ct005-1', name:'管制清单影响评估', desc:'评估出口管制对中国芯片产业的具体影响', cost:2,
            effects:{intel:{analysis:12,collection:5}}, propagation:{economy:'影响评估完成，14nm以下制程短期受阻但中长期可突破',tech:'评估结果传递给科技中心用于攻关方向'}, synergy:{economy:4,tech:3} },
          { id:'ct005-2', name:'盟友协调动向追踪', desc:'追踪某大国盟友在出口管制上的协调动向', cost:2,
            effects:{intel:{collection:10,analysis:8}}, propagation:{economy:'盟友协调追踪完成，日本和荷兰可能跟进管制',command:'管制可能影响军事装备芯片供应'}, synergy:{economy:3,command:2} },
        ],
      },
      command: {
        orders: [
          { id:'ord005-1', name:'军事芯片储备核查', desc:'核查军事装备关键芯片储备情况', cost:1,
            effects:{command:{readiness:5,deployment:3}}, propagation:{logistics:'军事芯片储备核查完成，需补充战略储备'}, synergy:{logistics:4,tech:2} },
          { id:'ord005-2', name:'国防供应链安全令', desc:'发布国防供应链安全令保障军事芯片供应', cost:2,
            effects:{command:{coordination:8,readiness:5}}, propagation:{economy:'国防供应链安全令可能影响民用芯片供应'}, synergy:{economy:3,logistics:3} },
        ],
      },
      logistics: {
        actions: [
          { id:'lg005-1', name:'战略芯片储备扩充', desc:'扩充军用和工业用战略芯片储备', cost:2,
            effects:{logistics:{reserve:15,supply:5}}, propagation:{command:'战略芯片储备扩充完成，可支撑6个月需求'}, synergy:{command:4,economy:3} },
          { id:'lg005-2', name:'替代供应链建立', desc:'建立芯片替代供应链降低依赖', cost:3,
            effects:{logistics:{supply:12,projection:8}}, propagation:{economy:'替代供应链建立中，需经济中心配合投资',tech:'替代供应链需要技术攻关支持'}, synergy:{economy:4,tech:3} },
        ],
      },
      economy: {
        actions: [
          { id:'ec005-1', name:'稀土反制工具准备', desc:'准备稀土出口管制作为对等反制工具', cost:2,
            effects:{economy:{firepower:15,independence:5}}, propagation:{command:'稀土反制工具准备就绪',logistics:'稀土管制需要储备配合'}, synergy:{command:2,logistics:4} },
          { id:'ec005-2', name:'芯片国产化加速', desc:'加速国产芯片研发投入和产业化', cost:3,
            effects:{economy:{independence:12,resilience:8}}, propagation:{tech:'芯片国产化加速需要技术攻关配合'}, synergy:{tech:5} },
          { id:'ec005-3', name:'实体清单反制', desc:'发布对等实体清单反制某大国企业', cost:1,
            effects:{economy:{firepower:10}}, propagation:{}, synergy:{intel:2} },
        ],
      },
      tech: {
        actions: [
          { id:'tc005-1', name:'14nm以下工艺攻关', desc:'加速14nm以下制程工艺技术攻关', cost:3,
            effects:{tech:{innovation:15,cyber:5}}, propagation:{economy:'14nm工艺攻关进展顺利，预计12个月内突破'}, synergy:{economy:4} },
          { id:'tc005-2', name:'芯片架构自主化', desc:'推进开源指令集和自主芯片架构研发', cost:3,
            effects:{tech:{innovation:12,cyber:8}}, propagation:{command:'自主芯片架构可用于军事装备降低依赖'}, synergy:{command:3,economy:3} },
          { id:'tc005-3', name:'光刻机自主研发', desc:'加速国产光刻机研发突破封锁', cost:3,
            effects:{tech:{innovation:18}}, propagation:{economy:'光刻机研发取得阶段性进展'}, synergy:{economy:3} },
        ],
      },
    },
  },

  /* ---- T-006: 舆论操纵活动检测 ---- */
  'T-006': {
    title: '舆论操纵活动检测',
    severity: 3,
    type: 'information',
    relatedScenario: 'cognitive_war',
    zones: {
      intel: {
        intelligence: [
          { source:'开源情报', reliability:'B', time:'4小时前', content:'检测到7,500个协调账号集中发布涉华负面内容' },
          { source:'信号情报', reliability:'A', time:'5小时前', content:'溯源分析指向某大国情报机构支持的认知战组织' },
          { source:'人力情报', reliability:'C', time:'6小时前', content:'线人报告某国正在策划更大规模的舆论攻势' },
        ],
        collectionTasks: [
          { id:'ct006-1', name:'协调账号网络溯源', desc:'对协调账号网络进行深度溯源分析', cost:2,
            effects:{intel:{analysis:12,collection:8}}, propagation:{tech:'溯源结果传递给科技中心用于精准反制',command:'溯源确认某大国情报机构支持'}, synergy:{tech:4,command:2} },
          { id:'ct006-2', name:'舆论影响评估', desc:'评估舆论操纵对国内民众和国际舆论的影响', cost:2,
            effects:{intel:{analysis:10,warning:8}}, propagation:{tech:'舆论影响评估完成，需加强认知域防御'}, synergy:{tech:3} },
        ],
      },
      command: {
        orders: [
          { id:'ord006-1', name:'信息支援部队动员', desc:'命令信息支援部队动员进入认知域防御状态', cost:2,
            effects:{command:{readiness:8,coordination:5}}, propagation:{tech:'信息支援部队动员完成，可配合科技中心反制'}, synergy:{tech:4} },
        ],
      },
      logistics: {
        actions: [
          { id:'lg006-1', name:'媒体资源调配', desc:'调配媒体资源进行舆论反击', cost:1,
            effects:{logistics:{supply:5,projection:3}}, propagation:{tech:'媒体资源调配完成'}, synergy:{tech:3} },
        ],
      },
      economy: {
        actions: [
          { id:'ec006-1', name:'自主平台扶持', desc:'扶持自主社交媒体平台降低对境外平台依赖', cost:2,
            effects:{economy:{independence:10,resilience:5}}, propagation:{tech:'自主平台建设需要技术支持'}, synergy:{tech:4} },
          { id:'ec006-2', name:'算法治理加强', desc:'加强平台算法治理防止操纵', cost:1,
            effects:{economy:{resilience:5}}, propagation:{}, synergy:{tech:2} },
        ],
      },
      tech: {
        actions: [
          { id:'tc006-1', name:'认知域防御系统部署', desc:'部署人工智能驱动的认知域防御系统', cost:3,
            effects:{tech:{cognitive:18,cyber:5}}, propagation:{intel:'认知域防御系统部署完成，可自动识别协调账号',command:'认知域防御就绪，可反制舆论操纵'}, synergy:{intel:4,command:2} },
          { id:'tc006-2', name:'深度伪造检测', desc:'部署深度伪造内容检测和标记系统', cost:2,
            effects:{tech:{cognitive:12,innovation:8}}, propagation:{intel:'深度伪造检测系统已识别23个伪造视频'}, synergy:{intel:3} },
          { id:'tc006-3', name:'反制叙事构建', desc:'利用人工智能构建反制叙事和信息产品', cost:2,
            effects:{tech:{cognitive:15,innovation:5}}, propagation:{}, synergy:{intel:2,economy:2} },
        ],
      },
    },
  },

  /* ---- T-007: 东海防空识别区入侵 ---- */
  'T-007': {
    title: '东海防空识别区入侵', severity: 4, type: 'military', relatedScenario: 'east_china_sea',
    zones: {
      intel: {
        intelligence: [
          { source:'雷达情报', reliability:'A', time:'25分钟前', content:'多批不明军机进入东海防空识别区，航线指向钓鱼岛方向' },
          { source:'信号情报', reliability:'B', time:'30分钟前', content:'截获战机编队加密通信，分析为某大国舰载机联队' },
        ],
        collectionTasks: [
          { id:'ct007-1', name:'空中态势全谱侦察', desc:'调集预警机和电子侦察机对入侵编队进行全谱侦察', cost:2,
            effects:{intel:{collection:12,warning:10}}, propagation:{command:'空中态势确认，入侵编队为2架轰炸机+4架战斗机'}, synergy:{command:4,tech:3} },
          { id:'ct007-2', name:'后方基地意图研判', desc:'分析入侵编队后方基地的活动意图', cost:2,
            effects:{intel:{analysis:12}}, propagation:{command:'研判确认此次为试探性挑衅，非军事进攻前兆'}, synergy:{command:3} },
        ],
      },
      command: {
        orders: [
          { id:'ord007-1', name:'战机紧急起飞拦截', desc:'命令东部战区空军起飞歼-16编队进行拦截', cost:2,
            effects:{command:{readiness:10,deployment:8}}, propagation:{logistics:'战机拦截需要加油机保障'}, synergy:{logistics:4,tech:2} },
          { id:'ord007-2', name:'防空导弹系统待命', desc:'命令防空导弹系统进入待命状态', cost:2,
            effects:{command:{readiness:8}}, propagation:{}, synergy:{tech:2} },
        ],
      },
      logistics: { actions: [
        { id:'lg007-1', name:'空中加油保障', desc:'派遣加油机保障拦截编队长时间巡逻', cost:2,
          effects:{logistics:{projection:10,supply:5}}, propagation:{command:'加油保障就绪，拦截编队可持续巡逻4小时'}, synergy:{command:4} },
      ]},
      economy: { actions: [
        { id:'ec007-1', name:'航线保险评估', desc:'评估防空事件对东海航线保险费率的影响', cost:1,
          effects:{economy:{resilience:5}}, propagation:{}, synergy:{intel:2} },
      ]},
      tech: { actions: [
        { id:'tc007-1', name:'电子侦察加强', desc:'加强电子侦察监控入侵编队通信和雷达', cost:2,
          effects:{tech:{cyber:10,innovation:3}}, propagation:{intel:'电子侦察截获关键通信特征'}, synergy:{intel:4,command:2} },
      ]},
    },
  },

  /* ---- T-008: 金融系统网络渗透 ---- */
  'T-008': {
    title: '金融系统网络渗透', severity: 4, type: 'cyber', relatedScenario: 'cyber_attack',
    zones: {
      intel: {
        intelligence: [
          { source:'网络情报', reliability:'A', time:'35分钟前', content:'检测到针对银行结算系统的渗透行为，攻击手法关联某国网络战部队' },
          { source:'开源情报', reliability:'B', time:'40分钟前', content:'银行间交易出现异常延迟，疑似网络攻击影响' },
        ],
        collectionTasks: [
          { id:'ct008-1', name:'攻击路径溯源', desc:'对渗透行为进行全栈溯源锁定攻击路径', cost:3,
            effects:{intel:{analysis:15,warning:8}}, propagation:{tech:'溯源结果传递给科技中心进行精准防御',command:'确认攻击来自某国网络战部队'}, synergy:{tech:5,command:3} },
          { id:'ct008-2', name:'金融影响评估', desc:'评估网络渗透对金融市场的潜在影响', cost:2,
            effects:{intel:{analysis:10,warning:10}}, propagation:{economy:'评估完成，交易系统暂未受损但风险高'}, synergy:{economy:4} },
        ],
      },
      command: {
        orders: [
          { id:'ord008-1', name:'金融系统安全令', desc:'发布金融系统安全令启动应急响应', cost:2,
            effects:{command:{readiness:8,coordination:5}}, propagation:{tech:'安全令启动网络部队配合科技中心防御'}, synergy:{tech:4} },
        ],
      },
      logistics: { actions: [
        { id:'lg008-1', name:'灾备系统切换', desc:'启动金融灾备数据中心切换', cost:2,
          effects:{logistics:{supply:10,reserve:5}}, propagation:{tech:'灾备系统切换完成，交易恢复正常'}, synergy:{tech:3,economy:3} },
      ]},
      economy: { actions: [
        { id:'ec008-1', name:'交易系统加固', desc:'加固银行结算和证券交易系统网络防御', cost:2,
          effects:{economy:{resilience:12,independence:5}}, propagation:{tech:'交易系统加固完成'}, synergy:{tech:4} },
        { id:'ec008-2', name:'市场稳定干预', desc:'启动市场稳定机制防止恐慌性抛售', cost:2,
          effects:{economy:{resilience:10}}, propagation:{}, synergy:{intel:2} },
      ]},
      tech: { actions: [
        { id:'tc008-1', name:'金融网络防御升级', desc:'全面升级金融网络防护等级', cost:3,
          effects:{tech:{cyber:15,innovation:5}}, propagation:{command:'金融网络防御升级完成',economy:'防护成功率提升至99.5%'}, synergy:{command:3,economy:4} },
        { id:'tc008-2', name:'攻击反制', desc:'基于溯源结果实施精准网络反制', cost:3,
          effects:{tech:{cyber:12,innovation:8}}, propagation:{intel:'反制成功瘫痪敌方部分攻击节点'}, synergy:{intel:4,command:2} },
      ]},
    },
  },

  /* ---- T-009: 能源进口通道受阻 ---- */
  'T-009': {
    title: '能源进口通道受阻', severity: 4, type: 'economic', relatedScenario: 'eco_sanctions',
    zones: {
      intel: {
        intelligence: [
          { source:'开源情报', reliability:'A', time:'1小时前', content:'域外海军力量在马六甲海峡加强检查，油轮通行延迟48小时' },
          { source:'信号情报', reliability:'B', time:'1.5小时前', content:'截获域外海军通信，检查行动为"例行安全检查"' },
        ],
        collectionTasks: [
          { id:'ct009-1', name:'通道受阻影响评估', desc:'评估马六甲海峡受阻对能源进口的具体影响', cost:2,
            effects:{intel:{analysis:12,warning:8}}, propagation:{economy:'评估完成，每日影响原油进口约80万桶',command:'能源安全面临中等风险'}, synergy:{economy:4,command:3} },
          { id:'ct009-2', name:'域外意图研判', desc:'分析域外海军加强检查的真实意图', cost:2,
            effects:{intel:{analysis:10}}, propagation:{command:'研判为试探性施压，非全面封锁前兆'}, synergy:{command:3} },
        ],
      },
      command: {
        orders: [
          { id:'ord009-1', name:'海军护航编队出动', desc:'命令海军护航编队赴马六甲海峡保障油轮安全', cost:3,
            effects:{command:{deployment:10,readiness:5}}, propagation:{logistics:'护航编队需要远海补给保障'}, synergy:{logistics:5,tech:2} },
          { id:'ord009-2', name:'战略石油储备启动', desc:'启动战略石油储备保障国内供应', cost:2,
            effects:{command:{coordination:8}}, propagation:{economy:'战略石油储备启动，国内供应不受影响'}, synergy:{economy:4,logistics:3} },
        ],
      },
      logistics: { actions: [
        { id:'lg009-1', name:'替代运输线路规划', desc:'规划中缅油气管道和北极航线等替代运输', cost:2,
          effects:{logistics:{projection:12,supply:8}}, propagation:{economy:'替代线路可覆盖60%受阻运量'}, synergy:{economy:4} },
        { id:'lg009-2', name:'能源储备扩充', desc:'扩充原油和成品油战略储备', cost:2,
          effects:{logistics:{reserve:15}}, propagation:{command:'能源储备扩充完成，可支撑45天需求'}, synergy:{command:3,economy:3} },
      ]},
      economy: { actions: [
        { id:'ec009-1', name:'能源进口多元化', desc:'加速从中东、俄罗斯、非洲多元化能源进口', cost:3,
          effects:{economy:{independence:12,resilience:8}}, propagation:{logistics:'多元化进口需要配套物流设施'}, synergy:{logistics:4} },
        { id:'ec009-2', name:'新能源替代加速', desc:'加速新能源发展降低化石能源依赖', cost:3,
          effects:{economy:{independence:10,resilience:10}}, propagation:{tech:'新能源发展需要技术攻关支持'}, synergy:{tech:4} },
      ]},
      tech: { actions: [
        { id:'tc009-1', name:'管道运输技术升级', desc:'升级中缅油气管道运输效率', cost:2,
          effects:{tech:{innovation:10}}, propagation:{logistics:'管道运输效率提升20%'}, synergy:{logistics:3,economy:3} },
      ]},
    },
  },

  /* ---- T-011: 多边联盟围堵升级 ---- */
  'T-011': {
    title: '多边联盟围堵升级', severity: 4, type: 'diplomatic', relatedScenario: 'cognitive_war',
    zones: {
      intel: {
        intelligence: [
          { source:'外交情报', reliability:'A', time:'50分钟前', content:'某大国推动印太安全联盟扩员，拟将4国纳入联合军演框架' },
          { source:'开源情报', reliability:'B', time:'1小时前', content:'联盟峰会联合声明草案包含多项涉华条款' },
        ],
        collectionTasks: [
          { id:'ct011-1', name:'联盟内部分歧分析', desc:'分析联盟成员国在对华政策上的内部分歧', cost:2,
            effects:{intel:{analysis:12}}, propagation:{command:'分析发现3个成员国对扩员有保留意见',economy:'部分成员国担忧经济脱钩代价'}, synergy:{command:3,economy:3} },
          { id:'ct011-2', name:'扩员影响评估', desc:'评估联盟扩员对国家安全的具体影响', cost:2,
            effects:{intel:{analysis:10,warning:8}}, propagation:{command:'扩员将增加方向军事压力20%'}, synergy:{command:4} },
        ],
      },
      command: {
        orders: [
          { id:'ord011-1', name:'军事外交沟通', desc:'通过军事外交渠道与联盟成员国沟通防止误判', cost:1,
            effects:{command:{coordination:8}}, propagation:{}, synergy:{intel:3} },
          { id:'ord011-2', name:'战略威慑展示', desc:'举行针对性军事演习展示战略威慑能力', cost:3,
            effects:{command:{readiness:8,deployment:10}}, propagation:{logistics:'军演需要后勤保障支援'}, synergy:{logistics:4,tech:2} },
        ],
      },
      logistics: { actions: [
        { id:'lg011-1', name:'军演物资保障', desc:'为针对性军演提供物资保障', cost:2,
          effects:{logistics:{projection:10,supply:5}}, propagation:{command:'军演物资保障就绪'}, synergy:{command:3} },
      ]},
      economy: { actions: [
        { id:'ec011-1', name:'经济合作分化', desc:'利用经济合作分化联盟成员国', cost:2,
          effects:{economy:{firepower:12,independence:5}}, propagation:{intel:'经济分化策略有效，2个成员国态度软化'}, synergy:{intel:4} },
        { id:'ec011-2', name:'区域经济整合加速', desc:'加速RCEP等区域经济合作框架整合', cost:3,
          effects:{economy:{independence:10,resilience:8}}, propagation:{}, synergy:{diplomatic:3} },
      ]},
      tech: { actions: [
        { id:'tc011-1', name:'技术合作外交', desc:'通过技术合作外交吸引联盟成员国', cost:2,
          effects:{tech:{innovation:8}}, propagation:{economy:'技术合作外交初见成效'}, synergy:{economy:3} },
      ]},
    },
  },

  /* ---- T-013: 在轨侦察卫星抵近 ---- */
  'T-013': {
    title: '在轨侦察卫星抵近', severity: 4, type: 'space', relatedScenario: 'space_domain',
    zones: {
      intel: {
        intelligence: [
          { source:'太空情报', reliability:'A', time:'18分钟前', content:'探测到3颗异常轨道卫星抵近我方通信卫星，疑为侦察干扰平台' },
          { source:'信号情报', reliability:'B', time:'25分钟前', content:'抵近卫星发射异常信号，频谱分析指向干扰企图' },
        ],
        collectionTasks: [
          { id:'ct013-1', name:'轨道精确定轨', desc:'对抵近卫星进行精确定轨和意图分析', cost:2,
            effects:{intel:{analysis:12,warning:10}}, propagation:{tech:'精确定轨完成，3颗卫星为某大国侦察卫星',command:'太空态势评估更新，威胁等级中等'}, synergy:{tech:4,command:3} },
          { id:'ct013-2', name:'信号特征分析', desc:'分析抵近卫星信号特征确认干扰企图', cost:2,
            effects:{intel:{analysis:10,collection:8}}, propagation:{tech:'信号特征分析完成，确认干扰频段'}, synergy:{tech:4} },
        ],
      },
      command: {
        orders: [
          { id:'ord013-1', name:'军事航天部队戒备', desc:'命令军事航天部队提升戒备等级', cost:2,
            effects:{command:{readiness:10}}, propagation:{tech:'航天部队戒备完成，可随时采取行动'}, synergy:{tech:4} },
          { id:'ord013-2', name:'卫星变轨规避', desc:'命令受影响通信卫星变轨规避', cost:2,
            effects:{command:{deployment:8,readiness:5}}, propagation:{logistics:'卫星变轨需要测控保障'}, synergy:{logistics:3,tech:3} },
        ],
      },
      logistics: { actions: [
        { id:'lg013-1', name:'测控网加强', desc:'加强测控网对受影响卫星的监控', cost:2,
          effects:{logistics:{supply:8,projection:5}}, propagation:{tech:'测控网加强完成，卫星状态实时监控'}, synergy:{tech:3} },
      ]},
      economy: { actions: [] },
      tech: { actions: [
        { id:'tc013-1', name:'卫星防护部署', desc:'加强在轨卫星电子防护和抗干扰措施', cost:3,
          effects:{tech:{cyber:15,innovation:8}}, propagation:{command:'卫星防护部署完成，通信不受影响'}, synergy:{command:3,intel:2} },
        { id:'tc013-2', name:'反制卫星待命', desc:'反制卫星进入待命状态准备对等反制', cost:3,
          effects:{tech:{cyber:12,innovation:10}}, propagation:{command:'反制卫星待命，可随时实施对等反制'}, synergy:{command:4} },
        { id:'tc013-3', name:'太空态势感知加强', desc:'部署太空态势感知系统加强轨道监控', cost:2,
          effects:{tech:{innovation:10,cyber:5}}, propagation:{intel:'太空态势感知加强，可追踪所有抵近卫星'}, synergy:{intel:4} },
      ]},
    },
  },
};

/* ===== 通用威胁响应模板（按威胁类型） =====
 * 用于动态生成的威胁（如推演中产生的威胁）没有专属模板时的回退
 */
const GENERIC_THREAT_RESPONSES = {
  military: {
    intel: {
      intelligence: [
        { source:'综合情报', reliability:'B', time:'实时', content:'军事威胁态势监测中，多源情报收集进行中' },
      ],
      collectionTasks: [
        { id:'gen-mil-1', name:'多源情报搜集', desc:'协调全源情报搜集覆盖威胁区域', cost:2,
          effects:{intel:{collection:10,analysis:5}}, propagation:{command:'情报收集完成，威胁态势评估更新'}, synergy:{command:3} },
      ],
    },
    command: {
      orders: [
        { id:'gen-mil-2', name:'战备等级提升', desc:'提升相关方向战备等级', cost:2,
          effects:{command:{readiness:10}}, propagation:{logistics:'战备提升触发后勤保障需求'}, synergy:{logistics:4} },
      ],
    },
    logistics: {
      actions: [
        { id:'gen-mil-3', name:'物资前置', desc:'在威胁方向前推战备物资', cost:2,
          effects:{logistics:{projection:10,reserve:-2}}, propagation:{command:'物资前置完成'}, synergy:{command:3} },
      ],
    },
    economy: {
      actions: [
        { id:'gen-mil-4', name:'经济反制准备', desc:'准备经济反制工具箱', cost:1,
          effects:{economy:{firepower:5}}, propagation:{}, synergy:{} },
      ],
    },
    tech: {
      actions: [
        { id:'gen-mil-5', name:'态势感知加强', desc:'加强威胁方向技术侦察', cost:2,
          effects:{tech:{cyber:8,innovation:3}}, propagation:{intel:'技术侦察数据回传'}, synergy:{intel:3} },
      ],
    },
  },
  cyber: {
    intel: {
      intelligence: [
        { source:'网络情报', reliability:'B', time:'实时', content:'网络威胁监测中，攻击特征分析进行中' },
      ],
      collectionTasks: [
        { id:'gen-cyber-1', name:'攻击溯源', desc:'对网络攻击进行技术溯源', cost:3,
          effects:{intel:{analysis:12,warning:8}}, propagation:{tech:'溯源结果传递给科技中心'}, synergy:{tech:4} },
      ],
    },
    command: {
      orders: [
        { id:'gen-cyber-2', name:'网络部队动员', desc:'网络空间部队进入防御状态', cost:2,
          effects:{command:{readiness:8}}, propagation:{tech:'网络部队动员完成'}, synergy:{tech:4} },
      ],
    },
    logistics: { actions: [
      { id:'gen-cyber-3', name:'应急通信保障', desc:'建立备用通信链路', cost:2,
        effects:{logistics:{supply:8}}, propagation:{tech:'应急通信就绪'}, synergy:{tech:3} },
    ]},
    economy: { actions: [
      { id:'gen-cyber-4', name:'金融系统防护', desc:'加固金融系统网络防御', cost:2,
        effects:{economy:{resilience:8}}, propagation:{tech:'金融防护加固完成'}, synergy:{tech:3} },
    ]},
    tech: { actions: [
      { id:'gen-cyber-5', name:'全网防御升级', desc:'升级网络防护等级', cost:3,
        effects:{tech:{cyber:15,innovation:5}}, propagation:{command:'网络防御升级完成'}, synergy:{command:2,intel:2} },
    ]},
  },
  economic: {
    intel: { intelligence: [
      { source:'经济情报', reliability:'B', time:'实时', content:'经济威胁监测中，影响评估进行中' },
    ], collectionTasks: [
      { id:'gen-eco-1', name:'影响评估', desc:'评估经济威胁的具体影响', cost:2,
        effects:{intel:{analysis:10}}, propagation:{economy:'影响评估完成',tech:'评估结果传递给科技中心'}, synergy:{economy:3,tech:2} },
    ]},
    command: { orders: [
      { id:'gen-eco-2', name:'供应链安全令', desc:'发布供应链安全令', cost:2,
        effects:{command:{coordination:5}}, propagation:{logistics:'供应链安全令触发物流调整'}, synergy:{logistics:3} },
    ]},
    logistics: { actions: [
      { id:'gen-eco-3', name:'战略储备扩充', desc:'扩充受影响物资的战略储备', cost:2,
        effects:{logistics:{reserve:10}}, propagation:{economy:'战略储备扩充完成'}, synergy:{economy:3} },
    ]},
    economy: { actions: [
      { id:'gen-eco-4', name:'反制工具准备', desc:'准备经济反制工具', cost:2,
        effects:{economy:{firepower:10,independence:3}}, propagation:{}, synergy:{intel:2} },
    ]},
    tech: { actions: [
      { id:'gen-eco-5', name:'技术攻关加速', desc:'加速受影响领域的技术攻关', cost:3,
        effects:{tech:{innovation:12}}, propagation:{economy:'技术攻关进展积极'}, synergy:{economy:3} },
    ]},
  },
  information: {
    intel: { intelligence: [
      { source:'开源情报', reliability:'B', time:'实时', content:'信息威胁监测中，舆论态势分析进行中' },
    ], collectionTasks: [
      { id:'gen-info-1', name:'舆论溯源', desc:'对协调账号进行溯源分析', cost:2,
        effects:{intel:{analysis:10,collection:5}}, propagation:{tech:'溯源结果传递给科技中心'}, synergy:{tech:3} },
    ]},
    command: { orders: [
      { id:'gen-info-2', name:'信息部队动员', desc:'信息支援部队进入认知域防御', cost:2,
        effects:{command:{readiness:5,coordination:5}}, propagation:{tech:'信息部队动员完成'}, synergy:{tech:3} },
    ]},
    logistics: { actions: [
      { id:'gen-info-3', name:'媒体资源调配', desc:'调配媒体资源进行舆论反击', cost:1,
        effects:{logistics:{supply:5}}, propagation:{}, synergy:{tech:2} },
    ]},
    economy: { actions: [
      { id:'gen-info-4', name:'自主平台扶持', desc:'扶持自主平台降低境外依赖', cost:2,
        effects:{economy:{independence:8}}, propagation:{tech:'自主平台需要技术支持'}, synergy:{tech:3} },
    ]},
    tech: { actions: [
      { id:'gen-info-5', name:'认知域防御部署', desc:'部署认知域防御系统', cost:3,
        effects:{tech:{cognitive:15,innovation:5}}, propagation:{intel:'认知域防御部署完成'}, synergy:{intel:3} },
    ]},
  },
  diplomatic: {
    intel: { intelligence: [
      { source:'外交情报', reliability:'B', time:'实时', content:'外交威胁监测中，国际关系分析进行中' },
    ], collectionTasks: [
      { id:'gen-dip-1', name:'外交动向分析', desc:'分析外交威胁背后的国际关系动向', cost:2,
        effects:{intel:{analysis:10}}, propagation:{}, synergy:{} },
    ]},
    command: { orders: [
      { id:'gen-dip-2', name:'军事外交沟通', desc:'通过军事外交渠道进行沟通防止误判', cost:1,
        effects:{command:{coordination:5}}, propagation:{}, synergy:{intel:2} },
    ]},
    logistics: { actions: [] },
    economy: { actions: [
      { id:'gen-dip-3', name:'经济外交工具', desc:'运用经济外交工具施加影响', cost:2,
        effects:{economy:{firepower:8,independence:3}}, propagation:{}, synergy:{intel:2} },
    ]},
    tech: { actions: [] },
  },
  space: {
    intel: { intelligence: [
      { source:'太空情报', reliability:'A', time:'实时', content:'太空威胁监测中，轨道数据分析进行中' },
    ], collectionTasks: [
      { id:'gen-spc-1', name:'轨道数据分析', desc:'分析异常卫星轨道数据', cost:2,
        effects:{intel:{analysis:10,collection:8}}, propagation:{tech:'轨道数据传递给科技中心',command:'太空态势评估更新'}, synergy:{tech:3,command:2} },
    ]},
    command: { orders: [
      { id:'gen-spc-2', name:'军事航天部队戒备', desc:'军事航天部队提升戒备等级', cost:2,
        effects:{command:{readiness:8}}, propagation:{tech:'航天部队戒备完成'}, synergy:{tech:4} },
    ]},
    logistics: { actions: [] },
    economy: { actions: [] },
    tech: { actions: [
      { id:'gen-spc-3', name:'卫星防护部署', desc:'加强在轨卫星防护措施', cost:3,
        effects:{tech:{cyber:12,innovation:8}}, propagation:{command:'卫星防护部署完成'}, synergy:{command:3} },
    ]},
  },
};

/* ===== 威胁上下文引擎 ===== */
const ThreatContext = {

  /* ---- 运行时状态 ---- */
  _state: {
    // 已执行的威胁行动 { 'threatId-actionId': { status, completedAt, propagation } }
    executedActions: {},
    // 威胁响应进度 { threatId: { responsesIssued: 0, totalAvailable: 0, status: 'active'|'responding'|'contained' } }
    threatProgress: {},
    // 跨域传导日志
    propagationLog: [],
  },

  /* ---- 获取活跃威胁列表 ---- */
  getActiveThreats(){
    const threats = [];

    // 1. 静态威胁
    if(typeof THREATS !== 'undefined'){
      THREATS.forEach(t => {
        if(t.status === 'escalating' || t.status === 'active' || t.status === 'monitoring'){
          threats.push(t);
        }
      });
    }

    // 2. 推演中的动态威胁
    if(typeof Wargame !== 'undefined' && Wargame.state && Wargame.state.scenario){
      const scenario = Wargame.state.scenario;
      // 推演场景本身就是一个活跃威胁
      const sides = (typeof getScenarioSides === 'function') ? getScenarioSides(scenario.id) : null;
      threats.push({
        id: 'dyn-' + scenario.id,
        title: scenario.name + ' — 推演进行中',
        location: scenario.type || '',
        severity: scenario.threatLevel || 3,
        type: scenario.domain || 'military',
        time: '第' + Wargame.state.round + '轮',
        status: 'active',
        desc: scenario.background ? scenario.background.slice(0, 80) + '...' : '',
        _isWargame: true,
      });
    }

    // 3. 来自GlobalStateSync的动态威胁
    if(typeof GlobalStateSync !== 'undefined'){
      const liveThreats = GlobalStateSync.getLiveThreats();
      if(liveThreats && Array.isArray(liveThreats)){
        liveThreats.forEach(t => {
          if(t.id && t.id.startsWith('threat_dyn_') && !threats.find(et => et.id === t.id)){
            threats.push({
              id: t.id,
              title: t.name || t.title || '动态威胁',
              location: '',
              severity: t.value < 30 ? 5 : t.value <= 45 ? 4 : 3,
              type: t.domain || 'military',
              time: '实时',
              status: 'active',
              desc: t.source + ' · 当前值' + t.value,
              _isDynamic: true,
            });
          }
        });
      }
    }

    return threats;
  },

  /* ---- 获取威胁响应模板 ---- */
  getThreatResponse(threatId, threatType){
    // 优先使用专属模板
    if(THREAT_RESPONSES[threatId]){
      return THREAT_RESPONSES[threatId];
    }
    // 回退到通用模板
    if(GENERIC_THREAT_RESPONSES[threatType]){
      return {
        title: '通用威胁响应',
        severity: 3,
        type: threatType,
        zones: GENERIC_THREAT_RESPONSES[threatType],
      };
    }
    return null;
  },

  /* ---- 获取功能区相关的威胁内容 ---- */
  getZoneThreatContent(zoneId){
    const threats = this.getActiveThreats();
    if(!threats.length) return [];

    const result = [];
    threats.forEach(threat => {
      const response = this.getThreatResponse(threat.id, threat.type);
      if(!response || !response.zones || !response.zones[zoneId]) return;

      const zoneContent = response.zones[zoneId];
      const progress = this._getThreatProgress(threat.id);

      // 标记已执行的行动
      const processedActions = this._processActions(zoneId, threat.id, zoneContent);

      result.push({
        threat: threat,
        response: response,
        zoneContent: zoneContent,
        processedActions: processedActions,
        progress: progress,
      });
    });

    return result;
  },

  /* ---- 处理行动状态 ---- */
  _processActions(zoneId, threatId, zoneContent){
    const process = (actions) => {
      if(!actions) return [];
      return actions.map(a => {
        const key = threatId + '-' + a.id;
        const executed = this._state.executedActions[key];
        return {
          ...a,
          _status: executed ? executed.status : 'idle',
          _key: key,
        };
      });
    };

    return {
      intelligence: zoneContent.intelligence || [],
      collectionTasks: process(zoneContent.collectionTasks),
      orders: process(zoneContent.orders),
      actions: process(zoneContent.actions),
    };
  },

  /* ---- 获取威胁响应进度 ---- */
  _getThreatProgress(threatId){
    if(!this._state.threatProgress[threatId]){
      const response = this.getThreatResponse(threatId, '');
      let total = 0;
      if(response && response.zones){
        Object.values(response.zones).forEach(zc => {
          total += (zc.collectionTasks || []).length + (zc.orders || []).length + (zc.actions || []).length;
        });
      }
      this._state.threatProgress[threatId] = {
        responsesIssued: 0,
        totalAvailable: total,
        status: 'active',
      };
    }
    return this._state.threatProgress[threatId];
  },

  /* ---- 获取功能区的行动类型名称 ---- */
  getActionTypeName(zoneId){
    const names = {
      intel: { tasks:'搜集任务', actions:'collectionTasks' },
      command: { tasks:'作战指令', actions:'orders' },
      logistics: { tasks:'保障行动', actions:'actions' },
      economy: { tasks:'经济反制', actions:'actions' },
      tech: { tasks:'技术应对', actions:'actions' },
    };
    return names[zoneId] || { tasks:'行动', actions:'actions' };
  },

  /* ---- 获取功能区的行动列表字段名 ---- */
  getActionField(zoneId){
    if(zoneId === 'intel') return 'collectionTasks';
    if(zoneId === 'command') return 'orders';
    return 'actions';
  },

  /* ---- 执行威胁专属行动 ---- */
  executeThreatAction(zoneId, threatId, actionId){
    const response = this.getThreatResponse(threatId, '');
    if(!response || !response.zones || !response.zones[zoneId]){
      return { ok:false, msg:'未找到威胁响应内容' };
    }

    const zoneContent = response.zones[zoneId];
    const field = this.getActionField(zoneId);
    const actions = zoneContent[field] || [];
    const action = actions.find(a => a.id === actionId);
    if(!action) return { ok:false, msg:'未找到行动' };

    const key = threatId + '-' + actionId;
    if(this._state.executedActions[key]){
      return { ok:false, msg:'该行动已执行' };
    }

    // 标记为已执行
    this._state.executedActions[key] = {
      status: 'completed',
      completedAt: Date.now(),
    };

    // 更新威胁进度
    const progress = this._getThreatProgress(threatId);
    progress.responsesIssued++;
    const ratio = progress.totalAvailable > 0 ? progress.responsesIssued / progress.totalAvailable : 0;
    if(ratio >= 0.7) progress.status = 'contained';
    else if(ratio >= 0.3) progress.status = 'responding';

    // 应用KPI效应到功能区
    if(action.effects){
      Object.keys(action.effects).forEach(targetZone => {
        const tcfg = (typeof ZONE_CONFIG !== 'undefined') ? ZONE_CONFIG[targetZone] : null;
        if(!tcfg) return;
        const fx = action.effects[targetZone];
        Object.keys(fx).forEach(kpiId => {
          const kpi = tcfg.kpis.find(k => k.id === kpiId);
          if(kpi){
            kpi.value = Math.max(5, Math.min(100, kpi.value + fx[kpiId]));
            kpi.trend = fx[kpiId];
          }
        });
        // 更新功能区战备度
        if(typeof ZoneSystem !== 'undefined'){
          ZoneSystem._init(); // 确保目标功能区状态已初始化
          ZoneSystem._updateReadiness(targetZone);
        }
      });
    }

    // 应用协同效应
    if(action.synergy && typeof ZoneSystem !== 'undefined'){
      Object.keys(action.synergy).forEach(tid => {
        if(!ZoneSystem._synergyMap[tid]) ZoneSystem._synergyMap[tid] = 0;
        ZoneSystem._synergyMap[tid] += action.synergy[tid];
      });
    }

    // 记录事件日志
    if(typeof ZoneSystem !== 'undefined'){
      const zoneCfg = (typeof ZONE_CONFIG !== 'undefined') ? ZONE_CONFIG[zoneId] : null;
      const zoneName = zoneCfg ? zoneCfg.short : zoneId;
      const threatTitle = response.title || threatId;
      ZoneSystem._addEvent(zoneId, '🎯 ' + zoneName + '中心针对「' + threatTitle + '」执行「' + action.name + '」');

      // 跨域传导
      if(action.propagation){
        Object.keys(action.propagation).forEach(targetZone => {
          const msg = action.propagation[targetZone];
          const tcfg2 = (typeof ZONE_CONFIG !== 'undefined') ? ZONE_CONFIG[targetZone] : null;
          const tName = tcfg2 ? tcfg2.short : targetZone;
          ZoneSystem._addEvent(targetZone, '↪ ' + tName + '中心收到传导：' + msg);

          // 记录传导日志
          this._state.propagationLog.unshift({
            time: Date.now(),
            from: zoneId,
            to: targetZone,
            threatId,
            action: action.name,
            message: msg,
          });
        });
        if(this._state.propagationLog.length > 50) this._state.propagationLog.length = 50;
      }
    }

    // 生态系统同步
    if(typeof GlobalStateSync !== 'undefined'){
      const effectSum = action.effects ?
        Object.values(action.effects).reduce((s, fx) => s + Object.values(fx).reduce((a, v) => a + v, 0), 0) : 2;
      GlobalStateSync.syncZoneOperation(zoneId, action.name, {
        improvement: Math.max(2, Math.round(effectSum / Math.max(1, Object.keys(action.effects || {}).length))),
      });
    }

    // 更新威胁态势
    if(typeof THREATS !== 'undefined'){
      const threat = THREATS.find(t => t.id === threatId);
      if(threat){
        if(progress.status === 'contained' && threat.status !== 'contained'){
          threat.status = 'contained';
          threat._originalStatus = threat._originalStatus || threat.status;
        }
      }
    }

    return {
      ok: true,
      msg: '已执行: ' + action.name,
      propagation: action.propagation || {},
      progress: progress,
    };
  },

  /* ---- 获取跨域传导日志 ---- */
  getPropagationLog(){
    return this._state.propagationLog;
  },

  /* ---- 检查行动是否已执行 ---- */
  isActionExecuted(threatId, actionId){
    return !!this._state.executedActions[threatId + '-' + actionId];
  },

  /* ---- 获取威胁响应统计 ---- */
  getResponseStats(){
    const threats = this.getActiveThreats();
    let totalActions = 0;
    let executedActions = 0;
    let containedThreats = 0;

    threats.forEach(t => {
      const progress = this._getThreatProgress(t.id);
      totalActions += progress.totalAvailable;
      executedActions += progress.responsesIssued;
      if(progress.status === 'contained') containedThreats++;
    });

    return {
      totalThreats: threats.length,
      containedThreats,
      totalActions,
      executedActions,
      responseRate: totalActions > 0 ? Math.round(executedActions / totalActions * 100) : 0,
    };
  },

  /* ---- 渲染威胁响应区域HTML（嵌入功能区详情页） ---- */
  renderThreatResponseSection(zoneId){
    const content = this.getZoneThreatContent(zoneId);
    if(!content.length) return '';

    const zoneCfg = (typeof ZONE_CONFIG !== 'undefined') ? ZONE_CONFIG[zoneId] : null;
    const zoneColor = zoneCfg ? zoneCfg.color : '#00b4d8';
    const actionField = this.getActionField(zoneId);
    const actionTypeName = this.getActionTypeName(zoneId);

    let sectionsHtml = content.map(item => {
      const threat = item.threat;
      const response = item.response;
      const processed = item.processedActions;
      const progress = item.progress;

      // 严重度颜色
      const sevColor = threat.severity >= 5 ? '#ff4757' : threat.severity >= 4 ? '#ff6348' : threat.severity >= 3 ? '#ffa502' : '#00b4d8';
      const sevLabel = threat.severity >= 5 ? '极高' : threat.severity >= 4 ? '高' : threat.severity >= 3 ? '中' : '低';

      // 威胁状态
      const statusLabel = progress.status === 'contained' ? '已遏制' : progress.status === 'responding' ? '响应中' : '活跃';
      const statusColor = progress.status === 'contained' ? '#2ed573' : progress.status === 'responding' ? '#00b4d8' : '#ff4757';

      // 进度条
      const progressPct = progress.totalAvailable > 0 ? Math.round(progress.responsesIssued / progress.totalAvailable * 100) : 0;

      // 情报通报
      let intelHtml = '';
      if(processed.intelligence && processed.intelligence.length){
        intelHtml = `
        <div style="margin-top:10px">
          <div style="font-size:11px;color:var(--txt-2);margin-bottom:6px">📡 已有情报通报</div>
          ${processed.intelligence.map(intel => `
            <div style="padding:6px 10px;background:rgba(0,180,216,.04);border:1px solid var(--border);border-radius:4px;margin-bottom:4px;font-size:11px">
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px">
                <span style="padding:1px 5px;background:${intel.reliability==='A'?'rgba(46,213,115,.15)':intel.reliability==='B'?'rgba(255,165,2,.15)':'rgba(255,71,87,.15)'};color:${intel.reliability==='A'?'#2ed573':intel.reliability==='B'?'#ffa502':'#ff4757'};border-radius:2px;font-size:9px;font-weight:700">${intel.reliability}</span>
                <span style="color:var(--cyan);font-weight:600">${intel.source}</span>
                <span style="color:var(--txt-2);font-size:10px;margin-left:auto">${intel.time}</span>
              </div>
              <div style="color:var(--txt-1);line-height:1.5">${intel.content}</div>
            </div>
          `).join('')}
        </div>`;
      }

      // 行动列表（搜集任务/作战指令/保障行动等）
      const actions = processed[actionField] || [];
      let actionsHtml = '';
      if(actions.length){
        actionsHtml = `
        <div style="margin-top:10px">
          <div style="font-size:11px;color:var(--txt-2);margin-bottom:6px">${zoneCfg ? zoneCfg.icon : ''} ${actionTypeName.tasks}（${progress.responsesIssued}/${progress.totalAvailable}已响应）</div>
          ${actions.map(a => {
            const executed = a._status === 'completed';
            return `
            <div style="padding:8px 10px;background:${executed?'rgba(46,213,115,.06)':'rgba(0,180,216,.04)'};border:1px solid ${executed?'rgba(46,213,115,.2)':'var(--border)'};border-radius:6px;margin-bottom:6px;${executed?'opacity:.7;':''}">
              <div style="display:flex;align-items:flex-start;gap:8px">
                <div style="flex:1;min-width:0">
                  <div style="font-size:13px;font-weight:600;color:${executed?'var(--green)':'var(--txt-0)'}">${a.name} ${executed?'<span style="font-size:10px;color:var(--green)">✓</span>':''}</div>
                  <div style="font-size:11px;color:var(--txt-1);margin-top:2px;line-height:1.5">${a.desc}</div>
                  ${a.effects ? this._renderEffectPreview(a.effects) : ''}
                  ${a.propagation && Object.keys(a.propagation).length ? this._renderPropagationPreview(a.propagation) : ''}
                </div>
                <div style="flex-shrink:0;text-align:right">
                  <div style="font-size:10px;color:var(--txt-2);margin-bottom:4px">消耗${a.cost}AP</div>
                  ${executed ? '<span style="font-size:10px;color:var(--green);padding:3px 8px;background:rgba(46,213,115,.1);border-radius:3px">已执行</span>' :
                    `<button onclick="ThreatContext._executeAndRefresh('${zoneId}','${threat.id}','${a.id}')" style="padding:5px 12px;font-size:11px;font-weight:600;background:${zoneColor};color:#fff;border:none;border-radius:4px;cursor:pointer;transition:all .2s"
                      onmouseover="this.style.boxShadow='0 0 10px ${zoneColor}66'"
                      onmouseout="this.style.boxShadow='none'">执行</button>`}
                </div>
              </div>
            </div>`;
          }).join('')}
        </div>`;
      }

      return `
      <div class="threat-response-card" style="padding:14px 16px;background:rgba(8,20,40,.5);border:1px solid ${sevColor}33;border-left:3px solid ${sevColor};border-radius:8px;margin-bottom:12px">
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <div style="padding:2px 8px;background:${sevColor}15;border:1px solid ${sevColor}33;border-radius:3px;font-size:10px;font-weight:700;color:${sevColor}">${sevLabel}</div>
          <div style="font-size:14px;font-weight:700;color:var(--txt-0)">${threat.title}</div>
          <div style="margin-left:auto;display:flex;align-items:center;gap:8px">
            <div style="font-size:10px;color:var(--txt-2)">${threat.location || ''}</div>
            <div style="padding:2px 8px;background:${statusColor}15;border:1px solid ${statusColor}33;border-radius:3px;font-size:10px;color:${statusColor}">${statusLabel}</div>
          </div>
        </div>
        <div style="font-size:11px;color:var(--txt-2);margin-top:4px;line-height:1.5">${threat.desc || ''}</div>
        <!-- 进度条 -->
        <div style="margin-top:8px;height:3px;background:rgba(0,180,216,.08);border-radius:2px;overflow:hidden">
          <div style="height:100%;width:${progressPct}%;background:${statusColor};border-radius:2px;transition:width .3s"></div>
        </div>
        <div style="font-size:10px;color:var(--txt-2);margin-top:3px;text-align:right">响应进度 ${progressPct}%</div>
        ${intelHtml}
        ${actionsHtml}
      </div>`;
    }).join('');

    const stats = this.getResponseStats();

    return `
    <div class="threat-context-section" style="margin-bottom:16px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
        <div style="font-size:14px;font-weight:700;color:#ff4757;display:flex;align-items:center;gap:6px">
          <span style="width:8px;height:8px;border-radius:50%;background:#ff4757;animation:pulse 1.5s infinite"></span>
          威胁响应中心
        </div>
        <div style="font-size:11px;color:var(--txt-2)">
          ${stats.totalThreats}个活跃威胁 · ${stats.containedThreats}个已遏制 · 响应率${stats.responseRate}%
        </div>
      </div>
      ${sectionsHtml}
    </div>`;
  },

  /* ---- 渲染效果预览 ---- */
  _renderEffectPreview(effects){
    const parts = [];
    const zoneNames = { intel:'情报', command:'指挥', logistics:'后勤', economy:'经济', tech:'科技' };
    const kpiNames = {
      collection:'收集率', analysis:'研判力', warning:'预警',
      readiness:'战备', deployment:'部署', coordination:'联合作战',
      supply:'供应链', reserve:'储备', projection:'投送',
      resilience:'韧性', firepower:'火力', independence:'自主度',
      cyber:'网络防护', cognitive:'认知战', innovation:'自主率',
    };
    Object.keys(effects).forEach(zone => {
      const zName = zoneNames[zone] || zone;
      Object.keys(effects[zone]).forEach(kpi => {
        const kName = kpiNames[kpi] || kpi;
        const val = effects[zone][kpi];
        parts.push('<span style="color:' + (val > 0 ? '#2ed573' : '#ff4757') + '">' + zName + kName + (val > 0 ? '+' : '') + val + '</span>');
      });
    });
    if(!parts.length) return '';
    return '<div style="font-size:10px;margin-top:3px">→ 效果: ' + parts.join(' · ') + '</div>';
  },

  /* ---- 渲染传导预览 ---- */
  _renderPropagationPreview(propagation){
    const parts = [];
    const zoneNames = { intel:'情报', command:'指挥', logistics:'后勤', economy:'经济', tech:'科技' };
    Object.keys(propagation).forEach(zone => {
      const zName = zoneNames[zone] || zone;
      parts.push('<span style="color:#ffa502">' + zName + '←' + propagation[zone].slice(0, 20) + '...</span>');
    });
    if(!parts.length) return '';
    return '<div style="font-size:10px;margin-top:3px">⇒ 传导: ' + parts.join(' · ') + '</div>';
  },

  /* ---- 执行并刷新UI ---- */
  _executeAndRefresh(zoneId, threatId, actionId){
    const result = this.executeThreatAction(zoneId, threatId, actionId);
    if(typeof ZoneUI !== 'undefined'){
      if(!result.ok){
        ZoneUI._flashMsg(result.msg, 'error');
        return;
      }
      ZoneUI._flashMsg(result.msg + (Object.keys(result.propagation).length ? ' (已传导至' + Object.keys(result.propagation).length + '个功能区)' : ''), 'success');
      ZoneUI._refreshDetail(zoneId);
    }
  },

  /* ---- 渲染仪表盘威胁响应小组件 ---- */
  _renderDashboardWidget(){
    const threats = this.getActiveThreats();
    if(!threats.length) return '';

    const stats = this.getResponseStats();
    const topThreats = threats.slice(0, 4);
    const recentProp = this._state.propagationLog.slice(0, 3);

    return `
    <div class="panel fade-in" style="padding:16px 20px;margin-bottom:16px;border-color:#ff475733;position:relative;overflow:hidden">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
        <div style="font-size:14px;font-weight:700;color:#ff4757;display:flex;align-items:center;gap:6px">
          <span style="width:8px;height:8px;border-radius:50%;background:#ff4757;animation:pulse 1.5s infinite"></span>
          威胁响应态势
        </div>
        <div style="margin-left:auto;display:flex;gap:12px;font-size:11px">
          <span style="color:var(--txt-2)">活跃 <strong style="color:#ff4757">${stats.totalThreats}</strong></span>
          <span style="color:var(--txt-2)">已遏制 <strong style="color:var(--green)">${stats.containedThreats}</strong></span>
          <span style="color:var(--txt-2)">响应率 <strong style="color:var(--cyan)">${stats.responseRate}%</strong></span>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:12px">
        ${topThreats.map(t => {
          const progress = this._getThreatProgress(t.id);
          const sevColor = t.severity >= 5 ? '#ff4757' : t.severity >= 4 ? '#ff6348' : t.severity >= 3 ? '#ffa502' : '#00b4d8';
          const statusColor = progress.status === 'contained' ? '#2ed573' : progress.status === 'responding' ? '#00b4d8' : '#ff4757';
          const pct = progress.totalAvailable > 0 ? Math.round(progress.responsesIssued / progress.totalAvailable * 100) : 0;

          // 查找关联场景
          const response = this.getThreatResponse(t.id, t.type);
          const relatedScenarioId = response ? response.relatedScenario : '';
          const relatedScenario = relatedScenarioId && typeof SCENARIOS !== 'undefined' ? SCENARIOS.find(s => s.id === relatedScenarioId) : null;

          // 查找关联功能区
          const relatedZones = [];
          if(response && response.zones){
            Object.keys(response.zones).forEach(zid => {
              const zcfg = (typeof ZONE_CONFIG !== 'undefined') ? ZONE_CONFIG[zid] : null;
              if(zcfg) relatedZones.push({ id:zid, short:zcfg.short, color:zcfg.color });
            });
          }

          const typeIcon = { military:'⚔️', cyber:'🌐', economic:'💰', diplomatic:'🤝', space:'🛰️', information:'📡' }[t.type] || '⚠️';

          return `
          <div style="padding:10px 12px;background:rgba(8,20,40,.5);border:1px solid ${sevColor}22;border-left:3px solid ${sevColor};border-radius:6px;transition:all .2s">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
              <span style="font-size:11px">${typeIcon}</span>
              <span style="font-size:12px;font-weight:600;color:var(--txt-0);flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t.title}</span>
              <span style="font-size:9px;padding:1px 5px;background:${statusColor}15;border:1px solid ${statusColor}33;border-radius:2px;color:${statusColor}">${progress.status === 'contained' ? '已遏制' : progress.status === 'responding' ? '响应中' : '活跃'}</span>
            </div>
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
              <div style="flex:1;height:3px;background:rgba(0,180,216,.08);border-radius:2px;overflow:hidden">
                <div style="height:100%;width:${pct}%;background:${statusColor};border-radius:2px;transition:width .3s"></div>
              </div>
              <span style="font-size:9px;color:${statusColor}">${pct}%</span>
            </div>
            <div style="font-size:10px;color:var(--txt-2);margin-bottom:6px">${t.location || ''} · ${progress.responsesIssued}/${progress.totalAvailable}行动</div>
            <!-- 快速响应按钮组 -->
            <div style="display:flex;gap:4px;flex-wrap:wrap">
              ${relatedZones.slice(0,3).map(z => `<button onclick="if(typeof App!=='undefined'){App.switchTab('zones');}if(typeof ZoneUI!=='undefined'){setTimeout(function(){ZoneUI.showDetail('${z.id}');},200);}" style="font-size:9px;padding:2px 6px;background:${z.color}10;border:1px solid ${z.color}33;border-radius:2px;color:${z.color};cursor:pointer;transition:all .15s" onmouseover="this.style.background='${z.color}20'" onmouseout="this.style.background='${z.color}10'">${z.short}</button>`).join('')}
              ${relatedScenario ? `<button onclick="App._launchThreatWargame('${relatedScenarioId}')" style="font-size:9px;padding:2px 6px;background:rgba(255,71,87,.1);border:1px solid rgba(255,71,87,.3);border-radius:2px;color:#ff4757;cursor:pointer;transition:all .15s" onmouseover="this.style.background='rgba(255,71,87,.2)'" onmouseout="this.style.background='rgba(255,71,87,.1)'">🎮 推演</button>` : ''}
            </div>
          </div>`;
        }).join('')}
      </div>

      ${recentProp.length ? `
      <div style="padding:8px 12px;background:rgba(255,165,2,.04);border:1px solid rgba(255,165,2,.15);border-radius:6px">
        <div style="font-size:10px;color:var(--amber);margin-bottom:4px">⇄ 最近跨域传导</div>
        ${recentProp.map(log => {
          const zoneNames = { intel:'情报', command:'指挥', logistics:'后勤', economy:'经济', tech:'科技' };
          return '<div style="font-size:10px;color:var(--txt-1);margin-bottom:2px">' +
            '<span style="color:var(--cyan)">' + (zoneNames[log.from] || log.from) + '</span>' +
            ' → <span style="color:var(--green)">' + (zoneNames[log.to] || log.to) + '</span>: ' +
            log.message + '</div>';
        }).join('')}
      </div>` : ''}

      <div style="margin-top:10px;text-align:center">
        <span style="font-size:11px;color:var(--cyan);cursor:pointer"
          onclick="if(typeof App!=='undefined'){App.switchTab('zones');}">前往功能区响应威胁 →</span>
      </div>
    </div>`;
  },

  /* ---- 渲染全域威胁概览（嵌入全域协同视图顶部） ---- */
  _renderGlobalThreatOverview(){
    const threats = this.getActiveThreats();
    if(!threats.length) return '';

    const stats = this.getResponseStats();

    let threatCardsHtml = threats.map(t => {
      const progress = this._getThreatProgress(t.id);
      const sevColor = t.severity >= 5 ? '#ff4757' : t.severity >= 4 ? '#ff6348' : t.severity >= 3 ? '#ffa502' : '#00b4d8';
      const sevLabel = t.severity >= 5 ? '极高' : t.severity >= 4 ? '高' : t.severity >= 3 ? '中' : '低';
      const statusLabel = progress.status === 'contained' ? '已遏制' : progress.status === 'responding' ? '响应中' : '活跃';
      const statusColor = progress.status === 'contained' ? '#2ed573' : progress.status === 'responding' ? '#00b4d8' : '#ff4757';
      const progressPct = progress.totalAvailable > 0 ? Math.round(progress.responsesIssued / progress.totalAvailable * 100) : 0;

      // 找到关联的功能区
      const response = this.getThreatResponse(t.id, t.type);
      const relatedZones = [];
      if(response && response.zones){
        Object.keys(response.zones).forEach(zid => {
          const zcfg = (typeof ZONE_CONFIG !== 'undefined') ? ZONE_CONFIG[zid] : null;
          if(zcfg) relatedZones.push(zcfg);
        });
      }
      const relatedScenarioId = response ? response.relatedScenario : '';
      const relatedScenario = relatedScenarioId && typeof SCENARIOS !== 'undefined' ? SCENARIOS.find(s => s.id === relatedScenarioId) : null;

      return `
      <div class="threat-response-card" style="padding:10px 14px;background:rgba(8,20,40,.5);border:1px solid ${sevColor}33;border-left:3px solid ${sevColor};border-radius:6px;margin-bottom:8px;transition:all .2s"
        onmouseover="this.style.borderColor='${sevColor}66'"
        onmouseout="this.style.borderColor='${sevColor}33'">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <span style="padding:2px 6px;background:${sevColor}15;border:1px solid ${sevColor}33;border-radius:2px;font-size:9px;font-weight:700;color:${sevColor}">${sevLabel}</span>
          <span style="font-size:13px;font-weight:600;color:var(--txt-0)">${t.title}</span>
          <span style="margin-left:auto;padding:2px 6px;background:${statusColor}15;border:1px solid ${statusColor}33;border-radius:2px;font-size:9px;color:${statusColor}">${statusLabel}</span>
        </div>
        <div style="font-size:11px;color:var(--txt-2);margin-top:4px">${t.location || ''} · ${t.time}</div>
        <div style="display:flex;align-items:center;gap:8px;margin-top:6px">
          <div style="flex:1;height:3px;background:rgba(0,180,216,.08);border-radius:2px;overflow:hidden">
            <div style="height:100%;width:${progressPct}%;background:${statusColor};border-radius:2px;transition:width .3s"></div>
          </div>
          <span style="font-size:10px;color:var(--txt-2)">${progressPct}%</span>
        </div>
        <div style="margin-top:6px;display:flex;gap:4px;flex-wrap:wrap;align-items:center">
          ${relatedZones.length ? relatedZones.map(z => `<button onclick="ZoneUI.showDetail('${z.id}')" style="font-size:9px;padding:2px 6px;background:${z.color}10;border:1px solid ${z.color}33;border-radius:2px;color:${z.color};cursor:pointer">${z.icon} ${z.short}</button>`).join('') : ''}
          ${relatedScenario ? `<button onclick="if(typeof App!=='undefined'){App._launchThreatWargame('${relatedScenarioId}')}" style="font-size:9px;padding:2px 6px;background:rgba(255,71,87,.1);border:1px solid rgba(255,71,87,.3);border-radius:2px;color:#ff4757;cursor:pointer">🎮 启动推演</button>` : ''}
        </div>
      </div>`;
    }).join('');

    // 传导日志
    const propLog = this._state.propagationLog.slice(0, 5);
    let propHtml = '';
    if(propLog.length){
      const zoneNames = { intel:'情报', command:'指挥', logistics:'后勤', economy:'经济', tech:'科技' };
      propHtml = `
      <div style="margin-top:12px;padding:10px 14px;background:rgba(0,180,216,.04);border:1px solid var(--border);border-radius:6px">
        <div style="font-size:11px;color:var(--amber);margin-bottom:6px">⇄ 跨域传导日志</div>
        ${propLog.map(log => `
          <div style="font-size:10px;color:var(--txt-1);margin-bottom:3px">
            <span style="color:var(--cyan)">${zoneNames[log.from] || log.from}</span>
            → <span style="color:var(--green)">${zoneNames[log.to] || log.to}</span>
            : ${log.message}
          </div>
        `).join('')}
      </div>`;
    }

    return `
    <div class="panel" style="padding:14px 18px;margin-bottom:16px;border-color:#ff475733">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <div style="font-size:13px;font-weight:700;color:#ff4757;display:flex;align-items:center;gap:6px">
          <span style="width:8px;height:8px;border-radius:50%;background:#ff4757;animation:pulse 1.5s infinite"></span>
          活跃威胁与响应态势
        </div>
        <div style="margin-left:auto;font-size:11px;color:var(--txt-2)">
          ${stats.totalThreats}个威胁 · ${stats.containedThreats}个已遏制 · 响应率${stats.responseRate}%
        </div>
      </div>
      <div>${threatCardsHtml}</div>
      ${propHtml}
    </div>`;
  },

  /* ---- 重置 ---- */
  reset(){
    this._state.executedActions = {};
    this._state.threatProgress = {};
    this._state.propagationLog = [];
  },
};

/* ===== 全局暴露 ===== */
if(typeof window !== 'undefined'){
  window.THREAT_RESPONSES = THREAT_RESPONSES;
  window.GENERIC_THREAT_RESPONSES = GENERIC_THREAT_RESPONSES;
  window.ThreatContext = ThreatContext;
}
