/* ================================================================
 * 国家安全战略兵棋推演平台 v10.1 — 功能中心协同交互系统
 * 核心改进：全局指挥视图 + 联合行动 + 联动效应引擎 + 事件链
 * ================================================================ */

const CenterSystem = {

  /* ===== 四大中心配置 ===== */
  CENTERS: {
    diplomatic: {
      id: 'diplomatic', name: '外交战略中心', icon: '🤝', shortName: '外交',
      color: '#2ed573', colorDim: '#25a04a', domain: 'diplomatic',
      desc: '管理国际联盟关系、外交施压与制裁协调、国际组织博弈',
      kpis: [
        { id:'alliance', name:'联盟稳固度', value:68, unit:'%', max:100, desc:'当前盟友关系的综合评分' },
        { id:'influence', name:'国际影响力', value:55, unit:'分', max:100, desc:'在国际组织和多边机制中的话语权' },
        { id:'talks', name:'谈判进展', value:45, unit:'%', max:100, desc:'进行中的外交谈判阶段' },
      ],
      actions: [
        { id:'d1', name:'召集紧急磋商', cost:2, desc:'就危机召开联合国安理会紧急会议', effects:{diplomatic:{alliance:8,influence:5,talks:10},economic:{trade:-3}} },
        { id:'d2', name:'盟友战略协调', cost:2, desc:'召集关键盟友进行军事和情报协调', effects:{diplomatic:{alliance:15,influence:8},logistics:{project:3}} },
        { id:'d3', name:'发布外交白皮书', cost:1, desc:'发布立场声明和法理依据', effects:{diplomatic:{influence:6,talks:4},tech:{patent:2}} },
        { id:'d4', name:'第三方斡旋调停', cost:3, desc:'邀请中立国进行调解', effects:{diplomatic:{talks:18,influence:5},economic:{trade:4}} },
        { id:'d5', name:'发起制裁提案', cost:2, desc:'在联合国框架内推动经济制裁决议', effects:{diplomatic:{influence:10},economic:{supply:-6,trade:-8}} },
        { id:'d6', name:'建立军事热线', cost:1, desc:'建立紧急军事热线降低误判', effects:{diplomatic:{alliance:5},logistics:{transport:4}} },
      ]
    },
    economic: {
      id: 'economic', name: '经济战备中心', icon: '📊', shortName: '经济',
      color: '#ffa502', colorDim: '#cc8400', domain: 'economic',
      desc: '经济制裁设计、战略资源储备管理、供应链韧性监控与贸易保护',
      kpis: [
        { id:'reserves', name:'战略储备率', value:78, unit:'%', max:100, desc:'关键物资和能源的储备水平' },
        { id:'supply', name:'供应链韧性', value:62, unit:'分', max:100, desc:'供应链多元化和抗打击能力' },
        { id:'trade', name:'贸易依存度', value:45, unit:'%', max:100, desc:'对外贸易集中度（越低越好）' },
      ],
      actions: [
        { id:'e1', name:'实施贸易反制', cost:2, desc:'对敌对国实施对等贸易限制', effects:{economic:{trade:-10,supply:3},diplomatic:{influence:5}} },
        { id:'e2', name:'战略物资禁运', cost:3, desc:'禁止关键技术和物资出口', effects:{economic:{reserves:8,trade:-8},tech:{patent:-5}} },
        { id:'e3', name:'供应链重组', cost:3, desc:'重构关键供应链的全球布局', effects:{economic:{supply:15,trade:10},logistics:{transport:5}} },
        { id:'e4', name:'经济刺激计划', cost:4, desc:'大规模财政和货币政策干预', effects:{economic:{reserves:-5,supply:12},logistics:{reserve:8}} },
        { id:'e5', name:'能源进口多元化', cost:2, desc:'拓展替代能源进口渠道', effects:{economic:{supply:10,reserves:6},logistics:{energy:8}} },
        { id:'e6', name:'汇率市场干预', cost:2, desc:'动用外汇储备稳定汇率', effects:{economic:{reserves:-5,trade:5},diplomatic:{influence:3}} },
      ]
    },
    tech: {
      id: 'tech', name: '科技战备中心', icon: '🔬', shortName: '科技',
      color: '#2196f3', colorDim: '#0d6bd6', domain: 'cyber',
      desc: '网络攻防指挥、AI竞赛监控、太空资产保护、技术封锁与反封锁',
      kpis: [
        { id:'cyber', name:'网络防护指数', value:85, unit:'%', max:100, desc:'关键基础设施的网络防护能力' },
        { id:'ai', name:'AI竞赛指数', value:72, unit:'分', max:100, desc:'人工智能领域全球竞争力' },
        { id:'patent', name:'核心技术自主率', value:58, unit:'%', max:100, desc:'关键技术自主知识产权覆盖' },
      ],
      actions: [
        { id:'t1', name:'网络主动防御', cost:2, desc:'部署主动防御系统对抗网络攻击', effects:{tech:{cyber:15,ai:5}} },
        { id:'t2', name:'技术出口管制', cost:2, desc:'限制敏感技术对外转让', effects:{tech:{patent:8},economic:{trade:-5}} },
        { id:'t3', name:'AI攻防演练', cost:2, desc:'进行AI驱动的攻防对抗演习', effects:{tech:{ai:12,cyber:8},diplomatic:{influence:4}} },
        { id:'t4', name:'芯片自主替代', cost:4, desc:'加速芯片产业链自主化进程', effects:{tech:{patent:20},economic:{supply:10,trade:-3}} },
        { id:'t5', name:'太空态势感知', cost:3, desc:'提升太空目标监测和威胁预警', effects:{tech:{cyber:10},logistics:{transport:4}} },
        { id:'t6', name:'量子加密部署', cost:3, desc:'量子通信加密节点部署', effects:{tech:{cyber:18,ai:8,patent:5}} },
      ]
    },
    logistics: {
      id: 'logistics', name: '后勤保障中心', icon: '🚚', shortName: '后勤',
      color: '#ff6348', colorDim: '#cc5700', domain: 'military',
      desc: '力量投送能力、战略储备管理、运输网络监控、能源安全保障',
      kpis: [
        { id:'project', name:'力量投送指数', value:75, unit:'%', max:100, desc:'远程力量投送的覆盖范围和速度' },
        { id:'reserve', name:'战备物资率', value:82, unit:'%', max:100, desc:'弹药/燃料/医疗物资储备水平' },
        { id:'transport', name:'运输网络畅通度', value:88, unit:'%', max:100, desc:'关键运输通道的安全和畅通' },
      ],
      actions: [
        { id:'l1', name:'力量前沿部署', cost:3, desc:'将力量单元前推到关键区域', effects:{logistics:{project:12,reserve:-4},diplomatic:{alliance:3}} },
        { id:'l2', name:'战备物资紧急调运', cost:2, desc:'动用战略储备支援前线', effects:{logistics:{reserve:10,transport:5},economic:{reserves:-3}} },
        { id:'l3', name:'运输线路加固', cost:2, desc:'加固关键运输通道的防护能力', effects:{logistics:{transport:15,project:5}} },
        { id:'l4', name:'医疗保障动员', cost:3, desc:'动员野战医院和医疗支援力量', effects:{logistics:{reserve:8,project:3}} },
        { id:'l5', name:'能源管道保护', cost:2, desc:'保护关键能源输送设施', effects:{logistics:{transport:6},economic:{supply:5}} },
        { id:'l6', name:'民船征用准备', cost:1, desc:'启动民船征用法律程序', effects:{logistics:{project:8,transport:3}} },
      ]
    },
  },

  /* ===== 联合行动（需要多个中心协作） ===== */
  JOINT_OPS: [
    {
      id:'jo1', name:'全面战略威慑', icon:'⚔️',
      desc:'协调外交施压、经济制裁、军事部署形成综合威慑态势',
      requires:[
        {center:'diplomatic',action:'d5',label:'发起制裁提案',complete:false},
        {center:'economic',action:'e2',label:'战略物资禁运',complete:false},
        {center:'logistics',action:'l1',label:'力量前沿部署',complete:false},
      ],
      bonus:{all:{readiness:8},wargameSuccess:12},
      color:'#ff4757',
    },
    {
      id:'jo2', name:'科技封锁联盟', icon:'🔐',
      desc:'联合盟友实施关键技术出口管制，反制技术窃取',
      requires:[
        {center:'tech',action:'t2',label:'技术出口管制',complete:false},
        {center:'diplomatic',action:'d2',label:'盟友战略协调',complete:false},
        {center:'economic',action:'e1',label:'实施贸易反制',complete:false},
      ],
      bonus:{all:{readiness:6},wargameSuccess:8},
      color:'#2196f3',
    },
    {
      id:'jo3', name:'战略供应链重组', icon:'🔄',
      desc:'大规模重构全球供应链，降低单一国家依赖',
      requires:[
        {center:'economic',action:'e3',label:'供应链重组',complete:false},
        {center:'tech',action:'t4',label:'芯片自主替代',complete:false},
        {center:'logistics',action:'l3',label:'运输线路加固',complete:false},
      ],
      bonus:{all:{readiness:10},wargameSuccess:15},
      color:'#ffa502',
    },
    {
      id:'jo4', name:'网络+外交联合反制', icon:'🌐',
      desc:'外交揭露配合网络溯源反击，形成复合应对',
      requires:[
        {center:'tech',action:'t1',label:'网络主动防御',complete:false},
        {center:'diplomatic',action:'d3',label:'发布外交白皮书',complete:false},
        {center:'diplomatic',action:'d1',label:'召集紧急磋商',complete:false},
      ],
      bonus:{all:{readiness:5},wargameSuccess:10},
      color:'#00b4d8',
    },
    {
      id:'jo5', name:'全面后勤动员', icon:'🚛',
      desc:'协调经济资源、运输力量实现战时后勤保障',
      requires:[
        {center:'logistics',action:'l2',label:'战备物资紧急调运',complete:false},
        {center:'logistics',action:'l6',label:'民船征用准备',complete:false},
        {center:'economic',action:'e5',label:'能源进口多元化',complete:false},
      ],
      bonus:{all:{readiness:7},wargameSuccess:9},
      color:'#ff6348',
    },
  ],

  /* ===== 运行时状态 ===== */
  _state: {},

  /* ===== 事件日志（最近20条） ===== */
  _eventLog: [],

  /* ===== 初始化 ===== */
  _init(){
    ['diplomatic','economic','tech','logistics'].forEach(id => {
      if(!this._state[id]){
        this._state[id] = {
          executing:null, actions:{}, completions:0,
          readiness:(this.CENTERS[id].kpis.reduce((s,k)=>s+k.value,0)/this.CENTERS[id].kpis.length)|0,
        };
      }
      // 初始化各行动的进度
      const c = this.CENTERS[id];
      if(!this._state[id].actions) this._state[id].actions = {};
      c.actions.forEach(a => {
        if(!this._state[id].actions[a.id]){
          this._state[id].actions[a.id] = {status:'idle',progress:0};
        }
      });
    });
  },

  /* ===== 获取中心 ===== */
  getCenter(id){ return this.CENTERS[id]||null; },
  getState(id){ this._init(); return this._state[id]; },

  /* ===== 获取全局状态 ===== */
  getAllStates(){
    this._init();
    const states = {};
    ['diplomatic','economic','tech','logistics'].forEach(id => {
      states[id] = { center:this.CENTERS[id], state:this._state[id] };
    });
    return states;
  },

  /* ===== 计算协同指数 ===== */
  getSynergyScore(){
    this._init();
    // 基于每个中心的平均KPI和完成行动数
    const ids = ['diplomatic','economic','tech','logistics'];
    let totalScore = 0;
    ids.forEach(id => {
      const c = this.CENTERS[id];
      const s = this._state[id];
      const kpiAvg = c.kpis.reduce((sum,k)=>sum+(k.value/k.max),0)/c.kpis.length;
      const actionRate = s.completions/Math.max(1,c.actions.length);
      totalScore += kpiAvg*60 + actionRate*40;
    });
    const synergy = Math.round(totalScore/ids.length);
    const label = synergy>=80?'高度协同':synergy>=60?'有效协作':synergy>=40?'初级协调':'各自为战';
    const color = synergy>=80?'var(--green)':synergy>=60?'var(--cyan)':synergy>=40?'var(--amber)':'var(--red)';
    return {score:synergy,label,color};
  },

  /* ===== 执行行动（带联动效应） ===== */
  executeAction(centerId, actionId){
    this._init();
    const center = this.CENTERS[centerId];
    if(!center) return {ok:false,msg:'中心不存在'};
    const action = center.actions.find(a=>a.id===actionId);
    if(!action) return {ok:false,msg:'行动不存在'};
    const st = this._state[centerId].actions[actionId];
    if(!st||st.status!=='idle') return {ok:false,msg:'该行动不可执行'};

    st.status = 'executing';
    st.progress = 0;
    st.startedAt = Date.now();
    this._state[centerId].executing = actionId;

    this._addEvent(centerId, actionId, `${center.icon} ${center.shortName}中心启动「${action.name}」`);
    this._tickProgress(centerId, actionId);
    return {ok:true,msg:`已启动: ${action.name}`};
  },

  /* ===== 完成行动 + 触发联动效应 ===== */
  _completeAction(centerId, actionId){
    const center = this.CENTERS[centerId];
    const action = center.actions.find(a=>a.id===actionId);
    if(!action) return;
    const st = this._state[centerId].actions[actionId];
    st.status = 'completed';
    st.progress = 100;
    this._state[centerId].executing = null;
    this._state[centerId].completions++;

    this._addEvent(centerId, actionId, `✅ ${center.shortName}中心完成「${action.name}」，触发联动效应`);

    // 应用主效应
    this._applyEffects(centerId, action.effects);

    // 检查联合行动
    this._checkJointOps(centerId, actionId);
  },

  /* ===== 应用效应到各中心KPI ===== */
  _applyEffects(centerId, effects){
    Object.keys(effects).forEach(targetId => {
      const targetCenter = this.CENTERS[targetId];
      if(!targetCenter) return;
      const fx = effects[targetId];
      let rippleDesc = [];
      Object.keys(fx).forEach(kpiId => {
        const kpi = targetCenter.kpis.find(k=>k.id===kpiId);
        if(!kpi) return;
        const delta = fx[kpiId];
        kpi.value = Math.max(5, Math.min(100, kpi.value+delta));
        const dir = delta>0?'+':'';
        rippleDesc.push(`${kpi.name} ${dir}${delta}`);
        kpi.trend = delta;
      });
      if(rippleDesc.length){
        this._addEvent(targetId, null,
          `↪ ${targetCenter.icon} ${targetCenter.shortName}中心受联动影响：${rippleDesc.join('、')}`);
      }
      // 更新战备度
      this._state[targetId].readiness = targetCenter.kpis.reduce((s,k)=>s+k.value,0)/targetCenter.kpis.length|0;
    });
  },

  /* ===== 检查联合行动完成 ===== */
  _checkJointOps(centerId, actionId){
    this.JOINT_OPS.forEach(jop => {
      const req = jop.requires.find(r=>r.center===centerId&&r.action===actionId);
      if(req){ req.complete = true; }

      const allDone = jop.requires.every(r => {
        const st = this._state[r.center]?.actions?.[r.action];
        return st&&st.status==='completed';
      });

      if(allDone && !jop._triggered){
        jop._triggered = true;
        this._addEvent('joint', jop.id,
          `⭐ 联合行动「${jop.name}」全部条件达成！全局战备+${jop.bonus.all.readiness}%, 推演成功+${jop.bonus.wargameSuccess}%`);
        // 给所有中心加战备度
        ['diplomatic','economic','tech','logistics'].forEach(id => {
          this._state[id].readiness = Math.min(100, (this._state[id].readiness||75)+jop.bonus.all.readiness);
        });
        // 注入wargame修正
        if(typeof Wargame !== 'undefined' && Wargame._jointBonus===undefined){
          Wargame._jointBonus = 0;
        }
        if(typeof Wargame !== 'undefined'){
          Wargame._jointBonus = (Wargame._jointBonus||0)+jop.bonus.wargameSuccess;
        }
      }
    });
  },

  /* ===== 进度模拟 ===== */
  _tickProgress(centerId, actionId){
    const st = this._state[centerId].actions[actionId];
    const action = this.CENTERS[centerId].actions.find(a=>a.id===actionId);
    const interval = setInterval(() => {
      if(st.status!=='executing'){
        clearInterval(interval);
        return;
      }
      st.progress = Math.min(100, st.progress+(10+Math.random()*6));
      if(st.progress>=100){
        clearInterval(interval);
        this._completeAction(centerId, actionId);
      }
      if(typeof CenterUI!=='undefined'){
        CenterUI._notifyUpdate(centerId);
      }
    }, 300+(action.cost*100));
  },

  /* ===== 添加事件日志 ===== */
  _addEvent(centerId, actionId, text){
    this._eventLog.unshift({
      time: Date.now(),
      centerId, actionId, text,
      timeStr: new Date().toLocaleTimeString(),
    });
    if(this._eventLog.length>30) this._eventLog.length=30;
    if(typeof CenterUI!=='undefined'){
      CenterUI._notifyEvent();
    }
  },

  /* ===== 重置 ===== */
  reset(centerId){
    this._init();
    if(centerId){
      const st = this._state[centerId];
      st.actions = {}; st.executing=null; st.completions=0;
      const c = this.CENTERS[centerId];
      c.actions.forEach(a=>{ st.actions[a.id]={status:'idle',progress:0}; });
      c.kpis.forEach(k=>{ k.value=Math.floor(50+Math.random()*35); k.trend=0; });
      st.readiness = c.kpis.reduce((s,k)=>s+k.value,0)/c.kpis.length|0;
    } else {
      Object.keys(this._state).forEach(id=>this.reset(id));
      this._eventLog=[];
      this.JOINT_OPS.forEach(j=>{j._triggered=false;j.requires.forEach(r=>r.complete=false);});
    }
  },

  /* ===== 获取场景化数据 ===== */
  getScenarioReadiness(scenarioId){
    const mods = (typeof getScenarioModules==='function')?getScenarioModules(scenarioId):null;
    if(!mods) return null;
    const result={};
    mods.forEach(m=>{ result[m.id]=m.readiness||75; });
    return result;
  },
};

