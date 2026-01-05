/**
 * result.js - 結果頁面邏輯
 * 渲染統計資料、下載圖片、重新開始
 */

import { Renderer } from './renderer.js';
import { modal } from './modal.js';

class ResultApp {
  constructor() {
    this.stats = null;
    this.renderer = null;
    this.wrappedContainer = document.getElementById('wrapped-container');
    this.downloadBtn = document.getElementById('download-btn');
    this.replayBtn = document.getElementById('replay-btn');
    this.restartBtn = document.getElementById('restart-btn');
    this.html2canvasPromise = null;

    this.init();
  }

  /**
   * 初始化響應式縮放
   */
  initResponsiveScale() {
    const updateScale = () => {
      const scale = Math.min((window.innerWidth - 40) / 1080, 1);
      document.documentElement.style.setProperty('--container-scale', scale);
    };
    window.addEventListener('resize', updateScale);
  }

  /**
   * 初始化
   */
  async init() {
    // 從 localStorage 讀取 stats
    const statsJson = localStorage.getItem('threadsStats');
    if (!statsJson) {
      modal.showNoData();
      return;
    }

    this.stats = JSON.parse(statsJson);
    console.log('Stats loaded:', this.stats);

    // 渲染統計資料
    this.renderer = new Renderer(this.stats);
    await this.renderer.render();

    // 初始化響應式縮放
    this.initResponsiveScale();

    // 初始化事件監聽
    this.initEventListeners();
  }

  /**
   * 初始化事件監聽
   */
  initEventListeners() {
    // 下載按鈕
    if (this.downloadBtn) {
      this.downloadBtn.addEventListener('click', () => {
        this.downloadImage();
      });
    }

    // 重新播放按鈕
    if (this.replayBtn) {
      this.replayBtn.addEventListener('click', () => {
        this.replay();
      });
    }

    // 重新開始按鈕
    if (this.restartBtn) {
      this.restartBtn.addEventListener('click', () => {
        this.restart();
      });
    }
  }

  /**
   * 下載圖片
   */
  async downloadImage() {
    if (!this.wrappedContainer) return;

    // 如果沒有用戶名稱，詢問使用者
    if (!this.stats?.username) {
      const userInput = prompt('請輸入你的 Threads 帳號名稱：\n\n（僅用於圖片右下角註記，所有資料皆在本機處理，不會上傳至任何伺服器）');
      if (userInput && userInput.trim()) {
        this.stats.username = userInput.trim();
        // 更新頁面上的用戶名稱
        const usernameEl = document.getElementById('username');
        if (usernameEl) {
          usernameEl.textContent = `@${this.stats.username}`;
        }
        // 更新 localStorage
        localStorage.setItem('threadsStats', JSON.stringify(this.stats));
      } else {
        this.stats.username = 'user';
      }
    }

    const overlay = document.getElementById('download-overlay');

    // 顯示 loading
    overlay.classList.add('active');
    await new Promise(r => setTimeout(r, 50));

    try {
      // 建立離屏容器（避免影響 viewport 縮放）
      const offscreenContainer = document.createElement('div');
      offscreenContainer.style.cssText = `
        position: fixed;
        left: -9999px;
        top: 0;
        width: 1080px;
        height: 1080px;
        overflow: hidden;
        z-index: -1;
      `;
      document.body.appendChild(offscreenContainer);

      // 克隆元素
      const clone = this.wrappedContainer.cloneNode(true);
      clone.style.transform = 'none';
      clone.classList.add('screenshot-mode');
      offscreenContainer.appendChild(clone);

      await new Promise(r => setTimeout(r, 100));

      // 對克隆元素截圖
      const html2canvas = await this.loadHtml2Canvas();
      const canvas = await html2canvas(clone, {
        scale: 2,
        backgroundColor: '#000000',
        useCORS: true
      });

      // 移除離屏容器
      document.body.removeChild(offscreenContainer);

      const link = document.createElement('a');
      link.download = `threads-wrapped-2025-${this.stats.username}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Download error:', error);
      modal.showError('下載失敗，請稍後再試');
    } finally {
      await new Promise(r => setTimeout(r, 200));
      overlay.classList.remove('active');
    }
  }

  /**
   * 重新播放故事
   */
  replay() {
    // 導航到故事頁面重新播放
    window.location.href = 'story.html';
  }

  /**
   * 重新開始
   */
  restart() {
    // 清除 localStorage
    localStorage.removeItem('threadsStats');
    // 返回首頁
    window.location.href = 'index.html';
  }

  loadHtml2Canvas() {
    if (window.html2canvas) {
      return Promise.resolve(window.html2canvas);
    }

    if (this.html2canvasPromise) {
      return this.html2canvasPromise;
    }

    this.html2canvasPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
      script.async = true;
      script.onload = () => resolve(window.html2canvas);
      script.onerror = () => reject(new Error('Failed to load html2canvas'));
      document.head.appendChild(script);
    });

    return this.html2canvasPromise;
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  new ResultApp();
});
