/**
 * 模態窗組件
 * 提供統一風格的提示、確認與錯誤訊息顯示
 */

export class Modal {
  constructor() {
    this.modal = null;
    this.initialized = false;
    this.keydownHandler = null;
    this.previousActiveElement = null;
    this.focusableElements = [];
    this.firstFocusableElement = null;
    this.lastFocusableElement = null;
  }

  /**
   * 初始化模態窗 DOM 結構
   */
  init() {
    // 避免重複初始化
    if (this.initialized) {
      return;
    }

    // 確保 DOM 已準備好
    if (!document.body) {
      console.warn('Modal: document.body is not ready, deferring initialization');
      return;
    }

    // 檢查是否已存在
    if (document.getElementById('app-modal')) {
      this.modal = document.getElementById('app-modal');
      this.initialized = true;
      return;
    }

    // 創建模態窗結構
    this.modal = document.createElement('div');
    this.modal.id = 'app-modal';
    this.modal.className = 'modal-overlay';
    this.modal.setAttribute('role', 'dialog');
    this.modal.setAttribute('aria-modal', 'true');
    this.modal.setAttribute('aria-labelledby', 'modal-title');
    this.modal.setAttribute('aria-describedby', 'modal-message');
    this.modal.innerHTML = `
      <div class="modal-content" role="document">
        <div class="modal-icon" aria-hidden="true"></div>
        <h2 id="modal-title" class="modal-title"></h2>
        <p id="modal-message" class="modal-message"></p>
        <div class="modal-actions">
          <button class="modal-btn modal-btn-primary"></button>
          <button class="modal-btn modal-btn-secondary"></button>
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);
    this.initialized = true;

    // 點擊遮罩關閉（僅限非關鍵訊息）
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal && !this.modal.classList.contains('modal-critical')) {
        this.close();
      }
    });

    // 鍵盤事件處理 - 保存 handler 引用以便清理
    this.keydownHandler = (e) => {
      if (!this.modal.classList.contains('active')) return;

      // Escape 鍵關閉
      if (e.key === 'Escape') {
        this.close();
        return;
      }

      // Tab 鍵焦點陷阱
      if (e.key === 'Tab') {
        this.handleTabKey(e);
      }
    };
    document.addEventListener('keydown', this.keydownHandler);
  }

  /**
   * 處理 Tab 鍵實現焦點陷阱
   * @param {KeyboardEvent} e - 鍵盤事件
   */
  handleTabKey(e) {
    // 更新可聚焦元素列表（動態內容可能改變）
    this.updateFocusableElements();

    if (this.focusableElements.length === 0) return;

    // Shift + Tab（向後）
    if (e.shiftKey) {
      if (document.activeElement === this.firstFocusableElement) {
        e.preventDefault();
        this.lastFocusableElement.focus();
      }
    }
    // Tab（向前）
    else {
      if (document.activeElement === this.lastFocusableElement) {
        e.preventDefault();
        this.firstFocusableElement.focus();
      }
    }
  }

  /**
   * 更新可聚焦元素列表
   */
  updateFocusableElements() {
    const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    this.focusableElements = Array.from(
      this.modal.querySelectorAll(focusableSelector)
    ).filter(el => {
      // 過濾掉隱藏或禁用的元素
      return !el.disabled &&
             el.offsetParent !== null &&
             getComputedStyle(el).display !== 'none';
    });

    this.firstFocusableElement = this.focusableElements[0];
    this.lastFocusableElement = this.focusableElements[this.focusableElements.length - 1];
  }

  /**
   * 顯示提示訊息
   * @param {Object} options - 配置選項
   * @param {string} options.title - 標題
   * @param {string} options.message - 訊息內容
   * @param {string} options.type - 類型 ('info' | 'success' | 'warning' | 'error' | 'confirm' | 'nodata' | 'critical')
   * @param {string} options.confirmText - 確認按鈕文字
   * @param {Function} options.onConfirm - 確認回調
   * @param {string} options.cancelText - 取消按鈕文字（可選）
   * @param {Function} options.onCancel - 取消回調（可選）
   * @param {boolean} options.critical - 是否為關鍵訊息（禁止點擊遮罩關閉）
   */
  show(options = {}) {
    // 確保 modal 已初始化
    if (!this.initialized) {
      this.init();
      // 如果初始化失敗（例如 DOM 未準備好），延遲執行
      if (!this.initialized) {
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', () => this.show(options), { once: true });
        }
        return;
      }
    }

    const {
      title = '提示',
      message = '',
      type = 'info',
      confirmText = '確定',
      onConfirm = null,
      cancelText = null,
      onCancel = null,
      critical = false
    } = options;

    // 設置內容
    const titleEl = this.modal.querySelector('.modal-title');
    const messageEl = this.modal.querySelector('.modal-message');
    const iconEl = this.modal.querySelector('.modal-icon');
    const primaryBtn = this.modal.querySelector('.modal-btn-primary');
    const secondaryBtn = this.modal.querySelector('.modal-btn-secondary');

    titleEl.textContent = title;
    messageEl.textContent = message;
    primaryBtn.textContent = confirmText;

    // 設置圖示
    iconEl.className = `modal-icon modal-icon-${type}`;
    iconEl.innerHTML = this.getIcon(type);

    // 設置類型樣式
    this.modal.className = `modal-overlay modal-${type}`;
    if (critical) {
      this.modal.classList.add('modal-critical');
    }

    // 設置按鈕
    primaryBtn.onclick = () => {
      if (onConfirm) onConfirm();
      this.close();
    };

    if (cancelText) {
      secondaryBtn.textContent = cancelText;
      secondaryBtn.style.display = 'inline-block';
      secondaryBtn.onclick = () => {
        if (onCancel) onCancel();
        this.close();
      };
    } else {
      secondaryBtn.style.display = 'none';
    }

    // 保存當前焦點元素
    this.previousActiveElement = document.activeElement;

    // 顯示模態窗
    this.modal.classList.add('active');

    // 初始化焦點陷阱
    this.updateFocusableElements();

    // 聚焦到主按鈕
    primaryBtn.focus();
  }

  /**
   * 關閉模態窗
   */
  close() {
    this.modal.classList.remove('active');

    // 恢復焦點到觸發元素
    if (this.previousActiveElement && typeof this.previousActiveElement.focus === 'function') {
      // 延遲恢復焦點，確保模態窗完全關閉
      setTimeout(() => {
        this.previousActiveElement.focus();
        this.previousActiveElement = null;
      }, 100);
    }
  }

  /**
   * 清理資源（移除事件監聽器）
   */
  destroy() {
    if (this.keydownHandler) {
      document.removeEventListener('keydown', this.keydownHandler);
      this.keydownHandler = null;
    }
    if (this.modal && this.modal.parentNode) {
      this.modal.parentNode.removeChild(this.modal);
    }
    this.modal = null;
    this.initialized = false;
    this.previousActiveElement = null;
    this.focusableElements = [];
    this.firstFocusableElement = null;
    this.lastFocusableElement = null;
  }

  /**
   * 獲取圖示 SVG
   * @param {string} type - 圖示類型
   * @returns {string} SVG 字串
   */
  getIcon(type) {
    // Icon paths from Lucide (ISC)
    const icons = {
      info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
      success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>',
      warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
      error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>',
      confirm: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>',
      nodata: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg>',
      critical: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 16h.01"/><path d="M12 8v4"/><path d="M15.312 2a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586l-4.688-4.688A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2z"/></svg>'
    };
    // 嚴格驗證 type 只能是預定義的值，防止 XSS
    if (!Object.prototype.hasOwnProperty.call(icons, type)) {
      console.warn(`Invalid modal type: ${type}, falling back to 'info'`);
      return icons.info;
    }
    return icons[type];
  }

  /**
   * 快捷方法：顯示無資料提示並跳轉首頁
   * @param {Function} onRedirect - 跳轉前的回調（可選）
   */
  showNoData(onRedirect = null) {
    this.show({
      title: '找不到資料',
      message: '請先上傳你的 Threads 資料檔案，才能查看年度回顧。',
      type: 'nodata',
      confirmText: '前往上傳',
      onConfirm: () => {
        if (onRedirect) onRedirect();
        window.location.href = 'index.html';
      },
      critical: true
    });
  }

  /**
   * 快捷方法：顯示錯誤訊息
   * @param {string} message - 錯誤訊息
   * @param {Function} onConfirm - 確認回調（可選）
   */
  showError(message, onConfirm = null) {
    this.show({
      title: '發生錯誤',
      message: message,
      type: 'error',
      confirmText: '確定',
      onConfirm: onConfirm
    });
  }

  /**
   * 快捷方法：顯示成功訊息
   * @param {string} message - 成功訊息
   * @param {Function} onConfirm - 確認回調（可選）
   */
  showSuccess(message, onConfirm = null) {
    this.show({
      title: '成功',
      message: message,
      type: 'success',
      confirmText: '確定',
      onConfirm: onConfirm
    });
  }
}

// 延遲初始化的全域實例
let modalInstance = null;

/**
 * 獲取 Modal 單例實例
 * @returns {Modal} Modal 實例
 */
function getModalInstance() {
  if (!modalInstance) {
    modalInstance = new Modal();
  }
  return modalInstance;
}

// 使用 Proxy 實現延遲初始化的透明單例
export const modal = new Proxy({}, {
  get(target, prop) {
    const instance = getModalInstance();
    const value = instance[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  }
});
