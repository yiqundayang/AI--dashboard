// 视频咨询页面功能
class VideoConsultation {
  constructor() {
    this.isConsulting = false;
    this.startTime = null;
    this.timerInterval = null;
    this.participantCount = 'multiple'; // 默认多人模式
    this.currentTab = 'transcript';
    
    // 模拟数据
    this.transcriptMessages = [];
    this.aiTips = [];
    this.transcriptCount = 0;
    
    // 解析URL参数
    this.urlParams = new URLSearchParams(window.location.search);
    this.clientName = this.urlParams.get('client') || '来访者';
    this.userId = this.urlParams.get('userId') || 'user';
    this.consultationTime = this.urlParams.get('time') || '今日咨询';
    this.consultationType = this.urlParams.get('type') || 'video';
    
    this.initializeElements();
    this.initializeEventListeners();
    this.initializeTimer();
    this.loadConsultationInfo();
    this.startConsultation(); // 直接开始咨询
  }

  initializeElements() {
    // 获取主要元素
    this.sessionTimer = document.getElementById('sessionTimer');
    this.endConsultationBtn = document.getElementById('endConsultationBtn');
    
    // 标签按钮
    this.tabBtns = document.querySelectorAll('.tab-btn');
    this.tabContents = document.querySelectorAll('.tab-content');
    
    // 视频控制
    this.muteBtn = document.getElementById('muteBtn');
    this.cameraBtn = document.getElementById('cameraBtn');
    this.participantVideos = document.getElementById('participantVideos');
    
    // 内容区域
    this.transcriptMessages = document.getElementById('transcriptMessages');
    this.aiTipsContent = document.getElementById('aiTipsContent');
    this.historyList = document.getElementById('historyList');
    
    // 核销弹窗
    this.checkoutModal = document.getElementById('checkoutModal');
    this.checkoutModalClose = document.getElementById('checkoutModalClose');
    this.cancelCheckout = document.getElementById('cancelCheckout');
    this.confirmCheckout = document.getElementById('confirmCheckout');
    this.durationBtns = document.querySelectorAll('.duration-btn');
    this.customMinutes = document.getElementById('customMinutes');
    
    this.selectedDuration = 60;
  }

