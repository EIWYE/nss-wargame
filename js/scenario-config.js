/* ================================================================
 * NSS-WGS v12.4 场景化配置数据
 * 为每个场景定义独特的力量调配、情报包、功能模块内容
 * 替代之前所有场景共用FORCES/INTEL/MODULES的设计
 * ================================================================ */

/* ===== 场景化力量配置 =====
 * 每个场景定义相关军种及其战备状态
 * c=code(匹配FORCES中的base), r=readiness, s=status, d=deployment, e=equipment, n=note
 * 若场景未定义，回退到全局FORCES
 */
const SCENARIO_FORCES = {
  taiwan_strait: [
    { c:'海军', r:88, s:'deployed', d:'东海+南海舰队', e:'3航母/48驱逐舰/78潜艇', n:'航母编队已前出第一岛链' },
    { c:'空军', r:92, s:'high_alert', d:'东部+南部战区空军', e:'3200架/含轰-6K', n:'夺取制空权准备就绪' },
    { c:'陆军', r:80, s:'ready', d:'东部战区', e:'两栖合成旅/特战旅', n:'两栖登陆力量集结' },
    { c:'火箭军', r:95, s:'high_alert', d:'对台导弹全覆盖', e:'1200+发射单元/东风系列', n:'精确打击待命' },
    { c:'军事航天', r:88, s:'active', d:'台海轨道侦察', e:'遥感卫星/北斗导航', n:'全域态势感知保障' },
    { c:'网络空间', r:90, s:'high_alert', d:'信息作战全频段', e:'网络攻防/电子战', n:'电磁压制展开' },
    { c:'信息支援', r:85, s:'active', d:'通信保障/频谱管控', e:'电子战飞机/通信中继', n:'指挥通信保障' },
    { c:'联勤保障', r:82, s:'ready', d:'东部战区联勤中心', e:'战略投送/野战保障', n:'两栖作战后勤准备' },
    { c:'海警局', r:90, s:'deployed', d:'台海周边海域', e:'大型海警船/执法编队', n:'海上执法封控' },
  ],
  south_china_sea: [
    { c:'海军', r:85, s:'deployed', d:'南海舰队', e:'2航母/35驱逐舰/核潜艇', n:'航母编队南海巡逻' },
    { c:'空军', r:82, s:'ready', d:'南部战区空军', e:'歼-16/轰-6K', n:'永兴岛机场部署' },
    { c:'火箭军', r:88, s:'high_alert', d:'南海方向覆盖', e:'东风-21D/东风-26', n:'反航母弹道导弹待命' },
    { c:'军事航天', r:80, s:'active', d:'南海海域监视', e:'遥感卫星/海洋监视卫星', n:'海域态势感知' },
    { c:'网络空间', r:78, s:'active', d:'南海网络域', e:'网络防御/电子对抗', n:'信息域对抗' },
    { c:'联勤保障', r:75, s:'ready', d:'南海方向保障', e:'海上补给/岛礁保障', n:'岛礁补给线维护' },
    { c:'海警局', r:92, s:'deployed', d:'南沙/西沙海域', e:'大型海警船/执法编队', n:'岛礁周边常态化巡航' },
    { c:'民兵预备役', r:72, s:'ready', d:'南海民兵', e:'渔船/海上民兵编队', n:'海上民兵力量配合' },
  ],
  border_india: [
    { c:'陆军', r:82, s:'ready', d:'西部战区', e:'山地合成旅/高原装备', n:'高原作战力量前推' },
    { c:'空军', r:78, s:'ready', d:'西部战区空军', e:'歼-16/歼-20/运输机', n:'高原机场部署' },
    { c:'军事航天', r:75, s:'active', d:'边境侦察监视', e:'遥感卫星/无人机', n:'实时监控印军动向' },
    { c:'信息支援', r:72, s:'active', d:'边境电子战', e:'电子侦察/通信干扰', n:'电磁频谱管控' },
    { c:'联勤保障', r:70, s:'ready', d:'高原保障链', e:'空投/高原补给/医疗', n:'高原后勤保障' },
    { c:'武警', r:85, s:'ready', d:'边境管控', e:'边防部队/巡逻装备', n:'实控线巡逻加强' },
  ],
  eco_sanctions: [
    { c:'网络空间', r:85, s:'active', d:'金融网络防护', e:'金融防火墙/加密体系', n:'金融关键基础设施防护' },
    { c:'信息支援', r:78, s:'active', d:'经济信息保障', e:'数据安全/通信加密', n:'经济信息安全保障' },
    { c:'联勤保障', r:72, s:'ready', d:'战略物资储备', e:'仓储物流/应急调配', n:'战略物资调配准备' },
    { c:'武警', r:75, s:'ready', d:'经济安保', e:'经济安保部队', n:'关键设施安保加强' },
  ],
  cyber_attack: [
    { c:'网络空间', r:92, s:'high_alert', d:'全域网络战场', e:'攻防系统/溯源平台/蜜罐网络', n:'网络战部队全面动员' },
    { c:'信息支援', r:82, s:'active', d:'信息保障', e:'电子战飞机/通信中继', n:'电磁频谱管控' },
    { c:'军事航天', r:78, s:'active', d:'卫星通信保障', e:'通信卫星/导航卫星', n:'卫星通信链路保障' },
    { c:'武警', r:78, s:'active', d:'关键设施防护', e:'网络安全巡逻/应急响应', n:'政务/能源系统防护' },
  ],
  hybrid_warfare: [
    { c:'网络空间', r:88, s:'high_alert', d:'多域网络对抗', e:'网络攻防/电子战', n:'全域信息对抗展开' },
    { c:'信息支援', r:85, s:'high_alert', d:'认知域作战', e:'舆论战/心理战/电子战', n:'认知域全面防御' },
    { c:'军事航天', r:75, s:'active', d:'全域态势感知', e:'遥感卫星/信号侦察', n:'多域情报融合' },
    { c:'海军', r:75, s:'ready', d:'周边海域', e:'驱逐舰/护卫舰', n:'海上威慑巡逻' },
    { c:'空军', r:78, s:'ready', d:'防空识别区', e:'预警机/战斗机', n:'防空巡逻加强' },
    { c:'武警', r:85, s:'active', d:'国内安保', e:'反恐/防暴/网络巡逻', n:'社会面管控加强' },
    { c:'民兵预备役', r:70, s:'ready', d:'人民防空', e:'防空/工程/通信民兵', n:'国防动员准备' },
  ],
  middle_east: [
    { c:'海军', r:82, s:'deployed', d:'亚丁湾/红海', e:'护航编队/两栖舰', n:'护航与撤侨准备' },
    { c:'空军', r:75, s:'ready', d:'远程投送', e:'运-20/伊尔-76', n:'撤侨运输待命' },
    { c:'军事航天', r:72, s:'active', d:'中东方向侦察', e:'卫星/电子侦察', n:'地区态势监控' },
    { c:'信息支援', r:70, s:'active', d:'通信保障', e:'卫星通信/战术通信', n:'远程指挥通信保障' },
    { c:'联勤保障', r:78, s:'ready', d:'海外保障基地', e:'吉布提基地/补给投送', n:'海外后勤保障运作' },
    { c:'武警', r:72, s:'ready', d:'使馆安保', e:'特勤/反恐', n:'外交机构安保' },
  ],
  hormuz: [
    { c:'海军', r:85, s:'deployed', d:'印度洋/波斯湾', e:'驱逐舰/护卫舰/补给舰', n:'第45批护航编队' },
    { c:'空军', r:72, s:'ready', d:'远程支援', e:'轰-6K/加油机', n:'远程打击准备' },
    { c:'军事航天', r:78, s:'active', d:'海峡监视', e:'海洋卫星/电子侦察', n:'航道安全监控' },
    { c:'联勤保障', r:75, s:'ready', d:'远洋补给', e:'补给舰/海上医疗', n:'远洋后勤补给' },
  ],
  arctic: [
    { c:'海军', r:65, s:'ready', d:'北极航道', e:'雪龙号/破冰船', n:'极地科考与航道探索' },
    { c:'军事航天', r:75, s:'active', d:'极地卫星', e:'冰路卫星/遥感', n:'北极态势感知' },
    { c:'信息支援', r:68, s:'active', d:'极地通信', e:'极地通信站/卫星链路', n:'极地通信保障' },
    { c:'武警', r:60, s:'ready', d:'极地站点安保', e:'极地巡逻装备', n:'科考站安保' },
  ],
  space_domain: [
    { c:'军事航天', r:92, s:'high_alert', d:'轨道对抗', e:'反卫星武器/在轨操控', n:'太空攻防准备' },
    { c:'网络空间', r:85, s:'active', d:'卫星链路防护', e:'卫星通信加密/链路安全', n:'太空网络防护' },
    { c:'信息支援', r:80, s:'active', d:'航天测控', e:'测控站/远望船/频谱管控', n:'轨道测控保障' },
    { c:'空军', r:75, s:'ready', d:'航天发射保障', e:'发射场/测控网', n:'航天发射支持' },
    { c:'火箭军', r:82, s:'high_alert', d:'反卫星发射', e:'动能/定向能武器', n:'反卫导弹待命' },
  ],
  ai_race: [
    { c:'网络空间', r:88, s:'active', d:'人工智能军事化应用', e:'智能指挥/无人集群', n:'人工智能作战体系构建' },
    { c:'信息支援', r:82, s:'active', d:'智能信息处理', e:'大数据分析/智能决策', n:'智能信息支援' },
    { c:'军事航天', r:80, s:'active', d:'智能卫星组网', e:'智能卫星/在轨处理', n:'天基智能侦察' },
    { c:'空军', r:78, s:'ready', d:'无人作战', e:'无人机/忠诚僚机', n:'无人化作战试验' },
    { c:'武警', r:72, s:'ready', d:'人工智能安防', e:'智能监控/大数据', n:'社会安全人工智能应用' },
  ],
  finance_war: [
    { c:'网络空间', r:88, s:'high_alert', d:'金融网络防护', e:'金融防火墙/加密体系', n:'金融网络全面防护' },
    { c:'信息支援', r:75, s:'active', d:'金融信息保障', e:'数据安全/加密通信', n:'金融信息安全' },
    { c:'武警', r:78, s:'active', d:'金融安保', e:'金融安保/反洗钱', n:'金融秩序维护' },
  ],
  rare_earth: [
    { c:'海军', r:80, s:'deployed', d:'资源运输线', e:'护卫舰/补给舰', n:'战略资源运输护航' },
    { c:'军事航天', r:75, s:'active', d:'资源监控', e:'卫星/地质侦察', n:'战略资源态势感知' },
    { c:'联勤保障', r:78, s:'ready', d:'资源储备调配', e:'战略储备/物流调配', n:'战略资源储备管理' },
    { c:'武警', r:75, s:'ready', d:'矿区安保', e:'安保/巡逻', n:'战略矿场防护' },
  ],
  digital_sovereignty: [
    { c:'网络空间', r:88, s:'active', d:'数字基础设施', e:'数据安全/云平台/区块链', n:'数字主权防线' },
    { c:'信息支援', r:80, s:'active', d:'通信主权', e:'自主通信/加密体系', n:'通信主权保障' },
    { c:'军事航天', r:75, s:'active', d:'北斗导航主权', e:'北斗系统/自主导航', n:'导航定位主权' },
    { c:'武警', r:72, s:'ready', d:'数据安全', e:'网络安全巡逻', n:'数据跨境监管' },
  ],
  diaoyu: [
    { c:'海军', r:85, s:'deployed', d:'东海舰队', e:'驱逐舰/护卫舰/潜艇', n:'钓鱼岛周边海域巡逻' },
    { c:'空军', r:88, s:'high_alert', d:'东部战区空军', e:'歼-16/预警机/电战机', n:'东海防空识别区巡逻' },
    { c:'军事航天', r:82, s:'active', d:'东海监视', e:'海洋卫星/无人机', n:'海域实时监控' },
    { c:'信息支援', r:78, s:'active', d:'电子战', e:'电子侦察/干扰', n:'电磁频谱管控' },
    { c:'海警局', r:92, s:'deployed', d:'钓鱼岛海域', e:'大型海警船/执法快艇', n:'常态化执法巡航' },
  ],
  korean_peninsula: [
    { c:'陆军', r:80, s:'ready', d:'北部战区', e:'集团军/装甲旅', n:'边境防御加强' },
    { c:'空军', r:85, s:'high_alert', d:'北部战区空军', e:'歼-20/歼-16', n:'防空战斗巡逻' },
    { c:'火箭军', r:90, s:'high_alert', d:'东北方向', e:'东风-26/东风-41', n:'战略威慑待命' },
    { c:'军事航天', r:85, s:'active', d:'半岛监控', e:'侦察卫星/电子侦察', n:'核试/导试监控' },
    { c:'信息支援', r:78, s:'active', d:'电磁监视', e:'信号情报/频谱监视', n:'半岛电磁态势监控' },
    { c:'联勤保障', r:75, s:'ready', d:'东北方向保障', e:'战略储备/应急投送', n:'战区后勤保障' },
  ],
  myanmar: [
    { c:'陆军', r:78, s:'ready', d:'南部战区', e:'山地合成旅/边防团', n:'中缅边境封控' },
    { c:'信息支援', r:75, s:'active', d:'边境侦察', e:'无人机/电子侦察', n:'缅甸局势监控' },
    { c:'军事航天', r:70, s:'active', d:'边境监视', e:'遥感卫星/无人机', n:'边境态势感知' },
    { c:'武警', r:85, s:'deployed', d:'中缅边境', e:'边防/巡逻/排爆', n:'边境安全管控' },
    { c:'民兵预备役', r:72, s:'ready', d:'边境民兵', e:'边防民兵/巡逻', n:'边防民兵配合' },
  ],
  afghanistan: [
    { c:'信息支援', r:75, s:'active', d:'中亚方向侦察', e:'无人机/电子侦察', n:'恐怖势力监控' },
    { c:'军事航天', r:70, s:'active', d:'中亚方向卫星', e:'侦察卫星/信号情报', n:'地区态势感知' },
    { c:'武警', r:80, s:'ready', d:'瓦罕走廊边境', e:'边防/高原巡逻', n:'边境渗透防御' },
    { c:'陆军', r:70, s:'ready', d:'西部战区', e:'山地部队/机动旅', n:'快速反应待命' },
    { c:'民兵预备役', r:68, s:'ready', d:'边境民兵', e:'边防民兵/巡逻', n:'边境民兵联防' },
  ],
  horn_africa: [
    { c:'海军', r:80, s:'deployed', d:'亚丁湾/红海', e:'护航编队/补给舰', n:'吉布提保障基地运作' },
    { c:'军事航天', r:72, s:'active', d:'非洲之角侦察', e:'卫星/信号情报', n:'地区安全态势感知' },
    { c:'信息支援', r:70, s:'active', d:'通信保障', e:'卫星通信/远程通信', n:'远程指挥通信' },
    { c:'联勤保障', r:78, s:'ready', d:'海外保障基地', e:'吉布提基地/补给', n:'海外后勤保障' },
    { c:'武警', r:75, s:'ready', d:'海外利益保护', e:'特勤/安保', n:'中资机构安保' },
  ],
  venezuela: [
    { c:'军事航天', r:70, s:'active', d:'拉美方向侦察', e:'卫星/信号情报', n:'拉美局势监控' },
    { c:'信息支援', r:68, s:'active', d:'远程通信', e:'卫星通信/远程通信', n:'远程通信保障' },
    { c:'海军', r:65, s:'ready', d:'远程投送', e:'远洋训练编队', n:'远程力量投送准备' },
    { c:'武警', r:70, s:'ready', d:'使馆安保', e:'特勤/反恐', n:'外交机构安保' },
  ],
  biosecurity: [
    { c:'信息支援', r:80, s:'active', d:'生物监测网络', e:'生物传感器/数据平台', n:'生物威胁预警' },
    { c:'网络空间', r:75, s:'active', d:'疫情数据安全', e:'数据安全/信息防护', n:'疫情信息系统防护' },
    { c:'武警', r:85, s:'deployed', d:'疫区管控', e:'防化/防疫/封锁', n:'疫情封控与物资调配' },
    { c:'陆军', r:72, s:'ready', d:'生化防御', e:'防化团/医疗队', n:'生化应急处置' },
    { c:'联勤保障', r:80, s:'ready', d:'应急物资调配', e:'医疗物资/防疫物资', n:'应急物资保障' },
    { c:'民兵预备役', r:75, s:'ready', d:'防疫民兵', e:'防疫/消杀/社区管控', n:'基层防疫动员' },
  ],
  nuclear_prolif: [
    { c:'火箭军', r:92, s:'high_alert', d:'战略威慑', e:'东风-41/巨浪-3', n:'核反击力量待命' },
    { c:'军事航天', r:88, s:'active', d:'核监控侦察', e:'核爆探测/卫星监测', n:'核试验监测网' },
    { c:'信息支援', r:82, s:'active', d:'核辐射监测', e:'辐射探测/信号情报', n:'核活动电磁监控' },
    { c:'陆军', r:75, s:'ready', d:'边境防护', e:'辐射探测/防化', n:'核污染防御' },
    { c:'联勤保障', r:72, s:'ready', d:'核应急保障', e:'防化装备/医疗救援', n:'核应急后勤' },
  ],
  deep_sea: [
    { c:'海军', r:82, s:'deployed', d:'深海区域', e:'核潜艇/深海工作站', n:'深海力量部署' },
    { c:'军事航天', r:80, s:'active', d:'海底监视', e:'海洋监视卫星/遥感', n:'水下态势感知' },
    { c:'信息支援', r:75, s:'active', d:'水下通信', e:'水声通信/声呐阵列', n:'水下信息保障' },
    { c:'空军', r:70, s:'ready', d:'反潜巡逻', e:'反潜机/海上巡逻机', n:'反潜搜索' },
    { c:'联勤保障', r:72, s:'ready', d:'深海保障', e:'深海补给/救援', n:'深海后勤保障' },
  ],
  climate_security: [
    { c:'军事航天', r:75, s:'active', d:'气候监测', e:'气象卫星/环境监测', n:'气候变化影响评估' },
    { c:'信息支援', r:70, s:'active', d:'灾害预警通信', e:'应急通信/预警系统', n:'灾害预警通信' },
    { c:'武警', r:82, s:'deployed', d:'灾害救援', e:'抢险救援/工程兵', n:'气候灾害应急' },
    { c:'陆军', r:70, s:'ready', d:'工程保障', e:'工兵/舟桥/抢险', n:'基础设施修复' },
    { c:'联勤保障', r:78, s:'ready', d:'救灾物资调配', e:'应急物资/运输投送', n:'救灾物资保障' },
    { c:'民兵预备役', r:75, s:'ready', d:'抢险民兵', e:'工程/通信/运输民兵', n:'基层抢险动员' },
  ],
  food_security: [
    { c:'军事航天', r:75, s:'active', d:'农业监测', e:'遥感卫星/农业大数据', n:'粮食生产监控' },
    { c:'信息支援', r:68, s:'active', d:'粮食信息系统', e:'数据安全/信息保障', n:'粮食安全信息保障' },
    { c:'武警', r:78, s:'ready', d:'粮食安保', e:'储备库安保/运输护卫', n:'粮食储备安全' },
    { c:'海军', r:72, s:'ready', d:'粮食运输线', e:'护卫舰/巡逻舰', n:'海上粮食通道保护' },
    { c:'联勤保障', r:80, s:'ready', d:'粮食储备调配', e:'仓储物流/应急调配', n:'粮食战略储备管理' },
    { c:'民兵预备役', r:72, s:'ready', d:'农业民兵', e:'生产/运输民兵', n:'农业动员' },
  ],
  supply_chain: [
    { c:'网络空间', r:82, s:'active', d:'供应链监控', e:'物流大数据/区块链溯源', n:'供应链安全监测' },
    { c:'信息支援', r:75, s:'active', d:'物流信息保障', e:'通信/数据链路', n:'物流信息保障' },
    { c:'海军', r:78, s:'deployed', d:'关键海上通道', e:'护航编队/巡逻舰', n:'马六甲/印度洋护航' },
    { c:'联勤保障', r:85, s:'active', d:'战略物流投送', e:'战略投送/仓储/联运', n:'多式联运保障' },
    { c:'武警', r:75, s:'ready', d:'物流安保', e:'港口安保/铁路护卫', n:'关键物流节点安保' },
  ],
  cognitive_war: [
    { c:'信息支援', r:90, s:'high_alert', d:'认知域对抗', e:'舆论监测/反制/影响力作战', n:'认知域全面防御' },
    { c:'网络空间', r:85, s:'high_alert', d:'网络舆论管控', e:'舆情监控/反谣言', n:'网络空间信息净化' },
    { c:'军事航天', r:72, s:'active', d:'信息传播保障', e:'通信卫星/广播卫星', n:'天基信息传播' },
    { c:'武警', r:82, s:'active', d:'网络舆情', e:'网安巡逻/反谣言', n:'网络空间净化' },
    { c:'空军', r:70, s:'ready', d:'信息传播', e:'广播/通信中继', n:'信息传播保障' },
  ],
  nato_expansion: [
    { c:'火箭军', r:90, s:'high_alert', d:'欧亚方向', e:'东风-26/东风-41', n:'对欧战略威慑' },
    { c:'陆军', r:78, s:'ready', d:'西部战区', e:'装甲/机械化/山地', n:'西部边境防御' },
    { c:'军事航天', r:85, s:'active', d:'欧洲方向侦察', e:'卫星/电子侦察', n:'北约动向监控' },
    { c:'信息支援', r:80, s:'active', d:'电磁监视', e:'信号情报/频谱监视', n:'北约电磁监控' },
    { c:'空军', r:80, s:'ready', d:'西部战区空军', e:'歼-20/歼-16', n:'西部防空巡逻' },
    { c:'联勤保障', r:75, s:'ready', d:'西部方向保障', e:'战略储备/应急投送', n:'西部后勤保障' },
  ],
  east_china_sea: [
    { c:'空军', r:88, s:'high_alert', d:'东部战区空军', e:'歼-20/歼-16/空警-500', n:'东海防空识别区战斗巡逻' },
    { c:'海军', r:82, s:'deployed', d:'东海舰队', e:'驱逐舰/护卫舰/潜艇', n:'东海海域部署' },
    { c:'军事航天', r:82, s:'active', d:'东海监控', e:'预警机/无人机/海洋卫星', n:'空海联合监视' },
    { c:'信息支援', r:78, s:'active', d:'电子战', e:'电子侦察/干扰/频谱管控', n:'电磁频谱对抗' },
    { c:'海警局', r:88, s:'deployed', d:'东海海域', e:'海警船/执法船', n:'海域执法巡航' },
  ],
  /* === 新增场景力量 (31-38) === */
  strait_of_malacca: [
    { c:'海军', r:85, s:'deployed', d:'印度洋护航编队', e:'驱逐舰/护卫舰/补给舰', n:'马六甲西口护航' },
    { c:'空军', r:78, s:'ready', d:'南海方向', e:'运-20/轰-6K/空警-500', n:'远程投送待命' },
    { c:'军事航天', r:85, s:'active', d:'海峡监控', e:'卫星/电子侦察', n:'海峡态势监控' },
    { c:'信息支援', r:75, s:'active', d:'航道通信保障', e:'通信中继/导航保障', n:'航道通信导航' },
    { c:'联勤保障', r:80, s:'ready', d:'海外保障点', e:'补给/燃料/维修', n:'海外保障点运作' },
    { c:'陆军', r:70, s:'ready', d:'南部战区', e:'特种作战/工兵', n:'海外保障点待命' },
  ],
  quantum_tech: [
    { c:'网络空间', r:90, s:'active', d:'量子科学中心', e:'量子计算原型机/量子网络', n:'量子通信网络运维' },
    { c:'信息支援', r:85, s:'active', d:'量子加密通信', e:'量子密钥分发/安全通信', n:'量子密钥分发网络' },
    { c:'军事航天', r:80, s:'active', d:'量子卫星', e:'墨子号量子卫星', n:'星地量子通信' },
    { c:'联勤保障', r:72, s:'ready', d:'科研设施保障', e:'电力/温控/安防', n:'重点科研设施保障' },
    { c:'陆军', r:60, s:'ready', d:'科研基地警卫', e:'警卫/防空', n:'重点科研设施防护' },
  ],
  water_security: [
    { c:'陆军', r:75, s:'ready', d:'西部/南部战区', e:'工兵/水文监测', n:'跨境水文监测站' },
    { c:'军事航天', r:78, s:'active', d:'上游监测', e:'遥感卫星/水文模型', n:'上游水利设施监控' },
    { c:'信息支援', r:70, s:'active', d:'水文信息系统', e:'数据采集/传输/分析', n:'水文信息安全' },
    { c:'武警', r:80, s:'deployed', d:'边境河流', e:'巡逻艇/监测设备', n:'边境河流巡逻' },
    { c:'民兵预备役', r:72, s:'ready', d:'水利民兵', e:'工程/监测民兵', n:'水利设施巡护' },
  ],
  polar_silk_road: [
    { c:'海军', r:72, s:'deployed', d:'北极航道', e:'破冰船/科考船', n:'雪龙号北极航道护航' },
    { c:'军事航天', r:82, s:'active', d:'极地监控', e:'极轨卫星/冰情监测', n:'北极冰情遥感监测' },
    { c:'信息支援', r:70, s:'active', d:'极地通信', e:'极地通信站/卫星链路', n:'北极通信保障' },
    { c:'联勤保障', r:75, s:'ready', d:'极地保障', e:'极地补给/燃料/救援', n:'北极航道后勤保障' },
    { c:'陆军', r:65, s:'ready', d:'北极科考站', e:'科考装备/极地通信', n:'黄河站科考保障' },
  ],
  maritime_militia: [
    { c:'海警局', r:90, s:'deployed', d:'南海海域', e:'海警船/执法快艇', n:'争议海域常态化巡航' },
    { c:'海军', r:75, s:'ready', d:'南海舰队', e:'护卫舰/巡逻舰', n:'海警背后力量待命' },
    { c:'军事航天', r:80, s:'active', d:'南海监控', e:'卫星/电子侦察', n:'海域态势全维监控' },
    { c:'信息支援', r:72, s:'active', d:'海上通信', e:'海上通信/导航保障', n:'海上通信保障' },
    { c:'民兵预备役', r:85, s:'deployed', d:'南海海上民兵', e:'渔船/海上民兵编队', n:'海上民兵力量配合' },
    { c:'空军', r:72, s:'ready', d:'南部战区空军', e:'侦察机/巡逻机', n:'海上空中巡逻' },
  ],
  space_debris: [
    { c:'军事航天', r:92, s:'high_alert', d:'航天测控中心', e:'测控网/空间碎片追踪', n:'在轨卫星规避机动' },
    { c:'网络空间', r:82, s:'active', d:'空间链路安全', e:'卫星链路加密/防护', n:'空间网络防护' },
    { c:'信息支援', r:85, s:'active', d:'空间监视', e:'相控阵雷达/光电望远镜', n:'碎片编目追踪' },
    { c:'火箭军', r:80, s:'ready', d:'全域', e:'反导/反卫星待命', n:'空间防御待命' },
  ],
  bio_data: [
    { c:'网络空间', r:88, s:'active', d:'网络安全中心', e:'数据安全审计/入侵检测', n:'基因数据库防护' },
    { c:'信息支援', r:82, s:'active', d:'情报分析', e:'溯源分析/数据追踪', n:'境外窃密活动追踪' },
    { c:'军事航天', r:75, s:'active', d:'数据传输保障', e:'加密卫星通信', n:'基因数据安全传输' },
    { c:'武警', r:78, s:'deployed', d:'生物样本库', e:'安保/出入管控', n:'重点生物设施安保' },
  ],
  energy_transition: [
    { c:'陆军', r:72, s:'ready', d:'能源基础设施', e:'防空/警卫/工程', n:'关键能源设施防护' },
    { c:'网络空间', r:82, s:'active', d:'电网监控', e:'网络安全/智能电网', n:'电力系统网络防护' },
    { c:'信息支援', r:75, s:'active', d:'能源信息系统', e:'数据安全/远程监控', n:'能源信息安全' },
    { c:'联勤保障', r:80, s:'ready', d:'能源储备调配', e:'能源储备/应急调配', n:'能源战略储备' },
    { c:'武警', r:82, s:'deployed', d:'核电站/水坝', e:'安保/应急', n:'重点能源目标安保' },
    { c:'海军', r:70, s:'ready', d:'能源运输线', e:'护卫舰/巡逻机', n:'海上能源运输护航' },
  ],
};

