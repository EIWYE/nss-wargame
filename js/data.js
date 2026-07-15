/* ================================================================
 * NSS-WGS 数据层
 * 所有静态数据集中管理，供 app.js / map.js / wargame.js 调用
 * ================================================================ */

/* ===== 用户状态 ===== */
const USER = {
  name: '指挥官',
  org: '战略推演评估中心',
  role: '科研人员',
  clearance: '机密',
};

const STATE = {
  currentTab: 'overview',
  games: [
    { scenario: 'taiwan_strait', score: 82, date: '2026-07-12', result: '胜利' },
    { scenario: 'south_china_sea', score: 76, date: '2026-07-10', result: '胜利' },
    { scenario: 'cyber_attack', score: 68, date: '2026-07-08', result: '平局' },
  ],
  defcon: 3,
  threatLevel: 72,
};

/* ===== 场景库 =====
 * 每个场景包含:
 *   budget         - 起始资金(亿元)
 *   reputation     - 起始国际声望(0-100)
 *   domesticSupport- 起始国内支持度(0-100)
 *   prestigeType   - 声望类型: 'sovereignty'(维护主权) | 'aggressive'(侵略行动) | 'tech'(科技竞争) | 'none'(犯罪/恐怖组织，无视声望)
 *   specialActions - 场景专属行动ID数组(对应 wargame.js 中 STRATEGIC_ACTIONS 的 id)
 */
