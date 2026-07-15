/* ================================================================
 * NSS-WGS v9.2 — 全球动态态势图（可交互决策版）
 * 功能：交互式热点+力量标记 / AI战略研判 / 关键威胁TOP3 / 
 *       力量覆盖分析 / 行动建议 / 威胁时间线
 * ================================================================ */

/* ===== 热点详情库（按标签索引） ===== */
const HOTSPOT_DETAILS = {
  '台海': {
    summary: '某大国航母战斗群进入台海以东海域，舰载机活动频繁。台当局推进"渐进式台独"，局势持续升温。',
    escalation: 'critical', trend: 'up', lastUpdate: '12分钟前',
    escalationRisk: 92, coverage: 85,
    scenarios: ['taiwan_strait', 'indo_pacific'],
    actions: ['提升东部战区战备至德尔塔级', '启动海空联合巡航', '外交渠道发出最后警告'],
    intel: '信号情报截获敌方舰队加密通信，航向西南，预计48小时内抵达作战海域',
  },
  '南海': {
    summary: '某声索国在万安滩附近启动油气钻探，护卫舰编队护航。域外大国双航母进入南海，局势紧张。',
    escalation: 'high', trend: 'up', lastUpdate: '47分钟前',
    escalationRisk: 78, coverage: 72,
    scenarios: ['south_china_sea', 'indo_pacific'],
    actions: ['海警编队前出执法', '启动岛礁防御预案', '联合东盟外交斡旋'],
    intel: '卫星图像确认钻井平台已就位，护卫舰3艘伴随',
  },
  '霍尔木兹': {
    summary: '霍尔木兹海峡局势骤然升级，某大国大规模军事集结。中国40%原油进口经此通道，能源生命线受威胁。',
    escalation: 'critical', trend: 'up', lastUpdate: '52分钟前',
    escalationRisk: 88, coverage: 45,
    scenarios: ['hormuz', 'middle_east'],
    actions: ['启动护航编队前出', '启用陆上替代能源通道', '联合海湾国家外交协调'],
    intel: '油轮通行量下降37%，保险费率飙升300%',
  },
  '乌克兰': {
    summary: '俄乌冲突持续，北约东翼军事部署加强。波罗的海局势紧张，能源供应链受冲击。',
    escalation: 'high', trend: 'stable', lastUpdate: '3小时前',
    escalationRisk: 65, coverage: 30,
    scenarios: [],
    actions: ['加强北极监测', '推进能源进口多元化', '深化中俄战略协作'],
    intel: '北约向东翼增派4个营级战斗群',
  },
  '中印边境': {
    summary: '印方在争议地区加速基建，增兵约3000人。多个对峙点发生摩擦，局势有失控风险。',
    escalation: 'medium', trend: 'up', lastUpdate: '2小时前',
    escalationRisk: 55, coverage: 80,
    scenarios: ['border_india'],
    actions: ['西部战区增兵对峙', '加速边境基础设施建设', '恢复军长级会谈'],
    intel: '人力情报确认印方将在72小时内完成前沿阵地修建',
  },
  '南海争端': {
    summary: '南海声索国计划在争议海域举行联合军演，域外大国军事存在增加。',
    escalation: 'high', trend: 'up', lastUpdate: '1小时前',
    escalationRisk: 72, coverage: 68,
    scenarios: ['south_china_sea'],
    actions: ['加强岛礁监控', '海空联合巡逻', '外交抗议与谈判'],
    intel: '信号情报显示联合军演窗口为72小时内',
  },
  '北极航线': {
    summary: '北极冰盖消融加速，北方海航道通航期延长。北约强化北极军事存在。',
    escalation: 'low', trend: 'up', lastUpdate: '6小时前',
    escalationRisk: 35, coverage: 40,
    scenarios: ['arctic'],
    actions: ['加速破冰船建造', '推进北极科研部署', '深化中俄北极合作'],
    intel: '某大国在格陵兰部署新型雷达系统',
  },
  '朝鲜半岛': {
    summary: '朝鲜半岛局势微妙，某大国加强军事部署。核问题谈判陷入僵局。',
    escalation: 'medium', trend: 'stable', lastUpdate: '5小时前',
    escalationRisk: 50, coverage: 75,
    scenarios: [],
    actions: ['加强北部战区监控', '推进六方会谈重启', '深化中朝沟通'],
    intel: '卫星图像显示某大国增派2艘驱逐舰至日本海',
  },
  '拉美动荡': {
    summary: '拉美多国政治动荡加剧，某大国加强在拉美地区的影响力渗透。',
    escalation: 'low', trend: 'stable', lastUpdate: '8小时前',
    escalationRisk: 30, coverage: 20,
    scenarios: [],
    actions: ['加强拉美外交布局', '推进中拉经贸合作', '监控某大国军事渗透'],
    intel: '某大国在阿根廷建立军事设施的谈判正在进行',
  },
  '波罗的海': {
    summary: '波罗的海局势紧张，北约东翼军事部署加强。俄罗斯加里宁格勒军事活动增加。',
    escalation: 'medium', trend: 'stable', lastUpdate: '4小时前',
    escalationRisk: 48, coverage: 25,
    scenarios: [],
    actions: ['监控北约军事调动', '推进中欧班列替代路线', '深化中俄能源合作'],
    intel: '北约在波罗的海增派12架战斗机',
  },
  '马六甲': {
    summary: '马六甲海峡通行安全面临挑战，某大国在周边军事存在增加。中国80%海运贸易经此通道。',
    escalation: 'high', trend: 'up', lastUpdate: '1小时前',
    escalationRisk: 70, coverage: 55,
    scenarios: ['indo_pacific', 'hormuz'],
    actions: ['加强海警护航', '推进中巴经济走廊替代路线', '深化与马来西亚安全合作'],
    intel: '某大国在新加坡增派2艘濒海战斗舰',
  },
  '霍尔木兹海峡': {
    summary: '海峡控制权争夺白热化，某大国与伊朗军事对峙升级。',
    escalation: 'critical', trend: 'up', lastUpdate: '52分钟前',
    escalationRisk: 88, coverage: 45,
    scenarios: ['hormuz'],
    actions: ['启动护航编队', '启用陆上替代通道', '联合海湾国家协调'],
    intel: '油轮保险费率飙升300%，通行量下降37%',
  },
  '波斯湾': {
    summary: '波斯湾军事对峙持续，多国海军力量集结。',
    escalation: 'high', trend: 'stable', lastUpdate: '2小时前',
    escalationRisk: 68, coverage: 40,
    scenarios: ['middle_east', 'hormuz'],
    actions: ['护航编队保持战备', '能源储备应急启动', '外交协调海湾国家'],
    intel: '某大国第5舰队进入高度戒备状态',
  },
  '以色列': {
    summary: '巴以冲突外溢风险增加，中东局势复杂化。',
    escalation: 'medium', trend: 'stable', lastUpdate: '6小时前',
    escalationRisk: 52, coverage: 30,
    scenarios: ['middle_east'],
    actions: ['加强中东外交斡旋', '保护侨民安全', '能源进口多元化'],
    intel: '联合国安理会紧急会议正在进行',
  },
  '也门': {
    summary: '红海航运安全受胡塞武装威胁，商船遇袭事件增加。',
    escalation: 'medium', trend: 'up', lastUpdate: '5小时前',
    escalationRisk: 50, coverage: 25,
    scenarios: ['middle_east'],
    actions: ['海军护航红海航线', '启用绕行好望角航线', '加强与沙特协调'],
    intel: '过去7天发生12起商船遇袭事件',
  },
  '苏伊士运河': {
    summary: '苏伊士运河通行效率下降，受红海局势影响部分船舶绕行。',
    escalation: 'low', trend: 'stable', lastUpdate: '8小时前',
    escalationRisk: 32, coverage: 20,
    scenarios: ['middle_east'],
    actions: ['监控通行效率', '推进中欧班列替代', '多元化海运路线'],
    intel: '通行量下降15%，平均等待时间增加4小时',
  },
  '阿富汗': {
    summary: '阿富汗安全形势不稳定，恐怖组织活动增加，威胁周边安全。',
    escalation: 'medium', trend: 'stable', lastUpdate: '10小时前',
    escalationRisk: 45, coverage: 60,
    scenarios: [],
    actions: ['加强西部边境监控', '深化上合组织反恐合作', '推进中阿经济合作'],
    intel: '边境地区检测到武装分子活动迹象',
  },
  '哈萨克斯坦': {
    summary: '中亚地区大国博弈加剧，某大国加强在中亚军事存在。',
    escalation: 'low', trend: 'stable', lastUpdate: '12小时前',
    escalationRisk: 28, coverage: 65,
    scenarios: [],
    actions: ['深化中哈全面战略伙伴关系', '推进上合组织合作', '加强能源合作'],
    intel: '某大国在塔吉克斯坦建立军事基地谈判中',
  },
  '新疆边境': {
    summary: '边境安全形势总体稳定，但恐怖组织渗透风险持续存在。',
    escalation: 'low', trend: 'down', lastUpdate: '1天前',
    escalationRisk: 25, coverage: 85,
    scenarios: [],
    actions: ['保持边境管控力度', '深化邻国安全合作', '推进经济民生改善'],
    intel: '近30天未检测到异常活动',
  },
  '吉尔吉斯': {
    summary: '吉尔吉斯斯坦政治稳定，中吉安全合作深化。',
    escalation: 'low', trend: 'down', lastUpdate: '2天前',
    escalationRisk: 15, coverage: 70,
    scenarios: [],
    actions: ['推进中吉乌铁路建设', '深化上合合作', '加强边境联巡'],
    intel: '局势平稳，无异常',
  },
  '印巴争议': {
    summary: '克什米尔地区紧张持续，印巴双方在实控线附近交火。',
    escalation: 'medium', trend: 'stable', lastUpdate: '4小时前',
    escalationRisk: 48, coverage: 35,
    scenarios: [],
    actions: ['保持边境监控', '推进中巴经济走廊', '外交呼吁克制'],
    intel: '过去24小时发生3次交火事件',
  },
  '斯里兰卡': {
    summary: '斯里兰卡经济恢复中，中斯合作稳步推进。',
    escalation: 'low', trend: 'down', lastUpdate: '2天前',
    escalationRisk: 12, coverage: 50,
    scenarios: [],
    actions: ['推进汉班托塔港运营', '深化经贸合作', '加强印度洋存在'],
    intel: '局势平稳',
  },
  '藏南地区': {
    summary: '藏南地区主权争议持续，印方在争议地区基建加速。',
    escalation: 'medium', trend: 'up', lastUpdate: '3小时前',
    escalationRisk: 52, coverage: 78,
    scenarios: ['border_india'],
    actions: ['加强边防巡逻', '加速边境公路建设', '外交交涉'],
    intel: '卫星图像显示印方修建2条新公路',
  },
  '菲律宾': {
    summary: '菲律宾在南海争议海域活动增加，与域外大国联合巡逻。',
    escalation: 'medium', trend: 'up', lastUpdate: '2小时前',
    escalationRisk: 55, coverage: 60,
    scenarios: ['south_china_sea'],
    actions: ['海警执法', '外交交涉', '加强岛礁防御'],
    intel: '菲律宾海军2艘舰船在争议海域巡逻',
  },
  '印尼': {
    summary: '印尼在纳土纳群岛附近加强军事部署，与中国渔权争议持续。',
    escalation: 'low', trend: 'stable', lastUpdate: '1天前',
    escalationRisk: 30, coverage: 45,
    scenarios: [],
    actions: ['外交协商', '推进渔业合作', '加强海上沟通'],
    intel: '印尼增派1艘护卫舰至纳土纳群岛',
  },
  '越南': {
    summary: '越南在南海争议海域油气勘探活动持续，但总体可控。',
    escalation: 'low', trend: 'stable', lastUpdate: '1天前',
    escalationRisk: 28, coverage: 55,
    scenarios: [],
    actions: ['外交协商', '推进双边合作', '维护海上权益'],
    intel: '局势平稳',
  },
  '撒哈拉以南': {
    summary: '撒哈拉以南非洲恐怖主义活动增加，中国公民和资产安全面临威胁。',
    escalation: 'medium', trend: 'up', lastUpdate: '6小时前',
    escalationRisk: 42, coverage: 25,
    scenarios: [],
    actions: ['加强侨民安全保护', '推进联合国维和参与', '深化中非安全合作'],
    intel: '过去30天发生8起恐怖袭击事件',
  },
  '北非': {
    summary: '北非地区政治不稳定，利比亚局势持续动荡。',
    escalation: 'low', trend: 'stable', lastUpdate: '12小时前',
    escalationRisk: 30, coverage: 20,
    scenarios: [],
    actions: ['推进中非合作论坛', '保护侨民安全', '深化经贸合作'],
    intel: '利比亚冲突各方谈判陷入僵局',
  },
  '刚果': {
    summary: '刚果(金)东部冲突持续，关键矿产供应链受影响。',
    escalation: 'medium', trend: 'stable', lastUpdate: '8小时前',
    escalationRisk: 38, coverage: 15,
    scenarios: ['rare_earth'],
    actions: ['保护矿业投资', '推进联合国维和', '多元化矿产供应'],
    intel: '钴矿产量下降12%',
  },
  '南非': {
    summary: '南非政局稳定，金砖国家合作深化。',
    escalation: 'low', trend: 'down', lastUpdate: '2天前',
    escalationRisk: 10, coverage: 30,
    scenarios: [],
    actions: ['深化金砖合作', '推进中非经贸', '加强矿业合作'],
    intel: '局势平稳',
  },
  '西非': {
    summary: '西非地区政变频发，几内亚湾海盗活动增加。',
    escalation: 'medium', trend: 'up', lastUpdate: '10小时前',
    escalationRisk: 40, coverage: 15,
    scenarios: [],
    actions: ['加强侨民保护', '推进地区安全合作', '保护海上航线'],
    intel: '过去6个月发生4次政变',
  },
  '东非': {
    summary: '东非地区索马里安全形势略有改善，但恐怖威胁仍在。',
    escalation: 'low', trend: 'stable', lastUpdate: '1天前',
    escalationRisk: 25, coverage: 20,
    scenarios: [],
    actions: ['推进中非合作', '保护吉布提基地', '深化地区安全合作'],
    intel: '青年党活动范围缩小',
  },
  '巴西': {
    summary: '巴西政局稳定，中巴全面战略伙伴关系深化。',
    escalation: 'low', trend: 'down', lastUpdate: '2天前',
    escalationRisk: 12, coverage: 25,
    scenarios: [],
    actions: ['深化中拉合作', '推进矿业投资', '加强金砖协调'],
    intel: '局势平稳',
  },
  '阿根廷': {
    summary: '阿根廷经济困难，某大国试图建立军事设施。',
    escalation: 'low', trend: 'up', lastUpdate: '8小时前',
    escalationRisk: 28, coverage: 15,
    scenarios: [],
    actions: ['推进中阿经贸合作', '监控某大国军事渗透', '深化金砖合作'],
    intel: '某大国在乌斯怀亚建立军事设施的谈判中',
  },
  '委内瑞拉': {
    summary: '委内瑞拉政治危机持续，某大国加强干预。',
    escalation: 'medium', trend: 'stable', lastUpdate: '1天前',
    escalationRisk: 35, coverage: 10,
    scenarios: [],
    actions: ['推进中委石油合作', '外交呼吁和平解决', '监控局势'],
    intel: '某大国增派军事顾问',
  },
  '哥伦比亚': {
    summary: '哥伦比亚和平进程面临挑战，毒品问题持续。',
    escalation: 'low', trend: 'stable', lastUpdate: '2天前',
    escalationRisk: 22, coverage: 10,
    scenarios: [],
    actions: ['推进中拉合作', '加强禁毒合作', '保护侨民安全'],
    intel: '局势平稳',
  },
  '智利': {
    summary: '智利政局稳定，中智自贸协定深化。',
    escalation: 'low', trend: 'down', lastUpdate: '3天前',
    escalationRisk: 8, coverage: 15,
    scenarios: [],
    actions: ['深化中智经贸', '推进矿业合作', '加强太平洋联盟协调'],
    intel: '局势平稳',
  },
  '秘鲁': {
    summary: '秘鲁政治不稳定，矿业投资受影响。',
    escalation: 'low', trend: 'stable', lastUpdate: '2天前',
    escalationRisk: 25, coverage: 10,
    scenarios: [],
    actions: ['保护矿业投资', '推进中拉合作', '外交沟通'],
    intel: '铜矿产量下降8%',
  },
  '美国本土': {
    summary: '某大国本土推进印太战略，军事部署向太平洋倾斜。核力量现代化加速。',
    escalation: 'high', trend: 'up', lastUpdate: '3小时前',
    escalationRisk: 68, coverage: 35,
    scenarios: ['indo_pacific', 'ai_race'],
    actions: ['加强战略威慑', '推进多极化外交', '深化中俄协作'],
    intel: '某大国太平洋舰队增派2艘核潜艇',
  },
  '格陵兰': {
    summary: '某大国试图在格陵兰建立军事存在，北极博弈加剧。',
    escalation: 'low', trend: 'up', lastUpdate: '1天前',
    escalationRisk: 30, coverage: 25,
    scenarios: ['arctic'],
    actions: ['推进北极科研', '深化中俄北极合作', '监控某大国部署'],
    intel: '某大国在格陵兰雷达站建设谈判中',
  },
  '北约东翼': {
    summary: '北约东翼军事部署加强，对俄施压持续。',
    escalation: 'medium', trend: 'stable', lastUpdate: '5小时前',
    escalationRisk: 45, coverage: 20,
    scenarios: [],
    actions: ['深化中俄战略协作', '推进多极化', '监控北约调动'],
    intel: '北约增派4个营级战斗群至东翼',
  },
  '加拿大': {
    summary: '加拿大跟随某大国对华遏制政策，双边关系紧张。',
    escalation: 'low', trend: 'stable', lastUpdate: '2天前',
    escalationRisk: 25, coverage: 15,
    scenarios: [],
    actions: ['外交沟通', '推进经贸合作', '监控北极动向'],
    intel: '加拿大增加北极巡逻队规模',
  },
  '冰岛': {
    summary: '冰岛战略位置重要，北大西洋监控活动增加。',
    escalation: 'low', trend: 'stable', lastUpdate: '3天前',
    escalationRisk: 15, coverage: 10,
    scenarios: [],
    actions: ['推进北极科研', '监控北大西洋', '深化中冰合作'],
    intel: '局势平稳',
  },
  '东海': {
    summary: '东海方向某大国舰机抵近侦察频繁，中日钓鱼岛争端持续。',
    escalation: 'high', trend: 'up', lastUpdate: '1小时前',
    escalationRisk: 65, coverage: 82,
    scenarios: ['indo_pacific'],
    actions: ['海空联合巡逻', '提升东部战区战备', '外交交涉'],
    intel: '过去24小时检测到6次抵近侦察',
  },
  '澳新': {
    summary: '澳大利亚跟随某大国推进奥库斯联盟，核潜艇部署计划推进中。',
    escalation: 'low', trend: 'stable', lastUpdate: '1天前',
    escalationRisk: 30, coverage: 20,
    scenarios: ['indo_pacific'],
    actions: ['外交沟通', '推进区域全面经济伙伴关系协定合作', '监控奥库斯联盟部署'],
    intel: '奥库斯联盟核潜艇预计2027年开始部署',
  },
  '东南亚': {
    summary: '东南亚地区大国博弈加剧，东盟国家在中小心翼翼平衡。',
    escalation: 'low', trend: 'stable', lastUpdate: '4小时前',
    escalationRisk: 35, coverage: 50,
    scenarios: ['indo_pacific'],
    actions: ['深化中国-东盟合作', '推进RCEP落地', '加强海上合作'],
    intel: '东盟国家对选边站队压力表示担忧',
  },
};