/* ===== 场景化情报包 =====
 * 每个场景定义5-7条场景相关情报
 * src=来源, type=域, rel=可靠度, title=标题, summary=摘要, mod=修正{d:域,b:加成}
 */
const SCENARIO_INTEL = {
  taiwan_strait: [
    { src:'图像情报', type:'military', rel:'A', title:'台军东部港口集结', summary:'卫星确认苏澳港6艘驱护舰和2艘潜艇集结，疑似战备升级', mod:{d:'military',b:8} },
    { src:'信号情报', type:'military', rel:'A', title:'美第七舰队航母动向', summary:'里根号航母编队距台海900海里，航向西南，预计72小时抵达', mod:{d:'military',b:7} },
    { src:'人力情报', type:'diplomatic', rel:'B', title:'台当局高层动向', summary:'据可靠渠道，台地区领导人与某大国国安顾问秘密通话，讨论"安全承诺"', mod:{d:'diplomatic',b:5} },
    { src:'开源情报', type:'information', rel:'B', title:'台媒舆论动员', summary:'检测到台媒集中报道"国际支持"，认知域作战迹象明显', mod:{d:'information',b:4} },
    { src:'信号情报', type:'cyber', rel:'A', title:'台军指挥系统漏洞', summary:'网络侦察发现台军衡山指挥系统存在未修补漏洞，可实施网络压制', mod:{d:'cyber',b:6} },
    { src:'图像情报', type:'military', rel:'A', title:'台东导弹阵地部署', summary:'发现爱国者-3和鱼叉反舰导弹阵地新建工事，施工进度60%', mod:{d:'military',b:5} },
  ],
  south_china_sea: [
    { src:'图像情报', type:'military', rel:'A', title:'某声索国岛礁扩建', summary:'卫星发现某声索国在争议岛礁新建直升机平台和雷达站', mod:{d:'military',b:7} },
    { src:'信号情报', type:'military', rel:'A', title:'域外大国双航母编队', summary:'截获通信显示双航母编队在南海西南海域演练，距我岛礁400海里', mod:{d:'military',b:8} },
    { src:'开源情报', type:'diplomatic', rel:'B', title:'东盟分歧信号', summary:'部分东盟国家私下表达对域外大国介入的不满，外交窗口出现', mod:{d:'diplomatic',b:5} },
    { src:'人力情报', type:'economic', rel:'C', title:'油气钻探计划', summary:'据消息人士，某声索国将于两周内启动新一轮油气钻探', mod:{d:'economic',b:3} },
    { src:'信号情报', type:'cyber', rel:'B', title:'海上通信干扰', summary:'检测到域外大国电子战飞机对南海通信频段实施间歇性干扰', mod:{d:'cyber',b:4} },
  ],
  border_india: [
    { src:'图像情报', type:'military', rel:'A', title:'印方边境基建加速', summary:'卫星确认印方在争议地区修建3条公路和2处前沿阵地，施工速度显著加快', mod:{d:'military',b:7} },
    { src:'信号情报', type:'military', rel:'B', title:'印军增兵信号', summary:'截获印军后勤调度通信，分析指向向边境增派1个山地师', mod:{d:'military',b:6} },
    { src:'人力情报', type:'diplomatic', rel:'B', title:'印方外交试探', summary:'据渠道，印方通过第三方传话希望举行军长级会谈降温', mod:{d:'diplomatic',b:5} },
    { src:'开源情报', type:'information', rel:'C', title:'印度媒体民族主义煽动', summary:'印度主流媒体集中渲染边境威胁，为军事冒险制造舆论', mod:{d:'information',b:3} },
  ],
  eco_sanctions: [
    { src:'人力情报', type:'diplomatic', rel:'A', title:'某大国半导体制裁清单', summary:'据可靠渠道，某大国将于本周五宣布新一轮半导体设备出口管制', mod:{d:'diplomatic',b:6} },
    { src:'开源情报', type:'economic', rel:'A', title:'盟友协调制裁信号', summary:'某大国正与盟友协调统一出口管制标准，日韩可能被迫跟进', mod:{d:'economic',b:8} },
    { src:'信号情报', type:'cyber', rel:'B', title:'金融系统网络攻击预兆', summary:'检测到针对中国银行系统的高级持续性威胁活动激增，疑似制裁配套网络施压', mod:{d:'cyber',b:5} },
    { src:'人力情报', type:'economic', rel:'B', title:'稀土替代供应谈判', summary:'某国正与澳大利亚加速谈判稀土替代供应协议，预计3个月内达成', mod:{d:'economic',b:4} },
    { src:'开源情报', type:'economic', rel:'B', title:'人民币跨境支付增长', summary:'人民币跨境支付系统交易量同比增长47%，去美元化趋势加速', mod:{d:'economic',b:5} },
  ],
  cyber_attack: [
    { src:'信号情报', type:'cyber', rel:'A', title:'高级持续性威胁攻击溯源', summary:'对持续网络攻击溯源分析，锁定某大国情报机构支持的高级持续性威胁-41组织', mod:{d:'cyber',b:9} },
    { src:'图像情报', type:'cyber', rel:'B', title:'攻击C2服务器定位', summary:'追踪到攻击控制服务器位于某大国空军基地附近', mod:{d:'cyber',b:7} },
    { src:'开源情报', type:'information', rel:'B', title:'暗网数据交易', summary:'暗网出现中国政府机构数据出售广告，涉密等级尚在评估', mod:{d:'information',b:5} },
    { src:'信号情报', type:'cyber', rel:'A', title:'下一波攻击窗口预测', summary:'攻击通信加密分析，下一波大规模攻击窗口预计48小时内', mod:{d:'cyber',b:6} },
    { src:'人力情报', type:'diplomatic', rel:'C', title:'某大国网络战司令部动向', summary:'据渠道，某大国网络战司令部进入高度戒备，可能发起更大规模行动', mod:{d:'diplomatic',b:3} },
  ],
  hybrid_warfare: [
    { src:'信号情报', type:'cyber', rel:'A', title:'多源网络攻击协调', summary:'截获多源加密通信，网络攻击来自至少3个不同高级持续性威胁组织协同行动', mod:{d:'cyber',b:8} },
    { src:'开源情报', type:'information', rel:'A', title:'舆论操纵网络曝光', summary:'识别7500个协调账号集中发布涉华负面内容，溯源指向某大国智库', mod:{d:'information',b:7} },
    { src:'人力情报', type:'economic', rel:'B', title:'经济胁迫幕后策划', summary:'据渠道，某大国正在协调盟友对华实施"去风险"供应链转移', mod:{d:'economic',b:5} },
    { src:'信号情报', type:'military', rel:'B', title:'代理人势力活动', summary:'边境地区检测到不明武装通信，疑似代理人势力受外部指使骚扰', mod:{d:'military',b:6} },
    { src:'开源情报', type:'diplomatic', rel:'C', title:'外交孤立企图', summary:'某大国在多边场合推动涉华决议，试图制造外交孤立', mod:{d:'diplomatic',b:3} },
  ],
  middle_east: [
    { src:'开源情报', type:'economic', rel:'A', title:'国际油价暴涨', summary:'布伦特原油突破120美元/桶，中国进口成本激增40%', mod:{d:'economic',b:7} },
    { src:'人力情报', type:'diplomatic', rel:'A', title:'侨民安全告急', summary:'据使馆报告，3,500名中国公民被困冲突区，急需撤离', mod:{d:'diplomatic',b:8} },
    { src:'图像情报', type:'military', rel:'B', title:'冲突区域扩散', summary:'卫星显示冲突已波及3个国家，红海航道安全受威胁', mod:{d:'military',b:5} },
    { src:'信号情报', type:'economic', rel:'B', title:'能源替代方案', summary:'俄罗斯和伊朗表示可增加对华石油供应，但需政治协调', mod:{d:'economic',b:4} },
    { src:'开源情报', type:'diplomatic', rel:'B', title:'阿拉伯国家态度', summary:'多数阿拉伯国家欢迎中国斡旋，但顾虑某大国反应', mod:{d:'diplomatic',b:5} },
  ],
  hormuz: [
    { src:'图像情报', type:'military', rel:'A', title:'海峡水雷威胁', summary:'卫星发现霍尔木兹海峡出现疑似布雷活动，航道安全受威胁', mod:{d:'military',b:8} },
    { src:'信号情报', type:'military', rel:'A', title:'伊朗海军通信异常', summary:'截获伊朗海军加密通信，分析指向快速艇群狼战术准备', mod:{d:'military',b:7} },
    { src:'开源情报', type:'economic', rel:'A', title:'油轮保险费飙升', summary:'霍尔木兹海峡油轮战争险费率上涨300%，运输成本激增', mod:{d:'economic',b:6} },
    { src:'人力情报', type:'diplomatic', rel:'B', title:'伊朗斡旋意愿', summary:'据渠道，伊朗表示愿意有条件保障中国油轮通行安全', mod:{d:'diplomatic',b:5} },
    { src:'信号情报', type:'cyber', rel:'B', title:'航运系统遭攻击', summary:'多艘油轮AIS系统遭GPS欺骗，航线被篡改', mod:{d:'cyber',b:4} },
  ],
  arctic: [
    { src:'图像情报', type:'military', rel:'B', title:'某大国北极军事部署', summary:'卫星发现某大国在北极圈内部署新型雷达和防空系统', mod:{d:'military',b:5} },
    { src:'开源情报', type:'economic', rel:'A', title:'北极航道通航数据', summary:'2026年北极东北航道通航窗口预计延长至5个月', mod:{d:'economic',b:6} },
    { src:'信号情报', type:'space', rel:'B', title:'极地卫星增强', summary:'某大国增补2颗极地轨道侦察卫星，覆盖北极全域', mod:{d:'space',b:4} },
    { src:'人力情报', type:'diplomatic', rel:'C', title:'北极国家联盟动向', summary:'北极八国正在协调排他性资源开发框架', mod:{d:'diplomatic',b:3} },
  ],
  space_domain: [
    { src:'信号情报', type:'space', rel:'A', title:'异常卫星变轨', summary:'探测到3颗某大国侦察卫星执行变轨机动，新轨道覆盖我方中部战区', mod:{d:'space',b:8} },
    { src:'图像情报', type:'space', rel:'B', title:'反卫星武器试验迹象', summary:'某大国在本土试验场检测到动能拦截器发射信号', mod:{d:'military',b:6} },
    { src:'开源情报', type:'cyber', rel:'B', title:'卫星通信干扰', summary:'我方多颗卫星上行链路受到间歇性干扰，溯源进行中', mod:{d:'cyber',b:5} },
    { src:'信号情报', type:'space', rel:'A', title:'太空碎片武器化', summary:'分析显示某大国可能利用在轨碎片制造碰撞威胁', mod:{d:'space',b:7} },
    { src:'人力情报', type:'diplomatic', rel:'C', title:'太空军控谈判阻力', summary:'某大国拒绝太空非武器化谈判，坚持行动自由', mod:{d:'diplomatic',b:3} },
  ],
  ai_race: [
    { src:'开源情报', type:'cyber', rel:'A', title:'某大国AI军事化进展', summary:'某大国宣布AI指挥决策系统进入实战测试阶段', mod:{d:'cyber',b:7} },
    { src:'人力情报', type:'cyber', rel:'B', title:'芯片管制升级计划', summary:'某大国拟将AI算力芯片管制扩展至消费级GPU', mod:{d:'cyber',b:6} },
    { src:'开源情报', type:'economic', rel:'A', title:'AI人才争夺', summary:'全球AI顶级人才竞争白热化，中国吸引力度待加强', mod:{d:'economic',b:4} },
    { src:'信号情报', type:'cyber', rel:'B', title:'AI武器化情报', summary:'某大国在无人集群AI协同领域取得突破，实战部署在即', mod:{d:'cyber',b:5} },
  ],
  finance_war: [
    { src:'开源情报', type:'economic', rel:'A', title:'环球银行金融电信系统排除威胁', summary:'某大国议员推动将中国部分银行排除出环球银行金融电信系统', mod:{d:'economic',b:9} },
    { src:'信号情报', type:'cyber', rel:'A', title:'金融网络攻击', summary:'检测到针对人民币跨境支付系统和银联系统的协同高级持续性威胁攻击', mod:{d:'cyber',b:7} },
    { src:'人力情报', type:'economic', rel:'B', title:'资本外逃信号', summary:'据渠道，部分外资正在加速撤离中国市场', mod:{d:'economic',b:5} },
    { src:'开源情报', type:'economic', rel:'B', title:'人民币汇率压力', summary:'离岸人民币跌破7.3，做空力量集中', mod:{d:'economic',b:6} },
    { src:'人力情报', type:'diplomatic', rel:'C', title:'盟友金融协调', summary:'某大国正协调G7对华实施金融制裁框架', mod:{d:'diplomatic',b:3} },
  ],
  rare_earth: [
    { src:'图像情报', type:'military', rel:'B', title:'战略矿场周边活动', summary:'卫星发现某大国在非洲稀土矿区附近增加军事存在', mod:{d:'military',b:5} },
    { src:'开源情报', type:'economic', rel:'A', title:'稀土价格操纵', summary:'国际稀土价格异常波动，疑似某大国释放储备打压', mod:{d:'economic',b:7} },
    { src:'人力情报', type:'economic', rel:'B', title:'替代供应谈判', summary:'某大国正与多国谈判建立排除中国的关键矿产供应链', mod:{d:'economic',b:6} },
    { src:'信号情报', type:'cyber', rel:'B', title:'矿业数据窃取', summary:'检测到针对中国矿业公司数据库的定向入侵', mod:{d:'cyber',b:4} },
  ],
  digital_sovereignty: [
    { src:'开源情报', type:'cyber', rel:'A', title:'数据跨境流动管制', summary:'某大国推动"数据自由流动"规则，试图瓦解数据主权', mod:{d:'cyber',b:7} },
    { src:'人力情报', type:'diplomatic', rel:'B', title:'数字规则联盟', summary:'某大国正组建"数字民主联盟"排挤中国数字标准', mod:{d:'diplomatic',b:5} },
    { src:'信号情报', type:'cyber', rel:'A', title:'云平台渗透', summary:'检测到针对国内主流云平台的持久化渗透活动', mod:{d:'cyber',b:6} },
    { src:'开源情报', type:'economic', rel:'B', title:'数字货币竞争', summary:'某大国CBDC项目加速推进，试图主导数字货币标准', mod:{d:'economic',b:4} },
  ],
  diaoyu: [
    { src:'图像情报', type:'military', rel:'A', title:'日海保船集结', summary:'卫星确认日本海上保安厅12艘巡视船在钓鱼岛附近集结', mod:{d:'military',b:7} },
    { src:'信号情报', type:'military', rel:'A', title:'自卫队通信异常', summary:'截获日本自卫队加密通信，分析指向P-1巡逻机紧急出动', mod:{d:'military',b:6} },
    { src:'人力情报', type:'diplomatic', rel:'B', title:'日方外交试探', summary:'据渠道，日方通过美方向中方传话希望避免擦枪走火', mod:{d:'diplomatic',b:4} },
    { src:'开源情报', type:'information', rel:'B', title:'日媒舆论动员', summary:'日本主流媒体集中报道"中国威胁"，为强硬行动制造舆论', mod:{d:'information',b:5} },
    { src:'信号情报', type:'cyber', rel:'C', title:'日方电子侦察', summary:'检测到日本电子侦察机在东海频繁活动，信号情报收集意图明显', mod:{d:'cyber',b:3} },
  ],
  korean_peninsula: [
    { src:'信号情报', type:'military', rel:'A', title:'核试迹象', summary:'丰溪里核试验场检测到异常震动信号，分析指向即将进行核试', mod:{d:'military',b:9} },
    { src:'图像情报', type:'military', rel:'A', title:'导弹发射准备', summary:'卫星发现机动发射车从山洞库房出动，导弹已加注燃料', mod:{d:'military',b:8} },
    { src:'开源情报', type:'diplomatic', rel:'B', title:'某大国军事调动', summary:'某大国向朝鲜半岛增派航母和战略轰炸机', mod:{d:'diplomatic',b:5} },
    { src:'人力情报', type:'diplomatic', rel:'B', title:'朝方谈判意愿', summary:'据渠道，朝方表示愿意在核试暂停前提下恢复对话', mod:{d:'diplomatic',b:6} },
    { src:'信号情报', type:'cyber', rel:'C', title:'韩方网络活动', summary:'检测到韩方网络部队针对朝鲜指挥系统的侦察活动', mod:{d:'cyber',b:3} },
  ],
  myanmar: [
    { src:'图像情报', type:'military', rel:'B', title:'缅甸内战扩散', summary:'卫星确认缅甸政府军与民地武交战区已逼近中缅边境50公里', mod:{d:'military',b:6} },
    { src:'人力情报', type:'diplomatic', rel:'B', title:'边境难民潮预警', summary:'据边防报告，缅方约2000平民聚集在中缅边境，可能形成难民潮', mod:{d:'diplomatic',b:5} },
    { src:'信号情报', type:'cyber', rel:'C', title:'电诈集团转移', summary:'检测到缅北电诈集团向边境方向转移，网络诈骗活动激增', mod:{d:'cyber',b:4} },
    { src:'开源情报', type:'information', rel:'C', title:'缅甸舆论操纵', summary:'社交媒体出现针对中国在缅甸利益的负面叙事', mod:{d:'information',b:3} },
    { src:'人力情报', type:'military', rel:'B', title:'民地武联络意愿', summary:'据渠道，部分民地武表示愿意配合中方维护边境安全', mod:{d:'military',b:4} },
  ],
  afghanistan: [
    { src:'信号情报', type:'military', rel:'B', title:'恐怖组织活动', summary:'截获通信显示伊斯兰国呼罗珊分支在阿富汗北部训练营地活动频繁', mod:{d:'military',b:6} },
    { src:'图像情报', type:'military', rel:'B', title:'瓦罕走廊渗透路线', summary:'卫星发现武装人员沿瓦罕走廊方向移动，疑似渗透企图', mod:{d:'military',b:5} },
    { src:'人力情报', type:'diplomatic', rel:'C', title:'塔利班合作意愿', summary:'据渠道，塔利班表示愿意配合中方打击恐怖势力，但能力有限', mod:{d:'diplomatic',b:4} },
    { src:'开源情报', type:'information', rel:'C', title:'涉恐舆论扩散', summary:'极端组织宣传材料在中亚社交媒体传播', mod:{d:'information',b:3} },
  ],
  horn_africa: [
    { src:'图像情报', type:'military', rel:'B', title:'红海航运安全威胁', summary:'卫星发现也门胡塞武装在红海部署新型反舰导弹', mod:{d:'military',b:6} },
    { src:'开源情报', type:'economic', rel:'A', title:'吉布提基地运作', summary:'中国吉布提保障基地运行正常，可支持护航和撤侨', mod:{d:'economic',b:5} },
    { src:'人力情报', type:'diplomatic', rel:'B', title:'埃塞局势恶化', summary:'据使馆报告，埃塞内部冲突升级，中资项目安全受威胁', mod:{d:'diplomatic',b:5} },
    { src:'信号情报', type:'cyber', rel:'C', title:'非洲网络攻击', summary:'检测到针对中国驻非机构的网络渗透活动', mod:{d:'cyber',b:3} },
    { src:'开源情报', type:'economic', rel:'B', title:'海盗活动 resurgence', summary:'亚丁湾海盗活动出现反弹迹象', mod:{d:'economic',b:4} },
  ],
  venezuela: [
    { src:'开源情报', type:'diplomatic', rel:'A', title:'某大国制裁升级', summary:'某大国宣布对委内瑞拉实施全面石油禁运和金融封锁', mod:{d:'diplomatic',b:7} },
    { src:'人力情报', type:'economic', rel:'B', title:'中委石油合作', summary:'据渠道，委方请求中国增加石油进口并提供炼油设备', mod:{d:'economic',b:5} },
    { src:'信号情报', type:'cyber', rel:'C', title:'某大国网络渗透', summary:'检测到针对委内瑞拉政府系统的网络攻击，疑似某大国情报机构', mod:{d:'cyber',b:4} },
    { src:'开源情报', type:'information', rel:'B', title:'拉美舆论战', summary:'某大国在拉美媒体加大对中国"新殖民主义"的抹黑', mod:{d:'information',b:3} },
  ],
  biosecurity: [
    { src:'开源情报', type:'cyber', rel:'A', title:'不明病原体报告', summary:'WHO通报某地区出现不明病原体聚集性感染，致死率较高', mod:{d:'cyber',b:8} },
    { src:'人力情报', type:'military', rel:'B', title:'某大国生物实验室', summary:'据渠道，某大国在海外生物实验室活动异常，疑似泄露', mod:{d:'military',b:6} },
    { src:'信号情报', type:'cyber', rel:'B', title:'基因数据窃取', summary:'检测到针对中国基因数据库的定向网络入侵', mod:{d:'cyber',b:5} },
    { src:'开源情报', type:'economic', rel:'B', title:'疫苗产能', summary:'中国mRNA疫苗产能充足，可快速应急生产', mod:{d:'economic',b:4} },
    { src:'图像情报', type:'military', rel:'C', title:'边境检疫需求', summary:'卫星显示多个边境口岸人员积压，检疫压力增大', mod:{d:'military',b:3} },
  ],
  nuclear_prolif: [
    { src:'信号情报', type:'military', rel:'A', title:'核材料走私', summary:'截获通信显示有组织试图经第三国转运核材料', mod:{d:'military',b:8} },
    { src:'图像情报', type:'military', rel:'B', title:'秘密核设施', summary:'卫星发现某国在地下设施中疑似建设浓缩铀生产线', mod:{d:'military',b:7} },
    { src:'人力情报', type:'diplomatic', rel:'B', title:'IAEA核查受阻', summary:'据渠道，某国拒绝IAEA突击核查，引发国际社会担忧', mod:{d:'diplomatic',b:5} },
    { src:'开源情报', type:'diplomatic', rel:'B', title:'核门槛国家增加', summary:'多个地区大国表达核武器发展意愿', mod:{d:'diplomatic',b:4} },
    { src:'信号情报', type:'cyber', rel:'C', title:'核设施网络攻击', summary:'检测到针对某国核电站控制系统的Stuxnet变种', mod:{d:'cyber',b:3} },
  ],
  deep_sea: [
    { src:'信号情报', type:'military', rel:'A', title:'海底光缆窃听', summary:'检测到某大国潜艇在太平洋海底光缆节点附近活动', mod:{d:'military',b:7} },
    { src:'图像情报', type:'military', rel:'B', title:'深海采矿竞争', summary:'卫星发现某大国深海采矿船在国际海域试采稀土', mod:{d:'economic',b:5} },
    { src:'开源情报', type:'cyber', rel:'B', title:'水下传感器网', summary:'某大国在西太平洋部署水下监听阵列，监控潜艇活动', mod:{d:'cyber',b:6} },
    { src:'人力情报', type:'diplomatic', rel:'C', title:'海底资源争夺', summary:'据渠道，多国正在加速申请国际海底矿区', mod:{d:'diplomatic',b:3} },
  ],
  climate_security: [
    { src:'开源情报', type:'economic', rel:'A', title:'极端气候频发', summary:'2026年上半年全球极端气候事件同比增加45%', mod:{d:'economic',b:7} },
    { src:'图像情报', type:'military', rel:'B', title:'海平面上升威胁', summary:'卫星分析显示多个沿海军事设施面临淹没风险', mod:{d:'military',b:5} },
    { src:'人力情报', type:'diplomatic', rel:'B', title:'气候谈判僵局', summary:'据渠道，某大国试图将气候议题与贸易挂钩', mod:{d:'diplomatic',b:4} },
    { src:'开源情报', type:'economic', rel:'A', title:'能源转型加速', summary:'中国可再生能源装机量超过火电，转型进入关键期', mod:{d:'economic',b:6} },
    { src:'信号情报', type:'cyber', rel:'C', title:'碳交易数据攻击', summary:'检测到针对全国碳交易系统的网络渗透', mod:{d:'cyber',b:3} },
  ],
  food_security: [
    { src:'开源情报', type:'economic', rel:'A', title:'全球粮价飙升', summary:'FAO粮食价格指数创新高，小麦和玉米价格暴涨30%', mod:{d:'economic',b:8} },
    { src:'图像情报', type:'economic', rel:'B', title:'主要产粮国减产', summary:'卫星确认某大国主产区遭遇严重旱灾，预计减产20%', mod:{d:'economic',b:6} },
    { src:'人力情报', type:'diplomatic', rel:'B', title:'粮食出口限制', summary:'据渠道，多国酝酿实施粮食出口禁令', mod:{d:'diplomatic',b:5} },
    { src:'信号情报', type:'cyber', rel:'C', title:'农业数据攻击', summary:'检测到针对中国农业大数据平台的网络入侵', mod:{d:'cyber',b:3} },
    { src:'开源情报', type:'economic', rel:'B', title:'种业安全', summary:'某大国加速控制全球种业产业链，威胁粮食安全', mod:{d:'economic',b:4} },
  ],
  supply_chain: [
    { src:'开源情报', type:'economic', rel:'A', title:'马六甲海峡风险', summary:'海峡通行受阻，日均滞留船舶超过200艘', mod:{d:'economic',b:8} },
    { src:'人力情报', type:'economic', rel:'B', title:'友岸外包加速', summary:'据渠道，某大国正强力推动盟友将供应链移出中国', mod:{d:'economic',b:6} },
    { src:'信号情报', type:'cyber', rel:'B', title:'物流系统攻击', summary:'检测到针对中国主要港口管理系统的网络攻击', mod:{d:'cyber',b:5} },
    { src:'开源情报', type:'economic', rel:'A', title:'替代通道进展', summary:'中欧班列运量同比增长35%，缅甸走廊建设加速', mod:{d:'economic',b:4} },
    { src:'图像情报', type:'military', rel:'C', title:'海上咽喉控制', summary:'某大国在关键海峡增加海军存在，暗示封锁能力', mod:{d:'military',b:4} },
  ],
  cognitive_war: [
    { src:'开源情报', type:'information', rel:'A', title:'认知域攻击升级', summary:'检测到针对中国的大规模认知域作战，覆盖社交媒体、学术、媒体多渠道', mod:{d:'information',b:9} },
    { src:'信号情报', type:'cyber', rel:'A', title:'协调账号网络', summary:'识别12,000个协调账号矩阵，使用AI生成内容大规模传播', mod:{d:'cyber',b:7} },
    { src:'人力情报', type:'diplomatic', rel:'B', title:'某大国信息战司令部', summary:'据渠道，某大国信息战司令部预算增加40%，对华认知战为重点', mod:{d:'diplomatic',b:5} },
    { src:'开源情报', type:'information', rel:'B', title:'学术渗透', summary:'发现某大国通过学术资助影响中国高校研究方向和舆论', mod:{d:'information',b:4} },
    { src:'信号情报', type:'cyber', rel:'C', title:'深度伪造', summary:'检测到使用深度伪造技术制造的中国领导人虚假视频', mod:{d:'cyber',b:5} },
  ],
  nato_expansion: [
    { src:'开源情报', type:'diplomatic', rel:'A', title:'北约东扩新成员', summary:'北约正式接纳新成员国，前沿推进至俄罗斯边境', mod:{d:'diplomatic',b:7} },
    { src:'图像情报', type:'military', rel:'B', title:'北约兵力前推', summary:'卫星发现北约在新成员国部署中程导弹和装甲部队', mod:{d:'military',b:6} },
    { src:'信号情报', type:'military', rel:'A', title:'反导系统部署', summary:'截获通信显示北约反导系统已进入战斗值班', mod:{d:'military',b:5} },
    { src:'人力情报', type:'diplomatic', rel:'B', title:'俄方反应', summary:'据渠道，俄罗斯将调整核威慑政策作为回应', mod:{d:'diplomatic',b:4} },
    { src:'开源情报', type:'economic', rel:'C', title:'能源管线博弈', summary:'北约施压盟友切断与俄罗斯的能源合作', mod:{d:'economic',b:3} },
  ],
  east_china_sea: [
    { src:'图像情报', type:'military', rel:'A', title:'日自卫队空军集结', summary:'卫星确认日本那霸基地增派F-35A中队，预警机频次增加', mod:{d:'military',b:7} },
    { src:'信号情报', type:'military', rel:'A', title:'日美联合作战通信', summary:'截获日美联合通信，分析指向东海联合作战预案演练', mod:{d:'military',b:6} },
    { src:'开源情报', type:'information', rel:'B', title:'日方舆论施压', summary:'日本媒体集中炒作"中国东海威胁论"为军事扩张找借口', mod:{d:'information',b:5} },
    { src:'人力情报', type:'diplomatic', rel:'B', title:'日方底线信号', summary:'据渠道，日方表示不愿升级冲突但不会退让', mod:{d:'diplomatic',b:4} },
    { src:'信号情报', type:'cyber', rel:'C', title:'日方电子侦察', summary:'日本EP-3电子侦察机在东海频繁活动', mod:{d:'cyber',b:3} },
  ],
  /* === 新增场景情报 (31-38) === */
  strait_of_malacca: [
    { src:'图像情报', type:'military', rel:'A', title:'某大国航母编队进入安达曼海', summary:'卫星确认某大国航母打击群在安达曼海演练，距马六甲海峡西口400海里', mod:{d:'military',b:8} },
    { src:'信号情报', type:'military', rel:'A', title:'新加坡樟宜基地通信异常', summary:'截获樟宜海军基地加密通信频次激增，分析指向紧急战备状态', mod:{d:'military',b:6} },
    { src:'开源情报', type:'economic', rel:'B', title:'油价因海峡风险上涨', summary:'国际油价因马六甲安全风险单日上涨3.2%，保险费率上调', mod:{d:'economic',b:5} },
    { src:'人力情报', type:'diplomatic', rel:'B', title:'印尼海上联合巡逻提议', summary:'据渠道，某大国提议与印尼、新加坡建立联合巡逻机制', mod:{d:'diplomatic',b:4} },
    { src:'开源情报', type:'information', rel:'C', title:'航线替代方案讨论', summary:'国际航运界热议巽他海峡和龙目海峡作为替代航线', mod:{d:'information',b:3} },
  ],
  quantum_tech: [
    { src:'开源情报', type:'information', rel:'A', title:'某大国量子计算突破宣称', summary:'某大国宣布实现1000量子比特处理器，但中国量子科学家质疑其误差率', mod:{d:'information',b:7} },
    { src:'信号情报', type:'cyber', rel:'A', title:'量子通信网络渗透尝试', summary:'检测到针对京沪量子干线的侧信道攻击尝试，已被量子加密拦截', mod:{d:'cyber',b:8} },
    { src:'人力情报', type:'information', rel:'B', title:'顶尖量子科学家争夺', summary:'据渠道，某大国以优厚条件挖角中国量子计算领域5名核心研究员', mod:{d:'information',b:6} },
    { src:'开源情报', type:'economic', rel:'B', title:'量子技术出口管制清单', summary:'某大国将量子计算和量子通信设备列入出口管制清单', mod:{d:'economic',b:5} },
    { src:'图像情报', type:'space', rel:'C', title:'量子卫星地面站建设', summary:'卫星发现某大国在南太平洋建设量子通信卫星地面站网络', mod:{d:'space',b:4} },
  ],
  water_security: [
    { src:'图像情报', type:'economic', rel:'A', title:'上游水坝加速建设', summary:'卫星确认上游国家在雅鲁藏布江流域新建3座大型水坝，蓄水进度加快', mod:{d:'economic',b:7} },
    { src:'信号情报', type:'diplomatic', rel:'B', title:'上游国家外交照会', summary:'截获上游国家外交电报，讨论利用水资源作为谈判筹码', mod:{d:'diplomatic',b:6} },
    { src:'开源情报', type:'information', rel:'C', title:'下游国家联合声明', summary:'东南亚多国发表联合声明关切上游水利设施对下游影响', mod:{d:'information',b:4} },
    { src:'人力情报', type:'economic', rel:'B', title:'西南地区用水影响', summary:'据地方报告，上游蓄水已导致云南部分河段水位下降12%', mod:{d:'economic',b:5} },
    { src:'图像情报', type:'military', rel:'C', title:'边境水文监测站扩建', summary:'发现上游国家在边境地区增建水文监测设施和军用码头', mod:{d:'military',b:3} },
  ],
  polar_silk_road: [
    { src:'图像情报', type:'space', rel:'A', title:'北方海航道冰情变化', summary:'卫星遥感显示北方海航道东段冰层厚度降至历史最低，通航窗口延长至5个月', mod:{d:'space',b:7} },
    { src:'开源情报', type:'diplomatic', rel:'A', title:'俄罗斯邀请中国共建北极港口', summary:'俄罗斯正式邀请中国参与摩尔曼斯克港扩建和北方海航道联合开发', mod:{d:'diplomatic',b:8} },
    { src:'信号情报', type:'military', rel:'B', title:'某大国北极军事活动', summary:'截获通信显示某大国在阿拉斯加部署新型极地雷达和反导系统', mod:{d:'military',b:6} },
    { src:'开源情报', type:'economic', rel:'B', title:'北极航道商业试航', summary:'中国商船完成北方海航道第三次商业试航，运输时间缩短40%', mod:{d:'economic',b:5} },
    { src:'人力情报', type:'diplomatic', rel:'C', title:'北欧国家态度分化', summary:'据渠道，挪威和冰岛对中国参与北极事务持开放态度，但受联盟压力', mod:{d:'diplomatic',b:4} },
  ],
  maritime_militia: [
    { src:'图像情报', type:'military', rel:'A', title:'某大国海警船集结', summary:'卫星发现某大国海警船在南海争议海域集结，数量从4艘增至12艘', mod:{d:'military',b:8} },
    { src:'信号情报', type:'military', rel:'A', title:'灰色地带行动通信', summary:'截获加密通信，分析指向协调渔船和海警的灰色地带行动指令', mod:{d:'military',b:7} },
    { src:'开源情报', type:'information', rel:'B', title:'国际媒体舆论操作', summary:'检测到协调性叙事，将中国正常执法活动描绘为"侵略行为"', mod:{d:'information',b:6} },
    { src:'人力情报', type:'diplomatic', rel:'B', title:'声索国私下试探', summary:'据渠道，某声索国希望与中方谈判但受某大国压力不敢公开', mod:{d:'diplomatic',b:5} },
    { src:'图像情报', type:'military', rel:'C', title:'某大国海军后方待命', summary:'卫星发现某大国驱逐舰编队在争议海域100海里外待命', mod:{d:'military',b:4} },
  ],
  space_debris: [
    { src:'信号情报', type:'space', rel:'A', title:'某大国反卫星试验信号', summary:'测控网探测到某大国执行秘密反卫星试验，产生逾1500个可追踪碎片', mod:{d:'space',b:9} },
    { src:'图像情报', type:'space', rel:'A', title:'碎片云威胁中国卫星', summary:'轨道分析显示碎片云将在72小时内近距离掠过中国导航卫星星座', mod:{d:'space',b:8} },
    { src:'开源情报', type:'information', rel:'B', title:'商业星座轨道抢占', summary:'某商业航天公司向国际电联提交4万颗卫星频谱申请，挤压中国轨道资源', mod:{d:'information',b:6} },
    { src:'信号情报', type:'military', rel:'B', title:'太空监视系统升级', summary:'截获通信显示某大国部署新型深空雷达，监控范围覆盖地球同步轨道', mod:{d:'military',b:5} },
    { src:'人力情报', type:'diplomatic', rel:'C', title:'太空交通管理博弈', summary:'据渠道，某大国试图主导太空交通管理规则制定，排斥中国参与', mod:{d:'diplomatic',b:4} },
  ],
  bio_data: [
    { src:'信号情报', type:'cyber', rel:'A', title:'基因数据库渗透攻击', summary:'检测到针对国家基因数据库的高级持续性威胁攻击，攻击者使用零日漏洞', mod:{d:'cyber',b:8} },
    { src:'人力情报', type:'information', rel:'A', title:'跨国公司数据收集网络', summary:'据线人，某跨国生物公司在中国50所高校以科研合作名义收集基因样本', mod:{d:'information',b:7} },
    { src:'开源情报', type:'economic', rel:'B', title:'基因测序仪出口管制', summary:'某大国将高通量基因测序仪列入对华出口管制，限制关键试剂供应', mod:{d:'economic',b:6} },
    { src:'信号情报', type:'cyber', rel:'B', title:'境外生物特征数据库', summary:'发现境外服务器存储大量中国人生物特征数据，疑似用于训练识别算法', mod:{d:'cyber',b:7} },
    { src:'人力情报', type:'information', rel:'C', title:'基因编辑技术争夺', summary:'据渠道，某大国加速基因编辑军事化研究，试图建立生物优势', mod:{d:'information',b:4} },
  ],
  energy_transition: [
    { src:'开源情报', type:'economic', rel:'A', title:'碳关税法案即将实施', summary:'某大国碳边境调节机制正式进入实施阶段，中国出口产品面临额外碳成本', mod:{d:'economic',b:8} },
    { src:'图像情报', type:'economic', rel:'B', title:'新能源矿产争夺', summary:'卫星发现某大国在非洲加速布局锂矿和钴矿，与中国形成直接竞争', mod:{d:'economic',b:6} },
    { src:'信号情报', type:'cyber', rel:'A', title:'智能电网渗透活动', summary:'检测到针对国家电网调度系统的网络侦察活动，攻击者试图获取电网拓扑', mod:{d:'cyber',b:7} },
    { src:'人力情报', type:'diplomatic', rel:'B', title:'欧佩克减产施压', summary:'据渠道，欧佩克+减产决定背后有某大国施压，意在推高油价阻碍能源转型', mod:{d:'diplomatic',b:5} },
    { src:'开源情报', type:'information', rel:'C', title:'新能源技术标准博弈', summary:'某大国联合盟友制定新能源技术标准，试图将中国排除在标准制定之外', mod:{d:'information',b:4} },
  ],
};