const SCENARIOS = [
  { id:'taiwan_strait', code:'NS-2026-TS-01', name:'台海方向战略博弈',
    classification:'机密', difficulty:5, domain:'military', threatLevel:5,
    duration:5, type:'核心利益维护',
    budget:5000, reputation:55, domesticSupport:72, prestigeType:'sovereignty',
    specialActions:['ts_blockade','ts_amphibious','ts_missile_deter'],
    background:'2026年3月，某大国国会通过新一轮对台军售法案，总额达28亿美元，包含先进防空导弹和雷达系统。台地区领导人发表所谓"国际参与"倡议，实质推动"渐进式台独"。台海局势急剧升温。',
    actors:['某大国','台当局','日本'],
    response:['military','diplomatic','economic','information'] },

  { id:'south_china_sea', code:'NS-2026-SCS-02', name:'南海方向权益维护',
    classification:'机密', difficulty:4, domain:'military', threatLevel:4,
    duration:5, type:'海洋权益博弈',
    budget:3500, reputation:60, domesticSupport:68, prestigeType:'sovereignty',
    specialActions:['scs_island','scs_patrol','scs_drill'],
    background:'2026年5月，某声索国在南海争议海域启动新一轮油气钻探作业，并同时与域外大国举行联合海上巡逻。域外大国派遣双航母战斗群进入南海，局势持续紧张。',
    actors:['某声索国','域外大国','东盟'],
    response:['military','diplomatic','economic'] },

  { id:'border_india', code:'NS-2026-BD-03', name:'中印边境战略管控',
    classification:'机密', difficulty:4, domain:'military', threatLevel:3,
    duration:4, type:'边境安全管控',
    budget:2000, reputation:58, domesticSupport:70, prestigeType:'sovereignty',
    specialActions:['bd_reinforce','bd_disengage','bd_infra'],
    background:'2026年夏季，印方在边境争议地区加速基础设施建设，并在实控线印方一侧大规模增兵。双方在多个对峙点发生摩擦，局势有失控风险。',
    actors:['印度','巴基斯坦'],
    response:['military','diplomatic'] },

  { id:'eco_sanctions', code:'NS-2026-EC-04', name:'经济安全与制裁博弈',
    classification:'机密', difficulty:3, domain:'economic', threatLevel:3,
    duration:4, type:'经济安全',
    budget:8000, reputation:52, domesticSupport:65, prestigeType:'sovereignty',
    specialActions:['eco_tech','eco_rmb','eco_swap'],
    background:'某大国宣布对中国实施新一轮全面经济制裁，覆盖半导体、人工智能、量子计算等关键技术领域，并联合盟友实施出口管制。全球经济格局面临重塑。',
    actors:['某大国','欧盟','日本','韩国'],
    response:['economic','diplomatic','information'] },

  { id:'cyber_attack', code:'NS-2026-CY-05', name:'网络空间安全攻防',
    classification:'机密', difficulty:4, domain:'cyber', threatLevel:4,
    duration:5, type:'网络空间',
    budget:1200, reputation:56, domesticSupport:74, prestigeType:'sovereignty',
    specialActions:['cyb_strikeback','cyb_mobilize','cyb_decoy'],
    background:'中国关键信息基础设施遭受大规模高级持续性威胁攻击，多个政府机构和能源系统被入侵。攻击溯源指向某大国情报机构支持的黑客组织。网络战态势升级。',
    actors:['某大国情报机构','高级持续性威胁组织'],
    response:['cyber','information','military'] },

  { id:'hybrid_warfare', code:'NS-2026-HW-06', name:'混合战争综合应对',
    classification:'机密', difficulty:5, domain:'information', threatLevel:5,
    duration:6, type:'混合战争',
    budget:4500, reputation:54, domesticSupport:66, prestigeType:'sovereignty',
    specialActions:['hw_counterintel','hw_resilience','hw_attribution'],
    background:'针对中国的混合战争态势升级：网络攻击、舆论操纵、经济胁迫、代理人骚扰同时展开。多域威胁交织，考验综合应对能力。',
    actors:['某大国','盟友网络','代理人势力'],
    response:['military','economic','cyber','diplomatic','information'] },

  { id:'middle_east', code:'NS-2026-ME-07', name:'中东局势与能源安全',
    classification:'机密', difficulty:3, domain:'economic', threatLevel:3,
    duration:4, type:'能源安全',
    budget:3000, reputation:62, domesticSupport:60, prestigeType:'sovereignty',
    specialActions:['me_evacuate','me_energy','me_mediate'],
    background:'中东爆发新一轮地区冲突，国际油价暴涨。中国在中东的能源进口和侨民安全面临威胁，需在复杂地缘格局中维护核心利益。',
    actors:['中东各方','某大国','俄罗斯'],
    response:['diplomatic','economic','military'] },

  { id:'hormuz', code:'NS-2026-HZ-08', name:'霍尔木兹海峡能源通道',
    classification:'机密', difficulty:4, domain:'military', threatLevel:4,
    duration:4, type:'战略通道',
    budget:4000, reputation:58, domesticSupport:63, prestigeType:'sovereignty',
    specialActions:['hz_convoy','hz_alternative','hz_naval'],
    background:'伊朗威胁封锁霍尔木兹海峡，在海峡部署水雷和导弹阵地，拦截过往商船。中国40%原油进口经此通道，能源生命线面临严重威胁。海湾国家请求中国协助维护航道安全。',
    actors:['伊朗','某大国','海湾国家'],
    response:['military','diplomatic','economic'] },

  { id:'indo_pacific', code:'NS-2026-IP-13', name:'印太战略围堵与反制',
    classification:'机密', difficulty:4, domain:'diplomatic', threatLevel:4,
    duration:5, type:'地缘战略',
    budget:2500, reputation:64, domesticSupport:67, prestigeType:'sovereignty',
    specialActions:['ip_breakthrough','ip_rcep','ip_split'],
    background:'某大国全面推进"印太战略"，强化奥库斯联盟、四方安全对话等联盟机制，构建对华战略包围圈。中国需突破围堵，维护战略空间。',
    actors:['某大国','日本','印度','澳大利亚'],
    response:['diplomatic','military','economic'] },

  { id:'rare_earth', code:'NS-2026-RE-14', name:'关键矿产供应链博弈',
    classification:'机密', difficulty:3, domain:'economic', threatLevel:3,
    duration:3, type:'资源博弈',
    budget:3500, reputation:57, domesticSupport:69, prestigeType:'sovereignty',
    specialActions:['re_stockpile','re_downstream','re_partner'],
    background:'某大国推动关键矿产供应链"去中国化"，联合盟友建立替代供应体系。中国稀土优势面临挑战，需维护产业链主导权。',
    actors:['某大国','澳大利亚','加拿大'],
    response:['economic','diplomatic'] },

  { id:'space_domain', code:'NS-2026-SP-15', name:'太空域安全与轨道博弈',
    classification:'机密', difficulty:5, domain:'space', threatLevel:4,
    duration:5, type:'太空安全',
    budget:2800, reputation:59, domesticSupport:64, prestigeType:'sovereignty',
    specialActions:['sp_asat','sp_constellation','sp_debris'],
    background:'某大国加速太空军事化部署，反卫星武器试验升级。中国太空资产面临威胁，轨道资源和太空交通管理权争夺白热化。',
    actors:['某大国','欧洲航天局','商业航天公司'],
    response:['space','military','diplomatic'] },

  { id:'ai_race', code:'NS-2026-AI-17', name:'人工智能与前沿科技军备竞赛',
    classification:'机密', difficulty:4, domain:'cyber', threatLevel:4,
    duration:5, type:'科技博弈',
    budget:6000, reputation:53, domesticSupport:71, prestigeType:'sovereignty',
    specialActions:['ai_chip','ai_talent','ai_military'],
    background:'人工智能技术成为大国竞争核心领域。某大国实施芯片封锁遏制中国人工智能发展，同时加速人工智能军事化应用。技术代差风险加剧。',
    actors:['某大国','荷兰','日本','韩国'],
    response:['economic','cyber','diplomatic'] },

  { id:'finance_war', code:'NS-2026-FW-19', name:'金融制裁与去美元化',
    classification:'机密', difficulty:4, domain:'economic', threatLevel:3,
    duration:4, type:'金融安全',
    budget:10000, reputation:56, domesticSupport:68, prestigeType:'sovereignty',
    specialActions:['fw_cips','fw_gold','fw_bilateral'],
    background:'某大国威胁将中国排除出环球银行金融电信系统，实施金融"核弹"级制裁。中国加速人民币国际化和跨境支付系统建设。',
    actors:['某大国','欧盟','俄罗斯'],
    response:['economic','diplomatic'] },

  { id:'arctic', code:'NS-2026-AR-21', name:'北极航道与极地博弈',
    classification:'机密', difficulty:3, domain:'diplomatic', threatLevel:2,
    duration:3, type:'极地博弈',
    budget:1800, reputation:63, domesticSupport:58, prestigeType:'sovereignty',
    specialActions:['ac_research','ac_route','ac_icebreaker'],
    background:'北极冰盖加速消融，北方海航道通航期延长。某大国联合北约强化北极军事存在，中国在"近北极国家"权益面临挑战。',
    actors:['俄罗斯','北约','北欧国家'],
    response:['diplomatic','military','economic'] },

  { id:'digital_sovereignty', code:'NS-2026-DS-37', name:'数字主权与数据安全',
    classification:'机密', difficulty:3, domain:'cyber', threatLevel:3,
    duration:4, type:'数字主权',
    budget:2200, reputation:61, domesticSupport:72, prestigeType:'sovereignty',
    specialActions:['ds_data','ds_platform','ds_standard'],
    background:'数据跨境流动规则之争白热化，某大国试图主导全球数字治理框架。中国数字主权和数据安全面临系统性挑战。',
    actors:['某大国','欧盟','东盟'],
    response:['cyber','diplomatic','economic'] },

  /* === 新增场景(16-30) === */
  { id:'diaoyu', code:'NS-2026-DY-16', name:'钓鱼岛方向维权',
    classification:'机密', difficulty:4, domain:'military', threatLevel:4,
    duration:4, type:'核心利益维护',
    budget:2800, reputation:57, domesticSupport:75, prestigeType:'sovereignty',
    specialActions:['dy_patrol','dy_law','dy_drill'],
    background:'日方在钓鱼岛海域频繁挑衅，强化实际控制企图。中国海空力量常态化巡航维权，局势有升级风险。',
    actors:['日本','某大国'],
    response:['military','diplomatic','information'] },

  { id:'korean_peninsula', code:'NS-2026-KP-17', name:'朝鲜半岛局势管控',
    classification:'机密', difficulty:5, domain:'military', threatLevel:4,
    duration:5, type:'核扩散管控',
    budget:3500, reputation:60, domesticSupport:68, prestigeType:'sovereignty',
    specialActions:['kp_mediate','kp_sanction','kp_prepare'],
    background:'朝鲜核武器和导弹技术持续发展，某大国在半岛加强军事存在。中国在核不扩散和地区稳定之间面临挑战。',
    actors:['朝鲜','某大国','韩国','日本'],
    response:['diplomatic','military','economic'] },

  { id:'myanmar', code:'NS-2026-MM-18', name:'缅甸局势与边境安全',
    classification:'机密', difficulty:3, domain:'military', threatLevel:3,
    duration:4, type:'边境安全',
    budget:1500, reputation:58, domesticSupport:65, prestigeType:'sovereignty',
    specialActions:['mm_border','mm_mediate','mm_humanitarian'],
    background:'缅甸内战持续，边境地区安全形势恶化，难民和跨境犯罪威胁中国西南边境安全。',
    actors:['缅甸军方','民地武','东盟'],
    response:['diplomatic','military','economic'] },

  { id:'afghanistan', code:'NS-2026-AF-19', name:'阿富汗重建与安全',
    classification:'机密', difficulty:4, domain:'diplomatic', threatLevel:3,
    duration:4, type:'反恐安全',
    budget:1200, reputation:62, domesticSupport:60, prestigeType:'sovereignty',
    specialActions:['af_recon','af_terror','af_neighbor'],
    background:'阿富汗塔利班执政后经济困难，恐怖组织在阿巴边境活动。中国通过上合组织和双边渠道维护西部安全。',
    actors:['阿富汗塔利班','巴基斯坦','上合组织'],
    response:['diplomatic','economic','military'] },

  { id:'horn_africa', code:'NS-2026-HA-20', name:'非洲之角安全博弈',
    classification:'机密', difficulty:3, domain:'diplomatic', threatLevel:3,
    duration:4, type:'海外利益保护',
    budget:1800, reputation:63, domesticSupport:58, prestigeType:'sovereignty',
    specialActions:['ha_base','ha_mediate','ha_aid'],
    background:'非洲之角战略位置重要，多个大国在此竞争。中国在吉布提保障基地面临安全挑战，需维护海上通道和海外利益。',
    actors:['某大国','地区国家','国际组织'],
    response:['diplomatic','military','economic'] },

  { id:'venezuela', code:'NS-2026-VZ-21', name:'委内瑞拉危机与拉美博弈',
    classification:'机密', difficulty:3, domain:'diplomatic', threatLevel:2,
    duration:3, type:'地缘博弈',
    budget:1000, reputation:60, domesticSupport:55, prestigeType:'sovereignty',
    specialActions:['vz_diplomatic','vz_energy','vz_cooperation'],
    background:'委内瑞拉政治经济危机持续，某大国加强在拉美影响力。中国需要在拉美维护能源利益和战略伙伴关系。',
    actors:['某大国','委内瑞拉','拉美国家'],
    response:['diplomatic','economic'] },

  { id:'biosecurity', code:'NS-2026-BS-22', name:'生物安全事件应对',
    classification:'机密', difficulty:5, domain:'cyber', threatLevel:5,
    duration:6, type:'生物安全',
    budget:5000, reputation:56, domesticSupport:70, prestigeType:'sovereignty',
    specialActions:['bs_response','bs_trace','bs_vaccine'],
    background:'新型传染病暴发，疑似与某大国生物实验室相关。生物安全威胁人民生命健康和经济社会发展。',
    actors:['某大国','世界卫生组织','研究机构'],
    response:['cyber','diplomatic','economic','information'] },

  { id:'nuclear_prolif', code:'NS-2026-NP-23', name:'核扩散与核安全管控',
    classification:'机密', difficulty:5, domain:'diplomatic', threatLevel:5,
    duration:5, type:'核安全',
    budget:2000, reputation:64, domesticSupport:72, prestigeType:'sovereignty',
    specialActions:['np_nonpro','np_deter','np_arms'],
    background:'朝鲜核武库持续扩大，伊朗接近核门槛，核扩散风险加剧。中国需要维护核不扩散体系同时保障自身核威慑。',
    actors:['朝鲜','伊朗','某大国','国际原子能机构'],
    response:['diplomatic','military','economic'] },

  { id:'deep_sea', code:'NS-2026-DS2-24', name:'深海争端与海底安全',
    classification:'机密', difficulty:4, domain:'military', threatLevel:3,
    duration:4, type:'海洋安全',
    budget:2500, reputation:59, domesticSupport:62, prestigeType:'sovereignty',
    specialActions:['ds_explore','ds_monitor','ds_protect'],
    background:'深海资源争夺加剧，某大国加强海底军事部署。海底电缆和深海科研设施安全面临威胁。',
    actors:['某大国','海洋大国','国际海底管理局'],
    response:['military','diplomatic','economic'] },

  { id:'climate_security', code:'NS-2026-CS-25', name:'气候安全与能源转型',
    classification:'机密', difficulty:3, domain:'economic', threatLevel:3,
    duration:4, type:'气候安全',
    budget:4000, reputation:65, domesticSupport:68, prestigeType:'sovereignty',
    specialActions:['cs_carbon','cs_energy','cs_cooperation'],
    background:'气候变化加剧极端天气和资源争夺，某大国以气候议题施压。中国推进双碳目标同时维护发展权。',
    actors:['某大国','欧盟','发展中国家'],
    response:['economic','diplomatic','information'] },

  { id:'food_security', code:'NS-2026-FS-26', name:'粮食安全与农业博弈',
    classification:'机密', difficulty:3, domain:'economic', threatLevel:3,
    duration:3, type:'粮食安全',
    budget:2000, reputation:60, domesticSupport:70, prestigeType:'sovereignty',
    specialActions:['fs_reserve','fs_tech','fs_diversify'],
    background:'全球粮食价格波动，地缘冲突影响粮食供应链。中国需要确保14亿人粮食安全和种业自主。',
    actors:['某大国','俄罗斯','联合国粮农组织','跨国粮商'],
    response:['economic','diplomatic'] },

  { id:'supply_chain', code:'NS-2026-SC-27', name:'供应链断链危机应对',
    classification:'机密', difficulty:4, domain:'economic', threatLevel:4,
    duration:4, type:'供应链安全',
    budget:3500, reputation:58, domesticSupport:66, prestigeType:'sovereignty',
    specialActions:['sc_reshore','sc_diversify','sc_stockpile'],
    background:'某大国推进供应链去中国化，关键零部件和原材料断链风险加剧。中国需要构建韧性供应链体系。',
    actors:['某大国','东南亚','墨西哥'],
    response:['economic','diplomatic'] },

  { id:'cognitive_war', code:'NS-2026-CW-28', name:'认知域作战与舆论博弈',
    classification:'机密', difficulty:5, domain:'information', threatLevel:4,
    duration:5, type:'认知域作战',
    budget:1800, reputation:55, domesticSupport:67, prestigeType:'sovereignty',
    specialActions:['cw_counter','cw_narrative','cw_platform'],
    background:'某大国利用媒体和社交平台对中国发动认知域作战，试图影响民众认知和国际舆论。信息防线面临严峻挑战。',
    actors:['某大国','媒体机构','社交平台'],
    response:['information','cyber','diplomatic'] },

  { id:'nato_expansion', code:'NS-2026-NE-29', name:'北约东扩与欧亚安全',
    classification:'机密', difficulty:4, domain:'diplomatic', threatLevel:4,
    duration:5, type:'地缘战略',
    budget:2000, reputation:62, domesticSupport:64, prestigeType:'sovereignty',
    specialActions:['ne_counter','ne_partner','ne_shanghai'],
    background:'北约持续东扩并试图介入亚太事务，某大国推动亚洲版北约。中国需要通过上合组织和伙伴关系网络反制。',
    actors:['某大国','北约','上合组织'],
    response:['diplomatic','military','economic'] },

  { id:'east_china_sea', code:'NS-2026-ECS-30', name:'东海防空识别区博弈',
    classification:'机密', difficulty:4, domain:'military', threatLevel:3,
    duration:4, type:'空防安全',
    budget:2200, reputation:58, domesticSupport:71, prestigeType:'sovereignty',
    specialActions:['ecs_adiz','ecs_intercept','ecs_exercise'],
    background:'某大国和日本军机频繁在中国东海防空识别区活动，空防安全压力增大。需要有效管控空中对峙风险。',
    actors:['日本','某大国'],
    response:['military','diplomatic'] },

  { id:'strait_of_malacca', code:'NS-2026-SM-31', name:'马六甲海峡安全困境',
    classification:'机密', difficulty:4, domain:'military', threatLevel:4,
    duration:5, type:'能源通道安全',
    budget:3800, reputation:60, domesticSupport:68, prestigeType:'sovereignty',
    specialActions:['sm_escort','sm_bypass','sm_diplomatic'],
    background:'某大国加强马六甲海峡军事存在，与新加坡、印尼举行联合巡逻演习。中国80%能源进口途经此海峡，一旦被封锁将面临严重能源危机。需要多元化通道和海上护航能力建设。',
    actors:['某大国','新加坡','印尼'],
    response:['military','economic','diplomatic'] },

  { id:'quantum_tech', code:'NS-2026-QT-32', name:'量子科技争霸战',
    classification:'机密', difficulty:5, domain:'information', threatLevel:4,
    duration:5, type:'前沿科技',
    budget:2800, reputation:65, domesticSupport:75, prestigeType:'tech',
    specialActions:['qt_breakthrough','qt_talent','qt_standard'],
    background:'某大国投入巨资加速量子计算和量子通信研发，试图在密码破解和安全通信领域建立绝对优势。中国量子卫星和量子计算处于第一梯队，但人才争夺和技术封锁日趋激烈。',
    actors:['某大国','欧洲','日本'],
    response:['information','economic','cyber'] },

  { id:'water_security', code:'NS-2026-WS-33', name:'跨境水资源博弈',
    classification:'机密', difficulty:3, domain:'economic', threatLevel:3,
    duration:4, type:'资源安全',
    budget:1500, reputation:52, domesticSupport:70, prestigeType:'sovereignty',
    specialActions:['ws_dam','ws_treaty','ws_diversion'],
    background:'中国在雅鲁藏布江、澜沧江等跨境河流上游加强水利设施建设，引发下游国家印度、越南等担忧。下游国家联合向国际社会施压，试图以国际法约束中国上游水资源开发权。水资源正成为新的地缘博弈工具。',
    actors:['印度','越南','东南亚国家'],
    response:['economic','diplomatic'] },

  { id:'polar_silk_road', code:'NS-2026-PSR-34', name:'冰上丝绸之路建设',
    classification:'机密', difficulty:3, domain:'diplomatic', threatLevel:2,
    duration:5, type:'极地战略',
    budget:3200, reputation:58, domesticSupport:62, prestigeType:'sovereignty',
    specialActions:['psr_route','psr_port','psr_research'],
    background:'北极冰融加速，北方海航道通航窗口延长。中国与俄罗斯合作推进冰上丝绸之路建设，但西方北极国家试图排斥中俄参与，垄断航道管控权和极地资源开发权。各方在北极展开激烈博弈。',
    actors:['俄罗斯','某大国','北欧国家'],
    response:['diplomatic','economic','military'] },

  { id:'maritime_militia', code:'NS-2026-MM-35', name:'海上灰色地带对峙',
    classification:'机密', difficulty:4, domain:'military', threatLevel:3,
    duration:3, type:'灰色地带',
    budget:1800, reputation:56, domesticSupport:73, prestigeType:'sovereignty',
    specialActions:['mm_coastguard','mm_fishery','mm_press'],
    background:'某大国在南海部署海上巡逻力量，以渔船和海岸警卫队为前沿进行灰色地带施压。中国需要在军事升级与权益维护之间寻找平衡，有效管控海上摩擦。',
    actors:['某大国','菲律宾','越南'],
    response:['military','diplomatic','information'] },

  { id:'space_debris', code:'NS-2026-SD-36', name:'太空碎片碰撞危机',
    classification:'机密', difficulty:4, domain:'space', threatLevel:4,
    duration:3, type:'太空安全',
    budget:2000, reputation:54, domesticSupport:65, prestigeType:'tech',
    specialActions:['sd_track','sd_maneuver','sd_debris'],
    background:'某大国秘密进行反卫星试验产生大量碎片，威胁中国在轨卫星安全运行。同时近地轨道资源争夺加剧，数万颗商业卫星计划可能挤占中国轨道资源。',
    actors:['某大国','商业航天公司'],
    response:['space','military','diplomatic'] },

  { id:'bio_data', code:'NS-2026-BD-37', name:'基因数据安全攻防',
    classification:'机密', difficulty:4, domain:'cyber', threatLevel:3,
    duration:4, type:'生物数据安全',
    budget:1600, reputation:55, domesticSupport:72, prestigeType:'tech',
    specialActions:['bd_regulate','bd_indigenous','bd_counter'],
    background:'某跨国公司以科研合作为名大量收集中国人群基因数据，境外情报机构利用基因数据研发生物特征识别系统。中国基因数据安全面临严峻挑战，需要建立完善的基因数据保护体系。',
    actors:['某大国情报机构','跨国生物公司'],
    response:['cyber','information','economic'] },

  { id:'energy_transition', code:'NS-2026-ET-38', name:'能源转型博弈',
    classification:'机密', difficulty:3, domain:'economic', threatLevel:3,
    duration:5, type:'能源安全',
    budget:4000, reputation:60, domesticSupport:70, prestigeType:'sovereignty',
    specialActions:['et_renewable','et_nuclear','et_grid'],
    background:'全球能源转型加速，某大国通过碳关税和新能源技术壁垒重塑能源格局。中国需要同时保障传统能源安全和新能源技术自主，在碳中和目标与能源安全之间寻找平衡。',
    actors:['某大国','欧盟','欧佩克'],
    response:['economic','diplomatic','information'] },
];