/* ===== 力量详情库 ===== */
const FORCE_DETAILS = {
  '东部战区': {
    unit: '东部战区联合指挥部', personnel: '20万', branch: '陆海空联合',
    coverage: '台海、东海、长三角方向', readiness: 85, status: '德尔塔级战备',
    relatedThreats: ['台海', '东海', '朝鲜半岛'],
    capabilities: '两栖作战 / 联合火力打击 / 防空反导 / 电子战',
    desc: '负责台海方向主要作战任务，具备全天候两栖登陆和联合打击能力。',
  },
  '南部战区': {
    unit: '南部战区联合指挥部', personnel: '18万', branch: '陆海空联合',
    coverage: '南海、东南亚、南亚方向', readiness: 78, status: '查理级战备',
    relatedThreats: ['南海', '南海争端', '中印边境', '马六甲'],
    capabilities: '海上控制 / 岛礁防御 / 反介入/区域拒止 / 海上巡逻',
    desc: '负责南海方向权益维护，具备远海作战和岛礁防御能力。',
  },
  '北部战区': {
    unit: '北部战区联合指挥部', personnel: '16万', branch: '陆海空联合',
    coverage: '黄海、渤海、朝鲜半岛方向', readiness: 82, status: '查理级战备',
    relatedThreats: ['朝鲜半岛', '北极航线'],
    capabilities: '防空反导 / 海上防御 / 战略预警 / 寒区作战',
    desc: '负责北部边境和黄渤海方向防御，具备战略预警和防空反导能力。',
  },
  '海警编队': {
    unit: '中国海警局', personnel: '8万', branch: '海上执法',
    coverage: '南海、东海巡航执法', readiness: 88, status: '常态化巡逻',
    relatedThreats: ['南海', '南海争端', '东海'],
    capabilities: '海上执法 / 维权巡航 / 护渔护航 / 海上管控',
    desc: '负责海上维权执法，在争议海域保持常态化存在。',
  },
  '南部海区': {
    unit: '海军南海舰队', personnel: '6万', branch: '海军',
    coverage: '南海、马六甲方向', readiness: 72, status: '前出部署',
    relatedThreats: ['南海', '马六甲', '南海争端'],
    capabilities: '远海作战 / 反潜巡逻 / 护航 / 海上控制',
    desc: '负责南海海上方向作战，具备远海护航和控制能力。',
  },
  '护航编队': {
    unit: '海军亚丁湾护航编队', personnel: '800', branch: '海军',
    coverage: '印度洋、亚丁湾、霍尔木兹海峡', readiness: 75, status: '护航任务中',
    relatedThreats: ['霍尔木兹', '霍尔木兹海峡', '波斯湾'],
    capabilities: '反海盗护航 / 海上保护 / 应急撤离 / 远洋保障',
    desc: '执行亚丁湾护航任务，保障中国海上运输线安全。',
  },
  '保障基地': {
    unit: '海外保障基地', personnel: '2,000', branch: '联勤保障',
    coverage: '吉布提保障基地及周边', readiness: 68, status: '运营中',
    relatedThreats: ['霍尔木兹', '东非', '波斯湾'],
    capabilities: '后勤保障 / 应急撤离 / 医疗救护 / 情报支撑',
    desc: '中国在海外首个保障基地，为远海行动提供支撑。',
  },
  '西部战区': {
    unit: '西部战区联合指挥部', personnel: '22万', branch: '陆空联合',
    coverage: '中印边境、中亚方向', readiness: 80, status: '查理级战备',
    relatedThreats: ['中印边境', '藏南地区', '阿富汗', '新疆边境'],
    capabilities: '高原作战 / 边境管控 / 山地作战 / 空中突击',
    desc: '负责西部边境防御，具备高原山地作战和边境管控能力。',
  },
  '西藏军区': {
    unit: '西藏军区', personnel: '5万', branch: '陆军',
    coverage: '中印边境东段、藏南方向', readiness: 74, status: '前推部署',
    relatedThreats: ['中印边境', '藏南地区'],
    capabilities: '高原作战 / 边境防御 / 山地突击 / 后勤保障',
    desc: '负责中印边境东段防御，具备高原作战和边境管控能力。',
  },
  '保障点': {
    unit: '非洲保障点', personnel: '200', branch: '联勤保障',
    coverage: '非洲地区后勤支撑', readiness: 65, status: '建设中',
    relatedThreats: ['撒哈拉以南', '刚果'],
    capabilities: '后勤保障 / 侨民保护 / 应急支援',
    desc: '为非洲地区中国公民和资产提供安全保障支撑。',
  },
  '保障组': {
    unit: '拉美保障组', personnel: '50', branch: '外交安全',
    coverage: '拉美地区安全协调', readiness: 70, status: '运营中',
    relatedThreats: ['委内瑞拉', '阿根廷'],
    capabilities: '侨民保护 / 安全协调 / 情报收集',
    desc: '负责拉美地区中国公民和资产安全协调。',
  },
  '北极监测': {
    unit: '北极监测站', personnel: '300', branch: '军事航天',
    coverage: '北极航线、北方海航道', readiness: 72, status: '监测中',
    relatedThreats: ['北极航线', '格陵兰'],
    capabilities: '卫星监测 / 冰情侦察 / 航道保障 / 气象支援',
    desc: '负责北极方向态势监测和航道保障。',
  },
};

