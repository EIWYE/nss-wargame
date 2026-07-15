/* ================================================================
 * NSS-WGS v12.4 — AI战略智囊引擎 (ai-advisor.js)
 *
 * 人机协同的核心：
 *   1. 态势研判  — AI持续评估战略态势，生成分析报告
 *   2. 策略建议  — AI主动建议行动方案，附带推理过程（不是选择题）
 *   3. 影响预测  — 在用户确认行动前，预测跨域连锁后果
 *   4. 对手分析  — AI学习玩家行为模式，动态调整对手策略
 *   5. 主动预警  — AI在风险临界时提前预警
 *   6. 战略记忆  — AI记住历史决策与结果，形成经验库
 *
 * 设计理念：
 *   AI不是替用户做选择题的工具，而是与用户进行战略对话的协作者。
 *   AI提出推理 → 用户判断 → AI预测后果 → 用户调整 → 协同达成决策。
 * ================================================================ */

const AIAdvisor = {

  /* ==================== 战略记忆库 ==================== */
  memory: {
    /* 历史推演记录（从STATE.games同步） */
    history: [],

    /* 玩家行为画像 */
    playerProfile: {
      aggressionTendency: 0.5,    /* 0=完全防御 1=完全进攻 */
      riskTolerance: 0.5,          /* 0=极端保守 1=极端冒险 */
      domainPreference: {},        /* 各域使用频率 */
      avgActionsPerRound: 0,       /* 平均每轮行动数 */
      escalationTolerance: 0.5,    /* 升级度容忍度 */
      supportActionUsage: 0.3,     /* 支援行动使用倾向 */
      totalGames: 0,
      totalRounds: 0,
      preferredStrategies: [],     /* 偏好的行动ID列表 */
      acceptRate: 0.5,             /* AI建议接受率 */
      totalSuggestions: 0,
      acceptedSuggestions: 0,
    },

    /* 对手行为画像（AI学习玩家模式后，作为对手的参考） */
    opponentProfile: {
      patterns: {},                /* 行动模式: { domain_actionId: count } */
      escalationTriggers: [],      /* 触发升级的条件 */
      weaknessDomains: [],         /* 常忽视的域 */
    },

    /* 经验教训库 */
    lessonsLearned: [
      { id:'lesson_001', text:'经济域低于40时，后续轮次资金收益将大幅减少', domain:'economic', threshold:40, severity:'high' },
      { id:'lesson_002', text:'升级度达到4级后，对手反制强度显著增加', domain:'escalation', threshold:4, severity:'high' },
      { id:'lesson_003', text:'声望低于30时，所有行动成功率下降约10%', domain:'reputation', threshold:30, severity:'medium' },
      { id:'lesson_004', text:'支援行动先行可提升后续战略行动成功率5-15%', domain:'support', threshold:0, severity:'medium' },
      { id:'lesson_005', text:'军事域行动常引发外交域负面连锁反应', domain:'military', threshold:0, severity:'low' },
    ],
  },

  /* ==================== 1. 态势研判 ==================== */

  /**
   * 全面评估当前战略态势
   * @param {Object} state — 推演状态 或 全局状态
   * @returns {Object} 评估结果
   */
  assessSituation(state){
    if(!state) state = this._getGlobalState();

    const assessment = {
      overall: '',           /* 总体评估 */
      posture: '',           /* 战略态势 */
      postureColor: '',
      strengths: [],         /* 优势项 */
      weaknesses: [],        /* 薄弱项 */
      risks: [],             /* 风险点 */
      opportunities: [],     /* 机会窗口 */
      urgency: 'normal',     /* 紧迫性: low/normal/high/critical */
      recommendations: [],   /* 建议方向 */
      score: 50,             /* 综合态势分(0-100) */
    };

    /* --- 域值分析 --- */
    const domains = state.domains || this._getLiveDomains();
    const domainEntries = Object.entries(domains).filter(([k]) => !k.startsWith('_'));

    /* 优势域(>=65) */
    domainEntries.forEach(([key, val]) => {
      const dm = this._domainMeta(key);
      if(val >= 65){
        assessment.strengths.push({
          domain: key, name: dm.name, value: val,
          desc: `${dm.name}域态势良好(${val})，可作为战略支撑`,
        });
      }
    });

    /* 薄弱域(<=40) */
    domainEntries.forEach(([key, val]) => {
      const dm = this._domainMeta(key);
      if(val <= 40){
        assessment.weaknesses.push({
          domain: key, name: dm.name, value: val,
          desc: `${dm.name}域严重薄弱(${val})，需优先修复`,
        });
        assessment.risks.push({
          domain: key, level: val < 25 ? 'critical' : 'high',
          desc: `${dm.name}域濒临崩溃，可能触发连锁危机`,
        });
      } else if(val <= 50){
        assessment.weaknesses.push({
          domain: key, name: dm.name, value: val,
          desc: `${dm.name}域处于警戒线(${val})，需关注`,
        });
      }
    });

    /* --- 资源分析 --- */
    const rep = state.reputation ?? 50;
    const dom = state.domesticSupport ?? 50;
    const fund = state.funding ?? 0;
    const maxFund = state.maxFunding ?? 1;
    const escalation = state.escalation ?? 1;

    if(rep < 30){
      assessment.risks.push({
        domain:'reputation', level:'high',
        desc:`国际声望极低(${rep})，行动成功率将受惩罚`,
      });
    }
    if(dom < 35){
      assessment.risks.push({
        domain:'domestic', level:'high',
        desc:`国内支持度不足(${dom})，社会稳定性风险上升`,
      });
    }
    if(fund / maxFund < 0.2){
      assessment.risks.push({
        domain:'economic', level:'medium',
        desc:`资金储备仅剩${fund}亿(总量${maxFund}亿)，后续行动受限`,
      });
    }
    if(escalation >= 4){
      assessment.risks.push({
        domain:'escalation', level:'critical',
        desc:`升级度达到${escalation}级，战争边缘态势，对手反制将极为激烈`,
      });
      assessment.urgency = 'critical';
    } else if(escalation >= 3){
      assessment.risks.push({
        domain:'escalation', level:'high',
        desc:`升级度达到${escalation}级，冲突风险显著`,
      });
      assessment.urgency = 'high';
    }

    /* --- 机会识别 --- */
    if(rep >= 65){
      assessment.opportunities.push({
        desc:`国际声望较高(${rep})，适合开展外交攻势或多边协调`,
      });
    }
    if(fund / maxFund >= 0.6){
      assessment.opportunities.push({
        desc:`资金充裕(${fund}亿)，可投入大规模行动或科技研发`,
      });
    }
    if(dom >= 70){
      assessment.opportunities.push({
        desc:`国内支持强劲(${dom})，可承受较高烈度行动`,
      });
    }
    /* 薄弱域的修复机会 */
    assessment.weaknesses.forEach(w => {
      if(w.value <= 40){
        assessment.opportunities.push({
          desc:`${w.name}域急需修复，若成功提升将显著改善整体态势`,
        });
      }
    });

    /* --- 力量分析 --- */
    if(state.forces && state.forces.length > 0){
      const avgForce = state.forces.reduce((s,f) => s + (f.readiness||70), 0) / state.forces.length;
      if(avgForce >= 80){
        assessment.strengths.push({
          domain:'forces', name:'力量战备', value: Math.round(avgForce),
          desc:`力量战备良好(均${Math.round(avgForce)})，可支撑高强度行动`,
        });
      } else if(avgForce < 50){
        assessment.weaknesses.push({
          domain:'forces', name:'力量战备', value: Math.round(avgForce),
          desc:`力量战备偏低(均${Math.round(avgForce)})，高强度行动效果将打折`,
        });
      }
    }

    /* --- 综合评分 --- */
    const domainAvg = domainEntries.length > 0
      ? domainEntries.reduce((s,[,v]) => s + v, 0) / domainEntries.length : 50;
    const escScore = (6 - escalation) * 20;
    assessment.score = Math.round(
      domainAvg * 0.35 + rep * 0.20 + dom * 0.20 +
      Math.min(100, fund/maxFund * 100) * 0.10 + escScore * 0.15
    );

    /* --- 总体态势描述 --- */
    if(assessment.score >= 75){
      assessment.posture = '战略优势';
      assessment.postureColor = 'var(--green)';
      assessment.overall = '当前态势有利，可把握主动权，适度推进战略目标';
    } else if(assessment.score >= 60){
      assessment.posture = '态势可控';
      assessment.postureColor = 'var(--cyan)';
      assessment.overall = '当前态势基本稳定，需巩固优势域、修复薄弱域';
    } else if(assessment.score >= 45){
      assessment.posture = '态势承压';
      assessment.postureColor = 'var(--amber)';
      assessment.overall = '当前态势面临压力，需谨慎行动，优先止损';
    } else {
      assessment.posture = '态势危急';
      assessment.postureColor = 'var(--red)';
      assessment.overall = '当前态势严重恶化，需立即采取紧急措施扭转局面';
      assessment.urgency = 'critical';
    }

    /* --- 建议方向 --- */
    if(assessment.urgency === 'critical'){
      assessment.recommendations.push('优先降级：选择升级度≤0的行动，避免局势进一步恶化');
      assessment.recommendations.push('止损优先：修复濒临崩溃的域值，而非追求进攻效果');
    } else {
      /* 基于薄弱域生成建议 */
      const weakestDomain = assessment.weaknesses
        .filter(w => w.value <= 45)
        .sort((a,b) => a.value - b.value)[0];
      if(weakestDomain){
        const actions = this._findActionsForDomain(weakestDomain.domain);
        if(actions.length > 0){
          assessment.recommendations.push(
            `修复${weakestDomain.name}域：考虑「${actions.slice(0,2).map(a => a.name).join('」「')}」等行动`
          );
        }
      }
      /* 利用优势 */
      const strongestDomain = assessment.strengths
        .sort((a,b) => b.value - a.value)[0];
      if(strongestDomain && strongestDomain.value >= 75){
        assessment.recommendations.push(
          `发挥${strongestDomain.name}域优势：可作为其他域行动的支撑力量`
        );
      }
    }

    return assessment;
  },

  /* ==================== 2. 策略建议 ==================== */

  /**
   * 主动生成策略建议（附带推理过程）
   * @param {Object} state — 推演状态
   * @param {Object} context — 上下文 { availableActions, selectedActions, round, maxRounds }
   * @returns {Array} 建议列表
   */
  generateSuggestions(state, context){
    if(!state) state = this._getGlobalState();
    const assessment = this.assessSituation(state);
    const availableActions = context?.availableActions || [];
    const selectedActions = context?.selectedActions || [];
    const round = state.round || context?.round || 1;
    const maxRounds = state.maxRounds || context?.maxRounds || 5;
    const actionPoints = state.actionPoints ?? 5;
    const funding = state.funding ?? 0;

    const suggestions = [];

    /* --- 策略1：紧急止损（当有危急域值时） --- */
    const criticalDomains = assessment.weaknesses.filter(w => w.value <= 35);
    if(criticalDomains.length > 0){
      const target = criticalDomains[0];
      const repairActions = availableActions.filter(a => {
        const effect = a.effects?.[target.domain] || 0;
        return effect > 5 && a.cost <= actionPoints && a.fundingCost <= funding;
      });
      if(repairActions.length > 0){
        const best = repairActions.sort((a,b) =>
          (b.effects[target.domain] || 0) - (a.effects[target.domain] || 0)
        )[0];
        suggestions.push({
          id: 'sug_emergency_' + target.domain,
          type: 'emergency',
          priority: 'critical',
          title: `紧急修复${target.name}域`,
          reasoning: `${target.name}域当前仅${target.value}分，处于危急状态。` +
            `若不及时修复，将影响整体战略评分并可能触发连锁危机。` +
            `建议执行「${best.name}」，预计可提升${target.name}域${best.effects[target.domain]}分。`,
          action: best,
          expectedGain: best.effects[target.domain],
          confidence: 0.85,
        });
      }
    }

    /* --- 策略2：降级优先（当升级度过高时） --- */
    const escalation = state.escalation ?? 1;
    if(escalation >= 3){
      const deEscActions = availableActions.filter(a =>
        a.escalation <= 0 && a.cost <= actionPoints && a.fundingCost <= funding
      );
      if(deEscActions.length > 0){
        const best = deEscActions.sort((a,b) =>
          (b.repEffect || 0) - (a.repEffect || 0)
        )[0];
        suggestions.push({
          id: 'sug_deesc',
          type: 'deescalation',
          priority: 'high',
          title: `控制升级度（当前${escalation}级）`,
          reasoning: `升级度已达${escalation}级，对手反制强度将显著增加（AI攻击性${this._escAiAggr(escalation)}）。` +
            `建议选择低升级度行动「${best.name}」（升级度${best.escalation}），` +
            `同时可恢复声望${best.repEffect > 0 ? '+' : ''}${best.repEffect}。`,
          action: best,
          expectedGain: -best.escalation,
          confidence: 0.80,
        });
      }
    }

    /* --- 策略3：优势放大（当有高域值时） --- */
    if(assessment.urgency !== 'critical'){
      const strongDomains = assessment.strengths.filter(s => s.value >= 70);
      if(strongDomains.length > 0){
        const target = strongDomains[0];
        const boostActions = availableActions.filter(a => {
          const eff = a.effects?.[target.domain] || 0;
          return eff > 3 && a.cost <= actionPoints && a.fundingCost <= funding;
        });
        if(boostActions.length > 0){
          const best = boostActions[0];
          suggestions.push({
            id: 'sug_boost_' + target.domain,
            type: 'amplify',
            priority: 'medium',
            title: `放大${target.name}域优势`,
            reasoning: `${target.name}域已达${target.value}分，具备优势基础。` +
              `继续投入「${best.name}」可将优势转化为战略主动权，` +
              `同时为其他域行动提供支撑。`,
            action: best,
            expectedGain: best.effects[target.domain],
            confidence: 0.70,
          });
        }
      }
    }

    /* --- 策略4：支援行动先行（如果还没选支援行动） --- */
    if(selectedActions.length === 0 && round <= maxRounds - 1){
      const supportActions = (typeof Wargame !== 'undefined' && Wargame.state)
        ? Wargame.getAvailableSupportActions?.() || []
        : [];
      const affordableSupport = supportActions.filter(a =>
        a.cost <= actionPoints && a.fundingCost <= funding &&
        a.supportEffects?.successRateBonus
      );
      if(affordableSupport.length > 0){
        const best = affordableSupport.sort((a,b) => {
          const ba = Object.values(b.supportEffects.successRateBonus).reduce((s,v) => s+v, 0);
          const aa = Object.values(a.supportEffects.successRateBonus).reduce((s,v) => s+v, 0);
          return ba - aa;
        })[0];
        suggestions.push({
          id: 'sug_support_first',
          type: 'support',
          priority: 'medium',
          title: `支援行动先行`,
          reasoning: `当前尚未选择支援行动。执行「${best.name}」可为后续战略行动` +
            `提供成功率加成，实现1+1>2的效果。消耗仅${best.cost}AP。`,
          action: best,
          expectedGain: 5,
          confidence: 0.75,
        });
      }
    }

    /* --- 策略5：终局冲刺（最后一轮或倒数第二轮） --- */
    if(round >= maxRounds - 1){
      const allActions = availableActions.filter(a =>
        a.cost <= actionPoints && a.fundingCost <= funding
      );
      if(allActions.length > 0){
        /* 选择综合效果最大的行动 */
        const best = allActions.sort((a,b) => {
          const sumA = Object.values(a.effects || {}).reduce((s,v) => s+v, 0);
          const sumB = Object.values(b.effects || {}).reduce((s,v) => s+v, 0);
          return sumB - sumA;
        })[0];
        suggestions.push({
          id: 'sug_final_push',
          type: 'finale',
          priority: 'high',
          title: `终局冲刺`,
          reasoning: `已是第${round}轮（共${maxRounds}轮），需最大化本轮效果。` +
            `「${best.name}」综合效果最优（六域总加成` +
            `${Object.values(best.effects || {}).reduce((s,v)=>s+v,0)}），` +
            `是终局阶段的最佳选择。`,
          action: best,
          expectedGain: Object.values(best.effects || {}).reduce((s,v) => s+v, 0),
          confidence: 0.65,
        });
      }
    }

    /* --- 策略6：平衡发展（当域值差异过大时） --- */
    const domains = state.domains || this._getLiveDomains();
    const domainVals = Object.entries(domains).filter(([k]) => !k.startsWith('_')).map(([,v]) => v);
    if(domainVals.length > 0){
      const maxVal = Math.max(...domainVals);
      const minVal = Math.min(...domainVals);
      if(maxVal - minVal > 30 && minVal < 50){
        const minDomain = Object.entries(domains).find(([k,v]) =>
          !k.startsWith('_') && v === minVal
        )?.[0];
        if(minDomain){
          const balanceActions = availableActions.filter(a =>
            a.effects?.[minDomain] > 3 && a.cost <= actionPoints && a.fundingCost <= funding
          );
          if(balanceActions.length > 0){
            suggestions.push({
              id: 'sug_balance_' + minDomain,
              type: 'balance',
              priority: 'medium',
              title: `平衡域值发展`,
              reasoning: `各域差距过大（最高${maxVal}，最低${minVal}），` +
              `短板效应将拉低整体评分。建议执行「${balanceActions[0].name}」` +
              `提升${this._domainMeta(minDomain).name}域，缩小域间差距。`,
              action: balanceActions[0],
              expectedGain: balanceActions[0].effects[minDomain],
              confidence: 0.70,
            });
          }
        }
      }
    }

    /* --- 策略7：维持态势（兜底建议，确保AI始终有话可说） --- */
    if(suggestions.length === 0 && availableActions.length > 0){
      /* 选择综合效果最好的低风险行动 */
      const safeActions = availableActions.filter(a =>
        a.risk < 0.2 && a.cost <= actionPoints && a.fundingCost <= funding
      );
      if(safeActions.length > 0){
        const best = safeActions.sort((a,b) => {
          const sumA = Object.values(a.effects || {}).reduce((s,v) => s+v, 0);
          const sumB = Object.values(b.effects || {}).reduce((s,v) => s+v, 0);
          return sumB - sumA;
        })[0];
        suggestions.push({
          id: 'sug_maintain',
          type: 'maintain',
          priority: 'low',
          title: `维持有利态势`,
          reasoning: `当前态势基本稳定，无紧急风险。建议执行「${best.name}」` +
            `巩固现有态势，为后续轮次积累优势。该行动风险低（${best.risk}），` +
            `综合效果为正（六域总加成${Object.values(best.effects || {}).reduce((s,v)=>s+v,0)}）。`,
          action: best,
          expectedGain: Object.values(best.effects || {}).reduce((s,v) => s+v, 0),
          confidence: 0.65,
        });
      }
    }

    /* 按优先级排序 */
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    suggestions.sort((a,b) =>
      (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3)
    );

    return suggestions;
  },

  /* ==================== 3. 影响预测 ==================== */

  /**
   * 预测一组行动的跨域连锁影响
   * @param {Array} actions — 待执行的行动列表
   * @param {Object} state — 当前状态
   * @returns {Object} 预测结果
   */
  predictImpact(actions, state){
    if(!state) state = this._getGlobalState();
    if(!actions || actions.length === 0){
      return { summary: '未选择行动，无法预测', predictions: [] };
    }

    const predictions = [];
    const domains = { ...(state.domains || this._getLiveDomains()) };
    let totalAP = 0, totalFund = 0;
    let totalEscChange = 0, totalRepChange = 0, totalDomChange = 0;
    let avgSuccessRate = 0;
    let riskCount = 0;

    /* 逐行动分析 */
    actions.forEach((action, idx) => {
      const successRate = this._estimateSuccessRate(action, state);
      avgSuccessRate += successRate;

      /* 域值变化 */
      const domainChanges = {};
      Object.entries(action.effects || {}).forEach(([key, val]) => {
        const current = domains[key] ?? 50;
        const projected = Math.max(0, Math.min(100, current + val));
        domainChanges[key] = { from: current, to: projected, delta: val };
        domains[key] = projected; /* 累积 */
      });

      /* 资源消耗 */
      totalAP += action.cost || 0;
      totalFund += action.fundingCost || 0;
      totalEscChange += action.escalation || 0;
      totalRepChange += action.repEffect || 0;
      totalDomChange += action.domEffect || 0;

      if(action.risk >= 0.3) riskCount++;

      /* 识别连锁反应 */
      const chains = [];
      if(action.escalation >= 2){
        chains.push({
          type: 'escalation',
          desc: `升级度+${action.escalation}，对手反制概率提升至${Math.round(40 + action.escalation * 15)}%`,
        });
      }
      if(action.repEffect < -5){
        chains.push({
          type: 'reputation',
          desc: `声望${action.repEffect}，后续轮次所有行动成功率下降约${Math.round(-action.repEffect * 0.3)}%`,
        });
      }
      if(action.effects?.military > 5 && action.effects?.diplomatic < 0){
        chains.push({
          type: 'cross_domain',
          desc: `军事域提升将引发外交域${action.effects.diplomatic}连锁负面影响`,
        });
      }
      if(action.fundingCost > 500){
        chains.push({
          type: 'economic',
          desc: `资金消耗${action.fundingCost}亿，占当前储备${Math.round(action.fundingCost / (state.funding || 1) * 100)}%`,
        });
      }

      predictions.push({
        actionName: action.name,
        successRate: Math.round(successRate),
        domainChanges,
        chains,
        risk: action.risk,
        riskLabel: action.risk >= 0.3 ? '高风险' : action.risk >= 0.15 ? '中风险' : '低风险',
      });
    });

    avgSuccessRate = Math.round(avgSuccessRate / actions.length);

    /* 综合评估 */
    const newEscalation = Math.max(1, Math.min(5, (state.escalation || 1) + totalEscChange));
    const newRep = Math.max(0, Math.min(100, (state.reputation || 50) + totalRepChange));
    const newDom = Math.max(0, Math.min(100, (state.domesticSupport || 50) + totalDomChange));
    const remainingFund = (state.funding || 0) - totalFund;

    /* 域值变化汇总 */
    const oldDomainAvg = Object.entries(domains).filter(([k]) => !k.startsWith('_'))
      .map(([,v]) => v).reduce((s,v) => s+v, 0) /
      Object.entries(domains).filter(([k]) => !k.startsWith('_')).length;
    const projectedDomainAvg = oldDomainAvg; /* 已累积 */

    let summary = '';
    const warnings = [];

    if(newEscalation >= 4){
      warnings.push(`⚠️ 升级度将达${newEscalation}级，进入战争边缘态势`);
    }
    if(newRep < 30){
      warnings.push(`⚠️ 声望将降至${newRep}，后续行动成功率受惩罚`);
    }
    if(remainingFund < 200){
      warnings.push(`⚠️ 执行后资金仅剩${remainingFund}亿，后续轮次行动选择受限`);
    }
    if(riskCount >= 2){
      warnings.push(`⚠️ 包含${riskCount}个高风险行动，失败概率较大`);
    }
    if(avgSuccessRate < 50){
      warnings.push(`⚠️ 平均成功率仅${avgSuccessRate}%，建议增加支援行动提升成功率`);
    }

    /* 正面预测 */
    const positives = [];
    if(totalRepChange > 0) positives.push(`声望+${totalRepChange}`);
    if(totalDomChange > 0) positives.push(`国内支持+${totalDomChange}`);
    if(totalEscChange < 0) positives.push(`升级度${totalEscChange}`);
    const domainGain = Object.entries(domains).filter(([k]) => !k.startsWith('_'))
      .reduce((s, [k, v]) => {
        const orig = (state.domains || this._getLiveDomains())[k] ?? 50;
        return s + Math.max(0, v - orig);
      }, 0);
    if(domainGain > 0) positives.push(`六域总提升${domainGain}`);

    summary = warnings.length > 0
      ? `预测${actions.length}项行动：成功率均${avgSuccessRate}%，存在${warnings.length}项风险。` +
        (positives.length > 0 ? `正面效果：${positives.join('、')}。` : '')
      : `预测${actions.length}项行动：成功率均${avgSuccessRate}%，态势平稳。` +
        (positives.length > 0 ? `预期效果：${positives.join('、')}。` : '');

    return {
      summary,
      predictions,
      warnings,
      positives,
      projected: {
        escalation: newEscalation,
        reputation: newRep,
        domesticSupport: newDom,
        funding: remainingFund,
        domainAvg: Math.round(projectedDomainAvg),
      },
      avgSuccessRate,
      totalAP,
      totalFund,
    };
  },

  /* ==================== 4. 对手分析 ==================== */

  /**
   * 分析玩家行为模式（用于AI对手自适应）
   * @param {Array} history — 历史行动记录
   * @returns {Object} 分析结果
   */
  analyzeOpponent(history){
    if(!history || history.length === 0){
      return { patterns: {}, tendency: 'unknown', weakness: [] };
    }

    const patterns = {};
    let aggressiveCount = 0, defensiveCount = 0;
    let totalEscalation = 0;
    const domainFreq = {};

    history.forEach(entry => {
      const actions = entry.playerActions || entry.actions || [];
      actions.forEach(a => {
        /* 行动模式统计 */
        const key = `${a.domain}_${a.id}`;
        patterns[key] = (patterns[key] || 0) + 1;

        /* 攻防倾向 */
        if(a.escalation >= 2 || a.risk >= 0.3) aggressiveCount++;
        if(a.escalation <= 0 && a.risk < 0.15) defensiveCount++;

        totalEscalation += a.escalation || 0;

        /* 域偏好 */
        domainFreq[a.domain] = (domainFreq[a.domain] || 0) + 1;
      });
    });

    /* 计算倾向 */
    const totalActions = aggressiveCount + defensiveCount;
    const aggressionRate = totalActions > 0 ? aggressiveCount / totalActions : 0.5;
    const avgEscalation = history.length > 0 ? totalEscalation / history.length : 1;

    /* 识别薄弱域（玩家很少投入的域） */
    const allDomains = ['military','economic','cyber','diplomatic','information','domestic'];
    const weakness = allDomains
      .filter(d => !domainFreq[d] || domainFreq[d] === 0)
      .map(d => this._domainMeta(d).name);

    /* 更新玩家画像 */
    this.memory.playerProfile.aggressionTendency = aggressionRate;
    this.memory.playerProfile.riskTolerance = aggressionRate * 0.7 + 0.3 * (avgEscalation / 5);
    this.memory.playerProfile.domainPreference = domainFreq;
    this.memory.playerProfile.totalGames = history.length;

    return {
      patterns,
      tendency: aggressionRate > 0.6 ? 'aggressive' : aggressionRate < 0.3 ? 'defensive' : 'balanced',
      aggressionRate: Math.round(aggressionRate * 100) / 100,
      weakness,
      preferredDomains: Object.entries(domainFreq)
        .sort((a,b) => b[1] - a[1]).slice(0, 2).map(([d]) => d),
    };
  },

  /**
   * 基于玩家画像，为AI对手选择反制行动
   * @param {Array} availableCounters — 可用的反制行动
   * @returns {Object} 推荐的反制行动及理由
   */
  recommendCounterStrategy(availableCounters){
    const profile = this.memory.playerProfile;
    const oppAnalysis = this.analyzeOpponent(this.memory.history);

    if(!availableCounters || availableCounters.length === 0){
      return null;
    }

    let best = availableCounters[0];
    let bestScore = 0;
    let reasoning = '';

    for(const c of availableCounters){
      let score = 0;
      const reasons = [];

      /* 如果玩家偏攻击，AI选择防御反制 */
      if(oppAnalysis.tendency === 'aggressive' && c.escalation <= 1){
        score += 20;
        reasons.push('对手偏攻击型，选择防御性反制以消耗其锐气');
      }
      /* 如果玩家偏防御，AI选择进攻性反制 */
      if(oppAnalysis.tendency === 'defensive' && c.escalation >= 2){
        score += 20;
        reasons.push('对手偏防御型，选择进攻性反制以打破僵局');
      }
      /* 针对玩家薄弱域 */
      if(oppAnalysis.weakness.length > 0 && c.effects){
        const targetsWeakness = oppAnalysis.weakness.some(w =>
          Object.keys(c.effects).some(k => this._domainMeta(k)?.name === w)
        );
        if(targetsWeakness){
          score += 15;
          reasons.push('针对对手薄弱域发起反制');
        }
      }
      /* 基础成功率 */
      score += c.successBase || 50;

      if(score > bestScore){
        bestScore = score;
        best = c;
        reasoning = reasons.join('；') || '基于综合评估选择最优反制策略';
      }
    }

    return { action: best, reasoning, score: Math.round(bestScore) };
  },

  /* ==================== 5. 主动预警 ==================== */

  /**
   * 生成主动预警
   * @param {Object} state — 当前状态
   * @returns {Array} 预警列表
   */
  generateWarning(state){
    if(!state) state = this._getGlobalState();
    const warnings = [];
    const domains = state.domains || this._getLiveDomains();
    const escalation = state.escalation ?? 1;
    const rep = state.reputation ?? 50;
    const dom = state.domesticSupport ?? 50;
    const fund = state.funding ?? 0;
    const maxFund = state.maxFunding ?? 1;

    /* 域值崩溃预警 */
    Object.entries(domains).forEach(([key, val]) => {
      if(key.startsWith('_')) return;
      if(val <= 25){
        warnings.push({
          level: 'critical',
          icon: '🔴',
          title: `${this._domainMeta(key).name}域崩溃警告`,
          desc: `${this._domainMeta(key).name}域当前仅${val}分，即将崩溃。` +
            `若不立即修复，将严重影响战略评分并可能触发连锁危机。`,
          action: '立即选择该域修复行动',
        });
      } else if(val <= 40){
        warnings.push({
          level: 'high',
          icon: '🟠',
          title: `${this._domainMeta(key).name}域警戒`,
          desc: `${this._domainMeta(key).name}域降至${val}分，处于警戒区间。`,
          action: '关注该域变化，适时修复',
        });
      }
    });

    /* 升级度预警 */
    if(escalation >= 4){
      warnings.push({
        level: 'critical',
        icon: '🔴',
        title: '战争边缘态势',
        desc: `升级度已达${escalation}级，对手AI攻击性将达${Math.round(this._escAiAggr(escalation)*100)}%。` +
          `高强度反制即将到来，建议选择降级行动。`,
        action: '优先选择升级度≤0的行动',
      });
    } else if(escalation >= 3 && escalation < 4){
      warnings.push({
        level: 'high',
        icon: '🟠',
        title: '冲突风险上升',
        desc: `升级度${escalation}级，冲突风险显著增加。`,
        action: '谨慎选择高升级度行动',
      });
    }

    /* 声望预警 */
    if(rep < 25){
      warnings.push({
        level: 'high',
        icon: '🟠',
        title: '国际声望危机',
        desc: `国际声望仅${rep}分，所有行动成功率将下降约${Math.round((50-rep)*0.2)}%。`,
        action: '选择声望正收益的外交行动',
      });
    }

    /* 资金预警 */
    if(fund / maxFund < 0.15){
      warnings.push({
        level: 'high',
        icon: '🟠',
        title: '资金储备告急',
        desc: `资金仅剩${fund}亿（总量${maxFund}亿），后续行动选择将严重受限。`,
        action: '优先选择低消耗行动或经济收益行动',
      });
    }

    /* 经验教训预警 */
    this.memory.lessonsLearned.forEach(lesson => {
      if(lesson.domain === 'economic' && lesson.severity === 'high'){
        const econVal = domains.economic ?? 50;
        if(econVal <= lesson.threshold && !warnings.find(w => w.title.includes('经济'))){
          warnings.push({
            level: 'medium',
            icon: '🟡',
            title: '经验教训提醒',
            desc: lesson.text,
            action: '参考历史经验调整策略',
          });
        }
      }
    });

    return warnings;
  },

  /* ==================== 6. 战略对话 ==================== */

  /**
   * 响应用户的战略提问（人机协同对话）
   * @param {String} question — 用户提问
   * @param {Object} state — 当前状态
   * @returns {Object} 回答 { text, type, data }
   */
  respondToQuery(question, state){
    if(!state) state = this._getGlobalState();
    const q = question.toLowerCase();

    /* 态势相关 */
    if(q.includes('态势') || q.includes('现状') || q.includes('情况') || q.includes('怎么样')){
      const a = this.assessSituation(state);
      return {
        type: 'assessment',
        text: `📊 当前态势：${a.posture}（综合评分${a.score}）\n` +
          `${a.overall}\n` +
          (a.strengths.length > 0 ? `优势：${a.strengths.map(s => s.desc).join('；')}\n` : '') +
          (a.weaknesses.length > 0 ? `薄弱：${a.weaknesses.map(w => w.desc).join('；')}\n` : '') +
          (a.risks.length > 0 ? `风险：${a.risks.map(r => r.desc).join('；')}` : ''),
      };
    }

    /* 建议相关 */
    if(q.includes('建议') || q.includes('怎么办') || q.includes('推荐') || q.includes('该') || q.includes('如何')){
      const suggestions = this.generateSuggestions(state, {
        availableActions: (typeof Wargame !== 'undefined' && Wargame.state)
          ? Wargame.getAvailableActions() : [],
      });
      if(suggestions.length > 0){
        const top = suggestions[0];
        return {
          type: 'suggestion',
          text: `🤖 建议执行「${top.title}」\n` +
            `推理过程：${top.reasoning}\n` +
            `预期收益：${top.expectedGain} | 置信度：${Math.round(top.confidence*100)}%`,
          action: top.action,
        };
      }
      return { type: 'suggestion', text: '当前暂无明确建议，请根据态势自行判断。' };
    }

    /* 风险相关 */
    if(q.includes('风险') || q.includes('危险') || q.includes('问题') || q.includes('警告')){
      const warnings = this.generateWarning(state);
      if(warnings.length > 0){
        return {
          type: 'warning',
          text: warnings.map(w => `${w.icon} ${w.title}：${w.desc}`).join('\n'),
        };
      }
      return { type: 'warning', text: '✅ 当前无明显风险预警。' };
    }

    /* 对手相关 */
    if(q.includes('对手') || q.includes('敌方') || q.includes('ai') || q.includes('反制')){
      const analysis = this.analyzeOpponent(this.memory.history);
      return {
        type: 'opponent',
        text: `🎯 对手行为分析：\n` +
          `倾向：${analysis.tendency === 'aggressive' ? '攻击型' : analysis.tendency === 'defensive' ? '防御型' : '均衡型'}（攻击率${analysis.aggressionRate}）\n` +
          (analysis.weakness.length > 0 ? `对手薄弱域：${analysis.weakness.join('、')}` : '暂未发现明显薄弱域'),
      };
    }

    /* 预测相关 */
    if(q.includes('预测') || q.includes('后果') || q.includes('影响') || q.includes('会怎样')){
      const selected = (typeof Wargame !== 'undefined' && Wargame.state)
        ? Wargame.state.selectedActions : [];
      if(selected.length > 0){
        const pred = this.predictImpact(selected, state);
        return {
          type: 'prediction',
          text: pred.summary +
            (pred.warnings.length > 0 ? '\n' + pred.warnings.join('\n') : ''),
          data: pred,
        };
      }
      return { type: 'prediction', text: '请先选择行动，我将预测其跨域影响。' };
    }

    /* 默认回复 */
    return {
      type: 'general',
      text: `我可以帮您分析态势、提供建议、预测影响、分析对手和生成预警。\n` +
        `试试问："当前态势如何？"、"有什么建议？"、"有什么风险？"、"对手是什么风格？"`,
    };
  },

  /* ==================== 记忆更新 ==================== */

  /**
   * 记录推演结果到战略记忆
   * @param {Object} result — 推演结果
   */
  recordGameResult(result){
    this.memory.history.push({
      scenarioId: result.scenarioId,
      scenarioName: result.scenarioName,
      score: result.score,
      grade: result.grade,
      playerActions: result.playerActions || [],
      escalation: result.escalation,
      timestamp: Date.now(),
    });

    /* 更新玩家画像 */
    this.memory.playerProfile.totalGames++;
    this.memory.playerProfile.totalRounds += result.rounds || 5;

    /* 从行动记录学习 */
    if(result.playerActions){
      this.analyzeOpponent([{ playerActions: result.playerActions }]);
    }

    /* 生成新的经验教训 */
    if(result.score < 45){
      this.memory.lessonsLearned.push({
        id: 'lesson_' + String(this.memory.lessonsLearned.length + 1).padStart(3, '0'),
        text: `在「${result.scenarioName}」中得分${result.score}，` +
          `${result.escalation >= 3 ? '升级度过高导致对手反制激烈' : '域值平衡不足导致评分偏低'}`,
        domain: result.escalation >= 3 ? 'escalation' : 'balance',
        threshold: 0,
        severity: 'high',
      });
    } else if(result.score >= 80){
      this.memory.lessonsLearned.push({
        id: 'lesson_' + String(this.memory.lessonsLearned.length + 1).padStart(3, '0'),
        text: `在「${result.scenarioName}」中得分${result.score}（${result.grade}级），` +
          `策略有效，可作为后续参考`,
        domain: 'strategy',
        threshold: 0,
        severity: 'positive',
      });
    }

    /* 限制记忆库大小 */
    if(this.memory.history.length > 50){
      this.memory.history = this.memory.history.slice(-50);
    }
    if(this.memory.lessonsLearned.length > 30){
      this.memory.lessonsLearned = this.memory.lessonsLearned.slice(-30);
    }
  },

  /**
   * 记录用户对AI建议的反馈（接受/拒绝）
   * @param {Object} suggestion — 被反馈的建议
   * @param {Boolean} accepted — 是否接受
   */
  recordSuggestionFeedback(suggestion, accepted){
    this.memory.playerProfile.totalSuggestions++;
    if(accepted){
      this.memory.playerProfile.acceptedSuggestions++;
      if(suggestion.action && !this.memory.playerProfile.preferredStrategies.includes(suggestion.action.id)){
        this.memory.playerProfile.preferredStrategies.push(suggestion.action.id);
      }
    }
    this.memory.playerProfile.acceptRate =
      this.memory.playerProfile.acceptedSuggestions / this.memory.playerProfile.totalSuggestions;
  },

  /* ==================== 内部工具方法 ==================== */

  _getGlobalState(){
    if(typeof GlobalStateSync !== 'undefined'){
      const domains = GlobalStateSync.getLiveDomains() || {};
      const forces = GlobalStateSync.getLiveForces() || [];
      const threats = GlobalStateSync.getLiveThreats() || [];
      const monitor = GlobalStateSync.getLiveSystemMonitor() || {};
      return {
        domains,
        forces,
        threats,
        escalation: (typeof STATE !== 'undefined' ? STATE.defcon : 3),
        reputation: 50,
        domesticSupport: 50,
        funding: 0,
        maxFunding: 1,
        round: 1,
        maxRounds: 5,
        actionPoints: 5,
      };
    }
    return {
      domains: { military:50, economic:50, cyber:50, diplomatic:50, information:50, domestic:50 },
      escalation: 1, reputation: 50, domesticSupport: 50, funding: 0, maxFunding: 1,
    };
  },

  _getLiveDomains(){
    if(typeof GlobalStateSync !== 'undefined'){
      return GlobalStateSync.getLiveDomains() ||
        { military:50, economic:50, cyber:50, diplomatic:50, information:50, domestic:50 };
    }
    return { military:50, economic:50, cyber:50, diplomatic:50, information:50, domestic:50 };
  },

  _domainMeta(key){
    const map = {
      military:    { name:'军事', icon:'⚔️', color:'#ff4757' },
      economic:    { name:'经济', icon:'📊', color:'#ffa502' },
      cyber:       { name:'网络', icon:'🌐', color:'#00b4d8' },
      diplomatic:  { name:'外交', icon:'🤝', color:'#2ed573' },
      information: { name:'信息', icon:'📡', color:'#ff6348' },
      domestic:    { name:'国内', icon:'🏠', color:'#a29bfe' },
      space:       { name:'太空', icon:'🛰️', color:'#778beb' },
    };
    return map[key] || { name: key, icon:'❓', color:'#999' };
  },

  _escAiAggr(esc){
    const levels = [0.3, 0.5, 0.65, 0.8, 0.95];
    return levels[Math.max(0, Math.min(4, esc - 1))];
  },

  _estimateSuccessRate(action, state){
    let rate = action.successBase || 60;
    /* 力量修正 */
    if(state.forces){
      const forceCode = (typeof getActionForce === 'function') ? getActionForce(action) : null;
      if(forceCode){
        const force = state.forces.find(f => f.code === forceCode);
        if(force){
          rate += (force.readiness - 50) * 0.3;
        }
      }
    }
    /* 声望修正 */
    const rep = state.reputation ?? 50;
    rate += (rep - 50) * 0.2;
    /* 国内支持修正 */
    const dom = state.domesticSupport ?? 50;
    rate += (dom - 50) * 0.1;
    /* 情报修正 */
    if(state.activeIntelMods && state.activeIntelMods[action.domain]){
      rate += state.activeIntelMods[action.domain];
    }
    /* 支援行动修正 */
    if(state.activeSupportMods?.successRateBonus?.[action.domain]){
      rate += state.activeSupportMods.successRateBonus[action.domain];
    }
    return Math.max(5, Math.min(95, rate));
  },

  _findActionsForDomain(domainKey){
    if(typeof STRATEGIC_ACTIONS === 'undefined') return [];
    return STRATEGIC_ACTIONS.filter(a =>
      a.effects && a.effects[domainKey] && a.effects[domainKey] > 5
    ).sort((a,b) =>
      (b.effects[domainKey] || 0) - (a.effects[domainKey] || 0)
    ).slice(0, 5);
  },

  /* ==================== 渲染方法 ==================== */

  /**
   * 渲染AI智囊面板（嵌入推演界面）
   * @param {Object} state — 推演状态
   * @returns {String} HTML
   */
  renderAdvisorPanel(state){
    const assessment = this.assessSituation(state);
    const warnings = this.generateWarning(state);
    const suggestions = this.generateSuggestions(state, {
      availableActions: (typeof Wargame !== 'undefined' && Wargame.state)
        ? Wargame.getAvailableActions() : [],
      selectedActions: state.selectedActions || [],
    });

    let html = '<div class="ai-advisor-panel">';

    /* --- 智囊标题栏 --- */
    html += `
      <div class="ai-advisor-head">
        <span class="ai-advisor-icon">🤖</span>
        <div class="ai-advisor-title-group">
          <span class="ai-advisor-title">AI战略智囊</span>
          <span class="ai-advisor-sub">人机协同 · 实时研判</span>
        </div>
        <span class="ai-advisor-status" style="background:${assessment.postureColor}22;color:${assessment.postureColor};border:1px solid ${assessment.postureColor}44">
          ${assessment.posture}
        </span>
      </div>
    `;

    /* --- 态势评估 --- */
    html += `
      <div class="ai-assessment">
        <div class="ai-assess-score" style="color:${assessment.postureColor}">
          <span class="ai-assess-num">${assessment.score}</span>
          <span class="ai-assess-label">态势分</span>
        </div>
        <div class="ai-assess-desc">${assessment.overall}</div>
      </div>
    `;

    /* --- 优势/薄弱 --- */
    if(assessment.strengths.length > 0 || assessment.weaknesses.length > 0){
      html += '<div class="ai-sw-grid">';
      if(assessment.strengths.length > 0){
        html += `<div class="ai-sw-col ai-sw-pos">
          <div class="ai-sw-head">✅ 优势</div>
          ${assessment.strengths.slice(0,3).map(s =>
            `<div class="ai-sw-item"><span class="ai-sw-val">${s.value}</span> ${s.desc}</div>`
          ).join('')}
        </div>`;
      }
      if(assessment.weaknesses.length > 0){
        html += `<div class="ai-sw-col ai-sw-neg">
          <div class="ai-sw-head">⚠️ 薄弱</div>
          ${assessment.weaknesses.slice(0,3).map(w =>
            `<div class="ai-sw-item"><span class="ai-sw-val">${w.value}</span> ${w.desc}</div>`
          ).join('')}
        </div>`;
      }
      html += '</div>';
    }

    /* --- 主动预警 --- */
    if(warnings.length > 0){
      html += '<div class="ai-warnings">';
      warnings.slice(0, 3).forEach(w => {
        const color = w.level === 'critical' ? 'var(--red)' : w.level === 'high' ? 'var(--amber)' : 'var(--cyan)';
        html += `
          <div class="ai-warn-item" style="border-left-color:${color}">
            <span class="ai-warn-icon">${w.icon}</span>
            <div class="ai-warn-body">
              <div class="ai-warn-title">${w.title}</div>
              <div class="ai-warn-desc">${w.desc}</div>
              <div class="ai-warn-action" style="color:${color}">→ ${w.action}</div>
            </div>
          </div>
        `;
      });
      html += '</div>';
    }

    /* --- 策略建议 --- */
    if(suggestions.length > 0){
      html += '<div class="ai-suggestions">';
      html += '<div class="ai-sug-head">💡 AI策略建议（含推理）</div>';
      suggestions.slice(0, 3).forEach((sug, idx) => {
        const priColor = sug.priority === 'critical' ? 'var(--red)' :
          sug.priority === 'high' ? 'var(--amber)' : 'var(--cyan)';
        html += `
          <div class="ai-sug-card" data-sug-idx="${idx}" style="border-color:${priColor}44">
            <div class="ai-sug-header">
              <span class="ai-sug-priority" style="background:${priColor}22;color:${priColor}">${sug.priority === 'critical' ? '紧急' : sug.priority === 'high' ? '重要' : '建议'}</span>
              <span class="ai-sug-title">${sug.title}</span>
              <span class="ai-sug-conf">置信${Math.round(sug.confidence*100)}%</span>
            </div>
            <div class="ai-sug-reasoning">${sug.reasoning}</div>
            ${sug.action ? `
              <div class="ai-sug-actions">
                <button class="ai-sug-btn ai-sug-accept" onclick="AIAdvisor._acceptSuggestion(${idx})">
                  ✓ 采纳建议
                </button>
                <button class="ai-sug-btn ai-sug-analyze" onclick="AIAdvisor._analyzeSuggestion(${idx})">
                  📊 预测影响
                </button>
                <button class="ai-sug-btn ai-sug-dismiss" onclick="AIAdvisor._dismissSuggestion(${idx})">
                  ✗ 不采纳
                </button>
              </div>
            ` : ''}
          </div>
        `;
      });
      html += '</div>';
      /* 存储当前建议供交互使用 */
      this._currentSuggestions = suggestions;
    }

    /* --- 人机协同对话区 --- */
    html += `
      <div class="ai-dialog-area">
        <div class="ai-dialog-head">
          <span>💬 战略对话</span>
          <span class="ai-dialog-hint">向AI提问或讨论</span>
        </div>
        <div class="ai-dialog-quick">
          <button class="ai-quick-btn" onclick="AIAdvisor._quickAsk('当前态势如何？')">📊 态势</button>
          <button class="ai-quick-btn" onclick="AIAdvisor._quickAsk('有什么建议？')">💡 建议</button>
          <button class="ai-quick-btn" onclick="AIAdvisor._quickAsk('有什么风险？')">⚠️ 风险</button>
          <button class="ai-quick-btn" onclick="AIAdvisor._quickAsk('对手是什么风格？')">🎯 对手</button>
          <button class="ai-quick-btn" onclick="AIAdvisor._quickAsk('预测后果')">🔮 预测</button>
        </div>
        <div class="ai-dialog-input-wrap">
          <input type="text" class="ai-dialog-input" id="aiDialogInput"
            placeholder="输入战略问题..." onkeypress="if(event.key==='Enter')AIAdvisor._submitQuery()" />
          <button class="ai-dialog-send" onclick="AIAdvisor._submitQuery()">发送</button>
        </div>
        <div class="ai-dialog-response" id="aiDialogResponse"></div>
      </div>
    `;

    html += '</div>';
    return html;
  },

  /**
   * 渲染仪表盘上的AI智囊卡片
   * @returns {String} HTML
   */
  renderDashboardWidget(){
    const state = this._getGlobalState();
    const assessment = this.assessSituation(state);
    const warnings = this.generateWarning(state);
    const suggestions = this.generateSuggestions(state, {});

    let html = '<div class="ai-dash-widget">';

    /* 标题 */
    html += `
      <div class="ai-dash-head">
        <span class="ai-dash-icon">🤖</span>
        <span class="ai-dash-title">AI战略智囊</span>
        <span class="ai-dash-status" style="color:${assessment.postureColor}">${assessment.posture}</span>
      </div>
    `;

    /* 评分 */
    html += `
      <div class="ai-dash-score-area">
        <div class="ai-dash-score" style="color:${assessment.postureColor}">${assessment.score}</div>
        <div class="ai-dash-score-label">综合态势评分</div>
      </div>
    `;

    /* 评估描述 */
    html += `<div class="ai-dash-desc">${assessment.overall}</div>`;

    /* 预警 */
    if(warnings.length > 0){
      html += '<div class="ai-dash-warnings">';
      warnings.slice(0, 2).forEach(w => {
        const color = w.level === 'critical' ? 'var(--red)' : w.level === 'high' ? 'var(--amber)' : 'var(--cyan)';
        html += `
          <div class="ai-dash-warn" style="border-color:${color}44">
            <span>${w.icon}</span>
            <span class="ai-dash-warn-text">${w.title}</span>
          </div>
        `;
      });
      html += '</div>';
    }

    /* 建议 */
    if(suggestions.length > 0){
      html += '<div class="ai-dash-suggestions">';
      suggestions.slice(0, 2).forEach(sug => {
        const priColor = sug.priority === 'critical' ? 'var(--red)' :
          sug.priority === 'high' ? 'var(--amber)' : 'var(--cyan)';
        html += `
          <div class="ai-dash-sug" style="border-color:${priColor}44">
            <span class="ai-dash-sug-pri" style="color:${priColor}">●</span>
            <span class="ai-dash-sug-text">${sug.title}</span>
          </div>
        `;
      });
      html += '</div>';
    }

    /* 记忆摘要 */
    const mem = this.memory.playerProfile;
    html += `
      <div class="ai-dash-memory">
        <span class="ai-dash-mem-item">推演记忆: ${mem.totalGames}局</span>
        <span class="ai-dash-mem-item">建议采纳率: ${Math.round(mem.acceptRate*100)}%</span>
        <span class="ai-dash-mem-item">经验教训: ${this.memory.lessonsLearned.length}条</span>
      </div>
    `;

    html += '</div>';
    return html;
  },

  /* ==================== 交互方法 ==================== */

  _currentSuggestions: [],

  _acceptSuggestion(idx){
    const sug = this._currentSuggestions[idx];
    if(!sug || !sug.action) return;

    /* 将建议的行动添加到已选行动 */
    if(typeof Wargame !== 'undefined' && Wargame.state){
      const s = Wargame.state;
      /* 检查是否已选 */
      if(s.selectedActions.find(a => a.id === sug.action.id)){
        this._showDialogResponse('✅ 该行动已在选择列表中。', 'info');
        return;
      }
      /* 检查AP和资金 */
      if(s.actionPoints < sug.action.cost){
        this._showDialogResponse(`⚠️ 行动点不足（需${sug.action.cost}，剩余${s.actionPoints}）。`, 'warn');
        return;
      }
      if(s.funding < sug.action.fundingCost){
        this._showDialogResponse(`⚠️ 资金不足（需${sug.action.fundingCost}亿，剩余${s.funding}亿）。`, 'warn');
        return;
      }
      /* 添加到已选 */
      s.selectedActions.push(sug.action);
      this.recordSuggestionFeedback(sug, true);
      this._showDialogResponse(
        `✅ 已采纳建议：「${sug.action.name}」已加入行动列表。\n` +
        `AI推理：${sug.reasoning}`, 'success'
      );
      /* 重新渲染推演界面 */
      Wargame.renderWargameView();
    }
  },

  _analyzeSuggestion(idx){
    const sug = this._currentSuggestions[idx];
    if(!sug || !sug.action) return;

    const state = (typeof Wargame !== 'undefined' && Wargame.state) || this._getGlobalState();
    const currentSelected = state.selectedActions || [];
    const pred = this.predictImpact([...currentSelected, sug.action], state);

    let text = `📊 影响预测：${pred.summary}\n`;
    if(pred.warnings.length > 0){
      text += `\n风险提示：\n${pred.warnings.join('\n')}`;
    }
    if(pred.positives.length > 0){
      text += `\n正面效果：${pred.positives.join('、')}`;
    }
    text += `\n预测成功率：${pred.avgSuccessRate}%`;

    this._showDialogResponse(text, 'analysis');
  },

  _dismissSuggestion(idx){
    const sug = this._currentSuggestions[idx];
    if(!sug) return;
    this.recordSuggestionFeedback(sug, false);
    this._showDialogResponse(
      `已记录您的选择。AI将根据您的偏好调整后续建议风格。`, 'info'
    );
    /* 移除该建议卡片 */
    const card = document.querySelector(`[data-sug-idx="${idx}"]`);
    if(card){
      card.style.transition = 'opacity .3s, transform .3s';
      card.style.opacity = '0';
      card.style.transform = 'translateX(20px)';
      setTimeout(() => card.remove(), 300);
    }
  },

  _quickAsk(question){
    const state = (typeof Wargame !== 'undefined' && Wargame.state) || this._getGlobalState();
    const response = this.respondToQuery(question, state);
    this._showDialogResponse(response.text, response.type);
  },

  _submitQuery(){
    const input = document.getElementById('aiDialogInput');
    if(!input || !input.value.trim()) return;
    const question = input.value.trim();
    input.value = '';
    const state = (typeof Wargame !== 'undefined' && Wargame.state) || this._getGlobalState();
    const response = this.respondToQuery(question, state);
    this._showDialogResponse(`👤 ${question}\n\n🤖 ${response.text}`, response.type);
  },

  _showDialogResponse(text, type){
    const el = document.getElementById('aiDialogResponse');
    if(!el) return;
    const typeColor = {
      success: 'var(--green)', warn: 'var(--amber)', error: 'var(--red)',
      info: 'var(--cyan)', assessment: 'var(--cyan)', suggestion: 'var(--green)',
      warning: 'var(--amber)', opponent: 'var(--purple)', prediction: 'var(--cyan)',
      analysis: 'var(--cyan)', general: 'var(--txt-1)',
    };
    const color = typeColor[type] || 'var(--txt-1)';
    el.innerHTML = `<div class="ai-res-msg" style="border-left-color:${color}">${text.replace(/\n/g, '<br>')}</div>`;
    el.style.animation = 'none';
    el.offsetHeight; /* 触发重排 */
    el.style.animation = 'fadeIn .3s';
  },

};
