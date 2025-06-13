// 智能咨询记录页面功能
class ConsultationRecord {
  constructor() {
    this.currentClient = '';
    this.consultationRecords = [];
    this.currentMainTab = 'notes'; // 默认显示咨询笔记
    this.recordStatus = 'completed'; // 记录状态：generating, pending, completed
    
    this.initializeElements();
    this.initializeEventListeners();
    this.loadRecordStatus(); // 加载记录状态
    this.loadConsultationRecords();
    this.loadCurrentClient();
    this.loadConsultationNotes(); // 加载咨询笔记
  }

  initializeElements() {
    // 获取主要元素
    this.recordList = document.getElementById('recordList');
    this.exportBtn = document.getElementById('exportBtn');
    
    // 主导航tab元素
    this.mainTabs = document.querySelectorAll('.main-tab');
    this.mainTabContents = document.querySelectorAll('.main-tab-content');
    
    // 智能记录tab元素
    this.tabBtns = document.querySelectorAll('.tab-btn');
    this.tabPanels = document.querySelectorAll('.tab-panel');
    
    // 咨询笔记相关元素
    this.notesContent = document.getElementById('notesContent');
    this.consultationTimeSpan = document.getElementById('consultationTime');
    this.clientNameSpan = document.getElementById('clientName');
  }

