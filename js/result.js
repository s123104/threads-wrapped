/**
 * result.js - 結果頁面邏輯
 * 渲染統計資料、下載圖片、重新開始
 */

import { Renderer } from './renderer.js';

class ResultApp {
  constructor() {
    this.stats = null;
    this.renderer = null;
    this.wrappedContainer = document.getElementById('wrapped-container');
    this.downloadBtn = document.getElementById('download-btn');
    this.restartBtn = document.getElementById('restart-btn');

    this.init();
  }

  /**
   * 初始化
   */
  async init() {
    // 從 localStorage 讀取 stats
    const statsJson = localStorage.getItem('threadsStats');
    if (!statsJson) {
      alert('找不到統計資料，請重新上傳檔案');
      window.location.href = 'index.html';
      return;
    }

    this.stats = JSON.parse(statsJson);
    console.log('Stats loaded:', this.stats);

    // 渲染統計資料
    this.renderer = new Renderer(this.stats);
    await this.renderer.render();

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

    try {
      // 截圖前：啟用截圖模式，強制所有動畫元素可見
      this.wrappedContainer.classList.add('screenshot-mode');

      // 等待 DOM 更新
      await new Promise(r => setTimeout(r, 100));

      const canvas = await html2canvas(this.wrappedContainer, {
        scale: 2,
        backgroundColor: '#000000',
        useCORS: true
      });

      // 截圖後：移除截圖模式
      this.wrappedContainer.classList.remove('screenshot-mode');

      const link = document.createElement('a');
      link.download = `threads-wrapped-2025-${this.stats.username}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Download error:', error);
      // 確保移除截圖模式
      this.wrappedContainer.classList.remove('screenshot-mode');
      alert('下載失敗，請稍後再試');
    }
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
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  new ResultApp();
});