/* ===== 推演方/阵营定义 =====
 * 每个场景的对弈双方 + AI导调方
 * side: 'red'(红方/我方) | 'blue'(蓝方/对手方)
 * 人工智能始终作为导调方(Director)，负责态势推送、事件触发、裁决
 */
const SCENARIO_SIDES = {
  taiwan_strait: {
    red: { id:'china', name:'中国', shortName:'中方', color:'#ff4757', icon:'🇨🇳', desc:'维护国家统一，捍卫领土主权完整' },
    blue: { id:'us_taiwan', name:'美台联盟', shortName:'美台方', color:'#00b4d8', icon:'⚔️', desc:'阻挠统一进程，维持台海分裂现状' },
  },
  south_china_sea: {
    red: { id:'china', name:'中国', shortName:'中方', color:'#ff4757', icon:'🇨🇳', desc:'维护南海海洋权益和领土主权' },
    blue: { id:'us_asean', name:'域外大国+声索国', shortName:'域外方', color:'#00b4d8', icon:'⚔️', desc:'挑战中国南海主张，维持军事存在' },
  },
  border_india: {
    red: { id:'china', name:'中国', shortName:'中方', color:'#ff4757', icon:'🇨🇳', desc:'维护边境和平稳定，管控分歧' },
    blue: { id:'india', name:'印度', shortName:'印方', color:'#00b4d8', icon:'⚔️', desc:'蚕食边境领土，谋求单方面改变现状' },
  },
  eco_sanctions: {
    red: { id:'china', name:'中国', shortName:'中方', color:'#ff4757', icon:'🇨🇳', desc:'突破技术封锁，维护经济安全' },
    blue: { id:'us_alliance', name:'美西方联盟', shortName:'美方', color:'#00b4d8', icon:'⚔️', desc:'遏制中国高科技发展，维持技术霸权' },
  },
  cyber_attack: {
    red: { id:'china', name:'中国', shortName:'中方', color:'#ff4757', icon:'🇨🇳', desc:'保护关键基础设施，溯源反制网络攻击' },
    blue: { id:'apt_sponsor', name:'高级持续性威胁组织(国家级)', shortName:'攻击方', color:'#a29bfe', icon:'💻', desc:'对华实施持续网络渗透和破坏', nonStateActor:true },
  },
  hybrid_warfare: {
    red: { id:'china', name:'中国', shortName:'中方', color:'#ff4757', icon:'🇨🇳', desc:'综合应对多域混合威胁' },
    blue: { id:'hybrid_actor', name:'混合战争发起方', shortName:'混合方', color:'#a29bfe', icon:'🎭', desc:'多域协同施压，代理人骚扰', nonStateActor:true },
  },
  middle_east: {
    red: { id:'china', name:'中国', shortName:'中方', color:'#ff4757', icon:'🇨🇳', desc:'维护能源安全和侨民安全' },
    blue: { id:'regional_actor', name:'地区冲突方', shortName:'地区方', color:'#ffa502', icon:'⚔️', desc:'引发地区动荡，威胁能源通道' },
  },
  hormuz: {
    red: { id:'china', name:'中国', shortName:'中方', color:'#ff4757', icon:'🇨🇳', desc:'保障能源通道安全，维护航行自由' },
    blue: { id:'iran_proxies', name:'伊朗及其代理人', shortName:'封锁方', color:'#00b4d8', icon:'⚔️', desc:'以海峡封锁为要挟，制造能源危机' },
  },
  indo_pacific: {
    red: { id:'china', name:'中国', shortName:'中方', color:'#ff4757', icon:'🇨🇳', desc:'突破战略围堵，维护发展空间' },
    blue: { id:'quad', name:'Quad联盟', shortName:'四方方', color:'#00b4d8', icon:'⚔️', desc:'构建对华战略包围圈' },
  },
  rare_earth: {
    red: { id:'china', name:'中国', shortName:'中方', color:'#ff4757', icon:'🇨🇳', desc:'维护产业链主导权，反制去中国化' },
    blue: { id:'us_supply', name:'替代供应联盟', shortName:'替代方', color:'#00b4d8', icon:'⚔️', desc:'建立替代供应体系，摆脱对华依赖' },
  },
  space_domain: {
    red: { id:'china', name:'中国', shortName:'中方', color:'#ff4757', icon:'🇨🇳', desc:'保护太空资产，维护轨道权益' },
    blue: { id:'us_space', name:'某大国太空军', shortName:'太空方', color:'#00b4d8', icon:'🛰️', desc:'太空军事化部署，轨道资源争夺' },
  },
  ai_race: {
    red: { id:'china', name:'中国', shortName:'中方', color:'#ff4757', icon:'🇨🇳', desc:'突破芯片封锁，发展人工智能自主能力' },
    blue: { id:'us_tech', name:'美西方科技联盟', shortName:'科技方', color:'#00b4d8', icon:'💻', desc:'技术封锁遏制，维持人工智能代差优势' },
  },
  finance_war: {
    red: { id:'china', name:'中国', shortName:'中方', color:'#ff4757', icon:'🇨🇳', desc:'推进人民币国际化，应对金融制裁' },
    blue: { id:'us_finance', name:'某大国金融体系', shortName:'金融方', color:'#00b4d8', icon:'💰', desc:'金融武器化，维持美元霸权' },
  },
  arctic: {
    red: { id:'china', name:'中国', shortName:'中方', color:'#ff4757', icon:'🇨🇳', desc:'维护北极权益，参与极地治理' },
    blue: { id:'arctic_states', name:'北极国家联盟', shortName:'北极方', color:'#00b4d8', icon:'❄️', desc:'排斥中国参与，垄断北极事务' },
  },
  digital_sovereignty: {
    red: { id:'china', name:'中国', shortName:'中方', color:'#ff4757', icon:'🇨🇳', desc:'维护数字主权，保障数据安全' },
    blue: { id:'us_digital', name:'某大国数字霸权', shortName:'数字方', color:'#00b4d8', icon:'🌐', desc:'主导全球数字治理框架' },
  },
  /* === 新增场景阵营 (16-30) === */
  diaoyu: {
    red: { id:'china', name:'中国', shortName:'中方', color:'#ff4757', icon:'🇨🇳', desc:'维护钓鱼岛主权，常态化巡航维权' },
    blue: { id:'japan_us', name:'日美同盟', shortName:'日美方', color:'#00b4d8', icon:'⚔️', desc:'强化实际控制，挑衅中国主权' },
  },
  korean_peninsula: {
    red: { id:'china', name:'中国', shortName:'中方', color:'#ff4757', icon:'🇨🇳', desc:'维护半岛稳定，管控核扩散风险' },
    blue: { id:'us_sk', name:'美韩联盟', shortName:'美韩方', color:'#00b4d8', icon:'⚔️', desc:'加强军事存在，施压朝鲜' },
  },
  myanmar: {
    red: { id:'china', name:'中国', shortName:'中方', color:'#ff4757', icon:'🇨🇳', desc:'维护边境安全，推动和平进程' },
    blue: { id:'border_armed', name:'边境武装冲突方', shortName:'冲突方', color:'#ffa502', icon:'⚔️', desc:'内战外溢威胁边境，代理人渗透制造动荡' },
  },
  afghanistan: {
    red: { id:'china', name:'中国', shortName:'中方', color:'#ff4757', icon:'🇨🇳', desc:'维护西部安全，参与重建' },
    blue: { id:'terror_groups', name:'恐怖组织', shortName:'恐袭方', color:'#a29bfe', icon:'☠️', desc:'利用混乱扩大恐怖活动', nonStateActor:true },
  },
  horn_africa: {
    red: { id:'china', name:'中国', shortName:'中方', color:'#ff4757', icon:'🇨🇳', desc:'保护海外利益，维护海上通道' },
    blue: { id:'us_regional', name:'某大国+地区方', shortName:'竞争方', color:'#00b4d8', icon:'⚔️', desc:'争夺战略据点和影响力' },
  },
  venezuela: {
    red: { id:'china', name:'中国', shortName:'中方', color:'#ff4757', icon:'🇨🇳', desc:'维护能源利益和战略伙伴关系' },
    blue: { id:'us_latam', name:'某大国+反对派', shortName:'干预方', color:'#00b4d8', icon:'⚔️', desc:'干预拉美事务，推翻友好政权' },
  },
  biosecurity: {
    red: { id:'china', name:'中国', shortName:'中方', color:'#ff4757', icon:'🇨🇳', desc:'保障生物安全，维护人民健康' },
    blue: { id:'bio_threat', name:'生物威胁源', shortName:'威胁方', color:'#a29bfe', icon:'🦠', desc:'疑似实验室泄漏或蓄意释放', nonStateActor:true },
  },
  nuclear_prolif: {
    red: { id:'china', name:'中国', shortName:'中方', color:'#ff4757', icon:'🇨🇳', desc:'维护核不扩散体系，保障核威慑' },
    blue: { id:'nuclear_states', name:'核扩散方', shortName:'扩散方', color:'#ff6348', icon:'☢️', desc:'谋求核武器突破' },
  },
  deep_sea: {
    red: { id:'china', name:'中国', shortName:'中方', color:'#ff4757', icon:'🇨🇳', desc:'维护深海权益和海底设施安全' },
    blue: { id:'us_deepsea', name:'某大国深海力量', shortName:'深海方', color:'#00b4d8', icon:'🌊', desc:'海底军事部署和资源争夺' },
  },
  climate_security: {
    red: { id:'china', name:'中国', shortName:'中方', color:'#ff4757', icon:'🇨🇳', desc:'推进双碳目标，维护发展权' },
    blue: { id:'us_climate', name:'某大国气候联盟', shortName:'施压方', color:'#00b4d8', icon:'🌡️', desc:'以气候议题施压中国发展' },
  },
  food_security: {
    red: { id:'china', name:'中国', shortName:'中方', color:'#ff4757', icon:'🇨🇳', desc:'确保14亿人粮食安全和种业自主' },
    blue: { id:'food_cartel', name:'粮食垄断方', shortName:'垄断方', color:'#ffa502', icon:'🌾', desc:'控制全球粮食供应链施压' },
  },
  supply_chain: {
    red: { id:'china', name:'中国', shortName:'中方', color:'#ff4757', icon:'🇨🇳', desc:'构建韧性供应链，反制断链' },
    blue: { id:'us_decouple', name:'断链联盟', shortName:'断链方', color:'#00b4d8', icon:'⛓️', desc:'推动供应链去中国化' },
  },
  cognitive_war: {
    red: { id:'china', name:'中国', shortName:'中方', color:'#ff4757', icon:'🇨🇳', desc:'维护认知安全，抵御舆论渗透' },
    blue: { id:'us_cognitive', name:'认知作战方', shortName:'认知方', color:'#a29bfe', icon:'🧠', desc:'发动认知域作战操纵舆论', nonStateActor:true },
  },
  nato_expansion: {
    red: { id:'china', name:'中国', shortName:'中方', color:'#ff4757', icon:'🇨🇳', desc:'反制北约东扩，维护欧亚安全' },
    blue: { id:'nato', name:'北约联盟', shortName:'北约方', color:'#00b4d8', icon:'⚔️', desc:'持续东扩并介入亚太事务' },
  },
  east_china_sea: {
    red: { id:'china', name:'中国', shortName:'中方', color:'#ff4757', icon:'🇨🇳', desc:'维护东海防空识别区，管控空防' },
    blue: { id:'japan_us_air', name:'日美空中力量', shortName:'日美方', color:'#00b4d8', icon:'✈️', desc:'频繁抵近侦察挑衅' },
  },
  /* === 新增场景阵营 (31-38) === */
  strait_of_malacca: {
    red: { id:'china', name:'中国', shortName:'中方', color:'#ff4757', icon:'🇨🇳', desc:'保障马六甲通道安全，推进多元化航线' },
    blue: { id:'us_navy', name:'某大国海军联盟', shortName:'封锁方', color:'#00b4d8', icon:'⚓', desc:'控制海峡咽喉，威慑能源通道' },
  },
  quantum_tech: {
    red: { id:'china', name:'中国', shortName:'中方', color:'#ff4757', icon:'🇨🇳', desc:'抢占量子科技制高点，突破技术封锁' },
    blue: { id:'us_quantum', name:'某大国量子联盟', shortName:'量子方', color:'#a29bfe', icon:'🔬', desc:'争夺量子霸权，实施技术封锁' },
  },
  water_security: {
    red: { id:'china', name:'中国', shortName:'中方', color:'#ff4757', icon:'🇨🇳', desc:'维护上游水资源主权，统筹跨境河流开发利用' },
    blue: { id:'downstream', name:'下游国家联盟', shortName:'下游方', color:'#00b4d8', icon:'💧', desc:'担忧上游水利影响，联合施压水资源议题' },
  },
  polar_silk_road: {
    red: { id:'china', name:'中国', shortName:'中方', color:'#ff4757', icon:'🇨🇳', desc:'建设冰上丝绸之路，参与极地治理' },
    blue: { id:'western_arctic', name:'西方北极联盟', shortName:'排他方', color:'#00b4d8', icon:'❄️', desc:'排斥中俄参与，垄断北极航道和资源' },
  },
  maritime_militia: {
    red: { id:'china', name:'中国', shortName:'中方', color:'#ff4757', icon:'🇨🇳', desc:'维护海上权益，管控灰色地带摩擦' },
    blue: { id:'us_grayzone', name:'灰色地带施压方', shortName:'施压方', color:'#00b4d8', icon:'🚤', desc:'以非军事力量进行灰色施压' },
  },
  space_debris: {
    red: { id:'china', name:'中国', shortName:'中方', color:'#ff4757', icon:'🇨🇳', desc:'保护在轨资产，维护太空安全' },
    blue: { id:'us_spaceforce', name:'某大国太空力量', shortName:'太空方', color:'#a29bfe', icon:'🛰️', desc:'反卫星试验和轨道资源抢占' },
  },
  bio_data: {
    red: { id:'china', name:'中国', shortName:'中方', color:'#ff4757', icon:'🇨🇳', desc:'保护国民基因数据安全，防范生物风险' },
    blue: { id:'bio_intel', name:'境外情报与生物公司', shortName:'窃取方', color:'#a29bfe', icon:'🧬', desc:'以科研合作为名窃取基因数据', nonStateActor:true },
  },
  energy_transition: {
    red: { id:'china', name:'中国', shortName:'中方', color:'#ff4757', icon:'🇨🇳', desc:'保障能源转型安全，突破绿色壁垒' },
    blue: { id:'us_green', name:'某大国绿色联盟', shortName:'壁垒方', color:'#00b4d8', icon:'🌱', desc:'以碳关税和技术标准重塑能源格局' },
  },
};

