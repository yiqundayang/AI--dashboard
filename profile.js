/**
 * 客户档案页面逻辑
 */

class CustomerProfile {
  constructor() {
    // 当前选中的客户
    this.currentCustomer = null;
    
    // 客户数据
    this.customers = new Map();
    this.filteredCustomers = [];
    
    // DOM元素缓存
    this.elements = {};
    
    // 状态管理
    this.hasUnsavedChanges = false;
    
    this.init();
  }
  
  /**
   * 初始化
   */
  init() {
    this.cacheElements();
    this.initMockData();
    this.bindEvents();
    this.renderCustomerList();
    this.checkURLParams();
    this.restoreSidebarState(); // 恢复侧边栏状态
    this.restoreAISummaryState(); // 恢复AI总结状态
    
    console.log('客户档案页面已初始化');
  }
  
  /**
   * 缓存DOM元素
   */
  cacheElements() {
    this.elements = {
      // 客户列表相关
      customerSearch: document.getElementById('customerSearch'),
      customerList: document.getElementById('customerList'),
      
      // 侧边栏相关
      sidebarToggle: document.getElementById('sidebarToggle'),
      profileLayout: document.getElementById('profileLayout'),
      customerSidebar: document.getElementById('customerSidebar'),
      profileMain: document.getElementById('profileMain'),
      
      // 档案内容相关
      profileEmpty: document.getElementById('profileEmpty'),
      profileContent: document.getElementById('profileContent'),
      
      // 用户信息
      userAvatar: document.getElementById('userAvatar'),
      userName: document.getElementById('userName'),
      userPhone: document.getElementById('userPhone'),
      
      // 下次咨询提醒
      nextConsultationCard: document.getElementById('nextConsultationCard'),
      countdownText: document.getElementById('countdownText'),
      nextConsultationType: document.getElementById('nextConsultationType'),
      nextConsultationBtn: document.getElementById('nextConsultationBtn'),
      
      // AI总结
      aiSummaryToggle: document.getElementById('aiSummaryToggle'),
      aiSummaryContent: document.getElementById('aiSummaryContent'),
      
      // AI总结信息
      riskTags: document.getElementById('riskTags'),
      historyList: document.getElementById('historyList'),
      riskInfoBtn: document.getElementById('riskInfoBtn'),
      historyInfoBtn: document.getElementById('historyInfoBtn'),
      
      // Tab导航
      tabBtns: document.querySelectorAll('.tab-btn'),
      tabPanes: document.querySelectorAll('.tab-pane'),
      
      // 表单元素
      profileForm: document.getElementById('profileForm'),
      resetBtn: document.getElementById('resetBtn'),
      
      // 文件上传
      uploadBtn: document.getElementById('uploadBtn'),
      fileInput: document.getElementById('fileInput'),
      uploadedImages: document.getElementById('uploadedImages'),
      
      // 模态框
      riskInfoModal: document.getElementById('riskInfoModal'),
      historyInfoModal: document.getElementById('historyInfoModal'),
      riskInfoClose: document.getElementById('riskInfoClose'),
      historyInfoClose: document.getElementById('historyInfoClose')
    };
  }
  
