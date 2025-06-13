// 咨询笔记页面功能 - iPad优化版本
class ConsultationNotesNew {
  constructor() {
    // 基础状态
    this.isRecording = false;
    this.startTime = null;
    this.timerInterval = null;
    this.transcriptMessages = [];
    
    // 画布相关
    this.notebookCanvas = null;
    this.notebookCtx = null;
    this.pureCanvas = null;
    this.pureCtx = null;
    this.currentTool = 'pen';
    this.currentColor = '#000000';
    this.currentSize = 3;
    this.isDrawing = false;
    this.lastPoint = { x: 0, y: 0 };
    this.canvasHistory = [];
    this.historyIndex = -1;
    
    // UI状态
    this.isAiAssistantOpen = false;
    this.isTranscriptOpen = false;
    this.selectedDuration = 60;
    
    // 正念冥想相关
    this.meditationTimer = null;
    this.meditationDuration = 0;
    this.meditationElapsed = 0;
    this.isPlaying = false;
    
    // AI助手拖拽相关
    this.isDragging = false;
    this.dragOffset = { x: 0, y: 0 };
    
    // 模态窗口
    this.pureCanvasModal = document.getElementById('pureCanvasModal');
    this.meditationModal = document.getElementById('meditationModal');
    this.checkoutModal = document.getElementById('checkoutModal');
    
    // 咨询工具按钮
    this.pureCanvasBtn = document.getElementById('pureCanvasBtn');
    this.meditationBtn = document.getElementById('meditationBtn');
    this.endConsultationBtn = document.getElementById('endConsultationBtn');
    
    // 画板相关
    this.saveCanvasBtn = document.getElementById('saveCanvasBtn');
    this.hasCanvasContent = false;
    
    // 计时器
    this.sessionTimer = document.getElementById('sessionTimer');
    
    // 逐字稿标记状态
    this.isMarkingMode = false;
    this.markedMessages = [];
    this.transcriptPaused = false;
    this.pendingMessages = [];
    this.selectionChangeListenerAdded = false;
    
    // 长按相关状态
    this.longPressTimer = null;
    this.longPressStartPos = null;
    this.isLongPressing = false;
    this.longPressThreshold = 500; // 500ms长按阈值
    
    // 逐字稿滚动控制
    this.isUserScrolling = false;
    this.userScrollTimeout = null;
    this.autoScrollEnabled = true;
    
    this.initializeElements();
    this.initializeCanvas();
    this.initializeEventListeners();
    this.loadConsultationInfo();
    this.startTimer();
    this.initializeDragAndDrop();
  }

  initializeElements() {
    // 画布元素
    this.notebookCanvas = document.getElementById('notebookCanvas');
    this.pureCanvas = document.getElementById('pureCanvas');
    
    // 控制按钮
    this.aiAssistantBtn = document.getElementById('aiAssistantBtn');
    this.transcriptBtn = document.getElementById('transcriptBtn');
    
    // 工具栏元素
    this.drawingTools = document.querySelectorAll('[data-tool]');
    this.colorBtns = document.querySelectorAll('.color-btn');
    this.brushSize = document.getElementById('brushSize');
    
    // AI助手元素
    this.aiAssistantPopup = document.getElementById('aiAssistantPopup');
    this.popupHeader = document.getElementById('popupHeader');
    this.assistantToggle = document.getElementById('assistantToggle');
    this.assistantClose = document.getElementById('assistantClose');
    this.expandBtn = document.getElementById('expandBtn');
    this.observationTitle = document.getElementById('observationTitle');
    this.statusTag = document.getElementById('statusTag');
    
    // 逐字稿元素
    this.transcriptPanel = document.getElementById('transcriptPanel');
    this.transcriptContent = document.querySelector('.transcript-content');
    this.transcriptStream = document.getElementById('transcriptStream');
    this.quickMarkBtn = document.getElementById('quickMarkBtn');
    this.endMarkBtn = document.getElementById('endMarkBtn');
    this.addToNotesBtn = document.getElementById('addToNotesBtn');
    this.scrollIndicator = document.getElementById('scrollIndicator');
  }

  initializeCanvas() {
    // 初始化笔记本画布
    this.initNotebookCanvas();
    
    // 初始化纯画板画布
    this.initPureCanvas();
  }

  initNotebookCanvas() {
    if (!this.notebookCanvas) return;
    
    this.notebookCtx = this.notebookCanvas.getContext('2d');
    this.resizeNotebookCanvas();
    
    // 设置画布样式
    this.notebookCtx.lineCap = 'round';
    this.notebookCtx.lineJoin = 'round';
    this.notebookCtx.strokeStyle = this.currentColor;
    this.notebookCtx.lineWidth = this.currentSize;
    
    // 保存初始状态
    this.saveCanvasState();
    
    // 响应窗口大小变化
    window.addEventListener('resize', () => {
      this.resizeNotebookCanvas();
    });
  }

  initPureCanvas() {
    if (!this.pureCanvas) return;
    
    this.pureCtx = this.pureCanvas.getContext('2d');
    this.resizePureCanvas();
    
    // 设置画布样式
    this.pureCtx.lineCap = 'round';
    this.pureCtx.lineJoin = 'round';
    this.pureCtx.strokeStyle = this.currentColor;
    this.pureCtx.lineWidth = this.currentSize;
  }

  resizeNotebookCanvas() {
    const rect = this.notebookCanvas.parentElement.getBoundingClientRect();
    
    // 保存当前画布内容
    const imageData = this.notebookCtx ? this.notebookCtx.getImageData(0, 0, this.notebookCanvas.width, this.notebookCanvas.height) : null;
    
    // 设置画布尺寸
    this.notebookCanvas.width = rect.width;
    this.notebookCanvas.height = rect.height;
    
    // 恢复画布内容
    if (imageData) {
      this.notebookCtx.putImageData(imageData, 0, 0);
    }
    
    // 重新设置绘图属性
    this.setCanvasStyle(this.notebookCtx);
  }

  resizePureCanvas() {
    const rect = this.pureCanvas.parentElement.getBoundingClientRect();
    this.pureCanvas.width = rect.width;
    this.pureCanvas.height = rect.height - 120; // 减去头部和工具栏高度
    this.setCanvasStyle(this.pureCtx);
  }

  setCanvasStyle(ctx) {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = this.currentColor;
    ctx.lineWidth = this.currentSize;
  }