/* 默认阵营（如果场景未在SCENARIO_SIDES中定义） */
const DEFAULT_SIDES = {
  red: { id:'china', name:'中国', shortName:'中方', color:'#ff4757', icon:'🇨🇳', desc:'维护国家核心利益' },
  blue: { id:'opponent', name:'对手方', shortName:'对手', color:'#00b4d8', icon:'⚔️', desc:'挑战方' },
};

/* 获取场景的阵营定义 */
function getScenarioSides(scenarioId){
  return SCENARIO_SIDES[scenarioId] || DEFAULT_SIDES;
}

/* ===== 六域状态（态势总览用） ===== */
const DOMAINS = [
  { id:'military',  name:'军事安全', code:'军事',  icon:'⚔️', color:'#ff4757',
    readiness:86, trend:2, activeOps:12, threatLevel:4,
    metrics:{ 部署率:'50%', 战备等级:'德尔塔级', 作战单位:'4个军种' } },
  { id:'economic',  name:'经济安全', code:'经济',  icon:'📊', color:'#ffa502',
    readiness:65, trend:-2, activeOps:8, threatLevel:3,
    metrics:{ 经济增速:'+5.2%', 活跃制裁:'6项活跃制裁', 外汇储备:'3.2万亿美元' } },
  { id:'cyber',     name:'网络空间', code:'网络',  icon:'🌐', color:'#00b4d8',
    readiness:85, trend:3, activeOps:24, threatLevel:4,
    metrics:{ 攻击频次:'1,247次/日', 防御成功率:'97.3%', 监控节点:'8,420' } },
  { id:'diplomatic',name:'外交战线', code:'外交',  icon:'🤝', color:'#2ed573',
    readiness:71, trend:0, activeOps:6, threatLevel:3,
    metrics:{ 盟友:'47国', 进行中峰会:'3场进行中', 执行中条约:'12项执行中' } },
  { id:'space',     name:'太空安全', code:'太空',  icon:'🛰️', color:'#a29bfe',
    readiness:82, trend:4, activeOps:5, threatLevel:3,
    metrics:{ 在轨卫星:'在轨412颗', 太空碎片:'追踪8,732个', 本月发射:'本月3次' } },
  { id:'information',name:'信息舆论', code:'信息', icon:'📡', color:'#ff6348',
    readiness:80, trend:2, activeOps:9, threatLevel:4,
    metrics:{ 覆盖范围:'覆盖23国', 舆论态势:'正面62%', 进行中行动:'4场进行中' } },
];