  /**
   * 初始化模拟数据
   */
  initMockData() {
    const mockCustomers = [
      {
        id: 'user1',
        name: '张小明',
        nickname: '观心学员318974',
        phone: '13912345678',
        avatar: 'https://picsum.photos/seed/user1/80/80',
        accountType: 'main',
        gender: 'male',
        birthDate: '1995-03-15',
        height: 175,
        weight: 70,
        occupation: '软件工程师',
        education: 'bachelor',
        address: '北京市朝阳区xxx街道',
        symptoms: '自2020年起出现焦虑症状，工作压力大时加重，影响睡眠质量。',
        nextConsultation: {
          time: new Date(Date.now() + 25 * 60 * 1000), // 25分钟后
          type: 'video' // 线上咨询
        }
      },
      {
        id: 'user2',
        name: '李小雅',
        nickname: '观心学员318975',
        phone: '13987654321',
        avatar: 'https://picsum.photos/seed/user2/80/80',
        accountType: 'main',
        gender: 'female',
        birthDate: '1992-08-22',
        height: 165,
        weight: 55,
        occupation: '教师',
        education: 'master',
        address: '上海市浦东新区xxx路',
        symptoms: '产后抑郁，情绪低落，兴趣减退，需要心理支持和专业指导。',
        nextConsultation: {
          time: new Date(Date.now() + 15 * 60 * 1000), // 15分钟后
          type: 'offline' // 到店咨询
        }
      },
      {
        id: 'user3',
        name: '王小芳',
        nickname: '观心学员318976',
        phone: '13611223344',
        avatar: 'https://picsum.photos/seed/user3/80/80',
        accountType: 'main',
        gender: 'female',
        birthDate: '1988-12-10',
        height: 160,
        weight: 58,
        occupation: '市场经理',
        education: 'bachelor',
        address: '深圳市南山区xxx大厦',
        symptoms: '社交恐惧症，在公开场合容易紧张，影响工作表现。'
      },
      {
        id: 'user4',
        name: '陈小强',
        nickname: '观心学员318977',
        phone: '13755667788',
        avatar: 'https://picsum.photos/seed/user4/80/80',
        accountType: 'main',
        gender: 'male',
        birthDate: '1985-06-30',
        height: 180,
        weight: 75,
        occupation: '销售总监',
        education: 'college',
        address: '广州市天河区xxx广场',
        symptoms: '工作压力过大导致失眠，经常性头痛，情绪易怒。'
      },
      {
        id: 'user5',
        name: '刘小娟',
        nickname: '观心学员318978',
        phone: '13899887766',
        avatar: 'https://picsum.photos/seed/user5/80/80',
        accountType: 'main',
        gender: 'female',
        birthDate: '1990-04-18',
        height: 168,
        weight: 52,
        occupation: '护士',
        education: 'college',
        address: '杭州市西湖区xxx医院',
        symptoms: '因工作性质接触患者较多，出现轻度创伤后应激障碍。'
      },
      {
        id: 'user6',
        name: '周小琳',
        nickname: '观心学员318979',
        phone: '13633445566',
        avatar: 'https://picsum.photos/seed/user6/80/80',
        accountType: 'main',
        gender: 'female',
        birthDate: '1993-11-05',
        height: 162,
        weight: 50,
        occupation: '设计师',
        education: 'bachelor',
        address: '成都市锦江区xxx创意园',
        symptoms: '完美主义倾向严重，因工作要求过高导致焦虑和抑郁情绪。'
      }
    ];
    
    mockCustomers.forEach(customer => {
      this.customers.set(customer.id, customer);
    });
    
    this.filteredCustomers = Array.from(this.customers.values());
  }
  