/* ===== 区域战略研判 ===== */
const STRATEGIC_ASSESSMENTS = {
  global: {
    assessment: '全球安全形势严峻复杂，台海、南海、霍尔木兹三大高危方向同时升温。某大国全面推进印太战略围堵，多域威胁交织叠加。建议优先处置台海方向核心利益威胁，同步加强南海力量部署，确保能源通道安全。',
    priority: '台海方向',
    recommendation: '立即提升东部战区战备等级，启动海空联合巡航，外交渠道发出最后警告。',
    coverageGap: '霍尔木兹海峡方向力量覆盖不足(45%)，建议增派护航编队。',
  },
  asia_pacific: {
    assessment: '亚太方向威胁集中且相互联动：台海、南海、东海、朝鲜半岛四个方向同时承压。某大国双航母战斗群在区域活动，Quad联盟军事协调加强。需防范多方向同时生战的风险。',
    priority: '台海方向(严重度5)',
    recommendation: '东部战区维持德尔塔级战备，南部战区提升至德尔塔级，海警编队全面前出。',
    coverageGap: '马六甲海峡方向力量覆盖不足(55%)，建议加强海警护航。',
  },
  middle_east: {
    assessment: '中东方向能源安全面临系统性威胁。霍尔木兹海峡局势骤然升级，中国40%原油进口通道受阻风险加大。地区冲突外溢效应明显，侨民安全需关注。',
    priority: '霍尔木兹海峡(严重度5)',
    recommendation: '启动护航编队前出，启用陆上替代能源通道，联合海湾国家外交协调。',
    coverageGap: '护航编队力量有限(45%覆盖)，建议协调友邦联合护航。',
  },
  central_asia: {
    assessment: '中亚方向总体稳定，但某大国加紧渗透。阿富汗安全形势不稳定，恐怖组织渗透风险持续存在。上合组织框架下安全合作稳步推进。',
    priority: '阿富汗方向(严重度3)',
    recommendation: '加强西部战区边境监控，深化上合组织反恐合作，推进中阿经济合作。',
    coverageGap: '力量覆盖充足(80%)，维持现有部署。',
  },
  south_asia: {
    assessment: '南亚方向中印边境局势有升温趋势。印方加速争议地区基建，增兵约3000人。克什米尔问题持续紧张。需防范边境摩擦升级为局部冲突。',
    priority: '中印边境(严重度4)',
    recommendation: '西部战区增兵对峙，加速边境基础设施建设，恢复军长级会谈。',
    coverageGap: '力量覆盖良好(80%)，建议加强西藏军区前推部署。',
  },
  southeast_asia: {
    assessment: '东南亚方向南海争端持续，声索国活动增加。马六甲海峡通行安全面临挑战。东盟国家在大国间寻求平衡，中国-东盟合作深化。',
    priority: '南海争端(严重度4)',
    recommendation: '海警编队全面前出执法，加强岛礁防御，推进中国-东盟外交斡旋。',
    coverageGap: '马六甲方向覆盖不足(55%)，建议加强海军前出部署。',
  },
  africa: {
    assessment: '非洲方向总体可控，但撒哈拉以南恐怖主义活动增加。刚果(金)冲突影响关键矿产供应链。西非政变频发。中国在非公民和资产安全需关注。',
    priority: '撒哈拉以南(严重度3)',
    recommendation: '加强侨民安全保护，推进联合国维和参与，深化中非安全合作。',
    coverageGap: '整体覆盖不足(25%)，建议加强保障点建设。',
  },
  latin_america: {
    assessment: '拉美方向总体平稳，但某大国加紧军事渗透(阿根廷、委内瑞拉)。中拉经贸合作稳步推进，金砖国家合作深化。',
    priority: '委内瑞拉(严重度2)',
    recommendation: '推进中拉经贸合作，监控某大国军事渗透，深化金砖协调。',
    coverageGap: '覆盖不足(20%)，建议加强外交安全协调。',
  },
  europe_america: {
    assessment: '欧美方向某大国全面推进对华遏制。印太战略、奥库斯联盟、芯片封锁多线施压。北约东翼军事部署加强。中俄战略协作持续深化。',
    priority: '美国本土(严重度4)',
    recommendation: '加强战略威慑，推进多极化外交，深化中俄战略协作。',
    coverageGap: '远程覆盖有限(35%)，建议加强军事航天力量部署。',
  },
};