/* ===== 活跃威胁列表（14个，覆盖六域） ===== */
const THREATS = [
  /* 军事域 */
  { id:'T-001', title:'台海方向兵力集结', location:'台湾海峡', severity:5,
    type:'military', time:'12分钟前', status:'escalating',
    desc:'探测到敌方航母战斗群进入预设海域，舰载机活动频繁' },
  { id:'T-002', title:'南海争议海域钻探', location:'万安滩附近', severity:4,
    type:'military', time:'47分钟前', status:'monitoring',
    desc:'某声索国钻井平台已就位，护卫舰编队护航中' },
  { id:'T-004', title:'边境兵力异常调动', location:'中印实控线', severity:3,
    type:'military', time:'2小时前', status:'monitoring',
    desc:'印方在争议地区增兵约3,000人，工程活动加速' },
  { id:'T-007', title:'东海防空识别区入侵', location:'东海防空识别区', severity:4,
    type:'military', time:'25分钟前', status:'active',
    desc:'探测到多批不明军机进入防空识别区，已起飞战机拦截' },
  /* 网络域 */
  { id:'T-003', title:'大规模高级持续性威胁攻击探测', location:'全国多节点', severity:4,
    type:'cyber', time:'1小时前', status:'active',
    desc:'关键信息基础设施遭受协同攻击，溯源分析进行中' },
  { id:'T-008', title:'金融系统网络渗透', location:'银行结算系统', severity:4,
    type:'cyber', time:'35分钟前', status:'escalating',
    desc:'检测到针对银行结算系统的渗透行为，交易异常波动' },
  /* 经济域 */
  { id:'T-005', title:'芯片出口管制升级', location:'全球供应链', severity:3,
    type:'economic', time:'3小时前', status:'active',
    desc:'某大国将14nm以下制程设备纳入管制清单，影响12家中国企业' },
  { id:'T-009', title:'能源进口通道受阻', location:'马六甲海峡', severity:4,
    type:'economic', time:'1小时前', status:'active',
    desc:'域外海军力量在马六甲海峡加强检查，油轮通行延迟48小时' },
  { id:'T-010', title:'稀土供应链围堵', location:'多国联动', severity:3,
    type:'economic', time:'5小时前', status:'monitoring',
    desc:'某大国联合盟友建立稀土替代供应链，试图削弱中国定价权' },
  /* 外交域 */
  { id:'T-011', title:'多边联盟围堵升级', location:'印太地区', severity:4,
    type:'diplomatic', time:'50分钟前', status:'escalating',
    desc:'某大国推动印太安全联盟扩员，拟将4国纳入联合军演框架' },
  { id:'T-012', title:'国际组织话语权挤压', location:'联合国体系', severity:3,
    type:'diplomatic', time:'2小时前', status:'active',
    desc:'某大国在多个国际组织推动涉华提案，试图重塑规则话语权' },
  /* 太空域 */
  { id:'T-013', title:'在轨侦察卫星抵近', location:'地球同步轨道', severity:4,
    type:'space', time:'18分钟前', status:'active',
    desc:'探测到3颗异常轨道卫星抵近我方通信卫星，疑为侦察干扰平台' },
  { id:'T-014', title:'GPS欺骗攻击', location:'西北地区', severity:3,
    type:'space', time:'1小时前', status:'monitoring',
    desc:'西北多地的导航信号出现异常偏移，疑遭卫星导航欺骗攻击' },
  /* 信息域 */
  { id:'T-006', title:'舆论操纵活动检测', location:'社交媒体平台', severity:3,
    type:'information', time:'4小时前', status:'active',
    desc:'检测到协调性虚假信息传播，目标为涉华议题' },
];

