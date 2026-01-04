/**
 * 模態窗組件
 * 提供統一風格的提示、確認與錯誤訊息顯示
 */

export class Modal {
  constructor() {
    this.modal = null;
    this.initialized = false;
    this.keydownHandler = null;
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
    this.modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-icon"></div>
        <h2 class="modal-title"></h2>
        <p class="modal-message"></p>
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

    // Escape 鍵關閉 - 保存 handler 引用以便清理
    this.keydownHandler = (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('active')) {
        this.close();
      }
    };
    document.addEventListener('keydown', this.keydownHandler);
  }

  /**
   * 顯示提示訊息
   * @param {Object} options - 配置選項
   * @param {string} options.title - 標題
   * @param {string} options.message - 訊息內容
   * @param {string} options.type - 類型 ('info' | 'success' | 'warning' | 'error')
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

    // 顯示模態窗
    this.modal.classList.add('active');
    primaryBtn.focus();
  }

  /**
   * 關閉模態窗
   */
  close() {
    this.modal.classList.remove('active');
  }

  /**
   * 獲取圖示 SVG
   * @param {string} type - 圖示類型
   * @returns {string} SVG 字串
   */
  getIcon(type) {
    const icons = {
      info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
      success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
      warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>'
    };
    return icons[type] || icons.info;
  }

  /**
   * 快捷方法：顯示無資料提示並跳轉首頁
   * @param {Function} onRedirect - 跳轉前的回調（可選）
   */
  showNoData(onRedirect = null) {
    this.show({
      title: '找不到資料',
      message: '請先上傳你的 Threads 資料檔案，才能查看年度回顧。',
      type: 'warning',
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