/* ===== 威胁时间线数据 ===== */
const THREAT_TIMELINE = [
  { time: '03:21', severity: 5, region: '台海', event: '航母战斗群进入预设海域', type: 'military' },
  { time: '03:18', severity: 4, region: '南海', event: '声索国舰船活动增加', type: 'military' },
  { time: '03:15', severity: 3, region: '全球', event: '某大国卫星过顶侦察', type: 'intel' },
  { time: '03:10', severity: 4, region: '网络', event: '高级持续性威胁攻击能源系统', type: 'cyber' },
  { time: '02:58', severity: 5, region: '霍尔木兹', event: '海峡局势骤然升级', type: 'military' },
  { time: '02:50', severity: 3, region: '印太', event: 'Quad军事协调活动', type: 'diplomatic' },
  { time: '02:42', severity: 3, region: '台海', event: '涉台法案审议推进', type: 'diplomatic' },
  { time: '02:30', severity: 4, region: '东海', event: '舰机抵近侦察6次', type: 'military' },
  { time: '01:45', severity: 3, region: '边境', event: '印方增兵3000人', type: 'military' },
  { time: '01:20', severity: 3, region: '供应链', event: '芯片管制清单更新', type: 'economic' },
];

/* ===== 当前区域状态 ===== */
let _mapRegion = 'global';