/* ===== 指挥时间线 ===== */
const TIMELINE = [
  { time:'01:23', type:'cyber',    title:'网络防御警报', desc:'检测到针对能源系统的高级持续性威胁攻击，已启动应急响应' },
  { time:'00:45', type:'military', title:'兵力部署指令', desc:'东部战区提升战备等级至德尔塔级，海军前出部署' },
  { time:'23:30', type:'intel',    title:'情报更新', desc:'信号情报确认敌方双航母编队进入南海海域' },
  { time:'22:15', type:'diplomatic',title:'外交照会', desc:'已向相关国家发出严正交涉，要求停止挑衅行为' },
  { time:'21:00', type:'economic', title:'经济反制启动', desc:'启动稀土出口管制预案，对等反制清单已拟定' },
  { time:'20:30', type:'space',    title:'太空态势更新', desc:'探测到3颗异常轨道卫星，疑为侦察平台' },
  { time:'19:00', type:'intel',    title:'情报更新', desc:'人力情报确认敌方将于72小时内举行联合军演' },
];

/* ===== 力量战备（推演引擎引用） ===== */
const FORCES = [
  /* 传统作战力量 */
  { branch:'陆军', code:'陆军', icon:'🎖️', readiness:85, trend:2,
    personnel:'85万', equipment:'6,300辆坦克 / 4,800门火炮 / 1,200架直升机', deployment:'5个战区', status:'ready',
    domain:'military' },
  { branch:'海军', code:'海军', icon:'⚓', readiness:72, trend:5,
    personnel:'30万', equipment:'3艘航母 / 48艘驱逐舰 / 78艘潜艇', deployment:'三大舰队', status:'deployed',
    domain:'military' },
  { branch:'空军', code:'空军', icon:'✈️', readiness:90, trend:1,
    personnel:'40万', equipment:'3,200架各型飞机 / 含歼-20/轰-6K', deployment:'5个战区空军', status:'ready',
    domain:'military' },
  { branch:'火箭军', code:'火箭军', icon:'🚀', readiness:95, trend:0,
    personnel:'12万', equipment:'1,200+发射单元 / 东风/长剑系列', deployment:'全域覆盖', status:'high_alert',
    domain:'military' },
  /* 新型作战力量（2024年军改后由战略支援部队拆分） */
  { branch:'军事航天部队', code:'军事航天', icon:'🛰️', readiness:82, trend:4,
    personnel:'5万', equipment:'412颗在轨卫星 / 北斗导航 / 空间站', deployment:'全域部署', status:'active',
    domain:'space' },
  { branch:'网络空间部队', code:'网络空间', icon:'🌐', readiness:85, trend:3,
    personnel:'5万', equipment:'网络攻防系统 / 溯源平台 / 蜜罐网络', deployment:'全域网络战场', status:'active',
    domain:'cyber' },
  { branch:'信息支援部队', code:'信息支援', icon:'📡', readiness:80, trend:2,
    personnel:'5万', equipment:'电子战系统 / 通信中继 / 频谱管控', deployment:'全域伴随保障', status:'active',
    domain:'information' },
  /* 保障力量 */
  { branch:'联勤保障部队', code:'联勤保障', icon:'🚚', readiness:78, trend:1,
    personnel:'15万', equipment:'战略投送 / 仓储物流 / 医疗保障', deployment:'五大联勤保障中心', status:'ready',
    domain:'logistics' },
  /* 国内安全力量 */
  { branch:'武警部队', code:'武警', icon:'🛡️', readiness:88, trend:-1,
    personnel:'56万', equipment:'轻装/机动/特战/反恐', deployment:'全国部署', status:'ready',
    domain:'domestic' },
  { branch:'海警局', code:'海警局', icon:'🚢', readiness:86, trend:2,
    personnel:'10万', equipment:'大型海警船/执法快艇/直升机', deployment:'四海区巡航', status:'deployed',
    domain:'maritime_enforcement' },
  { branch:'民兵预备役', code:'民兵预备役', icon:'🪖', readiness:70, trend:0,
    personnel:'800万', equipment:'轻武器/防空/工程/通信', deployment:'全国编组', status:'ready',
    domain:'domestic_reserve' },
];

