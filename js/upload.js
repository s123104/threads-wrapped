/**
 * upload.js - 上傳頁面邏輯
 * 處理檔案上傳、解析、分析，完成後跳轉至故事流頁面
 */

import { Parser } from './parser.js';
import { Analyzer } from './analyzer.js';
import { ZipHandler } from './zip-handler.js';
import { modal } from './modal.js';

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
    this.zipInput = document.getElementById('zip-input');
    this.btnUploadZip = document.getElementById('btn-upload-zip');
    this.btnUploadFolder = document.getElementById('btn-upload-folder');
    this.loadingText = document.getElementById('loading-text');
    this.progressFill = document.getElementById('progress-fill');
    // 彈窗元素
    this.uploadModal = document.getElementById('upload-modal');
    this.modalBtnZip = document.getElementById('modal-btn-zip');
    this.modalBtnFolder = document.getElementById('modal-btn-folder');
  }

  /**
   * 初始化事件監聽
   */
  initEventListeners() {
    // ZIP 上傳按鈕
    this.btnUploadZip?.addEventListener('click', () => {
      this.zipInput.click();
    });

    // 資料夾上傳按鈕
    this.btnUploadFolder?.addEventListener('click', () => {
      this.folderInput.click();
    });

    // 點擊上傳區域顯示選擇彈窗
    this.dropZone.addEventListener('click', () => {
      this.showUploadModal();
    });

    // 彈窗 - 選擇 ZIP
    this.modalBtnZip?.addEventListener('click', () => {
      this.hideUploadModal();
      this.zipInput.click();
    });

    // 彈窗 - 選擇資料夾
    this.modalBtnFolder?.addEventListener('click', () => {
      this.hideUploadModal();
      this.folderInput.click();
    });

    // 點擊彈窗背景關閉
    this.uploadModal?.addEventListener('click', (e) => {
      if (e.target === this.uploadModal) {
        this.hideUploadModal();
      }
    });

    // ZIP 檔案選擇
    this.zipInput?.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.handleZipFile(e.target.files[0]);
      }
    });

    // 資料夾選擇
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
    // 先檢查是否為 ZIP 檔案
    for (let i = 0; i < items.length; i++) {
      const file = items[i].getAsFile?.();
      if (file && ZipHandler.isZipFile(file)) {
        return this.handleZipFile(file);
      }
    }

    // 否則使用原有資料夾處理邏輯
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
   * 處理 ZIP 檔案上傳
   */
  async handleZipFile(zipFile) {
    this.showPage('loading');
    this.updateProgress(0, '正在準備解壓縮...');

    try {
      const zipHandler = new ZipHandler((progress, text) => {
        this.updateProgress(progress, text);
      });

      // 解壓 ZIP 取得檔案
      const files = await zipHandler.extractThreadsFiles(zipFile);

      // 使用現有的 parseFiles 流程
      this.updateProgress(85, '正在解析 Threads 資料...');
      const data = await this.parser.parseFiles(files);

      // 分析資料
      this.updateProgress(90, '正在分析統計資料...');
      const analyzer = new Analyzer(data);
      const stats = analyzer.analyze();

      // 準備故事流數據
      this.updateProgress(95, '正在準備故事流...');
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
      console.error('ZIP Error:', error);
      modal.showError(`錯誤：${error.message}`);
      this.showPage('upload');
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
      modal.showError(`錯誤：${error.message}`);
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
   * 顯示上傳類型選擇彈窗
   */
  showUploadModal() {
    this.uploadModal?.classList.add('active');
  }

  /**
   * 隱藏上傳類型選擇彈窗
   */
  hideUploadModal() {
    this.uploadModal?.classList.remove('active');
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
