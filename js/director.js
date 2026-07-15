/* ================================================================
 * NSS-WGS v6.0 — 导调阶段 (Director Phase)
 *
 * 系统作为导调员，在推演前向指挥部呈现:
 *   1. 战略态势简报 — 背景分析 + 域态势 + 威胁评估
 *   2. 情报预警      — 过滤相关情报 + 可靠度 + 影响预判
 *   3. 触发事件      — 导致推演的具体事件 + 严重度
 *   4. 力量调配      — 玩家消耗资金提升军种战备（战略选择）
 *   5. 任务目标      — 明确的推演目标 + 胜负条件
 *
 * 力量调配是核心交互:
 *   - 每个+5%战备消耗 budget×1.5% 的资金
 *   - 单军种最多+20%
 *   - 提升的战备直接带入推演，影响行动成功率
 *   - 这让力量战备从"摆设"变成"战略决策"
 * ================================================================ */

const Director = {
  state: null,

  /* ===== 启动导调阶段 ===== */
  start(scenario, sideInfo){
    const forcesCopy = FORCES.map(f => ({...f}));

    /* 非国家行为体预算调整: 非对称资源约束
     * 恐怖组织/APT组织等非国家行为体的资金能力远低于主权国家
     * 预算调整为主权国家的15%，体现非对称资源约束
     */
    const sideColor = (sideInfo && sideInfo.sideColor) || 'red';
    let adjustedBudget = scenario.budget;
    if(sideColor === 'blue'){
      const sides = (typeof getScenarioSides === 'function') ? getScenarioSides(scenario.id) : null;
      const blueSide = sides ? sides.blue : null;
      const playerSideObj = (sideInfo && sideInfo.playerSide) || null;
      if((blueSide && blueSide.nonStateActor) || (playerSideObj && playerSideObj.nonStateActor)){
        adjustedBudget = Math.round(scenario.budget * 0.15);
      }
    }
    const boostCost = Math.max(10, Math.round(adjustedBudget * 0.015));

    this.state = {
      scenario,
      forces: forcesCopy,
      budget: adjustedBudget,
      initialBudget: adjustedBudget,
      boostCost,
      boosts: {},           /* { 陆军: 10, 海军: 5, ... } */
      objectives: this.genObjectives(scenario, sideInfo),
      triggerEvent: this.genTriggerEvent(scenario),
      situation: this.genSituation(scenario),
      intelItems: this.genIntel(scenario),
      /* 阵营信息 */
      playerSide: (sideInfo && sideInfo.playerSide) || null,
      opponentSide: (sideInfo && sideInfo.opponentSide) || null,
      gameMode: (sideInfo && sideInfo.mode) || 'single',
      sideColor,
    };

    this.render();
  },

  /* ===== 生成任务目标 ===== */
  genObjectives(scenario, sideInfo){
    const objs = [];
    /* 判断是否为非国家行为体 */
    const sideColor = (sideInfo && sideInfo.sideColor) || 'red';
    let isNonState = false;
    if(sideColor === 'blue'){
      const sides = (typeof getScenarioSides === 'function') ? getScenarioSides(scenario.id) : null;
      const blueSide = sides ? sides.blue : null;
      const playerSideObj = (sideInfo && sideInfo.playerSide) || null;
      if((blueSide && blueSide.nonStateActor) || (playerSideObj && playerSideObj.nonStateActor)){
        isNonState = true;
      }
    }

    const domainObjs = isNonState ? {
      military:   ['维持组织生存能力','保持袭击能力','避免被全面围剿'],
      economic:   ['维持资金链条','保障组织运营','拓展资金来源'],
      cyber:      ['保持网络渗透能力','保护组织通信安全','持续网络袭扰'],
      diplomatic: ['避免国际联合打击','争取灰色空间','分化对手联盟'],
      space:      ['利用太空信息漏洞','维持情报获取能力','干扰对方太空资产'],
      information:['掌控舆论叙事','扩大影响力传播','瓦解对手士气'],
    } : {
      military:   ['维护领土主权完整','保持有效军事威慑','防止冲突升级至战争'],
      economic:   ['保障经济安全运行','维护关键供应链稳定','减少制裁负面影响'],
      cyber:      ['确保网络空间安全','保护关键信息基础设施','溯源并反制网络攻击'],
      diplomatic: ['维护国际影响力','突破战略围堵','巩固盟友关系'],
      space:      ['保障太空资产安全','维护轨道资源权益','建立太空规则话语权'],
      information:['掌握舆论主导权','反击虚假信息渗透','维护国家形象'],
    };
    const list = domainObjs[scenario.domain] || domainObjs.military;
    list.forEach(text => objs.push({ text, type:'primary' }));
    if(isNonState){
      /* 非国家行为体不设声望门槛，组织凝聚力要求较低 */
      objs.push({ text:'组织凝聚力不低于30', type:'threshold', metric:'domesticSupport', min:30 });
      objs.push({ text:'避免升级度超过4级(引发全面打击)', type:'threshold', metric:'escalation', max:4 });
    } else {
      objs.push({ text:'国际声望不低于40', type:'threshold', metric:'reputation', min:40 });
      objs.push({ text:'国内支持度不低于50', type:'threshold', metric:'domesticSupport', min:50 });
      objs.push({ text:'升级度不超过4级', type:'threshold', metric:'escalation', max:4 });
    }
    return objs;
  },

  /* ===== 生成触发事件 ===== */
  genTriggerEvent(scenario){
    const firstSentence = scenario.background.split('。')[0] + '。';
    return {
      title:'触发事件',
      time: new Date().toLocaleString('zh-CN',{ month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit' }),
      desc: firstSentence,
      severity: scenario.threatLevel,
      type: scenario.domain,
    };
  },

  /* ===== 生成态势评估 ===== */
  genSituation(scenario){
    const dm = DOMAIN_MAP[scenario.domain] || DOMAIN_MAP.military;
    const domainData = DOMAINS.find(d => d.id === scenario.domain);
    const threats = THREATS.filter(t => t.type === scenario.domain || scenario.response.includes(t.type));
    const forcesAvg = FORCES.reduce((s,f) => s + f.readiness, 0) / FORCES.length;
    return {
      background: scenario.background,
      domainName: dm.label,
      domainIcon: dm.icon,
      domainColor: dm.color,
      domainReadiness: domainData ? domainData.readiness : 50,
      domainTrend: domainData ? domainData.trend : 0,
      forcesAvg: Math.round(forcesAvg),
      threatCount: threats.length,
      threatLevel: scenario.threatLevel,
      actors: scenario.actors,
      responseDomains: scenario.response.map(r => DOMAIN_MAP[r] || DOMAIN_MAP.military),
    };
  },

  /* ===== 过滤相关情报 ===== */
  genIntel(scenario){
    return INTEL.filter(i =>
      scenario.response.includes(i.type) || i.type === scenario.domain
    ).slice(0, 5);
  },

  /* ===== 提升军种战备 ===== */
  boostForce(code){
    const current = this.state.boosts[code] || 0;
    if(current >= 20) return;
    if(this.state.budget < this.state.boostCost) return;
    this.state.boosts[code] = current + 5;
    this.state.budget -= this.state.boostCost;
    this.updateForcePanel();
  },

  /* ===== 降低军种战备（回收资金）===== */
  reduceForce(code){
    const current = this.state.boosts[code] || 0;
    if(current <= 0) return;
    this.state.boosts[code] = current - 5;
    this.state.budget += this.state.boostCost;
    this.updateForcePanel();
  },

  /* ===== 进入推演 ===== */
  proceed(){
    try {
      const adjustedForces = this.state.forces.map(f => ({
        ...f,
        readiness: Math.min(100, f.readiness + (this.state.boosts[f.code] || 0)),
      }));

      Wargame.enter(this.state.scenario, {
        forces: adjustedForces,
        budget: this.state.budget,
        objectives: this.state.objectives,
        directorIntel: this.state.intelItems,
        directorBoosts: {...this.state.boosts},
        directorBudgetSpent: this.state.initialBudget - this.state.budget,
        playerSide: this.state.playerSide,
        opponentSide: this.state.opponentSide,
        gameMode: this.state.gameMode,
        sideColor: this.state.sideColor,
      });
    } catch(e){
      console.error('[Director] 推演引擎初始化失败:', e.message, e.stack);
      const btn = document.getElementById('dirProceed');
      if(btn){ btn.textContent = '▶ 确认推进 · 进入推演'; btn.disabled = false; }
      const content = document.getElementById('tabContent');
      if(content){
        content.innerHTML = `<div style="padding:40px;text-align:center">
          <div style="font-size:18px;color:var(--red);margin-bottom:10px">⚠️ 推演引擎初始化失败</div>
          <div style="font-size:13px;color:var(--txt-1);margin-bottom:6px">错误信息: ${esc2(e.message)}</div>
          <div style="font-size:12px;color:var(--txt-2);margin-bottom:20px">请刷新页面重试，或检查控制台获取详细错误信息</div>
          <button class="btn" onclick="location.reload()">刷新页面</button>
        </div>`;
      }
    }
  },

  /* ===== 退出 ===== */
  exit(){
    this.state = null;
    const main = document.querySelector('.main');
    const tabBar = main.querySelector('.tab-bar');
    if(tabBar) tabBar.style.display = '';
    App.switchTab('scenarios');
  },

  /* ===== 渲染导调界面 ===== */
  render(){
    const main = document.querySelector('.main');
    const tabBar = main.querySelector('.tab-bar');
    if(tabBar) tabBar.style.display = 'none';

    const s = this.state;
    const sc = s.scenario;
    const sit = s.situation;
    const dm = DOMAIN_MAP[sc.domain] || DOMAIN_MAP.military;
    const content = document.getElementById('tabContent');

    content.innerHTML = `
      <div class="dir-view fade-in">
        <!-- 导调控制栏 -->
        <div class="dir-topbar">
          <div class="dir-topbar-left">
            <button class="wg-exit" id="dirExit">← 退出</button>
            <div class="dir-title">
              <span class="dir-badge">导调阶段</span>
              <span class="dir-scene-name">${esc2(sc.name)}</span>
              <span class="dir-scene-code">${esc2(sc.code)}</span>
            </div>
            ${s.playerSide ? `
              <div class="dir-side-info">
                <span class="dir-side-badge" style="background:${s.playerSide.color}22;color:${s.playerSide.color};border:1px solid ${s.playerSide.color}44">
                  ${s.playerSide.icon} ${esc2(s.playerSide.name)} (我方)
                </span>
                <span style="color:var(--txt-2);font-size:12px">对战</span>
                <span class="dir-side-badge" style="background:${s.opponentSide ? s.opponentSide.color : '#00b4d8'}22;color:${s.opponentSide ? s.opponentSide.color : '#00b4d8'};border:1px solid ${s.opponentSide ? s.opponentSide.color : '#00b4d8'}44">
                  ${s.opponentSide ? s.opponentSide.icon : '⚔️'} ${esc2(s.opponentSide ? s.opponentSide.name : '对手方')}
                </span>
                <span class="dir-side-badge" style="background:rgba(0,180,216,.12);color:var(--cyan);border:1px solid rgba(0,180,216,.3)">🎯 AI导调方</span>
                ${s.gameMode === 'multi' ? '<span class="dir-side-badge" style="background:rgba(255,165,2,.08);color:var(--amber);border:1px solid rgba(255,165,2,.2)">🌐 联机对战</span>' : ''}
              </div>
            ` : ''}
          </div>
          <div class="dir-topbar-right">
            <div class="dir-fund">
              <span class="dir-fund-label">💰 可用资金</span>
              <span class="dir-fund-val">${s.budget}<span class="dir-fund-unit">亿</span></span>
            </div>
          </div>
        </div>

        <!-- 导调正文 -->
        <div class="dir-body">

          <!-- 1. 战略态势简报 -->
          <div class="dir-section dir-situation">
            <div class="dir-sec-head">
              <span class="dir-sec-num">01</span>
              <span class="dir-sec-title">📋 战略态势简报</span>
              <span class="dir-sec-tag" style="background:${dm.color}22;color:${dm.color};border-color:${dm.color}44">${dm.icon} ${sit.domainName}域</span>
            </div>
            <div class="dir-sec-body">
              <div class="dir-sit-text">${esc2(sit.background)}</div>
              <div class="dir-sit-grid">
                <div class="dir-sit-stat">
                  <div class="dir-ss-label">域战备度</div>
                  <div class="dir-ss-val" style="color:${sit.domainReadiness >= 70 ? 'var(--green)' : 'var(--amber)'}">${sit.domainReadiness}%</div>
                  <div class="dir-ss-sub">${sit.domainTrend > 0 ? '↑ 上升' : sit.domainTrend < 0 ? '↓ 下降' : '─ 平稳'}</div>
                </div>
                <div class="dir-sit-stat">
                  <div class="dir-ss-label">综合军力</div>
                  <div class="dir-ss-val" style="color:var(--cyan)">${sit.forcesAvg}%</div>
                  <div class="dir-ss-sub">${(typeof FORCES !== 'undefined' ? FORCES.length : 11)}军种均值</div>
                </div>
                <div class="dir-sit-stat">
                  <div class="dir-ss-label">威胁等级</div>
                  <div class="dir-ss-val" style="color:var(--red)">${sit.threatLevel}/5</div>
                  <div class="dir-ss-sub">${sit.threatCount}个活跃向量</div>
                </div>
                <div class="dir-sit-stat">
                  <div class="dir-ss-label">推演时长</div>
                  <div class="dir-ss-val" style="color:var(--amber)">${sc.duration}轮</div>
                  <div class="dir-ss-sub">难度 ${'★'.repeat(sc.difficulty)}</div>
                </div>
              </div>
              <div class="dir-sit-actors">
                <span class="dir-actors-label">参与方：</span>
                ${sit.actors.map(a => `<span class="dir-actor-tag">${esc2(a)}</span>`).join('')}
              </div>
              <div class="dir-sit-response">
                <span class="dir-actors-label">响应域：</span>
                ${sit.responseDomains.map(r => `<span class="dir-actor-tag" style="background:${r.color}22;color:${r.color};border-color:${r.color}44">${r.icon} ${r.label}</span>`).join('')}
              </div>
            </div>
          </div>

          <!-- 2. 情报预警 + 3. 触发事件 -->
          <div class="dir-two-col">
            <div class="dir-section dir-intel-warn">
              <div class="dir-sec-head">
                <span class="dir-sec-num">02</span>
                <span class="dir-sec-title">🔍 情报预警</span>
                <span class="dir-sec-tag" style="background:rgba(0,180,216,.12);color:var(--cyan);border-color:rgba(0,180,216,.3)">${s.intelItems.length}条</span>
              </div>
              <div class="dir-sec-body dir-intel-list">
                ${s.intelItems.length === 0
                  ? '<div class="dir-empty">无相关情报</div>'
                  : s.intelItems.map(i => {
                    const idm = DOMAIN_MAP[i.type] || DOMAIN_MAP.intel;
                    const relColor = i.reliability === 'A' ? 'var(--green)' : i.reliability === 'B' ? 'var(--amber)' : 'var(--red)';
                    return `
                      <div class="dir-intel-item">
                        <div class="dir-ii-head">
                          <span class="dir-ii-source ${i.source}">${i.source}</span>
                          <span class="dir-ii-rel" style="color:${relColor};border-color:${relColor}44">可靠度 ${i.reliability}</span>
                          <span style="font-size:12px;color:${idm.color}">${idm.icon} ${idm.label}</span>
                        </div>
                        <div class="dir-ii-title">${esc2(i.title)}</div>
                        <div class="dir-ii-summary">${esc2(i.summary)}</div>
                        ${i.modifier ? `<div class="dir-ii-mod">→ 推演修正: <span style="color:${idm.color}">${idm.icon} ${idm.label}域 ${i.modifier.bonus > 0 ? '+' : ''}${i.modifier.bonus}%</span></div>` : ''}
                      </div>
                    `;
                  }).join('')
                }
              </div>
            </div>

            <div class="dir-section dir-trigger">
              <div class="dir-sec-head">
                <span class="dir-sec-num">03</span>
                <span class="dir-sec-title">⚡ 触发事件</span>
              </div>
              <div class="dir-sec-body">
                <div class="dir-trigger-time">${esc2(s.triggerEvent.time)}</div>
                <div class="dir-trigger-desc">${esc2(s.triggerEvent.desc)}</div>
                <div class="dir-trigger-sev">
                  <span class="dir-ts-label">严重度</span>
                  <div class="dir-ts-bar">
                    ${Array.from({length:5}, (_,i) =>
                      `<div class="dir-ts-cell ${i < s.triggerEvent.severity ? 'active' : ''}" style="background:${i < s.triggerEvent.severity ? 'var(--red)' : ''}"></div>`
                    ).join('')}
                  </div>
                  <span class="dir-ts-val" style="color:var(--red)">${s.triggerEvent.severity}/5</span>
                </div>
                <div class="dir-trigger-assessment">
                  <span class="dir-ta-label">导调研判：</span>
                  <span class="dir-ta-text">${this.genAssessment(sc)}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 4. 力量调配 -->
          <div class="dir-section dir-force-alloc">
            <div class="dir-sec-head">
              <span class="dir-sec-num">04</span>
              <span class="dir-sec-title">⚔️ 力量调配</span>
              <span class="dir-sec-hint">消耗资金提升战备 · 每+5%花费${s.boostCost}亿 · 最多+20%</span>
            </div>
            <div class="dir-sec-body" id="dirForcePanel">
              ${this.renderForcePanel()}
            </div>
          </div>

          <!-- 5. 任务目标 -->
          <div class="dir-section dir-objectives">
            <div class="dir-sec-head">
              <span class="dir-sec-num">05</span>
              <span class="dir-sec-title">🎯 任务目标</span>
            </div>
            <div class="dir-sec-body">
              <div class="dir-obj-list">
                ${s.objectives.map((o, i) => `
                  <div class="dir-obj-item">
                    <span class="dir-obj-num">${i + 1}</span>
                    <span class="dir-obj-text">${esc2(o.text)}</span>
                    <span class="dir-obj-type ${o.type}">${o.type === 'primary' ? '主要目标' : '底线条件'}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- 进入推演 -->
          <div class="dir-proceed">
            <button class="btn dir-proceed-btn" id="dirProceed">
              ▶ 进入推演 · ${sc.duration}轮博弈
            </button>
          </div>

        </div>
      </div>
    `;

    document.getElementById('dirExit').addEventListener('click', () => this.exit());
    document.getElementById('dirProceed').addEventListener('click', () => {
      const btn = document.getElementById('dirProceed');
      btn.textContent = '引擎初始化中...';
      btn.disabled = true;
      setTimeout(() => this.proceed(), 500);
    });
    this.bindForceButtons();
  },

  /* ===== 生成导调研判文本 ===== */
  genAssessment(sc){
    const assessments = {
      military: '当前军事态势严峻，敌方兵力集结明显，存在擦枪走火风险。建议优先提升海军和空军战备，保持有效威慑，同时预留外交斡旋空间。',
      economic: '经济安全面临系统性挑战，制裁与封锁压力持续增大。建议重点保障经济运行韧性，同时加强外交分化，避免全面经济对抗。',
      cyber: '网络空间威胁等级高，关键基础设施面临持续攻击。建议优先加固网络防御，加强网络空间部队力量，做好溯源反制准备。',
      diplomatic: '外交战线面临多方围堵，战略空间受到挤压。建议巩固现有盟友关系，积极拓展新伙伴，避免孤立。',
      space: '太空域竞争加剧，轨道资源争夺白热化。建议保障太空资产安全，加速自主星座建设，同时推动国际规则制定。',
      information: '信息舆论战场态势复杂，虚假信息渗透严重。建议加强舆论反击能力，掌握叙事主导权，维护国家形象。',
    };
    return assessments[sc.domain] || assessments.military;
  },

  /* ===== 渲染力量调配面板 ===== */
  renderForcePanel(){
    const s = this.state;
    const totalBoosted = Object.values(s.boosts).reduce((a,v) => a + v, 0);
    const budgetUsed = s.initialBudget - s.budget;

    return `
      <div class="dir-fa-summary">
        <div class="dir-fa-stat">
          <span class="dir-fa-label">已调配</span>
          <span class="dir-fa-val" style="color:var(--cyan)">+${totalBoosted}%</span>
        </div>
        <div class="dir-fa-stat">
          <span class="dir-fa-label">已消耗</span>
          <span class="dir-fa-val" style="color:var(--amber)">${budgetUsed}亿</span>
        </div>
        <div class="dir-fa-stat">
          <span class="dir-fa-label">剩余资金</span>
          <span class="dir-fa-val" style="color:var(--green)">${s.budget}亿</span>
        </div>
        <div class="dir-fa-hint">
          ${s.budget < s.boostCost ? '<span style="color:var(--red)">⚠ 资金不足，无法继续调配</span>' : '提示: 战备度越高，对应域行动成功率越高'}
        </div>
      </div>
      <div class="dir-fa-list">
        ${s.forces.map(f => {
          const boost = s.boosts[f.code] || 0;
          const adjusted = Math.min(100, f.readiness + boost);
          const color = adjusted >= 85 ? 'var(--green)' : adjusted >= 70 ? 'var(--cyan)' : adjusted >= 55 ? 'var(--amber)' : 'var(--red)';
          const gradient = adjusted >= 85 ? 'linear-gradient(90deg,var(--green-dim),var(--green))'
                         : adjusted >= 70 ? 'linear-gradient(90deg,var(--cyan-dim),var(--cyan))'
                         : adjusted >= 55 ? 'linear-gradient(90deg,var(--amber-dim),var(--amber))'
                         : 'linear-gradient(90deg,var(--red-dim),var(--red))';
          return `
            <div class="dir-fa-row">
              <span class="dir-fa-icon">${f.icon}</span>
              <div class="dir-fa-info">
                <span class="dir-fa-name">${esc2(f.branch)}</span>
                <span class="dir-fa-code">${f.code}</span>
              </div>
              <div class="dir-fa-bar-wrap">
                <div class="dir-fa-bar"><div class="dir-fa-fill" style="width:${adjusted}%;background:${gradient}"></div></div>
                ${boost > 0 ? `<span class="dir-fa-boost">+${boost}</span>` : ''}
              </div>
              <span class="dir-fa-val" style="color:${color}">${adjusted}</span>
              <div class="dir-fa-btns">
                <button class="dir-fa-btn minus" data-force="${f.code}" ${boost <= 0 ? 'disabled' : ''}>−</button>
                <button class="dir-fa-btn plus" data-force="${f.code}" ${boost >= 20 || s.budget < s.boostCost ? 'disabled' : ''}>+5%</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  /* ===== 更新力量调配面板 ===== */
  updateForcePanel(){
    const fundEl = document.querySelector('.dir-fund-val');
    if(fundEl) fundEl.innerHTML = `${this.state.budget}<span class="dir-fund-unit">亿</span>`;
    const panel = document.getElementById('dirForcePanel');
    if(panel){
      panel.innerHTML = this.renderForcePanel();
      this.bindForceButtons();
    }
  },

  /* ===== 绑定力量按钮 ===== */
  bindForceButtons(){
    document.querySelectorAll('.dir-fa-btn.plus').forEach(btn => {
      btn.addEventListener('click', () => this.boostForce(btn.getAttribute('data-force')));
    });
    document.querySelectorAll('.dir-fa-btn.minus').forEach(btn => {
      btn.addEventListener('click', () => this.reduceForce(btn.getAttribute('data-force')));
    });
  },
};
