/**
 * upload.js - 上傳頁面邏輯
 * 處理檔案上傳、解析、分析，完成後跳轉至故事流頁面
 */

import { Parser } from './parser.js';
import { Analyzer } from './analyzer.js';

class UploadApp {
  constructor() {
    this.parser = new Parser();
    this.initElements();
    this.initEventListeners();
  }

  /**
   * 初始化 DOM 元素參照
   */
  initElements() {
    this.uploadPage = document.getElementById('upload-page');
    this.loadingPage = document.getElementById('loading-page');
    this.dropZone = document.getElementById('drop-zone');
    this.folderInput = document.getElementById('folder-input');
    this.loadingText = document.getElementById('loading-text');
    this.progressFill = document.getElementById('progress-fill');
  }

  /**
   * 初始化事件監聽
   */
  initEventListeners() {
    // 點擊上傳區域
    this.dropZone.addEventListener('click', () => {
      this.folderInput.click();
    });

    // 檔案選擇
    this.folderInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.handleFiles(e.target.files);
      }
    });

    // 拖曳事件
    this.dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.dropZone.classList.add('dragover');
    });

    this.dropZone.addEventListener('dragleave', () => {
      this.dropZone.classList.remove('dragover');
    });

    this.dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      this.dropZone.classList.remove('dragover');

      const items = e.dataTransfer.items;
      if (items) {
        this.handleDataTransferItems(items);
      }
    });
  }

  /**
   * 處理 DataTransfer items（拖曳）
   */
  async handleDataTransferItems(items) {
    const files = [];

    const readEntry = async (entry, path = '') => {
      if (entry.isFile) {
        return new Promise((resolve) => {
          entry.file((file) => {
            Object.defineProperty(file, 'webkitRelativePath', {
              value: path + file.name
            });
            files.push(file);
            resolve();
          });
        });
      } else if (entry.isDirectory) {
        const dirReader = entry.createReader();
        return new Promise((resolve) => {
          const readEntries = () => {
            dirReader.readEntries(async (entries) => {
              if (entries.length === 0) {
                resolve();
              } else {
                for (const e of entries) {
                  await readEntry(e, path + entry.name + '/');
                }
                readEntries();
              }
            });
          };
          readEntries();
        });
      }
    };

    for (let i = 0; i < items.length; i++) {
      const entry = items[i].webkitGetAsEntry();
      if (entry) {
        await readEntry(entry);
      }
    }

    if (files.length > 0) {
      this.handleFiles(files);
    }
  }

  /**
   * 處理檔案
   */
  async handleFiles(files) {
    this.showPage('loading');
    this.updateProgress(0, '正在讀取檔案...');

    try {
      // 解析檔案
      this.updateProgress(20, '正在解析 Threads 資料...');
      const data = await this.parser.parseFiles(files);

      // 分析資料
      this.updateProgress(50, '正在分析統計資料...');
      const analyzer = new Analyzer(data);
      const stats = analyzer.analyze();

      // 準備故事流數據
      this.updateProgress(80, '正在準備故事流...');
      const peakData = analyzer.getPeakFollowerMonth();

      // 擴充 stats 物件
      stats.firstPostDate = analyzer.getFirstPostDate();
      stats.mostActiveDayCount = analyzer.getMostActiveDayCount();
      stats.peakFollowerMonth = peakData.peakFollowerMonth;
      stats.peakFollowerGain = peakData.peakFollowerGain;

      this.updateProgress(100, '完成！');

      // 儲存資料到 localStorage
      localStorage.setItem('threadsStats', JSON.stringify(stats));

      // 延遲後跳轉到故事頁面
      await this.delay(500);
      window.location.href = 'story.html';

    } catch (error) {
      console.error('Error:', error);
      alert(`錯誤：${error.message}`);
      this.showPage('upload');
    }
  }

  /**
   * 更新進度
   */
  updateProgress(percent, text) {
    if (this.progressFill) {
      this.progressFill.style.width = `${percent}%`;
    }
    if (this.loadingText) {
      this.loadingText.textContent = text;
    }
  }

  /**
   * 切換頁面
   */
  showPage(page) {
    this.uploadPage.classList.remove('active');
    this.loadingPage.classList.remove('active');

    if (page === 'upload') {
      this.uploadPage.classList.add('active');
    } else if (page === 'loading') {
      this.loadingPage.classList.add('active');
    }
  }

  /**
   * 延遲函數
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  new UploadApp();
});