  initializeEventListeners() {
    // 主导航tab切换
    this.mainTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        this.switchMainTab(e.target.dataset.mainTab);
      });
    });
    
    // 智能记录子标签页切换
    this.tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.switchTab(e.target.dataset.tab);
      });
    });

    // 导出记录按钮
    this.exportBtn?.addEventListener('click', () => {
      this.exportRecord();
    });
  }

  // 切换主导航tab
  switchMainTab(tabName) {
    this.currentMainTab = tabName;
    
    // 更新主tab按钮状态
    this.mainTabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.mainTab === tabName);
    });

    // 更新主tab内容显示
    this.mainTabContents.forEach(content => {
      content.classList.toggle('active', content.dataset.mainPanel === tabName);
    });
    
    // 如果切换到咨询笔记tab，确保内容已加载
    if (tabName === 'notes' && !this.notesLoaded) {
      this.loadConsultationNotes();
    }
  }

  // 切换智能记录子标签页
  switchTab(tabName) {
    // 更新按钮状态
    this.tabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // 更新面板显示
    this.tabPanels.forEach(panel => {
      panel.classList.toggle('active', panel.dataset.panel === tabName);
    });
  }

  // 加载记录状态
  loadRecordStatus() {
    const urlParams = new URLSearchParams(window.location.search);
    this.recordStatus = urlParams.get('status') || 'completed';
    
    // 根据状态调整页面显示
    this.updateUIByStatus();
  }

  // 根据状态更新UI
  updateUIByStatus() {
    const pageTitle = document.querySelector('.page-title');
    const exportBtn = this.exportBtn;
    
    switch (this.recordStatus) {
      case 'generating':
        if (pageTitle) {
          pageTitle.innerHTML = '咨询记录 <span style="color: #f59e0b; font-size: 14px;">⏳ 生成中</span>';
        }
        if (exportBtn) {
          exportBtn.disabled = true;
          exportBtn.textContent = '⏳ 生成中...';
          exportBtn.style.opacity = '0.6';
        }
        // 显示生成中提示
        this.showGeneratingStatus();
        break;
        
      case 'pending':
        if (pageTitle) {
          pageTitle.innerHTML = '咨询记录 <span style="color: #f97316; font-size: 14px;">📋 待确认</span>';
        }
        if (exportBtn) {
          exportBtn.textContent = '📋 确认并导出';
        }
        // 显示待确认提示
        this.showPendingStatus();
        break;
        
      case 'completed':
      default:
        if (pageTitle) {
          pageTitle.innerHTML = '咨询记录 <span style="color: #10b981; font-size: 14px;">✅ 已完成</span>';
        }
        break;
    }
  }

  // 显示生成中状态
  showGeneratingStatus() {
    // 可以在智能记录区域显示生成进度
    const recordMain = document.querySelector('.record-main');
    if (recordMain && this.recordStatus === 'generating') {
      const loadingOverlay = document.createElement('div');
      loadingOverlay.className = 'status-overlay';
      loadingOverlay.innerHTML = `
        <div class="status-content">
          <div class="status-icon">⏳</div>
          <h3>咨询记录生成中</h3>
          <p>AI正在分析咨询内容并生成智能记录，请稍等...</p>
          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>
        </div>
      `;
      
      // 添加样式
      const style = document.createElement('style');
      style.textContent = `
        .status-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          backdrop-filter: blur(2px);
        }
        .status-content {
          text-align: center;
          padding: 2rem;
        }
        .status-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        .progress-bar {
          width: 200px;
          height: 4px;
          background: #e5e7eb;
          border-radius: 2px;
          overflow: hidden;
          margin: 1rem auto;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #1d4ed8);
          animation: progress 2s ease-in-out infinite;
        }
        @keyframes progress {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
      `;
      document.head.appendChild(style);
      
      recordMain.style.position = 'relative';
      recordMain.appendChild(loadingOverlay);
    }
  }

  // 显示待确认状态
  showPendingStatus() {
    // 可以在页面顶部显示确认提示
    const mainContent = document.querySelector('.main-content');
    if (mainContent && this.recordStatus === 'pending') {
      const confirmBanner = document.createElement('div');
      confirmBanner.className = 'confirm-banner';
      confirmBanner.innerHTML = `
        <div class="banner-content">
          <span class="banner-icon">📋</span>
          <div class="banner-text">
            <strong>记录待确认</strong>
            <p>请检查AI生成的咨询记录内容，确认无误后可进行导出</p>
          </div>
          <button class="btn btn-primary confirm-record-btn">确认记录</button>
        </div>
      `;
      
      // 添加样式
      const style = document.createElement('style');
      style.textContent = `
        .confirm-banner {
          background: linear-gradient(135deg, #fef3c7, #fbbf24);
          border: 1px solid #f59e0b;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1.5rem;
        }
        .banner-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .banner-icon {
          font-size: 1.5rem;
        }
        .banner-text {
          flex: 1;
        }
        .banner-text strong {
          color: #92400e;
          display: block;
          margin-bottom: 0.25rem;
        }
        .banner-text p {
          color: #a16207;
          margin: 0;
          font-size: 0.9rem;
        }
        .confirm-record-btn {
          background: #f59e0b;
          border-color: #f59e0b;
          color: white;
        }
        .confirm-record-btn:hover {
          background: #d97706;
          border-color: #d97706;
        }
      `;
      document.head.appendChild(style);
      
      // 添加确认按钮事件
      confirmBanner.querySelector('.confirm-record-btn').addEventListener('click', () => {
        this.confirmRecord();
      });
      
      mainContent.insertBefore(confirmBanner, mainContent.firstChild);
    }
  }

  // 确认记录
  confirmRecord() {
    // 更新状态为已完成
    this.recordStatus = 'completed';
    
    // 移除确认横幅
    const banner = document.querySelector('.confirm-banner');
    if (banner) {
      banner.remove();
    }
    
    // 更新UI状态
    this.updateUIByStatus();
    
    // 显示成功提示
    const toast = document.createElement('div');
    toast.className = 'toast success';
    toast.textContent = '记录已确认！';
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
      style.remove();
    }, 3000);
  }

  // 加载当前客户信息
  loadCurrentClient() {
    const urlParams = new URLSearchParams(window.location.search);
    this.currentClient = urlParams.get('client') || '李小雅';
    
    // 更新页面标题
    document.title = `${this.currentClient} - 智能咨询记录`;
  }

  // 加载咨询记录
  loadConsultationRecords() {
    // 模拟咨询记录数据
    this.consultationRecords = [
      {
        session: '第 19 次',
        type: '视频咨询',
        date: '2025-06-06',
        time: '11:00-11:30',
        status: 'completed',
        description: '学业压力与教育方式冲突'
      },
      {
        session: '第 18 次',
        type: '技术与业务对接',
        date: '2025-05-28',
        time: '11:00-11:20',
        status: 'completed',
        description: '家庭沟通模式调整'
      },
      {
        session: '第 17 次',
        type: '学业压力与教养冲突',
        date: '2025-05-25',
        time: '15:40-16:00',
        status: 'completed',
        description: '亲子关系改善策略'
      },
      {
        session: '第 16 次',
        type: '项目推进沟通',
        date: '2025-05-25',
        time: '15:20-15:40',
        status: 'completed',
        description: '学习动机激发'
      },
      {
        session: '第 15 次',
        type: '工作流程优化沟通',
        date: '2025-05-25',
        time: '15:00-15:20',
        status: 'completed',
        description: '情绪管理技巧'
      }
    ];

    this.renderRecordList();
  }

  // 渲染记录列表
  renderRecordList() {
    const recordHTML = this.consultationRecords.map((record, index) => {
      const isActive = index === 0 ? 'active' : '';
      return `
        <div class="record-item ${isActive}" data-session="${record.session}">
          <div class="record-session">${record.session}</div>
          <div class="record-type">${record.type}</div>
          <div class="record-time">${record.date} ${record.time}</div>
          <div class="record-status ${record.status}">${record.status === 'completed' ? '已完成' : '进行中'}</div>
        </div>
      `;
    }).join('');

    this.recordList.innerHTML = recordHTML;

    // 添加点击事件
    this.recordList.querySelectorAll('.record-item').forEach(item => {
      item.addEventListener('click', (e) => {
        this.selectRecord(e.currentTarget);
      });
    });
  }

  // 选择记录
  selectRecord(item) {
    // 更新选中状态
    this.recordList.querySelectorAll('.record-item').forEach(record => {
      record.classList.remove('active');
    });
    item.classList.add('active');

    // 获取选中的会话信息
    const sessionNumber = item.dataset.session;
    
    // 可以在这里根据选中的记录更新右侧内容
    this.updateRecordContent(sessionNumber);
  }

  // 更新记录内容
  updateRecordContent(sessionNumber) {
    // 这里可以根据不同的咨询记录加载不同的内容
    // 目前显示的是默认内容，实际应该从数据库或API获取
    console.log(`加载 ${sessionNumber} 的记录内容`);
    
    // 可以添加加载动画
    this.showLoadingState();
    
    // 模拟加载过程
    setTimeout(() => {
      this.hideLoadingState();
      // 这里可以更新具体的内容
    }, 500);
  }

  // 显示加载状态
  showLoadingState() {
    const tabContent = document.querySelector('.tab-content');
    tabContent.style.opacity = '0.6';
    tabContent.style.pointerEvents = 'none';
  }

  // 隐藏加载状态
  hideLoadingState() {
    const tabContent = document.querySelector('.tab-content');
    tabContent.style.opacity = '1';
    tabContent.style.pointerEvents = 'auto';
  }

  // 查看逐字稿
  viewTranscript() {
    // 获取当前选中的记录
    const activeRecord = this.recordList.querySelector('.record-item.active');
    const sessionNumber = activeRecord ? activeRecord.dataset.session : '第 19 次';
    
    // 打开逐字稿弹窗或跳转到逐字稿页面
    this.showTranscriptModal(sessionNumber);
  }

  // 显示逐字稿弹窗
  showTranscriptModal(sessionNumber) {
    // 获取保存的核销数据（包含标签信息）
    const checkouts = JSON.parse(localStorage.getItem('consultationCheckouts') || '[]');
    const currentCheckout = checkouts.find(checkout => 
      checkout.clientName === this.currentClient
    );
    
    let transcriptHTML = '';
    
    if (currentCheckout && currentCheckout.quickNotes && currentCheckout.quickNotes.length > 0) {
      // 如果有快速笔记标签，显示带标签的逐字稿
      transcriptHTML = this.generateTaggedTranscript(currentCheckout);
    } else {
      // 否则显示默认的逐字稿
      transcriptHTML = this.generateDefaultTranscript();
    }
    
    // 创建弹窗
    const modal = document.createElement('div');
    modal.className = 'transcript-modal';
    modal.innerHTML = `
      <div class="modal-content transcript-modal-content">
        <div class="modal-header">
          <h3>${sessionNumber} 逐字稿</h3>
          <button class="modal-close" onclick="this.closest('.transcript-modal').remove()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="transcript-viewer">
            ${transcriptHTML}
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="this.closest('.transcript-modal').remove()">关闭</button>
          <button class="btn btn-primary" onclick="this.downloadTranscript('${sessionNumber}')">下载逐字稿</button>
        </div>
      </div>
    `;

    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
      .transcript-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(4px);
      }
      
      .transcript-modal-content {
        max-width: 800px;
        width: 90%;
        max-height: 80vh;
        background: white;
        border-radius: var(--radius-lg);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        display: flex;
        flex-direction: column;
      }
      
      .transcript-viewer {
        max-height: 400px;
        overflow-y: auto;
        padding: var(--space-2);
      }
      
      .transcript-item {
        display: block;
        margin-bottom: var(--space-3);
        padding: var(--space-2);
        border-left: 3px solid var(--gray-200);
        padding-left: var(--space-3);
        position: relative;
      }
      
      .transcript-item.tagged {
        border-left-color: var(--primary-blue);
        background: rgba(59, 130, 246, 0.05);
      }
      
      .transcript-item .speaker {
        font-weight: var(--font-weight-semibold);
        color: var(--primary-blue);
        margin-right: var(--space-2);
      }
      
      .transcript-item .time {
        font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
        font-size: var(--font-size-xs);
        color: var(--gray-500);
        margin-right: var(--space-2);
      }
      
      .transcript-item .content {
        color: var(--gray-700);
        line-height: 1.6;
        display: block;
        margin-top: var(--space-1);
      }
      
      .transcript-tags {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-1);
        margin-top: var(--space-2);
      }
      
      .transcript-tag {
        display: inline-flex;
        align-items: center;
        padding: 4px 8px;
        border-radius: var(--radius-sm);
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-medium);
        color: white;
      }
      
      .transcript-tag.important {
        background: #ef4444;
      }
      
      .transcript-tag.risk {
        background: #f97316;
      }
      
      .transcript-tag.emotion {
        background: #a855f7;
      }
      
      .transcript-tag.task {
        background: #22c55e;
      }
      
      .transcript-tag.plan {
        background: #3b82f6;
      }
      
      .transcript-tag.core {
        background: #8b5cf6;
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(modal);

    // 点击背景关闭弹窗
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
        style.remove();
      }
    });
  }
  
  // 生成带标签的逐字稿
  generateTaggedTranscript(checkoutData) {
    const mockTranscriptItems = [
      {
        speaker: '咨询师',
        time: '[00:00:15]',
        content: '好的，今天我们继续上次的话题。您最近的睡眠状况怎么样？有改善吗？'
      },
      {
        speaker: '来访者',
        time: '[00:00:32]',
        content: '嗯，比之前好一些了，但还是会因为孩子的事情睡不着。'
      },
      {
        speaker: '咨询师',
        time: '[00:01:05]',
        content: '我观察到您在谈到工作时表情会变得紧张，这种感觉从什么时候开始的？'
      },
      {
        speaker: '来访者',
        time: '[00:01:28]',
        content: '可能从孩子上初中开始吧，学习压力大了，我们也跟着紧张。'
      },
      {
        speaker: '咨询师',
        time: '[00:02:10]',
        content: '很好，您能具体描述一下那种紧张的感觉吗？'
      },
      {
        speaker: '来访者',
        time: '[00:02:35]',
        content: '就是心里总是悬着，特别是看到他在玩手机的时候，我就控制不住要说他。'
      },
      {
        speaker: '咨询师',
        time: '[00:03:02]',
        content: '理解。那么我们来尝试一个放松练习，请您跟着我的指导，先深呼吸...'
      }
    ];
    
    return mockTranscriptItems.map((item, index) => {
      // 使用更精确的匹配逻辑，与显示逻辑保持一致
      const matchingNote = checkoutData.quickNotes.find(note => {
        if (!note.originalTranscript || !note.originalTranscript.text) {
          return false;
        }
        
        const noteText = note.originalTranscript.text.trim();
        const itemContent = item.content.trim();
        
        // 精确匹配：要么完全相同，要么逐字稿内容包含笔记内容且长度相差不大
        return noteText === itemContent || 
               (itemContent.includes(noteText) && Math.abs(itemContent.length - noteText.length) < 10);
      });
      
      const hasTag = matchingNote && matchingNote.tags && matchingNote.tags.length > 0;
      const taggedClass = hasTag ? 'tagged' : '';
      
      let tagsHTML = '';
      if (hasTag) {
        tagsHTML = `
          <div class="transcript-tags">
            ${matchingNote.tags.map(tag => {
              const tagType = this.getTagType(tag);
              const tagIcon = this.getTagIcon(tag);
              return `<span class="transcript-tag ${tagType}" title="${tag}">${tagIcon} ${tag}</span>`;
            }).join('')}
          </div>
        `;
      }
      
      return `
        <div class="transcript-item ${taggedClass}">
          <span class="speaker">${item.speaker}</span>
          <span class="time">${item.time}</span>
          <span class="content">${item.content}</span>
          ${tagsHTML}
        </div>
      `;
    }).join('');
  }
  
  // 生成默认逐字稿
  generateDefaultTranscript() {
    return `
      <div class="transcript-item">
        <span class="speaker">咨询师</span>
        <span class="time">[00:00:15]</span>
        <span class="content">好的，今天我们继续上次的话题。您最近的睡眠状况怎么样？有改善吗？</span>
      </div>
      <div class="transcript-item">
        <span class="speaker">来访者</span>
        <span class="time">[00:00:32]</span>
        <span class="content">嗯，比之前好一些了，但还是会因为孩子的事情睡不着。</span>
      </div>
      <div class="transcript-item">
        <span class="speaker">咨询师</span>
        <span class="time">[00:01:05]</span>
        <span class="content">我观察到您在谈到工作时表情会变得紧张，这种感觉从什么时候开始的？</span>
      </div>
      <div class="transcript-item">
        <span class="speaker">来访者</span>
        <span class="time">[00:01:28]</span>
        <span class="content">可能从孩子上初中开始吧，学习压力大了，我们也跟着紧张。</span>
      </div>
      <div class="transcript-item">
        <span class="speaker">咨询师</span>
        <span class="time">[00:02:10]</span>
        <span class="content">很好，您能具体描述一下那种紧张的感觉吗？</span>
      </div>
      <div class="transcript-item">
        <span class="speaker">来访者</span>
        <span class="time">[00:02:35]</span>
        <span class="content">就是心里总是悬着，特别是看到他在玩手机的时候，我就控制不住要说他。</span>
      </div>
      <div class="transcript-item">
        <span class="speaker">咨询师</span>
        <span class="time">[00:03:02]</span>
        <span class="content">理解。那么我们来尝试一个放松练习，请您跟着我的指导，先深呼吸...</span>
      </div>
    `;
  }
  
  // 获取标签类型
  getTagType(tag) {
    const tagTypeMap = {
      '重要': 'important',
      '风险': 'risk', 
      '悲伤': 'emotion',
      '哭': 'emotion',
      '焦虑': 'emotion',
      '任务': 'task',
      '咨询计划': 'plan',
      '核心议题': 'core'
    };
    return tagTypeMap[tag] || 'important';
  }
  
  // 获取标签图标
  getTagIcon(tag) {
    const tagIconMap = {
      '重要': '⭐',
      '风险': '⚠️',
      '悲伤': '😢',
      '哭': '😢',
      '焦虑': '😰',
      '任务': '✅',
      '咨询计划': '📋',
      '核心议题': '🎯'
    };
    return tagIconMap[tag] || '🏷️';
  }

  // 下载逐字稿
  downloadTranscript(sessionNumber) {
    // 获取保存的核销数据（包含标签信息）
    const checkouts = JSON.parse(localStorage.getItem('consultationCheckouts') || '[]');
    const currentCheckout = checkouts.find(checkout => 
      checkout.clientName === this.currentClient
    );
    
    let transcriptData = '';
    
    if (currentCheckout && currentCheckout.quickNotes && currentCheckout.quickNotes.length > 0) {
      // 如果有快速笔记标签，生成带标签的逐字稿文本
      transcriptData = this.generateTaggedTranscriptText(sessionNumber, currentCheckout);
    } else {
      // 生成默认的逐字稿文本
      transcriptData = this.generateDefaultTranscriptText(sessionNumber);
    }
    
    const blob = new Blob([transcriptData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sessionNumber}_逐字稿_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log(`下载 ${sessionNumber} 的逐字稿`);
  }
  
  // 生成带标签的逐字稿文本
  generateTaggedTranscriptText(sessionNumber, checkoutData) {
    const mockTranscriptItems = [
      {
        speaker: '咨询师',
        time: '[00:00:15]',
        content: '好的，今天我们继续上次的话题。您最近的睡眠状况怎么样？有改善吗？'
      },
      {
        speaker: '来访者',
        time: '[00:00:32]',
        content: '嗯，比之前好一些了，但还是会因为孩子的事情睡不着。'
      },
      {
        speaker: '咨询师',
        time: '[00:01:05]',
        content: '我观察到您在谈到工作时表情会变得紧张，这种感觉从什么时候开始的？'
      },
      {
        speaker: '来访者',
        time: '[00:01:28]',
        content: '可能从孩子上初中开始吧，学习压力大了，我们也跟着紧张。'
      },
      {
        speaker: '咨询师',
        time: '[00:02:10]',
        content: '很好，您能具体描述一下那种紧张的感觉吗？'
      },
      {
        speaker: '来访者',
        time: '[00:02:35]',
        content: '就是心里总是悬着，特别是看到他在玩手机的时候，我就控制不住要说他。'
      },
      {
        speaker: '咨询师',
        time: '[00:03:02]',
        content: '理解。那么我们来尝试一个放松练习，请您跟着我的指导，先深呼吸...'
      }
    ];
    
    let result = `${sessionNumber} 咨询逐字稿（包含标签信息）\n`;
    result += `导出时间：${new Date().toLocaleString('zh-CN')}\n`;
    result += `客户：${this.currentClient}\n\n`;
    result += '==================================================\n\n';
    
    mockTranscriptItems.forEach((item, index) => {
      // 使用更精确的匹配逻辑，与显示逻辑保持一致
      const matchingNote = checkoutData.quickNotes.find(note => {
        if (!note.originalTranscript || !note.originalTranscript.text) {
          return false;
        }
        
        const noteText = note.originalTranscript.text.trim();
        const itemContent = item.content.trim();
        
        // 精确匹配：要么完全相同，要么逐字稿内容包含笔记内容且长度相差不大
        return noteText === itemContent || 
               (itemContent.includes(noteText) && Math.abs(itemContent.length - noteText.length) < 10);
      });
      
      result += `${item.speaker} ${item.time}: ${item.content}\n`;
      
      // 如果有标签，添加标签信息
      if (matchingNote && matchingNote.tags && matchingNote.tags.length > 0) {
        result += `【标签】: ${matchingNote.tags.join(', ')}\n`;
      }
      
      result += '\n';
    });
    
    // 添加标签统计
    if (checkoutData.quickNotes && checkoutData.quickNotes.length > 0) {
      result += '\n==================================================\n';
      result += '标签统计:\n\n';
      
      const tagCounts = {};
      checkoutData.quickNotes.forEach(note => {
        if (note.tags) {
          note.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
      });
      
      Object.entries(tagCounts).forEach(([tag, count]) => {
        const icon = this.getTagIcon(tag);
        result += `${icon} ${tag}: ${count}次\n`;
      });
    }
    
    return result;
  }
  
  // 生成默认的逐字稿文本
  generateDefaultTranscriptText(sessionNumber) {
    return `${sessionNumber} 咨询逐字稿\n\n咨询师 [00:00:15]: 好的，今天我们继续上次的话题。您最近的睡眠状况怎么样？有改善吗？\n\n来访者 [00:00:32]: 嗯，比之前好一些了，但还是会因为孩子的事情睡不着。\n\n咨询师 [00:01:05]: 我观察到您在谈到工作时表情会变得紧张，这种感觉从什么时候开始的？\n\n来访者 [00:01:28]: 可能从孩子上初中开始吧，学习压力大了，我们也跟着紧张。`;
  }

  // 导出记录为PDF
  exportToPDF() {
    // 这里可以添加PDF导出功能
    console.log('导出PDF功能待实现');
  }

  // 分享记录
  shareRecord() {
    // 这里可以添加分享功能
    console.log('分享功能待实现');
  }

  // 加载咨询笔记
  loadConsultationNotes() {
    this.notesLoaded = true;
    
    // 从localStorage获取保存的咨询笔记数据
    const savedNotes = JSON.parse(localStorage.getItem('consultationNotes') || '[]');
    const currentNotes = savedNotes.find(note => 
      note.clientName === this.currentClient
    );
    
    // 更新客户信息
    if (this.clientNameSpan) {
      this.clientNameSpan.textContent = this.currentClient;
    }
    
    if (currentNotes) {
      // 如果有保存的笔记数据，显示笔记内容
      this.displayConsultationNotes(currentNotes);
      
      // 更新咨询时间信息
      if (this.consultationTimeSpan) {
        this.consultationTimeSpan.textContent = currentNotes.consultationTime;
      }
    } else {
      // 如果没有保存的笔记，显示占位符
      this.showNotesPlaceholder();
    }
  }

  // 显示咨询笔记内容
  displayConsultationNotes(notesData) {
    if (!this.notesContent) return;
    
    // 创建笔记展示容器
    const notesDisplay = document.createElement('div');
    notesDisplay.className = 'notes-display';
    
    // 如果有画布数据，显示为图片
    if (notesData.canvasData) {
      const canvasImg = document.createElement('img');
      canvasImg.src = notesData.canvasData;
      canvasImg.alt = '咨询笔记画布';
      canvasImg.style.cssText = `
        width: 100%;
        height: auto;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        margin-bottom: 16px;
      `;
      notesDisplay.appendChild(canvasImg);
    }
    
    // 如果有逐字稿消息，显示标记内容
    if (notesData.transcriptMessages && notesData.transcriptMessages.length > 0) {
      const transcriptSection = document.createElement('div');
      transcriptSection.style.cssText = `
        background: white;
        border-radius: 8px;
        padding: 16px;
        margin-top: 16px;
        border: 1px solid #e2e8f0;
      `;
      
      const transcriptTitle = document.createElement('h4');
      transcriptTitle.textContent = '逐字稿摘要';
      transcriptTitle.style.cssText = `
        margin: 0 0 12px 0;
        color: #1e293b;
        font-size: 16px;
      `;
      transcriptSection.appendChild(transcriptTitle);
      
      const transcriptList = document.createElement('div');
      transcriptList.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 8px;
      `;
      
      // 显示最近的几条逐字稿消息
      const recentMessages = notesData.transcriptMessages.slice(-5);
      recentMessages.forEach(message => {
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
          padding: 8px 12px;
          background: #f8fafc;
          border-radius: 6px;
          border-left: 3px solid ${message.speaker === '咨询师' ? '#3b82f6' : '#10b981'};
        `;
        
        messageDiv.innerHTML = `
          <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">
            ${message.speaker}
          </div>
          <div style="font-size: 14px; color: #1e293b;">
            ${message.content}
          </div>
        `;
        
        transcriptList.appendChild(messageDiv);
      });
      
      transcriptSection.appendChild(transcriptList);
      notesDisplay.appendChild(transcriptSection);
    }
    
    // 添加咨询信息摘要
    const summarySection = document.createElement('div');
    summarySection.style.cssText = `
      background: white;
      border-radius: 8px;
      padding: 16px;
      margin-top: 16px;
      border: 1px solid #e2e8f0;
    `;
    
    summarySection.innerHTML = `
      <h4 style="margin: 0 0 12px 0; color: #1e293b; font-size: 16px;">咨询基本信息</h4>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
        <div>
          <span style="color: #64748b; font-size: 14px;">咨询时长:</span>
          <span style="color: #1e293b; font-weight: 500; margin-left: 8px;">${notesData.duration || '未记录'}</span>
        </div>
        <div>
          <span style="color: #64748b; font-size: 14px;">保存时间:</span>
          <span style="color: #1e293b; font-weight: 500; margin-left: 8px;">${new Date(notesData.timestamp).toLocaleString('zh-CN')}</span>
        </div>
        <div>
          <span style="color: #64748b; font-size: 14px;">逐字稿条数:</span>
          <span style="color: #1e293b; font-weight: 500; margin-left: 8px;">${notesData.transcriptMessages ? notesData.transcriptMessages.length : 0} 条</span>
        </div>
      </div>
    `;
    
    notesDisplay.appendChild(summarySection);
    
    // 清空现有内容并添加新内容
    this.notesContent.innerHTML = '';
    this.notesContent.appendChild(notesDisplay);
  }

  // 显示笔记占位符
  showNotesPlaceholder() {
    if (!this.notesContent) return;
    
    this.notesContent.innerHTML = `
      <div class="notes-placeholder">
        <div class="placeholder-icon">📋</div>
        <p>暂无咨询笔记内容</p>
        <small>请先进行咨询并保存笔记</small>
      </div>
    `;
  }

  // 导出记录
  exportRecord() {
    // 如果是待确认状态，先确认记录
    if (this.recordStatus === 'pending') {
      this.confirmRecord();
      // 短暂延迟后再执行导出
      setTimeout(() => {
        this.performExport();
      }, 500);
      return;
    }
    
    // 如果是生成中状态，提示用户等待
    if (this.recordStatus === 'generating') {
      alert('记录正在生成中，请稍等片刻再导出');
      return;
    }
    
    // 正常导出
    this.performExport();
  }

  // 执行导出操作
  performExport() {
    if (this.currentMainTab === 'notes') {
      this.exportConsultationNotes();
    } else {
      this.exportAIRecord();
    }
  }

  // 导出咨询笔记
  exportConsultationNotes() {
    const savedNotes = JSON.parse(localStorage.getItem('consultationNotes') || '[]');
    const currentNotes = savedNotes.find(note => 
      note.clientName === this.currentClient
    );
    
    if (!currentNotes) {
      alert('没有找到可导出的咨询笔记');
      return;
    }
    
    // 创建导出内容
    let exportContent = `咨询笔记 - ${this.currentClient}\n`;
    exportContent += `咨询时间: ${currentNotes.consultationTime}\n`;
    exportContent += `咨询时长: ${currentNotes.duration}\n`;
    exportContent += `保存时间: ${new Date(currentNotes.timestamp).toLocaleString('zh-CN')}\n\n`;
    
    if (currentNotes.transcriptMessages && currentNotes.transcriptMessages.length > 0) {
      exportContent += '逐字稿内容:\n';
      exportContent += '================\n';
      currentNotes.transcriptMessages.forEach((message, index) => {
        exportContent += `${index + 1}. [${message.speaker}] ${message.content}\n`;
      });
    }
    
    // 下载文件
    this.downloadTextFile(exportContent, `${this.currentClient}_咨询笔记_${new Date().toISOString().split('T')[0]}.txt`);
  }

  // 导出AI智能记录
  exportAIRecord() {
    // 获取当前显示的智能分析内容
    const activePanel = document.querySelector('.tab-panel.active');
    if (!activePanel) {
      alert('没有可导出的智能记录内容');
      return;
    }
    
    let exportContent = `AI智能咨询记录 - ${this.currentClient}\n`;
    exportContent += `导出时间: ${new Date().toLocaleString('zh-CN')}\n\n`;
    
    // 提取文本内容
    const textContent = activePanel.textContent || activePanel.innerText;
    exportContent += textContent;
    
    // 下载文件
    this.downloadTextFile(exportContent, `${this.currentClient}_智能记录_${new Date().toISOString().split('T')[0]}.txt`);
  }

  // 下载文本文件
  downloadTextFile(content, filename) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  new ConsultationRecord();
}); 