/* ===== 渲染动态态势图 ===== */
function renderThreatMap(container){
  if(!container) return;

  const region = MAP_REGIONS.find(r => r.id === _mapRegion) || MAP_REGIONS[0];
  const [vx, vy, vw, vh] = region.viewBox;
  const [cx, cy] = region.center;

  /* === 区域选择器 === */
  let html = `<div class="map-region-selector">`;
  for(const r of MAP_REGIONS){
    html += `<div class="map-region-btn ${r.id === _mapRegion ? 'active' : ''}" data-region="${r.id}">${r.name}</div>`;
  }
  html += `</div>`;

  /* === SVG 动态势态图 === */
  let svg = `<svg viewBox="${vx} ${vy} ${vw} ${vh}" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;min-height:360px;display:block" id="threatMapSvg">`;

  /* --- 定义 --- */
  svg += `<defs>
    <radialGradient id="mapBgGrad" cx="50%" cy="50%" r="55%">
      <stop offset="0%" stop-color="rgba(0,180,216,.25)"/>
      <stop offset="50%" stop-color="rgba(0,30,60,.06)"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
    <linearGradient id="terrainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="rgba(0,150,100,.10)"/>
      <stop offset="100%" stop-color="rgba(0,100,70,.04)"/>
    </linearGradient>
    <linearGradient id="chinaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(255,60,60,.12)"/>
      <stop offset="100%" stop-color="rgba(180,30,30,.06)"/>
    </linearGradient>
    <radialGradient id="threatGlowRed" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(255,71,87,.35)"/>
      <stop offset="100%" stop-color="rgba(255,71,87,0)"/>
    </radialGradient>
    <radialGradient id="threatGlowAmber" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(255,165,2,.3)"/>
      <stop offset="100%" stop-color="rgba(255,165,2,0)"/>
    </radialGradient>
    <radialGradient id="threatGlowPurple" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(162,155,254,.25)"/>
      <stop offset="100%" stop-color="rgba(162,155,254,0)"/>
    </radialGradient>
    <radialGradient id="forceGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(46,213,115,.3)"/>
      <stop offset="100%" stop-color="rgba(46,213,115,0)"/>
    </radialGradient>
    <filter id="mapGlow">
      <feGaussianBlur stdDeviation="2.5" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="mapGlowLg">
      <feGaussianBlur stdDeviation="5" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <pattern id="mapGrid" x="0" y="0" width="25" height="25" patternUnits="userSpaceOnUse">
      <path d="M 25 0 L 0 0 0 25" fill="none" stroke="rgba(0,180,216,.06)" stroke-width="0.5"/>
    </pattern>
  </defs>`;

  /* --- 背景层 --- */
  svg += `<rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" fill="url(#mapBgGrad)"/>`;
  svg += `<rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" fill="url(#mapGrid)"/>`;

  /* --- 雷达环 --- */
  const maxR = Math.min(vw, vh) * 0.38;
  for(let r = maxR * 0.2; r <= maxR; r += maxR * 0.2){
    svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(0,180,216,.12)" stroke-width="0.8" stroke-dasharray="3,5"/>`;
  }
  svg += `<line x1="${cx-maxR*1.2}" y1="${cy}" x2="${cx+maxR*1.2}" y2="${cy}" stroke="rgba(0,180,216,.08)" stroke-width="0.8"/>`;
  svg += `<line x1="${cx}" y1="${cy-maxR*1.2}" x2="${cx}" y2="${cy+maxR*1.2}" stroke="rgba(0,180,216,.08)" stroke-width="0.8"/>`;

  /* --- 雷达扫描 --- */
  const scanR = maxR * 0.95;
  svg += `<g transform="translate(${cx},${cy})">
    <path d="M 0,0 L ${scanR},0 A ${scanR},${scanR} 0 0,0 ${scanR*0.707},-${scanR*0.707} Z" fill="rgba(0,180,216,.08)">
      <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="8s" repeatCount="indefinite"/>
    </path>
  </g>`;

  /* --- 地形 --- */
  for(let i = 0; i < region.terrain.length; i++){
    const isChina = region.terrain[i].includes('700,85') || region.terrain[i].includes('640,165');
    const fill = isChina ? 'url(#chinaGrad)' : 'url(#terrainGrad)';
    const stroke = isChina ? 'rgba(255,80,80,.35)' : 'rgba(0,180,216,.3)';
    svg += `<path d="${region.terrain[i]}" fill="${fill}" stroke="${stroke}" stroke-width="1.2"/>`;
  }

  /* --- 威胁影响区域 --- */
  for(const h of region.hotspots){
    if(h.severity >= 3){
      const zoneR = h.severity * 10;
      const zoneGrad = h.color === '#ff4757' ? 'threatGlowRed' : h.color === '#ffa502' ? 'threatGlowAmber' : 'threatGlowPurple';
      svg += `<circle cx="${h.x}" cy="${h.y}" r="${zoneR}" fill="url(#${zoneGrad})" opacity=".12">
        <animate attributeName="r" values="${zoneR};${zoneR * 1.4};${zoneR}" dur="${4 + h.severity}s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values=".08;.18;.08" dur="${4 + h.severity}s" repeatCount="indefinite"/>
      </circle>`;
    }
  }

  /* --- 战略通道线 --- */
  for(let i = 0; i < region.hotspots.length; i++){
    for(let j = i + 1; j < region.hotspots.length; j++){
      const h1 = region.hotspots[i], h2 = region.hotspots[j];
      if(h1.severity >= 3 && h2.severity >= 3){
        const dist = Math.sqrt((h2.x - h1.x) ** 2 + (h2.y - h1.y) ** 2);
        if(dist < 120 && dist > 25){
          svg += `<line x1="${h1.x}" y1="${h1.y}" x2="${h2.x}" y2="${h2.y}" stroke="rgba(0,180,216,.18)" stroke-width="0.6" stroke-dasharray="1,5" opacity=".25"/>`;
        }
      }
    }
  }

  /* --- 威胁矢量线 --- */
  for(const h of region.hotspots){
    if(h.severity >= 3){
      const dash = h.severity >= 4 ? '6,3' : '4,4';
      const opacity = h.severity >= 4 ? 0.5 : 0.25;
      svg += `<line x1="${h.x}" y1="${h.y}" x2="${cx}" y2="${cy}"
        stroke="${h.color}" stroke-width="1.2" stroke-dasharray="${dash}" opacity="${opacity}">
        <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="${h.severity >= 4 ? 1 : 2}s" repeatCount="indefinite"/>
      </line>`;
    }
  }

  /* --- 力量部署标记（可交互） --- */
  if(region.forces){
    for(const f of region.forces){
      const fd = FORCE_DETAILS[f.label] || {};
      svg += `<g class="map-force-group" data-force="${esc2(f.label)}" style="cursor:pointer">`;
      /* 光晕 */
      svg += `<circle cx="${f.x}" cy="${f.y}" r="20" fill="url(#forceGlow)"/>`;
      /* 脉冲外圈 */
      svg += `<circle cx="${f.x}" cy="${f.y}" r="12" fill="none" stroke="${f.color}" stroke-width="1" opacity=".4">
        <animate attributeName="r" from="12" to="20" dur="2.5s" repeatCount="indefinite"/>
        <animate attributeName="opacity" from=".4" to="0" dur="2.5s" repeatCount="indefinite"/>
      </circle>`;
      /* 核心标记 */
      svg += `<rect x="${f.x-5}" y="${f.y-5}" width="10" height="10" fill="${f.color}" opacity=".7" transform="rotate(45 ${f.x} ${f.y})" filter="url(#mapGlow)"/>`;
      /* 战备度弧 */
      const arcR = 8;
      const arcEnd = f.readiness / 100 * 360;
      const arcX = f.x + arcR * Math.cos((arcEnd - 90) * Math.PI / 180);
      const arcY = f.y + arcR * Math.sin((arcEnd - 90) * Math.PI / 180);
      const largeArc = arcEnd > 180 ? 1 : 0;
      svg += `<path d="M ${f.x},${f.y - arcR} A ${arcR},${arcR} 0 ${largeArc},1 ${arcX},${arcY}" fill="none" stroke="${f.color}" stroke-width="2" opacity=".8"/>`;
      /* 标签 */
      svg += `<text x="${f.x}" y="${f.y + 22}" text-anchor="middle" fill="${f.color}" font-size="11" font-family="monospace" opacity=".8">${esc2(f.label)}</text>`;
      svg += `<text x="${f.x}" y="${f.y + 34}" text-anchor="middle" fill="${f.color}" font-size="11" font-family="monospace" opacity=".6">${f.readiness}%</text>`;
      /* 子单位标记 */
      const subOffsets = [{dx:9,dy:-7},{dx:-8,dy:8},{dx:11,dy:4}];
      for(const so of subOffsets){
        svg += `<circle cx="${f.x + so.dx}" cy="${f.y + so.dy}" r="1.8" fill="${f.color}" opacity=".45">
          <animate attributeName="opacity" values=".3;.6;.3" dur="${2 + Math.random() * 2}s" repeatCount="indefinite"/>
        </circle>`;
      }
      /* 兵力调动箭头 */
      let nearest = null, minDist = Infinity;
      for(const h of region.hotspots){
        if(h.severity >= 3){
          const d = Math.sqrt((h.x - f.x) ** 2 + (h.y - f.y) ** 2);
          if(d < minDist && d > 15){ minDist = d; nearest = h; }
        }
      }
      if(nearest){
        const dx = nearest.x - f.x, dy = nearest.y - f.y;
        const angle = Math.atan2(dy, dx);
        const arrowLen = Math.min(minDist * 0.45, 35);
        const ax = f.x + Math.cos(angle) * arrowLen;
        const ay = f.y + Math.sin(angle) * arrowLen;
        const arrowHead1x = ax - Math.cos(angle - 0.45) * 6;
        const arrowHead1y = ay - Math.sin(angle - 0.45) * 6;
        const arrowHead2x = ax - Math.cos(angle + 0.45) * 6;
        const arrowHead2y = ay - Math.sin(angle + 0.45) * 6;
        svg += `<g opacity=".35">
          <line x1="${f.x + Math.cos(angle) * 12}" y1="${f.y + Math.sin(angle) * 12}" x2="${ax}" y2="${ay}" stroke="${f.color}" stroke-width="1.2" stroke-dasharray="3,2">
            <animate attributeName="stroke-dashoffset" from="0" to="-5" dur="1s" repeatCount="indefinite"/>
          </line>
          <polygon points="${ax},${ay} ${arrowHead1x},${arrowHead1y} ${arrowHead2x},${arrowHead2y}" fill="${f.color}" opacity=".6"/>
        </g>`;
      }
      svg += `</g>`;
    }
  }

  /* --- 中心指挥点 --- */
  svg += `<circle cx="${cx}" cy="${cy}" r="10" fill="none" stroke="#00b4d8" stroke-width="1.5" opacity=".7">
    <animate attributeName="r" from="10" to="28" dur="2.5s" repeatCount="indefinite"/>
    <animate attributeName="opacity" from=".7" to="0" dur="2.5s" repeatCount="indefinite"/>
  </circle>
  <circle cx="${cx}" cy="${cy}" r="16" fill="none" stroke="#00b4d8" stroke-width="1" opacity=".3">
    <animate attributeName="r" from="16" to="34" dur="2.5s" begin="0.8s" repeatCount="indefinite"/>
    <animate attributeName="opacity" from=".3" to="0" dur="2.5s" begin="0.8s" repeatCount="indefinite"/>
  </circle>
  <circle cx="${cx}" cy="${cy}" r="7" fill="#00b4d8" filter="url(#mapGlowLg)" opacity=".9"/>
  <circle cx="${cx}" cy="${cy}" r="3" fill="#fff" opacity=".9"/>
  <text x="${cx}" y="${cy - 14}" text-anchor="middle" fill="#00b4d8" font-size="13" font-family="monospace" font-weight="bold">指挥中心</text>`;

  /* --- 威胁热点标记（可交互） --- */
  for(let hi = 0; hi < region.hotspots.length; hi++){
    const h = region.hotspots[hi];
    const radius = h.r + 3;
    svg += `<g class="map-hotspot-group" data-hotspot="${esc2(h.label)}" data-severity="${h.severity}" style="cursor:pointer">`;

    /* 外层光晕 */
    const glowId = h.color === '#ff4757' ? 'threatGlowRed' : h.color === '#ffa502' ? 'threatGlowAmber' : 'threatGlowPurple';
    svg += `<circle cx="${h.x}" cy="${h.y}" r="${h.severity * 6}" fill="url(#${glowId})" opacity=".5"/>`;

    /* 脉冲环 */
    if(h.pulse){
      svg += `<circle cx="${h.x}" cy="${h.y}" r="${radius}" fill="none" stroke="${h.color}" stroke-width="1.5" opacity=".6">
        <animate attributeName="r" from="${radius}" to="${radius * 4}" dur="1.5s" repeatCount="indefinite"/>
        <animate attributeName="opacity" from=".6" to="0" dur="1.5s" repeatCount="indefinite"/>
      </circle>`;
      svg += `<circle cx="${h.x}" cy="${h.y}" r="${radius}" fill="none" stroke="${h.color}" stroke-width="1" opacity=".3">
        <animate attributeName="r" from="${radius}" to="${radius * 4}" dur="1.5s" begin="0.7s" repeatCount="indefinite"/>
        <animate attributeName="opacity" from=".3" to="0" dur="1.5s" begin="0.7s" repeatCount="indefinite"/>
      </circle>`;
    }

    /* 严重度环 */
    if(h.severity >= 4){
      svg += `<circle cx="${h.x}" cy="${h.y}" r="${h.r + 6}" fill="none" stroke="${h.color}" stroke-width="1" stroke-dasharray="2,2" opacity=".3">
        <animateTransform attributeName="transform" type="rotate" from="0 ${h.x} ${h.y}" to="360 ${h.x} ${h.y}" dur="10s" repeatCount="indefinite"/>
      </circle>`;
    }

    /* 核心标记 */
    svg += `<circle cx="${h.x}" cy="${h.y}" r="${h.r}" fill="${h.color}" filter="url(#mapGlow)" opacity=".95"/>`;
    svg += `<circle cx="${h.x}" cy="${h.y}" r="${h.r * 0.4}" fill="#fff" opacity=".7"/>`;

    /* 标签 */
    svg += `<rect x="${h.x - esc2(h.label).length * 3}" y="${h.y - h.r - 18}" width="${esc2(h.label).length * 6}" height="14" fill="rgba(5,8,16,.8)" stroke="${h.color}" stroke-width="0.5" rx="2" opacity=".85"/>`;
    svg += `<text x="${h.x}" y="${h.y - h.r - 7}" text-anchor="middle" fill="${h.color}" font-size="11" font-family="monospace" font-weight="bold">${esc2(h.label)}</text>`;

    /* 严重度数字 */
    if(h.severity >= 3){
      svg += `<text x="${h.x + h.r + 4}" y="${h.y + 4}" fill="${h.color}" font-size="11" font-family="monospace" opacity=".7">等级${h.severity}</text>`;
    }

    /* 告警波纹 */
    if(h.severity >= 4){
      for(let w = 0; w < 3; w++){
        svg += `<circle cx="${h.x}" cy="${h.y}" r="${h.r + 3}" fill="none" stroke="${h.color}" stroke-width="0.6" opacity=".25">
          <animate attributeName="r" from="${h.r + 3}" to="${h.r + 28}" dur="3.5s" begin="${w * 1.2}s" repeatCount="indefinite"/>
          <animate attributeName="opacity" from=".25" to="0" dur="3.5s" begin="${w * 1.2}s" repeatCount="indefinite"/>
        </circle>`;
      }
    }

    svg += `</g>`;
  }

  /* --- 数据面板 --- */
  const panelX = vx + vw - 185, panelY = vy + 15;
  const highSev = region.hotspots.filter(h => h.severity >= 4).length;
  const medSev = region.hotspots.filter(h => h.severity >= 3 && h.severity < 4).length;
  const lowSev = region.hotspots.filter(h => h.severity < 3).length;
  const forceCount = region.forces ? region.forces.length : 0;
  const avgReadiness = forceCount > 0 ? Math.round(region.forces.reduce((s,f) => s + f.readiness, 0) / forceCount) : 0;
  svg += `<g transform="translate(${panelX},${panelY})">
    <rect width="170" height="120" fill="rgba(5,8,16,.85)" stroke="rgba(0,180,216,.3)" stroke-width="0.8" rx="4"/>
    <text x="10" y="18" fill="#00b4d8" font-size="12" font-family="monospace" font-weight="bold">📊 ${esc2(region.name)}态势</text>
    <line x1="10" y1="24" x2="160" y2="24" stroke="rgba(0,180,216,.20)" stroke-width="0.5"/>
    <text x="10" y="40" fill="#ff4757" font-size="12" font-family="monospace">● 高危: ${highSev}</text>
    <text x="85" y="40" fill="#ffa502" font-size="12" font-family="monospace">● 中危: ${medSev}</text>
    <text x="10" y="56" fill="#a29bfe" font-size="12" font-family="monospace">● 监控: ${lowSev}</text>
    <text x="85" y="56" fill="#2ed573" font-size="12" font-family="monospace">● 部署: ${forceCount}</text>
    <line x1="10" y1="66" x2="160" y2="66" stroke="rgba(0,180,216,.15)" stroke-width="0.5"/>
    <text x="10" y="82" fill="#7a8aa8" font-size="11" font-family="monospace">战备均值</text>
    <text x="120" y="82" fill="${avgReadiness >= 75 ? '#2ed573' : avgReadiness >= 60 ? '#ffa502' : '#ff4757'}" font-size="12" font-family="monospace" font-weight="bold">${avgReadiness}%</text>
    <text x="10" y="98" fill="#7a8aa8" font-size="11" font-family="monospace">威胁指数</text>
    <text x="120" y="98" fill="${highSev >= 3 ? '#ff4757' : highSev >= 1 ? '#ffa502' : '#2ed573'}" font-size="12" font-family="monospace" font-weight="bold">${Math.round((highSev * 20 + medSev * 10) / (region.hotspots.length || 1) * 10)}%</text>
    <text x="10" y="114" fill="#7a8aa8" font-size="11" font-family="monospace">战备等级</text>
    <text x="120" y="114" fill="${highSev >= 3 ? '#ff4757' : '#ffa502'}" font-size="12" font-family="monospace" font-weight="bold">${highSev >= 3 ? '2' : highSev >= 1 ? '3' : '4'}</text>
  </g>`;

  /* --- 图例 --- */
  const legX = vx + 15, legY = vy + vh - 70;
  svg += `<g transform="translate(${legX},${legY})">
    <rect width="175" height="62" fill="rgba(5,8,16,.85)" stroke="rgba(0,180,216,.20)" stroke-width="0.8" rx="4"/>
    <text x="10" y="16" fill="#7a8aa8" font-size="11" font-family="monospace">图例 · 点击查看详情</text>
    <line x1="10" y1="20" x2="165" y2="20" stroke="rgba(0,180,216,.15)" stroke-width="0.5"/>
    <circle cx="16" cy="32" r="4" fill="#ff4757" filter="url(#mapGlow)"/>
    <text x="26" y="35" fill="#7a8aa8" font-size="11" font-family="monospace">高危威胁</text>
    <circle cx="95" cy="32" r="4" fill="#ffa502" filter="url(#mapGlow)"/>
    <text x="105" y="35" fill="#7a8aa8" font-size="11" font-family="monospace">中危威胁</text>
    <circle cx="16" cy="50" r="4" fill="#2ed573" filter="url(#mapGlow)"/>
    <text x="26" y="53" fill="#7a8aa8" font-size="11" font-family="monospace">力量部署</text>
    <circle cx="95" cy="50" r="4" fill="#a29bfe" filter="url(#mapGlow)"/>
    <text x="105" y="53" fill="#7a8aa8" font-size="11" font-family="monospace">监控区域</text>
  </g>`;

  /* --- 罗盘 --- */
  const compX = vx + vw - 50, compY = vy + vh - 55;
  svg += `<g transform="translate(${compX},${compY})" opacity=".4">
    <text x="0" y="-22" text-anchor="middle" fill="#00b4d8" font-size="13" font-family="monospace">北</text>
    <text x="24" y="2" fill="#7a8aa8" font-size="11" font-family="monospace">东</text>
    <text x="0" y="26" text-anchor="middle" fill="#7a8aa8" font-size="11" font-family="monospace">南</text>
    <text x="-24" y="2" text-anchor="end" fill="#7a8aa8" font-size="11" font-family="monospace">西</text>
    <circle cx="0" cy="0" r="20" fill="none" stroke="rgba(0,180,216,.3)" stroke-width="0.5"/>
    <line x1="0" y1="-16" x2="0" y2="16" stroke="rgba(0,180,216,.20)" stroke-width="0.5"/>
    <line x1="-16" y1="0" x2="16" y2="0" stroke="rgba(0,180,216,.20)" stroke-width="0.5"/>
    <polygon points="0,-14 -4,4 0,0 4,4" fill="#00b4d8" opacity=".5">
      <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="20s" repeatCount="indefinite"/>
    </polygon>
  </g>`;

  svg += `</svg>`;

  /* === 战略研判面板（替代死数字栏） === */
  const assess = STRATEGIC_ASSESSMENTS[region.id] || STRATEGIC_ASSESSMENTS.global;
  const topThreats = [...region.hotspots].sort((a,b) => b.severity - a.severity).slice(0, 3);
  const totalCoverage = forceCount > 0 ? Math.round(region.forces.reduce((s,f) => {
    const fd = HOTSPOT_DETAILS[f.label];
    return s + (fd ? fd.coverage : 0);
  }, 0) / forceCount) : 0;

  html += `<div class="map-strategic-panel">
    <!-- AI战略研判 -->
    <div class="msp-assessment">
      <div class="msp-assessment-head">
        <span class="msp-ah-icon">🧠</span>
        <span class="msp-ah-title">AI战略研判</span>
        <span class="msp-ah-region">${region.name}方向</span>
      </div>
      <div class="msp-assessment-text">${esc2(assess.assessment)}</div>
      <div class="msp-assessment-priority">
        <span class="msp-priority-label">优先处置:</span>
        <span class="msp-priority-value">${esc2(assess.priority)}</span>
      </div>
    </div>

    <!-- 关键威胁TOP3 -->
    <div class="msp-threats">
      <div class="msp-section-title">
        <span style="width:3px;height:14px;background:var(--red);border-radius:2px"></span>
        关键威胁 TOP ${topThreats.length}
      </div>
      ${topThreats.map((h, i) => {
        const detail = HOTSPOT_DETAILS[h.label] || {};
        const sevColor = h.severity >= 4 ? 'var(--red)' : h.severity >= 3 ? 'var(--amber)' : 'var(--purple)';
        const sevText = h.severity >= 4 ? '高危' : h.severity >= 3 ? '中危' : '监控';
        const escRisk = detail.escalationRisk || 50;
        const trendIcon = detail.trend === 'up' ? '↑ 升级中' : detail.trend === 'down' ? '↓ 缓和' : '→ 稳定';
        const trendColor = detail.trend === 'up' ? 'var(--red)' : detail.trend === 'down' ? 'var(--green)' : 'var(--txt-2)';
        return `
        <div class="msp-threat-card" data-hotspot-click="${esc2(h.label)}">
          <div class="msp-tc-rank">#${i+1}</div>
          <div class="msp-tc-body">
            <div class="msp-tc-head">
              <span class="msp-tc-name" style="color:${sevColor}">${esc2(h.label)}</span>
              <span class="msp-tc-sev" style="background:${sevColor}22;color:${sevColor};border:1px solid ${sevColor}44">${sevText} LV${h.severity}</span>
              <span class="msp-tc-trend" style="color:${trendColor}">${trendIcon}</span>
              <span class="msp-tc-time">${esc2(detail.lastUpdate || '未知')}</span>
            </div>
            <div class="msp-tc-summary">${esc2(detail.summary || '暂无情报')}</div>
            <div class="msp-tc-bar">
              <div class="msp-tc-bar-label">升级风险</div>
              <div class="msp-tc-bar-track">
                <div class="msp-tc-bar-fill" style="width:${escRisk}%;background:${escRisk >= 70 ? 'var(--red)' : escRisk >= 40 ? 'var(--amber)' : 'var(--green)'}"></div>
              </div>
              <div class="msp-tc-bar-val" style="color:${escRisk >= 70 ? 'var(--red)' : escRisk >= 40 ? 'var(--amber)' : 'var(--green)'}">${escRisk}%</div>
            </div>
            <div class="msp-tc-action">
              <span class="msp-tc-action-icon">📋</span>
              <span class="msp-tc-action-text">${esc2((detail.actions && detail.actions[0]) || '持续监控')}</span>
            </div>
          </div>
        </div>`;
      }).join('')}
    </div>

    <!-- 力量覆盖分析 -->
    <div class="msp-coverage">
      <div class="msp-section-title">
        <span style="width:3px;height:14px;background:var(--green);border-radius:2px"></span>
        力量覆盖分析
      </div>
      <div class="msp-coverage-grid">
        ${region.forces ? region.forces.map(f => {
          const fd = FORCE_DETAILS[f.label] || {};
          const cov = HOTSPOT_DETAILS[f.label] ? HOTSPOT_DETAILS[f.label].coverage : 0;
          const covColor = cov >= 70 ? 'var(--green)' : cov >= 40 ? 'var(--amber)' : 'var(--red)';
          return `
          <div class="msp-cov-item" data-force-click="${esc2(f.label)}">
            <div class="msp-cov-head">
              <span class="msp-cov-name">${esc2(f.label)}</span>
              <span class="msp-cov-ready" style="color:${f.readiness >= 75 ? 'var(--green)' : f.readiness >= 60 ? 'var(--amber)' : 'var(--red)'}">${f.readiness}%</span>
            </div>
            <div class="msp-cov-bar-track">
              <div class="msp-cov-bar-fill" style="width:${f.readiness}%;background:${f.color}"></div>
            </div>
            <div class="msp-cov-meta">
              <span style="color:${covColor}">覆盖 ${cov}%</span>
              <span style="color:var(--txt-2)">${esc2(fd.branch || '')}</span>
            </div>
          </div>`;
        }).join('') : '<div style="color:var(--txt-2);font-size:12px;padding:8px">该方向无部署力量</div>'}
      </div>
      <div class="msp-coverage-gap">
        <span class="msp-cg-icon">⚠️</span>
        <span class="msp-cg-text">${esc2(assess.coverageGap)}</span>
      </div>
    </div>

    <!-- 行动建议 -->
    <div class="msp-actions">
      <div class="msp-section-title">
        <span style="width:3px;height:14px;background:var(--amber);border-radius:2px"></span>
        建议行动方案
      </div>
      <div class="msp-action-text">${esc2(assess.recommendation)}</div>
      <div class="msp-action-buttons">
        <button class="msp-ab-btn msp-ab-primary" onclick="App.switchTab('scenarios')">🎯 进入推演</button>
        <button class="msp-ab-btn msp-ab-secondary" onclick="App.switchTab('forces')">⚔️ 调整部署</button>
        <button class="msp-ab-btn msp-ab-secondary" onclick="App.switchTab('intel')">🔍 查看情报</button>
      </div>
    </div>
  </div>`;

  /* === 威胁时间线 === */
  html += `<div class="map-threat-timeline">
    <div class="mtt-header">
      <span style="width:3px;height:14px;background:var(--cyan);border-radius:2px"></span>
      <span class="mtt-title">威胁事件时间线</span>
      <span class="mtt-count">${THREAT_TIMELINE.length}条记录</span>
    </div>
    <div class="mtt-track">
      ${THREAT_TIMELINE.map((t, i) => {
        const sevColor = t.severity >= 5 ? 'var(--red)' : t.severity >= 4 ? 'var(--amber)' : 'var(--cyan)';
        const sevDot = t.severity >= 5 ? '🔴' : t.severity >= 4 ? '🟠' : '🔵';
        const typeIcon = t.type === 'military' ? '⚔️' : t.type === 'cyber' ? '🌐' : t.type === 'economic' ? '📊' : t.type === 'intel' ? '🔍' : t.type === 'diplomatic' ? '🤝' : '📡';
        return `
        <div class="mtt-item" style="border-left-color:${sevColor}">
          <div class="mtt-time">${t.time}</div>
          <div class="mtt-sev" style="color:${sevColor}">${sevDot} 威胁${t.severity}级</div>
          <div class="mtt-region">${esc2(t.region)}</div>
          <div class="mtt-event">${typeIcon} ${esc2(t.event)}</div>
        </div>`;
      }).join('')}
    </div>
  </div>`;

  container.innerHTML = html;

  /* === 绑定交互 === */
  // 区域切换
  container.querySelectorAll('[data-region]').forEach(btn => {
    btn.addEventListener('click', () => {
      _mapRegion = btn.getAttribute('data-region');
      renderThreatMap(container);
    });
  });

  // 热点点击
  container.querySelectorAll('[data-hotspot]').forEach(g => {
    g.addEventListener('click', (e) => {
      e.stopPropagation();
      const label = g.getAttribute('data-hotspot');
      showHotspotDetail(label, container);
    });
    // hover高亮
    g.addEventListener('mouseenter', () => {
      g.style.filter = 'brightness(1.3)';
    });
    g.addEventListener('mouseleave', () => {
      g.style.filter = '';
    });
  });

  // 力量点击
  container.querySelectorAll('[data-force]').forEach(g => {
    g.addEventListener('click', (e) => {
      e.stopPropagation();
      const label = g.getAttribute('data-force');
      showForceDetail(label, container);
    });
    g.addEventListener('mouseenter', () => {
      g.style.filter = 'brightness(1.3)';
    });
    g.addEventListener('mouseleave', () => {
      g.style.filter = '';
    });
  });

  // 威胁卡片点击
  container.querySelectorAll('[data-hotspot-click]').forEach(card => {
    card.addEventListener('click', () => {
      const label = card.getAttribute('data-hotspot-click');
      showHotspotDetail(label, container);
    });
    card.style.cursor = 'pointer';
  });

  // 力量覆盖项点击
  container.querySelectorAll('[data-force-click]').forEach(item => {
    item.addEventListener('click', () => {
      const label = item.getAttribute('data-force-click');
      showForceDetail(label, container);
    });
    item.style.cursor = 'pointer';
  });
}

