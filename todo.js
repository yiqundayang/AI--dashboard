/**
 * 待办中心页面逻辑
 */

class TodoCenter {
  constructor() {
    // 当前选中的日期
    this.currentDate = 'today';
    
    // 模拟数据存储
    this.consultations = new Map();
    this.records = new Map();
    
    // DOM元素缓存
    this.elements = {};
    
    this.init();
  }
  
  /**
   * 初始化
   */
  init() {
    this.cacheElements();
    this.initMockData();
    this.generateDateTabs();
    this.bindEvents();
    this.updateContent();
    
    console.log('待办中心页面已初始化');
  }
  
  /**
   * 缓存DOM元素
   */
  cacheElements() {
    this.elements = {
      dateSelector: document.getElementById('dateSelector'),
      consultationList: document.getElementById('consultationList'),
      recordsList: document.getElementById('recordsList'),
      consultationCount: document.getElementById('consultationCount'),
      recordsCount: document.getElementById('recordsCount'),
      viewAllBtn: document.getElementById('viewAllBtn'),
      confirmModal: document.getElementById('confirmModal'),
      shareModal: document.getElementById('shareModal'),
      confirmBtn: document.getElementById('confirmBtn'),
      cancelBtn: document.getElementById('cancelBtn'),
      shareConfirm: document.getElementById('shareConfirm'),
      shareCancel: document.getElementById('shareCancel')
    };
  }
  
  /**
   * 初始化模拟数据
   */
  initMockData() {
    // 今天的咨询数据
    this.consultations.set('today', [
      {
        id: '1',
        type: 'offline',
        userName: '张小明',
        userId: 'user1',
        avatar: 'https://picsum.photos/seed/user1/100/100',
        time: '17:00-18:00',
        sessionInfo: { current: 1, total: 10, isFirst: true } // 首次咨询
      },
      {
        id: '2',
        type: 'video',
        userName: '李小雅',
        userId: 'user2',
        avatar: 'https://picsum.photos/seed/user2/100/100',
        time: '18:30-19:30',
        sessionInfo: { current: 3, total: 10, isFirst: false } // 第3次咨询，共10次
      },
      {
        id: '3',
        type: 'video',
        userName: '王小芳',
        userId: 'user3',
        avatar: 'https://picsum.photos/seed/user3/100/100',
        time: '20:00-21:00',
        sessionInfo: { current: 5, total: 10, isFirst: false } // 第5次咨询，共10次
      }
    ]);
    
    // 今天的咨询记录数据
    this.records.set('today', [
      {
        id: '4',
        type: 'offline',
        userName: '陈小强',
        userId: 'user4',
        avatar: 'https://picsum.photos/seed/user4/100/100',
        time: '14:00-15:00',
        sessionInfo: { current: 2, total: 10, isFirst: false },
        status: 'generating'
      },
      {
        id: '5',
        type: 'video',
        userName: '刘小娟',
        userId: 'user5',
        avatar: 'https://picsum.photos/seed/user5/100/100',
        time: '11:30-12:00',
        sessionInfo: { current: 1, total: 10, isFirst: true },
        status: 'pending'
      },
      {
        id: '6',
        type: 'video',
        userName: '周小琳',
        userId: 'user6',
        avatar: 'https://picsum.photos/seed/user6/100/100',
        time: '09:00-10:00',
        sessionInfo: { current: 7, total: 10, isFirst: false },
        status: 'completed'
      }
    ]);
    
    // 明天的数据（示例）
    this.consultations.set('tomorrow', [
      {
        id: '7',
        type: 'video',
        userName: '赵小明',
        userId: 'user7',
        avatar: 'https://via.placeholder.com/40x40/34C759/FFFFFF?text=赵',
        time: '10:00-11:00',
        sessionInfo: { current: 4, total: 10, isFirst: false }
      }
    ]);
    
    this.records.set('tomorrow', []);
  }
  
  /**
   * 生成日期标签
   */
  generateDateTabs() {
    const futureDates = utils.getFutureDates(5, 2);
    
    futureDates.forEach(date => {
      const tab = document.createElement('button');
      tab.className = 'date-tab';
      tab.dataset.date = date.value;
      tab.textContent = date.label;
      this.elements.dateSelector.appendChild(tab);
    });
  }
  