  initializeEventListeners() {
    // 标签切换
    this.tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchTab(btn.dataset.tab);
      });
    });
    
    // 视频控制
    this.muteBtn?.addEventListener('click', () => {
      this.toggleMute();
    });
    
    this.cameraBtn?.addEventListener('click', () => {
      this.toggleCamera();
    });
    
    // 结束咨询
    this.endConsultationBtn?.addEventListener('click', () => {
      this.showCheckoutModal();
    });
    
    // 核销弹窗事件
    this.setupCheckoutEventListeners();
    
    // 点击背景关闭弹窗
    this.checkoutModal?.addEventListener('click', (e) => {
      if (e.target === this.checkoutModal) {
        this.hideCheckoutModal();
      }
    });
  }

  // 开始咨询
  startConsultation() {
    this.isConsulting = true;
    this.startTime = Date.now();
    this.startTimer();
    
    // 设置默认的多人视频布局
    this.updateParticipantVideos();
    
    // 模拟开始转录
    setTimeout(() => {
      this.simulateTranscription();
    }, 2000);
    
    // 模拟AI提示
    setTimeout(() => {
      this.simulateAITips();
    }, 5000);
    
    console.log('咨询开始');
  }

  // 设置参与者视频布局
  updateParticipantVideos() {
    // 使用真实的客户姓名
    this.participantVideos.innerHTML = `
      <div class="video-frame participant-video">
        <div class="video-content">
          <div class="video-avatar">
            <div class="avatar-circle participant">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <span class="participant-name">${this.clientName}</span>
          </div>
        </div>
      </div>
      <div class="video-frame participant-video">
        <div class="video-content">
          <div class="video-avatar">
            <div class="avatar-circle participant">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <span class="participant-name">家庭成员</span>
          </div>
        </div>
      </div>
    `;
  }

  // 切换标签
  switchTab(tabName) {
    // 更新按钮状态
    this.tabBtns.forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // 更新内容显示
    this.tabContents.forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(`${tabName}Tab`).classList.add('active');
    
    this.currentTab = tabName;
    console.log('切换到标签:', tabName);
  }

  // 切换静音状态
  toggleMute() {
    this.muteBtn.classList.toggle('muted');
    const isMuted = this.muteBtn.classList.contains('muted');
    this.muteBtn.textContent = isMuted ? '🔇' : '🎤';
    this.muteBtn.title = isMuted ? '取消静音' : '静音';
    
    console.log('麦克风状态:', isMuted ? '静音' : '开启');
  }

  // 切换摄像头状态
  toggleCamera() {
    this.cameraBtn.classList.toggle('muted');
    const isCameraOff = this.cameraBtn.classList.contains('muted');
    this.cameraBtn.textContent = isCameraOff ? '📷' : '📹';
    this.cameraBtn.title = isCameraOff ? '开启摄像头' : '关闭摄像头';
    
    console.log('摄像头状态:', isCameraOff ? '关闭' : '开启');
  }

  // 模拟语音转录
  simulateTranscription() {
    if (!this.isConsulting) return;
    
    const sampleMessages = [
      { 
        speaker: '咨询师', 
        content: '好的，今天我们继续上次的话题，关于您的工作压力情况。',
        type: 'consultant',
        tags: []
      },
      { 
        speaker: this.clientName, 
        content: '最近确实感觉压力很大，特别是项目进度的问题。',
        type: 'participant',
        tags: ['重要']
      },
      { 
        speaker: '咨询师', 
        content: '我观察到您在谈到工作时表情会变得紧张，这种感觉从什么时候开始的？',
        type: 'consultant',
        tags: []
      },
      { 
        speaker: this.clientName, 
        content: '大概是从上个月开始的，那时候我们接了一个很重要的项目。',
        type: 'participant',
        tags: ['重要', '焦虑']
      },
      { 
        speaker: '咨询师', 
        content: '很好，您能具体描述一下那种紧张的感觉吗？是身体上的还是心理上的？',
        type: 'consultant',
        tags: []
      },
      { 
        speaker: this.clientName, 
        content: '主要是心理上的，总是担心做不好，晚上经常失眠。',
        type: 'participant',
        tags: ['焦虑', '风险']
      }
    ];
    
    const randomDelay = Math.random() * 4000 + 2000; // 2-6秒随机间隔
    
    setTimeout(() => {
      if (this.isConsulting && this.transcriptCount < sampleMessages.length) {
        const message = sampleMessages[this.transcriptCount];
        this.addTranscriptMessage(message);
        this.transcriptCount++;
        this.simulateTranscription(); // 继续模拟
      }
    }, randomDelay);
  }

  // 添加转录消息
  addTranscriptMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.className = `transcript-message ${message.type}`;
    
    const currentTime = new Date();
    const timeString = currentTime.toLocaleTimeString('zh-CN', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
    
    // 构建标签HTML
    let tagsHTML = '';
    if (message.tags && message.tags.length > 0) {
      const tagElements = message.tags.map(tag => {
        let tagClass = '';
        if (tag === '重要') tagClass = 'important';
        else if (tag === '互动困难') tagClass = 'interaction';
        return `<span class="message-tag ${tagClass}">${tag}</span>`;
      }).join('');
      tagsHTML = `<div class="message-tags">${tagElements}</div>`;
    }
    
    messageElement.innerHTML = `
      <div class="message-info">
        <div class="speaker-name">${message.speaker}</div>
        <div class="message-time">${timeString}</div>
      </div>
      <div class="message-content">
        ${message.content}
        ${tagsHTML}
      </div>
    `;
    
    this.transcriptMessages.appendChild(messageElement);
    
    // 自动滚动到底部
    this.transcriptMessages.scrollTop = this.transcriptMessages.scrollHeight;
    
    console.log('添加转录消息:', message);
  }

  // 模拟AI提示
  simulateAITips() {
    if (!this.isConsulting) return;
    
    const tips = [
      {
        type: 'interaction',
        title: '互动困难',
        content: '咨询师延续咨询对象个人看法,未促进双方讨论共同互动'
      },
      {
        type: 'suggestion',
        title: '建议',
        content: '可以尝试使用开放性问题来促进更深入的对话'
      },
      {
        type: 'observation',
        title: '观察',
        content: '来访者在谈到工作时情绪状态发生明显变化'
      }
    ];
    
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    this.addAITip(randomTip);
    
    // 继续模拟
    const randomDelay = Math.random() * 10000 + 8000; // 8-18秒随机间隔
    setTimeout(() => {
      if (this.isConsulting) {
        this.simulateAITips();
      }
    }, randomDelay);
  }

  // 添加AI提示
  addAITip(tip) {
    const tipElement = document.createElement('div');
    tipElement.className = 'ai-tip-item';
    
    let tipTypeClass = '';
    switch (tip.type) {
      case 'interaction':
        tipTypeClass = 'tip-interaction';
        break;
      case 'suggestion':
        tipTypeClass = 'tip-suggestion';
        break;
      case 'observation':
        tipTypeClass = 'tip-observation';
        break;
    }
    
    tipElement.innerHTML = `
      <div class="tip-type ${tipTypeClass}">${tip.title}</div>
      <div class="tip-content">
        <p>${tip.content}</p>
      </div>
      <div class="tip-actions">
        <button class="tip-btn" onclick="this.parentElement.parentElement.remove()">删除</button>
      </div>
    `;
    
    this.aiTipsContent.appendChild(tipElement);
    
    // 如果当前在AI提示标签，滚动到底部
    if (this.currentTab === 'ai-tips') {
      this.aiTipsContent.scrollTop = this.aiTipsContent.scrollHeight;
    }
    
    console.log('添加AI提示:', tip);
  }

  // 显示核销弹窗
  showCheckoutModal() {
    // 更新弹窗信息
    document.getElementById('checkoutClientName').textContent = this.clientName;
    document.getElementById('checkoutStartTime').textContent = this.consultationTime;
    document.getElementById('checkoutActualDuration').textContent = this.sessionTimer.textContent;
    
    // 显示弹窗
    this.checkoutModal.style.display = 'flex';
  }

  // 设置核销弹窗事件监听器
  setupCheckoutEventListeners() {
    // 关闭弹窗
    this.checkoutModalClose?.addEventListener('click', () => {
      this.hideCheckoutModal();
    });
    
    this.cancelCheckout?.addEventListener('click', () => {
      this.hideCheckoutModal();
    });
    
    // 确认核销
    this.confirmCheckout?.addEventListener('click', () => {
      this.processCheckout();
    });
    
    // 时长选择
    this.durationBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.selectDuration(e.target.dataset.minutes);
      });
    });
    
    this.customMinutes?.addEventListener('input', (e) => {
      this.selectCustomDuration(e.target.value);
    });
  }

  // 隐藏核销弹窗
  hideCheckoutModal() {
    this.checkoutModal.style.display = 'none';
  }

  // 选择核销时长
  selectDuration(minutes) {
    this.selectedDuration = parseInt(minutes);
    
    // 更新按钮状态
    this.durationBtns.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-minutes="${minutes}"]`).classList.add('active');
    
    // 清空自定义输入
    this.customMinutes.value = '';
  }

  // 选择自定义时长
  selectCustomDuration(minutes) {
    if (minutes && minutes > 0) {
      this.selectedDuration = parseInt(minutes);
      
      // 取消其他按钮的选中状态
      this.durationBtns.forEach(btn => btn.classList.remove('active'));
    }
  }

  // 处理核销
  processCheckout() {
    const remark = document.getElementById('checkoutRemark').value;
    
    // 构建核销数据
    const checkoutData = {
      clientName: this.clientName,
      consultationType: this.consultationType,
      consultationTime: this.consultationTime,
      actualDuration: this.sessionTimer.textContent,
      billedDuration: this.selectedDuration,
      participantCount: this.participantCount,
      remark: remark,
      timestamp: new Date().toISOString()
    };
    
    // 保存核销数据
    const checkouts = JSON.parse(localStorage.getItem('consultationCheckouts') || '[]');
    checkouts.push(checkoutData);
    localStorage.setItem('consultationCheckouts', JSON.stringify(checkouts));
    
    // 隐藏弹窗
    this.hideCheckoutModal();
    
    // 跳转到智能咨询记录页面
    setTimeout(() => {
      window.location.href = 'consultation-record.html?client=' + encodeURIComponent(this.clientName);
    }, 500);
    
    console.log('视频咨询核销成功:', checkoutData);
  }

  // 初始化计时器
  initializeTimer() {
    this.sessionTimer.textContent = '00:00:00';
  }

  // 开始计时器
  startTimer() {
    this.timerInterval = setInterval(() => {
      if (this.startTime && this.isConsulting) {
        const elapsed = Date.now() - this.startTime;
        this.sessionTimer.textContent = this.formatTime(elapsed);
      }
    }, 1000);
  }

  // 格式化时间
  formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  // 加载咨询信息
  loadConsultationInfo() {
    // 更新页面显示的客户信息
    const clientNameElement = document.getElementById('clientName');
    const consultationTimeElement = document.getElementById('consultationTime');
    
    if (clientNameElement) {
      clientNameElement.textContent = this.clientName;
    }
    
    if (consultationTimeElement) {
      consultationTimeElement.textContent = this.consultationTime;
    }
    
    console.log('加载咨询信息:', {
      client: this.clientName,
      time: this.consultationTime,
      type: this.consultationType
    });
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  new VideoConsultation();
}); 