/* ===== 场景化功能模块配置 =====
 * 每个场景为4个功能模块定义不同的战备状态、资源和在行动态
 * r=readiness, t=trend, res=resources, ops=operations, note=场景说明
 */
const SCENARIO_MODULES = {
  taiwan_strait: {
    diplomatic: {
      r:45, t:-3,
      note:'台海局势下外交空间有限，核心利益问题国际斡旋余地小',
      res:[
        {n:'外交斡旋空间',v:'有限',d:'台海属内政，国际干预正当性不足'},
        {n:'盟友表态',v:'5国支持',d:'多数国家坚持一个中国原则'},
        {n:'联合国否决权',v:'可用',d:'可阻止安理会不利决议'},
        {n:'使领馆协调',v:'276个',d:'全球使领馆进入应急状态'},
      ],
      ops:[
        {n:'联合国决议推动',s:'待激活',p:'高',pr:30},
        {n:'驻外使节通报',s:'执行中',p:'高',pr:85},
        {n:'关键国家沟通',s:'进行中',p:'高',pr:60},
        {n:'国际法理准备',s:'执行中',p:'中',pr:70},
      ],
    },
    economic: {
      r:78, t:2,
      note:'经济制裁是重要非军事手段，ECFA暂停将重创台经济',
      res:[
        {n:'ECFA杠杆',v:'可暂停',d:'影响台出口约20%'},
        {n:'贸易依赖比',v:'台对陆42%',d:'不对称经济杠杆'},
        {n:'金融制裁工具',v:'12项',d:'台金融机构限制'},
        {n:'战略物资管制',v:'8类',d:'关键原材料出口限制'},
      ],
      ops:[
        {n:'ECFA部分暂停评估',s:'执行中',p:'高',pr:70},
        {n:'台企在陆待遇调整',s:'待激活',p:'中',pr:40},
        {n:'金融交易审查加强',s:'执行中',p:'高',pr:75},
        {n:'贸易反制清单准备',s:'待激活',p:'中',pr:50},
      ],
    },
    tech: {
      r:72, t:3,
      note:'信息战和网络战是制胜关键，电磁压制是重要手段',
      res:[
        {n:'网络战能力',v:'A级',d:'攻防一体网络战体系'},
        {n:'电子战装备',v:'先进',d:'全频段电磁压制'},
        {n:'AI指挥系统',v:'部署中',d:'智能决策辅助'},
        {n:'认知域工具',v:'活跃',d:'反制认知域攻击'},
      ],
      ops:[
        {n:'电磁压制准备',s:'进行中',p:'高',pr:80},
        {n:'网络渗透行动',s:'执行中',p:'高',pr:65},
        {n:'认知域反制',s:'执行中',p:'中',pr:55},
        {n:'AI态势感知',s:'执行中',p:'中',pr:70},
      ],
    },
    logistics: {
      r:88, t:1,
      note:'两栖投送和跨海补给是作战关键保障',
      res:[
        {n:'两栖投送',v:'12万吨',d:'登陆舰/气垫艇/民船动员'},
        {n:'战备物资前置',v:'6大类',d:'弹药/油料/给养/医疗'},
        {n:'海上补给',v:'3个编队',d:'伴随保障和定点补给'},
        {n:'民船动员',v:'1200艘',d:'滚装/散货/油轮'},
      ],
      ops:[
        {n:'战备物资前置',s:'执行中',p:'高',pr:85},
        {n:'民船动员准备',s:'进行中',p:'高',pr:70},
        {n:'海上补给链建立',s:'执行中',p:'高',pr:80},
        {n:'战场医疗体系',s:'建设中',p:'中',pr:55},
      ],
    },
  },
  cyber_attack: {
    diplomatic: {
      r:55, t:0,
      note:'网络攻击溯源公开可形成外交压力，但需谨慎处理情报来源',
      res:[
        {n:'溯源证据',v:'充分',d:'技术溯源报告已完成'},
        {n:'外交施压渠道',v:'多边',d:'联合国/双边/G20'},
        {n:'国际法依据',v:'有限',d:'网络空间国际法不完善'},
        {n:'盟友协调',v:'5国',d:'共享网络威胁情报'},
      ],
      ops:[
        {n:'溯源报告国际发布',s:'待激活',p:'高',pr:60},
        {n:'联合国网络空间提案',s:'筹备中',p:'中',pr:30},
        {n:'双边外交交涉',s:'执行中',p:'高',pr:75},
      ],
    },
    economic: {
      r:65, t:-1,
      note:'网络攻击可能配套经济施压，需维护金融系统稳定',
      res:[
        {n:'金融系统防护',v:'A级',d:'银行/证券系统全面防护'},
        {n:'网络保险',v:'覆盖有限',d:'关键设施保险不足'},
        {n:'应急资金',v:'200亿',d:'网络事件应急专项资金'},
      ],
      ops:[
        {n:'金融网络加固',s:'执行中',p:'高',pr:80},
        {n:'网络事件保险扩面',s:'规划中',p:'中',pr:20},
      ],
    },
    tech: {
      r:92, t:5,
      note:'网络战是核心战场，技术能力决定攻防胜负',
      res:[
        {n:'攻防能力',v:'世界级',d:'进攻性网络战能力领先'},
        {n:'溯源体系',v:'完善',d:'全栈溯源和归因能力'},
        {n:'蜜罐网络',v:'部署中',d:'主动防御诱饵系统'},
        {n:'AI威胁检测',v:'运行中',d:'AI驱动的实时威胁识别'},
      ],
      ops:[
        {n:'全面网络防御',s:'执行中',p:'高',pr:90},
        {n:'反制攻击溯源',s:'进行中',p:'高',pr:75},
        {n:'蜜罐诱捕部署',s:'执行中',p:'中',pr:60},
        {n:'零信任架构',s:'建设中',p:'中',pr:45},
      ],
    },
    logistics: {
      r:70, t:1,
      note:'网络战后勤主要是基础设施保障和应急响应',
      res:[
        {n:'应急响应队',v:'12支',d:'全国分布的网络应急队'},
        {n:'备份系统',v:'三地灾备',d:'关键系统异地灾备'},
        {n:'带宽储备',v:'10Tbps',d:'应急通信带宽'},
      ],
      ops:[
        {n:'关键系统灾备切换',s:'待激活',p:'高',pr:85},
        {n:'应急响应队部署',s:'执行中',p:'高',pr:70},
      ],
    },
  },
  eco_sanctions: {
    diplomatic: {
      r:62, t:1,
      note:'外交突围是打破制裁封锁的关键，需争取中间立场国家',
      res:[
        {n:'战略伙伴',v:'19国',d:'全面战略伙伴关系'},
        {n:'多边机制',v:'12项',d:'上合/金砖/RCEP'},
        {n:'中间立场国',v:'23国',d:'可在制裁中保持中立'},
        {n:'反制裁联盟',v:'组建中',d:'与受制裁国家协调'},
      ],
      ops:[
        {n:'金砖扩员推进',s:'执行中',p:'高',pr:75},
        {n:'双边货币互换',s:'执行中',p:'高',pr:65},
        {n:'联合国反制裁提案',s:'筹备中',p:'中',pr:30},
        {n:'第三方市场合作',s:'进行中',p:'中',pr:50},
      ],
    },
    economic: {
      r:82, t:3,
      note:'经济反制是核心战场，金融韧性和技术自主是关键',
      res:[
        {n:'外汇储备',v:'3.2万亿',d:'可动用2.1万亿'},
        {n:'人民币跨境支付系统覆盖',v:'106国',d:'人民币跨境支付'},
        {n:'制裁反制清单',v:'47项',d:'已激活12项'},
        {n:'战略物资储备',v:'38类',d:'稀土/石油/粮食'},
      ],
      ops:[
        {n:'稀土出口管制',s:'待激活',p:'高',pr:90},
        {n:'人民币国际化',s:'执行中',p:'高',pr:55},
        {n:'供应链韧性建设',s:'进行中',p:'高',pr:70},
        {n:'数字人民币推广',s:'执行中',p:'中',pr:45},
      ],
    },
    tech: {
      r:78, t:4,
      note:'技术突破是打破制裁的根本路径',
      res:[
        {n:'研发投入',v:'3.3万亿',d:'占GDP 2.6%'},
        {n:'14nm芯片',v:'量产',d:'良率95%+'},
        {n:'7nm工艺',v:'流片中',d:'预计12个月量产'},
        {n:'AI大模型',v:'国产化80%',d:'对标GPT-4'},
      ],
      ops:[
        {n:'7nm工艺攻关',s:'进行中',p:'高',pr:75},
        {n:'EDA工具国产化',s:'执行中',p:'高',pr:60},
        {n:'AI芯片自研',s:'执行中',p:'高',pr:80},
        {n:'量子计算突破',s:'进行中',p:'中',pr:50},
      ],
    },
    logistics: {
      r:65, t:0,
      note:'供应链安全是经济战的物质基础',
      res:[
        {n:'战略物资运输',v:'5条通道',d:'陆海空多元通道'},
        {n:'储备基地',v:'42个',d:'全国综合保障基地'},
        {n:'民船动员',v:'1200艘',d:'战略运输力量'},
      ],
      ops:[
        {n:'供应链多元化',s:'执行中',p:'高',pr:65},
        {n:'战略物资增储',s:'进行中',p:'高',pr:70},
      ],
    },
  },
  border_india: {
    diplomatic: {
      r:65, t:2,
      note:'外交沟通渠道是管控边境危机的首要手段',
      res:[
        {n:'外交热线',v:'可用',d:'军长级会谈机制'},
        {n:'上合平台',v:'可用',d:'多边协调渠道'},
        {n:'第三方斡旋',v:'有限',d:'俄罗斯可发挥影响'},
      ],
      ops:[
        {n:'军长级会谈推动',s:'进行中',p:'高',pr:50},
        {n:'外交降温信号传递',s:'执行中',p:'高',pr:70},
        {n:'边境协议修订',s:'筹备中',p:'中',pr:25},
      ],
    },
    economic: {
      r:55, t:-2,
      note:'中印经济相互依存度有限，经济杠杆效果一般',
      res:[
        {n:'贸易杠杆',v:'有限',d:'印对华进口占比约15%'},
        {n:'投资限制',v:'已有',d:'印方已限制中国投资'},
        {n:'边境贸易',v:'暂停',d:'口岸贸易已受影响'},
      ],
      ops:[
        {n:'贸易反制清单',s:'待激活',p:'中',pr:40},
        {n:'供应链替代',s:'规划中',p:'低',pr:20},
      ],
    },
    tech: {
      r:75, t:2,
      note:'高原信息化作战和态势感知是技术关键',
      res:[
        {n:'高原无人机',v:'部署中',d:'侦察/打击一体'},
        {n:'卫星侦察',v:'可用',d:'高分卫星覆盖'},
        {n:'电子战',v:'先进',d:'高原电子对抗'},
      ],
      ops:[
        {n:'高原态势感知',s:'执行中',p:'高',pr:80},
        {n:'通信保障增强',s:'进行中',p:'高',pr:65},
      ],
    },
    logistics: {
      r:90, t:1,
      note:'高原后勤保障是边境对峙的生命线',
      res:[
        {n:'高原补给线',v:'3条',d:'空运/公路/直升机'},
        {n:'过冬物资',v:'充足',d:'防寒/制氧/给养'},
        {n:'基建项目',v:'加速',d:'公路/桥梁/机场'},
      ],
      ops:[
        {n:'冬季补给储备',s:'执行中',p:'高',pr:90},
        {n:'高原基建推进',s:'执行中',p:'高',pr:75},
        {n:'空中投送增强',s:'进行中',p:'高',pr:70},
      ],
    },
  },
  south_china_sea: {
    diplomatic: {
      r:58, t:1,
      note:'南海行为准则谈判是外交核心，分化域外与域内国家是关键',
      res:[
        {n:'COC谈判',v:'进行中',d:'南海行为准则磋商'},
        {n:'东盟关系',v:'全面战略',d:'中国东盟全面战略伙伴'},
        {n:'双边沟通',v:'活跃',d:'与声索国双边渠道'},
      ],
      ops:[
        {n:'COC文本磋商',s:'执行中',p:'高',pr:60},
        {n:'声索国双边沟通',s:'进行中',p:'高',pr:75},
        {n:'域外大国交涉',s:'执行中',p:'中',pr:50},
      ],
    },
    economic: {
      r:70, t:2,
      note:'中国与东盟互为最大贸易伙伴，经济杠杆有效',
      res:[
        {n:'RCEP红利',v:'释放中',d:'关税减让和便利化'},
        {n:'渔业资源',v:'管理中',d:'渔业资源共同开发'},
        {n:'油气开发',v:'争议中',d:'共同开发倡议'},
      ],
      ops:[
        {n:'RCEP深化执行',s:'执行中',p:'高',pr:80},
        {n:'渔业合作框架',s:'筹备中',p:'中',pr:35},
      ],
    },
    tech: {
      r:78, t:3,
      note:'海域态势感知和岛礁防御是技术重点',
      res:[
        {n:'海洋卫星',v:'8颗',d:'海洋监测卫星组网'},
        {n:'岛礁雷达',v:'部署中',d:'远程预警雷达'},
        {n:'无人系统',v:'列装',d:'无人艇/无人机'},
      ],
      ops:[
        {n:'海域感知系统',s:'执行中',p:'高',pr:85},
        {n:'岛礁防御升级',s:'进行中',p:'高',pr:70},
      ],
    },
    logistics: {
      r:82, t:1,
      note:'远海补给和岛礁保障是南海维权基础',
      res:[
        {n:'岛礁补给',v:'常态化',d:'南沙/西沙补给线'},
        {n:'远洋补给舰',v:'8艘',d:'901型综合补给舰'},
        {n:'保障基地',v:'3个',d:'西沙/南沙/大陆'},
      ],
      ops:[
        {n:'岛礁补给优化',s:'执行中',p:'高',pr:75},
        {n:'远海伴随保障',s:'执行中',p:'高',pr:80},
      ],
    },
  },
  horn_africa: {
    diplomatic: {
      r:72, t:2,
      note:'非洲外交资源丰富，但地区冲突复杂需谨慎平衡',
      res:[
        {n:'非洲伙伴',v:'52国',d:'中非合作论坛框架'},
        {n:'吉布提基地',v:'运营中',d:'首个海外保障基地'},
        {n:'联合国维和',v:'参与中',d:'南苏丹/马里维和'},
      ],
      ops:[
        {n:'地区斡旋',s:'进行中',p:'高',pr:50},
        {n:'侨民撤离协调',s:'执行中',p:'高',pr:80},
        {n:'非盟合作深化',s:'执行中',p:'中',pr:65},
      ],
    },
    economic: {
      r:68, t:1,
      note:'能源进口安全和海外投资保护是经济重点',
      res:[
        {n:'石油进口',v:'70%经海路',d:'亚丁湾航道关键'},
        {n:'非洲投资',v:'600亿美元',d:'基础设施和矿业'},
        {n:'援助资金',v:'120亿美元',d:'对非援助'},
      ],
      ops:[
        {n:'能源通道保障',s:'执行中',p:'高',pr:85},
        {n:'投资风险评估',s:'进行中',p:'高',pr:60},
      ],
    },
    tech: {
      r:60, t:2,
      note:'远程通信和卫星监控是非洲方向技术短板',
      res:[
        {n:'卫星覆盖',v:'有限',d:'非洲方向卫星覆盖不足'},
        {n:'远程通信',v:'可用',d:'卫星通信保障'},
      ],
      ops:[
        {n:'非洲方向卫星增强',s:'规划中',p:'中',pr:30},
        {n:'远程通信升级',s:'进行中',p:'中',pr:50},
      ],
    },
    logistics: {
      r:80, t:1,
      note:'远洋投送和海外保障是非洲行动基础',
      res:[
        {n:'吉布提基地',v:'运营中',d:'可支持护航/撤侨'},
        {n:'远洋编队',v:'2个',d:'印度洋护航编队'},
        {n:'空运能力',v:'运-20×28',d:'战略空运'},
      ],
      ops:[
        {n:'撤侨空运准备',s:'待激活',p:'高',pr:70},
        {n:'基地功能扩展',s:'建设中',p:'中',pr:40},
      ],
    },
  },
  korean_peninsula: {
    diplomatic: {
      r:60, t:0,
      note:'六方会谈机制停滞，需多渠道外交管控半岛危机',
      res:[
        {n:'六方会谈',v:'停滞',d:'机制存在但未运作'},
        {n:'中朝关系',v:'传统友好',d:'可发挥影响力'},
        {n:'中俄协调',v:'活跃',d:'半岛问题立场协调'},
      ],
      ops:[
        {n:'中方斡旋推动',s:'进行中',p:'高',pr:45},
        {n:'朝方沟通渠道',s:'活跃',p:'高',pr:70},
        {n:'某大国协调',s:'困难',p:'中',pr:30},
      ],
    },
    economic: {
      r:55, t:-1,
      note:'对朝经济影响有限，制裁执行与经济发展需要平衡',
      res:[
        {n:'中朝贸易',v:'受限',d:'安理会制裁框架下'},
        {n:'边境贸易',v:'管控',d:'丹东/图们口岸'},
      ],
      ops:[
        {n:'制裁执行协调',s:'执行中',p:'高',pr:75},
        {n:'人道主义援助',s:'进行中',p:'中',pr:50},
      ],
    },
    tech: {
      r:82, t:2,
      note:'核试验监测和导弹预警是技术核心',
      res:[
        {n:'核试监测',v:'完善',d:'地震/辐射/卫星多维监测'},
        {n:'导弹预警',v:'部署',d:'X波段雷达/预警卫星'},
        {n:'电子侦察',v:'密集',d:'半岛方向全频段侦察'},
      ],
      ops:[
        {n:'核试监测加强',s:'执行中',p:'高',pr:90},
        {n:'导弹预警值班',s:'执行中',p:'高',pr:85},
      ],
    },
    logistics: {
      r:85, t:1,
      note:'东北战区后勤保障完善，可快速响应',
      res:[
        {n:'战区后勤',v:'完善',d:'北部战区综合保障'},
        {n:'边防设施',v:'完备',d:'中朝边境防御工事'},
        {n:'防空体系',v:'部署',d:'反导/防空多层覆盖'},
      ],
      ops:[
        {n:'边境防空加强',s:'执行中',p:'高',pr:80},
        {n:'应急响应准备',s:'执行中',p:'高',pr:75},
      ],
    },
  },
  myanmar: {
    diplomatic: {
      r:70, t:1,
      note:'中国对缅甸各方均有影响力，外交斡旋空间较大',
      res:[
        {n:'中缅关系',v:'全面战略',d:'传统友好邻邦'},
        {n:'东盟渠道',v:'可用',d:'支持东盟主导斡旋'},
        {n:'民地武联系',v:'有渠道',d:'与多支民地武有沟通'},
      ],
      ops:[
        {n:'停火斡旋',s:'进行中',p:'高',pr:55},
        {n:'边境安全协调',s:'执行中',p:'高',pr:75},
        {n:'人道援助通道',s:'筹备中',p:'中',pr:40},
      ],
    },
    economic: {
      r:60, t:-2,
      note:'中缅经济走廊受冲突影响，项目安全面临威胁',
      res:[
        {n:'中缅走廊',v:'受阻',d:'油气管道/铁路项目'},
        {n:'边境贸易',v:'下降',d:'口岸贸易受冲突影响'},
        {n:'皎漂港',v:'运营中',d:'油气管道起点安全受关注'},
      ],
      ops:[
        {n:'走廊安全评估',s:'执行中',p:'高',pr:70},
        {n:'项目人员撤离',s:'待激活',p:'高',pr:60},
      ],
    },
    tech: {
      r:70, t:1,
      note:'边境监控和通信保障是技术重点',
      res:[
        {n:'边境监控',v:'部署',d:'无人机/传感器/雷达'},
        {n:'通信保障',v:'可用',d:'边境通信网络'},
      ],
      ops:[
        {n:'边境监控加强',s:'执行中',p:'高',pr:80},
        {n:'缅北信号侦察',s:'进行中',p:'中',pr:60},
      ],
    },
    logistics: {
      r:82, t:0,
      note:'边境后勤保障完善，可应对难民和应急需求',
      res:[
        {n:'边境口岸',v:'可控',d:'可关闭或管控'},
        {n:'难民营地',v:'预备',d:'边境临时安置点'},
        {n:'应急物资',v:'充足',d:'医疗/给养/帐篷'},
      ],
      ops:[
        {n:'边境封控准备',s:'执行中',p:'高',pr:85},
        {n:'难民安置预案',s:'待激活',p:'高',pr:65},
      ],
    },
  },
  cognitive_war: {
    diplomatic: {
      r:50, t:-2,
      note:'认知域战争的外交反制需要国际规则建设',
      res:[
        {n:'国际信息规则',v:'缺位',d:'缺乏约束性国际规则'},
        {n:'媒体合作',v:'有限',d:'国际媒体合作渠道不足'},
        {n:'文化外交',v:'活跃',d:'孔子学院/文化交流'},
      ],
      ops:[
        {n:'国际信息规则倡议',s:'筹备中',p:'中',pr:25},
        {n:'虚假信息外交反制',s:'执行中',p:'高',pr:65},
      ],
    },
    economic: {
      r:60, t:0,
      note:'社交平台经济依赖外部，需推进自主平台',
      res:[
        {n:'自主社交平台',v:'建设不足',d:'国际影响力弱'},
        {n:'内容产业',v:'规模大',d:'但国际传播力不足'},
      ],
      ops:[
        {n:'自主平台国际化',s:'规划中',p:'中',pr:30},
        {n:'内容出海支持',s:'执行中',p:'中',pr:50},
      ],
    },
    tech: {
      r:88, t:5,
      note:'AI驱动的认知域攻防是技术核心',
      res:[
        {n:'AI内容识别',v:'先进',d:'深度伪造检测/协调账号识别'},
        {n:'舆情监测',v:'完善',d:'全平台实时监测'},
        {n:'反制工具',v:'开发中',d:'认知域反制武器库'},
      ],
      ops:[
        {n:'深度伪造检测部署',s:'执行中',p:'高',pr:85},
        {n:'协调账号清除',s:'执行中',p:'高',pr:75},
        {n:'认知域反制系统',s:'建设中',p:'高',pr:55},
        {n:'国际传播能力建设',s:'进行中',p:'中',pr:45},
      ],
    },
    logistics: {
      r:65, t:1,
      note:'认知域战争的后勤主要是数字基础设施',
      res:[
        {n:'网络带宽',v:'充足',d:'可支持大规模内容分发'},
        {n:'数据中心',v:'全国布局',d:'东数西算工程'},
        {n:'CDN网络',v:'覆盖全球',d:'内容分发网络'},
      ],
      ops:[
        {n:'内容分发优化',s:'执行中',p:'中',pr:70},
        {n:'数字基础设施加固',s:'进行中',p:'中',pr:55},
      ],
    },
  },
};

