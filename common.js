/**
 * AI咨询师驾驶舱 - 公共JavaScript工具库
 */

// 工具函数类
class Utils {
  /**
   * 格式化日期
   * @param {Date} date 日期对象
   * @param {string} format 格式 'YYYY-MM-DD' | 'MM-DD' | 'M月D日'
   */
  static formatDate(date, format = 'YYYY-MM-DD') {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    switch (format) {
      case 'YYYY-MM-DD':
        return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      case 'MM-DD':
        return `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      case 'M月D日':
        return `${month}月${day}日`;
      default:
        return date.toISOString().split('T')[0];
    }
  }
  
  /**
   * 获取今天的日期字符串
   */
  static getToday() {
    return this.formatDate(new Date());
  }
  
  /**
   * 获取明天的日期字符串
   */
  static getTomorrow() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return this.formatDate(tomorrow);
  }
  
  /**
   * 生成未来几天的日期数组
   * @param {number} days 天数
   * @param {number} startOffset 开始偏移天数（默认2，即后天开始）
   */
  static getFutureDates(days = 5, startOffset = 2) {
    const dates = [];
    const today = new Date();
    
    for (let i = startOffset; i < startOffset + days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: this.formatDate(date),
        label: this.formatDate(date, 'M月D日')
      });
    }
    
    return dates;
  }
  
  /**
   * 防抖函数
   * @param {Function} func 要防抖的函数
   * @param {number} wait 等待时间
   * @param {boolean} immediate 是否立即执行
   */
  static debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func(...args);
    };
  }
  
  /**
   * 节流函数
   * @param {Function} func 要节流的函数
   * @param {number} limit 时间限制
   */
  static throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}

// Toast提示管理类
class Toast {
  constructor() {
    this.container = null;
    this.init();
  }
  
  init() {
    // 创建Toast容器（如果不存在）
    this.container = document.getElementById('toast');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast';
      this.container.className = 'toast';
      this.container.innerHTML = '<span class="toast-message" id="toastMessage"></span>';
      document.body.appendChild(this.container);
    }
    
    // 添加Toast样式（如果不存在）
    if (!document.querySelector('style[data-toast]')) {
      const style = document.createElement('style');
      style.setAttribute('data-toast', 'true');
      style.textContent = `
        .toast {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
          font-size: 14px;
          z-index: 10000;
          opacity: 0;
          transition: all 0.3s ease;
          pointer-events: none;
        }
        
        .toast.show {
          opacity: 1;
          transform: translateX(-50%) translateY(10px);
        }
        
        .toast.success {
          background: var(--success-green, #34C759);
        }
        
        .toast.error {
          background: var(--error-red, #FF3B30);
        }
        
        .toast.warning {
          background: var(--warning-orange, #FF9500);
        }
      `;
      document.head.appendChild(style);
    }
  }
  
  /**
   * 显示Toast提示
   * @param {string} message 消息内容
   * @param {string} type 类型：success, error, warning, info
   * @param {number} duration 显示时长（毫秒）
   */
  show(message, type = 'info', duration = 3000) {
    const messageElement = this.container.querySelector('.toast-message');
    messageElement.textContent = message;
    
    // 重置类名
    this.container.className = 'toast';
    
    // 添加类型类名
    if (type !== 'info') {
      this.container.classList.add(type);
    }
    
    // 显示Toast
    this.container.style.display = 'block';
    setTimeout(() => {
      this.container.classList.add('show');
    }, 10);
    
    // 自动隐藏
    setTimeout(() => {
      this.hide();
    }, duration);
  }
  
  /**
   * 隐藏Toast
   */
  hide() {
    this.container.classList.remove('show');
    setTimeout(() => {
      this.container.style.display = 'none';
    }, 300);
  }
}

// 模态框管理类
class Modal {
  /**
   * 显示模态框
   * @param {string} modalId 模态框ID
   */
  static show(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden'; // 防止背景滚动
      
      // 添加动画效果
      setTimeout(() => {
        modal.classList.add('show');
      }, 10);
    }
  }
  
  /**
   * 隐藏模态框
   * @param {string} modalId 模态框ID
   */
  static hide(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('show');
      setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = ''; // 恢复背景滚动
      }, 200);
    }
  }
  
  /**
   * 绑定模态框关闭事件
   * @param {string} modalId 模态框ID
   */
  static bindCloseEvents(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    // 点击背景关闭
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.hide(modalId);
      }
    });
    
    // ESC键关闭
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.style.display === 'flex') {
        this.hide(modalId);
      }
    });
  }
}

// 本地存储管理类
class Storage {
  /**
   * 设置存储项（带过期时间）
   * @param {string} key 键名
   * @param {any} value 值
   * @param {number} expiry 过期时间（毫秒）
   */
  static set(key, value, expiry = 24 * 60 * 60 * 1000) {
    const item = {
      value: value,
      expiry: Date.now() + expiry
    };
    localStorage.setItem(key, JSON.stringify(item));
  }
  
  /**
   * 获取存储项
   * @param {string} key 键名
   * @returns {any} 值，如果过期或不存在则返回null
   */
  static get(key) {
    const item = localStorage.getItem(key);
    if (!item) return null;
    
    try {
      const data = JSON.parse(item);
      if (Date.now() > data.expiry) {
        localStorage.removeItem(key);
        return null;
      }
      return data.value;
    } catch (e) {
      localStorage.removeItem(key);
      return null;
    }
  }
  
  /**
   * 删除存储项
   * @param {string} key 键名
   */
  static remove(key) {
    localStorage.removeItem(key);
  }
  
  /**
   * 清空所有存储项
   */
  static clear() {
    localStorage.clear();
  }
}

// 网络请求管理类
class Http {
  constructor(baseURL = '') {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }
  
  /**
   * 设置授权令牌
   * @param {string} token 令牌
   */
  setAuthToken(token) {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }
  
  /**
   * 通用请求方法
   * @param {string} url 请求URL
   * @param {Object} options 请求选项
   */
  async request(url, options = {}) {
    const config = {
      headers: { ...this.defaultHeaders, ...options.headers },
      ...options
    };
    
    try {
      const response = await fetch(this.baseURL + url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Request failed:', error);
      throw error;
    }
  }
  
  /**
   * GET请求
   * @param {string} url 请求URL
   * @param {Object} params 查询参数
   */
  async get(url, params = {}) {
    const searchParams = new URLSearchParams(params);
    const queryString = searchParams.toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    
    return this.request(fullUrl, { method: 'GET' });
  }
  
  /**
   * POST请求
   * @param {string} url 请求URL
   * @param {Object} data 请求数据
   */
  async post(url, data = {}) {
    return this.request(url, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  
  /**
   * PUT请求
   * @param {string} url 请求URL
   * @param {Object} data 请求数据
   */
  async put(url, data = {}) {
    return this.request(url, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
  
  /**
   * DELETE请求
   * @param {string} url 请求URL
   */
  async delete(url) {
    return this.request(url, { method: 'DELETE' });
  }
}

// 全局实例
window.utils = Utils;
window.toast = new Toast();
window.modal = Modal;
window.storage = Storage;
window.http = new Http();

// DOM加载完成后的初始化
document.addEventListener('DOMContentLoaded', () => {
  console.log('AI咨询师驾驶舱 - 公共库已加载');
  
  // 初始化所有模态框的关闭事件
  document.querySelectorAll('.modal').forEach(modal => {
    Modal.bindCloseEvents(modal.id);
  });
}); 