/* ===== 热点详情弹窗 ===== */
function showHotspotDetail(label, container){
  const detail = HOTSPOT_DETAILS[label];
  if(!detail) return;

  // 移除已有弹窗
  const existing = document.getElementById('hotspotPopup');
  if(existing) existing.remove();

  const sevColor = detail.escalation === 'critical' ? 'var(--red)' :
                   detail.escalation === 'high' ? 'var(--red)' :
                   detail.escalation === 'medium' ? 'var(--amber)' : 'var(--green)';
  const sevText = detail.escalation === 'critical' ? '危急' :
                  detail.escalation === 'high' ? '高危' :
                  detail.escalation === 'medium' ? '中危' : '低危';

  const popup = document.createElement('div');
  popup.id = 'hotspotPopup';
  popup.className = 'hotspot-popup';
  popup.innerHTML = `
    <div class="hp-overlay"></div>
    <div class="hp-card">
      <div class="hp-card-head" style="border-left:3px solid ${sevColor}">
        <div class="hp-title-row">
          <span class="hp-title">${esc2(label)}</span>
          <span class="hp-sev-badge" style="background:${sevColor}22;color:${sevColor};border:1px solid ${sevColor}44">${sevText}</span>
          <button class="hp-close" onclick="this.closest('#hotspotPopup').remove()">×</button>
        </div>
        <div class="hp-meta-row">
          <span style="color:${detail.trend === 'up' ? 'var(--red)' : detail.trend === 'down' ? 'var(--green)' : 'var(--txt-2)'}">
            ${detail.trend === 'up' ? '↑ 升级中' : detail.trend === 'down' ? '↓ 缓和' : '→ 稳定'}
          </span>
          <span style="color:var(--txt-2)">更新: ${esc2(detail.lastUpdate)}</span>
          <span style="color:var(--cyan)">升级风险: ${detail.escalationRisk}%</span>
          <span style="color:var(--green)">力量覆盖: ${detail.coverage}%</span>
        </div>
      </div>
      <div class="hp-card-body">
        <div class="hp-section">
          <div class="hp-section-title">📋 威胁概述</div>
          <div class="hp-section-text">${esc2(detail.summary)}</div>
        </div>
        <div class="hp-section">
          <div class="hp-section-title">🔍 情报支撑</div>
          <div class="hp-section-text hp-intel-text">${esc2(detail.intel)}</div>
        </div>
        <div class="hp-section">
          <div class="hp-section-title">⚡ 建议行动</div>
          <div class="hp-actions-list">
            ${detail.actions.map((a, i) => `
              <div class="hp-action-item">
                <span class="hp-action-num">${i+1}</span>
                <span class="hp-action-text">${esc2(a)}</span>
              </div>
            `).join('')}
          </div>
        </div>
        ${detail.scenarios.length > 0 ? `
        <div class="hp-section">
          <div class="hp-section-title">🎯 关联推演场景</div>
          <div class="hp-scenarios">
            ${detail.scenarios.map(sid => {
              const scene = typeof SCENARIOS !== 'undefined' ? SCENARIOS.find(s => s.id === sid) : null;
              if(!scene) return '';
              const dm = typeof DOMAIN_MAP !== 'undefined' ? (DOMAIN_MAP[scene.domain] || DOMAIN_MAP.military) : {color:'#ff4757', icon:'⚔️', label:'军事'};
              return `
              <div class="hp-scene-card" data-scene-id="${scene.id}" style="border-color:${dm.color}44">
                <div class="hp-scene-name" style="color:${dm.color}">${dm.icon} ${esc2(scene.name)}</div>
                <div class="hp-scene-meta">
                  <span style="color:var(--txt-2)">威胁 ${scene.threatLevel}/5</span>
                  <span style="color:var(--txt-2)">${scene.duration}轮</span>
                </div>
                <button class="hp-scene-btn" onclick="App.switchTab('scenarios');setTimeout(()=>{document.querySelector('[data-scene=\\'${scene.id}\\']')?.click()},100)">开始推演 ▶</button>
              </div>`;
            }).join('')}
          </div>
        </div>` : ''}
      </div>
    </div>
  `;
  document.body.appendChild(popup);

  // 点击遮罩关闭
  popup.querySelector('.hp-overlay').addEventListener('click', () => popup.remove());
}