/* ===== 默认模块配置（场景未定义时使用） ===== */
const DEFAULT_SCENARIO_MODULE = {
  diplomatic: {
    r:65, t:0, note:'外交资源可支撑推演需要',
    res:[
      {n:'外交资源',v:'标准配置',d:'全面外交体系运作'},
      {n:'多边机制',v:'12项',d:'上合/金砖/RCEP等'},
      {n:'使领馆',v:'276个',d:'全球覆盖'},
      {n:'条约执行',v:'8项',d:'双边引渡/司法协助'},
    ],
    ops:[
      {n:'外交资源调配',s:'执行中',p:'中',pr:60},
      {n:'多边沟通加强',s:'进行中',p:'中',pr:50},
    ],
  },
  economic: {
    r:65, t:-1, note:'经济资源可支撑推演需要',
    res:[
      {n:'外汇储备',v:'3.2万亿',d:'可动用2.1万亿'},
      {n:'制裁反制',v:'47项',d:'已激活12项'},
      {n:'人民币跨境支付系统',v:'106国',d:'人民币跨境支付'},
      {n:'战略储备',v:'38类',d:'稀土/石油/粮食'},
    ],
    ops:[
      {n:'经济态势监控',s:'执行中',p:'中',pr:70},
      {n:'反制工具准备',s:'待激活',p:'中',pr:50},
    ],
  },
  tech: {
    r:68, t:4, note:'科技资源可支撑推演需要',
    res:[
      {n:'研发投入',v:'3.3万亿',d:'占GDP 2.6%'},
      {n:'专利保有',v:'420万件',d:'专利合作条约申请全球第一'},
      {n:'人才储备',v:'180万',d:'理工科博士'},
      {n:'关键攻关',v:'35项',d:'芯片/人工智能/量子'},
    ],
    ops:[
      {n:'关键技术攻关',s:'执行中',p:'高',pr:70},
      {n:'科技成果转化',s:'进行中',p:'中',pr:55},
    ],
  },
  logistics: {
    r:74, t:1, note:'后勤保障体系运作正常',
    res:[
      {n:'战略投送',v:'运20×28',d:'海上12万吨'},
      {n:'战备物资',v:'6大类',d:'弹药/油料/给养'},
      {n:'物流网',v:'5大战区',d:'42个基地'},
      {n:'民船动员',v:'1200艘',d:'滚装/散货/油轮'},
    ],
    ops:[
      {n:'战备物资检查',s:'执行中',p:'中',pr:75},
      {n:'投送能力评估',s:'进行中',p:'中',pr:60},
    ],
  },
};

