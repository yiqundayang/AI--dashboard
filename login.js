/**
 * 登录页面逻辑
 */

class LoginPage {
  constructor() {
    // DOM元素缓存
    this.elements = {};
    
    // 状态管理
    this.isLoading = false;
    
    this.init();
  }
  
  /**
   * 初始化
   */
  init() {
    this.cacheElements();
    this.loadRememberedPhone();
    this.bindEvents();
    this.validateForm();
    
    console.log('登录页面已初始化');
  }
  
  /**
   * 缓存DOM元素
   */
  cacheElements() {
    this.elements = {
      form: document.getElementById('loginForm'),
      phoneInput: document.getElementById('phone'),
      passwordInput: document.getElementById('password'),
      phoneError: document.getElementById('phoneError'),
      passwordError: document.getElementById('passwordError'),
      loginBtn: document.getElementById('loginBtn'),
      passwordToggle: document.getElementById('passwordToggle'),
      rememberCheckbox: document.getElementById('rememberPhone'),
      btnText: document.querySelector('.btn-text'),
      btnLoading: document.querySelector('.btn-loading')
    };
  }
  
  /**
   * 加载记住的手机号
   */
  loadRememberedPhone() {
    const rememberedPhone = storage.get('rememberedPhone');
    if (rememberedPhone) {
      this.elements.phoneInput.value = rememberedPhone;
      this.elements.rememberCheckbox.checked = true;
      // 触发验证
      this.validatePhone();
      this.validateForm();
    }
  }
  
  /**
   * 绑定事件
   */
  bindEvents() {
    // 表单提交
    this.elements.form.addEventListener('submit', this.handleLogin.bind(this));
    
    // 输入框验证
    this.elements.phoneInput.addEventListener('input', utils.debounce(() => {
      this.validatePhone();
      this.validateForm();
    }, 300));
    
    this.elements.phoneInput.addEventListener('blur', () => {
      this.validatePhone();
    });
    
    this.elements.passwordInput.addEventListener('input', () => {
      this.validatePassword();
      this.validateForm();
    });
    
    this.elements.passwordInput.addEventListener('blur', () => {
      this.validatePassword();
    });
    
    // 密码显示/隐藏切换
    this.elements.passwordToggle.addEventListener('click', this.togglePassword.bind(this));
    
    // 手机号输入限制（只允许数字）
    this.elements.phoneInput.addEventListener('keydown', (e) => {
      // 允许特殊键：Backspace, Delete, Tab, Enter, Arrows
      const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
      
      if (allowedKeys.includes(e.key)) {
        return;
      }
      
      // 只允许数字
      if (!/^[0-9]$/.test(e.key)) {
        e.preventDefault();
      }
    });
  }
  
  /**
   * 验证手机号
   */
  validatePhone() {
    const phone = this.elements.phoneInput.value.trim();
    const phoneRegex = /^1[3-9]\d{9}$/;
    
    if (!phone) {
      this.showError(this.elements.phoneError, '请输入手机号');
      return false;
    }
    
    if (!phoneRegex.test(phone)) {
      this.showError(this.elements.phoneError, '手机号格式不正确');
      return false;
    }
    
    this.hideError(this.elements.phoneError);
    return true;
  }
  
  /**
   * 验证密码
   */
  validatePassword() {
    const password = this.elements.passwordInput.value;
    
    if (!password) {
      this.showError(this.elements.passwordError, '请输入密码');
      return false;
    }
    
    this.hideError(this.elements.passwordError);
    return true;
  }
  
  /**
   * 验证整个表单
   */
  validateForm() {
    const phone = this.elements.phoneInput.value.trim();
    const password = this.elements.passwordInput.value;
    const isPhoneValid = phone && this.validatePhoneFormat(phone);
    const isPasswordValid = password;
    
    if (isPhoneValid && isPasswordValid && !this.isLoading) {
      this.elements.loginBtn.disabled = false;
    } else {
      this.elements.loginBtn.disabled = true;
    }
  }
  
  /**
   * 验证手机号格式（内部方法）
   */
  validatePhoneFormat(phone) {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  }
  
  /**
   * 切换密码显示/隐藏
   */
  togglePassword() {
    const isPasswordVisible = this.elements.passwordInput.type === 'text';
    
    if (isPasswordVisible) {
      this.elements.passwordInput.type = 'password';
      this.elements.passwordToggle.querySelector('.toggle-icon').textContent = '👁️';
      this.elements.passwordToggle.setAttribute('aria-label', '显示密码');
    } else {
      this.elements.passwordInput.type = 'text';
      this.elements.passwordToggle.querySelector('.toggle-icon').textContent = '🙈';
      this.elements.passwordToggle.setAttribute('aria-label', '隐藏密码');
    }
  }
  
  /**
   * 处理登录
   */
  async handleLogin(e) {
    e.preventDefault();
    
    if (this.isLoading) return;
    
    const phone = this.elements.phoneInput.value.trim();
    const password = this.elements.passwordInput.value;
    
    // 验证表单
    const isPhoneValid = this.validatePhone();
    const isPasswordValid = this.validatePassword();
    
    if (!isPhoneValid || !isPasswordValid) {
      return;
    }
    
    // 验证固定密码
    if (password !== '123456') {
      toast.show('登录失败，请检查手机号或密码', 'error');
      return;
    }
    
    this.setLoading(true);
    
    try {
      // 模拟API调用
      await this.loginAPI(phone, password);
      
      // 保存或删除记住的手机号
      if (this.elements.rememberCheckbox.checked) {
        storage.set('rememberedPhone', phone, 30 * 24 * 60 * 60 * 1000); // 30天
      } else {
        storage.remove('rememberedPhone');
      }
      
      // 保存登录状态
      storage.set('isLoggedIn', true);
      storage.set('loginTime', Date.now());
      storage.set('userPhone', phone);
      
      toast.show('登录成功', 'success');
      
      // 清空表单
      this.elements.passwordInput.value = '';
      if (!this.elements.rememberCheckbox.checked) {
        this.elements.phoneInput.value = '';
      }
      
      // 延迟跳转，让用户看到成功提示
      setTimeout(() => {
        window.location.href = 'todo-center.html';
      }, 1000);
      
    } catch (error) {
      console.error('登录失败:', error);
      toast.show('登录失败，请稍后重试', 'error');
    } finally {
      this.setLoading(false);
    }
  }
  
  /**
   * 模拟登录API
   */
  async loginAPI(phone, password) {
    // 模拟网络延迟
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 模拟登录验证
        if (password === '123456') {
          resolve({
            code: 200,
            data: {
              token: 'mock_jwt_token_' + Date.now(),
              userInfo: {
                id: '123',
                name: '咨询师',
                phone: phone
              }
            }
          });
        } else {
          reject(new Error('密码错误'));
        }
      }, 1000 + Math.random() * 1000); // 1-2秒随机延迟
    });
  }
  
  /**
   * 设置加载状态
   */
  setLoading(loading) {
    this.isLoading = loading;
    
    if (loading) {
      this.elements.btnText.style.display = 'none';
      this.elements.btnLoading.style.display = 'flex';
      this.elements.loginBtn.disabled = true;
    } else {
      this.elements.btnText.style.display = 'block';
      this.elements.btnLoading.style.display = 'none';
      this.validateForm();
    }
  }
  
  /**
   * 显示错误信息
   */
  showError(errorElement, message) {
    errorElement.textContent = message;
    errorElement.classList.add('show');
  }
  
  /**
   * 隐藏错误信息
   */
  hideError(errorElement) {
    errorElement.textContent = '';
    errorElement.classList.remove('show');
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  new LoginPage();
}); 