  /**
   * 绑定事件
   */
  bindEvents() {
    // 日期切换
    this.elements.dateSelector.addEventListener('click', (e) => {
      if (e.target.classList.contains('date-tab')) {
        this.switchDate(e.target.dataset.date);
      }
    });
    
    // 查看全部
    this.elements.viewAllBtn.addEventListener('click', () => {
      toast.show('功能开发中...', 'info');
    });
    
    // 咨询列表事件代理
    this.elements.consultationList.addEventListener('click', (e) => {
      this.handleConsultationAction(e);
    });
    
    // 记录列表事件代理
    this.elements.recordsList.addEventListener('click', (e) => {
      this.handleRecordAction(e);
    });
    
    // 确认弹窗事件
    this.elements.confirmBtn.addEventListener('click', () => {
      this.confirmVerification();
    });
    
    this.elements.cancelBtn.addEventListener('click', () => {
      modal.hide('confirmModal');
    });
    
    // 分享弹窗事件
    this.elements.shareConfirm.addEventListener('click', () => {
      this.shareRoom();
    });
    
    this.elements.shareCancel.addEventListener('click', () => {
      modal.hide('shareModal');
    });
  }
  
  /**
   * 切换日期
   * @param {string} date 日期
   */
  switchDate(date) {
    // 更新选中状态
    document.querySelectorAll('.date-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    
    const selectedTab = document.querySelector(`[data-date="${date}"]`);
    if (selectedTab) {
      selectedTab.classList.add('active');
    }
    
    this.currentDate = date;
    this.updateContent();
  }
  
  /**
   * 更新页面内容
   */
  updateContent() {
    this.renderConsultations();
    this.renderRecords();
  }
  
  /**
   * 渲染咨询列表
   */
  renderConsultations() {
    const consultations = this.consultations.get(this.currentDate) || [];
    const container = this.elements.consultationList;
    
    // 更新计数
    this.elements.consultationCount.textContent = consultations.length;
    
    if (consultations.length === 0) {
      container.innerHTML = `
        <div class="empty-consultation">
          <div class="empty-icon">📅</div>
          <p>今日暂无咨询安排</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = consultations.map(item => this.renderConsultationItem(item)).join('');
  }
  
  /**
   * 渲染单个咨询项
   * @param {Object} item 咨询项数据
   */
  renderConsultationItem(item) {
    const typeClass = item.type === 'video' ? 'video' : 'offline';
    const typeText = item.type === 'video' ? '视频咨询' : '到店咨询';
    
    const actions = item.type === 'video' 
      ? `<button class="btn btn-primary start-consultation" data-id="${item.id}">开始咨询</button>
         <button class="btn btn-secondary share-room" data-id="${item.id}">分享房间</button>`
      : `<button class="btn btn-primary start-record" data-id="${item.id}">开始记录</button>
         <button class="btn btn-danger verify-consultation" data-id="${item.id}">核销</button>`;
    
    // 生成咨询次数标签
    let sessionTag = '';
    if (item.sessionInfo) {
      if (item.sessionInfo.isFirst) {
        sessionTag = '<span class="tag-session first">首次</span>';
      } else {
        sessionTag = `<span class="tag-session">第${item.sessionInfo.current}次</span><span class="tag-progress">${item.sessionInfo.current}/${item.sessionInfo.total}</span>`;
      }
    }
    
    return `
      <div class="consultation-item" data-type="${typeClass}" data-id="${item.id}">
        <div class="consultation-type">
          <div class="type-tag ${typeClass}">${typeText}</div>
        </div>
        <div class="user-avatar-section">
          <img src="${item.avatar}" alt="用户头像" class="avatar">
        </div>
        <div class="user-info">
          <div class="user-details">
            <div class="user-name">
              <span class="name">${item.userName}</span>
              ${sessionTag}
            </div>
            <div class="consultation-time">${item.time}</div>
            <a href="customer-profile.html?user=${item.userId}&name=${encodeURIComponent(item.userName)}" class="profile-link">查看客户档案</a>
          </div>
        </div>
        <div class="consultation-actions">
          ${actions}
        </div>
      </div>
    `;
  }
  
  /**
   * 渲染咨询记录列表
   */
  renderRecords() {
    const records = this.records.get(this.currentDate) || [];
    const container = this.elements.recordsList;
    
    // 更新计数
    this.elements.recordsCount.textContent = records.length;
    
    if (records.length === 0) {
      container.innerHTML = `
        <div class="empty-records">
          <div class="empty-icon">✅</div>
          <p>今日暂无咨询记录</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = records.map(item => this.renderRecordItem(item)).join('');
  }
  
  /**
   * 渲染单个记录项
   * @param {Object} item 记录项数据
   */
  renderRecordItem(item) {
    const typeClass = item.type === 'video' ? 'video' : 'offline';
    const typeText = item.type === 'video' ? '视频咨询' : '到店咨询';
    
    let statusContent = '';
    switch (item.status) {
      case 'generating':
        statusContent = `
          <button class="btn btn-secondary btn-sm record-generating" data-id="${item.id}">
            <span class="status-icon generating">⏳</span>
            咨询记录生成中
          </button>
        `;
        break;
      case 'pending':
        statusContent = `
          <button class="btn btn-warning btn-sm record-pending" data-id="${item.id}">
            <span class="status-icon pending">📋</span>
            咨询记录待确认
          </button>
        `;
        break;
      case 'completed':
        statusContent = `<button class="btn btn-primary btn-sm view-record" data-id="${item.id}">查看咨询记录</button>`;
        break;
    }
    
    // 生成咨询次数标签
    let sessionTag = '';
    if (item.sessionInfo) {
      if (item.sessionInfo.isFirst) {
        sessionTag = '<span class="tag-session first">首次</span>';
      } else {
        sessionTag = `<span class="tag-session">第${item.sessionInfo.current}次</span><span class="tag-progress">${item.sessionInfo.current}/${item.sessionInfo.total}</span>`;
      }
    }
    
    return `
      <div class="record-item" data-type="${typeClass}" data-id="${item.id}">
        <div class="consultation-type">
          <div class="type-tag ${typeClass}">${typeText}</div>
        </div>
        <div class="user-avatar-section">
          <img src="${item.avatar}" alt="用户头像" class="avatar">
        </div>
        <div class="user-info">
          <div class="user-details">
            <div class="user-name">
              <span class="name">${item.userName}</span>
              ${sessionTag}
            </div>
            <div class="consultation-time">${item.time}</div>
            <a href="customer-profile.html?user=${item.userId}&name=${encodeURIComponent(item.userName)}" class="profile-link">查看客户档案</a>
          </div>
        </div>
        <div class="record-status">
          ${statusContent}
        </div>
      </div>
    `;
  }
  
  /**
   * 处理咨询操作
   * @param {Event} e 事件对象
   */
  handleConsultationAction(e) {
    const target = e.target;
    const id = target.dataset.id;
    
    if (target.classList.contains('start-consultation')) {
      this.startVideoConsultation(id);
    } else if (target.classList.contains('share-room')) {
      this.showShareModal(id);
    } else if (target.classList.contains('start-record')) {
      this.startRecord(id);
    } else if (target.classList.contains('verify-consultation')) {
      this.showConfirmModal(id);
    }
  }
  
  /**
   * 处理记录操作
   * @param {Event} e 事件对象
   */
  handleRecordAction(e) {
    const target = e.target;
    const id = target.dataset.id;
    
    if (target.classList.contains('view-record')) {
      this.viewRecord(id);
    } else if (target.classList.contains('record-generating')) {
      this.handleGeneratingRecord(id);
    } else if (target.classList.contains('record-pending')) {
      this.handlePendingRecord(id);
    }
  }
  
  /**
   * 开始视频咨询
   * @param {string} id 咨询ID
   */
  startVideoConsultation(id) {
    // 查找对应的咨询信息
    const consultations = this.consultations.get(this.currentDate) || [];
    const consultation = consultations.find(item => item.id === id);
    
    if (consultation) {
      toast.show('正在启动视频咨询...', 'info');
      
      // 构建URL参数
      const params = new URLSearchParams({
        client: consultation.userName,
        userId: consultation.userId,
        time: `${new Date().toLocaleDateString('zh-CN')} ${consultation.time}`,
        type: 'video'
      });
      
      // 跳转到视频咨询页面
      setTimeout(() => {
        window.location.href = `video-consultation.html?${params.toString()}`;
      }, 800);
    } else {
      toast.show('找不到咨询信息', 'error');
    }
  }
  
  /**
   * 分享房间
   */
  shareRoom() {
    modal.hide('shareModal');
    
    // 模拟分享功能
    if (navigator.share) {
      navigator.share({
        title: '咨询房间邀请',
        text: '请点击链接加入咨询房间',
        url: 'https://example.com/room/123456'
      }).then(() => {
        toast.show('分享成功', 'success');
      }).catch(() => {
        this.copyToClipboard();
      });
    } else {
      this.copyToClipboard();
    }
  }
  
  /**
   * 复制到剪贴板
   */
  copyToClipboard() {
    const url = 'https://example.com/room/123456';
    navigator.clipboard.writeText(url).then(() => {
      toast.show('房间链接已复制到剪贴板', 'success');
    }).catch(() => {
      toast.show('复制失败，请手动复制', 'error');
    });
  }
  
  /**
   * 显示分享弹窗
   * @param {string} id 咨询ID
   */
  showShareModal(id) {
    this.currentActionId = id;
    modal.show('shareModal');
  }
  
  /**
   * 开始记录
   * @param {string} id 咨询ID
   */
  startRecord(id) {
    // 查找对应的咨询信息
    const consultations = this.consultations.get(this.currentDate) || [];
    const consultation = consultations.find(item => item.id === id);
    
    if (consultation) {
      // 构建URL参数
      const params = new URLSearchParams({
        client: consultation.userName,
        session: consultation.sessionCount || 1,
        time: `${new Date().toLocaleDateString('zh-CN')} ${consultation.time}`
      });
      
      // 跳转到新的咨询笔记页面
      window.location.href = `consultation-notes-new.html?${params.toString()}`;
    } else {
      toast.show('找不到咨询信息', 'error');
    }
  }
  
  /**
   * 显示确认核销弹窗
   * @param {string} id 咨询ID
   */
  showConfirmModal(id) {
    this.currentActionId = id;
    modal.show('confirmModal');
  }
  
  /**
   * 确认核销
   */
  confirmVerification() {
    modal.hide('confirmModal');
    
    // 模拟核销操作
    toast.show('正在核销...', 'info');
    
    setTimeout(() => {
      // 从咨询列表中移除该项目
      const consultations = this.consultations.get(this.currentDate) || [];
      const updatedConsultations = consultations.filter(item => item.id !== this.currentActionId);
      this.consultations.set(this.currentDate, updatedConsultations);
      
      // 添加到记录列表
      const removedConsultation = consultations.find(item => item.id === this.currentActionId);
      if (removedConsultation) {
        const records = this.records.get(this.currentDate) || [];
        records.push({
          ...removedConsultation,
          status: 'completed'
        });
        this.records.set(this.currentDate, records);
      }
      
      // 更新页面
      this.updateContent();
      toast.show('核销成功', 'success');
    }, 1500);
  }
  
  /**
   * 查看记录
   * @param {string} id 记录ID
   */
  viewRecord(id) {
    // 查找对应的记录信息
    const records = this.records.get(this.currentDate) || [];
    const record = records.find(item => item.id === id);
    
    if (record) {
      toast.show('正在打开咨询记录...', 'info');
      
      // 构建URL参数
      const params = new URLSearchParams({
        client: record.userName,
        userId: record.userId,
        type: record.type,
        id: id,
        status: 'completed'
      });
      
      // 跳转到咨询记录页面
      setTimeout(() => {
        window.location.href = `consultation-record.html?${params.toString()}`;
      }, 800);
    } else {
      toast.show('找不到记录信息', 'error');
    }
  }
  
  /**
   * 处理生成中的记录
   * @param {string} id 记录ID
   */
  handleGeneratingRecord(id) {
    // 查找对应的记录信息
    const records = this.records.get(this.currentDate) || [];
    const record = records.find(item => item.id === id);
    
    if (record) {
      toast.show('正在打开咨询记录...', 'info');
      
      // 构建URL参数
      const params = new URLSearchParams({
        client: record.userName,
        userId: record.userId,
        type: record.type,
        id: id,
        status: 'generating'
      });
      
      // 跳转到咨询记录页面
      setTimeout(() => {
        window.location.href = `consultation-record.html?${params.toString()}`;
      }, 800);
    } else {
      toast.show('找不到记录信息', 'error');
    }
  }
  
  /**
   * 处理待确认的记录
   * @param {string} id 记录ID
   */
  handlePendingRecord(id) {
    // 查找对应的记录信息
    const records = this.records.get(this.currentDate) || [];
    const record = records.find(item => item.id === id);
    
    if (record) {
      toast.show('正在打开咨询记录...', 'info');
      
      // 构建URL参数
      const params = new URLSearchParams({
        client: record.userName,
        userId: record.userId,
        type: record.type,
        id: id,
        status: 'pending'
      });
      
      // 跳转到咨询记录页面
      setTimeout(() => {
        window.location.href = `consultation-record.html?${params.toString()}`;
      }, 800);
    } else {
      toast.show('找不到记录信息', 'error');
    }
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  new TodoCenter();
}); 