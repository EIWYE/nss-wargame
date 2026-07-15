/* ================================================================
 * UI 工具函数
 * ================================================================ */

/* HTML 转义 */
function esc(s){
  return String(s).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}

/* 时钟 */
let _clockTimer = null;
function startClock(){
  if(_clockTimer) clearInterval(_clockTimer);
  function tick(){
    const el = document.getElementById('clock');
    if(!el) return;
    const d = new Date();
    const pad = n => String(n).padStart(2, '0');
    el.textContent = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }
  tick();
  _clockTimer = setInterval(tick, 1000);
}

/* 数字滚动动画 */
function animateValue(el, target, duration = 800){
  if(!el) return;
  const startTime = performance.now();
  function step(now){
    const t = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(eased * target);
    if(t < 1) requestAnimationFrame(step);
    else el.textContent = target;
  }
  requestAnimationFrame(step);
}

/* 趋势箭头 */
function trendArrow(val){
  if(val > 0) return `<span class="trend up">▲ +${val}%</span>`;
  if(val < 0) return `<span class="trend down">▼ ${val}%</span>`;
  return `<span class="trend flat">─ 0%</span>`;
}

/* 威胁等级条 */
function threatBar(level){
  const max = 5;
  let bars = '';
  for(let i = 0; i < max; i++){
    const active = i < level;
    bars += `<span class="tb-bar ${active ? 'active' : ''}"></span>`;
  }
  return `<div class="threat-bar">${bars}</div>`;
}

/* 难度星 */
function difficultyStars(n){
  return '<span class="star">★</span>'.repeat(n) +
         '<span class="star dim">★</span>'.repeat(5 - n);
}

/* 数据流滚动 */
let _streamTimer = null;
function startDataStream(){
  const activeThreats = (typeof THREATS !== 'undefined') ? THREATS.filter(t => t.status !== 'resolved').length : 0;
  const intelCount = (typeof INTEL !== 'undefined') ? INTEL.length : 0;
  const threatLevel = (typeof STATE !== 'undefined' && typeof STATE.threatLevel === 'number') ? STATE.threatLevel : 72;
  const threatLabel = threatLevel >= 70 ? '红色' : threatLevel >= 50 ? '黄色' : '绿色';
  const items = [
    { k:'系统',  v:'AI导演部引擎已就绪', c:'green' },
    { k:'网络',  v:'P2P节点连接正常', extra:'延迟 14ms', c:'green' },
    { k:'安全',  v:'安全防护运行中', extra:'威胁等级 ' + threatLabel, c:'amber' },
    { k:'数据',  v:`场景库同步完成 · ${SCENARIOS.length}个场景已加载`, c:'green' },
    { k:'智能', v:'蓝方人工智能模型加载完成 · 策略库 v2.1', c:'cyan' },
    { k:'警告', v:`检测到${activeThreats}个活跃威胁向量`, c:'red' },
    { k:'信息', v:'加密通信通道已建立', c:'green' },
    { k:'卫星',  v:'北斗导航系统正常 · 12颗卫星可用', c:'cyan' },
    { k:'情报',v:`人力情报渠道活跃 · ${intelCount}条新情报待处理`, c:'blue' },
  ];

  const el = document.getElementById('dsContent');
  if(!el) return;

  function refresh(){
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    el.innerHTML = shuffled.map(it => `
      <span class="ds-item">
        <span class="ds-key">[${it.k}]</span>
        <span class="ds-val">${it.v}</span>
        ${it.extra ? ` · ${it.extra}` : ''}
      </span>
    `).join('');
  }
  refresh();
  if(_streamTimer) clearInterval(_streamTimer);
  _streamTimer = setInterval(refresh, 12000);
}

/* 系统监控数据动画 */
let _monitorTimer = null;
function startMonitor(){
  const metrics = [
    { id:'m-cpu',  base:42, range:15 },
    { id:'m-mem',  base:68, range:10 },
    { id:'m-net',  base:55, range:20 },
    { id:'m-sec',  base:88, range:8  },
  ];
  function update(){
    for(const m of metrics){
      const bar = document.getElementById(m.id);
      if(!bar) continue;
      const v = Math.min(m.base + Math.random() * m.range, 100);
      bar.style.width = v + '%';
      const val = bar.parentElement.querySelector('.sm-val');
      if(val) val.textContent = Math.round(v) + '%';
    }
    const lat = document.getElementById('m-latency');
    if(lat) lat.textContent = (12 + Math.floor(Math.random() * 8)) + 'ms';
    const node = document.getElementById('m-nodes');
    if(node) node.textContent = String(1247 + Math.floor(Math.random() * 20)).padStart(6, '0');
  }
  update();
  if(_monitorTimer) clearInterval(_monitorTimer);
  _monitorTimer = setInterval(update, 2500);
}
