/* ================================================================
 * 国家安全战略兵棋推演平台 v12.3 — 系统引导与推演规划
 * ================================================================ */
const Onboarding = {

  STORAGE_KEY: 'nss_wgs_onboarding_done_v11',

  /* ===== 引导页步骤 ===== */
  STEPS: [
    {
      id: 'welcome',
      icon: '\u{1F6E1}\uFE0F',
      title: '\u6B22\u8FCE\u8FDB\u5165\u56FD\u5BB6\u5B89\u5168\u6218\u7565\u5175\u68CB\u63A8\u6F14\u5E73\u53F0',
      subtitle: 'v12.3',
      content: `<div style="line-height:1.9;font-size:14px">
        <div style="text-align:center;margin-bottom:16px">
          <img src="assets/logo.png" alt="西南政法大学" style="max-width:200px;height:auto;filter:drop-shadow(0 0 8px rgba(0,180,216,.20))">
        </div>
        <p style="margin-bottom:14px">
          <strong style="color:var(--cyan)">国家安全战略兵棋推演平台</strong> 是一套面向国家安全战略决策的
          <strong>多域联合推演模拟系统</strong>，
          融合军事、外交、经济、科技、情报、后勤等多域协同作战概念，
          为战略分析人员提供沉浸式推演环境和决策支持。
        </p>
        <p style="margin-bottom:14px">
          系统涵盖 <span style="color:var(--cyan)">38个战略场景</span>、
          <span style="color:var(--amber)">8大功能区</span>、
          <span style="color:var(--green)">100个真实案例</span>、
          <span style="color:var(--purple)">8条综合推演链</span>，
          支持单人推演、人工智能导调、联机对战等多种模式。
        </p>
        <div style="background:rgba(0,180,216,.08);border:1px solid rgba(0,180,216,.20);border-radius:8px;padding:14px;margin-top:12px">
          <div style="font-size:13px;color:var(--amber);margin-bottom:8px">\u26A0\uFE0F \u5B89\u5168\u63D0\u793A</div>
          <div style="font-size:12px;color:var(--txt-1);line-height:1.7">
            \u672C\u7CFB\u7EDF\u6240\u6709\u6570\u636E\u5747\u4E3A\u6A21\u62DF\u63A8\u6F14\u7528<strong>\u975E\u771F\u5B9E\u6570\u636E</strong>\uFF0C\u4E0D\u4EE3\u8868\u4EFB\u4F55\u56FD\u5BB6\u7ACB\u573A\u6216\u5B9E\u9645\u519B\u4E8B\u90E8\u7F72\u3002\u8BF7\u9075\u5B88\u76F8\u5173\u4FDD\u5BC6\u89C4\u5B9A\u3002
          </div>
        </div>
      </div>`,
    },
    {
      id: 'architecture',
      icon: '\u{1F3D7}\uFE0F',
      title: '\u516B\u5927\u529F\u80FD\u533A\u4F53\u7CFB',
      subtitle: '\u534F\u540C\u8054\u52A8 \u00B7 \u4E09\u9636\u6BB5\u63A8\u6F14\u8054\u52A8',
      content: `<div style="line-height:1.9;font-size:14px">
        <p style="margin-bottom:12px">系统由 <strong style="color:var(--cyan)">8大功能区</strong> 构成，每个区域既独立运作又深度联动，通过<strong>三阶段协同机制</strong>与推演场景无缝衔接：</p>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px">
          <div style="padding:9px 11px;background:rgba(0,180,216,.08);border:1px solid rgba(0,180,216,.18);border-radius:6px">
            <div style="font-weight:700;color:#00b4d8;margin-bottom:3px;font-size:13px">\u{1F3AF} \u5168\u57DF\u534F\u540C\u89C6\u56FE</div>
            <div style="font-size:11px;color:var(--txt-1)">\u603B\u89C8\u6240\u6709\u529F\u80FD\u533A\u534F\u540C\u72B6\u6001\uFF0C\u7BA1\u7406\u8054\u5408\u884C\u52A8\u4E0E\u8DE8\u57DF\u534F\u8C03</div>
          </div>
          <div style="padding:9px 11px;background:rgba(162,155,254,.06);border:1px solid rgba(162,155,254,.14);border-radius:6px">
            <div style="font-weight:700;color:#a29bfe;margin-bottom:3px;font-size:13px">\u{1F4E1} \u6218\u7565\u60C5\u62A5\u4E2D\u5FC3</div>
            <div style="font-size:11px;color:var(--txt-1)">\u591A\u6E90\u60C5\u62A5\u878D\u5408\uFF0C\u63A8\u6F14\u524D\u63D0\u4F9B\u60C5\u62A5\u5361\u548C\u9884\u8B66\u52A0\u6210</div>
          </div>
          <div style="padding:9px 11px;background:rgba(255,71,87,.06);border:1px solid rgba(255,71,87,.14);border-radius:6px">
            <div style="font-weight:700;color:#ff4757;margin-bottom:3px;font-size:13px">\u2694\uFE0F \u4F5C\u6218\u6307\u6325\u4E2D\u5FC3</div>
            <div style="font-size:11px;color:var(--txt-1)">\u529B\u91CF\u90E8\u7F72\u4E0E\u6218\u5907\uFF0C\u63A8\u6F14\u4E2D\u63D0\u4F9B\u519B\u4E8B\u652F\u63F4</div>
          </div>
          <div style="padding:9px 11px;background:rgba(46,213,115,.06);border:1px solid rgba(46,213,115,.14);border-radius:6px">
            <div style="font-weight:700;color:#2ed573;margin-bottom:3px;font-size:13px">\u{1F393} \u6A21\u62DF\u8BAD\u7EC3\u4E2D\u5FC3</div>
            <div style="font-size:11px;color:var(--txt-1)">\u5386\u53F2\u590D\u76D8+\u6280\u80FD\u8BAD\u7EC3\uFF0C\u5B8C\u6210\u540E\u63D0\u4F9B\u6C38\u4E45\u63A8\u6F14\u52A0\u6210</div>
          </div>
          <div style="padding:9px 11px;background:rgba(232,89,12,.06);border:1px solid rgba(232,89,12,.14);border-radius:6px">
            <div style="font-weight:700;color:#ff6348;margin-bottom:3px;font-size:13px">\u{1F69A} \u540E\u52E4\u4FDD\u969C\u4E2D\u5FC3</div>
            <div style="font-size:11px;color:var(--txt-1)">\u4F9B\u5E94\u94FE\u4E0E\u50A8\u5907\uFF0C\u63A8\u6F14\u4E2D\u63D0\u4F9B\u8D44\u6E90\u652F\u63F4</div>
          </div>
          <div style="padding:9px 11px;background:rgba(255,165,2,.06);border:1px solid rgba(255,165,2,.14);border-radius:6px">
            <div style="font-weight:700;color:#ffa502;margin-bottom:3px;font-size:13px">\u{1F4B0} \u56FD\u9632\u7ECF\u6D4E\u4E2D\u5FC3</div>
            <div style="font-size:11px;color:var(--txt-1)">\u7ECF\u6D4E\u6218\u4E0E\u91D1\u878D\u9632\u5FA1\uFF0C\u63A8\u6F14\u524D\u63D0\u4F9B\u7ECF\u6D4E\u6761\u4EF6</div>
          </div>
          <div style="padding:9px 11px;background:rgba(33,150,243,.06);border:1px solid rgba(33,150,243,.14);border-radius:6px">
            <div style="font-weight:700;color:#2196f3;margin-bottom:3px;font-size:13px">\u{1F52C} \u79D1\u6280\u4FE1\u606F\u6218\u4E2D\u5FC3</div>
            <div style="font-size:11px;color:var(--txt-1)">\u7F51\u7EDC\u653B\u9632\u4E0E\u8BA4\u77E5\u6218\uFF0C\u63A8\u6F14\u4E2D\u63D0\u4F9B\u6280\u672F\u652F\u63F4</div>
          </div>
          <div style="padding:9px 11px;background:rgba(124,77,255,.06);border:1px solid rgba(124,77,255,.14);border-radius:6px">
            <div style="font-weight:700;color:#7c4dff;margin-bottom:3px;font-size:13px">\u{1F4CB} \u63A8\u6F14\u590D\u76D8\u4E2D\u5FC3</div>
            <div style="font-size:11px;color:var(--txt-1)">\u63A8\u6F14\u540E\u5206\u6790\u4E0E\u7ECF\u9A8C\u63D0\u70BC\uFF0C\u5F62\u6210\u6301\u7EED\u6539\u8FDB\u95ED\u73AF</div>
          </div>
        </div>

        <p style="font-size:12px;color:var(--txt-1);margin-top:8px">
          <strong>场景化差异：</strong> 38个场景各有不同的功能区激活组合——
          台海场景激活所有区域，网络战场景侧重情报+科技
        </p>

        <div style="margin-top:14px;padding:12px 14px;background:linear-gradient(135deg,rgba(0,180,216,.08),rgba(162,155,254,.06));border:1px solid rgba(0,180,216,.3);border-radius:8px">
          <div style="font-weight:700;color:var(--cyan);margin-bottom:6px;font-size:14px">🌐 综合战略推演中心（新增）</div>
          <div style="font-size:12px;color:var(--txt-1);line-height:1.7">
            将多个场景串联为<strong style="color:var(--purple)">8条推演链</strong>，实现跨域效果级联分析、
            <strong style="color:var(--amber)">10条信息串并规则</strong>多源情报融合、
            <strong style="color:var(--green)">18个战略决策</strong>沙盘推演和六域加权综合评估。
          </div>
        </div>
      </div>`,
    },
    {
      id: 'synergy',
      icon: '\u{1F504}',
      title: '\u4E09\u9636\u6BB5\u63A8\u6F14\u8054\u52A8\u673A\u5236',
      subtitle: '\u63A8\u6F14\u524D\u00B7\u63A8\u6F14\u4E2D\u00B7\u63A8\u6F14\u540E \u2014\u2014 \u529F\u80FD\u533A\u4E0E\u63A8\u6F14\u6DF1\u5EA6\u878D\u5408',
      content: `<div style="line-height:1.9;font-size:14px">
        <p style="margin-bottom:14px">\u529F\u80FD\u533A\u4E0D\u662F\u5B64\u5C9B\uFF0C\u800C\u662F\u63A8\u6F14\u7684<strong style="color:var(--cyan)">\u201C\u6218\u7565\u7EB5\u6DF1\u201D</strong>\u3002\u901A\u8FC7\u4E09\u9636\u6BB5\u8054\u52A8\u673A\u5236\uFF0C\u529F\u80FD\u533A\u4E0E\u63A8\u6F14\u573A\u666F\u5F62\u6210\u5B8C\u6574\u95ED\u73AF\uFF1A</p>

        <div style="margin-bottom:12px">
          <div style="font-weight:700;color:var(--amber);margin-bottom:8px;font-size:15px">\u{1F516} \u9636\u6BB5\u4E00\uFF1A\u63A8\u6F14\u524D\u2014\u2014\u529F\u80FD\u533A\u51C6\u5907\u2192\u63D0\u4F9B\u52A0\u6210</div>
          <div style="font-size:13px;color:var(--txt-1);padding-left:8px;border-left:2px solid var(--amber)">
            \u9009\u62E9\u573A\u666F\u540E\uFF0C\u8FDB\u5165<strong>\u5BFC\u8C03\u9636\u6BB5</strong>\u3002\u5728\u5404\u529F\u80FD\u533A\u6267\u884C\u51C6\u5907\u884C\u52A8\uFF08\u5982\u300C\u542F\u52A8\u591A\u6E90\u60C5\u62A5\u641C\u96C6\u300D\u3001\u300C\u63D0\u5347\u6218\u5907\u7B49\u7EA7\u300D\u3001\u300C\u5236\u88C1\u53CD\u5236\u5DE5\u5177\u51C6\u5907\u300D\uFF09\uFF0C\u6BCF\u4E2A\u884C\u52A8\u5B8C\u6210\u540E\u63D0\u4F9B\u5BF9\u5E94\u7684\u63A8\u6F14\u52A0\u6210\uFF1A<br>
            <span style="color:var(--purple)">\u{1F4E1} \u60C5\u62A5\u5361</span> \u00B7
            <span style="color:var(--cyan)">+ \u6210\u529F\u7387</span> \u00B7
            <span style="color:var(--red)">\u2694\uFE0F \u529B\u91CF\u4FEE\u6B63</span> \u00B7
            <span style="color:var(--green)">+ \u884C\u52A8\u70B9</span> \u00B7
            <span style="color:var(--amber)">+ \u8D44\u91D1</span> \u00B7
            <span style="color:var(--blue)">\u{1F6E1}\uFE0F \u9632\u5FA1/\u5A01\u6444/\u5148\u624B/\u8054\u5408</span>
          </div>
        </div>

        <div style="margin-bottom:12px">
          <div style="font-weight:700;color:var(--green);margin-bottom:8px;font-size:15px">\u{1F525} \u9636\u6BB5\u4E8C\uFF1A\u63A8\u6F14\u4E2D\u2014\u2014\u547C\u53EB\u6218\u573A\u652F\u63F4</div>
          <div style="font-size:13px;color:var(--txt-1);padding-left:8px;border-left:2px solid var(--green)">
            \u63A8\u6F14\u8FC7\u7A0B\u4E2D\uFF0C\u4FA7\u680F\u663E\u793A<strong>\u201C\u529F\u80FD\u533A\u652F\u63F4\u201D\u9762\u677F</strong>\u3002
            \u6BCF\u4E2A\u529F\u80FD\u533A\u6574\u573A\u63A8\u6F14\u53EF\u547C\u53EB\u4E00\u6B21\u6218\u573A\u652F\u63F4\uFF08\u5982\u60C5\u62A5\u63ED\u793A\u3001\u7ECF\u6D4E\u8D44\u91D1\u6CE8\u5165\u3001\u6280\u672F\u652F\u63F4\u7B49\uFF09\uFF0C\u5B9E\u65F6\u5F71\u54CD\u6218\u5C40\u3002
            \u52A0\u6210\u81EA\u52A8\u5E94\u7528\u4E8E\u6210\u529F\u7387\u8BA1\u7B97\u548C\u884C\u52A8\u6548\u679C\u5224\u5B9A\u3002
          </div>
        </div>

        <div style="margin-bottom:14px">
          <div style="font-weight:700;color:var(--purple);margin-bottom:8px;font-size:15px">\u{1F4CA} \u9636\u6BB5\u4E09\uFF1A\u63A8\u6F14\u540E\u2014\u2014\u7ED3\u679C\u53CD\u54FA\u529F\u80FD\u533A</div>
          <div style="font-size:13px;color:var(--txt-1);padding-left:8px;border-left:2px solid var(--purple)">
            \u63A8\u6F14\u7ED3\u675F\u540E\uFF0C\u80DC\u8D1F\u3001\u5404\u57DF\u5206\u6570\u3001\u573A\u666F\u540D\u81EA\u52A8\u56DE\u5199\u529F\u80FD\u533A\u72B6\u6001\u3002
            \u590D\u76D8\u4E2D\u5FC3\u81EA\u52A8\u63D0\u70BC\u7ECF\u9A8C\u6559\u8BAD\uFF0C\u8BAD\u7EC3\u4E2D\u5FC3\u53EF\u751F\u6210\u65B0\u7684\u8BAD\u7EC3\u7D20\u6750\u3002
          </div>
        </div>

        <div style="background:rgba(8,20,40,.5);border-radius:8px;padding:12px;margin-top:12px">
          <div style="font-size:13px;color:var(--amber);margin-bottom:6px;font-weight:700">\u{1F4CB} \u63A8\u6F14\u89C4\u5212\u6D41\u7A0B</div>
          <div style="font-size:12px;color:var(--txt-1);line-height:2">
            <span style="color:var(--cyan)">\u2460 \u9009\u62E9\u573A\u666F</span> \u2192
            <span style="color:var(--amber)">\u2461 \u529F\u80FD\u533A\u51C6\u5907\uFF08\u5BFC\u8C03\u9636\u6BB5\uFF09</span> \u2192
            <span style="color:var(--green)">\u2462 \u8FDB\u5165\u63A8\u6F14\uFF08\u884C\u52A8\u2192\u63B7\u9AB0\u2192\u7ED3\u679C\uFF09</span> \u2192
            <span style="color:var(--purple)">\u2463 \u63A8\u6F14\u7ED3\u675F\u2192\u53CD\u54FA\u4E0E\u590D\u76D8</span>
          </div>
        </div>
      </div>`,
    },
    {
      id: 'role_mission',
      icon: '{{ROLE_ICON}}',
      title: '{{ROLE_TITLE}}',
      subtitle: '{{ROLE_SUBTITLE}}',
      content: '{{ROLE_CONTENT}}',
    },
    {
      id: 'mechanics',
      icon: '\u{1F3B2}',
      title: '\u6838\u5FC3\u63A8\u6F14\u673A\u5236',
      subtitle: 'd100\u9AB0\u5B50\u7CFB\u7EDF \u00B7 \u591A\u56E0\u5B50\u4FEE\u6B63 \u00B7 \u56DE\u5408\u5236',
      content: `<div style="line-height:1.9;font-size:14px">
        <p style="margin-bottom:12px">\u63A8\u6F14\u91C7\u7528 <strong style="color:var(--cyan)">d100\u9AB0\u5B50\u7CFB\u7EDF</strong>\uFF0C\u6BCF\u56DE\u5408\u6267\u884C\u884C\u52A8\u540E\u8FDB\u884C\u63B7\u9AB0\u5224\u5B9A\uFF1A</p>

        <div style="background:rgba(8,20,40,.5);border-radius:8px;padding:14px;margin-bottom:14px">
          <div style="font-size:13px;color:var(--amber);margin-bottom:8px;font-weight:700">\u6210\u529F\u7387\u8BA1\u7B97\u516C\u5F0F</div>
          <div style="font-family:Consolas,monospace;font-size:12px;color:var(--txt-1);line-height:2">
            \u57FA\u7840\u6210\u529F\u7387 = \u884C\u52A8\u57FA\u7840\u503C \u00D7 \u57DF\u52A0\u6743<br>
            \u4FEE\u6B63\u540E\u6210\u529F\u7387 = \u57FA\u7840\u7387 + \u529B\u91CF\u4FEE\u6B63 + \u60C5\u62A5\u4FEE\u6B63 + \u529F\u80FD\u533A\u52A0\u6210<br>
            <span style="color:var(--green)">\u5927\u6210\u529F</span>: \u63B7\u9AB0 \u2264 \u4FEE\u6B63\u6210\u529F\u7387 \u00D7 50% \u2192 \u6548\u679C \u00D7 1.5<br>
            <span style="color:var(--cyan)">\u6210\u529F</span>: \u63B7\u9AB0 \u2264 \u4FEE\u6B63\u6210\u529F\u7387 \u2192 \u6548\u679C \u00D7 1.0<br>
            <span style="color:var(--red)">\u5931\u8D25</span>: \u63B7\u9AB0 > \u4FEE\u6B63\u6210\u529F\u7387 \u2192 \u6548\u679C \u00D7 0.3
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:14px">
          <div style="text-align:center;padding:10px;background:rgba(46,213,115,.06);border-radius:6px">
            <div style="font-size:24px;font-weight:800;color:var(--green)">\u226450%</div>
            <div style="font-size:11px;color:var(--txt-1)">\u5927\u6210\u529F\u533A\u95F4</div>
          </div>
          <div style="text-align:center;padding:10px;background:rgba(0,180,216,.08);border-radius:6px">
            <div style="font-size:24px;font-weight:800;color:var(--cyan)">\u2264100%</div>
            <div style="font-size:11px;color:var(--txt-1)">\u6210\u529F\u533A\u95F4</div>
          </div>
          <div style="text-align:center;padding:10px;background:rgba(255,71,87,.06);border-radius:6px">
            <div style="font-size:24px;font-weight:800;color:var(--red)">>100%</div>
            <div style="font-size:11px;color:var(--txt-1)">\u5931\u8D25\u533A\u95F4</div>
          </div>
        </div>

        <div style="font-size:13px;color:var(--txt-1);line-height:2;margin-bottom:12px">
          <strong>\u529B\u91CF\u4FEE\u6B63:</strong> (\u6218\u5907\u5EA6 - 50) \u00D7 0.3%<br>
          <strong>\u60C5\u62A5\u4FEE\u6B63:</strong> \u6309\u53EF\u9760\u5EA6\u6298\u7B97(A=100%/B=70%/C=40%)<br>
          <strong>\u529F\u80FD\u533A\u4FEE\u6B63:</strong> \u5305\u542B\u6210\u529F\u7387\u52A0\u6210\u3001\u529B\u91CF\u4FEE\u6B63\u3001\u8054\u5408\u884C\u52A8\u7B49
        </div>

        <div style="background:rgba(0,180,216,.08);border:1px solid rgba(0,180,216,.18);border-radius:8px;padding:12px;margin-top:12px">
          <div style="font-size:13px;color:var(--cyan);margin-bottom:4px;font-weight:700">\u{1F4A1} 10\u79CD\u52A0\u6210\u7C7B\u578B</div>
          <div style="font-size:12px;color:var(--txt-1);line-height:1.7">
            \u60C5\u62A5\u5361 \u00B7 \u6210\u529F\u7387 \u00B7 \u529B\u91CF\u4FEE\u6B63 \u00B7
            \u989D\u5916\u884C\u52A8\u70B9 \u00B7 \u989D\u5916\u8D44\u91D1 \u00B7
            \u7ECF\u6D4E\u9632\u5FA1 \u00B7 \u9632\u5FA1 \u00B7
            \u5148\u624B\u4F18\u52BF \u00B7 \u8054\u5408\u884C\u52A8 \u00B7 \u5A01\u6444
          </div>
        </div>
      </div>`,
    },
    {
      id: 'training',
      icon: '\u{1F3EB}',
      title: '\u6A21\u62DF\u8BAD\u7EC3\u4E0E\u6280\u80FD\u6210\u957F',
      subtitle: '10\u5927\u8BAD\u7EC3\u6A21\u5757 \u00B7 \u6C38\u4E45\u63A8\u6F14\u52A0\u6210',
      content: `<div style="line-height:1.9;font-size:14px">
        <p style="margin-bottom:12px">\u6A21\u62DF\u8BAD\u7EC3\u4E2D\u5FC3\u63D0\u4F9B <strong style="color:var(--green)">10\u4E2A\u8BAD\u7EC3\u6A21\u5757</strong>\uFF0C\u5206\u4E3A\u60C5\u5883\u6A21\u62DF\u548C\u7406\u8BBA\u5B66\u4E60\u4E24\u7C7B\uFF0C\u6BCF\u4E2A\u6A21\u5757\u5B8C\u6210\u540E\u63D0\u4F9B<strong style="color:var(--cyan)">\u6C38\u4E45\u63A8\u6F14\u52A0\u6210</strong>\u3002</p>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px">
          <div style="padding:8px 10px;background:rgba(46,213,115,.05);border:1px solid rgba(46,213,115,.1);border-radius:6px">
            <div style="font-size:12px;font-weight:700;color:var(--green);margin-bottom:2px">\u{1F3B2} \u5371\u673A\u51B3\u7B56\u8BAD\u7EC3</div>
            <div style="font-size:11px;color:var(--txt-1)">\u60C5\u5883\u6A21\u62DF\u00B7\u63A8\u6F14\u6210\u529F\u7387+2%</div>
          </div>
          <div style="padding:8px 10px;background:rgba(46,213,115,.05);border:1px solid rgba(46,213,115,.1);border-radius:6px">
            <div style="font-size:12px;font-weight:700;color:var(--green);margin-bottom:2px">\u{1F4E1} \u60C5\u62A5\u5206\u6790\u8BAD\u7EC3</div>
            <div style="font-size:11px;color:var(--txt-1)">\u60C5\u5883\u6A21\u62DF\u00B7\u989D\u5916\u60C5\u62A5\u5361+1</div>
          </div>
          <div style="padding:8px 10px;background:rgba(33,150,243,.05);border:1px solid rgba(33,150,243,.1);border-radius:6px">
            <div style="font-size:12px;font-weight:700;color:var(--blue);margin-bottom:2px">\u{1F310} \u7F51\u7EDC\u6218\u8BAD\u7EC3</div>
            <div style="font-size:11px;color:var(--txt-1)">\u60C5\u5883\u6A21\u62DF\u00B7\u7F51\u7EDC\u57DF\u6210\u529F\u7387+3%</div>
          </div>
          <div style="padding:8px 10px;background:rgba(255,165,2,.05);border:1px solid rgba(255,165,2,.1);border-radius:6px">
            <div style="font-size:12px;font-weight:700;color:var(--amber);margin-bottom:2px">\u{1F4B0} \u7ECF\u6D4E\u6218\u8BAD\u7EC3</div>
            <div style="font-size:11px;color:var(--txt-1)">\u60C5\u5883\u6A21\u62DF\u00B7\u7ECF\u6D4E\u57DF\u6210\u529F\u7387+3%</div>
          </div>
          <div style="padding:8px 10px;background:rgba(232,89,12,.05);border:1px solid rgba(232,89,12,.1);border-radius:6px">
            <div style="font-size:12px;font-weight:700;color:var(--orange);margin-bottom:2px">\u{1F69A} \u540E\u52E4\u89C4\u5212\u8BAD\u7EC3</div>
            <div style="font-size:11px;color:var(--txt-1)">\u60C5\u5883\u6A21\u62DF\u00B7\u989D\u5916\u8D44\u91D1+300\u4EBF</div>
          </div>
          <div style="padding:8px 10px;background:rgba(162,155,254,.05);border:1px solid rgba(162,155,254,.1);border-radius:6px">
            <div style="font-size:12px;font-weight:700;color:var(--purple);margin-bottom:2px">\u2694\uFE0F \u8054\u5408\u4F5C\u6218\u8BAD\u7EC3</div>
            <div style="font-size:11px;color:var(--txt-1)">\u60C5\u5883\u6A21\u62DF\u00B7\u519B\u4E8B\u57DF\u6210\u529F\u7387+3%</div>
          </div>
          <div style="padding:8px 10px;background:rgba(0,188,212,.05);border:1px solid rgba(0,188,212,.1);border-radius:6px">
            <div style="font-size:12px;font-weight:700;color:#00bcd4;margin-bottom:2px">\u{1F4CB} \u6218\u7565\u8BC4\u4F30\u8BAD\u7EC3</div>
            <div style="font-size:11px;color:var(--txt-1)">\u7406\u8BBA\u5B66\u4E60\u00B7\u6218\u7565\u5A01\u6444+5%</div>
          </div>
          <div style="padding:8px 10px;background:rgba(0,188,212,.05);border:1px solid rgba(0,188,212,.1);border-radius:6px">
            <div style="font-size:12px;font-weight:700;color:var(--cyan);margin-bottom:2px">\u{1F4A1} \u7EA2\u84DD\u5BF9\u6297\u8BAD\u7EC3</div>
            <div style="font-size:11px;color:var(--txt-1)">\u7406\u8BBA\u5B66\u4E60\u00B7\u5148\u624B\u4F18\u52BF\u6982\u7387+5%</div>
          </div>
        </div>

        <div style="background:rgba(255,165,2,.05);border:1px solid rgba(255,165,2,.12);border-radius:8px;padding:11px">
          <div style="font-size:12px;color:var(--amber);margin-bottom:3px">\u{1F4A1} \u63A8\u6F14\u89C4\u5212\u5EFA\u8BAE</div>
          <div style="font-size:12px;color:var(--txt-1)">
            \u2460 \u5148\u5B8C\u6210\u6A21\u62DF\u8BAD\u7EC3\u83B7\u53D6\u6C38\u4E45\u52A0\u6210 \u2192
            \u2461 \u9009\u62E9\u573A\u666F\u8FDB\u884C\u529F\u80FD\u533A\u51C6\u5907 \u2192
            \u2462 \u5F00\u59CB\u63A8\u6F14\uFF0C\u7075\u6D3B\u547C\u53EB\u529F\u80FD\u533A\u652F\u63F4
          </div>
        </div>
      </div>`,
    },
    {
      id: 'start',
      icon: '\u{1F680}',
      title: '\u51C6\u5907\u5C31\u7EEA',
      subtitle: '\u73B0\u5728\u5F00\u59CB\u60A8\u7684\u6218\u7565\u4E4B\u65C5',
      content: `<div style="text-align:center;line-height:1.9;font-size:14px">
        <div style="font-size:60px;margin-bottom:16px">\u{1F6E1}\uFE0F</div>
        <p style="margin-bottom:14px;font-size:16px">
          \u60A8\u5DF2\u83B7\u5F97 <strong style="color:var(--cyan)" id="obClearance">\u673A\u5BC6\u7EA7</strong> \u6388\u6743\uFF0C
          \u7CFB\u7EDF\u5DF2\u6839\u636E\u60A8\u7684\u89D2\u8272\u914D\u7F6E\u4E86\u9ED8\u8BA4\u5DE5\u4F5C\u754C\u9762\u3002
        </p>

        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:14px;text-align:left">
          <div style="padding:12px;background:rgba(0,180,216,.08);border:1px solid rgba(0,180,216,.18);border-radius:6px">
            <div style="font-size:11px;color:var(--txt-2)">可用场景</div>
            <div style="font-size:22px;font-weight:700;color:var(--cyan)">38个</div>
          </div>
          <div style="padding:12px;background:rgba(46,213,115,.05);border:1px solid rgba(46,213,115,.12);border-radius:6px">
            <div style="font-size:11px;color:var(--txt-2)">案例库</div>
            <div style="font-size:22px;font-weight:700;color:var(--green)">100个</div>
          </div>
          <div style="padding:12px;background:rgba(255,165,2,.05);border:1px solid rgba(255,165,2,.12);border-radius:6px">
            <div style="font-size:11px;color:var(--txt-2)">功能区</div>
            <div style="font-size:22px;font-weight:700;color:var(--amber)">8大区</div>
          </div>
          <div style="padding:12px;background:rgba(162,155,254,.05);border:1px solid rgba(162,155,254,.12);border-radius:6px">
            <div style="font-size:11px;color:var(--txt-2)">综合推演链</div>
            <div style="font-size:22px;font-weight:700;color:var(--purple)">8条</div>
          </div>
          <div style="padding:12px;background:rgba(33,150,243,.05);border:1px solid rgba(33,150,243,.12);border-radius:6px">
            <div style="font-size:11px;color:var(--txt-2)">串并规则</div>
            <div style="font-size:22px;font-weight:700;color:var(--blue)">10条</div>
          </div>
          <div style="padding:12px;background:rgba(255,71,87,.05);border:1px solid rgba(255,71,87,.12);border-radius:6px">
            <div style="font-size:11px;color:var(--txt-2)">战略决策</div>
            <div style="font-size:22px;font-weight:700;color:var(--red)">18项</div>
          </div>
        </div>

        <p style="font-size:13px;color:var(--txt-1)">
          \u70B9\u51FB\u4E0B\u65B9\u6309\u94AE\u8FDB\u5165\u6307\u6325\u4E2D\u5FC3\u3002<br>
          \u5DE6\u4FA7\u5BFC\u822A\u680F\u53EF\u968F\u65F6\u5207\u6362\u529F\u80FD\u533A\uFF0C\u9876\u90E8\u680F\u53EF\u5207\u6362\u63A8\u6F14\u89C6\u56FE\u3002
        </p>
      </div>`,
    }
  ],

  /* ===== 检查是否需要引导（sessionStorage: 每次登录后显示，刷新不重复） ===== */
  needsOnboarding(){
    return !sessionStorage.getItem(this.STORAGE_KEY);
  },

  /* ===== 标记引导已完成（本次会话内不再显示） ===== */
  markDone(){
    sessionStorage.setItem(this.STORAGE_KEY, 'done');
  },

  /* ===== 渲染引导界面 ===== */
  render(currentStep = 0){
    if(currentStep >= this.STEPS.length) return null;
    const step = this.STEPS[currentStep];
    const isLast = currentStep === this.STEPS.length - 1;
    const progressPct = ((currentStep + 1) / this.STEPS.length * 100).toFixed(0);

    // 角色使命步骤：动态注入角色特定内容
    let contentHtml = step.content;
    let titleHtml = step.title;
    let subtitleHtml = step.subtitle;
    let iconHtml = step.icon;
    if(step.id === 'role_mission'){
      const rp = (typeof RoleSystem !== 'undefined') ? RoleSystem.getProfile() : { roleId:'trainee', roleName:'见习学员', roleColor:'#7a8aa8' };
      const ro = (typeof RoleSystem !== 'undefined') ? RoleSystem.getOnboarding() : ROLE_ONBOARDING.trainee;
      if(ro){
        titleHtml = ro.title;
        subtitleHtml = ro.subtitle;
        contentHtml = ro.content;
        const roleCfg = (typeof Auth !== 'undefined') ? (Auth.ROLES[rp.roleId] || {}) : {};
        if(roleCfg.color) iconHtml = `<span style="font-size:40px">${roleCfg.name === '总指挥' ? '🛡️' : roleCfg.name === '战略分析员' ? '🧠' : roleCfg.name === '情报分析员' ? '🔍' : roleCfg.name === '经济战备官' ? '💹' : roleCfg.name === '外交战略官' ? '🤝' : roleCfg.name === '科技战备官' ? '💻' : roleCfg.name === '后勤保障官' ? '📦' : '📚'}</span>`;
      }
    }

    // 更新最后一步的授权信息
    if(step.id === 'start'){
      const session = (typeof Auth !== 'undefined') ? Auth.getSession() : null;
      if(session){
        const cl = (typeof Auth !== 'undefined') ? Auth.CLEARANCES[session.clearance] : null;
        if(cl){
          contentHtml = contentHtml.replace('\u673A\u5BC6\u7EA7', cl.name + '\u7EA7');
        }
      }
    }

    return `
    <div id="onboardingOverlay" style="position:fixed;inset:0;z-index:10000;background:rgba(5,8,16,.95);display:flex;align-items:center;justify-content:center">
      <div style="position:relative;width:780px;max-width:92vw;max-height:88vh;overflow-y:auto">
        <!-- 进度条 -->
        <div style="margin-bottom:24px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <span style="font-size:12px;color:var(--txt-2);letter-spacing:2px">\u7CFB\u7EDF\u5F15\u5BFC</span>
            <span style="font-size:12px;color:var(--cyan);font-family:Consolas,monospace">${currentStep + 1} / ${this.STEPS.length}</span>
          </div>
          <div style="height:3px;background:rgba(0,180,216,.10);border-radius:2px;overflow:hidden">
            <div style="height:100%;width:${progressPct}%;background:linear-gradient(90deg,var(--cyan-dim),var(--cyan));border-radius:2px;transition:width .4s"></div>
          </div>
        </div>

        <!-- 步骤图标 -->
        <div style="text-align:center;margin-bottom:20px">
          <div style="width:72px;height:72px;margin:0 auto 14px;border-radius:18px;background:linear-gradient(135deg,rgba(0,180,216,.20),rgba(162,155,254,.1));border:1px solid var(--border-mid);display:flex;align-items:center;justify-content:center;font-size:34px">${iconHtml}</div>
          <div style="font-size:22px;font-weight:800;letter-spacing:.5px;margin-bottom:4px">${titleHtml}</div>
          <div style="font-size:12px;color:var(--txt-2);letter-spacing:1.5px">${subtitleHtml}</div>
        </div>

        <!-- 内容 -->
        <div style="background:var(--bg-panel);border:1px solid var(--border);border-radius:12px;padding:24px 32px;margin-bottom:20px">
          ${contentHtml}
        </div>

        <!-- 按钮 -->
        <div style="display:flex;gap:12px;justify-content:center">
          ${currentStep > 0 ? `
            <button onclick="Onboarding.prev(${currentStep})" style="padding:11px 28px;font-size:14px;background:transparent;color:var(--txt-1);border:1px solid var(--border);border-radius:6px;cursor:pointer;transition:all .25s;font-family:inherit"
              onmouseover="this.style.borderColor='var(--cyan)';this.style.color='var(--cyan)'"
              onmouseout="this.style.borderColor='var(--border)';this.style.color='var(--txt-1)'">
              \u2190 \u4E0A\u4E00\u6B65
            </button>
          ` : ''}
          ${isLast ? `
            <button onclick="Onboarding.finish()" style="padding:11px 32px;font-size:14px;font-weight:700;background:linear-gradient(135deg,var(--cyan),var(--cyan-dim));color:#fff;border:none;border-radius:6px;cursor:pointer;transition:all .25s;letter-spacing:.5px;font-family:inherit"
              onmouseover="this.style.boxShadow='0 0 20px rgba(0,180,216,.4)'"
              onmouseout="this.style.boxShadow='none'">
              \u8FDB\u5165\u6307\u6325\u4E2D\u5FC3 \u{1F680}
            </button>
          ` : `
            <button onclick="Onboarding.next(${currentStep})" style="padding:11px 32px;font-size:14px;font-weight:700;background:linear-gradient(135deg,var(--cyan),var(--cyan-dim));color:#fff;border:none;border-radius:6px;cursor:pointer;transition:all .25s;letter-spacing:.5px;font-family:inherit"
              onmouseover="this.style.boxShadow='0 0 20px rgba(0,180,216,.4)'"
              onmouseout="this.style.boxShadow='none'">
              \u4E0B\u4E00\u6B65 \u2192
            </button>
          `}
        </div>

        ${!isLast ? `
          <div style="text-align:center;margin-top:12px">
            <button onclick="Onboarding.finish()" style="background:none;border:none;color:var(--txt-2);font-size:12px;cursor:pointer;text-decoration:underline;font-family:inherit;padding:4px 8px">\u8DF3\u8FC7\u5F15\u5BFC\uFF0C\u76F4\u63A5\u8FDB\u5165</button>
          </div>
        ` : ''}
      </div>
    </div>`;
  },

  /* ===== 下一步 ===== */
  next(currentStep){
    this.show(currentStep + 1);
  },

  /* ===== 上一步 ===== */
  prev(currentStep){
    this.show(currentStep - 1);
  },

  /* ===== 显示指定步骤 ===== */
  show(step){
    const html = this.render(step);
    if(!html) return;
    const existing = document.getElementById('onboardingOverlay');
    if(existing) existing.remove();
    const div = document.createElement('div');
    div.innerHTML = html;
    document.body.appendChild(div.firstElementChild);
  },

  /* ===== 完成引导 ===== */
  finish(){
    this.markDone();
    const overlay = document.getElementById('onboardingOverlay');

    // 延迟初始化 App 的函数（确保 overlay 已移除或淡出完成）
    const initApp = () => {
      try {
        if(typeof App !== 'undefined' && App.init){
          console.log('[Onboarding.finish] 调用 App.init()');
          App.init();
        } else {
          console.warn('[Onboarding.finish] App.init 未找到');
          const app = document.getElementById('app');
          if(app) app.innerHTML = '<div style="color:#ff4757;padding:40px;text-align:center"><h2>系统初始化失败</h2><p>App 模块未正确加载。</p><button onclick="location.reload()" style="padding:10px 24px;background:#ff4757;color:#fff;border:none;border-radius:4px;cursor:pointer">刷新重试</button></div>';
        }
      } catch(e){
        // App.init 内部已有错误显示逻辑，这里只记录日志
        console.error('[Onboarding.finish] App.init 失败:', e.message);
      }
    };

    if(overlay){
      overlay.style.transition = 'opacity .3s';
      overlay.style.opacity = '0';
      setTimeout(() => {
        if(overlay.parentNode) overlay.remove();
        initApp();
      }, 300);
    } else {
      console.warn('[Onboarding.finish] overlay 未找到，直接初始化');
      initApp();
    }
  },

  /* ===== 显示引导（入口函数） ===== */
  start(){
    if(this.needsOnboarding()){
      this.show(0);
      return true; // 显示引导
    }
    return false; // 无需引导
  }
};

// 全局导出
if(typeof window !== 'undefined') window.Onboarding = Onboarding;