/* ===== 辅助函数：获取场景化力量 ===== */
function getScenarioForces(scenarioId){
  const config = SCENARIO_FORCES[scenarioId];
  const baseForces = (typeof FORCES !== 'undefined') ? FORCES : (typeof window !== 'undefined' && window.FORCES) || [];
  if(!config) return baseForces.map(f => ({...f}));
  return config.map(fc => {
    const base = baseForces.find(f => f.code === fc.c);
    if(!base) return { branch:fc.c, code:fc.c, icon:'⚔️', readiness:fc.r||75, trend:fc.t||0, personnel:'-', equipment:fc.e||'-', deployment:fc.d||'-', status:fc.s||'ready', domain:'military', note:fc.n||'' };
    return { ...base, readiness:fc.r, status:fc.s, deployment:fc.d, equipment:fc.e, note:fc.n||'' };
  });
}

/* ===== 辅助函数：获取场景化情报 ===== */
function getScenarioIntel(scenarioId){
  const config = SCENARIO_INTEL[scenarioId];
  const baseIntel = (typeof INTEL !== 'undefined') ? INTEL : (typeof window !== 'undefined' && window.INTEL) || [];
  if(!config) return baseIntel.map(i => ({...i}));
  return config.map((item, idx) => ({
    time: item.src === '图像情报' ? `T-${(idx+1)*12}h` : item.src === '信号情报' ? `T-${(idx+1)*8}h` : `T-${(idx+1)*6}h`,
    source: item.src,
    type: item.type,
    reliability: item.rel,
    title: item.title,
    summary: item.summary,
    modifier: item.mod ? { domain:item.mod.d, bonus:item.mod.b } : null,
  }));
}