/* ===== 动态联动：根据 FORCES / STATE 实际数据更新 DOMAINS 指标 ===== */
(function syncDomainMetrics(){
  if(!FORCES || !DOMAINS) return;

  /* --- 军事安全域（DOMAINS[0]）--- */
  const milForces = FORCES.filter(f => f.domain === 'military');
  const milDeployed = milForces.filter(f => f.status === 'deployed' || f.status === 'high_alert').length;
  const milDeployPct = milForces.length ? Math.round(milDeployed / milForces.length * 100) : 0;
  const milAvgReadiness = milForces.length ? Math.round(milForces.reduce((s,f) => s + f.readiness, 0) / milForces.length) : 0;
  const milAvgTrend = milForces.length ? Math.round(milForces.reduce((s,f) => s + (f.trend||0), 0) / milForces.length) : 0;
  const defconLabel = STATE.defcon <= 2 ? '查理级' : STATE.defcon === 3 ? '德尔塔级' : '回声级';
  DOMAINS[0].readiness = milAvgReadiness;
  DOMAINS[0].trend = milAvgTrend;
  DOMAINS[0].metrics = {
    部署率: milDeployPct + '%',
    战备等级: defconLabel,
    作战单位: milForces.length + '个军种'
  };

  /* --- 网络空间域（DOMAINS[2]）--- */
  const cyberForce = FORCES.find(f => f.domain === 'cyber');
  if(cyberForce){
    DOMAINS[2].readiness = cyberForce.readiness;
    DOMAINS[2].trend = cyberForce.trend;
    DOMAINS[2].metrics = {
      攻击频次: '1,247次/日',
      防御成功率: '97.3%',
      监控节点: '8,420'
    };
  }

  /* --- 太空安全域（DOMAINS[4]）--- */
  const spaceForce = FORCES.find(f => f.domain === 'space');
  if(spaceForce){
    DOMAINS[4].readiness = spaceForce.readiness;
    DOMAINS[4].trend = spaceForce.trend;
    DOMAINS[4].metrics = {
      在轨卫星: '在轨412颗',
      太空碎片: '追踪8,732个',
      本月发射: '本月3次'
    };
  }

  /* --- 信息舆论域（DOMAINS[5]）--- */
  const infoForce = FORCES.find(f => f.domain === 'information');
  if(infoForce){
    DOMAINS[5].readiness = infoForce.readiness;
    DOMAINS[5].trend = infoForce.trend;
    DOMAINS[5].metrics = {
      覆盖范围: '覆盖23国',
      舆论态势: '正面62%',
      进行中行动: DOMAINS[5].activeOps + '场进行中'
    };
  }

  /* --- 经济安全域（DOMAINS[1]）：无直接 FORCES 对应，保持独立指标 --- */
  /* 经济域数据来源于宏观经济指标，非军事力量，保持初始值不变 */

  /* --- 外交战线域（DOMAINS[3]）：无直接 FORCES 对应，保持独立指标 --- */
  /* 外交域数据来源于国际关系指标，非军事力量，保持初始值不变 */
})();