  /**
   * 绑定事件
   */
  bindEvents() {
    // 侧边栏收起/展开
    this.elements.sidebarToggle?.addEventListener('click', () => {
      this.toggleSidebar();
    });
    
    // 搜索功能
    this.elements.customerSearch?.addEventListener('input', () => {
      this.filterCustomers();
    });
    
    // Tab切换
    this.elements.tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        this.switchTab(tabName);
      });
    });
    
    // 表单相关
    this.elements.profileForm?.addEventListener('submit', (e) => {
      this.handleFormSubmit(e);
    });
    
    this.elements.resetBtn?.addEventListener('click', () => {
      this.resetForm();
    });
    
    // 文件上传
    this.elements.uploadBtn?.addEventListener('click', () => {
      this.elements.fileInput?.click();
    });
    
    this.elements.fileInput?.addEventListener('change', (e) => {
      this.handleFileUpload(e);
    });
    
    // 出生日期变化时计算年龄
    const birthDateInput = document.getElementById('birthDate');
    birthDateInput?.addEventListener('change', () => {
      this.calculateAge();
    });
    
    // 身高体重变化时计算BMI
    const heightInput = document.getElementById('height');
    const weightInput = document.getElementById('weight');
    heightInput?.addEventListener('input', () => {
      this.calculateBMI();
    });
    weightInput?.addEventListener('input', () => {
      this.calculateBMI();
    });
    
    // 表单变化监听
    this.elements.profileForm?.addEventListener('input', () => {
      this.hasUnsavedChanges = true;
    });
    
    // 信息提示按钮
    this.elements.riskInfoBtn?.addEventListener('click', () => {
      this.showModal('riskInfoModal');
    });
    
    this.elements.historyInfoBtn?.addEventListener('click', () => {
      this.showModal('historyInfoModal');
    });
    
    // 模态框关闭
    this.elements.riskInfoClose?.addEventListener('click', () => {
      this.hideModal('riskInfoModal');
    });
    
    this.elements.historyInfoClose?.addEventListener('click', () => {
      this.hideModal('historyInfoModal');
    });
    
    // 下次咨询按钮
    this.elements.nextConsultationBtn?.addEventListener('click', () => {
      this.handleNextConsultation();
    });
    
    // AI总结展开收起
    this.elements.aiSummaryToggle?.addEventListener('click', () => {
      this.toggleAISummary();
    });
    
    // 页面退出前确认
    window.addEventListener('beforeunload', (e) => {
      if (this.hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '您有未保存的更改，确定要离开吗？';
      }
    });
    
    // 开始倒计时更新
    this.startCountdownUpdate();
  }
  
  /**
   * 检查URL参数
   */
  checkURLParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user');
    const userName = urlParams.get('name');
    
    if (userId && this.customers.has(userId)) {
      this.selectCustomer(userId);
    } else if (userName) {
      // 根据姓名查找客户
      const customer = Array.from(this.customers.values()).find(c => c.name === decodeURIComponent(userName));
      if (customer) {
        this.selectCustomer(customer.id);
      }
    }
  }
  
  /**
   * 过滤客户列表
   */
  filterCustomers() {
    const searchTerm = this.elements.customerSearch.value.toLowerCase().trim();
    
    if (!searchTerm) {
      this.filteredCustomers = Array.from(this.customers.values());
    } else {
      this.filteredCustomers = Array.from(this.customers.values()).filter(customer =>
        customer.name.toLowerCase().includes(searchTerm) ||
        customer.nickname.toLowerCase().includes(searchTerm) ||
        customer.phone.includes(searchTerm)
      );
    }
    
    this.renderCustomerList();
  }
  
  /**
   * 渲染客户列表
   */
  renderCustomerList() {
    const container = this.elements.customerList;
    
    if (this.filteredCustomers.length === 0) {
      container.innerHTML = '<div class="empty-message">暂无客户</div>';
      return;
    }
    
    const html = this.filteredCustomers.map(customer => `
      <div class="customer-item" data-customer-id="${customer.id}">
        <img src="${customer.avatar}" alt="${customer.name}" class="customer-avatar">
        <div class="customer-info">
          <div class="customer-name">${customer.name}</div>
          <div class="customer-account-type">${customer.accountType === 'main' ? '主账号' : '子账号'}</div>
        </div>
      </div>
    `).join('');
    
    container.innerHTML = html;
    
    // 绑定点击事件
    container.addEventListener('click', (e) => {
      const customerItem = e.target.closest('.customer-item');
      if (customerItem) {
        const customerId = customerItem.dataset.customerId;
        this.selectCustomer(customerId);
      }
    });
  }
  
  /**
   * 选择客户
   */
  selectCustomer(customerId) {
    const customer = this.customers.get(customerId);
    if (!customer) return;
    
    this.currentCustomer = customer;
    
    // 更新列表选中状态
    this.updateCustomerListSelection(customerId);
    
    // 显示档案内容
    this.showProfileContent();
    
    console.log('已选择客户:', customer.name);
  }
  
  /**
   * 更新客户列表选中状态
   */
  updateCustomerListSelection(customerId) {
    const customerItems = this.elements.customerList.querySelectorAll('.customer-item');
    customerItems.forEach(item => {
      if (item.dataset.customerId === customerId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }
  
  /**
   * 显示档案内容
   */
  showProfileContent() {
    this.elements.profileEmpty.style.display = 'none';
    this.elements.profileContent.style.display = 'block';
    
    // 更新用户基本信息
    this.elements.userAvatar.src = this.currentCustomer.avatar;
    this.elements.userName.textContent = this.currentCustomer.name;
    this.elements.userPhone.textContent = this.currentCustomer.phone;
    
    // 填充表单
    this.fillForm(this.currentCustomer);
    
    // 渲染AI总结
    this.renderAISummary(this.currentCustomer);
    
    // 检查并显示下次咨询提醒
    this.checkNextConsultation(this.currentCustomer);
  }
  
  /**
   * 填充表单数据
   */
  fillForm(customer) {
    // 基本信息
    document.getElementById('nickname').value = customer.nickname || '';
    document.getElementById('realName').value = customer.name || '';
    document.getElementById('gender').value = customer.gender || '';
    document.getElementById('birthDate').value = customer.birthDate || '';
    document.getElementById('phoneNumber').value = customer.phone || '';
    document.getElementById('height').value = customer.height || '';
    document.getElementById('weight').value = customer.weight || '';
    document.getElementById('occupation').value = customer.occupation || '';
    document.getElementById('education').value = customer.education || '';
    document.getElementById('address').value = customer.address || '';
    document.getElementById('emergencyContactName').value = customer.emergencyContactName || '';
    document.getElementById('emergencyContactPhone').value = customer.emergencyContactPhone || '';
    document.getElementById('symptoms').value = customer.symptoms || '';
    
    // 计算年龄和BMI
    this.calculateAge();
    this.calculateBMI();
  }
  
  /**
   * 渲染AI总结信息
   */
  renderAISummary(customer) {
    // 风险评估标签
    const riskData = [
      { type: 'suicide', level: 'high', label: '自杀风险-高' },
      { type: 'depression', level: 'high', label: '重度情绪-高' },
      { type: 'self-harm', level: 'medium', label: '自伤风险-中' },
      { type: 'isolation', level: 'medium', label: '社会隔离-中' },
      { type: 'neglect', level: 'low', label: '自我忽视-低' }
    ];
    
    this.elements.riskTags.innerHTML = riskData.map(risk => `
      <span class="risk-tag ${risk.level}">${risk.label}</span>
    `).join('');
    
    // 疾病史与用药史
    const historyData = [
      '2015年起，存在情绪低落、兴趣减退等问题，医院诊断为轻度抑郁',
      '现阶段，存在重度抑郁症状，伴有自杀倾向，未服药',
      '2019年，开始服用草酸艾司西普兰片 (10mg/日)，后调整至15mg/日',
      '现阶段建议使用度洛西汀肠溶胶囊和米氮平片，但实际未服药'
    ];
    
    this.elements.historyList.innerHTML = historyData.map(item => `<li>${item}</li>`).join('');
  }
  
  /**
   * 切换Tab
   */
  switchTab(tabName) {
    // 更新按钮状态
    this.elements.tabBtns.forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // 更新内容显示
    this.elements.tabPanes.forEach(pane => {
      pane.classList.remove('active');
    });
    
    const targetPane = document.getElementById(this.getTabPaneId(tabName));
    if (targetPane) {
      targetPane.classList.add('active');
    }
  }
  
  /**
   * 获取Tab面板ID
   */
  getTabPaneId(tabName) {
    const tabMap = {
      'basic': 'basicInfo',
      'consultations': 'consultationsTab',
      'scales': 'scalesTab',
      'diagnosis': 'diagnosisTab',
      'prescriptions': 'prescriptionsTab',
      'orders': 'ordersTab',
      'appointments': 'appointmentsTab'
    };
    return tabMap[tabName] || 'basicInfo';
  }
  
  /**
   * 计算年龄
   */
  calculateAge() {
    const birthDate = document.getElementById('birthDate').value;
    const ageField = document.getElementById('age');
    
    if (birthDate) {
      const birth = new Date(birthDate);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      
      ageField.value = age >= 0 ? age : '';
    } else {
      ageField.value = '';
    }
  }
  
  /**
   * 计算BMI
   */
  calculateBMI() {
    const height = parseFloat(document.getElementById('height').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const bmiField = document.getElementById('bmi');
    
    if (height && weight && height > 0) {
      const bmi = weight / Math.pow(height / 100, 2);
      bmiField.value = bmi.toFixed(1);
    } else {
      bmiField.value = '';
      bmiField.placeholder = '请填写身高和体重';
    }
  }
  
  /**
   * 处理文件上传
   */
  handleFileUpload(e) {
    const files = Array.from(e.target.files);
    const maxFiles = 9;
    const currentImages = this.elements.uploadedImages.children.length;
    
    if (currentImages + files.length > maxFiles) {
      toast.show(`最多只能上传${maxFiles}张图片`, 'warning');
      return;
    }
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        this.previewImage(file);
      }
    });
    
    // 清空input
    e.target.value = '';
  }
  
  /**
   * 预览图片
   */
  previewImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageDiv = document.createElement('div');
      imageDiv.className = 'uploaded-image';
      imageDiv.innerHTML = `
        <img src="${e.target.result}" alt="病历资料">
        <button type="button" class="remove-image" onclick="this.parentElement.remove()">×</button>
      `;
      this.elements.uploadedImages.appendChild(imageDiv);
    };
    reader.readAsDataURL(file);
  }
  
  /**
   * 处理表单提交
   */
  async handleFormSubmit(e) {
    e.preventDefault();
    
    if (!this.currentCustomer) {
      toast.show('请先选择一个客户', 'warning');
      return;
    }
    
    // 获取表单数据
    const formData = new FormData(this.elements.profileForm);
    const data = Object.fromEntries(formData.entries());
    
    try {
      toast.show('正在保存...', 'info');
      
      // 模拟API调用
      await this.saveCustomerProfile(data);
      
      // 更新本地数据
      Object.assign(this.currentCustomer, data);
      
      this.hasUnsavedChanges = false;
      toast.show('保存成功', 'success');
      
      // 更新客户列表显示
      this.renderCustomerList();
      
    } catch (error) {
      console.error('保存失败:', error);
      toast.show('保存失败，请稍后重试', 'error');
    }
  }
  
  /**
   * 模拟保存客户档案API
   */
  async saveCustomerProfile(data) {
    return new Promise((resolve) => {
      setTimeout(resolve, 1000 + Math.random() * 1000);
    });
  }
  
  /**
   * 重置表单
   */
  resetForm() {
    if (this.hasUnsavedChanges) {
      const confirmed = confirm('确定要重置表单吗？这将丢失所有未保存的更改。');
      if (!confirmed) return;
    }
    
    if (this.currentCustomer) {
      this.fillForm(this.currentCustomer);
      this.hasUnsavedChanges = false;
      toast.show('表单已重置', 'info');
    }
  }
  
  /**
   * 检查下次咨询提醒
   */
  checkNextConsultation(customer) {
    const card = this.elements.nextConsultationCard;
    
    // 已删除30分钟提醒逻辑 - 不再显示"开始咨询"按钮
    // 直接隐藏下次咨询提醒卡片
    card.style.display = 'none';
    
    // 原逻辑已注释：
    // if (customer.nextConsultation) {
    //   const consultationTime = customer.nextConsultation.time;
    //   const now = new Date();
    //   const timeDiff = consultationTime.getTime() - now.getTime();
    //   
    //   // 如果距离咨询时间小于30分钟，显示提醒卡片
    //   if (timeDiff > 0 && timeDiff <= 30 * 60 * 1000) {
    //     card.style.display = 'block';
    //     this.updateNextConsultationCard(customer.nextConsultation, timeDiff);
    //   } else {
    //     card.style.display = 'none';
    //   }
    // } else {
    //   card.style.display = 'none';
    // }
  }
  
  /**
   * 更新下次咨询提醒卡片
   */
  updateNextConsultationCard(consultation, timeDiff) {
    const minutes = Math.floor(timeDiff / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    
    this.elements.countdownText.textContent = `距离下次咨询还有 ${minutes} 分钟 ${seconds} 秒`;
    this.elements.nextConsultationType.textContent = 
      consultation.type === 'video' ? '线上咨询' : '到店咨询';
    
    this.elements.nextConsultationBtn.textContent = 
      consultation.type === 'video' ? '开始咨询' : '开始记录';
  }
  
  /**
   * 处理下次咨询按钮点击
   */
  handleNextConsultation() {
    if (!this.currentCustomer?.nextConsultation) return;
    
    const consultation = this.currentCustomer.nextConsultation;
    
    if (consultation.type === 'video') {
      toast.show('正在连接视频咨询...', 'info');
      // 这里可以跳转到视频咨询页面
      setTimeout(() => {
        toast.show('视频咨询已开始', 'success');
      }, 2000);
    } else {
      // 跳转到咨询笔记页面
      const clientName = this.currentCustomer.name;
      const sessionCount = this.currentCustomer.sessionCount || 1;
      const consultationTime = consultation.time.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) + '-' + new Date(consultation.time.getTime() + 60 * 60 * 1000).toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      // 构建URL参数
      const params = new URLSearchParams({
        client: clientName,
        session: sessionCount,
        time: consultationTime
      });
      
      // 跳转到咨询笔记页面
      window.location.href = `consultation-notes.html?${params.toString()}`;
    }
  }
  
  /**
   * 开始倒计时更新
   */
  startCountdownUpdate() {
    setInterval(() => {
      if (this.currentCustomer?.nextConsultation && 
          this.elements.nextConsultationCard.style.display !== 'none') {
        this.checkNextConsultation(this.currentCustomer);
      }
    }, 1000); // 每秒更新
  }
  
  /**
   * 显示模态框
   */
  showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'flex';
      setTimeout(() => modal.classList.add('show'), 10);
      
      // 添加点击背景关闭功能
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.hideModal(modalId);
        }
      });
      
      // 添加ESC键关闭功能
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.hideModal(modalId);
        }
      });
    }
  }
  
  /**
   * 隐藏模态框
   */
  hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('show');
      setTimeout(() => modal.style.display = 'none', 200);
      
      // 移除事件监听器
      document.removeEventListener('keydown', this.handleEscKey);
    }
  }
  
  /**
   * 切换侧边栏显示/隐藏
   */
  toggleSidebar() {
    const isCollapsed = this.elements.profileLayout.classList.contains('sidebar-collapsed');
    
    if (isCollapsed) {
      // 展开侧边栏
      this.elements.profileLayout.classList.remove('sidebar-collapsed');
      this.elements.sidebarToggle.classList.remove('collapsed');
      
      // 保存状态
      localStorage.setItem('sidebarCollapsed', 'false');
    } else {
      // 收起侧边栏
      this.elements.profileLayout.classList.add('sidebar-collapsed');
      this.elements.sidebarToggle.classList.add('collapsed');
      
      // 保存状态
      localStorage.setItem('sidebarCollapsed', 'true');
    }
  }
  
  /**
   * 恢复侧边栏状态
   */
  restoreSidebarState() {
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    
    if (isCollapsed) {
      this.elements.profileLayout.classList.add('sidebar-collapsed');
      this.elements.sidebarToggle.classList.add('collapsed');
    }
  }
  
  /**
   * 切换AI总结展开收起状态
   */
  toggleAISummary() {
    const aiSummary = document.querySelector('.ai-summary');
    const isCollapsed = aiSummary.classList.contains('collapsed');
    
    if (isCollapsed) {
      // 展开
      aiSummary.classList.remove('collapsed');
      localStorage.setItem('aiSummaryCollapsed', 'false');
    } else {
      // 收起
      aiSummary.classList.add('collapsed');
      localStorage.setItem('aiSummaryCollapsed', 'true');
    }
  }
  
  /**
   * 恢复AI总结展开收起状态
   */
  restoreAISummaryState() {
    const isCollapsed = localStorage.getItem('aiSummaryCollapsed') === 'true';
    const aiSummary = document.querySelector('.ai-summary');
    
    if (isCollapsed && aiSummary) {
      aiSummary.classList.add('collapsed');
    }
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  window.customerProfile = new CustomerProfile();
}); 