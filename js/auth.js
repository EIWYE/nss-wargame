/* ================================================================
 * NSS-WGS v10.0 — 认证与用户管理系统
 * ================================================================ */
const Auth = {

  SESSION_KEY: 'nss_wgs_session',
  USERS_KEY: 'nss_wgs_users',
  TIMEOUT_MS: 30 * 60 * 1000, // 30分钟超时

  /* ===== 安全等级体系 ===== */
  CLEARANCES: {
    top_secret:  { level:4, name:'绝密',    code:'TS', color:'#ff4757', desc:'可访问所有战略资源和推演数据' },
    secret:      { level:3, name:'机密',    code:'S',  color:'#ffa502', desc:'可访问绝大多数功能模块' },
    confidential:{ level:2, name:'秘密',    code:'C',  color:'#00b4d8', desc:'可访问基础推演和一般数据' },
    internal:    { level:1, name:'内部',    code:'I',  color:'#2ed573', desc:'仅限查看和学习场景' },
  },

  ROLES: {
    commander:      { name:'总指挥',   color:'#ff4757' },
    strategist:     { name:'战略分析员', color:'#a29bfe' },
    analyst:        { name:'情报分析员', color:'#00b4d8' },
    economist:      { name:'经济战备官', color:'#ffa502' },
    diplomat:       { name:'外交战略官', color:'#2ed573' },
    tech_officer:   { name:'科技战备官', color:'#2196f3' },
    logistics:      { name:'后勤保障官', color:'#ff6348' },
    trainee:        { name:'见习学员',   color:'#7a8aa8' },
  },

  /* ===== 简单哈希（本地存储用，非安全目的） ===== */
  _hash(str){
    let h = 0;
    for(let i = 0; i < str.length; i++){
      const c = str.charCodeAt(i);
      h = ((h << 5) - h) + c;
      h |= 0;
    }
    return 'nss_' + Math.abs(h).toString(36) + '_' + str.length.toString(36);
  },

  /* ===== 获取所有用户 ===== */
  _getUsers(){
    try { return JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]'); }
    catch(e) { return []; }
  },

  _saveUsers(users){
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  },

  /* ===== 初始化默认管理员账号 ===== */
  initDefaultAdmin(){
    const users = this._getUsers();
    if(users.length === 0){
      users.push({
        id: 'admin_001',
        username: 'admin',
        password: this._hash('admin123'),
        name: '战略总指挥',
        role: 'commander',
        clearance: 'top_secret',
        org: '国家安全战略指挥中心',
        email: 'admin@nss.gov.cn',
        avatar: '🛡️',
        createdAt: new Date().toISOString(),
        lastLogin: null,
        loginCount: 0,
      });
      this._saveUsers(users);
    }
  },

  /* ===== 注册 ===== */
  register({ username, password, name, role, clearance, org, email }){
    if(!username || !password || !name){ return { ok:false, msg:'用户名、密码和姓名不能为空' }; }
    if(username.length < 3){ return { ok:false, msg:'用户名至少3个字符' }; }
    if(password.length < 6){ return { ok:false, msg:'密码至少6个字符' }; }

    const users = this._getUsers();
    if(users.find(u => u.username === username)){
      return { ok:false, msg:'该用户名已被注册' };
    }

    const user = {
      id: 'user_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2,6),
      username,
      password: this._hash(password),
      name,
      role: role || 'trainee',
      clearance: clearance || 'internal',
      org: org || '战略研究院',
      email: email || '',
      avatar: username[0].toUpperCase(),
      createdAt: new Date().toISOString(),
      lastLogin: null,
      loginCount: 0,
    };

    users.push(user);
    this._saveUsers(users);
    return { ok:true, msg:'注册成功', user };
  },

  /* ===== 登录 ===== */
  login(username, password){
    if(!username || !password){ return { ok:false, msg:'请输入用户名和密码' }; }

    const users = this._getUsers();
    const user = users.find(u => u.username === username);
    if(!user){ return { ok:false, msg:'用户名或密码错误' }; }

    const hash = this._hash(password);
    if(user.password !== hash){ return { ok:false, msg:'用户名或密码错误' }; }

    // 更新登录记录
    user.lastLogin = new Date().toISOString();
    user.loginCount = (user.loginCount || 0) + 1;
    this._saveUsers(users);

    // 创建会话
    const session = {
      userId: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      clearance: user.clearance,
      org: user.org,
      email: user.email,
      avatar: user.avatar,
      isFirstLogin: user.loginCount <= 1,
      token: 'tok_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2,10),
      issuedAt: Date.now(),
    };

    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    return { ok:true, msg:'登录成功', session };
  },

  /* ===== 登出 ===== */
  logout(){
    localStorage.removeItem(this.SESSION_KEY);
    // 清除引导标记，确保下次登录重新显示
    sessionStorage.removeItem('nss_wgs_onboarding_done_v11');
  },

  /* ===== 获取当前会话 ===== */
  getSession(){
    try {
      const s = JSON.parse(localStorage.getItem(this.SESSION_KEY));
      if(!s) return null;
      // 检查超时
      if(Date.now() - s.issuedAt > this.TIMEOUT_MS){
        this.logout();
        return null;
      }
      // 续期
      s.issuedAt = Date.now();
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(s));
      return s;
    } catch(e) { return null; }
  },

  /* ===== 是否已登录 ===== */
  isLoggedIn(){
    return !!this.getSession();
  },

  /* ===== 切换角色(更新session) ===== */
  switchRole(newRole){
    const session = this.getSession();
    if(!session) return false;
    if(!this.ROLES[newRole]) return false;
    session.role = newRole;
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    return true;
  },

  /* ===== 获取用户完整信息 ===== */
  getUserInfo(){
    const session = this.getSession();
    if(!session) return null;
    const users = this._getUsers();
    const user = users.find(u => u.id === session.userId);
    return user ? { ...session, ...user, clearanceInfo: this.CLEARANCES[session.clearance] } : null;
  },

  /* ===== 检查权限 ===== */
  checkAccess(minClearance){
    const session = this.getSession();
    if(!session) return false;
    const userLevel = (this.CLEARANCES[session.clearance] || {}).level || 0;
    const requiredLevel = (this.CLEARANCES[minClearance] || {}).level || 0;
    return userLevel >= requiredLevel;
  },

  /* ===== 获取所有用户列表（仅管理员） ===== */
  listUsers(){
    const session = this.getSession();
    if(!session || session.clearance !== 'top_secret') return [];
    return this._getUsers().map(u => ({
      id: u.id, username: u.username, name: u.name,
      role: u.role, clearance: u.clearance, org: u.org,
      lastLogin: u.lastLogin, loginCount: u.loginCount, createdAt: u.createdAt,
    }));
  },
};

// 初始化默认管理员
if(typeof localStorage !== 'undefined'){
  Auth.initDefaultAdmin();
}

// 全局导出
if(typeof window !== 'undefined') window.Auth = Auth;
