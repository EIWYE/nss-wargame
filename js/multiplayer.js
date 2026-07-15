/* ================================================================
 * NSS-WGS v12.0 — 跨浏览器联机对弈客户端模块
 *
 * 功能:
 *   1. WebSocket连接管理（自动重连、心跳测延迟）
 *   2. 房间创建/加入/离开
 *   3. 阵营选择与准备
 *   4. 行动提交与裁决接收
 *   5. 聊天消息收发
 *   6. 游戏状态同步
 *   7. 回调通知系统（驱动UI更新）
 *
 * 架构:
 *   - 本模块作为WebSocket客户端，与server.js通信
 *   - 通过回调函数通知UI层更新
 *   - 游戏逻辑（掷骰/裁决）在服务器端执行，确保公平
 * ================================================================ */

const Multiplayer = {
  ws: null,
  connected: false,
  connecting: false,
  playerId: null,
  playerName: '匿名指挥员',
  side: null,
  room: null,
  latency: 0,
  reconnectAttempts: 0,
  maxReconnectAttempts: 5,
  reconnectTimer: null,
  heartbeatTimer: null,
  lastHeartbeat: 0,

  /* ===== 回调函数（由app.js注册） ===== */
  onConnect: null,
  onDisconnect: null,
  onRoomCreated: null,
  onRoomJoined: null,
  onOpponentJoined: null,
  onOpponentLeft: null,
  onSideSelected: null,
  onPlayerReady: null,
  onGameStarted: null,
  onDirectorEvent: null,
  onActionSubmitted: null,
  onRoundResolution: null,
  onNextRound: null,
  onGameEnd: null,
  onChat: null,
  onRoomList: null,
  onError: null,

  /* ===== 服务器地址 ===== */
  serverUrl: (() => {
    const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${proto}//${location.hostname}:9099`;
  })(),

  /* ===== 连接服务器 ===== */
  connect(){
    if(this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return true;
    }
    if(this.connecting) return false;
    this.connecting = true;

    try {
      this.ws = new WebSocket(this.serverUrl);

      this.ws.onopen = () => {
        this.connected = true;
        this.connecting = false;
        this.reconnectAttempts = 0;
        console.log('[Multiplayer] Connected to server');

        /* 注册玩家 */
        this.playerId = this.playerId || ('P' + Math.random().toString(36).substring(2, 8).toUpperCase());
        this.send({
          type: 'register',
          playerId: this.playerId,
          name: this.playerName,
        });

        /* 启动心跳 */
        this.startHeartbeat();

        if(this.onConnect) this.onConnect();
      };

      this.ws.onclose = () => {
        this.connected = false;
        this.connecting = false;
        this.stopHeartbeat();
        console.log('[Multiplayer] Disconnected from server');

        if(this.onDisconnect) this.onDisconnect();

        /* 自动重连 */
        if(this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          const delay = Math.min(1000 * this.reconnectAttempts, 5000);
          console.log(`[Multiplayer] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
          this.reconnectTimer = setTimeout(() => this.connect(), delay);
        }
      };

      this.ws.onerror = (err) => {
        console.warn('[Multiplayer] Connection error');
        this.connected = false;
        this.connecting = false;
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          this.handleMessage(msg);
        } catch(e) {
          console.warn('[Multiplayer] Failed to parse message:', e);
        }
      };

      return true;
    } catch(e) {
      console.warn('[Multiplayer] Cannot connect:', e);
      this.connecting = false;
      return false;
    }
  },

  /* ===== 发送消息 ===== */
  send(data){
    if(this.ws && this.ws.readyState === WebSocket.OPEN){
      this.ws.send(JSON.stringify(data));
      return true;
    }
    return false;
  },

  /* ===== 心跳测延迟 ===== */
  startHeartbeat(){
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if(this.ws && this.ws.readyState === WebSocket.OPEN){
        const ts = Date.now();
        this.lastHeartbeat = ts;
        this.send({ type: 'ping', timestamp: ts });
      }
    }, 5000);
  },

  stopHeartbeat(){
    if(this.heartbeatTimer){
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  },

  /* ===== 处理服务器消息 ===== */
  handleMessage(msg){
    switch(msg.type){
      case 'registered':
        console.log('[Multiplayer] Registered as', msg.playerId);
        break;

      case 'pong':
        this.latency = Date.now() - (msg.timestamp || this.lastHeartbeat);
        break;

      case 'heartbeat':
        /* 服务器心跳，更新最后活动 */
        break;

      case 'room_created':
        this.room = {
          code: msg.roomCode,
          scenario: msg.scenario,
          playerInfo: msg.playerInfo,
          gameState: null,
        };
        if(this.onRoomCreated) this.onRoomCreated(msg);
        break;

      case 'room_joined':
        this.room = {
          code: msg.roomCode,
          scenario: msg.scenario,
          playerInfo: msg.playerInfo,
          gameState: null,
        };
        if(this.onRoomJoined) this.onRoomJoined(msg);
        break;

      case 'opponent_joined':
        if(this.room) {
          this.room.playerInfo = msg.playerInfo;
        }
        if(this.onOpponentJoined) this.onOpponentJoined(msg);
        break;

      case 'opponent_left':
        if(this.room) {
          /* 清除离开的玩家信息 */
          if(this.room.playerInfo) {
            delete this.room.playerInfo[msg.playerId];
          }
        }
        if(this.onOpponentLeft) this.onOpponentLeft(msg);
        break;

      case 'side_selected':
        if(this.room) this.room.playerInfo = msg.playerInfo;
        if(this.onSideSelected) this.onSideSelected(msg);
        break;

      case 'player_ready':
        if(this.room) this.room.playerInfo = msg.playerInfo;
        if(this.onPlayerReady) this.onPlayerReady(msg);
        break;

      case 'game_started':
        if(this.room) this.room.gameState = msg.gameState;
        if(this.onGameStarted) this.onGameStarted(msg);
        break;

      case 'director_event':
        if(this.onDirectorEvent) this.onDirectorEvent(msg);
        break;

      case 'action_submitted':
        if(this.onActionSubmitted) this.onActionSubmitted(msg);
        break;

      case 'round_resolution':
        if(this.room && this.room.gameState) {
          this.room.gameState.domains = msg.resolution.domains;
          this.room.gameState.scores = msg.resolution.totalScores;
          this.room.gameState.escalation = msg.resolution.escalation;
        }
        if(this.onRoundResolution) this.onRoundResolution(msg);
        break;

      case 'next_round':
        if(this.room && this.room.gameState) {
          this.room.gameState.round = msg.round;
        }
        if(this.onNextRound) this.onNextRound(msg);
        break;

      case 'game_end':
        if(this.room && this.room.gameState) {
          this.room.gameState.phase = 'ended';
        }
        if(this.onGameEnd) this.onGameEnd(msg);
        break;

      case 'chat':
        if(this.onChat) this.onChat(msg);
        break;

      case 'room_list':
        if(this.onRoomList) this.onRoomList(msg.rooms);
        break;

      case 'error':
        console.warn('[Multiplayer] Server error:', msg.message);
        if(this.onError) this.onError(msg);
        break;
    }
  },

  /* ===== 创建房间 ===== */
  createRoom(scenario){
    if(!this.connect()){
      return null;
    }
    const code = this.genRoomCode();
    this.send({
      type: 'create_room',
      roomCode: code,
      playerId: this.playerId,
      name: this.playerName,
      scenario: {
        id: scenario.id,
        name: scenario.name,
        maxRounds: scenario.duration || 5,
        budget: scenario.budget || 1000,
      },
    });
    this.room = { code, scenario, playerInfo: {}, gameState: null };
    return code;
  },

  /* ===== 创建公开房间（快速匹配） ===== */
  createPublicRoom(scenario){
    if(!this.connect()){
      return null;
    }
    const code = this.genRoomCode();
    this.send({
      type: 'create_room',
      roomCode: code,
      playerId: this.playerId,
      name: this.playerName,
      scenario: {
        id: scenario.id,
        name: scenario.name,
        maxRounds: scenario.duration || 5,
        budget: scenario.budget || 1000,
      },
      public: true,
    });
    this.room = { code, scenario, playerInfo: {}, gameState: null };
    return code;
  },

  /* ===== 加入房间 ===== */
  joinRoom(code, scenario){
    if(!this.connect()){
      return false;
    }
    this.send({
      type: 'join_room',
      roomCode: code,
      playerId: this.playerId,
      name: this.playerName,
      scenario: scenario ? scenario.id : null,
    });
    return true;
  },

  /* ===== 快速匹配 ===== */
  quickMatch(scenario){
    if(!this.connect()) return null;
    /* 先尝试加入已有公开房间 */
    /* 如果没有，创建一个公开房间 */
    const code = this.genRoomCode();
    this.send({
      type: 'create_room',
      roomCode: code,
      playerId: this.playerId,
      name: this.playerName,
      scenario: {
        id: scenario.id,
        name: scenario.name,
        maxRounds: scenario.duration || 5,
        budget: scenario.budget || 1000,
      },
      public: true,
    });
    this.room = { code, scenario, playerInfo: {}, gameState: null };
    return code;
  },

  /* ===== 选择阵营 ===== */
  selectSide(side){
    this.side = side;
    this.send({
      type: 'select_side',
      playerId: this.playerId,
      side: side,
    });
  },

  /* ===== 准备/取消准备 ===== */
  setReady(ready){
    this.send({
      type: 'player_ready',
      playerId: this.playerId,
      ready: ready,
    });
  },

  /* ===== 提交行动 ===== */
  submitAction(actions){
    this.send({
      type: 'player_action',
      playerId: this.playerId,
      side: this.side,
      actions: actions.map(a => ({
        id: a.id,
        name: a.name,
        domain: a.domain,
        cost: a.cost || 1,
        risk: a.risk || 0,
        mod: a.mod || 0,
        desc: a.desc || '',
      })),
    });
  },

  /* ===== 发送聊天 ===== */
  sendChat(text){
    this.send({
      type: 'chat',
      playerId: this.playerId,
      text: text,
    });
  },

  /* ===== 投降 ===== */
  resign(){
    this.send({
      type: 'resign',
      playerId: this.playerId,
      side: this.side,
    });
  },

  /* ===== 离开房间 ===== */
  leaveRoom(){
    this.send({ type: 'leave_room' });
    this.room = null;
    this.side = null;
  },

  /* ===== 请求房间列表 ===== */
  requestRoomList(){
    this.send({ type: 'get_rooms' });
  },

  /* ===== 设置玩家名 ===== */
  setPlayerName(name){
    this.playerName = name;
  },

  /* ===== 生成6位房间号 ===== */
  genRoomCode(){
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for(let i = 0; i < 6; i++){
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  },

  /* ===== 断开连接 ===== */
  disconnect(){
    this.stopHeartbeat();
    if(this.reconnectTimer){
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if(this.ws){
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
    this.room = null;
    this.side = null;
  },
};

/* 页面加载时尝试连接 */
if(typeof window !== 'undefined'){
  window.addEventListener('load', () => {
    try {
      /* 从session获取用户名 */
      const session = localStorage.getItem('nss_wgs_session');
      if(session){
        try {
          const s = JSON.parse(session);
          if(s.name) Multiplayer.setPlayerName(s.name);
        } catch(e) {}
      }
      Multiplayer.connect();
    } catch(e) { /* 静默失败 */ }
  });
}