/* ===== 辅助函数：获取场景化模块配置 ===== */
function getScenarioModules(scenarioId){
  const config = SCENARIO_MODULES[scenarioId];
  const base = (typeof MODULES !== 'undefined') ? MODULES : (typeof window !== 'undefined' && window.MODULES) || [];
  if(!config){
    /* 使用默认配置 */
    return base.map(m => {
      const def = DEFAULT_SCENARIO_MODULE[m.id];
      if(!def) return {...m};
      return {
        ...m,
        readiness: def.r, trend: def.t,
        resources: def.res.map(r => ({name:r.n, value:r.v, detail:r.d})),
        operations: def.ops.map(o => ({name:o.n, status:o.s, priority:o.p, progress:o.pr})),
        scenarioNote: def.note,
      };
    });
  }
  return base.map(m => {
    const sc = config[m.id];
    if(!sc) return {...m};
    return {
      ...m,
      readiness: sc.r, trend: sc.t,
      resources: sc.res.map(r => ({name:r.n, value:r.v, detail:r.d})),
      operations: sc.ops.map(o => ({name:o.n, status:o.s, priority:o.p, progress:o.pr})),
      scenarioNote: sc.note,
    };
  });
}

/* ===== 全局暴露 ===== */
if(typeof window !== 'undefined'){
  window.SCENARIO_FORCES = SCENARIO_FORCES;
  window.SCENARIO_INTEL = SCENARIO_INTEL;
  window.SCENARIO_MODULES = SCENARIO_MODULES;
  window.getScenarioForces = getScenarioForces;
  window.getScenarioIntel = getScenarioIntel;
  window.getScenarioModules = getScenarioModules;
}