/* ================================================================
 * 功能中心UI — 全局指挥视图 + 详细面板 + 事件日志
 * ================================================================ */
const CenterUI = {
  _viewMode: 'global', // 'global' | 'detail'
  _detailCenter: null,

  /* ===== 主入口：默认渲染全局指挥视图 ===== */
  render(){
    return this._renderGlobal();
  },

  /* ===== 全局指挥视图 ===== */
  _renderGlobal(){
    CenterSystem._init();
    const synergy = CenterSystem.getSynergyScore();
    const all = CenterSystem.getAllStates();
    const ids = ['diplomatic','economic','tech','logistics'];

    let cardsHtml = ids.map(id => {
      const d = all[id]; const c = d.center; const s = d.state;
      const avgKPI = c.kpis.reduce((sum,k)=>sum+k.value,0)/c.kpis.length|0;
      const hasAction = s.executing!==null;
      const execAction = hasAction?c.actions.find(a=>a.id===s.executing):null;

      return `
      <div class="co-card" style="border-color:${c.color}33;cursor:pointer"
        onclick="CenterUI.showDetail('${id}')"
        onmouseover="this.style.borderColor='${c.color}88';this.style.transform='translateY(-2px)';"
        onmouseout="this.style.borderColor='${c.color}33';this.style.transform=''">
        <div class="co-card-head">
          <div class="co-card-icon" style="background:${c.color}18;border:2px solid ${c.color}44">${c.icon}</div>
          <div class="co-card-title">
            <div style="font-weight:700;font-size:15px;color:${c.color}">${c.name}</div>
            <div style="font-size:11px;color:var(--txt-2)">${s.completions}/${c.actions.length}行动  |  战备${s.readiness}%</div>
          </div>
          <div class="co-card-status" style="border:1px solid ${c.color}33;background:${c.color}08">
            <div style="font-size:10px;color:var(--txt-2)">战备</div>
            <div style="font-size:24px;font-weight:800;color:${c.color};font-family:Consolas,monospace">${s.readiness}%</div>
          </div>
        </div>
        <div style="display:flex;gap:8px;margin-top:12px">
          ${c.kpis.map(k=>{
            const tColor = (k.trend||0)>0?'var(--green)':(k.trend||0)<0?'var(--red)':'var(--txt-2)';
            const tIcon = (k.trend||0)>0?'↑':(k.trend||0)<0?'↓':'—';
            return `
            <div style="flex:1;padding:8px;background:rgba(8,20,40,.5);border-radius:6px;text-align:center">
              <div style="font-size:10px;color:var(--txt-2);margin-bottom:3px">${k.name}</div>
              <div style="font-size:15px;font-weight:700;color:${c.color};font-family:Consolas,monospace">${k.value}${k.unit}</div>
              <div style="font-size:10px;color:${tColor};margin-top:2px">${tIcon}</div>
            </div>`;
          }).join('')}
        </div>
        ${hasAction?`
          <div style="margin-top:10px;padding:8px 10px;background:${c.color}0d;border:1px solid ${c.color}22;border-radius:6px;display:flex;align-items:center;gap:8px">
            <div style="width:6px;height:6px;border-radius:50%;background:${c.color};animation:pulse 1.5s infinite"></div>
            <div style="font-size:12px;color:var(--txt-0);flex:1">${execAction.name} ${Math.round(execAction.progress||s.actions[execAction.id]?.progress||0)}%</div>
          </div>`:''}
        <div style="margin-top:10px;text-align:center;font-size:11px;color:var(--cyan)">点击查看详情 →</div>
      </div>`;
    }).join('');

    let jointHtml = CenterSystem.JOINT_OPS.map(jop=>{
      const done = jop.requires.filter(r=>{
        const st = CenterSystem._state[r.center]?.actions?.[r.action];
        return st&&st.status==='completed';
      }).length;
      const total = jop.requires.length;
      const pct = (done/total*100)|0;
      return `
      <div class="co-joint-item" style="border-color:${jop.color}22">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
          <span style="font-size:20px">${jop.icon}</span>
          <div style="flex:1">
            <div style="font-size:14px;font-weight:700;color:${jop.color}">${jop.name}</div>
            <div style="font-size:11px;color:var(--txt-2)">${jop.desc}</div>
          </div>
          <div style="font-size:20px;font-weight:800;color:${done===total?'var(--green)':jop.color};font-family:Consolas,monospace">${done}/${total}</div>
        </div>
        <div style="height:4px;background:rgba(0,180,216,.10);border-radius:2px;overflow:hidden;margin-bottom:6px">
          <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,${jop.color}88,${jop.color});border-radius:2px;transition:width .5s"></div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${jop.requires.map(r=>{
            const st = CenterSystem._state[r.center]?.actions?.[r.action];
            const done = st&&st.status==='completed';
            const c = CenterSystem.CENTERS[r.center];
            return `<div style="font-size:11px;padding:3px 8px;border-radius:3px;color:${done?'var(--green)':'var(--txt-2)'};background:${done?'rgba(46,213,115,.1)':'rgba(0,180,216,.04)'};border:1px solid ${done?'rgba(46,213,115,.2)':'var(--border)'}">${c?c.icon:''} ${r.label} ${done?'✓':''}</div>`;
          }).join('')}
        </div>
      </div>`;
    }).join('');

    let eventHtml = CenterSystem._eventLog.slice(0,8).map(ev=>`
      <div class="co-event-item" style="color:${ev.centerId==='joint'?(CenterSystem.JOINT_OPS.find(j=>j.id===ev.actionId)?.color||'var(--amber)'):(CenterSystem.CENTERS[ev.centerId]?.color||'var(--txt-1)')}">
        <span style="font-size:10px;color:var(--txt-2);flex-shrink:0">${ev.timeStr}</span>
        <span>${ev.text}</span>
      </div>
    `).join('')||'<div style="color:var(--txt-2);font-size:12px;text-align:center;padding:10px">暂无事件，执行行动后此处将实时显示联动效果</div>';

    return `
    <div class="fade-in" id="center-global">
      <!-- 顶部:协同评分 -->
      <div class="co-topbar">
        <div class="co-synergy" style="border-color:${synergy.color}33;background:${synergy.color}08">
          <div style="font-size:12px;color:var(--txt-2)">全域协同评分</div>
          <div style="font-size:36px;font-weight:800;color:${synergy.color};font-family:Consolas,monospace;line-height:1.1">${synergy.score}</div>
          <div style="font-size:12px;color:${synergy.color}">${synergy.label}</div>
        </div>
        <div style="flex:1;padding:12px 18px;background:rgba(0,180,216,.06);border:1px solid var(--border);border-radius:8px">
          <div style="font-size:12px;color:var(--txt-2);margin-bottom:6px">📋 操作提示</div>
          <div style="font-size:11px;color:var(--txt-1);line-height:1.7">
            • 下方卡片展示各中心实时战备状态和KPI<br>
            • 点击卡片进入该中心执行具体行动<br>
            • 执行行动后将产生<strong style="color:var(--cyan)">跨中心联动效应</strong>，影响其他中心KPI<br>
            • 完成联合行动全部条件可获得<strong style="color:var(--amber)">全局战备加成</strong>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;flex-shrink:0">
          <button onclick="CenterUI.resetAll()" style="padding:8px 16px;font-size:12px;color:var(--txt-1);background:rgba(255,71,87,.06);border:1px solid rgba(255,71,87,.15);border-radius:5px;cursor:pointer;transition:all .2s"
            onmouseover="this.style.background='rgba(255,71,87,.12)';this.style.borderColor='rgba(255,71,87,.3)'"
            onmouseout="this.style.background='rgba(255,71,87,.06)';this.style.borderColor='rgba(255,71,87,.15)'">
            🔄 重置全部
          </button>
          <button onclick="CenterUI._renderGlobal();this.closest('#center-global')?CenterUI.refreshGlobal():null" style="padding:8px 16px;font-size:12px;color:var(--cyan);background:rgba(0,180,216,.08);border:1px solid rgba(0,180,216,.20);border-radius:5px;cursor:pointer">
            🔄 刷新
          </button>
        </div>
      </div>

      <!-- 四大中心卡片 -->
      <div class="co-cards-grid">${cardsHtml}</div>

      <!-- 下半部分：联合行动 + 事件日志 -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px">
        <!-- 联合行动 -->
        <div class="panel" style="padding:16px 20px">
          <div style="font-size:14px;font-weight:700;color:var(--amber);margin-bottom:14px;display:flex;align-items:center;gap:8px">
            ⭐ 联合行动 <span style="font-size:11px;color:var(--txt-2);font-weight:400">（多中心协作完成）</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:10px;max-height:340px;overflow-y:auto">${jointHtml}</div>
        </div>
        <!-- 事件日志 -->
        <div class="panel" style="padding:16px 20px">
          <div style="font-size:14px;font-weight:700;color:var(--cyan);margin-bottom:14px;display:flex;align-items:center;gap:8px">
            📡 实时事件日志 <span id="co-event-live" style="font-size:10px;color:var(--green);animation:pulse 1.5s infinite"></span>
          </div>
          <div id="co-event-log" style="display:flex;flex-direction:column;gap:6px;max-height:340px;overflow-y:auto;font-size:12px">${eventHtml}</div>
        </div>
      </div>
    </div>

    <div id="center-detail-target"></div>
    `;
  },

  /* ===== 进入单个中心详情 ===== */
  showDetail(centerId){
    this._viewMode='detail'; this._detailCenter=centerId;
    const c = CenterSystem.CENTERS[centerId];
    const s = CenterSystem.getState(centerId);
    const detailHtml = this._renderDetail(centerId, c, s);
    const target = document.getElementById('center-detail-target');
    if(target){
      target.innerHTML = detailHtml;
      target.style.display='block';
    }
    const global = document.getElementById('center-global');
    if(global) global.style.display='none';

    // 联动效应预览
    this._renderRipplePreview(centerId);

    // 自动刷新
    if(this._detailTimer) clearInterval(this._detailTimer);
    this._detailTimer = setInterval(()=>{
      const t = document.getElementById('center-detail-target');
      if(!t||t.style.display==='none'){ clearInterval(this._detailTimer); return; }
      this._refreshDetail(centerId);
    },1500);
  },

  /* ===== 返回全局视图 ===== */
  backToGlobal(){
    this._viewMode='global';
    if(this._detailTimer){clearInterval(this._detailTimer);this._detailTimer=null;}
    const target = document.getElementById('center-detail-target');
    if(target) target.style.display='none';
    const global = document.getElementById('center-global');
    if(global) global.style.display='block';
    this.refreshGlobal();
  },

  /* ===== 刷新全局视图 ===== */
  refreshGlobal(){
    const container = document.getElementById('center-global');
    if(!container) return;
    const newHtml = this._renderGlobal();
    const temp = document.createElement('div');
    temp.innerHTML = newHtml;
    const newEl = temp.firstElementChild;
    if(newEl) container.parentNode.replaceChild(newEl, container);
  },

  /* ===== 渲染详情页 ===== */
  _renderDetail(centerId, c, s){
    const hasExec = s.executing!==null;
    const execAction = hasExec?c.actions.find(a=>a.id===s.executing):null;

    let actionHtml = c.actions.map(a=>{
      const st = s.actions[a.id];
      const status = st?.status||'idle';
      const statusLabel = status==='idle'?'待执行':status==='executing'?'执行中':'已完成';
      const statusColor = status==='idle'?'var(--txt-2)':status==='executing'?c.color:'var(--green)';
      const bg = status==='executing'?`${c.color}10`:status==='completed'?'rgba(46,213,115,.08)':'rgba(0,180,216,.04)';
      const border = status==='executing'?`${c.color}33`:'var(--border)';
      const canClick = status==='idle'&&!hasExec;

      // 联动效果预览
      let rippleTip = '';
      if(status==='idle'){
        const parts = [];
        Object.keys(a.effects).forEach(tid=>{
          const tc = CenterSystem.CENTERS[tid];
          if(!tc) return;
          Object.keys(a.effects[tid]).forEach(kid=>{
            const delta = a.effects[tid][kid];
            const tkpi = tc.kpis.find(k=>k.id===kid);
            if(tkpi) parts.push(`${tc.icon}${tkpi.name}${delta>0?'+':''}${delta}`);
          });
        });
        if(parts.length) rippleTip = parts.join(' ');
      }

      return `
      <div class="co-action-row" style="background:${bg};border-color:${border}">
        <div class="co-action-icon" style="background:${c.color}15">${c.icon}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:14px;font-weight:600;color:var(--txt-0)">${a.name}</div>
          <div style="font-size:12px;color:var(--txt-1);margin-top:2px">${a.desc}</div>
          ${rippleTip?`<div style="font-size:10px;color:${c.color}88;margin-top:3px">→ 联动: ${rippleTip}</div>`:''}
          ${status==='executing'?`
            <div style="margin-top:6px;height:4px;background:rgba(0,180,216,.10);border-radius:2px;overflow:hidden">
              <div id="co-prog-${centerId}-${a.id}" style="height:100%;width:${st?.progress||0}%;background:${c.color};border-radius:2px;transition:width .3s"></div>
            </div>`:''}
        </div>
        <div style="text-align:right;flex-shrink:0">
          <div style="font-size:11px;padding:3px 8px;border-radius:3px;color:${statusColor};background:${status==='executing'?c.color+'15':'rgba(0,180,216,.04)'}">${statusLabel}</div>
          <div style="font-size:10px;color:var(--txt-2);margin-top:3px">消耗${a.cost}AP</div>
        </div>
        ${canClick?`
          <button onclick="CenterUI.doAction('${centerId}','${a.id}')" class="co-action-btn" style="background:${c.color};color:#fff"
            onmouseover="this.style.boxShadow='0 0 14px ${c.color}66'"
            onmouseout="this.style.boxShadow='none'">执行</button>`:''}
      </div>`;
    }).join('');

    // 场景化战备度
    let scModNote = '';
    const wgState = (typeof Wargame!=='undefined'&&Wargame.state)?Wargame.state:null;
    if(wgState){
      const mods = (typeof getScenarioModules==='function')?getScenarioModules(wgState.scenario.id):null;
      const mod = mods?mods.find(m=>m.id===centerId):null;
      if(mod) scModNote = `<div style="margin-top:8px;padding:6px 10px;background:${c.color}08;border-left:2px solid ${c.color};border-radius:0 4px 4px 0;font-size:12px;color:${c.color}">🎯 ${mod.scenarioNote||'场景适配中'}</div>`;
    }

    return `
    <div class="fade-in">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
        <button onclick="CenterUI.backToGlobal()" style="padding:8px 14px;font-size:12px;background:rgba(0,180,216,.12);color:var(--cyan);border:1px solid rgba(0,180,216,.3);border-radius:5px;cursor:pointer;transition:all .2s"
          onmouseover="this.style.background='rgba(0,180,216,.20)'"
          onmouseout="this.style.background='rgba(0,180,216,.12)'">← 返回指挥中心</button>
        <div style="font-size:12px;color:var(--txt-2)">|</div>
        ${['diplomatic','economic','tech','logistics'].map(id=>{
          const dc = CenterSystem.CENTERS[id];
          const active = id===centerId;
          return `<button onclick="CenterUI.showDetail('${id}')" style="padding:6px 12px;font-size:12px;background:${active?dc.color+'18':'rgba(0,180,216,.06)'};color:${active?dc.color:'var(--txt-2)'};border:1px solid ${active?dc.color+'33':'var(--border)'};border-radius:5px;cursor:pointer">${dc.icon} ${dc.shortName}</button>`;
        }).join('')}
      </div>

      <!-- 中心头部 -->
      <div class="panel" style="padding:18px 22px;margin-bottom:14px;border-color:${c.color}33">
        <div style="display:flex;align-items:center;gap:14px">
          <div style="width:56px;height:56px;border-radius:12px;background:${c.color}15;display:flex;align-items:center;justify-content:center;font-size:28px;border:2px solid ${c.color}33;flex-shrink:0">${c.icon}</div>
          <div style="flex:1">
            <div style="font-size:20px;font-weight:800;color:${c.color}">${c.name}</div>
            <div style="font-size:13px;color:var(--txt-2)">${c.desc}</div>
            ${scModNote}
          </div>
          <div style="text-align:center;padding:12px 18px;background:rgba(8,20,40,.5);border-radius:8px;border:1px solid ${c.color}22">
            <div style="font-size:10px;color:var(--txt-2)">战备度</div>
            <div style="font-size:34px;font-weight:800;color:${c.color};font-family:Consolas,monospace;line-height:1.1">${s.readiness}%</div>
            <div style="font-size:12px;color:var(--txt-2)">完成${s.completions}/${c.actions.length}</div>
          </div>
        </div>
      </div>

      <!-- KPI面板 -->
      <div class="panel" style="padding:16px 20px;margin-bottom:14px">
        <div style="font-size:13px;font-weight:700;color:var(--cyan);margin-bottom:12px">📊 关键指标</div>
        <div style="display:grid;grid-template-columns:repeat(${c.kpis.length},1fr);gap:12px">
          ${c.kpis.map(k=>{
            const pct = (k.value/k.max*100)|0;
            const tColor = (k.trend||0)>0?'var(--green)':(k.trend||0)<0?'var(--red)':'var(--txt-2)';
            return `
            <div style="padding:12px;background:rgba(0,180,216,.06);border:1px solid var(--border);border-radius:8px;text-align:center">
              <div style="font-size:10px;color:var(--txt-2);margin-bottom:5px">${k.name}</div>
              <div style="font-size:22px;font-weight:800;color:${c.color};font-family:Consolas,monospace">${k.value}<span style="font-size:12px">${k.unit}</span></div>
              <div style="font-size:11px;color:${tColor};margin-top:3px">${(k.trend||0)>0?'↑':(k.trend||0)<0?'↓':'—'}</div>
              <div style="height:4px;background:rgba(0,180,216,.10);border-radius:2px;overflow:hidden;margin-top:6px">
                <div style="height:100%;width:${pct}%;background:${c.color};border-radius:2px;opacity:.5"></div>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>

      <!-- 联动效应预览 -->
      <div id="co-ripple-${centerId}"></div>

      <!-- 行动面板 -->
      <div class="panel" style="padding:16px 20px">
        <div style="font-size:13px;font-weight:700;color:var(--cyan);margin-bottom:12px">
          ⚡ 行动执行  ${hasExec?`<span style="font-size:11px;color:${c.color};font-weight:400">· 执行中: ${execAction?.name}</span>`:''}
        </div>
        <div style="display:flex;flex-direction:column;gap:6px">${actionHtml}</div>
      </div>
    </div>`;
  },

  /* ===== 联动效应预览面板 ===== */
  _renderRipplePreview(centerId){
    const c = CenterSystem.CENTERS[centerId];
    const container = document.getElementById('co-ripple-'+centerId);
    if(!container) return;

    // 收集所有待执行行动的联动效应
    let rippleMap = {};
    c.actions.forEach(a=>{
      const st = CenterSystem._state[centerId].actions[a.id];
      if(st?.status!=='idle') return;
      Object.keys(a.effects).forEach(tid=>{
        if(!rippleMap[tid]) rippleMap[tid]={};
        Object.keys(a.effects[tid]).forEach(kid=>{
          if(!rippleMap[tid][kid]) rippleMap[tid][kid]=[];
          rippleMap[tid][kid].push({from:a.name,delta:a.effects[tid][kid]});
        });
      });
    });

    let rippleHtml = Object.keys(rippleMap).map(tid=>{
      const tc = CenterSystem.CENTERS[tid];
      if(!tc || tid===centerId) return '';
      let items = '';
      Object.keys(rippleMap[tid]).forEach(kid=>{
        const tkpi = tc.kpis.find(k=>k.id===kid);
        if(!tkpi) return;
        rippleMap[tid][kid].forEach(r=>{
          const dir = r.delta>0?'+':'';
          const dColor = r.delta>0?'var(--green)':'var(--red)';
          items += `<div style="font-size:11px;color:${dColor};padding:2px 0">${r.from} → ${tkpi.name} ${dir}${r.delta}</div>`;
        });
      });
      return items?`
        <div style="padding:8px 10px;background:rgba(0,180,216,.04);border:1px solid var(--border);border-radius:6px">
          <div style="font-size:12px;font-weight:600;color:${tc.color};margin-bottom:4px">${tc.icon} ${tc.name}</div>
          ${items}
        </div>`:'';
    }).filter(Boolean).join('');

    if(rippleHtml){
      container.innerHTML = `
        <div class="panel" style="padding:16px 20px;margin-bottom:14px;border-color:var(--amber)33">
          <div style="font-size:13px;font-weight:700;color:var(--amber);margin-bottom:10px">↪ 联动效应预览（执行行动后自动触发）</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${rippleHtml}</div>
        </div>`;
    } else {
      container.innerHTML = '';
    }
  },

  /* ===== 刷新详情页 ===== */
  _refreshDetail(centerId){
    const target = document.getElementById('center-detail-target');
    if(!target||target.style.display==='none') return;
    const c = CenterSystem.CENTERS[centerId];
    const s = CenterSystem.getState(centerId);
    const newHtml = this._renderDetail(centerId, c, s);
    target.innerHTML = newHtml;
    this._renderRipplePreview(centerId);
  },

  /* ===== 执行行动 ===== */
  doAction(centerId, actionId){
    const result = CenterSystem.executeAction(centerId, actionId);
    if(!result.ok){
      this._flashMsg(result.msg,'error');
      return;
    }
    this._flashMsg(result.msg,'success');
    this._refreshDetail(centerId);
  },

  /* ===== 重置 ===== */
  resetAll(){
    CenterSystem.reset();
    if(this._viewMode==='detail') this.backToGlobal();
    else this.refreshGlobal();
    this._flashMsg('已重置所有中心和联合行动','info');
  },

  /* ===== 通知更新（内部回调） ===== */
  _notifyUpdate(centerId){
    if(this._viewMode==='detail'&&this._detailCenter===centerId){
      this._refreshDetail(centerId);
    }
    // 更新事件日志
    this._refreshEventLog();
  },
  _notifyEvent(){
    this._refreshEventLog();
  },

  /* ===== 刷新事件日志 ===== */
  _refreshEventLog(){
    const logEl = document.getElementById('co-event-log');
    if(!logEl) return;
    const events = CenterSystem._eventLog.slice(0,8);
    if(!events.length){
      logEl.innerHTML = '<div style="color:var(--txt-2);font-size:12px;text-align:center;padding:10px">暂无事件</div>';
      return;
    }
    logEl.innerHTML = events.map(ev=>`
      <div class="co-event-item" style="color:${ev.centerId==='joint'?(CenterSystem.JOINT_OPS.find(j=>j.id===ev.actionId)?.color||'var(--amber)'):(CenterSystem.CENTERS[ev.centerId]?.color||'var(--txt-1)')}">
        <span style="font-size:10px;color:var(--txt-2);flex-shrink:0">${ev.timeStr}</span>
        <span>${ev.text}</span>
      </div>
    `).join('');
  },

  /* ===== 浮层提示 ===== */
  _flashMsg(msg, type){
    const color = type==='error'?'var(--red)':type==='info'?'var(--cyan)':'var(--green)';
    const div = document.createElement('div');
    div.style.cssText = `position:fixed;top:80px;right:40px;padding:10px 20px;background:rgba(13,20,36,.95);border:1px solid ${color};border-radius:6px;color:${color};font-size:13px;z-index:9999;animation:fadeIn .3s`;
    div.textContent = msg;
    document.body.appendChild(div);
    setTimeout(()=>{div.style.opacity='0';div.style.transition='opacity .3s';},1500);
    setTimeout(()=>div.remove(),2000);
  },

  destroy(){
    if(this._detailTimer) clearInterval(this._detailTimer);
  }
};

// 导出入口
function renderCenter(centerId){
  // 不管传入什么ID，都先渲染全局指挥视图
  CenterSystem._init();
  return CenterUI.render();
}

if(typeof window!=='undefined'){
  window.CenterSystem = CenterSystem;
  window.CenterUI = CenterUI;
  window.renderCenter = renderCenter;
}
