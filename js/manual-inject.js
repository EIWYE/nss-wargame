/**
 * 操作手册注入脚本 v1.0
 * 不修改任何现有代码，通过DOM监听将操作手册入口注入到"系统设置"页面
 * 在 index.html 中通过 <script src="js/manual-inject.js"></script> 加载
 */
(function() {
  'use strict';

  var MANUAL_PDF = 'assets/manual/国家安全战略兵棋推演平台操作手册.pdf';
  var MANUAL_HTML = 'assets/manual/operation-manual.html';
  var injected = false;

  function injectManualEntry() {
    if (injected) return;

    // 查找系统设置面板
    var settingsPanel = document.querySelector('.panel-title');
    if (!settingsPanel) return;

    var panelFound = false;
    var allPanelTitles = document.querySelectorAll('.panel-title');
    allPanelTitles.forEach(function(t) {
      if (t.textContent.indexOf('系统设置') !== -1) {
        panelFound = true;
      }
    });
    if (!panelFound) return;

    // 查找 settings-list
    var settingsList = document.querySelector('.settings-list');
    if (!settingsList) return;

    // 检查是否已注入
    if (document.getElementById('manual-inject-row')) return;
    injected = true;

    // 创建手册入口行
    var row = document.createElement('div');
    row.id = 'manual-inject-row';
    row.className = 'setting-row';
    row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:14px 16px;border-bottom:1px solid var(--border,rgba(0,180,216,.12))';

    row.innerHTML = 
      '<div class="sr-info" style="flex:1">' +
        '<div class="sr-name" style="font-size:14px;font-weight:600;color:var(--txt-0,#e0e0e0)">📖 操作手册（PDF）</div>' +
        '<div class="sr-desc" style="font-size:12px;color:var(--txt-2,#4a6b8a);margin-top:2px">国家安全战略兵棋推演平台全方位介绍与操作指南（约50页）</div>' +
      '</div>' +
      '<div class="sr-control" style="display:flex;gap:8px;align-items:center">' +
        '<button class="btn btn-sm" id="manual-view-btn" style="background:rgba(0,180,216,.20);color:var(--cyan,#00b4d8);border:1px solid rgba(0,180,216,.4);padding:6px 14px;border-radius:4px;cursor:pointer;font-size:13px;transition:all .2s">在线阅读</button>' +
        '<button class="btn btn-sm" id="manual-download-btn" style="background:rgba(46,213,115,.12);color:var(--green,#2ed573);border:1px solid rgba(46,213,115,.3);padding:6px 14px;border-radius:4px;cursor:pointer;font-size:13px;transition:all .2s">下载PDF</button>' +
      '</div>';

    // 插入到 settings-list 的第一个位置（在界面字号之前）
    settingsList.insertBefore(row, settingsList.firstChild);

    // 绑定在线阅读按钮
    var viewBtn = document.getElementById('manual-view-btn');
    if (viewBtn) {
      viewBtn.addEventListener('click', function() {
        window.open(MANUAL_HTML, '_blank');
      });
      viewBtn.addEventListener('mouseenter', function() {
        this.style.background = 'rgba(0,180,216,.35)';
      });
      viewBtn.addEventListener('mouseleave', function() {
        this.style.background = 'rgba(0,180,216,.20)';
      });
    }

    // 绑定下载PDF按钮
    var downloadBtn = document.getElementById('manual-download-btn');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', function() {
        var a = document.createElement('a');
        a.href = MANUAL_PDF;
        a.download = '国家安全战略兵棋推演平台操作手册.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      });
      downloadBtn.addEventListener('mouseenter', function() {
        this.style.background = 'rgba(46,213,115,.2)';
      });
      downloadBtn.addEventListener('mouseleave', function() {
        this.style.background = 'rgba(46,213,115,.12)';
      });
    }
  }

  // 使用 MutationObserver 监听 DOM 变化
  var observer = new MutationObserver(function(mutations) {
    // 重置 injected 标志以允许在切换页面后重新注入
    var currentTab = document.querySelector('.nav-item.active, .tab-item.active');
    injected = false;
    setTimeout(injectManualEntry, 100);
  });

  // 开始观察
  if (document.getElementById('app')) {
    observer.observe(document.getElementById('app'), {
      childList: true,
      subtree: true
    });
  }

  // 初始尝试
  setTimeout(injectManualEntry, 500);
  setTimeout(injectManualEntry, 1500);
  setTimeout(injectManualEntry, 3000);
})();
