/* ================================================================
 * NSS-WGS v6.0 — 推演复盘报告 (After-Action Review)
 *
 * 推演结束后生成20节全面评估报告:
 *  1. 执行摘要           11. 升级管控评估
 *  2. 场景背景           12. 资金管理分析
 *  3. 导调简报回顾       13. 声望与国内支持
 *  4. 力量态势评估       14. 对手反应分析
 *  5. 情报评估           15. 关键成功因素
 *  6. 逐轮分析           16. 关键失败因素
 *  7. 关键决策点         17. 替代策略建议
 *  8. 行动效能分析       18. 经验教训
 *  9. 力量战备影响       19. 绩效指标
 * 10. 情报利用分析       20. 未来行动建议
 *
 * 支持打印输出（window.print + @media print CSS）
 * ================================================================ */

const AAR = {
  report: null,

  /* ===== 生成报告 ===== */
  generate(wargameState){
    const s = wargameState;
    const sc = s.scenario;
    const sb = s.scoreBreakdown;

    /* 汇总统计 */
    const allDice = s.log.flatMap(l => l.diceResults || []);
    const greatCount = allDice.filter(d => d.outcome === 'great').length;
    const successCount = allDice.filter(d => d.outcome === 'success').length;
    const failCount = allDice.filter(d => d.outcome === 'fail').length;
    const totalActions = allDice.length;
    const successRate = totalActions > 0 ? Math.round((greatCount + successCount) / totalActions * 100) : 0;

    const totalSpent = s.maxFunding - s.funding;
    const spendingRatio = Math.round(totalSpent / s.maxFunding * 100);

    const forcesStart = s.forceHistory && s.forceHistory[0] ? s.forceHistory[0] : s.forces.map(f => ({...f}));
    const forcesEnd = s.forces;
    const forcesDelta = forcesEnd.map((f, i) => {
      const start = forcesStart[i] ? forcesStart[i].readiness : f.readiness;
      return { ...f, delta: f.readiness - start };
    });

    const domainsStart = 50;
    const domainsEnd = s.domains;

    /* 目标达成情况 */
    const objectives = s.objectives || [];
    const objResults = objectives.map(o => {
      if(o.type === 'threshold'){
        const val = o.metric === 'reputation' ? s.reputation
                  : o.metric === 'domesticSupport' ? s.domesticSupport
                  : o.metric === 'escalation' ? s.escalation : 0;
        const achieved = o.min ? val >= o.min : o.max ? val <= o.max : true;
        return { ...o, current: val, achieved };
      }
      return { ...o, achieved: s.finalScore >= 60 };
    });

    this.report = {
      scenario: sc,
      state: s,
      stats: {
        greatCount, successCount, failCount, totalActions, successRate,
        totalSpent, spendingRatio, forcesDelta, domainsStart, domainsEnd,
        objResults, allDice,
        rounds: s.maxRounds,
        score: s.finalScore,
        grade: s.grade,
      },
      generatedAt: new Date().toLocaleString('zh-CN'),
    };

    this.render();
  },

  /* ===== 渲染报告 ===== */
  render(){
    const main = document.querySelector('.main');
    const tabBar = main.querySelector('.tab-bar');
    if(tabBar) tabBar.style.display = 'none';

    const r = this.report;
    const s = r.state;
    const sc = r.scenario;
    const st = r.stats;
    const sb = s.scoreBreakdown;
    const content = document.getElementById('tabContent');

    content.innerHTML = `
      <div class="aar-view fade-in">
        <!-- 报告控制栏 -->
        <div class="aar-topbar no-print">
          <div class="aar-topbar-left">
            <button class="wg-exit" id="aarExit">← 退出</button>
            <div class="aar-title">
              <span class="aar-badge">复盘报告</span>
              <span class="aar-scene-name">${esc2(sc.name)}</span>
            </div>
          </div>
          <div class="aar-topbar-right">
            <button class="btn btn-sm" id="aarPrint">🖨 打印报告</button>
            <button class="btn btn-sm btn-amber" id="aarBack">返回场景库</button>
          </div>
        </div>

        <!-- 报告正文 -->
        <div class="aar-report">

          <!-- 封面/目录 -->
          <div class="aar-cover aar-page">
            <div class="aar-cover-top">
              <div class="aar-cover-class">机密</div>
              <div class="aar-cover-title">国家安全战略兵棋推演</div>
              <div class="aar-cover-subtitle">推演复盘评估报告</div>
              <div class="aar-cover-line"></div>
              <div class="aar-cover-scene">${esc2(sc.name)}</div>
              <div class="aar-cover-code">${esc2(sc.code)}</div>
            </div>
            <div class="aar-cover-info">
              <div class="aar-ci-row"><span>推演日期</span><span>${r.generatedAt}</span></div>
              <div class="aar-ci-row"><span>推演轮次</span><span>${st.rounds}轮</span></div>
              <div class="aar-ci-row"><span>最终评级</span><span style="color:${s.gradeColor};font-weight:700;font-size:18px">${st.grade}级 (${st.score}分)</span></div>
              <div class="aar-ci-row"><span>报告编号</span><span>复盘-${sc.code}-${Date.now().toString(36).toUpperCase().slice(-6)}</span></div>
            </div>
            <div class="aar-cover-toc">
              <div class="aar-toc-title">目录</div>
              <div class="aar-toc-grid">
                <div class="aar-toc-col">
                  <div class="aar-toc-item"><span class="aar-toc-num">01</span>执行摘要</div>
                  <div class="aar-toc-item"><span class="aar-toc-num">02</span>场景背景</div>
                  <div class="aar-toc-item"><span class="aar-toc-num">03</span>导调简报回顾</div>
                  <div class="aar-toc-item"><span class="aar-toc-num">04</span>力量态势评估</div>
                  <div class="aar-toc-item"><span class="aar-toc-num">05</span>情报评估</div>
                  <div class="aar-toc-item"><span class="aar-toc-num">06</span>逐轮分析</div>
                  <div class="aar-toc-item"><span class="aar-toc-num">07</span>关键决策点</div>
                </div>
                <div class="aar-toc-col">
                  <div class="aar-toc-item"><span class="aar-toc-num">08</span>行动效能分析</div>
                  <div class="aar-toc-item"><span class="aar-toc-num">09</span>力量战备影响</div>
                  <div class="aar-toc-item"><span class="aar-toc-num">10</span>情报利用分析</div>
                  <div class="aar-toc-item"><span class="aar-toc-num">11</span>升级管控评估</div>
                  <div class="aar-toc-item"><span class="aar-toc-num">12</span>资金管理分析</div>
                  <div class="aar-toc-item"><span class="aar-toc-num">13</span>声望与国内支持</div>
                  <div class="aar-toc-item"><span class="aar-toc-num">14</span>对手反应分析</div>
                </div>
                <div class="aar-toc-col">
                  <div class="aar-toc-item"><span class="aar-toc-num">15</span>关键成功因素</div>
                  <div class="aar-toc-item"><span class="aar-toc-num">16</span>关键失败因素</div>
                  <div class="aar-toc-item"><span class="aar-toc-num">17</span>替代策略建议</div>
                  <div class="aar-toc-item"><span class="aar-toc-num">18</span>经验教训</div>
                  <div class="aar-toc-item"><span class="aar-toc-num">19</span>绩效指标</div>
                  <div class="aar-toc-item"><span class="aar-toc-num">20</span>未来行动建议</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 01 执行摘要 -->
          <div class="aar-section aar-page">
            <div class="aar-sec-header"><span class="aar-sec-num">01</span><span class="aar-sec-title">执行摘要</span></div>
            <div class="aar-sec-content">
              <p>本报告对${esc2(sc.name)}（编号${esc2(sc.code)}）兵棋推演进行全面复盘评估。本次推演历时${st.rounds}轮，最终评级为<span style="color:${s.gradeColor};font-weight:700">${st.grade}级（${st.score}分）</span>，总体表现评估为"${esc2(s.gradeDesc)}"。</p>
              <p>推演过程中，指挥部共执行${st.totalActions}项战略行动，其中大成功${st.greatCount}项、成功${st.successCount}项、失败${st.failCount}项，行动成功率为${st.successRate}%。资金消耗${st.totalSpent}亿元（占初始预算${st.spendingRatio}%），最终国际声望${s.reputation}、国内支持度${s.domesticSupport}、局势升级度${s.escalation}级。</p>
              <p>${this.genSummaryAssessment(st, s)}</p>
              <div class="aar-key-facts">
                <div class="aar-kf-item"><span class="aar-kf-label">最终评分</span><span class="aar-kf-val" style="color:${s.gradeColor}">${st.score}/100</span></div>
                <div class="aar-kf-item"><span class="aar-kf-label">行动成功率</span><span class="aar-kf-val" style="color:${st.successRate >= 70 ? 'var(--green)' : st.successRate >= 50 ? 'var(--amber)' : 'var(--red)'}">${st.successRate}%</span></div>
                <div class="aar-kf-item"><span class="aar-kf-label">资金使用率</span><span class="aar-kf-val" style="color:var(--amber)">${st.spendingRatio}%</span></div>
                <div class="aar-kf-item"><span class="aar-kf-label">目标达成</span><span class="aar-kf-val" style="color:${st.objResults.filter(o => o.achieved).length >= st.objResults.length * 0.7 ? 'var(--green)' : 'var(--red)'}">${st.objResults.filter(o => o.achieved).length}/${st.objResults.length}</span></div>
              </div>
            </div>
          </div>

          <!-- 02 场景背景 -->
          <div class="aar-section aar-page">
            <div class="aar-sec-header"><span class="aar-sec-num">02</span><span class="aar-sec-title">场景背景</span></div>
            <div class="aar-sec-content">
              <p>${esc2(sc.background)}</p>
              <div class="aar-info-table">
                <div class="aar-it-row"><span>场景编号</span><span>${esc2(sc.code)}</span></div>
                <div class="aar-it-row"><span>场景类型</span><span>${esc2(sc.type)}</span></div>
                <div class="aar-it-row"><span>威胁等级</span><span style="color:var(--red)">${sc.threatLevel}/5</span></div>
                <div class="aar-it-row"><span>难度系数</span><span>${'★'.repeat(sc.difficulty)}${'☆'.repeat(5 - sc.difficulty)}</span></div>
                <div class="aar-it-row"><span>推演时长</span><span>${sc.duration}轮</span></div>
                <div class="aar-it-row"><span>主要参与方</span><span>${sc.actors.map(a => esc2(a)).join('、')}</span></div>
                <div class="aar-it-row"><span>响应域</span><span>${sc.response.map(r => { const dm = DOMAIN_MAP[r] || {}; return (dm.icon || '') + ' ' + (dm.label || r); }).join('、')}</span></div>
                <div class="aar-it-row"><span>起始资金</span><span>${sc.budget}亿元</span></div>
                <div class="aar-it-row"><span>起始声望</span><span>${sc.reputation}</span></div>
                <div class="aar-it-row"><span>起始国内支持</span><span>${sc.domesticSupport}</span></div>
              </div>
              <p>该场景涉及${sc.actors.length}个主要参与方，响应域覆盖${sc.response.length}个安全域。场景难度为${sc.difficulty}/5级，威胁等级${sc.threatLevel}/5级，需要指挥部在${sc.duration}轮博弈中做出精准战略决策。</p>
            </div>
          </div>

          <!-- 03 导调简报回顾 -->
          <div class="aar-section aar-page">
            <div class="aar-sec-header"><span class="aar-sec-num">03</span><span class="aar-sec-title">导调简报回顾</span></div>
            <div class="aar-sec-content">
              <p>推演前，导调部门对当前战略态势进行了全面研判，向指挥部提供了态势简报、情报预警、触发事件通报和力量调配建议。</p>
              ${s.directorBoosts && Object.keys(s.directorBoosts).length > 0 ? `
                <p>指挥部在导调阶段进行了力量调配，共消耗${s.directorBudgetSpent || 0}亿元资金提升军种战备。具体调配方案如下：</p>
                <div class="aar-info-table">
                  ${Object.entries(s.directorBoosts).filter(([k,v]) => v > 0).map(([code, boost]) => {
                    const f = FORCES.find(f => f.code === code);
                    return `<div class="aar-it-row"><span>${f ? esc2(f.branch) : code}</span><span style="color:var(--green)">+${boost}%（消耗${Math.round((s.directorBudgetSpent || 0) / Object.values(s.directorBoosts).filter(v => v > 0).reduce((a,v) => a + v/5, 0) * (boost/5))}亿）</span></div>`;
                  }).join('')}
                </div>
              ` : '<p>指挥部在导调阶段未进行额外力量调配，以基础战备状态进入推演。</p>'}
              <p>任务目标设定为${st.objResults.length}项，其中主要目标${st.objResults.filter(o => o.type === 'primary').length}项、底线条件${st.objResults.filter(o => o.type === 'threshold').length}项。最终达成情况：</p>
              <div class="aar-obj-results">
                ${st.objResults.map((o, i) => `
                  <div class="aar-obj-row ${o.achieved ? 'achieved' : 'failed'}">
                    <span class="aar-obj-icon">${o.achieved ? '✓' : '✗'}</span>
                    <span class="aar-obj-text">${esc2(o.text)}</span>
                    ${o.type === 'threshold' ? `<span class="aar-obj-val">${o.current}</span>` : ''}
                    <span class="aar-obj-status">${o.achieved ? '已达成' : '未达成'}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- 04 力量态势评估 -->
          <div class="aar-section aar-page">
            <div class="aar-sec-header"><span class="aar-sec-num">04</span><span class="aar-sec-title">力量态势评估</span></div>
            <div class="aar-sec-content">
              <p>本节对推演过程中各军种战备状态的变化进行评估。力量战备是行动成功率的核心修正因素，战备度越高，对应域行动的成功率越高。</p>
              <table class="aar-table">
                <thead><tr><th>军种</th><th>代码</th><th>初始战备</th><th>最终战备</th><th>变化量</th><th>评估</th></tr></thead>
                <tbody>
                  ${st.forcesDelta.map(f => {
                    const delta = f.delta;
                    const deltaColor = delta > 0 ? 'var(--green)' : delta < 0 ? 'var(--red)' : 'var(--txt-2)';
                    const deltaStr = delta > 0 ? `+${delta}` : `${delta}`;
                    const assessment = f.readiness >= 80 ? '战备良好' : f.readiness >= 60 ? '基本就绪' : f.readiness >= 40 ? '战备不足' : '严重消耗';
                    const assColor = f.readiness >= 80 ? 'var(--green)' : f.readiness >= 60 ? 'var(--cyan)' : f.readiness >= 40 ? 'var(--amber)' : 'var(--red)';
                    return `<tr>
                      <td>${f.icon} ${esc2(f.branch)}</td><td>${f.code}</td>
                      <td>${f.readiness - delta}%</td><td>${f.readiness}%</td>
                      <td style="color:${deltaColor};font-weight:600">${deltaStr}</td>
                      <td style="color:${assColor}">${assessment}</td>
                    </tr>`;
                  }).join('')}
                </tbody>
              </table>
              <p>${this.genForceAssessment(st.forcesDelta)}</p>
            </div>
          </div>

          <!-- 05 情报评估 -->
          <div class="aar-section aar-page">
            <div class="aar-sec-header"><span class="aar-sec-num">05</span><span class="aar-sec-title">情报评估</span></div>
            <div class="aar-sec-content">
              <p>情报中心在推演过程中为指挥部提供了关键情报修正，直接影响各域行动的成功率计算。情报按可靠度分级（A=完全可信×1.0，B=较可信×0.7，C=待验证×0.4）转化为域加成。</p>
              <p>本次推演中，共有${s.intel ? s.intel.length : 0}条情报被纳入推演引擎，产生${Object.keys(s.activeIntelMods || {}).length}项域修正加成。</p>
              <div class="aar-info-table">
                ${Object.entries(s.activeIntelMods || {}).map(([d, b]) => {
                  const dm = WG_DOMAINS.find(w => w.id === d) || DOMAIN_MAP[d];
                  return `<div class="aar-it-row"><span>${dm ? dm.icon + ' ' + dm.name : d}域修正</span><span style="color:${b > 0 ? 'var(--green)' : 'var(--red)'}">${b > 0 ? '+' : ''}${b}%</span></div>`;
                }).join('')}
                ${Object.keys(s.activeIntelMods || {}).length === 0 ? '<div class="aar-it-row"><span>情报修正</span><span>无活跃修正</span></div>' : ''}
              </div>
              <p>${this.genIntelAssessment(s)}</p>
            </div>
          </div>

          <!-- 06 逐轮分析 -->
          <div class="aar-section aar-page">
            <div class="aar-sec-header"><span class="aar-sec-num">06</span><span class="aar-sec-title">逐轮分析</span></div>
            <div class="aar-sec-content">
              ${s.log.map((l, i) => `
                <div class="aar-round-block">
                  <div class="aar-round-head">第${l.round}轮</div>
                  <div class="aar-round-body">
                    <div class="aar-round-section">
                      <span class="aar-rs-label">我方行动：</span>
                      ${l.playerActions.map(a => `<span class="aar-rs-tag pos">${esc2(a)}</span>`).join('')}
                    </div>
                    <div class="aar-round-section">
                      <span class="aar-rs-label">敌方反制：</span>
                      <span class="aar-rs-tag neg">${esc2(l.aiAction)}</span>
                      <span class="aar-rs-desc">${esc2(l.aiActionDesc || '')}</span>
                    </div>
                    ${l.diceResults && l.diceResults.length > 0 ? `
                      <div class="aar-round-section">
                        <span class="aar-rs-label">骰子裁决：</span>
                        ${l.diceResults.map(dr => {
                          const cls = dr.outcome === 'great' ? 'great' : dr.outcome === 'success' ? 'pos' : 'neg';
                          const label = dr.outcome === 'great' ? '大成功' : dr.outcome === 'success' ? '成功' : '失败';
                          return `<span class="aar-rs-tag ${cls}">${esc2(dr.action.name)}: 🎲${dr.roll}/${dr.successRate} ${label}</span>`;
                        }).join('')}
                      </div>
                    ` : ''}
                    <div class="aar-round-section">
                      <span class="aar-rs-label">域分变化：</span>
                      ${Object.entries(l.changes).filter(([k,v]) => v !== 0).map(([k,v]) => {
                        const dm = WG_DOMAINS.find(d => d.id === k);
                        const sign = v > 0 ? '+' : '';
                        const cls = v > 0 ? 'pos' : 'neg';
                        return `<span class="aar-rs-chg ${cls}">${dm ? dm.icon : ''} ${sign}${v}</span>`;
                      }).join('')}
                      ${l.repChange ? `<span class="aar-rs-chg ${l.repChange > 0 ? 'pos' : 'neg'}">🌍 ${l.repChange > 0 ? '+' : ''}${l.repChange}</span>` : ''}
                      ${l.domChange ? `<span class="aar-rs-chg ${l.domChange > 0 ? 'pos' : 'neg'}">🏠 ${l.domChange > 0 ? '+' : ''}${l.domChange}</span>` : ''}
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- 07 关键决策点 -->
          <div class="aar-section aar-page">
            <div class="aar-sec-header"><span class="aar-sec-num">07</span><span class="aar-sec-title">关键决策点</span></div>
            <div class="aar-sec-content">
              <p>${this.genKeyDecisions(s)}</p>
              ${this.renderKeyDecisions(s)}
            </div>
          </div>

          <!-- 08 行动效能分析 -->
          <div class="aar-section aar-page">
            <div class="aar-sec-header"><span class="aar-sec-num">08</span><span class="aar-sec-title">行动效能分析</span></div>
            <div class="aar-sec-content">
              <p>本次推演共执行${st.totalActions}项战略行动，整体行动成功率为${st.successRate}%。其中大成功${st.greatCount}项（占比${st.totalActions > 0 ? Math.round(st.greatCount / st.totalActions * 100) : 0}%），成功${st.successCount}项（占比${st.totalActions > 0 ? Math.round(st.successCount / st.totalActions * 100) : 0}%），失败${st.failCount}项（占比${st.totalActions > 0 ? Math.round(st.failCount / st.totalActions * 100) : 0}%）。</p>
              <table class="aar-table">
                <thead><tr><th>行动名称</th><th>轮次</th><th>骰值</th><th>目标值</th><th>结果</th><th>效果系数</th></tr></thead>
                <tbody>
                  ${r.stats.allDice.map(dr => {
                    const cls = dr.outcome === 'great' ? 'great' : dr.outcome === 'success' ? 'pos' : 'neg';
                    const label = dr.outcome === 'great' ? '大成功' : dr.outcome === 'success' ? '成功' : '失败';
                    return `<tr>
                      <td>${esc2(dr.action.name)}</td>
                      <td>第${s.log.find(l => l.diceResults && l.diceResults.includes(dr))?.round || '-'}轮</td>
                      <td>${dr.roll}</td><td>${dr.successRate}</td>
                      <td class="${cls}">${label}</td><td>×${dr.mult}</td>
                    </tr>`;
                  }).join('')}
                </tbody>
              </table>
              <p>${this.genActionEffectAssessment(st)}</p>
            </div>
          </div>

          <!-- 09 力量战备影响 -->
          <div class="aar-section aar-page">
            <div class="aar-sec-header"><span class="aar-sec-num">09</span><span class="aar-sec-title">力量战备影响分析</span></div>
            <div class="aar-sec-content">
              <p>力量战备度通过公式 (战备度-50)×0.3% 直接修正行动成功率。推演过程中，行动执行消耗对应军种战备（低风险-1%，中风险-3%，高风险-5%），轮间恢复+2%。</p>
              ${s.forceHistory && s.forceHistory.length > 0 ? `
                <table class="aar-table">
                  <thead><tr><th>军种</th>${s.forceHistory.map((_, i) => `<th>第${i+1}轮</th>`).join('')}<th>最终</th></tr></thead>
                  <tbody>
                    ${s.forces.map((f, fi) => `
                      <tr>
                        <td>${f.icon} ${esc2(f.branch)}</td>
                        ${s.forceHistory.map(fh => {
                          const ff = fh.find(x => x.code === f.code);
                          return `<td>${ff ? ff.readiness : '-'}</td>`;
                        }).join('')}
                        <td style="font-weight:700">${f.readiness}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              ` : '<p>（力量历史数据未记录）</p>'}
              <p>${this.genForceImpactAssessment(st.forcesDelta, s)}</p>
            </div>
          </div>

          <!-- 10 情报利用分析 -->
          <div class="aar-section aar-page">
            <div class="aar-sec-header"><span class="aar-sec-num">10</span><span class="aar-sec-title">情报利用分析</span></div>
            <div class="aar-sec-content">
              <p>${this.genIntelUtilizationAssessment(s)}</p>
              <p>情报修正通过可靠度加权后转化为域加成。A级情报（完全可信）按100%比例转化，B级（较可信）按70%转化，C级（待验证）按40%转化。这一机制确保了情报质量对决策支持的直接影响。</p>
              <p>在本次推演中，情报中心提供的域修正共影响${Object.keys(s.activeIntelMods || {}).length}个安全域的行动成功率。指挥部应充分重视情报收集与利用，在关键行动前确保有足够的情报支撑。</p>
            </div>
          </div>

          <!-- 11 升级管控评估 -->
          <div class="aar-section aar-page">
            <div class="aar-sec-header"><span class="aar-sec-num">11</span><span class="aar-sec-title">升级管控评估</span></div>
            <div class="aar-sec-content">
              <p>局势升级度从初始1级（低烈度）变化至最终${s.escalation}级（${WG_RULES.escalationLevels[s.escalation - 1].name}）。${this.genEscalationAssessment(s)}</p>
              <div class="aar-esc-ladder">
                ${WG_RULES.escalationLevels.map(e => `
                  <div class="aar-esc-step ${e.lv <= s.escalation ? 'active' : ''} ${e.lv === s.escalation ? 'current' : ''}">
                    <span class="aar-esc-num">LV${e.lv}</span>
                    <span class="aar-esc-name">${e.name}</span>
                    <span class="aar-esc-desc">${e.desc}</span>
                  </div>
                `).join('')}
              </div>
              <p>升级度直接影响AI对手的攻击性概率：${WG_RULES.escalationLevels[s.escalation - 1].aiAggression * 100}%。同时，高升级度下外交行动成功率降低8%。升级度评分占最终得分的15%（升级度越低得分越高）。</p>
            </div>
          </div>

          <!-- 12 资金管理分析 -->
          <div class="aar-section aar-page">
            <div class="aar-sec-header"><span class="aar-sec-num">12</span><span class="aar-sec-title">资金管理分析</span></div>
            <div class="aar-sec-content">
              <p>初始预算${s.maxFunding}亿元，最终剩余${s.funding}亿元，消耗${st.totalSpent}亿元（使用率${st.spendingRatio}%）。${this.genFundingAssessment(st)}</p>
              <div class="aar-funding-chart">
                <div class="aar-fc-bar">
                  <div class="aar-fc-used" style="width:${st.spendingRatio}%"></div>
                  <div class="aar-fc-remain" style="width:${100 - st.spendingRatio}%"></div>
                </div>
                <div class="aar-fc-labels">
                  <span style="color:var(--amber)">已消耗 ${st.totalSpent}亿</span>
                  <span style="color:var(--green)">剩余 ${s.funding}亿</span>
                </div>
              </div>
              <p>资金保有率评分为${Math.round(sb.fundingScore)}/100，占最终得分权重10%。合理的资金分配应优先保障关键行动，同时预留应急资金应对突发态势。</p>
            </div>
          </div>

          <!-- 13 声望与国内支持 -->
          <div class="aar-section aar-page">
            <div class="aar-sec-header"><span class="aar-sec-num">13</span><span class="aar-sec-title">声望与国内支持分析</span></div>
            <div class="aar-sec-content">
              <p>国际声望从初始${sc.reputation}变化至${s.reputation}（${s.reputation > sc.reputation ? '提升' + (s.reputation - sc.reputation) : s.reputation < sc.reputation ? '下降' + (sc.reputation - s.reputation) : '持平'}），国内支持度从${sc.domesticSupport}变化至${s.domesticSupport}（${s.domesticSupport > sc.domesticSupport ? '提升' + (s.domesticSupport - sc.domesticSupport) : s.domesticSupport < sc.domesticSupport ? '下降' + (sc.domesticSupport - sc.domesticSupport) : '持平'}）。</p>
              <p>${this.genRepDomAssessment(s, sc)}</p>
              <p>声望和国内支持通过修正公式直接影响行动成功率：声望修正=(声望-50)×0.2%，国内支持修正=(国内支持-50)×0.1%。两者合计占最终得分权重40%，是推演评分的核心组成部分。</p>
            </div>
          </div>

          <!-- 14 对手反应分析 -->
          <div class="aar-section aar-page">
            <div class="aar-sec-header"><span class="aar-sec-num">14</span><span class="aar-sec-title">对手反应分析</span></div>
            <div class="aar-sec-content">
              <p>本次推演中，AI对手共执行${s.log.length}次反制行动。对手的反制策略基于我方行动的counter字段，同时受升级度影响的攻击性概率触发随机更强反制。</p>
              <table class="aar-table">
                <thead><tr><th>轮次</th><th>反制行动</th><th>描述</th></tr></thead>
                <tbody>
                  ${s.log.map(l => `
                    <tr>
                      <td>第${l.round}轮</td>
                      <td>${esc2(l.aiAction)}</td>
                      <td>${esc2(l.aiActionDesc || '')}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              <p>${this.genAdversaryAssessment(s)}</p>
            </div>
          </div>

          <!-- 15 关键成功因素 -->
          <div class="aar-section aar-page">
            <div class="aar-sec-header"><span class="aar-sec-num">15</span><span class="aar-sec-title">关键成功因素</span></div>
            <div class="aar-sec-content">
              ${this.renderSuccessFactors(s, st)}
            </div>
          </div>

          <!-- 16 关键失败因素 -->
          <div class="aar-section aar-page">
            <div class="aar-sec-header"><span class="aar-sec-num">16</span><span class="aar-sec-title">关键失败因素</span></div>
            <div class="aar-sec-content">
              ${this.renderFailureFactors(s, st)}
            </div>
          </div>

          <!-- 17 替代策略建议 -->
          <div class="aar-section aar-page">
            <div class="aar-sec-header"><span class="aar-sec-num">17</span><span class="aar-sec-title">替代策略建议</span></div>
            <div class="aar-sec-content">
              ${this.renderAltStrategies(s, sc)}
            </div>
          </div>

          <!-- 18 经验教训 -->
          <div class="aar-section aar-page">
            <div class="aar-sec-header"><span class="aar-sec-num">18</span><span class="aar-sec-title">经验教训</span></div>
            <div class="aar-sec-content">
              ${this.renderLessonsLearned(s, st)}
            </div>
          </div>

          <!-- 19 绩效指标 -->
          <div class="aar-section aar-page">
            <div class="aar-sec-header"><span class="aar-sec-num">19</span><span class="aar-sec-title">绩效指标</span></div>
            <div class="aar-sec-content">
              <table class="aar-table">
                <thead><tr><th>指标</th><th>数值</th><th>评估</th></tr></thead>
                <tbody>
                  ${this.renderMetrics(s, st, sb)}
                </tbody>
              </table>
            </div>
          </div>

          <!-- 20 未来行动建议 -->
          <div class="aar-section aar-page">
            <div class="aar-sec-header"><span class="aar-sec-num">20</span><span class="aar-sec-title">未来行动建议</span></div>
            <div class="aar-sec-content">
              ${this.renderFutureRecs(s, sc, st)}
              <div class="aar-report-end">
                <div class="aar-end-line"></div>
                <div class="aar-end-text">— 报告结束 —</div>
                <div class="aar-end-meta">本报告由国安兵棋推演系统自动生成 | ${r.generatedAt}</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    `;

    document.getElementById('aarExit').addEventListener('click', () => this.exit());
    document.getElementById('aarBack').addEventListener('click', () => this.exit());
    document.getElementById('aarPrint').addEventListener('click', () => window.print());
  },

  /* ===== 退出 ===== */
  exit(){
    this.report = null;
    const main = document.querySelector('.main');
    const tabBar = main.querySelector('.tab-bar');
    if(tabBar) tabBar.style.display = '';
    App.switchTab('scenarios');
  },

  /* ===== 文本生成方法 ===== */
  genSummaryAssessment(st, s){
    if(st.score >= 75) return '总体而言，指挥部在本次推演中展现了出色的战略指挥能力，行动选择精准，资源调配合理，有效维护了国家安全利益。建议在后续推演中保持这一水平，同时探索更优化的行动组合。';
    if(st.score >= 60) return '总体而言，指挥部在本次推演中表现合格，基本实现了战略目标，但在部分关键决策上仍有优化空间。建议加强情报利用和力量调配的前瞻性规划。';
    if(st.score >= 45) return '总体而言，指挥部在本次推演中勉强维持了态势，但在多域协同和资源管理方面存在明显不足。建议重新审视战略优先级，加强跨域协调能力。';
    return '总体而言，指挥部在本次推演中战略态势严重恶化，多域指标下滑明显。建议深入复盘关键决策失误，重新构建战略应对框架。';
  },

  genForceAssessment(forcesDelta){
    const consumed = forcesDelta.filter(f => f.delta < -5).length;
    const boosted = forcesDelta.filter(f => f.delta > 0).length;
    if(consumed >= 3) return `推演过程中有${consumed}个军种战备消耗显著，反映出高强度作战行动对战备的持续消耗。建议在后续推演中合理轮换使用各军种，避免单一军种过度消耗。`;
    if(boosted >= 3) return `推演过程中有${boosted}个军种战备得到提升，反映出行动执行有效拉动了战备水平。这种良性循环值得保持。`;
    return '各军种战备变化总体平稳，未出现严重消耗或过度提升的情况。建议在后续推演中根据场景特点有针对性地调配关键军种。';
  },

  genIntelAssessment(s){
    const modCount = Object.keys(s.activeIntelMods || {}).length;
    if(modCount >= 3) return `情报中心提供了${modCount}项域修正加成，覆盖多个安全域，为指挥部决策提供了有力支撑。情报的及时性和准确性是行动成功的重要保障。`;
    if(modCount >= 1) return `情报中心提供了${modCount}项域修正加成，对特定域的行动成功率产生了直接影响。建议在后续推演中加强情报收集力度，扩大修正覆盖面。`;
    return '本次推演中情报修正覆盖不足，未能充分发挥情报对行动的支撑作用。建议在导调阶段重视情报预警，在推演中适时投入情报收集行动。';
  },

  genIntelUtilizationAssessment(s){
    const mods = s.activeIntelMods || {};
    const totalBonus = Object.values(mods).reduce((a,v) => a + v, 0);
    if(totalBonus > 15) return `情报修正总计提供${totalBonus.toFixed(1)}%的域加成，对行动成功率产生了显著提升。指挥部充分利用了情报优势，在关键域行动中获得了实质性加成。`;
    if(totalBonus > 5) return `情报修正总计提供${totalBonus.toFixed(1)}%的域加成，对部分行动的成功率产生了一定影响。情报利用基本合理，但仍有提升空间。`;
    return `情报修正总计提供${totalBonus.toFixed(1)}%的域加成，情报利用效率偏低。建议在后续推演中更加重视情报的收集和运用，特别是在关键行动前确保有A级情报支撑。`;
  },

  genEscalationAssessment(s){
    if(s.escalation >= 4) return `局势升级至${s.escalation}级，接近战争边缘态势，外交空间严重压缩。这反映出推演过程中军事行动过于激进，未能有效控制局势升级。建议在后续推演中平衡军事威慑与外交斡旋，避免过度升级。`;
    if(s.escalation >= 3) return `局势升级至${s.escalation}级，多域对抗加剧，但尚未失控。指挥部在升级管控方面表现一般，部分行动导致了不必要的局势升温。`;
    if(s.escalation >= 2) return `局势保持在${s.escalation}级中低烈度，升级管控较为有效。指挥部在施压与克制之间取得了较好平衡。`;
    return `局势维持在${s.escalation}级低烈度，升级管控非常成功。指挥部有效平衡了各方行动，避免了不必要的局势升级。`;
  },

  genFundingAssessment(st){
    if(st.spendingRatio > 80) return '资金使用率偏高，预算压力较大。建议在后续推演中更加精打细算，优先保障高价值行动。';
    if(st.spendingRatio > 50) return '资金使用率适中，预算分配基本合理。在关键行动上投入了足够资源，同时保留了一定应急资金。';
    if(st.spendingRatio > 20) return '资金使用率偏低，部分高价值行动可能因资金保守而未能执行。建议在后续推演中适度增加投入。';
    return '资金几乎未使用，可能存在行动过于保守的问题。建议充分利用预算资源执行战略行动。';
  },

  genRepDomAssessment(s, sc){
    const repDelta = s.reputation - sc.reputation;
    const domDelta = s.domesticSupport - sc.domesticSupport;
    if(repDelta > 0 && domDelta > 0) return '国际声望和国内支持度双双提升，反映出指挥部的行动策略兼顾了国际形象和国内民意，值得肯定。';
    if(repDelta > 0 && domDelta < 0) return '国际声望提升但国内支持度下降，可能存在过度迎合国际预期而忽视国内民意的情况。建议在后续推演中平衡内外诉求。';
    if(repDelta < 0 && domDelta > 0) return '国内支持度提升但国际声望下降，可能存在过于强硬的行动引发了国际负面反应。建议适度调整外交策略。';
    if(repDelta < 0 && domDelta < 0) return '国际声望和国内支持度双双下降，反映出行动策略在内外两个维度均未取得预期效果。建议重新审视整体战略方向。';
    return '国际声望和国内支持度基本持平，行动策略对内外态势的影响有限。';
  },

  genAdversaryAssessment(s){
    const aiActions = s.log.map(l => l.aiAction);
    const uniqueActions = [...new Set(aiActions)];
    if(uniqueActions.length <= 2) return `对手反制行动较为单一（仅${uniqueActions.length}种），可能反映出我方行动模式过于规律，导致对手反制策略集中。建议在后续推演中增加行动多样性。`;
    if(uniqueActions.length >= 4) return `对手反制行动多样化（${uniqueActions.length}种），反映出对抗态势复杂。指挥部面对多维度反制仍需提高适应能力。`;
    return `对手反制行动包含${uniqueActions.length}种类型，对抗态势处于中等复杂度。`;
  },

  genActionEffectAssessment(st){
    if(st.successRate >= 80) return '行动效能优异，大部分行动取得成功甚至大成功。这反映出力量调配、情报支撑和时机选择均较为精准。';
    if(st.successRate >= 60) return '行动效能良好，多数行动取得预期效果。部分行动失败可能与战备不足或情报缺失有关。';
    if(st.successRate >= 40) return '行动效能一般，成功与失败参半。建议在后续推演中更加注重成功率提升因素的积累。';
    return '行动效能偏低，失败行动较多。建议深入分析失败原因，优化行动选择策略。';
  },

  genForceImpactAssessment(forcesDelta, s){
    const totalConsumption = forcesDelta.filter(f => f.delta < 0).reduce((sum, f) => sum + Math.abs(f.delta), 0);
    const totalRecovery = forcesDelta.filter(f => f.delta > 0).reduce((sum, f) => sum + f.delta, 0);
    return `推演过程中，力量战备总消耗${totalConsumption}个百分点、总恢复${totalRecovery}个百分点。战备的动态变化直接影响了行动成功率，特别是在推演后期，部分军种战备下降可能导致关键行动受限。`;
  },

  genKeyDecisions(s){
    const rounds = s.log.length;
    return `在${rounds}轮推演中，指挥部面临多个关键决策节点。以下是对各轮关键决策的分析评估：`;
  },

  renderKeyDecisions(s){
    return s.log.map(l => {
      const actions = l.playerActions || [];
      const failCount = (l.diceResults || []).filter(d => d.outcome === 'fail').length;
      const greatCount = (l.diceResults || []).filter(d => d.outcome === 'great').length;
      let assessment = '';
      if(greatCount > 0) assessment = '<span style="color:var(--green)">本轮出现大成功，决策精准</span>';
      else if(failCount > actions.length / 2) assessment = '<span style="color:var(--red)">本轮失败较多，决策存疑</span>';
      else if(failCount === 0) assessment = '<span style="color:var(--green)">本轮全部成功，决策有效</span>';
      else assessment = '<span style="color:var(--amber)">本轮有成功有失败，决策一般</span>';
      return `
        <div class="aar-decision-block">
          <div class="aar-db-head">第${l.round}轮 ${assessment}</div>
          <div class="aar-db-body">
            选用${actions.length}项行动：${actions.map(a => esc2(a)).join('、')}。
            敌方反制：${esc2(l.aiAction)}。
            ${failCount > 0 ? `失败${failCount}项，` : ''}共影响${Object.entries(l.changes).filter(([k,v]) => v !== 0).length}个域。
          </div>
        </div>
      `;
    }).join('');
  },

  renderSuccessFactors(s, st){
    const factors = [];
    if(st.greatCount > 0) factors.push(`大成功行动${st.greatCount}项 — 反映了精准的行动选择和有利的战备/情报条件`);
    if(s.reputation > 55) factors.push(`国际声望维持在${s.reputation} — 为外交域行动提供了正向修正`);
    if(s.domesticSupport > 55) factors.push(`国内支持度维持在${s.domesticSupport} — 保障了国内域行动的效果`);
    if(s.escalation <= 2) factors.push(`局势升级度控制在${s.escalation}级 — 有效避免了冲突失控`);
    if(st.objResults.filter(o => o.achieved).length >= st.objResults.length * 0.7) factors.push(`任务目标达成率${Math.round(st.objResults.filter(o => o.achieved).length / st.objResults.length * 100)}% — 战略目标基本实现`);
    if(s.funding > s.maxFunding * 0.3) factors.push(`资金保有率${Math.round(s.funding / s.maxFunding * 100)}% — 预算管理合理`);
    const forcesOk = st.forcesDelta.filter(f => f.readiness >= 60).length;
    if(forcesOk >= 4) factors.push(`${forcesOk}个军种战备维持在60%以上 — 力量调配有效`);

    if(factors.length === 0) return '<p>本次推演未识别出显著的成功因素。建议深入分析各环节，寻找改进空间。</p>';
    return '<ul class="aar-factor-list">' + factors.map(f => `<li><span class="aar-fl-icon pos">✓</span> ${f}</li>`).join('') + '</ul>';
  },

  renderFailureFactors(s, st){
    const factors = [];
    if(st.failCount > 0) factors.push(`失败行动${st.failCount}项 — 可能因战备不足、情报缺失或风险过高`);
    if(s.reputation < 40) factors.push(`国际声望降至${s.reputation} — 严重影响外交域行动和国际形象`);
    if(s.domesticSupport < 50) factors.push(`国内支持度降至${s.domesticSupport} — 国内稳定面临风险`);
    if(s.escalation >= 4) factors.push(`局势升级至${s.escalation}级 — 接近战争边缘，外交空间严重压缩`);
    const objFailed = st.objResults.filter(o => !o.achieved);
    if(objFailed.length > 0) factors.push(`${objFailed.length}项任务目标未达成 — ${objFailed.map(o => o.text).join('、')}`);
    if(s.funding < s.maxFunding * 0.1) factors.push(`资金几乎耗尽（剩余${s.funding}亿） — 预算管理存在问题`);
    const forcesLow = st.forcesDelta.filter(f => f.readiness < 40);
    if(forcesLow.length > 0) factors.push(`${forcesLow.length}个军种战备降至40%以下 — 力量消耗过度`);

    if(factors.length === 0) return '<p>本次推演未识别出显著的失败因素，整体表现良好。</p>';
    return '<ul class="aar-factor-list">' + factors.map(f => `<li><span class="aar-fl-icon neg">✗</span> ${f}</li>`).join('') + '</ul>';
  },

  renderAltStrategies(s, sc){
    const strategies = [];
    const dm = DOMAIN_MAP[sc.domain] || DOMAIN_MAP.military;

    if(s.escalation >= 3){
      strategies.push({
        title:'前置外交斡旋',
        desc:'在局势升级前阶段加大外交斡旋力度，通过多边平台和高级别峰会降低对抗烈度，为后续行动创造更大空间。升级度每降低1级，外交行动成功率提升8%。',
      });
    }
    if(s.funding < s.maxFunding * 0.2){
      strategies.push({
        title:'精准资金分配',
        desc:'优先保障高成功率、高影响力的核心行动，减少低价值行动的资金消耗。建议将60%预算集中投入3-4项关键行动。',
      });
    }
    if(st_failCount(s) > 2){
      strategies.push({
        title:'情报先行策略',
        desc:'在关键行动前投入情报收集行动（1AP+100亿），获取A级情报修正后再执行主攻行动。情报修正可达+8%成功率，显著降低失败风险。',
      });
    }
    strategies.push({
      title:'力量均衡调配',
      desc:`在导调阶段将${dm.icon}${dm.label}域相关军种战备提升至85%以上，可使该域行动成功率提升约10%。建议将30%预算用于力量调配。`,
    });
    strategies.push({
      title:'多域协同推进',
      desc:'避免单一域行动过载，在军事、外交、经济、信息域均衡分配行动点，形成多域协同效应，降低被AI针对反制的风险。',
    });

    return strategies.map((strat, i) => `
      <div class="aar-strat-block">
        <div class="aar-strat-num">${i + 1}</div>
        <div class="aar-strat-content">
          <div class="aar-strat-title">${esc2(strat.title)}</div>
          <div class="aar-strat-desc">${esc2(strat.desc)}</div>
        </div>
      </div>
    `).join('');
  },

  renderLessonsLearned(s, st){
    const lessons = [];

    if(st.successRate >= 70){
      lessons.push('行动选择策略有效 — 高成功率表明力量调配和情报利用与行动选择形成了良好配合，应在后续推演中保持这一策略。');
    } else {
      lessons.push('行动选择需优化 — 较低的成功率提示需要在行动前充分评估战备条件和情报支撑，避免在不利条件下强行执行高风险行动。');
    }

    if(s.escalation >= 3){
      lessons.push('升级管控意识不足 — 局势升级过快压缩了外交空间。应在外交域保留至少1项行动用于降温，避免升级度突破3级。');
    } else {
      lessons.push('升级管控有效 — 成功将局势控制在可控范围内，这一策略应在后续推演中延续。');
    }

    if(s.funding < s.maxFunding * 0.2){
      lessons.push('资金管理需改善 — 预算消耗过快导致后期行动受限。应制定分轮次预算计划，每轮预留20%应急资金。');
    } else {
      lessons.push('资金管理合理 — 预算分配均衡，保障了全程行动能力。');
    }

    const forcesLow = st.forcesDelta.filter(f => f.readiness < 50);
    if(forcesLow.length > 0){
      lessons.push(`${forcesLow.map(f => f.branch).join('、')}战备消耗过大 — 应在轮间合理安排行动，避免单一军种持续高强度使用，利用轮间恢复机制（+2%/轮）保持战备。`);
    }

    lessons.push('情报是行动的倍增器 — A级情报可提供8%域加成，相当于5点力量战备的提升效果。应在关键行动前确保情报支撑。');
    lessons.push('力量调配是战略前置投资 — 导调阶段的力量调配直接影响全程行动成功率，建议将15-20%预算用于关键军种提升。');

    return '<ul class="aar-lesson-list">' + lessons.map(l => `<li>${l}</li>`).join('') + '</ul>';
  },

  renderMetrics(s, st, sb){
    const rows = [
      ['最终评分', `${st.score}/100`, `<span style="color:${s.gradeColor}">${st.grade}级</span>`],
      ['六域均分', `${Math.round(sb.domainScore)}/100`, sb.domainScore >= 60 ? '<span style="color:var(--green)">良好</span>' : '<span style="color:var(--amber)">待提升</span>'],
      ['国际声望', `${s.reputation}/100`, s.reputation >= 50 ? '<span style="color:var(--green)">合格</span>' : '<span style="color:var(--red)">偏低</span>'],
      ['国内支持', `${s.domesticSupport}/100`, s.domesticSupport >= 50 ? '<span style="color:var(--green)">合格</span>' : '<span style="color:var(--red)">偏低</span>'],
      ['资金保有', `${s.funding}/${s.maxFunding}亿`, sb.fundingScore >= 50 ? '<span style="color:var(--green)">充足</span>' : '<span style="color:var(--amber)">紧张</span>'],
      ['升级管控', `${s.escalation}/5级`, s.escalation <= 2 ? '<span style="color:var(--green)">可控</span>' : '<span style="color:var(--red)">偏高</span>'],
      ['行动成功率', `${st.successRate}%`, st.successRate >= 70 ? '<span style="color:var(--green)">优秀</span>' : st.successRate >= 50 ? '<span style="color:var(--amber)">一般</span>' : '<span style="color:var(--red)">偏低</span>'],
      ['大成功数', `${st.greatCount}项`, st.greatCount >= 2 ? '<span style="color:var(--green)">突出</span>' : ''],
      ['失败数', `${st.failCount}项`, st.failCount === 0 ? '<span style="color:var(--green)">无失败</span>' : '<span style="color:var(--red)">需关注</span>'],
      ['目标达成', `${st.objResults.filter(o => o.achieved).length}/${st.objResults.length}`, st.objResults.filter(o => o.achieved).length >= st.objResults.length * 0.7 ? '<span style="color:var(--green)">达标</span>' : '<span style="color:var(--red)">未达标</span>'],
    ];
    return rows.map(r => `<tr><td>${r[0]}</td><td style="font-family:Consolas,monospace;font-weight:600">${r[1]}</td><td>${r[2]}</td></tr>`).join('');
  },

  renderFutureRecs(s, sc, st){
    const recs = [];

    recs.push({
      priority:'高',
      title:'加强情报前置收集',
      desc:'在推演初期投入1-2项情报收集行动，尽早建立域修正加成，为后续高价值行动提供成功率保障。',
    });

    if(sc.domain === 'military' || sc.response.includes('military')){
      recs.push({
        priority:'高',
        title:'军事力量均衡使用',
        desc:'避免单一军种（如海军）过度使用导致战备崩溃。建议每轮军事行动不超过2项，确保轮间恢复机制发挥作用。',
      });
    }

    recs.push({
      priority:'中',
      title:'升级度红线管理',
      desc:'设定升级度3级为红线，一旦接近立即切换外交降温行动。升级度过高将压缩外交空间并提升AI攻击性。',
    });

    recs.push({
      priority:'中',
      title:'分轮次预算规划',
      desc:'将总预算按轮次分配（前30%、中40%、后30%），避免前期过度消耗导致后期行动能力不足。',
    });

    if(st.objResults.filter(o => !o.achieved).length > 0){
      recs.push({
        priority:'高',
        title:'重新审视未达成目标',
        desc:`${st.objResults.filter(o => !o.achieved).map(o => o.text).join('、')} — 建议在下次推演中将这些目标作为核心约束条件，倒推行动策略。`,
      });
    }

    recs.push({
      priority:'低',
      title:'探索场景专属行动组合',
      desc:'每个场景有3项专属行动，其效果通常优于通用行动。建议研究专属行动之间的协同效应，形成最优组合。',
    });

    return recs.map(r => `
      <div class="aar-rec-block">
        <span class="aar-rec-priority ${r.priority === '高' ? 'high' : r.priority === '中' ? 'mid' : 'low'}">${r.priority}优先</span>
        <div class="aar-rec-content">
          <div class="aar-rec-title">${esc2(r.title)}</div>
          <div class="aar-rec-desc">${esc2(r.desc)}</div>
        </div>
      </div>
    `).join('');
  },
};

/* 辅助函数 */
function st_failCount(s){
  return (s.log || []).flatMap(l => l.diceResults || []).filter(d => d.outcome === 'fail').length;
}