/* ===== 情报流（推演引擎引用） ===== */
const INTEL = [
  { time:'01:30', source:'信号情报', type:'cyber', reliability:'A',
    title:'敌方网络战部队频繁通信', summary:'截获大量加密通信，分析指向网络战指挥中心，攻击窗口预计48小时内',
    modifier:{ domain:'cyber', bonus:8 } },
  { time:'00:52', source:'开源情报', type:'military', reliability:'B',
    title:'卫星图像显示航母出港', summary:'商业卫星拍摄到敌方航母离开母港，航向西南，预计72小时后抵达作战海域',
    modifier:{ domain:'military', bonus:6 } },
  { time:'23:45', source:'人力情报', type:'diplomatic', reliability:'A',
    title:'某国外交官私下表态', summary:'据可靠渠道，某国将在本周五宣布新一轮制裁措施，目标为半导体领域',
    modifier:{ domain:'diplomatic', bonus:5 } },
  { time:'22:30', source:'图像情报', type:'military', reliability:'A',
    title:'边境地区基建加速', summary:'侦察卫星确认印方在争议地区修建3条新公路和2处前沿阵地，施工速度显著加快',
    modifier:{ domain:'military', bonus:7 } },
  { time:'21:15', source:'开源情报', type:'information', reliability:'B',
    title:'社交媒体异常活动', summary:'检测到7,500个协调账号集中发布涉华负面内容，溯源分析进行中',
    modifier:{ domain:'information', bonus:4 } },
  { time:'20:00', source:'信号情报', type:'space', reliability:'A',
    title:'异常卫星变轨信号', summary:'探测到3颗敌方侦察卫星执行变轨机动，新轨道可覆盖我方中部战区',
    modifier:{ domain:'space', bonus:6 } },
  { time:'18:30', source:'人力情报', type:'economic', reliability:'C',
    title:'稀土替代供应谈判', summary:'据消息人士，某国正与澳大利亚加速谈判稀土替代供应协议，预计3个月内达成',
    modifier:{ domain:'economic', bonus:3 } },
];

/* ===== 域名映射 ===== */
const DOMAIN_MAP = {
  military:           { label:'军事',   color:'#ff4757', icon:'⚔️' },
  economic:           { label:'经济',   color:'#ffa502', icon:'📊' },
  cyber:              { label:'网络',   color:'#00b4d8', icon:'🌐' },
  diplomatic:         { label:'外交',   color:'#2ed573', icon:'🤝' },
  space:              { label:'太空',   color:'#a29bfe', icon:'🛰️' },
  information:        { label:'信息',   color:'#ff6348', icon:'📡' },
  intel:              { label:'情报',   color:'#2196f3', icon:'🔍' },
  logistics:          { label:'后勤',   color:'#26c6da', icon:'🚚' },
  domestic:           { label:'国内',   color:'#66bb6a', icon:'🛡️' },
  maritime_enforcement:{ label:'海警',  color:'#42a5f5', icon:'🚢' },
  domestic_reserve:   { label:'预备役', color:'#78909c', icon:'🪖' },
};

/* ===== 功能模块（与推演引擎联动） =====
 * 每个模块提供域修正加成，影响推演中对应域行动的成功率
 * 修正公式: (readiness - 50) × modRate × 0.5
 */
const MODULES = [
  {
    id:'diplomatic', name:'外交战略中心', icon:'🤝', color:'#2ed573',
    readiness:71, trend:2, status:'active',
    desc:'统筹外交资源、多边机制和使领馆网络，为推演提供外交域修正',
    modDomain:'diplomatic', modRate:0.4,
    resources:[
      { name:'战略伙伴关系', value:'19国', detail:'全面战略伙伴10国' },
      { name:'多边机制参与', value:'12项', detail:'上合/金砖/区域全面经济伙伴关系协定/金砖国家+' },
      { name:'驻外机构', value:'276个', detail:'覆盖173个国家' },
      { name:'条约执行', value:'8项', detail:'双边引渡/司法协助' },
    ],
    operations:[
      { name:'中东和平斡旋', status:'进行中', priority:'高', progress:65 },
      { name:'区域全面经济伙伴关系协定深化推进', status:'执行中', priority:'中', progress:80 },
      { name:'中非合作论坛筹备', status:'筹备中', priority:'中', progress:30 },
      { name:'拉美伙伴关系拓展', status:'规划中', priority:'低', progress:15 },
    ],
    wargameBonus:3, /* 推演修正: 外交行动成功率+(readiness-50)*0.4*0.5 */
  },
  {
    id:'economic', name:'经济战备中心', icon:'📊', color:'#ffa502',
    readiness:65, trend:-1, status:'active',
    desc:'监控经济安全指标、制裁反制工具箱和金融防线，为推演提供经济域修正',
    modDomain:'economic', modRate:0.4,
    resources:[
      { name:'外汇储备', value:'3.2万亿美元', detail:'可动用2.1万亿' },
      { name:'制裁反制清单', value:'47项', detail:'已激活12项' },
      { name:'跨境支付系统', value:'覆盖106国', detail:'日均清算4200亿' },
      { name:'战略物资储备', value:'38类', detail:'稀土/石油/粮食' },
    ],
    operations:[
      { name:'稀土出口管制预案', status:'待激活', priority:'高', progress:90 },
      { name:'人民币国际化推进', status:'执行中', priority:'高', progress:55 },
      { name:'供应链韧性评估', status:'进行中', priority:'中', progress:70 },
      { name:'数字货币试点', status:'执行中', priority:'中', progress:45 },
    ],
    wargameBonus:2,
  },
  {
    id:'tech', name:'科技战备中心', icon:'🔬', color:'#00b4d8',
    readiness:68, trend:4, status:'active',
    desc:'追踪前沿科技竞争态势、技术封锁与突破进展，为推演提供网络/科技域修正',
    modDomain:'cyber', modRate:0.35,
    resources:[
      { name:'研发投入', value:'3.3万亿', detail:'占国内生产总值2.6%' },
      { name:'专利保有', value:'420万件', detail:'国际专利合作条约申请全球第一' },
      { name:'人才储备', value:'180万', detail:'理工科博士年毕业6.8万' },
      { name:'关键技术攻关', value:'35项', detail:'芯片/人工智能/量子/生物' },
    ],
    operations:[
      { name:'14nm芯片量产', status:'已达成', priority:'高', progress:100 },
      { name:'7nm工艺攻关', status:'进行中', priority:'高', progress:75 },
      { name:'人工智能大模型国产化', status:'执行中', priority:'高', progress:80 },
      { name:'量子计算原型机', status:'进行中', priority:'中', progress:60 },
    ],
    wargameBonus:3,
  },
  {
    id:'logistics', name:'后勤保障中心', icon:'🚚', color:'#a29bfe',
    readiness:74, trend:1, status:'active',
    desc:'管理战略投送、物资补给和军事物流体系，为推演提供军事域后勤修正',
    modDomain:'military', modRate:0.3,
    resources:[
      { name:'战略投送', value:'运20×28架', detail:'海上投送12万吨' },
      { name:'战备物资', value:'6大类', detail:'弹药/油料/给养/医疗/器材/备件' },
      { name:'军事物流网', value:'5大战区', detail:'42个综合保障基地' },
      { name:'民船动员', value:'1,200艘', detail:'滚装/散货/油轮' },
    ],
    operations:[
      { name:'台海方向战备物资前置', status:'执行中', priority:'高', progress:85 },
      { name:'南海岛礁补给链优化', status:'进行中', priority:'高', progress:70 },
      { name:'中印边境冬季补给', status:'执行中', priority:'高', progress:90 },
      { name:'远洋综合保障体系', status:'建设中', priority:'中', progress:40 },
    ],
    wargameBonus:3,
  },
];

/* ===== 全局暴露（供其他脚本和Node.js测试使用） ===== */
if(typeof window !== 'undefined'){
  window.USER = USER; window.STATE = STATE; window.SCENARIOS = SCENARIOS;
  window.SCENARIO_SIDES = SCENARIO_SIDES; window.FORCES = FORCES; window.INTEL = INTEL;
  window.DOMAIN_MAP = DOMAIN_MAP; window.MODULES = MODULES;
  window.THREATS = THREATS; window.TIMELINE = TIMELINE;
  window.DOMAINS = DOMAINS; window.DEFAULT_SIDES = DEFAULT_SIDES;
}