  initializeEventListeners() {
    // 控制按钮事件
    this.aiAssistantBtn?.addEventListener('click', () => this.toggleAiAssistant());
    this.transcriptBtn?.addEventListener('click', () => this.toggleTranscript());
    
    // AI助手控制
    this.assistantToggle?.addEventListener('click', () => this.toggleAssistantCollapse());
    this.assistantClose?.addEventListener('click', () => this.closeAiAssistant());
    
    // 展开按钮控制
    this.expandBtn?.addEventListener('click', () => this.toggleAssistantCollapse());
    
    // 工具选择
    this.drawingTools.forEach(tool => {
      tool.addEventListener('click', (e) => {
        this.selectTool(e.target.dataset.tool);
      });
    });
    
    // 颜色选择
    this.colorBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.selectColor(e.target.dataset.color);
      });
    });
    
    // 画笔大小
    this.brushSize?.addEventListener('input', (e) => {
      this.currentSize = parseInt(e.target.value);
      this.setCanvasStyle(this.notebookCtx);
      this.setCanvasStyle(this.pureCtx);
    });
    
    // 笔记本画布事件
    this.setupCanvasEvents(this.notebookCanvas, this.notebookCtx);
    
    // 纯画板画布事件
    this.setupCanvasEvents(this.pureCanvas, this.pureCtx);
    
    // 咨询工具
    this.pureCanvasBtn?.addEventListener('click', () => this.openPureCanvas());
    this.meditationBtn?.addEventListener('click', () => this.openMeditation());
    this.endConsultationBtn?.addEventListener('click', () => this.showCheckoutModal());
    
    // 逐字稿控制
    this.quickMarkBtn?.addEventListener('click', () => this.startQuickMark());
    this.endMarkBtn?.addEventListener('click', () => this.endQuickMark());
    this.addToNotesBtn?.addEventListener('click', () => this.addMarkedToNotes());
    
    // 逐字稿滚动事件监听
    this.setupTranscriptScrollEvents();
    
    // 模态窗口关闭
    this.setupModalEvents();
    
    // 动作工具
    this.setupActionTools();
    
    // 键盘快捷键
    document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
  }

  setupCanvasEvents(canvas, ctx) {
    if (!canvas || !ctx) return;
    
    // 鼠标事件
    canvas.addEventListener('mousedown', (e) => this.startDrawing(e, ctx, canvas));
    canvas.addEventListener('mousemove', (e) => this.draw(e, ctx, canvas));
    canvas.addEventListener('mouseup', () => this.stopDrawing());
    canvas.addEventListener('mouseout', () => this.stopDrawing());
    
    // 触摸事件 (iPad支持)
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      this.startDrawing(mouseEvent, ctx, canvas);
    }, { passive: false });
    
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      this.draw(mouseEvent, ctx, canvas);
    }, { passive: false });
    
    canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.stopDrawing();
    });
  }

  startDrawing(e, ctx, canvas) {
    this.isDrawing = true;
    const targetCanvas = canvas || e.target;
    if (!targetCanvas) return;
    
    const rect = targetCanvas.getBoundingClientRect();
    this.lastPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    
    // 设置绘图模式
    if (this.currentTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = this.currentSize * 3;
    } else if (this.currentTool === 'highlighter') {
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = this.currentColor;
      ctx.lineWidth = this.currentSize * 2;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.strokeStyle = this.currentColor;
      ctx.lineWidth = this.currentSize;
    }
  }

  draw(e, ctx, canvas) {
    if (!this.isDrawing) return;
    
    const targetCanvas = canvas || e.target;
    if (!targetCanvas) return;
    
    const rect = targetCanvas.getBoundingClientRect();
    const currentPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    
    ctx.beginPath();
    ctx.moveTo(this.lastPoint.x, this.lastPoint.y);
    ctx.lineTo(currentPoint.x, currentPoint.y);
    ctx.stroke();
    
    this.lastPoint = currentPoint;
    
    // 如果是在纯画板上绘图，标记有内容
    if (ctx === this.pureCtx) {
      this.hasCanvasContent = true;
    }
  }

  stopDrawing() {
    if (this.isDrawing) {
      this.isDrawing = false;
      this.saveCanvasState();
    }
  }

  selectTool(tool) {
    this.currentTool = tool;
    
    // 更新工具按钮状态
    this.drawingTools.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tool="${tool}"]`)?.classList.add('active');
    
    // 更新光标
    const cursor = {
      'pen': 'crosshair',
      'eraser': 'grab',
      'highlighter': 'crosshair'
    }[tool] || 'default';
    
    if (this.notebookCanvas) this.notebookCanvas.style.cursor = cursor;
    if (this.pureCanvas) this.pureCanvas.style.cursor = cursor;
  }

  selectColor(color) {
    this.currentColor = color;
    
    // 更新颜色按钮状态
    this.colorBtns.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-color="${color}"]`)?.classList.add('active');
    
    // 更新画布颜色
    if (this.notebookCtx) this.notebookCtx.strokeStyle = color;
    if (this.pureCtx) this.pureCtx.strokeStyle = color;
  }

  saveCanvasState() {
    if (!this.notebookCanvas) return;
    
    this.historyIndex++;
    if (this.historyIndex < this.canvasHistory.length) {
      this.canvasHistory.length = this.historyIndex;
    }
    this.canvasHistory.push(this.notebookCanvas.toDataURL());
  }

  setupActionTools() {
    document.getElementById('undoBtn')?.addEventListener('click', () => this.undo());
    document.getElementById('redoBtn')?.addEventListener('click', () => this.redo());
    document.getElementById('clearBtn')?.addEventListener('click', () => this.clearCanvas());
    document.getElementById('saveBtn')?.addEventListener('click', () => this.saveNotes());
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.restoreCanvasState();
    }
  }

  redo() {
    if (this.historyIndex < this.canvasHistory.length - 1) {
      this.historyIndex++;
      this.restoreCanvasState();
    }
  }

  restoreCanvasState() {
    if (!this.notebookCanvas || !this.canvasHistory[this.historyIndex]) return;
    
    const img = new Image();
    img.onload = () => {
      this.notebookCtx.clearRect(0, 0, this.notebookCanvas.width, this.notebookCanvas.height);
      this.notebookCtx.drawImage(img, 0, 0);
    };
    img.src = this.canvasHistory[this.historyIndex];
  }

  clearCanvas() {
    if (confirm('确定要清空画布吗？')) {
      this.notebookCtx?.clearRect(0, 0, this.notebookCanvas.width, this.notebookCanvas.height);
      this.saveCanvasState();
    }
  }

  // UI控制方法
  toggleAiAssistant() {
    this.isAiAssistantOpen = !this.isAiAssistantOpen;
    
    if (this.isAiAssistantOpen) {
      this.aiAssistantPopup?.classList.add('show');
      this.aiAssistantBtn?.classList.add('active');
      this.simulateAiObservations();
    } else {
      this.aiAssistantPopup?.classList.remove('show');
      this.aiAssistantBtn?.classList.remove('active');
    }
  }

  closeAiAssistant() {
    this.isAiAssistantOpen = false;
    this.aiAssistantPopup?.classList.remove('show');
    this.aiAssistantBtn?.classList.remove('active');
  }

  toggleAssistantCollapse() {
    this.aiAssistantPopup?.classList.toggle('collapsed');
    const toggle = this.assistantToggle;
    if (toggle) {
      toggle.textContent = this.aiAssistantPopup?.classList.contains('collapsed') ? '+' : '−';
    }
  }

  toggleTranscript() {
    this.isTranscriptOpen = !this.isTranscriptOpen;
    
    if (this.isTranscriptOpen) {
      this.transcriptPanel?.classList.add('show');
      this.transcriptBtn?.classList.add('active');
      
      // 直接开始实时逐字稿显示，不加载历史内容
      if (!this.isRecording) {
        this.startTranscriptDisplay();
      }
    } else {
      this.transcriptPanel?.classList.remove('show');
      this.transcriptBtn?.classList.remove('active');
    }
  }

  // 逐字稿功能
  loadHistoricalTranscript() {
    // 预加载的历史逐字稿内容
    const historicalMessages = [
      { speaker: '咨询师', content: '欢迎您来到今天的咨询，请先让我们回顾一下上次咨询的内容。', time: this.getHistoricalTime(-15) },
      { speaker: '来访者', content: '好的，上次我们主要谈到了我的睡眠问题和工作压力。', time: this.getHistoricalTime(-14) },
      { speaker: '咨询师', content: '是的，您提到最近几个月睡眠质量下降，主要是入睡困难。这周情况如何？', time: this.getHistoricalTime(-13) },
      { speaker: '来访者', content: '这周稍微好一些了，按照您建议的睡前放松练习，确实有帮助。但是我发现一个问题，就是当我白天工作压力特别大的时候，晚上即使做了放松练习，脑子里还是会不停地想工作的事情，想着明天要做什么，担心项目能不能按时完成，担心老板会不会不满意我的工作表现。有时候躺在床上两三个小时都睡不着，越想越焦虑，越焦虑越睡不着，形成了一个恶性循环。', time: this.getHistoricalTime(-12) },
      { speaker: '咨询师', content: '很好，看来放松技巧对您是有效的。那工作方面的压力呢？', time: this.getHistoricalTime(-11) },
      { speaker: '来访者', content: '工作压力还是比较大，特别是这个月有几个重要项目要完成。', time: this.getHistoricalTime(-10) },
      { speaker: '咨询师', content: '我理解。让我们今天重点探讨一下如何更好地管理工作压力。', time: this.getHistoricalTime(-9) }
    ];
    
    // 添加历史消息到逐字稿流
    historicalMessages.forEach(message => {
      this.addHistoricalMessage(message);
      this.transcriptMessages.push(message);
    });
    
    // 添加分隔线表示实时内容开始
    this.addTimeSeparator();
    
    // 滚动到底部，准备显示实时内容
    if (this.transcriptContent) {
      this.transcriptContent.scrollTop = this.transcriptContent.scrollHeight;
      console.log('历史消息加载完成 - 滚动到底部，滚动位置:', this.transcriptContent.scrollTop, '总高度:', this.transcriptContent.scrollHeight);
    }
    
    console.log('已加载历史逐字稿内容，准备开始实时流式显示');
  }

  getHistoricalTime(minutesAgo) {
    const now = new Date();
    const historicalTime = new Date(now.getTime() + minutesAgo * 60000);
    return historicalTime.toLocaleTimeString('zh-CN', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  }

  addHistoricalMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.className = 'transcript-message historical';
    
    messageElement.innerHTML = `
      <div class="message-speaker">${message.speaker}</div>
      <div class="message-content">${message.content}</div>
      <div class="message-time">[${message.time}]</div>
    `;
    
    this.transcriptStream?.appendChild(messageElement);
  }

  addTimeSeparator() {
    const separator = document.createElement('div');
    separator.className = 'time-separator';
    separator.style.cssText = `
      display: flex;
      align-items: center;
      margin: 20px 0;
      text-align: center;
      color: #64748b;
      font-size: 12px;
      font-weight: 500;
    `;
    
    separator.innerHTML = `
      <div style="flex: 1; height: 1px; background: #e2e8f0;"></div>
      <div style="padding: 0 16px; background: white;">实时逐字稿开始</div>
      <div style="flex: 1; height: 1px; background: #e2e8f0;"></div>
    `;
    
    this.transcriptStream?.appendChild(separator);
  }

  startTranscriptDisplay() {
    if (!this.isRecording) {
      this.isRecording = true;
      this.simulateTranscription();
      
      // 初始化滚动指示器
      this.updateScrollIndicator('auto-scrolling', '自动跟随');
      
      console.log('开始显示逐字稿');
    }
  }

  startQuickMark() {
    this.isMarkingMode = true;
    this.transcriptPaused = true;
    
    // 切换按钮显示
    this.quickMarkBtn.style.display = 'none';
    this.endMarkBtn.style.display = 'inline-flex';
    
    // 为所有消息添加点击事件
    this.addClickEventsToMessages();
    
    // 更新滚动指示器
    this.updateScrollIndicator('user-scrolling', '标记模式');
    
    console.log('进入快速标记模式 - 自动滚动已停止');
  }

  endQuickMark() {
    this.isMarkingMode = false;
    this.transcriptPaused = false;
    
    // 切换按钮显示
    this.quickMarkBtn.style.display = 'inline-flex';
    this.endMarkBtn.style.display = 'none';
    
    // 如果有标记的消息，显示添加到笔记按钮
    if (this.markedMessages.length > 0) {
      this.addToNotesBtn.style.display = 'inline-flex';
    }
    
    // 移除消息点击事件
    this.removeClickEventsFromMessages();
    
    // 继续逐字稿滚动，逐渐加快到正常速度
    this.resumeTranscriptWithCatchup();
    
    // 重置用户滚动状态并恢复自动滚动
    this.isUserScrolling = false;
    if (this.userScrollTimeout) {
      clearTimeout(this.userScrollTimeout);
      this.userScrollTimeout = null;
    }
    
    if (this.transcriptContent) {
      this.transcriptContent.scrollTop = this.transcriptContent.scrollHeight;
    }
    
    // 更新滚动指示器
    this.updateScrollIndicator('auto-scrolling', '自动跟随');
    
    console.log('退出快速标记模式 - 自动滚动已恢复');
  }

  addClickEventsToMessages() {
    const messages = this.transcriptStream.querySelectorAll('.transcript-message');
    messages.forEach(message => {
      message.style.cursor = 'pointer';
      message.style.transition = 'background-color 0.2s ease';
      message.style.userSelect = 'text'; // 允许文本选择
      
      // 添加点击事件（用于整段标记）
      message.addEventListener('click', (e) => this.handleMessageClick(e));
      
      // 添加长按事件监听器
      message.addEventListener('mousedown', (e) => this.handleLongPressStart(e));
      message.addEventListener('mousemove', (e) => this.handleLongPressMove(e));
      message.addEventListener('mouseup', (e) => {
        // 先处理长按结束
        this.handleLongPressEnd(e);
        // 如果不是长按，再处理文本选择
        if (!this.isLongPressing) {
          console.log('mouseup事件触发 - 文本选择');
          this.handleTextSelection(e);
        }
      });
      message.addEventListener('mouseleave', (e) => this.handleLongPressCancel(e));
      
      // 触摸设备长按支持 - 改为passive: true以支持滚动
      message.addEventListener('touchstart', (e) => {
        // 只在需要长按功能时才阻止默认行为
        this.handleLongPressStart(e.touches[0]);
      }, { passive: true });
      
      message.addEventListener('touchmove', (e) => {
        this.handleLongPressMove(e.touches[0]);
      }, { passive: true });
      
      message.addEventListener('touchend', (e) => {
        // 先处理长按结束
        this.handleLongPressEnd(e);
        // 如果不是长按，再处理文本选择
        if (!this.isLongPressing) {
          console.log('touchend事件触发 - 文本选择');
          this.handleTextSelection(e);
        }
      }, { passive: true });
      
      message.addEventListener('touchcancel', (e) => this.handleLongPressCancel(e));
      
      // 添加选择变化事件作为备用
      message.addEventListener('selectstart', (e) => {
        console.log('selectstart事件触发');
      });
      
      // 添加双击事件用于快速选择单词
      message.addEventListener('dblclick', (e) => {
        console.log('双击事件触发');
        setTimeout(() => {
          this.handleTextSelection(e);
        }, 50);
      });
      
      // 添加鼠标悬停效果
      message.addEventListener('mouseenter', () => {
        if (!message.classList.contains('marked') && !message.querySelector('.partial-mark')) {
          message.style.backgroundColor = '#f0f9ff';
        }
      });
      
      message.addEventListener('mouseleave', () => {
        if (!message.classList.contains('marked') && !message.querySelector('.partial-mark')) {
          message.style.backgroundColor = '';
        }
      });
    });
    
    // 添加全局选择变化监听器作为备用
    if (!this.selectionChangeListenerAdded) {
      document.addEventListener('selectionchange', () => {
        if (this.isMarkingMode) {
          const selection = window.getSelection();
          if (selection.rangeCount > 0 && selection.toString().trim().length > 0) {
            console.log('全局选择变化检测到:', selection.toString().trim());
            
            // 检查选择是否在逐字稿消息内
            const range = selection.getRangeAt(0);
            const messageElement = range.startContainer.closest('.transcript-message');
            if (messageElement && this.transcriptStream.contains(messageElement)) {
              console.log('在逐字稿消息内检测到选择');
              // 延迟处理，等待选择完成
              setTimeout(() => {
                if (window.getSelection().toString().trim().length > 0) {
                  this.handleTextSelection({ currentTarget: messageElement });
                }
              }, 200);
            }
          }
        }
      });
      this.selectionChangeListenerAdded = true;
    }
  }

  removeClickEventsFromMessages() {
    const messages = this.transcriptStream.querySelectorAll('.transcript-message');
    messages.forEach(message => {
      message.style.cursor = '';
      message.style.userSelect = ''; // 恢复默认的文本选择，不要设置为none
      message.replaceWith(message.cloneNode(true)); // 移除所有事件监听器
    });
  }

  handleMessageClick(e) {
    // 检查是否有选中的文本，如果有则不处理整段标记
    const selection = window.getSelection();
    if (selection.toString().trim().length > 0) {
      return; // 有选中文本时不处理点击事件
    }
    
    const message = e.currentTarget;
    
    if (message.classList.contains('marked')) {
      // 取消标记
      this.unmarkMessage(message);
    } else {
      // 添加标记
      this.markMessage(message);
    }
  }

  markMessage(messageElement) {
    // 检查是否已经有部分标记
    const existingPartialMark = messageElement.querySelector('.partial-mark');
    if (existingPartialMark) {
      // 直接替换为整段标记，不需要确认
      this.removePartialMark(messageElement);
      this.showToast('已替换为整段标记', 'info');
    }
    
    messageElement.classList.add('marked');
    messageElement.style.backgroundColor = '#dbeafe';
    messageElement.style.border = '2px solid #3b82f6';
    messageElement.style.borderRadius = '8px';
    messageElement.style.padding = '12px';
    messageElement.style.marginBottom = '16px';
    
    // 创建标签容器
    const tagsContainer = document.createElement('div');
    tagsContainer.className = 'message-tags';
    tagsContainer.style.cssText = `
      margin-top: 8px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    `;
    
    // 表情标签行
    const emotionTags = document.createElement('div');
    emotionTags.className = 'emotion-tags';
    emotionTags.style.cssText = `
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    `;
    
    const emotions = ['😊', '😢', '😠', '😰', '😴', '🤔', '😮', '😌'];
    emotions.forEach(emotion => {
      const tag = document.createElement('button');
      tag.textContent = emotion;
      tag.className = 'emotion-tag';
      tag.style.cssText = `
        padding: 4px 8px;
        border: 1px solid #e2e8f0;
        background: white;
        border-radius: 16px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s ease;
      `;
      
      tag.addEventListener('click', (e) => {
        e.stopPropagation();
        tag.classList.toggle('selected');
        if (tag.classList.contains('selected')) {
          tag.style.background = '#3b82f6';
          tag.style.color = 'white';
          tag.style.borderColor = '#3b82f6';
        } else {
          tag.style.background = 'white';
          tag.style.color = '';
          tag.style.borderColor = '#e2e8f0';
        }
      });
      
      emotionTags.appendChild(tag);
    });
    
    // 文字标签行
    const textTags = document.createElement('div');
    textTags.className = 'text-tags';
    textTags.style.cssText = `
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    `;
    
    const textLabels = ['重要', '关键', '转折', '阻抗', '突破', '情绪', '认知', '行为'];
    textLabels.forEach(label => {
      const tag = document.createElement('button');
      tag.textContent = label;
      tag.className = 'text-tag';
      tag.style.cssText = `
        padding: 4px 12px;
        border: 1px solid #e2e8f0;
        background: white;
        border-radius: 16px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        transition: all 0.2s ease;
      `;
      
      tag.addEventListener('click', (e) => {
        e.stopPropagation();
        tag.classList.toggle('selected');
        if (tag.classList.contains('selected')) {
          tag.style.background = '#10b981';
          tag.style.color = 'white';
          tag.style.borderColor = '#10b981';
        } else {
          tag.style.background = 'white';
          tag.style.color = '';
          tag.style.borderColor = '#e2e8f0';
        }
      });
      
      textTags.appendChild(tag);
    });
    
    tagsContainer.appendChild(emotionTags);
    tagsContainer.appendChild(textTags);
    messageElement.appendChild(tagsContainer);
    
    // 添加到标记列表
    const messageData = {
      element: messageElement,
      speaker: messageElement.querySelector('.message-speaker').textContent,
      content: messageElement.querySelector('.message-content').textContent,
      time: messageElement.querySelector('.message-time').textContent,
      emotionTags: [],
      textTags: []
    };
    
    this.markedMessages.push(messageData);
  }

  unmarkMessage(messageElement) {
    messageElement.classList.remove('marked');
    messageElement.style.backgroundColor = '';
    messageElement.style.border = '';
    messageElement.style.borderRadius = '';
    messageElement.style.padding = '';
    messageElement.style.marginBottom = '';
    
    // 移除标签容器
    const tagsContainer = messageElement.querySelector('.message-tags');
    if (tagsContainer) {
      tagsContainer.remove();
    }
    
    // 从标记列表中移除
    this.markedMessages = this.markedMessages.filter(msg => msg.element !== messageElement);
    
    // 如果没有标记的消息了，隐藏添加到笔记按钮
    if (this.markedMessages.length === 0) {
      this.addToNotesBtn.style.display = 'none';
    }
  }

  resumeTranscriptWithCatchup() {
    // 处理暂停期间积累的消息
    if (this.pendingMessages.length > 0) {
      let index = 0;
      const catchupInterval = setInterval(() => {
        if (index < this.pendingMessages.length) {
          // 追赶时使用快速打字效果
          this.addTranscriptMessageWithFastTyping(this.pendingMessages[index]);
          index++;
        } else {
          clearInterval(catchupInterval);
          this.pendingMessages = [];
          // 恢复正常速度的逐字稿
          this.simulateTranscription();
        }
      }, 300); // 追赶速度：每0.3秒一条
    } else {
      // 直接恢复正常逐字稿
      this.simulateTranscription();
    }
  }

  addTranscriptMessageWithFastTyping(message) {
    // 创建消息容器
    const messageElement = document.createElement('div');
    messageElement.className = 'transcript-message typing';
    
    const time = this.formatCurrentTime();
    messageElement.innerHTML = `
      <div class="message-speaker">${message.speaker}</div>
      <div class="message-content"></div>
      <div class="message-time">[${time}]</div>
    `;
    
    this.transcriptStream?.appendChild(messageElement);
    
    // 获取内容容器
    const contentElement = messageElement.querySelector('.message-content');
    
    // 开始快速打字效果（追赶模式）
    this.typeMessage(contentElement, message.content, () => {
      // 打字完成后的回调
      messageElement.classList.remove('typing');
      
      // 如果在标记模式下，为新消息添加点击事件
      if (this.isMarkingMode) {
        this.addClickEventToMessage(messageElement);
      }
    }, 20); // 快速打字：每个字符20ms
    
    // 自动滚动到底部
    if (this.transcriptContent) {
      this.transcriptContent.scrollTop = this.transcriptContent.scrollHeight;
    }
  }

  addMarkedToNotes() {
    if (this.markedMessages.length === 0) {
      // 显示温和的提示而不是alert
      this.showToast('没有标记的内容可以添加', 'warning');
      return;
    }
    
    // 收集所有标记信息
    this.markedMessages.forEach(msg => {
      // 收集选中的表情标签
      const selectedEmotions = Array.from(msg.element.querySelectorAll('.emotion-tag.selected'))
        .map(tag => tag.textContent);
      
      // 收集选中的文字标签
      const selectedTextTags = Array.from(msg.element.querySelectorAll('.text-tag.selected'))
        .map(tag => tag.textContent);
      
      msg.emotionTags = selectedEmotions;
      msg.textTags = selectedTextTags;
    });
    
    // 在笔记本画布上添加标记内容
    this.drawMarkedContentOnCanvas();
    
    // 显示成功提示
    this.showToast(`已将 ${this.markedMessages.length} 条标记内容添加到笔记`, 'success');
    
    // 清空标记
    this.clearAllMarks();
  }

  drawMarkedContentOnCanvas() {
    if (!this.notebookCtx) return;
    
    const ctx = this.notebookCtx;
    const startY = 50;
    let currentY = startY;
    
    ctx.save();
    ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif';
    
    // 添加标题
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('逐字稿标记内容:', 80, currentY);
    currentY += 30;
    
    this.markedMessages.forEach((msg, index) => {
      // 绘制分隔线
      if (index > 0) {
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(80, currentY);
        ctx.lineTo(this.notebookCanvas.width - 80, currentY);
        ctx.stroke();
        currentY += 20;
      }
      
      // 绘制说话人和时间
      ctx.fillStyle = '#3b82f6';
      ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, sans-serif';
      const headerText = `${msg.speaker} ${msg.time}${msg.isPartial ? ' [部分标记]' : ''}`;
      ctx.fillText(headerText, 80, currentY);
      currentY += 20;
      
      // 绘制内容
      ctx.fillStyle = '#1e293b';
      ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif';
      
      // 如果是部分标记，显示选中的文本和上下文
      let contentToDisplay = msg.content;
      if (msg.isPartial && msg.fullContent) {
        // 找到选中文本在完整内容中的位置
        const index = msg.fullContent.indexOf(msg.content);
        if (index !== -1) {
          const before = msg.fullContent.substring(0, index);
          const after = msg.fullContent.substring(index + msg.content.length);
          
          // 显示上下文（前后各20个字符）
          const contextBefore = before.length > 20 ? '...' + before.slice(-20) : before;
          const contextAfter = after.length > 20 ? after.slice(0, 20) + '...' : after;
          
          contentToDisplay = `${contextBefore}【${msg.content}】${contextAfter}`;
        }
      }
      
      const words = contentToDisplay.split('');
      let line = '';
      const maxWidth = this.notebookCanvas.width - 160;
      
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i];
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && line !== '') {
          ctx.fillText(line, 80, currentY);
          line = words[i];
          currentY += 20;
        } else {
          line = testLine;
        }
      }
      
      if (line !== '') {
        ctx.fillText(line, 80, currentY);
        currentY += 20;
      }
      
      // 绘制标签
      if (msg.emotionTags.length > 0 || msg.textTags.length > 0) {
        currentY += 5;
        ctx.fillStyle = '#64748b';
        ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
        
        let tagsText = '标签: ';
        if (msg.emotionTags.length > 0) {
          tagsText += msg.emotionTags.join(' ') + ' ';
        }
        if (msg.textTags.length > 0) {
          tagsText += msg.textTags.join(', ');
        }
        
        ctx.fillText(tagsText, 80, currentY);
        currentY += 25;
      } else {
        currentY += 15;
      }
    });
    
    ctx.restore();
    this.saveCanvasState();
  }

  clearAllMarks() {
    this.markedMessages.forEach(msg => {
      this.unmarkMessage(msg.element);
    });
    this.markedMessages = [];
    this.addToNotesBtn.style.display = 'none';
  }

  simulateTranscription() {
    if (!this.isRecording) return;
    
    const messages = [
      { speaker: '咨询师', content: '今天我们继续探讨您的睡眠状况，最近有什么变化吗？' },
      { speaker: '来访者', content: '还是不太好，晚上总是很难入睡，脑子里想很多事情。' },
      { speaker: '咨询师', content: '我注意到您提到脑子里想很多事情，能具体说说都在想些什么吗？' },
      { speaker: '来访者', content: '主要是工作上的事情，还有家里的一些矛盾，感觉压力很大。' },
      { speaker: '咨询师', content: '听起来您承受了很多压力，这些压力是从什么时候开始变得明显的？' },
      { speaker: '来访者', content: '大概是两个月前吧，工作变得特别忙，家里老人身体也不好。' },
      { speaker: '咨询师', content: '两个月前确实是一个转折点，我们来一起探讨一下应对压力的方法。' },
      { speaker: '来访者', content: '好的，我很想学会怎么处理这些压力。' },
      { speaker: '咨询师', content: '我们可以从认知层面开始，您觉得这些压力中哪些是可以控制的？' },
      { speaker: '来访者', content: '嗯...工作上的事情我觉得还是有一些可以调整的空间的。' },
      { speaker: '咨询师', content: '很好，这是一个很重要的认识。那家庭方面呢？' },
      { speaker: '来访者', content: '家里的事情...我觉得我能做的就是多陪陪老人，但工作太忙了。' },
      { speaker: '咨询师', content: '我理解您的两难处境。让我们先从工作压力开始，您能描述一下具体是什么让您感到压力吗？' },
      { speaker: '来访者', content: '主要是项目的截止日期，还有和同事的沟通问题，有时候感觉很孤立。' },
      { speaker: '咨询师', content: '孤立感确实会加重压力。您在工作中有没有可以信任的同事或朋友？' },
      { speaker: '来访者', content: '有一两个吧，但大家都很忙，不太好意思总是麻烦别人。' },
      { speaker: '咨询师', content: '这种想法很常见，但适当的求助其实是健康的人际交往方式。' },
      { speaker: '来访者', content: '是吗？我一直觉得应该自己解决问题，不想给别人添麻烦。' },
      { speaker: '咨询师', content: '这种自立的态度很好，但过度的自立可能会让我们错过很多支持和帮助。' },
      { speaker: '来访者', content: '您说得对，我确实很少主动寻求帮助，总觉得这样显得自己很无能。' },
      { speaker: '咨询师', content: '这种感受很常见，很多人都有这样的想法。让我们来探讨一下这种想法的来源。' },
      { speaker: '来访者', content: '可能从小就被教育要独立，要自己解决问题，不要依赖别人。' },
      { speaker: '咨询师', content: '这种教育方式有它的价值，但也可能让我们过度苛求自己。您觉得呢？' },
      { speaker: '来访者', content: '确实是这样，我总是对自己要求很高，做不好就会很自责。' },
      { speaker: '咨询师', content: '自我要求高是好事，但过度的自责可能会影响我们的心理健康。' },
      { speaker: '来访者', content: '那我应该怎么调整这种想法呢？' },
      { speaker: '咨询师', content: '我们可以尝试一些认知重构的技巧，比如质疑这些负面想法的合理性。' },
      { speaker: '来访者', content: '听起来很有用，您能具体说说怎么做吗？' },
      { speaker: '咨询师', content: '当然。比如当您觉得"我很无能"时，可以问自己：这个想法有什么证据支持吗？' },
      { speaker: '来访者', content: '嗯，这样想想，其实我在工作上还是有一些成就的。' }
    ];
    
    // 使用循环索引，让消息可以循环播放
    const currentIndex = this.transcriptMessages.length % messages.length;
    const currentMessage = messages[currentIndex];
    
    // 说话间隔时间：咨询师思考时间较短，来访者思考时间较长
    const pauseTime = currentMessage.speaker === '咨询师' ? 
      Math.random() * 1000 + 800 : // 咨询师：0.8-1.8秒思考时间
      Math.random() * 2000 + 1500; // 来访者：1.5-3.5秒思考时间
    
    console.log(`准备播放: ${currentMessage.speaker} - "${currentMessage.content}" (暂停${Math.round(pauseTime)}ms)`);
    
    setTimeout(() => {
      if (this.isRecording) {
        const message = messages[this.transcriptMessages.length % messages.length];
        
        if (this.transcriptPaused) {
          // 如果暂停了，将消息添加到待处理队列
          this.pendingMessages.push(message);
        } else {
          // 开始流式显示消息
          this.addTranscriptMessageWithTyping(message);
        }
        
        this.transcriptMessages.push(message);
        this.simulateTranscription();
      }
    }, pauseTime);
  }

  addTranscriptMessageWithTyping(message) {
    // 创建消息容器
    const messageElement = document.createElement('div');
    messageElement.className = 'transcript-message typing';
    
    const time = this.formatCurrentTime();
    messageElement.innerHTML = `
      <div class="message-speaker">${message.speaker}</div>
      <div class="message-content"></div>
      <div class="message-time">[${time}]</div>
    `;
    
    this.transcriptStream?.appendChild(messageElement);
    
    // 立即滚动到新消息（除非在标记模式下或用户正在滚动）
    if (this.transcriptContent && !this.isMarkingMode && !this.isUserScrolling) {
      this.transcriptContent.scrollTop = this.transcriptContent.scrollHeight;
      console.log('新消息添加 - 立即滚动，滚动位置:', this.transcriptContent.scrollTop, '总高度:', this.transcriptContent.scrollHeight);
    }
    
    // 获取内容容器
    const contentElement = messageElement.querySelector('.message-content');
    
    // 开始打字效果
    this.typeMessage(contentElement, message.content, () => {
      // 打字完成后的回调
      messageElement.classList.remove('typing');
      
      // 如果在标记模式下，为新消息添加点击事件
      if (this.isMarkingMode) {
        this.addClickEventToMessage(messageElement);
      }
      
      // 打字完成后再次确保滚动到底部（除非在标记模式下或用户正在滚动）
      if (this.transcriptContent && !this.isMarkingMode && !this.isUserScrolling) {
        this.transcriptContent.scrollTop = this.transcriptContent.scrollHeight;
        console.log('消息打字完成 - 最终滚动执行，滚动位置:', this.transcriptContent.scrollTop);
      }
    });
  }

  addClickEventToMessage(messageElement) {
    messageElement.style.cursor = 'pointer';
    messageElement.style.transition = 'background-color 0.2s ease';
    messageElement.style.userSelect = 'text'; // 允许文本选择
    
    // 添加点击事件（用于整段标记）
    messageElement.addEventListener('click', (e) => this.handleMessageClick(e));
    
    // 添加鼠标松开事件（用于选中文本标记）
    messageElement.addEventListener('mouseup', (e) => this.handleTextSelection(e));
    
    messageElement.addEventListener('mouseenter', () => {
      if (!messageElement.classList.contains('marked') && !messageElement.querySelector('.partial-mark')) {
        messageElement.style.backgroundColor = '#f0f9ff';
      }
    });
    
    messageElement.addEventListener('mouseleave', () => {
      if (!messageElement.classList.contains('marked') && !messageElement.querySelector('.partial-mark')) {
        messageElement.style.backgroundColor = '';
      }
    });
  }

  formatCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString('zh-CN', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  }

  // AI观察模拟
  simulateAiObservations() {
    const observations = [
      {
        type: 'emotion',
        title: '情感观察',
        status: 'attention',
        text: '注意到来访者在谈到家庭关系时语速变慢，可能触及敏感话题。',
        suggestion: '建议使用反映技术："我感觉到你在说这个话题时有些不太一样的感受？"'
      },
      {
        type: 'behavior',
        title: '行为分析',
        status: 'attention',
        text: '来访者身体前倾，显示出积极的参与度。',
        suggestion: '这是建立治疗关系的好时机，可以深入探索。'
      },
      {
        type: 'pattern',
        title: '模式识别',
        status: 'warning',
        text: '发现来访者反复提到"压力"和"焦虑"，这可能是核心议题。',
        suggestion: '建议探索压力的具体来源和应对方式。'
      },
      {
        type: 'risk',
        title: '风险评估',
        status: 'alert',
        text: '来访者提到"感觉没有希望"，需要关注自伤风险。',
        suggestion: '立即进行自伤风险评估，询问具体的自伤想法。'
      },
      {
        type: 'progress',
        title: '治疗进展',
        status: 'attention',
        text: '来访者开始主动分享内心感受，治疗关系有所改善。',
        suggestion: '继续保持当前的治疗节奏，鼓励更多的自我表达。'
      },
      {
        type: 'resistance',
        title: '阻抗分析',
        status: 'warning',
        text: '来访者频繁转移话题，可能在回避某些重要内容。',
        suggestion: '温和地指出这一模式，探索回避的原因。'
      }
    ];
    
    // 随机更新AI观察
    setInterval(() => {
      if (this.isAiAssistantOpen) {
        const randomObservation = observations[Math.floor(Math.random() * observations.length)];
        this.updateAiObservation(randomObservation);
      }
    }, 15000); // 每15秒更新一次
  }

  updateAiObservation(observation) {
    // 更新标题
    if (this.observationTitle) {
      this.observationTitle.textContent = observation.title;
    }
    
    // 更新状态标签
    if (this.statusTag) {
      this.statusTag.textContent = this.getStatusText(observation.status);
      this.statusTag.className = `status-tag ${observation.status}`;
    }
    
    // 更新always-visible观察内容
    const alwaysVisibleLabel = document.querySelector('.observation-item.always-visible .observation-label');
    if (alwaysVisibleLabel) {
      alwaysVisibleLabel.textContent = observation.text;
    }
    
    // 更新建议内容
    const suggestionText = document.querySelector('.suggestion-text');
    if (suggestionText) {
      suggestionText.textContent = `"${observation.suggestion}"`;
    }
  }

  getStatusText(status) {
    const statusMap = {
      'attention': '关注',
      'warning': '提示', 
      'alert': '预警'
    };
    return statusMap[status] || '关注';
  }

  // 模态窗口控制
  setupModalEvents() {
    // 画板模态窗口
    document.getElementById('closePureCanvas')?.addEventListener('click', () => {
      this.closePureCanvas();
    });
    
    // 画板保存按钮
    this.saveCanvasBtn?.addEventListener('click', () => {
      this.savePureCanvas();
    });
    
    // 正念冥想模态窗口
    document.getElementById('closeMeditation')?.addEventListener('click', () => {
      this.closeMeditation();
    });
    
    // 核销模态窗口
    document.getElementById('cancelCheckout')?.addEventListener('click', () => {
      this.checkoutModal?.classList.remove('show');
    });
    
    document.getElementById('confirmCheckout')?.addEventListener('click', () => {
      this.processCheckout();
    });
    
    // 点击背景关闭模态窗口
    [this.pureCanvasModal, this.meditationModal, this.checkoutModal].forEach(modal => {
      modal?.addEventListener('click', (e) => {
        if (e.target === modal) {
          if (modal === this.pureCanvasModal) {
            this.closePureCanvas();
          } else {
            modal.classList.remove('show');
          }
        }
      });
    });
    
    // 设置画板工具
    this.setupPureCanvasTools();
    
    // 设置正念冥想
    this.setupMeditation();
    
    // 设置核销选项
    this.setupCheckoutOptions();
  }

  openPureCanvas() {
    this.pureCanvasModal?.classList.add('show');
    // 隐藏底部工具栏
    const bottomToolbar = document.getElementById('bottomToolbar');
    if (bottomToolbar) {
      bottomToolbar.style.display = 'none';
    }
    setTimeout(() => {
      this.resizePureCanvas();
    }, 300);
  }

  openMeditation() {
    this.meditationModal?.classList.add('show');
  }

  closeMeditation() {
    this.meditationModal?.classList.remove('show');
    this.stopMeditation();
  }

  setupPureCanvasTools() {
    const canvasTools = document.querySelectorAll('.canvas-tool');
    const canvasColors = document.querySelectorAll('.canvas-color');
    
    canvasTools.forEach(tool => {
      tool.addEventListener('click', (e) => {
        const toolType = e.target.dataset.tool;
        if (toolType === 'clear') {
          if (this.hasCanvasContent) {
            if (confirm('确定要清空画板内容吗？')) {
              this.clearPureCanvas();
            }
          } else {
            this.clearPureCanvas();
          }
        } else {
          this.selectTool(toolType);
          canvasTools.forEach(t => t.classList.remove('active'));
          e.target.classList.add('active');
        }
      });
    });
    
    canvasColors.forEach(color => {
      color.addEventListener('click', (e) => {
        this.selectColor(e.target.dataset.color);
        canvasColors.forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
      });
    });
  }

  setupMeditation() {
    const meditationBtns = document.querySelectorAll('.meditation-btn');
    
    meditationBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const type = e.target.dataset.type;
        this.startMeditation(type);
      });
    });
    
    document.getElementById('playPauseBtn')?.addEventListener('click', () => {
      this.toggleMeditationPlayPause();
    });
    
    document.getElementById('resetBtn')?.addEventListener('click', () => {
      this.resetMeditation();
    });
  }

  startMeditation(type) {
    const durations = {
      'breathing': 300, // 5分钟
      'body-scan': 600, // 10分钟  
      'mindfulness': 180, // 3分钟
      'relaxation': 480 // 8分钟
    };
    
    const guides = {
      'breathing': '请舒适地坐好，轻轻闭上眼睛，将注意力集中在呼吸上...',
      'body-scan': '让我们从头部开始，慢慢扫描身体的每一个部位...',
      'mindfulness': '保持觉察，观察当下的想法和感受，不做任何判断...',
      'relaxation': '从脚趾开始，逐步放松身体的每一块肌肉...'
    };
    
    this.meditationDuration = durations[type];
    this.meditationElapsed = 0;
    
    // 更新UI
    document.getElementById('currentMeditationType').textContent = type === 'breathing' ? '呼吸冥想' : 
      type === 'body-scan' ? '身体扫描' : 
      type === 'mindfulness' ? '正念观察' : '渐进放松';
    
    document.getElementById('totalTime').textContent = this.formatMeditationTime(this.meditationDuration);
    document.getElementById('meditationGuide').innerHTML = `<p>${guides[type]}</p>`;
    
    // 显示播放器
    document.querySelector('.meditation-options').style.display = 'none';
    document.getElementById('meditationPlayer').style.display = 'block';
    
    this.updateMeditationProgress();
  }

  toggleMeditationPlayPause() {
    const playPauseBtn = document.getElementById('playPauseBtn');
    
    if (this.isPlaying) {
      // 暂停
      clearInterval(this.meditationTimer);
      this.isPlaying = false;
      playPauseBtn.textContent = '▶️';
    } else {
      // 播放
      this.meditationTimer = setInterval(() => {
        this.meditationElapsed++;
        this.updateMeditationProgress();
        
        if (this.meditationElapsed >= this.meditationDuration) {
          this.stopMeditation();
        }
      }, 1000);
      
      this.isPlaying = true;
      playPauseBtn.textContent = '⏸️';
    }
  }

  resetMeditation() {
    this.stopMeditation();
    this.meditationElapsed = 0;
    this.updateMeditationProgress();
    document.getElementById('playPauseBtn').textContent = '▶️';
  }

  stopMeditation() {
    clearInterval(this.meditationTimer);
    this.isPlaying = false;
    document.getElementById('playPauseBtn').textContent = '▶️';
  }

  updateMeditationProgress() {
    const progress = this.meditationElapsed / this.meditationDuration;
    const circumference = 2 * Math.PI * 54; // r=54
    const strokeDashoffset = circumference - (progress * circumference);
    
    document.querySelector('.progress-ring-circle').style.strokeDashoffset = strokeDashoffset;
    document.getElementById('currentTime').textContent = this.formatMeditationTime(this.meditationElapsed);
  }

  formatMeditationTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  setupCheckoutOptions() {
    const durationBtns = document.querySelectorAll('.duration-btn');
    
    durationBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.selectedDuration = parseInt(e.target.dataset.minutes);
        durationBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
      });
    });
  }

  showCheckoutModal() {
    // 更新核销信息
    document.getElementById('checkoutClientName').textContent = 
      document.getElementById('clientName').textContent;
    document.getElementById('checkoutStartTime').textContent = 
      document.getElementById('consultationTime').textContent.split(' ')[0] + ' ' + 
      document.getElementById('consultationTime').textContent.split(' ')[1].split('-')[0];
    document.getElementById('checkoutDuration').textContent = 
      this.sessionTimer.textContent;
    
    this.checkoutModal?.classList.add('show');
  }

  processCheckout() {
    const remark = document.getElementById('checkoutRemark').value;
    
    const checkoutData = {
      clientName: document.getElementById('checkoutClientName').textContent,
      consultationTime: document.getElementById('checkoutStartTime').textContent,
      actualDuration: document.getElementById('checkoutDuration').textContent,
      billedDuration: this.selectedDuration,
      remark: remark,
      timestamp: new Date().toISOString(),
      canvasData: this.notebookCanvas.toDataURL(),
      transcriptMessages: this.transcriptMessages
    };
    
    // 保存数据
    this.saveNotes();
    this.saveCheckoutData(checkoutData);
    
    this.checkoutModal?.classList.remove('show');
    
    // 跳转回主页或记录页面
    setTimeout(() => {
      window.location.href = 'consultation-record.html?client=' + 
        encodeURIComponent(checkoutData.clientName);
    }, 500);
  }

  saveCheckoutData(data) {
    const checkouts = JSON.parse(localStorage.getItem('consultationCheckouts') || '[]');
    checkouts.push(data);
    localStorage.setItem('consultationCheckouts', JSON.stringify(checkouts));
    console.log('核销数据已保存', data);
  }

  // 初始化拖拽功能
  initializeDragAndDrop() {
    if (!this.aiAssistantPopup) return;
    
    // 绑定拖拽到popup-header和section-header
    this.popupHeader = document.getElementById('popupHeader');
    this.sectionHeader = document.querySelector('.section-header');
    
    if (this.popupHeader) {
      this.popupHeader.addEventListener('mousedown', (e) => this.startDrag(e));
      this.popupHeader.addEventListener('touchstart', (e) => this.startDrag(e.touches[0]), { passive: false });
    }
    
    if (this.sectionHeader) {
      this.sectionHeader.addEventListener('mousedown', (e) => this.startDrag(e));
      this.sectionHeader.addEventListener('touchstart', (e) => this.startDrag(e.touches[0]), { passive: false });
    }
    
    document.addEventListener('mousemove', (e) => this.drag(e));
    document.addEventListener('mouseup', () => this.stopDrag());
    document.addEventListener('touchmove', (e) => this.drag(e.touches[0]), { passive: false });
    document.addEventListener('touchend', () => this.stopDrag());
  }

  startDrag(e) {
    // 检查是否点击在展开按钮上，如果是则不触发拖拽
    if (e.target.closest('.expand-btn')) return;
    
    // 检查是否点击在可拖拽区域
    const isCollapsed = this.aiAssistantPopup?.classList.contains('collapsed');
    const clickedElement = e.target.closest('.popup-header, .section-header');
    
    if (!clickedElement) return;
    if (isCollapsed && !clickedElement.classList.contains('section-header')) return;
    if (!isCollapsed && !clickedElement.classList.contains('popup-header')) return;
    
    this.isDragging = true;
    this.aiAssistantPopup.classList.add('dragging');
    
    const rect = this.aiAssistantPopup.getBoundingClientRect();
    this.dragOffset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    
    e.preventDefault();
  }

  drag(e) {
    if (!this.isDragging) return;
    
    const x = e.clientX - this.dragOffset.x;
    const y = e.clientY - this.dragOffset.y;
    
    // 限制拖拽范围
    const maxX = window.innerWidth - this.aiAssistantPopup.offsetWidth;
    const maxY = window.innerHeight - this.aiAssistantPopup.offsetHeight;
    
    const constrainedX = Math.max(0, Math.min(x, maxX));
    const constrainedY = Math.max(0, Math.min(y, maxY));
    
    this.aiAssistantPopup.style.left = constrainedX + 'px';
    this.aiAssistantPopup.style.top = constrainedY + 'px';
    this.aiAssistantPopup.style.transform = 'none';
    
    e.preventDefault();
  }

  stopDrag() {
    if (this.isDragging) {
      this.isDragging = false;
      this.aiAssistantPopup.classList.remove('dragging');
    }
  }

  // 计时器功能
  startTimer() {
    this.startTime = Date.now();
    this.timerInterval = setInterval(() => {
      const elapsed = Date.now() - this.startTime;
      this.sessionTimer.textContent = this.formatTime(elapsed);
    }, 1000);
  }

  formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  // 加载咨询信息
  loadConsultationInfo() {
    const urlParams = new URLSearchParams(window.location.search);
    const clientName = urlParams.get('client') || '李小雅';
    const sessionCount = urlParams.get('session') || '3';
    const appointmentTime = urlParams.get('time') || '2024年1月18日 14:00-15:00';
    
    document.getElementById('clientName').textContent = clientName;
    document.getElementById('sessionCount').textContent = `第 ${sessionCount} 次咨询`;
    document.getElementById('consultationTime').textContent = appointmentTime;
  }

  // 保存笔记
  saveNotes() {
    const notesData = {
      timestamp: new Date().toISOString(),
      clientName: document.getElementById('clientName').textContent,
      sessionCount: document.getElementById('sessionCount').textContent,
      consultationTime: document.getElementById('consultationTime').textContent,
      duration: this.sessionTimer.textContent,
      canvasData: this.notebookCanvas.toDataURL(),
      transcriptMessages: this.transcriptMessages
    };
    
    const savedNotes = JSON.parse(localStorage.getItem('consultationNotes') || '[]');
    savedNotes.push(notesData);
    localStorage.setItem('consultationNotes', JSON.stringify(savedNotes));
    
    console.log('笔记已保存', notesData);
  }

  // 键盘快捷键
  handleKeyboardShortcuts(e) {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 's':
          e.preventDefault();
          this.saveNotes();
          break;
        case 'z':
          e.preventDefault();
          this.undo();
          break;
        case 'y':
          e.preventDefault();
          this.redo();
          break;
      }
    }
    
    // ESC键关闭模态窗口
    if (e.key === 'Escape') {
      this.closeAiAssistant();
      [this.pureCanvasModal, this.meditationModal, this.checkoutModal].forEach(modal => {
        modal?.classList.remove('show');
      });
    }
  }

  closePureCanvas() {
    if (this.hasCanvasContent) {
      if (confirm('画板中有绘画内容，关闭将会清空所有内容，是否要继续？')) {
        this.clearPureCanvas();
        this.pureCanvasModal?.classList.remove('show');
        
        // 显示底部工具栏
        const bottomToolbar = document.getElementById('bottomToolbar');
        if (bottomToolbar) {
          bottomToolbar.style.display = 'block';
        }
      }
    } else {
      this.pureCanvasModal?.classList.remove('show');
      // 显示底部工具栏
      const bottomToolbar = document.getElementById('bottomToolbar');
      if (bottomToolbar) {
        bottomToolbar.style.display = 'block';
      }
    }
  }

  savePureCanvas() {
    if (!this.hasCanvasContent) {
      alert('画板中没有内容可以保存');
      return;
    }
    
    // 获取画板内容
    const canvasData = this.pureCanvas.toDataURL('image/png');
    
    // 创建缩略图容器
    const thumbnailContainer = document.createElement('div');
    thumbnailContainer.className = 'canvas-thumbnail-container';
    thumbnailContainer.style.cssText = `
      display: inline-block;
      margin: 10px;
      padding: 8px;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      background: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
    `;
    
    // 创建缩略图
    const thumbnail = document.createElement('img');
    thumbnail.src = canvasData;
    thumbnail.style.cssText = `
      width: 120px;
      height: 80px;
      object-fit: contain;
      border-radius: 4px;
      display: block;
    `;
    
    // 创建标签
    const label = document.createElement('div');
    label.textContent = '画板内容';
    label.style.cssText = `
      text-align: center;
      font-size: 12px;
      color: #64748b;
      margin-top: 4px;
      font-weight: 500;
    `;
    
    // 创建时间戳
    const timestamp = document.createElement('div');
    timestamp.textContent = new Date().toLocaleTimeString('zh-CN', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    timestamp.style.cssText = `
      text-align: center;
      font-size: 10px;
      color: #94a3b8;
      margin-top: 2px;
    `;
    
    // 组装缩略图容器
    thumbnailContainer.appendChild(thumbnail);
    thumbnailContainer.appendChild(label);
    thumbnailContainer.appendChild(timestamp);
    
    // 添加悬停效果
    thumbnailContainer.addEventListener('mouseenter', () => {
      thumbnailContainer.style.transform = 'translateY(-2px)';
      thumbnailContainer.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)';
      thumbnailContainer.style.borderColor = '#3b82f6';
    });
    
    thumbnailContainer.addEventListener('mouseleave', () => {
      thumbnailContainer.style.transform = 'translateY(0)';
      thumbnailContainer.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
      thumbnailContainer.style.borderColor = '#e2e8f0';
    });
    
    // 添加点击放大功能
    thumbnailContainer.addEventListener('click', () => {
      this.showImageModal(canvasData);
    });
    
    // 将缩略图添加到笔记本画布上方的容器中
    let thumbnailsContainer = document.querySelector('.thumbnails-container');
    if (!thumbnailsContainer) {
      thumbnailsContainer = document.createElement('div');
      thumbnailsContainer.className = 'thumbnails-container';
      thumbnailsContainer.style.cssText = `
        padding: 16px;
        background: #f8fafc;
        border-bottom: 1px solid #e2e8f0;
        min-height: 60px;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
      `;
      
      // 添加标题
      const title = document.createElement('div');
      title.textContent = '画板记录：';
      title.style.cssText = `
        font-size: 14px;
        font-weight: 600;
        color: #374151;
        margin-right: 12px;
        flex-shrink: 0;
      `;
      thumbnailsContainer.appendChild(title);
      
      // 插入到笔记本纸张前面
      const notebookPaper = document.querySelector('.notebook-paper');
      notebookPaper.parentNode.insertBefore(thumbnailsContainer, notebookPaper);
    }
    
    thumbnailsContainer.appendChild(thumbnailContainer);
    
    alert('画板内容已保存为缩略图');
    
    // 清空画板并关闭
    this.clearPureCanvas();
    this.pureCanvasModal?.classList.remove('show');
    
    // 显示底部工具栏
    const bottomToolbar = document.getElementById('bottomToolbar');
    if (bottomToolbar) {
      bottomToolbar.style.display = 'block';
    }
  }

  // 显示图片放大模态窗口
  showImageModal(imageSrc) {
    // 创建模态窗口
    const modal = document.createElement('div');
    modal.className = 'image-modal-overlay';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(8px);
      z-index: 3000;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
    
    // 创建图片容器
    const imageContainer = document.createElement('div');
    imageContainer.style.cssText = `
      max-width: 90vw;
      max-height: 90vh;
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      position: relative;
      transform: scale(0.9);
      transition: transform 0.3s ease;
    `;
    
    // 创建关闭按钮
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = `
      position: absolute;
      top: 10px;
      right: 15px;
      background: none;
      border: none;
      font-size: 24px;
      color: #64748b;
      cursor: pointer;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.2s ease;
    `;
    
    closeBtn.addEventListener('mouseenter', () => {
      closeBtn.style.background = '#f1f5f9';
      closeBtn.style.color = '#1e293b';
    });
    
    closeBtn.addEventListener('mouseleave', () => {
      closeBtn.style.background = 'none';
      closeBtn.style.color = '#64748b';
    });
    
    // 创建放大的图片
    const enlargedImage = document.createElement('img');
    enlargedImage.src = imageSrc;
    enlargedImage.style.cssText = `
      max-width: 100%;
      max-height: 80vh;
      object-fit: contain;
      border-radius: 8px;
      display: block;
    `;
    
    // 创建标题
    const title = document.createElement('h3');
    title.textContent = '画板内容';
    title.style.cssText = `
      margin: 0 0 16px 0;
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
      text-align: center;
    `;
    
    // 组装模态窗口
    imageContainer.appendChild(closeBtn);
    imageContainer.appendChild(title);
    imageContainer.appendChild(enlargedImage);
    modal.appendChild(imageContainer);
    
    // 关闭功能
    const closeModal = () => {
      modal.style.opacity = '0';
      imageContainer.style.transform = 'scale(0.9)';
      setTimeout(() => {
        document.body.removeChild(modal);
      }, 300);
    };
    
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
    
    // 键盘ESC关闭
    const handleKeydown = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', handleKeydown);
      }
    };
    document.addEventListener('keydown', handleKeydown);
    
    // 显示模态窗口
    document.body.appendChild(modal);
    
    // 动画效果
    setTimeout(() => {
      modal.style.opacity = '1';
      imageContainer.style.transform = 'scale(1)';
    }, 10);
  }

  clearPureCanvas() {
    this.pureCtx?.clearRect(0, 0, this.pureCanvas.width, this.pureCanvas.height);
    this.hasCanvasContent = false;
  }

  handleTextSelection(e) {
    // 延迟执行，确保选择已经完成
    setTimeout(() => {
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();
      
      // 如果没有选中文本，不处理
      if (selectedText.length === 0) {
        return;
      }
      
      console.log('检测到文本选择:', selectedText);
      
      // 检查选中的文本是否在当前消息内
      const message = e.currentTarget;
      
      try {
        const range = selection.getRangeAt(0);
        
        // 检查选择范围是否在消息内容区域
        const messageContent = message.querySelector('.message-content');
        if (!messageContent) {
          console.log('未找到消息内容区域');
          return;
        }
        
        // 检查选择是否在消息内容内
        if (!messageContent.contains(range.commonAncestorContainer) && 
            range.commonAncestorContainer !== messageContent) {
          console.log('选中的文本不在消息内容内');
          return;
        }
        
        // 防止选中跨越多个消息
        const startMessage = range.startContainer.closest('.transcript-message');
        const endMessage = range.endContainer.closest('.transcript-message');
        
        if (startMessage !== endMessage || startMessage !== message) {
          console.log('选择跨越了多个消息');
          return;
        }
        
        console.log('创建部分标记');
        // 创建部分标记
        this.createPartialMark(message, range, selectedText);
        
      } catch (error) {
        console.error('处理文本选择时出错:', error);
      }
    }, 100); // 延迟100ms执行
  }

  // 长按开始处理
  handleLongPressStart(e) {
    if (!this.isMarkingMode) return;
    
    console.log('长按开始');
    
    // 记录长按开始位置
    this.longPressStartPos = {
      x: e.clientX,
      y: e.clientY,
      target: e.target
    };
    
    this.isLongPressing = false;
    
    // 设置长按计时器
    this.longPressTimer = setTimeout(() => {
      console.log('长按触发');
      this.isLongPressing = true;
      this.startAutoSelection(e);
    }, this.longPressThreshold);
    
    // 注意：由于使用passive事件监听器，我们不能阻止默认行为
    // 这样可以保持滚动功能正常工作
  }

  // 长按移动处理
  handleLongPressMove(e) {
    if (!this.longPressTimer) return;
    
    // 如果移动距离太大，取消长按
    const moveDistance = Math.sqrt(
      Math.pow(e.clientX - this.longPressStartPos.x, 2) + 
      Math.pow(e.clientY - this.longPressStartPos.y, 2)
    );
    
    if (moveDistance > 10) { // 移动超过10px取消长按
      this.handleLongPressCancel();
    }
  }

  // 长按结束处理
  handleLongPressEnd(e) {
    if (this.isLongPressing) {
      console.log('长按结束，完成自动选择');
      this.completeAutoSelection(e);
    }
    
    this.handleLongPressCancel();
  }

  // 取消长按
  handleLongPressCancel() {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
    this.isLongPressing = false;
    this.longPressStartPos = null;
  }

  // 开始自动选择
  startAutoSelection(e) {
    console.log('开始自动选择文本');
    
    // 找到点击位置的文本节点和字符位置
    const range = document.caretRangeFromPoint(e.clientX, e.clientY);
    if (!range) return;
    
    const textNode = range.startContainer;
    if (textNode.nodeType !== Node.TEXT_NODE) return;
    
    const text = textNode.textContent;
    const clickOffset = range.startOffset;
    
    // 智能选择：找到单词或句子边界
    const selectedRange = this.findSelectionBoundaries(text, clickOffset);
    
    if (selectedRange) {
      // 创建新的选择范围
      const newRange = document.createRange();
      newRange.setStart(textNode, selectedRange.start);
      newRange.setEnd(textNode, selectedRange.end);
      
      // 应用选择
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(newRange);
      
      // 添加视觉反馈
      this.addLongPressVisualFeedback(e.target.closest('.transcript-message'));
      
      console.log('自动选择完成:', text.substring(selectedRange.start, selectedRange.end));
    }
  }

  // 完成自动选择
  completeAutoSelection(e) {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    if (selectedText.length > 0) {
      const message = e.target.closest('.transcript-message');
      if (message) {
        try {
          const range = selection.getRangeAt(0);
          console.log('长按自动创建标记:', selectedText);
          this.createPartialMark(message, range, selectedText);
        } catch (error) {
          console.error('长按创建标记失败:', error);
        }
      }
    }
    
    // 移除视觉反馈
    this.removeLongPressVisualFeedback();
  }

  // 智能查找选择边界
  findSelectionBoundaries(text, offset) {
    // 中文标点符号
    const chinesePunctuation = /[，。！？；：""''（）【】《》]/;
    // 英文单词边界
    const wordBoundary = /[\s\.,!?;:()[\]{}"""'']/;
    
    let start = offset;
    let end = offset;
    
    // 向前查找边界
    while (start > 0) {
      const char = text[start - 1];
      if (chinesePunctuation.test(char) || wordBoundary.test(char)) {
        break;
      }
      start--;
    }
    
    // 向后查找边界
    while (end < text.length) {
      const char = text[end];
      if (chinesePunctuation.test(char) || wordBoundary.test(char)) {
        break;
      }
      end++;
    }
    
    // 确保选择了有意义的内容
    if (end - start < 2) {
      // 如果选择太短，尝试扩展到句子
      return this.findSentenceBoundaries(text, offset);
    }
    
    return { start, end };
  }

  // 查找句子边界
  findSentenceBoundaries(text, offset) {
    const sentenceEnd = /[。！？]/;
    
    let start = 0;
    let end = text.length;
    
    // 向前查找句子开始
    for (let i = offset - 1; i >= 0; i--) {
      if (sentenceEnd.test(text[i])) {
        start = i + 1;
        break;
      }
    }
    
    // 向后查找句子结束
    for (let i = offset; i < text.length; i++) {
      if (sentenceEnd.test(text[i])) {
        end = i + 1;
        break;
      }
    }
    
    // 去除前后空白
    while (start < end && /\s/.test(text[start])) start++;
    while (end > start && /\s/.test(text[end - 1])) end--;
    
    return start < end ? { start, end } : null;
  }

  // 添加长按视觉反馈
  addLongPressVisualFeedback(messageElement) {
    if (messageElement) {
      messageElement.style.backgroundColor = '#fef3c7';
      messageElement.style.transform = 'scale(1.02)';
      messageElement.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
      messageElement.style.transition = 'all 0.2s ease';
    }
  }

  // 移除长按视觉反馈
  removeLongPressVisualFeedback() {
    const messages = this.transcriptStream.querySelectorAll('.transcript-message');
    messages.forEach(message => {
      if (!message.classList.contains('marked') && !message.querySelector('.partial-mark')) {
        message.style.backgroundColor = '';
        message.style.transform = '';
        message.style.boxShadow = '';
      }
    });
  }

  createPartialMark(messageElement, range, selectedText) {
    console.log('开始创建部分标记:', selectedText);
    
    // 检查是否已经有部分标记
    const existingMark = messageElement.querySelector('.partial-mark');
    if (existingMark) {
      // 直接替换已有标记，不需要确认
      this.removePartialMark(messageElement);
      this.showToast('已替换为新的选中内容', 'info');
    }
    
    // 创建标记元素
    const markElement = document.createElement('span');
    markElement.className = 'partial-mark';
    markElement.style.cssText = `
      background-color: #fef3c7 !important;
      border: 2px solid #f59e0b !important;
      border-radius: 4px !important;
      padding: 2px 4px !important;
      margin: 0 2px !important;
      position: relative !important;
      display: inline !important;
    `;
    
    // 包装选中的文本
    try {
      // 克隆范围以避免修改原始选择
      const clonedRange = range.cloneRange();
      
      // 尝试直接包装内容
      if (clonedRange.startContainer === clonedRange.endContainer && 
          clonedRange.startContainer.nodeType === Node.TEXT_NODE) {
        // 简单情况：选择在单个文本节点内
        const textNode = clonedRange.startContainer;
        const startOffset = clonedRange.startOffset;
        const endOffset = clonedRange.endOffset;
        
        // 分割文本节点
        const beforeText = textNode.textContent.substring(0, startOffset);
        const selectedTextContent = textNode.textContent.substring(startOffset, endOffset);
        const afterText = textNode.textContent.substring(endOffset);
        
        // 创建新的文本节点
        const beforeNode = document.createTextNode(beforeText);
        const afterNode = document.createTextNode(afterText);
        
        // 设置标记元素的内容
        markElement.textContent = selectedTextContent;
        
        // 替换原始文本节点
        const parent = textNode.parentNode;
        parent.insertBefore(beforeNode, textNode);
        parent.insertBefore(markElement, textNode);
        parent.insertBefore(afterNode, textNode);
        parent.removeChild(textNode);
        
        console.log('成功创建部分标记 - 简单情况');
      } else {
        // 复杂情况：选择跨越多个节点
        try {
          clonedRange.surroundContents(markElement);
          console.log('成功创建部分标记 - 使用surroundContents');
        } catch (e) {
          console.log('surroundContents失败，使用替代方法');
          // 如果无法直接包装，使用替代方法
          const contents = clonedRange.extractContents();
          markElement.appendChild(contents);
          clonedRange.insertNode(markElement);
          console.log('成功创建部分标记 - 使用extractContents');
        }
      }
      
      // 清除选择
      window.getSelection().removeAllRanges();
      
    } catch (error) {
      console.error('创建部分标记时出错:', error);
      // 如果所有方法都失败，至少创建一个标记提示
      const messageContent = messageElement.querySelector('.message-content');
      if (messageContent) {
        markElement.textContent = selectedText;
        messageContent.appendChild(document.createElement('br'));
        messageContent.appendChild(markElement);
        console.log('使用备用方法创建部分标记');
      }
    }
    
    // 添加标记数据
    const messageData = {
      element: messageElement,
      speaker: messageElement.querySelector('.message-speaker').textContent,
      content: selectedText, // 只保存选中的文本
      fullContent: messageElement.querySelector('.message-content').textContent, // 保存完整内容用于参考
      time: messageElement.querySelector('.message-time').textContent,
      emotionTags: [],
      textTags: [],
      isPartial: true,
      markElement: markElement
    };
    
    // 创建标签容器
    this.addTagsToPartialMark(messageElement, markElement, messageData);
    
    // 添加到标记列表
    this.markedMessages.push(messageData);
    
    // 显示添加到笔记按钮
    if (this.markedMessages.length > 0) {
      this.addToNotesBtn.style.display = 'inline-flex';
    }
    
    console.log('部分标记创建完成');
  }

  addTagsToPartialMark(messageElement, markElement, messageData) {
    // 检查是否已经有标签容器
    let tagsContainer = messageElement.querySelector('.message-tags');
    if (!tagsContainer) {
      tagsContainer = document.createElement('div');
      tagsContainer.className = 'message-tags';
      tagsContainer.style.cssText = `
        margin-top: 8px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 8px;
        background: #f8fafc;
        border-radius: 6px;
        border: 1px solid #e2e8f0;
      `;
      messageElement.appendChild(tagsContainer);
    }
    
    // 添加部分标记提示
    const partialLabel = document.createElement('div');
    partialLabel.className = 'partial-mark-label';
    partialLabel.style.cssText = `
      font-size: 11px;
      color: #f59e0b;
      font-weight: 600;
      margin-bottom: 4px;
    `;
    partialLabel.textContent = `已标记: "${messageData.content.length > 30 ? messageData.content.substring(0, 30) + '...' : messageData.content}"`;
    tagsContainer.appendChild(partialLabel);
    
    // 表情标签行
    const emotionTags = document.createElement('div');
    emotionTags.className = 'emotion-tags';
    emotionTags.style.cssText = `
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    `;
    
    const emotions = ['😊', '😢', '😠', '😰', '😴', '🤔', '😮', '😌'];
    emotions.forEach(emotion => {
      const tag = document.createElement('button');
      tag.textContent = emotion;
      tag.className = 'emotion-tag';
      tag.style.cssText = `
        padding: 4px 8px;
        border: 1px solid #e2e8f0;
        background: white;
        border-radius: 16px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s ease;
      `;
      
      tag.addEventListener('click', (e) => {
        e.stopPropagation();
        tag.classList.toggle('selected');
        if (tag.classList.contains('selected')) {
          tag.style.background = '#3b82f6';
          tag.style.color = 'white';
          tag.style.borderColor = '#3b82f6';
        } else {
          tag.style.background = 'white';
          tag.style.color = '';
          tag.style.borderColor = '#e2e8f0';
        }
      });
      
      emotionTags.appendChild(tag);
    });
    
    // 文字标签行
    const textTags = document.createElement('div');
    textTags.className = 'text-tags';
    textTags.style.cssText = `
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    `;
    
    const textLabels = ['重要', '关键', '转折', '阻抗', '突破', '情绪', '认知', '行为'];
    textLabels.forEach(label => {
      const tag = document.createElement('button');
      tag.textContent = label;
      tag.className = 'text-tag';
      tag.style.cssText = `
        padding: 4px 12px;
        border: 1px solid #e2e8f0;
        background: white;
        border-radius: 16px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        transition: all 0.2s ease;
      `;
      
      tag.addEventListener('click', (e) => {
        e.stopPropagation();
        tag.classList.toggle('selected');
        if (tag.classList.contains('selected')) {
          tag.style.background = '#10b981';
          tag.style.color = 'white';
          tag.style.borderColor = '#10b981';
        } else {
          tag.style.background = 'white';
          tag.style.color = '';
          tag.style.borderColor = '#e2e8f0';
        }
      });
      
      textTags.appendChild(tag);
    });
    
    // 添加删除按钮
    const removeBtn = document.createElement('button');
    removeBtn.textContent = '移除标记';
    removeBtn.className = 'remove-mark-btn';
    removeBtn.style.cssText = `
      padding: 4px 8px;
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 11px;
      margin-top: 4px;
      align-self: flex-start;
    `;
    
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.removePartialMark(messageElement);
    });
    
    tagsContainer.appendChild(emotionTags);
    tagsContainer.appendChild(textTags);
    tagsContainer.appendChild(removeBtn);
  }

  removePartialMark(messageElement) {
    // 移除部分标记元素
    const partialMark = messageElement.querySelector('.partial-mark');
    if (partialMark) {
      // 恢复原始文本
      const parent = partialMark.parentNode;
      while (partialMark.firstChild) {
        parent.insertBefore(partialMark.firstChild, partialMark);
      }
      parent.removeChild(partialMark);
    }
    
    // 移除标签容器
    const tagsContainer = messageElement.querySelector('.message-tags');
    if (tagsContainer) {
      tagsContainer.remove();
    }
    
    // 从标记列表中移除
    this.markedMessages = this.markedMessages.filter(msg => msg.element !== messageElement);
    
    // 如果没有标记的消息了，隐藏添加到笔记按钮
    if (this.markedMessages.length === 0) {
      this.addToNotesBtn.style.display = 'none';
    }
  }

  setupTranscriptScrollEvents() {
    if (!this.transcriptContent) return;
    
    // 监听滚动事件 - 在所有模式下都应该工作
    this.transcriptContent.addEventListener('scroll', () => {
      this.handleTranscriptScroll();
    });
    
    // 监听触摸和鼠标事件来检测用户交互 - 使用passive来提高性能
    this.transcriptContent.addEventListener('touchstart', () => {
      this.setUserScrolling(true);
    }, { passive: true });
    
    // 鼠标按下时设置用户滚动状态，但不阻止默认行为
    this.transcriptContent.addEventListener('mousedown', (e) => {
      // 只有在滚动条区域或空白区域才设置滚动状态
      // 避免在消息内容上点击时误触发
      const isClickOnScrollbar = e.offsetX > this.transcriptContent.clientWidth;
      const isClickOnMessage = e.target.closest('.transcript-message');
      
      if (isClickOnScrollbar || (!isClickOnMessage && !this.isMarkingMode)) {
        this.setUserScrolling(true);
      }
    });
    
    // 鼠标滚轮滚动时设置用户滚动状态
    this.transcriptContent.addEventListener('wheel', () => {
      this.setUserScrolling(true);
    }, { passive: true });
  }

  handleTranscriptScroll() {
    if (!this.transcriptContent) return;
    
    const { scrollTop, scrollHeight, clientHeight } = this.transcriptContent;
    const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 5;
    
    // 如果用户滚动到底部，重新启用自动滚动（仅在非标记模式下）
    if (isAtBottom && this.isUserScrolling && !this.isMarkingMode) {
      this.setUserScrolling(false);
      console.log('用户滚动到底部 - 重新启用自动滚动');
    }
  }

  setUserScrolling(isScrolling) {
    this.isUserScrolling = isScrolling;
    
    if (isScrolling) {
      // 清除之前的定时器
      if (this.userScrollTimeout) {
        clearTimeout(this.userScrollTimeout);
      }
      
      // 根据当前模式更新滚动指示器
      if (this.isMarkingMode) {
        this.updateScrollIndicator('user-scrolling', '标记模式');
      } else {
        this.updateScrollIndicator('user-scrolling', '手动滚动');
      }
      
      // 设置定时器，如果用户停止滚动3秒后自动恢复自动滚动（仅在非标记模式下）
      this.userScrollTimeout = setTimeout(() => {
        const { scrollTop, scrollHeight, clientHeight } = this.transcriptContent;
        const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 5;
        
        if (isAtBottom && !this.isMarkingMode) {
          this.isUserScrolling = false;
          this.updateScrollIndicator('auto-scrolling', '自动跟随');
          console.log('用户停止滚动且在底部 - 恢复自动滚动');
        }
      }, 3000);
      
      console.log('检测到用户滚动 - 暂停自动滚动');
    } else {
      // 恢复自动滚动（仅在非标记模式下）
      if (!this.isMarkingMode) {
        this.updateScrollIndicator('auto-scrolling', '自动跟随');
      }
    }
  }

  updateScrollIndicator(type, text) {
    if (!this.scrollIndicator) return;
    
    // 移除所有状态类
    this.scrollIndicator.classList.remove('user-scrolling', 'auto-scrolling');
    
    // 添加新的状态类
    this.scrollIndicator.classList.add(type);
    this.scrollIndicator.textContent = text;
    
    // 显示指示器
    this.scrollIndicator.classList.add('show');
    
    // 3秒后隐藏指示器（如果是自动跟随状态）
    if (type === 'auto-scrolling') {
      setTimeout(() => {
        if (this.scrollIndicator.classList.contains('auto-scrolling')) {
          this.scrollIndicator.classList.remove('show');
        }
      }, 3000);
    }
  }

  typeMessage(element, text, callback, customSpeed = null) {
    let index = 0;
    const typingSpeed = customSpeed || 50; // 默认每个字符50ms，可自定义
    
    const typeChar = () => {
      if (index < text.length) {
        element.textContent += text[index];
        index++;
        
        // 自动滚动条件：不在标记模式 且 用户没有手动滚动
        if (this.transcriptContent && !this.isMarkingMode && !this.isUserScrolling) {
          this.transcriptContent.scrollTop = this.transcriptContent.scrollHeight;
          console.log('自动滚动执行 - 字符:', text[index-1], '滚动位置:', this.transcriptContent.scrollTop, '总高度:', this.transcriptContent.scrollHeight);
        }
        
        setTimeout(typeChar, typingSpeed);
      } else {
        // 打字完成，最后一次滚动
        if (this.transcriptContent && !this.isMarkingMode && !this.isUserScrolling) {
          this.transcriptContent.scrollTop = this.transcriptContent.scrollHeight;
          console.log('打字完成 - 最终滚动执行，滚动位置:', this.transcriptContent.scrollTop);
        }
        
        // 打字完成
        if (callback) callback();
      }
    };
    
    typeChar();
  }

  addTranscriptMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.className = 'transcript-message';
    
    const time = this.formatCurrentTime();
    messageElement.innerHTML = `
      <div class="message-speaker">${message.speaker}</div>
      <div class="message-content">${message.content}</div>
      <div class="message-time">[${time}]</div>
    `;
    
    this.transcriptStream?.appendChild(messageElement);
    
    // 如果在标记模式下，为新消息添加点击事件
    if (this.isMarkingMode) {
      this.addClickEventToMessage(messageElement);
    }
    
    // 自动滚动到底部（除非在标记模式下或用户正在滚动）
    if (this.transcriptContent && !this.isMarkingMode && !this.isUserScrolling) {
      this.transcriptContent.scrollTop = this.transcriptContent.scrollHeight;
    }
  }

  // 显示Toast提示
  showToast(message, type = 'info') {
    // 移除现有的toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
      existingToast.remove();
    }

    // 创建toast元素
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    // 设置样式
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${this.getToastColor(type)};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      z-index: 10000;
      opacity: 0;
      transform: translateX(100%);
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      max-width: 300px;
      word-wrap: break-word;
    `;

    // 添加到页面
    document.body.appendChild(toast);

    // 显示动画
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(0)';
    });

    // 自动移除
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }

  // 获取Toast颜色
  getToastColor(type) {
    const colors = {
      'success': '#10b981',
      'warning': '#f59e0b',
      'error': '#ef4444',
      'info': '#3b82f6'
    };
    return colors[type] || colors.info;
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  new ConsultationNotesNew();
}); 