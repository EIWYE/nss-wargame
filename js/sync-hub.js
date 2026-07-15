/**
 * NSS-WGS v12.1 — 全局状态同步中枢
 * 职责：接收所有模块状态变更 → 传播到全局数据结构 → 触发UI刷新
 *
 * 这是系统的"中枢神经系统"，确保没有任何模块是数据孤岛。
 */

const GlobalStateSync = {

  /* ---- 域值映射表：模块内部键 → DOMAINS 数组索引 ---- */
  _domainIndexMap: {
    military: 0, economic: 1, cyber: 2, diplomatic: 3, space: 4, information: 5,
  },

  /* ---- 脏标记：仪表盘是否需要重绘 ---- */
  _dashboardDirty: false,
  _forcePanelDirty: false,
  _casePanelDirty: false,

  /* ==================== 核心同步方法 ==================== */

  /**
   * 推演结束后同步——这是最重要的入口
   * @param {Object} result — 推演结果 { scenarioId, scenarioName, score, domains, forces, escalation, reputation, domesticSupport, funding, grade }
   * @param {String} source — 'wargame' | 'strategic'
   */
  syncWargameResult(result, source){
    if(!result) return;

    /* 1. 同步全局域值 (DOMAINS) */
    this._syncDomains(result.domains, result.escalation);

    /* 2. 同步全局力量战备 (FORCES) */
    if(result.forces && result.forces.length > 0){
      this._syncForces(result.forces);
    }

    /* 3. 同步全局威胁等级 & DEFCON */
    this._syncThreatLevel(result);

    /* 4. 同步声望和国内支持 */
    this._syncReputation(result);

    /* 5. 同步案例库标记 */
    this._syncCaseLibrary(result);

    /* 6. 更新数据流信息 */
    this._syncDataStream(result, source);

    /* 7. 标记面板脏数据 */
    this._dashboardDirty = true;
    this._forcePanelDirty = true;
    this._casePanelDirty = true;

    /* 8. 尝试即时刷新面板 */
    this._tryRefreshDashboard();

    /* 9. 记录同步日志 */
    this._log('推演结果已同步到全局状态', {
      source, scenario: result.scenarioName, score: result.score, grade: result.grade,
      domains: Object.keys(result.domains || {}).length,
      forces: (result.forces || []).length,
    });
  },

  /**
   * 功能区操作后同步
   */
  syncZoneOperation(zoneId, actionName, effects){
    if(!effects) return;

    /* 功能区操作影响全局域值 */
    if(typeof DOMAINS !== 'undefined' && typeof ZoneSystem !== 'undefined'){
      const zoneState = ZoneSystem._state?.[zoneId];
      if(zoneState){
        // 根据功能区类型映射到全局域
        const domainMap = { intel: 'information', logistics: 'military', economy: 'economic', diplomatic: 'diplomatic', training: 'military' };
        const targetDomain = domainMap[zoneId];
        if(targetDomain && this._domainIndexMap[targetDomain] !== undefined){
          const idx = this._domainIndexMap[targetDomain];
          if(DOMAINS[idx]){
            DOMAINS[idx].readiness = Math.max(10, Math.min(95,
              (DOMAINS[idx].readiness || 50) + (effects.improvement || 2)
            ));
            // 更新趋势
            const oldTrend = DOMAINS[idx].trend || 0;
            DOMAINS[idx].trend = effects.improvement > 0 ? Math.min(15, oldTrend + 2) : oldTrend - 1;
          }
        }
      }
    }

    this._dashboardDirty = true;
    this._tryRefreshDashboard();

    this._log('功能区操作已同步', { zoneId, actionName });
  },

  /**
   * 训练完成后同步
   */
  syncTrainingComplete(moduleId, moduleName){
    // 训练完成提升整体军事和信息域
    if(typeof DOMAINS !== 'undefined'){
      [0, 5].forEach(idx => {
        if(DOMAINS[idx]){
          DOMAINS[idx].readiness = Math.min(95, (DOMAINS[idx].readiness || 50) + 1);
          DOMAINS[idx].trend = Math.min(10, (DOMAINS[idx].trend || 0) + 1);
        }
      });
    }

    // 全局威胁感知可能下降
    if(typeof STATE !== 'undefined'){
      STATE.threatLevel = Math.max(25, (STATE.threatLevel || 72) - 2);
    }

    this._dashboardDirty = true;
    this._tryRefreshDashboard();

    this._log('训练完成已同步', { moduleId, moduleName });
  },

  /**
   * 导演阶段完成后的初始状态同步
   */
  syncDirectorPhase(directorData){
    if(!directorData) return;

    // 将导演阶段的力量调配同步到全局
    if(directorData.forces && typeof FORCES !== 'undefined'){
      this._syncForces(directorData.forces);
    }
    if(directorData.domains && typeof DOMAINS !== 'undefined'){
      this._syncDomains(directorData.domains, 1);
    }

    this._dashboardDirty = true;
    this._tryRefreshDashboard();
  },

  /* ==================== 内部同步方法 ==================== */

  /** 同步域值到全局 DOMAINS */
  _syncDomains(domains, escalation){
    if(typeof DOMAINS === 'undefined') return;

    Object.entries(domains).forEach(([key, value]) => {
      const idx = this._domainIndexMap[key];
      if(idx !== undefined && DOMAINS[idx]){
        DOMAINS[idx].readiness = Math.max(5, Math.min(98, Math.round(value)));
        // 计算趋势（如果有上次值的话）
        if(DOMAINS[idx]._prevReadiness !== undefined){
          DOMAINS[idx].trend = Math.round(value - DOMAINS[idx]._prevReadiness);
        }
        DOMAINS[idx]._prevReadiness = Math.round(value);
        // 升级度影响态势描述
        if(typeof escalation === 'number' && escalation >= 4){
          DOMAINS[idx].status = '危机';
        } else if(typeof escalation === 'number' && escalation >= 2){
          DOMAINS[idx].status = '警戒';
        } else {
          DOMAINS[idx].status = '正常';
        }
      }
    });
  },

  /** 同步力量战备到全局 FORCES */
  _syncForces(forces){
    if(typeof FORCES === 'undefined') return;

    forces.forEach(sf => {
      // 匹配规则：按 branch/name/code 匹配
      const match = FORCES.find(f =>
        (sf.code && f.code === sf.code) ||
        (sf.branch && f.branch === sf.branch) ||
        (sf.name && (f.name === sf.name || f.branch === sf.name))
      );
      if(match){
        match.readiness = Math.round(sf.readiness || match.readiness || 70);
        // 更新趋势
        if(match._prevReadiness !== undefined){
          match.trend = Math.round((match.readiness - match._prevReadiness) / 2);
        }
        match._prevReadiness = match.readiness;
        // 根据战备度更新状态标签
        if(match.readiness >= 85) match.status = '精锐';
        else if(match.readiness >= 70) match.status = '常备';
        else if(match.readiness >= 50) match.status = '待修';
        else match.status = '损耗';
      }
    });
  },

  /** 同步威胁等级和DEFCON */
  _syncThreatLevel(result){
    if(typeof STATE === 'undefined') return;

    const score = result.score || 50;
    const escalation = result.escalation || 1;

    // 基于推演评分调整威胁感知
    if(score >= 80) STATE.threatLevel = Math.max(25, (STATE.threatLevel || 72) - 5);
    else if(score >= 60) STATE.threatLevel = Math.max(25, (STATE.threatLevel || 72) - 2);
    else STATE.threatLevel = Math.min(95, (STATE.threatLevel || 72) + 3);

    // DEFCON 联动升级度
    if(escalation >= 4) STATE.defcon = Math.max(3, STATE.defcon + 1);
    else if(escalation <= 1 && score >= 70) STATE.defcon = Math.max(1, STATE.defcon - 1);
    STATE.defcon = Math.max(1, Math.min(5, STATE.defcon));
  },

  /** 同步声望和国内支持 */
  _syncReputation(result){
    // 声望/国内支持已通过 STATE.games 记录，此处更新全局趋势指示
    if(typeof STATE !== 'undefined'){
      STATE._lastReputation = result.reputation;
      STATE._lastDomesticSupport = result.domesticSupport;
    }
  },

  /** 同步案例库标记 */
  _syncCaseLibrary(result){
    if(typeof ALL_CASES === 'undefined' || !result.scenarioId) return;

    ALL_CASES.forEach(c => {
      if(c.scenario === result.scenarioId){
        // 标记案例关联
        if(!c._experienceLog) c._experienceLog = [];
        c._experienceLog.push({
          date: new Date().toISOString().slice(0, 10),
          score: result.score,
          grade: result.grade,
        });
        c._latestScore = result.score;
        c._latestGrade = result.grade;
      }
    });
  },

  /** 更新数据流状态信息 */
  _syncDataStream(result, source){
    // 写入 STATE 供数据流组件读取
    if(typeof STATE !== 'undefined'){
      STATE._lastWargameResult = {
        scenarioName: result.scenarioName,
        score: result.score,
        grade: result.grade,
        source: source,
        timestamp: Date.now(),
      };
    }
  },

  /** 尝试刷新仪表盘 */
  _tryRefreshDashboard(){
    // 延迟刷新，避免阻塞当前操作
    if(this._refreshTimer) clearTimeout(this._refreshTimer);
    this._refreshTimer = setTimeout(() => {
      // 如果当前在态势总览标签页，重新渲染
      if(typeof App !== 'undefined' && typeof App.switchTab === 'function'){
        const currentTab = document.querySelector('.tab-item.active, .nav-item.active');
        if(currentTab){
          const tabId = currentTab.getAttribute('data-tab') ||
                        (currentTab.textContent.includes('态势总览') ? 'overview' : null);
          if(tabId && (tabId === 'overview' || tabId === 'forces' || tabId === 'intel')){
            App.switchTab(tabId);
          }
        }
      }
      this._dashboardDirty = false;
    }, 300);
  },

  /* ==================== 仪表盘数据提供方法 ==================== */

  /**
   * 获取实时域值数据（优先从活跃推演状态读取）
   */
  getLiveDomains(){
    // 优先读取活跃推演状态
    if(typeof Wargame !== 'undefined' && Wargame.state && Wargame.state.domains){
      return { ...Wargame.state.domains, _source: 'wargame' };
    }
    if(typeof STRATEGIC_STATE !== 'undefined' && STRATEGIC_STATE.currentScenarioIndex >= 0){
      const idx = STRATEGIC_STATE.currentScenarioIndex;
      const results = STRATEGIC_STATE.scenarioResults || [];
      if(results[idx] && results[idx].domains){
        return { ...results[idx].domains, _source: 'strategic' };
      }
    }
    // 回退到全局 DOMAINS
    if(typeof DOMAINS !== 'undefined'){
      const result = {};
      Object.entries(this._domainIndexMap).forEach(([key, idx]) => {
        if(DOMAINS[idx]) result[key] = DOMAINS[idx].readiness;
      });
      result._source = 'global';
      return result;
    }
    return null;
  },

  /**
   * 获取实时力量战备数据
   */
  getLiveForces(){
    if(typeof Wargame !== 'undefined' && Wargame.state && Wargame.state.forces){
      return Wargame.state.forces;
    }
    if(typeof FORCES !== 'undefined'){
      return FORCES;
    }
    return [];
  },

  /**
   * 获取实时威胁信息
   */
  getLiveThreats(){
    const threats = [];
    // 基于当前全局域值生成动态威胁
    const liveDomains = this.getLiveDomains();
    if(liveDomains){
      Object.entries(liveDomains).forEach(([key, value]) => {
        if(key === '_source') return;
        if(value <= 45){
          const names = { military:'军事安全承压', economic:'经济安全风险', cyber:'网络空间威胁', diplomatic:'外交孤立风险', space:'太空资产风险', information:'信息域渗透' };
          threats.push({
            id: 'threat_dyn_' + key,
            name: names[key] || key + '安全威胁',
            level: value < 30 ? '严重' : value <= 45 ? '较高' : '中等',
            levelColor: value < 30 ? 'var(--red)' : value <= 45 ? 'var(--amber)' : 'var(--cyan)',
            domain: key,
            value,
            source: '态势评估',
          });
        }
      });
    }
    // 合并静态威胁中的其他项
    if(typeof THREATS !== 'undefined'){
      THREATS.forEach(t => {
        if(!threats.find(dt => dt.name === t.name)){
          threats.push({ ...t, levelColor: t.level === 4 ? 'var(--red)' : t.level === 3 ? 'var(--amber)' : t.level === 2 ? 'var(--cyan)' : 'var(--green)' });
        }
      });
    }
    return threats;
  },

  /**
   * 获取实时情报预警
   */
  getLiveIntel(){
    const intel = [];
    // 从功能区状态提取
    if(typeof ZoneSystem !== 'undefined' && ZoneSystem._state){
      const intelState = ZoneSystem._state.intel;
      if(intelState && intelState.readiness !== undefined){
        intel.push({
          id: 'intel_live_1',
          title: '情报中心战备状态',
          severity: intelState.readiness >= 80 ? '正常' : intelState.readiness >= 60 ? '注意' : '警告',
          severityColor: intelState.readiness >= 80 ? 'var(--green)' : intelState.readiness >= 60 ? 'var(--amber)' : 'var(--red)',
          detail: '当前情报战备度 ' + intelState.readiness + '%',
          time: new Date().toLocaleTimeString(),
        });
      }
    }
    // 从活跃推演提取
    if(typeof Wargame !== 'undefined' && Wargame.state){
      intel.push({
        id: 'intel_live_2',
        title: '推演进行中',
        severity: '注意',
        severityColor: 'var(--cyan)',
        detail: '场景: ' + (Wargame.state.scenario?.name || '未知') + ' · 第' + Wargame.state.round + '轮',
        time: new Date().toLocaleTimeString(),
      });
    }
    // 从最近推演结果提取
    if(typeof STATE !== 'undefined' && STATE._lastWargameResult){
      const lr = STATE._lastWargameResult;
      const ago = Math.round((Date.now() - (lr.timestamp || 0)) / 60000);
      intel.push({
        id: 'intel_live_3',
        title: '最近推演评估',
        severity: lr.grade === 'S' || lr.grade === 'A' ? '正常' : '注意',
        severityColor: lr.grade === 'S' || lr.grade === 'A' ? 'var(--green)' : 'var(--amber)',
        detail: lr.scenarioName + ' · 评分' + lr.score + '/' + lr.grade,
        time: ago > 0 ? ago + '分钟前' : '刚刚',
      });
    }
    // 补充静态情报
    if(typeof INTEL !== 'undefined' && intel.length < 6){
      INTEL.slice(0, 6 - intel.length).forEach((item, i) => {
        intel.push({
          id: 'intel_static_' + i,
          title: item.title || item.name,
          severity: item.level === 4 ? '严重' : item.level === 3 ? '警告' : item.level === 2 ? '注意' : '正常',
          severityColor: item.level === 4 ? 'var(--red)' : item.level === 3 ? 'var(--amber)' : item.level === 2 ? 'var(--cyan)' : 'var(--green)',
          detail: item.detail || item.desc || '',
          time: item.time || '',
        });
      });
    }
    return intel.slice(0, 6);
  },

  /**
   * 获取实时系统监控数据
   */
  getLiveSystemMonitor(){
    const result = {};
    // 域值平均
    const liveDomains = this.getLiveDomains();
    if(liveDomains){
      const vals = Object.entries(liveDomains).filter(([k]) => k !== '_source').map(([,v]) => v);
      result.domainAvg = vals.length > 0 ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length) : 50;
    }
    // 活跃威胁数
    result.activeThreats = this.getLiveThreats().filter(t => t.level === '严重' || t.value < 30).length;
    // 力量战备平均
    const forces = this.getLiveForces();
    if(forces && forces.length > 0){
      result.forceAvg = Math.round(forces.reduce((s, f) => s + (f.readiness || 70), 0) / forces.length);
    }
    // 推演记录数 — 这个是动态的
    result.gameCount = (typeof STATE !== 'undefined' && STATE.games) ? STATE.games.length : 0;
    return result;
  },

  /* ==================== 案例库动态化 ==================== */

  /**
   * 获取案例的动态状态
   */
  getCaseStatus(caseItem){
    if(!caseItem || typeof STATE === 'undefined' || !STATE.games) return null;

    const relatedGames = STATE.games.filter(g =>
      g.scenario === caseItem.scenario ||
      (caseItem.tags && caseItem.tags.some(tag =>
        g.scenarioName && g.scenarioName.includes(tag.replace(/#/g, ''))
      ))
    );

    if(relatedGames.length > 0){
      const best = relatedGames.reduce((a, b) => (a.score > b.score) ? a : b);
      return {
        experienced: true,
        playCount: relatedGames.length,
        bestScore: best.score,
        bestGrade: best.victory ? '胜利' : '失败',
        lastPlayed: relatedGames[relatedGames.length - 1].date,
      };
    }
    return { experienced: false };
  },

  /* ==================== 工具方法 ==================== */

  /** 强制刷新所有面板 */
  forceRefreshAll(){
    this._dashboardDirty = true;
    this._forcePanelDirty = true;
    this._casePanelDirty = true;
    this._tryRefreshDashboard();
  },

  /** 日志 */
  _log(action, details){
    if(typeof console !== 'undefined'){
      console.log('[SyncHub] ' + action, details || '');
    }
  },

};