/* ===== 力量详情弹窗 ===== */
function showForceDetail(label, container){
  const fd = FORCE_DETAILS[label];
  if(!fd) return;

  const existing = document.getElementById('hotspotPopup');
  if(existing) existing.remove();

  const readyColor = fd.readiness >= 75 ? 'var(--green)' : fd.readiness >= 60 ? 'var(--amber)' : 'var(--red)';

  const popup = document.createElement('div');
  popup.id = 'hotspotPopup';
  popup.className = 'hotspot-popup';
  popup.innerHTML = `
    <div class="hp-overlay"></div>
    <div class="hp-card">
      <div class="hp-card-head" style="border-left:3px solid var(--green)">
        <div class="hp-title-row">
          <span class="hp-title">⚔️ ${esc2(label)}</span>
          <span class="hp-sev-badge" style="background:${readyColor}22;color:${readyColor};border:1px solid ${readyColor}44">${fd.status}</span>
          <button class="hp-close" onclick="this.closest('#hotspotPopup').remove()">×</button>
        </div>
        <div class="hp-meta-row">
          <span style="color:var(--cyan)">${esc2(fd.unit)}</span>
          <span style="color:var(--txt-2)">${esc2(fd.branch)}</span>
          <span style="color:var(--txt-2)">人员: ${esc2(fd.personnel)}</span>
        </div>
      </div>
      <div class="hp-card-body">
        <div class="hp-section">
          <div class="hp-section-title">📋 单位概述</div>
          <div class="hp-section-text">${esc2(fd.desc)}</div>
        </div>
        <div class="hp-section">
          <div class="hp-section-title">🎯 责任区域</div>
          <div class="hp-section-text">${esc2(fd.coverage)}</div>
        </div>
        <div class="hp-section">
          <div class="hp-section-title">💪 作战能力</div>
          <div class="hp-section-text">${esc2(fd.capabilities)}</div>
        </div>
        <div class="hp-section">
          <div class="hp-section-title">⚠️ 关联威胁</div>
          <div class="hp-related-threats">
            ${fd.relatedThreats.map(t => {
              const td = HOTSPOT_DETAILS[t];
              const sev = td ? td.escalationRisk : 0;
              const color = sev >= 70 ? 'var(--red)' : sev >= 40 ? 'var(--amber)' : 'var(--green)';
              return `
              <div class="hp-rt-item" style="border-color:${color}44">
                <span class="hp-rt-name" style="color:${color}">${esc2(t)}</span>
                <span class="hp-rt-risk" style="color:${color}">风险 ${sev}%</span>
              </div>`;
            }).join('')}
          </div>
        </div>
        <div class="hp-section">
          <div class="hp-section-title">📊 战备状态</div>
          <div class="hp-readiness-bar">
            <div class="hp-rb-track">
              <div class="hp-rb-fill" style="width:${fd.readiness}%;background:${readyColor}"></div>
            </div>
            <span class="hp-rb-val" style="color:${readyColor}">${fd.readiness}%</span>
          </div>
        </div>
        <div class="hp-action-buttons">
          <button class="hp-ab-btn hp-ab-primary" onclick="App.switchTab('forces')">查看力量详情</button>
          <button class="hp-ab-btn hp-ab-secondary" onclick="App.switchTab('scenarios')">关联推演场景</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(popup);

  popup.querySelector('.hp-overlay').addEventListener('click', () => popup.remove());
}
