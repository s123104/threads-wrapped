/**
 * zip-handler.js - ZIP 檔案解壓縮處理器
 * 使用 zip.js 函式庫，支援大檔案和手機環境
 */

// 需要解壓的檔案清單
const REQUIRED_FILES = [
  'threads_and_replies.json',
  'liked_threads.json',
  'followers.json',
  'following.json'
];

const OPTIONAL_FILES = ['archived_threads.json'];

export class ZipHandler {
  constructor(progressCallback) {
    this.progressCallback = progressCallback || (() => {});
  }

  /**
   * 檢查是否為 ZIP 檔案
   */
  static isZipFile(file) {
    return file.type === 'application/zip' ||
      file.type === 'application/x-zip-compressed' ||
      file.name.toLowerCase().endsWith('.zip');
  }

  /**
   * 解壓 ZIP 並提取需要的 JSON 檔案
   * @param {File} zipFile - ZIP 檔案
   * @returns {Promise<File[]>} - 模擬的 File 物件陣列
   */
  async extractThreadsFiles(zipFile) {
    this.progressCallback(5, '正在載入 ZIP 檔案...');

    // 動態載入 zip.js（避免未使用時載入）
    const zipLib = await this.loadZipJs();

    this.progressCallback(10, '正在讀取壓縮檔結構...');

    const reader = new zipLib.BlobReader(zipFile);
    const zipReader = new zipLib.ZipReader(reader);

    try {
      // 讀取所有檔案項目（只讀目錄，不解壓內容）
      const entries = await zipReader.getEntries();

      this.progressCallback(15, '正在搜尋 Threads 資料夾...');

      // 找到 threads 資料夾路徑
      const threadsPath = this.findThreadsPath(entries);
      if (!threadsPath) {
        throw new Error('ZIP 中找不到 Threads 資料。請確認上傳的是 Instagram 匯出的 ZIP 檔案。');
      }

      // 建立需要解壓的檔案對應
      const filesToExtract = this.findRequiredFiles(entries, threadsPath);

      // 逐一解壓需要的檔案
      const extractedFiles = [];
      const totalFiles = filesToExtract.length;

      for (let i = 0; i < totalFiles; i++) {
        const { entry, filename } = filesToExtract[i];
        const progress = 20 + Math.floor((i / totalFiles) * 60);
        this.progressCallback(progress, `正在解壓 ${filename}...`);

        // 解壓單一檔案為文字
        const content = await entry.getData(new zipLib.TextWriter());

        // 建立模擬的 File 物件
        const blob = new Blob([content], { type: 'application/json' });
        const file = new File([blob], filename, { type: 'application/json' });

        // 加入 webkitRelativePath 以相容現有 parser
        Object.defineProperty(file, 'webkitRelativePath', {
          value: entry.filename,
          writable: false
        });

        extractedFiles.push(file);
      }

      this.progressCallback(80, '解壓完成');
      return extractedFiles;

    } finally {
      await zipReader.close();
    }
  }

  /**
   * 動態載入 zip.js 函式庫
   */
  async loadZipJs() {
    if (window.zip) {
      return window.zip;
    }

    // 從 CDN 載入
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@zip.js/zip.js@2.7.52/dist/zip-full.min.js';
      script.onload = () => resolve(window.zip);
      script.onerror = () => reject(new Error('無法載入 ZIP 處理函式庫，請檢查網路連線。'));
      document.head.appendChild(script);
    });
  }

  /**
   * 從 ZIP entries 中找到 threads 資料夾路徑
   */
  findThreadsPath(entries) {
    for (const entry of entries) {
      // 標準 Instagram 匯出格式
      if (entry.filename.includes('your_instagram_activity/threads/')) {
        const idx = entry.filename.indexOf('your_instagram_activity/threads/');
        return entry.filename.substring(0, idx + 'your_instagram_activity/threads/'.length);
      }
      // 直接包含 threads 資料夾
      if (entry.filename.match(/^[^/]*threads\//i) && entry.filename.includes('threads_and_replies.json')) {
        const match = entry.filename.match(/^([^/]*threads\/)/i);
        if (match) return match[1];
      }
    }
    return null;
  }

  /**
   * 找出需要解壓的檔案
   */
  findRequiredFiles(entries, threadsPath) {
    const result = [];
    const allNeeded = [...REQUIRED_FILES, ...OPTIONAL_FILES];

    for (const entry of entries) {
      if (entry.directory) continue;

      for (const filename of allNeeded) {
        if (entry.filename.endsWith(filename) &&
          entry.filename.includes('threads/')) {
          result.push({ entry, filename });
          break;
        }
      }
    }

    // 檢查必要檔案
    const foundNames = result.map(r => r.filename);
    const missing = REQUIRED_FILES.filter(f => !foundNames.includes(f));

    if (missing.length > 0) {
      throw new Error(`ZIP 中找不到 ${missing.join(', ')}，請確認資料完整。`);
    }

    return result;
  }
}
