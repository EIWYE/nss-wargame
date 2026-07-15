/* ================================================================
 * 国家安全战略兵棋推演平台 v12.3 — 主应用控制器
 * ================================================================ */

const App = {

  /* ===== 初始化 ===== */
  init(){
    try {
      console.log('[App.init] 开始初始化...');
      console.log('[App.init] 步骤1: initBackground()');
      initBackground();
      console.log('[App.init] 步骤2: renderShell()');
      this.renderShell();
      console.log('[App.init] 步骤3: 确定默认标签页');
      const defaultTab = (typeof RoleSystem !== 'undefined')
        ? (RoleSystem.getDashboard().quickActions[0] || {}).tab || 'overview'
        : 'overview';
      console.log('[App.init] 默认标签页:', defaultTab);
      console.log('[App.init] 步骤4: switchTab()');
      this.switchTab(defaultTab);
      console.log('[App.init] 步骤5: startClock()');
      startClock();
      console.log('[App.init] 步骤6: startDataStream()');
      startDataStream();
      console.log('[App.init] 初始化完成 ✓');
    } catch(e){
      console.error('[App.init] 初始化失败:', e.message, e.stack);
      const app = document.getElementById('app');
      if(app){
        app.innerHTML = '<div style="color:#ff4757;padding:40px;text-align:center;font-family:sans-serif"><h2 style="color:#ff4757">系统初始化失败</h2><p style="color:#ccc">错误步骤: ' + (e.message || '未知') + '</p><pre style="color:#4a6b8a;font-size:11px;text-align:left;max-width:600px;margin:20px auto;background:rgba(8,20,40,.6);padding:12px;border-radius:6px;overflow:auto">' + (e.stack || '') + '</pre><button onclick="location.reload()" style="padding:10px 24px;background:#ff4757;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:14px">刷新页面重试</button></div>';
      }
      throw e; // 继续向上抛出，让外层 try-catch 也能处理
    }
  },

  /* ===== 渲染外壳 ===== */
  renderShell(){
    const app = document.getElementById('app');
    const session = (typeof Auth !== 'undefined') ? Auth.getSession() : null;
    const clearanceInfo = session ? (Auth.CLEARANCES[session.clearance] || {}) : {};
    const userName = session ? session.name : (typeof USER !== 'undefined' ? USER.name : '操作员');
    const userRole = session ? ((Auth.ROLES[session.role] || {}).name || session.role) : '';
    const userOrg = session ? session.org : '';
    const userAvatar = session ? (session.name[0] || 'U') : 'U';
    const clearanceColor = clearanceInfo.color || 'var(--amber)';

    // 密级条
    const classBar = `<div class="class-bar">
      <div class="right">
        <span>国安兵棋推演系统 v12.3</span>
      </div>
    </div>`;

    // 角色切换器
    const roleOpts = Auth.ROLES;
    const currentRoleId = session ? session.role : 'trainee';
    const roleDropdown = Object.entries(roleOpts).map(([id, cfg]) => {
      const sel = id === currentRoleId ? ' selected' : '';
      return `<div class="rs-opt${sel}" data-role="${id}">
        <span class="rs-dot" style="background:${cfg.color}"></span>${cfg.name}
      </div>`;
    }).join('');

    // 顶栏
    const topbar = `<div class="topbar">
      <div class="topbar-left">
        <img src="assets/logo.png" alt="西南政法大学" style="height:46px;width:auto;border-radius:7px;filter:drop-shadow(0 0 6px rgba(0,180,216,.3))">
      </div>
      <div class="logo-text">
        <h1>国家安全战略兵棋推演平台</h1>
        <div class="ver-tag">v12.3 专业版</div>
      </div>
      <div class="topbar-right">
        <div class="sys-status">
          <span class="status-dot"></span>
          <span style="color:var(--green)">系统在线</span>
        </div>
        <span id="clock"></span>
        <div class="role-switcher" id="roleSwitcher">
          <div class="rs-trigger">
            <span class="rs-dot" style="background:${roleOpts[currentRoleId] ? roleOpts[currentRoleId].color : '#7a8aa8'}"></span>
            <span class="rs-label">${esc(userRole)}</span>
            <span class="rs-arrow">▼</span>
          </div>
          <div class="rs-dropdown" id="rsDropdown">${roleDropdown}</div>
        </div>
        <div class="user-block">
          <div class="user-avatar">${esc(userAvatar)}</div>
          <div class="user-info">
            <div class="name">${esc(userName)}</div>
            <div class="role">${esc(userOrg)}</div>
          </div>
          <button class="btn-logout">退出</button>
        </div>
      </div>
    </div>`;

    // 角色感知：生成功能区导航项
    const zp = (typeof RoleSystem !== 'undefined') ? RoleSystem.getProfile() : { roleId:'trainee', roleName:'见习学员', roleColor:'#7a8aa8' };
    const defaultTab = (typeof RoleSystem !== 'undefined') ? RoleSystem.getDashboard().quickActions[0].tab : 'overview';
    const visibleZones = (typeof RoleSystem !== 'undefined') ? RoleSystem.getVisibleZones() : [];
    const zoneCount = visibleZones.length;

    const zoneNavItems = visibleZones.map(z => {
      const cfg = z.cfg;
      if(!cfg) return '';
      const primaryStar = z.isPrimary ? ' <span style="color:' + cfg.color + ';font-size:10px">⭐</span>' : '';
      const lockIcon = z.isRestricted ? ' <span style="color:var(--txt-2);font-size:11px">🔒</span>' : '';
      return `<div class="nav-item" data-tab="zone_${cfg.id}"><span class="icon">${cfg.icon}</span> ${cfg.short}${primaryStar}${lockIcon}</div>`;
    }).join('\n');

    // 侧边栏
    const sidebar = `<div class="sidebar">
      <div class="nav-section">
        <div class="nav-title">${zp.roleName} · 指挥中心</div>
        <div class="nav-item active" data-tab="overview"><span class="icon">📊</span> 态势总览</div>
        <div class="nav-item" data-tab="modules"><span class="icon">🎮</span> 专属推演<span class="badge">${(typeof RoleSystem !== 'undefined' ? RoleSystem.getModules().length : 3)}</span></div>
        <div class="nav-item" data-tab="scenarios"><span class="icon">🎯</span> 推演场景<span class="badge">${SCENARIOS.length}</span></div>
      </div>
      <div class="nav-section">
        <div class="nav-title">战略功能区<span class="nav-sub">按角色优先级</span></div>
        ${zoneNavItems}
      </div>
      <div class="nav-section">
        <div class="nav-title">推演辅助</div>
        <div class="nav-item" data-tab="zone_strategic"><span class="icon">🌐</span> 综合推演<span class="badge" style="background:var(--cyan)">${STRATEGIC_CHAINS.length}</span></div>
        <div class="nav-item" data-tab="forces"><span class="icon">⚔️</span> 力量战备</div>
        <div class="nav-item" data-tab="intel"><span class="icon">🔍</span> 情报中心</div>
        <div class="nav-item" data-tab="cases"><span class="icon">📚</span> 案例库<span class="badge">${(typeof ALL_CASES !== 'undefined' ? ALL_CASES.length : 0)}</span></div>
        <div class="nav-item" data-tab="multiplayer"><span class="icon">🌐</span> 联机对战</div>
      </div>
      <div class="nav-section">
        <div class="nav-title">系统</div>
        <div class="nav-item" data-tab="records"><span class="icon">📋</span> 推演记录</div>
        <div class="nav-item" data-tab="rules"><span class="icon">📖</span> 规则手册</div>
        <div class="nav-item" data-tab="settings"><span class="icon">⚙️</span> 系统设置</div>
      </div>
      <div class="sidebar-footer">
        <div class="sf-row"><span>当前角色</span><span class="v" style="color:${zp.roleColor}">${zp.roleName}</span></div>
        <div class="sf-row"><span>战备等级</span><span class="vw">等级 ${STATE.defcon}</span></div>
        <div class="sf-row"><span>场景库</span><span class="v">${SCENARIOS.length}个</span></div>
        <div class="sf-row"><span>功能区</span><span class="v">${zoneCount}个</span></div>
        <div class="sf-row"><span>密级</span><span class="vw">${esc(typeof USER !== 'undefined' ? USER.clearance : '机密')}</span></div>
      </div>
    </div>`;

    // 角色感知：生成tab-bar功能区标签
    const zoneTabItems = visibleZones.map(z => {
      const cfg = z.cfg;
      if(!cfg) return '';
      const short = cfg.short || '';
      const cls = short.length >= 4 ? 'tab-label wrap2' : 'tab-label';
      return `<div class="tab-item" data-tab="zone_${cfg.id}"><span class="tab-icon">${cfg.icon}</span><span class="${cls}">${short}</span></div>`;
    }).join('\n');

    // 主内容区 (tab 栏 + 内容容器)
    const main = `<div class="main">
      <div class="tab-bar">
        <div class="tab-item active" data-tab="overview"><span class="tab-icon">📊</span><span class="tab-label wrap2">态势总览</span></div>
        <div class="tab-item" data-tab="modules"><span class="tab-icon">🎮</span><span class="tab-label wrap2">专属推演</span></div>
        <div class="tab-item" data-tab="scenarios"><span class="tab-icon">🎯</span><span class="tab-label wrap2">推演场景</span></div>
        ${zoneTabItems}
        <div class="tab-item" data-tab="cases"><span class="tab-icon">📚</span><span class="tab-label">案例库</span><span class="count">${(typeof ALL_CASES !== 'undefined' ? ALL_CASES.length : 0)}</span></div>
        <div class="tab-item" data-tab="multiplayer"><span class="tab-icon">🌐</span><span class="tab-label wrap2">联机对战</span></div>
        <div class="tab-item" data-tab="records"><span class="tab-icon">📋</span><span class="tab-label wrap2">推演记录</span></div>
        <div class="tab-item" data-tab="rules"><span class="tab-icon">📖</span><span class="tab-label wrap2">规则手册</span></div>
      </div>
      <div id="tabContent"></div>
    </div>`;

    // 底部数据流
    const dataStream = `<div class="data-stream">
      <span class="ds-label">▮ 数据流</span>
      <div class="ds-track"><div class="ds-content" id="dsContent"></div></div>
      <span style="color:var(--green)">● 安全</span>
    </div>`;

    app.innerHTML = classBar + topbar +
      `<div class="layout">${sidebar}${main}</div>` + dataStream;

    // 绑定 tab 切换
    app.querySelectorAll('[data-tab]').forEach(el => {
      el.addEventListener('click', () => this.switchTab(el.getAttribute('data-tab')));
    });

    // 绑定角色切换器
    const rsTrigger = document.getElementById('roleSwitcher');
    const rsDropdown = document.getElementById('rsDropdown');
    if(rsTrigger && rsDropdown){
      rsTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        rsDropdown.classList.toggle('open');
      });
      rsDropdown.querySelectorAll('.rs-opt').forEach(opt => {
        opt.addEventListener('click', (e) => {
          e.stopPropagation();
          const newRole = opt.getAttribute('data-role');
          if(Auth.switchRole(newRole)){
            rsDropdown.classList.remove('open');
            this.renderShell(); // 重渲整个界面
            this.switchTab('overview'); // 切回角色仪表盘
          }
        });
      });
      document.addEventListener('click', () => rsDropdown.classList.remove('open'));
    }
  },

  /* ===== 通用信息弹窗 ===== */
  showInfoModal(title, subtitle, bodyHTML){
    const existing = document.getElementById('modalOverlay');
    if(existing) existing.remove();
    const overlay = document.createElement('div');
    overlay.id = 'modalOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.8);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;animation:fadeIn .2s ease';
    overlay.innerHTML = `
      <div style="background:var(--bg-panel-2);border:1px solid var(--border-mid);border-radius:10px;width:560px;max-width:90vw;max-height:85vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.6)">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid var(--border)">
          <div>
            <div style="font-size:16px;font-weight:700">${title}</div>
            ${subtitle ? `<div style="font-size:12px;color:var(--txt-2);font-family:Consolas,monospace">${subtitle}</div>` : ''}
          </div>
          <button id="closeInfoModal" style="background:none;border:1px solid var(--border-mid);color:var(--txt-1);width:30px;height:30px;border-radius:5px;cursor:pointer;font-size:16px">×</button>
        </div>
        <div style="padding:20px">${bodyHTML}</div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => {
      if(e.target === overlay || e.target.id === 'closeInfoModal') overlay.remove();
    });
  },

  /* ===== 域→功能区映射 ===== */
  _domainToZone(domainId){
    const map = {
      military:'zone_command', economic:'zone_economy', cyber:'zone_tech',
      diplomatic:'zone_global', space:'zone_tech', information:'zone_global',
      intel:'zone_intel'
    };
    return map[domainId] || 'zone_global';
  },

  /* ===== 态势总览交互初始化 ===== */
  initOverviewInteractions(){
    const tc = document.getElementById('tabContent');
    if(!tc) return;

    // 威胁信息流条目 → 点击弹窗
    tc.querySelectorAll('.sa-feed-item').forEach(el => {
      el.style.cursor = 'pointer';
      el.addEventListener('click', () => {
        const text = el.querySelector('.sa-fi-text')?.textContent || '';
        const tag = el.querySelector('.sa-fi-tag')?.textContent || '';
        const time = el.querySelector('.sa-fi-time')?.textContent || '';
        const tagColor = el.querySelector('.sa-fi-tag')?.style.color || 'var(--cyan)';
        this.showInfoModal('威胁信息详情', time + ' · ' + tag, `
          <div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:14px">
            <span style="font-size:12px;padding:3px 10px;border-radius:3px;background:${tagColor}22;color:${tagColor};border:1px solid ${tagColor}44">${tag}</span>
            <span style="font-size:12px;padding:3px 10px;border-radius:3px;background:rgba(0,180,216,.12);color:var(--cyan);border:1px solid var(--border-mid)">⏱ ${time}</span>
          </div>
          <div style="font-size:13px;color:var(--txt-0);line-height:1.8;margin-bottom:16px">${esc(text)}</div>
          <div style="padding:12px;background:rgba(8,20,40,.5);border-radius:5px;border:1px solid var(--border);font-size:12px;color:var(--txt-1);line-height:1.7">
            <div style="font-weight:700;color:var(--amber);margin-bottom:6px">📋 建议处置</div>
            <div>• 立即通报相关战区与情报中心，启动联合研判</div>
            <div>• 提升对应方向战备等级，前出侦察力量确认态势</div>
            <div>• 同步上报指挥中心，拟定反制方案与预案</div>
          </div>
          <div style="display:flex;gap:16px;justify-content:flex-end;margin-top:16px">
            <button class="btn btn-sm" onclick="App.switchTab('intel')">🔍 前往情报中心</button>
            <button class="btn btn-sm btn-amber" onclick="App.switchTab('zone_command')">⚔️ 前往指挥中心</button>
          </div>`);
      });
    });

    // 情报预警条目 → 点击弹窗 + 跳转
    tc.querySelectorAll('.sa-intel-item').forEach(el => {
      el.style.cursor = 'pointer';
      el.addEventListener('click', () => {
        const title = el.querySelector('.sa-ii-title')?.textContent || '';
        const meta = el.querySelector('.sa-ii-meta')?.textContent || '';
        const grade = el.querySelector('.sa-ii-icon')?.textContent || '';
        this.showInfoModal('情报预警详情', grade + '级可靠度', `
          <div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:14px">
            <span style="font-size:12px;padding:3px 10px;border-radius:3px;background:rgba(0,180,216,.12);color:var(--cyan);border:1px solid var(--border-mid)">${esc(meta)}</span>
          </div>
          <div style="font-size:13px;color:var(--txt-0);line-height:1.8;margin-bottom:16px">${esc(title)}</div>
          <div style="padding:12px;background:rgba(8,20,40,.5);border-radius:5px;border:1px solid var(--border);font-size:12px;color:var(--txt-1);line-height:1.7">
            <div style="font-weight:700;color:var(--cyan);margin-bottom:6px">📡 情报分析</div>
            <div>• 可靠度评级: ${esc(grade)}级 ${grade==='A'?'(高可信)':grade==='B'?'(中等可信)':'(待验证)'}</div>
            <div>• 建议交叉验证: 结合多源情报进行比对确认</div>
            <div>• 影响评估: 需评估对国家安全战略的影响程度</div>
          </div>
          <div style="display:flex;gap:16px;justify-content:flex-end;margin-top:16px">
            <button class="btn btn-sm" onclick="App.switchTab('intel')">🔍 前往情报中心</button>
          </div>`);
      });
    });

    // 六域安全态势卡片 → 点击跳转功能区
    tc.querySelectorAll('.domain-card').forEach(el => {
      el.style.cursor = 'pointer';
      const domainName = el.querySelector('.dc-name')?.textContent || '';
      el.addEventListener('click', () => {
        const d = DOMAINS.find(d => domainName.includes(d.name));
        if(d) this.switchTab(this._domainToZone(d.id));
      });
    });

    // 六域威胁指标行 → 点击跳转
    tc.querySelectorAll('.sa-ds-row').forEach(el => {
      el.style.cursor = 'pointer';
      el.addEventListener('click', () => {
        const name = el.querySelector('.sa-ds-name')?.textContent || '';
        const d = DOMAINS.find(d => name.includes(d.name));
        if(d) this.switchTab(this._domainToZone(d.id));
      });
    });

    // 活跃威胁条目 → 点击弹窗
    tc.querySelectorAll('.threat-item').forEach(el => {
      el.style.cursor = 'pointer';
      el.addEventListener('click', () => {
        const title = el.querySelector('.ti-title')?.textContent || '';
        const desc = el.querySelector('.ti-desc')?.textContent || '';
        const meta = el.querySelector('.ti-meta')?.textContent || '';
        const sev = el.querySelector('.ti-sev')?.textContent || '';
        this.showInfoModal('威胁详情', sev, `
          <div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:14px">
            <span style="font-size:12px;padding:3px 10px;border-radius:3px;background:rgba(255,71,87,.1);color:var(--red);border:1px solid rgba(255,71,87,.25)">${sev}</span>
            <span style="font-size:12px;padding:3px 10px;border-radius:3px;background:rgba(0,180,216,.12);color:var(--cyan);border:1px solid var(--border-mid)">${esc(meta)}</span>
          </div>
          <div style="font-size:15px;font-weight:700;color:var(--txt-0);margin-bottom:16px">${esc(title)}</div>
          <div style="font-size:13px;color:var(--txt-1);line-height:1.8;margin-bottom:16px">${esc(desc)}</div>
          <div style="padding:12px;background:rgba(255,71,87,.06);border-radius:5px;border:1px solid rgba(255,71,87,.15);font-size:12px;color:var(--txt-1);line-height:1.7">
            <div style="font-weight:700;color:var(--red);margin-bottom:6px">⚠️ 应对建议</div>
            <div>• 启动相应级别应急响应机制</div>
            <div>• 协调相关域力量进行反制</div>
            <div>• 持续跟踪态势发展，及时调整策略</div>
          </div>
          <div style="display:flex;gap:16px;justify-content:flex-end;margin-top:16px">
            <button class="btn btn-sm" onclick="App.switchTab('scenarios')">🎯 选择推演场景</button>
            <button class="btn btn-sm btn-amber" onclick="App.switchTab('zone_command')">⚔️ 前往指挥中心</button>
          </div>`);
      });
    });

    // 指挥时间线 → 点击展开/收起
    tc.querySelectorAll('.tl-item').forEach(el => {
      el.style.cursor = 'pointer';
      const desc = el.querySelector('.tl-desc');
      if(desc){
        desc.style.maxHeight = '0';
        desc.style.overflow = 'hidden';
        desc.style.transition = 'max-height .3s ease,opacity .3s';
        desc.style.opacity = '0';
        el.addEventListener('click', () => {
          const expanded = desc.style.maxHeight !== '0px';
          desc.style.maxHeight = expanded ? '0' : '200px';
          desc.style.opacity = expanded ? '0' : '1';
        });
      }
    });

    // 统计卡片 → 点击跳转
    tc.querySelectorAll('.stat-card').forEach((el, i) => {
      el.style.cursor = 'pointer';
      const targets = ['scenarios','records','scenarios','intel'];
      el.addEventListener('click', () => this.switchTab(targets[i] || 'overview'));
    });

    // 雷达图区域 → 点击跳转力量战备
    const radar = tc.querySelector('.sa-force-radar');
    if(radar){
      radar.style.cursor = 'pointer';
      radar.addEventListener('click', () => this.switchTab('forces'));
    }
  },

  /* ===== 力量战备卡片点击 ===== */
  initForcesClicks(){
    const tc = document.getElementById('tabContent');
    if(!tc) return;
    tc.querySelectorAll('.force-card').forEach(el => {
      el.style.cursor = 'pointer';
      el.addEventListener('click', () => {
        const name = el.querySelector('.fc-name, .fc-head, h3')?.textContent || '';
        const readiness = el.querySelector('.fc-readiness, .readiness')?.textContent || '';
        const bodyHTML = el.querySelector('.fc-body, .panel-body')?.innerHTML || el.innerHTML;
        this.showInfoModal('力量详情', name, `
          <div style="margin-bottom:16px">${bodyHTML}</div>
          <div style="display:flex;gap:16px;justify-content:flex-end">
            <button class="btn btn-sm" onclick="App.switchTab('zone_command')">⚔️ 前往指挥中心</button>
            <button class="btn btn-sm btn-amber" onclick="App.switchTab('scenarios')">🎯 选择推演场景</button>
          </div>`);
      });
    });
  },

  /* ===== 情报条目点击 ===== */
  initIntelClicks(){
    const tc = document.getElementById('tabContent');
    if(!tc) return;
    tc.querySelectorAll('.intel-item').forEach(el => {
      el.style.cursor = 'pointer';
      el.addEventListener('click', () => {
        const title = el.querySelector('.ii-title, .intel-title, h4')?.textContent || '情报详情';
        const body = el.querySelector('.ii-body, .intel-body')?.innerHTML || el.innerHTML;
        this.showInfoModal('情报详情', title, `
          <div style="font-size:13px;color:var(--txt-0);line-height:1.8;margin-bottom:16px">${body}</div>
          <div style="padding:12px;background:rgba(8,20,40,.5);border-radius:5px;border:1px solid var(--border);font-size:12px;color:var(--txt-1);line-height:1.7">
            <div style="font-weight:700;color:var(--cyan);margin-bottom:6px">🔍 分析建议</div>
            <div>• 结合多源情报交叉验证此条信息的可靠性</div>
            <div>• 评估该情报对当前推演态势的影响</div>
            <div>• 如需深入推演，可在推演场景中模拟此情报</div>
          </div>
          <div style="display:flex;gap:16px;justify-content:flex-end;margin-top:16px">
            <button class="btn btn-sm" onclick="App.switchTab('scenarios')">🎯 选择推演场景</button>
          </div>`);
      });
    });
  },

  /* ===== 推演记录点击 ===== */
  initRecordsInteractions(){
    const tc = document.getElementById('tabContent');
    if(!tc) return;
    tc.querySelectorAll('.record-item').forEach(el => {
      el.style.cursor = 'pointer';
      el.addEventListener('click', () => {
        const title = el.querySelector('.ri-scene, .record-title, h4')?.textContent || '推演记录';
        const body = el.innerHTML;
        this.showInfoModal('推演记录详情', title, `
          <div style="margin-bottom:16px">${body}</div>
          <div style="display:flex;gap:16px;justify-content:flex-end">
            <button class="btn btn-sm" onclick="App.switchTab('scenarios')">🎯 再来一局</button>
            <button class="btn btn-sm btn-amber" onclick="App.switchTab('zone_aar')">📋 前往复盘</button>
          </div>`);
      });
    });
  },

  /* ===== Tab 切换 ===== */
  switchTab(tab){
    STATE.currentTab = tab;

    // 更新导航高亮
    document.querySelectorAll('[data-tab]').forEach(el => {
      el.classList.toggle('active', el.getAttribute('data-tab') === tab);
    });

    // 渲染对应内容
    const content = document.getElementById('tabContent');
    switch(tab){
      case 'overview':  content.innerHTML = this.renderRoleDashboard ? this.renderRoleDashboard() : this.renderOverview();  break;
      case 'modules':   content.innerHTML = this.renderRoleModules();  break;
      case 'scenarios': content.innerHTML = this.renderScenarios(); break;
      case 'forces':    content.innerHTML = this.renderForces();    break;
      case 'intel':     content.innerHTML = this.renderIntel();     break;
      case 'zone_global':    content.innerHTML = (typeof renderZone === 'function') ? renderZone('global')    : ''; break;
      case 'zone_intel':     content.innerHTML = (typeof renderZone === 'function') ? renderZone('intel')     : ''; break;
      case 'zone_command':   content.innerHTML = (typeof renderZone === 'function') ? renderZone('command')   : ''; break;
      case 'zone_training':  content.innerHTML = (typeof renderZone === 'function') ? renderZone('training')  : ''; break;
      case 'zone_logistics': content.innerHTML = (typeof renderZone === 'function') ? renderZone('logistics') : ''; break;
      case 'zone_economy':   content.innerHTML = (typeof renderZone === 'function') ? renderZone('economy')   : ''; break;
      case 'zone_tech':      content.innerHTML = (typeof renderZone === 'function') ? renderZone('tech')      : ''; break;
      case 'zone_aar':       content.innerHTML = (typeof renderZone === 'function') ? renderZone('aar')       : ''; break;
      case 'zone_strategic': content.innerHTML = (typeof renderStrategicOps === 'function') ? renderStrategicOps() : ''; break;
      // 兼容旧标签
      case 'diplomatic':content.innerHTML = (typeof renderZone === 'function') ? renderZone('command')   : ''; break;
      case 'economic':  content.innerHTML = (typeof renderZone === 'function') ? renderZone('economy')   : ''; break;
      case 'tech_old':  content.innerHTML = (typeof renderZone === 'function') ? renderZone('tech')       : ''; break;
      case 'logistics_old': content.innerHTML = (typeof renderZone === 'function') ? renderZone('logistics'): ''; break;
      case 'cases':     content.innerHTML = this.renderCases();   break;
      case 'multiplayer': content.innerHTML = this.renderMultiplayer(); break;
      case 'records':   content.innerHTML = this.renderRecords();   break;
      case 'rules':     content.innerHTML = this.renderRules();     break;
      case 'settings':  content.innerHTML = this.renderSettings();  break;
    }

    // Tab 后初始化
    if(tab === 'overview'){
      this.animateStats();
      startMonitor();
      this.initOverviewInteractions();
    }
    if(tab === 'scenarios'){
      this.initScenarioInteractions();
    }
    if(tab === 'forces'){
      this.initForcesInteractions();
      this.initForcesClicks();
    }
    if(tab === 'intel'){
      this.initIntelInteractions();
      this.initIntelClicks();
    }
    if(tab === 'cases'){
      this.initCasesInteractions();
    }
    if(tab === 'records'){
      this.initRecordsInteractions();
    }
    if(['diplomatic','economic','tech','logistics','zone_global','zone_intel','zone_command','zone_training','zone_logistics','zone_economy','zone_tech','zone_aar'].includes(tab)){
      // 功能区使用新的区域系统
      if(typeof ZoneUI !== 'undefined') ZoneUI._activeZone = tab;
    }
    if(tab === 'multiplayer'){
      this.initMultiplayerTab();
    }
    if(tab === 'zone_strategic'){
      if(typeof StrategicOps !== 'undefined') StrategicOps.init();
    }
  },

  /* ===== 场景交互（复选框筛选+搜索+排序+视图切换） ===== */
  initScenarioInteractions(){
    const self = this;
    const grid = document.getElementById('sceneGrid');
    if(!grid) return;

    // 存储原始排序索引
    Array.from(grid.querySelectorAll('.scenario-card')).forEach((card, i) => {
      card.dataset.origIdx = i;
    });

    // 1. 复选框筛选 — 领域/难度/威胁
    document.querySelectorAll('.ss-chk-domain, .ss-chk-diff, .ss-chk-threat').forEach(chk => {
      chk.addEventListener('change', () => self._applyScenarioFilters());
    });

    // 2. 搜索
    const search = document.getElementById('sceneSearch');
    if(search){
      search.addEventListener('input', () => self._applyScenarioFilters());
    }

    // 3. 排序
    const sortSel = document.getElementById('sceneSort');
    if(sortSel){
      sortSel.addEventListener('change', () => self._applyScenarioSort(sortSel.value));
    }

    // 4. 视图切换
    document.querySelectorAll('.vt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.vt-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const view = btn.getAttribute('data-view');
        if(grid){
          if(view === 'list') grid.classList.add('list-view');
          else grid.classList.remove('list-view');
        }
      });
    });

    // 5. 重置筛选
    const resetBtn = document.getElementById('sceneReset');
    if(resetBtn){
      resetBtn.addEventListener('click', () => {
        document.querySelectorAll('.ss-chk-domain, .ss-chk-diff, .ss-chk-threat').forEach(c => { c.checked = true; });
        if(search) search.value = '';
        self._applyScenarioFilters();
      });
    }

    // 6. 场景卡片点击
    document.querySelectorAll('[data-scene]').forEach(card => {
      card.addEventListener('click', () => {
        const sceneId = card.getAttribute('data-scene');
        const scene = SCENARIOS.find(s => s.id === sceneId);
        if(scene) this.showScenarioDetail(scene);
      });
    });
  },

  /* 综合筛选：复选框 + 搜索 */
  _applyScenarioFilters(){
    const grid = document.getElementById('sceneGrid');
    if(!grid) return;

    const checkedDomains = Array.from(document.querySelectorAll('.ss-chk-domain:checked')).map(c => c.value);
    const checkedDiffs = Array.from(document.querySelectorAll('.ss-chk-diff:checked')).map(c => parseInt(c.value));
    const checkedThreats = Array.from(document.querySelectorAll('.ss-chk-threat:checked')).map(c => parseInt(c.value));
    const search = document.getElementById('sceneSearch');
    const query = search ? search.value.toLowerCase().trim() : '';

    let visibleCount = 0;
    grid.querySelectorAll('.scenario-card').forEach(card => {
      const domain = card.dataset.domain;
      const diff = parseInt(card.dataset.difficulty);
      const threat = parseInt(card.dataset.threat);
      const text = card.textContent.toLowerCase();

      const matchDomain = checkedDomains.includes(domain);
      const matchDiff = checkedDiffs.includes(diff);
      const matchThreat = checkedThreats.includes(threat);
      const matchSearch = !query || text.includes(query);

      const visible = matchDomain && matchDiff && matchThreat && matchSearch;
      card.style.display = visible ? '' : 'none';
      if(visible) visibleCount++;
    });

    const countEl = document.getElementById('sceneCount');
    if(countEl) countEl.textContent = visibleCount;

    const noResult = document.getElementById('sceneNoResult');
    if(noResult) noResult.style.display = visibleCount === 0 ? '' : 'none';
  },

  /* 排序：在结果区内部重新排列卡片 */
  _applyScenarioSort(sortBy){
    const grid = document.getElementById('sceneGrid');
    if(!grid) return;
    const cards = Array.from(grid.querySelectorAll('.scenario-card'));
    if(sortBy === 'difficulty'){
      cards.sort((a,b) => parseInt(b.dataset.difficulty) - parseInt(a.dataset.difficulty));
    } else if(sortBy === 'threat'){
      cards.sort((a,b) => parseInt(b.dataset.threat) - parseInt(a.dataset.threat));
    } else if(sortBy === 'name'){
      cards.sort((a,b) => (a.dataset.name || '').localeCompare(b.dataset.name || '', 'zh-CN'));
    } else {
      cards.sort((a,b) => parseInt(a.dataset.origIdx || 0) - parseInt(b.dataset.origIdx || 0));
    }
    cards.forEach(card => grid.appendChild(card));
  },

  /* ===== 场景详情弹窗 ===== */
  showScenarioDetail(s){
    const dm = DOMAIN_MAP[s.domain] || DOMAIN_MAP.military;
    // 移除已有弹窗
    const existing = document.getElementById('modalOverlay');
    if(existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'modalOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.8);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;animation:fadeIn .2s ease';
    overlay.innerHTML = `
      <div style="background:var(--bg-panel-2);border:1px solid var(--border-mid);border-radius:10px;width:600px;max-width:90vw;max-height:85vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.6)">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid var(--border)">
          <div>
            <div style="font-size:16px;font-weight:700">${esc(s.name)}</div>
            <div style="font-size:12px;color:var(--txt-2);font-family:Consolas,monospace">${esc(s.code)}</div>
          </div>
          <button id="closeModal" style="background:none;border:1px solid var(--border-mid);color:var(--txt-1);width:30px;height:30px;border-radius:5px;cursor:pointer;font-size:16px">×</button>
        </div>
        <div style="padding:20px">
          <div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:14px">
            <span style="font-size:12px;padding:3px 8px;border-radius:3px;background:${dm.color}22;color:${dm.color};border:1px solid ${dm.color}44">${dm.icon} ${dm.label}</span>
            <span style="font-size:12px;padding:3px 8px;border-radius:3px;background:rgba(255,165,2,.08);color:var(--amber);border:1px solid rgba(255,165,2,.15)">⏱ ${s.duration}轮</span>
            <span style="font-size:12px;padding:3px 8px;border-radius:3px;background:rgba(255,71,87,.08);color:var(--red);border:1px solid rgba(255,71,87,.15)">威胁 ${s.threatLevel}/5</span>
            <span style="font-size:12px;padding:3px 8px;border-radius:3px;background:rgba(0,180,216,.12);color:var(--cyan);border:1px solid rgba(0,180,216,.20)">${difficultyStars(s.difficulty)}</span>
          </div>
          <div style="font-size:12px;font-weight:700;color:var(--cyan);margin-bottom:6px">背景</div>
          <div style="font-size:12px;color:var(--txt-0);line-height:1.7;margin-bottom:16px">${esc(s.background)}</div>
          <div style="font-size:12px;font-weight:700;color:var(--cyan);margin-bottom:6px">参与方</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px">
            ${s.actors.map(a => `<span style="font-size:12px;padding:3px 8px;border-radius:3px;background:rgba(0,180,216,.08);color:var(--txt-1);border:1px solid var(--border)">${esc(a)}</span>`).join('')}
          </div>
          <div style="font-size:12px;font-weight:700;color:var(--cyan);margin-bottom:6px">响应域</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">
            ${s.response.map(r => {
              const rdm = DOMAIN_MAP[r] || DOMAIN_MAP.military;
              return `<span style="font-size:12px;padding:3px 8px;border-radius:3px;background:${rdm.color}22;color:${rdm.color};border:1px solid ${rdm.color}44">${rdm.icon} ${rdm.label}</span>`;
            }).join('')}
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:16px;padding:12px;background:rgba(8,20,40,.5);border-radius:5px;border:1px solid var(--border)">
            <div style="text-align:center">
              <div style="font-size:11px;color:var(--txt-2);margin-bottom:4px">💰 起始资金</div>
              <div style="font-size:16px;font-weight:700;color:var(--amber);font-family:Consolas,monospace">${s.budget}<span style="font-size:12px;color:var(--txt-2)">亿</span></div>
            </div>
            <div style="text-align:center">
              <div style="font-size:11px;color:var(--txt-2);margin-bottom:4px">🌍 国际声望</div>
              <div style="font-size:16px;font-weight:700;color:var(--green);font-family:Consolas,monospace">${s.reputation}</div>
            </div>
            <div style="text-align:center">
              <div style="font-size:11px;color:var(--txt-2);margin-bottom:4px">🏠 国内支持</div>
              <div style="font-size:16px;font-weight:700;color:var(--purple);font-family:Consolas,monospace">${s.domesticSupport}</div>
            </div>
          </div>
          ${s.specialActions && s.specialActions.length ? `
            <div style="font-size:12px;font-weight:700;color:var(--amber);margin-bottom:6px">⭐ 场景专属行动 (${s.specialActions.length}项)</div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px">
              ${s.specialActions.map(id => {
                const act = typeof STRATEGIC_ACTIONS !== 'undefined' ? STRATEGIC_ACTIONS.find(a => a.id === id) : null;
                const name = act ? act.name : id;
                return `<span style="font-size:12px;padding:3px 8px;border-radius:3px;background:rgba(255,165,2,.06);color:var(--amber);border:1px solid rgba(255,165,2,.15)">${esc(name)}</span>`;
              }).join('')}
            </div>
          ` : ''}
          <div style="display:flex;gap:16px;justify-content:flex-end">
            <button class="btn btn-sm" id="startSim">▶ 开始推演</button>
            <button class="btn btn-sm btn-amber" id="saveScene">📌 收藏场景</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // 关闭
    overlay.querySelector('#closeModal').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if(e.target === overlay) overlay.remove(); });

    // 开始推演 → 显示阵营选择
    overlay.querySelector('#startSim').addEventListener('click', () => {
      overlay.remove();
      this.showSideSelection(s);
    });

    // 收藏
    overlay.querySelector('#saveScene').addEventListener('click', () => {
      overlay.querySelector('#saveScene').textContent = '✓ 已收藏';
      setTimeout(() => overlay.remove(), 600);
    });
  },

  /* ===== 阵营选择弹窗 ===== */
  showSideSelection(s){
    const sides = getScenarioSides(s.id);
    const red = sides.red;
    const blue = sides.blue;

    const existing = document.getElementById('modalOverlay');
    if(existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'modalOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.85);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;animation:fadeIn .2s ease';
    overlay.innerHTML = `
      <div style="background:var(--bg-panel-2);border:1px solid var(--border-mid);border-radius:10px;width:680px;max-width:90vw;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.6)">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid var(--border)">
          <div>
            <div style="font-size:17px;font-weight:700;color:var(--cyan)">选择推演阵营</div>
            <div style="font-size:13px;color:var(--txt-2);margin-top:2px">${esc(s.name)} · ${esc(s.code)}</div>
          </div>
          <button id="closeSideModal" style="background:none;border:1px solid var(--border-mid);color:var(--txt-1);width:30px;height:30px;border-radius:5px;cursor:pointer;font-size:16px">×</button>
        </div>
        <div style="padding:20px">
          <!-- 对弈模式选择 -->
          <div style="font-size:14px;font-weight:700;color:var(--cyan);margin-bottom:16px">📋 对弈模式</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">
            <div class="mode-card mode-active" id="modeSingle" data-mode="single">
              <div style="font-size:28px;margin-bottom:6px">🤖</div>
              <div style="font-size:14px;font-weight:700;color:var(--cyan)">单机模式</div>
              <div style="font-size:12px;color:var(--txt-2);margin-top:4px">AI控制对手方 · AI担任导调方</div>
            </div>
            <div class="mode-card" id="modeMulti" data-mode="multi">
              <div style="font-size:28px;margin-bottom:6px">🌐</div>
              <div style="font-size:14px;font-weight:700;color:var(--amber)">联机对战</div>
              <div style="font-size:12px;color:var(--txt-2);margin-top:4px">跨浏览器实时对弈 · AI担任导调方</div>
            </div>
          </div>

          <!-- 阵营选择 -->
          <div id="sideSelectArea">
            <div style="font-size:14px;font-weight:700;color:var(--cyan);margin-bottom:16px">⚔️ 选择你的阵营</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
              <div class="side-card" id="sideRed" data-side="red" style="border-color:${red.color}44">
                <div class="side-card-glow" style="background:radial-gradient(circle at 50% 0%,${red.color}22,transparent 70%)"></div>
                <div style="display:flex;align-items:center;gap:14px;margin-bottom:8px">
                  <span style="font-size:24px">${red.icon}</span>
                  <div>
                    <div style="font-size:15px;font-weight:700;color:${red.color}">${esc(red.name)}</div>
                    <div style="font-size:11px;color:var(--txt-2)">红方 · 我方</div>
                  </div>
                </div>
                <div style="font-size:12px;color:var(--txt-1);line-height:1.6">${esc(red.desc)}</div>
              </div>
              <div class="side-card" id="sideBlue" data-side="blue" style="border-color:${blue.color}44">
                <div class="side-card-glow" style="background:radial-gradient(circle at 50% 0%,${blue.color}22,transparent 70%)"></div>
                <div style="display:flex;align-items:center;gap:14px;margin-bottom:8px">
                  <span style="font-size:24px">${blue.icon}</span>
                  <div>
                    <div style="font-size:15px;font-weight:700;color:${blue.color}">${esc(blue.name)}</div>
                    <div style="font-size:11px;color:var(--txt-2)">蓝方 · 对手方</div>
                  </div>
                </div>
                <div style="font-size:12px;color:var(--txt-1);line-height:1.6">${esc(blue.desc)}</div>
              </div>
            </div>
          </div>

          <!-- 联机区域（默认隐藏） -->
          <div id="multiArea" style="display:none;margin-bottom:16px">
            <div style="font-size:14px;font-weight:700;color:var(--amber);margin-bottom:16px">🌐 联机对战设置</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:12px">
              <button class="btn btn-sm" id="createRoom" style="padding:10px;font-size:13px">🏠 创建房间</button>
              <button class="btn btn-sm btn-amber" id="joinRoom" style="padding:10px;font-size:13px">🔑 加入房间</button>
            </div>
            <div id="roomInfo" style="display:none;padding:12px;background:rgba(8,20,40,.5);border-radius:6px;border:1px solid var(--border)">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
                <span style="font-size:12px;color:var(--txt-2)">房间号</span>
                <span id="roomCode" style="font-size:18px;font-weight:700;color:var(--cyan);font-family:Consolas,monospace;letter-spacing:2px">------</span>
              </div>
              <div style="display:flex;align-items:center;justify-content:space-between">
                <span style="font-size:12px;color:var(--txt-2)">状态</span>
                <span id="roomStatus" style="font-size:12px;color:var(--amber)">等待对手加入...</span>
              </div>
              <div id="joinInputArea" style="display:none;margin-top:10px">
                <input type="text" id="joinCodeInput" placeholder="输入房间号" maxlength="6"
                  style="width:100%;padding:8px 10px;background:rgba(8,20,40,.6);border:1px solid var(--border-mid);border-radius:5px;color:var(--txt-1);font-size:15px;font-family:Consolas,monospace;letter-spacing:2px;text-align:center">
              </div>
            </div>
          </div>

          <!-- AI导调方说明 -->
          <div style="padding:12px;background:rgba(0,180,216,.08);border-radius:6px;border:1px solid rgba(0,180,216,.20);margin-bottom:16px;display:flex;align-items:center;gap:16px">
            <span style="font-size:20px">🎯</span>
            <div>
              <div style="font-size:13px;font-weight:700;color:var(--cyan)">人工智能导调方</div>
              <div style="font-size:12px;color:var(--txt-2);margin-top:2px">人工智能负责态势推送、情报预警、事件触发、骰子裁决和复盘评估。双方玩家各自决策，人工智能导调方确保推演公平进行。</div>
            </div>
          </div>

          <div style="display:flex;gap:16px;justify-content:flex-end">
            <button class="btn btn-sm" id="backToDetail" style="border-color:var(--txt-2);color:var(--txt-2)">← 返回</button>
            <button class="btn btn-sm" id="confirmSide" disabled style="opacity:.5">▶ 开始推演</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    let selectedMode = 'single';
    let selectedSide = null;

    // 关闭/返回
    overlay.querySelector('#closeSideModal').addEventListener('click', () => overlay.remove());
    overlay.querySelector('#backToDetail').addEventListener('click', () => {
      overlay.remove();
      this.showScenarioDetail(s);
    });

    // 模式切换
    overlay.querySelectorAll('.mode-card').forEach(card => {
      card.addEventListener('click', () => {
        overlay.querySelectorAll('.mode-card').forEach(c => c.classList.remove('mode-active'));
        card.classList.add('mode-active');
        selectedMode = card.getAttribute('data-mode');
        const multiArea = overlay.querySelector('#multiArea');
        const sideArea = overlay.querySelector('#sideSelectArea');
        if(selectedMode === 'multi'){
          multiArea.style.display = '';
          sideArea.style.opacity = '0.5';
          sideArea.style.pointerEvents = 'none';
          this.initMultiplayerUI(overlay, s, () => {
            sideArea.style.opacity = '1';
            sideArea.style.pointerEvents = '';
            this.checkSideConfirm(overlay, selectedMode, selectedSide);
          });
        } else {
          multiArea.style.display = 'none';
          sideArea.style.opacity = '1';
          sideArea.style.pointerEvents = '';
          this.checkSideConfirm(overlay, selectedMode, selectedSide);
        }
      });
    });

    // 阵营选择
    overlay.querySelectorAll('.side-card').forEach(card => {
      card.addEventListener('click', () => {
        overlay.querySelectorAll('.side-card').forEach(c => c.classList.remove('side-selected'));
        card.classList.add('side-selected');
        selectedSide = card.getAttribute('data-side');
        this.checkSideConfirm(overlay, selectedMode, selectedSide);
      });
    });

    // 确认开始
    overlay.querySelector('#confirmSide').addEventListener('click', () => {
      if(!selectedSide) return;
      overlay.remove();
      const playerSide = selectedSide === 'red' ? red : blue;
      const opponentSide = selectedSide === 'red' ? blue : red;
      const mode = selectedMode;

      if(mode === 'multi' && typeof Multiplayer !== 'undefined' && Multiplayer.connected){
        Multiplayer.notifyStart(s, playerSide, opponentSide);
      }

      // 进入导调阶段，传入阵营信息（含颜色标识）
      Director.start(s, { playerSide, opponentSide, mode, sideColor: selectedSide });
    });
  },

  /* 检查是否可以开始 */
  checkSideConfirm(overlay, mode, side){
    const btn = overlay.querySelector('#confirmSide');
    if(mode === 'multi'){
      const roomStatus = overlay.querySelector('#roomStatus');
      const connected = roomStatus && roomStatus.textContent.includes('已连接');
      btn.disabled = !side || !connected;
      btn.style.opacity = (!side || !connected) ? '0.5' : '1';
    } else {
      btn.disabled = !side;
      btn.style.opacity = side ? '1' : '0.5';
    }
  },

  /* 初始化联机UI */
  initMultiplayerUI(overlay, scenario, onConnected){
    if(typeof Multiplayer === 'undefined'){
      overlay.querySelector('#roomStatus').textContent = '联机模块未加载';
      overlay.querySelector('#roomStatus').style.color = 'var(--red)';
      return;
    }

    overlay.querySelector('#createRoom').addEventListener('click', () => {
      const code = Multiplayer.createRoom(scenario);
      overlay.querySelector('#roomInfo').style.display = '';
      overlay.querySelector('#roomCode').textContent = code;
      overlay.querySelector('#roomStatus').textContent = '等待对手加入...';
      overlay.querySelector('#roomStatus').style.color = 'var(--amber)';
      overlay.querySelector('#joinInputArea').style.display = 'none';

      Multiplayer.onOpponentJoined = () => {
        overlay.querySelector('#roomStatus').textContent = '✓ 对手已连接';
        overlay.querySelector('#roomStatus').style.color = 'var(--green)';
        if(onConnected) onConnected();
      };
    });

    overlay.querySelector('#joinRoom').addEventListener('click', () => {
      overlay.querySelector('#roomInfo').style.display = '';
      overlay.querySelector('#roomCode').textContent = '------';
      overlay.querySelector('#roomStatus').textContent = '请输入房间号';
      overlay.querySelector('#roomStatus').style.color = 'var(--cyan)';
      overlay.querySelector('#joinInputArea').style.display = '';

      const input = overlay.querySelector('#joinCodeInput');
      input.focus();
      input.onkeydown = (e) => {
        if(e.key === 'Enter' && input.value.length === 6){
          const ok = Multiplayer.joinRoom(input.value.toUpperCase(), scenario);
          if(ok){
            overlay.querySelector('#roomCode').textContent = input.value.toUpperCase();
            overlay.querySelector('#roomStatus').textContent = '✓ 已连接到房间';
            overlay.querySelector('#roomStatus').style.color = 'var(--green)';
            overlay.querySelector('#joinInputArea').style.display = 'none';
            if(onConnected) onConnected();
          } else {
            overlay.querySelector('#roomStatus').textContent = '✗ 房间不存在或已满';
            overlay.querySelector('#roomStatus').style.color = 'var(--red)';
          }
        }
      };
    });
  },

  /* ===== 角色专属仪表盘 ===== */
  renderRoleDashboard(){
    const db = (typeof RoleSystem !== 'undefined') ? RoleSystem.getDashboard() : ROLE_DASHBOARD.trainee;
    const zp = (typeof RoleSystem !== 'undefined') ? RoleSystem.getProfile() : {};
    const roleColor = zp.roleColor || '#7a8aa8';

    const kpiCards = db.kpis.map(k => {
      const pct = k.max ? ((k.value / k.max) * 100).toFixed(0) : 0;
      return `<div class="rk-card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px">
          <span style="font-size:28px">${k.icon}</span>
          <span style="font-size:11px;color:var(--txt-2);font-family:Consolas,monospace">${k.unit ? k.value + k.unit : k.value + '/' + k.max}</span>
        </div>
        <div style="font-size:28px;font-weight:800;color:${k.color};margin-bottom:4px">${k.name === '核心专利数' || k.name === '关键节点数' || k.name === '有效协议数' || k.name === '活跃情报源' ? k.value.toLocaleString() : k.value}${k.unit && k.max ? '' : ''}</div>
        <div style="font-size:12px;color:var(--txt-1)">${k.name}</div>
        <div style="height:3px;background:rgba(0,180,216,.10);border-radius:2px;margin-top:8px;overflow:hidden">
          <div style="height:100%;width:${pct}%;background:${k.color};border-radius:2px;transition:width .8s"></div>
        </div>
      </div>`;
    }).join('');

    const quickBtns = db.quickActions.map(a => `
      <button class="rq-btn" onclick="App.switchTab('${a.tab}')" style="border-color:${a.color};color:${a.color}">
        <span style="font-size:18px">${a.icon}</span> ${a.label}
      </button>
    `).join('');

    return `<div class="role-dashboard">
      <div class="rd-header">
        <div class="rd-title-area">
          <div class="rd-badge" style="background:${roleColor}22;border-color:${roleColor}44;color:${roleColor}">${zp.roleName}</div>
          <h2 class="rd-title">${db.title}</h2>
          <div class="rd-sub">${db.subtitle}</div>
        </div>
        <div class="rd-quick-actions">
          ${quickBtns}
        </div>
      </div>
      <div class="rk-grid">
        ${kpiCards}
      </div>
      <div class="render-old-overview">
        ${this.renderOverview()}
      </div>
    </div>`;
  },

  /* ===== 角色专属推演模块 v13 — 训练课程体系 ===== */
  renderRoleModules(){
    const modules = (typeof RoleSystem !== 'undefined') ? RoleSystem.getModules() : [];
    const zp = (typeof RoleSystem !== 'undefined') ? RoleSystem.getProfile() : {};
    const roleColor = zp.roleColor || '#7a8aa8';
    const stars = n => '⭐'.repeat(n);
    const enrichMod = (m) => {
      const t = (typeof MODULE_TRAINING !== 'undefined') ? MODULE_TRAINING[m.id] : null;
      return t ? {...m, training:t} : m;
    };

    const moduleCards = modules.map((m,i) => {
      const em = enrichMod(m);
      const t = em.training;
      const hasTraining = !!t;
      // 训练单元数量
      const unitCount = t ? (t.units||[]).length : 0;

      return `
      <div class="rm-course-card" id="rmc-${em.id}" style="animation:rmSlideIn .35s ${i*.1}s both">
        <!-- 课程头部 -->
        <div class="rmc-head" onclick="App.toggleModuleDetail('rmc-${em.id}')">
          <div class="rmc-head-left">
            <div class="rmc-icon" style="background:${roleColor}18">${em.icon}</div>
            <div>
              <div class="rmc-title">${em.name}</div>
              <div class="rmc-meta">
                <span class="rmc-diff">${stars(em.difficulty)} Lv.${em.difficulty}</span>
                ${hasTraining ? `<span class="rmc-time">⏱️ ${t.estimatedTime||'30-60分钟'}</span>` : ''}
                ${hasTraining ? `<span class="rmc-units">📚 ${unitCount}个训练单元</span>` : ''}
              </div>
            </div>
          </div>
          <div class="rmc-expand-btn">
            <span class="rmc-expand-label">${hasTraining ? '进入课程' : '查看详情'}</span>
            <span class="rmc-expand-arrow">▼</span>
          </div>
        </div>

        <!-- 课程摘要 -->
        <div class="rmc-summary">
          <p class="rmc-desc">${em.desc}</p>
          ${hasTraining ? `
          <div class="rmc-tags">
            ${t.prerequisites ? t.prerequisites.slice(0,2).map(p => `<span class="rmc-tag pre">📋 ${p}</span>`).join('') : ''}
            <span class="rmc-tag type">🎯 ${em.features.slice(0,2).join(' · ')}</span>
          </div>` : ''}
        </div>

        <!-- 训练课程展开区 -->
        ${hasTraining ? `
        <div class="rmc-training" style="max-height:0;opacity:0">
          <div class="rmc-training-body">
            <!-- 课程介绍 -->
            <div class="rmkt-intro">
              <div class="rmkt-section-title">📖 课程介绍</div>
              <p>${t.trainingIntro}</p>
            </div>

            <!-- 训练单元导航 -->
            <div class="rmkt-section-title">📚 训练单元（${unitCount}个）</div>
            <div class="rmkt-units">
              ${t.units.map((u,j) => `
              <div class="rmkt-unit" id="rmkt-u-${em.id}-${j}">
                <div class="rmkt-unit-head" onclick="App.toggleTrainingUnit('rmkt-u-${em.id}-${j}')">
                  <div class="rmkt-unit-num">${j+1}</div>
                  <div class="rmkt-unit-info">
                    <div class="rmkt-unit-title">${u.title}</div>
                    <div class="rmkt-unit-obj">🎯 ${u.objective}</div>
                  </div>
                  <span class="rmkt-unit-arrow">▶</span>
                </div>
                <div class="rmkt-unit-body" style="display:none">
                  ${u.sections.map(sec => {
                    if(sec.type==='lecture'){
                      return `<div class="rmkt-sec sec-lecture"><div class="rmkt-sec-label">📝 知识讲解</div><div class="rmkt-sec-content">${sec.content}</div></div>`;
                    }else if(sec.type==='case'){
                      return `<div class="rmkt-sec sec-case"><div class="rmkt-sec-label">🔍 案例分析：${sec.content.background}</div><div class="rmkt-sec-content">${sec.content.analysis}${sec.content.lessons ? '<div class="rmkt-lessons"><strong>经验教训：</strong><ul>'+sec.content.lessons.map(l=>'<li>'+l+'</li>').join('')+'</ul></div>' : ''}</div></div>`;
                    }else if(sec.type==='practice'){
                      const c = sec.content;
                      return `<div class="rmkt-sec sec-practice"><div class="rmkt-sec-label">✏️ 实战练习：${c.scenario||c.task||''}</div><div class="rmkt-sec-content"><p><strong>任务：</strong>${c.task||''}</p>${c.expectedAnalysis ? '<div class="rmkt-expected"><strong>参考答案：</strong>'+c.expectedAnalysis+'</div>' : ''}${c.commonMistakes ? '<div class="rmkt-mistakes"><strong>⚠️ 常见错误：</strong><ul>'+c.commonMistakes.map(e=>'<li>'+e+'</li>').join('')+'</ul></div>' : ''}</div></div>`;
                    }else if(sec.type==='quiz'){
                      return `<div class="rmkt-sec sec-quiz"><div class="rmkt-sec-label">✅ 自我检测</div><div class="rmkt-quiz-list">${sec.content.map((q,k)=>`<div class="rmkt-quiz-item"><div class="rmkt-quiz-q">${k+1}. ${q.q}</div><div class="rmkt-quiz-opts">${q.options.map((o,oi)=>`<span class="rmkt-quiz-opt" onclick="App.checkQuizAnswer(this,${oi},${q.correct},'${q.explanation.replace(/'/g,"\\'")}')">${'ABCD'[oi]}. ${o}</span>`).join('')}</span></div><div class="rmkt-quiz-fb" style="display:none"></div></div>`).join('')}</div></div>`;
                    }else if(sec.type==='summary'){
                      return `<div class="rmkt-sec sec-summary"><div class="rmkt-sec-label">📌 单元小结</div><div class="rmkt-sec-content">${sec.content}</div></div>`;
                    }
                    return '';
                  }).join('')}
                </div>
              </div>`).join('')}
            </div>

            <!-- 综合考核 -->
            ${t.capstone ? `
            <div class="rmkt-section-title">🏆 综合考核</div>
            <div class="rmkt-capstone">
              <div class="rmkt-cap-title">${t.capstone.title}</div>
              <p>${t.capstone.desc}</p>
              ${t.capstone.criteria ? '<div class="rmkt-cap-criteria"><strong>评分标准：</strong>'+t.capstone.criteria.map(c=>'<span class="rmkt-cap-tag">✓ '+c+'</span>').join('')+'</div>' : ''}
              ${t.capstone.selfCheck ? '<div class="rmkt-cap-scheck"><strong>自我检查：</strong>'+t.capstone.selfCheck.map(sc=>'<div class="rmkt-cap-sci">❓ '+sc+'</div>').join('')+'</div>' : ''}
            </div>` : ''}

            <!-- 速查卡 -->
            ${t.quickRef ? `
            <div class="rmkt-section-title">🗂️ 速查卡：${t.quickRef.title}</div>
            <div class="rmkt-ref-grid">
              ${t.quickRef.items.map(item => `
              <div class="rmkt-ref-card">
                <div class="rmkt-ref-term">${item.term}</div>
                <div class="rmkt-ref-def">${item.def}</div>
              </div>`).join('')}
            </div>` : ''}

            <!-- 操作按钮 -->
            <div class="rmkt-actions">
              <button class="rmkt-btn-start" onclick="event.stopPropagation();App.launchModule('${em.id}')">🚀 开始推演训练</button>
              ${em.scenarioRefs.length ? `<button class="rmkt-btn-scenario" onclick="event.stopPropagation();App.switchTab('scenarios');setTimeout(()=>document.querySelector('[data-scenario=\\'${em.scenarioRefs[0]}\\']')?.scrollIntoView({behavior:'smooth'}),200)">🎯 查看关联场景</button>` : ''}
            </div>
          </div>
        </div>` : ''}

        <!-- 底部 — 关联场景 -->
        <div class="rmc-footer">
          <div class="rmc-footer-left">
            关联场景：${em.scenarioRefs.length ? em.scenarioRefs.slice(0,3).map(sid => {
              const s = (typeof SCENARIOS !== 'undefined') ? SCENARIOS.find(sc => sc.id === sid) : null;
              return s ? `<span class="rmc-sc-link" onclick="event.stopPropagation();App.switchTab('scenarios');setTimeout(()=>document.querySelector('[data-scenario=\\'${sid}\\']')?.scrollIntoView({behavior:'smooth'}),200)">${s.name}</span>` : '';
            }).join(' · ') : '<span class="rmc-sc-none">无特定场景限制</span>'}
          </div>
          <div class="rmc-footer-right">
            调用功能区：${em.zones.map(zid => {
              const z = (typeof ZONE_CONFIG !== 'undefined') ? ZONE_CONFIG[zid] : null;
              return z ? `<span style="color:${z.color};font-size:12px">${z.short}</span>` : '';
            }).join(' · ')}
          </div>
        </div>
      </div>`;
    }).join('');

    return `<div class="role-modules">
      <div class="rm-header">
        <div class="rm-header-left">
          <h2 class="rm-header-title">🎮 ${zp.roleName}专属训练课程</h2>
          <div class="rm-header-sub">
            共 <strong>${modules.length}</strong> 门训练课程，针对<span style="color:${roleColor};font-weight:700">${zp.roleName}</span>角色设计 ·
            <span style="color:var(--txt-2)">点击课程卡片进入详细训练教案，含知识讲解+案例分析+实战练习+自我检测</span>
          </div>
        </div>
        <button class="btn-back" onclick="App.switchTab('overview')">← 返回态势总览</button>
      </div>
      <div class="rm-grid">
        ${moduleCards}
      </div>
    </div>`;
  },

  /* 展开/折叠训练课程 */
  toggleModuleDetail(cardId){
    const card = document.getElementById(cardId);
    if(!card) return;
    const training = card.querySelector('.rmc-training');
    const arrow = card.querySelector('.rmc-expand-arrow');
    const label = card.querySelector('.rmc-expand-label');
    const isExpanded = card.classList.contains('expanded');

    if(isExpanded){
      card.classList.remove('expanded');
      if(training){ training.style.maxHeight = '0'; training.style.opacity = '0'; }
      if(arrow) arrow.textContent = '▼';
      if(label) label.textContent = '进入课程';
    }else{
      card.classList.add('expanded');
      if(training){ training.style.maxHeight = training.scrollHeight + 2000 + 'px'; training.style.opacity = '1'; }
      if(arrow) arrow.textContent = '▲';
      if(label) label.textContent = '收起课程';
      card.scrollIntoView({behavior:'smooth',block:'nearest'});
    }
  },

  /* 展开/折叠训练单元 */
  toggleTrainingUnit(unitId){
    const unit = document.getElementById(unitId);
    if(!unit) return;
    const body = unit.querySelector('.rmkt-unit-body');
    const arrow = unit.querySelector('.rmkt-unit-arrow');
    const isOpen = body.style.display !== 'none';
    if(isOpen){
      body.style.display = 'none';
      if(arrow) arrow.textContent = '▶';
    }else{
      body.style.display = 'block';
      if(arrow) arrow.textContent = '▼';
      unit.scrollIntoView({behavior:'smooth',block:'nearest'});
    }
  },

  /* 自我检测答题 */
  checkQuizAnswer(el, chosen, correct, explanation){
    const item = el.closest('.rmkt-quiz-item');
    const fb = item.querySelector('.rmkt-quiz-fb');
    const allOpts = item.querySelectorAll('.rmkt-quiz-opt');
    // 清除之前的选择
    allOpts.forEach(o => { o.classList.remove('correct','wrong'); o.style.pointerEvents = 'none'; });
    if(chosen === correct){
      el.classList.add('correct');
      fb.innerHTML = '✅ <strong>正确！</strong> ' + explanation;
      fb.style.color = 'var(--green)';
    }else{
      el.classList.add('wrong');
      allOpts[correct].classList.add('correct');
      fb.innerHTML = '❌ <strong>不正确。</strong> 正确答案是 ' + 'ABCD'[correct] + '。' + explanation;
      fb.style.color = 'var(--red)';
    }
    fb.style.display = 'block';
  },

  /* 启动推演模块 */
  launchModule(moduleId){
    const modules = (typeof RoleSystem !== 'undefined') ? RoleSystem.getModules() : [];
    const mod = modules.find(m => m.id === moduleId);
    if(!mod) { alert('模块未找到'); return; }
    if(mod.scenarioRefs && mod.scenarioRefs.length > 0){
      App.switchTab('scenarios');
      setTimeout(() => {
        const el = document.querySelector('[data-scenario=\'' + mod.scenarioRefs[0] + '\']');
        if(el) el.scrollIntoView({behavior:'smooth'});
      }, 300);
    }else{
      alert('🎮 ' + mod.name + ' 已准备就绪！\n\n该模块为独立训练模块，无需选择关联场景。\n请在专属训练标签页中开始操作。');
    }
  },

  /* ===== 六域动画SVG生成 ===== */
  domainAnim(id, c){
    switch(id){
      case 'military': return `<svg width="60" height="60" viewBox="0 0 60 60">
        <circle cx="30" cy="30" r="27" fill="none" stroke="${c}" stroke-width="1" stroke-opacity=".15"/>
        <circle cx="30" cy="30" r="18" fill="none" stroke="${c}" stroke-width="1" stroke-opacity=".1"/>
        <circle cx="30" cy="30" r="9" fill="none" stroke="${c}" stroke-width="1" stroke-opacity=".08"/>
        <line x1="30" y1="3" x2="30" y2="57" stroke="${c}" stroke-width=".5" stroke-opacity=".08"/>
        <line x1="3" y1="30" x2="57" y2="30" stroke="${c}" stroke-width=".5" stroke-opacity=".08"/>
        <path d="M 30,30 L 30,3 A 27,27 0 0,1 53,17 Z" fill="${c}" fill-opacity=".12">
          <animateTransform attributeName="transform" type="rotate" from="0 30 30" to="360 30 30" dur="3s" repeatCount="indefinite"/>
        </path>
        <circle cx="42" cy="18" r="2" fill="${c}">
          <animate attributeName="opacity" values="1;.3;1" dur="2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="20" cy="40" r="1.5" fill="${c}" opacity=".6">
          <animate attributeName="opacity" values=".6;.15;.6" dur="2.5s" begin=".5s" repeatCount="indefinite"/>
        </circle>
        <circle cx="30" cy="30" r="2.5" fill="${c}"/>
      </svg>`;

      case 'economic': return `<svg width="60" height="60" viewBox="0 0 60 60">
        <line x1="5" y1="50" x2="55" y2="50" stroke="${c}" stroke-width="1" stroke-opacity=".2"/>
        <line x1="5" y1="10" x2="5" y2="50" stroke="${c}" stroke-width="1" stroke-opacity=".2"/>
        <rect x="9" y="32" width="7" height="18" fill="${c}" fill-opacity=".25" rx="1">
          <animate attributeName="height" values="18;12;18" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="y" values="32;38;32" dur="2s" repeatCount="indefinite"/>
        </rect>
        <rect x="20" y="22" width="7" height="28" fill="${c}" fill-opacity=".35" rx="1">
          <animate attributeName="height" values="28;20;28" dur="2.5s" begin=".2s" repeatCount="indefinite"/>
          <animate attributeName="y" values="22;30;22" dur="2.5s" begin=".2s" repeatCount="indefinite"/>
        </rect>
        <rect x="31" y="16" width="7" height="34" fill="${c}" fill-opacity=".45" rx="1">
          <animate attributeName="height" values="34;26;34" dur="2.2s" begin=".4s" repeatCount="indefinite"/>
          <animate attributeName="y" values="16;24;16" dur="2.2s" begin=".4s" repeatCount="indefinite"/>
        </rect>
        <rect x="42" y="11" width="7" height="39" fill="${c}" fill-opacity=".55" rx="1">
          <animate attributeName="height" values="39;31;39" dur="2.8s" begin=".6s" repeatCount="indefinite"/>
          <animate attributeName="y" values="11;19;11" dur="2.8s" begin=".6s" repeatCount="indefinite"/>
        </rect>
        <polyline points="12,28 23,20 34,14 45,8" fill="none" stroke="${c}" stroke-width="1.5" stroke-opacity=".6">
          <animate attributeName="opacity" values=".6;1;.6" dur="3s" repeatCount="indefinite"/>
        </polyline>
      </svg>`;

      case 'cyber': return `<svg width="60" height="60" viewBox="0 0 60 60">
        <line x1="30" y1="30" x2="12" y2="15" stroke="${c}" stroke-width="1" stroke-opacity=".2"/>
        <line x1="30" y1="30" x2="48" y2="15" stroke="${c}" stroke-width="1" stroke-opacity=".2"/>
        <line x1="30" y1="30" x2="12" y2="45" stroke="${c}" stroke-width="1" stroke-opacity=".2"/>
        <line x1="30" y1="30" x2="48" y2="45" stroke="${c}" stroke-width="1" stroke-opacity=".2"/>
        <line x1="30" y1="30" x2="30" y2="8" stroke="${c}" stroke-width="1" stroke-opacity=".2"/>
        <line x1="30" y1="30" x2="30" y2="52" stroke="${c}" stroke-width="1" stroke-opacity=".2"/>
        <circle cx="12" cy="15" r="3" fill="${c}" fill-opacity=".2" stroke="${c}" stroke-width="1">
          <animate attributeName="r" values="3;4;3" dur="2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="48" cy="15" r="3" fill="${c}" fill-opacity=".2" stroke="${c}" stroke-width="1">
          <animate attributeName="r" values="3;4;3" dur="2s" begin=".3s" repeatCount="indefinite"/>
        </circle>
        <circle cx="12" cy="45" r="3" fill="${c}" fill-opacity=".2" stroke="${c}" stroke-width="1">
          <animate attributeName="r" values="3;4;3" dur="2s" begin=".6s" repeatCount="indefinite"/>
        </circle>
        <circle cx="48" cy="45" r="3" fill="${c}" fill-opacity=".2" stroke="${c}" stroke-width="1">
          <animate attributeName="r" values="3;4;3" dur="2s" begin=".9s" repeatCount="indefinite"/>
        </circle>
        <circle cx="30" cy="8" r="2.5" fill="${c}" fill-opacity=".2" stroke="${c}" stroke-width="1">
          <animate attributeName="r" values="2.5;3.5;2.5" dur="2s" begin="1.2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="30" cy="52" r="2.5" fill="${c}" fill-opacity=".2" stroke="${c}" stroke-width="1">
          <animate attributeName="r" values="2.5;3.5;2.5" dur="2s" begin="1.5s" repeatCount="indefinite"/>
        </circle>
        <circle cx="30" cy="30" r="5" fill="${c}" fill-opacity=".15" stroke="${c}" stroke-width="1.5">
          <animate attributeName="r" values="5;6.5;5" dur="1.5s" repeatCount="indefinite"/>
        </circle>
        <circle r="1.5" fill="${c}">
          <animateMotion dur="2s" repeatCount="indefinite" path="M 30,30 L 12,15"/>
        </circle>
        <circle r="1.5" fill="${c}">
          <animateMotion dur="2s" begin=".5s" repeatCount="indefinite" path="M 30,30 L 48,15"/>
        </circle>
        <circle r="1.5" fill="${c}">
          <animateMotion dur="2s" begin="1s" repeatCount="indefinite" path="M 30,30 L 12,45"/>
        </circle>
      </svg>`;

      case 'diplomatic': return `<svg width="60" height="60" viewBox="0 0 60 60">
        <circle cx="30" cy="30" r="22" fill="${c}" fill-opacity=".05" stroke="${c}" stroke-width="1" stroke-opacity=".3"/>
        <ellipse cx="30" cy="30" rx="22" ry="8" fill="none" stroke="${c}" stroke-width=".5" stroke-opacity=".12"/>
        <ellipse cx="30" cy="30" rx="22" ry="16" fill="none" stroke="${c}" stroke-width=".5" stroke-opacity=".1"/>
        <ellipse cx="30" cy="30" rx="8" ry="22" fill="none" stroke="${c}" stroke-width=".5" stroke-opacity=".12"/>
        <ellipse cx="30" cy="30" rx="16" ry="22" fill="none" stroke="${c}" stroke-width=".5" stroke-opacity=".1"/>
        <g>
          <animateTransform attributeName="transform" type="rotate" from="0 30 30" to="360 30 30" dur="15s" repeatCount="indefinite"/>
          <path d="M 10,22 Q 30,6 50,22" fill="none" stroke="${c}" stroke-width="1.5" stroke-opacity=".5"/>
          <circle cx="10" cy="22" r="2" fill="${c}"/>
          <circle cx="50" cy="22" r="2" fill="${c}"/>
          <path d="M 14,42 Q 30,54 46,42" fill="none" stroke="${c}" stroke-width="1.5" stroke-opacity=".35"/>
          <circle cx="14" cy="42" r="1.5" fill="${c}" fill-opacity=".6"/>
          <circle cx="46" cy="42" r="1.5" fill="${c}" fill-opacity=".6"/>
        </g>
        <circle cx="30" cy="30" r="2" fill="${c}"/>
      </svg>`;

      case 'space': return `<svg width="60" height="60" viewBox="0 0 60 60">
        <circle cx="30" cy="30" r="10" fill="${c}" fill-opacity=".06" stroke="${c}" stroke-width="1" stroke-opacity=".3"/>
        <ellipse cx="30" cy="30" rx="25" ry="10" fill="none" stroke="${c}" stroke-width="1" stroke-opacity=".2"/>
        <ellipse cx="30" cy="30" rx="22" ry="22" fill="none" stroke="${c}" stroke-width=".5" stroke-opacity=".12" transform="rotate(45 30 30)"/>
        <circle cx="30" cy="30" r="10" fill="none" stroke="${c}" stroke-width="1" stroke-opacity=".3">
          <animate attributeName="r" values="10;22;10" dur="3s" repeatCount="indefinite"/>
          <animate attributeName="stroke-opacity" values=".3;0;.3" dur="3s" repeatCount="indefinite"/>
        </circle>
        <g>
          <animateTransform attributeName="transform" type="rotate" from="0 30 30" to="360 30 30" dur="4s" repeatCount="indefinite"/>
          <rect x="50" y="28" width="6" height="4" fill="none" stroke="${c}" stroke-width=".5" rx=".5"/>
          <circle cx="55" cy="30" r="2" fill="${c}"/>
        </g>
        <g transform="rotate(45 30 30)">
          <g>
            <animateTransform attributeName="transform" type="rotate" from="0 30 30" to="-360 30 30" dur="6s" repeatCount="indefinite"/>
            <circle cx="52" cy="30" r="1.5" fill="${c}" fill-opacity=".6"/>
          </g>
        </g>
      </svg>`;

      case 'information': return `<svg width="60" height="60" viewBox="0 0 60 60">
        <polygon points="28,52 32,52 31,36 29,36" fill="${c}" fill-opacity=".3"/>
        <circle cx="30" cy="34" r="2" fill="${c}"/>
        <path d="M 20,31 Q 14,34 20,37" fill="none" stroke="${c}" stroke-width="1.5">
          <animate attributeName="opacity" values="1;.2;1" dur="2s" repeatCount="indefinite"/>
        </path>
        <path d="M 15,28 Q 6,34 15,40" fill="none" stroke="${c}" stroke-width="1.5">
          <animate attributeName="opacity" values=".7;.1;.7" dur="2s" begin=".4s" repeatCount="indefinite"/>
        </path>
        <path d="M 10,25 Q -2,34 10,43" fill="none" stroke="${c}" stroke-width="1.5">
          <animate attributeName="opacity" values=".4;.05;.4" dur="2s" begin=".8s" repeatCount="indefinite"/>
        </path>
        <path d="M 40,31 Q 46,34 40,37" fill="none" stroke="${c}" stroke-width="1.5">
          <animate attributeName="opacity" values="1;.2;1" dur="2s" begin=".2s" repeatCount="indefinite"/>
        </path>
        <path d="M 45,28 Q 54,34 45,40" fill="none" stroke="${c}" stroke-width="1.5">
          <animate attributeName="opacity" values=".7;.1;.7" dur="2s" begin=".6s" repeatCount="indefinite"/>
        </path>
        <path d="M 50,25 Q 62,34 50,43" fill="none" stroke="${c}" stroke-width="1.5">
          <animate attributeName="opacity" values=".4;.05;.4" dur="2s" begin="1s" repeatCount="indefinite"/>
        </path>
      </svg>`;

      default: return `<svg width="60" height="60" viewBox="0 0 60 60">
        <circle cx="30" cy="30" r="25" fill="none" stroke="${c}" stroke-width="1" stroke-opacity=".2"/>
        <circle cx="30" cy="30" r="15" fill="none" stroke="${c}" stroke-width="1" stroke-opacity=".15"/>
        <circle cx="30" cy="30" r="3" fill="${c}" fill-opacity=".4"/>
      </svg>`;
    }
  },

  /* ===== 态势总览 ===== */
  renderOverview(){
    const games = STATE.games;
    const avgScore = games.length ? Math.round(games.reduce((s,g) => s + g.score, 0) / games.length) : 0;

    /* === 生态系统融合：从同步中枢获取实时数据 === */
    const liveDomains = (typeof GlobalStateSync !== 'undefined')
      ? GlobalStateSync.getLiveDomains() : null;
    const liveForces = (typeof GlobalStateSync !== 'undefined')
      ? GlobalStateSync.getLiveForces() : FORCES;
    const liveThreats = (typeof GlobalStateSync !== 'undefined')
      ? GlobalStateSync.getLiveThreats() : THREATS;
    const liveIntel = (typeof GlobalStateSync !== 'undefined')
      ? GlobalStateSync.getLiveIntel() : [];
    const liveMonitor = (typeof GlobalStateSync !== 'undefined')
      ? GlobalStateSync.getLiveSystemMonitor() : {};
    const domainList = liveDomains ? Object.entries(liveDomains)
      .filter(([k]) => k !== '_source')
      .map(([key, value]) => {
        const d = DOMAINS.find(dd => {
          const domainKeys = { military:0, economic:1, cyber:2, diplomatic:3, space:4, information:5 };
          return domainKeys[key] === DOMAINS.indexOf(dd);
        }) || { name: key, color: 'var(--cyan)', icon: '📊', code: key.toUpperCase(), trend: 0 };
        return {
          ...d,
          _liveReadiness: value,
          _liveTrend: d.trend || 0,
        };
      }) : DOMAINS;

    const activeThreats = liveThreats.filter(t =>
      (t.level === '严重' || t.value < 30) || (t.status && t.status !== 'resolved')
    ).length;
    const threatPct = Math.min(Math.round((STATE.threatLevel || 72) / 10), 10);

    return `
    <!-- ===== 战略评估态势（紧凑动图布局） ===== -->
    <div class="strategic-assessment fade-in" style="margin-bottom:16px">
      <div class="sa-shield">
        <svg width="110" height="110" viewBox="0 0 110 110">
          <!-- 旋转外环 -->
          <circle cx="55" cy="55" r="52" fill="none" stroke="rgba(0,180,216,.15)" stroke-width="1" stroke-dasharray="3 5">
            <animateTransform attributeName="transform" type="rotate" from="0 55 55" to="360 55 55" dur="30s" repeatCount="indefinite"/>
          </circle>
          <!-- 刻度环 -->
          ${Array.from({length:12},(_,i)=>{
            const ang=(i*30-90)*Math.PI/180;
            const x1=55+48*Math.cos(ang), y1=55+48*Math.sin(ang);
            const x2=55+43*Math.cos(ang), y2=55+43*Math.sin(ang);
            return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="rgba(0,180,216,.25)" stroke-width="1"/>`;
          }).join('')}
          <!-- 脉冲环1 -->
          <circle cx="55" cy="55" r="28" fill="none" stroke="rgba(0,180,216,.4)" stroke-width="1.5">
            <animate attributeName="r" values="28;42;28" dur="3s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values=".5;0;.5" dur="3s" repeatCount="indefinite"/>
          </circle>
          <!-- 脉冲环2（延迟） -->
          <circle cx="55" cy="55" r="28" fill="none" stroke="rgba(0,180,216,.4)" stroke-width="1.5">
            <animate attributeName="r" values="28;42;28" dur="3s" begin="1.5s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values=".5;0;.5" dur="3s" begin="1.5s" repeatCount="indefinite"/>
          </circle>
          <!-- 六边形护盾 -->
          <polygon points="55,18 88,35 88,68 55,88 22,68 22,35" fill="rgba(0,180,216,.06)" stroke="rgba(0,180,216,.5)" stroke-width="1.5"/>
          <!-- 内六边形发光 -->
          <polygon points="55,25 80,38 80,63 55,80 30,63 30,38" fill="none" stroke="rgba(0,180,216,.3)" stroke-width="1">
            <animate attributeName="stroke-opacity" values=".2;.6;.2" dur="2.5s" repeatCount="indefinite"/>
          </polygon>
          <!-- 中心文字 -->
          <text x="55" y="52" text-anchor="middle" font-size="12" fill="#00b4d8" font-weight="bold" letter-spacing="2">国安</text>
          <text x="55" y="66" text-anchor="middle" font-size="7" fill="rgba(0,180,216,.5)" letter-spacing="1">DEFENSE</text>
        </svg>
      </div>
      <div class="sa-defcon-block">
        <div class="sadb-level">${STATE.defcon}</div>
        <div class="sadb-label">DEFCON 战备等级</div>
        <div class="sadb-desc">${STATE.defcon <= 2 ? '查理级 · 最高戒备' : STATE.defcon === 3 ? '德尔塔级 · 提高戒备' : '回声级 · 常规戒备'}</div>
        <div class="sadb-threat">
          <div class="sadb-threat-head">
            <span>综合威胁指数</span>
            <span class="sadb-threat-val">${STATE.threatLevel || 72}/100</span>
          </div>
          <div class="sadb-threat-bar">
            ${Array.from({length:10},(_,i)=>`<div class="sadb-tb ${i < threatPct ? 'active' : ''}"></div>`).join('')}
          </div>
        </div>
      </div>
      <div class="sa-stat-grid">
        <div class="stat-card c-cyan" style="padding:10px 12px">
          <div class="sc-top"><span class="sc-label">推演场次</span><span class="sc-icon">📊</span></div>
          <div class="sc-val cyan" id="ov-games" style="font-size:20px">0</div>
        </div>
        <div class="stat-card c-amber" style="padding:10px 12px">
          <div class="sc-top"><span class="sc-label">评估均分</span><span class="sc-icon">⭐</span></div>
          <div class="sc-val amber" id="ov-score" style="font-size:20px">0</div>
        </div>
        <div class="stat-card c-green" style="padding:10px 12px">
          <div class="sc-top"><span class="sc-label">场景库容</span><span class="sc-icon">🎯</span></div>
          <div class="sc-val green" id="ov-scenarios" style="font-size:20px">0</div>
        </div>
        <div class="stat-card c-red" style="padding:10px 12px">
          <div class="sc-top"><span class="sc-label">活跃威胁</span><span class="sc-icon">⚠️</span></div>
          <div class="sc-val red" id="ov-threats" style="font-size:20px">${(typeof ThreatContext !== 'undefined') ? ThreatContext.getActiveThreats().length : activeThreats}</div>
        </div>
      </div>
    </div>

    <!-- ===== AI战略智囊 (人机协同) ===== -->
    ${(typeof AIAdvisor !== 'undefined') ? AIAdvisor.renderDashboardWidget() : ''}

    <!-- ===== 威胁响应态势 (人机协同·威胁上下文) ===== -->
    ${(typeof ThreatContext !== 'undefined') ? ThreatContext._renderDashboardWidget() : ''}

    <!-- ===== 态势感知动态面板 ===== -->
    <div class="sa-container fade-in" style="margin-bottom:16px">
      <div class="sa-header">
        <div class="sa-title">📡 国家安全态势感知</div>
        <div class="sa-live-badge"><span class="sa-live-dot"></span> 实时监测</div>
      </div>
      <div class="sa-grid">
        <!-- 面板1: 威胁信息流 -->
        <div class="sa-panel">
          <div class="sa-panel-head">
            <span class="sa-ph-icon">⚠️</span>
            <span class="sa-ph-title">威胁信息流</span>
            <span class="sa-ph-count" id="saThreatCount">${activeThreats}条</span>
          </div>
          <div class="sa-feed-body">
            ${liveThreats.slice(0,5).map(t => {
              const sev = t.level === '严重' ? 5 : t.level === '较高' ? 4 : t.level === '中等' ? 3 : t.severity || 3;
              const cls = sev >= 5 ? 'sa-feed-urgent' : sev >= 4 ? 'sa-feed-high' : '';
              const tagColor = sev >= 5 ? 'var(--red)' : sev >= 4 ? 'var(--amber)' : 'var(--cyan)';
              const tagBg = sev >= 5 ? 'rgba(255,71,87,.15)' : sev >= 4 ? 'rgba(255,165,2,.15)' : 'rgba(0,180,216,.15)';
              return `
              <div class="sa-feed-item ${cls}">
                <span class="sa-fi-time">${esc(t.time || '实时')}</span>
                <span class="sa-fi-tag" style="background:${tagBg};color:${tagColor}">${t.value ? '值'+t.value : '威胁'+sev}</span>
                <span class="sa-fi-text">${esc(t.title || t.name)}</span>
              </div>`;
            }).join('')}
          </div>
        </div>

        <!-- 面板2: 力量部署雷达 -->
        <div class="sa-panel">
          <div class="sa-panel-head">
            <span class="sa-ph-icon">🎯</span>
            <span class="sa-ph-title">力量部署</span>
          </div>
          <div class="sa-radar-body sa-force-radar">
            <svg width="120" height="120" viewBox="0 0 120 120" style="margin:0 auto">
              <circle cx="60" cy="60" r="55" fill="none" stroke="rgba(0,180,216,.15)" stroke-width="1"/>
              <circle cx="60" cy="60" r="40" fill="none" stroke="rgba(0,180,216,.1)" stroke-width="1"/>
              <circle cx="60" cy="60" r="25" fill="none" stroke="rgba(0,180,216,.08)" stroke-width="1"/>
              <line x1="60" y1="5" x2="60" y2="115" stroke="rgba(0,180,216,.08)" stroke-width="0.5"/>
              <line x1="5" y1="60" x2="115" y2="60" stroke="rgba(0,180,216,.08)" stroke-width="0.5"/>
              <path d="M 60,60 L 60,5 A 55,55 0 0,1 108,38 Z" fill="rgba(0,180,216,.10)">
                <animateTransform attributeName="transform" type="rotate" from="0 60 60" to="360 60 60" dur="4s" repeatCount="indefinite"/>
              </path>
              ${liveForces.slice(0,6).map((f,i) => {
                const ang = (i * 60 - 90) * Math.PI / 180;
                const r = 30 + (f.readiness || 70) * 0.2;
                const x = 60 + r * Math.cos(ang);
                const y = 60 + r * Math.sin(ang);
                return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" fill="#00b4d8" opacity=".8"/>`;
              }).join('')}
              <circle cx="60" cy="60" r="4" fill="#00b4d8"/>
            </svg>
            <div class="sa-radar-stats">
              <div class="sa-rs-item"><span class="sa-rs-label">战备力量</span><span class="sa-rs-val" style="color:var(--cyan)">${liveForces.length}</span></div>
              <div class="sa-rs-item"><span class="sa-rs-label">已部署</span><span class="sa-rs-val" style="color:var(--green)">${liveForces.filter(f=>f.status==='deployed'||f.status==='active').length}</span></div>
              <div class="sa-rs-item"><span class="sa-rs-label">高戒备</span><span class="sa-rs-val" style="color:var(--red)">${liveForces.filter(f=>f.status==='high_alert').length}</span></div>
            </div>
          </div>
        </div>

        <!-- 面板3: 六域威胁指标 -->
        <div class="sa-panel">
          <div class="sa-panel-head">
            <span class="sa-ph-icon">📊</span>
            <span class="sa-ph-title">六域战备</span>
          </div>
          <div class="sa-domain-body">
            ${domainList.map(d => `
            <div class="sa-ds-row">
              <div class="sa-ds-head">
                <span class="sa-ds-name" style="color:${d.color}">${d.icon} ${d.name}</span>
                <span class="sa-ds-val" style="color:${d.color}">${d._liveReadiness || d.readiness}%</span>
              </div>
              <div class="sa-ds-bar-wrap">
                <div class="sa-ds-bar-threat" style="width:${(d.threatLevel || 3) * 20}%;background:${d.color}88"></div>
                <div class="sa-ds-bar-ready" style="width:${d._liveReadiness || d.readiness}%;background:${d.color}"></div>
                <div class="sa-ds-bar-shine"></div>
              </div>
              <div class="sa-ds-meta">
                <span style="color:var(--txt-2)">威胁${d.threatLevel || 3}/5</span>
                <span style="color:${(d._liveTrend || d.trend) > 0 ? 'var(--green)' : (d._liveTrend || d.trend) < 0 ? 'var(--red)' : 'var(--txt-2)'}">${(d._liveTrend || d.trend) > 0 ? '↑' : (d._liveTrend || d.trend) < 0 ? '↓' : '→'} ${Math.abs(d._liveTrend || d.trend)}</span>
              </div>
            </div>`).join('')}
          </div>
        </div>

        <!-- 面板4: 指挥时间线 -->
        <div class="sa-panel">
          <div class="sa-panel-head">
            <span class="sa-ph-icon">📋</span>
            <span class="sa-ph-title">指挥时间线</span>
          </div>
          <div style="max-height:220px;overflow-y:auto">
            ${TIMELINE.slice(0,6).map(e => {
              const dm = DOMAIN_MAP[e.type] || DOMAIN_MAP.intel;
              return `
              <div class="tl-item" style="padding-left:14px">
                <div class="tl-time" style="color:${dm.color}">${esc(e.time)} · ${dm.label}</div>
                <div class="tl-title">${esc(e.title)}</div>
                <div class="tl-desc" style="max-height:0;overflow:hidden;opacity:0;transition:max-height .3s,opacity .3s">${esc(e.desc)}</div>
              </div>`;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- 滚动数据条 -->
      <div class="sa-ticker-bar">
        <span class="sa-ticker-label">▮ 实时数据流</span>
        <div class="sa-ticker-track">
          <div class="sa-ticker-content">
            <span style="color:var(--cyan)">DEFCON ${STATE.defcon}</span>
            <span style="color:var(--amber)">威胁指数 ${STATE.threatLevel || 72}</span>
            <span style="color:var(--green)">战备力量 ${liveForces.length}支</span>
            <span style="color:var(--cyan)">域值均分 ${liveMonitor.domainAvg || '--'}%</span>
            <span style="color:var(--red)">活跃威胁 ${activeThreats}个</span>
            <span style="color:var(--cyan)">DEFCON ${STATE.defcon}</span>
            <span style="color:var(--amber)">威胁指数 ${STATE.threatLevel || 72}</span>
            <span style="color:var(--green)">战备力量 ${liveForces.length}支</span>
            <span style="color:var(--cyan)">域值均分 ${liveMonitor.domainAvg || '--'}%</span>
            <span style="color:var(--red)">活跃威胁 ${activeThreats}个</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== 六域安全态势卡片 ===== -->
    <div class="grid-3 fade-in" style="margin-bottom:16px">
      ${domainList.map(d => {
        const readiness = d._liveReadiness || d.readiness;
        const trendVal = d._liveTrend || d.trend || 0;
        return `
      <div class="domain-card" style="--dc-color:${d.color};--dc-pct:${readiness}">
        <div class="dc-accent" style="background:${d.color}"></div>
        <div class="dc-head">
          <div class="dc-name" style="color:${d.color}">${d.icon} ${d.name}</div>
          <div class="dc-code">${d.code}</div>
        </div>
        <div class="dc-anim-row">
          <div class="dc-anim">${this.domainAnim(d.id, d.color)}</div>
          <div class="dc-anim-info">
            <div class="dc-anim-pct" style="color:${d.color}">${readiness}<small>%</small></div>
            <div class="dc-anim-trend">
              <span class="trend ${trendVal > 0 ? 'up' : trendVal < 0 ? 'down' : 'flat'}">${trendVal > 0 ? '↑ +' + trendVal : trendVal < 0 ? '↓ ' + trendVal : '→ 0'}</span>
              <span style="color:var(--txt-2)">${d._liveReadiness !== undefined ? '实时战备' : '初始就绪'}</span>
            </div>
          </div>
        </div>
        <div class="dc-metrics">
          ${Object.entries(d.metrics || {}).map(([k,v]) => `<div class="row"><span class="k">${k}</span><span class="v">${v}</span></div>`).join('')}
        </div>
      </div>`;
      }).join('')}
    </div>

    <!-- ===== 双栏：活跃威胁 + 情报预警 ===== -->
    <div class="grid-2 fade-in" style="margin-bottom:16px">
      <!-- 活跃威胁列表 -->
      <div class="panel">
        <div class="panel-header">
          <span class="panel-title" style="color:var(--red)">⚠️ 活跃威胁</span>
          <span style="font-size:12px;color:var(--red);font-family:Consolas,monospace">${activeThreats}个进行中</span>
        </div>
        <div class="panel-body">
          <div class="threat-list">
            ${liveThreats.slice(0,4).map(t => {
              const dm = DOMAIN_MAP[t.type || t.domain] || DOMAIN_MAP.military;
              const sev = t.level === '严重' ? 4 : t.level === '较高' ? 3 : t.severity || 2;
              const sevColor = sev >= 4 ? 'var(--red)' : 'var(--amber)';
              const sevBg = sev >= 4 ? 'rgba(255,71,87,.1)' : 'rgba(255,165,2,.1)';
              return `
              <div class="threat-item">
                <div class="ti-dot" style="background:${dm ? dm.color : 'var(--cyan)'}"></div>
                <div class="ti-body">
                  <div class="ti-title">${esc(t.title || t.name)}</div>
                  <div class="ti-desc">${esc(t.desc || t.detail || '基于实时态势评估的动态威胁')}</div>
                  <div class="ti-meta">
                    <span class="tag" style="color:${dm ? dm.color : 'var(--cyan)'}">${dm ? dm.icon : '📡'} ${dm ? dm.label : '动态'}</span>
                    <span class="time">${esc(t.time || '实时')}</span>
                    <span style="font-size:11px;color:var(--txt-2)">📍 ${esc(t.location || t.source || '态势感知')}</span>
                  </div>
                </div>
                <span class="ti-sev" style="background:${sevBg};color:${sevColor}">${t.level || 'Lv' + sev}</span>
              </div>`;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- 情报预警 -->
      <div class="panel">
        <div class="panel-header">
          <span class="panel-title" style="color:var(--amber)">🔍 情报预警</span>
          <span style="font-size:12px;color:var(--amber);font-family:Consolas,monospace">${liveIntel.length}条</span>
        </div>
        <div class="panel-body">
          <div class="sa-intel-body">
            ${liveIntel.slice(0,4).map(i => {
              const sevColor = i.severityColor || (i.reliability === 'A' ? 'var(--green)' : i.reliability === 'B' ? 'var(--amber)' : 'var(--red)');
              const sevBg = i.severityColor ? sevColor.replace(')',',.15)') : (i.reliability === 'A' ? 'rgba(46,213,115,.15)' : 'rgba(255,165,2,.15)');
              const label = i.severity || i.reliability || 'A';
              return `
              <div class="sa-intel-item ${(i.severity === '严重' || i.reliability === 'A') ? 'sa-intel-critical' : ''}">
                <div class="sa-ii-icon" style="background:${sevBg};color:${sevColor}">${label.slice(0,1)}</div>
                <div class="sa-ii-content">
                  <div class="sa-ii-title">${esc(i.title)}</div>
                  <div class="sa-ii-meta">
                    <span style="color:var(--txt-2)">⏱ ${esc(i.time || '实时')}</span>
                  </div>
                </div>
              </div>`;
            }).join('')}
          </div>
        </div>
      </div>
    </div>

    <!-- ===== 系统监控 ===== -->
    <div class="panel sys-monitor fade-in">
      <div class="panel-header">
        <span class="panel-title">⚙️ 系统监控</span>
        <span style="font-size:12px;color:var(--green);padding:2px 8px;border-radius:3px;background:rgba(46,213,115,.08);border:1px solid rgba(46,213,115,.2)">● 实时</span>
      </div>
      <div class="panel-body">
        <div class="grid-2">
          <div>
            <div class="sm-metric">
              <div class="sm-head"><span class="name">域值均分</span><span class="sm-val" style="color:var(--cyan)">${liveMonitor.domainAvg || 50}%</span></div>
              <div class="sm-track"><div class="sm-fill cyan" id="m-cpu" style="width:${liveMonitor.domainAvg || 42}%"></div></div>
            </div>
            <div class="sm-metric">
              <div class="sm-head"><span class="name">力量战备</span><span class="sm-val" style="color:var(--amber)">${liveMonitor.forceAvg || 68}%</span></div>
              <div class="sm-track"><div class="sm-fill amber" id="m-mem" style="width:${liveMonitor.forceAvg || 68}%"></div></div>
            </div>
          </div>
          <div>
            <div class="sm-metric">
              <div class="sm-head"><span class="name">推演记录</span><span class="sm-val" style="color:var(--green)">${liveMonitor.gameCount || 0}场</span></div>
              <div class="sm-track"><div class="sm-fill green" id="m-net" style="width:${Math.min(100, (liveMonitor.gameCount || 0) * 5)}%"></div></div>
            </div>
            <div class="sm-metric">
              <div class="sm-head"><span class="name">活跃威胁</span><span class="sm-val" style="color:var(--cyan)">${liveMonitor.activeThreats || 0}个</span></div>
              <div class="sm-track"><div class="sm-fill cyan" id="m-sec" style="width:${(liveMonitor.activeThreats || 0) * 15}%"></div></div>
            </div>
          </div>
        </div>
        <div style="display:flex;gap:16px;margin-top:10px;padding-top:8px;border-top:1px solid var(--border);font-size:11px;color:var(--txt-2);font-family:Consolas,monospace">
          <span>推演: <span style="color:var(--cyan)" id="m-latency">${liveMonitor.gameCount || 0}场</span></span>
          <span>力量: <span style="color:var(--cyan)" id="m-nodes">${liveForces.length}支</span></span>
          <span>态势: <span style="color:var(--green)">${liveMonitor.domainAvg || 50}分</span></span>
        </div>
      </div>
    </div>
    `;
  },

  /* ===== 推演场景 ===== */
  renderScenarios(){
    const domains = [
      { key:'military',    label:'军事安全', icon:'⚔️', color:'#ff4757' },
      { key:'economic',    label:'经济安全', icon:'📊', color:'#ffa502' },
      { key:'cyber',       label:'网络空间', icon:'🌐', color:'#00b4d8' },
      { key:'diplomatic',  label:'外交战线', icon:'🤝', color:'#2ed573' },
      { key:'space',       label:'太空安全', icon:'🛰️', color:'#a29bfe' },
      { key:'information', label:'信息舆论', icon:'📡', color:'#ff6348' },
    ];

    /* 预计算各维度计数 */
    const domainCounts = {};
    domains.forEach(d => { domainCounts[d.key] = SCENARIOS.filter(s => s.domain === d.key).length; });
    const diffCounts = {};
    for(let i = 1; i <= 5; i++) diffCounts[i] = SCENARIOS.filter(s => s.difficulty === i).length;
    const threatCounts = {};
    for(let i = 1; i <= 5; i++) threatCounts[i] = SCENARIOS.filter(s => s.threatLevel === i).length;

    return `
    <div class="fade-in scene-layout">
      <!-- 左侧筛选面板 -->
      <div class="scene-sidebar">
        <div class="ss-search-box">
          🔍 <input type="text" placeholder="搜索场景..." id="sceneSearch">
        </div>

        <div class="ss-section">
          <div class="ss-section-title">安全领域</div>
          ${domains.map(d => `
            <label class="ss-option">
              <input type="checkbox" class="ss-chk-domain" value="${d.key}" checked>
              <span style="color:${d.color}">${d.icon}</span>
              <span>${d.label}</span>
              <span class="ss-opt-count">${domainCounts[d.key]}</span>
            </label>
          `).join('')}
        </div>

        <div class="ss-section">
          <div class="ss-section-title">难度等级</div>
          ${[5,4,3,2,1].map(i => `
            <label class="ss-option">
              <input type="checkbox" class="ss-chk-diff" value="${i}" checked>
              <span style="color:var(--amber);font-size:11px">${'★'.repeat(i)}${'☆'.repeat(5-i)}</span>
              <span class="ss-opt-count">${diffCounts[i]}</span>
            </label>
          `).join('')}
        </div>

        <div class="ss-section">
          <div class="ss-section-title">威胁等级</div>
          ${[5,4,3,2,1].map(i => `
            <label class="ss-option">
              <input type="checkbox" class="ss-chk-threat" value="${i}" checked>
              <span style="color:${i >= 4 ? 'var(--red)' : i >= 3 ? 'var(--amber)' : 'var(--cyan)'}">威胁${i}级</span>
              <span class="ss-opt-count">${threatCounts[i]}</span>
            </label>
          `).join('')}
        </div>

        <button class="ss-reset-btn" id="sceneReset">重置筛选</button>
      </div>

      <!-- 右侧结果区 -->
      <div class="scene-main">
        <div class="scene-result-bar">
          <div class="scene-result-count">找到 <span id="sceneCount">${SCENARIOS.length}</span> 个场景</div>
          <div class="scene-result-controls">
            <select class="sort-select" id="sceneSort">
              <option value="default">默认排序</option>
              <option value="difficulty">难度优先</option>
              <option value="threat">威胁优先</option>
              <option value="name">名称排序</option>
            </select>
            <div class="view-toggle">
              <button class="vt-btn active" data-view="grid" title="网格视图">⊞</button>
              <button class="vt-btn" data-view="list" title="列表视图">☰</button>
            </div>
          </div>
        </div>
        <div class="scene-result-grid stagger" id="sceneGrid">
          ${SCENARIOS.map(s => this.renderScenarioCard(s)).join('')}
        </div>
        <div class="scene-no-result" id="sceneNoResult" style="display:none">
          未找到匹配的场景，请调整筛选条件
        </div>
      </div>
    </div>`;
  },

  renderScenarioCard(s){
    const dm = DOMAIN_MAP[s.domain] || DOMAIN_MAP.military;
    const cls = s.classification === '机密' ? 'secret' : 'confidential';
    return `
    <div class="scenario-card" data-scene="${esc(s.id)}" data-domain="${s.domain}" data-difficulty="${s.difficulty}" data-threat="${s.threatLevel}" data-name="${esc(s.name)}">
      <div class="sc-glow"></div>
      <div class="sc-corner"></div>
      <div class="sc-top">
        <div>
          <div class="sc-name">${esc(s.name)}</div>
          <div class="sc-code">${esc(s.code)}</div>
        </div>
        <span class="sc-class ${cls}">${esc(s.classification)}</span>
      </div>
      <div class="sc-desc">${esc(s.background)}</div>
      <div class="sc-tags">
        <span class="sc-tag cyan">${dm.icon} ${dm.label}</span>
        <span class="sc-tag amber">⏱ ${s.duration}轮</span>
        <span class="sc-tag" style="background:rgba(255,71,87,.08);color:var(--red);border:1px solid rgba(255,71,87,.15)">威胁 ${s.threatLevel}/5</span>
        <span class="sc-diff">${difficultyStars(s.difficulty)}</span>
      </div>
    </div>`;
  },

  /* ===== 力量战备 ===== */
  renderForces(){
    /* 场景化：推演进行时使用场景化力量，否则使用实时更新数据 */
    const wgState = (typeof Wargame !== 'undefined' && Wargame.state) ? Wargame.state : null;
    const liveForcesData = (typeof GlobalStateSync !== 'undefined' && !wgState)
      ? GlobalStateSync.getLiveForces() : null;
    const forces = wgState ? wgState.forces : (liveForcesData || FORCES);
    const scenarioName = wgState ? wgState.scenario.name : null;
    const scenarioId = wgState ? wgState.scenario.id : null;
    const isLiveData = !!(liveForcesData && !wgState);

    /* 计算每个军种关联的行动 */
    const forceActions = {};
    if(typeof ACTION_FORCE_MAP !== 'undefined'){
      for(const [actId, forceCode] of Object.entries(ACTION_FORCE_MAP)){
        if(!forceCode) continue;
        if(!forceActions[forceCode]) forceActions[forceCode] = [];
        const act = typeof STRATEGIC_ACTIONS !== 'undefined' ? STRATEGIC_ACTIONS.find(a => a.id === actId) : null;
        if(act) forceActions[forceCode].push(act);
      }
    }

    return `
    <div class="fade-in">
      ${scenarioName ? `
      <!-- 场景化标识 -->
      <div class="panel" style="margin-bottom:16px;padding:12px 18px;display:flex;align-items:center;gap:12px;border-color:var(--amber);background:rgba(255,165,2,.05)">
        <span style="font-size:22px">🎯</span>
        <div style="flex:1">
          <div style="font-size:14px;font-weight:700;color:var(--amber)">场景化力量调配 — ${esc(scenarioName)}</div>
          <div style="font-size:12px;color:var(--txt-2);margin-top:2px">以下力量配置为当前推演场景专属，已根据场景需求调整军种、战备等级和部署方向</div>
        </div>
      </div>
      ` : `
      <div class="force-intel-banner">
        <div class="fib-icon">⚡</div>
        <div class="fib-body">
          <div class="fib-title">力量战备与推演引擎深度融合</div>
          <div class="fib-desc">${scenarioName ? '以下力量为当前场景专属配置，军种构成和战备等级已根据场景需求调整。' : '每个军种的战备度直接影响推演中关联行动的成功率（战备度×0.3%修正）。战备低于30%的行动将被锁定无法执行。导调阶段可调配战备，推演中行动消耗战备、每轮自然恢复+2%。'}</div>
        </div>
      </div>
      `}

      <div style="margin-bottom:16px">
        <div style="font-size:15px;font-weight:700;color:var(--cyan);display:flex;align-items:center;gap:14px;margin-bottom:12px">
          <span style="width:3px;height:17px;background:var(--cyan);border-radius:2px;box-shadow:var(--glow-cyan)"></span>
          ${scenarioName ? '场景军种战备状态' : '军种战备状态'}
        </div>
        <div class="grid-3 stagger">
          ${forces.map(f => {
            const color = f.readiness >= 90 ? 'var(--green)' : f.readiness >= 75 ? 'var(--cyan)' : f.readiness >= 60 ? 'var(--amber)' : 'var(--red)';
            const gradient = f.readiness >= 90 ? 'linear-gradient(90deg,var(--green-dim),var(--green))'
                           : f.readiness >= 75 ? 'linear-gradient(90deg,var(--cyan-dim),var(--cyan))'
                           : f.readiness >= 60 ? 'linear-gradient(90deg,var(--amber-dim),var(--amber))'
                           : 'linear-gradient(90deg,var(--red-dim),var(--red))';
            const acts = forceActions[f.code] || [];
            const modVal = Math.round((f.readiness - 50) * 0.3);
            const threshold = f.readiness < 30;
            return `
            <div class="force-card ${threshold ? 'force-locked' : ''}">
              <span class="fc-status ${f.status}">${f.status === 'high_alert' ? '高度戒备' : f.status === 'deployed' ? '已部署' : f.status === 'active' ? '执行中' : '就绪'}</span>
              <div class="fc-head">
                <div class="fc-icon">${f.icon}</div>
                <div>
                  <div class="fc-name">${esc(f.branch)}</div>
                  <div class="fc-code">${f.code}</div>
                </div>
              </div>
              <div class="fc-readiness">
                <div class="fc-pct" style="color:${color}">${f.readiness}%</div>
                <div class="fc-bar"><div class="fc-fill" style="width:${f.readiness}%;background:${gradient}"></div></div>
              </div>
              <!-- 推演影响 -->
              <div class="fc-wargame-impact">
                <div class="fc-wi-row">
                  <span class="fc-wi-label">成功率修正</span>
                  <span class="fc-wi-val ${modVal >= 0 ? 'pos' : 'neg'}">${modVal >= 0 ? '+' : ''}${modVal}%</span>
                </div>
                <div class="fc-wi-row">
                  <span class="fc-wi-label">行动门槛</span>
                  <span class="fc-wi-val ${threshold ? 'neg' : 'pos'}">${threshold ? '⛔ 已锁定' : '✓ 可执行'}</span>
                </div>
                <div class="fc-wi-row">
                  <span class="fc-wi-label">关联行动</span>
                  <span class="fc-wi-val" style="color:var(--cyan)">${acts.length}项</span>
                </div>
              </div>
              <!-- 关联行动列表 -->
              ${acts.length > 0 ? `
                <div class="fc-actions-list">
                  ${acts.slice(0, 4).map(a => `
                    <div class="fc-act-item">
                      <span class="fc-act-name">${esc(a.name)}</span>
                      <span class="fc-act-risk" style="color:${a.risk >= 0.3 ? 'var(--red)' : a.risk >= 0.15 ? 'var(--amber)' : 'var(--green)'}">${a.risk >= 0.3 ? '高' : a.risk >= 0.15 ? '中' : '低'}风险</span>
                    </div>
                  `).join('')}
                  ${acts.length > 4 ? `<div class="fc-act-more">+${acts.length - 4}项更多...</div>` : ''}
                </div>
              ` : '<div class="fc-no-actions">无直接关联行动（通用支援）</div>'}
              <div class="fc-info">
                <div class="row"><span class="k">人员</span><span class="v">${esc(f.personnel)}</span></div>
                <div class="row"><span class="k">装备</span><span class="v">${esc(f.equipment)}</span></div>
                <div class="row"><span class="k">部署</span><span class="v">${esc(f.deployment)}</span></div>
                ${f.note ? `<div class="row" style="border-top:1px solid var(--border);margin-top:4px;padding-top:4px"><span class="k">备注</span><span class="v" style="color:var(--amber)">${esc(f.note)}</span></div>` : ''}
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>

      ${!scenarioName ? `
      <!-- 非传统力量 -->
      <div style="font-size:15px;font-weight:700;color:var(--cyan);display:flex;align-items:center;gap:14px;margin-bottom:12px">
        <span style="width:3px;height:17px;background:var(--cyan);border-radius:2px;box-shadow:var(--glow-cyan)"></span>
        非传统安全力量
      </div>
      <div class="grid-3 stagger">
        ${(() => {
          const ecoD = (typeof DOMAINS !== 'undefined') ? DOMAINS.find(d => d.id === 'economic') : null;
          const dipD = (typeof DOMAINS !== 'undefined') ? DOMAINS.find(d => d.id === 'diplomatic') : null;
          const techD = (typeof DOMAINS !== 'undefined') ? DOMAINS.find(d => d.id === 'cyber') : null;
          const dipM = (typeof MODULES !== 'undefined') ? MODULES.find(m => m.id === 'diplomatic') : null;
          const techM = (typeof MODULES !== 'undefined') ? MODULES.find(m => m.id === 'tech') : null;
          const getMetric = (d, k, fb) => (d && d.metrics && d.metrics[k]) ? d.metrics[k] : fb;
          const getRes = (m, k, fb) => (m && m.resources) ? (m.resources.find(r => r.name === k)?.value || fb) : fb;
          const cards = [
            { icon:'💰', name:'经济金融力量', code:'经济', domain:ecoD,
              info:[
                ['经济增速', getMetric(ecoD,'经济增速','+5.2%')],
                ['外汇储备', getMetric(ecoD,'外汇储备','3.2万亿美元')],
                ['活跃制裁', getMetric(ecoD,'活跃制裁','6项')],
              ]},
            { icon:'🤝', name:'外交影响力', code:'外交', domain:dipD,
              info:[
                ['盟友', getMetric(dipD,'盟友','47国')],
                ['多边机制', getRes(dipM,'多边机制参与','12项')],
                ['驻外机构', getRes(dipM,'驻外机构','276个')],
              ]},
            { icon:'🔬', name:'科技创新力量', code:'科技', domain:techD,
              info:[
                ['研发投入', getRes(techM,'研发投入','3.3万亿')],
                ['专利保有', getRes(techM,'专利保有','420万件')],
                ['关键技术', getRes(techM,'关键技术攻关','35项')],
              ]},
          ];
          return cards.map(c => {
            const ready = c.domain ? c.domain.readiness : 70;
            const trend = c.domain ? c.domain.trend : 0;
            const color = ready >= 80 ? 'var(--green)' : ready >= 70 ? 'var(--cyan)' : 'var(--amber)';
            const grad = ready >= 80 ? 'linear-gradient(90deg,var(--green-dim),var(--green))'
                       : ready >= 70 ? 'linear-gradient(90deg,var(--cyan-dim),var(--cyan))'
                       : 'linear-gradient(90deg,var(--amber-dim),var(--amber))';
            const modVal = Math.round((ready - 50) * 0.3);
            return `
            <div class="force-card">
              <span class="fc-status active">活跃</span>
              <div class="fc-head">
                <div class="fc-icon">${c.icon}</div>
                <div><div class="fc-name">${c.name}</div><div class="fc-code">${c.code}</div></div>
              </div>
              <div class="fc-readiness">
                <div class="fc-pct" style="color:${color}">${ready}%</div>
                <div class="fc-bar"><div class="fc-fill" style="width:${ready}%;background:${grad}"></div></div>
              </div>
              <div class="fc-wargame-impact">
                <div class="fc-wi-row"><span class="fc-wi-label">成功率修正</span><span class="fc-wi-val ${modVal >= 0 ? 'pos' : 'neg'}">${modVal >= 0 ? '+' : ''}${modVal}%</span></div>
                <div class="fc-wi-row"><span class="fc-wi-label">关联行动</span><span class="fc-wi-val" style="color:var(--cyan)">${c.code}域全部</span></div>
              </div>
              <div class="fc-info">
                ${c.info.map(([k,v]) => `<div class="row"><span class="k">${k}</span><span class="v">${v}</span></div>`).join('')}
              </div>
            </div>`;
          }).join('');
        })()}
      </div>
      ` : ''}
    </div>
    `;
  },

  /* ===== 力量战备交互 ===== */
  initForcesInteractions(){
    // 悬停高亮关联行动
    document.querySelectorAll('.force-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.querySelector('.fc-actions-list')?.classList.add('expanded');
      });
      card.addEventListener('mouseleave', () => {
        card.querySelector('.fc-actions-list')?.classList.remove('expanded');
      });
    });
  },

  /* ===== 情报中心 ===== */
  renderIntel(){
    /* 场景化：推演进行时使用场景化情报 */
    const wgState = (typeof Wargame !== 'undefined' && Wargame.state) ? Wargame.state : null;
    const intel = wgState ? wgState.intel : INTEL;
    const scenarioName = wgState ? wgState.scenario.name : null;

    return `
    <div class="fade-in">
      ${scenarioName ? `
      <!-- 场景化标识 -->
      <div class="panel" style="margin-bottom:16px;padding:12px 18px;display:flex;align-items:center;gap:12px;border-color:var(--blue);background:rgba(33,150,243,.05)">
        <span style="font-size:22px">🔍</span>
        <div style="flex:1">
          <div style="font-size:14px;font-weight:700;color:var(--blue)">场景化情报中心 — ${esc(scenarioName)}</div>
          <div style="font-size:12px;color:var(--txt-2);margin-top:2px">以下情报为当前推演场景专属，情报来源、内容和可靠度均已根据场景需求定制</div>
        </div>
      </div>
      ` : `
      <!-- 情报-推演融合说明 -->
      <div class="force-intel-banner">
        <div class="fib-icon">🔍</div>
        <div class="fib-body">
          <div class="fib-title">情报中心与推演引擎深度融合</div>
          <div class="fib-desc">每条情报的修正值按可靠度（A=100%/B=70%/C=40%）折算后，直接加到对应域的行动成功率上。导调阶段过滤相关情报并展示预警，推演中每轮自动应用情报修正，情报历史记录供复盘报告分析。</div>
        </div>
      </div>
      `}

      <div style="display:grid;grid-template-columns:1fr 320px;gap:16px">
        <!-- 情报流 -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">📡 ${scenarioName ? '场景情报信息流' : '情报信息流'}</div>
            <span style="font-size:12px;color:var(--green)">${scenarioName ? '场景专属' : '实时更新'}</span>
          </div>
          <div class="panel-body">
            ${intel.map(i => {
              const dm = DOMAIN_MAP[i.type] || DOMAIN_MAP.intel;
              const mult = i.reliability === 'A' ? 1.0 : i.reliability === 'B' ? 0.7 : 0.4;
              const actualBonus = i.modifier ? Math.round(i.modifier.bonus * mult * 10) / 10 : 0;
              return `
              <div class="intel-item">
                <div class="ii-time">${esc(i.time)}</div>
                <div class="ii-body">
                  <div class="ii-head">
                    <span class="ii-source ${i.source}">${i.source}</span>
                    <span class="ii-rel ${i.reliability}">可靠度 ${i.reliability}</span>
                    <span style="font-size:11px;color:${dm.color}">${dm.icon} ${dm.label}</span>
                  </div>
                  <div class="ii-title">${esc(i.title)}</div>
                  <div class="ii-summary">${esc(i.summary)}</div>
                  ${i.modifier ? `
                    <div class="ii-modifier">
                      <span class="ii-mod-label">推演修正</span>
                      <span class="ii-mod-domain" style="color:${dm.color}">${dm.icon} ${DOMAIN_MAP[i.modifier.domain]?.label || i.modifier.domain}</span>
                      <span class="ii-mod-bonus">${i.modifier.bonus > 0 ? '+' : ''}${i.modifier.bonus}%</span>
                      <span class="ii-mod-mult">×${mult.toFixed(1)} = </span>
                      <span class="ii-mod-actual ${actualBonus > 0 ? 'pos' : 'neg'}">${actualBonus > 0 ? '+' : ''}${actualBonus}%</span>
                    </div>
                  ` : ''}
                </div>
              </div>`;
            }).join('')}
          </div>
        </div>

        <!-- 情报统计 + 推演关联 -->
        <div style="display:flex;flex-direction:column;gap:16px">
          <div class="panel">
            <div class="panel-header"><div class="panel-title">📊 情报来源</div></div>
            <div class="panel-body">
              ${this.renderIntelStats(intel)}
            </div>
          </div>

          <!-- 推演影响总览 -->
          <div class="panel">
            <div class="panel-header"><div class="panel-title">⚡ 推演修正总览</div></div>
            <div class="panel-body">
              <div class="intel-mod-summary">
                ${(() => {
                  const mods = {};
                  intel.forEach(i => {
                    if(i.modifier){
                      const mult = i.reliability === 'A' ? 1.0 : i.reliability === 'B' ? 0.7 : 0.4;
                      const actual = i.modifier.bonus * mult;
                      mods[i.modifier.domain] = (mods[i.modifier.domain] || 0) + actual;
                    }
                  });
                  return Object.entries(mods).map(([d, v]) => {
                    const dm = DOMAIN_MAP[d] || DOMAIN_MAP.military;
                    return `<div class="ims-row">
                      <span style="color:${dm.color}">${dm.icon} ${dm.label}</span>
                      <div class="ims-bar-wrap"><div class="ims-bar" style="width:${Math.min(100, v * 5)}%;background:${dm.color}"></div></div>
                      <span class="ims-val ${v > 0 ? 'pos' : 'neg'}">${v > 0 ? '+' : ''}${v.toFixed(1)}%</span>
                    </div>`;
                  }).join('');
                })()}
                <div style="margin-top:10px;padding-top:8px;border-top:1px solid var(--border);font-size:12px;color:var(--txt-2)">
                  <div style="display:flex;justify-content:space-between"><span>总修正项</span><span style="color:var(--cyan);font-family:Consolas,monospace">${intel.filter(i => i.modifier).length}条</span></div>
                  <div style="display:flex;justify-content:space-between"><span>高可靠度(A)</span><span style="color:var(--green);font-family:Consolas,monospace">${intel.filter(i => i.reliability === 'A').length}条</span></div>
                  <div style="display:flex;justify-content:space-between"><span>覆盖域</span><span style="color:var(--amber);font-family:Consolas,monospace">${new Set(intel.filter(i => i.modifier).map(i => i.modifier.domain)).size}个</span></div>
                </div>
              </div>
            </div>
          </div>

          <div class="panel">
            <div class="panel-header"><div class="panel-title">🎯 优先目标</div></div>
            <div class="panel-body" style="font-size:13px;line-height:2">
              ${(typeof THREATS !== 'undefined' ? THREATS : []).map(t => {
                const prio = t.severity >= 4 ? 'P1' : t.severity >= 3 ? 'P2' : 'P3';
                const pColor = t.severity >= 4 ? 'var(--red)' : t.severity >= 3 ? 'var(--amber)' : 'var(--cyan)';
                return `<div style="display:flex;justify-content:space-between"><span style="color:var(--txt-1)">${esc(t.title)}</span><span style="color:${pColor};font-family:Consolas,monospace">${prio}</span></div>`;
              }).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
    `;
  },

  /* ===== 情报中心交互 ===== */
  initIntelInteractions(){
    // 情报卡片悬停效果
    document.querySelectorAll('.intel-item').forEach(item => {
      item.addEventListener('mouseenter', () => {
        item.classList.add('hover');
      });
      item.addEventListener('mouseleave', () => {
        item.classList.remove('hover');
      });
    });
  },

  renderIntelStats(intelData){
    const intelSrc = intelData || INTEL;
    const sources = {};
    intelSrc.forEach(i => { sources[i.source] = (sources[i.source] || 0) + 1; });
    const colors = { '信号情报':'var(--blue)', '开源情报':'var(--green)', '人力情报':'var(--amber)', '图像情报':'var(--purple)' };
    return Object.entries(sources).map(([k,v]) => `
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:8px">
        <span style="font-size:12px;padding:2px 8px;border-radius:3px;font-weight:600;background:${colors[k]}22;color:${colors[k]};border:1px solid ${colors[k]}44">${k}</span>
        <div style="flex:1;height:6px;background:rgba(0,180,216,.08);border-radius:3px;overflow:hidden">
          <div style="height:100%;width:${v / intelSrc.length * 100}%;background:${colors[k]};border-radius:3px"></div>
        </div>
        <span style="font-family:Consolas,monospace;color:${colors[k]};min-width:36px;text-align:right;font-size:13px">${v}条</span>
      </div>
    `).join('') + `
      <div style="margin-top:10px;padding-top:8px;border-top:1px solid var(--border);font-size:12px;color:var(--txt-2)">
        <div style="display:flex;justify-content:space-between"><span>总情报量</span><span style="color:var(--cyan);font-family:Consolas,monospace">${intelSrc.length}条</span></div>
        <div style="display:flex;justify-content:space-between"><span>待处理</span><span style="color:var(--amber);font-family:Consolas,monospace">${Math.min(3, Math.ceil(intelSrc.length / 3))}条</span></div>
        <div style="display:flex;justify-content:space-between"><span>高可靠度(A)</span><span style="color:var(--green);font-family:Consolas,monospace">${intelSrc.filter(i => i.reliability === 'A').length}条</span></div>
      </div>
    `;
  },

  /* ===== 功能模块渲染（通用） ===== */
  renderModule(moduleId){
    /* 场景化：推演进行时使用场景化模块数据 */
    const wgState = (typeof Wargame !== 'undefined' && Wargame.state) ? Wargame.state : null;
    const scenarioName = wgState ? wgState.scenario.name : null;
    let mod;
    if(wgState && wgState.modules){
      mod = wgState.modules.find(m => m.id === moduleId);
    }
    if(!mod) mod = (typeof MODULES !== 'undefined') ? MODULES.find(m => m.id === moduleId) : null;
    if(!mod) return '<div class="fade-in"><div class="panel" style="padding:20px;color:var(--txt-2)">模块数据未找到</div></div>';

    const trendIcon = mod.trend > 0 ? '↑' : mod.trend < 0 ? '↓' : '—';
    const trendColor = mod.trend > 0 ? 'var(--green)' : mod.trend < 0 ? 'var(--red)' : 'var(--txt-2)';
    const modBonus = ((mod.readiness - 50) * (mod.modRate || 0.3) * 0.5).toFixed(1);

    return `
    <div class="fade-in">
      <!-- 模块头部 -->
      <div class="panel" style="margin-bottom:16px;padding:18px 22px">
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:14px">
          <div style="width:52px;height:52px;border-radius:10px;background:${mod.color}15;display:flex;align-items:center;justify-content:center;font-size:26px;border:1px solid ${mod.color}33">
            ${mod.icon}
          </div>
          <div style="flex:1">
            <div style="font-size:18px;font-weight:700">${esc(mod.name)}</div>
            <div style="font-size:13px;color:var(--txt-2);margin-top:3px">${esc(mod.desc)}</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:11px;color:var(--txt-2)">战备状态</div>
            <div style="font-size:28px;font-weight:700;color:${mod.color};font-family:Consolas,monospace">${mod.readiness}<span style="font-size:16px;color:var(--txt-2)">%</span></div>
            <div style="font-size:12px;color:${trendColor}">${trendIcon} ${Math.abs(mod.trend)}%</div>
          </div>
        </div>
        <!-- 战备进度条 -->
        <div style="height:8px;background:rgba(0,180,216,.08);border-radius:4px;overflow:hidden;margin-bottom:6px">
          <div style="height:100%;width:${mod.readiness}%;background:linear-gradient(90deg,${mod.color}88,${mod.color});border-radius:4px;transition:width .6s"></div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--txt-2)">
          <span>低</span><span>中</span><span>高</span>
        </div>
      </div>

      ${mod.scenarioNote ? `
      <!-- 场景化说明 -->
      <div class="panel" style="margin-bottom:16px;padding:12px 18px;display:flex;align-items:center;gap:12px;border-color:${mod.color}44;background:${mod.color}08">
        <span style="font-size:20px">🎯</span>
        <div style="flex:1">
          <div style="font-size:13px;font-weight:700;color:${mod.color}">${scenarioName ? '场景适配说明' : '模块说明'}</div>
          <div style="font-size:12px;color:var(--txt-1);margin-top:3px;line-height:1.6">${esc(mod.scenarioNote)}</div>
        </div>
      </div>
      ` : ''}

      <!-- 推演联动说明 -->
      <div class="panel" style="margin-bottom:16px;padding:16px 20px;display:flex;align-items:center;gap:12px;border-color:${mod.color}33">
        <span style="font-size:22px">🔗</span>
        <div style="flex:1">
          <div style="font-size:13px;font-weight:700;color:${mod.color}">推演引擎联动</div>
          <div style="font-size:12px;color:var(--txt-2);margin-top:2px">
            该模块为推演中<span style="color:${mod.color}">${DOMAIN_MAP[mod.modDomain] ? DOMAIN_MAP[mod.modDomain].label : mod.modDomain}</span>域行动提供成功率修正
          </div>
        </div>
        <div style="text-align:right">
          <div style="font-size:11px;color:var(--txt-2)">修正值</div>
          <div style="font-size:20px;font-weight:700;color:${modBonus >= 0 ? 'var(--green)' : 'var(--red)'};font-family:Consolas,monospace">${modBonus >= 0 ? '+' : ''}${modBonus}%</div>
        </div>
      </div>

      <!-- 资源面板 -->
      <div class="panel" style="margin-bottom:16px;padding:18px 22px">
        <div style="font-size:14px;font-weight:700;color:var(--cyan);margin-bottom:14px">📦 核心资源</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px">
          ${mod.resources.map(r => `
            <div style="padding:14px;background:rgba(8,20,40,.5);border-radius:8px;border:1px solid var(--border)">
              <div style="font-size:12px;color:var(--txt-2);margin-bottom:6px">${esc(r.name)}</div>
              <div style="font-size:18px;font-weight:700;color:${mod.color};font-family:Consolas,monospace">${esc(r.value)}</div>
              <div style="font-size:11px;color:var(--txt-2);margin-top:4px">${esc(r.detail)}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- 在行动态 -->
      <div class="panel" style="padding:18px 22px">
        <div style="font-size:14px;font-weight:700;color:var(--cyan);margin-bottom:14px">⚡ 在行动态</div>
        ${mod.operations.map(op => {
          const prColor = op.progress >= 80 ? 'var(--green)' : op.progress >= 50 ? 'var(--amber)' : 'var(--red)';
          const stColor = op.status === '已达成' ? 'var(--green)' : op.status === '执行中' || op.status === '进行中' ? 'var(--cyan)' : op.status === '待激活' ? 'var(--red)' : 'var(--amber)';
          return `
            <div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--border)">
              <div style="flex:1">
                <div style="display:flex;align-items:center;gap:14px;margin-bottom:6px">
                  <span style="font-size:13px;font-weight:600">${esc(op.name)}</span>
                  <span style="font-size:11px;padding:2px 6px;border-radius:3px;background:${stColor}22;color:${stColor};border:1px solid ${stColor}44">${esc(op.status)}</span>
                </div>
                <div style="height:4px;background:rgba(0,180,216,.08);border-radius:2px;overflow:hidden">
                  <div style="height:100%;width:${op.progress}%;background:${prColor};border-radius:2px"></div>
                </div>
              </div>
              <div style="text-align:right;min-width:60px">
                <div style="font-size:16px;font-weight:700;color:${prColor};font-family:Consolas,monospace">${op.progress}%</div>
                <div style="font-size:10px;color:var(--txt-2)">${esc(op.priority)}优先</div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
    `;
  },

  /* ===== 功能模块交互初始化 ===== */
  initModuleInteractions(moduleId){
    // 可扩展：添加模块操作按钮等交互
  },

  /* ===== 案例库 ===== */
  renderCases(){
    const cases = (typeof ALL_CASES !== 'undefined') ? ALL_CASES : ((typeof CASES !== 'undefined') ? CASES : []);
    const cats = (typeof CASES_BY_CAT !== 'undefined') ? Object.keys(CASES_BY_CAT) : ['military','economic','cyber','diplomatic','space','hybrid','bio','energy','intel','terror'];
    const catLabels = {
      military:'军事', economic:'经济', cyber:'网络', diplomatic:'外交',
      space:'太空', hybrid:'混合', bio:'生物', energy:'能源', intel:'情报', terror:'反恐'
    };
    const catIcons = {
      military:'⚔️', economic:'📊', cyber:'🌐', diplomatic:'🤝',
      space:'🛰️', hybrid:'🎭', bio:'🦠', energy:'⚡', intel:'🔍', terror:'🛡️'
    };
    const sevColors = { 1:'var(--green)', 2:'var(--green)', 3:'var(--amber)', 4:'var(--red)', 5:'var(--red)' };

    return `
    <div class="fade-in">
      <!-- 案例库头部 -->
      <div class="panel" style="margin-bottom:16px;padding:16px 20px">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
          <span style="font-size:28px">📚</span>
          <div>
            <div style="font-size:17px;font-weight:700;color:var(--cyan)">国家安全战略案例库</div>
            <div style="font-size:13px;color:var(--txt-2);margin-top:2px">${cases.length}个经典案例 · 覆盖${cats.length}大安全领域 · 辅助推演学习与决策训练</div>
          </div>
          <div style="margin-left:auto;display:flex;gap:16px">
            <div style="text-align:center">
              <div style="font-size:24px;font-weight:700;color:var(--cyan);font-family:Consolas,monospace">${cases.length}</div>
              <div style="font-size:11px;color:var(--txt-2)">案例总数</div>
            </div>
            <div style="text-align:center">
              <div style="font-size:24px;font-weight:700;color:var(--amber);font-family:Consolas,monospace">${cats.length}</div>
              <div style="font-size:11px;color:var(--txt-2)">类别</div>
            </div>
            <div style="text-align:center">
              <div style="font-size:24px;font-weight:700;color:var(--green);font-family:Consolas,monospace">${cases.filter(c => c.scenario).length}</div>
              <div style="font-size:11px;color:var(--txt-2)">关联场景</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 筛选和搜索 -->
      <div class="panel" style="margin-bottom:16px;padding:16px 20px">
        <div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:12px" id="caseFilters">
          <span class="case-filter active" data-cat="all" style="font-size:12px;padding:5px 12px;border-radius:4px;cursor:pointer;background:rgba(0,180,216,.15);color:var(--cyan);border:1px solid rgba(0,180,216,.3)">全部 ${cases.length}</span>
          ${cats.map(cat => {
            const count = (typeof CASES_BY_CAT !== 'undefined' && CASES_BY_CAT[cat]) ? CASES_BY_CAT[cat].length : 0;
            return `<span class="case-filter" data-cat="${cat}" style="font-size:12px;padding:5px 12px;border-radius:4px;cursor:pointer;background:rgba(0,180,216,.04);color:var(--txt-1);border:1px solid var(--border)">${catIcons[cat] || '📋'} ${catLabels[cat] || cat} ${count}</span>`;
          }).join('')}
        </div>
        <input type="text" id="caseSearch" placeholder="搜索案例标题、关键词、地区..." style="width:100%;padding:8px 12px;background:rgba(8,20,40,.6);border:1px solid var(--border-mid);border-radius:5px;color:var(--txt-1);font-size:13px">
      </div>

      <!-- 案例列表 -->
      <div id="caseList" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:12px">
        ${cases.map(c => {
          const catLabel = catLabels[c.cat] || c.cat;
          const catIcon = catIcons[c.cat] || '📋';
          const sevC = sevColors[c.sev] || 'var(--amber)';
          const sevStars = '★'.repeat(c.sev) + '☆'.repeat(5 - c.sev);
          return `
            <div class="case-card" data-case="${c.id}" data-cat="${c.cat}" style="padding:16px;background:var(--bg-panel);border:1px solid var(--border);border-radius:8px;cursor:pointer;transition:all .2s">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
                <div style="display:flex;align-items:center;gap:6px">
                  <span style="font-size:16px">${catIcon}</span>
                  <span style="font-size:11px;padding:2px 6px;border-radius:3px;background:rgba(0,180,216,.12);color:var(--cyan);border:1px solid rgba(0,180,216,.20)">${catLabel}</span>
                </div>
                <span style="font-size:12px;color:${sevC};font-family:Consolas,monospace" title="严重程度">${sevStars}</span>
              </div>
              <div style="font-size:14px;font-weight:700;margin-bottom:4px">${esc(c.title)}</div>
              <div style="font-size:12px;color:var(--txt-2);margin-bottom:8px">${esc(c.period)} · ${esc(c.region)}</div>
              <div style="font-size:12px;color:var(--txt-1);line-height:1.6;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${esc(c.summary)}</div>
              <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:10px">
                ${(c.tags || []).slice(0,3).map(t => `<span style="font-size:10px;padding:2px 6px;border-radius:3px;background:rgba(0,180,216,.04);color:var(--txt-2);border:1px solid var(--border)">${esc(t)}</span>`).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
    `;
  },

  /* ===== 案例库交互初始化 ===== */
  initCasesInteractions(){
    // 筛选
    document.querySelectorAll('.case-filter').forEach(el => {
      el.addEventListener('click', () => {
        document.querySelectorAll('.case-filter').forEach(f => {
          f.classList.remove('active');
          f.style.background = 'rgba(0,180,216,.04)';
          f.style.color = 'var(--txt-1)';
          f.style.borderColor = 'var(--border)';
        });
        el.classList.add('active');
        el.style.background = 'rgba(0,180,216,.15)';
        el.style.color = 'var(--cyan)';
        el.style.borderColor = 'rgba(0,180,216,.3)';
        const cat = el.getAttribute('data-cat');
        document.querySelectorAll('.case-card').forEach(card => {
          const cardCat = card.getAttribute('data-cat');
          const show = (cat === 'all' || cardCat === cat);
          card.style.display = show ? '' : 'none';
        });
      });
    });

    // 搜索
    const search = document.getElementById('caseSearch');
    if(search){
      search.addEventListener('input', () => {
        const q = search.value.toLowerCase().trim();
        document.querySelectorAll('.case-card').forEach(card => {
          const text = card.textContent.toLowerCase();
          card.style.display = (!q || text.includes(q)) ? '' : 'none';
        });
      });
    }

    // 案例卡片点击
    document.querySelectorAll('[data-case]').forEach(card => {
      card.addEventListener('click', () => {
        const caseId = card.getAttribute('data-case');
        const allCases = (typeof ALL_CASES !== 'undefined') ? ALL_CASES : ((typeof CASES !== 'undefined') ? CASES : []);
        const c = allCases.find(x => x.id === caseId);
        if(c) this.showCaseDetail(c);
      });
    });
  },

  /* ===== 案例详情弹窗 ===== */
  showCaseDetail(c){
    const catLabels = { military:'军事', economic:'经济', cyber:'网络', diplomatic:'外交', space:'太空', hybrid:'混合', bio:'生物', energy:'能源', intel:'情报', terror:'反恐' };
    const catIcons = { military:'⚔️', economic:'📊', cyber:'🌐', diplomatic:'🤝', space:'🛰️', hybrid:'🎭', bio:'🦠', energy:'⚡', intel:'🔍', terror:'🛡️' };
    const sevColors = { 1:'var(--green)', 2:'var(--green)', 3:'var(--amber)', 4:'var(--red)', 5:'var(--red)' };
    const sevC = sevColors[c.sev] || 'var(--amber)';
    const sevStars = '★'.repeat(c.sev) + '☆'.repeat(5 - c.sev);

    // 查找关联场景
    let linkedScene = null;
    if(c.scenario && typeof SCENARIOS !== 'undefined'){
      linkedScene = SCENARIOS.find(s => s.id === c.scenario);
    }

    const existing = document.getElementById('modalOverlay');
    if(existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'modalOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.82);backdrop-filter:blur(5px);display:flex;align-items:center;justify-content:center;animation:fadeIn .2s ease;overflow-y:auto;padding:20px';
    overlay.innerHTML = `
      <div style="background:var(--bg-panel-2);border:1px solid var(--border-mid);border-radius:10px;width:720px;max-width:95vw;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.6)">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid var(--border);position:sticky;top:0;background:var(--bg-panel-2);z-index:1">
          <div>
            <div style="display:flex;align-items:center;gap:14px">
              <span style="font-size:20px">${catIcons[c.cat] || '📋'}</span>
              <div style="font-size:16px;font-weight:700">${esc(c.title)}</div>
            </div>
            <div style="font-size:12px;color:var(--txt-2);margin-top:4px;font-family:Consolas,monospace">${esc(c.id)} · ${esc(c.period)} · ${esc(c.region)}</div>
          </div>
          <button id="closeCaseModal" style="background:none;border:1px solid var(--border-mid);color:var(--txt-1);width:30px;height:30px;border-radius:5px;cursor:pointer;font-size:16px">×</button>
        </div>
        <div style="padding:20px">
          <!-- 标签栏 -->
          <div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:16px">
            <span style="font-size:12px;padding:3px 8px;border-radius:3px;background:rgba(0,180,216,.12);color:var(--cyan);border:1px solid rgba(0,180,216,.20)">${catLabels[c.cat] || c.cat}</span>
            <span style="font-size:12px;padding:3px 8px;border-radius:3px;background:${sevC}22;color:${sevC};border:1px solid ${sevC}44" title="严重程度">${sevStars}</span>
            ${linkedScene ? `<span style="font-size:12px;padding:3px 8px;border-radius:3px;background:rgba(255,165,2,.08);color:var(--amber);border:1px solid rgba(255,165,2,.15)">🔗 ${esc(linkedScene.name)}</span>` : ''}
          </div>

          <!-- 摘要 -->
          <div style="font-size:13px;font-weight:700;color:var(--cyan);margin-bottom:6px">📋 事件概述</div>
          <div style="font-size:13px;color:var(--txt-0);line-height:1.8;margin-bottom:18px">${esc(c.summary)}</div>

          <!-- 事件链 -->
          <div style="font-size:13px;font-weight:700;color:var(--cyan);margin-bottom:16px">🔗 事件链路</div>
          <div style="margin-bottom:18px;position:relative;padding-left:20px">
            <div style="position:absolute;left:6px;top:8px;bottom:8px;width:2px;background:var(--border-mid)"></div>
            ${(c.chain || []).map(ev => `
              <div style="position:relative;margin-bottom:14px">
                <div style="position:absolute;left:-20px;top:4px;width:10px;height:10px;border-radius:50%;background:var(--cyan);border:2px solid var(--bg-panel-2)"></div>
                <div style="font-size:12px;font-weight:700;color:var(--amber);font-family:Consolas,monospace;margin-bottom:3px">${esc(ev.t)}</div>
                <div style="font-size:13px;color:var(--txt-0);line-height:1.6">${esc(ev.e)}</div>
                ${ev.p ? `<div style="font-size:11px;color:var(--txt-2);margin-top:3px;font-style:italic">→ ${esc(ev.p)}</div>` : ''}
              </div>
            `).join('')}
          </div>

          <!-- 关键决策 -->
          <div style="font-size:13px;font-weight:700;color:var(--cyan);margin-bottom:16px">⚖️ 关键决策</div>
          <div style="margin-bottom:18px;display:flex;flex-direction:column;gap:16px">
            ${(c.decisions || []).map(d => `
              <div style="padding:12px;background:rgba(8,20,40,.5);border-radius:6px;border-left:3px solid var(--amber)">
                <div style="font-size:13px;font-weight:600;color:var(--amber);margin-bottom:4px">${esc(d.d)}</div>
                <div style="font-size:12px;color:var(--txt-1);line-height:1.6">
                  <span style="color:var(--cyan)">决策者:</span> ${esc(d.a || 'N/A')}
                </div>
                <div style="font-size:12px;color:var(--txt-1);line-height:1.6;margin-top:2px">
                  <span style="color:var(--cyan)">理由:</span> ${esc(d.r || 'N/A')}
                </div>
                <div style="font-size:12px;color:var(--txt-1);line-height:1.6;margin-top:2px">
                  <span style="color:var(--cyan)">结果:</span> ${esc(d.o || 'N/A')}
                </div>
              </div>
            `).join('')}
          </div>

          <!-- 后果 -->
          <div style="font-size:13px;font-weight:700;color:var(--cyan);margin-bottom:16px">📉 后果评估</div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:18px">
            <div style="padding:12px;background:rgba(255,71,87,.05);border-radius:6px;border:1px solid rgba(255,71,87,.15)">
              <div style="font-size:11px;color:var(--red);margin-bottom:4px">短期</div>
              <div style="font-size:12px;color:var(--txt-0);line-height:1.6">${esc(c.consequences && c.consequences.s || 'N/A')}</div>
            </div>
            <div style="padding:12px;background:rgba(255,165,2,.05);border-radius:6px;border:1px solid rgba(255,165,2,.15)">
              <div style="font-size:11px;color:var(--amber);margin-bottom:4px">中期</div>
              <div style="font-size:12px;color:var(--txt-0);line-height:1.6">${esc(c.consequences && c.consequences.m || 'N/A')}</div>
            </div>
            <div style="padding:12px;background:rgba(46,213,115,.05);border-radius:6px;border:1px solid rgba(46,213,115,.15)">
              <div style="font-size:11px;color:var(--green);margin-bottom:4px">长期</div>
              <div style="font-size:12px;color:var(--txt-0);line-height:1.6">${esc(c.consequences && c.consequences.l || 'N/A')}</div>
            </div>
          </div>

          <!-- 经验教训 -->
          <div style="font-size:13px;font-weight:700;color:var(--cyan);margin-bottom:16px">💡 经验教训</div>
          <div style="margin-bottom:18px">
            ${(c.lessons || []).map(l => `
              <div style="display:flex;align-items:flex-start;gap:14px;margin-bottom:8px">
                <span style="color:var(--amber);font-size:14px;margin-top:1px">▸</span>
                <div style="font-size:13px;color:var(--txt-0);line-height:1.6">${esc(l)}</div>
              </div>
            `).join('')}
          </div>

          ${c.wg ? `
          <!-- 推演指导 -->
          <div style="font-size:13px;font-weight:700;color:var(--amber);margin-bottom:16px;border-top:1px solid var(--border);padding-top:14px">🎯 推演指导</div>

          <!-- 推荐策略 -->
          <div style="padding:14px;background:rgba(255,165,2,.05);border-radius:6px;border-left:3px solid var(--amber);margin-bottom:14px">
            <div style="font-size:12px;font-weight:600;color:var(--amber);margin-bottom:6px">📋 推荐策略方向</div>
            <div style="font-size:13px;color:var(--txt-0);line-height:1.7">${esc(c.wg.approach)}</div>
          </div>

          <!-- 关键成功因素 -->
          <div style="padding:14px;background:rgba(46,213,115,.05);border-radius:6px;border-left:3px solid var(--green);margin-bottom:14px">
            <div style="font-size:12px;font-weight:600;color:var(--green);margin-bottom:6px">⭐ 关键成功因素</div>
            <div style="font-size:13px;color:var(--txt-0);line-height:1.7">${esc(c.wg.keyFactor)}</div>
          </div>

          <!-- 建议行动类型 -->
          <div style="margin-bottom:14px">
            <div style="font-size:12px;font-weight:600;color:var(--cyan);margin-bottom:8px">⚡ 建议优先行动类型</div>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              ${(c.wg.actions || []).map(a => `<span style="font-size:11px;padding:4px 10px;border-radius:4px;background:rgba(0,180,216,.12);color:var(--cyan);border:1px solid rgba(0,180,216,.20)">${esc(a)}</span>`).join('')}
            </div>
          </div>

          <!-- 关键风险 -->
          <div style="margin-bottom:14px">
            <div style="font-size:12px;font-weight:600;color:var(--red);margin-bottom:8px">⚠️ 关键风险点</div>
            ${(c.wg.risks || []).map(r => `
              <div style="display:flex;align-items:flex-start;gap:14px;margin-bottom:5px">
                <span style="color:var(--red);font-size:12px;margin-top:1px">⚠</span>
                <div style="font-size:12px;color:var(--txt-1);line-height:1.5">${esc(r)}</div>
              </div>
            `).join('')}
          </div>

          <!-- 应避免 -->
          <div style="padding:12px;background:rgba(255,71,87,.05);border-radius:6px;border-left:3px solid var(--red);margin-bottom:14px">
            <div style="font-size:12px;font-weight:600;color:var(--red);margin-bottom:4px">🚫 应避免的陷阱</div>
            <div style="font-size:12px;color:var(--txt-1);line-height:1.6">${esc(c.wg.avoid)}</div>
          </div>

          <!-- 替代方案分析 -->
          <div style="font-size:12px;font-weight:600;color:var(--purple);margin-bottom:8px">🔀 替代方案分析</div>
          <div style="display:flex;flex-direction:column;gap:14px;margin-bottom:14px">
            ${(c.wg.altOptions || []).map(alt => {
              const aColor = alt.assessment.includes('最优') ? 'var(--green)' : alt.assessment.includes('高风险') || alt.assessment.includes('不可接受') ? 'var(--red)' : 'var(--amber)';
              return `
              <div style="padding:10px 12px;background:rgba(162,155,254,.05);border-radius:6px;border:1px solid rgba(162,155,254,.15)">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
                  <span style="font-size:12px;font-weight:600;color:var(--purple)">${esc(alt.o)}</span>
                  <span style="font-size:10px;padding:2px 6px;border-radius:3px;background:${aColor}22;color:${aColor};border:1px solid ${aColor}44">${esc(alt.assessment)}</span>
                </div>
                <div style="font-size:12px;color:var(--txt-1);line-height:1.5">${esc(alt.outcome)}</div>
              </div>
              `;
            }).join('')}
          </div>

          <!-- 推演评估指标 -->
          <div style="font-size:12px;font-weight:600;color:var(--cyan);margin-bottom:8px">📊 推演评估指标</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:18px">
            ${(c.wg.metrics || []).map(m => `
              <div style="padding:10px;background:rgba(0,180,216,.06);border-radius:6px;border:1px solid rgba(0,180,216,.15)">
                <div style="font-size:12px;font-weight:600;color:var(--cyan)">${esc(m.n)}</div>
                <div style="font-size:11px;color:var(--txt-2);margin-top:3px;line-height:1.4">${esc(m.d)}</div>
              </div>
            `).join('')}
          </div>
          ` : ''}

          <!-- 标签 -->
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px">
            ${(c.tags || []).map(t => `<span style="font-size:11px;padding:3px 8px;border-radius:3px;background:rgba(0,180,216,.08);color:var(--txt-2);border:1px solid var(--border)">${esc(t)}</span>`).join('')}
          </div>

          <!-- 操作按钮 -->
          <div style="display:flex;gap:16px;justify-content:flex-end;padding-top:12px;border-top:1px solid var(--border)">
            ${linkedScene ? `<button class="btn btn-sm btn-amber" id="caseToScene">🎯 基于关联场景推演</button>` : ''}
            <button class="btn btn-sm" id="closeCaseBtn">关闭</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('#closeCaseModal').addEventListener('click', () => overlay.remove());
    overlay.querySelector('#closeCaseBtn').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if(e.target === overlay) overlay.remove(); });

    if(linkedScene){
      overlay.querySelector('#caseToScene').addEventListener('click', () => {
        overlay.remove();
        App.showScenarioDetail(linkedScene);
      });
    }
  },

  /* ===== 联机对战 ===== */

  /* 联机对战状态 */
  mpState: {
    phase: 'lobby',          /* lobby | room | game | results */
    selectedScenarioId: 'taiwan_strait',
    roomCode: null,
    side: null,
    ready: false,
    playerInfo: {},
    gameRound: 0,
    maxRounds: 0,
    scores: { red: 0, blue: 0 },
    domains: {},
    escalation: 1,
    selectedActions: [],
    actionPoints: 5,
    maxAP: 5,
    submitted: false,
    opponentSubmitted: false,
    lastResolution: null,
    directorMessages: [],
    chatMessages: [],
    gameResult: null,
    latency: 0,
    connected: false,
    roomList: [],
    showScenarioPicker: false,
  },

  /* 联机对战：获取可用战略行动（独立于Wargame对象） */
  getMPActions(){
    const scenarioId = this.mpState.selectedScenarioId;
    const sc = (typeof SCENARIOS !== 'undefined') ? SCENARIOS.find(s => s.id === scenarioId) : null;
    if(!sc) return [];
    const sideColor = this.mpState.side || 'red';
    const responseDomains = sc.response || ['military','diplomatic','economic'];
    const allowed = [...new Set([...responseDomains, 'domestic'])];
    const general = (typeof STRATEGIC_ACTIONS !== 'undefined') ? STRATEGIC_ACTIONS.filter(a => a.scenario === null && allowed.includes(a.domain)) : [];
    const special = (typeof STRATEGIC_ACTIONS !== 'undefined') ? STRATEGIC_ACTIONS.filter(a => {
      if(a.scenario !== sc.id) return false;
      if(a.side) return a.side === sideColor;
      return sideColor === 'red';
    }) : [];
    return [...general, ...special];
  },

  /* 联机对战：获取场景双方信息 */
  getMPSides(){
    const scenarioId = this.mpState.selectedScenarioId;
    if(typeof getScenarioSides === 'function') return getScenarioSides(scenarioId);
    return null;
  },

  /* 联机对战：注册回调 */
  mpCallbacksRegistered: false,
  registerMPCallbacks(){
    if(this.mpCallbacksRegistered) return;
    this.mpCallbacksRegistered = true;
    const mp = typeof Multiplayer !== 'undefined' ? Multiplayer : null;
    if(!mp) return;

    mp.onConnect = () => {
      this.mpState.connected = true;
      this.refreshMP();
    };
    mp.onDisconnect = () => {
      this.mpState.connected = false;
      this.mpState.phase = 'lobby';
      this.mpState.roomCode = null;
      this.refreshMP();
    };
    mp.onRoomCreated = (msg) => {
      this.mpState.phase = 'room';
      this.mpState.roomCode = msg.roomCode;
      this.mpState.playerInfo = msg.playerInfo || {};
      this.refreshMP();
    };
    mp.onRoomJoined = (msg) => {
      this.mpState.phase = 'room';
      this.mpState.roomCode = msg.roomCode;
      this.mpState.playerInfo = msg.playerInfo || {};
      this.refreshMP();
    };
    mp.onOpponentJoined = (msg) => {
      this.mpState.playerInfo = msg.playerInfo || {};
      this.mpState.chatMessages.push({ system: true, text: `${msg.name} 加入了房间`, ts: Date.now() });
      this.refreshMP();
    };
    mp.onOpponentLeft = (msg) => {
      this.mpState.playerInfo[msg.playerId] = undefined;
      this.mpState.chatMessages.push({ system: true, text: `${msg.name} 离开了房间`, ts: Date.now() });
      if(this.mpState.phase === 'game' || this.mpState.phase === 'room'){
        this.mpState.phase = 'lobby';
        this.mpState.roomCode = null;
      }
      this.refreshMP();
    };
    mp.onSideSelected = (msg) => {
      this.mpState.playerInfo = msg.playerInfo || {};
      this.refreshMP();
    };
    mp.onPlayerReady = (msg) => {
      this.mpState.playerInfo = msg.playerInfo || {};
      this.refreshMP();
    };
    mp.onGameStarted = (msg) => {
      this.mpState.phase = 'game';
      this.mpState.gameRound = 1;
      this.mpState.maxRounds = msg.gameState.maxRounds;
      this.mpState.scores = msg.gameState.scores;
      this.mpState.domains = msg.gameState.domains;
      this.mpState.escalation = msg.gameState.escalation;
      this.mpState.selectedActions = [];
      this.mpState.actionPoints = 5;
      this.mpState.maxAP = 5;
      this.mpState.submitted = false;
      this.mpState.opponentSubmitted = false;
      this.mpState.lastResolution = null;
      this.mpState.gameResult = null;
      this.refreshMP();
    };
    mp.onDirectorEvent = (msg) => {
      this.mpState.directorMessages.push({
        round: msg.round,
        title: msg.event.title,
        desc: msg.event.desc,
        severity: msg.event.severity,
        message: msg.directorMessage,
        ts: Date.now(),
      });
      this.refreshMP();
    };
    mp.onActionSubmitted = (msg) => {
      this.mpState.opponentSubmitted = true;
      this.refreshMP();
    };
    mp.onRoundResolution = (msg) => {
      this.mpState.lastResolution = msg.resolution;
      this.mpState.scores = msg.resolution.totalScores;
      this.mpState.domains = msg.resolution.domains;
      this.mpState.escalation = msg.resolution.escalation;
      this.mpState.directorMessages.push({
        round: msg.round,
        message: msg.directorMessage,
        ts: Date.now(),
      });
      this.refreshMP();
    };
    mp.onNextRound = (msg) => {
      this.mpState.gameRound = msg.round;
      this.mpState.scores = msg.scores;
      this.mpState.domains = msg.domains;
      this.mpState.escalation = msg.escalation;
      this.mpState.selectedActions = [];
      this.mpState.actionPoints = 5;
      this.mpState.submitted = false;
      this.mpState.opponentSubmitted = false;
      this.mpState.lastResolution = null;
      this.refreshMP();
    };
    mp.onGameEnd = (msg) => {
      this.mpState.phase = 'results';
      this.mpState.gameResult = msg;
      this.mpState.scores = msg.finalScores;
      this.mpState.directorMessages.push({
        message: msg.directorMessage,
        ts: Date.now(),
      });
      this.refreshMP();
    };
    mp.onChat = (msg) => {
      this.mpState.chatMessages.push({
        name: msg.name,
        side: msg.side,
        text: msg.text,
        ts: msg.timestamp,
      });
      this.refreshMP();
    };
    mp.onRoomList = (rooms) => {
      this.mpState.roomList = rooms || [];
      if(this.mpState.phase === 'lobby') this.refreshMP();
    };
    mp.onError = (msg) => {
      console.warn('[MP Error]', msg.message);
      /* 用toast提示错误 */
      const toast = document.createElement('div');
      toast.style.cssText = 'position:fixed;top:20px;right:20px;padding:12px 20px;background:rgba(255,71,87,.15);border:1px solid rgba(255,71,87,.4);border-radius:6px;color:#ff4757;font-size:13px;z-index:10000;max-width:300px';
      toast.textContent = msg.message || '服务器错误';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 4000);
    };
  },

  /* 联机对战：刷新UI */
  refreshMP(){
    const content = document.getElementById('tabContent');
    if(!content) return;
    /* 检查当前是否在联机对战标签页 */
    const activeTab = document.querySelector('.nav-item.active');
    if(activeTab && activeTab.dataset.tab !== 'multiplayer') return;
    content.innerHTML = this.renderMultiplayer();
    this.initMultiplayerTab();
  },

  renderMultiplayer(){
    const mp = typeof Multiplayer !== 'undefined' ? Multiplayer : null;
    const connected = mp && mp.connected;
    this.mpState.connected = connected;
    this.mpState.latency = mp ? mp.latency : 0;

    /* 注册回调（仅一次） */
    this.registerMPCallbacks();

    /* 同步room信息 */
    if(mp && mp.room){
      this.mpState.roomCode = mp.room.code;
      if(mp.room.playerInfo) this.mpState.playerInfo = mp.room.playerInfo;
      if(mp.room.gameState){
        this.mpState.gameRound = mp.room.gameState.round || this.mpState.gameRound;
        this.mpState.maxRounds = mp.room.gameState.maxRounds || this.mpState.maxRounds;
        this.mpState.scores = mp.room.gameState.scores || this.mpState.scores;
        this.mpState.domains = mp.room.gameState.domains || this.mpState.domains;
        this.mpState.escalation = mp.room.gameState.escalation || this.mpState.escalation;
      }
    }

    const phase = this.mpState.phase;

    if(phase === 'game') return this._renderMPGame();
    if(phase === 'results') return this._renderMPResults();
    if(phase === 'room') return this._renderMPRoom();
    return this._renderMPLobby();
  },

  /* ===== 联机大厅 ===== */
  _renderMPLobby(){
    const connected = this.mpState.connected;
    const latency = this.mpState.latency;
    const scenarios = (typeof SCENARIOS !== 'undefined') ? SCENARIOS : [];
    const selSc = scenarios.find(s => s.id === this.mpState.selectedScenarioId) || scenarios[0];
    const rooms = this.mpState.roomList || [];

    return `
    <div class="fade-in">
      <!-- 标题 -->
      <div class="panel" style="margin-bottom:16px;padding:16px 20px">
        <div style="display:flex;align-items:center;gap:12px">
          <span style="font-size:28px">🌐</span>
          <div>
            <div style="font-size:16px;font-weight:700;color:var(--cyan)">跨区域联机对弈系统</div>
            <div style="font-size:13px;color:var(--txt-2);margin-top:2px">真实跨浏览器实时对弈 · AI担任导调方</div>
          </div>
          <span style="margin-left:auto;font-size:12px;padding:3px 10px;border-radius:3px;background:${connected ? 'rgba(46,213,115,.1)' : 'rgba(255,71,87,.1)'};color:${connected ? 'var(--green)' : 'var(--red)'};border:1px solid ${connected ? 'rgba(46,213,115,.2)' : 'rgba(255,71,87,.2)'}">
            ${connected ? '● 已连接' + (latency > 0 ? ` · ${latency}ms` : '') : '● 未连接'}
          </span>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
        <!-- 场景选择 + 创建房间 -->
        <div class="panel">
          <div class="panel-header"><div class="panel-title">🏠 创建房间</div></div>
          <div class="panel-body" style="padding:16px">
            <div style="margin-bottom:12px">
              <label style="font-size:12px;color:var(--txt-2);display:block;margin-bottom:6px">选择推演场景</label>
              <select id="mpScenarioSelect" style="width:100%;padding:8px 10px;background:rgba(8,20,40,.6);border:1px solid var(--border-mid);border-radius:5px;color:var(--txt-0);font-size:13px">
                ${scenarios.map(s => `<option value="${s.id}" ${s.id === this.mpState.selectedScenarioId ? 'selected' : ''}>${s.name}（${s.duration}轮 · 难度${s.difficulty}）</option>`).join('')}
              </select>
            </div>
            ${selSc ? `
            <div style="background:rgba(0,180,216,.06);border-radius:6px;padding:10px;margin-bottom:12px;font-size:12px;color:var(--txt-1);line-height:1.6">
              <div style="color:var(--cyan);font-weight:600;margin-bottom:4px">${selSc.name}</div>
              <div style="color:var(--txt-2)">${selSc.background ? selSc.background.substring(0, 80) + '...' : ''}</div>
              <div style="margin-top:6px;display:flex;gap:12px;flex-wrap:wrap">
                <span style="color:var(--amber)">预算: ${selSc.budget}</span>
                <span style="color:var(--purple)">轮次: ${selSc.duration}</span>
                <span style="color:var(--green)">密级: ${selSc.classification}</span>
              </div>
            </div>` : ''}
            <button class="btn btn-sm" id="mpCreateRoom" style="width:100%;padding:10px;font-size:13px;justify-content:center" ${!connected ? 'disabled' : ''}>🏠 创建房间</button>
            <button class="btn btn-sm" id="mpQuickMatch" style="width:100%;padding:10px;font-size:13px;justify-content:center;margin-top:8px;border-color:var(--cyan);color:var(--cyan)" ${!connected ? 'disabled' : ''}>⚡ 快速匹配（公开房间）</button>
          </div>
        </div>

        <!-- 加入房间 -->
        <div class="panel">
          <div class="panel-header"><div class="panel-title">🔑 加入房间</div></div>
          <div class="panel-body" style="padding:16px">
            <div style="margin-bottom:12px">
              <label style="font-size:12px;color:var(--txt-2);display:block;margin-bottom:6px">输入6位房间号</label>
              <input type="text" id="mpJoinInput" placeholder="ABCDEF" maxlength="6"
                style="width:100%;padding:10px;background:rgba(8,20,40,.6);border:1px solid var(--border-mid);border-radius:5px;color:var(--txt-0);font-size:18px;font-family:Consolas,monospace;letter-spacing:4px;text-align:center;text-transform:uppercase">
            </div>
            <button class="btn btn-sm btn-amber" id="mpJoinConfirm" style="width:100%;padding:10px;font-size:13px;justify-content:center" ${!connected ? 'disabled' : ''}>确认加入</button>
            ${!connected ? `<div style="margin-top:12px;padding:8px;background:rgba(255,71,87,.08);border-radius:5px;font-size:12px;color:var(--red);text-align:center">⚠ 服务器未连接，请确保联机服务器已启动</div>` : ''}
          </div>
        </div>
      </div>

      <!-- 公开房间列表 -->
      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">📡 公开房间</div>
          <span style="font-size:12px;color:var(--txt-2)">${rooms.length}个可加入房间</span>
        </div>
        <div class="panel-body" style="padding:16px" id="mpRoomList">
          ${rooms.length === 0
            ? '<div style="text-align:center;padding:20px;color:var(--txt-2);font-size:13px">暂无公开房间，创建一个公开房间开始对弈吧</div>'
            : rooms.map(r => `
              <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:rgba(0,180,216,.06);border-radius:6px;border:1px solid var(--border);margin-bottom:8px">
                <div style="display:flex;align-items:center;gap:12px">
                  <span style="font-size:15px;font-weight:700;color:var(--cyan);font-family:Consolas,monospace;letter-spacing:2px">${r.code}</span>
                  <span style="font-size:12px;color:var(--txt-2)">${r.scenario ? r.scenario.name : '未知场景'}</span>
                </div>
                <div style="display:flex;align-items:center;gap:10px">
                  <span style="font-size:12px;color:var(--amber)">${r.playerCount}/2</span>
                  <button class="btn btn-sm mpJoinPublicBtn" data-code="${r.code}" style="font-size:12px;padding:4px 10px">加入</button>
                </div>
              </div>
            `).join('')
          }
        </div>
      </div>

      <!-- 对弈流程 -->
      <div class="panel" style="margin-top:16px">
        <div class="panel-header"><div class="panel-title">📋 联机对弈流程</div></div>
        <div class="panel-body" style="padding:16px">
          <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px">
            <div class="mp-flow-step">
              <div class="mp-fs-num">1</div>
              <div class="mp-fs-icon">🏠</div>
              <div class="mp-fs-title">创建/加入房间</div>
              <div class="mp-fs-desc">选择场景创建房间，或输入房间号加入</div>
            </div>
            <div class="mp-flow-step">
              <div class="mp-fs-num">2</div>
              <div class="mp-fs-icon">⚔️</div>
              <div class="mp-fs-title">选择阵营</div>
              <div class="mp-fs-desc">红方/蓝方各自选择阵营并准备</div>
            </div>
            <div class="mp-flow-step">
              <div class="mp-fs-num">3</div>
              <div class="mp-fs-icon">🎯</div>
              <div class="mp-fs-title">AI导调推送</div>
              <div class="mp-fs-desc">AI导调方推送态势、情报和事件</div>
            </div>
            <div class="mp-flow-step">
              <div class="mp-fs-num">4</div>
              <div class="mp-fs-icon">🎲</div>
              <div class="mp-fs-title">双方行动</div>
              <div class="mp-fs-desc">各自选择战略行动，实时同步状态</div>
            </div>
            <div class="mp-flow-step">
              <div class="mp-fs-num">5</div>
              <div class="mp-fs-icon">📊</div>
              <div class="mp-fs-title">AI裁决+复盘</div>
              <div class="mp-fs-desc">AI骰子裁决，推演结束后生成复盘</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    `;
  },

  /* ===== 房间等待大厅 ===== */
  _renderMPRoom(){
    const roomCode = this.mpState.roomCode || '------';
    const playerInfo = this.mpState.playerInfo || {};
    const playerList = Object.entries(playerInfo);
    const myPlayerId = (typeof Multiplayer !== 'undefined') ? Multiplayer.playerId : null;
    const sides = this.getMPSides();
    const chatHtml = this._renderMPChat();
    const directorHtml = this._renderMPDirector();

    /* 检查双方是否都已选择阵营和准备 */
    const playerCount = playerList.length;
    const allReady = playerCount >= 2 && playerList.every(([_, info]) => info.ready && info.side);

    return `
    <div class="fade-in">
      <!-- 房间信息 -->
      <div class="panel" style="margin-bottom:16px;padding:16px 20px">
        <div style="display:flex;align-items:center;gap:16px">
          <div>
            <div style="font-size:12px;color:var(--txt-2)">房间号</div>
            <div style="font-size:22px;font-weight:700;color:var(--cyan);font-family:Consolas,monospace;letter-spacing:3px">${roomCode}</div>
          </div>
          <div style="margin-left:auto;display:flex;gap:8px">
            <button class="btn btn-sm" id="mpCopyCode" style="font-size:12px;padding:6px 12px">📋 复制房间号</button>
            <button class="btn btn-sm" id="mpLeaveRoom" style="font-size:12px;padding:6px 12px;border-color:var(--red);color:var(--red)">退出房间</button>
          </div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 320px;gap:16px">
        <div>
          <!-- 玩家信息 -->
          <div class="panel" style="margin-bottom:16px">
            <div class="panel-header"><div class="panel-title">👥 房间玩家（${playerCount}/2）</div></div>
            <div class="panel-body" style="padding:16px">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
                ${this._renderMPPlayerSlot(0, playerList, myPlayerId, sides)}
                ${this._renderMPPlayerSlot(1, playerList, myPlayerId, sides)}
              </div>
            </div>
          </div>

          <!-- 阵营选择 -->
          ${playerCount >= 2 ? this._renderMPSideSelection(playerList, myPlayerId, sides) : `
          <div class="panel">
            <div class="panel-body" style="padding:30px;text-align:center">
              <div style="font-size:36px;margin-bottom:12px">⏳</div>
              <div style="font-size:14px;color:var(--txt-1)">等待对手加入房间...</div>
              <div style="font-size:12px;color:var(--txt-2);margin-top:6px">将房间号 <span style="color:var(--cyan);font-family:Consolas,monospace;font-weight:700">${roomCode}</span> 分享给对手</div>
            </div>
          </div>`}

          ${directorHtml}
        </div>

        <!-- 聊天面板 -->
        <div>
          ${chatHtml}
        </div>
      </div>
    </div>
    `;
  },

  /* ===== 渲染玩家槽位 ===== */
  _renderMPPlayerSlot(idx, playerList, myPlayerId, sides){
    const entry = playerList[idx];
    if(!entry){
      return `
      <div style="padding:16px;background:rgba(8,20,40,.4);border:1px dashed var(--border);border-radius:8px;text-align:center">
        <div style="font-size:32px;opacity:.3;margin-bottom:8px">👤</div>
        <div style="font-size:12px;color:var(--txt-2)">等待玩家加入</div>
      </div>`;
    }
    const [pid, info] = entry;
    const isMe = pid === myPlayerId;
    const sideLabel = info.side === 'red' ? '红方' : info.side === 'blue' ? '蓝方' : '未选择';
    const sideColor = info.side === 'red' ? 'var(--red)' : info.side === 'blue' ? 'var(--cyan)' : 'var(--txt-2)';

    return `
    <div style="padding:14px;background:rgba(0,180,216,.06);border:1px solid ${info.ready ? 'var(--green)' : 'var(--border)'};border-radius:8px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <div style="width:36px;height:36px;border-radius:50%;background:${sideColor};display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:#fff">${(info.name || '?')[0]}</div>
        <div>
          <div style="font-size:14px;font-weight:600;color:var(--txt-0)">${info.name || '未知'} ${isMe ? '<span style="font-size:11px;color:var(--cyan)">（我）</span>' : ''}</div>
          <div style="font-size:11px;color:${sideColor}">${sideLabel}</div>
        </div>
        ${info.ready ? '<span style="margin-left:auto;font-size:11px;padding:2px 8px;border-radius:3px;background:rgba(46,213,115,.1);color:var(--green)">✓ 已准备</span>' : ''}
      </div>
    </div>`;
  },

  /* ===== 阵营选择 ===== */
  _renderMPSideSelection(playerList, myPlayerId, sides){
    const myEntry = playerList.find(([pid]) => pid === myPlayerId);
    const myInfo = myEntry ? myEntry[1] : {};
    const redSide = sides ? sides.red : { name: '红方', faction: '中国', desc: '维护国家主权和领土完整' };
    const blueSide = sides ? sides.blue : { name: '蓝方', faction: '对手', desc: '挑战方' };
    const mySide = this.mpState.side || myInfo.side;

    return `
    <div class="panel">
      <div class="panel-header"><div class="panel-title">⚔️ 阵营选择</div></div>
      <div class="panel-body" style="padding:16px">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
          <!-- 红方 -->
          <div style="padding:14px;background:${mySide === 'red' ? 'rgba(255,71,87,.12)' : 'rgba(8,20,40,.4)'};border:2px solid ${mySide === 'red' ? 'var(--red)' : 'var(--border)'};border-radius:8px;cursor:pointer" class="mpSideBtn" data-side="red">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
              <span style="font-size:20px">🔴</span>
              <span style="font-size:15px;font-weight:700;color:var(--red)">${redSide.name || '红方'}</span>
              ${mySide === 'red' ? '<span style="margin-left:auto;font-size:12px;color:var(--red)">✓ 已选</span>' : ''}
            </div>
            <div style="font-size:12px;color:var(--txt-1);line-height:1.6">
              <div style="color:var(--cyan);font-weight:600">${redSide.faction || '中国'}</div>
              <div style="color:var(--txt-2);margin-top:4px">${redSide.desc || '维护国家利益'}</div>
              ${redSide.nonStateActor ? '<div style="color:var(--amber);margin-top:4px">⚠ 非国家行为体</div>' : ''}
            </div>
          </div>
          <!-- 蓝方 -->
          <div style="padding:14px;background:${mySide === 'blue' ? 'rgba(0,180,216,.12)' : 'rgba(8,20,40,.4)'};border:2px solid ${mySide === 'blue' ? 'var(--cyan)' : 'var(--border)'};border-radius:8px;cursor:pointer" class="mpSideBtn" data-side="blue">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
              <span style="font-size:20px">🔵</span>
              <span style="font-size:15px;font-weight:700;color:var(--cyan)">${blueSide.name || '蓝方'}</span>
              ${mySide === 'blue' ? '<span style="margin-left:auto;font-size:12px;color:var(--cyan)">✓ 已选</span>' : ''}
            </div>
            <div style="font-size:12px;color:var(--txt-1);line-height:1.6">
              <div style="color:var(--cyan);font-weight:600">${blueSide.faction || '对手'}</div>
              <div style="color:var(--txt-2);margin-top:4px">${blueSide.desc || '挑战方'}</div>
              ${blueSide.nonStateActor ? '<div style="color:var(--amber);margin-top:4px">⚠ 非国家行为体</div>' : ''}
            </div>
          </div>
        </div>
        <button class="btn btn-sm ${myInfo.ready ? '' : 'btn-amber'}" id="mpReadyBtn" style="width:100%;padding:10px;font-size:14px;justify-content:center" ${!mySide ? 'disabled' : ''}>
          ${myInfo.ready ? '✓ 已准备 — 点击取消' : '准备就绪'}
        </button>
      </div>
    </div>`;
  },

  /* ===== 游戏阶段 ===== */
  _renderMPGame(){
    const round = this.mpState.gameRound;
    const maxRounds = this.mpState.maxRounds;
    const scores = this.mpState.scores;
    const domains = this.mpState.domains;
    const escalation = this.mpState.escalation;
    const submitted = this.mpState.submitted;
    const opponentSubmitted = this.mpState.opponentSubmitted;
    const lastRes = this.mpState.lastResolution;
    const selSc = (typeof SCENARIOS !== 'undefined') ? SCENARIOS.find(s => s.id === this.mpState.selectedScenarioId) : null;
    const mySide = this.mpState.side || 'red';
    const myScore = scores[mySide] || 0;
    const oppSide = mySide === 'red' ? 'blue' : 'red';
    const oppScore = scores[oppSide] || 0;
    const chatHtml = this._renderMPChat();
    const directorHtml = this._renderMPDirector();
    const actions = submitted ? [] : this.getMPActions();
    const selActions = this.mpState.selectedActions || [];
    const ap = this.mpState.actionPoints;

    /* 升级度标签 */
    const escLabels = ['克制', '紧张', '对峙', '危机', '战争边缘'];
    const escLabel = escLabels[Math.min(escalation - 1, 4)] || '未知';

    return `
    <div class="fade-in">
      <!-- 游戏状态栏 -->
      <div class="panel" style="margin-bottom:16px;padding:14px 20px">
        <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap">
          <div>
            <div style="font-size:11px;color:var(--txt-2)">场景</div>
            <div style="font-size:14px;font-weight:600;color:var(--cyan)">${selSc ? selSc.name : '未知'}</div>
          </div>
          <div>
            <div style="font-size:11px;color:var(--txt-2)">轮次</div>
            <div style="font-size:16px;font-weight:700;color:var(--amber);font-family:Consolas,monospace">${round}/${maxRounds}</div>
          </div>
          <div>
            <div style="font-size:11px;color:var(--txt-2)">我方（${mySide === 'red' ? '红方' : '蓝方'}）</div>
            <div style="font-size:16px;font-weight:700;color:${mySide === 'red' ? 'var(--red)' : 'var(--cyan)'};font-family:Consolas,monospace">${myScore}</div>
          </div>
          <div>
            <div style="font-size:11px;color:var(--txt-2)">对方（${oppSide === 'red' ? '红方' : '蓝方'}）</div>
            <div style="font-size:16px;font-weight:700;color:${oppSide === 'red' ? 'var(--red)' : 'var(--cyan)'};font-family:Consolas,monospace">${oppScore}</div>
          </div>
          <div>
            <div style="font-size:11px;color:var(--txt-2)">态势</div>
            <div style="font-size:13px;font-weight:600;color:${escalation >= 4 ? 'var(--red)' : escalation >= 3 ? 'var(--amber)' : 'var(--green)'}">${escLabel}</div>
          </div>
          <div style="margin-left:auto;display:flex;gap:8px">
            <button class="btn btn-sm" id="mpResign" style="font-size:12px;padding:6px 12px;border-color:var(--red);color:var(--red)">🏳️ 投降</button>
          </div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 320px;gap:16px">
        <div>
          ${directorHtml}

          ${lastRes ? this._renderMPResolution(lastRes, mySide) : ''}

          ${!submitted ? `
          <!-- 行动选择 -->
          <div class="panel" style="margin-top:16px">
            <div class="panel-header">
              <div class="panel-title">🎯 战略行动选择</div>
              <span style="font-size:12px;color:${ap > 0 ? 'var(--cyan)' : 'var(--red)'}">行动点: ${ap}/${this.mpState.maxAP}</span>
            </div>
            <div class="panel-body" style="padding:12px">
              <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:8px;max-height:400px;overflow-y:auto;padding:4px">
                ${actions.map(a => {
                  const isSelected = selActions.find(x => x.id === a.id);
                  const cost = a.cost || 1;
                  const canAfford = ap >= cost;
                  return `
                  <div class="mp-action-card ${isSelected ? 'selected' : ''}" data-id="${a.id}" style="padding:10px;background:${isSelected ? 'rgba(0,180,216,.15)' : 'rgba(8,20,40,.4)'};border:1px solid ${isSelected ? 'var(--cyan)' : 'var(--border)'};border-radius:6px;cursor:${canAfford ? 'pointer' : 'not-allowed'};opacity:${canAfford ? 1 : 0.4};transition:all .2s">
                    <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:4px">
                      <span style="font-size:13px;font-weight:600;color:var(--txt-0)">${a.name}</span>
                      <span style="font-size:10px;padding:1px 5px;border-radius:3px;background:rgba(0,180,216,.1);color:var(--cyan)">${cost}AP</span>
                    </div>
                    <div style="font-size:11px;color:var(--txt-2);line-height:1.4">${a.desc ? a.desc.substring(0, 50) : ''}</div>
                    <div style="font-size:10px;color:var(--amber);margin-top:4px">域: ${a.domain || '通用'} · 风险: ${Math.round((a.risk || 0) * 100)}%</div>
                  </div>`;
                }).join('')}
              </div>
              <div style="margin-top:12px;display:flex;gap:8px;align-items:center">
                <span style="font-size:12px;color:var(--txt-2)">已选 ${selActions.length} 个行动</span>
                <button class="btn btn-sm" id="mpClearActions" style="font-size:12px;padding:6px 10px">清空</button>
                <button class="btn btn-sm btn-amber" id="mpSubmitActions" style="margin-left:auto;padding:8px 20px;font-size:13px;justify-content:center" ${selActions.length === 0 ? 'disabled' : ''}>⚔️ 提交行动</button>
              </div>
            </div>
          </div>` : `
          <!-- 等待对方 -->
          <div class="panel" style="margin-top:16px">
            <div class="panel-body" style="padding:30px;text-align:center">
              <div style="font-size:36px;margin-bottom:12px">${opponentSubmitted ? '🎲' : '⏳'}</div>
              <div style="font-size:14px;color:var(--cyan);font-weight:600">
                ${opponentSubmitted ? '双方均已提交行动，AI导调方裁决中...' : '已提交行动，等待对方决策...'}
              </div>
              <div style="font-size:12px;color:var(--txt-2);margin-top:6px">已选行动: ${selActions.map(a => a.name).join('、 ')}</div>
            </div>
          </div>`}
        </div>

        <!-- 聊天面板 -->
        <div>
          ${chatHtml}
        </div>
      </div>
    </div>
    `;
  },

  /* ===== 渲染裁决结果 ===== */
  _renderMPResolution(res, mySide){
    const myResults = mySide === 'red' ? res.redResults : res.blueResults;
    const oppResults = mySide === 'red' ? res.blueResults : res.redResults;
    const myRoundScore = mySide === 'red' ? res.redScore : res.blueScore;
    const oppRoundScore = mySide === 'red' ? res.blueScore : res.redScore;

    const outcomeLabel = (o) => o === 'great' ? '<span style="color:var(--green)">大成功</span>' : o === 'success' ? '<span style="color:var(--cyan)">成功</span>' : '<span style="color:var(--red)">失败</span>';

    return `
    <div class="panel" style="margin-top:16px;border-color:var(--cyan)">
      <div class="panel-header"><div class="panel-title">🎲 第${res.round || this.mpState.gameRound - 1}轮裁决结果</div></div>
      <div class="panel-body" style="padding:16px">
        <!-- 本轮得分 -->
        <div style="display:flex;justify-content:space-around;margin-bottom:16px;padding:12px;background:rgba(0,180,216,.06);border-radius:8px">
          <div style="text-align:center">
            <div style="font-size:12px;color:var(--txt-2)">我方本轮</div>
            <div style="font-size:24px;font-weight:700;color:var(--green);font-family:Consolas,monospace">+${myRoundScore}</div>
          </div>
          <div style="font-size:20px;color:var(--txt-2);align-self:center">VS</div>
          <div style="text-align:center">
            <div style="font-size:12px;color:var(--txt-2)">对方本轮</div>
            <div style="font-size:24px;font-weight:700;color:var(--red);font-family:Consolas,monospace">+${oppRoundScore}</div>
          </div>
        </div>

        <!-- 行动详情 -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div>
            <div style="font-size:12px;color:var(--cyan);font-weight:600;margin-bottom:6px">我方行动</div>
            ${myResults.map(r => `
              <div style="padding:6px 8px;background:rgba(8,20,40,.4);border-radius:4px;margin-bottom:4px;font-size:12px">
                <div style="display:flex;justify-content:space-between">
                  <span style="color:var(--txt-0)">${r.action.name}</span>
                  ${outcomeLabel(r.outcome)}
                </div>
                <div style="color:var(--txt-2);font-size:10px">骰子: ${r.roll}/${r.successRate}</div>
              </div>
            `).join('')}
          </div>
          <div>
            <div style="font-size:12px;color:var(--amber);font-weight:600;margin-bottom:6px">对方行动</div>
            ${oppResults.map(r => `
              <div style="padding:6px 8px;background:rgba(8,20,40,.4);border-radius:4px;margin-bottom:4px;font-size:12px">
                <div style="display:flex;justify-content:space-between">
                  <span style="color:var(--txt-0)">${r.action.name}</span>
                  ${outcomeLabel(r.outcome)}
                </div>
                <div style="color:var(--txt-2);font-size:10px">骰子: ${r.roll}/${r.successRate}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 六域变化 -->
        <div style="margin-top:12px;display:flex;flex-wrap:wrap;gap:6px">
          ${Object.entries(res.domainChanges || {}).map(([d, v]) => {
            const domainLabels = { military:'军事', economic:'经济', cyber:'网络', diplomatic:'外交', information:'信息', domestic:'国内' };
            const color = v > 0 ? 'var(--green)' : v < 0 ? 'var(--red)' : 'var(--txt-2)';
            return `<span style="font-size:11px;padding:2px 8px;background:rgba(8,20,40,.4);border-radius:3px;color:var(--txt-1)">${domainLabels[d] || d} <span style="color:${color};font-weight:600">${v > 0 ? '+' : ''}${v}</span></span>`;
          }).join('')}
        </div>
      </div>
    </div>`;
  },

  /* ===== 结果阶段 ===== */
  _renderMPResults(){
    const result = this.mpState.gameResult || {};
    const scores = result.finalScores || { red: 0, blue: 0 };
    const mySide = this.mpState.side || 'red';
    const myScore = scores[mySide] || 0;
    const oppSide = mySide === 'red' ? 'blue' : 'red';
    const oppScore = scores[oppSide] || 0;
    let myResult;
    if(result.resign){
      myResult = result.resignSide === mySide ? 'defeat' : 'victory';
    } else if(result.forfeit){
      myResult = 'victory';
    } else {
      const winnerSide = result.result === 'red_victory' ? 'red' : result.result === 'blue_victory' ? 'blue' : null;
      myResult = !winnerSide ? 'draw' : winnerSide === mySide ? 'victory' : 'defeat';
    }

    const resultLabel = myResult === 'victory' ? '🎉 胜利' : myResult === 'defeat' ? '📉 失败' : '🤝 平局';
    const resultColor = myResult === 'victory' ? 'var(--green)' : myResult === 'defeat' ? 'var(--red)' : 'var(--amber)';

    return `
    <div class="fade-in">
      <div class="panel" style="padding:40px 20px;text-align:center;margin-bottom:16px">
        <div style="font-size:48px;margin-bottom:16px">${myResult === 'victory' ? '🏆' : myResult === 'defeat' ? '⚔️' : '🤝'}</div>
        <div style="font-size:28px;font-weight:700;color:${resultColor};margin-bottom:12px">${resultLabel}</div>
        <div style="font-size:14px;color:var(--txt-1);margin-bottom:20px">${result.directorMessage || '推演结束'}</div>
        <div style="display:flex;justify-content:center;gap:40px;padding:16px;background:rgba(0,180,216,.06);border-radius:8px">
          <div>
            <div style="font-size:12px;color:var(--txt-2)">我方（${mySide === 'red' ? '红方' : '蓝方'}）</div>
            <div style="font-size:32px;font-weight:700;color:${mySide === 'red' ? 'var(--red)' : 'var(--cyan)'};font-family:Consolas,monospace">${myScore}</div>
          </div>
          <div style="font-size:24px;color:var(--txt-2);align-self:center">:</div>
          <div>
            <div style="font-size:12px;color:var(--txt-2)">对方（${oppSide === 'red' ? '红方' : '蓝方'}）</div>
            <div style="font-size:32px;font-weight:700;color:${oppSide === 'red' ? 'var(--red)' : 'var(--cyan)'};font-family:Consolas,monospace">${oppScore}</div>
          </div>
        </div>
      </div>

      <!-- 推演日志 -->
      <div class="panel" style="margin-bottom:16px">
        <div class="panel-header"><div class="panel-title">📋 推演日志</div></div>
        <div class="panel-body" style="padding:12px;max-height:300px;overflow-y:auto">
          ${(result.log || []).map(l => `
            <div style="padding:8px 10px;background:rgba(8,20,40,.4);border-radius:4px;margin-bottom:6px;font-size:12px">
              <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                <span style="color:var(--cyan);font-weight:600">第${l.round}轮</span>
                <span style="color:var(--txt-2)">红${l.redScore} : 蓝${l.blueScore}</span>
              </div>
              <div style="color:var(--txt-1)">红方: ${l.redActions.join('、 ')}</div>
              <div style="color:var(--txt-1)">蓝方: ${l.blueActions.join('、 ')}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div style="text-align:center">
        <button class="btn btn-sm" id="mpBackToLobby" style="padding:10px 30px;font-size:14px;justify-content:center">返回大厅</button>
      </div>
    </div>
    `;
  },

  /* ===== 导调消息区 ===== */
  _renderMPDirector(){
    const msgs = this.mpState.directorMessages || [];
    if(msgs.length === 0) return '';
    const recent = msgs.slice(-3);
    return `
    <div class="panel" style="margin-top:16px">
      <div class="panel-header"><div class="panel-title">📡 AI导调方</div></div>
      <div class="panel-body" style="padding:12px;max-height:200px;overflow-y:auto">
        ${recent.map(m => `
          <div style="padding:8px 10px;background:rgba(0,180,216,.06);border-left:3px solid var(--cyan);border-radius:0 4px 4px 0;margin-bottom:6px;font-size:12px">
            ${m.title ? `<div style="color:${m.severity === 'high' ? 'var(--red)' : m.severity === 'medium' ? 'var(--amber)' : 'var(--green)'};font-weight:600;margin-bottom:2px">${m.title}</div>` : ''}
            <div style="color:var(--txt-1);line-height:1.5">${m.message || m.desc || ''}</div>
          </div>
        `).join('')}
      </div>
    </div>`;
  },

  /* ===== 聊天面板 ===== */
  _renderMPChat(){
    const msgs = this.mpState.chatMessages || [];
    return `
    <div class="panel">
      <div class="panel-header"><div class="panel-title">💬 聊天</div></div>
      <div class="panel-body" style="padding:0">
        <div id="mpChatBox" style="height:320px;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:6px">
          ${msgs.length === 0 ? '<div style="text-align:center;color:var(--txt-2);font-size:12px;padding:20px">暂无消息</div>' :
            msgs.map(m => {
              if(m.system){
                return `<div style="text-align:center;font-size:11px;color:var(--txt-2);padding:4px">--- ${m.text} ---</div>`;
              }
              const myPlayerId = (typeof Multiplayer !== 'undefined') ? Multiplayer.playerId : null;
              const isMe = m.name === (this._getMyName());
              return `
              <div style="display:flex;flex-direction:column;${isMe ? 'align-items:flex-end' : 'align-items:flex-start'}">
                <span style="font-size:10px;color:var(--txt-2);margin-bottom:2px">${m.name || '未知'} · ${m.side === 'red' ? '红方' : m.side === 'blue' ? '蓝方' : ''}</span>
                <div style="max-width:80%;padding:6px 10px;background:${isMe ? 'rgba(0,180,216,.15)' : 'rgba(8,20,40,.5)'};border-radius:8px;font-size:12px;color:var(--txt-0)">${this._esc(m.text || '')}</div>
              </div>`;
            }).join('')
          }
        </div>
        <div style="display:flex;gap:6px;padding:8px;border-top:1px solid var(--border)">
          <input type="text" id="mpChatInput" placeholder="输入消息..." maxlength="200"
            style="flex:1;padding:6px 10px;background:rgba(8,20,40,.6);border:1px solid var(--border-mid);border-radius:4px;color:var(--txt-0);font-size:12px">
          <button class="btn btn-sm" id="mpChatSend" style="font-size:12px;padding:6px 12px">发送</button>
        </div>
      </div>
    </div>`;
  },

  _getMyName(){
    if(typeof Multiplayer !== 'undefined' && Multiplayer.playerName) return Multiplayer.playerName;
    const session = localStorage.getItem('nss_wgs_session');
    if(session){
      try { return JSON.parse(session).name || '我'; } catch(e) {}
    }
    return '我';
  },

  _esc(s){
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  },

  /* 联机对战交互 */
  initMultiplayerTab(){
    const phase = this.mpState.phase;

    /* 大厅交互 */
    if(phase === 'lobby'){
      const scenarioSelect = document.getElementById('mpScenarioSelect');
      if(scenarioSelect){
        scenarioSelect.addEventListener('change', (e) => {
          this.mpState.selectedScenarioId = e.target.value;
          this.refreshMP();
        });
      }

      const createBtn = document.getElementById('mpCreateRoom');
      if(createBtn){
        createBtn.addEventListener('click', () => {
          if(typeof Multiplayer === 'undefined'){ alert('联机模块未加载'); return; }
          const sc = (typeof SCENARIOS !== 'undefined') ? SCENARIOS.find(s => s.id === this.mpState.selectedScenarioId) : null;
          if(!sc){ alert('请选择场景'); return; }
          const code = Multiplayer.createRoom(sc);
          if(!code){
            alert('无法连接服务器，请确保联机服务器已启动');
          }
        });
      }

      const quickBtn = document.getElementById('mpQuickMatch');
      if(quickBtn){
        quickBtn.addEventListener('click', () => {
          if(typeof Multiplayer === 'undefined'){ alert('联机模块未加载'); return; }
          const sc = (typeof SCENARIOS !== 'undefined') ? SCENARIOS.find(s => s.id === this.mpState.selectedScenarioId) : null;
          if(!sc){ alert('请选择场景'); return; }
          const code = Multiplayer.createPublicRoom(sc);
          if(!code){
            alert('无法连接服务器，请确保联机服务器已启动');
          }
        });
      }

      const joinConfirm = document.getElementById('mpJoinConfirm');
      if(joinConfirm){
        joinConfirm.addEventListener('click', () => {
          const input = document.getElementById('mpJoinInput');
          if(!input || input.value.length !== 6) return;
          if(typeof Multiplayer === 'undefined') return;
          const sc = (typeof SCENARIOS !== 'undefined') ? SCENARIOS.find(s => s.id === this.mpState.selectedScenarioId) : null;
          Multiplayer.joinRoom(input.value.toUpperCase(), sc);
        });
      }

      /* 公开房间加入按钮 */
      document.querySelectorAll('.mpJoinPublicBtn').forEach(btn => {
        btn.addEventListener('click', () => {
          const code = btn.dataset.code;
          if(!code || typeof Multiplayer === 'undefined') return;
          const sc = (typeof SCENARIOS !== 'undefined') ? SCENARIOS.find(s => s.id === this.mpState.selectedScenarioId) : null;
          Multiplayer.joinRoom(code, sc);
        });
      });
    }

    /* 房间交互 */
    if(phase === 'room'){
      const leaveBtn = document.getElementById('mpLeaveRoom');
      if(leaveBtn){
        leaveBtn.addEventListener('click', () => {
          if(typeof Multiplayer !== 'undefined') Multiplayer.leaveRoom();
          this.mpState.phase = 'lobby';
          this.mpState.roomCode = null;
          this.mpState.playerInfo = {};
          this.mpState.side = null;
          this.mpState.ready = false;
          this.mpState.directorMessages = [];
          this.refreshMP();
        });
      }

      const copyBtn = document.getElementById('mpCopyCode');
      if(copyBtn){
        copyBtn.addEventListener('click', () => {
          const code = this.mpState.roomCode;
          if(code){
            navigator.clipboard.writeText(code).then(() => {
              copyBtn.textContent = '✓ 已复制';
              setTimeout(() => copyBtn.textContent = '📋 复制房间号', 2000);
            }).catch(() => {
              /* 降级方案 */
              const ta = document.createElement('textarea');
              ta.value = code;
              document.body.appendChild(ta);
              ta.select();
              document.execCommand('copy');
              document.body.removeChild(ta);
              copyBtn.textContent = '✓ 已复制';
              setTimeout(() => copyBtn.textContent = '📋 复制房间号', 2000);
            });
          }
        });
      }

      /* 阵营选择 */
      document.querySelectorAll('.mpSideBtn').forEach(btn => {
        btn.addEventListener('click', () => {
          const side = btn.dataset.side;
          if(!side || typeof Multiplayer === 'undefined') return;
          this.mpState.side = side;
          Multiplayer.selectSide(side);
        });
      });

      /* 准备按钮 */
      const readyBtn = document.getElementById('mpReadyBtn');
      if(readyBtn){
        readyBtn.addEventListener('click', () => {
          if(typeof Multiplayer === 'undefined') return;
          const myEntry = Object.entries(this.mpState.playerInfo).find(([pid]) => pid === Multiplayer.playerId);
          const isReady = myEntry && myEntry[1].ready;
          this.mpState.ready = !isReady;
          Multiplayer.setReady(!isReady);
        });
      }

      /* 聊天 */
      this._initMPChat();
    }

    /* 游戏交互 */
    if(phase === 'game'){
      /* 行动选择 */
      document.querySelectorAll('.mp-action-card').forEach(card => {
        card.addEventListener('click', () => {
          if(this.mpState.submitted) return;
          const id = card.dataset.id;
          const action = this.getMPActions().find(a => a.id === id);
          if(!action) return;
          const cost = action.cost || 1;
          const idx = this.mpState.selectedActions.findIndex(a => a.id === id);
          if(idx >= 0){
            /* 取消选择 */
            this.mpState.selectedActions.splice(idx, 1);
            this.mpState.actionPoints += cost;
          } else {
            /* 选择 */
            if(this.mpState.actionPoints < cost) return;
            this.mpState.selectedActions.push(action);
            this.mpState.actionPoints -= cost;
          }
          this.refreshMP();
        });
      });

      /* 清空行动 */
      const clearBtn = document.getElementById('mpClearActions');
      if(clearBtn){
        clearBtn.addEventListener('click', () => {
          this.mpState.selectedActions = [];
          this.mpState.actionPoints = this.mpState.maxAP;
          this.refreshMP();
        });
      }

      /* 提交行动 */
      const submitBtn = document.getElementById('mpSubmitActions');
      if(submitBtn){
        submitBtn.addEventListener('click', () => {
          if(this.mpState.selectedActions.length === 0) return;
          if(typeof Multiplayer === 'undefined') return;
          Multiplayer.submitAction(this.mpState.selectedActions);
          this.mpState.submitted = true;
          this.refreshMP();
        });
      }

      /* 投降 */
      const resignBtn = document.getElementById('mpResign');
      if(resignBtn){
        resignBtn.addEventListener('click', () => {
          if(confirm('确认投降？对方将获得胜利。')){
            if(typeof Multiplayer !== 'undefined') Multiplayer.resign();
          }
        });
      }

      /* 聊天 */
      this._initMPChat();
    }

    /* 结果交互 */
    if(phase === 'results'){
      const backBtn = document.getElementById('mpBackToLobby');
      if(backBtn){
        backBtn.addEventListener('click', () => {
          if(typeof Multiplayer !== 'undefined') Multiplayer.leaveRoom();
          this.mpState.phase = 'lobby';
          this.mpState.roomCode = null;
          this.mpState.playerInfo = {};
          this.mpState.side = null;
          this.mpState.ready = false;
          this.mpState.directorMessages = [];
          this.mpState.chatMessages = [];
          this.mpState.gameResult = null;
          this.mpState.selectedActions = [];
          this.mpState.lastResolution = null;
          this.mpState.submitted = false;
          this.mpState.opponentSubmitted = false;
          this.refreshMP();
        });
      }
    }
  },

  /* 聊天交互初始化 */
  _initMPChat(){
    const sendBtn = document.getElementById('mpChatSend');
    const input = document.getElementById('mpChatInput');
    if(!sendBtn || !input) return;

    const sendChat = () => {
      const text = input.value.trim();
      if(!text || typeof Multiplayer === 'undefined') return;
      Multiplayer.sendChat(text);
      /* 本地立即显示 */
      this.mpState.chatMessages.push({
        name: this._getMyName(),
        side: this.mpState.side,
        text: text,
        ts: Date.now(),
      });
      input.value = '';
      this.refreshMP();
      /* 滚动到底部 */
      setTimeout(() => {
        const box = document.getElementById('mpChatBox');
        if(box) box.scrollTop = box.scrollHeight;
      }, 50);
    };

    sendBtn.addEventListener('click', sendChat);
    input.addEventListener('keydown', (e) => {
      if(e.key === 'Enter') sendChat();
    });

    /* 自动滚动到底部 */
    setTimeout(() => {
      const box = document.getElementById('mpChatBox');
      if(box) box.scrollTop = box.scrollHeight;
    }, 50);
  },

  /* ===== 推演记录 ===== */
  renderRecords(){
    const games = STATE.games;
    const avgScore = games.length ? Math.round(games.reduce((s,g) => s + g.score, 0) / games.length) : 0;
    const wins = games.filter(g => g.result === '胜利').length;
    const losses = games.filter(g => g.result === '失败').length;
    const draws = games.filter(g => g.result === '平局').length;

    return `
    <div class="fade-in">
      <!-- 统计概览 -->
      <div class="stat-row stagger">
        <div class="stat-card c-cyan">
          <div class="sc-top"><span class="sc-label">总推演场次</span><span class="sc-icon">📊</span></div>
          <div class="sc-val cyan">${games.length}</div>
          <div class="sc-sub">累计完成</div>
        </div>
        <div class="stat-card c-green">
          <div class="sc-top"><span class="sc-label">胜利场次</span><span class="sc-icon">🏆</span></div>
          <div class="sc-val green">${wins}</div>
          <div class="sc-sub">胜率 ${games.length ? Math.round(wins / games.length * 100) : 0}%</div>
        </div>
        <div class="stat-card c-amber">
          <div class="sc-top"><span class="sc-label">平均得分</span><span class="sc-icon">⭐</span></div>
          <div class="sc-val amber">${avgScore}</div>
          <div class="sc-sub">${avgScore >= 75 ? '优秀' : avgScore >= 60 ? '良好' : '待提升'}</div>
        </div>
        <div class="stat-card c-red">
          <div class="sc-top"><span class="sc-label">失败/平局</span><span class="sc-icon">📉</span></div>
          <div class="sc-val red">${losses + draws}</div>
          <div class="sc-sub">需复盘改进</div>
        </div>
      </div>

      <!-- 推演记录列表 -->
      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">📋 推演历史记录</div>
          <span style="font-size:12px;color:var(--txt-2)">${games.length}条记录</span>
        </div>
        <div class="panel-body">
          ${games.length === 0 ? `
            <div style="text-align:center;padding:40px;color:var(--txt-2);font-size:14px">
              暂无推演记录，请从"推演场景"中选择场景开始推演
            </div>
          ` : `
            <div class="records-list">
              ${games.slice().reverse().map((g, idx) => {
                const sc = SCENARIOS.find(s => s.id === g.scenario);
                const dm = sc ? (DOMAIN_MAP[sc.domain] || DOMAIN_MAP.military) : DOMAIN_MAP.military;
                const grade = g.score >= 85 ? 'S' : g.score >= 75 ? 'A' : g.score >= 60 ? 'B' : g.score >= 45 ? 'C' : 'D';
                const gradeColor = g.score >= 85 ? 'var(--gold)' : g.score >= 75 ? 'var(--green)' : g.score >= 60 ? 'var(--cyan)' : g.score >= 45 ? 'var(--amber)' : 'var(--red)';
                const resultColor = g.result === '胜利' ? 'var(--green)' : g.result === '失败' ? 'var(--red)' : 'var(--amber)';
                return `
                <div class="record-item">
                  <div class="ri-grade" style="border-color:${gradeColor};color:${gradeColor}">${grade}</div>
                  <div class="ri-body">
                    <div class="ri-head">
                      <span class="ri-name">${sc ? esc(sc.name) : g.scenario}</span>
                      <span class="ri-result" style="color:${resultColor}">${g.result}</span>
                    </div>
                    <div class="ri-meta">
                      <span style="color:${dm.color}">${dm.icon} ${dm.label}</span>
                      <span>📅 ${g.date}</span>
                      <span>得分: <span style="color:${gradeColor};font-weight:700;font-family:Consolas,monospace">${g.score}</span></span>
                      ${sc ? `<span>${sc.duration}轮</span>` : ''}
                    </div>
                  </div>
                  <div class="ri-score-bar">
                    <div class="ri-score-fill" style="width:${g.score}%;background:${gradeColor}"></div>
                  </div>
                </div>
                `;
              }).join('')}
            </div>
          `}
        </div>
      </div>
    </div>
    `;
  },

  /* ===== 规则手册 ===== */
  renderRules(){
    return `
    <div class="fade-in">
      <div class="rules-view">
        <!-- 骰子系统 -->
        <div class="panel" style="margin-bottom:16px">
          <div class="panel-header"><div class="panel-title">🎲 推演裁决系统 — d100骰子制</div></div>
          <div class="panel-body">
            <div class="rules-grid">
              <div class="rule-card">
                <div class="rc-icon" style="color:var(--gold)">✦</div>
                <div class="rc-title">大成功</div>
                <div class="rc-formula">骰值 ≤ 成功率 × 0.5</div>
                <div class="rc-effect">效果 ×1.5</div>
                <div class="rc-desc">行动效果显著增强，军种获得+3%经验提升</div>
              </div>
              <div class="rule-card">
                <div class="rc-icon" style="color:var(--green)">✓</div>
                <div class="rc-title">成功</div>
                <div class="rc-formula">骰值 ≤ 成功率</div>
                <div class="rc-effect">效果 ×1.0</div>
                <div class="rc-desc">行动按预期执行，军种获得+1%经验提升</div>
              </div>
              <div class="rule-card">
                <div class="rc-icon" style="color:var(--red)">✗</div>
                <div class="rc-title">失败</div>
                <div class="rc-formula">骰值 > 成功率</div>
                <div class="rc-effect">效果 ×0.3</div>
                <div class="rc-desc">行动效果大幅削弱，所在域额外-3分</div>
              </div>
            </div>
            <div class="rule-note">
              <span class="rn-label">成功率上下限：</span>
              <span>最低 20% · 最高 95%（无论修正多大都不会达到100%）</span>
            </div>
          </div>
        </div>

        <!-- 成功率修正体系 -->
        <div class="panel" style="margin-bottom:16px">
          <div class="panel-header"><div class="panel-title">📊 成功率修正体系</div></div>
          <div class="panel-body">
            <div class="rules-table">
              <div class="rt-row rt-header">
                <div class="rt-col">修正来源</div>
                <div class="rt-col">公式</div>
                <div class="rt-col">说明</div>
              </div>
              <div class="rt-row">
                <div class="rt-col"><span style="color:var(--cyan)">⚔️ 力量战备</span></div>
                <div class="rt-col" style="font-family:Consolas,monospace">(战备度 - 50) × 0.3%</div>
                <div class="rt-col">关联军种战备度越高，行动成功率越高</div>
              </div>
              <div class="rt-row">
                <div class="rt-col"><span style="color:var(--green)">🌍 国际声望</span></div>
                <div class="rt-col" style="font-family:Consolas,monospace">(声望 - 50) × 0.2%</div>
                <div class="rt-col">国际影响力影响外交/经济类行动</div>
              </div>
              <div class="rt-row">
                <div class="rt-col"><span style="color:var(--purple)">🏠 国内支持</span></div>
                <div class="rt-col" style="font-family:Consolas,monospace">(支持度 - 50) × 0.1%</div>
                <div class="rt-col">国内民意影响所有行动的基础成功率</div>
              </div>
              <div class="rt-row">
                <div class="rt-col"><span style="color:var(--amber)">🔍 情报修正</span></div>
                <div class="rt-col" style="font-family:Consolas,monospace">情报加成 × 可靠度系数</div>
                <div class="rt-col">A=1.0 / B=0.7 / C=0.4，直接叠加到对应域</div>
              </div>
              <div class="rt-row">
                <div class="rt-col"><span style="color:var(--amber)">💰 资金充足</span></div>
                <div class="rt-col" style="font-family:Consolas,monospace">+5%（条件：资金 > 行动消耗×3）</div>
                <div class="rt-col">资源充裕时行动更有保障</div>
              </div>
              <div class="rt-row">
                <div class="rt-col"><span style="color:var(--red)">⚠️ 升级度惩罚</span></div>
                <div class="rt-col" style="font-family:Consolas,monospace">-8%（升级度≥3时外交行动）</div>
                <div class="rt-col">局势升级后外交手段效果降低</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 力量战备系统 -->
        <div class="panel" style="margin-bottom:16px">
          <div class="panel-header"><div class="panel-title">⚔️ 力量战备系统</div></div>
          <div class="panel-body">
            <div class="rules-table">
              <div class="rt-row rt-header">
                <div class="rt-col">机制</div>
                <div class="rt-col">规则</div>
                <div class="rt-col">说明</div>
              </div>
              <div class="rt-row">
                <div class="rt-col">行动消耗</div>
                <div class="rt-col">高风险 -5% / 中风险 -3% / 低风险 -1%</div>
                <div class="rt-col">执行行动消耗关联军种的战备度</div>
              </div>
              <div class="rt-row">
                <div class="rt-col">成功加成</div>
                <div class="rt-col">大成功 +3% / 成功 +1%</div>
                <div class="rt-col">成功执行行动提升军种经验</div>
              </div>
              <div class="rt-row">
                <div class="rt-col">轮次恢复</div>
                <div class="rt-col">+2% / 轮</div>
                <div class="rt-col">每轮自然恢复战备度</div>
              </div>
              <div class="rt-row">
                <div class="rt-col">门槛锁定</div>
                <div class="rt-col" style="color:var(--red)">战备 < 30% → 行动不可选</div>
                <div class="rt-col">战备过低的军种无法执行关联行动</div>
              </div>
              <div class="rt-row">
                <div class="rt-col">导调调配</div>
                <div class="rt-col">每次+5%，消耗~1.5%预算，上限+20%</div>
                <div class="rt-col">导调阶段可预boost战备度</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 声望系统 -->
        <div class="panel" style="margin-bottom:16px">
          <div class="panel-header"><div class="panel-title">🌍 声望系统 — 场景类型差异化规则</div></div>
          <div class="panel-body">
            <div class="rule-note" style="margin-bottom:12px">
              <span class="rn-label">核心原则：</span>
              <span>战争行动即时消耗声望，和平行动增长声望（延迟至下轮结算）。不同场景类型的声望规则不同。</span>
            </div>
            <div class="rules-table">
              <div class="rt-row rt-header">
                <div class="rt-col">场景类型</div>
                <div class="rt-col">战争行动声望惩罚</div>
                <div class="rt-col">和平行动声望增长</div>
                <div class="rt-col">说明</div>
              </div>
              <div class="rt-row">
                <div class="rt-col"><span style="color:var(--cyan)">维护主权</span></div>
                <div class="rt-col" style="color:var(--red);font-weight:700">声望损失 ×1.5</div>
                <div class="rt-col" style="color:var(--green)">声望增长 ×1.0</div>
                <div class="rt-col">维护主权的场景中，战争行动带来更大的国际声誉损失</div>
              </div>
              <div class="rt-row">
                <div class="rt-col"><span style="color:var(--amber)">侵略行动</span></div>
                <div class="rt-col" style="color:var(--amber)">声望损失 ×0.5</div>
                <div class="rt-col" style="color:var(--green)">声望增长 ×1.0</div>
                <div class="rt-col">侵略行动场景中，战争行动的声望损失较小</div>
              </div>
              <div class="rt-row">
                <div class="rt-col"><span style="color:var(--txt-3)">犯罪/恐怖组织</span></div>
                <div class="rt-col" style="color:var(--txt-3)">不适用</div>
                <div class="rt-col" style="color:var(--txt-3)">不适用</div>
                <div class="rt-col">犯罪集团、恐怖组织等非国家行为体不受声望系统约束</div>
              </div>
            </div>
            <div style="margin-top:12px">
              <div class="rule-note">
                <span class="rn-label">战争行动判定：</span>
                <span style="font-family:Consolas,monospace">escalation ≥ 2</span>
                <span style="margin-left:16px" class="rn-label">和平行动判定：</span>
                <span style="font-family:Consolas,monospace">escalation ≤ 0 且 repEffect > 0</span>
              </div>
              <div class="rule-note" style="margin-top:8px">
                <span class="rn-label">周期性结算：</span>
                <span>和平行动的声望增长不会立即生效，而是累积到 <strong style="color:var(--green)">pendingRepGain</strong>，在下一轮开始时结算。这模拟了外交成果需要时间显现的现实规律。</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 资金系统 -->
        <div class="panel" style="margin-bottom:16px">
          <div class="panel-header"><div class="panel-title">💰 资金系统 — 消耗与周期性增长</div></div>
          <div class="panel-body">
            <div class="rule-note" style="margin-bottom:12px">
              <span class="rn-label">核心原则：</span>
              <span>作战行动即时消耗资金，科技研发等经济行动产生周期性收益（延迟至下轮结算）。</span>
            </div>
            <div class="rules-table">
              <div class="rt-row rt-header">
                <div class="rt-col">机制</div>
                <div class="rt-col">规则</div>
                <div class="rt-col">说明</div>
              </div>
              <div class="rt-row">
                <div class="rt-col">作战消耗</div>
                <div class="rt-col" style="color:var(--red)">即时扣除 fundingCost</div>
                <div class="rt-col">选择行动时即刻扣除资金，取消选择时返还</div>
              </div>
              <div class="rt-row">
                <div class="rt-col">科技研发收益</div>
                <div class="rt-col" style="color:var(--green)">延迟至下轮结算</div>
                <div class="rt-col">科技攻关、产业链建设等行动产生持续经济收益</div>
              </div>
              <div class="rt-row">
                <div class="rt-col">经济基础收益</div>
                <div class="rt-col" style="font-family:Consolas,monospace">资金 × 3%（经济域≥50时）</div>
                <div class="rt-col">经济域状态良好时，每轮自动产生基础收益</div>
              </div>
              <div class="rt-row">
                <div class="rt-col">大成功加成</div>
                <div class="rt-col" style="color:var(--gold)">收益 ×1.5</div>
                <div class="rt-col">科技行动大成功时，收益增加50%</div>
              </div>
            </div>
            <div style="margin-top:12px">
              <div class="rule-note">
                <span class="rn-label">科技研发类行动：</span>
                <span style="font-size:12px;color:var(--txt-2)">
                  科技自立攻关(+300) · 人民币国际化(+200) · 货币互换(+150) · 供应链重构(+200) ·
                  芯片国产替代(+350) · 人才引进(+100) · 人民币跨境支付系统扩容(+200) · 黄金储备(+150) ·
                  下游产业升级(+250) · 自主平台(+150) · 星座组网(+120) · 经济调控(+150) · 北方航道(+100)
                </span>
              </div>
              <div class="rule-note" style="margin-top:8px">
                <span class="rn-label">周期性结算：</span>
                <span>科技行动的收益累积到 <strong style="color:var(--amber)">pendingFundGain</strong>，在下一轮开始时与经济基础收益一并结算。</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 升级阶梯 -->
        <div class="panel" style="margin-bottom:16px">
          <div class="panel-header"><div class="panel-title">⚠️ 升级阶梯</div></div>
          <div class="panel-body">
            <div class="esc-ladder">
              ${typeof WG_RULES !== 'undefined' ? WG_RULES.escalationLevels.map(e => `
                <div class="esc-step ${e.lv >= 4 ? 'danger' : e.lv >= 3 ? 'warning' : ''}">
                  <div class="es-lv" style="color:${e.lv >= 4 ? 'var(--red)' : e.lv >= 3 ? 'var(--amber)' : 'var(--cyan)'}">LV${e.lv}</div>
                  <div class="es-info">
                    <div class="es-name">${e.name}</div>
                    <div class="es-desc">${e.desc}</div>
                  </div>
                  <div class="es-agg">AI攻击性 ${(e.aiAggression * 100).toFixed(0)}%</div>
                </div>
              `).join('') : ''}
            </div>
          </div>
        </div>

        <!-- 评分系统 -->
        <div class="panel" style="margin-bottom:16px">
          <div class="panel-header"><div class="panel-title">🏆 评分系统</div></div>
          <div class="panel-body">
            <div class="rules-table">
              <div class="rt-row rt-header">
                <div class="rt-col">评分维度</div>
                <div class="rt-col">权重</div>
                <div class="rt-col">说明</div>
              </div>
              <div class="rt-row">
                <div class="rt-col">六域均分</div>
                <div class="rt-col" style="color:var(--cyan);font-weight:700">35%</div>
                <div class="rt-col">军事/经济/网络/外交/信息/国内六域平均分</div>
              </div>
              <div class="rt-row">
                <div class="rt-col">国际声望</div>
                <div class="rt-col" style="color:var(--green);font-weight:700">20%</div>
                <div class="rt-col">推演结束时的国际声望值</div>
              </div>
              <div class="rt-row">
                <div class="rt-col">国内支持</div>
                <div class="rt-col" style="color:var(--purple);font-weight:700">20%</div>
                <div class="rt-col">推演结束时的国内支持度</div>
              </div>
              <div class="rt-row">
                <div class="rt-col">资金保有</div>
                <div class="rt-col" style="color:var(--amber);font-weight:700">10%</div>
                <div class="rt-col">剩余资金占初始预算的比例</div>
              </div>
              <div class="rt-row">
                <div class="rt-col">局势管控</div>
                <div class="rt-col" style="color:var(--red);font-weight:700">15%</div>
                <div class="rt-col">升级度越低得分越高：(6-升级度)×20</div>
              </div>
            </div>
            <div class="grade-scale">
              <div class="gs-item" style="border-color:var(--gold);color:var(--gold)">S<span>≥85</span></div>
              <div class="gs-item" style="border-color:var(--green);color:var(--green)">A<span>75-84</span></div>
              <div class="gs-item" style="border-color:var(--cyan);color:var(--cyan)">B<span>60-74</span></div>
              <div class="gs-item" style="border-color:var(--amber);color:var(--amber)">C<span>45-59</span></div>
              <div class="gs-item" style="border-color:var(--red);color:var(--red)">D<span><45</span></div>
            </div>
          </div>
        </div>

        <!-- 推演流程 -->
        <div class="panel">
          <div class="panel-header"><div class="panel-title">📋 推演流程</div></div>
          <div class="panel-body">
            <div class="rules-flow">
              <div class="rf-step"><div class="rf-num">1</div><div class="rf-title">选择场景</div><div class="rf-desc">从${SCENARIOS.length}个场景中选择一个推演场景</div></div>
              <div class="rf-arrow">→</div>
              <div class="rf-step"><div class="rf-num">2</div><div class="rf-title">导调阶段</div><div class="rf-desc">查看态势/情报/事件，调配力量战备，明确任务目标</div></div>
              <div class="rf-arrow">→</div>
              <div class="rf-step"><div class="rf-num">3</div><div class="rf-title">行动阶段</div><div class="rf-desc">用${typeof WG_RULES !== 'undefined' ? WG_RULES.baseAP : 5}行动点选择战略行动（受战备/资金门控）</div></div>
              <div class="rf-arrow">→</div>
              <div class="rf-step"><div class="rf-num">4</div><div class="rf-title">裁决阶段</div><div class="rf-desc">d100骰子裁决 + AI反制 + 六域变化</div></div>
              <div class="rf-arrow">→</div>
              <div class="rf-step"><div class="rf-num">5</div><div class="rf-title">循环推演</div><div class="rf-desc">重复行动-裁决，战备每轮+2%恢复</div></div>
              <div class="rf-arrow">→</div>
              <div class="rf-step"><div class="rf-num">6</div><div class="rf-title">终局评估</div><div class="rf-desc">加权评分 + 评级 + 复盘报告</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    `;
  },

  /* ===== 系统设置 ===== */
  renderSettings(){
    return `
    <div class="fade-in">
      <div class="panel" style="max-width:600px">
        <div class="panel-header"><div class="panel-title">⚙️ 系统设置</div></div>
        <div class="panel-body">
          <div class="settings-list">
            <div class="setting-row">
              <div class="sr-info">
                <div class="sr-name">界面字号</div>
                <div class="sr-desc">调整系统全局字体大小</div>
              </div>
              <div class="sr-control">
                <button class="btn btn-sm" onclick="document.body.style.fontSize='14px'">小</button>
                <button class="btn btn-sm" style="background:rgba(0,180,216,.20)" onclick="document.body.style.fontSize='15px'">标准</button>
                <button class="btn btn-sm" onclick="document.body.style.fontSize='17px'">大</button>
              </div>
            </div>
            <div class="setting-row">
              <div class="sr-info">
                <div class="sr-name">背景动画</div>
                <div class="sr-desc">粒子网络背景效果</div>
              </div>
              <div class="sr-control">
                <button class="btn btn-sm" style="background:rgba(0,180,216,.20)">开启</button>
                <button class="btn btn-sm" onclick="document.getElementById('bgCanvas').style.display='none'">关闭</button>
              </div>
            </div>
            <div class="setting-row">
              <div class="sr-info">
                <div class="sr-name">扫描线效果</div>
                <div class="sr-desc">屏幕扫描线叠加层</div>
              </div>
              <div class="sr-control">
                <button class="btn btn-sm" style="background:rgba(0,180,216,.20)">开启</button>
                <button class="btn btn-sm" onclick="document.querySelector('.scanline')?.remove();document.querySelector('.scan-sweep')?.remove()">关闭</button>
              </div>
            </div>
            <div class="setting-row">
              <div class="sr-info">
                <div class="sr-name">数据流滚动</div>
                <div class="sr-desc">底部数据流滚动条</div>
              </div>
              <div class="sr-control">
                <button class="btn btn-sm" style="background:rgba(0,180,216,.20)">开启</button>
                <button class="btn btn-sm" onclick="document.querySelector('.data-stream')?.remove()">关闭</button>
              </div>
            </div>
            <div class="setting-row">
              <div class="sr-info">
                <div class="sr-name">清除推演记录</div>
                <div class="sr-desc">清空所有历史推演记录</div>
              </div>
              <div class="sr-control">
                <button class="btn btn-sm" style="border-color:var(--red);color:var(--red)" onclick="if(confirm('确认清除所有推演记录？')){STATE.games=[];App.switchTab('records')}">清除</button>
              </div>
            </div>
          </div>
          <div style="margin-top:20px;padding:16px;background:rgba(8,20,40,.5);border-radius:6px;border:1px solid var(--border)">
            <div style="font-size:13px;font-weight:700;color:var(--cyan);margin-bottom:8px">系统信息</div>
            <div style="font-size:13px;color:var(--txt-1);line-height:2">
              <div>版本：国家安全战略兵棋推演平台 v12.3 专业版</div>
              <div>场景库：${SCENARIOS.length}个场景</div>
              <div>战略行动：${typeof STRATEGIC_ACTIONS !== 'undefined' ? STRATEGIC_ACTIONS.length : 0}项</div>
              <div>军种力量：${FORCES.length}个军种</div>
              <div>情报源：${INTEL.length}条</div>
              <div>地图区域：${typeof MAP_REGIONS !== 'undefined' ? MAP_REGIONS.length : 1}个</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    `;
  },

  /* ===== 统计数字动画 ===== */
  animateStats(){
    const games = STATE.games.length;
    const avgScore = games ? Math.round(STATE.games.reduce((s,g) => s + g.score, 0) / games) : 0;
    setTimeout(() => {
      animateValue(document.getElementById('ov-games'), games, 800);
      animateValue(document.getElementById('ov-score'), avgScore, 1000);
      animateValue(document.getElementById('ov-scenarios'), SCENARIOS.length, 800);
      animateValue(document.getElementById('ov-threats'), THREATS.filter(t => t.status !== 'resolved').length, 800);
    }, 100);
  },
};

/* ===== 启动 ===== */
document.addEventListener('DOMContentLoaded', () => App.init());
